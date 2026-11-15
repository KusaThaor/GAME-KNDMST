# DEV_SESSION_HANDOFF

## S2 — tiến độ (cập nhật 15/11/2026, 22:30 UTC+7) — ĐỌC TRƯỚC
Phần dưới (v2) viết trước khi có S2. Riêng về S2, mục này và `docs/S2_EXECUTION_BLUEPRINT.md` mới là bản đúng.

- Nhánh `feature/s2-world-camera-blender` (tách từ `dev` @ `4f681cb`), đã push. Chưa gộp vào `dev`, chưa đụng `main`.
- Đã có code: bản đồ 6 khu `map_thcs` (file `.blend` nguồn + `.glb`), va chạm, điều khiển nhân vật, camera A/B (phím V), pipeline Blender, nối vào Ngày ký ức. Bố cục 6 khu là blockout tạm.
- Đã chạy thật 15/11 tối: `tsc` đạt; vitest 217 đạt, 1 bỏ qua (Emulator tắt); `validate:world` đạt; test pipeline Blender 61/61 trên 4.5.16 và 5.2.4; Playwright 13 đạt, 1 bỏ qua (Emulator tắt); build production không chứa công cụ test.
- Chưa kiểm: test trình duyệt riêng cho S2 (đụng tường, đi qua ranh khu, đổi camera, khóa con trỏ); phần Firestore Emulator sau S2; so màu Blender với game; chạy bằng `blender.exe` trên Windows; FPS laptop thật; Edge.
- Chưa có: bộ tài liệu S2 (kiến trúc, pipeline Blender, thêm khu, đổi art style, báo cáo test).
- Việc kế tiếp: làm theo `docs/PROMPT_FOR_OPUS.md`, Chặng 1 → 2 → 3, mỗi phiên một chặng.
- Chờ chủ dự án: D-S2-01 kiểu camera mặc định · D-S2-02 bố cục 6 khu · D-S2-05 bản Blender chuẩn (GDD ghi 5.2, máy đang cài 4.5.16).
- Máy chủ dự án đang ở nhánh `feature/asset-workshop`, chưa có code F1–F10 và S2: cần `git fetch` rồi `git worktree add`, không đổi nhánh trong thư mục đó.

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
