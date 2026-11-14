/** Âm thanh tạm, tổng hợp bằng WebAudio (không cần file). Trình duyệt chặn âm thanh trước thao tác đầu → bỏ qua, không lỗi. */
let ctx: AudioContext | null = null;

export function playTransitionSound(kind: 'to_day' | 'to_hub'): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(kind === 'to_day' ? 330 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(kind === 'to_day' ? 660 : 260, now + 0.6);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.75);
  } catch { /* không có âm thanh cũng không sao */ }
}
