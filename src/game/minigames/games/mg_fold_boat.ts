/**
 * Gấp thuyền giấy & ghi điều ước — Trang 2 Cảnh 3 · 3 nhịp (R-B5, chốt 25/11).
 * Nhịp 1 (`fold`): vuốt dọc các đường nét đứt (hoặc Space/Enter) qua 4 bước để gấp tờ giấy thành thuyền buồm trắng. Không có thua.
 * Nhịp 2 (`wish`): chọn 1 trong 3 điều ước (đọc `choice_options` do runner đưa từ `step.choice`, hoặc `wish_options`; mặc định 3 câu đã duyệt), hỗ trợ bấm nút hoặc phím 1/2/3.
 * Nhịp 3 (`write`): giữ chuột/chạm kéo tô (hoặc giữ Space) trên vùng cánh buồm để chữ điều ước hiện rõ nét mực (≥ 85% điểm hướng dẫn).
 * Lưu `wish` và `wish_text` vào `ctx.save`, hoàn thành với `{ result: 'complete', stars: 3 }`.
 */
import { createHiDpiCanvas, MG_FONT, MG_INK, mgFont } from '../shared/canvasStage';
import { createMinigameLoop } from '../shared/loopLifecycle';
import type { MinigameModule, MinigameResult } from '../types';

export interface WishOption {
  id: string;
  text: string;
}

export interface FoldStepSpec {
  id: string;
  prompt: string;
  checkpoints: readonly { x: number; y: number }[];
}

export type FoldBoatPhase = 'fold' | 'wish' | 'write' | 'done';

export const DEFAULT_WISH_OPTIONS: readonly WishOption[] = [
  { id: 'friendship', text: 'Mai mốt vẫn chơi chung vầy' },
  { id: 'fun', text: 'Lớp 7 vui hơn lớp 6' },
  { id: 'secret', text: 'Bí mật không nói ra' },
];

export const FOLD_BOAT = {
  width: 480,
  height: 290,
  foldHitRadius: 30,
  writeRadius: 22,
  writeDoneRatio: 0.85,
  keyWriteTotalMs: 1200,
  outroMs: 900,
  steps: [
    {
      id: 'fold_half',
      prompt: 'Bước 1/4: Vuốt ngang nét đứt để gấp đôi tờ giấy',
      checkpoints: [
        { x: 155, y: 155 },
        { x: 210, y: 155 },
        { x: 270, y: 155 },
        { x: 325, y: 155 },
      ],
    },
    {
      id: 'fold_corners',
      prompt: 'Bước 2/4: Vuốt theo nét đứt để gấp hai góc tạo chóp',
      checkpoints: [
        { x: 170, y: 170 },
        { x: 205, y: 132 },
        { x: 240, y: 96 },
        { x: 275, y: 132 },
        { x: 310, y: 170 },
      ],
    },
    {
      id: 'fold_brim',
      prompt: 'Bước 3/4: Vuốt ngang mép dưới để gấp vành thuyền',
      checkpoints: [
        { x: 155, y: 205 },
        { x: 210, y: 205 },
        { x: 270, y: 205 },
        { x: 325, y: 205 },
      ],
    },
    {
      id: 'open_sail',
      prompt: 'Bước 4/4: Vuốt ngang thân giấy để mở bung cánh buồm trắng',
      checkpoints: [
        { x: 170, y: 162 },
        { x: 215, y: 162 },
        { x: 265, y: 162 },
        { x: 310, y: 162 },
      ],
    },
  ] as readonly FoldStepSpec[],
  writeGuides: [
    { x: 175, y: 140 },
    { x: 201, y: 140 },
    { x: 227, y: 140 },
    { x: 253, y: 140 },
    { x: 279, y: 140 },
    { x: 305, y: 140 },
    { x: 175, y: 168 },
    { x: 201, y: 168 },
    { x: 227, y: 168 },
    { x: 253, y: 168 },
    { x: 279, y: 168 },
    { x: 305, y: 168 },
  ] as readonly { x: number; y: number }[],
} as const;

/** Chuẩn hóa danh sách điều ước từ `ctx.save.get('wish_options')`, fallback về 3 lựa chọn mặc định. */
export function resolveWishOptions(raw: unknown): WishOption[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_WISH_OPTIONS.map((o) => ({ ...o }));
  const valid = raw.filter(
    (item): item is WishOption =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as WishOption).id === 'string' &&
      (item as WishOption).id.trim().length > 0 &&
      typeof (item as WishOption).text === 'string' &&
      (item as WishOption).text.trim().length > 0,
  );
  return valid.length > 0 ? valid.map((o) => ({ id: o.id, text: o.text })) : DEFAULT_WISH_OPTIONS.map((o) => ({ ...o }));
}

function pointToSegmentDistSq(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy;
  const k = len2 > 0 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / len2)) : 0;
  const ex = x0 + dx * k - px;
  const ey = y0 + dy * k - py;
  return ex * ex + ey * ey;
}

/** Luật thuần 3 nhịp (không DOM): gấp giấy → chọn điều ước → tô viết lên cánh buồm. */
export class FoldBoatLogic {
  phase: FoldBoatPhase = 'fold';
  foldStep = 0;
  foldHits: boolean[];
  readonly wishOptions: readonly WishOption[];
  selectedWish: WishOption | null = null;
  writeHits: boolean[];
  private keyWriteMs = 0;

  constructor(wishOptions?: unknown) {
    this.wishOptions = resolveWishOptions(wishOptions);
    this.foldHits = new Array(FOLD_BOAT.steps[0].checkpoints.length).fill(false);
    this.writeHits = new Array(FOLD_BOAT.writeGuides.length).fill(false);
  }

  get currentFold(): FoldStepSpec | null {
    return this.phase === 'fold' ? (FOLD_BOAT.steps[this.foldStep] ?? null) : null;
  }

  get foldHitCount(): number {
    return this.foldHits.filter(Boolean).length;
  }

  get writeHitCount(): number {
    return this.writeHits.filter(Boolean).length;
  }

  get writeProgress(): number {
    return this.writeHits.length ? this.writeHitCount / this.writeHits.length : 1;
  }

  /** Vuốt từ (x0, y0) tới (x1, y1) ở nhịp 1; trả `true` nếu vừa hoàn thành nếp gấp hiện tại. */
  swipeFold(x0: number, y0: number, x1 = x0, y1 = y0): boolean {
    const step = this.currentFold;
    if (!step) return false;
    const r2 = FOLD_BOAT.foldHitRadius * FOLD_BOAT.foldHitRadius;
    for (let i = 0; i < step.checkpoints.length; i++) {
      if (this.foldHits[i]) continue;
      const pt = step.checkpoints[i];
      if (pointToSegmentDistSq(pt.x, pt.y, x0, y0, x1, y1) <= r2) {
        this.foldHits[i] = true;
      }
    }
    if (this.foldHits.every(Boolean)) {
      this.advanceFold();
      return true;
    }
    return false;
  }

  /** Hoàn thành nhanh nếp gấp hiện tại (hỗ trợ bàn phím Space/Enter). */
  completeCurrentFold(): boolean {
    if (this.phase !== 'fold') return false;
    this.advanceFold();
    return true;
  }

  private advanceFold() {
    this.foldStep++;
    if (this.foldStep >= FOLD_BOAT.steps.length) {
      this.foldHits = [];
      this.phase = 'wish';
    } else {
      this.foldHits = new Array(FOLD_BOAT.steps[this.foldStep].checkpoints.length).fill(false);
    }
  }

  /** Nhịp 2: chọn điều ước theo `id` hoặc chỉ số 0-based. */
  chooseWish(idOrIndex: string | number): boolean {
    if (this.phase !== 'wish') return false;
    const picked =
      typeof idOrIndex === 'number'
        ? this.wishOptions[idOrIndex]
        : this.wishOptions.find((o) => o.id === idOrIndex);
    if (!picked) return false;
    this.selectedWish = picked;
    this.phase = 'write';
    this.keyWriteMs = 0;
    this.writeHits.fill(false);
    return true;
  }

  /** Nhịp 3: kéo nét tô chữ trên cánh buồm từ (x0, y0) tới (x1, y1); trả độ phủ 0..1. */
  traceWrite(x0: number, y0: number, x1 = x0, y1 = y0): number {
    if (this.phase !== 'write') return this.writeProgress;
    const r2 = FOLD_BOAT.writeRadius * FOLD_BOAT.writeRadius;
    for (let i = 0; i < FOLD_BOAT.writeGuides.length; i++) {
      if (this.writeHits[i]) continue;
      const pt = FOLD_BOAT.writeGuides[i];
      if (pointToSegmentDistSq(pt.x, pt.y, x0, y0, x1, y1) <= r2) {
        this.writeHits[i] = true;
      }
    }
    if (this.writeProgress >= FOLD_BOAT.writeDoneRatio) {
      this.phase = 'done';
    }
    return this.writeProgress;
  }

  /** Nhịp 3 (accessibility): giữ Space trong `dtMs` để tô dần các điểm hướng dẫn. */
  advanceWriteByKey(dtMs: number): number {
    if (this.phase !== 'write' || dtMs <= 0) return this.writeProgress;
    this.keyWriteMs = Math.min(FOLD_BOAT.keyWriteTotalMs, this.keyWriteMs + dtMs);
    const targetCount = Math.min(
      this.writeHits.length,
      Math.floor((this.keyWriteMs / FOLD_BOAT.keyWriteTotalMs) * this.writeHits.length),
    );
    for (let i = 0; i < targetCount; i++) this.writeHits[i] = true;
    if (this.writeProgress >= FOLD_BOAT.writeDoneRatio) {
      this.phase = 'done';
    }
    return this.writeProgress;
  }

  result(): MinigameResult {
    return { result: 'complete', stars: 3 };
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(next).width > maxWidth) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export default {
  id: 'mg_fold_boat',
  title: 'Gấp thuyền giấy',
  kind: 'special',
  rules: {
    lines: [
      'Vuốt dọc theo đường nét đứt (hoặc bấm Space/Enter) để gấp tờ giấy thành chiếc thuyền.',
      'Chọn một điều ước, rồi giữ chuột kéo tô theo nét chữ mờ trên cánh buồm (hoặc giữ Space).',
      'Không có thua — tô rõ điều ước lên buồm là thuyền sẵn sàng xuống nước.',
    ],
  },
  mount(el, ctx) {
    const logic = new FoldBoatLogic(ctx.save.get('choice_options') ?? ctx.save.get('wish_options')); // R-D5: lựa chọn lấy từ step.choice nếu có
    const W = FOLD_BOAT.width;
    const H = FOLD_BOAT.height;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;display:flex;flex-direction:column;gap:8px;align-items:center;user-select:none';
    const { canvas, ctx: g, toLocal } = createHiDpiCanvas(wrap, {
      width: W,
      height: H,
      testId: 'mg-fold-boat',
      cursor: 'pointer',
      css: 'margin:0;background:#eef3f6',
    });

    const wishBox = document.createElement('div');
    wishBox.dataset.testid = 'mg-fold-boat-wishes';
    wishBox.style.cssText = 'display:none;position:absolute;left:18px;right:18px;bottom:34px;flex-direction:column;gap:6px;background:rgba(255,250,238,0.95);border:2px solid ' + MG_INK + ';border-radius:10px;padding:8px 10px';
    wrap.append(wishBox);

    const statusBar = document.createElement('div');
    statusBar.style.cssText = `font:700 14px ${MG_FONT};color:${MG_INK};text-align:center;min-height:20px`;
    wrap.append(statusBar);
    el.append(wrap);

    const renderWishButtons = () => {
      wishBox.innerHTML = logic.wishOptions
        .map(
          (opt, i) =>
            `<button type="button" data-wish-idx="${i}" data-wish-id="${opt.id}" style="text-align:left;padding:6px 10px;border:1.5px solid ${MG_INK};border-radius:8px;background:#fffdf6;font:700 13px ${MG_FONT};cursor:pointer">${i + 1}. ${opt.text}</button>`,
        )
        .join('');
    };
    renderWishButtons();

    let pointerDown = false;
    let spaceHeld = false;
    let lastPt: { x: number; y: number } | null = null;
    let outroStarted = false;
    const foldTrail: { x: number; y: number }[] = [];
    const inkStrokes: { x0: number; y0: number; x1: number; y1: number }[] = [];

    const syncWishUi = () => {
      wishBox.style.display = logic.phase === 'wish' ? 'flex' : 'none';
    };

    const pickWish = (idOrIndex: string | number) => {
      if (loop.paused || !logic.chooseWish(idOrIndex)) return;
      inkStrokes.length = 0;
      syncWishUi();
    };

    const drawPaperFoldStep = (stepIdx: number) => {
      g.fillStyle = '#fff9ec';
      g.strokeStyle = MG_INK;
      g.lineWidth = 2.5;
      if (stepIdx === 0) {
        // Tờ giấy vở phẳng
        g.fillRect(130, 65, 220, 180);
        g.strokeRect(130, 65, 220, 180);
        g.strokeStyle = 'rgba(130,165,205,0.45)';
        g.lineWidth = 1;
        for (let y = 89; y < 235; y += 22) {
          g.beginPath(); g.moveTo(140, y); g.lineTo(340, y); g.stroke();
        }
      } else if (stepIdx === 1) {
        // Đã gấp đôi theo chiều ngang
        g.fillRect(130, 100, 220, 115);
        g.strokeRect(130, 100, 220, 115);
        g.fillStyle = 'rgba(218,204,175,0.35)';
        g.fillRect(130, 100, 220, 12);
      } else if (stepIdx === 2) {
        // Đã gấp 2 góc chóp nhọn ở trên
        g.beginPath();
        g.moveTo(240, 68);
        g.lineTo(350, 195);
        g.lineTo(350, 222);
        g.lineTo(130, 222);
        g.lineTo(130, 195);
        g.closePath();
        g.fill(); g.stroke();
        g.strokeStyle = 'rgba(58,44,38,0.28)';
        g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(240, 68); g.lineTo(240, 195); g.stroke();
      } else {
        // Đã gấp vành đáy lên thành mũ tam giác
        g.beginPath();
        g.moveTo(240, 68);
        g.lineTo(340, 188);
        g.lineTo(140, 188);
        g.closePath();
        g.fill(); g.stroke();
        g.fillStyle = '#f5ebd6';
        g.fillRect(132, 184, 216, 28);
        g.strokeRect(132, 184, 216, 28);
      }
    };

    const drawFinishedBoat = (x: number, y: number, scale: number, wishText?: string, inkAlpha = 0) => {
      g.save();
      g.translate(x, y);
      g.scale(scale, scale);

      // Cánh buồm trắng trung tâm
      g.fillStyle = '#fffdf8';
      g.strokeStyle = MG_INK;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(0, -108);
      g.lineTo(74, 0);
      g.lineTo(-74, 0);
      g.closePath();
      g.fill();
      g.stroke();

      // Nếp gấp sống buồm mờ
      g.strokeStyle = 'rgba(58,44,38,0.16)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(0, -106);
      g.lineTo(0, 0);
      g.stroke();

      // Nét tô mực (cắt theo hình cánh buồm)
      if (inkStrokes.length > 0 && scale > 1.1) {
        g.save();
        g.beginPath();
        g.moveTo(0, -108);
        g.lineTo(74, 0);
        g.lineTo(-74, 0);
        g.closePath();
        g.clip();
        g.scale(1 / scale, 1 / scale);
        g.translate(-x, -y);
        g.strokeStyle = 'rgba(44, 75, 122, 0.55)';
        g.lineWidth = 5;
        g.lineCap = 'round';
        for (const s of inkStrokes) {
          g.beginPath();
          g.moveTo(s.x0, s.y0);
          g.lineTo(s.x1, s.y1);
          g.stroke();
        }
        g.restore();
      }

      // Chữ điều ước trên cánh buồm (mờ gợi ý -> rõ nét mực)
      if (wishText) {
        g.save();
        g.font = mgFont(11, 700);
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        const lines = wrapLines(g, wishText, 92);
        const startY = -36 - ((lines.length - 1) * 13) / 2;
        g.fillStyle = `rgba(34, 64, 114, ${Math.min(1, Math.max(0.24, inkAlpha))})`;
        lines.forEach((line, idx) => {
          g.fillText(line, 0, startY + idx * 14);
        });
        g.restore();
      }

      // Thân thuyền giấy
      g.fillStyle = '#f8f0dc';
      g.strokeStyle = MG_INK;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(-105, -2);
      g.lineTo(105, -2);
      g.lineTo(72, 34);
      g.lineTo(-72, 34);
      g.closePath();
      g.fill();
      g.stroke();

      // Nếp gấp mũi thuyền
      g.beginPath();
      g.moveTo(-105, -2);
      g.lineTo(0, 12);
      g.lineTo(105, -2);
      g.stroke();
      g.restore();
    };

    const draw = () => {
      // Nền bàn gỗ + dải nước nhẹ
      g.fillStyle = '#e7dfd0';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#d7e7f0';
      g.fillRect(0, H - 54, W, 54);

      if (logic.phase === 'fold') {
        drawPaperFoldStep(logic.foldStep);
        const step = logic.currentFold!;
        // Vẽ đường nếp gấp nét đứt
        g.save();
        g.setLineDash([8, 6]);
        g.strokeStyle = '#c44b2c';
        g.lineWidth = 3;
        g.beginPath();
        step.checkpoints.forEach((p, idx) => (idx === 0 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y)));
        g.stroke();
        g.restore();

        // Điểm chốt trên đường nếp gấp
        step.checkpoints.forEach((p, idx) => {
          const hit = logic.foldHits[idx];
          g.fillStyle = hit ? '#4d9b58' : '#fff6d8';
          g.strokeStyle = hit ? '#2e6b38' : '#c44b2c';
          g.lineWidth = 2;
          g.beginPath();
          g.arc(p.x, p.y, 7, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        });

        // Vệt tay đang vuốt
        if (foldTrail.length > 1) {
          g.strokeStyle = 'rgba(77, 155, 88, 0.55)';
          g.lineWidth = 5;
          g.lineCap = 'round';
          g.beginPath();
          foldTrail.forEach((p, idx) => (idx === 0 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y)));
          g.stroke();
        }

        statusBar.textContent = `${step.prompt} (hoặc bấm Space/Enter)`;
      } else if (logic.phase === 'wish') {
        drawFinishedBoat(W / 2, 110, 0.72);
        g.fillStyle = MG_INK;
        g.font = mgFont(14);
        g.textAlign = 'center';
        g.fillText('Thuyền đã gấp xong! Chọn một điều ước (phím 1–3):', W / 2, 152);
        statusBar.textContent = 'Chọn điều ước để ghi lên cánh buồm trắng';
      } else {
        const progress = logic.writeProgress;
        const alpha = logic.phase === 'done' ? 1 : 0.24 + progress * 0.76;
        drawFinishedBoat(W / 2, 214, 1.45, logic.selectedWish?.text ?? '', alpha);

        if (logic.phase === 'write') {
          g.fillStyle = MG_INK;
          g.font = mgFont(13, 700);
          g.textAlign = 'center';
          g.fillText('Giữ chuột kéo tô lên cánh buồm (hoặc giữ Space)', W / 2, 24);
          const pct = Math.min(100, Math.round((progress / FOLD_BOAT.writeDoneRatio) * 100));
          statusBar.textContent = `Đang ghi điều ước: ${pct}%`;
        } else {
          g.fillStyle = '#2e6b38';
          g.font = mgFont(15);
          g.textAlign = 'center';
          g.fillText('Đã ghi điều ước lên cánh buồm!', W / 2, 26);
          statusBar.textContent = `Điều ước: "${logic.selectedWish?.text ?? ''}"`;
        }
      }
    };

    const checkDone = () => {
      if (logic.phase === 'done' && !outroStarted) {
        outroStarted = true;
        if (logic.selectedWish) {
          ctx.save.set('wish', logic.selectedWish.id);
          ctx.save.set('choice', logic.selectedWish.id);                 // R-D5: runner áp lựa chọn đo lường từ khóa này
          ctx.save.set('wish_text', logic.selectedWish.text);
        }
        loop.startOutro(FOLD_BOAT.outroMs, () => logic.result());
      }
    };

    const loop = createMinigameLoop({
      onFinish: ctx.onFinish,
      onTick(dt) {
        if (logic.phase === 'write' && spaceHeld) {
          const prevCount = logic.writeHitCount;
          logic.advanceWriteByKey(dt);
          if (logic.writeHitCount > prevCount) {
            const fromIdx = Math.max(0, prevCount - 1);
            const toIdx = Math.min(FOLD_BOAT.writeGuides.length - 1, logic.writeHitCount - 1);
            const p0 = FOLD_BOAT.writeGuides[fromIdx];
            const p1 = FOLD_BOAT.writeGuides[toIdx];
            inkStrokes.push({ x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y });
          }
          checkDone();
        }
      },
      onDraw: draw,
      onPause() {
        pointerDown = false;
        spaceHeld = false;
        lastPt = null;
        foldTrail.length = 0;
      },
      onDispose: () => wrap.remove(),
    });

    loop.on(wishBox, 'click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (btn?.dataset.wishId) pickWish(btn.dataset.wishId);
    });

    const handleStroke = (pt: { x: number; y: number }) => {
      const prev = lastPt ?? pt;
      if (logic.phase === 'fold') {
        foldTrail.push(pt);
        if (foldTrail.length > 20) foldTrail.shift();
        if (logic.swipeFold(prev.x, prev.y, pt.x, pt.y)) {
          foldTrail.length = 0;
          lastPt = null;
          pointerDown = false;
          syncWishUi();
          return;
        }
      } else if (logic.phase === 'write') {
        inkStrokes.push({ x0: prev.x, y0: prev.y, x1: pt.x, y1: pt.y });
        logic.traceWrite(prev.x, prev.y, pt.x, pt.y);
        checkDone();
      }
      lastPt = pt;
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || loop.paused || logic.phase === 'wish' || logic.phase === 'done') return;
      e.preventDefault();
      pointerDown = true;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
      const pt = toLocal(e);
      lastPt = pt;
      foldTrail.length = 0;
      handleStroke(pt);
    };

    const onMove = (e: PointerEvent) => {
      if (!pointerDown || loop.paused) return;
      handleStroke(toLocal(e));
    };

    const onUp = () => {
      pointerDown = false;
      lastPt = null;
      foldTrail.length = 0;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (loop.paused) return;
      if (logic.phase === 'fold') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          if (!e.repeat) {
            logic.completeCurrentFold();
            syncWishUi();
          }
        }
      } else if (logic.phase === 'wish') {
        if (/^(Digit|Numpad)[1-9]$/.test(e.code)) {
          const idx = Number(e.code.slice(-1)) - 1;
          if (idx < logic.wishOptions.length) {
            e.preventDefault();
            pickWish(idx);
          }
        }
      } else if (logic.phase === 'write' && e.code === 'Space') {
        e.preventDefault();
        spaceHeld = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceHeld = false;
    };

    loop.on(canvas, 'pointerdown', onDown);
    loop.on(canvas, 'pointermove', onMove);
    loop.on(canvas, 'pointerup', onUp);
    loop.on(canvas, 'pointercancel', onUp);
    loop.on(window, 'keydown', onKeyDown);
    loop.on(window, 'keyup', onKeyUp);

    return loop.instance;
  },
} satisfies MinigameModule;
