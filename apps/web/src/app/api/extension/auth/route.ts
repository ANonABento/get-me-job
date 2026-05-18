import { nowEpoch, toIso } from "@/lib/format/time";
/**
 * @route POST /api/extension/auth
 * @route DELETE /api/extension/auth
 * @description Create a new extension session token (POST) or revoke an existing token (DELETE)
 * @auth requireAuth (NextAuth in prod, local-dev fallback when NextAuth env vars absent)
 * @response ExtensionAuthResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import db from "@/lib/db/legacy";
import {
  ensureExtensionSessionsColumns,
  EXTENSION_TOKEN_TTL_LOCALSTORAGE_MS,
  EXTENSION_TOKEN_TTL_RUNTIME_MS,
} from "@/lib/db/extension-sessions";
import { trackActivationEvent } from "@/lib/db/product-analytics";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// POST - Create extension session token
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const { userId } = authResult;

    const body = await request.json().catch(() => ({}));
    const { deviceInfo, userAgent, transport } = body as {
      deviceInfo?: string;
      userAgent?: string;
      transport?: "runtime" | "localstorage";
    };

    ensureExtensionSessionsColumns();

    // Generate a secure token
    const token = `${randomUUID()}-${randomUUID()}`;
    const ttlMs =
      transport === "localstorage"
        ? EXTENSION_TOKEN_TTL_LOCALSTORAGE_MS
        : EXTENSION_TOKEN_TTL_RUNTIME_MS;
    const expiresAt = new Date(nowEpoch() + ttlMs);

    const id = randomUUID();

    // Insert new session
    db.prepare(
      `
      INSERT INTO extension_sessions (id, user_id, token, device_info, device_user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(
      id,
      userId,
      token,
      deviceInfo || null,
      userAgent || null,
      toIso(expiresAt),
    );
    try {
      trackActivationEvent({
        event: "extension_connected",
        userId,
        source: "api/extension/auth",
        metadata: { transport: transport ?? "runtime" },
      });
    } catch (analyticsError) {
      console.error("Extension analytics failed:", analyticsError);
    }

    return NextResponse.json({
      token,
      expiresAt: toIso(expiresAt),
    });
  } catch (error) {
    console.error("Extension auth error:", error);
    return NextResponse.json(
      { error: "Failed to create extension session" },
      { status: 500 },
    );
  }
}

// DELETE - Revoke extension session
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const { userId } = authResult;

    const token = request.headers.get("X-Extension-Token");
    if (token) {
      // Revoke specific token
      db.prepare(
        `DELETE FROM extension_sessions WHERE token = ? AND user_id = ?`,
      ).run(token, userId);
    } else {
      // Revoke all tokens for user
      db.prepare(`DELETE FROM extension_sessions WHERE user_id = ?`).run(
        userId,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Extension revoke error:", error);
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 },
    );
  }
}
