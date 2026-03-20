# 🔐 Authentication — Signs MFE

> A plain-English guide to how authentication works in this micro-frontend,
> what problems we ran into, and how we solved them.

---

## Table of Contents

1. [How It Works (The Big Picture)](#how-it-works-the-big-picture)
2. [Key Files](#key-files)
3. [Step-by-Step Flow](#step-by-step-flow)
4. [What Happens When You Run Standalone](#what-happens-when-you-run-standalone)
5. [Portal URL Configuration](#portal-url-configuration)
6. [How to Protect a New Screen](#how-to-protect-a-new-screen)
7. [Console Logs for Debugging](#console-logs-for-debugging)
8. [Issues We Fixed](#issues-we-fixed)
9. [Changelog](#changelog)

---

## How It Works (The Big Picture)

The **Signs app** does **not** handle login or tokens itself. It is a
"micro-frontend" (MFE) that lives **inside** the Portal application.

Think of it like this:

```
┌─────────────────────────────────────────────────┐
│  Portal (Host App)                              │
│                                                 │
│  ┌─ Handles login, stores tokens ─────────────┐ │
│  │  AuthContext  ·  AuthTokenService           │ │
│  └─────────────────────────────────────────────┘ │
│         ▼ shared via Module Federation           │
│  ┌─────────────────────────────────────────────┐ │
│  │  Signs MFE (Remote App)                     │ │
│  │                                             │ │
│  │  usePortalAuth()  → reads auth state        │ │
│  │  apiClient        → attaches Bearer token   │ │
│  │  AuthGate         → blocks UI if no auth    │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- **Portal** logs the user in, holds the access token, and shares it.
- **Signs** reads that token through Module Federation and attaches it to
  every API call automatically.
- If Signs is opened **on its own** (without the Portal), it shows a
  friendly "Go to Portal" screen instead of a broken page.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/usePortalAuth.ts` | Shared hook — any component calls `usePortalAuth()` to get the user's auth state (logged in? who is the user? etc.) |
| `src/components/auth/AuthGate.tsx` | Reusable wrapper — wrap any page with `<AuthGate>` to block access when not authenticated |
| `src/utils/apiClient.ts` | Axios HTTP client — automatically grabs the token from the Portal and puts it in the `Authorization` header of every API request |
| `src/types/index.ts` | TypeScript types for `AuthUser`, `AuthContextType`, and the `sanitizeUser()` helper |
| `src/types/remotes.d.ts` | Type declarations for the federated modules (`portal/AuthContext`, `portal/AuthTokenService`) |

---

## Step-by-Step Flow

### 1. User opens the Signs page inside the Portal

The Portal has already logged the user in. It provides two things via
Module Federation:

- **`portal/AuthContext`** — A React Context that holds `isAuthenticated`,
  `user`, etc.
- **`portal/AuthTokenService`** — A service with a `getToken()` function
  that returns the current access token (and auto-refreshes if expired).

### 2. `usePortalAuth()` reads the auth state

When `ProductsPage` (or any screen) mounts:

1. The hook **dynamically imports** `portal/AuthContext` to get the raw
   React Context object.
2. It then calls `React.useContext()` on that Context — just like any
   normal React context.
3. Returns `{ isAuthenticated, user, isStandalone, ... }`.

> **Why not just call `useAuth()` from the Portal?**
> Because `useAuth()` is a React hook, and calling it inside `useEffect`
> or an async function violates React's Rules of Hooks. Our approach
> imports the **Context object** and calls `useContext()` directly — which
> is safe. (See [Issue #2](#issue-2-invalid-hook-call) below.)

### 3. `AuthGate` decides what to show

The `<AuthGate>` component wraps the page content and checks:

| Condition | What the user sees |
|-----------|--------------------|
| Still loading the federated context | Spinner: "Connecting to Portal…" |
| Standalone (no Portal found) | 🔒 "Authentication Required" + "Go to Portal" link |
| Portal found but user not logged in | 🔑 "Please Log In" button |
| Auth is loading (checking session) | Spinner: "Checking authentication…" |
| ✅ Authenticated | The actual page content |

### 4. `apiClient` attaches the token to API calls

When the app fetches data (e.g. `GET /api/items`):

1. The Axios **request interceptor** calls `resolveGetToken()`.
2. That function dynamically imports `portal/AuthTokenService` and calls
   `getToken()`.
3. If a token is returned, it's attached as `Authorization: Bearer <token>`.
4. If the API returns **401**, the **response interceptor** clears the
   cached token, re-imports the service, gets a fresh token, and retries
   the request once.

### 5. Token lifecycle is fully owned by the Portal

The Signs app **never** stores, refreshes, or manages tokens. The Portal
does all of that. Signs just asks "give me a token" and trusts the answer.

---

## What Happens When You Run Standalone

When you run `npm run dev` and open `http://localhost:3001` directly
(without the Portal running):

1. `usePortalAuth()` tries to import `portal/AuthContext` → **fails**
   (the Portal's Module Federation remote is not available).
2. `isStandalone` becomes `true`.
3. `<AuthGate>` shows the "Authentication Required" card with a
   **"Go to Portal →"** link.
4. No API calls are made (the data table never renders).

This is by design — the Signs MFE **requires** the Portal to function.

---

## Portal URL Configuration

The "Go to Portal" button points to a URL based on the environment:

| Environment | Default URL | Override with env var |
|-------------|-------------|-----------------------|
| Local development | `https://localhost:3001` | `NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV` |
| Production | `https://erp-portal.costco.com` | `NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD` |

Set these in your `.env.local` file:

```bash
NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV=https://localhost:3001
NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD=https://erp-portal.costco.com
```

---

## How to Protect a New Screen

Any new page or component that needs authentication — just wrap it:

```tsx
import AuthGate from "@/components/auth/AuthGate";

export default function MyNewPage() {
  return (
    <AuthGate>
      {/* Your protected content here */}
      <h1>Only visible when authenticated</h1>
    </AuthGate>
  );
}
```

If you need the auth state inside your component (e.g. to show the user's
name), use the hook directly:

```tsx
import { usePortalAuth } from "@/hooks/usePortalAuth";

export default function MyComponent() {
  const auth = usePortalAuth();

  if (auth.isStandalone) return <p>Not in Portal</p>;
  if (!auth.isAuthenticated) return <p>Not logged in</p>;

  return <p>Hello, {auth.user?.name ?? auth.user?.email}!</p>;
}
```

---

## Console Logs for Debugging

Open the browser DevTools → Console and filter by `[Signs MFE]` or
`[apiClient]` to see the auth flow in action.

### Successful flow (inside Portal, logged in):

```
[Signs MFE] ✅ portal/AuthContext resolved (React.Context object)
[Signs MFE] 🔑 Auth state from portal context: { isAuthenticated: true, user: { ... } }
[apiClient] ✅ portal/AuthTokenService imported successfully. Exports: ["getToken", "setToken", ...]
[apiClient] 🔑 Token attached to GET /api/items { tokenPreview: "eyJhbGciOiJSUzI1N...xYz1234567", tokenLength: 1423 }
[apiClient] ✅ Response 200 from /api/items { hasAuthHeader: true, dataType: "array[25]" }
```

### Standalone (no Portal):

```
[Signs MFE] ❌ Could not import portal/AuthContext — standalone mode
[apiClient] ❌ Failed to import portal/AuthTokenService — running standalone without auth
```

### Token expired and refreshed (401 retry):

```
[apiClient] 🔑 Token attached to GET /api/items { ... }
[apiClient] ✅ Response 401 ...
[AuthInterceptor] 🔄 401 retry — refreshed token, retrying request
[apiClient] ✅ Response 200 from /api/items { ... }
```

> ⚠️ **These logs are for debugging only.** Remove or reduce them before
> going to production. Token previews are masked but the verbosity is
> not intended for prod.

---

## Issues We Fixed

### Issue #1 — `undefined` cannot be serialized as JSON

**Error:**
```
Error: Error serializing `.user.email` returned from `getServerSideProps` in "/signs".
Reason: `undefined` cannot be serialized as JSON.
```

**What happened:**
The Portal's `/signs` page used `getServerSideProps` to pass the user
object to the page. But `user.email` was `undefined` (not all auth
providers return an email). Next.js refuses to serialize `undefined` in
JSON — it only accepts `null`.

**What we did:**
- Changed the `AuthUser` type so `email` and `name` are `string | null`
  instead of `string`.
- Created a `sanitizeUser()` helper function that converts any
  `undefined` values to `null` before passing through `getServerSideProps`.

**Files changed:** `src/types/index.ts`

---

### Issue #2 — Invalid Hook Call (`useAuth` called outside a component)

**Error:**
```
Error: Invalid hook call. Hooks can only be called inside of the body
of a function component.
    at Module.useAuth (FederatedAuthContext.tsx:206:25)
    at eval (ProductsPage.tsx:168:39)
```

**What happened:**
The Portal exposes `useAuth()` which internally calls `useContext()`. Our
code was calling `useAuth()` inside an **async function inside
`useEffect`** — that's not inside a component body, so React threw an
error.

**What we did:**
Instead of calling the Portal's `useAuth()` hook, we now:
1. Import only the raw **`React.Context` object** from `portal/AuthContext`.
2. Call `React.useContext(thatContext)` directly inside our own hook — which
   is a valid hook call.

**Files changed:** `src/hooks/usePortalAuth.ts`

---

### Issue #3 — `useAuth()` called in Axios interceptor (also a hook violation)

**What happened:**
The `apiClient.ts` response interceptor for 401 retries was calling
`authContext.useAuth?.()` — but Axios interceptors are plain functions,
not React components. Same Rules-of-Hooks violation.

**What we did:**
Replaced the 401 handler to only use `portal/AuthTokenService.getToken()`
(a plain async function, not a hook). It clears the cached token, re-imports
the service, gets a fresh token, and retries.

**Files changed:** `src/utils/apiClient.ts`

---

### Issue #4 — Auth code was stuck inside ProductsPage

**What happened:**
All the auth-related code (context resolution, fallback, hook) was
defined inline inside `ProductsPage.tsx`. No other screen could reuse it.

**What we did:**
- Extracted the hook into `src/hooks/usePortalAuth.ts` (shared).
- Created `src/components/auth/AuthGate.tsx` (reusable wrapper).
- `ProductsPage` now just imports and uses them.

**Files changed:**
`src/hooks/usePortalAuth.ts` (new),
`src/components/auth/AuthGate.tsx` (new),
`src/components/products/ProductsPage.tsx`

---

### Issue #5 — Standalone mode showed a broken/empty page

**What happened:**
When running the Signs app on its own (`localhost:3001`), it tried to
render the data table, made API calls without a token, and showed errors
or an empty state. Confusing for developers.

**What we did:**
- Added `isStandalone` and `isResolvingCtx` flags to `usePortalAuth()`.
- Created `<AuthGate>` which shows a clear "Go to Portal" screen when
  standalone is detected.
- Updated `src/pages/index.tsx` to remove the old yellow warning banner
  (AuthGate handles it now).

**Files changed:**
`src/hooks/usePortalAuth.ts`,
`src/components/auth/AuthGate.tsx` (new),
`src/pages/index.tsx`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-19 | Fixed `user.email` serialization — `AuthUser` fields now `string \| null` + `sanitizeUser()` helper |
| 2026-03-19 | Fixed Invalid Hook Call — replaced `useAuth()` with direct `useContext()` on federated Context object |
| 2026-03-19 | Fixed 401 interceptor — removed `useAuth()` call from Axios interceptor, uses `AuthTokenService` only |
| 2026-03-19 | Extracted `usePortalAuth` hook to `src/hooks/usePortalAuth.ts` for reuse across screens |
| 2026-03-19 | Created `AuthGate` component at `src/components/auth/AuthGate.tsx` |
| 2026-03-19 | Standalone mode now shows a proper "Go to Portal" screen |
| 2026-03-19 | Portal redirect URL: `https://localhost:3001` (local) / `https://erp-portal.costco.com` (prod) |
| 2026-03-19 | Added diagnostic console logs for token flow debugging |
