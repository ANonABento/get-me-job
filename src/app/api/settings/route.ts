import { NextRequest, NextResponse } from "next/server";
import { getLLMConfig, setLLMConfig } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import type { LLMConfig } from "@/types";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const llmConfig = getLLMConfig();
    return NextResponse.json({ llm: llmConfig });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const data = await request.json();

    if (data.llm) {
      setLLMConfig(data.llm as LLMConfig);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// Test LLM connection
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { llm } = await request.json() as { llm: LLMConfig };

    // Import dynamically to avoid issues
    const { LLMClient } = await import("@/lib/llm/client");
    const client = new LLMClient(llm);

    const response = await client.complete({
      messages: [
        { role: "user", content: "Say 'Connection successful!' and nothing else." },
      ],
      temperature: 0,
      maxTokens: 50,
    });

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("Test connection error:", error);
    return NextResponse.json(
      { error: "Connection failed", details: String(error) },
      { status: 400 }
    );
  }
}
