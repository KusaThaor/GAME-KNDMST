/**
 * Viết luật Căn cứ — Trang 3 bước 4 · K4 (GDD `02` §2.4.6: "Ghép mảnh câu thành 5 quy tắc"; kịch bản:
 * "ghi từng điều vào sổ theo lượt"). Mỗi lượt sổ hiện nửa đầu một điều, người chơi chọn nửa sau.
 * Chữ **nguyên văn** kịch bản `KICH_BAN_DEMO_M1_M2_v1.md` Trang 3 bước 4; chỉ cắt đôi câu, và bỏ dấu "…" ngập ngừng
 * ở đầu câu của Quân. Không có thua; chọn sai thì thẻ rung và tính một lần sai (`hints_used`).
 */
import { createRng, shuffle } from '../../../core/random';
import { MG_FONT, MG_INK, MG_RED } from '../shared/canvasStage';
import { createMinigameLoop } from '../shared/loopLifecycle';
import type { MinigameModule, MinigameResult } from '../types';

export const RULES = {
  /** Theo đúng lượt nói trong kịch bản. `by: null` = Player. */
  lines: [
    { by: 'Châu', head: 'không tự lấy đồ', tail: 'của người khác.' },
    { by: 'Đức', head: 'đứa nào ăn hết đồ ăn', tail: 'thì tự giác mua thêm!' },
    { by: 'Quân', head: 'Ai tới trước', tail: 'thì dọn chỗ ngồi.' },
    { by: 'Hạ', head: 'Nếu có ai buồn thì…', tail: 'mọi người đừng bỏ bạn đó ở lại một mình nha.' },
    { by: null, head: 'chụp ảnh', tail: 'thì phải đủ người.' },
  ] as { by: string | null; head: string; tail: string }[],
  /** Bìa sổ (kỷ vật Trang 3: "cuốn sổ bìa xanh ghi LUẬT"). */
  cover: 'LUẬT',
  finishDelayMs: 1400,
} as const;

/** "Điều N: <nửa đầu> <nửa sau>" — đúng cách kịch bản đọc từng điều. */
export const ruleText = (i: number) => `Điều ${i + 1}: ${RULES.lines[i].head} ${RULES.lines[i].tail}`;

/** Luật thuần (không DOM). */
export class RulesLogic {
  /** Thứ tự thẻ nửa sau hiện trên bàn (chỉ số trong RULES.lines), đã xáo. */
  readonly cards: number[];
  /** Số điều đã ghi xong (= lượt hiện tại). */
  turn = 0;
  mistakes = 0;

  constructor(seed: number) {
    this.cards = shuffle(RULES.lines.map((_, i) => i), createRng(seed));
  }

  get done() { return this.turn >= RULES.lines.length; }
  used(card: number) { return card < this.turn; }

  /** Chọn thẻ nửa sau `card` cho điều đang ghi. */
  pick(card: number): 'ok' | 'wrong' | 'ignored' {
    if (this.done || this.used(card) || card < 0 || card >= RULES.lines.length) return 'ignored';
    if (card !== this.turn) { this.mistakes++; return 'wrong'; }
    this.turn++;
    return 'ok';
  }

  result(): MinigameResult { return { result: 'complete', hints_used: this.mistakes }; }
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export default {
  id: 'mg_rules',
  title: 'Luật Căn cứ',
  kind: 'K4',
  rules: { lines: [
    'Cả nhóm nói từng điều theo lượt; sổ đã ghi nửa đầu.',
    'Chọn mảnh câu ghép đúng nửa sau của điều đang ghi. Đủ 5 điều là xong.',
    'Bàn phím: ←/→ chọn mảnh, Enter ghép (hoặc phím 1–5).',
  ] },
  mount(el, ctx) {
    const logic = new RulesLogic(ctx.seed);
    let col = 0, shake = -1;

    const root = document.createElement('div');
    root.dataset.testid = 'mg-rules';
    root.style.cssText = 'display:flex;flex-direction:column;gap:12px;user-select:none';
    el.append(root);

    const loop = createMinigameLoop({
      onFinish: ctx.onFinish,
      onDispose: () => root.remove(),
    });

    const pick = (slot: number) => {
      if (loop.paused || logic.done) return;
      const r = logic.pick(logic.cards[slot]);
      shake = r === 'wrong' ? slot : -1;
      if (r === 'ok') {
        const free = logic.cards.findIndex(c => !logic.used(c));
        col = free < 0 ? 0 : free;
        if (logic.done) loop.scheduleFinish(RULES.finishDelayMs, () => logic.result());
      }
      render();
    };

    const render = () => {
      const lines = RULES.lines.map((l, i) => {
        const by = l.by ?? 'Bạn';
        if (i < logic.turn) return `<li data-done="1"><b>Điều ${i + 1}:</b> ${esc(l.head)} ${esc(l.tail)}</li>`;
        if (i === logic.turn) return `<li style="background:#fff3c4;border-radius:6px;padding:0 6px"><b>Điều ${i + 1}:</b> ${esc(l.head)} <span style="display:inline-block;min-width:120px;border-bottom:2px dashed ${MG_INK}">&nbsp;</span>
          <span style="font-size:13px;font-weight:800;margin-left:6px;padding:1px 8px;border-radius:999px;background:rgba(58,44,38,.12)">${esc(by)}</span></li>`;
        return `<li style="opacity:.35"><b>Điều ${i + 1}:</b> …</li>`;
      }).join('');
      const cards = logic.cards.map((c, slot) => {
        const used = logic.used(c);
        return `<button data-slot="${slot}" ${used || logic.done ? 'disabled' : ''} style="text-align:left;font-size:16px;line-height:1.3;
          ${slot === col && !logic.done ? `box-shadow:0 0 0 3px ${MG_INK};background:#ffd978;` : ''}
          ${slot === shake ? `border-color:${MG_RED};color:${MG_RED};animation:mgRulesShake .3s;` : ''}
          ${used ? 'visibility:hidden;' : ''}">${esc(RULES.lines[c].tail)}</button>`;
      }).join('');
      root.innerHTML = `
        <style>@keyframes mgRulesShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}</style>
        <div style="display:flex;border:2px solid ${MG_INK};border-radius:10px;overflow:hidden">
          <div style="width:38px;background:#3d6fa8;color:#fff;font:800 14px ${MG_FONT};writing-mode:vertical-rl;text-align:center;padding:8px 0;letter-spacing:4px">${RULES.cover}</div>
          <ol style="list-style:none;margin:0;padding:10px 12px;flex:1;display:flex;flex-direction:column;gap:6px;font-size:16px;line-height:1.5;
            background:#fffaf0 repeating-linear-gradient(transparent 0 29px,#cfe0f0 29px 30px)">${lines}</ol>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${cards}</div>`;
    };

    loop.on(root, 'click', e => {
      const b = (e.target as HTMLElement).closest('button');
      if (b?.dataset.slot) { col = Number(b.dataset.slot); pick(col); }
    });
    const onKey = (e: KeyboardEvent) => {
      if (loop.paused || logic.done || e.repeat) return;
      const free = logic.cards.map((c, slot) => ({ c, slot })).filter(o => !logic.used(o.c)).map(o => o.slot);
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        const d = e.code === 'ArrowLeft' || e.code === 'ArrowUp' ? -1 : 1;
        col = free[(free.indexOf(col) + d + free.length) % free.length] ?? col;
        shake = -1;
        render();
      } else if (e.code === 'Enter' || e.code === 'Space') pick(col);
      else if (/^(Digit|Numpad)[1-5]$/.test(e.code)) pick(Number(e.code.slice(-1)) - 1);
      else return;
      e.preventDefault();
    };
    loop.on(window, 'keydown', onKey);
    render();

    return loop.instance;
  },
} satisfies MinigameModule;
