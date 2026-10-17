import { PageHeading, Breadcrumb, Card } from "@/components/shared";
import { FamilyForm } from "@/components/family-form";
export const metadata = { title: "Nieuw gezin" };
export default function Page() {
  return (
    <>
      <Breadcrumb
        href="/gezinnen"
        label="Gezinsregister"
        current="Nieuw gezin"
      />
      <PageHeading
        eyebrow="GEZINSADMINISTRATIE"
        title="Nieuw gezin"
        description="Maak een gezinsdossier aan en koppel daarna de gezinsleden."
      />
      <Card title="Gezin registreren">
        <FamilyForm />
      </Card>
    </>
  );
}
