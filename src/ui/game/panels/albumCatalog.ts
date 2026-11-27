import type { StickerKind } from './albumStickers';

export type UnlockRule =
  | { type: 'free' }
  | { type: 'milestone'; pagesRequired: number; label: string }
  | { type: 'iap'; packId: IapPackId };

export type IapPackId = 'pack_stickers' | 'pack_papers' | 'pack_vip';

export interface IapPackInfo {
  id: IapPackId;
  title: string;
  subtitle: string;
  currency: 'coin' | 'stamp';
  price: number;
  badge?: string;
  features: string[];
  previewStickers?: StickerKind[];
  previewSwatches?: { label: string; bg: string }[];
  previewStyle?: { paperColor?: string; paperPattern?: string; coverTheme?: string; washiStyle?: string };
}

export const IAP_PACKS: readonly IapPackInfo[] = [
  {
    id: 'pack_stickers',
    title: 'Bộ Sticker Độc Quyền',
    subtitle: '7 sticker đặc biệt + 2 băng dính washi',
    currency: 'coin',
    price: 350,
    features: [
      '7 sticker độc quyền (Vương miện, Mèo, Bướm, Cassette...)',
      '2 băng dính kim tuyến vàng & hồng anh đào',
    ],
    previewStickers: ['crown', 'sparkle', 'cat', 'butterfly', 'cassette', 'polaroid', 'stamp'],
    previewStyle: { washiStyle: 'glitter_gold' },
  },
  {
    id: 'pack_papers',
    title: 'Bộ Giấy & Bìa Thanh Xuân',
    subtitle: '3 màu giấy pastel + 2 họa tiết + bìa anh đào',
    currency: 'stamp',
    price: 65,
    features: [
      '3 màu giấy: Hồng phấn, Tím oải hương, Đêm sao trời',
      '2 kiểu giấy: Bầu trời sao & Hoa văn cổ',
      'Bìa sổ Hoa anh đào ngọt ngào',
    ],
    previewSwatches: [
      { label: 'Hồng phấn', bg: '#fdeef1' },
      { label: 'Oải hương', bg: '#f2ecfb' },
      { label: 'Đêm sao', bg: '#22273b' },
      { label: 'Anh đào', bg: '#f7dce3' },
    ],
    previewStyle: { paperColor: 'blush', paperPattern: 'floral', coverTheme: 'cherry' },
  },
  {
    id: 'pack_vip',
    title: 'Combo Sổ Trọn Bộ',
    subtitle: 'Toàn bộ sticker, màu giấy & Bìa Viền Vàng',
    currency: 'stamp',
    price: 95,
    badge: 'Tiết kiệm nhất',
    features: [
      'Trọn bộ 7 Sticker Độc Quyền & 2 Washi cao cấp',
      'Trọn bộ Màu giấy, Kiểu giấy & Bìa Anh Đào',
      'Độc quyền: Bìa Viền Vàng Hoàng Gia lấp lánh',
    ],
    previewStickers: ['crown', 'cat', 'polaroid', 'sparkle'],
    previewSwatches: [
      { label: 'Viền vàng', bg: 'linear-gradient(135deg, #f8e3a1, #e8be5a)' },
      { label: 'Đêm sao', bg: '#22273b' },
    ],
    previewStyle: { paperColor: 'midnight', paperPattern: 'stars', coverTheme: 'gold', washiStyle: 'glitter_gold' },
  },
];

export interface StickerCatalogItem {
  kind: StickerKind;
  label: string;
  unlock: UnlockRule;
}

export const STICKER_CATALOG: readonly StickerCatalogItem[] = [
  // Miễn phí từ đầu
  { kind: 'star', label: 'Ngôi sao', unlock: { type: 'free' } },
  { kind: 'flower', label: 'Hoa phượng', unlock: { type: 'free' } },
  { kind: 'heart', label: 'Trái tim', unlock: { type: 'free' } },
  { kind: 'clover', label: 'Cỏ 4 lá', unlock: { type: 'free' } },
  { kind: 'note_pin', label: 'Đinh ghim', unlock: { type: 'free' } },

  // Mở theo mốc chương
  { kind: 'chalk', label: 'Viên phấn', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { kind: 'shuttle', label: 'Quả cầu', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { kind: 'boat', label: 'Thuyền giấy', unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' } },
  { kind: 'ribbon', label: 'Nơ ruy-băng', unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' } },
  { kind: 'paper_plane', label: 'Máy bay giấy', unlock: { type: 'milestone', pagesRequired: 3, label: 'Mốc: 3 trang' } },
  { kind: 'camera', label: 'Máy ảnh', unlock: { type: 'milestone', pagesRequired: 3, label: 'Mốc: 3 trang' } },
  { kind: 'rainbow', label: 'Cầu vồng', unlock: { type: 'milestone', pagesRequired: 4, label: 'Mốc: 4 trang' } },

  // Mở bằng gói trang trí
  { kind: 'crown', label: 'Vương miện', unlock: { type: 'iap', packId: 'pack_stickers' } },
  { kind: 'sparkle', label: 'Lấp lánh', unlock: { type: 'iap', packId: 'pack_stickers' } },
  { kind: 'cat', label: 'Mèo con', unlock: { type: 'iap', packId: 'pack_stickers' } },
  { kind: 'butterfly', label: 'Bướm xanh', unlock: { type: 'iap', packId: 'pack_stickers' } },
  { kind: 'cassette', label: 'Băng cát-xét', unlock: { type: 'iap', packId: 'pack_stickers' } },
  { kind: 'polaroid', label: 'Polaroid mini', unlock: { type: 'iap', packId: 'pack_stickers' } },
  { kind: 'stamp', label: 'Dấu kỷ niệm', unlock: { type: 'iap', packId: 'pack_stickers' } },
];

export interface StyleOption {
  id: string;
  label: string;
  swatch: string;
  unlock: UnlockRule;
}

export const PAPER_COLORS: readonly StyleOption[] = [
  { id: 'cream', label: 'Kem cổ điển', swatch: '#fdfaf2', unlock: { type: 'free' } },
  { id: 'kraft', label: 'Giấy Kraft', swatch: '#ead7b7', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { id: 'mint', label: 'Xanh bạc hà', swatch: '#eaf7f0', unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' } },
  { id: 'blush', label: 'Hồng phấn', swatch: '#fdeef1', unlock: { type: 'iap', packId: 'pack_papers' } },
  { id: 'lavender', label: 'Tím oải hương', swatch: '#f2ecfb', unlock: { type: 'iap', packId: 'pack_papers' } },
  { id: 'midnight', label: 'Đêm sao trời', swatch: '#22273b', unlock: { type: 'iap', packId: 'pack_papers' } },
];

export const PAPER_PATTERNS: readonly StyleOption[] = [
  { id: 'dots', label: 'Chấm bi', swatch: 'radial-gradient(rgba(120,95,65,.35) 1.5px, transparent 1.5px)', unlock: { type: 'free' } },
  { id: 'blank', label: 'Giấy trơn', swatch: '#f9f4e8', unlock: { type: 'free' } },
  { id: 'grid', label: 'Kẻ ô vuông', swatch: 'linear-gradient(to right, rgba(120,95,65,.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,95,65,.2) 1px, transparent 1px)', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { id: 'lined', label: 'Kẻ ngang vở', swatch: 'repeating-linear-gradient(transparent, transparent 6px, rgba(95,140,185,.32) 7px)', unlock: { type: 'milestone', pagesRequired: 2, label: 'Mốc: 2 trang' } },
  { id: 'stars', label: 'Bầu trời sao', swatch: 'radial-gradient(#f2b53a 1.5px, transparent 2px)', unlock: { type: 'iap', packId: 'pack_papers' } },
  { id: 'floral', label: 'Hoa văn cổ', swatch: 'radial-gradient(#e87c86 2px, transparent 2.5px)', unlock: { type: 'iap', packId: 'pack_papers' } },
];

export const COVER_THEMES: readonly StyleOption[] = [
  { id: 'classic', label: 'Da nâu ấm', swatch: '#efe4cf', unlock: { type: 'free' } },
  { id: 'denim', label: 'Jean học trò', swatch: '#c9d9eb', unlock: { type: 'milestone', pagesRequired: 3, label: 'Mốc: 3 trang' } },
  { id: 'cherry', label: 'Hoa anh đào', swatch: '#f9dce2', unlock: { type: 'iap', packId: 'pack_papers' } },
  { id: 'gold', label: 'Viền vàng VIP', swatch: 'linear-gradient(135deg, #f8e3a1, #e8be5a)', unlock: { type: 'iap', packId: 'pack_vip' } },
];

export const WASHI_STYLES: readonly StyleOption[] = [
  { id: 'amber', label: 'Vàng hổ phách', swatch: 'rgba(242,181,58,.78)', unlock: { type: 'free' } },
  { id: 'mint_stripe', label: 'Sọc bạc hà', swatch: 'repeating-linear-gradient(45deg, #8fd3b8, #8fd3b8 4px, #d8f3e8 4px, #d8f3e8 8px)', unlock: { type: 'milestone', pagesRequired: 1, label: 'Mốc: 1 trang' } },
  { id: 'glitter_gold', label: 'Kim tuyến vàng', swatch: 'linear-gradient(135deg, #ffd95a, #f29f05, #ffe793)', unlock: { type: 'iap', packId: 'pack_stickers' } },
  { id: 'sakura_tape', label: 'Hồng anh đào', swatch: 'repeating-linear-gradient(-45deg, #f8a5b8, #f8a5b8 5px, #ffd6e0 5px, #ffd6e0 10px)', unlock: { type: 'iap', packId: 'pack_stickers' } },
];

export function isUnlocked(rule: UnlockRule, pagesRestored: number, iapPacks: readonly string[]): boolean {
  if (rule.type === 'free') return true;
  if (rule.type === 'milestone') return pagesRestored >= rule.pagesRequired;
  return iapPacks.includes('pack_vip') || iapPacks.includes(rule.packId);
}
