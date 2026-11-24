import * as THREE from 'three';
import type { DressingCtx, DressingSet } from '../index';
import { makePaperBoats } from '../../props/m1/paperBoats';
import { makeGutterFlow } from '../../props/m1/gutterFlow';

const m1Trang2Set: DressingSet = {
  id: 'm1_trang2',
  appliesTo(ctx: DressingCtx): boolean {
    return ctx.dayId === 'd.g07.01';
  },
  build(ctx: DressingCtx): THREE.Object3D {
    const root = new THREE.Group();
    root.name = 'dressing:m1_trang2';

    // 1. Dòng nước chảy trong rãnh mái hiên (có cập nhật UV mỗi khung hình)
    const gutter = makeGutterFlow({ length: 48, width: 0.35 });
    gutter.position.set(-4, 0, -18.1);
    root.add(gutter);

    if (gutter.flowControl) {
      ctx.addUpdate((dt) => {
        gutter.flowControl?.update(dt);
      });
    }

    // 2. 5 chiếc thuyền giấy đua rãnh nước
    // Marker: itr.thcs.gutter [-14, 0, -18.1]
    const boats = makePaperBoats();
    boats.position.set(-14, 0, -18.1);
    root.add(boats);

    return root;
  },
};

export default m1Trang2Set;
