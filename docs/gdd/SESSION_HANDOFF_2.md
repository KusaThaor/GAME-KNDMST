# SESSION_HANDOFF
Phiên bản v10 · Cập nhật 21/11/2026 chiều (UTC+7) · Bộ ngữ cảnh v1.0 (GDD 00–03 đang ở v1.2-draft, xem dưới).

## Mục tiêu hiện tại
Dựng bản public (Mốc 1 + Mốc 2, 9 Trang) kịp hạn chuẩn bị 04/12 theo GDD `docs/gdd/00`–`03`. Việc đang chạy: **Trang 6 "Valentine — Hòm thư của năm đứa"** đã được chủ dự án chốt hướng, sẵn sàng giao cho dev.

## Quyết định mới (21/11 chiều) — CONFIRMED
- Hai sự kiện nối nhau: **thứ Năm 9/2 confession** của Hạ → **thứ Sáu 10/2 cả nhóm làm hòm thư, Đức xin lỗi bằng thư** (lời giữ nguyên chữ) → thứ Hai 13/2 Toán → **thứ Ba 14/2 Valentine**.
- Giữ 4 cảnh. Buổi chiều Valentine làm **3 minigame đầy đủ**, nhánh còn lại rút gọn; mọi minigame có nút "Bỏ qua".
- Ảnh chính = ảnh nhóm bên hòm thư. Bảng nội quy đủ 3 điều. Lời thư do Claude chỉnh (ủy quyền).
- Hòm thư nghĩa **tình bạn**; nghĩa cũ "thả thính" vẫn SUPERSEDED.

## Cách mình hiểu (PROPOSED, báo chủ dự án)
- **3 minigame nào:** chủ dự án chưa chỉ định → mặc định Ném bóng tính điểm · Săn góc ảnh · Trang trí Căn cứ.
- **"Điều 6 giữ y nguyên"** hiểu là câu hỏi số 6 (bảng nội quy đủ 3 điều). Điều 6 sổ luật Trang 3 không đổi.

## Trạng thái từng việc
- Tài liệu: nhánh `docs/valentine-mailbox-main-flow` có `00`–`03` v1.2-draft, kịch bản v1.6-draft, `IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md`, file rà soát. **Chưa gộp**, chưa APPROVED cả file.
- Code: chưa làm gì cho Trang 6.

## Đã kiểm tra / chưa kiểm tra
- Đã: đối chiếu ngày (14/2/2017 = thứ Ba); ngày–cảnh–tham chiếu chéo khớp giữa kịch bản và `00`–`03`; mọi lựa chọn thư đều có đường đi tiếp (bảng ở `02` §2.5.5).
- Chưa: chơi thử; concept hình hòm thư + bảng; giá nhánh ăn vặt; lời mẫu phản ứng/câu chốt do AI viết; chưa xác minh quan hệ hai nhánh code.

## File cần đọc cho tác vụ kế tiếp
`docs/gdd/IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md` → `02` §2.5 → kịch bản Trang 6 → `03` (dòng Valentine).

## Điểm chưa rõ
- Ba minigame có đúng ý chủ dự án không; concept hòm thư; tên "Tú".
- Danh sách Side; nhân lực; ảnh chính Trang 3; "bạn thư viện" có trở lại không; ngoại hình NPC; nhạc nền.
- `docs/PAGE_DATA_GUIDE.md` dòng 82 (nhánh `feat/sprint-0412`) còn ghi Trang 6 "Confession" — chưa sửa vì khác nhánh.

## Một bước tiếp theo
Dev (Claude khác) chọn nhánh code theo `WORKSPACE.md`, rồi dựng Trang 6 theo file bàn giao; chủ dự án xác nhận 3 minigame trước khi dev bắt tay vào các trò.
