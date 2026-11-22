# Bàn giao — Hành Trình Thanh Xuân (cập nhật 22/11/2026)

File này mở đầu. Đọc hết trong 2 phút rồi sang [`../NEXT_SPRINT_TASK_BOARD.md`](../NEXT_SPRINT_TASK_BOARD.md) — **bảng việc duy nhất** (đã gộp `SPRINT_TASKS.md` cũ).

## Nhánh
| | Nhánh | Ghi chú |
|---|---|---|
| Làm việc chính (code + tài liệu hiện hành) | `feat/sprint-0412` | Mỗi task: worktree riêng, nhánh `task/<mã>-<tên>`, PR vào đây |
| Tài liệu cũ | `docs/sync-approved-gdd-v1` (`1ebafb3`) | Đã gộp vào nhánh trên |
| Asset cũ | `feature/asset-workshop` (`51baf28`) | **Không gộp** cho nhân vật (D3, 22/11) |

Không gộp vào `main` khi chủ dự án chưa đồng ý. Không `push --force`.

## Mục tiêu bản đo
Hạn dựng: **04/12/2026**. Kỳ đo: **05–15/12**.
Phạm vi (chủ dự án chốt 22/11): **Mốc 1 đầy đủ (Trang 1→4) + Mốc 2 chỉ tuyến Main (Trang 5→9)**, kết demo sau Trang 9 (có timeskip ngắn trước đó). Side/Daily, Khu Vui Chơi, Tầng B: cắt hoặc stub, không vào production. Thiết kế đầy đủ vẫn nằm trong `docs/gdd/`.
Asset (D3): mọi asset mới dựng bằng **Procedural Three.js**, không Blender; chỉ dùng lại GLB đã có ở `public/assets/`.

## Luồng chơi hiện tại (chạy được)
Phòng 2026 → nhập tên, chọn nam/nữ → Hộp Kỷ Vật → chọn kỷ vật đang sáng → Ngày ký ức trên bản đồ trường (6 khu, camera thứ ba) → chuỗi quest Main → chụp ảnh → về phòng → trang Album hiện rõ, kỷ vật lên kệ → điện thoại, gửi tin → ghi hoàn thành → thẻ phản hồi.
Mở bằng `npm run dev` rồi vào `/?play=1`. Chi tiết từng điểm chuyển: `DEMO_AUDIT.md` mục 2.

## Trạng thái (kiểm 22/11)
**Đã chạy thật:** `tsc` đạt · `npm test` 266 đạt / 1 bỏ qua · `validate:world` 6 khu 0 lỗi · e2e `--workers=1` 37 đạt / 1 bỏ qua (~32 phút) · build production đạt, sạch công cụ test.
**Đã có:** 4 Trang Mốc 1 với thoại đã duyệt (chủ dự án chấp nhận 22/11), chơi được bằng bot e2e.
**Đang chặn:** khung minigame chỉ là thẻ một nút "Xong" · Trang 5–9 chưa có dữ liệu · form phản hồi chưa có câu hỏi và chưa có nơi ghi · bản `production` chưa khai Trang nào · bản lưu v2 sẽ xóa tiến trình nếu tăng phiên bản.
**Chưa xác minh:** FPS trên laptop thật · bản preview Vercel · Firestore thật · touchpad và cảm ứng thật · chưa chơi tay từng Trang.

## Link tương đối
- Thiết kế: [`../gdd/00_MASTER_GDD.md`](../gdd/00_MASTER_GDD.md) · [`01_NARRATIVE_AND_SCENES.md`](../gdd/01_NARRATIVE_AND_SCENES.md) · [`02_GAMEPLAY_AND_MECHANICS.md`](../gdd/02_GAMEPLAY_AND_MECHANICS.md) · [`03_ASSETS_AND_AUDIO.md`](../gdd/03_ASSETS_AND_AUDIO.md) · [kịch bản](../gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md)
- Việc: [`../NEXT_SPRINT_TASK_BOARD.md`](../NEXT_SPRINT_TASK_BOARD.md) · Rà soát GDD: [`../GDD_FULL_REVIEW.md`](../GDD_FULL_REVIEW.md) · Nền 3D: [`../BACKGROUND_AUDIT.md`](../BACKGROUND_AUDIT.md) · Kiểm toán cũ: [`DEMO_AUDIT.md`](DEMO_AUDIT.md) · Backlog cũ (lịch sử): [`SPRINT_TASKS.md`](SPRINT_TASKS.md) · Quy tắc repo: [`../../CLAUDE.md`](../../CLAUDE.md) · Nhánh: [`../../WORKSPACE.md`](../../WORKSPACE.md)

## Bắt đầu từ đây
Mở `docs/NEXT_SPRINT_TASK_BOARD.md` → Mục 0 (đã chốt gì) → Mục 1 (bảng task) → thẻ task của mình ở Mục 2, copy khối "Prompt".
**Làm trước:** **N-04 (bản khung `dressing`/`atmosphere`, đẩy trong ngày đầu)**, song song với N-03, N-10. Máy chủ dự án đang ở `feature/asset-workshop` — **đừng đổi nhánh trong thư mục đó**, luôn dùng `git worktree`.
Sau mỗi task: ghi trạng thái và bằng chứng nghiệm thu vào `docs/DEV_SESSION_HANDOFF.md` và cột trạng thái của bảng ở Mục 0.3 trong board.
