"use client";

import { useState, useEffect, useCallback } from "react";
import type { Client } from "@/types";

export function useClients(segmentId?: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = segmentId
        ? `/api/clients?segmentId=${segmentId}`
        : "/api/clients";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [segmentId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (payload: {
    name: string;
    phone: string;
    segmentIds?: string[];
    followup_date?: string;
    followup_note?: string;
  }) => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to create client");
    }
    const newClient = await res.json();
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (
    id: string,
    payload: Partial<
      Pick<Client, "name" | "followup_date" | "followup_note">
    > & {
      addSegmentIds?: string[];
      removeSegmentIds?: string[];
    },
  ) => {
    const res = await fetch("/api/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!res.ok) throw new Error("Failed to update client");
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...payload } : c)),
    );
  };

  const deleteClient = async (id: string) => {
    const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete client");
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useClientDetail(id: string | null) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setClient(null);
      return;
    }
    setLoading(true);
    fetch(`/api/clients?id=${id}`)
      .then((r) => r.json())
      .then((data) => setClient(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return { client, loading, setClient };
}
