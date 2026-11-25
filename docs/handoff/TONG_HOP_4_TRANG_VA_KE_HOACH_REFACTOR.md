# TỔNG HỢP 4 TRANG MỐC 1, KIỂM TOÁN THIẾU SÓT & KẾ HOẠCH REFACTOR / MODULE HÓA (BÀN GIAO CLAUDE MANAGER)

| Trường | Giá trị |
|---|---|
| Ngày lập | 25/11/2026 (UTC+7) |
| Vai trò soạn | Antigravity (hỗ trợ Claude Manager rà soát 4 Trang, kiến trúc `src/`, refactor & reuse) |
| Trạng thái | **PROPOSED — trình Claude Manager xem xét và duyệt kế hoạch trước khi sửa `src/`** |
| Nhánh gốc đối chiếu | `origin/feat/sprint-0412` @ `295604f` (và các PR chưa gộp: `N-01b` @ `85d7445`, `N-22a` @ `b09ff90`, `N-24` @ `5617d30`) |
| Nhánh bàn giao | `task/R-B0-tong-hop-refactor` |

---

## 0. Tình trạng 4 bản thoại hoàn thiện & nền code hiện tại (25/11/2026)

### 0.1 Bốn bản thoại Trang 1–4 đã đẩy lên remote (PROPOSED, chờ chủ dự án duyệt chữ)
| Trang | Nhánh git & Commit | File đầu ra | Điểm kỹ thuật & câu hỏi còn mở |
|---|---|---|---|
| **Trang 1** (`R-A1`) | `task/R-A1-thoai-trang1` (`bb4a136`) | `docs/handoff/gemini/R-A1/THOAI_TRANG1_v1.0.md` | 8 phân cảnh P1-1…P1-8; **1 câu `[HỎI CHỦ DỰ ÁN]`** (câu 7 P1-3 của Châu 13 từ, vượt 1 từ so với L5); **2 mục `[KIỂM NĂM]`** (*"hư cấu quá"*, *"Chốt!"*); đổi điểm xuất hiện `spawn.thcs.gate` |
| **Trang 2** (`R-A2`) | `content/R-A2-trang2-hoan-thien` (`739455a`) | `docs/handoff/gemini/R-A2_TRANG2_THOAI_v1.md` | 6 phân cảnh P2-1…P2-6; giờ ra chơi chiều + dùng **trống**; tách bước ảnh mới `P2-4` (chụp 5 thuyền ở mép rãnh) thay ảnh tự chụp cũ ở `s05`; 3 câu `[HỎI CHỦ DỰ ÁN]` đã có phương án A mặc định |
| **Trang 3** (`R-A3`) | `task/R-A3-thoai-trang3` (`74762dd`) | `docs/handoff/gemini/R-A3/THOAI_TRANG3_v1.0.md` | 8 phân cảnh P3-1…P3-8; chốt thứ tự **P3-5 (dọn/dựng `s04`) → P3-4 (trang trí `s03`)**; 0 câu hỏi mới, 0 ô Không; tên khu tạm *"Góc sân sau"* tới P3-5; ảnh chính `P3-7` đổi thành người chơi tự bấm chụp biển |
| **Trang 4** (`R-A4`) | `task/R-A4-thoai-trang4` (`b2bcedf`) | `docs/handoff/gemini/R-A4/THOAI_TRANG4_v1.0.md` | 8 phân cảnh P4-1…P4-8; đủ 3 bộ phản ứng `playful`/`gentle`/`deep` × 3 ô ở P4-5; 0 câu hỏi mới, 0 ô Không; ảnh 1 dời về **gốc phượng**, ảnh 2 cầu vồng đặt ở **khúc gỗ bãi đất** (khác góc Trang 8) |

### 0.2 Các nhánh code đã làm xong nhưng CHƯA gộp vào `feat/sprint-0412`
1. `task/N-24-doi-ten-game` (`5617d30`): Đổi tên game sang **"Vùng Ký Ức"**.
2. `task/N-01b-thoai-truoc-sau` (`85d7445`): Tách `intro_lines` (phát trước trò) và `lines` (phát sau trò) cho bước `minigame` + thêm `q_m1_main_01.s08` ở Trang 1. *(Giải quyết một phần R-B2, nhưng chưa xử lý được câu dẫn vừa đi vừa nói, `choice`/`photo` `intro_lines`, hay các bước đạo diễn NPC.)*
3. `task/N-22a-production-moc1` (`b09ff90`): Thêm `filterPackForRelease()` ở `src/content/pack.ts` và khai 4 Trang Mốc 1 vào khối `production` của `src/content/release.ts`.
4. `task/N-15a-trang5` (`17b9963`), `task/N-15c-trang7` (`4311070`): Đang mở nhánh Mốc 2, chưa PR.

### 0.3 Kiểm tra máy cục bộ tại thời điểm lập báo cáo (`origin/feat/sprint-0412` @ `295604f`)
- `npm run validate:world`: **ĐẠT** (`map_thcs: 6 khu, 0 lỗi, 0 nhắc`).
- `npm test` (`vitest run`): **30/33 file đạt (492 passed, 2 skipped)**; **2 file lỗi (`fx.test.ts`, `extras.test.ts`)** và `npx tsc --noEmit` lỗi thiếu module do máy cục bộ chưa chạy lại `npm install` sau khi `feat/sprint-0412` thêm `gsap`, `three.quarks`, `tweakpane`.

---

## 1. Tổng hợp toàn bộ việc còn thiếu trong game (Trang 1–4 + Toàn Repo), phân theo Mức độ

### Mức P0 — Chặn đưa 4 bản thoại hoàn thiện (`R-A1…R-A4`) vào game & Chặn bản Production
Nếu chỉ sửa chữ mà không bổ sung các phần P0 dưới đây, 4 bản thoại mới sẽ bị lệch 3D, kẹt mạch thoại hoặc thiếu thao tác cốt lõi.

| Mã | Hạng mục thiếu | Chi tiết kiểm chứng từ repo (`src/`) & 4 bản thoại | Phạm vi ảnh hưởng |
|---|---|---|---|
| **G0** | **Gộp 3 PR nền đang chờ (`N-24`, `N-01b`, `N-22a`)** | Đang nằm ở 3 nhánh riêng, chưa vào `feat/sprint-0412`. Khối `production` trên `feat/sprint-0412` hiện vẫn rỗng (`release.ts:17`). | Toàn dự án |
| **R-B1** | **Hệ thống đạo diễn NPC theo từng bước / nhịp thoại (`stage`)** | `dayScene.ts:149-160` chỉ spawn NPC **một lần lúc vào Ngày** từ `day.npc_placements` với `motion` đứng yên cố định. Chưa có cơ chế:<br>• Di chuyển NPC giữa các marker (`walk`/`run`), ví dụ Đức chạy nhặt vở (`P1-1`), Đức đi dẫn (`P1-2`, `P2-2`, `P3-2`), Đức chạy dẫn mưa (`P4-6`), Châu xuống cuối rãnh (`P2-5`), Quân/Hạ bước tới (`P2-6`, `P3-1`), 4 bạn đi vào đúng vị trí đã xếp ở `mg_lineup` (`P4-4`).<br>• Quay mặt (`face`), đổi `motion` đồng bộ theo ô thoại (`talk`, `pose_peace`, `pose_wave`, `pose_tada`, `cheer`).<br>• **NPC rời/vào cảnh (`setVisible`)**: Châu đi ra cửa rồi ẩn ở `P1-5` (`R-A1 E4`); gom nhóm từ 3 khu khác nhau ở `P4-1`.<br>• Dịch chuyển nhóm giữa 2 cảnh trong cùng 1 Ngày (P1-5 lớp học → P1-6 bậc thềm tiệm tạp hóa). | Trang 1, 2, 3, 4 |
| **R-B2** | **Hệ thống nối phân cảnh (`THẺ`, `ĐẨY-MÁY`, `DẪN`, `QUA-KHU` động)** | • **Thẻ chữ mở màn / chuyển thời gian (`THẺ` 2 dòng):** chưa có UI chuyên biệt; `q_m1_main_01.s05` đang dùng hộp thoại `narrator` thay thẻ (`P1-1`, `P1-6`, `P2-1`, `Mở Trang 3`, `P4-1`, `P4-8`).<br>• **Bảng gợi ý phím lần đầu (`P1-1`):** `GameUi.tsx:155-164` mới có dòng `.hud-keys` nhỏ cố định, chưa có thẻ 2 dòng tự tắt sau khi đi + bấm E.<br>• **Đẩy/lùi máy quay mượt (`ĐẨY-MÁY`):** `dayScene.ts:286` `lockCamera()` cắt khung cứng, chưa có tween ~0,8–1 s đẩy vào mặt bàn / cánh buồm / sổ luật / khung ngắm (`P1-3`, `P1-5`, `P2-3`, `P2-5`, `P2-6`, `P3-4`, `P3-6`, `P4-3`).<br>• **Câu dẫn không khóa di chuyển (`R-A3 ENGINE-1`):** khi NPC đi dẫn (`DẪN`), `playLines()` hiện tại khóa hoàn toàn điều khiển người chơi (`game.ts:166` `locked()`).<br>• **Tên khu đổi động (`R-A3 ENGINE-9`):** `base.ts:39` gán cứng `zone.thcs.base` = `"Căn cứ bí mật"`, làm lộ tên ở `P3-2…P3-4` trước khi Đức đặt tên ở `P3-5` (lẽ ra hiện *"Góc sân sau"*).<br>• **Thời tiết chuyển giữa bước (`R-A2 E6`, `R-A4 E3`):** `atmosphere.ts:86` chỉ đổi theo `step_activated`, và `game.ts:196` `lockWeatherCamera` khóa cứng camera cả bước `cutscene` nếu gắn `cutsceneMarker`. | Trang 1, 2, 3, 4 |
| **R-B3** | **Nâng cấp Chụp ảnh & Đạo cụ cầm tay (`runPhoto` + `build.ts`)** | • **Thoát khỏi hardcode `MULTI_SHOT` (`game.ts:70-74`):** đưa `shots`, `first_line`, `shot_prompts[]` (lời nhắc riêng từng lần bấm `R-A1 E6`), `prompt`, `hide_pose` (`R-A4 E4` ảnh cầu vồng không giục chạy/tạo dáng) vào kiểu `Step` `photo`.<br>• **Thoại chen lúc đếm ngược + thoại sau ảnh lọc theo `flag` (`R-A4 E1, E2`):** `runPhoto` (`game.ts:302-314`) chưa phát bong bóng thoại không chặn trong 10 giây đếm ngược cho 3 bộ `m1.group_photo_style` (`playful`/`gentle`/`deep`), và chưa phát `after_lines` sau ảnh.<br>• **Đạo cụ cầm tay động (`setActorProp`):** `build.ts:231-291` gắn prop cố định lúc spawn. Thiếu cơ chế cầm/trao: vở (`P1-1`), quả cầu (`P1-4`), thuyền giấy/xấp giấy/bút (`P2-2`, `P2-6`), sổ bìa xanh + bút đỏ (`P3-6`), biển tên (`P3-7`), **trao/nhận máy ảnh compact giữa Đức ↔ Player** (`P4-1`, `P4-6`) và hiện máy ảnh trên tay Player lúc chụp (`P1-8`, `P2-4`, `P3-7`).<br>• **Ảnh chính Trang 2 & Trang 3 từ `gameplay_photo`:** `d_g07_01.ts:178` và `d_g07_02.ts:180` đang dùng `auto_snapshot` (máy tự chụp), cần chuyển sang bước `photo` do người chơi bấm ở `P2-4` và `P3-7` (`R-A3 ENGINE-10`). | Trang 1, 2, 3, 4 |
| **R-B4** | **Phản ứng 3D tại chỗ & Đổi thứ tự dữ liệu Trang 3** | • **Đổi thứ tự Trang 3 (`d_g07_02.ts`):** hiện `s03 choice` đang chạy trước `s04 mg_base_build`, ngược với quyết định đã chốt (**P3-5 dọn/dựng trước → P3-4 trang trí sau**).<br>• **Cập nhật cảnh 3D ngay khi chọn/xong trò (`R-A3 ENGINE-3`, `R-A2 E9`):** `m1_base.ts` dựng sẵn cả đống khảo sát, bàn ghế và đồ trang trí cùng lúc từ đầu Ngày; cần bật/tắt theo tiến trình (khảo sát → bàn ghế sau `mg_base_build` → đồ trang trí `paper`/`flowers`/`photos` hiện ngay sau `choice`, kèm 1 câu phản ứng riêng theo lựa chọn). Tương tự, `m1_trang2.ts` cần tách 5 thuyền ở mép rãnh (`P2-4`) và **1 thuyền Hạ mắc ở cuối rãnh** (`P2-6`).<br>• **Phản ứng từng điểm `collect` (`P3-3`):** `questEngine.ts:244` chỉ đếm ngầm; cần hỗ trợ `lines_by_target` (✓ + tiếng ngắn + 1 câu thoại gắn điểm) và bộ đếm `0/3` trên HUD. | Trang 2, 3 |

### Mức P1 — Lệch bản đồ / Hình ảnh trùng lặp / Lỗi kỹ thuật & Nội dung Mốc 2 (trước 04–05/12)

| Mã | Hạng mục thiếu / lỗi | Chi tiết kiểm chứng | File liên quan |
|---|---|---|---|
| **MAP-1** | **Dời chỗ chụp Trang 4 & Gỡ trùng 2 cầu vồng** | • `itr.thcs.tripod_spot` (`[4, 0, 8.4]`) & `spot.thcs.yard_group` (`[4, 0, 2]`) đang ở **giữa sân**, lệch ~14 m so với thoại "gốc phượng" (`[-10.2, 0, -5]`).<br>• `cam.thcs.rainbow` đang dùng `yard_group` giữa sân, cần đặt ở **khúc gỗ bãi đất** (`spot.thcs.field_log`) quay ra trời trống (khác hướng Trang 8).<br>• **Có 2 cầu vồng chồng nhau:** `sky.ts:26` tạo `rainbowArc()` theo thời tiết `after_rain_rainbow`, đồng thời `m1_trang4.ts:24` lại dựng cứng `makeRainbow()` suốt cả Ngày Trang 4 (cả khi trời đang nắng!). | `src/world/maps/map_thcs.extras.ts`, `src/world/maps/map_thcs.index.json`, `src/world/dressing/sets/m1_trang4.ts`, `src/world/sky.ts` |
| **MAP-2** | **Thiếu marker bản đồ cho Trang 1, 2, 4** | Kiểm chứng đối chiếu `map_thcs.index.json` + `map_thcs.extras.ts`: thiếu `spot` cạnh `itr.thcs.class_list`, bàn học 3 người (`P1-3`), bụi cây sân đá cầu (`P1-4`); chỗ đứng chụp trước rãnh & cuối rãnh nước (`P2-4`, `P2-6`); chỗ đứng trước khúc gỗ, máy ảnh trên khúc gỗ và chỗ tường dán ảnh trong Căn cứ (`P4-7`, `P4-8`). | `src/world/maps/map_thcs.extras.ts` |
| **SFX-1** | **Âm thanh cơ bản còn trống** | `src/game/sfx.ts` hiện chỉ có 19 dòng (`playTransitionSound`). Thiếu tiếng vở rơi "bịch" (`P1-1`), trống trường (`P1-2`, `P1-4`, `P2-6`), màn trập máy ảnh, tiếng tick khảo sát (`P3-3`), tiếng mưa nhẹ. | `src/game/sfx.ts` |
| **BUG-1** | **Bẫy cache `loadProp` + `World.dispose()` (`N-23`)** | `src/render/assets.ts:45` trả `clone(true)` dùng chung `geometry`, trong khi `world.ts` `dispose()` giải phóng geometry → nạp prop GLB ở Ngày thứ 2 sẽ mất hình. Ngoài ra chưa có chuẩn hóa `Box3` `min.y = 0` khi nạp GLB. | `src/render/assets.ts`, `src/world/world.ts` |
| **BUG-2** | **Điều kiện Daily (`A-05`) & Lọt chuỗi `[PLACEHOLDER]` vào JS production** | • `questEngine.ts:61` `conditions.questCompleted` tra `records[id]` trong khi Daily lưu theo `<id>@<dayId>`.<br>• `NEXT_SPRINT_TASK_BOARD.md` §5.4: 33 chuỗi `[PLACEHOLDER]` của Side/Daily vẫn nằm trong gói JS `production` do khai chung mảng `quests` trong `days/*.ts`. | `src/systems/questEngine.ts`, `src/content/days/*.ts`, `src/content/pack.ts` |
| **M2-1** | **Các task Mốc 2 & Analytics/Playtest chưa xong** | `N-12` (người lớn & học sinh nền), `N-18` (phát `free_photo_taken`, `feedback_submitted`, `landing_view`, `cta_click`; bỏ `hub_opened` trước 05/12), `N-15b/d/e/f` (Trang 6, 8, 9), `N-16` (5 minigame Mốc 2), `N-17` (3 màn 2D Valentine), `N-13` (props Mốc 2), `N-19a` (chơi tay + đo FPS laptop thật). | `src/analytics/*`, `src/main.ts`, `src/content/days/d_g08_*`, `d_g09_*`, `src/game/minigames/games/*`, `src/ui/game/screens/*` |

### Mức P2 / Sau 15/12 — Hoạt ảnh nâng cao & Tính năng Tầng B (chưa chặn playtest)
- **Động tác mới trong `animate.ts`:** `sit` (ngồi ghế/hiên/bàn — `R-A1 E3`, `R-A2 E1`, `R-A3 ENGINE-5`), `pickup` (cúi đặt/vớt thuyền — `R-A2 E4`), `carry_box` (ôm thùng — `R-A3 ENGINE-4`), `hang_sign` (treo biển — `R-A3 ENGINE-8`).
- **Hiệu ứng chữ hiện dần trên cánh buồm (`R-A2 E5`)** & hiệu ứng chuyển cảnh riêng theo kỷ vật (`registerTransitionFx`).
- **Phím `C` (chụp ảnh tự do / cuộn phim)** hiện mới giữ chỗ ở `game.ts:905`.
- **Tầng B & Side thật:** P3-8 Bắn bi (`q_m1_ai_side_04`) + Khu Vui Chơi Căn cứ + Tầng B + `N-20` (credits/docs) + `N-21` (minh họa 2D).

---

## 2. Kiểm toán kiến trúc `src/` — Các điểm cần Refactor, Module hóa & Tăng Reuse

Khảo sát trực tiếp toàn bộ `src/` cho thấy kiến trúc cốt lõi tách khá tốt (`content` ↔ `systems` ↔ `world` ↔ `actors` ↔ `ui`), **nhưng ở tầng điều phối và tầng thực thi chi tiết đang tích tụ nợ kỹ thuật gây xung đột file và lặp code cao**:

### 2.1 Điểm nghẽn kiến trúc #1: `src/game/game.ts` phình to thành "God File" (1.019 dòng)
- Hàm `runGame()` (`game.ts:89–1017`, ~930 dòng lồng nhau) đang ôm cùng lúc **9 trách nhiệm**:
  1. Bootstrap & wiring (`SaveStore`, `PhotoStore`, `EventBus`, `Tracker`, `QuestEngine`, `AlbumModel`, `HubModel`, `ReleaseTracker`, `GameFlow`).
  2. Hàng đợi trình diễn (`epoch`, `wait/signal/CANCEL`, `enqueue`, `playLines`, `notice`, `presentStep`, `drain`).
  3. Toàn bộ vòng chụp ảnh nhiều lần, retry, IndexedDB URL cache và auto-snapshot (`runPhoto`, `MULTI_SHOT`, `SELFIE_AIM`, `photoUrl`, `photoUrls`).
  4. Khởi tạo `MinigameHost` + cầu nối `save.flags` (`presentStep` nhánh `minigame`).
  5. Chuyển cảnh & vòng đời scene (`fadeTo`, `teardown`, `goHub`, `goDay`, `hubSettle`, `presentPde`).
  6. Logic Hộp Kỷ Vật 3D (`boxItems`, `refreshBox`, `sayBox`, `boxPick`).
  7. Mapping dữ liệu UI (`boxView`, `albumView`, `phoneView`, `refreshPanels`, `refreshHud`).
  8. Input routing (`continueKey`, `onKey`, `onPointer`, `proximity`, `hubProximity`, `interact`, `actions`).
  9. `ActivePlaytime` heartbeat & `GameHandle` debug/e2e.
- **Hệ quả:** Mọi task engine (`N-02`, `N-14`, `N-01b`, `N-18`, và sắp tới `R-B1`, `R-B2`, `R-B3`) đều phải sửa `game.ts`, gây xung đột merge liên tục và không thể unit test riêng từng phần trình diễn (như `albumView`, `runPhoto`, `hubSettle`) mà không dựng cả WebGL/DOM.

### 2.2 Điểm nghẽn #2: Trùng lặp nặng trong 8+ file Minigame (`src/game/minigames/games/*.ts`)
Kiểm tra trực tiếp cả 8 minigame Mốc 1 (`mg_cipher`, `mg_footbag`, `mg_wipe_board`, `mg_noodle`, `mg_boat`, `mg_base_build`, `mg_rules`, `mg_lineup`):
- **Trùng PRNG (`Mulberry32` với hằng `0x6d2b79f5`) 4 lần giống y hệt từng dòng:** `mg_cipher.ts:20`, `mg_wipe_board.ts:69`, `mg_boat.ts:57`, `mg_rules.ts:26` (ngoài ra còn lặp LCG `16807` ở `texHelper.ts:37` và `hub/room.ts:115`).
- **Trùng boilerplate khởi tạo HiDPI `<canvas>` + tính `dpr` + `local(e: PointerEvent)` 6 lần:** `mg_footbag.ts`, `mg_wipe_board.ts`, `mg_noodle.ts`, `mg_boat.ts`, `mg_base_build.ts`, `mg_lineup.ts`.
- **Trùng vòng đời `paused / finished / pending / outro / raf / clearTimeout` 8 lần:** mỗi file tự quản lý lại bộ cờ tạm dừng, dễ lọt lỗi không đóng băng đồng hồ khi bấm Esc nếu thêm tiếp 5 minigame Mốc 2 (`N-16`).

### 2.3 Điểm nghẽn #3: Lặp helper & Tọa độ cứng trong `src/world/props/` và `src/world/dressing/sets/`
- **Tọa độ cứng trong `dressing/sets/`:** `m1_common.ts`, `m1_base.ts`, `m1_trang2.ts`, `m1_trang4.ts` đều viết cứng tọa độ `(x, y, z)` lấy bằng tay từ comment (ví dụ `m1_trang4.ts:18` đặt máy ảnh cứng ở `[4, 0.43, 8.4]`). Khi dời `itr.thcs.tripod_spot` về gốc phượng theo quyết định `R-A4`, máy ảnh trong `m1_trang4.ts` sẽ đứng sai chỗ nếu không đọc qua `world.marker(...)`.
- **Trùng helper căn đáy & bóng đổ:** `new THREE.Box3().setFromObject(...)` để đẩy `min.y = 0` lặp lại thủ công ở `handProps.ts`, `surveySpots.ts`, `baseDecor.ts`, `rainbow.ts`; hàm `shadowed()` cũng khai cục bộ ở `hubScene.ts:119`.
- **Trùng tài sản 3D:**
  - `makeRuleBook()` (`props/m1/ruleBook.ts`) vs `makeRulebook()` (`props/hub/room.ts:123`) — cùng một cuốn sổ luật Căn cứ nhưng dựng ở 2 nơi bằng 2 hàm khác nhau.
  - `rainbowArc()` (`world/sky.ts:26`) vs `makeRainbow()` (`props/m1/rainbow.ts:13`) — gây trùng 2 cầu vồng ở Trang 4.
  - `hubScene.ts:67-94` tự vẽ lại hình khối thô cho `boat`, `paper`, `sign`, `photo`, trong khi `props/m1/` đã có sẵn `createPaperBoatGeometry()`, `makeBaseSign()`, `makeRuleBook()`, `makeCompactCamera()`.

### 2.4 Điểm nghẽn #4: `src/ui/game/GameUi.tsx` (308 dòng) & `src/actors/character/build.ts` (411 dòng)
- `GameUi.tsx` gom 5 panel (`Profile`, `Box`, `Album`, `Phone`, `Journal/Menu`) + 6 lớp phủ (`HUD`, `Dialogue`, `Choice`, `Photo`, `Notice`, `EndPrompt/DayEnd/Consent/Feedback`) vào một file duy nhất.
- `build.ts` gộp chung hình học cache, 6 kiểu tóc, dựng thân và `switch` prop cố định lúc tạo nhân vật — khó mở rộng để hỗ trợ cầm/trao prop động (`R-B3`) hoặc thêm nhân vật `N-12` (cô Diệp, bác bảo vệ, chú tạp hóa, Tú).

---

## 3. Kế hoạch Refactor, Module hóa & Bổ sung đề xuất (Chờ Claude Manager duyệt)

> **Nguyên tắc thực hiện:** Tách nhỏ theo phase, mỗi phase giữ nguyên toàn bộ chữ chạy và hợp đồng test (`vitest`, `validate:world`, `tsc`, `playwright` `data-testid`/`data-act`), không làm gãy các nhánh `N-01b`, `N-22a`, `N-24`, `N-15*`.

### Giai đoạn 0 — Đồng bộ nền & Chốt quyết định nhỏ (Claude Manager + Chủ dự án)
1. **Gộp PR nền:** `N-24` → `N-01b` → `N-22a` vào `feat/sprint-0412` (chạy `npm install` đồng bộ môi trường).
2. **Chốt với chủ dự án:**
   - 1 câu hỏi của `R-A1` (P1-3 câu Châu 13 từ: giữ nguyên văn hay rút còn 12 từ).
   - 2 mục `[KIỂM NĂM]` của `R-A1` (*"hư cấu quá"*, *"Chốt!"*).
   - Thứ tự ưu tiên trước 04/12: chốt rõ việc đẩy **4 Trang hoàn thiện (`R-A1..R-A4` + `R-B1..R-B4`)** song song hay tuần tự với **Mốc 2 (`N-15..N-17`)**.

### Giai đoạn 1 — Refactor & Module hóa tăng Reuse (KHÔNG đổi hành vi game)
Chia thành 4 gói nhỏ, chạy độc lập và kiểm xanh 4 lệnh sau mỗi gói:

| Gói | Mục tiêu | Cấu trúc module mới / thay đổi | Lợi ích trực tiếp |
|---|---|---|---|
| **RF-1** | **Chuẩn hóa tiện ích Minigame & RNG** | • `src/core/random.ts`: `createRng(seed)`, `shuffle(list, rng)`<br>• `src/game/minigames/shared/canvasStage.ts`: `createHiDpiCanvas()`, `toLocalPoint()`, màu/font chuẩn<br>• `src/game/minigames/shared/loopLifecycle.ts`: `createMinigameLoop()` quản lý `raf`, `pause/resume` đóng băng đồng hồ, `pendingFinish`, `dispose()`<br>• Gọn lại 8 file `mg_*.ts` hiện có | Giảm ~250–300 dòng trùng lặp; chuẩn hóa hành vi Esc dừng đồng hồ cho cả 8 trò cũ lẫn 5 trò Mốc 2 (`N-16`) |
| **RF-2** | **Chuẩn hóa Prop Helpers, Gắn theo Marker & Vá `loadProp`** | • `src/world/props/common/helpers.ts`: `groundAtZero(obj)`, `enableShadows(obj)`<br>• `src/world/dressing/place.ts`: `placeAtMarker(obj, world, kind, id, opts)` để **bỏ tọa độ cứng** trong `m1_*.ts`<br>• Gộp 1 cầu vồng duy nhất trong `sky.ts` / `atmosphere.ts` (gỡ cầu vồng trùng ở `m1_trang4.ts`)<br>• Chia sẻ prop giữa `m1/` và `hub/` (thống nhất `RuleBook`, tái dùng geometry thuyền/máy ảnh ở `hubScene.ts`)<br>• Vá `loadProp()` + `World.dispose()` (`N-23`) + chuẩn hóa `min.y = 0` khi nạp GLB | Dời marker `itr.thcs.tripod_spot` / `field_log` ở `map_thcs.extras.ts` là prop tự đi theo; sửa dứt điểm lỗi 2 cầu vồng & bẫy mất GLB |
| **RF-3** | **Tách `src/game/game.ts` (1.019 dòng) & `GameUi.tsx` (308 dòng)** | • `src/game/runtime/presentationQueue.ts` (`epoch`, `wait/signal`, `playLines`, `notice`)<br>• `src/game/runtime/photoRunner.ts` (`runPhoto`, `photoUrl` cache, auto-snapshot)<br>• `src/game/runtime/minigameRunner.ts` (bọc `MinigameHost` + flags)<br>• `src/game/runtime/hubController.ts` (`hubSettle`, `boxItems`, `boxPick`, `phone*`, `album*`)<br>• `src/game/runtime/dayController.ts` (`proximity`, `interact`, `goDay`)<br>• `src/game/runtime/uiAdapters.ts` (thuần hàm `boxView/albumView/phoneView`)<br>• `src/game/game.ts` chỉ còn ~150 dòng composition root<br>• Tách `src/ui/game/panels/*` & `src/ui/game/overlays/*` khỏi `GameUi.tsx` | **Triệt tiêu xung đột file** khi nhiều agent cùng làm `R-B1`, `R-B2`, `R-B3`, `R-B4`, `N-18`; tách logic thuần ra dễ viết unit test |
| **RF-4** | **Tách `build.ts` & Bảo vệ Bundle Production** | • Tách `src/actors/character/build.ts` → `geometry.ts`, `hair.ts`, `props.ts` (chuẩn bị slot gắn/gỡ prop động cho `R-B3` và preset `N-12`)<br>• Sửa `questEngine.ts:61` (`questCompleted` hỗ trợ key Daily `A-05`)<br>• Tách `sideQuests` / `dailyPool` trong `d_*.ts` để `production` tree-shake sạch 33 chuỗi `[PLACEHOLDER]` | Sẵn sàng cho `R-B3` + `N-12` + bản Production sạch tuyệt đối |

### Giai đoạn 2 — Bổ sung Engine & World cho 4 Trang hoàn thiện (`R-B1` → `R-B4` + `R-D`)
Sau khi **RF-1…RF-4** đã tách ranh giới module rõ ràng, các task R-B làm song song sạch sẽ:

1. **R-D (Bản đồ & Hợp đồng Dữ liệu — làm trước để mở khóa):**
   - Cập nhật `src/world/maps/map_thcs.extras.ts`: thêm marker thiếu của Trang 1, 2, 4; dời `itr.thcs.tripod_spot` + `spot.thcs.yard_group` về gốc phượng; chuyển `cam.thcs.rainbow` + `stand_zone` ảnh 2 sang `spot.thcs.field_log` (khác góc Trang 8).
   - Mở rộng `src/content/types.ts` + `src/content/validate.ts`: thêm `title_card`, `stage` (danh sách cue `StageCue`), `ChoiceOption.lines`, `collect.lines_by_target`, `photo.{shots, first_line, shot_prompts, prompt, hide_pose, countdown_lines, after_lines}`, `zone_name_overrides` theo flag/step.

2. **R-B1 (`src/game/runtime/stageRunner.ts` + `dayScene.ts`):**
   - Hỗ trợ di chuyển NPC (`walk`/`run` tới marker với vận tốc tự nhiên, không xuyên tường đơn giản hoặc đi theo waypoint nội bộ), quay hướng (`face`), đổi `motion`, `setVisible` (Châu rời cảnh `P1-5`), dịch chuyển cụm giữa cảnh (P1-5 → P1-6).

3. **R-B2 (`TitleCardOverlay`, `KeyHintCard`, `CameraManager.dollyTo`, `zone_name_overrides`, `atmosphere`):**
   - Thêm màn `THẺ` (2 dòng, bấm/tự qua), thẻ gợi ý phím lần đầu (`P1-1`), câu dẫn `DẪN` dạng bong bóng không khóa người chơi, `CameraManager.dollyTo()` tween mượt cho `ĐẨY-MÁY`, `zone_name_overrides` (`"Góc sân sau"` → `"Căn cứ bí mật"` ở P3-5), tách thời tiết `cutscene` không khóa cứng camera.

4. **R-B3 (`photoRunner.ts` + `PhotoOverlay.tsx` + `actors/character/props.ts`):**
   - Đọc `shots`, `first_line`, `shot_prompts`, `hide_pose`, `prompt`, `countdown_lines`, `after_lines` từ `Step` (xóa `MULTI_SHOT`/`SELFIE_AIM` viết cứng).
   - Bổ sung `setActorProp(actor, propId)` cho vở, quả cầu, thuyền, giấy, bút đỏ, sổ luật, biển tên, máy ảnh compact.

5. **R-B4 (`dressing/sets/m1_*.ts` + `dayController.ts` + `sfx.ts`):**
   - Phản ứng `step_completed` / `choice_made` / `collect` (`lines_by_target` + đếm `0/3` + âm thanh `sfx.ts` cơ bản: tiếng vở rơi, trống trường, màn trập, tick).
   - Trang 3 (`m1_base.ts`): chuyển trạng thái 3 điểm khảo sát → bàn ghế → hiện ngay đồ trang trí `Giấy màu` / `Hoa` / `Ảnh`.
   - Trang 2 (`m1_trang2.ts`): tách trạng thái 5 thuyền ở mép rãnh (`P2-4`) → 1 thuyền Hạ ướt mắc ở cuối rãnh (`P2-6`).

6. **R-D1…D4 (Đổ dữ liệu 4 Trang hoàn thiện `R-A1…R-A4`):**
   - Sau khi chủ dự án nói *"duyệt Trang 1/2/3/4"*, đổ toàn bộ chữ từ `THOAI_TRANG1_v1.0.md`, `R-A2_TRANG2_THOAI_v1.md`, `THOAI_TRANG3_v1.0.md`, `THOAI_TRANG4_v1.0.md` vào `d_g06_01.ts`…`d_g07_03.ts` (đổi thứ tự `s04` trước `s03` ở `d_g07_02.ts`, chuyển ảnh chính Trang 2 & 3 sang `gameplay_photo`, gắn `stage` & `title_card`).

### Giai đoạn 3 — Hoàn tất Mốc 2 & Kiểm nghiệm Production
- **N-12** (dùng `actors/character/props.ts` mới), **N-18** (chỉ chạm `analytics/*` và `main.ts`), **N-15a…f**, **N-16** (tái dùng `minigames/shared/`), **N-17**, **N-13**, **N-19** (Playwright `--workers=1` + đo FPS laptop thật), **N-22** (Production).

---

## 4. Điểm cần Claude Manager xem xét & duyệt trước khi triển khai

1. **Duyệt thứ tự Refactor (RF-1…RF-4) trước R-B1…R-B4:**
   - **Phương án A (đề xuất):** Chạy RF-1, RF-2, RF-3 trước (tách `game.ts`, `GameUi.tsx`, gom helper `minigames/shared/` & `props/common/`) rồi mới chia song song `R-B1…R-B4` và `N-16`. Lợi ích: 0 xung đột file khi nhiều agent làm cùng lúc, code sạch và tái sử dụng ngay cho 5 minigame Mốc 2.
   - **Phương án B:** Không tách `game.ts` trước, viết thẳng `R-B1…R-B4` vào `game.ts` rồi refactor sau kỳ đo 05–15/12. Rủi ro: `game.ts` vượt 1.500+ dòng, các nhánh `R-B*` xung đột liên tục khi merge.
2. **Duyệt phạm vi gom cầu vồng & sửa tọa độ Trang 4 (`MAP-1` + `RF-2`):**
   - Xóa `makeRainbow` tĩnh trong `m1_trang4.ts` để chỉ giữ 1 nguồn cầu vồng duy nhất theo preset `after_rain_rainbow` trong `sky.ts`/`atmosphere.ts`, điều chỉnh vị trí/góc cho khớp camera mới ở `spot.thcs.field_log`.
3. **Phân công cụ thể cho lượt tiếp theo:**
   - Nếu Claude Manager duyệt Phương án A, Antigravity có thể nhận trước **RF-1** (chuẩn hóa `minigames/shared/` + `core/random.ts`) và **RF-2** (chuẩn hóa `props/common/` + gắn theo marker + vá `loadProp`), giữ `game.ts` nguyên vẹn cho tới khi các PR đang mở (`N-24`, `N-01b`, `N-22a`) gộp xong rồi mới tách **RF-3**.
