import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, vi } from "vitest";
import type { PanInfo } from "motion/react";
import { useStorySwipe } from "./useStorySwipe";

type Vector = { x: number; y: number };

// Motion hands the real handler a full PanInfo; only offset and velocity are read.
function panInfo(offset: Vector, velocity: Vector = { x: 0, y: 0 }): PanInfo {
  return {
    point: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    offset,
    velocity,
  };
}

function setup() {
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  const onDismiss = vi.fn();
  const { result } = renderHook(() =>
    useStorySwipe({ onPrevious, onNext, onDismiss }),
  );

  function swipe(offset: Vector, velocity?: Vector) {
    act(() => {
      result.current.handleDragStart();
      result.current.handleDragEnd(null, panInfo(offset, velocity));
    });
  }

  return { onPrevious, onNext, onDismiss, result, swipe };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useStorySwipe direction", () => {
  it("advances on a swipe left", () => {
    const { swipe, onNext } = setup();

    swipe({ x: -120, y: 0 });

    expect(onNext).toHaveBeenCalled();
  });

  it("goes back on a swipe right", () => {
    const { swipe, onPrevious } = setup();

    swipe({ x: 120, y: 0 });

    expect(onPrevious).toHaveBeenCalled();
  });

  it("dismisses on a swipe down", () => {
    const { swipe, onDismiss } = setup();

    swipe({ x: 0, y: 120 });

    expect(onDismiss).toHaveBeenCalled();
  });

  it("ignores a swipe up, leaving room for a future swipe-up action", () => {
    const { swipe, onDismiss, onNext, onPrevious } = setup();

    swipe({ x: 0, y: -200 });

    expect(onDismiss).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrevious).not.toHaveBeenCalled();
  });
});

describe("useStorySwipe thresholds", () => {
  it("ignores a small, slow drag", () => {
    const { swipe, onNext, onPrevious, onDismiss } = setup();

    swipe({ x: -20, y: 0 }, { x: -50, y: 0 });

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("accepts a short flick that never travels far", () => {
    const { swipe, onNext } = setup();

    swipe({ x: -30, y: 0 }, { x: -900, y: 0 });

    expect(onNext).toHaveBeenCalled();
  });

  it("accepts a slow drag that travels far enough", () => {
    const { swipe, onNext } = setup();

    swipe({ x: -200, y: 0 }, { x: -10, y: 0 });

    expect(onNext).toHaveBeenCalled();
  });
});

describe("useStorySwipe diagonals", () => {
  it("resolves a mostly-sideways diagonal to navigation, not dismissal", () => {
    const { swipe, onNext, onDismiss } = setup();

    swipe({ x: -200, y: 100 });

    expect(onNext).toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("resolves a mostly-downward diagonal to dismissal, not navigation", () => {
    const { swipe, onDismiss, onNext } = setup();

    swipe({ x: -100, y: 200 });

    expect(onDismiss).toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });
});

describe("useStorySwipe click suppression", () => {
  it("does not suppress clicks before any drag", () => {
    const { result } = setup();

    expect(result.current.shouldIgnoreClick()).toBe(false);
  });

  it("suppresses the click the browser fires at the end of a swipe", () => {
    const { result, swipe } = setup();

    swipe({ x: -120, y: 0 });

    expect(result.current.shouldIgnoreClick()).toBe(true);
  });

  it("stops suppressing once that click has been dispatched", () => {
    const { result, swipe } = setup();

    swipe({ x: -120, y: 0 });
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.shouldIgnoreClick()).toBe(false);
  });
});
