# ARCHITECTURE.md

## Folder structure

No `src/`, no backend folders (no `/api` beyond what Next.js needs for the shell — this is client-side only).

```
/app            # Next.js routes — likely just the single page
/components     # StoryTray, StoryAvatar, AddStoryButton, StoryViewer,
                #   StoryProgressBar, StoryTapZones
/lib            # storage.ts (localStorage get/set/prune),
                #   image.ts (resize + base64 conversion),
                #   expiry.ts (filter/compute expiry)
/hooks          # useStories (active story list, viewer open/index)
/types          # Story type
```

## Data flow

1. User picks a file → `image.ts` resizes it (canvas, constrained to 1080×1920) → base64 string
2. New `Story` object (`id`, `imageBase64`, `createdAt`, `expiresAt`) pushed to the store and written to `localStorage` via `storage.ts`
3. On app load, and on an interval, `expiry.ts` filters out stories where `expiresAt < now`, updates the store and rewrites `localStorage`
4. Viewer reads the current (unexpired) story list from the store — no separate fetch, it's all client memory backed by localStorage

## Data model

```ts
type Story = {
  id: string;
  imageBase64: string;
  createdAt: number;   // epoch ms
  expiresAt: number;   // createdAt + 24h, epoch ms
};
```

Stored under a single `localStorage` key (e.g. `stories`) as a JSON array.

## Key decisions

**[decide at build time] Expiry checking strategy**
Filter-on-read (load + interval) rather than a real per-story timer/deletion. Simpler, survives reloads and closed tabs without needing background sync.

**[decide at build time] Resize implementation**
Canvas-based resize before encoding, to respect the 1080×1920 cap and keep localStorage usage down.

**[decided 2026-09-08] Story state lives in a plain hook, not a store**
`hooks/useStories.ts` owns the active list and viewer index; the page calls it and passes values
down as props. No Context, no Zustand — the component tree is shallow enough (page → tray →
avatar, page → viewer) that prop drilling stays one or two levels. Revisit only if a component
needs the list without a direct parent path to it.

**[decided 2026-09-08] Two MUI themes rather than one with a mode toggle**
`app/theme.ts` exports `appTheme` (light) and `viewerTheme` (near-black). DESIGN.md wants the tray
on the normal background *while* the viewer is dark, so both palettes must render at the same
time — a single theme with `palette.mode` flipped cannot express that.

**[decided 2026-09-08] Emotion SSR via `AppRouterCacheProvider`**
`app/layout.tsx` stays a server component (so it can export `metadata`); `app/providers.tsx`
carries the `"use client"` boundary, because a `createTheme` object holds functions and can't be
passed as a prop across the server/client edge.

## Known constraints

- `localStorage` is ~5-10MB depending on browser — base64 images add ~37% over raw size, so story count is inherently limited. Not solved here (see PRODUCT.md future ideas — IndexedDB).
- No SSR-relevant data — this page can be effectively client-only; watch for `localStorage`/`window` access needing to be guarded for Next.js SSR (`typeof window !== 'undefined'` or a `useEffect`).

## File manifest

| Path | Purpose |
|------|---------|
| `app/layout.tsx` | Root server layout — fonts, metadata, viewport, Emotion cache + provider wrap |
| `app/providers.tsx` | `"use client"` boundary holding `ThemeProvider` + `CssBaseline` |
| `app/theme.ts` | `appTheme` (light shell) and `viewerTheme` (near-black viewer), 4px spacing unit |
| `app/page.tsx` | Home route — header today; `StoryTray` mounts here in the tray ticket |
| `app/page.test.tsx` | Render smoke test for the home route |
| `app/globals.css` | Only what the MUI theme can't express (full-height html/body, overflow-x guard) |
| `types/story.ts` | `Story` type + `STORY_LIFETIME_MS` |
| `vitest.config.mts` | jsdom + React plugin, `@/*` alias mirroring tsconfig |
| `vitest.setup.ts` | jest-dom matchers, RTL cleanup between tests |

## Schema changes log

N/A — no database for this project.
