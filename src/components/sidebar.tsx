"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { Logo } from "./logo";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-header" style={{ padding: "0 var(--gutter)" }}>
        <Logo variant="full" theme="dark" height={32} />
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
