import { describe, expect, it } from 'vitest';
import { AVATAR_HEIGHT_RANGE_M, checkAvatarHeight, codeRigAdapter, DEFAULT_RIG_ADAPTER } from '../../src/actors/player/rigAdapter';

describe('CharacterRigAdapter', () => {
  it('adapter mặc định là nhân vật dựng bằng code và trả về Avatar dùng được', () => {
    expect(DEFAULT_RIG_ADAPTER).toBe(codeRigAdapter);
    const a = codeRigAdapter.create({ id: 'duc', grade: 6, seed: 1 });
    expect(a.root.name).toBe('avatar');
    expect(a.height).toBeGreaterThan(0);
    expect(a.motion).toBe('idle');
    a.setMotion('walk', 1);
    expect(a.motion).toBe('walk');
    expect(() => a.update(0.016)).not.toThrow();
  });

  it('khoảng chiều cao chuẩn theo GDD 03 §1.3 (1,30–1,40 m lớp 6; 1,40–1,50 m lớp 9)', () => {
    expect(AVATAR_HEIGHT_RANGE_M[6]).toEqual([1.3, 1.4]);
    expect(AVATAR_HEIGHT_RANGE_M[9]).toEqual([1.4, 1.5]);
  });

  it('checkAvatarHeight báo đúng/sai (dùng để kiểm model GLB sau này)', () => {
    expect(checkAvatarHeight({ height: 1.35 }, 6).ok).toBe(true);
    expect(checkAvatarHeight({ height: 1.45 }, 9).ok).toBe(true);
    expect(checkAvatarHeight({ height: 0.7 }, 6)).toMatchObject({ ok: false, min: 1.3, max: 1.4 });
    expect(checkAvatarHeight({ height: 1.35 }, 9).ok).toBe(false);
  });
});
