import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp } from "@/lib/getClientIp";
import { Device, type EncryptionStatus } from "@/models/Device";
import IP from "@/models/IP";
import axios from "axios";
import { IpWhoResponse } from "@/lib/types";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

export interface CheckEncryptionResponse {
  ip: string | null;
  encrypted: boolean;
  encryptionStatus?: EncryptionStatus;
}

// The IP is read from request headers rather than the request body, so a
// client can't claim another device's verified IP.
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);

  if (!ip) {
    return NextResponse.json<CheckEncryptionResponse>({
      ip: null,
      encrypted: false,
    });
  }

  try {
    await connectDB();

    let ipRecord = await IP.findOne({ ip });

    if (ipRecord) {
      // Update the access count and last accessed time
      ipRecord.accessCount += 1;
      ipRecord.lastAccessed = Date.now();
      await ipRecord.save();

      return NextResponse.json<CheckEncryptionResponse>({
        ip,
        encrypted: ipRecord.isEncrypted,
        encryptionStatus: ipRecord.encryptionStatus,
      });
    }

    const response = await axios.get<IpWhoResponse>(
      `https://ipwho.is/${encodeURIComponent(ip)}`,
      { timeout: 5000 },
    );
    const data = response.data;

    if (data.success === false) {
      return null;
    }

    ipRecord = new IP({
      ip,
      isEncrypted: false, // Default to false for new IPs
      city: data?.city,
      region: data?.region,
      country: data?.country,
      latitude: data?.latitude,
      longitude: data?.longitude,
      isp: data?.connection?.isp,
    });

    await ipRecord.save();


    return NextResponse.json<CheckEncryptionResponse>({
      ip,
      encrypted: false,
      encryptionStatus: "pending",
    });
  } catch (error) {
    console.error("check-encryption failed:", error);
    return NextResponse.json(
      { error: "Failed to check encryption status" },
      { status: 500 },
    );
  }
}
