/**
 * Quest engine (F4). Thuần logic, không đụng DOM/Three: nhận "người chơi vừa làm gì", đổi trạng thái trong SaveState,
 * phát sự kiện lên event bus. UI và cảnh 3D chỉ đọc trạng thái + nghe bus.
 *
 * - Quest: locked → available → active → completed; Side/Daily chưa làm khi Ngày kết thúc → missed. Không có thất bại.
 * - Bước: mỗi quest active có đúng một bước đang chờ (lưu bằng step_id). Checkpoint = ranh giới bước.
 * - Chuỗi Main tuyến tính; Ngày xong khi chuỗi Main xong. Side không bao giờ chặn Main. Daily: 1 lần mỗi Ngày.
 * - Chơi lại: trạng thái + flag nằm ở vùng riêng (save.current.replay), không ghi đè câu chuyện của lần đầu.
 */
import type { ContentIndex, StepRef } from '../content/indexContent';
import type { ChoiceOption, FlagValue, MemoryDay, Quest, Step } from '../content/types';
import { evalCondition, type ConditionContext } from '../core/conditions';
import type { EventBus } from '../core/eventBus';
import type { QuestRecord, QuestState, SaveState } from '../core/save';

export type EnginePhase = 'idle' | 'playing' | 'end_prompt' | 'free_after_main' | 'ended';
export type TriggerKind = 'interact' | 'arrive';
export interface TriggerResult { ref: StepRef; action: 'completed' | 'present' | 'progress' }
export interface StepResult { option_id?: string; text?: string }
type Ctx = { kind: 'hub' } | { kind: 'day'; day: MemoryDay; replay: boolean } | null;

export interface EngineDeps { idx: ContentIndex; save: SaveState; bus: EventBus }

/** Kiểu bước chỉ hoàn thành bằng hành động trong thế giới (không cho UI "báo xong" thay). */
const WORLD_ONLY = new Set<Step['kind']>(['goto', 'collect', 'place']);

export class QuestEngine {
  phase: EnginePhase = 'idle';
  private ctx: Ctx = null;
  private presenting = new Set<string>();
  private readonly idx: ContentIndex;
  private readonly save: SaveState;
  private readonly bus: EventBus;

  constructor(deps: EngineDeps) { this.idx = deps.idx; this.save = deps.save; this.bus = deps.bus; }

  // ---------- đọc trạng thái ----------
  get context(): Ctx { return this.ctx; }
  get isReplay(): boolean { return this.ctx?.kind === 'day' && this.ctx.replay; }
  get dayId(): string | null { return this.ctx?.kind === 'day' ? this.ctx.day.id : null; }

  private get records(): Record<string, QuestRecord> { return this.isReplay && this.save.current.replay ? this.save.current.replay.quests : this.save.quests; }
  private key(q: Quest): string { return q.type === 'daily' && this.ctx?.kind === 'day' ? `${q.id}@${this.ctx.day.id}` : q.id; }
  private rec(q: Quest): QuestRecord { return (this.records[this.key(q)] ??= { state: 'locked', step_id: null, progress: [] }); }

  questState(questId: string): QuestState {
    const q = this.idx.quests.get(questId);
    return q ? this.records[this.key(q)]?.state ?? 'locked' : 'locked';
  }

  flag(name: string): FlagValue | undefined {
    const r = this.isReplay ? this.save.current.replay?.flags[name] : undefined;
    return r !== undefined ? r : this.save.flags[name];
  }
  private setFlag(name: string, value: FlagValue) {
    if (this.isReplay && this.save.current.replay) this.save.current.replay.flags[name] = value; else this.save.flags[name] = value;
  }

  readonly conditions: ConditionContext = {
    flag: (n) => this.flag(n),
    questCompleted: (id) => {
      const keys = this.dayId ? [id, `${id}@${this.dayId}`] : [id];
      if (keys.some((k) => this.records[k]?.state === 'completed' || this.save.quests[k]?.state === 'completed')) return true;
      return !this.dayId && Object.entries(this.save.quests).some(([k, r]) => k.startsWith(`${id}@`) && r.state === 'completed');
    },
    dayCompleted: (id) => this.save.days[id]?.state === 'completed',
  };

  private contextQuests(): Quest[] {
    const c = this.ctx;
    if (!c) return [];
    const ids = c.kind === 'hub' ? this.idx.pack.quests.filter((q) => q.scope === 'hub').map((q) => q.id) : [...c.day.main_chain, ...c.day.side_quests, ...c.day.daily_pool];
    return ids.map((id) => this.idx.quests.get(id)).filter((q): q is Quest => !!q);
  }
  private stepOf(q: Quest): Step | null { const r = this.rec(q); return r.state === 'active' ? q.steps.find((s) => s.id === r.step_id) ?? null : null; }
  private ref(q: Quest, step: Step): StepRef { return { quest: q, step, index: q.steps.indexOf(step) }; }

  /** Bước đang chờ của mọi quest active trong bối cảnh hiện tại (Main trước). */
  activeSteps(): StepRef[] {
    return this.contextQuests().flatMap((q) => { const s = this.stepOf(q); return s ? [this.ref(q, s)] : []; });
  }
  mainStep(): StepRef | null {
    return this.activeSteps().find((r) => r.quest.type === 'main' || r.quest.type === 'event') ?? null;
  }
  openSideQuests(): Quest[] {
    if (this.ctx?.kind !== 'day') return [];
    return this.contextQuests().filter((q) => q.type === 'side' && ['available', 'active'].includes(this.rec(q).state));
  }
  /** Side/Daily trong Ngày hiện tại kèm trạng thái — cho sổ tay. */
  optionalQuests(): { quest: Quest; state: QuestState }[] {
    return this.contextQuests().filter((q) => q.type === 'side' || q.type === 'daily').map((quest) => ({ quest, state: this.rec(quest).state }));
  }

  // ---------- vào/ra bối cảnh ----------
  startDay(dayId: string, opts: { replay?: boolean } = {}): void {
    const day = this.idx.days.get(dayId);
    if (!day) throw new Error(`Không có Ngày ${dayId}`);
    const done = this.save.days[dayId]?.state === 'completed';
    const replay = !!opts.replay;
    if (replay && !done) throw new Error(`Chỉ chơi lại được Ngày đã xong (${dayId})`);
    if (!replay && done) throw new Error(`Ngày ${dayId} đã xong — dùng chế độ chơi lại`);
    this.presenting.clear();
    if (replay) {
      const quests: Record<string, QuestRecord> = {};
      for (const id of day.side_quests) if (this.save.quests[id]?.state === 'completed') quests[id] = { state: 'completed', step_id: null, progress: [] };
      this.save.current.replay = { memory_day_id: dayId, quests, flags: {} };
    } else {
      this.save.current.replay = null;
      // ảnh chụp câu chuyện lúc vào Ngày — để "Chơi lại Ngày từ đầu" khi đang dở không cộng dồn flag/sắc thái
      this.save.current.day_start = JSON.parse(JSON.stringify({ flags: this.save.flags, relationships: this.save.relationships }));
      this.save.days[dayId] = { state: 'in_progress', replayed: false };
      for (const id of [...day.main_chain, ...day.side_quests]) delete this.save.quests[id];
      for (const id of day.daily_pool) delete this.save.quests[`${id}@${dayId}`];
    }
    this.ctx = { kind: 'day', day, replay };
    this.phase = 'playing';
    this.bus.emit('day_started', { day_id: dayId, is_replay: replay, resumed: false });
    const first = this.idx.quests.get(day.main_chain[0]);
    if (first) this.startQuest(first);
    this.refreshAvailability();
    this.updatePointer();
    this.checkpoint('day_started');
  }

  /** Sau khi nạp file lưu: quay lại Ngày đang dở (nếu có). Trả 'hub' nếu không có gì dở. */
  resume(): 'day' | 'hub' {
    const cur = this.save.current;
    const day = cur.memory_day_id ? this.idx.days.get(cur.memory_day_id) : undefined;
    if (!day) return 'hub';
    const replay = cur.replay?.memory_day_id === day.id;
    if (!replay && this.save.days[day.id]?.state !== 'in_progress') { cur.memory_day_id = null; cur.quest_id = null; cur.step_id = null; return 'hub'; }
    this.ctx = { kind: 'day', day, replay };
    this.phase = 'playing';
    this.presenting.clear();
    this.bus.emit('day_started', { day_id: day.id, is_replay: replay, resumed: true });
    for (const r of this.activeSteps()) {
      this.rec(r.quest).progress = [];
      this.bus.emit('step_activated', { quest_id: r.quest.id, step_id: r.step.id, kind: r.step.kind, is_replay: replay, resumed: true });
    }
    this.refreshAvailability();
    const mainDone = day.main_chain.every((id) => this.questState(id) === 'completed');
    if (mainDone) this.afterMainChain(false);
    else if (!this.mainStep()) { const next = day.main_chain.map((id) => this.idx.quests.get(id)!).find((q) => this.rec(q).state !== 'completed'); if (next) this.startQuest(next); }
    this.updatePointer();
    return 'day';
  }

  /** Menu "Chơi lại Ngày từ đầu" khi đang ở trong một Ngày (lần đầu hoặc lượt xem lại). */
  restartDay(): boolean {
    if (this.ctx?.kind !== 'day') return false;
    const { day, replay } = this.ctx;
    const snap = this.save.current.day_start;
    if (!replay && snap) { this.save.flags = JSON.parse(JSON.stringify(snap.flags)); this.save.relationships = JSON.parse(JSON.stringify(snap.relationships)); }
    this.ctx = null;
    this.startDay(day.id, { replay });
    return true;
  }

  enterHub(): void {
    if (this.isReplay) this.abandonReplay();
    this.ctx = { kind: 'hub' };
    this.phase = 'idle';
    this.presenting.clear();
    this.refreshAvailability();
    this.checkpoint('hub_entered');
  }

  /** Bỏ dở lượt chơi lại: câu chuyện không đổi. */
  abandonReplay(): void {
    if (!this.isReplay) return;
    this.save.current = { memory_day_id: null, quest_id: null, step_id: null, replay: null };
    this.ctx = null;
    this.phase = 'idle';
    this.checkpoint('replay_abandoned');
  }

  /** PDE CONTACT mở một Present-day Quest. */
  unlockQuest(questId: string): boolean {
    const q = this.idx.quests.get(questId);
    if (!q || q.scope !== 'hub') return false;
    const saved = this.ctx;
    this.ctx = { kind: 'hub' };
    const ok = this.rec(q).state === 'locked';
    if (ok) this.startQuest(q);
    this.ctx = saved ?? { kind: 'hub' };
    if (ok) this.checkpoint('quest_unlocked');
    return ok;
  }

  // ---------- người chơi làm gì đó ----------
  /** Người chơi tương tác với một vật/nhân vật (`interact`) hoặc đi tới một điểm (`arrive`). */
  trigger(kind: TriggerKind, target: string): TriggerResult | null {
    if (!this.ctx || this.phase === 'ended') return null;
    const quests = this.contextQuests();
    for (const q of quests) {
      const step = this.stepOf(q);
      if (step && this.matches(q, step, kind, target)) return this.settle(this.apply(q, step, target));
    }
    if (this.ctx.kind !== 'day') return null;
    for (const q of quests) {
      if ((q.type !== 'side' && q.type !== 'daily') || this.rec(q).state !== 'available') continue;
      const first = q.steps[0];
      if (first && this.matches(q, first, kind, target)) { this.startQuest(q); return this.settle(this.apply(q, first, target)); }
    }
    return null;
  }

  /** Tương tác này có tác dụng không? (để hiện gợi ý phím) — không đổi trạng thái. */
  peek(kind: TriggerKind, target: string): boolean {
    if (!this.ctx || this.phase === 'ended') return false;
    return this.contextQuests().some((q) => {
      const r = this.records[this.key(q)];
      const s = r?.state === 'active' ? q.steps.find((x) => x.id === r.step_id) : r?.state === 'available' && (q.type === 'side' || q.type === 'daily') ? q.steps[0] : undefined;
      return !!s && this.matchesWith(s, kind, target, r?.progress ?? []);
    });
  }

  /** Các đích đang "có việc": đích của bước đang chờ + bước đầu của Side/Daily đang mở (để đánh dấu trong cảnh). */
  targetsOfInterest(): string[] {
    const out = new Set<string>();
    for (const q of this.contextQuests()) {
      const r = this.records[this.key(q)];
      const s = r?.state === 'active' ? q.steps.find((x) => x.id === r.step_id) : r?.state === 'available' && (q.type === 'side' || q.type === 'daily') ? q.steps[0] : undefined;
      if (!s) continue;
      if (s.kind === 'goto' || s.kind === 'interact' || s.kind === 'place') out.add(s.target);
      else if (s.kind === 'talk') out.add(s.with);
      else if (s.kind === 'collect') s.targets.filter((x) => !(r?.progress ?? []).includes(x)).forEach((x) => out.add(x));
    }
    return [...out];
  }

  private matches(q: Quest, s: Step, kind: TriggerKind, target: string): boolean {
    return this.matchesWith(s, kind, target, this.rec(q).progress);
  }
  private matchesWith(s: Step, kind: TriggerKind, target: string, progress: string[]): boolean {
    switch (s.kind) {
      case 'goto': return kind === 'arrive' && s.target === target;
      case 'interact': case 'place': return kind === 'interact' && s.target === target;
      case 'talk': return kind === 'interact' && s.with === target;
      case 'collect': return kind === 'interact' && s.targets.includes(target) && !progress.includes(target);
      default: return false;
    }
  }

  private apply(q: Quest, s: Step, target: string): TriggerResult {
    const ref = this.ref(q, s);
    if (s.kind === 'talk' || (s.kind === 'interact' && s.lines?.length)) { this.presenting.add(s.id); return { ref, action: 'present' }; }
    if (s.kind === 'collect') {
      const r = this.rec(q);
      r.progress.push(target);
      this.bus.emit('step_progress', { quest_id: q.id, step_id: s.id, done: r.progress.length, total: s.count, target });
      if (r.progress.length < s.count) {
        return { ref, action: 'progress' };
      }
    }
    this.finishStep(q, s);
    return { ref, action: 'completed' };
  }

  /** UI báo một bước trình bày đã xong (thoại, lựa chọn, ảnh, minigame, điện thoại…). */
  complete(stepId: string, result: StepResult = {}): boolean {
    const ref = this.idx.steps.get(stepId);
    if (!ref || !this.ctx) return false;
    const { quest: q, step: s } = ref;
    if (!this.contextQuests().includes(q)) return false;
    const r = this.rec(q);
    if (r.state !== 'active' || r.step_id !== stepId) return false;
    if (WORLD_ONLY.has(s.kind)) return false;
    if ((s.kind === 'talk' || s.kind === 'interact') && !this.presenting.has(stepId)) return false;
    if (s.kind === 'choice') {
      const opt = s.options.find((o) => o.id === result.option_id);
      if (!opt) return false;
      this.applyChoice(opt, s.about ?? []);
      this.bus.emit('choice_made', { step_id: s.id, choice_id: s.choice_id, option_id: opt.id, tone: opt.tone ?? null, measured: !!s.measured, is_replay: this.isReplay });
    }
    if (s.kind === 'compose_message') {
      const custom = typeof result.text === 'string' ? result.text.trim() : '';
      const opt = result.option_id ? s.openers.find((o) => o.id === result.option_id) : undefined;
      if (!opt && !custom) return false;
      if (opt) this.applyChoice(opt, []);
      if (!this.isReplay) {
        (this.save.phone[s.thread_id] ??= []).push(
          opt
            ? { kind: 'sent', step_id: s.id, option_id: opt.id }
            : { kind: 'sent', step_id: s.id, option_id: 'custom', custom_text: custom },
        );
      }
      this.bus.emit('message_sent', { quest_id: q.id, step_id: s.id, tone: opt?.tone ?? null });
    }
    this.presenting.delete(stepId);
    this.finishStep(q, s);
    this.checkpoint('step_boundary');
    return true;
  }

  /**
   * R-D5: lựa chọn chọn TRONG minigame (`step.choice`) — áp cờ + sắc thái quan hệ và phát `choice_made` y như bước `choice`.
   * Chỉ nhận khi bước minigame đó đang hoạt động; gọi trước `complete(stepId)`.
   */
  recordMinigameChoice(stepId: string, optionId: string): boolean {
    const ref = this.idx.steps.get(stepId);
    if (!ref || !this.ctx || ref.step.kind !== 'minigame' || !ref.step.choice) return false;
    const { quest: q, step: s } = ref;
    if (!this.contextQuests().includes(q)) return false;
    const r = this.rec(q);
    if (r.state !== 'active' || r.step_id !== stepId) return false;
    const c = s.choice!;
    const opt = c.options.find((o) => o.id === optionId);
    if (!opt) return false;
    this.applyChoice(opt, c.about ?? []);
    this.bus.emit('choice_made', { step_id: s.id, choice_id: c.choice_id, option_id: opt.id, tone: opt.tone ?? null, measured: !!c.measured, is_replay: this.isReplay });
    return true;
  }

  private applyChoice(opt: ChoiceOption, about: string[]) {
    for (const [f, v] of Object.entries(opt.set_flags ?? {})) this.setFlag(f, v);
    if (!opt.tone || this.isReplay) return;
    for (const a of about) {
      const chr = this.idx.resolveActor(a);
      if (!chr) continue;
      const rel = (this.save.relationships[chr.id] ??= { character_id: chr.id, flags: {}, tone_counts: { playful: 0, gentle: 0, deep: 0 }, arc_progress: {}, bond: null, contacted_2026: false });
      rel.tone_counts[opt.tone] = (rel.tone_counts[opt.tone] ?? 0) + 1; // ?? 0: bản lưu cũ còn khóa "curious"
    }
  }

  // ---------- chuyển trạng thái ----------
  private setState(q: Quest, state: QuestState) {
    const r = this.rec(q);
    if (r.state === state) return;
    r.state = state;
    if (state !== 'active') { r.step_id = null; r.progress = []; }
    this.bus.emit('quest_state', { quest_id: q.id, state, is_replay: this.isReplay });
  }

  private startQuest(q: Quest) {
    this.setState(q, 'active');
    this.bus.emit('quest_started', { quest_id: q.id, quest_type: q.type, memory_day_id: this.dayId, is_replay: this.isReplay });
    if (q.steps[0]) this.activateStep(q, q.steps[0]);
  }

  private activateStep(q: Quest, s: Step) {
    const r = this.rec(q);
    r.step_id = s.id; r.progress = [];
    const part = q.parts?.find((p) => p.first_step_id === s.id);
    if (part) this.bus.emit('part_started', { quest_id: q.id, part_id: part.id });
    this.bus.emit('step_activated', { quest_id: q.id, step_id: s.id, kind: s.kind, is_replay: this.isReplay, resumed: false });
    if (s.kind === 'setFlag') { this.setFlag(s.flag, s.value); this.finishStep(q, s); }
  }

  private finishStep(q: Quest, s: Step) {
    this.bus.emit('step_completed', { quest_id: q.id, step_id: s.id, kind: s.kind, quest_type: q.type, memory_day_id: this.dayId, is_replay: this.isReplay });
    const next = q.steps[q.steps.indexOf(s) + 1];
    if (next) this.activateStep(q, next); else this.completeQuest(q);
    this.refreshAvailability();
    this.updatePointer();
  }

  private completeQuest(q: Quest) {
    for (const [f, v] of Object.entries(q.rewards?.flags ?? {})) this.setFlag(f, v);
    this.setState(q, 'completed');
    // Chơi lại: Side/Daily vừa làm xong được ghi vào câu chuyện (bổ sung, không đổi flag).
    if (this.isReplay && (q.type === 'side' || q.type === 'daily')) this.save.quests[this.key(q)] = { state: 'completed', step_id: null, progress: [] };
    this.bus.emit('quest_completed', { quest_id: q.id, quest_type: q.type, memory_day_id: this.dayId, is_replay: this.isReplay });
    this.refreshAvailability();
    if (this.ctx?.kind === 'day' && (q.type === 'main' || q.type === 'event')) {
      const chain = this.ctx.day.main_chain;
      const next = this.idx.quests.get(chain[chain.indexOf(q.id) + 1] ?? '');
      if (next) this.startQuest(next); else this.afterMainChain(true);
    }
  }

  private refreshAvailability() {
    if (!this.ctx) return;
    for (const q of this.contextQuests()) {
      if (this.rec(q).state !== 'locked') continue;
      if (this.ctx.kind === 'hub') {
        const isIntro = q.id === this.idx.pack.hub.intro_quest_id;
        if (isIntro || (q.available_when && evalCondition(q.available_when, this.conditions))) this.startQuest(q);
      } else if ((q.type === 'side' || q.type === 'daily') && evalCondition(q.available_when, this.conditions)) this.setState(q, 'available');
    }
  }

  private afterMainChain(announce: boolean) {
    if (this.ctx?.kind !== 'day') return;
    const day = this.ctx.day;
    if (announce) this.bus.emit('main_chain_completed', { day_id: day.id, is_replay: this.isReplay });
    const open = this.openSideQuests();
    if (!open.length) { this.endDay(); return; }
    this.phase = 'end_prompt';
    this.bus.emit('day_end_prompt', { day_id: day.id, open_side_quests: open.map((q) => q.id) });
  }

  /** Lời nhắc kết ngày (còn Side mở): Đi tiếp = 'leave', Ở lại = 'stay'. */
  answerEndPrompt(answer: 'leave' | 'stay'): void {
    if (this.phase !== 'end_prompt' || this.ctx?.kind !== 'day') return;
    this.bus.emit('day_end_answered', { day_id: this.ctx.day.id, answer, open_side_quests: this.openSideQuests().length });
    if (answer === 'leave') this.endDay(); else this.phase = 'free_after_main';
    this.checkpoint('day_end_answered');
  }

  /** Người chơi đã "Ở lại" và giờ muốn kết Ngày. */
  requestEndDay(): void {
    if (this.phase === 'free_after_main' || this.phase === 'end_prompt') { this.endDay(); this.checkpoint('day_ended'); }
  }

  private endDay() {
    if (this.ctx?.kind !== 'day') return;
    const { day, replay } = this.ctx;
    if (!replay) {
      for (const q of this.contextQuests()) if ((q.type === 'side' || q.type === 'daily') && this.rec(q).state !== 'completed') this.setState(q, 'missed');
      this.save.days[day.id] = { state: 'completed', replayed: this.save.days[day.id]?.replayed ?? false };
    } else {
      this.save.days[day.id] = { state: 'completed', replayed: true };
    }
    this.save.current = { memory_day_id: null, quest_id: null, step_id: null, replay: null };
    this.ctx = null;
    this.phase = 'ended';
    this.presenting.clear();
    this.bus.emit('day_completed', { day_id: day.id, is_replay: replay });
  }

  /** Trạng thái đã yên sau một thao tác → báo để tự lưu (ranh giới bước, đầu phần Event, về Hub). */
  private checkpoint(reason: string) { this.bus.emit('save_requested', { reason }); }
  private settle(r: TriggerResult): TriggerResult { if (r.action !== 'present') this.checkpoint('step_boundary'); return r; }

  private updatePointer() {
    if (this.ctx?.kind !== 'day') return;
    const m = this.mainStep();
    this.save.current.memory_day_id = this.ctx.day.id;
    this.save.current.quest_id = m?.quest.id ?? null;
    this.save.current.step_id = m?.step.id ?? null;
  }
}
