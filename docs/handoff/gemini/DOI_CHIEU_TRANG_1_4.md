# BẢNG ĐỐI CHIẾU SỐ HÓA KỊCH BẢN TRANG 1–4 (MỐC 1: LỚP 6–7)
> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Nhiệm vụ:** Bổ sung các bước chơi còn thiếu vào Trang 1–4 đã số hóa  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Tài liệu nguồn:** `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4 APPROVED), `docs/gdd/01_NARRATIVE_AND_SCENES.md` §4, `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §1 & §2.4  
> **Ngày cập nhật:** 21/11/2026  

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
- **Quy tắc xưng hô:** Đức mới quen: "cậu - tớ", lỡ miệng lúc trực nhật: "mày - tao". Châu: "tui - {g:ông|bà}".

### Bảng đối chiếu từng bước kịch bản:
| Bước kịch bản (v1.4) | Loại bước | ID bước | Trạng thái trước đợt này | Xử lý trong đợt này |
|---|---|---|---|---|
| Cảnh A Bước 1: Tìm lớp (gặp Đức nhặt vở, dẫn vào lớp) | `talk` | `q_m1_main_01.s01` | Hiện có (gộp chung với mật lệnh) | Giữ ID cũ `s01`, giữ phần đầu thoại tìm lớp |
| Cảnh A Bước 2: Vào lớp & Đức chuyền mật lệnh, Châu gạch sửa | `talk` | `q_m1_main_01.s03` | Thiếu (nằm lẫn trong s01 cũ) | Tách thành bước mới `s03`, giữ nguyên văn thoại |
| Cảnh A Bước 2 (tiếp): Minigame giải mật lệnh | `minigame` (`mg_decode`) | `q_m1_main_01.s04` | Thiếu | Thêm mới `s04`, game `'mg_decode'`, level `'min'` |
| Cảnh A Bước 3: Đá cầu sân trường (Đức rủ và khoe tài đá cầu) | `talk` | `q_m1_main_01.s02` | Hiện có (gộp chung cả cảnh) | Giữ ID cũ `s02`, giữ phần đầu thoại đá cầu |
| Cảnh A Bước 3 (tiếp): Minigame đá cầu | `minigame` (`mg_shuttlecock`) | `q_m1_main_01.s05` | Thiếu | Thêm mới `s05`, game `'mg_shuttlecock'`, level `'min'` |
| Cảnh A Bước 4: Minigame lau bảng | `minigame` (`mg_wipe_board`) | `q_m1_main_01.s06` | Thiếu | Thêm mới `s06`, game `'mg_wipe_board'`, level `'min'` |
| Cảnh A Bước 4 (tiếp): Thoại trực nhật lỡ miệng "mày-tao" | `talk` | `q_m1_main_01.s07` | Thiếu (nằm lẫn trong s02 cũ) | Tách thành bước mới `s07`, giữ nguyên văn thoại |
| Cảnh B Bước 1: Tiệm tạp hóa, mua gói mì tôm cuối cùng | `talk` | `q_m1_main_01.s08` | Thiếu (nằm lẫn trong s02 cũ) | Tách thành bước mới `s08`, giữ nguyên văn thoại |
| Cảnh B Bước 1 (tiếp): Minigame bóp mì gói | `minigame` (`mg_noodle_squeeze`) | `q_m1_main_01.s09` | Thiếu | Thêm mới `s09`, game `'mg_noodle_squeeze'`, level `'min'` |
| Cảnh B Bước 2: Chuẩn bị chụp ảnh tự sướng | `talk` | `q_m1_main_01.s10` | Thiếu (nằm lẫn trong s02 cũ) | Tách thành bước mới `s10`, giữ nguyên văn thoại |
| Cảnh B Bước 2 (tiếp): Chụp ảnh handheld tự sướng 3 lần | `photo` (`handheld`) | `q_m1_main_01.s11` | Thiếu | Thêm mới `s11`, mode `'handheld'`, camera `'cam.d0601.bench'`, stand_zone `{ marker: 'spot.thcs.yard_bench_1', radius: 1.1 }` |
| Cảnh B Bước 2 (tiếp): Chọn ảnh giữ lại & Hứa chụp đủ bộ | `talk` | `q_m1_main_01.s12` | Thiếu (nằm lẫn trong s02 cũ) | Tách thành bước mới `s12`, giữ nguyên văn thoại |
| Nhiệm vụ phụ: Trực nhật đầu năm | `talk` + `arrive` | `q_m1_side_01.s01-s02` | Hiện có | Giữ nguyên |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | Hiện có | Giữ nguyên |
| Album: Ảnh bộ ba ở ghế đá | `snapshot` | `alb.d.g06.01.01` | Trỏ vào s02 cũ | Cập nhật `at_step_id: 'q_m1_main_01.s11'` trỏ đúng bước chụp mới |

---

## 3. Trang 2 (`d.g07.01`) — Thuyền giấy dưới mái hiên (Đầu lớp 7, Chiều mưa 2015)
- **File dữ liệu:** `src/content/days/d_g07_01.ts`
- **Map:** `map_thcs` (variant `g07`) · Open zones: `zone.thcs.yard`, `zone.thcs.corridor`, `zone.thcs.classroom`
- **Kỷ vật dẫn vào:** `art_m1_02` (Chiếc thuyền giấy phai màu, có chữ ký và điều ước của năm đứa)
- **Quy tắc xưng hô:** Đức: "mày - tao" với nhóm cũ; Châu: "tui - {g:ông|bà}"; Hạ: xưng tên "Hạ", gọi tên bạn; Quân: "cậu - tớ".

### Bảng đối chiếu từng bước kịch bản:
| Bước kịch bản (v1.4) | Loại bước | ID bước | Trạng thái trước đợt này | Xử lý trong đợt này |
|---|---|---|---|---|
| Bước 1 · Trú mưa dưới hiên hành lang | `talk` | `q_m1_main_02.s01` | Hiện có | Giữ nguyên `s01` |
| Bước 2 · Hai người lạ gấp thuyền giấy | `talk` | `q_m1_main_02.s02` | Hiện có | Giữ nguyên `s02` |
| Bước 3 · Gấp thuyền và viết lời ước | `choice` (`measured: true`) | `q_m1_main_02.s03` | Hiện có | Giữ nguyên `s03` (`c_m1_02_wish`) |
| Bước 4 · Chụp ảnh năm chiếc thuyền lúc vừa thả | `photo` (`handheld`) | `q_m1_main_02.s06` | Thiếu (trước bị dời vào cutscene cuối) | Thêm mới `s06`, mode `'handheld'`, camera `'cam.d0701.boats'`, subjects `[]` (ảnh thuyền không có người) |
| Bước 4 (tiếp) · Minigame đua thuyền | `minigame` (`mg_boat_race`) | `q_m1_main_02.s07` | Thiếu (trước thay bằng interact kể chuyện) | Thêm mới `s07`, game `'mg_boat_race'`, level `'min'` thay đoạn kể |
| Bước 4 (tiếp) · Thoại kết quả sau đua thuyền (Đức lật, Quân nhất) | `talk` | `q_m1_main_02.s04` | Hiện có (trước là interact) | Giữ ID cũ `s04`, chuyển thành talk đứng sau trò, giữ nguyên 100% thoại kịch bản |
| Bước 5 · Ký tên lên buồm chiếc thuyền vớt được | `cutscene` | `q_m1_main_02.s05` | Hiện có | Giữ nguyên `s05` |
| Nhiệm vụ phụ: Mẹo gấp thuyền của Quân | `talk` + `goto` | `q_m1_side_03.s01-s02` | Hiện có | Giữ nguyên |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | Hiện có | Giữ nguyên |
| Album: Năm chiếc thuyền giấy | `snapshot` | `alb.d.g07.01.01` | Trỏ vào s05 cũ | Cập nhật `at_step_id: 'q_m1_main_02.s06'` trỏ đúng bước chụp mới lúc vừa thả |

---

## 4. Trang 3 (`d.g07.02`) — Căn cứ bí mật (Giữa lớp 7, Đầu HK II, 2016)
- **File dữ liệu:** `src/content/days/d_g07_02.ts`
- **Map:** `map_thcs` (variant `g07`) · Open zones: `zone.thcs.corridor`, `zone.thcs.yard`, `zone.thcs.gate`, `zone.thcs.field`, `zone.thcs.base`
- **Kỷ vật dẫn vào:** `art_m1_03` (Biển tên "Căn cứ Bí mật" + Sổ bìa xanh ghi 5 điều luật)
- **Quy tắc xưng hô:** Chuẩn theo hệ thống xưng hô 5 người thân thiết.

### Bảng đối chiếu từng bước kịch bản:
| Bước kịch bản (v1.4) | Loại bước | ID bước | Trạng thái trước đợt này | Xử lý trong đợt này |
|---|---|---|---|---|
| Bước 1 · Ý tưởng tìm căn cứ riêng | `talk` | `q_m1_main_03.s01` | Hiện có | Giữ nguyên `s01` |
| Bước 2 · Khảo sát 3 chỗ (mái che, gốc cây, thùng giấy cũ) | `goto` | `q_m1_main_03.s02` | Hiện có (`goto` `itr.thcs.old_table`) | Giữ `s02` trỏ `itr.thcs.old_table` do bản đồ chưa có 3 marker riêng; ghi câu hỏi bổ sung marker vào `QUESTIONS_LOG.md` theo quy tắc 4 |
| Bước 3 · Dựng Căn cứ (dọn dẹp & kê bàn ghế) | `minigame` (`mg_build_base`) | `q_m1_main_03.s06` | Thiếu | Thêm mới `s06`, game `'mg_build_base'`, level `'min'` |
| Bước 3 (tiếp) · Chọn kiểu trang trí | `choice` (`measured: true`) | `q_m1_main_03.s03` | Hiện có | Giữ nguyên `s03` (`c_m1_03_decor`) |
| Bước 4 · Viết 5 điều luật vào sổ | `minigame` (`mg_base_rules`) | `q_m1_main_03.s07` | Thiếu | Thêm mới `s07`, game `'mg_base_rules'`, level `'min'` |
| Bước 4 (tiếp) · Thoại 5 điều luật của 5 người | `talk` | `q_m1_main_03.s04` | Hiện có (trước là interact) | Giữ ID cũ `s04`, chuyển thành talk, giữ nguyên 100% thoại 5 điều luật |
| Bước 5 · Treo biển tên Căn cứ | `cutscene` | `q_m1_main_03.s05` | Hiện có | Giữ nguyên `s05` |
| Nhiệm vụ phụ: Bắn bi mắt mèo | `talk` + `interact` | `q_m1_side_04.s01-s02` | Hiện có | Giữ nguyên |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | Hiện có | Giữ nguyên |
| Album: Căn cứ mới lập | `snapshot` | `alb.d.g07.02.01` | Hiện có | Giữ `snapshot: { camera_id: 'cam.d0702.base', at_step_id: 'q_m1_main_03.s05' }` |

---

## 5. Trang 4 (`d.g07.03`) — Đủ năm đứa (Cuối lớp 7, Tháng 5/2016)
- **File dữ liệu:** `src/content/days/d_g07_03.ts`
- **Map:** `map_thcs` (variant `g07`) · Toàn bộ 6 khu vực mở
- **Kỷ vật dẫn vào:** `art_m1_05` (Bức ảnh nhóm bị ố chụp ở gốc phượng)
- **Quy tắc xưng hô:** Chuẩn theo hệ thống xưng hô 5 người thân thiết.

### Bảng đối chiếu từng bước kịch bản:
| Bước kịch bản (v1.4) | Loại bước | ID bước | Trạng thái trước đợt này | Xử lý trong đợt này |
|---|---|---|---|---|
| Bước 1 · Ý tưởng chụp ảnh đủ năm đứa cuối năm lớp 7 | `talk` | `q_m1_main_05.s01` | Hiện có | Giữ nguyên `s01` |
| Bước 2 · Chuẩn bị & Chọn dáng chụp | `choice` (`measured: true`) | `q_m1_main_05.s02` | Hiện có | Giữ nguyên `s02` (`c_m1_05_tone`) |
| Bước 2 (tiếp) · Minigame xếp đội hình trước khi chụp | `minigame` (`mg_lineup`) | `q_m1_main_05.s06` | Thiếu | Thêm mới `s06`, game `'mg_lineup'`, level `'min'` trước khi chụp |
| Bước 3 · Đặt máy ảnh lên ghế đá gốc phượng | `interact` | `q_m1_main_05.s03` | Hiện có | Giữ nguyên `s03` (`itr.thcs.tripod_spot`) |
| Bước 3 (tiếp) · Chụp ảnh hẹn giờ 10 giây (lần 1 - trước mưa) | `photo` (`timer`) | `q_m1_main_05.s04` | Hiện có | Giữ nguyên `s04`, mode `'timer'`, camera `'cam.d0703.group'`, subjects đủ 5 người |
| Bước 4 & 5 · Trú mưa rào ở Căn cứ và ngắm cầu vồng | `cutscene` | `q_m1_main_05.s05` | Hiện có (gộp chung cả cảnh dán ảnh) | Giữ ID cũ `s05`, giữ đoạn thoại trú mưa và ngắm cầu vồng |
| Bước 6 · Dán ảnh kỷ niệm đủ năm đứa ở Căn cứ | `cutscene` | `q_m1_main_05.s07` | Thiếu (nằm lẫn trong s05 cũ) | Tách thành bước mới `s07`, giữ nguyên văn thoại |
| Bước hẹn giờ lần 2 (cầu vồng sau mưa) | `photo` (`timer`) | — | Chưa có camera / ô Album | Hiện bản đồ chỉ có 1 camera tại sân trường và Album chỉ có 1 ô `main_photo`. Đặt câu hỏi trong `QUESTIONS_LOG.md` theo chỉ dẫn của chủ dự án |
| Nhiệm vụ phụ: Đi dạo một vòng các khu trường cũ | `goto` (5 bước) | `q_m1_side_02.s01-s05` | Hiện có | Giữ nguyên |
| Nhiệm vụ ngày: Chỗ trực nhật | `interact` | `q_m1_daily_01.s01` | Hiện có | Giữ nguyên |
| Album: Bức ảnh đủ năm đứa | `snapshot` | `alb.d.g07.03.01` | Hiện có | Giữ `snapshot: { camera_id: 'cam.d0703.group', at_step_id: 'q_m1_main_05.s04' }` |
