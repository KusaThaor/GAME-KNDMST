import { describe, expect, it } from 'vitest';
import { validateBatch } from '../../shared/events';
import { makeCollectHandler, type BatchStore, type StoredBatch } from '../../api/_lib/collect';

const u = () => crypto.randomUUID();
const ev = (over: Record<string, unknown> = {}) => ({
  event_id: u(), name: 'pipeline_test', client_time: new Date().toISOString(),
  visitor_id: u(), session_id: u(), props: { label: 'hello', n: 1 }, ...over,
});
const batch = (events: unknown[], over: Record<string, unknown> = {}) => ({
  batch_id: u(), build_version: '20261113-abc1234', release_stage: 'prototype', events, ...over,
});

function memoryStore() {
  const docs = new Map<string, StoredBatch>();
  const store: BatchStore = {
    async createBatch(id, doc) { if (docs.has(id)) return 'duplicate'; docs.set(id, doc); return 'created'; },
  };
  return { docs, store };
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://htx.vercel.app/api/collect', {
    method: 'POST', headers: { 'content-type': 'application/json', host: 'htx.vercel.app', ...headers }, body: JSON.stringify(body),
  });

describe('validateBatch', () => {
  it('nhận lô hợp lệ', () => {
    const r = validateBatch(batch([ev(), ev()]));
    expect(r.ok).toBe(true);
    expect(r.batch?.events).toHaveLength(2);
  });

  it('bỏ event có tên người chơi (quyền riêng tư)', () => {
    const r = validateBatch(batch([ev({ props: { player_name: 'An' } }), ev()]));
    expect(r.ok).toBe(true);
    expect(r.batch?.events).toHaveLength(1);
    expect(r.dropped[0].reason).toMatch(/forbidden_key/);
  });

  it('bỏ event lạ, event trùng id trong lô', () => {
    const dup = ev();
    const r = validateBatch(batch([ev({ name: 'hack' }), dup, { ...dup }]));
    expect(r.batch?.events).toHaveLength(1);
    expect(r.dropped.map((d) => d.reason).sort()).toEqual(['duplicate_in_batch', 'unknown_event']);
  });

  it('từ chối cả lô khi sai cấu trúc', () => {
    expect(validateBatch(batch([ev()], { build_version: 'x' })).ok).toBe(false);
    expect(validateBatch(batch([])).ok).toBe(false);
    expect(validateBatch(batch(Array.from({ length: 201 }, () => ev()))).ok).toBe(false);
    expect(validateBatch({}).ok).toBe(false);
  });

  it('chặn chuỗi quá dài và giá trị phức tạp', () => {
    const r = validateBatch(batch([ev({ props: { a: 'x'.repeat(500) } }), ev({ props: { a: { nested: 1 } } }), ev()]));
    expect(r.batch?.events).toHaveLength(1);
  });
});

describe('POST /api/collect', () => {
  it('ghi một lô, gắn environment do server quyết định', async () => {
    const { docs, store } = memoryStore();
    const h = makeCollectHandler({ store: () => store, environment: 'test', serverBuild: 'abc1234', now: () => 1_700_000_000_000 });
    const b = batch([ev(), ev()]);
    const res = await h(post(b, { origin: 'https://htx.vercel.app' }));
    expect(res.status).toBe(200);
    const doc = docs.get(b.batch_id)!;
    expect(doc.environment).toBe('test');
    expect(doc.event_count).toBe(2);
    expect(doc.server_received_ms).toBe(1_700_000_000_000);
  });

  it('gửi lại cùng lô → không ghi trùng', async () => {
    const { docs, store } = memoryStore();
    const h = makeCollectHandler({ store: () => store, environment: 'test', serverBuild: 'x' });
    const b = batch([ev()]);
    await h(post(b));
    const res = await h(post(b));
    expect(await res.json()).toMatchObject({ ok: true, duplicate: true });
    expect(docs.size).toBe(1);
  });

  it('production: chặn yêu cầu không có Origin hoặc từ trang khác', async () => {
    const { store } = memoryStore();
    const h = makeCollectHandler({ store: () => store, environment: 'production', serverBuild: 'x' });
    expect((await h(post(batch([ev()])))).status).toBe(403);
    expect((await h(post(batch([ev()]), { origin: 'https://evil.example' }))).status).toBe(403);
    expect((await h(post(batch([ev()]), { origin: 'https://htx.vercel.app' }))).status).toBe(200);
  });

  it('chưa cấu hình Firebase → 503 rõ ràng', async () => {
    const h = makeCollectHandler({ store: () => { throw new Error('FIREBASE_SERVICE_ACCOUNT is not set'); }, environment: 'test', serverBuild: 'x' });
    expect((await h(post(batch([ev()])))).status).toBe(503);
  });

  it('hết hạn mức Firestore → 429 để client gửi lại sau', async () => {
    const h = makeCollectHandler({
      store: () => ({ createBatch: async () => { throw new Error('8 RESOURCE_EXHAUSTED: Quota exceeded.'); } }),
      environment: 'test', serverBuild: 'x',
    });
    expect((await h(post(batch([ev()])))).status).toBe(429);
  });
});
