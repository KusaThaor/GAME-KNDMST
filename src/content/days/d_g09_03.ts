/**
 * TRANG 9 (d.g09.03) — VẪN ĐỦ NĂM ĐỨA (Cuối lớp 9, Tháng 5/2018)
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 * Xưng hô: Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - {g:ông|bà}"; Quân xưng "cậu - tớ"; Hạ xưng tên.
 */
import type { AlbumEntry, Artifact, MemoryDay, MemoryFragment, Quest } from '../types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4' } as const;
const sideMeta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_DRAFT', status: 'SPEC_READY', version: 'v1.4' } as const;

export const day: MemoryDay = {
  id: 'd.g09.03',
  title: 'Trang 9: Vẫn đủ năm đứa',
  school_year_id: 'g09',
  map_id: 'map_thcs',
  map_variant: 'g07',
  open_zones: ['zone.thcs.yard', 'zone.thcs.base', 'zone.thcs.field', 'zone.thcs.gate', 'zone.thcs.classroom', 'zone.thcs.corridor'],
  spawn_point: 'spawn.thcs.yard',
  anchor_artifact_id: 'art_m2_05',
  main_chain: ['q_m2_main_05'],
  side_quests: ['q_m2_side_05'],
  daily_pool: ['q_m1_daily_01'],
  npc_placements: [
    { actor: 'NPC_A', marker: 'spot.thcs.yard_group_1', motion: 'idle' },
    { actor: 'NPC_B', marker: 'spot.thcs.yard_group_2', motion: 'idle' },
    { actor: 'NPC_C', marker: 'spot.thcs.yard_group_3', motion: 'idle' },
    { actor: 'NPC_D', marker: 'spot.thcs.yard_group_4', motion: 'idle' },
  ],
  interactables: [
    { id: 'itr.thcs.stone_bench', label: 'Ghế đá gốc phượng', zone_id: 'zone.thcs.yard', kind: 'object' },
    { id: 'itr.thcs.old_table', label: 'Bàn gỗ cũ ở Căn cứ', zone_id: 'zone.thcs.base', kind: 'marker' },
    { id: 'itr.thcs.marble_spot', label: 'Bãi đất chơi bi ve', zone_id: 'zone.thcs.field', kind: 'marker' },
    { id: 'itr.thcs.snack_cart', label: 'Xe quà vặt cổng trường', zone_id: 'zone.thcs.gate', kind: 'marker' },
    { id: 'itr.thcs.duty_spot', label: 'Chỗ để đồ trực nhật', zone_id: 'zone.thcs.yard', kind: 'object' },
  ],
  cameras: [
    { id: 'cam.d0903.farewell', marker: 'cam.thcs.yard_group', fov: 40 },
  ],
  album_page_id: 'page.d.g09.03',
  completion: 'main_chain',
};

export const quests: Quest[] = [
  {
    ...meta,
    id: 'q_m2_main_05',
    type: 'main',
    scope: 'm2',
    memory_day_id: 'd.g09.03',
    title: 'Vẫn đủ năm đứa',
    blocks_main: true,
    steps: [
      {
        id: 'q_m2_main_05.s01',
        kind: 'cutscene',
        objective: 'Sau lễ bế giảng lớp 9',
        lines: [
          { speaker: 'narrator', text: 'Sau lễ bế giảng. Cả khối ùa ra sân ký áo nhau, xin lưu bút.' },
          { speaker: 'narrator', text: 'Bảng đếm ngược trong lớp chỉ còn một con số nhỏ.' },
        ],
      },
      {
        id: 'q_m2_main_05.s02',
        kind: 'minigame',
        game: 'mg_sign_shirt',
        level: 'min',
        objective: 'Viết lưu bút và ký áo cùng bốn người bạn',
      },
      {
        id: 'q_m2_main_05.s03',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Gửi sổ lưu bút cho cô Diệp',
        lines: [
          { speaker: 'NPC_A', text: 'Cô ơi, cô đừng khóc nha! Con xin lỗi vụ slime!' },
          { speaker: 'narrator', text: 'Cô Diệp: "Lớp này ồn nhất cô từng dạy."' },
          { speaker: 'narrator', text: 'Cô viết vào sổ: "Cảm ơn em mấy tấm ảnh lớp. Mà tấm nào cũng thiếu em đó."' },
        ],
      },
      {
        id: 'q_m2_main_05.s04',
        kind: 'goto',
        target: 'itr.thcs.old_table',
        objective: 'Buổi chiều: Ghé Căn cứ dọn dẹp đồ đạc',
      },
      {
        id: 'q_m2_main_05.s05',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Tìm lại cuốn sổ luật và xấp ảnh kỷ niệm',
        lines: [
          { speaker: 'NPC_C', text: 'Mọi người ơi… sổ luật nè.' },
          { speaker: 'NPC_B', text: 'Điều 5 xong rồi bỏ trống luôn.' },
          { speaker: 'NPC_C', text: '{player_name} giữ nha. Người chụp thì giữ.' },
        ],
      },
      {
        id: 'q_m2_main_05.s06',
        kind: 'talk',
        with: 'NPC_A',
        objective: 'Đức chia bi ve mắt mèo và báo tin chuyển nhà',
        lines: [
          { speaker: 'NPC_A', text: 'Mỗi đứa một viên. Cầm lên nhìn qua mắt mèo thì thấy tụi mày. Tao nói thật đó.' },
          { speaker: 'NPC_A', text: 'À… vụ nhà tao. Chốt rồi. Dọn qua quận bên. Tao đổi nguyện vọng rồi, giờ mới dám nói.' },
          { speaker: 'NPC_A', text: 'Trường gần nhà mới.' },
          { speaker: 'NPC_D', text: '…Trường tớ?' },
          { speaker: 'NPC_A', text: 'Ừ. Lớp vẽ thì tối tao đi học thêm.' },
          { speaker: 'NPC_D', text: 'Vậy đi chung.' },
          { speaker: 'NPC_B', text: '…Tui không biết nói gì hết.' },
        ],
      },
      {
        id: 'q_m2_main_05.s07',
        kind: 'goto',
        target: 'itr.thcs.stone_bench',
        objective: 'Hoàng hôn: Ra ghế đá dưới gốc phượng viết Điều 6',
      },
      {
        id: 'q_m2_main_05.s08',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Các thành viên đóng góp ý cho Điều 6',
        lines: [
          { speaker: 'NPC_B', text: 'Điều 6. Gặp nhau ít nhất mỗi tháng. Được dời, không được hủy.' },
          { speaker: 'NPC_A', text: 'Thêm: đứa nào trễ thì bao trà sữa.' },
          { speaker: 'NPC_A', text: 'Thêm nữa: đứa nào học trường xa nhất phải kể chuyện lạ nhất. …Tức là mày đó, Châu.' },
          { speaker: 'NPC_B', text: 'Tui biết.' },
          { speaker: 'NPC_D', text: '…Cần bê gì thì gọi.' },
          { speaker: 'NPC_B', text: 'Sổ này {g:ông|bà} giữ. Tui mà giữ là tui sửa chính tả hoài.' },
        ],
      },
      {
        id: 'q_m2_main_05.s09',
        kind: 'minigame',
        game: 'mg_rule6',
        level: 'min',
        objective: 'Ghi chép và ký tên vào Điều 6 sổ luật',
      },
      {
        id: 'q_m2_main_05.s10',
        kind: 'choice',
        choice_id: 'c_m2_09_main_photo',
        measured: true,
        about: ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        objective: 'Chọn kiểu ảnh kỷ niệm đủ năm đứa',
        options: [
          { id: 'standard', tone: 'gentle', text: 'Tấm chuẩn nghiêm trang', set_flags: { 'm2.photo_style': 'standard' } },
          { id: 'funny', tone: 'playful', text: 'Tấm Đức làm mặt hề', set_flags: { 'm2.photo_style': 'funny' } },
          { id: 'candid', tone: 'deep', text: 'Tấm cả năm đứa cười tự nhiên không nhìn máy', set_flags: { 'm2.photo_style': 'candid' } },
        ],
      },
      {
        id: 'q_m2_main_05.s11',
        kind: 'photo',
        mode: 'timer',
        camera_id: 'cam.d0903.farewell',
        subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
        album_entry_id: 'alb.d.g09.03.01',
        stand_zone: { marker: 'spot.thcs.yard_group', radius: 1.2 },
        objective: 'Chụp bức ảnh đủ năm đứa cuối cùng dưới gốc phượng',
      },
      {
        id: 'q_m2_main_05.s12',
        kind: 'talk',
        with: 'NPC_C',
        objective: 'Mở bản báo tường A5 điền vào ô trống',
        lines: [
          { speaker: 'NPC_D', text: 'Nặng thiệt… mà được rồi.' },
          { speaker: 'NPC_A', text: 'Ê! Tao mà không vô là mất nửa tấm ảnh nghen!' },
          { speaker: 'NPC_C', text: 'Còn dư sáp nè. Ô trống đó. Giờ điền được rồi.' },
        ],
      },
      {
        id: 'q_m2_main_05.s13',
        kind: 'minigame',
        game: 'mg_fingerprint',
        level: 'min',
        objective: 'Ấn năm dấu vân tay sáp màu vào ô trống trên bản A5',
      },
      {
        id: 'q_m2_main_05.s14',
        kind: 'talk',
        with: 'NPC_B',
        objective: 'Sửa xong lỗi bố cục',
        lines: [
          { speaker: 'NPC_B', text: 'Lỗi bố cục… cuối cùng cũng sửa xong.' },
        ],
      },
      {
        id: 'q_m2_main_05.s15',
        kind: 'cutscene',
        objective: 'Cuối hè: Ba ngã rẽ ba trường cấp 3',
        lines: [
          { speaker: 'narrator', text: 'Cuối hè. Ba ngã rẽ ba ngôi trường.' },
          { speaker: 'narrator', text: 'Hạ chờ ở cổng trường công lập, {player_name} đạp xe tới cùng vào.' },
          { speaker: 'narrator', text: 'Quân chở Đức tới cổng trường bên chợ, Đức nhảy xuống vẫn kẹp cây bút sau tai.' },
          { speaker: 'narrator', text: 'Châu đứng trước trường Chuyên. Điện thoại rung tin nhắn Đức: "Tháng này hẹn ngày nào?"' },
          { speaker: 'narrator', text: 'Mỗi người chạm viên bi mắt mèo vào cột cổng trường trước khi bước vào.' },
        ],
      },
    ],
  },
  {
    ...sideMeta,
    id: 'q_m2_side_05',
    type: 'side',
    scope: 'm2',
    memory_day_id: 'd.g09.03',
    title: 'Kỷ niệm bi mắt mèo',
    blocks_main: false,
    steps: [
      {
        id: 'q_m2_side_05.s01',
        kind: 'interact',
        target: 'itr.thcs.marble_spot',
        objective: 'Ngắm nhìn viên bi ve trong nắng chiều',
        lines: [
          { speaker: 'NPC_A', text: 'Cầm lên nhìn qua mắt mèo thì thấy tụi mày. Tao nói thật đó.' },
        ],
      },
      {
        id: 'q_m2_side_05.s02',
        kind: 'goto',
        target: 'itr.thcs.snack_cart',
        objective: 'Cất viên bi vào túi áo ra về',
      },
    ],
  },
];

export const artifact: Artifact = {
  id: 'art_m2_05',
  name: 'Cuốn sổ lưu bút bìa nâu kraft',
  description: 'Cuốn sổ lưu bút bế giảng cấp 2, trang đầu có chữ ký xoay tròn của Đức và lời dặn của cô Diệp.',
  school_year_id: 'g09',
  hook_2026: 'Chữ ký của Đức… còn xoay một vòng ở cuối.',
  appear_when: { day: 'd.g09.02' },
  target_memory_day_id: 'd.g09.03',
  complete_when: 'day_completed',
  reward_fragment_ids: ['frag.d.g09.03.01', 'frag.d.g09.03.02', 'frag.d.g09.03.03'],
  album_entry_ids: ['alb.d.g09.03.01', 'alb.d.g09.03.02', 'alb.d.g09.03.03', 'alb.d.g09.03.04', 'alb.d.g09.03.05'],
  new_present_action: 'pde_20',
  shape: 'sign',
};

export const fragments: MemoryFragment[] = [
  { id: 'frag.d.g09.03.01', memory_day_id: 'd.g09.03', kind: 'photo', source_quest_id: 'q_m2_main_05', media_spec: 'A' },
  { id: 'frag.d.g09.03.02', memory_day_id: 'd.g09.03', kind: 'artifact' },
  { id: 'frag.d.g09.03.03', memory_day_id: 'd.g09.03', kind: 'back_note', text: 'Điều 6: "Gặp nhau ít nhất mỗi tháng. Được dời, không được hủy".' },
  { id: 'frag.d.g09.03.04', memory_day_id: 'd.g09.03', kind: 'sticker', text: 'Áo trắng học trò đầy chữ ký' },
  { id: 'frag.d.g09.03.05', memory_day_id: 'd.g09.03', kind: 'sticker', source_quest_id: 'q_m2_side_05', text: 'Viên bi mắt mèo trong veo' },
];

export const entries: AlbumEntry[] = [
  { id: 'alb.d.g09.03.01', page_id: 'page.d.g09.03', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g09.03.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0903.farewell', at_step_id: 'q_m2_main_05.s11' }, replayable: true },
  { id: 'alb.d.g09.03.02', page_id: 'page.d.g09.03', slot_type: 'artifact', slot_index: 1, fragment_id: 'frag.d.g09.03.02', source: 'sticker_art', required_for_restore: true },
  { id: 'alb.d.g09.03.03', page_id: 'page.d.g09.03', slot_type: 'back_note', slot_index: 2, fragment_id: 'frag.d.g09.03.03', source: 'text', required_for_restore: true },
  { id: 'alb.d.g09.03.04', page_id: 'page.d.g09.03', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g09.03.04', source: 'sticker_art', required_for_restore: false, replayable: true },
  { id: 'alb.d.g09.03.05', page_id: 'page.d.g09.03', slot_type: 'sticker', slot_index: 4, fragment_id: 'frag.d.g09.03.05', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m2_side_05', replayable: true },
];
