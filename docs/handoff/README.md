# Bàn giao — Hành Trình Thanh Xuân (cập nhật 21/11/2026 tối)

File này mở đầu. Đọc hết trong 2 phút rồi sang `SPRINT_TASKS.md`.

## Baseline
| | Nhánh | Commit |
|---|---|---|
| Tài liệu (nguồn chân lý) | `docs/sync-approved-gdd-v1` | `1ebafb3` |
| Code | `feat/sprint-0412` | `09204f5` |
| Asset | `feature/asset-workshop` | `51baf28` |

Không gộp vào `main` khi chủ dự án chưa đồng ý. Không `push --force`.

## Mục tiêu bản đo
Hạn dựng: **04/12/2026**. Kỳ đo: **05–15/12**.
Phạm vi (chủ dự án chốt 21/11 tối): **trọn Mốc 1 — Trang 1 → Trang 4**, kết demo đặt ngay sau Trang 4 "Đủ năm đứa". **Mốc 2 (Trang 5–9, Caro, Sudoku, Valentine) lùi sau 15/12** — thiết kế vẫn giữ đủ trong `docs/gdd/`.

## Luồng chơi hiện tại (chạy được, nội dung giả)
Phòng 2026 → nhập tên, chọn nam/nữ → Hộp Kỷ Vật → chọn kỷ vật đang sáng → Ngày ký ức trên bản đồ trường (6 khu, camera thứ ba) → chuỗi quest Main → chụp ảnh → về phòng → trang Album hiện rõ, kỷ vật lên kệ → điện thoại, gửi tin → ghi hoàn thành → thẻ phản hồi.
Mở bằng `npm run dev` rồi vào `/?play=1`. Chi tiết từng điểm chuyển: `DEMO_AUDIT.md` mục 2.

## Trạng thái
**Đã chạy thật (21/11):** `tsc` đạt · `npm test` 266 đạt / 1 bỏ qua · `validate:world` 6 khu 0 lỗi · build production đạt và sạch công cụ test.
**Dữ liệu giả:** toàn bộ thoại và nội dung 2 Trang đang có (`[PLACEHOLDER]` + nhãn `AI_PROPOSED`).
**Đang chặn:** 7/9 Trang chưa có dữ liệu (bản đo cần 4) · khung minigame chỉ là thẻ một nút "Xong" · form phản hồi chưa có câu hỏi và chưa có nơi ghi · bản `production` chưa khai Trang nào nên mở production không vào được game.
**Chưa xác minh:** e2e 37 ca (môi trường phiên kiểm toán không tải được trình duyệt Playwright) · FPS trên laptop thật · bản preview Vercel · Firestore thật · touchpad và cảm ứng thật.

## Link tương đối
- Thiết kế: [`../gdd/00_MASTER_GDD.md`](../gdd/00_MASTER_GDD.md) · [`01_NARRATIVE_AND_SCENES.md`](../gdd/01_NARRATIVE_AND_SCENES.md) · [`02_GAMEPLAY_AND_MECHANICS.md`](../gdd/02_GAMEPLAY_AND_MECHANICS.md) · [`03_ASSETS_AND_AUDIO.md`](../gdd/03_ASSETS_AND_AUDIO.md) · [kịch bản](../gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md)
- Kiểm toán: [`DEMO_AUDIT.md`](DEMO_AUDIT.md) · Backlog: [`SPRINT_TASKS.md`](SPRINT_TASKS.md) · Quy tắc repo: [`../../CLAUDE.md`](../../CLAUDE.md) · Nhánh: [`../../WORKSPACE.md`](../../WORKSPACE.md)

## Bắt đầu từ đây
**Task duy nhất cần làm trước:** **T-01 — Gộp nhánh tài liệu và 5 sửa nhỏ theo quyết định 21/11** (`SPRINT_TASKS.md`, mục T-01).
- Agent: **Claude Code**.
- Điều kiện bắt đầu: có quyền đọc/ghi repo; `npm install` chạy xong; đang ở worktree riêng của `feat/sprint-0412` (máy chủ dự án đang ở `feature/asset-workshop` — **đừng đổi nhánh trong thư mục đó**).
- File đọc trước: `CLAUDE.md`, `DEMO_AUDIT.md` §6.2 và §6.5.
- Kết quả bàn giao: nhánh code đã có GDD mới nhất; `release.ts`, `chapters.ts`, `rigAdapter.ts`, `photo.ts`, `cast.ts` sửa xong; 4 lệnh kiểm đạt; commit nhỏ theo từng việc.
- Xong T-01 thì làm **T-04** và **T-02** (song song được), rồi **T-03**.

Sau mỗi task: cập nhật trạng thái và bằng chứng nghiệm thu vào `docs/DEV_SESSION_HANDOFF.md`, ghi commit triển khai vào bảng backlog của `SPRINT_TASKS.md`.
