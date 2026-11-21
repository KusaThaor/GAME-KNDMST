# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 8 (MỐC 2: RÃ BĂNG)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** Số hóa Trang 8 (`d.g09.02`)  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4 APPROVED), `docs/gdd/01_NARRATIVE_AND_SCENES.md` §4, `02_GAMEPLAY_AND_MECHANICS.md` §2.4.4, §2.4.6  
> **Trạng thái:** Nháp, chờ duyệt  

---

## 1. Thông tin chung Trang 8 (`d.g09.02`)
- **Tên:** Trang 8: Rã băng (Học kỳ II lớp 9, Tháng 1 & 3/2018)
- **Map:** `map_thcs` (variant `g07`)
- **Kỷ vật dẫn vào:** `art_m2_04` (Tờ lịch ngày 27 tháng 1 năm 2018 khoanh đỏ ghi CHUNG KẾT)
- **Hook 2026:** `{player_name}` (2026): "Ngày 27… À. Cái chiều cả tiệm tạp hóa la muốn sập mái."
- **Xưng hô:** Đức: "mày - tao"; Châu: "tui - {g:ông|bà}"; Quân: "cậu - tớ"; Hạ: xưng tên "Hạ".

---

## 2. Bảng đối chiếu từng bước (Main: `q_m2_main_04`)

| Cảnh / Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung thoại & Logic số hóa |
|---|---|---|---|---|
| **Cảnh A · Bối cảnh**<br>27/1/2018, chung kết U23 | `cutscene` | `q_m2_main_04.s01` | Tiệm tạp hóa cổng trường (`itr.thcs.grocery`) | Dẫn bối cảnh tuyết trắng Thường Châu, người lớn con nít tập trung xem tivi, chú chủ tiệm khoanh lịch ngày 27. |
| **Cảnh A · Bước 1**<br>Tô cờ đỏ sao vàng | `minigame` (`game: mg_flag_color`) | `q_m2_main_04.s02` | `itr.thcs.grocery` | Giữ chuột tô cờ đỏ sao vàng cùng Hạ. |
| **Cảnh A · Bước 1**<br>Hạ vẽ sao lên má Quân | `talk` | `q_m2_main_04.s03` | `NPC_C`, `NPC_D` | Hạ: "Quân ngồi yên nha."<br>Quân: "…Nóng." |
| **Cảnh A · Bước 2**<br>Xếp ghế nhựa tiệm tạp hóa | `minigame` (`game: mg_chair_row`) | `q_m2_main_04.s04` | `itr.thcs.grocery` | Xếp 5 ghế ngồi sát nhau. Đức và Châu chỉ còn chỗ cạnh nhau, không ai đứng dậy. |
| **Cảnh A · Bước 3**<br>Cổ vũ theo nhịp | `minigame` (`game: mg_cheer_rhythm`) | `q_m2_main_04.s05` | `itr.thcs.grocery` | Bấm phím theo nhịp trống cổ vũ của cả xóm. |
| **Cảnh A · Bước 3**<br>Cảm xúc trận đấu | `talk` | `q_m2_main_04.s06` | `NPC_A`, `NPC_B` | Đức: "Ê! Đội mình đá hay quá trời!"<br>Châu: "…Tui không phải đang cười với ông. Tui cười với tình hình."<br>Đức: "Ừ ừ. Tình hình đỉnh thiệt."<br>Đức: "Thua mà sao tao muốn la quá."<br>Châu: "…Ừ. Tui cũng vậy." |
| **Cảnh A · Bước 4**<br>Chụp ảnh trước tivi | `photo` (`mode: auto`) | `q_m2_main_04.s07` | `cam.d0902.tv` | Nhờ chú chủ tiệm bấm giùm ảnh 5 đứa trước màn hình tivi (`alb.d.g09.02.02`). |
| **Cảnh A · Bước 4**<br>Xin tờ lịch kỷ vật | `talk` | `q_m2_main_04.s08` | `NPC_A` | Đức: "Chú ơi, cho tụi con xin tờ lịch đó nha!"<br>Chú chủ tiệm: "Tháng này còn mấy bữa, lấy đi mấy đứa."<br>Đức đưa Player: "Mày giữ. Mày giữ đồ kỹ nhất." |
| **Cảnh B · Bối cảnh**<br>Hội trại lớp 9 tháng 3 | `cutscene` | `q_m2_main_04.s09` | Sân trường dựng trại (`zone.thcs.yard`) | Hai tháng sau. Hội trại lớp 9, cắm cọc dựng lều, chiều ngả sang tối.<br>Châu vẽ sơ đồ, Đức đòi cổng tên lửa, Hạ thích cổng lá, Quân bê cọc. |
| **Cảnh B · Bước 1**<br>Chọn kiểu cổng trại | `choice` | `q_m2_main_04.s10` | Sân trường | Lựa chọn (`c_m2_08_camp_gate`):<br>• `rocket`: Cổng tên lửa (`m2.gate=rocket`)<br>• `leaf`: Cổng chiếc lá (`m2.gate=leaf`)<br>• `regular`: Cổng thường (`m2.gate=regular`) |
| **Cảnh B · Bước 1**<br>Đặt đồ lên bàn trại | `interact` | `q_m2_main_04.s11` | `itr.thcs.stone_bench` | Đặt bút xoay Đức, thước Châu, bình nước Quân, bookmark Hạ, máy ảnh Player. |
| **Cảnh B · Bước 2**<br>Chọn chỗ ngồi quanh than | `choice` | `q_m2_main_04.s12` | Bếp than | Lựa chọn ngồi cạnh Đức hay Châu (`c_m2_08_sit_side`). |
| **Cảnh B · Bước 2**<br>Lời xin lỗi và tâm sự | `talk` | `q_m2_main_04.s13` | Cả nhóm | Đức xin lỗi vụ báo tường, kể chuyện nhà sắp dọn đi.<br>Châu nhận lỗi nóng tính. Nếu Player đã nói thật ở Trang 7: Châu nhớ lại câu nói của Player (`m2.player_honest`).<br>Quân nướng bắp chia cho nhóm.<br>Hạ lo sợ sang năm chung trường với Player rồi quên ba bạn kia. |
| **Cảnh B · Bước 2**<br>Đáp lại nỗi sợ chia xa | `choice` | `q_m2_main_04.s14` | Bếp than | Lựa chọn (`c_m2_08_campfire_reply`):<br>• "Mình sợ lớn lên ai cũng bận..."<br>• "Vậy mình rủ. Tháng nào mình cũng rủ."<br>• (Không nói, gắp thêm cục than) |
| **Cảnh B · Bước 2**<br>Lời hẹn dưới lửa trại | `talk` | `q_m2_main_04.s15` | `NPC_A`, `NPC_B` | Đức: "Vậy… đừng quên. Dễ mà."<br>Châu: "Không dễ. Nhưng ghi lại thì nhớ." |
| **Cảnh B · Bước 3**<br>Ảnh quanh ánh lửa trại | `photo` (`mode: timer`) | `q_m2_main_04.s16` | `cam.d0902.campfire` | Đặt máy ảnh lên khúc gỗ, hẹn giờ chạy vào khung, phía sau là lửa trại chung (`alb.d.g09.02.01`, required: true). |
| **Cảnh C · Dọn trại**<br>Sáng hôm sau | `interact` | `q_m2_main_04.s17` | `itr.thcs.duty_spot` | Mang cọc lều cất góc sân cùng Quân. Đức dặn: "Mai tụi mình lại ra Căn cứ nghen!" |
| **Cảnh C · Ra về**<br>Đi qua cổng trường | `goto` | `q_m2_main_04.s18` | `itr.thcs.snack_cart` | Năm đứa đi qua cổng trường, kết thúc Trang 8. |

---

## 3. Nhiệm vụ phụ & Album Trang 8
- **Side quest `q_m2_side_04`:** "Bắp nướng Hội trại" cùng Quân bên bếp than nhỏ.
- **Album Trang 8 (`page.d.g09.02`):**
  1. `alb.d.g09.02.01` (`main_photo`, slot 0): Ảnh năm đứa quanh ánh lửa trại đêm (`required_for_restore: true`).
  2. `alb.d.g09.02.02` (`free_photo`, slot 1): Ảnh trước tivi tiệm tạp hóa cổ vũ U23.
  3. `alb.d.g09.02.03` (`artifact`, slot 2): Tờ lịch 27/1/2018 khoanh đỏ (`required_for_restore: true`).
  4. `alb.d.g09.02.04` (`sticker`, slot 3): Lá cờ giấy tô sáp màu (`required_for_restore: true`).
  5. `alb.d.g09.02.05` (`sticker`, slot 4): Bắp nướng than hồng của Quân (từ side quest).
