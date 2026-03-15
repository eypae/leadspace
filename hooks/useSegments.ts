"use client";

import { useState, useEffect } from "react";
import type { Segment } from "@/types";

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/segments")
      .then((r) => r.json())
      .then(setSegments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { segments, loading };
}
