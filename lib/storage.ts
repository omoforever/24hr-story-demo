import { Story } from "@/types/story";
import { filterActive } from "./expiry";

export const STORAGE_KEY = "stories";

export class StorageFullError extends Error {
  constructor() {
    super("There isn't enough browser storage left to save this story.");
    this.name = "StorageFullError";
  }
}

// localStorage is unavailable during SSR and in browsers with site data blocked. Callers get an
// empty list instead of a crash, so the tray renders and only writes surface a failure.
function getStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isStory(value: unknown): value is Story {
  if (typeof value !== "object" || value === null) return false;

  const story = value as Record<string, unknown>;
  return (
    typeof story.id === "string" &&
    typeof story.imageBase64 === "string" &&
    typeof story.createdAt === "number" &&
    typeof story.expiresAt === "number"
  );
}

function parseStories(raw: string): Story[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStory) : [];
  } catch {
    return [];
  }
}

// Quota errors are reported inconsistently across browsers — name in most, a legacy code in
// older Safari, a different name entirely in Firefox — so all three are worth checking.
function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22
  );
}

export function writeStories(stories: Story[]): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch (error) {
    if (isQuotaError(error)) throw new StorageFullError();
    throw error;
  }
}

// Pruning happens on read rather than on a timer (PRODUCT.md), so expired stories can't come back
// after a reload. The rewrite is skipped unless something was actually dropped, to avoid
// serialising every story on every read.
export function readStories(now: number): Story[] {
  const storage = getStorage();
  if (!storage) return [];

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const stored = parseStories(raw);
  const active = filterActive(stored, now);

  if (active.length !== stored.length) {
    writeStories(active);
  }

  return active;
}
