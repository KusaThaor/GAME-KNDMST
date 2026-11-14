# Hành Trình Thanh Xuân — game 3D trên web (dự án KNĐMST)

Vite + TypeScript + Three.js + Preact · Vercel (web + Functions) · Firebase Firestore gói Spark (dữ liệu đo lường).
Thiết kế: `GDD.md` · Kế hoạch: `PROTOTYPE_PLAN.md` (trong Claude Project).

## Chạy trên máy
```bash
npm install
npm run dev            # http://localhost:5173  (có /api giống Vercel)
npm test               # unit test
npm run test:e2e       # bot trình duyệt (Chrome headless)
npm run build && npm run shots   # chụp ảnh các trang thử vào thư mục shots/
```
Trang thử (chỉ ở bản test): `?lab=sheet&grade=6|9&view=front|back|side&motion=idle|walk|mix`, `?lab=yard&view=third|wide`.
Thử nghiệm S2 trên `?lab=yard`: `&fx=dust` (bụi nắng), `&intro=1` (camera lướt vào), `&tweak=1` (bảng chỉnh thông số), `&asset=desk` (bàn học từ Blender).

## Thư viện phụ (duyệt 14/11)
| Thư viện | Dùng cho | Ở đâu |
|---|---|---|
| GSAP | Chuyển động giao diện, camera lướt (`src/ui/motion.ts`: thời lượng + kiểu nhịp dùng chung) | Game |
| three.quarks | Hiệu ứng hạt, gộp lượt vẽ (`src/render/fx.ts`) | Game |
| Tweakpane | Bảng chỉnh ánh sáng/sương/hiệu ứng khi phát triển (`src/lab/tweaks.ts`) | **Chỉ bản test**, nạp động — không có trong bản production |

## Asset 3D từ Blender
Script Blender (bpy) ở `tools/blender/`, xuất GLB vào `public/assets/`, sổ asset ở `tools/blender/assets.json`.
Game nạp bằng `loadProp(url)` (`src/render/assets.ts`), tự đổi vật liệu sang toon + viền cho khớp phong cách.
```bash
blender --background --python tools/blender/props/desk_2seat.py     # cần Blender 5.2 LTS
# hoặc không cần mở Blender:  pip install bpy==5.2.4  rồi  python tools/blender/props/desk_2seat.py
```
Quy trình đầy đủ: `BLENDER_PIPELINE.md` (trong Claude Project).

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
src/lab/                trang thử cho spike (+ bảng chỉnh Tweakpane)
tools/blender/          script dựng asset bằng Blender + sổ asset
public/assets/          file GLB đã xuất
shared/events.ts        định nghĩa + kiểm tra event (dùng chung client/server)
api/                    Vercel Functions: collect, health
tests/unit, tests/e2e   kiểm thử
```
