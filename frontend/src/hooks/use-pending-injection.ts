"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { useAuth } from "./use-auth";
import { PendingInjectionEntry } from "@/types";

export function usePendingInjection() {
  const { token } = useAuth();
  return useSWR<PendingInjectionEntry[]>(
    token ? ["/admin/ldx-files/pending", token] : null,
    ([path, t]: [string, string]) => apiFetch<PendingInjectionEntry[]>(path, {}, t),
    { refreshInterval: 30_000 }
  );
}
