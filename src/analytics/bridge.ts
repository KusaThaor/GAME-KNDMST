/**
 * Cầu nối event bus → analytics (F8). Mỗi event được DỰNG LẠI từ các trường cho phép, không chuyển nguyên payload,
 * nên tên Player, nội dung tin nhắn, nội dung ghi chú không có đường nào lọt ra.
 * Đường ống gửi (/api/collect) giữ nguyên — xem tracker.ts.
 */
import type { EventName, PropValue } from '../../shared/events';
import type { ContentIndex } from '../content/indexContent';
import type { Tone } from '../content/types';
import type { EventBus } from '../core/eventBus';
import type { SaveState } from '../core/save';

export interface TrackerLike { track(name: EventName, props?: Record<string, PropValue>): void; setAttempt(id: string | null): void }

export function attachAnalytics(deps: { bus: EventBus; idx: ContentIndex; save: SaveState; tracker: TrackerLike; now?: () => number }): () => void {
  const { bus, idx, save, tracker } = deps;
  const now = deps.now ?? Date.now;
  tracker.setAttempt(save.attempt_id);
  const T = (name: EventName, props?: Record<string, PropValue>) => tracker.track(name, props);
  // GDD v1.0: Trang = đơn vị chơi; page_id giữ mã d.gNN.KK. Số liệu "memory_day_id" ở các event khác (quest, ảnh…) giữ nguyên.
  const pageProps = (pageId: string, is_replay: boolean) => ({
    milestone_id: idx.milestoneOfDay(pageId) ?? null, school_year: idx.days.get(pageId)?.school_year_id ?? null,
    page_id: pageId, chapter_label: idx.chapterLabel(pageId) ?? null, is_replay,
  });
  const pageStart = new Map<string, number>();
  const questProps = (quest_id: string, quest_type: string, memory_day_id: string | null, is_replay: boolean) => ({
    quest_id, quest_type, milestone_id: idx.quests.get(quest_id)?.scope ?? null, memory_day_id, is_replay,
  });
  const lastTone = new Map<string, Tone | null>();

  const offs = [
    bus.on('hub_entered', (e) => { if (e.first) T('game_started', { memory_day_id: null, step_id: null }); }),
    bus.on('game_resumed', (e) => T('game_resumed', { memory_day_id: e.memory_day_id, step_id: e.step_id })),
    bus.on('profile_set', (e) => T('appearance_selected', { gender: e.gender })),
    bus.on('artifact_opened', (e) => T('artifact_opened', { artifact_id: e.artifact_id, memory_day_id: e.memory_day_id, is_replay: e.is_replay })),
    bus.on('day_started', (e) => {
      if (e.resumed) return;
      pageStart.set(e.day_id, now());
      T('page_started', pageProps(e.day_id, e.is_replay));
    }),
    bus.on('day_completed', (e) => {
      const t0 = pageStart.get(e.day_id);
      pageStart.delete(e.day_id);
      // duration_s chỉ có khi đã thấy page_started trong lần chạy này (tải lại giữa Trang thì bỏ trống, không đoán).
      T('page_completed', { ...pageProps(e.day_id, e.is_replay), ...(t0 === undefined ? {} : { duration_s: Math.max(0, Math.round((now() - t0) / 1000)) }) });
      if (e.is_replay) return;
      const m = idx.milestoneOfDay(e.day_id);
      const sameMilestone = idx.releaseDays.filter((d) => idx.milestoneOfDay(d.id) === m);
      if (m && sameMilestone.every((d) => save.days[d.id]?.state === 'completed')) T('milestone_completed', { milestone_id: m });
    }),
    bus.on('quest_started', (e) => T('quest_started', questProps(e.quest_id, e.quest_type, e.memory_day_id, e.is_replay))),
    bus.on('quest_completed', (e) => T('quest_completed', questProps(e.quest_id, e.quest_type, e.memory_day_id, e.is_replay))),
    // Tin nhắn kết demo: chỉ gửi sắc thái (playful/gentle/deep), không bao giờ gửi nội dung (GDD 02 §5.1).
    bus.on('message_sent', (e) => { lastTone.set(e.step_id, e.tone); T('end_message_sent', { tone: e.tone }); }),
    bus.on('minigame_started', (e) => {
      T('minigame_started', { game_id: e.game_id, context: e.context, page_id: e.page_id, opponent_id: e.opponent_id, difficulty: e.difficulty });
    }),
    bus.on('minigame_finished', (e) => {
      T('minigame_finished', { game_id: e.game_id, context: e.context, page_id: e.page_id, opponent_id: e.opponent_id, difficulty: e.difficulty, result: e.result, duration_s: e.duration_s, stars: e.stars, hints_used: e.hints_used, score: e.score });
    }),
    bus.on('hub_opened', (e) => T('hub_opened', { page_id: e.page_id })),
    bus.on('step_completed', (e) => {
      T('quest_step_completed', { ...questProps(e.quest_id, e.quest_type, e.memory_day_id, e.is_replay), step_id: e.step_id });
      if (e.quest_type === 'pd') T('pd_quest_step', { quest_id: e.quest_id, step_id: e.step_id, choice_tone: lastTone.get(e.step_id) ?? null });
    }),
    bus.on('choice_made', (e) => { if (e.measured) T('choice_made', { choice_id: e.choice_id, tone: e.tone, memory_day_id: idx.steps.get(e.step_id)?.quest.memory_day_id ?? null, is_replay: e.is_replay }); }),
    bus.on('photo_attempt', (e) => T('photo_attempt', { step_id: e.step_id, retry_index: e.retry_index, all_in_frame: e.all_in_frame, player_in_zone: e.player_in_zone, posed_in_time: e.posed_in_time })),
    bus.on('photo_kept', (e) => T('photo_kept', { step_id: e.step_id, retry_index: e.retry_index, all_in_frame: e.all_in_frame, player_in_zone: e.player_in_zone, posed_in_time: e.posed_in_time })),
    bus.on('free_photo_taken', (e) => T('free_photo_taken', { memory_day_id: e.memory_day_id, zone_id: e.zone_id })),
    bus.on('zone_entered', (e) => T('zone_entered', { memory_day_id: e.memory_day_id, zone_id: e.zone_id })),
    bus.on('day_end_answered', (e) => T('skip_prompt_answered', { answer: e.answer, open_side_quests: e.open_side_quests })),
    bus.on('album_page_restored', (e) => T('album_page_restored', { page_id: e.page_id })),
    bus.on('album_viewed', (e) => T('album_viewed', { pages_restored: e.pages_restored })),
    bus.on('photo_back_viewed', (e) => T('photo_back_viewed', { album_entry_id: e.album_entry_id })),
    bus.on('public_demo_completed', () => T('public_demo_completed')),
    bus.on('feedback_shown', (e) => T('feedback_shown', { placement: e.placement })),
    bus.on('feedback_submitted', (e) => T('feedback_submitted', { feedback_id: e.feedback_id })),
    bus.on('feedback_skipped', (e) => T('feedback_skipped', { placement: e.placement })),
  ];
  return () => offs.forEach((off) => off());
}
