"use client";

import { AnimatePresence, motion } from "motion/react";
import Box from "@mui/material/Box";
import { Story } from "@/types/story";
import { AddStoryButton } from "./AddStoryButton";
import { StoryAvatar } from "./StoryAvatar";

type StoryTrayProps = {
  stories: Story[];
  onAddStory: (file: File) => void;
  onOpenStory?: (index: number) => void;
  isBusy?: boolean;
};

export function StoryTray({
  stories,
  onAddStory,
  onOpenStory,
  isBusy,
}: StoryTrayProps) {
  return (
    <Box
      component="section"
      aria-label="Stories"
      sx={{
        display: "flex",
        gap: 3,
        alignItems: "flex-start",
        overflowX: "auto",
        px: 4,
        py: 2,
        // Keeps the first and last tiles clear of the viewport edge as the row scrolls.
        scrollPaddingInline: 16,
        WebkitOverflowScrolling: "touch",
      }}
    >
      <AddStoryButton onSelect={onAddStory} isBusy={isBusy} />

      <AnimatePresence initial={false}>
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{ flexShrink: 0 }}
          >
            <StoryAvatar story={story} onOpen={() => onOpenStory?.(index)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
