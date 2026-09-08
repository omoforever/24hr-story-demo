"use client";

import { useCallback, useEffect, useState } from "react";
import { Story } from "@/types/story";
import { readStories, writeStories } from "@/lib/storage";
import { expiryFor } from "@/lib/expiry";
import { fileToBase64Image } from "@/lib/image";

// `crypto.randomUUID` only exists in secure contexts, and the dev server is reached over plain
// http from a phone on the LAN — so it's genuinely missing during mobile testing.
function createId(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Storage is read after mount, never during render: the server has no localStorage, so seeding
  // state from it directly would mismatch on hydration. This is the one-shot read the
  // set-state-in-effect rule carves out for external stores — the alternative,
  // useSyncExternalStore, needs a cached snapshot to avoid an infinite loop on a fresh array,
  // which is more machinery than a single hydration read is worth here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStories(readStories(Date.now()));
    setIsLoaded(true);
  }, []);

  const addStory = useCallback(async (file: File) => {
    const imageBase64 = await fileToBase64Image(file);
    const createdAt = Date.now();
    const story: Story = {
      id: createId(),
      imageBase64,
      createdAt,
      expiresAt: expiryFor(createdAt),
    };

    // Re-read rather than appending to `stories`: storage is the source of truth, and this drops
    // anything that expired while the picker was open.
    const next = [...readStories(createdAt), story];
    writeStories(next);
    setStories(next);
  }, []);

  return { stories, addStory, isLoaded };
}
