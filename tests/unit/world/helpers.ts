import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PlayerController } from '../../../src/actors/player/controller';
import { readAsset } from '../../../scripts/world-cli';
import { WORLD_MANIFESTS } from '../../../src/world/maps';
import type { WorldManifest } from '../../../src/world/types';

export const THCS = WORLD_MANIFESTS.map_thcs;
export const Z = (slug: string) => `zone.thcs.${slug}`;

/** Đọc GLB thật của game từ public/; riêng khu thứ 7 (ví dụ mở rộng) đọc từ tests/unit/fixtures/world/. */
export const readWithFixtures = async (url: string): Promise<ArrayBuffer> => {
  if (url.endsWith('/zone_annex.glb')) {
    const buf = readFileSync(resolve(process.cwd(), 'tests/unit/fixtures/world/zone_annex.glb'));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  return readAsset(url);
};

/** Manifest map_thcs + khu thứ 7 nối với bãi đất — đúng những gì docs/HOW_TO_EXPAND_WORLD.md bảo thêm, không sửa dòng code nào. */
export function manifestWithAnnex(): WorldManifest {
  const m: WorldManifest = JSON.parse(JSON.stringify(THCS));
  m.zones.push({ id: Z('annex'), asset: 'zone_annex.glb', source: 'tools/blender/world/map_thcs/zone_annex.blend', connections: [Z('field')] });
  m.zones.find((z) => z.id === Z('field'))!.connections.push(Z('annex'));
  return m;
}

/**
 * Cho nhân vật tự đi tới một điểm bằng đúng bộ điều khiển của game (giữ phím "tới", camera nhìn về đích).
 * Trả true nếu tới nơi (cách đích < 0,3 m) trong thời gian cho phép.
 */
export function walk(ctl: PlayerController, to: [number, number], opts: { dt?: number; run?: boolean; maxSeconds?: number; onStep?: () => boolean | void } = {}): boolean {
  const dt = opts.dt ?? 1 / 30;
  for (let t = 0; t < (opts.maxSeconds ?? 40); t += dt) {
    const dx = to[0] - ctl.x, dz = to[1] - ctl.z;
    if (Math.hypot(dx, dz) < 0.3) return true;
    ctl.update(dt, { forward: 1, strafe: 0, run: !!opts.run }, Math.atan2(-dx, -dz));
    if (opts.onStep?.() === false) return false;
  }
  return false;
}
