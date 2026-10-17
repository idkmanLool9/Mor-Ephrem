"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFamilies } from "@/lib/member-store";
import { FamilyProfile } from "@/components/family-profile";
export function LocalFamily() {
  const id = useSearchParams().get("id");
  const family = useFamilies().find((f) => f.id === id);
  return family ? (
    <FamilyProfile family={family} />
  ) : (
    <div className="empty-state">
      <h1>Lokaal gezinsdossier niet beschikbaar</h1>
      <p>
        Dit dossier is alleen beschikbaar in de browser waarin het is
        aangemaakt.
      </p>
      <Link href="/gezinnen">Naar het gezinsregister</Link>
    </div>
  );
}
