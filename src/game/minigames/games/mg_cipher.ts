/**
 * Giải mật lệnh — Trang 1 bước 2 · K4 (GDD `02` §2.4.6).
 * Đức vẽ mật lệnh bằng ký hiệu; người chơi ghép 6 ký hiệu với 6 chữ cái. Ghép sai thì Châu gạch bút đỏ
 * và khoanh chữ đúng (gợi ý). Không có thua. Kịch bản: "mật lệnh chỉ là lời rủ đá cầu giờ ra chơi".
 */
import type { MinigameModule, MinigameResult } from '../types';

export const CIPHER = {
  /** Lời giải: "giờ ra chơi" (kịch bản Trang 1 bước 2) — đúng 6 chữ cái khác nhau. Hình quả cầu vẽ kèm. */
  message: 'RA CHƠI',
  /** "Tài liệu gì toàn hình tròn hình vuông vậy trời?" */
  symbols: ['○', '□', '△', '☆', '♡', '✕'],
  /** Số ô trong bảng khóa nguệch ngoạc của Đức bị lem mực — phải tự suy ra từ mật lệnh. */
  blotted: 2,
  /** Phím gõ tắt cho chữ có dấu. */
  keyAlias: { O: 'Ơ' } as Record<string, string>,
  finishDelayMs: 1200,
} as const;

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const shuffle = <T>(list: readonly T[], rand: () => number) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

export type CipherTry = 'ok' | 'wrong' | 'ignored';

/** Luật thuần (không DOM) để test. */
export class CipherLogic {
  /** Chữ cái theo thứ tự hiện trên hàng chọn (đã xáo). */
  readonly letters: string[];
  /** Ký hiệu theo thứ tự xuất hiện trong mật lệnh. */
  readonly symbols: string[];
  /** Ký hiệu → chữ đúng. */
  readonly key = new Map<string, string>();
  /** Ký hiệu → chữ đã ghép đúng. */
  readonly solved = new Map<string, string>();
  /** Ký hiệu → các chữ đã bị Châu gạch. */
  readonly struck = new Map<string, Set<string>>();
  /** Ký hiệu có ô khóa bị lem. */
  readonly blots = new Set<string>();
  hints = 0;

  constructor(seed: number) {
    const rand = rng(seed);
    const unique = [...new Set([...CIPHER.message].filter(c => c !== ' '))];
    const symbols = shuffle(CIPHER.symbols, rand).slice(0, unique.length);
    unique.forEach((letter, i) => this.key.set(symbols[i], letter));
    this.symbols = symbols;
    this.letters = shuffle(unique, rand);
    for (const s of shuffle(symbols, rand).slice(0, CIPHER.blotted)) this.blots.add(s);
  }

  /** Mật lệnh dạng ký hiệu; khoảng trắng giữ nguyên. */
  get encoded() {
    const back = new Map([...this.key].map(([s, l]) => [l, s]));
    return [...CIPHER.message].map(c => (c === ' ' ? ' ' : back.get(c)!));
  }

  get done() { return this.solved.size === this.key.size; }

  /** Ký hiệu đang có gợi ý (đã ghép sai ít nhất một lần, chưa giải). */
  hinted(symbol: string) { return !this.solved.has(symbol) && (this.struck.get(symbol)?.size ?? 0) > 0; }

  isUsed(letter: string) { return [...this.solved.values()].includes(letter); }

  try(symbol: string, letter: string): CipherTry {
    if (this.done || !this.key.has(symbol) || this.solved.has(symbol) || this.isUsed(letter)) return 'ignored';
    if (this.key.get(symbol) === letter) { this.solved.set(symbol, letter); return 'ok'; }
    const set = this.struck.get(symbol) ?? new Set<string>();
    if (set.has(letter)) return 'ignored';
    set.add(letter);
    this.struck.set(symbol, set);
    this.hints++;
    return 'wrong';
  }

  result(): MinigameResult { return { result: 'complete', hints_used: this.hints }; }
}

const INK = '#3a2c26', RED = '#d8332a', PAPER = '#fffaf0';

const shuttlecock = `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
  <path d="M12 6 L20 26 L28 6 Z" fill="none" stroke="${INK}" stroke-width="2"/>
  <path d="M16 6 L20 26 M24 6 L20 26" stroke="${INK}" stroke-width="1.5"/>
  <circle cx="20" cy="30" r="6" fill="${RED}" stroke="${INK}" stroke-width="2"/></svg>`;

export default {
  id: 'mg_cipher',
  title: 'Giải mật lệnh',
  kind: 'K4',
  rules: { lines: [
    'Mỗi ký hiệu trong mật lệnh của Đức là một chữ cái.',
    'Chọn ký hiệu rồi chọn chữ cái hợp với nó (chuột, hoặc phím mũi tên + Enter).',
    'Ghép sai thì Châu gạch bút đỏ và khoanh chữ đúng.',
  ] },
  mount(el, ctx) {
    const logic = new CipherLogic(ctx.seed);
    let paused = false, finished = false, pending = false;
    let timer = 0;
    let sel = logic.symbols[0];
    let row: 'symbols' | 'letters' = 'symbols';
    let col = 0;

    const root = document.createElement('div');
    root.dataset.testid = 'mg-cipher';
    root.style.cssText = `display:flex;flex-direction:column;gap:12px;align-items:center;user-select:none;`;
    el.append(root);

    const finish = () => {
      if (finished) return;
      if (paused) { pending = true; return; }
      finished = true;
      ctx.onFinish(logic.result());
    };

    const pick = (letter: string) => {
      if (paused || logic.done) return;
      if (logic.try(sel, letter) === 'ok') {
        const next = logic.symbols.find(s => !logic.solved.has(s));
        if (next) sel = next;
        else timer = window.setTimeout(finish, CIPHER.finishDelayMs);
      }
      render();
    };

    const render = () => {
      const enc = logic.encoded;
      const legend = logic.symbols.map(s => logic.blots.has(s)
        ? `<span style="display:inline-block;width:30px;height:22px;border-radius:50%;background:${INK};opacity:.75;filter:blur(1.5px)"></span>`
        : `<span style="display:inline-block;transform:rotate(${(s.charCodeAt(0) % 7) - 3}deg);font:italic 17px 'Comic Sans MS',cursive;opacity:.6">${s}=${logic.key.get(s)}</span>`).join(' ');
      const cells = enc.map(s => {
        if (s === ' ') return '<span style="width:14px"></span>';
        const on = !logic.done && s === sel && row === 'symbols';
        const got = logic.solved.get(s) ?? '';
        return `<button data-sym="${s}" style="width:52px;padding:4px 0;display:flex;flex-direction:column;align-items:center;gap:2px;
          background:${on ? '#ffd978' : '#fff7e2'};box-shadow:${s === sel && !logic.done ? `0 0 0 3px ${INK}` : 'none'}">
          <span style="font-size:26px;line-height:1">${s}</span>
          <b style="font-size:22px;min-height:26px;border-top:2px dashed ${INK};width:34px;text-align:center">${got}</b></button>`;
      }).join('');
      const struck = logic.struck.get(sel) ?? new Set<string>();
      const hint = logic.hinted(sel) ? logic.key.get(sel) : null;
      const letters = logic.letters.map((l, i) => {
        const used = logic.isUsed(l), x = struck.has(l), on = row === 'letters' && i === col;
        return `<button data-letter="${l}" ${used || logic.done ? 'disabled' : ''} style="position:relative;width:52px;height:52px;font-size:24px;
          background:${on ? '#ffd978' : '#fff7e2'};${hint === l ? `outline:3px solid ${RED};outline-offset:3px;border-radius:50%;` : ''}">
          ${l}${x ? `<span style="position:absolute;left:6px;right:6px;top:50%;height:3px;background:${RED};transform:rotate(-20deg)"></span>` : ''}</button>`;
      }).join('');
      root.innerHTML = `
        <div style="background:${PAPER};border:2px solid ${INK};border-radius:12px;padding:12px 14px;width:100%;
          background-image:repeating-linear-gradient(transparent 0 27px, #cfe0f0 27px 28px);display:flex;flex-direction:column;gap:10px;align-items:center">
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${cells}</div>
          ${logic.done ? `<div data-testid="mg-cipher-solved" style="display:flex;align-items:center;gap:8px;font:800 26px Nunito,sans-serif">${CIPHER.message} ${shuttlecock}</div>` : ''}
          <div style="font-size:16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center">${legend}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${letters}</div>`;
    };

    root.addEventListener('click', e => {
      if (paused) return;
      const b = (e.target as HTMLElement).closest('button');
      if (!b) return;
      if (b.dataset.sym && !logic.solved.has(b.dataset.sym)) { sel = b.dataset.sym; row = 'symbols'; render(); }
      else if (b.dataset.letter) { col = logic.letters.indexOf(b.dataset.letter); pick(b.dataset.letter); }
    });

    const onKey = (e: KeyboardEvent) => {
      if (paused || logic.done || e.repeat) return;
      const open = logic.symbols.filter(s => !logic.solved.has(s));
      const alias = CIPHER.keyAlias[e.key.toUpperCase()] ?? e.key.toUpperCase();
      if (logic.letters.includes(alias)) { col = logic.letters.indexOf(alias); pick(alias); return; }
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') row = row === 'symbols' ? 'letters' : 'symbols';
      else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        const d = e.code === 'ArrowLeft' ? -1 : 1;
        if (row === 'symbols') sel = open[(open.indexOf(sel) + d + open.length) % open.length] ?? sel;
        else col = (col + d + logic.letters.length) % logic.letters.length;
      } else if (e.code === 'Enter' || e.code === 'Space') {
        if (row === 'symbols') row = 'letters';
        else pick(logic.letters[col]);
        e.preventDefault();
        return;
      } else return;
      e.preventDefault();
      render();
    };
    window.addEventListener('keydown', onKey);
    render();

    return {
      pause() { paused = true; },
      resume() { paused = false; if (pending) { pending = false; finish(); } },
      dispose() { clearTimeout(timer); window.removeEventListener('keydown', onKey); root.remove(); },
    };
  },
} satisfies MinigameModule;
