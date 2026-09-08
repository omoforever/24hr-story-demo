# TICKETS.md

## Active

(none — project complete)

## Backlog

- [ ] **Page-level and end-to-end tests** — deferred, not abandoned. `app/page.tsx` has only a render smoke test, and there's no end-to-end flow test. Both need `addStory`, which calls canvas, so they'd require stubbing `lib/image.ts` or adding Playwright. Pick this up if the project is revived.

## Done

- [2026-09-08] **Test pass** — closed on review rather than new tests. Coverage was absorbed ticket by ticket (66 tests); the two remaining gaps are recorded as backlog and as an exemption in TESTING.md
- [2026-09-08] **Responsive pass** — frame capped by height so landscape stays phone-shaped, safe-area inset for notched devices. Verified 320px → wide desktop, both orientations
- [2026-09-08] **Expiry enforcement live** — 60s interval + `visibilitychange` re-check in `useStories`, identity-preserving refresh, viewer closes if the watched story expires. 8 tests
- [2026-09-08] **Swipe gestures** — `useStorySwipe` on Motion's drag: left/right navigate, down dismisses, distance-or-velocity threshold, click suppression so a swipe doesn't also fire a tap. 12 unit tests
- [2026-09-08] **Story viewer navigation** — `useStoryPlayback` (index + 5s auto-advance), `StoryTapZones`, Motion-driven progress fill, viewer takes list + start index. 14 RTL tests
- [2026-09-08] **Story viewer (static)** — full-screen `StoryViewer` on `viewerTheme`, `StoryProgressBar`, close button, phone-shaped frame on desktop. 5 RTL tests
- [2026-09-08] **Add story flow** — picker → resize/encode → save → tray updates, with `StorageFullError` surfaced in a snackbar
- [2026-09-08] **Story tray UI** — `StoryTray`, `StoryAvatar`, `AddStoryButton`, `useStories` hook, 6 RTL tests
- [2026-09-08] **Image handling** — `lib/image.ts`: `createImageBitmap` → canvas → JPEG base64, EXIF-aware. Test-exempt (see TESTING.md), verified on device
- [2026-09-08] **Story data model + storage utils** — `lib/expiry.ts` (pure, injected clock) + `lib/storage.ts` (prune-on-read, `StorageFullError` on quota), 25 unit tests
- [2026-09-08] **Project scaffold** — Next 16 + TS + MUI v9 + Motion v13, two themes, Emotion SSR, Vitest + RTL wired, `types/story.ts`, pushed to `omoforever/24hr-story-demo`
- [Date] Harness set up (PRODUCT/DESIGN/ARCHITECTURE/TESTING/CLAUDE.md drafted)
