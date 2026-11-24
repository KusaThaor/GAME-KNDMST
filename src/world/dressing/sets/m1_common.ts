import * as THREE from 'three';
import type { DressingCtx, DressingSet } from '../index';
import { makeClassList } from '../../props/m1/classList';
import { makeGroceryFront } from '../../props/m1/groceryFront';
import { makeFootbagSpot } from '../../props/m1/footbag';

const m1CommonSet: DressingSet = {
  id: 'm1_common',
  appliesTo(ctx: DressingCtx): boolean {
    return ctx.dayId.startsWith('d.g06') || ctx.dayId.startsWith('d.g07');
  },
  build(_ctx: DressingCtx): THREE.Object3D {
    const root = new THREE.Group();
    root.name = 'dressing:m1_common';

    // 1. Bảng phân lớp tại hành lang dãy lớp
    // Marker: itr.thcs.class_list [-6, 0.15, -20.4]
    const classList = makeClassList();
    classList.position.set(-6, 0.15, -20.4);
    root.add(classList);

    // 2. Bậc thềm & ghế tiệm tạp hóa cổng trường
    // Marker: itr.thcs.grocery_steps [-7.75, 0, 27.2]
    const grocery = makeGroceryFront();
    grocery.position.set(-7.75, 0, 27.2);
    root.add(grocery);

    // 3. Cụm quả cầu rơi cạnh bụi cây ở sân đá cầu
    // Marker: itr.thcs.shuttle_ring [12, 0, 7]
    const footbagSpot = makeFootbagSpot();
    footbagSpot.position.set(12.5, 0, 7.5);
    root.add(footbagSpot);

    return root;
  },
};

export default m1CommonSet;
