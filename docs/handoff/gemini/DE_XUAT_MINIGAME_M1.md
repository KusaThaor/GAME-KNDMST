# ĐỀ XUẤT MINIGAME MỚI CHO MỐC 1 (LỚP 6–7)
> **Tài liệu:** Đề xuất hoàn thiện hệ thống minigame Mốc 1 gửi Chủ Dự Án xem xét duyệt  
> **Agent thực hiện:** Gemini Pro (Antigravity)  
> **Thời điểm cập nhật:** 22/11/2026 (Bản hoàn thiện theo chỉ đạo: loại bỏ trò nhặt vở, kê bàn, canh nét ống kính; bổ sung cơ chế Khu Vui Chơi Căn Cứ với 4 mức độ khó theo đối thủ)  
> **Ghi chú quan trọng:** Đây CHỈ LÀ ĐỀ XUẤT. Không đưa mã trò hay `game_id` mới vào dữ liệu 4 file Trang cho đến khi chủ dự án duyệt chính thức.  

---

## I. CƠ CHẾ ĐẶC BIỆT: KHU VUI CHƠI TUỔI THƠ Ở CĂN CỨ (Z05)

Theo thiết kế hệ thống tại GDD `02_GAMEPLAY_AND_MECHANICS.md` §3, sau khi dựng xong Căn cứ ở **Trang 3**, khu vực sân sau sẽ mở khóa **Khu Vui Chơi Tuổi Thơ** (chơi tự do từ Trang 4 trở đi). 

Điểm độc đáo cốt lõi của các trò chơi Căn cứ là: **CHỌN ĐỐI THỦ = CHỌN ĐỘ KHÓ**. Người chơi chọn 1 trong 4 người bạn làm đối thủ, và độ khó của ván chơi sẽ biến chuyển sâu sắc theo đúng tính cách và sở trường của từng bạn:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          BẢNG ĐỘ KHÓ THEO ĐỐI THỦ                               │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────────┤
│ Trò chơi     │ Rất dễ       │ Dễ           │ Trung bình   │ Khó nhất            │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────────┤
│ Ô ăn quan    │ Đức          │ Hạ           │ Quân         │ Châu                │
│              │ (hay đi ẩu)  │ (hay nhường) │ (tính 2 nước)│ (tính trước 4 nước) │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────────┤
│ Nhảy ô lò cò │ —            │ Hạ           │ Châu · Đức   │ Quân                │
│              │              │ (dễ mỏi chân)│ (Đức hay vội)│ (thể lực & thăng bằng)│
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────────┤
│ Bắn bi ve    │ —            │ Hạ           │ Châu · Quân  │ Đức                 │
│              │              │ (ngắm lệch)  │ (tay khỏe)   │ ("trùm bi ve", xoáy)│
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────────┘
```

---

## II. DANH SÁCH 11 ĐỀ XUẤT MINIGAME MỐC 1

---

### NHÓM 1: CÁC TRÒ CHƠI TẠI KHU VUI CHƠI CĂN CỨ (ĐỐI THỦ = ĐỘ KHÓ)

#### Đề xuất 1: Ô ăn quan Căn cứ
1. **Tên trò + gợi ý game_id:** Ô ăn quan Căn cứ (`mg_o_an_quan`)
2. **Trang và vị trí trong kịch bản:** Trang 4 (đi tự do ở Căn cứ sau khi Căn cứ đã thành lập ở Trang 3, tương tác Bảng trò chơi Căn cứ).
3. **Vì sao hợp cảnh:** Bàn ô ăn quan kẻ phấn trên nền đất Căn cứ là trò chơi đấu trí quen thuộc của học trò mỗi giờ sinh hoạt nhóm ở Căn cứ.
4. **Luật (tối đa 3 dòng):**
   - Bàn 10 ô dân (mỗi bên 5 ô, mỗi ô 5 viên sỏi) và 2 ô quan (mỗi ô 1 quan lớn = 10 điểm).
   - Chọn 1 ô dân bên mình có sỏi, chọn hướng rải (trái/phải) qua từng ô; ô kế tiếp trống thì ăn ô sau nó (có thể ăn liên hoàn).
   - Khi cả 2 ô quan đều bị ăn hết thì ván đấu kết thúc; bên nào thu được tổng điểm sỏi cao hơn sẽ thắng.
5. **Cách chơi (thao tác người chơi):** Click chọn ô dân bên mình -> Click mũi tên hướng rải sỏi (trái/phải); giữ Space để tua nhanh hoạt ảnh rải sỏi.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua theo 4 đối thủ:**
   - **Đức (Rất dễ):** 50% đi ngẫu nhiên, 50% ham ăn sỏi trước mắt bỏ quên việc che chắn quan; người chơi rất dễ thắng.
   - **Hạ (Dễ):** Đánh theo cảm tính, hay nhường nhịn, không bao giờ ăn quan nếu còn nước rải sỏi khác ("nhường bạn").
   - **Quân (Trung bình):** Tính trước 2 nước (nước mình - nước đáp), 10% chọn nước tốt thứ hai.
   - **Châu (Khó nhất):** "Châu Tổng" tính toán chiến lược 4 nước, tối ưu vét quan và điểm chênh lệch, cực kỳ khó đánh bại.
7. **Thua thì truyện đi tiếp thế nào:** Dù thắng hay thua đều ghi kết quả vào Bảng tỉ số sổ luật Căn cứ, không chặn bất kỳ nhiệm vụ nào của truyện.
8. **Độ khó làm:** Khó (logic luật ô ăn quan truyền thống + thuật toán AI mini 4 cấp độ).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Châu:** "Tui đã tính trước bốn nước rồi, đâu dễ ăn quan của Châu này." `[AI_PROPOSED]`  
   > *(Nếu đánh với Đức)* **Đức:** "Ván này tao lỡ tay rải nhầm ô thôi nha, ván sau biết tay tao!" `[AI_PROPOSED]`

---

#### Đề xuất 2: Nhảy ô lò cò Căn cứ
1. **Tên trò + gợi ý game_id:** Nhảy ô lò cò Căn cứ (`mg_nhay_lo_co`)
2. **Trang và vị trí trong kịch bản:** Trang 4 (khu đất phẳng trước Căn cứ, chơi tự do).
3. **Vì sao hợp cảnh:** Sân lò cò 10 ô vẽ phấn trên nền đất Căn cứ là trò chơi vận động rộn rã tiếng cười của cả nhóm vào những buổi chiều râm mát.
4. **Luật (tối đa 3 dòng):**
   - Lần lượt ném miếng sành vào ô từ 1 đến 10; sành phải nằm gọn trong ô, chạm vạch tính là mất lượt.
   - Nhảy lò cò qua các ô: ô đơn nhảy 1 chân (Space), ô đôi đáp 2 chân (A+D), không dẫm vào ô có sành.
   - Trên đường về, đứng ở ô trước miếng sành, giữ thăng bằng cúi nhặt sành rồi nhảy về vạch xuất phát; ai hoàn thành ô 10 trước thì thắng.
5. **Cách chơi (thao tác người chơi):** Rê chuột chọn hướng + giữ chuột nạp lực ném sành; bấm phím Space / A+D theo nhịp nhảy; rê chuột giữ con trỏ trong vùng thăng bằng để nhặt sành.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua theo 4 đối thủ:**
   - **Hạ (Dễ):** Ném đúng ô 60%, nhảy đúng nhịp 88%, nhặt sành 75% (dễ mỏi chân và trượt nhịp).
   - **Châu (Khá):** Cẩn thận từng bước, ném đúng 75%, nhảy 92%, nhặt sành 85%.
   - **Đức (Khá):** Nhanh nhẹn nhưng hay hấp tấp, ném đúng 80%, nhảy 92% (ở các ô 7–10 hay vội vàng nên dễ chạm vạch chỉ 85%), nhặt sành 80%.
   - **Quân (Khó nhất):** Thể lực tốt nhất nhóm, ném cực chuẩn và giữ thăng bằng rất vững (ném đúng 90%, nhảy 98%, nhặt sành 95%).
7. **Thua thì truyện đi tiếp thế nào:** Người thua chỉ mất lượt ghi điểm trong Bảng tỉ số, câu chuyện vẫn tiếp diễn bình thường.
8. **Độ khó làm:** Vừa (hệ thống nhịp bấm phím nhảy + thanh thăng bằng nhặt sành).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Quân:** "Cậu nhảy vững ghê, tiếp đất êm re không trẹo chân miếng nào." `[AI_PROPOSED]`  
   > *(Nếu đánh với Đức)* **Đức:** "Gió thổi bay miếng sành chạm vạch chứ tao nhảy điệu nghệ vậy mà!" `[AI_PROPOSED]`

---

#### Đề xuất 3: Bắn bi ve bãi đất Căn cứ
1. **Tên trò + gợi ý game_id:** Bắn bi ve bãi đất (`mg_ban_bi_ve`)
2. **Trang và vị trí trong kịch bản:** Trang 3, Side quest `q_m1_side_04` (Quân rủ ra bãi đất chơi bắn bi mắt mèo) và chơi tự do ở Trang 4.
3. **Vì sao hợp cảnh:** Bãi đất phẳng gần Căn cứ là "thánh địa" bắn bi của Quân và Đức, nơi lưu giữ trò chơi đường phố đậm chất học trò thập niên 2010.
4. **Luật (tối đa 3 dòng):**
   - Vòng tròn phấn đường kính 1,2 m xếp 7 viên bi ve ở tâm; mỗi người dùng 1 viên bi cái bắn từ vạch ngoài.
   - Bắn văng bi mục tiêu ra khỏi vòng được tính điểm và được bắn tiếp; nếu không ăn hoặc bi cái kẹt lại trong vòng thì mất lượt.
   - Bắn hết bi trong vòng, ai ăn được nhiều bi hơn sẽ giành chiến thắng.
5. **Cách chơi (thao tác người chơi):** Rê chuột chọn góc bắn, giữ chuột trái và kéo lùi (như kéo ná cao su) để nạp lực búng bi, cuộn bánh xe chuột để chỉnh độ xoáy đường đạn.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua theo 4 đối thủ:**
   - **Hạ (Dễ):** Bắn vui là chính, sai số góc ±7°, sai số lực ±15%, không dùng xoáy.
   - **Châu (Khá):** Tính toán kỹ góc phản xạ, sai số góc ±4°, sai số lực ±10%, không dùng xoáy.
   - **Quân (Khá):** Lực búng rất khỏe, sai số góc ±3°, sai số lực ±8%, bắn thẳng uy lực.
   - **Đức (Khó nhất):** "Trùm bi ve", tài thiện xạ ngắm cực chuẩn (sai số góc chỉ ±1°, lực ±5%) và có kỹ thuật xoáy bi cua vòng hiểm hóc.
7. **Thua thì truyện đi tiếp thế nào:** Đức/Quân cười xòa vỗ vai rủ ván sau gỡ lại, người chơi nhận sticker kỷ vật viên bi mắt mèo.
8. **Độ khó làm:** Vừa (mô hình va chạm 2D giữa các hình tròn lăn trên mặt phẳng ma sát).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Đức:** "Thấy chưa! Trùm bi ve xóm Chùa ra tay là gom sạch vòng tròn!" `[AI_PROPOSED]`  
   > *(Nếu bắn với Quân)* **Quân:** "Cậu búng viên bi mắt mèo bén ghê, một phát tách đôi hai viên luôn." `[AI_PROPOSED]`

---

### NHÓM 2: CÁC TRÒ CHƠI HỌC ĐƯỜNG & CỐT TRUYỆN THEO TỪNG TRANG

#### Đề xuất 4: Búng thước kẻ học trò (Trang 1)
1. **Tên trò + gợi ý game_id:** Búng thước kẻ học trò (`mg_ruler_battle`)
2. **Trang và vị trí trong kịch bản:** Trang 1, Cảnh A Bước 3 (sau khi đá cầu ra chơi, trong lúc cả nhóm ngồi nghỉ trong lớp học).
3. **Vì sao hợp cảnh:** Trò chơi bàn học kinh điển của mọi lứa học sinh cấp 2 với chiếc thước dẻo và cục gôm/nắp bút bi trên mặt bàn gỗ lớp 6A2.
4. **Luật (tối đa 3 dòng):**
   - Đặt thước kẻ lên bàn, dùng ngón tay đè đầu thước tạo lực búng để đẩy cục gôm của mình trượt tới đè lên thước hoặc gôm của bạn.
   - Mỗi bên lần lượt có 1 lượt búng trong 15 giây; búng đè trúng đối thủ được 1 điểm.
   - Búng trượt văng khỏi mép bàn bị tính phạm quy mất lượt; ai chạm mốc 3 điểm trước sẽ thắng.
5. **Cách chơi (thao tác người chơi):** Kéo chuột ngược đầu thước kẻ để chỉnh hướng và độ cong nạp lực, thả chuột để búng gôm trượt trên bàn.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi một bên đạt 3 điểm hoặc hết 60 giây.
   - Thắng (3 sao): Thắng 3–0; 2 sao: thắng 3–1 hoặc 3–2; 1 sao: hòa; Thua: đối thủ đạt 3 điểm trước.
7. **Thua thì truyện đi tiếp thế nào:** Đức cười toe toét khoe cây thước dẻo mua ở cổng trường, truyện chuyển tiếp sang giờ trực nhật cuối buổi.
8. **Độ khó làm:** Dễ (vật lý trượt 2D ma sát trên mặt bàn chữ nhật).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Đức:** "Cây thước dẻo này tao mua tiệm cô Năm búng bao bén luôn, thấy tài nghệ chưa!" `[AI_PROPOSED]`

---

#### Đề xuất 5: Oẳn tù tì búng tai (Trang 1)
1. **Tên trò + gợi ý game_id:** Oẳn tù tì búng tai (`mg_rock_paper_scissors`)
2. **Trang và vị trí trong kịch bản:** Trang 1, Cảnh B Bước 1 (ngồi bậc thềm tiệm tạp hóa ăn mì tôm bóp chia ba).
3. **Vì sao hợp cảnh:** Ăn xong gói mì tôm cuối cùng, ba đứa rủ nhau oẳn tù tì búng tai xem ai thua phải đứng lên gom bọc nilon đi vứt vào sọt rác.
4. **Luật (tối đa 3 dòng):**
   - Thi đấu Kéo - Búa - Bao 3 ván thắng 2.
   - Mỗi người bạn có thói quen ra đòn tâm lý riêng: Đức thích tấn công nên hay ra Búa; Châu tính toán kỹ nên xoay vòng Kéo - Búa - Bao đều đặn.
   - Người thua mỗi ván bị "búng tai" bằng hoạt ảnh nhẹ vui nhộn kèm âm thanh "tách" giòn tan.
5. **Cách chơi (thao tác người chơi):** Click chọn 1 trong 3 biểu tượng Kéo, Búa hoặc Bao khi đồng hồ nhịp đếm "Một... Hai... Ba!".
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong sau khi có người thắng 2 ván.
   - Thắng: Thắng chung cuộc 2 ván; Thua: thua 2 ván (người chơi nhận hoạt cảnh bị búng tai trêu).
7. **Thua thì truyện đi tiếp thế nào:** Đức cười lớn trêu chọc rồi chạy đi vứt rác giùm, cả ba chuyển sang bàn chuyện chụp ảnh kỷ niệm.
8. **Độ khó làm:** Dễ (so sánh lựa chọn 1 trong 3 + hoạt ảnh 2D biểu cảm nhân vật).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Châu:** "Tui biết tỏng ông Đức kiểu gì cũng ra búa mà. Đưa tai đây tui búng nhẹ cho chừa." `[AI_PROPOSED]`

---

#### Đề xuất 6: Gấp thuyền giấy báo (Trang 2)
1. **Tên trò + gợi ý game_id:** Gấp thuyền giấy báo (`mg_fold_boat`)
2. **Trang và vị trí trong kịch bản:** Trang 2, Cảnh duy nhất Bước 3 (sau khi Hạ rủ chơi thuyền, trước khi chọn điều ước viết lên buồm).
3. **Vì sao hợp cảnh:** Thuyền giấy là kỷ vật xuyên suốt Mốc 1, người chơi cùng Quân miết các nếp gấp từ tờ báo cũ để chuẩn bị cho cuộc đua dưới mưa.
4. **Luật (tối đa 3 dòng):**
   - Vuốt nếp gấp theo các đường nét đứt chỉ dẫn trên tờ giấy báo cũ.
   - Thực hiện tuần tự 4 nếp gấp Origami: gập đôi, xếp hai góc tam giác, bẻ mép đáy thuyền, kéo mở lòng thuyền.
   - Mỗi nếp vuốt thẳng thớm và dứt khoát sẽ giúp thuyền nổi lâu và không bị ngấm nước mưa.
5. **Cách chơi (thao tác người chơi):** Giữ chuột trái kéo theo hướng mũi tên chỉ dẫn trên màn hình để thực hiện nếp gấp giấy.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi hoàn thành đủ 4 nếp gấp để tạo thành chiếc thuyền giấy hoàn chỉnh.
   - Thắng (3 sao): Độ chính xác nét vuốt ≥ 85%; 2 sao: ≥ 65%; 1 sao: hoàn thành mọi nếp; Thua: bấm nút bỏ qua/hết 60 giây.
7. **Thua thì truyện đi tiếp thế nào:** Quân chìa tay giúp vuốt lại mép giấy cuối cùng, thuyền vẫn thành hình để chuẩn bị viết lời ước lên buồm.
8. **Độ khó làm:** Vừa (hoạt họa biến dạng nếp gấp 2D).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Quân:** "Cậu gấp khéo ghê. Mép giấy miết chặt vầy thì lâu thấm nước lắm." `[AI_PROPOSED]`

---

#### Đề xuất 7: Vớt thuyền que tre (Trang 2)
1. **Tên trò + gợi ý game_id:** Vớt thuyền que tre (`mg_rescue_boat`)
2. **Trang và vị trí trong kịch bản:** Trang 2, Cảnh duy nhất Bước 5 (sau khi cuộc đua kết thúc, trước khi cả nhóm cùng ký tên lên cánh buồm).
3. **Vì sao hợp cảnh:** Nước mưa chảy xiết cuốn các thuyền khác trôi xa, chỉ có chiếc thuyền của Hạ dạt vào mắc lại gờ đá; người chơi dùng que tre khều thuyền lên bờ nhẹ nhàng tránh rách giấy ướt.
4. **Luật (tối đa 3 dòng):**
   - Di chuyển đầu que tre chạm nhẹ vào mạn thuyền giấy đang bập bềnh gần mép cống.
   - Canh lúc sóng nước dâng nhẹ thì giữ chuột kéo từ từ về phía mép hiên gạch khô.
   - Không giật que quá mạnh khiến thuyền bị rách hoặc chìm.
5. **Cách chơi (thao tác người chơi):** Rê chuột điều khiển que tre, click giữ và kéo nhẹ nhàng theo nhịp nước vào bờ hiên.
6. **Điều kiện xong, và cách chấm sao hoặc thắng/thua:**
   - Xong khi đưa được thuyền lên bờ khô hoặc sau 40 giây.
   - Thắng: Đưa thuyền lên bờ nguyên vẹn; Thua: làm thuyền lật hoặc hết giờ.
7. **Thua thì truyện đi tiếp thế nào:** Hạ nhanh tay thò tay xuống nước vớt nhẹ thuyền lên và mỉm cười bảo "May quá, cánh buồm vẫn còn khô nè".
8. **Độ khó làm:** Vừa (tính toán va chạm vật lý que tre và mạn thuyền nổi bập bềnh).
9. **Thoại gợi ý NPC sau khi chơi (AI_PROPOSED):**  
   > **Hạ:** "Cảm ơn cậu nha! Chiếc thuyền này mắc lại như có duyên với tụi mình vậy." `[AI_PROPOSED]`

---

#### Đề xuất 8: Quét lá dọn Căn cứ (Trang 3)
1. **Tên trò + gợi ý game_id:** Quét lá dọn Căn cứ (`mg_sweep_leaves`)
2. **Trang và vị trí trong kịch bản:** Trang 3, Cảnh A Bước 2 (sau khi khảo sát góc sân sau nhà kho, trước khi khiêng bàn gỗ cũ vào).
3. **Vì sao hợp cảnh:** Góc sân sau bỏ hoang lâu ngày phủ đầy lá bàng rụng và rác mục, Châu yêu cầu "dọn sạch rồi mới được công nhận" Căn cứ.
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

#### Đề xuất 9: Tô biển tên Căn cứ (Trang 3)
1. **Tên trò + gợi ý game_id:** Tô biển tên Căn cứ (`mg_paint_signboard`)
2. **Trang và vị trí trong kịch bản:** Trang 3, Cảnh A Bước 3 (sau khi dọn bàn ghế và chọn kiểu trang trí, trước khi viết 5 điều luật).
3. **Vì sao hợp cảnh:** Đức lấy bìa carton và bút lông mực xanh vẽ viền chữ "CĂN CỨ BÍ MẬT", người chơi cùng tô đậm nét chữ để tấm biển nổi bật từ xa.
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

#### Đề xuất 10: Ép bướm hoa phượng (Trang 4)
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

#### Đề xuất 11: Nhịp mưa tí tách trên mái Căn cứ (Trang 4)
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

## III. BẢNG TỔNG HỢP VÀ TOP KHUYÊN LÀM

### Bảng tóm tắt 11 đề xuất theo Trang:

| # | Tên trò | Gợi ý ID | Trang & Vị trí | Lối chơi chính | Độ khó | Khuyên làm |
|:---:|---|---|---|---|:---:|:---:|
| 1 | **Ô ăn quan Căn cứ** | `mg_o_an_quan` | Trang 4 (Căn cứ) | Đấu trí cờ sỏi truyền thống (4 cấp AI đối thủ) | Khó | ⭐ **Trò đỉnh Căn cứ 1** |
| 2 | **Nhảy ô lò cò Căn cứ** | `mg_nhay_lo_co` | Trang 4 (Căn cứ) | Nhịp nhảy phím + giữ thăng bằng nhặt sành | Vừa | ⭐ **Trò đỉnh Căn cứ 2** |
| 3 | **Bắn bi ve bãi đất** | `mg_ban_bi_ve` | Trang 3 & 4 (Căn cứ) | Kéo lực búng bi + xoáy bi ve (4 cấp AI đối thủ) | Vừa | ⭐ **Trò đỉnh Căn cứ 3** |
| 4 | **Búng thước kẻ học trò** | `mg_ruler_battle` | Trang 1 (trong lớp) | Kéo nạp lực bật cong thước kẻ đẩy gôm | Dễ | Khuyên làm |
| 5 | **Oẳn tù tì búng tai** | `mg_rock_paper_scissors` | Trang 1 (ghế đá tạp hóa) | Kéo - Búa - Bao đoán thói quen + búng tai | Dễ | Khuyên làm |
| 6 | **Gấp thuyền giấy báo** | `mg_fold_boat` | Trang 2 (dưới mái hiên) | Vuốt nếp gấp Origami theo chỉ dẫn nét đứt | Vừa | ⭐ **Top cốt truyện 1** |
| 7 | **Vớt thuyền que tre** | `mg_rescue_boat` | Trang 2 (rãnh nước) | Canh thời điểm khều thuyền giấy bập bềnh | Vừa | Xem xét |
| 8 | **Quét lá dọn Căn cứ** | `mg_sweep_leaves` | Trang 3 (sân sau kho) | Giữ & rê chuột quét gom rác lá khô vào đống | Dễ | Xem xét |
| 9 | **Tô biển tên Căn cứ** | `mg_paint_signboard` | Trang 3 (Căn cứ) | Di chuột tô kín nét chữ in rỗng bìa carton | Dễ | Xem xét |
| 10 | **Ép bướm hoa phượng** | `mg_phoenix_butterfly` | Trang 4 (gốc phượng) | Kéo thả ghép cánh & nhị hoa thành bướm | Dễ | ⭐ **Top cốt truyện 2** |
| 11 | **Nhịp mưa tí tách** | `mg_raindrop_rhythm` | Trang 4 (mái Căn cứ) | Canh nhịp giọt nước rơi theo tiết tấu âm thanh | Vừa | Xem xét |

---

### Top 4 trò khuyên chủ dự án triển khai trước:

1. **Bộ đôi trò chơi Căn cứ: Ô ăn quan & Nhảy ô lò cò (`mg_o_an_quan`, `mg_nhay_lo_co`):**
   - *Lý do:* Đây là "linh hồn" của Căn cứ bí mật từ lớp 7 đến tận lớp 9. Cơ chế chọn đối thủ = chọn độ khó phản ánh tuyệt đối tính cách của 4 nhân vật (Đức ẩu, Hạ nhường, Quân thể lực, Châu tính toán), mang lại giá trị chơi lại cực kỳ cao cho game.
2. **Gấp thuyền giấy báo (`mg_fold_boat` — Trang 2):**
   - *Lý do:* Thuyền giấy là kỷ vật linh thiêng kết nối cả nhóm 5 người. Tự tay gấp thuyền giúp khoảnh khắc viết lời ước và đua thuyền trở nên nhập tâm và xúc động hơn rất nhiều.
3. **Búng thước kẻ học trò (`mg_ruler_battle` — Trang 1):**
   - *Lý do:* Trò chơi quốc dân của học sinh cấp 2 giờ giải lao, cơ chế vật lý búng trượt cực kỳ đơn giản dễ làm (Dễ) nhưng vô cùng hoài niệm và thân thuộc.
4. **Ép bướm hoa phượng (`mg_phoenix_butterfly` — Trang 4):**
   - *Lý do:* Nét đẹp thơ mộng nhất của mùa bế giảng hè Việt Nam, kết lại Mốc 1 bằng một thao tác kéo thả tinh tế, tạo nên kỷ vật trang vở học trò khó phai.
