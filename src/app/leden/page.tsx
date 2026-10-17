import { PageHeading } from "@/components/shared";
import { Register } from "@/components/register";
export const metadata = { title: "Ledenregister" };
export default function Page() {
  return (
    <>
      <PageHeading
        eyebrow="REGISTERS"
        title="Ledenregister"
        description="Alle leden, contactgegevens en lidmaatschappen op één plek."
      />
      <Register kind="leden" />
      <p className="page-note">
        Dit register bevat uitsluitend fictieve voorbeeldgegevens. Wijzigingen
        en inschrijvingen volgen in een volgende versie.
      </p>
    </>
  );
}
