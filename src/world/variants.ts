/**
 * Móc biến thể bản đồ theo năm học (GDD_MASTER_v1 §5.2): biến thể = bộ trang trí + preset ánh sáng.
 * Nội dung chỉ khai TÊN (`decor_set`, `lighting_preset` trong content/base.ts); hình ảnh cụ thể định nghĩa ở đây.
 * S2 (bản đồ đủ 6 khu) có thể mở rộng các bảng này mà không đụng engine.
 */
export interface DecorSet { phuongBloom: number; puddles: boolean; scarf: boolean }
export interface LightingPreset {
  sky: [string, string, string];
  fog: string;
  hemiSky: string; hemiGround: string; hemiIntensity: number;
  sunColor: string; sunIntensity: number; sunPos: [number, number, number];
}

export const DECOR_SETS: Record<string, DecorSet> = {
  g06: { phuongBloom: 0, puddles: false, scarf: true },        // đầu năm học, nắng
  g07: { phuongBloom: 0.35, puddles: true, scarf: true },      // mùa mưa → cuối năm, phượng chớm nở
};

export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  morning_sun: { sky: ['#8fc4ef', '#bfe0f7', '#f3ecd9'], fog: '#e6eef0', hemiSky: '#e2f0ff', hemiGround: '#d9c7a6', hemiIntensity: 1.25, sunColor: '#fff1d8', sunIntensity: 1.75, sunPos: [-14, 22, 12] },
  late_afternoon: { sky: ['#7fa9d8', '#f2c9a0', '#f6dcb8'], fog: '#f0dcc4', hemiSky: '#ffe2c2', hemiGround: '#cdb79a', hemiIntensity: 1.1, sunColor: '#ffd29a', sunIntensity: 1.9, sunPos: [16, 12, 10] },
};

export const DEFAULT_DECOR: DecorSet = DECOR_SETS.g06;
export const DEFAULT_LIGHTING: LightingPreset = LIGHTING_PRESETS.morning_sun;
