# Northwind Admin — React Admin Dashboard

A production-style admin dashboard built with **React 18, TypeScript (strict), TanStack Query, React Router data APIs and MSW**. It is a reference for how I structure a medium-sized frontend: clear feature boundaries, server state kept apart from UI state, URL-driven list screens, accessible primitives, and a mock backend that runs in both the browser and the tests.

The app runs fully standalone: an in-browser mock API serves a seeded, deterministic dataset (500 users, 2,000 orders) with realistic latency and an optional failure mode.

## Features

| Area              | What's there                                                                                                                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth & RBAC**   | Mock login (any email + password ≥ 6 chars), persisted token, protected routes, three roles (`admin`, `manager`, `viewer`), `<Can permission>` component, `usePermission` hook, route-level `<RequirePermission>` guards. The mock API enforces the same permission matrix server-side. |
| **App shell**     | Collapsible sidebar (persisted), drawer navigation under 768px, global search combobox (`Ctrl/⌘ K`), light/dark theme toggle with no flash on load, user menu, breadcrumbs derived from route `handle`s, navigation progress bar, skip link.                                            |
| **Dashboard**     | KPI cards with period-over-period deltas, revenue area chart with a 7d / 30d / 90d range selector, sales-by-category bar chart, recent activity feed. Each widget has its own Suspense skeleton and error boundary with retry.                                                          |
| **Users**         | Server-side pagination, sorting, role/status filters and debounced search — all synced to URL search params. Create/edit drawer with React Hook Form + Zod (server field errors map back onto inputs). Delete with confirmation and an optimistic update that rolls back on failure.    |
| **Orders**        | Filterable, sortable list and a detail page with line items, customer, shipping and a status timeline. Managers and admins can advance an order through its fulfilment states.                                                                                                          |
| **Settings**      | Profile form, notification preferences, theme, and developer controls for the mock API (latency, simulated failures).                                                                                                                                                                   |
| **Cross-cutting** | Toasts, accessible dialog/drawer (focus trap, Esc, `aria-modal`, focus restore, scroll lock), 404 page, route and global error boundaries, code-split routes.                                                                                                                           |

## Getting started

```bash
nvm use            # Node 24 (any Node ≥ 20 works)
npm install
npm run dev        # http://localhost:5173
```

Sign in with any email and a password of at least 6 characters. The role comes from the email:

| Email contains | Role    | Can                                  |
| -------------- | ------- | ------------------------------------ |
| `viewer`       | viewer  | Read dashboard, users and orders     |
| `manager`      | manager | + create/edit users, advance orders  |
| anything else  | admin   | Everything, including deleting users |

The login page has one-click buttons for each role.

## Scripts

| Script                            | Purpose                                                                     |
| --------------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`                     | Vite dev server with the MSW browser worker                                 |
| `npm run build`                   | Type-check (`tsc -b`) then production build                                 |
| `npm run preview`                 | Serve the production build locally (mocks still enabled)                    |
| `npm run typecheck`               | `tsc -b --noEmit` across app, test and tooling projects                     |
| `npm run lint`                    | ESLint (flat config, type-aware `strictTypeChecked`), zero warnings allowed |
| `npm run format` / `format:check` | Prettier                                                                    |
| `npm test`                        | Vitest in watch mode (`npm test -- --run` for a single run)                 |
| `npm run test:coverage`           | Single run with V8 coverage report                                          |

Environment variables (see `.env.example`):

- `VITE_ENABLE_MOCKS` — set to `false` to disable MSW and talk to a real backend.
- `VITE_API_BASE_URL` — defaults to `/api`.

## Architecture

### Folder structure

```
src/
├── app/                      # Composition root: wiring only, no business logic
│   ├── App.tsx               # Global error boundary + providers + router
│   ├── router.tsx            # Route tree, lazy routes, guards, breadcrumb handles
│   ├── queryClient.ts        # QueryClient defaults (retry policy, background-error toasts)
│   ├── setupApiClient.ts     # Connects the HTTP client to the auth store
│   ├── providers/            # QueryClientProvider, theme sync, toaster
│   ├── layout/               # AppShell, Sidebar, Topbar, Breadcrumbs, UserMenu
│   ├── routes/               # Route error page, 404, typed route handle
│   └── styles/               # Design tokens (light/dark) and global CSS
├── features/
│   ├── auth/                 # api/ components/ hooks/ model/ types/  (+ index.ts public API)
│   ├── dashboard/            # api/ components/ types/
│   ├── users/                # api/ components/ hooks/ types/
│   ├── orders/               # api/ components/ hooks/ types/
│   ├── search/               # api/ components/ types/
│   └── settings/             # api/ components/ types/
├── shared/
│   ├── ui/                   # Design-system primitives (Button, Dialog, Table, Toast, …)
│   ├── hooks/                # useDebouncedValue, useFocusTrap, useListSearchParams, …
│   └── lib/                  # apiClient, formatting, pagination types, UI store
├── mocks/
│   ├── db/                   # Seeded PRNG, dataset generator, analytics aggregations
│   ├── handlers/             # MSW handlers per resource (auth, users, orders, …)
│   ├── browser.ts            # Service worker for dev / preview
│   ├── server.ts             # Node server for tests
│   └── config.ts             # Latency + simulated error rate
└── test/                     # Vitest setup and render helpers
```

Each feature owns its `api/` (`api.ts` for typed endpoint functions, `keys.ts` for its query key factory, `hooks.ts` for the TanStack Query hooks), its components, feature-specific hooks and types (including Zod schemas). Dependencies point one way: `app → features → shared`. Features may use another feature's public surface (e.g. `users` uses `Role` from `auth`), but `shared` never imports from a feature.

### Decisions

**TanStack Query for server state instead of Redux.** Almost all of the state in an admin app is a cache of server data. TanStack Query gives caching, deduplication, cancellation, background refetching, `keepPreviousData` pagination and optimistic updates out of the box; modelling that in Redux means re-implementing it with thunks, normalised slices and loading flags. What is left — theme, sidebar, the session token, the toast queue — is small, so it lives in a few tiny **Zustand** stores that can also be read outside React (the HTTP client reads the token, mutations push toasts).

**Feature folders over technical layers.** Grouping by feature (`users/`, `orders/`) keeps everything that changes together in one place, makes ownership obvious and keeps code-split boundaries aligned with routes. A `components/ hooks/ services/` split at the top level scales poorly once there are dozens of screens.

**The URL is the source of truth for list state.** Page, page size, sort, filters and search all live in search params, parsed through a Zod schema whose fields `.catch()` to defaults (so a hand-edited URL can't crash the page). That gives shareable links, working back/forward and refresh-safe state for free. `useListSearchParams` is generic and reused by users and orders; any filter change resets to page 1, and keystroke-driven updates replace rather than push history entries.

**Query key factories per feature.** `userKeys.lists()`, `userKeys.list(params)`, `userKeys.detail(id)` make invalidation precise (e.g. invalidate every cached users page after a mutation without touching details) and keep keys consistent between hooks.

**Optimistic delete with snapshot rollback.** Deleting a user cancels in-flight list queries, snapshots every cached page, removes the row everywhere, and restores all snapshots if the request fails, followed by a reconciling refetch. You can see it fail and roll back by turning on _Simulate server failures_ in Settings.

**Suspense + error boundaries per dashboard widget.** Dashboard queries use `useSuspenseQuery`; each widget wraps its body in `Suspense` (skeleton) and an `ErrorBoundary` connected to `QueryErrorResetBoundary`, so one failing endpoint shows an inline retry without affecting the rest of the page. The revenue range selector updates inside `startTransition`, so the previous chart stays on screen (dimmed) while the next range loads.

**Errors are normalised once.** `apiClient` turns every failure (HTTP error, non-JSON body, network failure) into an `ApiError` with `status`, `code`, `message` and `fieldErrors`. The retry policy skips 4xx, a 401 clears the session globally, forms map `fieldErrors` onto inputs, and the QueryCache shows a toast only for _background_ refetch failures, because initial-load failures are rendered inline by their component.

**One mock backend for dev and tests.** The same MSW handlers run in a service worker during development and in `msw/node` under Vitest, backed by a deterministic in-memory dataset (mulberry32 PRNG). Tests exercise the real fetch → handler → cache path instead of mocking hooks, and handlers validate payloads with the same Zod schemas the forms use.

**RBAC as data.** `ROLE_PERMISSIONS` is a single map from role to permission set. The UI reads it through `usePermission` / `<Can>` / `<RequirePermission>`, navigation hides items the role can't access, and the mock API checks the same map, so the client is never the only line of defence.

**Plain CSS Modules + custom properties.** Design tokens are CSS variables with light and dark sets switched by `data-theme` on `<html>`. A small inline script in `index.html` applies the persisted theme before first paint. No CSS-in-JS runtime and no utility framework, so styles stay close to the component and are easy to read. Charts get a matching JS palette because SVG presentation attributes don't reliably resolve CSS variables.

**Accessibility is part of the primitives.** Dialogs trap focus, close on Esc, restore focus and label themselves; the global search is an ARIA 1.2 combobox; the user menu supports arrow-key navigation; sortable headers expose `aria-sort`; form errors are linked with `aria-describedby`; toasts use live regions.

**Code splitting.** Every page is a `lazy` route, and vendor code is split into `react`, `query` and `charts` chunks so Recharts is only downloaded when the dashboard is visited.

### Testing

Tests use Vitest, React Testing Library and MSW, with a fresh `QueryClient`, memory router and reset database per test.

- `features/auth/model/permissions.test.ts`: the permission matrix and `checkPermissions` modes
- `features/auth/components/Can.test.tsx`: `<Can>`, `usePermission` (including role changes) and `<RequirePermission>`
- `features/users/components/UsersPage.test.tsx`: loading, debounced search synced to the URL, pagination, restoring state from the URL, filter-resets-page, optimistic delete with rollback, and viewer restrictions, all against MSW
- `features/users/components/UserForm.test.tsx`: Zod validation, trimmed submit values, and server field-error mapping
- `features/users/hooks/useUserListParams.test.tsx`: URL parsing, fallback for tampered params, and page reset rules
- `shared/hooks/useDebouncedValue.test.ts`: debouncing with fake timers
- `shared/lib/apiClient.test.ts`: param serialisation, auth header, error normalisation, network errors, and 401 handling

Note: jsdom swaps in its own `AbortController`, which Node's native `fetch` rejects. `src/test/setup.ts` restores Node's implementation so query cancellation works in tests the same way it does in the browser.

## Screenshots

> _Placeholder: add screenshots or a short GIF here._

| Dashboard (light)                      | Dashboard (dark)                      |
| -------------------------------------- | ------------------------------------- |
| `docs/screenshots/dashboard-light.png` | `docs/screenshots/dashboard-dark.png` |

| Users list                   | Order detail                        |
| ---------------------------- | ----------------------------------- |
| `docs/screenshots/users.png` | `docs/screenshots/order-detail.png` |

## Possible next steps

- Swap MSW for a real API by setting `VITE_ENABLE_MOCKS=false`; nothing else in the app needs to change.
- Generate API types from an OpenAPI schema instead of hand-written interfaces.
- Add Playwright end-to-end tests that run against `npm run preview`.
- Add virtualised tables for very large result sets.
