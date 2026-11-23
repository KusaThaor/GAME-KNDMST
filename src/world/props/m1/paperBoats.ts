import * as THREE from 'three';
import { toon } from '../../../render/materials';
import { safeCanvasTexture } from './texHelper';

/**
 * Tạo BufferGeometry hình chiếc thuyền giấy gấp học sinh.
 * Chiều dài 0.18m, rộng 0.08m, cao 0.075m.
 * Đáy thuyền chạm y = 0.
 */
export function createPaperBoatGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();

  // Đỉnh tọa độ (x, y, z):
  // 0: đáy trước (0, 0, 0.05)
  // 1: đáy sau (0, 0, -0.05)
  // 2: mạn trái (0.04, 0.035, 0)
  // 3: mạn phải (-0.04, 0.035, 0)
  // 4: mũi trước (0, 0.05, 0.09)
  // 5: đuôi sau (0, 0.05, -0.09)
  // 6: đỉnh buồm giữa (0, 0.075, 0)
  const vertices = new Float32Array([
    // Đáy thuyền (2 tam giác)
    0, 0, 0.05,   -0.04, 0.035, 0,  0.04, 0.035, 0,
    0, 0, -0.05,  0.04, 0.035, 0,   -0.04, 0.035, 0,

    // Mũi trước (2 tam giác)
    0, 0, 0.05,   0.04, 0.035, 0,   0, 0.05, 0.09,
    0, 0, 0.05,   0, 0.05, 0.09,    -0.04, 0.035, 0,

    // Đuôi sau (2 tam giác)
    0, 0, -0.05,  0, 0.05, -0.09,   0.04, 0.035, 0,
    0, 0, -0.05,  -0.04, 0.035, 0,  0, 0.05, -0.09,

    // Cánh buồm giữa trái & phải (4 tam giác)
    0, 0, 0.05,   0.04, 0.035, 0,   0, 0.075, 0,
    0, 0, -0.05,  0, 0.075, 0,      0.04, 0.035, 0,
    0, 0, 0.05,   0, 0.075, 0,      -0.04, 0.035, 0,
    0, 0, -0.05,  -0.04, 0.035, 0,  0, 0.075, 0,
  ]);

  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * PX-20 · 5 chiếc thuyền giấy (InstancedMesh) + tờ giấy báo cũ.
 * Gốc min.y = 0, ngân sách ≤ 400 tam giác.
 */
export function makePaperBoats(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'paperBoats';

  const boatGeo = createPaperBoatGeometry();
  const boatMat = toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide });

  // 5 chiếc thuyền dùng InstancedMesh
  const boatMesh = new THREE.InstancedMesh(boatGeo, boatMat, 5);
  boatMesh.name = 'paperBoats:instances';
  boatMesh.castShadow = false; // vật nhỏ < 0.3m
  boatMesh.receiveShadow = true;

  // 5 màu tượng trưng cho 5 bạn
  const colors = [
    '#f4a261', // Đức: cam vàng
    '#52b788', // Châu: xanh lá
    '#f28482', // Hạ: hồng phấn
    '#ffffff', // Quân: trắng báo
    '#48cae4', // Player: xanh dương nhạt
  ];

  // Vị trí và góc xoay 5 chiếc thuyền dọc rãnh nước
  const transforms: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [-0.45, 0.035, 0.05], rot: [0.1, 0.4, 0.65] },    // Thuyền Đức: bị lật nghiêng
    { pos: [-0.22, 0.003, -0.04], rot: [0, -0.15, 0.05] },   // Thuyền Châu
    { pos: [0.02, 0.004, 0.03], rot: [0, 0.25, -0.08] },     // Thuyền Hạ
    { pos: [0.46, 0.003, -0.03], rot: [0, -0.35, 0.02] },    // Thuyền Quân: xa nhất
    { pos: [0.24, 0.004, 0.04], rot: [0, 0.1, 0.04] },       // Thuyền Player
  ];

  const dummy = new THREE.Object3D();
  for (let i = 0; i < 5; i++) {
    const t = transforms[i];
    dummy.position.set(...t.pos);
    dummy.rotation.set(...t.rot);
    dummy.updateMatrix();
    boatMesh.setMatrixAt(i, dummy.matrix);
    boatMesh.setColorAt(i, new THREE.Color(colors[i]));
  }
  if (boatMesh.instanceColor) boatMesh.instanceColor.needsUpdate = true;
  root.add(boatMesh);

  // Tờ giấy báo gấp thuyền còn thừa bên bờ hiên
  const newsTex = safeCanvasTexture(256, 256, (g) => {
    g.fillStyle = '#e5dfd3';
    g.fillRect(0, 0, 256, 256);

    g.fillStyle = '#222222';
    g.font = 'bold 20px "Times New Roman", serif';
    g.fillText('BÁO TUỔI TRẺ', 15, 28);

    g.strokeStyle = '#555555';
    g.lineWidth = 1;
    for (let y = 45; y < 240; y += 12) {
      g.beginPath();
      g.moveTo(15, y);
      g.lineTo(120, y);
      g.stroke();

      g.beginPath();
      g.moveTo(135, y);
      g.lineTo(240, y);
      g.stroke();
    }
  });

  const newsMat = new THREE.MeshToonMaterial({ map: newsTex, side: THREE.DoubleSide });
  newsMat.userData.outlineParameters = { visible: false };

  const newsGeo = new THREE.PlaneGeometry(0.24, 0.18);
  const news = new THREE.Mesh(newsGeo, newsMat);
  news.rotation.x = -Math.PI / 2;
  news.position.set(-0.65, 0.001, 0.12);
  news.rotation.z = 0.35;
  news.receiveShadow = true;
  root.add(news);

  return root;
}
