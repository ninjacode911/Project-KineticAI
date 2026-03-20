import { MIN_CONFIDENCE, SKELETON_CONNECTIONS } from '@/data/constants';
import type { Landmark } from '@/types/pose';

const JOINT_RADIUS = 5;
const LINE_WIDTH = 3;
const CONFIDENT_COLOR = '#22c55e';
const LOW_CONFIDENCE_COLOR = '#6b7280';

interface RenderOptions {
  showAngles: boolean;
  angleLabels?: { x: number; y: number; label: string }[];
}

/**
 * Render the pose skeleton on a canvas overlay.
 * Landmarks are in normalized coordinates (0-1), scaled to canvas dimensions.
 */
export function renderSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number,
  options: RenderOptions = { showAngles: false },
): void {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (landmarks.length === 0) return;

  // Draw connections (bones)
  ctx.lineWidth = LINE_WIDTH;
  for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end) continue;

    const isConfident =
      start.visibility >= MIN_CONFIDENCE && end.visibility >= MIN_CONFIDENCE;

    ctx.strokeStyle = isConfident ? CONFIDENT_COLOR : LOW_CONFIDENCE_COLOR;
    ctx.globalAlpha = isConfident ? 0.8 : 0.3;

    ctx.beginPath();
    ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
    ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
    ctx.stroke();
  }

  // Draw joints (keypoints)
  ctx.globalAlpha = 1;
  for (const landmark of landmarks) {
    const isConfident = landmark.visibility >= MIN_CONFIDENCE;
    const x = landmark.x * canvasWidth;
    const y = landmark.y * canvasHeight;

    ctx.fillStyle = isConfident ? CONFIDENT_COLOR : LOW_CONFIDENCE_COLOR;
    ctx.beginPath();
    ctx.arc(x, y, isConfident ? JOINT_RADIUS : JOINT_RADIUS * 0.6, 0, 2 * Math.PI);
    ctx.fill();

    // White border for visibility
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw angle labels if enabled
  if (options.showAngles && options.angleLabels) {
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    for (const { x, y, label } of options.angleLabels) {
      const px = x * canvasWidth;
      const py = y * canvasHeight;

      // Background pill
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(px - textWidth / 2 - 4, py - 20, textWidth + 8, 18, 4);
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, px, py - 5);
    }
  }
}

/** Draw a simple "no pose detected" indicator */
export function renderNoPose(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('No pose detected — ensure full body is visible', canvasWidth / 2, canvasHeight / 2);
}
