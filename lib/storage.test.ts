import { afterEach, beforeEach, expect, vi } from "vitest";
import {
  STORAGE_KEY,
  StorageFullError,
  readStories,
  writeStories,
} from "./storage";
import { expiryFor } from "./expiry";
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

function storedRaw(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("writeStories / readStories round trip", () => {
  it("reads back exactly what was written", () => {
    const stories = [storyPostedAt(POSTED_AT, "a"), storyPostedAt(POSTED_AT, "b")];

    writeStories(stories);

    expect(readStories(POSTED_AT + 1000)).toEqual(stories);
  });

  it("replaces the previous contents rather than appending", () => {
    writeStories([storyPostedAt(POSTED_AT, "old")]);
    writeStories([storyPostedAt(POSTED_AT, "new")]);

    expect(readStories(POSTED_AT).map((story) => story.id)).toEqual(["new"]);
  });
});

describe("readStories when there is nothing usable stored", () => {
  it("returns an empty list when the key has never been set", () => {
    expect(readStories(POSTED_AT)).toEqual([]);
  });

  it("returns an empty list for an empty string", () => {
    window.localStorage.setItem(STORAGE_KEY, "");

    expect(readStories(POSTED_AT)).toEqual([]);
  });

  it("returns an empty list for unparseable JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    expect(readStories(POSTED_AT)).toEqual([]);
  });

  it("returns an empty list when the stored value is not an array", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "s1" }));

    expect(readStories(POSTED_AT)).toEqual([]);
  });

  it("drops malformed entries but keeps the valid ones", () => {
    const valid = storyPostedAt(POSTED_AT, "valid");
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([valid, { id: "missing-fields" }, null, "nonsense"]),
    );

    expect(readStories(POSTED_AT)).toEqual([valid]);
  });
});

describe("readStories pruning", () => {
  it("filters out stories older than 24 hours", () => {
    const fresh = storyPostedAt(POSTED_AT, "fresh");
    const stale = storyPostedAt(POSTED_AT - STORY_LIFETIME_MS * 2, "stale");
    writeStories([stale, fresh]);

    expect(readStories(POSTED_AT).map((story) => story.id)).toEqual(["fresh"]);
  });

  it("persists the prune, so expired stories do not come back on the next read", () => {
    const stale = storyPostedAt(POSTED_AT, "stale");
    writeStories([stale]);

    readStories(POSTED_AT + STORY_LIFETIME_MS + 1);

    expect(storedRaw()).toBe(JSON.stringify([]));
  });

  it("does not rewrite storage when nothing expired", () => {
    writeStories([storyPostedAt(POSTED_AT)]);
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    readStories(POSTED_AT + 1000);

    expect(setItem).not.toHaveBeenCalled();
  });
});

describe("writeStories when the quota is exhausted", () => {
  it("throws StorageFullError on a quota error", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(() => writeStories([storyPostedAt(POSTED_AT)])).toThrow(StorageFullError);
  });

  it("carries a message the add-story flow can show as-is", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(() => writeStories([storyPostedAt(POSTED_AT)])).toThrow(
      /enough browser storage/i,
    );
  });

  it("rethrows errors that are not about quota", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("nope", "SecurityError");
    });

    expect(() => writeStories([storyPostedAt(POSTED_AT)])).toThrow(DOMException);
  });
});
