import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Chuyển động dùng chung (GSAP). Gom thời lượng + kiểu nhịp vào một chỗ để cả game có cùng "cảm giác" cozy:
 * chậm, mềm, không giật. Chỉnh ở đây thay vì rải số khắp nơi.
 */
export const MOTION = {
  ease: { soft: 'power2.out', inOut: 'sine.inOut', pop: 'back.out(1.6)' },
  dur: { ui: 0.28, panel: 0.45, camera: 1.6 },
} as const;

/** Hiện/ẩn phần tử giao diện (gợi ý phím, hộp thoại) — mờ dần + nhích nhẹ lên. */
export function fadeIn(el: Element, opts: { y?: number; delay?: number } = {}) {
  return gsap.fromTo(el, { autoAlpha: 0, y: opts.y ?? 8 },
    { autoAlpha: 1, y: 0, duration: MOTION.dur.ui, ease: MOTION.ease.soft, delay: opts.delay ?? 0, clearProps: 'transform' });
}

export function fadeOut(el: Element) {
  return gsap.to(el, { autoAlpha: 0, y: 6, duration: MOTION.dur.ui * 0.8, ease: 'power1.in' });
}

/**
 * Lướt camera từ vị trí hiện tại tới `to`, luôn nhìn về `lookAt` (nội suy cả điểm nhìn).
 * Dùng cho đoạn mở cảnh / chuyển góc chụp ảnh. Trả về tween để dừng hoặc chờ (`await tween`).
 */
export function cameraGlide(camera: THREE.Camera, to: THREE.Vector3, lookAt: THREE.Vector3, opts: { duration?: number; from?: THREE.Vector3; fromLook?: THREE.Vector3 } = {}) {
  const startPos = (opts.from ?? camera.position).clone();
  const startLook = (opts.fromLook ?? lookAt).clone();
  const look = new THREE.Vector3();
  const state = { k: 0 };
  return gsap.to(state, {
    k: 1,
    duration: opts.duration ?? MOTION.dur.camera,
    ease: MOTION.ease.inOut,
    onUpdate: () => {
      camera.position.lerpVectors(startPos, to, state.k);
      look.lerpVectors(startLook, lookAt, state.k);
      camera.lookAt(look);
    },
  });
}
