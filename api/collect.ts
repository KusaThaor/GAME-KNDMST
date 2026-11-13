/**
 * POST /api/collect — nhận một lô event analytics từ trình duyệt và ghi vào Firestore.
 * Chi tiết thiết kế: GDD mục 13 + 07_ANALYTICS_REQUIREMENTS.
 */
import { makeCollectHandler } from './_lib/collect.js';
import { firestoreBatchStore, serverBuild, serverEnvironment } from './_lib/firestore.js';

export const POST = makeCollectHandler({
  store: firestoreBatchStore,
  environment: serverEnvironment(),
  serverBuild: serverBuild(),
});
