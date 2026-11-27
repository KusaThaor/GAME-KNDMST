/**
 * Khung hiển thị của game: MỘT renderer dùng chung, đổi qua lại giữa scene Hub và scene Ngày ký ức.
 * Dùng lại renderer + viền nét của render/stage.ts để cùng phong cách với các trang thử.
 */
import * as THREE from 'three';
import { createStage, type Stage } from '../render/stage';

export interface GameView {
  stage: Stage;
  setScene(scene: THREE.Scene | null, camera: THREE.PerspectiveCamera | null): void;
  setRenderPaused(paused: boolean): void;
  start(update: (dt: number, t: number) => void): void;
  stop(): void;
  /** Chụp ảnh từ một máy ảnh ảo trong cảnh (không dính HUD) → JPEG. */
  capture(scene: THREE.Scene, camera: THREE.PerspectiveCamera, size: { width: number; height: number; quality: number }): Promise<Blob>;
  stats(): { fps: number; drawCalls: number; triangles: number; geometries: number; textures: number };
}

export function createGameView(container: HTMLElement): GameView {
  const stage = createStage(container);
  const { renderer, outline } = stage;
  let scene: THREE.Scene | null = null, camera: THREE.PerspectiveCamera | null = null;
  let raf = 0, fps = 0, frames = 0, acc = 0, last = performance.now(), elapsed = 0;
  let renderPaused = false;

  const fit = () => {
    if (!camera) return;
    camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', fit);

  return {
    stage,
    setScene(s, c) { scene = s; camera = c; fit(); },
    setRenderPaused(p) { renderPaused = p; if (!p) last = performance.now(); },
    start(update) {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const raw = (now - last) / 1000; last = now;
        const dt = Math.min(raw, 0.1); elapsed += dt;          // game chậm lại khi máy quá yếu, không nhảy cóc
        if (!renderPaused) {
          acc += raw; frames++;                                // FPS tính theo thời gian thật
          if (acc >= 0.5) { fps = Math.round(frames / acc); frames = 0; acc = 0; }
        }
        update(dt, elapsed);
        if (!renderPaused && scene && camera) outline.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);
    },
    stop() { cancelAnimationFrame(raf); },
    capture(s, c, size) {
      const prevRatio = renderer.getPixelRatio();
      const prev = renderer.getSize(new THREE.Vector2());
      const prevAspect = c.aspect;
      renderer.setPixelRatio(1);
      renderer.setSize(size.width, size.height, false);
      c.aspect = size.width / size.height; c.updateProjectionMatrix();
      outline.render(s, c);
      const out = document.createElement('canvas');
      out.width = size.width; out.height = size.height;
      out.getContext('2d')!.drawImage(renderer.domElement, 0, 0, size.width, size.height);
      renderer.setPixelRatio(prevRatio);
      renderer.setSize(prev.x, prev.y, false);
      c.aspect = prevAspect; c.updateProjectionMatrix();
      return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error('không tạo được ảnh'))), 'image/jpeg', size.quality));
    },
    stats: () => ({ fps, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }),
  };
}

/**
 * Giải phóng một scene khi rời đi. Vật liệu toon() được cache dùng chung giữa các scene nên KHÔNG dispose;
 * chỉ dispose geometry và các texture riêng của scene (vật liệu có `map`).
 */
export function disposeScene(root: THREE.Object3D): void {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine) return;
    m.geometry?.dispose();
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      const map = (mat as THREE.MeshBasicMaterial | undefined)?.map;
      if (map) { map.dispose(); mat.dispose(); }
    }
  });
  root.traverse((o) => { const l = o as THREE.DirectionalLight; if (l.isDirectionalLight) l.shadow.map?.dispose(); });
}
