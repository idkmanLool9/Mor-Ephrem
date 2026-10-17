"use client";
import Link from "next/link";
import { Mail, MapPin, ArrowUpRight, FileClock } from "lucide-react";
import {
  Member,
  members,
  families,
  activities,
  date,
  fullName,
} from "@/lib/data";
import { Avatar, Breadcrumb, Card, Fields, Status } from "@/components/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export function MemberProfile({ member: m }: { member: Member }) {
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
    <Card
      title="Gezin"
      href={`/gezinnen/${family.id}`}
      linkLabel="Bekijk gezin"
    >
      <div className="profile-list">
        {relatives.map((r) => (
          <Link
            href={`/leden/${r.id}`}
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
  const membership = (
    <Card title="Lidmaatschap">
      <Fields
        items={[
          ["Status", m.status],
          ["Lid sinds", date(m.joined)],
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
      <Tabs defaultValue="overzicht">
        <TabsList aria-label="Ledenprofiel">
          <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
          <TabsTrigger value="persoon">Persoonsgegevens</TabsTrigger>
          <TabsTrigger value="gezin">Gezin</TabsTrigger>
          <TabsTrigger value="lidmaatschap">Lidmaatschap</TabsTrigger>
          <TabsTrigger value="logboek">Logboek</TabsTrigger>
        </TabsList>
        <TabsContent value="overzicht">
          <div className="detail-grid">
            <div>{personal}</div>
            <div className="space-y-6">
              {familyCard}
              {membership}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="persoon">{personal}</TabsContent>
        <TabsContent value="gezin">{familyCard}</TabsContent>
        <TabsContent value="lidmaatschap">{membership}</TabsContent>
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
        Fictief dossier · Alleen-lezen demo · Databaseopslag en authenticatie
        zijn nog niet actief.
      </p>
    </>
  );
}
