@PRODUCT.md
@DESIGN.md
@ARCHITECTURE.md
@TESTING.md
@PROGRESS.md
@TICKETS.md

## Project context

**Stories Feature** — a client-side clone of Instagram/WhatsApp Stories (roadmap.sh advanced project). Upload a photo → resized/base64'd → stored in `localStorage` → shown in a story tray → viewable full-screen with swipe/tap navigation → auto-expires 24h after posting. No backend, no auth, no database — everything lives in the browser.

- **Frontend stack:** Next.js 16 (App Router), TypeScript, React 19, MUI v9, Motion v13
- **No Supabase, no server-side data** — this deviates from the usual stack; don't reach for backend patterns here
- **Design:** dark full-screen viewer, mobile-first, custom swipe (no carousel library, by choice — see DESIGN.md)
- **Solo dev + Claude:** learning project, prioritise clarity over cleverness; small enough that no phased plan is needed, just work `TICKETS.md` top to bottom
- **Learning mode: one file at a time.** Create a single file, then stop and wait for review before creating the next. Don't batch multiple new files in one turn.

## Doc map

- `PRODUCT.md` — what we're building, flows, expiry/storage decisions
- `DESIGN.md` — visual system, tray/viewer layout, breakpoints
- `ARCHITECTURE.md` — folder structure, data model, `localStorage` constraints
- `TESTING.md` — what and how to test
- `PROGRESS.md` — current state
- `TICKETS.md` — active and backlog work items

## Coding standards

- **file_length_and_structure** — 500-line hard cap per file; split well before that. Proper folders (`components/`, `hooks/`, `lib/`, `types/`); one component per file.
- **component_and_function_size** — functions under 20-30 lines; components under 150 lines. Extract complex logic into hooks.
- **single_responsibility** — every file/function does one thing.
- **separation_of_concerns** — UI components, business logic (`lib/`), state, and storage each live in their own layer.
- **naming_and_readability** — descriptive names (`StoryViewer`, not `Viewer2`); boolean vars read clearly (`isExpired`, `hasStories`).
- No speculative abstraction — this is a small, scoped project. Build what the tickets ask for.

## Comments

Let the code explain itself through naming and structure first. A comment earns its place only when it explains *why*, not *what* — a non-obvious constraint, a tradeoff, a gotcha someone would otherwise trip over. No comments that restate what the next line obviously does. If a function needs a comment to explain what it does, consider renaming it instead.

## Feature development process

1. Define outcomes first: what files, what the user can do when it's done (checkboxes), what routes/components are needed.
2. Plan implementation: list files, sketch structure, reuse existing patterns (e.g. `storage.ts` conventions once set).
3. Research and plan before executing — discuss non-trivial approach in conversation first.
4. Create one file. Stop and wait for review before creating the next — don't move on unprompted.
5. Build and verify: type check, test each outcome, add tests per `TESTING.md`.
6. On completing a ticket: update `PROGRESS.md`, move the ticket to Done in `TICKETS.md`.
7. Don't silently expand scope — flag anything extra as a new backlog ticket.

## Ship it process

Triggers: "ship it", "wrap up", "end of session". Run this sequence without stopping for confirmation between steps:

1. Make sure all new/changed files have tests (`TESTING.md`) and tests pass.
2. Commit with a clear, conventional message.
3. Push and open a PR against the default branch, with a short description and a reference to the ticket.
4. Merge the PR.
5. Update `PROGRESS.md` and close the ticket in `TICKETS.md`.

If tests are failing or something's unresolved, stop and flag it instead of shipping anyway.

## Working habits

- Small, reviewable chunks — one ticket at a time.
- Ask before introducing a new dependency (especially any swipe/carousel library — custom is the deliberate choice here).
- Ask before changing an established pattern rather than deviating quietly.
- Surface trade-offs rather than picking silently when there's a real judgment call (e.g. localStorage limits, resize quality vs size).

## File manifest

See `ARCHITECTURE.md` — kept there as the single source of truth, not duplicated here.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
