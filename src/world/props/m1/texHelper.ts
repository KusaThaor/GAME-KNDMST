import * as THREE from 'three';
import { canvasTexture as baseCanvasTexture } from '../../../render/canvasTex';

/**
 * Bọc canvasTexture an toàn khi chạy trong môi trường Node.js (như test suite Vitest).
 * Nếu có DOM (browser / test có mock document): vẽ canvas bình thường.
 * Nếu không có document: trả về DataTexture 1x1 sRGB an toàn để không sập cảnh.
 */
export function safeCanvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D) => void,
  opts?: { repeat?: [number, number] },
): THREE.Texture {
  if (typeof document === 'undefined') {
    const t = new THREE.DataTexture(new Uint8Array([240, 240, 240, 255]), 1, 1);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }
  return baseCanvasTexture(w, h, draw, opts);
}

/**
 * Vẽ một dòng "chữ" mờ không đọc được (nét bút nguệch ngoạc ngắn) — dùng thay cho
 * họ tên, tên lớp, tên báo… mà kịch bản không ghi. Không gọi fillText nên không
 * bao giờ in ra chữ tự đặt. Kết quả cố định theo `seed`.
 */
export function illegibleLine(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  opts: { color?: string; height?: number; seed?: number; lineWidth?: number } = {},
): void {
  let s = (opts.seed ?? 1) * 9301 + 49297;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const hgt = opts.height ?? 8;
  g.save();
  g.strokeStyle = opts.color ?? '#5b6670';
  g.lineWidth = opts.lineWidth ?? 2;
  g.globalAlpha = 0.75;
  let cx = x;
  const end = x + width;
  while (cx < end) {
    // Một "từ": 2–6 móc lượn sóng liền nhau, rồi một khoảng trắng.
    const letters = 2 + Math.floor(rnd() * 5);
    g.beginPath();
    g.moveTo(cx, y);
    for (let i = 0; i < letters && cx < end; i++) {
      const step = hgt * (0.45 + rnd() * 0.35);
      g.quadraticCurveTo(cx + step / 2, y - hgt * (0.4 + rnd() * 0.6), Math.min(cx + step, end), y + (rnd() - 0.5) * 2);
      cx += step;
    }
    g.stroke();
    cx += hgt * (0.5 + rnd() * 0.4);
  }
  g.restore();
}
