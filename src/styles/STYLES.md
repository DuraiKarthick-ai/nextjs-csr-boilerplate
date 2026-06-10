# Signs App — Styles Architecture

## Overview

The Signs app runs in two modes:

| Mode | Entry point | Style entry |
|---|---|---|
| **Standalone** (port 3001, dev/test) | `src/pages/_app.tsx` | `src/styles/globals.scss` |
| **Federated** (embedded inside the Costco ERP portal host) | `src/federation/app.tsx` | `src/federation/bridge.module.scss` |

The style system is designed so that **every rule is defined once** and shared between both modes. You never copy-paste styles between files.

---

## File Map

```
src/styles/
│
├── _variables.scss          ← All design tokens (colors, breakpoints, font names)
├── _mixins.scss             ← Reusable SCSS mixins (font-size, container, flex, etc.)
├── _breakpoint.scss         ← Responsive breakpoint mixins (up, down, between)
├── _reset.scss              ← Base CSS reset (box-sizing, list, anchor, button, etc.)
├── _utilities.scss          ← Standalone utility classes (d-flex, d-none, text-*, etc.)
│
├── _typography.scss         ← ⭐ SINGLE SOURCE OF TRUTH for all heading/text styles
│                               Edit HERE to change h1–h6, p, a font sizes or weights
│
├── _shared-foundation.scss  ← ⭐ SINGLE SOURCE OF TRUTH for buttons, forms, helpers
│                               Exposes two mixins used by both standalone & federation
│
└── globals.scss             ← Standalone app global stylesheet (imported only in _app.tsx)

src/federation/
└── bridge.module.scss       ← Federation shell: layout structure + scoped styles for host
```

---

## The Two Source-of-Truth Files

### 1. `_typography.scss` — Headings and Text

Contains **one mixin** `typography-rules()` that defines all heading and text element styles.

```scss
// _typography.scss
@mixin typography-rules() {
  h1 { font-size: 28px; font-weight: 700; }
  h2 { font-size: 22px; font-weight: 500; }
  h3 { font-size: 18px; font-weight: 500; }
  h4 { font-size: 14px; font-weight: 500; }
  p  { font-size: 14px; font-weight: 400; }
  a  { font-size: 14px; color: inherit;   }
  // ... responsive overrides via @include up($lg)
}
```

**To change `h2` font size**: edit only this mixin. Both standalone and host update automatically.

> ⚠️ Do NOT add `@include typography-rules()` at the bottom of this file. The mixin is intentionally "inert" here — callers decide where to emit the CSS.

---

### 2. `_shared-foundation.scss` — Buttons, Forms, Utilities

Contains two mixins:

#### `foundation-globals()`
Utility classes used across all screens: `.primaryButton`, `.clearButton`, `.printButton`, `.primaryButtonOutline`, `.inputLabelWrap`, `label.label`, `.validationMsg`, `.shimmer`, `.statusTag`, `.noDataContent`, layout helpers (`.d-flex`, `.flex-align-center`, `.container`), and element resets.

#### `typography-scoped()`
A thin wrapper that calls `typography-rules()` from `_typography.scss`. Used in federation to scope typography under `.bridge` so the portal's global element styles cannot override Signs' styles.

```scss
// _shared-foundation.scss
@mixin typography-scoped() {
  @include typo.typography-rules();   // delegates — no duplication
}
```

---

## How Styles Flow in Each Mode

### Standalone App

```
_app.tsx
  └── globals.scss
        ├── @use "variables"           → design tokens available
        ├── @use "mixins"              → mixins available
        ├── @use "typography" as typo  → imports mixin only, no CSS yet
        ├── @use "utilities"           → outputs utility classes at root
        ├── @use "breakpoint"          → breakpoint mixins available
        ├── @use "reset"               → outputs element reset at root
        ├── @use "shared-foundation"   → imports mixins only, no CSS yet
        │
        ├── html, body { ... }         → app shell styles
        ├── @include typo.typography-rules()   → emits h1/h2... at root
        └── @include sf.foundation-globals()   → emits .primaryButton etc. at root
```

### Federated (Host Portal)

```
federation/app.tsx
  └── bridge.module.scss  (CSS Module — scoped by .bridge hash)
        ├── @use "shared-foundation"
        ├── @use "variables"
        │
        └── .bridge {
              background, font-family, color...
              :global {
                @include sf.foundation-globals()   → .primaryButton etc. as globals
                @include sf.typography-scoped()    → .bridge h2 { } (beats portal)
              }
            }
        ├── .federatedLayout  → flex row: sidebar + main
        ├── .federatedSidebar → 290px fixed width
        └── .federatedMain    → flex:1, scrollable
```

---

## Why `bridge.module.scss` Uses `:global`

CSS Modules hash class names (`.primaryButton` → `.primaryButton_x7k2`). Our feature screens use the class names as plain strings (e.g. `className="primaryButton"`), so they must be **global** inside the bridge container.

Placing them inside `.bridge { :global { ... } }` means:
- They are only active inside the `.bridge` root element (safe isolation)
- But the class names themselves are not hashed (feature screens can use them)

---

## Why Typography Is Scoped Under `.bridge`

The portal host has its own global styles, e.g.:
```css
/* portal global CSS */
h2 { font-size: 32px; color: red; }   /* specificity: 0,0,1 */
```

If Signs' remote renders an `<h2>` with no counter-rule, the portal wins.

By emitting typography under `.bridge`:
```css
/* our scoped rule */
.bridge h2 { font-size: 22px; font-weight: 500; }   /* specificity: 0,1,1 */
```

`.bridge h2` has higher specificity (0,1,1) than the portal's bare `h2` (0,0,1), so Signs' styles always win — without touching the portal.

---

## Per-Screen Styles

Each feature screen has its own **CSS Module** imported directly in the component. These travel with the component bundle and work in both standalone and host automatically.

| Screen | Style file | Type |
|---|---|---|
| Dashboard | `features/dashboard/component/dashboard.module.scss` | CSS Module ✅ |
| Quick Print | `features/quick-print/component/quickPrint.module.scss` | CSS Module ✅ |
| Worklist | `features/worklist/component/signWorklist.module.scss` | CSS Module ✅ |
| Custom Sign | `features/custom-sign/component/customSign.scss` | Global (via globals.scss) |

> Note: Custom Sign uses a plain `.scss` that is `@use`d in `globals.scss`. In the standalone app this works. If Custom Sign needs full federation support, convert it to a `.module.scss` and import it directly in the component (same pattern as the other three screens).

---

## Rule: Where to Make Changes

| What you want to change | File to edit |
|---|---|
| `h1`–`h6`, `p`, `a` font size or weight | `src/styles/_typography.scss` → `typography-rules()` mixin |
| Button styles (`.primaryButton`, `.clearButton`, etc.) | `src/styles/_shared-foundation.scss` → `foundation-globals()` mixin |
| Form helpers (`.inputLabelWrap`, `.validationMsg`, etc.) | `src/styles/_shared-foundation.scss` → `foundation-globals()` mixin |
| Colors, spacing tokens | `src/styles/_variables.scss` |
| Reusable SCSS mixins | `src/styles/_mixins.scss` |
| Responsive breakpoints | `src/styles/_breakpoint.scss` |
| App shell layout (`html`, `body`, `#__next`) | `src/styles/globals.scss` (standalone only) |
| Federation shell layout (sidebar width, main area) | `src/federation/bridge.module.scss` |
| A specific screen's UI styles | That screen's own `.module.scss` file |

---

## Adding a New Global Utility Class

1. Add the rule inside the `foundation-globals()` mixin in `src/styles/_shared-foundation.scss`
2. That's it — it is automatically available in both standalone and host

**Do not** add it directly to `globals.scss`. It would only exist in standalone and break in the host.

---

## Adding a New Screen

1. Create `features/your-screen/component/yourScreen.module.scss`
2. `import styles from './yourScreen.module.scss'` in your component
3. Use `styles.yourClassName` — no other steps needed for federation

---

## Common Mistakes to Avoid

| Mistake | Why it breaks |
|---|---|
| Adding `@include typography-rules()` at the bottom of `_typography.scss` | Causes "impure selector" error in CSS Modules when `_shared-foundation.scss` `@use`s it |
| `import '../styles/globals.scss'` in any file other than `_app.tsx` | Next.js Pages Router build error: "Global CSS cannot be imported from files other than Custom App" |
| Copying button/form styles into `bridge.module.scss` by hand | Creates two sources of truth — they drift. Use `_shared-foundation.scss` |
| Using bare element selectors (`h2 {}`) inside a `.module.scss` at root level | CSS Modules rejects impure selectors — wrap in `:global` or a local class |
