import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import type { AppEnvironment } from '../../shared/events.js';
import type { BatchStore, StoredBatch } from './collect.js';

/** Tên collection trong Firestore. Giữ ổn định — dashboard và CSV dựa vào đây. */
export const COLLECTIONS = { batches: 'event_batches', feedback: 'feedback' } as const;

let db: Firestore | null = null;

/**
 * Đọc khóa tài khoản dịch vụ từ biến môi trường FIREBASE_SERVICE_ACCOUNT
 * (dán nguyên nội dung file JSON, hoặc bản base64 của file đó).
 * Khi chạy thử với Firestore Emulator (FIRESTORE_EMULATOR_HOST) thì không cần khóa.
 */
export function getDb(): Firestore {
  if (db) return db;
  let app: App;
  if (getApps().length) app = getApps()[0];
  else if (process.env.FIRESTORE_EMULATOR_HOST) app = initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-htx' });
  else {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const sa = JSON.parse(text) as { project_id: string; client_email: string; private_key: string };
    app = initializeApp({
      credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key.replace(/\\n/g, '\n') }),
    });
  }
  db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

export function firestoreBatchStore(): BatchStore {
  const firestore = getDb();
  return {
    async createBatch(batchId: string, doc: StoredBatch) {
      try {
        // create() thất bại nếu document đã tồn tại → chống ghi trùng khi client gửi lại.
        await firestore.collection(COLLECTIONS.batches).doc(batchId).create(doc);
        return 'created';
      } catch (err) {
        const code = (err as { code?: number | string }).code;
        if (code === 6 || code === 'already-exists' || /ALREADY_EXISTS/.test(String((err as Error).message))) return 'duplicate';
        throw err;
      }
    },
  };
}

/** Môi trường do server quyết định: chỉ Vercel Production là "production". */
export const serverEnvironment = (): AppEnvironment => (process.env.VERCEL_ENV === 'production' ? 'production' : 'test');
export const serverBuild = (): string => (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7);

export async function createFeedback(key: string, doc: import('../feedback.js').FeedbackDocument) {
  try {
    await getDb().collection(COLLECTIONS.feedback).doc(key).create(doc);
    return 'created' as const;
  } catch (err) {
    const code = (err as { code?: number | string }).code;
    if (code === 6 || code === 'already-exists') return 'duplicate' as const;
    throw err;
  }
}
