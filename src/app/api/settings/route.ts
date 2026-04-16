/**
 * @route GET /api/settings
 * @route PUT /api/settings
 * @route POST /api/settings
 * @description Fetch LLM settings (GET), update settings (PUT), or test LLM connection (POST)
 * @auth Required
 * @request { provider: string, model: string, ...config } (PUT) | { provider: string, ...config } (POST)
 * @response SettingsResponse | SettingsUpdateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getLLMConfig, setLLMConfig } from "@/lib/db";
import { updateSettingsSchema, llmConfigSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

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
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = updateSettingsSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    if (data.llm) {
      setLLMConfig(data.llm);
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
    const rawData = await request.json();

    // Validate LLM config
    const parseResult = llmConfigSchema.safeParse(rawData.llm);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Invalid LLM configuration", errors },
        { status: 400 }
      );
    }

    const llm = parseResult.data;

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
      { error: "Connection failed. Check your API key and settings." },
      { status: 400 }
    );
  }
}
