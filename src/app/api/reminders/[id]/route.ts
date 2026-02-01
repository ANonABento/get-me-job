import { NextRequest, NextResponse } from "next/server";
import {
  updateReminder,
  completeReminder,
  dismissReminder,
  deleteReminder,
} from "@/lib/db/reminders";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, ...updates } = body;

    switch (action) {
      case "complete":
        completeReminder(id);
        return NextResponse.json({ success: true, action: "completed" });

      case "dismiss":
        dismissReminder(id);
        return NextResponse.json({ success: true, action: "dismissed" });

      default:
        // Update reminder fields
        updateReminder(id, updates);
        return NextResponse.json({ success: true, action: "updated" });
    }
  } catch (error) {
    console.error("Update reminder error:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    deleteReminder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reminder error:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
