import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { parseGlb } from '../../src/render/assets';

/** Kiểm tra đường đi Blender → GLB → Three.js với asset mẫu bàn học (tools/blender/props/desk_2seat.py). */
describe('asset GLB từ Blender', () => {
  it('bàn học 2 chỗ: đúng tên, kích thước mét, trục Y hướng lên, vật liệu toon', async () => {
    const buf = readFileSync('public/assets/props/prp_desk_2seat.glb');
    const root = await parseGlb(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const asset = root.getObjectByName('PRP_DESK_2SEAT')!;
    expect(asset).toBeTruthy();
    expect(asset.userData.asset_id).toBe('PRP_DESK_2SEAT');

    const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(1.2, 1);          // dài bàn
    expect(size.y).toBeCloseTo(0.68, 1);         // cao bàn → trục Y là chiều cao
    expect(size.z).toBeGreaterThan(0.9);         // bàn + khoảng hở + ghế

    let meshes = 0, tris = 0;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      meshes++;
      tris += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
      expect((m.material as THREE.Material).type).toBe('MeshToonMaterial');
    });
    expect(meshes).toBeGreaterThan(0);
    expect(tris).toBeLessThan(1000);             // vật nhỏ: giữ rất nhẹ
  });
});
