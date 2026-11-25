/**
 * Cấu hình Hub 2026 — các điểm có thể đổi mà không sửa engine nằm ở đây.
 * Preset ánh sáng chọn theo số Ngày đã xong; đổi tông = đổi bảng này, không sửa engine.
 */
export interface HubLightPreset {
  /** Nền cảnh (chỉ lộ ra ngoài khung phòng). */
  background: string;
  /** Đèn bán cầu: màu trời (`ambient`), màu đất (`ground`), cường độ. */
  ambient: string; ground: string; ambientIntensity: number;
  /** Đèn hướng (ánh sáng chính). */
  key: string; keyIntensity: number;
  window: 'rain' | 'cloudy' | 'sunny' | 'twilight' | 'dusk' | 'night';
  /** Độ sáng đèn bàn 0–1 (vật tự sáng, không phải nguồn sáng; 0 = tắt). */
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
  app_chat_name: 'AloNhau',                            // chủ dự án chốt 25/11 (TONG_DUYET Phần 3 mục 2)
  show_adult_player: false,
  old_chat_last_label: 'tin cuối cùng đã từ rất lâu',
  caro_series_default: { quan: 3, duc: 3 },
  // BG-4: phòng ấm ngay từ đầu (buổi tối, đèn bàn sáng — lời dẫn mở đầu), và ấm dần theo số Ngày đã xong.
  // K2 khử ám vàng: ánh sáng chung trắng trung tính; "ấm" nằm ở đèn bàn tự sáng + cửa sổ (chạng vạng → hoàng hôn → đêm),
  // không tô vàng toàn cảnh. Giới hạn: không preset nào vàng hơn #fff1df hay sáng hơn 1,35 (tests/unit/hub.test.ts).
  lighting_by_days_done: [
    { min_days_done: 0, preset: 'evening' },
    { min_days_done: 2, preset: 'dusk' },
    { min_days_done: 4, preset: 'warm' },
  ],
  presets: {
    cold: { background: '#2b3442', ambient: '#c9d6e8', ground: '#8f949c', ambientIntensity: 0.8, key: '#e6eefa', keyIntensity: 1.0, window: 'rain', lamp: 0 },
    cool: { background: '#3a4250', ambient: '#e6ebf2', ground: '#9a978f', ambientIntensity: 0.9, key: '#f6f3ee', keyIntensity: 1.15, window: 'cloudy', lamp: 0 },
    evening: { background: '#9fb2cc', ambient: '#f2f5fa', ground: '#9c968e', ambientIntensity: 0.9, key: '#fff3e3', keyIntensity: 1.25, window: 'twilight', lamp: 0.55 },
    dusk: { background: '#d9c9b8', ambient: '#f3f3f2', ground: '#9c968e', ambientIntensity: 0.9, key: '#fff2e1', keyIntensity: 1.28, window: 'dusk', lamp: 0.8 },
    warm: { background: '#1f2a48', ambient: '#f4f4f2', ground: '#9c968e', ambientIntensity: 0.9, key: '#fff3e5', keyIntensity: 1.3, window: 'night', lamp: 1 },
  },
  // 'sunny' = trời ban ngày #cfdbe8 (gợi ý K2) — để sẵn, đổi một hàng lighting_by_days_done là dùng được.
  window_colors: { rain: '#7d90ad', cloudy: '#c9d3e0', sunny: '#cfdbe8', twilight: '#9fb2cc', dusk: '#d9c9b8', night: '#1f2a48' },
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
