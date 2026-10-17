"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  House,
  Archive,
  Map,
  PanelLeftClose,
  Menu,
  ChevronRight,
  ShieldCheck,
  Layers3,
  FolderOpen,
  Files,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leden", label: "Ledenregister", icon: Users },
  { href: "/gezinnen", label: "Gezinsregister", icon: House },
  { href: "/dossiers", label: "Dossiers", icon: FolderOpen },
  { href: "/documenten", label: "Documenten", icon: Files },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside className={cn("sidebar", open && "sidebar-open")}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <Layers3 size={23} />
          </span>
          <span>
            ANTIOCH<span className="brand-sub">ADMINISTRATION</span>
          </span>
        </Link>
        <button
          aria-label="Navigatie sluiten"
          className="mobile-close"
          onClick={() => setOpen(false)}
        >
          <PanelLeftClose size={22} />
        </button>
        <div className="nav-label">WERKRUIMTE</div>
        <nav aria-label="Hoofdnavigatie">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "nav-item",
                (href === "/" ? path === "/" : path.startsWith(href)) &&
                  "nav-active",
              )}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
          <div className="nav-divider" />
          {[
            { label: "Grafregister", icon: Archive },
            { label: "Begraafplaats", icon: Map },
          ].map(({ label, icon: Icon }) => (
            <button key={label} disabled className="nav-item nav-disabled">
              <Icon size={19} />
              <span>{label}</span>
              <span className="soon">Binnenkort</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <ShieldCheck size={18} />
          <div>
            Demonstratieomgeving<small>Uitsluitend fictieve gegevens</small>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="backdrop"
          aria-label="Navigatie sluiten"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu"
              aria-label="Navigatie openen"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span className="text-slate-500">Werkruimte</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-medium">
              {path.startsWith("/leden")
                ? "Ledenregister"
                : path.startsWith("/gezinnen")
                  ? "Gezinsregister"
                  : path.startsWith("/dossiers")
                    ? "Dossiers"
                    : path.startsWith("/documenten")
                      ? "Documenten"
                      : "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="demo-label">Demo</span>
            <span className="avatar avatar-small">AB</span>
            <div className="user-label">
              Administratie<small>Beheerder · demo</small>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          Antioch Administration{" "}
          <span>Versie 0.4 · Fictieve demonstratiegegevens</span>
        </footer>
      </div>
    </div>
  );
}
