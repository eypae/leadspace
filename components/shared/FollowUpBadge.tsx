import { getFollowUpStatus, formatFollowUpDate } from '@/lib/utils'

interface FollowUpBadgeProps {
  date: string | null
  showIcon?: boolean
}

export default function FollowUpBadge({ date, showIcon = true }: FollowUpBadgeProps) {
  if (!date) {
    return <span className="badge badge-neutral">No date set</span>
  }

  const status = getFollowUpStatus(date)
  const label = formatFollowUpDate(date)

  const config = {
    overdue:  { cls: 'badge-danger',  icon: '⚠' },
    today:    { cls: 'badge-warning', icon: '🔔' },
    soon:     { cls: 'badge-warning', icon: '📅' },
    upcoming: { cls: 'badge-success', icon: '🕐' },
  }

  const { cls, icon } = config[status!] ?? config.upcoming

  return (
    <span className={`badge ${cls}`}>
      {showIcon && <span style={{ fontSize: 11 }}>{icon}</span>}
      {label}
    </span>
  )
}