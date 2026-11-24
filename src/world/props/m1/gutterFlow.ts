import * as THREE from 'three';
import { safeCanvasTexture } from './texHelper';

export interface GutterFlowOpts {
  length?: number;
  width?: number;
  speed?: number;
}

export interface GutterFlowControl {
  update: (dt: number) => void;
}

/**
 * PX-21 · Dòng nước chảy trong rãnh mái hiên (UV trôi) và các vũng nước mưa.
 * Gốc min.y = 0, ngân sách ≤ 200 tam giác.
 */
export function makeGutterFlow(opts: GutterFlowOpts = {}): THREE.Group & { flowControl?: GutterFlowControl } {
  const root = new THREE.Group() as THREE.Group & { flowControl?: GutterFlowControl };
  root.name = 'gutterFlow';

  const len = opts.length ?? 48;
  const w = opts.width ?? 0.32;
  const speed = opts.speed ?? 0.35;

  // Texture dòng nước gợn sóng lặp lại
  const waterTex = safeCanvasTexture(256, 64, (g) => {
    g.fillStyle = '#6ab8ee';
    g.fillRect(0, 0, 256, 64);

    g.strokeStyle = '#a4d8fa';
    g.lineWidth = 2.5;
    for (let i = 0; i < 18; i++) {
      const y = (i * 14) % 64;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(64, y + 8, 128, y - 8, 256, y + 4);
      g.stroke();
    }
  }, { repeat: [Math.round(len * 2), 1] });

  const waterMat = new THREE.MeshToonMaterial({
    map: waterTex,
    color: '#64b5f6',
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  waterMat.userData.outlineParameters = { visible: false };

  // Dải nước trong rãnh
  const waterGeo = new THREE.PlaneGeometry(len, w);
  const streamMesh = new THREE.Mesh(waterGeo, waterMat);
  streamMesh.rotation.x = -Math.PI / 2;
  streamMesh.position.set(0, 0.008, 0);
  streamMesh.receiveShadow = true;
  root.add(streamMesh);

  // Vài vũng nước mưa dẹp phản chiếu trước sân
  const puddleMat = new THREE.MeshToonMaterial({
    color: '#81c784',
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  puddleMat.userData.outlineParameters = { visible: false };

  const puddles: [number, number, number, number][] = [
    [-4, 0.6, 0.35, 0.22],
    [2, 0.8, 0.45, 0.28],
    [8, 0.5, 0.3, 0.18],
    [-10, 0.7, 0.4, 0.25],
  ];

  for (const [px, pz, rx, rz] of puddles) {
    const pGeo = new THREE.CircleGeometry(1, 12);
    const pMesh = new THREE.Mesh(pGeo, puddleMat);
    pMesh.rotation.x = -Math.PI / 2;
    pMesh.scale.set(rx, rz, 1);
    pMesh.position.set(px, 0.003, pz);
    pMesh.receiveShadow = true;
    root.add(pMesh);
  }

  const control: GutterFlowControl = {
    update: (dt: number) => {
      waterTex.offset.x += dt * speed;
    },
  };

  root.userData.flowControl = control;
  root.flowControl = control;

  return root;
}
