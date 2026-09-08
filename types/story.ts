export type Story = {
  id: string;
  imageBase64: string;
  createdAt: number;
  expiresAt: number;
};

export const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;
