# S2_TEST_REPORT — báo cáo kiểm thử S2

Mỗi chặng ghi một mục. Chỉ ghi thứ đã chạy thật; thứ chưa chạy ghi rõ "chưa kiểm" và lý do.

## Chặng 1 — World & Blender Pipeline (15/11/2026, 22:45–23:30 UTC+7)

Môi trường: máy Linux trong phiên Claude (không có GPU), Node 22.23.4, Chrome cài sẵn (Playwright `channel: chrome`, vẽ bằng SwiftShader/CPU), Blender qua gói `bpy` (Python 3.11 → `bpy` 4.5.16 LTS; Python 3.13 → `bpy` 5.2.4 LTS). **Không** chạy `blender.exe` trên Windows.

### Mốc đầu chặng (HEAD `9342bcc`)
| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | đạt |
| `npm test` | 217 đạt, 1 bỏ qua (test Firestore — Emulator không bật) |
| `npm run validate:world` | đạt — 6 khu, 0 lỗi, 0 nhắc |
| `npm run test:e2e` | 13 đạt, 1 bỏ qua (cần Emulator) — 5,1 phút |
| `VERCEL_ENV=production npm run build` | đạt; `grep botStep\|__game\|gameTools dist/assets/*.js` không thấy |
| `test_pipeline.py` với `bpy` 4.5.16 LTS | 61/61 đạt |
| `test_pipeline.py` với `bpy` 5.2.4 LTS | 61/61 đạt |

### Test quy ước hai phía (mới)
`tests/unit/world/conventions.test.ts` — đọc `pipeline_config.py` dạng chữ, so với `src/world/types.ts`:
- `NAME_PREFIX_KIND`: so cả thứ tự (thứ tự quyết định tiền tố nào được xét trước).
- `KINDS_NEED_ID`: so như tập hợp.
- `KINDS` (Python) = `MARKER_KINDS` (game) + `collider` + `floor`.
- Có ca tự chứng minh: sửa bản sao trong bộ nhớ (bớt một tiền tố, đổi tên, đảo thứ tự, bớt một loại cần ID, thêm một loại) → đều bị bắt.
- Đã thử tay: đổi `TRIGGER_` thành `TRIG_` trong `types.ts` → test đỏ, báo đúng chỗ lệch; trả lại → xanh.

Kết quả: 5/5 đạt. Hai phía hiện **khớp**.

### So màu Blender ↔ game
Cách làm: `export_world.py --check-only --preview` (kết xuất ảnh, không ghi `.glb`); trong game chụp cùng hướng nhìn với `PREVIEW_camera` (đứng gần tâm khu, quay mặt về phía đối diện máy quay Blender, lăn chuột ra xa nhất). Camera game bám sau nhân vật nên khung hình gần hơn nhiều; chỉ so được màu, không so được bố cục khung.
Ảnh ghép: `docs/images/s2_color_compare.jpg` (cột 1 Blender, cột 2 game buổi sáng `d.g06.01`, cột 3 game buổi chiều `d.g07.03`). Đã mở và xem từng ảnh.

Màu trung bình một vùng phẳng (đo trên ảnh chụp, không phải số chuẩn):

| Vật liệu | Bảng màu (`blockout_default.json`) | Trong `.glb` | Blender preview | Game sáng (`morning_sun`) | Game chiều (`late_afternoon`) |
|---|---|---|---|---|---|
| `ground_concrete` (sân) | `#d2cbbd` | `#d2cbbd` | `#babbba` | `#c0b7a4` | `#c29e70` |
| `wall_main` (tường) | `#f0cd6e` | `#f0cd6e` | `#c6b995` | `#d0a842` | `#d69722` |
| `ground_dirt` (bãi đất) | `#b89468` | `#b89468` | `#b09d85` | (khu đóng) | `#aa6d25` |

Nhận xét thật:
1. **Xuất GLB giữ đúng màu**: màu trong `.glb` trùng từng mã với bảng màu. Phần lệch đến từ ánh sáng và cách hiển thị, không phải từ pipeline.
2. **Ảnh preview của Blender bạc màu hơn thật**: file `.blend` dùng chế độ hiển thị mặc định AgX (đã kiểm: `view_transform = AgX`) và trời xám xanh, nên tường vàng thành kem nhạt, sân thành xám. **Không nên dùng ảnh preview làm chuẩn màu.**
3. **Game buổi sáng gần bảng màu nhất**, hơi tối và đậm hơn một chút (tường đậm hơn rõ).
4. **Game buổi chiều ngả cam rõ** (sân xi măng thành màu be cam, bãi đất thành cam đất). Đây là do ánh sáng `late_afternoon` trong `src/world/variants.ts` (nắng `#ffd29a`), đúng ý đồ "chiều", nhưng nếu muốn sân vẫn đọc ra là xi măng thì cần chỉnh ánh sáng hoặc màu — việc của art style (D-S2-04), chưa sửa.
5. Ở khoảng cách chụp này, `toon_outline` và `soft_pbr` trông gần như giống nhau (khó thấy viền trên vật của bản đồ). Ghi lại để Chặng 3 xem kỹ khi chụp đủ 6 khu × 2 phong cách.
6. Không thấy vật nào mất màu, đen, hay sai vật liệu ở cả 6 khu.

### Thử trọn quy trình "thêm khu thứ 7"
Làm trong thư mục tạm `/tmp/zone7` (phần Blender) và một worktree dùng xong xóa (phần game). Bản đồ thật không đổi. Từng bước và kết quả thật: `docs/HOW_TO_EXPAND_WORLD.md`. Tóm tắt:
- `new_zone.py` tạo được file; chạy lại không ghi đè.
- Marker thiếu `htx_id` → exporter báo lỗi, mã 1, không ghi file. Có ID → xuất được, hộp `COLLIDER_` quên nhãn được tự gắn.
- Texture ảnh gắn vào vật liệu được nhúng vào `.glb` (chưa xem trong game).
- `world:index` 7 khu; `validate:world` báo đúng lỗi `zone_missing_in_content` trước khi khai tên khu, rồi ĐẠT (1 nhắc `closed_zone_no_gate`).
- `npm test` với bản đồ 7 khu: 212 đạt, 10 đỏ, 1 bỏ qua. Cả 10 là test cố ý ghim bản đồ 6 khu (đã liệt kê lý do). Không có lỗi code.
- Chơi thử bằng Chrome, phím thật: giữ `W` đi vào portal → sang khu mới, hiện tên khu; bấm `E` ở cửa ra → về Bãi đất. Không lỗi trang.
- Thấy thêm: ở cửa sổ 960 px, tên khu hiện giữa trên đè một phần nút "Camera A". Chưa sửa.
- Nhắc `closed_zone_no_gate` cũng hiện với khu chỉ vào bằng portal, dù portal đã tự tắt khi khu đóng. Đây là nhắc, không phải lỗi; chưa sửa.

### Cuối chặng (HEAD `42b1308` + tài liệu)
| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | đạt |
| `npm test` | 222 đạt, 1 bỏ qua (thêm 5 test quy ước) |
| `npm run validate:world` | đạt — 0 lỗi, 0 nhắc |
| `npm run test:e2e` | 13 đạt, 1 bỏ qua (cần Emulator) — 4,9 phút |
| `VERCEL_ENV=production npm run build` | đạt; không thấy `botStep`, `__game`, `gameTools` trong `dist/assets/*.js` |
| `test_pipeline.py` | 61/61 trên `bpy` 4.5.16 LTS; 61/61 trên `bpy` 5.2.4 LTS |

Chặng 1 không sửa dòng code nào trong `src/` hay `tools/`: không test nào lộ lỗi.

### Chưa kiểm ở Chặng 1
- `blender.exe` trên Windows của chủ dự án (chỉ chạy gói `bpy` trên Linux).
- So màu trên màn hình thật / GPU thật (ảnh game ở đây vẽ bằng CPU).

## Chặng 2 — Phần A: kiểu điều khiển "Chuẩn" + touchpad + cảm ứng (16/11/2026, 00:00–01:10 UTC+7)

Môi trường: máy Linux trong phiên Claude (không GPU), Node 22.23.4, Chrome cài sẵn (Playwright `channel: chrome`, vẽ bằng CPU).
**Touchpad và cảm ứng ở đây đều là MÔ PHỎNG của Chrome** (CDP `Input.dispatchMouseEvent` / `Input.dispatchTouchEvent`, Playwright `hasTouch` + `isMobile`). Chưa thử trên điện thoại thật hay touchpad thật.

### Mốc đầu chặng (HEAD `90ab8ca`, chạy trong worktree sạch)
| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | đạt |
| `npm test` | 222 đạt, 1 bỏ qua (Emulator tắt) |
| `npm run validate:world` | đạt — 0 lỗi, 0 nhắc |
| `npm run test:e2e` | 13 đạt, 1 bỏ qua (Emulator tắt) — 8,0 phút |

### Đã làm
- Kiểu camera `standard` ("Chuẩn") là mặc định; phím V / nút trong Menu xoay vòng Chuẩn → A → B. Bản lưu cũ có A/B giữ nguyên; giá trị lạ → về Chuẩn. Không gửi kiểu camera/thiết bị đi đâu.
- Chuẩn: kéo chuột trái hoặc phải trên vùng trống (quá 6 px mới xoay; bấm nhanh vẫn là bấm; kéo xong không bị coi là bấm vào vật). Kéo bắt đầu trên nút giao diện không xoay.
- Zoom: lăn chuột, touchpad cuộn 2 ngón (zoom từ từ), touchpad chụm (`wheel` + ctrlKey, có `preventDefault` để trang không phóng), cảm ứng chụm 2 ngón. Luôn kẹp trong 3,5–8 m.
- Cảm ứng: nút tròn góc dưới trái (kéo sát mép = chạy), kéo vùng trống để xoay (chạy song song với nút tròn, theo `pointerId`), nút E ảo khi có gợi ý, nút "Tạo dáng" cho ảnh hẹn giờ (máy tính cũng bấm được). Nút "Camera" thu vào Menu khi dùng cảm ứng; dòng hướng dẫn và chữ "Space ▸/Chạm ▸" đổi theo thiết bị.
- Chặn trình duyệt: `touch-action: none` vùng chơi, không chọn chữ, không menu giữ lâu, `overscroll-behavior: none` (kéo-để-tải-lại), chặn `gesturestart` (Safari). Thẻ viewport thêm `viewport-fit=cover`; nút dùng `env(safe-area-inset-*)`.
- Màn dọc: thu gọn thanh trên; chữ "Bản khung…" bị nút tròn đè → đã sửa (thu nhỏ, một dòng).
- Vẫn MỘT bộ listener (12), `dispose()` gỡ cả listener cảm ứng.
- Logic thuần tách ra `src/game/gestures.ts`, số chỉnh được ở `POINTER_INPUT` (`src/config/camera.ts`).
- Sửa ngoài danh sách phạm vi (cần thiết): `src/core/save.ts` (kiểu dữ liệu + mặc định của `camera_mode`), `src/game/gestures.ts` (file mới), `src/lab/gameTools.ts` (thêm `device` vào `state()`, chỉ bản test).

### Thao tác chỉ có phím → đã làm được bằng chạm
| Phím | Bằng chạm | Ghi chú |
|---|---|---|
| WASD/mũi tên, Shift | nút tròn (sát mép = chạy) | mới |
| E | nút E ảo | mới |
| Space (tạo dáng ảnh hẹn giờ) | nút "Tạo dáng" | mới |
| Space (thoại) | chạm vào khung thoại | có sẵn |
| 1–9 (lựa chọn) | chạm nút lựa chọn | có sẵn |
| J | nút "Sổ tay" | có sẵn |
| Esc | nút "Menu"; bảng có nút "Đóng" | có sẵn |
| V | nút "Kiểu camera" trong Menu | có sẵn, ẩn ở thanh trên khi dùng cảm ứng |
| Chuột (phòng 2026) | chạm vào vật | có sẵn (click) |

### Test mới
- `tests/unit/world/gestures.test.ts`: 19 ca (kéo/bấm, ngưỡng, chụm, nhiều ngón, wheel chuột/touchpad/ctrlKey, nút tròn, vòng kiểu camera, giá trị lưu lạ).
- `tests/e2e/world.spec.ts`: ca 4, 5, 12 (chuột/touchpad mô phỏng); 11a dọc 390×844 (nút tròn + kéo xoay cùng lúc, chạy, chụm, trang không cuộn/phóng); 11b (thoại, lựa chọn, nút E, Sổ tay, Menu, đổi kiểu camera, trọn bước ảnh hẹn giờ — chỉ bằng chạm; vị trí đứng được đặt sẵn bằng `teleportTo`); 11c ngang 844×390 (không chồng nút, đi + xoay).
- Sửa 1 test cũ: `camera.test.ts` ghim "mặc định là A hoặc B" → đổi thành "mặc định là Chuẩn" vì D-S2-01 đã chốt.

### Cuối Phần A (HEAD `4463b90`)
| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | đạt |
| `npm test` | 241 đạt, 1 bỏ qua |
| `npm run validate:world` | đạt — 0 lỗi, 0 nhắc |
| `npm run test:e2e` | 19 đạt, 1 bỏ qua (Emulator tắt) — 11,9 phút |
| `VERCEL_ENV=production npm run build` | đạt; không thấy `botStep`, `__game`, `gameTools` trong `dist/assets/*.js` |

### Hiệu năng (mô phỏng điện thoại 390×844, độ nét màn hình 3)
- Độ nét bị giới hạn ở 2 (canvas 780 px cho 390 px CSS) — đã có sẵn ở `render/stage.ts`.
- Draw call / tam giác đo ở một điểm mỗi khu (`d.g07.03`): sân 163 / 51 nghìn; **cổng 185 / 66,5 nghìn (nặng nhất)**; lớp học 60 / 20 nghìn; sân bóng 56 / 20 nghìn; bãi đất 51 / 20 nghìn. Hành lang: điểm thử rơi vào sân nên chưa có số riêng.
- FPS: **chưa đo** (máy này vẽ bằng CPU).

### Chưa kiểm
- Điện thoại thật (iPhone Safari, Android Chrome), touchpad laptop thật, máy tính bảng.
- FPS trên laptop/điện thoại thật.
- Phần B còn lại (ca 1–3, 6–10) và Phần C (tài liệu kiến trúc, quyết định) — để phiên 2c.

## HOTFIX touchpad Windows (16/11/2026, 08:50–09:40 UTC+7)

**Kết quả thử thật của chủ dự án** (Windows, Cốc Cốc, touchpad, không chuột rời, bản `4faf704`): WASD đạt · cuộn 2 ngón zoom đạt · **bấm-giữ-kéo touchpad để xoay: KHÔNG đạt**.

### Gốc lỗi: CHƯA XÁC NHẬN
Ở đây không có touchpad thật nên không tái hiện được. Chrome (mô phỏng) kéo trái vẫn xoay từ Phần A. Đọc code không thấy đường nào làm hỏng một lần kéo **trong cửa sổ** bằng nút trái. Các nghi vấn, xếp theo khả năng:
1. **Bản lưu cũ đang ở kiểu A** (tình huống F trong prompt): trước Phần A, mặc định là A; người chơi cũ được giữ lựa chọn nên vẫn ở A, mà kiểu A chỉ xoay bằng chuột phải. Kiểm bằng: nút góc phải ghi "Camera A", hoặc bảng chẩn đoán ghi `kiểu camera đã lưu: A`.
2. **Windows chặn touchpad khi đang giữ phím** (G): thử kéo trong lúc giữ WASD.
3. **Thao tác touchpad không thành "nhấn-giữ-kéo"** (G): tùy máy/thiết lập (chạm 2 lần rồi kéo bị tắt…).
4. **Kéo ra ngoài khung/cửa sổ thì mất** (B): code cũ không giữ con trỏ (pointer capture) → đã sửa.
5. **Cốc Cốc khác Chrome** (F): chưa có bằng chứng.

→ Thêm **bảng chẩn đoán** để lần thử tới có bằng chứng.

### Đã sửa / thêm
- `src/game/input.ts`: kéo kiểu Chuẩn giờ có trạng thái rõ ràng theo `pointerId`:
  - giữ con trỏ (`setPointerCapture`), nên kéo ra ngoài khung vẫn nhận;
  - thả đúng lúc (pointerup, pointercancel, mất focus); nếu trình duyệt quên gửi pointerup thì nhận ra nhờ `buttons=0`; ghi lại `lostpointercapture`;
  - không đòi `buttons` đúng một giá trị.
- **"Nhìn tự do"** (tùy chọn riêng, không đổi tên hay thay kiểu Chuẩn/A/B), lưu cục bộ, không vào analytics:
  - bật bằng phím **L** hoặc trong Menu; bấm vào màn hình để khóa con trỏ, rồi rê touchpad (không nhấn) là xoay;
  - Esc thả con trỏ; không tự khóa lại khi chưa bấm vào màn hình; có thoại/bảng thì thả con trỏ;
  - khóa bị từ chối → báo cho người chơi, vẫn kéo để xoay được.
- `src/game/gestures.ts`: thêm `ButtonDrag` (logic thuần, 5 test đơn vị).
- **Bảng chẩn đoán** `src/lab/inputDiagnostics.ts`, chỉ có ở bản test, mở bằng `?inputdebug=1`:
  - ghi tối đa 400 sự kiện: loại, pointerType, button/buttons, id, tọa độ, movement, phần tử nhận, phần tử đang focus, kiểu camera, đang kéo/giữ/khóa, chuyển động chờ, yaw/pitch trước và sau;
  - có nút "Sao chép". Không in ra console.
- Lỗi tìm thấy khi viết test, đã sửa:
  - (a) nhật ký chẩn đoán làm hỏng xử lý chính khi sự kiện đến từ `window` → bọc an toàn;
  - (b) `el.contains(window)` gây lỗi → kiểm kiểu trước.
- Hướng dẫn kiểm trên máy thật: `docs/TOUCHPAD_CHECK_GUIDE.md`.
- Sửa thêm, ngoài phạm vi nhưng cần: `src/core/save.ts` (thêm `free_look` tùy chọn), `src/config/camera.ts` (phím L), `src/ui/game/{GameUi.tsx,store.ts}`, `src/lab/gameTools.ts`.

### Test (chạy thật trong máy này)
| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | đạt |
| `npm test` | 246 đạt, 1 bỏ qua |
| `npm run validate:world` | 0 lỗi, 0 nhắc |
| `npx playwright test` | **26 đạt, 1 bỏ qua** (Emulator), 0 chập chờn — 13,7 phút |
| `VERCEL_ENV=production npm run build` | đạt; không có `__game`, `gameTools`, bảng chẩn đoán trong `dist` (chỉ còn hàm móc rỗng `setDebugTap`) |

Ca mới H1–H7 (`tests/e2e/world.spec.ts`):
- **H1:** kéo trái đổi cả yaw lẫn pitch; rê không bấm thì không xoay; kéo phải vẫn xoay; thả ra không bị đặt lại.
- **H2:** giữ con trỏ khi kéo, ra ngoài khung vẫn xoay; thả thì trả con trỏ; bảng chẩn đoán ghi đúng và sao chép được.
- **H3:** pointercancel và `buttons=0` (không có pointerup) đều dừng kéo.
- **H4:** W + kéo cùng lúc.
- **H5:** Nhìn tự do, khóa **giả lập** thành công: Esc, không tự khóa lại, thoại thả con trỏ, nút Menu.
- **H6:** khóa **giả lập** bị từ chối: có báo, không thử lại, kéo vẫn chạy.
- **H7:** khóa con trỏ **thật** trong Chrome headless: khóa được.

Các ca cũ 4, 5, 11a/b/c, 12 (touchpad mô phỏng, điện thoại mô phỏng) vẫn đạt.

### CHƯA KIỂM (PENDING)
Touchpad thật trên Windows + Cốc Cốc (cả kéo lẫn Nhìn tự do) · Cốc Cốc có cho khóa con trỏ không · điện thoại thật · FPS.


## Touchpad vuốt 2 ngón ngang = xoay (16/11/2026 chiều, commit `d67b4d6`)
Lệnh đã chạy (máy ảo Linux, Chrome headless), số thật:
- `npx tsc --noEmit`: đạt.
- `npm test`: 253 đạt, 1 bỏ qua (thêm 7 test `WheelRouter`).
- `npm run validate:world`: 0 lỗi, 0 nhắc.
- `npm run test:e2e`: 28 đạt, 1 bỏ qua, 16,8 phút. Ca mới **12b**: giữ W + 30 sự kiện wheel ngang (hơi xéo) → nhân vật đi > 0,3 m, góc xoay đổi > 0,2 rad, khoảng cách camera không đổi; vuốt dọc chỉ zoom; trang không cuộn, không lùi trang.
- `VERCEL_ENV=production npm run build`: đạt; không thấy `botStep|__game|gameTools` trong `dist/assets/*.js`.

Chưa kiểm: touchpad thật (Windows + Cốc Cốc, Mac); chiều xoay đúng cảm giác tay (phụ thuộc thiết lập cuộn của máy); Windows có chặn vuốt khi đang giữ phím hay không; FPS.

## Chặng 2 — Phần 2c: ca trình duyệt còn lại + camera linh hoạt hơn (16–17/11/2026, 22:20–01:30 UTC+7)
Máy ảo Linux 2 nhân, Chrome headless (vẽ bằng CPU). Touchpad và cảm ứng ở đây là **mô phỏng** của Chrome.

### Chủ dự án chốt trong phiên (16/11 tối)
- Bỏ 2 ca: ca 6 (kiểu B khóa con trỏ) và ca "V xoay vòng kiểu camera" kiểu cũ — vì đã chốt chỉ dùng camera Chuẩn.
- Tập trung camera linh hoạt như Play Together/PUBG; không cho người chơi đổi chế độ camera; code cũ không xóa.
- Góc nghiêng mở từ 25–40° (GDD) thành **5–65°** (chủ dự án chọn trong phiên).

### Đã làm
- **Góc nghiêng 5–65°** cho mọi preset (`CAMERA_PITCH_RANGE`). Số GDD cũ giữ ở `CAMERA_PITCH_GDD_V03`. Kéo dọc ~350 px chuột là đi hết dải.
- **Nút tròn "nổi" trên điện thoại** (`POINTER_INPUT.joystick.floating = true`): chạm bất kỳ đâu ở vùng góc trái dưới (≈ 45% rộng × 60% cao, tối đa 340×360 px) thì nút hiện dưới ngón tay; thả tay nút về chỗ cũ. `floating = false` = nút cố định như cũ (code giữ).
- Thêm ca e2e 1, 2, 3, 7, 8, 9, 10 (blueprint §6) + 5b (kéo dọc) + 11d (nút tròn nổi).
- Không đổi: luồng F0–F10, analytics (không event mới), code A/B/Nhìn tự do (vẫn tắt).

### Lỗi do test lộ ra
Không có lỗi game. Bốn lần đỏ đầu tiên đều do cách viết test, đã sửa test (không sửa game):
- ca 1, 3: đoán "đã tới tường" bằng thời gian cố định — Chrome headless chỉ vài khung hình/giây nên nhân vật đi chậm. Đổi thành giữ phím tới khi nhân vật đứng yên.
- ca 2: tên khu hiện thoáng rồi tắt trước khi test kịp đọc → ghi lại mọi chữ từng hiện.
- ca 10: tải lại trang kèm `?day=` làm công cụ test dựng lại bản lưu từ đầu → mở lại bằng `/?play=1` như người chơi thật.
- ca 8, 11b: hẹn giờ 8 giây theo đồng hồ game + chụp ảnh chậm trên CPU → chờ tới 120–150 giây.

### Số chạy thật cuối phiên (HEAD `3aabacb` + tài liệu)
- `npx tsc --noEmit`: đạt.
- `npm test`: 259 đạt, 1 bỏ qua (thêm 6: góc 5–65°, nút tròn nổi).
- `npm run validate:world`: 0 lỗi, 0 nhắc.
- `npm run test:e2e` lần 1: 36 đạt, 1 hỏng (ca 11b hết 30 giây chờ ảnh), 1 bỏ qua, 29,9 phút. Nới thời gian chờ → ca 11b chạy riêng đạt.
- `npm run test:e2e` lần 2 (toàn bộ, HEAD `3aabacb`): **37 đạt, 1 bỏ qua, 0 hỏng**, 28,8 phút (38 ca: 29 cũ + 9 mới).
- `VERCEL_ENV=production npm run build`: đạt; không thấy `botStep|__game|gameTools` trong `dist/assets/*.js`.
- Ca 9 (đếm listener): game tự báo 14 suốt 7 lần đo; listener thật trên `window` + `document` (DevTools) 30 ở cả phòng và Ngày, 3 vòng không tăng (có dùng chuột, lăn và một cú chạm trong mỗi Ngày).

### Chưa kiểm
- Điện thoại thật (iPhone Safari, Android Chrome), touchpad thật (Windows + Chrome/Cốc Cốc) — đặc biệt nút tròn nổi và kéo dọc.
- Ca 6 (kiểu B khóa con trỏ): bỏ theo chủ dự án; code còn, không kiểm thêm.
- FPS: chưa đo (chỉ đo trên máy có GPU thật).
