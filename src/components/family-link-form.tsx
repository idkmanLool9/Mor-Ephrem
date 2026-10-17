"use client";
import { useState } from "react";
import { useMembers, useFamilies, linkMember } from "@/lib/member-store";
import { fullName } from "@/lib/data";
import { Button } from "@/components/ui/button";
export function FamilyLinkForm({
  familyId,
  onClose,
}: {
  familyId: string;
  onClose: () => void;
}) {
  const families = useFamilies();
  const candidates = useMembers().filter(
    (m) => m.familyId !== familyId && !families.some((f) => f.contact === m.id),
  );
  const [error, setError] = useState("");
  return (
    <form
      className="member-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const problem = linkMember(
          String(data.get("member")),
          familyId,
          String(data.get("role")),
          data.get("useAddress") === "on",
        );
        if (problem) setError(problem);
        else onClose();
      }}
    >
      <p className="form-notice">
        Het lid verhuist van het huidige gezin naar dit gezin. Contactpersonen
        kunnen pas verhuizen nadat hun huidige gezin een andere contactpersoon
        heeft.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {candidates.length ? (
        <>
          <div className="form-grid">
            <label>
              Lid
              <select name="member" aria-label="Lid" required>
                <option value="">Kies een lid</option>
                {candidates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {fullName(m)} · {m.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Relatie
              <select name="role" aria-label="Relatie">
                <option>Gezinslid</option>
                <option>Partner</option>
                <option>Kind</option>
              </select>
            </label>
          </div>
          <label className="checkbox-field">
            <input name="useAddress" type="checkbox" />
            Gezinsadres overnemen bij dit lid
          </label>
        </>
      ) : (
        <p className="page-note">
          Geen beschikbare leden. Maak eerst een nieuw lid aan of wijzig een
          bestaande gezinscontactpersoon.
        </p>
      )}
      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onClose}>
          Annuleren
        </Button>
        <Button type="submit" disabled={!candidates.length}>
          Lid koppelen
        </Button>
      </div>
    </form>
  );
}
