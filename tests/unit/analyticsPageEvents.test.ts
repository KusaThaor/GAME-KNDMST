import { describe, expect, it } from 'vitest';
import { attachAnalytics } from '../../src/analytics/bridge';
import { EVENT_NAMES, type EventName, type PropValue } from '../../shared/events';
import { EventBus } from '../../src/core/eventBus';
import { newSave } from '../../src/core/save';
import { indexContent } from '../../src/content/indexContent';
import { CONTENT, contentConfig } from '../../src/content/pack';

function setup() {
  const save = newSave('33333333-3333-4333-8333-333333333333');
  const idx = indexContent(CONTENT, contentConfig('test'));
  const bus = new EventBus();
  const sent: { name: EventName; props: Record<string, PropValue> }[] = [];
  let clock = 1_000_000;
  attachAnalytics({ bus, idx, save, now: () => clock, tracker: { track: (name, props) => sent.push({ name, props: props ?? {} }), setAttempt: () => {} } });
  return { bus, sent, tick: (ms: number) => { clock += ms; }, of: (n: EventName) => sent.filter((e) => e.name === n).map((e) => e.props) };
}

describe('event theo GDD v1.0 §5.1 (page_*, minigame_*, hub_opened, end_message_sent)', () => {
  it('tên event mới có trong danh sách; tên memory_day_* cũ đã bỏ', () => {
    for (const n of ['page_started', 'page_completed', 'minigame_started', 'minigame_finished', 'hub_opened', 'end_message_sent', 'public_demo_completed']) expect(EVENT_NAMES).toContain(n);
    expect(EVENT_NAMES).not.toContain('memory_day_started' as never);
    expect(EVENT_NAMES).not.toContain('memory_day_completed' as never);
  });

  it('page_completed có duration_s khi đã thấy page_started; tải lại giữa Trang thì không đoán', () => {
    const t = setup();
    t.bus.emit('day_started', { day_id: 'd.g06.01', is_replay: false, resumed: false });
    t.tick(95_400);
    t.bus.emit('day_completed', { day_id: 'd.g06.01', is_replay: false });
    expect(t.of('page_completed')[0]).toMatchObject({ page_id: 'd.g06.01', milestone_id: 'm1', is_replay: false, duration_s: 95 });
    // Tải lại giữa Trang: day_started(resumed) không phát event và không có thời điểm bắt đầu.
    t.bus.emit('day_started', { day_id: 'd.g07.03', is_replay: false, resumed: true });
    t.bus.emit('day_completed', { day_id: 'd.g07.03', is_replay: false });
    expect(t.of('page_started')).toHaveLength(1);
    expect(t.of('page_completed')[1]).not.toHaveProperty('duration_s');
  });

  it('minigame_started/finished và hub_opened mang đúng thuộc tính', () => {
    const t = setup();
    const mg = { game_id: 'caro', context: 'story' as const, page_id: 'd.g08.01', opponent_id: 'duc', difficulty: 'easy' };
    t.bus.emit('minigame_started', mg);
    t.bus.emit('minigame_finished', { ...mg, result: 'win', duration_s: 120, stars: null, hints_used: null, score: null });
    t.bus.emit('hub_opened', { page_id: 'd.g07.03' });
    expect(t.of('minigame_started')[0]).toEqual(mg);
    expect(t.of('minigame_finished')[0]).toMatchObject({ game_id: 'caro', result: 'win', duration_s: 120 });
    expect(t.of('hub_opened')[0]).toEqual({ page_id: 'd.g07.03' });
  });

  it('end_message_sent chỉ gửi sắc thái (deep), không gửi nội dung', () => {
    const t = setup();
    t.bus.emit('message_sent', { quest_id: 'q_hub_pd_03', step_id: 'q_hub_pd_03.s01', tone: 'deep' });
    expect(t.of('end_message_sent')).toEqual([{ tone: 'deep' }]);
  });
});
