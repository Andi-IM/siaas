"use client";

import React from "react";

export function TambahFallback() {
  return (
    <div className="form-page">
      <div className="form-page__inner">
        <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "50%" }} />
      </div>
    </div>
  );
}
