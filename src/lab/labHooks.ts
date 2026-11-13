import type { Stage } from '../render/stage';

/** Móc cho bot/ảnh chụp tự động (chỉ có ở môi trường test). */
export interface LabApi {
  ready: boolean;
  setTime(t: number): void;
  stats(): { fps: number; drawCalls: number; triangles: number; geometries: number; textures: number };
}

declare global { interface Window { __lab?: LabApi } }

export function exposeLab(stage: Stage, api: { setTime: (t: number) => void }) {
  window.__lab = {
    ready: false,
    setTime: api.setTime,
    stats: () => ({ ...stage.stats, geometries: stage.renderer.info.memory.geometries, textures: stage.renderer.info.memory.textures }),
  };
  // đợi font tiếng Việt tải xong rồi mới báo sẵn sàng (texture chữ vẽ bằng canvas cần font)
  document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => { window.__lab!.ready = true; })));
}
