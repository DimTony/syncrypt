import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp } from "@/lib/getClientIp";
import {
  ENCRYPTION_ACTIONS,
  type EncryptionAction,
} from "@/models/EncryptionLog";
import EncryptionLog from "@/models/EncryptionLog";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

interface RecordEncryptionBody {
  key?: unknown;
  action?: unknown;
}

const isAction = (value: unknown): value is EncryptionAction =>
  typeof value === "string" &&
  (ENCRYPTION_ACTIONS as readonly string[]).includes(value);

export async function POST(req: NextRequest) {
  let body: RecordEncryptionBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key) {
    return NextResponse.json({ error: "Missing cipher key" }, { status: 400 });
  }
  if (!isAction(body.action)) {
    return NextResponse.json(
      { error: `action must be one of: ${ENCRYPTION_ACTIONS.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    const ip = getClientIp(req);

    if (!ip) {
      return NextResponse.json({ error: "IP not found" }, { status: 400 });
    }

    await EncryptionLog.create({
      ip,
      key,
      action: body.action,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("record-encryption failed:", error);
    return NextResponse.json(
      { error: "Failed to record encryption activity" },
      { status: 500 },
    );
  }
}
