"use client";

import { useState } from "react";
import type { Segment } from "@/types";
import { getSegmentColor } from "@/lib/utils";

interface BroadcastModalProps {
  segments: Segment[];
  clientCounts: Record<string, number>;
  onClose: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
}

export default function BroadcastModal({
  segments,
  clientCounts,
  onClose,
  onToast,
}: BroadcastModalProps) {
  const [segmentId, setSegmentId] = useState(segments[0]?.id ?? "");
  const [message, setMessage] = useState(
    "Hi {{name}}, we have a new listing that may interest you! Reply to learn more.",
  );
  const [loading, setLoading] = useState(false);

  const selectedSegment = segments.find((s) => s.id === segmentId);
  const recipientCount = segmentId ? (clientCounts[segmentId] ?? 0) : 0;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!segmentId || !message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onToast(
        `Broadcast sent to ${data.sent} client${data.sent !== 1 ? "s" : ""}`,
      );
      onClose();
    } catch (err: any) {
      onToast(err.message ?? "Broadcast failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal
        aria-label="Broadcast message"
      >
        <div className="modal-header">
          <div>
            <div className="modal-title">Broadcast message</div>
            <div
              style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}
            >
              Send to all clients in a segment
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSend}>
          <div className="modal-body">
            {/* Segment picker */}
            <div className="form-group">
              <label className="form-label">Segment</label>
              <select
                className="form-select"
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
              >
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>
                    {seg.name} ({clientCounts[seg.id] ?? 0} clients)
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient preview */}
            {selectedSegment && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--gray-50)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: 14,
                  fontSize: 13,
                  color: "var(--gray-600)",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      selectedSegment.color ??
                      getSegmentColor(selectedSegment.name),
                    flexShrink: 0,
                  }}
                />
                Sending to{" "}
                <strong style={{ color: "var(--gray-800)" }}>
                  {recipientCount} client{recipientCount !== 1 ? "s" : ""}
                </strong>{" "}
                in {selectedSegment.name}
              </div>
            )}

            {/* Message */}
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 100 }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message…"
                required
              />
            </div>

            <div
              style={{
                fontSize: 11.5,
                color: "var(--gray-400)",
                lineHeight: 1.5,
                display: "flex",
                gap: 6,
                alignItems: "flex-start",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Use{" "}
              <code
                style={{
                  background: "var(--gray-100)",
                  padding: "0 4px",
                  borderRadius: 3,
                }}
              >
                {"{{name}}"}
              </code>{" "}
              to personalise the message with each client's name. WhatsApp
              requires an approved template for first-contact messages.
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || recipientCount === 0}
            >
              {loading
                ? "Sending…"
                : `Send to ${recipientCount} client${recipientCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
