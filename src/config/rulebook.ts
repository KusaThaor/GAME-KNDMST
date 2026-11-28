/**
 * Cấu hình & nhãn hiển thị cho Cuốn sổ mật mã / Quy tắc Căn cứ (Mốc 1 & Phòng 2026).
 * Tái sử dụng dữ liệu canon từ mg_cipher / mg_rules và mapping lựa chọn trong SaveState / flags.
 */
import { CIPHER } from '../game/minigames/games/mg_cipher';
import { RULES } from '../game/minigames/games/mg_rules';

export const RULEBOOK_CONFIG = {
  title: 'Cuốn sổ mật mã & Quy tắc Căn cứ',
  subtitle: 'Sổ bìa xanh — Lưu giữ mật lệnh, 5 điều luật và dấu ấn nhóm năm đứa',
  locked_hint: 'Chơi qua Trang 1 và Trang 3 để mở khóa thêm nội dung trong cuốn sổ này.',
  cipher: {
    title: 'Mật lệnh số 01 (Lớp 6, 2014)',
    solution: CIPHER.message,
    symbols: [...CIPHER.symbols],
    note: 'Mẩu giấy gấp tư toàn hình tròn, hình vuông… giải ra chỉ là lời rủ "RA CHƠI" ngoài sân đá cầu.',
  },
  rules: RULES.lines,
  flag_labels: {
    'm1.wish': {
      label: 'Điều ước trên cánh buồm (Trang 2)',
      values: {
        friendship: 'Mai mốt vẫn chơi chung vầy.',
        fun: 'Lớp 7 vui hơn lớp 6.',
        secret: 'Bí mật không nói ra.',
      } as Record<string, string>,
    },
    'm1.base_decor': {
      label: 'Phong cách trang trí Căn cứ (Trang 3)',
      values: {
        paper: 'Giấy màu (cờ giấy & hạc giấy)',
        flowers: 'Hoa dại',
        photos: 'Dây kẹp ảnh',
      } as Record<string, string>,
    },
    'm1.group_photo_style': {
      label: 'Kiểu chụp ảnh đủ năm đứa (Trang 4)',
      values: {
        playful: 'Tạo dáng nhí nhố làm mặt hề',
        gentle: 'Đứng tự nhiên, khoác vai cười tươi',
        deep: 'Nghiêm trang chỉnh tề như ảnh thẻ',
      } as Record<string, string>,
    },
  },
  extra_fields: [
    { key: 'cipher_symbol', flag: 'm1.cipher_symbol', label: 'Ký hiệu riêng' },
    { key: 'nickname', flag: 'm1.nickname', label: 'Biệt danh trong nhóm' },
    { key: 'base_name', flag: 'm1.base_name', label: 'Tên Căn cứ' },
    { key: 'base_symbol', flag: 'm1.base_symbol', label: 'Biểu tượng Căn cứ' },
    { key: 'custom_rule', flag: 'm1.custom_rule', label: 'Điều luật bổ sung' },
    { key: 'promise', flag: 'm1.promise', label: 'Lời hẹn cuối Mốc 1' },
  ] as const,
} as const;
