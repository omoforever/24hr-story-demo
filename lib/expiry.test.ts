import { expiryFor, filterActive, isExpired, msUntilExpiry } from "./expiry";
import { Story, STORY_LIFETIME_MS } from "@/types/story";

const POSTED_AT = 1_700_000_000_000;

function storyPostedAt(createdAt: number, id = "s1"): Story {
  return {
    id,
    imageBase64: "data:image/jpeg;base64,abc",
    createdAt,
    expiresAt: expiryFor(createdAt),
  };
}

describe("expiryFor", () => {
  it("expires a story 24 hours after it was posted", () => {
    expect(expiryFor(POSTED_AT)).toBe(POSTED_AT + 24 * 60 * 60 * 1000);
  });
});

describe("isExpired", () => {
  const story = storyPostedAt(POSTED_AT);

  it("keeps a story posted within the last 24 hours", () => {
    expect(isExpired(story, POSTED_AT + STORY_LIFETIME_MS - 1)).toBe(false);
  });

  it("keeps a story sitting exactly on its expiry instant", () => {
    expect(isExpired(story, POSTED_AT + STORY_LIFETIME_MS)).toBe(false);
  });

  it("expires a story one millisecond past its expiry instant", () => {
    expect(isExpired(story, POSTED_AT + STORY_LIFETIME_MS + 1)).toBe(true);
  });

  it("keeps a story whose clock reads before it was posted", () => {
    expect(isExpired(story, POSTED_AT - 1000)).toBe(false);
  });
});

describe("filterActive", () => {
  it("drops expired stories and keeps the rest", () => {
    const fresh = storyPostedAt(POSTED_AT, "fresh");
    const stale = storyPostedAt(POSTED_AT - STORY_LIFETIME_MS * 2, "stale");

    expect(filterActive([stale, fresh], POSTED_AT + 1000)).toEqual([fresh]);
  });

  it("preserves the order of the stories it keeps", () => {
    const first = storyPostedAt(POSTED_AT, "first");
    const second = storyPostedAt(POSTED_AT + 1000, "second");
    const third = storyPostedAt(POSTED_AT + 2000, "third");

    const kept = filterActive([first, second, third], POSTED_AT + 3000);

    expect(kept.map((story) => story.id)).toEqual(["first", "second", "third"]);
  });

  it("returns an empty list when every story has expired", () => {
    const stale = storyPostedAt(POSTED_AT, "stale");

    expect(filterActive([stale], POSTED_AT + STORY_LIFETIME_MS + 1)).toEqual([]);
  });

  it("handles an empty list", () => {
    expect(filterActive([], POSTED_AT)).toEqual([]);
  });

  it("does not mutate the list it was given", () => {
    const stale = storyPostedAt(POSTED_AT - STORY_LIFETIME_MS * 2, "stale");
    const stories = [stale];

    filterActive(stories, POSTED_AT);

    expect(stories).toEqual([stale]);
  });
});

describe("msUntilExpiry", () => {
  it("reports the time left on an active story", () => {
    const story = storyPostedAt(POSTED_AT);

    expect(msUntilExpiry(story, POSTED_AT + 1000)).toBe(STORY_LIFETIME_MS - 1000);
  });

  it("clamps to zero rather than going negative once expired", () => {
    const story = storyPostedAt(POSTED_AT);

    expect(msUntilExpiry(story, POSTED_AT + STORY_LIFETIME_MS * 3)).toBe(0);
  });
});
