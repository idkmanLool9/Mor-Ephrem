"use client";
import { useRef, useState } from "react";
import {
  useMembers,
  useFamilies,
  useAdministration,
  sameScope,
  memberHref,
  familyHref,
} from "@/lib/member-store";
import {
  NotesPanel,
  CasesPanel,
  DocumentsPanel,
} from "@/components/record-panels";
import { MemberForm } from "@/components/member-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MapPin, ArrowUpRight, FileClock } from "lucide-react";
import { Member, activities, date, fullName } from "@/lib/data";
import { Avatar, Breadcrumb, Card, Fields, Status } from "@/components/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export function MemberProfile({ member }: { member: Member }) {
  const members = useMembers();
  const families = useFamilies();
  const data = useAdministration();
  const scope = { kind: "member" as const, id: member.id };
  const m = members.find((item) => item.id === member.id) ?? member;
  const dialog = useRef<HTMLDialogElement>(null);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const family = families.find((f) => f.id === m.familyId)!;
  const relatives = members.filter((r) => r.familyId === m.familyId);
  const history = activities.filter((a) => a.memberId === m.id);
  const personal = (
    <Card title="Persoonsgegevens">
      <Fields
        items={[
          ["Volledige naam", fullName(m)],
          ["Lidnummer", m.id],
          ["Geboortedatum", date(m.birthDate)],
          ["Adres", m.address],
          ["Postcode en woonplaats", `${m.postcode} ${m.city}`],
          ["E-mailadres", m.email],
          ["Telefoon", m.phone],
        ]}
      />
    </Card>
  );
  const familyCard = (
    <Card title="Gezin" href={familyHref(family.id)} linkLabel="Bekijk gezin">
      <div className="profile-list">
        {relatives.map((r) => (
          <Link
            href={memberHref(r.id)}
            key={r.id}
            className="profile-list-item"
          >
            <Avatar name={fullName(r)} />
            <div className="flex-1">
              <strong>{fullName(r)}</strong>
              <small>{r.role}</small>
            </div>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
    </Card>
  );
  const additional = (
    <Card title="Aanvullende persoonsgegevens">
      <Fields
        items={[
          ["Roepnaam", m.preferredName || "Niet vastgelegd"],
          ["Geboorteplaats", m.birthPlace || "Niet vastgelegd"],
          ["Nationaliteit", m.nationality || "Niet vastgelegd"],
          ["Voorkeurstaal", m.language || "Niet vastgelegd"],
          ["Beroep", m.occupation || "Niet vastgelegd"],
          ["Contactvoorkeur", m.contactPreference || "Geen voorkeur"],
        ]}
      />
    </Card>
  );
  const custom = (
    <Card title="Eigen administratieve velden">
      {m.customFields?.length ? (
        <Fields items={m.customFields.map((f) => [f.label, f.value || "—"])} />
      ) : (
        <p className="panel-notice">
          Nog geen eigen velden. Voeg ze toe via Lid bewerken.
        </p>
      )}
    </Card>
  );
  const membership = (
    <Card title="Lidmaatschap">
      <Fields
        items={[
          ["Status", m.status],
          ["Lid sinds", date(m.joined)],
          ["Type lidmaatschap", m.membershipType || "Regulier"],
          ["Registratie", "Fictieve demonstratie"],
          ["Gezinsnummer", m.familyId],
        ]}
      />
    </Card>
  );
  return (
    <>
      <Breadcrumb href="/leden" label="Ledenregister" current={fullName(m)} />
      <div className="profile-heading">
        <span className="profile-avatar">
          <Avatar name={fullName(m)} />
        </span>
        <div>
          <div className="eyebrow">LEDENPROFIEL</div>
          <h1>{fullName(m)}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-slate-500">Lidnummer {m.id}</span>
            <Status status={m.status} />
          </div>
        </div>
        <div className="profile-contact">
          <span>
            <MapPin size={15} />
            {m.city}
          </span>
          <a href={`mailto:${m.email}`}>
            <Mail size={15} />
            {m.email}
          </a>
        </div>
      </div>
      <div className="profile-actions">
        <p role="status">
          {saved
            ? "Wijzigingen opgeslagen in deze browser."
            : "Lokale demo · uitsluitend fictieve gegevens"}
        </p>
        <Button
          onClick={() => {
            setEditing(true);
            dialog.current?.showModal();
          }}
        >
          Lid bewerken
        </Button>
      </div>
      <dialog
        ref={dialog}
        className="edit-dialog"
        aria-labelledby="edit-title"
        onClose={() => setEditing(false)}
      >
        <div className="card-header">
          <h2 id="edit-title">Lid bewerken</h2>
          <Button variant="ghost" onClick={() => dialog.current?.close()}>
            Sluiten
          </Button>
        </div>
        {editing && (
          <MemberForm
            member={m}
            onSaved={() => {
              dialog.current?.close();
              setSaved(true);
            }}
            onCancel={() => dialog.current?.close()}
          />
        )}
      </dialog>
      <Tabs defaultValue="overzicht">
        <TabsList aria-label="Ledenprofiel">
          <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
          <TabsTrigger value="persoon">Persoonsgegevens</TabsTrigger>
          <TabsTrigger value="gezin">Gezin</TabsTrigger>
          <TabsTrigger value="lidmaatschap">Lidmaatschap</TabsTrigger>
          <TabsTrigger value="dossiers">
            Dossiers{" "}
            <span className="tab-count">
              {data.cases.filter((c) => sameScope(c.scope, scope)).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="documenten">
            Documenten{" "}
            <span className="tab-count">
              {data.documents.filter((d) => sameScope(d.scope, scope)).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="notities">
            Notities{" "}
            <span className="tab-count">
              {data.notes.filter((n) => sameScope(n.scope, scope)).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="logboek">Logboek</TabsTrigger>
        </TabsList>
        <TabsContent value="overzicht">
          <div className="detail-grid">
            <div className="space-y-6">
              {personal}
              {additional}
              {custom}
            </div>
            <div className="space-y-6">
              {familyCard}
              {membership}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="persoon">
          <div className="detail-grid">
            <div className="space-y-6">
              {personal}
              {additional}
            </div>
            {custom}
          </div>
        </TabsContent>
        <TabsContent value="gezin">{familyCard}</TabsContent>
        <TabsContent value="lidmaatschap">{membership}</TabsContent>
        <TabsContent value="dossiers">
          <CasesPanel scope={scope} />
        </TabsContent>
        <TabsContent value="documenten">
          <DocumentsPanel scope={scope} />
        </TabsContent>
        <TabsContent value="notities">
          <NotesPanel scope={scope} />
        </TabsContent>
        <TabsContent value="logboek">
          <Card title="Administratief logboek">
            {history.length ? (
              history.map((a) => (
                <div key={a.id} className="activity">
                  <span className="activity-icon">
                    <FileClock size={18} />
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.description}</p>
                    <small>{date(a.date)} · Demonstratie</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FileClock size={28} />
                <h2>Geen activiteiten vastgelegd</h2>
                <p>
                  Voor dit fictieve lid zijn nog geen logboekregels beschikbaar.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      <p className="page-note">
        Fictief dossier · Wijzigingen worden lokaal bewaard. Centrale
        databaseopslag en authenticatie zijn nog niet actief.
      </p>
    </>
  );
}
