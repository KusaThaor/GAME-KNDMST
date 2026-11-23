import { describe, expect, it, vi } from 'vitest';
import { cleanComment, makeFeedbackHandler, type FeedbackDocument } from '../../api/feedback';
import { COLLECTIONS, createFeedback, getDb } from '../../api/_lib/firestore';

const payload = {
  attempt_id: crypto.randomUUID(), nostalgia: 4, play_again: 5, favorite_page: 'd.g06.01',
  recommend: false, comment: 'Liên hệ bạn@example.com hoặc (+84) 912-345-678.',
};
const request = (data: unknown, headers = {}) => new Request('http://localhost/api/feedback', {
  method: 'POST', headers, body: JSON.stringify(data),
});
const run = (write = vi.fn(async (_key: string, _doc: FeedbackDocument) => 'created' as const)) =>
  ({ post: makeFeedbackHandler('test', write), write });

describe('POST /api/feedback', () => {
  it('chỉ ghi đáp án cho phép và môi trường do server chọn', async () => {
    const { post, write } = run();
    const r = await post(request({ ...payload, player_name: 'An', email: 'sample@example.org',
      release_stage: 'public', environment: 'production', visitor_id: 'x' }, { 'x-forwarded-for': '192.0.2.3' }));
    expect(await r.json()).toEqual({ ok: true, duplicate: false });
    expect(write).toHaveBeenCalledExactlyOnceWith('test.prototype.' + payload.attempt_id, {
      nostalgia: 4, play_again: 5, favorite_page: 'd.g06.01', recommend: false,
      comment: cleanComment(payload.comment), environment: 'test', release_stage: 'prototype',
    });
    expect(cleanComment(payload.comment)).not.toMatch(/example|912|345|678/);
  });
  it.each(['a.b+tag@example.org', '0901 234 567', '+84 (901) 234-567', '192.0.2.55', '2001:db8::1', '2001:db8::'])(
    'lọc thông tin liên hệ trước khi gửi và trước khi ghi: %s', token => {
      expect(cleanComment('Ổn ' + token)).toBe('Ổn [đã ẩn]');
    });
  it.each([{ attempt_id: 'x' }, { nostalgia: 0 }, { play_again: '5' }, { recommend: 'no' },
    { favorite_page: 'tự nhập' }, { comment: 'a'.repeat(301) }])('từ chối đáp án sai', async patch => {
    const { post, write } = run();
    expect((await post(request({ ...payload, ...patch }))).status).toBe(400);
    expect(write).not.toHaveBeenCalled();
  });
  it('chặn body quá lớn ngay cả khi thiếu Content-Length, và chặn site khác', async () => {
    const { post, write } = run();
    expect((await post(request({ comment: 'ế'.repeat(1600) }))).status).toBe(413);
    expect((await post(request(payload, { origin: 'https://other.example' }))).status).toBe(403);
    expect(write).not.toHaveBeenCalled();
  });
  it('cho phép gửi lại sau 429 với cùng khóa, duplicate cũng là thành công', async () => {
    const write = vi.fn().mockRejectedValueOnce({ code: 8 }).mockResolvedValueOnce('duplicate');
    const post = makeFeedbackHandler('test', write);
    expect((await post(request(payload))).status).toBe(429);
    expect(await (await post(request(payload))).json()).toEqual({ ok: true, duplicate: true });
    expect(write.mock.calls[0][0]).toBe(write.mock.calls[1][0]);
  });
});

it.skipIf(!process.env.FIRESTORE_EMULATOR_HOST)('Emulator: hai POST đồng thời chỉ tạo một phản hồi', async () => {
  const post = makeFeedbackHandler('test', createFeedback);
  const responses = await Promise.all([post(request(payload)), post(request(payload))]);
  const bodies = await Promise.all(responses.map(r => r.json()));
  expect(bodies.map(b => b.duplicate).sort()).toEqual([false, true]);
  const ref = getDb().collection(COLLECTIONS.feedback).doc('test.prototype.' + payload.attempt_id);
  try {
    expect((await ref.get()).data()).toEqual({ nostalgia: 4, play_again: 5, favorite_page: 'd.g06.01',
      recommend: false, comment: cleanComment(payload.comment), environment: 'test', release_stage: 'prototype' });
  } finally { await ref.delete(); }
});
