import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { PAL } from '../../school/props';
import { mergeStatic } from '../../../render/merge';
import { groundAtZero } from '../common/helpers';

export type BaseDecorStyle = 'paper' | 'flowers' | 'photos';

/**
 * Tạo bộ trang trí bằng giấy màu: dây cờ tam giác, chuỗi hạc giấy thả buông, hộp giấy màu.
 */
function makePaperDecor(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'baseDecor:paper';

  const flagColors = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#264653', '#f28482', '#a8dadc', '#9b5de5'];

  // Dây treo ngang
  const span = 2.2;
  const ropeGeo = new THREE.CylinderGeometry(0.003, 0.003, span, 6);
  const rope = new THREE.Mesh(ropeGeo, toon('#8d99ae'));
  rope.rotation.z = Math.PI / 2;
  rope.position.set(0, 1.8, 0);
  root.add(rope);

  // 8 lá cờ tam giác đuôi nheo
  for (let i = 0; i < 8; i++) {
    const cx = -span * 0.42 + (i / 7) * span * 0.84;
    // Độ võng tự nhiên của dây
    const sag = Math.sin((i / 7) * Math.PI) * 0.12;
    const cy = 1.8 - sag;

    const flagGeo = new THREE.BufferGeometry();
    const hw = 0.07;
    const fh = 0.16;
    const vertices = new Float32Array([
      -hw, 0, 0,
      hw, 0, 0,
      0, -fh, 0,
    ]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    flagGeo.computeVertexNormals();

    const flagMesh = new THREE.Mesh(flagGeo, toon(flagColors[i % flagColors.length], { side: THREE.DoubleSide }));
    flagMesh.position.set(cx, cy, 0);
    flagMesh.rotation.x = 0.08 * ((i % 2) * 2 - 1);
    root.add(flagMesh);
  }

  // 2 chuỗi hạc giấy thả từ xà mái
  for (const sx of [-0.65, 0.65]) {
    for (let k = 0; k < 4; k++) {
      const hy = 1.6 - k * 0.22;
      const craneGeo = new THREE.ConeGeometry(0.035, 0.045, 4);
      const crane = new THREE.Mesh(craneGeo, toon(flagColors[(k * 2) % flagColors.length]));
      crane.position.set(sx, hy, 0.05);
      crane.rotation.y = (k * Math.PI) / 3;
      root.add(crane);
    }
  }

  // Hộp giấy xếp để bàn (y = 0 khi đứng riêng)
  const boxGeo = new THREE.BoxGeometry(0.18, 0.07, 0.14);
  const boxMesh = new THREE.Mesh(boxGeo, toon('#ffd166'));
  boxMesh.position.set(0.2, 0.035, 0.1);
  root.add(boxMesh);

  // Vài con hạc giấy nhỏ xếp trên bàn
  for (let j = 0; j < 3; j++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.035, 4), toon(flagColors[j % flagColors.length]));
    m.position.set(0.12 + j * 0.07, 0.0175, 0.25);
    m.rotation.y = j * 1.2;
    root.add(m);
  }

  return groundAtZero(root);
}

/**
 * Tạo bộ trang trí hoa dại mộc mạc: lọ hoa xuyến chi trên bàn, 2 lon cây nhỏ, cành leo.
 */
function makeFlowersDecor(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'baseDecor:flowers';

  // Lọ hoa thủy tinh cắm hoa dại để bàn (tâm x=0, y=0)
  const bottleH = 0.16;
  const bottleR = 0.038;
  const bottleGeo = new THREE.CylinderGeometry(bottleR * 0.65, bottleR, bottleH, 10);
  const bottle = new THREE.Mesh(bottleGeo, toon('#a8dadc', { transparent: true, opacity: 0.7 }));
  bottle.position.set(0, bottleH / 2, 0);
  root.add(bottle);

  // Nhánh hoa cúc dại vàng & xuyến chi trắng
  const stemMat = toon(PAL.leaf3);
  const flowerWhite = toon('#ffffff');
  const flowerYellow = toon('#ffd166');

  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const tilt = 0.25 + (i % 3) * 0.12;
    const len = 0.18 + (i % 4) * 0.04;

    const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, len, 5);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(Math.cos(angle) * 0.015, bottleH + (len * 0.5), Math.sin(angle) * 0.015);
    stem.rotation.set(Math.sin(angle) * tilt, 0, Math.cos(angle) * tilt);
    root.add(stem);

    // Bông hoa trên đỉnh cành
    const fR = 0.028;
    const blossom = new THREE.Mesh(new THREE.CircleGeometry(fR, 6), i % 2 === 0 ? flowerWhite : flowerYellow);
    blossom.position.set(
      Math.cos(angle) * 0.015 + Math.sin(angle) * tilt * len,
      bottleH + len,
      Math.sin(angle) * 0.015 + Math.cos(angle) * tilt * len
    );
    blossom.rotation.x = -Math.PI / 4;
    root.add(blossom);
  }

  // 2 lon sữa đặc trồng cây nhỏ
  for (const [cx, cz, color] of [[-0.45, 0.05, '#588157'], [0.45, -0.05, '#3a5a40']] as const) {
    const canGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.09, 10);
    const canMesh = new THREE.Mesh(canGeo, toon('#ced4da'));
    canMesh.position.set(cx, 0.045, cz);
    root.add(canMesh);

    // Bụi lá nhỏ trong lon
    const leafGeo = new THREE.IcosahedronGeometry(0.055, 1);
    const leafMesh = new THREE.Mesh(leafGeo, toon(color));
    leafMesh.scale.set(1.2, 0.7, 1.2);
    leafMesh.position.set(cx, 0.09 + 0.035, cz);
    root.add(leafMesh);
  }

  return groundAtZero(root);
}

/**
 * Tạo bộ trang trí ảnh kỷ niệm: dây treo kẹp ảnh, ảnh để bàn, ảnh dán góc.
 */
function makePhotosDecor(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'baseDecor:photos';

  // Dây thừng mảnh treo ảnh
  const ropeLen = 1.8;
  const ropeGeo = new THREE.CylinderGeometry(0.003, 0.003, ropeLen, 6);
  const rope = new THREE.Mesh(ropeGeo, toon('#8d99ae'));
  rope.rotation.z = Math.PI / 2;
  rope.position.set(0, 1.5, 0);
  root.add(rope);

  // 4 tấm ảnh kẹp trên dây
  const photoW = 0.14;
  const photoH = 0.11;
  const photoMat = toon(PAL.trim);
  const clipMat = toon('#b08968');

  for (let i = 0; i < 4; i++) {
    const px = -ropeLen * 0.36 + i * (ropeLen * 0.24);
    const py = 1.5 - 0.06;

    // Tấm ảnh giấy trắng kem
    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(photoW, photoH, 0.003), photoMat);
    pMesh.position.set(px, py, 0.01);
    pMesh.rotation.z = ((i % 2) * 2 - 1) * 0.06;
    root.add(pMesh);

    // Kẹp gỗ nhỏ góc trên
    const clipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.026, 0.008), clipMat);
    clipMesh.position.set(px, 1.5, 0.012);
    root.add(clipMesh);
  }

  // Khung ảnh gỗ để bàn mini
  const frameW = 0.16;
  const frameH = 0.13;
  const frameGeo = new THREE.BoxGeometry(frameW, frameH, 0.015);
  const frameMesh = new THREE.Mesh(frameGeo, toon(PAL.trunkDark));
  frameMesh.position.set(-0.25, frameH / 2, 0.15);
  frameMesh.rotation.x = -0.15;
  root.add(frameMesh);

  // 2 tấm ảnh dán mặt bàn bằng băng keo
  for (let k = 0; k < 2; k++) {
    const pFlat = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.09), photoMat);
    pFlat.rotation.x = -Math.PI / 2;
    pFlat.position.set(0.15 + k * 0.18, 0.002, 0.1);
    pFlat.rotation.z = k * 0.3 - 0.15;
    root.add(pFlat);
  }

  return groundAtZero(root);
}

/**
 * PX-32 · 3 bộ trang trí Căn cứ theo lựa chọn (m1.base_decor).
 * Gốc min.y = 0, ngân sách ≤ 1.500 tam giác mỗi bộ.
 */
export function makeBaseDecor(style: BaseDecorStyle = 'paper'): THREE.Group {
  let decorGroup: THREE.Group;
  switch (style) {
    case 'flowers':
      decorGroup = makeFlowersDecor();
      break;
    case 'photos':
      decorGroup = makePhotosDecor();
      break;
    case 'paper':
    default:
      decorGroup = makePaperDecor();
      break;
  }

  return mergeStatic(decorGroup);
}
