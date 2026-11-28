# KHUNG THOẠI + NHỊP DẪN CẢNH — TRANG 1 (R-A1)

| | |
|---|---|
| Phiên bản | v0.2 · **DRAFT** · 25/11/2026 |
| Trạng thái | **Khung (outline) = CONFIRMED 25/11/2026**: chủ dự án duyệt cách dựng 8 phân cảnh và chọn **A** cho cả 5 câu hỏi. **Chữ thoại trong file chỉ là bản nháp khung**, sẽ được viết hoàn thiện ở `THOAI_TRANG1_v1.0.md` (Antigravity). Chữ hoàn thiện = **PROPOSED** cho tới khi chủ dự án nói "duyệt Trang 1" |
| Việc | R-A1 trong `GIAO_VIEC_MOC1_PHAN_CANH_v0.1.md` (v0.2), Phần 3 — 8 phân cảnh P1-1…P1-8 |
| Nguồn đã đọc | Dữ liệu Trang 1 `src/content/days/d_g06_01.ts` (nhánh `feat/sprint-0412` @ `295604f`, giống `dev` @ `d5f1a09`) · luật 4 trò trong `src/game/minigames/games/` · kịch bản `KICH_BAN_DEMO_M1_M2_v1.md` Trang 1 + Phụ lục E · `01_NARRATIVE_AND_SCENES.md` §2.3 · `CONTROLS_AND_TUTORIAL_NOTES.md` |
| Giới hạn | Chưa chạy game. Độ dài ô thoại tính theo ~90 ký tự = 2 dòng, chưa đo trên khung thoại thật |

**Giữ nguyên (không đụng):** mã bước `q_m1_main_01.s01…s07`, mã trò `mg_cipher` (lời giải "RA CHƠI"), `mg_footbag` (10 lượt liên tiếp thắng, hụt 3 thua, lượt cuối Đức luôn đá hụt vào bụi), `mg_wipe_board`, `mg_noodle`, bước ảnh 3 lần chọn 1 (`cam.d0601.grocery`). Không viết lại luật trò.

**Xưng hô dùng trong file:** cảnh A (P1-1…P1-5) Đức "tớ – cậu", người chơi "tớ – cậu" với Đức; Đức lỡ "mày – tao" ở P1-5. Cảnh B (P1-6…P1-8) Đức "tao – mày" với người chơi và Châu. Châu luôn "tui", gọi Đức "ông", gọi hai/ba người là "hai người/mấy người".

**Động tác chỉ dùng bộ có sẵn:** đứng, đi, chạy, nói, chữ V, vẫy tay, "tada", reo mừng. Chỗ cần thêm ghi **[CẦN ENGINE]**.

**Cách đọc:** mỗi phân cảnh có một bảng chỉ đạo, rồi bảng thoại ngay dưới (cột *Người nói | Chữ | Động tác*). Dấu ★ = nhịp hành động (để đếm luật "không quá 3 ô liền không có hành động").

---

## P1-1 · Cổng trường, vở rơi (nửa đầu s01) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-1 · bước `q_m1_main_01.s01` (talk, với NPC_A) · vào: **THẺ** · ra: **DẪN** |
| Ai ở đâu lúc vào | Người chơi: `spawn.thcs.gate` (đổi từ `spawn.thcs.yard`). Đức: `spot.thcs.gate_front`, sau lưng người chơi vài mét. Châu: đặt sẵn ở `spot.thcs.corridor_door` (chưa thấy). Ánh sáng: buổi sáng |
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
| 3 | Đức | Nhãn vở ghi chung lớp với tớ nè! Đi kiếm phòng chung hông? | nói |
| 4 | {player_name} | Ừ, tớ cũng chưa quen đường. | nói |
| 5 | Đức | Yên tâm, để tớ dẫn. Tớ mới đi lạc có… hai lần thôi! | ★ tạo dáng "tada" |
| 6 | {player_name} | Ủa, vậy cậu có chắc biết đường không? | nói |

Ghi chú: câu 3 đổi từ "Cậu lớp này hả?" để có lý do Đức biết hai người chung lớp (nhãn vở). Còn lại giữ chữ cũ. Ai làm rơi vở → xem [HỎI 1].

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

Ghi chú: câu "Đi theo tớ là được!" chuyển từ cuối s01 sang làm câu xuất phát của DẪN (để lời nói khớp lúc Đức bắt đầu đi). Nếu dev giữ câu này trong s01 thì nhịp 1 không cần câu nào thêm. "Trống" = trống trường báo vào tiết.

---

## P1-3 · Giờ học: mật lệnh (s02) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-3 · `q_m1_main_01.s02` (`mg_cipher`) · vào: **QUA-KHU** · giữa: **ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Qua cửa vào lớp (tên khu "Lớp học"). Đặt lại khi qua cổng: Đức cạnh bàn người chơi, Châu bàn bên, quanh `spot.thcs.class_front` [cần marker chỗ bàn học — xem Ghi chú cho dev] |
| Ai đi đâu (chỉ đạo) | Cả ba **đứng** quanh bàn (phương án không cần engine; muốn **ngồi** → [CẦN ENGINE E3], [HỎI 5]). Đức quay sang người chơi nói câu dẫn. Máy quay đẩy vào mặt bàn có mảnh giấy (~1 s) → bảng trò mật lệnh. Chơi xong máy quay lùi ra (★ nhịp hành động), rồi mới phát thoại bên dưới |
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

Ghi chú: câu 1 nói rõ lời giải nên người bấm "Bỏ qua" vẫn biết mật lệnh là gì. Giữ khoảnh khắc biệt danh "Châu Tổng" ra đời và câu "Tui chỉ không muốn…" (kịch bản gốc, game đang bỏ). Bỏ các câu trước khi chơi ("nghiên cứu tài liệu", "hình tròn hình vuông") vì thoại này phát sau trò.

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
| 3 | Châu | Để tui lượm. Hai người đứng yên đó. | ★ đi về phía bụi cây |

Ghi chú: câu "Cậu cứ nhìn là biết…" chuyển lên làm câu khi vào chỗ (trước trò), vì sau trò nó nghe như kể lại. Đưa lại câu "Chiến thuật đánh lạc hướng" và "Để tui lượm" của kịch bản gốc.

---

## P1-5 · Trực nhật cuối buổi (s04) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-5 · `q_m1_main_01.s04` (`mg_wipe_board`) · vào: **QUA-KHU** · giữa: **ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Đức đi trước về lớp, người chơi theo (sân → lớp, tên khu). Trong lớp không còn học sinh phụ (lớp vắng — nếu chưa có học sinh phụ thì không cần làm gì). Châu đứng cạnh dãy ghế đã xếp |
| Ai đi đâu (chỉ đạo) | Vào lớp: Châu nói câu dẫn rồi **đi** ra `spot.thcs.corridor_door`, **đứng** ở cửa đeo cặp. Đức và người chơi tới `itr.thcs.blackboard` (VÀO-CHỖ). Máy quay đẩy vào bảng đen → trò lau bảng. Xong: máy quay lùi ra. Sau câu 5, Châu ra khỏi cửa và **biến mất** [CẦN ENGINE E4] |
| Câu dẫn vào | **Châu:** "Ghế tui xếp xong rồi. Bảng là phần hai người nha." |
| Câu dẫn ra | (sang P1-6 bằng thẻ chữ; câu cuối là độc thoại của người chơi) |
| Dòng gợi ý góc màn hình | Lúc đi: **Cuối buổi: về lớp trực nhật** · Tới bảng: **Lau bảng cùng Đức** |

Thoại **sau** trò (một bộ cho mọi kết quả; trò này không có thua). Giữ khoảnh khắc Đức lỡ "mày – tao":

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| — | — | *(máy quay lùi ra khỏi bảng đen)* | ★ máy quay đổi |
| 1 | Đức | Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ. | nói |
| 2 | Châu (đứng ở cửa, ngoái lại) | Mới quen một bữa mà ông mày tao rồi hả? | nói (quay mặt về Đức) |
| 3 | Đức | Thì quen rồi còn gì! | ★ tạo dáng chữ V |
| 4 | {player_name} | Ừ… nếu mai không có kiểm tra. | nói |
| 5 | Châu | Làm bài tập trước đi rồi tính. Tui về đây. | ★ vẫy tay, đi ra khỏi cửa |
| 6 | {player_name} (độc thoại) | Ngày đầu ở trường mới… hình như cũng không tệ như mình nghĩ. | đứng |

Ghi chú: Châu "chào về" nhưng phải còn ở cửa để bắt lỗi "ông mày tao" → xem [HỎI 2]. Câu 4–5 lấy lại từ kịch bản gốc (game đang bỏ).

---

## P1-6 · Mấy tháng sau (s05) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-6 · `q_m1_main_01.s05` (cutscene) · vào/ra: **THẺ** |
| Thẻ chữ | Dòng 1: **Mấy tháng sau…** · Dòng 2: *Bảng lớp đã ghi "Ôn tập học kỳ I".* (bỏ dòng lời kể cũ, dùng thẻ thật) |
| Đổi gì trong lúc tối | **Ánh sáng:** sáng → chiều tan học (nắng vàng, bóng dài; dùng biến thể "chiều muộn" nếu đã có). **Đức:** đặt ở `spot.thcs.grocery_1`, bậc thềm tiệm tạp hóa. **Châu:** `spot.thcs.grocery_2`, cạnh Đức. **Người chơi:** đặt ở `spawn.thcs.gate`, cách bậc thềm vài mét, quay mặt về tiệm. Cả hai NPC **đứng** (muốn ngồi → [CẦN ENGINE E3]) |
| Ai đi đâu (chỉ đạo) | Không ai đi trong lúc thẻ hiện. Mờ sáng là vào ngay P1-7 |
| Câu dẫn vào / ra | (không — thẻ không có thoại) |
| Dòng gợi ý góc màn hình | (không hiện trong lúc thẻ) |

Từ cảnh này Đức đổi hẳn sang "tao – mày" với người chơi và Châu (Phụ lục E).

---

## P1-7 · Chia gói mì tôm (s06) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-7 · `q_m1_main_01.s06` (`mg_noodle`) · vào: **THẺ → DẪN ngắn** · giữa: **VÀO-CHỖ + ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Như P1-6: Đức, Châu ở bậc thềm; người chơi đứng gần cổng |
| Ai đi đâu (chỉ đạo) | Đức **vẫy tay** gọi. Người chơi tự **đi** tới `itr.thcs.grocery_steps`, bước vào chỗ giữa hai bạn, quay mặt ra đường (VÀO-CHỖ). Máy quay đẩy vào gói mì → trò bóp mì. Xong, máy quay lùi ra |
| Câu dẫn vào | **Đức** (vẫy tay ở bậc thềm): "Ê ê! Còn đúng một gói mì nè! Lẹ lên mày!" |
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

Ghi chú: bỏ câu "Ra tiệm tạp hóa đi!" (sai chỗ — đã ở tiệm) và chuyển câu "giữ tấm này" xuống P1-8. Câu 5–6 lấy lại từ kịch bản gốc để giải thích vì sao ảnh tự sướng bị lệch.

---

## P1-8 · Ảnh tự sướng bộ ba, chụp 3 lần chọn 1 (s07) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P1-8 · `q_m1_main_01.s07` (photo, `cam.d0601.grocery`, 3 lần) · **CHỤP** |
| Ai ở đâu lúc vào | Ba người ở bậc thềm tiệm tạp hóa (cuối P1-7) |
| Ai đi đâu (chỉ đạo) | Máy ảnh nhỏ **hiện trên tay** người chơi, giơ lên, duỗi tay, quay ống kính về phía mặt (R-B3). Đức, Châu **đi** chen sát vào hai bên. Mỗi lần bấm: flash trắng + tiếng màn trập. Lần 1 lệch lên (chỉ thấy trán Đức) → Châu nói câu tóc dựng. Lần 3: Đức **tạo dáng chữ V**, Châu quay mặt sang Đức. Chụp đủ 3 → chọn 1 → hạ máy → thoại kết |
| Câu dẫn vào | (không — nối thẳng từ câu "…Đoán." của P1-7) |
| Câu dẫn ra | (hết Trang sau thoại kết — xem [HỎI 4]) |
| Dòng gợi ý góc màn hình | **Chụp ảnh tự sướng bộ ba** |

Lời nhắc trên màn hình cho từng lần bấm (mỗi dòng ≤ 8 từ) [CẦN ENGINE E6 — hiện bước ảnh chỉ có một câu nhắc chung]:

| Lúc | Lời nhắc |
|---|---|
| Lần 1 | **Quay ngược máy, đoán khung rồi bấm** |
| Lần 2 | **Lệch rồi! Chỉnh hướng máy, bấm lại** |
| Lần 3 | **Lần cuối: cố cho đủ ba người** |
| Chọn ảnh | **Chọn một tấm để giữ** |

Câu sau lần bấm 1 (giữ tinh thần câu cũ; engine đã hỗ trợ một câu ở lần đầu):

| Người nói | Chữ | Động tác |
|---|---|---|
| Châu | Khoan! Đức, tóc ông dựng lọt hết vô khung kìa! | nói (quay mặt về Đức) |

Thoại **sau khi chọn ảnh** (câu "giữ tấm này" đặt ở đây; dùng chung cho cả 3 tấm):

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| — | — | *(người chơi hạ máy)* | ★ đạo cụ đổi |
| 1 | Đức | Tấm này hư cấu quá! Chụp lại đi! [KIỂM NĂM] | nói |
| 2 | Châu | Tui thấy giữ tấm này được nè. Nhìn ngố y chang ông đó Đức. | nói |
| 3 | {player_name} | Mai mốt nhất định tụi mình phải chụp thêm nhiều tấm nữa nha. | nói |
| 4 | Đức | Chốt! Sau này chụp đủ một bộ sưu tập luôn! | ★ reo mừng |

Ghi chú: câu tóc dựng thêm "lọt hết vô khung" cho khớp hình lần 1 (khung lệch lên trán Đức). Nếu muốn giữ đúng chữ cũ: "Khoan! Đức, tóc ông dựng kìa!".

---

## Ghi chú cho dev (R-B1/R-B2/R-D1) — không phải chữ cần duyệt

- Điểm xuất hiện Trang 1 đổi: `spawn.thcs.yard` → `spawn.thcs.gate`. `npc_placements` chỉ còn chỗ ban đầu (Đức `gate_front`, Châu `corridor_door`); các chỗ sau khai bằng `stage` theo bước.
- Thiếu marker (ghi vào PR cho N-04, không tự thêm): chỗ đứng cạnh bảng phân lớp (hiện chỉ có `itr.thcs.class_list`); chỗ bàn học trong lớp cho 3 người (P1-3); chỗ bụi cây cạnh sân đá cầu để Châu đi tới (P1-4).
- Mục tiêu góc màn hình hiện tại của s01–s07 thay bằng các dòng "Dòng gợi ý góc màn hình" ở trên.
- Câu tên khu khi QUA-KHU lấy tên khu có sẵn; file này không viết thêm.

---

## [HỎI CHỦ DỰ ÁN] — ĐÃ CHỐT 25/11/2026: cả 5 câu chọn **A**

Kết quả: (1) vở của người chơi rơi, Đức nhặt · (2) Châu đứng ở cửa, ngoái lại nói rồi mới đi · (3) không thêm câu giới thiệu Châu · (4) thêm bước cảnh thoại ngắn sau s07, hết Trang khi hết thoại kết · (5) bản đo 04/12 cho đứng, không ngồi. Vì vậy [CẦN ENGINE] E3 (ngồi) và E5 (thoại trong bước ảnh) **không cần làm trước 04/12**.


| # | Chỗ | Câu hỏi | Phương án |
|---|---|---|---|
| 1 | P1-1 | Phiếu giao việc ghi "**Đức** làm rơi vở", còn kịch bản gốc và thoại đang chạy là "vở **của người chơi** rơi, Đức nhặt đưa". Theo bên nào? | **A (đề xuất):** giữ kịch bản — vở người chơi rơi, Đức nhặt rồi gọi. Không đổi thoại. · **B:** theo phiếu — Đức làm rơi, người chơi nhặt trả; phải viết lại câu 1–3 |
| 2 | P1-5 | Phiếu ghi "Châu chào về rồi biến mất", nhưng Châu phải còn đó để nói "Mới quen một bữa mà ông mày tao rồi hả?" | **A (đề xuất):** Châu ra tới cửa thì Đức lỡ miệng, Châu ngoái lại nói rồi mới đi (như bản trên). · **B:** Châu ở lại tới hết như kịch bản gốc, bỏ ý "chào về". · **C:** Châu về hẳn trước trò; câu bắt lỗi chuyển cho người chơi (mất nét "bắt lỗi" của Châu) |
| 3 | P1-2/P1-3 | Không ai giới thiệu Châu, nhưng Đức gọi "Châu Tổng". Có cần cho người chơi nghe tên Châu trước không? | **A (đề xuất):** không thêm; khung thoại đã hiện tên "Châu". · **B:** Châu tự giới thiệu ở cửa lớp ("Tui Châu."), thêm 1 ô. · **C:** Đức đọc tên Châu trên bảng phân lớp, thêm 1 ô |
| 4 | P1-8 | Câu "giữ tấm này" phải phát **sau** khi chọn ảnh, nhưng hiện "hết Trang khi giữ ảnh" | **A (đề xuất):** thêm một bước cảnh thoại ngắn ngay sau s07; hết Trang khi hết thoại kết (chỉ đổi dữ liệu). · **B:** giữ điều kiện cũ, làm bước ảnh tự phát thoại sau khi chọn [CẦN ENGINE E5] |
| 5 | P1-3, P1-6/7 | Phiếu ghi "ngồi quanh bàn", "ngồi bậc thềm", nhưng chưa có động tác ngồi | **A (đề xuất cho bản đo 04/12):** đứng quanh bàn / đứng ở bậc thềm. · **B:** thêm động tác ngồi [CẦN ENGINE E3], làm sau 04/12 |

## [CẦN ENGINE]

| # | Việc | Dùng ở | Gợi ý giao |
|---|---|---|---|
| E1 | Chỗ phát **câu dẫn trước trò** (1 ô) — dữ liệu bước minigame hiện chỉ có thoại sau trò | P1-3 (và mẫu cho P1-4, P1-7 nếu câu dẫn rơi vào lúc vào chỗ) | R-B2 (trường lời dẫn của ĐẨY-MÁY/VÀO-CHỖ) hoặc R-D1 thêm bước cảnh 1 ô trước s02 |
| E2 | **Đồ vật trên tay NPC** ngoài máy ảnh: vở (Đức), quả cầu (Châu); vở rơi xuống đất + tiếng "bịch" | P1-1, P1-4 | R-B3 mở rộng prop tay NPC; R-C1 nếu thiếu mô hình quả cầu/vở |
| E3 | Động tác **ngồi** | P1-3, P1-6/7 | Sau 04/12 nếu [HỎI 5] chọn B |
| E4 | **Cho NPC rời cảnh** (đi ra cửa rồi ẩn) | P1-5 (Châu) | R-B1 thêm lệnh ẩn/hiện trong `stage` |
| E5 | Bước ảnh có thoại sau khi chọn | P1-8 | Chỉ khi [HỎI 4] chọn B |
| E6 | **Lời nhắc riêng cho từng lần bấm** của ảnh nhiều tấm | P1-8 | R-B3 (trường `prompt` dạng danh sách theo lần) |
| E7 | Tiếng trống ra chơi / vào tiết (nếu chưa có) | P1-2, P1-4 | Kiểm thư viện âm thanh trước khi làm mới |

## [KIỂM NĂM]

- "hư cấu quá" (P1-8, câu cũ của kịch bản) — chưa chắc học sinh 2014 nói theo nghĩa "quá lố". Phương án thay nếu cần: "Tấm này dở ẹc! Chụp lại đi!"
- "Chốt!" (P1-8, câu cũ) — nghi là cách nói về sau; giữ vì đã có trong kịch bản, nhờ R-G1 soát.
- "tự sướng" (P1-7) — dùng phổ biến khoảng 2013–2014; giữ.

## Thay đổi so với thoại đang chạy (tóm tắt)

- Thêm: thẻ mở màn, gợi ý phím, 3 câu nhịp đường đi P1-2, câu dẫn P1-3/P1-4/P1-5/P1-7, lời nhắc 3 lần chụp.
- Đưa lại từ kịch bản gốc: "Mật mã cấp cao", "Cấp cao đâu không thấy…", "Dạ, Châu Tổng" lần 2, "Tui chỉ không muốn…", "Chiến thuật đánh lạc hướng", "Để tui lượm", "Ừ… nếu mai không có kiểm tra", "Làm bài tập trước…", "Máy đó đâu có màn hình…", "…Đoán.", "Tấm này hư cấu quá!".
- Dời chỗ: "Cậu cứ nhìn là biết…" lên trước trò; "Tui thấy giữ tấm này…" xuống sau khi chọn ảnh.
- Bỏ: "Ra tiệm tạp hóa đi!" (đã ở tiệm), các câu "trước khi giải" của mật lệnh.

## Thay đổi
- v0.2 (25/11/2026): chủ dự án duyệt khung + chọn A cho 5 câu hỏi. File thành **khung** cho bản viết hoàn thiện; không đổi chữ thoại.
- v0.1 (25/11/2026): bản đầu.
