import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, saveMessage } from "@/lib/supabase";
import { sendTextMessage } from "@/lib/whatsapp";

// POST /api/send
// Body: { clientId: string, message: string }

export async function POST(req: NextRequest) {
  let body: { clientId?: string; message?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { clientId, message } = body;

  if (!clientId || !message?.trim()) {
    return NextResponse.json(
      { error: "clientId and message are required" },
      { status: 400 },
    );
  }

  // Fetch the client to get their wa_id
  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("id, name, wa_id")
    .eq("id", clientId)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (!client.wa_id) {
    return NextResponse.json(
      {
        error: "Client has no WhatsApp ID yet — they need to message you first",
      },
      { status: 422 },
    );
  }

  try {
    // Send via WhatsApp Cloud API
    const waMsgId = await sendTextMessage(client.wa_id, message.trim());

    const now = new Date().toISOString();

    // Persist the outbound message
    const saved = await saveMessage(
      client.id,
      "out",
      message.trim(),
      waMsgId ?? undefined,
    );

    // Update last_message_at so the ClientRow shows the correct time
    await supabaseAdmin
      .from("clients")
      .update({ last_message_at: now })
      .eq("id", client.id);

    return NextResponse.json({ success: true, messageId: saved.id, waMsgId });
  } catch (err: any) {
    console.error("[/api/send] Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to send message" },
      { status: 500 },
    );
  }
}
