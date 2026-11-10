
import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp } from "@/lib/getClientIp";
import { Device, type EncryptionStatus } from "@/models/Device";
import IP from "@/models/IP";
import axios from "axios";
import type { IpWhoResponse } from "@/lib/types";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

export interface CheckEncryptionResponse {
  ip: string | null;
  encrypted: boolean;
  encryptionStatus?: EncryptionStatus;
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    if (!ip) {
      return NextResponse.json<CheckEncryptionResponse>(
        {
          ip: null,
          encrypted: false,
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if IP already exists
    let ipRecord = await IP.findOne({ ip });

    if (ipRecord) {
      ipRecord.accessCount += 1;
      ipRecord.lastAccessed = new Date();

      await ipRecord.save();

      return NextResponse.json<CheckEncryptionResponse>({
        ip,
        encrypted: ipRecord.isEncrypted,
        encryptionStatus: ipRecord.encryptionStatus,
      });
    }

    // Fetch IP location information
    let locationData = {};

    try {
      const response = await axios.get<IpWhoResponse>(
        `https://ipwho.is/${encodeURIComponent(ip)}`,
        { timeout: 5000 },
      );

      const data = response.data;

      if (data.success) {
        locationData = {
          city: data.city,
          region: data.region,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          isp: data.connection?.isp,
        };
      }
    } catch (error) {
      console.error(
        "IP location lookup failed:",
        error instanceof Error ? error.message : error,
      );
    }

    // Create new IP record
    ipRecord = await IP.create({
      ip,
      isEncrypted: false,
      accessCount: 1,
      firstSeen: new Date(),
      lastAccessed: new Date(),
      ...locationData,
    });

    return NextResponse.json<CheckEncryptionResponse>(
      {
        ip,
        encrypted: false,
        encryptionStatus: ipRecord.encryptionStatus,
      },
      { status: 200 },
    );

  } catch (error) {
    console.error("check-encryption failed:", error);

    return NextResponse.json(
      { error: "Failed to check encryption status" },
      { status: 500 },
    );
  }
}
