/**
 * CharacterRigAdapter = chỗ cắm model nhân vật. Cảnh (dayScene) chỉ gọi `adapter.create(spec)` và làm việc với `Avatar`,
 * nên đổi từ nhân vật dựng bằng code (hiện tại, chạy được ngay) sang model GLB có xương chỉ cần viết một adapter mới
 * rồi truyền vào `DaySceneOptions.rigAdapter` (hoặc đổi `DEFAULT_RIG_ADAPTER`). Không phải sửa controller, camera, ảnh chụp.
 *
 * Hợp đồng cho adapter GLB (GDD 03 §1.1, §1.3; dùng `checkAvatarHeight` để kiểm):
 *  - Gốc `root` ở chân nhân vật, `min.y = 0`, đơn vị mét, Y lên, mặt nhìn +z khi rotation.y = 0.
 *  - `height` = chiều cao thật (m). Lớp 6–7: 1,30–1,40 m · lớp 8–9: 1,55–1,65 m (GDD 03 §1.3 bản 21/11 tối; dải cũ 1,40–1,50 m đã SUPERSEDED).
 *  - Hỗ trợ đủ `Motion` của `character/animate.ts` (idle, walk, run, talk, pose_peace, pose_wave, pose_tada, cheer).
 *  - Ngân sách: nhân vật chính ≤ 6.000 tam giác / 1,5 MB; học sinh phụ ≤ 2.500 tam giác / 600 KB.
 */
import { buildCharacter } from '../character/build';
import type { CharacterId, Grade } from '../character/presets';
import { rigAvatar, type Avatar } from './avatar';

export interface CharacterSpec {
  id: CharacterId;
  grade: Grade;
  /** Khăn quàng (biến thể năm học). */
  scarf?: boolean;
  /** Hạt giống cho dao động nhỏ giữa các nhân vật (animation thủ tục). */
  seed?: number;
}

export interface CharacterRigAdapter {
  /** Tên để ghi log/lab ("code", "glb"…). */
  readonly name: string;
  create(spec: CharacterSpec): Avatar;
}

/** Nhân vật dựng bằng code (actors/character): chạy ngay, dùng làm fallback. */
export const codeRigAdapter: CharacterRigAdapter = {
  name: 'code',
  create: (spec) => rigAvatar(buildCharacter(spec.id, spec.grade, { scarf: spec.scarf }), spec.seed ?? 0),
};

export const DEFAULT_RIG_ADAPTER: CharacterRigAdapter = codeRigAdapter;

/** Khoảng chiều cao chuẩn (m) theo lớp — GDD 03 §1.3. `Grade` hiện chỉ có 6 và 9 (đầu/cuối Mốc). */
export const AVATAR_HEIGHT_RANGE_M: Record<Grade, readonly [number, number]> = {
  6: [1.3, 1.4],
  9: [1.55, 1.65],
};

export interface HeightCheck { ok: boolean; height: number; min: number; max: number }

/** Kiểm một Avatar có đúng chiều cao chuẩn GDD không (dùng cho adapter GLB và test). */
export function checkAvatarHeight(avatar: Pick<Avatar, 'height'>, grade: Grade): HeightCheck {
  const [min, max] = AVATAR_HEIGHT_RANGE_M[grade];
  return { ok: avatar.height >= min && avatar.height <= max, height: avatar.height, min, max };
}
