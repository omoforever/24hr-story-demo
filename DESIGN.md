# DESIGN.md

## Design system

Not using the Sift (IKB blue, B2B) defaults here — this is a consumer, mobile-first, media-heavy UI, closer to Instagram's own visual language.

- Base: MUI v9 components, but themed dark for the story viewer specifically (viewer background near-black, tray stays on the app's normal background)
- Typography: system default via MUI (Inter is fine, no strong opinion here)
- Grid: 4px base unit, kept for consistency with other projects

## Component library

MUI v9 for structural pieces (Dialog/Modal for the full-screen viewer, IconButton, Avatar as the base for story thumbnails). Story-specific pieces (progress bar segments, tap zones) are custom — MUI has nothing purpose-built for these.

## Motion

**[revised 2026-09-08]** The original rule here was "custom swipe, no carousel library". That still holds for carousels — there is none — but swipe itself is now built on Motion's `drag` gestures rather than raw pointer events. Motion was already a dependency for transitions, so this adds nothing new, and it brings elastic drag and velocity tracking that hand-rolled `pointermove` handling would have had to reimplement. The decision of *what a gesture means* stays custom, in `hooks/useStorySwipe.ts`.

Motion v13, used sparingly:
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

**[2026-09-08] Tray avatar sizing** — `AVATAR_SIZE = 64` in `components/storyTrayLayout.ts`, shared by the add tile and the story avatars. Ring adds `2px` padding plus a `2px` background-coloured inner border, so the outer circle is 72px. Row gap is `spacing(3)` = 12px.

**[2026-09-08] Unseen ring** — `linear-gradient(45deg, #f09433, #dc2743, #bc1888)` drawn as a padded background behind the thumbnail, since CSS borders can't take a gradient. Seen state swaps it for a flat `divider` colour. Seen-tracking itself is not wired yet — `StoryAvatar` takes `isSeen`, nothing passes it until the viewer lands.

**[2026-09-08] Viewer frame** — one set of styles for both breakpoints: `width: 100%`, `maxWidth: 420`, `aspectRatio: 9/16`, centred on `common.black`. The cap never binds below 420px, so mobile is full-screen and desktop collapses to a phone-shaped frame without a `useMediaQuery` branch. Image is `objectFit: contain` — never `cover`, which would crop against the 1080×1920 work `image.ts` does.

**[2026-09-08] Progress bar** — segments are `height: 3`, fully rounded, `spacing(1)` = 4px apart, on a `rgba(255,255,255,0.35)` track with a `common.white` fill. Fill is a nested box driven by width percentage, so a timer can animate it linearly. Past segments render full, future empty, active partial. Bar and close button share one absolutely-positioned row so they can't overlap on narrow screens.

**[2026-09-08] Tap zones** — `flex: 1` previous / `flex: 2` next, as two invisible `ButtonBase` elements filling the frame. Real buttons rather than one div with click-coordinate maths, so keyboard and screen-reader users get "Previous story" / "Next story". The header row (progress bar + close) carries `zIndex: 1` to sit above them, otherwise the zones swallow taps on the close button.

**[2026-09-08] Swipe** — the frame is a draggable `motion.div` with `dragSnapToOrigin`, all-zero `dragConstraints` and `dragElastic: 0.5`, so it rubber-bands and springs back; the drag is only ever a gesture reading, never a position change. A swipe registers past **80px of travel or 500 velocity** — distance alone makes a fast flick feel broken, velocity alone loses a slow deliberate drag. The dominant axis wins so diagonals resolve to one intent. Only *downward* dismisses; upward is left free for a future action. `touchAction: "none"` on the frame is required, or iOS claims vertical drags for scroll before Motion sees them.

**[2026-09-08] Story duration** — `STORY_DURATION_MS = 5000`, Instagram's pacing. The active progress segment animates 0→100% linearly over it, keyed on the active index so it restarts from empty on every advance rather than sliding across from the previous segment.

**[2026-09-08] Tray motion** — new avatars enter with `opacity 0→1` and `scale 0.8→1` over 200ms, wrapped in `AnimatePresence` with `initial={false}` so existing stories don't animate on page load. The exit variant is what makes expiring stories fade out rather than vanish.
