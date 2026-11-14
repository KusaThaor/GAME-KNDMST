/**
 * Scene một Ngày ký ức: nạp 1 bản đồ + 1 biến thể (school_year → decor + preset ánh sáng), đặt NPC, điểm tương tác.
 *
 * TẠM THỜI: S2 (bản đồ đủ 6 khu, điều khiển, camera A/B, va chạm) chưa có trên nhánh dev, nên file này dùng
 * "góc sân" của S1 và một bộ điều khiển tối giản (WASD + camera theo sau, chưa có va chạm).
 * Khi S2 vào: thay phần `// --- điều khiển tạm` và `buildYardCorner`; phần còn lại (NPC, điểm tương tác, máy ảnh) giữ nguyên.
 */
import * as THREE from 'three';
import { CharacterAnimator, type Motion } from '../../actors/character/animate';
import { buildCharacter, type CharacterRig } from '../../actors/character/build';
import type { CharacterId } from '../../actors/character/presets';
import { GAME_CONFIG } from '../../config/game';
import type { ContentIndex } from '../../content/indexContent';
import type { CameraPoint, Gender, MemoryDay } from '../../content/types';
import { toon, flat } from '../../render/materials';
import { addDaylight } from '../../render/stage';
import { buildYardCorner } from '../../world/school/yardCorner';
import { DECOR_SETS, DEFAULT_DECOR, DEFAULT_LIGHTING, LIGHTING_PRESETS } from '../../world/variants';
import type { GameInput } from '../input';
import { disposeScene } from '../view';

export interface DayTarget { id: string; label: string; position: THREE.Vector3; kind: 'npc' | 'object' | 'marker'; radius: number }

export interface DayScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  targets: DayTarget[];
  playerPosition: THREE.Vector3;
  /** Cập nhật mỗi khung hình. `input` = null khi đang khóa điều khiển (thoại, ảnh xem trước…). */
  update(dt: number, t: number, input: GameInput | null): void;
  nearest(): DayTarget | null;
  teleport(x: number, z: number, facing?: number): void;
  setHighlights(ids: string[]): void;
  setStandZone(zone: { center: [number, number]; radius: number } | null): void;
  setPlayerMotion(m: Motion | null): void;
  /** Máy ảnh ảo đặt sẵn (khai trong nội dung của Ngày). */
  cameraFor(point: CameraPoint): THREE.PerspectiveCamera;
  /** Mọi nhân vật trong danh sách có nằm trong khung của máy ảnh không. */
  allInFrame(cam: THREE.PerspectiveCamera, actors: string[]): boolean;
  /** Ẩn/hiện các thứ không được dính vào ảnh (vòng đánh dấu, mũi tên). */
  setGizmosVisible(v: boolean): void;
  dispose(): void;
}

const GRADE_FOR_VARIANT = { AGE_G6_7: 6, AGE_G8_9: 9 } as const;

export function buildDayScene(day: MemoryDay, idx: ContentIndex, gender: Gender): DayScene {
  const map = idx.pack.maps.find((m) => m.id === day.map_id);
  const variant = map?.variants.find((v) => v.variant_id === day.map_variant);
  const decor = DECOR_SETS[variant?.decor_set ?? ''] ?? DEFAULT_DECOR;
  const light = LIGHTING_PRESETS[variant?.lighting_preset ?? ''] ?? DEFAULT_LIGHTING;
  const year = idx.pack.school_years.find((y) => y.id === day.school_year_id);
  const grade = GRADE_FOR_VARIANT[(year?.age_variant ?? 'AGE_G6_7') as keyof typeof GRADE_FOR_VARIANT] ?? 6;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(light.fog, 45, 140);
  const { hemi, sun } = addDaylight(scene, { sun: new THREE.Vector3(...light.sunPos), shadowSize: 22 });
  hemi.color.set(light.hemiSky); hemi.groundColor.set(light.hemiGround); hemi.intensity = light.hemiIntensity;
  sun.color.set(light.sunColor); sun.intensity = light.sunIntensity; sun.target.position.set(-2, 0, -2);

  const yard = buildYardCorner({ phuongBloom: decor.phuongBloom, sky: light.sky });
  scene.add(yard.root);
  const gizmos = new THREE.Group(); scene.add(gizmos);

  if (decor.puddles) {
    const mat = toon('#8fa9b8', { outline: false, transparent: true, opacity: 0.55 });
    for (const [x, z, r] of [[2.5, 2.2, 1.1], [-9.5, 5.5, 0.8], [8, 7, 1.3]] as const) {
      const p = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.012, z); scene.add(p);
    }
  }

  // ---- nhân vật ----
  const rigOf = (ref: string): CharacterId => {
    const chr = idx.resolveActor(ref);
    const rig = chr?.age_variants[year?.age_variant ?? 'AGE_G6_7']?.rig_id ?? chr?.age_variants.AGE_G6_7?.rig_id ?? 'duc';
    return (rig === 'player' ? GAME_CONFIG.player_rig_by_gender[gender] : rig) as CharacterId;
  };
  const actors = new Map<string, { rig: CharacterRig; anim: CharacterAnimator }>();
  const targets: DayTarget[] = [];
  day.npc_placements.forEach((n, i) => {
    const rig = buildCharacter(rigOf(n.actor), grade, { scarf: decor.scarf });
    rig.root.position.set(n.position[0], 0, n.position[1]);
    rig.root.rotation.y = n.facing ?? 0;
    scene.add(rig.root);
    const anim = new CharacterAnimator(rig, i + 1);
    anim.setMotion((n.motion as Motion) ?? 'idle'); anim.speed = 0;
    actors.set(n.actor, { rig, anim });
    const chr = idx.resolveActor(n.actor);
    targets.push({ id: n.actor, label: chr?.display_name ?? n.actor, position: rig.root.position, kind: 'npc', radius: GAME_CONFIG.move.interact_radius });
  });

  // ---- điểm tương tác: vòng trên mặt đất + chóp nổi ----
  const marks = new Map<string, { ring: THREE.Mesh; gem: THREE.Mesh }>();
  for (const it of day.interactables) {
    const pos = new THREE.Vector3(it.position[0], 0, it.position[1]);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 28), flat('#fff3c4', { transparent: true, opacity: 0.75 }));
    ring.rotation.x = -Math.PI / 2; ring.position.copy(pos).setY(0.03);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), toon('#f2b53a', { emissive: '#7a5200' }));
    gem.position.copy(pos).setY(1.9); gem.visible = false;
    gizmos.add(ring, gem);
    marks.set(it.id, { ring, gem });
    targets.push({ id: it.id, label: it.label, position: pos, kind: it.kind, radius: it.kind === 'marker' ? GAME_CONFIG.move.area_radius : GAME_CONFIG.move.interact_radius });
  }
  const standRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), flat('#ffe27a', { transparent: true, opacity: 0.9 }));
  standRing.rotation.x = -Math.PI / 2; standRing.visible = false; gizmos.add(standRing);

  // ---- Player + điều khiển tạm ----
  const spawn = map?.spawn_points.find((p) => p.id === day.spawn_point) ?? map?.spawn_points[0];
  const playerRig = buildCharacter(rigOf('player'), grade, { scarf: decor.scarf });
  const playerAnim = new CharacterAnimator(playerRig, 0);
  playerRig.root.position.set(spawn?.position[0] ?? 0, 0, spawn?.position[1] ?? 6);
  playerRig.root.rotation.y = spawn?.facing ?? Math.PI;
  scene.add(playerRig.root);
  actors.set('player', { rig: playerRig, anim: playerAnim });

  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 400);
  const cam = { yaw: (spawn?.facing ?? Math.PI) + Math.PI, dist: GAME_CONFIG.camera.distance as number, pitch: THREE.MathUtils.degToRad(GAME_CONFIG.camera.pitch_deg) };
  let forcedMotion: Motion | null = null;
  const tmp = new THREE.Vector3();
  const placeCamera = () => {
    const p = playerRig.root.position;
    const h = Math.cos(cam.pitch) * cam.dist;
    camera.position.set(p.x + Math.sin(cam.yaw) * h, 0.9 + Math.sin(cam.pitch) * cam.dist, p.z + Math.cos(cam.yaw) * h);
    camera.lookAt(tmp.set(p.x, 1.0, p.z));
  };
  placeCamera();

  return {
    scene, camera, targets, playerPosition: playerRig.root.position,
    update(dt, t, input) {
      // --- điều khiển tạm (thay khi S2 vào)
      let moving = false, run = false;
      if (input) {
        cam.yaw -= input.takeOrbit();
        cam.dist = THREE.MathUtils.clamp(cam.dist + input.takeZoom(), GAME_CONFIG.camera.min, GAME_CONFIG.camera.max);
        const k = input.down;
        const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
        const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
        if (f || s) {
          moving = true; run = k.has('ShiftLeft') || k.has('ShiftRight');
          const speed = run ? GAME_CONFIG.move.run : GAME_CONFIG.move.walk;
          // hướng "tới" = từ camera nhìn về Player
          const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
          const dx = fx * f - fz * s, dz = fz * f + fx * s;
          const len = Math.hypot(dx, dz) || 1;
          const p = playerRig.root.position, b = GAME_CONFIG.bounds;
          p.x = THREE.MathUtils.clamp(p.x + (dx / len) * speed * dt, b.minX, b.maxX);
          p.z = THREE.MathUtils.clamp(p.z + (dz / len) * speed * dt, b.minZ, b.maxZ);
          const want = Math.atan2(dx, dz);
          let d = want - playerRig.root.rotation.y;
          d = Math.atan2(Math.sin(d), Math.cos(d));
          playerRig.root.rotation.y += d * Math.min(1, dt * 12);
          playerAnim.speed = speed;
        }
      }
      const motion: Motion = forcedMotion ?? (moving ? (run ? 'run' : 'walk') : 'idle');
      if (playerAnim.motion !== motion) { if (!moving) playerAnim.speed = 0; playerAnim.setMotion(motion); }
      for (const a of actors.values()) a.anim.update(dt);
      yard.update(t);
      for (const m of marks.values()) if (m.gem.visible) { m.gem.rotation.y = t * 1.6; m.gem.position.y = 1.9 + Math.sin(t * 2.4) * 0.08; }
      placeCamera();
    },
    nearest() {
      let best: DayTarget | null = null, bestD = Infinity;
      for (const tg of targets) {
        const d = tg.position.distanceTo(playerRig.root.position);
        if (d <= tg.radius && d < bestD) { best = tg; bestD = d; }
      }
      return best;
    },
    teleport(x, z, facing) { playerRig.root.position.set(x, 0, z); if (facing !== undefined) playerRig.root.rotation.y = facing; placeCamera(); },
    setHighlights(ids) { for (const [id, m] of marks) m.gem.visible = ids.includes(id); },
    setStandZone(zone) {
      standRing.visible = !!zone;
      if (zone) { standRing.position.set(zone.center[0], 0.035, zone.center[1]); standRing.scale.setScalar(zone.radius); }
    },
    setPlayerMotion(m) { forcedMotion = m; },
    cameraFor(point) {
      const c = new THREE.PerspectiveCamera(point.fov ?? 40, 4 / 3, 0.1, 400);
      c.position.set(...point.position); c.lookAt(new THREE.Vector3(...point.look_at)); c.updateMatrixWorld(true);
      return c;
    },
    allInFrame(c, refs) {
      c.updateMatrixWorld(true); c.updateProjectionMatrix();
      return refs.every((ref) => {
        const a = actors.get(ref);
        if (!a) return false;
        const head = a.rig.root.position.clone().setY(a.rig.dims.height * 0.85).project(c);
        const feet = a.rig.root.position.clone().setY(0.05).project(c);
        return [head, feet].every((v) => Math.abs(v.x) <= 0.97 && Math.abs(v.y) <= 0.97 && v.z < 1);
      });
    },
    setGizmosVisible(v) { gizmos.visible = v; },
    dispose() { disposeScene(scene); },
  };
}
