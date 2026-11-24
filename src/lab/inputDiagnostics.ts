/**
 * Bảng chẩn đoán chuột/touchpad — CHỈ có ở bản test (nằm trong src/lab, bản production không có).
 * Bật bằng `?play=1&inputdebug=1`. Ghi các sự kiện con trỏ + game đã quyết định gì + góc camera trước/sau,
 * tối đa MAX dòng (vòng tròn, không làm chậm game), có nút "Sao chép" để gửi lại cho nhóm phát triển.
 * Không in ra console, không gửi analytics.
 */
import type { GameHandle } from '../game/game';
import type { InputDebugEntry } from '../game/input';

const MAX = 400;
const SHOW = 14;

interface Row extends InputDebugEntry { t: number; yawBefore: number | null; pitchBefore: number | null; yawAfter: number | null; pitchAfter: number | null }

export type InputDiagnostics = ReturnType<typeof attachInputDiagnostics>;

export function attachInputDiagnostics(h: GameHandle) {
  const rows: Row[] = [];
  const pending: Row[] = [];
  const older: Row[] = [];
  const t0 = performance.now();
  const cam = () => { const d = h.day()?.scene.debug(); return d ? { yaw: d.yaw, pitch: d.pitch } : null; };
  const f = (n: number | null, k = 3) => (n === null ? '-' : n.toFixed(k));

  const box = document.createElement('div');
  box.setAttribute('data-testid', 'input-diagnostics');
  box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:50;width:min(560px,calc(100% - 16px));max-height:46vh;overflow:auto;'
    + 'background:rgba(20,16,14,.88);color:#f6efe1;font:11px/1.35 ui-monospace,Consolas,monospace;padding:8px;border-radius:8px;'
    + 'pointer-events:auto;touch-action:auto;user-select:text;-webkit-user-select:text';
  const head = document.createElement('div');
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:6px;margin:4px 0';
  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:0;white-space:pre-wrap';
  const btn = (label: string, act: string, fn: () => void) => {
    const b = document.createElement('button');
    b.textContent = label; b.dataset.act = act;
    b.style.cssText = 'font:inherit;padding:2px 8px;border-radius:6px;border:1px solid #f6efe1;background:#3a2c26;color:#f6efe1;cursor:pointer';
    b.addEventListener('click', fn);
    bar.appendChild(b);
    return b;
  };

  const env = () => [
    `build: ${__BUILD_VERSION__} · env: ${__APP_ENV__}`,
    `ua: ${navigator.userAgent}`,
    `dpr: ${devicePixelRatio} · pointer:fine=${matchMedia('(pointer: fine)').matches} coarse=${matchMedia('(pointer: coarse)').matches} any-fine=${matchMedia('(any-pointer: fine)').matches} · maxTouchPoints=${navigator.maxTouchPoints}`,
    `kiểu camera đã lưu: ${h.save.settings.camera_mode} · nhìn tự do: ${!!h.save.settings.free_look} · input.lookMode: ${h.input.lookMode} · thiết bị: ${h.input.device}`,
  ].join('\n');
  const line = (r: Row) => `${(r.t / 1000).toFixed(2).padStart(7)}s ${r.type.padEnd(18)} pt=${r.pointerType || '-'} id=${r.pointerId} btn=${r.button} btns=${r.buttons} `
    + `xy=${Math.round(r.x)},${Math.round(r.y)} mv=${r.mx},${r.my} tgt=${r.target} focus=${r.active} mode=${r.mode}${r.freeLook ? '+FL' : ''} `
    + `drag=${r.dragging ? 1 : 0} cap=${r.captured ? 1 : 0} lock=${r.locked ? 1 : 0} chờ=${f(r.pendingDx, 0)},${f(r.pendingDy, 0)} `
    + `yaw ${f(r.yawBefore)}→${f(r.yawAfter)} pitch ${f(r.pitchBefore)}→${f(r.pitchAfter)} | ${r.note}`;

  let hidden = false;
  btn('Sao chép', 'diag-copy', () => {
    const text = `${env()}\n---\n${rows.map(line).join('\n')}`;
    const done = () => { copyBtn.textContent = 'Đã chép ✓'; setTimeout(() => (copyBtn.textContent = 'Sao chép'), 1500); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
    else fallback(text, done);
  });
  const copyBtn = bar.lastElementChild as HTMLButtonElement;
  btn('Xóa', 'diag-clear', () => { rows.length = 0; pending.length = 0; dirty = true; });
  btn('Thu gọn', 'diag-toggle', () => { hidden = !hidden; pre.style.display = hidden ? 'none' : ''; });
  box.append(head, bar, pre);
  document.body.appendChild(box);

  function fallback(text: string, done: () => void) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch { /* người dùng tự bôi đen trong bảng */ }
    ta.remove();
  }

  let dirty = true;
  h.input.setDebugTap((e) => {
    const c = cam();
    const r: Row = { ...e, t: performance.now() - t0, yawBefore: c?.yaw ?? null, pitchBefore: c?.pitch ?? null, yawAfter: null, pitchAfter: null };
    rows.push(r);
    if (rows.length > MAX) rows.splice(0, rows.length - MAX);
    pending.push(r);
    dirty = true;
  });

  let lastDraw = 0;
  const frame = (now: number) => {
    // góc camera SAU khi vòng lặp game đã đọc chuyển động: đợi hết 1 khung trọn (thứ tự requestAnimationFrame không cố định)
    if (older.length) {
      const c = cam();
      for (const r of older) { r.yawAfter = c?.yaw ?? null; r.pitchAfter = c?.pitch ?? null; }
      older.length = 0;
    }
    if (pending.length) { older.push(...pending); pending.length = 0; }
    if (now - lastDraw > 200) {
      lastDraw = now;
      const c = cam();
      head.textContent = `CHẨN ĐOÁN CHUỘT/TOUCHPAD · kiểu=${h.save.settings.camera_mode} (${h.input.lookMode}) · nhìn tự do=${h.input.freeLook ? 'bật' : 'tắt'} · khóa=${h.input.pointerLocked ? 'có' : 'không'} · yaw=${f(c?.yaw ?? null)} pitch=${f(c?.pitch ?? null)} · ${rows.length}/${MAX} dòng`;
      if (dirty && !hidden) { pre.textContent = rows.slice(-SHOW).map(line).join('\n'); dirty = false; }
    }
    raf = requestAnimationFrame(frame);
  };
  let raf = requestAnimationFrame(frame);

  return {
    rows: () => rows.map((r) => ({ ...r })),
    text: () => `${env()}\n---\n${rows.map(line).join('\n')}`,
    dispose() { cancelAnimationFrame(raf); h.input.setDebugTap(null); box.remove(); },
  };
}
