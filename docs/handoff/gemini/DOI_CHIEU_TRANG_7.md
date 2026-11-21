# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 7 (MỐC 2: TỜ BÁO TƯỜNG CUỐI CÙNG)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** Số hóa Trang 7 (`d.g09.01`)  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4 APPROVED), `docs/gdd/01_NARRATIVE_AND_SCENES.md` §4, `02_GAMEPLAY_AND_MECHANICS.md` §2.2, §2.4.6  
> **Trạng thái:** Nháp, chờ duyệt  

---

## 1. Thông tin chung Trang 7 (`d.g09.01`)
- **Tên:** Trang 7: Tờ báo tường cuối cùng (Học kỳ I lớp 9, 2017)
- **Map:** `map_thcs` (variant `g07`)
- **Kỷ vật dẫn vào:** `art_m2_03` (Bản báo tường thu nhỏ A5 có một ô trống nhòe vệt sáp màu)
- **Hook 2026:** `{player_name}` (2026): "Ô này… sao lem màu vầy ta? Hồi đó tụi mình định dán gì vô?"
- **Xưng hô:** Đức: "mày - tao"; Châu: "tui - {g:ông|bà}"; Quân: "cậu - tớ"; Hạ: xưng tên "Hạ".

---

## 2. Bảng đối chiếu từng bước (Main: `q_m2_main_03`)

| Cảnh / Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung thoại & Logic số hóa |
|---|---|---|---|---|
| **Cảnh A · Bối cảnh**<br>Đầu năm lớp 9, bảng đếm ngược 270 | `cutscene` | `q_m2_main_03.s01` | Lớp học (`zone.thcs.classroom`) | Cô Diệp phát phiếu nguyện vọng, thu slime của Đức: "Đồ chơi dính này để ngoài lớp nghen." |
| **Cảnh A · Bước 1**<br>Hỏi nguyện vọng Châu | `talk` | `q_m2_main_03.s02` | `NPC_B` tại lớp học | Châu: "Trường Chuyên. Không phải 'muốn'. Là 'phải'." |
| **Cảnh A · Bước 1**<br>Hỏi nguyện vọng Quân | `talk` | `q_m2_main_03.s03` | `NPC_D` tại lớp học | Quân: "Tớ… trường gần chợ thôi. Điểm tớ vậy là vừa." |
| **Cảnh A · Bước 1**<br>Hỏi nguyện vọng Đức | `talk` | `q_m2_main_03.s04` | `NPC_A` tại lớp học | Đức: "Năng khiếu! Tao vẽ, tao diễn, tao— mà nhà tao đang tính chuyện gì đó, chưa biết. Thôi, cả đám cùng thi một trường đi!" |
| **Cảnh A · Bước 1**<br>Hỏi nguyện vọng Hạ | `talk` | `q_m2_main_03.s05` | `NPC_C` tại lớp học | Hạ: "Trường công gần nhà. Có cây phượng thì tốt." |
| **Cảnh A · Minigame**<br>Sudoku giấy tập | `minigame` (`game: mg_sudoku`) | `q_m2_main_03.s06` | Lớp học | Giải câu đố Sudoku trên giấy kẻ ô trong 6 phút (đua với Châu). |
| **Cảnh A · Bước 2**<br>Điền phiếu khảo sát | `choice` | `q_m2_main_03.s07` | Lớp học | Chọn lý do (`c_m2_07_reason`):<br>• `near_home`: "Gần nhà."<br>• `parents`: "Ba mẹ muốn vậy."<br>• `random`: "Chưa biết, ghi đại." |
| **Cảnh A · Bước 2**<br>Nộp phiếu cho cô | `talk` | `q_m2_main_03.s08` | `NPC_C` | Hạ (liếc phiếu Player): "Ủa… vậy mình chung." |
| **Cảnh B · Bước 1**<br>Làm báo tường 20/11 | `minigame` (`game: mg_wall_paper`) | `q_m2_main_03.s09` | `itr.thcs.wall_news` | Ghép các phần: tiêu đề Hạ, khung Châu, viền Quân, góc cười Đức, ảnh Player. |
| **Cảnh B · Bước 2**<br>Tranh cãi nhóm | `talk` | `q_m2_main_03.s10` | `NPC_A`, `NPC_B`, `NPC_C`, `NPC_D` | Đức đề xuất tiêu đề "Một trường, năm đứa". Cả nhóm cãi nhau vì bất đồng chọn trường cấp 3. Hạ can ngăn. |
| **Cảnh B · Bước 2**<br>Phản ứng của Player | `choice` (`measured: true`) | `q_m2_main_03.s11` | Cả nhóm | Lựa chọn (`c_m2_07_reaction`):<br>• `silence` (`gentle`): Im lặng, đưa chổi cho Quân quét giấy vụn<br>• `honest` (`deep`): "Mình cũng sợ… sợ mất mọi người." (Lưu cờ `m2.player_honest=true`, dùng ở lửa trại Trang 8) |
| **Cảnh C · Bước 1**<br>Tìm Châu ở Căn cứ | `goto` | `q_m2_main_03.s12` | `itr.thcs.old_table` ở Căn cứ | Châu nhận điểm 8,75 ngồi một mình. Biểu tượng máy ảnh mờ "Không chụp". |
| **Cảnh C · Bước 1**<br>Lựa chọn an ủi Châu | `choice` | `q_m2_main_03.s13` | `NPC_B` tại Căn cứ | Chọn cách cư xử (`c_m2_07_comfort`): Ngồi im đưa khăn giấy / "Bà ổn không?" / "Điểm số đâu phải là bà." |
| **Cảnh C · Bước 1**<br>Châu đưa bút highlight | `talk` | `q_m2_main_03.s14` | `NPC_B` | Châu: "Tui ngồi năm phút thôi... Ba mẹ tui chưa biết điểm này. Cầm giùm tui. Tui cầm nó là lại muốn tô. Cảm ơn. Đừng kể ai nghen." |
| **Cảnh C · Bước 2**<br>Hoàn thành báo tường | `cutscene` | `q_m2_main_03.s15` | Bảng tin lớp | Góc cười của Đức: "Hôm nay không có chuyện cười."<br>Góc dưới còn trống một ô để dành. |
| **Cảnh C · Bước 3**<br>Chụp ảnh báo tường | `photo` (`mode: handheld`) | `q_m2_main_03.s16` | `cam.d0901.newspaper` | Chụp báo tường với tay của 4 bạn ở 4 góc (`alb.d.g09.01.01`, required: true). |
| **Cảnh C · Bước 4**<br>Chép lại bản A5 | `interact` | `q_m2_main_03.s17` | `itr.thcs.wall_news` | Chép bố cục vào tờ A5 gấp đôi, kẹp vào sổ nhỏ. Hoàn thành Trang 7. |

---

## 3. Nhiệm vụ phụ & Album Trang 7
- **Side quest `q_m2_side_02`:** "Khảo sát báo tường các lớp" tại hành lang và bảng tin.
- **Album Trang 7 (`page.d.g09.01`):**
  1. `alb.d.g09.01.01` (`main_photo`, slot 0): Tờ báo tường 20/11 có ô trống (`required_for_restore: true`).
  2. `alb.d.g09.01.02` (`artifact`, slot 1): Bản báo tường thu nhỏ A5 (`required_for_restore: true`).
  3. `alb.d.g09.01.03` (`back_note`, slot 2): Lời đề từ "Tờ báo tường cuối cùng của cấp 2: Ô trống để dành" (`required_for_restore: true`).
  4. `alb.d.g09.01.04` (`sticker`, slot 3): Cây bút highlight vàng của Châu.
  5. `alb.d.g09.01.05` (`sticker`, slot 4): Bảng đếm ngược 197 ngày (từ side quest).
