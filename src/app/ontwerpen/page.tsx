"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  House,
  LayoutGrid,
  Layers3,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { members, type Member } from "@/lib/data";
import "./previews.css";

const designs = [
  {
    id: "linear",
    name: "Compact",
    reference: "Geïnspireerd door Linear",
    description:
      "Een donkere werkbalk, scherpe lijnen en een compacte lijst. Alles dichtbij, met het dossier direct naast het register.",
    tags: "Compact · Donker · Snel overzicht",
  },
  {
    id: "fluent",
    name: "Vertrouwd",
    reference: "Geïnspireerd door Microsoft Fluent",
    description:
      "Een herkenbare zakelijke werkplek met een opdrachtenbalk, blauwe navigatie en een ruim dossierpaneel.",
    tags: "Zakelijk · Blauw · Gestructureerd",
  },
  {
    id: "stripe",
    name: "Verfijnd",
    reference: "Geïnspireerd door Stripe",
    description:
      "Een lichte, uitgesproken interface met een krachtige titel, paarse accenten en een zorgvuldig opgebouwd ledenoverzicht.",
    tags: "Modern · Licht · Verfijnd",
  },
  {
    id: "notion",
    name: "Rustig",
    reference: "Geïnspireerd door Notion",
    description:
      "Een rustige werkruimte met een documentachtige opbouw, warme tinten en een eenvoudige databaseweergave.",
    tags: "Eenvoudig · Warm · Ruimtelijk",
  },
  {
    id: "salesforce",
    name: "Werkplek",
    reference: "Geïnspireerd door Salesforce",
    description:
      "Een informatierijke omgeving met horizontale navigatie, registertotalen en een vaste detailkolom voor dagelijks beheer.",
    tags: "Informatierijk · Panelen · Overzicht",
  },
];
const initials = (m: Member) => `${m.firstName[0]}${m.lastName[0]}`;

export default function DesignsPage() {
  const [design, setDesign] = useState(0);
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [selected, setSelected] = useState(members[0]);
  const [detail, setDetail] = useState("Overzicht");
  const current = designs[design];
  const visible = members.filter(
    (m) =>
      `${m.firstName} ${m.lastName} ${m.city}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!activeOnly || m.status === "Actief"),
  );
  return (
    <div className="design-gallery">
      <header className="gallery-header">
        <Link href="/">
          <ArrowLeft size={16} /> Terug naar administratie
        </Link>
        <span>ANTIOCH / ONTWERPSTUDIO</span>
        <span className="gallery-demo">Alleen voorbeeldweergave</span>
      </header>
      <section className="gallery-intro">
        <div>
          <span className="gallery-eyebrow">
            VIJF RICHTINGEN. ÉÉN ADMINISTRATIE.
          </span>
          <h1>Welke werkplek past bij jou?</h1>
          <p>
            Bekijk de verschillen in indeling, typografie en karakter. Zoek een
            lid of open een profiel om het ontwerp te ervaren.
          </p>
        </div>
        <div className="gallery-counter">
          <strong>0{design + 1}</strong>
          <span>/ 05</span>
        </div>
      </section>
      <div
        className="gallery-options"
        role="group"
        aria-label="Ontwerprichting"
      >
        {designs.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={design === index}
            onClick={() => setDesign(index)}
            className={`gallery-option ${design === index ? "chosen" : ""}`}
          >
            <span className={`gallery-swatch swatch-${item.id}`}>
              <i />
              <i />
              <i />
            </span>
            <span>
              <small>0{index + 1}</small>
              <strong>{item.name}</strong>
            </span>
            {design === index && <Check size={16} />}
          </button>
        ))}
      </div>
      <div className="gallery-caption">
        <div>
          <h2>
            {current.name} <span>{current.reference}</span>
          </h2>
          <p>{current.description}</p>
        </div>
        <div className="gallery-arrows">
          <button
            aria-label="Vorig ontwerp"
            onClick={() => setDesign((design + 4) % 5)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            aria-label="Volgend ontwerp"
            onClick={() => setDesign((design + 1) % 5)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <section
        className={`design-preview preview-${current.id}`}
        aria-label={`Voorbeeld ${current.name}`}
      >
        <aside className="concept-sidebar">
          <div className="concept-brand">
            <span>
              <Layers3 size={21} />
            </span>
            <strong>
              Antioch<small>ADMINISTRATION</small>
            </strong>
          </div>
          <div className="concept-space">
            <span className="concept-space-icon">A</span> Administratie{" "}
            <ChevronDown size={13} />
          </div>
          <span className="concept-nav-label">WERKRUIMTE</span>
          <div className="concept-nav">
            <span>
              <LayoutGrid size={17} /> Dashboard
            </span>
            <span className="is-current">
              <Users size={17} /> Ledenregister <b>24</b>
            </span>
            <span>
              <House size={17} /> Gezinsregister
            </span>
            <span>
              <FolderOpen size={17} /> Dossiers
            </span>
            <span>
              <FileText size={17} /> Documenten
            </span>
          </div>
          <div className="concept-future">
            IN ONTWIKKELING
            <span>
              Grafregister <small>Binnenkort</small>
            </span>
            <span>
              Begraafplaats <small>Binnenkort</small>
            </span>
          </div>
          <div className="concept-admin">
            <span>AB</span>
            <div>
              Administratie<small>Demonstratieomgeving</small>
            </div>
          </div>
        </aside>
        <div className="concept-workspace">
          <header className="concept-top">
            <div>
              <span>Werkruimte</span>
              <ChevronRight size={13} />
              <strong>Ledenregister</strong>
            </div>
            <span className="concept-top-right">
              Fictieve voorbeeldgegevens <span>AB</span>
            </span>
          </header>
          <div className="concept-heading">
            <div>
              <span className="concept-kicker">UW ADMINISTRATIE, GEORDEND</span>
              <h2>{design === 3 ? "Leden & contacten" : "Ledenregister"}</h2>
              <p>Een vertrouwde plek voor iedereen in uw administratie.</p>
            </div>
            <span className="concept-view-badge">Voorbeeldweergave</span>
          </div>
          <div className="concept-metrics">
            <div>
              <span>Alle leden</span>
              <strong>24</strong>
              <small>In het register</small>
            </div>
            <div>
              <span>Actief lidmaatschap</span>
              <strong>21</strong>
              <small>Van alle leden</small>
            </div>
            <div>
              <span>Gezinnen</span>
              <strong>8</strong>
              <small>Gekoppelde dossiers</small>
            </div>
          </div>
          <div className="concept-ribbon">
            <span>
              <Users size={15} /> Alle leden
            </span>
            <span>
              <FolderOpen size={15} /> Gekoppelde dossiers
            </span>
            <span>
              <MoreHorizontal size={17} />
            </span>
          </div>
          <div className="concept-split">
            <div className="concept-register">
              <div className="concept-toolbar">
                <label>
                  <Search size={16} />
                  <input
                    aria-label="Zoek een voorbeeldlid"
                    placeholder="Zoek op naam of woonplaats…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      aria-label="Zoekopdracht wissen"
                      onClick={() => setQuery("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
                <button
                  aria-pressed={activeOnly}
                  onClick={() => setActiveOnly(!activeOnly)}
                >
                  <SlidersHorizontal size={15} />
                  {activeOnly ? "Alleen actief" : "Alle statussen"}
                  <ChevronDown size={13} />
                </button>
              </div>
              <div className="concept-table-scroll">
                <table className="concept-table">
                  <thead>
                    <tr>
                      <th>Naam</th>
                      <th>Lidnummer</th>
                      <th>Woonplaats</th>
                      <th>Status</th>
                      <th aria-label="Profiel" />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.slice(0, 9).map((m) => (
                      <tr
                        key={m.id}
                        className={selected.id === m.id ? "selected-row" : ""}
                      >
                        <td>
                          <button
                            onClick={() => {
                              setSelected(m);
                              setDetail("Overzicht");
                            }}
                            aria-label={`Bekijk ${m.firstName} ${m.lastName}`}
                          >
                            <span
                              className={`concept-avatar tone-${members.indexOf(m) % 4}`}
                            >
                              {initials(m)}
                            </span>
                            <span>
                              <strong>
                                {m.firstName} {m.lastName}
                              </strong>
                              <small>{m.email}</small>
                            </span>
                          </button>
                        </td>
                        <td>{m.id}</td>
                        <td>{m.city}</td>
                        <td>
                          <span
                            className={`concept-status ${m.status === "Inactief" ? "inactive" : ""}`}
                          >
                            <i />
                            {m.status}
                          </span>
                        </td>
                        <td>
                          <ChevronRight size={14} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visible.length === 0 && (
                  <p className="concept-empty">
                    Geen leden gevonden. Probeer een andere zoekopdracht.
                  </p>
                )}
              </div>
              <div className="concept-pagination">
                <span>
                  {Math.min(9, visible.length)} van {visible.length}{" "}
                  voorbeeldleden
                </span>
                <span>Voorbeeldselectie · pagina 1</span>
              </div>
            </div>
            <aside className="concept-profile" aria-label="Voorbeeldprofiel">
              <div className="concept-profile-label">
                LEDENPROFIEL <MoreHorizontal size={16} />
              </div>
              <div className="concept-profile-person">
                <span className="concept-avatar">{initials(selected)}</span>
                <h3>
                  {selected.firstName} {selected.lastName}
                </h3>
                <p>
                  {selected.id} · Lid sinds {selected.joined.slice(0, 4)}
                </p>
                <span
                  className={`concept-status ${selected.status === "Inactief" ? "inactive" : ""}`}
                >
                  <i />
                  {selected.status}
                </span>
              </div>
              <div
                className="concept-profile-tabs"
                role="group"
                aria-label="Profielweergave"
              >
                {["Overzicht", "Activiteit"].map((tab) => (
                  <button
                    aria-pressed={detail === tab}
                    key={tab}
                    onClick={() => setDetail(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {detail === "Overzicht" ? (
                <>
                  <dl className="concept-facts">
                    <div>
                      <dt>
                        <Mail size={14} /> E-mailadres
                      </dt>
                      <dd>{selected.email}</dd>
                    </div>
                    <div>
                      <dt>
                        <Phone size={14} /> Telefoonnummer
                      </dt>
                      <dd>{selected.phone}</dd>
                    </div>
                    <div>
                      <dt>
                        <MapPin size={14} /> Adres
                      </dt>
                      <dd>
                        {selected.address}
                        <br />
                        {selected.postcode} {selected.city}
                      </dd>
                    </div>
                  </dl>
                  <div className="concept-family">
                    <span>
                      <House size={17} />
                    </span>
                    <div>
                      <strong>Gezin {selected.lastName}</strong>
                      <small>Gekoppeld gezinsdossier</small>
                    </div>
                  </div>
                </>
              ) : (
                <div className="concept-timeline">
                  <span>Voorbeeld van de tijdlijn</span>
                  <div>
                    <i />
                    <strong>Lidmaatschap geregistreerd</strong>
                    <small>{selected.joined}</small>
                  </div>
                  <div>
                    <i />
                    <strong>Gezin gekoppeld</strong>
                    <small>{selected.familyId}</small>
                  </div>
                  <p>Deze tijdlijn is uitsluitend een visueel voorbeeld.</p>
                </div>
              )}
            </aside>
          </div>
          <div className="concept-bottom">
            <span>
              <span /> Uitsluitend fictieve gegevens
            </span>
            <span>Antioch Administration</span>
          </div>
        </div>
      </section>
      <footer className="gallery-footer">
        <span>{current.tags}</span>
        <p>
          Deze ontwerpen wijzigen uw administratie niet. Kies straks een
          richting; daarna werken we die verder uit.
        </p>
        <span>
          Onafhankelijke stijlstudies, geen kopieën van genoemde producten.
        </span>
      </footer>
    </div>
  );
}
