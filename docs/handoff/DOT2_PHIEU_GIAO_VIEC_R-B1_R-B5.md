# ĐỢT 2 — PHIẾU GIAO VIỆC R-B1…R-B5 (Engine & Minigame, chạy song song)

Ngày: 25/11/2026 · Người giao: Claude Manager · Nguồn chân lý chữ: `docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md` (chốt 100%)
+ `docs/handoff/SO_HOA_NARRATIVE_TA_CANH_MOC1.md` (kênh hiển thị). Kế hoạch gốc: `docs/handoff/TONG_HOP_4_TRANG_VA_KE_HOACH_REFACTOR.md`.

## 0. Nền đã có (Đợt 1, trên `feat/sprint-0412`)
- **Hợp đồng dữ liệu (R-D0)** — `src/content/types.ts`: `title_card`, `narrative {before, after}` (kênh `narrator` / `world_event`),
  `stage: StageCue[]` (`move/teleport/face/motion/visible/prop/camera/weather/sfx`, `at: 'start' | 'end' | {line}`),
  `ChoiceOption.lines`, `collect.lines_by_target` + `show_counter`, `photo.{first_line, shot_prompts, prompt, hide_pose, countdown_lines, after_lines}`,
  `MemoryDay.zone_name_overrides`, mã trò `mg_fold_boat`. `validate.ts` kiểm hết các trường này.
- **Marker Trang 1–4 (R-D0)** — `M1_MARKERS` trong `src/world/maps/map_thcs.extras.ts` (gốc phượng, khúc gỗ cầu vồng, bàn 3 người, cuối rãnh, tường ảnh…).
- **Điểm nối (R-B0w)** — `src/game/runtime/stepHooks.ts`: mỗi nhánh viết một `StepHookPart` trong FILE CỦA MÌNH rồi thêm **đúng một dòng**
  `stepHooks.register(...)` dưới khối `const stepHooks = createStepHooks();` trong `src/game/game.ts`. Thứ tự một bước:
  `before → stage('start') → [stage({line:i}) → dòng i]… → stage('end') → after → complete`.
- **R-P1**: Form phản hồi khi bấm Thoát (không đụng lại trong Đợt 2).

## 1. Ranh giới file (KHÔNG sửa file của nhánh khác)
| Nhánh | Được sửa / tạo | File chung — CHỈ ĐƯỢC THÊM |
|---|---|---|
| `task/R-B1-dao-dien-npc` | MỚI `src/game/runtime/stageRunner.ts`; `src/game/scenes/dayScene.ts`; `src/actors/character/animate.ts` (thêm motion) | `game.ts` (1 dòng register) |
| `task/R-B2-chuyen-canh-ui` | MỚI `src/ui/game/overlays/TitleCardOverlay.tsx`, `NarratorBanner.tsx`, `KeyHintCard.tsx`, MỚI `src/game/runtime/narrativeRunner.ts`, MỚI `src/game/runtime/zoneNames.ts`; `src/actors/camera/cameraManager.ts` (`dollyTo`); `src/world/atmosphere.ts`; `src/world/variants.ts` (bỏ khóa camera theo thời tiết); `src/game/runtime/dayController.ts` (toast tên khu dùng `zoneNames`, dẫn đường không khóa chân) | `GameUi.tsx`, `store.ts` (thêm field), `styles.css`, `game.ts` |
| `task/R-B3-chup-anh-dao-cu` | `src/game/runtime/photoRunner.ts`, `src/ui/game/overlays/PhotoOverlay.tsx`, `src/actors/character/props.ts`, `src/actors/character/build.ts` (slot cầm tay) | `store.ts` (PhotoView thêm field), `game.ts` |
| `task/R-B4-bien-doi-3d-am-thanh` | `src/world/dressing/sets/m1_*.ts`, `src/game/sfx.ts`, MỚI `src/game/runtime/stepReactions.ts`, `src/systems/questEngine.ts` (chỉ thêm `target` vào event `step_progress`), `src/ui/game/overlays/HudBar.tsx` (bộ đếm 0/3) | `game.ts` |
| `task/R-B5-minigame-gap-thuyen` | MỚI `src/game/minigames/games/mg_fold_boat.ts` (tự vào registry), `src/game/runtime/minigameRunner.ts` (gọi stage/after cho bước minigame), tái dùng `src/game/minigames/shared/*` | — |

Cấm mọi nhánh: `src/content/days/*.ts`, `src/content/hub.ts`, `src/config/hubRoom.ts` (của Đợt 3 `R-D1…R-D4`), `d_g08_*`, `d_g09_*`,
`tools/asset-workshop/**`. Dữ liệu thử để trong `tests/` (fixture), không viết vào nội dung thật.

## 2. Việc từng nhánh (nghiệm thu = chạy thật, ghi số thật)
**R-B1 — Đạo diễn NPC.** `stageRunner.ts` hiện thực `StepHookPart.stage`: `move` (walk/run tới marker, tránh vật cản đơn giản), `teleport`,
`face` (vai hoặc marker), `motion` (`idle/talk/pose_peace/pose_wave/pose_tada/cheer`), `visible` (Châu rời cảnh P1-5),
dịch chuyển cụm P1-5 → P1-6; `wait: true` thì chờ tới nơi. Test: unit (đường đi, quay mặt) + e2e 1 cảnh.

**R-B2 — Chuyển cảnh & UI.** `narrativeRunner.ts` hiện thực `before/after`: `TitleCardOverlay` (2 dòng, fade ~0,5 s – giữ – fade),
`NarratorBanner` = **dải dẫn chuyện tách hẳn khung thoại** (không tên, không bong bóng; route luôn cả `speaker: 'narrator'` hiện có),
`KeyHintCard` lần đầu P1-1 (tự tắt sau khi đi + bấm E), `stage` cue `camera` → `CameraManager.dollyTo` (tween 0,8–1 s),
`zone_name_overrides`, câu dẫn không khóa di chuyển, đổi mưa giữa cảnh không cắt đen/khóa camera.

**R-B3 — Chụp ảnh & đạo cụ.** Bỏ `MULTI_SHOT`/`SELFIE_AIM` viết cứng; đọc `shots/first_line/shot_prompts/prompt/hide_pose/countdown_lines/after_lines`;
thoại chen đếm ngược không chặn; `after_lines` lọc theo `m1.group_photo_style`; `stage` cue `prop` → `setActorProp(actor, propId)`
(vở, quả cầu, thuyền, xấp giấy, bút đỏ, sổ luật, biển tên, máy ảnh compact; trao máy Đức ↔ người chơi). Gọi `hooks.after` + `stage('end')` trong photoRunner.

**R-B4 — Biến đổi 3D tại chỗ & âm thanh.** `stepReactions.ts` nghe bus: `step_progress` (có `target`) → phát `lines_by_target` + ✓ + tick,
HUD `0/3`; `choice_made` / `step_completed` → bật/tắt bộ đồ Trang 3 (khảo sát → bàn ghế sau `mg_base_build` → đồ trang trí ngay lúc chọn);
Trang 2: 5 thuyền mép rãnh (P2-4) → 1 thuyền Hạ ở `itr.thcs.gutter_end` (P2-6); dời cụm cầu đá về `itr.thcs.shuttle_bush`;
ghế đá/khúc gỗ đặt máy ảnh theo `cam.thcs.phuong_group` / `cam.thcs.rainbow_log`. `sfx.ts`: vở rơi, trống trường, màn trập, tick, mưa nhẹ
(thiếu file âm thì im lặng, không lỗi).

**R-B5 — Gấp thuyền + tự ghi điều ước (Trang 2 Cảnh 3, BẮT BUỘC 3 nhịp).** `mg_fold_boat`: nhịp 1 gấp theo nếp (không thua),
nhịp 2 chọn điều ước (lấy từ `ctx` / flag, không viết cứng chữ cốt truyện — chữ thật đổ ở R-D2), nhịp 3 tự ghi lên cánh buồm;
kết quả ghi flag `m1.boat_wish`. Luật ≤ 3 dòng, dùng `createMinigameLoop`/`createHiDpiCanvas`, có `data-testid`.

## 3. Quy trình
1. Mỗi nhánh tách từ `feat/sprint-0412` **sau khi Đợt 1 đã gộp**, làm trong `git worktree` riêng.
2. Commit nhỏ; không `push --force`, không rebase nhánh đã đẩy.
3. Xanh trước khi xin gộp: `npx tsc --noEmit`, `npm test`, `npm run validate:world`, `VERCEL_ENV=production npm run build`.
4. Claude Manager gộp lần lượt `R-B5 → R-B4 → R-B3 → R-B1 → R-B2` (ít đụng chung trước), chạy đủ 5 lệnh (thêm `npx playwright test --workers=1`).
5. Báo cáo: file đổi, lệnh đã chạy + kết quả thật, việc chưa làm.
