"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";

type StoryTapZonesProps = {
  onPrevious: () => void;
  onNext: () => void;
  /** Lets a just-finished swipe suppress the click the browser fires on release. */
  shouldIgnoreClick?: () => boolean;
};

// The standard Instagram split: a narrow back zone on the left, everything else advances. Next is
// the far more common action, so it gets the larger target.
const PREVIOUS_FLEX = 1;
const NEXT_FLEX = 2;

export function StoryTapZones({
  onPrevious,
  onNext,
  shouldIgnoreClick,
}: StoryTapZonesProps) {
  function tapHandler(action: () => void) {
    return () => {
      if (shouldIgnoreClick?.()) return;
      action();
    };
  }

  return (
    <Box sx={{ position: "absolute", inset: 0, display: "flex" }}>
      <ButtonBase
        onClick={tapHandler(onPrevious)}
        aria-label="Previous story"
        sx={{ flex: PREVIOUS_FLEX }}
      />
      <ButtonBase
        onClick={tapHandler(onNext)}
        aria-label="Next story"
        sx={{ flex: NEXT_FLEX }}
      />
    </Box>
  );
}
