/**
 * Hub 2026 — Phòng trọ: mở đầu và kết thúc demo Mốc 1 (Lớp 6–7).
 * Kịch bản nguồn: KICH_BAN_DEMO_M1_M2_v1.md v1.4 & 01_NARRATIVE_AND_SCENES.md
 */
import type { HubContent, PresentDayEvent, Quest } from './types';

const meta = { owner: 'NARRATIVE_APPROVED', ownership_label: 'HUMAN_CANON', status: 'SPEC_READY', version: 'v1.4', type: 'pd', scope: 'hub', blocks_main: false } as const;

export const HUB: HubContent = {
  intro_quest_id: 'q_hub_pd_01',
  interactables: [
    { id: 'itr.hub.memory_box', label: 'Hộp Kỷ Vật', position: [-0.9, 0.6], kind: 'object' },
    { id: 'itr.hub.album', label: 'Album', position: [0.5, 0.9], kind: 'object' },
    { id: 'itr.hub.shelf', label: 'Kệ', position: [2.2, -1.6], kind: 'object' },
    { id: 'itr.hub.phone', label: 'Điện thoại', position: [1.5, 0.8], kind: 'object' },
  ],
  threads: [{
    id: 'thread.old_group',
    title: 'Căn cứ Bí mật',
    members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'],
    history: [
      { speaker: 'NPC_A', text: 'Đứa nào rảnh thì cuối tuần ra Căn cứ nghen!' },
      { speaker: 'NPC_B', text: 'Lo học bài đi ông tướng. Tuần sau kiểm tra đó.' },
      { speaker: 'NPC_D', text: 'Tớ mới bơm lại quả bóng rổ nè.' },
      { speaker: 'NPC_C', text: 'Hạ vừa ép xong một lá phượng đẹp lắm.' },
    ],
  }],
  demo_end_lines: [
    { speaker: 'narrator', text: 'Tin nhắn đã gửi.' },
    { speaker: 'narrator', text: 'Cảm ơn bạn đã trải nghiệm Bản Demo "Hành Trình Thanh Xuân"!' },
  ],
};

export const HUB_QUESTS: Quest[] = [
  {
    ...meta,
    id: 'q_hub_pd_01',
    title: 'Mở chiếc thùng carton cũ',
    steps: [
      {
        id: 'q_hub_pd_01.s01',
        kind: 'cutscene',
        lines: [
          { speaker: 'narrator', text: 'Phòng trọ năm 2026. Buổi tối, ánh đèn bàn hắt lên một góc phòng.' },
          { speaker: 'narrator', text: 'Trên sàn có một thùng carton cũ dán băng keo vàng: "Đồ cũ – đừng vứt."' },
          { speaker: 'player', text: 'Mật lệnh này… ai viết mà nhìn chẳng hiểu gì hết vậy?' },
          { speaker: 'player', text: 'Không biết ngày đó tụi mình bắt đầu chơi với nhau từ lúc nào nhỉ?' },
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
        openers: [
          { id: 'playful', tone: 'playful', text: 'Ê. Nhớ hồi tụi mình mới đủ năm đứa không? Lâu quá rồi ha.' },
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
