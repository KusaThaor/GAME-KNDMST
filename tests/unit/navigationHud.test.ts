import { describe, expect, it } from 'vitest';
import { computeCompass, computeMapBounds, regionCorners, resolvePrimaryTargetId } from '../../src/game/runtime/navigationHud';
import { regionContains } from '../../src/world/collision';

describe('navigationHud — mũi tên chỉ đường & bản đồ 2D', () => {
  const targets = [
    { id: 'NPC_DUC', label: 'Đức', kind: 'npc' as const, position: { x: 10, z: 0 } },
    { id: 'itr.board', label: 'Bảng đen', kind: 'object' as const, position: { x: 0, z: -20 } },
    { id: 'itr.side', label: 'Ghế đá', kind: 'object' as const, position: { x: 2, z: 2 } },
  ];

  it('resolvePrimaryTargetId ưu tiên mục tiêu của bước Main trước Side/Daily', () => {
    const id = resolvePrimaryTargetId(
      {
        mainStep: () => ({ step: { id: 's1', kind: 'talk', with: 'NPC_DUC', lines: [] } }),
        targetsOfInterest: () => ['itr.side', 'NPC_DUC'],
      },
      targets,
      { x: 0, z: 0 },
    );
    expect(id).toBe('NPC_DUC');
  });

  it('resolvePrimaryTargetId chọn mục tiêu collect gần nhất còn lại', () => {
    const id = resolvePrimaryTargetId(
      {
        mainStep: () => ({
          step: { id: 's2', kind: 'collect', item: 'vật phẩm', targets: ['itr.board', 'itr.side'], count: 2 },
        }),
        targetsOfInterest: () => ['itr.board'],
      },
      targets,
      { x: 0, z: 0 },
    );
    expect(id).toBe('itr.board');
  });

  it('resolvePrimaryTargetId rơi về mục tiêu gần nhất trong allowedIds khi không có mainStep', () => {
    const id = resolvePrimaryTargetId(
      {
        mainStep: () => null,
        targetsOfInterest: () => ['itr.board', 'itr.side'],
      },
      targets,
      { x: 0, z: 0 },
      new Set(['itr.board']),
    );
    expect(id).toBe('itr.board');
  });

  it('computeCompass tính đúng góc so với hướng nhìn camera', () => {
    const ahead = computeCompass({ x: 0, z: 0 }, 0, { label: 'A', position: { x: 0, z: -10 } });
    expect(ahead.distance).toBeCloseTo(10, 5);
    expect(ahead.angleDeg).toBeCloseTo(0, 5);

    const right = computeCompass({ x: 0, z: 0 }, 0, { label: 'B', position: { x: 10, z: 0 } });
    expect(right.angleDeg).toBeCloseTo(90, 5);

    const behind = computeCompass({ x: 0, z: 0 }, 0, { label: 'C', position: { x: 0, z: 10 } });
    expect(Math.abs(behind.angleDeg)).toBeCloseTo(180, 5);

    // Camera xoay yaw = +pi/2 (đứng phía +x nhìn về -x)
    const rotated = computeCompass({ x: 0, z: 0 }, Math.PI / 2, { label: 'D', position: { x: -10, z: 0 } });
    expect(rotated.angleDeg).toBeCloseTo(0, 5);
  });

  it('regionCorners khớp ngược hoàn toàn với regionContains khi xoay', () => {
    const region = { cx: 12, cz: -8, hx: 5, hz: 3, rot: 0.65, y0: 0, y1: 2 };
    const corners = regionCorners(region);
    expect(corners).toHaveLength(4);
    for (const [x, z] of corners) {
      expect(regionContains(region, x, z, 1e-6)).toBe(true);
    }
    const bounds = computeMapBounds([region], [], 2);
    for (const [x, z] of corners) {
      expect(x).toBeGreaterThanOrEqual(bounds.minX);
      expect(x).toBeLessThanOrEqual(bounds.maxX);
      expect(z).toBeGreaterThanOrEqual(bounds.minZ);
      expect(z).toBeLessThanOrEqual(bounds.maxZ);
    }
  });
});
