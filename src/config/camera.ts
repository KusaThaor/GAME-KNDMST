/**
 * Camera và phím điều khiển trong Ngày ký ức. Mọi số ở đây CHỈNH ĐƯỢC mà không sửa code hệ thống.
 *
 * Nguồn: GDD v0.3 §3 — camera thứ ba (CONFIRMED), nhìn chéo xuống 25–40°, cách 5,5 m (zoom 3,5–8 m),
 * tự kéo gần khi bị che. Kiểu điều khiển: "Chuẩn" (mặc định, D-S2-01 chốt 15/11) + A/B nâng cao; người chơi đổi bằng phím V hoặc menu.
 */
export interface CameraPreset {
  fov: number;
  distance: number; min_distance: number; max_distance: number;
  /** Góc nhìn chéo xuống (độ). */
  pitch_deg: number; min_pitch_deg: number; max_pitch_deg: number;
  /** Điểm camera nhìn vào: cao hơn chân nhân vật bao nhiêu mét. */
  look_height: number;
  /** Độ trễ bám theo (số càng lớn bám càng sát). */
  follow_sharpness: number;
  /** Khoảng hở giữ với vật cản khi camera bị che (m). */
  collide_pad: number;
}

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  follow_default: { fov: 50, distance: 5.5, min_distance: 3.5, max_distance: 8, pitch_deg: 30, min_pitch_deg: 25, max_pitch_deg: 40, look_height: 1.0, follow_sharpness: 10, collide_pad: 0.25 },
  /** Trong nhà (lớp học): gần hơn, dốc hơn để tường ít che. */
  follow_indoor: { fov: 55, distance: 4.2, min_distance: 2.6, max_distance: 6, pitch_deg: 38, min_pitch_deg: 28, max_pitch_deg: 52, look_height: 1.0, follow_sharpness: 10, collide_pad: 0.25 },
};

export const DEFAULT_CAMERA_PRESET = 'follow_default';

/**
 * Kiểu điều khiển camera. `look`:
 *   'free' = kéo chuột trái hoặc phải (qua ngưỡng nhỏ mới tính là kéo), touchpad kéo một ngón, cảm ứng kéo một ngón;
 *   'drag' = chỉ giữ chuột phải rồi rê; 'lock' = khóa con trỏ, rê chuột là xoay, Esc để thoát.
 * Cảm ứng (kéo xoay, chụm phóng) chạy ở mọi kiểu.
 */
export type LookStyle = 'free' | 'drag' | 'lock';
export interface CameraModeDef { label: string; look: LookStyle; hint: string }
export type CameraModeId = 'standard' | 'A' | 'B';
export const CAMERA_MODES: Record<CameraModeId, CameraModeDef> = {
  standard: { label: 'Chuẩn', look: 'free', hint: 'Kéo chuột để xoay camera' },
  A: { label: 'Kiểu A', look: 'drag', hint: 'Giữ chuột phải để xoay camera' },
  B: { label: 'Kiểu B', look: 'lock', hint: 'Bấm vào màn hình để khóa chuột · Esc để thả' },
};
/** Thứ tự khi bấm V. */
export const CAMERA_MODE_ORDER: CameraModeId[] = ['standard', 'A', 'B'];
/** D-S2-01 ĐÃ CHỐT (15/11): mặc định "Chuẩn" — giống game phổ thông (Play Together). A/B là tùy chọn nâng cao. */
export const DEFAULT_CAMERA_MODE: CameraModeId = 'standard';
export const isCameraMode = (v: unknown): v is CameraModeId => typeof v === 'string' && v in CAMERA_MODES;
export const nextCameraMode = (id: CameraModeId): CameraModeId => CAMERA_MODE_ORDER[(CAMERA_MODE_ORDER.indexOf(id) + 1) % CAMERA_MODE_ORDER.length];

/**
 * CHỦ DỰ ÁN CHỐT 16/11: người chơi chỉ dùng camera "Chuẩn", KHÔNG có đổi kiểu camera (A/B) và chưa có "Nhìn tự do".
 * Code A/B/Nhìn tự do vẫn giữ nguyên; đổi `true` để bật lại (nút trên màn hình, nút trong Menu, phím V/L).
 * Bản test có thể bật tạm bằng `?camtest=1` (chỉ để chạy test tự động; production không có).
 * Danh sách nút + câu hướng dẫn cho màn hướng dẫn sau này: docs/CONTROLS_AND_TUTORIAL_NOTES.md.
 */
export const CAMERA_OPTIONS = { allow_mode_switch: false, allow_free_look: false };

/** Chuột / touchpad / cảm ứng. Chỉnh ở đây, không sửa code. */
export const POINTER_INPUT = {
  /** Kéo quá bao nhiêu pixel mới tính là xoay camera (dưới ngưỡng = bấm). */
  drag_threshold_px: { mouse: 6, touch: 10 },
  /** Cảm ứng xoay nhanh hơn chuột bao nhiêu lần (màn điện thoại nhỏ). */
  touch_look_scale: 1.4,
  /** Chụm 2 ngón: khoảng cách 2 ngón đổi bao nhiêu pixel = 1 nấc zoom. */
  pinch_px_per_step: 40,
  /** Lăn chuột/cuộn 2 ngón touchpad: bao nhiêu pixel = 1 nấc zoom (1 nấc chuột thường ≈ 100 px). */
  wheel_px_per_step: 100,
  /** Chụm trên touchpad (trình duyệt gửi `wheel` kèm ctrlKey, số nhỏ): bao nhiêu pixel = 1 nấc. */
  wheel_pinch_px_per_step: 12,
  /** Một sự kiện lăn không quá bấy nhiêu nấc. */
  wheel_max_steps_per_event: 1,
  /**
   * Touchpad vuốt 2 ngón theo chiều NGANG = xoay camera (không cần nhấn mặt touchpad → tay kia vẫn giữ WASD để đi).
   * Vuốt dọc vẫn là zoom. Mỗi lần vuốt chỉ theo một hướng (chọn ở sự kiện đầu), nghỉ quá `gesture_gap_ms` là lần vuốt mới.
   * `px_scale`: 1 px vuốt = bao nhiêu px kéo chuột. Thấy xoay NGƯỢC chiều trên máy thật → đổi dấu (ví dụ -1).
   * `max_px_per_event`: chặn số lạ từ một số máy.
   */
  wheel_look: { enabled: true, px_scale: 1, gesture_gap_ms: 160, max_px_per_event: 120 },
  /** Nút tròn ảo (cảm ứng): bán kính (px), vùng chết, kéo tới bao xa (tỉ lệ bán kính) thì chạy. */
  joystick: { radius_px: 56, dead_zone: 0.18, run_at: 0.85 },
};
export type PointerInputConfig = typeof POINTER_INPUT;

export const LOOK_SENSITIVITY = { yaw: 0.0045, pitch: 0.003, zoom_step: 0.5 };

/** Phím (mã `KeyboardEvent.code`). Phím C để dành cho máy ảnh cầm tay/cuộn phim (GDD v0.3 §3) — không gán việc khác. */
export const CONTROLS = {
  forward: ['KeyW', 'ArrowUp'], back: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  run: ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE'],
  camera_mode: ['KeyV'],
  /** Bật/tắt "Nhìn tự do" (khóa con trỏ, rê touchpad/chuột để nhìn). */
  free_look: ['KeyL'],
  journal: ['KeyJ', 'Tab'],
  film_camera: ['KeyC'],
  menu: ['Escape'],
} as const;
export type ControlAction = keyof typeof CONTROLS;
export const isControl = (action: ControlAction, code: string) => (CONTROLS[action] as readonly string[]).includes(code);
