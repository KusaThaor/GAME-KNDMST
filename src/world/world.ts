/**
 * World — phần chạy của bản đồ (Tầng C). Nạp các khu của một manifest, dựng va chạm, sổ marker, ranh khu, portal.
 *
 * Vòng đời: `loadWorld()` → gắn `world.root` vào scene → mỗi khung hình `ZoneTracker` (travel.ts) hỏi `zoneAt()/portalsAt()` → `dispose()` khi rời Ngày.
 * Bản đồ liền (GDD v0.3 §4): mọi khu của một bản đồ được nạp cùng lúc, đi bộ qua lại không có màn tải.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeStatic } from '../render/merge';
import { applyStyle, ART_STYLES, DEFAULT_ART_STYLE, type ArtStyle } from '../render/style';
import { CollisionWorld, DEFAULT_BODY, regionContains, type BodyOpts } from './collision';
import { parseZone, type ZoneParse } from './parse';
import type { ColliderShape, Marker, MarkerKind, Portal, WorldIndex, WorldManifest, WorldProblem, ZoneRegion } from './types';

export interface WorldLoadOptions {
  /** Khu mở trong Ngày này ('all' = mở hết). Khu không mở bị chặn bằng vật có `htx_gate_zone` trong Blender. */
  openZones?: 'all' | string[];
  decorSet?: string | null;
  style?: ArtStyle;
  /** Tự cung cấp dữ liệu GLB (unit test đọc từ đĩa). Mặc định: fetch theo URL. */
  fetchAsset?: (url: string) => Promise<ArrayBuffer>;
  /** Gộp mesh tĩnh theo vật liệu để giảm lượt vẽ. Mặc định true. */
  merge?: boolean;
}

export class WorldLoadError extends Error {
  constructor(message: string, readonly problems: WorldProblem[]) { super(message); this.name = 'WorldLoadError'; }
}

/** File GLB đã tải được giữ lại trong bộ nhớ: vào lại một Ngày (hoặc dựng lại cảnh để chụp ảnh) không tải lại từ mạng. */
const assetCache = new Map<string, Promise<ArrayBuffer>>();
export function fetchWorldAsset(url: string): Promise<ArrayBuffer> {
  let p = assetCache.get(url);
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.arrayBuffer();
    });
    assetCache.set(url, p);
    p.catch(() => assetCache.delete(url));       // lần sau thử tải lại
  }
  return p;
}
const defaultFetch = fetchWorldAsset;
const parseGlbRaw = (data: ArrayBuffer) => new Promise<THREE.Group>((resolve, reject) => new GLTFLoader().parse(data, '', (g) => resolve(g.scene), reject));

export class World {
  readonly root = new THREE.Group();
  readonly problems: WorldProblem[] = [];
  readonly loadedZones: string[] = [];
  readonly portals: Portal[] = [];
  collision = new CollisionWorld([]);
  private markers = new Map<string, Marker>();
  private zoneRegions: ZoneRegion[] = [];
  private floors: THREE.Mesh[] = [];
  private floorGroup = new THREE.Group();
  private ray = new THREE.Raycaster();
  private from = new THREE.Vector3();
  private readonly down = new THREE.Vector3(0, -1, 0);
  private hideGroups: { node: THREE.Object3D; zones: string[] }[] = [];
  readonly gateZones = new Set<string>();

  /** true = không nạp được file nào, đang dùng mặt bằng tạm (xem `World.placeholder`). */
  isPlaceholder = false;

  constructor(readonly manifest: WorldManifest, readonly openZones: 'all' | ReadonlySet<string>) {
    this.root.name = `world:${manifest.map_id}`;
  }

  /**
   * Mặt bằng tạm dùng khi KHÔNG nạp được khu nào (thiếu file, mạng lỗi): một nền phẳng + một điểm xuất hiện,
   * để người chơi không bị kẹt ở màn hình trống. Marker thiếu sẽ được đặt tạm quanh điểm xuất hiện (xem dayBindings.ts).
   */
  static placeholder(manifest: WorldManifest, problems: WorldProblem[] = []): World {
    const w = new World(manifest, 'all');
    w.isPlaceholder = true;
    w.problems.push(...problems);
    const geo = new THREE.PlaneGeometry(80, 80);
    geo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    w.floors.push(floor); w.floorGroup.add(floor);
    const ground = new THREE.Mesh(geo, ART_STYLES[DEFAULT_ART_STYLE].material(new THREE.MeshStandardMaterial({ color: '#cfc8b8' }), new THREE.Color('#cfc8b8')));
    ground.name = 'placeholder_ground'; ground.receiveShadow = true;
    w.root.add(ground);
    w.markers.set(`spawn:${manifest.default_spawn}`, { id: manifest.default_spawn, kind: 'spawn', zone: manifest.zones[0]?.id ?? '', position: [0, 0, 0], facing: Math.PI, props: {} });
    w.finish([]);
    return w;
  }

  /** Dùng nội bộ khi nạp. */
  addZone(z: ZoneParse, opts: { merge: boolean }): void {
    this.loadedZones.push(z.zone);
    this.problems.push(...z.problems);
    for (const g of z.stats.gateZones) this.gateZones.add(g);
    for (const m of z.markers) {
      const k = `${m.kind}:${m.id}`;
      if (this.markers.has(k) && m.kind !== 'zone') this.problems.push({ level: 'error', code: 'duplicate_id', zone: z.zone, ref: m.id, message: `ID "${m.id}" (loại ${m.kind}) xuất hiện ở cả khu ${this.markers.get(k)!.zone} và ${z.zone}` });
      else this.markers.set(k, m);
    }
    this.zoneRegions.push(...z.zoneRegions);
    this.portals.push(...z.portals);
    this.floors.push(...z.floors);
    for (const f of z.floors) this.floorGroup.add(f);
    // Nhóm "ẩn khi đứng trong khu X" (tầng trên, mái): tách riêng để bật/tắt, phần còn lại gộp theo vật liệu.
    const hideGroups = new Map<string, THREE.Group>();
    const hidden: THREE.Mesh[] = [];
    z.visuals.traverse((o) => { if ((o as THREE.Mesh).isMesh && typeof o.userData.htxHideIn === 'string') hidden.push(o as THREE.Mesh); });
    for (const m of hidden) {
      const key = m.userData.htxHideIn as string;
      let g = hideGroups.get(key);
      if (!g) { g = new THREE.Group(); hideGroups.set(key, g); }
      g.attach(m);
    }
    const put = (src: THREE.Group, hideIn: string | null) => {
      let node: THREE.Object3D = src;
      if (opts.merge) {
        node = mergeStatic(src);
        const kept = new Set<THREE.BufferGeometry>();
        node.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) kept.add(m.geometry); });
        // bản gốc đã được sao chép khi gộp → giải phóng (trừ hình còn dùng chung với vật không gộp)
        src.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !kept.has(m.geometry)) m.geometry.dispose(); });
      }
      node.name = hideIn ? `zone:${z.zone}:hide` : `zone:${z.zone}`;
      if (hideIn) this.hideGroups.push({ node, zones: hideIn.split(',').map((s) => s.trim()) });
      this.root.add(node);
    };
    put(z.visuals, null);
    for (const [key, g] of hideGroups) put(g, key);
  }

  finish(colliders: ZoneParse['colliders']): void {
    this.collision = new CollisionWorld(colliders);
    this.floorGroup.updateMatrixWorld(true);
    for (const p of this.portals) {
      if (!this.markers.has(`spawn:${p.targetSpawn}`)) this.problems.push({ level: 'error', code: 'portal_bad_target', zone: p.zone, ref: p.id, message: `Portal "${p.id}" trỏ tới điểm xuất hiện "${p.targetSpawn}" không tồn tại` });
    }
    if (!this.markers.has(`spawn:${this.manifest.default_spawn}`)) this.problems.push({ level: 'error', code: 'missing_default_spawn', ref: this.manifest.default_spawn, message: `Không thấy điểm xuất hiện mặc định "${this.manifest.default_spawn}" trong các khu đã nạp` });
  }

  /** Thêm vật cản lúc chạy (vd. nhân vật đứng yên). Không sửa dữ liệu của bản đồ. */
  addColliders(extra: ColliderShape[]): void {
    if (extra.length) this.collision = new CollisionWorld([...this.collision.shapes, ...extra]);
  }
  /** Va chạm ngang cho bộ điều khiển nhân vật (xem actors/player/controller.ts → Navigation). */
  resolve(x: number, z: number, y: number, body: BodyOpts = DEFAULT_BODY): { x: number; z: number; hit: boolean } { return this.collision.resolve(x, z, y, body); }
  /** Đoạn thẳng có bị vật cản che không — cho camera (xem actors/camera/cameraManager.ts → Occluder). */
  segmentHit(a: [number, number, number], b: [number, number, number], pad = 0.2): number | null { return this.collision.segmentHit(a, b, pad); }

  marker(kind: MarkerKind, id: string): Marker | null { return this.markers.get(`${kind}:${id}`) ?? null; }
  /** Tìm marker theo ID, không cần biết loại (ID đã có tiền tố riêng: itr., spot., cam., spawn.). */
  find(id: string): Marker | null {
    for (const kind of ['interact', 'spot', 'spawn', 'camera', 'target', 'portal', 'trigger', 'zone'] as MarkerKind[]) {
      const m = this.markers.get(`${kind}:${id}`);
      if (m) return m;
    }
    return null;
  }
  allMarkers(): Marker[] { return [...this.markers.values()]; }

  /** Điểm xuất hiện. Không thấy → dùng điểm mặc định của bản đồ → điểm xuất hiện bất kỳ. */
  spawn(id?: string | null): Marker | null {
    return (id ? this.marker('spawn', id) : null) ?? this.marker('spawn', this.manifest.default_spawn) ?? this.allMarkers().find((m) => m.kind === 'spawn') ?? null;
  }

  /** Điểm xuất hiện đầu tiên của một khu (dùng khi tải lại trang: đứng lại ở khu đang chơi dở). */
  spawnInZone(zone: string): Marker | null {
    return this.allMarkers().find((m) => m.kind === 'spawn' && m.zone === zone) ?? null;
  }

  /** Khu chứa điểm (x, z). Vùng chồng nhau: khu có khối nhỏ hơn thắng (lớp học nằm trong dãy nhà). */
  zoneAt(x: number, z: number): string | null {
    let best: ZoneRegion | null = null;
    for (const r of this.zoneRegions) {
      if (!regionContains(r, x, z)) continue;
      if (!best || r.hx * r.hz < best.hx * best.hz) best = r;
    }
    return best?.zone ?? null;
  }
  isOpen(zone: string): boolean { return this.openZones === 'all' || this.openZones.has(zone); }

  /** Cao độ sàn ngay dưới điểm (x, z), dò từ `y + 1` xuống. null = không có sàn (ngoài bản đồ). */
  ground(x: number, z: number, y = 0): number | null {
    this.from.set(x, y + 1, z);
    this.ray.set(this.from, this.down);
    this.ray.far = 4;
    const hit = this.ray.intersectObjects(this.floors, false)[0];
    return hit ? hit.point.y : null;
  }

  /** Báo khu người chơi đang đứng: ẩn các phần che camera (tầng trên, mái) khi ở trong nhà. */
  setViewerZone(zone: string | null): void {
    for (const g of this.hideGroups) g.node.visible = !(zone && g.zones.includes(zone));
  }

  portalsAt(x: number, z: number): Portal[] {
    return this.portals.filter((p) => regionContains(p.region, x, z));
  }

  dispose(): void {
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        const map = (mat as THREE.MeshStandardMaterial).map;
        if (map) { map.dispose(); mat.dispose(); }
      }
    });
    for (const f of this.floors) { f.geometry.dispose(); (f.material as THREE.Material).dispose(); }
    this.floors.length = 0; this.floorGroup.clear(); this.root.clear();
  }
}

/** Nạp mọi khu của một bản đồ. Một khu hỏng không làm sập cả bản đồ: lỗi được ghi vào `world.problems`. */
export async function loadWorld(manifest: WorldManifest, opts: WorldLoadOptions = {}): Promise<World> {
  const open = opts.openZones === undefined || opts.openZones === 'all' ? 'all' as const : new Set(opts.openZones);
  const style = opts.style ?? ART_STYLES[DEFAULT_ART_STYLE];
  const fetchAsset = opts.fetchAsset ?? defaultFetch;
  const world = new World(manifest, open);
  const filter = { openZones: open, decorSet: opts.decorSet ?? null };

  const loaded = await Promise.all(manifest.zones.map(async (def) => {
    const url = manifest.asset_root + def.asset;
    try {
      const scene = await parseGlbRaw(await fetchAsset(url));
      return { def, zone: parseZone(def.id, scene, filter, def.offset) };
    } catch (e) {
      world.problems.push({ level: 'error', code: 'asset_load_failed', zone: def.id, ref: url, message: `Không nạp được khu ${def.id} (${url}): ${(e as Error).message ?? e}` });
      return null;
    }
  }));

  const colliders: ZoneParse['colliders'] = [];
  for (const item of loaded) {
    if (!item) continue;
    applyStyle(item.zone.visuals, style);
    world.addZone(item.zone, { merge: opts.merge ?? true });
    colliders.push(...item.zone.colliders);
  }
  if (!world.loadedZones.length) throw new WorldLoadError(`Không nạp được khu nào của bản đồ ${manifest.map_id}`, world.problems);
  world.finish(colliders);
  return world;
}

/** Bảng tóm tắt một bản đồ từ các file GLB (dùng cho `npm run world:index` và `npm run validate:world`). */
export async function buildWorldIndex(manifest: WorldManifest, fetchAsset: (url: string) => Promise<ArrayBuffer>): Promise<{ index: WorldIndex; problems: WorldProblem[] }> {
  const index: WorldIndex = { map_id: manifest.map_id, zones: {} };
  const problems: WorldProblem[] = [];
  const r3 = (n: number) => Math.round(n * 1000) / 1000;
  for (const def of manifest.zones) {
    const url = manifest.asset_root + def.asset;
    let z: ZoneParse;
    try { z = parseZone(def.id, await parseGlbRaw(await fetchAsset(url)), { openZones: 'index', decorSet: '*' }, def.offset); } catch (e) {
      problems.push({ level: 'error', code: 'asset_load_failed', zone: def.id, ref: url, message: `Không đọc được ${url}: ${(e as Error).message ?? e}` });
      continue;
    }
    problems.push(...z.problems);
    let bounds: [number, number, number, number] | null = null;
    for (const f of z.floors) {
      const b = new THREE.Box3().setFromObject(f);
      bounds = bounds ? [Math.min(bounds[0], b.min.x), Math.min(bounds[1], b.min.z), Math.max(bounds[2], b.max.x), Math.max(bounds[3], b.max.z)] : [b.min.x, b.min.z, b.max.x, b.max.z];
    }
    index.zones[def.id] = {
      asset: def.asset,
      markers: z.markers.map((m) => ({ id: m.id, kind: m.kind, position: [r3(m.position[0]), r3(m.position[1]), r3(m.position[2])] as [number, number, number], facing: r3(m.facing) }))
        .sort((a, b) => (a.kind + a.id).localeCompare(b.kind + b.id)),
      colliders: z.colliders.length, floors: z.floors.length, visuals: z.stats.visuals, triangles: Math.round(z.stats.triangles), materials: z.stats.materials,
      gates: [...z.stats.gateZones].sort(),
      portals: z.portals.map((p) => ({ id: p.id, target_spawn: p.targetSpawn })),
      floor_bounds: bounds ? (bounds.map(r3) as [number, number, number, number]) : null,
    };
  }
  return { index, problems };
}
