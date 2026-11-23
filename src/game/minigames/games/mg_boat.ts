/**
 * Gấp và đua thuyền giấy — Trang 2 bước 4 · K5 + lái (GDD `02` §2.4.2, CONFIRMED 20/11).
 * Chọn 1 trong 3 kiểu gấp → giữ chuột/Space nạp thanh lực (chạy lên xuống, chu kỳ 1,2 giây), thả trong vùng xanh
 * (giữa thanh, rộng 25%) → lái tránh rác dọc rãnh 12 m (25–35 giây). Rác = chậm 1 giây và tính một lần va chạm;
 * xoáy nước ở 2 chỗ = quay vòng, mất 1,5 giây. Va chạm 3 lần → lật = **thua**; về đích không lật = **thắng**.
 * Kịch bản: Quân luôn nhất, thuyền Đức lật ngay khi thả, thuyền Hạ chạy chậm nhất → người chơi về thứ 2–3, lật = thứ 5.
 * Lời ước do bước `choice` của quest chọn trước đó; ảnh năm chiếc thuyền lúc vừa thả là bước `photo` riêng.
 */
import type { MinigameModule, MinigameResult } from '../types';

export type FoldId = 'sail' | 'roof' | 'double';
export type LaunchZone = 'green' | 'yellow' | 'red';

export const BOAT = {
  /** GDD §2.4.2: buồm nhanh, dễ lật · mui chậm, chắc · đôi cân bằng. `hitbox` > 1 = dễ dính rác hơn. */
  folds: {
    sail: { name: 'Thuyền buồm', note: 'nhanh, dễ lật', speed: 12 / 25, hitbox: 1.3 },
    roof: { name: 'Thuyền mui', note: 'chậm, chắc', speed: 12 / 30, hitbox: 0.75 },
    double: { name: 'Thuyền đôi', note: 'cân bằng', speed: 12 / 27.5, hitbox: 1 },
  } as Record<FoldId, { name: string; note: string; speed: number; hitbox: number }>,
  lengthM: 12,
  powerPeriodMs: 1200,
  /** Vùng xanh: |lực − 0,5| ≤ 0,125 (rộng 25%); vùng vàng thêm 0,125 mỗi bên; còn lại vùng đỏ. */
  greenHalf: 0.125,
  yellowHalf: 0.25,
  /** Vùng vàng = xuất phát chậm; vùng đỏ = thuyền nghiêng ngay (một lần va chạm) và cũng xuất phát chậm. */
  slowStartMs: 1000,
  trashSlowMs: 1000,
  whirlSpinMs: 1500,
  maxHits: 3,
  /** Rãnh: x từ −1 (bờ trái) tới 1 (bờ phải). */
  boatHalfWidth: 0.12,
  trashRadius: 0.14,
  trashCount: 8,
  whirlAtM: [4.5, 8.5],
  whirlDepthM: 0.5,
  /** Tốc độ lái (đơn vị bề ngang rãnh mỗi giây). */
  steerSpeed: 1.8,
  /** Giờ về đích của các bạn (giây). Quân luôn nhanh hơn mọi thuyền người chơi (nhanh nhất 25 s); Hạ chậm hơn mọi thuyền về đích. */
  rivals: { quan: 24, chau: 29.5, ha: 38 },
  endHoldMs: 1600,
} as const;

/** Thanh lực sau khi giữ `heldMs`: sóng tam giác 0 → 1 → 0, chu kỳ 1,2 giây. */
export const powerAt = (heldMs: number) => {
  const k = (heldMs % BOAT.powerPeriodMs) / BOAT.powerPeriodMs;
  return k < 0.5 ? k * 2 : 2 - k * 2;
};
export const zoneOf = (power: number): LaunchZone => {
  const d = Math.abs(power - 0.5);
  return d <= BOAT.greenHalf ? 'green' : d <= BOAT.yellowHalf ? 'yellow' : 'red';
};

export interface Trash { m: number; x: number; kind: 'leaf' | 'wrapper' | 'stick'; hit: boolean }
export interface Whirl { m: number; side: -1 | 1; used: boolean }

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export function makeCourse(seed: number): { trash: Trash[]; whirls: Whirl[] } {
  const rand = rng(seed);
  const kinds = ['leaf', 'wrapper', 'stick'] as const;
  const trash = Array.from({ length: BOAT.trashCount }, (_, i) => ({
    m: 1.6 + i * 1.2 + rand() * 0.4, x: rand() * 1.4 - 0.7, kind: kinds[Math.floor(rand() * 3)], hit: false,
  }));
  const whirls = BOAT.whirlAtM.map(m => ({ m, side: (rand() < 0.5 ? -1 : 1) as -1 | 1, used: false }));
  return { trash, whirls };
}

/** Luật thuần: thời gian ms, quãng đường m. */
export class BoatLogic {
  phase: 'fold' | 'launch' | 'race' | 'finished' | 'capsized' = 'fold';
  fold: FoldId | null = null;
  zone: LaunchZone | null = null;
  pos = 0;
  x = 0;
  hits = 0;
  /** Thời gian đua (ms) tính từ lúc thả. */
  elapsed = 0;
  /** Còn đứng yên/quay vòng bao lâu (ms). */
  stall = 0;
  spinning = false;
  readonly trash: Trash[];
  readonly whirls: Whirl[];

  constructor(course: { trash: Trash[]; whirls: Whirl[] }) {
    this.trash = course.trash;
    this.whirls = course.whirls;
  }

  chooseFold(id: FoldId) {
    if (this.phase !== 'fold' || !BOAT.folds[id]) return false;
    this.fold = id;
    this.phase = 'launch';
    return true;
  }

  launch(power: number): LaunchZone | null {
    if (this.phase !== 'launch') return null;
    this.zone = zoneOf(power);
    if (this.zone !== 'green') this.stall = BOAT.slowStartMs;
    if (this.zone === 'red') this.hits++;
    this.phase = 'race';
    return this.zone;
  }

  /** `steer`: −1 trái · 0 · 1 phải. */
  update(dtMs: number, steer = 0) {
    if (this.phase !== 'race') return;
    this.elapsed += dtMs;
    const dt = dtMs / 1000;
    this.x = Math.max(-1 + BOAT.boatHalfWidth, Math.min(1 - BOAT.boatHalfWidth, this.x + steer * BOAT.steerSpeed * dt));
    if (this.stall > 0) {
      this.stall = Math.max(0, this.stall - dtMs);
      if (!this.stall) this.spinning = false;
      return;
    }
    const before = this.pos;
    this.pos = Math.min(BOAT.lengthM, this.pos + BOAT.folds[this.fold!].speed * dt);
    const reach = BOAT.trashRadius + BOAT.boatHalfWidth * BOAT.folds[this.fold!].hitbox;
    for (const t of this.trash) {
      if (t.hit || t.m < before - 0.15 || t.m > this.pos + 0.15 || Math.abs(t.x - this.x) > reach) continue;
      t.hit = true;
      this.hits++;
      this.stall = BOAT.trashSlowMs;
      if (this.hits >= BOAT.maxHits) { this.phase = 'capsized'; return; }
    }
    for (const w of this.whirls) {
      if (w.used || this.pos < w.m - BOAT.whirlDepthM / 2 || before > w.m + BOAT.whirlDepthM / 2 || this.x * w.side < 0) continue;
      w.used = true;
      this.stall = Math.max(this.stall, BOAT.whirlSpinMs);
      this.spinning = true;
    }
    if (this.pos >= BOAT.lengthM) this.phase = 'finished';
  }

  /** Thứ hạng: Quân 1; người chơi 2 hoặc 3 (so với Châu); Hạ sau; lật = 5 (cùng Đức). */
  get rank() {
    if (this.phase === 'capsized') return 5;
    if (this.phase !== 'finished') return null;
    return this.elapsed / 1000 < BOAT.rivals.chau ? 2 : 3;
  }

  /** Thứ hạng không đưa vào `score` (khung kết quả ghi "Điểm"); nó nằm trong `story()` và băng chữ cuối ván. */
  result(): MinigameResult { return { result: this.phase === 'finished' ? 'win' : 'lose' }; }

  /** Bản ghi kể chuyện (GDD `02` §4.2 `minigames.boat.result`). */
  story() {
    return { fold: this.fold, launch: this.zone, rank: this.rank, capsized: this.phase === 'capsized', time_s: Math.round(this.elapsed / 100) / 10 };
  }
}

const W = 480, H = 330, INK = '#3a2c26', RED = '#d8332a';
const GX = 200, GHALF = 92, BOAT_Y = 250, PX_PER_M = 70;
const COLORS: Record<FoldId, string> = { sail: '#f6f2e8', roof: '#f2d98a', double: '#bfe0f2' };
const sx = (x: number) => GX + x * GHALF;

export default {
  id: 'mg_boat',
  title: 'Đua thuyền giấy',
  kind: 'K5',
  rules: { lines: [
    'Chọn kiểu gấp, rồi giữ chuột (hoặc Space) cho thanh lực chạy; thả lúc kim ở vùng xanh.',
    'Lái bằng A/D, ←/→ hoặc giữ chuột kéo trái/phải để tránh rác và xoáy nước.',
    'Đụng rác 3 lần là thuyền lật. Về đích không lật là thắng.',
  ] },
  mount(el, ctx) {
    const logic = new BoatLogic(makeCourse(ctx.seed));
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;align-items:center;user-select:none';
    wrap.dataset.testid = 'mg-boat';
    const folds = document.createElement('div');
    folds.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center';
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.dataset.testid = 'mg-boat-canvas';
    canvas.style.cssText = `display:none;width:100%;max-width:${W}px;aspect-ratio:${W}/${H};border:2px solid ${INK};border-radius:12px;touch-action:none;cursor:pointer`;
    wrap.append(folds, canvas);
    el.append(wrap);
    const g = canvas.getContext('2d')!;
    g.scale(dpr, dpr);

    const ids = Object.keys(BOAT.folds) as FoldId[];
    let foldSel = 0;
    const renderFolds = () => {
      folds.innerHTML = ids.map((id, i) => `<button data-fold="${id}" style="display:flex;flex-direction:column;gap:2px;min-width:132px;
        ${i === foldSel ? `box-shadow:0 0 0 3px ${INK};background:#ffd978;` : ''}"><b>${i + 1}. ${BOAT.folds[id].name}</b><span style="font-weight:600;font-size:13px">${BOAT.folds[id].note}</span></button>`).join('');
    };
    renderFolds();

    let paused = false, finished = false, raf = 0, lastReal = performance.now(), t = 0;
    let charging = false, chargeT = 0, endT = -1;
    let steerKeys = 0, pointerSteer: number | null = null;
    const keys = new Set<string>();

    const choose = (id: FoldId) => {
      if (paused || !logic.chooseFold(id)) return;
      folds.style.display = 'none';
      canvas.style.display = 'block';
      raf = requestAnimationFrame(frame);
    };
    const release = () => {
      if (!charging || paused) return;
      charging = false;
      logic.launch(powerAt(t - chargeT));
    };

    const drawBoat = (x: number, y: number, color: string, tilt: number, scale = 1) => {
      g.save(); g.translate(x, y); g.rotate(tilt); g.scale(scale, scale);
      g.fillStyle = color; g.strokeStyle = INK; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-16, 0); g.lineTo(16, 0); g.lineTo(10, 10); g.lineTo(-10, 10); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -20); g.lineTo(11, -2); g.closePath(); g.fill(); g.stroke();
      g.restore();
    };

    const draw = () => {
      g.fillStyle = '#d9d2c3'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#7fb3cf'; g.fillRect(GX - GHALF, 0, GHALF * 2, H);
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2;
      const flow = (logic.pos * PX_PER_M) % 40;
      for (let y = -40; y < H; y += 40) { g.beginPath(); g.moveTo(GX - 30, y + flow); g.lineTo(GX - 10, y + flow + 8); g.stroke(); g.beginPath(); g.moveTo(GX + 30, y + flow + 20); g.lineTo(GX + 50, y + flow + 28); g.stroke(); }
      const sy = (m: number) => BOAT_Y - (m - logic.pos) * PX_PER_M;
      // vạch đích
      const fy = sy(BOAT.lengthM);
      if (fy > -10) { g.fillStyle = INK; for (let i = 0; i < 12; i++) if (i % 2 === 0) g.fillRect(GX - GHALF + i * (GHALF / 6), fy - 4, GHALF / 6, 8); }
      for (const w of logic.whirls) {
        const y = sy(w.m);
        if (y < -40 || y > H + 40) continue;
        const cx = GX + w.side * GHALF / 2;
        g.strokeStyle = '#2f6a8c'; g.lineWidth = 2;
        g.beginPath();
        for (let a = 0; a < Math.PI * 6; a += 0.2) { const r = 3 + a * 2.2; g.lineTo(cx + Math.cos(a + t / 200) * r, y + Math.sin(a + t / 200) * r * 0.6); }
        g.stroke();
      }
      for (const tr of logic.trash) {
        const y = sy(tr.m);
        if (y < -20 || y > H + 20 || tr.hit) continue;
        const x = sx(tr.x);
        g.strokeStyle = INK; g.lineWidth = 1.5;
        if (tr.kind === 'leaf') { g.fillStyle = '#5f9a4a'; g.beginPath(); g.ellipse(x, y, 13, 6, 0.6, 0, Math.PI * 2); g.fill(); g.stroke(); }
        else if (tr.kind === 'wrapper') { g.fillStyle = '#e58fb5'; g.fillRect(x - 10, y - 6, 20, 12); g.strokeRect(x - 10, y - 6, 20, 12); }
        else { g.fillStyle = '#d8b27a'; g.save(); g.translate(x, y); g.rotate(-0.5); g.fillRect(-14, -3, 28, 6); g.strokeRect(-14, -3, 28, 6); g.restore(); }
      }
      const fold = logic.fold ?? 'sail';
      const tilt = logic.phase === 'capsized' ? Math.min(Math.PI / 2, (t - endT + BOAT.endHoldMs) / 300) : logic.spinning ? t / 120 : logic.zone === 'red' && logic.stall > 0 ? 0.5 : 0;
      drawBoat(sx(logic.x), BOAT_Y, COLORS[fold], tilt);
      // cột tiến độ bên phải: Quân, Châu, Hạ chạy theo giờ; Đức lật ở vạch xuất phát
      const TX = 340, TTOP = 40, TBOT = 290;
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(TX, TTOP); g.lineTo(TX, TBOT); g.stroke();
      const race = logic.phase === 'fold' || logic.phase === 'launch' ? 0 : logic.elapsed / 1000;
      const lane = (name: string, k: number, color: string, i: number, flipped = false) => {
        const y = TBOT - Math.min(1, k) * (TBOT - TTOP);
        const x = TX + 22 + i * 30;
        drawBoat(x, y, color, flipped ? Math.PI / 2 : 0, 0.55);
        g.fillStyle = INK; g.font = '700 11px Nunito, sans-serif'; g.textAlign = 'center';
        g.fillText(name, x, TBOT + 16 + (i % 2) * 12);
      };
      lane('Quân', race / BOAT.rivals.quan, '#cde8c4', 0);
      lane('Châu', race / BOAT.rivals.chau, '#e4d4f2', 1);
      lane('Hạ', race / BOAT.rivals.ha, '#f7d0de', 2);
      lane('Đức', 0, '#f6c9a8', 3, logic.phase !== 'fold' && logic.phase !== 'launch');
      g.fillStyle = INK; g.font = '800 15px Nunito, sans-serif'; g.textAlign = 'left';
      g.fillText(`${logic.pos.toFixed(1)}/${BOAT.lengthM} m`, 12, 22);
      g.fillText(`Va chạm: ${logic.hits}/${BOAT.maxHits}`, 12, 42);
      if (logic.phase === 'launch') {
        // thanh lực
        const BX = 22, BTOP = 80, BH = 180, p = charging ? powerAt(t - chargeT) : 0;
        g.fillStyle = '#e8a59b'; g.fillRect(BX, BTOP, 26, BH);
        g.fillStyle = '#f2d27a'; g.fillRect(BX, BTOP + BH * (0.5 - BOAT.yellowHalf), 26, BH * BOAT.yellowHalf * 2);
        g.fillStyle = '#8fd08a'; g.fillRect(BX, BTOP + BH * (0.5 - BOAT.greenHalf), 26, BH * BOAT.greenHalf * 2);
        g.strokeStyle = INK; g.strokeRect(BX, BTOP, 26, BH);
        g.fillStyle = INK; g.beginPath(); const py = BTOP + BH * (1 - p); g.moveTo(BX + 30, py); g.lineTo(BX + 42, py - 7); g.lineTo(BX + 42, py + 7); g.fill();
      }
      if (endT >= 0) {
        g.fillStyle = 'rgba(255,250,238,.9)'; g.fillRect(GX - 90, 110, 180, 44);
        g.strokeStyle = INK; g.strokeRect(GX - 90, 110, 180, 44);
        g.fillStyle = logic.phase === 'capsized' ? RED : INK; g.font = '800 20px Nunito, sans-serif'; g.textAlign = 'center';
        g.fillText(logic.phase === 'capsized' ? 'Thuyền lật!' : `Về thứ ${logic.rank}`, GX, 139);
      }
    };

    const frame = (real: number) => {
      const dt = Math.min(real - lastReal, 100);
      lastReal = real;
      if (!paused) {
        t += dt;
        if (logic.phase === 'race') {
          let steer = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
          if (pointerSteer !== null && !steer) steer = Math.abs(pointerSteer - logic.x) < 0.04 ? 0 : Math.sign(pointerSteer - logic.x);
          steerKeys = steer;
          logic.update(dt, steerKeys);
        }
        if ((logic.phase === 'finished' || logic.phase === 'capsized') && endT < 0) {
          endT = t + BOAT.endHoldMs;
          if (ctx.save.get('story') === undefined) ctx.save.set('story', logic.story());
        }
        if (endT >= 0 && t >= endT && !finished) {
          finished = true;
          draw();
          ctx.onFinish(logic.result());
          return;
        }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    };
    folds.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button');
      if (b?.dataset.fold) choose(b.dataset.fold as FoldId);
    });
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || paused) return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
      if (logic.phase === 'launch' && !charging) { charging = true; chargeT = t; }
      else if (logic.phase === 'race') pointerSteer = (local(e).x - GX) / GHALF;
    };
    const onMove = (e: PointerEvent) => { if (pointerSteer !== null && !paused) pointerSteer = (local(e).x - GX) / GHALF; };
    const onUp = () => { pointerSteer = null; release(); };
    const onKey = (e: KeyboardEvent) => {
      if (paused) return;
      if (logic.phase === 'fold') {
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { foldSel = (foldSel + (e.code === 'ArrowLeft' ? -1 : 1) + ids.length) % ids.length; renderFolds(); }
        else if (/^(Digit|Numpad)[1-3]$/.test(e.code)) choose(ids[Number(e.code.slice(-1)) - 1]);
        else if (e.code === 'Enter' || e.code === 'Space') choose(ids[foldSel]);
        else return;
        e.preventDefault();
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (logic.phase === 'launch' && !charging && !e.repeat) { charging = true; chargeT = t; }
      } else if (['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight'].includes(e.code)) { e.preventDefault(); keys.add(e.code); }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys.delete(e.code); if (e.code === 'Space') release(); };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);

    return {
      // Đang nạp lực mà tạm dừng thì hủy lần nạp (không tự thả).
      pause() { paused = true; charging = false; pointerSteer = null; keys.clear(); },
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
