# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 1–4 (MỐC 1: LỚP 6–7)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** N-01 — Sửa dữ liệu Mốc 1 theo quyết định B/C/D đã chốt  
> **Agent thực hiện:** Antigravity (Gemini 3.8)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4 APPROVED), `docs/gdd/01_NARRATIVE_AND_SCENES.md` (v1.0 APPROVED), `docs/PAGE_DATA_GUIDE.md`, `docs/NEXT_SPRINT_TASK_BOARD.md` (thẻ N-01)  
> **Ngày cập nhật:** 22/11/2026  

---

## 1. Hub 2026 — Mở đầu & Kết thúc Demo
- **File dữ liệu:** `src/content/hub.ts`
- **Ownership:** `HUMAN_CANON` · Spec Ready · Version `v1.4`

| Cảnh / Đoạn kịch bản | Loại bước | ID bước / Đối tượng | Thoại & Logic số hóa | Đối chiếu GDD / Repo |
|---|---|---|---|---|
| **Mở đầu:** Phòng trọ năm 2026, ánh đèn bàn, thùng carton cũ "Đồ cũ - đừng vứt" | `cutscene` | `q_hub_pd_01.s01` | Narrator: 2 câu dẫn bối cảnh.<br>Player: "Mật lệnh này… ai viết mà nhìn chẳng hiểu gì hết vậy?", "Không biết ngày đó tụi mình bắt đầu chơi với nhau từ lúc nào nhỉ?" | `KICH_BAN_DEMO_M1_M2_v1.md` §MỞ ĐẦU |
| **Tương tác:** Mở Hộp Kỷ Vật | `interact` | `q_hub_pd_01.s02` | Target: `itr.hub.memory_box`. Tự động hoàn thành khi bấm vào thùng. | `map_hub` / `systems/hub.ts` |
| **Kỷ vật đầu tiên:** Mẩu giấy gấp tư mật lệnh | `artifact` | `art_m1_01` | Dẫn vào Trang 1 (`d.g06.01`). | GDD Phụ lục A |
| **Kết demo:** Tìm lại nhóm chat cũ trên điện thoại | `phone_ui` | `q_hub_pd_02.s01` | Mở màn hình `group_chat`, nhóm `thread.old_group` ("Căn cứ Bí mật"). Lịch sử chat đủ 4 bạn cũ. | `01_NARRATIVE_AND_SCENES.md` §7.2 |
| **Kết demo:** Soạn tin nhắn gửi nhóm bạn cũ | `compose_message` | `q_hub_pd_03.s01` | 3 sắc thái mở lời:<br>• `playful`: "Ê. Nhớ hồi tụi mình mới đủ năm đứa không? Lâu quá rồi ha."<br>• `gentle`: "Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?"<br>• `deep`: "Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha." | `KICH_BAN_DEMO_M1_M2_v1.md` §KẾT THÚC DEMO |
| **Sự kiện hiện tại (PDE):** Thêm mảnh trực nhật | `pde` | `pde_03` | Kích hoạt khi xong `q_m1_ai_side_01` (đã cập nhật từ `q_m1_side_01`). | N-01 & N-08 |

---

## 2. Trang 1 (`d.g06.01`) — Mật lệnh số 01 (Lớp 6, 2014)
- **File dữ liệu:** `src/content/days/d_g06_01.ts`
- **Map:** `map_thcs` (variant `g06`) · Open zones: `zone.thcs.yard`, `zone.thcs.corridor`, `zone.thcs.classroom`, `zone.thcs.gate` (Cảnh B ở tiệm tạp hóa)
- **Chỗ đứng NPC:** Đức `spot.thcs.grocery_1`, Châu `spot.thcs.grocery_2` — bậc thềm tiệm tạp hóa, trong khung `cam.thcs.grocery`, để ảnh bộ ba `s07` có đủ người (N-14 phát hiện 3 tấm trống). NPC đứng yên cả Ngày và `s02`–`s07` tự hiện, nên người chơi gặp Đức ở `s01` tại đây rồi ở lại tới lúc chụp.
- **Kỷ vật dẫn vào:** `art_m1_01` (Mẩu giấy gấp tư đầy hình vẽ ký hiệu và nét bút bi đỏ sửa lỗi của Châu Tổng)
- **Quy tắc xưng hô:** Đức mới quen: "cậu - tớ", lỡ miệng lúc trực nhật: "mày - tao". Châu: "tui - ông" (sửa câu trực nhật thành "Mới quen một bữa mà ông mày tao rồi hả?").
- **Chuẩn hóa N-01 (B1, B2, B3, C1, G-7):** Tách 7 bước canonical, Side/Daily gắn `AI_PROPOSED` + `[PLACEHOLDER]`.

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Sân trường đầu năm, gió bay vở | `talk` | `q_m1_main_01.s01` | `NPC_A` (Đức) | Đức nhặt hộ vở, làm quen, tìm bảng phân lớp `itr.thcs.class_list`. |
| Cảnh 2: Mật lệnh số 01 | `minigame` | `q_m1_main_01.s02` | `mg_cipher` | Trò mật lệnh: Châu sửa lỗi chính tả bằng bút bi đỏ. |
| Cảnh 3: Đá cầu sân trường | `minigame` | `q_m1_main_01.s03` | `mg_footbag` | Trò đá cầu ba đứa tại `itr.thcs.shuttle_ring`. |
| Cảnh 4: Trực nhật lớp học | `minigame` | `q_m1_main_01.s04` | `mg_wipe_board` | Lau bảng lớp học; Đức lỡ miệng xưng mày tao, Châu chỉnh xưng hô. |
| Cảnh 5: Chuyển cảnh thời gian | `cutscene` | `q_m1_main_01.s05` | Narrator | Thẻ chữ "Mấy tháng sau". |
| Cảnh 6: Ăn mì tôm bóp | `minigame` | `q_m1_main_01.s06` | `mg_noodle` | Bóp mì tôm tại bậc thềm tiệm tạp hóa (`itr.thcs.grocery_steps`). |
| Cảnh 7: Chụp ảnh bộ ba | `photo` | `q_m1_main_01.s07` | `cam.d0601.grocery` | Ảnh tự sướng ba đứa (`mode: 'handheld'`), lưu vào `alb.d.g06.01.01`. |
| Nhiệm vụ phụ (đề xuất): Trực nhật đầu năm | `talk` + `arrive` | `q_m1_ai_side_01.s01` | `NPC_B` (Châu) -> `itr.thcs.flagpole` | `[PLACEHOLDER]` Châu nhắc lịch trực nhật, ra quan sát cột cờ. |
| Nhiệm vụ ngày (duy nhất mốc 1): Chỗ trực nhật | `interact` | `q_m1_ai_daily_01.s01` | `itr.thcs.duty_spot` | `[PLACEHOLDER]` Thu dọn dụng cụ trực nhật (G-7: khai duy nhất tại Trang 1). |
| Album: Ảnh bộ ba ở thềm tạp hóa | `snapshot` | `alb.d.g06.01.01` | `cam.d0601.grocery` | `at_step_id: 'q_m1_main_01.s07'` (`required_for_restore: true`). |

---

## 3. Trang 2 (`d.g07.01`) — Thuyền giấy dưới mái hiên (Đầu lớp 7, Chiều mưa 2015)
- **File dữ liệu:** `src/content/days/d_g07_01.ts`
- **Map:** `map_thcs` (variant `g07`) · Open zones: `zone.thcs.yard`, `zone.thcs.corridor`, `zone.thcs.classroom`
- **Kỷ vật dẫn vào:** `art_m1_02` (Chiếc thuyền giấy phai màu, có chữ ký và điều ước của năm đứa)
- **Quy tắc xưng hô:** Đức: "mày - tao" với nhóm cũ; Châu: "tui - ông/bà"; Hạ: xưng tên "Hạ", gọi tên bạn; Quân: "cậu - tớ".
- **Chuẩn hóa N-01 (B4, C1, C3, G-7):** Marker camera `cam.thcs.gutter`; bước 4 đổi thành `minigame 'mg_boat'`; gỡ daily trùng lặp.

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Trú mưa dưới hiên hành lang | `talk` | `q_m1_main_02.s01` | `NPC_A` (Đức), `NPC_B` (Châu) | Đức và Châu cãi nhau về bài tập hè dưới cơn mưa lớn. |
| Cảnh 2: Thấy hai bạn lớp bên gấp thuyền giấy | `talk` | `q_m1_main_02.s02` | `NPC_C` (Hạ), `NPC_D` (Quân) | Làm quen Hạ & Quân, rủ chơi thi đua thuyền giấy. Châu làm trọng tài. |
| Cảnh 3: Viết điều ước lên cánh buồm | `choice` (`measured: true`) | `q_m1_main_02.s03` | Prompt từ Hạ (`NPC_C`) | Lựa chọn điều ước (`c_m1_02_wish`): `friendship` (`gentle`) / `fun` (`playful`) / `secret` (`deep`). |
| Cảnh 4: Thả thuyền đua rãnh nước | `minigame` | `q_m1_main_02.s04` | `mg_boat` | Trò đua thuyền giấy rãnh nước, giữ thoại kết quả gốc. |
| Cảnh 5: Ký tên lên buồm chiếc thuyền vớt được | `cutscene` | `q_m1_main_02.s05` | Cả nhóm 5 người | Hạ vớt thuyền, cả nhóm ký tên, chính thức kết bạn 5 người. |
| Nhiệm vụ phụ (đề xuất): Mẹo gấp thuyền | `talk` | `q_m1_ai_side_03.s01` | `NPC_D` (Quân) | `[PLACEHOLDER]` Quân chỉ cách gấp thuyền giấy đáy rộng. |
| Album: Năm chiếc thuyền giấy | `snapshot` | `alb.d.g07.01.01` | `cam.d0701.boats` (`cam.thcs.gutter`) | `at_step_id: 'q_m1_main_02.s05'` (`required_for_restore: true`). |

---

## 4. Trang 3 (`d.g07.02`) — Căn cứ bí mật (Giữa lớp 7, Đầu HK II, 2016)
- **File dữ liệu:** `src/content/days/d_g07_02.ts`
- **Map:** `map_thcs` (variant `g07`) · Open zones: `zone.thcs.corridor`, `zone.thcs.yard`, `zone.thcs.gate`, `zone.thcs.field`, `zone.thcs.base`
- **Kỷ vật dẫn vào:** `art_m1_03` (Biển tên "Căn cứ Bí mật" + Sổ bìa xanh ghi 5 điều luật)
- **Chuẩn hóa N-01 (B5, C1, C2, D2, G-7):** Bước collect 3 điểm khảo sát; trả lời lựa chọn về "Giấy màu"/"Hoa"/"Ảnh"; minigame dựng căn cứ & viết luật; ảnh chính là biển tên.

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Ý tưởng tìm căn cứ riêng | `talk` | `q_m1_main_03.s01` | `NPC_A` (Đức) | Đức khởi xướng tìm chỗ riêng; Quân & Hạ đề xuất góc sân sau gần nhà kho. |
| Cảnh 2: Khảo sát góc sân sau | `collect` | `q_m1_main_03.s02` | 3 điểm: `itr.thcs.base_survey_roof/stump/boxes` | Khảo sát mái tôn, gốc cây, chồng thùng gỗ. |
| Cảnh 3: Chọn phong cách trang trí | `choice` (`measured: true`) | `q_m1_main_03.s03` | Châu (`NPC_B`) | Chọn trang trí (`c_m1_03_decor`): "Giấy màu" (`paper`), "Hoa" (`flowers`), "Ảnh" (`photos`). |
| Cảnh 4: Dựng và dọn dẹp Căn cứ | `minigame` | `q_m1_main_03.s04` | `mg_base_build` | Minigame thu dọn, xếp bàn ghế, dựng lều căn cứ. |
| Cảnh 5: Viết 5 điều luật vào sổ | `minigame` | `q_m1_main_03.s05` | `mg_rules` | Minigame ghi 5 điều luật vào sổ bìa xanh theo lượt. |
| Cảnh 6: Treo biển tên Căn cứ | `cutscene` | `q_m1_main_03.s06` | Căn cứ bí mật | Treo biển "Căn cứ Bí mật", chốt hoàn thành căn cứ. |
| Album: Biển tên Căn cứ Bí mật | `snapshot` | `alb.d.g07.02.01` | `cam.d0702.base` (`cam.thcs.base_sign`) | `at_step_id: 'q_m1_main_03.s06'` (`required_for_restore: true`). |

---

## 5. Trang 4 (`d.g07.03`) — Đủ năm đứa (Cuối lớp 7, Tháng 5/2016)
- **File dữ liệu:** `src/content/days/d_g07_03.ts`
- **Map:** `map_thcs` (variant `g07_end`) · Toàn bộ 6 khu vực mở
- **Thời tiết (N-05):** `weather_by_step` — `q_m1_main_05.s06`: `rain_shower` (mưa, chạy về Căn cứ), `q_m1_main_05.s07`: `after_rain_rainbow` (ảnh cầu vồng).
- **Kỷ vật dẫn vào:** `art_m1_05` (Bức ảnh nhóm bị ố chụp ở gốc phượng, `appear_when: { day: 'd.g07.02' }` theo C4)
- **Chuẩn hóa N-01 (B6, B7, C1, C4, C5, D1, G-1, G-7):**
  - Nhãn `itr.thcs.tripod_spot`: `'Ghế đá dưới gốc phượng'` (B7).
  - Thêm camera `cam.d0703.rainbow` (`cam.thcs.rainbow`).
  - Flag lựa chọn: `m1.group_photo_style` (kiểu ảnh đủ năm đứa: `playful` / `gentle` / `deep`).
  - Minigame `mg_lineup`: xếp đội hình 5 người trước khi bấm hẹn giờ (G-1).
  - Tách cutscene mưa rào thành: trú mưa & ngắm cầu vồng (`s06`) -> ảnh cầu vồng bìa Album (`s07`) -> dán ảnh Căn cứ (`s08`).
  - Album bìa: `alb.d.g07.03.cover` lưu ảnh cầu vồng (`cam.d0703.rainbow`).
  - Side quest đổi tên: `q_m1_ai_side_02` (`[PLACEHOLDER]`). Gỡ daily trùng lặp (G-7).

| Bước kịch bản | Thao tác / Loại bước | ID bước | Nhân vật / Vị trí | Nội dung số hóa |
|---|---|---|---|---|
| Cảnh 1: Tụ họp cuối năm lớp 7 | `talk` | `q_m1_main_05.s01` | `NPC_A` (Đức) cùng cả nhóm | Đức rủ chụp một tấm đủ mặt 5 người làm kỷ niệm cuối năm lớp 7. |
| Cảnh 2: Kiểu ảnh đủ năm đứa | `choice` (`measured: true`) | `q_m1_main_05.s02` | `NPC_A` (Đức) | Lựa chọn kiểu ảnh (`c_m1_05_tone`, flag `m1.group_photo_style`):<br>• `playful`: "Tạo dáng nhí nhố làm mặt hề"<br>• `gentle`: "Đứng tự nhiên, khoác vai cười tươi"<br>• `deep`: "Nghiêm trang chỉnh tề như ảnh thẻ" |
| Cảnh 3: Đặt máy ảnh lên ghế đá | `interact` | `q_m1_main_05.s03` | `itr.thcs.tripod_spot` | Đặt máy ảnh lên ghế đá dưới gốc phượng. |
| Cảnh 4: Xếp đội hình 5 người | `minigame` | `q_m1_main_05.s04` | `mg_lineup` | Trò xếp đội hình 5 người dưới gốc phượng (G-1). |
| Cảnh 5: Chụp ảnh hẹn giờ 10 giây | `photo` | `q_m1_main_05.s05` | `cam.d0703.group` | Hẹn giờ 10 giây, chạy vào giữa đội hình (`alb.d.g07.03.01`). |
| Cảnh 6: Mưa rào và ngắm cầu vồng | `cutscene` | `q_m1_main_05.s06` | Căn cứ bí mật | Trú mưa rào ở Căn cứ; mưa tạnh ngắm cầu vồng hiện trên sân trường. |
| Cảnh 7: Chụp ảnh cả nhóm với cầu vồng | `photo` | `q_m1_main_05.s07` | `cam.d0703.rainbow` | Chụp ảnh cả nhóm với cầu vồng trên sân, đưa lên bìa Album (`alb.d.g07.03.cover`). |
| Cảnh 8: Dán ảnh kỷ niệm Căn cứ | `cutscene` | `q_m1_main_05.s08` | Căn cứ bí mật | Thẻ chữ "Mấy hôm sau" — dán ảnh kỷ niệm lên tường Căn cứ cạnh chiếc thuyền. |
| Nhiệm vụ phụ (đề xuất): Đi dạo trường cũ | `goto` | `q_m1_ai_side_02.s01-s05` | 5 điểm quen thuộc | `[PLACEHOLDER]` Ghé thăm 5 vị trí: rãnh nước, bảng đen, xe quà vặt, bãi bi, bàn gỗ căn cứ. |
| Album: Bức ảnh năm đứa dưới gốc phượng | `snapshot` | `alb.d.g07.03.01` | `cam.d0703.group` | `at_step_id: 'q_m1_main_05.s05'` (`required_for_restore: true`). |
| Album: Bìa Album ảnh cầu vồng | `snapshot` | `alb.d.g07.03.cover` | `cam.d0703.rainbow` | `at_step_id: 'q_m1_main_05.s07'` (`required_for_restore: true`). |
