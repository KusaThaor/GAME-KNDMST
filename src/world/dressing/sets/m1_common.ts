import * as THREE from 'three';
import type { DressingCtx, DressingSet } from '../index';
import { placeAtMarker } from '../place';
import { makeClassList } from '../../props/m1/classList';
import { makeGroceryFront } from '../../props/m1/groceryFront';
import { makeFootbagSpot } from '../../props/m1/footbag';

const m1CommonSet: DressingSet = {
  id: 'm1_common',
  appliesTo(ctx: DressingCtx): boolean {
    return ctx.dayId.startsWith('d.g06') || ctx.dayId.startsWith('d.g07');
  },
  build(ctx: DressingCtx): THREE.Object3D {
    const root = new THREE.Group();
    root.name = 'dressing:m1_common';

    // 1. Bảng phân lớp tại hành lang dãy lớp
    const classList = placeAtMarker(makeClassList(), ctx.world, 'interact', 'itr.thcs.class_list', {
      fallback: [-6, 0.15, -20.4],
    });
    root.add(classList);

    // 2. Bậc thềm & ghế tiệm tạp hóa cổng trường
    const grocery = placeAtMarker(makeGroceryFront(), ctx.world, 'interact', 'itr.thcs.grocery_steps', {
      fallback: [-7.75, 0, 27.2],
    });
    root.add(grocery);

    // 3. Cụm quả cầu rơi cạnh bụi cây ở sân đá cầu
    const footbagSpot = placeAtMarker(makeFootbagSpot(), ctx.world, 'interact', 'itr.thcs.shuttle_bush', {
      fallback: [14.6, 0, 9.2],
    });
    root.add(footbagSpot);

    return root;
  },
};

export default m1CommonSet;
