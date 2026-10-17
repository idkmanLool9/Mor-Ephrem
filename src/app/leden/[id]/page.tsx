import { notFound } from "next/navigation";
import { members, fullName } from "@/lib/data";
import { MemberProfile } from "@/components/member-profile";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = members.find((m) => m.id === id);
  return { title: member ? fullName(member) : "Lid niet gevonden" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = members.find((m) => m.id === id);
  if (!member) notFound();
  return <MemberProfile member={member} />;
}

export function generateStaticParams() {
  return members.map((item) => ({ id: item.id }));
}
