import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { AssetGenerator, BuildOptions, MaterialMode, ParamDefinition } from './types';

/** Các tham số cấu hình cho bộ bàn ghế học sinh THCS */
export interface VietnameseSchoolDeskParams {
  // Kiểu dáng tổng thể
  style: 'detached' | 'connected' | 'single' | 'vintage';
  seatCount: 1 | 2; // Số chỗ ngồi (1 hoặc 2)

  // Kích thước bàn (đơn vị: mét)
  deskWidth: number;          // Chiều rộng bàn (chuẩn: 1.2m cho 2 chỗ, 0.65m cho 1 chỗ)
  deskDepth: number;          // Chiều sâu mặt bàn (chuẩn: 0.45m - 0.5m)
  deskHeight: number;         // Chiều cao bàn (chuẩn THCS: 0.64m - 0.69m)
  tabletopThickness: number;  // Độ dày mặt bàn gỗ (0.018m - 0.025m)

  // Kích thước ghế
  chairSeatWidth: number;     // Chiều rộng mặt ghế (chuẩn: 0.38m - 0.4m)
  chairSeatDepth: number;     // Chiều sâu mặt ghế (chuẩn: 0.36m - 0.4m)
  chairSeatHeight: number;    // Chiều cao mặt ghế tính từ sàn (chuẩn THCS: 0.38m - 0.41m)
  chairBackHeight: number;    // Chiều cao tựa lưng ghế tính từ sàn (chuẩn: 0.72m - 0.78m)
  chairDistance: number;      // Khoảng cách từ bàn đến mép ghế (0.1m - 0.25m)

  // Chi tiết đặc trưng trường học Việt Nam
  hasPencilGroove: boolean;   // Rãnh để bút/thước kẻ trên mặt bàn
  hasShelf: boolean;          // Ngăn để cặp/sách vở dưới bàn
  hasBagHook: boolean;        // Móc treo cặp bên sườn bàn
  hasFootrest: boolean;       // Thanh giằng ngang để chân
  hasRubberFeet: boolean;     // Đệm cao su/nhựa bọc chân chống trầy

  // Màu sắc & Vật liệu
  woodColor: string;          // Màu gỗ (mặt bàn, mặt ghế, tựa lưng)
  frameColor: string;         // Màu sơn khung kim loại (sơn tĩnh điện)
  feetColor: string;          // Màu nút bọc chân (đen/xám)
  hookColor: string;          // Màu móc treo cặp (bạc/inox hoặc trùng màu khung)
  woodRoughness: number;      // Độ nhám PBR mặt gỗ
  metalRoughness: number;     // Độ nhám PBR khung kim loại
  metalness: number;          // Tính kim loại PBR
}

/** Giá trị mặc định theo tiêu chuẩn Bộ Giáo dục & Đào tạo cho học sinh THCS (Cỡ V) */
export const defaultSchoolDeskParams: VietnameseSchoolDeskParams = {
  style: 'detached',
  seatCount: 2,
  deskWidth: 1.2,
  deskDepth: 0.45,
  deskHeight: 0.68,
  tabletopThickness: 0.02,
  chairSeatWidth: 0.38,
  chairSeatDepth: 0.36,
  chairSeatHeight: 0.40,
  chairBackHeight: 0.76,
  chairDistance: 0.16,
  hasPencilGroove: true,
  hasShelf: true,
  hasBagHook: true,
  hasFootrest: true,
  hasRubberFeet: true,
  woodColor: '#cf9860',       // Vàng cánh gián nhạt tự nhiên
  frameColor: '#5c646b',      // Xám ghi sơn tĩnh điện
  feetColor: '#22252a',       // Nút nhựa đen
  hookColor: '#a6adb3',       // Inox bạc
  woodRoughness: 0.65,
  metalRoughness: 0.45,
  metalness: 0.75,
};

/** Tạo vật liệu theo chế độ được chọn */
function createMaterial(
  color: string,
  mode: MaterialMode = 'toon',
  opts: { roughness?: number; metalness?: number; outline?: boolean } = {}
): THREE.Material {
  if (mode === 'wireframe') {
    return new THREE.MeshBasicMaterial({ color: '#10b981', wireframe: true });
  }

  if (mode === 'normal') {
    return new THREE.MeshNormalMaterial();
  }

  if (mode === 'pbr') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: opts.roughness ?? 0.5,
      metalness: opts.metalness ?? 0.1,
    });
  }

  // Chế độ 'toon' (Game visual style)
  const steps = new Uint8Array([140, 140, 140, 255, 210, 210, 210, 255, 255, 255, 255, 255]);
  const grad = new THREE.DataTexture(steps, 3, 1, THREE.RGBAFormat);
  grad.minFilter = THREE.NearestFilter;
  grad.magFilter = THREE.NearestFilter;
  grad.generateMipmaps = false;
  grad.needsUpdate = true;

  const m = new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
    gradientMap: grad,
  });
  m.userData.outlineParameters = {
    visible: opts.outline ?? true,
    thickness: 0.0035,
    color: [0.2, 0.15, 0.12],
    alpha: 1,
  };
  return m;
}

/** Helper tạo hình hộp bo tròn */
function createBox(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  radius = 0.005,
  segments = 2
): THREE.Mesh {
  const geo = radius > 0 ? new RoundedBoxGeometry(w, h, d, segments, radius) : new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Helper tạo hình trụ tròn (ống thép, chân ghế) */
function createCylinder(
  rTop: number,
  rBot: number,
  h: number,
  mat: THREE.Material,
  radialSegs = 12
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(rTop, rBot, h, radialSegs);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Hàm chính sinh mô hình 3D bộ bàn ghế học sinh THCS thủ tục */
export function buildVietnameseSchoolDesk(
  params: VietnameseSchoolDeskParams = defaultSchoolDeskParams,
  options: BuildOptions = {}
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Vietnamese_School_Desk_Set';

  const mode = options.materialMode ?? 'toon';
  const outline = options.outline ?? true;

  // Tạo các vật liệu
  const woodMat = createMaterial(params.woodColor, mode, {
    roughness: params.woodRoughness,
    metalness: 0.05,
    outline,
  });
  const frameMat = createMaterial(params.frameColor, mode, {
    roughness: params.metalRoughness,
    metalness: params.metalness,
    outline,
  });
  const feetMat = createMaterial(params.feetColor, mode, {
    roughness: 0.8,
    metalness: 0.1,
    outline,
  });
  const hookMat = createMaterial(params.hookColor, mode, {
    roughness: 0.3,
    metalness: 0.9,
    outline,
  });

  const effectiveSeatCount = params.style === 'single' ? 1 : params.seatCount;
  const deskW = params.style === 'single' ? Math.min(params.deskWidth, 0.7) : params.deskWidth;
  const deskD = params.deskDepth;
  const deskH = params.deskHeight;
  const topThick = params.tabletopThickness;
  const pipeR = 0.0125; // Ống thép bán kính 12.5mm (ống d25mm) hoặc thép hộp 25x25mm
  const footH = 0.018;

  // ==========================================
  // 1. BÀN HỌC (DESK)
  // ==========================================
  const deskGroup = new THREE.Group();
  deskGroup.name = 'Desk_Group';

  // 1.1 Mặt bàn gỗ
  const tabletop = createBox(deskW, topThick, deskD, woodMat, 0.008, 3);
  tabletop.name = 'Desk_Tabletop';
  tabletop.position.set(0, deskH - topThick / 2, 0);
  deskGroup.add(tabletop);

  // 1.2 Rãnh để bút/thước mép trên
  if (params.hasPencilGroove && mode !== 'wireframe') {
    const grooveW = deskW * 0.75;
    const grooveD = 0.022;
    const grooveH = 0.004;
    const grooveColor = new THREE.Color(params.woodColor).multiplyScalar(0.78).getHexString();
    const grooveMat = createMaterial(`#${grooveColor}`, mode, {
      roughness: params.woodRoughness + 0.1,
      metalness: 0.05,
      outline: false,
    });
    const groove = createBox(grooveW, grooveH, grooveD, grooveMat, 0.002, 2);
    groove.name = 'Desk_Pencil_Groove';
    groove.position.set(0, deskH - topThick + 0.002 + grooveH / 2, -deskD / 2 + 0.05);
    deskGroup.add(groove);
  }

  // 1.3 Ngăn bàn để sách vở / cặp sách
  const shelfTopY = deskH - topThick - 0.12; // Chiều cao ngăn bàn ~12cm
  if (params.hasShelf) {
    const shelfW = deskW - 0.1;
    const shelfD = deskD - 0.06;
    const shelfThick = 0.012;

    // Đáy ngăn bàn
    const shelfBottom = createBox(shelfW, shelfThick, shelfD, woodMat, 0.004, 2);
    shelfBottom.name = 'Desk_Shelf_Bottom';
    shelfBottom.position.set(0, shelfTopY, 0.01);
    deskGroup.add(shelfBottom);

    // Tấm chắn sau ngăn bàn (để sách không bị rơi ra đằng trước)
    const backWallH = 0.1;
    const backWall = createBox(shelfW, backWallH, 0.01, woodMat, 0.003, 2);
    backWall.name = 'Desk_Shelf_BackWall';
    backWall.position.set(0, shelfTopY + backWallH / 2, -deskD / 2 + 0.035);
    deskGroup.add(backWall);

    // 2 vách hông ngăn bàn
    for (const side of [-1, 1]) {
      const sideWall = createBox(0.01, backWallH, shelfD, woodMat, 0.003, 2);
      sideWall.name = `Desk_Shelf_SideWall_${side < 0 ? 'Left' : 'Right'}`;
      sideWall.position.set(side * (shelfW / 2 - 0.005), shelfTopY + backWallH / 2, 0.01);
      deskGroup.add(sideWall);
    }
  }

  // 1.4 Khung chân bàn kim loại
  const legXOffsets = [-deskW / 2 + 0.08, deskW / 2 - 0.08];
  const legBottomY = footH;
  const legTopY = deskH - topThick;
  const legHeight = legTopY - legBottomY;

  for (let i = 0; i < legXOffsets.length; i++) {
    const lx = legXOffsets[i];
    const sideSuffix = i === 0 ? 'Left' : 'Right';

    // Cột đứng phía trước và phía sau
    for (const zDir of [-1, 1]) {
      const lz = zDir * (deskD / 2 - 0.05);
      const legPost = createCylinder(pipeR, pipeR, legHeight, frameMat);
      legPost.name = `Desk_Leg_${sideSuffix}_${zDir < 0 ? 'Front' : 'Back'}`;
      legPost.position.set(lx, legBottomY + legHeight / 2, lz);
      deskGroup.add(legPost);

      // Chân đệm cao su
      if (params.hasRubberFeet) {
        const rubberFoot = createCylinder(pipeR * 1.3, pipeR * 1.35, footH, feetMat);
        rubberFoot.name = `Desk_RubberFoot_${sideSuffix}_${zDir < 0 ? 'Front' : 'Back'}`;
        rubberFoot.position.set(lx, footH / 2, lz);
        deskGroup.add(rubberFoot);
      }
    }

    // Thanh ngang đáy chân (nối chân trước và chân sau)
    const baseBar = createBox(pipeR * 2.2, pipeR * 2, deskD - 0.06, frameMat, 0.003, 2);
    baseBar.name = `Desk_LegBase_${sideSuffix}`;
    baseBar.position.set(lx, footH + pipeR, 0);
    deskGroup.add(baseBar);

    // Thanh đỡ mặt bàn trên cùng
    const topSupport = createBox(pipeR * 2.2, pipeR * 2, deskD - 0.06, frameMat, 0.003, 2);
    topSupport.name = `Desk_TopSupport_${sideSuffix}`;
    topSupport.position.set(lx, legTopY - pipeR, 0);
    deskGroup.add(topSupport);
  }

  // 1.5 Thanh giằng để chân (Footrest bar)
  if (params.hasFootrest) {
    const footrestY = 0.12; // Chiều cao gác chân ~12cm
    const footrestBar = createBox(deskW - 0.16, pipeR * 2, pipeR * 2, frameMat, 0.003, 2);
    footrestBar.name = 'Desk_Footrest_Bar';
    footrestBar.position.set(0, footrestY, -0.02);
    deskGroup.add(footrestBar);
  }

  // 1.6 Móc treo cặp sách bên hông (Backpack Hook)
  if (params.hasBagHook) {
    for (let i = 0; i < legXOffsets.length; i++) {
      const lx = legXOffsets[i];
      const side = i === 0 ? -1 : 1;
      const hookGroup = new THREE.Group();
      hookGroup.name = `Desk_BagHook_${side < 0 ? 'Left' : 'Right'}`;

      // Thanh đâm ngang ra ngoài
      const hookStem = createCylinder(0.004, 0.004, 0.045, hookMat);
      hookStem.rotation.z = Math.PI / 2;
      hookStem.position.set(lx + side * 0.0225, deskH - 0.14, -deskD / 2 + 0.12);
      hookGroup.add(hookStem);

      // Đầu móc cong lên
      const hookTip = createCylinder(0.004, 0.004, 0.025, hookMat);
      hookTip.position.set(lx + side * 0.045, deskH - 0.14 + 0.0125, -deskD / 2 + 0.12);
      hookGroup.add(hookTip);

      deskGroup.add(hookGroup);
    }
  }

  root.add(deskGroup);

  // ==========================================
  // 2. GHẾ HỌC SINH (CHAIRS)
  // ==========================================
  const chairGroup = new THREE.Group();
  chairGroup.name = 'Chairs_Group';

  const chairSeatW = params.chairSeatWidth;
  const chairSeatD = params.chairSeatDepth;
  const chairSeatH = params.chairSeatHeight;
  const chairBackH = params.chairBackHeight;
  const chairThick = 0.015;

  // Xác định vị trí X của các ghế
  let chairXPositions: number[] = [];
  if (effectiveSeatCount === 1) {
    chairXPositions = [0];
  } else {
    const chairGap = deskW * 0.5;
    chairXPositions = [-chairGap / 2, chairGap / 2];
  }

  // Tọa độ Z tâm ghế (đặt sau bàn)
  const chairCenterZ = deskD / 2 + params.chairDistance + chairSeatD / 2;

  chairXPositions.forEach((cx, idx) => {
    const singleChair = new THREE.Group();
    singleChair.name = `Chair_${idx + 1}`;

    // 2.1 Mặt ngồi của ghế
    const seat = createBox(chairSeatW, chairThick, chairSeatD, woodMat, 0.006, 3);
    seat.name = `Chair_Seat_${idx + 1}`;
    seat.position.set(cx, chairSeatH - chairThick / 2, chairCenterZ);
    singleChair.add(seat);

    // 2.2 Tựa lưng ghế
    const backrestH = 0.15;
    const backrestW = chairSeatW * 0.95;
    const backZ = chairCenterZ + chairSeatD / 2 - 0.02;
    const backrest = createBox(backrestW, backrestH, chairThick, woodMat, 0.005, 3);
    backrest.name = `Chair_Backrest_${idx + 1}`;
    // Hơi nghiêng tựa lưng về sau khoảng 7 độ (~0.12 rad)
    backrest.rotation.x = 0.12;
    backrest.position.set(cx, chairBackH - backrestH / 2, backZ);
    singleChair.add(backrest);

    // 2.3 Cột đỡ tựa lưng (2 thanh kim loại uốn vươn từ khung ghế lên tựa lưng)
    const backPostOffsets = [-backrestW * 0.35, backrestW * 0.35];
    const postH = chairBackH - chairSeatH;
    for (const bpx of backPostOffsets) {
      const backPost = createCylinder(pipeR * 0.8, pipeR * 0.8, postH, frameMat);
      backPost.name = `Chair_BackPost_${idx + 1}_${bpx < 0 ? 'L' : 'R'}`;
      backPost.rotation.x = 0.12;
      backPost.position.set(cx + bpx, chairSeatH + postH / 2 - 0.02, backZ - 0.01);
      singleChair.add(backPost);
    }

    // 2.4 Chân ghế kim loại
    if (params.style !== 'connected') {
      // Ghế rời: 4 chân độc lập
      const chairLegH = chairSeatH - chairThick - footH;
      const legXChair = [-chairSeatW / 2 + 0.04, chairSeatW / 2 - 0.04];
      const legZChair = [chairCenterZ - chairSeatD / 2 + 0.04, chairCenterZ + chairSeatD / 2 - 0.04];

      for (const clx of legXChair) {
        for (const clz of legZChair) {
          const cLeg = createCylinder(pipeR * 0.9, pipeR * 0.9, chairLegH, frameMat);
          cLeg.name = `Chair_Leg_${idx + 1}`;
          cLeg.position.set(cx + clx, footH + chairLegH / 2, clz);
          singleChair.add(cLeg);

          if (params.hasRubberFeet) {
            const cFoot = createCylinder(pipeR * 1.2, pipeR * 1.25, footH, feetMat);
            cFoot.name = `Chair_Foot_${idx + 1}`;
            cFoot.position.set(cx + clx, footH / 2, clz);
            singleChair.add(cFoot);
          }
        }
      }

      // Khung giằng chân ghế
      const chairBrace = createBox(chairSeatW - 0.08, pipeR * 1.8, chairSeatD - 0.08, frameMat, 0.002, 2);
      chairBrace.name = `Chair_Brace_${idx + 1}`;
      chairBrace.position.set(cx, 0.1, chairCenterZ);
      singleChair.add(chairBrace);
    } else {
      // Kiểu bàn liền ghế (connected): Ghế có chân đứng sau, chân trước gắn vào thanh nối với bàn
      const chairRearLegH = chairSeatH - chairThick - footH;
      const legXChair = [-chairSeatW / 2 + 0.04, chairSeatW / 2 - 0.04];
      const rearZ = chairCenterZ + chairSeatD / 2 - 0.04;

      for (const clx of legXChair) {
        const cLeg = createCylinder(pipeR * 0.9, pipeR * 0.9, chairRearLegH, frameMat);
        cLeg.name = `Chair_Connected_RearLeg_${idx + 1}`;
        cLeg.position.set(cx + clx, footH + chairRearLegH / 2, rearZ);
        singleChair.add(cLeg);

        if (params.hasRubberFeet) {
          const cFoot = createCylinder(pipeR * 1.2, pipeR * 1.25, footH, feetMat);
          cFoot.position.set(cx + clx, footH / 2, rearZ);
          singleChair.add(cFoot);
        }
      }
    }

    chairGroup.add(singleChair);
  });

  // 2.5 Thanh khung nối liền bàn và ghế (nếu là kiểu 'connected')
  if (params.style === 'connected') {
    const connectZLen = chairCenterZ + chairSeatD / 2 - (-deskD / 2 + 0.05);
    const connectMidZ = (chairCenterZ + chairSeatD / 2 + (-deskD / 2 + 0.05)) / 2;

    for (let i = 0; i < legXOffsets.length; i++) {
      const lx = legXOffsets[i];
      // Thanh dầm đáy nối thẳng từ bàn tới chân sau của ghế
      const bottomBeam = createBox(pipeR * 2.2, pipeR * 2.2, connectZLen, frameMat, 0.003, 2);
      bottomBeam.name = `Connected_BottomBeam_${i === 0 ? 'Left' : 'Right'}`;
      bottomBeam.position.set(lx, footH + pipeR * 1.1, connectMidZ);
      root.add(bottomBeam);

      // Cột chống từ thanh dầm lên mặt ghế
      const chairPostH = chairSeatH - chairThick - (footH + pipeR * 2.2);
      const chairMidPost = createCylinder(pipeR, pipeR, chairPostH, frameMat);
      chairMidPost.name = `Connected_SeatSupport_${i === 0 ? 'Left' : 'Right'}`;
      chairMidPost.position.set(lx, footH + pipeR * 2.2 + chairPostH / 2, chairCenterZ);
      root.add(chairMidPost);
    }
  }

  root.add(chairGroup);

  return root;
}

/** Định nghĩa danh mục tham số cấu hình để UI tự sinh form */
export const schoolDeskParamDefs: ParamDefinition[] = [
  // Nhóm Kích thước
  {
    key: 'deskWidth',
    label: 'Chiều rộng bàn (m)',
    type: 'number',
    group: 'dimensions',
    default: 1.2,
    min: 0.5,
    max: 1.8,
    step: 0.05,
    unit: 'm',
  },
  {
    key: 'deskDepth',
    label: 'Chiều sâu mặt bàn (m)',
    type: 'number',
    group: 'dimensions',
    default: 0.45,
    min: 0.35,
    max: 0.7,
    step: 0.02,
    unit: 'm',
  },
  {
    key: 'deskHeight',
    label: 'Chiều cao bàn (m)',
    type: 'number',
    group: 'dimensions',
    default: 0.68,
    min: 0.55,
    max: 0.85,
    step: 0.01,
    unit: 'm',
  },
  {
    key: 'tabletopThickness',
    label: 'Độ dày mặt bàn (m)',
    type: 'number',
    group: 'dimensions',
    default: 0.02,
    min: 0.01,
    max: 0.04,
    step: 0.002,
    unit: 'm',
  },
  {
    key: 'chairSeatHeight',
    label: 'Chiều cao ghế (m)',
    type: 'number',
    group: 'dimensions',
    default: 0.40,
    min: 0.3,
    max: 0.52,
    step: 0.01,
    unit: 'm',
  },
  {
    key: 'chairDistance',
    label: 'Khoảng cách bàn - ghế (m)',
    type: 'number',
    group: 'dimensions',
    default: 0.16,
    min: 0.08,
    max: 0.35,
    step: 0.01,
    unit: 'm',
  },

  // Nhóm Kiểu dáng
  {
    key: 'style',
    label: 'Kiểu bàn ghế',
    type: 'select',
    group: 'style',
    default: 'detached',
    options: [
      { value: 'detached', label: 'Bàn rời 2 ghế (Tiêu chuẩn hiện nay)' },
      { value: 'connected', label: 'Bàn liền ghế (Truyền thống THCS)' },
      { value: 'single', label: 'Bàn học sinh đơn (1 chỗ)' },
      { value: 'vintage', label: 'Bàn gỗ cũ hoài niệm (Vintage)' },
    ],
  },
  {
    key: 'seatCount',
    label: 'Số chỗ ngồi',
    type: 'select',
    group: 'style',
    default: '2',
    options: [
      { value: '1', label: '1 chỗ ngồi' },
      { value: '2', label: '2 chỗ ngồi' },
    ],
  },

  // Nhóm Chi tiết đặc trưng
  {
    key: 'hasPencilGroove',
    label: 'Rãnh để bút/thước',
    type: 'boolean',
    group: 'features',
    default: true,
  },
  {
    key: 'hasShelf',
    label: 'Ngăn để cặp/sách vở',
    type: 'boolean',
    group: 'features',
    default: true,
  },
  {
    key: 'hasBagHook',
    label: 'Móc treo cặp bên hông',
    type: 'boolean',
    group: 'features',
    default: true,
  },
  {
    key: 'hasFootrest',
    label: 'Thanh giằng để chân',
    type: 'boolean',
    group: 'features',
    default: true,
  },
  {
    key: 'hasRubberFeet',
    label: 'Nút cao su bọc chân',
    type: 'boolean',
    group: 'features',
    default: true,
  },

  // Nhóm Vật liệu & Màu sắc
  {
    key: 'woodColor',
    label: 'Màu gỗ (Mặt bàn/ghế)',
    type: 'color',
    group: 'materials',
    default: '#cf9860',
  },
  {
    key: 'frameColor',
    label: 'Màu sơn khung kim loại',
    type: 'color',
    group: 'materials',
    default: '#5c646b',
  },
  {
    key: 'feetColor',
    label: 'Màu nút đệm chân',
    type: 'color',
    group: 'materials',
    default: '#22252a',
  },
  {
    key: 'hookColor',
    label: 'Màu móc treo cặp',
    type: 'color',
    group: 'materials',
    default: '#a6adb3',
  },
];

/** Module Asset Generator hoàn chỉnh đăng ký vào Workshop */
export const vietnameseSchoolDeskGenerator: AssetGenerator<VietnameseSchoolDeskParams> = {
  id: 'vietnamese-school-desk',
  name: 'Bộ bàn ghế học sinh THCS',
  description: 'Bộ bàn ghế học sinh THCS đặc trưng của trường học Việt Nam (BGD Cỡ IV/V)',
  category: 'Nội thất lớp học',
  defaultParams: defaultSchoolDeskParams,
  paramDefinitions: schoolDeskParamDefs,
  presets: [
    {
      id: 'standard-detached',
      name: 'Bàn rời 2 ghế chuẩn BGD (Khuyên dùng)',
      description: 'Bàn 2 chỗ ngồi kèm 2 ghế rời tiêu chuẩn phòng học THCS Việt Nam hiện nay.',
      params: {
        style: 'detached',
        seatCount: 2,
        deskWidth: 1.2,
        deskDepth: 0.45,
        deskHeight: 0.68,
        chairSeatHeight: 0.40,
        chairDistance: 0.16,
        woodColor: '#cf9860',
        frameColor: '#5c646b',
      },
    },
    {
      id: 'classic-connected',
      name: 'Bàn liền ghế cổ điển (Năm 2000-2015)',
      description: 'Bàn và ghế hàn liền khung sắt, rất thân thuộc trong ký ức học trò.',
      params: {
        style: 'connected',
        seatCount: 2,
        deskWidth: 1.2,
        deskDepth: 0.45,
        deskHeight: 0.68,
        chairSeatHeight: 0.40,
        chairDistance: 0.14,
        woodColor: '#d69e65',
        frameColor: '#2b476b', // Sơn khung xanh đậm trường học quen thuộc
      },
    },
    {
      id: 'single-study',
      name: 'Bàn học sinh đơn (1 chỗ)',
      description: 'Bàn đơn gọn gàng cho 1 học sinh, thích hợp phòng bộ môn hoặc góc học tập.',
      params: {
        style: 'single',
        seatCount: 1,
        deskWidth: 0.65,
        deskDepth: 0.45,
        deskHeight: 0.68,
        chairSeatHeight: 0.40,
        chairDistance: 0.15,
        woodColor: '#cf9860',
        frameColor: '#5c646b',
      },
    },
    {
      id: 'vintage-classroom',
      name: 'Gỗ cũ hoài niệm (Thập niên 2000s)',
      description: 'Màu gỗ sẫm màu cánh gián, khung sắt đen xám bụi thời gian.',
      params: {
        style: 'detached',
        seatCount: 2,
        deskWidth: 1.2,
        deskDepth: 0.45,
        deskHeight: 0.68,
        chairSeatHeight: 0.40,
        chairDistance: 0.16,
        woodColor: '#8a532f', // Gỗ sẫm màu cánh gián
        frameColor: '#36393e', // Khung kim loại xám đen
        woodRoughness: 0.8,
      },
    },
  ],
  build: buildVietnameseSchoolDesk,
};
