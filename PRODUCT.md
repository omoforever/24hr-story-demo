# PRODUCT.md

## What this is

A client-side clone of Instagram/WhatsApp Stories: upload a photo, it appears in a story tray, viewers can swipe through stories full-screen, and each story disappears automatically 24 hours after posting. No backend — everything lives in the browser.

(roadmap.sh project: [Stories Feature](https://roadmap.sh/projects/stories-feature), advanced tier.)

## Problem

Learning exercise — practice client-side storage, timers/expiry logic, and responsive UI, using a well-known, well-specified interaction pattern.

## Target user

Me, building it. Secondarily: anyone who opens the deployed demo.

## Core user flows

### Add a story
1. Tap the "+" tile in the tray
2. Pick an image from the file picker
3. Image is resized/constrained (max 1080×1920), converted to base64
4. Story is saved to localStorage with a timestamp, appears in the tray immediately

### View stories
1. Tap a story avatar in the tray
2. Full-screen viewer opens on that story, with a progress bar per story
3. Story auto-advances after a fixed duration; tapping left/right or swiping moves manually
4. Viewer closes after the last story, or on explicit close

### Story expiry
1. On load (and periodically while the app is open), stories older than 24h are filtered out of the tray and removed from localStorage

## Out of scope

- Backend/server persistence, multi-user, multi-device sync
- Video stories
- Reactions, replies, view counts
- Story highlights / saved stories beyond 24h

## Key technical decisions

- **Storage:** base64-encoded images in `localStorage`, one array of story objects. No IndexedDB — simplicity over capacity, acceptable given the 24h ephemeral nature and expected low volume in a demo.
- **Expiry:** not a real timer/deletion at exactly T+24h. Each story carries `expiresAt`; expired stories are filtered out on read (app load, and on an interval while open). Simpler and reload-safe.
- **Resize before storing:** images are downscaled to fit within 1080×1920 *before* base64 encoding, to keep localStorage usage manageable (base64 adds ~37% overhead on top of image size).

## Success criteria

- Meets the roadmap.sh requirements as written (tray + plus button, base64/localStorage, 24h expiry, optional swipe, responsive, 1080×1920 cap)
- Feels responsive/smooth on mobile viewport, since Stories is a mobile-first pattern

## Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| localStorage 5-10MB limit hit with several images | Resize/compress before storing; drop oldest expired entries eagerly |
| Expiry drifts if user leaves tab open a long time | Re-check expiry on an interval, not just on load |
| Large images slow to encode/decode on low-end devices | Resize via `<canvas>` before base64 conversion, off the main thread if it becomes a problem |

## Future ideas

- IndexedDB for higher capacity
- Video stories
- Multi-user backend
