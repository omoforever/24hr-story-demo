import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import { StoryTray } from "./StoryTray";
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

function fileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("The tray is missing its file input.");
  return input;
}

function renderTray(props: Partial<React.ComponentProps<typeof StoryTray>> = {}) {
  return render(
    <StoryTray stories={[]} onAddStory={vi.fn()} {...props} />,
  );
}

describe("StoryTray", () => {
  it("shows the add tile even when there are no stories", () => {
    renderTray();

    expect(screen.getByRole("button", { name: "Add a story" })).toBeInTheDocument();
  });

  it("renders one avatar per story", () => {
    renderTray({ stories: [storyWithId("a"), storyWithId("b")] });

    expect(screen.getAllByRole("button", { name: "Open story" })).toHaveLength(2);
  });

  it("renders each story's image", () => {
    const { container } = renderTray({ stories: [storyWithId("a")] });

    expect(container.querySelector('img[src="data:image/jpeg;base64,a"]')).toBeTruthy();
  });

  it("hands the picked file to onAddStory", async () => {
    const onAddStory = vi.fn();
    const { container } = renderTray({ onAddStory });
    const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });

    await userEvent.upload(fileInput(container), file);

    expect(onAddStory).toHaveBeenCalledWith(file);
  });

  it("opens the story that was tapped, not just the first one", async () => {
    const onOpenStory = vi.fn();
    renderTray({
      stories: [storyWithId("first"), storyWithId("second")],
      onOpenStory,
    });

    await userEvent.click(screen.getAllByRole("button", { name: "Open story" })[1]);

    expect(onOpenStory).toHaveBeenCalledWith(1);
  });

  it("disables adding while a story is being saved", () => {
    renderTray({ isBusy: true });

    expect(screen.getByRole("button", { name: "Add a story" })).toBeDisabled();
  });
});
