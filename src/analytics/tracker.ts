/**
 * Bộ gom event phía trình duyệt: giữ trong hàng đợi, gửi theo lô tới /api/collect.
 * - Chỉ gửi khi người chơi đã đồng ý (consent = 'granted'); từ chối vẫn chơi bình thường.
 * - Gửi lại có giới hạn; cùng batch_id nên server không ghi trùng.
 * - Gửi theo lô ~60 giây/lần để tiết kiệm hạn mức ghi miễn phí của Firestore (20K/ngày).
 */
import type { AnalyticsEvent, CollectBatch, EventName, PropValue, ReleaseStage } from '../../shared/events';
import { FORBIDDEN_PROP_KEYS } from '../../shared/events';

export type Consent = 'unknown' | 'granted' | 'denied';

const K = {
  visitor: 'htx.visitor_id',
  consent: 'htx.consent',
  session: 'htx.session',
  queue: 'htx.queue',
} as const;
const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_MS = 60_000;
const MAX_QUEUE = 1000;
const IMMEDIATE: ReadonlySet<EventName> = new Set([
  'game_started', 'memory_day_started', 'memory_day_completed', 'milestone_completed', 'public_demo_completed', 'feedback_submitted', 'pipeline_test',
]);

const uuid = () => crypto.randomUUID();
const safeGet = (s: Storage, k: string) => { try { return s.getItem(k); } catch { return null; } };
const safeSet = (s: Storage, k: string, v: string) => { try { s.setItem(k, v); } catch { /* bộ nhớ đầy/bị chặn */ } };

interface PendingBatch { batch: CollectBatch; tries: number }
export type FlushResult = { ok: boolean; status?: number; body?: unknown };

export interface TrackerOptions {
  endpoint?: string;
  releaseStage: ReleaseStage;
  buildVersion?: string;
  fetchImpl?: typeof fetch;
  autoFlush?: boolean;
}

export class Tracker {
  private queue: AnalyticsEvent[] = [];
  private inflight: PendingBatch | null = null;
  private inflightPromise: Promise<FlushResult | null> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private attemptId: string | null = null;
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;
  readonly buildVersion: string;

  constructor(private opts: TrackerOptions) {
    this.endpoint = opts.endpoint ?? '/api/collect';
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
    this.buildVersion = opts.buildVersion ?? __BUILD_VERSION__;
    if (this.consent === 'granted') this.restore();
    if (opts.autoFlush !== false && typeof window !== 'undefined') {
      this.timer = setInterval(() => void this.flush(), FLUSH_MS);
      window.addEventListener('pagehide', () => this.flushBeacon());
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this.flushBeacon(); });
    }
  }

  get consent(): Consent { return (safeGet(localStorage, K.consent) as Consent | null) ?? 'unknown'; }

  setConsent(c: Consent) {
    safeSet(localStorage, K.consent, c);
    if (c === 'denied') { this.queue = []; try { localStorage.removeItem(K.queue); localStorage.removeItem(K.visitor); } catch { /* */ } }
    if (c === 'granted') { this.persist(); void this.flush(); }
  }

  setAttempt(id: string | null) { this.attemptId = id; }

  private memVisitor: string | null = null;
  private visitorId(): string {
    // Chưa đồng ý thì chỉ dùng MỘT ID tạm trong bộ nhớ (không ghi xuống máy); khi đồng ý, chính ID đó được giữ lại
    // để các event xếp hàng trước lúc hỏi (game_load_started…) không mang ID lạc loài.
    let v = safeGet(localStorage, K.visitor);
    if (!v) { v = (this.memVisitor ??= uuid()); if (this.consent === 'granted') safeSet(localStorage, K.visitor, v); }
    return v;
  }

  private sessionId(): string {
    const now = Date.now();
    const raw = safeGet(sessionStorage, K.session);
    let s: { id: string; last: number } | null = null;
    try { s = raw ? JSON.parse(raw) : null; } catch { s = null; }
    if (!s || now - s.last > SESSION_IDLE_MS) s = { id: uuid(), last: now };
    s.last = now;
    safeSet(sessionStorage, K.session, JSON.stringify(s));
    return s.id;
  }

  track(name: EventName, props?: Record<string, PropValue>) {
    if (this.consent === 'denied') return;
    if (props) for (const k of Object.keys(props)) {
      if (FORBIDDEN_PROP_KEYS.has(k.toLowerCase())) { console.warn(`[analytics] bỏ khóa cấm: ${k}`); delete props[k]; }
    }
    this.queue.push({
      event_id: uuid(), name, client_time: new Date().toISOString(),
      visitor_id: this.visitorId(), session_id: this.sessionId(), attempt_id: this.attemptId,
      ...(props && Object.keys(props).length ? { props } : {}),
    });
    if (this.queue.length > MAX_QUEUE) this.queue.splice(0, this.queue.length - MAX_QUEUE);
    this.persist();
    if (IMMEDIATE.has(name)) void this.flush();
  }

  private persist() {
    if (this.consent !== 'granted') return;
    safeSet(localStorage, K.queue, JSON.stringify(this.queue.slice(-MAX_QUEUE)));
  }

  private restore() {
    try { const q = JSON.parse(safeGet(localStorage, K.queue) ?? '[]'); if (Array.isArray(q)) this.queue = q; } catch { /* */ }
  }

  private takeBatch(): CollectBatch | null {
    if (!this.queue.length) return null;
    const events = this.queue.splice(0, 200);
    this.persist();
    return { batch_id: uuid(), build_version: this.buildVersion, release_stage: this.opts.releaseStage, events };
  }

  /** Gửi một lô. Trả về kết quả từ server (để test và trang kiểm tra hiển thị). */
  flush(): Promise<FlushResult | null> {
    if (this.consent !== 'granted') return Promise.resolve(null);
    // đang gửi một lô → chờ xong rồi gửi tiếp phần còn lại (nếu có)
    if (this.inflightPromise) return this.inflightPromise.then((r) => (this.queue.length ? this.flush() : r));
    if (!this.queue.length) return Promise.resolve(null);
    this.inflightPromise = this.send().finally(() => { this.inflightPromise = null; });
    return this.inflightPromise;
  }

  private async send(): Promise<FlushResult | null> {
    const batch = this.takeBatch();
    if (!batch) return null;
    this.inflight = { batch, tries: 0 };
    let last: FlushResult = { ok: false };
    while (this.inflight && this.inflight.tries < 3) {
      this.inflight.tries++;
      try {
        const res = await this.fetchImpl(this.endpoint, {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(batch), keepalive: true,
        });
        const body = await res.json().catch(() => null);
        last = { ok: res.ok, status: res.status, body };
        if (res.ok || res.status === 400 || res.status === 403 || res.status === 413) break; // không gửi lại lỗi dữ liệu
      } catch { last = { ok: false }; }
      await new Promise((r) => setTimeout(r, 800 * this.inflight!.tries));
    }
    if (!last.ok && last.status !== 400 && last.status !== 403 && last.status !== 413) {
      this.queue.unshift(...batch.events); // trả lại hàng đợi, lần sau gửi lại (batch_id mới, event_id giữ nguyên)
      this.persist();
    }
    this.inflight = null;
    return last;
  }

  /** Khi đóng tab: gửi nhanh bằng sendBeacon (không chờ phản hồi). */
  flushBeacon() {
    if (this.consent !== 'granted' || typeof navigator === 'undefined' || !navigator.sendBeacon) return;
    const batch = this.takeBatch();
    if (!batch) return;
    const ok = navigator.sendBeacon(this.endpoint, new Blob([JSON.stringify(batch)], { type: 'application/json' }));
    if (!ok) { this.queue.unshift(...batch.events); this.persist(); }
  }

  dispose() { if (this.timer) clearInterval(this.timer); }
}
