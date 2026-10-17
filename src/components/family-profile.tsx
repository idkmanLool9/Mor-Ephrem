"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Pencil, Users, House } from "lucide-react";
import { fullName, date } from "@/lib/data";
import {
  useMembers,
  useFamilies,
  useAdministration,
  sameScope,
  memberHref,
  type Family,
} from "@/lib/member-store";
import {
  PageHeading,
  Breadcrumb,
  Card,
  Fields,
  Avatar,
  Status,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/modal";
import { FamilyForm } from "@/components/family-form";
import { FamilyLinkForm } from "@/components/family-link-form";
import {
  NotesPanel,
  CasesPanel,
  DocumentsPanel,
} from "@/components/record-panels";
export function FamilyProfile({ family: original }: { family: Family }) {
  const members = useMembers();
  const families = useFamilies();
  const data = useAdministration();
  const family = families.find((f) => f.id === original.id) ?? original;
  const relatives = members.filter((m) => m.familyId === family.id);
  const contact = relatives.find((m) => m.id === family.contact);
  const [modal, setModal] = useState<"edit" | "link" | null>(null);
  const [message, setMessage] = useState("");
  const scope = { kind: "family" as const, id: family.id };
  return (
    <>
      <Breadcrumb
        href="/gezinnen"
        label="Gezinsregister"
        current={`Familie ${family.name}`}
      />
      <PageHeading
        eyebrow={`GEZINSDOSSIER · ${family.id}`}
        title={`Familie ${family.name}`}
        description={`${relatives.length} gekoppelde gezinsleden · ${family.city}`}
      >
        <div className="heading-actions">
          <Button variant="outline" onClick={() => setModal("edit")}>
            <Pencil size={16} />
            Gezin bewerken
          </Button>
          <Button onClick={() => setModal("link")}>
            <Plus size={16} />
            Lid koppelen
          </Button>
        </div>
      </PageHeading>
      {message && (
        <p role="status" className="success-notice">
          {message}
        </p>
      )}
      <div className="family-summary">
        <span>
          <House size={18} />
          {family.address}, {family.city}
        </span>
        <span>
          <Users size={18} />
          {relatives.length} gezinsleden
        </span>
        <span>
          Contactpersoon: {contact ? fullName(contact) : "Nog niet gekozen"}
        </span>
      </div>
      <Tabs defaultValue="overzicht">
        <TabsList aria-label="Gezinsdossier">
          <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
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
        </TabsList>
        <TabsContent value="overzicht">
          <div className="detail-grid family-detail">
            <Card title="Gekoppelde gezinsleden">
              {relatives.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Naam</th>
                        <th>Relatie</th>
                        <th>Geboortedatum</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatives.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <Link
                              href={memberHref(m.id)}
                              className="person-cell"
                            >
                              <Avatar name={fullName(m)} />
                              <div>
                                <strong>{fullName(m)}</strong>
                                <small>{m.id}</small>
                              </div>
                            </Link>
                          </td>
                          <td>{m.role}</td>
                          <td>{date(m.birthDate)}</td>
                          <td>
                            <Status status={m.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <Users size={28} />
                  <h2>Nog geen gezinsleden</h2>
                  <p>
                    Koppel een bestaand lid of maak een nieuw lid aan en kies
                    dit gezin.
                  </p>
                  <Button variant="outline" onClick={() => setModal("link")}>
                    Eerste lid koppelen
                  </Button>
                </div>
              )}
            </Card>
            <div className="space-y-6">
              <Card title="Gezinsgegevens">
                <Fields
                  items={[
                    ["Gezinsnummer", family.id],
                    ["Adres", family.address],
                    ["Postcode", family.postcode],
                    ["Woonplaats", family.city],
                  ]}
                />
              </Card>
              <Card title="Contactpersoon">
                {contact ? (
                  <Link
                    className="profile-list-item"
                    href={memberHref(contact.id)}
                  >
                    <Avatar name={fullName(contact)} />
                    <div className="flex-1">
                      <strong>{fullName(contact)}</strong>
                      <small>{contact.email}</small>
                    </div>
                    <ArrowUpRight size={16} />
                  </Link>
                ) : (
                  <p className="panel-notice">
                    Koppel eerst een gezinslid en kies daarna een contactpersoon
                    via Gezin bewerken.
                  </p>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="dossiers">
          <CasesPanel scope={scope} />
        </TabsContent>
        <TabsContent value="documenten">
          <DocumentsPanel scope={scope} />
        </TabsContent>
        <TabsContent value="notities">
          <NotesPanel scope={scope} />
        </TabsContent>
      </Tabs>
      <p className="page-note">
        Fictieve gezinsgegevens · wijzigingen en documenten blijven alleen in
        deze browser.
      </p>
      {modal && (
        <Modal
          title={modal === "edit" ? "Gezin bewerken" : "Lid aan gezin koppelen"}
          onClose={() => setModal(null)}
        >
          {modal === "edit" ? (
            <FamilyForm
              family={family}
              onSaved={() => {
                setModal(null);
                setMessage("Gezinsgegevens opgeslagen in deze browser.");
              }}
              onCancel={() => setModal(null)}
            />
          ) : (
            <FamilyLinkForm
              familyId={family.id}
              onClose={() => setModal(null)}
            />
          )}
        </Modal>
      )}
    </>
  );
}
