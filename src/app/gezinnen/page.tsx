import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      >
        <Button asChild>
          <Link href="/gezinnen/nieuw">
            <Plus size={16} />
            Nieuw gezin
          </Link>
        </Button>
      </PageHeading>
      <Register kind="gezinnen" />
    </>
  );
}
