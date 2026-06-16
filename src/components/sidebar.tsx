"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { Logo } from "./logo";
import { Bug } from "lucide-react";
import { BugReportModal } from "./BugReportModal";

export function Sidebar() {
  const pathname = usePathname();
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <aside className="sidebar no-print" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="sidebar-header" style={{ padding: "0 var(--gutter)" }}>
        <Logo variant="full" theme="dark" height={32} />
      </div>
      <nav className="sidebar-nav" aria-label="Navigasi utama" style={{ flex: 1 }}>
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

      {/* Laporkan Bug Button */}
      <div style={{ padding: "var(--gutter)" }}>
        <button
          onClick={() => setIsBugModalOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.7)",
            cursor: "pointer",
            textAlign: "left",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "14px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Bug size={18} />
          <span>Laporkan Bug</span>
        </button>
      </div>

      <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </aside>
  );
}
