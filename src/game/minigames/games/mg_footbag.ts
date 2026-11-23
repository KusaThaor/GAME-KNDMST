/**
 * Đá cầu — Trang 1 bước 3 · K5 canh nhịp (GDD `02` §2.4.1).
 * Cầu bay tới, vòng quanh điểm rơi thu nhỏ dần; bấm Space/click khi vòng trùng vòng đích.
 * Thắng: 10 lượt chuyền liên tiếp không hụt · Thua: hụt 3 lần. Dù thắng hay thua, lượt cuối Đức đá hụt,
 * cầu bay vào bụi cây (kịch bản Trang 1 bước 3) — trò diễn cảnh đó rồi mới báo kết quả.
 */
import type { MinigameModule, MinigameResult } from '../types';

export const FOOTBAG = {
  perfectMs: 80,
  goodMs: 160,
  /** Bấm sớm hơn mức này so với điểm rơi thì bỏ qua (chưa tính là hụt). */
  earlyIgnoreMs: 480,
  winStreak: 10,
  maxMisses: 3,
  /** Khoảng cách giữa hai lượt: 1,4 giây → 0,9 giây theo chuỗi chuyền. */
  gapStartMs: 1400,
  gapEndMs: 900,
  leadInMs: 1500,
  /** Cảnh Đức đá hụt, cầu bay vào bụi cây. */
  outroMs: 1300,
} as const;

export type Judge = 'perfect' | 'good' | 'miss';

/** Luật thuần (thời gian tính bằng ms của đồng hồ trò, đã trừ lúc tạm dừng). */
export class FootbagLogic {
  streak = 0;
  best = 0;
  misses = 0;
  passes = 0;
  state: 'playing' | 'win' | 'lose' = 'playing';
  /** Lúc cầu chạm điểm rơi của lượt hiện tại. */
  target: number;
  /** Lúc người chơi chuyền lượt trước (đầu chu kỳ bay đi – bay về). */
  prevTarget: number;
  last: { judge: Judge; at: number } | null = null;

  constructor(start = 0) {
    this.target = start + FOOTBAG.leadInMs;
    this.prevTarget = this.target - this.gap();
  }

  gap() {
    const k = Math.min(this.streak, FOOTBAG.winStreak - 1) / (FOOTBAG.winStreak - 1);
    return FOOTBAG.gapStartMs + (FOOTBAG.gapEndMs - FOOTBAG.gapStartMs) * k;
  }

  static judge(deltaMs: number): Judge {
    const d = Math.abs(deltaMs);
    return d <= FOOTBAG.perfectMs ? 'perfect' : d <= FOOTBAG.goodMs ? 'good' : 'miss';
  }

  press(t: number): Judge | null {
    if (this.state !== 'playing' || t < this.target - FOOTBAG.earlyIgnoreMs) return null;
    const j = FootbagLogic.judge(t - this.target);
    this.resolve(j, t);
    return j;
  }

  /** Gọi mỗi khung hình: cầu rơi quá cửa sổ mà chưa bấm = hụt. */
  update(t: number): Judge | null {
    if (this.state !== 'playing' || t <= this.target + FOOTBAG.goodMs) return null;
    this.resolve('miss', t);
    return 'miss';
  }

  private resolve(judge: Judge, at: number) {
    this.last = { judge, at };
    if (judge === 'miss') {
      this.misses++;
      this.streak = 0;
      if (this.misses >= FOOTBAG.maxMisses) this.state = 'lose';
    } else {
      this.streak++;
      this.passes++;
      this.best = Math.max(this.best, this.streak);
      if (this.streak >= FOOTBAG.winStreak) this.state = 'win';
    }
    this.prevTarget = this.target;
    this.target += this.gap();
  }

  result(): MinigameResult { return { result: this.state === 'win' ? 'win' : 'lose', score: this.best }; }
}

const W = 480, H = 280;
const INK = '#3a2c26', RED = '#d8332a';
const ME = { x: 120, y: 214 }, DUC = { x: 380, y: 170 }, BUSH = { x: 40, y: 70 };
const RING = 16;
const JUDGE_TEXT: Record<Judge, string> = { perfect: 'Hoàn hảo', good: 'Được', miss: 'Hụt' };

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const arc = (from: { x: number; y: number }, to: { x: number; y: number }, k: number, h: number) =>
  ({ x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) - Math.sin(Math.PI * k) * h });

export default {
  id: 'mg_footbag',
  title: 'Đá cầu',
  kind: 'K5',
  rules: { lines: [
    'Quả cầu bay tới, vòng quanh điểm rơi thu nhỏ dần.',
    'Bấm Space hoặc click khi vòng trùng vòng đích.',
    'Chuyền 10 lượt liên tiếp là thắng; hụt 3 lần là thua.',
  ] },
  mount(el, ctx) {
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.dataset.testid = 'mg-footbag';
    canvas.style.cssText = `display:block;width:100%;max-width:${W}px;aspect-ratio:${W}/${H};margin:0 auto;border:2px solid ${INK};border-radius:12px;touch-action:none;cursor:pointer`;
    el.append(canvas);
    const g = canvas.getContext('2d')!;
    g.scale(dpr, dpr);

    const logic = new FootbagLogic(0);
    let t = 0, lastReal = performance.now(), raf = 0;
    let paused = false, done = false, endAt = 0;

    const now = () => t + (paused ? 0 : Math.min(performance.now() - lastReal, 100));
    const hit = () => { if (!paused && !done) logic.press(now()); };

    const draw = () => {
      g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#d6c7a4'; g.fillRect(0, 190, W, H - 190);
      g.fillStyle = '#5f9a4a';
      for (const [dx, dy, r] of [[0, 0, 30], [28, 6, 24], [-24, 10, 22]]) { g.beginPath(); g.arc(BUSH.x + dx, BUSH.y + dy, r, 0, Math.PI * 2); g.fill(); }
      // hai người
      for (const [p, name] of [[ME, ''], [DUC, 'Đức']] as const) {
        g.fillStyle = '#fff7e2'; g.strokeStyle = INK; g.lineWidth = 2;
        g.beginPath(); g.arc(p.x, p.y - 46, 12, 0, Math.PI * 2); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(p.x, p.y - 34); g.lineTo(p.x, p.y - 8); g.lineTo(p.x - 10, p.y + 10); g.moveTo(p.x, p.y - 8); g.lineTo(p.x + 10, p.y + 10); g.stroke();
        if (name) { g.fillStyle = INK; g.font = '700 14px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(name, p.x, p.y + 28); }
      }
      const tt = now();
      const land = { x: ME.x + 18, y: ME.y + 4 };
      // vòng đích + vòng thu nhỏ
      if (!done) {
        g.strokeStyle = INK; g.lineWidth = 3; g.setLineDash([5, 4]);
        g.beginPath(); g.arc(land.x, land.y, RING, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
        const left = logic.target - tt;
        const span = (logic.target - logic.prevTarget) / 2;
        if (left < span) {
          g.strokeStyle = Math.abs(left) <= FOOTBAG.goodMs ? '#2f8f3a' : '#c58a1a';
          g.beginPath(); g.arc(land.x, land.y, Math.max(2, RING + left * 0.12), 0, Math.PI * 2); g.stroke();
        }
      }
      // quả cầu: nửa đầu chu kỳ bay sang Đức, nửa sau bay về điểm rơi; hết ván thì Đức đá vào bụi cây
      let ball: { x: number; y: number };
      if (done) {
        ball = arc(DUC, BUSH, Math.min(1, (tt - (endAt - FOOTBAG.outroMs)) / (FOOTBAG.outroMs * 0.7)), 90);
      } else {
        const k = (tt - logic.prevTarget) / (logic.target - logic.prevTarget);
        ball = k < 0.5 ? arc(land, DUC, Math.max(0, k * 2), 110) : arc(DUC, land, Math.min(1.2, (k - 0.5) * 2), 110);
      }
      g.fillStyle = RED; g.strokeStyle = INK; g.lineWidth = 2;
      g.beginPath(); g.arc(ball.x, ball.y, 6, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(ball.x - 6, ball.y - 4); g.lineTo(ball.x, ball.y - 18); g.lineTo(ball.x + 6, ball.y - 4); g.stroke();
      // bảng số
      g.fillStyle = INK; g.textAlign = 'left'; g.font = '800 16px Nunito, sans-serif';
      g.fillText(`Chuyền liên tiếp: ${logic.streak}/${FOOTBAG.winStreak}`, 14, 24);
      g.textAlign = 'right';
      g.fillText(`Hụt: ${logic.misses}/${FOOTBAG.maxMisses}`, W - 14, 24);
      if (logic.last && tt - logic.last.at < 600) {
        g.textAlign = 'center'; g.font = '800 22px Nunito, sans-serif';
        g.fillStyle = logic.last.judge === 'miss' ? RED : '#2f8f3a';
        g.fillText(JUDGE_TEXT[logic.last.judge], W / 2, 70);
      }
    };

    const frame = (real: number) => {
      const dt = Math.min(real - lastReal, 100);
      lastReal = real;
      if (!paused) {
        t += dt;
        if (!done) {
          logic.update(t);
          if (logic.state !== 'playing') { done = true; endAt = t + FOOTBAG.outroMs; }
        } else if (t >= endAt) {
          cancelAnimationFrame(raf); raf = 0;
          draw();
          ctx.onFinish(logic.result());
          return;
        }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); hit(); } };
    const onDown = (e: PointerEvent) => { if (e.button === 0) { e.preventDefault(); hit(); } };
    window.addEventListener('keydown', onKey);
    canvas.addEventListener('pointerdown', onDown);
    raf = requestAnimationFrame(frame);

    return {
      pause() { paused = true; },
      resume() { paused = false; lastReal = performance.now(); },
      dispose() {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
        canvas.remove();
      },
    };
  },
} satisfies MinigameModule;
