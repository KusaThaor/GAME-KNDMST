# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 9 (MỐC 2: VẪN ĐỦ NĂM ĐỨA)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** Số hóa Trang 9 (`d.g09.03`) và Kết thúc Demo Mốc 2  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4 APPROVED), `docs/gdd/01_NARRATIVE_AND_SCENES.md` §4, `02_GAMEPLAY_AND_MECHANICS.md` §2.4.6  
> **Trạng thái:** Nháp, chờ duyệt  

---

## 1. Thông tin chung Trang 9 (`d.g09.03`)
- **Tên:** Trang 9: Vẫn đủ năm đứa (Cuối lớp 9, Tháng 5/2018)
- **Map:** `map_thcs` (variant `g07`)
- **Kỷ vật dẫn vào:** `art_m2_05` (Cuốn sổ lưu bút bìa nâu kraft)
- **Hook 2026:** `{player_name}` (2026, mở trang đầu): "Chữ ký của Đức… còn xoay một vòng ở cuối."
- **Xưng hô:** Đức: "mày - tao"; Châu: "tui - {g:ông|bà}"; Quân: "cậu - tớ"; Hạ: xưng tên "Hạ".

---

## 2. Bảng đối chiếu từng bước (Main: `q_m2_main_05`)

| Cảnh / Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung thoại & Logic số hóa |
|---|---|---|---|---|
| **Cảnh A · Bối cảnh**<br>Sau lễ bế giảng lớp 9 | `cutscene` | `q_m2_main_05.s01` | Sân trường (`zone.thcs.yard`) | Cả khối ùa ra ký áo nhau, xin lưu bút. Bảng đếm ngược còn một con số nhỏ. |
| **Cảnh A · Bước 1**<br>Ký áo và viết lưu bút | `minigame` (`game: mg_sign_shirt`) | `q_m2_main_05.s02` | Sân trường | Bốn bạn ký áo và viết lưu bút cho nhau (Đức xoay vòng chữ ký, Quân ký to ở lưng, Châu gạch 4 màu, Hạ kẹp lá ép vẽ lá trên áo). |
| **Cảnh A · Bước 1**<br>Lưu bút cô Diệp | `talk` | `q_m2_main_05.s03` | `NPC_A` tại sân trường | Đức: "Cô ơi, cô đừng khóc nha! Con xin lỗi vụ slime!"<br>Cô Diệp: "Lớp này ồn nhất cô từng dạy."<br>Cô viết vào sổ: "Cảm ơn em mấy tấm ảnh lớp. Mà tấm nào cũng thiếu em đó." |
| **Cảnh B · Bước 1**<br>Đến Căn cứ dọn dẹp | `goto` | `q_m2_main_05.s04` | `itr.thcs.old_table` ở Căn cứ | Chiều vắng, nắng nghiêng qua mái che. |
| **Cảnh B · Bước 1**<br>Hạ tìm thấy sổ luật | `talk` | `q_m2_main_05.s05` | `NPC_C`, `NPC_B` | Hạ: "Mọi người ơi… sổ luật nè."<br>Châu: "Điều 5 xong rồi bỏ trống luôn."<br>Hạ trao xấp ảnh, thuyền giấy, biển tên: "{player_name} giữ nha. Người chụp thì giữ." |
| **Cảnh B · Bước 2**<br>Bi ve mắt mèo & đổi trường | `talk` | `q_m2_main_05.s06` | `NPC_A`, `NPC_D`, `NPC_B` | Đức chia bi ve mắt mèo: "Mỗi đứa một viên. Cầm lên nhìn qua mắt mèo thì thấy tụi mày. Tao nói thật đó."<br>Đức báo tin dọn nhà, chuyển nguyện vọng sang trường gần chợ chung với Quân. Châu lặng người xúc động. |
| **Cảnh C · Bước 1**<br>Ra gốc phượng hoàng hôn | `goto` | `q_m2_main_05.s07` | `itr.thcs.stone_bench` | Cả nhóm ra ghế đá dưới gốc phượng. |
| **Cảnh C · Bước 1**<br>Thảo luận Điều 6 | `talk` | `q_m2_main_05.s08` | `NPC_B`, `NPC_A`, `NPC_D` | Châu: "Điều 6. Gặp nhau ít nhất mỗi tháng. Được dời, không được hủy."<br>Đức: "Thêm: đứa nào trễ thì bao trà sữa." (6.1)<br>Đức: "Thêm nữa: đứa nào học trường xa nhất phải kể chuyện lạ nhất. …Tức là mày đó, Châu." (6.2)<br>Châu: "Tui biết."<br>Quân: "…Cần bê gì thì gọi." (6.3)<br>Hạ ghi 6.4 (Ai im lâu cả nhóm tới ngồi cạnh).<br>Châu đưa sổ cho Player: "Sổ này {g:ông\|bà} giữ. Tui mà giữ là tui sửa chính tả hoài." |
| **Cảnh C · Bước 1**<br>Ký Điều 6 | `minigame` (`game: mg_rule6`) | `q_m2_main_05.s09` | `itr.thcs.stone_bench` | Người chơi ghi 6.5 (Chụp ảnh phải đủ người), cả 5 đứa ký tên. |
| **Cảnh C · Bước 2**<br>Chọn kiểu ảnh cuối cùng | `choice` (`measured: true`) | `q_m2_main_05.s10` | Ghế đá gốc phượng | Lựa chọn phong cách ảnh (`c_m2_09_main_photo`):<br>• `standard` (`gentle`): Tấm chuẩn nghiêm trang (`m2.photo_style=standard`)<br>• `funny` (`playful`): Tấm Đức làm mặt hề (`m2.photo_style=funny`)<br>• `candid` (`deep`): Tấm cả năm đứa cười tự nhiên không nhìn máy (`m2.photo_style=candid`) |
| **Cảnh C · Bước 2**<br>Chụp ảnh hẹn giờ | `photo` (`mode: timer`) | `q_m2_main_05.s11` | `cam.d0903.farewell` | Quân cõng Đức chạy vào khung hình, chụp đủ năm đứa (`alb.d.g09.03.01`, required: true). |
| **Cảnh C · Bước 3**<br>Mở bản A5 điền ô trống | `talk` | `q_m2_main_05.s12` | `NPC_D`, `NPC_A`, `NPC_C` | Quân: "Nặng thiệt… mà được rồi."<br>Đức: "Ê! Tao mà không vô là mất nửa tấm ảnh nghen!"<br>Hạ: "Còn dư sáp nè. Ô trống đó. Giờ điền được rồi." |
| **Cảnh C · Bước 3**<br>Ấn 5 dấu vân tay sáp | `minigame` (`game: mg_fingerprint`) | `q_m2_main_05.s13` | Gốc phượng | Từng người ấn dấu tay màu sáp: Hạ (xanh lá), Châu (đỏ), Quân (vàng), Đức (xanh dương), Player (nâu). |
| **Cảnh C · Bước 3**<br>Sửa xong lỗi bố cục | `talk` | `q_m2_main_05.s14` | `NPC_B` | Châu: "Lỗi bố cục… cuối cùng cũng sửa xong." |
| **Cutscene**<br>Cuối hè: Ba ngã rẽ | `cutscene` | `q_m2_main_05.s15` | Ba cổng trường cấp 3 | 1. Hạ chờ Player cùng vào trường công lập.<br>2. Quân chở Đức tới trường bên chợ.<br>3. Châu nhận tin nhắn của Đức ở trường Chuyên: "Tháng này hẹn ngày nào?"<br>Chạm viên bi mắt mèo vào cột cổng. Kết thúc Trang 9. |

---

## 3. Kết thúc Demo Mốc 2 (Hub 2026)
- **Quest `q_hub_pd_05`:** Lật trang cuối sổ luật Căn cứ trên kệ sách (`itr.hub.shelf`). `{player_name}`: "Được dời, không được hủy…"
- **Quest `q_hub_pd_06`:** Mở điện thoại, gửi tin nhắn vào nhóm chat cũ `thread.old_group`:
  - `caro` (`playful`): "Ê. Ván caro hồi lớp 8 vẫn đang 4–3 đó nha. Ai gỡ?"
  - `rules` (`gentle`): "Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?"
  - `rule6` (`deep`): "Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha."
- **Thông báo kết demo:** "Đã gửi." → "(còn tiếp)" → Cảm ơn bạn đã trải nghiệm Bản Demo "Hành Trình Thanh Xuân"!

---

## 4. Nhiệm vụ phụ & Album Trang 9
- **Side quest `q_m2_side_05`:** "Kỷ niệm bi mắt mèo" tại `itr.thcs.marble_spot`.
- **Album Trang 9 (`page.d.g09.03`):**
  1. `alb.d.g09.03.01` (`main_photo`, slot 0): Ảnh đủ năm đứa cuối cấp 2 (`required_for_restore: true`).
  2. `alb.d.g09.03.02` (`artifact`, slot 1): Cuốn sổ lưu bút bìa nâu kraft (`required_for_restore: true`).
  3. `alb.d.g09.03.03` (`back_note`, slot 2): Trang sổ Điều 6 "Được dời, không được hủy" (`required_for_restore: true`).
  4. `alb.d.g09.03.04` (`sticker`, slot 3): Chiếc áo trắng học trò đầy chữ ký.
  5. `alb.d.g09.03.05` (`sticker`, slot 4): Viên bi ve mắt mèo trong veo (từ side quest).
