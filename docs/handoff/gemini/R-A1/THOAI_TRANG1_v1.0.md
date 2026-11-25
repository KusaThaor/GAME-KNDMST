# THOẠI HOÀN THIỆN — TRANG 1 (R-A1)

| | |
|---|---|
| Phiên bản | v1.0 · **DRAFT** · 25/11/2026 |
| Trạng thái | Toàn bộ chữ = **PROPOSED**, chờ chủ dự án nói "duyệt Trang 1" |
| Nguồn | Khung v0.2 (`THOAI_TRANG1_OUTLINE.md`, CONFIRMED 25/11/2026) |
| Việc | R-A1 trong `GIAO_VIEC_MOC1_PHAN_CANH_v0.1.md` (v0.2), Phần 3 — 8 phân cảnh P1-1…P1-8 |
| Phạm vi | Chỉ hoàn thiện câu chữ thoại; giữ nguyên thứ tự 8 phân cảnh, vị trí nhân vật, mã bước, mã trò, luật trò |

**Giữ nguyên (không đụng):** mã bước `q_m1_main_01.s01…s07`, mã trò `mg_cipher` (lời giải "RA CHƠI"), `mg_footbag` (10 lượt liên tiếp thắng, hụt 3 thua, lượt cuối Đức luôn đá hụt vào bụi), `mg_wipe_board`, `mg_noodle`, bước ảnh 3 lần chọn 1 (`cam.d0601.grocery`). Không viết lại luật trò.

**5 câu giữ nguyên chữ (điểm neo):**
1. Lời giải mật lệnh: **"RA CHƠI"** (P1-3)
2. Đức: **"Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ."** (P1-5)
3. Châu: **"Mới quen một bữa mà ông mày tao rồi hả?"** (P1-5)
4. Đức: **"Ơ… dạ, Châu Tổng."** (biệt danh ra đời, P1-3)
5. Đức: **"…Đoán."** (ngay trước khi chụp, P1-7)

**Quy chuẩn giọng và xưng hô:**
- **Đức:** Ồn ào, lanh chanh, làm trước nghĩ sau. Cảnh A (P1-1…P1-5) xưng "tớ – cậu". Cảnh B (P1-6…P1-8) đổi sang "tao – mày" với người chơi và Châu.
- **Châu:** Gọn gàng, nguyên tắc, hay bắt lỗi, quan tâm nhưng giấu. Xưng "tui", gọi Đức là "ông", gọi người chơi và Đức là "hai người". Tuyệt đối không dùng từ phân giới tính khi gọi người chơi.
- **{player_name}:** Ít nói, quan sát, câu thoại ngắn gọn. Với Đức: xưng "tớ – cậu" (P1-1…P1-5), đổi sang "tao – mày" (từ P1-6). Với Châu: tránh đại từ trực tiếp.
- Từ đệm miền Nam dùng chừng mực (≤ 1 từ đệm mỗi ô: nè, nha, nghen, hông, lẹ, vầy).

**Quy chuẩn động tác (bộ có sẵn):** đứng, đi, chạy, nói, tạo dáng chữ V, vẫy tay, tạo dáng "tada", reo mừng. Dấu ★ = nhịp hành động (không quá 3 ô liền thiếu ★).

---

## P1-1 · Cổng trường, vở rơi (nửa đầu s01) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-1 · bước `q_m1_main_01.s01` (talk, với NPC_A) · vào: **THẺ** · ra: **DẪN** |
| Ai ở đâu lúc vào | Người chơi: `spawn.thcs.gate`. Đức: `spot.thcs.gate_front`, sau lưng người chơi vài mét. Châu: đặt sẵn ở `spot.thcs.corridor_door` (chưa thấy). Ánh sáng: buổi sáng |
| Ai đi đâu (chỉ đạo) | Hết thẻ → người chơi đi được. Gợi ý phím hiện ở lần đi đầu tiên. Đi được vài bước: tiếng "bịch", vở rơi sau lưng [CẦN ENGINE E2]. Đức **chạy** tới, trên tay cầm vở, dừng cách người chơi ~1,5 m, quay mặt về người chơi. Người chơi bấm E nói chuyện |
| Thẻ mở màn | Dòng 1: **Ngày đầu lớp 6** · Dòng 2: *Một buổi sáng tháng Chín, năm 2014* |
| Gợi ý phím (lần đi đầu, tự tắt sau khi đã đi + bấm E một lần) | Dòng 1: **WASD đi · Shift chạy** · Dòng 2: **E nói chuyện · Kéo chuột xoay** |
| Câu dẫn vào | (không — thẻ chữ thay câu dẫn) |
| Câu dẫn ra | (sang P1-2, dùng câu cuối của Đức trong bảng thoại) |
| Dòng gợi ý góc màn hình | **Nói chuyện với bạn nhặt vở** |

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| 1 | Đức | Ê, bạn gì ơi! Vở của cậu nè, suýt bay xuống sân luôn đó. | ★ vẫy tay |
| 2 | {player_name} | À, cảm ơn cậu nha. | nói |
| 3 | Đức | Nhãn vở ghi chung lớp với tớ nè! Đi tìm phòng chung không? | nói |
| 4 | {player_name} | Ừ, tớ cũng chưa quen đường. | nói |
| 5 | Đức | Yên tâm, để tớ dẫn. Tớ mới đi lạc có… hai lần thôi! | ★ tạo dáng "tada" |
| 6 | {player_name} | Ủa, vậy cậu có chắc biết đường không? | nói |

Đổi so với khung: Sửa câu 3 của Đức ("Đi tìm phòng chung không?") để tránh dùng 2 từ đệm miền Nam ("nè" và "hông") trong một ô thoại theo đúng quy định L1–L8.

---

## P1-2 · Đi xem bảng phân lớp (nửa sau s01 + bước xem bảng mới) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-2 · cuối s01 + **bước mới** `interact` tại `itr.thcs.class_list` (R-D1 đặt mã, ví dụ `s01b`) · vào: **DẪN** · giữa: **QUA-KHU** · ra: **VÀO-CHỖ** |
| Ai ở đâu lúc vào | Người chơi + Đức ở cổng (cuối P1-1). Châu đứng ở `spot.thcs.corridor_door` |
| Ai đi đâu (chỉ đạo) | **Nhịp 1:** Đức nói câu xuất phát, quay lưng **đi** trước: cổng → sân → hành lang (qua cổng khu, hiện tên khu). **Nhịp 2:** tới bảng phân lớp, Đức dừng cạnh bảng, quay mặt về người chơi, nói câu tới nơi. Người chơi bấm E xem bảng → hiện 1 câu. **Nhịp 3:** Châu ở cửa lớp **vẫy tay** gọi; người chơi tự bước vào chỗ trước cửa lớp (VÀO-CHỖ) |
| Câu dẫn vào (nhịp 1) | **Đức:** "Ơ… chuyện nhỏ! Đi theo tớ là được!" |
| Câu khi tới bảng (nhịp 2) | **Đức:** "Tới rồi! Thấy chưa, tớ nói biết đường mà." |
| Câu khi xem bảng (E) | **Đức:** "Tên tớ nè, Đức! Còn tên cậu nằm ngay dưới luôn." |
| Câu dẫn ra (nhịp 3) | **Châu** (vẫy tay ở cửa lớp): "Hai người lớp này hả? Vô lẹ, sắp trống rồi." |
| Dòng gợi ý góc màn hình | Lúc đi: **Đi theo Đức** · Tới bảng: **Xem bảng phân lớp** · Sau khi xem: **Vào lớp** |

Đổi so với khung: Giữ nguyên khung chữ đã duyệt (các câu dẫn đều ≤ 12 từ, gợi ý ≤ 8 từ).

---

## P1-3 · Giờ học: mật lệnh (s02) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-3 · `q_m1_main_01.s02` (`mg_cipher`) · vào: **QUA-KHU** · giữa: **ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Qua cửa vào lớp (tên khu "Lớp học"). Đặt lại khi qua cổng: Đức cạnh bàn người chơi, Châu bàn bên, quanh `spot.thcs.class_front` [cần marker chỗ bàn học — xem Ghi chú cho dev] |
| Ai đi đâu (chỉ đạo) | Cả ba **đứng** quanh bàn (phương án không cần engine theo quyết định A đã chốt). Đức quay sang người chơi nói câu dẫn. Máy quay đẩy vào mặt bàn có mảnh giấy (~1 s) → bảng trò mật lệnh. Chơi xong máy quay lùi ra (★ nhịp hành động), rồi mới phát thoại bên dưới |
| Câu dẫn vào | **Đức** (thì thào): "Ê, đọc đi! Mật lệnh tuyệt mật đó." [CẦN ENGINE E1 — chỗ đặt câu dẫn trước trò] |
| Câu dẫn ra | **Châu:** "Tui chỉ không muốn hai người làm mất thời gian cả lớp thôi." (câu 7 bảng thoại) |
| Dòng gợi ý góc màn hình | **Giải mật lệnh của Đức** |

Thoại **sau** trò (một bộ cho thắng / Bỏ qua; trò này không có thua):

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| — | — | *(máy quay lùi ra khỏi mặt bàn)* | ★ máy quay đổi |
| 1 | {player_name} | Mật lệnh tuyệt mật… là "RA CHƠI" thôi hả? | nói |
| 2 | Đức | Mật mã cấp cao đó! Người ngoài đọc không ra đâu. | ★ tạo dáng chữ V |
| 3 | Châu | Cấp cao đâu không thấy, chữ ông viết còn không đọc nổi. | nói |
| 4 | Đức | Ơ… dạ, Châu Tổng. | nói |
| 5 | Châu | Gọi vậy nữa là tui khỏi sửa. | nói |
| 6 | Đức | Dạ, Châu Tổng. | ★ tạo dáng "tada" |
| 7 | Châu | Tui chỉ không muốn hai người làm mất thời gian cả lớp thôi. | nói |

Đổi so với khung: Giữ nguyên vẹn thoại khung và kịch bản gốc (giữ hai điểm neo: lời giải "RA CHƠI" ở câu 1 và "Ơ… dạ, Châu Tổng." ở câu 4). Câu 7 giữ nguyên 13 từ kịch bản gốc, ghi nhận [HỎI CHỦ DỰ ÁN] do vượt 1 từ so với L5.

---

## P1-4 · Ra chơi: đá cầu (s03) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-4 · `q_m1_main_01.s03` (`mg_footbag`) · vào: **DẪN + QUA-KHU** · giữa: **VÀO-CHỖ** |
| Ai ở đâu lúc vào | Ba người trong lớp (cuối P1-3). Tiếng trống ra chơi [CẦN ENGINE E7 nếu chưa có tiếng] |
| Ai đi đâu (chỉ đạo) | Đức **chạy** ra cửa trước; Châu **đi** theo sau, trên tay cầm quả cầu [CẦN ENGINE E2]; người chơi theo. Lớp → hành lang → sân (tên khu). Tới `itr.thcs.shuttle_ring`: người chơi tự bước vào chỗ, quay mặt về Đức (VÀO-CHỖ). Đức nói câu thứ hai → bảng trò |
| Câu dẫn vào | **Đức** (chạy ra cửa): "Ra chơi rồi! Xuống sân, tớ biểu diễn cho coi!" |
| Câu khi vào chỗ | **Đức:** "Cậu cứ nhìn là biết tớ đá giỏi cỡ nào!" |
| Câu dẫn ra | **Châu:** "Để tui lượm. Hai người đứng yên đó." (câu 3 bảng thoại) |
| Dòng gợi ý góc màn hình | Lúc đi: **Đi theo Đức ra sân** · Tới nơi: **Đá cầu cùng Đức** |

Thoại **sau** trò (một bộ cho thắng / thua / Bỏ qua — trò luôn kết bằng việc Đức đá hụt vào bụi):

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| 1 | Châu | Ừ, giỏi dữ chưa. Cầu bay vô bụi luôn rồi kìa. | nói |
| 2 | Đức | Chiến thuật đánh lạc hướng thôi! | ★ tạo dáng "tada" |
| 3 | Châu | Để tui lượm. Hai người đứng yên đó. | ★ đi |

Đổi so với khung: Chuẩn hóa động tác ở câu 3 từ "đi về phía bụi cây" thành "đi" để khớp chính xác tập lệnh động tác chuẩn trong bộ có sẵn của engine (hướng đi về bụi cây giữ trong phần chỉ đạo).

---

## P1-5 · Trực nhật cuối buổi (s04) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-5 · `q_m1_main_01.s04` (`mg_wipe_board`) · vào: **QUA-KHU** · giữa: **ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Đức đi trước về lớp, người chơi theo (sân → lớp, tên khu). Trong lớp không còn học sinh phụ. Châu đứng cạnh dãy ghế đã xếp |
| Ai đi đâu (chỉ đạo) | Vào lớp: Châu nói câu dẫn rồi **đi** ra `spot.thcs.corridor_door`, **đứng** ở cửa đeo cặp. Đức và người chơi tới `itr.thcs.blackboard` (VÀO-CHỖ). Máy quay đẩy vào bảng đen → trò lau bảng. Xong: máy quay lùi ra. Sau câu 5, Châu ra khỏi cửa và **biến mất** [CẦN ENGINE E4] |
| Câu dẫn vào | **Châu:** "Ghế tui xếp xong rồi. Bảng là phần hai người nha." |
| Câu dẫn ra | (sang P1-6 bằng thẻ chữ; câu cuối là độc thoại của người chơi) |
| Dòng gợi ý góc màn hình | Lúc đi: **Cuối buổi: về lớp trực nhật** · Tới bảng: **Lau bảng cùng Đức** |

Thoại **sau** trò (một bộ cho mọi kết quả; trò này không có thua). Giữ nguyên vẹn khoảnh khắc Đức lỡ miệng "mày – tao":

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| — | — | *(máy quay lùi ra khỏi bảng đen)* | ★ máy quay đổi |
| 1 | Đức | Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ. | nói |
| 2 | Châu (đứng ở cửa, ngoái lại) | Mới quen một bữa mà ông mày tao rồi hả? | nói |
| 3 | Đức | Thì quen rồi còn gì! | ★ tạo dáng chữ V |
| 4 | {player_name} | Ừ… nếu mai không có kiểm tra. | nói |
| 5 | Châu | Làm bài tập trước đi rồi tính. Tui về đây. | ★ vẫy tay |
| 6 | {player_name} (độc thoại) | Ngày đầu ở trường mới… hình như cũng không tệ như mình nghĩ. | đứng |

Đổi so với khung: Giữ nguyên 2 điểm neo bắt buộc (câu 1 của Đức và câu 2 của Châu); chuẩn hóa động tác câu 5 của Châu thành "vẫy tay" theo đúng danh mục động tác có sẵn.

---

## P1-6 · Mấy tháng sau (s05) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-6 · `q_m1_main_01.s05` (cutscene) · vào/ra: **THẺ** |
| Thẻ chữ | Dòng 1: **Mấy tháng sau…** · Dòng 2: *Bảng lớp đã ghi "Ôn tập học kỳ I".* |
| Đổi gì trong lúc tối | **Ánh sáng:** sáng → chiều tan học (nắng vàng, bóng dài; dùng biến thể "chiều muộn" nếu đã có). **Đức:** đặt ở `spot.thcs.grocery_1`, bậc thềm tiệm tạp hóa. **Châu:** `spot.thcs.grocery_2`, cạnh Đức. **Người chơi:** đặt ở `spawn.thcs.gate`, cách bậc thềm vài mét, quay mặt về tiệm. Cả hai NPC **đứng** |
| Ai đi đâu (chỉ đạo) | Không ai đi trong lúc thẻ hiện. Mờ sáng là vào ngay P1-7 |
| Câu dẫn vào / ra | (không — thẻ không có thoại) |
| Dòng gợi ý góc màn hình | (không hiện trong lúc thẻ) |

Đổi so với khung: Giữ nguyên khung thẻ chữ 2 dòng (đạt L7); bắt đầu từ mốc này chuyển sang xưng hô "tao – mày".

---

## P1-7 · Chia gói mì tôm (s06) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-7 · `q_m1_main_01.s06` (`mg_noodle`) · vào: **THẺ → DẪN ngắn** · giữa: **VÀO-CHỖ + ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Như P1-6: Đức, Châu ở bậc thềm; người chơi đứng gần cổng |
| Ai đi đâu (chỉ đạo) | Đức **vẫy tay** gọi. Người chơi tự **đi** tới `itr.thcs.grocery_steps`, bước vào chỗ giữa hai bạn, quay mặt ra đường (VÀO-CHỖ). Máy quay đẩy vào gói mì → trò bóp mì. Xong, máy quay lùi ra |
| Câu dẫn vào | **Đức** (vẫy tay ở bậc thềm): "Ê ê! Còn đúng một gói mì thôi! Lẹ lên mày!" |
| Câu dẫn ra | **Đức:** "…Đoán." (câu 6 bảng thoại, nối thẳng sang chụp) |
| Dòng gợi ý góc màn hình | **Tới bậc thềm tiệm tạp hóa** |

Thoại **sau** trò (một bộ cho mọi kết quả; trò này không có thua):

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| — | — | *(máy quay lùi ra khỏi gói mì)* | ★ máy quay đổi |
| 1 | Đức | Chia ba thì còn được mấy sợi! | nói |
| 2 | Châu | Chia đều. Không bàn nữa. | nói |
| 3 | Đức | Ê, ba đứa mình chưa có tấm hình chung nào hết á! | ★ reo mừng |
| 4 | Đức | {player_name} có máy ảnh mà! Quay ngược máy lại, tự sướng! | ★ tạo dáng chữ V |
| 5 | Châu | Máy đó đâu có màn hình đằng trước. Sao biết có vô hình không? | nói |
| 6 | Đức | …Đoán. | nói |

Đổi so với khung: Sửa câu dẫn vào thành "Còn đúng một gói mì thôi! Lẹ lên mày!" để không lặp 2 từ đệm miền Nam ("nè" và "lẹ") trong cùng câu; câu 6 giữ nguyên điểm neo "…Đoán.".

---

## P1-8 · Ảnh tự sướng bộ ba, chụp 3 lần chọn 1 (s07) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-8 · `q_m1_main_01.s07` (photo, `cam.d0601.grocery`, 3 lần) · **CHỤP** |
| Ai ở đâu lúc vào | Ba người ở bậc thềm tiệm tạp hóa (cuối P1-7) |
| Ai đi đâu (chỉ đạo) | Máy ảnh nhỏ **hiện trên tay** người chơi, giơ lên, duỗi tay, quay ống kính về phía mặt (R-B3). Đức, Châu **đi** chen sát vào hai bên. Mỗi lần bấm: flash trắng + tiếng màn trập. Lần 1 lệch lên (chỉ thấy trán Đức) → Châu nói câu tóc dựng. Lần 3: Đức **tạo dáng chữ V**, Châu quay mặt sang Đức. Chụp đủ 3 → chọn 1 → hạ máy → thoại kết |
| Câu dẫn vào | (không — nối thẳng từ câu "…Đoán." của P1-7) |
| Câu dẫn ra | (hết Trang sau thoại kết theo phương án A đã chốt) |
| Dòng gợi ý góc màn hình | **Chụp ảnh tự sướng bộ ba** |

Lời nhắc trên màn hình cho từng lần bấm (mỗi dòng ≤ 8 từ) [CẦN ENGINE E6]:

| Lúc | Lời nhắc |
|---|---|
| Lần 1 | **Quay ngược máy, đoán khung rồi bấm** |
| Lần 2 | **Lệch rồi! Chỉnh hướng máy, bấm lại** |
| Lần 3 | **Lần cuối: cố cho đủ ba người** |
| Chọn ảnh | **Chọn một tấm để giữ** |

Câu sau lần bấm 1 (nói về tóc Đức dựng):

| Người nói | Chữ | Động tác |
|---|---|---|
| Châu | Khoan! Đức, tóc ông dựng lọt hết vô khung kìa! | nói |

Thoại **sau khi chọn ảnh** (câu "giữ tấm này" đặt ở đây; dùng chung cho cả 3 tấm):

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| — | — | *(người chơi hạ máy)* | ★ đạo cụ đổi |
| 1 | Đức | Tấm này hư cấu quá! Chụp lại đi! [KIỂM NĂM] | nói |
| 2 | Châu | Tui thấy giữ tấm này được nè. Nhìn ngố y chang ông đó Đức. | nói |
| 3 | {player_name} | Mai mốt nhất định tụi mình phải chụp thêm nhiều tấm nữa nha. | nói |
| 4 | Đức | Chốt! Sau này chụp đủ một bộ sưu tập luôn! | ★ reo mừng |

Đổi so với khung: Chuẩn hóa động tác câu phản ứng sau lần 1 của Châu thành "nói" theo đúng danh mục L3; giữ nguyên thoại chọn ảnh và các lời nhắc chụp.

---

## Bảng tự kiểm (8 phân cảnh × L1–L8)

| Phân cảnh | L1 (≤ 90 kt) | L2 (≤ 3 ô ko ★) | L3 (Động tác chuẩn) | L4 (Phản ứng sau trò) | L5 (Dẫn ≤ 12 từ) | L6 (Gợi ý ≤ 8 từ) | L7 (Thẻ ≤ 2 dòng) | L8 (Không sau 2016) | Ghi chú ô "Không" |
|---|---|---|---|---|---|---|---|---|---|
| **P1-1** | Đạt (max 56 kt) | Đạt (max 3 ô) | Đạt | Đạt (ko trò) | Đạt (ko câu nối) | Đạt (6 từ) | Đạt (2 dòng) | Đạt | — |
| **P1-2** | Đạt (max 47 kt) | Đạt (nhịp xen kẽ) | Đạt | Đạt (ko trò) | Đạt (max 10 từ) | Đạt (max 4 từ) | Đạt (ko thẻ) | Đạt | — |
| **P1-3** | Đạt (max 58 kt) | Đạt (max 3 ô) | Đạt | Đạt | **Không** | Đạt (5 từ) | Đạt (ko thẻ) | Đạt | Câu dẫn ra (câu 7) có 13 từ, vượt 1 từ so với L5 (do giữ nguyên văn kịch bản gốc) |
| **P1-4** | Đạt (max 46 kt) | Đạt (max 1 ô) | Đạt | Đạt | Đạt (max 10 từ) | Đạt (max 6 từ) | Đạt (ko thẻ) | Đạt | — |
| **P1-5** | Đạt (max 60 kt) | Đạt (max 2 ô) | Đạt | Đạt | Đạt (11 từ) | Đạt (max 7 từ) | Đạt (ko thẻ) | Đạt | — |
| **P1-6** | Đạt (ko thoại) | Đạt (ko thoại) | Đạt | Đạt (ko trò) | Đạt (dùng thẻ) | Đạt (ko gợi ý) | Đạt (2 dòng) | Đạt | — |
| **P1-7** | Đạt (max 61 kt) | Đạt (max 2 ô) | Đạt | Đạt | Đạt (max 11 từ) | Đạt (7 từ) | Đạt (ko thẻ) | Đạt | — |
| **P1-8** | Đạt (max 60 kt) | Đạt (max 3 ô) | Đạt | Đạt | Đạt (nối thẳng) | Đạt (max 7 từ) | Đạt (ko thẻ) | Đạt | — |

**Tổng kết bảng tự kiểm:**
- Số ô **Đạt**: 63 / 64 ô.
- Số ô **Không**: 1 ô (L5 tại P1-3).

---

## [HỎI CHỦ DỰ ÁN] MỚI (1 câu hỏi)

**Câu hỏi 1 (P1-3 · Câu dẫn ra / câu 7 của Châu):**
Câu thoại gốc trong kịch bản và khung đã duyệt là:
*Châu: "Tui chỉ không muốn hai người làm mất thời gian cả lớp thôi."*
Đếm số tiếng/từ: câu có **13 từ** ("Tui / chỉ / không / muốn / hai / người / làm / mất / thời / gian / cả / lớp / thôi."), vượt 1 từ so với quy định luật L5 (mỗi chỗ nối: tối đa 1 câu dẫn ≤ 12 từ).
- **Phương án A (đề xuất):** Giữ nguyên văn kịch bản gốc (13 từ), coi đây là câu thoại điểm nhấn thể hiện trọn vẹn nét đanh đá quan tâm của Châu và chấp nhận ngoại lệ cho luật L5.
- **Phương án B:** Rút ngắn còn đúng 12 từ: *"Tui không muốn hai người làm mất thời gian cả lớp thôi."* (lược bớt từ "chỉ", giữ trọn vẹn ý nghĩa, câu gọn gàng và đạt chuẩn L5).
- **Phương án C:** Rút ngắn còn 11 từ: *"Tui chỉ không muốn hai người làm phiền cả lớp thôi."* (ngắn gọn, sắc bén hơn).

---

## [CẦN ENGINE]

| # | Việc | Dùng ở | Gợi ý giao |
|---|---|---|---|
| E1 | Chỗ phát **câu dẫn trước trò** (1 ô) — dữ liệu bước minigame hiện chỉ có thoại sau trò | P1-3 (và mẫu cho P1-4, P1-7 nếu câu dẫn rơi vào lúc vào chỗ) | R-B2 (trường lời dẫn của ĐẨY-MÁY/VÀO-CHỖ) hoặc R-D1 thêm bước cảnh 1 ô trước s02 |
| E2 | **Đồ vật trên tay NPC** ngoài máy ảnh: vở (Đức), quả cầu (Châu); vở rơi xuống đất + tiếng "bịch" | P1-1, P1-4 | R-B3 mở rộng prop tay NPC; R-C1 nếu thiếu mô hình quả cầu/vở |
| E4 | **Cho NPC rời cảnh** (đi ra cửa rồi ẩn) | P1-5 (Châu) | R-B1 thêm lệnh ẩn/hiện trong `stage` |
| E6 | **Lời nhắc riêng cho từng lần bấm** của ảnh nhiều tấm | P1-8 | R-B3 (trường `prompt` dạng danh sách theo lần) |
| E7 | Tiếng trống ra chơi / vào tiết (nếu chưa có) | P1-2, P1-4 | Kiểm thư viện âm thanh trước khi làm mới |

*(Ghi chú: E3 động tác ngồi và E5 thoại trong bước ảnh không cần làm trước 04/12 do chủ dự án đã chốt chọn A cho câu hỏi 4 và 5).*

---

## [KIỂM NĂM]

- **"hư cấu quá"** (P1-8, câu 1 sau khi chọn ảnh) — trào lưu truyện tranh chế sử dụng chữ "hư cấu" bắt đầu xuất hiện rầm rộ vào khoảng cuối năm 2014 – đầu năm 2015 trên mạng xã hội. Nếu muốn thuần văn phong học sinh cấp 2 miền Nam 2014 đời thường hơn, có thể thay bằng: *"Tấm này dở ẹc! Chụp lại đi!"* hoặc *"Tấm này xấu hoắc à! Chụp lại đi!"*. Tạm thời giữ theo kịch bản gốc và chuyển R-G1 thẩm định mốc năm.
- **"Chốt!"** (P1-8, câu 4 sau khi chọn ảnh) — nghi ngờ từ này thịnh hành sau năm 2016 trong các trào lưu chốt đơn / chốt kèo. Tạm giữ vì kịch bản gốc đã dùng, chờ R-G1 soát.
- **"tự sướng"** (P1-7, câu 4) — từ "chụp ảnh tự sướng" (selfie) đã được sử dụng rất rộng rãi tại Việt Nam từ 2013–2014, hoàn toàn hợp lý với học sinh năm 2014.
