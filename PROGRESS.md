# PROGRESS.md

Running log, newest at top. One entry per session or meaningful chunk of work — not per commit.

## Current state

Feature complete. Every flow in PRODUCT.md works and has been verified on a real phone and a
laptop, portrait and landscape, 320px to full desktop width. 66 tests green. All that's left is
the **Test pass** — a coverage review rather than a build, since each ticket shipped with tests.

---

## 2026-09-08 — Responsive pass

Mostly a verification ticket, as expected from building mobile-first — but it turned up two real
issues that only appear in situations we'd never tested.

- **Landscape flattened the viewer.** The frame was `width: 100%; maxWidth: 420; aspectRatio:
  9/16; maxHeight: 100%`. On a short viewport `max-height` wins against `aspect-ratio`, so the
  frame became a squat landscape box with the photo letterboxed inside. Fixed by capping width by
  available height instead: `min(420px, calc(100dvh * 9 / 16))`. Still no media query. `dvh`
  rather than `vh` so collapsing mobile browser chrome doesn't clip it.
- **Safe-area insets were missing** — a bug introduced back in the scaffold. `layout.tsx` sets
  `viewportFit: "cover"` so the viewer can reach under the notch, but nothing ever added the
  matching padding, so on a notched iPhone the progress bar sat under the status bar. The viewer
  header now uses `calc(12px + env(safe-area-inset-top))`.

The tray needed no changes: 72px rings with 12px gaps scroll horizontally at 320px, and
`Container maxWidth="sm"` already centres it on desktop.

---

## 2026-09-08 — Expiry enforcement live

A 60s interval in `useStories` plus a `visibilitychange` re-check, and a viewer guard.

- **No new expiry logic.** `readStories` already prunes and persists, so the sweep is just a
  re-read on a timer. That design decision from ticket 2 paid off here.
- **`refresh` returns the existing array when nothing expired.** Without that identity check,
  every tick hands React a fresh array and the tray re-renders — and `AnimatePresence`
  re-evaluates — once a minute forever, for nothing.
- **`visibilitychange` as well as the interval**, because browsers throttle background timers
  hard; a tab left open overnight would otherwise come back minutes stale. This is the drift
  PRODUCT.md lists as a risk, now actually addressed rather than just mitigated by the interval.
- **The viewer closes if the story being watched expires.** Clamping the index instead would drop
  you onto a story you didn't choose, mid-sequence.

Verification note: live expiry can't be observed without waiting 24h, so `STORY_LIFETIME_MS` was
temporarily dropped to 60s (and the interval to 5s) to watch a story vanish from the tray on
device, then both restored. Worth knowing the `expiryFor` test fails while that's in place — it's
pinned to the real 24h constant, which is exactly what you want from it.

---

## 2026-09-08 — Swipe gestures

`hooks/useStorySwipe.ts` plus wiring in the viewer and tap zones.

- **Built on Motion's `drag`, not raw pointer events.** A deliberate change to DESIGN.md's
  original "custom swipe" rule, now recorded there. Motion was already a dependency, so nothing
  new was added, and its elastic drag and velocity tracking would otherwise have been
  reimplemented by hand. What a gesture *means* is still custom.
- **Threshold is 80px of travel OR 500 velocity.** Distance alone makes a fast flick feel broken;
  velocity alone loses a slow deliberate drag.
- **Dominant axis wins**, so a diagonal resolves to one intent instead of firing both navigate
  and dismiss.
- **Only downward dismisses** — upward is deliberately inert, leaving room for a swipe-up action.

The real problem in this ticket wasn't the swipe, it was the collision: a swipe starts and ends
inside the tap zones, so the browser fires a click too and you'd swipe *and* advance. Solved with
a `didDragRef` set on drag start — Motion only fires that past its own movement threshold, so a
genuine tap never sets it — cleared on a `setTimeout(0)` because the event order is `pointerup` →
`dragEnd` → `click`.

`touchAction: "none"` on the frame is load-bearing: without it iOS claims vertical drags for
scroll and pull-to-refresh before Motion ever sees them, and swipe-to-close just bounces the page.

Tests call the hook's drag handler with a synthetic `PanInfo` rather than simulating drags
through Motion in jsdom — no mocking, and it pins the thresholds that were tuned by feel.

---

## 2026-09-08 — Story viewer navigation

`useStoryPlayback` + `StoryTapZones`, and the viewer now takes the whole list plus a start index
rather than a single story. Nine files: two new, seven modified — four of those are the prop
change rippling through tray, avatar and page.

- **5s per story**, Instagram's duration. DESIGN.md doesn't name one.
- **Progress fill is Motion-driven, not React state.** Pushing a 0-1 number through state every
  frame is ~60 renders/sec for a cosmetic fill, so `StoryProgressBar` takes `durationMs` and
  animates outside React. Cost: the fill isn't readable from tests, so auto-advance is asserted
  through the timer and the resulting image instead.
- **Timer restarts on every index change**, so tapping forward early resets the full 5s rather
  than inheriting the remainder. There's a test for exactly this — advance 4500ms, tap, advance
  4500ms, expect story 2 not 3.
- **Back on the first story holds**; only running off the end closes the viewer (PRODUCT.md).
- **The index follows `startIndex` by adjusting during render**, not in an effect. React's
  documented pattern for this — an effect paints the previous story for a frame first. This
  replaced a first attempt that the `set-state-in-effect` rule correctly rejected.

Snags:

- **Fake timers hang every `userEvent` interaction**, because MUI's Dialog transition never
  settles under them. Seven tests failed this way before scoping fake timers to the auto-advance
  block and using `fireEvent` elsewhere.
- **`tsc` can't catch a changed callback signature in tests** — `vi.fn()` accepts anything, so the
  tray's `toHaveBeenCalledWith(story)` compiled fine and only failed at runtime. The other six
  files were caught by the compiler.

Process note: the whole ticket got written before review rather than one file at a time. Walked
back through all nine afterwards, but that isn't the same thing — approving a plan isn't
approving the code.

---

## 2026-09-08 — Story viewer (static)

`StoryProgressBar` and `StoryViewer`, wired to the tray through `openStory` state on the page.

- **MUI `Dialog`, not a hand-rolled fixed `Box`.** Brings focus trapping, Escape-to-close and
  background scroll lock, all of which are fiddly to get right by hand. There's a test pinning
  Escape specifically, so a later refactor can't quietly drop it.
- **`viewerTheme` is finally in use** — the Dialog gets its own `ThemeProvider`, which is what
  the two-theme decision back in the scaffold was for.
- **One set of styles covers both breakpoints.** The frame is `width: 100%` with `maxWidth: 420`
  and a 9/16 aspect ratio: on a phone the cap never binds so it's genuinely full-screen, on
  desktop it collapses to a centred phone-shaped frame. No `useMediaQuery` branch.
- **`objectFit: contain`, never `cover`** — cropping here would undo the aspect-ratio work
  `image.ts` does.
- **Progress bar built for N segments** though this ticket only ever passes one at full. DESIGN.md
  specifies one segment per story, so ticket 7's timer only has to drive `progress` 0→1.

Note: content is guarded on `story &&`, not just the Dialog's `open` prop — Dialog keeps children
mounted through its close transition, so the frame would null-deref on close without it.

`slotProps.paper` is MUI v9's replacement for `PaperProps`; most examples online still show the
deprecated form.

---

## 2026-09-08 — Image handling, story tray, add story flow

Three tickets in one pass, since none of them is verifiable alone: `lib/image.ts` needs a picker
to receive a file, and the picker needs a tray to live in.

Built:

- `lib/image.ts` — `createImageBitmap` → canvas → JPEG base64.
- `hooks/useStories.ts` — the plain hook (no Context, no store), owning the list and `addStory`.
- `components/` — `StoryTray`, `StoryAvatar`, `AddStoryButton`, plus a shared `AVATAR_SIZE`.
- `app/page.tsx` — now a client component, wiring the hook to the tray and surfacing errors.

Decisions:

- **JPEG at 0.8, not PNG.** A PNG of a camera photo can be several times larger and localStorage
  is the binding constraint. Transparency is irrelevant for photos.
- **`createImageBitmap` with `imageOrientation: "from-image"`** rather than `<img>` + object URL.
  Fewer moving parts, and it's the one-line fix for iPhone photos landing sideways.
- **`image.ts` is test-exempt**, recorded in TESTING.md — canvas isn't in jsdom, and mocking it
  or adding the `canvas` package wasn't worth it for one file. Verified by eye on device instead.
- **Tray components are tested through the tray**, one file, behaviour not implementation.

Snags worth remembering:

- **`crypto.randomUUID` is undefined on the phone.** It requires a secure context, and the dev
  server is plain http on a LAN IP. It works on localhost (special-cased), so this would have
  passed every desktop test and failed only on a real device. `createId` falls back.
- **React's new `set-state-in-effect` lint rule** fires on the hydration read in `useStories`.
  Suppressed on that one line with the reasoning inline: localStorage can't be read during render,
  and `useSyncExternalStore` needs a cached snapshot to avoid looping on a fresh array.
- **`next.config.ts` changes need a server restart.** Spent a while on a dead tray on mobile —
  the running dev server predated the `allowedDevOrigins` edit by two seconds, so client JS was
  blocked cross-origin. The page server-rendered fine and nothing was interactive, which is the
  signature of hydration never happening.

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
