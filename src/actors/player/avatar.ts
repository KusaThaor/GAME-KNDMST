/**
 * Avatar = phần HÌNH của một nhân vật điều khiển được. Bộ điều khiển, camera, ảnh chụp chỉ làm việc qua giao diện này,
 * nên thay model (nhân vật dựng bằng code hiện tại → model GLB có xương sau này) chỉ cần viết một adapter mới.
 */
import * as THREE from 'three';
import { CharacterAnimator, type Motion } from '../character/animate';
import type { CharacterRig } from '../character/build';

export interface Avatar {
  /** Gốc của model: đặt ở chân nhân vật, mặt nhìn về +z khi rotation.y = 0. */
  root: THREE.Object3D;
  /** Chiều cao (m) — dùng để đặt camera và kiểm tra "trong khung" khi chụp ảnh. */
  height: number;
  setMotion(motion: Motion, speed?: number): void;
  readonly motion: Motion;
  update(dt: number): void;
}

/** Adapter cho nhân vật dựng bằng code (actors/character). */
export function rigAvatar(rig: CharacterRig, seed = 0): Avatar {
  const anim = new CharacterAnimator(rig, seed);
  // Bộ animation thủ tục tự đặt lại rig.root.position.y = 0 mỗi khung hình → bọc thêm một nhóm để đặt được cao độ (bậc thềm, tầng).
  const root = new THREE.Group();
  root.name = 'avatar';
  root.add(rig.root);
  return {
    root,
    height: rig.dims.height,
    get motion() { return anim.motion; },
    setMotion(motion, speed) {
      if (speed !== undefined) anim.speed = speed;
      if (anim.motion !== motion) anim.setMotion(motion);
    },
    update(dt) { anim.update(dt); },
  };
}
