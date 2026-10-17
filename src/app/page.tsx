"use client";
import { useAdministration, memberHref } from "@/lib/member-store";
import Link from "next/link";
import {
  Users,
  House,
  UserCheck,
  ArrowRight,
  ArrowUpRight,
  FolderOpen,
  Files,
  Plus,
  Mail,
  CheckCheck,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { activities, date, fullName } from "@/lib/data";
import { PageHeading, Card, Avatar, Status } from "@/components/shared";
import { Button } from "@/components/ui/button";
export default function Dashboard() {
  const data = useAdministration();
  const { members, families } = data;
  const active = members.filter((m) => m.status === "Actief").length;
  const cities = Array.from(new Set(members.map((m) => m.city)))
    .map((city) => ({
      name: city,
      count: members.filter((m) => m.city === city).length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "nl"));
  return (
    <div className="dashboard-v5">
      <PageHeading
        eyebrow="UW WERKRUIMTE"
        title="Dashboard"
        description="Uw leden, gezinnen en lopende administratie in één overzicht."
      >
        <Button asChild>
          <Link href="/leden/nieuw">
            <Plus size={17} />
            Nieuw lid inschrijven
          </Link>
        </Button>
      </PageHeading>
      <section className="dashboard-hero">
        <div className="hero-main">
          <div className="hero-kicker">
            <span />
            ANTIOCH ADMINISTRATION
          </div>
          <h2>
            Uw administratie.
            <br />
            Alles bij de hand.
          </h2>
          <p>
            Van een eerste inschrijving tot een compleet gezinsdossier. Alles
            wat u nodig heeft om verder te werken.
          </p>
          <div className="hero-actions">
            <Link href="/leden">
              Open ledenregister
              <ArrowUpRight size={18} />
            </Link>
            <Link href="/gezinnen">
              Naar gezinnen
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="hero-avatar-stack">
              {members.slice(0, 3).map((m) => (
                <Avatar key={m.id} name={fullName(m)} />
              ))}
            </span>
            <span>
              <strong>{members.length} leden</strong> · {families.length}{" "}
              gezinnen in uw register
            </span>
          </div>
        </div>
        <div className="hero-geography">
          <div className="geography-heading">
            <span className="eyebrow">UW REGISTER IN BEELD</span>
            <MapPin size={19} />
          </div>
          <h3>Leden per woonplaats</h3>
          <p>De meest voorkomende woonplaatsen in uw register.</p>
          <div
            className="city-distribution"
            role="img"
            aria-label={cities
              .map((city) => `${city.name}: ${city.count} leden`)
              .join(", ")}
          >
            {cities.slice(0, 4).map((city, index) => (
              <div key={city.name} className="city-row">
                <div>
                  <span>{city.name}</span>
                  <strong>
                    {city.count}
                    <small>leden</small>
                  </strong>
                </div>
                <div className="city-track">
                  <span
                    style={{
                      width: `${(city.count / Math.max(1, members.length)) * 100}%`,
                    }}
                    data-tone={index % 3}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="geography-total">
            <span>
              <span className="legend-dot" />
              Gebaseerd op het ledenregister
            </span>
            <strong>{cities.length} woonplaatsen</strong>
          </div>
        </div>
      </section>
      <div className="stats-grid">
        {[
          {
            label: "Geregistreerde leden",
            value: members.length,
            detail: "Personen in uw administratie",
            icon: Users,
            tone: "blue",
          },
          {
            label: "Actieve leden",
            value: active,
            detail: `${members.length ? Math.round((active / members.length) * 100) : 0}% van het ledenregister`,
            icon: UserCheck,
            tone: "green",
          },
          {
            label: "Geregistreerde gezinnen",
            value: families.length,
            detail: "Verbonden via gezinsdossiers",
            icon: House,
            tone: "amber",
          },
          {
            label: "Administratieve dossiers",
            value: data.cases.length,
            detail: `${data.cases.filter((c) => c.status !== "Afgerond").length} dossiers in behandeling of open`,
            icon: FolderOpen,
            tone: "violet",
          },
        ].map(({ label, value, detail, icon: Icon, tone }) => (
          <section className="stat-card" data-tone={tone} key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className="stat-symbol">
                <Icon size={19} />
              </span>
            </div>
            <strong>{value}</strong>
            <small>{detail}</small>
          </section>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">DIRECT AAN DE SLAG</span>
          <h2>Uw dagelijkse werkplekken</h2>
        </div>
        <span>Een vaste plek voor elke administratieve stap</span>
      </div>
      <div className="module-grid">
        {[
          {
            href: "/dossiers",
            title: "Dossiers",
            overline: "BEHANDELEN & OPVOLGEN",
            description:
              "Alle lopende zaken van leden en gezinnen, met status en documenten bij elkaar.",
            detail: `${data.cases.length} dossiers in uw werkruimte`,
            icon: FolderOpen,
            tone: "amber",
          },
          {
            href: "/documenten",
            title: "Documenten",
            overline: "BEWAREN & TERUGVINDEN",
            description:
              "Vind het juiste bestand, bekijk een document en open direct het gekoppelde dossier.",
            detail: `${data.documents.length} documenten beschikbaar`,
            icon: Files,
            tone: "blue",
          },
          {
            href: "/leden",
            title: "Ledenwerktafel",
            overline: "SELECTEREN & BIJWERKEN",
            description:
              "Richt uw register in, bewaar groepen en werk geselecteerde leden samen bij.",
            detail: "Eigen kolommen en bewaarde selecties",
            icon: Users,
            tone: "green",
          },
        ].map(
          ({
            href,
            title,
            overline,
            description,
            detail,
            icon: Icon,
            tone,
          }) => (
            <Link
              href={href}
              key={href}
              className="module-card"
              data-tone={tone}
            >
              <div className="module-top">
                <span className="module-icon">
                  <Icon size={25} />
                </span>
                <ArrowUpRight size={20} />
              </div>
              <span className="module-overline">{overline}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="module-footer">
                <span>{detail}</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          ),
        )}
      </div>
      <div className="dashboard-grid">
        <Card
          title="Recente administratieve activiteiten"
          href="/leden"
          linkLabel="Naar ledenregister"
        >
          <div className="activity-list">
            {activities.map((activity, index) => {
              const Icon = [Users, House, Mail, CheckCheck, ClipboardList][
                index % 5
              ];
              return (
                <Link
                  href={memberHref(activity.memberId)}
                  className="activity"
                  key={activity.id}
                >
                  <span className="activity-icon" data-tone={index % 3}>
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                    <span className="activity-date">{date(activity.date)}</span>
                  </div>
                  <span className="tag">{activity.type}</span>
                  <ArrowUpRight size={15} className="activity-arrow" />
                </Link>
              );
            })}
          </div>
        </Card>
        <div className="dashboard-side">
          <section className="workload-card">
            <div className="workload-header">
              <span className="eyebrow">IN UW WERKRUIMTE</span>
              <FolderOpen size={21} />
            </div>
            <h2>Werkvoorraad</h2>
            <p>Zo staat het met uw administratieve dossiers.</p>
            <div className="workload-list">
              {["Open", "In behandeling", "Afgerond"].map((status, index) => (
                <div key={status}>
                  <span>
                    <i data-tone={index} />
                    {status}
                  </span>
                  <strong>
                    {data.cases.filter((c) => c.status === status).length}
                  </strong>
                </div>
              ))}
            </div>
            <Link href="/dossiers">
              Open centrale dossiers
              <ArrowUpRight size={17} />
            </Link>
          </section>
          <section className="workspace-note">
            <span className="workspace-note-mark">
              <CheckCheck size={20} />
            </span>
            <div>
              <h3>Een eigen plek om te verkennen</h3>
              <p>
                Deze werkruimte bevat fictieve gegevens. Aanpassingen worden in
                deze browser bewaard.
              </p>
            </div>
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
    </div>
  );
}
