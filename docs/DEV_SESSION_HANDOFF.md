# DEV_SESSION_HANDOFF

## S2 — tiến độ (cập nhật 16/11/2026, 14:20 UTC+7, sau bản touchpad vuốt ngang) — ĐỌC TRƯỚC
Phần dưới (v2) viết trước khi có S2. Riêng về S2, mục này và `docs/S2_EXECUTION_BLUEPRINT.md` mới là bản đúng.

- Nhánh `feature/s2-world-camera-blender`, đã push (Phần A tới `4463b90`). Chưa gộp vào `dev`, chưa đụng `main`.
- Chặng 1 xong (World & Blender Pipeline) — xem `docs/S2_TEST_REPORT.md`.
- **Chặng 2 Phần A xong (2a + 2b):** kiểu camera "Chuẩn" là mặc định (D-S2-01 đã chốt): kéo chuột trái/phải, touchpad (cuộn/chụm 2 ngón, kéo một ngón), cảm ứng (nút tròn, kéo xoay, chụm, nút E ảo, nút Tạo dáng). V/Menu xoay vòng Chuẩn → A → B. Chặn cuộn/phóng trang, viewport tai thỏ. Số chỉnh ở `POINTER_INPUT` (`src/config/camera.ts`), logic ở `src/game/gestures.ts`.
- **HOTFIX touchpad (16/11 sáng, đã push `14f5fb5`):** chủ dự án thử thật Windows + Cốc Cốc: kéo touchpad để xoay KHÔNG đạt. Gốc lỗi CHƯA xác nhận (nghi số 1: bản lưu cũ còn kiểu A). Đã làm: kéo kiểu Chuẩn chắc hơn (giữ con trỏ, xử lý mất pointerup), tùy chọn "Nhìn tự do" (phím L / Menu; bấm để khóa, rê touchpad là xoay), bảng chẩn đoán `?inputdebug=1` (chỉ bản test). Playwright 26 đạt, 1 bỏ qua. Chờ chủ dự án thử lại theo `docs/TOUCHPAD_CHECK_GUIDE.md` và gửi nội dung "Sao chép". Chi tiết: `docs/S2_TEST_REPORT.md` mục HOTFIX.
- **CHỐT 16/11 trưa: chỉ dùng camera "Chuẩn", không đổi camera.** Tắt nút/phím đổi kiểu (V) và Nhìn tự do (L) bằng `CAMERA_OPTIONS` trong `src/config/camera.ts` (code vẫn giữ, bản test bật tạm bằng `?camtest=1`). Bản lưu cũ A/B tự về Chuẩn. Danh sách nút + câu hướng dẫn để làm màn hướng dẫn sau: `docs/CONTROLS_AND_TUTORIAL_NOTES.md`.
- **16/11 chiều — touchpad vừa đi vừa xoay (đã push `d67b4d6`):** vuốt 2 ngón NGANG = xoay camera (không cần nhấn, tay kia giữ WASD), vuốt dọc = zoom, chụm = zoom; mỗi lần vuốt chỉ theo một hướng. Logic `WheelRouter` (`src/game/gestures.ts`), số chỉnh `POINTER_INPUT.wheel_look` (đổi dấu `px_scale` nếu xoay ngược). Dòng hướng dẫn máy tính đã ghi thêm. Số chạy thật: `tsc` đạt; vitest 253 đạt, 1 bỏ qua; `validate:world` 0 lỗi; Playwright 28 đạt, 1 bỏ qua (thêm ca 12b); build production sạch. Mới kiểm bằng mô phỏng (CDP wheel), chưa thử touchpad thật. Phần 2b (cảm ứng) đã xong từ trước, không làm lại.
- **D-S2-05 đã chốt:** Blender 4.5.16 LTS (`BLENDER_STANDARD` trong `pipeline_config.py`, `docs/BLENDER_PIPELINE.md`).
- Số chạy thật cuối Phần A: `tsc` đạt; vitest 241 đạt, 1 bỏ qua; `validate:world` 0 lỗi; Playwright 19 đạt, 1 bỏ qua (thêm 6 ca ở `tests/e2e/world.spec.ts`: 4, 5, 11a/b/c, 12); build production sạch công cụ test.
- Touchpad/cảm ứng mới kiểm bằng **mô phỏng** của Chrome. Chưa thử điện thoại thật, touchpad thật; FPS chưa đo.
- Khu nặng nhất (mô phỏng điện thoại): cổng ~185 draw call, ~66 nghìn tam giác. Độ nét màn hình đã giới hạn ≤ 2.
- Thấy khi thử, chưa sửa (từ Chặng 1): tên khu dài đè nút "Camera" ở cửa sổ 960 px; nhắc `closed_zone_no_gate` với khu chỉ vào bằng portal.
- **Việc kế tiếp: phiên 2c** theo `docs/PROMPT_CHANG_2.md`: Phần B ca 1–3, 6–10 (ca 9 phải đếm cả listener cảm ứng); Phần C: `docs/S2_WORLD_ARCHITECTURE.md` (có sơ đồ luồng đầu vào), `docs/DECISIONS_AND_OPEN_QUESTIONS.md`, cột Trạng thái §7 blueprint.
- Chờ chủ dự án: thử trên điện thoại/touchpad thật · D-S2-02 bố cục 6 khu · D-S2-03 · D-S2-04 art style (màu chiều ngả cam).
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
