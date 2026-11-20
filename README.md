# Hành Trình Thanh Xuân — game 3D trên web (dự án KNĐMST)

Vite + TypeScript + Three.js + Preact · Vercel (web + Functions) · Firebase Firestore gói Spark (dữ liệu đo lường).
Thiết kế (chuẩn, v1.0 APPROVED): [`docs/gdd/00_MASTER_GDD.md`](docs/gdd/00_MASTER_GDD.md) · Bản đồ nhánh và nguồn chân lý: [`WORKSPACE.md`](WORKSPACE.md).

## Chạy trên máy
```bash
npm install
npm run dev            # http://localhost:5173  (có /api giống Vercel)
npm test               # unit test
npm run test:e2e       # bot trình duyệt (Chrome headless)
npm run build && npm run shots   # chụp ảnh các trang thử vào thư mục shots/
```
Trang thử (chỉ ở bản test): `?lab=sheet&grade=6|9&view=front|back|side&motion=idle|walk|mix`, `?lab=yard&view=third|wide`.

### Thử đường ống dữ liệu với Firestore Emulator (không cần tài khoản)
```bash
firebase emulators:start --only firestore --project demo-htx     # cần Java + firebase-tools
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 GCLOUD_PROJECT=demo-htx npm run dev
```

## Môi trường và dữ liệu
| | Nhánh `dev` → Vercel Preview | Nhánh `main` → Vercel Production |
|---|---|---|
| `environment` trong dữ liệu | `test` (server tự gắn) | `production` |
| Trang thử, `?bot=`, `?chapter=` | Có | Bị loại khỏi bản build |

- Trình duyệt gửi event theo lô (~60 giây/lần) tới `POST /api/collect`; function kiểm tra rồi ghi **một document cho mỗi lô** vào collection `event_batches`. Gửi lại cùng lô không bị ghi trùng.
- Firestore Rules chặn mọi đọc/ghi trực tiếp từ trình duyệt (`firestore.rules`). Chỉ function (khóa phía server) ghi được.
- Không gửi tên người chơi, email, IP. `GET /api/health` cho biết cấu hình Firebase đã đọc được chưa (không lộ khóa).

## Biến môi trường (nhập trong Vercel, không commit)
Xem `.env.example`. `FIREBASE_SERVICE_ACCOUNT` = nội dung file khóa tài khoản dịch vụ Firebase (JSON).

## Cấu trúc
```
src/actors/character/   nhân vật dựng bằng code + animation thủ tục
src/world/school/       bối cảnh trường (dãy lớp, cây phượng, cây bàng, cột cờ…)
src/render/             vật liệu toon, viền nét, gộp mesh, texture vẽ bằng canvas
src/analytics/          bộ gom event phía trình duyệt
src/ui/                 HUD (Preact)
src/lab/                trang thử cho spike
shared/events.ts        định nghĩa + kiểm tra event (dùng chung client/server)
api/                    Vercel Functions: collect, health
tests/unit, tests/e2e   kiểm thử
```
