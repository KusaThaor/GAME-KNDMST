/**
 * TRANG 2 (d.g07.01) — THUYỀN GIẤY DƯỚI MÁI HIÊN (Lớp 7, Đầu năm học 2015)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với Player & Châu, "cậu - tớ" với Quân & Hạ (mới gặp); Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên ("Hạ").
 * Chuẩn hóa N-01 (C1, C3, G-7).
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g07.01',
  title: 'Trang 2: Thuyền giấy dưới mái hiên',
  school_year_id: 'g07',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.corridor', 'zone.thcs.yard', 'zone.thcs.classroom'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m1_02',
  main_chain: ['q_m1_main_02'],
  side_quests: ['q_m1_ai_side_03'],
  daily_pool: [],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.yard_bench_1', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.yard_bench_2', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_group_3', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_group_4', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.gutter', label: 'Rãnh nước mái hiên', zone_id: 'zone.thcs.corridor', kind: 'marker' },
    { id: 'itr.thcs.stone_bench', label: 'Ghế đá sân trường', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [{ id: 'cam.d0701.boats', marker: 'cam.thcs.gutter', fov: 40 }],
  album_page_id: 'page.d.g07.01',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m1_main_02',
    type: 'main',
    scope: 'm1',
    memory_day_id: 'd.g07.01',
    title: 'Thuyền giấy dưới mái hiên',
    blocks_main: true,
    steps: [
      {
        id: 'q_m1_main_02.s01',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Trú mưa cùng Đức và Châu dưới mái hiên',
        lines: [
          { speaker: 'NPC_A', text: 'Nghỉ hè có hai tháng mà tao thấy như hai năm.' },
          { speaker: 'NPC_B', text: 'Tại ông không làm bài tập hè.' },
          { speaker: 'NPC_A', text: 'Ủa, chưa gì đã nghi tao rồi!' },
        ],
      },
      {
        id: 'q_m1_main_02.s02',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Làm quen hai bạn đang gấp thuyền giấy',
        lines: [
          { speaker: 'NPC_A', text: 'Ê! Thuyền đẹp đó! Cậu gấp hả?' },
          { speaker: 'NPC_C', text: 'Ừm… mưa nhiều nên Hạ gấp thử.' },
          { speaker: 'NPC_A', text: 'Hay mình thi coi thuyền ai chạy xa nhất đi!' },
          { speaker: 'NPC_B', text: 'Thi thì phải có luật. Thả rồi không được lấy tay đẩy.' },
          { speaker: 'NPC_A', text: 'Rồi rồi, Châu Tổng làm trọng tài.' },
          { speaker: 'player', text: 'Hai cậu chơi chung hông?' },
          { speaker: 'NPC_C', text: 'Có… nếu mọi người không ngại.' },
          { speaker: 'NPC_D', text: 'Tớ giữ giấy. Gió thổi bay mất.' },
        ],
      },
      {
        id: 'q_m1_main_02.s03',
        kind: 'choice',
        choice_id: 'c_m1_02_wish',
        measured: true,
        about: ['NPC_C'],
        objective: 'Viết điều ước lên cánh buồm thuyền giấy',
        prompt: {
          speaker: 'NPC_C',
          text: 'Viết một điều ước lên buồm đi. Thuyền chạy tới đâu, điều ước theo tới đó.',
        },
        options: [
          { id: 'friendship', tone: 'gentle', text: 'Mai mốt vẫn chơi chung vầy.', set_flags: { 'm1.wish': 'friendship' } },
          { id: 'fun', tone: 'playful', text: 'Lớp 7 vui hơn lớp 6.', set_flags: { 'm1.wish': 'fun' } },
          { id: 'secret', tone: 'deep', text: 'Bí mật không nói ra.', set_flags: { 'm1.wish': 'secret' } },
        ],
      },
      {
        id: 'q_m1_main_02.s04',
        kind: 'minigame',
        game: 'mg_boat',
        level: 'min',
        objective: 'Thả thuyền xuống rãnh nước trước hiên',
        lines: [
          { speaker: 'NPC_A', text: 'Sao lật rồi? Ai thấy không? Có người tác động dòng nước!' },
          { speaker: 'NPC_B', text: 'Ông thả lệch. Tui thấy rõ.' },
          { speaker: 'NPC_D', text: 'Thuyền tớ… hình như xa nhất.' },
          { speaker: 'NPC_A', text: 'Hư cấu! Thuyền cậu gắn động cơ hả?' },
          { speaker: 'NPC_B', text: 'Thua thì nhận đi.' },
          { speaker: 'NPC_A', text: 'Ván sau tớ phục thù!' },
        ],
      },
      {
        id: 'q_m1_main_02.s05',
        kind: 'cutscene',
        objective: 'Ký tên lên chiếc thuyền vớt được',
        lines: [
          { speaker: 'NPC_C', text: 'Thuyền của {player_name} trôi mất rồi. Ghi lại điều ước lên buồm này đi.' },
          { speaker: 'NPC_A', text: 'À mà chưa giới thiệu! Tớ là Đức, đây là {player_name}, còn đây là Châu Tổng khó tính.' },
          { speaker: 'NPC_B', text: 'Giới thiệu người ta thì bớt bình luận giùm.' },
          { speaker: 'NPC_C', text: 'Hạ nè. Lớp bên.' },
          { speaker: 'NPC_D', text: 'Quân. Cũng lớp bên.' },
          { speaker: 'player', text: 'Mai ra chơi mình chơi tiếp nha?' },
          { speaker: 'NPC_C', text: 'Ừ, mai Hạ mang thêm giấy.' },
          { speaker: 'NPC_D', text: 'Tớ mang giấy báo cũ. Gấp cứng hơn.' },
          { speaker: 'NPC_B', text: 'Nhớ đúng giờ nha. Đừng để người khác chờ.' },
        ],
      },
    ],
  },
];

export const sideQuests: Quest[] = [
  {
    owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0',
    id: 'q_m1_ai_side_03',
    type: 'side',
    scope: 'm1',
    memory_day_id: 'd.g07.01',
    title: '[PLACEHOLDER] Mẹo gấp thuyền của Quân',
    blocks_main: false,
    steps: [
      {
        id: 'q_m1_ai_side_03.s01',
        kind: 'talk',
        with: 'NPC_D',
        objective: '[PLACEHOLDER] Hỏi Quân cách vuốt nếp thuyền cho nhọn',
        lines: [
          { speaker: 'NPC_D', text: '[PLACEHOLDER] Miết nếp hai bên cho thật sát, lúc thả thuyền mới rẽ nước được.' },
        ],
      },
      {
        id: 'q_m1_ai_side_03.s02',
        kind: 'interact',
        target: 'itr.thcs.gutter',
        objective: '[PLACEHOLDER] Thử thả chiếc thuyền giấy miết kỹ xuống rãnh nước',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m1_02',
  name: 'Chiếc thuyền giấy phai màu',
  description: 'Chiếc thuyền vớt lên từ rãnh nước mưa, cánh buồm có chữ ký của năm đứa.',
  school_year_id: 'g07',
  hook_2026: 'Trên buồm còn chữ… mình ước gì vậy ta?',
  appear_when: { day: 'd.g06.01' },
  target_memory_day_id: 'd.g07.01',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g07.01.01', 'frag.d.g07.01.02', 'frag.d.g07.01.03'],
  album_entry_ids: ['alb.d.g07.01.01', 'alb.d.g07.01.02', 'alb.d.g07.01.03', 'alb.d.g07.01.04'],
  new_present_action: 'pde_08',
  shape: 'boat',   // thuyền giấy (hình 3D ở phòng 2026; trước ghi 'paper')
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g07.01.01', memory_day_id: 'd.g07.01', kind: 'photo', source_quest_id: 'q_m1_main_02', media_spec: 'B' },
  { id: 'frag.d.g07.01.02', memory_day_id: 'd.g07.01', kind: 'note', source_quest_id: 'q_m1_main_02', text: 'Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xuôi dòng rãnh nước.' },
  { id: 'frag.d.g07.01.03', memory_day_id: 'd.g07.01', kind: 'artifact' },
];

export const sideFragments: MemoryFragment[] = [
  { id: 'frag.d.g07.01.04', memory_day_id: 'd.g07.01', kind: 'sticker', source_quest_id: 'q_m1_ai_side_03', text: 'Mẹo gấp thuyền của Quân' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g07.01.01', page_id: 'page.d.g07.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.01.01', source: 'auto_snapshot', required_for_restore: true, snapshot: { camera_id: 'cam.d0701.boats', at_step_id: 'q_m1_main_02.s05' } },
  { id: 'alb.d.g07.01.02', page_id: 'page.d.g07.01', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g07.01.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g07.01.03', page_id: 'page.d.g07.01', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g07.01.03', source: 'sticker_art', required_for_restore: true },
];

export const sideEntries: AlbumEntry[] = [
  { id: 'alb.d.g07.01.04', page_id: 'page.d.g07.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g07.01.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_side_03', replayable: true },
];
