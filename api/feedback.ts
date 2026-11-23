import { isUuid, type AppEnvironment, type ReleaseStage } from '../shared/events.js';
import { RELEASES } from '../src/content/release.js';
import { GAME_CONFIG } from '../src/config/game.js';

const BODY_LIMIT = 4096;
export const COMMENT_LIMIT = 300;

// Cùng một bộ lọc trước fetch và trước khi ghi, kể cả khi gọi API trực tiếp.
export function cleanComment(value: string): string {
  const hidden = '[đã ẩn]';
  return value.normalize('NFKC')
    .replace(/[^\s@<>(),;:]+@[^\s@<>(),;:]+/gu, hidden)
    .replace(/[\da-f:]*:[\da-f:]*:[\da-f:.]*/gi, token => {
      try { new URL(`http://[${token}]/`); return hidden; } catch { return token; }
    })
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, hidden)
    .replace(/\+?\(?\d(?:[\s().–-]*\d){6,}/g, hidden)
    .trim().slice(0, COMMENT_LIMIT);
}

export interface FeedbackAnswers {
  nostalgia: number;
  play_again: number;
  favorite_page: string;
  recommend: boolean;
  comment: string;
}
export interface FeedbackDocument extends FeedbackAnswers {
  environment: AppEnvironment;
  release_stage: ReleaseStage;
}
type Write = (key: string, doc: FeedbackDocument) => Promise<'created' | 'duplicate'>;
const rating = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;

export function makeFeedbackHandler(environment: AppEnvironment, write: Write) {
  return async (req: Request): Promise<Response> => {
    const fail = (status: number) => Response.json({ ok: false }, { status });
    if (req.method !== 'POST') return fail(405);
    const origin = req.headers.get('origin');
    if (origin ? origin !== new URL(req.url).origin : environment === 'production') return fail(403);
    if (Number(req.headers.get('content-length')) > BODY_LIMIT) return fail(413);
    let input;
    try {
      const reader = req.body?.getReader();
      if (!reader) return fail(400);
      const decoder = new TextDecoder();
      let text = '', size = 0;
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > BODY_LIMIT) { await reader.cancel(); return fail(413); }
        text += decoder.decode(chunk.value, { stream: true });
      }
      input = JSON.parse(text + decoder.decode());
    } catch { return fail(400); }

    const comment = input?.comment === undefined ? '' : input.comment;
    if (!input || !isUuid(input.attempt_id) || !rating(input.nostalgia) || !rating(input.play_again)
      || !RELEASES[environment].memory_day_ids.includes(input.favorite_page)
      || typeof input.recommend !== 'boolean' || typeof comment !== 'string'
      || comment.length > COMMENT_LIMIT) return fail(400);

    // attempt_id thuộc riêng lần gửi form. Không lưu ID của save, visitor, session hoặc header.
    const doc: FeedbackDocument = {
      environment, release_stage: GAME_CONFIG.release_stage, nostalgia: input.nostalgia,
      play_again: input.play_again, favorite_page: input.favorite_page, recommend: input.recommend,
      comment: cleanComment(comment),
    };
    try {
      const outcome = await write(`${environment}.${doc.release_stage}.${input.attempt_id.toLowerCase()}`, doc);
      return Response.json({ ok: true, duplicate: outcome === 'duplicate' });
    } catch (err) {
      const { code, message } = err as { code?: number | string; message?: string };
      return fail(code === 8 || code === 'resource-exhausted' || /RESOURCE_EXHAUSTED|quota/i.test(message ?? '') ? 429 : 503);
    }
  };
}

export async function POST(req: Request) {
  // Vite dùng bộ lọc chung trong trình duyệt; chỉ server mới cần Firebase Admin.
  if (import.meta.env?.SSR === false) throw new Error('Server only');
  const { createFeedback, serverEnvironment } = await import('./_lib/firestore.js');
  return makeFeedbackHandler(serverEnvironment(), createFeedback)(req);
}
