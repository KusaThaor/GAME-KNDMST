import * as THREE from 'three';

export interface EnableShadowsOpts {
  /** Cho phép đổ bóng (vật liệu trong suốt luôn tự tắt `castShadow`). Mặc định `true`. */
  cast?: boolean;
  /** Cho phép nhận bóng. Mặc định `true`. */
  receive?: boolean;
}

/**
 * Chuẩn hóa đối tượng 3D để đáy chạm đúng mặt phẳng `y = 0` (`Box3.min.y === 0`).
 * Ưu tiên dịch chuyển các node con (nếu có) để `obj.position` giữ nguyên tại gốc khi đặt bằng `placeAtMarker`.
 */
export function groundAtZero<T extends THREE.Object3D>(obj: T): T {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  if (box.isEmpty() || Math.abs(box.min.y) < 1e-7) return obj;
  if (obj.children.length > 0) {
    const sy = obj.scale.y || 1;
    const dy = box.min.y / sy;
    for (const child of obj.children) child.position.y -= dy;
  } else {
    obj.position.y -= box.min.y;
  }
  obj.updateMatrixWorld(true);
  return obj;
}

/**
 * Bật đổ/nhận bóng cho mọi mesh trong cây `obj`; tự động tắt `castShadow` đối với vật liệu trong suốt.
 */
export function enableShadows<T extends THREE.Object3D>(obj: T, opts: EnableShadowsOpts = {}): T {
  const cast = opts.cast ?? true;
  const receive = opts.receive ?? true;
  obj.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const hasTransparent = mats.some((mat) => Boolean(mat?.transparent));
    mesh.castShadow = cast && !hasTransparent;
    mesh.receiveShadow = receive;
  });
  return obj;
}
