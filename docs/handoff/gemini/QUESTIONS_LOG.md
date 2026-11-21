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
- Nhãn chương `chapters.ts`: `[PLACEHOLDER] Mốc 1 · lớp 6–7` và `[PLACEHOLDER] Mốc 2 · lớp 8–9` (giữ theo quy ước để validator và analytics không xung đột).

## Đoạn Gemini đề xuất chuẩn hóa kỹ thuật chờ chủ dự án xem xét
1. Bổ sung 3 sắc thái lựa chọn cho `c_m1_02_wish` (Trang 2: `friendship` [gentle], `fun` [playful], `secret` [deep]) và `c_m1_03_decor` (Trang 3: `paper` [playful], `flowers` [gentle], `photos` [deep]) để khớp cơ chế 3 sắc thái của hệ thống Analytics F8.

---

# CỤM CÂU HỎI MỐC 2 (TRANG 5–9 & KẾT DEMO MỐC 2)
> **Phiên làm việc:** 21/11/2026 (Số hóa kịch bản Mốc 2: Trang 5, 6, 7, 8, 9, chuyển Mốc và kết demo)  
> **Agent thực hiện:** Gemini Pro (Antigravity)  

### Câu hỏi 1: Điểm đứng / máy ảnh chưa có trong `map_thcs.index.json`
- **Vấn đề:** Một số bối cảnh trong kịch bản (tiệm tạp hóa xem U23 ở Trang 8, sân trường ban đêm đốt lửa trại Hội trại ở Trang 8, góc hiên thư viện ở Trang 6) hiện chưa có marker chuyên biệt hoặc preset ánh sáng ban đêm trong `map_thcs.index.json`. Dữ liệu hiện tạm dùng marker gần nhất (`itr.thcs.grocery`, `cam.thcs.yard_group`, `spot.thcs.yard_bench`).
- **Phương án A (Khuyên dùng):** Tạm dùng các marker gần nhất trong `map_thcs` như hiện tại; khi đội 3D/world hoàn thiện asset sẽ bổ sung marker chuyên biệt (`cam.thcs.night_camp`, `cam.thcs.grocery_tv`, `itr.thcs.library_porch`).
- **Phương án B:** Giữ nguyên các marker hiện có, chỉ cần thêm preset ánh sáng ban đêm (`night_camp`) vào `src/world/variants.ts`.
- **Phương án C:** Tách tiệm tạp hóa và khu hội trại thành các zone/bản đồ riêng biệt.
*(Nếu không chọn, mặc định giữ Phương án A).*

### Câu hỏi 2: Màn giao diện đặc thù chưa có loại bước tương ứng
- **Vấn đề:** Màn chọn thư Valentine (`UI_LETTER_PICKER` - chọn người nhận, loại thư, bỏ vào khe) và màn chép bố cục báo tường khổ A5 chưa có loại bước riêng trong engine (hiện chỉ có `talk`, `interact`, `choice`, `minigame`, `cutscene`).
- **Phương án A (Khuyên dùng):** Kết hợp bước `choice` (chọn người nhận, sắc thái) nối tiếp bước `minigame` (`mg_letter_picker` / `mg_wall_paper`) như đã triển khai để vừa lưu cờ phân nhánh chuẩn, vừa kích hoạt giao diện minigame.
- **Phương án B:** Chuyển hoàn toàn logic lựa chọn vào bên trong UI minigame 2D, minigame tự bắn event lưu cờ khi kết thúc.
- **Phương án C:** Mở rộng schema engine để bổ sung loại bước mới `custom_ui`.
*(Nếu không chọn, mặc định giữ Phương án A).*

### Câu hỏi 3: Cách đưa tỉ số Caro vào tin nhắn kết thúc demo
- **Vấn đề:** Kịch bản văn học v1.4 quy định tỉ số trên nắp hộp phấn là "QUÂN 4 – ĐỨC 3 (CHƯA XONG)" (cố định), trong khi GDD `02` §2.1 đề xuất tỉ số động (3–4 hoặc 4–3 tùy ván đánh của Player). Trong tin nhắn kết thúc demo: "Ê. Ván caro hồi lớp 8 vẫn đang 4–3 đó nha. Ai gỡ?", cần chốt định dạng hiển thị.
- **Phương án A (Khuyên dùng):** Cố định tỉ số "4–3" đúng nguyên văn kịch bản v1.4 đã chốt ("QUÂN 4 – ĐỨC 3 (CHƯA XONG)").
- **Phương án B:** Dùng biến động `{quan}–{duc}` lấy từ cờ `minigames.caro.series` nếu người chơi đã đánh caro, fallback về "4–3".
- **Phương án C:** Bỏ con số tỉ số trong tin nhắn, chỉ giữ câu rủ chung "Ván caro hồi lớp 8 vẫn chưa xong đó nha. Ai gỡ?".
*(Nếu không chọn, mặc định giữ Phương án A).*

### Câu hỏi 4: Điểm kết thúc demo Mốc 2 và cấu hình `release.ts`
- **Vấn đề:** `release.ts` hiện đang dừng ở Trang 4 (Mốc 1) và không được sửa theo chỉ đạo. Toàn bộ Trang 5–9 và nhiệm vụ kết thúc demo Mốc 2 (`q_hub_pd_05`, `q_hub_pd_06`) đã được số hóa sẵn sàng.
- **Phương án A (Khuyên dùng):** Giữ nguyên `release.ts` ở Mốc 1 cho tới khi chủ dự án duyệt xong toàn bộ nội dung Trang 5–9; sau đó Claude Code sẽ cập nhật `end_day_id: 'd.g09.03'`, `end_step_id: 'q_hub_pd_06.s02'`.
- **Phương án B:** Bổ sung profile `test_m2` trong `release.ts` để phục vụ test tự động riêng cho Mốc 2.
- **Phương án C:** Đợi duyệt từng Trang, sau đó mở rộng trực tiếp profile `test`.
*(Nếu không chọn, mặc định giữ Phương án A).*

### Câu hỏi 5: Đăng ký mã minigame vào runtime
- **Vấn đề:** Đã khai báo 17 mã minigame theo đúng danh mục chỉ định (`mg_wipe_board`, `mg_caro`, `mg_mailbox_craft`, `mg_apology_letter`, `mg_letter_picker`, `mg_ball_toss`, `mg_photo_hunt`, `mg_base_decor`, `mg_sudoku`, `mg_wall_paper`, `mg_flag_color`, `mg_chair_row`, `mg_cheer_rhythm`, `mg_sign_shirt`, `mg_rule6`, `mg_fingerprint`, `mg_bottle_flip`).
- **Phương án A (Khuyên dùng):** Đội dev khi tạo registry kiểm tra minigame sẽ đăng ký các mã trên kèm stub tự động pass hoặc nút "Bỏ qua" để bảo đảm trải nghiệm không bị đứt gãy.
- **Phương án B:** Cho phép engine bỏ qua kiểm tra registry nếu minigame đang ở trạng thái phát triển.
- **Phương án C:** Chỉ giữ 3 minigame chính, các minigame còn lại hạ cấp thành tương tác `interact`.
*(Nếu không chọn, mặc định giữ Phương án A).*
