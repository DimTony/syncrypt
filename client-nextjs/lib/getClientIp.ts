import type { NextRequest } from "next/server";

/**
 * Resolve the caller's IP on the server. Vercel and most proxies set
 * x-forwarded-for; the first entry is the original client.
 * Returns null in local dev when no proxy header is present.
 */
export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip");
}
