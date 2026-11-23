/**
 * K2 — đồ trang trí phòng 2026 (src/world/props/hub): quy chuẩn mục 2.0 + ngân sách + va chạm.
 */
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { HUB_ROOM } from '../../src/config/hubRoom';
import { HUB_CONFIG } from '../../src/config/hub';
import { HUB } from '../../src/content/hub';
import { buildHubScene } from '../../src/game/scenes/hubScene';
import { mergeStatic } from '../../src/render/merge';
import { HUB_DECOR_BUILDERS, HUB_PROP_COLORS, buildHubDecor, type HubDecorKey } from '../../src/world/props/hub';
import { makeCurtain, makeDeskLamp, makeGlassFrame, makeNightWindow, makeRug, makeRulebook, makeWallFrame } from '../../src/world/props/hub/room';

const BUDGET_TRIS = 15_000;
const BUDGET_DRAWS = 15;

function triangles(root: THREE.Object3D): number {
  let n = 0;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const g = m.geometry;
    const per = (g.index ? g.index.count : g.getAttribute('position').count) / 3;
    n += per * ((m as THREE.InstancedMesh).isInstancedMesh ? (m as THREE.InstancedMesh).count : 1);
  });
  return n;
}
const meshes = (root: THREE.Object3D) => { const out: THREE.Mesh[] = []; root.traverse((o) => { if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh); }); return out; };
const materialsOf = (root: THREE.Object3D) => meshes(root).flatMap((m) => (Array.isArray(m.material) ? m.material : [m.material]));

describe('K2 đồ trang trí phòng 2026 — quy chuẩn 2.0', () => {
  const keys = Object.keys(HUB_DECOR_BUILDERS) as HubDecorKey[];
  it.each(keys)('%s: đáy min.y ≈ 0, kích thước theo mét (0,03–2,2 m)', (key) => {
    const o = HUB_DECOR_BUILDERS[key]();
    o.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(o);
    expect(b.min.y).toBeCloseTo(0, 3);
    const size = b.getSize(new THREE.Vector3());
    expect(Math.max(size.x, size.y, size.z)).toBeLessThan(2.2);
    expect(size.y).toBeGreaterThan(0.03);
  });
  it('đồ N-08 dời sang props/hub/room.ts vẫn đáy y = 0', () => {
    const win = makeNightWindow(); const all = new THREE.Group(); all.add(win.frame, win.pane, win.sky);
    for (const o of [makeDeskLamp(), makeWallFrame(0.4, 0.3, '#ffffff'), makeGlassFrame(), makeRug(), makeCurtain(0.4, 1.4), makeRulebook(), all]) {
      expect(new THREE.Box3().setFromObject(o).min.y).toBeCloseTo(0, 6);
    }
  });
  it('vật liệu toon (hoặc phẳng không viền); vật lặp ≥ 5 là InstancedMesh (sách, lá, giấy note, đinh ghim)', () => {
    const g = buildHubDecor(HUB_ROOM.decor);
    for (const m of materialsOf(g)) expect(['MeshToonMaterial', 'MeshBasicMaterial']).toContain(m.type);
    const inst = meshes(g).filter((m) => (m as THREE.InstancedMesh).isInstancedMesh) as THREE.InstancedMesh[];
    const byName = Object.fromEntries(inst.map((m) => [m.name, m.count]));
    expect(byName['bookshelf:books']).toBeGreaterThanOrEqual(30);
    expect(byName['plant:leaves']).toBe(9);
    expect(byName['pinboard:notes']).toBe(7);
    expect(byName['pinboard:pins']).toBe(7);
    for (const m of inst) expect(m.count, m.name).toBeGreaterThanOrEqual(5);
  });
  it('không chữ: không texture nào (nên không thể có chữ "{…}" vẽ lên texture); tên/ghi chú cũng không chứa "{"', () => {
    const g = buildHubDecor(HUB_ROOM.decor);
    for (const m of materialsOf(g)) {
      const tex = Object.values(m).filter((v) => (v as THREE.Texture)?.isTexture && v !== (m as THREE.MeshToonMaterial).gradientMap) as THREE.Texture[];
      expect(tex, `${m.type} không có map`).toEqual([]);
    }
    g.traverse((o) => { expect(o.name.includes('{')).toBe(false); expect(JSON.stringify(o.userData).includes('{"')).toBe(false); });
  });
  it(`ngân sách đồ mới: ≤ ${BUDGET_TRIS} tam giác, ≤ ${BUDGET_DRAWS} lượt vẽ sau mergeStatic`, () => {
    const g = buildHubDecor(HUB_ROOM.decor);
    const tris = triangles(g);
    const merged = mergeStatic(g);
    const draws = meshes(merged).length;                       // mỗi mesh sau gộp = một lượt vẽ ở lượt chính (chưa tính bóng/viền)
    expect(tris).toBeLessThanOrEqual(BUDGET_TRIS);
    expect(draws).toBeLessThanOrEqual(BUDGET_DRAWS);
    // ghi số thật ra log để dán vào PR
    console.log(`[props_hub] tam giác ${Math.round(tris)} / ${BUDGET_TRIS}, lượt vẽ ${draws} / ${BUDGET_DRAWS}`);
  });
  it('đồ lớn đổ bóng và nhận bóng; đồ treo (cửa, đèn trần, bảng ghim) chỉ nhận bóng', () => {
    const g = buildHubDecor(HUB_ROOM.decor);
    const of = (k: HubDecorKey) => meshes(g.getObjectByName(`decor:${k}`)!);
    for (const k of ['bookshelf', 'wardrobe', 'chair', 'plant'] as const) for (const m of of(k)) { expect(m.castShadow).toBe(true); expect(m.receiveShadow).toBe(true); }
    for (const k of ['door', 'ceiling_lamp', 'pinboard'] as const) for (const m of of(k)) expect(m.castShadow).toBe(false);
  });
});

describe('K2 phòng 2026 — đặt đồ và va chạm', () => {
  const scene = () => { const s = buildHubScene(HUB, HUB_CONFIG); s.scene.updateMatrixWorld(true); return s; };
  it('mọi món nằm trong phòng (7 × 5 × 2,8 m)', () => {
    const g = buildHubDecor(HUB_ROOM.decor); g.updateMatrixWorld(true);
    const { w, d, h } = HUB_ROOM.size;
    for (const c of g.children) {
      const b = new THREE.Box3().setFromObject(c);
      expect(b.min.x, c.name).toBeGreaterThanOrEqual(-w / 2 - 1e-3); expect(b.max.x, c.name).toBeLessThanOrEqual(w / 2 + 1e-3);
      expect(b.min.z, c.name).toBeGreaterThanOrEqual(-d / 2 - 1e-3); expect(b.max.z, c.name).toBeLessThanOrEqual(d / 2 + 1e-3);
      expect(b.max.y, c.name).toBeLessThanOrEqual(h + 1e-3); expect(b.min.y, c.name).toBeGreaterThanOrEqual(-1e-3);
    }
  });
  it('khung va chạm phủ đúng phần đồ chạm sàn (nhìn từ trên xuống; lá cây trên cao được phép chìa ra)', () => {
    const g = buildHubDecor(HUB_ROOM.decor); g.updateMatrixWorld(true);
    for (const c of HUB_ROOM.colliders) {
      const b = new THREE.Box3();
      for (const m of meshes(g.getObjectByName(`decor:${c.id}`)!)) { const mb = new THREE.Box3().setFromObject(m); if (mb.min.y < 0.3) b.union(mb); }
      expect(c.x0, c.id).toBeLessThanOrEqual(b.min.x + 0.02); expect(c.x1, c.id).toBeGreaterThanOrEqual(b.max.x - 0.02);
      expect(c.z0, c.id).toBeLessThanOrEqual(b.min.z + 0.02); expect(c.z1, c.id).toBeGreaterThanOrEqual(b.max.z - 0.02);
    }
  });
  it('camera đi lại không xuyên đồ mới: đặt vào giữa hay đi thẳng vào đều bị đẩy ra ngoài', () => {
    const s = scene();
    const body = HUB_ROOM.move.body_radius;
    const outside = (c: { x0: number; x1: number; z0: number; z1: number }) => {
      const p = s.player;
      return p.x <= c.x0 - body + 1e-6 || p.x >= c.x1 + body - 1e-6 || p.z <= c.z0 - body + 1e-6 || p.z >= c.z1 + body - 1e-6;
    };
    for (const c of HUB_ROOM.colliders) {
      s.teleport((c.x0 + c.x1) / 2, (c.z0 + c.z1) / 2);
      expect(outside(c), `${c.id}: dịch chuyển vào giữa`).toBe(true);
    }
    // đi bộ thật: từ giữa phòng nhìn về phía ghế rồi bấm tiến 3 giây
    const chair = HUB_ROOM.colliders.find((c) => c.id === 'chair')!;
    s.teleport((chair.x0 + chair.x1) / 2, 0.2, 0);
    for (let i = 0; i < 180; i++) s.update(1 / 60, i / 60, { move: { forward: 1, strafe: 0, run: false }, cursor: null, drag: null });
    expect(s.player.z).toBeGreaterThanOrEqual(chair.z1 + body - 1e-6);
    s.dispose();
  });
  it('không có nguồn sáng nào ngoài bán cầu + một đèn hướng (đèn bàn, đèn trần là vật tự sáng)', () => {
    const s = scene();
    const lights: string[] = []; s.scene.traverse((o) => { if ((o as THREE.Light).isLight) lights.push(o.type); });
    expect(lights.sort()).toEqual(['DirectionalLight', 'HemisphereLight']);
    // chụp đèn trần đã bị gộp (mergeStatic) → tìm theo màu vật liệu
    const want = new THREE.Color(HUB_PROP_COLORS.lamp_diffuser).getHex();
    const diffuser = meshes(s.scene).find((m) => (m.material as THREE.MeshToonMaterial).color?.getHex() === want && (m.material as THREE.MeshToonMaterial).emissiveIntensity > 0);
    expect(diffuser, 'đèn trần tự sáng').toBeDefined();
    s.dispose();
  });
});
