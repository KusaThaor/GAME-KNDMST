# Hành Trình Thanh Xuân — game 3D trên web (dự án KNĐMST)

Vite + TypeScript + Three.js + Preact · Vercel (web + Functions) · Firebase Firestore gói Spark (dữ liệu đo lường).
Thiết kế (chuẩn, v1.0 APPROVED): [`docs/gdd/00_MASTER_GDD.md`](docs/gdd/00_MASTER_GDD.md) · Bản đồ nhánh và nguồn chân lý: [`WORKSPACE.md`](WORKSPACE.md). Repo này chỉ chứa mã và nội dung đã chuyển thành dữ liệu.

## Chạy trên máy
```bash
npm install
npm run dev            # http://localhost:5173  (có /api giống Vercel)
npm test               # unit test + kiểm gói nội dung
npm run test:e2e       # bot trình duyệt (Chrome headless) — chơi hết phần khung, ~8 phút
npm run build && npm run shots   # chụp ảnh các trang thử vào thư mục shots/
```

## Chơi phần khung
`/?play=1` — luồng đầy đủ với **nội dung giả** (mọi chữ ghi `[PLACEHOLDER]`):
phòng 2026 → nhập tên, chọn nam/nữ → Hộp Kỷ Vật → Ngày ký ức trên sân trường → chụp ảnh → về phòng → trang Album hiện lại, kỷ vật lên kệ → điện thoại, gửi tin → màn kết.

| Phím | Việc |
|---|---|
| WASD / mũi tên, Shift | Đi, chạy |
| Giữ chuột phải + kéo, lăn chuột | Xoay, kéo gần/xa camera |
| E hoặc click | Tương tác khi có gợi ý |
| Space | Sang câu thoại kế · tạo dáng khi đang hẹn giờ chụp |
| 1 / 2 / 3 | Chọn câu trả lời |
| J hoặc Tab | Sổ tay (mục tiêu, việc phụ) |
| Esc | Menu: Chơi tiếp · Chơi lại Ngày · Về chỗ an toàn · Xóa tiến trình |

Bản đồ đủ 6 khu, va chạm và camera A/B thuộc việc S2 — hiện phần chơi dùng "góc sân" và bộ điều khiển tạm (`src/game/scenes/dayScene.ts`, có ghi chỗ cần thay).

### Công cụ test (chỉ có ở bản test, bị loại khỏi bản production)
| Địa chỉ | Việc |
|---|---|
| `?play=1&bot=release` | Bot tự chơi hết các Ngày khai trong `src/content/release.ts` |
| `?play=1&day=d.g07.03&step=q_m1_main_05.s03` | Nhảy tới một bước (các Ngày trước coi như đã xong; thêm `&gender=female` nếu cần) |
| `?play=1&cast=B` | Đổi bảng vai (D-01) để thử |
| `?lab=sheet&grade=6\|9&view=front\|back\|side&motion=idle\|walk\|mix`, `?lab=yard&view=third\|wide` | Trang thử nhân vật, góc sân (`&fx=dust`, `&intro=1`, `&tweak=1`, `&asset=desk`) |

Trong bản test, `window.__game` cho bot đọc trạng thái (`state()`, `stats()`); xem `src/lab/gameTools.ts`.

## Thêm một Ngày ký ức mới
Engine không cần sửa. Chỉ thêm dữ liệu rồi chạy lệnh kiểm.

1. **Tạo file `src/content/days/d_gNN_KK.ts`** (chép từ `d_g06_01.ts`), xuất 5 thứ:
   - `day` — ID `d.gNN.KK`, năm học, bản đồ + biến thể, chỗ đứng NPC (dùng vai `NPC_A…NPC_D`, không ghi thẳng `chr_*`), điểm tương tác `itr.<map>.<tên>`, máy ảnh ảo `cam.<…>.<…>`, `main_chain`, `side_quests`, `daily_pool`, `album_page_id`.
   - `quests` — Main/Side/Daily của Ngày; ID `q_<m1|m2|m3>_<main|side|daily|event>_NN`, bước `<quest_id>.sNN`. Side/Daily phải có `blocks_main: false`.
   - `artifact` — đúng **một** kỷ vật dẫn vào Ngày (`art_<mốc>_NN`), `appear_when` = điều kiện sáng lên (thường là xong Ngày trước).
   - `fragments`, `entries` — mảnh ký ức và các ô của trang Album (`frag.<ngày>.NN`, `alb.<ngày>.NN`); ít nhất một ô `required_for_restore: true`.
2. **Thêm vào `DAYS`** trong `src/content/pack.ts`.
3. **Khai trong `src/content/release.ts`** (bản nào có Ngày này, theo thứ tự chơi) và **`src/content/chapters.ts`** (Trang thuộc nhóm Mốc nào; cấu trúc dữ liệu một Trang: `docs/PAGE_DATA_GUIDE.md`).
4. **Thêm Present-day Event** trong `src/content/hub.ts`: thường là một `RESTORE` (phục hồi trang) và một `SHELF` (kỷ vật lên kệ) với `trigger: { day: '<id Ngày>' }`.
5. Nếu Ngày dùng năm học/biến thể mới: thêm biến thể vào `MAPS` trong `src/content/base.ts` và hình ảnh của nó (trang trí, ánh sáng) vào `src/world/variants.ts`.
6. **Kiểm:**
   ```bash
   npm test                              # validator báo đúng ID sai (ID lệch mẫu, tham chiếu không tồn tại, trùng ID…)
   npm run dev                           # rồi mở /?play=1&day=<id Ngày> để vào thẳng Ngày đó
   npm run test:e2e                      # bot chơi hết bản thử
   ```

Quy tắc bắt buộc: nội dung chưa được nhóm duyệt ghi `[PLACEHOLDER]` + nhãn `AI_PROPOSED` và **không** được khai trong bản `production` của `release.ts` (validator chặn). ID đã phát hành public thì không đổi.

### Điều chưa chốt nằm ở đâu
| Quyết định | Sửa ở |
|---|---|
| D-01 hai bạn gặp ở lớp 6 | `src/content/cast.ts` (`ACTIVE_CAST`) |
| D-03 phạm vi bản public, điểm dừng | `src/content/release.ts` |
| D-04 chương gom những Ngày nào | `src/content/chapters.ts` |
| D-12 hiển thị chất lượng ảnh (3 dấu / điểm), thời gian hẹn giờ | `src/config/photo.ts` |
| D-13 tông phòng 2026, D-15 tên ứng dụng chat | `src/config/hub.ts` |
| D-19/D-20 nguồn ảnh, hiển thị tiến độ Album, ảnh bìa | `src/config/album.ts` |
| Tốc độ đi/chạy, camera | `src/config/game.ts` |

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
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 GCLOUD_PROJECT=demo-htx npm run test:e2e   # bot chơi hết rồi đọc lại event trong Firestore
```

## Môi trường và dữ liệu
| | Nhánh `dev` → Vercel Preview | Nhánh `main` → Vercel Production |
|---|---|---|
| `environment` trong dữ liệu | `test` (server tự gắn) | `production` |
| Nội dung chơi được | Gói nội dung giả (`release.ts` → `test`) | Để trống cho tới khi có nội dung được duyệt |
| Trang thử, `?bot=`, `?day=`, `?cast=` | Có | Bị loại khỏi bản build |

- Trình duyệt gửi event theo lô (~60 giây/lần) tới `POST /api/collect`; function kiểm tra rồi ghi **một document cho mỗi lô** vào collection `event_batches`. Gửi lại cùng lô không bị ghi trùng.
- Người chơi được hỏi đồng ý trước; từ chối vẫn chơi được, không gửi gì và không ghi ID xuống máy.
- Hoàn thành bản thử (`public_demo_completed`) được ghi **trước** khi form phản hồi hiện ra.
- Firestore Rules chặn mọi đọc/ghi trực tiếp từ trình duyệt (`firestore.rules`). Chỉ function (khóa phía server) ghi được.
- Không gửi tên người chơi, email, IP, nội dung tin nhắn hay ghi chú. Tên chỉ lưu trong trình duyệt. `GET /api/health` cho biết cấu hình Firebase đã đọc được chưa (không lộ khóa).

## Biến môi trường (nhập trong Vercel, không commit)
Xem `.env.example`. `FIREBASE_SERVICE_ACCOUNT` = nội dung file khóa tài khoản dịch vụ Firebase (JSON).

## Cấu trúc
```
src/content/            NỘI DUNG: Ngày ký ức, quest, kỷ vật, Album, Hub + cast/release/chapters; validate.ts kiểm ID và tham chiếu
src/config/             điều chưa chốt và hằng số chỉnh được (ảnh, Album, phòng 2026, điều khiển)
src/core/               event bus, điều kiện, lưu v2 (localStorage + ảnh ở IndexedDB)
src/systems/            logic thuần: quest engine, hội thoại, Album, Hub 2026, luồng game, điểm dừng bản phát hành
src/game/               nối logic với cảnh 3D và giao diện: game.ts (điều phối), scenes/ (phòng 2026, Ngày ký ức), input, view
src/ui/                 giao diện Preact: ui/game (HUD, thoại, ảnh, Hộp Kỷ Vật, Album, điện thoại, menu), Hud mẫu, motion
src/actors/character/   nhân vật dựng bằng code + animation thủ tục
src/world/              bối cảnh trường (school/), biến thể theo năm học (variants.ts)
src/render/             vật liệu toon, viền nét, gộp mesh, texture vẽ bằng canvas
src/analytics/          bộ gom event, cầu nối event bus → analytics, thời gian chơi thật
src/lab/                trang thử + công cụ test của game (gameTools.ts) — chỉ bản test
tools/blender/          script dựng asset bằng Blender + sổ asset
public/assets/          file GLB đã xuất
shared/events.ts        định nghĩa + kiểm tra event (dùng chung client/server)
api/                    Vercel Functions: collect, health
tests/unit, tests/e2e   kiểm thử (unit, Firestore Emulator, bot Playwright)
```
