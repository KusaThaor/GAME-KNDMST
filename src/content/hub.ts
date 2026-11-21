/**
 * Hub 2026 — nội dung GIẢ để chạy khung: quest mở đầu, quest liên lạc, Present-day Event.
 * Mọi chữ là [PLACEHOLDER]; hoàn cảnh 2026 thật do nhóm viết (HUMAN_CANON).
 */
import type { HubContent, PresentDayEvent, Quest } from './types';

const P = '[PLACEHOLDER]';
const meta = { owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1', type: 'pd', scope: 'hub', blocks_main: false } as const;

export const HUB: HubContent = {
  intro_quest_id: 'q_hub_pd_01',
  interactables: [
    { id: 'itr.hub.memory_box', label: 'Hộp Kỷ Vật', position: [-0.9, 0.6], kind: 'object' },
    { id: 'itr.hub.album', label: 'Album', position: [0.5, 0.9], kind: 'object' },
    { id: 'itr.hub.shelf', label: 'Kệ', position: [2.2, -1.6], kind: 'object' },
    { id: 'itr.hub.phone', label: 'Điện thoại', position: [1.5, 0.8], kind: 'object' },
  ],
  threads: [{
    id: 'thread.old_group', title: `${P} Nhóm chat cũ`, members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
    history: [
      { speaker: 'NPC_A', text: `${P} Tin nhắn cũ của NPC_A.` },
      { speaker: 'NPC_C', text: `${P} Tin nhắn cũ của NPC_C.` },
    ],
  }],
  demo_end_lines: [{ speaker: 'narrator', text: `${P} Tin nhắn đã gửi… (còn tiếp)` }],
};

export const HUB_QUESTS: Quest[] = [
  {
    ...meta, id: 'q_hub_pd_01', title: `${P} Quest mở đầu ở Hub`,
    steps: [
      { id: 'q_hub_pd_01.s01', kind: 'cutscene', lines: [
        { speaker: 'narrator', text: `${P} Lời dẫn mở đầu, dòng 1.` },
        { speaker: 'narrator', text: `${P} Lời dẫn mở đầu, dòng 2.` },
      ] },
      { id: 'q_hub_pd_01.s02', kind: 'interact', target: 'itr.hub.memory_box', objective: `${P} Mở Hộp Kỷ Vật` },
    ],
  },
  {
    ...meta, id: 'q_hub_pd_02', title: `${P} Tìm lại nhóm chat cũ`,
    steps: [{ id: 'q_hub_pd_02.s01', kind: 'phone_ui', screen: 'group_chat', thread_id: 'thread.old_group', objective: `${P} Mở điện thoại, tìm nhóm chat cũ` }],
  },
  {
    ...meta, id: 'q_hub_pd_03', title: `${P} Soạn tin nhắn`, available_when: { quest: 'q_hub_pd_02' },
    steps: [{ id: 'q_hub_pd_03.s01', kind: 'compose_message', thread_id: 'thread.old_group', objective: `${P} Soạn và gửi một tin`, openers: [
      { id: 'playful', tone: 'playful', text: `${P} Cách mở lời 1 (rộn ràng)` },
      { id: 'gentle', tone: 'gentle', text: `${P} Cách mở lời 2 (ấm áp)` },
      { id: 'deep', tone: 'deep', text: `${P} Cách mở lời 3 (sâu lắng)` },
    ] }],
  },
];

/** Đủ 5 loại đang dùng: RESTORE, SHELF, FRAGMENT, CONTACT (REPLY có trong bộ chạy, chưa có nội dung; REUNION để trống). */
export const PDES: PresentDayEvent[] = [
  { id: 'pde_01', type: 'RESTORE', trigger: { day: 'd.g06.01' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g06.01' }], once: true },
  { id: 'pde_02', type: 'SHELF', trigger: { day: 'd.g06.01' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_01' }], once: true },
  { id: 'pde_03', type: 'FRAGMENT', trigger: { quest: 'q_m1_side_01' }, effects: [{ kind: 'add_fragment', album_entry_id: 'alb.d.g06.01.04', recall: [{ speaker: 'narrator', text: `${P} 1–2 câu hồi tưởng khi mảnh mới hiện ra.` }] }], once: true },
  { id: 'pde_04', type: 'RESTORE', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g07.03' }], once: true },
  { id: 'pde_05', type: 'SHELF', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_05' }], once: true },
  { id: 'pde_06', type: 'CONTACT', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'unlock_quest', quest_id: 'q_hub_pd_02' }], once: true },
];
