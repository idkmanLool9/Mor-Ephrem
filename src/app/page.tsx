"use client";
import { useMembers, useFamilies, memberHref } from "@/lib/member-store";
import Link from "next/link";
import {
  Users,
  House,
  UserCheck,
  ArrowRight,
  ClipboardList,
  ArrowUpRight,
  FolderOpen,
  Files,
} from "lucide-react";
import { activities, date, fullName } from "@/lib/data";
import { PageHeading, Card, Avatar, Status } from "@/components/shared";
import { Button } from "@/components/ui/button";
export default function Dashboard() {
  const members = useMembers();
  const families = useFamilies();
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATIE"
        title="Dashboard"
        description="Een helder overzicht van uw leden- en gezinsadministratie."
      >
        <span className="date-label">Demogegevens · oktober 2026</span>
      </PageHeading>
      <section className="release-workspace">
        <div>
          <span className="eyebrow">NIEUW · CENTRALE WERKRUIMTES</span>
          <h2>Alle dossiers en documenten binnen handbereik.</h2>
          <p>
            Open de nieuwe werkruimtes met fictieve voorbeelden, of stel uw
            eigen ledenwerktafel samen.
          </p>
        </div>
        <div className="release-links">
          <Link href="/dossiers">
            <FolderOpen size={20} />
            <span>
              Dossiers<strong>Centrale opvolging</strong>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link href="/documenten">
            <Files size={20} />
            <span>
              Documenten<strong>Alle bestanden doorzoeken</strong>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link href="/leden">
            <Users size={20} />
            <span>
              Ledenwerktafel<strong>Kolommen, selecties en bulkacties</strong>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <div className="stats-grid">
        {[
          {
            label: "Geregistreerde leden",
            value: members.length,
            detail: "Alle leden in het register",
            icon: Users,
          },
          {
            label: "Actieve leden",
            value: members.filter((m) => m.status === "Actief").length,
            detail: "Met een actief lidmaatschap",
            icon: UserCheck,
          },
          {
            label: "Geregistreerde gezinnen",
            value: families.length,
            detail: "Gekoppeld aan het ledenregister",
            icon: House,
          },
          {
            label: "Recente activiteiten",
            value: activities.length,
            detail: "In deze demonstratieperiode",
            icon: ClipboardList,
          },
        ].map(({ label, value, detail, icon: Icon }) => (
          <section className="stat-card" key={label}>
            <div className="flex justify-between items-center">
              <span>{label}</span>
              <Icon size={19} className="text-blue-700" />
            </div>
            <strong>{value}</strong>
            <small>{detail}</small>
          </section>
        ))}
      </div>
      <div className="dashboard-grid">
        <Card
          title="Recente administratieve activiteiten"
          href="/leden"
          linkLabel="Naar ledenregister"
        >
          <div className="activity-list">
            {activities.map((a) => (
              <Link
                href={`/leden/${a.memberId}`}
                className="activity"
                key={a.id}
              >
                <span className="activity-icon">
                  <ClipboardList size={18} />
                </span>
                <div className="flex-1">
                  <strong>{a.title}</strong>
                  <p>{a.description}</p>
                  <span className="activity-date">{date(a.date)}</span>
                </div>
                <span className="tag">{a.type}</span>
                <ArrowUpRight size={15} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="Direct naar">
            <div className="quick-links">
              <Link href="/leden">
                <span className="quick-icon">
                  <Users size={21} />
                </span>
                <div>
                  <strong>Ledenregister</strong>
                  <p>Zoeken en profielen bekijken</p>
                </div>
                <ArrowRight size={17} />
              </Link>
              <Link href="/gezinnen">
                <span className="quick-icon">
                  <House size={21} />
                </span>
                <div>
                  <strong>Gezinsregister</strong>
                  <p>Gezinnen en relaties inzien</p>
                </div>
                <ArrowRight size={17} />
              </Link>
            </div>
          </Card>
          <section className="demo-card">
            <span className="eyebrow">EERSTE VERSIE</span>
            <h2>Uw administratie, overzichtelijk.</h2>
            <p>
              Verken de registers en dossiers met fictieve voorbeeldgegevens.
              Leden aanmaken en bewerken kan lokaal in deze browser. Inloggen
              volgt later.
            </p>
            <Button asChild variant="outline">
              <Link href="/leden">
                Verken het ledenregister
                <ArrowRight size={16} />
              </Link>
            </Button>
          </section>
        </div>
      </div>
      <Card title="Leden uitgelicht" href="/leden">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Naam</th>
                <th>Lidnummer</th>
                <th>Woonplaats</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Profiel</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.slice(0, 4).map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link className="person-cell" href={memberHref(m.id)}>
                      <Avatar name={fullName(m)} />
                      <strong>{fullName(m)}</strong>
                    </Link>
                  </td>
                  <td>{m.id}</td>
                  <td>{m.city}</td>
                  <td>
                    <Status status={m.status} />
                  </td>
                  <td>
                    <Link
                      aria-label={`Profiel van ${fullName(m)}`}
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
      </Card>
    </>
  );
}
