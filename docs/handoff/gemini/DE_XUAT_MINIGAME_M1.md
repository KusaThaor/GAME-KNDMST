# ĐỀ XUẤT MINIGAME MỚI CHO MỐC 1 (LỚP 6–7)
> **Tài liệu:** Đề xuất mở rộng lối chơi Mốc 1 gửi Chủ Dự Án xem xét duyệt  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Thời điểm lập:** 21/11/2026  
> **Ghi chú quan trọng:** Đây CHỈ LÀ ĐỀ XUẤT. Không đưa mã trò hay `game_id` mới vào dữ liệu 4 file Trang cho đến khi chủ dự án duyệt chính thức.  

---

## 1. Danh sách 9 đề xuất chi tiết

### Đề xuất 1: Nhặt trang vở bay
1. **Tên trò + gợi ý game_id:** Nhặt trang vở bay (`mg_catch_notebook_pages`)
2. **Trang và vị trí trong kịch bản:** Trang 1, Cảnh A Bước 1 (ngay sau khi gió làm rơi cuốn vở, trước khi Đức nhặt hộ và bắt chuyện làm quen).
3. **Vì sao hợp cảnh:** Cơn gió bất chợt ở hành lang sân trường đầu năm làm cuốn vở bung gáy bay lả tả, tạo cớ tự nhiên để Đức và người chơi cùng chạy theo nhặt lại.
4. **Luật (tối đa 3 dòng):**
   - Click/chạm nhanh vào các trang giấy đang bay chao liệng trên màn hình trước khi chúng chạm đất.
   - Gom đủ 5 trang giấy trong vòng 30 giây để hoàn thành cuốn vở.
   - Trang giấy bay nhanh dần theo từng đợt gió.
5. **Cách chơi (thao tác người chơi):** Di chuột và click chuột trái (hoặc chạm ngón tay) vào các trang giấy ô li đang bay lơ lửng.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi nhặt đủ 5 trang hoặc hết 30 giây.
   - Thắng (3 sao): Gom đủ 5 trang trong ≤ 15 giây; 2 sao: gom đủ trong ≤ 25 giây; 1 sao: gom đủ 5 trang; Thua: nhặt thiếu trang khi hết giờ.
7. **Thua thì truyện đi tiếp thế nào:** Đức nhặt được trang cuối cùng mắc ở bụi cây gần đó đưa lại cho người chơi, truyện vẫn tiếp tục bình thường.
8. **Độ khó làm:** Dễ (vật thể 2D di chuyển theo quỹ đạo đường cong đơn giản, phát hiện click).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Đức:** "Gió gì mà thổi bay cả vở! May mà tớ với cậu nhanh tay chụp kịp đó." `[AI_PROPOSED]`

---

### Đề xuất 2: Kê thẳng bàn ghế lớp học
1. **Tên trò + gợi ý game_id:** Kê thẳng bàn ghế (`mg_align_desks`)
2. **Trang và vị trí trong kịch bản:** Trang 1, Cảnh A Bước 4 (sau khi lau bảng lớp học, trước đoạn thoại trực nhật lỡ miệng "mày - tao").
3. **Vì sao hợp cảnh:** Sau một ngày học đầu tiên xô bồ, bàn ghế gỗ trong phòng học bị xô lệch, học sinh trực nhật phải sắp xếp lại cho thẳng hàng theo đường chỉ gạch bông.
4. **Luật (tối đa 3 dòng):**
   - Kéo đẩy 3 dãy bàn ghế gỗ vào đúng đường gióng viền gạch hoa trên sàn lớp.
   - Đưa bàn vào đúng vùng gióng (dung sai ±5%) để chốt vị trí.
   - Hoàn thành sắp xếp 4 chiếc bàn xô lệch trong thời gian 45 giây.
5. **Cách chơi (thao tác người chơi):** Giữ chuột trái vào cạnh bàn, kéo chuột sang trái/phải để dịch chuyển bàn đến khi khớp đường gióng màu xanh.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi cả 4 bàn đã được kê thẳng hoặc hết 45 giây.
   - Thắng (3 sao): Xong trong ≤ 20 giây; 2 sao: ≤ 35 giây; 1 sao: xong trước 45 giây; Thua: còn bàn xô lệch khi hết giờ.
7. **Thua thì truyện đi tiếp thế nào:** Châu thở dài xua tay bảo "Thôi được rồi, nhìn tạm ngay ngắn rồi đó", truyện tiếp tục vào đoạn chuyện trò cuối buổi.
8. **Độ khó làm:** Dễ (kéo trượt 1 chiều trên trục ngang, so khớp vị trí đích).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Châu:** "Kê vậy mới coi được nè. Mai lớp học nhìn cho ra dáng lớp chọn." `[AI_PROPOSED]`

---

### Đề xuất 3: Gấp thuyền giấy báo
1. **Tên trò + gợi ý game_id:** Gấp thuyền giấy báo (`mg_fold_boat`)
2. **Trang và vị trí trong kịch bản:** Trang 2, Cảnh duy nhất Bước 3 (sau khi Hạ rủ chơi thuyền giấy, trước khi viết điều ước lên cánh buồm).
3. **Vì sao hợp cảnh:** Trước khi thả thuyền đua, cả nhóm cần gấp những chiếc thuyền từ giấy tập và báo cũ của Quân mang theo dưới mái hiên mưa.
4. **Luật (tối đa 3 dòng):**
   - Vuốt nếp gấp theo các đường nét đứt chỉ dẫn trên tờ giấy báo.
   - Vuốt đúng 4 bước cơ bản: gập đôi, xếp hai góc nhọn, bẻ mép đáy, kéo mở lòng thuyền.
   - Mỗi nếp vuốt thẳng và dứt khoát giúp thuyền cứng cáp hơn.
5. **Cách chơi (thao tác người chơi):** Giữ chuột trái và kéo theo hướng mũi tên chỉ dẫn trên tờ giấy để thực hiện nếp gấp Origami.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi hoàn thành đủ 4 nếp gấp để tạo thành chiếc thuyền giấy.
   - Thắng (3 sao): Độ chính xác nét vuốt ≥ 85%; 2 sao: ≥ 65%; 1 sao: hoàn thành mọi nếp; Thua: bấm bỏ qua/hết 60 giây.
7. **Thua thì truyện đi tiếp thế nào:** Quân chìa tay giúp vuốt lại mép giấy cuối cùng, thuyền vẫn thành hình để chuẩn bị viết lời ước.
8. **Độ khó làm:** Vừa (hoạt họa biến dạng nếp gấp giấy 2D/3D đơn giản).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Quân:** "Cậu gấp khéo ghê. Mép giấy miết chặt vầy thì lâu thấm nước lắm." `[AI_PROPOSED]`

---

### Đề xuất 4: Vớt thuyền que tre
1. **Tên trò + gợi ý game_id:** Vớt thuyền que tre (`mg_rescue_boat`)
2. **Trang và vị trí trong kịch bản:** Trang 2, Cảnh duy nhất Bước 5 (sau khi cuộc đua kết thúc, trước khi cả nhóm cùng ký tên lên cánh buồm).
3. **Vì sao hợp cảnh:** Nước mưa chảy xiết cuốn các thuyền khác đi mất, chỉ còn thuyền của Hạ mắc lại bờ gờ đá, người chơi dùng que tre khều thuyền lên nhẹ nhàng tránh làm rách giấy ướt.
4. **Luật (tối đa 3 dòng):**
   - Di chuyển đầu que tre chạm nhẹ vào mạn thuyền giấy đang bập bềnh gần mép cống.
   - Canh lúc sóng nước dâng nhẹ thì giữ chuột kéo từ từ về phía bờ gạch.
   - Không giật que quá mạnh khiến thuyền bị rách hoặc chìm.
5. **Cách chơi (thao tác người chơi):** Rê chuột điều khiển que tre, click giữ và kéo nhẹ nhàng theo nhịp nước vào bờ hiên.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi thuyền chạm mép bờ khô hoặc sau 40 giây.
   - Thắng: Đưa được thuyền lên bờ nguyên vẹn; Thua: làm thuyền lật hoặc hết giờ.
7. **Thua thì truyện đi tiếp thế nào:** Hạ nhanh tay thò tay xuống nước vớt nhẹ thuyền lên và mỉm cười bảo "May quá, cánh buồm vẫn còn khô nè".
8. **Độ khó làm:** Vừa (tính toán va chạm vật lý que tre và mạn thuyền nổi bập bềnh).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Hạ:** "Cảm ơn cậu nha! Chiếc thuyền này mắc lại như có duyên với tụi mình vậy." `[AI_PROPOSED]`

---

### Đề xuất 5: Quét lá dọn Căn cứ
1. **Tên trò + gợi ý game_id:** Quét lá dọn Căn cứ (`mg_sweep_leaves`)
2. **Trang và vị trí trong kịch bản:** Trang 3, Cảnh A Bước 2 (sau khi khảo sát góc sân sau nhà kho, trước khi khiêng bàn gỗ cũ vào).
3. **Vì sao hợp cảnh:** Góc sân sau bỏ hoang lâu ngày phủ đầy lá bàng rụng và rác vụn, Châu yêu cầu "dọn sạch rồi mới được công nhận" Căn cứ.
4. **Luật (tối đa 3 dòng):**
   - Giữ và di chuột điều khiển chổi tre quét gom các đám lá khô rải rác vào vòng tròn ở góc sân.
   - Gom đủ ít nhất 80% lượng lá trên mặt đất trong vòng 40 giây.
   - Quét đều tay để lá không bị văng ngược ra ngoài bãi đất trống.
5. **Cách chơi (thao tác người chơi):** Giữ chuột trái rê chổi quét gom các hạt lá di chuyển về phía đống lá trung tâm.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi đạt diện tích sạch ≥ 80% hoặc hết giờ.
   - Thắng (3 sao): Dọn sạch ≥ 90% trong ≤ 25 giây; 2 sao: ≥ 85% trong ≤ 35 giây; 1 sao: ≥ 80%; Thua: gom < 80%.
7. **Thua thì truyện đi tiếp thế nào:** Đức nhảy vào cầm chổi phụ quét một đường dứt khoát "Để tao hỗ trợ một tay, sạch bong kin kít liền!".
8. **Độ khó làm:** Dễ (dùng lại cơ chế di chuột của minigame lau bảng K6, thay đổi hạt lá gom).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Châu:** "Gom sạch sẽ vầy nhìn mát mắt hẳn. Giờ mới bắt đầu kê bàn được." `[AI_PROPOSED]`

---

### Đề xuất 6: Tô biển tên Căn cứ
1. **Tên trò + gợi ý game_id:** Tô biển tên Căn cứ (`mg_paint_signboard`)
2. **Trang và vị trí trong kịch bản:** Trang 3, Cảnh A Bước 3 (sau khi dọn bàn ghế và chọn kiểu trang trí, trước khi viết 5 điều luật).
3. **Vì sao hợp cảnh:** Đức lấy bìa carton và bút lông mực xanh/đỏ vẽ viền chữ "CĂN CỨ BÍ MẬT", người chơi cùng tô đậm nét chữ để tấm biển nổi bật từ xa.
4. **Luật (tối đa 3 dòng):**
   - Giữ chuột di ngòi bút lông tô kín bên trong các khung chữ "CĂN CỨ BÍ MẬT".
   - Tô đạt độ phủ màu ≥ 85% diện tích mặt chữ.
   - Không để mực lem quá nhiều ra ngoài viền tấm bìa.
5. **Cách chơi (thao tác người chơi):** Giữ chuột trái và di chuột qua lại để tô mực đậm nét lên các con chữ in rỗng.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi đạt độ phủ mực ≥ 85% hoặc hết 45 giây.
   - Thắng (3 sao): Phủ ≥ 90% không lem trong ≤ 20 giây; 2 sao: phủ ≥ 85%; 1 sao: hoàn thành trước giờ; Thua: hết giờ chưa phủ đủ.
7. **Thua thì truyện đi tiếp thế nào:** Đức giật bút cười toe toét "Chữ tao tô hơi lem tí nhưng nhìn vậy mới phong cách bụi bặm!".
8. **Độ khó làm:** Dễ (dùng cơ chế cọ tô màu K6 như trò lau bảng / tô cờ GDD §2.4.4).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Đức:** "Biển tên xong rồi đó! Nhìn chữ Căn cứ Bí mật ngầu đét luôn!" `[AI_PROPOSED]`

---

### Đề xuất 7: Ép bướm hoa phượng
1. **Tên trò + gợi ý game_id:** Ép bướm hoa phượng (`mg_phoenix_butterfly`)
2. **Trang và vị trí trong kịch bản:** Trang 4, Bước 2 (sau khi cả nhóm bàn chuyện chụp ảnh, trong lúc Hạ nhặt hoa phượng dưới gốc cây).
3. **Vì sao hợp cảnh:** Trò chơi kinh điển của tuổi học trò Việt Nam mùa bế giảng: nhặt từng cánh phượng đỏ rơi rụng rồi tỉ mỉ ghép cùng cuống nhị hoa thành hình chú bướm phượng kẹp vào trang vở kỷ niệm.
4. **Luật (tối đa 3 dòng):**
   - Kéo 4 cánh hoa phượng đỏ và 2 sợi nhị hoa vào các vị trí viền mờ của cánh bướm trên trang giấy.
   - Xoay nhẹ cánh hoa cho khớp dáng cánh trên và cánh dưới đối xứng.
   - Hoàn thành chú bướm hoa phượng trước khi gió thổi bay (thời gian 45 giây).
5. **Cách chơi (thao tác người chơi):** Kéo thả cánh hoa từ giỏ sách vào khung hình con bướm trên mặt bàn ghế đá.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi đặt đủ 6 bộ phận vào vị trí đúng.
   - Thắng (3 sao): Đặt chuẩn đẹp trong ≤ 20 giây; 2 sao: ≤ 35 giây; 1 sao: hoàn thành; Thua: hết giờ.
7. **Thua thì truyện đi tiếp thế nào:** Hạ nhẹ nhàng đỡ cánh hoa đặt vào giữa trang tập rồi khép lại "Để Hạ kẹp vào trang giữa giùm cậu, mang về nhà ép khô là đẹp lắm".
8. **Độ khó làm:** Dễ (kéo thả đối tượng 2D vào slot có sẵn Snap-to-target).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Hạ:** "Bướm hoa phượng đẹp quá. Kẹp cuốn sổ này mười năm sau mở ra vẫn còn màu đỏ." `[AI_PROPOSED]`

---

### Đề xuất 8: Canh nét ống kính máy ảnh
1. **Tên trò + gợi ý game_id:** Canh nét ống kính (`mg_camera_focus`)
2. **Trang và vị trí trong kịch bản:** Trang 4, Bước 3 (sau khi đặt máy ảnh lên ghế đá gốc phượng, ngay trước khi bấm nút hẹn giờ 10 giây).
3. **Vì sao hợp cảnh:** Chiếc máy ảnh compact kỹ thuật số thời 2014-2016 khi đặt trên ghế đá cần canh chỉnh vòng lấy nét sao cho cả năm gương mặt đứng dưới vòm bóng râm không bị mờ nhòe trước ánh nắng hè.
4. **Luật (tối đa 3 dòng):**
   - Xoay vòng lấy nét (hoặc kéo thanh trượt nét) để điều chỉnh độ rõ của hình ảnh trên màn hình ngắm.
   - Canh đến khi khung ngắm chuyển từ màu vàng (mờ) sang xanh lá cây (nét căng toàn diện).
   - Bấm nút xác nhận trong vùng nét an toàn để khóa tiêu cự.
5. **Cách chơi (thao tác người chơi):** Lăn chuột hoặc kéo thanh trượt tiêu cự, bấm phím Space hoặc click nút "Khóa nét" khi hình ảnh rõ nét.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi bấm khóa nét thành công hoặc sau 30 giây.
   - Thắng (3 sao): Khóa nét đúng điểm hoàn hảo trong ≤ 10 giây; 2 sao: ≤ 20 giây; 1 sao: khóa nét được; Thua: khóa nét khi hình còn nhòe hoặc hết giờ.
7. **Thua thì truyện đi tiếp thế nào:** Quân nhìn qua màn hình máy ảnh bấm nút tự động lấy nét (Auto-focus) "Để tớ bấm nút này, máy tự lấy nét được rồi nè".
8. **Độ khó làm:** Dễ (shader làm mờ Gaussian blur đơn giản gắn thanh trượt giá trị slider).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Quân:** "Nét căng rồi đó. Nắng rọi qua tán phượng lên mặt mọi người nhìn sáng ghê." `[AI_PROPOSED]`

---

### Đề xuất 9: Nhịp mưa tí tách trên mái Căn cứ
1. **Tên trò + gợi ý game_id:** Nhịp mưa tí tách (`mg_raindrop_rhythm`)
2. **Trang và vị trí trong kịch bản:** Trang 4, Bước 4 (ngay khi cả nhóm chạy ù vào Căn cứ trú cơn mưa rào bất chợt, trước lúc nhìn thấy cầu vồng).
3. **Vì sao hợp cảnh:** Cả năm đứa nép sát nhau dưới mái che nghe tiếng mưa rào xối xả rồi ngớt dần thành những giọt gianh gõ lách cách vui tai trên mái tôn cũ, gợi cảm giác bình yên của tuổi học trò.
4. **Luật (tối đa 3 dòng):**
   - Lắng nghe nhịp rơi và click chuột bắt các giọt nước mưa rớt xuống mép máng xối.
   - Bấm đúng nhịp khi giọt nước chạm đáy thanh hứng để tạo ra nốt nhạc trong trẻo.
   - Đạt chuỗi 8 nhịp chính xác liên tiếp để hòa thành bản nhạc mưa hè.
5. **Cách chơi (thao tác người chơi):** Bấm phím Space hoặc click chuột theo nhịp giọt nước rơi chạm vạch đích.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong sau 16 nhịp giọt mưa (khoảng 30 giây).
   - Thắng (3 sao): Bắt đúng ≥ 12 nhịp; 2 sao: ≥ 8 nhịp; 1 sao: ≥ 5 nhịp; Thua: bắt đúng < 5 nhịp.
7. **Thua thì truyện đi tiếp thế nào:** Đức vỗ tay theo nhịp cười xòa "Tiếng mưa nghe như tiếng gõ nồi niêu vậy đó!", truyện chuyển sang cảnh mưa tạnh ngắm cầu vồng.
8. **Độ khó làm:** Vừa (canh nhịp K5 âm thanh, tái sử dụng khung thời gian của minigame đá cầu).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Hạ:** "Tiếng mưa rơi trên mái tôn nghe vui ghê ha. Ngồi trong này thấy ấm áp ghê luôn." `[AI_PROPOSED]`

---

## 2. Bảng tóm tắt các đề xuất

| # | Tên trò | Gợi ý ID | Trang | Cách chơi chính | Độ khó | Khuyên làm |
|---|---|---|---|---|---|:---:|
| 1 | Nhặt trang vở bay | `mg_catch_notebook_pages` | Trang 1 | Nhanh tay click bắt giấy bay | Dễ | **Có (Ưu tiên 2)** |
| 2 | Kê thẳng bàn ghế | `mg_align_desks` | Trang 1 | Kéo trượt sắp xếp bàn thẳng hàng | Dễ | Xem xét |
| 3 | Gấp thuyền giấy báo | `mg_fold_boat` | Trang 2 | Vuốt nếp gấp Origami theo hướng dẫn | Vừa | **Có (Ưu tiên 1)** |
| 4 | Vớt thuyền que tre | `mg_rescue_boat` | Trang 2 | Canh thời điểm khều thuyền giấy ướt | Vừa | Xem xét |
| 5 | Quét lá dọn Căn cứ | `mg_sweep_leaves` | Trang 3 | Giữ và di chuột gom rác lá khô | Dễ | Xem xét |
| 6 | Tô biển tên Căn cứ | `mg_paint_signboard` | Trang 3 | Di chuột tô màu nét chữ biển tên | Dễ | Xem xét |
| 7 | Ép bướm hoa phượng | `mg_phoenix_butterfly` | Trang 4 | Kéo thả ghép cánh phượng thành bướm | Dễ | **Có (Ưu tiên 3)** |
| 8 | Canh nét ống kính | `mg_camera_focus` | Trang 4 | Kéo thanh trượt điều chỉnh độ nét | Dễ | Xem xét |
| 9 | Nhịp mưa tí tách | `mg_raindrop_rhythm` | Trang 4 | Canh nhịp giọt nước rơi theo tiết tấu | Vừa | Xem xét |

---

## 3. Ba trò khuyên chủ dự án làm trước (Top 3 khuyên làm)

1. **Gấp thuyền giấy báo (`mg_fold_boat` — Trang 2):**  
   - **Lý do:** Kỷ vật biểu tượng của Trang 2 chính là chiếc thuyền giấy. Việc người chơi được tự tay trải nghiệm thao tác vuốt gấp chiếc thuyền từ tờ báo cũ trước khi viết điều ước tạo nên sự gắn kết cảm xúc sâu sắc và rất tự nhiên trước khi bước vào cuộc đua thuyền rãnh nước.
2. **Nhặt trang vở bay (`mg_catch_notebook_pages` — Trang 1):**  
   - **Lý do:** Đây là khoảnh khắc mở màn của toàn bộ câu chuyện thanh xuân — lần đầu tiên người chơi chạm mặt Đức. Trò chơi có nhịp độ nhanh, vui nhộn, tạo ấn tượng tích cực ngay từ phút đầu bước vào trường cấp 2, chi phí lập trình rất nhẹ (2D clicker).
3. **Ép bướm hoa phượng (`mg_phoenix_butterfly` — Trang 4):**  
   - **Lý do:** Hình ảnh ép bướm hoa phượng là nét văn hóa học đường Việt Nam thân thương và giàu chất thơ nhất của mùa bế giảng hè. Trò chơi mang tính hoài niệm cao, động tác kéo thả nhẹ nhàng, rất hợp với tâm trạng bồi hồi của Trang 4 trước khi chia tay năm lớp 7.
