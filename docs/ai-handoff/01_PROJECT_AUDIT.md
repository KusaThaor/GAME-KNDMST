# 01_PROJECT_AUDIT — audit cuối (Fable, 16/11/2026)

Phạm vi: `feature/s2-world-camera-blender` @ `b69058e`. Ba nhánh còn lại chỉ xem cấu trúc (`00_REPO_MAP.md`).
Cách kiểm ghi ở từng mục: `CODE_INSPECTION` = đọc code; `TESTED` = Fable tự chạy trong phiên này; `RUNTIME_OBSERVED` = không có mục nào (không mở game trên trình duyệt).

Fable đã chạy: `npm ci` · `npx tsc --noEmit` đạt · `npm test` 253 đạt, 1 bỏ qua · `npm run validate:world` 0 lỗi · hai test tạm cho A-02, A-05 (đã xóa, không để lại trong repo).
Fable **không chạy**: Playwright, build production, Blender, Firestore Emulator.

## 1. Trạng thái theo hệ thống
| Hệ thống | Trạng thái | File | Phát hiện |
|---|---|---|---|
| Kiến trúc, quản lý cảnh | WORKING | `src/game/game.ts`, `src/systems/gameFlow.ts`, `src/game/scenes/*` | A-13 |
| Di chuyển, camera | PARTIAL | `src/actors/player/controller.ts`, `src/actors/camera/cameraManager.ts`, `src/game/input.ts` | A-04, A-14 |
| Tương tác, thoại | PARTIAL | `game.ts` (`proximity`, `interact`, `playLines`), `src/systems/dialogue.ts` | A-01, A-06 |
| Quest, chương | WORKING (có bẫy) | `src/systems/questEngine.ts`, `src/content/*` | A-02, A-05, A-11, A-15 |
| Timeline, chuyển ký ức | PARTIAL | `src/systems/hub.ts`, `game.ts` (`goDay`, `goHub`, `fadeTo`), `src/content/base.ts` | A-08, A-13 |
| Lưu/nạp, trạng thái | WORKING | `src/core/save.ts` | A-09 |
| Nhân vật, asset | PARTIAL | `src/actors/character/*`, `src/actors/player/avatar.ts`, `src/render/assets.ts` | A-08, A-10 |
| Nội dung, phát hành | MISSING | `src/content/days/*`, `src/content/release.ts` | A-03 |

## 2. Phát hiện

**[A-01] Bước `goto` không hoàn thành khi người chơi đã đứng sẵn trong bán kính đích**
- System: Tương tác / Quest
- Status: BROKEN (trường hợp biên)
- Priority: P1
- Evidence: `src/game/game.ts` · `proximity()` dòng 457–468 (dòng 462: chỉ gọi `engine.trigger('arrive')` ở khung hình **đầu tiên** vào bán kính, và chỉ khi `!locked()`; sau đó `inside` giữ ID tới khi đi ra). `inside` chỉ được xóa ở `cancelAll()` dòng 128.
- Verification: CODE_INSPECTION (chưa tái hiện trên trình duyệt)
- Issue: nếu bước `goto` được kích hoạt khi người chơi đã ở trong vòng, hoặc người chơi vào vòng lúc giao diện đang khóa, `arrive` không bao giờ phát cho tới khi đi ra rồi quay lại.
- Impact: người chơi tưởng game treo. Nội dung giả chưa dính vì các đích ở xa nhau; quest thật kiểu "nói chuyện rồi đi tới chỗ bên cạnh" sẽ dính.
- Next Action for Claude: T-01 phần 1 (`04_NEXT_TASK_FOR_CLAUDE.md`).

**[A-02] Side/Daily có bước đầu không phải hành động trong thế giới thì không bao giờ bắt đầu**
- System: Quest
- Status: BROKEN (bẫy khi viết nội dung)
- Priority: P1
- Evidence: `src/systems/questEngine.ts` · `trigger()` dòng 196–200 (Side/Daily `available` chỉ bắt đầu khi bước đầu khớp trigger), `matchesWith()` dòng 231–239 (chỉ `goto|interact|place|talk|collect`), `endDay()` dòng 380 (chuyển thành `missed`). `src/content/validate.ts` dòng 129–167 không có luật kiểm bước đầu.
- Verification: TESTED (test tạm: Side mở đầu bằng `cutscene` → validator 0 lỗi, quest không thành `active` với mọi trigger, cuối Ngày `missed`)
- Issue: validator không báo, quest lặng lẽ mất.
- Impact: người viết nội dung mất quest mà không biết vì sao.
- Next Action for Claude: T-01 phần 2 (thêm luật validator; không sửa engine).

**[A-03] Chưa có nội dung thật; bản production trống**
- System: Nội dung / phát hành
- Status: MISSING
- Priority: P1 (với mốc kỳ đo 05–15/12)
- Evidence: `src/content/release.ts` dòng 13 (`production: { memory_day_ids: [], end_day_id: null }`); `src/content/days/d_g06_01.ts`, `d_g07_03.ts`, `src/content/hub.ts` đều `[PLACEHOLDER]` + `AI_PROPOSED`; `src/content/validate.ts` dòng 273 chặn nội dung giả ở production; `src/content/cast.ts` (`ACTIVE_CAST` tạm, D-01).
- Verification: CODE_INSPECTION
- Issue: chỉ có 2 Ngày giả; D-01, D-03, D-04 chưa chốt.
- Impact: không thể mở bản public cho tới khi nhóm giao nội dung `HUMAN_CANON` và chốt D-03.
- Next Action for Claude: không tự viết. Nhắc chủ dự án ở mỗi báo cáo; khi có nội dung duyệt thì làm theo `02_QUEST_SYSTEM.md` §5.

**[A-04] S2 chưa gộp vào `dev`; thiếu ca e2e 1–3, 6–10; chưa có Pull Request**
- System: Di chuyển / camera / tích hợp
- Status: PARTIAL
- Priority: P1
- Evidence: `tests/e2e/world.spec.ts` chỉ có các ca 4, 4b, 5, 11a–c, 12, 12b, H1–H7; `docs/DEV_SESSION_HANDOFF.md` mục "S2 — tiến độ"; `docs/S2_EXECUTION_BLUEPRINT.md` §6–§7.
- Verification: CODE_INSPECTION (danh sách test); số Playwright 28 đạt là của phiên trước, Fable không chạy lại
- Issue: va chạm tường, đổi khu, khu đóng, camera tránh vật, rò listener, tải lại trang giữa khu mới kiểm ở mức đơn vị.
- Impact: `dev` vẫn dùng "góc sân" và điều khiển tạm; mọi việc quest mới phải làm trên nhánh S2.
- Next Action for Claude: T-02 = phiên 2c theo `docs/PROMPT_CHANG_2.md`, rồi mở PR chờ duyệt.

**[A-05] Điều kiện `{ quest: <id Daily> }` không bao giờ đúng**
- System: Quest / điều kiện
- Status: BROKEN
- Priority: P2
- Evidence: `src/systems/questEngine.ts` · `key()` dòng 43 (Daily lưu bằng `<id>@<id Ngày>`), `conditions.questCompleted` dòng 61 (tra bằng `<id>` trần).
- Verification: TESTED (test tạm: Daily `completed`, bản lưu có `q_m1_daily_01@d.g06.01`, `questCompleted('q_m1_daily_01')` = false)
- Issue: `available_when`, `when` của dòng thoại, `trigger` của PDE không dùng được với Daily.
- Impact: nhỏ lúc này (Album nhận Daily qua event `quest_completed`, vẫn chạy).
- Next Action for Claude: T-03. Tới lúc đó: không viết điều kiện theo Daily; dùng `rewards.flags` của Daily rồi điều kiện theo flag.

**[A-06] NPC và điểm tương tác cố định suốt một Ngày**
- System: Tương tác / cảnh
- Status: MISSING
- Priority: P2
- Evidence: `src/game/scenes/dayScene.ts` · `buildDayScene()` dòng 133–160 (dựng NPC và đích **một lần** từ `bindDay`); `src/content/types.ts` `NpcPlacement` dòng 129 (mỗi vai một chỗ đứng, `motion` cố định).
- Verification: CODE_INSPECTION
- Issue: không có cách cho NPC xuất hiện/biến mất/đổi chỗ/đi theo bước quest; không bật/tắt vật theo flag.
- Impact: quest kiểu "bạn chạy ra sân chờ", "lớp 6 mới quen 2 bạn rồi gặp thêm" phải tách thành Ngày khác hoặc chấp nhận NPC đứng yên.
- Next Action for Claude: chỉ làm khi nội dung duyệt cần. Hướng nhẹ: thêm `when?: Condition` cho `NpcPlacement`/`Interactable` và đánh giá lại khi nghe `step_completed`.

**[A-07] Trường nội dung đã khai nhưng chưa có phần chạy**
- System: Quest / UI
- Status: MISSING
- Priority: P2
- Evidence: không có nơi đọc ngoài `types.ts`/validator: `MemoryDay.time_phases`, `Artifact.transition_fx`, `Artifact.present_interaction`, `Artifact.target_step_id`, `Step.hint` (`validate.ts` dòng 63), `Quest.rewards.fragment_ids` (`validate.ts` dòng 140), `Quest.analytics_custom`, `collect.item`/`place.item`; `ContentPack.endings` rỗng (`src/content/pack.ts` dòng 22). Minigame là thẻ giả: `src/ui/game/GameUi.tsx` dòng 212–215. Event `step_progress` (`questEngine.ts` dòng 248) không có nơi hiện trên HUD. Phím C: `game.ts` dòng 680.
- Verification: CODE_INSPECTION (grep toàn `src/`)
- Issue: viết các trường này vào nội dung thì không có gì xảy ra.
- Impact: người viết tưởng tính năng đã có.
- Next Action for Claude: T-03 làm phần nhỏ (`hint`, số đếm `collect`). Phần còn lại chờ GDD chốt.

**[A-08] Mốc 2–3 chưa có biến thể, độ tuổi, bản đồ**
- System: Timeline / nhân vật
- Status: MISSING
- Priority: P2
- Evidence: `src/content/base.ts` `MAPS[0].variants` chỉ có `g06`, `g07`; `src/world/variants.ts` `DECOR_SETS`/`LIGHTING_PRESETS` tương ứng; `dayScene.ts` dòng 83 `GRADE_FOR_VARIANT` thiếu `AGE_G10_12` (rơi về lớp 6); `base.ts` `CHARACTERS` chỉ có `AGE_G6_7`; `src/world/maps/` chỉ có `map_thcs`.
- Verification: CODE_INSPECTION
- Issue: Ngày lớp 8–9 cần thêm biến thể (validator sẽ báo `missing_ref` nếu quên); lớp 10–12 cần bản đồ mới qua pipeline Blender và bộ nhân vật theo tuổi.
- Impact: chưa cản Mốc 1.
- Next Action for Claude: không làm trước khi xong lát cắt Mốc 1.

**[A-09] Bản lưu: không có bước chuyển đổi; ghi lỗi thì im lặng**
- System: Lưu/nạp
- Status: PARTIAL
- Priority: P2
- Evidence: `src/core/save.ts` · `SaveStore.load()` dòng 117 (khác `SAVE_VERSION` → xóa), `persist()` dòng 125–127 (trả `false`, không ai báo người chơi); `questEngine.ts` `resume()` dòng 133 (tiến độ `collect` về 0 khi tải lại trang).
- Verification: CODE_INSPECTION
- Issue: tăng `SAVE_VERSION` trong kỳ đo sẽ xóa tiến trình người chơi.
- Impact: sai lệch số liệu hoàn thành nếu xảy ra giữa kỳ 05–15/12.
- Next Action for Claude: không tăng `SAVE_VERSION` nếu chưa viết bước chuyển đổi; thêm trường mới theo kiểu tùy chọn (đã có cơ chế điền mặc định ở dòng 119–120).

**[A-10] Nhân vật dựng bằng code; asset của Antigravity chưa nối**
- System: Nhân vật / asset
- Status: MISSING
- Priority: P2
- Evidence: `dayScene.ts` gọi `rigAvatar(buildCharacter(...))`; `src/actors/player/avatar.ts` dòng 20 (`rigAvatar` là adapter duy nhất); `src/render/assets.ts` `loadProp()` chỉ cho đạo cụ GLB tĩnh. Nhánh `feature/asset-workshop` có `src/actors/character/CharacterRuntimeController.ts`, `public/assets/characters/*.glb` — Fable **chưa đọc**.
- Verification: CODE_INSPECTION; phần asset-workshop UNVERIFIED
- Issue: chưa có adapter cho model có xương; 14 file `src/` cùng tồn tại ở hai nhánh (`00_REPO_MAP.md` §4), chưa kiểm xung đột.
- Impact: không cản quest (quest chỉ dùng vai `NPC_A…D`).
- Next Action for Claude: khi được giao: viết adapter mới cùng giao diện `Avatar`, không sửa controller/camera; không sửa nhánh asset-workshop.

**[A-11] Tiến trình Hub tuyến tính theo `release.ts`; mỗi Ngày đúng một kỷ vật**
- System: Chương / timeline
- Status: WORKING (giới hạn thiết kế)
- Priority: P2
- Evidence: `src/systems/hub.ts` · `refresh()` dòng 51–62 (chỉ kỷ vật của Ngày chưa xong **đầu tiên** được `glowing`), `compartmentOpen()` dòng 42–48; `validate.ts` dòng 198 (`day_artifact_count`).
- Verification: CODE_INSPECTION
- Issue: không chọn được thứ tự Ngày; "chương" chỉ là nhãn (`src/content/chapters.ts`, D-04).
- Impact: đủ cho bản thử; nếu GDD muốn mở song song nhiều Ngày thì phải sửa `refresh()`.
- Next Action for Claude: không đổi khi chưa có quyết định D-04.

**[A-12] Tài liệu lệch code**
- System: Tài liệu
- Status: PARTIAL
- Priority: P3
- Evidence: `README.md` dòng 22 ("Giữ chuột phải + kéo") và dòng 29 ("thuộc việc S2… điều khiển tạm") đã cũ; `src/content/types.ts` dòng 127 nhắc `docs/S2_WORLD_ARCHITECTURE.md` (chưa có); project instructions nhắc `00_DEV_README.md` (không có trong repo).
- Verification: CODE_INSPECTION
- Issue/Impact: người mới đọc README sẽ hiểu sai cách điều khiển.
- Next Action for Claude: sửa trong T-02 (Chặng 3 của blueprint đã có việc sửa README).

**[A-13] Chuyển cảnh ký ức mới có mờ dần + âm thanh**
- System: Timeline / chuyển cảnh
- Status: PARTIAL
- Priority: P2
- Evidence: `game.ts` · `fadeTo()` dòng 325–329, `registerTransitionFx()` dòng 38–40 (không có nơi nào gọi).
- Verification: CODE_INSPECTION
- Issue: chưa có hiệu ứng riêng cho từng kỷ vật.
- Impact: thẩm mỹ, không cản quest.
- Next Action for Claude: khi làm, đăng ký hook; không sửa `goDay`/`goHub`.

**[A-14] Chưa xác minh trên thiết bị và dịch vụ thật**
- System: Chung
- Status: UNVERIFIED
- Priority: P1 trước kỳ đo
- Evidence: `docs/S2_TEST_REPORT.md` mục "CHƯA KIỂM"; `docs/DEV_SESSION_HANDOFF.md`.
- Verification: —
- Issue: touchpad thật (Windows + Cốc Cốc), điện thoại thật, Edge, FPS trên GPU thật, Firestore thật, bản preview Vercel (cần đăng nhập), `blender.exe` trên Windows.
- Impact: rủi ro lộ lỗi lúc người thật chơi.
- Next Action for Claude: không tự kiểm được; nhắc chủ dự án làm theo `docs/TOUCHPAD_CHECK_GUIDE.md`.

**[A-15] Bước quest chạy thẳng một mạch, không rẽ nhánh/bỏ qua bước**
- System: Quest
- Status: WORKING (giới hạn thiết kế)
- Priority: P2
- Evidence: `questEngine.ts` · `finishStep()` dòng 320–326 (`q.steps[indexOf(s) + 1]`).
- Verification: CODE_INSPECTION
- Issue: khác biệt theo lựa chọn chỉ làm được bằng flag + dòng thoại `when/fallback` + `available_when` của quest khác.
- Impact: đủ cho game cozy không có thất bại; nội dung cần rẽ nhánh thật thì phải mở rộng.
- Next Action for Claude: nếu cần, thêm `when?: Condition` cho `StepBase` (bước không đạt điều kiện thì bỏ qua trong `finishStep`/`startQuest`), kèm test.

## 3. Ưu tiên
| Thứ tự | Việc | Phát hiện |
|---|---|---|
| 1 | T-01 lưới an toàn quest | A-01, A-02 |
| 2 | T-02 phiên 2c + PR vào `dev` | A-04, A-12 |
| 3 | T-03 điều kiện Daily, `hint`, đếm `collect` | A-05, A-07 |
| 4 | Nội dung thật khi được duyệt | A-03 |
| 5 | Theo nhu cầu nội dung | A-06, A-15, A-08, A-10, A-13 |
| Song song (chủ dự án) | Thử máy thật, chốt D-01/D-03/D-04 | A-14, A-03 |
