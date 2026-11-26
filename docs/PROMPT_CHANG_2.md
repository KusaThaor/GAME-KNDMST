# PROMPT_CHANG_2 — Controller & Camera (bản cập nhật theo quyết định của chủ dự án 15/11 tối)

Cách dùng: mở phiên Claude Opus mới có quyền repo `KusaThaor/GAME-KNDMST`, dán nguyên file này, rồi ghi thêm **một dòng**: **"Làm 2a"**, **"Làm 2b"** hoặc **"Làm 2c"**. Mỗi phiên chỉ làm MỘT phần (để không hết ngữ cảnh giữa chừng):

- **2a:** Phần A cho **chuột và touchpad** — kiểu camera "Chuẩn", đặt làm mặc định, test đơn vị, ca e2e 4, 5, 12 (và 1–3 nếu còn sức). Chưa làm cảm ứng điện thoại.
- **2b:** Phần A cho **cảm ứng điện thoại** — joystick ảo, kéo xoay, chụm zoom, nút E ảo, mọi thao tác chạm được, chặn hành vi trình duyệt, hướng dẫn trên màn hình theo thiết bị; ca e2e 11.
- **2c:** Phần B còn lại (ca 1–3, 6–10) và Phần C (3 tài liệu, handoff, blueprint §7, copy vào Project).

Đầu mỗi phiên: đọc mục "S2 — tiến độ" trong `docs/DEV_SESSION_HANDOFF.md` để biết phần nào đã xong, chạy lệnh kiểm làm mốc. Cuối mỗi phiên: ghi tiến độ vào handoff (đã làm, số test thật, chưa kiểm, phần kế tiếp), commit, push. Báo cáo cuối theo mẫu ở cuối file, chỉ cho phần vừa làm.

Phạm vi trọn Chặng 2 như dưới đây; chỉ làm phần của phiên này. (Đây là bản thay thế phần Chặng 2 trong `docs/PROMPT_FOR_OPUS.md`; các quy tắc chung ở file đó vẫn giữ.)

## Vai trò và bối cảnh
Bạn là Technical Lead của game web 3D **Vùng Ký Ức** (Vite + TypeScript + Three.js + Preact). Nhánh làm việc: `feature/s2-world-camera-blender` (chạy `git log --oneline -5` xem HEAD thật; Chặng 1 đã xong ở `ccc50ef`). Không cần lịch sử chat; mọi thứ nằm trong repo.

## Chủ dự án đã chốt (thay các mục "chưa chốt" cũ)
1. **D-S2-01 — camera mặc định:** làm giống các game phổ thông như **Play Together**: camera thứ ba bám sau nhân vật, **kéo để xoay**, **zoom**, nhân vật đi theo hướng bấm. Không bắt người chơi giữ chuột phải hay khóa con trỏ.
2. **Phải chơi được trên 4 loại thiết bị:** chuột + bàn phím; **touchpad laptop** (không có chuột phải/giữa, cuộn 2 ngón); **web trên điện thoại** (cảm ứng, màn dọc và ngang); và vẫn dùng được khi tay chỉ có chuột.
3. **D-S2-05 — Blender chuẩn là 4.5.16 LTS.** Ghi vào tài liệu và `pipeline_config.py` là bản chuẩn (5.2.4 vẫn được test nhưng không phải bản chuẩn). Không cần chạy lại gì ở phía Blender.

Quy tắc "không đổi giá trị mặc định camera" của prompt cũ **hết hiệu lực** cho phần điều khiển/kiểu camera; các số của preset (khoảng cách, góc 25–40°, zoom 3,5–8 m) giữ nguyên vì là GDD.

## Đọc trước (chỉ từng này)
`docs/S2_EXECUTION_BLUEPRINT.md` (§2.2, §3, §4, §6 Chặng 2), `docs/DEV_SESSION_HANDOFF.md`, `docs/S2_TEST_REPORT.md`, rồi: `src/config/camera.ts`, `src/game/input.ts`, `src/actors/camera/cameraManager.ts`, `src/actors/player/controller.ts`, `src/game/scenes/dayScene.ts`, `src/game/game.ts` (nơi đổi kiểu camera, phím `V`), `src/lab/gameTools.ts`, `tests/e2e/game.spec.ts` (dùng lại `openGame`, `state`, `drive`), `tests/unit/world/{camera,collision,controller,travel}.test.ts`, `src/ui/` (phần HUD, chỗ hiện hướng dẫn phím).

Hiện trạng đã biết: `input.ts` chỉ có chuột + bàn phím, **chưa có cảm ứng**; kiểu A = giữ chuột phải, kiểu B = khóa con trỏ; mặc định A; HUD có nút "Camera A [V]" và dòng hướng dẫn "Giữ chuột phải để xoay camera".

## Chuẩn bị môi trường
```
git fetch origin && git switch feature/s2-world-camera-blender
npm ci
```
Máy chủ dự án đang ở nhánh `feature/asset-workshop` của AI khác: **không đổi nhánh ở đó**, dùng `git worktree add`. Chrome có sẵn (`channel: 'chrome'`).

## Lệnh kiểm (chạy đầu chặng làm mốc, cuối chặng chạy lại)
```
npx tsc --noEmit
npm test
npm run validate:world
npm run test:e2e
VERCEL_ENV=production npm run build      # rồi grep botStep|__game|gameTools trong dist/assets/*.js: phải không có
```
Mốc cuối Chặng 1 để so (đừng chép vào báo cáo, hãy chạy lại): vitest 222 đạt 1 bỏ qua; Playwright 13 đạt 1 bỏ qua; `validate:world` 0 lỗi.

## Quy tắc không được phá
1. Không phá luồng F0–F10 (phòng 2026 → Ngày ký ức → ảnh → Album → điện thoại → màn kết; checkpoint; đồng ý thu thập; analytics).
2. Không đụng `main`, không tự gộp vào `dev`, không force push, không sửa `tools/asset-workshop/`.
3. Không viết thoại/cốt truyện thật; nội dung giả ghi `[PLACEHOLDER]`.
4. Không sửa 6 file `.blend`, `gen_map_thcs.py`. Không thêm physics engine, thư viện mới (nút ảo/joystick tự viết bằng Preact + Pointer Events), thanh toán, quảng cáo, multiplayer.
5. Analytics: không gửi kiểu camera, kiểu thiết bị, nội dung tin nhắn, tên người chơi; **không thêm event mới**.
6. **Không báo "đạt" cho thứ chưa chạy.** Ghi rõ đã chạy gì, số thật, chưa chạy gì và vì sao. FPS chỉ đo trên máy có GPU thật. **Cảm ứng thật trên điện thoại thật chưa kiểm được trong phiên này** — chỉ kiểm bằng mô phỏng cảm ứng của Chrome (Playwright `hasTouch`, `isMobile`, CDP `Input.dispatchTouchEvent`), và ghi rõ đó là mô phỏng.
7. Không sửa test để hợp thức hóa hành vi sai. Sửa lỗi thì viết test tái hiện trước.
8. Không dán khóa bí mật vào chat hoặc repo.
9. **Commit + push ngay sau mỗi việc nhỏ có test đạt** (phiên trước từng hết ngữ cảnh khi chưa commit). Sắp hết ngữ cảnh: dừng code, ghi tiến độ vào handoff, commit, push, báo.

## CHẶNG 2 — việc phải làm

### Phần A. Kiểu điều khiển mới "Chuẩn" (mặc định) — làm trước, có test từng bước
Thêm kiểu camera thứ ba tên `standard` (nhãn hiển thị ví dụ "Chuẩn"), làm **mặc định** (`DEFAULT_CAMERA_MODE`). Giữ A và B làm tùy chọn nâng cao; phím `V` xoay vòng cả 3; kiểu đã chọn vẫn lưu cục bộ, không gửi analytics. Người chơi cũ đã lưu A/B giữ nguyên lựa chọn.

Hành vi của kiểu "Chuẩn" (theo Play Together và game di động phổ thông):
- **Xoay camera:** kéo bằng **chuột trái** trên vùng trống của màn hình (không khóa con trỏ, không cần chuột phải). Chuột phải kéo cũng xoay (cho ai quen). Touchpad: bấm-giữ-kéo bằng một ngón hoặc nhấn vật lý rồi kéo — vẫn là chuột trái nên chạy.
- **Phân biệt kéo và bấm:** kéo quá ngưỡng nhỏ (~6 px) mới tính là xoay; bấm nhanh không xoay (để bấm NPC/điểm tương tác/nút giao diện). Bấm vào nút/bảng giao diện không được làm xoay camera.
- **Zoom:** lăn chuột; **touchpad cuộn 2 ngón** (sự kiện `wheel`, cả khi `ctrlKey` do pinch-zoom của touchpad — phải `preventDefault` để trang không bị zoom); **cảm ứng chụm 2 ngón**. Luôn giới hạn trong min/max của preset.
- **Đi:** WASD/mũi tên (đã có), Shift chạy. Hướng đi tính theo hướng camera như hiện nay.
- **Cảm ứng (điện thoại, màn dọc và ngang):**
  - Joystick ảo ở góc dưới trái (kéo ra xa mép = chạy), chỉ hiện khi thiết bị có cảm ứng hoặc người chơi chạm vào; không che nút giao diện khác.
  - Kéo một ngón ở **nửa phải/vùng trống** để xoay camera; chụm 2 ngón để zoom.
  - Nút ảo **E** (tương tác) hiện khi có gợi ý tương tác, nút **V** thu vào menu cài đặt nhỏ (không bắt buộc hiện thường trực). Các thao tác mà hiện giờ chỉ có phím (E, J sổ tay, Esc menu, bước chụp ảnh hẹn giờ, thoại, form, đóng bảng) **đều phải làm được bằng chạm**. Kiểm từng cái, liệt kê cái nào đã sửa.
  - Nhiều ngón cùng lúc: một ngón joystick + một ngón xoay camera phải chạy song song (theo dõi bằng `pointerId`).
  - Chặn các hành vi trình duyệt phá trải nghiệm: `touch-action: none` trên vùng chơi, không cuộn/zoom trang, không chọn chữ, không menu chuột phải/giữ lâu, ngăn kéo-để-tải-lại. Thêm/kiểm thẻ `viewport` cho điện thoại có tai thỏ (`viewport-fit=cover`) và dùng `env(safe-area-inset-*)` cho joystick/nút.
  - Màn dọc: vẫn chơi được (joystick + kéo xoay); nếu bố cục giao diện quá chật, ghi lại thành lỗi nhìn thấy và sửa các lỗi nhỏ, còn vấn đề lớn thì liệt kê cho chủ dự án (đừng thiết kế lại giao diện).
- **Hiệu năng trên điện thoại:** không thêm hiệu ứng nặng; kiểm `renderer.setPixelRatio` có giới hạn (ví dụ ≤ 2) và ghi nhận số draw call/tam giác của khu nặng nhất. FPS thật: để trống, ghi "chưa đo".
- **Hướng dẫn trên màn hình** (dòng "WASD đi · Shift chạy…") đổi theo thiết bị đang dùng: máy tính hiện phím; cảm ứng hiện "Kéo nút tròn để đi · Kéo màn hình để xoay".
- Sửa `src/config/camera.ts`: thêm kiểu mới + các hằng ngưỡng kéo, độ nhạy cảm ứng (chỉnh được, không viết cứng trong code); đặt `DEFAULT_CAMERA_MODE`.
- Cập nhật `CameraManager`/`input.ts` tối thiểu; **giữ nguyên hợp đồng** `GameInput` (chỉ mở rộng), đảm bảo vẫn **một bộ listener duy nhất** (không nhân đôi khi chuyển Hub ↔ Ngày), và `dispose()` gỡ sạch cả listener cảm ứng.
- Viết test đơn vị trước cho phần logic thuần (nhận diện kéo/bấm, gộp pointer, chụm, chuyển kiểu, ngưỡng zoom), rồi mới nối giao diện.

### Phần B. Test trình duyệt `tests/e2e/world.spec.ts` (10 ca của blueprint §6 Chặng 2, điều chỉnh theo kiểu "Chuẩn")
Dùng `window.__game` (`state()`, `teleport()`, `toSpawn()`, `world()`) **chỉ để đặt tình huống**; hành động được kiểm phải là `page.keyboard` / `page.mouse` / mô phỏng cảm ứng thật.
1. Giữ `W` đi vào tường → dừng, không xuyên.
2. Đi bộ sân → hành lang: `zone` đổi, tên khu hiện, đúng 1 event `zone_entered` (chỉ có `memory_day_id` và `zone_id`).
3. `d.g06.01` (mở 3 khu): đi về phía cổng → bị chặn.
4. `V` xoay vòng kiểu camera, nhãn đổi; tải lại trang vẫn giữ kiểu; người chơi mới mặc định là "Chuẩn".
5. Kiểu "Chuẩn": **kéo chuột trái** → góc xoay đổi; **bấm nhanh** thì không đổi và bấm nút giao diện không xoay; lăn chuột và `wheel` có `ctrlKey` (giả lập touchpad pinch) → khoảng cách đổi trong giới hạn, trang không bị zoom.
6. Kiểu B: khóa con trỏ khi đi; mở thoại/bảng thì thả. Headless không khóa được → `test.fixme` kèm lý do, ghi **chưa kiểm**.
7. Camera sát tường: khoảng cách thật < khoảng cách đặt.
8. Bước chụp ảnh hẹn giờ: camera khóa ở khung ngắm rồi được trả lại.
9. Phòng → Ngày → phòng ×3: `listeners` không tăng (cả với listener cảm ứng).
10. Tải lại trang khi đang ở khu khác khu xuất phát → đứng lại ở điểm xuất hiện của khu đó, tiến độ quest giữ nguyên.
11. **(mới) Cảm ứng mô phỏng** (viewport ~390×844 dọc và 844×390 ngang, `hasTouch`): joystick kéo → nhân vật đi; kéo vùng trống → camera xoay đồng thời với joystick; chụm → zoom; nút E bấm được; chơi được một bước chụp ảnh và một đoạn thoại chỉ bằng chạm; trang không cuộn/zoom.
12. **(mới) Touchpad mô phỏng:** cuộn 2 ngón (wheel) zoom, kéo một ngón (chuột trái) xoay; không cần chuột phải.

Ca nào Chrome headless không làm được: `test.fixme` + lý do, ghi vào báo cáo là chưa kiểm. Không giả kết quả. Test lộ lỗi → viết lại thành ca nhỏ nhất, sửa đúng chỗ, chạy lại cả bộ.

### Phần C. Tài liệu
- `docs/S2_WORLD_ARCHITECTURE.md`: mở rộng §3–§4 blueprint + vòng đời scene, cách camera khóa/trả cho cutscene, cách thay model nhân vật qua `rigAvatar`, **sơ đồ luồng đầu vào** (chuột/touchpad/cảm ứng → `GameInput` → controller/camera).
- `docs/DECISIONS_AND_OPEN_QUESTIONS.md` (từ blueprint §2.3): cái gì lấy từ GDD, cái gì giả định kỹ thuật, cái gì nội dung giả, cái gì cần chủ dự án chốt. **Ghi D-S2-01 đã chốt: "Chuẩn" (kiểu Play Together)** và D-S2-05 đã chốt Blender 4.5.16; D-S2-02/03/04 vẫn chưa.
- Cập nhật mục "Chặng 2" trong `docs/S2_TEST_REPORT.md` (lệnh đã chạy, số thật, chưa kiểm gì).
- Cuối chặng: cập nhật mục "S2 — tiến độ" trong `docs/DEV_SESSION_HANDOFF.md`, cột Trạng thái §7 blueprint, và **cập nhật `DEFAULT_CAMERA_MODE`/mô tả §2.2 blueprint** cho khớp. Rồi copy `DEV_SESSION_HANDOFF.md` và `S2_EXECUTION_BLUEPRINT.md` vào Project (nếu có công cụ Projects).

**Phạm vi được sửa:** `tests/`, `docs/`, `src/config/camera.ts`, `src/game/input.ts`, `src/actors/`, `src/game/scenes/dayScene.ts`, `src/game/game.ts` (chỉ chỗ đổi kiểu camera), `src/ui/` (chỉ joystick/nút ảo/hướng dẫn trên màn hình/gợi ý), `src/world/collision.ts`, `src/world/travel.ts`, `index.html` (thẻ viewport), `tools/blender/world/pipeline_config.py` (chỉ ghi bản Blender chuẩn).

**Xong khi:** kiểu "Chuẩn" là mặc định và chạy với chuột, touchpad mô phỏng, cảm ứng mô phỏng; `world.spec.ts` chạy, mỗi ca đạt hoặc `fixme` có lý do; bộ test cũ không lùi; tsc, vitest, `validate:world`, build production (không lọt công cụ test) đạt; ba tài liệu xong; đã commit + push; handoff + blueprint §7 đã cập nhật.

## Báo cáo cuối chặng (tiếng Việt, dưới 300 từ, dễ hiểu, ít thuật ngữ)
Tách hai phần:
- **Báo cáo:** đã làm gì · test nào đã chạy, số thật · chưa kiểm gì (đặc biệt: cảm ứng trên điện thoại thật, touchpad thật, FPS) · nhánh + commit cuối · đã push chưa.
- **Cần chủ dự án làm/duyệt:** chỉ những việc cần quyết hoặc cần thiết bị thật — ví dụ: **tự chơi thử trên điện thoại thật (iPhone Safari, Android Chrome) và touchpad laptop thật** theo danh sách kiểm ngắn bạn đưa kèm; D-S2-02/03/04; đo FPS trên laptop/điện thoại thật.
