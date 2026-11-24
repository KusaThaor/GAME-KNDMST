import * as THREE from 'three';
import type { DressingCtx, DressingSet } from '../index';
import { makeCompactCamera } from '../../props/m1/handProps';
import { makeRainbow } from '../../props/m1/rainbow';

const m1Trang4Set: DressingSet = {
  id: 'm1_trang4',
  appliesTo(ctx: DressingCtx): boolean {
    return ctx.dayId === 'd.g07.03';
  },
  build(_ctx: DressingCtx): THREE.Object3D {
    const root = new THREE.Group();
    root.name = 'dressing:m1_trang4';

    // 1. Máy ảnh compact đặt trên ghế đá dưới gốc phượng
    // Marker itr.thcs.tripod_spot: [4, 0, 8.4], mặt ghế đá cao 0.43m
    const camera = makeCompactCamera();
    camera.position.set(4, 0.43, 8.4);
    camera.rotation.y = Math.PI; // hướng về phía nhóm đứng (spot.thcs.yard_group [4, 0, 2])
    root.add(camera);

    // 2. Cung cầu vồng hiện trên sân sau cơn mưa rào
    // Target cam.thcs.rainbow: [4, 3.5, -10]
    const rainbow = makeRainbow({ radius: 30, width: 3.5 });
    rainbow.position.set(4, 0, -10);
    rainbow.rotation.y = Math.PI * 0.15;
    root.add(rainbow);

    return root;
  },
};

export default m1Trang4Set;
