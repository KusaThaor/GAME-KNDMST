import * as THREE from 'three';
import type { MarkerKind } from '../types';
import type { World } from '../world';

export interface PlaceAtMarkerOpts {
  /** Tọa độ dự phòng khi thiếu marker hoặc `world` là bản mock chưa có `marker()`. */
  fallback?: readonly [number, number, number];
  /** Độ lệch cộng thêm vào tọa độ marker (vd. `[0, 0.72, 0]` để đặt lên mặt bàn). */
  offset?: readonly [number, number, number];
  /** Góc xoay quanh trục Y (radian). Truyền `true` để lấy trực tiếp `marker.facing`. */
  rotationY?: number | boolean;
}

/**
 * Đặt `obj` theo tọa độ của `world.marker(kind, id)` (rơi về `opts.fallback` nếu thiếu marker).
 * Giúp đồ trang trí tự dịch chuyển đồng bộ khi cập nhật marker trong `map_*.extras.ts`.
 */
export function placeAtMarker<T extends THREE.Object3D>(
  obj: T,
  world: Pick<World, 'marker'> | null | undefined,
  kind: MarkerKind,
  id: string,
  opts: PlaceAtMarkerOpts = {},
): T {
  const m = typeof world?.marker === 'function' ? world.marker(kind, id) : null;
  const base = m?.position ?? opts.fallback ?? [0, 0, 0];
  const [ox, oy, oz] = opts.offset ?? [0, 0, 0];
  obj.position.set(base[0] + ox, base[1] + oy, base[2] + oz);
  if (opts.rotationY === true) {
    if (m) obj.rotation.y = m.facing;
  } else if (typeof opts.rotationY === 'number') {
    obj.rotation.y = opts.rotationY;
  }
  return obj;
}
