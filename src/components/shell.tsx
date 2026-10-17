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
  Layers3,
  FolderOpen,
  Files,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { GlobalMemberSearch } from "@/components/global-member-search";
import { useMembers } from "@/lib/member-store";
import { cn } from "@/lib/utils";
const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leden", label: "Ledenregister", icon: Users },
  { href: "/gezinnen", label: "Gezinsregister", icon: House },
  { href: "/dossiers", label: "Dossiers", icon: FolderOpen },
  { href: "/documenten", label: "Documenten", icon: Files },
  { href: "/ontwerpen", label: "Ontwerpen vergelijken", icon: Palette },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const members = useMembers();
  const [open, setOpen] = useState(false);
  if (path.startsWith("/ontwerpen")) return <>{children}</>;
  return (
    <div className="min-h-screen">
      <aside className={cn("sidebar", open && "sidebar-open")}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <Layers3 size={23} />
          </span>
          <span>
            Antioch<span className="brand-sub">Administration</span>
          </span>
        </Link>
        <button
          aria-label="Navigatie sluiten"
          className="mobile-close"
          onClick={() => setOpen(false)}
        >
          <PanelLeftClose size={22} />
        </button>
        <div className="workspace-identity">
          <span className="workspace-identity-icon">A</span>
          <span>Administratie</span>
          <ChevronRight className="workspace-chevron" size={14} />
        </div>
        <div className="nav-label">Hoofdmenu</div>
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
              <span>{label}</span>
              {href === "/leden" && (
                <span aria-hidden="true" className="nav-member-count">
                  {members.length}
                </span>
              )}
            </Link>
          ))}
          <div className="nav-divider" />
          <div className="nav-label">Uitvaartbeheer</div>
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
          <span className="sidebar-user-avatar">AB</span>
          <div>
            Administratie<small>Demonstratieomgeving</small>
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
          <GlobalMemberSearch />
          <div className="flex items-center gap-3">
            <span className="demo-label">
              <span />
              Demonstratie
            </span>
            <span className="avatar avatar-small">AB</span>
            <div className="user-label">Fictieve voorbeeldgegevens</div>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          Antioch Administration{" "}
          <span>Compact · Fictieve demonstratiegegevens</span>
        </footer>
      </div>
    </div>
  );
}
