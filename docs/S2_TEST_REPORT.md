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
