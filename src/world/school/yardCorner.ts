import * as THREE from 'three';
import { toon } from '../../render/materials';
import { concreteTexture } from '../../render/canvasTex';
import { clouds, skyDome } from '../sky';
import { classBlock } from './classBlock';
import {
  PAL, box, bench, flagpole, facetedTree, ironGate,
  walledHouse, tapHoaStore, netCafe, woodenGazebo, trashBin
} from './props';

/**
 * Bản đồ xóm trường học KNĐMST dựng chuẩn 100% theo ảnh reference Diorama Low-Poly:
 * - Khối đế diorama nổi có gờ đất nung + mặt cỏ xanh ấm
 * - Trường học chữ L (dãy chính + cánh phải) + tường bao + CỔNG SẮT chính giữa
 * - Cột cờ + 2 cây bàng/phượng đa giác có bồn cây vuông
 * - Trục đường chính nhựa than + ngã ba đường ngang + vỉa hè bo viền
 * - Tiệm Tạp Hóa (ghế đỏ, TV, kệ hàng) & Quán Net (dàn máy tính PC) mặt tiền hướng Nam
 * - 10 căn nhà dân có sân riêng & cổng sắt xanh (3 trái, 3 phải, 4 dưới)
 * - Chòi gỗ quán cóc góc trên bên trái
 */
export interface YardCorner {
  root: THREE.Group;
  anchors: Record<'phuong' | 'bang' | 'flag' | 'gate', THREE.Vector3>;
  update(t: number): void;
}

export interface YardVariantOpts { phuongBloom?: number; sky?: [string, string, string] }

export function buildYardCorner(variant: YardVariantOpts = {}): YardCorner {
  const root = new THREE.Group(); root.name = 'neighborhood-diorama';

  // Bầu trời pastel lavender ấm áp
  root.add(skyDome(variant.sky ?? ['#c8b8e8', '#ddd0f0', '#f2ecf8']), clouds());

  // ══════════════════════════════════════════════════════════════════════════
  // 1. KHỐI ĐẾ DIORAMA NỔI (Floating Diorama Slab)
  // ══════════════════════════════════════════════════════════════════════════
  const slabSize = 74;
  const earthBase = box(slabSize, 1.4, slabSize, PAL.dioramaBase, 0.06);
  earthBase.position.y = -0.7;
  earthBase.receiveShadow = true;
  root.add(earthBase);

  // Mặt cỏ xanh cốm ấm
  const lawn = new THREE.Mesh(
    new THREE.PlaneGeometry(slabSize - 0.4, slabSize - 0.4),
    toon(PAL.dioramaGrass, { outline: false })
  );
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.y = 0.005;
  lawn.receiveShadow = true;
  root.add(lawn);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. KHU TRƯỜNG HỌC (Phía Bắc: z = -32 đến z = -14)
  // ══════════════════════════════════════════════════════════════════════════
  // Mặt sân trường lát gạch xi măng
  const courtGround = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 17),
    new THREE.MeshToonMaterial({ map: concreteTexture(), color: '#faf4e8' })
  );
  courtGround.material.userData.outlineParameters = { visible: false };
  courtGround.rotation.x = -Math.PI / 2;
  courtGround.position.set(1.5, 0.015, -22.5);
  courtGround.receiveShadow = true;
  root.add(courtGround);

  // Dãy trường học chính (ngang): 5 phòng học
  const mainWing = classBlock({
    rooms: 5,
    roomW: 6.0,
    depth: 6.8,
    labels: [['6A', '6B', '6C', '6D', '6E'], ['7A', '7B', '7C', '7D', '7E']],
  });
  mainWing.position.set(-1.0, 0, -31);
  root.add(mainWing);

  // Cánh phụ chữ L bên phải
  const rightWing = classBlock({
    rooms: 2,
    roomW: 5.8,
    depth: 6.0,
    labels: [['HĐ1', 'HĐ2'], ['LAB1', 'LAB2']],
  });
  rightWing.rotation.y = -Math.PI / 2;
  rightWing.position.set(18.0, 0, -22.0);
  root.add(rightWing);

  // ── Tường bao sân trường & Cổng sắt ──
  const wallH = 2.1;
  // Tường bao phía bên trái sân trường
  const courtWallL = box(0.24, wallH, 16.5, PAL.wallYellow);
  courtWallL.position.set(-16.5, wallH / 2, -22.5);
  root.add(courtWallL);
  const wallCapL = box(0.38, 0.12, 16.7, PAL.trim);
  wallCapL.position.set(-16.5, wallH + 0.06, -22.5);
  root.add(wallCapL);
  for (let z = -30; z <= -14; z += 4) {
    const pil = box(0.48, wallH + 0.22, 0.48, PAL.wallPillar, 0.03);
    pil.position.set(-16.5, (wallH + 0.22) / 2, z);
    root.add(pil);
  }

  // Tường bao mặt trước (z = -14)
  const leftFrontLen = 12.7;
  const courtWallFL = box(leftFrontLen, wallH, 0.24, PAL.wallYellow);
  courtWallFL.position.set(-16.5 + leftFrontLen / 2, wallH / 2, -14);
  root.add(courtWallFL);
  const capFL = box(leftFrontLen, 0.12, 0.38, PAL.trim);
  capFL.position.set(-16.5 + leftFrontLen / 2, wallH + 0.06, -14);
  root.add(capFL);

  const rightFrontLen = 13.7;
  const courtWallFR = box(rightFrontLen, wallH, 0.24, PAL.wallYellow);
  courtWallFR.position.set(3.8 + rightFrontLen / 2, wallH / 2, -14);
  root.add(courtWallFR);
  const capFR = box(rightFrontLen, 0.12, 0.38, PAL.trim);
  capFR.position.set(3.8 + rightFrontLen / 2, wallH + 0.06, -14);
  root.add(capFR);

  // Trụ cổng trường uy nghi
  const gatePilL = box(0.85, 3.2, 0.85, PAL.wallYellow, 0.04);
  gatePilL.position.set(-3.8, 1.6, -14);
  root.add(gatePilL);
  const gateCapL = box(1.05, 0.2, 1.05, PAL.trim, 0.02);
  gateCapL.position.set(-3.8, 3.3, -14);
  root.add(gateCapL);

  const gatePilR = box(0.85, 3.2, 0.85, PAL.wallYellow, 0.04);
  gatePilR.position.set(3.8, 1.6, -14);
  root.add(gatePilR);
  const gateCapR = box(1.05, 0.2, 1.05, PAL.trim, 0.02);
  gateCapR.position.set(3.8, 3.3, -14);
  root.add(gateCapR);

  // Cổng sắt 2 cánh màu xanh lá
  const schoolMainGate = ironGate(7.2, 2.3, PAL.gateGreen);
  schoolMainGate.position.set(0, 0, -14);
  root.add(schoolMainGate);

  // ── Bên trong sân trường: Cột cờ + 2 cây bàng/phượng đa giác + ghế đá ──
  const flag = flagpole();
  flag.position.set(2.5, 0, -23);
  root.add(flag);

  const courtTreeL = facetedTree({ radius: 2.2, height: 3.8, color: PAL.leaf, planter: true });
  courtTreeL.position.set(-6.5, 0, -22.5);
  root.add(courtTreeL);

  const courtTreeR = facetedTree({ radius: 2.0, height: 3.6, color: PAL.leaf2, planter: true });
  courtTreeR.position.set(10.0, 0, -22.5);
  root.add(courtTreeR);

  const b1 = bench(); b1.position.set(-9.5, 0, -20.5); b1.rotation.y = 0.5; root.add(b1);
  const b2 = bench(); b2.position.set(-3.0, 0, -26.0); b2.rotation.y = 0.1; root.add(b2);
  const b3 = bench(); b3.position.set(13.0, 0, -20.5); b3.rotation.y = -0.4; root.add(b3);
  const bin = trashBin(PAL.gateGreen); bin.position.set(0.5, 0, -25.5); root.add(bin);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. HỆ THỐNG ĐƯỜNG & VỈA HÈ (Trục đường chữ T + vỉa hè)
  // ══════════════════════════════════════════════════════════════════════════
  const roadW = 9.5;
  // Đường chính chạy thẳng từ cổng trường đến ngã ba (z: -14 đến +13)
  const roadMain = new THREE.Mesh(
    new THREE.PlaneGeometry(roadW, 27),
    toon(PAL.road, { outline: false })
  );
  roadMain.rotation.x = -Math.PI / 2;
  roadMain.position.set(0, 0.02, -0.5);
  roadMain.receiveShadow = true;
  root.add(roadMain);

  // Đường ngang (ngã ba) chạy suốt từ trái sang phải (z: 13 đến 21)
  const crossW = 8.0;
  const crossroad = new THREE.Mesh(
    new THREE.PlaneGeometry(64, crossW),
    toon(PAL.road, { outline: false })
  );
  crossroad.rotation.x = -Math.PI / 2;
  crossroad.position.set(0, 0.02, 17);
  crossroad.receiveShadow = true;
  root.add(crossroad);

  // ── Vỉa hè hai bên đường chính ──
  const swW = 2.4;
  const swMainL = new THREE.Mesh(new THREE.PlaneGeometry(swW, 27), toon(PAL.sidewalk, { outline: false }));
  swMainL.rotation.x = -Math.PI / 2; swMainL.position.set(-roadW / 2 - swW / 2, 0.03, -0.5); swMainL.receiveShadow = true; root.add(swMainL);
  const kerbML = box(0.14, 0.08, 27, PAL.kerb); kerbML.position.set(-roadW / 2 + 0.07, 0.04, -0.5); root.add(kerbML);

  const swMainR = new THREE.Mesh(new THREE.PlaneGeometry(swW, 27), toon(PAL.sidewalk, { outline: false }));
  swMainR.rotation.x = -Math.PI / 2; swMainR.position.set(roadW / 2 + swW / 2, 0.03, -0.5); swMainR.receiveShadow = true; root.add(swMainR);
  const kerbMR = box(0.14, 0.08, 27, PAL.kerb); kerbMR.position.set(roadW / 2 - 0.07, 0.04, -0.5); root.add(kerbMR);

  // Vỉa hè phía trước hai tiệm Tạp Hóa & Quán Net (nối liền sang đường ngang)
  const swStoreL = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.6), toon(PAL.sidewalk, { outline: false }));
  swStoreL.rotation.x = -Math.PI / 2; swStoreL.position.set(-11.0, 0.03, 11.5); swStoreL.receiveShadow = true; root.add(swStoreL);

  const swStoreR = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.6), toon(PAL.sidewalk, { outline: false }));
  swStoreR.rotation.x = -Math.PI / 2; swStoreR.position.set(11.0, 0.03, 11.5); swStoreR.receiveShadow = true; root.add(swStoreR);

  // Vỉa hè phía trước 4 căn nhà dân dưới (dọc z: 21 đến 23.5)
  const swBottom = new THREE.Mesh(new THREE.PlaneGeometry(64, 2.5), toon(PAL.sidewalk, { outline: false }));
  swBottom.rotation.x = -Math.PI / 2; swBottom.position.set(0, 0.03, 22.25); swBottom.receiveShadow = true; root.add(swBottom);
  const kerbBottom = box(64, 0.08, 0.14, PAL.kerb); kerbBottom.position.set(0, 0.04, 21.07); root.add(kerbBottom);

  // Lối đi bộ nhỏ (Alley) bên trái dẫn lên chòi nghỉ
  const alleyWalk = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 42), toon(PAL.sidewalk, { outline: false }));
  alleyWalk.rotation.x = -Math.PI / 2; alleyWalk.position.set(-27.8, 0.025, -6); alleyWalk.receiveShadow = true; root.add(alleyWalk);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. HAI TIỆM ĐẶC TRƯNG MẶT TIỀN (Tạp Hóa & Quán Net) - MẶT TIỀN HƯỚNG NAM
  // ══════════════════════════════════════════════════════════════════════════
  // Tiệm TẠP HÓA: bên trái đường chính, mặt tiền (biển hiệu, mái hiên, TV, ghế đỏ) hướng thẳng Nam ra đường
  const tapHoa = tapHoaStore();
  tapHoa.position.set(-11.0, 0, 3.5);
  root.add(tapHoa);

  // Cây bóng mát có bồn trước tiệm Tạp Hóa
  const treeTapHoa = facetedTree({ radius: 1.6, height: 3.2, color: PAL.leaf2, planter: true });
  treeTapHoa.position.set(-6.2, 0, 8.5);
  root.add(treeTapHoa);

  // Tiệm INTERNET (Quán Net): bên phải đường chính, mặt tiền (biển hiệu, dàn PC) hướng thẳng Nam ra đường
  const net = netCafe();
  net.position.set(11.0, 0, 3.5);
  root.add(net);

  // Cây bóng mát có bồn trước quán Net
  const treeNet = facetedTree({ radius: 1.6, height: 3.2, color: PAL.leaf, planter: true });
  treeNet.position.set(6.2, 0, 8.5);
  root.add(treeNet);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. MƯỜI CĂN NHÀ DÂN CÓ SÂN KHÉP KÍN & CỔNG SẮT RIÊNG (Modular Walled Houses)
  // ══════════════════════════════════════════════════════════════════════════
  // ── Dãy trái (3 căn xếp dọc, mặt tiền & cổng sắt hướng Nam) ──
  const leftX = -21.5;
  const lH1 = walledHouse({ wallColor: PAL.houseYellow, roofColor: PAL.roof });
  lH1.position.set(leftX, 0, -8.0); root.add(lH1);

  const lH2 = walledHouse({ wallColor: PAL.houseBlue, roofColor: PAL.roofGrey });
  lH2.position.set(leftX, 0, 1.5); root.add(lH2);

  const lH3 = walledHouse({ wallColor: PAL.houseGreen, roofColor: PAL.roof });
  lH3.position.set(leftX, 0, 11.0); root.add(lH3);

  // ── Dãy phải (3 căn xếp dọc, mặt tiền & cổng sắt hướng Nam) ──
  const rightX = 21.5;
  const rH1 = walledHouse({ wallColor: PAL.houseBlue, roofColor: PAL.roofGrey });
  rH1.position.set(rightX, 0, -8.0); root.add(rH1);

  const rH2 = walledHouse({ wallColor: PAL.houseYellow, roofColor: PAL.roof });
  rH2.position.set(rightX, 0, 1.5); root.add(rH2);

  const rH3 = walledHouse({ wallColor: PAL.houseGreen, roofColor: PAL.roofGrey });
  rH3.position.set(rightX, 0, 11.0); root.add(rH3);

  // ── Dãy dưới mặt tiền (4 căn xếp ngang dọc đường ngang, mặt tiền & cổng sắt hướng Nam) ──
  const botZ = 24.5;
  const bH1 = walledHouse({ wallColor: PAL.houseYellow, roofColor: PAL.roof });
  bH1.position.set(-23.5, 0, botZ); root.add(bH1);

  const bH2 = walledHouse({ wallColor: PAL.houseBlue, roofColor: PAL.roofGrey });
  bH2.position.set(-7.8, 0, botZ); root.add(bH2);

  const bH3 = walledHouse({ wallColor: PAL.houseYellow, roofColor: PAL.roof });
  bH3.position.set(7.8, 0, botZ); root.add(bH3);

  const bH4 = walledHouse({ wallColor: PAL.houseGreen, roofColor: PAL.roofGrey });
  bH4.position.set(23.5, 0, botZ); root.add(bH4);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CHÒI GỖ GÓC SÂN TRÊN TRÁI & TIỂU CẢNH CÂY XANH
  // ══════════════════════════════════════════════════════════════════════════
  const gazebo = woodenGazebo();
  gazebo.position.set(-24.5, 0, -25.5);
  root.add(gazebo);

  const gazTree1 = facetedTree({ radius: 2.3, height: 4.2, color: PAL.leafDark });
  gazTree1.position.set(-22.0, 0, -29.0);
  root.add(gazTree1);

  const gazTree2 = facetedTree({ radius: 2.1, height: 3.8, color: PAL.leaf });
  gazTree2.position.set(-28.0, 0, -22.0);
  root.add(gazTree2);

  // Các cây trang trí rải rác tạo điểm nhấn thiên nhiên chuẩn ảnh ref
  const trees: [number, number, number, string][] = [
    [-19.0, -18.0, 1.4, PAL.leaf2],
    [-30.0, -14.0, 1.3, PAL.leaf],
    [-30.5, 3.0, 1.3, PAL.leaf3],
    [-30.5, 18.0, 1.4, PAL.leaf2],
    [28.0, -18.0, 1.5, PAL.leaf2],
    [30.0, 0.0, 1.4, PAL.leaf],
    [30.0, 18.0, 1.4, PAL.leaf3],
    [-13.0, -32.5, 1.6, PAL.leaf],
    [27.0, -28.0, 1.7, PAL.leafDark],
  ];
  for (const [tx, tz, tr, tc] of trees) {
    const tMesh = facetedTree({ radius: tr, height: tr * 2.1, color: tc });
    tMesh.position.set(tx, 0, tz);
    root.add(tMesh);
  }

  return {
    root,
    anchors: {
      phuong: new THREE.Vector3(-6.5, 0, -22.5),
      bang: new THREE.Vector3(10.0, 0, -22.5),
      flag: new THREE.Vector3(2.5, 0, -23.0),
      gate: new THREE.Vector3(0, 0, -14.0),
    },
    update(t) {
      flag.wave(t);
    },
  };
}
