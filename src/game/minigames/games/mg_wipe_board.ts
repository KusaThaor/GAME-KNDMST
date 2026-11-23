/**
 * Lau bảng — Trang 1 bước 4 · K6 giữ và di chuột (GDD `02` §2.4.4).
 * Giữ chuột trái và di trên bảng; giẻ lau theo bán kính cọ = 8% chiều rộng bảng. Xong khi sạch ≥ 90%.
 * Sao theo thời gian (không tính lúc tạm dừng): ≤ 10 giây 3 sao · ≤ 16 giây 2 sao · còn lại 1 sao. Không có thua.
 * Bảng vẽ bằng canvas riêng (texture `chalkSmudge` của N-06 là đạo cụ 3D, chưa gộp).
 */
import type { MinigameModule, MinigameResult } from '../types';

export const WIPE = {
  width: 480,
  height: 240,
  /** Bán kính cọ theo chiều rộng bảng (lau lần 1, Trang 1). */
  brushFrac: 0.08,
  /** Cạnh ô lưới dùng để đo phần đã sạch (px). */
  cell: 8,
  doneCoverage: 0.9,
  /** Mốc sao (ms): [3 sao, 2 sao]. */
  starMs: [10_000, 16_000],
  /** Tốc độ giẻ khi di bằng phím mũi tên (px/giây). */
  keySpeed: 420,
  finishDelayMs: 600,
} as const;

export const wipeStars = (ms: number) => (ms <= WIPE.starMs[0] ? 3 : ms <= WIPE.starMs[1] ? 2 : 1);

/** Luật thuần: lưới ô, ô nào có tâm nằm trong cọ thì tính là sạch. */
export class WipeLogic {
  readonly cols: number;
  readonly rows: number;
  readonly radius: number;
  private clean: Uint8Array;
  cleaned = 0;

  constructor(readonly width: number = WIPE.width, readonly height: number = WIPE.height, readonly cell: number = WIPE.cell) {
    this.cols = Math.ceil(width / cell);
    this.rows = Math.ceil(height / cell);
    this.radius = width * WIPE.brushFrac;
    this.clean = new Uint8Array(this.cols * this.rows);
  }

  get coverage() { return this.cleaned / this.clean.length; }
  get done() { return this.coverage >= WIPE.doneCoverage; }

  /** Lau một đoạn từ (x0,y0) tới (x1,y1) theo px của bảng; trả độ phủ mới. */
  wipe(x0: number, y0: number, x1 = x0, y1 = y0) {
    const r = this.radius, c = this.cell;
    const minC = Math.max(0, Math.floor((Math.min(x0, x1) - r) / c)), maxC = Math.min(this.cols - 1, Math.floor((Math.max(x0, x1) + r) / c));
    const minR = Math.max(0, Math.floor((Math.min(y0, y1) - r) / c)), maxR = Math.min(this.rows - 1, Math.floor((Math.max(y0, y1) + r) / c));
    const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy;
    for (let row = minR; row <= maxR; row++) {
      for (let col = minC; col <= maxC; col++) {
        const i = row * this.cols + col;
        if (this.clean[i]) continue;
        const px = (col + 0.5) * c, py = (row + 0.5) * c;
        const k = len2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / len2)) : 0;
        const ex = x0 + dx * k - px, ey = y0 + dy * k - py;
        if (ex * ex + ey * ey <= r * r) { this.clean[i] = 1; this.cleaned++; }
      }
    }
    return this.coverage;
  }

  result(elapsedMs: number): MinigameResult {
    return { result: 'complete', stars: wipeStars(elapsedMs), score: Math.round(elapsedMs / 100) / 10 };
  }
}

const INK = '#3a2c26';
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export default {
  id: 'mg_wipe_board',
  title: 'Lau bảng',
  kind: 'K6',
  rules: { lines: [
    'Giữ chuột trái và di chuột để lau bảng (bàn phím: giữ Space, di bằng phím mũi tên).',
    'Lau sạch 90% bảng là xong.',
    'Xong trong 10 giây: 3 sao · trong 16 giây: 2 sao.',
  ] },
  mount(el, ctx) {
    const W = WIPE.width, H = WIPE.height;
    const wrap = document.createElement('div');
    wrap.style.cssText = `display:flex;flex-direction:column;gap:8px;align-items:center;user-select:none`;
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.dataset.testid = 'mg-wipe-board';
    canvas.style.cssText = `display:block;width:100%;max-width:${W}px;aspect-ratio:${W}/${H};border:8px solid #8a5a36;border-radius:6px;touch-action:none;cursor:grab;background:#2f5d46`;
    const bar = document.createElement('div');
    bar.style.cssText = 'font:800 16px Nunito,sans-serif';
    wrap.append(canvas, bar);
    el.append(wrap);
    const g = canvas.getContext('2d')!;
    g.scale(dpr, dpr);

    // lớp phấn: vẽ một lần rồi xóa dần bằng destination-out
    const chalk = document.createElement('canvas');
    chalk.width = W * dpr; chalk.height = H * dpr;
    const cg = chalk.getContext('2d')!;
    cg.scale(dpr, dpr);
    const rand = rng(ctx.seed);
    cg.fillStyle = 'rgba(236,240,232,.28)'; cg.fillRect(0, 0, W, H);
    cg.strokeStyle = 'rgba(245,245,238,.85)'; cg.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      cg.lineWidth = 2 + rand() * 3;
      cg.beginPath();
      let x = rand() * W, y = 18 + rand() * (H - 36);
      cg.moveTo(x, y);
      for (let j = 0; j < 6; j++) { x += 8 + rand() * 22; y += (rand() - 0.5) * 18; cg.lineTo(x, y); }
      cg.stroke();
    }

    const logic = new WipeLogic(W, H);
    let elapsed = 0, lastReal = performance.now(), raf = 0;
    let paused = false, finished = false, outro = -1;
    let down = false, space = false;
    let rag = { x: W / 2, y: H / 2 };
    const keys = new Set<string>();

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left - 8) * (W / (r.width - 16)), y: (e.clientY - r.top - 8) * (H / (r.height - 16)) };
    };
    const stroke = (to: { x: number; y: number }) => {
      if (paused || outro >= 0) { rag = to; return; }
      cg.save();
      cg.globalCompositeOperation = 'destination-out';
      cg.lineWidth = logic.radius * 2; cg.lineCap = 'round';
      cg.beginPath(); cg.moveTo(rag.x, rag.y); cg.lineTo(to.x, to.y); cg.stroke();
      cg.restore();
      logic.wipe(rag.x, rag.y, to.x, to.y);
      rag = to;
      if (logic.done) outro = WIPE.finishDelayMs;
    };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      g.drawImage(chalk, 0, 0, W, H);
      g.fillStyle = (down || space) ? '#e6d3a8' : '#f2e3bf'; g.strokeStyle = INK; g.lineWidth = 2;
      g.beginPath(); g.roundRect(rag.x - 22, rag.y - 14, 44, 28, 6); g.fill(); g.stroke();
      const pct = Math.min(100, Math.floor(logic.coverage * 100));
      bar.textContent = `Sạch: ${pct}% · ${(elapsed / 1000).toFixed(1)} giây`;
    };

    const frame = (real: number) => {
      const dt = Math.min(real - lastReal, 100);
      lastReal = real;
      if (!paused) {
        if (outro < 0) {
          elapsed += dt;
          const vx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
          const vy = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
          if (vx || vy) {
            const to = { x: Math.max(0, Math.min(W, rag.x + vx * WIPE.keySpeed * dt / 1000)), y: Math.max(0, Math.min(H, rag.y + vy * WIPE.keySpeed * dt / 1000)) };
            if (space) stroke(to); else rag = to;
          }
        } else if (!finished) {
          outro -= dt;
          if (outro <= 0) {
            finished = true;
            ctx.onFinish(logic.result(elapsed));
          }
        }
      }
      draw();
      if (!finished) raf = requestAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || paused) return;
      e.preventDefault();
      down = true;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
      rag = local(e);
      stroke(rag);
    };
    const onMove = (e: PointerEvent) => { const p = local(e); if (down) stroke(p); else rag = p; };
    const onUp = () => { down = false; };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); if (!paused) { space = true; stroke(rag); } }
      else if (e.code.startsWith('Arrow')) { e.preventDefault(); keys.add(e.code); }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') space = false; keys.delete(e.code); };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(frame);

    return {
      pause() { paused = true; down = false; space = false; keys.clear(); },
      resume() { paused = false; lastReal = performance.now(); },
      dispose() {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('keyup', onKeyUp);
        wrap.remove();
      },
    };
  },
} satisfies MinigameModule;
