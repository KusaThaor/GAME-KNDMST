/**
 * Điểm gắn đồ trang trí dựng bằng code (Procedural Three.js, quyết định D3) vào cảnh một Ngày ký ức.
 *
 * Mỗi bộ đồ là MỘT file trong `./sets/` (vd. `m1_base.ts`, `backdrop.ts`), `export default` một `DressingSet`
 * (hoặc một mảng). File mới tự được nạp nhờ `import.meta.glob` — KHÔNG cần sửa `dayScene.ts` hay file này.
 *
 * Quy chuẩn cho mọi bộ (docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0): gốc vật `min.y = 0`, mét, mặt trước +z;
 * vật liệu `toon()` + màu `PAL`; texture canvas `colorSpace = SRGBColorSpace`; vật lặp ≥ 5 dùng `InstancedMesh`;
 * đồ tĩnh `mergeStatic()`. Va chạm KHÔNG khai ở đây mà ở `src/world/maps/<map>.extras.ts` (World Extras).
 */
import * as THREE from 'three';
import type { DecorSet } from '../variants';
import type { World } from '../world';

export interface DressingCtx {
  scene: THREE.Scene;
  world: World;
  /** ID Ngày ký ức đang dựng (vd. 'd.g07.02'). */
  dayId: string;
  decor: DecorSet;
  /** Đọc flag của bản lưu (vd. `ctx.flag('m1.base_decor')`). Không có → undefined. */
  flag(name: string): unknown;
  /** Đăng ký hàm chạy mỗi khung hình (nước chảy, cờ bay…). Tự gỡ khi rời Ngày. */
  addUpdate(fn: (dt: number, t: number) => void): void;
}

export interface DressingSet {
  /** ID duy nhất, trùng tên file là dễ tìm nhất (vd. 'm1_base'). */
  id: string;
  /** Bộ này có gắn vào Ngày/bản đồ đang dựng không. */
  appliesTo(ctx: DressingCtx): boolean;
  /** Dựng vật. Toạ độ thế giới (mét). Được phép trả Promise (nạp texture…). */
  build(ctx: DressingCtx): THREE.Object3D | Promise<THREE.Object3D>;
}

type SetModule = { default?: DressingSet | DressingSet[] };
const modules = import.meta.glob<SetModule>('./sets/*.ts', { eager: true });

/** Mọi bộ đồ trong `./sets/`, xếp theo ID (thứ tự dựng ổn định). */
export const DRESSING_SETS: readonly DressingSet[] = collectSets(modules);

export function collectSets(mods: Record<string, SetModule>): DressingSet[] {
  const out: DressingSet[] = [];
  for (const mod of Object.values(mods)) {
    const d = mod.default;
    if (!d) continue;
    out.push(...(Array.isArray(d) ? d : [d]));
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export interface MountedDressing {
  /** Nhóm chứa mọi bộ đã gắn (tên `dressing`). */
  root: THREE.Group;
  /** ID các bộ đã gắn thành công. */
  mounted: string[];
  /** Bộ bị lỗi khi dựng: không làm sập cảnh, chỉ ghi lại. */
  failed: { id: string; message: string }[];
  dispose(): void;
}

/**
 * Gắn mọi bộ hợp lệ vào `ctx.scene`. Một bộ lỗi (ném ngoại lệ) bị bỏ qua và ghi vào `failed`.
 * Trùng ID: chỉ bộ đầu tiên được gắn.
 */
export async function mountDressing(ctx: DressingCtx, sets: readonly DressingSet[] = DRESSING_SETS): Promise<MountedDressing> {
  const root = new THREE.Group();
  root.name = 'dressing';
  ctx.scene.add(root);
  let alive = true;
  const scoped: DressingCtx = {
    ...ctx,
    addUpdate: (fn) => ctx.addUpdate((dt, t) => { if (alive) fn(dt, t); }),
  };
  const mounted: string[] = [];
  const failed: MountedDressing['failed'] = [];
  const seen = new Set<string>();
  for (const set of sets) {
    if (seen.has(set.id)) { failed.push({ id: set.id, message: `ID bộ đồ "${set.id}" bị trùng — bỏ qua bản sau` }); continue; }
    seen.add(set.id);
    try {
      if (!set.appliesTo(scoped)) continue;
      const obj = await set.build(scoped);
      if (!alive) { disposeObject(obj); break; }
      obj.name ||= `dressing:${set.id}`;
      root.add(obj);
      mounted.push(set.id);
    } catch (e) {
      failed.push({ id: set.id, message: String((e as Error)?.message ?? e) });
    }
  }
  return {
    root, mounted, failed,
    dispose() {
      if (!alive) return;
      alive = false;
      root.removeFromParent();
      disposeObject(root);
    },
  };
}

/** Giải phóng hình + texture. Vật liệu `toon()`/`flat()` dùng chung (cache) nên chỉ giải phóng vật liệu có texture riêng. */
export function disposeObject(root: THREE.Object3D): void {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine) return;
    m.geometry?.dispose();
    if ((m as unknown as THREE.InstancedMesh).isInstancedMesh) (m as unknown as THREE.InstancedMesh).dispose();
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      const map = (mat as THREE.MeshBasicMaterial | undefined)?.map;
      if (map) { map.dispose(); mat.dispose(); }
    }
  });
}
