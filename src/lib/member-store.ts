"use client";
import { useSyncExternalStore } from "react";
import {
  members as examples,
  families as exampleFamilies,
  type Member,
} from "@/lib/data";
export type Family = (typeof exampleFamilies)[number];
export type Scope = { kind: "member" | "family"; id: string };
export type Note = {
  id: string;
  scope: Scope;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};
export const caseStatuses = ["Open", "In behandeling", "Afgerond"] as const;
export type Case = {
  id: string;
  scope: Scope;
  title: string;
  description: string;
  category: string;
  status: (typeof caseStatuses)[number];
  createdAt: string;
  updatedAt: string;
};
export type Document = {
  id: string;
  scope: Scope;
  name: string;
  category: string;
  description: string;
  caseId: string;
  mime: "application/pdf" | "image/png" | "image/jpeg";
  size: number;
  base64: string;
  createdAt: string;
};
type Administration = {
  members: Member[];
  families: Family[];
  notes: Note[];
  cases: Case[];
  documents: Document[];
};
const KEY = "antioch.administration.v2";
const LEGACY_KEY = "antioch.members.v1";
const initial: Administration = {
  members: examples,
  families: exampleFamilies,
  notes: [],
  cases: [],
  documents: [],
};
let snapshot = initial;
let loaded = false;
const listeners = new Set<() => void>();
function strings(
  value: unknown,
  keys: string[],
): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    keys.every((k) => typeof (value as Record<string, unknown>)[k] === "string")
  );
}
const unique = (values: { id: string }[]) =>
  new Set(values.map((v) => v.id)).size === values.length;
const validDate = (value: string) => !Number.isNaN(Date.parse(value));
function validFamilies(value: unknown): value is Family[] {
  return (
    Array.isArray(value) &&
    value.every(
      (f) =>
        strings(f, Object.keys(exampleFamilies[0])) && /^G-\d+$/.test(f.id),
    ) &&
    unique(value) &&
    exampleFamilies.every((f) => value.some((v) => v.id === f.id))
  );
}
function validMembers(value: unknown, families: Family[]): value is Member[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        strings(m, Object.keys(examples[0])) &&
        ["Actief", "Inactief"].includes(m.status) &&
        /^L-\d+$/.test(m.id) &&
        ["birthDate", "joined"].every(
          (key) => /^\d{4}-\d{2}-\d{2}$/.test(m[key]) && validDate(m[key]),
        ) &&
        families.some((f) => f.id === m.familyId) &&
        [
          "preferredName",
          "birthPlace",
          "nationality",
          "language",
          "occupation",
          "membershipType",
          "contactPreference",
        ].every((key) => m[key] === undefined || typeof m[key] === "string") &&
        (m.customFields === undefined ||
          (Array.isArray(m.customFields) &&
            m.customFields.every((v) => strings(v, ["label", "value"])))),
    ) &&
    unique(value) &&
    examples.every((m) => value.some((v) => v.id === m.id)) &&
    families.every(
      (f) =>
        !f.contact ||
        value.some((m) => m.id === f.contact && m.familyId === f.id),
    )
  );
}
export function sameScope(a: Scope, b: Scope) {
  return a.kind === b.kind && a.id === b.id;
}
function valid(value: unknown): value is Administration {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  if (
    !validFamilies(data.families) ||
    !validMembers(data.members, data.families)
  )
    return false;
  const members = data.members,
    families = data.families;
  const scoped = (
    value: unknown,
  ): value is { id: string; scope: Scope; createdAt: string } => {
    if (!strings(value, ["id", "createdAt"]) || !validDate(value.createdAt))
      return false;
    const scope = (value as unknown as { scope?: Scope }).scope;
    return (
      !!scope &&
      (scope.kind === "member"
        ? members.some((m) => m.id === scope.id)
        : scope.kind === "family" && families.some((f) => f.id === scope.id))
    );
  };
  if (
    !Array.isArray(data.notes) ||
    !data.notes.every(
      (n) =>
        scoped(n) &&
        strings(n, ["title", "body", "updatedAt"]) &&
        validDate(n.updatedAt),
    ) ||
    !unique(data.notes)
  )
    return false;
  if (
    !Array.isArray(data.cases) ||
    !data.cases.every(
      (c) =>
        scoped(c) &&
        strings(c, [
          "title",
          "description",
          "category",
          "status",
          "updatedAt",
        ]) &&
        caseStatuses.includes(c.status as Case["status"]) &&
        validDate(c.updatedAt),
    ) ||
    !unique(data.cases)
  )
    return false;
  const cases = data.cases as Case[];
  return (
    Array.isArray(data.documents) &&
    data.documents.every(
      (d) =>
        scoped(d) &&
        strings(d, [
          "name",
          "category",
          "description",
          "caseId",
          "mime",
          "base64",
        ]) &&
        ["application/pdf", "image/png", "image/jpeg"].includes(d.mime) &&
        typeof d.size === "number" &&
        d.size > 0 &&
        d.size <= 1024 * 1024 &&
        typeof d.base64 === "string" &&
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
          d.base64,
        ) &&
        (d.base64.length / 4) * 3 -
          (d.base64.endsWith("==") ? 2 : d.base64.endsWith("=") ? 1 : 0) ===
          d.size &&
        (!d.caseId ||
          cases.some((c) => c.id === d.caseId && sameScope(c.scope, d.scope))),
    ) &&
    unique(data.documents)
  );
}
function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (valid(parsed)) {
          snapshot = parsed;
          return snapshot;
        }
      }
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsed: unknown = JSON.parse(legacy);
        if (validMembers(parsed, exampleFamilies))
          snapshot = { ...initial, members: parsed };
      }
    } catch {
      /* Unreadable storage never breaks the fictional demo. */
    }
  }
  return snapshot;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => {
    if (event.key === KEY || event.key === LEGACY_KEY || event.key === null) {
      loaded = false;
      snapshot = initial;
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
export function useAdministration() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initial);
}
export function useMembers() {
  return useAdministration().members;
}
export function useFamilies() {
  return useAdministration().families;
}
function persist(next: Administration): string | null {
  if (!valid(next))
    return "Controleer de gegevens en de koppeling tussen gezin, lid en dossier.";
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return "Opslaan is niet gelukt. Uw browseropslag is vol of niet beschikbaar. Verwijder eventueel een lokaal demodocument en probeer opnieuw.";
  }
  snapshot = next;
  listeners.forEach((fn) => fn());
  return null;
}
export function saveMember(member: Member): string | null {
  const current = getSnapshot();
  return persist({
    ...current,
    members: current.members.some((m) => m.id === member.id)
      ? current.members.map((m) => (m.id === member.id ? member : m))
      : [...current.members, member],
  });
}
export function saveFamily(
  family: Family,
  updateAddresses: boolean,
): string | null {
  const current = getSnapshot();
  const previous = current.families.find((f) => f.id === family.id);
  const members = current.members.map((m) =>
    m.familyId !== family.id
      ? m
      : {
          ...m,
          ...(updateAddresses
            ? {
                address: family.address,
                postcode: family.postcode,
                city: family.city,
              }
            : {}),
          role:
            m.id === family.contact
              ? "Contactpersoon"
              : m.id === previous?.contact
                ? "Gezinslid"
                : m.role,
        },
  );
  return persist({
    ...current,
    members,
    families: previous
      ? current.families.map((f) => (f.id === family.id ? family : f))
      : [...current.families, family],
  });
}
export function linkMember(
  memberId: string,
  familyId: string,
  role: string,
  useAddress: boolean,
): string | null {
  const current = getSnapshot();
  const family = current.families.find((f) => f.id === familyId);
  const member = current.members.find((m) => m.id === memberId);
  if (!family || !member) return "Kies een bestaand lid en gezin.";
  if (current.families.some((f) => f.contact === memberId && f.id !== familyId))
    return "Kies eerst een andere contactpersoon in het huidige gezin van dit lid.";
  return saveMember({
    ...member,
    familyId,
    role: memberId === family.contact ? "Contactpersoon" : role,
    ...(useAddress
      ? {
          address: family.address,
          postcode: family.postcode,
          city: family.city,
        }
      : {}),
  });
}
export function saveNote(note: Note) {
  const current = getSnapshot();
  return persist({
    ...current,
    notes: current.notes.some((n) => n.id === note.id)
      ? current.notes.map((n) => (n.id === note.id ? note : n))
      : [...current.notes, note],
  });
}
export function removeNote(id: string) {
  const current = getSnapshot();
  return persist({
    ...current,
    notes: current.notes.filter((n) => n.id !== id),
  });
}
export function saveCase(record: Case) {
  const current = getSnapshot();
  return persist({
    ...current,
    cases: current.cases.some((c) => c.id === record.id)
      ? current.cases.map((c) => (c.id === record.id ? record : c))
      : [...current.cases, record],
  });
}
export function saveDocument(document: Document) {
  const current = getSnapshot();
  if (
    current.documents.reduce((sum, d) => sum + d.size, 0) + document.size >
    2 * 1024 * 1024
  )
    return "De lokale documentopslag is beperkt tot 2 MB. Verwijder eerst een demodocument.";
  return persist({ ...current, documents: [...current.documents, document] });
}
export function removeDocument(id: string) {
  const current = getSnapshot();
  return persist({
    ...current,
    documents: current.documents.filter((d) => d.id !== id),
  });
}
export function nextMemberId() {
  return `L-${Math.max(...getSnapshot().members.map((m) => Number(m.id.slice(2)))) + 1}`;
}
export function nextFamilyId() {
  return `G-${String(Math.max(...getSnapshot().families.map((f) => Number(f.id.slice(2)))) + 1).padStart(3, "0")}`;
}
export function memberHref(id: string) {
  return examples.some((m) => m.id === id)
    ? `/leden/${id}`
    : `/leden/lokaal?id=${encodeURIComponent(id)}`;
}
export function familyHref(id: string) {
  return exampleFamilies.some((f) => f.id === id)
    ? `/gezinnen/${id}`
    : `/gezinnen/lokaal?id=${encodeURIComponent(id)}`;
}
