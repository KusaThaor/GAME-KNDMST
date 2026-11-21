# TÀI LIỆU THIẾT KẾ GAME TOÀN DIỆN (MASTER CONSOLIDATED GDD)
# DỰ ÁN: HÀNH TRÌNH THANH XUÂN — "NHỮNG NGÀY MÌNH CÒN NHỎ"
**Dự án môn học:** Kỹ Năng Đổi Mới Sáng Tạo (KNĐMST)  
**Phiên bản đồng bộ:** v1.2-draft / v1.6 Script (Dựa trên nền tảng GDD v1.0 APPROVED 20/11/2026 & Chỉ đạo kỹ thuật 21–22/11/2026)  
**Tình trạng kiểm toán & vận hành:** Hoàn tất rà soát 100% tài liệu `docs/`, `WORKSPACE.md`, `CLAUDE.md`, mã nguồn dữ liệu TypeScript trong `src/content/`, `src/minigames/`, `src/world/`, `src/ui/`.

---

## MỤC LỤC TỔNG QUAN
- **PHẦN I — CỐT TRUYỆN & TUYẾN NHÂN VẬT (NARRATIVE & CHARACTERS)**
  - 1. Tầm nhìn, Bối cảnh tổng thể & Thông điệp cốt lõi
  - 2. Cấu trúc Trò chơi & Tiến trình theo Mốc / Trang (Tránh dùng "Chương")
  - 3. Kịch bản Chi tiết 9 Trang Ký Ức (Mở đầu → Mốc 1 → Chuyển Mốc → Mốc 2 → Kết Demo)
  - 4. Hồ sơ Chi tiết Nhóm 5 Nhân Vật Chính & Các NPC Quan Trọng
  - 5. Quy chuẩn Hệ thống Đại từ Xưng Hô Miền Nam Đặc Thù
  - 6. Danh Mục Sự Kiện (Events), Hệ Thống Phân Nhánh (Branching Flags) & Điều Kiện Mở Khóa / Kết Thúc
- **PHẦN II — CÁCH CHƠI (GAMEPLAY LOOP & MECHANICS)**
  - 1. Vòng lặp Gameplay Cốt lõi (Macro Loop: Hub 2026 ↔ Ký ức; Micro Loop trong một cảnh)
  - 2. Hệ thống 6 Kiểu Tương Tác Dùng Lại (K1 – K6)
  - 3. Cơ chế Điều khiển, Camera 3D & Máy Ảnh Tự Chụp Của Player
  - 4. Hệ Thống Toàn Bộ 11 Minigame (Minigame Mạch Truyện & Khu Vui Chơi Tuổi Thơ Căn Cứ Z05)
  - 5. Cơ chế Lưu Trữ Dữ Liệu Cục Bộ (Save System) & Thu Thập Số Liệu Đo Lường Ẩn Danh (Analytics)
  - 6. Hệ thống Giao Diện Người Chơi HUD & UI Overlay (Preact + CSS Motion)
- **PHẦN III — DANH SÁCH BỐI CẢNH & KHÔNG GIAN CHƠI (ENVIRONMENTS, SCENES & PROPS)**
  - 1. Không gian Hub: Phòng Trọ Năm 2026 (`hub_room`)
  - 2. Bản Đồ Trường Học THCS Miền Nam (`map_thcs`) — Chi Tiết 6 Phân Khu (Z01 đến Z05)
  - 3. Ma Trận Bối Cảnh, Thời Điểm, Ánh Sáng & Đạo Cụ (Props) Bắt Buộc Theo Kịch Bản

---

# PHẦN I — CỐT TRUYỆN & TUYẾN NHÂN VẬT

## 1. Tầm nhìn, Bối cảnh tổng thể & Thông điệp cốt lõi

### 1.1 Câu chuyện trong một đoạn văn
Năm 2026, nhân vật chính `{player_name}` (23 tuổi), đang sống và làm việc một mình tại phòng trọ thành phố, trong lúc dọn phòng đã tìm thấy một thùng carton cũ dán chữ "Đồ cũ - đừng vứt". Bên trong là một cuốn Album với nhiều trang giấy trắng tinh và những kỷ vật học trò cũ kỹ: một mẩu giấy mật lệnh bị gạch bút đỏ, chiếc thuyền giấy phai màu, chiếc biển tên căn cứ bằng gỗ, tấm ảnh ố vàng, hộp phấn nắp ghi tỉ số dang dở, tờ vẽ chiếc lá bút chì "Chưa dám đưa", bản báo tường A5, tờ lịch bóng đá khoanh đỏ và cuốn lưu bút bìa nâu. Mỗi món đồ khi chạm vào sẽ đưa người chơi ngược dòng thời gian về lại ngôi trường cấp 2 tại một thị trấn miền Nam trong giai đoạn 2014–2018. Sau mỗi lần trải qua ký ức, một trang Album sẽ được phục hồi sắc nét và căn phòng năm 2026 lại xuất hiện thêm một món đồ kỷ niệm. Kết thúc bản chơi, người chơi mở chiếc điện thoại thông minh, tìm lại nhóm chat cũ đã im lìm nhiều năm và chọn một tin nhắn chân thành gửi đi để kết nối lại những người bạn thuở nhỏ.

### 1.2 Thông số cốt lõi của dự án
| Hạng mục | Quy chuẩn kỹ thuật & Thiết kế | Trạng thái phê duyệt |
|---|---|---|
| **Thể loại** | 3D Narrative / Cozy Adventure, Khám phá bán mở (Semi-open World) | CONFIRMED (14/11/2026) |
| **Nền tảng mục tiêu** | Web Browser (WebGL / Three.js), tối ưu hóa bàn phím + chuột trên máy tính | CONFIRMED (13/11/2026) |
| **Góc nhìn (Camera)** | Góc nhìn thứ ba (Third-person follow) trong ký ức; Góc camera cố định (Isometric/Fixed) ở phòng 2026 | CONFIRMED (13/11/2026) |
| **Bối cảnh lịch sử** | Ngôi trường THCS hư cấu tại miền Nam Việt Nam, niên khóa 2014–2018 | CONFIRMED (14/11/2026) |
| **Tông giọng & Không khí** | Cozy, ấm áp, hoài niệm tuổi thơ học trò; không có phản diện, mâu thuẫn được lắng nghe và hàn gắn | CONFIRMED (13/11/2026) |
| **Phong cách đồ họa** | Semi-chibi 3D, Stylized soft low-poly, vật liệu Toon Shader 3 bậc sáng kết hợp nét viền Outline | CONFIRMED (20/11/2026) |
| **Nhân vật người chơi** | Tự nhập tên `{player_name}`, chọn giới tính Nam/Nữ, sinh năm 2003 (năm 2014 vào lớp 6 là 11 tuổi) | CONFIRMED (14/11/2026) |
| **Nhóm bạn cốt lõi** | 5 người: Player + Đức "Tí Nổ" + Quân "Bắp" + Minh Châu "Châu Tổng" + Hạ "Mây" | CONFIRMED (14/11/2026) |
| **Phạm vi bản đo thử (05–15/12/2026)** | **Trọn vẹn Mốc 1 (Trang 1 → Trang 4)**, điểm kết thúc demo đặt ngay sau Trang 4 "Đủ năm đứa". Mốc 2 (Trang 5–9) giữ nguyên thiết kế kỹ thuật hoàn chỉnh nhưng lùi phát hành sau 15/12 | CONFIRMED (21/11/2026 tối) |
| **Mô hình kinh doanh** | Dự án môn học phi thương mại, miễn phí 100%, không thanh toán, không quảng cáo, không gacha | CONFIRMED (14/11/2026) |

### 1.3 Năm trụ cột trải nghiệm (Core Pillars)
1. **Hoài niệm chạm được (Tactile Nostalgia):** Từng đồ vật, âm thanh tiếng ve, trống trường, tiếng phấn gõ lộc cộc trên bảng đen, gói mì tôm bóp vụn rắc gia vị, que kem, trò chơi đá cầu, đua thuyền giấy... đều gợi nhắc chính xác tuổi học trò miền Nam thập niên 2010.
2. **Khám phá tự do (Unhurried Exploration):** Người chơi tự do đi dạo trong các phân khu của trường, ngắm nhìn cây phượng, bồn hoa, ghế đá, tương tác với các bạn học hoặc chụp ảnh kỷ niệm mà không bị áp lực thời gian trôi ép buộc.
3. **Chữa lành & Tình bạn trong sáng (Wholesome Friendship):** Hoàn toàn vắng bóng nhân vật phản diện hay bạo lực học đường. Những xích mích nhỏ (trêu chọc quá trớn, áp lực điểm số, cãi vã vì chọn trường cấp 3) đều được giải quyết thông qua sự lắng nghe, tôn trọng và những bức thư xin lỗi chân thành.
4. **Lớn lên cùng nhau (Growing Pains):** Cấu trúc hai mốc phản ánh sự trưởng thành: Mốc 1 (lớp 6–7) là hành trình hồn nhiên "tìm thấy nhau"; Mốc 2 (lớp 8–9) là nỗi trăn trở, bồi hồi và "sợ mất nhau" khi đối diện kỳ thi chuyển cấp và những ngã rẽ cuộc đời.
5. **Quá khứ chạm tới hiện tại (Past Touches Present):** Những hành động, lựa chọn và tấm ảnh chụp trong ký ức của người chơi sẽ phản chiếu trực tiếp lên hiện vật xuất hiện trong căn phòng năm 2026 và nội dung bức tin nhắn gửi vào nhóm bạn cũ.

---

## 2. Cấu trúc Trò chơi & Tiến trình theo Mốc / Trang

### 2.1 Các lớp cấu trúc trò chơi
- **Phòng 2026 (Hub - `hub_room`):** Không gian hiện tại của Player. Nơi đặt thùng carton kỷ vật, cuốn Album ký ức, kệ sách, bàn học, mảng tường dán ảnh và chiếc điện thoại thông minh. Đây là điểm xuất phát mở đầu, nơi trung chuyển giữa các Trang và điểm khép lại bản demo.
- **Mốc 1 — Lớp 6–7 (Niên khóa 2014–2016): Chủ đề "Tìm thấy nhau".**
  - Năm học lớp 6 (`g06`): Bắt đầu với nhóm 3 người gồm Player, Đức và Minh Châu.
  - Năm học lớp 7 (`g07`): Gặp gỡ thêm Quân và Hạ (ban đầu học lớp bên cạnh), thành lập nhóm 5 người, dựng Căn cứ bí mật và chụp bức ảnh nhóm đầu tiên.
- **Mốc 2 — Lớp 8–9 (Niên khóa 2016–2018): Chủ đề "Sợ mất nhau".**
  - Năm học lớp 8 (`g08`): Cả 5 người được xếp chung một lớp; xảy ra sự kiện confession Valentine và ván cờ caro dang dở.
  - Năm học lớp 9 (`g09`): Áp lực thi vào lớp 10, tờ báo tường cuối cùng, cùng xem trận bóng U23 tuyết trắng Thường Châu, đêm lửa trại giãi bày tâm sự và lễ bế giảng chia ba ngả trường.
- **Mốc 3 — Lớp 10–12 (Niên khóa 2018–2021):** Ba trường cấp 3 khác nhau, biến cố đại dịch COVID-19 năm lớp 11, nỗ lực giữ liên lạc nhóm (*Nằm ngoài phạm vi bản public demo*).
- **Đơn vị chơi — "Trang" (Memory Day):** GDD v1.0 **bãi bỏ hoàn toàn chữ "Chương"** làm đơn vị gameplay loop. Đơn vị chơi nhỏ nhất là **Trang** (mã kỹ thuật: `d.gNN.KK` — trong đó `gNN` là khối lớp, `KK` là số thứ tự). Mỗi Trang tương ứng 1 trang Album cần phục hồi, được dẫn vào bởi 1 kỷ vật cụ thể trong thùng đồ và bao gồm từ 1 đến 4 cảnh không gian 3D.

### 2.2 Danh sách 9 Trang của trò chơi
| # | Mã Trang (`id`) | Tên hiển thị | Niên khóa · Mốc thời gian | Kỷ vật dẫn vào (`anchor_artifact_id`) | Trạng thái bản demo |
|---|---|---|---|---|---|
| **1** | `d.g06.01` | **Mật lệnh số 01** | Lớp 6 · Tháng 9/2014 → Hết HK I | Mẩu giấy mật lệnh có nét bút bi đỏ sửa lỗi (`art_m1_01`) | **Mốc 1 (Bản đo 04/12)** |
| **2** | `d.g07.01` | **Thuyền giấy dưới mái hiên** | Đầu lớp 7 · Chiều mưa 2015 | Chiếc thuyền giấy phai màu, có chữ ký và lời ước (`art_m1_02`) | **Mốc 1 (Bản đo 04/12)** |
| **3** | `d.g07.02` | **Căn cứ bí mật** | Lớp 7 · Đầu HK II (Đầu năm 2016) | Biển gỗ "CĂN CỨ BÍ MẬT" + Cuốn sổ luật bìa xanh (`art_m1_03`) | **Mốc 1 (Bản đo 04/12)** |
| **4** | `d.g07.03` | **Đủ năm đứa** | Cuối lớp 7 · Tháng 5/2016 | Tấm ảnh nhóm chụp ở gốc phượng bị ố vàng (`art_m1_05`) | **Mốc 1 (Bản đo 04/12)** |
| — | — | *Chuyển Mốc tại Hub* | "Mấy năm sau…" | Hộp phấn giấy móp sáng dưới đáy thùng (`art_m2_01` / `KV-01`) | Chuyển tiếp |
| **5** | `d.g08.01` | **Lên lớp 8** | Khai giảng lớp 8 · Tháng 9/2016 | Hộp phấn móp nắp ghi tỉ số caro "QUÂN 4 – ĐỨC 3 (CHƯA XONG)" (`art_m2_01`) | Mốc 2 (Sau 15/12) |
| **6** | `d.g08.02` | **Valentine — Hòm thư của năm đứa** | Sau Tết lớp 8 · Tháng 2/2017 (9/2 → 14/2) | Tờ giấy vẽ chiếc lá bằng bút chì góc ghi "Chưa dám đưa" (`art_m2_02`) | Mốc 2 (Sau 15/12) |
| **7** | `d.g09.01` | **Tờ báo tường cuối cùng** | HK I lớp 9 · Tháng 9–11/2017 | Bản báo tường thu nhỏ khổ A5 có một ô trống nhòe màu sáp (`art_m2_03`) | Mốc 2 (Sau 15/12) |
| **8** | `d.g09.02` | **Rã băng** | HK II lớp 9 · 27/1/2018 & Tháng 3/2018 | Tờ lịch tháng 1/2018 khoanh đỏ ngày 27 ghi "CHUNG KẾT" (`art_m2_04`) | Mốc 2 (Sau 15/12) |
| **9** | `d.g09.03` | **Vẫn đủ năm đứa** | Cuối lớp 9 · Tháng 5/2018 | Cuốn sổ lưu bút bìa nâu kraft (`art_m2_05`) | Mốc 2 (Sau 15/12) |

---

## 3. Kịch bản Chi tiết 9 Trang Ký Ức

### MỞ ĐẦU · Phòng 2026 (Buổi tối đèn bàn)
- **Quest:** `q_hub_pd_01`
- **Diễn biến:** Player ngồi tại bàn làm việc trong phòng trọ, ánh đèn bàn ấm áp. Trước mặt là chiếc thùng carton cũ dán chữ "Đồ cũ - đừng vứt".
- **Thao tác:**
  1. Người chơi nhập tên nhân vật `{player_name}` (tối đa 12 ký tự) và chọn giới tính Nam/Nữ (`gender`).
  2. Bấm vào thùng carton (`itr.hub.memory_box`) để mở nắp thùng.
  3. Mẩu giấy gấp tư mật lệnh số 01 (`art_m1_01`) phát sáng ở ngăn đầu tiên.
- **Thoại:** `{player_name}`: *"Mật lệnh này… ai viết mà nhìn chẳng hiểu gì hết vậy? Không biết ngày đó tụi mình bắt đầu chơi với nhau từ lúc nào nhỉ?"*
- **Chuyển cảnh:** Tiếng trống trường dồn vang từ xa, ngoài cửa sổ trời tối chuyển dần sang ánh nắng trong veo buổi sớm miền Nam.

---

### MỐC 1 — LỚP 6–7: TÌM THẤY NHAU

#### TRANG 1 (`d.g06.01`): MẬT LỆNH SỐ 01 (Niên khóa 2014–2015)
- **Kỷ vật dẫn vào:** Mẩu giấy gấp tư mật lệnh đầy nét vẽ hình tròn, hình vuông và nét bút bi đỏ sửa lỗi chính tả (`art_m1_01`).
- **Nhân vật tham gia:** Player, Đức "Tí Nổ", Minh Châu "Châu Tổng".
- **Bản đồ & Khu vực mở:** `map_thcs` (variant `g06`), gồm `zone.thcs.yard`, `zone.thcs.corridor`, `zone.thcs.classroom`.
- **Cảnh A — "Ngày đầu lớp 6" (Sân trường buổi sáng & Hành lang lớp 6A2):**
  - *Bước 1 (`q_m1_main_01.s01` - `talk`):* Player đi tìm bảng phân lớp, gió thổi bay cuốn vở học sinh xuống đất. Đức chạy tới nhặt hộ, làm quen và hăng hái dẫn đường: *"Yên tâm, để tớ dẫn. Tớ mới đi lạc có… hai lần thôi!"*.
  - *Bước 2 (`K4` - Giải mật lệnh):* Vào lớp, Đức chuyền mẩu giấy "mật lệnh tối mật". Châu ngồi bàn bên giật lấy, rút bút bi đỏ soi lỗi chính tả: *"Cấp cao đâu không thấy, chữ ông viết còn không đọc nổi. Đưa đây."* Đức gãi đầu: *"Ơ… dạ, Châu Tổng."* Biệt danh "Châu Tổng" chính thức ra đời.
  - *Bước 3 (`K5` - Đá cầu sân trường):* Giờ ra chơi, Đức rủ xuống sân đá cầu vòng tròn (`itr.thcs.shuttle_ring`). Minigame canh nhịp chuyền cầu qua lại 10 lượt. Lượt cuối Đức đá hụt cầu bay tọt vào bụi cây rậm.
  - *Bước 4 (`K6` - Trực nhật lớp học):* Cuối buổi, Player và Đức lau bảng đen (`itr.thcs.blackboard`), Châu kiểm tra bục giảng. Đức lỡ miệng: *"Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ."* Châu chỉnh ngay: *"Mới quen một bữa mà {g:ông|bà} mày tao rồi hả?"*
- **Cảnh B — "Mấy tháng sau" (Cuối học kỳ I, chiều tan học trước cổng trường):**
  - *Bước 5 (`K6` - Gói mì tôm cuối cùng):* Ba đứa ngồi ở bậc thềm tiệm tạp hóa cổng trường (`itr.thcs.snack_cart`). Góp tiền mua gói mì ăn liền cuối cùng. Người chơi thực hiện thao tác giữ chuột bóp vụn mì, rắc gói gia vị và lắc đều bịch. Châu phân xử dứt khoát: *"Chia đều. Không bàn cãi nữa."*
  - *Bước 6 (`K2` - Bức ảnh bộ ba đầu tiên):* Player cầm chiếc máy ảnh compact quay ngược ống kính tự chụp ảnh 3 đứa. Tấm đầu bị cụt nửa đầu Đức, tấm sau chụp lại trọn vẹn nụ cười rạng rỡ của bộ ba.
- **Kết thúc Trang:** Người chơi bấm "Giữ ảnh này". Nhận trang Album *"Ba đứa mình"* (`alb.d.g06.01.01`). Phòng 2026 xuất hiện mẩu giấy mật lệnh lồng trong khung kính nhỏ trên bàn học.

---

#### TRANG 2 (`d.g07.01`): THUYỀN GIẤY DƯỚI MÁI HIÊN (Đầu lớp 7, Chiều mưa 2015)
- **Kỷ vật dẫn vào:** Chiếc thuyền giấy phai màu, trên cánh buồm có chữ ký của 5 đứa và một dòng chữ nhòe nước (`art_m1_02`).
- **Nhân vật tham gia:** Player, Đức, Châu, và hai nhân vật mới: Quân "Bắp", Hạ "Mây" (lúc này học lớp 7A3 bên cạnh).
- **Cảnh duy nhất — "Lớp 7. Một chiều mưa lớn":**
  - *Bước 1 (`q_m1_main_02.s01` - `talk`):* Mưa rào tầm tã sau giờ tan trường, nước xối xả từ mái ngói đổ xuống rãnh thoát nước hành lang (`itr.thcs.gutter`). Đức và Châu đứng cãi nhau về bài tập hè.
  - *Bước 2 (`q_m1_main_02.s02` - `talk`):* Player phát hiện hai bạn học lớp bên đang ngồi xổm ở góc hiên: Hạ đang cẩn thận gấp thuyền giấy, Quân đứng chắn gió giữ giấy báo khỏi ướt.
  - *Bước 3 (`K4` / `choice` - Gấp thuyền & Viết điều ước `c_m1_02_wish`):* Hạ rủ cả nhóm cùng gấp thuyền thả trôi theo rãnh nước. Hạ bảo: *"Viết một điều ước lên buồm đi. Thuyền chạy tới đâu, điều ước theo tới đó."* Người chơi chọn 1 trong 3 điều ước:
    - `friendship` (Ấm áp): *"Mai mốt vẫn chơi chung vầy."*
    - `fun` (Rộn ràng): *"Lớp 7 vui hơn lớp 6."*
    - `secret` (Sâu lắng): *"Bí mật không nói ra."*
  - *Bước 4 (`K5` + Lái - Cuộc đua thuyền rãnh nước `rescue_boat`):* Thả 5 chiếc thuyền xuống rãnh nước chảy xiết dài 12m. Thuyền của Đức lật úp ngay khi vừa chạm nước. Thuyền của Quân (đáy rộng chắc chắn) **luôn về đích đầu tiên**. Thuyền của Hạ lướt đẹp nhất nhưng chậm. Người chơi lái thuyền của mình tránh rác và xoáy nước để về đích an toàn.
  - *Bước 5 (`q_m1_main_02.s05` - `cutscene` / `K2`):* Thuyền của Player trôi xa suýt rơi xuống cống, cả nhóm dùng que tre vớt lại. Năm đứa cùng ký tên lên cánh buồm thuyền của Hạ. Bấm máy chụp khoảnh khắc 5 chiếc thuyền dập dềnh trên dòng nước.
- **Kết thúc Trang:** Nhận trang Album *"Lần đầu đủ năm"* (`alb.d.g07.01.01`). Chiếc thuyền giấy xuất hiện trên bàn học phòng 2026 bên cạnh khung kính mật lệnh.

---

#### TRANG 3 (`d.g07.02`): CĂN CỨ BÍ MẬT (Lớp 7, Đầu HK II, 2016)
- **Kỷ vật dẫn vào:** Biển tên bằng gỗ ép vẽ chữ nguệch ngoạc "CĂN CỨ BÍ MẬT" và cuốn sổ tay học sinh bìa xanh ghi "LUẬT CĂN CỨ" (`art_m1_03`).
- **Nhân vật tham gia:** Đủ nhóm 5 người.
- **Cảnh A — "Góc sân sau trường gần nhà kho":**
  - *Bước 1 (`q_m1_main_03.s01` - `talk`):* Đức nảy ra ý tưởng nhóm 5 đứa cần một "đại bản doanh" riêng để tụ tập ăn vặt và bàn chuyện bí mật. Quân và Hạ chỉ ra góc sân sau gần nhà kho phế liệu (`zone.thcs.base`), nơi có bóng cây bàng lớn che mát và ít người qua lại.
  - *Bước 2 (`goto` - Khảo sát 3 điểm):* Đi kiểm tra góc mái bạt, gốc cây bàng và đống thùng carton cũ. Châu gật đầu: *"Hợp thì hợp, nhưng dọn trước đã. Bụi quá trời."*
  - *Bước 3 (`K3` / `minigame` - Dọn dẹp & Dựng Căn cứ `sweep_leaves`):* Quân khiêng chiếc bàn gỗ cũ hỏng một chân kê lại cho vững; Châu phân loại bìa carton; Hạ quét lá khô gom thành đống; Đức vẽ biển hiệu gỗ; Player lựa chọn phong cách trang trí (`c_m1_03_decor`):
    - `paper`: Dây hạc giấy màu rực rỡ treo trên bạt.
    - `flowers`: Cắm hoa dại và cành lá bàng mộc mạc.
    - `photos`: Kẹp những tấm ảnh chụp chung lên dây dù.
  - *Bước 4 (`K4` - Soạn thảo 5 Điều luật Căn cứ):* Năm đứa ngồi quanh chiếc bàn gỗ, cùng thảo luận và ghi vào cuốn sổ bìa xanh:
    1. Châu: *Không tự ý lấy đồ của người khác.*
    2. Đức: *Ăn hết đồ ăn vặt thì phải tự mua bù bịch mới.*
    3. Quân: *Ai tới Căn cứ trước thì quét dọn chỗ ngồi.*
    4. Hạ: *Ai có chuyện buồn thì cả nhóm không được bỏ đi.*
    5. Player: *Chụp ảnh thì phải đủ mặt cả năm đứa.*
  - *Bước 5 (`q_m1_main_03.s05` - `cutscene`):* Đóng chiếc biển tên "CĂN CỨ BÍ MẬT" lên thân cây bàng. Cả nhóm reo hò tuyên bố căn cứ chính thức đi vào hoạt động.
- **Kết thúc Trang:** Biển gỗ và cuốn sổ luật bìa xanh xuất hiện trên kệ sách phòng 2026. **Khu Vui Chơi Tuổi Thơ** tại Căn cứ chính thức được mở khóa từ đây.

---

#### TRANG 4 (`d.g07.03`): ĐỦ NĂM ĐỨA (Cuối lớp 7, Tháng 5/2016)
- **Kỷ vật dẫn vào:** Tấm ảnh nhóm bị ố vàng góc dưới do bảo quản lâu ngày (`art_m1_05`).
- **Nhân vật tham gia:** Đủ nhóm 5 người.
- **Cảnh A — "Gốc phượng sân trường & Cơn mưa rào đầu hạ":**
  - *Bước 1 (`q_m1_main_05.s01` - `talk`):* Buổi học cuối cùng của năm lớp 7. Ve bắt đầu kêu râm ran, hoa phượng nở đỏ rực góc sân. Đức hối hả giục chụp một bức ảnh kỷ niệm trước khi nghỉ hè.
  - *Bước 2 (`choice` - Lời hẹn hè `c_m1_05_tone`):* Cả nhóm trao nhau lời hẹn trước kỳ nghỉ hè 3 tháng:
    - `playful` (Rộn ràng): *"Năm sau đứa nào tới trễ phạt bao trà sữa!"*
    - `gentle` (Ấm áp): *"Nghỉ hè nhớ đạp xe qua nhà nhau chơi nghen."*
    - `deep` (Sâu lắng): *"Hy vọng lên lớp 8… tụi mình vẫn chơi thân như vầy."*
  - *Bước 3 (`K3` - Xếp chân máy ảnh):* Player đặt chiếc máy ảnh compact lên chân máy mini đặt trên ghế đá dưới gốc phượng (`itr.thcs.stone_bench`), căn chỉnh góc ngắm sao cho thấy trọn tán hoa phượng và 5 người.
  - *Bước 4 (`K2` - Chụp hẹn giờ 10 giây):* Bấm nút hẹn giờ, màn hình đếm ngược 10 giây, Player chạy vội vào vòng sáng vị trí đứng cạnh Quân và Hạ, bấm phím tạo dáng. Bức ảnh hoàn hảo được chụp lại.
  - *Bước 5 (`q_m1_main_05.s05` - `cutscene`):* Vừa chụp xong, một cơn mưa rào mùa hạ bất ngờ đổ sập xuống. Cả năm đứa ôm máy ảnh cười toe toét, nắm tay nhau chạy ào về Căn cứ bí mật trú mưa. Mưa tạnh nhanh, bầu trời phía trên sân trường hiện lên một dải cầu vồng rực rỡ.
- **Kết thúc Trang & KẾT THÚC BẢN DEMO MỐC 1 (05–15/12):** Bức ảnh chụp đủ 5 đứa được chọn làm **Ảnh Bìa chính thức của cuốn Album ký ức**. 
- *Điểm dừng playtest 04/12:* Về lại phòng 2026, Player mở điện thoại nhắn tin vào nhóm chat cũ: *"Ê. Nhớ hồi tụi mình mới đủ năm đứa không? Lâu quá rồi ha."*

---

### CHUYỂN MỐC · Phòng 2026 (Chuyển sang Mốc 2: Lớp 8–9)
Bức ảnh đủ năm đứa hiển thị trang trọng trên bìa Album. Một dòng chữ hiện ra: *"Mấy năm sau…"*. Dưới đáy thùng carton, một chiếc hộp phấn giấy đã móp méo phát sáng (`art_m2_01` / `KV-01`). Trên mặt trong nắp hộp phấn, nét chữ phấn học trò hơi mờ: đọc được chữ **"QUÂN – ĐỨC … (CHƯA XONG)"**, hai con số tỉ số còn nhòe chưa rõ. Player khẽ lẩm bẩm: *"Tỉ số mấy ta… nhòe hết rồi. Chưa xong… rồi có ai đánh tiếp đâu."* Người chơi chạm vào hộp phấn để mở ra ký ức Trang 5.

---

### MỐC 2 — LỚP 8–9: SỢ MẤT NHAU

#### TRANG 5 (`d.g08.01`): LÊN LỚP 8 (Khai giảng lớp 8, Tháng 9/2016)
- **Kỷ vật dẫn vào:** Hộp phấn giấy móp **KV-01**, bên trong còn sót đúng một mẩu phấn trắng cụt lủn, nắp ghi tỉ số caro.
- **Cảnh A — "Lễ khai giảng năm học mới":**
  - *Bước 1 (`talk` - Tìm 4 người bạn):* Trường chia lại lớp, may mắn cả 5 đứa được xếp chung vào lớp 8A do cô Diệp chủ nhiệm. Player đi quanh sân gặp từng bạn:
    - Gặp Đức tại xe quà vặt cổng trường (`zone.thcs.gate`), đang mải mê chơi lật chai nước suối: *"Ê! Chai này đứng được năm lần liền, ghê chưa?"*
    - Gặp Châu ở bảng tin hành lang: *"Tui dò danh sách rồi, chung lớp hết. Tui dò ba lần lận đó!"*
    - Gặp Quân đang bơm bóng rổ ở góc sân: *"May quá… năm nay đủ năm đứa."*
    - Gặp Hạ dưới gốc phượng: *"Lá đầu năm. Năm nào Hạ cũng ép một chiếc lá đầu năm vào tập."*
  - *Bước 2 (`K2` - Ảnh khai giảng):* Nhờ bạn học cùng lớp chụp giùm tấm ảnh 5 đứa đứng nghiêm trang dưới cờ hoa khai giảng.
- **Cảnh B — "Chiều trực nhật cuối buổi & Ván cờ caro trên bảng đen":**
  - *Bước 1 (`K6` / `choice` - Phân công trực nhật `c_m2_01_partner`):* Phòng học ngập tràn ánh nắng chiều vàng rực. Châu cầm sổ chia việc. Player chọn cặp: lau bảng cùng Đức (lau ẩu mà nhanh), lau bảng cùng Hạ (lau cẩn thận từng ô), hoặc kê bàn ghế cùng Quân.
  - *Bước 2 (`mg_caro` - Ván cờ Caro chơi thật):* Bảng đen vừa lau sạch bóng, Đức rút mẩu phấn cuối cùng trong hộp phấn móp ra kẻ ô: *"Bảng sạch vầy mà không xài thì phí. Làm một ván caro thôi, đứa nào thua phải lau bảng!"* Người chơi chơi thật một ván cờ caro 12×12 trên bảng đen với AI của Đức hoặc Quân.
  - *Bước 3 (`cutscene` - Bác bảo vệ nhắc khóa cổng):* Trận đấu đang gay cấn thì tiếng chùm chìa khóa lách cách ngoài hành lang vang lên. Bác bảo vệ ló đầu vào: *"Mấy đứa kia! Sắp khóa cổng trường rồi, giờ này bảng còn trắng xóa thế hả?"* Đức cuống cuồng: *"Khoan khoan bác ơi, ván này chưa phân thắng bại!"* Châu giật mẩu phấn, ghi vội tỉ số vào mặt trong nắp hộp phấn: *"Ghi tỉ số lại, mai đánh tiếp."*
  - *Bước 4 (`K2` - Chụp ảnh bàn caro):* Player rút máy ảnh chụp lại bàn cờ caro dang dở trước khi xóa bảng (`alb.d.g08.01.01` - Ảnh chính).
  - *Bước 5 & 6 (`K6` / `K3`):* Hai đứa hối hả lau sạch bảng, nhặt mẩu phấn cụt bỏ lại vào hộp phấn móp rồi chạy vội ra cổng trường trước khi bác bảo vệ tra chìa khóa vào ổ.
- **Kết thúc Trang:** Tấm ảnh bàn cờ caro được dán lên tường phòng 2026. Hộp phấn móp đặt trên bàn học, dòng chữ tỉ số lúc này đã hiện rõ theo kết quả ván chơi: **"QUÂN 4 – ĐỨC 3 (CHƯA XONG)"** (hoặc 3–4 tùy ván đấu).

---

#### TRANG 6 (`d.g08.02`): VALENTINE — HÒM THƯ CỦA NĂM ĐỨA (Tháng 2/2017)
- **Kỷ vật dẫn vào:** Tờ giấy vẽ chiếc lá bằng bút chì của Hạ, góc dưới ghi dòng chữ nắn nót: *"Chưa dám đưa."* (`art_m2_02`).
- **Hook 2026:** `{player_name}`: *"Chiếc lá của Hạ… Hạ nhờ mình giữ từ hồi lớp 8. Tới giờ mình vẫn chưa biết là vẽ cho ai."*
- **Cảnh A — "Sáng thứ Năm (9/2/2017) · Confession & Ba lần trêu chọc":**
  - *Bước 1 (`cutscene`):* Căn cứ trước giờ vào học. Đức mang lén chiếc điện thoại cũ của anh trai vào trường, lướt trang confession trường. Cả trường đang xôn xao mùa Valentine. Có một bài viết ẩn danh gửi cho "bạn nam hay ngồi đọc sách ở thư viện".
  - *Bước 2 (`cutscene` / `choice` - Ba lần trêu chọc):* Đức lập tức đoán ra người viết là Hạ. 
    - Lần 1 (Hành lang): Đức đọc to bài viết, trêu: *"Bạn thư viện ơi~"*. Hạ đỏ mặt chạy vội vào lớp.
    - Lần 2 (Trong lớp): Đức lén vẽ chiếc lá và hình trái tim lên góc bảng đen. Cô Diệp bắt gặp và phạt Đức chiều thứ Sáu ở lại quét sân.
    - Lần 3 (Ghế đá sân trường giờ ra chơi): Đức tiếp tục đùa cợt trước mặt bạn bè. Hạ nghẹn ngào đặt bịch bánh xuống bàn rồi đứng dậy bỏ đi. Quân lập tức chặn tay Đức: *"Đức. Dừng lại."* Châu nghiêm mặt: *"Ba lần. Tui đếm đủ ba lần rồi đó. Chiều nay họp khẩn ở Căn cứ!"*
  - *Bước 3 (`talk` - Kế hoạch xin lỗi):* Tại Căn cứ, Châu phân tích: lỗi không phải vì đoán ra, mà là trêu chọc ba lần khi bạn đã khó chịu. Đức ân hận: *"Tao nói trước nghĩ sau. Chắc phải viết ra giấy thì tao mới nghĩ đàng hoàng được..."*
  - *Bước 4 (`goto` & `choice` - Giữ hộ chiếc lá):* Player đi tìm Hạ dưới gốc phượng, lắng nghe Hạ tâm sự và nhận giữ hộ tờ giấy vẽ chiếc lá chưa kịp gửi.
- **Cảnh B — "Sáng thứ Sáu (10/2/2017) · Làm Hòm Thư & Bức Thư Xin Lỗi Chân Thành":**
  - *Bước 1 (`cutscene`):* Đức đem đến chiếc hộp giày cũ, đề xuất cả nhóm làm một hòm thư riêng đặt tại Căn cứ để mọi người bỏ thư cho nhau. Châu đặt ra bảng nội quy 3 điều nghiêm ngặt.
  - *Bước 2 (`mg_mailbox_craft` - Minigame làm hòm thư 5 bước):* Chọn màu giấy bọc hộp, dán kín 3 mặt, trang trí sticker tim sao, khoét khe thư, gắn ngăn chung của Hạ và đóng bảng nội quy.
  - *Bước 3 (`mg_apology_letter` - Bức thư xin lỗi của Đức):* Đức nắn nót viết một bức thư riêng gửi Hạ bỏ vào khe hòm: *"Tao trêu mày cả ngày, mày bỏ đi tao vẫn trêu... Tao nói trước nghĩ sau. Từ giờ tao không bao giờ nhắc lại nữa. Cho tao xin lỗi."*
  - *Bước 4 (`talk`):* Hạ đứng ở góc hiên đọc bức thư riêng, xúc động quay lại tha thứ cho Đức.
  - *Bước 5 (`photo`):* Chiều tan học, chụp tấm ảnh Đức vui vẻ cầm chổi quét sân chịu phạt (`alb.d.g08.02.02` - Ảnh phụ). Tú lớp bên hỏi tò mò nhưng Đức kiên quyết giữ kín bí mật: *"Không biết, mà biết tao cũng hổng nói!"*
- **Cảnh C — "Thứ Hai (13/2/2017) · Tiết Toán":**
  - Quân buồn bã vì nhận bài kiểm tra 15 phút điểm kém. Player ra sân bóng rổ giảng lại bài toán phương trình bậc nhất cho Quân. Quân mỉm cười vẽ tặng Player một mặt cười ở góc tập nháp.
- **Cảnh D — "Thứ Ba (14/2/2017) · Valentine — Mở Hòm Thư":**
  - *Bước 1 (`UI_LETTER_PICKER`):* Sáng Valentine, Player viết thư bỏ vào hòm: chọn người nhận (Đức / Châu / Quân / Hạ / Cả nhóm) và chọn nội dung thư (Cảm ơn / Trêu chọc / Rủ làm việc chung).
  - *Bước 2 (`talk`):* Giờ ra chơi, các bạn mở ngăn riêng đọc thư trong niềm vui bất ngờ.
  - *Bước 3 (3 Minigame đầy đủ buổi chiều):* Tùy bức thư của Player:
    - Nếu rủ Quân: Cùng chơi **Ném bóng tính điểm** (`mg_ball_toss`) tại cột rổ Z02.
    - Nếu rủ Hạ: Cùng đi một vòng sân trường chơi **Săn góc ảnh** (`mg_photo_hunt`) theo lưới 3×3.
    - Nếu rủ cả nhóm hoặc gửi thư cảm ơn: Cùng chơi **Trang trí Căn cứ** (`mg_base_decor`) và chơi trò hỏi đáp "Đoán xem ai là người...".
  - *Bước 4 (`cutscene`):* Chiều tà, cả 5 đứa quây quần quanh hòm thư ở Căn cứ nghe đọc các bức thư chung. Đức giữ đúng lời hứa không bao giờ nhắc lại chuyện cũ.
  - *Bước 5 (`K2` - Ảnh chính):* Cả năm đứa đứng sát cạnh hòm thư tình bạn, bấm máy hẹn giờ chụp bức ảnh nhóm kỷ niệm ngày Valentine (`alb.d.g08.02.01`).
- **Kết thúc Trang:** Tấm ảnh nhóm bên hòm thư được phục hồi trong Album. Chiếc hòm thư đứng vững chắc tại Căn cứ suốt từ Trang 6 đến hết Trang 9.

---

#### TRANG 7 (`d.g09.01`): TỜ BÁO TƯỜNG CUỐI CÙNG (Lớp 9, Tháng 9–11/2017)
- **Kỷ vật dẫn vào:** Bản báo tường thu nhỏ khổ A5 chép tay, góc dưới còn chừa một ô trống nhòe vệt sáp màu (`art_m2_03`).
- **Cảnh A — "Đầu năm lớp 9 · Bảng đếm ngược 270 ngày & Phiếu nguyện vọng":**
  - *Bước 1 (`cutscene`):* Bảng lớp ghi con số đếm ngược: 270 ngày nữa thi vào lớp 10. Cô Diệp phát phiếu khảo sát nguyện vọng chọn trường cấp 3 và thu hũ slime của Đức.
  - *Bước 2 (`mg_sudoku`):* Châu phát cho mỗi đứa một bài toán Sudoku 9×9 trên giấy kẻ ô li để "ôn luyện tư duy", bấm giờ thi đấu 6 phút.
  - *Bước 3 (`talk` & `choice` `c_m2_07_reason`):* Năm đứa điền phiếu nguyện vọng:
    - Châu: *"Trường Chuyên. Không phải muốn, mà là phải đậu."*
    - Quân: *"Tớ thi trường công gần chợ thôi, sức tớ học tới đó."*
    - Đức: *"Tao tính thi Năng khiếu vẽ… mà nhà tao đang tính chuyện gì đó chưa biết."*
    - Hạ & Player: Cùng chọn trường cấp 3 công lập gần nhà có hàng cây phượng mát.
- **Cảnh B — "Làm tờ báo tường 20/11 & Tranh cãi nổ ra":**
  - *Bước 4 (`K3` - Dán báo tường):* Cả nhóm cùng làm tờ báo tường cuối cùng của đời học sinh cấp 2: Châu kẻ khung phân ô, Hạ viết chữ tiêu đề bằng hoa khô, Quân dán viền, Đức phụ trách "Góc cười", Player chọn 3 tấm ảnh dán vào mục Kỷ niệm.
  - *Bước 5 (`talk` & `choice` `c_m2_07_reaction`):* Bất đồng nổ ra khi chọn tiêu đề. Đức gắt gỏng khi biết Hạ và Player học chung trường, trong khi nhóm sắp tan tác mỗi người một ngả. Châu đáp trả gay gắt vì áp lực thi cử đè nặng. Hạ nghẹn ngào can ngăn. Người chơi đứng trước ngã rẽ cảm xúc:
    - Im lặng đưa chổi cho Quân quét giấy vụn (`gentle`).
    - Hoặc cất tiếng nói thật lòng: *"Mình cũng sợ… sợ mai mốt lớn lên rồi không ai còn nhớ rủ ai nữa."* (`deep` — **Lưu cờ `m2.player_honest = true`**).
- **Cảnh C — "Cây bút highlight của Châu & Ô trống để dành":**
  - *Bước 6 (`goto` & `talk`):* Hai hôm sau, Châu nhận bài kiểm tra điểm 8,75 (điểm số thấp nhất từ trước tới nay của cô học sinh giỏi), một mình trốn ra Căn cứ ngồi khóc. Player tìm thấy Châu, ngồi im lặng bên cạnh sẻ chia. Châu đưa cho Player cây bút highlight màu vàng đã cạn mực: *"Cầm giùm tui. Tui nhìn thấy nó là lại muốn tô bài học tiếp... Đừng kể ai nghe nghen."*
  - *Bước 7 (`K3` / `K2`):* Báo tường được hoàn thiện treo lên lớp. Góc cười của Đức chỉ vỏn vẹn một dòng mực đen: *"Hôm nay không có chuyện cười."* Góc dưới cùng còn để trống một ô vuông. Bốn người bạn đặt 4 bàn tay lên 4 góc tờ báo tường, Player chụp tấm ảnh kỷ niệm (`alb.d.g09.01.01`). Player cẩn thận chép một bản A5 thu nhỏ kẹp vào cuốn sổ của mình.
- **Kết thúc Trang:** Trang Album "Báo tường" phục hồi với hình ảnh cây bút highlight vàng. Bản A5 xuất hiện trên góc tường phòng 2026.

---

#### TRANG 8 (`d.g09.02`): RÃ BĂNG (HK II lớp 9, Tháng 1 & Tháng 3/2018)
- **Kỷ vật dẫn vào:** Tờ lịch bloc ngày 27 tháng 1 năm 2018 khoanh mực đỏ ghi hoa chữ "CHUNG KẾT" (`art_m2_04`).
- **Hook 2026:** `{player_name}`: *"Ngày 27… À. Cái chiều cả tiệm tạp hóa la muốn sập mái."*
- **Cảnh A — "Thứ Bảy, 27 tháng 1 năm 2018 · Tuyết trắng Thường Châu":**
  - *Bước 1 (`K6` - Tô cờ đỏ sao vàng `mg_flag_color`):* Trận chung kết U23 châu Á diễn ra giữa trời bão tuyết. Năm đứa tụ tập trước tiệm tạp hóa cổng trường (`itr.thcs.grocery`). Player và Hạ cùng tô cờ đỏ sao vàng bằng sáp màu; Hạ vẽ ngôi sao vàng lên má Quân.
  - *Bước 2 (`K3` - Xếp 5 chiếc ghế nhựa `mg_chair_row`):* Người chơi sắp xếp 5 chiếc ghế nhựa đỏ cạnh nhau. Ghế xếp vừa khít khiến Đức và Châu (vốn giận nhau từ đợt báo tường) buộc phải ngồi sát vai nhau.
  - *Bước 3 (`K5` - Cổ vũ theo tiếng trống `mg_cheer_rhythm`):* Trận đấu nghẹt thở 120 phút. Cả tiệm tạp hóa hò reo theo nhịp trống. Dù đội tuyển thua ở phút cuối, Đức và Châu bất giác quay sang cười với nhau, mọi giận hờn tan biến theo tuyết trắng.
  - *Bước 4 (`K2`):* Chú chủ tiệm chụp hộ 5 đứa tấm ảnh trước màn hình tivi CRT. Đức xin chú tờ lịch ngày 27 đưa Player giữ làm kỷ niệm.
- **Cảnh B — "Đêm Hội trại lớp 9 (Tháng 3/2018) · Bên ánh lửa than hồng":**
  - *Bước 5 (`choice` - Chọn cổng trại `c_m2_08_camp_gate`):* Dựng lều trại tại sân trường ban đêm (`zone.thcs.yard`). Chọn 1 trong 3 kiểu cổng trại: Cổng tên lửa (`rocket`), Cổng chiếc lá (`leaf`), hoặc Cổng thường (`regular`).
  - *Bước 6 (`talk` - Giãi bày tâm sự quanh bếp than):* Năm đứa quây quần quanh bếp than nhỏ nướng bắp (`PRP_CHARCOAL_STOVE`).
    - Đức xin lỗi chuyện nổi nóng đợt báo tường, thú thật gia đình sắp dọn nhà sang quận khác xa lắc.
    - Châu trút bỏ gánh nặng điểm số, thừa nhận hôm đó mình quá khắt khe. Nếu ở Trang 7 Player đã nói thật lòng, Châu nhắc lại: *"Hôm đó [ÔNG_BÀ] nói cũng sợ xa nhau… tui nhớ mãi câu đó."*
    - Quân nướng bắp chia cho từng đứa: *"Mai mốt khác trường… cần bê vác gì cứ ới tớ một tiếng nghen."*
    - Hạ lo sợ: *"Lên cấp 3 Hạ với {player_name} học chung, chỉ sợ hai đứa quen đi chung rồi… quên mất ba người kia."*
    - Player chọn lời đáp (`c_m2_08_campfire_reply`): Hứa sẽ chủ động hẹn gặp nhau hàng tháng.
  - *Bước 7 (`K2` - Chụp ảnh quanh bếp lửa):* Đặt máy ảnh lên khúc gỗ, hẹn giờ chạy vào ngồi quanh ánh than hồng ấm áp (`alb.d.g09.02.01` - Ảnh chính).
- **Cảnh C — "Sáng hôm sau":** Dọn dẹp cọc lều, chia tay ra về qua cổng sắt trường.
- **Kết thúc Trang:** Tấm ảnh đêm lửa trại được phục hồi. Lá cờ giấy tô màu sáp được cắm vào hộp bút trên bàn phòng 2026.

---

#### TRANG 9 (`d.g09.03`): VẪN ĐỦ NĂM ĐỨA (Cuối lớp 9, Tháng 5/2018)
- **Kỷ vật dẫn vào:** Cuốn sổ lưu bút học sinh bìa nâu kraft (`art_m2_05`).
- **Cảnh A — "Sau lễ bế giảng lớp 9":**
  - *Bước 1 (`mg_sign_shirt` / `talk`):* Cả khối 9 ùa ra sân ký tên lên áo trắng đồng nghiệp và viết lưu bút.
    - Đức ký nét xoay vòng tròn: *"Cảm ơn mày đã chụp tao lúc ngố nhất. Đừng xóa tấm nào nghen!"*
    - Quân nắn nót từng chữ: *"Cảm ơn cậu đã giảng Toán cho tớ. Tớ làm được rồi."*
    - Châu gạch chân 4 màu: *"Mục tiêu: Gặp nhau ít nhất mỗi tháng một lần. Lý do: Không cần lý do nào khác!"*
    - Hạ kẹp vào trang sổ một nhành lá phượng ép khô.
    - Cô Diệp chủ nhiệm ghi dòng chữ xúc động: *"Cảm ơn em vì những tấm ảnh chụp cho cả lớp suốt hai năm qua. Mà tấm nào chụp… cũng thiếu mất mặt em đó."*
- **Cảnh B — "Chiều tà tại Căn cứ & Viên bi mắt mèo":**
  - *Bước 2 (`goto` & `talk`):* Cả nhóm ra Căn cứ dọn dẹp đồ đạc. Hạ tìm thấy cuốn sổ luật bìa xanh lớp 7 còn bỏ trống từ Điều 5.
  - *Bước 3 (`talk`):* Đức rút ra 5 viên bi ve mắt mèo trong veo chia cho mỗi người một viên: *"Cầm viên bi này lên nhìn qua mắt mèo thì sẽ luôn thấy mặt tụi mày. Tao nói thật đó!"* Đức chính thức thông báo nhà đã chuyển xong, Đức đổi nguyện vọng thi vào trường cấp 3 công lập gần chợ để đi học chung đường với Quân. Châu lặng người xúc động.
- **Cảnh C — "Hoàng hôn gốc phượng · Điều 6 & Năm dấu vân tay":**
  - *Bước 4 (`mg_rule6` - Soạn Điều 6 vào sổ luật):* Dưới gốc phượng, Châu mở cuốn sổ luật, đặt bút viết:
    - **Điều 6:** *Gặp nhau ít nhất mỗi tháng một lần. Được dời, không được hủy!*
    - Điều 6.1 (Đức): *Đứa nào đến trễ phạt bao trà sữa.*
    - Điều 6.2 (Đức): *Đứa nào học trường xa nhất phải kể chuyện lạ nhất (ám chỉ Châu trường Chuyên).*
    - Điều 6.3 (Quân): *Cần bê vác gì thì cứ gọi.*
    - Điều 6.4 (Hạ): *Ai im lặng quá lâu thì cả nhóm phải cùng tới ngồi cạnh.*
    - Điều 6.5 (Player): *Quy tắc chụp ảnh thì phải đủ mặt cả năm đứa vẫn giữ nguyên hiệu lực.*
    Năm đứa cùng ký tên vào sổ. Châu trao lại cuốn sổ luật cho Player cất giữ.
  - *Bước 5 (`K2` - Bức ảnh nhóm cuối cấp 2):* Đặt máy hẹn giờ 10 giây. Quân cõng Đức chạy vội vào khung hình. Người chơi chọn phong cách ảnh (`c_m2_09_main_photo`: Nghiêm trang / Đức làm trò hề / Cả nhóm cười tự nhiên không nhìn máy).
  - *Bước 6 (`mg_fingerprint` - Điền ô trống trên bản A5):* Player mở bản báo tường A5 cũ. Mỗi người dùng sáp màu ấn một dấu vân tay của mình vào ô trống còn lại: Hạ (xanh lá), Châu (đỏ), Quân (vàng), Đức (xanh dương), Player (nâu). Châu mỉm cười: *"Lỗi bố cục ngày xưa… cuối cùng tụi mình cũng sửa xong rồi."*
- **Cutscene "Cuối hè — Ba ngã rẽ cổng trường":**
  - Khung cảnh 1: Hạ đứng chờ ở cổng trường cấp 3 công lập, Player đạp xe tới mỉm cười vẫy tay.
  - Khung cảnh 2: Quân đèo Đức trên chiếc xe đạp cà tàng tới cổng trường huyện bên chợ, Đức kẹp cây bút bi sau tai.
  - Khung cảnh 3: Châu đứng một mình trước cổng trường THPT Chuyên to lớn, điện thoại trong túi bỗng rung lên tin nhắn của Đức: *"Tháng này hẹn ngày nào tụi mày?"*. Mỗi người khẽ chạm viên bi mắt mèo vào cột cổng trường trước khi bước vào năm học mới.
- **Kết thúc Trang:** Chiếc áo trắng học trò đầy chữ ký được treo trên mắc áo phòng 2026. Viên bi mắt mèo nằm trên bậu cửa sổ hứng nắng sớm.

---

### KẾT DEMO · Phòng 2026 (Hiện tại)
- Cuốn Album trên bàn đã phục hồi đầy đủ 9 trang ký ức rực rỡ.
- Người chơi tiến lại kệ sách (`itr.hub.shelf`), lấy cuốn sổ luật bìa xanh xuống, lật giở đến Điều 6 với 5 chữ ký mực tím năm nào. Player trầm ngâm: *"Được dời, không được hủy… Tụi mình dời hơi lâu rồi ha."*
- Mở chiếc điện thoại thông minh (`panel-phone`), tìm thấy nhóm chat cũ "Căn cứ Bí mật" với tin nhắn cuối cùng đã trôi qua nhiều năm.
- Người chơi chọn 1 trong 3 thông điệp để gửi:
  - **Sắc thái Rộn ràng (`playful`):** *"Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ không?"* (Tỉ số được lấy tự động từ kết quả ván cờ Trang 5 đã lưu).
  - **Sắc thái Ấm áp (`gentle`):** *"Mình mới lục ra cuốn sổ luật Căn cứ ngày xưa nè. Mọi người dạo này sao rồi?"*
  - **Sắc thái Sâu lắng (`deep`):** *"Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha..."*
- Bấm nút **Gửi**. Màn hình hiện dòng trạng thái: *"Đã gửi."* ... *" (còn tiếp)"*. 
- Hệ thống tự động ghi nhận hoàn thành demo (`public_demo_completed`) rồi mở biểu mẫu khảo sát phản hồi người chơi.

---

## 4. Hồ sơ Chi tiết Nhóm 5 Nhân Vật Chính & Các NPC Quan Trọng

### 4.1 Bảng hồ sơ 5 nhân vật chính
| Nhân vật / ID | Vai trò & Archetype | Đặc điểm ngoại hình & Dấu hiệu nhận diện | Tính cách đặc trưng (Lớp 6–9) | Nỗi lo lắng thầm kín (Hidden Worry) | Vật phẩm biểu tượng |
|---|---|---|---|---|---|
| **Player** (`chr_player`, `{player_name}`) | Người gìn giữ kỷ niệm, "chất keo gắn kết" cả nhóm | Nhân vật nam/nữ semi-chibi cao 1,30–1,40m (lớp 6–7) và 1,55–1,65m (lớp 8–9). Luôn đeo chiếc máy ảnh compact bên hông, cầm cuốn sổ tay nhỏ | Trầm tính, tinh tế, hay quan sát, biết lắng nghe người khác; ít nói về bản thân | Sợ thời gian trôi đi, sợ khi lớn lên ai cũng bận rộn rồi dần quên mất nhau | Máy ảnh compact, sổ tay học sinh bìa nhỏ |
| **Đức "Tí Nổ"** (`chr_duc`) | Người khuấy động, khởi xướng mọi trò chơi | Thân hình gầy gò, tóc cắt dựng đứng, tay thoăn thoắt xoay bút bi, túi quần luôn cộm những viên bi ve | Ồn ào, nghịch ngợm, hành động trước khi suy nghĩ, hay trêu chọc quá trớn; nhưng chân thành, dám nhận sai và biết xin lỗi thật lòng | Giấu chuyện gia đình khó khăn sắp phải chuyển nhà sang quận khác xa bạn bè | Bút bi bấm, bi ve mắt mèo, chai nước suối lật chai |
| **Quân "Bắp"** (`chr_quan`) | Người bảo bọc, che chở thầm lặng | Thể hình cao lớn nhất nhóm, tóc cắt cua gọn gàng, bàn tay to khỏe, thường ôm quả bóng rổ cũ | Hiền lành, ít nói, chân chất, đáng tin cậy, luôn sẵn sàng giúp đỡ bạn bè bằng hành động thay vì lời nói | Tự ti về học lực chậm chạp, sợ mình trở thành gánh nặng của nhóm | Quả bóng rổ cũ, que tre, bắp nướng |
| **Minh Châu "Châu Tổng"** (`chr_chau`) | Người lập kế hoạch, "bộ não" tổ chức | Dáng vẻ chỉn chu, tóc buộc đuôi ngựa gọn gàng, đeo đồng hồ đeo tay, cặp sách chia ngăn khoa học với đủ loại bút bi nhiều màu | Nghiêm khắc, tỉ mỉ, có tố chất lãnh đạo, ghét sự bừa bãi và sai chính tả; bên trong ấm áp, giàu tình cảm | Áp lực đè nặng từ kỳ vọng gia đình phải luôn đứng nhất lớp và đỗ trường Chuyên | Đồng hồ đeo tay, sổ tay chia ngăn, bút highlight vàng |
| **Hạ "Mây"** (`chr_ha`) | Tâm hồn nghệ sĩ, người gắn kết cảm xúc | Mái tóc dài thắt bím hoặc cài kẹp tóc hoa phượng, hay mặc áo đồng phục rộng, tay cầm tập vẽ | Dịu dàng, mơ mộng, giàu lòng trắc ẩn, hay nhặt cánh hoa ép vào tập và vẽ hình chiếc lá ở mép vở | Sợ bị lãng quên; sợ khi lên cấp 3 chỉ có mình và Player chung trường rồi sẽ quên mất ba bạn còn lại | Kẹp tóc hoa phượng, sổ vẽ, chiếc lá ép khô |

### 4.2 Nhân vật phụ (NPCs)
- **Cô Diệp chủ nhiệm (`CHR_NPC_DIEP`):** Giáo viên chủ nhiệm lớp 8A và 9A. Nghiêm khắc nhưng nhân từ và thấu hiểu học trò. Dòng bút tích cuối năm lớp 9 của cô dành cho Player là một điểm chạm cảm xúc lớn của game.
- **Bác bảo vệ trường (`CHR_NPC_GUARD`):** Xuất hiện ở Trang 5 với chùm chìa khóa lách cách, giục nhóm học sinh về đóng cổng trường, tạo nên tình huống kết thúc ván caro dang dở.
- **Chú chủ tiệm tạp hóa cổng trường (`CHR_NPC_SHOPKEEPER`):** Người mở tivi cho học sinh xem bóng đá U23 chiều mưa tuyết ở Trang 8, cho Đức tờ lịch ngày 27/1 và chụp tấm ảnh kỷ niệm giùm cả nhóm.
- **Tú (`CHR_NPC_TU`):** Bạn cùng lớp tò mò gặng hỏi Đức về người viết confession thư viện ở Trang 6, tạo cơ hội cho Đức chứng minh việc giữ lời hứa không tiết lộ bí mật của bạn.
- **"Bạn hay ngồi ở thư viện":** Nhân vật trong bài viết confession của Hạ ở Trang 6. **Tuyệt đối không lộ diện, không có model**, không thuộc nhóm bạn 5 người, chỉ đóng vai trò là một rung động tuổi mới lớn thoáng qua.

---

## 5. Quy chuẩn Hệ thống Đại từ Xưng Hô Miền Nam Đặc Thù

> **Quyết định cốt lõi (CONFIRMED 19/11):** Bãi bỏ quy tắc xưng hô "cậu – tớ" đồng nhất cho cả nhóm. Thiết kế game áp dụng chuẩn hệ thống xưng hô chân thực của học trò miền Nam giai đoạn 2014–2018.

| Người nói | Đại từ tự xưng | Cách gọi người nghe | Ngữ cảnh & Tiến trình thay đổi |
|---|---|---|---|
| **Đức** | `tớ` (mới quen) → `tao` (khi thân) | `cậu` → `mày` | Ở Trang 1 xưng "cậu – tớ", cuối buổi trực nhật lỡ miệng "mày – tao" rồi quen dần. Lên lớp 8–9 xưng "mày – tao" với cả 4 bạn một cách thân mật, tự nhiên. |
| **Minh Châu** | `tui` | `ông` (khi Player nam) / `bà` (khi Player nữ), gọi các bạn khác là `ông Đức`, `ông Quân`, `Hạ` | Giọng điệu của "chị đại" tổ trưởng miền Nam: thẳng thắn, dứt khoát nhưng quan tâm chu đáo. |
| **Hạ** | Tự xưng tên `Hạ` | Gọi tên bạn bè: `{player_name}`, `Đức`, `Quân`, `Châu` | Nhẹ nhàng, nhu mì, tạo cảm giác thân thiết và được bảo bọc. |
| **Quân** | `tớ` | `cậu` | Điềm đạm, mộc mạc, tôn trọng bạn bè, ít khi dùng lời thô tục hay xưng hô mày tao sỗ sàng. |
| **Player** | Linh hoạt theo đối tượng | Gọi tương ứng với người đang đối thoại | Thể hiện sự hòa hợp và là cầu nối trung gian giữa các cá tính khác biệt. |

*Các từ đệm miền Nam được lồng ghép tự nhiên:* "nè", "nghen", "nha", "hông", "lẹ lên", "vầy nè", "dữ dằn chưa", "trời đất ơi".

---

## 6. Danh Mục Sự Kiện (Events), Hệ Thống Phân Nhánh (Branching Flags) & Điều Kiện Mở Khóa / Kết Thúc

### 6.1 Ma trận biến cờ lưu trữ (Game State Flags)
Mọi lựa chọn của người chơi không bao giờ dẫn đến ngõ cụt hay trạng thái thất bại (Game Over). Hệ thống chỉ lưu lại các cờ trạng thái quan trọng để phản chiếu lời thoại và hình ảnh về sau:

| Tên biến cờ (`Flag ID`) | Kiểu dữ liệu | Thiết lập ở đâu | Ảnh hưởng và sử dụng lại ở đâu |
|---|---|---|---|
| `c_m1_02_wish` | `'friendship' \| 'fun' \| 'secret'` | Trang 2 (Lời ước trên buồm) | Dòng đề từ mặt sau trang Album Trang 2; được nhắc lại trong hồi tưởng. |
| `c_m1_03_decor` | `'paper' \| 'flowers' \| 'photos'` | Trang 3 (Trang trí Căn cứ) | Quyết định biến thể visual trang trí của Căn cứ ở Trang 4, 7, 9. |
| `c_m1_05_tone` | `'playful' \| 'gentle' \| 'deep'` | Trang 4 (Lời hẹn cuối lớp 7) | Lời thoại mở đầu Trang 5 khi gặp lại sau hè. |
| `m2.partner` | `'duc' \| 'ha' \| 'quan'` | Trang 5 (Cặp trực nhật lớp 8) | Phân nhánh đối thoại và minigame trực nhật ở Trang 5 Cảnh B. |
| `minigames.caro.series` | `{ quan: number, duc: number }` | Trang 5 (Ván cờ Caro) | Quyết định con số khắc trên nắp hộp phấn `KV-01` và số liệu hiển thị trong tin nhắn Kết Demo. |
| `story.valentine.recipient` | `'duc' \| 'chau' \| 'quan' \| 'ha' \| 'group'` | Trang 6 (Người nhận thư) | Mở nhánh minigame buổi chiều Valentine (nhánh riêng hoặc nhánh chung). |
| `story.valentine.kind` | `'thanks' \| 'tease' \| 'invite'` | Trang 6 (Loại thư gửi) | Quyết định biểu cảm nhận thư giờ ra chơi và câu thoại kết buổi tối của bạn nhận. |
| `story.valentine.boxStyle` | `{ bg: string, pattern: string }` | Trang 6 (Làm hòm thư) | Quyết định hình dạng 3D của Hòm thư Valentine đứng ở Căn cứ suốt Trang 7 và Trang 9. |
| `m2.player_honest` | `boolean` | Trang 7 (Báo tường: nói thật) | Nếu `true`, Châu sẽ nhắc lại câu nói này trong cuộc trò chuyện đêm lửa trại Trang 8. |
| `m2.gate` | `'rocket' \| 'leaf' \| 'regular'` | Trang 8 (Cổng hội trại) | Quyết định mô hình cổng trại 3D xuất hiện trong bức ảnh lửa trại ban đêm. |
| `m2.photo_style` | `'standard' \| 'funny' \| 'candid'` | Trang 9 (Ảnh nhóm cuối lớp 9) | Lựa chọn bức ảnh hiển thị trong khung ảnh chính của trang Album Trang 9. |
| `end_message_tone` | `'playful' \| 'gentle' \| 'deep'` | Kết Demo (Tin nhắn gửi đi) | Thu thập sắc thái tin nhắn ẩn danh trên Firebase Analytics. |

### 6.2 Nguyên tắc phân nhánh Trang 6 (Valentine Mailbox Branching)
Trang 6 có hệ thống nhánh phong phú nhất game với 17 lựa chọn gửi thư ban đầu:
- Nếu gửi riêng cho Đức, Châu, Quân hoặc Hạ với loại thư **"Rủ làm việc chung" (`invite`)**: Buổi chiều sẽ kích hoạt nhánh hoạt động riêng tương ứng với người đó (Ném bóng rổ cùng Quân, Săn góc ảnh cùng Hạ, Kèo ăn vặt cùng Đức, hoặc Mua sắm cùng Châu).
- Nếu gửi thư **"Cảm ơn" (`thanks`)**, **"Trêu chọc" (`tease`)**, hoặc **Gửi cả nhóm (`group`)**: Buổi chiều sẽ kích hoạt nhánh chung *"Một buổi Valentine của năm đứa"* tại Căn cứ (Trang trí Căn cứ và chơi đố vui).
- Bất kể đi nhánh nào, đến hoàng hôn cả 5 đứa đều tập hợp lại tại Căn cứ để mở hòm thư và cùng chụp bức ảnh nhóm bên cạnh hòm thư.

---

# PHẦN II — CÁCH CHƠI (GAMEPLAY LOOP & MECHANICS)

## 1. Vòng lặp Gameplay Cốt lõi (Core Loops)

### 1.1 Vòng lặp Vĩ mô (Macro Loop: Phòng 2026 ↔ Ký Ức)
Trò chơi vận hành theo vòng tuần hoàn chặt chẽ giữa hiện tại và quá khứ:
```
[PHÒNG 2026 - HUB]
       │
       ▼
1. Tương tác Thùng Kỷ Vật (Chọn món đồ đang phát sáng)
       │
       ▼
2. Câu độc thoại mở đầu của Player (Kích hoạt hồi tưởng)
       │
       ▼
[CHUYỂN CẢNH VÀO KÝ ỨC (Màn trập flash / Tiếng trống trường)]
       │
       ▼
3. Trải nghiệm Trang Ký Ức (1–4 Cảnh 3D: Tự do đi lại + Chuỗi Main + Minigame + Chụp ảnh chính)
       │
       ▼
4. Bấm "Giữ ảnh này" ở bước cuối cùng
       │
       ▼
[TRỞ VỀ PHÒNG 2026]
       │
       ▼
5. Trang Album tương ứng được phục hồi sắc nét
6. Món đồ kỷ vật xuất hiện trên bàn/kệ phòng trọ
7. Món kỷ vật tiếp theo trong thùng sáng lên
```

### 1.2 Vòng lặp Vi mô trong Một Cảnh (Micro Loop)
1. **Xuất hiện (Arrival):** Thẻ chữ thời gian xuất hiện (ví dụ: *"Lớp 7. Một chiều mưa."*) kèm vài câu thoại dẫn nhập.
2. **Khám phá tự do (Free Roam):** Đi lại tự do trong các khu vực được mở, tiếp cận các đồ vật để nghe câu hồi tưởng ngắn, trò chuyện tự do với bạn bè, chơi các minigame bãi đất hoặc chụp ảnh phong cảnh.
3. **Nhiệm vụ Cốt truyện (Main Steps):** Làm theo dấu chỉ hướng mục tiêu trên HUD. Thực hiện các thao tác thuộc 6 kiểu tương tác K1–K6.
4. **Chụp ảnh chính (Key Photo):** Chụp tấm ảnh quan trọng của Trang (cầm tay hoặc đặt máy hẹn giờ 10 giây). Bấm "Giữ ảnh này" để lưu vào Album.
5. **Khép lại cảnh & Tự động lưu:** Hệ thống lưu tiến trình tự động vào LocalStorage và IndexedDB.

---

## 2. Hệ thống 6 Kiểu Tương Tác Dùng Lại (K1 – K6)

Mọi hoạt động và trò chơi trong 9 Trang ký ức đều được chuẩn hóa thành 6 cơ chế tương tác tương thích hoàn toàn chuột và bàn phím:

| Kiểu | Tên tương tác | Thao tác người chơi | Ứng dụng thực tế trong kịch bản |
|:---:|---|---|---|
| **K1** | Đi tới – Nói – Chọn | Di chuyển đến gần nhân vật/vật thể, bấm `E` hoặc click chuột để đối thoại, bấm phím số `1/2/3` hoặc click chọn phương án trả lời. | Tìm lớp học, làm quen bạn mới, thảo luận làm báo tường, tâm sự đêm lửa trại. |
| **K2** | Chụp ảnh | Bấm `C` vào khung ngắm tự do (xoay chuột, lăn chuột zoom) hoặc đặt máy lên điểm cố định, kích hoạt hẹn giờ 10 giây rồi chạy vào vòng sáng tạo dáng. | Chụp ảnh tự sướng bộ ba, ảnh 5 chiếc thuyền, ảnh bàn caro, ảnh nhóm Valentine, ảnh lửa trại. |
| **K3** | Nhặt – Đặt – Sắp xếp | Click giữ và kéo vật phẩm từ khay đồ vào các điểm neo (snap points) trên lưới 3D/2D. | Kê bàn ghế Căn cứ, dán báo tường 20/11, xếp ghế xem bóng đá U23, trang trí hòm thư Valentine. |
| **K4** | Ghép cặp – Giải mã | Nối hai đầu ký hiệu hoặc ghép các mảnh câu chữ rời rạc thành một thông điệp hoàn chỉnh. | Giải mật lệnh số 01 lớp 6, ghép câu soạn 5 điều luật Căn cứ, viết Điều 6 bế giảng. |
| **K5** | Canh lực – Canh nhịp | Giữ phím chuột trái hoặc phím `Space` để nạp thanh lực, nhả ra đúng vạch xanh/vàng; hoặc bấm phím đúng thời điểm vòng tròn thu nhỏ trùng đích. | Canh nhịp đá cầu, thả thuyền giấy vượt sóng, ném bóng rổ vào rổ, vỗ tay gõ trống cổ vũ bóng đá. |
| **K6** | Giữ để làm (Hold & Drag) | Giữ chuột trái và di chuyển liên tục trên một vùng bề mặt cho đến khi thanh tiến độ đạt 90–100%. | Lau sạch bảng đen lớp học, bóp vụn gói mì tôm và lắc đều gia vị, tô sáp màu cờ đỏ sao vàng. |

---

## 3. Cơ chế Điều khiển, Camera 3D & Máy Ảnh Tự Chụp Của Player

### 3.1 Bảng ánh xạ phím điều khiển
| Thao tác | Phím trên máy tính (Mặc định) | Thao tác màn hình cảm ứng (Touch fallback) |
|---|---|---|
| **Di chuyển nhân vật** | Phím `W, A, S, D` hoặc 4 phím mũi tên | Cần gạt ảo Joystick góc dưới bên trái (`TouchStick`) |
| **Chạy nhanh** | Giữ phím `Shift` khi di chuyển | Tự động chạy khi kéo joystick ra ngoài biên |
| **Tương tác vật thể / NPC** | Bấm phím `E` hoặc Click chuột trái vào đối tượng | Chạm trực tiếp vào nút ảo tương tác (`TouchInteract`) |
| **Tiến hành hội thoại** | Bấm phím `Space` hoặc Click chuột bất kỳ | Chạm vào khung thoại |
| **Chọn câu thoại** | Bấm phím số `1`, `2`, `3` hoặc Click chuột | Chạm trực tiếp vào nút lựa chọn |
| **Bật/Tắt máy ảnh** | Bấm phím `C` (chế độ cầm tay) | Nút biểu tượng máy ảnh trên màn hình |
| **Chụp ảnh / Tạo dáng** | Click chuột trái (cầm tay) / Bấm `Space` (hẹn giờ) | Chạm nút chụp tròn to trên màn hình |
| **Mở Sổ tay nhiệm vụ** | Bấm phím `J` hoặc phím `Tab` | Biểu tượng cuốn sổ tay trên thanh HUD |
| **Tạm dừng / Mở Menu** | Bấm phím `Esc` | Nút "Menu" góc trên bên phải |
| **Xoay Camera** | Giữ chuột phải hoặc rê chuột khi bật Free Look (`L`) | Vuốt 1 ngón tay trên màn hình ngoài vùng joystick |
| **Thu phóng Camera (Zoom)** | Lăn bánh xe chuột (Mouse Wheel) | Chụm/mở 2 ngón tay (Pinch to zoom) |

### 3.2 Hệ thống Camera 3D thông minh (`CameraManager`)
- **Chế độ ký ức:** Camera góc nhìn thứ ba (Third-person follow) đặt chếch sau lưng nhân vật 45 độ, độ cao 2,2m, khoảng cách 4,5m. 
- **Chống che khuất (Occlusion Raycast):** Camera tự động phóng tia dò (raycasting) đến nhân vật. Khi gặp vật cản (tường lớp học, tán cây phượng, cột hành lang), camera sẽ tự động trượt mượt mà về phía trước nhân vật để tránh mất tầm nhìn.
- **Chế độ Phòng 2026:** Camera cố định góc nhìn Isometric bao quát căn phòng, không cho phép di chuyển nhân vật. Khi người chơi rê chuột vào các đồ vật (thùng đồ, bàn học, kệ sách, điện thoại), đồ vật sẽ phát sáng viền (Outline glow) để báo hiệu khả năng tương tác.

### 3.3 Hệ thống Máy ảnh & Ba tiêu chí đánh giá ảnh
Khi chụp ảnh kỷ niệm để đưa vào Album, hệ thống sẽ tự động quét tọa độ các nhân vật trong khung hình và hiển thị 3 dấu kiểm định tính (không dùng điểm số để tránh tạo áp lực):
1. **Đủ người (`is_all_present`):** Tất cả các nhân vật bắt buộc trong kịch bản cảnh đó đều có mặt trong khung hình và không bị che khuất quá 40%.
2. **Trong khung (`is_in_frame`):** Đầu và thân trên của các nhân vật nằm gọn trong vùng an toàn (chiếm 90% trung tâm khung ngắm).
3. **Kịp tạo dáng (`is_posed`):** Với ảnh hẹn giờ, Player đã chạy kịp vào vị trí và bấm phím tạo dáng trước khi màn trập đóng lại.
> **Quy tắc vàng:** Dù ảnh đạt đủ 3 dấu hay thiếu dấu, người chơi **luôn có quyền bấm "Giữ ảnh này"** để tiếp tục câu chuyện. Việc chụp lại hoàn toàn là quyền tự do hoài niệm của người chơi.

---

## 4. Hệ Thống Toàn Bộ 11 Minigame

Toàn bộ logic minigame đã được lập trình độc lập thành các State Machine thuần túy trong thư mục `src/minigames/`, sẵn sàng kết nối vào UI Overlay:

```
src/minigames/
├── index.ts                # Minigame Registry & Factory Manager
├── types.ts                # IMinigameEngine interface, Action, Result & State types
├── o_an_quan.ts            # Ô Ăn Quan (12 ô, 4 cấp độ AI)
├── nhay_lo_co.ts           # Nhảy Ô Lò Cò (Sơ đồ 10 ô, ném sành & thăng bằng)
├── ban_bi_ve.ts            # Bắn Bi Ve (Vòng tròn 1.2m, lực kéo ná & xoáy)
├── fold_boat.ts            # Gấp Thuyền Giấy Báo (Origami 4 nếp vuốt chuẩn)
├── phoenix_butterfly.ts    # Ép Bướm Hoa Phượng (Khay hoa 6 chi tiết & snap sổ)
├── ruler_battle.ts         # Búng Thước Kẻ Học Trò (Đấu mép bàn học BO3)
├── rock_paper_scissors.ts  # Oẳn Tù Tì Búng Tai (Kéo búa bao + tâm lý 4 bạn)
├── rescue_boat.ts          # Vớt Thuyền Que Tre (Canh dòng chảy rãnh nước)
├── sweep_leaves.ts         # Quét Lá Dọn Căn Cứ (Vệt chổi gom rác bãi đất)
├── paint_signboard.ts      # Tô Biển Tên Căn Cứ (Tô màu 5 chữ cái C-Ă-N-C-Ứ)
└── raindrop_rhythm.ts      # Nhịp Mưa Tí Tách (Rhythm 3 làn nước mưa dột)
```

### 4.1 Bốn Minigame Ưu Tiên Hàng Đầu (Chi tiết cơ chế & AI)

#### 1. Ô Ăn Quan Căn Cứ (`o_an_quan.ts`)
- **Bàn cờ:** Gồm 12 ô.
  - Ô 0 đến 4: 5 ô dân phía người chơi (mỗi ô khởi đầu 5 viên sỏi).
  - Ô 5: Ô Quan bên phải (khởi đầu 1 viên quan lớn hoặc 10 sỏi).
  - Ô 6 đến 10: 5 ô dân phía đối thủ (mỗi ô khởi đầu 5 viên sỏi).
  - Ô 11: Ô Quan bên trái (khởi đầu 1 viên quan lớn hoặc 10 sỏi).
- **Luật chơi:** Người chơi click chọn ô dân phía mình có sỏi, chọn hướng rải (Thuận chiều kim đồng hồ `cw` hoặc Ngược chiều `ccw`). Rải liên hoàn; ăn khi gặp một ô trống kế tiếp một ô có sỏi; ăn liên hoàn nhiều ô; vay sỏi khi đến lượt mà 5 ô nhà mình trống; trò chơi kết thúc khi cả 2 ô quan đều bị ăn hết ("Hết quan tàn dân").
- **Hành vi 4 cấp độ AI:**
  - `duc` (Rất dễ): 50% đi ngẫu nhiên, 50% tham ăn sỏi trước mắt, không để ý phòng thủ để hở ô quan.
  - `ha` (Dễ): Đánh theo cảm tính, hay nhường nhịn bạn, tuyệt đối không chủ động ăn quan nếu còn nước đi khác.
  - `quan` (Trung bình): Đánh chắc chắn, sử dụng thuật toán Minimax tính trước 2 nước cờ.
  - `chau` (Khó nhất): Thuật toán Lookahead 4 nước, tối ưu hóa điểm số, chủ động gài bẫy và vét sạch quan.

#### 2. Nhảy Ô Lò Cò (`nhay_lo_co.ts`)
- **Sơ đồ 10 ô:**
  - Ô 1, 2, 3: Ô đơn (nhảy lò cò 1 chân, bấm phím `Space`).
  - Ô 4–5: Ô kép (bung 2 chân cùng lúc, bấm tổ hợp `A + D`).
  - Ô 6: Ô đơn (1 chân).
  - Ô 7–8: Ô kép (2 chân).
  - Ô 9: Ô đơn (1 chân).
  - Ô 10: Ô Chảo / Bán nguyệt (nghỉ 2 chân và quay người 180 độ).
- **Quy trình 3 bước:**
  - *Bước 1: Ném sành (`THROW_STONE`):* Canh lực và hướng ném miếng sành vào ô mục tiêu. Ném chệch vạch = mất lượt.
  - *Bước 2: Nhảy qua các ô (`JUMP`):* Nhảy theo nhịp, **tuyệt đối không được đạp chân vào ô đang chứa miếng sành**.
  - *Bước 3: Nhặt sành (`PICK_STONE`):* Khi nhảy quay về, dừng ở ô trước miếng sành, giữ thanh thăng bằng trong vùng an toàn (30–70%) bằng chuột trong 1,5 giây để cúi xuống nhặt sành.

#### 3. Gấp Thuyền Giấy Báo (`fold_boat.ts`)
- **Origami 4 nếp vuốt:**
  1. *Nếp 1:* Gấp đôi tờ giấy báo theo trục dọc tạo đường sống thuyền.
  2. *Nếp 2:* Gấp hai góc tam giác phía trên chụm vào đường sống giữa tạo mũi nhọn.
  3. *Nếp 3:* Gấp mép đáy lật lên hai bên mạn thuyền tạo vành ca-nô.
  4. *Nếp 4:* Bung lòng thuyền và miết phẳng đáy tạo khoang nổi.
- **Thao tác:** Người chơi giữ chuột kéo vuốt (`START_SWIPE` → `FINISH_SWIPE`). Engine tính toán độ lệch góc và độ thẳng để chấm điểm độ sắc nếp gấp (`sharpness`) và độ cân đối (`symmetry`).

#### 4. Ép Bướm Hoa Phượng (`phoenix_butterfly.ts`)
- **6 chi tiết hoa phượng:** Cánh hoa trên trái/phải (có đốm vàng), cánh hoa dưới trái/phải, và 2 râu nhị hoa cong cong.
- **Thao tác:** Người chơi kéo từng cánh hoa từ khay vào trang sổ, xoay góc tương ứng. Khi đưa lại gần bóng mờ (sai số $\le 15\%$ vị trí và $\le 40^\circ$ góc), cánh hoa sẽ tự động "hít" dính chặt vào giấy. Cuối cùng, thực hiện động tác gập trang sổ lại kẹp phẳng để tạo ra chú bướm hoa phượng kỷ niệm.

### 4.2 Các Minigame Cốt Truyện Riêng Biệt
- **Cờ Caro Bảng Đen (`mg_caro` - Trang 5):** Bàn cờ 12×12 vẽ phấn trắng trên nền bảng xanh đen. Người chơi đi trước cầm quân X đấu với AI của Đức hoặc Quân cầm quân O. Thắng khi có 5 quân liên tiếp. Loạt ván bắt đầu từ tỉ số 3–3; ván của người chơi sẽ đẩy tỉ số lên 4–3 (lưu vào `minigames.caro.series`).
- **Sudoku Giấy Kẻ Ô (`mg_sudoku` - Trang 7):** Lưới 9×9 trên trang giấy tập học trò. Chạy đua với đồng hồ 6 phút của Châu. Có tối đa 3 lần bấm gợi ý (mỗi lần cộng 30 giây phạt). Thắng thua đều tiếp tục cốt truyện.
- **Lật Chai Nước Suối (`mg_bottle_flip` - Xe quà vặt Z03):** Người chơi giữ chuột kéo thân chai nước vơi 1/3 để tạo góc và lực ném. Hệ thống mô phỏng khối nước trượt dọc thân chai có lò xo giảm chấn giúp chai đứng thăng bằng trên bàn nhựa. Đứng thành công sẽ kích hoạt camera chụp khoảnh khắc lưu vào Album.
- **Làm Hòm Thư Valentine (`mg_mailbox_craft` - Trang 6):** Kéo dán giấy màu, gắn khe bỏ thư, ngăn chung và bảng nội quy 3 điều.
- **Ném Bóng Rổ (`mg_ball_toss` - Trang 6):** Giữ phím nạp thanh lực xanh-vàng-đỏ ném bóng vào rổ qua 3 cự ly gần - trung bình - xa cùng Quân.
- **Săn Góc Ảnh (`mg_photo_hunt` - Trang 6):** Cùng Hạ chụp 3 góc ảnh trường học theo bố cục lưới 3×3 với ô mục tiêu.

---

## 5. Cơ chế Lưu Trữ Dữ Liệu Cục Bộ (Save System) & Thu Thập Số Liệu Đo Lường Ẩn Danh (Analytics)

### 5.1 Cấu trúc Lưu trữ trên Trình duyệt Người chơi
Tuân thủ nguyên tắc tôn trọng quyền riêng tư tuyệt đối của học sinh/người dùng:

| Hạng mục lưu | Công nghệ lưu | Cấu trúc dữ liệu chi tiết |
|---|---|---|
| **Tiến trình chơi & Cờ trạng thái** | `localStorage` (JSON) | Khóa `htx_save_v2`: lưu phiên bản `v`, thông tin nhân vật `{ name, gender }`, mã Trang đang chơi, danh sách quest đã hoàn thành, toàn bộ cờ rẽ nhánh (`flags`). |
| **Bảng thành tích Minigame** | `localStorage` (JSON) | Khóa `htx_minigames`: tỉ số thắng/thua/hòa của từng trò với từng đối thủ, tỉ số loạt ván caro `minigames.caro.series`, thành tích Sudoku, kỷ lục lật chai. |
| **Ảnh chụp Album** | `IndexedDB` (Binary Blobs) | Cơ sở dữ liệu `HTX_PhotoDB`: lưu trữ trực tiếp các file ảnh chụp nhị phân (JPEG Blob nén $1024 \times 768$), tuyệt đối không dùng chuỗi Base64 để tránh phình dung lượng bộ nhớ. |
| **Cài đặt hệ thống** | `localStorage` | Âm lượng (BGM, SFX, UI), tốc độ hiển thị chữ, cấu hình bật/tắt camera tự do. |

### 5.2 Hệ thống Sự Kiện Đo Lường Ẩn Danh (Firebase Firestore)
Chỉ thu thập các sự kiện định lượng phục vụ nghiên cứu và đánh giá môn học thông qua API trung gian Vercel Functions:
- `page_started` / `page_completed`: Đo thời gian hoàn thành từng Trang (`duration_s`).
- `minigame_started` / `minigame_finished`: Đo tỉ lệ thắng/thua, số sao, số gợi ý của từng trò.
- `end_message_sent`: Ghi nhận sắc thái tin nhắn cuối cùng (`playful`, `gentle`, `deep`).
- `public_demo_completed`: Đánh dấu người chơi hoàn thành trọn vẹn bản demo trước khi mở form khảo sát.
> **Cam kết:** Không gửi tên người chơi, không gửi nội dung tin nhắn tự gõ, không thu thập IP hay thông tin nhận dạng cá nhân.

---

## 6. Hệ thống Giao Diện Người Chơi HUD & UI Overlay (Preact + CSS Motion)

Hệ thống UI được xây dựng hoàn toàn bằng Preact gọn nhẹ, kế thừa thiết kế sổ tay học trò với các thành phần chính:
- **HUD thường trực (`UI_HUD`):** Thanh mục tiêu nhiệm vụ nhỏ gọn góc trên bên trái kèm chấm tròn phát sáng; Tên phân khu hiện thoáng qua khi bước vào khu vực mới; Phím tắt gợi ý tương tác `[E]` nổi trên đầu đồ vật.
- **Khung thoại (`UI_DIALOGUE`):** Đặt sát đáy màn hình, tối đa 2 dòng chữ hiển thị hiệu ứng máy đánh chữ mượt mà; Tên nhân vật hiển thị màu sắc định danh riêng (Đức: Cam `#e0702a`, Quân: Xanh lá `#3f9a4e`, Châu: Tím `#8a55c9`, Hạ: Hồng `#e0608f`, Player: Xanh dương `#2f6fb3`).
- **Khung lựa chọn (`UI_CHOICE`):** Các nút bấm lựa chọn đánh số `1`, `2`, `3` có gắn nhãn sắc thái cảm xúc (`tag`: Rộn ràng / Ấm áp / Sâu lắng).
- **Giao diện Album Ký Ức (`UI_ALBUM`):** Hiển thị cuốn sổ dán ảnh khổ lớn; Các trang chưa chơi hiển thị mờ đục, trang đã hoàn thành hiển thị sắc nét; Cho phép click lật mặt sau tấm ảnh để đọc những dòng lưu bút viết tay (`back_note`).
- **Giao diện Điện thoại 2026 (`UI_PHONE_CHAT`):** Mô phỏng ứng dụng tin nhắn hiện đại năm 2026 với bong bóng chat quen thuộc, hiển thị nhóm bạn cũ "Căn cứ Bí mật" và danh sách câu mở lời để người chơi lựa chọn gửi đi.
- **Khung Minigame Chung (`UI_MG_FRAME`):** Cung cấp màn hình hướng dẫn luật chơi trực quan bằng hình vẽ trước mỗi ván đấu; nút `?` tra cứu luật trong lúc chơi; màn hình tổng kết Thắng / Thua / Hòa và nút "Chơi lại" hoặc "Đi tiếp".

---

# PHẦN III — DANH SÁCH BỐI CẢNH & KHÔNG GIAN CHƠI

Trò chơi diễn ra trên hai bản đồ 3D chính: **Phòng trọ năm 2026 (`hub_room`)** và **Khuôn viên trường THCS miền Nam (`map_thcs`)** (chia thành 6 phân khu chức năng).

---

## 1. Không gian Hub: Phòng Trọ Năm 2026 (`hub_room`)

| Thông số | Đặc tả thiết kế |
|---|---|
| **Mã bản đồ** | `hub_room` |
| **Xuất hiện tại** | Mở đầu game, khoảng chuyển tiếp giữa các Trang, Chuyển Mốc và Màn Kết Thúc Demo. |
| **Thời điểm & Ánh sáng** | Buổi tối yên tĩnh. Ánh đèn bàn vàng ấm áp chiếu xuống mặt bàn làm việc, ánh trăng dịu nhẹ hắt qua khung cửa sổ lớn; không gian tĩnh lặng, ấm cúng nhưng gợi cảm giác một mình trống trải. |
| **Cảm xúc mỹ thuật** | Tươi sáng và ấm áp ngay từ đầu (không dùng tông màu xám xịt u ám); cảm giác "trống trải" được biểu đạt qua sự ngăn nắp, ít đồ đạc của căn phòng trọ người lớn. |
| **Đạo cụ (Props) bắt buộc** | 1. `PRP_MEMORY_BOX`: Thùng carton cũ dán chữ "Đồ cũ - đừng vứt", đặt dưới sàn cạnh bàn học.<br>2. `PRP_ALBUM_3D`: Cuốn Album kỷ niệm dày bìa cứng đặt trên bàn làm việc.<br>3. `PRP_DESK_2026`: Bàn làm việc gỗ hiện đại của người trưởng thành.<br>4. `PRP_SHELF_2026`: Kệ sách đứng (nơi các kỷ vật lần lượt xuất hiện sau mỗi Trang).<br>5. `PRP_PHOTO_WALL`: Mảng tường trống phía trước bàn làm việc (dán những tấm ảnh chụp trong game).<br>6. `PRP_PHONE_2026`: Chiếc điện thoại thông minh hiện đại đặt cạnh máy tính.<br>7. `PRP_GLASS_FRAME_SMALL`: Khung kính nhỏ đặt mẩu giấy mật lệnh (sau Trang 1).<br>8. `PRP_PAPER_BOAT_HA`: Chiếc thuyền giấy khô đặt trên bàn (sau Trang 2).<br>9. `PRP_RULEBOOK`: Cuốn sổ luật Căn cứ bìa xanh nhô ra trên giá sách (sau Trang 3, 9).<br>10. `PRP_CHALKBOX_KV01`: Hộp phấn móp nắp ghi tỉ số caro đặt trên bàn (sau Trang 5).<br>11. `PRP_PENCIL_CUP`: Ống cắm bút có cắm lá cờ giấy sao vàng (sau Trang 8).<br>12. `PRP_WINDOW_SILL`: Bậu cửa sổ nơi đặt viên bi ve mắt mèo hứng nắng (sau Trang 9).<br>13. `PRP_SHIRT_SIGNED`: Chiếc áo trắng đồng phục chi chít chữ ký treo trên móc áo (sau Trang 9). |

---

## 2. Khuôn viên Trường THCS Miền Nam (`map_thcs`) — Chi Tiết 6 Phân Khu

Bản đồ `map_thcs` là không gian dùng chung cho toàn bộ 9 Trang ký ức thời học sinh (từ lớp 6 đến lớp 9). Sự thay đổi qua từng năm học được thể hiện qua **bộ trang trí (decor variants)** và **preset ánh sáng thời tiết**, không dựng lại khung hình học bản đồ.

### 2.1 Khu Z01: Lớp Học (`zone.thcs.classroom` — Phòng 6A2 / 8A / 9A)
- **Tập tin hình học:** `zone_classroom.glb` (141 KB, 1.778 tam giác).
- **Xuất hiện tại:** Trang 1 (Lớp 6), Trang 5 (Lớp 8), Trang 6 (Lớp 8), Trang 7 (Lớp 9).
- **Thời điểm & Ánh sáng yêu cầu:**
  - *Trang 1:* Buổi sáng đầu năm học, ánh nắng sớm xuyên qua cửa sổ nan chớp xanh lá, không khí tươi mới bỡ ngỡ.
  - *Trang 5:* Buổi chiều tà cuối buổi học, vệt nắng xiên vàng cam rực rỡ chiếu nghiêng lên bục giảng và bảng đen.
  - *Trang 6:* Buổi sáng giờ học tiết Toán, ánh sáng chan hòa.
  - *Trang 7:* Buổi sáng mùa đông hanh hao, bảng đếm ngược đè nặng tâm lý thi cử.
- **Kiến trúc & Không khí:** Phòng học đặc trưng trường công lập miền Nam: tường quét vôi vàng, cửa sổ chớp lá sách sơn xanh lá mạ, trần cao có quạt trần quay đều, nền lát gạch hoa cổ điển.
- **Đạo cụ (Props) bắt buộc phục vụ kịch bản:**
  1. `PRP_BLACKBOARD`: Bảng đen/xanh chống lóa treo tường, có ray để phấn và vùng lau bảng phục vụ tương tác K6 và ván cờ Caro Trang 5.
  2. `PRP_DESK_2SEAT`: Dãy bàn ghế học sinh bằng gỗ 2 chỗ ngồi khung sắt sơn xanh (khoảng 20 bộ bàn).
  3. `PRP_TEACHER_DESK`: Bục giảng gỗ và bàn làm việc của giáo viên chủ nhiệm.
  4. `PRP_CHALKBOX_KV01` & `PRP_CHALK_PIECE`: Hộp phấn giấy móp và mẩu phấn trắng cụt dùng để kẻ ô caro và viết chữ.
  5. `PRP_RAG`: Giẻ lau bảng ẩm để ở góc bảng.
  6. `PRP_COUNTDOWN_BOARD`: Bảng gỗ sơn đỏ đếm ngược ngày thi chuyển cấp vào lớp 10 (con số 270 và 197 đổi bằng canvas ở Trang 7).
  7. `PRP_WALL_NEWSPAPER`: Khung bảng tin bằng gỗ dán giấy báo tường 20/11 có chừa 1 ô trống ở góc dưới.
  8. `PRP_CALENDAR_BLOC`: Cuốn lịch bloc treo tường lật trang nhanh trong cutscene chuyển cảnh Trang 8.

---

### 2.2 Khu Z02: Sân Trường Trung Tâm (`zone.thcs.yard`)
- **Tập tin hình học:** `zone_yard.glb` (143 KB).
- **Xuất hiện tại:** Mọi Trang (Trang 1, 3, 4, 5, 6, 8, 9).
- **Thời điểm & Ánh sáng yêu cầu:**
  - *Trang 1:* Nắng sớm mùa thu, sân trường rợp bóng cờ khai giảng.
  - *Trang 4:* Mưa rào sập xuống rồi tạnh hửng, ánh nắng xuyên qua tán cây ướt sũng tạo cầu vồng chân trời.
  - *Trang 5:* Nắng rực rỡ ngày khai trường lớp 8.
  - *Trang 6:* Giờ ra chơi rộn rã tiếng cười; bóng râm ghế đá nơi Đức trêu Hạ lần 3.
  - *Trang 8 (Đêm Hội trại tháng 3/2018):* **Biến thể ban đêm đặc biệt.** Nguồn sáng chính phát ra từ bếp than hồng bập bùng, các dây đèn bóng tròn giăng ngang sân phát ánh sáng vàng ấm áp.
  - *Trang 9:* Trưa hè bế giảng nắng chói chang, tiếng ve râm ran, cánh hoa phượng rụng phủ đỏ mặt sân xi măng.
- **Kiến trúc & Không khí:** Sân trường đổ bê tông chia từng ô vuông chống nứt, bồn hoa xây gạch quanh gốc cây phượng vĩ đại thụ và cây bàng tán tầng râm mát.
- **Đạo cụ (Props) bắt buộc phục vụ kịch bản:**
  1. `PRP_FLAGPOLE`: Cột cờ inox sừng sững giữa sân trường.
  2. `ENV_TREE_PHUONG`: Cây phượng vĩ cổ thụ (gốc cây chụp ảnh nhóm hẹn giờ Trang 4 và Trang 9).
  3. `ENV_TREE_BANG`: Cây bàng lá to tầng tầng lớp lớp tạo bóng mát.
  4. `PRP_STONE_BENCH`: Hàng ghế đá mài hoa cương đặt dưới bóng cây (nơi đặt máy ảnh, ngồi ăn mì, tâm sự).
  5. `PRP_BASKET_HOOP`: Cột ném bóng rổ góc sân (nơi Quân đứng ở Trang 5 và chơi ném bóng tính điểm Trang 6).
  6. `itr.thcs.shuttle_ring`: Vòng tròn vạch vôi đá cầu (Trang 1).
  7. `PRP_TENT`: Các lều trại bạt hình lăng trụ cắm cọc dựng quanh sân (Trang 8).
  8. `PRP_CAMP_GATE_*`: Khung cổng trại dựng bằng tre và giấy màu (3 biến thể: Tên lửa / Chiếc lá / Thường - Trang 8).
  9. `PRP_STRING_LIGHTS`: Dây đèn bóng tròn lung linh giăng giữa các lều trại (Trang 8).
  10. `PRP_CHARCOAL_STOVE`: Bếp than nhỏ đỏ lửa nướng bắp (thay thế lửa trại lớn - Trang 8).
  11. `PRP_LOG_SEAT`: Các khúc gỗ tròn đặt quanh bếp than để ngồi và kê máy ảnh (Trang 8).
  12. `PRP_CORN_GRILLED`: Bắp nướng mỡ hành bốc khói thơm lừng (Trang 8).

---

### 2.3 Khu Z02b: Hành Lang & Mái Hiên Lớp Học (`zone.thcs.corridor`)
- **Tập tin hình học:** `zone_corridor.glb` (77 KB).
- **Xuất hiện tại:** Trang 1, Trang 2, Trang 6.
- **Thời điểm & Ánh sáng yêu cầu:**
  - *Trang 1:* Sáng trong trẻo, học sinh đi lại tấp nập xem danh sách lớp.
  - *Trang 2 (Trọng tâm chiều mưa):* Bầu trời xám bạc mát dịu, hạt mưa trắng xóa rơi xối xả từ mái ngói đỏ xuống rãnh nước trước hiên, hơi nước bốc lên ẩm ướt trong lành.
  - *Trang 6:* Giờ ra chơi, ánh sáng dịu mát dưới bóng râm mái hiên.
- **Kiến trúc & Không khí:** Dãy hành lang dài nối các phòng học, lan can xi măng thấp, cột tròn sơn trắng nâng đỡ mái hiên ngói đỏ, phía trước là dãy rãnh nước bê tông thoát nước mưa.
- **Đạo cụ (Props) bắt buộc phục vụ kịch bản:**
  1. `prp_class_board`: Bảng gỗ gắn trên tường dán danh sách phân chia lớp học sinh đầu năm.
  2. `ENV_GUTTER`: Rãnh mương nước xi măng trước hiên rộng 30cm, dòng nước mưa chảy xiết dài 12m phục vụ minigame đua thuyền giấy Trang 2.
  3. `PRP_PAPER_BOAT_x3`: Các mẫu thuyền giấy gấp từ giấy tập và báo cũ (thuyền buồm, thuyền mui, thuyền đôi).
  4. `prp_bamboo_stick`: Que tre dài để học sinh ngồi chòi vớt thuyền giấy trôi cống.
  5. `PRP_TRASH_FLOAT`: Rác cản dòng nước (lá bàng khô, vỏ que kem, que kẹo mút) làm vật cản trong minigame đua thuyền.

---

### 2.4 Khu Z03: Cổng Trường & Ngõ Quà Vặt / Tiệm Tạp Hóa (`zone.thcs.gate`)
- **Tập tin hình học:** `zone_gate.glb` (82 KB).
- **Xuất hiện tại:** Trang 1, Trang 5, Trang 6, Trang 8, Trang 9.
- **Thời điểm & Ánh sáng yêu cầu:**
  - *Trang 1 & 5:* Buổi trưa/chiều tan học rộn rã, tiếng chuông xe đạp lanh canh, nắng vàng rọi vào mái hiên ngõ hẻm.
  - *Trang 8 (Chiều 27/1/2018):* Chiều thứ Bảy đông đúc, ánh sáng tivi phản chiếu lên gương mặt hồi hộp của đám đông người lớn và học sinh đang ngồi chen chúc xem bóng đá.
- **Kiến trúc & Không khí:** Cổng sắt trường sơn xanh lá rỉ sét theo năm tháng; bên ngoài là con ngõ nhỏ dẫn ra khu dân cư, có xe quà vặt rong và tiệm tạp hóa gia đình quen thuộc (thay thế hoàn toàn cho khu căn-tin truyền thống).
- **Đạo cụ (Props) bắt buộc phục vụ kịch bản:**
  1. `ENV_GATE`: Cổng sắt xếp hai cánh to lớn của trường THCS, có khóa xích sắt của bác bảo vệ.
  2. `ENV_SNACK_CART`: Xe đẩy quà vặt bằng inox có gắn dù che, bày bán bịch bánh tráng trộn, siro đá bào và chiếc bàn nhựa xanh phục vụ minigame lật chai nước suối.
  3. `ENV_GROCERY_SHOP`: Tiệm tạp hóa nhỏ với mái bạt che nắng, tủ kính đựng kẹo mút, chai nước ngọt thủy tinh và bậc thềm xi măng cho học sinh ngồi tụ tập.
  4. `PRP_TV_OLD`: Chiếc tivi CRT cũ kỹ đặt trên giá cao trong tiệm tạp hóa phát hình trận bóng đá tuyết trắng U23 châu Á 2018.
  5. `PRP_PLASTIC_STOOL`: Chồng ghế nhựa tròn màu đỏ và xanh dương xếp kín trước hiên tiệm tạp hóa.
  6. `PRP_NOODLE_PACK`: Bịch mì tôm Miliket giấy kraft phục vụ thao tác bóp vụn chia ba ở Trang 1.
  7. `PRP_WATER_BOTTLE`: Chai nước suối nhựa trong suốt mực nước 1/3 phục vụ trò chơi lật chai của Đức.
  8. `PRP_VALENTINE_SNACKS`: Khay bánh kẹo sô-cô-la trái tim và bảng giá nhỏ phục vụ nhánh quà vặt Trang 6.

---

### 2.5 Khu Z04: Bãi Đất Trống (`zone.thcs.field`)
- **Tập tin hình học:** `zone_field.glb` (82 KB).
- **Xuất hiện tại:** Trang 3, Trang 7, Trang 9 (Đóng vai trò vùng đệm di chuyển sang Căn cứ Z05).
- **Thời điểm & Ánh sáng:** Ánh sáng chiều tà, bãi cỏ hoang ngả vàng.
- **Kiến trúc & Đạo cụ:** Nền đất nện pha cát, các bụi cỏ dại mọc lưa thưa, vũng nước đọng nhỏ sau mưa, cọc rào dây thép gai cũ ngăn cách với khu dân cư. Đây là nơi Quân và Player chơi bắn bi mắt mèo tự do.

---

### 2.6 Khu Z05: Căn Cứ Bí Mật Sân Sau Gần Nhà Kho (`zone.thcs.base`)
- **Tập tin hình học:** `zone_base.glb` (62 KB).
- **Xuất hiện tại:** Trang 3 (Dựng căn cứ), Trang 4 (Trú mưa cầu vồng), Trang 6 (Hòm thư Valentine), Trang 7 (Châu tâm sự), Trang 9 (Dọn dẹp chia tay) và **Khu Vui Chơi Tuổi Thơ**.
- **Thời điểm & Ánh sáng yêu cầu:**
  - *Trang 3 & 4:* Nắng trưa lọt qua kẽ lá bàng rọi xuống mái bạt xanh; tiếng mưa rào lộp độp trên bạt.
  - *Trang 6:* Buổi sáng râm mát khi làm hòm thư; hoàng hôn ấm áp khi quây quần mở thư Valentine.
  - *Trang 7:* Chiều muộn vắng vẻ, bóng râm tĩnh mịch nơi Châu ngồi khóc một mình.
  - *Trang 9:* Hoàng hôn đỏ rực buông xuống những ngày cuối cùng của đời học sinh cấp 2.
- **Kiến trúc & Không khí:** Góc sân sau trường giáp bức tường nhà kho chứa bàn ghế gãy. Không gian biệt lập, kín đáo, được che chắn bởi gốc cây bàng già sum suê và một tấm bạt sọc xanh trắng che mưa nắng do nhóm tự chằng dây.
- **Đạo cụ (Props) bắt buộc phục vụ kịch bản & Minigame:**
  1. `ENV_BASE`: Toàn bộ kết cấu Căn cứ gồm mái bạt dù căng dây thừng, cọc tre đóng góc đất, các thùng giấy carton cũ xếp góc tường làm vách ngăn.
  2. `itr.thcs.old_table`: Chiếc bàn học sinh bằng gỗ cũ hỏng một chân được kê bằng gạch, là bàn họp chính của 5 đứa.
  3. `itr.thcs.base_shelf`: Chiếc kệ gỗ 2 tầng để chai lọ cắm hoa, hộp màu sáp và cuốn sổ luật bìa xanh.
  4. `PRP_BASE_SIGN`: Biển gỗ ép cưa vuông vức, sơn dòng chữ "CĂN CỨ BÍ MẬT" treo trang trọng trên thân cây bàng.
  5. `PRP_VALENTINE_MAILBOX`: **Hòm thư tình bạn Valentine** — làm từ hộp giày carton, bọc giấy màu, có khe bỏ thư riêng, ngăn lớn đựng thư chung và bảng nội quy 3 điều (đứng cố định ở Căn cứ từ Trang 6 đến hết Trang 9).
  6. `PRP_GAME_BOARD_SIGN`: Tấm bìa carton vẽ phấn "BẢNG TRÒ CHƠI" dựng cạnh bàn gỗ, là điểm click mở menu Khu Vui Chơi Tuổi Thơ.
  7. `DCL_OAQ_BOARD`: Bàn cờ Ô ăn quan 12 ô vẽ phấn trắng trực tiếp trên nền đất/xi măng + 50 viên sỏi dân + 2 viên sỏi quan lớn.
  8. `DCL_HOPSCOTCH`: Sân nhảy lò cò 10 ô vẽ phấn trên nền đất phẳng + miếng sành ném dẹt.
  9. `DCL_MARBLE_RING`: Vòng tròn phấn đường kính 1,2m bắn bi ve trên mặt đất phẳng + bộ bi ve mắt mèo trong veo.
  10. `PRP_STRAW_BROOM`: Cây chổi rơm quét lá khô (phục vụ minigame quét dọn Trang 3).
  11. `PRP_CRAYON_BOX`: Hộp sáp màu 12 cây dùng để tô biển tên, vẽ cờ và ấn dấu vân tay Trang 9.

---

# LỜI KẾT & HƯỚNG DẪN BÀN GIAO CHO ĐỘI NGŨ PHÁT TRIỂN
Tài liệu này là **Nguồn Chân Lý Hợp Nhất Duy Nhất (Single Source of Truth)** của dự án *Hành Trình Thanh Xuân*. 
- **Ưu tiên trước mắt (Hạn 04/12/2026):** Toàn bộ lập trình viên tập trung ráp nối hoàn thiện **Mốc 1 (Trang 1 → Trang 4)**, tích hợp UI cho 4 minigame ưu tiên hàng đầu (`o_an_quan`, `nhay_lo_co`, `fold_boat`, `phoenix_butterfly`), đảm bảo luồng chơi xuyên suốt từ Phòng 2026 → 4 Trang Ký Ức → Trở về phòng nhắn tin kết thúc demo.
- **Sau ngày 15/12/2026:** Tiếp tục mở rộng các phân cảnh của Mốc 2 (Trang 5 → Trang 9), đưa Hòm thư Valentine và các minigame nâng cao vào bản hoàn chỉnh.
- Mọi thắc mắc kỹ thuật hoặc đề xuất thay đổi lời thoại/luật chơi phải được đối chiếu và cập nhật vào văn bản này trước khi tiến hành viết mã nguồn.
