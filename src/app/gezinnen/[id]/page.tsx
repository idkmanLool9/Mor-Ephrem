import { notFound } from "next/navigation";
import { families } from "@/lib/data";
import { FamilyProfile } from "@/components/family-profile";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const family = families.find((f) => f.id === id);
  return { title: family ? `Familie ${family.name}` : "Gezin niet gevonden" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const family = families.find((f) => f.id === id);
  if (!family) notFound();
  return <FamilyProfile family={family} />;
}

export function generateStaticParams() {
  return families.map((item) => ({ id: item.id }));
}
