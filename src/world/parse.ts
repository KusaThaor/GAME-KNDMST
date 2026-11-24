/**
 * Đọc một khu (scene của file GLB xuất từ Blender) → phần để nhìn + vật cản + sàn + marker.
 *
 * Quy ước gắn nhãn (xem docs/BLENDER_PIPELINE.md):
 *  - Custom property `htx_kind` trên object quyết định loại. Nếu thiếu, dùng tiền tố tên (COLLIDER_, FLOOR_, SPAWN_, ITR_, …).
 *  - `htx_id` là ID ổn định. KHÔNG dùng tên object làm ID: Blender tự thêm ".001" khi trùng tên và Three.js bỏ dấu chấm trong tên.
 *  - Mọi thứ không gắn nhãn là phần để nhìn; đổi/xóa/thêm tùy ý không ảnh hưởng gameplay.
 */
import * as THREE from 'three';
import { KINDS_NEED_ID, MARKER_KINDS, NAME_PREFIX_KIND, type ColliderShape, type Marker, type MarkerKind, type NodeKind, type Portal, type Region, type WorldProblem, type ZoneRegion } from './types';

export interface ZoneFilter {
  /**
   * Các khu đang mở trong Ngày này.
   * - Vật có `htx_gate_zone` = Z chỉ tồn tại khi khu Z KHÔNG mở (cửa đóng, cổng khóa, dây chắn, bụi rậm bít lối).
   * - Vật có `htx_open_zone` = Z chỉ tồn tại khi khu Z ĐANG mở (cánh cửa mở).
   * 'index' = giữ cả hai loại (công cụ kiểm tra đếm mọi thứ có trong file).
   */
  openZones: 'all' | 'index' | ReadonlySet<string>;
  /** Bộ trang trí đang dùng (vd. "g07"). Vật có `htx_decor` chỉ hiện khi bộ này nằm trong danh sách. '*' = giữ hết (công cụ kiểm tra). */
  decorSet: string | null;
}

export interface ZoneParse {
  zone: string;
  /** Phần để nhìn (đã bỏ vật cản, sàn ẩn, marker). */
  visuals: THREE.Group;
  /** Mesh sàn: nhân vật chỉ đứng được ở nơi có sàn bên dưới. */
  floors: THREE.Mesh[];
  colliders: ColliderShape[];
  markers: Marker[];
  zoneRegions: ZoneRegion[];
  portals: Portal[];
  problems: WorldProblem[];
  stats: { visuals: number; triangles: number; materials: string[]; gateZones: string[] };
}

/** Giá trị custom property của object hoặc của object cha gần nhất (GLTFLoader tách mesh nhiều vật liệu thành nhóm con). */
function inherited(o: THREE.Object3D, key: string, stop: THREE.Object3D): unknown {
  for (let n: THREE.Object3D | null = o; n && n !== stop; n = n.parent) if (n.userData[key] !== undefined) return n.userData[key];
  return undefined;
}

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();

export function kindOf(o: THREE.Object3D): NodeKind {
  const tagged = o.userData.htx_kind;
  if (typeof tagged === 'string' && tagged) return tagged as NodeKind;
  const name = o.name.toUpperCase();
  for (const [prefix, kind] of NAME_PREFIX_KIND) if (name.startsWith(prefix)) return kind;
  return 'visual';
}

const listProp = (v: unknown): string[] => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
const truthy = (v: unknown, dflt: boolean) => (v === undefined || v === null ? dflt : v === true || v === 1 || v === '1' || v === 'true');

/** Hộp bao của mesh trên mặt bằng, giữ góc xoay quanh trục đứng. */
export function regionOfMesh(mesh: THREE.Mesh): { region: Region; exact: boolean } {
  const geo = mesh.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  mesh.matrixWorld.decompose(_v, _q, _s);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(_q);
  const world = new THREE.Box3().copy(bb).applyMatrix4(mesh.matrixWorld);
  if (up.y < 0.999) {
    // bị nghiêng: không biểu diễn được bằng hộp xoay quanh trục đứng → dùng hộp bao thẳng trục
    const c = world.getCenter(new THREE.Vector3()), h = world.getSize(new THREE.Vector3()).multiplyScalar(0.5);
    return { region: { cx: c.x, cz: c.z, hx: h.x, hz: h.z, rot: 0, y0: world.min.y, y1: world.max.y }, exact: false };
  }
  const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(_q);
  const center = bb.getCenter(new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
  const half = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  return {
    region: { cx: center.x, cz: center.z, hx: half.x * Math.abs(_s.x), hz: half.z * Math.abs(_s.z), rot: Math.atan2(-xAxis.z, xAxis.x), y0: world.min.y, y1: world.max.y },
    exact: true,
  };
}

export function parseZone(zone: string, scene: THREE.Object3D, filter: ZoneFilter, offset: [number, number, number] = [0, 0, 0]): ZoneParse {
  const out: ZoneParse = {
    zone, visuals: new THREE.Group(), floors: [], colliders: [], markers: [], zoneRegions: [], portals: [], problems: [],
    stats: { visuals: 0, triangles: 0, materials: [], gateZones: [] },
  };
  out.visuals.name = `zone:${zone}`;
  const warn = (code: string, message: string, ref?: string) => out.problems.push({ level: 'warn', code, zone, ref, message });
  const error = (code: string, message: string, ref?: string) => out.problems.push({ level: 'error', code, zone, ref, message });

  scene.position.set(offset[0], offset[1], offset[2]);
  scene.updateMatrixWorld(true);

  // 1) Bỏ những nhánh không thuộc biến thể/Ngày này.
  const drop: THREE.Object3D[] = [];
  scene.traverse((o) => {
    const decor = listProp(o.userData.htx_decor);
    if (decor.length && filter.decorSet !== '*' && (!filter.decorSet || !decor.includes(filter.decorSet))) { drop.push(o); return; }
    const keepAll = filter.openZones === 'index';
    const isOpen = (zid: string) => filter.openZones === 'all' || (filter.openZones !== 'index' && filter.openZones.has(zid));
    const gate = o.userData.htx_gate_zone;
    if (typeof gate === 'string' && gate) {
      if (!out.stats.gateZones.includes(gate)) out.stats.gateZones.push(gate);
      if (!keepAll && isOpen(gate)) { drop.push(o); return; }
    }
    const onlyOpen = o.userData.htx_open_zone;
    if (typeof onlyOpen === 'string' && onlyOpen && !keepAll && !isOpen(onlyOpen)) drop.push(o);
  });
  for (const o of drop) o.removeFromParent();

  // 2) Phân loại.
  const remove: THREE.Object3D[] = [];
  const materials = new Set<string>();
  const seen = new Set<string>();
  scene.traverse((o) => {
    if (o === scene) return;      // nút gốc mang tên scene của Blender, không phải object
    const kind = kindOf(o);
    const mesh = o as THREE.Mesh;
    const id = typeof o.userData.htx_id === 'string' ? o.userData.htx_id : '';
    if (kind !== 'visual' && KINDS_NEED_ID.includes(kind) && !id) { error('marker_no_id', `Object "${o.name}" (loại ${kind}) thiếu custom property htx_id`, o.name); remove.push(o); return; }
    if (id && kind !== 'visual' && kind !== 'collider' && kind !== 'floor') {
      const k = `${kind}:${id}`;
      // nhiều khối `zone` cùng ID là hợp lệ (một khu ghép từ nhiều hộp)
      if (seen.has(k) && kind !== 'zone') error('duplicate_id', `ID "${id}" (loại ${kind}) bị trùng trong khu ${zone}`, id);
      seen.add(k);
    }

    if (kind === 'collider') {
      remove.push(o);
      if (!mesh.isMesh) { warn('collider_not_mesh', `Vật cản "${o.name}" không phải mesh — bỏ qua`, o.name); return; }
      const { region, exact } = regionOfMesh(mesh);
      if (!exact) warn('collider_tilted', `Vật cản "${o.name}" bị nghiêng; dùng hộp bao thẳng trục (nên chỉ xoay quanh trục đứng)`, o.name);
      const circle = o.userData.htx_shape === 'cylinder' || o.userData.htx_shape === 'circle';
      out.colliders.push({ ...region, id: id || o.name, zone, type: circle ? 'circle' : 'box', r: circle ? Math.max(region.hx, region.hz) : 0, blocksCamera: truthy(o.userData.htx_camera, true) });
      return;
    }
    if (kind === 'floor') {
      if (!mesh.isMesh) { warn('floor_not_mesh', `Sàn "${o.name}" không phải mesh — bỏ qua`, o.name); remove.push(o); return; }
      const f = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
      f.name = o.name; f.applyMatrix4(mesh.matrixWorld); f.updateMatrixWorld(true);
      out.floors.push(f);
      if (!truthy(o.userData.htx_visible, false)) remove.push(o);
      return;
    }
    if ((MARKER_KINDS as NodeKind[]).includes(kind)) {
      remove.push(o);
      o.matrixWorld.decompose(_v, _q, _s);
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(_q);
      const props: Marker['props'] = {};
      for (const [k, val] of Object.entries(o.userData)) {
        if (k.startsWith('htx_') && k !== 'htx_kind' && k !== 'htx_id' && (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean')) props[k.slice(4)] = val;
      }
      const marker: Marker = { id, kind: kind as MarkerKind, zone, position: [_v.x, _v.y, _v.z], facing: Math.atan2(fwd.x, fwd.z), props };
      if (typeof o.userData.htx_radius === 'number') marker.radius = o.userData.htx_radius;
      if (kind === 'zone' || kind === 'portal' || kind === 'trigger') {
        if (!mesh.isMesh) { error('volume_not_mesh', `"${o.name}" (loại ${kind}) phải là mesh hình hộp để biết phạm vi`, id); return; }
        const { region } = regionOfMesh(mesh);
        marker.position = [region.cx, region.y0, region.cz];
        if (kind === 'zone') {
          if (id !== zone) warn('zone_id_mismatch', `Khối ranh khu "${o.name}" mang ID "${id}" nhưng nằm trong file của khu ${zone}`, id);
          out.zoneRegions.push({ ...region, zone: id });
        } else if (kind === 'portal') {
          const target = typeof props.target_spawn === 'string' ? props.target_spawn : '';
          if (!target) { error('portal_no_target', `Portal "${id}" thiếu htx_target_spawn`, id); return; }
          out.portals.push({ id, zone, region, targetSpawn: target, activate: props.activate === 'interact' ? 'interact' : 'enter', label: typeof props.label === 'string' ? props.label : null });
        }
      }
      // một khu có thể ghép từ nhiều khối `zone`: chỉ ghi một marker cho mỗi ID
      if (!(kind === 'zone' && out.markers.some((m) => m.kind === 'zone' && m.id === id))) out.markers.push(marker);
      return;
    }
    // phần để nhìn
    if (mesh.isMesh) {
      out.stats.visuals++;
      const g = mesh.geometry;
      out.stats.triangles += (g.index ? g.index.count : g.attributes.position.count) / 3;
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) if (m?.name) materials.add(m.name);
      if (truthy(inherited(o, 'htx_dynamic', scene), false)) o.userData.noMerge = true;
      const hideIn = inherited(o, 'htx_hide_in', scene);
      if (typeof hideIn === 'string' && hideIn) o.userData.htxHideIn = hideIn;
    }
  });
  for (const o of remove) {
    // giữ lại con là phần để nhìn (hiếm): chuyển lên cha trước khi gỡ
    for (const child of [...o.children]) if (kindOf(child) === 'visual' && !remove.includes(child)) o.parent?.attach(child);
    o.removeFromParent();
  }
  out.stats.materials = [...materials].sort();
  out.visuals.add(scene);
  return out;
}
