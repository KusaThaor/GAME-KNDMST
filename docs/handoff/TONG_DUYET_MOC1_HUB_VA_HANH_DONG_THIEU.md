# TỔNG DUYỆT TOÀN BỘ MỐC 1: KỊCH BẢN LIỀN MẠCH (HUB 2026 + TRANG 1–4), CÂU HỎI CHỐT & CÁC PHẦN CÒN THIẾU

| Thông tin tài liệu | Chi tiết |
|---|---|
| **Ngày tổng hợp** | 25/11/2026 |
| **Mục đích** | Bản đọc duyệt duy nhất dành cho **Chủ dự án** (không cần đọc code): duyệt 1 lượt toàn bộ mạch chơi Mốc 1, chốt danh sách câu hỏi mở khóa bản Production, và nắm rõ các phần việc kỹ thuật còn thiếu trước bản đo 05/12 |
| **Nhánh làm việc** | `docs/tong-duyet-moc1-4-trang` (xuất phát từ `origin/feat/sprint-0412` @ `85d9371`) |
| **Trạng thái chữ thoại** | Toàn bộ chữ mới / sửa = **PROPOSED**, chờ chủ dự án duyệt |

---

## Phần 1. Bảng kiểm nhanh & Nguồn đã gom

### 1.1 Nguồn các nhánh đã gom
| Phần nội dung | Nhánh git & Commit đã lấy | File nguồn | Đã có bản `v1.1` (nối Hub 2026)? | Ghi chú kỹ thuật |
|---|---|---|---|---|
| **Trang 1 & Hub Mở đầu / Về phòng 1** | `origin/task/R-A1-v1.1-hub` (`88b1e63`) | `docs/handoff/gemini/R-A1/THOAI_TRANG1_v1.1.md` | **Đã có (`v1.1`)** | Có đủ Hub Mở đầu (2 món đồ nền: vở cũ, khăn quàng đỏ), 8 cảnh P1-1…P1-8, và cảnh về phòng sau Trang 1 |
| **Trang 2 & Hub Trước / Sau Trang 2** | `origin/task/R-A2-v1.1-hub` (`81094c1`) | `docs/handoff/gemini/R-A2/THOAI_TRANG2_v1.1.md` | **Đã có (`v1.1`)** | Có đủ Hub trước Trang 2 (2 món đồ nền: ảnh lớp phai, hộp bút sắt), 6 cảnh P2-1…P2-6, và cảnh về phòng sau Trang 2 |
| **Trang 3 & Hub Trước / Sau Trang 3** | `origin/task/R-A4-v1.1-hub` (`c160a2d`) *(lưu ý: nhánh `origin/task/R-A3-v1.1-hub` mới tới `74762dd` bản `v1.0`)* | `docs/handoff/gemini/R-A3/THOAI_TRANG3_v1.1.md` | **Đã có (`v1.1`)** | Bản `THOAI_TRANG3_v1.1.md` nằm tại commit `c160a2d` trên nhánh `R-A4-v1.1-hub`; có Hub trước Trang 3 (2 món đồ nền: cục gôm, thước kẻ), P3-1…P3-8 (đã đổi P3-5 trước P3-4), và cảnh về phòng sau Trang 3 |
| **Trang 4 & Hub Trước / Sau Trang 4 + Kết Mốc 1** | `origin/task/R-A4-v1.1-hub` (`c4133e9`) | `docs/handoff/gemini/R-A4/THOAI_TRANG4_v1.1.md` | **Đã có (`v1.1`)** | Có câu bấm món đồ mờ (chưa mở khóa), câu móc kỷ vật 4, P4-1…P4-8 (ảnh 1 gốc phượng, ảnh 2 khúc gỗ bãi đất), về phòng mở Album + Điện thoại + Kết Mốc 1 |
| **Hub 2026 hiện trạng & Chữ giả** | `origin/feat/sprint-0412` (`85d9371`) | `chapters.ts`, `hub.ts`, `hubRoom.ts`, `FeedbackForm.tsx` | — | Đã đối chiếu toàn bộ nhãn `[PLACEHOLDER]` cần gỡ cho phiếu `R-P1` |
| **Kế hoạch Refactor & Hạng mục thiếu** | `origin/task/R-B0-tong-hop-refactor` (`50937e7`) | `docs/handoff/TONG_HOP_4_TRANG_VA_KE_HOACH_REFACTOR.md` | — | Đối chiếu thêm lịch sử merge mới trên `feat/sprint-0412`: `N-24`, `N-01b`, `N-22a`, `RF-1`, `RF-2`, `RF-4` đã gộp; còn `RF-3` đang chờ gộp |

### 1.2 Rà soát khớp nối giữa 4 trang (giọng nhân vật, nhịp cảm xúc, chuyển cảnh)
- **Mốc năm bối cảnh:** Toàn bộ 4 trang và GDD thống nhất nhân vật chính sinh năm 2003 → **Trang 1 là tháng 9/2014 (lớp 6)**, **Trang 2 đầu lớp 7 (2015)**, **Trang 3 đầu HK2 lớp 7 (2016)**, **Trang 4 cuối lớp 7 (tháng 5/2016)**, và hiện tại là **năm 2026** (23 tuổi). Không còn mốc năm lệch.
- **Giọng & xưng hô 5 nhân vật:** Rất nhất quán xuyên suốt 4 trang:
  - **Đức:** "tớ – cậu" ở đầu Trang 1 → lỡ miệng sang "tao – mày" cuối Cảnh A Trang 1 → dùng "tao – mày" với người chơi & Châu từ Trang 1 Cảnh B trở đi; giữ "tớ – cậu" với Quân & Hạ lúc mới gặp ở Trang 2, tới Trang 3–4 thân thiết cả 5 thì dùng "tao – mày" đồng loạt.
  - **Châu:** Luôn xưng "tui", gọi Đức/Quân là "ông", gọi chung là "hai người / mấy người", tuyệt đối trung tính giới tính với người chơi (chỉ dùng `{g:ông|bà}` đúng 1 lần ở Trang 3).
  - **Hạ:** Tự xưng "Hạ", gọi tên từng bạn; chỉ gọi tên người chơi sau phần giới thiệu cuối Trang 2.
  - **Quân:** Luôn nhẹ nhàng, câu ngắn, giữ "tớ – cậu" ngay cả khi Đức gọi "mày".
  - **Người chơi:** Lúc 23 tuổi ở Phòng 2026 tự xưng "mình", gọi nhóm "tụi mình"; trong ký ức thì xưng hô theo từng người đối diện.
- **3 điểm nhỏ chưa khớp cần lưu ý (đã gom vào Phần 3 để chủ dự án chốt):**
  1. **Nhịp chuyển từ Trang 3 về phòng sang Trang 4:** Sau Trang 3, nhân vật chính nhìn gáy sổ luật nhô ra mép kệ và thấy bồn chồn, nhưng **chưa có câu dẫn nhắc quay lại thùng đồ** để tìm kỷ vật cuối (tấm ảnh 5 người ố góc). Đã đánh dấu `[CẦN BỔ SUNG CÂU DẪN]` ở Phần 2 và đưa vào Câu hỏi 11 ở Phần 3.
  2. **Tên gọi 1 món đồ nền trong thùng:** Trang 2 gọi là *"Hộp bút cũ"*, trong khi danh sách đồ của phòng 2026 đặt tên là *"Hộp bút sắt"* (trong câu thoại cũng có chữ "lạch cạch"). Đề xuất thống nhất tên hiển thị là **"Hộp bút sắt"** (câu thoại giữ tự nhiên).
  3. **Từ lóng kiểm tra mốc năm & giới hạn từ:** Trang 1 câu 7 của Châu (văn gốc 13 từ, `v1.1` đã rút còn 12 từ để đạt chuẩn), cùng 2 từ *"hư cấu"* (có ở cả Trang 1 và Trang 2) và *"Chốt!"* (Trang 1).

---

## Phần 2. Kịch bản liền mạch từ đầu tới cuối Mốc 1 (để đọc duyệt 1 lượt)

> *Ghi chú khi đọc: Toàn bộ phần này bỏ hoàn toàn mã kỹ thuật để đọc một mạch như kịch bản phim/game. `[Tên người chơi]` là tên do người chơi tự đặt lúc mở đầu.*

---

### CHƯƠNG MỞ ĐẦU · PHÒNG TRỌ NĂM 2026

**Bối cảnh:** Một tối muộn năm 2026 trong căn phòng trọ nhỏ. Ngoài cửa sổ là bầu trời chạng vạng tối yên tĩnh; bên trong, ánh đèn bàn làm việc hắt quầng sáng vàng ấm xuống một góc phòng.

> **Người dẫn chuyện:** "Phòng trọ năm 2026. Ánh đèn bàn hắt lên một góc phòng tĩnh lặng."
> **Người dẫn chuyện:** "Trên sàn có chiếc thùng carton dán băng keo ngả vàng: 'Đồ cũ – đừng vứt.'"

*(Người chơi nhập tên và chọn ngoại hình. Gợi ý trên màn hình: **Kéo chuột quan sát · Bước tới gần thùng**)*

*Người chơi đi lại gần chiếc thùng carton ở góc phòng. Gợi ý hiện lên: **Nhấn E để mở Hộp Kỷ Vật**. Người chơi mở nắp thùng.*

> **[Tên người chơi]** *(độc thoại)*: "Toàn đồ hồi cấp hai… Vở cũ, khăn quàng đỏ, cả tấm ảnh lớp."
> **[Tên người chơi]** *(độc thoại)*: "Ủa, mẩu giấy gấp tư góc này… là cái gì đây ta?"

*(Gợi ý trên màn hình: **Bấm vào mẩu giấy gấp tư đang sáng**. Trước khi bấm mẩu giấy, người chơi có thể bấm xem các món đồ cũ nằm lẫn trong thùng — chọn đại diện 2 món đầu tiên:)*

- *Bấm vào **mấy cuốn vở cũ**:*
  > **[Tên người chơi]**: "Vở bài tập lớp 6… Chữ mình hồi đó viết nghệch ngoạc ghê."
- *Bấm vào **chiếc khăn quàng đỏ**:*
  > **[Tên người chơi]**: "Khăn quàng đỏ nè… Hồi đó sáng nào quên đeo là bị sao đỏ ghi tên."

*Nếu người chơi bấm thử vào các kỷ vật nằm sâu hơn chưa tới lượt mở (đang tối mờ):*
> **[Tên người chơi]**: "Món này còn mờ quá… để mình nhớ lại từ từ đã."

*Người chơi chạm vào **Mẩu giấy mật lệnh số 01** đang phát sáng nhẹ ở góc thùng và mở tờ giấy gấp tư ra. Trên giấy toàn hình tròn, hình vuông, mũi tên, kèm dòng chữ: "Mật lệnh số 01 – Chỉ dành cho người đủ can đảm tham gia!" cùng vài chỗ gạch sửa bằng mực bi đỏ.*

> **[Tên người chơi]** *(độc thoại)*: "Mật lệnh số 01… Mực đỏ này nhìn quen ghê, là chữ ai ta?"
> **[Tên người chơi]** *(độc thoại)*: "Không biết ngày đó… tụi mình bắt đầu chơi chung từ lúc nào nhỉ?"

*Tiếng ve hè xao xác và tiếng trống trường từ xa bỗng vọng lại. Ánh đèn bàn mờ dần, màn hình tan vào nắng sớm rực rỡ của sân trường cấp 2 năm 2014.*

---

### TRANG 1 · MẬT LỆNH SỐ 01 (Lớp 6, tháng 9/2014)

#### Cảnh 1 · Cổng trường, vở rơi
*Thẻ chữ hiện lên giữa nền trời sáng:*
> **Ngày đầu lớp 6**
> *Một buổi sáng tháng Chín, năm 2014*

*(Bảng hướng dẫn điều khiển hiện lần đầu, tự tắt sau khi đi và nói chuyện: **Đi/chạy quanh sân · Bấm nút nói chuyện · Kéo chuột xoay góc nhìn**)*

**Bối cảnh:** Sân trường THCS buổi sáng tấp nập học sinh. Người chơi đeo cặp bước qua cổng trường. Đi được vài bước thì nghe tiếng "bịch" — một cuốn vở rơi xuống đất phía sau lưng. Một cậu bạn hớt hải chạy tới nhặt lên, dừng trước mặt người chơi.

*(Gợi ý góc màn hình: **Nói chuyện với bạn nhặt vở**)*

- **Đức** *(vẫy tay)*: "Ê, bạn gì ơi! Vở của cậu nè, suýt bay xuống sân luôn đó."
- **[Tên người chơi]**: "À, cảm ơn cậu nha."
- **Đức**: "Nhãn vở ghi chung lớp với tớ nè! Đi tìm phòng chung không?"
- **[Tên người chơi]**: "Ừ, tớ cũng chưa quen đường."
- **Đức** *(tạo dáng "tada")*: "Yên tâm, để tớ dẫn. Tớ mới đi lạc có… hai lần thôi!"
- **[Tên người chơi]**: "Ủa, vậy cậu có chắc biết đường không?"

#### Cảnh 2 · Đi xem bảng phân lớp & Gặp Châu ở cửa lớp
- **Đức**: "Ơ… chuyện nhỏ! Đi theo tớ là được!"

*(Gợi ý góc màn hình: **Đi theo Đức**)*

*Đức quay lưng đi trước từ cổng qua sân lớn rồi rẽ vào dãy hành lang (màn hình hiện tên khu). Tới trước bảng danh sách phân lớp, Đức dừng lại quay sang người chơi.*

- **Đức**: "Tới rồi! Thấy chưa, tớ nói biết đường mà."

*(Gợi ý góc màn hình: **Xem bảng phân lớp** → Người chơi bấm xem bảng)*

- **Đức**: "Tên tớ nè, Đức! Còn tên cậu nằm ngay dưới luôn."

*Ở cửa lớp gần đó, một bạn nữ mặc đồng phục gọn gàng đứng ngoái lại vẫy tay gọi.*

- **Châu** *(vẫy tay ở cửa lớp)*: "Hai người lớp này hả? Vô lẹ, sắp trống rồi."

*(Gợi ý góc màn hình: **Vào lớp** → Người chơi bước qua cửa vào lớp học)*

#### Cảnh 3 · Giờ học: Mảnh giấy mật lệnh
**Bối cảnh:** Bên trong lớp học. Cả ba đứng quanh bàn học gần cửa sổ. Đức quay sang người chơi thì thào:

- **Đức** *(thì thào)*: "Ê, đọc đi! Mật lệnh tuyệt mật đó."

*(Gợi ý góc màn hình: **Giải mật lệnh của Đức**)*

*Máy quay tiến sát vào mảnh giấy nháp đặt trên mặt bàn. Người chơi chơi trò ghép ký hiệu với chữ cái để giải mật lệnh (không có thua). Giải xong, máy quay lùi ra:*

- **[Tên người chơi]**: "Mật lệnh tuyệt mật… là \"RA CHƠI\" thôi hả?"
- **Đức** *(tạo dáng chữ V)*: "Mật mã cấp cao đó! Người ngoài đọc không ra đâu."
- **Châu**: "Cấp cao đâu không thấy, chữ ông viết còn không đọc nổi."
- **Đức**: "Ơ… dạ, Châu Tổng."
- **Châu**: "Gọi vậy nữa là tui khỏi sửa."
- **Đức** *(tạo dáng "tada")*: "Dạ, Châu Tổng."
- **Châu**: "Tui không muốn hai người làm mất thời gian cả lớp thôi."

#### Cảnh 4 · Ra chơi: Đá cầu sân trường
*Tiếng trống ra chơi vang lên. Đức bật người chạy ngay ra cửa lớp; Châu tay cầm quả cầu đá đi theo sau; người chơi theo hai bạn ra hành lang rồi xuống sân.*

- **Đức** *(vừa chạy ra cửa)*: "Ra chơi rồi! Xuống sân, tớ biểu diễn cho coi!"

*(Gợi ý góc màn hình: **Đi theo Đức ra sân** → Khi tới vòng đá cầu: **Đá cầu cùng Đức**)*

*Người chơi bước vào đối diện Đức:*
- **Đức**: "Cậu cứ nhìn là biết tớ đá giỏi cỡ nào!"

*(Người chơi chơi trò giữ nhịp đá cầu. Dù thắng, thua hay bấm Bỏ qua, ở lượt cuối Đức luôn vung chân đá hụt khiến quả cầu bay thẳng vào bụi cây ven sân.)*

- **Châu**: "Ừ, giỏi dữ chưa. Cầu bay vô bụi luôn rồi kìa."
- **Đức** *(tạo dáng "tada")*: "Chiến thuật đánh lạc hướng thôi!"
- **Châu** *(đi về phía bụi cây)*: "Để tui lượm. Hai người đứng yên đó."

#### Cảnh 5 · Trực nhật cuối buổi
*Cuối buổi học, cả lớp đã về hết. Đức đi trước về lớp, người chơi theo sau. Châu đã xếp gọn gàng các dãy ghế rồi đi ra cửa đứng đeo cặp.*

*(Gợi ý góc màn hình: **Cuối buổi: về lớp trực nhật** → Khi tới bảng đen: **Lau bảng cùng Đức**)*

- **Châu**: "Ghế tui xếp xong rồi. Bảng là phần hai người nha."

*Người chơi và Đức tới trước bảng đen; máy quay tiến sát mặt bảng để chơi trò lau sạch bảng phấn. Lau xong, máy quay lùi ra:*

- **Đức**: "Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ."
- **Châu** *(đứng ở cửa, ngoái lại)*: "Mới quen một bữa mà ông mày tao rồi hả?"
- **Đức** *(tạo dáng chữ V)*: "Thì quen rồi còn gì!"
- **[Tên người chơi]**: "Ừ… nếu mai không có kiểm tra."
- **Châu** *(vẫy tay rồi bước ra khỏi cửa khuất dần)*: "Làm bài tập trước đi rồi tính. Tui về đây."
- **[Tên người chơi]** *(đứng nhìn ra sân, độc thoại)*: "Ngày đầu ở trường mới… hình như cũng không tệ như mình nghĩ."

#### Cảnh 6 · Mấy tháng sau (chuyển cảnh)
*Thẻ chữ hiện lên:*
> **Mấy tháng sau…**
> *Bảng lớp đã ghi "Ôn tập học kỳ I".*

*Trong lúc tối, ánh sáng chuyển sang chiều vàng tan học với bóng nắng đổ dài. Đức và Châu đứng chờ sẵn trên bậc thềm tiệm tạp hóa trước cổng trường; người chơi đứng gần cổng nhìn về phía tiệm. Từ lúc này, Đức chuyển hẳn sang xưng "tao – mày" với cả người chơi và Châu.*

#### Cảnh 7 · Chia gói mì tôm ở tiệm tạp hóa
*Đức đứng trên bậc thềm vẫy tay rối rít gọi người chơi lại.*

- **Đức** *(vẫy tay)*: "Ê ê! Còn đúng một gói mì thôi! Lẹ lên mày!"

*(Gợi ý góc màn hình: **Tới bậc thềm tiệm tạp hóa**)*

*Người chơi đi tới đứng vào chỗ giữa hai bạn trên bậc thềm. Máy quay tiến sát gói mì tôm để chơi trò bóp vụn mì, rắc gia vị và lắc đều. Xong, máy quay lùi ra:*

- **Đức**: "Chia ba thì còn được mấy sợi!"
- **Châu**: "Chia đều. Không bàn nữa."
- **Đức** *(reo mừng)*: "Ê, ba đứa mình chưa có tấm hình chung nào hết á!"
- **Đức** *(tạo dáng chữ V)*: "[Tên người chơi] có máy ảnh mà! Quay ngược máy lại, tự sướng!"
- **Châu**: "Máy đó đâu có màn hình đằng trước. Sao biết có vô hình không?"
- **Đức**: "…Đoán."

#### Cảnh 8 · Bức ảnh tự sướng đầu tiên của bộ ba
*(Gợi ý góc màn hình: **Chụp ảnh tự sướng bộ ba**)*

*Chiếc máy ảnh nhỏ hiện trên tay người chơi, giơ lên duỗi thẳng tay và quay ngược ống kính về phía mặt. Đức và Châu đi chen sát vào hai bên.*

- **Lần bấm 1** *(lời nhắc: **Quay ngược máy, đoán khung rồi bấm**)* — *Flash chớp trắng + tiếng chụp "tách". Ảnh lệch lên chỉ thấy trán Đức.*
  - **Châu** *(quay sang Đức)*: "Khoan! Đức, tóc ông dựng lọt hết vô khung kìa!"
- **Lần bấm 2** *(lời nhắc: **Lệch rồi! Chỉnh hướng máy, bấm lại**)* — *Flash chớp + tiếng "tách". Ảnh hơi nghiêng nhưng cả ba đều đang cười.*
- **Lần bấm 3** *(lời nhắc: **Lần cuối: cố cho đủ ba người**)* — *Đức tạo dáng chữ V, Châu quay sang nhắc Đức. Flash chớp + tiếng "tách".*
- **Chọn ảnh** *(lời nhắc: **Chọn một tấm để giữ**)* — *Người chơi chọn giữ 1 trong 3 tấm, hạ máy ảnh xuống:*

- **Đức**: "Tấm này hư cấu quá! Chụp lại đi!"
- **Châu**: "Tui thấy giữ tấm này được nè. Nhìn ngố y chang ông đó Đức."
- **[Tên người chơi]**: "Mai mốt nhất định tụi mình phải chụp thêm nhiều tấm nữa nha."
- **Đức** *(reo mừng)*: "Chốt! Sau này chụp đủ một bộ sưu tập luôn!"

---

#### Về phòng 2026 sau Trang 1 → Móc nối sang Trang 2
*Màn hình dịu lại, trả người chơi về căn phòng trọ năm 2026 buổi tối. Trên kệ sách, **Mẩu giấy mật lệnh số 01** đã nằm ngay ngắn trong khung kính nhỏ. Cuốn Album trên bàn sáng nhẹ, trang đầu tiên **"Ba đứa mình"** đã hiện rõ bức ảnh tự sướng vừa chọn.*

- **[Tên người chơi]** *(độc thoại)*: "Thì ra tụi mình quen nhau từ một cuốn vở rơi… Bức ảnh đầu tiên nhìn ngố thiệt."
- **[Tên người chơi]** *(độc thoại)*: "Để mình dán tấm hình này vô Album, rồi coi tiếp trong thùng còn gì nữa."

*(Gợi ý góc màn hình: **Xem Album hoặc mở lại Hộp Kỷ Vật**)*

*Người chơi quay lại chiếc thùng carton cũ ở góc phòng, mở nắp ra lục tiếp.*
- **[Tên người chơi]** *(độc thoại)*: "Lục tiếp coi trong thùng còn giữ món nào nữa."

*(Nếu người chơi bấm xem 2 món đồ nền tiếp theo trong thùng:)*
- *Chạm vào **tấm ảnh lớp đã phai**:*
  > **[Tên người chơi]**: "Tấm ảnh lớp hồi đó… màu phai gần hết, nhìn hồi lâu mới nhận ra từng đứa."
- *Nhấc **chiếc hộp bút sắt cũ** lên lắc nhẹ:*
  > **[Tên người chơi]**: "Hộp bút cũ lắc lên còn kêu lạch cạch. Nắp hộp vẫn còn mấy vết xước hồi đi học."

*Ở góc thùng, một **chiếc thuyền giấy phai màu** sáng nhẹ lên. Người chơi cầm lên xoay nhìn cánh buồm:*
- **[Tên người chơi]** *(độc thoại)*: "Cánh buồm vẫn còn dòng chữ nhòe… hồi đó mình ước gì vậy ta?"

*Ngoài cửa sổ, tiếng mưa bỗng đổ ào tới. Màn hình tối dần — chuyển vào ký ức Trang 2.*

---

### TRANG 2 · THUYỀN GIẤY DƯỚI MÁI HIÊN (Đầu lớp 7, 2015)

#### Cảnh 1 · Mưa đổ, chạy vào hiên
*Thẻ chữ hiện lên:*
> **Lớp 7. Một chiều mưa.**
> *Giờ ra chơi, mưa đổ ào xuống sân.*

**Bối cảnh:** Trời mưa lớn. Người chơi đứng giữa sân trường; Đức và Châu đang đứng trú dưới mái hiên, nhìn ra sân vẫy tay gọi.

- **Đức** *(vẫy tay)*: "Vô lẹ mày! Ướt như chuột lột bây giờ!"

*(Gợi ý góc màn hình: **Chạy vào hiên tránh mưa** → Người chơi chạy vào đứng cạnh Đức và Châu)*

- **Đức**: "Nghỉ hè có hai tháng mà tao thấy như hai năm."
- **Châu**: "Tại ông không làm bài tập hè."
- **Đức**: "Ủa, chưa gì đã nghi tao rồi!"

*Đức nhìn dọc mái hiên về phía đầu hiên bên kia, vẫy tay ra hiệu:*
- **Đức**: "Ê, đầu hiên có ai gấp thuyền kìa. Đi coi!"

*(Gợi ý góc màn hình: **Đi theo Đức**)*

#### Cảnh 2 · Gặp Hạ và Quân đang gấp thuyền
*Đức đi trước dọc hiên (chờ nếu người chơi tụt lại), Châu đi theo sau một nhịp, người chơi theo sau. Ở đầu hiên, Hạ cầm một chiếc thuyền giấy, Quân ôm xấp giấy đứng giữ gió. Cả nhóm dừng lại.*

- **Đức**: "Ê! Thuyền đẹp đó! Cậu gấp hả?"
- **Hạ**: "Ừm… mưa nhiều nên Hạ gấp thử."
- **Đức** *(reo mừng)*: "Hay mình thi coi thuyền ai chạy xa nhất đi!"
- **Châu** *(bước lên ngang hàng Đức)*: "Thi thì phải có luật. Thả rồi không được lấy tay đẩy."
- **Đức** *(tạo dáng chữ V)*: "Rồi rồi, Châu Tổng làm trọng tài."
- **[Tên người chơi]**: "Hai cậu chơi chung hông?"
- **Hạ** *(nhìn Quân rồi nhìn người chơi)*: "Có… nếu mọi người không ngại."
- **Quân** *(bước tới gần người chơi)*: "Tớ giữ giấy cho. Gió thổi bay mất."
- **Hạ** *(đưa tờ giấy về phía người chơi)*: "Giấy đây. Viết xong gấp buồm vô nha."

*(Gợi ý góc màn hình: **Viết điều ước lên buồm**)*

#### Cảnh 3 · Viết điều ước lên cánh buồm
*Cả năm đứng quây dưới đầu hiên. Máy quay tiến sát đôi tay người chơi và cánh buồm giấy trống.*

- **Hạ**: "Viết một điều ước lên buồm đi. Thuyền chạy tới đâu, điều ước theo tới đó."

*(Gợi ý góc màn hình: **Chọn điều ước viết lên buồm** → Người chơi chọn 1 trong 3 điều ước:)*
1. *"Mai mốt vẫn chơi chung vầy."* (Ấm áp)
2. *"Lớp 7 vui hơn lớp 6."* (Rộn ràng)
3. *"Bí mật không nói ra."* (Sâu lắng)

*Chữ điều ước hiện lên cánh buồm; máy quay lùi ra nhìn cả năm bạn:*
- **Đức** *(tạo dáng "tada")*: "Tớ ước… thuyền tớ đừng lật!"
- **Châu**: "Ước gì kỳ vậy."
- **Hạ** *(nhìn ra mép hiên)*: "Xếp năm chiếc ở mép rãnh trước đã."

*(Gợi ý góc màn hình: **Ra mép rãnh nước**)*

#### Cảnh 4 · Chụp năm chiếc thuyền trước khi thả
*Cả năm bước ra mép rãnh nước chảy đầy. Năm chiếc thuyền giấy xếp hàng ngay ngắn dọc mép rãnh. Người chơi đứng lùi ra cách 2–3 mét nhìn thẳng vào hàng thuyền.*

- **Hạ**: "Chụp lại năm chiếc trước khi thả được hông?"
- **Đức** *(vẫy tay)*: "Có nè! Máy của mày đó, chụp lẹ đi!"

*(Gợi ý góc màn hình: **Chụp năm chiếc thuyền trước khi thả** · Lời nhắc khung ngắm: **Bấm chụp khi đủ năm chiếc trong khung**)*

*Người chơi giơ máy ảnh bấm chụp "tách", rồi hạ máy xuống.*
- **Đức** *(tạo dáng chữ V)*: "Tấm này làm bằng chứng thuyền tớ thắng nha!"
- **Châu**: "Chưa thả mà ông đòi thắng rồi."

*Châu đi dọc mép rãnh xuống cuối rãnh để làm trọng tài.*

#### Cảnh 5 · Thả thuyền (trò chơi đua thuyền)
*Đức chạy tới sát mép rãnh cạnh hàng thuyền. Châu đứng ở cuối rãnh quay mặt lại:*
- **Châu**: "Tui đứng cuối rãnh làm trọng tài. Thả đi!"

*(Gợi ý góc màn hình: **Ra mép rãnh thả thuyền**)*

*Máy quay tiến xuống sát mặt nước rãnh. Người chơi chọn kiểu thuyền (buồm/mui/đôi), canh lực thả và điều khiển né rác xoáy nước. Dù thắng, thua hay Bỏ qua, kết quả câu chuyện vẫn cố định: thuyền Đức lật ngay khi thả, thuyền Quân xa nhất, thuyền Hạ đẹp nhất nhưng chậm nhất. Xong trò, máy quay lùi ra:*

- **Đức** *(chạy dọc mép rãnh)*: "Sao lật rồi? Ai thấy không? Có người tác động dòng nước!"
- **Châu**: "Ông thả lệch. Tui thấy rõ."
- **Quân**: "Thuyền tớ… hình như xa nhất."
- **Đức** *(đi hai bước lại gần Quân)*: "Hư cấu! Thuyền cậu gắn động cơ hả?"
- **Châu**: "Thua thì nhận đi."
- **Đức** *(tạo dáng chữ V)*: "Ván sau tớ phục thù!"
- **Hạ** *(nhìn dọc rãnh nước)*: "Thuyền Hạ… mắc ở cuối rãnh rồi."

*(Gợi ý góc màn hình: **Vớt thuyền ở cuối rãnh**)*

#### Cảnh 6 · Vớt thuyền, cả nhóm ký tên, trống vào lớp
*Mưa nhỏ dần. Bốn chiếc thuyền kia đã trôi mất; chỉ còn thuyền của Hạ mắc sát bờ cuối rãnh. Người chơi đi tới cuối rãnh vớt chiếc thuyền ướt lên tay; Đức chạy tới, Châu đi theo cạnh.*

- **Đức**: "À mà chưa giới thiệu! Tớ là Đức, đây là [Tên người chơi], còn đây là Châu Tổng khó tính."
- **Châu**: "Giới thiệu người ta thì bớt bình luận giùm."
- **Hạ** *(bước tới, vẫy tay)*: "Hạ nè. Lớp bên."
- **Quân** *(đi sau Hạ)*: "Quân. Cũng lớp bên."

*Hạ tiến sát cạnh người chơi đưa cây bút; máy quay tiến vào cánh buồm chiếc thuyền ướt:*
- **Hạ**: "Thuyền của [Tên người chơi] trôi mất rồi. Ghi lại điều ước lên buồm này đi."

*Dòng điều ước đã chọn hiện lên buồm, rồi lần lượt năm chữ ký ký xuống: **[Tên người chơi] → Hạ → Quân → Châu → Đức** (chen vào mép cuối). Máy quay lùi ra:*
- **[Tên người chơi]**: "Mai ra chơi mình chơi tiếp nha?"
- **Hạ**: "Ừ, mai Hạ mang thêm giấy."
- **Quân**: "Tớ mang giấy báo cũ. Gấp cứng hơn."

*Tiếng trống vào lớp vang lên ("Tùng… tùng… tùng…"). Châu quay người đi về phía cửa lớp:*
- **Châu** *(vừa đi vừa nói)*: "Nhớ đúng giờ nha. Đừng để người khác chờ."

*(Gợi ý góc màn hình: **Đi theo Châu vào lớp** → Cả nhóm đi theo Châu vào lớp, khung hình mờ dần.)*

---

#### Về phòng 2026 sau Trang 2 → Móc nối sang Trang 3
*Màn hình sáng lại trong phòng trọ năm 2026. Ánh sáng căn phòng ấm áp hơn hẳn (đèn bàn sáng rõ, bầu trời ngoài cửa sổ chuyển sang sắc hoàng hôn dịu). Trên kệ sách đặt ngay ngắn **chiếc thuyền giấy phai màu**; trong cuốn Album, trang **"Lần đầu đủ năm"** với ảnh 5 chiếc thuyền đã hiện đầy đủ.*

- **[Tên người chơi]** *(độc thoại)*: "Phòng ấm hơn hẳn — thuyền giấy đã lên kệ, trang 'Lần đầu đủ năm' cũng hiện rõ."
- **[Tên người chơi]** *(độc thoại)*: "Để lục tiếp trong thùng coi món kế tiếp sẽ nhắc mình nhớ chuyện gì."

*Người chơi quay lại mở thùng carton, xem 2 món đồ cũ cuối cùng nằm trong thùng:*
- *Bấm vào **cục gôm mòn**:*
  > **[Tên người chơi]**: "Cục gôm mòn vẹt một góc, hồi đó đứa nào cũng hay mượn rồi quên trả."
- *Bấm vào **cây thước kẻ**:*
  > **[Tên người chơi]**: "Cây thước nhựa tróc hết vạch số, trên mép còn khắc mấy chữ mờ tịt."

*Người chơi chạm vào kỷ vật đang phát sáng tiếp theo: **tấm biển tên vẽ tay và cuốn sổ luật bìa xanh**, lật nhẹ trang đầu tiên:*
- **[Tên người chơi]** *(độc thoại)*: "Tấm biển vẽ tay với sổ bìa xanh… mở trang đầu thấy năm điều luật, hồi đó bày đặt ghê."

*Ánh sáng phòng dịu xuống, đưa người chơi trở về đầu học kỳ II năm lớp 7.*

---

### TRANG 3 · CĂN CỨ BÍ MẬT (Đầu học kỳ II lớp 7, 2016)

#### Mở Trang & Cảnh 1 · Ý tưởng tìm căn cứ
*Thẻ chữ hiện lên:*
> **Đầu học kỳ II**
> *Lớp 7 · Giờ về*

**Bối cảnh:** Sân trường giờ tan học. Bốn bạn Đức, Châu, Quân, Hạ đứng túm tụm ở sân. Người chơi tới chỗ Đức.

*(Gợi ý góc màn hình: **Nói chuyện với Đức ở sân**)*

- **Đức** *(vẫy tay)*: "Tao mới nghĩ ra cái này nè! Kiếm chỗ nào riêng cho tụi mình tụ tập đi."
- **Châu**: "Chỗ nào? Trường đâu phải nhà mình."
- **Quân**: "…Góc sân sau, gần nhà kho. Hình như chỗ đó ít ai ra."
- *(Quân quay mặt về phía lối ra sân sau; Hạ đi lên đứng cạnh Quân.)*
- **Hạ**: "Hạ biết chỗ đó rồi. Có gốc cây đẹp lắm luôn."
- **Đức** *(reo mừng)*: "Chốt! Ra khám phá chỗ mới liền đi tụi mày!"

#### Cảnh 2 · Đi ra sân sau
*(Gợi ý góc màn hình: **Đi theo Đức ra sân sau**)*

*Đức đi trước dẫn đường, Châu nối đuôi Đức; người chơi, Quân và Hạ theo sau qua lối sân sau sát tường rào, băng bãi đất trống tới trước một mái che cũ. Lúc này bảng tên khu vực vẫn hiện là **"Góc sân sau"**.*

- **Đức** *(vừa đi)*: "Theo tao ra lối sân sau đằng này nè!"
- *(Cả nhóm tới mái che cũ; Đức quay lại tạo dáng "tada":)*
- **Đức**: "Tới nơi rồi, đúng là vắng hoe không ai ra thiệt!"

#### Cảnh 3 · Khảo sát góc sân sau
*(Gợi ý góc màn hình: **Xem mái che, gốc cây, thùng giấy** + bộ đếm 0/3)*

*Đức và Châu đứng gần mái che, Hạ ở lối vào; Quân đứng tách ra gần bãi đất trống (nếu bật nhiệm vụ phụ, có thể ghé chỗ Quân chơi một ván bắn bi ngắn nhận nhãn dán viên bi mắt mèo). Người chơi tự do đi xem 3 điểm theo thứ tự bất kỳ:*
- *Khi xem **mái che**:*
  - **Đức**: "Có mái che nè, mưa xuống cũng khỏi sợ ướt!"
- *Khi xem **gốc cây**:*
  - **Châu**: "Gốc cây này ngồi mát thiệt. Hạ nói đúng."
- *Khi xem **đống thùng giấy**:*
  - **Đức** *(vẫy tay)*: "Mấy thùng giấy này xếp lại làm ghế ngồi được nè!"

*Khi đã xem đủ 3/3 điểm:*
- **Châu**: "Hợp thì hợp, nhưng dọn trước đã. Bụi quá trời."
- *(Châu đi vào giữa mái che; Quân quay lại nhập nhóm ở lối vào.)*

#### Cảnh 4 · Dọn dẹp và dựng chỗ ngồi *(chơi trước bước trang trí)*
*(Gợi ý góc màn hình: **Kê bàn ghế dưới mái che**)*

*Quân đi tới đống thùng giấy; Đức và Hạ đi quanh mái che. Người chơi bước vào trước mái che chơi trò dọn dẹp và kê bàn ghế (không có thua). Xong việc, máy quay lùi ra, cả nhóm đứng quanh chiếc bàn vừa kê gọn:*

- **Châu**: "Sạch sẽ gọn gàng rồi đó. Giờ tui mới công nhận."
- **Đức** *(tạo dáng "tada")*: "Từ hôm nay, đây chính thức là Căn cứ Bí mật của tụi mình!"
- *(Quân và Hạ reo mừng. Từ khoảnh khắc này, tên khu vực chính thức đổi thành **"Căn cứ bí mật"**.)*

#### Cảnh 5 · Chọn kiểu trang trí
*(Gợi ý góc màn hình: **Chọn kiểu trang trí cùng Hạ**)*

*Hạ đi tới bên chiếc bàn vừa kê; máy quay đẩy nhẹ vào mặt bàn:*
- **Hạ**: "Căn cứ còn trống quá, [Tên người chơi] chọn kiểu trang trí giùm Hạ nha."

*Người chơi chọn 1 trong 3 kiểu (**Giấy màu** / **Hoa** / **Ảnh**). Đồ trang trí hiện ngay lên bàn và mái che, máy quay lùi ra:*
- *Nếu chọn **Giấy màu** (dây cờ tam giác, hạc giấy):*
  - **Đức** *(reo mừng)*: "Cờ giấy với hạc giấy nè! Treo lên nhìn như sắp mở tiệc vậy!"
- *Nếu chọn **Hoa** (lọ hoa dại, lon sữa trồng cây):*
  - **Hạ**: "Thêm lọ hoa dại vô nhìn chỗ này dịu hẳn lên nè."
- *Nếu chọn **Ảnh** (dây kẹp ảnh, khung ảnh):*
  - **Châu**: "Dây kẹp ảnh nhìn hay đó. Mà chưa có tấm nào đủ năm đứa."

#### Cảnh 6 · Viết 5 điều luật
*(Gợi ý góc màn hình: **Ghi 5 điều luật vào sổ**)*

*Cả nhóm quây quanh chiếc bàn đã trang trí; cuốn sổ bìa xanh và bút đỏ trên tay người chơi.*
- **Châu**: "Phải có luật."

*Máy quay tiến sát vào cuốn sổ. Người chơi ghép đúng nửa sau cho 5 điều luật từng bạn đọc (giữ nguyên 5 điều luật chuẩn, không có thua). Viết xong, sổ đặt xuống bàn, máy quay lùi ra:*
- **Đức** *(tạo dáng "tada")*: "Chốt! Sổ luật viết xong rồi, ai vô Căn cứ cũng phải tuân thủ!"
- **Châu**: "Ông nói như có cả trăm người muốn vô vậy."
- **Đức** *(tạo dáng chữ V)*: "Biết đâu sau này tụi mình nổi tiếng thiệt!"

#### Cảnh 7 · Treo biển và chụp ảnh khai trương
*(Gợi ý góc màn hình trước khi chụp: **Ra mái che cùng Đức** · Lời nhắc chụp: **Chụp tấm biển cho rõ chữ**)*

*Đức cầm tấm biển tên "Căn cứ Bí mật" viết bằng bút lông:*
- **Đức**: "Tên tao trên biển phải viết to nhất!"
- **Châu**: "Không có chuyện đó. Ai cũng bằng nhau."
- *(Hạ đi tới cạnh Đức.)*
- **Hạ**: "Đức mà viết to nhất là tên Quân bị chen mất đó."
- **Đức**: "Mới thành lập đã bị cắt quyền lợi rồi!"

*Đức đi ra mái che treo tấm biển lên; cả nhóm đi theo đứng dưới mái che:*
- **Quân**: "Vậy từ nay có chỗ gặp nhau rồi."
- **Đức** *(tạo dáng "tada")*: "Đây là địa bàn của tụi mình!"
- **Châu**: "Đừng gọi là địa bàn. Nghe ghê quá."
- *(Đức quay sang người chơi, vẫy tay:)*
- **Đức** *(vẫy tay)*: "[Tên người chơi] ơi, chụp tấm biển khai trương giùm tao nha!"

*Người chơi giơ máy ảnh lên, canh khung rõ chữ tấm biển và bấm chụp — ánh flash lóe sáng, lưu ảnh vào Album, rồi hạ máy:*
- **Châu**: "Rõ từng chữ. Lần này ông/bà *(tự đổi theo giới tính người chơi)* chụp đàng hoàng thiệt."
- **Đức** *(tạo dáng chữ V)*: "Thấy chưa, chữ tao viết đẹp ghê hông!"

*(Hết Trang 3 — chuyển về phòng trọ 2026.)*

---

#### Về phòng 2026 sau Trang 3 → Móc nối sang Trang 4
*Quay lại phòng trọ năm 2026. Trên kệ góc phòng, **tấm biển tên "Căn cứ Bí mật" và cuốn sổ luật bìa xanh** vừa được đặt ngay ngắn — riêng cuốn sổ hơi nhô ra khỏi mép kệ.*

- **[Tên người chơi]** *(độc thoại)*: "Biển tên với cuốn sổ luật đã lên kệ rồi, cuốn sổ hơi nhô ra mép."
- **[Tên người chơi]** *(độc thoại)*: "Nhìn gáy sổ tự nhiên thấy bồn chồn… hình như cuối sổ còn một lời hứa chưa kịp mở."

> **`[CẦN BỔ SUNG CÂU DẪN]`** *(Từ chỗ nhìn gáy sổ luật trên kệ quay lại thùng carton lấy kỷ vật cuối cùng — Trang 4)*
> - *Đề xuất A:* **[Tên người chơi]** *(độc thoại)*: "Để quay lại thùng coi còn món nào nữa không — chắc vẫn còn ảnh tụi mình." *(kèm gợi ý góc màn hình: **Mở lại Hộp Kỷ Vật tìm kỷ vật cuối**)*
> - *Đề xuất B:* Chỉ dùng dòng gợi ý góc màn hình không thoại: **Quay lại Hộp Kỷ Vật**

*Người chơi lại gần thùng carton cũ, mở nắp ra bấm vào kỷ vật cuối cùng đang sáng: **Tấm ảnh năm người bị ố góc**.*
- **[Tên người chơi]** *(độc thoại)*: "Tấm ảnh đủ năm đứa đầu tiên… góc bị ố mất rồi mà mình vẫn giữ."

*(Màn hình chuyển về ký ức cuối năm lớp 7, tháng 5/2016.)*

---

### TRANG 4 · ĐỦ NĂM ĐỨA (Cuối lớp 7, tháng 5/2016)

#### Cảnh 1 · Gom cả nhóm ở sân trường
*Thẻ chữ hiện lên:*
> **Cuối năm lớp 7.**
> *Phượng vừa chớm đỏ.*

*(Gợi ý góc màn hình: **Tới gặp Đức giữa sân**)*

**Bối cảnh:** Sân trường tháng Năm nắng ấm. Đức đứng giữa sân tay cầm máy ảnh mượn của người chơi; Châu, Quân, Hạ đứng rải quanh sân. Người chơi tới nói chuyện với Đức:

- **Đức**: "Ê [Tên người chơi]! Tao coi hết mấy tấm ảnh trong máy mày rồi."
- **Đức**: "Chụp quá trời mà chưa có tấm nào đủ năm đứa cho đàng hoàng!"
- *(Đức quay ra sân vẫy tay gọi to; Châu, Quân, Hạ bắt đầu đi lại chỗ Đức.)*
- **Đức** *(vẫy tay)*: "Châu! Quân! Hạ! Lại đây lẹ lên!"
- **Châu** *(vừa tới)*: "Gì mà la muốn sập cả sân trường vậy ông?"
- **Đức** *(tạo dáng "tada")*: "Chụp ảnh! Sắp hết lớp 7 rồi, phải có tấm đủ năm đứa!"
- *(Quân và Hạ tới nơi, cả nhóm đứng thành vòng.)*
- **Quân**: "…Chụp liền chiều nay cũng được. Tớ rảnh."
- *(Đức đưa lại máy ảnh sang tay người chơi.)*
- **Đức**: "Nè, trả máy cho thợ chụp chính của tụi mình đó."
- **Hạ** *(vừa nói vừa đi trước dẫn đường)*: "Mọi người ra gốc phượng nha, chỗ đó nắng đẹp nhất!"

*(Gợi ý góc màn hình: **Đi theo Hạ ra gốc phượng**)*

#### Cảnh 2 · Chọn kiểu ảnh dưới gốc phượng
*(Gợi ý góc màn hình: **Chọn kiểu ảnh**)*

*Cả năm đứng thành vòng dưới gốc phượng. Máy quay tiến vào nhóm; Đức bước lên giữa một bước:*
- **Đức** *(tạo dáng chữ V)*: "Tấm này phải thật ngầu nha. Cho tao đứng giữa!"
- **Châu**: "Sao lúc nào ông cũng đòi đứng giữa vậy?"
- **Đức** *(tạo dáng "tada")*: "Tại tao là nhân vật chính mà!"
- *(Châu quay mặt đi; Hạ quay sang người chơi.)*
- **Châu**: "Nhân vật chính tự phong."
- **Hạ**: "[Tên người chơi] chọn giùm mọi người đi, chụp kiểu nào đây?"

*Người chơi chọn 1 trong 3 kiểu ảnh:*
1. **Tạo dáng nhí nhố làm mặt hề**
2. **Đứng tự nhiên, khoác vai cười tươi**
3. **Nghiêm trang chỉnh tề như ảnh thẻ**

*(Máy quay lùi ra; Quân đi tới cạnh chiếc ghế đá trống gần gốc phượng.)*
- **Quân**: "…Ghế đá này chắc nè, cậu để máy lên đây đi."

#### Cảnh 3 · Đặt máy lên ghế đá
*(Gợi ý góc màn hình: **Đặt máy lên ghế đá**)*

*Người chơi lại gần ghế đá trống, đặt máy ảnh lên ghế. Khung ngắm hiện lên; Quân quay về chỗ nhóm bạn.*
- **Hạ** *(vẫy tay)*: "[Tên người chơi] bấm xong nhớ chạy vô liền nha…"
- **Châu**: "Đứng đâu thì để [Tên người chơi] xếp."
- **Đức** *(tạo dáng chữ V)*: "Nhớ chừa chỗ giữa cho tao nha!"

#### Cảnh 4 · Xếp đội hình
*(Gợi ý góc màn hình: **Xếp chỗ đứng cho năm đứa**)*

*Máy quay hướng vào khung ngắm. Người chơi kéo thả sắp xếp chỗ đứng cho năm bạn (hoặc bấm Bỏ qua để dùng đội hình mặc định). Bốn bạn đi vào đúng vị trí đã xếp, quay mặt về máy ảnh; vòng sáng hiện lên ở chỗ đứng của người chơi.*

- **Đức** *(reo mừng)*: "Đứng đâu cũng được hết, miễn sao có đủ năm đứa!"

#### Cảnh 5 · Hẹn giờ chụp (10 giây)
*(Gợi ý góc màn hình: **Hẹn giờ rồi chạy vào vòng sáng** · Lời nhắc chụp: **Bấm hẹn giờ, chạy vào vòng sáng · Nút tạo dáng**)*

*Người chơi bấm hẹn giờ trên máy ảnh rồi chạy vào vòng sáng cùng các bạn.*
- **Đức** *(vẫy tay)*: "Có mười giây thôi, chạy lẹ [Tên người chơi]!"

*(Trong 10 giây đếm ngược và ngay sau khi ảnh hiện ra, lời thoại thay đổi theo kiểu ảnh đã chọn ở Cảnh 2:)*
- **Nếu chọn "Tạo dáng nhí nhố làm mặt hề":**
  - *(Lúc đếm ngược)* **Đức** *(tạo dáng chữ V)*: "Làm mặt hề hết nha tụi mày! Ba… hai…"
  - *(Chớp flash — xem ảnh — giữ ảnh)*
  - **Đức**: "Khoan đã! Tao còn chưa kịp làm mặt hề xong mà!"
  - **Châu**: "Trễ rồi, máy chụp xong rồi."
- **Nếu chọn "Đứng tự nhiên, khoác vai cười tươi":**
  - *(Lúc đếm ngược)* **Hạ**: "Cười tự nhiên nha, đừng nhìn máy cứng đơ đó."
  - *(Chớp flash — xem ảnh — giữ ảnh)*
  - **Châu**: "Kêu khoác vai mà mấy người đứng cách cả gang tay."
  - **Đức** *(reo mừng)*: "Kệ đi, nhìn mặt đứa nào cũng tươi rói kìa!"
- **Nếu chọn "Nghiêm trang chỉnh tề như ảnh thẻ":**
  - *(Lúc đếm ngược)* **Châu**: "Đứng ngay ngắn. Nhìn thẳng máy. Không ai được cười."
  - *(Chớp flash — xem ảnh — giữ ảnh)*
  - **Đức**: "Chụp xong nhìn nghiêm như ảnh thẻ dán hồ sơ luôn…"
  - **Quân**: "…Tớ thấy nhìn vầy cũng đẹp mà."

#### Cảnh 6 · Mưa rào, chạy về Căn cứ
*(Gợi ý góc màn hình: **Chạy theo Đức về Căn cứ**)*

*Trời bất ngờ đổ mưa rào. Đức chạy ngay tới ghế đá ôm lấy máy ảnh rồi dẫn cả nhóm chạy về mái che Căn cứ.*
- **Đức** *(vừa chạy)*: "Mưa rồi tụi mày ơi, tao cầm máy đây, chạy!"
- **Hạ** *(vừa chạy)*: "Về Căn cứ thôi mọi người! Lẹ lên!"
- *(Cả nhóm chạy qua cổng khu, chui vào dưới mái che Căn cứ.)*
- **Hạ** *(vẫy tay)*: "Vô đây, chỗ này còn khô."
- **Đức**: "Máy khô re nè, nãy tao ôm kỹ trong áo luôn."
- *(Đức đưa máy ảnh lại cho người chơi.)*
- **Đức**: "Mà vẫn thấy thiếu một tấm thật ngầu…"
- **Châu**: "Tấm hồi nãy đẹp rồi còn gì."
- *(Mưa nhỏ dần rồi tạnh hẳn.)*

#### Cảnh 7 · Ảnh cầu vồng ở khúc gỗ bãi đất *(ảnh bìa Album)*
*(Gợi ý góc màn hình: **Chụp ảnh với cầu vồng** · Lời nhắc chụp: **Cầu vồng còn đó. Bấm hẹn giờ · Lần này khỏi tạo dáng**)*

*Hạ đi ra khỏi mái che, ngước nhìn lên bầu trời sau mưa.*
- **Hạ** *(vẫy tay)*: "Mọi người nhìn lên trời kìa… Cầu vồng!"
- **Đức** *(reo mừng)*: "Ông trời thưởng vì tụi mình chụp đủ năm đứa đó!"
- **Châu**: "Hiện tượng tự nhiên thôi."
- *(Đức, Châu, Quân đi ra đứng cạnh Hạ.)*
- **[Tên người chơi]**: "Chụp thêm một tấm với cầu vồng nha!"
- **Hạ**: "Lần này khỏi tạo dáng, đứng cạnh nhau là được."

*Cả nhóm đi ra khúc gỗ ở bãi đất trống. Người chơi đặt máy lên khúc gỗ, bấm hẹn giờ rồi thong thả đi vào vòng sáng đứng cạnh bạn. Máy đếm yên lặng → chớp flash → tấm ảnh cầu vồng hiện ra.*
- **Quân**: "…Đẹp thiệt."
- **Đức** *(tạo dáng chữ V)*: "Tấm này về phải in ra to nhất mới đã!"

#### Cảnh 8 · Mấy hôm sau, dán ảnh trong Căn cứ
*Thẻ chữ hiện lên:*
> **Mấy hôm sau.**
> *Ảnh vừa in xong.*

*(Gợi ý góc màn hình: **Dán ảnh lên tường Căn cứ**)*

**Bối cảnh:** Cả nhóm tụ họp trong Căn cứ ngày nắng bình thường. Trên tường đã có ảnh bộ ba và ảnh năm chiếc thuyền. Người chơi cầm tấm ảnh cầu vồng mới in lại gần bức tường, bấm dán lên tường.

- **Đức** *(reo mừng)*: "Nhìn nè! Từ ba đứa thành năm đứa rồi!"
- **Châu**: "Ừ. Cũng không ngờ chơi với nhau lâu vậy."
- *(Quân đi tới tường, đứng cạnh người chơi.)*
- **Quân**: "Góc ảnh hơi bung kìa. Để tớ dán lại."
- **[Tên người chơi]**: "Mai mốt tụi mình chụp thêm nữa nha, đừng để thiếu ai."
- **Đức** *(tạo dáng chữ V)*: "Đứa nào vắng là phải chụp bù!"

*(Hết Trang 4 — Mờ màn hình chuyển về hiện tại.)*

---

### KẾT MỐC 1 · PHÒNG 2026 & TIN NHẮN GỬI NHÓM CŨ

**Bối cảnh:** Trở về phòng trọ năm 2026. Ngoài cửa sổ là bầu trời đêm yên tĩnh; đèn bàn tỏa ánh sáng ấm áp tối đa xuống mặt bàn. Trên bàn, bìa cuốn **Album** đã phục hồi trọn vẹn với tấm ảnh cầu vồng năm đứa. Bên cạnh là chiếc **Điện thoại**.

- **[Tên người chơi]** *(độc thoại)*: "Tấm ảnh cầu vồng nằm ngay bìa rồi… hồi đó tụi mình nói không để thiếu ai."
- **[Tên người chơi]** *(độc thoại)*: "Không biết giờ nhóm chat cũ còn mở không nữa…"

*(Gợi ý trên màn hình: **Mở điện thoại, tìm nhóm chat cũ**)*

*Người chơi đi tới bàn, bấm vào **Điện thoại**.*
- Màn hình ứng dụng nhắn tin *(tên app chờ chốt ở Phần 3)* mở vào nhóm **"Căn cứ Bí mật"**.
- Khung chat trống trơn, chỉ hiện dòng trạng thái mờ: *"tin cuối cùng đã từ rất lâu"*.

*(Gợi ý trên màn hình: **Soạn và gửi một tin nhắn cho nhóm bạn** → Người chơi chọn 1 trong 3 tin nhắn mở đầu để gửi:)*
1. *(Rộn ràng)* "Ê. Ván caro hồi lớp 8 vẫn đang 3–3 đó nha. Ai gỡ?" *(tỉ số tự điền theo ván chơi)*
2. *(Ấm áp)* "Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?"
3. *(Sâu lắng)* "Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha."

*Bấm gửi:*
> **Người dẫn chuyện:** "Đã gửi."
> **Người dẫn chuyện:** "(còn tiếp)"

*(Hoàn thành Mốc 1 → Hiện **Form phản hồi sau khi chơi** gồm 4 câu hỏi và 1 ô góp ý tự do — chờ chốt chữ ở Phần 3.)*

---

## Phần 3. Danh sách câu hỏi CHỦ DỰ ÁN CẦN CHỐT (để mở khóa `R-P1` và sửa thoại)

> *Chủ dự án chỉ cần trả lời gọn theo mẫu: **Số câu + Chữ cái** (ví dụ: `1A, 2B, 3A...`). Phương án **A** là đề xuất mặc định của nhóm biên kịch.*

### Nhóm I · 4 câu bắt buộc để gỡ chữ giả `[PLACEHOLDER]` cho bản Production (`R-P1`)

**1. Tên chính thức của chương Mốc 1** *(thay cho `[PLACEHOLDER] Mốc 1 · lớp 6–7` hiện tại)*:
- **A (đề xuất):** `Mốc 1 · Căn cứ đầu tiên (Lớp 6–7)` — nhấn vào nơi chốn chung gắn kết nhóm.
- **B:** `Mốc 1 · Những ngày lập nhóm (Lớp 6–7)` — nhấn vào hành trình từ 3 lên 5 bạn.
- **C:** `Mốc 1 · Đủ năm đứa (Lớp 6–7)` — đặt theo tên Trang kết thúc Mốc 1.

**2. Tên ứng dụng nhắn tin giả lập trong phòng 2026** *(thay cho `[PLACEHOLDER] Ứng dụng nhắn tin`)*:
- **A (đề xuất):** `AloNhau` — gọn, Việt hóa tự nhiên, gợi app chat quen thuộc.
- **B:** `NhắnTí` — nhẹ nhàng, thân mật đúng chất bạn cũ.
- **C:** `PingMe` — ngắn gọn, trung tính, dễ nhận diện.

**3. 6 món đồ nền trong thùng carton (vở cũ, khăn quàng đỏ, ảnh lớp phai, hộp bút sắt, cục gôm mòn, cây thước kẻ) + lời mở/lục Hộp Kỷ Vật ở phòng 2026:**
- **A (đề xuất):** **Duyệt bộ lời mới** đã viết sẵn ở Phần 2 (xóa chữ `[PLACEHOLDER]`, giữ 6 món đồ nền cho phòng 2026 sống động).
- **B:** **Chỉ giữ lời mở hộp**, tạm tắt bấm 6 món đồ nền trong bản đo 05/12 để người chơi tập trung đi thẳng vào 4 kỷ vật chính.
- **C:** **Tắt toàn bộ phần đồ nền** ở bản Production, chỉ hiện 4 kỷ vật chính dẫn vào Trang 1–4.

**4. 4 câu hỏi + ô góp ý ở Form phản hồi cuối Mốc 1** *(hiện đều đang gắn chữ `[PLACEHOLDER]`)*:
- *Nội dung hiện có:* (1) Bạn thấy hoài niệm thế nào? [1–5] · (2) Bạn muốn chơi tiếp phần sau đến mức nào? [1–5] · (3) Bạn thích Trang nào nhất? [Trang 1–4] · (4) Bạn sẽ giới thiệu game cho bạn bè chứ? [Có/Không] · (5) Ý kiến khác (tối đa 300 ký tự).
- **A (đề xuất):** **Giữ nguyên các câu hiện tại**, chỉ xóa bỏ chữ `[PLACEHOLDER]`.
- **B:** **Rút gọn còn 3 câu** (bỏ câu *"Bạn sẽ giới thiệu game cho bạn bè chứ?"* để người chơi đỡ ngại trả lời dài).
- **C:** **Giữ 4 câu nhưng đổi chữ thân mật hơn** (ví dụ: *"Chơi xong Mốc 1, bạn có thấy bồi hồi nhớ thời đi học không?"*).

---

### Nhóm II · Các câu hỏi còn mở từ Trang 1–4 & Chuyển cảnh Hub

**5. (Trang 1 · Câu Châu sửa mật lệnh):** Kịch bản gốc là 13 từ (*"Tui chỉ không muốn hai người làm mất thời gian cả lớp thôi."*), vượt 1 từ so với quy chuẩn tối đa 12 từ cho câu chuyển cảnh.
- **A (đề xuất):** Dùng bản rút còn **12 từ**: *"Tui không muốn hai người làm mất thời gian cả lớp thôi."* (bỏ chữ "chỉ", giữ nguyên ý và đạt chuẩn).
- **B:** Giữ nguyên văn 13 từ của kịch bản gốc, chấp nhận 1 ngoại lệ.

**6. (Trang 1 & Trang 2 · Kiểm tra từ lóng theo mốc năm 2014–2016):** Từ **"hư cấu"** (Đức nói ở Trang 1 *"Tấm này hư cấu quá!"* và Trang 2 *"Hư cấu! Thuyền cậu gắn động cơ hả?"*) và từ **"Chốt!"** (cuối Trang 1 *"Chốt! Sau này chụp đủ một bộ sưu tập luôn!"*):
- **A (đề xuất):** **Giữ nguyên** như kịch bản gốc (trào lưu *"hư cấu"* phổ biến từ cuối 2014–2015).
- **B:** **Thay cho thuần 2014 hơn:** đổi *"Tấm này hư cấu quá!"* → *"Tấm này dở ẹc!"*; đổi *"Hư cấu! Thuyền cậu…"* → *"Xạo quá! Thuyền cậu…"*; đổi *"Chốt!"* → *"Nhất trí!"*.

**7. (Chuyển cảnh Hub sau Trang 3 → sang Trang 4):** Sau khi nhìn gáy sổ luật trên kệ, hiện chưa có câu dẫn người chơi quay lại thùng tìm tấm ảnh cuối cùng.
- **A (đề xuất):** Thêm 1 câu tự nhủ nhẹ: *"Để quay lại thùng coi còn món nào nữa không — chắc vẫn còn ảnh tụi mình."* (kèm gợi ý góc màn hình).
- **B:** Không thêm câu thoại, chỉ hiện dòng gợi ý góc màn hình: *"Quay lại Hộp Kỷ Vật tìm kỷ vật cuối"*.

**8. (Trang 2 · Câu móc khi cầm chiếc thuyền giấy ở Phòng 2026):**
- **A (đề xuất):** Dùng câu đã chuốt nhẹ: *"Cánh buồm vẫn còn dòng chữ nhòe… hồi đó mình ước gì vậy ta?"*
- **B:** Giữ câu cũ: *"Trên buồm còn chữ… mình ước gì vậy ta?"*
- **C:** Tách làm 2 câu ngắn: *"Trên buồm còn chữ mà nhòe rồi…"* / *"Hồi đó mình ước gì vậy ta?"*

**9. (Trang 2 · Thao tác lúc Hạ đưa giấy viết điều ước):**
- **A (đề xuất):** Người chơi chỉ chọn điều ước để chữ hiện lên cánh buồm (chọn kiểu thuyền để ở lúc sắp thả).
- **B:** Thêm 1 nhịp bấm nút gấp buồm ngay sau khi chọn điều ước.
- **C:** Hiện chữ trực tiếp lên thuyền đã gấp sẵn trên tay.

**10. (Trang 2 · Mặt giấy ướt lúc ký tên lên thuyền của Hạ):**
- **A (đề xuất):** Giữ nguyên thoại cũ, đẩy thẳng vào cảnh viết và ký trên buồm.
- **B:** Thêm 1 câu ngắn của Hạ (*"Buồm còn hơi ướt mà vẫn viết được nè."*).
- **C:** Mô tả thuyền chỉ ướt phần đáy, cánh buồm còn khô ráo để ký.

**11. (Trang 2 · Tiếng trống vào lớp cuối giờ ra chơi nếu chưa kịp làm âm thanh thật):**
- **A (đề xuất):** Tạm hiện dòng chữ ngắn *"Tùng… tùng… tùng…"* trước khi Châu quay đi.
- **B:** Bỏ dòng báo tiếng trống, để Châu nói thêm *"Tới giờ vô lớp rồi!"* trước câu cuối.
- **C:** Để Châu quay đi nói thẳng câu cuối, bổ sung âm thanh tiếng trống ở bản cập nhật sau.

---

## Phần 4. Bàn giao các hoạt động & cảnh còn thiếu trong game
*(Viết bằng ngôn ngữ sản phẩm cho chủ dự án dễ hình dung — đối chiếu từ bản kiểm toán kỹ thuật & hiện trạng mới nhất của nhánh chính)*

### 4.1 Những gì ĐÃ LÀM XONG trong game (người chơi đã chơi được ngay)
1. **Đổi tên & định vị sản phẩm:** Toàn bộ giao diện, trang chủ, tài liệu đã đổi sang tên chính thức **"Vùng Ký Ức"**.
2. **Đủ khung chơi trọn 4 Trang Mốc 1 & Phòng 2026:** Người chơi đã có thể đi lại góc nhìn thứ nhất trong phòng trọ 2026, mở Hộp Kỷ Vật, bước qua 4 Trang ký ức, chơi trọn vẹn **8 trò chơi nhỏ** (giải mật lệnh, đá cầu, lau bảng, bóp mì, đua thuyền, dọn/kê bàn ghế, ghép 5 điều luật, xếp đội hình chụp ảnh), mở Album, xem lại nhóm chat cũ gửi tin nhắn kết và điền form phản hồi.
3. **Bản Production sạch nhiệm vụ phụ chưa duyệt:** Đã có bộ lọc tự động loại bỏ các nhiệm vụ phụ nháp khỏi bản chính thức để người chơi không chạm phải chữ chưa hoàn thiện.
4. **Dọn nền kỹ thuật & sửa lỗi hiển thị lớn (`RF-1`, `RF-2`, `RF-4`, `N-01b`):** Đã tách thoại trước/sau trò chơi nhỏ, dọn gọn bộ khung 8 minigame, vá lỗi mất đồ vật 3D khi qua Trang mới, bỏ lỗi hiện 2 cầu vồng chồng nhau ở Trang 4, và tách khung nhân vật để sẵn sàng bổ sung hành động/người mới.

---

### 4.2 Các hoạt động / cảnh / tính năng CÒN THIẾU

#### Nhóm A · BẮT BUỘC cho bản đo 05/12
| Hạng mục | Hiện đang thiếu gì? | Người chơi sẽ thấy gì sau khi làm xong? | Cần chủ dự án duyệt? |
|---|---|---|---|
| **1. Gỡ chữ giả & Đổ thoại mới (`R-P1` + `R-D1…D4`)** | Game hiện vẫn chạy lời thoại cũ còn thô; còn nhãn `[PLACEHOLDER]` ở tên chương Mốc 1, tên app nhắn tin, 6 đồ nền trong thùng, form phản hồi; chưa có thoại về phòng 2026 sau mỗi Trang; Trang 3 trong code vẫn đang xếp bước trang trí trước bước dọn bàn ghế. | Toàn bộ chữ hiển thị sạch sẽ, giàu cảm xúc và liền mạch từ đầu tới cuối; Trang 3 đi đúng thứ tự dọn bàn ghế rồi mới trang trí; ảnh chính Trang 2 & Trang 3 lấy từ chính bức ảnh người chơi tự bấm chụp. | **Có** — duyệt Phần 2 & chốt 11 câu ở Phần 3 |
| **2. Đạo diễn nhân vật đi lại & biểu cảm (`R-B1`)** | Nhân vật hiện đứng yên một chỗ suốt cảnh, chưa tự đi lại/chạy theo nhịp thoại, chưa giơ tay chữ V / vẫy tay / reo mừng khớp câu nói, chưa tự ẩn khi rời cảnh (Châu về trước cuối Trang 1), hay tự bước vào chỗ sau khi xếp đội hình Trang 4. | Các bạn sống động như phim: Đức chạy hớt hải nhặt vở, đi trước dẫn đường, Châu vẫy tay ở cửa lớp rồi đi khuất, cả nhóm tự di chuyển vào đúng vị trí đã xếp để chụp ảnh. | Không (làm theo bảng chỉ đạo đã chốt) |
| **3. Nhịp chuyển cảnh mượt, thẻ chữ & máy quay (`R-B2`)** | Thiếu màn **Thẻ chữ 2 dòng** (ví dụ *"Ngày đầu lớp 6"*, *"Mấy tháng sau…"*); thiếu bảng hướng dẫn phím tự tắt cho người mới; máy quay chuyển cảnh bị cắt cứng chưa tiến/lùi mượt; lộ tên *"Căn cứ bí mật"* ngay từ đầu Trang 3 trước khi Đức đặt tên; lời dẫn đường đang khóa chân không cho người chơi đi cùng; mưa Trang 4 phải ngắt màn hình mới đổi thời tiết được. | Người chơi đọc thẻ chuyển thời gian êm dịu, được hướng dẫn phím rõ lúc đầu, tự do chạy theo Đức trong lúc bạn vừa đi vừa nói, chỉ thấy tên *"Căn cứ bí mật"* sau khi dựng xong chỗ, và thấy trời đổ mưa rào tự nhiên giữa cảnh. | Không |
| **4. Chụp ảnh nâng cao, Đạo cụ cầm tay & Biến đổi 3D tại chỗ (`R-B3`, `R-B4`)** | Chụp tự sướng 3 lần Trang 1 chưa có lời nhắc riêng từng lần; Trang 4 chưa có thoại chen lúc đếm 10 giây và bình luận theo kiểu ảnh đã chọn; nhân vật chưa cầm/trao đồ trên tay (vở, quả cầu, thuyền giấy, sổ, bút đỏ, biển tên, máy ảnh chuyền tay); Trang 3 chưa hiện ngay đồ trang trí lúc vừa chọn và chưa hiện câu phản ứng + bộ đếm `0/3` khi xem từng góc sân sau. | Cảm giác tương tác vật lý thật: thấy vở rơi, Đức cầm máy ảnh chạy tránh mưa, giấy màu/hoa/khung ảnh hiện lên tức thì ngay khi vừa chọn, và mỗi lần chụp ảnh đều có lời bình luận khớp đúng lựa chọn của mình. | Không |
| **5. Sửa vị trí bản đồ & Tách module điều phối (`MAP-1`, `MAP-2`, `RF-3`)** | Chỗ chụp ảnh Trang 4 hiện còn đặt giữa sân thay vì dưới gốc phượng và khúc gỗ bãi đất; thiếu vài điểm đứng ở bảng phân lớp, bụi cây đá cầu, cuối rãnh nước (thuyền Hạ mắc lại), tường dán ảnh Căn cứ. Trong code còn chờ gộp bước tách bộ điều phối chính (`RF-3`) để nhiều người cùng làm các phần trên mà không đụng nhau. | Góc chụp Trang 4 đứng đúng dưới tán phượng và nhìn ra cầu vồng ở bãi đất; thuyền giấy của Hạ mắc lại rõ ràng ở cuối rãnh để người chơi đi tới vớt lên ký tên. | Không |

#### Nhóm B · CÓ THÌ TỐT HƠN (tối ưu trải nghiệm & làm tiếp cho Mốc 2 / sau 05/12)
| Hạng mục | Hiện đang thiếu gì? | Người chơi sẽ thấy gì sau khi làm xong? | Cần chủ dự án duyệt? |
|---|---|---|---|
| **1. Âm thanh đời thường (`SFX-1`)** | Hiện mới có tiếng chuyển cảnh cơ bản; thiếu tiếng vở rơi "bịch", trống trường, tiếng bấm máy ảnh "tách", tiếng tick khi khảo sát, tiếng mưa nhẹ. | Tăng chiều sâu không khí học đường 2014–2016 rõ rệt (nếu chưa kịp cho bản 05/12 có thể dùng chữ/hiệu ứng hình tạm). | Không (chỉ chốt Câu hỏi 11 cho tiếng trống tạm) |
| **2. Nhân vật phụ & Đo lường dữ liệu (`N-12`, `N-18`)** | Thiếu cô giáo, bác bảo vệ, chú tạp hóa, học sinh nền đi lại cho trường học có sức sống; còn vài sự kiện đo lường hành vi người chơi trên bản thử nghiệm chưa gửi đủ. | Sân trường, lớp học và tiệm tạp hóa có thầy cô, người bán hàng; đội ngũ thu thập đủ dữ liệu đo lường trong đợt test 05/12. | Không |
| **3. Hoạt ảnh nâng cao & Tính năng mở rộng (sau 15/12)** | Động tác ngồi ghế/hiên, cúi đặt/vớt thuyền, ôm thùng, treo biển; hiệu ứng chữ hiện từng nét trên cánh buồm; phím chụp ảnh tự do; nhiệm vụ phụ *"Bắn bi mắt mèo cùng Quân"* ở Trang 3 và toàn bộ Mốc 2 (Trang 5–9). | Tăng độ trau chuốt hoạt ảnh nhân vật và mở rộng thêm phần chơi tự do, cốt truyện lớp 8–9 ở Mốc 2. | Chốt sau khi xong Mốc 1 |

---

### 4.3 Thứ tự thực hiện đề xuất ngay sau khi gộp `RF-3`
1. **Gộp xong nhánh `RF-3`** (tách gọn phần điều phối game) vào nhánh phát triển chính để mở khóa làm việc song song an toàn.
2. **Chủ dự án đọc duyệt Phần 2 & chốt 11 câu hỏi ở Phần 3** của tài liệu này.
3. **Làm `R-P1` + `R-D`:** Gỡ sạch 100% chữ giả `[PLACEHOLDER]`, sửa vị trí điểm đứng trên bản đồ sân trường, đổi thứ tự Trang 3 và đổ toàn bộ chữ thoại đã duyệt (Hub 2026 + Trang 1–4) vào game.
4. **Làm song song `R-B1`, `R-B2`, `R-B3`, `R-B4` (+ âm thanh cơ bản):** Nâng cấp đạo diễn nhân vật, thẻ chữ/chuyển cảnh mượt, chụp ảnh/đạo cụ cầm tay và phản ứng 3D tại chỗ.
5. **Kiểm thử trọn vòng Mốc 1** từ Phòng 2026 → Trang 1–4 → Kết Mốc 1 & Form phản hồi để chốt bản đo **05/12**.
