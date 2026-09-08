"use client";

import Box from "@mui/material/Box";

type StoryProgressBarProps = {
  count: number;
  activeIndex: number;
  /** How far through the active story we are, 0 to 1. */
  progress?: number;
};

function fillFor(index: number, activeIndex: number, progress: number): number {
  if (index < activeIndex) return 1;
  if (index > activeIndex) return 0;
  return progress;
}

export function StoryProgressBar({
  count,
  activeIndex,
  progress = 1,
}: StoryProgressBarProps) {
  return (
    <Box
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={activeIndex + 1}
      aria-label={`Story ${activeIndex + 1} of ${count}`}
      sx={{ display: "flex", gap: 1, width: "100%" }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            height: 3,
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${fillFor(index, activeIndex, progress) * 100}%`,
              height: "100%",
              backgroundColor: "common.white",
            }}
          />
        </Box>
      ))}
    </Box>
  );
}
