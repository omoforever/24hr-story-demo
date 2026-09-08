"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { Story } from "@/types/story";
import { AVATAR_SIZE } from "./storyTrayLayout";

const RING_WIDTH = 2;

// The ring is a gradient border drawn as a padded background behind the thumbnail — a real CSS
// border can't take a gradient. DESIGN.md: gradient while unseen, plain grey once viewed.
const UNSEEN_RING = "linear-gradient(45deg, #f09433, #dc2743, #bc1888)";

type StoryAvatarProps = {
  story: Story;
  onOpen?: () => void;
  isSeen?: boolean;
};

export function StoryAvatar({ story, onOpen, isSeen = false }: StoryAvatarProps) {
  const ringSize = AVATAR_SIZE + RING_WIDTH * 4;

  return (
    <ButtonBase
      onClick={onOpen}
      aria-label="Open story"
      sx={{ borderRadius: "50%", flexShrink: 0 }}
    >
      <Box
        sx={{
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          padding: `${RING_WIDTH}px`,
          background: isSeen ? undefined : UNSEEN_RING,
          backgroundColor: isSeen ? "divider" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          src={story.imageBase64}
          alt=""
          sx={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            border: "2px solid",
            borderColor: "background.default",
          }}
        />
      </Box>
    </ButtonBase>
  );
}
