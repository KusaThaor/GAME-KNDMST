/**
 * Dựng Căn cứ — Trang 3 bước 3 · K3 kéo–đặt (GDD `02` §2.4.6: "Đặt 6 món vào 6 chỗ đánh dấu").
 * Kịch bản: "nhặt thùng giấy, kê bàn"; bước sau "cả nhóm ngồi quanh cái bàn nhỏ" → 6 món = 1 bàn + 5 thùng giấy
 * làm ghế cho năm đứa. Đặt đủ là xong, không có thua. Kiểu trang trí do bước `choice` ngay trước của quest chọn
 * (`m1.base_decor`), trò này không hỏi lại.
 */
import { createHiDpiCanvas, MG_INK, MG_RED, mgFont } from '../shared/canvasStage';
import { createMinigameLoop } from '../shared/loopLifecycle';
import type { MinigameModule, MinigameResult } from '../types';

export type ItemType = 'table' | 'box';

export const BASE_BUILD = {
  items: [
    { id: 'table', type: 'table' }, { id: 'box1', type: 'box' }, { id: 'box2', type: 'box' },
    { id: 'box3', type: 'box' }, { id: 'box4', type: 'box' }, { id: 'box5', type: 'box' },
  ] as { id: string; type: ItemType }[],
  /** Chỗ đánh dấu (px của khung 480 × 340): bàn ở giữa mái che, 5 thùng quanh bàn. */
  spots: [
    { id: 's1', type: 'table', x: 240, y: 140 }, { id: 's2', type: 'box', x: 240, y: 62 },
    { id: 's3', type: 'box', x: 128, y: 118 }, { id: 's4', type: 'box', x: 352, y: 118 },
    { id: 's5', type: 'box', x: 168, y: 214 }, { id: 's6', type: 'box', x: 312, y: 214 },
  ] as { id: string; type: ItemType; x: number; y: number }[],
  /** Thả trong bán kính này quanh chỗ đánh dấu thì hít vào chỗ (px). */
  snapPx: 44,
  finishDelayMs: 900,
} as const;

export type PlaceResult = 'ok' | 'wrong_type' | 'occupied' | 'ignored';

/** Luật thuần (không DOM). */
export class BaseBuildLogic {
  /** món → chỗ */
  readonly placed = new Map<string, string>();
  mistakes = 0;
  private type = new Map<string, ItemType>([...BASE_BUILD.items, ...BASE_BUILD.spots].map(o => [o.id, o.type]));

  occupant(spotId: string) { return [...this.placed].find(([, s]) => s === spotId)?.[0]; }

  place(itemId: string, spotId: string): PlaceResult {
    const it = this.type.get(itemId), sp = BASE_BUILD.spots.find(s => s.id === spotId);
    if (!it || !sp || !BASE_BUILD.items.some(i => i.id === itemId) || this.done) return 'ignored';
    if (this.placed.get(itemId) === spotId) return 'ok';
    if (it !== sp.type) { this.mistakes++; return 'wrong_type'; }
    if (this.occupant(spotId)) return 'occupied';
    this.placed.set(itemId, spotId);
    return 'ok';
  }

  /** Nhấc món ra khỏi chỗ (kéo đi nơi khác). */
  lift(itemId: string) { if (!this.done) this.placed.delete(itemId); }

  get done() { return this.placed.size === BASE_BUILD.spots.length; }

  result(): MinigameResult { return { result: 'complete' }; }
}

const W = 480, H = 340, TRAY_Y = 298;
const SIZE: Record<ItemType, { w: number; h: number }> = { table: { w: 120, h: 72 }, box: { w: 50, h: 44 } };

export default {
  id: 'mg_base_build',
  title: 'Dựng Căn cứ',
  kind: 'K3',
  rules: { lines: [
    'Kéo bàn và thùng giấy vào đúng chỗ đánh dấu dưới mái che.',
    'Đặt đủ 6 món là xong.',
    'Bàn phím: ←/→ chọn món, phím 1–6 đặt vào chỗ có số đó.',
  ] },
  mount(el, ctx) {
    const { canvas, ctx: g, toLocal } = createHiDpiCanvas(el, { width: W, height: H, testId: 'mg-base-build', cursor: 'grab' });

    const logic = new BaseBuildLogic();
    const items = BASE_BUILD.items;
    const home = new Map(items.map((it, i) => [it.id, { x: i === 0 ? 76 : 172 + (i - 1) * 62, y: TRAY_Y }]));
    const pos = new Map([...home].map(([k, v]) => [k, { ...v }]));
    let drag: { id: string; dx: number; dy: number } | null = null;
    let sel = 0, flash: { spot: string; until: number } | null = null;

    const settle = (id: string) => {
      const spot = logic.placed.get(id);
      const s = BASE_BUILD.spots.find(p => p.id === spot);
      pos.set(id, s ? { x: s.x, y: s.y } : { ...home.get(id)! });
      if (logic.done) loop.scheduleFinish(BASE_BUILD.finishDelayMs, () => logic.result());
    };
    const tryPlace = (id: string, spotId: string) => {
      const prev = logic.placed.get(id);
      logic.lift(id);
      const r = logic.place(id, spotId);
      if (r === 'wrong_type') flash = { spot: spotId, until: performance.now() + 500 };
      if (r !== 'ok' && prev) logic.place(id, prev);
      settle(id);
    };

    const hit = (p: { x: number; y: number }) => [...items].reverse().find(it => {
      const q = pos.get(it.id)!, s = SIZE[it.type];
      return Math.abs(p.x - q.x) <= s.w / 2 && Math.abs(p.y - q.y) <= s.h / 2;
    });

    const drawItem = (type: ItemType, x: number, y: number, on: boolean) => {
      const s = SIZE[type];
      g.fillStyle = type === 'table' ? '#a8744a' : '#d9b27c';
      g.strokeStyle = MG_INK; g.lineWidth = on ? 4 : 2;
      g.beginPath(); g.roundRect(x - s.w / 2, y - s.h / 2, s.w, s.h, 6); g.fill(); g.stroke();
      if (type === 'box') { g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - s.w / 2, y); g.lineTo(x + s.w / 2, y); g.stroke(); }
      else { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - s.w / 2 + 6, y - s.h / 2 + 6, s.w - 12, 10); }
    };

    const draw = () => {
      g.fillStyle = '#d8c9a3'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(90,70,50,.18)'; g.fillRect(70, 20, 340, 236); // bóng mái che
      g.fillStyle = '#efe2c4'; g.fillRect(0, TRAY_Y - 34, W, H - TRAY_Y + 34);
      g.strokeStyle = MG_INK; g.lineWidth = 1; g.beginPath(); g.moveTo(0, TRAY_Y - 34); g.lineTo(W, TRAY_Y - 34); g.stroke();
      const now = performance.now();
      BASE_BUILD.spots.forEach((s, i) => {
        const sz = SIZE[s.type];
        g.setLineDash([6, 5]); g.lineWidth = 2;
        g.strokeStyle = flash && flash.spot === s.id && flash.until > now ? MG_RED : MG_INK;
        g.strokeRect(s.x - sz.w / 2 - 3, s.y - sz.h / 2 - 3, sz.w + 6, sz.h + 6);
        g.setLineDash([]);
        g.fillStyle = MG_INK; g.font = mgFont(13); g.textAlign = 'center';
        g.fillText(String(i + 1), s.x - sz.w / 2 + 6, s.y - sz.h / 2 + 10);
      });
      const order = items.filter(it => it.id !== drag?.id);
      for (const it of order) { const p = pos.get(it.id)!; drawItem(it.type, p.x, p.y, items[sel]?.id === it.id); }
      if (drag) { const it = items.find(i => i.id === drag!.id)!; const p = pos.get(it.id)!; drawItem(it.type, p.x, p.y, true); }
      g.fillStyle = MG_INK; g.textAlign = 'right'; g.font = mgFont(15);
      g.fillText(`${logic.placed.size}/${BASE_BUILD.spots.length}`, W - 12, TRAY_Y - 40);
    };

    const loop = createMinigameLoop({
      onFinish: ctx.onFinish,
      onDraw: draw,
      onPause() { if (drag) { const id = drag.id; drag = null; settle(id); } },
      onDispose: () => canvas.remove(),
    });

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || loop.paused || logic.done) return;
      const p = toLocal(e), it = hit(p);
      if (!it) return;
      e.preventDefault();
      const q = pos.get(it.id)!;
      drag = { id: it.id, dx: q.x - p.x, dy: q.y - p.y };
      sel = items.indexOf(it);
      try { canvas.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || loop.paused) return;
      const p = toLocal(e);
      pos.set(drag.id, { x: p.x + drag.dx, y: p.y + drag.dy });
    };
    const onUp = () => {
      if (!drag) return;
      const id = drag.id, p = pos.get(id)!;
      drag = null;
      const near = BASE_BUILD.spots
        .map(s => ({ s, d: Math.hypot(s.x - p.x, s.y - p.y) }))
        .filter(o => o.d <= BASE_BUILD.snapPx)
        .sort((a, b) => a.d - b.d)[0];
      if (near) tryPlace(id, near.s.id);
      else { logic.lift(id); settle(id); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (loop.paused || logic.done || drag) return;
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        sel = (sel + (e.code === 'ArrowLeft' ? -1 : 1) + items.length) % items.length;
      } else if (/^(Digit|Numpad)[1-6]$/.test(e.code)) {
        e.preventDefault();
        tryPlace(items[sel].id, BASE_BUILD.spots[Number(e.code.slice(-1)) - 1].id);
        const next = items.findIndex(it => !logic.placed.has(it.id));
        if (next >= 0 && logic.placed.has(items[sel].id)) sel = next;
      }
    };
    loop.on(canvas, 'pointerdown', onDown);
    loop.on(canvas, 'pointermove', onMove);
    loop.on(canvas, 'pointerup', onUp);
    loop.on(canvas, 'pointercancel', onUp);
    loop.on(window, 'keydown', onKey);

    return loop.instance;
  },
} satisfies MinigameModule;
