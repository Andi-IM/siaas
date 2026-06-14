"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck, FileText, Settings, FileSpreadsheet } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/siswa", label: "Peserta Didik", icon: Users, exact: false },
  { href: "/kurikulum", label: "Kurikulum", icon: BookOpen, exact: false },
  { href: "/rekap", label: "Rekap Data", icon: FileSpreadsheet, exact: false },
  { href: "#", label: "Pengaturan", icon: Settings, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-header">
        <span className="label-md" style={{ color: "var(--on-tertiary)" }}>
          SIAAS
        </span>
      </div>
      <nav className="sidebar-nav" aria-label="Navigasi utama">
        {navItems.map((item) => {
          const active = item.href !== "#" && (
            item.exact ? pathname === item.href : pathname.startsWith(item.href)
          );
          return (
            <Link
              key={item.label}
              href={item.href}
              className="nav-item"
              aria-current={active ? "page" : undefined}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
