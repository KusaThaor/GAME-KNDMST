/**
 * TRANG 1 (d.g06.01) — MẬT LỆNH SỐ 01 (Lớp 6, 2014)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức mới quen xưng "cậu - tớ", lỡ miệng "mày - tao" lúc trực nhật; Châu xưng "tui - ông/bà".
 * Chuẩn hóa N-01 (B1, B2, B3, C1, G-7).
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g06.01',
  title: 'Trang 1: Mật lệnh số 01',
  school_year_id: 'g06',
  map_id: 'map_thcs',
  map_variant: 'g06',
  open_zones: ['zone.thcs.yard', 'zone.thcs.corridor', 'zone.thcs.classroom', 'zone.thcs.gate'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m1_01',
  main_chain: ['q_m1_main_01'],
  side_quests: ['q_m1_ai_side_01'],
  daily_pool: ['q_m1_ai_daily_01'],
  // BUG-T1-B: đầu Ngày Đức đứng ngay trước chỗ người chơi xuất hiện (Cảnh 1 nhặt vở), Châu ở cửa lớp (Cảnh 2).
  // Các bước sau tự dời cả người chơi lẫn hai bạn bằng cue (khuất sau màn tối): s02 trong lớp, s03 sân đá cầu,
  // s04 trước bảng đen, s05 bậc thềm tiệm tạp hóa (khung cam.thcs.grocery, ảnh bộ ba s07). s06/s07 đặt lại chỗ đứng
  // để khi tải lại giữa chừng (tiếp tục Ngày) ảnh bộ ba vẫn đúng.
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.notebook_drop', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.class_door', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.class_list', label: 'Bảng phân lớp', zone_id: 'zone.thcs.corridor', kind: 'marker' },
    { id: 'itr.thcs.grocery_steps', label: 'Bậc thềm tiệm tạp hóa', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.stone_bench', label: 'Ghế đá sân trường', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.flagpole', label: 'Cột cờ', zone_id: 'zone.thcs.yard', kind: 'marker' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.shuttle_ring', label: 'Sân đá cầu', zone_id: 'zone.thcs.yard', kind: 'marker' },
  ],
  cameras: [
    { id: 'cam.d0601.grocery', marker: 'cam.thcs.grocery', fov: 42 },
    { id: 'cam.d0601.bench', marker: 'cam.thcs.yard_bench', fov: 42 },
    { id: 'cam.d0601.desk3', marker: 'cam.thcs.desk3', fov: 42 },
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
        objective: 'Nói chuyện với bạn vừa nhặt vở giúp bạn',
        title_card: { id: 'tc_p1_c1', title: 'Ngày đầu lớp 6', subtitle: 'Một buổi sáng tháng Chín, năm 2014', duration_ms: 3000 },
        narrative: {
          before: [{
            id: 'narr_p1_c1_drop',
            channel: 'narrator',
            text: 'Một tiếng "bịch" vang lên phía sau. Cuốn vở bài tập trượt trên nền xi măng, dừng ngay trước mũi giày một cậu bạn đang chạy hớt hải.',
            sfx: 'sfx_book_drop',
          }],
        },
        stage: [
          { cue: 'prop', actor: 'NPC_A', prop: 'notebook', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_wave', at: { line: 0 } },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: { line: 4 } },
          { cue: 'prop', actor: 'NPC_A', prop: null, at: 'end' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Ê, bạn gì ơi! Vở của cậu nè, suýt bay xuống sân luôn đó.' },
          { speaker: 'player', text: 'À, cảm ơn cậu nha.' },
          { speaker: 'NPC_A', text: 'Nhãn vở ghi chung lớp với tớ nè! Đi tìm phòng chung không?' },
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
        objective: 'Ghép ký hiệu giải mật lệnh của Đức',
        stage: [
          // Cảnh 3 — trong lớp, ba bạn quanh bàn gần cửa sổ
          { cue: 'fade', on: true, at: 'start' },
          { cue: 'teleport', actor: 'player', to: 'itr.thcs.desk3', at: 'start' },
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.desk3_1', at: 'start' },
          { cue: 'teleport', actor: 'NPC_B', to: 'spot.thcs.desk3_2', at: 'start' },
          { cue: 'fade', on: false, at: 'start' },
          { cue: 'camera', camera_id: 'cam.d0601.desk3', dolly_ms: 800, at: { line: 0 } },
          { cue: 'camera', camera_id: null, dolly_ms: 600, at: 'end' },
        ],
        intro_lines: [
          { speaker: 'NPC_A', text: 'Ê, đọc đi! Mật lệnh tuyệt mật đó.' },
        ],
        lines: [
          { speaker: 'player', text: 'Mật lệnh tuyệt mật… là "RA CHƠI" thôi hả?' },
          { speaker: 'NPC_A', text: 'Mật mã cấp cao đó! Người ngoài đọc không ra đâu.' },
          { speaker: 'NPC_B', text: 'Cấp cao đâu không thấy, chữ ông viết còn không đọc nổi.' },
          { speaker: 'NPC_A', text: 'Ơ… dạ, Châu Tổng.' },
          { speaker: 'NPC_B', text: 'Gọi vậy nữa là tui khỏi sửa.' },
          { speaker: 'NPC_A', text: 'Dạ, Châu Tổng.' },
          { speaker: 'NPC_B', text: 'Lo chép bài đi, chút ra chơi rồi tính tiếp.' },
        ],
      },
      {
        id: 'q_m1_main_01.s03',
        kind: 'minigame',
        game: 'mg_footbag',
        level: 'min',
        objective: 'Đá cầu giữ nhịp cùng Đức',
        narrative: {
          before: [{
            id: 'narr_p1_c4_bell',
            channel: 'narrator',
            text: 'Tùng... tùng... tùng! Hồi trống ra chơi dồn dập vang lên khắp các dãy hành lang. Cả lớp ùa ra sân.',
            sfx: 'sfx_school_drum_3beats',
          }],
          after: [{
            id: 'narr_p1_c4_fail',
            channel: 'narrator',
            text: 'Đức vung chân quá đà. Quả cầu lông vịt bay vút một đường cong rồi rớt tọt vào bụi rậm ven sân.',
          }],
        },
        stage: [
          // Cảnh 4 — giờ ra chơi ở vòng đá cầu ngoài sân; người chơi đối diện Đức
          { cue: 'fade', on: true, at: 'start' },
          { cue: 'teleport', actor: 'player', to: 'spot.thcs.shuttle_group', at: 'start' },
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.shuttle_group_1', at: 'start' },
          { cue: 'teleport', actor: 'NPC_B', to: 'spot.thcs.shuttle_group_2', at: 'start' },
          { cue: 'fade', on: false, at: 'start' },
          { cue: 'prop', actor: 'NPC_B', prop: 'shuttlecock', at: 'start' },
          { cue: 'sfx', sfx: 'sfx_shuttle_kick', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_tada', at: 'end' },
          { cue: 'move', actor: 'NPC_B', to: 'spot.thcs.shuttle_bush', pace: 'walk', at: 'end' },
          { cue: 'prop', actor: 'NPC_B', prop: null, at: 'end' },
        ],
        intro_lines: [
          { speaker: 'NPC_A', text: 'Cậu cứ nhìn là biết tớ đá cầu giỏi cỡ nào!' },
        ],
        lines: [
          { speaker: 'NPC_B', text: 'Ừ, giỏi dữ chưa. Cầu bay vô bụi luôn rồi kìa.' },
          { speaker: 'NPC_A', text: 'Chiến thuật đánh lạc hướng thôi!' },
          { speaker: 'NPC_B', text: 'Để tui lượm. Hai người đứng yên đó.' },
        ],
      },
      {
        id: 'q_m1_main_01.s04',
        kind: 'minigame',
        game: 'mg_wipe_board',
        level: 'min',
        objective: 'Dùng khăn lau sạch bảng phấn cùng Đức',
        stage: [
          // Cảnh 5 — cuối buổi trong lớp: hai bạn trước bảng đen, Châu đeo cặp ở cửa
          { cue: 'fade', on: true, at: 'start' },
          { cue: 'teleport', actor: 'player', to: 'spot.thcs.board_group', at: 'start' },
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.board_group_1', at: 'start' },
          { cue: 'teleport', actor: 'NPC_B', to: 'spot.thcs.class_door_in', at: 'start' },
          { cue: 'fade', on: false, at: 'start' },
          { cue: 'sfx', sfx: 'sfx_chalk_wipe', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_peace', at: 'end' },
          { cue: 'motion', actor: 'NPC_B', motion: 'pose_wave', at: 'end' },
          { cue: 'visible', actor: 'NPC_B', visible: false, at: 'end' },
        ],
        intro_lines: [
          { speaker: 'NPC_B', text: 'Ghế tui xếp xong rồi. Bảng là phần hai người nha.' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ.' },
          { speaker: 'NPC_B', text: 'Mới quen một bữa mà ông mày tao rồi hả?' },
          { speaker: 'NPC_A', text: 'Thì quen rồi còn gì!' },
          { speaker: 'player', text: 'Ừ… nếu mai không có kiểm tra.' },
          { speaker: 'NPC_B', text: 'Làm bài tập trước đi rồi tính. Tui về đây.' },
          { speaker: 'player', text: 'Ngày đầu ở trường mới… hình như cũng không tệ như mình nghĩ.' },
        ],
      },
      {
        id: 'q_m1_main_01.s05',
        kind: 'cutscene',
        objective: 'Thời gian trôi qua tới cuối học kỳ',
        title_card: { id: 'tc_p1_c6', title: 'Mấy tháng sau…', subtitle: 'Bảng lớp đã ghi "Ôn tập học kỳ I".', duration_ms: 3000 },
        narrative: {
          before: [{
            id: 'world_p1_c6_sunset',
            channel: 'world_event',
            text: 'Ánh nắng chuyển hẳn sang sắc vàng rực của buổi hoàng hôn tan học. Bóng cây đổ dài trên sân trường.',
          }],
        },
        stage: [
          // Cảnh 6 — trong lúc tối: chiều hoàng hôn tan học, cả ba ở bậc thềm tiệm tạp hóa trước cổng
          { cue: 'fade', on: true, at: 'start' },
          { cue: 'weather', preset: 'golden_sunset', at: 'start' },
          { cue: 'visible', actor: 'NPC_B', visible: true, at: 'start' },
          { cue: 'teleport', actor: 'player', to: 'spot.thcs.grocery_group', at: 'start' },
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.grocery_1', at: 'start' },
          { cue: 'teleport', actor: 'NPC_B', to: 'spot.thcs.grocery_2', at: 'start' },
          { cue: 'fade', on: false, at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_wave', at: 'start' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Ê ê! Còn đúng một gói mì thôi! Lẹ lên mày!' },
        ],
      },
      {
        id: 'q_m1_main_01.s06',
        kind: 'minigame',
        game: 'mg_noodle',
        level: 'min',
        objective: 'Tới bậc thềm tiệm tạp hóa trước cổng trường',
        // Chạy bình thường thì s05 đã đặt sẵn (không thấy gì đổi); chỉ có tác dụng khi tải lại trang giữa chừng ở bước này.
        stage: [
          { cue: 'weather', preset: 'golden_sunset', at: 'start' },
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.grocery_1', at: 'start' },
          { cue: 'teleport', actor: 'NPC_B', to: 'spot.thcs.grocery_2', at: 'start' },
        ],
        intro_lines: [
          { speaker: 'NPC_A', text: 'Ê ê! Còn đúng một gói mì thôi! Lẹ lên mày!' },
        ],
        lines: [
          { speaker: 'NPC_A', text: 'Chia ba thì còn được mấy sợi!' },
          { speaker: 'NPC_B', text: 'Chia đều. Không bàn nữa.' },
          { speaker: 'NPC_A', text: 'Ê, ba đứa mình chưa có tấm hình chung nào hết á!' },
          { speaker: 'NPC_A', text: '{player_name} có máy ảnh mà! Quay ngược máy lại, tự sướng!' },
          { speaker: 'NPC_B', text: 'Máy đó đâu có màn hình đằng trước. Sao biết có vô hình không?' },
          { speaker: 'NPC_A', text: '…Đoán.' },
        ],
      },
      {
        id: 'q_m1_main_01.s07',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0601.grocery',
        subjects: ['player', 'NPC_A', 'NPC_B'],
        album_entry_id: 'alb.d.g06.01.01',
        shots: 3,
        shot_prompts: [
          'Lần 1: Quay ngược máy, đoán khung rồi bấm chụp',
          'Lần 2: Lệch rồi! Chỉnh hướng máy, bấm lại',
          'Lần 3: Lần cuối: Cố canh đủ ba người',
        ],
        prompt: 'Chọn một tấm ưng ý nhất để lưu vào cuốn Album',
        // TONG_DUYET Trang 1 Cảnh 8, lần bấm 1. Câu này từng nằm cứng trong game.ts (N-14), bị rơi khi R-B3 chuyển sang dữ liệu.
        first_line: { speaker: 'NPC_B', text: 'Khoan! Đức, tóc ông dựng lọt hết vô khung kìa!' },
        stage: [
          // như s06: giữ chỗ đứng + ánh sáng khi tải lại trang giữa chừng ở bước ảnh
          { cue: 'weather', preset: 'golden_sunset', at: 'start' },
          { cue: 'teleport', actor: 'NPC_A', to: 'spot.thcs.grocery_1', at: 'start' },
          { cue: 'teleport', actor: 'NPC_B', to: 'spot.thcs.grocery_2', at: 'start' },
          { cue: 'prop', actor: 'player', prop: 'camera', at: 'start' },
          { cue: 'motion', actor: 'NPC_A', motion: 'pose_peace', at: 'start' },
          { cue: 'prop', actor: 'player', prop: null, at: 'end' },
        ],
        objective: 'Chụp ảnh tự sướng bộ ba (Chụp 3 lần và chọn tấm đẹp nhất)',
      },
      {
        id: 'q_m1_main_01.s08',
        kind: 'cutscene',
        lines: [
          { speaker: 'NPC_A', text: 'Tấm này hư cấu quá! Chụp lại đi!' },
          { speaker: 'NPC_B', text: 'Tui thấy giữ tấm này được nè. Nhìn ngố y chang ông đó Đức.' },
          { speaker: 'player', text: 'Mai mốt nhất định tụi mình phải chụp thêm nhiều tấm nữa nha.' },
          { speaker: 'NPC_A', text: 'Chốt! Sau này chụp đủ một bộ sưu tập luôn!' },
        ],
      },
    ],
  },
];

export const sideQuests: Quest[] = [
  {
    owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0',
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
    owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0',
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
];

export const sideFragments: MemoryFragment[] = [
  { id: 'frag.d.g06.01.04', memory_day_id: 'd.g06.01', kind: 'sticker', source_quest_id: 'q_m1_ai_side_01', text: 'Danh sách trực nhật của Châu' },
  { id: 'frag.d.g06.01.05', memory_day_id: 'd.g06.01', kind: 'sticker', source_quest_id: 'q_m1_ai_daily_01', text: 'Dấu trực nhật đầu năm' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g06.01.01', page_id: 'page.d.g06.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g06.01.01', source: 'auto_snapshot', required_for_restore: true, snapshot: { camera_id: 'cam.d0601.grocery', at_step_id: 'q_m1_main_01.s07' } },
  { id: 'alb.d.g06.01.02', page_id: 'page.d.g06.01', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g06.01.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g06.01.03', page_id: 'page.d.g06.01', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g06.01.03', source: 'sticker_art', required_for_restore: true },
];

export const sideEntries: AlbumEntry[] = [
  { id: 'alb.d.g06.01.04', page_id: 'page.d.g06.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g06.01.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_side_01', replayable: true },
  { id: 'alb.d.g06.01.05', page_id: 'page.d.g06.01', slot_type: 'quest_record', slot_index: 4, fragment_id: 'frag.d.g06.01.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_ai_daily_01', replayable: true },
];
