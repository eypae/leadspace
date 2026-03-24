"use client";

import { useState, useRef, useEffect } from "react";
import Avatar from "@/components/shared/Avatar";
import { SegmentBadge } from "@/components/shared/Badge";
import FollowUpBadge from "@/components/shared/FollowUpBadge";
import { formatChatTime } from "@/lib/utils";
import type { Client, Segment, Message } from "@/types";

interface ClientDetailProps {
  client: Client | null;
  segments: Segment[];
  onClose: () => void;
  onUpdate: (id: string, payload: any) => Promise<void>;
  onToast: (msg: string, type?: "success" | "error") => void;
}

type Tab = "messages" | "info";

export default function ClientDetail({
  client,
  segments,
  onClose,
  onUpdate,
  onToast,
}: ClientDetailProps) {
  const [tab, setTab] = useState<Tab>("messages");
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client) return;
    setMessages(client.messages ?? []);
    setFollowUpDate(client.followup_date ?? "");
    setFollowUpNote(client.followup_note ?? "");
    setTab("messages");
    setEditingFollowUp(false);
  }, [client?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!client) return null;

  const clientSegments = (client.client_segments ?? [])
    .map((cs) => segments.find((s) => s.id === cs.segment_id))
    .filter(Boolean) as Segment[];

  // Only show inbound messages and template broadcasts
  // Regular outbound free-form messages are excluded — WhatsApp only
  // delivers them within a 24h service window so their status is unreliable
  const visibleMessages = messages.filter(
    (m) => m.direction === "in" || m.is_template,
  );

  async function handleSaveFollowUp() {
    if (!client) return;
    try {
      await onUpdate(client.id, {
        followup_date: followUpDate || null,
        followup_note: followUpNote || null,
      });
      setEditingFollowUp(false);
      onToast("Follow-up date saved");
    } catch {
      onToast("Failed to save follow-up", "error");
    }
  }

  return (
    <aside className="detail-panel open" aria-label="Client detail">
      {/* Header */}
      <div className="detail-panel-header">
        <Avatar name={client.name} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--gray-900)",
              lineHeight: 1.2,
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
        {client.wa_id && (
          <a
            href={`https://wa.me/${client.wa_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            title="Open in WhatsApp to send a message"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </a>
        )}
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

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--gray-100)",
          flexShrink: 0,
        }}
      >
        {(["messages", "info"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "var(--brand-500)" : "var(--gray-500)",
              background: "none",
              border: "none",
              borderBottom:
                tab === t
                  ? "2px solid var(--brand-500)"
                  : "2px solid transparent",
              cursor: "pointer",
              transition: "color var(--transition-fast)",
              fontFamily: "var(--font-sans)",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── MESSAGES TAB ── */}
      {tab === "messages" && (
        <>
          {/* Info banner explaining what's shown */}
          <div
            style={{
              padding: "8px 14px",
              background: "var(--color-info-bg)",
              borderBottom: "1px solid var(--color-info-border)",
              fontSize: 11.5,
              color: "var(--color-info-text)",
              lineHeight: 1.5,
              flexShrink: 0,
              display: "flex",
              gap: 7,
              alignItems: "flex-start",
            }}
          >
            <svg
              width="13"
              height="13"
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
            <span>
              Shows inbound messages and broadcasts. To send a new message, use{" "}
              <strong>Chat</strong> to open WhatsApp directly.
            </span>
          </div>

          {/* Message list */}
          <div className="chat-container scrollbar-hide">
            {visibleMessages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--gray-400)",
                  fontSize: 13,
                  padding: "32px 16px",
                  lineHeight: 1.6,
                }}
              >
                <div style={{ marginBottom: 6 }}>No messages yet</div>
                <div style={{ fontSize: 12 }}>
                  Messages from this client and broadcasts you send will appear
                  here.
                </div>
              </div>
            ) : (
              visibleMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      msg.direction === "out" ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Template label for outbound broadcasts */}
                  {msg.direction === "out" && msg.is_template && (
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "var(--gray-400)",
                        marginBottom: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m3 11 19-9-9 19-2-8-8-2z" />
                      </svg>
                      Broadcast
                    </div>
                  )}

                  <div
                    className={`chat-bubble chat-bubble-${msg.direction}`}
                    style={
                      msg.is_template
                        ? {
                            borderLeft: "3px solid rgba(255,255,255,0.4)",
                            opacity: 0.95,
                          }
                        : undefined
                    }
                  >
                    {msg.body}
                  </div>

                  <div
                    className="chat-time"
                    style={{
                      textAlign: msg.direction === "out" ? "right" : "left",
                    }}
                  >
                    {formatChatTime(msg.created_at)}
                    {msg.direction === "out" && (
                      <span style={{ marginLeft: 4 }}>
                        {msg.status === "read"
                          ? "✓✓"
                          : msg.status === "delivered"
                            ? "✓✓"
                            : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer — open in WhatsApp button */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid var(--gray-100)",
              flexShrink: 0,
              background: "var(--gray-0)",
            }}
          >
            {client.wa_id ? (
              <a
                href={`https://wa.me/${client.wa_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  height: 36,
                  fontSize: 13,
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Open WhatsApp to send a message
              </a>
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--gray-400)",
                  textAlign: "center",
                }}
              >
                No WhatsApp ID — add a phone number to enable messaging
              </div>
            )}
          </div>
        </>
      )}

      {/* ── INFO TAB ── */}
      {tab === "info" && (
        <div
          style={{ flex: 1, overflowY: "auto", padding: "16px" }}
          className="scrollbar-hide"
        >
          {/* Segments */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--gray-400)",
                marginBottom: 8,
              }}
            >
              Segments
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {clientSegments.length > 0 ? (
                clientSegments.map((s) => (
                  <SegmentBadge key={s.id} name={s.name} color={s.color} />
                ))
              ) : (
                <span style={{ fontSize: 13, color: "var(--gray-400)" }}>
                  No segments assigned
                </span>
              )}
            </div>
          </div>

          <div className="divider" style={{ marginBottom: 20 }} />

          {/* Follow-up */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--gray-400)",
                }}
              >
                Follow-up date
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
                onClick={() => setEditingFollowUp(!editingFollowUp)}
              >
                {editingFollowUp ? "Cancel" : "Edit"}
              </button>
            </div>

            {editingFollowUp ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="date"
                  className="form-input"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 64 }}
                  placeholder="Note (e.g. waiting for loan approval)"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveFollowUp}
                >
                  Save follow-up
                </button>
              </div>
            ) : (
              <div>
                <FollowUpBadge date={client.followup_date} />
                {client.followup_note && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: "var(--gray-600)",
                      lineHeight: 1.5,
                      background: "var(--gray-50)",
                      padding: "8px 10px",
                      borderRadius: "var(--radius-md)",
                      borderLeft: "3px solid var(--brand-400)",
                    }}
                  >
                    {client.followup_note}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="divider" style={{ marginBottom: 20 }} />

          {/* Contact info */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--gray-400)",
                marginBottom: 10,
              }}
            >
              Contact
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  { label: "Phone", value: client.phone },
                  { label: "WhatsApp ID", value: client.wa_id ?? "—" },
                  {
                    label: "Added",
                    value: new Date(client.created_at).toLocaleDateString(
                      "en-SG",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    ),
                  },
                ].map(({ label, value }) => (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "5px 0",
                        fontSize: 12,
                        color: "var(--gray-400)",
                        width: "40%",
                        verticalAlign: "top",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: "5px 0",
                        fontSize: 13,
                        color: "var(--gray-700)",
                        fontFamily:
                          label === "Phone" || label === "WhatsApp ID"
                            ? "var(--font-mono)"
                            : "inherit",
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </aside>
  );
}
