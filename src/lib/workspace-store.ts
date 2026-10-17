"use client";
import { useSyncExternalStore } from "react";
export const memberColumns = [
  { id: "id", label: "Lidnummer" },
  { id: "address", label: "Adres" },
  { id: "city", label: "Woonplaats" },
  { id: "status", label: "Status" },
  { id: "email", label: "E-mailadres" },
  { id: "phone", label: "Telefoon" },
  { id: "family", label: "Gezin" },
  { id: "joined", label: "Lid sinds" },
  { id: "membershipType", label: "Type lidmaatschap" },
] as const;
export type ColumnId = (typeof memberColumns)[number]["id"];
export type SavedSelection = {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
};
type Workspace = { columns: ColumnId[]; selections: SavedSelection[] };
const defaults: Workspace = {
  columns: ["id", "address", "city", "status"],
  selections: [],
};
const KEY = "antioch.member-workspace.v1";
let state = defaults,
  loaded = false;
const listeners = new Set<() => void>();
function read() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const value = JSON.parse(raw) as Workspace;
        if (
          Array.isArray(value.columns) &&
          value.columns.every((c) => memberColumns.some((v) => v.id === c)) &&
          new Set(value.columns).size === value.columns.length &&
          Array.isArray(value.selections) &&
          value.selections.every(
            (s) =>
              typeof s.id === "string" &&
              typeof s.name === "string" &&
              typeof s.createdAt === "string" &&
              Array.isArray(s.memberIds) &&
              s.memberIds.every((id) => typeof id === "string"),
          )
        ) {
          state = value;
        }
      }
    } catch {
      /* Use default columns when preferences are unavailable. */
    }
  }
  return state;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const update = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      loaded = false;
      state = defaults;
      read();
      listeners.forEach((fn) => fn());
    }
  };
  window.addEventListener("storage", update);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", update);
  };
}
export function useMemberWorkspace() {
  return useSyncExternalStore(subscribe, read, () => defaults);
}
function save(next: Workspace) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return "Uw weergave of selectie kon niet worden bewaard. Controleer de beschikbare browseropslag.";
  }
  state = next;
  listeners.forEach((fn) => fn());
  return null;
}
export function saveColumns(columns: ColumnId[]) {
  return save({ ...read(), columns });
}
export function saveSelection(selection: SavedSelection) {
  const current = read();
  if (
    current.selections.some(
      (s) =>
        s.name.toLocaleLowerCase("nl") ===
        selection.name.trim().toLocaleLowerCase("nl"),
    )
  )
    return "Er bestaat al een selectie met deze naam.";
  return save({ ...current, selections: [...current.selections, selection] });
}
export function deleteSelection(id: string) {
  return save({
    ...read(),
    selections: read().selections.filter((s) => s.id !== id),
  });
}
