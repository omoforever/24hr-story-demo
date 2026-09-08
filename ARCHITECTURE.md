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

**[decided 2026-09-08] Expiry checking strategy**
Filter-on-read (load + interval) rather than a real per-story timer/deletion. Simpler, survives reloads and closed tabs without needing background sync. `readStories` persists the prune so expired stories can't reappear on reload, and skips the rewrite when nothing was dropped.

**[decided 2026-09-08] Clock is injected, never read internally**
Every function in `lib/` takes `now: number` rather than calling `Date.now()`. Keeps `expiry.ts` pure and makes the exact-24h boundary testable without fake timers. Components pass `Date.now()` at the edge.

**[decided 2026-09-08] Live expiry is a re-read, not separate logic**
`useStories` re-reads storage on a 60s interval and on `visibilitychange`; `readStories` already prunes and persists, so there is no second expiry code path to keep in sync. The refresh returns the *existing* array when nothing expired, so the tray doesn't re-render every minute. Visibility matters because browsers throttle background timers, which is the drift risk PRODUCT.md names.

**[decided 2026-09-08] A story expiring mid-view closes the viewer**
Rather than clamping the index to the shortened list, which would drop the viewer onto a story the user didn't choose.

**[decided 2026-09-08] Viewer takes the list plus a start index, not a story**
`StoryViewer` receives `stories` and `startIndex` (null when closed) so it can sequence. The tray is the only component that knows a story's position, so it captures the index and `StoryAvatar` just reports that it was tapped. The index is never assumed in range — the list can shrink underneath the viewer when a story expires mid-view.

**[decided 2026-09-08] Progress fill animates outside React**
`StoryProgressBar` takes `durationMs` and lets Motion drive the width, rather than accepting a 0-1 `progress` pushed from a timer — that would be ~60 renders/second for a cosmetic fill. Trade-off: the fill isn't readable from tests, so auto-advance is asserted via the timer and the rendered image.

**[decided 2026-09-08] Full storage throws rather than evicting**
`writeStories` raises `StorageFullError` when the quota is exhausted. PRODUCT.md's mitigation is resize-before-store, not auto-delete — silently dropping a user's story to make room is worse than an honest failure the add-story flow can show.

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
| `lib/expiry.ts` | Pure expiry maths — `expiryFor`, `isExpired`, `filterActive`, `msUntilExpiry` |
| `lib/storage.ts` | `localStorage` read/write, prune-on-read, `StorageFullError` on quota |
| `lib/expiry.test.ts` | Unit tests, including the exact-24h boundary |
| `lib/storage.test.ts` | Unit tests — round trip, corrupt data, prune persistence, quota |
| `lib/image.ts` | `File` → `createImageBitmap` → canvas resize → JPEG base64, EXIF-aware |
| `hooks/useStories.ts` | Active story list + `addStory`; hydrates from storage after mount |
| `components/StoryTray.tsx` | Horizontal scroll row — add tile then one avatar per story |
| `components/StoryAvatar.tsx` | Circular thumbnail with gradient (unseen) or grey (seen) ring |
| `components/AddStoryButton.tsx` | "+" tile wrapping a hidden file input |
| `components/storyTrayLayout.ts` | Shared `AVATAR_SIZE` so the tile and avatars stay aligned |
| `components/StoryTray.test.tsx` | RTL tests covering all three tray components |
| `components/StoryViewer.tsx` | Full-screen Dialog on `viewerTheme` — image, progress bar, close |
| `components/StoryProgressBar.tsx` | Segmented bar, one segment per story, partial fill on the active one |
| `components/StoryViewer.test.tsx` | RTL tests — open/closed, navigation, auto-advance, aria |
| `components/StoryTapZones.tsx` | Invisible prev/next targets over the frame, 1:2 flex split |
| `hooks/useStoryPlayback.ts` | Viewer index + 5s auto-advance timer, `STORY_DURATION_MS` |
| `hooks/useStorySwipe.ts` | Reads Motion drag end into navigate/dismiss, plus click suppression |
| `hooks/useStorySwipe.test.ts` | Unit tests — direction, thresholds, diagonals, click suppression |
| `hooks/useStories.test.ts` | Unit tests — hydration, live expiry sweep, visibility re-check |
| `vitest.config.mts` | jsdom + React plugin, `@/*` alias mirroring tsconfig |
| `vitest.setup.ts` | jest-dom matchers, RTL cleanup between tests |

## Schema changes log

N/A — no database for this project.
