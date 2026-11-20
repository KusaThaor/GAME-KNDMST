# 00_MASTER_GDD — Hành Trình Thanh Xuân: "Những Ngày Mình Còn Nhỏ"

| Trường | Giá trị |
|---|---|
| Phiên bản | **v1.0 APPROVED** |
| Ngày cập nhật | 20/11/2026 (UTC+7) |
| Trạng thái | **APPROVED** — chủ dự án duyệt ngày 20/11/2026. Mục ghi PROPOSED trong file là thiết kế đã duyệt để dựng; con số là giá trị khởi điểm, chỉnh khi chơi thử không cần xin duyệt lại. Mục ghi "Còn mở" vẫn chờ chốt |
| Phạm vi file | Tầm nhìn, vòng chơi cốt lõi, cấu trúc Mốc/Trang, art direction, bản đồ và luồng di chuyển |
| File đi kèm | `01_NARRATIVE_AND_SCENES.md` · `02_GAMEPLAY_AND_MECHANICS.md` · `03_ASSETS_AND_AUDIO.md` |
| Nguồn tổng hợp | Project Knowledge: `GDD_MASTER_v1_DRAFT` v1.1, `GDD.md` v0.3, `MEMORY_ALBUM_SYSTEM_v1`, `NARRATIVE_TIMELINE_BIBLE_v1`, `OPEN_DECISIONS_REGISTER_v1`, `06_VISUAL_BIBLE_STATUS` v0.3. Lịch sử chat: review kịch bản 19/11 (`REVIEW_KICH_BAN_M1_M2_v2`), kịch bản `KICH_BAN_DEMO_M1_M2_v1.md` v1.4 (19–20/11), quyết định chủ dự án 19/11 |

## Nhãn trạng thái dùng trong bộ GDD
| Nhãn | Nghĩa |
|---|---|
| **CONFIRMED** | Chủ dự án hoặc nhóm đã chốt (ghi ngày) |
| **PROPOSED** | Đề xuất, chưa duyệt — dev có thể dựng khung nhưng phải để dạng cấu hình |
| **UNDECIDED** | Chưa có phương án được chọn |
| **SUPERSEDED** | Đã bị quyết định mới thay; giữ để tra cứu, không làm theo |
| **[CẦN CHỐT LẠI]** | Hai nguồn mâu thuẫn hoặc có yêu cầu chưa có trong tài liệu; giữ cả hai, chờ chủ dự án chọn |

Quy tắc cho dev (từ bản APPROVED v1.0): dựng theo mọi mục CONFIRMED và PROPOSED trong bộ GDD. Mục ghi "Còn mở" hoặc UNDECIDED thì đưa vào file cấu hình, không viết cứng. Con số là giá trị khởi điểm, chỉnh khi chơi thử.

---

## 1. Tầm nhìn

### 1.1 Câu chuyện trong một đoạn
Năm 2026, `{player_name}` 23 tuổi, sống một mình, lục ra một thùng đồ cũ: một cuốn Album nhiều trang trắng và những món đồ vụn vặt thời đi học. Mỗi món dẫn về đúng một khoảnh khắc ở ngôi trường cấp 2 tại một thị trấn miền Nam — từ ngày đầu lớp 6 quen hai người bạn, tới lúc đủ năm đứa, rồi những ngày cuối lớp 9 sắp chia ba ngả trường. Chơi xong mỗi khoảnh khắc, một trang Album hiện rõ lại và căn phòng thêm một món đồ. Cuối bản demo, Player lấy hết can đảm nhắn một tin vào nhóm chat cũ đã im lặng nhiều năm.

### 1.2 Thông số cốt lõi
| Hạng mục | Giá trị | Trạng thái |
|---|---|---|
| Thể loại | 3D Narrative / Cozy Adventure, khám phá bán mở | CONFIRMED 14/11 |
| Nền tảng | Web, ưu tiên máy tính (chuột + bàn phím) | CONFIRMED 13/11 |
| Góc nhìn | Góc thứ ba trong ký ức; phòng 2026 góc cố định | CONFIRMED 13/11 |
| Bối cảnh | Trường THCS hư cấu ở miền Nam Việt Nam, 2014–2018 (bản public) | CONFIRMED 14/11 |
| Giọng điệu | Cozy, hoài niệm, tình bạn; không phản diện, mâu thuẫn nhỏ được hàn gắn | CONFIRMED 13/11 |
| Phong cách hình | Semi-chibi 3D, tươi sáng, không ám tối | CONFIRMED 20/11 |
| Player | Tự đặt tên, chọn ngoại hình nam/nữ, sinh năm 2003 | CONFIRMED 14/11 |
| Nhóm bạn | Player + Đức "Tí Nổ", Quân "Bắp", Minh Châu "Châu Tổng", Hạ "Mây" | CONFIRMED (giữ archetype 14/11) |
| Bản public (đo 05–15/12) | Mốc 1 + Mốc 2, mở đầu và kết thúc ở phòng 2026 | CONFIRMED 19/11 |
| Kiếm tiền | Bản môn học miễn phí; không thanh toán, quảng cáo, gacha | CONFIRMED 14/11 |
| Thời lượng chơi | Chưa đo. Con số cũ "60–90 phút / 6 chương" thuộc cấu trúc cũ | UNDECIDED (đo ở playtest) |

### 1.3 Năm trụ cột
1. **Hoài niệm chạm được** — đồ vật, âm thanh, thói quen học trò miền Nam 2014–2018.
2. **Khám phá tự do** — đi lại tự do trong mỗi cảnh ký ức, giữa các bước nhiệm vụ.
3. **Chữa lành, không độc hại** — không phản diện; cãi nhau, trêu quá đà, áp lực thi đều được nói ra và làm lành.
4. **Lớn lên cùng nhau** — Mốc 1 là tìm thấy nhau, Mốc 2 là sợ mất nhau.
5. **Quá khứ chạm tới hiện tại** — điều làm trong ký ức hiện ra ở phòng 2026 và trong tin nhắn cuối. *(PROPOSED)*

---

## 2. Cấu trúc trò chơi

### 2.1 Các lớp cấu trúc
| Lớp | Nội dung | Trạng thái |
|---|---|---|
| Phòng 2026 (Hub) | Phòng của Player: thùng kỷ vật, Album, kệ, bàn học, tường dán ảnh, điện thoại | CONFIRMED (có quest, 14/11) |
| Mốc 1 — lớp 6–7 (2014–2016) | Lớp 6 nhóm 3 người (Player, Đức, Châu); lớp 7 thêm Quân, Hạ thành nhóm 5 | CONFIRMED 14/11; D-01 Đức + Châu CONFIRMED 19/11 |
| Mốc 2 — lớp 8–9 (2016–2018) | Thân thiết, mâu thuẫn nhỏ, Hội trại lớp 9, cuối lớp 9 chia 3 trường | CONFIRMED 14/11 + 19/11 |
| Mốc 3 — lớp 10–12 (2018–2021) | Ba trường, COVID ở lớp 11, giữ nhóm 5 người | CONFIRMED về cốt truyện, **ngoài bản public** |
| **Trang** | Đơn vị chơi nhỏ nhất. 1 Trang = 1 trang Album = 1 kỷ vật dẫn vào; gồm 1–3 cảnh, các cảnh có thể cách nhau vài ngày tới vài tháng | CONFIRMED 19/11 (thay tên "Ngày ký ức") |
| Quest | Main (bắt buộc), Side (tùy chọn, không chặn Main), Daily (không grind, không reset theo giờ thật) | CONFIRMED 14/11; chi tiết ở `02` |
| Hội ngộ, ending | Không có trong bản public | UNDECIDED (D-08) |

**Mã dữ liệu:** mỗi Trang giữ mã `d.gNN.KK` (năm học + thứ tự). Đổi tên hiển thị không đổi mã. *(PROPOSED từ review 19/11)*

### 2.2 Chín Trang của bản public
| # | Mã (PROPOSED) | Tên Trang | Lớp · thời điểm | Kỷ vật dẫn vào |
|---|---|---|---|---|
| 1 | `d.g06.01` | Mật lệnh số 01 | Lớp 6 · 9/2014 → học kỳ I | Mẩu giấy mật lệnh có nét sửa đỏ |
| 2 | `d.g07.01` | Thuyền giấy dưới mái hiên | Đầu lớp 7 · chiều mưa | Thuyền giấy của Hạ, buồm có chữ ký và lời ước |
| 3 | `d.g07.02` | Căn cứ bí mật | Lớp 7 · đầu học kỳ II | Biển tên "CĂN CỨ BÍ MẬT" + sổ luật bìa xanh |
| 4 | `d.g07.03` | Đủ năm đứa | Cuối lớp 7 | Ảnh nhóm bị ố |
| — | — | *Chuyển Mốc ở phòng 2026* | "Mấy năm sau…" | Hộp phấn (mở Trang 5) |
| 5 | `d.g08.01` | Lên lớp 8 (có ván caro) | Khai giảng lớp 8 · 9/2016 | **KV-01:** hộp phấn còn một mẩu, nắp ghi tỉ số caro |
| 6 | `d.g08.02` | Confession | Sau Tết lớp 8 · 2/2017 | Tờ giấy vẽ chiếc lá, góc ghi "Chưa dám đưa" |
| 7 | `d.g09.01` | Tờ báo tường cuối cùng (có Sudoku) | Học kỳ I lớp 9 · 9–11/2017 | Bản báo tường thu nhỏ A5 |
| 8 | `d.g09.02` | Rã băng | Học kỳ II lớp 9 · 27/1/2018 + Hội trại | Tờ lịch 1/2018 khoanh ngày 27 |
| 9 | `d.g09.03` | Vẫn đủ năm đứa | Cuối lớp 9 · 5/2018 | Sổ lưu bút bìa kraft |

Trang 1 đã gộp hai Ngày cũ `d.g06.01` + `d.g06.02`; mã `d.g06.02` không dùng lại. *(PROPOSED 19/11)*

> **CONFIRMED 20/11 — Cấu trúc 9 Trang:** Mốc 1 = lớp 6–7, Mốc 2 = lớp 8–9, 9 Trang (4 + 5). Cấu trúc "2 cột mốc lớp 6 & lớp 9, 6 chương" của `GDD.md` v0.3 là **SUPERSEDED**. Không dùng chữ "Chương" làm đơn vị chơi.

> **CONFIRMED 20/11 — Năm học:** lớp 6 là năm học **2014–2015**. Chủ dự án sửa ô hướng dẫn Project ngày 20/11 (D-23). Ghi "lớp 6 năm học 2012–2013" và "bản public ít nhất hai chương": SUPERSEDED.

---

## 3. Vòng chơi cốt lõi (Core Gameplay Loop)

### 3.1 Vòng lớn: phòng 2026 ↔ ký ức
~~~
Phòng 2026 ──▶ chọn kỷ vật đang sáng trong thùng ──▶ câu nói của Player năm 2026
     ▲                                                      │
     │                                              chuyển cảnh vào ký ức
     │                                                      ▼
Về phòng: trang Album phục hồi,           Trang ký ức (1–3 cảnh, mỗi cảnh có thẻ chữ thời gian)
đồ vật mới đặt trong phòng,      ◀──      đi lại tự do · chuỗi Main · Side tùy chọn · ảnh chính
kỷ vật kế tiếp sáng lên                    Hết Trang khi xong bước Main cuối của cảnh cuối
~~~
*(CONFIRMED về ý: Album là hệ tiến trình trung tâm, kỷ vật dẫn về quá khứ — 14/11. Chi tiết bước: PROPOSED)*

### 3.2 Vòng nhỏ trong một cảnh
1. **Đến:** thẻ chữ thời gian ("Lớp 7. Một chiều mưa.") + vài câu thoại mở.
2. **Tự do:** đi lại trong khu được mở, chạm đồ vật để nghe hồi tưởng ngắn, nói chuyện với bạn, chụp ảnh tự do.
3. **Bước Main:** làm theo dấu mục tiêu. Mỗi bước là một trong 6 kiểu tương tác (§3.3).
4. **Ảnh chính:** chụp và bấm "Giữ ảnh này". Chất lượng ảnh không chặn tiến trình.
5. **Hết cảnh / hết Trang** → lưu tự động.

### 3.3 Sáu kiểu tương tác dùng lại *(PROPOSED 19/11)*
Mọi trò nhỏ trong kịch bản quy về 6 kiểu. Từ 20/11 (CONFIRMED), người chơi **chơi thật**: mỗi trò có luật, điều kiện thắng/thua hoặc chấm sao, và chơi lại được. Ngoài 6 kiểu này còn các minigame riêng: Caro, Sudoku, Lật chai và Khu Vui Chơi Căn cứ. Luật chi tiết ở `02_GAMEPLAY_AND_MECHANICS.md`.

| Kiểu | Người chơi làm | Ví dụ trong kịch bản |
|---|---|---|
| **K1** Đi tới – nói – chọn | Tới người/vật, nghe thoại, chọn 1 trong 2–3 câu | Tìm lớp, tìm 4 bạn, đi tìm Châu ở Căn cứ, lửa trại |
| **K2** Chụp ảnh | Cầm tay hoặc hẹn giờ; "Giữ ảnh này" | Ảnh bộ ba, ảnh đủ năm đứa, ảnh bàn caro |
| **K3** Nhặt – đặt – sắp xếp | Kéo/đặt vật vào chỗ | Dựng Căn cứ, dán báo tường, xếp ghế xem bóng đá, ký áo |
| **K4** Ghép cặp – giải mã | Nối trái với phải, chọn mảnh đúng | Mật lệnh ký hiệu, viết luật Căn cứ |
| **K5** Canh lực – canh nhịp | Giữ chuột nạp lực rồi thả; hoặc bấm đúng nhịp | Đá cầu, thả thuyền, lật chai, cổ vũ theo trống |
| **K6** Giữ để làm | Giữ chuột trên một vùng tới khi đầy | Lau bảng, bóp gói mì, tô cờ |

### 3.4 Nguyên tắc chơi
- Minigame **có thắng/thua**, nhưng **thua không bao giờ chặn câu chuyện**: thắng hay thua đều đi tiếp, chỉ đổi vài câu thoại. Luôn có nút Chơi lại. *(CONFIRMED 20/11; thay nguyên tắc "không có thua" ngày 13/11 — SUPERSEDED)*
- Side không bao giờ chặn Main. Sắp chuyển cảnh mà còn Side đang mở thì hỏi "Còn việc chưa làm, đi tiếp không?".
- Lựa chọn hầu hết chỉ đổi lời thoại tại chỗ. Một số ít được lưu để nhắc lại về sau (danh sách ở `01` §7).
- Không có túi đồ kiểu nhập vai: người chơi chỉ có đồ đang cầm và Album. *(PROPOSED)*
- Giữa các Trang đi tuyến tính theo thời gian; trong một cảnh thì tự do.

---

## 4. Luồng chơi bản public
| Bước | Nơi | Người chơi làm | Kết thúc khi |
|---|---|---|---|
| 0 · Mở đầu | Phòng 2026, buổi tối | Nhập tên, chọn ngoại hình nam/nữ, mở thùng, cầm mẩu giấy mật lệnh | Mở mẩu giấy |
| 1–4 | Ký ức Mốc 1 | Chơi Trang 1 → 4; sau mỗi Trang về phòng | Giữ ảnh cầu vồng ở Trang 4 |
| Chuyển Mốc | Phòng 2026 | Ảnh đủ năm đứa lên bìa Album → thẻ "Mấy năm sau…" → hộp phấn sáng | Mở hộp phấn |
| 5–9 | Ký ức Mốc 2 | Chơi Trang 5 → 9 (Trang 8 có Hội trại) | Hết cutscene "Cuối hè" ở Trang 9 |
| Kết demo | Phòng 2026 | Đọc Điều 6 trong sổ luật → mở điện thoại → nhóm chat cũ → chọn 1 trong 3 tin → Gửi | Màn "Đã gửi… (còn tiếp)" |
| Sau kết | Web | Ghi hoàn thành demo **trước** → mở form phản hồi | Gửi form hoặc đóng |

*(Luồng: PROPOSED 19/11. Thứ tự "ghi hoàn thành trước form": CONFIRMED 13/11.)*

**Phạm vi bắt buộc (Tầng A):** chuỗi Main của 9 Trang; Hội trại Phần 1 và Phần 4; điểm kết nhắn tin. **Tầng B (nếu kịp):** lật chai; Khu Vui Chơi Căn cứ (Bắn bi ve, Ô ăn quan, Nhảy lò cò); một số Side Mốc 1. **Tầng C (sau public):** Side, Daily còn lại, Hội trại Phần 2–3. *(Phạm vi M1 + M2: CONFIRMED 19/11. Danh sách nâng/gộp/lùi từng Side: còn mở — nhóm chốt.)*

---

## 5. Thế giới và bản đồ

### 5.1 Danh sách bản đồ cho bản public
| ID | Bản đồ | Dùng cho | Trạng thái |
|---|---|---|---|
| `hub_room` | Phòng 2026 | Mở đầu, giữa các Trang, chuyển Mốc, kết demo | CONFIRMED (góc cố định) |
| `map_thcs` | Trường THCS + cổng + ngõ quà vặt + Căn cứ; một bản đồ dùng chung lớp 6–9 | Trang 1–9 | CONFIRMED 14/11 (dùng chung); đang dựng |
| Màn hình 2D | Trang confession, điện thoại, nhóm chat | Trang 6, kết demo | PROPOSED |
| `map_town`, `map_thpt_p` | Khu phố, trường cấp 3 | Mốc 3 | Ngoài bản public |

Biến thể theo năm học = **bộ trang trí + bộ ánh sáng/thời tiết**, không dựng lại bản đồ. *(PROPOSED)*

### 5.2 Các khu trong `map_thcs`
| Khu | Gồm | Trang dùng |
|---|---|---|
| **Z01 Lớp học** | Bàn ghế đôi, bảng đen, bục giảng, góc báo tường, bảng đếm ngược (lớp 9) | 1, 5, 6, 7 |
| **Z02 Sân trường** | Cột cờ, ghế đá, cây phượng, cây bàng, vòng đá cầu, cột bóng rổ góc sân | 1, 4, 5, 6 (ghế đá), 8 (đất trại), 9 |
| **Z02b Hành lang + mái hiên** | Bảng phân lớp, lối vào lớp, mái hiên trú mưa, rãnh nước thả thuyền | 1, 2, 6 |
| **Z03 Cổng + ngõ quà vặt** | Cổng sắt, xe quà vặt (chỗ lật chai, thay cho căn-tin), tiệm tạp hóa (bậc thềm, tivi, ghế nhựa) | 1, 5, 8, 9 |
| **Z04 Bãi đất trống** | Đất, cỏ, vũng nước | Ít dùng ở bản public |
| **Z05 Căn cứ bí mật** | Trong trường, góc sân sau gần nhà kho. Mái che, gốc cây, thùng giấy, bàn kê, biển tên; **Khu Vui Chơi Tuổi Thơ** (Ô ăn quan, Nhảy lò cò, Bắn bi ve) mở sau Trang 3 | 3, 4, 6, 7, 9 |

> **CONFIRMED 20/11 — Vị trí Căn cứ:** **trong trường**, góc sân sau gần nhà kho. Phương án "ngoài hàng rào" của `GDD.md` v0.3: SUPERSEDED.

> **CONFIRMED 20/11 — Không dựng căn-tin:** mọi cảnh "căn-tin" (lật chai, mua đồ ăn vặt) chuyển về **Z03 — xe quà vặt và tiệm tạp hóa cổng trường**. Lần trêu thứ ba ở Trang 6 đặt ở **ghế đá sân trường giờ ra chơi** (CONFIRMED 20/11).

> **CONFIRMED 20/11 — Hội trại:** tổ chức tại **sân trường (Z02, biến thể đêm)**, **tháng 3/2018**. Không cần bản đồ mới.

Các địa điểm khác từng xuất hiện trong bản nháp (thư viện, nhà vệ sinh, bãi xe, sân bóng rổ riêng, tiệm net, tiệm sách) **không** thành khu riêng ở bản public; gom về các khu trên. *(PROPOSED 19/11)*

### 5.3 Bản đồ luồng di chuyển
~~~
                         ┌────────────────────────────┐
                         │      PHÒNG 2026 (Hub)      │
                         │  thùng kỷ vật · Album · kệ │
                         │  bàn · tường ảnh · điện thoại│
                         └─────────────┬──────────────┘
                     chọn kỷ vật       │      hết Trang → về phòng
                                       ▼
                     ┌──── CHUYỂN CẢNH VÀO KÝ ỨC ────┐
                     │ kỷ vật phóng to · âm thanh của │
                     │ Trang to dần · màu chuyển sang │
                     │ bảng màu của Mốc               │
                     └───────────────┬───────────────┘
                                     ▼
   ┌──────────────────────────── map_thcs ─────────────────────────────┐
   │                                                                   │
   │   [Z05 Căn cứ bí mật] ◀── góc sân sau ──┐                         │
   │                                         │                         │
   │   [Z01 Lớp học] ◀── [Z02b Hành lang / mái hiên / rãnh nước]       │
   │                              │                                    │
   │                    [Z02 Sân trường: phượng, ghế đá, cột rổ]       │
   │                    (Trang 8: biến thể đất trại ban đêm)           │
   │                              │                                    │
   │                    [Cổng trường] ── [Z03 Ngõ quà vặt / tạp hóa]   │
   │                                                                   │
   │   (Không có căn-tin riêng — dùng xe quà vặt ở Z03)                │
   └───────────────────────────────────────────────────────────────────┘
~~~
**Đường đi chính theo Trang:**
| Trang | Đường đi |
|---|---|
| 1 | Z02b (bảng phân lớp) → Z01 (mật lệnh) → Z02 (đá cầu) → Z01 (trực nhật) · cảnh B: Z03 tạp hóa |
| 2 | Z02b mái hiên + rãnh nước |
| 3 | Z02 → góc sân sau → Z05 |
| 4 | Z02 gốc phượng → mưa → Z05 → gốc phượng |
| 5 | Z02 (khai giảng; Đức ở xe quà vặt Z03; Quân ở cột rổ; Hạ ở gốc phượng) → Z01 (trực nhật, caro) → cổng |
| 6 | Z05 → hành lang → Z01 → ghế đá Z02 (lần trêu thứ ba) → Z02 (quét sân) |
| 7 | Z01 → Z05 → Z01 |
| 8 | Z03 tạp hóa (xem bóng đá) → Z02 đất trại (đêm) → cổng |
| 9 | Z02 (bế giảng) → Z05 → gốc phượng → cutscene ba cổng trường |

**Chuyển cảnh:** vào ký ức như trên; ra ký ức bằng ánh flash của ảnh chính → về phòng → trang Album phục hồi. Chuyển Mốc: thẻ chữ "Mấy năm sau…". Phương án thay thế (radio rè, lịch rơi, đồng hồ quay ngược) — chọn **một** cách khi làm Hub. *(PROPOSED)*

---

## 6. Điều khiển và camera *(CONFIRMED 13/11 về hướng; số liệu chốt ở bản thử)*
| Hạng mục | Mặc định |
|---|---|
| Di chuyển | WASD / phím mũi tên; Shift chạy |
| Tương tác | E hoặc click khi có gợi ý |
| Hội thoại | Space/click để tiếp; 1/2/3 hoặc click để chọn |
| Camera ký ức | Góc thứ ba sau lưng, nhìn chéo xuống; tự kéo gần khi bị che |
| Máy ảnh | C bật/tắt chế độ chụp cầm tay |
| Sổ tay | J hoặc Tab: mục tiêu, Side, Album |
| Thoát kẹt | Esc → "Về chỗ an toàn" |
| Phòng 2026 | Góc cố định; rê chuột làm sáng vật; click/E để chọn; không đi lại |
| Màn hình 2D (điện thoại, confession) | Click để mở, Esc để đóng |

Máy ảnh là **của Player** (CONFIRMED 19/11). Không thiết kế cho cảm ứng/màn hình dọc ở bản public.

---

## 7. Art Direction

### 7.1 Hướng chung
| Hạng mục | Quy chuẩn | Trạng thái |
|---|---|---|
| Phong cách | Semi-chibi 3D, low-poly mềm, khối bo góc; tươi sáng, ấm, không ám tối | Chủ dự án nêu 20/11; raw: "stylized soft low-poly" |
| Vật liệu | Toon 3 bậc sáng + viền nét vẽ; gần như không dùng ảnh texture; chữ vẽ bằng canvas | PROPOSED (đã dựng thử 13/11) |
| Ánh sáng | 1 nắng chính + ánh sáng trời; cảnh đêm Hội trại lấy lửa trại làm nguồn sáng chính, có đèn dây và vệt sáng dẫn đường | PROPOSED |
| Bối cảnh trường | Dãy lớp 2 tầng tường vàng, cửa sổ nan chớp xanh lá, mái ngói đỏ, hành lang cột trắng, sân xi măng chia ô, phượng và bàng | PROPOSED (bản thử 13/11) |
| Tên, thương hiệu | Trường, quán, ứng dụng chat, bao bì đều **tự nghĩ**; không vẽ nhân vật anime/truyện có bản quyền | PROPOSED (D-15) |

### 7.2 Bảng màu theo Mốc
| Phần | Tông chủ đạo | Gợi cảm xúc | Nguồn |
|---|---|---|---|
| Mốc 1 (lớp 6–7) | Vàng nắng, xanh phượng non | Bỡ ngỡ, háo hức | Raw ideas (tham chiếu) |
| Mốc 2 (lớp 8–9) | Vàng cam hoàng hôn, xanh lam giờ tan trường | Gắn bó, bồi hồi | Raw ideas (tham chiếu) |
| Cảnh mưa (Trang 2, 4) | Xanh xám nhạt, giữ độ sáng cao | Ấm trong mưa, không u buồn | PROPOSED |
| Đêm Hội trại (Trang 8) | Cam lửa + xanh đêm, đèn dây vàng | Ấm, thật lòng | PROPOSED |
| Phòng 2026 | Sáng, ấm ngay từ đầu; "trống" thể hiện bằng ít đồ | Một mình nhưng không buồn | CONFIRMED 20/11 |

Mã màu cụ thể (hex) **chưa có**; cần Visual Bible được duyệt. Hiện chưa có concept art nào được duyệt (`06_VISUAL_BIBLE_STATUS`).

> **CONFIRMED 20/11 — Tông phòng 2026:** tươi sáng, ấm áp từ đầu; cảm giác trống trải thể hiện bằng ít đồ, không bằng màu tối. Phương án "lạnh rồi ấm dần" (D-13): SUPERSEDED.

### 7.3 Nhân vật
- Tỷ lệ chibi: đầu to, thân bo góc, tay chân ngắn. Bộ tham số tuổi: `AGE_G6_7`, `AGE_G8_9` cho bản public. *(PROPOSED)*
- Đồng phục: áo sơ mi trắng có bảng tên, quần tây xanh đậm, giày bata; lớp 6–7 đeo khăn quàng đỏ; lớp 9 không đeo trong cảnh thường; Hội trại mặc áo thun lớp. *(ỦY QUYỀN Claude 13/11, sửa được)*
- Nhận diện 4 bạn bằng dáng, tóc, đạo cụ (bảng ở `01` §2). Không đổi nhận diện khi chưa được duyệt.

> **CONFIRMED 20/11 — Nhân vật:** dựng **model 3D có xương, tỉ lệ semi-chibi**, chiều cao chuẩn hóa khoảng **1,3–1,5 m** cho học sinh THCS. Lỗi 0,70 m ở nhánh `feature/asset-workshop` phải sửa. Phương án "nhân vật dựng bằng code" (Q5): SUPERSEDED. Quy chuẩn ở `03` §1.3.

### 7.4 Giao diện (UI)
| Thành phần | Quy chuẩn |
|---|---|
| Nguyên tắc | Rõ, ít chữ, chữ to dễ đọc; nền sáng, góc bo, cảm giác giấy/sổ tay học trò |
| Font | Nunito (giấy phép OFL), có đủ dấu tiếng Việt, đóng gói cùng web |
| HUD | Tối giản: dòng mục tiêu góc trên trái, điểm đánh dấu tới mục tiêu, gợi ý phím khi tới gần vật, tên khu hiện thoáng |
| Ô thoại | Dưới màn hình, tối đa 2 dòng/lần, tên người nói có màu riêng cho từng bạn; không chân dung ở Tầng A |
| Chọn câu | 2–3 lựa chọn, đánh số 1/2/3 |
| Thẻ chữ thời gian | Chữ tay trên nền giấy, hiện 2–3 giây đầu mỗi cảnh |
| Màn chụp ảnh | Khung ngắm + nút "Chụp lại" và "Giữ ảnh này"; 3 dấu Đủ người / Trong khung / Kịp tạo dáng (D-12 khuyến nghị 3 dấu, không điểm số) |
| Album | Trang theo Trang chơi; trang chưa chơi mờ, trang đã chơi rõ; hiện số trang đã phục hồi, không hiện phần trăm (D-20) |
| Điện thoại 2026 | Giao diện chat hư cấu, bong bóng tin nhắn, không thông báo đẩy |
| Tránh | Màu tối nặng, hiệu ứng giật mạnh, chữ nhỏ, UI chiếm giữa màn hình khi đang đi lại |

---

## 8. Âm thanh (tóm tắt — chi tiết ở `03`)
Hiệu ứng tổng hợp bằng code (màn trập, mưa, lửa, trống trường). Nhạc nền chỉ dùng bản có giấy phép rõ; không mô phỏng giai điệu bài hát có thật. Không lồng tiếng. Bài hát "đang hot" được nhắc trong kịch bản chỉ là chi tiết lời thoại, **không** phát bản thu thật nếu chưa có giấy phép.

## 9. Kỹ thuật (tóm tắt, CONFIRMED 13–14/11)
Vite + TypeScript + Three.js + Preact; GSAP; three.quarks; Tweakpane chỉ bản test; Blender 5.2 LTS → GLB; GitHub → Vercel (Hobby, phi thương mại); Firebase Firestore gói Spark cho số liệu đo và phản hồi. Nhánh `dev` = bản thử, `main` = bản chính. Lưu tiến trình trên máy người chơi, Firebase chỉ cho số liệu ẩn danh: xem `02` §4–5.

## 10. Ngoài phạm vi bản public
Mốc 3; hội ngộ và ending; Player trưởng thành xuất hiện trên màn hình; bản đồ khu phố/trường cấp 3; lồng tiếng; áo dài; nhiều người chơi; thanh toán; bản di động riêng.

---

## 11. Sổ quyết định và điểm còn mở
| # | Vấn đề | Kết quả |
|---|---|---|
| 1 | Cấu trúc | **CONFIRMED 20/11:** 9 Trang, Mốc 1 lớp 6–7, Mốc 2 lớp 8–9 |
| 2 | Năm học trong ô hướng dẫn Project | **CONFIRMED 20/11:** lớp 6 năm học 2014–2015; chủ dự án sửa ô hướng dẫn |
| 3 | Nghĩa của "Chương" | **CONFIRMED 20/11:** đơn vị chơi là "Trang"; bỏ "Chương" |
| 4 | Vị trí Căn cứ | **CONFIRMED 20/11:** trong trường, góc sân sau gần nhà kho |
| 5 | Căn-tin | **CONFIRMED 20/11:** không dựng; dùng Z03 |
| 6 | Nơi và tháng Hội trại | **CONFIRMED 20/11:** sân trường Z02 biến thể đêm, tháng 3/2018 |
| 7 | Tông phòng 2026 | **CONFIRMED 20/11:** tươi sáng, ấm từ đầu |
| 8 | Nhân vật | **CONFIRMED 20/11:** model 3D có xương, 1,3–1,5 m |
| 9 | Danh sách Side nâng/gộp/lùi | **Còn mở:** nhóm chốt |
| 10 | Nhân lực | **Còn mở:** chốt D-10 |

## 12. Changelog
- **v1.0 APPROVED — 20/11/2026 (23:30):** Chủ dự án duyệt toàn bộ file. Ghi thêm: Sudoku ở Trang 7, caro ở Trang 5, lần trêu thứ ba ở ghế đá, năm học 2014–2015 trong ô hướng dẫn Project. Hai bản nháp trước đổi tên thành v1.0-draft và v1.1-draft.
- **v1.1-draft — 20/11/2026 (tối):** Ghi các quyết định chủ dự án 20/11: cấu trúc 9 Trang; phòng 2026 tươi sáng từ đầu; Căn cứ trong trường; không dựng căn-tin, dùng Z03; Hội trại ở sân trường tháng 3/2018; nhân vật là model 3D có xương 1,3–1,5 m; minigame chơi thật có thắng/thua nhưng không chặn truyện; Căn cứ thành Khu Vui Chơi Tuổi Thơ. Còn mở 3 điểm.
- **v1.0-draft — 20/11/2026:** Bản đầu, tổng hợp từ 8 tài liệu GDD v1 DRAFT, `GDD.md` v0.3 và các quyết định 19/11 (phạm vi Mốc 1 + Mốc 2, đơn vị "Trang", máy ảnh của Player, KV-01 hộp phấn, chia 3 trường, Điều 6, D-01, D-05). Không thêm tính năng mới. Ghi 10 điểm [CẦN CHỐT LẠI].
