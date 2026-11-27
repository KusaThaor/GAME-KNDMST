/**
 * Cấu hình Tiệm Ký Ức & Hệ thống Tiền tệ kép (Xu Kỷ Niệm / Tem Thanh Xuân).
 *
 * - Thiết kế theo chuẩn game (tham khảo cấu trúc tiền tệ 2 lớp & nạp kim cương hồng/tím của NSTT):
 *   + Vật phẩm trong tiệm chỉ niêm yết bằng Xu Kỷ Niệm hoặc Tem Thanh Xuân (không ghi tiền VNĐ trực tiếp lên thẻ đồ).
 *   + Khi người chơi thiếu Xu hoặc Tem (hoặc bấm nút + trên ví) mới mở màn hình Nạp Tem / Đổi Xu với các gói quy đổi.
 * - Mặc định BẬT ở bản `test` / Preview (`enabled_in_test = true`), TẮT ở bản `production` (`enabled_in_production = false`).
 */
import type { ShopItemArtKind } from '../ui/game/panels/shopIcons';

export type ShopNavId = 'store' | 'blindbox' | 'utility' | 'stories' | 'topup' | 'upcoming';
export type ShopCurrencyType = 'coin' | 'stamp' | 'free';

export interface ShopNavTab {
  id: ShopNavId;
  label: string;
}

export interface ShopStoreItem {
  id: string;
  section: 'decor' | 'cosmetic' | 'utility' | 'stories' | 'upcoming';
  art: ShopItemArtKind;
  title: string;
  target: string;
  description: string;
  currency: ShopCurrencyType;
  price: number;
  actionLabel: string;
  featured?: boolean;
}

export interface TopUpPack {
  id: string;
  title: string;
  stampAmount: number;
  bonusLabel?: string;
  priceVnd: string;
  badge?: string;
  isPass?: boolean;
  description?: string;
}

export interface ExchangePack {
  id: string;
  title: string;
  coinAmount: number;
  costStamp: number;
  badge?: string;
}

export const SHOP_DEMO_CONFIG = {
  enabled_in_test: true,
  enabled_in_production: false,
  url_param: 'shopdemo',
  /** Ví minh họa: đủ mua đồ phổ thông bằng Xu / 1 số món Tem nhỏ, nhưng thiếu Tem cho đồ cao cấp để hiện luồng Nạp Tem. */
  demo_wallet: {
    coin: 450,
    coin_label: 'Xu Kỷ Niệm',
    stamp: 50,
    stamp_label: 'Tem Thanh Xuân',
  },
  ui: {
    panel_title: 'Tiệm Ký Ức',
    panel_subtitle: 'Góc lưu giữ vật phẩm trang trí, tiện ích và câu chuyện thanh xuân',
    hud_button_label: 'Tiệm Ký Ức',
    menu_button_label: 'Tiệm Ký Ức',
  },
  shortage_notice: {
    title_coin: 'Chưa đủ Xu Kỷ Niệm',
    title_stamp: 'Chưa đủ Tem Thanh Xuân',
    cta_topup_stamp: 'Nạp Tem Thanh Xuân',
    cta_topup_coin: 'Đổi Xu / Nhận thêm Xu',
    cta_later: 'Để sau',
  },
  coming_soon: {
    badge: 'Tính năng đang cập nhật',
    title: 'Chức năng đang hoàn thiện',
    body: 'Vật phẩm và tính năng này đang được phát triển để ra mắt chính thức trong phiên bản tiếp theo.',
    confirm_label: 'Đã hiểu',
  },
} as const;

export const SHOP_NAV_TABS: readonly ShopNavTab[] = [
  { id: 'store', label: 'Cửa hàng' },
  { id: 'blindbox', label: 'Túi Mù' },
  { id: 'utility', label: 'Tiện ích' },
  { id: 'stories', label: 'Ngoại truyện' },
  { id: 'topup', label: 'Nạp Tem' },
  { id: 'upcoming', label: 'Sắp ra mắt' },
];

export const SHOP_SECTION_HEADERS: Record<'decor' | 'cosmetic' | 'utility' | 'stories' | 'upcoming', { title: string; subtitle: string }> = {
  decor: {
    title: 'Không Gian Kỷ Niệm',
    subtitle: 'Trang trí Phòng 2026 & Căn cứ Bí mật',
  },
  cosmetic: {
    title: 'Trang Phục & Album',
    subtitle: 'Cá nhân hóa nhóm bạn và quyển sổ thanh xuân',
  },
  utility: {
    title: 'Vật Phẩm Tiện Ích',
    subtitle: 'Hỗ trợ giải mã, chụp ảnh và chọn lại nhánh thoại',
  },
  stories: {
    title: 'Ngoại Truyện Nhân Vật',
    subtitle: 'Mở khóa góc nhìn riêng của từng thành viên',
  },
  upcoming: {
    title: 'Hoạt Động Sắp Ra Mắt',
    subtitle: 'Sinh hoạt trường học & bộ sưu tập kỷ vật phụ',
  },
};

export const SHOP_DEMO_ITEMS: readonly ShopStoreItem[] = [
  // 1. Trang trí không gian (giá Tem cao hơn ví 50 → bấm vào hiện thiếu Tem & gợi ý nạp)
  {
    id: 'dec_01',
    section: 'decor',
    art: 'desk',
    title: 'Bộ "Góc Học Tập 2015"',
    target: 'Bàn học Phòng 2026',
    description: 'Đèn bàn cổ điển, giá sách gỗ, lịch xé tay. Thay đổi diện mạo bàn học và mở khóa 3 câu thoại hoài niệm.',
    currency: 'stamp',
    price: 120,
    actionLabel: 'Sở hữu ngay',
    featured: true,
  },
  {
    id: 'dec_02',
    section: 'decor',
    art: 'garden',
    title: 'Bộ "Khu Vườn Của Mây"',
    target: 'Căn cứ Bí mật & Ban công 2026',
    description: 'Đèn đom đóm, chậu hoa phượng mini, rèm vải. Tự động đồng bộ chậu hoa ở ban công phòng trọ 2026.',
    currency: 'stamp',
    price: 80,
    actionLabel: 'Sở hữu ngay',
  },
  {
    id: 'dec_03',
    section: 'decor',
    art: 'lab',
    title: 'Bộ "Xưởng Chế Tạo Tí Nổ"',
    target: 'Căn cứ Bí mật & Kệ sách 2026',
    description: 'Bảng kế hoạch, tên lửa giấy, ghế thùng gỗ. Thêm mô hình tên lửa gỗ trưng bày trên kệ phòng 2026.',
    currency: 'stamp',
    price: 80,
    actionLabel: 'Sở hữu ngay',
  },

  // 2. Trang phục & Album
  {
    id: 'alb_01',
    section: 'cosmetic',
    art: 'album',
    title: 'Phụ Kiện Album "Thanh Xuân"',
    target: 'Album Thanh Xuân',
    description: '12 viền ảnh Polaroid, 20 sticker thập niên 2010 và bộ bút nhũ trang trí sổ kỷ niệm.',
    currency: 'coin',
    price: 500,
    actionLabel: 'Mua gói phụ kiện',
  },
  {
    id: 'cos_01',
    section: 'cosmetic',
    art: 'outfit',
    title: 'Trang Phục Ngoại Khóa Mốc 1',
    target: 'Cả nhóm bạn (Mốc 1)',
    description: 'Đổi trang phục cho nhóm bạn khi dạo quanh sân trường, tiệm tạp hóa và sự kiện ngoại khóa.',
    currency: 'stamp',
    price: 60,
    actionLabel: 'Mở trang phục',
  },

  // 3. Tiện ích Gameplay (đủ Xu/Tem trong ví demo → bấm vào hiện "Tính năng đang cập nhật")
  {
    id: 'utl_01',
    section: 'utility',
    art: 'highlighter',
    title: 'Bút Highlight 4 Màu',
    target: 'Giải mã & Đua thuyền giấy',
    description: 'Gợi ý 1 ký tự đúng khi giải mật lệnh hoặc hiện dòng nước tối ưu trong minigame đua thuyền.',
    currency: 'coin',
    price: 150,
    actionLabel: 'Mua vật phẩm',
  },
  {
    id: 'utl_02',
    section: 'utility',
    art: 'film',
    title: 'Cuộn Phim Dự Phòng',
    target: 'Chụp ảnh kỷ niệm',
    description: 'Lưu trọn vẹn cả 2 biến thể ảnh (nghiêm túc và nhí nhố) vào Album Thanh Xuân.',
    currency: 'coin',
    price: 200,
    actionLabel: 'Mua cuộn phim',
  },
  {
    id: 'utl_03',
    section: 'utility',
    art: 'eraser',
    title: 'Tẩy Ký Ức',
    target: 'Chọn lại nhánh hội thoại',
    description: 'Tua lại 1 phân cảnh hội thoại đã qua để chọn lại nhánh khác mà không phải chơi lại chương.',
    currency: 'stamp',
    price: 30,
    actionLabel: 'Mua Tẩy Ký Ức',
  },
  {
    id: 'utl_04',
    section: 'utility',
    art: 'snack',
    title: 'Bánh Tráng Trộn Đặc Biệt',
    target: 'Hoạt động ngày (Daily)',
    description: 'Hồi phục 100% năng lượng hoạt động ngày để tiếp tục nhận thêm Side Quest tại cổng trường.',
    currency: 'coin',
    price: 100,
    actionLabel: 'Mua đồ ăn vặt',
  },

  // 4. Ngoại truyện (thiếu Tem → bấm vào gợi ý Nạp Tem)
  {
    id: 'str_01',
    section: 'stories',
    art: 'diary_chau',
    title: 'Cuốn Sổ Tay Của Châu Tổng',
    target: '2 cảnh ngoại truyện · Minh Châu',
    description: 'Khám phá áp lực điểm số gia đình và tâm tư thật sự của Minh Châu sau mẩu giấy mật lệnh đầu tiên.',
    currency: 'stamp',
    price: 60,
    actionLabel: 'Mở ngoại truyện',
    featured: true,
  },
  {
    id: 'str_02',
    section: 'stories',
    art: 'crayon_ha',
    title: 'Hộp Bút Màu Sáp Của Mây',
    target: '2 cảnh ngoại truyện · Hạ',
    description: 'Theo chân Hạ trong những ngày đầu chuyển trường bỡ ngỡ và cách tình bạn với Quân bắt đầu.',
    currency: 'stamp',
    price: 60,
    actionLabel: 'Mở ngoại truyện',
  },

  // 5. Hoạt động sắp ra mắt
  {
    id: 'up_daily',
    section: 'upcoming',
    art: 'daily',
    title: 'Sinh Hoạt Trường & Tạp Hóa',
    target: 'Nhiệm vụ ngày · Sân trường',
    description: 'Trực nhật, đá cầu giờ ra chơi, tưới hoa sân trường và ghé tiệm tạp hóa kiếm thêm Xu Kỷ Niệm.',
    currency: 'free',
    price: 0,
    actionLabel: 'Xem lịch ra mắt',
  },
  {
    id: 'up_side_kv',
    section: 'upcoming',
    art: 'keepsakes',
    title: 'Bộ Kỷ Vật Vụn Vặt (6 món)',
    target: 'Album "Những ngày vụn vặt"',
    description: 'Sưu tầm Bi ve, Hoa phượng ép, Kim bơm bóng, giấy Ask.fm, Huy hiệu 26/3 và Ảnh Pitu.',
    currency: 'free',
    price: 0,
    actionLabel: 'Xem bộ sưu tập',
  },
];

export const BLIND_BOX_CONFIG = {
  title: 'Túi Mù Cổng Trường',
  subtitle: 'Tiệm tạp hóa thập niên 2010 · Bộ sưu tập 12 thẻ bài ký ức',
  description: 'Mỗi lần xé túi mù có cơ hội nhận ngẫu nhiên Bi ve mắt mèo, thẻ 12 cung hoàng đạo 2015 hoặc sticker meme cổ điển. Đủ 12 thẻ mở khóa danh hiệu "Trùm Cổng Trường" & mô hình kệ phòng 2026.',
  singleRoll: { label: 'Mở 1 lần', currency: 'coin' as const, price: 100 },
  tenRoll: { label: 'Mở 10 lần', currency: 'stamp' as const, price: 10 },
  previewTags: ['Bi ve mắt mèo', 'Thẻ 12 cung 2015', 'Sticker meme', 'Thước kẻ dẻo', 'Vòng tay phát sáng', 'Kẹo C trái tim'],
};

/** Màn hình Nạp Tem & Vé (tham khảo mô hình Kim Cương Hồng/Tím & Thẻ Đặc Quyền trong game NSTT). */
export const TOPUP_PACKS: readonly TopUpPack[] = [
  {
    id: 'tp_60',
    title: 'Túi Tem Nhỏ',
    stampAmount: 60,
    bonusLabel: 'Tặng +60 lần đầu (x2)',
    priceVnd: '19.000đ',
    badge: 'x2 Lần đầu',
  },
  {
    id: 'tp_180',
    title: 'Hộp Tem Thanh Xuân',
    stampAmount: 180,
    bonusLabel: 'Tặng thêm +30 Tem',
    priceVnd: '49.000đ',
    badge: 'Phổ biến',
  },
  {
    id: 'tp_380',
    title: 'Rương Kỷ Niệm',
    stampAmount: 380,
    bonusLabel: 'Tặng thêm +80 Tem',
    priceVnd: '99.000đ',
  },
  {
    id: 'tp_980',
    title: 'Kho Báu Tuổi Học Trò',
    stampAmount: 980,
    bonusLabel: 'Tặng thêm +260 Tem',
    priceVnd: '239.000đ',
    badge: 'Giá trị nhất',
  },
  {
    id: 'tp_pass',
    title: 'Vé Mở Chương Toàn Phần',
    stampAmount: 150,
    bonusLabel: 'Mở khóa toàn bộ các mốc sau + nhận ngay 150 Tem',
    priceVnd: '79.000đ',
    badge: 'Đặc quyền',
    isPass: true,
    description: 'Mở khóa trọn bộ các chương ký ức tương lai ngay khi phát hành.',
  },
];

export const COIN_EXCHANGE_PACKS: readonly ExchangePack[] = [
  { id: 'ex_100', title: '100 Xu Kỷ Niệm', coinAmount: 100, costStamp: 10 },
  { id: 'ex_550', title: '550 Xu Kỷ Niệm', coinAmount: 550, costStamp: 50, badge: '+10% Xu' },
];

export const REWARDED_AD_OFFER = {
  id: 'cur_ads',
  title: 'Xem Quảng Cáo Có Thưởng',
  description: 'Xem một đoạn quảng cáo ngắn tại tiệm tạp hóa để nhận thêm Xu Kỷ Niệm miễn phí.',
  rewardCoin: 50,
  actionLabel: 'Nhận +50 Xu',
};

export function isShopDemoEnabled(appEnv: 'test' | 'production', search = ''): boolean {
  if (appEnv === 'production') return SHOP_DEMO_CONFIG.enabled_in_production;
  if (search) {
    const val = new URLSearchParams(search).get(SHOP_DEMO_CONFIG.url_param);
    if (val === '1' || val === 'true') return true;
    if (val === '0' || val === 'false') return false;
  }
  return SHOP_DEMO_CONFIG.enabled_in_test;
}
