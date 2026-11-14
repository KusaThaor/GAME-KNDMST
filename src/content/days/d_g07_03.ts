/**
 * NGÀY GIẢ d.g07.03 — khung của quest prototype: Main có ảnh hẹn giờ 5 người (D-02 chưa chốt).
 * Mọi chữ là [PLACEHOLDER], nhãn AI_PROPOSED: KHÔNG phải cốt truyện.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const P = '[PLACEHOLDER]';
const meta = { owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1' } as const;

export const day: MemoryDay = {
  id: 'd.g07.03', title: `${P} Ngày ký ức lớp 7 số 03`, school_year_id: 'g07', map_id: 'map_thcs', map_variant: 'g07',
  open_zones: ['zone.thcs.yard'], spawn_point: 'spawn.yard',
  anchor_artifact_id: 'art_m1_05',
  main_chain: ['q_m1_main_05'], side_quests: [], daily_pool: ['q_m1_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', position: [-6.5, 1.9], facing: 0.25, motion: 'idle' },
    { actor: 'NPC_B', position: [-5.6, 1.5], facing: 0.1, motion: 'idle' },
    { actor: 'NPC_C', position: [-3.6, 1.5], facing: -0.1, motion: 'idle' },
    { actor: 'NPC_D', position: [-2.7, 1.9], facing: -0.25, motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.tripod_spot', label: `${P} Chỗ đặt máy ảnh`, position: [-4.5, 8.2], zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.duty_spot', label: `${P} Chỗ trực nhật`, position: [2, -6.2], zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [{ id: 'cam.d0703.group', position: [-4.5, 1.3, 8.4], look_at: [-4.6, 0.85, 1.8], fov: 38 }],
  album_page_id: 'page.d.g07.03', completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta, id: 'q_m1_main_05', type: 'main', scope: 'm1', memory_day_id: 'd.g07.03', title: `${P} Main giả 05 (khung ảnh 5 người)`, blocks_main: true,
    steps: [
      { id: 'q_m1_main_05.s01', kind: 'talk', with: 'NPC_A', objective: `${P} Gom cả nhóm`, lines: [
        { speaker: 'NPC_A', text: `${P} NPC_A rủ cả nhóm chụp ảnh.` },
        { speaker: 'NPC_C', text: `${P} NPC_C nhắc lại lựa chọn cũ (callback).`, when: { flag: 'm1.placeholder_tone', equals: 'playful' }, fallback: `${P} NPC_C nói câu chung chung (dòng dự phòng).` },
      ] },
      { id: 'q_m1_main_05.s02', kind: 'choice', choice_id: 'c_m1_05_tone', measured: true, about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        prompt: { speaker: 'NPC_B', text: `${P} NPC_B hỏi {player_name} một câu.` },
        options: [
          { id: 'playful', tone: 'playful', text: `${P} Trả lời kiểu hưởng ứng`, set_flags: { 'm1.placeholder_tone': 'playful' } },
          { id: 'gentle', tone: 'gentle', text: `${P} Trả lời kiểu dung hòa`, set_flags: { 'm1.placeholder_tone': 'gentle' } },
          { id: 'curious', tone: 'curious', text: `${P} Trả lời kiểu khơi gợi`, set_flags: { 'm1.placeholder_tone': 'curious' } },
        ] },
      { id: 'q_m1_main_05.s03', kind: 'interact', target: 'itr.thcs.tripod_spot', objective: `${P} Đặt máy ảnh` },
      { id: 'q_m1_main_05.s04', kind: 'photo', mode: 'timer', camera_id: 'cam.d0703.group', subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'], album_entry_id: 'alb.d.g07.03.01',
        stand_zone: { center: [-4.6, 1.8], radius: 1.1 }, objective: `${P} Chạy vào vòng sáng và tạo dáng` },
      { id: 'q_m1_main_05.s05', kind: 'cutscene', lines: [{ speaker: 'narrator', text: `${P} Cảnh kết của Ngày.` }] },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m1_05', name: `${P} Kỷ vật art_m1_05`, description: `${P} mô tả kỷ vật`, school_year_id: 'g07',
  hook_2026: `${P} Câu Player 23 tuổi nghĩ khi cầm kỷ vật lên.`,
  appear_when: { day: 'd.g06.01' }, target_memory_day_id: 'd.g07.03', complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g07.03.01'], album_entry_ids: ['alb.d.g07.03.01', 'alb.d.g07.03.02', 'alb.d.g07.03.03'],
  new_present_action: 'pde_05', shape: 'photo',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g07.03.01', memory_day_id: 'd.g07.03', kind: 'photo', source_quest_id: 'q_m1_main_05', media_spec: 'A' },
  { id: 'frag.d.g07.03.02', memory_day_id: 'd.g07.03', kind: 'back_note', text: `${P} Dòng chữ ở mặt sau ảnh.` },
  { id: 'frag.d.g07.03.03', memory_day_id: 'd.g07.03', kind: 'artifact' },
  { id: 'frag.d.g07.03.04', memory_day_id: 'd.g07.03', kind: 'sticker', source_quest_id: 'q_m1_daily_01', text: `${P} Dấu "đã làm" Daily` },
];

export const entries: AlbumEntry[] = [
  // D-19: ảnh chính do người chơi chụp (nguồn A); máy ảnh ảo chụp thêm một tấm dự phòng (nguồn B).
  { id: 'alb.d.g07.03.01', page_id: 'page.d.g07.03', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.03.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0703.group', at_step_id: 'q_m1_main_05.s04' }, replayable: true },
  { id: 'alb.d.g07.03.02', page_id: 'page.d.g07.03', slot_type: 'back_note', slot_index: 1, fragment_id: 'frag.d.g07.03.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g07.03.03', page_id: 'page.d.g07.03', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g07.03.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g07.03.04', page_id: 'page.d.g07.03', slot_type: 'quest_record', slot_index: 3, fragment_id: 'frag.d.g07.03.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_daily_01', replayable: true },
];
