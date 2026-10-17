"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { families, type Member } from "@/lib/data";
import { memberHref, nextMemberId, saveMember } from "@/lib/member-store";
import { Button } from "@/components/ui/button";
export function MemberForm({
  member,
  onSaved,
  onCancel,
}: {
  member?: Member;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [familyId, setFamilyId] = useState(member?.familyId ?? families[0].id);
  const contact = member && families.some((f) => f.contact === member.id);
  const family = families.find((f) => f.id === familyId)!;
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const today = new Date().toISOString().slice(0, 10);
    const birthDate = text("birthDate");
    const joined = text("joined");
    if (
      !["firstName", "lastName", "address", "postcode", "city"].every((name) =>
        text(name),
      )
    ) {
      setError("Vul alle verplichte naam- en adresvelden in.");
      return;
    }
    if (birthDate > today || joined > today || joined < birthDate) {
      setError(
        "Controleer de datums: geboorte ligt vóór de inschrijving en geen datum ligt in de toekomst.",
      );
      return;
    }
    const status = text("status");
    if (status !== "Actief" && status !== "Inactief") return;
    const record: Member = {
      id: member?.id ?? nextMemberId(),
      firstName: text("firstName"),
      lastName: text("lastName"),
      birthDate,
      joined,
      email: text("email"),
      phone: text("phone") || "Niet vastgelegd",
      status,
      familyId,
      role: contact ? "Contactpersoon" : text("role"),
      address: text("address"),
      postcode: text("postcode"),
      city: text("city"),
    };
    const problem = saveMember(record);
    if (problem) {
      setError(problem);
      return;
    }
    if (onSaved) onSaved();
    else router.push(memberHref(record.id));
  }
  return (
    <form onSubmit={submit} className="member-form">
      <p className="form-notice">
        Demo: gebruik uitsluitend fictieve gegevens. Wijzigingen worden alleen
        in deze browser bewaard, niet gedeeld met andere gebruikers.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <fieldset>
        <legend>Persoonsgegevens</legend>
        <div className="form-grid">
          <label>
            Voornaam
            <input
              name="firstName"
              required
              maxLength={80}
              defaultValue={member?.firstName}
            />
          </label>
          <label>
            Achternaam
            <input
              name="lastName"
              required
              maxLength={80}
              defaultValue={member?.lastName}
            />
          </label>
          <label>
            Geboortedatum
            <input
              name="birthDate"
              type="date"
              required
              defaultValue={member?.birthDate}
            />
          </label>
          <label>
            E-mailadres
            <input
              name="email"
              type="email"
              required
              maxLength={160}
              placeholder="naam@example.com"
              defaultValue={member?.email}
            />
          </label>
          <label>
            Telefoon
            <input
              name="phone"
              type="tel"
              maxLength={30}
              defaultValue={
                member?.phone === "Niet vastgelegd" ? "" : member?.phone
              }
            />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Gezin en adres</legend>
        <div className="form-grid">
          <label>
            Gezin
            <select
              aria-label="Gezin"
              value={familyId}
              disabled={!!contact}
              onChange={(e) => setFamilyId(e.target.value)}
            >
              {families.map((f) => (
                <option value={f.id} key={f.id}>
                  Familie {f.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Relatie
            <select
              aria-label="Relatie"
              name="role"
              defaultValue={member?.role ?? "Gezinslid"}
              disabled={!!contact}
            >
              {(contact
                ? ["Contactpersoon"]
                : ["Gezinslid", "Partner", "Kind"]
              ).map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label>
            Adres
            <input
              key={`address-${familyId}`}
              name="address"
              required
              maxLength={120}
              defaultValue={
                member?.familyId === familyId ? member.address : family.address
              }
            />
          </label>
          <label>
            Postcode
            <input
              key={`postcode-${familyId}`}
              name="postcode"
              required
              maxLength={10}
              defaultValue={
                member?.familyId === familyId
                  ? member.postcode
                  : family.postcode
              }
            />
          </label>
          <label>
            Woonplaats
            <input
              key={`city-${familyId}`}
              name="city"
              required
              maxLength={80}
              defaultValue={
                member?.familyId === familyId ? member.city : family.city
              }
            />
          </label>
        </div>
        {contact && (
          <p className="page-note">
            De vaste contactpersoon blijft gekoppeld aan dit gezin.
          </p>
        )}
      </fieldset>
      <fieldset>
        <legend>Lidmaatschap</legend>
        <div className="form-grid">
          <label>
            Status
            <select
              aria-label="Status"
              name="status"
              defaultValue={member?.status ?? "Actief"}
            >
              <option>Actief</option>
              <option>Inactief</option>
            </select>
          </label>
          <label>
            Lid sinds
            <input
              name="joined"
              type="date"
              required
              defaultValue={
                member?.joined ?? new Date().toISOString().slice(0, 10)
              }
            />
          </label>
        </div>
      </fieldset>
      <div className="form-actions">
        <Button
          variant="outline"
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/leden"))}
        >
          Annuleren
        </Button>
        <Button type="submit">
          {member ? "Wijzigingen opslaan" : "Lid opslaan"}
        </Button>
      </div>
    </form>
  );
}
