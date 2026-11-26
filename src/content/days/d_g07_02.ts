/**
 * TRANG 3 (d.g07.02) — CĂN CỨ BÍ MẬT (Lớp 7, Đầu HK II, 2016)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 * Chuẩn hóa N-01 (B5, C1, C2, D2, G-7).
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g07.02',
  title: 'Trang 3: Căn cứ bí mật',
  school_year_id: 'g07',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.corridor', 'zone.thcs.yard', 'zone.thcs.gate', 'zone.thcs.field', 'zone.thcs.base'],
  zone_name_overrides: [
    { zone_id: 'zone.thcs.base', name: 'Góc sân sau', until_step: 'q_m1_main_03.s04' },
  ],
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
        objective: 'Tới nói chuyện với Đức và nhóm bạn giữa sân trường',
        title_card: { id: 'tc_p3_c1', title: 'Đầu học kỳ II', subtitle: 'Lớp 7 · Giờ về', duration_ms: 3000 },
        stage: [
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_wave', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'cheer', at: { line: 4 } },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Tao mới nghĩ ra cái này nè! Kiếm chỗ nào riêng cho tụi mình tụ tập đi.' },
          { speaker: 'NPC_B', text: 'Chỗ nào? Trường đâu phải nhà mình.' },
          { speaker: 'NPC_D', text: '…Góc sân sau, gần nhà kho. Hình như chỗ đó ít ai ra.' },
          { speaker: 'NPC_C', text: 'Hạ biết chỗ đó rồi. Có gốc cây đẹp lắm luôn.' },
          { speaker: 'NPC_A', text: 'Chốt! Ra khám phá chỗ mới liền đi tụi mày!' },
        ],
      },
      {
        id: 'q_m1_main_03.s02',
        kind: 'collect',
        item: 'survey_spot',
        targets: ['itr.thcs.base_survey_roof', 'itr.thcs.base_survey_stump', 'itr.thcs.base_survey_boxes'],
        count: 3,
        show_counter: true,
        objective: 'Khảo sát 3 vị trí quanh khu vực: Mái che · Gốc cây · Thùng giấy',
        stage: [
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.base_table', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: 'start' },
        ],
        lines_by_target: {
          'itr.thcs.base_survey_roof': [{ speaker: 'NPC_A', text: 'Có mái che nè, mưa xuống cũng khỏi sợ ướt!' }],
          'itr.thcs.base_survey_stump': [{ speaker: 'NPC_B', text: 'Gốc cây này ngồi mát thiệt. Hạ nói đúng.' }],
          'itr.thcs.base_survey_boxes': [{ speaker: 'NPC_A', text: 'Mấy thùng giấy này xếp lại làm ghế ngồi được nè!' }],
        },
      },
      {
        id: 'q_m1_main_03.s04',
        kind: 'minigame',
        game: 'mg_base_build',
        level: 'min',
        objective: 'Dọn dẹp bụi bặm và kê bàn ghế dưới mái che',
        intro_lines: [
          { speaker: 'NPC_B', text: 'Hợp thì hợp, nhưng dọn trước đã. Bụi quá trời.' },
        ],
        stage: [
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: 'end' },
        ],
        lines: [
          { speaker: 'NPC_B', text: 'Sạch sẽ gọn gàng rồi đó. Giờ tui mới công nhận.' },
          { speaker: 'NPC_A', text: 'Từ hôm nay, đây chính thức là Căn cứ Bí mật của tụi mình!' },
        ],
      },
      {
        id: 'q_m1_main_03.s03',
        kind: 'choice',
        choice_id: 'c_m1_03_decor',
        measured: true,
        about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        objective: 'Chọn 1 trong 3 phong cách trang trí: Giấy màu · Hoa dại · Dây ảnh',
        title_card: { id: 'zone_p3_c4_new_name', title: 'Căn cứ Bí mật', subtitle: 'Địa bàn chính thức của nhóm năm đứa', duration_ms: 3500 },
        prompt: {
          speaker: 'NPC_C',
          text: 'Căn cứ còn trống quá, {player_name} chọn kiểu trang trí giùm Hạ nha.',
        },
        options: [
          {
            id: 'paper',
            tone: 'playful',
            text: 'Giấy màu',
            set_flags: { 'm1.base_decor': 'paper' },
            lines: [{ speaker: 'NPC_A', text: 'Cờ giấy với hạc giấy nè! Treo lên nhìn như sắp mở tiệc vậy!' }],
          },
          {
            id: 'flowers',
            tone: 'gentle',
            text: 'Hoa',
            set_flags: { 'm1.base_decor': 'flowers' },
            lines: [{ speaker: 'NPC_C', text: 'Thêm lọ hoa dại vô nhìn chỗ này dịu hẳn lên nè.' }],
          },
          {
            id: 'photos',
            tone: 'deep',
            text: 'Ảnh',
            set_flags: { 'm1.base_decor': 'photos' },
            lines: [{ speaker: 'NPC_B', text: 'Dây kẹp ảnh nhìn hay đó. Mà chưa có tấm nào đủ năm đứa.' }],
          },
        ],
      },
      {
        id: 'q_m1_main_03.s05',
        kind: 'minigame',
        game: 'mg_rules',
        level: 'min',
        objective: 'Mở cuốn sổ bìa xanh và ghép 5 điều luật Căn cứ',
        stage: [
          { cue: 'prop', actor: 'player', prop: 'rulebook', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: { line: 0 } },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_peace', at: { line: 2 } },
          { cue: 'prop', actor: 'player', prop: null, at: 'end' },
        ],
        intro_lines: [
          { speaker: 'NPC_B', text: 'Phải có luật. Điều 1: không tự lấy đồ của người khác.' },
          { speaker: 'NPC_A', text: 'Điều 2: đứa nào ăn hết đồ ăn thì tự giác mua thêm!' },
          { speaker: 'NPC_D', text: '…Ai tới trước thì dọn chỗ ngồi.' },
          { speaker: 'NPC_C', text: 'Nếu có ai buồn thì… mọi người đừng bỏ bạn đó ở lại một mình nha.' },
          { speaker: 'player', text: 'Điều 5: chụp ảnh thì phải đủ người.' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Chốt! Sổ luật viết xong rồi, ai vô Căn cứ cũng phải tuân thủ!' },
          { speaker: 'NPC_B', text: 'Ông nói như có cả trăm người muốn vô vậy.' },
          { speaker: 'NPC_A', text: 'Biết đâu sau này tụi mình nổi tiếng thiệt!' },
        ],
      },
      {
        id: 'q_m1_main_03.s06',
        kind: 'cutscene',
        objective: 'Treo biển tên Căn cứ Bí mật',
        stage: [
          { cue: 'prop', actor: 'NPC_A', prop: 'base_sign', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: { line: 5 } },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_wave', at: { line: 7 } },
          { cue: 'prop', actor: 'NPC_A', prop: null, at: 'end' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Tên tao trên biển phải viết to nhất!' },
          { speaker: 'NPC_B', text: 'Không có chuyện đó. Ai cũng bằng nhau.' },
          { speaker: 'NPC_C', text: 'Đức mà viết to nhất là tên Quân bị chen mất đó.' },
          { speaker: 'NPC_A', text: 'Mới thành lập đã bị cắt quyền lợi rồi!' },
          { speaker: 'NPC_D', text: 'Vậy từ nay có chỗ gặp nhau rồi.' },
          { speaker: 'NPC_A', text: 'Đây là địa bàn của tụi mình!' },
          { speaker: 'NPC_B', text: 'Đừng gọi là địa bàn. Nghe ghê quá.' },
          { speaker: 'NPC_A', text: '{player_name} ơi, chụp tấm biển khai trương giùm tao nha!' },
        ],
      },
      {
        id: 'q_m1_main_03.s07',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0702.base',
        subjects: [],
        album_entry_id: 'alb.d.g07.02.01',
        objective: 'Căn góc máy chụp tấm biển Căn cứ sao cho rõ từng nét chữ',
        prompt: 'Chụp tấm biển cho rõ chữ',
        stage: [
          { cue: 'prop', actor: 'player', prop: 'camera', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_peace', at: 'end' },
          { cue: 'prop', actor: 'player', prop: null, at: 'end' },
        ],
        after_lines: [
          { speaker: 'NPC_B', text: 'Rõ từng chữ. Lần này {g:ông|bà} chụp đàng hoàng thiệt.' },
          { speaker: 'NPC_A', text: 'Thấy chưa, chữ tao viết đẹp ghê hông!' },
        ],
      },
    ],
  },
];

export const sideQuests: Quest[] = [
  {
    owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0',
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
  shape: 'sign',   // biển tên + sổ luật (hình 3D ở phòng 2026; trước ghi 'paper')
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g07.02.01', memory_day_id: 'd.g07.02', kind: 'photo', source_quest_id: 'q_m1_main_03', media_spec: 'B' },
  { id: 'frag.d.g07.02.02', memory_day_id: 'd.g07.02', kind: 'note', source_quest_id: 'q_m1_main_03', text: 'Góc sân sau trở thành Căn cứ Bí mật của năm đứa.' },
  { id: 'frag.d.g07.02.03', memory_day_id: 'd.g07.02', kind: 'artifact' },
];

export const sideFragments: MemoryFragment[] = [
  { id: 'frag.d.g07.02.04', memory_day_id: 'd.g07.02', kind: 'sticker', source_quest_id: 'q_m1_ai_side_04', text: 'Viên bi mắt mèo' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g07.02.01', page_id: 'page.d.g07.02', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.02.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0702.base', at_step_id: 'q_m1_main_03.s07' }, replayable: true },
  { id: 'alb.d.g07.02.02', page_id: 'page.d.g07.02', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g07.02.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g07.02.03', page_id: 'page.d.g07.02', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g07.02.03', source: 'sticker_art', required_for_restore: true },
];

export const sideEntries: AlbumEntry[] = [
  { id: 'alb.d.g07.02.04', page_id: 'page.d.g07.02', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g07.02.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_side_04', replayable: true },
];
