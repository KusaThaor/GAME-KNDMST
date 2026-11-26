import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { loadProp, parseGlb } from '../../src/render/assets';
import { World } from '../../src/world/world';
import type { WorldManifest } from '../../src/world/types';

/** Dựng một GLB nhị phân tối giản chứa 1 tam giác có y nằm tại `yOffset` để kiểm tra chuẩn hóa `min.y = 0`. */
function makeShiftedGlb(yOffset: number): ArrayBuffer {
  const positions = new Float32Array([
    0, yOffset, 0,
    1, yOffset, 0,
    0, yOffset + 1, 0,
  ]);
  const binLen = positions.byteLength;
  const json = JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.8, 0.6, 0.4, 1] } }],
    buffers: [{ byteLength: binLen }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: binLen, target: 34962 }],
    accessors: [{
      bufferView: 0,
      componentType: 5126,
      count: 3,
      type: 'VEC3',
      min: [0, yOffset, 0],
      max: [1, yOffset + 1, 0],
    }],
  });
  const enc = new TextEncoder();
  const jsonRaw = enc.encode(json);
  const jsonPad = (4 - (jsonRaw.length % 4)) % 4;
  const jsonLen = jsonRaw.length + jsonPad;
  const total = 12 + 8 + jsonLen + 8 + binLen;
  const out = new ArrayBuffer(total);
  const dv = new DataView(out);
  const u8 = new Uint8Array(out);
  dv.setUint32(0, 0x46546c67, true); // 'glTF'
  dv.setUint32(4, 2, true);
  dv.setUint32(8, total, true);
  dv.setUint32(12, jsonLen, true);
  dv.setUint32(16, 0x4e4f534a, true); // 'JSON'
  u8.set(jsonRaw, 20);
  for (let i = 0; i < jsonPad; i++) u8[20 + jsonRaw.length + i] = 0x20;
  const binOff = 20 + jsonLen;
  dv.setUint32(binOff, binLen, true);
  dv.setUint32(binOff + 4, 0x004e4942, true); // 'BIN\0'
  u8.set(new Uint8Array(positions.buffer), binOff + 8);
  return out;
}

const dummyManifest: WorldManifest = {
  schema: 1,
  map_id: 'test_prop_dispose',
  title: 'Test',
  asset_root: '/',
  default_spawn: 'spawn.test',
  camera_preset: 'follow_yard',
  zones: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

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

describe('loadProp & World.dispose (N-23)', () => {
  it('loadProp chuẩn hóa min.y = 0 cho prop lệch gốc', async () => {
    const glb = makeShiftedGlb(-0.663);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(glb, { status: 200 }));

    const prop = await loadProp('https://example.test/shifted-prop.glb');
    prop.position.set(3, 0, -2); // mô phỏng đặt prop lên mặt đất y = 0
    prop.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(prop);
    expect(box.min.y).toBeCloseTo(0, 5);
  });

  it('vào Ngày lần thứ 2 sau World.dispose() không bị mất mesh do giải phóng geometry cache', async () => {
    const buf = readFileSync('public/assets/props/prp_desk_2seat.glb');
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(ab, { status: 200 }));

    const geosOf = (root: THREE.Object3D) => {
      const out: THREE.BufferGeometry[] = [];
      root.traverse((o) => { if ((o as THREE.Mesh).isMesh) out.push((o as THREE.Mesh).geometry); });
      return out;
    };

    // Ngày 1: nạp prop, gắn vào World rồi dispose()
    const day1Prop = await loadProp('https://example.test/desk-cache.glb');
    const day1Geos = geosOf(day1Prop);
    expect(day1Geos.length).toBeGreaterThan(0);
    let day1Disposed = 0;
    for (const g of day1Geos) g.addEventListener('dispose', () => { day1Disposed++; });

    const w1 = World.placeholder(dummyManifest);
    w1.root.add(day1Prop);
    w1.dispose();
    expect(day1Disposed).toBe(day1Geos.length);

    // Ngày 2: nạp lại cùng URL → dùng cache, geometry tách biệt và chưa bị dispose
    const day2Prop = await loadProp('https://example.test/desk-cache.glb');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const day2Geos = geosOf(day2Prop);
    expect(day2Geos.length).toBe(day1Geos.length);
    for (let i = 0; i < day2Geos.length; i++) {
      expect(day2Geos[i]).not.toBe(day1Geos[i]);
      expect(day2Geos[i].getAttribute('position').count).toBeGreaterThan(0);
    }
    expect(new THREE.Box3().setFromObject(day2Prop).min.y).toBeCloseTo(0, 4);
  });

  it('World.dispose() không giải phóng geometry được đánh dấu shared', () => {
    const sharedGeo = new THREE.BoxGeometry(1, 1, 1);
    sharedGeo.userData.shared = true;
    let disposed = false;
    sharedGeo.addEventListener('dispose', () => { disposed = true; });

    const w = World.placeholder(dummyManifest);
    w.root.add(new THREE.Mesh(sharedGeo, new THREE.MeshBasicMaterial()));
    w.dispose();
    expect(disposed).toBe(false);
  });
});
