/**
 * Danh mục Trang Trí Phòng 2026 & Trang Phục Nhân Vật (hỗ trợ Xem thử 3D, Mở mốc chương, và Mở bằng Xu/Tem).
 */
import type { HairStyle } from '../actors/character/presets';

export type CosmeticUnlockRule =
  | { type: 'free' }
  | { type: 'milestone'; pagesRequired: number; label: string }
  | { type: 'shop'; currency: 'coin' | 'stamp'; price: number };

export interface RoomDecorStyle {
  wallColor: string;
  floorColor: string;
  curtainColor: string;
  rugColors: [string, string, string];
  bedColor: string;
  accentFairyLights: boolean;
  accentDeskPlant: boolean;
  accentRocket: boolean;
  accentCatPlush: boolean;
}

export const DEFAULT_ROOM_DECOR: RoomDecorStyle = {
  wallColor: '#ddd0ba',
  floorColor: '#b99974',
  curtainColor: '#d9b85c',
  rugColors: ['#a64438', '#ece2c8', '#7d3028'],
  bedColor: '#48607e',
  accentFairyLights: false,
  accentDeskPlant: false,
  accentRocket: false,
  accentCatPlush: false,
};

export interface RoomThemeOption {
  id: string;
  title: string;
  subtitle: string;
  swatch: string;
  unlock: CosmeticUnlockRule;
  style: Partial<RoomDecorStyle>;
}

export const ROOM_THEMES: readonly RoomThemeOption[] = [
  {
    id: 'room_default',
    title: 'Phòng Trọ 2026',
    subtitle: 'Tông kem gỗ ấm quen thuộc',
    swatch: '#ddd0ba',
    unlock: { type: 'free' },
    style: { ...DEFAULT_ROOM_DECOR },
  },
  {
    id: 'dec_01',
    title: 'Góc Học Tập 2015',
    subtitle: 'Sàn gỗ nâu ấm + đèn học vàng hoài niệm',
    swatch: '#d8c3a5',
    unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' },
    style: {
      wallColor: '#e9dec7',
      floorColor: '#9e754d',
      curtainColor: '#e2b659',
      rugColors: ['#5b7fa6', '#f2e8cf', '#3d5878'],
      bedColor: '#566f8f',
      accentDeskPlant: true,
    },
  },
  {
    id: 'dec_02',
    title: 'Khu Vườn Của Mây',
    subtitle: 'Tường xanh bạc hà + chậu cây & rèm pastel',
    swatch: '#cce8dc',
    unlock: { type: 'shop', currency: 'coin', price: 300 },
    style: {
      wallColor: '#d4eadf',
      floorColor: '#c9aa84',
      curtainColor: '#94cfb8',
      rugColors: ['#69a88d', '#f6f3e7', '#4a8069'],
      bedColor: '#6d9b8b',
      accentDeskPlant: true,
      accentCatPlush: true,
    },
  },
  {
    id: 'dec_03',
    title: 'Xưởng Chế Tạo Tí Nổ',
    subtitle: 'Tường xanh slate + mô hình tên lửa trên kệ',
    swatch: '#c4d2e0',
    unlock: { type: 'shop', currency: 'stamp', price: 45 },
    style: {
      wallColor: '#cdd9e5',
      floorColor: '#a68968',
      curtainColor: '#587aa1',
      rugColors: ['#3b5e85', '#e9eef4', '#274363'],
      bedColor: '#395575',
      accentRocket: true,
    },
  },
  {
    id: 'dec_04',
    title: 'Đêm Đom Đóm Ấm Áp',
    subtitle: 'Không gian tím đêm dịu + dây đèn lấp lánh',
    swatch: '#424769',
    unlock: { type: 'shop', currency: 'stamp', price: 75 },
    style: {
      wallColor: '#3c425e',
      floorColor: '#6b5344',
      curtainColor: '#7a75a8',
      rugColors: ['#675d8c', '#dfd7f0', '#483f69'],
      bedColor: '#514a73',
      accentFairyLights: true,
      accentCatPlush: true,
      accentDeskPlant: true,
    },
  },
];

export interface RoomColorChip {
  id: string;
  label: string;
  color: string;
  unlock: CosmeticUnlockRule;
}

export const ROOM_WALL_COLORS: readonly RoomColorChip[] = [
  { id: 'wall_cream', label: 'Kem ấm', color: '#ddd0ba', unlock: { type: 'free' } },
  { id: 'wall_sage', label: 'Xanh bạc hà', color: '#d4eadf', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { id: 'wall_sky', label: 'Xanh trời nhạt', color: '#cfe0ee', unlock: { type: 'shop', currency: 'coin', price: 150 } },
  { id: 'wall_blush', label: 'Hồng phấn', color: '#f3d8de', unlock: { type: 'shop', currency: 'stamp', price: 30 } },
  { id: 'wall_night', label: 'Tím đêm sao', color: '#3c425e', unlock: { type: 'shop', currency: 'stamp', price: 55 } },
];

export const ROOM_CURTAIN_COLORS: readonly RoomColorChip[] = [
  { id: 'cur_gold', label: 'Vàng nắng', color: '#d9b85c', unlock: { type: 'free' } },
  { id: 'cur_cream', label: 'Trắng kem', color: '#efe8d8', unlock: { type: 'free' } },
  { id: 'cur_mint', label: 'Xanh mint', color: '#94cfb8', unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' } },
  { id: 'cur_rose', label: 'Hồng đào', color: '#e599ab', unlock: { type: 'shop', currency: 'coin', price: 180 } },
  { id: 'cur_lavender', label: 'Tím oải hương', color: '#8f84ba', unlock: { type: 'shop', currency: 'stamp', price: 35 } },
];

export interface RoomAccentOption {
  id: 'accentFairyLights' | 'accentDeskPlant' | 'accentRocket' | 'accentCatPlush';
  title: string;
  swatch: string;
  unlock: CosmeticUnlockRule;
}

export const ROOM_ACCENTS: readonly RoomAccentOption[] = [
  { id: 'accentDeskPlant', title: 'Chậu cây bàn học', swatch: '#65a86b', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { id: 'accentCatPlush', title: 'Gối mèo trên giường', swatch: '#f5cfa0', unlock: { type: 'shop', currency: 'coin', price: 200 } },
  { id: 'accentRocket', title: 'Mô hình tên lửa gỗ', swatch: '#d9534f', unlock: { type: 'shop', currency: 'stamp', price: 40 } },
  { id: 'accentFairyLights', title: 'Dây đèn đom đóm', swatch: '#ffe07d', unlock: { type: 'shop', currency: 'stamp', price: 65 } },
];

// ======================== TRANG PHỤC NHÂN VẬT ========================

export type OutfitAccessory = 'none' | 'glasses' | 'headphones' | 'cap' | 'ribbon_bow';
export type OutfitTopKind = 'uniform' | 'hoodie' | 'cardigan' | 'denim' | 'sport';

export interface OutfitStyle {
  topKind: OutfitTopKind;
  shirtColor: string;
  trousersColor: string;
  shoeColor: string;
  hairColor: string | null;
  hairStyle?: HairStyle | null;
  skinColor?: string | null;
  accessory: OutfitAccessory;
  scarfOverride?: boolean;
}

export const DEFAULT_OUTFIT: OutfitStyle = {
  topKind: 'uniform',
  shirtColor: '#f7f5ef',
  trousersColor: '#24345a',
  shoeColor: '#f4f1ea',
  hairColor: null,
  hairStyle: null,
  skinColor: null,
  accessory: 'none',
};

export interface OutfitSetOption {
  id: string;
  title: string;
  subtitle: string;
  swatch: string;
  unlock: CosmeticUnlockRule;
  outfit: Partial<OutfitStyle>;
}

export const OUTFIT_SETS: readonly OutfitSetOption[] = [
  {
    id: 'out_uniform',
    title: 'Đồng Phục Chuẩn',
    subtitle: 'Áo sơ mi trắng & quần xanh truyền thống',
    swatch: '#f7f5ef',
    unlock: { type: 'free' },
    outfit: { ...DEFAULT_OUTFIT, scarfOverride: undefined },
  },
  {
    id: 'out_sport',
    title: 'Thể Dục Năng Động',
    subtitle: 'Áo thể thao xanh trắng khỏe khoắn',
    swatch: '#4a85c5',
    unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' },
    outfit: {
      topKind: 'sport',
      shirtColor: '#e8f1fa',
      trousersColor: '#2a4266',
      shoeColor: '#e85a4f',
      scarfOverride: false,
    },
  },
  {
    id: 'out_cardigan',
    title: 'Cardigan Thu Đông',
    subtitle: 'Áo len be ấm áp cho những chiều mưa',
    swatch: '#e8d2b0',
    unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' },
    outfit: {
      topKind: 'cardigan',
      shirtColor: '#e6caa1',
      trousersColor: '#3c3632',
      shoeColor: '#d9c5a7',
      scarfOverride: false,
    },
  },
  {
    id: 'out_hoodie',
    title: 'Hoodie Thanh Xuân',
    subtitle: 'Hoodie xanh bạc hà kèm mũ sau lưng',
    swatch: '#9fd8c2',
    unlock: { type: 'shop', currency: 'coin', price: 320 },
    outfit: {
      topKind: 'hoodie',
      shirtColor: '#9fd8c2',
      trousersColor: '#2b3445',
      shoeColor: '#fffdf6',
      scarfOverride: false,
    },
  },
  {
    id: 'out_denim',
    title: 'Áo Khoác Denim',
    subtitle: 'Phong cách dạo phố cổ điển thập niên 2010',
    swatch: '#577da8',
    unlock: { type: 'shop', currency: 'stamp', price: 45 },
    outfit: {
      topKind: 'denim',
      shirtColor: '#577da8',
      trousersColor: '#2c303a',
      shoeColor: '#3b322e',
      scarfOverride: false,
    },
  },
  {
    id: 'out_pastel_vip',
    title: 'Set Hồng Anh Đào',
    subtitle: 'Hoodie hồng pastel + giày trắng tinh khôi',
    swatch: '#f5b8c8',
    unlock: { type: 'shop', currency: 'stamp', price: 70 },
    outfit: {
      topKind: 'hoodie',
      shirtColor: '#f5b8c8',
      trousersColor: '#3b374a',
      shoeColor: '#fffdf6',
      scarfOverride: false,
    },
  },
];

export interface AccessoryOption {
  id: OutfitAccessory;
  title: string;
  swatch: string;
  unlock: CosmeticUnlockRule;
}

export const OUTFIT_ACCESSORIES: readonly AccessoryOption[] = [
  { id: 'none', title: 'Không đeo', swatch: '#eee5d3', unlock: { type: 'free' } },
  { id: 'ribbon_bow', title: 'Nơ kẹp tóc', swatch: '#e85874', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { id: 'glasses', title: 'Kính tròn', swatch: '#4a403a', unlock: { type: 'shop', currency: 'coin', price: 180 } },
  { id: 'cap', title: 'Mũ lưỡi trai', swatch: '#d97236', unlock: { type: 'shop', currency: 'stamp', price: 35 } },
  { id: 'headphones', title: 'Tai nghe chụp', swatch: '#4d73b8', unlock: { type: 'shop', currency: 'stamp', price: 55 } },
];

export interface HairColorOption {
  id: string;
  title: string;
  color: string | null;
  swatch: string;
  unlock: CosmeticUnlockRule;
}

export const OUTFIT_HAIR_COLORS: readonly HairColorOption[] = [
  { id: 'hair_default', title: 'Tóc nguyên bản', color: null, swatch: '#231c1a', unlock: { type: 'free' } },
  { id: 'hair_chestnut', title: 'Nâu hạt dẻ', color: '#5c3b28', swatch: '#5c3b28', unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' } },
  { id: 'hair_caramel', title: 'Vàng caramel', color: '#a87844', swatch: '#a87844', unlock: { type: 'shop', currency: 'coin', price: 160 } },
  { id: 'hair_navy', title: 'Xanh đêm', color: '#2b3c5e', swatch: '#2b3c5e', unlock: { type: 'shop', currency: 'stamp', price: 40 } },
];

export interface HairStyleOption {
  id: string;
  style: HairStyle | null;
  title: string;
  subtitle: string;
  swatch: string;
  unlock: CosmeticUnlockRule;
}

export const OUTFIT_HAIR_STYLES: readonly HairStyleOption[] = [
  { id: 'hs_default', style: null, title: 'Tóc nguyên bản', subtitle: 'Kiểu tóc mặc định của nhân vật', swatch: '#24201e', unlock: { type: 'free' } },
  { id: 'hs_spiky', style: 'spiky', title: 'Tóc Nhím Năng Động', subtitle: 'Gai nhọn tinh nghịch tuổi học trò', swatch: '#e0702a', unlock: { type: 'free' } },
  { id: 'hs_short_fringe', style: 'short_fringe', title: 'Mái Ngố Thư Sinh', subtitle: 'Tóc ngắn mái bằng hiền lành', swatch: '#2c2420', unlock: { type: 'free' } },
  { id: 'hs_side_part', style: 'side_part', title: 'Rẽ Ngôi 7/3 Học Đường', subtitle: 'Lãng tử học sinh thập niên 2000s', swatch: '#3a2d28', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { id: 'hs_two_buns', style: 'two_buns', title: 'Búi Đôi Củ Tỏi (Natra)', subtitle: 'Hai búi đôi đáng yêu, năng nổ', swatch: '#e0608f', unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' } },
  { id: 'hs_ponytail_high', style: 'ponytail_high', title: 'Đuôi Ngựa Cao', subtitle: 'Cột cao tháo vát, hoạt bát', swatch: '#8a55c9', unlock: { type: 'free' } },
  { id: 'hs_ponytail_low', style: 'ponytail_low', title: 'Đuôi Gà Buộc Thấp', subtitle: 'Buộc lơi dịu dàng sau gáy', swatch: '#455a64', unlock: { type: 'free' } },
  { id: 'hs_wavy_bob', style: 'wavy_bob', title: 'Bob Ngắn Uốn Lọn', subtitle: 'Tóc ngắn ngang cằm bồng bềnh', swatch: '#6d597a', unlock: { type: 'shop', currency: 'coin', price: 180 } },
  { id: 'hs_long_clip', style: 'long_clip', title: 'Tóc Dài Kẹp Hoa', subtitle: 'Dịu dàng buông xõa cài hoa', swatch: '#f48fb1', unlock: { type: 'shop', currency: 'coin', price: 220 } },
  { id: 'hs_buzz', style: 'buzz', title: 'Đầu Đinh Thể Thao', subtitle: 'Húi cua khỏe khoắn, mát mẻ', swatch: '#4a7c59', unlock: { type: 'free' } },
];

export interface SkinColorOption {
  id: string;
  title: string;
  subtitle: string;
  color: string | null;
  swatch: string;
  unlock: CosmeticUnlockRule;
}

export const OUTFIT_SKIN_COLORS: readonly SkinColorOption[] = [
  { id: 'skin_default', title: 'Nguyên bản', subtitle: 'Màu da gốc của nhân vật', color: null, swatch: '#f5d2b0', unlock: { type: 'free' } },
  { id: 'skin_light', title: 'Trắng sáng tự nhiên', subtitle: 'Làn da trắng sáng mịn màng', color: '#fae1ce', swatch: '#fae1ce', unlock: { type: 'free' } },
  { id: 'skin_peach', title: 'Trắng hồng đào', subtitle: 'Làn da trắng hồng tươi tắn', color: '#fcece4', swatch: '#fcece4', unlock: { type: 'free' } },
  { id: 'skin_warm', title: 'Sáng ấm tự nhiên', subtitle: 'Tông ấm thân thuộc học trò Á Đông', color: '#f3cfab', swatch: '#f3cfab', unlock: { type: 'free' } },
  { id: 'skin_tan', title: 'Bánh mật rám nắng', subtitle: 'Làn da bánh mật hay chạy nhảy', color: '#e2ad80', swatch: '#e2ad80', unlock: { type: 'free' } },
  { id: 'skin_honey', title: 'Vàng mật ong', subtitle: 'Khỏe khoắn, ấm áp rạng rỡ', color: '#e8b98c', swatch: '#e8b98c', unlock: { type: 'free' } },
  { id: 'skin_bronze', title: 'Ngăm thể thao', subtitle: 'Da ngăm nắng hè khỏe mạnh', color: '#c48a5c', swatch: '#c48a5c', unlock: { type: 'free' } },
  { id: 'skin_deep', title: 'Nâu ấm cá tính', subtitle: 'Tông nâu đậm đà, ấm áp', color: '#a26a45', swatch: '#a26a45', unlock: { type: 'free' } },
];

export function isCosmeticUnlocked(
  itemId: string,
  rule: CosmeticUnlockRule,
  pagesRestored: number,
  unlockedIds: readonly string[],
): boolean {
  if (rule.type === 'free') return true;
  if (rule.type === 'milestone') return pagesRestored >= rule.pagesRequired || unlockedIds.includes(itemId);
  return unlockedIds.includes(itemId);
}
