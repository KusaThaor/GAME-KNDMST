# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 6 (MỐC 2: VALENTINE — HÒM THƯ CỦA NĂM ĐỨA)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** Số hóa Trang 6 (`d.g08.02`)  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.5 APPROVED 21/11), `docs/gdd/IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md`, `01_NARRATIVE_AND_SCENES.md` §4, `02_GAMEPLAY_AND_MECHANICS.md` §2.5  
> **Trạng thái:** Nháp, chờ duyệt  

---

## 1. Thông tin chung Trang 6 (`d.g08.02`)
- **Tên:** Trang 6: Valentine — Hòm thư của năm đứa (Sau Tết lớp 8, Tháng 2/2017)
- **Map:** `map_thcs` (variant `g07`)
- **Open zones:** `zone.thcs.base`, `zone.thcs.corridor`, `zone.thcs.classroom`, `zone.thcs.yard`, `zone.thcs.gate`, `zone.thcs.field`
- **Kỷ vật dẫn vào:** `art_m2_02` (Tờ giấy vẽ chiếc lá bút chì của Hạ, góc ghi "Chưa dám đưa")
- **Hook 2026:** `{player_name}` (2026): "Chiếc lá của Hạ… Hạ nhờ mình giữ từ hồi lớp 8. Tới giờ mình vẫn chưa biết là vẽ cho ai."
- **Quy tắc xưng hô:** Đức: "mày - tao"; Châu: "tui - {g:ông|bà}"; Quân: "cậu - tớ"; Hạ: xưng tên "Hạ".

---

## 2. Bảng đối chiếu từng bước (Main: `q_m2_main_02`)

| Cảnh / Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung thoại & Logic số hóa |
|---|---|---|---|---|
| **Cảnh A · Bối cảnh**<br>Thứ Năm 9/2: Đọc confession | `cutscene` | `q_m2_main_02.s01` | Căn cứ (`zone.thcs.base`) | Đức mang điện thoại cũ vào trường, đọc các bài đăng confession. Hạ: "Gửi ẩn danh thì dễ nói thật hơn ha." |
| **Cảnh A · Bước 1**<br>Bị trêu lần 1 ở hành lang | `cutscene` | `q_m2_main_02.s02` | Hành lang (`zone.thcs.corridor`) | Bài confession gửi "bạn thư viện". Đức đoán ra Hạ và la to trêu. Hạ đỏ mặt bỏ về lớp. |
| **Cảnh A · Bước 1**<br>Bị trêu lần 2: Vẽ bảng | `choice` | `q_m2_main_02.s03` | Lớp học (`zone.thcs.classroom`) | Đức vẽ lá và trái tim lên góc bảng. Player chọn can ngăn (`c_m2_06_stop_duc`). |
| **Cảnh A · Bước 1**<br>Cô Diệp phạt quét sân | `talk` | `q_m2_main_02.s04` | `NPC_A` tại lớp học | Đức: "Tao vẽ có tình cảm lắm đó nha."<br>Cô Diệp phạt Đức thứ Sáu ở lại quét sân. |
| **Cảnh A · Bước 1**<br>Bị trêu lần 3 ở ghế đá | `talk` | `q_m2_main_02.s05` | `NPC_A`, `NPC_D`, `NPC_B` tại ghế đá | Đức trêu lần 3. Hạ bỏ đi. Quân cản Đức: "Đức. Dừng lại." Châu đếm đủ 3 lần, triệu tập họp khẩn sau giờ học. |
| **Cảnh A · Bước 2**<br>Kế hoạch xin lỗi tại Căn cứ | `cutscene` | `q_m2_main_02.s06` | Căn cứ | Châu vạch 4 bước xin lỗi đàng hoàng. Đức đồng ý viết ra giấy để không lỡ lời. Châu dặn mai ra chơi viết. |
| **Cảnh A · Bước 3**<br>Tìm Hạ ở gốc phượng | `goto` | `q_m2_main_02.s07` | `itr.thcs.stone_bench` | Ra gốc phượng tìm Hạ. |
| **Cảnh A · Bước 3**<br>Tâm sự với Hạ | `talk` | `q_m2_main_02.s08` | `NPC_C` | Hạ buồn vì gửi ẩn danh tưởng an toàn nhưng cả lớp đã biết. |
| **Cảnh A · Bước 3**<br>Lựa chọn an ủi Hạ | `choice` | `q_m2_main_02.s09` | `NPC_C` | Chọn cách an ủi (`c_m2_06_comfort_ha`): Không kể ai / Đức không có ý xấu / Ngồi im bên cạnh. |
| **Cảnh A · Bước 3**<br>Gửi gắm chiếc lá | `talk` | `q_m2_main_02.s10` | `NPC_C` | Hạ nhờ Player giữ tờ vẽ chiếc lá "Chưa dám đưa". |
| **Cảnh A · Bước 3**<br>Kẹp tờ vẽ vào sổ | `interact` | `q_m2_main_02.s11` | `itr.thcs.stone_bench` | Kẹp vào cuốn sổ nhỏ của Player (mở khóa kỷ vật `art_m2_02`). |
| **Cảnh B · Bối cảnh**<br>Thứ Sáu 10/2: Rủ làm hòm thư | `cutscene` | `q_m2_main_02.s12` | Căn cứ | Đức đề xuất làm hòm thư riêng cho nhóm để gửi thư Valentine tình bạn. Châu đặt nội quy 3 điều. Quân gia cố đáy, Hạ làm ngăn chung. |
| **Cảnh B · Bước 1**<br>Làm hòm thư 5 bước | `minigame` (`game: mg_mailbox_craft`) | `q_m2_main_02.s13` | Căn cứ | Kéo dán giấy, chọn màu nền, trang trí, gắn khe và bảng nội quy 3 điều. |
| **Cảnh B · Bước 2**<br>Đức hỏi câu mở đầu thư | `talk` | `q_m2_main_02.s14` | `NPC_A` | Đức: "{player_name}, mày coi giùm tao. Câu đầu viết sao?" |
| **Cảnh B · Bước 2**<br>Chọn câu đầu thư xin lỗi | `choice` | `q_m2_main_02.s15` | `NPC_A` | Chọn câu mở đầu (`c_m2_06_apology_opener`): "Hạ, tao xin lỗi" / "Hạ, tao sai rồi" / "Hạ, tao nợ mày một lời xin lỗi". |
| **Cảnh B · Bước 2**<br>Viết thư xin lỗi | `minigame` (`game: mg_apology_letter`) | `q_m2_main_02.s16` | Căn cứ | Lật từng dòng thư xin lỗi chân thành của Đức và bỏ vào khe ngăn riêng của Hạ. |
| **Cảnh B · Bước 3**<br>Hạ đọc thư và nhận lỗi | `talk` | `q_m2_main_02.s17` | `NPC_B`, `NPC_A`, `NPC_C` | Hạ đọc thư riêng ở góc hiên. Đức hứa giữ lời. Hạ nhận lời xin lỗi. Châu ghi sổ hoàn thành. |
| **Cảnh B · Bước 4**<br>Đức quét sân chịu phạt | `cutscene` | `q_m2_main_02.s18` | Sân trường | Tan học thứ Sáu. Tú hỏi gặng nhưng Đức dứt khoát giữ lời không kể. Đức tạo dáng phong độ. |
| **Cảnh B · Bước 4**<br>Chụp ảnh Đức cầm chổi | `photo` (`mode: handheld`) | `q_m2_main_02.s19` | `cam.d0802.sweep` | Chụp Đức chịu phạt có phong độ (`alb.d.g08.02.02`, ảnh phụ). |
| **Cảnh C · Bối cảnh**<br>Thứ Hai 13/2: Tiết Toán | `cutscene` | `q_m2_main_02.s20` | Lớp học | Quân gập bài kiểm tra 15 phút, cúi mặt. |
| **Cảnh C · Bước 1**<br>Mở lời với Quân | `choice` | `q_m2_main_02.s21` | `NPC_D` | Chọn cách tiếp cận khéo léo (`c_m2_06_talk_quan`). |
| **Cảnh C · Bước 1**<br>Giảng Toán & ném rổ | `talk` | `q_m2_main_02.s22` | `NPC_D` | Quân vẽ mặt cười vào lề tờ nháp tặng Player. Trên bảng ghi lịch mở hòm thư 14/2. |
| **Cảnh D · Bối cảnh**<br>Thứ Ba 14/2: Valentine | `cutscene` | `q_m2_main_02.s23` | Căn cứ | Sáng 14/2, hòm thư Valentine sẵn sàng nhận thư. |
| **Cảnh D · Bước 1**<br>Chọn người nhận thư | `choice` | `q_m2_main_02.s24` | Hòm thư | Chọn Đức / Châu / Quân / Hạ / Cả nhóm (`c_m2_06_recipient`). |
| **Cảnh D · Bước 1**<br>Chọn loại thư | `choice` (`measured: true`) | `q_m2_main_02.s25` | Hòm thư | Cảm ơn (`gentle`) / Trêu chọc (`playful`) / Rủ làm việc chung (`deep`). |
| **Cảnh D · Bước 1**<br>Bỏ thư vào hòm | `minigame` (`game: mg_letter_picker`) | `q_m2_main_02.s26` | Căn cứ | Chọn câu viết sẵn và thả thư vào khe. |
| **Cảnh D · Bước 2**<br>Giờ ra chơi mở thư riêng | `talk` | `q_m2_main_02.s27` | Từng bạn | Mỗi người tự mở ngăn riêng, phản ứng vui vẻ xúc động đúng tính cách. |
| **Cảnh D · Bước 3**<br>Ném bóng cùng Quân | `minigame` (`game: mg_ball_toss`) | `q_m2_main_02.s28` | Sân rổ | Thử thách ném bóng rổ 3 vòng nạp lực. |
| **Cảnh D · Bước 3**<br>Săn góc ảnh cùng Hạ | `minigame` (`game: mg_photo_hunt`) | `q_m2_main_02.s29` | Sân trường | Chụp ảnh lưới 3x3 theo bố cục Hạ hướng dẫn. |
| **Cảnh D · Bước 3**<br>Trang trí Căn cứ | `minigame` (`game: mg_base_decor`) | `q_m2_main_02.s30` | Căn cứ | Đặt 4 nhóm vật phẩm trang trí Căn cứ buổi chiều. |
| **Cảnh D · Bước 4**<br>Hoàng hôn: Mở hòm thư | `cutscene` | `q_m2_main_02.s31` | Căn cứ | Đọc thư chung của 4 bạn. Đức nhắc nội quy số 2. Cả nhóm cùng cảm nhận sự ấm áp của tình bạn. |
| **Cảnh D · Bước 5**<br>Ảnh nhóm bên hòm thư | `photo` (`mode: timer`) | `q_m2_main_02.s32` | `cam.d0802.mailbox` | Chụp ảnh hẹn giờ đủ 5 người bên cạnh hòm thư Valentine (`alb.d.g08.02.01`, ảnh chính). |

---

## 3. Nhiệm vụ phụ & Album Trang 6
- **Side quest `q_m2_side_03`:** "Kẹo ngọt xe quà vặt" mua kẹo socola trái tim chia cho cả nhóm.
- **Album Trang 6 (`page.d.g08.02`):**
  1. `alb.d.g08.02.01` (`main_photo`, slot 0): Bức ảnh kỷ niệm năm đứa bên hòm thư Valentine (`required_for_restore: true`).
  2. `alb.d.g08.02.02` (`free_photo`, slot 1): Đức cầm chổi quét sân chịu phạt.
  3. `alb.d.g08.02.03` (`artifact`, slot 2): Tờ giấy vẽ chiếc lá bút chì của Hạ (`required_for_restore: true`).
  4. `alb.d.g08.02.04` (`back_note`, slot 3): Lời đề từ "Hòm thư tình bạn của năm đứa, Valentine lớp 8" (`required_for_restore: true`).
  5. `alb.d.g08.02.05` (`sticker`, slot 4): Tờ nháp vẽ mặt cười của Quân (từ side quest).
