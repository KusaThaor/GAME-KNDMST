# 02_GAMEPLAY_AND_MECHANICS — Minigame, Khu Vui Chơi Căn Cứ, lưu trữ và số liệu đo

| Trường | Giá trị |
|---|---|
| Phiên bản | **v1.1-draft** (nền v1.0 APPROVED 20/11) |
| Ngày cập nhật | 21/11/2026 (UTC+7) |
| Trạng thái | **v1.0 APPROVED 20/11; v1.1-draft thêm §2.5 (Hòm thư Valentine, chỉ đạo 21/11) — phần thêm chờ chủ dự án duyệt lại** (các mục khác vẫn APPROVED). Chủ dự án duyệt ngày 20/11/2026. Mục ghi PROPOSED trong file là thiết kế đã duyệt để dựng; con số là giá trị khởi điểm, chỉnh khi chơi thử không cần xin duyệt lại. Mục ghi "Còn mở" vẫn chờ chốt |
| File liên quan | `00_MASTER_GDD.md` (vòng chơi, bản đồ) · `01_NARRATIVE_AND_SCENES.md` (kịch bản 9 Trang) · `03_ASSETS_AND_AUDIO.md` (asset, âm thanh) |
| Nguồn | Quyết định chủ dự án 20/11 (minigame chơi thật; Khu Vui Chơi ở Căn cứ; lưu trữ), `GDD.md` v0.3 §3, §5, §7, §11, §13, review kịch bản 19/11 (6 kiểu tương tác K1–K6), `07_ANALYTICS_REQUIREMENTS` |

## 0. Quyết định gốc của file này
| # | Quyết định | Trạng thái |
|---|---|---|
| 1 | Game không chỉ đi lại và đọc thoại: người chơi **chơi thật** các minigame có luật, điều kiện thắng/thua và chơi lại rõ ràng | CONFIRMED 20/11 |
| 2 | Caro 2D chơi thật với AI ở Trang 5; thắng hay thua đều dẫn tiếp vào cảnh bác bảo vệ | CONFIRMED 20/11 |
| 3 | Có minigame Sudoku 2D trên giấy tập học trò (6×6 và 9×9, tối đa 3 gợi ý, chấm theo thời gian), đặt ở **Trang 7 cảnh A** | CONFIRMED 20/11 |
| 4 | Lật chai ở Z03 (xe quà vặt), cơ chế kéo – thả có tính góc, lực, trọng tâm chai vơi 1/3, ma sát; có chụp khoảnh khắc chai đứng | CONFIRMED 20/11 |
| 5 | Căn cứ bí mật (Z05) thành **Khu Vui Chơi Tuổi Thơ**: chọn 1 trong 4 bạn làm đối thủ = chọn độ khó; Ô ăn quan, Nhảy lò cò, Bắn bi ve | CONFIRMED 20/11 |
| 6 | Lưu tiến trình, ảnh, bảng thắng/thua **trên máy người chơi** (localStorage + IndexedDB); Firebase **chỉ** cho số liệu ẩn danh và form phản hồi | CONFIRMED 20/11 (khớp quyết định 13/11) |
| 7 | Luật mặc định của Caro, Sudoku, Ô ăn quan, Lò cò, Bi ve giữ như file này; mọi quy tắc được giải thích bằng màn hướng dẫn ngay trong game | CONFIRMED 20/11 |
| 8 | **Hòm thư Valentine** là sự kiện **Main** của Trang 6, nghĩa mới theo bản sửa của nhóm; luật ở §2.5 | **CONFIRMED 21/11** (chỉ đạo chủ dự án); luật chi tiết PROPOSED |

**Thay đổi so với nguyên tắc cũ:** nguyên tắc "không có thua" (13/11) đổi thành **"minigame có thắng/thua, nhưng thua không bao giờ chặn câu chuyện"**. Phần "không có thua" cũ: SUPERSEDED.

---

## 1. Khung chung cho mọi minigame

### 1.1 Vòng đời một ván
~~~
Giới thiệu luật (1 màn, bỏ qua được từ lần 2) → Chơi → Kết quả (Thắng / Thua / Hòa / Hoàn thành)
   → [Chơi lại]  hoặc  [Tiếp tục]
~~~
| Quy tắc | Chi tiết |
|---|---|
| Thua không chặn truyện | Minigame trong cốt truyện: thắng hay thua đều đi tiếp; chỉ đổi 1–2 câu thoại và ảnh/ghi chú trên Album |
| Chơi lại | Luôn có nút "Chơi lại" (trừ khi kịch bản đã đi tiếp). Kết quả **lần đầu** là kết quả dùng cho thoại; lần chơi lại chỉ cập nhật bảng thành tích |
| Bỏ ván | Esc → "Bỏ ván": tính là **thua**, đi tiếp như thua |
| Hướng dẫn | Mỗi trò có 1 màn luật bằng hình + tối đa 3 dòng chữ; có nút "?" trong lúc chơi |
| Điều khiển | Chỉ chuột + bàn phím. "Vuốt" = **giữ chuột trái, kéo, thả** |
| Giao diện | Minigame bàn cờ/giấy (Caro, Sudoku, Ô ăn quan) là **lớp 2D phủ lên cảnh 3D**; minigame vận động (Lật chai, Lò cò, Bi ve) dùng **camera cố định riêng trong cảnh 3D** |
| Tạm dừng | Esc mở menu; đồng hồ tính giờ dừng lại |
| Lưu | Lưu ngay khi có kết quả (§4) |
| Số liệu đo | Mỗi ván gửi 1 event bắt đầu + 1 event kết quả (§5) |

### 1.2 Ba nhóm minigame
| Nhóm | Ở đâu | Bắt buộc? |
|---|---|---|
| **A. Minigame cốt truyện** | Nằm trong các bước Main của 9 Trang | Có (là một bước của Trang); thua vẫn đi tiếp |
| **A'. Minigame cốt truyện tùy chọn** | Lật chai | Không (Side); không chặn Main |
| **B. Khu Vui Chơi Căn Cứ** | Z05, chơi tự do | Không |

---

## 2. Nhóm A — Minigame theo mạch cốt truyện

### 2.1 Cờ Caro (Trang 5 · trực nhật lớp 8)
**Bối cảnh:** bảng vừa lau sạch, Đức kẻ ô bằng mẩu phấn cuối. Thay bước "chọn ô 2 lần" ở kịch bản v1.4.

| Hạng mục | Đặc tả |
|---|---|
| Hiển thị | Lớp 2D phủ lên bảng đen: nền bảng xanh đen, nét phấn trắng, quân **X** (người chơi) và **O** (đối thủ) vẽ tay bằng phấn |
| Bàn cờ | Mặc định **12×12** (vừa khung bảng, ván ngắn hơn); có cấu hình **15×15** (CONFIRMED 20/11) |
| Chọn đối thủ | Trước ván: chọn đánh với **Đức** hoặc **Quân**; người còn lại đứng "phe" người chơi và nhắc nước |
| Đi trước | Người chơi (X) đi trước |
| Thắng | Có **5 quân liên tiếp** (ngang, dọc, chéo). Từ 6 quân trở lên vẫn tính thắng |
| Luật chặn hai đầu | **Tùy chỉnh** bật/tắt. Mặc định **tắt** (5 quân bị chặn hai đầu vẫn thắng) cho dễ chơi; bật = 5 quân bị chặn cả hai đầu không tính |
| Hòa | Kín bàn mà không ai thắng |
| Thua | Đối thủ có 5 quân liên tiếp, hoặc người chơi bấm "Bỏ ván" |
| Thời gian | Không giới hạn mỗi nước. Đối thủ "suy nghĩ" 0,4–1,0 giây cho tự nhiên |
| Điều khiển | Click vào ô trống; rê chuột hiện bóng mờ quân X; không cho đi lại nước |
| Sau ván | Hiện dòng kết quả → **luôn** vào bước 3 "Bác bảo vệ tới" |

**Độ khó AI** *(PROPOSED)*
| Đối thủ | Độ khó | Cách đánh (để dev dựng) |
|---|---|---|
| **Đức** | Dễ | Thích tấn công; tính 1 nước; 25% số nước bỏ qua việc chặn hàng 3 mở của người chơi; không bao giờ bỏ qua việc chặn hàng 4 |
| **Quân** | Khó | Phòng thủ chắc; tính 2 nước (nước mình + nước đáp); luôn chặn hàng 3 mở và hàng 4; ưu tiên tạo hai đường đe dọa cùng lúc |

Cách chấm điểm ô cho AI: cộng điểm theo các mẫu quân quanh ô (4 mở, 4 bị chặn, 3 mở, 3 bị chặn, 2 mở…), lấy cả điểm tấn công và phòng thủ. Bảng điểm mẫu để trong file cấu hình.

**Thoại theo kết quả** *(PROPOSED — người giữ giọng nhân vật sửa)*
| Kết quả | Đối thủ Đức | Đối thủ Quân |
|---|---|---|
| Người chơi thắng | **Đức:** "Ván này không tính! Bảng nghiêng!" | **Quân:** "…Cậu đánh giỏi ghê." |
| Người chơi thua | **Đức:** "Thấy chưa, tao là trùm caro của lớp này!" | **Quân:** "Tớ ăn may thôi." |
| Hòa | **Châu:** "Hòa. Vậy là ai cũng phải lau." | (như bên trái) |
Sau câu này, bác bảo vệ tới như kịch bản; Châu vẫn nói "Ghi tỉ số lại, mai đánh tiếp."

**Tỉ số loạt ván (CONFIRMED 20/11)** — nắp hộp phấn KV-01 ghi tỉ số **cả loạt ván** giữa **phe Quân** và **phe Đức**, chạy tới 5 ván thắng nên luôn "(CHƯA XONG)". Trước ván của người chơi: **3–3**.
| Người chơi đánh với | Người chơi đứng phe | Thắng | Thua | Hòa |
|---|---|---|---|---|
| Đức | Quân | QUÂN 4 – ĐỨC 3 | QUÂN 3 – ĐỨC 4 | QUÂN 3 – ĐỨC 3 |
| Quân | Đức | QUÂN 3 – ĐỨC 4 | QUÂN 4 – ĐỨC 3 | QUÂN 3 – ĐỨC 3 |
- Lưu vào `minigames.caro.series` = `{ quan, duc }` theo kết quả **lần đầu**; chơi lại không đổi tỉ số.
- Nắp hộp phấn: "QUÂN {quan} – ĐỨC {duc} (CHƯA XONG)". Ở cảnh chuyển Mốc (trước khi chơi Trang 5) hai con số còn nhòe; chơi xong Trang 5 mới hiện (`01`, Chuyển Mốc).
- Tin nhắn kết demo (sắc thái Rộn ràng): "Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?"

### 2.2 Sudoku (giấy tập học trò)
| Hạng mục | Đặc tả |
|---|---|
| Hiển thị | Lớp 2D: trang giấy tập kẻ ô li, số in sẵn bằng bút bi xanh, số người chơi điền bằng bút chì |
| Cỡ lưới | **6×6** (khối 2×3, chế độ dễ) và **9×9** (khối 3×3, chuẩn) |
| Đề | Sinh sẵn một bộ đề có **duy nhất một lời giải**, chia mức Dễ (6×6) / Vừa (9×9, 36–40 số cho sẵn) / Khó (9×9, 28–32 số cho sẵn). Lưu đề trong file nội dung, không sinh lúc chạy |
| Điều khiển | Click chọn ô → bấm phím số hoặc click bảng số. Phím Del/Backspace xóa. Bật/tắt "ghi chú nháp" bằng phím N |
| Báo sai | Mặc định **không** tô đỏ ngay. Có tùy chọn "Báo trùng" chỉ tô đỏ khi trùng số trong hàng/cột/khối |
| Gợi ý | Tối đa **3 lần**: điền đúng một ô người chơi đang chọn (hoặc ô dễ nhất nếu chưa chọn). Mỗi gợi ý cộng 30 giây vào thời gian |
| Thắng | Điền đủ, đúng hết |
| Thua | Không có thua do sai. Hết giờ trong chế độ đua (§2.2.1) = thua lượt đố |
| Chấm điểm | Thời gian + số gợi ý → **3/2/1 sao**. Mốc 9×9 Vừa: ≤ 8 phút 3 sao · ≤ 15 phút 2 sao · còn lại 1 sao. 6×6: ≤ 2 / 4 phút |
| Bỏ ngang | "Bỏ ván" = thua, đi tiếp |

#### 2.2.1 Cách đưa vào câu chuyện
**CONFIRMED 20/11 — Trang 7 cảnh A** (sau khi nộp phiếu nguyện vọng): Châu phát "đề ôn tập" là một ô Sudoku 9×9 mức Vừa. Người chơi thi với đồng hồ của Châu (Châu "giải mất 6 phút"). Giải nhanh hơn 6 phút = **thắng**; chậm hơn hoặc bỏ = **thua**, người thua đi mua nước cho cả nhóm. Thoại theo kết quả do người giữ giọng Châu viết. Không đặt Sudoku ở Trang 5.
- Lưới 6×6: là **chế độ dễ** người chơi tự chọn ở màn bắt đầu ("Châu cho đề dễ hơn"). Kết quả vẫn tính, nhưng mốc thắng là 2 phút.
- Chơi lại ngoài truyện: đề Sudoku đã gặp có thể mở lại ở Khu Vui Chơi Căn Cứ (mục "Sổ đố của Châu") — *PROPOSED, Tầng C*.

### 2.3 Lật chai nước (Z03 · xe quà vặt) — Side, tùy chọn
**Bối cảnh:** Trang 5 cảnh A, Đức đang lật chai ở xe quà vặt cổng trường: "Chai này đứng được năm lần liền, ghê chưa?". Từ Trang 5 trở đi, chai ở xe quà vặt luôn chơi lại được khi đi tự do.

**Điều khiển — kéo và thả**
1. Camera cố định nhìn ngang mặt bàn nhựa của xe quà vặt; chai đứng ở mép gần.
2. **Giữ chuột trái lên thân chai → kéo chuột → thả.**
   - Hướng kéo (góc so với phương thẳng đứng) → **góc ném**.
   - Quãng kéo trong 0,15–0,6 giây cuối trước khi thả → **lực ném** (kéo nhanh = mạnh).
   - Độ cong của đường kéo (kéo hơi vòng về phía trước) → **lực xoay** của chai.
3. Trong lúc kéo hiện một đường cong dự đoán mờ, **chỉ ở chế độ Dễ**.

**Mô hình vật lý** *(PROPOSED — tự viết, không dùng engine vật lý; chai bay trong mặt phẳng đứng)*
| Thông số | Giá trị khởi điểm | Ghi chú |
|---|---|---|
| Chai | Cao 0,22 m, rỗng nặng 0,02 kg, đầy 0,5 L | Chai nhựa nước suối cỡ nhỏ |
| Mức nước | **1/3 chai** (≈ 0,17 kg nước) | Có thể chỉnh 1/4 – 1/2 ở chế độ tự do |
| Trọng tâm | Tính từ vỏ chai + khối nước; nước nằm ở đáy khi đứng yên | Trọng tâm thấp giúp chai dễ đứng |
| Nước lắc | Mô phỏng nước như **một khối trượt dọc thân chai**, nối lò xo có giảm chấn. Khi chai xoay, khối nước bị văng ra đầu chai → chai **chậm xoay lại giữa không trung** | Đây là "bí quyết" của lật chai; **không** mô phỏng chất lỏng thật |
| Trọng lực | 9,8 m/s² | — |
| Ma sát mặt bàn | Hệ số 0,5 (bàn nhựa); 0,7 nếu sau này có mặt bàn gỗ | Quyết định chai trượt bao xa khi chạm bàn |
| Nảy | Hệ số nảy 0,15 | Chai chạm bàn hơi nảy |
| Đứng đáy thành công | Lúc chạm bàn: chai nghiêng ≤ **12°**, tốc độ xoay ≤ **3 rad/s** (khoảng nửa vòng mỗi giây), tốc độ ngang ≤ **0,4 m/s**; sau 0,5 giây vẫn đứng | Các ngưỡng nằm trong file cấu hình |
| Đứng nắp thành công | Như trên nhưng nghiêng ≤ **6°** | Khó hơn hẳn |
| Thất bại | Ngã, lăn khỏi bàn, hoặc trượt ra mép bàn | — |

**Luật một lượt chơi "Thử thách của Đức"**
| Hạng mục | Đặc tả |
|---|---|
| Số lần ném | 5 |
| Điểm | Đứng đáy 1 điểm · đứng nắp 3 điểm · ngã 0 |
| Thắng | Đạt **≥ 3 điểm** ("ngang ngửa Đức") |
| Thua | < 3 điểm. Đức: "Tập thêm đi rồi tính!" |
| Chơi lại | Không giới hạn |
| Độ khó | Dễ: có đường dự đoán, ngưỡng nghiêng 15°/8° · Thường: như bảng trên |

**Chụp khoảnh khắc (Snapshot)**
- Khi chai **đứng thành công**: game tự quay chậm 0,5 giây và chụp một ảnh từ camera của trò chơi.
- Ảnh vào **Album phụ của Trang 5** (ô `free_photo`). Mỗi lần chơi giữ ảnh đẹp nhất; người chơi có thể chọn lại ảnh hiển thị (tối đa 3 ảnh lưu).
- Đứng nắp lần đầu → thêm sticker "Đứng bằng nắp!".

> Ghi chú chi phí: đề xuất ngày 19/11 là "giữ – thả vào vùng xanh, không mô phỏng nước" để tiết kiệm công. Chủ dự án đã chọn mô hình vật lý đơn giản như trên. Mô hình chỉ có 1 vật xoay trong mặt phẳng + 1 khối nước trượt, nên vẫn tự viết được, không cần thêm thư viện vật lý.

### 2.4 Các minigame tương tác khác trong cốt truyện
Mọi trò dưới đây là các kiểu K1–K6 (`00` §3.3), nay có luật thắng/thua hoặc chấm sao. Thua hay sao thấp đều đi tiếp.

#### 2.4.1 Đá cầu (Trang 1 · K5 canh nhịp)
| Hạng mục | Đặc tả |
|---|---|
| Cách chơi | Quả cầu bay tới theo đường vòng cung; quanh điểm rơi có một **vòng thu nhỏ dần**. Bấm Space hoặc click khi vòng trùng vòng đích |
| Cửa sổ thời gian | **Hoàn hảo** ±80 ms · **Được** ±160 ms · ngoài khoảng đó = **Hụt** |
| Lượt | Chuyền qua lại với Đức (và Châu nếu Châu đã xuống sân). Nhịp nhanh dần: khoảng cách giữa hai lượt từ 1,4 giây giảm còn 0,9 giây |
| Thắng | **10 lượt chuyền liên tiếp** không hụt |
| Thua | Hụt 3 lần |
| Kết thúc theo kịch bản | Dù thắng hay thua, lượt cuối Đức đá hụt, cầu bay vào bụi cây (thoại "Chiến thuật đánh lạc hướng thôi!"). Thắng: Châu thêm "Người ta chuyền mười lần, ông làm hư lần mười một." *(PROPOSED)* |

#### 2.4.2 Gấp và đua thuyền giấy (Trang 2 · K5 + lái)
| Giai đoạn | Đặc tả |
|---|---|
| Gấp thuyền | Chọn 1 trong 3 kiểu gấp; mỗi kiểu khác chỉ số: **Thuyền buồm** (nhanh, dễ lật) · **Thuyền mui** (chậm, chắc) · **Thuyền đôi** (cân bằng) |
| Thả | Giữ chuột nạp **thanh lực** (chạy lên xuống, chu kỳ 1,2 giây); thả trong **vùng xanh** (giữa thanh, rộng 25%) = xuất phát tốt; vùng vàng = chậm; vùng đỏ = thuyền nghiêng ngay |
| Đua | Rãnh nước dài khoảng 12 m, chạy 25–35 giây. A/D hoặc kéo chuột trái/phải để **lái tránh**: **rác** (lá, vỏ kẹo, que kem) = chậm 1 giây; **xoáy nước** ở 2 chỗ = thuyền quay vòng, mất 1,5 giây |
| Lật | Va chạm 3 lần → thuyền lật = **thua** |
| Thắng | Thuyền **về đích không lật** |
| Thứ hạng | Thuyền người chơi xếp hạng 2–5 theo thời gian. **Quân luôn nhất, thuyền Đức luôn lật ngay khi thả** (giữ thoại kịch bản) |
| Ảnh | Bước chụp năm chiếc thuyền **ngay lúc vừa thả** vẫn giữ (K2) |

> **CONFIRMED 20/11:** Quân luôn về nhất để giữ câu "Thuyền tớ… hình như xa nhất"; người chơi thắng khi thuyền về đích không lật.

#### 2.4.3 Bóp mì gói (Trang 1 cảnh B · K6)
| Hạng mục | Đặc tả |
|---|---|
| Cách chơi | Giữ chuột trái trên gói mì và **lắc chuột qua lại**; thanh "vụn" đầy theo quãng đường chuột di chuyển. Sau đó kéo gói gia vị thả vào bịch; giữ chuột lắc bịch tới khi thanh "đều vị" đầy |
| Hoàn thành | Hai thanh đầy |
| Chấm sao | ≤ 6 giây: 3 sao · ≤ 10 giây: 2 sao · còn lại 1 sao |
| Thua | Không có |

#### 2.4.4 Lau bảng (Trang 1, Trang 5) · Tô cờ (Trang 8) — K6 giữ và di chuột
| Hạng mục | Đặc tả |
|---|---|
| Cách chơi | Giữ chuột trái, di chuột trên vùng làm việc. Giẻ/sáp xóa hoặc tô theo **bán kính cọ** |
| Bán kính cọ | Lau bảng lần 1: 8% chiều rộng vùng · lau lần 2 ở Trang 5: 12% (nhanh hơn, đúng kịch bản) · tô cờ: 6% |
| Hoàn thành | Phủ **≥ 90%** diện tích |
| Chấm sao | Lau bảng: ≤ 10 / 16 giây · Tô cờ: ≤ 15 / 25 giây |
| Chi tiết riêng | Tô cờ: ngôi sao vàng ở giữa phải tô đủ ≥ 90% riêng; tô lem ra ngoài sao không trừ điểm |
| Thua | Không có |

#### 2.4.5 Chụp ảnh (mọi Trang · K2)
| Chế độ | Cách chơi |
|---|---|
| **Cầm tay** | Bấm C hoặc theo bước Main: nhìn qua khung ngắm, xoay bằng chuột, cuộn để phóng to/thu nhỏ trong giới hạn, click để chụp |
| **Hẹn giờ** | Đặt máy ở điểm cố định → chỉnh khung → bấm hẹn giờ (**10 giây** mặc định; Trang 9 kịch bản ghi 10 giây) → điều khiển nhân vật chạy vào **vòng sáng** trong khung → khi đồng hồ còn 2 giây, bấm phím **1/2/3** để chọn tạo dáng |

**Ba điều kiện kiểm tra sau mỗi ảnh** (hiện 3 dấu tích, không hiện điểm số — theo D-12)
| Dấu | Điều kiện đạt |
|---|---|
| **Đủ người** | Mọi nhân vật bắt buộc của ảnh đó có điểm đầu và thân trong khung, và mỗi người hiện ra ≥ 60% (không bị che quá nhiều) |
| **Trong khung** | Toàn bộ điểm đầu của các nhân vật bắt buộc nằm trong **vùng an toàn** = 90% giữa khung |
| **Kịp tạo dáng** | Ảnh hẹn giờ: nhân vật người chơi đã vào tư thế tạo dáng lúc màn trập bấm. Ảnh cầm tay: đạt nếu không ai đang đi/chạy |

| Kết quả | Xử lý |
|---|---|
| Đủ 3 dấu | Ảnh có viền "Đủ năm đứa" (chỉ trang trí) |
| Thiếu dấu | Nút "Chụp lại" nổi bật; "Giữ ảnh này" **vẫn bấm được** |
| Hoàn thành bước | Bấm "Giữ ảnh này". Chất lượng ảnh không chặn truyện |
| Ảnh lưu | JPEG khoảng 1024×768, lưu trong IndexedDB; tối đa 3 phiên bản cho ô ảnh chính |

#### 2.4.6 Các trò ngắn còn lại
| Trò | Trang | Kiểu | Luật tóm tắt | Thắng / hoàn thành | Thua |
|---|---|---|---|---|---|
| Giải mật lệnh | 1 | K4 | Nối 6 ký hiệu với 6 chữ cái | Nối đúng cả 6 | Không có; nối sai thì Châu gạch bút đỏ và gợi ý |
| Dựng Căn cứ | 3 | K3 | Đặt 6 món vào 6 chỗ đánh dấu; chọn kiểu trang trí | Đặt đủ | Không có |
| Viết luật Căn cứ | 3 | K4 | Ghép mảnh câu thành 5 quy tắc | Đủ 5 | Không có |
| Xếp đội hình | 4 | K3 | Kéo 5 người vào 5 chỗ đứng trong khung | Đủ người, không che nhau | Không có |
| Dán báo tường | 7 | K3 | Đặt 4 phần + 3 ảnh vào khung | Đủ | Không có |
| Xếp ghế xem bóng đá | 8 | K3 | Xếp 5 ghế nhựa sát nhau | Đủ (chỗ còn lại luôn cho Đức và Châu cạnh nhau) | Không có |
| Cổ vũ theo trống | 8 | K5 | 16 nhịp trống; bấm Space đúng nhịp, cửa sổ như đá cầu | ≥ 60% nhịp Được trở lên = "cả tiệm hò theo" | < 60%: vẫn đi tiếp, đổi một câu thoại |
| Ký áo, lưu bút | 9 | K3/K1 | Chọn chỗ ký, chọn câu đáp | Đủ 4 bạn | Không có |
| Ấn dấu tay vào ô A5 | 9 | K3 | Kéo 5 dấu tay màu vào ô | Đủ 5 | Không có |
| Làm hòm thư Valentine | 6 | K3 | 5 bước: màu nền · dán 3 mặt · trang trí · khe + ngăn chung + nắp · bảng nội quy (`§2.5.1`) | Đủ 5 bước | Không có |
| Viết thư Valentine | 6 | K1/K3 | Chọn người nhận → chọn nội dung → bỏ vào khe (`§2.5.2`) | Bỏ thư vào hòm | Không có |
| Nhánh buổi chiều Valentine | 6 | K3/K5/K2 | Theo thư đã gửi; Tầng A rút gọn, Tầng B đầy đủ (`§2.5.3`) | Xem `§2.5.3` | Không có |

### 2.5 Hòm thư Valentine (Trang 6 · Main) *(CONFIRMED 21/11: Main, nghĩa mới; luật chi tiết PROPOSED)*
Hòm thư tình bạn của năm đứa ở Căn cứ (Z05). Lời thoại nằm ở kịch bản `scripts/KICH_BAN_DEMO_M1_M2_v1.md` (Trang 6, Cảnh A và D); `01` Trang 6 tóm theo bước. Mục này chỉ ghi **luật chơi**, tách **Tầng A** (bắt buộc, nằm trên đường chơi) và **Tầng B** (nâng cấp nếu còn thời gian) theo thang của `00` §4.

**Nguyên tắc chung:** không có trạng thái thất bại; không có lựa chọn "sai"; mọi nhánh hợp lệ đều có đường đi tiếp; lời thư, phản ứng và câu chốt đều **chọn từ danh sách cố định** (không nhập chữ tự do — không có dữ liệu cá nhân trong lưu và số liệu đo).

#### 2.5.1 Làm hòm thư (Trang 6 Cảnh A · K3 · Main · Tầng A)
| Bước | Người chơi làm | Điều kiện xong | Ghi chú |
|---|---|---|---|
| 1 · Màu nền | Chọn 1 trong vài màu giấy | Đã chọn | Màu lưu vào `boxStyle` |
| 2 · Dán giấy | Kéo giấy phủ **3 mặt** hộp | Đủ 3 mặt | Dán lệch thì bóc ra dán lại |
| 3 · Trang trí | Kéo trái tim, ngôi sao, họa tiết tự vẽ lên hộp | Đặt ≥ 1 món | Họa tiết lưu vào `boxStyle` |
| 4 · Khe + ngăn chung + nắp | Gắn khe bỏ thư, **ngăn chung** của Hạ, kiểm tra nắp (Quân gia cố đáy) | Đủ 3 món | Quân/Hạ nhắc nếu quên |
| 5 · Bảng nội quy | Chọn kiểu bảng; **gắn đủ 3 điều**: không tự ý lấy thư · không đọc thư riêng trước đám đông · thư gửi cả nhóm thì đọc chung | Đã gắn bảng | **[CẦN CHỐT #6]** — bản sửa của nhóm chỉ nói "chọn bảng nội quy", không có phương án khác nhau về nội dung |
- Thiếu vật liệu thì Đức/Châu nhắc món còn thiếu (cùng cơ chế gợi ý ở Dựng Căn cứ). **Xong** khi 5 bước đã làm → hòm thư đặt vào Căn cứ → cảnh kết thúc. Hòm thư **ở lại Căn cứ** tới hết Trang 9.

#### 2.5.2 Viết thư và quy tắc nhánh (Trang 6 Cảnh D bước 1 · Main · Tầng A)
- **Người nhận:** Đức / Châu / Quân / Hạ / **cả nhóm**.
- **Gửi riêng một bạn:** chọn 1 trong 3 loại — **cảm ơn · trêu chọc · rủ làm việc chung**. Mỗi bạn có 3 lời thư viết sẵn (xưng hô theo `01` §2.3).
- **Gửi cả nhóm:** chọn 1 trong 4 câu viết sẵn, hoặc **vẽ một bức tranh nhỏ về cả nhóm** (kéo thả hình có sẵn: năm nhân vật, trái tim, ngôi sao).
- **Quy tắc mở nhánh buổi chiều:**

| Player gửi | Nhánh buổi chiều |
|---|---|
| Thư **"rủ làm việc chung" gửi riêng** cho Đức / Châu / Quân / Hạ | Nhánh **riêng** với bạn đó (§2.5.3) |
| Thư "cảm ơn" hoặc "trêu chọc" gửi riêng; **mọi** thư gửi cả nhóm | Nhánh **chung** "Một buổi Valentine của năm đứa" (§2.5.3) |

- Chỉ đi **một** nhánh trong một lần chơi. Chơi lại Trang thì chọn lại (theo menu "Chơi lại một Trang", `§4.3`).
- Phản ứng của bạn nhận khi mở thư riêng (giờ ra chơi) và câu chốt buổi tối thay đổi theo **loại thư** (3 loại × 4 bạn; riêng thư cả nhóm có một câu chốt chung). Lời mẫu ở kịch bản.

#### 2.5.3 Nhánh buổi chiều (Trang 6 Cảnh D bước 3 · Main)
Mỗi nhánh **luôn có bản Tầng A** (khoảng 1–2 phút, không có thua) để cảnh không bao giờ bị chặn. Tầng B là minigame đầy đủ theo bản sửa của nhóm, làm nếu còn thời gian — nếu chưa làm xong thì giữ Tầng A, không đổi gì ở câu chuyện. **[CẦN CHỐT #3 — mặc định Tầng A]**

| Nhánh | Nơi | Tầng A (rút gọn) | Tầng B (đầy đủ) | Thắng / hoàn thành | Thua |
|---|---|---|---|---|---|
| **Kèo ăn vặt** (Đức) | xe quà vặt Z03 | Chọn 1 món cho mình + 1 món để chia trong 3 món có giá ghi sẵn; Đức phản ứng theo lựa chọn | **"Chọn món trong ngân sách"** — giỏ hàng, tổng tiền ≤ ngân sách của Đức, ít nhất 1 món cho mình và 1 món chia | Chọn xong (A); tổng ≤ ngân sách và đủ 2 loại món (B) | Không có; vượt ngân sách thì Đức nhắc "bỏ bớt một món" và giỏ hàng giữ nguyên để chỉnh |
| **Danh sách mua sắm** (Châu) | tiệm tạp hóa Z03 | Nhặt 3 món Châu đọc (băng keo, ghim giấy, 1 món cho Căn cứ) trên kệ | Tìm đúng món trong danh sách có giá và ngân sách; món hết hàng thì chọn món thay thế Châu chấp nhận | Đủ 3 món (A); đủ danh sách trong ngân sách (B) | Không có; chọn sai thì Châu nói "món này không có trong sổ" và bỏ lại kệ |
| **Thử thách ném rổ** (Quân) | cột rổ Z02 | Ném 3 lần (kéo thả như đá cầu, `§2.4.1`); kết quả nào cũng đi tiếp | **"Ném bóng tính điểm"** — 3 vòng gần → xa, vạch lực xanh-vàng-đỏ, đạt ngưỡng điểm | 3 lần ném (A); đạt ngưỡng điểm cả 3 vòng (B) | Không có; chưa đạt ngưỡng thì chơi lại vòng, không thua hẳn |
| **Một vòng sân trường** (Hạ) | gốc phượng, hành lang, bầu trời (Z02, Z02b) | Chụp **1** ảnh theo gợi ý bố cục của Hạ (`§2.4.5`) | **"Săn góc ảnh"** — 3 địa điểm, 3 ảnh theo gợi ý; chụp lại không giới hạn; Hạ chọn ảnh yêu thích vào Album | Giữ 1 ảnh (A); giữ đủ 3 ảnh (B) | Không có |
| **"Một buổi Valentine của năm đứa"** (nhánh chung) | Căn cứ Z05 | **(1) Trang trí Căn cứ** (4 nhóm vật phẩm: đồ treo, đồ đặt bàn, ảnh/kỷ niệm, vật trang trí trung tâm; K3) + **(2) "Đoán xem ai là người…"** (5 câu, chọn 1 trong 5 người; **không có đúng sai**). Đồ ăn: Đức mang tới, không chơi | Bốn trò: **Lập kế hoạch** (kéo 3 thẻ việc vào 3 ô thời gian) · **Chuẩn bị đồ ăn** (giỏ hàng, ngân sách chung 5 người) · **Trang trí Căn cứ** · **"Đoán xem ai là người…"** | Làm xong các việc trong bước (A); xong cả 4 trò (B) | Không có |

- **Ảnh phụ:** nhánh riêng cho **ảnh "Player × bạn"** (cầm tay, tự động đủ 3 dấu vì chỉ hai người); nhánh chung không có ảnh phụ riêng (ảnh nhóm chụp ở bước 5).
- **Không có căn-tin:** trò "Chuẩn bị đồ ăn" (Tầng B) mua ở **xe quà vặt Z03**; bản sửa của nhóm ghi "quầy căn tin" — đã đổi theo CONFIRMED 20/11 (`00` §5).
- **Ngân sách và giá** (Kèo ăn vặt, Chọn món, Chuẩn bị đồ ăn): bản sửa của nhóm **không ghi con số** → người làm nội dung đặt giá trị khởi điểm khi dựng (PROPOSED), chỉnh khi chơi thử.
- **Khu Vui Chơi:** Hạ không nhận chơi chỉ trong Cảnh B (tới khi Đức xin lỗi xong); Cảnh D không còn khóa (`§3.1`).
- Dữ liệu minigame lưu theo `§4.2`; số liệu đo theo `§5.1`.

#### 2.5.4 Mở hòm thư và ảnh nhóm (Trang 6 Cảnh D bước 4–5 · Main · Tầng A)
| Bước | Người chơi làm | Điều kiện xong |
|---|---|---|
| 4 · Mở hòm thư | Nghe Đức đọc to **bốn tờ của ngăn chung** (mỗi bạn một tờ) và, nếu Player gửi cả nhóm, tờ của Player (kèm bức tranh nếu có). Bạn nhận nhắc lại thư riêng của Player **không đọc to nội dung**. Nếu đi nhánh riêng: nút **"Cho mọi người xem / Giữ riêng"** cho ảnh "Player × bạn" | Hết lượt thoại |
| 5 · Ảnh nhóm | Chụp **hẹn giờ** (`§2.4.5`), hòm thư nằm trong khung (vật nền, không bắt buộc cho điều kiện "Đủ người") | Bấm "Giữ ảnh này" (không chặn truyện dù thiếu dấu) |
- **Hết Trang 6** khi giữ ảnh nhóm Valentine.

#### 2.5.5 Kiểm "mọi đường đều đi tiếp" *(để dev và người kiểm thử đối chiếu)*
| Điểm rẽ | Mọi lựa chọn hợp lệ | Đi tiếp đến |
|---|---|---|
| Cảnh A bước 3 | Thiếu vật liệu / dán lệch | Gợi ý của Đức/Châu; không khóa |
| Cảnh D bước 1 | 4 bạn × 3 loại + cả nhóm (4 câu + tranh) = **17 lựa chọn** | Bước 2 |
| Cảnh D bước 3 | 4 nhánh riêng + 1 nhánh chung | Bước 4 |
| Cảnh D bước 3 (minigame Tầng B) | Thắng hoặc chưa đạt | Làm lại vòng hoặc về Tầng A; không thua hẳn |
| Cảnh D bước 4 | Bất kỳ loại thư nào | Bước 5 (ảnh nhóm) |
| Cảnh D bước 5 | Ảnh đủ hoặc thiếu dấu | Hết Trang 6 |

---

## 3. Nhóm B — Khu Vui Chơi Tuổi Thơ ở Căn Cứ (Z05)

### 3.1 Mở khóa và cách vào
| Hạng mục | Đặc tả |
|---|---|
| Mở khóa | Sau khi xong **Trang 3** (Căn cứ được dựng). Dùng được từ các lúc đi tự do của **Trang 4** trở đi |
| Cách vào | Đi tới Căn cứ → tương tác **"Bảng trò chơi"** (một tấm bìa carton dựng cạnh biển tên) |
| Màn chọn | Chọn trò → chọn **đối thủ** trong 4 bạn → bắt đầu |
| Đối thủ có mặt | Chỉ chọn được bạn **đang có mặt trong cảnh** của Trang đó; bạn vắng hiện mờ "Hôm nay [tên] không ở đây" *(PROPOSED)* |
| Khóa tạm | Mỗi Trang có thể khai báo các bước khóa Khu Vui Chơi (ví dụ Trang 7 cảnh C lúc Châu ngồi một mình; Trang 9 lúc dọn Căn cứ) và các bạn không nhận chơi (ví dụ Hạ ở Trang 6 Cảnh B, từ lúc bị trêu tới khi Đức xin lỗi xong; sang Cảnh D không còn khóa) *(PROPOSED)* |
| Ảnh hưởng truyện | Không. Thắng/thua ở đây chỉ vào **bảng tỉ số** |
| Bảng tỉ số | Ghi trong trang **"Bảng tỉ số"** của sổ luật Căn cứ: mỗi trò × mỗi bạn: thắng – thua – hòa. Ở phòng 2026, lật sổ luật xem lại được *(PROPOSED)* |

### 3.2 Bảng độ khó theo nhân vật
Chọn đối thủ = chọn độ khó. Mỗi bạn giỏi trò khác nhau, đúng tính cách *(thứ hạng: CONFIRMED 20/11; thông số: PROPOSED)*.

| Trò | Rất dễ | Dễ | Trung bình | Khó nhất |
|---|---|---|---|---|
| Ô ăn quan | **Đức** (hay đi ẩu) | **Hạ** (hay nhường, đi theo cảm tính) | **Quân** | **Châu** (tính trước 3–4 nước, tối ưu vét quan) |
| Nhảy lò cò | — | **Hạ** | **Châu** · **Đức** (Khá: nhanh nhưng hay vội trượt chân) | **Quân** (thể lực tốt, giữ thăng bằng và ném chuẩn nhất) |
| Bắn bi ve | — | **Hạ** | **Châu** · **Quân** (Khá) | **Đức** ("trùm bi ve", ngắm cực chuẩn) |

> Ghi chú: danh sách của chủ dự án có "Player/Quân (Trung bình)" ở Ô ăn quan. Người chơi không thể tự là đối thủ của mình, nên hiểu là **Quân ở mức trung bình**.

### 3.3 Ô ăn quan
**Luật** — theo luật phổ biến; biến thể vùng miền để trong cấu hình. Bộ luật mặc định dưới đây CONFIRMED 20/11, giải thích bằng màn hướng dẫn trong game.
| Hạng mục | Đặc tả |
|---|---|
| Bàn | Vẽ phấn trên nền Căn cứ (đề xuất; bàn gỗ là phương án thay). Hai hàng, mỗi hàng **5 ô dân**; hai đầu là **2 ô quan** hình bán nguyệt |
| Quân | Mỗi ô dân 5 viên sỏi (tổng 50). Mỗi ô quan 1 viên quan lớn |
| Điểm | Sỏi dân = 1 điểm · quan = **10 điểm** |
| Phe | Người chơi giữ 5 ô dân phía mình (hàng dưới màn hình) |
| Một lượt | Chọn 1 ô dân **phía mình** có sỏi → chọn **hướng** (trái/phải) → bốc hết sỏi, rải mỗi ô một viên theo hướng đã chọn (rải qua cả ô quan) |
| Rải tiếp | Rải hết, nếu ô kế tiếp là **ô dân có sỏi** → bốc ô đó rải tiếp cùng hướng |
| Ăn | Rải hết, nếu ô kế tiếp **trống** và ô sau nó **có sỏi** → ăn hết ô đó. Sau ô vừa ăn, nếu tiếp tục là một ô trống rồi một ô có sỏi → **ăn tiếp** (ăn liên hoàn) |
| Mất lượt | Ô kế tiếp là **ô quan** (không được bốc quan để rải), hoặc **hai ô trống liên tiếp** |
| Quan non | Tùy chọn cấu hình, mặc định **tắt**. Bật: ô quan còn ít hơn 5 sỏi dân thì chưa được ăn |
| Hết dân | Đến lượt mà 5 ô phía mình trống → lấy 5 sỏi từ số đã ăn rải mỗi ô một viên. Không đủ sỏi → **vay** đối thủ, trả khi tính điểm |
| Kết thúc | Khi **cả hai ô quan đều đã bị ăn** (hết quan, tàn dân): mỗi bên thu sỏi còn trên ô dân phía mình |
| Thắng / thua / hòa | Tổng điểm cao hơn thắng; bằng nhau là hòa |
| Điều khiển | Click ô → hai mũi tên hướng hiện ra → click hướng. Rải từng viên có hoạt ảnh 0,12 giây/viên; giữ Space để tua nhanh ×3 |

**AI** *(PROPOSED; tính trong luồng xử lý nền của trình duyệt, tối đa 500 ms mỗi nước)*
| Đối thủ | Cách chọn nước |
|---|---|
| Châu | Tìm trước **4 nước** (nước mình – nước đáp – nước mình – nước đáp), chấm theo điểm chênh lệch + thưởng khi ăn được quan. Chọn nước tốt nhất |
| Quân | Tìm trước 2 nước; 10% chọn nước tốt thứ hai |
| Hạ | Tìm 1 nước; 40% chọn ngẫu nhiên trong 3 nước khá nhất; **không bao giờ ăn quan nếu còn cách khác** ("nhường") |
| Đức | 50% chọn ngẫu nhiên; 50% chọn nước ăn được nhiều sỏi ngay nhất, bỏ qua việc để hở quan |

### 3.4 Nhảy lò cò
| Hạng mục | Đặc tả |
|---|---|
| Sân | Vẽ phấn trên nền đất Căn cứ, **10 ô đánh số**. Bố cục đề xuất: ô 1–3 đơn · 4–5 đôi · 6 đơn · 7–8 đôi · 9 đơn · 10 "nhà" (bán nguyệt) |
| Camera | Cố định nhìn chéo từ trên xuống, thấy toàn bộ sân |
| Mục tiêu | Lần lượt hoàn thành ô 1 → ô 10. Ai qua được ô 10 trước thì thắng |
| **Bước 1 — Ném sành** | Rê chuột chọn **hướng** (mũi tên lắc nhẹ trái phải); giữ chuột trái nạp **thanh lực**, thả. Miếng sành phải nằm **gọn trong ô đang tới lượt**. Rơi ra ngoài hoặc đè lên vạch → **hết lượt** |
| **Bước 2 — Nhảy** | Nhảy qua từng ô theo nhịp: **ô đơn** bấm Space (một chân); **ô đôi** bấm cùng lúc A + D (hai chân). Mỗi bước có cửa sổ thời gian ±150 ms. **Không dẫm vào ô có miếng sành** (game tự bỏ qua ô đó) |
| Mất thăng bằng | Bấm sai phím, sai nhịp, hoặc chậm quá 0,6 giây → trượt chân → **hết lượt** |
| **Bước 3 — Nhặt sành** | Trên đường về, đứng ở ô ngay trước ô có sành: giữ phím S để cúi; một **thanh thăng bằng** lắc qua lại — giữ con trỏ trong vùng xanh bằng cách di chuột trái/phải trong **1,5 giây**. Rơi ra ngoài vùng → hết lượt |
| Qua ô | Ném đúng + nhảy đi về không lỗi + nhặt được sành → mở ô kế tiếp ở lượt sau |
| Lượt | Người chơi và đối thủ thay phiên; hết lượt khi mắc lỗi |
| Thua | Đối thủ qua ô 10 trước |

**Kỹ năng đối thủ** *(PROPOSED — xác suất thành công mỗi giai đoạn)*
| Đối thủ | Ném đúng ô | Mỗi bước nhảy | Nhặt sành |
|---|---|---|---|
| Quân | 90% | 98% | 95% |
| Đức | 80% | 92% (hay vội: ô 7–10 chỉ 85%) | 80% |
| Châu | 75% | 92% | 85% |
| Hạ | 60% | 88% | 75% |

### 3.5 Bắn bi ve
| Hạng mục | Đặc tả |
|---|---|
| Sân | **Vòng tròn phấn** đường kính 1,2 m; **7 viên bi** xếp hình chữ thập ở giữa |
| Camera | Nhìn thẳng từ trên xuống |
| Bi cái | Mỗi người một viên bi cái, bắn từ vạch ngoài vòng |
| Ngắm | Rê chuột chọn **góc**: một đường ngắm ngắn (dài 30 cm) hiện ra |
| Lực | Giữ chuột trái và **kéo lùi** (như ná thun); kéo càng xa lực càng lớn, tối đa 25 cm kéo = lực tối đa |
| Xoáy | Trong lúc kéo, cuộn bánh xe chuột: xoáy trái/phải 3 mức. Xoáy làm đường bi **cong nhẹ** rồi giảm dần |
| Vật lý | Hình tròn va chạm trên mặt phẳng; hệ số nảy giữa hai bi 0,9; ma sát lăn trên nền đất làm bi dừng sau khoảng 1–2 m ở lực tối đa |
| Ăn bi | Bi bị bắn văng **ra khỏi vòng** = ăn; người bắn được **bắn tiếp** từ chỗ bi cái dừng |
| Mất lượt | Không ăn được viên nào; hoặc bi cái **nằm lại trong vòng** (bi cái được đặt ra ngoài vạch) |
| Kết thúc | Hết bi trong vòng. Ai ăn nhiều hơn thắng; bằng nhau là hòa |

**Kỹ năng đối thủ** *(PROPOSED — sai số ngẫu nhiên khi ngắm và đặt lực)*
| Đối thủ | Sai số góc | Sai số lực | Dùng xoáy |
|---|---|---|---|
| Đức | ±1° | ±5% | Có |
| Quân | ±3° | ±8% | Không |
| Châu | ±4° | ±10% | Không |
| Hạ | ±7° | ±15% | Không |

### 3.6 Trò mở rộng (Tầng C, tùy chọn)
| Trò | Tóm tắt | Ghi chú |
|---|---|---|
| Đá cầu tự do | Dùng lại luật §2.4.1, đếm số lượt chuyền liên tiếp cao nhất | Ghi kỷ lục vào Bảng tỉ số |
| Oẳn tù tì búng tai | Đấu 3 ván thắng 2; người thua bị "búng tai" bằng hoạt ảnh nhẹ, có tiếng "tách" vui | Đối thủ ra kéo/búa/bao theo thói quen: Đức hay ra búa, Châu xoay vòng đều, Quân hay ra lại cái vừa thắng, Hạ ngẫu nhiên *(PROPOSED)* |

---

## 4. Lưu trữ trên máy người chơi
*(CONFIRMED 20/11: tiến trình, lựa chọn, ảnh và bảng thành tích lưu trên trình duyệt; không lưu tiến trình lên mạng.)*

### 4.1 Nơi lưu
| Dữ liệu | Nơi lưu | Ghi chú |
|---|---|---|
| Tiến trình 9 Trang, bước hiện tại, lựa chọn, cờ trạng thái | localStorage (JSON) | Có số phiên bản `v`; khi đổi cấu trúc có bước chuyển đổi |
| Tên và ngoại hình Player | localStorage | **Chỉ trên máy**, không bao giờ gửi đi |
| Ảnh Album | IndexedDB | Lưu thẳng dạng **ảnh JPEG nén (Blob)**, không đổi sang chuỗi base64 vì base64 nặng hơn khoảng 1/3 |
| Bảng thành tích minigame | localStorage (JSON) | Xem §4.2 |
| Cài đặt (âm lượng, tốc độ chữ, độ khó, luật caro, chế độ báo sai Sudoku) | localStorage | — |

### 4.2 Dữ liệu minigame cần lưu
| Trường | Nội dung |
|---|---|
| `minigames.{game_id}.{opponent_id}` | Số ván thắng, thua, hòa; lần chơi gần nhất |
| `minigames.caro.series` | Tỉ số cả loạt ván trên nắp hộp phấn (bảng ở §2.1) |
| `minigames.caro.story_result` | Kết quả ván trong truyện (thắng/thua/hòa, đối thủ) |
| `minigames.sudoku.best` | Thời gian tốt nhất và số sao theo từng đề |
| `minigames.sudoku.story_result` | Thắng/thua ở Trang 7 |
| `minigames.bottle.best` | Điểm cao nhất; đã đứng nắp chưa; mã ảnh khoảnh khắc |
| `minigames.boat.result`, `.footbag.result`, … | Kết quả lần đầu của các trò cốt truyện (dùng cho thoại) |
| `hub.unlocked` | Đã mở Khu Vui Chơi chưa |
| `story.valentine.recipient` | `duc` / `chau` / `quan` / `ha` / `group` — người nhận thư Valentine của Player *(PROPOSED)* |
| `story.valentine.kind` | `thanks` / `tease` / `invite` (gửi riêng) hoặc `group_text` / `group_drawing` (gửi cả nhóm) *(PROPOSED)* |
| `story.valentine.groupMsg` | Mã của **câu viết sẵn** đã chọn khi gửi cả nhóm (không lưu chữ tự do) *(PROPOSED)* |
| `story.valentine.boxStyle` | Màu nền + họa tiết hòm thư, dùng lại ở Căn cứ Trang 7, 9 và ảnh nhóm *(PROPOSED)* |
| `minigames.valentine.branch.result` | Nhánh buổi chiều đã đi và đã xong ở Tầng A hay B; dùng cho thoại, không chặn truyện *(PROPOSED)* |
*(Nhánh buổi chiều **suy ra** từ `recipient` + `kind` theo bảng ở `§2.5.2`, không lưu riêng. Chỉ thêm các trường trên vì thoại và hình hòm thư ở các Trang sau cần chúng.)*

### 4.3 Lưu khi nào
- Tự động ở đầu mỗi cảnh, đầu mỗi bước Main, khi có kết quả minigame, khi về phòng 2026.
- Tải lại giữa ván minigame → ván đó bắt đầu lại từ đầu (không lưu giữa ván).
- Menu có: Chơi tiếp · Chơi lại một Trang (giữ Album) · Xóa tiến trình (có hỏi lại).
- Hướng dẫn ghi rõ: xóa dữ liệu trình duyệt sẽ mất tiến trình và ảnh.

---

## 5. Số liệu đo ẩn danh (Firebase Firestore)
*(CONFIRMED 20/11: chỉ ghi số liệu ẩn danh và form phản hồi.)* Cách gửi giữ như `GDD.md` v0.3 §13: trình duyệt gom event → gửi theo lô qua Vercel Functions → mỗi lô ghi 1 document. Không gửi tên, không gửi nội dung tin nhắn hay ghi chú.

### 5.1 Event cần thêm *(PROPOSED — phải bổ sung vào `07_ANALYTICS_REQUIREMENTS` và chốt trước 05/12)*
| Event | Khi nào | Thuộc tính |
|---|---|---|
| `page_started` / `page_completed` | Vào/xong một Trang | `page_id` (`d.gNN.KK`), `milestone_id`, `duration_s` (khi xong), `is_replay` |
| `minigame_started` | Bắt đầu một ván | `game_id`, `context` (`story` / `hub` / `side`), `page_id`, `opponent_id`, `difficulty` |
| `minigame_finished` | Có kết quả | như trên + `result` (`win`/`lose`/`draw`/`complete`/`quit`), `duration_s`, `stars`, `hints_used` (Sudoku), `score` (lật chai) |
| `hub_opened` | Mở Bảng trò chơi ở Căn cứ | `page_id` |
| `valentine_letter_sent` | Player bỏ thư Valentine vào hòm (Trang 6) *(PROPOSED, tùy chọn)* | `recipient_id` (`duc`/`chau`/`quan`/`ha`/`group`), `kind` (`thanks`/`tease`/`invite`/`group_text`/`group_drawing`) — **chỉ mã chọn sẵn, không nội dung tự do** |
| `end_message_sent` | Gửi tin ở kết demo | `tone` (`playful`/`gentle`/`deep`) — **không** gửi nội dung |
| `public_demo_completed` | Sau khi gửi tin, **trước** khi mở form | — |

Từ các event này tính được: thời gian hoàn thành mỗi Trang, tỉ lệ thắng/thua từng minigame theo đối thủ, sắc thái tin nhắn cuối. Dữ liệu chơi thử nội bộ và bản pre-launch phải lọc riêng, không gộp vào số liệu chính (quy tắc của `07`).

---

## 6. Thứ tự làm và thang cắt giảm *(duyệt 20/11 như kế hoạch; chủ dự án quyết khi cần cắt)*
Hạn chuẩn bị bản đo là **04/12** (còn khoảng 14 ngày tính từ 20/11). Phần mới thêm hôm nay nhiều việc, nên đề xuất làm theo thứ tự dưới đây. Tới mốc kiểm tra, phần nào chưa xong thì lùi sang sau ngày 15/12.

| Ưu tiên | Hạng mục | Lý do |
|---|---|---|
| 1 | Khung minigame chung (§1), lưu (§4), event đo (§5) | Mọi trò dùng chung |
| 2 | Các trò K trong 9 Trang (§2.4) + chụp ảnh + **Hòm thư Valentine Tầng A (§2.5)** | Nằm trên đường chơi bắt buộc |
| 3 | Caro (§2.1) | Trong Main Trang 5 |
| 4 | Sudoku (§2.2) | Trong Main Trang 7 |
| 5 | Lật chai (§2.3) | Side tùy chọn |
| 5a | Hòm thư Valentine — nhánh buổi chiều **Tầng B** (§2.5.3) | Nâng từ bản rút gọn lên minigame đầy đủ; không nằm trên đường bắt buộc |
| 6 | Khu Vui Chơi: **Bắn bi ve** | Vật lý đơn giản, dễ làm nhất trong 3 trò |
| 7 | Khu Vui Chơi: **Ô ăn quan** | Luật và AI tốn công nhất |
| 8 | Khu Vui Chơi: **Nhảy lò cò** | Cần thêm hoạt ảnh nhảy, cúi, ném |
| 9 | Trò mở rộng (§3.6), "Sổ đố của Châu" | Tầng C |

Thang cắt nếu thiếu thời gian (cắt từ dưới lên): bỏ 9 → lò cò sau 15/12 → ô ăn quan sau 15/12 → nhánh Tầng B của hòm thư lùi về Tầng A (5a) → lật chai giữ bản không có đường dự đoán. Các trò K và chụp ảnh **không** cắt.

---

## 7. Sổ quyết định của file này
| # | Vấn đề | Kết quả |
|---|---|---|
| 1 | Tỉ số trên nắp hộp phấn và tin nhắn cuối | **CONFIRMED 20/11:** loạt ván bắt đầu 3–3, bảng ở §2.1 |
| 2 | Vị trí Sudoku | **CONFIRMED 20/11:** Trang 7 cảnh A, đồng hồ của Châu 6 phút |
| 3 | Cỡ bàn caro | **CONFIRMED 20/11:** 12×12 mặc định, 15×15 trong cấu hình |
| 4 | Đua thuyền | **CONFIRMED 20/11:** Quân luôn nhất; thắng = về đích không lật |
| 5 | Luật Ô ăn quan, Caro, Sudoku, Lò cò, Bi ve | **CONFIRMED 20/11:** giữ luật mặc định của file này, có màn hướng dẫn trong game |
| 6 | Bàn Ô ăn quan | **CONFIRMED 20/11 (duyệt cả file):** vẽ phấn trên nền |
| 7 | Bạn vắng mặt / khóa Khu Vui Chơi theo Trang | **CONFIRMED 20/11 (duyệt cả file):** như §3.1; người phụ trách từng Trang khai báo |
| 8 | Hòm thư Valentine ở Main (Trang 6) | **CONFIRMED 21/11:** Main, nghĩa mới; luật §2.5 PROPOSED |
| 9 | Nhánh buổi chiều: Tầng A hay B | **PROPOSED 21/11:** Tầng A bắt buộc, Tầng B nếu còn thời gian — **CẦN CHỐT #3** |
| 10 | Bảng nội quy hòm thư: gắn đủ 3 điều | **PROPOSED 21/11** — **CẦN CHỐT #6** |
| 11 | Ngân sách/giá trong Kèo ăn vặt, Chọn món, Chuẩn bị đồ ăn | **Còn mở:** bản sửa không ghi số; người làm nội dung đặt giá trị khởi điểm |

## 8. Changelog
- **v1.1-draft — 21/11/2026:** Thêm **§2.5 Hòm thư Valentine** (Main Trang 6, nghĩa mới theo bản sửa của nhóm): làm hòm thư, viết thư, nhánh buổi chiều Tầng A/B, mở hòm thư, ảnh nhóm, bảng kiểm "mọi đường đều đi tiếp". Thêm 3 hàng vào §2.4.6, trường lưu `story.valentine.*` (§4.2), event `valentine_letter_sent` (§5.1, tùy chọn), dòng 5a ở §6, quyết định 8–11 ở §7. Chỉnh một câu ở §3.1 (khóa Hạ chỉ trong Cảnh B). Các mục khác không đổi.
- **v1.0 APPROVED — 20/11/2026 (23:30):** Chủ dự án duyệt toàn bộ file. Chốt: bảng tỉ số loạt ván caro (§2.1); Sudoku ở Trang 7; Quân luôn nhất ở đua thuyền; giữ bộ luật mặc định, giải thích bằng hướng dẫn trong game.
- **v1.0-draft — 20/11/2026:** Bản đầu theo quyết định chủ dự án 20/11: minigame chơi thật (Caro, Sudoku, Lật chai, các trò K1–K6 có luật), Khu Vui Chơi Tuổi Thơ ở Căn cứ (Ô ăn quan, Nhảy lò cò, Bắn bi ve, chọn đối thủ = chọn độ khó), lưu trên máy + Firebase chỉ cho số liệu ẩn danh. Đổi nguyên tắc "không có thua" thành "có thua nhưng không chặn truyện". Mọi thông số là giá trị khởi điểm, chưa chơi thử.
