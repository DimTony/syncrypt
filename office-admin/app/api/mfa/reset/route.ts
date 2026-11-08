import { NextResponse } from "next/server";
import { clearMFASession } from "@/lib/mfa";

export async function POST() {
  try {
    await clearMFASession();

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reset MFA session" },
      { status: 500 }
    );
  }
}