/**
 * Scene một Ngày ký ức: nạp bản đồ (các khu xuất từ Blender) + biến thể theo năm học, đặt NPC và điểm tương tác theo marker,
 * rồi nối 3 hệ dùng chung: PlayerController (đi lại + va chạm), CameraManager (camera thứ ba), ZoneTracker (đổi khu, portal).
 *
 * File này KHÔNG chứa tọa độ, tên mesh hay phím bấm: vị trí đến từ marker trong Blender (qua world/dayBindings.ts),
 * thông số camera/phím đến từ src/config/camera.ts. Xem docs/S2_WORLD_ARCHITECTURE.md.
 */
import * as THREE from 'three';
import { CameraManager, type LookInput } from '../../actors/camera/cameraManager';
import type { Motion } from '../../actors/character/animate';
import { buildCharacter } from '../../actors/character/build';
import type { CharacterId } from '../../actors/character/presets';
import { rigAvatar, type Avatar } from '../../actors/player/avatar';
import { DEFAULT_MOVE, PlayerController, type MoveConfig, type MoveIntent } from '../../actors/player/controller';
import { CAMERA_PRESETS, DEFAULT_CAMERA_PRESET, type CameraPreset } from '../../config/camera';
import { GAME_CONFIG } from '../../config/game';
import type { ContentIndex } from '../../content/indexContent';
import type { CameraPoint, Gender, MemoryDay, StandZone } from '../../content/types';
import { toon, flat } from '../../render/materials';
import { addDaylight } from '../../render/stage';
import { ART_STYLES, DEFAULT_ART_STYLE, type ArtStyle } from '../../render/style';
import { bindCamera, bindDay, bindStandZone, type Placed } from '../../world/dayBindings';
import { WORLD_MANIFESTS } from '../../world/maps';
import { clouds, skyDome } from '../../world/sky';
import { ZoneTracker, type TravelEvent } from '../../world/travel';
import type { ColliderShape, WorldManifest, WorldProblem } from '../../world/types';
import { DECOR_SETS, DEFAULT_DECOR, DEFAULT_LIGHTING, LIGHTING_PRESETS } from '../../world/variants';
import { loadWorld, World, WorldLoadError } from '../../world/world';
import { disposeScene } from '../view';

export interface DayTarget { id: string; label: string; position: THREE.Vector3; kind: 'npc' | 'object' | 'marker'; radius: number; zone: string | null }
/** Ý định của người chơi trong một khung hình. `null` = đang khóa (thoại, bảng, ảnh xem trước…). */
export interface DayControl { move: MoveIntent | null; look: LookInput | null }
export interface StandSpot { center: [number, number]; y: number; radius: number }

export interface DaySceneOptions {
  /** Phong cách hình ảnh (mặc định: DEFAULT_ART_STYLE trong render/style.ts). */
  style?: ArtStyle;
  /** Tải lại trang giữa Ngày: đứng ở điểm xuất hiện của khu này thay vì điểm xuất hiện của Ngày. */
  startZone?: string | null;
  /** Tự cung cấp dữ liệu GLB (test). */
  fetchAsset?: (url: string) => Promise<ArrayBuffer>;
}

export interface DayScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  targets: DayTarget[];
  playerPosition: THREE.Vector3;
  /** Lỗi/nhắc khi nạp bản đồ và khi nối nội dung với marker. Rỗng = mọi thứ khớp. */
  problems: WorldProblem[];
  /** true = không nạp được bản đồ, đang dùng mặt bằng tạm. */
  readonly placeholder: boolean;
  /** Khu người chơi đang đứng. */
  readonly zone: string | null;
  onZoneChange: ((to: string, from: string | null) => void) | null;
  update(dt: number, t: number, ctl: DayControl): void;
  /** Đặt người chơi tới một điểm (tự bám sàn, tự đẩy ra khỏi vật cản). */
  teleport(x: number, z: number, facing?: number): void;
  /** Đưa người chơi về một điểm xuất hiện (mặc định: điểm xuất hiện của Ngày) — "Về chỗ an toàn", "Chơi lại Ngày". */
  toSpawn(id?: string | null): void;
  /** Portal kiểu "bấm để đi" tại chỗ đang đứng (null = không có). */
  portalPrompt(): { id: string; label: string } | null;
  usePortal(): boolean;
  setHighlights(ids: string[]): void;
  /** Vòng đứng khi chụp ảnh, đã đổi từ ID marker ra tọa độ. */
  standSpot(zone: StandZone | null | undefined): StandSpot | null;
  setStandZone(spot: StandSpot | null): void;
  setPlayerMotion(m: Motion | null): void;
  /** Máy ảnh ảo đặt sẵn (khai trong nội dung của Ngày). null = bản đồ không có marker máy ảnh đó. */
  cameraFor(point: CameraPoint): THREE.PerspectiveCamera | null;
  /** Giữ camera của người chơi ở khung của một máy ảnh đặt sẵn (khung ngắm, cutscene); null = trả lại camera bám theo. */
  lockCamera(point: CameraPoint | null): void;
  /** Mọi nhân vật trong danh sách có nằm trong khung của máy ảnh không. */
  allInFrame(cam: THREE.PerspectiveCamera, actors: string[]): boolean;
  /** Ẩn/hiện các thứ không được dính vào ảnh (vòng đánh dấu, mũi tên). */
  setGizmosVisible(v: boolean): void;
  /** Trạng thái camera/điều khiển — cho công cụ test. */
  debug(): { yaw: number; pitch: number; distance: number; cameraDistance: number; locked: boolean; preset: string; state: string; y: number; facing: number };
  dispose(): void;
}

const GRADE_FOR_VARIANT = { AGE_G6_7: 6, AGE_G8_9: 9 } as const;
const emptyManifest = (mapId: string, spawn: string): WorldManifest => ({ schema: 1, map_id: mapId, title: '', asset_root: '/', default_spawn: spawn, camera_preset: DEFAULT_CAMERA_PRESET, zones: [] });

export async function buildDayScene(day: MemoryDay, idx: ContentIndex, gender: Gender, opts: DaySceneOptions = {}): Promise<DayScene> {
  const map = idx.pack.maps.find((m) => m.id === day.map_id);
  const variant = map?.variants.find((v) => v.variant_id === day.map_variant);
  const decor = DECOR_SETS[variant?.decor_set ?? ''] ?? DEFAULT_DECOR;
  const light = LIGHTING_PRESETS[variant?.lighting_preset ?? ''] ?? DEFAULT_LIGHTING;
  const year = idx.pack.school_years.find((y) => y.id === day.school_year_id);
  const grade = GRADE_FOR_VARIANT[(year?.age_variant ?? 'AGE_G6_7') as keyof typeof GRADE_FOR_VARIANT] ?? 6;

  // ---- bản đồ ----
  const manifest = WORLD_MANIFESTS[day.map_id];
  let world: World;
  if (!manifest) {
    world = World.placeholder(emptyManifest(day.map_id, day.spawn_point ?? 'spawn.none'), [{ level: 'error', code: 'map_without_world', ref: day.map_id, message: `Bản đồ ${day.map_id} chưa có manifest (src/world/maps/${day.map_id}.world.json)` }]);
  } else {
    try {
      world = await loadWorld(manifest, { openZones: day.open_zones ?? 'all', decorSet: variant?.decor_set ?? null, style: opts.style ?? ART_STYLES[DEFAULT_ART_STYLE], fetchAsset: opts.fetchAsset });
    } catch (e) {
      world = World.placeholder(manifest, e instanceof WorldLoadError ? e.problems : [{ level: 'error', code: 'asset_load_failed', ref: day.map_id, message: String((e as Error)?.message ?? e) }]);
    }
  }
  const presetName = (zone: string | null) => manifest?.zones.find((z) => z.id === zone)?.camera_preset ?? manifest?.camera_preset ?? DEFAULT_CAMERA_PRESET;
  const presetOf = (zone: string | null): CameraPreset => CAMERA_PRESETS[presetName(zone)] ?? CAMERA_PRESETS[DEFAULT_CAMERA_PRESET];

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(light.fog, 45, 140);
  const sunOffset = new THREE.Vector3(...light.sunPos);
  const { hemi, sun } = addDaylight(scene, { sun: sunOffset.clone(), shadowSize: 24 });
  hemi.color.set(light.hemiSky); hemi.groundColor.set(light.hemiGround); hemi.intensity = light.hemiIntensity;
  sun.color.set(light.sunColor); sun.intensity = light.sunIntensity;
  const sky = new THREE.Group();
  sky.add(skyDome(light.sky), clouds());
  scene.add(sky, world.root);
  const gizmos = new THREE.Group(); scene.add(gizmos);

  const bound = bindDay(day, map, world);
  const problems: WorldProblem[] = [...world.problems, ...bound.problems];
  const groundAt = (p: { x: number; y: number; z: number }) => world.ground(p.x, p.z, p.y) ?? p.y;

  // ---- nhân vật ----
  const rigOf = (ref: string): CharacterId => {
    const chr = idx.resolveActor(ref);
    const rig = chr?.age_variants[year?.age_variant ?? 'AGE_G6_7']?.rig_id ?? chr?.age_variants.AGE_G6_7?.rig_id ?? 'duc';
    return (rig === 'player' ? GAME_CONFIG.player_rig_by_gender[gender] : rig) as CharacterId;
  };
  const actors = new Map<string, Avatar>();
  const targets: DayTarget[] = [];
  const npcColliders: ColliderShape[] = [];
  bound.npcs.forEach((n, i) => {
    const avatar = rigAvatar(buildCharacter(rigOf(n.actor), grade, { scarf: decor.scarf }), i + 1);
    const y = groundAt(n);
    avatar.root.position.set(n.x, y, n.z);
    avatar.root.rotation.y = n.facing;
    avatar.setMotion(n.motion as Motion, 0);
    scene.add(avatar.root);
    actors.set(n.actor, avatar);
    targets.push({ id: n.actor, label: idx.resolveActor(n.actor)?.display_name ?? n.actor, position: avatar.root.position, kind: 'npc', radius: GAME_CONFIG.move.interact_radius, zone: world.zoneAt(n.x, n.z) });
    // Nhân vật đứng yên cũng là vật cản (không chắn camera).
    npcColliders.push({ id: `npc:${n.actor}`, zone: '', type: 'circle', r: 0.3, cx: n.x, cz: n.z, hx: 0.3, hz: 0.3, rot: 0, y0: y, y1: y + avatar.height, blocksCamera: false });
  });
  world.addColliders(npcColliders);

  // ---- điểm tương tác: vòng trên mặt đất + chóp nổi ----
  const marks = new Map<string, { gem: THREE.Mesh; baseY: number }>();
  for (const it of bound.targets) {
    const y = groundAt(it);
    const pos = new THREE.Vector3(it.x, y, it.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 28), flat('#fff3c4', { transparent: true, opacity: 0.75 }));
    ring.rotation.x = -Math.PI / 2; ring.position.copy(pos).setY(y + 0.03);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), toon('#f2b53a', { emissive: '#7a5200' }));
    gem.position.copy(pos).setY(y + 1.9); gem.visible = false;
    gizmos.add(ring, gem);
    marks.set(it.id, { gem, baseY: y + 1.9 });
    targets.push({ id: it.id, label: it.label, position: pos, kind: it.kind, zone: it.zone, radius: it.radius ?? (it.kind === 'marker' ? GAME_CONFIG.move.area_radius : GAME_CONFIG.move.interact_radius) });
  }
  const standRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), flat('#ffe27a', { transparent: true, opacity: 0.9 }));
  standRing.rotation.x = -Math.PI / 2; standRing.visible = false; gizmos.add(standRing);

  // ---- Player: hình (Avatar) + điều khiển + camera + theo dõi khu ----
  const player = rigAvatar(buildCharacter(rigOf('player'), grade, { scarf: decor.scarf }), 0);
  scene.add(player.root);
  actors.set('player', player);
  const move: MoveConfig = { ...DEFAULT_MOVE, walk: GAME_CONFIG.move.walk, run: GAME_CONFIG.move.run };
  const ctl = new PlayerController(world, move);
  const cam = new CameraManager(presetOf(null), world);
  const tracker = new ZoneTracker(world);
  let forcedMotion: Motion | null = null;
  let onZoneChange: DayScene['onZoneChange'] = null;

  const sync = () => { player.root.position.set(ctl.x, ctl.y, ctl.z); player.root.rotation.y = ctl.facing; };
  const handle = (events: TravelEvent[]): void => {
    for (const e of events) {
      if (e.type === 'zone') {
        world.setViewerZone(e.to);
        cam.setPreset(presetOf(e.to));
        onZoneChange?.(e.to, e.from);
      } else {
        place({ x: e.to.position[0], y: e.to.position[1], z: e.to.position[2], facing: e.to.facing }, true);
        return;
      }
    }
  };
  /** Đặt người chơi tới một chỗ; `behind` = xoay camera ra sau lưng. */
  function place(p: Placed, behind: boolean): void {
    ctl.teleport(p.x, p.z, p.facing, p.y);
    const r = world.resolve(ctl.x, ctl.z, ctl.y, move.body);
    if (r.hit && world.ground(r.x, r.z, ctl.y) !== null) { ctl.x = r.x; ctl.z = r.z; }
    sync();
    handle(tracker.arrive(ctl.x, ctl.z));
    if (behind) cam.snapBehind(ctl.facing, ctl);
  }
  const startMarker = opts.startZone && world.isOpen(opts.startZone) ? world.spawnInZone(opts.startZone) : null;
  place(startMarker ? { x: startMarker.position[0], y: startMarker.position[1], z: startMarker.position[2], facing: startMarker.facing } : bound.spawn, true);

  const followSun = () => {
    // bóng đổ đi theo người chơi; làm tròn để bóng không rung khi đi
    const sx = Math.round(ctl.x * 2) / 2, sz = Math.round(ctl.z * 2) / 2;
    sun.target.position.set(sx, 0, sz);
    sun.position.set(sx + sunOffset.x, sunOffset.y, sz + sunOffset.z);
  };
  followSun();

  return {
    scene, camera: cam.camera, targets, playerPosition: player.root.position, problems,
    get placeholder() { return world.isPlaceholder; },
    get zone() { return tracker.zone; },
    get onZoneChange() { return onZoneChange; },
    set onZoneChange(fn) { onZoneChange = fn; },
    update(dt, t, c) {
      ctl.update(dt, c.move, cam.yaw);
      if (c.move) handle(tracker.update(ctl.x, ctl.z));
      sync();
      const motion: Motion = forcedMotion ?? ctl.state;
      player.setMotion(motion, motion === 'run' ? move.run : motion === 'walk' ? move.walk : 0);
      for (const a of actors.values()) a.update(dt);
      cam.update(dt, ctl, c.look);
      sky.position.set(cam.camera.position.x, 0, cam.camera.position.z);
      followSun();
      for (const m of marks.values()) if (m.gem.visible) { m.gem.rotation.y = t * 1.6; m.gem.position.y = m.baseY + Math.sin(t * 2.4) * 0.08; }
    },
    teleport(x, z, facing) { place({ x, y: ctl.y, z, facing: facing ?? ctl.facing }, facing !== undefined); },
    toSpawn(id) {
      const m = world.marker('spawn', id ?? day.spawn_point ?? '');
      place(m ? { x: m.position[0], y: m.position[1], z: m.position[2], facing: m.facing } : bound.spawn, true);
    },
    portalPrompt() {
      const p = tracker.interactPortal(ctl.x, ctl.z);
      return p ? { id: p.id, label: p.label ?? 'Đi tiếp' } : null;
    },
    usePortal() {
      const p = tracker.interactPortal(ctl.x, ctl.z);
      const to = p && tracker.use(p);
      if (!to) return false;
      place({ x: to.position[0], y: to.position[1], z: to.position[2], facing: to.facing }, true);
      return true;
    },
    setHighlights(ids) { for (const [id, m] of marks) m.gem.visible = ids.includes(id); },
    standSpot(zone) { return bindStandZone(zone, world); },
    setStandZone(spot) {
      standRing.visible = !!spot;
      if (spot) { standRing.position.set(spot.center[0], spot.y + 0.035, spot.center[1]); standRing.scale.setScalar(spot.radius); }
    },
    setPlayerMotion(m) { forcedMotion = m; },
    cameraFor(point) {
      const b = bindCamera(point, world);
      if (!b) return null;
      const c = new THREE.PerspectiveCamera(b.fov, 4 / 3, 0.1, 400);
      c.position.set(...b.position); c.lookAt(new THREE.Vector3(...b.look_at)); c.updateMatrixWorld(true);
      return c;
    },
    lockCamera(point) {
      const b = point ? bindCamera(point, world) : null;
      if (b) cam.lock({ position: b.position, look_at: b.look_at, fov: b.fov }); else cam.release();
    },
    allInFrame(c, refs) {
      c.updateMatrixWorld(true); c.updateProjectionMatrix();
      return refs.every((ref) => {
        const a = actors.get(ref);
        if (!a) return false;
        const base = a.root.position;
        const head = base.clone().setY(base.y + a.height * 0.85).project(c);
        const feet = base.clone().setY(base.y + 0.05).project(c);
        return [head, feet].every((v) => Math.abs(v.x) <= 0.97 && Math.abs(v.y) <= 0.97 && v.z < 1);
      });
    },
    setGizmosVisible(v) { gizmos.visible = v; },
    debug: () => ({ yaw: cam.yaw, pitch: cam.pitch, distance: cam.distance, cameraDistance: cam.current, locked: cam.isLocked, preset: presetName(tracker.zone), state: ctl.state, y: ctl.y, facing: ctl.facing }),
    dispose() { disposeScene(scene); world.dispose(); },
  };
}
