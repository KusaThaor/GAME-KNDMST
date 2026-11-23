/**
 * TRANG 4 (d.g07.03) — ĐỦ NĂM ĐỨA (Cuối lớp 7, Tháng 5/2016)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_DRAFT', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g07.03',
  title: 'Trang 4: Đủ năm đứa',
  school_year_id: 'g07',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.classroom', 'zone.thcs.corridor', 'zone.thcs.yard', 'zone.thcs.gate', 'zone.thcs.field', 'zone.thcs.base'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m1_05',
  main_chain: ['q_m1_main_05'],
  side_quests: ['q_m1_side_02'],
  daily_pool: ['q_m1_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.yard_group_1', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.yard_group_2', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_group_3', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_group_4', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.tripod_spot', label: 'Chỗ đặt máy ảnh gốc phượng', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ để đồ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.gutter', label: 'Rãnh nước mái hiên', zone_id: 'zone.thcs.corridor', kind: 'marker' },
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.snack_cart', label: 'Xe quà vặt cổng trường', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.marble_spot', label: 'Chỗ chơi bi bãi đất', zone_id: 'zone.thcs.field', kind: 'marker' },
    { id: 'itr.thcs.old_table', label: 'Bàn gỗ cũ ở Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
  ],
  cameras: [{ id: 'cam.d0703.group', marker: 'cam.thcs.yard_group', fov: 38 }],
  album_page_id: 'page.d.g07.03',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m1_main_05',
    type: 'main',
    scope: 'm1',
    memory_day_id: 'd.g07.03',
    title: 'Đủ năm đứa',
    blocks_main: true,
    steps: [
      {
        id: 'q_m1_main_05.s01',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Gom cả nhóm chụp một bức ảnh kỷ niệm',
        lines: [
          { speaker: 'NPC_A', text: 'Ê! Có cả đống ảnh mà chưa có tấm nào đủ năm đứa cho đàng hoàng hết!' },
          { speaker: 'NPC_B', text: 'Thì hôm nào chụp.' },
          { speaker: 'NPC_A', text: 'Chụp liền! Cuối năm rồi đó!' },
          { speaker: 'NPC_D', text: 'Chiều nay chụp luôn. {player_name} coi pin máy chưa?' },
          { speaker: 'NPC_C', text: 'Đứng dưới gốc phượng nha. Chỗ này nắng đẹp nhất.' },
        ],
      },
      {
        id: 'q_m1_main_05.s02',
        kind: 'choice',
        choice_id: 'c_m1_05_tone',
        measured: true,
        about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        prompt: {
          speaker: 'NPC_A',
          text: 'Tấm này phải ngầu nha. Tao đứng giữa! Mọi người chọn kiểu dáng nào?',
        },
        options: [
          { id: 'playful', tone: 'playful', text: 'Tạo dáng nhí nhố làm mặt hề', set_flags: { 'm1.placeholder_tone': 'playful' } },
          { id: 'gentle', tone: 'gentle', text: 'Đứng tự nhiên, khoác vai cười tươi', set_flags: { 'm1.placeholder_tone': 'gentle' } },
          { id: 'deep', tone: 'deep', text: 'Nghiêm trang chỉnh tề như ảnh thẻ', set_flags: { 'm1.placeholder_tone': 'deep' } },
        ],
      },
      {
        id: 'q_m1_main_05.s03',
        kind: 'interact',
        target: 'itr.thcs.tripod_spot',
        objective: 'Đặt máy ảnh lên ghế đá dưới gốc phượng',
      },
      {
        id: 'q_m1_main_05.s04',
        kind: 'photo',
        mode: 'timer',
        camera_id: 'cam.d0703.group',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g07.03.01',
        stand_zone: { marker: 'spot.thcs.yard_group', radius: 1.1 },
        objective: 'Hẹn giờ 10 giây và chạy vào giữa đội hình',
      },
      {
        id: 'q_m1_main_05.s05',
        kind: 'cutscene',
        objective: 'Trú mưa rào ở Căn cứ và chụp ảnh cầu vồng',
        lines: [
          { speaker: 'NPC_A', text: 'Máy ảnh của {player_name} đâu? Đừng để ướt!' },
          { speaker: 'NPC_D', text: 'Tớ ôm rồi. Yên tâm.' },
          { speaker: 'NPC_C', text: 'Mọi người nhìn kìa… Cầu vồng hiện trên sân rồi!' },
          { speaker: 'NPC_A', text: 'Ông trời thưởng vì tụi mình chụp đủ năm đứa đó!' },
          { speaker: 'NPC_B', text: 'Hiện tượng tự nhiên thôi.' },
          { speaker: 'player', text: 'Chụp thêm một tấm với cầu vồng nha!' },
          { speaker: 'NPC_C', text: 'Lần này khỏi tạo dáng. Đứng cạnh nhau là được.' },
          { speaker: 'NPC_A', text: 'Nhìn nè! Từ ba đứa thành năm đứa rồi!' },
          { speaker: 'NPC_B', text: 'Ừ. Cũng không ngờ chơi với nhau lâu vậy.' },
          { speaker: 'player', text: 'Mai mốt chụp nữa nha. Đừng để thiếu ai.' },
          { speaker: 'NPC_A', text: 'Đứa nào vắng là phải chụp bù!' },
        ],
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m1_side_02',
    type: 'side',
    scope: 'm1',
    memory_day_id: 'd.g07.03',
    title: 'Đi dạo một vòng các khu trường cũ',
    blocks_main: false,
    steps: [
      { id: 'q_m1_side_02.s01', kind: 'goto', target: 'itr.thcs.gutter', objective: 'Tới hành lang rãnh nước' },
      { id: 'q_m1_side_02.s02', kind: 'goto', target: 'itr.thcs.blackboard', objective: 'Vào lớp học bảng đen' },
      { id: 'q_m1_side_02.s03', kind: 'goto', target: 'itr.thcs.snack_cart', objective: 'Ra xe quà vặt cổng trường' },
      { id: 'q_m1_side_02.s04', kind: 'goto', target: 'itr.thcs.marble_spot', objective: 'Sang bãi đất trống chơi bi' },
      { id: 'q_m1_side_02.s05', kind: 'goto', target: 'itr.thcs.old_table', objective: 'Ghé thăm Căn cứ Bí mật' },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m1_daily_01',
    type: 'daily',
    scope: 'm1',
    title: 'Kiểm tra đồ trực nhật',
    blocks_main: false,
    steps: [
      {
        id: 'q_m1_daily_01.s01',
        kind: 'interact',
        target: 'itr.thcs.duty_spot',
        objective: 'Thu dọn dụng cụ trực nhật cuối năm',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m1_05',
  name: 'Tấm ảnh năm người bị ố góc',
  description: 'Bức ảnh chụp dưới gốc phượng cuối năm lớp 7, dán ở Căn cứ lâu ngày nên bị ố vàng.',
  school_year_id: 'g07',
  hook_2026: 'Tấm này ố hết rồi mà vẫn giữ.',
  appear_when: { day: 'd.g07.02' },   // chỉ sáng khi xong Trang 3 (chủ dự án chốt 22/11: thứ tự Trang 1→4 ở Hộp Kỷ Vật)
  target_memory_day_id: 'd.g07.03',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g07.03.01'],
  album_entry_ids: ['alb.d.g07.03.01', 'alb.d.g07.03.02', 'alb.d.g07.03.03', 'alb.d.g07.03.04', 'alb.d.g07.03.05'],
  new_present_action: 'pde_05',
  shape: 'photo',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g07.03.01', memory_day_id: 'd.g07.03', kind: 'photo', source_quest_id: 'q_m1_main_05', media_spec: 'A' },
  { id: 'frag.d.g07.03.02', memory_day_id: 'd.g07.03', kind: 'back_note', text: 'Cuối năm lớp 7, dưới gốc phượng chớm nở: "Đủ năm đứa".' },
  { id: 'frag.d.g07.03.03', memory_day_id: 'd.g07.03', kind: 'artifact' },
  { id: 'frag.d.g07.03.04', memory_day_id: 'd.g07.03', kind: 'sticker', source_quest_id: 'q_m1_daily_01', text: 'Dấu trực nhật cuối năm' },
  { id: 'frag.d.g07.03.05', memory_day_id: 'd.g07.03', kind: 'sticker', source_quest_id: 'q_m1_side_02', text: 'Ký ức khắp sân trường' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g07.03.01', page_id: 'page.d.g07.03', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.03.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0703.group', at_step_id: 'q_m1_main_05.s04' }, replayable: true },
  { id: 'alb.d.g07.03.02', page_id: 'page.d.g07.03', slot_type: 'back_note', slot_index: 1, fragment_id: 'frag.d.g07.03.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g07.03.03', page_id: 'page.d.g07.03', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g07.03.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g07.03.04', page_id: 'page.d.g07.03', slot_type: 'quest_record', slot_index: 3, fragment_id: 'frag.d.g07.03.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_daily_01', replayable: true },
  { id: 'alb.d.g07.03.05', page_id: 'page.d.g07.03', slot_type: 'sticker', slot_index: 4, fragment_id: 'frag.d.g07.03.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_side_02', replayable: true },
];
