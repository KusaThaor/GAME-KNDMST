# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 5 (MỐC 2: LÊN LỚP 8)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** Số hóa Trang 5 (`d.g08.01`) và Chuyển sang Mốc 2  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4 APPROVED), `docs/gdd/01_NARRATIVE_AND_SCENES.md` §4, `02_GAMEPLAY_AND_MECHANICS.md` §2.1, §2.4.4  
> **Trạng thái:** Nháp, chờ duyệt  

---

## 1. Chuyển sang Mốc 2 (Hub 2026)
- **Quest chuyển tiếp:** `q_hub_pd_04` (Chuyển sang Mốc 2)
- **Kỷ vật xuất hiện:** `art_m2_01` (Hộp phấn giấy móp KV-01)
- **Thao tác:** Cutscene lật sang trang trắng "Mấy năm sau…", tương tác `itr.hub.memory_box` mở hộp phấn dưới đáy thùng.
- **Thoại mở đầu Mốc 2:** `{player_name}` (2026): "Chưa xong… Rồi có ai đánh tiếp đâu."

---

## 2. Trang 5 (`d.g08.01`) — Lên lớp 8 (Tháng 9/2016)
- **File dữ liệu:** `src/content/days/d_g08_01.ts`
- **Map:** `map_thcs` (variant `g07` decor 5 người)
- **Open zones:** `zone.thcs.classroom`, `zone.thcs.yard`, `zone.thcs.gate`, `zone.thcs.corridor`, `zone.thcs.base`, `zone.thcs.field`
- **Kỷ vật dẫn vào:** `art_m2_01` (Hộp phấn giấy móp, nắp ghi "QUÂN 4 – ĐỨC 3 (CHƯA XONG)")
- **Xưng hô:** Đức xưng "mày - tao" với cả nhóm; Châu xưng "tui - {g:ông|bà}"; Quân xưng "cậu - tớ"; Hạ xưng tên "Hạ".

### Bảng đối chiếu từng bước (Main: `q_m2_main_01`)

| Cảnh / Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Marker | Nội dung thoại & Logic |
|---|---|---|---|---|
| **Cảnh A · Bước 1**<br>Tìm bốn bạn: Đức ở xe quà vặt | `talk` | `q_m2_main_01.s01` | `NPC_A` tại `spot.thcs.gate_front` | Đức: "Ê! {player_name}! Chai này đứng được năm lần liền, ghê chưa?" |
| **Cảnh A · Bước 1**<br>Châu ở bảng phân lớp | `talk` | `q_m2_main_01.s02` | `NPC_B` tại `spot.thcs.yard_bench_1` | Châu: "{player_name}! Tui dò rồi. Năm đứa chung lớp hết. Tui dò ba lần." |
| **Cảnh A · Bước 1**<br>Quân ở cột rổ góc sân | `talk` | `q_m2_main_01.s03` | `NPC_D` tại `spot.thcs.yard_group_1` | Quân: "May quá… năm nay đủ năm đứa." |
| **Cảnh A · Bước 1**<br>Hạ dưới gốc phượng | `talk` | `q_m2_main_01.s04` | `NPC_C` tại `spot.thcs.yard_bench_2` | Hạ: "Lá đầu năm. Năm nào Hạ cũng ép một lá."<br>Hạ: "Chụp từ dưới lên nha. Hạ muốn trời lọt vô ảnh." |
| **Cảnh A · Bước 2**<br>Ảnh khai giảng | `photo` (`mode: timer`) | `q_m2_main_01.s05` | `cam.d0801.opening`<br>Stand: `spot.thcs.yard_group` | Chụp đủ 5 đứa. Lưu vào ô Album phụ `alb.d.g08.01.02`. |
| **Cảnh B · Bối cảnh**<br>Vài hôm sau, cuối buổi trực nhật | `cutscene` | `q_m2_main_01.s06` | Lớp học (`zone.thcs.classroom`) | Dẫn bối cảnh nắng chiều, bảng kín chữ, hộp phấn còn một mẩu.<br>Châu: "Góc phải còn phấn kìa. Không, thấp hơn. Rồi." |
| **Cảnh B · Bước 1**<br>Phân công trực nhật | `choice` | `q_m2_main_01.s07` | Lớp học | Chọn bạn làm cặp (`c_m2_01_partner`):<br>• `duc`: Lau bảng với Đức (`m2.partner=duc`)<br>• `ha`: Lau bảng với Hạ (`m2.partner=ha`)<br>• `quan`: Kê ghế với Quân (`m2.partner=quan`) |
| **Cảnh B · Bước 1**<br>Thoại theo cặp trực nhật | `talk` | `q_m2_main_01.s08` | `NPC_A` / `NPC_C` / `NPC_D` | Thoại phản ứng tương ứng:<br>• Đức: "Lau kiểu này mới nhanh nè!"<br>• Hạ: "{player_name} lau ngang, Hạ lau dọc. Vậy hông sót."<br>• Quân: "Tớ khiêng. Cậu chỉ chỗ đặt." |
| **Cảnh B · Bước 1**<br>Lau bảng lần 1 | `minigame` (`game: mg_wipe_board`) | `q_m2_main_01.s09` | `itr.thcs.blackboard` | Minigame lau sạch bảng đen lớp học. |
| **Cảnh B · Bước 2**<br>Đức kẻ ô caro | `talk` | `q_m2_main_01.s10` | `NPC_A`, `NPC_D` | Đức: "Bảng sạch vầy mà không xài thì phí. Một ván thôi. Đứa nào thua lau."<br>Quân: "…Một ván." |
| **Cảnh B · Bước 2**<br>Ván cờ caro | `minigame` (`game: mg_caro`) | `q_m2_main_01.s11` | `itr.thcs.blackboard` | Chơi ván caro trên bảng đen. |
| **Cảnh B · Bước 2**<br>Phản ứng ván cờ | `talk` | `q_m2_main_01.s12` | `NPC_B`, `NPC_D` | Châu: "Đã nói một ván."<br>Quân: "Ván cuối mà cậu cứ đòi gỡ." |
| **Cảnh B · Bước 3**<br>Bác bảo vệ tới nhắc | `cutscene` | `q_m2_main_01.s13` | Lớp học | Bác bảo vệ: "Mấy đứa! Sắp khóa cổng rồi, bảng còn trắng xóa vầy hả?"<br>Đức: "Khoan khoan, ván này chưa xong!"<br>Châu: "Ghi tỉ số lại, mai đánh tiếp." (Châu ghi lên nắp hộp phấn rỗng).<br>Player: "Khoan, chụp cái bảng đã." |
| **Cảnh B · Bước 4**<br>Chụp ảnh bàn caro | `photo` (`mode: handheld`) | `q_m2_main_01.s14` | `cam.d0801.board` | Chụp bàn caro dang dở trên bảng đen (`alb.d.g08.01.01`, required: true). |
| **Cảnh B · Bước 5**<br>Lau bảng lần 2 | `minigame` (`game: mg_wipe_board`) | `q_m2_main_01.s15` | `itr.thcs.blackboard` | Lau nhanh trước khi bảo vệ khóa cổng. |
| **Cảnh B · Bước 6**<br>Cất hộp phấn | `talk` | `q_m2_main_01.s16` | `NPC_A`, `NPC_C` | Đức: "Lẹ lên tụi mày ơi, về trễ là khỏi ăn cơm!"<br>Hạ: "Bụi bay vô cặp Hạ hết rồi nè…"<br>Đức: "Mày giữ hộp đó nha. Mai gỡ." |
| **Cảnh B · Bước 6**<br>Nhặt mẩu phấn | `interact` | `q_m2_main_01.s17` | `itr.thcs.blackboard` | Nhặt mẩu phấn cuối bỏ vào hộp phấn. |
| **Cảnh B · Bước 7**<br>Ra về qua cổng trường | `goto` | `q_m2_main_01.s18` | `itr.thcs.snack_cart` | Năm đứa đi ra cổng; bác bảo vệ khóa cổng sau lưng. Hoàn thành Trang 5. |

### Nhiệm vụ phụ (Side: `q_m2_side_01`)
- **Tên:** Thử thách lật chai nước
- **Loại:** `side`, `blocks_main: false`
- **Bước `s01` (`interact`):** Tương tác với Đức tại `itr.thcs.snack_cart` (xe quà vặt).
- **Bước `s02` (`minigame`):** Trò chơi `mg_bottle_flip` (lật chai nước đứng thăng bằng).
- **Phần thưởng:** Mảnh sticker `frag.d.g08.01.05` -> Ô `alb.d.g08.01.05`.

---

## 3. Album Trang 5 (`page.d.g08.01`)
1. `alb.d.g08.01.01` (`main_photo`, slot 0): Bàn cờ caro dang dở trên bảng (`required_for_restore: true`).
2. `alb.d.g08.01.02` (`free_photo`, slot 1): Ảnh khai giảng lớp 8 dưới trời xanh.
3. `alb.d.g08.01.03` (`back_note`, slot 2): Lời đề từ "Đầu năm lớp 8: Chung lớp hết, ván caro 4-3 chưa xong".
4. `alb.d.g08.01.04` (`artifact`, slot 3): Hình hộp phấn giấy móp.
5. `alb.d.g08.01.05` (`sticker`, slot 4): Nhãn dán kỷ lục lật chai nước cổng trường (từ side quest).
