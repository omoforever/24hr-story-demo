"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";

type StoryProgressBarProps = {
  count: number;
  activeIndex: number;
  /** When set, the active segment fills over this many ms. Omit to render it full. */
  durationMs?: number;
};

export function StoryProgressBar({
  count,
  activeIndex,
  durationMs,
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
          <motion.div
            // Keyed on the active story so the fill restarts from empty on every advance,
            // rather than animating across from where the previous segment left off.
            key={`${index}-${activeIndex}`}
            initial={{ width: index === activeIndex && durationMs ? "0%" : undefined }}
            animate={{ width: index <= activeIndex ? "100%" : "0%" }}
            transition={
              index === activeIndex && durationMs
                ? { duration: durationMs / 1000, ease: "linear" }
                : { duration: 0 }
            }
            style={{ height: "100%", backgroundColor: "white" }}
          />
        </Box>
      ))}
    </Box>
  );
}
