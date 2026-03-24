"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ClientList from "@/components/clients/ClientList";
import ClientDetail from "@/components/clients/ClientDetail";
import AddClientModal from "@/components/clients/AddClientModal";
import BroadcastModal from "@/components/clients/BroadcastModal";
import { useClients, useClientDetail } from "@/hooks/useClients";
import { useSegments } from "@/hooks/useSegments";
import { getFollowUpStatus } from "@/lib/utils";
import type { Client, ToastMessage } from "@/types";

export default function DashboardPage() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { segments } = useSegments();
  const { clients, loading, createClient, updateClient, deleteClient } =
    useClients();
  const { client: activeClient, setClient: setActiveClient } =
    useClientDetail(activeClientId);

  // ── Toast helpers ──────────────────────────────────
  const showToast = useCallback(
    (text: string, type: ToastMessage["type"] = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000,
      );
    },
    [],
  );

  // ── Derived counts ─────────────────────────────────
  const clientCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const client of clients) {
      for (const cs of client.client_segments ?? []) {
        counts[cs.segment_id] = (counts[cs.segment_id] ?? 0) + 1;
      }
    }
    return counts;
  }, [clients]);

  const dueTodayCount = useMemo(
    () =>
      clients.filter((c) => {
        const s = getFollowUpStatus(c.followup_date);
        return s === "today" || s === "overdue";
      }).length,
    [clients],
  );

  // ── Filtered client list ───────────────────────────
  const filteredClients = useMemo(() => {
    let result = clients;

    if (activeSegment === "__followups__") {
      result = result.filter((c) => {
        const s = getFollowUpStatus(c.followup_date);
        return s === "today" || s === "overdue" || s === "soon";
      });
    } else if (activeSegment) {
      result = result.filter((c) =>
        c.client_segments?.some((cs) => cs.segment_id === activeSegment),
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.followup_note ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [clients, activeSegment, search]);

  // ── Section title ──────────────────────────────────
  const sectionTitle = useMemo(() => {
    if (activeSegment === "__followups__") return "Follow-ups due";
    if (activeSegment)
      return segments.find((s) => s.id === activeSegment)?.name ?? "Clients";
    return "All clients";
  }, [activeSegment, segments]);

  const sectionSubtitle = `${filteredClients.length} client${filteredClients.length !== 1 ? "s" : ""}`;

  // ── Open client detail ─────────────────────────────
  function handleClientClick(client: Client) {
    setActiveClientId(client.id);
  }

  // When detail loads, close mobile sidebar
  useEffect(() => {
    if (activeClient) setSidebarOpen(false);
  }, [activeClient?.id]);

  // ── Add client ─────────────────────────────────────
  async function handleAddClient(payload: Parameters<typeof createClient>[0]) {
    await createClient(payload);
    showToast(`${payload.name} added successfully`);
  }

  // ── Update client ──────────────────────────────────
  async function handleUpdateClient(id: string, payload: any) {
    await updateClient(id, payload);
    // Refresh the active client detail
    if (activeClientId === id) {
      setActiveClient((prev) => (prev ? { ...prev, ...payload } : prev));
    }
  }

  // ── Stats numbers ──────────────────────────────────
  const overdueCount = clients.filter(
    (c) => getFollowUpStatus(c.followup_date) === "overdue",
  ).length;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        segments={segments}
        activeSegment={activeSegment}
        onSegmentChange={(id) => {
          setActiveSegment(id);
          setActiveClientId(null);
          setSearch("");
        }}
        clientCounts={clientCounts}
        totalCount={clients.length}
        dueTodayCount={dueTodayCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="main-content">
        {/* Top bar */}
        <TopBar
          title={sectionTitle}
          subtitle={sectionSubtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onAddClient={() => setShowAddModal(true)}
          onBroadcast={() => setShowBroadcast(true)}
          searchValue={search}
          onSearchChange={setSearch}
        />

        {/* Stats row */}
        <div
          className="stats-row"
          style={{
            display: "flex",
            gap: 12,
            padding: "12px 20px",
            borderBottom: "1px solid var(--gray-100)",
            background: "var(--gray-0)",
            flexShrink: 0,
          }}
        >
          {[
            { label: "Total clients", value: clients.length, sub: "all time" },
            {
              label: "Follow-ups due",
              value: dueTodayCount,
              sub: "today & overdue",
              accent: dueTodayCount > 0,
            },
            {
              label: "Overdue",
              value: overdueCount,
              sub: "past due date",
              accent: overdueCount > 0,
            },
            {
              label: "Segments",
              value: segments.length,
              sub: "property types",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="stat-card"
              style={{
                flex: "1 1 0",
                minWidth: 0,
                borderColor: stat.accent
                  ? "var(--color-warning-border)"
                  : undefined,
                background: stat.accent ? "var(--color-warning-bg)" : undefined,
              }}
            >
              <div className="stat-card-label">{stat.label}</div>
              <div
                className="stat-card-value"
                style={{
                  color: stat.accent ? "var(--color-warning-text)" : undefined,
                }}
              >
                {stat.value}
              </div>
              <div className="stat-card-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Client list + detail panel */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <ClientList
            clients={filteredClients}
            segments={segments}
            loading={loading}
            activeClientId={activeClientId}
            onClientClick={handleClientClick}
            onAddClient={() => setShowAddModal(true)}
          />

          <ClientDetail
            client={activeClient}
            segments={segments}
            onClose={() => setActiveClientId(null)}
            onUpdate={handleUpdateClient}
            onDelete={async (id) => {
              await deleteClient(id);
              setActiveClientId(null);
            }}
            onToast={showToast}
          />
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddClientModal
          segments={segments}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddClient}
        />
      )}

      {showBroadcast && (
        <BroadcastModal
          segments={segments}
          clientCounts={clientCounts}
          onClose={() => setShowBroadcast(false)}
          onToast={showToast}
        />
      )}

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast"
            style={{
              background:
                toast.type === "error"
                  ? "var(--color-danger-text)"
                  : toast.type === "info"
                    ? "var(--color-info-text)"
                    : "var(--gray-900)",
            }}
          >
            {toast.text}
          </div>
        ))}
      </div>

      {/* Mobile menu button inject — shown via CSS on small screens */}
      <style>{`
        @media (max-width: 767px) {
          #menu-btn { display: flex !important; }
          .hide-xs { display: none; }
        }
      `}</style>
    </div>
  );
}
