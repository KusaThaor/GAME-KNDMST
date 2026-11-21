/**
 * TRANG 5 (d.g08.01) — LÊN LỚP 8 (Đầu lớp 8, Tháng 9/2016)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - {g:ông|bà}"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_DRAFT', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g08.01',
  title: 'Trang 5: Lên lớp 8',
  school_year_id: 'g08',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.classroom', 'zone.thcs.yard', 'zone.thcs.gate', 'zone.thcs.corridor', 'zone.thcs.base', 'zone.thcs.field'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m2_01',
  main_chain: ['q_m2_main_01'],
  side_quests: ['q_m2_side_01'],
  daily_pool: ['q_m1_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.gate_front', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.yard_bench_1', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_bench_2', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_group_1', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.snack_cart', label: 'Xe quà vặt cổng trường', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.stone_bench', label: 'Ghế đá sân trường', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ để đồ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [
    { id: 'cam.d0801.opening', marker: 'cam.thcs.yard_group', fov: 40 },
    { id: 'cam.d0801.board', marker: 'cam.thcs.yard_bench', fov: 38 },
  ],
  album_page_id: 'page.d.g08.01',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m2_main_01',
    type: 'main',
    scope: 'm2',
    memory_day_id: 'd.g08.01',
    title: 'Lên lớp 8',
    blocks_main: true,
    steps: [
      {
        id: 'q_m2_main_01.s01',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Gặp Đức ở xe quà vặt cổng trường',
        lines: [
          { speaker: 'NPC_A', text: 'Ê! {player_name}! Chai này đứng được năm lần liền, ghê chưa?' },
        ],
      },
      {
        id: 'q_m2_main_01.s02',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Gặp Châu xem danh sách phân lớp',
        lines: [
          { speaker: 'NPC_B', text: '{player_name}! Tui dò rồi. Năm đứa chung lớp hết. Tui dò ba lần.' },
        ],
      },
      {
        id: 'q_m2_main_01.s03',
        kind: 'talk',
        with: 'NPC_D',
        objective: 'Gặp Quân ở góc sân rổ',
        lines: [
          { speaker: 'NPC_D', text: 'May quá… năm nay đủ năm đứa.' },
        ],
      },
      {
        id: 'q_m2_main_01.s04',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Gặp Hạ dưới gốc phượng',
        lines: [
          { speaker: 'NPC_C', text: 'Lá đầu năm. Năm nào Hạ cũng ép một lá.' },
          { speaker: 'NPC_C', text: 'Chụp từ dưới lên nha. Hạ muốn trời lọt vô ảnh.' },
        ],
      },
      {
        id: 'q_m2_main_01.s05',
        kind: 'photo',
        mode: 'timer',
        camera_id: 'cam.d0801.opening',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g08.01.02',
        stand_zone: { marker: 'spot.thcs.yard_group', radius: 1.2 },
        objective: 'Đứng vào hàng chụp ảnh khai giảng đủ năm đứa',
      },
      {
        id: 'q_m2_main_01.s06',
        kind: 'cutscene',
        objective: 'Vài hôm sau, buổi trực nhật cuối ngày',
        lines: [
          { speaker: 'narrator', text: 'Vài hôm sau. Buổi trực nhật cuối ngày.' },
          { speaker: 'narrator', text: 'Lớp đã vãn, nắng chiều hắt qua cửa sổ. Bảng kín chữ tiết cuối.' },
          { speaker: 'narrator', text: 'Hộp phấn trên bục chỉ còn đúng một mẩu.' },
          { speaker: 'NPC_B', text: 'Góc phải còn phấn kìa. Không, thấp hơn. Rồi.' },
        ],
      },
      {
        id: 'q_m2_main_01.s07',
        kind: 'choice',
        choice_id: 'c_m2_01_partner',
        measured: false,
        about: ['NPC_A', 'NPC_C', 'NPC_D'],
        objective: 'Chọn bạn cùng làm cặp trực nhật',
        options: [
          { id: 'duc', text: 'Lau bảng với Đức', set_flags: { 'm2.partner': 'duc' } },
          { id: 'ha', text: 'Lau bảng với Hạ', set_flags: { 'm2.partner': 'ha' } },
          { id: 'quan', text: 'Kê ghế với Quân', set_flags: { 'm2.partner': 'quan' } },
        ],
      },
      {
        id: 'q_m2_main_01.s08',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Bắt đầu làm trực nhật',
        lines: [
          { speaker: 'NPC_A', text: 'Lau kiểu này mới nhanh nè!', when: { flag: 'm2.partner', equals: 'duc' }, fallback: 'Bảng sạch vầy mà không xài thì phí.' },
          { speaker: 'NPC_C', text: '{player_name} lau ngang, Hạ lau dọc. Vậy hông sót.', when: { flag: 'm2.partner', equals: 'ha' }, fallback: 'Hạ lau phụ một tay nha.' },
          { speaker: 'NPC_D', text: 'Tớ khiêng. Cậu chỉ chỗ đặt.', when: { flag: 'm2.partner', equals: 'quan' }, fallback: 'Để tớ kê lại mấy cái bàn.' },
        ],
      },
      {
        id: 'q_m2_main_01.s09',
        kind: 'minigame',
        game: 'mg_wipe_board',
        level: 'min',
        objective: 'Lau sạch bảng đen lớp học',
      },
      {
        id: 'q_m2_main_01.s10',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Thách đấu cờ caro trên bảng',
        lines: [
          { speaker: 'NPC_A', text: 'Bảng sạch vầy mà không xài thì phí. Một ván thôi. Đứa nào thua lau.' },
          { speaker: 'NPC_D', text: '…Một ván.' },
        ],
      },
      {
        id: 'q_m2_main_01.s11',
        kind: 'minigame',
        game: 'mg_caro',
        level: 'min',
        objective: 'Chơi ván cờ caro trên bảng đen',
      },
      {
        id: 'q_m2_main_01.s12',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Kết quả ván cờ',
        lines: [
          { speaker: 'NPC_B', text: 'Đã nói một ván.' },
          { speaker: 'NPC_D', text: 'Ván cuối mà cậu cứ đòi gỡ.' },
        ],
      },
      {
        id: 'q_m2_main_01.s13',
        kind: 'cutscene',
        objective: 'Bác bảo vệ tới nhắc khóa cổng',
        lines: [
          { speaker: 'narrator', text: 'Bác bảo vệ: "Mấy đứa! Sắp khóa cổng rồi, bảng còn trắng xóa vầy hả?"' },
          { speaker: 'NPC_A', text: 'Khoan khoan, ván này chưa xong!' },
          { speaker: 'NPC_B', text: 'Ghi tỉ số lại, mai đánh tiếp.' },
          { speaker: 'narrator', text: 'Châu lục cặp không có giấy, cầm hộp phấn ghi vào mặt trong nắp.' },
          { speaker: 'player', text: 'Khoan, chụp cái bảng đã.' },
        ],
      },
      {
        id: 'q_m2_main_01.s14',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0801.board',
        subjects: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g08.01.01',
        objective: 'Chụp ảnh bàn cờ caro dang dở trên bảng',
      },
      {
        id: 'q_m2_main_01.s15',
        kind: 'minigame',
        game: 'mg_wipe_board',
        level: 'min',
        objective: 'Lau bảng lần hai trước giờ khóa cổng',
      },
      {
        id: 'q_m2_main_01.s16',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Cất hộp phấn và dặn dò',
        lines: [
          { speaker: 'NPC_A', text: 'Lẹ lên tụi mày ơi, về trễ là khỏi ăn cơm!' },
          { speaker: 'NPC_C', text: 'Bụi bay vô cặp Hạ hết rồi nè…' },
          { speaker: 'NPC_A', text: 'Mày giữ hộp đó nha. Mai gỡ.' },
        ],
      },
      {
        id: 'q_m2_main_01.s17',
        kind: 'interact',
        target: 'itr.thcs.blackboard',
        objective: 'Nhặt mẩu phấn cuối bỏ vào hộp',
      },
      {
        id: 'q_m2_main_01.s18',
        kind: 'goto',
        target: 'itr.thcs.snack_cart',
        objective: 'Cùng nhau đi qua cổng trường ra về',
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m2_side_01',
    type: 'side',
    scope: 'm2',
    memory_day_id: 'd.g08.01',
    title: 'Thử thách lật chai',
    blocks_main: false,
    steps: [
      {
        id: 'q_m2_side_01.s01',
        kind: 'interact',
        target: 'itr.thcs.snack_cart',
        objective: 'Xem Đức biểu diễn trò lật chai ở xe quà vặt',
        lines: [
          { speaker: 'NPC_A', text: 'Thử lật chai giống tao hông? Căn đúng lực là đứng liền!' },
        ],
      },
      {
        id: 'q_m2_side_01.s02',
        kind: 'minigame',
        game: 'mg_bottle_flip',
        level: 'min',
        objective: 'Thử thách lật chai nước đứng thăng bằng',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m2_01',
  name: 'Hộp phấn giấy móp',
  description: 'Hộp phấn còn một mẩu, mặt trong nắp ghi tỉ số caro dang dở QUÂN 4 – ĐỨC 3 (CHƯA XONG).',
  school_year_id: 'g08',
  hook_2026: 'Chưa xong… Rồi có ai đánh tiếp đâu.',
  appear_when: { day: 'd.g07.03' },
  target_memory_day_id: 'd.g08.01',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g08.01.01', 'frag.d.g08.01.02', 'frag.d.g08.01.03'],
  album_entry_ids: ['alb.d.g08.01.01', 'alb.d.g08.01.02', 'alb.d.g08.01.03', 'alb.d.g08.01.04', 'alb.d.g08.01.05'],
  new_present_action: 'pde_12',
  shape: 'box',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g08.01.01', memory_day_id: 'd.g08.01', kind: 'photo', source_quest_id: 'q_m2_main_01', media_spec: 'A' },
  { id: 'frag.d.g08.01.02', memory_day_id: 'd.g08.01', kind: 'photo', source_quest_id: 'q_m2_main_01', media_spec: 'B' },
  { id: 'frag.d.g08.01.03', memory_day_id: 'd.g08.01', kind: 'back_note', text: 'Đầu năm lớp 8: "Chung lớp hết, ván caro 4-3 chưa xong".' },
  { id: 'frag.d.g08.01.04', memory_day_id: 'd.g08.01', kind: 'artifact' },
  { id: 'frag.d.g08.01.05', memory_day_id: 'd.g08.01', kind: 'sticker', source_quest_id: 'q_m2_side_01', text: 'Kỷ lục lật chai nước cổng trường' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g08.01.01', page_id: 'page.d.g08.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g08.01.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0801.board', at_step_id: 'q_m2_main_01.s14' }, replayable: true },
  { id: 'alb.d.g08.01.02', page_id: 'page.d.g08.01', slot_type: 'free_photo', slot_index: 1, fragment_id: 'frag.d.g08.01.02', source: 'auto_snapshot', required_for_restore: false, snapshot: { camera_id: 'cam.d0801.opening', at_step_id: 'q_m2_main_01.s05' }, replayable: true },
  { id: 'alb.d.g08.01.03', page_id: 'page.d.g08.01', slot_type: 'back_note', slot_index: 2, fragment_id: 'frag.d.g08.01.03', source: 'text', required_for_restore: true },
  { id: 'alb.d.g08.01.04', page_id: 'page.d.g08.01', slot_type: 'artifact', slot_index: 3, fragment_id: 'frag.d.g08.01.04', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g08.01.05', page_id: 'page.d.g08.01', slot_type: 'sticker', slot_index: 4, fragment_id: 'frag.d.g08.01.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m2_side_01', replayable: true },
];
