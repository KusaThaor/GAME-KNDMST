/**
 * Xếp đội hình — Trang 4 bước 3 (trước ảnh hẹn giờ) · K3 (GDD `02` §2.4.6, G-1 của bảng việc).
 * Kéo 5 người vào 5 chỗ đứng trong khung ảnh: hàng sau 3 chỗ, hàng trước 2 chỗ (mỗi chỗ hàng trước đứng giữa
 * hai chỗ hàng sau). Xong khi đủ người và không ai bị che: người hàng trước không được cao hơn người hàng sau
 * ngay sau lưng. Chiều cao lấy theo `src/actors/character/presets.ts` (lớp 6–7, `g6.height`). Không có thua.
 * Kiểu ảnh (nghiêm túc / tự nhiên / hài) do bước `choice` của quest chọn, trò này không hỏi lại.
 */
import type { MinigameModule, MinigameResult } from '../types';

export const LINEUP = {
  /** Hệ số cao lớp 6–7 theo presets (player1 = 1; player2 = 0,99 làm tròn về 1 cho cả hai ngoại hình). */
  people: [
    { id: 'duc', name: 'Đức', height: 1, color: '#e0702a' },
    { id: 'quan', name: 'Quân', height: 1.06, color: '#3f9a4e' },
    { id: 'chau', name: 'Châu', height: 1, color: '#8a55c9' },
    { id: 'ha', name: 'Hạ', height: 0.97, color: '#e0608f' },
    { id: 'player', name: 'Bạn', height: 1, color: '#2f6fb3' },
  ] as { id: string; name: string; height: number; color: string }[],
  /** Chỗ đứng (px của khung 480 × 340). `behind`: chỉ số các chỗ hàng sau mà chỗ hàng trước này che. */
  spots: [
    { row: 'back', x: 170, y: 168 }, { row: 'back', x: 240, y: 168 }, { row: 'back', x: 310, y: 168 },
    { row: 'front', x: 205, y: 206, behind: [0, 1] }, { row: 'front', x: 275, y: 206, behind: [1, 2] },
  ] as { row: 'back' | 'front'; x: number; y: number; behind?: number[] }[],
  snapPx: 40,
  finishDelayMs: 900,
} as const;

const HEIGHT = new Map<string, number>(LINEUP.people.map(p => [p.id, p.height]));

/** Luật thuần (không DOM). */
export class LineupLogic {
  /** chỗ → người (hoặc null). */
  readonly slots: (string | null)[] = LINEUP.spots.map(() => null);

  spotOf(person: string) { const i = this.slots.indexOf(person); return i < 0 ? null : i; }

  /** Đặt `person` vào chỗ `spot`; chỗ đã có người thì hai người đổi chỗ (người kia về chỗ cũ hoặc ra ngoài). */
  place(person: string, spot: number) {
    if (!HEIGHT.has(person) || spot < 0 || spot >= this.slots.length) return false;
    const from = this.spotOf(person), other = this.slots[spot];
    if (from !== null) this.slots[from] = other;
    this.slots[spot] = person;
    return true;
  }

  remove(person: string) { const i = this.spotOf(person); if (i !== null) this.slots[i] = null; }

  /** Các chỗ hàng sau đang bị người hàng trước cao hơn che. */
  covered(): number[] {
    const out = new Set<number>();
    LINEUP.spots.forEach((s, i) => {
      const front = this.slots[i];
      if (s.row !== 'front' || !front) return;
      for (const b of s.behind ?? []) {
        const back = this.slots[b];
        if (back && HEIGHT.get(front)! > HEIGHT.get(back)!) out.add(b);
      }
    });
    return [...out].sort();
  }

  get full() { return this.slots.every(Boolean); }
  get done() { return this.full && this.covered().length === 0; }

  result(): MinigameResult { return { result: 'complete' }; }
}

const W = 480, H = 340, TRAY_Y = 316, INK = '#3a2c26', RED = '#d8332a', FIG = 92;

export default {
  id: 'mg_lineup',
  title: 'Xếp đội hình',
  kind: 'K3',
  rules: { lines: [
    'Kéo năm người vào năm chỗ đứng trong khung ảnh.',
    'Không để ai bị che: người hàng trước không được cao hơn người đứng ngay sau lưng.',
    'Bàn phím: ←/→ chọn người, phím 1–5 đặt vào chỗ có số đó.',
  ] },
  mount(el, ctx) {
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.dataset.testid = 'mg-lineup';
    canvas.style.cssText = `display:block;width:100%;max-width:${W}px;aspect-ratio:${W}/${H};margin:0 auto;border:2px solid ${INK};border-radius:12px;touch-action:none;cursor:grab;user-select:none`;
    el.append(canvas);
    const g = canvas.getContext('2d')!;
    g.scale(dpr, dpr);

    const logic = new LineupLogic();
    const people = LINEUP.people;
    const home = new Map(people.map((p, i) => [p.id, { x: 72 + i * 84, y: TRAY_Y }]));
    const pos = new Map([...home].map(([k, v]) => [k, { ...v }]));
    let paused = false, finished = false, pending = false, timer = 0, raf = 0, sel = 0;
    let drag: { id: string; dx: number; dy: number } | null = null;

    const finish = () => {
      if (finished) return;
      if (paused) { pending = true; return; }
      finished = true;
      ctx.onFinish(logic.result());
    };
    const settleAll = () => {
      for (const p of people) {
        const i = logic.spotOf(p.id);
        pos.set(p.id, i === null ? { ...home.get(p.id)! } : { x: LINEUP.spots[i].x, y: LINEUP.spots[i].y });
      }
      if (logic.done && !timer) timer = window.setTimeout(finish, LINEUP.finishDelayMs);
      else if (!logic.done && timer) { clearTimeout(timer); timer = 0; }
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    };
    const hit = (p: { x: number; y: number }) => [...people].reverse().find(pp => {
      const q = pos.get(pp.id)!, h = FIG * pp.height * (q.y >= TRAY_Y ? 0.5 : 1);
      return Math.abs(p.x - q.x) <= 18 && p.y <= q.y + 6 && p.y >= q.y - h;
    });

    const figure = (p: typeof people[number], x: number, y: number, scale: number, on: boolean, bad: boolean) => {
      const h = FIG * p.height * scale, head = 13 * scale;
      g.save();
      g.lineWidth = on ? 4 : 2; g.strokeStyle = bad ? RED : INK;
      g.fillStyle = p.color;
      g.beginPath(); g.roundRect(x - 14 * scale, y - h + head * 2, 28 * scale, h - head * 2, 8 * scale); g.fill(); g.stroke();
      g.fillStyle = '#f6dcc0';
      g.beginPath(); g.arc(x, y - h + head, head, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = INK; g.font = `800 ${Math.round(12 * Math.max(scale, 0.9))}px Nunito, sans-serif`; g.textAlign = 'center';
      g.fillText(p.name, x, y + 14);
      if (bad) { g.fillStyle = RED; g.font = '800 18px Nunito, sans-serif'; g.fillText('!', x + 18 * scale, y - h + 8); }
      g.restore();
    };

    const draw = () => {
      g.fillStyle = '#cfe6c4'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#7a5236'; g.fillRect(392, 24, 18, 200); // thân phượng
      g.fillStyle = '#4f8f45'; g.beginPath(); g.ellipse(402, 34, 90, 40, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e0563a'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(330 + ((i * 47) % 150), 18 + ((i * 29) % 40), 4, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#efe2c4'; g.fillRect(0, TRAY_Y - 70, W, H - TRAY_Y + 70);
      // khung ngắm
      g.strokeStyle = INK; g.lineWidth = 3; g.setLineDash([10, 6]);
      g.strokeRect(110, 40, 260, 196); g.setLineDash([]);
      const bad = new Set(logic.covered());
      LINEUP.spots.forEach((s, i) => {
        g.strokeStyle = 'rgba(58,44,38,.6)'; g.lineWidth = 2;
        g.beginPath(); g.ellipse(s.x, s.y, 22, 7, 0, 0, Math.PI * 2); g.stroke();
        if (!logic.slots[i]) { g.fillStyle = INK; g.font = '800 13px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(String(i + 1), s.x, s.y + 4); }
      });
      // vẽ hàng sau trước, hàng trước sau, người đang kéo trên cùng
      const placedOrder = [0, 1, 2, 3, 4].map(i => logic.slots[i]).filter((id): id is string => !!id && id !== drag?.id);
      for (const id of placedOrder) {
        const p = people.find(pp => pp.id === id)!, q = pos.get(id)!;
        figure(p, q.x, q.y, 1, people[sel].id === id, bad.has(logic.spotOf(id)!));
      }
      for (const p of people) {
        if (logic.spotOf(p.id) !== null || p.id === drag?.id) continue;
        const q = pos.get(p.id)!;
        figure(p, q.x, q.y, 0.5, people[sel].id === p.id, false);
      }
      if (drag) { const p = people.find(pp => pp.id === drag!.id)!, q = pos.get(p.id)!; figure(p, q.x, q.y, 1, true, false); }
      if (logic.done) {
        g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(110, 40, 260, 196);
      }
    };
    const frame = () => { draw(); raf = requestAnimationFrame(frame); };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || paused || logic.done) return;
      const p = local(e), who = hit(p);
      if (!who) return;
      e.preventDefault();
      const q = pos.get(who.id)!;
      drag = { id: who.id, dx: q.x - p.x, dy: 0 };
      sel = people.indexOf(who);
      pos.set(who.id, { x: q.x, y: p.y });
      try { canvas.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || paused) return;
      const p = local(e);
      pos.set(drag.id, { x: p.x + drag.dx, y: p.y });
    };
    const onUp = () => {
      if (!drag) return;
      const id = drag.id, p = pos.get(id)!;
      drag = null;
      const near = LINEUP.spots.map((s, i) => ({ i, d: Math.hypot(s.x - p.x, s.y - p.y) }))
        .filter(o => o.d <= LINEUP.snapPx).sort((a, b) => a.d - b.d)[0];
      if (near) logic.place(id, near.i);
      else if (p.y > TRAY_Y - 70) logic.remove(id);
      settleAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (paused || logic.done || drag) return;
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') sel = (sel + (e.code === 'ArrowLeft' ? -1 : 1) + people.length) % people.length;
      else if (/^(Digit|Numpad)[1-5]$/.test(e.code)) {
        logic.place(people[sel].id, Number(e.code.slice(-1)) - 1);
        settleAll();
        const next = people.findIndex(p => logic.spotOf(p.id) === null);
        if (next >= 0) sel = next;
      } else return;
      e.preventDefault();
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(frame);

    return {
      pause() { paused = true; if (drag) { drag = null; settleAll(); } },
      resume() { paused = false; if (pending) { pending = false; finish(); } },
      dispose() { cancelAnimationFrame(raf); clearTimeout(timer); window.removeEventListener('keydown', onKey); canvas.remove(); },
    };
  },
} satisfies MinigameModule;
