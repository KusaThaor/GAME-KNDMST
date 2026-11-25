/**
 * Bóp mì gói — Trang 1 cảnh B bước 1 · K6 (GDD `02` §2.4.3).
 * Giữ chuột trên gói mì, lắc qua lại tới khi thanh "Vụn" đầy → kéo gói gia vị thả vào bịch →
 * giữ chuột lắc bịch tới khi thanh "Đều vị" đầy. Sao: ≤ 6 giây 3 sao · ≤ 10 giây 2 sao · còn lại 1 sao. Không có thua.
 */
import { createHiDpiCanvas, MG_INK, mgFont } from '../shared/canvasStage';
import { createMinigameLoop } from '../shared/loopLifecycle';
import type { MinigameModule, MinigameResult } from '../types';

export const NOODLE = {
  /** Quãng chuột lắc ngang (px của khung 480) để thanh "Vụn" đầy. */
  crushPx: 2200,
  /** Quãng lắc để thanh "Đều vị" đầy. */
  mixPx: 1600,
  /** Mỗi lần bấm ←/→ (khi giữ Space) tính bằng chừng này px. */
  keyStepPx: 140,
  /** Mốc sao (ms): [3 sao, 2 sao]. */
  starMs: [6_000, 10_000],
  finishDelayMs: 600,
} as const;

export const noodleStars = (ms: number) => (ms <= NOODLE.starMs[0] ? 3 : ms <= NOODLE.starMs[1] ? 2 : 1);

export type NoodlePhase = 'crush' | 'season' | 'mix' | 'done';

/** Luật thuần (không DOM). */
export class NoodleLogic {
  phase: NoodlePhase = 'crush';
  crush = 0;
  mix = 0;

  get crushProgress() { return Math.min(1, this.crush / NOODLE.crushPx); }
  get mixProgress() { return Math.min(1, this.mix / NOODLE.mixPx); }

  /** Lắc chuột/bịch một đoạn `dx` px (chỉ tính quãng ngang). */
  shake(dx: number) {
    const d = Math.abs(dx);
    if (this.phase === 'crush') {
      this.crush += d;
      if (this.crush >= NOODLE.crushPx) this.phase = 'season';
    } else if (this.phase === 'mix') {
      this.mix += d;
      if (this.mix >= NOODLE.mixPx) this.phase = 'done';
    }
    return this.phase;
  }

  /** Thả gói gia vị; chỉ tính khi thả trúng bịch. */
  drop(intoBag: boolean) {
    if (this.phase !== 'season' || !intoBag) return false;
    this.phase = 'mix';
    return true;
  }

  result(elapsedMs: number): MinigameResult {
    return { result: 'complete', stars: noodleStars(elapsedMs), score: Math.round(elapsedMs / 100) / 10 };
  }
}

const W = 480, H = 300;
const PACK = { x: 150, y: 140, w: 150, h: 100 };
const BAG = { x: 340, y: 150, w: 120, h: 150 };
const PACKET_HOME = { x: 120, y: 230 };

export default {
  id: 'mg_noodle',
  title: 'Bóp mì gói',
  kind: 'K6',
  rules: { lines: [
    'Giữ chuột trên gói mì và lắc qua lại tới khi thanh Vụn đầy.',
    'Kéo gói gia vị thả vào bịch, rồi giữ chuột lắc bịch tới khi thanh Đều vị đầy.',
    'Bàn phím: giữ Space, bấm ←/→ để lắc; Enter thả gia vị. Xong trong 6 giây: 3 sao.',
  ] },
  mount(el, ctx) {
    const { canvas, ctx: g, toLocal } = createHiDpiCanvas(el, { width: W, height: H, testId: 'mg-noodle', cursor: 'grab' });

    const logic = new NoodleLogic();
    let finishing = false, doneElapsed: number | null = null;
    let holding = false, space = false, lastX = 0, jiggle = 0, lastDir = 0;
    let packet = { ...PACKET_HOME }, dragging = false, dropAnim = -1;

    const inside = (p: { x: number; y: number }, b: { x: number; y: number; w: number; h: number }) =>
      Math.abs(p.x - b.x) <= b.w / 2 && Math.abs(p.y - b.y) <= b.h / 2;
    const shake = (dx: number) => {
      if (loop.paused || finishing) return;
      jiggle = Math.max(-10, Math.min(10, jiggle + dx * 0.25));
      if (logic.shake(dx) === 'done') {
        finishing = true;
        doneElapsed = loop.elapsed;
        loop.startOutro(NOODLE.finishDelayMs, () => logic.result(doneElapsed!));
      }
    };

    const bar = (y: number, label: string, k: number) => {
      g.fillStyle = MG_INK; g.font = mgFont(15); g.textAlign = 'left';
      g.fillText(label, 16, y + 13);
      g.fillStyle = '#fff7e2'; g.strokeStyle = MG_INK; g.lineWidth = 2;
      g.beginPath(); g.roundRect(90, y, 200, 16, 8); g.fill(); g.stroke();
      if (k > 0) { g.fillStyle = '#f2b53a'; g.beginPath(); g.roundRect(91, y + 1, 198 * k, 14, 7); g.fill(); }
    };

    const draw = () => {
      g.fillStyle = '#efe2c4'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#c9b48c'; g.fillRect(0, 250, W, H - 250); // bậc thềm
      const j = jiggle * Math.sin(performance.now() / 30);
      if (logic.phase === 'crush') {
        g.save(); g.translate(PACK.x + j, PACK.y);
        g.fillStyle = '#f4c542'; g.strokeStyle = MG_INK; g.lineWidth = 3;
        g.beginPath(); g.roundRect(-PACK.w / 2, -PACK.h / 2, PACK.w, PACK.h, 10); g.fill(); g.stroke();
        g.fillStyle = '#d8332a'; g.beginPath(); g.ellipse(0, 0, 44, 28, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#fff3c4'; g.lineWidth = 2;
        for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(-30, i * 8); g.quadraticCurveTo(0, i * 8 + 6, 30, i * 8); g.stroke(); }
        g.restore();
      }
      // bịch nilon
      const bj = logic.phase === 'mix' ? j : 0;
      g.save(); g.translate(BAG.x + bj, BAG.y);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.strokeStyle = MG_INK; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-BAG.w / 2, -BAG.h / 2); g.lineTo(BAG.w / 2, -BAG.h / 2); g.lineTo(BAG.w / 2 - 8, BAG.h / 2 - 30);
      g.quadraticCurveTo(0, BAG.h / 2 - 10, -BAG.w / 2 + 8, BAG.h / 2 - 30); g.closePath(); g.fill(); g.stroke();
      if (logic.phase !== 'crush') {
        const tint = logic.phase === 'season' ? 0 : logic.mixProgress;
        g.fillStyle = `rgb(${244 - tint * 30},${197 - tint * 80},${66 - tint * 30})`;
        for (let i = 0; i < 18; i++) { g.fillRect(-40 + ((i * 37) % 80), 10 + ((i * 23) % 40), 9, 4); }
      }
      g.restore();
      // gói gia vị
      if (logic.phase === 'season' || (dropAnim >= 0 && logic.phase === 'mix')) {
        g.fillStyle = '#d8332a'; g.strokeStyle = MG_INK; g.lineWidth = 2;
        g.beginPath(); g.roundRect(packet.x - 18, packet.y - 12, 36, 24, 4); g.fill(); g.stroke();
      }
      bar(14, 'Vụn', logic.crushProgress);
      bar(38, 'Đều vị', logic.mixProgress);
      g.textAlign = 'right'; g.fillStyle = MG_INK; g.font = mgFont(15);
      g.fillText(`${((doneElapsed ?? loop.elapsed) / 1000).toFixed(1)} giây`, W - 14, 27);
    };

    const loop = createMinigameLoop({
      onFinish: ctx.onFinish,
      onTick(dt) {
        jiggle *= 0.85;
        if (dropAnim >= 0) {
          dropAnim -= dt;
          packet = { x: packet.x + (BAG.x - packet.x) * 0.3, y: packet.y + (BAG.y - packet.y) * 0.3 };
          if (dropAnim < 0) logic.drop(true);
        }
      },
      onDraw: draw,
      onPause() {
        holding = false; space = false;
        if (dragging) { dragging = false; packet = { ...PACKET_HOME }; }
      },
      onDispose: () => canvas.remove(),
    });

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || loop.paused) return;
      const p = toLocal(e);
      if (logic.phase === 'season') {
        if (dropAnim < 0 && Math.abs(p.x - packet.x) <= 30 && Math.abs(p.y - packet.y) <= 24) dragging = true;
      } else if ((logic.phase === 'crush' && inside(p, PACK)) || (logic.phase === 'mix' && inside(p, BAG))) holding = true;
      else return;
      e.preventDefault();
      lastX = p.x;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
    };
    const onMove = (e: PointerEvent) => {
      if (loop.paused) return;
      const p = toLocal(e);
      if (dragging) packet = p;
      else if (holding) { shake(p.x - lastX); lastX = p.x; }
    };
    const onUp = () => {
      if (dragging) {
        dragging = false;
        if (!loop.paused && inside(packet, BAG)) logic.drop(true);
        else packet = { ...PACKET_HOME };
      }
      holding = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (loop.paused) return;
      if (e.code === 'Space') { e.preventDefault(); space = true; }
      else if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && !e.repeat) {
        e.preventDefault();
        const dir = e.code === 'ArrowLeft' ? -1 : 1;
        if (space && dir !== lastDir) shake(dir * NOODLE.keyStepPx);
        lastDir = dir;
      } else if (e.code === 'Enter' && logic.phase === 'season' && dropAnim < 0 && !dragging) { e.preventDefault(); dropAnim = 250; }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') space = false; };
    loop.on(canvas, 'pointerdown', onDown);
    loop.on(canvas, 'pointermove', onMove);
    loop.on(canvas, 'pointerup', onUp);
    loop.on(canvas, 'pointercancel', onUp);
    loop.on(window, 'keydown', onKey);
    loop.on(window, 'keyup', onKeyUp);

    return loop.instance;
  },
} satisfies MinigameModule;
