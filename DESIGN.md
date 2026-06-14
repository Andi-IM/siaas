---
name: Academic Administrative Core
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#222a3e'
  on-tertiary: '#ffffff'
  tertiary-container: '#384055'
  on-tertiary-container: '#a4acc5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
  max-content-width: 1440px
---

## Brand & Style

The design system is engineered for high-utility academic environments where data density and clarity are paramount. The brand personality is rooted in reliability, precision, and institutional trust.

The aesthetic follows a **Modern Corporate** style with a focus on functional minimalism. It prioritizes a "content-first" approach, reducing visual noise to assist administrators in processing large volumes of student records, grades, and schedules. The interface uses subtle dividers and structured white space rather than heavy ornamentation to define hierarchy, ensuring the system feels efficient and authoritative.

## Colors

The palette is dominated by professional blues and neutral grays to foster a sense of stability and focus.

- **Primary (Deep Blue):** Used for key actions, active navigation states, and primary branding elements. It signals importance and institutional authority.
- **Secondary (Slate Gray):** Utilized for secondary actions, supporting icons, and meta-information.
- **Neutral (Slate/Gray Scale):** A range of cool grays provides the foundation for backgrounds, borders, and text, ensuring high legibility.
- **Status Colors:** Standardized semantic colors (Red, Green, Amber) are used strictly for status indicators (e.g., attendance, payment status, alerts) to ensure immediate cognitive recognition.

## Typography

Inter is the sole typeface for this design system, chosen for its exceptional legibility in data-heavy interfaces and its neutral, professional tone.

The type scale is optimized for screen-based reading of tabular data. **Body-md** (14px) is the workhorse size for most administrative content. **Label-md** uses an uppercase style with tracking to differentiate metadata and table headers from actual data values. For print-ready layouts, typography shifts to high-contrast black on white with slightly increased line heights to ensure clarity on physical paper.

## Layout & Spacing

The design system employs a **Fluid-Fixed Hybrid Grid**. The primary sidebar remains fixed at 260px, while the main content area expands to fill the screen, capped at 1440px to prevent excessive line lengths on ultra-wide monitors.

A strict 4px baseline grid ensures vertical rhythm. Data tables use "compact" (8px) or "spacious" (12px) vertical cell padding depending on the complexity of the data.

**Breakpoints:**
- **Mobile (<768px):** Sidebar collapses into a hamburger menu. Margins reduce to 16px.
- **Tablet (768px - 1024px):** Sidebar may collapse to an icon-only "rail" view.
- **Desktop (>1024px):** Full sidebar visibility. 32px external margins for the main dashboard.

## Elevation & Depth

Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. This maintains a clean, spreadsheet-like feel that is easy on the eyes during long work sessions.

- **Level 0 (Background):** `#F8FAFC` — Used for the main application background.
- **Level 1 (Surface):** `#FFFFFF` — Used for cards, table containers, and the white-space of the UI. Elements at this level use a 1px border of `#E2E8F0`.
- **Level 2 (Interactive/Overlay):** Minimal ambient shadows (e.g., `0 4px 6px -1px rgb(0 0 0 / 0.1)`) are reserved exclusively for dropdown menus, modals, and tooltips to separate them from the underlying data grid.

## Shapes

The shape language is conservative and geometric. A "Soft" rounding approach (`0.25rem` or 4px) is applied to most UI components including buttons, input fields, and cards. This provides a subtle modern touch without sacrificing the serious, formal tone of an administrative tool.

- **Small elements (Checkboxes):** 2px radius.
- **Standard elements (Buttons, Inputs):** 4px radius.
- **Containers (Cards, Modals):** 8px radius (`rounded-lg`).

## Components

### Data Tables

Tables are the heart of the system. They feature a sticky header, light gray row borders (`#F1F5F9`), and a subtle hover state (`#F8FAFC`) to help users track rows. Font size is set to 14px for maximum data density.

### Action Buttons

- **Primary:** Solid Deep Blue with white text. Used for "Save," "Print," or "Add New Student."
- **Secondary:** White background with Slate Gray border and text. Used for "Cancel" or "Export."
- **Danger:** Solid Red or Red-outline. Reserved for "Delete" or "Withdraw."

### Form Fields

Fields use a 1px Slate-200 border that darkens to Primary Blue on focus. Labels are positioned above the field in **label-md** style for clear vertical scanning.

### Sidebar & Top Bar

The sidebar uses the Tertiary (Dark Navy) background for high contrast against the content area. The top bar is white with a 1px bottom border and contains a global search bar for quick student/staff lookup and a user profile dropdown.

### Print Layouts

A specific CSS media query strips all background colors and sidebars. It forces all text to black, uses a serif-alternative for long reports if necessary, and ensures tables do not break mid-row across pages.
