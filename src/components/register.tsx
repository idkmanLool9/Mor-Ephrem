"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Users,
  X,
} from "lucide-react";
import { matchesSearch } from "@/lib/search";
import { fullName } from "@/lib/data";
import { Avatar, Status } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  useMembers,
  useFamilies,
  memberHref,
  familyHref,
} from "@/lib/member-store";
const PAGE_SIZE = 8;
export function Register({ kind }: { kind: "leden" | "gezinnen" }) {
  const members = useMembers();
  const families = useFamilies();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Alle woonplaatsen");
  const [status, setStatus] = useState("Alle statussen");
  const [page, setPage] = useState(1);
  const [familyFilter, setFamilyFilter] = useState("Alle gezinnen");
  const [sort, setSort] = useState("name");
  const isMembers = kind === "leden";
  const rows = (
    isMembers
      ? members.map((m) => ({
          id: m.id,
          name: fullName(m),
          city: m.city,
          address: m.address,
          status: m.status,
          email: m.email,
          count: 0,
          familyId: m.familyId,
          search: [
            m.postcode,
            m.phone,
            m.preferredName,
            m.nationality,
            m.membershipType,
            ...(m.customFields ?? []).flatMap((f) => [f.label, f.value]),
          ].join(" "),
        }))
      : families.map((f) => ({
          id: f.id,
          name: `Familie ${f.name}`,
          city: f.city,
          address: f.address,
          status: "",
          email: "",
          count: members.filter((m) => m.familyId === f.id).length,
          familyId: f.id,
          search: [
            f.postcode,
            ...members
              .filter((m) => m.familyId === f.id)
              .flatMap((m) => [fullName(m), m.id, m.email]),
          ].join(" "),
        }))
  )
    .filter(
      (r) =>
        matchesSearch(
          query,
          r.name,
          r.id,
          r.address,
          r.city,
          r.email,
          r.search,
        ) &&
        (!isMembers ||
          familyFilter === "Alle gezinnen" ||
          familyFilter === r.familyId) &&
        (city === "Alle woonplaatsen" || city === r.city) &&
        (!isMembers || status === "Alle statussen" || status === r.status),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "nl")
        : a.id.localeCompare(b.id),
    );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const filtered =
    query ||
    city !== "Alle woonplaatsen" ||
    status !== "Alle statussen" ||
    familyFilter !== "Alle gezinnen";
  function reset() {
    setQuery("");
    setCity("Alle woonplaatsen");
    setStatus("Alle statussen");
    setFamilyFilter("Alle gezinnen");
    setPage(1);
  }
  return (
    <section className="card">
      <div className="register-tools">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label={isMembers ? "Leden zoeken" : "Gezinnen zoeken"}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={
              isMembers
                ? "Zoek op naam, lidnummer, adres of e-mail…"
                : "Zoek op gezin, gezinslid, nummer of adres…"
            }
          />
          {query && (
            <button
              aria-label="Zoekopdracht wissen"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <SlidersHorizontal size={17} className="text-slate-400 filter-icon" />
        <select
          aria-label="Woonplaats"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
        >
          {[
            "Alle woonplaatsen",
            ...Array.from(
              new Set((isMembers ? members : families).map((m) => m.city)),
            ).sort(),
          ].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        {isMembers && (
          <select
            aria-label="Lidmaatschapsstatus"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {["Alle statussen", "Actief", "Inactief"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        )}
        {isMembers && (
          <select
            aria-label="Gezinsfilter"
            value={familyFilter}
            onChange={(event) => {
              setFamilyFilter(event.target.value);
              setPage(1);
            }}
          >
            <option>Alle gezinnen</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                Familie {f.name} · {f.id}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="register-summary">
        <span aria-live="polite">
          <strong>{rows.length}</strong> {isMembers ? "leden" : "gezinnen"}{" "}
          gevonden
          {filtered && (
            <button className="reset" onClick={reset}>
              Filters wissen
            </button>
          )}
        </span>
        <label>
          Sorteer op{" "}
          <select
            aria-label="Sortering"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="name">Naam (A–Z)</option>
            <option value="id">Nummer</option>
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{isMembers ? "Naam" : "Gezin"}</th>
              <th>{isMembers ? "Lidnummer" : "Gezinsnummer"}</th>
              <th>Adres</th>
              <th>Woonplaats</th>
              <th>{isMembers ? "Status" : "Gezinsleden"}</th>
              <th>
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows
              .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
              .map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link
                      className="person-cell"
                      href={isMembers ? memberHref(r.id) : familyHref(r.id)}
                    >
                      <Avatar name={r.name} />
                      <div>
                        <strong>{r.name}</strong>
                        <small>
                          {isMembers ? r.email : "Gekoppeld gezinsdossier"}
                        </small>
                      </div>
                    </Link>
                  </td>
                  <td className="tabular-nums">{r.id}</td>
                  <td>{r.address}</td>
                  <td>{r.city}</td>
                  <td>
                    {isMembers ? (
                      <Status status={r.status} />
                    ) : (
                      <span className="flex items-center gap-2">
                        <Users size={15} className="text-slate-400" />
                        {r.count} leden
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      className="row-link"
                      aria-label={`Bekijk ${r.name}`}
                      href={isMembers ? memberHref(r.id) : familyHref(r.id)}
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="empty-state">
          <Search size={28} />
          <h2>Geen resultaten gevonden</h2>
          <p>Probeer een andere zoekopdracht of wis de filters.</p>
          <Button variant="outline" onClick={reset}>
            Filters wissen
          </Button>
        </div>
      )}
      <div className="pagination">
        <span>
          {rows.length
            ? `${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, rows.length)} van ${rows.length}`
            : "0 resultaten"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Vorige pagina"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          {Array.from({ length: pages }, (_, i) => (
            <Button
              key={i}
              size="sm"
              variant={current === i + 1 ? "default" : "ghost"}
              aria-label={`Pagina ${i + 1}`}
              aria-current={current === i + 1 ? "page" : undefined}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            aria-label="Volgende pagina"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
