import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { toon } from '../../render/materials';
import { flagTexture, signTexture } from '../../render/canvasTex';

/** Đồ vật sân trường dựng bằng khối (GDD 4.1, 4.5). Mọi kích thước tính bằng mét. */

export const PAL = {
  // Nền & Đế Diorama
  dioramaBase:  '#655342',   // đất nung sẫm đáy diorama
  dioramaGrass: '#9bb868',   // cỏ xanh cốm ấm
  soilSand:     '#d8be92',   // góc đất cát chòi nghỉ

  // Tường & kết cấu trường
  wallYellow:   '#f6e6a8',   // vàng kem trường học
  wallCream:    '#fdf4de',   // trắng ngà
  trim:         '#faf4ea',   // trắng kem viền
  wallPillar:   '#ebd7a8',   // trụ tường bao
  gateGreen:    '#2e643d',   // cổng sắt xanh lá

  // Cửa sổ & kính
  frame:        '#3e7f53',   // khung cửa xanh mạ
  frameDark:    '#2e603e',
  glass:        '#78b8b2',   // kính teal nhạt

  // Mái ngói
  roof:         '#db5449',   // mái ngói đỏ cam tươi
  roofDark:     '#b83e35',
  roofGrey:     '#8a95a3',   // mái tôn/ngói xám xanh
  roofGreyDark: '#6c7785',

  // Đường sá & Vỉa hè
  road:         '#4e484c',   // nhựa đường xám than đậm chuẩn ref
  sidewalk:     '#dfd7cc',   // vỉa hè gạch đá xám kem
  kerb:         '#b8b0a2',   // mép bó vỉa
  concrete:     '#e8e2d8',
  concreteDark: '#cec7ba',
  bench:        '#d0d4cc',

  // Cây cối
  trunk:        '#75533c',
  trunkDark:    '#5c3f2d',
  leaf:         '#60a642',   // tán cây đa giác xanh tươi
  leaf2:        '#78be54',
  leaf3:        '#56983e',
  leafDark:     '#437a2d',
  soil:         '#9a7a5a',
  hedge:        '#66aa50',
  pole:         '#eeeeef',
  step:         '#ded8cc',

  // Nhà dân (Pastel)
  houseYellow:  '#f8ecd2',
  housePink:    '#f7c8c8',
  houseBlue:    '#a8cde8',
  houseGreen:   '#b8e6ce',
  houseCream:   '#f7f0e0',
  houseFence:   '#e8dfce',

  // Tiệm Tạp Hóa & Quán Net
  awningRed:    '#e04a40',
  awningWhite:  '#faf6f2',
  stoolRed:     '#d6382e',
  pcDesk:       '#5a4636',
  pcCase:       '#2e3238',
  pcScreen:     '#5aa0d8',
} as const;

const shadowy = <T extends THREE.Object3D>(o: T, cast = true, receive = true) => {
  o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = cast; c.receiveShadow = receive; } });
  return o;
};

export const box = (w: number, h: number, d: number, color: string, r = 0) =>
  new THREE.Mesh(r > 0 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), toon(color));

/** Ghế đá xi măng. */
export function bench(): THREE.Group {
  const g = new THREE.Group();
  const seat = box(1.7, 0.1, 0.46, PAL.bench, 0.04); seat.position.y = 0.43; g.add(seat);
  const back = box(1.7, 0.36, 0.08, PAL.bench, 0.03); back.position.set(0, 0.72, -0.2); back.rotation.x = -0.12; g.add(back);
  for (const x of [-0.62, 0.62]) {
    const leg = box(0.14, 0.4, 0.4, '#a7ad9f', 0.03); leg.position.set(x, 0.2, 0); g.add(leg);
  }
  return shadowy(g);
}

/** Bồn cây tròn quanh gốc (bồn xi măng sơn trắng). */
export function planterRing(radius: number, height = 0.45): THREE.Group {
  const g = new THREE.Group();
  const w = 0.22;
  const profile = [new THREE.Vector2(radius - w, 0), new THREE.Vector2(radius, 0), new THREE.Vector2(radius, height), new THREE.Vector2(radius - w, height), new THREE.Vector2(radius - w, 0)];
  const ring = new THREE.Mesh(new THREE.LatheGeometry(profile, 36), toon('#efe9dc'));
  g.add(ring);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(radius - w, 32), toon(PAL.soil, { outline: false }));
  soil.rotation.x = -Math.PI / 2; soil.position.y = height - 0.08; g.add(soil);
  return shadowy(g);
}

function canopyBlob(r: number, color: string, sx: number, sy: number, sz: number) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), toon(color));
  m.scale.set(sx, sy, sz);
  return m;
}

/** Cây phượng: thân cao hơi cong, cành xòe, tán rộng mỏng như chiếc ô. `bloom` 0–1 = mức hoa đỏ (Ch1 tháng 9: 0; Ch6: 1). */
export function phuongTree(opts: { bloom?: number; seed?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  let s = opts.seed ?? 3;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const trunkMat = toon(PAL.trunk);
  const trunkH = 4.0;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, trunkH, 10), trunkMat);
  trunk.position.y = trunkH / 2; trunk.rotation.z = 0.05; g.add(trunk);
  // cành chính: xòe ngang rồi vươn lên
  const branches: [number, number, number][] = [[1.0, 0.2, 3.4], [0.95, 1.9, 3.1], [1.05, 3.4, 3.3], [0.9, 4.8, 3.0], [0.45, 2.6, 2.2]];
  for (const [tilt, yaw, len] of branches) {
    const b = new THREE.Group(); b.position.y = trunkH - 0.3; b.rotation.y = yaw; g.add(b);
    const pivot = new THREE.Group(); pivot.rotation.z = tilt; b.add(pivot);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.19, len, 8), trunkMat);
    m.position.y = len / 2; pivot.add(m);
  }
  const bloom = opts.bloom ?? 0;
  const greens = [PAL.leaf, PAL.leaf2, PAL.leaf3, '#68a84c'];
  const rings: [number, number, number][] = [[0, 1, 6.4], [1.9, 7, 6.1], [3.6, 10, 5.7], [5.0, 12, 5.25]];
  let k = 0;
  for (const [rad, n, y] of rings) {
    for (let i = 0; i < n; i++, k++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.5;
      const isFlower = rnd() < bloom * 0.75;
      const color = isFlower ? (rnd() < 0.5 ? '#e0402e' : '#ef5a33') : greens[k % greens.length];
      const blob = canopyBlob(rad === 0 ? 1.9 : 1.05 + rnd() * 0.35, color, 1.45, 0.42 + rnd() * 0.1, 1.3);
      blob.position.set(Math.cos(a) * rad, y + rnd() * 0.35, Math.sin(a) * rad);
      blob.rotation.y = rnd() * 3;
      g.add(blob);
    }
  }
  g.add(planterRing(1.35));
  return shadowy(g);
}

/** Cây bàng: tán xếp tầng nằm ngang đặc trưng. */
export function bangTree(opts: { seed?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  let s = opts.seed ?? 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 5.2, 9), toon(PAL.trunkDark));
  trunk.position.y = 2.6; g.add(trunk);
  const tiers: [number, number, number][] = [[2.5, 3.0, 7], [3.6, 2.3, 6], [4.6, 1.6, 5], [5.4, 0.7, 3]];
  for (const [y, rad, n] of tiers) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd();
      const blob = canopyBlob(0.95 + rnd() * 0.25, [PAL.leaf3, PAL.leaf, '#5a9a3e'][i % 3], 1.5, 0.32, 1.2);
      blob.position.set(Math.cos(a) * rad, y + rnd() * 0.15, Math.sin(a) * rad);
      blob.rotation.y = -a;
      g.add(blob);
      if (rad > 1) {
        const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, rad, 6), toon(PAL.trunkDark));
        br.position.set(Math.cos(a) * rad / 2, y - 0.1, Math.sin(a) * rad / 2);
        br.rotation.set(0, -a, Math.PI / 2); g.add(br);
      }
    }
  }
  g.add(planterRing(0.9, 0.4));
  return shadowy(g);
}

/** Cột cờ: bệ 3 bậc, cột trắng, cờ đỏ sao vàng (lá cờ có thể phấp phới bằng `wave`). */
export function flagpole(height = 8.5): THREE.Group & { wave: (t: number) => void } {
  const g = new THREE.Group() as THREE.Group & { wave: (t: number) => void };
  [[2.6, 0.18], [2.0, 0.18], [1.4, 0.18]].forEach(([w, h], i) => {
    const step = box(w, h, w, i % 2 ? PAL.step : '#ddd6c8', 0.02); step.position.y = h / 2 + i * h; g.add(step);
  });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, height, 10), toon(PAL.pole));
  pole.position.y = 0.54 + height / 2; g.add(pole);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), toon('#e8c45a')); knob.position.y = 0.54 + height + 0.05; g.add(knob);
  const geo = new THREE.PlaneGeometry(1.5, 1.0, 16, 6);
  const flagMat = new THREE.MeshToonMaterial({ map: flagTexture(), side: THREE.DoubleSide });
  flagMat.userData.outlineParameters = { visible: false };
  const flag = new THREE.Mesh(geo, flagMat);
  flag.position.set(0.78, 0.54 + height - 0.6, 0); flag.castShadow = true; g.add(flag);
  const base = (geo.getAttribute('position').array as Float32Array).slice();
  g.wave = (t: number) => {
    const p = geo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3] + 0.75;
      p.setZ(i, Math.sin(x * 4 - t * 5) * 0.08 * x + Math.sin(t * 2.3 + x) * 0.03 * x);
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  };
  g.wave(0);
  return shadowy(g);
}

export function hedge(len: number): THREE.Group {
  const g = new THREE.Group();
  const n = Math.max(1, Math.round(len / 1.1));
  for (let i = 0; i < n; i++) {
    const b = canopyBlob(0.55, i % 2 ? PAL.hedge : PAL.leaf3, 1.25, 0.8, 0.9);
    b.position.set(-len / 2 + (i + 0.5) * (len / n), 0.42, 0); g.add(b);
  }
  return shadowy(g);
}

export function trashBin(color = '#3f86c6'): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.75, 14), toon(color)); body.position.y = 0.375; g.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 14), toon('#2f6ea6')); lid.position.y = 0.79; g.add(lid);
  return shadowy(g);
}

export function pottedPlant(): THREE.Group {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.42, 12), toon('#c0653e')); pot.position.y = 0.21; g.add(pot);
  const leaves = canopyBlob(0.36, PAL.leaf, 1, 1.1, 1); leaves.position.y = 0.7; g.add(leaves);
  return shadowy(g);
}

/**
 * Cây đa giác low-poly (Faceted Tree) chuẩn phong cách diorama trong ảnh ref.
 */
export function facetedTree(opts: {
  radius?: number;
  height?: number;
  color?: string;
  planter?: boolean;
  scaleY?: number;
} = {}): THREE.Group {
  const g = new THREE.Group(); g.name = 'faceted-tree';
  const r = opts.radius ?? 1.8;
  const h = opts.height ?? 3.2;
  const col = opts.color ?? PAL.leaf;

  if (opts.planter) {
    const plW = Math.max(r * 1.3, 2.2);
    const boxPlanter = box(plW, 0.38, plW, PAL.wallYellow, 0.03);
    boxPlanter.position.y = 0.19; g.add(boxPlanter);
    const soilMesh = box(plW - 0.28, 0.4, plW - 0.28, PAL.soil);
    soilMesh.position.y = 0.2; g.add(soilMesh);
  }

  // Thân cây hình trụ 6 cạnh (low-poly)
  const trunkGeo = new THREE.CylinderGeometry(r * 0.14, r * 0.22, h, 6);
  const trunk = new THREE.Mesh(trunkGeo, toon(PAL.trunk));
  trunk.position.y = h / 2;
  g.add(trunk);

  // Tán lá đa giác Icosahedron góc cạnh
  const canopyGeo = new THREE.IcosahedronGeometry(r, 1);
  canopyGeo.computeVertexNormals();
  const canopy = new THREE.Mesh(canopyGeo, toon(col));
  canopy.scale.set(1, opts.scaleY ?? 0.88, 1);
  canopy.position.y = h + r * 0.65;
  g.add(canopy);

  // Khối tán lá phụ tạo độ um tùm
  const subGeo = new THREE.IcosahedronGeometry(r * 0.6, 1);
  subGeo.computeVertexNormals();
  const subCanopy = new THREE.Mesh(subGeo, toon(PAL.leaf2));
  subCanopy.scale.set(1, 0.82, 1);
  subCanopy.position.set(r * 0.32, h + r * 0.9, -r * 0.22);
  g.add(subCanopy);

  return shadowy(g);
}

/**
 * Cổng sắt 2 cánh màu xanh lá đặc trưng trường học / nhà dân Việt Nam.
 */
export function ironGate(width = 6.0, height = 2.2, color: string = PAL.gateGreen): THREE.Group {
  const g = new THREE.Group(); g.name = 'iron-gate';
  const halfW = width / 2;

  for (const side of [-1, 1]) {
    const cx = side * (halfW / 2);

    // Khung chữ nhật bao ngoài cánh
    const frameTop = box(halfW - 0.08, 0.08, 0.08, color);
    frameTop.position.set(cx, height - 0.04, 0); g.add(frameTop);
    const frameBot = box(halfW - 0.08, 0.08, 0.08, color);
    frameBot.position.set(cx, 0.1, 0); g.add(frameBot);
    const frameOut = box(0.08, height, 0.08, color);
    frameOut.position.set(side * (halfW - 0.04), height / 2, 0); g.add(frameOut);
    const frameIn = box(0.08, height, 0.08, color);
    frameIn.position.set(side * 0.05, height / 2, 0); g.add(frameIn);

    // Các song sắt dọc
    const nBars = Math.max(3, Math.floor(halfW / 0.42));
    for (let i = 1; i < nBars; i++) {
      const bar = box(0.04, height - 0.22, 0.04, color);
      bar.position.set(side * (i * (halfW / nBars)), height / 2, 0);
      g.add(bar);
    }
    // Thanh chéo trợ lực
    const diag = box(0.04, height * 0.72, 0.04, color);
    diag.rotation.z = side * 0.52;
    diag.position.set(cx, height / 2, 0);
    g.add(diag);
  }
  return shadowy(g);
}

/**
 * Nhà dân có sân trước khép kín và cổng sắt riêng (chuẩn theo 10 căn trong ảnh ref).
 */
export function walledHouse(opts: {
  wallColor?: string;
  roofColor?: string;
  width?: number;
  depth?: number;
  height?: number;
  courtyardDepth?: number;
  hasTree?: boolean;
} = {}): THREE.Group {
  const g = new THREE.Group(); g.name = 'walled-house';
  const W = opts.width ?? 5.5;
  const D = opts.depth ?? 4.2;
  const H = opts.height ?? 2.7;
  const CD = opts.courtyardDepth ?? 3.2;
  const wallCol = opts.wallColor ?? PAL.houseYellow;
  const roofCol = opts.roofColor ?? PAL.roof;

  const baseH = 0.25;
  // Nền nhà
  const houseBase = box(W + 0.3, baseH, D + 0.3, PAL.concreteDark, 0.02);
  houseBase.position.set(0, baseH / 2, 0); g.add(houseBase);

  // Thân nhà
  const wallF = box(W, H, 0.2, wallCol); wallF.position.set(0, baseH + H / 2, D / 2); g.add(wallF);
  const wallB = box(W, H, 0.2, wallCol); wallB.position.set(0, baseH + H / 2, -D / 2); g.add(wallB);
  const wallL = box(0.2, H, D, wallCol); wallL.position.set(-W / 2, baseH + H / 2, 0); g.add(wallL);
  const wallR = box(0.2, H, D, wallCol); wallR.position.set(W / 2, baseH + H / 2, 0); g.add(wallR);

  // Cửa chính và cửa sổ mặt trước
  const door = box(1.1, 2.0, 0.08, PAL.frame, 0.02);
  door.position.set(W * 0.2, baseH + 1.0, D / 2 + 0.06); g.add(door);
  const win = box(1.2, 0.9, 0.08, PAL.frame, 0.02);
  win.position.set(-W * 0.22, baseH + 1.5, D / 2 + 0.06); g.add(win);
  const winG = box(1.0, 0.72, 0.04, PAL.glass);
  winG.position.set(-W * 0.22, baseH + 1.5, D / 2 + 0.09); g.add(winG);

  // Mái ngói dốc
  const over = 0.45, rise = 1.15;
  const roofShape = new THREE.Shape([
    new THREE.Vector2(-D / 2 - over, 0),
    new THREE.Vector2(D / 2 + over, 0),
    new THREE.Vector2(0, rise),
  ]);
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: W + 0.9, bevelEnabled: false });
  roofGeo.translate(0, 0, -(W + 0.9) / 2);
  const roofMesh = new THREE.Mesh(roofGeo, toon(roofCol));
  roofMesh.rotation.y = Math.PI / 2;
  roofMesh.position.set(0, baseH + H + 0.05, 0);
  roofMesh.castShadow = true; roofMesh.receiveShadow = true; g.add(roofMesh);

  // Bờ nóc
  const ridgeCol = (roofCol === PAL.roofGrey || roofCol === PAL.roofGreyDark) ? PAL.roofGreyDark : PAL.roofDark;
  const ridge = box(W + 0.95, 0.12, 0.22, ridgeCol, 0.02);
  ridge.position.set(0, baseH + H + 0.05 + rise, 0); g.add(ridge);

  // ── Sân trước khép kín & Tường rào ──
  const courtZ = D / 2 + CD / 2;
  const courtFloor = box(W, 0.03, CD, PAL.sidewalk);
  courtFloor.position.set(0, 0.015, courtZ); g.add(courtFloor);

  const fenceH = 0.88;
  // Tường bao 2 bên sân
  const fL = box(0.18, fenceH, CD, PAL.houseFence, 0.02);
  fL.position.set(-W / 2, fenceH / 2, courtZ); g.add(fL);
  const fR = box(0.18, fenceH, CD, PAL.houseFence, 0.02);
  fR.position.set(W / 2, fenceH / 2, courtZ); g.add(fR);

  // Tường bao mặt trước sân có chừa cổng
  const gateW = 1.4;
  const frontWallSegW = (W - gateW) / 2;
  const fF1 = box(frontWallSegW, fenceH, 0.18, PAL.houseFence, 0.02);
  fF1.position.set(-W / 2 + frontWallSegW / 2, fenceH / 2, D / 2 + CD); g.add(fF1);
  const fF2 = box(frontWallSegW, fenceH, 0.18, PAL.houseFence, 0.02);
  fF2.position.set(W / 2 - frontWallSegW / 2, fenceH / 2, D / 2 + CD); g.add(fF2);

  // Trụ cổng
  const post1 = box(0.32, fenceH + 0.18, 0.32, PAL.wallYellow, 0.03);
  post1.position.set(-gateW / 2, (fenceH + 0.18) / 2, D / 2 + CD); g.add(post1);
  const post2 = box(0.32, fenceH + 0.18, 0.32, PAL.wallYellow, 0.03);
  post2.position.set(gateW / 2, (fenceH + 0.18) / 2, D / 2 + CD); g.add(post2);

  // Cổng sắt nhỏ màu xanh lá
  const smallGate = ironGate(gateW - 0.05, fenceH, PAL.gateGreen);
  smallGate.position.set(0, 0, D / 2 + CD); g.add(smallGate);

  // Cây/Bụi xanh nhỏ trong góc sân
  if (opts.hasTree !== false) {
    const bushGeo = new THREE.IcosahedronGeometry(0.68, 1);
    bushGeo.computeVertexNormals();
    const bush = new THREE.Mesh(bushGeo, toon(PAL.leaf));
    bush.scale.set(1, 0.85, 1);
    bush.position.set(-W / 2 + 1.0, 0.6, courtZ);
    g.add(bush);
  }

  return shadowy(g);
}

/**
 * Tiệm Tạp Hóa chuẩn ref: mở mặt tiền, kệ hàng rực rỡ, TV cổ, ghế nhựa đỏ, mái hiên sọc đỏ trắng.
 */
export function tapHoaStore(): THREE.Group {
  const g = new THREE.Group(); g.name = 'tap-hoa-store';
  const W = 8.2;  // chiều ngang mặt tiền
  const D = 6.0;  // chiều sâu
  const H = 3.1;  // chiều cao
  const baseH = 0.28;

  // Nền
  const fnd = box(W + 0.4, baseH, D + 0.4, PAL.concreteDark, 0.02);
  fnd.position.set(0, baseH / 2, 0); g.add(fnd);

  // Tường sau và tường 2 bên
  const wallB = box(W, H, 0.22, PAL.houseYellow); wallB.position.set(0, baseH + H / 2, -D / 2); g.add(wallB);
  const wallL = box(0.22, H, D, PAL.houseYellow); wallL.position.set(-W / 2, baseH + H / 2, 0); g.add(wallL);
  const wallR = box(0.22, H, D, PAL.houseYellow); wallR.position.set(W / 2, baseH + H / 2, 0); g.add(wallR);

  // Mặt tiền mở: tường thấp 2 bên, khoảng mở lớn ở giữa
  const openW = W * 0.76;
  const pillarW = (W - openW) / 2;
  const pilL = box(pillarW, H, 0.22, PAL.houseYellow); pilL.position.set(-W / 2 + pillarW / 2, baseH + H / 2, D / 2); g.add(pilL);
  const pilR = box(pillarW, H, 0.22, PAL.houseYellow); pilR.position.set(W / 2 - pillarW / 2, baseH + H / 2, D / 2); g.add(pilR);
  const beamTop = box(W, 0.45, 0.26, PAL.houseYellow); beamTop.position.set(0, baseH + H - 0.225, D / 2); g.add(beamTop);

  // Mái ngói xám xanh
  const over = 0.55, rise = 1.35;
  const roofShape = new THREE.Shape([
    new THREE.Vector2(-D / 2 - over, 0),
    new THREE.Vector2(D / 2 + over, 0),
    new THREE.Vector2(0, rise),
  ]);
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: W + 1.0, bevelEnabled: false });
  roofGeo.translate(0, 0, -(W + 1.0) / 2);
  const roofMesh = new THREE.Mesh(roofGeo, toon(PAL.roofGrey));
  roofMesh.rotation.y = Math.PI / 2;
  roofMesh.position.set(0, baseH + H + 0.05, 0);
  roofMesh.castShadow = true; roofMesh.receiveShadow = true; g.add(roofMesh);

  const ridge = box(W + 1.05, 0.14, 0.26, PAL.roofGreyDark, 0.02);
  ridge.position.set(0, baseH + H + 0.05 + rise, 0); g.add(ridge);

  // Biển hiệu "TẠP HÓA"
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(openW * 0.9, 0.65),
    new THREE.MeshToonMaterial({ map: signTexture('TẠP HÓA', { w: 512, h: 128, bg: '#faf2e4', fg: '#d83828', border: '#e66542', font: `800 74px Nunito, sans-serif` }) })
  );
  signMesh.material.userData.outlineParameters = { visible: false };
  signMesh.position.set(0, baseH + H - 0.12, D / 2 + 0.2);
  signMesh.userData.noMerge = true;
  g.add(signMesh);

  // Mái hiên sọc đỏ - trắng
  const awningW = openW + 0.4;
  const aN = 12;
  for (let i = 0; i < aN; i++) {
    const sw = awningW / aN;
    const stripe = box(sw - 0.02, 0.05, 1.4, i % 2 === 0 ? PAL.awningRed : PAL.awningWhite);
    stripe.position.set(-awningW / 2 + (i + 0.5) * sw, baseH + H - 0.48, D / 2 + 0.9);
    stripe.rotation.x = 0.38;
    g.add(stripe);
  }

  // ── Nội thất bên trong tiệm ──
  // 1. Kệ gỗ nhiều tầng trưng bày hàng hóa
  const shelf = box(2.6, 1.8, 0.5, '#78563a'); shelf.position.set(-1.4, baseH + 0.9, D / 2 - 1.2); g.add(shelf);
  // Các hộp hàng nhiều màu trên kệ
  const boxCols = ['#e6c845', '#45b068', '#458ee6', '#e65a45', '#e68a35'];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const itemBox = box(0.38, 0.3, 0.32, boxCols[(row + col) % boxCols.length]);
      itemBox.position.set(-2.2 + col * 0.55, baseH + 0.45 + row * 0.52, D / 2 - 1.15);
      g.add(itemBox);
    }
  }

  // 2. Kệ TV CRT cổ
  const tvTable = box(1.6, 0.85, 0.7, '#634730'); tvTable.position.set(1.4, baseH + 0.425, D / 2 - 1.2); g.add(tvTable);
  const tvBody = box(0.9, 0.7, 0.6, '#383b42'); tvBody.position.set(1.4, baseH + 1.2, D / 2 - 1.2); g.add(tvBody);
  const tvScreen = box(0.72, 0.55, 0.05, '#5a8cb8'); tvScreen.position.set(1.4, baseH + 1.2, D / 2 - 0.88); g.add(tvScreen);

  // 3. Hàng ghế nhựa đỏ trước hiên
  for (let i = 0; i < 5; i++) {
    const stool = box(0.42, 0.36, 0.42, PAL.stoolRed, 0.03);
    stool.position.set(-1.4 + i * 0.7, baseH + 0.18, D / 2 + 0.9);
    g.add(stool);
  }

  return shadowy(g);
}

/**
 * Tiệm INTERNET (Quán Net) chuẩn ref: dãy bàn vi tính, màn hình máy tính xanh, biển hiệu Internet.
 */
export function netCafe(): THREE.Group {
  const g = new THREE.Group(); g.name = 'net-cafe';
  const W = 8.2;
  const D = 6.0;
  const H = 3.1;
  const baseH = 0.28;

  const fnd = box(W + 0.4, baseH, D + 0.4, PAL.concreteDark, 0.02);
  fnd.position.set(0, baseH / 2, 0); g.add(fnd);

  const wallB = box(W, H, 0.22, PAL.houseBlue); wallB.position.set(0, baseH + H / 2, -D / 2); g.add(wallB);
  const wallL = box(0.22, H, D, PAL.houseBlue); wallL.position.set(-W / 2, baseH + H / 2, 0); g.add(wallL);
  const wallR = box(0.22, H, D, PAL.houseBlue); wallR.position.set(W / 2, baseH + H / 2, 0); g.add(wallR);

  // Mặt tiền mở
  const openW = W * 0.76;
  const pillarW = (W - openW) / 2;
  const pilL = box(pillarW, H, 0.22, PAL.houseBlue); pilL.position.set(-W / 2 + pillarW / 2, baseH + H / 2, D / 2); g.add(pilL);
  const pilR = box(pillarW, H, 0.22, PAL.houseBlue); pilR.position.set(W / 2 - pillarW / 2, baseH + H / 2, D / 2); g.add(pilR);
  const beamTop = box(W, 0.45, 0.26, PAL.houseBlue); beamTop.position.set(0, baseH + H - 0.225, D / 2); g.add(beamTop);

  // Mái ngói xám
  const over = 0.55, rise = 1.35;
  const roofShape = new THREE.Shape([
    new THREE.Vector2(-D / 2 - over, 0),
    new THREE.Vector2(D / 2 + over, 0),
    new THREE.Vector2(0, rise),
  ]);
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: W + 1.0, bevelEnabled: false });
  roofGeo.translate(0, 0, -(W + 1.0) / 2);
  const roofMesh = new THREE.Mesh(roofGeo, toon(PAL.roofGrey));
  roofMesh.rotation.y = Math.PI / 2;
  roofMesh.position.set(0, baseH + H + 0.05, 0);
  roofMesh.castShadow = true; roofMesh.receiveShadow = true; g.add(roofMesh);

  const ridge = box(W + 1.05, 0.14, 0.26, PAL.roofGreyDark, 0.02);
  ridge.position.set(0, baseH + H + 0.05 + rise, 0); g.add(ridge);

  // Biển hiệu "INTERNET"
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(openW * 0.88, 0.65),
    new THREE.MeshToonMaterial({ map: signTexture('INTERNET', { w: 512, h: 128, bg: '#faf4ea', fg: '#2255a8', border: '#3b78c8', font: `900 76px Nunito, sans-serif` }) })
  );
  signMesh.material.userData.outlineParameters = { visible: false };
  signMesh.position.set(0, baseH + H - 0.12, D / 2 + 0.2);
  signMesh.userData.noMerge = true;
  g.add(signMesh);

  // ── Dàn máy tính bên trong (2 dãy) ──
  for (const side of [-1, 1]) {
    const deskX = side * 1.6;
    const desk = box(1.8, 0.75, 4.0, PAL.pcDesk);
    desk.position.set(deskX, baseH + 0.375, 0); g.add(desk);

    // 3 máy tính trên mỗi bàn
    for (let i = 0; i < 3; i++) {
      const pz = -1.3 + i * 1.3;
      // Màn hình
      const monBase = box(0.25, 0.08, 0.22, PAL.pcCase); monBase.position.set(deskX, baseH + 0.79, pz); g.add(monBase);
      const monScreen = box(0.12, 0.52, 0.65, PAL.pcCase); monScreen.position.set(deskX, baseH + 1.08, pz); g.add(monScreen);
      // Màn hình phát sáng xanh
      const displayFace = box(0.04, 0.44, 0.56, PAL.pcScreen);
      displayFace.position.set(deskX - side * 0.06, baseH + 1.08, pz); g.add(displayFace);
      // Ghế
      const chair = box(0.46, 0.48, 0.46, '#3a3e46', 0.04);
      chair.position.set(deskX - side * 0.7, baseH + 0.24, pz); g.add(chair);
    }
  }

  return shadowy(g);
}

/**
 * Chòi gỗ góc sân trên trái (Gazebo / Quán cóc) kèm bộ bàn ghế và nền cát.
 */
export function woodenGazebo(): THREE.Group {
  const g = new THREE.Group(); g.name = 'wooden-gazebo';
  const size = 7.5;

  // Nền đất cát
  const sand = box(size, 0.04, size, PAL.soilSand);
  sand.position.set(0, 0.02, 0); g.add(sand);

  // 4 cột gỗ
  const postH = 2.7;
  const pw = 4.6, pd = 3.6;
  for (const sx of [-pw / 2, pw / 2]) {
    for (const sz of [-pd / 2, pd / 2]) {
      const p = box(0.22, postH, 0.22, PAL.trunk, 0.02);
      p.position.set(sx, postH / 2, sz); g.add(p);
    }
  }

  // Mái tôn / ngói dốc nhẹ
  const roofMesh = box(pw + 1.2, 0.08, pd + 1.4, PAL.roofGrey, 0.02);
  roofMesh.position.set(0, postH + 0.2, 0);
  roofMesh.rotation.x = -0.14;
  g.add(roofMesh);

  // Bộ bàn ghế gỗ
  const table = box(1.8, 0.75, 1.0, '#75543c', 0.03);
  table.position.set(0, 0.375, 0); g.add(table);
  for (const sx of [-0.6, 0.6]) {
    for (const sz of [-0.9, 0.9]) {
      const chair = box(0.42, 0.45, 0.42, '#8a6548', 0.03);
      chair.position.set(sx, 0.225, sz); g.add(chair);
    }
  }

  return shadowy(g);
}

// Giữ lại các hàm cũ để tương thích hoàn toàn
export function houseUnit(
  wallColor: string = PAL.houseBlue,
  roofColor: string = PAL.roofGrey,
  opts: { width?: number; depth?: number; height?: number; hasFence?: boolean; shopSign?: string } = {}
): THREE.Group {
  return walledHouse({
    wallColor, roofColor,
    width: opts.width ?? 5.5,
    depth: opts.depth ?? 4.2,
    height: opts.height ?? 2.7,
  });
}

export function sidewalkStrip(length: number, width = 2.0): THREE.Group {
  const g = new THREE.Group(); g.name = 'sidewalk';
  const pavement = new THREE.Mesh(new THREE.PlaneGeometry(length, width), toon(PAL.sidewalk, { outline: false }));
  pavement.rotation.x = -Math.PI / 2; pavement.position.y = 0.02; pavement.receiveShadow = true; g.add(pavement);
  const kerb = box(length, 0.12, 0.18, PAL.kerb); kerb.position.set(0, 0.06, width / 2 - 0.09); g.add(kerb);
  return g;
}

export function neighborhoodBlock(n: number, opts: { facing?: 'front' | 'back'; startX?: number; z?: number } = {}): THREE.Group {
  const g = new THREE.Group(); g.name = 'neighborhood-block';
  const z0 = opts.z ?? 0;
  const startX = opts.startX ?? 0;
  const wallCols = [PAL.houseYellow, PAL.houseBlue, PAL.houseGreen, PAL.housePink];
  const roofCols = [PAL.roof, PAL.roofGrey, PAL.roof, PAL.roofGrey];
  for (let i = 0; i < n; i++) {
    const h = walledHouse({ wallColor: wallCols[i % wallCols.length], roofColor: roofCols[i % roofCols.length] });
    h.position.set(startX + i * 6.8, 0, z0);
    if (opts.facing === 'back') h.rotation.y = Math.PI;
    g.add(h);
  }
  return g;
}


