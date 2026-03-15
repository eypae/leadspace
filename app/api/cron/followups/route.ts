import { NextRequest, NextResponse } from 'next/server'
import { getOverdueFollowUps, getUpcomingFollowUps } from '@/lib/supabase'
import { sendTextMessage } from '@/lib/whatsapp'
import { formatFollowUpDate } from '@/lib/utils'

// GET /api/cron/followups
// Triggered daily at 9am SGT (1am UTC) via vercel.json cron.
// Sends a WhatsApp summary to your own number listing overdue
// and upcoming follow-ups.

const YOUR_WA_ID = process.env.AGENT_WA_ID! // digits only, e.g. 6591234567

export async function GET(req: NextRequest) {
  // Vercel attaches this header automatically for cron invocations
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [overdue, upcoming] = await Promise.all([
    getOverdueFollowUps(),
    getUpcomingFollowUps(3),
  ])

  if (overdue.length === 0 && upcoming.length === 0) {
    return NextResponse.json({ message: 'No follow-ups today' })
  }

  const lines: string[] = ['📋 *Daily Follow-up Summary*\n']

  if (overdue.length > 0) {
    lines.push('⚠️ *Overdue:*')
    for (const c of overdue) {
      lines.push(`• ${c.name} — was ${formatFollowUpDate(c.followup_date!)}`)
      if (c.followup_note) lines.push(`  _${c.followup_note}_`)
    }
    lines.push('')
  }

  if (upcoming.length > 0) {
    lines.push('📅 *Due soon (next 3 days):*')
    for (const c of upcoming) {
      lines.push(`• ${c.name} — ${formatFollowUpDate(c.followup_date!)}`)
      if (c.followup_note) lines.push(`  _${c.followup_note}_`)
    }
  }

  try {
    await sendTextMessage(YOUR_WA_ID, lines.join('\n'))
    return NextResponse.json({
      sent: true,
      overdue: overdue.length,
      upcoming: upcoming.length,
    })
  } catch (err: any) {
    console.error('[cron/followups] Failed to send:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}