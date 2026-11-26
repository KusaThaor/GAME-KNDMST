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
import type { CharacterId } from '../../actors/character/presets';
import type { Avatar } from '../../actors/player/avatar';
import { DEFAULT_RIG_ADAPTER, type CharacterRigAdapter } from '../../actors/player/rigAdapter';
import { DEFAULT_MOVE, PlayerController, type MoveConfig, type MoveIntent } from '../../actors/player/controller';
import { CAMERA_PRESETS, DEFAULT_CAMERA_PRESET, type CameraPreset } from '../../config/camera';
import { GAME_CONFIG } from '../../config/game';
import type { ContentIndex } from '../../content/indexContent';
import type { CameraPoint, Gender, MemoryDay, StandZone } from '../../content/types';
import { toon, flat } from '../../render/materials';
import { createFx } from '../../render/fx';
import { addDaylight } from '../../render/stage';
import { ART_STYLES, DEFAULT_ART_STYLE, type ArtStyle } from '../../render/style';
import { createAtmosphere, type AtmosphereDeps } from '../../world/atmosphere';
import { bindCamera, bindDay, bindStandZone, type Placed } from '../../world/dayBindings';
import { mountDressing } from '../../world/dressing';
import { WORLD_MANIFESTS } from '../../world/maps';
import { clouds, skyDome } from '../../world/sky';
import { ZoneTracker, type TravelEvent } from '../../world/travel';
import { CollisionWorld } from '../../world/collision';
import type { ColliderShape, WorldManifest, WorldProblem } from '../../world/types';
import { DECOR_SETS, DEFAULT_DECOR, DEFAULT_LIGHTING, LIGHTING_PRESETS, assetDecorSet, applySchoolDecor } from '../../world/variants';
import { loadWorld, World, WORLD_EXTRAS, WorldLoadError } from '../../world/world';
import { disposeScene } from '../view';

export interface DayTarget { id: string; label: string; position: THREE.Vector3; kind: 'npc' | 'object' | 'marker'; radius: number; zone: string | null }
/** Ý định của người chơi trong một khung hình. `null` = đang khóa (thoại, bảng, ảnh xem trước…). */
export interface DayControl { move: MoveIntent | null; look: LookInput | null }
export interface StandSpot { center: [number, number]; y: number; radius: number }
export interface MarkerSpot { x: number; y: number; z: number; facing: number }
export interface MoveActorOptions {
  /** Dẫn đường: tạm dừng chờ nếu người chơi tụt lại quá ngưỡng (không khóa điều khiển player, có timeout an toàn). */
  leadPlayer?: boolean;
  /** Khoảng cách tối đa (m) trước khi NPC tạm dừng chờ người chơi (mặc định 6 m). */
  leadDistance?: number;
  /** Thời gian chờ tối đa (s) cho mỗi lượt chờ người chơi (mặc định 6 s) để bot/E2E không kẹt. */
  leadTimeout?: number;
  /** Giới hạn thời gian di chuyển tối đa (s) khi gặp vật cản (mặc định 20 s). */
  maxDuration?: number;
}

export interface DaySceneOptions extends Pick<AtmosphereDeps, 'bus' | 'stepId'> {
  /** Phong cách hình ảnh (mặc định: DEFAULT_ART_STYLE trong render/style.ts). */
  style?: ArtStyle;
  /** Tải lại trang giữa Ngày: đứng ở điểm xuất hiện của khu này thay vì điểm xuất hiện của Ngày. */
  startZone?: string | null;
  /** Chỗ cắm model nhân vật (mặc định: nhân vật dựng bằng code). Xem actors/player/rigAdapter.ts. */
  rigAdapter?: CharacterRigAdapter;
  /** Tự cung cấp dữ liệu GLB (test). */
  fetchAsset?: (url: string) => Promise<ArrayBuffer>;
  /** Đọc flag của bản lưu cho đồ trang trí (vd. 'm1.base_decor'). Không truyền → mọi flag là undefined. */
  flag?: (name: string) => unknown;
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
  lockWeatherCamera(stepId: string): boolean;
  /** Mọi nhân vật trong danh sách có nằm trong khung của máy ảnh không. */
  allInFrame(cam: THREE.PerspectiveCamera, actors: string[]): boolean;
  /** Ẩn/hiện các thứ không được dính vào ảnh (vòng đánh dấu, mũi tên). */
  setGizmosVisible(v: boolean): void;
  /** Đọc tọa độ marker (`spot.*`, `itr.*`, `spawn.*`, …) theo ID từ bản đồ. */
  markerSpot(id: string): MarkerSpot | null;
  /** Di chuyển actor ('player' hoặc 'NPC_*') mượt tới marker, tránh vật cản đơn giản. */
  moveActor(actor: string, toMarkerId: string, pace?: 'walk' | 'run', opts?: MoveActorOptions): Promise<void>;
  /** Dịch chuyển tức thời actor tới marker, cập nhật collider & hướng mặt. */
  teleportActor(actor: string, toMarkerId: string): boolean;
  /** Quay mặt actor về phía actor khác ('player' / 'NPC_*') hoặc marker ID. */
  faceActor(actor: string, toward: string): void;
  /** Đặt motion cho actor ('idle' trả player về điều khiển tự do). */
  setActorMotion(actor: string, motion: string): void;
  /** Ẩn/hiện actor; nếu là NPC thì đồng thời vô hiệu hóa/kích hoạt lại tương tác & collider. */
  setActorVisible(actor: string, visible: boolean): void;
  /** Trạng thái camera/điều khiển — cho công cụ test. */
  debug(): { yaw: number; pitch: number; distance: number; cameraDistance: number; locked: boolean; preset: string; state: string; y: number; facing: number };
  setActorProp(actor: string, propId: string | null): void;
  dispose(): void;
}

const VALID_MOTIONS = new Set<Motion>(['idle', 'walk', 'run', 'talk', 'pose_peace', 'pose_wave', 'pose_tada', 'cheer']);
const turnToward = (cur: number, want: number, k: number) => cur + Math.atan2(Math.sin(want - cur), Math.cos(want - cur)) * Math.min(1, k);

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
      world = await loadWorld(manifest, { openZones: day.open_zones ?? 'all', decorSet: assetDecorSet(variant?.decor_set), style: opts.style ?? ART_STYLES[DEFAULT_ART_STYLE], fetchAsset: opts.fetchAsset, extras: WORLD_EXTRAS[day.map_id] ?? null });
    } catch (e) {
      world = World.placeholder(manifest, e instanceof WorldLoadError ? e.problems : [{ level: 'error', code: 'asset_load_failed', ref: day.map_id, message: String((e as Error)?.message ?? e) }]);
    }
  }
  applySchoolDecor(world.root, decor);
  const presetName = (zone: string | null) => manifest?.zones.find((z) => z.id === zone)?.camera_preset ?? manifest?.camera_preset ?? DEFAULT_CAMERA_PRESET;
  const presetOf = (zone: string | null): CameraPreset => CAMERA_PRESETS[presetName(zone)] ?? CAMERA_PRESETS[DEFAULT_CAMERA_PRESET];

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(light.fog, 45, 140);
  const sunOffset = new THREE.Vector3(...light.sunPos);
  const { hemi, sun } = addDaylight(scene, { sun: sunOffset.clone(), shadowSize: 24 });
  hemi.color.set(light.hemiSky); hemi.groundColor.set(light.hemiGround); hemi.intensity = light.hemiIntensity;
  sun.color.set(light.sunColor); sun.intensity = light.sunIntensity;
  const sky = new THREE.Group();
  const dome = skyDome(light.sky);
  sky.add(dome, clouds());
  scene.add(sky, world.root);
  // Điểm gắn chung cho N-05/N-06/N-07/N-13: hạt, bầu không khí, đồ trang trí procedural (không sửa file này để thêm đồ).
  const fx = createFx(scene);
  const updaters: ((dt: number, t: number) => void)[] = [];
  const dressing = await mountDressing({ scene, world, dayId: day.id, decor, flag: opts.flag ?? (() => undefined), addUpdate: (fn) => { updaters.push(fn); } });
  const gizmos = new THREE.Group(); scene.add(gizmos);

  const bound = bindDay(day, map, world);
  const problems: WorldProblem[] = [...world.problems, ...bound.problems,
    ...dressing.failed.map((f): WorldProblem => ({ level: 'warn', code: 'dressing_failed', ref: f.id, message: `Bộ đồ trang trí "${f.id}" lỗi khi dựng: ${f.message}` }))];
  const groundAt = (p: { x: number; y: number; z: number }) => world.ground(p.x, p.z, p.y) ?? p.y;

  // ---- nhân vật ----
  const rigAdapter = opts.rigAdapter ?? DEFAULT_RIG_ADAPTER;
  const rigOf = (ref: string): CharacterId => {
    const chr = idx.resolveActor(ref);
    const rig = chr?.age_variants[year?.age_variant ?? 'AGE_G6_7']?.rig_id ?? chr?.age_variants.AGE_G6_7?.rig_id ?? 'duc';
    return (rig === 'player' ? GAME_CONFIG.player_rig_by_gender[gender] : rig) as CharacterId;
  };
  const actors = new Map<string, Avatar>();
  const targets: DayTarget[] = [];
  const baseColliders = [...world.collision.shapes];
  const npcTargets = new Map<string, DayTarget>();
  const npcCollidersMap = new Map<string, ColliderShape>();
  const npcVisible = new Map<string, boolean>();
  const syncNpcColliders = () => {
    const active: ColliderShape[] = [];
    for (const [id, col] of npcCollidersMap) if (npcVisible.get(id) !== false) active.push(col);
    world.collision = new CollisionWorld([...baseColliders, ...active]);
  };
  bound.npcs.forEach((n, i) => {
    const avatar = rigAdapter.create({ id: rigOf(n.actor), grade, scarf: decor.scarf, seed: i + 1 });
    const y = groundAt(n);
    avatar.root.position.set(n.x, y, n.z);
    avatar.root.rotation.y = n.facing;
    avatar.setMotion(n.motion as Motion, 0);
    scene.add(avatar.root);
    actors.set(n.actor, avatar);
    const tgt: DayTarget = { id: n.actor, label: idx.resolveActor(n.actor)?.display_name ?? n.actor, position: avatar.root.position, kind: 'npc', radius: GAME_CONFIG.move.interact_radius, zone: world.zoneAt(n.x, n.z) };
    targets.push(tgt);
    npcTargets.set(n.actor, tgt);
    npcVisible.set(n.actor, true);
    // Nhân vật đứng yên cũng là vật cản (không chắn camera).
    npcCollidersMap.set(n.actor, { id: `npc:${n.actor}`, zone: '', type: 'circle', r: 0.3, cx: n.x, cz: n.z, hx: 0.3, hz: 0.3, rot: 0, y0: y, y1: y + avatar.height, blocksCamera: false });
  });
  syncNpcColliders();

  // ---- điểm tương tác: vòng trên mặt đất + chóp nổi ----
  const marks = new Map<string, { gem: THREE.Mesh; baseY: number }>();
  const fallbackSpots = new Map<string, MarkerSpot>();
  for (const it of bound.targets) {
    const y = groundAt(it);
    const pos = new THREE.Vector3(it.x, y, it.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 28), flat('#fff3c4', { transparent: true, opacity: 0.75 }));
    ring.rotation.x = -Math.PI / 2; ring.position.copy(pos).setY(y + 0.03);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), toon('#f2b53a', { emissive: '#7a5200' }));
    gem.position.copy(pos).setY(y + 1.9); gem.visible = false;
    gizmos.add(ring, gem);
    marks.set(it.id, { gem, baseY: y + 1.9 });
    fallbackSpots.set(it.id, { x: it.x, y, z: it.z, facing: it.facing });
    targets.push({ id: it.id, label: it.label, position: pos, kind: it.kind, zone: it.zone, radius: it.radius ?? (it.kind === 'marker' ? GAME_CONFIG.move.area_radius : GAME_CONFIG.move.interact_radius) });
  }
  const standRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), flat('#ffe27a', { transparent: true, opacity: 0.9 }));
  standRing.rotation.x = -Math.PI / 2; standRing.visible = false; gizmos.add(standRing);

  // ---- Player: hình (Avatar) + điều khiển + camera + theo dõi khu ----
  const player = rigAdapter.create({ id: rigOf('player'), grade, scarf: decor.scarf, seed: 0 });
  scene.add(player.root);
  actors.set('player', player);
  const move: MoveConfig = { ...DEFAULT_MOVE, walk: GAME_CONFIG.move.walk, run: GAME_CONFIG.move.run };
  const ctl = new PlayerController(world, move);
  const cam = new CameraManager(presetOf(null), world);
  const atmosphere = createAtmosphere(scene, {
    sun, hemi, fx, sky: dome, sunOffset, day, camera: cam.camera, bus: opts.bus, stepId: opts.stepId,
  }, variant?.lighting_preset);
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

  // ---- Đạo diễn actor (R-B1): đọc marker, di chuyển mượt tránh vật cản, quay mặt, ẩn/hiện ----
  const markerSpot = (id: string): MarkerSpot | null => {
    const m = world.find(id);
    if (m) return { x: m.position[0], y: groundAt({ x: m.position[0], y: m.position[1], z: m.position[2] }), z: m.position[2], facing: m.facing };
    return fallbackSpots.get(id) ?? null;
  };
  const resolveForActor = (actor: string, tx: number, tz: number, y: number) => {
    const col = actor === 'player' ? undefined : npcCollidersMap.get(actor);
    const prevY1 = col ? col.y1 : 0;
    if (col) col.y1 = -1e9;
    try { return world.resolve(tx, tz, y, move.body); } finally { if (col) col.y1 = prevY1; }
  };
  const updateNpcState = (actor: string, x: number, y: number, z: number, facing: number, syncCol: boolean) => {
    const av = actors.get(actor);
    if (!av) return;
    av.root.position.set(x, y, z);
    av.root.rotation.y = facing;
    const tgt = npcTargets.get(actor);
    if (tgt) tgt.zone = world.zoneAt(x, z);
    const col = npcCollidersMap.get(actor);
    if (col) {
      col.cx = x; col.cz = z; col.y0 = y; col.y1 = y + av.height;
      if (syncCol) syncNpcColliders();
    }
  };

  interface ActiveMove {
    actor: string;
    to: MarkerSpot;
    pace: 'walk' | 'run';
    opts: MoveActorOptions;
    steerSign: 0 | 1 | -1;
    elapsed: number;
    stuckTime: number;
    waitTime: number;
    waitTimedOut: boolean;
    lastSyncX: number;
    lastSyncZ: number;
    resolve: () => void;
  }
  const activeMoves = new Map<string, ActiveMove>();
  let disposed = false;

  const finishMove = (m: ActiveMove) => {
    if (activeMoves.get(m.actor) !== m) return;
    activeMoves.delete(m.actor);
    const av = actors.get(m.actor);
    if (m.actor === 'player') { ctl.state = 'idle'; ctl.speed = 0; sync(); }
    else if (av) {
      av.setMotion('idle', 0);
      updateNpcState(m.actor, av.root.position.x, av.root.position.y, av.root.position.z, av.root.rotation.y, true);
    }
    m.resolve();
  };

  const stepActorMoves = (dt: number) => {
    if (disposed || dt <= 0 || activeMoves.size === 0) return;
    const STEER_ANGLES = [0.65, 1.15, 1.65];
    for (const m of [...activeMoves.values()]) {
      const av = actors.get(m.actor);
      if (!av) { finishMove(m); continue; }
      const isPlayer = m.actor === 'player';
      let cx = isPlayer ? ctl.x : av.root.position.x;
      let cy = isPlayer ? ctl.y : av.root.position.y;
      let cz = isPlayer ? ctl.z : av.root.position.z;
      let cf = isPlayer ? ctl.facing : av.root.rotation.y;

      const dx = m.to.x - cx, dz = m.to.z - cz;
      const dist = Math.hypot(dx, dz);
      if (dist <= 0.25) {
        const r = resolveForActor(m.actor, m.to.x, m.to.z, cy);
        const g = world.ground(r.x, r.z, cy);
        if (g !== null && g - cy <= move.max_step_up && Math.hypot(r.x - m.to.x, r.z - m.to.z) < 0.2) {
          if (isPlayer) { ctl.x = r.x; ctl.y = g; ctl.z = r.z; sync(); }
          else { av.root.position.set(r.x, g, r.z); }
        }
        finishMove(m);
        continue;
      }

      if (m.opts.leadPlayer && !isPlayer) {
        const leadDist = m.opts.leadDistance ?? 6;
        const leadTimeout = m.opts.leadTimeout ?? 6;
        const pd = Math.hypot(ctl.x - cx, ctl.z - cz);
        if (m.waitTimedOut && pd <= leadDist * 0.8) { m.waitTimedOut = false; m.waitTime = 0; }
        if (!m.waitTimedOut && pd > leadDist) {
          m.waitTime += dt;
          if (m.waitTime < leadTimeout) {
            av.setMotion('idle', 0);
            av.root.rotation.y = turnToward(cf, Math.atan2(ctl.x - cx, ctl.z - cz), dt * move.turn_sharpness);
            continue;
          }
          m.waitTimedOut = true;
        }
      }

      const speed = m.pace === 'run' ? move.run : move.walk;
      m.elapsed += dt;
      if (m.elapsed >= (m.opts.maxDuration ?? 20)) { finishMove(m); continue; }

      const tryStep = (nx: number, ny: number, nz: number, tx: number, tz: number) => {
        const r = resolveForActor(m.actor, tx, tz, ny);
        const g = world.ground(r.x, r.z, ny);
        if (g === null || g - ny > move.max_step_up) return null;
        return { x: r.x, y: g, z: r.z, hit: r.hit, moved: Math.hypot(r.x - nx, r.z - nz) };
      };

      const stepTotal = Math.min(dist, speed * dt);
      const subCount = Math.max(1, Math.ceil(stepTotal / (move.body.radius * 0.5)));
      const subLen = stepTotal / subCount;
      let nx = cx, ny = cy, nz = cz;
      for (let i = 0; i < subCount; i++) {
        const sdx = m.to.x - nx, sdz = m.to.z - nz, sdist = Math.hypot(sdx, sdz);
        if (sdist <= 0.05) break;
        const ux = sdx / sdist, uz = sdz / sdist;
        const direct = tryStep(nx, ny, nz, nx + ux * subLen, nz + uz * subLen);
        const forwardProgress = direct ? (direct.x - nx) * ux + (direct.z - nz) * uz : 0;
        if (direct && forwardProgress > subLen * 0.35) {
          nx = direct.x; ny = direct.y; nz = direct.z;
          if (!direct.hit) m.steerSign = 0;
          continue;
        }
        // Tránh vật cản: chọn phía rẽ có khoảng trống tốt hơn và giữ hướng rẽ tới khi thoáng
        if (m.steerSign === 0) {
          const la = Math.max(move.body.radius * 1.5, subLen * 3);
          const score = (sign: 1 | -1) => {
            const a = sign * 0.85, c = Math.cos(a), s = Math.sin(a);
            const rx = ux * c - uz * s, rz = ux * s + uz * c;
            const p = tryStep(nx, ny, nz, nx + rx * la, nz + rz * la);
            return p ? p.moved - (p.hit ? la * 0.25 : 0) : -1;
          };
          m.steerSign = score(1) >= score(-1) ? 1 : -1;
        }
        let stepped = false;
        for (const sign of [m.steerSign, -m.steerSign as 1 | -1]) {
          for (const ang of STEER_ANGLES) {
            const a = sign * ang, c = Math.cos(a), s = Math.sin(a);
            const rx = ux * c - uz * s, rz = ux * s + uz * c;
            const cand = tryStep(nx, ny, nz, nx + rx * subLen, nz + rz * subLen);
            if (cand && cand.moved > subLen * 0.25) {
              nx = cand.x; ny = cand.y; nz = cand.z;
              m.steerSign = sign;
              stepped = true;
              break;
            }
          }
          if (stepped) break;
        }
        if (!stepped && direct && direct.moved > 1e-4) {
          nx = direct.x; ny = direct.y; nz = direct.z;
        }
      }

      const moved = Math.hypot(nx - cx, nz - cz);
      if (moved < speed * dt * 0.12) {
        m.stuckTime += dt;
        if (m.stuckTime >= 1.5) { finishMove(m); continue; }
      } else {
        m.stuckTime = 0;
      }

      if (moved > 1e-4) {
        cf = turnToward(cf, Math.atan2(nx - cx, nz - cz), dt * move.turn_sharpness);
      }
      const actualSpeed = dt > 0 ? moved / dt : speed;
      if (isPlayer) {
        ctl.x = nx; ctl.y = ny; ctl.z = nz; ctl.facing = cf;
        ctl.state = m.pace; ctl.speed = actualSpeed;
        sync();
        handle(tracker.update(ctl.x, ctl.z));
      } else {
        av.setMotion(m.pace, actualSpeed);
        const needSync = Math.hypot(nx - m.lastSyncX, nz - m.lastSyncZ) >= 0.35;
        if (needSync) { m.lastSyncX = nx; m.lastSyncZ = nz; }
        updateNpcState(m.actor, nx, ny, nz, cf, needSync);
      }
    }
  };

  const cancelMove = (actor: string) => {
    const prev = activeMoves.get(actor);
    if (!prev) return;
    activeMoves.delete(actor);
    prev.resolve();
  };

  return {
    scene, camera: cam.camera, targets, playerPosition: player.root.position, problems,
    get placeholder() { return world.isPlaceholder; },
    get zone() { return tracker.zone; },
    get onZoneChange() { return onZoneChange; },
    set onZoneChange(fn) { onZoneChange = fn; },
    update(dt, t, c) {
      const playerAuto = activeMoves.has('player');
      if (!playerAuto) {
        ctl.update(dt, c.move, cam.yaw);
        if (c.move) handle(tracker.update(ctl.x, ctl.z));
        sync();
      }
      stepActorMoves(dt);
      const motion: Motion = forcedMotion ?? ctl.state;
      player.setMotion(motion, motion === 'run' ? move.run : motion === 'walk' ? move.walk : 0);
      for (const a of actors.values()) a.update(dt);
      cam.update(dt, ctl, c.look);
      sky.position.set(cam.camera.position.x, 0, cam.camera.position.z);
      atmosphere.update(dt);
      followSun();
      for (const m of marks.values()) if (m.gem.visible) { m.gem.rotation.y = t * 1.6; m.gem.position.y = m.baseY + Math.sin(t * 2.4) * 0.08; }
      fx.update(dt);
      for (const fn of updaters) fn(dt, t);
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
    lockWeatherCamera(stepId) {
      const preset = day.weather_by_step?.[stepId];
      const marker = preset && LIGHTING_PRESETS[preset]?.cutsceneMarker;
      if (!marker) return false;
      const shot = bindCamera({ id: marker, marker, fov: 55 }, world);
      if (!shot) return false;
      cam.lock(shot);
      return true;
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
    markerSpot,
    moveActor(actor, toMarkerId, pace = 'walk', opts = {}) {
      if (disposed) return Promise.resolve();
      const av = actors.get(actor);
      const to = markerSpot(toMarkerId);
      if (!av || !to) {
        if (!to) console.warn(`[dayScene] moveActor: không thấy marker "${toMarkerId}"`);
        return Promise.resolve();
      }
      cancelMove(actor);
      if (actor === 'player') forcedMotion = null;
      const cx = actor === 'player' ? ctl.x : av.root.position.x;
      const cz = actor === 'player' ? ctl.z : av.root.position.z;
      if (Math.hypot(to.x - cx, to.z - cz) <= 0.1) {
        if (actor === 'player') { ctl.state = 'idle'; ctl.speed = 0; }
        else av.setMotion('idle', 0);
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        activeMoves.set(actor, {
          actor, to, pace, opts, steerSign: 0, elapsed: 0, stuckTime: 0, waitTime: 0, waitTimedOut: false,
          lastSyncX: cx, lastSyncZ: cz, resolve,
        });
      });
    },
    teleportActor(actor, toMarkerId) {
      const av = actors.get(actor);
      const spot = markerSpot(toMarkerId);
      if (!av || !spot) {
        if (!spot) console.warn(`[dayScene] teleportActor: không thấy marker "${toMarkerId}"`);
        return false;
      }
      cancelMove(actor);
      if (actor === 'player') {
        forcedMotion = null;
        place({ x: spot.x, y: spot.y, z: spot.z, facing: spot.facing }, true);
      } else {
        const r = resolveForActor(actor, spot.x, spot.z, spot.y);
        const g = world.ground(r.x, r.z, spot.y);
        const rx = g !== null ? r.x : spot.x, rz = g !== null ? r.z : spot.z, ry = g ?? spot.y;
        av.setMotion('idle', 0);
        updateNpcState(actor, rx, ry, rz, spot.facing, true);
      }
      return true;
    },
    faceActor(actor, toward) {
      const av = actors.get(actor);
      if (!av) return;
      const other = actors.get(toward);
      const spot = other ? null : markerSpot(toward);
      const tx = other ? (toward === 'player' ? ctl.x : other.root.position.x) : spot?.x;
      const tz = other ? (toward === 'player' ? ctl.z : other.root.position.z) : spot?.z;
      if (tx === undefined || tz === undefined) return;
      const sx = actor === 'player' ? ctl.x : av.root.position.x;
      const sz = actor === 'player' ? ctl.z : av.root.position.z;
      const dx = tx - sx, dz = tz - sz;
      if (Math.hypot(dx, dz) < 1e-4) return;
      const yaw = Math.atan2(dx, dz);
      if (actor === 'player') { ctl.facing = yaw; sync(); }
      else av.root.rotation.y = yaw;
    },
    setActorMotion(actor, motion) {
      if (!VALID_MOTIONS.has(motion as Motion)) {
        console.warn(`[dayScene] setActorMotion: motion không hợp lệ "${motion}"`);
        return;
      }
      const m = motion as Motion;
      if (actor === 'player') {
        forcedMotion = m === 'idle' ? null : m;
        player.setMotion(m, 0);
      } else {
        actors.get(actor)?.setMotion(m, 0);
      }
    },
    setActorVisible(actor, visible) {
      const av = actors.get(actor);
      if (!av) return;
      av.root.visible = visible;
      if (actor !== 'player') {
        npcVisible.set(actor, visible);
        const tgt = npcTargets.get(actor);
        if (tgt) {
          const idxInTargets = targets.indexOf(tgt);
          if (visible && idxInTargets < 0) targets.push(tgt);
          else if (!visible && idxInTargets >= 0) targets.splice(idxInTargets, 1);
        }
        syncNpcColliders();
      }
    },
    debug: () => ({ yaw: cam.yaw, pitch: cam.pitch, distance: cam.distance, cameraDistance: cam.current, locked: cam.isLocked, preset: presetName(tracker.zone), state: ctl.state, y: ctl.y, facing: ctl.facing }),
    setActorProp(actor, propId) { actors.get(actor)?.setProp?.(propId); },
    dispose() {
      disposed = true;
      for (const m of [...activeMoves.values()]) { activeMoves.delete(m.actor); m.resolve(); }
      dressing.dispose(); atmosphere.dispose(); dome.material.dispose(); fx.dispose(); updaters.length = 0; disposeScene(scene); world.dispose();
    },
  };
}
