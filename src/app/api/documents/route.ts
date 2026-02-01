import { NextResponse } from "next/server";
import { getDocuments } from "@/lib/db";

export async function GET() {
  try {
    const documents = getDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}
