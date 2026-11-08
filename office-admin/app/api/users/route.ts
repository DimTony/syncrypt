import { NextRequest, NextResponse } from "next/server";
import { isMFAAuthorized } from "@/lib/mfa";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    // Never query the database before authorization.
    if (!(await isMFAAuthorized())) {
      return NextResponse.json(
        { error: "MFA verification required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10),
    );

    await connectDB();

    const total = await User.countDocuments();

    const records = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch records" },
      { status: 500 },
    );
  }
}
