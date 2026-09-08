"use client";

import { useCallback, useEffect, useState } from "react";

export const STORY_DURATION_MS = 5000;

type UseStoryPlaybackOptions = {
  count: number;
  startIndex: number;
  isActive: boolean;
  onExhausted: () => void;
};

export function useStoryPlayback({
  count,
  startIndex,
  isActive,
  onExhausted,
}: UseStoryPlaybackOptions) {
  const [index, setIndex] = useState(startIndex);
  const [lastStartIndex, setLastStartIndex] = useState(startIndex);

  // Reopening on a different story remounts nothing, so the index has to follow `startIndex`
  // rather than only seeding from it. Adjusting during render is React's documented pattern for
  // this — an effect would paint the previous story for a frame before correcting itself.
  if (startIndex !== lastStartIndex) {
    setLastStartIndex(startIndex);
    setIndex(startIndex);
  }

  const goNext = useCallback(() => {
    setIndex((current) => {
      if (current >= count - 1) {
        onExhausted();
        return current;
      }
      return current + 1;
    });
  }, [count, onExhausted]);

  // Tapping back on the first story holds there rather than closing — only running off the end
  // dismisses the viewer (PRODUCT.md).
  const goPrevious = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  // The timer restarts whenever the index changes, so a manual tap resets the countdown instead
  // of inheriting whatever was left of the previous story's. It stays off while the viewer is
  // closed — otherwise it keeps firing on a dismissed viewer and re-triggers onExhausted.
  useEffect(() => {
    if (!isActive || count === 0) return;

    const timer = window.setTimeout(goNext, STORY_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [index, count, isActive, goNext]);

  return { index, goNext, goPrevious };
}
