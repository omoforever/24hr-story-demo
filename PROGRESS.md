# PROGRESS.md

Running log, newest at top. One entry per session or meaningful chunk of work — not per commit.

## Current state

Scaffold done. App builds, type-checks, lints and tests clean; empty themed page renders at
`localhost:3000`. Next up: `lib/storage.ts` + `lib/expiry.ts`.

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
