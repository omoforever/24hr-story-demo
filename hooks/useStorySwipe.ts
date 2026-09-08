"use client";

import { useCallback, useRef } from "react";
import type { PanInfo } from "motion/react";

// A swipe counts once it travels far enough, or fast enough that a short flick still registers.
const SWIPE_DISTANCE_PX = 80;
const SWIPE_VELOCITY = 500;

type UseStorySwipeOptions = {
  onPrevious: () => void;
  onNext: () => void;
  onDismiss: () => void;
};

function passesThreshold(offset: number, velocity: number): boolean {
  return Math.abs(offset) > SWIPE_DISTANCE_PX || Math.abs(velocity) > SWIPE_VELOCITY;
}

export function useStorySwipe({
  onPrevious,
  onNext,
  onDismiss,
}: UseStorySwipeOptions) {
  // A swipe starts and ends inside the tap zones, so the browser fires a click too. This flag
  // lets the zones ignore that click; it outlives the drag by a tick because click is dispatched
  // after dragEnd.
  const didDragRef = useRef(false);

  const handleDragStart = useCallback(() => {
    didDragRef.current = true;
  }, []);

  const handleDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      const { offset, velocity } = info;

      // Whichever axis moved further wins, so a diagonal drag resolves to one intent rather
      // than firing both.
      if (Math.abs(offset.y) > Math.abs(offset.x)) {
        if (offset.y > 0 && passesThreshold(offset.y, velocity.y)) onDismiss();
      } else if (passesThreshold(offset.x, velocity.x)) {
        if (offset.x < 0) onNext();
        else onPrevious();
      }

      window.setTimeout(() => {
        didDragRef.current = false;
      }, 0);
    },
    [onDismiss, onNext, onPrevious],
  );

  const shouldIgnoreClick = useCallback(() => didDragRef.current, []);

  return { handleDragStart, handleDragEnd, shouldIgnoreClick };
}
