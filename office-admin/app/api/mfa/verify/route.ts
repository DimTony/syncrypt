import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { createMFASession } from "@/lib/mfa";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (
      typeof code !== "string" ||
      !/^\d{6}$/.test(code)
    ) {
      return NextResponse.json(
        { error: "Invalid MFA code" },
        { status: 400 }
      );
    }

    const secret = process.env.MFA_SECRET;

    if (!secret) {
      throw new Error("MFA_SECRET is not configured");
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Incorrect MFA code" },
        { status: 401 }
      );
    }

    await createMFASession();

    return NextResponse.json({
      success: true,
      message: "MFA verification successful",
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}