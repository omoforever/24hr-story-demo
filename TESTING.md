# TESTING.md

## Philosophy

Every code file gets a test, using whichever library fits that file's layer. Test behavior, not implementation. No file merges without corresponding tests unless there's a specific, stated reason it's exempt.

## What to cover

- `lib/expiry.ts` — unit tests: stories past 24h are filtered, stories within 24h are kept, boundary case at exactly 24h
- `lib/storage.ts` — unit tests: save/read round-trip, handles empty/missing key, prunes expired on read
- `lib/image.ts` — unit tests: output respects 1080×1920 cap, aspect ratio preserved, produces valid base64
- `StoryTray`, `StoryAvatar`, `AddStoryButton` — render + interaction tests (React Testing Library): tapping "+" opens picker, tapping an avatar opens the viewer on the right story
- `StoryViewer` — interaction tests: tap zones advance/go back, auto-advance timing, swipe navigation, close behavior
- At least one end-to-end-style flow: add a story → see it in the tray → open it → it advances/closes correctly (Playwright, or RTL if kept lightweight)

## Exemptions

- Pure type files with no logic
- Config files (`next.config.js`, etc.)

## Tools

- Unit/integration: Vitest
- Component: React Testing Library
- End-to-end: Playwright (optional for a project this size — at minimum, manually verify the flows before shipping)

## Commands

```
npm test           # unit/integration
npm run test:e2e   # end-to-end
```

## Before marking a ticket done

- Every new/changed file has a corresponding test, unless it's on the exemptions list
- Existing tests pass
- No console errors/warnings introduced
