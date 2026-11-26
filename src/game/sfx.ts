/**
 * Tổng hợp âm thanh (WebAudio, không cần file).
 * Trình duyệt chặn trước thao tác đầu hoặc chạy headless/test không có AudioContext → bỏ qua im lặng, không lỗi.
 */
let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const Ctor =
      (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
      (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  freqEnd?: number;
  delay?: number;
  dur: number;
  gain: number;
  attack?: number;
}

function playTone(ac: AudioContext, opts: ToneOpts): void {
  const start = ac.currentTime + (opts.delay ?? 0);
  const atk = Math.min(opts.attack ?? 0.01, opts.dur * 0.4);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(Math.max(20, opts.freq), start);
  if (opts.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), start + opts.dur);
  }
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain), start + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, start + opts.dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + opts.dur + 0.02);
}

interface NoiseOpts {
  delay?: number;
  dur: number;
  filterType?: BiquadFilterType;
  freq: number;
  q?: number;
  gain: number;
  attack?: number;
}

function playNoise(ac: AudioContext, opts: NoiseOpts): void {
  const start = ac.currentTime + (opts.delay ?? 0);
  const sampleCount = Math.max(1, Math.floor(ac.sampleRate * opts.dur));
  const buffer = ac.createBuffer(1, sampleCount, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) data[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = opts.filterType ?? 'bandpass';
  filter.frequency.setValueAtTime(opts.freq, start);
  if (opts.q !== undefined) filter.Q.setValueAtTime(opts.q, start);

  const g = ac.createGain();
  const atk = Math.min(opts.attack ?? 0.015, opts.dur * 0.4);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain), start + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, start + opts.dur);

  src.connect(filter).connect(g).connect(ac.destination);
  src.start(start);
  src.stop(start + opts.dur + 0.02);
}

const SFX_SYNTH: Record<string, (ac: AudioContext) => void> = {
  sfx_book_drop: (ac) => {
    playTone(ac, { type: 'triangle', freq: 145, freqEnd: 48, dur: 0.14, gain: 0.14, attack: 0.005 });
    playNoise(ac, { filterType: 'bandpass', freq: 900, q: 1.2, dur: 0.08, gain: 0.07, attack: 0.004 });
  },
  sfx_school_drum_3beats: (ac) => {
    for (const delay of [0, 0.28, 0.56]) {
      playTone(ac, { type: 'sine', freq: 132, freqEnd: 58, delay, dur: 0.24, gain: 0.16, attack: 0.006 });
      playNoise(ac, { filterType: 'lowpass', freq: 420, delay, dur: 0.06, gain: 0.05, attack: 0.003 });
    }
  },
  sfx_shuttle_kick: (ac) => {
    playTone(ac, { type: 'triangle', freq: 270, freqEnd: 110, dur: 0.09, gain: 0.11, attack: 0.004 });
    playNoise(ac, { filterType: 'highpass', freq: 1800, dur: 0.06, gain: 0.04, attack: 0.003 });
  },
  sfx_chalk_wipe: (ac) => {
    playNoise(ac, { filterType: 'bandpass', freq: 1400, q: 1.6, dur: 0.26, gain: 0.06, attack: 0.04 });
  },
  sfx_camera_shutter: (ac) => {
    playNoise(ac, { filterType: 'highpass', freq: 2600, dur: 0.035, gain: 0.11, attack: 0.002 });
    playTone(ac, { type: 'sine', freq: 2200, freqEnd: 900, dur: 0.03, gain: 0.06, attack: 0.002 });
    playNoise(ac, { filterType: 'highpass', freq: 2200, delay: 0.055, dur: 0.04, gain: 0.09, attack: 0.002 });
  },
  sfx_rain_pour: (ac) => {
    playNoise(ac, { filterType: 'bandpass', freq: 1100, q: 0.7, dur: 0.9, gain: 0.05, attack: 0.18 });
  },
  sfx_summer_rain_thunder: (ac) => {
    playNoise(ac, { filterType: 'lowpass', freq: 140, dur: 1.2, gain: 0.14, attack: 0.08 });
    playTone(ac, { type: 'sine', freq: 65, freqEnd: 36, dur: 0.9, gain: 0.12, attack: 0.05 });
    playNoise(ac, { filterType: 'bandpass', freq: 1000, q: 0.7, delay: 0.15, dur: 0.9, gain: 0.05, attack: 0.15 });
  },
  sfx_birds_after_rain: (ac) => {
    for (const [delay, f0, f1] of [[0, 2300, 3100], [0.13, 2700, 2200], [0.28, 2500, 3300]] as const) {
      playTone(ac, { type: 'sine', freq: f0, freqEnd: f1, delay, dur: 0.08, gain: 0.05, attack: 0.01 });
    }
  },
  sfx_tick: (ac) => {
    playTone(ac, { type: 'sine', freq: 880, freqEnd: 1320, dur: 0.075, gain: 0.07, attack: 0.004 });
  },
  sfx_message_sent: (ac) => {
    playTone(ac, { type: 'sine', freq: 520, freqEnd: 1040, dur: 0.14, gain: 0.08, attack: 0.008 });
    playNoise(ac, { filterType: 'bandpass', freq: 1800, dur: 0.08, gain: 0.03, attack: 0.01 });
  },
  sfx_paper_fold: (ac) => {
    playNoise(ac, { filterType: 'bandpass', freq: 2200, q: 1.4, dur: 0.12, gain: 0.06, attack: 0.015 });
  },
  sfx_water_splash: (ac) => {
    playNoise(ac, { filterType: 'bandpass', freq: 1300, q: 0.9, dur: 0.25, gain: 0.08, attack: 0.01 });
    playTone(ac, { type: 'sine', freq: 420, freqEnd: 760, delay: 0.04, dur: 0.08, gain: 0.05, attack: 0.005 });
  },
};

const SFX_ALIASES: Record<string, string> = {
  tick: 'sfx_tick',
  sfx_school_drum_recess: 'sfx_school_drum_3beats',
  sfx_drum_roll_summer_cicadas: 'sfx_school_drum_3beats',
  sfx_paper_unfold: 'sfx_paper_fold',
  sfx_cardboard_rustle: 'sfx_paper_fold',
  sfx_box_open: 'sfx_paper_fold',
  sfx_tin_box_rattle: 'sfx_tick',
  sfx_ambient_room_night: 'sfx_rain_pour',
};

export const KNOWN_SFX_CUES: readonly string[] = Object.keys(SFX_SYNTH);

/** Phát một mã âm thanh (`sfx_*`); thiếu AudioContext hoặc không rõ mã → bỏ qua im lặng. */
export function playSfx(cue: string): void {
  try {
    if (!cue) return;
    const key = SFX_ALIASES[cue] ?? cue;
    const synth = SFX_SYNTH[key];
    if (!synth) return;
    const ac = getAudioContext();
    if (!ac) return;
    synth(ac);
  } catch { /* không có âm thanh cũng không sao */ }
}

export function playTransitionSound(kind: 'to_day' | 'to_hub'): void {
  try {
    const ac = getAudioContext();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator(), gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(kind === 'to_day' ? 330 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(kind === 'to_day' ? 660 : 260, now + 0.6);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc.connect(gain).connect(ac.destination);
    osc.start(now); osc.stop(now + 0.75);
  } catch { /* không có âm thanh cũng không sao */ }
}
