import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="empty-state">
      <div className="eyebrow">404 · NIET GEVONDEN</div>
      <h1>Dossier niet gevonden</h1>
      <p>Dit dossier bestaat niet in de demonstratieomgeving.</p>
      <Button asChild>
        <Link href="/leden">Naar het ledenregister</Link>
      </Button>
    </div>
  );
}
