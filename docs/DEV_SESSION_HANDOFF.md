# DEV_SESSION_HANDOFF

## Integrator — 24/11/2026, đợt 2 (ĐỌC TRƯỚC)
- **Đã gộp thêm:** N-06 #9 → `628bc5a` (e2e 38/0/1) · K2 #17 → `2a987b6` (e2e 45/0/1; chứa N-08, nên **#11 đã đóng**). Nhánh thật sau gộp: tsc ✓ · vitest 521/2 · validate 0 lỗi.
- **Chưa gộp:** N-01 #8 — còn 1 ca e2e đỏ (`game.ts` không phát thoại của bước minigame); chủ dự án đồng ý cho N-01 sửa đúng chỗ đó rồi mới gộp.
- **Quyết định chủ dự án 24/11:** phòng 2026 đi lại tự do (thay "góc cố định"). Cần cập nhật `docs/gdd/00_MASTER_GDD.md`.
- **Chưa kiểm:** build production trên nhánh thật sau gộp · FPS laptop thật · Vercel Preview · Firestore thật · chơi tay.

## Integrator — 24/11/2026, đợt 1
- **Đã gộp:** N-05 #5 → `8257863` (merge commit) vào `feat/sprint-0412`. Mở khóa N-01 #8, N-13, N-15 (biến thể g08/g09).
- **Đã kiểm thật** trên bản gộp thử (nền `48677c5`): tsc ✓ · vitest 408/2 → **412/2** · validate:world 0 lỗi · build production ✓ · e2e đầy đủ `--workers=1` **38 đạt / 1 bỏ qua / 0 lỗi** (17,8 phút). Sau gộp, trên nhánh thật `8257863`: tsc ✓ · vitest 412/2 · validate 0 lỗi.
- **Chưa kiểm:** build production trên nhánh thật sau gộp (đã đạt ở bản gộp thử) · FPS laptop thật · Vercel Preview · Firestore thật · chơi tay.
- **N-01 #8:** thoại Trang 2 tự viết đã hết ở `b829023`; còn 1 xung đột `types.ts` + đổi khóa thời tiết `d_g07_03.ts` (s06/s07) + chạy lại e2e. "Mục 5.0 / 6.3 / 8 ca e2e đỏ" N-01 nhắc **không tồn tại** ở nhánh nào — đã báo lại trên PR #8.
- **Lưu ý:** PR #18 (`feat/sprint-0412` → `dev`) và #17 (K2, chứa N-08) đang mở do chủ dự án; Integrator chưa duyệt/gộp.

## Integrator — đợt gộp sáng 23/11/2026 (ĐỌC TRƯỚC)
- **Đã gộp** (merge commit, theo thứ tự): N-02b #7 `c637b5b` → N-07 #10 `bd0d535` → N-11a #12 `c25dd06` → N-11b #13 `eeb09c2`.
- **Trả về sửa** (bình luận chi tiết trên PR): N-05 #5 (xung đột `game.ts` với N-02b), N-08 #11 (e2e đỏ `game.spec.ts:304`), N-06 #9 (chữ tự đặt trên đạo cụ), N-01 #8 (thoại Trang 2 tự viết + xung đột + chưa e2e). Thứ tự gộp khi xong: N-05 → N-08 → N-06 → N-01.
- **Đã kiểm thật:** 4 lệnh trên từng bản gộp thử + tsc/vitest/validate trên nhánh thật sau mỗi lần gộp (vitest 338/2 → 391/2). e2e đầy đủ: N-02b 38/1; chồng gộp có N-06/N-07/N-08/N-11 37/1 + 1 lỗi (do N-08, đã khoanh bằng chạy riêng); nhánh thật `eeb09c2` **38/1 (29,5 phút)**.
- **Chưa kiểm:** FPS laptop thật · Vercel Preview · Firestore thật · ca Emulator · chơi tay · bản sửa ca 8 của N-05.
- **Quyết định Integrator:** PR đổi luồng chơi tự sửa ca e2e bị ảnh hưởng (ngoại lệ `tests/e2e`); Trang 5 làm Caro chơi thật theo GDD `02` §2.1 (thay "chọn ô 2 lần" của kịch bản), đối thủ Đức.
- **Việc tiếp:** gói giao việc N-04b, N-10b, N-12 → N-23 ở `docs/handoff/NEXT_BATCH_2026-11-23_N14-N23.md` (sóng 1 giao ngay). Tiến độ: board Mục 5.

## Integrator — đợt gộp 22–23/11/2026 (ĐỌC TRƯỚC)
- **Đã gộp vào `feat/sprint-0412`** (merge commit, theo thứ tự): N-03 #1 `a9758c2` → N-10 #6 `b66528b` → N-04 #2 `203982f` → N-02 #4 `f5fb467` → N-09 #3 `dfc156e`. **N-05 #5 trả về sửa** (e2e ca 8 đỏ — camera khóa ở cutscene cầu vồng). Đầu nhánh sau đợt: `dfc156e`.
- **Đã kiểm thật** (Integrator tự chạy trên từng bản gộp thử, rồi chạy lại tsc + vitest + validate trên nhánh thật sau mỗi lần gộp): tsc đạt; vitest 266/1 (mốc nền) → 338/2 sau đợt; `validate:world` 0 lỗi; build production đạt. e2e đầy đủ `--workers=1` cho 4 PR sửa luồng chơi: N-04 37/1, N-02 38/1, N-09 38/1; N-05 37/1 + **1 lỗi** (~32 phút/lượt, Linux 2 nhân, Chrome + SwiftShader).
- **Chưa kiểm:** FPS laptop thật · Vercel Preview · Firestore thật · ca Emulator của N-09 (`it.skipIf`) · chơi tay · 6 nhánh chưa mở PR (N-01, N-06, N-07, N-08, N-11a, N-11b).
- **Chủ dự án đồng ý 22/11:** N-05 sửa `game.ts`/`dayScene.ts`/`d_g07_03.ts` (vẫn hiệu lực khi PR sửa xong); N-09 sửa `game.ts`/`store.ts`.
- **Việc tiếp:** phiếu N-05, N-02b + mở PR 6 nhánh + đợt N-12/14/16/17/23 — `docs/handoff/NEXT_BATCH_2026-11-23.md`. Tiến độ: `docs/NEXT_SPRINT_TASK_BOARD.md` Mục 5.

## S2 — tiến độ (cập nhật 17/11/2026, 01:30 UTC+7, sau phiên 2c) — ĐỌC TRƯỚC
Phần dưới (v2) viết trước khi có S2. Riêng về S2, mục này và `docs/S2_EXECUTION_BLUEPRINT.md` mới là bản đúng.

- Nhánh `feature/s2-world-camera-blender`, đã push (tới phiên 2c). Chưa gộp vào `dev`, chưa đụng `main`.
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
- **Phiên 2c xong (16–17/11 đêm) — Chặng 2 hoàn tất:**
  - Chủ dự án chốt: chỉ camera Chuẩn, linh hoạt như Play Together/PUBG, code cũ giữ. **Góc nghiêng 5–65°** (GDD ghi 25–40°; số cũ ở `CAMERA_PITCH_GDD_V03`). **Nút tròn "nổi"** trên điện thoại: chạm đâu ở góc trái dưới cũng đi được (`POINTER_INPUT.joystick.floating`; `false` = nút cố định cũ).
  - E2E thêm ca 1, 2, 3, 7, 8, 9, 10, 5b, 11d (`tests/e2e/world.spec.ts`). Bỏ ca 6 (kiểu B) và ca V kiểu cũ theo chủ dự án.
  - Tài liệu mới: `docs/S2_WORLD_ARCHITECTURE.md` (vòng đời cảnh, camera khóa/trả, sơ đồ đầu vào, thay model qua `rigAvatar`), `docs/DECISIONS_AND_OPEN_QUESTIONS.md`. Cập nhật `S2_TEST_REPORT.md` (mục 2c), `CONTROLS_AND_TUTORIAL_NOTES.md`, blueprint §2.2/§2.3/§7.
  - Số chạy thật: `tsc` đạt; vitest 259 đạt, 1 bỏ qua; `validate:world` 0 lỗi; Playwright 37 đạt, 1 bỏ qua (toàn bộ); build production sạch công cụ test. Chi tiết: `docs/S2_TEST_REPORT.md`.
- **Việc kế tiếp: Chặng 3** (blueprint §6): chạy đủ bộ có Firestore Emulator, ảnh 6 khu × 2 phong cách, `ART_STYLE_CHANGE_GUIDE.md`, `AI_HANDOFF_START_HERE.md`, README, rồi mở Pull Request vào `dev` (không tự gộp).
- Chờ chủ dự án thử thật: nút tròn nổi + kéo dọc trên điện thoại; touchpad Windows (kéo một ngón, vuốt 2 ngón ngang). Cân nhắc: màn hướng dẫn điều khiển, thanh độ nhạy camera trong Menu.
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
