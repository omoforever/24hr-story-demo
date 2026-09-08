import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, vi } from "vitest";
import { StoryViewer } from "./StoryViewer";
import { STORY_DURATION_MS } from "@/hooks/useStoryPlayback";
import { expiryFor } from "@/lib/expiry";
import { Story } from "@/types/story";

const POSTED_AT = 1_700_000_000_000;

function storyWithId(id: string): Story {
  return {
    id,
    imageBase64: `data:image/jpeg;base64,${id}`,
    createdAt: POSTED_AT,
    expiresAt: expiryFor(POSTED_AT),
  };
}

const stories = [storyWithId("a"), storyWithId("b"), storyWithId("c")];

function currentImageSrc(): string | null {
  return screen.getByRole("img", { name: "Story" }).getAttribute("src");
}

function tap(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("StoryViewer", () => {
  it("stays closed when there is no start index", () => {
    render(<StoryViewer stories={stories} startIndex={null} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on the story that was tapped, not the first one", () => {
    render(<StoryViewer stories={stories} startIndex={1} onClose={vi.fn()} />);

    expect(currentImageSrc()).toBe(stories[1].imageBase64);
  });

  it("closes when the close button is tapped", async () => {
    const onClose = vi.fn();
    render(<StoryViewer stories={stories} startIndex={0} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Close story" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape, so the viewer is not a trap without a visible button", async () => {
    const onClose = vi.fn();
    render(<StoryViewer stories={stories} startIndex={0} onClose={onClose} />);

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("announces the story's position in the sequence", () => {
    render(<StoryViewer stories={stories} startIndex={1} onClose={vi.fn()} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Story 2 of 3",
    );
  });

  it("closes when the story being watched expires out from under it", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <StoryViewer stories={stories} startIndex={2} onClose={onClose} />,
    );

    // The expiry sweep prunes the list while the viewer is open on its last entry.
    rerender(
      <StoryViewer stories={[stories[0]]} startIndex={2} onClose={onClose} />,
    );

    expect(onClose).toHaveBeenCalled();
  });
});

describe("StoryViewer navigation", () => {
  it("advances on a tap in the next zone", () => {
    render(<StoryViewer stories={stories} startIndex={0} onClose={vi.fn()} />);

    tap("Next story");

    expect(currentImageSrc()).toBe(stories[1].imageBase64);
  });

  it("goes back on a tap in the previous zone", () => {
    render(<StoryViewer stories={stories} startIndex={2} onClose={vi.fn()} />);

    tap("Previous story");

    expect(currentImageSrc()).toBe(stories[1].imageBase64);
  });

  it("holds on the first story rather than closing when tapping back", () => {
    const onClose = vi.fn();
    render(<StoryViewer stories={stories} startIndex={0} onClose={onClose} />);

    tap("Previous story");

    expect(currentImageSrc()).toBe(stories[0].imageBase64);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes once the last story is advanced past", () => {
    const onClose = vi.fn();
    render(<StoryViewer stories={stories} startIndex={2} onClose={onClose} />);

    tap("Next story");

    expect(onClose).toHaveBeenCalled();
  });
});

// Fake timers are scoped to this block: MUI's Dialog transition never settles under them, which
// hangs any userEvent interaction elsewhere in the file.
describe("StoryViewer auto-advance", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("moves to the next story once the duration elapses", () => {
    render(<StoryViewer stories={stories} startIndex={0} onClose={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(STORY_DURATION_MS);
    });

    expect(currentImageSrc()).toBe(stories[1].imageBase64);
  });

  it("holds the story until the full duration has passed", () => {
    render(<StoryViewer stories={stories} startIndex={0} onClose={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(STORY_DURATION_MS - 1);
    });

    expect(currentImageSrc()).toBe(stories[0].imageBase64);
  });

  it("closes the viewer after the last story runs out", () => {
    const onClose = vi.fn();
    render(<StoryViewer stories={stories} startIndex={2} onClose={onClose} />);

    act(() => {
      vi.advanceTimersByTime(STORY_DURATION_MS);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("restarts the countdown after a manual tap, rather than inheriting the remainder", () => {
    render(<StoryViewer stories={stories} startIndex={0} onClose={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(STORY_DURATION_MS - 500);
    });
    act(() => {
      tap("Next story");
    });

    // An inherited timer would fire 500ms in and skip straight to the third story.
    act(() => {
      vi.advanceTimersByTime(STORY_DURATION_MS - 500);
    });

    expect(currentImageSrc()).toBe(stories[1].imageBase64);
  });

  it("does not run the timer while closed", () => {
    const onClose = vi.fn();
    render(<StoryViewer stories={stories} startIndex={null} onClose={onClose} />);

    act(() => {
      vi.advanceTimersByTime(STORY_DURATION_MS * 5);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
