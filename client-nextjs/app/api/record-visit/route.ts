
import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp } from "@/lib/getClientIp";
import IP from "@/models/IP";
import axios from "axios";
import { IpWhoResponse } from "@/lib/types";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
}



export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const ip = getClientIp(req);

    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP not found" },
        { status: 400 }
      );
    }

    let locationData: LocationData = {};

    // Fetch visitor location information
    try {
      const response = await axios.get<IpWhoResponse>(
        `https://ipwho.is/${encodeURIComponent(ip)}`,
        { timeout: 5000 }
      );

      if (response.data.success) {
        locationData = {
          city: response.data.city,
          region: response.data.region,
          country: response.data.country,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          isp: response.data.connection?.isp,
        };
      }
    } catch (error) {
      console.error(
        "Location lookup failed:",
        error instanceof Error ? error.message : error
      );
    }

    // Check if visitor already exists
    const existingVisit = await IP.findOne({ ip });

    if (existingVisit) {
      existingVisit.accessCount += 1;
      existingVisit.lastAccessed = new Date();

      // Update location information only when available
      Object.assign(existingVisit, locationData);

      await existingVisit.save();

      return NextResponse.json(
        { success: true, message: "Visit updated" },
        { status: 200 }
      );
    }

    // Create new visitor record
    await IP.create({
      ip,
      isEncrypted: false,
      accessCount: 1,
      firstSeen: new Date(),
      lastAccessed: new Date(),
      ...locationData,
    });

    return NextResponse.json(
      { success: true, message: "Visit recorded" },
      { status: 201 }
    );

  } catch (error) {
    console.error("record-visit failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to record visit",
      },
      { status: 500 }
    );
  }
}
