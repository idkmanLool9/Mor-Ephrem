"use client";
import { useSearchParams } from "next/navigation";
import { useMembers } from "@/lib/member-store";
import { MemberProfile } from "@/components/member-profile";
import Link from "next/link";
export function LocalProfile() {
  const id = useSearchParams().get("id");
  const member = useMembers().find((m) => m.id === id);
  return member ? (
    <MemberProfile member={member} />
  ) : (
    <div className="empty-state">
      <h1>Lokaal dossier niet beschikbaar</h1>
      <p>
        Dit dossier is alleen beschikbaar in de browser waarin het is
        aangemaakt.
      </p>
      <Link href="/leden">Terug naar het ledenregister</Link>
    </div>
  );
}
