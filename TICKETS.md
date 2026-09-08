# TICKETS.md

## Active

- [ ] **Story viewer navigation** — tap zones (prev/next), auto-advance timer, multi-story sequencing

## Backlog
- [ ] **Swipe gestures** — custom swipe handling for the viewer (left/right navigate, down closes)
- [ ] **Expiry enforcement live** — interval-based re-check while app is open, not just on load
- [ ] **Responsive pass** — mobile-first, confirm desktop degrades to centered phone-aspect viewer
- [ ] **Test pass** — fill in coverage per TESTING.md across all of the above

## Done

- [2026-09-08] **Story viewer (static)** — full-screen `StoryViewer` on `viewerTheme`, `StoryProgressBar`, close button, phone-shaped frame on desktop. 5 RTL tests
- [2026-09-08] **Add story flow** — picker → resize/encode → save → tray updates, with `StorageFullError` surfaced in a snackbar
- [2026-09-08] **Story tray UI** — `StoryTray`, `StoryAvatar`, `AddStoryButton`, `useStories` hook, 6 RTL tests
- [2026-09-08] **Image handling** — `lib/image.ts`: `createImageBitmap` → canvas → JPEG base64, EXIF-aware. Test-exempt (see TESTING.md), verified on device
- [2026-09-08] **Story data model + storage utils** — `lib/expiry.ts` (pure, injected clock) + `lib/storage.ts` (prune-on-read, `StorageFullError` on quota), 25 unit tests
- [2026-09-08] **Project scaffold** — Next 16 + TS + MUI v9 + Motion v13, two themes, Emotion SSR, Vitest + RTL wired, `types/story.ts`, pushed to `omoforever/24hr-story-demo`
- [Date] Harness set up (PRODUCT/DESIGN/ARCHITECTURE/TESTING/CLAUDE.md drafted)
