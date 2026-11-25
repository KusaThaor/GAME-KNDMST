# SỐ HÓA TOÀN BỘ NARRATIVE & TẢ CẢNH MỐC 1 (HUB 2026 & TRANG 1–4)
> **Dự án:** "Vùng Ký Ức" (KNĐMST) — Mốc 1: Căn cứ đầu tiên (Lớp 6–7)  
> **Tài liệu nguồn:** Quyết định phê duyệt 25/11 của Chủ dự án & `TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md`  
> **Trạng thái:** `NARRATIVE_APPROVED` · `READY_FOR_IMPLEMENTATION`  
> **Nguyên tắc kỹ thuật:** Số hóa riêng biệt toàn bộ câu dẫn/tả cảnh hệ thống, **không gộp vào bong bóng thoại nhân vật**, phân kênh UI rõ ràng.

---

## I. NGUYÊN TẮC HIỂN THỊ TRỰC QUAN (5 KÊNH UI)

Theo chỉ đạo của Chủ dự án và quyết định số 3:
1. **Quy tắc phối hợp Song Hành (Pairing):** Khi tương tác đồ vật hoặc sự kiện Hub, **kết hợp cả 2 lớp**:
   - Dải dẫn chuyện hệ thống (`narrator_overlay`): Miêu tả cảm quan trực quan món đồ (không avatar, chữ nghiêng).
   - Thoại độc thoại của người chơi (`speaker: 'player'`): Bật ngay sau đó để bộc lộ cảm xúc hoài niệm cá nhân.
   - *Trường hợp engine chỉ nhận 1 dòng text:* Ưu tiên chạy dòng độc thoại của người chơi đã duyệt ở `TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md`.
2. **Hệ thống 5 kênh hiển thị trực quan:**

```
+-----------------------------------------------------------------------------------+
| 1. TITLE_CARD        : Thẻ chữ tiêu đề giữa màn hình (fade in/out 2.5-3s, nền mờ) |
| 2. NARRATOR_OVERLAY  : Dải phụ đề dẫn chuyện hệ thống (đáy màn hình, chữ nghiêng) |
| 3. MINIGAME_CARD     : Thẻ quy tắc / gợi ý luật minigame (khung pop-up 3 dòng)    |
| 4. HUD_OBJECTIVE     : Mục tiêu nhiệm vụ góc trên màn hình (nhắc việc tự nhiên)   |
| 5. WORLD_EVENT       : Hiệu ứng thế giới / môi trường (ánh sáng, kệ đồ, âm thanh) |
+-----------------------------------------------------------------------------------+
```

---

## II. BẢNG SỐ HÓA CHI TIẾT TOÀN BỘ NARRATIVE MỐC 1

### 1. PHẦN MỞ ĐẦU: HUB PHÒNG TRỌ 2026 & MỞ HỘP KỶ VẬT 1

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `narr_hub_intro_01` | Mở đầu game | `NARRATOR_OVERLAY` | Vào game, sau khi chọn nhân vật | *Phòng trọ năm 2026. Buổi tối, ánh đèn bàn hắt lên một góc phòng tĩnh lặng.* | Tiếng mưa nhỏ hoặc quạt gió nhẹ, nhạc đệm piano hoài niệm |
| `narr_hub_intro_02` | Mở đầu game | `NARRATOR_OVERLAY` | 2.5 giây sau dòng 01 | *Trên sàn có một chiếc thùng carton cũ dán băng keo ngả vàng: "Đồ cũ – đừng vứt."* | Tiếng cựa mình, tiếng giấy carton sột soạt |
| `hud_hub_move_to_box` | Khám phá phòng | `HUD_OBJECTIVE` | Sau khi dứt 2 dòng mở đầu | `Kéo chuột quan sát · WASD bước tới chiếc thùng cũ góc phòng` | (Im lặng) |
| `hud_hub_open_box` | Đứng cạnh thùng | `HUD_OBJECTIVE` | Bước vào bán kính 1.5m quanh thùng | `Nhấn [E] để mở Hộp Kỷ Vật` | Tiếng sột soạt nhẹ |
| `narr_box_open_first` | Mở nắp thùng | `NARRATOR` + `PLAYER` | Người chơi tương tác mở nắp thùng lần đầu | • Narrator: *Chiếc thùng carton cũ phủ một lớp bụi mỏng. Mở nắp ra, mùi giấy cũ và năm tháng ùa về...*<br>• Player độc thoại: *"Toàn đồ hồi cấp hai… Vở cũ, khăn quàng đỏ, cả tấm ảnh lớp. Ủa, mẩu giấy gấp tư góc này… là cái gì đây ta?"* | Tiếng bóc băng keo/mở nắp bìa carton |
| `narr_decor_notebook` | Đồ nền thùng | `NARRATOR` + `PLAYER` | Bấm vào "Mấy cuốn vở cũ" | • Narrator: *Mấy cuốn vở ô ly từ hồi cấp hai, mép quăn queo, dán nhãn nắn nót tên lớp.*<br>• Player độc thoại: *"Vở bài tập lớp 6… Chữ mình hồi đó viết nghệch ngoạc ghê."* | Tiếng sột soạt lật trang giấy cũ |
| `narr_decor_scarf` | Đồ nền thùng | `NARRATOR` + `PLAYER` | Bấm vào "Chiếc khăn quàng đỏ" | • Narrator: *Chiếc khăn quàng đỏ đã bạc màu viền, vải nhăn nhúm nằm cuộn tròn dưới đáy thùng.*<br>• Player độc thoại: *"Khăn quàng đỏ nè… Hồi đó sáng nào quên đeo là bị sao đỏ ghi tên."* | Tiếng vải miết nhẹ |
| `narr_hub_hook_p1` | Cầm kỷ vật 1 | `NARRATOR` + `PLAYER` | Bấm vào Mẩu giấy mật lệnh số 01 | • Narrator: *Mẩu giấy gấp tư đầy hình vẽ mũi tên, nét mực tím nguệch ngoạc kèm dòng mực đỏ nắn nót: "Mật lệnh số 01 – Chỉ dành cho người đủ can đảm tham gia!"*<br>• Player độc thoại: *"Mật lệnh số 01… Mực đỏ này nhìn quen ghê, là chữ ai ta? Không biết ngày đó… tụi mình bắt đầu chơi chung từ lúc nào nhỉ?"* | Tiếng giấy gập mở |
| `narr_hub_trans_p1` | Chuyển cảnh Trang 1 | `WORLD_EVENT` | Người chơi bấm "Hồi tưởng" mẩu giấy 1 | *Tiếng ve hè xao xác và tiếng trống trường từ xa bỗng vọng lại. Ánh đèn bàn mờ dần, căn phòng tan vào nắng sớm rực rỡ của sân trường cấp 2...* | SFX tiếng ve hè + 3 tiếng trống trường rộn rã `tùng... tùng... tùng` -> Fade out trắng |

---

### 2. TRANG 1: MẬT LỆNH SỐ 01 (Lớp 6, Tháng 9/2014)

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `tc_p1_c1` | Cảnh 1: Cổng trường | `TITLE_CARD` | Sau khi màn hình sáng lên | **Ngày đầu lớp 6**<br>*Một buổi sáng tháng Chín, năm 2014* | Tiếng cười nói học sinh, tiếng bước chân |
| `hud_p1_c1_guide` | Cảnh 1: Bắt đầu | `HUD_OBJECTIVE` | Thẻ chữ mờ đi (hiện 5s tự tắt) | `Đi/chạy quanh sân · Bấm chuột/phím nói chuyện · Kéo chuột xoay góc nhìn` | (Im lặng) |
| `narr_p1_c1_drop` | Cảnh 1: Vở rơi | `NARRATOR_OVERLAY` | Đi được 5 bước qua cổng trường | *Một tiếng "bịch" vang lên phía sau. Cuốn vở bài tập trượt trên nền xi măng, dừng ngay trước mũi giày một cậu bạn đang chạy hớt hải.* | SFX tiếng rơi "bịch" của cuốn vở |
| `hud_p1_c1_talk` | Cảnh 1: Gặp Đức | `HUD_OBJECTIVE` | Sau tiếng rơi | `Nói chuyện với bạn vừa nhặt vở giúp bạn` | (Im lặng) |
| `hud_p1_c2_follow` | Cảnh 2: Đi tìm lớp | `HUD_OBJECTIVE` | Đức dứt câu "Đi theo tớ là được!" | `Đi theo Đức tới bảng phân lớp` | Tiếng bước chân rộn rã |
| `zone_p1_c2_hall` | Cảnh 2: Hành lang | `TITLE_CARD` | Rẽ vào dãy phòng học | *Dãy hành lang lớp 6* | Tiếng chuông reo nhẹ |
| `hud_p1_c2_board` | Cảnh 2: Bảng lớp | `HUD_OBJECTIVE` | Dừng trước bảng phân lớp | `Xem bảng danh sách phân lớp 6A` | Tiếng giấy dán sột soạt |
| `hud_p1_c2_enter` | Cảnh 2: Vào lớp | `HUD_OBJECTIVE` | Châu gọi ở cửa lớp | `Bước vào cửa lớp học` | Tiếng chân vào phòng học |
| `hud_p1_c3_cipher` | Cảnh 3: Giờ học | `HUD_OBJECTIVE` | Đức chìa mảnh nháp | `Ghép ký hiệu giải mật lệnh của Đức` | Tiếng lật giấy |
| `card_p1_c3_rules` | Cảnh 3: Minigame | `MINIGAME_CARD` | Mở bảng ghép chữ mật mã | **MẬT LỆNH SỐ 01**<br>• Kéo ký hiệu vào ô chữ tương ứng<br>• Giải đúng để mở thông điệp bí mật | Tiếng click lắp ghép |
| `narr_p1_c4_bell` | Cảnh 4: Ra chơi | `NARRATOR_OVERLAY` | Hết cảnh 3 trong lớp | *Tùng... tùng... tùng! Hồi trống ra chơi dồn dập vang lên khắp các dãy hành lang. Cả lớp ùa ra sân.* | SFX hồi trống trường báo ra chơi |
| `hud_p1_c4_shuttle` | Cảnh 4: Đá cầu | `HUD_OBJECTIVE` | Ra tới sân trường | `Đá cầu giữ nhịp cùng Đức` | Tiếng quả cầu chạm mu bàn chân "bộp... bộp" |
| `card_p1_c4_minigame` | Cảnh 4: Minigame | `MINIGAME_CARD` | Bắt đầu vòng đá cầu | **ĐÁ CẦU SÂN TRƯỜNG**<br>• Bấm đúng thời điểm khi vòng tròn thu nhỏ<br>• Giữ cầu không rơi càng lâu càng tốt | Nhịp điệu vui tươi |
| `narr_p1_c4_fail` | Cảnh 4: Lượt cuối | `NARRATOR_OVERLAY` | Lượt đá cuối cùng | *Đức vung chân quá đà. Quả cầu lông vịt bay vút một đường cong rồi rớt tọt vào bụi rậm ven sân.* | SFX tiếng vung gió "vút" và lá xào xạc |
| `hud_p1_c5_clean` | Cảnh 5: Trực nhật | `HUD_OBJECTIVE` | Cuối buổi học | `Trở về lớp trực nhật cùng Đức và Châu` | Tiếng bước chân lớp học vắng |
| `hud_p1_c5_board` | Cảnh 5: Lau bảng | `HUD_OBJECTIVE` | Đứng trước bảng đen | `Dùng khăn lau sạch bảng phấn cùng Đức` | Tiếng giẻ lau bảng "ken két" trên bảng đen |
| `tc_p1_c6` | Cảnh 6: Mấy tháng sau | `TITLE_CARD` | Kết thúc ngày đầu tiên | **Mấy tháng sau…**<br>*Bảng lớp đã ghi "Ôn tập học kỳ I".* | Nhạc nền chuyển sang êm dịu, ấm áp |
| `world_p1_c6_sunset` | Cảnh 6: Chuyển giờ | `WORLD_EVENT` | Hiện thẻ thời gian | *Ánh nắng chuyển hẳn sang sắc vàng rực của buổi hoàng hôn tan học. Bóng cây đổ dài trên sân trường.* | Ánh sáng vàng cam hoàng hôn hắt nghiêng |
| `hud_p1_c7_snack` | Cảnh 7: Tiệm tạp hóa | `HUD_OBJECTIVE` | Thấy Đức vẫy tay ở cổng | `Tới bậc thềm tiệm tạp hóa trước cổng trường` | Tiếng còi xe đạp tan trường |
| `card_p1_c7_noodle` | Cảnh 7: Minigame | `MINIGAME_CARD` | Tương tác gói mì tôm | **CHIA GÓI MÌ TÔM**<br>• Bóp vụn đều gói mì<br>• Rắc gói gia vị muối ớt và lắc đều | Tiếng bóp vụn rôm rốp sột soạt |
| `hud_p1_c8_photo` | Cảnh 8: Tự sướng | `HUD_OBJECTIVE` | Cầm máy ảnh giơ lên | `Chụp ảnh tự sướng bộ ba (Chụp 3 lần và chọn tấm đẹp nhất)` | (Im lặng) |
| `hud_p1_c8_shot1` | Cảnh 8: Lần bấm 1 | `HUD_OBJECTIVE` | Giơ máy quay ngược | `Lần 1: Quay ngược máy, đoán khung rồi bấm chụp` | SFX Flash + tiếng chụp `tách` |
| `hud_p1_c8_shot2` | Cảnh 8: Lần bấm 2 | `HUD_OBJECTIVE` | Châu nhắc lệch trán | `Lần 2: Lệch rồi! Chỉnh hướng máy, bấm lại` | SFX Flash + tiếng chụp `tách` |
| `hud_p1_c8_shot3` | Cảnh 8: Lần bấm 3 | `HUD_OBJECTIVE` | Đức tạo dáng | `Lần 3: Lần cuối: Cố canh đủ ba người` | SFX Flash + tiếng chụp `tách` |
| `hud_p1_c8_pick` | Cảnh 8: Chọn ảnh | `HUD_OBJECTIVE` | 3 bức ảnh hiện lên | `Chọn một tấm ưng ý nhất để lưu vào cuốn Album` | Tiếng trượt ảnh nhẹ |

---

### 3. VỀ PHÒNG 2026 SAU TRANG 1 & MỞ HỘP KỶ VẬT 2

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `world_hub_after_p1` | Về phòng trọ | `WORLD_EVENT` | Fade in trở lại phòng 2026 | *Mẩu giấy Mật lệnh 01 đã được lồng trong khung kính nhỏ trên kệ sách. Trang đầu cuốn Album sáng nhẹ, bức ảnh tự sướng bộ ba đã hiện rõ.* | Tiếng chuông gió nhẹ, đèn phòng ấm |
| `hud_hub_check_album` | Sau Trang 1 | `HUD_OBJECTIVE` | Trở về phòng 2026 | `Xem lại bức ảnh trong Album hoặc mở Hộp Kỷ Vật tìm món đồ tiếp theo` | (Im lặng) |
| `narr_decor_photo` | Đồ nền thùng | `NARRATOR_OVERLAY` | Bấm vào "Tấm ảnh lớp đã phai" | *Tấm ảnh lớp hồi đó... màu phai gần hết, nhìn hồi lâu mới nhận ra từng đứa.* | Tiếng giấy ảnh sột soạt |
| `narr_decor_penbox` | Đồ nền thùng | `NARRATOR_OVERLAY` | Bấm vào "Hộp bút sắt cũ" | *Hộp bút cũ lắc lên còn kêu lạch cạch. Nắp hộp vẫn còn mấy vết xước hồi đi học.* | SFX tiếng kim loại lạch cạch |
| `narr_hub_hook_p2` | Cầm kỷ vật 2 | `NARRATOR_OVERLAY` | Nhấc Chiếc thuyền giấy phai màu | *Chiếc thuyền giấy phai màu nằm ở góc thùng. Cánh buồm vẫn còn dòng chữ nhòe nước... hồi đó mình ước gì vậy ta?* | Tiếng giấy mềm miết nhẹ |
| `narr_hub_trans_p2` | Mở Trang 2 | `WORLD_EVENT` | Bấm hồi tưởng kỷ vật 2 | *Ngoài cửa sổ phòng trọ, tiếng mưa rào bất chợt đổ ào tới. Ánh đèn phòng chìm vào làn mưa trắng xóa của sân trường năm lớp 7...* | SFX sấm xa + tiếng mưa rào xối xả đổ xuống |

---

### 4. TRANG 2: THUYỀN GIẤY DƯỚI MÁI HIÊN (Đầu lớp 7, 2015)

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `tc_p2_c1` | Cảnh 1: Mưa đổ | `TITLE_CARD` | Vào Trang 2 | **Lớp 7. Một chiều mưa.**<br>*Giờ ra chơi, mưa đổ ào xuống sân.* | SFX tiếng mưa dội ầm ầm trên mái tôn |
| `hud_p2_c1_run` | Cảnh 1: Trú mưa | `HUD_OBJECTIVE` | Thấy Đức & Châu ở hiên | `Chạy vào dưới mái hiên tránh mưa cùng bạn bè` | Tiếng chân lội bì bõm |
| `hud_p2_c1_follow` | Cảnh 1: Đi coi | `HUD_OBJECTIVE` | Đức chỉ về đầu hiên | `Đi theo Đức về phía đầu hiên bên kia` | Tiếng mưa rào đều đặn |
| `hud_p2_c3_fold` | Cảnh 3: Gấp thuyền | `HUD_OBJECTIVE` | Nhận tờ giấy từ Hạ | `Gấp thuyền giấy và tự tay ghi điều ước lên cánh buồm` | Tiếng gấp nếp giấy |
| `card_p2_c3_fold_game`| Cảnh 3: Minigame | `MINIGAME_CARD` | Mở bàn gấp thuyền | **GẤP THUYỀN GIẤY**<br>• Vuốt mép giấy theo các đường nếp gấp nét đứt<br>• Mở bung đáy để tạo thành hình cánh buồm nổi | Tiếng vuốt nếp giấy "xoẹt" |
| `hud_p2_c3_pick_wish` | Cảnh 3: Chọn ước | `HUD_OBJECTIVE` | Gấp xong thân thuyền | `Chọn một điều ước ý nghĩa để viết lên cánh buồm` | (Im lặng) |
| `hud_p2_c3_write_wish`| Cảnh 3: Tự ghi | `HUD_OBJECTIVE` | Sau khi chọn điều ước | `Dùng bút tự tay nắn nót từng chữ điều ước lên cánh buồm` | Tiếng ngòi bút chì sột soạt trên giấy |
| `hud_p2_c4_photo` | Cảnh 4: Chụp 5 thuyền | `HUD_OBJECTIVE` | Năm chiếc xếp mép rãnh | `Chụp lại năm chiếc thuyền giấy trước khi thả đua (Canh đủ năm chiếc)` | Khung ngắm máy ảnh |
| `hud_p2_c5_race` | Cảnh 5: Thả thuyền | `HUD_OBJECTIVE` | Ra rãnh nước chảy | `Đặt thuyền xuống rãnh nước và bắt đầu cuộc đua` | Tiếng nước róc rách |
| `card_p2_c5_race_rules`| Cảnh 5: Minigame | `MINIGAME_CARD` | Chuẩn bị thả | **ĐUA THUYỀN MƯƠNG NƯỚC**<br>• Canh lực và hướng thả chuẩn xác<br>• Lách qua lá cây trôi và xoáy nước nhỏ ven bờ | Tiếng nước chảy xiết |
| `narr_p2_c5_result` | Cảnh 5: Kết quả | `NARRATOR_OVERLAY` | Thuyền Đức lật | *Thuyền của Đức vừa chạm nước đã nghiêng hẳn sang một bên rồi lật úp. Thuyền của Quân phăng phăng dẫn đầu dòng nước.* | Tiếng nước bắn tóe |
| `hud_p2_c6_rescue` | Cảnh 6: Vớt thuyền | `HUD_OBJECTIVE` | Đi tới cuối rãnh | `Tới cuối rãnh nước vớt chiếc thuyền còn sót lại của Hạ` | Tiếng chân giẫm nước ướt |
| `narr_p2_c6_sign` | Cảnh 6: Ký tên | `NARRATOR_OVERLAY` | Hạ đưa bút viết lên buồm | *Năm chữ ký nắn nót lần lượt xuất hiện trên cánh buồm ướt sũng nước: [Tên người chơi], Hạ, Quân, Châu và nét chữ ngoáy vội của Đức.* | Tiếng ngòi bút bi ghi trên giấy ướt |
| `narr_p2_c6_bell` | Cảnh 6: Trống trường | `NARRATOR_OVERLAY` | Ký tên xong | *"Tùng… tùng… tùng…" — Hồi trống vào lớp vang lên báo hiệu giờ ra chơi đã hết.* | SFX 3 tiếng trống trường trầm vang |
| `hud_p2_c6_enter_class`| Cảnh 6: Vào lớp | `HUD_OBJECTIVE` | Châu quay lưng đi | `Đi theo Châu trở vào lớp học` | Tiếng mưa ngớt dần |

---

### 5. VỀ PHÒNG 2026 SAU TRANG 2 & MỞ HỘP KỶ VẬT 3

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `world_hub_after_p2` | Về phòng trọ | `WORLD_EVENT` | Trở về phòng 2026 | *Căn phòng ấm áp hơn hẳn. Chiếc thuyền giấy phai màu đã nằm trên kệ sách; trang Album "Lần đầu đủ năm" rạng rỡ với bức ảnh 5 chiếc thuyền.* | Ánh sáng vàng dịu lan tỏa khắp phòng trọ |
| `narr_decor_eraser` | Đồ nền thùng | `NARRATOR_OVERLAY` | Bấm vào "Cục gôm mòn" | *Cục gôm mòn vẹt một góc, hồi đó đứa nào cũng hay mượn rồi quên trả.* | Tiếng đặt đồ nhựa nhẹ |
| `narr_decor_ruler` | Đồ nền thùng | `NARRATOR_OVERLAY` | Bấm vào "Cây thước kẻ" | *Cây thước nhựa tróc hết vạch số, trên mép còn khắc mấy chữ mờ tịt.* | Tiếng thước gõ nhẹ trên gỗ |
| `narr_hub_hook_p3` | Cầm kỷ vật 3 | `NARRATOR_OVERLAY` | Bấm Sổ luật bìa xanh | *Tấm biển vẽ tay với cuốn sổ bìa xanh... mở trang đầu thấy năm điều luật nghiêm trang, hồi đó tụi mình bày đặt ghê.* | Tiếng lật bìa sổ dày |
| `narr_hub_trans_p3` | Mở Trang 3 | `WORLD_EVENT` | Hồi tưởng kỷ vật 3 | *Trang sổ mở ra, ánh nắng đầu học kỳ II ấm áp đưa người chơi trở lại góc sân sau tĩnh lặng...* | SFX tiếng gió thổi lá cây rì rào |

---

### 6. TRANG 3: CĂN CỨ BÍ MẬT (Đầu học kỳ II lớp 7, 2016)

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `tc_p3_c1` | Cảnh 1: Ý tưởng | `TITLE_CARD` | Bắt đầu Trang 3 | **Đầu học kỳ II**<br>*Lớp 7 · Giờ về* | Tiếng học sinh ùa ra về tan trường |
| `hud_p3_c1_talk` | Cảnh 1: Tập trung | `HUD_OBJECTIVE` | Xuất hiện giữa sân | `Tới nói chuyện với Đức và nhóm bạn giữa sân trường` | (Im lặng) |
| `hud_p3_c2_follow` | Cảnh 2: Lối sân sau | `HUD_OBJECTIVE` | Đức đi trước dẫn đường | `Đi theo Đức ra góc sân sau gần nhà kho` | Tiếng bước chân trên sỏi cát |
| `zone_p3_c2_old_name` | Cảnh 2: Tên khu cũ | `TITLE_CARD` | Bước vào khu đất hoang | *Góc sân sau* | Tiếng gió lùa hiu quạnh |
| `hud_p3_c3_survey` | Cảnh 3: Khảo sát | `HUD_OBJECTIVE` | Đứng trước mái che | `Khảo sát 3 vị trí quanh khu vực: Mái che · Gốc cây · Thùng giấy (0/3)` | (Im lặng) |
| `hud_p3_c4_clean` | Cảnh 4: Kê bàn ghế | `HUD_OBJECTIVE` | Khảo sát đủ 3/3 | `Dọn dẹp bụi bặm và kê bàn ghế dưới mái che` | Tiếng kéo bàn gỗ sột soạt |
| `zone_p3_c4_new_name` | Cảnh 4: Đổi tên khu | `TITLE_CARD` | Sau khi dọn dẹp xong | **Căn cứ Bí mật**<br>*Địa bàn chính thức của nhóm năm đứa* | Nhạc hiệu rộn rã reo mừng |
| `hud_p3_c5_decor` | Cảnh 5: Trang trí | `HUD_OBJECTIVE` | Tới bên chiếc bàn cùng Hạ | `Chọn 1 trong 3 phong cách trang trí: Giấy màu · Hoa dại · Dây ảnh` | (Im lặng) |
| `world_p3_c5_decor_spawn`| Cảnh 5: Hiện đồ | `WORLD_EVENT` | Người chơi chọn xong | *Đồ trang trí xuất hiện ngay lập tức trên bàn và giăng quanh mái che Căn cứ, biến góc nhỏ hoang phế thành không gian ấm cúng.* | Hiệu ứng lấp lánh (sparkle) |
| `hud_p3_c6_rules` | Cảnh 6: Viết sổ luật | `HUD_OBJECTIVE` | Quây quanh bàn | `Mở cuốn sổ bìa xanh và ghép 5 điều luật Căn cứ` | Tiếng lật trang sổ |
| `card_p3_c6_rules_game`| Cảnh 6: Minigame | `MINIGAME_CARD` | Bắt đầu viết luật | **SỔ QUY ĐỊNH CĂN CỨ**<br>• Ghép vế sau cho đúng 5 điều luật mà từng bạn đề ra<br>• Ký tên xác nhận không ai được vi phạm | Tiếng ngòi bút đỏ chạy trên giấy |
| `hud_p3_c7_sign_photo`| Cảnh 7: Treo biển | `HUD_OBJECTIVE` | Đức treo biển tên | `Căn góc máy chụp tấm biển Căn cứ sao cho rõ từng nét chữ` | Khung ngắm chụp ảnh |

---

### 7. VỀ PHÒNG 2026 SAU TRANG 3 & MỞ HỘP KỶ VẬT 4

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `world_hub_after_p3` | Về phòng trọ | `WORLD_EVENT` | Fade in phòng 2026 | *Tấm biển tên "Căn cứ Bí mật" và cuốn sổ luật bìa xanh đã nằm ngay ngắn trên kệ sách — gáy cuốn sổ hơi nhô ra ngoài mép kệ.* | Tiếng chuông gió ngân nga êm ả |
| `hud_hub_find_last` | Tìm kỷ vật cuối | `HUD_OBJECTIVE` | Sau Trang 3 | `Mở lại Hộp Kỷ Vật tìm món đồ cuối cùng của năm lớp 7` | (Im lặng) |
| `narr_hub_hook_p4` | Cầm kỷ vật 4 | `NARRATOR_OVERLAY` | Bấm Tấm ảnh ố góc | *Tấm ảnh chụp đủ năm đứa đầu tiên... góc ảnh đã ố vàng theo năm tháng mà mình vẫn giữ cẩn thận dưới đáy thùng.* | Tiếng miết nhẹ góc ảnh giấy cũ |
| `narr_hub_trans_p4` | Mở Trang 4 | `WORLD_EVENT` | Hồi tưởng kỷ vật 4 | *Sắc phượng đỏ rực của tháng Năm và tiếng ve hè inh ỏi đưa ký ức quay về những ngày cuối cùng của năm lớp 7...* | Tiếng ve sầu râm ran ngày hè |

---

### 8. TRANG 4: ĐỦ NĂM ĐỨA (Cuối lớp 7, Tháng 5/2016)

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `tc_p4_c1` | Cảnh 1: Gom nhóm | `TITLE_CARD` | Bắt đầu Trang 4 | **Cuối năm lớp 7.**<br>*Phượng vừa chớm đỏ.* | Tiếng ve sầu hè, gió lay rặng phượng vĩ |
| `hud_p4_c1_meet_duc` | Cảnh 1: Gặp Đức | `HUD_OBJECTIVE` | Đứng giữa sân | `Tới gặp Đức đang cầm máy ảnh giữa sân trường` | (Im lặng) |
| `hud_p4_c1_follow_ha` | Cảnh 1: Ra gốc phượng | `HUD_OBJECTIVE` | Hạ đi trước dẫn đường | `Đi theo Hạ ra gốc cây phượng vĩ lớn giữa sân` | Tiếng bước chân rộn ràng |
| `hud_p4_c2_pose_style` | Cảnh 2: Chọn dáng | `HUD_OBJECTIVE` | Đứng dưới tán phượng | `Chọn kiểu chụp ảnh cho cả nhóm: Nhí nhố mặt hề · Tự nhiên khoác vai · Nghiêm trang ảnh thẻ` | (Im lặng) |
| `hud_p4_c3_bench` | Cảnh 3: Đặt máy | `HUD_OBJECTIVE` | Quân chỉ ghế đá | `Tiến lại ghế đá trống đặt máy ảnh và canh khung ngắm` | Tiếng đặt máy ảnh lên mặt đá |
| `hud_p4_c4_lineup` | Cảnh 4: Xếp chỗ | `HUD_OBJECTIVE` | Nhìn qua khung ngắm | `Kéo thả sắp xếp vị trí đứng cho năm người trong khung hình` | Tiếng click kéo thả |
| `hud_p4_c5_timer` | Cảnh 5: Hẹn giờ 10s | `HUD_OBJECTIVE` | Bấm nút hẹn giờ | `Có 10 giây! Chạy nhanh vào vòng sáng dưới gốc cây tạo dáng` | Tiếng bíp bíp đếm ngược `tít... tít... tít` dồn dập |
| `narr_p4_c6_rain_storm`| Cảnh 6: Mưa rào | `NARRATOR_OVERLAY` | Chụp xong tấm gốc phượng | *Một cơn mưa rào mùa hạ bất chợt ào ào trút xuống. Lá phượng rơi lả tả trên nền đất đỏ.* | SFX tiếng sấm bất chợt + mưa rào ập đến |
| `hud_p4_c6_run_base` | Cảnh 6: Chạy về | `HUD_OBJECTIVE` | Đức ôm máy ảnh chạy | `Chạy theo Đức và nhóm bạn về dưới mái che Căn cứ` | Tiếng chân chạy nhanh, tiếng mưa rơi ầm ầm |
| `narr_p4_c7_rainbow` | Cảnh 7: Cầu vồng | `NARRATOR_OVERLAY` | Mưa ngớt hạt | *Mưa rào tạnh nhanh như lúc đến. Bầu trời sau mưa trong vắt, một dải cầu vồng rực rỡ vắt ngang qua khoảng sân sau.* | Tiếng giọt gianh nhỏ giọt tí tách, chim hót |
| `hud_p4_c7_snap_rainbow`| Cảnh 7: Ảnh cầu vồng | `HUD_OBJECTIVE` | Hạ reo lên chỉ trời | `Đặt máy lên khúc gỗ bãi đất, chụp bức ảnh kỷ niệm cùng cầu vồng` | Tiếng đếm hẹn giờ êm dịu + tiếng `tách` lưu ảnh |
| `tc_p4_c8` | Cảnh 8: Mấy hôm sau | `TITLE_CARD` | Chuyển cảnh vài ngày | **Mấy hôm sau.**<br>*Ảnh vừa in xong.* | Giai điệu hoài niệm da diết |
| `hud_p4_c8_stick_wall` | Cảnh 8: Dán ảnh | `HUD_OBJECTIVE` | Cầm tấm ảnh trên tay | `Tiến lại bức tường gỗ Căn cứ dán bức ảnh cầu vồng năm đứa` | Tiếng băng dính dán lên gỗ |

---

### 9. KẾT MỐC 1: PHÒNG 2026, ỨNG DỤNG `AloNhau` & FORM PHẢN HỒI

| ID Mã Code | Phân cảnh | Kênh UI | Thời điểm kích hoạt (Trigger) | Nội dung chữ hiển thị | Gợi ý Âm thanh (SFX / Music) |
|---|---|---|---|---|---|
| `world_m1_end_desk` | Hiện tại 2026 | `WORLD_EVENT` | Fade in về hiện tại 2026 | *Đêm buông xuống tĩnh mịch. Ánh đèn bàn tỏa hơi ấm tối đa xuống mặt bàn gỗ. Bìa cuốn Album đã phục hồi trọn vẹn với bức ảnh năm đứa bên dải cầu vồng năm ấy.* | Nhạc nền piano dịu dàng, tiếng đêm tĩnh mịch |
| `hud_m1_end_phone` | Điện thoại | `HUD_OBJECTIVE` | Nhìn vào mặt bàn | `Tiến lại bàn làm việc, mở chiếc Điện thoại tìm lại nhóm chat cũ` | (Im lặng) |
| `narr_m1_end_chat_status`| Ứng dụng AloNhau | `NARRATOR_OVERLAY` | Mở ứng dụng `AloNhau` | *Màn hình ứng dụng AloNhau mở ra nhóm "Căn cứ Bí mật". Khung chat trống trơn, chỉ còn dòng trạng thái mờ xám: "tin cuối cùng đã từ rất lâu..."* | Tiếng ting mở app điện thoại |
| `hud_m1_end_send_msg` | Gửi tin nhắn | `HUD_OBJECTIVE` | Khung soạn tin mở | `Soạn và bấm gửi một tin nhắn mở lời gửi tới những người bạn cũ` | Tiếng phím gõ lách cách |
| `narr_m1_end_sent` | Sau khi gửi | `NARRATOR_OVERLAY` | Bấm nút Gửi tin nhắn | *Đã gửi.* | SFX tiếng gửi tin nhắn `vút` |
| `narr_m1_end_tbc` | Kết thúc Mốc 1 | `TITLE_CARD` | 1.5 giây sau chữ Đã gửi | **(còn tiếp)** | Nhạc nền ngân nốt cuối lắng đọng |
| `form_feedback_trigger` | Form góp ý | `UI_POPUP` | Người chơi bấm nút Thoát (bất cứ lúc nào) hoặc hết Mốc 1 | Bật cửa sổ khảo sát ý kiến (4 câu trắc nghiệm + 1 ô đóng góp 300 ký tự) | Tiếng pop-up mở nhẹ nhàng |

---

## III. MÃ NGUỒN TYPESCRIPT SẴN SÀNG ĐƯA VÀO CODE ENGINE

Đoạn code TypeScript dưới đây đã được cấu trúc hóa theo đúng chuẩn `src/content/types.ts` để đội Dev có thể tạo file `src/content/narratives.ts` và import trực tiếp vào hệ thống:

```typescript
/**
 * src/content/narratives.ts
 * Bảng số hóa hệ thống Narrative bối cảnh & Thẻ chữ Mốc 1 — "Vùng Ký Ức"
 */

export type NarrativeChannel = 'TITLE_CARD' | 'NARRATOR_OVERLAY' | 'MINIGAME_CARD' | 'HUD_OBJECTIVE' | 'WORLD_EVENT' | 'UI_POPUP';

export interface NarrativeEntry {
  id: string;
  channel: NarrativeChannel;
  text: string;
  subtext?: string;
  sfxCue?: string;
  durationMs?: number;
}

export const MOC1_NARRATIVE_REGISTRY: Record<string, NarrativeEntry> = {
  // --- Hub 2026 Mở đầu ---
  narr_hub_intro_01: {
    id: 'narr_hub_intro_01',
    channel: 'NARRATOR_OVERLAY',
    text: 'Phòng trọ năm 2026. Buổi tối, ánh đèn bàn hắt lên một góc phòng tĩnh lặng.',
    sfxCue: 'sfx_ambient_room_night',
  },
  narr_hub_intro_02: {
    id: 'narr_hub_intro_02',
    channel: 'NARRATOR_OVERLAY',
    text: 'Trên sàn có một chiếc thùng carton cũ dán băng keo ngả vàng: "Đồ cũ – đừng vứt."',
    sfxCue: 'sfx_cardboard_rustle',
  },
  narr_box_open_first: {
    id: 'narr_box_open_first',
    channel: 'NARRATOR_OVERLAY',
    text: 'Chiếc thùng carton cũ phủ một lớp bụi mỏng. Mở nắp ra, mùi giấy cũ và năm tháng ùa về...',
    sfxCue: 'sfx_box_open',
  },
  narr_decor_notebook: {
    id: 'narr_decor_notebook',
    channel: 'NARRATOR_OVERLAY',
    text: 'Mấy cuốn vở ô ly từ hồi cấp hai, mép quăn queo, trang bìa dán nhãn nắn nót tên lớp.',
  },
  narr_decor_scarf: {
    id: 'narr_decor_scarf',
    channel: 'NARRATOR_OVERLAY',
    text: 'Chiếc khăn quàng đỏ đã bạc màu viền, vải nhăn nhúm nằm cuộn tròn dưới đáy thùng.',
  },
  narr_hub_hook_p1: {
    id: 'narr_hub_hook_p1',
    channel: 'NARRATOR_OVERLAY',
    text: 'Mẩu giấy ô ly gấp làm tư, nét bút mực tím nguệch ngoạc: "Mật lệnh số 01 – Cấm mở trước giờ ra chơi."',
    sfxCue: 'sfx_paper_unfold',
  },
  narr_hub_trans_p1: {
    id: 'narr_hub_trans_p1',
    channel: 'WORLD_EVENT',
    text: 'Tiếng ve hè xao xác và tiếng trống trường từ xa bỗng vọng lại. Ánh đèn bàn mờ dần, căn phòng tan vào nắng sớm rực rỡ của sân trường cấp 2...',
    sfxCue: 'sfx_drum_roll_summer_cicadas',
  },

  // --- Trang 1 ---
  tc_p1_c1: {
    id: 'tc_p1_c1',
    channel: 'TITLE_CARD',
    text: 'Ngày đầu lớp 6',
    subtext: 'Một buổi sáng tháng Chín, năm 2014',
    durationMs: 3000,
  },
  narr_p1_c1_drop: {
    id: 'narr_p1_c1_drop',
    channel: 'NARRATOR_OVERLAY',
    text: 'Một tiếng "bịch" vang lên phía sau. Cuốn vở bài tập trượt trên nền xi măng, dừng ngay trước mũi giày một cậu bạn đang chạy hớt hải.',
    sfxCue: 'sfx_book_drop',
  },
  card_p1_c3_rules: {
    id: 'card_p1_c3_rules',
    channel: 'MINIGAME_CARD',
    text: 'MẬT LỆNH SỐ 01\n• Kéo ký hiệu vào ô chữ tương ứng\n• Giải đúng để mở thông điệp bí mật',
  },
  narr_p1_c4_bell: {
    id: 'narr_p1_c4_bell',
    channel: 'NARRATOR_OVERLAY',
    text: 'Tùng... tùng... tùng! Hồi trống ra chơi dồn dập vang lên khắp các dãy hành lang. Cả lớp ùa ra sân.',
    sfxCue: 'sfx_school_drum_recess',
  },
  tc_p1_c6: {
    id: 'tc_p1_c6',
    channel: 'TITLE_CARD',
    text: 'Mấy tháng sau…',
    subtext: 'Bảng lớp đã ghi "Ôn tập học kỳ I".',
    durationMs: 3000,
  },

  // --- Hub về sau Trang 1 & Kỷ vật 2 ---
  narr_decor_photo: {
    id: 'narr_decor_photo',
    channel: 'NARRATOR_OVERLAY',
    text: 'Tấm ảnh lớp hồi đó... màu phai gần hết, nhìn hồi lâu mới nhận ra từng đứa.',
  },
  narr_decor_penbox: {
    id: 'narr_decor_penbox',
    channel: 'NARRATOR_OVERLAY',
    text: 'Hộp bút cũ lắc lên còn kêu lạch cạch. Nắp hộp vẫn còn mấy vết xước hồi đi học.',
    sfxCue: 'sfx_tin_box_rattle',
  },
  narr_hub_hook_p2: {
    id: 'narr_hub_hook_p2',
    channel: 'NARRATOR_OVERLAY',
    text: 'Chiếc thuyền giấy phai màu nằm ở góc thùng. Cánh buồm vẫn còn dòng chữ nhòe nước... hồi đó mình ước gì vậy ta?',
  },

  // --- Trang 2 ---
  tc_p2_c1: {
    id: 'tc_p2_c1',
    channel: 'TITLE_CARD',
    text: 'Lớp 7. Một chiều mưa.',
    subtext: 'Giờ ra chơi, mưa đổ ào xuống sân.',
    durationMs: 3000,
  },
  card_p2_c3_fold_game: {
    id: 'card_p2_c3_fold_game',
    channel: 'MINIGAME_CARD',
    text: 'GẤP THUYỀN GIẤY\n• Vuốt mép giấy theo các đường nếp gấp nét đứt\n• Mở bung đáy để tạo thành hình cánh buồm nổi',
  },
  card_p2_c5_race_rules: {
    id: 'card_p2_c5_race_rules',
    channel: 'MINIGAME_CARD',
    text: 'ĐUA THUYỀN MƯƠNG NƯỚC\n• Canh lực và hướng thả chuẩn xác\n• Lách qua lá cây trôi và xoáy nước nhỏ ven bờ',
  },
  narr_p2_c6_bell: {
    id: 'narr_p2_c6_bell',
    channel: 'NARRATOR_OVERLAY',
    text: '"Tùng… tùng… tùng…" — Hồi trống vào lớp vang lên báo hiệu giờ ra chơi đã hết.',
    sfxCue: 'sfx_school_drum_3beats',
  },

  // --- Hub về sau Trang 2 & Kỷ vật 3 ---
  narr_decor_eraser: {
    id: 'narr_decor_eraser',
    channel: 'NARRATOR_OVERLAY',
    text: 'Cục gôm mòn vẹt một góc, hồi đó đứa nào cũng hay mượn rồi quên trả.',
  },
  narr_decor_ruler: {
    id: 'narr_decor_ruler',
    channel: 'NARRATOR_OVERLAY',
    text: 'Cây thước nhựa tróc hết vạch số, trên mép còn khắc mấy chữ mờ tịt.',
  },
  narr_hub_hook_p3: {
    id: 'narr_hub_hook_p3',
    channel: 'NARRATOR_OVERLAY',
    text: 'Tấm biển vẽ tay với cuốn sổ bìa xanh... mở trang đầu thấy năm điều luật nghiêm trang, hồi đó tụi mình bày đặt ghê.',
  },

  // --- Trang 3 ---
  tc_p3_c1: {
    id: 'tc_p3_c1',
    channel: 'TITLE_CARD',
    text: 'Đầu học kỳ II',
    subtext: 'Lớp 7 · Giờ về',
    durationMs: 3000,
  },
  zone_p3_c4_new_name: {
    id: 'zone_p3_c4_new_name',
    channel: 'TITLE_CARD',
    text: 'Căn cứ Bí mật',
    subtext: 'Địa bàn chính thức của nhóm năm đứa',
    durationMs: 3500,
  },
  card_p3_c6_rules_game: {
    id: 'card_p3_c6_rules_game',
    channel: 'MINIGAME_CARD',
    text: 'SỔ QUY ĐỊNH CĂN CỨ\n• Ghép vế sau cho đúng 5 điều luật mà từng bạn đề ra\n• Ký tên xác nhận không ai được vi phạm',
  },

  // --- Hub về sau Trang 3 & Kỷ vật 4 ---
  narr_hub_hook_p4: {
    id: 'narr_hub_hook_p4',
    channel: 'NARRATOR_OVERLAY',
    text: 'Tấm ảnh chụp đủ năm đứa đầu tiên... góc ảnh đã ố vàng theo năm tháng mà mình vẫn giữ cẩn thận dưới đáy thùng.',
  },

  // --- Trang 4 ---
  tc_p4_c1: {
    id: 'tc_p4_c1',
    channel: 'TITLE_CARD',
    text: 'Cuối năm lớp 7.',
    subtext: 'Phượng vừa chớm đỏ.',
    durationMs: 3000,
  },
  narr_p4_c6_rain_storm: {
    id: 'narr_p4_c6_rain_storm',
    channel: 'NARRATOR_OVERLAY',
    text: 'Một cơn mưa rào mùa hạ bất chợt ào ào trút xuống. Lá phượng rơi lả tả trên nền đất đỏ.',
    sfxCue: 'sfx_summer_rain_thunder',
  },
  narr_p4_c7_rainbow: {
    id: 'narr_p4_c7_rainbow',
    channel: 'NARRATOR_OVERLAY',
    text: 'Mưa rào tạnh nhanh như lúc đến. Bầu trời sau mưa trong vắt, một dải cầu vồng rực rỡ vắt ngang qua khoảng sân sau.',
    sfxCue: 'sfx_birds_after_rain',
  },
  tc_p4_c8: {
    id: 'tc_p4_c8',
    channel: 'TITLE_CARD',
    text: 'Mấy hôm sau.',
    subtext: 'Ảnh vừa in xong.',
    durationMs: 3000,
  },

  // --- Kết Mốc 1 (Hub 2026) ---
  narr_m1_end_chat_status: {
    id: 'narr_m1_end_chat_status',
    channel: 'NARRATOR_OVERLAY',
    text: 'Màn hình ứng dụng AloNhau mở ra nhóm "Căn cứ Bí mật". Khung chat trống trơn, chỉ còn dòng trạng thái mờ xám: "tin cuối cùng đã từ rất lâu..."',
  },
  narr_m1_end_sent: {
    id: 'narr_m1_end_sent',
    channel: 'NARRATOR_OVERLAY',
    text: 'Đã gửi.',
    sfxCue: 'sfx_message_sent',
  },
  narr_m1_end_tbc: {
    id: 'narr_m1_end_tbc',
    channel: 'TITLE_CARD',
    text: '(còn tiếp)',
    durationMs: 4000,
  },
};
```

---

## IV. ĐIỀU PHỐI VÀ BÀN GIAO CHO CÁC NHÁNH KỸ THUẬT

1. **Nhánh UI / HUD (`src/ui`):**
   - Tạo component `NarratorBanner.tsx` hiển thị ở đáy màn hình (độc lập với `DialogueBox.tsx`). Khi `line.speaker === 'narrator'`, route text về component này.
   - Tạo component `TitleCardOverlay.tsx` để render các thẻ chữ 2 dòng (Fade in 0.5s -> Hold 2s -> Fade out 0.5s).
2. **Nhánh Content Quest (`src/content`):**
   - Import trực tiếp dictionary `MOC1_NARRATIVE_REGISTRY` vào các step có `kind: 'cutscene'`, `kind: 'minigame'`, `kind: 'interact'` hoặc `intro_lines`.
   - Đảm bảo các thuộc tính `objective` trên HUD hiển thị đúng từng câu hướng dẫn tự nhiên đã liệt kê ở Bảng Mục II.
3. **Nhánh Âm thanh & Môi trường (`src/audio`, `src/world`):**
   - Gắn đúng các trigger SFX tương ứng với sự kiện thế giới (`sfxCue`).
