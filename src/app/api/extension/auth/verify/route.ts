/**
 * @route GET /api/extension/auth/verify
 * @description Verify an extension authentication token
 * @auth Token header
 * @response ExtensionAuthVerifyResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface ExtensionSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  last_used_at: string | null;
}

// GET - Verify extension token
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("X-Extension-Token");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Find session by token
    const session = db.prepare(`
      SELECT * FROM extension_sessions WHERE token = ?
    `).get(token) as ExtensionSession | undefined;

    if (!session) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check expiry
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired session
      db.prepare(`DELETE FROM extension_sessions WHERE id = ? AND user_id = ?`).run(session.id, session.user_id);
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // Update last used timestamp
    db.prepare(`
      UPDATE extension_sessions SET last_used_at = ? WHERE id = ? AND user_id = ?
    `).run(new Date().toISOString(), session.id, session.user_id);

    return NextResponse.json({
      valid: true,
      userId: session.user_id,
      expiresAt: session.expires_at,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
