# PROGRESS.md

Running log, newest at top. One entry per session or meaningful chunk of work — not per commit.

## Current state

Storage layer done and tested (26 tests green). Nothing renders stories yet — the page is still
the empty header. Next up: `lib/image.ts` (file → canvas resize → base64).

---

## 2026-09-08 — Story data model + storage utils

`lib/expiry.ts` and `lib/storage.ts`, 25 unit tests between them.

Shape of it:

- **Clock is always injected.** Every function takes `now: number`; nothing calls `Date.now()`
  internally. That's what makes the exact-24h boundary testable without fake timers.
- **`expiry.ts` is pure** — no storage, no clock. `storage.ts` depends on it, never the reverse.
- **Prune-on-read persists.** `readStories` rewrites storage when it drops something, so expired
  stories can't reappear after a reload. The rewrite is skipped when nothing expired — ticket 9's
  interval would otherwise re-serialise every base64 image on every tick.
- **Reads never throw, writes can.** A corrupt or blocked store returns `[]` so the tray still
  renders; a failed *save* throws `StorageFullError`, because silently losing a photo is worse.

Decisions taken:

- **Quota → typed error, not eviction.** PRODUCT.md's mitigation is "resize before storing", not
  "auto-delete", so `writeStories` throws `StorageFullError` (with a user-facing message) rather
  than dropping the oldest story to make room. The add-story flow surfaces it.
- **Boundary is `expiresAt < now`**, per ARCHITECTURE.md — a story sitting exactly on its expiry
  instant is still active. Pinned by tests at -1ms, exactly, and +1ms.
- **Malformed entries are dropped individually**, not treated as a whole-store corruption, so one
  bad record can't wipe the rest.

Notes:

- `window.localStorage` *throws* in Safari private mode rather than returning null, so the access
  is inside a try/catch — an SSR-only `typeof window` guard isn't enough.
- `readStories` both reads and writes, which strains single-responsibility. Kept deliberately:
  splitting it would let a caller forget to persist the prune.
- Also fixed here: `allowedDevOrigins` in `next.config.ts`. Next 16 blocks HMR as a cross-origin
  request when the dev server is opened from a phone on the LAN — the page loads but never
  hot-reloads. Wildcarded across the subnet since the host IP is DHCP-assigned.

---

## 2026-09-08 — Project scaffold

Next 16 + React 19 + TypeScript, MUI v9, Motion v13, Vitest + RTL. No `src/`, no Tailwind.
Pushed to `omoforever/24hr-story-demo`.

Decisions taken this session (detail in ARCHITECTURE.md):

- Went to **latest versions** rather than the Next 15 / Motion 12 the docs originally pinned.
- Story state will be a **plain `useStories` hook**, no Context or store library — `/state` in
  ARCHITECTURE.md became `/hooks`.
- **Two themes** (`appTheme`, `viewerTheme`) instead of one with a mode toggle, because the tray
  and the viewer need opposite palettes on screen simultaneously.
- `app/providers.tsx` added beyond the planned file list to hold the client boundary, keeping
  `layout.tsx` a server component.

Snags worth remembering:

- `create-next-app` refuses to run into a non-empty directory, so it was scaffolded in a temp dir
  and copied in — deliberately excluding the `CLAUDE.md` and `AGENTS.md` it generates.
- Vitest 5 needs `@types/node` ^22; the scaffold pins ^20. Bumped it rather than reaching for
  `--legacy-peer-deps`.
- MUI v9 dropped system props on `Typography` — `fontWeight` etc. must go through `sx`.
- `vitest.config.ts` had to become `.mts` to stop a Vite CommonJS warning.
- `next dev` appends a `nextjs-agent-rules` block to `CLAUDE.md` on every run. Decided to commit
  it rather than disable via `agentRules: false`.

---
