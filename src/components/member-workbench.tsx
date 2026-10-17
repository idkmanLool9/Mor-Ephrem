"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Columns3,
  Bookmark,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownUp,
  Users,
  FolderOpen,
  House,
  PanelRightOpen,
} from "lucide-react";
import { fullName, date, type Member } from "@/lib/data";
import { matchesSearch } from "@/lib/search";
import {
  useMembers,
  useFamilies,
  memberHref,
  bulkUpdateMembers,
  type BulkField,
} from "@/lib/member-store";
import {
  useMemberWorkspace,
  memberColumns,
  saveColumns,
  saveSelection,
  deleteSelection,
  type ColumnId,
  type SavedSelection,
} from "@/lib/workspace-store";
import { Avatar, Status } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { MemberInspector, parishOf } from "@/components/member-inspector";
const fieldLabels: Record<BulkField, string> = {
  status: "Status",
  membershipType: "Type lidmaatschap",
  contactPreference: "Contactvoorkeur",
};
const fieldValues: Record<BulkField, string[]> = {
  status: ["Actief", "Inactief"],
  membershipType: ["Regulier", "Jeugdlid", "Gastlid", "Overig"],
  contactPreference: ["Geen voorkeur", "E-mail", "Telefoon"],
};
export function MemberWorkbench() {
  const members = useMembers(),
    families = useFamilies(),
    workspace = useMemberWorkspace();
  const [focusedId, setFocusedId] = useState<string | null>("L-1001");
  const [pageSize, setPageSize] = useState(10);
  const [parish, setParish] = useState("Alle parochies");
  const [query, setQuery] = useState(""),
    [city, setCity] = useState("Alle woonplaatsen"),
    [status, setStatus] = useState("Alle statussen"),
    [familyFilter, setFamilyFilter] = useState("Alle gezinnen"),
    [sort, setSort] = useState("id"),
    [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]),
    [active, setActive] = useState<SavedSelection | null>(null),
    [saving, setSaving] = useState(false),
    [bulk, setBulk] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  function clearPicked() {
    setSelected([]);
    setMessage("");
  }
  function reset() {
    setQuery("");
    setCity("Alle woonplaatsen");
    setStatus("Alle statussen");
    setFamilyFilter("Alle gezinnen");
    setParish("Alle parochies");
    setPage(1);
    clearPicked();
  }
  const compare = (a: Member, b: Member) =>
    sort === "name-desc"
      ? fullName(b).localeCompare(fullName(a), "nl")
      : sort === "id"
        ? a.id.localeCompare(b.id, "nl", { numeric: true })
        : sort === "city"
          ? a.city.localeCompare(b.city, "nl") ||
            fullName(a).localeCompare(fullName(b), "nl")
          : sort === "joined-desc"
            ? b.joined.localeCompare(a.joined)
            : sort === "status"
              ? a.status.localeCompare(b.status, "nl") ||
                fullName(a).localeCompare(fullName(b), "nl")
              : fullName(a).localeCompare(fullName(b), "nl");
  const rows = members
    .filter(
      (m) =>
        (!active || active.memberIds.includes(m.id)) &&
        matchesSearch(
          query,
          fullName(m),
          m.id,
          m.address,
          m.city,
          m.postcode,
          m.email,
          m.phone,
          m.preferredName,
          m.nationality,
          m.membershipType,
          ...(m.customFields ?? []).flatMap((f) => [f.label, f.value]),
        ) &&
        (city === "Alle woonplaatsen" || m.city === city) &&
        (status === "Alle statussen" || m.status === status) &&
        (familyFilter === "Alle gezinnen" || m.familyId === familyFilter) &&
        (parish === "Alle parochies" || parishOf(m) === parish),
    )
    .sort(compare);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize)),
    current = Math.min(page, pages),
    visible = rows.slice((current - 1) * pageSize, current * pageSize);
  const picked = selected.filter((id) => members.some((m) => m.id === id));
  const allPage =
    visible.length > 0 && visible.every((m) => picked.includes(m.id));
  const columns = memberColumns.filter((c) => workspace.columns.includes(c.id));
  const filtered =
    !!query ||
    city !== "Alle woonplaatsen" ||
    status !== "Alle statussen" ||
    familyFilter !== "Alle gezinnen" ||
    parish !== "Alle parochies";
  function applySaved(value: string) {
    const saved = workspace.selections.find((s) => s.id === value) ?? null;
    setActive(saved);
    reset();
    if (saved)
      setSelected(
        saved.memberIds.filter((id) => members.some((m) => m.id === id)),
      );
  }
  function value(m: Member, column: ColumnId) {
    if (column === "parish") return parishOf(m);
    if (column === "status") return <Status status={m.status} />;
    if (column === "family")
      return families.find((f) => f.id === m.familyId)?.name ?? m.familyId;
    if (column === "joined") return date(m.joined);
    if (column === "membershipType") return m.membershipType || "Regulier";
    return m[column];
  }
  function toggleColumn(column: ColumnId) {
    setError(
      saveColumns(
        workspace.columns.includes(column)
          ? workspace.columns.filter((c) => c !== column)
          : [...workspace.columns, column],
      ) ?? "",
    );
  }
  const focused = members.find((m) => m.id === focusedId);
  return (
    <div className={`members-layout ${focused ? "with-inspector" : ""}`}>
      <section className="card member-workbench">
        <div className="workbench-heading">
          <nav className="register-view-tabs" aria-label="Registeronderdelen">
            <span aria-current="page">
              <Users size={15} />
              Alle leden
            </span>
            <Link href="/dossiers">
              <FolderOpen size={15} />
              Gekoppelde dossiers
            </Link>
            <Link href="/gezinnen">
              <House size={15} />
              Gezinnen
            </Link>
          </nav>
          <div className="workbench-tools">
            {!focused && (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Ledenpaneel openen"
                onClick={() =>
                  setFocusedId(visible[0]?.id ?? members[0]?.id ?? null)
                }
              >
                <PanelRightOpen size={16} />
              </Button>
            )}
            <details className="column-picker">
              <summary>
                <Columns3 size={16} />
                Kolommen
                <span className="count-pill">
                  {workspace.columns.length + 1}
                </span>
              </summary>
              <div className="column-options">
                <strong>Zichtbare kolommen</strong>
                <label>
                  <input type="checkbox" checked disabled />
                  Naam (vast)
                </label>
                {memberColumns.map((c) => (
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      aria-label={`Kolom ${c.label}`}
                      checked={workspace.columns.includes(c.id)}
                      onChange={() => toggleColumn(c.id)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </details>
            <Button
              variant="outline"
              onClick={() => setSaving(true)}
              disabled={!picked.length}
            >
              <Bookmark size={16} />
              Selectie bewaren
            </Button>
          </div>
        </div>
        <div className="saved-selection-strip">
          <label>
            <Bookmark size={16} />
            Bewaarde selectie
            <select
              aria-label="Bewaarde selectie"
              value={active?.id ?? ""}
              onChange={(e) => applySaved(e.target.value)}
            >
              <option value="">Alle leden</option>
              {workspace.selections.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name} ({s.memberIds.length})
                </option>
              ))}
            </select>
          </label>
          {active ? (
            <>
              <span>Vaste groep: {active.memberIds.length} leden</span>
              <Button variant="ghost" size="sm" onClick={() => applySaved("")}>
                Selectie sluiten
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      `Bewaarde selectie ‘${active.name}’ verwijderen?`,
                    )
                  ) {
                    const problem = deleteSelection(active.id);
                    setError(problem ?? "");
                    if (!problem) applySaved("");
                  }
                }}
              >
                Bewaarde selectie verwijderen
              </Button>
            </>
          ) : (
            <span>Selecteer leden met de vakjes om een groep te bewaren.</span>
          )}
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="success-notice">
            {message}
          </p>
        )}
        <div className="register-tools">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Leden zoeken"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
                clearPicked();
              }}
              placeholder="Zoek op naam, lidnummer, woonplaats…"
            />
            {query && (
              <button
                aria-label="Zoekopdracht wissen"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                  clearPicked();
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            aria-label="Woonplaats"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
              clearPicked();
            }}
          >
            {[
              "Alle woonplaatsen",
              ...Array.from(new Set(members.map((m) => m.city))).sort(),
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Lidmaatschapsstatus"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
              clearPicked();
            }}
          >
            {["Alle statussen", "Actief", "Inactief"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Parochie"
            value={parish}
            onChange={(e) => {
              setParish(e.target.value);
              setPage(1);
              clearPicked();
            }}
          >
            {[
              "Alle parochies",
              ...Array.from(new Set(members.map(parishOf))).sort(),
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Gezinsfilter"
            value={familyFilter}
            onChange={(e) => {
              setFamilyFilter(e.target.value);
              setPage(1);
              clearPicked();
            }}
          >
            <option>Alle gezinnen</option>
            {families.map((f) => (
              <option value={f.id} key={f.id}>
                Familie {f.name} · {f.id}
              </option>
            ))}
          </select>
        </div>
        <div className="register-summary">
          <span aria-live="polite">
            <strong>{rows.length}</strong> leden gevonden
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
              <option value="name-desc">Naam (Z–A)</option>
              <option value="id">Nummer</option>
              <option value="city">Woonplaats</option>
              <option value="joined-desc">Lid sinds (nieuwste)</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>
        {!!picked.length && (
          <div className="bulk-toolbar">
            <span>
              <CheckSquare size={18} />
              <strong>{picked.length} leden geselecteerd</strong>
              <small>
                Ook geselecteerde leden op andere pagina’s tellen mee.
              </small>
            </span>
            <div className="heading-actions">
              {rows.some((m) => !picked.includes(m.id)) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(rows.map((m) => m.id))}
                >
                  Selecteer alle {rows.length} resultaten
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                Selectie wissen
              </Button>
              <Button size="sm" onClick={() => setBulk(true)}>
                Geselecteerde leden wijzigen
              </Button>
            </div>
          </div>
        )}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="selection-cell">
                  <input
                    type="checkbox"
                    aria-label="Selecteer deze pagina"
                    checked={allPage}
                    ref={(element) => {
                      if (element)
                        element.indeterminate =
                          !allPage &&
                          visible.some((m) => picked.includes(m.id));
                    }}
                    onChange={() =>
                      setSelected(
                        allPage
                          ? picked.filter(
                              (id) => !visible.some((m) => m.id === id),
                            )
                          : [
                              ...new Set([
                                ...picked,
                                ...visible.map((m) => m.id),
                              ]),
                            ],
                      )
                    }
                  />
                </th>
                <th
                  aria-sort={
                    sort === "name"
                      ? "ascending"
                      : sort === "name-desc"
                        ? "descending"
                        : "none"
                  }
                >
                  <button
                    className="sort-heading"
                    onClick={() => {
                      setSort(sort === "name" ? "name-desc" : "name");
                      setPage(1);
                    }}
                  >
                    Naam
                    <ArrowDownUp size={12} />
                  </button>
                </th>
                {columns.map((c) => (
                  <th
                    key={c.id}
                    aria-sort={
                      (c.id === "id" && sort === "id") ||
                      (c.id === "city" && sort === "city") ||
                      (c.id === "status" && sort === "status")
                        ? "ascending"
                        : c.id === "joined" && sort === "joined-desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    {(["id", "city", "joined", "status"] as string[]).includes(
                      c.id,
                    ) ? (
                      <button
                        className="sort-heading"
                        onClick={() => {
                          setSort(c.id === "joined" ? "joined-desc" : c.id);
                          setPage(1);
                        }}
                      >
                        {c.label}
                        <ArrowDownUp size={12} />
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
                <th>
                  <span className="sr-only">Profiel</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr
                  key={m.id}
                  className={[
                    picked.includes(m.id) ? "selected-row" : "",
                    focusedId === m.id ? "focused-member" : "",
                  ].join(" ")}
                >
                  <td className="selection-cell">
                    <input
                      type="checkbox"
                      aria-label={`Selecteer ${fullName(m)} ${m.id}`}
                      checked={picked.includes(m.id)}
                      onChange={() =>
                        setSelected(
                          picked.includes(m.id)
                            ? picked.filter((id) => id !== m.id)
                            : [...picked, m.id],
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="person-cell member-preview-trigger"
                      aria-label={`Toon profiel van ${fullName(m)}`}
                      aria-pressed={focusedId === m.id}
                      onClick={() => setFocusedId(m.id)}
                    >
                      <Avatar name={fullName(m)} />
                      <div>
                        <strong>{fullName(m)}</strong>
                      </div>
                    </button>
                  </td>
                  {columns.map((c) => (
                    <td key={c.id}>{value(m, c.id)}</td>
                  ))}
                  <td>
                    <Link
                      className="row-link"
                      aria-label={`Bekijk ${fullName(m)}`}
                      href={memberHref(m.id)}
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
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
            {picked.length > 0 && (
              <strong>
                {picked.length} van {members.length} geselecteerd ·{" "}
              </strong>
            )}
            {rows.length
              ? `${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, rows.length)} van ${rows.length}`
              : "0 resultaten"}
          </span>
          <div className="heading-actions">
            <Button
              variant="outline"
              size="sm"
              aria-label="Vorige pagina"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: pages }, (_, index) => (
              <Button
                key={index}
                size="sm"
                variant={current === index + 1 ? "default" : "ghost"}
                aria-label={`Pagina ${index + 1}`}
                aria-current={current === index + 1 ? "page" : undefined}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
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
            <select
              aria-label="Leden per pagina"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per pagina
                </option>
              ))}
            </select>
          </div>
        </div>
        {saving && (
          <Modal title="Selectie bewaren" onClose={() => setSaving(false)}>
            <SaveSelectionForm ids={picked} onClose={() => setSaving(false)} />
          </Modal>
        )}
        {bulk && (
          <Modal
            title="Geselecteerde leden wijzigen"
            onClose={() => setBulk(false)}
          >
            <BulkForm
              ids={picked}
              onCancel={() => setBulk(false)}
              onSaved={(count) => {
                setBulk(false);
                setSelected([]);
                setMessage(
                  `${count} leden bijgewerkt. De wijziging is lokaal opgeslagen.`,
                );
              }}
            />
          </Modal>
        )}
      </section>
      {focused && (
        <MemberInspector
          key={focused.id}
          member={focused}
          onClose={() => setFocusedId(null)}
        />
      )}
    </div>
  );
}
function SaveSelectionForm({
  ids,
  onClose,
}: {
  ids: string[];
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="member-form"
      onSubmit={(event) => {
        event.preventDefault();
        const name = String(
          new FormData(event.currentTarget).get("name") ?? "",
        ).trim();
        if (!name) {
          setError("Geef de selectie een naam.");
          return;
        }
        const problem = saveSelection({
          id: crypto.randomUUID(),
          name,
          memberIds: ids,
          createdAt: new Date().toISOString(),
        });
        if (problem) setError(problem);
        else onClose();
      }}
    >
      <p className="form-notice">
        Bewaar deze vaste groep van {ids.length} leden. Latere wijzigingen in de
        zoekfilters veranderen de groep niet.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-grid form-grid-single">
        <label>
          Naam van selectie
          <input
            name="name"
            required
            maxLength={60}
            placeholder="Bijvoorbeeld: Contactgroep Oldenzaal"
          />
        </label>
      </div>
      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuleren
        </Button>
        <Button type="submit">Selectie opslaan</Button>
      </div>
    </form>
  );
}
function BulkForm({
  ids,
  onCancel,
  onSaved,
}: {
  ids: string[];
  onCancel: () => void;
  onSaved: (count: number) => void;
}) {
  const members = useMembers();
  const [field, setField] = useState<BulkField>("status"),
    [value, setValue] = useState("Actief"),
    [review, setReview] = useState<{
      before: Member[];
      field: BulkField;
      value: string;
    } | null>(null),
    [error, setError] = useState("");
  const selected = members.filter((m) => ids.includes(m.id));
  return (
    <form
      className="member-form"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        if (!review) {
          if (!selected.length) {
            setError("Selecteer eerst leden.");
            return;
          }
          setReview({ before: selected.map((m) => ({ ...m })), field, value });
          return;
        }
        const problem = bulkUpdateMembers(
          ids,
          review.field,
          review.value,
          review.before,
        );
        if (problem) setError(problem);
        else onSaved(ids.length);
      }}
    >
      <p className="form-notice">
        {review
          ? "Controleer de onderstaande leden en waarden. Er wordt pas opgeslagen nadat u de wijziging bevestigt."
          : "Kies één administratief veld. Gezinskoppelingen en adressen worden hier niet aangepast."}
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!review ? (
        <div className="form-grid">
          <label>
            Te wijzigen veld
            <select
              aria-label="Te wijzigen veld"
              value={field}
              onChange={(event) => {
                const next = event.target.value as BulkField;
                setField(next);
                setValue(fieldValues[next][0]);
              }}
            >
              {Object.entries(fieldLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nieuwe waarde
            <select
              aria-label="Nieuwe waarde"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            >
              {fieldValues[field].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <>
          <h3 className="review-title">
            Controle: {review.before.length} leden · {fieldLabels[review.field]}
          </h3>
          <div className="table-scroll bulk-review">
            <table>
              <thead>
                <tr>
                  <th>Lid</th>
                  <th>Huidige waarde</th>
                  <th>Nieuwe waarde</th>
                </tr>
              </thead>
              <tbody>
                {review.before.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {fullName(m)}
                      <small className="review-id">{m.id}</small>
                    </td>
                    <td>
                      {m[review.field] ||
                        (review.field === "membershipType"
                          ? "Regulier"
                          : "Geen voorkeur")}
                    </td>
                    <td>
                      <strong>{review.value}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onCancel}>
          Annuleren
        </Button>
        {review && (
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setReview(null);
              setError("");
            }}
          >
            Terug
          </Button>
        )}
        <Button type="submit">
          {review
            ? `Bevestigen en toepassen (${review.before.length})`
            : "Wijziging controleren"}
        </Button>
      </div>
    </form>
  );
}
