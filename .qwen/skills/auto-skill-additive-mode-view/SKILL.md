---
name: additive-mode-view
description: Add a new tab/mode to an existing React view without modifying the original layout, using conditional rendering and hooks-safe computation ordering
source: auto-skill
extracted_at: '2026-06-16T16:44:25.907Z'
---

When adding a new display mode (tab, toggle, variant) to an existing React component, keep the original layout completely untouched by wrapping it in conditional rendering. This prevents regressions and makes the feature additive rather than destructive.

## Procedure

### Step 1: Add a mode state

```ts
type Mode = "original" | "new-mode";
const [mode, setMode] = useState<Mode>("original");
```

### Step 2: Add tab toggle in the UI header

Place the toggle in the existing action bar header, not inside the content area. Use adjacent button styling (flat left/right borders) for a clean tab feel.

### Step 3: Move ALL computations before early returns

React hooks must be called unconditionally. If the component has early returns (loading skeleton, null-state fallback), move ALL data computations — including `useMemo`, `useCallback`, and regular const computations — **above** those early return blocks.

```ts
// WRONG — hooks called after early return
if (loading) return <Skeleton />;
const data = useMemo(() => compute(), [deps]); // ← lint error: react-hooks/rules-of-hooks

// CORRECT — computations before early returns
const data = useMemo(() => compute(), [deps]);
if (loading) return <Skeleton />;
```

This applies even to non-hook computations if they depend on state that's always defined (like empty arrays during loading). Move them up too — they won't be used in the early return paths anyway.

### Step 4: Wrap existing sections with `{mode === "original" && (...)}`

Do NOT modify the existing JSX. Wrap each section (screen view, print layout) individually:

```tsx
{mode === "original" && (
  <div className="existing-section">
    {/* ... untouched original JSX ... */}
  </div>
)}

{mode === "new-mode" && (
  <div className="new-section">
    {/* ... new layout ... */}
  </div>
)}
```

Apply this to both the screen view AND the print layout sections separately.

### Step 5: Fix test select-element index shifts

If the original form had N `<select>` elements and you added one between existing ones, the test's `querySelectorAll("select")` index mapping shifts. Update:

```ts
// Before: 2 selects
const kategoriSelect = selects[0];
const statusSelect = selects[1];

// After: 3 selects (new one in middle)
const kategoriSelect = selects[0];
const transcriptGroupSelect = selects[1]; // NEW
const statusSelect = selects[2];
```

Also update the expected call object to include the new field.

### Step 6: Verify

- `npx tsc --noEmit` — catches missing fields in type interfaces
- `npm run lint` — catches hooks ordering violations
- Run affected test file — catches select-index shifts and missing expected fields

## Why this matters

- **No regressions**: Original layout is wrapped conditionally, never modified. If the new mode has bugs, the original still works.
- **Hooks safety**: Moving computations above early returns is a non-obvious React pattern. The lint rule catches it, but only after you've written the code. Doing it proactively saves a round-trip.
- **Test stability**: Adding form fields between existing ones shifts element indices. Tests that use positional queries break silently (wrong select gets changed). Always verify affected tests after UI form changes.
