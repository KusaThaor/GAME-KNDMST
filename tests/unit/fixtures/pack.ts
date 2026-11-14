import type { ContentConfig, ContentPack } from '../../../src/content/types';

/** Gói nội dung nhỏ nhất hợp lệ để test engine (1 Mốc, 2 Ngày, đủ loại quest). Mỗi lần gọi trả bản mới. */
export function makePack(): ContentPack {
  const P = '[PLACEHOLDER]';
  return {
    characters: [
      { id: 'chr_player', display_name: '{player_name}', age_variants: { AGE_G6_7: { rig_id: 'player1' } } },
      { id: 'chr_duc', display_name: 'Đức', age_variants: { AGE_G6_7: { rig_id: 'duc' } } },
      { id: 'chr_chau', display_name: 'Minh Châu', age_variants: { AGE_G6_7: { rig_id: 'chau' } } },
      { id: 'chr_ha', display_name: 'Hạ', age_variants: { AGE_G6_7: { rig_id: 'ha' } } },
      { id: 'chr_quan', display_name: 'Quân', age_variants: { AGE_G6_7: { rig_id: 'quan' } } },
    ],
    milestones: [{ id: 'm1', title: `${P} Mốc 1`, school_years: ['g06', 'g07'], box_compartment: 1 }],
    school_years: [
      { id: 'g06', milestone_id: 'm1', start_year: 2014, end_year: 2015, age_range: [11, 12], age_variant: 'AGE_G6_7', group_members: ['player', 'NPC_A', 'NPC_B'], map_variant: 'g06' },
      { id: 'g07', milestone_id: 'm1', start_year: 2015, end_year: 2016, age_range: [12, 13], age_variant: 'AGE_G6_7', group_members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'], map_variant: 'g07' },
    ],
    maps: [{
      id: 'map_thcs',
      zones: [{ zone_id: 'zone.thcs.yard', name: 'Sân trường' }],
      variants: [
        { variant_id: 'g06', decor_set: 'g06', lighting_preset: 'morning_sun' },
        { variant_id: 'g07', decor_set: 'g07', lighting_preset: 'late_afternoon' },
      ],
      spawn_points: [{ id: 'spawn.yard', position: [0, 6] }],
    }],
    chapters: [{ id: 'ch_g06', label: `${P} Chương lớp 6`, memory_day_ids: ['d.g06.01'] }, { id: 'ch_g07', label: `${P} Chương lớp 7`, memory_day_ids: ['d.g07.03'] }],
    days: [
      {
        id: 'd.g06.01', title: `${P} Ngày 1`, school_year_id: 'g06', map_id: 'map_thcs', map_variant: 'g06',
        anchor_artifact_id: 'art_m1_01', main_chain: ['q_m1_main_01'], side_quests: ['q_m1_side_01'], daily_pool: ['q_m1_daily_01'],
        npc_placements: [{ actor: 'NPC_A', position: [1, 1] }, { actor: 'NPC_B', position: [2, 1] }],
        interactables: [
          { id: 'itr.thcs.desk', label: `${P} bàn`, position: [0, 0], kind: 'object' },
          { id: 'itr.thcs.board', label: `${P} bảng`, position: [3, 0], kind: 'object' },
          { id: 'itr.thcs.tree', label: `${P} gốc cây`, position: [4, 4], kind: 'marker' },
        ],
        cameras: [{ id: 'cam.d0601.desk', position: [0, 2, 4], look_at: [0, 1, 0] }],
        album_page_id: 'page.d.g06.01', completion: 'main_chain',
      },
      {
        id: 'd.g07.03', title: `${P} Ngày 2`, school_year_id: 'g07', map_id: 'map_thcs', map_variant: 'g07',
        anchor_artifact_id: 'art_m1_05', main_chain: ['q_m1_main_05'], side_quests: [], daily_pool: ['q_m1_daily_01'],
        npc_placements: [{ actor: 'NPC_A', position: [1, 1] }, { actor: 'NPC_B', position: [2, 1] }, { actor: 'NPC_C', position: [3, 1] }, { actor: 'NPC_D', position: [4, 1] }],
        interactables: [
          { id: 'itr.thcs.board', label: `${P} bảng`, position: [3, 0], kind: 'object' },
          { id: 'itr.thcs.tripod', label: `${P} chỗ đặt máy`, position: [0, 5], kind: 'object' },
        ],
        cameras: [{ id: 'cam.d0703.group', position: [0, 1.4, 6], look_at: [2, 1, 1] }],
        album_page_id: 'page.d.g07.03', completion: 'main_chain',
      },
    ],
    quests: [
      {
        id: 'q_m1_main_01', type: 'main', scope: 'm1', memory_day_id: 'd.g06.01', title: `${P} Main 1`, owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1', blocks_main: true,
        steps: [
          { id: 'q_m1_main_01.s01', kind: 'talk', with: 'NPC_A', lines: [{ speaker: 'NPC_A', text: `${P} chào {player_name}` }] },
          { id: 'q_m1_main_01.s02', kind: 'choice', choice_id: 'c_m1_01', about: ['NPC_A'], measured: true, options: [
            { id: 'a', tone: 'playful', text: `${P} A`, set_flags: { 'm1.greet': 'playful' } },
            { id: 'b', tone: 'gentle', text: `${P} B`, set_flags: { 'm1.greet': 'gentle' } },
            { id: 'c', tone: 'curious', text: `${P} C`, set_flags: { 'm1.greet': 'curious' } },
          ] },
          { id: 'q_m1_main_01.s03', kind: 'interact', target: 'itr.thcs.desk' },
        ],
      },
      {
        id: 'q_m1_side_01', type: 'side', scope: 'm1', memory_day_id: 'd.g06.01', title: `${P} Side 1`, owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1', blocks_main: false,
        rewards: { album_entry_ids: ['alb.d.g06.01.04'] },
        steps: [
          { id: 'q_m1_side_01.s01', kind: 'talk', with: 'NPC_B', lines: [{ speaker: 'NPC_B', text: `${P} nhờ chút` }] },
          { id: 'q_m1_side_01.s02', kind: 'goto', target: 'itr.thcs.tree' },
        ],
      },
      {
        id: 'q_m1_daily_01', type: 'daily', scope: 'm1', title: `${P} Daily 1`, owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1', blocks_main: false,
        steps: [{ id: 'q_m1_daily_01.s01', kind: 'interact', target: 'itr.thcs.board' }],
      },
      {
        id: 'q_m1_main_05', type: 'main', scope: 'm1', memory_day_id: 'd.g07.03', title: `${P} Main 5`, owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1', blocks_main: true,
        steps: [
          { id: 'q_m1_main_05.s01', kind: 'interact', target: 'itr.thcs.tripod' },
          { id: 'q_m1_main_05.s02', kind: 'photo', mode: 'timer', camera_id: 'cam.d0703.group', subjects: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'], album_entry_id: 'alb.d.g07.03.01', stand_zone: { center: [2.5, 2], radius: 1.2 } },
        ],
      },
      {
        id: 'q_hub_pd_01', type: 'pd', scope: 'hub', title: `${P} Mở thùng đồ cũ`, owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1', blocks_main: false,
        steps: [
          { id: 'q_hub_pd_01.s01', kind: 'cutscene', lines: [{ speaker: 'narrator', text: `${P} lời dẫn` }] },
          { id: 'q_hub_pd_01.s02', kind: 'interact', target: 'itr.hub.memory_box' },
        ],
      },
      {
        id: 'q_hub_pd_02', type: 'pd', scope: 'hub', title: `${P} Tìm lại nhóm chat`, owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1', blocks_main: false,
        available_when: { flag: 'hub.contact_m1' },
        steps: [
          { id: 'q_hub_pd_02.s01', kind: 'phone_ui', screen: 'group_chat', thread_id: 'thread.group' },
          { id: 'q_hub_pd_02.s02', kind: 'compose_message', thread_id: 'thread.group', openers: [
            { id: 'a', tone: 'playful', text: `${P} mở lời A` }, { id: 'b', tone: 'gentle', text: `${P} mở lời B` }, { id: 'c', tone: 'curious', text: `${P} mở lời C` },
          ] },
        ],
      },
    ],
    artifacts: [
      { id: 'art_m1_01', name: `${P} mẩu giấy`, school_year_id: 'g06', hook_2026: `${P} hook`, appear_when: { quest: 'q_hub_pd_01' }, target_memory_day_id: 'd.g06.01', complete_when: 'day_completed', reward_fragment_ids: ['frag.d.g06.01.01'], album_entry_ids: ['alb.d.g06.01.01'], shape: 'paper' },
      { id: 'art_m1_05', name: `${P} tấm ảnh`, school_year_id: 'g07', hook_2026: `${P} hook`, appear_when: { day: 'd.g06.01' }, target_memory_day_id: 'd.g07.03', complete_when: 'day_completed', reward_fragment_ids: ['frag.d.g07.03.01'], album_entry_ids: ['alb.d.g07.03.01'], shape: 'photo' },
    ],
    fragments: [
      { id: 'frag.d.g06.01.01', memory_day_id: 'd.g06.01', kind: 'photo', media_spec: 'B' },
      { id: 'frag.d.g06.01.02', memory_day_id: 'd.g06.01', kind: 'note', text: `${P} ghi chú của {player_name}` },
      { id: 'frag.d.g06.01.03', memory_day_id: 'd.g06.01', kind: 'artifact' },
      { id: 'frag.d.g06.01.04', memory_day_id: 'd.g06.01', kind: 'sticker', source_quest_id: 'q_m1_side_01' },
      { id: 'frag.d.g07.03.01', memory_day_id: 'd.g07.03', kind: 'photo', media_spec: 'A' },
      { id: 'frag.d.g07.03.02', memory_day_id: 'd.g07.03', kind: 'back_note', text: `${P} mặt sau` },
    ],
    album_entries: [
      { id: 'alb.d.g06.01.01', page_id: 'page.d.g06.01', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g06.01.01', source: 'auto_snapshot', required_for_restore: true, snapshot: { camera_id: 'cam.d0601.desk', at_step_id: 'q_m1_main_01.s03' } },
      { id: 'alb.d.g06.01.02', page_id: 'page.d.g06.01', slot_type: 'note', slot_index: 1, fragment_id: 'frag.d.g06.01.02', source: 'text', required_for_restore: true },
      { id: 'alb.d.g06.01.03', page_id: 'page.d.g06.01', slot_type: 'artifact', slot_index: 2, fragment_id: 'frag.d.g06.01.03', source: 'sticker_art', required_for_restore: true },
      { id: 'alb.d.g06.01.04', page_id: 'page.d.g06.01', slot_type: 'sticker', slot_index: 3, fragment_id: 'frag.d.g06.01.04', source: 'sticker_art', required_for_restore: false, unlock_quest_id: 'q_m1_side_01', replayable: true },
      { id: 'alb.d.g07.03.01', page_id: 'page.d.g07.03', slot_type: 'main_photo', slot_index: 0, fragment_id: 'frag.d.g07.03.01', source: 'gameplay_photo', required_for_restore: true, snapshot: { camera_id: 'cam.d0703.group', at_step_id: 'q_m1_main_05.s02' }, replayable: true },
      { id: 'alb.d.g07.03.02', page_id: 'page.d.g07.03', slot_type: 'back_note', slot_index: 1, fragment_id: 'frag.d.g07.03.02', source: 'text', required_for_restore: false },
    ],
    pdes: [
      { id: 'pde_01', type: 'RESTORE', trigger: { day: 'd.g06.01' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g06.01' }], once: true },
      { id: 'pde_02', type: 'SHELF', trigger: { day: 'd.g06.01' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_01' }], once: true },
      { id: 'pde_03', type: 'FRAGMENT', trigger: { quest: 'q_m1_side_01' }, effects: [{ kind: 'add_fragment', album_entry_id: 'alb.d.g06.01.04' }], once: true },
      { id: 'pde_04', type: 'RESTORE', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'restore_page', page_id: 'page.d.g07.03' }], once: true },
      { id: 'pde_05', type: 'SHELF', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'shelf_artifact', artifact_id: 'art_m1_05' }], once: true },
      { id: 'pde_06', type: 'CONTACT', trigger: { day: 'd.g07.03' }, effects: [{ kind: 'unlock_quest', quest_id: 'q_hub_pd_02' }], once: true },
      { id: 'pde_07', type: 'REPLY', trigger: { all: [{ quest: 'q_hub_pd_02' }, { flag: 'hub.reply_due' }] }, effects: [{ kind: 'message', thread_id: 'thread.group', lines: [{ speaker: 'NPC_A', text: `${P} trả lời` }] }], once: true },
    ],
    endings: [],
    hub: {
      intro_quest_id: 'q_hub_pd_01',
      interactables: [
        { id: 'itr.hub.memory_box', label: 'Hộp Kỷ Vật', position: [0, 0], kind: 'object' },
        { id: 'itr.hub.album', label: 'Album', position: [1, 0], kind: 'object' },
        { id: 'itr.hub.shelf', label: 'Kệ', position: [2, 0], kind: 'object' },
        { id: 'itr.hub.phone', label: 'Điện thoại', position: [3, 0], kind: 'object' },
      ],
      threads: [{ id: 'thread.group', title: `${P} nhóm chat cũ`, members: ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'], history: [{ speaker: 'NPC_A', text: `${P} tin cũ` }] }],
      demo_end_lines: [{ speaker: 'narrator', text: `${P} Tin nhắn đã gửi… (còn tiếp)` }],
    },
  };
}

export function makeConfig(over: Partial<ContentConfig> = {}): ContentConfig {
  return {
    cast: { NPC_A: 'chr_duc', NPC_B: 'chr_chau', NPC_C: 'chr_ha', NPC_D: 'chr_quan' },
    release: { memory_day_ids: ['d.g06.01', 'd.g07.03'], end_day_id: 'd.g07.03', end_step_id: 'q_hub_pd_02.s02' },
    environment: 'test',
    ...over,
  };
}
