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
