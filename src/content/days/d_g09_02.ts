/**
 * TRANG 8 (d.g09.02) — RÃ BĂNG (Học kỳ II lớp 9, Tháng 1–3/2018)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - {g:ông|bà}"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_DRAFT', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g09.02',
  title: 'Trang 8: Rã băng',
  school_year_id: 'g09',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.gate', 'zone.thcs.yard', 'zone.thcs.corridor', 'zone.thcs.classroom', 'zone.thcs.base', 'zone.thcs.field'],
  spawn_point: 'spawn.thcs.gate',
  anchor_artifact_id: 'art_m2_04',
  main_chain: ['q_m2_main_04'],
  side_quests: ['q_m2_side_04'],
  daily_pool: ['q_m1_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.gate_front', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.yard_bench_1', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_bench_2', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_group_1', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.grocery', label: 'Tiệm tạp hóa trước cổng', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.stone_bench', label: 'Bàn trại và ghế đá', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.snack_cart', label: 'Xe quà vặt cổng trường', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ để đồ cọc lều', zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [
    { id: 'cam.d0902.tv', marker: 'cam.thcs.yard_bench', fov: 40 },
    { id: 'cam.d0902.campfire', marker: 'cam.thcs.yard_group', fov: 40 },
  ],
  album_page_id: 'page.d.g09.02',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m2_main_04',
    type: 'main',
    scope: 'm2',
    memory_day_id: 'd.g09.02',
    title: 'Rã băng',
    blocks_main: true,
    steps: [
      {
        id: 'q_m2_main_04.s01',
        kind: 'cutscene',
        objective: 'Thứ Bảy, 27 tháng 1 năm 2018',
        lines: [
          { speaker: 'narrator', text: 'Thứ Bảy, 27 tháng 1. Bảng đếm ngược còn hơn trăm ngày.' },
          { speaker: 'narrator', text: 'Lớp 9 ôn thi sáng thứ Bảy. Tan buổi ôn, tiệm tạp hóa bật tivi xem chung kết U23.' },
          { speaker: 'narrator', text: 'Người lớn, con nít mặc áo cờ đỏ sao vàng, ghế nhựa xếp kín.' },
        ],
      },
      {
        id: 'q_m2_main_04.s02',
        kind: 'minigame',
        game: 'mg_flag_color',
        level: 'min',
        objective: 'Tô cờ đỏ sao vàng cùng Hạ',
      },
      {
        id: 'q_m2_main_04.s03',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Hạ vẽ ngôi sao lên má Quân',
        lines: [
          { speaker: 'NPC_C', text: 'Quân ngồi yên nha.' },
          { speaker: 'NPC_D', text: '…Nóng.' },
        ],
      },
      {
        id: 'q_m2_main_04.s04',
        kind: 'minigame',
        game: 'mg_chair_row',
        level: 'min',
        objective: 'Xếp năm chiếc ghế nhựa cạnh nhau',
      },
      {
        id: 'q_m2_main_04.s05',
        kind: 'minigame',
        game: 'mg_cheer_rhythm',
        level: 'min',
        objective: 'Bấm theo nhịp trống cổ vũ trận chung kết',
      },
      {
        id: 'q_m2_main_04.s06',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Cùng hòa nhịp cổ vũ',
        lines: [
          { speaker: 'NPC_A', text: 'Ê! Đội mình đá hay quá trời!' },
          { speaker: 'NPC_B', text: '…Tui không phải đang cười với ông. Tui cười với tình hình.' },
          { speaker: 'NPC_A', text: 'Ừ ừ. Tình hình đỉnh thiệt.' },
          { speaker: 'NPC_A', text: 'Thua mà sao tao muốn la quá.' },
          { speaker: 'NPC_B', text: '…Ừ. Tui cũng vậy.' },
        ],
      },
      {
        id: 'q_m2_main_04.s07',
        kind: 'photo',
        mode: 'auto',
        camera_id: 'cam.d0902.tv',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g09.02.02',
        objective: 'Nhờ chú chủ tiệm chụp một tấm ảnh trước tivi',
      },
      {
        id: 'q_m2_main_04.s08',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Xin tờ lịch ngày 27 tháng 1',
        lines: [
          { speaker: 'NPC_A', text: 'Chú ơi, cho tụi con xin tờ lịch đó nha!' },
          { speaker: 'narrator', text: 'Chú chủ tiệm: "Tháng này còn mấy bữa, lấy đi mấy đứa."' },
          { speaker: 'NPC_A', text: 'Mày giữ. Mày giữ đồ kỹ nhất.' },
        ],
      },
      {
        id: 'q_m2_main_04.s09',
        kind: 'cutscene',
        objective: 'Hội trại lớp 9 vào tháng 3',
        lines: [
          { speaker: 'narrator', text: 'Gần hai tháng sau. Cửa lớp dán băng rôn "HỘI TRẠI".' },
          { speaker: 'narrator', text: 'Hội trại lớp 9: chiều ngả sang tối, sân trường rực rỡ lều trại.' },
          { speaker: 'NPC_B', text: 'Cọc đóng ở đây. Tui vẽ sơ đồ rồi.' },
          { speaker: 'NPC_A', text: 'Sơ đồ đẹp thì đẹp, mà thêm cái cổng hình tên lửa đi!' },
          { speaker: 'NPC_C', text: 'Cổng hình lá cũng được mà?' },
          { speaker: 'NPC_D', text: 'Tớ bê cọc.' },
        ],
      },
      {
        id: 'q_m2_main_04.s10',
        kind: 'choice',
        choice_id: 'c_m2_08_camp_gate',
        measured: false,
        objective: 'Chọn kiểu cổng trại cho lớp',
        options: [
          { id: 'rocket', text: 'Cổng hình tên lửa', set_flags: { 'm2.gate': 'rocket' } },
          { id: 'leaf', text: 'Cổng hình chiếc lá', set_flags: { 'm2.gate': 'leaf' } },
          { id: 'regular', text: 'Cổng thường', set_flags: { 'm2.gate': 'regular' } },
        ],
      },
      {
        id: 'q_m2_main_04.s11',
        kind: 'interact',
        target: 'itr.thcs.stone_bench',
        objective: 'Đặt kỷ vật của mỗi người lên bàn trại',
      },
      {
        id: 'q_m2_main_04.s12',
        kind: 'choice',
        choice_id: 'c_m2_08_sit_side',
        measured: false,
        about: ['NPC_A', 'NPC_B'],
        objective: 'Chọn chỗ ngồi quanh bếp than nướng bắp',
        options: [
          { id: 'sit_duc', text: 'Ngồi cạnh Đức' },
          { id: 'sit_chau', text: 'Ngồi cạnh Châu' },
        ],
      },
      {
        id: 'q_m2_main_04.s13',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Tâm sự bên bếp than nhỏ',
        lines: [
          { speaker: 'NPC_A', text: 'Vụ báo tường… tao xin lỗi. Tao la lên vậy là tại… nhà tao tính dọn đi. Chưa biết đi đâu.' },
          { speaker: 'NPC_B', text: 'Sao không nói sớm?' },
          { speaker: 'NPC_A', text: 'Nói ra rồi lỡ nó thành thật thì sao.' },
          { speaker: 'NPC_B', text: 'Bữa đó tui nói nặng. Tuần đó điểm tui… thôi. Không phải tại ông.' },
          { speaker: 'NPC_B', text: 'Bữa đó {player_name} nói cũng sợ. Tui có nghe.', when: { flag: 'm2.player_honest', equals: true }, fallback: 'Năm đứa mình ai mà không sợ xa nhau.' },
          { speaker: 'NPC_D', text: 'Ăn đi. Còn nóng.' },
          { speaker: 'NPC_D', text: 'Mai mốt khác trường… có gì cần bê thì vẫn gọi tớ nha.' },
          { speaker: 'NPC_C', text: 'Sang năm Hạ với {player_name} chung trường. Vậy mà vẫn sợ.' },
          { speaker: 'NPC_C', text: 'Sợ hai đứa quen đi với nhau rồi… quên rủ ba người kia.' },
        ],
      },
      {
        id: 'q_m2_main_04.s14',
        kind: 'choice',
        choice_id: 'c_m2_08_campfire_reply',
        measured: false,
        objective: 'Lời đáp lại nỗi sợ của cả nhóm',
        options: [
          { id: 'busy', text: 'Mình sợ lớn lên ai cũng bận, rồi không ai rủ ai nữa.' },
          { id: 'promise', text: 'Vậy mình rủ. Tháng nào mình cũng rủ.' },
          { id: 'coal', text: '(Không nói, gắp thêm một cục than vào bếp)' },
        ],
      },
      {
        id: 'q_m2_main_04.s15',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Lời hẹn ước dưới ánh lửa trại',
        lines: [
          { speaker: 'NPC_A', text: 'Vậy… đừng quên. Dễ mà.' },
          { speaker: 'NPC_B', text: 'Không dễ. Nhưng ghi lại thì nhớ.' },
        ],
      },
      {
        id: 'q_m2_main_04.s16',
        kind: 'photo',
        mode: 'timer',
        camera_id: 'cam.d0902.campfire',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g09.02.01',
        stand_zone: { marker: 'spot.thcs.yard_group', radius: 1.2 },
        objective: 'Đặt máy ảnh lên khúc gỗ chụp tấm hình quanh lửa trại',
      },
      {
        id: 'q_m2_main_04.s17',
        kind: 'interact',
        target: 'itr.thcs.duty_spot',
        objective: 'Sáng hôm sau: Dọn dẹp cọc trại cùng Quân',
        lines: [
          { speaker: 'NPC_A', text: 'Mai tụi mình lại ra Căn cứ nghen!' },
          { speaker: 'narrator', text: 'Châu gật. Đức đi trước, vừa đi vừa xoay cây bút.' },
        ],
      },
      {
        id: 'q_m2_main_04.s18',
        kind: 'goto',
        target: 'itr.thcs.snack_cart',
        objective: 'Cùng nhau đi qua cổng trường ra về',
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m2_side_04',
    type: 'side',
    scope: 'm2',
    memory_day_id: 'd.g09.02',
    title: 'Bắp nướng Hội trại',
    blocks_main: false,
    steps: [
      {
        id: 'q_m2_side_04.s01',
        kind: 'talk',
        with: 'NPC_D',
        objective: 'Thưởng thức bắp nướng than cùng Quân',
        lines: [
          { speaker: 'NPC_D', text: 'Bắp nướng than ăn nóng mới ngọt. Cậu ăn thêm một trái không?' },
        ],
      },
      {
        id: 'q_m2_side_04.s02',
        kind: 'interact',
        target: 'itr.thcs.stone_bench',
        objective: 'Ngồi lại bên bếp than ăn bắp nướng',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m2_04',
  name: 'Tờ lịch ngày 27 tháng 1 năm 2018',
  description: 'Tờ lịch treo ở tiệm tạp hóa, chú chủ tiệm khoanh bút đỏ ngày 27 ghi CHUNG KẾT.',
  school_year_id: 'g09',
  hook_2026: 'Ngày 27… À. Cái chiều cả tiệm tạp hóa la muốn sập mái.',
  appear_when: { day: 'd.g09.01' },
  target_memory_day_id: 'd.g09.02',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g09.02.01', 'frag.d.g09.02.02', 'frag.d.g09.02.03'],
  album_entry_ids: ['alb.d.g09.02.01', 'alb.d.g09.02.02', 'alb.d.g09.02.03', 'alb.d.g09.02.04', 'alb.d.g09.02.05'],
  new_present_action: 'pde_18',
  shape: 'paper',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g09.02.01', memory_day_id: 'd.g09.02', kind: 'photo', source_quest_id: 'q_m2_main_04', media_spec: 'A' },
  { id: 'frag.d.g09.02.02', memory_day_id: 'd.g09.02', kind: 'photo', source_quest_id: 'q_m2_main_04', media_spec: 'B' },
  { id: 'frag.d.g09.02.03', memory_day_id: 'd.g09.02', kind: 'artifact' },
  { id: 'frag.d.g09.02.04', memory_day_id: 'd.g09.02', kind: 'sticker', text: 'Lá cờ giấy tô sáp màu cổ vũ' },
  { id: 'frag.d.g09.02.05', memory_day_id: 'd.g09.02', kind: 'sticker', source_quest_id: 'q_m2_side_04', text: 'Bắp nướng bếp than Hội trại' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g09.02.01', page_id: 'page.d.g09.02', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g09.02.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0902.campfire', at_step_id: 'q_m2_main_04.s16' }, replayable: true },
  { id: 'alb.d.g09.02.02', page_id: 'page.d.g09.02', slot_type: 'free_photo', slot_index: 1, fragment_id: 'frag.d.g09.02.02', source: 'auto_snapshot', required_for_restore: false, snapshot: { camera_id: 'cam.d0902.tv', at_step_id: 'q_m2_main_04.s07' }, replayable: true },
  { id: 'alb.d.g09.02.03', page_id: 'page.d.g09.02', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g09.02.03', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g09.02.04', page_id: 'page.d.g09.02', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g09.02.04', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g09.02.05', page_id: 'page.d.g09.02', slot_type: 'sticker', slot_index: 4, fragment_id: 'frag.d.g09.02.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m2_side_04', replayable: true },
];
