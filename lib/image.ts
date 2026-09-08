export const MAX_WIDTH = 1080;
export const MAX_HEIGHT = 1920;

const JPEG_QUALITY = 0.8;

// Scales down to fit the cap while preserving aspect ratio. Never scales up — a small photo
// stays small rather than being blown up to fill the frame.
export function fitWithin(
  width: number,
  height: number,
  maxWidth = MAX_WIDTH,
  maxHeight = MAX_HEIGHT,
): { width: number; height: number } {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

// JPEG rather than PNG: a PNG of a camera photo can be several times larger, and localStorage is
// the binding constraint here (PRODUCT.md). `from-image` applies EXIF rotation, without which
// phone photos are stored sideways.
export async function fileToBase64Image(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get a 2D canvas context.");

    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
