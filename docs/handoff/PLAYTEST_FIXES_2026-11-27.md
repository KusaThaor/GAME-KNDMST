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
| 7 | Bấm `Về chỗ an toàn` lúc chọn ảnh làm giao diện chọn ảnh đi theo & kẹt điều khiển | Ẩn `Về chỗ an toàn` khi `photo.phase` là `'pick'`/`'preview'` và chặn teleport trong `menuSafeSpot()` | `src/ui/game/panels/MenuModal.tsx`, `src/game/runtime/dayController.ts` |
| 8 | Chọn ảnh bộ ba khó bấm / dễ tràn khung | Thu gọn chiều cao ảnh xem trước, xếp nút chọn thumbnail theo cột, chặn `pointer-events` trên `img` bên trong nút | `src/ui/game/overlays/PhotoOverlay.tsx`, `src/styles.css` |
| 9 | Chụp hình hẹn giờ nhân vật không quay mặt lại máy ảnh | Lưu `facing` từ `bindStandZone()`, tự xoay player quay về hướng chụp khi `pose()` hoặc trước lúc chụp hẹn giờ | `src/world/dayBindings.ts`, `src/game/scenes/dayScene.ts`, `src/game/runtime/photoRunner.ts` |
| 10 | Cục vàng hiện ở `itr.thcs.duty_spot` khi đang tìm bảng phân lớp | Lọc bỏ highlight từ quest `AI_PROPOSED` ở `dayController.refreshHud()` | `src/game/runtime/dayController.ts` |
| 11 | Đi tới hành lang bị mất tầng 2 / mất nóc nhà | Không ẩn `htxHideIn` ở `zone.thcs.corridor` ngoài trời; chỉ ẩn khi thực sự vào trong `zone.thcs.classroom` | `src/game/scenes/dayScene.ts` |
| 12 | Đầu game không tương tác được Album / Điện thoại; màu đèn phòng còn hơi ngả vàng | Cho mở `album` và `phone` ngay từ đầu game ở Hub + bật con trỏ bàn tay; chỉnh ánh sáng `key` trong `HUB_CONFIG.presets` về trắng trung tính `#fff9f2`/`#fff8f0` | `src/game/runtime/hubController.ts`, `src/config/hub.ts` |

## 2. Kiểm tra đã chạy sau khi gộp `feat/sprint-0412`

- `npm run typecheck` (`tsc --noEmit`): đạt.
- `npm test` (`vitest run`): 41/42 file đạt (1 file `firestore.int.test.ts` skip), 610 passed / 2 skipped.
- `npm run build`: đạt.
- Chưa chạy lại Playwright E2E trên trình duyệt thật.

## 3. Việc còn lại từ feedback (Nhóm B / C — cần chốt hoặc làm sau)

- Chờ chủ dự án duyệt thoại mới cho 2 dòng đầu, khúc gõ tên, thoại sau mở hộp và thoại dẫn còn trống.
- Mũi tên chỉ đường nhiệm vụ, minimap định vị, nút chụp ảnh tự sướng lưu máy, Album lật trang, che kín khu Căn cứ bằng `map_thcs.extras.ts`.
