"use client";

import { useState, useEffect } from "react";

export function HeaderStatus() {
  const [mounted, setMounted] = useState(false);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const formatted = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
    setDateStr(formatted);
  }, []);

  if (!mounted) {
    return (
      <div className="header-status skeleton" style={{ width: "160px", height: "28px" }}>
        <span className="label-md" style={{ opacity: 0 }}>Memuat...</span>
      </div>
    );
  }

  return (
    <div className="header-status">
      <span className="label-md">{dateStr}</span>
    </div>
  );
}
