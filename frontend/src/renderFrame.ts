import type { SceneItem } from './VideoComposition';

/**
 * Determines which scene is active at a given frame,
 * mirroring the offset logic in VideoComposition.tsx.
 */
function getActiveScene(
  frame: number,
  scenes: SceneItem[],
  fps: number,
): { scene: SceneItem; sceneIndex: number } | null {
  let offset = 0;
  for (let i = 0; i < scenes.length; i++) {
    const dur = Math.round(scenes[i].duration_sec * fps);
    if (frame < offset + dur) return { scene: scenes[i], sceneIndex: i };
    offset += dur;
  }
  return scenes.length > 0
    ? { scene: scenes[scenes.length - 1], sceneIndex: scenes.length - 1 }
    : null;
}

/**
 * Draw a single video frame onto a 2D canvas context.
 * Replicates the visual output of VideoComposition (cover-fit photo + overlay text).
 */
export function renderFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  frame: number,
  fps: number,
  scenes: SceneItem[],
  photoImages: (ImageBitmap | HTMLImageElement)[],
  width: number,
  height: number,
): void {
  // Black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const active = getActiveScene(frame, scenes, fps);
  if (!active) return;

  const { scene } = active;
  const img =
    photoImages[scene.photo_index] ??
    photoImages[photoImages.length - 1];

  if (img) {
    // Cover-fit: scale so image fills the canvas, then center-crop
    const imgW = img.width;
    const imgH = img.height;
    const scale = Math.max(width / imgW, height / imgH);
    const sw = width / scale;
    const sh = height / scale;
    const sx = (imgW - sw) / 2;
    const sy = (imgH - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  }

  // Overlay text (matches VideoComposition styles)
  if (scene.overlay_text) {
    const padding = 24;
    const left = 40;
    const right = 40;
    const bottom = 120;
    const fontSize = 52;
    const lineHeight = 1.25;

    ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
    ctx.textBaseline = 'top';

    // Word-wrap the text
    const maxTextWidth = width - left - right - padding * 2;
    const words = scene.overlay_text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(test).width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) lines.push(currentLine);

    const textBlockHeight = lines.length * fontSize * lineHeight;
    const boxHeight = textBlockHeight + padding * 2;
    const boxY = height - bottom - boxHeight;
    const boxX = left;
    const boxWidth = width - left - right;

    // Semi-transparent background with rounded corners
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const radius = 12;
    ctx.beginPath();
    ctx.moveTo(boxX + radius, boxY);
    ctx.lineTo(boxX + boxWidth - radius, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
    ctx.lineTo(boxX + radius, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
    ctx.lineTo(boxX, boxY + radius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    ctx.closePath();
    ctx.fill();

    // Draw text with shadow
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(
        lines[i],
        boxX + padding,
        boxY + padding + i * fontSize * lineHeight,
      );
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

/**
 * Pre-load photo URLs as ImageBitmap objects for fast canvas drawing.
 */
export async function preloadPhotos(
  urls: string[],
): Promise<ImageBitmap[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      return createImageBitmap(blob);
    }),
  );
  return results;
}
