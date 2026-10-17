"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  House,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  X,
} from "lucide-react";
import { activities, date, fullName, type Member } from "@/lib/data";
import {
  familyHref,
  memberHref,
  sameScope,
  useAdministration,
} from "@/lib/member-store";
import { Avatar, Status } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { NoteForm } from "@/components/record-panels";
export const parishOf = (member: Member) =>
  member.customFields?.find(
    (field) => field.label.trim().toLowerCase() === "parochie",
  )?.value || "Niet vastgelegd";

export function MemberInspector({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const data = useAdministration();
  const [tab, setTab] = useState("Overzicht");
  const [addingNote, setAddingNote] = useState(false);
  const scope = { kind: "member" as const, id: member.id };
  const family = data.families.find((f) => f.id === member.familyId);
  const notes = data.notes.filter((n) => sameScope(n.scope, scope));
  const cases = data.cases.filter((c) => sameScope(c.scope, scope));
  const history = activities.filter((a) => a.memberId === member.id);
  return (
    <aside className="member-inspector" aria-label="Geselecteerd ledenprofiel">
      <div className="inspector-tools">
        <Link
          href={memberHref(member.id)}
          aria-label={`Volledig profiel van ${fullName(member)}`}
        >
          <ArrowUpRight size={16} />
        </Link>
        <button aria-label="Ledenpaneel sluiten" onClick={onClose}>
          <X size={17} />
        </button>
      </div>
      <div className="inspector-identity">
        <div>
          <Avatar name={fullName(member)} />
          <Status status={member.status} />
        </div>
        <h2>{fullName(member)}</h2>
        <p>
          {member.id} · Lid sinds {new Date(member.joined).getFullYear()}
        </p>
      </div>
      <div
        className="inspector-tabs"
        role="group"
        aria-label="Ledenpaneel onderdelen"
      >
        {["Overzicht", "Gegevens", "Dossiers", "Activiteit"].map((name) => (
          <button
            key={name}
            aria-pressed={tab === name}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="inspector-body">
        {tab === "Overzicht" && (
          <>
            <section>
              <h3>Contactgegevens</h3>
              <div className="inspector-contact">
                <Mail size={15} />
                <span>{member.email || "Niet vastgelegd"}</span>
                <Phone size={15} />
                <span>{member.phone || "Niet vastgelegd"}</span>
                <MapPin size={15} />
                <span>
                  {member.address}
                  <br />
                  {member.postcode} {member.city}
                </span>
                <MapPin size={15} />
                <span>{member.city}</span>
              </div>
            </section>
            <section>
              <h3>Parochie</h3>
              <p className="inspector-parish">
                <House size={17} />
                {parishOf(member)}
              </p>
            </section>
            <section>
              <h3>Gezin</h3>
              {family ? (
                <Link className="inspector-family" href={familyHref(family.id)}>
                  <House size={19} />
                  <span>
                    <strong>Gezin {family.name}</strong>
                    <small>Gekoppeld gezinsdossier</small>
                  </span>
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <p>Geen gezin gekoppeld</p>
              )}
            </section>
            <section className="inspector-notes">
              <h3>Notities</h3>
              {notes.length ? (
                notes.map((note) => (
                  <article key={note.id}>
                    <strong>{note.title}</strong>
                    <p>{note.body}</p>
                  </article>
                ))
              ) : (
                <p>
                  <MessageSquare size={20} />
                  Geen notities
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingNote(true)}
              >
                <Plus size={13} />
                Notitie toevoegen
              </Button>
            </section>
          </>
        )}
        {tab === "Gegevens" && (
          <>
            <h3>Persoonsgegevens</h3>
            <dl className="inspector-details">
              {[
                ["Volledige naam", fullName(member)],
                ["Geboortedatum", date(member.birthDate)],
                ["Lid sinds", date(member.joined)],
                ["Lidmaatschap", member.membershipType || "Regulier"],
                [
                  "Contactvoorkeur",
                  member.contactPreference || "Geen voorkeur",
                ],
                ...(member.customFields ?? []).map((field) => [
                  field.label,
                  field.value,
                ]),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <Link className="inspector-open" href={memberHref(member.id)}>
              Profiel openen en bewerken <ArrowUpRight size={14} />
            </Link>
          </>
        )}
        {tab === "Dossiers" && (
          <>
            <h3>Administratieve dossiers</h3>
            {cases.length ? (
              cases.map((item) => (
                <article className="inspector-case" key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.status}</span>
                  <p>{item.description}</p>
                </article>
              ))
            ) : (
              <p className="inspector-empty">Nog geen dossiers bij dit lid.</p>
            )}
            <Link className="inspector-open" href={memberHref(member.id)}>
              Alle dossierfuncties openen <ArrowUpRight size={14} />
            </Link>
          </>
        )}
        {tab === "Activiteit" && (
          <>
            <h3>Voorbeeldactiviteiten</h3>
            {history.length ? (
              history.map((item) => (
                <article className="inspector-case" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <small>{date(item.date)}</small>
                </article>
              ))
            ) : (
              <p className="inspector-empty">
                Geen voorbeeldactiviteiten voor dit lid.
              </p>
            )}
            <p className="inspector-footnote">
              Vaste fictieve voorbeelden; geen volledige wijzigingshistorie.
            </p>
          </>
        )}
      </div>
      {addingNote && (
        <Modal title="Notitie toevoegen" onClose={() => setAddingNote(false)}>
          <NoteForm scope={scope} onClose={() => setAddingNote(false)} />
        </Modal>
      )}
    </aside>
  );
}
