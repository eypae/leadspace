"use client";

import { useState } from "react";
import type { Segment } from "@/types";
import { getSegmentColor } from "@/lib/utils";

// Template definitions — add new approved templates here as you create them
const TEMPLATES = [
  {
    id: "hello_world",
    label: "Hello World (test)",
    description: "Simple test message — no variables",
    fields: [],
  },
  {
    id: "broadcast_new_listing",
    label: "New Listing",
    description:
      "Hi {{name}}, new {{property_type}} listing — View Listing button",
    fields: [
      {
        key: "property_name",
        label: "Property name",
        placeholder: "e.g. The Residences at Botanique",
      },
      {
        key: "property_type",
        label: "Property type",
        placeholder: "e.g. condominium, office, bungalow",
      },
      {
        key: "listing_id",
        label: "Listing ID",
        placeholder: "e.g. for-sale-residences-botanique-500075125",
      },
    ],
  },
] as const;

type TemplateId = (typeof TEMPLATES)[number]["id"];

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
  const [templateId, setTemplateId] = useState<TemplateId>(
    "broadcast_new_listing",
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedSegment = segments.find((s) => s.id === segmentId);
  const selectedTemplate = TEMPLATES.find((t) => t.id === templateId)!;
  const recipientCount = segmentId ? (clientCounts[segmentId] ?? 0) : 0;

  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  // Check all required fields for the selected template are filled
  const missingFields = selectedTemplate.fields.filter(
    (f) => !fieldValues[f.key]?.trim(),
  );
  const canSend = recipientCount > 0 && missingFields.length === 0;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setLoading(true);

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentId,
          templateName: templateId,
          templateVars: fieldValues,
        }),
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
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Broadcast message</div>
            <div
              style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}
            >
              Send an approved template to a segment
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

            {/* Template picker */}
            <div className="form-group">
              <label className="form-label">Template</label>
              <select
                className="form-select"
                value={templateId}
                onChange={(e) => {
                  setTemplateId(e.target.value as TemplateId);
                  setFieldValues({});
                }}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--gray-400)",
                  marginTop: 5,
                }}
              >
                {selectedTemplate.description}
              </div>
            </div>

            {/* Dynamic fields for the selected template */}
            {selectedTemplate.fields.length > 0 && (
              <div
                style={{
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                  marginBottom: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--gray-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  Template variables
                </div>

                {selectedTemplate.fields.map((field) => (
                  <div key={field.key}>
                    <label className="form-label">{field.label}</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder={field.placeholder}
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                      required
                    />
                  </div>
                ))}

                {/* Live preview of what the client will receive */}
                {templateId === "broadcast_new_listing" && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: "10px 12px",
                      background: "var(--gray-0)",
                      border: "1px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                      color: "var(--gray-600)",
                      lineHeight: 1.6,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        color: "var(--gray-400)",
                        fontSize: 11,
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Preview
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      New Listing:{" "}
                      {fieldValues["property_name"] || (
                        <span style={{ color: "var(--gray-300)" }}>
                          Property name
                        </span>
                      )}
                    </div>
                    <div>
                      Hi <strong>[client name]</strong>, hope you're doing well.
                      I have an exciting new{" "}
                      {fieldValues["property_type"] || (
                        <span style={{ color: "var(--gray-300)" }}>
                          property type
                        </span>
                      )}{" "}
                      listing that may be of interest to you. Let me know if
                      you'd like more details or if you'd be interested in
                      arranging a viewing.
                    </div>
                    {fieldValues["listing_id"] && (
                      <div
                        style={{
                          marginTop: 8,
                          color: "var(--color-info-text)",
                          fontSize: 11.5,
                        }}
                      >
                        🔗 https://www.propertyguru.com.sg/listing/
                        {fieldValues["listing_id"]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Info note */}
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
              Each client's name is filled in automatically from their record.
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
              disabled={loading || !canSend}
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
