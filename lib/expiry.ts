import { Story, STORY_LIFETIME_MS } from "@/types/story";

export function expiryFor(createdAt: number): number {
  return createdAt + STORY_LIFETIME_MS;
}

// A story is kept while `now` has not yet passed `expiresAt`, so one sitting exactly on its
// expiry instant still counts as active (ARCHITECTURE.md: filter out where `expiresAt < now`).
export function isExpired(story: Story, now: number): boolean {
  return story.expiresAt < now;
}

export function filterActive(stories: Story[], now: number): Story[] {
  return stories.filter((story) => !isExpired(story, now));
}

export function msUntilExpiry(story: Story, now: number): number {
  return Math.max(0, story.expiresAt - now);
}
