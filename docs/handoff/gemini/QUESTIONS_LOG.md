# QUESTIONS_LOG — Câu hỏi Gemini gửi Chủ Dự Án & Trạng Thái Xử Lý

> **Phiên làm việc:** 21/11/2026 (Bổ sung bước chơi Trang 1–4 & Đề xuất minigame Mốc 1)  
> **Agent:** Gemini Pro (Antigravity)  

| # | Trang | Bước / Hạng mục | Vấn đề / Câu hỏi | Phương án xử lý | Quyết định / Căn cứ | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Trang 3 | Khảo sát 3 chỗ góc sân sau (`q_m1_main_03.s02`) | Kịch bản ghi xem 3 chỗ: mái che, gốc cây, thùng giấy cũ. Bản đồ trường học hiện tại chỉ có 2 điểm tương tác là `itr.thcs.old_table` (Bàn gỗ cũ) và `itr.thcs.base_shelf` (Kệ đồ Căn cứ). | • Phương án A: Dùng điểm `itr.thcs.old_table` đại diện cho bước khảo sát góc Căn cứ (như hiện tại).<br>• Phương án B: Chờ đợt cập nhật mô hình 3D bản đồ để thêm 3 điểm đứng riêng (mái che, gốc cây, thùng giấy).<br>*(Nếu không trả lời, mình sẽ giữ phương án A kèm nhãn `[PLACEHOLDER] AI_PROPOSED`)* | Chờ chủ dự án chọn | Chờ duyệt |
| 2 | Trang 4 | Chụp ảnh hẹn giờ lần 2 sau cầu vồng | Kịch bản ghi sau cơn mưa cả nhóm hẹn giờ chụp thêm lần 2 với cầu vồng. Hiện tại dữ liệu chỉ có 1 camera `cam.d0703.group` tại gốc phượng và trang Album chỉ có 1 ô ảnh chính `alb.d.g07.03.01`. | • Phương án A: Giữ thể hiện lần chụp cầu vồng trong cắt cảnh `s05`, bức ảnh gốc phượng làm ảnh chính Album (như hiện tại).<br>• Phương án B: Thêm camera hướng cầu vồng tại Căn cứ và thêm ô Album thứ hai cho ảnh cầu vồng.<br>*(Nếu không trả lời, mình sẽ giữ phương án A)* | Chờ chủ dự án chọn | Chờ duyệt |
| 3 | Mốc 1 | Kiểm tra kiểm thử tự động (`contentPack.test.ts` & `analyticsBridge.test.ts`) | Hai file kiểm tra này được viết cố định từ đợt trước cho gói nội dung rút gọn (Trang 1 đúng 2 bước `toHaveLength(2)`, và luồng chạy gọi cứng các ID cũ). Khi Trang 1–4 bổ sung đầy đủ các bước chơi mới (minigame, photo), hai bài test này báo lệch số lượng bước. | Tuân thủ tuyệt đối quy tắc: không tự sửa file test nằm ngoài phạm vi được phép sửa. Giữ nguyên 4 file Trang theo đúng kịch bản, ghi nhận để Claude Code cập nhật file test sau khi chủ dự án duyệt nội dung mới. | Tuân thủ GEMINI_RULES §2 | Đã ghi nhận |

## Còn treo (đang là [PLACEHOLDER])
- Điểm khảo sát 3 vị trí ở Trang 3 (`itr.thcs.old_table` đang đại diện chung cho góc Căn cứ, chờ bổ sung marker 3D).
- Lần chụp ảnh hẹn giờ thứ hai với cầu vồng ở Trang 4 (đang nằm trong cắt cảnh, chờ quyết định có thêm ô Album và camera mới không).

## Đoạn Gemini đề xuất chuẩn hóa kỹ thuật chờ chủ dự án xem xét
1. Bước photo handheld tự sướng ở Trang 1 (`q_m1_main_01.s11`): Gắn vùng đứng `stand_zone: { marker: 'spot.thcs.yard_bench_1', radius: 1.1 }` tại ghế đá sân trường để nhân vật đứng đúng vị trí máy ảnh và vượt qua bài kiểm tra không gian bản đồ `world.test.ts`.
2. Bước photo chụp 5 chiếc thuyền giấy ở Trang 2 (`q_m1_main_02.s06`): Đặt `subjects: []` vì đây là ảnh chụp tĩnh vật (năm chiếc thuyền trên rãnh nước, không có người trong khung) đúng như kịch bản ghi nhận.
