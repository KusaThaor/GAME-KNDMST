/**
 * Cấu hình Hub 2026 — điểm CHƯA CHỐT (D-13 tông phòng, D-15 tên ứng dụng) nằm ở đây.
 * Preset ánh sáng chọn theo số Ngày đã xong; đổi tông = đổi bảng này, không sửa engine.
 */
export interface HubLightPreset { background: string; ambient: string; ambientIntensity: number; key: string; keyIntensity: number; window: 'rain' | 'cloudy' | 'sunny' }

export interface HubConfig {
  /** Tên ứng dụng nhắn tin hư cấu (D-15: tự nghĩ hoàn toàn). */
  app_chat_name: string;
  /** D-13: có hiện Player trưởng thành trong phòng không. */
  show_adult_player: boolean;
  /** Mốc theo số Ngày đã xong → tên preset. Lấy mốc lớn nhất không vượt quá số Ngày đã xong. */
  lighting_by_days_done: { min_days_done: number; preset: string }[];
  presets: Record<string, HubLightPreset>;
}

export const HUB_CONFIG: HubConfig = {
  app_chat_name: '[PLACEHOLDER] Ứng dụng nhắn tin',
  show_adult_player: false,
  // Phương án đang khuyến nghị ở D-13 ("lạnh rồi ấm dần") — CHƯA CHỐT.
  lighting_by_days_done: [
    { min_days_done: 0, preset: 'cold' },
    { min_days_done: 1, preset: 'cool' },
    { min_days_done: 2, preset: 'warm' },
  ],
  presets: {
    cold: { background: '#2b3442', ambient: '#9fb4d6', ambientIntensity: 0.75, key: '#cfe0ff', keyIntensity: 0.9, window: 'rain' },
    cool: { background: '#3a4250', ambient: '#c2cbdc', ambientIntensity: 0.9, key: '#ffe9c4', keyIntensity: 1.1, window: 'cloudy' },
    warm: { background: '#5a4a3c', ambient: '#ffe6c0', ambientIntensity: 1.05, key: '#ffd9a0', keyIntensity: 1.5, window: 'sunny' },
  },
};

export function hubLightPresetName(cfg: HubConfig, daysDone: number): string {
  let name = cfg.lighting_by_days_done[0]?.preset ?? Object.keys(cfg.presets)[0];
  for (const row of cfg.lighting_by_days_done) if (daysDone >= row.min_days_done) name = row.preset;
  return name;
}
