/**
 * TRANG 2 (d.g07.01) — THUYỀN GIẤY DƯỚI MÁI HIÊN (Lớp 7, Đầu năm học 2015)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với Player & Châu; Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên ("Hạ").
 * Chuẩn hóa N-01 (C1, C3, G-7).
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0' } as const;

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
          text: 'Viết một điều ước lên buồm đi. Thuyền chạy tới đâu, ước mơ theo tới đó.',
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
          { speaker: 'NPC_C', text: 'Thuyền của Quân về đích trước rồi kìa.' },
          { speaker: 'NPC_D', text: 'Tại mũi thuyền Quân gấp nhọn hơn. Nước rẽ hai bên.' },
          { speaker: 'NPC_A', text: 'Biết vậy nãy tớ nhờ Quân gấp giùm.' },
          { speaker: 'player', text: 'Thuyền của mình… trôi tới gần miệng cống rồi kìa!' },
          { speaker: 'NPC_C', text: 'Để Hạ vớt lên cho. Cánh buồm còn nguyên chữ ký nè.' },
        ],
      },
      {
        id: 'q_m1_main_02.s05',
        kind: 'cutscene',
        objective: 'Ký tên kỷ niệm lên buồm thuyền',
        lines: [
          { speaker: 'NPC_A', text: 'Để tao ký trước! Chữ tao đẹp nhất!' },
          { speaker: 'NPC_B', text: 'Đẹp đâu không thấy, chiếm hết nửa cánh buồm.' },
          { speaker: 'NPC_C', text: 'Hạ ký góc này nha.' },
          { speaker: 'NPC_D', text: 'Quân ký ở đây.' },
          { speaker: 'player', text: 'Còn góc này… để mình ký tên.' },
          { speaker: 'NPC_A', text: 'Xong! Thuyền năm đứa!' },
        ],
      },
    ],
  },
  {
    ...sideMeta,
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
  shape: 'paper',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g07.01.01', memory_day_id: 'd.g07.01', kind: 'photo', source_quest_id: 'q_m1_main_02', media_spec: 'B' },
  { id: 'frag.d.g07.01.02', memory_day_id: 'd.g07.01', kind: 'note', source_quest_id: 'q_m1_main_02', text: 'Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xuôi dòng rãnh nước.' },
  { id: 'frag.d.g07.01.03', memory_day_id: 'd.g07.01', kind: 'artifact' },
  { id: 'frag.d.g07.01.04', memory_day_id: 'd.g07.01', kind: 'sticker', source_quest_id: 'q_m1_ai_side_03', text: 'Mẹo gấp thuyền của Quân' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g07.01.01', page_id: 'page.d.g07.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.01.01', source: 'auto_snapshot', required_for_restore: true, snapshot: { camera_id: 'cam.d0701.boats', at_step_id: 'q_m1_main_02.s05' } },
  { id: 'alb.d.g07.01.02', page_id: 'page.d.g07.01', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g07.01.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g07.01.03', page_id: 'page.d.g07.01', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g07.01.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g07.01.04', page_id: 'page.d.g07.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g07.01.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_side_03', replayable: true },
];
