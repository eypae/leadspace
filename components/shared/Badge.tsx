import { getSegmentColor } from "@/lib/utils";

interface SegmentBadgeProps {
  name: string;
  color?: string | null;
}

export function SegmentBadge({ name, color }: SegmentBadgeProps) {
  const hex = color ?? getSegmentColor(name);
  return (
    <span
      className="badge"
      style={{
        background: hex + "18",
        color: hex,
        border: `1px solid ${hex}30`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: hex,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {name}
    </span>
  );
}

interface StatusBadgeProps {
  status: "sent" | "delivered" | "read" | "failed";
}

export function MessageStatusBadge({ status }: StatusBadgeProps) {
  const map = {
    sent: { label: "Sent", cls: "badge-neutral" },
    delivered: { label: "Delivered", cls: "badge-info" },
    read: { label: "Read", cls: "badge-success" },
    failed: { label: "Failed", cls: "badge-danger" },
  };
  const { label, cls } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
