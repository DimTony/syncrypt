import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visit from "@/models/Visit";
import { headers } from "next/headers";

interface VisitRequestBody {
  page?: string;
  referrer?: string;
}

interface IPWhoIsResponse {
  success: boolean;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: {
    id?: string;
  };
  connection?: {
    isp?: string;
  };
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body: VisitRequestBody = await request.json();
    const headersList = await headers();

    // Get visitor IP
    const forwardedFor = headersList.get("x-forwarded-for");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "";

    // Get approximate location
    let location: {
      country?: string;
      countryCode?: string;
      region?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
      isp?: string;
    } = {};

    if (
      ipAddress &&
      ipAddress !== "127.0.0.1" &&
      ipAddress !== "::1"
    ) {
      try {
        const response = await fetch(
          `https://ipwho.is/${encodeURIComponent(ipAddress)}`,
          { signal: AbortSignal.timeout(4000) }
        );

        const data: IPWhoIsResponse = await response.json();

        if (data.success) {
          location = {
            country: data.country,
            countryCode: data.country_code,
            region: data.region,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone?.id,
            isp: data.connection?.isp,
          };
        }
      } catch (error: unknown) {
        console.error("Location lookup failed:", error);
      }
    }

    // Save visit
    const visit = await Visit.create({
      page: body.page || "/",
      userAgent: headersList.get("user-agent") || "",
      referrer: body.referrer || "",
      ipAddress,
      location,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Visit recorded",
        id: visit._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Visit tracking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not record visit",
      },
      { status: 500 }
    );
  }
}