import { NextRequest, NextResponse } from "next/server";
import { getSegments, createSegment } from "@/lib/supabase";

// GET /api/segments
export async function GET() {
  try {
    const segments = await getSegments();
    return NextResponse.json(segments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/segments
// Body: { name, color?, description? }
export async function POST(req: NextRequest) {
  const { name, color, description } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const segment = await createSegment(name, color, description);
    return NextResponse.json(segment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
