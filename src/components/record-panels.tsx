"use client";
import { useState } from "react";
import {
  Plus,
  StickyNote,
  FolderOpen,
  FileText,
  Pencil,
  Download,
  Trash2,
  Upload,
  Eye,
} from "lucide-react";
import {
  useAdministration,
  sameScope,
  type Scope,
  type Note,
  type Case,
  type Document as StoredDocument,
  saveNote,
  removeNote,
  saveCase,
  saveDocument,
  removeDocument,
  caseStatuses,
} from "@/lib/member-store";
import { Button } from "@/components/ui/button";
import { matchesSearch } from "@/lib/search";
import { RecordToolbar } from "@/components/record-toolbar";
import {
  DocumentPreview,
  downloadDocument,
} from "@/components/document-preview";
import { Modal } from "@/components/modal";
const timestamp = (value: string) =>
  new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p className="form-error" role="alert">
      {message}
    </p>
  ) : null;
}
function Empty({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon}
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
export function NotesPanel({ scope }: { scope: Scope }) {
  const allNotes = useAdministration()
    .notes.filter((n) => sameScope(n.scope, scope))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const [query, setQuery] = useState("");
  const notes = allNotes.filter((n) => matchesSearch(query, n.title, n.body));
  const [edit, setEdit] = useState<Note | "new" | null>(null);
  const [error, setError] = useState("");
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>
            Notities <span className="count-pill">{allNotes.length}</span>
          </h2>
          <p className="section-description">
            Aantekeningen bij dit dossier · alleen in deze browser
          </p>
        </div>
        <Button size="sm" onClick={() => setEdit("new")}>
          <Plus size={15} />
          Notitie toevoegen
        </Button>
      </div>
      <RecordToolbar
        label="Notities zoeken"
        query={query}
        onQuery={setQuery}
        count={notes.length}
        filtered={!!query}
        onReset={() => setQuery("")}
      />
      <ErrorMessage message={error} />
      {notes.length ? (
        <div className="record-list">
          {notes.map((n) => (
            <article className="note-card" key={n.id}>
              <div className="record-title">
                <span className="record-icon">
                  <StickyNote size={18} />
                </span>
                <div>
                  <h3>{n.title}</h3>
                  <small>Bijgewerkt {timestamp(n.updatedAt)}</small>
                </div>
                <div className="record-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Notitie bewerken: ${n.title}`}
                    onClick={() => setEdit(n)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Notitie verwijderen: ${n.title}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Notitie ‘${n.title}’ definitief verwijderen?`,
                        )
                      ) {
                        setError(removeNote(n.id) ?? "");
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className="record-body">{n.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={
            allNotes.length ? "Geen notities gevonden" : "Nog geen notities"
          }
          description="Leg afspraken of administratieve aandachtspunten vast."
          icon={<StickyNote size={28} />}
        />
      )}
      {edit && (
        <Modal
          title={edit === "new" ? "Notitie toevoegen" : "Notitie bewerken"}
          onClose={() => setEdit(null)}
        >
          <NoteForm
            scope={scope}
            note={edit === "new" ? undefined : edit}
            onClose={() => setEdit(null)}
          />
        </Modal>
      )}
    </section>
  );
}
function NoteForm({
  scope,
  note,
  onClose,
}: {
  scope: Scope;
  note?: Note;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="member-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const title = String(data.get("title") ?? "").trim(),
          body = String(data.get("body") ?? "").trim();
        if (!title || !body) {
          setError("Vul een titel en notitietekst in.");
          return;
        }
        const now = new Date().toISOString();
        const problem = saveNote({
          id: note?.id ?? crypto.randomUUID(),
          scope,
          title,
          body,
          createdAt: note?.createdAt ?? now,
          updatedAt: now,
        });
        if (problem) setError(problem);
        else onClose();
      }}
    >
      <ErrorMessage message={error} />
      <div className="form-grid form-grid-single">
        <label>
          Titel
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={note?.title}
          />
        </label>
        <label>
          Notitietekst
          <textarea
            aria-label="Notitietekst"
            name="body"
            required
            maxLength={10000}
            rows={7}
            defaultValue={note?.body}
          />
        </label>
      </div>
      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onClose}>
          Annuleren
        </Button>
        <Button type="submit">Notitie opslaan</Button>
      </div>
    </form>
  );
}
export function CasesPanel({ scope }: { scope: Scope }) {
  const records = useAdministration()
    .cases.filter((c) => sameScope(c.scope, scope))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Alle categorieën");
  const [edit, setEdit] = useState<Case | "new" | null>(null);
  const [filter, setFilter] = useState("Alle statussen");
  const visible = records.filter(
    (c) =>
      (filter === "Alle statussen" || c.status === filter) &&
      (category === "Alle categorieën" || category === c.category) &&
      matchesSearch(query, c.title, c.description, c.category),
  );
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>
            Dossiers <span className="count-pill">{records.length}</span>
          </h2>
          <p className="section-description">
            Volg een administratieve vraag van opening tot afronding
          </p>
        </div>
        <Button size="sm" onClick={() => setEdit("new")}>
          <Plus size={15} />
          Dossier openen
        </Button>
      </div>
      <RecordToolbar
        label="Dossiers zoeken"
        query={query}
        onQuery={setQuery}
        count={visible.length}
        filtered={
          !!query ||
          filter !== "Alle statussen" ||
          category !== "Alle categorieën"
        }
        onReset={() => {
          setQuery("");
          setFilter("Alle statussen");
          setCategory("Alle categorieën");
        }}
      >
        <select
          aria-label="Dossierstatusfilter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          {["Alle statussen", ...caseStatuses].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Dossiercategoriefilter"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {[
            "Alle categorieën",
            "Algemeen",
            "Inschrijving",
            "Adreswijziging",
            "Lidmaatschap",
            "Correspondentie",
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </RecordToolbar>
      {visible.length ? (
        <div className="record-list">
          {visible.map((c) => (
            <article className="case-card" key={c.id}>
              <div className="record-title">
                <span className="record-icon">
                  <FolderOpen size={19} />
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <small>
                    {c.category} · {timestamp(c.updatedAt)}
                  </small>
                </div>
                <span
                  className={`case-status case-status-${c.status === "Afgerond" ? "done" : c.status === "Open" ? "open" : "pending"}`}
                >
                  {c.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEdit(c)}
                  aria-label={`Dossier bekijken: ${c.title}`}
                >
                  Bekijken
                </Button>
              </div>
              <p className="record-body">{c.description}</p>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={
            records.length
              ? query || category !== "Alle categorieën"
                ? "Geen dossiers gevonden"
                : "Geen dossiers met deze status"
              : "Nog geen dossiers"
          }
          description="Open een dossier om een administratieve vraag bij te houden."
          icon={<FolderOpen size={28} />}
        />
      )}
      {edit && (
        <Modal
          title={
            edit === "new" ? "Dossier openen" : "Dossier bekijken en bewerken"
          }
          onClose={() => setEdit(null)}
        >
          <CaseForm
            scope={scope}
            record={edit === "new" ? undefined : edit}
            onClose={() => setEdit(null)}
          />
        </Modal>
      )}
    </section>
  );
}
export function CaseForm({
  scope,
  record,
  onClose,
}: {
  scope: Scope;
  record?: Case;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const documents = useAdministration().documents.filter(
    (d) => d.caseId === record?.id && sameScope(d.scope, scope),
  );
  return (
    <form
      className="member-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const title = String(data.get("title") ?? "").trim(),
          description = String(data.get("description") ?? "").trim();
        if (!title || !description) {
          setError("Vul een titel en omschrijving in.");
          return;
        }
        const status = String(data.get("status")) as Case["status"];
        const now = new Date().toISOString();
        const problem = saveCase({
          id: record?.id ?? crypto.randomUUID(),
          scope,
          title,
          description,
          status,
          category: String(data.get("category")),
          createdAt: record?.createdAt ?? now,
          updatedAt: now,
        });
        if (problem) setError(problem);
        else onClose();
      }}
    >
      <ErrorMessage message={error} />
      <div className="form-grid">
        <label className="form-span">
          Dossiertitel
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={record?.title}
          />
        </label>
        <label>
          Categorie
          <select
            name="category"
            aria-label="Dossiercategorie"
            defaultValue={record?.category ?? "Algemeen"}
          >
            {[
              "Algemeen",
              "Inschrijving",
              "Adreswijziging",
              "Lidmaatschap",
              "Correspondentie",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            name="status"
            aria-label="Dossierstatus"
            defaultValue={record?.status ?? "Open"}
          >
            {caseStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="form-span">
          Omschrijving
          <textarea
            aria-label="Omschrijving"
            name="description"
            required
            maxLength={10000}
            rows={6}
            defaultValue={record?.description}
          />
        </label>
      </div>
      {record && (
        <div className="linked-documents">
          <h3>Gekoppelde documenten ({documents.length})</h3>
          {documents.length ? (
            documents.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => downloadDocument(d)}
              >
                <FileText size={16} />
                {d.name}
                <Download size={15} />
              </button>
            ))
          ) : (
            <p>Koppel documenten via het tabblad Documenten.</p>
          )}
        </div>
      )}
      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onClose}>
          Annuleren
        </Button>
        <Button type="submit">Dossier opslaan</Button>
      </div>
    </form>
  );
}
export function DocumentsPanel({ scope }: { scope: Scope }) {
  const data = useAdministration();
  const records = data.documents.filter((d) => sameScope(d.scope, scope));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Alle categorieën");
  const [sort, setSort] = useState("newest");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<StoredDocument | null>(null);
  const [preview, setPreview] = useState<StoredDocument | null>(null);
  const [error, setError] = useState("");
  const visible = records
    .filter(
      (d) =>
        (category === "Alle categorieën" || d.category === category) &&
        matchesSearch(
          query,
          d.name,
          d.description,
          d.category,
          data.cases.find((c) => c.id === d.caseId)?.title,
        ),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "nl")
        : sort === "oldest"
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt),
    );
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>
            Documenten <span className="count-pill">{records.length}</span>
          </h2>
          <p className="section-description">
            Lokale demobestanden · PDF, PNG of JPEG · maximaal 1 MB per bestand
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Upload size={15} />
          Document toevoegen
        </Button>
      </div>
      <RecordToolbar
        label="Documenten zoeken"
        query={query}
        onQuery={setQuery}
        count={visible.length}
        filtered={
          !!query || category !== "Alle categorieën" || sort !== "newest"
        }
        onReset={() => {
          setQuery("");
          setCategory("Alle categorieën");
          setSort("newest");
        }}
      >
        <select
          aria-label="Documentcategoriefilter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {[
            "Alle categorieën",
            "Algemeen",
            "Correspondentie",
            "Formulier",
            "Bewijsstuk (demo)",
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Documentvolgorde"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Nieuwste eerst</option>
          <option value="oldest">Oudste eerst</option>
          <option value="name">Naam (A–Z)</option>
        </select>
      </RecordToolbar>
      <p className="panel-notice">
        Bestanden blijven alleen in deze browser. Gebruik geen echte
        identiteitsbewijzen of persoonsgegevens. Totale documentlimiet: 2 MB.
      </p>
      <ErrorMessage message={error} />
      {visible.length ? (
        <div className="document-grid">
          {visible.map((d) => (
            <article className="document-card" key={d.id}>
              <div className="record-title">
                <span className="record-icon">
                  <FileText size={23} />
                </span>
                <div>
                  <h3>{d.name}</h3>
                  <small>
                    {d.category} · {Math.max(1, Math.round(d.size / 1024))} KB
                  </small>
                </div>
              </div>
              {d.description && <p>{d.description}</p>}
              {d.caseId && (
                <span className="document-case">
                  Dossier: {data.cases.find((c) => c.id === d.caseId)?.title}
                </span>
              )}
              <div className="document-footer">
                <small>{timestamp(d.createdAt)}</small>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(d)}
                  aria-label={`Voorbeeld van ${d.name}`}
                >
                  <Eye size={15} />
                  Bekijken
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(d)}
                  aria-label={`Download ${d.name}`}
                >
                  <Download size={15} />
                  <span className="sr-only">Download</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(d)}
                  aria-label={`Documentgegevens bewerken: ${d.name}`}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Document verwijderen: ${d.name}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Demodocument ‘${d.name}’ definitief verwijderen?`,
                      )
                    )
                      setError(removeDocument(d.id) ?? "");
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={
            records.length ? "Geen documenten gevonden" : "Nog geen documenten"
          }
          description={
            records.length
              ? "Pas de zoekopdracht of categorie aan."
              : "Voeg een fictief document toe aan dit lid of gezin."
          }
          icon={<FileText size={28} />}
        />
      )}
      {adding && (
        <Modal title="Document toevoegen" onClose={() => setAdding(false)}>
          <DocumentForm scope={scope} onClose={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal
          title="Documentgegevens bewerken"
          onClose={() => setEditing(null)}
        >
          <DocumentMetadataForm
            record={editing}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
      {preview && (
        <DocumentPreview record={preview} onClose={() => setPreview(null)} />
      )}
    </section>
  );
}
export function DocumentMetadataForm({
  record,
  onClose,
}: {
  record: StoredDocument;
  onClose: () => void;
}) {
  const cases = useAdministration().cases.filter((c) =>
    sameScope(c.scope, record.scope),
  );
  const [error, setError] = useState("");
  return (
    <form
      className="member-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const problem = saveDocument({
          ...record,
          category: String(form.get("category")),
          description: String(form.get("description") ?? "").trim(),
          caseId: String(form.get("caseId") ?? ""),
        });
        if (problem) setError(problem);
        else onClose();
      }}
    >
      <p className="form-notice">
        {record.name} · de bestandsinhoud blijft behouden.
      </p>
      <ErrorMessage message={error} />
      <div className="form-grid">
        <label>
          Categorie
          <select
            name="category"
            aria-label="Documentcategorie"
            defaultValue={record.category}
          >
            {[
              "Algemeen",
              "Correspondentie",
              "Formulier",
              "Bewijsstuk (demo)",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Dossier
          <select
            name="caseId"
            aria-label="Documentdossier"
            defaultValue={record.caseId}
          >
            <option value="">Geen dossierkoppeling</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="form-span">
          Omschrijving
          <textarea
            aria-label="Omschrijving"
            name="description"
            maxLength={2000}
            rows={4}
            defaultValue={record.description}
          />
        </label>
      </div>
      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuleren
        </Button>
        <Button type="submit">Documentgegevens opslaan</Button>
      </div>
    </form>
  );
}
export function DocumentForm({
  scope,
  onClose,
}: {
  scope: Scope;
  onClose: () => void;
}) {
  const cases = useAdministration().cases.filter((c) =>
    sameScope(c.scope, scope),
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      setError("Kies een niet-leeg PDF-, PNG- of JPEG-bestand.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Dit bestand is te groot. De limiet is 1 MB per bestand.");
      return;
    }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mime: StoredDocument["mime"] | null =
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46 &&
        bytes[4] === 0x2d
          ? "application/pdf"
          : bytes[0] === 0x89 &&
              bytes[1] === 0x50 &&
              bytes[2] === 0x4e &&
              bytes[3] === 0x47 &&
              bytes[4] === 0x0d &&
              bytes[5] === 0x0a &&
              bytes[6] === 0x1a &&
              bytes[7] === 0x0a
            ? "image/png"
            : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
              ? "image/jpeg"
              : null;
      if (!mime) {
        setError(
          "Dit bestand is geen herkenbare PDF, PNG of JPEG. Kies een ondersteund bestand.",
        );
        return;
      }
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192)
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      const problem = saveDocument({
        id: crypto.randomUUID(),
        scope,
        name: file.name,
        category: String(form.get("category")),
        description: String(form.get("description") ?? "").trim(),
        caseId: String(form.get("caseId") ?? ""),
        mime,
        size: file.size,
        base64: btoa(binary),
        createdAt: new Date().toISOString(),
      });
      if (problem) setError(problem);
      else onClose();
    } catch {
      setError(
        "Het bestand kon niet worden gelezen. Kies het bestand opnieuw.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="member-form" onSubmit={submit}>
      <p className="form-notice">
        Alleen fictieve demodocumenten. Lokale bestanden worden niet naar een
        server verzonden en verdwijnen bij het wissen van websitegegevens.
      </p>
      <ErrorMessage message={error} />
      <div className="form-grid">
        <label className="form-span">
          Bestand
          <input
            type="file"
            name="file"
            required
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          />
        </label>
        <label>
          Categorie
          <select name="category" aria-label="Documentcategorie">
            <option>Algemeen</option>
            <option>Correspondentie</option>
            <option>Formulier</option>
            <option>Bewijsstuk (demo)</option>
          </select>
        </label>
        <label>
          Dossier
          <select name="caseId" aria-label="Documentdossier">
            <option value="">Geen dossierkoppeling</option>
            {cases.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="form-span">
          Omschrijving
          <textarea
            aria-label="Omschrijving"
            name="description"
            maxLength={2000}
            rows={3}
          />
        </label>
      </div>
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onClose}
        >
          Annuleren
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Bezig met opslaan…" : "Document opslaan"}
        </Button>
      </div>
    </form>
  );
}
