import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, vi } from "vitest";
import { EXPIRY_CHECK_INTERVAL_MS, useStories } from "./useStories";
import { expiryFor } from "@/lib/expiry";
import { writeStories } from "@/lib/storage";
import { Story, STORY_LIFETIME_MS } from "@/types/story";

const NOW = 1_700_000_000_000;

function storyPostedAt(createdAt: number, id: string): Story {
  return {
    id,
    imageBase64: `data:image/jpeg;base64,${id}`,
    createdAt,
    expiresAt: expiryFor(createdAt),
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useStories hydration", () => {
  it("starts empty and loads what is already stored", () => {
    writeStories([storyPostedAt(NOW, "stored")]);

    const { result } = renderHook(() => useStories());

    expect(result.current.stories.map((story) => story.id)).toEqual(["stored"]);
    expect(result.current.isLoaded).toBe(true);
  });

  it("drops stories that expired before the app was opened", () => {
    writeStories([storyPostedAt(NOW - STORY_LIFETIME_MS * 2, "stale")]);

    const { result } = renderHook(() => useStories());

    expect(result.current.stories).toEqual([]);
  });
});

describe("useStories live expiry", () => {
  it("removes a story that expires while the app is open", () => {
    writeStories([storyPostedAt(NOW, "expiring")]);
    const { result } = renderHook(() => useStories());

    expect(result.current.stories).toHaveLength(1);

    act(() => {
      vi.setSystemTime(NOW + STORY_LIFETIME_MS + 1);
      vi.advanceTimersByTime(EXPIRY_CHECK_INTERVAL_MS);
    });

    expect(result.current.stories).toEqual([]);
  });

  it("keeps a story that has not expired yet", () => {
    writeStories([storyPostedAt(NOW, "fresh")]);
    const { result } = renderHook(() => useStories());

    act(() => {
      vi.advanceTimersByTime(EXPIRY_CHECK_INTERVAL_MS * 5);
    });

    expect(result.current.stories).toHaveLength(1);
  });

  it("keeps the same array when nothing expired, so the tray does not re-render", () => {
    writeStories([storyPostedAt(NOW, "fresh")]);
    const { result } = renderHook(() => useStories());
    const before = result.current.stories;

    act(() => {
      vi.advanceTimersByTime(EXPIRY_CHECK_INTERVAL_MS);
    });

    expect(result.current.stories).toBe(before);
  });

  it("re-checks when the tab becomes visible, since background timers are throttled", () => {
    writeStories([storyPostedAt(NOW, "expiring")]);
    const { result } = renderHook(() => useStories());

    act(() => {
      vi.setSystemTime(NOW + STORY_LIFETIME_MS + 1);
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.stories).toEqual([]);
  });

  it("stops checking once unmounted", () => {
    writeStories([storyPostedAt(NOW, "fresh")]);
    const { unmount } = renderHook(() => useStories());

    unmount();

    expect(() =>
      act(() => {
        vi.advanceTimersByTime(EXPIRY_CHECK_INTERVAL_MS * 3);
      }),
    ).not.toThrow();
  });
});
