"use client";

import React from "react";

export function PengaturanFallback() {
  return (
    <div className="container" style={{ padding: "var(--gutter)", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 350 }} />
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Database Management Skeleton */}
        <section 
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1.5rem",
            backgroundColor: "var(--color-bg-card, #ffffff)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <div className="skeleton" style={{ height: 22, width: 22, borderRadius: "50%" }} />
            <div className="skeleton" style={{ height: 18, width: 180 }} />
          </div>
          <div className="skeleton" style={{ height: 14, width: "100%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: "1.5rem" }} />
          <div className="skeleton" style={{ height: 36, width: 220, borderRadius: 6 }} />
        </section>

        {/* Bug Reporting Skeleton */}
        <section 
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1.5rem",
            backgroundColor: "var(--color-bg-card, #ffffff)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <div className="skeleton" style={{ height: 22, width: 22, borderRadius: "50%" }} />
            <div className="skeleton" style={{ height: 18, width: 180 }} />
          </div>
          <div className="skeleton" style={{ height: 14, width: "100%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: "85%", marginBottom: "1.5rem" }} />
          <div className="skeleton" style={{ height: 36, width: 200, borderRadius: 6 }} />
        </section>
      </div>
    </div>
  );
}
