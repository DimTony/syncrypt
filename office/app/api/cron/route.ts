import { NextResponse } from "next/server";
import { processUsers } from "@/workers/users";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  }

  try {
    await processUsers();

    return NextResponse.json({
      success: true,
      message: "Background job completed",
    });
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}