import { PageHeading, Breadcrumb, Card } from "@/components/shared";
import { MemberForm } from "@/components/member-form";
export const metadata = { title: "Nieuw lid" };
export default function Page() {
  return (
    <>
      <Breadcrumb href="/leden" label="Ledenregister" current="Nieuw lid" />
      <PageHeading
        eyebrow="LEDENADMINISTRATIE"
        title="Nieuw lid"
        description="Voeg een fictief lid toe en koppel het aan een bestaand gezin."
      />
      <Card title="Lid inschrijven">
        <MemberForm />
      </Card>
    </>
  );
}
