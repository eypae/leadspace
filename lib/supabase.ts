import { createClient } from "@supabase/supabase-js";
import { Client, Segment, Message, Broadcast } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client (uses anon key — safe to expose)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only admin client (bypasses Row Level Security)
// Only import this in API routes, never in client components
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────
// CLIENT helpers
// ─────────────────────────────────────────────

/** Fetch all clients, optionally filtered by segment */
export async function getClients(segmentId?: string): Promise<Client[]> {
  if (segmentId) {
    const { data, error } = await supabaseAdmin
      .from("client_segments")
      .select("client_id, clients(*)")
      .eq("segment_id", segmentId);

    if (error) throw error;
    return (data ?? []).map((row: any) => row.clients as Client);
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

/** Look up a client by their WhatsApp phone number (wa_id = digits only, no +) */
export async function getClientByWaId(waId: string): Promise<Client | null> {
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("wa_id", waId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Upsert a client from an incoming webhook message.
 *  Creates the record if it doesn't exist yet, updates wa_id + last_message_at otherwise.
 */
export async function upsertClientFromWebhook(
  waId: string,
  name: string,
): Promise<Client> {
  const phone = "+" + waId;

  const { data, error } = await supabaseAdmin
    .from("clients")
    .upsert(
      { phone, wa_id: waId, name, last_message_at: new Date().toISOString() },
      { onConflict: "phone" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update a client's follow-up date and note */
export async function setFollowUpDate(
  clientId: string,
  date: string,
  note?: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("clients")
    .update({ followup_date: date, followup_note: note ?? null })
    .eq("id", clientId);

  if (error) throw error;
}

/** Assign a client to a segment (no-op if already assigned) */
export async function addClientToSegment(
  clientId: string,
  segmentId: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("client_segments")
    .upsert({ client_id: clientId, segment_id: segmentId });

  if (error) throw error;
}

/** Remove a client from a segment */
export async function removeClientFromSegment(
  clientId: string,
  segmentId: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("client_segments")
    .delete()
    .eq("client_id", clientId)
    .eq("segment_id", segmentId);

  if (error) throw error;
}

// ─────────────────────────────────────────────
// SEGMENT helpers
// ─────────────────────────────────────────────

export async function getSegments(): Promise<Segment[]> {
  const { data, error } = await supabaseAdmin
    .from("segments")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function createSegment(
  name: string,
  color?: string,
  description?: string,
): Promise<Segment> {
  const { data, error } = await supabaseAdmin
    .from("segments")
    .insert({ name, color, description })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
// MESSAGE helpers
// ─────────────────────────────────────────────

/** Store an inbound or outbound message */
export async function saveMessage(
  clientId: string,
  direction: "in" | "out",
  body: string,
  waMsgId?: string,
): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      client_id: clientId,
      direction,
      body,
      wa_msg_id: waMsgId ?? null,
      status: direction === "out" ? "sent" : "delivered",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetch the last N messages for a client (newest last) */
export async function getMessages(
  clientId: string,
  limit = 50,
): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Update message delivery status from a WhatsApp status webhook */
export async function updateMessageStatus(
  waMsgId: string,
  status: "sent" | "delivered" | "read" | "failed",
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("messages")
    .update({ status })
    .eq("wa_msg_id", waMsgId);

  if (error) throw error;
}

// ─────────────────────────────────────────────
// FOLLOW-UP helpers
// ─────────────────────────────────────────────

/** Return all clients whose follow-up date is today or in the past */
export async function getOverdueFollowUps(): Promise<Client[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .lte("followup_date", today)
    .not("followup_date", "is", null)
    .order("followup_date");

  if (error) throw error;
  return data ?? [];
}

/** Return all clients whose follow-up date falls within the next N days */
export async function getUpcomingFollowUps(daysAhead = 7): Promise<Client[]> {
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + daysAhead);

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .gte("followup_date", today.toISOString().split("T")[0])
    .lte("followup_date", future.toISOString().split("T")[0])
    .order("followup_date");

  if (error) throw error;
  return data ?? [];
}

// ─────────────────────────────────────────────
// BROADCAST helpers
// ─────────────────────────────────────────────

export async function saveBroadcast(
  segmentId: string,
  templateName: string,
  body: string,
  sentCount: number,
): Promise<Broadcast> {
  const { data, error } = await supabaseAdmin
    .from("broadcasts")
    .insert({
      segment_id: segmentId,
      template_name: templateName,
      body,
      sent_count: sentCount,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
