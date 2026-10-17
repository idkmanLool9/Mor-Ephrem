"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Family,
  useMembers,
  saveFamily,
  nextFamilyId,
  familyHref,
} from "@/lib/member-store";
import { fullName } from "@/lib/data";
import { Button } from "@/components/ui/button";
export function FamilyForm({
  family,
  onSaved,
  onCancel,
}: {
  family?: Family;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const members = useMembers().filter((m) => m.familyId === family?.id);
  const [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    if (!["name", "address", "postcode", "city"].every((key) => text(key))) {
      setError("Vul alle verplichte gezins- en adresvelden in.");
      return;
    }
    const record: Family = {
      id: family?.id ?? nextFamilyId(),
      name: text("name"),
      address: text("address"),
      postcode: text("postcode"),
      city: text("city"),
      contact: text("contact"),
    };
    const problem = saveFamily(record, data.get("updateAddresses") === "on");
    if (problem) {
      setError(problem);
      return;
    }
    if (onSaved) onSaved();
    else router.push(familyHref(record.id));
  }
  return (
    <form className="member-form" onSubmit={submit}>
      <p className="form-notice">
        Gebruik uitsluitend fictieve gegevens. Dit gezin wordt alleen in uw
        eigen browser bewaard.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <fieldset>
        <legend>Gezinsgegevens</legend>
        <div className="form-grid">
          <label>
            Gezinsnaam
            <input
              name="name"
              required
              maxLength={100}
              defaultValue={family?.name}
              placeholder="Bijvoorbeeld: Voorbeeld"
            />
          </label>
          <label>
            Contactpersoon
            <select
              name="contact"
              aria-label="Contactpersoon"
              defaultValue={family?.contact ?? ""}
            >
              <option value="">Nog geen contactpersoon</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {fullName(m)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Adres
            <input
              name="address"
              required
              maxLength={120}
              defaultValue={family?.address}
            />
          </label>
          <label>
            Postcode
            <input
              name="postcode"
              required
              maxLength={10}
              defaultValue={family?.postcode}
            />
          </label>
          <label>
            Woonplaats
            <input
              name="city"
              required
              maxLength={80}
              defaultValue={family?.city}
            />
          </label>
        </div>
      </fieldset>
      {family && (
        <label className="checkbox-field">
          <input name="updateAddresses" type="checkbox" />
          Dit adres ook overnemen bij alle gekoppelde gezinsleden
        </label>
      )}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={() => (onCancel ? onCancel() : router.push("/gezinnen"))}
        >
          Annuleren
        </Button>
        <Button type="submit">
          {family ? "Gezin opslaan" : "Gezin aanmaken"}
        </Button>
      </div>
    </form>
  );
}
