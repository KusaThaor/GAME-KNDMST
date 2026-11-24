# PROMPT_FOR_OPUS — hoàn tất S2 theo 3 chặng

Cách dùng (chủ dự án): mở một phiên Claude Opus mới có quyền với repo `KusaThaor/GAME-KNDMST`, dán nguyên file này, rồi ghi thêm một dòng: **"Làm Chặng 1"** (hoặc 2, 3). Mỗi phiên chỉ làm **một chặng**.

---

## Vai trò
Bạn là Technical Lead của game web 3D **Hành Trình Thanh Xuân** (Vite + TypeScript + Three.js + Preact; Blender → GLB). Bạn hoàn tất gói **S2**: bản đồ 6 khu, va chạm, điều khiển nhân vật, camera A/B, pipeline Blender.

Bạn không cần lịch sử chat nào. Mọi thứ cần biết nằm trong repo.

## Trạng thái khi bạn bắt đầu
- Nhánh làm việc: `feature/s2-world-camera-blender` (tách từ `dev` @ `4f681cb`). Chạy `git log --oneline -5` để biết HEAD thật; đừng tin số ghi ở đây.
- **Phần code của S2 đã viết xong và đang chạy.** Việc của bạn là kiểm chứng trên trình duyệt, sửa lỗi nếu test lộ ra, viết tài liệu. **Không dựng lại, không viết lại** hệ thống đang chạy khi chưa có test chỉ ra lỗi.
- Mốc đã đo ngày 15/11/2026: `tsc` đạt · vitest 217 đạt, 1 bỏ qua · `validate:world` đạt · test pipeline Blender 61/61 (4.5.16 và 5.2.4) · Playwright 13 đạt, 1 bỏ qua · build production đạt. Đây là mốc cũ: **chạy lại và ghi số của bạn**, không chép lại số này vào báo cáo.

## Đọc trước, theo thứ tự (chỉ từng này, rồi mới đọc file liên quan tới chặng)
1. `docs/S2_EXECUTION_BLUEPRINT.md` — kiến trúc, hợp đồng, việc còn lại, bảng nghiệm thu. Đây là tài liệu chính.
2. `docs/DEV_SESSION_HANDOFF.md` — trạng thái chung của dự án, cách bật Firestore Emulator.
3. `README.md` — lệnh chạy, công cụ test (`?play=1`, `?day=&step=`, `?bot=release`, `?cast=`). README chưa ghi phần S2; công cụ mới (`?style=`, `teleport`, `toSpawn`, `world`) xem đầu file `src/lab/gameTools.ts`.
4. `tools/blender/world/pipeline_config.py` và `src/world/types.ts` — quy ước hai phía.

## Chuẩn bị môi trường
```
git fetch origin
git switch feature/s2-world-camera-blender      # hoặc: git worktree add ../GAME-KNDMST-s2 feature/s2-world-camera-blender
npm ci
npx playwright install chrome                    # nếu chưa có
```
- Trên máy chủ dự án (`C:\Users\Admin\Desktop\GAME\GAME-KNDMST`): thư mục đó đang ở nhánh `feature/asset-workshop` của một AI khác. **Không đổi nhánh ở đó.** Dùng `git worktree add` sang thư mục khác.
- Blender: dùng Blender cài sẵn (`blender --background --python <script> -- <tham số>`), hoặc Python 3.11 + `pip install bpy==4.5.*` trong venv rồi chạy `python <script> <tham số>`.
- Nếu không chạy được Blender: làm phần còn lại, ghi rõ phần Blender **chưa kiểm**.

## Lệnh kiểm (chạy đầu chặng làm mốc và cuối chặng)
```
npx tsc --noEmit
npm test
npm run validate:world
npm run test:e2e
VERCEL_ENV=production npm run build      # PowerShell: $env:VERCEL_ENV='production'; npm run build
python tools/blender/world/tests/test_pipeline.py     # hoặc: blender --background --python tools/blender/world/tests/test_pipeline.py
```
Sau build production: tìm `botStep`, `__game`, `gameTools` trong `dist/assets/*.js` — phải không có.

## Quy tắc không được phá
1. Không phá luồng F0–F10: phòng 2026 → Ngày ký ức → ảnh → Album → điện thoại → màn kết; checkpoint; đồng ý thu thập; analytics.
2. Không đụng `main`. Không tự gộp vào `dev`. Không force push. Không sửa `tools/asset-workshop/`.
3. Không viết thoại/cốt truyện thật; nội dung giả ghi `[PLACEHOLDER]`.
4. Không tự chốt quyết định nào trong bảng §2.3 của blueprint. Điều chưa chốt để trong file cấu hình.
5. Nội dung và quest chỉ tham chiếu ID ổn định (`zone.*`, `itr.*`, `spot.*`, `cam.*`, `spawn.*`). Không tham chiếu tên mesh, tên file, tọa độ.
6. Không sửa 6 file `.blend` và `gen_map_thcs.py` (bố cục đang chờ chủ dự án). Không chạy generator với `--overwrite-edited`.
7. Không thêm physics engine, thư viện mới, thanh toán, quảng cáo, multiplayer.
8. Analytics: không gửi tên người chơi, nội dung tin nhắn, kiểu camera. Không thêm event mới.
9. **Không báo "đạt" cho thứ chưa chạy.** Ghi rõ: đã chạy gì, số thật, chưa chạy gì và vì sao. FPS chỉ đo trên máy có GPU thật.
10. Không sửa test để hợp thức hóa hành vi sai. Sửa lỗi thì viết test tái hiện trước.
11. Không dán khóa bí mật, token, link deploy hook vào chat hay repo.

## Giữ tiến độ (bắt buộc — phiên trước từng hết ngữ cảnh khi chưa commit)
- Xong mỗi việc nhỏ có test đạt: **commit rồi push ngay** lên `feature/s2-world-camera-blender`. Không gom nhiều việc vào một commit cuối phiên.
- Cuối mỗi chặng: cập nhật mục "S2 — tiến độ" trong `docs/DEV_SESSION_HANDOFF.md` (đã làm, số test thật, chưa kiểm, việc kế tiếp), cập nhật cột Trạng thái ở §7 của blueprint, commit, push.
- Nếu sắp hết ngữ cảnh giữa chừng: dừng viết code, ghi tiến độ như trên, commit, push, rồi báo.

---

## CHẶNG 1 — World & Blender Pipeline
**Mục tiêu:** xác nhận tầng bản đồ và pipeline Blender đúng như blueprint mô tả; có hướng dẫn để người khác sửa bản đồ và thêm khu.

**Đọc thêm:** `tools/blender/world/*.py`, `tools/blender/world/tests/test_pipeline.py`, `src/world/{types,parse,world,validate}.ts`, `scripts/world-cli.ts`, `tests/unit/world/{parse,world,validate,expand}.test.ts`.

**Việc:**
1. Chạy toàn bộ lệnh kiểm, ghi số làm mốc.
2. Tạo `tests/unit/world/conventions.test.ts`: đọc `tools/blender/world/pipeline_config.py` dạng chữ, so `NAME_PREFIX_KIND` và `KINDS_NEED_ID` với `src/world/types.ts`. Lệch thì test đỏ.
3. Kết xuất ảnh xem thử: `export_world.py --preview`. **Mở từng ảnh ra xem.** Chụp cùng góc trong game (`?play=1&day=…`). So màu, ghi nhận xét thật (kể cả khi lệch).
4. Làm thử trọn quy trình "thêm khu thứ 7" trong thư mục tạm (dùng `--out-dir`, `--manifest`), không ghi vào bản đồ thật.
5. Viết `docs/BLENDER_PIPELINE.md` (mở file nào, cấu trúc collection, sửa mesh, đổi vật liệu/texture, thêm đồ vật, thêm marker, xuất lại, kiểm sau xuất; lệnh cho Windows và cho gói `bpy`) và `docs/HOW_TO_EXPAND_WORLD.md` (thêm khu thứ 7 từ đầu tới cuối, đúng các bước bạn vừa làm ở việc 4).

**Phạm vi được sửa:** `tests/unit/world/`, `docs/`. Chỉ sửa `tools/blender/world/*.py` hoặc `src/world/*.ts` nếu test lộ lỗi thật.

**Xong khi:** mọi lệnh kiểm đạt; test quy ước mới đạt; hai tài liệu có lệnh bạn đã tự chạy; ảnh so màu đã xem; đã commit + push; handoff đã cập nhật.

---

## CHẶNG 2 — Controller & Camera
**Mục tiêu:** chứng minh trên trình duyệt, bằng chuột và bàn phím thật, rằng đi lại, va chạm, đổi khu và camera A/B hoạt động.

**Đọc thêm:** `src/actors/player/controller.ts`, `src/actors/camera/cameraManager.ts`, `src/config/camera.ts`, `src/game/input.ts`, `src/world/{collision,travel}.ts`, `src/game/scenes/dayScene.ts`, `src/lab/gameTools.ts`, `tests/e2e/game.spec.ts` (để dùng lại các hàm `openGame`, `state`, `drive`), `tests/unit/world/{camera,collision,controller,travel}.test.ts`.

**Việc:**
1. Chạy lệnh kiểm làm mốc.
2. Tạo `tests/e2e/world.spec.ts` với 10 ca ở §6 (Chặng 2) của blueprint. Dùng `window.__game` (`state()`, `teleport()`, `toSpawn()`, `world()`) để đặt tình huống, nhưng **hành động được kiểm phải là phím/chuột thật** (`page.keyboard`, `page.mouse`).
3. Ca nào Chrome headless không làm được (thường là khóa con trỏ kiểu B): đánh dấu `test.fixme` kèm lý do, ghi vào báo cáo là **chưa kiểm**. Không giả kết quả.
4. Test lộ lỗi → viết lại thành ca nhỏ nhất, sửa đúng chỗ, chạy lại cả bộ.
5. Viết `docs/S2_WORLD_ARCHITECTURE.md` (mở rộng §3–§4 của blueprint, thêm vòng đời scene, cách camera khóa/trả cho cutscene, cách thay model nhân vật qua `rigAvatar`) và `docs/DECISIONS_AND_OPEN_QUESTIONS.md` (từ §2.3: cái gì lấy từ GDD, cái gì là giả định kỹ thuật, cái gì là nội dung giả, cái gì cần chủ dự án chốt).

**Phạm vi được sửa:** `tests/e2e/`, `docs/`; và khi có test đỏ chứng minh lỗi: `src/actors/`, `src/game/input.ts`, `src/world/collision.ts`, `src/world/travel.ts`, `src/game/scenes/dayScene.ts`, `src/config/camera.ts`. Không đổi giá trị mặc định của camera (D-S2-01).

**Xong khi:** `world.spec.ts` chạy, mỗi ca hoặc đạt hoặc `fixme` có lý do; bộ test cũ không lùi; hai tài liệu xong; đã commit + push; handoff và §7 blueprint đã cập nhật.

---

## CHẶNG 3 — Integration & Test
**Mục tiêu:** kiểm toàn bộ game sau S2, đóng gói tài liệu, đưa cho chủ dự án duyệt.

**Đọc thêm:** `src/game/game.ts`, `src/analytics/bridge.ts`, `shared/events.ts`, `tests/e2e/game.spec.ts`, `src/render/style.ts`.

**Việc:**
1. Bật Firestore Emulator (cách làm ở `docs/DEV_SESSION_HANDOFF.md`, mục Lưu ý), chạy `npm test` và `npm run test:e2e` với `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`. Kiểm: không có khóa cấm trong event; `public_demo_completed` đứng trước form; `zone_entered` chỉ mang `memory_day_id` và `zone_id`.
2. Build production, kiểm không lọt công cụ test.
3. Kiểm rò bộ nhớ phòng → Ngày → phòng (test đã có trong `game.spec.ts`); ghi số geometry/texture/heap thật.
4. Chụp ảnh trong game cả 6 khu, với `toon_outline` và `soft_pbr`. Xem ảnh; ghi lỗi nhìn thấy.
5. Viết `docs/ART_STYLE_CHANGE_GUIDE.md` (file nào sửa, file nào không; đổi bảng màu, vật liệu, ánh sáng, model; khi nào phải làm lại vật cản; rủi ro mất marker/ID — **không hứa** rằng đổi hình khối nào cũng không ảnh hưởng va chạm), `docs/S2_TEST_REPORT.md` (lệnh đã chạy, số thật, lỗi còn, chưa kiểm gì và vì sao), `docs/AI_HANDOFF_START_HERE.md` (ngắn: tình trạng, nhánh, kiến trúc tóm tắt, file quan trọng, lệnh test, việc kế tiếp).
6. Sửa `README.md` (mục bản đồ, bảng phím có `V`, lệnh `world:index`, `validate:world`) và `docs/DEV_SESSION_HANDOFF.md` (300–500 từ).
7. Cập nhật cột Trạng thái ở §7 blueprint. Mục nào chưa đạt ghi PARTIAL/BLOCKED kèm bằng chứng.
8. Mở Pull Request `feature/s2-world-camera-blender` → `dev`, mô tả ngắn + kết quả test. **Không tự gộp.**

**Phạm vi được sửa:** `docs/`, `README.md`, `tests/`; code chỉ khi có test đỏ.

**Xong khi:** mọi lệnh kiểm đạt (kể cả phần Emulator, hoặc ghi rõ vì sao chưa chạy được); đủ tài liệu; Pull Request đã mở; báo cáo cuối đã gửi.

---

## Báo cáo cuối mỗi chặng (tiếng Việt, dưới 300 từ, dễ hiểu, ít thuật ngữ)
Tách hai phần:
- **Báo cáo:** đã làm gì · đã chạy test gì, số thật · chưa kiểm gì · nhánh và commit cuối · đã push chưa.
- **Cần chủ dự án làm/duyệt:** chỉ những việc cần quyết (ví dụ D-S2-01 kiểu camera mặc định, D-S2-02 bố cục khu, D-S2-05 bản Blender chuẩn, đo FPS trên laptop thật, duyệt Pull Request).
