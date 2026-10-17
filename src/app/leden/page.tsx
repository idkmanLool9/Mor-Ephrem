import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/shared";
import { Register } from "@/components/register";
export const metadata = { title: "Ledenregister" };
export default function Page() {
  return (
    <div className="members-page">
      <PageHeading
        eyebrow="REGISTERS"
        title="Ledenregister"
        description="Een vertrouwde plek voor iedereen in uw administratie."
      >
        <Button asChild>
          <Link href="/leden/nieuw">
            <Plus size={16} />
            Nieuw lid
          </Link>
        </Button>
      </PageHeading>
      <Register kind="leden" />
      <p className="page-note">
        Dit register bevat uitsluitend fictieve voorbeeldgegevens. Nieuwe leden
        en wijzigingen worden alleen in deze browser opgeslagen.
      </p>
    </div>
  );
}
