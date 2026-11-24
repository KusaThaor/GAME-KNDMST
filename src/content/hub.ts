/**
 * Hub 2026 — Phòng trọ: mở đầu, chuyển Mốc, timeskip và kết demo.
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md (§MỞ ĐẦU, §Chuyển sang Mốc 2, §KẾT DEMO) & NEXT_SPRINT_TASK_BOARD.md Mục 0.2.
 *
 * Hai lớp nội dung:
 * - Lớp đang chạy (4 Trang Mốc 1): `HUB`, `HUB_QUESTS`, `PDES`. `pack.ts` dùng lớp này.
 * - Lớp Mốc 2 (9 Trang): `HUB_QUESTS_M2`, `PDES_M2`, `ART_M2_01`. Tham chiếu các Ngày d.g08.01 / d.g09.03 — chưa có trong pack
 *   cho tới khi N-15f tích hợp, nên chưa nối vào `pack.ts` (validator sẽ báo thiếu Ngày). N-15f chỉ cần đổi 3 chỗ trong pack.ts:
 *   `quests: [..., ...HUB_QUESTS_M2]`, `pdes: PDES_M2`, `artifacts: [..., ART_M2_01]`.
 *
 * Mã quest `event` ở Hub phải theo mẫu `q_hub_event_NN` (validator ID_PATTERNS.quest); mã `q_hub_pd_timeskip` trong thẻ N-08 không hợp lệ.
 */
import type { Artifact, HubContent, PresentDayEvent, Quest } from './types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4', type: 'pd', scope: 'hub', blocks_main: false } as const;

export const HUB: HubContent = {
  intro_quest_id: 'q_hub_pd_01',
  interactables: [
    { id: 'itr.hub.memory_box', label: 'Hộp Kỷ Vật', position: [-0.9, 0.6], kind: 'object' },
    { id: 'itr.hub.album', label: 'Album', position: [0.5, 0.9], kind: 'object' },
    { id: 'itr.hub.shelf', label: 'Kệ', position: [2.2, -1.6], kind: 'object' },
    { id: 'itr.hub.phone', label: 'Điện thoại', position: [1.5, 0.8], kind: 'object' },
    { id: 'itr.hub.rulebook', label: 'Sổ luật Căn cứ', position: [3.04, -2.28], kind: 'object' },
  ],
  threads: [{
    id: 'thread.old_group',
    title: 'Căn cứ Bí mật',
    members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
    // B8: nhóm chat cũ không có dòng chat nào — chỉ một dòng trạng thái (`old_chat_last_label`, config/hub.ts).
    history: [],
  }],
  // B8: "Đã gửi." → "(còn tiếp)" → ghi hoàn thành → form phản hồi. Không có câu cảm ơn.
  demo_end_lines: [
    { speaker: 'narrator', text: 'Đã gửi.' },
    { speaker: 'narrator', text: '(còn tiếp)' },
  ],
};

export const HUB_QUESTS: Quest[] = [
  {
    ...meta,
    id: 'q_hub_pd_01',
    title: 'Mở chiếc thùng carton cũ',
    steps: [
      // Lời dẫn → (form tên + ngoại hình, game.ts gắn vào cutscene đầu của quest mở đầu) → mở thùng.
      {
        id: 'q_hub_pd_01.s01',
        kind: 'cutscene',
        lines: [
          { speaker: 'narrator', text: 'Phòng trọ năm 2026. Buổi tối, ánh đèn bàn hắt lên một góc phòng.' },
          { speaker: 'narrator', text: 'Trên sàn có một thùng carton cũ dán băng keo vàng: "Đồ cũ – đừng vứt."' },
        ],
      },
      {
        id: 'q_hub_pd_01.s02',
        kind: 'interact',
        target: 'itr.hub.memory_box',
        objective: 'Mở chiếc thùng carton cũ',
      },
    ],
  },
  {
    // B10: mở thùng trước, độc thoại sau. Tách thành quest riêng để quest mở đầu hoàn tất ngay khi mở thùng.
    ...meta,
    id: 'q_hub_pd_04',
    title: 'Mở mẩu giấy gấp tư',
    available_when: { quest: 'q_hub_pd_01' },
    steps: [
      {
        id: 'q_hub_pd_04.s01',
        kind: 'cutscene',
        lines: [
          { speaker: 'player', text: 'Mật lệnh này… ai viết mà nhìn chẳng hiểu gì hết vậy?' },
          { speaker: 'player', text: 'Không biết ngày đó tụi mình bắt đầu chơi với nhau từ lúc nào nhỉ?' },
        ],
      },
    ],
  },
  {
    ...meta,
    id: 'q_hub_pd_02',
    title: 'Tìm lại nhóm chat cũ',
    steps: [
      {
        id: 'q_hub_pd_02.s01',
        kind: 'phone_ui',
        screen: 'group_chat',
        thread_id: 'thread.old_group',
        objective: 'Mở điện thoại, tìm nhóm chat cũ',
      },
    ],
  },
  {
    ...meta,
    id: 'q_hub_pd_03',
    title: 'Soạn tin nhắn gửi nhóm bạn cũ',
    available_when: { quest: 'q_hub_pd_02' },
    steps: [
      {
        id: 'q_hub_pd_03.s01',
        kind: 'compose_message',
        thread_id: 'thread.old_group',
        objective: 'Soạn và gửi một tin nhắn cho nhóm bạn',
        // B9 (nguyên văn kịch bản, §KẾT DEMO Bước 2). `{quan}`/`{duc}` = `caro.series` (mặc định 3–3) — thay bằng `fillCaroScore` (config/hub.ts).
        openers: [
          { id: 'playful', tone: 'playful', text: 'Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?' },
          { id: 'gentle', tone: 'gentle', text: 'Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?' },
          { id: 'deep', tone: 'deep', text: 'Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha.' },
        ],
      },
    ],
  },
];

export const PDES: PresentDayEvent[] = [
  { id: 'pde_01', type: 'RESTORE', trigger: { day: 'd.g06.01' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g06.01' }], once: true },
  { id: 'pde_02', type: 'SHELF', trigger: { day: 'd.g06.01' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_01' }], once: true },
  { id: 'pde_03', type: 'FRAGMENT', trigger: { quest: 'q_m1_ai_side_01' }, effects: [{ kind: 'add_fragment', album_entry_id: 'alb.d.g06.01.04', recall: [{ speaker: 'narrator', text: 'Mẩu giấy phân công trực nhật của Châu Tổng.' }] }], once: true },
  { id: 'pde_07', type: 'RESTORE', trigger: { day: 'd.g07.01' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g07.01' }], once: true },
  { id: 'pde_08', type: 'SHELF', trigger: { day: 'd.g07.01' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_02' }], once: true },
  { id: 'pde_09', type: 'RESTORE', trigger: { day: 'd.g07.02' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g07.02' }], once: true },
  { id: 'pde_10', type: 'SHELF', trigger: { day: 'd.g07.02' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_03' }], once: true },
  { id: 'pde_04', type: 'RESTORE', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g07.03' }], once: true },
  { id: 'pde_05', type: 'SHELF', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_05' }], once: true },
  { id: 'pde_06', type: 'CONTACT', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'unlock_quest', quest_id: 'q_hub_pd_02' }], once: true },
];

// ---------------------------------------------------------------------------
// Lớp Mốc 2 (bản 9 Trang) — chưa nối vào pack.ts, xem ghi chú đầu file.
// ---------------------------------------------------------------------------

/** Kỷ vật hộp phấn — dẫn vào Trang 5 (`d.g08.01`). Phần thưởng (mảnh, ô Album) do N-15a/f điền khi có dữ liệu Trang 5. */
export const ART_M2_01: Artifact = {
  id: 'art_m2_01',
  name: 'Hộp phấn giấy',
  school_year_id: 'g08',
  hook_2026: 'Dưới đáy thùng có một hộp phấn giấy đã móp.',
  appear_when: { day: 'd.g07.03' },
  target_memory_day_id: 'd.g08.01',
  complete_when: 'day_completed',
  reward_fragment_ids: [],
  album_entry_ids: [],
  shape: 'box',
};

export const HUB_QUESTS_M2: Quest[] = [
  ...HUB_QUESTS,
  {
    // Chuyển Mốc: sau Trang 4, thẻ chữ (kịch bản §Chuyển sang Mốc 2). PDE không có hiệu ứng "thẻ chữ" nên dùng quest `event` tự mở.
    ...meta,
    type: 'event',
    id: 'q_hub_event_02',
    title: 'Mấy năm sau…',
    available_when: { day: 'd.g07.03' },
    steps: [
      { id: 'q_hub_event_02.s01', kind: 'cutscene', lines: [{ speaker: 'narrator', text: 'Mấy năm sau…' }] },
    ],
  },
  {
    // D5 — timeskip (Mục 0.2). Tự mở khi Trang 9 xong; kết thúc thì nối thẳng Kết demo Bước 1 (q_hub_pd_05).
    ...meta,
    type: 'event',
    id: 'q_hub_event_01',
    title: 'Tám năm sau',
    available_when: { day: 'd.g09.03' },
    steps: [
      {
        id: 'q_hub_event_01.s01',
        kind: 'cutscene',
        lines: [
          { speaker: 'narrator', text: 'Tám năm sau.' },
          { speaker: 'player', text: 'Hồi đó tụi mình hứa mỗi tháng gặp nhau một lần…' },
          { speaker: 'player', text: 'Lần cuối cả năm đứa ngồi chung với nhau là khi nào nhỉ?' },
        ],
      },
    ],
  },
  {
    // Kết demo Bước 1 · Sổ luật. Lấy sổ xuống (interact) rồi độc thoại (cutscene): Hub không phát `lines` của bước interact.
    ...meta,
    id: 'q_hub_pd_05',
    title: 'Lấy sổ luật xuống',
    available_when: { quest: 'q_hub_event_01' },
    steps: [
      { id: 'q_hub_pd_05.s01', kind: 'interact', target: 'itr.hub.rulebook', objective: 'Lấy sổ luật xuống, lật tới trang cuối' },
      { id: 'q_hub_pd_05.s02', kind: 'cutscene', lines: [{ speaker: 'player', text: 'Được dời, không được hủy…' }] },
    ],
  },
];

/** Bản 9 Trang: Contact (mở điện thoại) chỉ tới sau Trang 9 và sau khi đã lật sổ luật (Bước 1 → Bước 2). */
export const PDES_M2: PresentDayEvent[] = PDES.map((p) => (p.id === 'pde_06'
  ? { ...p, trigger: { all: [{ day: 'd.g09.03' }, { quest: 'q_hub_pd_05' }] } }
  : p));
