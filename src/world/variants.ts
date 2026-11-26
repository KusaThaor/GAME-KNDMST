import type { Object3D } from 'three';

/**
 * Móc biến thể bản đồ theo năm học (GDD_MASTER_v1 §5.2): biến thể = bộ trang trí + preset ánh sáng.
 * Nội dung chỉ khai TÊN (`decor_set`, `lighting_preset` trong content/base.ts); hình ảnh cụ thể định nghĩa ở đây.
 * S2 (bản đồ đủ 6 khu) có thể mở rộng các bảng này mà không đụng engine.
 */
export interface DecorSet { phuongBloom: number; puddles: boolean; scarf: boolean }
export interface LightingPreset {
  /** Góc quay tùy chọn cho đoạn thoại bắt đầu cùng preset. */
  cutsceneMarker?: string;
  sky: [string, string, string];
  fog: string;
  hemiSky: string; hemiGround: string; hemiIntensity: number;
  sunColor: string; sunIntensity: number; sunPos: [number, number, number];
}

export const DECOR_SETS: Record<string, DecorSet> = {
  g06: { phuongBloom: 0, puddles: false, scarf: true },        // đầu năm học, nắng
  g07: { phuongBloom: 0.35, puddles: true, scarf: true },      // mùa mưa → cuối năm, phượng chớm nở
  g07_end: { phuongBloom: 0.7, puddles: true, scarf: true },
  g08: { phuongBloom: 0, puddles: false, scarf: true },
  g09: { phuongBloom: 0, puddles: false, scarf: false },
  g09_end: { phuongBloom: 1, puddles: false, scarf: false },
};

// Các GLB hiện tại chỉ gắn hoa phượng và nước bằng nhãn g07.
export function assetDecorSet(id?: string | null): string | null {
  return id === 'g07_end' || id === 'g09_end' ? 'g07' : id ?? null;
}

export function applySchoolDecor(root: Object3D, decor: DecorSet) {
  for (const name of ['DECOR_puddles', 'DECOR_gutter_water']) {
    const water = root.getObjectByName(name);
    if (water) water.visible = decor.puddles;
  }
  const bloom = root.getObjectByName('DECOR_phuong_bloom');
  if (!bloom || decor.phuongBloom <= DECOR_SETS.g07.phuongBloom) return;
  // Quay cụm hoa quanh gốc cây để lấp thêm các khoảng trống trên tán.
  const copies = Math.round(decor.phuongBloom / DECOR_SETS.g07.phuongBloom);
  for (let i = 1; i < copies; i++) {
    const cluster = bloom.clone();
    cluster.rotateY(i * Math.PI * 2 / copies);
    bloom.parent?.add(cluster);
  }
}

export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  morning_sun: { sky: ['#8fc4ef', '#bfe0f7', '#f3ecd9'], fog: '#e6eef0', hemiSky: '#e2f0ff', hemiGround: '#d9c7a6', hemiIntensity: 1.25, sunColor: '#fff1d8', sunIntensity: 1.75, sunPos: [-14, 22, 12] },
  late_afternoon: { sky: ['#7fa9d8', '#f2c9a0', '#f6dcb8'], fog: '#f0dcc4', hemiSky: '#ffe2c2', hemiGround: '#cdb79a', hemiIntensity: 1.1, sunColor: '#ffd29a', sunIntensity: 1.9, sunPos: [16, 12, 10] },
  rain_overcast: { sky: ['#94abc3', '#c3d6e5', '#ebe7d9'], fog: '#cddce2', hemiSky: '#e3effa', hemiGround: '#d6cbb1', hemiIntensity: 1.65, sunColor: '#fff3d9', sunIntensity: 0.85, sunPos: [-9, 18, 7] },
  rain_shower: { sky: ['#829bb6', '#b5c8d9', '#dce1dc'], fog: '#c1d1da', hemiSky: '#deebf8', hemiGround: '#cebea7', hemiIntensity: 1.6, sunColor: '#fff1d9', sunIntensity: 0.7, sunPos: [16, 13, 9] },
  after_rain_rainbow: { sky: ['#79acda', '#c4def0', '#ffdfac'], fog: '#e2ded0', hemiSky: '#eaf5ff', hemiGround: '#e1c5a4', hemiIntensity: 1.4, sunColor: '#ffda9d', sunIntensity: 1.85, sunPos: [15, 11, 14] },
  dusk: { sky: ['#696eaa', '#cc9fae', '#ffce9c'], fog: '#cdb7bd', hemiSky: '#cecfea', hemiGround: '#d1aa93', hemiIntensity: 1.1, sunColor: '#ffc38c', sunIntensity: 1.15, sunPos: [20, 7, 9] },
  night_campfire: { sky: ['#253657', '#495c7c', '#827887'], fog: '#60677e', hemiSky: '#acbddb', hemiGround: '#b49380', hemiIntensity: 0.78, sunColor: '#b6ccef', sunIntensity: 0.38, sunPos: [-13, 18, 7] },
  golden_sunset: { sky: ['#899dd3', '#f4b58a', '#ffe4a3'], fog: '#f4d5b4', hemiSky: '#f4e3d5', hemiGround: '#d2a481', hemiIntensity: 1.2, sunColor: '#ffc06b', sunIntensity: 2.0, sunPos: [20, 8, 12] },
};

export const DEFAULT_DECOR: DecorSet = DECOR_SETS.g06;
export const DEFAULT_LIGHTING: LightingPreset = LIGHTING_PRESETS.morning_sun;
