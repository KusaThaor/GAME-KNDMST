# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 1–4 (MỐC 1: LỚP 6–7)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** T-06 — Số hóa kịch bản Trang 1–4 thành dữ liệu game  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4 APPROVED), `docs/gdd/01_NARRATIVE_AND_SCENES.md` (v1.0 APPROVED), `docs/PAGE_DATA_GUIDE.md`  
> **Ngày hoàn thành:** 21/11/2026  

---

## 1. Hub 2026 — Mở đầu & Kết thúc Demo
- **File dữ liệu:** `src/content/hub.ts`
- **Ownership:** `HUMAN_CANON` · Spec Ready · Version `v1.4`

| Cảnh / Đoạn kịch bản | Loại bước | ID bước / Đối tượng | Thoại & Logic số hóa | Đối chiếu GDD / Repo |
|---|---|---|---|---|
| **Mở đầu:** Phòng trọ năm 2026, ánh đèn bàn, thùng carton cũ "Đồ cũ - đừng vứt" | `cutscene` | `q_hub_pd_01.s01` | Narrator: 2 câu dẫn bối cảnh.<br>Player: "Mật lệnh này… ai viết mà nhìn chẳng hiểu gì hết vậy?", "Không biết ngày đó tụi mình bắt đầu chơi với nhau từ lúc nào nhỉ?" | `KICH_BAN_DEMO_M1_M2_v1.md` §MỞ ĐẦU |
| **Tương tác:** Mở Hộp Kỷ Vật | `interact` | `q_hub_pd_01.s02` | Target: `itr.hub.memory_box`. Không có thoại phụ để auto-complete mượt mà khi người chơi bấm vào thùng. | `map_hub` / `systems/hub.ts` |
| **Kỷ vật đầu tiên:** Mẩu giấy gấp tư mật lệnh | `artifact` | `art_m1_01` | Dẫn vào Trang 1 (`d.g06.01`). | GDD Phụ lục A |
| **Kết demo:** Tìm lại nhóm chat cũ trên điện thoại | `phone_ui` | `q_hub_pd_02.s01` | Mở màn hình `group_chat`, nhóm `thread.old_group` ("Căn cứ Bí mật"). Lịch sử chat đủ 4 bạn cũ. | `01_NARRATIVE_AND_SCENES.md` §7.2 |
| **Kết demo:** Soạn tin nhắn gửi nhóm bạn cũ | `compose_message` | `q_hub_pd_03.s01` | 3 sắc thái mở lời:<br>• `playful`: "Ê. Nhớ hồi tụi mình mới đủ năm đứa không? Lâu quá rồi ha."<br>• `gentle`: "Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?"<br>• `deep`: "Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha." | `KICH_BAN_DEMO_M1_M2_v1.md` §KẾT THÚC DEMO |

---

## 2. Trang 1 (`d.g06.01`) — Mật lệnh số 01 (Lớp 6, 2014)
- **File dữ liệu:** `src/content/days/d_g06_01.ts`
- **Map:** `map_thcs` (variant `g06`) · Open zones: `zone.thcs.yard`, `zone.thcs.corridor`, `zone.thcs.classroom`
- **Kỷ vật dẫn vào:** `art_m1_01` (Mẩu giấy gấp tư đầy hình vẽ ký hiệu và nét bút bi đỏ sửa lỗi của Châu Tổng)
- **Quy tắc xưng hô:** Đức mới quen: "cậu - tớ", lỡ miệng lúc trực nhật: "mày - tao". Châu: "tui - {g:ông\|bà}".

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Sân trường đầu năm, gió bay vở | `talk` | `q_m1_main_01.s01` | `NPC_A` (Đức) tại sân trường | Đức nhặt hộ vở, làm quen, rủ cùng đi tìm phòng lớp 6A2. |
| Cảnh 2: Vào lớp 6A2, giải mã mật lệnh | `talk` | `q_m1_main_01.s02` | `NPC_B` (Châu) + `NPC_A` (Đức) | Châu soi lỗi chính tả bằng bút bi đỏ trên mẩu giấy. Kết bạn bộ ba, ngồi ghế đá ăn mì tôm bóp, chụp ảnh kỷ niệm (`cam.d0601.bench`). |
| Nhiệm vụ phụ: Trực nhật đầu năm | `talk` + `arrive` | `q_m1_side_01.s01` | `NPC_B` (Châu) -> `itr.thcs.flagpole` | Châu nhắc lịch trực nhật, ra quan sát cột cờ trường. |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | `itr.thcs.duty_spot` | Kiểm tra góc chổi lau bảng lớp học. |
| Album: Ảnh bộ ba ở ghế đá | `snapshot` | `alb.d.g06.01.01` | Ghế đá sân trường | Ảnh chụp tự sướng bộ ba (`required_for_restore: true`). |

---

## 3. Trang 2 (`d.g07.01`) — Thuyền giấy dưới mái hiên (Đầu lớp 7, Chiều mưa 2015)
- **File dữ liệu:** `src/content/days/d_g07_01.ts`
- **Map:** `map_thcs` (variant `g07`) · Open zones: `zone.thcs.yard`, `zone.thcs.corridor`, `zone.thcs.classroom`
- **Kỷ vật dẫn vào:** `art_m1_02` (Chiếc thuyền giấy phai màu, có chữ ký và điều ước của năm đứa)
- **Quy tắc xưng hô:** Đức: "mày - tao" với nhóm cũ; Châu: "tui - {g:ông\|bà}"; Hạ: xưng tên "Hạ", gọi tên bạn; Quân: "cậu - tớ".

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Trú mưa dưới hiên hành lang | `talk` | `q_m1_main_02.s01` | `NPC_A` (Đức), `NPC_B` (Châu) | Đức và Châu cãi nhau về bài tập hè dưới cơn mưa lớn. |
| Cảnh 2: Thấy hai bạn lớp bên gấp thuyền giấy | `talk` | `q_m1_main_02.s02` | `NPC_C` (Hạ), `NPC_D` (Quân) | Làm quen Hạ & Quân, rủ chơi thi đua thuyền giấy theo dòng rãnh nước. Châu làm trọng tài. |
| Cảnh 3: Viết điều ước lên cánh buồm | `choice` (`measured: true`) | `q_m1_main_02.s03` | Prompt từ Hạ (`NPC_C`) | Lựa chọn điều ước (`c_m1_02_wish`):<br>• `friendship` (`gentle`): "Mai mốt vẫn chơi chung vầy."<br>• `fun` (`playful`): "Lớp 7 vui hơn lớp 6."<br>• `secret` (`deep`): "Bí mật không nói ra." |
| Cảnh 4: Thả thuyền xuống rãnh nước | `interact` | `q_m1_main_02.s04` | `itr.thcs.gutter` (rãnh nước mái hiên) | Đua thuyền: Thuyền Đức lật do sóng xoáy, thuyền Quân chạy xa nhất vì đáy rộng, thuyền Player trôi ra xa. |
| Cảnh 5: Ký tên lên buồm chiếc thuyền vớt được | `cutscene` | `q_m1_main_02.s05` | Cả nhóm 5 người | Hạ giữ chiếc thuyền vớt được, cả nhóm ký tên lên buồm, chính thức kết bạn 5 người, hẹn ngày mai gặp lại. |
| Nhiệm vụ phụ: Mẹo gấp thuyền của Quân | `talk` | `q_m1_side_03.s01` | `NPC_D` (Quân) | Quân chỉ cách gấp thuyền giấy đáy rộng từ giấy báo cũ để chạy xa không bị lật. |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | `itr.thcs.duty_spot` | Thu dọn xô hứng nước mưa dột ở hiên. |
| Album: Năm chiếc thuyền giấy | `snapshot` | `alb.d.g07.01.01` | `cam.d0701.boats` | Ảnh chụp 5 chiếc thuyền rãnh nước (`required_for_restore: true`). |

---

## 4. Trang 3 (`d.g07.02`) — Căn cứ bí mật (Giữa lớp 7, Đầu HK II, 2016)
- **File dữ liệu:** `src/content/days/d_g07_02.ts`
- **Map:** `map_thcs` (variant `g07`) · Open zones: `zone.thcs.corridor`, `zone.thcs.yard`, `zone.thcs.gate`, `zone.thcs.field`, `zone.thcs.base`
- **Kỷ vật dẫn vào:** `art_m1_03` (Biển tên "Căn cứ Bí mật" + Sổ bìa xanh ghi 5 điều luật)
- **Quy tắc xưng hô:** Chuẩn theo hệ thống xưng hô 5 người thân thiết.

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Ý tưởng tìm căn cứ riêng | `talk` | `q_m1_main_03.s01` | `NPC_A` (Đức) | Đức khởi xướng tìm chỗ riêng; Quân & Hạ đề xuất góc sân sau gần nhà kho. |
| Cảnh 2: Khảo sát góc sân sau | `goto` | `q_m1_main_03.s02` | Đi qua bãi đất sang `itr.thcs.old_table` | Đến bàn gỗ cũ góc căn cứ. |
| Cảnh 3: Chọn phong cách trang trí | `choice` (`measured: true`) | `q_m1_main_03.s03` | Châu (`NPC_B`) chủ trì | Chọn cách trang trí (`c_m1_03_decor`):<br>• `paper` (`playful`): "Gấp dây hạc giấy màu rực rỡ"<br>• `flowers` (`gentle`): "Cắm hoa dại và cành lá mộc mạc"<br>• `photos` (`deep`): "Dán những tấm ảnh chụp chung" |
| Cảnh 4: Soạn 5 điều luật vào sổ bìa xanh | `interact` | `q_m1_main_03.s04` | `itr.thcs.old_table` (bàn gỗ cũ) | 5 điều luật do từng người đề xuất:<br>1. Châu: Không tự lấy đồ người khác.<br>2. Đức: Ăn hết đồ ăn phải tự mua thêm.<br>3. Quân: Ai tới trước dọn chỗ ngồi.<br>4. Hạ: Ai buồn thì đừng bỏ bạn một mình.<br>5. Player: Chụp ảnh thì phải đủ người. |
| Cảnh 5: Treo biển tên Căn cứ | `cutscene` | `q_m1_main_03.s05` | Căn cứ bí mật | Cả nhóm treo biển tên, tuyên bố đây là "Căn cứ Bí mật" của nhóm 5 người. |
| Nhiệm vụ phụ: Bắn bi mắt mèo | `talk` + `interact` | `q_m1_side_04.s01-s02` | `NPC_D` (Quân) -> `itr.thcs.marble_spot` | Chơi bắn bi mắt mèo cùng Quân trên bãi đất phẳng. |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | `itr.thcs.duty_spot` | Kiểm tra vệ sinh khu vực sân. |
| Album: Căn cứ mới lập | `snapshot` | `alb.d.g07.02.01` | `cam.d0702.base` | Ảnh cả nhóm bên bàn gỗ căn cứ (`required_for_restore: true`). |

---

## 5. Trang 4 (`d.g07.03`) — Đủ năm đứa (Cuối lớp 7, Tháng 5/2016)
- **File dữ liệu:** `src/content/days/d_g07_03.ts`
- **Map:** `map_thcs` (variant `g07`) · Toàn bộ 6 khu vực mở
- **Kỷ vật dẫn vào:** `art_m1_05` (Bức ảnh nhóm bị ố chụp ở gốc phượng)
- **Điểm kết thúc demo:** Đạt `public_demo_completed` khi hoàn thành Trang 4 và trở về Hub 2026.

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Tụ họp cuối năm lớp 7 | `talk` | `q_m1_main_05.s01` | `NPC_A` (Đức) cùng cả nhóm | Cả nhóm chuẩn bị chia tay hè, quyết định chụp một tấm ảnh đủ mặt 5 người. |
| Cảnh 2: Lời hẹn năm lớp 8 | `choice` (`measured: true`) | `q_m1_main_05.s02` | Cả nhóm | Chọn lời hẹn (`c_m1_05_tone`):<br>• `playful` (Rộn ràng): "Năm sau đứa nào tới trễ phạt bao trà sữa!"<br>• `gentle` (Ấm áp): "Nghỉ hè nhớ giữ liên lạc nha mọi người."<br>• `deep` (Sâu lắng): "Hy vọng năm sau… tụi mình vẫn ngồi ở đây cùng nhau." |
| Cảnh 3: Đặt máy ảnh lên chân máy | `interact` | `q_m1_main_05.s03` | `itr.thcs.tripod_spot` (gốc phượng) | Cân chỉnh máy ảnh ở vị trí gốc phượng. |
| Cảnh 4: Chụp ảnh hẹn giờ 10 giây | `photo` | `q_m1_main_05.s04` | Sân trường gốc phượng | `mode: 'timer'`, countdown 10 giây, yêu cầu 5 nhân vật trong khung hình (`cam.d0703.group`). |
| Cảnh 5: Mưa rào và cầu vồng | `cutscene` | `q_m1_main_05.s05` | Căn cứ bí mật | Mưa rào bất chợt đổ xuống, cả nhóm ôm máy ảnh chạy ù vào Căn cứ trú mưa, nhìn cầu vồng sau mưa. |
| Nhiệm vụ phụ: Chào các góc quen | `goto` | `q_m1_side_02.s01` | 5 điểm quen thuộc | Ghé thăm 5 vị trí: rãnh nước, bảng đen, xe quà vặt cổng, bãi bi, bàn gỗ căn cứ. |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | `itr.thcs.duty_spot` | Trực nhật lần cuối trước khi nghỉ hè. |
| Album: Bức ảnh đủ năm đứa | `snapshot` | `alb.d.g07.03.01` | `cam.d0703.group` | Ảnh chụp hẹn giờ 5 người (`required_for_restore: true`). |
