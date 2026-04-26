// Extension authentication utilities
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/schema";

interface ExtensionSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
}

export type ExtensionAuthResult =
  | { success: true; userId: string }
  | { success: false; response: NextResponse };

/**
 * Validate extension token and return user ID
 */
export function requireExtensionAuth(request: NextRequest): ExtensionAuthResult {
  const token = request.headers.get("X-Extension-Token");

  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: "No token provided" }, { status: 401 }),
    };
  }

  try {
    const session = db.prepare(`
      SELECT * FROM extension_sessions WHERE token = ?
    `).get(token) as ExtensionSession | undefined;

    if (!session) {
      return {
        success: false,
        response: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
      };
    }

    // Check expiry
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      db.prepare(`DELETE FROM extension_sessions WHERE id = ? AND user_id = ?`).run(session.id, session.user_id);
      return {
        success: false,
        response: NextResponse.json({ error: "Token expired" }, { status: 401 }),
      };
    }

    // Update last used
    db.prepare(`
      UPDATE extension_sessions SET last_used_at = ? WHERE id = ? AND user_id = ?
    `).run(new Date().toISOString(), session.id, session.user_id);

    return {
      success: true,
      userId: session.user_id,
    };
  } catch (error) {
    console.error("Extension auth error:", error);
    return {
      success: false,
      response: NextResponse.json({ error: "Authentication failed" }, { status: 500 }),
    };
  }
}

/**
 * Normalize question text for similarity matching
 */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate Jaccard similarity between two strings
 */
export function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(" "));
  const wordsB = new Set(b.split(" "));
  const intersection = Array.from(wordsA).filter((w) => wordsB.has(w)).length;
  const union = new Set([...Array.from(wordsA), ...Array.from(wordsB)]).size;
  return union > 0 ? intersection / union : 0;
}
