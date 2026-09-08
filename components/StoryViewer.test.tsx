import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import { StoryViewer } from "./StoryViewer";
import { expiryFor } from "@/lib/expiry";
import { Story } from "@/types/story";

const POSTED_AT = 1_700_000_000_000;

const story: Story = {
  id: "s1",
  imageBase64: "data:image/jpeg;base64,abc",
  createdAt: POSTED_AT,
  expiresAt: expiryFor(POSTED_AT),
};

describe("StoryViewer", () => {
  it("stays closed when there is no story", () => {
    render(<StoryViewer story={null} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the story image once opened", () => {
    render(<StoryViewer story={story} onClose={vi.fn()} />);

    expect(screen.getByRole("img", { name: "Story" })).toHaveAttribute(
      "src",
      story.imageBase64,
    );
  });

  it("closes when the close button is tapped", async () => {
    const onClose = vi.fn();
    render(<StoryViewer story={story} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Close story" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape, so the viewer is not a trap without a visible button", async () => {
    const onClose = vi.fn();
    render(<StoryViewer story={story} onClose={onClose} />);

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("announces the story's position in the sequence", () => {
    render(<StoryViewer story={story} onClose={vi.fn()} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Story 1 of 1",
    );
  });
});
