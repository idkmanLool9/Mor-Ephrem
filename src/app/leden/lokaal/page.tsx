import { Suspense } from "react";
import { LocalProfile } from "@/components/local-profile";
export const metadata = { title: "Lokaal ledenprofiel" };
export default function Page() {
  return (
    <Suspense fallback={<p>Dossier laden…</p>}>
      <LocalProfile />
    </Suspense>
  );
}
