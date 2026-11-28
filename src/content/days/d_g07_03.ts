/**
 * TRANG 4 (d.g07.03) — ĐỦ NĂM ĐỨA (Cuối lớp 7, Tháng 5/2016)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 * Chuẩn hóa N-01 (B6, B7, C4, C5, D1, G-1, G-7).
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g07.03',
  title: 'Trang 4: Đủ năm đứa',
  school_year_id: 'g07',
  map_id: 'map_thcs',
  map_variant: 'g07_end',
  weather_by_step: {
    'q_m1_main_05.s06': 'rain_shower',
    'q_m1_main_05.s07': 'after_rain_rainbow',
  },
  open_zones: ['zone.thcs.classroom', 'zone.thcs.corridor', 'zone.thcs.yard', 'zone.thcs.gate', 'zone.thcs.field', 'zone.thcs.base'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m1_05',
  main_chain: ['q_m1_main_05'],
  side_quests: ['q_m1_ai_side_02'],
  daily_pool: [],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.yard_group_1', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.yard_group_2', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_group_3', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_group_4', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.tripod_spot', label: 'Ghế đá dưới gốc phượng', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ để đồ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.gutter', label: 'Rãnh nước mái hiên', zone_id: 'zone.thcs.corridor', kind: 'marker' },
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.snack_cart', label: 'Xe quà vặt cổng trường', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.marble_spot', label: 'Chỗ chơi bi bãi đất', zone_id: 'zone.thcs.field', kind: 'marker' },
    { id: 'itr.thcs.old_table', label: 'Bàn gỗ cũ ở Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
  ],
  cameras: [
    { id: 'cam.d0703.group', marker: 'cam.thcs.phuong_group', fov: 38 },
    { id: 'cam.d0703.rainbow', marker: 'cam.thcs.rainbow_log', fov: 44 },
  ],
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
        objective: 'Tới gặp Đức đang cầm máy ảnh giữa sân trường',
        title_card: { id: 'tc_p4_c1', title: 'Cuối năm lớp 7.', subtitle: 'Phượng vừa chớm đỏ.', duration_ms: 3000, backdrop: 'assets/backdrops/phuong_bloom.jpg' },
        stage: [
          { cue: 'prop', actor: 'NPC_A', prop: 'camera', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_wave', at: { line: 2 } },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: { line: 4 } },
          { cue: 'prop', actor: 'NPC_A', prop: null, at: { line: 6 } },
          { cue: 'prop', actor: 'player', prop: 'camera', at: { line: 6 } },
          { cue: 'move', actor: 'NPC_C', to: 'spot.thcs.phuong_group_3', pace: 'walk', at: 'end' },
          { cue: 'move', actor: 'NPC_A', to: 'spot.thcs.phuong_group_1', pace: 'walk', at: 'end' },
          { cue: 'move', actor: 'NPC_B', to: 'spot.thcs.phuong_group_2', pace: 'walk', at: 'end' },
          { cue: 'move', actor: 'NPC_D', to: 'spot.thcs.phuong_group_4', pace: 'walk', at: 'end' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Ê {player_name}! Tao coi hết mấy tấm ảnh trong máy mày rồi.' },
          { speaker: 'NPC_A', text: 'Chụp quá trời mà chưa có tấm nào đủ năm đứa cho đàng hoàng!' },
          { speaker: 'NPC_A', text: 'Châu! Quân! Hạ! Lại đây lẹ lên!' },
          { speaker: 'NPC_B', text: 'Gì mà la muốn sập cả sân trường vậy ông?' },
          { speaker: 'NPC_A', text: 'Chụp ảnh! Sắp hết lớp 7 rồi, phải có tấm đủ năm đứa!' },
          { speaker: 'NPC_D', text: '…Chụp liền chiều nay cũng được. Tớ rảnh.' },
          { speaker: 'NPC_A', text: 'Nè, trả máy cho thợ chụp chính của tụi mình đó.' },
          { speaker: 'NPC_C', text: 'Mọi người ra gốc phượng nha, chỗ đó nắng đẹp nhất!' },
        ],
      },
      {
        id: 'q_m1_main_05.s02',
        kind: 'choice',
        choice_id: 'c_m1_05_tone',
        measured: true,
        about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        objective: 'Chọn kiểu chụp ảnh cho cả nhóm: Nhí nhố · Tự nhiên · Ảnh thẻ',
        stage: [
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_peace', at: 'start' },
        ],
        prompt: {
          speaker: 'NPC_C',
          text: '{player_name} chọn giùm mọi người đi, chụp kiểu nào đây?',
        },
        options: [
          {
            id: 'playful',
            tone: 'playful',
            text: 'Tạo dáng nhí nhố làm mặt hề',
            set_flags: { 'm1.group_photo_style': 'playful' },
            lines: [{ speaker: 'NPC_D', text: '…Ghế đá này chắc nè, cậu để máy lên đây đi.' }],
          },
          {
            id: 'gentle',
            tone: 'gentle',
            text: 'Đứng tự nhiên, khoác vai cười tươi',
            set_flags: { 'm1.group_photo_style': 'gentle' },
            lines: [{ speaker: 'NPC_D', text: '…Ghế đá này chắc nè, cậu để máy lên đây đi.' }],
          },
          {
            id: 'deep',
            tone: 'deep',
            text: 'Nghiêm trang chỉnh tề như ảnh thẻ',
            set_flags: { 'm1.group_photo_style': 'deep' },
            lines: [{ speaker: 'NPC_D', text: '…Ghế đá này chắc nè, cậu để máy lên đây đi.' }],
          },
        ],
      },
      {
        id: 'q_m1_main_05.s03',
        kind: 'interact',
        target: 'itr.thcs.tripod_spot',
        objective: 'Tiến lại ghế đá trống đặt máy ảnh và canh khung ngắm',
        stage: [
          { cue: 'prop', actor: 'player', prop: null, at: 'end' },
        ],
        lines: [
          { speaker: 'NPC_C', text: '{player_name} bấm xong nhớ chạy vô liền nha…' },
          { speaker: 'NPC_B', text: 'Đứng đâu thì để {player_name} xếp.' },
          { speaker: 'NPC_A', text: 'Nhớ chừa chỗ giữa cho tao nha!' },
        ],
      },
      {
        id: 'q_m1_main_05.s04',
        kind: 'minigame',
        game: 'mg_lineup',
        level: 'min',
        objective: 'Kéo thả sắp xếp vị trí đứng cho năm người trong khung hình',
        lines: [
          { speaker: 'NPC_A', text: 'Đứng đâu cũng được hết, miễn sao có đủ năm đứa!' },
        ],
      },
      {
        id: 'q_m1_main_05.s05',
        kind: 'photo',
        mode: 'timer',
        camera_id: 'cam.d0703.group',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g07.03.01',
        stand_zone: { marker: 'spot.thcs.phuong_group', radius: 1.1 },
        objective: 'Có 10 giây! Chạy nhanh vào vòng sáng dưới gốc cây tạo dáng',
        // Câu của Đức nói NGAY khi bấm hẹn giờ (TONG_DUYET Trang 4 Cảnh 5). Không dùng `first_line`:
        // `first_line` phát SAU lần chụp đầu → Đức sẽ giục "chạy lẹ" khi ảnh đã chụp xong, và còn chặn màn xem ảnh.
        countdown_lines: [
          { speaker: 'NPC_A', text: 'Có mười giây thôi, chạy lẹ {player_name}!', at_s: 10 },
          { speaker: 'NPC_A', text: 'Làm mặt hề hết nha tụi mày! Ba… hai…', at_s: 5, when: { flag: 'm1.group_photo_style', equals: 'playful' }, fallback: '' },
          { speaker: 'NPC_C', text: 'Cười tự nhiên nha, đừng nhìn máy cứng đơ đó.', at_s: 5, when: { flag: 'm1.group_photo_style', equals: 'gentle' }, fallback: '' },
          { speaker: 'NPC_B', text: 'Đứng ngay ngắn. Nhìn thẳng máy. Không ai được cười.', at_s: 5, when: { flag: 'm1.group_photo_style', equals: 'deep' }, fallback: '' },
        ],
        after_lines: [
          { speaker: 'NPC_A', text: 'Khoan đã! Tao còn chưa kịp làm mặt hề xong mà!', when: { flag: 'm1.group_photo_style', equals: 'playful' }, fallback: '' },
          { speaker: 'NPC_B', text: 'Trễ rồi, máy chụp xong rồi.', when: { flag: 'm1.group_photo_style', equals: 'playful' }, fallback: '' },
          { speaker: 'NPC_B', text: 'Kêu khoác vai mà mấy người đứng cách cả gang tay.', when: { flag: 'm1.group_photo_style', equals: 'gentle' }, fallback: '' },
          { speaker: 'NPC_A', text: 'Kệ đi, nhìn mặt đứa nào cũng tươi rói kìa!', when: { flag: 'm1.group_photo_style', equals: 'gentle' }, fallback: '' },
          { speaker: 'NPC_A', text: 'Chụp xong nhìn nghiêm như ảnh thẻ dán hồ sơ luôn…', when: { flag: 'm1.group_photo_style', equals: 'deep' }, fallback: '' },
          { speaker: 'NPC_D', text: '…Tớ thấy nhìn vầy cũng đẹp mà.', when: { flag: 'm1.group_photo_style', equals: 'deep' }, fallback: '' },
        ],
      },
      {
        id: 'q_m1_main_05.s06',
        kind: 'cutscene',
        objective: 'Chạy theo Đức và nhóm bạn về dưới mái che Căn cứ',
        narrative: {
          before: [{
            id: 'narr_p4_c6_rain_storm',
            channel: 'narrator',
            text: 'Một cơn mưa rào mùa hạ bất chợt ào ào trút xuống. Lá phượng rơi lả tả trên nền đất đỏ.',
            sfx: 'sfx_summer_rain_thunder',
            backdrop: 'assets/backdrops/phuong_bloom.jpg',
          }],
          after: [{
            id: 'narr_p4_c7_rainbow',
            channel: 'narrator',
            text: 'Mưa rào tạnh nhanh như lúc đến. Bầu trời sau mưa trong vắt, một dải cầu vồng rực rỡ vắt ngang qua khoảng sân sau.',
            sfx: 'sfx_birds_after_rain',
            backdrop: 'assets/backdrops/rainbow_field.jpg',
          }],
        },
        stage: [
          { cue: 'move', actor: 'NPC_A', to: 'spot.thcs.base_table', pace: 'run', at: 'start' },
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.rainbow_group_1', at: { line: 4 } },
          { cue: 'teleport', actor: 'NPC_B', to: 'spot.thcs.rainbow_group_2', at: { line: 4 } },
          { cue: 'teleport', actor: 'NPC_C', to: 'spot.thcs.rainbow_group_3', at: { line: 4 } },
          { cue: 'teleport', actor: 'NPC_D', to: 'spot.thcs.rainbow_group_4', at: { line: 4 } },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Mưa rồi tụi mày ơi, tao cầm máy đây, chạy!' },
          { speaker: 'NPC_C', text: 'Về Căn cứ thôi mọi người! Lẹ lên!' },
          { speaker: 'NPC_A', text: 'Máy khô re nè, nãy tao ôm kỹ trong áo luôn.' },
          { speaker: 'NPC_B', text: 'Tấm hồi nãy đẹp rồi còn gì.' },
          { speaker: 'NPC_C', text: 'Mọi người nhìn lên trời kìa… Cầu vồng!' },
          { speaker: 'NPC_A', text: 'Ông trời thưởng vì tụi mình chụp đủ năm đứa đó!' },
          { speaker: 'NPC_B', text: 'Hiện tượng tự nhiên thôi.' },
          { speaker: 'player', text: 'Chụp thêm một tấm với cầu vồng nha!' },
          { speaker: 'NPC_C', text: 'Lần này khỏi tạo dáng, đứng cạnh nhau là được.' },
        ],
      },
      {
        id: 'q_m1_main_05.s07',
        kind: 'photo',
        mode: 'timer',
        camera_id: 'cam.d0703.rainbow',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g07.03.cover',
        stand_zone: { marker: 'spot.thcs.rainbow_group', radius: 1.1 },
        hide_pose: true,
        prompt: 'Cầu vồng còn đó. Bấm hẹn giờ · Lần này khỏi tạo dáng',
        objective: 'Đặt máy lên khúc gỗ bãi đất, chụp bức ảnh kỷ niệm cùng cầu vồng',
        after_lines: [
          { speaker: 'NPC_D', text: '…Đẹp thiệt.' },
          { speaker: 'NPC_A', text: 'Tấm này về phải in ra to nhất mới đã!' },
        ],
      },
      {
        id: 'q_m1_main_05.s08',
        kind: 'cutscene',
        objective: 'Tiến lại bức tường gỗ Căn cứ dán bức ảnh cầu vồng năm đứa',
        title_card: { id: 'tc_p4_c8', title: 'Mấy hôm sau.', subtitle: 'Ảnh vừa in xong.', duration_ms: 3000, backdrop: 'assets/backdrops/base_secret.jpg' },
        stage: [
          { cue: 'prop', actor: 'player', prop: 'photo_print', at: 'start' },
          { cue: 'prop', actor: 'player', prop: null, at: 'end' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Nhìn nè! Từ ba đứa thành năm đứa rồi!' },
          { speaker: 'NPC_B', text: 'Ừ. Cũng không ngờ chơi với nhau lâu vậy.' },
          { speaker: 'NPC_D', text: 'Góc ảnh hơi bung kìa. Để tớ dán lại.' },
          { speaker: 'player', text: 'Mai mốt tụi mình chụp thêm nữa nha, đừng để thiếu ai.' },
          { speaker: 'NPC_A', text: 'Đứa nào vắng là phải chụp bù!' },
        ],
      },
    ],
  },
];

export const sideQuests: Quest[] = [
  {
    owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0',
    id: 'q_m1_ai_side_02',
    type: 'side',
    scope: 'm1',
    memory_day_id: 'd.g07.03',
    title: '[PLACEHOLDER] Đi dạo một vòng các khu trường cũ',
    blocks_main: false,
    steps: [
      { id: 'q_m1_ai_side_02.s01', kind: 'goto', target: 'itr.thcs.gutter', objective: '[PLACEHOLDER] Tới hành lang rãnh nước' },
      { id: 'q_m1_ai_side_02.s02', kind: 'goto', target: 'itr.thcs.blackboard', objective: '[PLACEHOLDER] Vào lớp học bảng đen' },
      { id: 'q_m1_ai_side_02.s03', kind: 'goto', target: 'itr.thcs.snack_cart', objective: '[PLACEHOLDER] Ra xe quà vặt cổng trường' },
      { id: 'q_m1_ai_side_02.s04', kind: 'goto', target: 'itr.thcs.marble_spot', objective: '[PLACEHOLDER] Sang bãi đất trống chơi bi' },
      { id: 'q_m1_ai_side_02.s05', kind: 'goto', target: 'itr.thcs.old_table', objective: '[PLACEHOLDER] Ghé thăm Căn cứ Bí mật' },
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
  reward_fragment_ids: ['frag.d.g07.03.01', 'frag.d.g07.03.06'],
  album_entry_ids: ['alb.d.g07.03.01', 'alb.d.g07.03.02', 'alb.d.g07.03.03', 'alb.d.g07.03.04', 'alb.d.g07.03.05', 'alb.d.g07.03.cover'],
  new_present_action: 'pde_05',
  shape: 'photo',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g07.03.01', memory_day_id: 'd.g07.03', kind: 'photo', source_quest_id: 'q_m1_main_05', media_spec: 'A' },
  { id: 'frag.d.g07.03.02', memory_day_id: 'd.g07.03', kind: 'back_note', text: 'Cuối năm lớp 7, dưới gốc phượng chớm nở: "Đủ năm đứa".' },
  { id: 'frag.d.g07.03.03', memory_day_id: 'd.g07.03', kind: 'artifact' },
  { id: 'frag.d.g07.03.06', memory_day_id: 'd.g07.03', kind: 'photo', source_quest_id: 'q_m1_main_05', media_spec: 'A' },
];

export const sideFragments: MemoryFragment[] = [
  { id: 'frag.d.g07.03.04', memory_day_id: 'd.g07.03', kind: 'sticker', source_quest_id: 'q_m1_ai_daily_01', text: '[PLACEHOLDER] Dấu trực nhật cuối năm' },
  { id: 'frag.d.g07.03.05', memory_day_id: 'd.g07.03', kind: 'sticker', source_quest_id: 'q_m1_ai_side_02', text: '[PLACEHOLDER] Ký ức khắp sân trường' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g07.03.01', page_id: 'page.d.g07.03', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.03.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0703.group', at_step_id: 'q_m1_main_05.s05' }, replayable: true },
  { id: 'alb.d.g07.03.02', page_id: 'page.d.g07.03', slot_type: 'back_note', slot_index: 1, fragment_id: 'frag.d.g07.03.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g07.03.03', page_id: 'page.d.g07.03', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g07.03.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g07.03.cover', page_id: 'page.d.g07.03', slot_type: 'main_photo', slot_index: 5, fragment_id: 'frag.d.g07.03.06', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0703.rainbow', at_step_id: 'q_m1_main_05.s07' }, replayable: true },
];

export const sideEntries: AlbumEntry[] = [
  { id: 'alb.d.g07.03.04', page_id: 'page.d.g07.03', slot_type: 'quest_record', slot_index: 3, fragment_id: 'frag.d.g07.03.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_daily_01', replayable: true },
  { id: 'alb.d.g07.03.05', page_id: 'page.d.g07.03', slot_type: 'sticker', slot_index: 4, fragment_id: 'frag.d.g07.03.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_side_02', replayable: true },
];
