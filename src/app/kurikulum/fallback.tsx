"use client";

import React from "react";

export function KurikulumFallback() {
  return (
    <div className="curriculum-page" style={{ padding: "calc(var(--spacing-base) * 6)" }}>
      <header className="page-header" style={{ marginBottom: "var(--margin-desktop)" }}>
        <div className="skeleton" style={{ height: 24, width: 300, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: "40%" }} />
      </header>
      <div className="curriculum-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--gutter)", alignItems: "start" }}>
        <aside className="curriculum-sidebar" style={{ display: "flex", flexDirection: "column", gap: "var(--gutter)" }}>
          <div className="card" style={{ padding: "var(--gutter)" }}>
            <div className="skeleton" style={{ height: 16, width: 100, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 32, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 32 }} />
          </div>
        </aside>
        <main className="curriculum-main">
          <div className="card" style={{ height: 400 }}>
            <div className="skeleton" style={{ height: "100%", width: "100%" }} />
          </div>
        </main>
      </div>
    </div>
  );
}
