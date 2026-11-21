/**
 * MINIGAMES REGISTRY & FACTORY — KNĐMST
 * Điểm tập trung xuất và khởi tạo 11 Minigame Mốc 1 & Khu Vui Chơi Căn Cứ.
 */

import { IMinigameEngine, MinigameBaseConfig, MinigameId, MinigameMeta } from './types';
import { OAnQuanEngine } from './o_an_quan';
import { HopscotchEngine } from './nhay_lo_co';
import { FoldBoatEngine } from './fold_boat';
import { PhoenixButterflyEngine } from './phoenix_butterfly';
import { MarblesEngine } from './ban_bi_ve';
import { RulerBattleEngine } from './ruler_battle';
import { RPSBattleEngine } from './rock_paper_scissors';
import { RescueBoatEngine } from './rescue_boat';
import { SweepLeavesEngine } from './sweep_leaves';
import { PaintSignboardEngine } from './paint_signboard';
import { RaindropRhythmEngine } from './raindrop_rhythm';

export * from './types';
export * from './o_an_quan';
export * from './nhay_lo_co';
export * from './fold_boat';
export * from './phoenix_butterfly';
export * from './ban_bi_ve';
export * from './ruler_battle';
export * from './rock_paper_scissors';
export * from './rescue_boat';
export * from './sweep_leaves';
export * from './paint_signboard';
export * from './raindrop_rhythm';

/**
 * Danh mục 11 minigame hoàn chỉnh của Mốc 1 & Căn cứ
 */
export const MINIGAMES_CATALOG: MinigameMeta[] = [
  // 4 TRÒ ƯU TIÊN HÀNG ĐẦU
  {
    id: 'o_an_quan',
    name: 'Ô Ăn Quan Căn Cứ',
    category: 'base_free',
    priority: 1,
    page_scope: 'Căn cứ',
    description: 'Trò chơi trí tuệ dân gian trên bàn vẽ nền đất Căn cứ với 4 đối thủ (Đức, Hạ, Quân, Châu) đại diện cho 4 cấp độ tư duy.',
    controls_hint: 'Chọn ô dân của bạn -> Chọn chiều rải (Thuận/Nghịch kim đồng hồ).'
  },
  {
    id: 'nhay_lo_co',
    name: 'Nhảy Ô Lò Cò Căn Cứ',
    category: 'base_free',
    priority: 1,
    page_scope: 'Căn cứ',
    description: 'Chinh phục 10 ô lò cò truyền thống, ném sành chuẩn xác và giữ thăng bằng nhặt sành với 4 bạn nhỏ.',
    controls_hint: 'Căn lực ném sành -> Phím Space/Tap nhảy ô -> Điều chỉnh thăng bằng khi nhặt sành.'
  },
  {
    id: 'fold_boat',
    name: 'Gấp Thuyền Giấy Báo',
    category: 'story',
    priority: 1,
    page_scope: 'Trang 2',
    description: 'Nghệ thuật gấp giấy học trò 4 nếp gấp tuần tự tạo chiến hạm giấy báo bền bỉ trước dòng nước mương.',
    controls_hint: 'Kéo vuốt chuột/cảm ứng theo đường nếp chỉ dẫn trên mặt giấy.'
  },
  {
    id: 'phoenix_butterfly',
    name: 'Ép Bướm Hoa Phượng',
    category: 'nature',
    priority: 1,
    page_scope: 'Trang 4',
    description: 'Ghép 6 cánh và nhị hoa phượng vĩ sau mưa vào trang sổ lưu bút tạo hình con bướm kỷ niệm.',
    controls_hint: 'Kéo thả cánh hoa vào khung trang giấy -> Xoay góc -> Bấm Kẹp sổ.'
  },

  // 7 TRÒ HOÀN THIỆN THEO MỨC ĐỘ ƯU TIÊN
  {
    id: 'ban_bi_ve',
    name: 'Bắn Bi Ve Bãi Đất',
    category: 'base_free',
    priority: 2,
    page_scope: 'Căn cứ',
    description: 'Đấu trường bắn bi ve kẹp ngón tay với 4 đối thủ, tính toán phản xạ bật gờ đất và lực va chạm đàn hồi.',
    controls_hint: 'Kéo lùi để lấy lực và ngắm góc -> Thả tay để bắn viên bi.'
  },
  {
    id: 'ruler_battle',
    name: 'Búng Thước Kẻ Học Trò',
    category: 'classroom',
    priority: 2,
    page_scope: 'Trang 1',
    description: 'Đấu búng thước dẻo trên mặt bàn học bằng gỗ, đè thước đối thủ hoặc hất văng khỏi mép bàn.',
    controls_hint: 'Ngắm góc và kéo thanh lực búng.'
  },
  {
    id: 'rock_paper_scissors',
    name: 'Oẳn Tù Tì Búng Tai',
    category: 'classroom',
    priority: 2,
    page_scope: 'Trang 1',
    description: 'Oẳn tù tì phân định thắng thua chạm 3, nắm bắt thói quen ra đòn tâm lý của từng đứa bạn.',
    controls_hint: 'Bấm chọn Búa, Kéo, hoặc Bao.'
  },
  {
    id: 'rescue_boat',
    name: 'Vớt Thuyền Que Tre',
    category: 'story',
    priority: 2,
    page_scope: 'Trang 2',
    description: 'Cầm cành cây tre canh đón dòng nước cứu những chiếc thuyền giấy gặp nạn trước khi trôi vào miệng cống.',
    controls_hint: 'Di chuyển đầu que tre -> Bấm nút Vợt/Khều khi thuyền trôi qua.'
  },
  {
    id: 'sweep_leaves',
    name: 'Quét Lá Dọn Căn Cứ',
    category: 'story',
    priority: 3,
    page_scope: 'Trang 3',
    description: 'Cầm chổi rơm quét sạch các cụm lá khô dưới gốc cây tạo mặt bằng sạch sẽ dựng căn cứ.',
    controls_hint: 'Vuốt vệt chổi đẩy lá khô dồn về góc hố rác.'
  },
  {
    id: 'paint_signboard',
    name: 'Tô Biển Tên Căn Cứ',
    category: 'story',
    priority: 3,
    page_scope: 'Trang 3',
    description: 'Chọn màu sáp tô rực rỡ 5 chữ cái "C Ă N C Ứ" trên tấm biển gỗ kẹp trước cửa căn cứ.',
    controls_hint: 'Chọn màu sáp trên khay màu -> Tô kín các chữ cái.'
  },
  {
    id: 'raindrop_rhythm',
    name: 'Nhịp Mưa Tí Tách',
    category: 'nature',
    priority: 3,
    page_scope: 'Trang 4',
    description: 'Hòa nhịp cùng tiếng mưa rào mùa hè rơi tí tách trên mái che Căn cứ bí mật.',
    controls_hint: 'Chạm vào 3 làn đón giọt nước khi nốt mưa chạm vạch.'
  }
];

/**
 * Factory khởi tạo minigame engine theo ID
 */
export function createMinigame(
  game_id: MinigameId,
  config?: MinigameBaseConfig
): IMinigameEngine<any, any> {
  switch (game_id) {
    case 'o_an_quan':
      return new OAnQuanEngine(config);
    case 'nhay_lo_co':
      return new HopscotchEngine(config);
    case 'fold_boat':
      return new FoldBoatEngine(config);
    case 'phoenix_butterfly':
      return new PhoenixButterflyEngine(config);
    case 'ban_bi_ve':
      return new MarblesEngine(config);
    case 'ruler_battle':
      return new RulerBattleEngine(config);
    case 'rock_paper_scissors':
      return new RPSBattleEngine(config);
    case 'rescue_boat':
      return new RescueBoatEngine(config);
    case 'sweep_leaves':
      return new SweepLeavesEngine(config);
    case 'paint_signboard':
      return new PaintSignboardEngine(config);
    case 'raindrop_rhythm':
      return new RaindropRhythmEngine(config);
    default:
      throw new Error(`[MinigamesFactory] Chưa hỗ trợ game_id: ${game_id}`);
  }
}
