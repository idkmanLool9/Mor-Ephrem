import { CentralWorkspace } from "@/components/central-workspace";
export const metadata = { title: "Centrale dossiers" };
export default function Page() {
  return <CentralWorkspace kind="cases" />;
}
