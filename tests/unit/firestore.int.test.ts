/**
 * Kiểm thử tích hợp với Firestore Emulator (chạy thật, không giả lập).
 * Chỉ chạy khi có FIRESTORE_EMULATOR_HOST, ví dụ:
 *   firebase emulators:start --only firestore --project demo-htx
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 GCLOUD_PROJECT=demo-htx npx vitest run
 */
import { describe, expect, it } from 'vitest';
import { makeCollectHandler } from '../../api/_lib/collect';
import { COLLECTIONS, firestoreBatchStore, getDb } from '../../api/_lib/firestore';

const enabled = !!process.env.FIRESTORE_EMULATOR_HOST;
const u = () => crypto.randomUUID();

describe.skipIf(!enabled)('Firestore (emulator)', () => {
  it('ghi lô event, chống ghi trùng, lưu đúng environment', async () => {
    const h = makeCollectHandler({ store: firestoreBatchStore, environment: 'test', serverBuild: 'emu0001' });
    const batch = {
      batch_id: u(), build_version: '20261113-emu0001', release_stage: 'prototype',
      events: [{ event_id: u(), name: 'pipeline_test', client_time: new Date().toISOString(), visitor_id: u(), session_id: u(), props: { source: 'vitest' } }],
    };
    const req = () => new Request('http://localhost/api/collect', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(batch) });
    const r1 = await h(req());
    expect(r1.status).toBe(200);
    expect(await r1.json()).toMatchObject({ ok: true, duplicate: false, accepted: 1 });
    const r2 = await h(req());
    expect(await r2.json()).toMatchObject({ ok: true, duplicate: true });

    const snap = await getDb().collection(COLLECTIONS.batches).doc(batch.batch_id).get();
    expect(snap.exists).toBe(true);
    const doc = snap.data()!;
    expect(doc.environment).toBe('test');
    expect(doc.event_count).toBe(1);
    expect(doc.events[0].name).toBe('pipeline_test');
    expect(JSON.stringify(doc)).not.toMatch(/player_name/);
  });
});
