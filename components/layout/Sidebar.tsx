"use client";

import { useEffect } from "react";
import type { Segment } from "@/types";
import { getSegmentColor } from "@/lib/utils";

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
  // Close on escape
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
            <div className="sidebar-logo-mark">W</div>
            <span>WA CRM</span>
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

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--gray-100)",
            flexShrink: 0,
          }}
        >
          <div
            style={{ fontSize: 11, color: "var(--gray-400)", lineHeight: 1.5 }}
          >
            <span style={{ fontWeight: 500, color: "var(--gray-600)" }}>
              WA Lead CRM
            </span>
            <br />
            Real estate edition
          </div>
        </div>
      </aside>
    </>
  );
}
