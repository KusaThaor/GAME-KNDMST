import * as THREE from 'three';
import { toon } from '../../render/materials';
import { PAL } from '../school/props';
import { createInstancedMesh, InstanceTransform } from './instancing';
import { makeGroundPlane } from './groundPlane';
import { makeTownSignsMesh, SignPlacement } from './townSigns';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface TownRingOpts {
  seed?: number;
  bounds?: [number, number, number, number]; // [minX, minZ, maxX, maxZ]
}

/**
 * PX-02 · Vành nền phố thị trấn miền Nam bao quanh bản đồ trường học.
 * Đặt trong dải 4–40 m ngoài mép bản đồ x: -34..52, z: -36..30.
 *
 * Tiêu chí:
 * - Tổng ngân sách ≤ 25.000 tam giác.
 * - Số lượt vẽ (mesh con) ≤ 12.
 * - Không collider.
 * - Tắt bóng cho vật xa (castShadow = false).
 */
export function makeTownRing(opts: TownRingOpts = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'townRing';

  const bounds = opts.bounds ?? [-34, -36, 52, 30];
  const [minX, minZ, maxX, maxZ] = bounds;

  let s = opts.seed ?? 1989;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  // 1. Mặt đất mở rộng (PX-03)
  const ground = makeGroundPlane(220);
  root.add(ground);

  // Màu sắc nhà ống miền Nam (6 biến thể màu tường pastel)
  const wallColors = [
    '#faedcd', // vàng kem
    '#d8f3dc', // xanh ngọc nhạt
    '#fcd5ce', // hồng phấn nhạt
    '#e0fbfc', // xanh da trời nhạt
    '#fefae0', // trắng ngà
    '#ffddd2', // cam gạch nhạt
  ];

  // Mảng tích lũy instance transforms
  const houseBodies: InstanceTransform[] = [];
  const houseRoofs: InstanceTransform[] = [];
  const houseBalconies: InstanceTransform[] = [];
  const signPlacements: SignPlacement[] = [];
  const treeTrunks: InstanceTransform[] = [];
  const treeCanopies: InstanceTransform[] = [];
  const powerPoles: InstanceTransform[] = [];
  const wireGeos: THREE.BufferGeometry[] = [];
  const distantRoofInstances: InstanceTransform[] = [];
  const motorbikeInstances: InstanceTransform[] = [];

  // ==========================================
  // HƯỚNG TÂY (West: x < minX)
  // Dãy nhà ống 2-3 tầng san sát mặt tiền quay về hướng đông (+x)
  // ==========================================
  const westStartZ = minZ - 4;
  const westEndZ = maxZ + 4;
  let signCount = 0;

  for (let z = westStartZ; z <= westEndZ; z += 5.2) {
    const isThreeFloor = rnd() > 0.45;
    const h = isThreeFloor ? 9.8 : 7.2;
    const w = 4.8;
    const d = 10.0 + rnd() * 3.0;
    const x = minX - 6.5 - d / 2; // Cách mép tường 6.5m
    const wallColor = wallColors[Math.floor(rnd() * wallColors.length)];

    // Thân nhà ống
    houseBodies.push({
      pos: [x, h / 2, z],
      scale: [d, h, w],
      color: wallColor,
    });

    // Mái viền sê-nô / ngói dốc
    houseRoofs.push({
      pos: [x + 0.2, h + 0.35, z],
      scale: [d + 0.6, 0.7, w + 0.4],
      color: PAL.roof,
    });

    // Ban công nhô ra tầng 2 / 3
    const balconyY = isThreeFloor ? 6.2 : 3.4;
    houseBalconies.push({
      pos: [minX - 6.0, balconyY, z],
      scale: [1.2, 0.85, w * 0.75],
      color: PAL.frameDark,
    });

    // Biển hiệu tiệm ở tầng trệt
    if (rnd() > 0.3) {
      signPlacements.push({
        signIndex: signCount++,
        pos: [minX - 6.45, 2.9, z],
        rotY: Math.PI / 2, // Hướng về phía đông (+x)
        width: 3.2,
        height: 1.05,
      });
    }

    // Lớp nhà ống xa hơn phía sau (lớp 2)
    if (rnd() > 0.25) {
      const h2 = 8.5 + rnd() * 3.5;
      const x2 = x - d / 2 - 8.0;
      houseBodies.push({
        pos: [x2, h2 / 2, z + (rnd() - 0.5) * 2.0],
        scale: [12.0, h2, w * 1.1],
        color: wallColors[Math.floor(rnd() * wallColors.length)],
      });
      distantRoofInstances.push({
        pos: [x2, h2 + 0.8, z],
        scale: [7.0, 1.6, w * 1.1],
        color: PAL.roofDark,
      });
    }
  }

  // Cột điện & dây điện phía Tây (chạy dọc theo mép đường x = minX - 5.0)
  const westPolePositions: [number, number, number][] = [];
  for (let z = westStartZ + 2; z <= westEndZ; z += 14.0) {
    const px = minX - 5.2;
    const pz = z;
    powerPoles.push({
      pos: [px, 3.8, pz],
      scale: [1, 1, 1],
    });
    westPolePositions.push([px, 7.4, pz]);
  }

  // Nối dây điện giữa các cột phía Tây
  for (let i = 0; i < westPolePositions.length - 1; i++) {
    const p1 = westPolePositions[i];
    const p2 = westPolePositions[i + 1];
    const midY = (p1[1] + p2[1]) / 2 - 0.45; // Võng xuống
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p1),
      new THREE.Vector3((p1[0] + p2[0]) / 2, midY, (p1[2] + p2[2]) / 2),
      new THREE.Vector3(...p2),
    ]);
    wireGeos.push(new THREE.TubeGeometry(curve, 6, 0.016, 4, false));
  }

  // ==========================================
  // HƯỚNG NAM (South: z > maxZ)
  // Tuyến đường phố thị trấn, nhà ống đối diện, xe máy dựng
  // ==========================================
  const southStartX = minX - 2;
  const southEndX = maxX + 4;

  for (let x = southStartX; x <= southEndX; x += 5.6) {
    const isThreeFloor = rnd() > 0.5;
    const h = isThreeFloor ? 9.5 : 7.0;
    const w = 5.0;
    const d = 11.0 + rnd() * 2.5;
    const z = maxZ + 9.0 + d / 2; // Đối diện sau con đường z ≈ maxZ + 9m
    const wallColor = wallColors[Math.floor(rnd() * wallColors.length)];

    // Thân nhà ống
    houseBodies.push({
      pos: [x, h / 2, z],
      scale: [w, h, d],
      color: wallColor,
    });

    // Mái ngói
    houseRoofs.push({
      pos: [x, h + 0.35, z - 0.2],
      scale: [w + 0.4, 0.7, d + 0.6],
      color: PAL.roof,
    });

    // Ban công
    const balconyY = isThreeFloor ? 6.2 : 3.4;
    houseBalconies.push({
      pos: [x, balconyY, maxZ + 8.6],
      scale: [w * 0.75, 0.85, 1.2],
      color: PAL.concreteDark,
    });

    // Biển hiệu tiệm
    if (rnd() > 0.25) {
      signPlacements.push({
        signIndex: signCount++,
        pos: [x, 2.9, maxZ + 8.9],
        rotY: Math.PI, // Hướng về phía bắc (-z) nhìn vào trường
        width: 3.4,
        height: 1.1,
      });
    }

    // Xe máy dựng chân chống trước vỉa hè
    if (rnd() > 0.4) {
      motorbikeInstances.push({
        pos: [x + (rnd() - 0.5) * 1.5, 0.45, maxZ + 7.6],
        rot: [0, (rnd() - 0.5) * 0.4 + Math.PI / 2, 0],
        scale: [0.7, 0.8, 1.5],
        color: rnd() > 0.5 ? '#1d3557' : '#e63946',
      });
    }

    // Cây xanh vỉa hè phía Nam
    if (rnd() > 0.6) {
      const treeH = 6.0 + rnd() * 2.5;
      treeTrunks.push({
        pos: [x + 2.4, treeH / 2, maxZ + 6.8],
        scale: [0.3, treeH, 0.3],
      });
      treeCanopies.push({
        pos: [x + 2.4, treeH + 0.8, maxZ + 6.8],
        scale: [1.8, 1.8, 1.8],
        color: PAL.leaf,
      });
    }
  }

  // Cột điện & dây điện phía Nam (dọc vỉa hè z = maxZ + 7.2)
  const southPolePositions: [number, number, number][] = [];
  for (let x = southStartX + 3; x <= southEndX; x += 15.0) {
    const px = x;
    const pz = maxZ + 7.2;
    powerPoles.push({
      pos: [px, 3.8, pz],
      scale: [1, 1, 1],
    });
    southPolePositions.push([px, 7.4, pz]);
  }
  for (let i = 0; i < southPolePositions.length - 1; i++) {
    const p1 = southPolePositions[i];
    const p2 = southPolePositions[i + 1];
    const midY = (p1[1] + p2[1]) / 2 - 0.45;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p1),
      new THREE.Vector3((p1[0] + p2[0]) / 2, midY, (p1[2] + p2[2]) / 2),
      new THREE.Vector3(...p2),
    ]);
    wireGeos.push(new THREE.TubeGeometry(curve, 6, 0.016, 4, false));
  }

  // ==========================================
  // HƯỚNG BẮC (North: z < minZ)
  // Rặng cây rợp mát (bàng, dừa, tre), mái nhà dân thấp, cột điện
  // ==========================================
  const northStartX = minX - 4;
  const northEndX = maxX + 4;

  for (let x = northStartX; x <= northEndX; x += 3.2) {
    // Hàng dừa / bàng cao
    const treeH = 7.5 + rnd() * 3.5;
    const zOffset = minZ - 6.0 - rnd() * 6.0;
    treeTrunks.push({
      pos: [x, treeH / 2, zOffset],
      scale: [0.28, treeH, 0.28],
    });
    // Tán cây phồng
    treeCanopies.push({
      pos: [x, treeH + 1.2, zOffset],
      scale: [2.2 + rnd() * 0.8, 1.8 + rnd() * 0.6, 2.2 + rnd() * 0.8],
      color: rnd() > 0.5 ? PAL.leaf2 : PAL.leaf3,
    });

    // Mái nhà dân thấp thoáng phía sau rặng cây
    if (rnd() > 0.45) {
      const roofZ = zOffset - 9.0 - rnd() * 8.0;
      distantRoofInstances.push({
        pos: [x + (rnd() - 0.5) * 2.0, 4.2 + rnd() * 1.5, roofZ],
        scale: [6.5, 2.2, 5.5],
        color: rnd() > 0.5 ? PAL.roofDark : PAL.roof,
      });
    }
  }

  // Cột điện phía Bắc
  const northPolePositions: [number, number, number][] = [];
  for (let x = northStartX + 2; x <= northEndX; x += 16.0) {
    const px = x;
    const pz = minZ - 5.5;
    powerPoles.push({
      pos: [px, 3.8, pz],
      scale: [1, 1, 1],
    });
    northPolePositions.push([px, 7.4, pz]);
  }
  for (let i = 0; i < northPolePositions.length - 1; i++) {
    const p1 = northPolePositions[i];
    const p2 = northPolePositions[i + 1];
    const midY = (p1[1] + p2[1]) / 2 - 0.45;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p1),
      new THREE.Vector3((p1[0] + p2[0]) / 2, midY, (p1[2] + p2[2]) / 2),
      new THREE.Vector3(...p2),
    ]);
    wireGeos.push(new THREE.TubeGeometry(curve, 6, 0.016, 4, false));
  }

  // ==========================================
  // HƯỚNG ĐÔNG (East: x > maxX)
  // Vườn chuối, hàng cau, mái nhà xa, rặng đồi thấp mờ chân trời
  // ==========================================
  const eastStartZ = minZ - 4;
  const eastEndZ = maxZ + 4;

  for (let z = eastStartZ; z <= eastEndZ; z += 3.4) {
    // Hàng cau / dừa cao thẳng
    const cauH = 8.5 + rnd() * 4.0;
    const cauX = maxX + 7.0 + rnd() * 6.0;
    treeTrunks.push({
      pos: [cauX, cauH / 2, z],
      scale: [0.22, cauH, 0.22],
    });
    treeCanopies.push({
      pos: [cauX, cauH + 0.8, z],
      scale: [1.6, 1.4, 1.6],
      color: PAL.leaf,
    });

    // Mái ngói xa xa
    if (rnd() > 0.5) {
      distantRoofInstances.push({
        pos: [cauX + 10.0 + rnd() * 6.0, 3.8 + rnd() * 1.8, z],
        scale: [6.0, 2.0, 5.0],
        color: PAL.roofDark,
      });
    }
  }

  // Rặng đồi thấp mờ ở chân trời phía Đông (Distant Hills)
  const hillGeo = new THREE.ConeGeometry(38, 14, 5);
  hillGeo.rotateX(Math.PI);
  hillGeo.rotateZ(Math.PI);
  hillGeo.scale(1.2, 0.55, 1.8);
  const hillMat = toon('#889f84', { outline: false });
  const hillInstances: InstanceTransform[] = [
    { pos: [maxX + 46, 3.5, minZ + 8], scale: [1.2, 0.9, 1.3] },
    { pos: [maxX + 52, 4.8, 0], scale: [1.4, 1.1, 1.5] },
    { pos: [maxX + 48, 3.2, maxZ - 6], scale: [1.1, 0.85, 1.2] },
  ];
  const hillMesh = createInstancedMesh({
    geometry: hillGeo,
    material: hillMat,
    instances: hillInstances,
    name: 'backdrop_distant_hills',
  });
  root.add(hillMesh);

  // ==========================================
  // KHỞI TẠO CÁC INSTANCED MESH
  // ==========================================

  // 2. Thân nhà ống (BoxGeometry)
  const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
  const bodyMat = toon('#ffffff');
  const houseMesh = createInstancedMesh({
    geometry: bodyGeo,
    material: bodyMat,
    instances: houseBodies,
    name: 'backdrop_house_bodies',
  });
  root.add(houseMesh);

  // 3. Mái nhà ống (BoxGeometry ngói)
  const roofGeo = new THREE.BoxGeometry(1, 1, 1);
  const roofMat = toon(PAL.roof);
  const roofMesh = createInstancedMesh({
    geometry: roofGeo,
    material: roofMat,
    instances: houseRoofs,
    name: 'backdrop_house_roofs',
  });
  root.add(roofMesh);

  // 4. Ban công & cửa sổ
  const balconyGeo = new THREE.BoxGeometry(1, 1, 1);
  const balconyMat = toon(PAL.frameDark);
  const balconyMesh = createInstancedMesh({
    geometry: balconyGeo,
    material: balconyMat,
    instances: houseBalconies,
    name: 'backdrop_house_balconies',
  });
  root.add(balconyMesh);

  // 5. Thân cây (CylinderGeometry)
  const trunkGeo = new THREE.CylinderGeometry(0.5, 0.6, 1, 6);
  const trunkMat = toon(PAL.trunk);
  const trunkMesh = createInstancedMesh({
    geometry: trunkGeo,
    material: trunkMat,
    instances: treeTrunks,
    name: 'backdrop_tree_trunks',
  });
  root.add(trunkMesh);

  // 6. Tán cây (IcosahedronGeometry detail 0 = 20 tam giác)
  const canopyGeo = new THREE.IcosahedronGeometry(1, 0);
  const canopyMat = toon(PAL.leaf);
  const canopyMesh = createInstancedMesh({
    geometry: canopyGeo,
    material: canopyMat,
    instances: treeCanopies,
    name: 'backdrop_tree_canopies',
  });
  root.add(canopyMesh);

  // 7. Cột điện (Cylinder chữ T)
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 6);
  const armGeo = new THREE.BoxGeometry(1.4, 0.12, 0.12);
  armGeo.translate(0, 3.6, 0);
  const fullPoleGeo = mergeGeometries([poleGeo, armGeo], false);
  const poleMat = toon(PAL.concrete);
  const poleMesh = createInstancedMesh({
    geometry: fullPoleGeo ?? poleGeo,
    material: poleMat,
    instances: powerPoles,
    name: 'backdrop_power_poles',
  });
  root.add(poleMesh);

  // 8. Dây điện (Merge các TubeGeometry)
  if (wireGeos.length > 0) {
    const mergedWires = mergeGeometries(wireGeos, false);
    if (mergedWires) {
      const wireMat = toon('#2b2d42', { outline: false });
      const wireMesh = new THREE.Mesh(mergedWires, wireMat);
      wireMesh.name = 'backdrop_power_wires';
      wireMesh.castShadow = false;
      wireMesh.receiveShadow = false;
      root.add(wireMesh);
    }
  }

  // 9. Mái nhà xa
  const distRoofGeo = new THREE.ConeGeometry(1, 1, 4);
  distRoofGeo.rotateY(Math.PI / 4);
  const distRoofMat = toon(PAL.roofDark, { outline: false });
  const distRoofMesh = createInstancedMesh({
    geometry: distRoofGeo,
    material: distRoofMat,
    instances: distantRoofInstances,
    name: 'backdrop_distant_roofs',
  });
  root.add(distRoofMesh);

  // 10. Xe máy vỉa hè
  const bikeGeo = new THREE.BoxGeometry(1, 1, 1);
  const bikeMat = toon('#3d5a80');
  const bikeMesh = createInstancedMesh({
    geometry: bikeGeo,
    material: bikeMat,
    instances: motorbikeInstances,
    name: 'backdrop_motorbikes',
  });
  root.add(bikeMesh);

  // 11. Bảng hiệu cửa hàng (Gom thành 1 mesh duy nhất)
  const signsMesh = makeTownSignsMesh(signPlacements);
  if (signsMesh) {
    root.add(signsMesh);
  }

  return root;
}
