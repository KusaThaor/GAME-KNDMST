/**
 * TRANG 5 (d.g08.01) — LÊN LỚP 8 (Đầu lớp 8, Tháng 9/2016)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md dòng 331–395 (v1.4)
 * GDD nguồn: 02_GAMEPLAY_AND_MECHANICS.md §2.1 (Ván caro thay bước chọn ô)
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g08.01',
  title: 'Trang 5: Lên lớp 8',
  school_year_id: 'g08',
  map_id: 'map_thcs',
  map_variant: 'g08',
  open_zones: ['zone.thcs.yard', 'zone.thcs.gate', 'zone.thcs.corridor', 'zone.thcs.classroom'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m2_01',
  main_chain: ['q_m2_main_05'],
  side_quests: [],
  daily_pool: [],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.gate_front', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.corridor_door', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_bench_2', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_bench_1', motion: 'idle' },
    { actor: 'npc_guard', marker: 'spot.thcs.guard_corridor', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.snack_cart', label: 'Xe quà vặt cổng trường', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.class_list', label: 'Bảng phân lớp', zone_id: 'zone.thcs.corridor', kind: 'marker' },
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.chalk_box', label: 'Hộp phấn trên bục giảng', zone_id: 'zone.thcs.classroom', kind: 'marker' },
  ],
  cameras: [
    { id: 'cam.d0801.caro', marker: 'cam.thcs.m2_caro_board', fov: 45 },
    { id: 'cam.d0801.opening', marker: 'cam.thcs.m2_opening', fov: 50 },
  ],
  album_page_id: 'page.d.g08.01',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m2_main_05',
    type: 'main',
    scope: 'm2',
    memory_day_id: 'd.g08.01',
    title: 'Lên lớp 8',
    blocks_main: true,
    steps: [
      // ---------- CẢNH A · Khai giảng lớp 8 (dòng 339–358) ----------
      {
        id: 'q_m2_main_05.s01',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Gặp Đức ở xe quà vặt cổng trường',
        lines: [
          { speaker: 'NPC_A', text: 'Ê! {player_name}! Chai này đứng được năm lần liền, ghê chưa?' },
        ],
      },
      {
        id: 'q_m2_main_05.s02',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Xem danh sách lớp cùng Châu',
        lines: [
          { speaker: 'NPC_B', text: '{player_name}! Tui dò rồi. Năm đứa chung lớp hết. Tui dò ba lần.' },
        ],
      },
      {
        id: 'q_m2_main_05.s03',
        kind: 'talk',
        with: 'NPC_D',
        objective: 'Gặp Quân ở cột rổ góc sân',
        lines: [
          { speaker: 'NPC_D', text: 'May quá… năm nay đủ năm đứa.' },
        ],
      },
      {
        id: 'q_m2_main_05.s04',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Gặp Hạ dưới gốc phượng',
        lines: [
          { speaker: 'NPC_C', text: 'Lá đầu năm. Năm nào Hạ cũng ép một lá.' },
          { speaker: 'NPC_C', text: 'Chụp từ dưới lên nha. Hạ muốn trời lọt vô ảnh.' },
        ],
      },
      {
        id: 'q_m2_main_05.s05',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0801.opening',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g08.01.02',
        stand_zone: { marker: 'spot.thcs.yard_bench_2', radius: 1.5 },
        objective: 'Nhờ bạn cùng lớp chụp ảnh năm đứa dưới gốc phượng',
      },

      // ---------- CẢNH B · Trực nhật và ván caro cuối buổi (dòng 359–395) ----------
      {
        id: 'q_m2_main_05.s06',
        kind: 'choice',
        choice_id: 'c_m2_05_duty',
        measured: true,
        about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        objective: 'Chọn bạn cùng làm trực nhật',
        prompt: {
          speaker: 'NPC_B',
          text: 'Góc phải còn phấn kìa. Không, thấp hơn. Rồi.',
        },
        options: [
          { id: 'duc', tone: 'playful', text: 'Lau bảng cùng Đức', set_flags: { 'm2.duty_partner': 'duc' } },
          { id: 'ha', tone: 'gentle', text: 'Lau bảng cùng Hạ', set_flags: { 'm2.duty_partner': 'ha' } },
          { id: 'quan', tone: 'deep', text: 'Kê ghế cùng Quân', set_flags: { 'm2.duty_partner': 'quan' } },
        ],
      },
      {
        id: 'q_m2_main_05.s07',
        kind: 'interact',
        target: 'itr.thcs.blackboard',
        objective: 'Lau sạch bảng cùng bạn trực nhật',
        lines: [
          { speaker: 'NPC_A', text: 'Lau kiểu này mới nhanh nè!', when: { flag: 'm2.duty_partner', equals: 'duc' }, fallback: '' },
          { speaker: 'NPC_C', text: '{player_name} lau ngang, Hạ lau dọc. Vậy hông sót.', when: { flag: 'm2.duty_partner', equals: 'ha' }, fallback: '' },
          { speaker: 'NPC_D', text: 'Tớ khiêng. Cậu chỉ chỗ đặt.', when: { flag: 'm2.duty_partner', equals: 'quan' }, fallback: '' },
          { speaker: 'NPC_A', text: 'Bảng sạch vầy mà không xài thì phí. Một ván thôi. Đứa nào thua lau.' },
          { speaker: 'NPC_D', text: '…Một ván.' },
        ],
      },
      {
        id: 'q_m2_main_05.s08',
        kind: 'minigame',
        game: 'mg_caro',
        level: 'min',
        opponent: 'chr_duc',
        objective: 'Chơi ván cờ caro trên bảng lớp',
      },
      {
        id: 'q_m2_main_05.s09',
        kind: 'cutscene',
        objective: 'Bác bảo vệ nhắc sắp khóa cổng trường',
        lines: [
          { speaker: 'NPC_B', text: 'Đã nói một ván.' },
          { speaker: 'NPC_D', text: 'Ván cuối mà cậu cứ đòi gỡ.' },
          { speaker: 'npc_guard', text: 'Mấy đứa! Sắp khóa cổng rồi, bảng còn trắng xóa vầy hả?' },
          { speaker: 'NPC_A', text: 'Khoan khoan, ván này chưa xong!' },
          { speaker: 'NPC_B', text: 'Ghi tỉ số lại, mai đánh tiếp.' },
        ],
      },
      {
        id: 'q_m2_main_05.s10',
        kind: 'interact',
        target: 'itr.thcs.blackboard',
        objective: 'Xem lại bàn cờ caro trên bảng trước khi xóa',
        lines: [
          { speaker: 'player', text: 'Khoan, chụp cái bảng đã.' },
        ],
      },
      {
        id: 'q_m2_main_05.s11',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0801.caro',
        subjects: ['player', 'NPC_A', 'NPC_D'],
        album_entry_id: 'alb.d.g08.01.01',
        stand_zone: { marker: 'spot.thcs.class_front', radius: 1.2 },
        objective: 'Chụp lại bàn cờ caro dang dở trên bảng đen',
      },
      {
        id: 'q_m2_main_05.s12',
        kind: 'minigame',
        game: 'mg_wipe_board',
        level: 'min',
        objective: 'Lau sạch bảng lần hai trước khi ra về',
      },
      {
        id: 'q_m2_main_05.s13',
        kind: 'cutscene',
        objective: 'Thu dọn đồ đạc',
        lines: [
          { speaker: 'NPC_A', text: 'Lẹ lên tụi mày ơi, về trễ là khỏi ăn cơm!' },
          { speaker: 'NPC_C', text: 'Bụi bay vô cặp Hạ hết rồi nè…' },
        ],
      },
      {
        id: 'q_m2_main_05.s14',
        kind: 'interact',
        target: 'itr.thcs.chalk_box',
        objective: 'Cất mẩu phấn cuối cùng vào hộp phấn trên bục giảng',
        lines: [
          { speaker: 'NPC_A', text: 'Mày giữ hộp đó nha. Mai gỡ.' },
        ],
      },
      {
        id: 'q_m2_main_05.s15',
        kind: 'goto',
        target: 'itr.thcs.snack_cart',
        objective: 'Đi ra cổng trường để về nhà',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m2_01',
  name: 'Hộp phấn giấy móp',
  description: 'Hộp phấn giấy cũ đựng mẩu phấn ngắn tũn, mặt trong nắp ghi tỉ số caro: "QUÂN 4 – ĐỨC 3 (CHƯA XONG)".',
  school_year_id: 'g08',
  hook_2026: 'Chưa xong… Rồi có ai đánh tiếp đâu.',
  appear_when: { day: 'd.g07.03' },
  target_memory_day_id: 'd.g08.01',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g08.01.01', 'frag.d.g08.01.02', 'frag.d.g08.01.03'],
  album_entry_ids: ['alb.d.g08.01.01', 'alb.d.g08.01.02', 'alb.d.g08.01.03', 'alb.d.g08.01.04'],
  shape: 'box',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g08.01.01', memory_day_id: 'd.g08.01', kind: 'photo', source_quest_id: 'q_m2_main_05', media_spec: 'A' },
  { id: 'frag.d.g08.01.02', memory_day_id: 'd.g08.01', kind: 'photo', source_quest_id: 'q_m2_main_05', media_spec: 'B' },
  { id: 'frag.d.g08.01.03', memory_day_id: 'd.g08.01', kind: 'note', source_quest_id: 'q_m2_main_05', text: 'Đầu năm lớp 8: bàn cờ caro dang dở trên bảng trắng và lời hẹn mai đánh tiếp.' },
  { id: 'frag.d.g08.01.04', memory_day_id: 'd.g08.01', kind: 'artifact' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g08.01.01', page_id: 'page.d.g08.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g08.01.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0801.caro', at_step_id: 'q_m2_main_05.s11' }, replayable: true },
  { id: 'alb.d.g08.01.02', page_id: 'page.d.g08.01', slot_type: 'free_photo', slot_index: 1, fragment_id: 'frag.d.g08.01.02', source: 'gameplay_photo', required_for_restore: false, snapshot: { camera_id: 'cam.d0801.opening', at_step_id: 'q_m2_main_05.s05' }, replayable: true },
  { id: 'alb.d.g08.01.03', page_id: 'page.d.g08.01', slot_type: 'note', slot_index: 2, fragment_id: 'frag.d.g08.01.03', source: 'text', required_for_restore: true },
  { id: 'alb.d.g08.01.04', page_id: 'page.d.g08.01', slot_type: 'artifact', slot_index: 3, fragment_id: 'frag.d.g08.01.04', source: 'sticker_art', required_for_restore: true },
];
