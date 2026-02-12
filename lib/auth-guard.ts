import { NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "./auth";

export async function requireAuth(request: Request): Promise<NextResponse | null> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const valid = await verifyToken(token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  return null;
}
