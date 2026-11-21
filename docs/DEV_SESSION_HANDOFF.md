# DEV_SESSION_HANDOFF

## T-02 — Lưới an toàn quest (A-01, A-02) — phiên 22/11/2026 (Sonnet, Medium)

**Nhánh làm việc:** `feat/t02-a01-a02`, tạo từ `feat/sprint-0412` @ `d5531b2` (chưa push; `dev`, `main` không đụng).
**Đặc tả:** `docs/handoff/SPRINT_TASKS.md` mục T-02 · `docs/ai-handoff/04_NEXT_TASK_FOR_CLAUDE.md` · `docs/ai-handoff/01_PROJECT_AUDIT.md` (A-01, A-02).

| Lỗi | Trạng thái |
|---|---|
| A-01 (`proximity()`, bước `goto`) | XONG phần sửa + test xanh (e2e toàn bộ chưa chạy lại — xem Checkpoint 2) |
| A-02 (luật `optional_quest_unstartable`) | XONG phần sửa + test xanh |

### Checkpoint 0 — baseline (đầu phiên)
- Baseline chạy thật: `npx tsc --noEmit` đạt · `npm test` 266 đạt / 1 bỏ qua · `npm run validate:world` 0 lỗi (6 khu).
- Hành vi mong đợi A-01: bước `goto` đang chờ (hoặc bước đầu `goto` của Side/Daily đang `available`) hoàn thành khi người chơi đứng trong bán kính và giao diện không khóa — kể cả đã đứng sẵn, hoặc vào bán kính lúc giao diện khóa rồi mở lại. Không hoàn thành hai lần.
- Hành vi mong đợi A-02: `validateContent` báo lỗi mã `optional_quest_unstartable` khi Side/Daily có bước đầu không thuộc `talk | interact | goto | collect | place`. Gói hiện tại phải 0 lỗi.
- Test: e2e `tests/e2e/world.spec.ts` (ca mới "A-01") · unit `tests/unit/validate.test.ts` (A-02).
- Lệnh hẹp: `npx playwright test tests/e2e/world.spec.ts -g "A-01" --workers=1` · `npx vitest run tests/unit/validate.test.ts`.
- Bước tiếp theo: chạy ca e2e A-01 (đỏ), ghi kết quả đỏ vào đây. → xong, xem Checkpoint 1.

### Checkpoint 1 — A-01 test ĐỎ (trước khi sửa)
- File đã đổi: `tests/e2e/world.spec.ts` (ca "A-01: bước goto hoàn thành khi người chơi vào bán kính lúc Menu đang mở…"), `docs/DEV_SESSION_HANDOFF.md`.
- Ca dựng: `?day=d.g07.03&step=q_m1_main_05.s01` → xác nhận `q_m1_side_02` = `available` → Esc mở Menu → `teleportTo('itr.thcs.gutter')` → đóng Menu (Esc), không đi.
- Lệnh: `npx playwright test tests/e2e/world.spec.ts -g "A-01" --workers=1` → **ĐỎ (1 failed, 39,6 giây)**.
- Lỗi thực tế: sau khi đóng Menu, chờ 15 giây mà `active` vẫn chỉ là `["q_m1_main_05.s01"]`; không bao giờ có `q_m1_side_02.s02` (`expect(received).toContain("q_m1_side_02.s02")`). Các điều kiện đầu ca (quest `available`, Menu mở được, dịch chuyển được) đều qua → đỏ đúng nguyên nhân A-01: `arrive` chỉ phát ở khung hình đầu vào bán kính, lúc đó giao diện khóa nên bị bỏ lỡ.
- Còn lại: sửa `proximity()` (A-01), A-02, tài liệu, build, push.
- Bước tiếp theo: sửa `proximity()` trong `src/game/game.ts`, chạy lại ca A-01 tới xanh. → xong, xem Checkpoint 2.

### Checkpoint 2 — A-01 test XANH (sau khi sửa)
- File đã đổi: `src/game/game.ts` (chỉ `proximity()` + bỏ tập `inside` và `inside.clear()` ở `cancelAll`), `tests/e2e/world.spec.ts` (thêm `active` vào kiểu `St`, không đổi ý nghĩa ca).
- Sửa: mỗi khung hình, với đích đang trong bán kính và `!locked()`, hỏi `engine.peek('arrive', id)` rồi `engine.trigger('arrive', id)`; không còn nhớ "đã vào vòng". Bước đã xong không còn khớp → không hoàn thành hai lần.
- Kết quả thật: ca "A-01" **XANH** (1 passed, 57 giây; kiểm cả "đúng 1 event `quest_step_completed` cho `q_m1_side_02.s01` khi đứng yên") · `npx tsc --noEmit` đạt · `npm test` 266 đạt / 1 bỏ qua (không giảm) · `game.spec.ts` ca "bot chơi hết bản thử" và ca "?day=&step=" xanh (2 passed, 4,5 phút).
- Chưa chạy: toàn bộ Playwright (~32 phút) — chạy một lần cuối phiên.
- Bước tiếp theo: viết unit test đỏ A-02 trong `tests/unit/validate.test.ts`. → xong, xem Checkpoint 3.

### Checkpoint 3 — A-02 test ĐỎ (trước khi sửa validator)
- File đã đổi: `tests/unit/validate.test.ts` (nhóm "A-02: Side/Daily phải mở đầu bằng hành động trong thế giới", 5 ca).
- Ca đỏ (bắt lỗi thiếu luật): Side mở bằng `cutscene`; Daily mở bằng `free`. Ca bảo vệ báo nhầm (đã xanh từ đầu, phải giữ xanh): Side mở bằng `talk` rồi `cutscene` ở bước sau; Main mở bằng `cutscene`; 5 loại bước đầu hợp lệ `talk|interact|goto|collect|place`.
- Lệnh: `npx vitest run tests/unit/validate.test.ts` → **ĐỎ: 2 failed, 19 passed** (`expected [] to include 'optional_quest_unstartable:q_m1_side_01'` / `…:q_m1_daily_01`). `tsc` đạt.
- Còn lại: thêm luật trong `src/content/validate.ts`, chạy lại unit + validator trên gói thật, tài liệu, build, push.
- Bước tiếp theo: thêm luật `optional_quest_unstartable` vào khối kiểm quest của `src/content/validate.ts`. → xong, xem Checkpoint 4.

### Checkpoint 4 — A-02 test XANH (sau khi sửa)
- File đã đổi: `src/content/validate.ts` (hằng `STARTABLE_FIRST_STEPS` + luật trong khối kiểm quest, lỗi tiếng Việt kèm cách sửa).
- Kết quả thật: `npx vitest run tests/unit/validate.test.ts` **21 đạt** (5 ca A-02 đều đạt) · `npm test` **271 đạt / 1 bỏ qua** (trước 266; +5 ca mới) · `npx tsc --noEmit` đạt · `npm run validate:world` 0 lỗi, 0 nhắc.
- Gói nội dung hiện tại qua validator **0 lỗi**: `tests/unit/contentPack.test.ts` (môi trường test, production, mọi bảng vai D-01) đạt trong lần `npm test` trên.
- Bước tiếp theo: cập nhật `README.md` (mục "Thêm một Ngày ký ức mới") và `docs/ai-handoff/02_QUEST_SYSTEM.md` §6. → xong, xem Checkpoint 5.

### Checkpoint 5 — tài liệu + build
- File đã đổi: `README.md` (mục "Thêm một Ngày ký ức mới": quy tắc bước đầu Side/Daily, lỗi `optional_quest_unstartable`, cách sửa, hành vi `goto`), `docs/ai-handoff/02_QUEST_SYSTEM.md` (§6 mục 1–2 viết lại theo hành vi đã triển khai; bảng ở đầu file bỏ chữ "bẫy" đã hết hiệu lực).
- Build: `VERCEL_ENV=production vite build` (ra `/tmp`, ngoài repo) **thành công**; tìm `botStep|__game|gameTools` trong `assets/*.js` → **không thấy**.
- Playwright toàn bộ (`npx playwright test --workers=1`): xem mục "Kết quả cuối" bên dưới.

---

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
