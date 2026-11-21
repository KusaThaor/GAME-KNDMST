# AUDIT_AND_ROADMAP — Kiểm toán code và kế hoạch sprint tới 04/12

Lập 21/11/2026. Chuẩn đối chiếu: `docs/gdd/` v1.0 APPROVED. Code kiểm: `origin/feature/s2-world-camera-blender` @ `6307e00` (đã gồm toàn bộ `dev`). Asset kiểm: `origin/feature/asset-workshop` @ `51baf28` + local (3 commit chưa push, 372 thay đổi chưa commit — **chưa kiểm được phần này**).
Cách kiểm: đọc mã và báo cáo trong repo, không chạy lại test. Số liệu test lấy từ `docs/S2_TEST_REPORT.md` (chặng 1, 15/11), **chưa chạy lại**.

Nhãn: **[Hoàn thành]** · **[Đang dở dang]** · **[Code lệch GDD v1.0]** · **[Chưa code]**

## 1. Tiến độ

### 1.1 Hub và 9 Trang
| Mục | Nhãn | Ghi chú ngắn |
|---|---|---|
| Hub — Phòng 2026 (`hub_room`) | [Đang dở dang] | Có `hubScene.ts`: khối thô, góc cố định, rê chuột sáng vật, 4 vật chạm (Hộp, Album, Kệ, Điện thoại). Chưa có model thật, tường ảnh, bàn học, ánh sáng theo tiến trình |
| Hub — nhập tên, chọn nam/nữ | [Đang dở dang] | Có hồ sơ + lưu tên (tối đa 12 ký tự, chỉ ở máy). Chưa có kiểm tra với GDD §4 bước 0 |
| Hub — điện thoại, nhóm chat, soạn tin kết demo | [Code lệch GDD v1.0] | Luồng có (`phone_ui`, `compose_message`), chữ toàn `[PLACEHOLDER]`. Sắc thái tin là `curious` ("Sâu lắng"); GDD ghi `deep` |
| Hub — chuyển Mốc ("Mấy năm sau…", hộp phấn) | [Chưa code] | Chỉ có Present-day Event giả (pde_01–06) |
| Trang 1 `d.g06.01` Mật lệnh số 01 | [Đang dở dang] | Có Ngày giả cùng ID đúng; Main/Side/Daily giả, không có nội dung thật |
| Trang 2 `d.g07.01` Thuyền giấy | [Chưa code] | Không có file Ngày. Cần rãnh nước thả thuyền (Z02b) + đua thuyền |
| Trang 3 `d.g07.02` Căn cứ bí mật | [Chưa code] | Có khu `zone.thcs.base` (Z05) trong bản đồ, chưa có nội dung |
| Trang 4 `d.g07.03` Đủ năm đứa | [Đang dở dang] | Có Ngày giả cùng ID đúng (Side `q_m1_side_02`, `itr.thcs.gutter`). Nội dung giả |
| Trang 5 `d.g08.01` Lên lớp 8 + Caro | [Chưa code] | Chưa có Caro, hộp phấn KV-01 |
| Trang 6 `d.g08.02` Confession | [Chưa code] | Chưa có màn 2D confession; chưa có ghế đá (lần trêu thứ ba). **21/11:** Trang 6 thêm Hòm thư Valentine ở Main (GDD v1.2-draft, nhánh `docs/valentine-mailbox-main-flow`; hướng đã được chủ dự án chốt chiều 21/11, bàn giao dev ở `docs/gdd/IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md`) — thêm màn làm hòm thư, thư xin lỗi, chọn thư, 3 minigame buổi chiều; trạng thái code không đổi |
| Trang 7 `d.g09.01` Báo tường + Sudoku | [Chưa code] | Chưa có Sudoku |
| Trang 8 `d.g09.02` Rã băng + Hội trại | [Chưa code] | Chưa thấy biến thể đêm của sân (Z02) |
| Trang 9 `d.g09.03` Vẫn đủ năm đứa | [Chưa code] | — |
| Nhãn "Chương" trong menu/báo cáo | [Code lệch GDD v1.0] | `chapters.ts` còn "Chương lớp 6/7"; GDD §2.2 cấm dùng "Chương" làm đơn vị chơi |
| Kết demo (Đã gửi… + form phản hồi) | [Đang dở dang] | Có `public_demo_completed` trước form (đúng thứ tự); nội dung placeholder |

### 1.2 Bản đồ, nhân vật, điều khiển
| Mục | Nhãn | Ghi chú ngắn |
|---|---|---|
| `map_thcs`: 6 khu (lớp, hành lang, sân, cổng, bãi, căn cứ) | [Hoàn thành] | 6 GLB từ Blender, `validate:world` 0 lỗi (báo cáo 15/11). Xe quà vặt, tiệm tạp hóa, đồ Hội trại: chưa kiểm |
| Biến thể theo năm học (ánh sáng/thời tiết) | [Đang dở dang] | Có preset (sáng, chiều…), chưa kiểm đủ 4 năm + đêm Hội trại |
| Điều khiển + camera thứ ba | [Hoàn thành] | Pitch 5–65° (chủ dự án chốt 16/11), chạm + chuột + touchpad |
| Nhân vật | [Code lệch GDD v1.0] | `s2` dựng nhân vật bằng code, hệ số cao theo `Grade 6/9`. GDD cần model 3D có xương cao 1,3–1,5 m. Model của asset-workshop cao ≈ 0,70 m, chưa gộp |
| Cây phượng, cây bàng | [Code lệch GDD v1.0] | `s2` dùng cây dựng bằng code (`props.ts`). Bản GLB của asset-workshop nặng 12.224 tam giác/cây, GDD tối đa 3.000 |

### 1.3 Minigame
| Mục | Nhãn | Ghi chú ngắn |
|---|---|---|
| Khung minigame chung (§1 của 02) | [Đang dở dang] | Có bước `minigame` + `minigameDone`; UI là một thẻ `[PLACEHOLDER]` bấm "Xong". Chưa có thắng/thua/chơi lại/hướng dẫn |
| **Tầng A** — 6 kiểu K1–K6 | [Đang dở dang] | K1 (đi–nói–chọn), K2 (chụp ảnh: hẹn giờ 8 giây, JPEG 1024×768) có chạy. K3–K6: có loại bước `collect`/`place` nhưng chưa có trò thật, phần còn lại chưa kiểm |
| **Tầng A** — Caro (Trang 5) | [Chưa code] | — |
| **Tầng A** — Sudoku (Trang 7) | [Chưa code] | — |
| **Tầng B** — Lật chai (Z03) | [Chưa code] | — |
| **Tầng B** — Bắn bi ve | [Chưa code] | Ưu tiên 6 theo §6 của 02 |
| **Tầng B** — Ô ăn quan | [Chưa code] | — |
| **Tầng B** — Nhảy lò cò | [Chưa code] | Cần hoạt ảnh nhảy/cúi/ném |
| Đua thuyền (Trang 2, Quân luôn nhất) | [Chưa code] | — |

### 1.4 Lưu trữ và đo lường
| Mục | Nhãn | Ghi chú ngắn |
|---|---|---|
| localStorage: tiến trình (`htx.save`, `v:2`) | [Hoàn thành] | Có phiên bản, bản cũ bị reset, tự lưu ở checkpoint. Chưa có chuyển đổi bản cũ (GDD §4.1 yêu cầu bước chuyển đổi) |
| localStorage: `minigames.*`, `hub.unlocked`, cài đặt | [Chưa code] | `SaveState` chưa có các trường §4.2 |
| IndexedDB: ảnh Album dạng JPEG Blob | [Hoàn thành] | `photoStoreIdb.ts`; ảnh nén JPEG ở `view.ts` (0,85), lưu Blob, không base64 |
| Menu: Chơi tiếp / Chơi lại một Trang / Xóa tiến trình | [Đang dở dang] | Có chơi lại (`ReplayState`); chưa kiểm menu đủ ba nút |
| Gửi event theo lô lên Firestore | [Hoàn thành] | Gom ~60 giây, `batch_id` chống ghi trùng, `sendBeacon` khi đóng tab, ghi 1 document mỗi lô (`event_batches`), rules chặn client. Chỉ có test Emulator bị bỏ qua |
| Event GDD §5.1 | [Code lệch GDD v1.0] | Code dùng `memory_day_started/completed`; GDD muốn `page_started/completed`. Thiếu `minigame_started/finished`, `hub_opened`, `end_message_sent`. `public_demo_completed` đã có |

### 1.5 Chất lượng và kiểm thử
| Mục | Nhãn | Ghi chú ngắn |
|---|---|---|
| Test tự động | [Hoàn thành] | 28 file test (unit + 3 spec e2e). Mốc 15/11: 217 unit đạt, 13 e2e đạt. Chưa chạy lại hôm nay |
| Lỗi đã biết A-01 (bước `goto` khi đứng sẵn), A-02 (Side/Daily không khởi động) | [Đang dở dang] | `04_NEXT_TASK_FOR_CLAUDE.md` T-01 — chưa rõ đã sửa hay chưa |

## 2. Gộp asset từ `feature/asset-workshop` sang `s2`

| Model / file | Vấn đề | Việc làm | Mức |
|---|---|---|---|
| `vietnamese_student*.glb` (+ bộ preset factory) | Cao ≈ 0,70 m (STANDARD 0,696). GDD: 1,3–1,5 m; chủ dự án chốt "chuẩn hóa" | Nhân hệ số về 1,30–1,40 (lớp 6–7), 1,40–1,50 (lớp 8–9); gốc `min.y = 0`; xuất lại GLB | P0 |
| Nhân vật: tam giác, xương, dung lượng | Báo cáo ghi ≈ 2,5k tam giác; GDD: chính ≤ 6.000, phụ ≤ 2.500, ≤ 1,5 MB | Đo lại sau khi nhân tỉ lệ; gộp 16 hoạt ảnh vào bộ xương dùng chung | P0 |
| Nhân vật 5 người của GDD | Mới có preset chung (học sinh, tóc, đồng phục) | Tạo Player, Đức, Châu, Quân, Hạ từ factory | P1 |
| `schoolyard_flamboyant_tree.glb` | 12.224 tam giác, 305 KB; GDD ≤ 3.000, 200 KB | Giảm tam giác ≥ 4 lần (decimate hoặc dựng lại); 2 biến thể lá xanh/hoa nở | P1 |
| `schoolyard_shade_tree.glb` | Là bản sao cây phượng (cùng 12.224 tam giác, cùng dung lượng); ghi công sai | Làm lại thành cây bàng tán tầng; sửa `ASSET_CREDITS.md` | P1 |
| `schoolyard_tropical_tree.glb` | 8.224 tam giác, chưa có chỗ dùng trong GDD | Bỏ hoặc giảm; không gộp nếu không dùng | P2 |
| `school_desk.glb` (4.636 tam giác) | Trùng chức năng `prp_desk_2seat.glb` của s2 (232 tam giác) | Không gộp; giữ bản 232 tam giác | P2 |
| `classroom_chalkboard.glb` | 260 tam giác, đạt ngân sách; GDD cần kích thước chuẩn lớp VN | Gộp vào Z01 sau khi xem trong game | P1 |
| Khăn quàng đỏ, bộ trang phục (`scarf-review/`, factory) | Đang làm dở (372 file chưa commit) | Chủ dự án quyết commit hay bỏ trước khi gộp | P1 |
| File rác trong asset-workshop: `.bak`, `.blend1`, `*_broken_backup.glb`, ~234 PNG preview | Làm repo nặng | Không gộp sang s2; để lại nhánh asset hoặc dùng `.gitignore` | P2 |
| Asset GDD §2 chưa có ở bất kỳ nhánh nào | Phòng 2026 + thùng kỷ vật, 9 kỷ vật, xe quà vặt, tiệm tạp hóa, đồ Hội trại, đồ Khu Vui Chơi, UI 2D (25 màn), âm thanh | Dựng theo thứ tự §5 của 03 | P0–P2 |

Cách gộp đề xuất: không merge cả nhánh asset (472 file, nhiều PNG/blend). Chép chọn lọc GLB đã đạt vào `public/assets/` của s2 qua PR riêng, kèm bản ghi công.

## 3. Phân bổ công việc sprint 21/11 → 04/12 (14 ngày)

Quy ước: Claude Code = code game (TS, test); Blender/Patch MCP = model, rig, xuất GLB; Gemini Pro = nội dung chữ, kịch bản số hóa, ảnh/âm tham chiếu. Thứ tự theo §6 của `02_GAMEPLAY_AND_MECHANICS.md`. Phần nào không kịp lùi sang sau 15/12; K1–K6 và chụp ảnh **không** cắt.

### Tuần 1 (21–27/11): nền và đường chơi bắt buộc
| Nhóm | Việc |
|---|---|
| Claude Code | (1) Chạy lại tsc/test/e2e trên s2, xác nhận A-01/A-02. (2) Khung minigame chung: thắng/thua/hòa/chơi lại/hướng dẫn, nạp trò theo `game_id`. (3) Mở rộng `SaveState`: `minigames.*`, `hub.unlocked`, cài đặt; viết bước chuyển đổi v2→v3. (4) Đổi event sang `page_started/completed`, thêm `minigame_started/finished`, `hub_opened`, `end_message_sent`; sửa `curious` → `deep`. (5) Đổi nhãn "Chương". (6) Dựng K3–K6 (kiểm lại hiện trạng trước) |
| Blender/Patch MCP | (1) Nhân vật về 1,3–1,5 m, kiểm gốc `min.y=0`, ngân sách tam giác. (2) Player nam/nữ + Đức, Châu, Quân, Hạ. (3) Cây phượng ≤ 3.000 tam giác; làm lại cây bàng. (4) Bộ đồ phòng 2026 + thùng kỷ vật |
| Gemini Pro | (1) Số hóa `KICH_BAN_DEMO_M1_M2_v1.md` v1.4 thành dữ liệu Ngày/Quest (định dạng `src/content/days/*.ts`) cho Trang 1–4. (2) Chữ UI thật thay `[PLACEHOLDER]` (hub, điện thoại, 3 tin kết demo) |

### Tuần 2 (28/11–04/12): Mốc 2, minigame bắt buộc, đóng gói
| Nhóm | Việc |
|---|---|
| Claude Code | (1) Nạp nội dung Trang 1–9. (2) Caro 12×12 (AI Đức dễ / Quân khó) + tỉ số loạt ván. (3) Sudoku Trang 7 (đồng hồ 6 phút). (4) Màn 2D confession + kết demo *(21/11 chiều: chủ dự án đã chốt hướng Trang 6 — thêm giao diện làm hòm thư, thư xin lỗi, chọn thư Valentine, 3 minigame đầy đủ + 2 nhánh rút gọn của buổi chiều — `02` §2.5; bàn giao ở `docs/gdd/IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md`)*. (5) Biến thể đêm Hội trại (Z02). (6) Nếu còn thời gian: Lật chai → Bắn bi ve. (7) Chạy e2e toàn tuyến, build production, kiểm môi trường `test`/`production` |
| Blender/Patch MCP | (1) Kỷ vật 9 Trang (hộp phấn KV-01 trước). (2) Xe quà vặt, tiệm tạp hóa. (3) Đồ Hội trại. (4) Hoạt ảnh Tầng A còn thiếu |
| Gemini Pro | (1) Số hóa nội dung Trang 5–9 và Hội trại Phần 1, 4. (2) Hướng dẫn minigame, thoại thắng/thua. (3) Bản kiểm lỗi chính tả, tên riêng, năm học (2014–2015) |

### Cắt giảm (theo GDD 02 §6, cắt từ dưới lên)
Trò mở rộng/"Sổ đố của Châu" → Nhảy lò cò → Ô ăn quan → Lật chai (bản không có đường dự đoán). Việc sau 04/12: Khu Vui Chơi đủ 3 trò, Tầng C.

## 4. Rủi ro cần chủ dự án quyết
1. **Nhân vật code hay GLB?** `s2` đang dựng bằng code. GDD yêu cầu model 3D có xương. Đổi sang GLB tốn ~2–3 ngày Claude Code + Blender; nên quyết ngay tuần 1.
2. **Nội dung còn là `[PLACEHOLDER]`.** Chỉ có 2/9 Trang có file dữ liệu, và là dữ liệu giả. Đây là đường găng của sprint (khâu của Gemini Pro).
3. **Số liệu cũ.** Báo cáo test và FPS có từ 13–15/11, trên máy không GPU. Cần đo lại trên laptop thật trước 04/12.
4. **Asset-workshop có 372 file chưa commit** trên máy Windows. Rủi ro mất nếu máy lỗi; nên commit nhánh WIP riêng (không push main).
5. **`docs/gdd/` chỉ mới có trên nhánh docs.** Cần PR về `main` để dev thấy cùng nguồn.
