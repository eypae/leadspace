/**
 * WhatsApp Cloud API helpers
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const BASE_URL = 'https://graph.facebook.com/v22.0'
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!

// ---------------------------------------------
// Core fetch wrapper
// ---------------------------------------------

async function waFetch(
  path: string,
  body: Record<string, unknown>
): Promise<{ wa_id: string; id: string } | null> {
  const res = await fetch(`${BASE_URL}/${PHONE_NUMBER_ID}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (!res.ok) {
    console.error('[WhatsApp API error]', json)
    throw new Error(json?.error?.message ?? 'WhatsApp API request failed')
  }

  // Return the first message info from the response
  return json?.messages?.[0] ?? null
}

// ---------------------------------------------
// Send a plain text message to a client
//
// IMPORTANT: WhatsApp only allows free-form text if the client
// has messaged YOU within the last 24 hours (the "service window").
// Outside that window you MUST use sendTemplateMessage instead.
// During development with Meta's test number, always use
// sendTemplateMessage with "hello_world" for first contact.
// ---------------------------------------------

export async function sendTextMessage(
  toWaId: string,
  text: string
): Promise<string | null> {
  const result = await waFetch('/messages', {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toWaId,
    type: 'text',
    text: { body: text },
  })
  return result?.id ?? null
}

// ---------------------------------------------
// Send an approved template message
//
// Use this for:
//   - First contact / opening a conversation
//   - Broadcasts to a segment
//   - Follow-up reminders
//   - Any message outside the 24-hour service window
//
// The template must exist and be approved in WhatsApp Manager.
// Meta provides one pre-approved template out of the box: "hello_world"
// Use that for testing before you create your own templates.
//
// Usage examples:
//   // hello_world (no components needed — just a greeting)
//   sendTemplateMessage('6598228852', 'hello_world', 'en_US')
//
//   // Custom template with body variables
//   sendTemplateMessage('6598228852', 'new_listing_alert', 'en_US', [
//     bodyParams('James', 'Raffles Place office')
//   ])
// ---------------------------------------------

export async function sendTemplateMessage(
  toWaId: string,
  templateName: string,
  languageCode: string = 'en_US',
  components: TemplateComponent[] = []
): Promise<string | null> {
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: toWaId,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  }

  // Only include components if provided — hello_world needs none
  if (components.length > 0) {
    (payload.template as Record<string, unknown>).components = components
  }

  const result = await waFetch('/messages', payload)
  return result?.id ?? null
}

// ---------------------------------------------
// Template component builder helpers
// ---------------------------------------------

export interface TemplateComponent {
  type: 'header' | 'body' | 'button'
  sub_type?: 'quick_reply' | 'url'
  index?: number
  parameters: TemplateParameter[]
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document'
  text?: string
}

/** Build body parameters for a template.
 *
 *  Example template body: "Hi {{1}}, we have a new {{2}} listing for you!"
 *  Usage: bodyParams('James', 'office') fills {{1}} and {{2}}
 */
export function bodyParams(...values: string[]): TemplateComponent {
  return {
    type: 'body',
    parameters: values.map((text) => ({ type: 'text', text })),
  }
}

// ---------------------------------------------
// Broadcast to a list of wa_ids
// Sends template messages sequentially with a small delay to avoid rate limits.
// Returns counts of successful and failed sends.
// ---------------------------------------------

export async function broadcastTemplate(
  waIds: string[],
  templateName: string,
  buildComponents: (waId: string) => TemplateComponent[],
  languageCode = 'en_US'
): Promise<{ sent: number; failed: number; failedIds: string[] }> {
  let sent = 0
  let failed = 0
  const failedIds: string[] = []

  for (const waId of waIds) {
    try {
      await sendTemplateMessage(waId, templateName, languageCode, buildComponents(waId))
      sent++
    } catch (err) {
      console.error(`[broadcast] Failed to send to ${waId}:`, err)
      failed++
      failedIds.push(waId)
    }

    // Respect WhatsApp rate limit: 80 messages/second on Cloud API.
    // A 50ms delay between sends keeps us safely under.
    await delay(50)
  }

  return { sent, failed, failedIds }
}

// ---------------------------------------------
// Mark a message as read (shows blue ticks to client)
// ---------------------------------------------

export async function markAsRead(waMsgId: string): Promise<void> {
  await waFetch('/messages', {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: waMsgId,
  })
}

// ---------------------------------------------
// Verify a webhook GET request from Meta
// Meta sends a challenge to confirm your endpoint is real.
// ---------------------------------------------

export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): { valid: boolean; challenge: string | null } {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return { valid: true, challenge }
  }
  return { valid: false, challenge: null }
}

// ---------------------------------------------
// Utility
// ---------------------------------------------

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}