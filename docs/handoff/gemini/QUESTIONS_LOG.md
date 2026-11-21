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
> **Trạng thái:** ĐÃ ĐƯỢC CHỦ DỰ ÁN PHÊ DUYỆT (21/11/2026)

### Câu hỏi 1: Điểm đứng / máy ảnh chưa có trong `map_thcs.index.json`
- **Vấn đề:** Một số bối cảnh trong kịch bản (tiệm tạp hóa xem U23 ở Trang 8, sân trường ban đêm đốt lửa trại Hội trại ở Trang 8, góc hiên thư viện ở Trang 6) hiện chưa có marker chuyên biệt hoặc preset ánh sáng ban đêm trong `map_thcs.index.json`.
- **Quyết định duyệt:** **Phương án A (Khuyên dùng)**.
- **Thực thi:** Dữ liệu tạm dùng các marker gần nhất trong `map_thcs` (`itr.thcs.grocery`, `cam.thcs.yard_group`, `spot.thcs.yard_bench`). Đội 3D/world sẽ bổ sung marker chuyên biệt (`cam.thcs.night_camp`, `cam.thcs.grocery_tv`, `itr.thcs.library_porch`) và preset ánh sáng ban đêm (`night_camp`) trong đợt cập nhật asset tiếp theo.

### Câu hỏi 2: Màn giao diện đặc thù chưa có loại bước tương ứng
- **Vấn đề:** Màn chọn thư Valentine (`UI_LETTER_PICKER` - chọn người nhận, loại thư, bỏ vào khe) và màn chép bố cục báo tường khổ A5 chưa có loại bước riêng trong engine.
- **Quyết định duyệt:** **Phương án A (Khuyên dùng)**.
- **Thực thi:** Dữ liệu kết hợp bước `choice` (chọn người nhận, sắc thái) nối tiếp bước `minigame` (`mg_letter_picker` / `mg_wall_paper`) để vừa lưu cờ phân nhánh chuẩn theo Phụ lục B, vừa kích hoạt giao diện minigame mà không cần thêm kind bước mới.

### Câu hỏi 3: Cách đưa tỉ số Caro vào tin nhắn kết thúc demo
- **Vấn đề:** Cần thống nhất hiển thị tỉ số caro trong tin nhắn kết thúc demo ("Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?").
- **Quyết định duyệt:** **Phương án B**.
- **Thực thi:** Đã cập nhật `q_hub_pd_06.s02` trong `src/content/hub.ts` dùng chuỗi text: `'Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?'`. Engine hiển thị tin nhắn sẽ nội suy `{quan}` và `{duc}` từ cờ `minigames.caro.series` đã ghi nhận ở Trang 5, nếu cờ chưa tồn tại hoặc người chơi bỏ qua thì tự động fallback về tỉ số cố định `"4–3"`.

### Câu hỏi 4: Điểm kết thúc demo Mốc 2 và cấu hình `release.ts`
- **Vấn đề:** Cần cấu hình điểm kết thúc demo Mốc 2 mà không ảnh hưởng tới bản đo Mốc 1 đang sử dụng profile `test`.
- **Quyết định duyệt:** **Phương án B**.
- **Thực thi:** Đã bổ sung profile `test_m2` trong `src/content/release.ts` bao gồm toàn bộ 9 Ngày (`d.g06.01` đến `d.g09.03`), `end_day_id: 'd.g09.03'`, `end_step_id: 'q_hub_pd_06.s02'`. Giữ nguyên profile `test` (4 Trang Mốc 1) cho bản đo đạc. Đã cập nhật `ContentConfig` trong `types.ts`, `pack.ts` và bổ sung unit test xác thực độc lập.

### Câu hỏi 5: Đăng ký mã minigame vào runtime
- **Vấn đề:** Chuẩn bị runtime cho 17 mã minigame mới được số hóa ở Mốc 2.
- **Quyết định duyệt:** **Phương án A (Khuyên dùng)**.
- **Thực thi:** Đội dev runtime khi xây dựng minigame registry sẽ đăng ký đủ 17 mã minigame (`mg_wipe_board`, `mg_caro`, `mg_mailbox_craft`, `mg_apology_letter`, `mg_letter_picker`, `mg_ball_toss`, `mg_photo_hunt`, `mg_base_decor`, `mg_sudoku`, `mg_wall_paper`, `mg_flag_color`, `mg_chair_row`, `mg_cheer_rhythm`, `mg_sign_shirt`, `mg_rule6`, `mg_fingerprint`, `mg_bottle_flip`) kèm stub pass-through/bỏ qua để đảm bảo quy trình chạy test và gameplay luôn thông suốt.
