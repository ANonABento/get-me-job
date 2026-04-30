import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  setActivePromptVariant,
  updatePromptVariant,
  deletePromptVariant,
  getPromptVariantById,
} from "@/lib/db/prompt-variants";
import { z } from "zod";

const UpdatePromptVariantSchema = z.object({
  active: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  content: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = UpdatePromptVariantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!getPromptVariantById(id)) {
      return NextResponse.json({ error: "Prompt variant not found" }, { status: 404 });
    }

    if (parsed.data.active === true) {
      const ok = setActivePromptVariant(id);
      if (!ok) {
        return NextResponse.json({ error: "Failed to activate variant" }, { status: 500 });
      }
    }

    const { name, content } = parsed.data;
    if (name !== undefined || content !== undefined) {
      updatePromptVariant(id, { name, content });
    }

    const updated = getPromptVariantById(id);
    return NextResponse.json({ variant: updated });
  } catch (error) {
    console.error("Update prompt variant error:", error);
    return NextResponse.json(
      { error: "Failed to update prompt variant", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const variant = getPromptVariantById(id);
  if (!variant) {
    return NextResponse.json({ error: "Prompt variant not found" }, { status: 404 });
  }

  if (variant.active) {
    return NextResponse.json(
      { error: "Cannot delete the active prompt variant. Activate another variant first." },
      { status: 400 }
    );
  }

  const deleted = deletePromptVariant(id);
  if (!deleted) {
    return NextResponse.json({ error: "Failed to delete prompt variant" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
