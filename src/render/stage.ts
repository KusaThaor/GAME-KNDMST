import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';

/** Bộ khung render dùng chung: renderer, camera, viền nét vẽ, đổi kích thước, vòng lặp. */
export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  outline: OutlineEffect;
  render(): void;
  start(update: (dt: number, t: number) => void): void;
  stop(): void;
  stats: { fps: number; drawCalls: number; triangles: number };
}

export function createStage(container: HTMLElement, opts: { preserve?: boolean; fov?: number; pixelRatioMax?: number } = {}): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: opts.preserve ?? false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.pixelRatioMax ?? 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov ?? 40, container.clientWidth / container.clientHeight, 0.1, 400);
  const outline = new OutlineEffect(renderer, { defaultThickness: 0.0045, defaultColor: [0.22, 0.15, 0.13], defaultAlpha: 1 });

  const onResize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);

  const stats = { fps: 0, drawCalls: 0, triangles: 0 };
  let raf = 0;
  const clock = new THREE.Clock();
  let frames = 0, acc = 0;

  const render = () => {
    outline.render(scene, camera);
    stats.drawCalls = renderer.info.render.calls;
    stats.triangles = renderer.info.render.triangles;
  };

  return {
    renderer, scene, camera, outline, render, stats,
    start(update) {
      const loop = () => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(clock.getDelta(), 0.1);
        acc += dt; frames++;
        if (acc >= 0.5) { stats.fps = Math.round(frames / acc); frames = 0; acc = 0; }
        update(dt, clock.elapsedTime);
        render();
      };
      loop();
    },
    stop() { cancelAnimationFrame(raf); },
  };
}

/** Ánh sáng chuẩn: trời + mặt trời có bóng. Preset theo giờ trong ngày sẽ mở rộng ở S2. */
export function addDaylight(scene: THREE.Scene, opts: { sun?: THREE.Vector3; shadowSize?: number; warm?: number } = {}) {
  const hemi = new THREE.HemisphereLight('#e2f0ff', '#d9c7a6', 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(new THREE.Color('#fff1d8'), 1.75);
  sun.position.copy(opts.sun ?? new THREE.Vector3(-8, 14, 9));
  sun.castShadow = true;
  const s = opts.shadowSize ?? 12;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s; sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 80;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  return { hemi, sun };
}
