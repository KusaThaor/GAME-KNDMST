/**
 * Camera và phím điều khiển trong Ngày ký ức. Mọi số ở đây CHỈNH ĐƯỢC mà không sửa code hệ thống.
 *
 * Nguồn: GDD v0.3 §3 — camera thứ ba (CONFIRMED), nhìn chéo xuống 25–40°, cách 5,5 m (zoom 3,5–8 m),
 * tự kéo gần khi bị che. Hai kiểu điều khiển A/B "thử ở spike, chưa chốt" → cả hai đều có, người chơi đổi bằng phím.
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

/** Kiểu điều khiển camera. `look`: 'drag' = giữ chuột phải rồi rê; 'lock' = khóa con trỏ, rê chuột là xoay, Esc để thoát. */
export interface CameraModeDef { label: string; look: 'drag' | 'lock'; hint: string }
export type CameraModeId = 'A' | 'B';
export const CAMERA_MODES: Record<CameraModeId, CameraModeDef> = {
  A: { label: 'Kiểu A', look: 'drag', hint: 'Giữ chuột phải để xoay camera' },
  B: { label: 'Kiểu B', look: 'lock', hint: 'Bấm vào màn hình để khóa chuột · Esc để thả' },
};
/** D-S2-01 (chưa chốt): kiểu mặc định cho người chơi mới. */
export const DEFAULT_CAMERA_MODE: CameraModeId = 'A';

export const LOOK_SENSITIVITY = { yaw: 0.0045, pitch: 0.003, zoom_step: 0.5 };

/** Phím (mã `KeyboardEvent.code`). Phím C để dành cho máy ảnh cầm tay/cuộn phim (GDD v0.3 §3) — không gán việc khác. */
export const CONTROLS = {
  forward: ['KeyW', 'ArrowUp'], back: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  run: ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE'],
  camera_mode: ['KeyV'],
  journal: ['KeyJ', 'Tab'],
  film_camera: ['KeyC'],
  menu: ['Escape'],
} as const;
export type ControlAction = keyof typeof CONTROLS;
export const isControl = (action: ControlAction, code: string) => (CONTROLS[action] as readonly string[]).includes(code);
