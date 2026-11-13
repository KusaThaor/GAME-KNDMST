import { LIMITS, validateBatch, type AppEnvironment, type CollectBatch } from '../../shared/events.js';

/** Nơi lưu lô event. Bản thật dùng Firestore; unit test dùng bản giả trong bộ nhớ. */
export interface BatchStore {
  /** Tạo document theo batch_id. Trả 'duplicate' nếu đã có (client gửi lại). */
  createBatch(batchId: string, doc: StoredBatch): Promise<'created' | 'duplicate'>;
}

export interface StoredBatch {
  batch_id: string;
  environment: AppEnvironment;        // do SERVER quyết định, client không tự khai được
  build_version: string;              // client báo
  server_build: string;               // mã commit của function đang chạy
  release_stage: CollectBatch['release_stage'];
  server_received_ms: number;         // Date.now() phía server (UTC)
  first_client_time: string;
  event_count: number;
  dropped_count: number;
  events: CollectBatch['events'];
}

export interface CollectDeps {
  store: () => BatchStore;            // khởi tạo lười để lỗi cấu hình trả 503 rõ ràng
  environment: AppEnvironment;
  serverBuild: string;
  now?: () => number;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

/** Chặn gửi từ trang khác. Ở production bắt buộc có Origin trùng host. */
function originAllowed(req: Request, env: AppEnvironment): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return env === 'test';                // curl/bot thử chỉ được phép ở môi trường test
  try {
    const o = new URL(origin);
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host;
    if (o.host === host) return true;
    return env === 'test' && (o.hostname === 'localhost' || o.hostname === '127.0.0.1');
  } catch { return false; }
}

export function makeCollectHandler(deps: CollectDeps) {
  const now = deps.now ?? Date.now;
  return async function POST(req: Request): Promise<Response> {
    if (!originAllowed(req, deps.environment)) return json(403, { ok: false, error: 'origin_not_allowed' });

    const len = Number(req.headers.get('content-length') ?? '0');
    if (len > LIMITS.maxBodyBytes) return json(413, { ok: false, error: 'body_too_large' });
    let text: string;
    try { text = await req.text(); } catch { return json(400, { ok: false, error: 'unreadable_body' }); }
    if (text.length > LIMITS.maxBodyBytes) return json(413, { ok: false, error: 'body_too_large' });

    let body: unknown;
    try { body = JSON.parse(text); } catch { return json(400, { ok: false, error: 'bad_json' }); }

    const v = validateBatch(body);
    if (!v.ok || !v.batch) return json(400, { ok: false, error: v.error, dropped: v.dropped.slice(0, 20) });

    const b = v.batch;
    const doc: StoredBatch = {
      batch_id: b.batch_id,
      environment: deps.environment,
      build_version: b.build_version,
      server_build: deps.serverBuild,
      release_stage: b.release_stage,
      server_received_ms: now(),
      first_client_time: b.events.map((e) => e.client_time).sort()[0],
      event_count: b.events.length,
      dropped_count: v.dropped.length,
      events: b.events,
    };

    let store: BatchStore;
    try { store = deps.store(); } catch (err) {
      console.error('[collect] store not configured', (err as Error).message);
      return json(503, { ok: false, error: 'storage_not_configured' });
    }
    try {
      const r = await store.createBatch(b.batch_id, doc);
      return json(200, { ok: true, duplicate: r === 'duplicate', accepted: b.events.length, dropped: v.dropped });
    } catch (err) {
      const msg = (err as Error).message ?? '';
      console.error('[collect] write failed', msg);
      // Hết hạn mức miễn phí trong ngày (gói Spark) → client giữ lại và gửi lại sau.
      if (/RESOURCE_EXHAUSTED|quota/i.test(msg)) return json(429, { ok: false, error: 'quota_exhausted' });
      return json(502, { ok: false, error: 'write_failed' });
    }
  };
}
