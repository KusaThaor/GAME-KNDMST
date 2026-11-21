# SESSION_HANDOFF
Phiên bản v9 · Cập nhật 21/11/2026 (UTC+7) · Bộ ngữ cảnh v1.0 (GDD 00–03 đang ở v1.1-draft, xem dưới).

## Mục tiêu hiện tại
Dựng bản public (Mốc 1 + Mốc 2, 9 Trang) kịp hạn chuẩn bị 04/12, theo GDD `docs/gdd/00`–`03`. Phiên 21/11: đưa **Hòm thư Valentine** vào luồng Main của Trang 6 theo bản sửa của nhóm.

## Quyết định mới (21/11)
- **CONFIRMED (chủ dự án):** Hòm thư Valentine là sự kiện **Main** của Trang 6, **nghĩa mới** (hòm thư tình bạn: cảm ơn · trêu nhẹ · rủ làm việc chung; nội quy 3 điều). Câu "Không có hòm thư" của chỉ đạo 19/11 hết hiệu lực. Nghĩa cũ "thả thính" vẫn SUPERSEDED.
- **PROPOSED, chờ duyệt (CẦN CHỐT #1–#6):** giữ confession của Hạ ở Cảnh B; Trang 6 có 4 cảnh; nhánh buổi chiều làm bản rút gọn trước; lời thư/phản ứng; ảnh chính = ảnh nhóm bên hòm thư; bảng nội quy đủ 3 điều. Chi tiết: `docs/gdd/REVISION_REVIEW_FIX_C_21-11.md`.

## Trạng thái từng việc
- Tài liệu: nhánh `docs/valentine-mailbox-main-flow` có `00`–`03` v1.1-draft, kịch bản v1.5-draft (`docs/gdd/scripts/`), file rà xung đột. **Chưa gộp**, chưa duyệt; các Trang khác vẫn APPROVED v1.0.
- Code: chưa làm Trang 6 (không có màn chọn thư, hòm thư, nhánh chiều). Không nhánh code nào nhắc hòm thư.

## Đã kiểm tra / chưa kiểm tra
- Đã: tìm mọi chỗ nhắc hòm thư trong repo và Project; đối chiếu ngày (Valentine 14/2/2017 = thứ Ba); đối chiếu "căn-tin ↔ ghế đá"; mọi lựa chọn thư đều có đường đi tiếp.
- Chưa: chơi thử; hình hòm thư và bảng nội quy chưa có concept; ngân sách/giá nhánh ăn vặt và mua sắm chưa đặt; phản ứng và câu chốt là lời mẫu AI viết.

## File cần đọc cho tác vụ kế tiếp
`docs/gdd/REVISION_REVIEW_FIX_C_21-11.md` → `docs/gdd/02` §2.5 → kịch bản Trang 6 → `docs/gdd/03` (dòng Valentine).

## Điểm chưa rõ
- 6 câu CẦN CHỐT ở trên.
- Danh sách Side; nhân lực; ảnh chính Trang 3; "bạn thư viện" có trở lại không; ngoại hình NPC; nhạc nền.
- `docs/PAGE_DATA_GUIDE.md` dòng 82 (nhánh `feat/sprint-0412`) còn ghi Trang 6 "Confession" — chưa sửa vì khác nhánh.

## Một bước tiếp theo
Chủ dự án trả lời #1–#6; sau đó đổi nhãn sang APPROVED, gộp nhánh vào `docs/sync-approved-gdd-v1` và chuyển Trang 6 (Tầng A) cho dev.
