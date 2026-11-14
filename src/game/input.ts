/** Bàn phím + chuột cho phần chơi. Gom lại một chỗ để S2 thay bộ điều khiển thật mà không sửa nơi khác. */
export interface GameInput {
  down: Set<string>;
  /** Kéo chuột phải (kiểu A): độ xoay camera tích lũy từ lần đọc trước. */
  takeOrbit(): number;
  takeZoom(): number;
  onKey(fn: (code: string) => void): void;
  onPointer(fn: (kind: 'move' | 'click', ndcX: number, ndcY: number) => void): void;
  onActivity(fn: () => void): void;
  dispose(): void;
}

export function createInput(el: HTMLElement): GameInput {
  const down = new Set<string>();
  let orbit = 0, zoom = 0, dragging = false;
  const keyFns: ((code: string) => void)[] = [], ptrFns: ((k: 'move' | 'click', x: number, y: number) => void)[] = [], actFns: (() => void)[] = [];
  const typing = (e: Event) => { const t = e.target as HTMLElement | null; return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'); };
  const act = () => actFns.forEach((f) => f());
  const ndc = (e: MouseEvent): [number, number] => { const r = el.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)]; };

  const kd = (e: KeyboardEvent) => {
    if (typing(e)) return;
    if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    act();
    if (!e.repeat) keyFns.forEach((f) => f(e.code));
    down.add(e.code);
  };
  const ku = (e: KeyboardEvent) => down.delete(e.code);
  const md = (e: MouseEvent) => { if (e.button === 2) dragging = true; act(); };
  const mu = (e: MouseEvent) => { if (e.button === 2) dragging = false; };
  const mm = (e: MouseEvent) => { if (dragging) orbit += e.movementX * 0.005; ptrFns.forEach((f) => f('move', ...ndc(e))); };
  const ck = (e: MouseEvent) => { if ((e.target as HTMLElement).tagName === 'CANVAS') ptrFns.forEach((f) => f('click', ...ndc(e))); };
  const wh = (e: WheelEvent) => { zoom += Math.sign(e.deltaY) * 0.5; };
  const cm = (e: Event) => e.preventDefault();
  const blur = () => { down.clear(); dragging = false; };

  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', blur);
  el.addEventListener('mousedown', md); window.addEventListener('mouseup', mu); el.addEventListener('mousemove', mm);
  el.addEventListener('click', ck); el.addEventListener('wheel', wh, { passive: true }); el.addEventListener('contextmenu', cm);

  return {
    down,
    takeOrbit() { const v = orbit; orbit = 0; return v; },
    takeZoom() { const v = zoom; zoom = 0; return v; },
    onKey(fn) { keyFns.push(fn); },
    onPointer(fn) { ptrFns.push(fn); },
    onActivity(fn) { actFns.push(fn); },
    dispose() {
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur);
      el.removeEventListener('mousedown', md); window.removeEventListener('mouseup', mu); el.removeEventListener('mousemove', mm);
      el.removeEventListener('click', ck); el.removeEventListener('wheel', wh); el.removeEventListener('contextmenu', cm);
    },
  };
}
