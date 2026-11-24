/**
 * Định nghĩa event analytics dùng chung cho trình duyệt (client) và Vercel Function (server).
 * Nguồn yêu cầu: 07_ANALYTICS_RULES_DEV (rút từ 07 v0.6) + FRAMEWORK_IMPLEMENTATION_HANDOFF_v1 F8.
 * Quy tắc riêng tư: không gửi tên người chơi, email, IP hay nội dung tự do trong event.
 */

export const EVENT_NAMES = [
  'landing_view', 'cta_click',
  'game_load_started', 'game_ready', 'game_started', 'game_resumed',
  'appearance_selected',
  // GDD v1.0: Trang (page_id = d.gNN.KK) thay cho Ngày ký ức / chapter.
  'artifact_opened', 'page_started', 'page_completed', 'milestone_completed', 'public_demo_completed',
  // GDD 02 §5.1 (skeleton): minigame, Khu Vui Chơi Căn cứ, tin nhắn cuối demo.
  'minigame_started', 'minigame_finished', 'hub_opened', 'end_message_sent',
  'quest_started', 'quest_step_completed', 'quest_completed', 'choice_made',
  'photo_attempt', 'photo_kept', 'free_photo_taken',
  'zone_entered', 'interactable_viewed', 'skip_prompt_answered',
  'album_page_restored', 'album_viewed', 'photo_back_viewed', 'pd_quest_step',
  'active_heartbeat',
  'feedback_shown', 'feedback_submitted', 'feedback_skipped',
  'game_error',
  // Chỉ dùng ở môi trường test để kiểm tra đường ống dữ liệu.
  'pipeline_test',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];
export type PropValue = string | number | boolean | null;
export type ReleaseStage = 'prototype' | 'public';
export type AppEnvironment = 'test' | 'production';

export interface AnalyticsEvent {
  event_id: string;          // UUID — chống đếm trùng
  name: EventName;
  client_time: string;       // ISO 8601 (UTC) theo đồng hồ máy người chơi
  visitor_id: string;        // ID ẩn danh theo trình duyệt
  session_id: string;
  attempt_id?: string | null;
  props?: Record<string, PropValue>;
}

export interface CollectBatch {
  batch_id: string;          // UUID — gửi lại cùng batch_id sẽ không bị ghi hai lần
  build_version: string;
  release_stage: ReleaseStage;
  events: AnalyticsEvent[];
}

export const LIMITS = {
  maxEventsPerBatch: 200,
  maxBodyBytes: 256 * 1024,
  maxPropsPerEvent: 24,
  maxStringLength: 160,
  maxKeyLength: 40,
} as const;

/** Khóa bị cấm trong props — chặn rò rỉ thông tin cá nhân và nội dung tự do (07: không gửi tên/email/IP/nội dung tin nhắn, ghi chú). */
export const FORBIDDEN_PROP_KEYS = new Set([
  'player_name', 'playername', 'name', 'full_name', 'email', 'phone', 'ip', 'ip_address', 'address',
  // không gửi nội dung tự do: tin nhắn, ghi chú, câu trả lời
  'message', 'message_text', 'note', 'note_text', 'text', 'content', 'free_text',
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEY_RE = /^[a-z][a-z0-9_]*$/;
const BUILD_RE = /^[0-9]{8}-[0-9a-z]{1,12}$/i;
const EVENT_SET = new Set<string>(EVENT_NAMES);

export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);

export interface ValidationResult {
  ok: boolean;
  error?: string;
  batch?: CollectBatch;
  dropped: { index: number; reason: string }[];
}

function cleanProps(raw: unknown): { props?: Record<string, PropValue>; reason?: string } {
  if (raw === undefined || raw === null) return { props: undefined };
  if (typeof raw !== 'object' || Array.isArray(raw)) return { reason: 'props_not_object' };
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > LIMITS.maxPropsPerEvent) return { reason: 'too_many_props' };
  const out: Record<string, PropValue> = {};
  for (const [k, v] of entries) {
    if (k.length > LIMITS.maxKeyLength || !KEY_RE.test(k)) return { reason: `bad_key:${k.slice(0, 40)}` };
    if (FORBIDDEN_PROP_KEYS.has(k.toLowerCase())) return { reason: `forbidden_key:${k}` };
    if (v === null || typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'number') { if (!Number.isFinite(v)) return { reason: `bad_number:${k}` }; out[k] = v; }
    else if (typeof v === 'string') { if (v.length > LIMITS.maxStringLength) return { reason: `string_too_long:${k}` }; out[k] = v; }
    else return { reason: `bad_value_type:${k}` };
  }
  return { props: out };
}

/**
 * Kiểm tra một lô event. Lô sai cấu trúc → từ chối cả lô.
 * Event lẻ sai (tên lạ, khóa bị cấm…) → bỏ event đó, giữ phần còn lại, báo lại lý do.
 */
export function validateBatch(input: unknown): ValidationResult {
  const dropped: ValidationResult['dropped'] = [];
  if (!input || typeof input !== 'object') return { ok: false, error: 'body_not_object', dropped };
  const b = input as Record<string, unknown>;
  if (!isUuid(b.batch_id)) return { ok: false, error: 'bad_batch_id', dropped };
  if (typeof b.build_version !== 'string' || !BUILD_RE.test(b.build_version)) return { ok: false, error: 'bad_build_version', dropped };
  if (b.release_stage !== 'prototype' && b.release_stage !== 'public') return { ok: false, error: 'bad_release_stage', dropped };
  if (!Array.isArray(b.events) || b.events.length === 0) return { ok: false, error: 'no_events', dropped };
  if (b.events.length > LIMITS.maxEventsPerBatch) return { ok: false, error: 'too_many_events', dropped };

  const events: AnalyticsEvent[] = [];
  const seen = new Set<string>();
  b.events.forEach((raw, index) => {
    const e = raw as Record<string, unknown>;
    const drop = (reason: string) => dropped.push({ index, reason });
    if (!e || typeof e !== 'object') return drop('not_object');
    if (!isUuid(e.event_id)) return drop('bad_event_id');
    if (seen.has(e.event_id)) return drop('duplicate_in_batch');
    if (typeof e.name !== 'string' || !EVENT_SET.has(e.name)) return drop('unknown_event');
    if (typeof e.client_time !== 'string' || Number.isNaN(Date.parse(e.client_time))) return drop('bad_client_time');
    if (!isUuid(e.visitor_id)) return drop('bad_visitor_id');
    if (!isUuid(e.session_id)) return drop('bad_session_id');
    if (e.attempt_id !== undefined && e.attempt_id !== null && !isUuid(e.attempt_id)) return drop('bad_attempt_id');
    const { props, reason } = cleanProps(e.props);
    if (reason) return drop(reason);
    seen.add(e.event_id);
    events.push({
      event_id: e.event_id, name: e.name as EventName, client_time: new Date(e.client_time).toISOString(),
      visitor_id: e.visitor_id, session_id: e.session_id, attempt_id: (e.attempt_id as string | null | undefined) ?? null,
      ...(props ? { props } : {}),
    });
  });
  if (events.length === 0) return { ok: false, error: 'all_events_invalid', dropped };
  return {
    ok: true, dropped,
    batch: { batch_id: b.batch_id, build_version: b.build_version, release_stage: b.release_stage, events },
  };
}
