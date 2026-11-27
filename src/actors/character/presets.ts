/**
 * Bộ nhân vật dựng bằng code (GDD 10.1, 10.3, 10.4). Đây là dữ liệu — đổi màu/tóc/dáng ở đây,
 * không phải sửa code dựng hình.
 * Trạng thái: PROPOSED — chủ dự án duyệt bằng ảnh spike S1 (16/11).
 */
export type CharacterId = 'duc' | 'quan' | 'chau' | 'ha' | 'player1' | 'player2';
export type Grade = 6 | 9;
export type HairStyle =
  | 'spiky'
  | 'buzz'
  | 'ponytail_high'
  | 'long_clip'
  | 'short_fringe'
  | 'ponytail_low'
  | 'two_buns'
  | 'wavy_bob'
  | 'side_part';
export type PropId = 'marble_pouch' | 'pen' | 'football' | 'water_bottle' | 'watch' | 'planner' | 'sketchbook' | 'backpack';

export interface GradeLook {
  hair: HairStyle;
  hairLength: number;        // 0.8–1.4: dài/ngắn tương đối trong cùng kiểu tóc
  width: number;             // hệ số bề ngang thân
  height: number;            // hệ số chiều cao
  props: PropId[];
}

export interface CharacterDef {
  id: CharacterId;
  name: string;              // tên hiển thị trong ô thoại
  nickname?: string;
  uiColor: string;           // màu tên trong ô thoại
  skin: string;
  hairColor: string;
  accent: string;            // màu phụ kiện (kẹp tóc, dây buộc, ba lô…)
  idle: { bounce: number; lookUp: number; tilt: number };  // dáng đứng riêng
  g6: GradeLook;
  g9: GradeLook;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  duc: {
    id: 'duc', name: 'Đức', nickname: 'Tí Nổ', uiColor: '#e0702a',
    skin: '#e2ad80', hairColor: '#1f1a1a', accent: '#3d7dd8',
    idle: { bounce: 1.6, lookUp: 0, tilt: 0.05 },
    g6: { hair: 'spiky', hairLength: 1, width: 0.9, height: 1, props: ['marble_pouch', 'pen'] },
    g9: { hair: 'spiky', hairLength: 1.25, width: 0.9, height: 1.02, props: ['pen'] },
  },
  quan: {
    id: 'quan', name: 'Quân', nickname: 'Bắp', uiColor: '#3f9a4e',
    skin: '#e8b98c', hairColor: '#2c2420', accent: '#2e86c1',
    idle: { bounce: 0.8, lookUp: 0, tilt: -0.03 },
    g6: { hair: 'buzz', hairLength: 1, width: 1.25, height: 1.06, props: ['football'] },
    g9: { hair: 'buzz', hairLength: 1.2, width: 1.38, height: 1.12, props: ['football', 'water_bottle'] },
  },
  chau: {
    id: 'chau', name: 'Minh Châu', nickname: 'Châu Tổng', uiColor: '#8a55c9',
    skin: '#f5d2b0', hairColor: '#211b1c', accent: '#2bb3a3',
    idle: { bounce: 1, lookUp: 0, tilt: 0 },
    g6: { hair: 'ponytail_high', hairLength: 1, width: 0.97, height: 1, props: ['watch', 'planner'] },
    g9: { hair: 'ponytail_high', hairLength: 1.3, width: 0.97, height: 1.02, props: ['watch', 'planner'] },
  },
  ha: {
    id: 'ha', name: 'Hạ', nickname: 'Mây', uiColor: '#e0608f',
    skin: '#f7d8bd', hairColor: '#2a1f1d', accent: '#f6b6c8',
    idle: { bounce: 0.9, lookUp: 0.14, tilt: 0.09 },
    g6: { hair: 'long_clip', hairLength: 1, width: 0.94, height: 0.97, props: ['sketchbook'] },
    g9: { hair: 'long_clip', hairLength: 1.35, width: 0.94, height: 0.99, props: ['sketchbook'] },
  },
  player1: {
    id: 'player1', name: '{player_name}', uiColor: '#2f6fb3',
    skin: '#efc39b', hairColor: '#231c1a', accent: '#4a78c2',
    idle: { bounce: 1, lookUp: 0.03, tilt: 0 },
    g6: { hair: 'short_fringe', hairLength: 1, width: 1, height: 1, props: ['backpack'] },
    g9: { hair: 'short_fringe', hairLength: 1.25, width: 1.02, height: 1.04, props: ['backpack'] },
  },
  player2: {
    id: 'player2', name: '{player_name}', uiColor: '#2f6fb3',
    skin: '#f3cfae', hairColor: '#2b211e', accent: '#f2c14e',
    idle: { bounce: 1, lookUp: 0.03, tilt: 0 },
    g6: { hair: 'ponytail_low', hairLength: 1, width: 0.97, height: 0.99, props: ['backpack'] },
    g9: { hair: 'ponytail_low', hairLength: 1.3, width: 0.97, height: 1.02, props: ['backpack'] },
  },
};

export const FRIENDS: CharacterId[] = ['duc', 'quan', 'chau', 'ha'];
export const PLAYER_LOOKS: CharacterId[] = ['player1', 'player2'];

/** Màu đồng phục (GDD 10.2 — ỦY QUYỀN). */
export const UNIFORM = {
  shirt: '#f7f5ef',
  shirtShade: '#e6e2d6',
  trousers: '#24345a',
  belt: '#2a2a30',
  nametag: '#cfe3f5',
  scarf: '#d8332a',
  shoe: '#f4f1ea',
  sole: '#c9bfb2',
} as const;
