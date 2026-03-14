import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  getClients,
  setFollowUpDate,
  addClientToSegment,
  removeClientFromSegment,
} from "@/lib/supabase";

// ─────────────────────────────────────────────
// GET /api/clients
// Query params:
//   ?segmentId=<uuid>   → filter by segment
//   ?id=<uuid>          → fetch single client with their segments + last messages
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const segmentId = searchParams.get("segmentId");
  const id = searchParams.get("id");

  // Single client detail view
  if (id) {
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select(
        `
        *,
        client_segments ( segment_id, segments ( id, name, color ) ),
        messages ( id, direction, body, status, created_at )
      `,
      )
      .eq("id", id)
      .order("created_at", { referencedTable: "messages", ascending: false })
      .limit(20, { referencedTable: "messages" })
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(client);
  }

  // List view
  try {
    const clients = await getClients(segmentId ?? undefined);
    return NextResponse.json(clients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// POST /api/clients — create a new client
// Body: { name, phone, segmentIds?, followup_date?, followup_note? }
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, segmentIds, followup_date, followup_note } = body;

  if (!name || !phone) {
    return NextResponse.json(
      { error: "name and phone are required" },
      { status: 400 },
    );
  }

  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .insert({
      name,
      phone,
      followup_date: followup_date ?? null,
      followup_note: followup_note ?? null,
    })
    .select()
    .single();

  if (error) {
    // Unique constraint on phone
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A client with this phone number already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Assign to segments
  if (Array.isArray(segmentIds) && segmentIds.length > 0) {
    for (const segId of segmentIds) {
      await addClientToSegment(client.id, segId);
    }
  }

  return NextResponse.json(client, { status: 201 });
}

// ─────────────────────────────────────────────
// PATCH /api/clients — update a client
// Body: { id, name?, followup_date?, followup_note?, addSegmentIds?, removeSegmentIds? }
// ─────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    name,
    followup_date,
    followup_note,
    addSegmentIds,
    removeSegmentIds,
  } = body;

  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Update scalar fields
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (followup_date !== undefined) updates.followup_date = followup_date;
  if (followup_note !== undefined) updates.followup_note = followup_note;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabaseAdmin
      .from("clients")
      .update(updates)
      .eq("id", id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Segment membership changes
  if (Array.isArray(addSegmentIds)) {
    for (const segId of addSegmentIds) await addClientToSegment(id, segId);
  }
  if (Array.isArray(removeSegmentIds)) {
    for (const segId of removeSegmentIds)
      await removeClientFromSegment(id, segId);
  }

  return NextResponse.json({ success: true });
}

// ─────────────────────────────────────────────
// DELETE /api/clients?id=<uuid>
// ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
