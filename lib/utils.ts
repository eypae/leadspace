// Avatar colour palettes — warm neutrals + brand-adjacent tones
const AVATAR_PALETTES = [
  { bg: '#fde8d3', text: '#9a3412' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#dcfce7', text: '#166534' },
  { bg: '#f3e8ff', text: '#6b21a8' },
  { bg: '#fef9c3', text: '#854d0e' },
  { bg: '#ffe4e6', text: '#9f1239' },
  { bg: '#e0f2fe', text: '#075985' },
  { bg: '#f0fdf4', text: '#14532d' },
]

export function getAvatarPalette(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Segment colour map — matches seed data
const SEGMENT_COLOURS: Record<string, string> = {
  Offices:      '#2563eb',
  Condominiums: '#059669',
  Bungalows:    '#dc2626',
  HDB:          '#7c3aed',
}

export function getSegmentColor(name: string): string {
  return SEGMENT_COLOURS[name] ?? '#64748b'
}

// Follow-up status helpers
export type FollowUpStatus = 'overdue' | 'today' | 'soon' | 'upcoming' | null

export function getFollowUpStatus(dateStr: string | null): FollowUpStatus {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000)

  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'upcoming'
}

export function formatFollowUpDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

export function formatChatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
  })
}