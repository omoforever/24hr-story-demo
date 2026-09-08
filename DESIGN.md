# DESIGN.md

## Design system

Not using the Sift (IKB blue, B2B) defaults here — this is a consumer, mobile-first, media-heavy UI, closer to Instagram's own visual language.

- Base: MUI v9 components, but themed dark for the story viewer specifically (viewer background near-black, tray stays on the app's normal background)
- Typography: system default via MUI (Inter is fine, no strong opinion here)
- Grid: 4px base unit, kept for consistency with other projects

## Component library

MUI v9 for structural pieces (Dialog/Modal for the full-screen viewer, IconButton, Avatar as the base for story thumbnails). Story-specific pieces (progress bar segments, tap zones) are custom — MUI has nothing purpose-built for these.

## Motion

Motion v12, used sparingly:
- Tray: new story avatar enters with a small scale/fade
- Viewer: story-to-story transitions on swipe/advance (slide), progress bar fill is a linear animation tied to story duration
- Keep transitions snappy (150-250ms) — Stories is a fast-consumption UI, animation shouldn't slow it down

## UX principles

- Clarity over density — tray stays a simple horizontal scroll of circular avatars
- Every interactive element gives feedback (tap states on avatars, progress bar shows time remaining)
- Mobile-first: this pattern originates on mobile, design and test at mobile width first, then confirm desktop degrades sensibly (centered, capped-width viewer)

## Key views

### Story tray (home)
Horizontal scrollable row at the top of the page. "+" tile first, then one avatar per active user/story (for this single-user demo: "+" tile, then one avatar per unexpired story, or grouped as one avatar with a ring if multiple stories are treated as one user's set — decide based on how many stories you want visibly stacked). Unseen stories get a gradient ring; seen stories a plain grey ring.

### Story viewer (full-screen)
Near-black background, image centered/contained (never cropped oddly — respect aspect ratio within the 1080×1920 cap). Segmented progress bar across the top, one segment per story in the current sequence, filling over the display duration. Left third of the screen = previous, right two-thirds = next (standard IG tap zones). Swipe left/right also navigates. Close (X) top-right or swipe down.

## Responsive breakpoints

- Mobile (< 600px): viewer is full viewport, tray avatars ~56-64px
- Desktop (≥ 600px): viewer capped at a phone-like aspect ratio, centered with dimmed backdrop either side, so it doesn't stretch into an ugly wide layout

## Patterns log

Log established patterns here as they're built (e.g. exact tap-zone split, progress bar segment styling) so the viewer stays consistent if more story types are added later.
