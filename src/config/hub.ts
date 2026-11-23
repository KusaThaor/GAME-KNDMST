/**
 * Cấu hình Hub 2026 — các điểm có thể đổi mà không sửa engine nằm ở đây.
 * Preset ánh sáng chọn theo số Ngày đã xong; đổi tông = đổi bảng này, không sửa engine.
 */
export interface HubLightPreset {
  background: string; ambient: string; ambientIntensity: number; key: string; keyIntensity: number;
  window: 'rain' | 'cloudy' | 'sunny' | 'night';
  /** Độ sáng đèn bàn (0 = tắt). */
  lamp: number;
}

/** Tỉ số ván caro: số ván của phe Quân / phe Đức (`caro.series` trong bản lưu v3, GDD 02 §4.2). */
export interface CaroSeries { quan: number; duc: number }

export interface HubConfig {
  /** Tên ứng dụng nhắn tin hư cấu (D-15: tự nghĩ hoàn toàn). */
  app_chat_name: string;
  /** D-13: có hiện Player trưởng thành trong phòng không. */
  show_adult_player: boolean;
  /** B8 (HUMAN_CANON, Mục 0.2): nhóm chat cũ không có dòng chat nào, chỉ một dòng trạng thái này. */
  old_chat_last_label: string;
  /** B9b: tỉ số caro khi chưa có kết quả ván truyện. */
  caro_series_default: CaroSeries;
  /** Mốc theo số Ngày đã xong → tên preset. Lấy mốc lớn nhất không vượt quá số Ngày đã xong. */
  lighting_by_days_done: { min_days_done: number; preset: string }[];
  presets: Record<string, HubLightPreset>;
  /** Màu ô kính cửa sổ theo kiểu trời của preset. */
  window_colors: Record<HubLightPreset['window'], string>;
}

export const HUB_CONFIG: HubConfig = {
  app_chat_name: '[PLACEHOLDER] Ứng dụng nhắn tin',
  show_adult_player: false,
  old_chat_last_label: 'tin cuối cùng đã từ rất lâu',
  caro_series_default: { quan: 3, duc: 3 },
  // BG-4: phòng ấm ngay từ đầu — mọi mốc dùng cùng một preset ấm (buổi tối, đèn bàn).
  lighting_by_days_done: [
    { min_days_done: 0, preset: 'warm' },
  ],
  presets: {
    cold: { background: '#2b3442', ambient: '#9fb4d6', ambientIntensity: 0.75, key: '#cfe0ff', keyIntensity: 0.9, window: 'rain', lamp: 0 },
    cool: { background: '#3a4250', ambient: '#c2cbdc', ambientIntensity: 0.9, key: '#ffe9c4', keyIntensity: 1.1, window: 'cloudy', lamp: 0 },
    warm: { background: '#5a4a3c', ambient: '#ffe6c0', ambientIntensity: 1.05, key: '#ffd9a0', keyIntensity: 1.5, window: 'night', lamp: 1 },
  },
  window_colors: { rain: '#7d90ad', cloudy: '#c9d3e0', sunny: '#ffe9b0', night: '#1f2a48' },
};

export function hubLightPresetName(cfg: HubConfig, daysDone: number): string {
  let name = cfg.lighting_by_days_done[0]?.preset ?? Object.keys(cfg.presets)[0];
  for (const row of cfg.lighting_by_days_done) if (daysDone >= row.min_days_done) name = row.preset;
  return name;
}

/** Tỉ số hiện hành: lấy từ `caro.series` nếu có, thiếu/hỏng → mặc định 3–3. */
export function caroScore(cfg: HubConfig, series?: Partial<CaroSeries> | null): CaroSeries {
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  return {
    quan: ok(series?.quan) ? Math.floor(series.quan) : cfg.caro_series_default.quan,
    duc: ok(series?.duc) ? Math.floor(series.duc) : cfg.caro_series_default.duc,
  };
}

/** Thay `{quan}` / `{duc}` trong một câu bằng tỉ số caro hiện hành (B9b). Phần chữ khác giữ nguyên. */
export function fillCaroScore(text: string, cfg: HubConfig, series?: Partial<CaroSeries> | null): string {
  const s = caroScore(cfg, series);
  return text.replace(/\{quan\}/g, String(s.quan)).replace(/\{duc\}/g, String(s.duc));
}
