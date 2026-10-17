import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Status({ status }: { status: string }) {
  return (
    <span className={cn("status", status !== "Actief" && "status-inactive")}>
      <span />
      {status}
    </span>
  );
}
export function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar">
      {name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function Card({
  title,
  children,
  href,
  linkLabel = "Bekijk alles",
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>{title}</h2>
        {href && (
          <Link className="text-link" href={href}>
            {linkLabel}
            <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
export function Breadcrumb({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: string;
}) {
  return (
    <div className="breadcrumb">
      <Link href={href}>{label}</Link>
      <ChevronRight size={14} />
      <span>{current}</span>
    </div>
  );
}
export function Fields({ items }: { items: [string, string][] }) {
  return (
    <dl className="fields">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
