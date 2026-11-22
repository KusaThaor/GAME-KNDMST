/**
 * TRANG 3 (d.g07.02) — CĂN CỨ BÍ MẬT (Lớp 7, Đầu HK II, 2016)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 * Chuẩn hóa N-01 (B5, C1, C2, D2, G-7).
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0' } as const;

export const day: MemoryDay = {
  id: 'd.g07.02',
  title: 'Trang 3: Căn cứ bí mật',
  school_year_id: 'g07',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.corridor', 'zone.thcs.yard', 'zone.thcs.gate', 'zone.thcs.field', 'zone.thcs.base'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m1_03',
  main_chain: ['q_m1_main_03'],
  side_quests: [],
  daily_pool: [],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.base_table', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.field_log', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_group_3', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_group_4', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.base_survey_roof', label: 'Mái che Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.base_survey_stump', label: 'Gốc cây Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.base_survey_boxes', label: 'Thùng giấy Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.old_table', label: 'Bàn gỗ cũ ở Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.base_shelf', label: 'Kệ đồ Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.marble_spot', label: 'Chỗ chơi bi bãi đất', zone_id: 'zone.thcs.field', kind: 'marker' },
    { id: 'itr.thcs.stone_bench', label: 'Ghế đá sân trường', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [{ id: 'cam.d0702.base', marker: 'cam.thcs.base_sign', fov: 40 }],
  album_page_id: 'page.d.g07.02',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m1_main_03',
    type: 'main',
    scope: 'm1',
    memory_day_id: 'd.g07.02',
    title: 'Căn cứ bí mật',
    blocks_main: true,
    steps: [
      {
        id: 'q_m1_main_03.s01',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Nghe Đức bàn ý tưởng tìm căn cứ riêng',
        lines: [
          { speaker: 'NPC_A', text: 'Tao có ý này! Mình kiếm một chỗ riêng để tụ tập đi.' },
          { speaker: 'NPC_B', text: 'Chỗ nào? Trường đâu phải nhà mình.' },
          { speaker: 'NPC_D', text: 'Góc sân sau, gần nhà kho. Hình như ít ai ra.' },
          { speaker: 'NPC_C', text: 'Hạ thấy chỗ đó rồi. Có gốc cây đẹp lắm.' },
          { speaker: 'NPC_A', text: 'Chốt! Đi khám phá căn cứ mới!' },
        ],
      },
      {
        id: 'q_m1_main_03.s02',
        kind: 'collect',
        item: 'survey_spot',
        targets: ['itr.thcs.base_survey_roof', 'itr.thcs.base_survey_stump', 'itr.thcs.base_survey_boxes'],
        count: 3,
        objective: 'Khảo sát 3 vị trí ở góc sân sau',
      },
      {
        id: 'q_m1_main_03.s03',
        kind: 'choice',
        choice_id: 'c_m1_03_decor',
        measured: true,
        about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        objective: 'Chọn phong cách trang trí cho Căn cứ Bí mật',
        prompt: {
          speaker: 'NPC_B',
          text: 'Dọn sạch rồi mới được công nhận. Giờ trang trí kiểu gì đây?',
        },
        options: [
          { id: 'paper', tone: 'playful', text: 'Giấy màu', set_flags: { 'm1.base_decor': 'paper' } },
          { id: 'flowers', tone: 'gentle', text: 'Hoa', set_flags: { 'm1.base_decor': 'flowers' } },
          { id: 'photos', tone: 'deep', text: 'Ảnh', set_flags: { 'm1.base_decor': 'photos' } },
        ],
      },
      {
        id: 'q_m1_main_03.s04',
        kind: 'minigame',
        game: 'mg_base_build',
        level: 'min',
        objective: 'Dựng bàn ghế và dọn dẹp Căn cứ Bí mật',
      },
      {
        id: 'q_m1_main_03.s05',
        kind: 'minigame',
        game: 'mg_rules',
        level: 'min',
        objective: 'Soạn 5 điều luật Căn cứ vào cuốn sổ bìa xanh',
        lines: [
          { speaker: 'NPC_B', text: 'Phải có luật. Điều 1: không tự lấy đồ của người khác.' },
          { speaker: 'NPC_A', text: 'Điều 2: đứa nào ăn hết đồ ăn thì tự giác mua thêm!' },
          { speaker: 'NPC_D', text: '…Ai tới trước thì dọn chỗ ngồi.' },
          { speaker: 'NPC_C', text: 'Nếu có ai buồn thì… mọi người đừng bỏ bạn đó lại một mình nha.' },
          { speaker: 'player', text: 'Điều 5: chụp ảnh thì phải đủ người.' },
          { speaker: 'NPC_A', text: 'Chốt! Ai vô căn cứ cũng phải tuân thủ!' },
          { speaker: 'NPC_B', text: 'Ông nói như có cả trăm người muốn vô.' },
          { speaker: 'NPC_A', text: 'Biết đâu sau này nổi tiếng!' },
        ],
      },
      {
        id: 'q_m1_main_03.s06',
        kind: 'cutscene',
        objective: 'Treo biển tên Căn cứ Bí mật',
        lines: [
          { speaker: 'NPC_D', text: 'Vậy từ nay có chỗ gặp nhau rồi.' },
          { speaker: 'NPC_A', text: 'Đây là địa bàn của tụi mình!' },
          { speaker: 'NPC_B', text: 'Đừng gọi là địa bàn. Nghe ghê quá.' },
        ],
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m1_ai_side_04',
    type: 'side',
    scope: 'm1',
    memory_day_id: 'd.g07.02',
    title: '[PLACEHOLDER] Bắn bi mắt mèo cùng Quân',
    blocks_main: false,
    steps: [
      {
        id: 'q_m1_ai_side_04.s01',
        kind: 'talk',
        with: 'NPC_D',
        objective: '[PLACEHOLDER] Hỏi Quân về trò chơi bi ở bãi đất',
        lines: [
          { speaker: 'NPC_D', text: '[PLACEHOLDER] Bãi đất này phẳng lắm, lát ra chơi bắn bi mắt mèo với tớ nha.' },
        ],
      },
      {
        id: 'q_m1_ai_side_04.s02',
        kind: 'interact',
        target: 'itr.thcs.marble_spot',
        objective: '[PLACEHOLDER] Thử búng bi trên nền đất mịn',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m1_03',
  name: 'Biển tên Căn cứ Bí mật và Sổ luật',
  description: 'Tấm biển viết chữ bút lông nguệch ngoạc và cuốn sổ bìa xanh ghi 5 điều luật.',
  school_year_id: 'g07',
  hook_2026: 'Tụi mình còn ra luật nữa hả trời.',
  appear_when: { day: 'd.g07.01' },
  target_memory_day_id: 'd.g07.02',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g07.02.01', 'frag.d.g07.02.02', 'frag.d.g07.02.03'],
  album_entry_ids: ['alb.d.g07.02.01', 'alb.d.g07.02.02', 'alb.d.g07.02.03', 'alb.d.g07.02.04'],
  new_present_action: 'pde_10',
  shape: 'paper',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g07.02.01', memory_day_id: 'd.g07.02', kind: 'photo', source_quest_id: 'q_m1_main_03', media_spec: 'B' },
  { id: 'frag.d.g07.02.02', memory_day_id: 'd.g07.02', kind: 'note', source_quest_id: 'q_m1_main_03', text: 'Góc sân sau trở thành Căn cứ Bí mật của năm đứa.' },
  { id: 'frag.d.g07.02.03', memory_day_id: 'd.g07.02', kind: 'artifact' },
  { id: 'frag.d.g07.02.04', memory_day_id: 'd.g07.02', kind: 'sticker', source_quest_id: 'q_m1_ai_side_04', text: 'Viên bi mắt mèo' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g07.02.01', page_id: 'page.d.g07.02', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.02.01', source: 'auto_snapshot', required_for_restore: true, snapshot: { camera_id: 'cam.d0702.base', at_step_id: 'q_m1_main_03.s06' } },
  { id: 'alb.d.g07.02.02', page_id: 'page.d.g07.02', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g07.02.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g07.02.03', page_id: 'page.d.g07.02', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g07.02.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g07.02.04', page_id: 'page.d.g07.02', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g07.02.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_side_04', replayable: true },
];
