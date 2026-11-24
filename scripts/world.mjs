// Công cụ bản đồ (S2). Chạy các hàm TypeScript trong scripts/world-cli.ts bằng Vite (không cần cài thêm gì).
//   npm run world:index      → đọc các file GLB, ghi lại src/world/maps/<map>.index.json
//   npm run validate:world   → kiểm tra manifest + GLB + index + nội dung (thoát mã 1 nếu có lỗi)
import { createServer } from 'vite';

const server = await createServer({
  configFile: false, logLevel: 'error', appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
});
let code = 1;
try {
  const cli = await server.ssrLoadModule('/scripts/world-cli.ts');
  code = await cli.run(process.argv.slice(2));
} catch (e) {
  console.error(e);
} finally {
  await server.close();
}
process.exit(code);
