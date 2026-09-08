"use client";

import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { ThemeProvider } from "@mui/material/styles";
import { Story } from "@/types/story";
import { viewerTheme } from "@/app/theme";
import { STORY_DURATION_MS, useStoryPlayback } from "@/hooks/useStoryPlayback";
import { StoryProgressBar } from "./StoryProgressBar";
import { StoryTapZones } from "./StoryTapZones";

// Desktop gets a phone-shaped frame rather than a stretched-out image (DESIGN.md); on mobile the
// max-width never binds, so the same styles give a genuinely full-screen viewer.
const FRAME_MAX_WIDTH = 420;
const FRAME_ASPECT_RATIO = "9 / 16";

type StoryViewerProps = {
  stories: Story[];
  /** Index the viewer opened on, or null when it is closed. */
  startIndex: number | null;
  onClose: () => void;
};

export function StoryViewer({ stories, startIndex, onClose }: StoryViewerProps) {
  const isOpen = startIndex !== null;

  const { index, goNext, goPrevious } = useStoryPlayback({
    count: stories.length,
    startIndex: startIndex ?? 0,
    isActive: isOpen,
    onExhausted: onClose,
  });

  // The list can shrink underneath the viewer when a story expires mid-view, so the index is
  // never assumed to still be in range.
  const story = isOpen ? stories[index] : undefined;

  return (
    <ThemeProvider theme={viewerTheme}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullScreen
        aria-label="Story viewer"
        slotProps={{ paper: { sx: { backgroundColor: "common.black" } } }}
      >
        {story && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: FRAME_MAX_WIDTH,
                aspectRatio: FRAME_ASPECT_RATIO,
                maxHeight: "100%",
                backgroundColor: "common.black",
              }}
            >
              <Box
                component="img"
                src={story.imageBase64}
                alt="Story"
                sx={{
                  width: "100%",
                  height: "100%",
                  // Contain, never cover: the 1080x1920 cap preserves the original aspect
                  // ratio, so cropping here would undo that (DESIGN.md).
                  objectFit: "contain",
                  display: "block",
                }}
              />

              <StoryTapZones onPrevious={goPrevious} onNext={goNext} />

              {/* Above the tap zones, which cover the whole frame and would otherwise swallow
                  taps on the close button. */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  px: 3,
                  pt: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <StoryProgressBar
                  count={stories.length}
                  activeIndex={index}
                  durationMs={STORY_DURATION_MS}
                />

                <IconButton
                  onClick={onClose}
                  aria-label="Close story"
                  size="small"
                  sx={{ color: "common.white", flexShrink: 0 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </ThemeProvider>
  );
}
