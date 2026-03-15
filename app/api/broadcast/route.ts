import { NextRequest, NextResponse } from "next/server";
import { getClients, saveBroadcast } from "@/lib/supabase";
import { broadcastTemplate, bodyParams } from "@/lib/whatsapp";

// POST /api/broadcast
// Body: { segmentId, message, templateName? }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { segmentId, message, templateName = "hello_world" } = body;

  if (!segmentId || !message?.trim()) {
    return NextResponse.json(
      { error: "segmentId and message are required" },
      { status: 400 },
    );
  }

  // Fetch clients in this segment
  const clients = await getClients(segmentId);
  const waIds = clients.map((c) => c.wa_id).filter(Boolean) as string[];

  if (waIds.length === 0) {
    return NextResponse.json(
      { error: "No clients in this segment have a WhatsApp ID yet" },
      { status: 422 },
    );
  }

  // Name lookup for personalisation: {{ 1 }} = client name
  const nameMap = Object.fromEntries(
    clients.filter((c) => c.wa_id).map((c) => [c.wa_id!, c.name]),
  );

  const { sent, failed, failedIds } = await broadcastTemplate(
    waIds,
    templateName,
    (waId) => [bodyParams(nameMap[waId] ?? "there")],
  );

  // Log the broadcast
  await saveBroadcast(segmentId, templateName, message.trim(), sent);

  return NextResponse.json({ sent, failed, failedIds });
}
