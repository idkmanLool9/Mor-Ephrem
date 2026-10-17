import { PageHeading } from "@/components/shared";
import { Register } from "@/components/register";
export const metadata = { title: "Gezinsregister" };
export default function Page() {
  return (
    <>
      <PageHeading
        eyebrow="REGISTERS"
        title="Gezinsregister"
        description="Overzicht van gezinnen, contactpersonen en gekoppelde gezinsleden."
      />
      <Register kind="gezinnen" />
    </>
  );
}
