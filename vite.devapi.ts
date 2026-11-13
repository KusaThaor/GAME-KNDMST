import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Chỉ dùng khi chạy `npm run dev`: phục vụ /api/* bằng chính các file trong thư mục api/
 * (giống Vercel Functions) để thử đường ống dữ liệu trên máy, kể cả với Firestore Emulator.
 */
export function devApi(): Plugin {
  return {
    name: 'htx-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
        const m = url.pathname.match(/^\/api\/([a-z0-9-]+)$/);
        if (!m) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.ts`);
          const handler = mod[req.method ?? 'GET'];
          if (typeof handler !== 'function') { res.statusCode = 405; return res.end('method not allowed'); }
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
          const request = new Request(url, { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined });
          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.config.logger.error(String(err));
          res.statusCode = 500; res.end('dev api error');
        }
      });
    },
  };
}
