# Bàn giao sửa lỗi Playtest (Đợt 1) — 27/11/2026

Đối chiếu từ file feedback `CHƠI THỬ VÀ LỖI.md` trên nhánh `feat/sprint-0412`.

## 1. Các mục đã sửa và gộp vào `feat/sprint-0412`

| # | Vấn đề trong feedback | Cách xử lý | File chính |
|---|---|---|---|
| 1 | Con trỏ chuột chưa đổi sang hình bàn tay ở vật click được | Đổi `cursor: pointer` khi rê chuột lên vật tương tác được trong phòng 2026 (đủ tầm với & có hành động) và món `clickable` bên trong Hộp Kỷ Vật | `src/game/runtime/hubController.ts`, `src/game/game.ts` |
| 2 | Thiếu gợi ý click vào Hộp Kỷ Vật ở Hub | Thêm vòng sáng vàng + khối đánh dấu nổi (`hub:box-hint`) trên Hộp Kỷ Vật khi `!introDone()`, cùng hiệu ứng phóng nhẹ khi hover | `src/game/scenes/hubScene.ts`, `src/game/runtime/hubController.ts` |
| 3 | Click ngoài khung thoại không qua câu tiếp | Thêm lớp nền `.g-next-backdrop` (`cursor: pointer`, `z-index: 1`) khi hiện `dialogue`/`narrator` (không che HUD/modal) để bấm bất kỳ đâu cũng gọi `a.next()` | `src/ui/game/GameUi.tsx`, `src/styles.css` |
| 4 | Lag/giựt khi chơi minigame (đá cầu, v.v.) | Thêm `setRenderPaused(true)` ở `GameView` và bỏ qua `dayCtrl.tick`/`hubCtrl.tick` khi `ui.minigame` đang mở | `src/game/view.ts`, `src/game/game.ts` |
| 5 | `PhonePanel`: bỏ sắc thái, thêm ô tự gõ, sửa background | Bỏ tag sắc thái trên nút gợi ý, dựng lại khung điện thoại viền tối + màn hình chat nền sáng, thêm ô nhập tin tự do lưu cục bộ (`custom_text`, `tone: null` ở analytics) | `src/ui/game/panels/PhonePanel.tsx`, `src/styles.css`, `src/core/save.ts`, `src/systems/questEngine.ts`, `src/systems/hub.ts`, `src/game/runtime/hubController.ts`, `src/ui/game/store.ts` |
| 6 | Khung hoàn thành minigame xấu, thiếu hiệu ứng Thắng/Thua cộp xuống | Thiết kế lại thẻ kết quả với huy hiệu đóng dấu `THẮNG!` / `THUA RỒI` / `HÒA` / `HOÀN THÀNH!` có animation `@keyframes g-stamp-slam`, hiển thị sao (`★`/`☆`) và điểm | `src/ui/game/MinigameFrame.tsx`, `src/styles.css` |

## 2. Kiểm tra đã chạy sau khi gộp `feat/sprint-0412`

- `npm run typecheck` (`tsc --noEmit`): đạt.
- `npm test` (`vitest run`): 41/42 file đạt (1 file `firestore.int.test.ts` skip), 609 passed / 2 skipped (đã thêm 2 unit test trong `tests/unit/hub.test.ts` cho tin nhắn tự gõ và `setBoxHint`).
- `npm run build`: đạt.
- Chưa chạy lại Playwright E2E trên trình duyệt thật.

## 3. Việc còn lại từ feedback (gợi ý đợt tiếp theo)

### Nhóm A (fix nhanh, nên làm trước 04/12)
- Chống kẹt giao diện chọn ảnh khi bấm `Về chỗ an toàn` (`dayController.ts`).
- Kiểm tra chọn ảnh tấm chụp 3 người đầu tiên (`d_g06_01.ts` / `PhotoOverlay.tsx`).
- Tự quay mặt nhân vật về máy ảnh khi chụp (`bindStandZone` + `dayScene`).
- Ẩn/tách màu gem vàng ở `itr.thcs.duty_spot` (`questEngine.ts` `targetsOfInterest()`).
- Tinh chỉnh ẩn tầng 2 / nóc nhà (`world.ts` `setViewerZone`) và màu UI còn hơi ngả vàng (`styles.css` / `hub.ts`).
- Cho tương tác Album / Điện thoại ở đầu game (`hubController.ts`).

### Nhóm B / C (chờ chốt hoặc làm sau)
- Chờ chủ dự án duyệt thoại mới cho 2 dòng đầu, khúc gõ tên, thoại sau mở hộp và thoại dẫn còn trống.
- Mũi tên chỉ đường nhiệm vụ, minimap định vị, nút chụp ảnh tự sướng lưu máy, Album lật trang, che kín khu Căn cứ bằng `map_thcs.extras.ts`.
