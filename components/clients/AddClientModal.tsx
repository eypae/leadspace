"use client";

import { useState } from "react";
import type { Segment } from "@/types";
import { getSegmentColor } from "@/lib/utils";

interface AddClientModalProps {
  segments: Segment[];
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    phone: string;
    segmentIds: string[];
    followup_date: string;
    followup_note: string;
  }) => Promise<void>;
}

export default function AddClientModal({
  segments,
  onClose,
  onSubmit,
}: AddClientModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleSegment(id: string) {
    setSelectedSegments((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        segmentIds: selectedSegments,
        followup_date: followUpDate,
        followup_note: followUpNote,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal aria-label="Add client">
        <div className="modal-header">
          <div>
            <div className="modal-title">Add new client</div>
            <div
              style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}
            >
              Fill in the client's details below
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: "var(--color-danger-bg)",
                  color: "var(--color-danger-text)",
                  border: "1px solid var(--color-danger-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  fontSize: 13,
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full name *</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. James Tan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone number *</label>
              <input
                className="form-input"
                type="tel"
                placeholder="+65 9123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Segments */}
            {segments.length > 0 && (
              <div className="form-group">
                <label className="form-label">Segments</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {segments.map((seg) => {
                    const color = seg.color ?? getSegmentColor(seg.name);
                    const selected = selectedSegments.includes(seg.id);
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => toggleSegment(seg.id)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: 12,
                          fontWeight: 500,
                          border: `1px solid ${selected ? color : "var(--gray-200)"}`,
                          background: selected ? color + "18" : "transparent",
                          color: selected ? color : "var(--gray-500)",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                          fontFamily: "var(--font-sans)",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: selected ? color : "var(--gray-300)",
                            display: "inline-block",
                            transition: "background var(--transition-fast)",
                          }}
                        />
                        {seg.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Follow-up */}
            <div className="form-group">
              <label className="form-label">Follow-up date</label>
              <input
                className="form-input"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Follow-up note</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Waiting to sell current property. Budget $4M, wants CBD area."
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
              />
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
              disabled={loading}
            >
              {loading ? "Adding…" : "Add client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
