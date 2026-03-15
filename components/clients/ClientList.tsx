"use client";

import ClientRow from "./ClientRow";
import EmptyState from "@/components/shared/EmptyState";
import type { Client, Segment } from "@/types";

interface ClientListProps {
  clients: Client[];
  segments: Segment[];
  loading: boolean;
  activeClientId: string | null;
  onClientClick: (client: Client) => void;
  onAddClient: () => void;
}

// Build a lookup: clientId → segments[]
function buildClientSegmentMap(
  clients: Client[],
  segments: Segment[],
): Record<string, { id: string; name: string; color: string | null }[]> {
  const segMap = Object.fromEntries(segments.map((s) => [s.id, s]));
  const result: Record<
    string,
    { id: string; name: string; color: string | null }[]
  > = {};

  for (const client of clients) {
    if (client.client_segments) {
      result[client.id] = client.client_segments
        .map((cs) => segMap[cs.segment_id])
        .filter(Boolean);
    } else {
      result[client.id] = [];
    }
  }
  return result;
}

export default function ClientList({
  clients,
  segments,
  loading,
  activeClientId,
  onClientClick,
  onAddClient,
}: ClientListProps) {
  const segmentMap = buildClientSegmentMap(clients, segments);

  if (loading) {
    return (
      <div className="client-list-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="client-row" style={{ pointerEvents: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--gray-100)",
                  flexShrink: 0,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    width: 120,
                    height: 13,
                    borderRadius: 4,
                    background: "var(--gray-100)",
                  }}
                />
                <div
                  style={{
                    width: 80,
                    height: 11,
                    borderRadius: 4,
                    background: "var(--gray-100)",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                width: 60,
                height: 20,
                borderRadius: 99,
                background: "var(--gray-100)",
              }}
            />
            <div
              style={{
                width: 80,
                height: 20,
                borderRadius: 99,
                background: "var(--gray-100)",
              }}
            />
          </div>
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="client-list-container">
        <EmptyState
          title="No clients found"
          description="Add your first client or adjust your search filters."
          action={
            <button className="btn btn-primary" onClick={onAddClient}>
              + Add client
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="client-list-container">
      {/* Table header */}
      <div className="client-table-header">
        <span>Client</span>
        <span>Segment</span>
        <span>Follow-up</span>
        <span>Last msg</span>
        <span />
      </div>

      {/* Rows */}
      {clients.map((client) => (
        <ClientRow
          key={client.id}
          client={client}
          isActive={activeClientId === client.id}
          segments={segmentMap[client.id] ?? []}
          onClick={() => onClientClick(client)}
        />
      ))}
    </div>
  );
}
