/**
 * TRANG 1 (d.g06.01) — MẬT LỆNH SỐ 01 (Lớp 6, 2014)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức mới quen xưng "cậu - tớ", lỡ miệng "mày - tao" lúc trực nhật; Châu xưng "tui - ông/bà".
 * Chuẩn hóa N-01 (B1, B2, B3, C1, G-7).
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0' } as const;

export const day: MemoryDay = {
  id: 'd.g06.01',
  title: 'Trang 1: Mật lệnh số 01',
  school_year_id: 'g06',
  map_id: 'map_thcs',
  map_variant: 'g06',
  open_zones: ['zone.thcs.yard', 'zone.thcs.corridor', 'zone.thcs.classroom'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m1_01',
  main_chain: ['q_m1_main_01'],
  side_quests: ['q_m1_ai_side_01'],
  daily_pool: ['q_m1_ai_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.yard_bench_1', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.yard_bench_2', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.class_list', label: 'Bảng phân lớp', zone_id: 'zone.thcs.corridor', kind: 'marker' },
    { id: 'itr.thcs.grocery_steps', label: 'Bậc thềm tiệm tạp hóa', zone_id: 'zone.thcs.yard', kind: 'marker' },
    { id: 'itr.thcs.stone_bench', label: 'Ghế đá sân trường', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.flagpole', label: 'Cột cờ', zone_id: 'zone.thcs.yard', kind: 'marker' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.shuttle_ring', label: 'Sân đá cầu', zone_id: 'zone.thcs.yard', kind: 'marker' },
  ],
  cameras: [
    { id: 'cam.d0601.grocery', marker: 'cam.thcs.grocery', fov: 42 },
    { id: 'cam.d0601.bench', marker: 'cam.thcs.yard_bench', fov: 42 },
  ],
  album_page_id: 'page.d.g06.01',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m1_main_01',
    type: 'main',
    scope: 'm1',
    memory_day_id: 'd.g06.01',
    title: 'Mật lệnh số 01',
    blocks_main: true,
    steps: [
      {
        id: 'q_m1_main_01.s01',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Làm quen bạn mới và tìm bảng phân lớp',
        lines: [
          { speaker: 'NPC_A', text: 'Ê, bạn gì ơi! Vở của cậu nè, suýt bay xuống sân luôn đó.' },
          { speaker: 'player', text: 'À, cảm ơn cậu nha.' },
          { speaker: 'NPC_A', text: 'Cậu lớp này hả? Tớ cũng vậy nè. Đi chung hông, tớ đang kiếm phòng.' },
          { speaker: 'player', text: 'Ừ, tớ cũng chưa quen đường.' },
          { speaker: 'NPC_A', text: 'Yên tâm, để tớ dẫn. Tớ mới đi lạc có… hai lần thôi!' },
          { speaker: 'player', text: 'Ủa, vậy cậu có chắc biết đường không?' },
          { speaker: 'NPC_A', text: 'Ơ… chuyện nhỏ! Đi theo tớ là được!' },
        ],
      },
      {
        id: 'q_m1_main_01.s02',
        kind: 'minigame',
        game: 'mg_cipher',
        level: 'min',
        objective: 'Giải mật lệnh cùng Đức và Châu trong giờ học',
        lines: [
          { speaker: 'NPC_A', text: 'Ê, đọc đi! Mật lệnh tuyệt mật tớ vừa vẽ đó.' },
          { speaker: 'player', text: 'Sao nhìn giống cậu vẽ linh tinh hơn vậy?' },
          { speaker: 'NPC_B', text: 'Hai người làm gì đó? Đang trong giờ học mà.' },
          { speaker: 'NPC_A', text: 'Không có gì! Tụi tớ đang… nghiên cứu tài liệu.' },
          { speaker: 'NPC_B', text: 'Tài liệu gì toàn hình tròn hình vuông vậy trời? Đưa đây.' },
          { speaker: 'NPC_A', text: 'Ơ… dạ, Châu Tổng.' },
          { speaker: 'NPC_B', text: 'Gọi vậy nữa là tui khỏi sửa. Mật lệnh chỉ là rủ đá cầu ra chơi thôi à.' },
        ],
      },
      {
        id: 'q_m1_main_01.s03',
        kind: 'minigame',
        game: 'mg_footbag',
        level: 'min',
        objective: 'Xuống sân đá cầu cùng Đức và Châu',
        lines: [
          { speaker: 'NPC_A', text: 'Cậu cứ nhìn là biết tớ đá cầu giỏi cỡ nào!' },
          { speaker: 'NPC_B', text: 'Ừ, giỏi dữ chưa. Đá hụt cầu bay vô bụi rồi kìa, để tui đi lượm.' },
        ],
      },
      {
        id: 'q_m1_main_01.s04',
        kind: 'minigame',
        game: 'mg_wipe_board',
        level: 'min',
        objective: 'Lau bảng lớp và trực nhật cuối buổi',
        lines: [
          { speaker: 'NPC_A', text: 'Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ.' },
          { speaker: 'NPC_B', text: 'Mới quen một bữa mà ông mày tao rồi hả?' },
          { speaker: 'NPC_A', text: 'Thì quen rồi còn gì!' },
          { speaker: 'player', text: 'Ngày đầu ở trường mới… hình như cũng không tệ như mình nghĩ.' },
        ],
      },
      {
        id: 'q_m1_main_01.s05',
        kind: 'cutscene',
        objective: 'Thời gian trôi qua tới cuối học kỳ',
        lines: [
          { speaker: 'narrator', text: 'Mấy tháng sau… Bảng lớp đã ghi "Ôn tập học kỳ I".' },
        ],
      },
      {
        id: 'q_m1_main_01.s06',
        kind: 'minigame',
        game: 'mg_noodle',
        level: 'min',
        objective: 'Chia gói mì tôm ở bậc thềm tiệm tạp hóa',
        lines: [
          { speaker: 'NPC_A', text: 'Ra tiệm tạp hóa đi! Còn đúng một gói mì nè, mua lẹ chia ba!' },
          { speaker: 'NPC_B', text: 'Chia đều. Không bàn cãi nữa.' },
          { speaker: 'NPC_A', text: '{player_name} có máy ảnh mà! Quay ngược máy lại tự sướng đi!' },
          { speaker: 'NPC_B', text: 'Tui thấy giữ tấm này được nè. Nhìn ngố y chang ông đó Đức.' },
          { speaker: 'player', text: 'Mai mốt nhất định tụi mình phải chụp thêm nhiều tấm nữa nha.' },
          { speaker: 'NPC_A', text: 'Chốt! Sau này chụp đủ một bộ sưu tập luôn!' },
        ],
      },
      {
        id: 'q_m1_main_01.s07',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0601.grocery',
        subjects: ['player', 'NPC_A', 'NPC_B'],
        album_entry_id: 'alb.d.g06.01.01',
        objective: 'Chụp bức ảnh tự sướng đầu tiên của bộ ba',
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m1_ai_side_01',
    type: 'side',
    scope: 'm1',
    memory_day_id: 'd.g06.01',
    title: '[PLACEHOLDER] Xem bảng phân công trực nhật',
    blocks_main: false,
    steps: [
      {
        id: 'q_m1_ai_side_01.s01',
        kind: 'talk',
        with: 'NPC_B',
        objective: '[PLACEHOLDER] Nghe Châu Tổng nhờ xem bảng phân công trực nhật',
        lines: [
          { speaker: 'NPC_B', text: '[PLACEHOLDER] {g:Ông|Bà} tiện đường qua cột cờ xem bảng phân công trực nhật giúp tui nghen.' },
        ],
      },
      {
        id: 'q_m1_ai_side_01.s02',
        kind: 'goto',
        target: 'itr.thcs.flagpole',
        objective: '[PLACEHOLDER] Đi tới cột cờ xem bảng phân công',
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m1_ai_daily_01',
    type: 'daily',
    scope: 'm1',
    title: '[PLACEHOLDER] Kiểm tra đồ trực nhật',
    blocks_main: false,
    steps: [
      {
        id: 'q_m1_ai_daily_01.s01',
        kind: 'interact',
        target: 'itr.thcs.duty_spot',
        objective: '[PLACEHOLDER] Sắp xếp lại chổi và giẻ lau ở góc sân',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m1_01',
  name: 'Mẩu giấy mật lệnh số 01',
  description: 'Mẩu giấy gấp tư đầy hình vẽ ký hiệu và nét bút bi đỏ sửa lỗi của Châu Tổng.',
  school_year_id: 'g06',
  hook_2026: 'Mật lệnh này… ai viết mà nhìn chẳng hiểu gì hết vậy?',
  appear_when: { quest: 'q_hub_pd_01' },
  target_memory_day_id: 'd.g06.01',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g06.01.01', 'frag.d.g06.01.02', 'frag.d.g06.01.03'],
  album_entry_ids: ['alb.d.g06.01.01', 'alb.d.g06.01.02', 'alb.d.g06.01.03', 'alb.d.g06.01.04', 'alb.d.g06.01.05'],
  new_present_action: 'pde_02',
  shape: 'paper',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g06.01.01', memory_day_id: 'd.g06.01', kind: 'photo', source_quest_id: 'q_m1_main_01', media_spec: 'B' },
  { id: 'frag.d.g06.01.02', memory_day_id: 'd.g06.01', kind: 'note', source_quest_id: 'q_m1_main_01', text: 'Ngày đầu lớp 6, bắt đầu từ một mẩu giấy mật lệnh vẽ linh tinh.' },
  { id: 'frag.d.g06.01.03', memory_day_id: 'd.g06.01', kind: 'artifact' },
  { id: 'frag.d.g06.01.04', memory_day_id: 'd.g06.01', kind: 'sticker', source_quest_id: 'q_m1_ai_side_01', text: 'Danh sách trực nhật của Châu' },
  { id: 'frag.d.g06.01.05', memory_day_id: 'd.g06.01', kind: 'sticker', source_quest_id: 'q_m1_ai_daily_01', text: 'Dấu trực nhật đầu năm' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g06.01.01', page_id: 'page.d.g06.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g06.01.01', source: 'auto_snapshot', required_for_restore: true, snapshot: { camera_id: 'cam.d0601.grocery', at_step_id: 'q_m1_main_01.s07' } },
  { id: 'alb.d.g06.01.02', page_id: 'page.d.g06.01', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g06.01.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g06.01.03', page_id: 'page.d.g06.01', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g06.01.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g06.01.04', page_id: 'page.d.g06.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g06.01.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_side_01', replayable: true },
  { id: 'alb.d.g06.01.05', page_id: 'page.d.g06.01', slot_type: 'quest_record', slot_index: 4, fragment_id: 'frag.d.g06.01.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_daily_01', replayable: true },
];
