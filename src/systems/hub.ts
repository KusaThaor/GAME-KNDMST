/**
 * Hub 2026 (F7) — phần logic: Hộp Kỷ Vật, kệ, bộ chạy Present-day Event, tin nhắn trong điện thoại.
 * Phòng 3D và UI chỉ đọc từ đây. Tông phòng (D-13) lấy từ config/hub.ts.
 */
import { hubLightPresetName, type HubConfig } from '../config/hub';
import type { ContentIndex } from '../content/indexContent';
import type { Artifact, DialogueLine, Milestone } from '../content/types';
import { evalCondition } from '../core/conditions';
import type { EventBus } from '../core/eventBus';
import type { ArtifactState, SaveState } from '../core/save';
import type { AlbumModel } from './album';
import type { QuestEngine } from './questEngine';

export type PdePresentation =
  | { kind: 'album_restore'; pde_id: string; page_id: string; granted: string[] }
  | { kind: 'shelf'; pde_id: string; artifact_id: string }
  | { kind: 'fragment'; pde_id: string; album_entry_id: string; recall: DialogueLine[] }
  | { kind: 'contact'; pde_id: string; quest_id: string }
  | { kind: 'reply'; pde_id: string; thread_id: string };

export interface ThreadMessage { speaker: string; text: string; origin: 'history' | 'sent' | 'reply' }

export class HubModel {
  private readonly idx: ContentIndex;
  private readonly save: SaveState;
  private readonly bus: EventBus;
  private readonly engine: QuestEngine;
  private readonly album: AlbumModel;
  private readonly config: HubConfig;

  constructor(deps: { idx: ContentIndex; save: SaveState; bus: EventBus; engine: QuestEngine; album: AlbumModel; config: HubConfig }) {
    this.idx = deps.idx; this.save = deps.save; this.bus = deps.bus; this.engine = deps.engine; this.album = deps.album; this.config = deps.config;
  }

  private dayDone(id: string) { return this.save.days[id]?.state === 'completed'; }
  private introDone() { return this.save.quests[this.idx.pack.hub.intro_quest_id]?.state === 'completed'; }
  private releaseArtifacts(): Artifact[] {
    return this.idx.releaseDays.map((d) => this.idx.artifactOfDay(d.id)).filter((a): a is Artifact => !!a);
  }

  /** Ngăn của một Mốc mở khi: đã xong phần mở đầu và đã xong mọi Ngày (thuộc bản phát hành) của các Mốc trước. */
  private compartmentOpen(m: Milestone): boolean {
    if (!this.introDone()) return false;
    return this.idx.releaseDays.every((d) => {
      const dm = this.idx.pack.milestones.find((x) => x.id === this.idx.milestoneOfDay(d.id));
      return !dm || dm.box_compartment >= m.box_compartment || this.dayDone(d.id);
    });
  }

  /** Tính lại trạng thái kỷ vật: hidden → dim → glowing → visited → on_shelf. Kỷ vật sáng theo thứ tự thời gian. */
  refresh(): void {
    const nextDay = this.idx.releaseDays.find((d) => !this.dayDone(d.id));
    for (const a of this.releaseArtifacts()) {
      const m = this.idx.pack.milestones.find((x) => x.id === this.idx.milestoneOfDay(a.target_memory_day_id));
      let state: ArtifactState;
      if (this.save.artifacts[a.id] === 'on_shelf') state = 'on_shelf';
      else if (this.dayDone(a.target_memory_day_id)) state = 'visited';
      else if (!m || !this.compartmentOpen(m)) state = 'hidden';
      else state = nextDay?.id === a.target_memory_day_id && evalCondition(a.appear_when, this.engine.conditions) ? 'glowing' : 'dim';
      this.save.artifacts[a.id] = state;
    }
  }
  compartments(): { milestone: Milestone; open: boolean; artifacts: { artifact: Artifact; state: ArtifactState }[] }[] {
    const arts = this.releaseArtifacts();
    return [...this.idx.pack.milestones].sort((a, b) => a.box_compartment - b.box_compartment).map((milestone) => ({
      milestone, open: this.compartmentOpen(milestone),
      artifacts: arts.filter((a) => this.idx.milestoneOfDay(a.target_memory_day_id) === milestone.id).map((artifact) => ({ artifact, state: this.save.artifacts[artifact.id] ?? 'hidden' })),
    }));
  }

  shelf(): Artifact[] { return this.releaseArtifacts().filter((a) => this.save.artifacts[a.id] === 'on_shelf'); }

  /** 'first' = vào Ngày lần đầu; 'replay' = xem lại ký ức (từ kệ); null = chưa mở được. */
  canOpen(artifactId: string): 'first' | 'replay' | null {
    const s = this.save.artifacts[artifactId];
    if (!this.releaseArtifacts().some((a) => a.id === artifactId)) return null;
    return s === 'glowing' ? 'first' : s === 'visited' || s === 'on_shelf' ? 'replay' : null;
  }

  openArtifact(artifactId: string): { day_id: string; replay: boolean } | null {
    const mode = this.canOpen(artifactId);
    const a = this.idx.artifacts.get(artifactId);
    if (!mode || !a) return null;
    const replay = mode === 'replay';
    this.bus.emit('artifact_opened', { artifact_id: a.id, memory_day_id: a.target_memory_day_id, is_replay: replay });
    return { day_id: a.target_memory_day_id, replay };
  }

  /** Chạy các Present-day Event tới hạn (khi về Hub hoặc sau một việc ở Hub). Trả về thứ UI cần trình diễn, theo thứ tự. */
  runPdes(): PdePresentation[] {
    const out: PdePresentation[] = [];
    for (let pass = 0; pass < 8; pass++) {
      let fired = false;
      for (const pde of this.idx.pack.pdes) {
        if (this.save.pde_done.includes(pde.id) || !pde.effects.length) continue;
        if (!evalCondition(pde.trigger, this.engine.conditions)) continue;
        for (const fx of pde.effects) {
          if (fx.kind === 'restore_page') out.push({ kind: 'album_restore', pde_id: pde.id, page_id: fx.page_id, granted: this.album.restorePage(fx.page_id) });
          else if (fx.kind === 'shelf_artifact') { this.save.artifacts[fx.artifact_id] = 'on_shelf'; out.push({ kind: 'shelf', pde_id: pde.id, artifact_id: fx.artifact_id }); }
          else if (fx.kind === 'add_fragment') { this.album.grant(fx.album_entry_id); out.push({ kind: 'fragment', pde_id: pde.id, album_entry_id: fx.album_entry_id, recall: fx.recall ?? [] }); }
          else if (fx.kind === 'unlock_quest') { this.engine.unlockQuest(fx.quest_id); out.push({ kind: 'contact', pde_id: pde.id, quest_id: fx.quest_id }); }
          else if (fx.kind === 'message') { (this.save.phone[fx.thread_id] ??= []).push({ kind: 'pde', pde_id: pde.id }); out.push({ kind: 'reply', pde_id: pde.id, thread_id: fx.thread_id }); }
        }
        this.save.pde_done.push(pde.id);
        this.bus.emit('pde_fired', { pde_id: pde.id, type: pde.type });
        fired = true;
      }
      if (!fired) break;
    }
    if (out.length) { this.refresh(); this.bus.emit('save_requested', { reason: 'pde' }); }
    return out;
  }

  /** Tin trong một nhóm chat: tin cũ (nội dung) + tin đã gửi + tin trả lời — dựng lại từ ID trong file lưu. */
  threadMessages(threadId: string): ThreadMessage[] {
    const thread = this.idx.pack.hub.threads.find((t) => t.id === threadId);
    if (!thread) return [];
    const out: ThreadMessage[] = thread.history.map((l) => ({ speaker: l.speaker, text: l.text, origin: 'history' }));
    for (const m of this.save.phone[threadId] ?? []) {
      if (m.kind === 'sent') {
        if (m.custom_text) out.push({ speaker: 'player', text: m.custom_text, origin: 'sent' });
        else {
          const s = this.idx.steps.get(m.step_id)?.step;
          const opt = s?.kind === 'compose_message' ? s.openers.find((o) => o.id === m.option_id) : undefined;
          if (opt) out.push({ speaker: 'player', text: opt.text, origin: 'sent' });
        }
      } else {
        for (const fx of this.idx.pack.pdes.find((p) => p.id === m.pde_id)?.effects ?? []) {
          if (fx.kind === 'message' && fx.thread_id === threadId) out.push(...fx.lines.map((l) => ({ speaker: l.speaker, text: l.text, origin: 'reply' as const })));
        }
      }
    }
    return out;
  }

  /** Tên preset ánh sáng phòng theo số Ngày đã xong (D-13, cấu hình). */
  lightingPreset(): string {
    return hubLightPresetName(this.config, this.idx.releaseDays.filter((d) => this.dayDone(d.id)).length);
  }
}
