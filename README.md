# 24hr Stories

A clone of the Instagram and WhatsApp stories feature, built to run entirely in the browser.
Post a photo, it appears in a tray at the top of the page, and it deletes itself 24 hours later.

There is no backend, no account to create, and no database. Everything lives in your browser's
local storage, which means stories are private to the device that posted them and will not follow
you to another browser.

Built as a [roadmap.sh project](https://roadmap.sh/projects/stories-feature).

## What it does

- Tap the plus tile to pick a photo from your device
- The photo is shrunk to fit within 1080x1920 and stored as text in local storage
- It appears in the tray straight away, with a gradient ring around it
- Tap a story to open it full screen
- Stories play as a sequence, advancing on their own after five seconds each
- Tap the right side to skip forward, the left side to go back
- Swipe left or right to move between stories, swipe down to close
- A bar across the top fills up to show how long is left on the current story
- Stories disappear on their own once they are 24 hours old, without needing a page refresh

## Running it

You need Node 22 or newer.

```
npm install
npm run dev
```

Then open http://localhost:3000.

To try it on your phone, use the network address that `npm run dev` prints (something like
`http://192.168.1.73:3000`) and make sure the phone is on the same Wi-Fi network. Note that
`localhost` will not work from a phone, because on the phone that means the phone itself.

### Other commands

```
npm test        Run the test suite
npm run build   Production build
npm run lint    Lint the project
```

## Built with

- Next.js 16 with the App Router, React 19 and TypeScript
- MUI v9 for components and theming
- Motion v13 for animation and drag gestures
- Vitest and React Testing Library for tests

## How it works

### Storing photos

A photo is loaded, shrunk on a canvas so it fits inside 1080x1920, and converted to a base64
string. That string goes into local storage as part of a JSON array.

Photos are saved as JPEG rather than PNG, because a PNG of a photo can be several times larger and
local storage only holds around 5 to 10MB in total. The image is also rotated to match its EXIF
orientation, otherwise photos taken on a phone are stored on their side.

If local storage runs out of space, saving fails with a clear message rather than deleting an
older story to make room.

### Expiry

Each story records the time it was created and the time it expires. Nothing is scheduled for
deletion. Instead, expired stories are filtered out whenever storage is read, and the shortened
list is written straight back.

This means expiry survives a page reload or a closed tab, with no background process needed. While
the app is open it re-reads once a minute, and also whenever the tab becomes visible again, since
browsers slow down timers in background tabs.

### Project layout

```
app/           Page, layout, theme
components/    Tray, avatar, add button, viewer, progress bar, tap zones
hooks/         Story list, viewer playback, swipe handling
lib/           Storage, expiry, image resizing
types/         The Story type
```

Logic is kept out of components. Anything involving time takes the current time as an argument
rather than reading the clock itself, which is what makes expiry and the auto-advance timer
testable without waiting.

## Testing

```
npm test
```

66 tests covering storage, expiry rules, swipe thresholds, playback timing, and the tray and
viewer components.

Image resizing is not covered by tests. It depends on the browser canvas, which the test
environment does not implement, so testing it would mean either faking the canvas or adding a
library purely for tests. It was checked by hand instead, across landscape photos, portrait phone
photos and small images. The same applies to the end to end flow, which goes through image
resizing. See `TESTING.md`.

## Limitations

These are deliberate, not oversights.

- Stories are stored on one device in one browser. Clearing site data deletes them.
- Local storage holds roughly 5 to 10MB, so only a handful of photos fit. Storing images as text
  adds about a third to their size.
- Photos only, no video.
- No reactions, replies or view counts.
- Seen and unseen rings are styled but not yet tracked, so every story shows the unseen ring.

## Documentation

The thinking behind the project is kept alongside the code:

- `PRODUCT.md` covers what is being built and why
- `DESIGN.md` covers the visual system and interaction details
- `ARCHITECTURE.md` covers structure and the decisions behind it
- `TESTING.md` covers what is tested and what is not
- `PROGRESS.md` is a running log of the work
- `TICKETS.md` tracks what is done and what is left
