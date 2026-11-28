/**
 * Kiểu dữ liệu nội dung (content-as-code) — 14 thực thể của GDD_MASTER_v1_DRAFT §8.3.
 * Engine chỉ đọc dữ liệu theo các kiểu này; đổi nội dung = đổi file trong src/content, không sửa engine.
 * ID theo FRAMEWORK_IMPLEMENTATION_HANDOFF_v1 §6 (validator kiểm trong `npm test`).
 */

export type MilestoneId = 'm1' | 'm2' | 'm3';
export type QuestScope = MilestoneId | 'hub';
export type QuestType = 'main' | 'side' | 'daily' | 'event' | 'pd';
export type Tone = 'playful' | 'gentle' | 'deep';
export type Gender = 'male' | 'female';
export type AgeVariant = 'AGE_G6_7' | 'AGE_G8_9' | 'AGE_G10_12' | 'ADULT_2026';
export type FlagValue = string | number | boolean;

/** Vai tạm cho tới khi chốt D-01. Nội dung chỉ dùng vai; `content/cast.ts` ánh xạ vai → `chr_*`. */
export const CAST_ROLES = ['NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'] as const;
export type CastRole = (typeof CAST_ROLES)[number];
/** 'player' | vai tạm | `chr_*` | `npc_*` */
export type ActorRef = string;

export type OwnershipLabel = 'HUMAN_CANON' | 'HUMAN_DRAFT' | 'AI_ASSISTED' | 'AI_PROPOSED';
export type ContentStatus =
  | 'IDEA' | 'DRAFT' | 'IN_REVIEW' | 'NARRATIVE_APPROVED' | 'SPEC_READY' | 'READY_FOR_IMPLEMENTATION'
  | 'IMPLEMENTED' | 'VERIFIED' | 'ON_HOLD' | 'CUT' | 'DEPRECATED';

/** Điều kiện: all / any / flag / quest (đã xong) / day (Ngày đã xong). */
export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { flag: string; equals?: FlagValue }
  | { quest: string }
  | { day: string }
  | { always: true };

// ---------- Hội thoại ----------
export interface DialogueLine {
  speaker: ActorRef | 'narrator';
  /** Có thể chứa `{player_name}` và `{g:<khi nam>|<khi nữ>}`. */
  text: string;
  /** Dòng có điều kiện (callback). Khi điều kiện không đạt → dùng `fallback`; fallback rỗng = bỏ dòng. */
  when?: Condition;
  fallback?: string;
}

export interface ChoiceOption {
  id: string;
  /** 3 sắc thái: playful = "Rộn ràng", gentle = "Ấm áp", deep = "Sâu lắng". Bỏ trống = lựa chọn nội dung. */
  tone?: Tone;
  text: string;
  set_flags?: Record<string, FlagValue>;
  /** R-D0: câu phản ứng phát NGAY sau khi chọn lựa chọn này (vd. Trang 3 chọn kiểu trang trí). */
  lines?: DialogueLine[];
}

/**
 * R-D5: lựa chọn nằm trong một minigame. Runner đưa `options` (id + text) vào trò qua dữ liệu `choice_options`;
 * trò lưu id đã chọn vào dữ liệu `choice`; xong ván (không phải "Bỏ qua") thì engine áp lựa chọn như bước `choice`.
 */
export interface MinigameChoice { choice_id: string; options: ChoiceOption[]; about?: ActorRef[]; measured?: boolean }

// ---------- Trình bày hệ thống (R-D0, chốt 25/11: lời dẫn bối cảnh tách hẳn khỏi khung thoại nhân vật) ----------
/**
 * Kênh của lời dẫn hệ thống (docs/handoff/SO_HOA_NARRATIVE_TA_CANH_MOC1.md mục I):
 * 'narrator' = dải dẫn chuyện / phụ đề bối cảnh (không tên người nói, không bong bóng); 'world_event' = mô tả đổi cảnh / môi trường.
 * Thẻ chữ dùng `TitleCard`, mục tiêu HUD dùng `objective`, luật minigame thuộc minigame — không đi qua kênh này.
 */
export type NarrativeChannel = 'narrator' | 'world_event';
export interface NarrativeLine {
  /** ID tra bảng số hóa (vd. `narr_p1_c1_drop`). Không bắt buộc. */
  id?: string;
  /** Mặc định 'narrator'. */
  channel?: NarrativeChannel;
  /** Có thể chứa `{player_name}` và `{g:<nam>|<nữ>}`. */
  text: string;
  /** Mã âm thanh gợi ý (sfx.ts); chưa có âm thì bỏ qua, không lỗi. */
  sfx?: string;
  /** Giữ trên màn hình ít nhất bao lâu (ms) trước khi cho qua / tự qua. */
  duration_ms?: number;
  /** Ảnh nền tĩnh (đường dẫn tương đối trong public/, vd. `assets/backdrops/yard_morning.jpg`). */
  backdrop?: string;
  when?: Condition;
  fallback?: string;
}
/** Thẻ chữ 2 dòng giữa màn hình (THẺ): mở màn, chuyển thời gian, đổi tên khu. */
export interface TitleCard {
  id?: string;
  title: string;
  subtitle?: string;
  /** Tổng thời gian hiện (ms), mặc định do UI quyết (~3000). */
  duration_ms?: number;
  /** Ảnh nền tĩnh (đường dẫn tương đối trong public/). */
  backdrop?: string;
}

/** Mốc kích hoạt một cue đạo diễn: đầu bước, cuối bước (sau thoại), hoặc khi dòng thoại thứ `line` (đếm từ 0) của bước hiện ra. */
export type StageAt = 'start' | 'end' | { line: number };
interface StageCueBase {
  /** Mặc định 'start'. */
  at?: StageAt;
  /** true = chờ cue xong (vd. NPC đi tới nơi) rồi mới phát tiếp; mặc định không chờ. */
  wait?: boolean;
}
/**
 * Đạo diễn theo bước (R-B1/R-B2/R-B3 thực thi). Vị trí luôn là ID marker (`spot.*`, `itr.*`), không ghi số.
 * `actor` là vai (NPC_A…) hoặc 'player'.
 */
export type StageCue = StageCueBase & (
  | { cue: 'move'; actor: ActorRef; to: string; pace?: 'walk' | 'run' }
  | { cue: 'teleport'; actor: ActorRef; to: string }
  | { cue: 'face'; actor: ActorRef; /** vai khác hoặc ID marker */ toward: string }
  | { cue: 'motion'; actor: ActorRef; /** idle, talk, pose_peace, pose_wave, pose_tada, cheer… */ motion: string }
  | { cue: 'visible'; actor: ActorRef; visible: boolean }
  | { cue: 'prop'; actor: ActorRef; /** ID đạo cụ cầm tay; null = bỏ tay không */ prop: string | null }
  | { cue: 'camera'; /** ID máy ảnh của Ngày (`day.cameras`); null = trả máy về người chơi */ camera_id: string | null; dolly_ms?: number }
  | { cue: 'weather'; preset: string; tween_s?: number }
  | { cue: 'sfx'; sfx: string }
  /** BUG-T1-B: màn tối toàn màn hình. `on: true` chờ tối hẳn rồi mới chạy cue sau (che lúc dời người chơi); `on: false` mở lại. */
  | { cue: 'fade'; on: boolean }
);
export type StageCueKind = StageCue['cue'];
/** Dòng thoại chen lúc đếm ngược hẹn giờ chụp; `at_s` = giây còn lại khi hiện (bỏ trống = UI tự rải). */
export type CountdownLine = DialogueLine & { at_s?: number };

// ---------- Bước quest ----------
interface StepBase {
  /** `<quest_id>.sNN` */
  id: string;
  /** Dòng mục tiêu trên HUD. */
  objective?: string;
  hint?: string;
  /** R-D0: thẻ chữ hiện TRƯỚC khi bước bắt đầu. */
  title_card?: TitleCard;
  /** R-D0: lời dẫn hệ thống — `before` phát trước nội dung bước, `after` phát khi bước xong. */
  narrative?: { before?: NarrativeLine[]; after?: NarrativeLine[] };
  /** R-D0: cue đạo diễn NPC / máy quay / thời tiết trong bước. */
  stage?: StageCue[];
}
export type PhotoMode = 'timer' | 'handheld' | 'auto';
export type PhoneScreen = 'contacts' | 'group_chat' | 'photos';

export type Step =
  | (StepBase & { kind: 'talk'; with: ActorRef; lines: DialogueLine[] })
  | (StepBase & { kind: 'goto'; target: string })
  | (StepBase & { kind: 'interact'; target: string; lines?: DialogueLine[] })
  | (StepBase & { kind: 'choice'; choice_id: string; prompt?: DialogueLine; options: ChoiceOption[]; about?: ActorRef[]; measured?: boolean })
  | (StepBase & { kind: 'collect'; item: string; targets: string[]; count: number;
      /** R-D0: phản ứng khi gom được từng điểm (✓ + câu gắn điểm); khóa = ID trong `targets`. */
      lines_by_target?: Record<string, DialogueLine[]>;
      /** R-D0: hiện bộ đếm "đã gom/count" trên HUD (mặc định true khi có lines_by_target). */
      show_counter?: boolean })
  | (StepBase & { kind: 'place'; item: string; target: string })
  | (StepBase & { kind: 'photo'; mode: PhotoMode; camera_id: string; subjects: ActorRef[]; album_entry_id: string; stand_zone?: StandZone; /** handheld: số lần chụp rồi chọn 1 (mặc định 1) */ shots?: number;
      /** R-D0: câu mở đầu trước lần bấm đầu tiên. */
      first_line?: DialogueLine;
      /** R-D0: lời nhắc riêng cho từng lần bấm (phần tử i = lần i+1); độ dài ≤ `shots`. */
      shot_prompts?: string[];
      /** R-D0: lời nhắc khung ngắm (thay câu mặc định của photoRunner). */
      prompt?: string;
      /** R-D0: hẹn giờ mà KHÔNG giục chạy/tạo dáng (ảnh cầu vồng Trang 4). */
      hide_pose?: boolean;
      /** R-D0: thoại chen lúc đếm ngược (không chặn); lọc theo `when` (vd. flag m1.group_photo_style). */
      countdown_lines?: CountdownLine[];
      /** R-D0: thoại sau khi giữ ảnh; lọc theo `when`. */
      after_lines?: DialogueLine[] })
  | (StepBase & { kind: 'minigame'; game: string; level?: 'min'; /** phát TRƯỚC khi mở trò */ intro_lines?: DialogueLine[]; /** phát SAU khi chơi xong (thắng, thua hay "Bỏ qua") */ lines?: DialogueLine[]; opponent?: string;
      /** R-D5: lựa chọn diễn ra TRONG trò (vd. điều ước Trang 2) — áp cờ/sắc thái và phát `choice_made` như bước `choice`. */
      choice?: MinigameChoice })
  | (StepBase & { kind: 'cutscene'; lines: DialogueLine[] })
  | (StepBase & { kind: 'free'; prompt?: string })
  | (StepBase & { kind: 'setFlag'; flag: string; value: FlagValue })
  | (StepBase & { kind: 'phone_ui'; screen: PhoneScreen; thread_id?: string })
  | (StepBase & { kind: 'compose_message'; thread_id: string; openers: ChoiceOption[] })
  | (StepBase & { kind: 'album_restore'; page_id: string });
export type StepKind = Step['kind'];

// ---------- 14 thực thể ----------
export interface Character {
  id: string;                         // chr_*
  display_name: string;
  nickname?: string;
  archetype?: string;
  voice_owner?: string;
  ui_color?: string;
  /** Tham số ngoại hình theo độ tuổi. Bộ nào chưa có thì để trống (Q5). `rig_id` trỏ tới bộ dựng trong actors/. */
  age_variants: Partial<Record<AgeVariant, { rig_id: string }>>;
  props?: string[];
  school_by_year?: Record<string, string>;
}

export interface Milestone {
  id: MilestoneId;
  title: string;
  school_years: string[];
  palette_id?: string;
  box_compartment: number;
}

export interface SchoolYear {
  id: string;                         // g06 … g12
  milestone_id: MilestoneId;
  start_year: number;
  end_year: number;
  age_range: [number, number];
  age_variant: AgeVariant;
  group_members: ActorRef[];
  map_variant: string;
}

export interface MapDef {
  id: string;                         // map_*
  zones: { zone_id: string; name: string; boundary?: string }[];
  variants: { variant_id: string; decor_set: string; lighting_preset: string }[];
  /** Vị trí lấy từ marker SPAWN_ cùng ID trong file Blender của bản đồ; `position` chỉ dùng cho bản đồ chưa có file Blender. */
  spawn_points: { id: string; position?: [number, number]; facing?: number }[];
}

/** Nhóm Trang (nhãn "Mốc …"), chỉ để hiện menu và báo cáo (D-04). Tên kiểu dữ liệu `Chapter` giữ nguyên để khỏi đổi schema. */
export interface Chapter { id: string; label: string; memory_day_ids: string[] }

/**
 * Vị trí trong Ngày ký ức KHÔNG ghi bằng số trong nội dung: nội dung chỉ nêu ID ổn định, vị trí thật nằm ở marker trong file Blender
 * (xem docs/S2_WORLD_ARCHITECTURE.md). Các trường `position`/`look_at`/`center` chỉ còn để dùng cho Hub và bản đồ chưa có file Blender.
 */
export interface NpcPlacement { actor: ActorRef; /** ID marker chỗ đứng (spot.<map>.<slug>). */ marker?: string; position?: [number, number]; facing?: number; motion?: string }
/** Trong Ngày ký ức: vị trí = marker ITR_ có htx_id trùng `id`. */
export interface Interactable { id: string; label: string; position?: [number, number]; zone_id?: string; kind: 'object' | 'marker' }
/** `marker` = ID marker máy ảnh (cam.<map>.<slug>); điểm nhìn là marker `<marker>.target`. */
export interface CameraPoint { id: string; marker?: string; position?: [number, number, number]; look_at?: [number, number, number]; fov?: number }
/** Vòng đứng khi chụp ảnh: tâm lấy từ marker chỗ đứng (spot.*) hoặc ghi số. */
export interface StandZone { marker?: string; center?: [number, number]; radius: number }

/**
 * R-D0: tên khu hiện trên màn hình (toast khi đi qua khu) bị thay tạm trong Ngày này.
 * Áp dụng khi `when` đúng (bỏ trống = luôn) VÀ bước `until_step` chưa xong (bỏ trống = suốt Ngày).
 * Vd. Trang 3: zone.thcs.base hiện "Góc sân sau" cho tới khi xong bước Đức đặt tên Căn cứ.
 */
export interface ZoneNameOverride { zone_id: string; name: string; until_step?: string; when?: Condition }

export interface MemoryDay {
  weather_by_step?: Record<string, string>;
  zone_name_overrides?: ZoneNameOverride[];
  id: string;                         // d.gNN.KK
  title: string;
  school_year_id: string;
  map_id: string;
  map_variant: string;
  time_phases?: string[];
  open_zones?: string[];
  spawn_point?: string;
  anchor_artifact_id: string;
  main_chain: string[];
  side_quests: string[];
  daily_pool: string[];
  npc_placements: NpcPlacement[];
  interactables: Interactable[];
  cameras: CameraPoint[];
  album_page_id: string;
  /** Ngày xong khi chuỗi Main xong. */
  completion: 'main_chain';
}

export interface Quest {
  id: string;                         // q_<scope>_<type>_<NN>
  type: QuestType;
  scope: QuestScope;
  memory_day_id?: string;
  title: string;
  owner: string;
  ownership_label: OwnershipLabel;
  status: ContentStatus;
  version: string;
  available_when?: Condition;
  steps: Step[];
  /** Event Quest nhiều phần: checkpoint ở đầu mỗi phần. */
  parts?: { id: string; title: string; first_step_id: string }[];
  rewards?: { fragment_ids?: string[]; album_entry_ids?: string[]; flags?: Record<string, FlagValue> };
  /** Luôn false với side/daily. */
  blocks_main: boolean;
  analytics_custom?: string[];
}

export interface Artifact {
  id: string;                         // art_<scope>_NN
  name: string;
  description?: string;
  origin?: string;
  school_year_id: string;
  hook_2026: string;
  appear_when: Condition;
  present_interaction?: string;
  transition_fx?: string;
  target_memory_day_id: string;
  target_step_id?: string;
  complete_when: 'day_completed';
  reward_fragment_ids: string[];
  album_entry_ids: string[];
  new_present_action?: string;        // pde_*
  /** Gợi ý hình khối tạm cho Hub (chưa có model). */
  shape?: 'paper' | 'photo' | 'box' | 'boat' | 'sign';
}

export type FragmentKind = 'photo' | 'note' | 'sticker' | 'personal_memory' | 'back_note' | 'artifact';
export interface MemoryFragment {
  id: string;                         // frag.<day>.NN
  memory_day_id: string;
  kind: FragmentKind;
  source_quest_id?: string;
  text?: string;
  media_spec?: 'A' | 'B' | 'C';
  relationship_tags?: string[];
}

export type SlotType = 'main_photo' | 'free_photo' | 'sticker' | 'note' | 'artifact' | 'quest_record' | 'personal_memory' | 'back_note';
export type EntrySource = 'gameplay_photo' | 'auto_snapshot' | 'text' | 'sticker_art';
export interface AlbumEntry {
  id: string;                         // alb.<day>.NN
  page_id: string;                    // page.<day>
  slot_type: SlotType;
  slot_index: number;
  fragment_id: string;
  source: EntrySource;
  required_for_restore: boolean;
  /** Ô tùy chọn: nhận khi quest này xong. Ô bắt buộc nhận khi xong chuỗi Main. */
  unlock_quest_id?: string;
  /** Máy ảnh ảo tự chụp ở khoảnh khắc chốt (D-19: nguồn B, cũng là ảnh dự phòng cho nguồn A). */
  snapshot?: { camera_id: string; at_step_id: string };
  replayable?: boolean;
}

export type PdeType = 'RESTORE' | 'SHELF' | 'FRAGMENT' | 'CONTACT' | 'REPLY' | 'REUNION';
export type PdeEffect =
  | { kind: 'restore_page'; page_id: string }
  | { kind: 'shelf_artifact'; artifact_id: string }
  | { kind: 'add_fragment'; album_entry_id: string; recall?: DialogueLine[] }
  | { kind: 'unlock_quest'; quest_id: string }
  | { kind: 'message'; thread_id: string; lines: DialogueLine[] };
export interface PresentDayEvent {
  id: string;                         // pde_NN
  type: PdeType;
  trigger: Condition;
  effects: PdeEffect[];
  once: boolean;
}

/** Chỉ khai kiểu, chưa dùng (D-08). */
export interface Ending {
  id: string;                         // end_NN
  model: 'A' | 'B' | 'C';
  conditions: Condition;
  layers?: { layer_id: string; conditions: Condition; scene: string }[];
  credits_photos?: string[];
}

export interface PhoneThread { id: string; title: string; members: ActorRef[]; history: DialogueLine[] }
export interface HubContent {
  /** Quest mở đầu (lời dẫn → nhập tên → chọn ngoại hình → mở ngăn Mốc 1). */
  intro_quest_id: string;
  interactables: Interactable[];
  threads: PhoneThread[];
  /** Màn kết ở điểm dừng của bản phát hành. */
  demo_end_lines: DialogueLine[];
}

export interface ContentPack {
  characters: Character[];
  milestones: Milestone[];
  school_years: SchoolYear[];
  maps: MapDef[];
  chapters: Chapter[];
  days: MemoryDay[];
  quests: Quest[];
  artifacts: Artifact[];
  fragments: MemoryFragment[];
  album_entries: AlbumEntry[];
  pdes: PresentDayEvent[];
  endings: Ending[];
  hub: HubContent;
}

/** Bảng ánh xạ vai → nhân vật (D-01). */
export type CastTable = Record<CastRole, string>;
/** Phạm vi một bản phát hành (D-03). */
export interface ReleaseDef {
  memory_day_ids: string[];
  /** Ngày kết thúc (điểm dừng). */
  end_day_id: string | null;
  /** Bước gửi tin ở Hub phải xong mới tính hoàn thành bản public (nếu khai). */
  end_step_id?: string;
}

export interface ContentConfig {
  cast: CastTable;
  release: ReleaseDef;
  /** Bản production không được chứa nội dung chưa phải HUMAN_CANON. */
  environment: 'test' | 'production';
}
