"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { families, fullName, date } from "@/lib/data";
import { useMembers, memberHref } from "@/lib/member-store";
import {
  PageHeading,
  Breadcrumb,
  Card,
  Fields,
  Avatar,
  Status,
} from "@/components/shared";
export function FamilyProfile({
  family,
}: {
  family: (typeof families)[number];
}) {
  const members = useMembers();
  const id = family.id;
  const relatives = members.filter((m) => m.familyId === id);
  const contact = relatives.find((m) => m.id === family.contact)!;
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
      />
      <div className="detail-grid family-detail">
        <Card title="Gekoppelde gezinsleden">
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
                      <Link href={memberHref(m.id)} className="person-cell">
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
            <Link className="profile-list-item" href={memberHref(contact.id)}>
              <Avatar name={fullName(contact)} />
              <div className="flex-1">
                <strong>{fullName(contact)}</strong>
                <small>{contact.email}</small>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          </Card>
        </div>
      </div>
      <p className="page-note">
        Alle gezinsrelaties en contactgegevens zijn fictief.
      </p>
    </>
  );
}
