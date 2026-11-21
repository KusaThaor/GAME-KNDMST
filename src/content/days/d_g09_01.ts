/**
 * TRANG 7 (d.g09.01) — TỜ BÁO TƯỜNG CUỐI CÙNG (Học kỳ I lớp 9, Tháng 11/2017)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - {g:ông|bà}"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_DRAFT', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g09.01',
  title: 'Trang 7: Tờ báo tường cuối cùng',
  school_year_id: 'g09',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.classroom', 'zone.thcs.corridor', 'zone.thcs.yard', 'zone.thcs.base', 'zone.thcs.gate', 'zone.thcs.field'],
  spawn_point: 'spawn.thcs.classroom',
  anchor_artifact_id: 'art_m2_03',
  main_chain: ['q_m2_main_03'],
  side_quests: ['q_m2_side_02'],
  daily_pool: ['q_m1_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.class_front', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.base_table', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_bench_1', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.corridor_door', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.wall_news', label: 'Bảng tin báo tường', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.old_table', label: 'Bàn gỗ cũ ở Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.gutter', label: 'Rãnh nước mái hiên', zone_id: 'zone.thcs.corridor', kind: 'marker' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ để đồ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [
    { id: 'cam.d0901.newspaper', marker: 'cam.thcs.yard_bench', fov: 40 },
  ],
  album_page_id: 'page.d.g09.01',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m2_main_03',
    type: 'main',
    scope: 'm2',
    memory_day_id: 'd.g09.01',
    title: 'Tờ báo tường cuối cùng',
    blocks_main: true,
    steps: [
      {
        id: 'q_m2_main_03.s01',
        kind: 'cutscene',
        objective: 'Đầu năm lớp 9, phát phiếu nguyện vọng',
        lines: [
          { speaker: 'narrator', text: 'Đầu năm lớp 9. Bảng đếm ngược đầu lớp: 270.' },
          { speaker: 'narrator', text: 'Lớp học năm cuối cấp. Cô Diệp phát phiếu khảo sát nguyện vọng.' },
          { speaker: 'narrator', text: 'Cô Diệp: "Đồ chơi dính này để ngoài lớp nghen."' },
        ],
      },
      {
        id: 'q_m2_main_03.s02',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Hỏi nguyện vọng thi cấp 3 của Châu',
        lines: [
          { speaker: 'NPC_B', text: 'Trường Chuyên. Không phải "muốn". Là "phải".' },
        ],
      },
      {
        id: 'q_m2_main_03.s03',
        kind: 'talk',
        with: 'NPC_D',
        objective: 'Hỏi nguyện vọng của Quân',
        lines: [
          { speaker: 'NPC_D', text: 'Tớ… trường gần chợ thôi. Điểm tớ vậy là vừa.' },
        ],
      },
      {
        id: 'q_m2_main_03.s04',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Hỏi nguyện vọng của Đức',
        lines: [
          { speaker: 'NPC_A', text: 'Năng khiếu! Tao vẽ, tao diễn, tao— mà nhà tao đang tính chuyện gì đó, chưa biết.' },
          { speaker: 'NPC_A', text: 'Thôi, cả đám cùng thi một trường đi!' },
        ],
      },
      {
        id: 'q_m2_main_03.s05',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Hỏi nguyện vọng của Hạ',
        lines: [
          { speaker: 'NPC_C', text: 'Trường công gần nhà. Có cây phượng thì tốt.' },
        ],
      },
      {
        id: 'q_m2_main_03.s06',
        kind: 'minigame',
        game: 'mg_sudoku',
        level: 'min',
        objective: 'Giải ô Sudoku trên trang giấy tập',
      },
      {
        id: 'q_m2_main_03.s07',
        kind: 'choice',
        choice_id: 'c_m2_07_reason',
        measured: false,
        objective: 'Điền lý do chọn nguyện vọng vào phiếu',
        options: [
          { id: 'near_home', text: 'Gần nhà.' },
          { id: 'parents', text: 'Ba mẹ muốn vậy.' },
          { id: 'random', text: 'Chưa biết, ghi đại.' },
        ],
      },
      {
        id: 'q_m2_main_03.s08',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Nộp phiếu khảo sát nguyện vọng cho cô',
        lines: [
          { speaker: 'NPC_C', text: 'Ủa… vậy mình chung.' },
        ],
      },
      {
        id: 'q_m2_main_03.s09',
        kind: 'minigame',
        game: 'mg_wall_paper',
        level: 'min',
        objective: 'Làm tờ báo tường 20/11 cùng cả nhóm',
      },
      {
        id: 'q_m2_main_03.s10',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Tranh cãi về việc khác trường',
        lines: [
          { speaker: 'NPC_A', text: 'Tiêu đề: "Một trường, năm đứa"! Cả đám cùng thi một trường đi, khỏi xa nhau luôn.' },
          { speaker: 'NPC_D', text: 'Tớ… không đủ điểm đâu.' },
          { speaker: 'NPC_A', text: 'Hai đứa mày chung trường rồi, sướng ha. Còn tụi tao?' },
          { speaker: 'NPC_B', text: 'Ông nghĩ ai cũng được chọn hả? Tui đâu có lựa chọn nào khác!' },
          { speaker: 'NPC_A', text: 'Vậy… khác trường là hết bạn luôn hả?' },
          { speaker: 'NPC_C', text: 'Châu nói vậy với Đức là không được đâu… Đức nói vậy với Châu cũng không được.' },
        ],
      },
      {
        id: 'q_m2_main_03.s11',
        kind: 'choice',
        choice_id: 'c_m2_07_reaction',
        measured: true,
        about: ['NPC_A', 'NPC_B'],
        objective: 'Phản ứng trước cuộc cãi vã của nhóm',
        options: [
          { id: 'silence', tone: 'gentle', text: 'Im lặng, đưa chổi cho Quân quét giấy vụn' },
          { id: 'honest', tone: 'deep', text: 'Mình cũng sợ… sợ mất mọi người.', set_flags: { 'm2.player_honest': true } },
        ],
      },
      {
        id: 'q_m2_main_03.s12',
        kind: 'goto',
        target: 'itr.thcs.old_table',
        objective: 'Tìm Châu ở Căn cứ sau giờ trả bài',
      },
      {
        id: 'q_m2_main_03.s13',
        kind: 'choice',
        choice_id: 'c_m2_07_comfort',
        measured: false,
        about: ['NPC_B'],
        objective: 'An ủi Châu khi bị điểm thấp',
        options: [
          { id: 'tissue', text: 'Ngồi im, đưa khăn giấy' },
          { id: 'ask', text: 'Bà ổn không?' },
          { id: 'score', text: 'Điểm số đâu phải là bà.' },
        ],
      },
      {
        id: 'q_m2_main_03.s14',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Lắng nghe Châu tâm sự',
        lines: [
          { speaker: 'NPC_B', text: 'Tui ngồi năm phút thôi. {g:Ông|Bà} đừng hỏi gì hết nha.' },
          { speaker: 'NPC_B', text: 'Ba mẹ tui chưa biết điểm này. Cầm giùm tui. Tui cầm nó là lại muốn tô.' },
          { speaker: 'NPC_B', text: 'Cảm ơn. Đừng kể ai nghen.' },
        ],
      },
      {
        id: 'q_m2_main_03.s15',
        kind: 'cutscene',
        objective: 'Hoàn thành tờ báo tường',
        lines: [
          { speaker: 'narrator', text: 'Góc cười của Đức chỉ có một dòng: "Hôm nay không có chuyện cười."' },
          { speaker: 'narrator', text: 'Góc dưới cùng còn trống một ô.' },
          { speaker: 'NPC_C', text: 'Để lại chỗ này… lúc nào đó mình điền nha.' },
          { speaker: 'NPC_D', text: 'Ừ. Để dành.' },
          { speaker: 'NPC_B', text: 'Ô trống là lỗi bố cục. Nhưng… tui không xóa.' },
        ],
      },
      {
        id: 'q_m2_main_03.s16',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0901.newspaper',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g09.01.01',
        objective: 'Chụp ảnh tờ báo tường hoàn chỉnh',
      },
      {
        id: 'q_m2_main_03.s17',
        kind: 'interact',
        target: 'itr.thcs.wall_news',
        objective: 'Chép bố cục tờ báo vào bản A5 kẹp sổ',
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m2_side_02',
    type: 'side',
    scope: 'm2',
    memory_day_id: 'd.g09.01',
    title: 'Khảo sát báo tường các lớp',
    blocks_main: false,
    steps: [
      {
        id: 'q_m2_side_02.s01',
        kind: 'interact',
        target: 'itr.thcs.wall_news',
        objective: 'Xem các tác phẩm báo tường lớp bên',
        lines: [
          { speaker: 'NPC_B', text: 'Báo tường lớp bên dùng màu nước đẹp ghê.' },
        ],
      },
      {
        id: 'q_m2_side_02.s02',
        kind: 'goto',
        target: 'itr.thcs.gutter',
        objective: 'Đi dạo hành lang đọc báo tường các lớp',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m2_03',
  name: 'Bản báo tường thu nhỏ A5',
  description: 'Bản báo tường chép tay gấp đôi, góc dưới có một ô trống có vệt sáp màu nhòe.',
  school_year_id: 'g09',
  hook_2026: 'Ô này… sao lem màu vầy ta? Hồi đó tụi mình định dán gì vô?',
  appear_when: { day: 'd.g08.01' },
  target_memory_day_id: 'd.g09.01',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g09.01.01', 'frag.d.g09.01.02', 'frag.d.g09.01.03'],
  album_entry_ids: ['alb.d.g09.01.01', 'alb.d.g09.01.02', 'alb.d.g09.01.03', 'alb.d.g09.01.04', 'alb.d.g09.01.05'],
  new_present_action: 'pde_16',
  shape: 'paper',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g09.01.01', memory_day_id: 'd.g09.01', kind: 'photo', source_quest_id: 'q_m2_main_03', media_spec: 'A' },
  { id: 'frag.d.g09.01.02', memory_day_id: 'd.g09.01', kind: 'artifact' },
  { id: 'frag.d.g09.01.03', memory_day_id: 'd.g09.01', kind: 'back_note', text: 'Tờ báo tường cuối cùng của cấp 2: "Ô trống để dành".' },
  { id: 'frag.d.g09.01.04', memory_day_id: 'd.g09.01', kind: 'sticker', text: 'Cây bút highlight vàng của Châu' },
  { id: 'frag.d.g09.01.05', memory_day_id: 'd.g09.01', kind: 'sticker', source_quest_id: 'q_m2_side_02', text: 'Bảng đếm ngược 197 ngày' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g09.01.01', page_id: 'page.d.g09.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g09.01.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0901.newspaper', at_step_id: 'q_m2_main_03.s16' }, replayable: true },
  { id: 'alb.d.g09.01.02', page_id: 'page.d.g09.01', slot_type: 'artifact', slot_index: 1, fragment_id: 'frag.d.g09.01.02', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g09.01.03', page_id: 'page.d.g09.01', slot_type: 'back_note', slot_index: 2, fragment_id: 'frag.d.g09.01.03', source: 'text', required_for_restore: true },
  { id: 'alb.d.g09.01.04', page_id: 'page.d.g09.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g09.01.04', source: 'sticker_art', required_for_restore: false, replayable: true },
  { id: 'alb.d.g09.01.05', page_id: 'page.d.g09.01', slot_type: 'sticker', slot_index: 4, fragment_id: 'frag.d.g09.01.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m2_side_02', replayable: true },
];
