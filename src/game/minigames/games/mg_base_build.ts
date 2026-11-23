/**
 * Dựng Căn cứ — Trang 3 bước 3 · K3 kéo–đặt (GDD `02` §2.4.6: "Đặt 6 món vào 6 chỗ đánh dấu").
 * Kịch bản: "nhặt thùng giấy, kê bàn"; bước sau "cả nhóm ngồi quanh cái bàn nhỏ" → 6 món = 1 bàn + 5 thùng giấy
 * làm ghế cho năm đứa. Đặt đủ là xong, không có thua. Kiểu trang trí do bước `choice` ngay trước của quest chọn
 * (`m1.base_decor`), trò này không hỏi lại.
 */
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

const W = 480, H = 340, TRAY_Y = 298, INK = '#3a2c26';
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
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.dataset.testid = 'mg-base-build';
    canvas.style.cssText = `display:block;width:100%;max-width:${W}px;aspect-ratio:${W}/${H};margin:0 auto;border:2px solid ${INK};border-radius:12px;touch-action:none;cursor:grab;user-select:none`;
    el.append(canvas);
    const g = canvas.getContext('2d')!;
    g.scale(dpr, dpr);

    const logic = new BaseBuildLogic();
    const items = BASE_BUILD.items;
    const home = new Map(items.map((it, i) => [it.id, { x: i === 0 ? 76 : 172 + (i - 1) * 62, y: TRAY_Y }]));
    const pos = new Map([...home].map(([k, v]) => [k, { ...v }]));
    let paused = false, finished = false, pending = false, timer = 0, raf = 0;
    let drag: { id: string; dx: number; dy: number } | null = null;
    let sel = 0, flash: { spot: string; until: number } | null = null;

    const finish = () => {
      if (finished) return;
      if (paused) { pending = true; return; }
      finished = true;
      ctx.onFinish(logic.result());
    };
    const settle = (id: string) => {
      const spot = logic.placed.get(id);
      const s = BASE_BUILD.spots.find(p => p.id === spot);
      pos.set(id, s ? { x: s.x, y: s.y } : { ...home.get(id)! });
      if (logic.done && !timer) timer = window.setTimeout(finish, BASE_BUILD.finishDelayMs);
    };
    const tryPlace = (id: string, spotId: string) => {
      const prev = logic.placed.get(id);
      logic.lift(id);
      const r = logic.place(id, spotId);
      if (r === 'wrong_type') flash = { spot: spotId, until: performance.now() + 500 };
      if (r !== 'ok' && prev) logic.place(id, prev);
      settle(id);
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    };
    const hit = (p: { x: number; y: number }) => [...items].reverse().find(it => {
      const q = pos.get(it.id)!, s = SIZE[it.type];
      return Math.abs(p.x - q.x) <= s.w / 2 && Math.abs(p.y - q.y) <= s.h / 2;
    });

    const drawItem = (type: ItemType, x: number, y: number, on: boolean) => {
      const s = SIZE[type];
      g.fillStyle = type === 'table' ? '#a8744a' : '#d9b27c';
      g.strokeStyle = INK; g.lineWidth = on ? 4 : 2;
      g.beginPath(); g.roundRect(x - s.w / 2, y - s.h / 2, s.w, s.h, 6); g.fill(); g.stroke();
      if (type === 'box') { g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - s.w / 2, y); g.lineTo(x + s.w / 2, y); g.stroke(); }
      else { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - s.w / 2 + 6, y - s.h / 2 + 6, s.w - 12, 10); }
    };

    const draw = () => {
      g.fillStyle = '#d8c9a3'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(90,70,50,.18)'; g.fillRect(70, 20, 340, 236); // bóng mái che
      g.fillStyle = '#efe2c4'; g.fillRect(0, TRAY_Y - 34, W, H - TRAY_Y + 34);
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(0, TRAY_Y - 34); g.lineTo(W, TRAY_Y - 34); g.stroke();
      const now = performance.now();
      BASE_BUILD.spots.forEach((s, i) => {
        const sz = SIZE[s.type];
        g.setLineDash([6, 5]); g.lineWidth = 2;
        g.strokeStyle = flash && flash.spot === s.id && flash.until > now ? '#d8332a' : INK;
        g.strokeRect(s.x - sz.w / 2 - 3, s.y - sz.h / 2 - 3, sz.w + 6, sz.h + 6);
        g.setLineDash([]);
        g.fillStyle = INK; g.font = '800 13px Nunito, sans-serif'; g.textAlign = 'center';
        g.fillText(String(i + 1), s.x - sz.w / 2 + 6, s.y - sz.h / 2 + 10);
      });
      const order = items.filter(it => it.id !== drag?.id);
      for (const it of order) { const p = pos.get(it.id)!; drawItem(it.type, p.x, p.y, items[sel]?.id === it.id); }
      if (drag) { const it = items.find(i => i.id === drag!.id)!; const p = pos.get(it.id)!; drawItem(it.type, p.x, p.y, true); }
      g.fillStyle = INK; g.textAlign = 'right'; g.font = '800 15px Nunito, sans-serif';
      g.fillText(`${logic.placed.size}/${BASE_BUILD.spots.length}`, W - 12, TRAY_Y - 40);
    };
    const frame = () => { draw(); raf = requestAnimationFrame(frame); };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || paused || logic.done) return;
      const p = local(e), it = hit(p);
      if (!it) return;
      e.preventDefault();
      const q = pos.get(it.id)!;
      drag = { id: it.id, dx: q.x - p.x, dy: q.y - p.y };
      sel = items.indexOf(it);
      try { canvas.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || paused) return;
      const p = local(e);
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
      if (paused || logic.done || drag) return;
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
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(frame);

    return {
      pause() { paused = true; if (drag) { const id = drag.id; drag = null; settle(id); } },
      resume() { paused = false; if (pending) { pending = false; finish(); } },
      dispose() { cancelAnimationFrame(raf); clearTimeout(timer); window.removeEventListener('keydown', onKey); canvas.remove(); },
    };
  },
} satisfies MinigameModule;
