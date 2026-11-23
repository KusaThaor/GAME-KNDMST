import { describe, expect, it } from 'vitest';
import * as THREE from 'three';

// Mock document.createElement('canvas') trong môi trường Node.js (vitest)
if (typeof document === 'undefined') {
  function createMockCanvas(w = 256, h = 256) {
    const ctx = {
      canvas: null as unknown,
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      fillText: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      closePath: () => {},
    };
    const canvas = {
      width: w,
      height: h,
      getContext: () => ctx,
    };
    ctx.canvas = canvas;
    return canvas;
  }

  (globalThis as unknown as { document: unknown }).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') return createMockCanvas(1024, 512);
      return {};
    },
  };
}

import { makeGroundPlane } from '../../src/world/backdrop/groundPlane';
import { makeTownRing } from '../../src/world/backdrop/townRing';
import { TOWN_SIGNS, makeTownSignsMesh } from '../../src/world/backdrop/townSigns';
import backdropSet from '../../src/world/dressing/sets/backdrop';
import type { DressingCtx } from '../../src/world/dressing/index';

function countTriangles(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const geo = mesh.geometry;
      const inst = child as THREE.InstancedMesh;
      const numInstances = inst.isInstancedMesh ? inst.count : 1;
      const tris = geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
      count += Math.round(tris * numInstances);
    }
  });
  return count;
}

function countDrawCalls(obj: THREE.Object3D): number {
  let drawCalls = 0;
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      drawCalls++;
    }
  });
  return drawCalls;
}

describe('Vành nền 3D procedural (N-07)', () => {
  describe('PX-03 · Mặt đất mở rộng (makeGroundPlane)', () => {
    it('kích thước ≥ 200m, nằm ở y <= 0, nhận bóng nhưng tắt castShadow', () => {
      const ground = makeGroundPlane(220);
      expect(ground).toBeInstanceOf(THREE.Mesh);

      // Kích thước geometry
      ground.geometry.computeBoundingBox();
      const box = ground.geometry.boundingBox!;
      const sizeX = box.max.x - box.min.x;
      const sizeZ = box.max.z - box.min.z;
      expect(sizeX).toBeGreaterThanOrEqual(200);
      expect(sizeZ).toBeGreaterThanOrEqual(200);

      // Vị trí y
      expect(ground.position.y).toBeLessThanOrEqual(0);
      expect(ground.position.y).toBeCloseTo(-0.02, 0.005);

      // Thuộc tính bóng đổ & outline
      expect(ground.receiveShadow).toBe(true);
      expect(ground.castShadow).toBe(false);
      const mat = ground.material as THREE.Material;
      expect(mat.userData.outlineParameters?.visible).toBe(false);
    });
  });

  describe('PX-02 · Vành nền phố thị trấn (makeTownRing)', () => {
    it('đáp ứng ngân sách ≤ 25.000 tam giác và ≤ 12 lượt vẽ (draw calls)', () => {
      const ring = makeTownRing();

      const totalTriangles = countTriangles(ring);
      const totalDrawCalls = countDrawCalls(ring);

      console.log(`[Backdrop Stats] Total Triangles = ${totalTriangles}, Draw Calls (meshes) = ${totalDrawCalls}`);
      ring.children.forEach((c) => {
        console.log(`  - ${c.name || 'unnamed'}: tris=${countTriangles(c)}, instances=${(c as THREE.InstancedMesh).count ?? 1}`);
      });

      expect(totalTriangles).toBeLessThanOrEqual(25000);
      expect(totalDrawCalls).toBeLessThanOrEqual(12);

      // Ghi log kiểm tra thực tế
      expect(totalTriangles).toBeGreaterThan(1000); // Đảm bảo có mô hình thực chất
      expect(totalDrawCalls).toBeGreaterThan(4);
    });

    it('không chứa bất kỳ collider nào và tắt bóng cho vật xa', () => {
      const ring = makeTownRing();

      ring.traverse((child) => {
        // Không chứa collider
        expect(child.name).not.toMatch(/col_|collider/i);
        expect(child.userData.collider).toBeUndefined();

        // Tắt bóng cho vật xa
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) {
          expect(mesh.castShadow).toBe(false);
        }
      });
    });

    it('bao quanh bản đồ trường và phủ kín cả 4 hướng ngoài mép [-34, -36, 52, 30]', () => {
      const ring = makeTownRing({ bounds: [-34, -36, 52, 30] });

      let hasWest = false;
      let hasNorth = false;
      let hasSouth = false;
      let hasEast = false;

      ring.traverse((child) => {
        const imesh = child as THREE.InstancedMesh;
        if (imesh.isInstancedMesh) {
          const matrix = new THREE.Matrix4();
          const pos = new THREE.Vector3();
          for (let i = 0; i < imesh.count; i++) {
            imesh.getMatrixAt(i, matrix);
            pos.setFromMatrixPosition(matrix);

            if (pos.x < -34) hasWest = true;
            if (pos.z < -36) hasNorth = true;
            if (pos.z > 30) hasSouth = true;
            if (pos.x > 52) hasEast = true;
          }
        }
      });

      expect(hasWest).toBe(true);
      expect(hasNorth).toBe(true);
      expect(hasSouth).toBe(true);
      expect(hasEast).toBe(true);
    });
  });

  describe('Bảng hiệu thị trấn (townSigns)', () => {
    it('danh sách 8 bảng hiệu tiếng Việt tự nghĩ mang tính hoài niệm', () => {
      expect(TOWN_SIGNS.length).toBe(8);
      for (const sign of TOWN_SIGNS) {
        expect(sign.title.length).toBeGreaterThan(3);
        expect(sign.subtitle.length).toBeGreaterThan(5);
        expect(sign.bg).toMatch(/^#/);
        expect(sign.fg).toMatch(/^#/);
      }
    });

    it('makeTownSignsMesh gộp toàn bộ các biển hiệu thành ĐÚNG 1 MESH', () => {
      const mesh = makeTownSignsMesh([
        { signIndex: 0, pos: [-40, 3, 0], rotY: Math.PI / 2 },
        { signIndex: 1, pos: [-40, 3, 10], rotY: Math.PI / 2 },
        { signIndex: 2, pos: [0, 3, 40], rotY: Math.PI },
        { signIndex: 3, pos: [10, 3, 40], rotY: Math.PI },
      ]);

      expect(mesh).not.toBeNull();
      expect(mesh).toBeInstanceOf(THREE.Mesh);
      expect(mesh?.name).toBe('backdrop_town_signs');
      expect(mesh?.castShadow).toBe(false);
      // Chỉ 1 draw call
      expect(countDrawCalls(mesh!)).toBe(1);
    });
  });

  describe('Bộ gắn đồ trang trí (backdropSet)', () => {
    it('gắn vào mọi Ngày ký ức (appliesTo luôn trả về true)', () => {
      const mockCtx = (dayId: string): DressingCtx => ({
        scene: new THREE.Scene(),
        world: {} as unknown as DressingCtx['world'],
        dayId,
        decor: { phuongBloom: 0, puddles: false, scarf: true },
        flag: () => undefined,
        addUpdate: () => {},
      });

      expect(backdropSet.id).toBe('backdrop');
      expect(backdropSet.appliesTo(mockCtx('d.g06.01'))).toBe(true);
      expect(backdropSet.appliesTo(mockCtx('d.g07.01'))).toBe(true);
      expect(backdropSet.appliesTo(mockCtx('d.g07.02'))).toBe(true);
      expect(backdropSet.appliesTo(mockCtx('d.g07.03'))).toBe(true);
      expect(backdropSet.appliesTo(mockCtx('d.g08.01'))).toBe(true);
      expect(backdropSet.appliesTo(mockCtx('d.g09.03'))).toBe(true);
    });

    it('build trả về Object3D hợp lệ chứa vành nền', async () => {
      const mockCtx: DressingCtx = {
        scene: new THREE.Scene(),
        world: {} as unknown as DressingCtx['world'],
        dayId: 'd.g07.01',
        decor: { phuongBloom: 0, puddles: true, scarf: true },
        flag: () => undefined,
        addUpdate: () => {},
      };

      const result = await backdropSet.build(mockCtx);
      expect(result).toBeInstanceOf(THREE.Object3D);
      expect(result.children.length).toBeGreaterThan(0);
      expect(countTriangles(result)).toBeLessThanOrEqual(25000);
      expect(countDrawCalls(result)).toBeLessThanOrEqual(12);
    });
  });
});
