export const MG_INK = '#3a2c26';
export const MG_RED = '#d8332a';
export const MG_FONT = 'Nunito, sans-serif';

/** Chuỗi font CSS/Canvas chuẩn cho minigame. */
export const mgFont = (size: number, weight: number | string = 800) => `${weight} ${size}px ${MG_FONT}`;

export interface HiDpiCanvasOpts {
  width: number;
  height: number;
  testId?: string;
  cursor?: string;
  /** Phần viền (px) cần trừ khi đổi tọa độ PointerEvent sang tọa độ logic. */
  inset?: number;
  /** Style CSS bổ sung/ghi đè lên style chuẩn của khung canvas minigame. */
  css?: string;
  /** Có gắn canvas vào `el` hay giữ làm canvas phụ (mặc định `true` khi có `el`). */
  append?: boolean;
}

export interface HiDpiCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dpr: number;
  width: number;
  height: number;
  toLocal(e: PointerEvent | { clientX: number; clientY: number }): { x: number; y: number };
}

/** Tạo `<canvas>` HiDPI (DPR ≤ 2), scale sẵn ngữ cảnh 2D và cung cấp hàm đổi tọa độ con trỏ. */
export function createHiDpiCanvas(el: HTMLElement | null, opts: HiDpiCanvasOpts): HiDpiCanvas {
  const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio : globalThis.devicePixelRatio;
  const dpr = Math.min(rawDpr || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = opts.width * dpr;
  canvas.height = opts.height * dpr;
  if (opts.testId) canvas.dataset.testid = opts.testId;
  const baseCss = `display:block;width:100%;max-width:${opts.width}px;aspect-ratio:${opts.width}/${opts.height};margin:0 auto;border:2px solid ${MG_INK};border-radius:12px;touch-action:none;cursor:${opts.cursor ?? 'pointer'};user-select:none`;
  canvas.style.cssText = opts.css ? `${baseCss};${opts.css}` : baseCss;
  if (el && opts.append !== false) el.append(canvas);

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const inset = opts.inset ?? 0;
  const toLocal = (e: PointerEvent | { clientX: number; clientY: number }) => {
    const r = canvas.getBoundingClientRect();
    const rw = r.width - inset * 2;
    const rh = r.height - inset * 2;
    return {
      x: (e.clientX - r.left - inset) * (rw ? opts.width / rw : 1),
      y: (e.clientY - r.top - inset) * (rh ? opts.height / rh : 1),
    };
  };

  return { canvas, ctx, dpr, width: opts.width, height: opts.height, toLocal };
}
