# DEV_SESSION_HANDOFF

## S2 — tiến độ (cập nhật 15/11/2026, 23:40 UTC+7, sau Chặng 1) — ĐỌC TRƯỚC
Phần dưới (v2) viết trước khi có S2. Riêng về S2, mục này và `docs/S2_EXECUTION_BLUEPRINT.md` mới là bản đúng.

- Nhánh `feature/s2-world-camera-blender` (tách từ `dev` @ `4f681cb`), đã push. Chưa gộp vào `dev`, chưa đụng `main`.
- Đã có code: bản đồ 6 khu `map_thcs` (`.blend` nguồn + `.glb`), va chạm, điều khiển nhân vật, camera A/B (phím V), pipeline Blender, nối vào Ngày ký ức. Bố cục 6 khu là blockout tạm.
- **Chặng 1 xong** (World & Blender Pipeline). Không sửa code trong `src/` hay `tools/` vì không test nào lộ lỗi. Đã thêm:
  - `tests/unit/world/conventions.test.ts`: so quy ước Blender (`pipeline_config.py`) với game (`types.ts`); lệch là đỏ.
  - So màu Blender ↔ game: màu trong `.glb` trùng bảng màu; ảnh preview Blender bạc màu (AgX); game buổi chiều ngả cam do ánh sáng. Ảnh `docs/images/s2_color_compare.jpg`.
  - Thử trọn "thêm khu thứ 7" trong thư mục tạm + worktree bỏ đi, chơi thử bằng phím thật. Bản đồ thật không đổi.
  - Tài liệu: `docs/BLENDER_PIPELINE.md`, `docs/HOW_TO_EXPAND_WORLD.md`, `docs/S2_TEST_REPORT.md` (mục Chặng 1).
- Số chạy thật cuối Chặng 1: `tsc` đạt; vitest 222 đạt, 1 bỏ qua (Emulator tắt); `validate:world` 0 lỗi 0 nhắc; Playwright 13 đạt, 1 bỏ qua (Emulator tắt); build production sạch công cụ test; `test_pipeline.py` 61/61 trên `bpy` 4.5.16 và 5.2.4.
- Chưa kiểm: `blender.exe` trên Windows; mở `.blend` bằng giao diện Blender; texture hiển thị trong game; test trình duyệt riêng cho S2 (Chặng 2); Firestore Emulator sau S2 (Chặng 3); FPS laptop thật; Edge.
- Thấy khi thử, chưa sửa: tên khu dài đè nút "Camera A" ở cửa sổ 960 px; nhắc `closed_zone_no_gate` hiện cả với khu chỉ vào bằng portal.
- Việc kế tiếp: **Chặng 2** (Controller & Camera) theo `docs/PROMPT_FOR_OPUS.md`.
- Chờ chủ dự án: D-S2-01 kiểu camera mặc định · D-S2-02 bố cục 6 khu · D-S2-04 art style (màu chiều ngả cam) · D-S2-05 bản Blender chuẩn (GDD ghi 5.2, máy đang cài 4.5.16).
- Máy chủ dự án đang ở nhánh `feature/asset-workshop`: cần `git fetch` rồi `git worktree add`, không đổi nhánh trong thư mục đó.

---

Phiên bản v2 · 15/11/2026, 01:xx (UTC+7) · Thay bản v1 (14/11).

## Mục tiêu hiện tại
Phần khung F0–F10 đã chạy từ đầu tới cuối với nội dung giả. Việc kế tiếp là S2 (bản đồ, điều khiển, camera thật) và nội dung thật khi nhóm chốt.

## Đã làm
- 14/11 tối (đã push, handoff v1 chưa ghi): phần logic F1–F7, F8 analytics, F10 gói nội dung giả.
- 15/11: phần chạy được của F3/F6/F7 (phòng 2026, Ngày ký ức, ảnh hẹn giờ, Hộp Kỷ Vật, Album, điện thoại, menu, màn kết); F9 (`?play=1`, `?day=&step=`, `?bot=release`, `?cast=`); README có mục "Thêm một Ngày ký ức mới".
- Sửa 3 lỗi tìm thấy khi test: câu hỏi đồng ý không hiện lúc mở game; event đầu mang ID khách khác các event sau; FPS hiển thị sai khi máy chậm.

## Đã test thật (15/11, Chrome headless)
- `npm test`: 135 test xanh, gồm test Firestore Emulator.
- `npm run test:e2e`: 14 test xanh. Bot chơi hết bản thử; tải lại trang giữa bước về đúng checkpoint; nhảy bước + đổi bảng vai; từ chối thu thập thì không gửi gì; chuột/bàn phím thật; chơi lại Ngày, xóa tiến trình.
- Đường ống thật tới Firestore Emulator: 11 lô, 66–67 event, 23 loại; không có tên Player, nội dung tin nhắn hay ghi chú; `public_demo_completed` đứng trước form.
- Bộ nhớ Hub → Ngày → Hub 12 vòng: geometry 22, texture 3 sau mỗi vòng (không đổi); heap 14,0 → 15,2 MB, mức tăng giảm dần.
- Bản build production không chứa công cụ test.

## Chưa test
- Bản preview trên Vercel: build báo thành công nhưng trang yêu cầu đăng nhập Vercel nên chưa mở được để kiểm.
- Event mới trên Firestore thật (mới kiểm trên Emulator).
- FPS trên laptop thật; trình duyệt Edge. Chrome headless vẽ bằng CPU nên rất chậm, không dùng làm số đo FPS.

## Link
- Preview nhánh `dev`: https://kndmst-git-dev-game-kndmst.vercel.app/?play=1 (cần đăng nhập Vercel)
- Commit mới nhất của phần code: `2100486` trên `dev`. Chưa đụng `main`.

## Còn tạm hoặc chưa có
- S2 chưa có trên `dev`: phần chơi dùng "góc sân" và điều khiển tạm, chưa va chạm, chưa camera kiểu B. Chỗ cần thay ghi trong `src/game/scenes/dayScene.ts`.
- Cuộn phim (phím C), minigame, hiệu ứng chuyển cảnh riêng, form phản hồi: mới có chỗ gắn hoặc thẻ `[PLACEHOLDER]`.
- Event `landing_view`, `cta_click`, `interactable_viewed`, `free_photo_taken`, `feedback_submitted` chưa có nơi phát.
- Bản production để trống (`release.ts`).

## Lưu ý
- Chạy Emulator không cần firebase-tools: tải `cloud-firestore-emulator-v1.19.8.jar` rồi `java -jar … --host=127.0.0.1 --port=8085`.
- Link deploy hook Vercel từng lộ trong chat: nên xóa, tạo mới.
- D-01, D-04, D-12, D-13, D-19, D-20 đang dùng phương án khuyến nghị làm giá trị tạm trong file cấu hình; D-03 (phạm vi public) còn để trống.

## Một bước tiếp theo
Chủ dự án mở link preview chơi thử và kiểm Firestore có event `environment=test`. Phiên code sau: bắt đầu S2 (bản đồ 6 khu, va chạm, camera A/B) thay phần điều khiển tạm.
