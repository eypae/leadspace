"use client";

import { useEffect } from "react";
import type { Segment } from "@/types";
import { getSegmentColor } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface SidebarProps {
  segments: Segment[];
  activeSegment: string | null;
  onSegmentChange: (id: string | null) => void;
  clientCounts: Record<string, number>;
  totalCount: number;
  dueTodayCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  segments,
  activeSegment,
  onSegmentChange,
  clientCounts,
  totalCount,
  dueTodayCount,
  isOpen,
  onClose,
}: SidebarProps) {
  const { profile, signOut, loading } = useAuthStore();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden />
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        aria-label="Navigation"
      >
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">L</div>
            <span>LeadSpace</span>
          </div>
        </div>

        <nav className="sidebar-nav scrollbar-hide">
          {/* All clients */}
          <div className="sidebar-section-label">Clients</div>
          <button
            className={`sidebar-item ${activeSegment === null ? "active" : ""}`}
            onClick={() => {
              onSegmentChange(null);
              onClose();
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            All clients
            <span className="sidebar-item-count">{totalCount}</span>
          </button>

          {/* Follow-ups */}
          <button
            className={`sidebar-item ${activeSegment === "__followups__" ? "active" : ""}`}
            onClick={() => {
              onSegmentChange("__followups__");
              onClose();
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Follow-ups due
            {dueTodayCount > 0 && (
              <span
                className="sidebar-item-count"
                style={{ background: "#fde8d3", color: "#c85f10" }}
              >
                {dueTodayCount}
              </span>
            )}
          </button>

          {/* Segments */}
          {segments.length > 0 && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: 12 }}>
                Segments
              </div>
              {segments.map((seg) => {
                const color = seg.color ?? getSegmentColor(seg.name);
                return (
                  <button
                    key={seg.id}
                    className={`sidebar-item ${activeSegment === seg.id ? "active" : ""}`}
                    onClick={() => {
                      onSegmentChange(seg.id);
                      onClose();
                    }}
                  >
                    <span
                      className="sidebar-item-dot"
                      style={{ background: color }}
                    />
                    {seg.name}
                    <span className="sidebar-item-count">
                      {clientCounts[seg.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer — agent profile + sign out */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid var(--gray-100)",
            flexShrink: 0,
          }}
        >
          {/* Agent info */}
          {profile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 10,
                padding: "8px 6px",
                borderRadius: "var(--radius-md)",
                background: "var(--gray-50)",
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "var(--brand-100)",
                  color: "var(--brand-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {profile.display_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--gray-800)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile.display_name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--gray-400)",
                    textTransform: "capitalize",
                  }}
                >
                  {profile.role}
                </div>
              </div>
            </div>
          )}

          {/* Sign out button */}
          <button
            onClick={signOut}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "7px 8px",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--gray-500)",
              background: "none",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition:
                "background var(--transition-fast), color var(--transition-fast)",
              fontFamily: "var(--font-sans)",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-danger-bg)";
              e.currentTarget.style.color = "var(--color-danger-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "var(--gray-500)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
