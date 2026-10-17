import { Suspense } from "react";
import { LocalFamily } from "@/components/local-family";
export const metadata = { title: "Lokaal gezinsdossier" };
export default function Page() {
  return (
    <Suspense fallback={<p>Gezin laden…</p>}>
      <LocalFamily />
    </Suspense>
  );
}
