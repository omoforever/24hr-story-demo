# TICKETS.md

## Active

- [ ] **Story data model + storage utils** — `lib/storage.ts` (save/read/prune), `lib/expiry.ts` (filter logic), unit tests. `types/story.ts` already landed with the scaffold.

## Backlog
- [ ] **Image handling** — `lib/image.ts`: file → canvas resize (max 1080×1920) → base64, unit tests
- [ ] **Story tray UI** — `StoryTray`, `StoryAvatar`, `AddStoryButton`; renders active (unexpired) stories + add tile
- [ ] **Add story flow** — file picker → resize/encode → save → tray updates
- [ ] **Story viewer (static)** — full-screen `StoryViewer`, single story display, progress bar, close button
- [ ] **Story viewer navigation** — tap zones (prev/next), auto-advance timer, multi-story sequencing
- [ ] **Swipe gestures** — custom swipe handling for the viewer (left/right navigate, down closes)
- [ ] **Expiry enforcement live** — interval-based re-check while app is open, not just on load
- [ ] **Responsive pass** — mobile-first, confirm desktop degrades to centered phone-aspect viewer
- [ ] **Test pass** — fill in coverage per TESTING.md across all of the above

## Done

- [2026-09-08] **Project scaffold** — Next 16 + TS + MUI v9 + Motion v13, two themes, Emotion SSR, Vitest + RTL wired, `types/story.ts`, pushed to `omoforever/24hr-story-demo`
- [Date] Harness set up (PRODUCT/DESIGN/ARCHITECTURE/TESTING/CLAUDE.md drafted)
