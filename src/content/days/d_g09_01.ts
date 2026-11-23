/**
 * TRANG 7 (d.g09.01) — TỜ BÁO TƯỜNG CUỐI CÙNG (Đầu năm lớp 9 đến gần 20/11)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md dòng 636–701 (v1.4)
 * GDD nguồn: 02_GAMEPLAY_AND_MECHANICS.md §2.2 (Sudoku Cảnh A sau khi nộp phiếu nguyện vọng, đồng hồ 6 phút của Châu)
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - ông/bà"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g09.01',
  title: 'Trang 7: Tờ báo tường cuối cùng',
  school_year_id: 'g09',
  map_id: 'map_thcs',
  map_variant: 'g09',
  open_zones: [
    'zone.thcs.classroom',
    'zone.thcs.corridor',
    'zone.thcs.yard',
    'zone.thcs.field',
    'zone.thcs.base',
  ],
  spawn_point: 'spawn.thcs.classroom',
  anchor_artifact_id: 'art_m2_03',
  main_chain: ['q_m2_main_07'],
  side_quests: [],
  daily_pool: [],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.corridor_door', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.base_table', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_bench_2', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.class_front', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.wall_news', label: 'Bảng báo tường lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.blackboard', label: 'Bảng đen lớp học', zone_id: 'zone.thcs.classroom', kind: 'marker' },
    { id: 'itr.thcs.old_table', label: 'Bàn gỗ cũ ở Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.base_shelf', label: 'Kệ đồ ở Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
  ],
  cameras: [
    { id: 'cam.d0901.newspaper', marker: 'cam.thcs.m2_newspaper', fov: 45 },
  ],
  album_page_id: 'page.d.g09.01',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m2_main_07',
    type: 'main',
    scope: 'm2',
    memory_day_id: 'd.g09.01',
    title: 'Tờ báo tường cuối cùng',
    blocks_main: true,
    steps: [
      // ---------- CẢNH A · Khảo sát nguyện vọng và Sudoku (dòng 641–655) ----------
      {
        id: 'q_m2_main_07.s01',
        kind: 'cutscene',
        objective: 'Cô Diệp phát phiếu khảo sát nguyện vọng đầu năm lớp 9',
        lines: [
          { speaker: 'npc_diep', text: 'Đồ chơi dính này để ngoài lớp nghen.' },
        ],
      },
      {
        id: 'q_m2_main_07.s02',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Hỏi nguyện vọng của Châu',
        lines: [
          { speaker: 'NPC_B', text: 'Trường Chuyên. Không phải "muốn". Là "phải".' },
        ],
      },
      {
        id: 'q_m2_main_07.s03',
        kind: 'talk',
        with: 'NPC_D',
        objective: 'Hỏi nguyện vọng của Quân',
        lines: [
          { speaker: 'NPC_D', text: 'Tớ… trường gần chợ thôi. Điểm tớ vậy là vừa.' },
        ],
      },
      {
        id: 'q_m2_main_07.s04',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Hỏi nguyện vọng của Đức',
        lines: [
          { speaker: 'NPC_A', text: 'Năng khiếu! Tao vẽ, tao diễn, tao—' },
          { speaker: 'NPC_A', text: '…mà nhà tao đang tính chuyện gì đó, chưa biết. Thôi, cả đám cùng thi một trường đi!' },
        ],
      },
      {
        id: 'q_m2_main_07.s05',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Hỏi nguyện vọng của Hạ',
        lines: [
          { speaker: 'NPC_C', text: 'Trường công gần nhà. Có cây phượng thì tốt.' },
        ],
      },
      {
        id: 'q_m2_main_07.s06',
        kind: 'choice',
        choice_id: 'c_m2_07_aspiration',
        objective: 'Điền lý do chọn trường vào phiếu nguyện vọng',
        prompt: {
          speaker: 'player',
          text: 'Điền lý do chọn trường vào phiếu nguyện vọng:',
        },
        options: [
          { id: 'near_home', tone: 'gentle', text: 'Gần nhà.' },
          { id: 'parents', tone: 'deep', text: 'Ba mẹ muốn vậy.' },
          { id: 'random', tone: 'playful', text: 'Chưa biết, ghi đại.' },
        ],
      },
      {
        id: 'q_m2_main_07.s07',
        kind: 'interact',
        target: 'itr.thcs.blackboard',
        objective: 'Nộp phiếu khảo sát nguyện vọng cho cô Diệp',
        lines: [
          { speaker: 'NPC_C', text: 'Ủa… vậy mình chung.' },
        ],
      },
      {
        id: 'q_m2_main_07.s08',
        kind: 'minigame',
        game: 'mg_sudoku',
        level: 'min',
        objective: 'Giải đề ôn tập Sudoku của Châu',
      },

      // ---------- CẢNH B · Làm báo tường và cãi nhau (dòng 656–674) ----------
      {
        id: 'q_m2_main_07.s09',
        kind: 'interact',
        target: 'itr.thcs.wall_news',
        objective: 'Cùng cả nhóm chuẩn bị phần Trang kỷ niệm cho tờ báo tường',
      },
      {
        id: 'q_m2_main_07.s10',
        kind: 'cutscene',
        objective: 'Cả nhóm tranh luận gay gắt về chuyện chọn trường',
        lines: [
          { speaker: 'NPC_A', text: "Tiêu đề: 'Một trường, năm đứa'!" },
          { speaker: 'NPC_A', text: 'Ê, nghe tao nè— cả đám cùng thi một trường đi, khỏi xa nhau luôn.' },
          { speaker: 'NPC_D', text: 'Tớ… không đủ điểm đâu.' },
          { speaker: 'NPC_A', text: 'Hai đứa mày chung trường rồi, sướng ha. Còn tụi tao?' },
          { speaker: 'NPC_B', text: 'Ông nghĩ ai cũng được chọn hả? Tui đâu có lựa chọn nào khác!' },
          { speaker: 'NPC_A', text: 'Vậy… khác trường là hết bạn luôn hả?' },
          { speaker: 'NPC_C', text: 'Châu nói vậy với Đức là không được đâu… Đức nói vậy với Châu cũng không được.' },
        ],
      },
      {
        id: 'q_m2_main_07.s11',
        kind: 'choice',
        choice_id: 'c_m2_07_truth',
        measured: true,
        about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        objective: 'Lựa chọn phản ứng trước cuộc tranh cãi của nhóm',
        prompt: {
          speaker: 'NPC_C',
          text: 'Châu nói vậy với Đức là không được đâu… Đức nói vậy với Châu cũng không được.',
        },
        options: [
          {
            id: 'silence',
            tone: 'gentle',
            text: 'Im lặng, đưa chổi cho Quân quét giấy vụn',
            set_flags: { 'm2.newspaper_truth': false },
          },
          {
            id: 'speak_truth',
            tone: 'deep',
            text: 'Mình cũng sợ… sợ mất mọi người.',
            set_flags: { 'm2.newspaper_truth': true },
          },
        ],
      },

      // ---------- CẢNH C · Châu ở Căn cứ và hoàn thành báo tường (dòng 675–701) ----------
      {
        id: 'q_m2_main_07.s12',
        kind: 'goto',
        target: 'itr.thcs.old_table',
        objective: 'Đi tìm Châu ở Căn cứ bí mật sau giờ trả bài kiểm tra',
      },
      {
        id: 'q_m2_main_07.s13',
        kind: 'choice',
        choice_id: 'c_m2_07_comfort',
        objective: 'Lựa chọn cách an ủi Châu khi bị điểm thấp',
        prompt: {
          speaker: 'player',
          text: 'Châu ngồi lặng lẽ một mình ở Căn cứ…',
        },
        options: [
          { id: 'tissue', tone: 'gentle', text: 'Ngồi im, đưa khăn giấy' },
          { id: 'ask_ok', tone: 'playful', text: 'Bà ổn không?' },
          { id: 'score_not_you', tone: 'deep', text: 'Điểm số đâu phải là bà.' },
        ],
      },
      {
        id: 'q_m2_main_07.s14',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Lắng nghe Châu và nhận giữ cây bút highlight vàng',
        lines: [
          { speaker: 'NPC_B', text: 'Tui ngồi năm phút thôi. {g:ông|bà} đừng hỏi gì hết nha.' },
          { speaker: 'NPC_B', text: 'Ba mẹ tui chưa biết điểm này.' },
          { speaker: 'NPC_B', text: 'Cầm giùm tui. Tui cầm nó là lại muốn tô.' },
          { speaker: 'NPC_B', text: 'Cảm ơn. Đừng kể ai nghen.' },
        ],
      },
      {
        id: 'q_m2_main_07.s15',
        kind: 'interact',
        target: 'itr.thcs.wall_news',
        objective: 'Ghép các phần và treo báo tường lên bảng tin lớp học',
        lines: [
          { speaker: 'NPC_A', text: 'Hôm nay không có chuyện cười.' },
          { speaker: 'NPC_C', text: 'Để lại chỗ này… lúc nào đó mình điền nha.' },
          { speaker: 'NPC_D', text: 'Ừ. Để dành.' },
          { speaker: 'NPC_B', text: 'Ô trống là lỗi bố cục. Nhưng… tui không xóa.' },
        ],
      },
      {
        id: 'q_m2_main_07.s16',
        kind: 'photo',
        mode: 'handheld',
        camera_id: 'cam.d0901.newspaper',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g09.01.01',
        stand_zone: { marker: 'spot.thcs.class_front', radius: 1.5 },
        objective: 'Chụp ảnh tờ báo tường kỷ niệm cuối cùng của năm đứa',
      },
      {
        id: 'q_m2_main_07.s17',
        kind: 'interact',
        target: 'itr.thcs.wall_news',
        objective: 'Chép lại bố cục báo tường vào tờ giấy A5 và gấp đôi kẹp vào sổ',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m2_03',
  name: 'Bản báo tường thu nhỏ A5',
  description: 'Bản báo tường thu nhỏ khổ A5 chép tay, gấp đôi; góc dưới có một ô, trong ô mấy vệt sáp màu đã nhòe.',
  school_year_id: 'g09',
  hook_2026: 'Ô này… sao lem màu vầy ta? Hồi đó tụi mình định dán gì vô?',
  appear_when: { day: 'd.g08.02' },
  target_memory_day_id: 'd.g09.01',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g09.01.01', 'frag.d.g09.01.02', 'frag.d.g09.01.03'],
  album_entry_ids: ['alb.d.g09.01.01', 'alb.d.g09.01.02', 'alb.d.g09.01.03', 'alb.d.g09.01.04'],
  shape: 'paper',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g09.01.01', memory_day_id: 'd.g09.01', kind: 'photo', source_quest_id: 'q_m2_main_07', media_spec: 'A' },
  { id: 'frag.d.g09.01.02', memory_day_id: 'd.g09.01', kind: 'note', source_quest_id: 'q_m2_main_07', text: 'Tờ báo tường cuối cùng của cấp hai: một ô trống để dành và cây bút highlight gửi lại.' },
  { id: 'frag.d.g09.01.03', memory_day_id: 'd.g09.01', kind: 'artifact' },
  { id: 'frag.d.g09.01.04', memory_day_id: 'd.g09.01', kind: 'sticker', source_quest_id: 'q_m2_main_07', text: 'Cây bút highlight vàng của Châu' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g09.01.01', page_id: 'page.d.g09.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g09.01.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0901.newspaper', at_step_id: 'q_m2_main_07.s16' }, replayable: true },
  { id: 'alb.d.g09.01.02', page_id: 'page.d.g09.01', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g09.01.02', source: 'text', required_for_restore: true },
  { id: 'alb.d.g09.01.03', page_id: 'page.d.g09.01', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g09.01.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g09.01.04', page_id: 'page.d.g09.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g09.01.04', source: 'sticker_art', required_for_restore: false },
];
