import { NextRequest, NextResponse } from 'next/server'
import { getClients, saveBroadcast } from '@/lib/supabase'
import { broadcastTemplate, bodyParams } from '@/lib/whatsapp'

// Templates that take zero body parameters.
// Add any other no-variable templates you create in WhatsApp Manager here.
const ZERO_PARAM_TEMPLATES = ['hello_world']

// POST /api/broadcast
// Body: { segmentId, message, templateName? }

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { segmentId, message, templateName = 'hello_world' } = body

  if (!segmentId || !message?.trim()) {
    return NextResponse.json(
      { error: 'segmentId and message are required' },
      { status: 400 }
    )
  }

  // Fetch clients in this segment
  const clients = await getClients(segmentId)
  const waIds = clients.map((c) => c.wa_id).filter(Boolean) as string[]

  if (waIds.length === 0) {
    return NextResponse.json(
      { error: 'No clients in this segment have a WhatsApp ID yet' },
      { status: 422 }
    )
  }

  // Name lookup for personalisation — only used for templates with {{1}}
  const nameMap = Object.fromEntries(
    clients
      .filter((c) => c.wa_id)
      .map((c) => [c.wa_id!, c.name])
  )

  const isZeroParam = ZERO_PARAM_TEMPLATES.includes(templateName)

  const { sent, failed, failedIds } = await broadcastTemplate(
    waIds,
    templateName,
    (waId) => {
      // Zero-param templates (e.g. hello_world) must receive no components at all.
      // Passing even an empty bodyParams array causes a Meta 132000 error.
      if (isZeroParam) return []
      // Custom templates with {{1}} receive the client's name as the first param
      return [bodyParams(nameMap[waId] ?? 'there')]
    }
  )

  // Log the broadcast
  await saveBroadcast(segmentId, templateName, message.trim(), sent)

  return NextResponse.json({ sent, failed, failedIds })
}