import Avatar from "@/components/shared/Avatar";
import { SegmentBadge } from "@/components/shared/Badge";
import FollowUpBadge from "@/components/shared/FollowUpBadge";
import { formatMessageTime } from "@/lib/utils";
import type { Client } from "@/types";

interface ClientRowProps {
  client: Client;
  isActive: boolean;
  segments: { id: string; name: string; color: string | null }[];
  onClick: () => void;
}

export default function ClientRow({
  client,
  isActive,
  segments,
  onClick,
}: ClientRowProps) {
  return (
    <div
      className={`client-row ${isActive ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-selected={isActive}
    >
      {/* Name + phone */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
      >
        <Avatar name={client.name} size="md" />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              fontSize: 13.5,
              color: "var(--gray-900)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {client.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--gray-400)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {client.phone}
          </div>
        </div>
      </div>

      {/* Segment */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {segments.length > 0 ? (
          segments
            .slice(0, 2)
            .map((seg) => (
              <SegmentBadge key={seg.id} name={seg.name} color={seg.color} />
            ))
        ) : (
          <span style={{ fontSize: 12, color: "var(--gray-300)" }}>—</span>
        )}
      </div>

      {/* Follow-up */}
      <div>
        <FollowUpBadge date={client.followup_date} />
      </div>

      {/* Last message */}
      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
        {client.last_message_at
          ? formatMessageTime(client.last_message_at)
          : "—"}
      </div>

      {/* Arrow */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gray-300)"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
