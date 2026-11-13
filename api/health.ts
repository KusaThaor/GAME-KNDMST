/**
 * GET /api/health — kiểm tra nhanh cấu hình, KHÔNG đọc/ghi database và KHÔNG lộ khóa bí mật.
 */
import { serverBuild, serverEnvironment } from './_lib/firestore.js';

export function GET(): Response {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT ?? '';
  let firebase: 'missing' | 'configured' | 'unreadable' = 'missing';
  let projectId: string | null = null;
  if (raw) {
    try {
      const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
      const sa = JSON.parse(text) as { project_id?: string; private_key?: string; client_email?: string };
      firebase = sa.project_id && sa.private_key && sa.client_email ? 'configured' : 'unreadable';
      projectId = sa.project_id ?? null;
    } catch { firebase = 'unreadable'; }
  }
  return new Response(
    JSON.stringify({ ok: true, environment: serverEnvironment(), server_build: serverBuild(), firebase, project_id: projectId }),
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
}
