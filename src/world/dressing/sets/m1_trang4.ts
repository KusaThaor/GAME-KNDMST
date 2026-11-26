import * as THREE from 'three';
import type { DressingCtx, DressingSet } from '../index';
import { placeAtMarker } from '../place';
import { makeCompactCamera } from '../../props/m1/handProps';

/**
 * Trang 4 (d.g07.03): chỉ đặt máy ảnh compact theo marker `itr.thcs.tripod_spot`.
 * Cầu vồng được quản lý duy nhất qua `sky.ts` (`rainbowArc`) + `atmosphere.ts` (`after_rain_rainbow`).
 */
const m1Trang4Set: DressingSet = {
  id: 'm1_trang4',
  appliesTo(ctx: DressingCtx): boolean {
    return ctx.dayId === 'd.g07.03';
  },
  build(ctx: DressingCtx): THREE.Object3D {
    const root = new THREE.Group();
    root.name = 'dressing:m1_trang4';

    // Máy ảnh compact đặt trên ghế đá / bệ chụp (mặt cao 0.43m)
    const camera = placeAtMarker(makeCompactCamera(), ctx.world, 'interact', 'itr.thcs.tripod_spot', {
      offset: [0, 0.43, 0],
      rotationY: Math.PI,
      fallback: [4, 0, 8.4],
    });
    root.add(camera);

    return root;
  },
};

export default m1Trang4Set;
