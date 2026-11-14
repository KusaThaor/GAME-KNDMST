/**
 * NGÀY GIẢ d.g06.01 — chỉ để chạy khung (Main 2 bước, 1 Side, 1 Daily).
 * Mọi chữ là [PLACEHOLDER], nhãn AI_PROPOSED: KHÔNG phải cốt truyện, nhóm viết sẽ thay toàn bộ.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const P = '[PLACEHOLDER]';
const meta = { owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1' } as const;

export const day: MemoryDay = {
  id: 'd.g06.01', title: `${P} Ngày ký ức lớp 6 số 01`, school_year_id: 'g06', map_id: 'map_thcs', map_variant: 'g06',
  open_zones: ['zone.thcs.yard'], spawn_point: 'spawn.yard',
  anchor_artifact_id: 'art_m1_01',
  main_chain: ['q_m1_main_01'], side_quests: ['q_m1_side_01'], daily_pool: ['q_m1_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', position: [-5.4, 1.2], facing: 0.5, motion: 'idle' },
    { actor: 'NPC_B', position: [-3.6, 1.5], facing: -0.2, motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.stone_bench', label: `${P} Ghế đá`, position: [-8.2, 2.6], zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.flagpole', label: `${P} Cột cờ`, position: [6, 4.4], zone_id: 'zone.thcs.yard', kind: 'marker' },
    { id: 'itr.thcs.duty_spot', label: `${P} Chỗ trực nhật`, position: [2, -6.2], zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [{ id: 'cam.d0601.bench', position: [-3.2, 2.2, 7.4], look_at: [-5.6, 0.9, 1.6], fov: 42 }],
  album_page_id: 'page.d.g06.01', completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta, id: 'q_m1_main_01', type: 'main', scope: 'm1', memory_day_id: 'd.g06.01', title: `${P} Main giả 01`, blocks_main: true,
    steps: [
      { id: 'q_m1_main_01.s01', kind: 'talk', with: 'NPC_A', objective: `${P} Nói chuyện với bạn NPC_A`, lines: [
        { speaker: 'NPC_A', text: `${P} NPC_A chào {player_name}.` },
        { speaker: 'player', text: `${P} {player_name} trả lời ({g:biến thể nam|biến thể nữ}).` },
        { speaker: 'NPC_B', text: `${P} NPC_B góp một câu.` },
      ] },
      { id: 'q_m1_main_01.s02', kind: 'interact', target: 'itr.thcs.stone_bench', objective: `${P} Ra ghế đá`, lines: [
        { speaker: 'narrator', text: `${P} Khoảnh khắc chốt của Ngày (máy ảnh ảo tự chụp ở đây).` },
      ] },
    ],
  },
  {
    ...meta, id: 'q_m1_side_01', type: 'side', scope: 'm1', memory_day_id: 'd.g06.01', title: `${P} Side giả 01`, blocks_main: false,
    steps: [
      { id: 'q_m1_side_01.s01', kind: 'talk', with: 'NPC_B', objective: `${P} Nghe NPC_B nhờ một việc`, lines: [{ speaker: 'NPC_B', text: `${P} NPC_B nhờ {player_name} một việc nhỏ.` }] },
      { id: 'q_m1_side_01.s02', kind: 'goto', target: 'itr.thcs.flagpole', objective: `${P} Đi tới cột cờ` },
    ],
  },
  {
    ...meta, id: 'q_m1_daily_01', type: 'daily', scope: 'm1', title: `${P} Daily giả 01`, blocks_main: false,
    steps: [{ id: 'q_m1_daily_01.s01', kind: 'interact', target: 'itr.thcs.duty_spot', objective: `${P} Làm việc thường ngày` }],
  },
];

export const artifact: Artifact = {
  id: 'art_m1_01', name: `${P} Kỷ vật art_m1_01`, description: `${P} mô tả kỷ vật`, school_year_id: 'g06',
  hook_2026: `${P} Câu Player 23 tuổi nghĩ khi cầm kỷ vật lên.`,
  appear_when: { quest: 'q_hub_pd_01' }, target_memory_day_id: 'd.g06.01', complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g06.01.01', 'frag.d.g06.01.02'], album_entry_ids: ['alb.d.g06.01.01', 'alb.d.g06.01.02', 'alb.d.g06.01.03'],
  new_present_action: 'pde_02', shape: 'paper',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g06.01.01', memory_day_id: 'd.g06.01', kind: 'photo', source_quest_id: 'q_m1_main_01', media_spec: 'B' },
  { id: 'frag.d.g06.01.02', memory_day_id: 'd.g06.01', kind: 'note', source_quest_id: 'q_m1_main_01', text: `${P} Ghi chú chính của trang, có tên {player_name}.` },
  { id: 'frag.d.g06.01.03', memory_day_id: 'd.g06.01', kind: 'artifact' },
  { id: 'frag.d.g06.01.04', memory_day_id: 'd.g06.01', kind: 'sticker', source_quest_id: 'q_m1_side_01', text: `${P} Sticker Side` },
  { id: 'frag.d.g06.01.05', memory_day_id: 'd.g06.01', kind: 'sticker', source_quest_id: 'q_m1_daily_01', text: `${P} Dấu "đã làm" Daily` },
];

export const entries: AlbumEntry[] = [
  // D-19: Ngày này không có màn chụp → ảnh chính lấy từ máy ảnh ảo đặt sẵn (nguồn B).
  { id: 'alb.d.g06.01.01', page_id: 'page.d.g06.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g06.01.01', source: 'auto_snapshot', required_for_restore: true, snapshot: { camera_id: 'cam.d0601.bench', at_step_id: 'q_m1_main_01.s02' } },
  { id: 'alb.d.g06.01.02', page_id: 'page.d.g06.01', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g06.01.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g06.01.03', page_id: 'page.d.g06.01', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g06.01.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g06.01.04', page_id: 'page.d.g06.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g06.01.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_side_01', replayable: true },
  { id: 'alb.d.g06.01.05', page_id: 'page.d.g06.01', slot_type: 'quest_record', slot_index: 4, fragment_id: 'frag.d.g06.01.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_daily_01', replayable: true },
];
