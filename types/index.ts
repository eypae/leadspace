export type Direction = 'in' | 'out'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface Client {
  id: string
  name: string
  phone: string
  wa_id: string | null
  followup_date: string | null
  followup_note: string | null
  last_message_at: string | null
  created_at: string
}

export interface Segment {
  id: string
  name: string
  color: string | null
  description: string | null
  created_at: string
}

export interface ClientSegment {
  client_id: string
  segment_id: string
}

export interface Message {
  id: string
  client_id: string
  direction: Direction
  body: string
  wa_msg_id: string | null
  status: MessageStatus
  created_at: string
}

export interface Broadcast {
  id: string
  segment_id: string
  template_name: string
  body: string
  sent_count: number
  sent_at: string
}

// WhatsApp Cloud API webhook payload types
export interface WAWebhookPayload {
  object: string
  entry: WAEntry[]
}

export interface WAEntry {
  id: string
  changes: WAChange[]
}

export interface WAChange {
  value: WAChangeValue
  field: string
}

export interface WAChangeValue {
  messaging_product: string
  metadata: { display_phone_number: string; phone_number_id: string }
  contacts?: WAContact[]
  messages?: WAMessage[]
  statuses?: WAStatus[]
}

export interface WAContact {
  profile: { name: string }
  wa_id: string
}

export interface WAMessage {
  from: string
  id: string
  timestamp: string
  type: 'text' | 'image' | 'document' | 'audio' | 'video'
  text?: { body: string }
}

export interface WAStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipient_id: string
}