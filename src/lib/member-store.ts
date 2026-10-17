"use client";
import { useSyncExternalStore } from "react";
import { members as examples, families, type Member } from "@/lib/data";
const KEY = "antioch.members.v1";
let snapshot: Member[] = examples;
let loaded = false;
const listeners = new Set<() => void>();
function valid(value: unknown): value is Member[] {
  if (!Array.isArray(value) || value.length < examples.length) return false;
  const keys = Object.keys(examples[0]) as (keyof Member)[];
  return (
    value.every(
      (m) =>
        m &&
        keys.every((k) => typeof m[k] === "string") &&
        ["Actief", "Inactief"].includes(m.status) &&
        /^\d{4}-\d{2}-\d{2}$/.test(m.birthDate) &&
        !Number.isNaN(Date.parse(m.birthDate)) &&
        /^\d{4}-\d{2}-\d{2}$/.test(m.joined) &&
        !Number.isNaN(Date.parse(m.joined)) &&
        /^L-\d+$/.test(m.id) &&
        families.some((f) => f.id === m.familyId) &&
        families.every((f) => f.contact !== m.id || f.id === m.familyId),
    ) &&
    new Set(value.map((m) => m.id)).size === value.length &&
    examples.every((m) => value.some((v) => v.id === m.id))
  );
}
function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (valid(parsed)) snapshot = parsed;
      }
    } catch {
      /* Read-only demo remains usable when storage is unavailable. */
    }
  }
  return snapshot;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      loaded = false;
      snapshot = examples;
      getSnapshot();
      listeners.forEach((fn) => fn());
    }
  };
  window.addEventListener("storage", sync);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", sync);
  };
}
export function useMembers() {
  return useSyncExternalStore(subscribe, getSnapshot, () => examples);
}
export function saveMember(member: Member): string | null {
  const current = getSnapshot();
  const next = current.some((m) => m.id === member.id)
    ? current.map((m) => (m.id === member.id ? member : m))
    : [...current, member];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return "Opslaan is niet gelukt. Controleer of uw browser lokale opslag toestaat en probeer opnieuw.";
  }
  snapshot = next;
  listeners.forEach((fn) => fn());
  return null;
}
export function nextMemberId() {
  return `L-${
    Math.max(
      ...getSnapshot()
        .map((m) => Number(m.id.slice(2)))
        .filter(Number.isFinite),
    ) + 1
  }`;
}
export function memberHref(id: string) {
  return examples.some((m) => m.id === id)
    ? `/leden/${id}`
    : `/leden/lokaal?id=${encodeURIComponent(id)}`;
}
