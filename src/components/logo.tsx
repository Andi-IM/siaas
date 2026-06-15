"use client";

import React from "react";

interface LogoProps {
  variant?: "icon" | "full";
  theme?: "light" | "dark";
  height?: number;
}

export function Logo({ variant = "full", theme = "light", height = 32 }: LogoProps) {
  // Brand color mapping based on DESIGN.md
  // Light theme colors
  const primaryColor = "#00236F"; // primary
  const paperColor = "#505F76";   // secondary
  const textColor = "#191C1E";    // on-surface
  const subtextColor = "#444651"; // on-surface-variant

  // Dark theme colors (for sidebar background #222A3E)
  const primaryColorDark = "#B6C4FF"; // inverse-primary (provides excellent contrast on dark navy)
  const paperColorDark = "#A4ACC5";   // on-tertiary-container / lighter slate
  const textColorDark = "#FFFFFF";    // on-tertiary
  const subtextColorDark = "#A4ACC5"; // muted on-tertiary

  const isDark = theme === "dark";
  const currentPrimary = isDark ? primaryColorDark : primaryColor;
  const currentPaper = isDark ? paperColorDark : paperColor;
  const currentText = isDark ? textColorDark : textColor;
  const currentSubtext = isDark ? subtextColorDark : subtextColor;

  // Mask ID needs to be unique if multiple instances exist
  const maskId = `gear-mask-${theme}`;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        height: `${height}px`,
        userSelect: "none",
      }}
    >
      {/* ── LOGOMARK (Gear & Book) ── */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={height}
        height={height}
        style={{ flexShrink: 0 }}
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="32" height="32" fill="white" />
            <circle cx="16" cy="16" r="7.5" fill="black" />
          </mask>
        </defs>

        {/* Outer Gear Ring with 8 teeth */}
        <g mask={`url(#${maskId})`} fill={currentPrimary}>
          <rect x="14" y="2" width="4" height="28" rx="1" transform="rotate(0 16 16)" />
          <rect x="14" y="2" width="4" height="28" rx="1" transform="rotate(45 16 16)" />
          <rect x="14" y="2" width="4" height="28" rx="1" transform="rotate(90 16 16)" />
          <rect x="14" y="2" width="4" height="28" rx="1" transform="rotate(135 16 16)" />
          <circle cx="16" cy="16" r="11" />
        </g>

        {/* Book Cover (behind pages) */}
        <path
          d="M 9.5,13.5 C 9.5,13.5 11.5,12.2 16,13.8 C 20.5,12.2 22.5,13.5 22.5,13.5 L 22.5,21.5 C 22.5,21.5 20.5,20.2 16,21.8 C 11.5,20.2 9.5,21.5 9.5,21.5 Z"
          fill={currentPrimary}
        />

        {/* Book Pages */}
        <path
          d="M 10.5,14.5 C 10.5,14.5 12.2,13.5 16,14.8 C 19.8,13.5 21.5,14.5 21.5,14.5 L 21.5,20.5 C 21.5,20.5 19.8,19.5 16,20.8 C 12.2,19.5 10.5,20.5 10.5,20.5 Z"
          fill={currentPaper}
        />

        {/* Center fold divider */}
        <line
          x1="16"
          y1="14.8"
          x2="16"
          y2="20.8"
          stroke={currentPrimary}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>

      {/* ── LOGOTYPE (SIAAS Lockup) ── */}
      {variant === "full" && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: `${height * 0.53}px`,
              fontWeight: 700,
              lineHeight: 1,
              color: currentText,
              letterSpacing: "-0.01em",
            }}
          >
            SIAAS
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: `${height * 0.28}px`,
              fontWeight: 500,
              lineHeight: 1.2,
              color: currentSubtext,
              marginTop: "2px",
              whiteSpace: "nowrap",
            }}
          >
            Adm. Akademik Siswa
          </span>
        </div>
      )}
    </div>
  );
}
