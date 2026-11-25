# QUESTIONS_LOG — Câu hỏi Gemini gửi Chủ Dự Án & Trạng Thái Xử Lý

> **Phiên làm việc:** 21/11/2026 (T-06: Số hóa kịch bản Trang 1–4)  
> **Agent:** Gemini Pro (Antigravity)  

| # | Trang | Bước / Hạng mục | Vấn đề / Câu hỏi | Phương án xử lý | Quyết định / Căn cứ | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Trang 2 | Đua thuyền giấy (`q_m1_main_02.s04`) | Minigame gấp thuyền và đua thuyền trên rãnh nước thực tế chưa có code runtime | Triển khai dưới dạng bước tương tác `interact` tại `itr.thcs.gutter` với hội thoại mô tả diễn biến (thuyền Đức lật, thuyền Quân xa nhất) để không chặn tiến độ cốt truyện | Khớp `PROMPT_T06_SO_HOA.md` §Yêu cầu kỹ thuật: "Khung trò thật minigame chưa xong... không tự viết luật chơi trong dữ liệu, thua vẫn đi tiếp" | Đã xử lý (Chuẩn hóa) |
| 2 | Trang 3 | Khảo sát góc căn cứ (`q_m1_main_03.s02`) | Marker đứng và bàn gỗ tại khu căn cứ | Sử dụng marker tương tác sẵn có `itr.thcs.old_table` (Bàn gỗ cũ ở Căn cứ) trong zone `zone.thcs.base` | Khớp `map_thcs.index.json` | Đã xử lý (Chuẩn hóa) |
| 3 | Hub 2026 | Mở đầu phòng trọ (`q_hub_pd_01`) | Cắt cảnh phòng trọ và mở thùng carton | `s01` là `cutscene` chứa toàn bộ lời dẫn + dòng suy nghĩ Player; `s02` là `interact` không kèm text để khi bấm thùng mở ngay Hộp Kỷ Vật | Đảm bảo luồng test tự động và gameplay mượt mà | Đã xử lý (Chuẩn hóa) |

## Còn treo (đang là [PLACEHOLDER])
- Tuyến Main của toàn bộ Mốc 1 (Trang 1, 2, 3, 4) và Hub mở đầu/kết thúc: **0 PLACEHOLDER**, đã thay thế 100% bằng thoại canonical tiếng Việt được duyệt.
- Nhãn chương `chapters.ts`: `[PLACEHOLDER] Mốc 1 · lớp 6–7` (giữ theo quy ước để validator và analytics không xung đột).

## Đoạn Gemini đề xuất chuẩn hóa kỹ thuật chờ chủ dự án xem xét
1. Bổ sung 3 sắc thái lựa chọn cho `c_m1_02_wish` (Trang 2: `friendship` [gentle], `fun` [playful], `secret` [deep]) và `c_m1_03_decor` (Trang 3: `paper` [playful], `flowers` [gentle], `photos` [deep]) để khớp cơ chế 3 sắc thái của hệ thống Analytics F8.

## 25/11/2026 — Trang 2 viết lại (R-A2), chủ dự án chốt "theo đề xuất" — CONFIRMED
| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | Trang 2 "sau giờ học" hay kết bằng trống vào lớp? | Giờ ra chơi buổi chiều, kết bằng trống vào lớp |
| 2 | Trống hay chuông (năm 2015)? | **Trống trường cho cả 4 Trang Mốc 1** |
| 3 | Minigame chọn kiểu thuyền sau khi đã chụp 5 thuyền? | Giữ nguyên bước chọn kiểu, chấp nhận lệch nhỏ; xét dời lên trước sau 15/12 |
| 4 | Ghi chú ảnh Album Trang 2? | "Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xếp hàng chờ thả." |
| 5 | Câu Hạ "Thuyền của {player_name} trôi mất rồi…" để trước hay sau phần giới thiệu tên? | **Sau** (dời so với kịch bản gốc) |
Chi tiết: `R-A2_TRANG2_THOAI_PROPOSED.md` (outline), việc tiếp: `PROMPT_R-A2_TRANG2_HOAN_THIEN.md`.
