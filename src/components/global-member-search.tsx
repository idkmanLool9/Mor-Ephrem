"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMembers, memberHref } from "@/lib/member-store";
import { matchesSearch } from "@/lib/search";
import { fullName } from "@/lib/data";
export function GlobalMemberSearch() {
  const members = useMembers();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = query.trim()
    ? members
        .filter((m) =>
          matchesSearch(query, fullName(m), m.address, m.city, m.id),
        )
        .slice(0, 5)
    : [];
  return (
    <form
      className="global-member-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (results[0]) {
          setOpen(false);
          router.push(memberHref(results[0].id));
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search size={15} />
      <input
        aria-label="Zoek in de administratie"
        placeholder="Zoek leden, adressen, woonplaats, lidnummer…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {query && (
        <button
          type="button"
          aria-label="Algemene zoekopdracht wissen"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
        >
          <X size={13} />
        </button>
      )}
      {open && query.trim() && (
        <div className="global-search-results" aria-label="Gevonden leden">
          {results.length ? (
            results.map((m) => (
              <Link
                key={m.id}
                href={memberHref(m.id)}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                <strong>{fullName(m)}</strong>
                <span>
                  {m.id} · {m.city}
                </span>
              </Link>
            ))
          ) : (
            <p>Geen leden gevonden.</p>
          )}
        </div>
      )}
    </form>
  );
}
