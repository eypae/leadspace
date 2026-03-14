import { NextRequest, NextResponse } from "next/server";
import type { WAWebhookPayload } from "@/types";
import {
  upsertClientFromWebhook,
  saveMessage,
  updateMessageStatus,
} from "@/lib/supabase";
import { verifyWebhook, markAsRead } from "@/lib/whatsapp";

// ─────────────────────────────────────────────
// GET — Meta webhook verification handshake
// Meta calls this once when you register your webhook URL.
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const { valid, challenge: responseChallenge } = verifyWebhook(
    mode,
    token,
    challenge,
  );

  if (valid && responseChallenge) {
    console.log("[webhook] Verification successful");
    return new NextResponse(responseChallenge, { status: 200 });
  }

  console.warn("[webhook] Verification failed — check WHATSAPP_VERIFY_TOKEN");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ─────────────────────────────────────────────
// POST — incoming messages and status updates
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let payload: WAWebhookPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Confirm this is a WhatsApp Business payload
  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" });
  }

  // Process each entry (Meta sometimes batches multiple events)
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      // ── Incoming message ──────────────────────────────────
      if (value.messages?.length) {
        for (const msg of value.messages) {
          // Only handle text messages for now (you can extend for images/docs)
          if (msg.type !== "text" || !msg.text?.body) continue;

          const waId = msg.from;
          const body = msg.text.body;

          // Get the sender's display name from the contacts array if available
          const contactName =
            value.contacts?.find((c) => c.wa_id === waId)?.profile.name ??
            "Unknown";

          try {
            // 1. Create or update the client record
            const client = await upsertClientFromWebhook(waId, contactName);

            // 2. Persist the message
            await saveMessage(client.id, "in", body, msg.id);

            // 3. Mark as read so the client sees blue ticks
            await markAsRead(msg.id);

            console.log(
              `[webhook] Message from ${contactName} (${waId}): "${body}"`,
            );
          } catch (err) {
            // Log but don't crash — Meta expects a 200 even on partial failures
            console.error("[webhook] Error processing message:", err);
          }
        }
      }

      // ── Delivery / read status updates ────────────────────
      if (value.statuses?.length) {
        for (const status of value.statuses) {
          try {
            await updateMessageStatus(status.id, status.status);
            console.log(
              `[webhook] Status update: msg ${status.id} → ${status.status}`,
            );
          } catch (err) {
            console.error("[webhook] Error updating status:", err);
          }
        }
      }
    }
  }

  // Always return 200 — Meta will retry if you return anything else
  return NextResponse.json({ status: "ok" });
}
