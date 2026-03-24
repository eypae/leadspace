import { NextRequest, NextResponse } from "next/server";
import { getClients, saveBroadcast, saveMessage } from "@/lib/supabase";
import { broadcastTemplate, bodyParams } from "@/lib/whatsapp";
import type { TemplateComponent } from "@/lib/whatsapp";

const ZERO_PARAM_TEMPLATES = ["hello_world"];

const TEMPLATE_LANGUAGE: Record<string, string> = {
  hello_world: "en_US",
  broadcast_new_listing: "en",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    segmentId,
    templateName = "hello_world",
    templateVars = {} as Record<string, string>,
  } = body;

  if (!segmentId) {
    return NextResponse.json(
      { error: "segmentId is required" },
      { status: 400 },
    );
  }

  if (templateName === "broadcast_new_listing") {
    const required = ["property_name", "property_type", "listing_id"];
    const missing = required.filter((k) => !templateVars[k]?.trim());
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }
  }

  const clients = await getClients(segmentId);
  const eligibleClients = clients.filter((c) => c.wa_id);
  const waIds = eligibleClients.map((c) => c.wa_id!);

  if (waIds.length === 0) {
    return NextResponse.json(
      { error: "No clients in this segment have a WhatsApp ID yet" },
      { status: 422 },
    );
  }

  const nameMap = Object.fromEntries(eligibleClients.map((c) => [c.wa_id!, c]));
  const isZeroParam = ZERO_PARAM_TEMPLATES.includes(templateName);
  const languageCode = TEMPLATE_LANGUAGE[templateName] ?? "en";

  // Build a human-readable summary of the broadcast for logging
  const broadcastBody =
    templateName === "broadcast_new_listing"
      ? `New Listing: ${templateVars["property_name"]} (${templateVars["property_type"]}) — https://www.propertyguru.com.sg/listing/${templateVars["listing_id"]}`
      : templateName;

  const { sent, failed, failedIds } = await broadcastTemplate(
    waIds,
    templateName,
    (waId): TemplateComponent[] => {
      if (isZeroParam) return [];

      if (templateName === "broadcast_new_listing") {
        const clientName = nameMap[waId]?.name ?? "there";
        return [
          {
            type: "header",
            parameters: [
              {
                type: "text",
                parameter_name: "property_name",
                text: templateVars["property_name"],
              },
            ],
          },
          {
            type: "body",
            parameters: [
              { type: "text", parameter_name: "name", text: clientName },
              {
                type: "text",
                parameter_name: "property_type",
                text: templateVars["property_type"],
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [{ type: "text", text: templateVars["listing_id"] }],
          },
        ];
      }

      return [bodyParams(nameMap[waId]?.name ?? "there")];
    },
    languageCode,
  );

  // Save a message record per client that was successfully reached
  // is_template=true so ClientDetail can show these in the chat
  for (const client of eligibleClients) {
    if (failedIds.includes(client.wa_id!)) continue;
    await saveMessage(
      client.id,
      "out",
      broadcastBody,
      undefined,
      true, // is_template
    );
  }

  await saveBroadcast(segmentId, templateName, broadcastBody, sent);

  return NextResponse.json({ sent, failed, failedIds });
}
