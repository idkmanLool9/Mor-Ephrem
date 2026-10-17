"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Plus,
  ArrowUpRight,
  Eye,
  Download,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
  House,
} from "lucide-react";
import {
  useAdministration,
  removeDocument,
  ensureWorkspaceExamples,
  memberHref,
  familyHref,
  caseStatuses,
  type Scope,
  type Case,
  type Document as StoredDocument,
} from "@/lib/member-store";
import { fullName, date } from "@/lib/data";
import { matchesSearch } from "@/lib/search";
import { PageHeading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { RecordToolbar } from "@/components/record-toolbar";
import { Modal } from "@/components/modal";
import {
  CaseForm,
  DocumentForm,
  DocumentMetadataForm,
} from "@/components/record-panels";
import {
  DocumentPreview,
  downloadDocument,
} from "@/components/document-preview";
export function CentralWorkspace({ kind }: { kind: "cases" | "documents" }) {
  const data = useAdministration();
  const cases = kind === "cases";
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("Alle statussen"),
    [category, setCategory] = useState("Alle categorieën"),
    [ownerType, setOwnerType] = useState("all"),
    [owner, setOwner] = useState("all"),
    [fileType, setFileType] = useState("all"),
    [sort, setSort] = useState("newest"),
    [page, setPage] = useState(1);
  const [sampleError, setSampleError] = useState(""),
    [creating, setCreating] = useState(false),
    [createScope, setCreateScope] = useState<Scope | null>(null),
    [editCase, setEditCase] = useState<Case | null>(null),
    [editDoc, setEditDoc] = useState<StoredDocument | null>(null),
    [preview, setPreview] = useState<StoredDocument | null>(null);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const problem = ensureWorkspaceExamples();
      if (problem) setSampleError(problem);
    });
    return () => {
      active = false;
    };
  }, []);
  const owners = [
    ...data.members.map((m) => ({
      scope: { kind: "member" as const, id: m.id },
      name: fullName(m),
    })),
    ...data.families.map((f) => ({
      scope: { kind: "family" as const, id: f.id },
      name: `Familie ${f.name}`,
    })),
  ];
  const ownerName = (scope: Scope) =>
    owners.find((o) => o.scope.kind === scope.kind && o.scope.id === scope.id)
      ?.name ?? scope.id;
  const ownerLink = (scope: Scope) =>
    scope.kind === "member" ? memberHref(scope.id) : familyHref(scope.id);
  const records = cases
    ? data.cases.map((c) => ({
        id: c.id,
        scope: c.scope,
        title: c.title,
        description: c.description,
        category: c.category,
        status: c.status,
        date: c.updatedAt,
        caseName: "",
        mime: "",
        size: 0,
      }))
    : data.documents.map((d) => ({
        id: d.id,
        scope: d.scope,
        title: d.name,
        description: d.description,
        category: d.category,
        status: "",
        date: d.createdAt,
        caseName: data.cases.find((c) => c.id === d.caseId)?.title ?? "",
        mime: d.mime,
        size: d.size,
      }));
  const visible = records
    .filter(
      (r) =>
        matchesSearch(
          query,
          r.title,
          r.description,
          r.category,
          ownerName(r.scope),
          r.scope.id,
          r.caseName,
        ) &&
        (status === "Alle statussen" || r.status === status) &&
        (category === "Alle categorieën" || r.category === category) &&
        (ownerType === "all" || ownerType === r.scope.kind) &&
        (owner === "all" || owner === `${r.scope.kind}:${r.scope.id}`) &&
        (fileType === "all" ||
          (fileType === "pdf"
            ? r.mime === "application/pdf"
            : fileType === "linked"
              ? !!r.caseName
              : r.mime.startsWith("image/"))),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title, "nl")
        : sort === "oldest"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date),
    );
  const pages = Math.max(1, Math.ceil(visible.length / 8));
  const current = Math.min(page, pages);
  const filtered =
    !!query ||
    status !== "Alle statussen" ||
    category !== "Alle categorieën" ||
    ownerType !== "all" ||
    owner !== "all" ||
    fileType !== "all" ||
    sort !== "newest";
  function reset() {
    setQuery("");
    setStatus("Alle statussen");
    setCategory("Alle categorieën");
    setOwnerType("all");
    setOwner("all");
    setFileType("all");
    setSort("newest");
    setPage(1);
  }
  return (
    <>
      <PageHeading
        eyebrow="CENTRALE WERKRUIMTE"
        title={cases ? "Dossiers" : "Documenten"}
        description={
          cases
            ? "Alle lopende en afgeronde dossiers van leden en gezinnen op één plek."
            : "Doorzoek alle lokale documenten, bekijk bestanden en open de gekoppelde dossiers."
        }
      >
        <Button
          onClick={() => {
            setCreating(true);
            setCreateScope(null);
          }}
        >
          <Plus size={16} />
          {cases ? "Nieuw dossier" : "Document toevoegen"}
        </Button>
      </PageHeading>
      <div className="workspace-summary">
        {(cases
          ? [
              {
                label: "Alle dossiers",
                value: data.cases.length,
                icon: FolderOpen,
                action: () => setStatus("Alle statussen"),
              },
              ...caseStatuses.map((s) => ({
                label: s,
                value: data.cases.filter((c) => c.status === s).length,
                icon: FolderOpen,
                action: () => setStatus(s),
              })),
            ]
          : [
              {
                label: "Alle documenten",
                value: data.documents.length,
                icon: FileText,
                action: () => setFileType("all"),
              },
              {
                label: "PDF-bestanden",
                value: data.documents.filter(
                  (d) => d.mime === "application/pdf",
                ).length,
                icon: FileText,
                action: () => setFileType("pdf"),
              },
              {
                label: "Afbeeldingen",
                value: data.documents.filter((d) => d.mime.startsWith("image/"))
                  .length,
                icon: Eye,
                action: () => setFileType("images"),
              },
              {
                label: "Gekoppelde dossiers",
                value: new Set(
                  data.documents.filter((d) => d.caseId).map((d) => d.caseId),
                ).size,
                icon: FolderOpen,
                action: () => setFileType("linked"),
              },
            ]
        ).map(({ label, value, icon: Icon, action }) => (
          <button
            key={label}
            className="workspace-stat"
            onClick={() => {
              action();
              setPage(1);
            }}
          >
            <span>
              <Icon size={18} />
              {label}
            </span>
            <strong>{value}</strong>
          </button>
        ))}
      </div>
      <p className="workspace-demo-note">
        Nieuw: dit overzicht bevat een herkenbare fictieve voorbeeldset. Uw
        bestaande dossiers en documenten blijven behouden; voorbeelden worden
        eenmalig toegevoegd.
      </p>
      {sampleError && (
        <p className="form-error" role="alert">
          {sampleError}
        </p>
      )}
      <section className="card">
        <RecordToolbar
          label={cases ? "Alle dossiers zoeken" : "Alle documenten zoeken"}
          query={query}
          onQuery={(value) => {
            setQuery(value);
            setPage(1);
          }}
          count={visible.length}
          filtered={filtered}
          onReset={reset}
        >
          <select
            aria-label="Soort eigenaar"
            value={ownerType}
            onChange={(e) => {
              setOwnerType(e.target.value);
              setOwner("all");
              setPage(1);
            }}
          >
            <option value="all">Leden en gezinnen</option>
            <option value="member">Alleen leden</option>
            <option value="family">Alleen gezinnen</option>
          </select>
          <select
            aria-label="Eigenaarfilter"
            value={owner}
            onChange={(e) => {
              setOwner(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Alle eigenaren</option>
            {owners
              .filter((o) => ownerType === "all" || o.scope.kind === ownerType)
              .map((o) => (
                <option
                  key={`${o.scope.kind}:${o.scope.id}`}
                  value={`${o.scope.kind}:${o.scope.id}`}
                >
                  {o.name} · {o.scope.id}
                </option>
              ))}
          </select>
          <select
            aria-label="Centrale categoriefilter"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            {[
              "Alle categorieën",
              ...Array.from(new Set(records.map((r) => r.category))).sort(),
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {cases ? (
            <select
              aria-label="Centrale dossierstatus"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {["Alle statussen", ...caseStatuses].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ) : (
            <select
              aria-label="Bestandstype"
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Alle bestandstypen</option>
              <option value="pdf">PDF</option>
              <option value="images">Afbeeldingen</option>
              <option value="linked">Met dossierkoppeling</option>
            </select>
          )}
          <select
            aria-label="Centrale sortering"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Nieuwste eerst</option>
            <option value="oldest">Oudste eerst</option>
            <option value="name">Naam (A–Z)</option>
          </select>
        </RecordToolbar>
        <div className="table-scroll">
          <table className="central-table">
            <thead>
              <tr>
                <th>{cases ? "Dossier" : "Document"}</th>
                <th>Eigenaar</th>
                <th>Categorie</th>
                <th>{cases ? "Status" : "Dossierkoppeling"}</th>
                <th>Datum</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {visible.slice((current - 1) * 8, current * 8).map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="central-title">
                      <span className="record-icon">
                        {cases ? (
                          <FolderOpen size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </span>
                      <div>
                        <strong>{r.title}</strong>
                        <small>
                          {cases
                            ? r.description
                            : `${r.mime === "application/pdf" ? "PDF" : "Afbeelding"} · ${Math.max(1, Math.round(r.size / 1024))} KB`}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Link className="owner-link" href={ownerLink(r.scope)}>
                      {r.scope.kind === "member" ? (
                        <Users size={14} />
                      ) : (
                        <House size={14} />
                      )}
                      <span>
                        {ownerName(r.scope)}
                        <small>{r.scope.id}</small>
                      </span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>
                  <td>{r.category}</td>
                  <td>
                    {cases ? (
                      <span
                        className={`case-status case-status-${r.status === "Afgerond" ? "done" : r.status === "Open" ? "open" : "pending"}`}
                      >
                        {r.status}
                      </span>
                    ) : (
                      r.caseName || "Geen dossier"
                    )}
                  </td>
                  <td>{date(r.date)}</td>
                  <td>
                    <div className="central-actions">
                      {cases ? (
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Dossier openen: ${r.title}`}
                          onClick={() =>
                            setEditCase(data.cases.find((c) => c.id === r.id)!)
                          }
                        >
                          Openen
                          <ArrowUpRight size={14} />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Voorbeeld van ${r.title}`}
                            onClick={() =>
                              setPreview(
                                data.documents.find((d) => d.id === r.id)!,
                              )
                            }
                          >
                            <Eye size={15} />
                            Bekijken
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Download ${r.title}`}
                            onClick={() =>
                              downloadDocument(
                                data.documents.find((d) => d.id === r.id)!,
                              )
                            }
                          >
                            <Download size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Documentgegevens bewerken: ${r.title}`}
                            onClick={() =>
                              setEditDoc(
                                data.documents.find((d) => d.id === r.id)!,
                              )
                            }
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Document verwijderen: ${r.title}`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Demodocument ‘${r.title}’ definitief verwijderen?`,
                                )
                              )
                                setSampleError(removeDocument(r.id) ?? "");
                            }}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && (
          <div className="empty-state">
            <FolderOpen size={28} />
            <h2>Geen resultaten gevonden</h2>
            <p>Pas de zoekopdracht aan of wis de filters.</p>
            <Button variant="outline" onClick={reset}>
              Filters wissen
            </Button>
          </div>
        )}
        <div className="pagination">
          <span>
            {visible.length
              ? `${(current - 1) * 8 + 1}–${Math.min(current * 8, visible.length)} van ${visible.length}`
              : "0 resultaten"}
          </span>
          <div className="heading-actions">
            <Button
              size="sm"
              variant="outline"
              aria-label="Vorige pagina"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span>
              Pagina {current} van {pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              aria-label="Volgende pagina"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </section>
      <p className="page-note">
        Lokale demonstratie · uitsluitend fictieve gegevens · klik op een
        eigenaar om het leden- of gezinsprofiel te openen.
      </p>
      {editCase && (
        <Modal
          title="Dossier bekijken en bewerken"
          onClose={() => setEditCase(null)}
        >
          <CaseForm
            scope={editCase.scope}
            record={editCase}
            onClose={() => setEditCase(null)}
          />
        </Modal>
      )}
      {editDoc && (
        <Modal
          title="Documentgegevens bewerken"
          onClose={() => setEditDoc(null)}
        >
          <DocumentMetadataForm
            record={editDoc}
            onClose={() => setEditDoc(null)}
          />
        </Modal>
      )}
      {preview && (
        <DocumentPreview record={preview} onClose={() => setPreview(null)} />
      )}
      {creating && (
        <Modal
          title={cases ? "Nieuw centraal dossier" : "Document toevoegen"}
          onClose={() => setCreating(false)}
        >
          {createScope ? (
            cases ? (
              <CaseForm
                scope={createScope}
                onClose={() => setCreating(false)}
              />
            ) : (
              <DocumentForm
                scope={createScope}
                onClose={() => setCreating(false)}
              />
            )
          ) : (
            <form
              className="member-form"
              onSubmit={(event) => {
                event.preventDefault();
                const value = String(
                  new FormData(event.currentTarget).get("owner"),
                );
                const chosen = owners.find(
                  (o) => `${o.scope.kind}:${o.scope.id}` === value,
                );
                if (chosen) setCreateScope(chosen.scope);
              }}
            >
              <p className="form-notice">
                Kies eerst bij welk lid of gezin dit{" "}
                {cases ? "dossier" : "document"} hoort.
              </p>
              <div className="form-grid form-grid-single">
                <label>
                  Eigenaar
                  <select
                    name="owner"
                    aria-label="Nieuwe eigenaar"
                    required
                    defaultValue=""
                  >
                    <option value="">Kies een lid of gezin</option>
                    {owners.map((o) => (
                      <option
                        key={`${o.scope.kind}:${o.scope.id}`}
                        value={`${o.scope.kind}:${o.scope.id}`}
                      >
                        {o.name} · {o.scope.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreating(false)}
                >
                  Annuleren
                </Button>
                <Button type="submit">Verder</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
