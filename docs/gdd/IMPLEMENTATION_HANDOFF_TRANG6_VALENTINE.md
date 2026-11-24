# IMPLEMENTATION HANDOFF — Trang 6 "Valentine — Hòm thư của năm đứa" (`d.g08.02`)

| Trường | Giá trị |
|---|---|
| Phiên bản | **v1.0-draft** |
| Ngày | 21/11/2026 (UTC+7) |
| Trạng thái | **Nội dung đã được chủ dự án CHỐT HƯỚNG chiều 21/11 (CONFIRMED) để dev bắt đầu.** Chưa đóng dấu APPROVED cho cả GDD. Mục ghi PROPOSED là giá trị khởi điểm, chỉnh khi chơi thử không cần xin duyệt lại |
| Người nhận | Claude (hoặc dev) làm phần code của dự án "Hành Trình Thanh Xuân" |
| Nguồn | `docs/gdd/01_NARRATIVE_AND_SCENES.md` (Trang 6) · `02_GAMEPLAY_AND_MECHANICS.md` §2.5 · `03_ASSETS_AND_AUDIO.md` · `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (thoại nguyên văn, **thắng** khi lệch file 01) |

## 0. Một đoạn tóm tắt
Trang 6 là bốn cảnh liên tiếp trong tuần Valentine 2017 (lớp 8). **Thứ Năm 9/2:** Hạ gửi confession ẩn danh, Đức đoán ra và trêu ba lần. **Thứ Sáu 10/2:** cả nhóm làm hòm thư ở Căn cứ; Đức xin lỗi bằng một lá thư bỏ vào hòm; Hạ đọc một mình và nhận lời xin lỗi. **Thứ Hai 13/2:** tiết Toán với Quân. **Thứ Ba 14/2:** Player viết thư cho một bạn (hoặc cả nhóm), buổi chiều đi theo thư, tối mở hòm thư, chụp ảnh nhóm bên hòm thư. Hòm thư nghĩa **tình bạn** (cảm ơn · trêu nhẹ · rủ làm việc chung), **không** thả thính.

## 1. Đọc theo thứ tự (chỉ những mục này)
1. `docs/gdd/SESSION_HANDOFF_2.md` — trạng thái chung.
2. File này.
3. `01` mục "TRANG 6" (bảng từng bước) → kịch bản `KICH_BAN_DEMO_M1_M2_v1.md` mục "TRANG 6" (lời thoại thật).
4. `02` §2.5 (luật chơi), §4.2 (trường lưu), §5.1 (event đo).
5. `03` các dòng `PRP_VALENTINE_*`, `PRP_MAILBOX_RULES_BOARD`, `PRP_CRAFT_SUPPLIES`, `PRP_DECOR_SET`, `UI_MAILBOX_CRAFT`, `UI_APOLOGY_LETTER`, `UI_LETTER_*`, `UI_VALENTINE_MINI`, `SFX_*` liên quan.
6. Cách số hóa một Trang vào code: `docs/PAGE_DATA_GUIDE.md` (nằm trên nhánh `feat/sprint-0412`) và `docs/ai-handoff/02_QUEST_SYSTEM.md`.

Không cần đọc lại cả GDD 00–03, `REVISION_REVIEW_FIX_C_21-11.md` (báo cáo xung đột, chỉ để tra) hay phần Trang khác.

## 2. Nhánh làm việc
- **Tài liệu:** `docs/valentine-mailbox-main-flow` (không viết code ở đây).
- **Code:** hai nhánh hiện có — `feature/s2-world-camera-blender` (HEAD `6307e00`) và `feat/sprint-0412` (HEAD `09204f5`, đã chỉnh theo GDD v1.0: event `page_*`, nhãn Mốc, `CharacterRigAdapter`). Clone khi viết handoff này là clone nông nên **chưa xác minh quan hệ giữa hai nhánh**. Trước khi bắt đầu: đọc `WORKSPACE.md` và `docs/AUDIT_AND_ROADMAP.md`, hỏi chủ dự án chọn nhánh nếu hai file không nói rõ. Mặc định đề xuất `feat/sprint-0412`.
- Không đụng `main`, `dev`. Không gộp thay chủ dự án; mở Pull Request.

## 3. Đối chiếu cảnh → loại bước trong code *(PROPOSED — theo `PAGE_DATA_GUIDE` §3)*
File Trang: `src/content/days/d_g08_02.ts` (mẫu: `d_g07_03.ts`). Đề xuất **4 quest Main, mỗi Cảnh một quest** (ID theo mẫu `q_m2_main_NN`; số thứ tự chọn theo các Trang 5, 7–9 đã có để không trùng). Kỷ vật dẫn vào: `art_m2_NN` (tờ vẽ chiếc lá, điều kiện sáng lên theo Trang 5).

| Cảnh | Bước (script) | Loại bước | Ghi chú |
|---|---|---|---|
| A thứ Năm | Đọc confession | `interact` + màn 2D `UI_CONFESSION` | Chỉ đọc, không chọn |
| | Bị trêu ba lần | `cutscene` / `talk`; lần 2 có `choice` (`measured: false`) | Mọi lựa chọn dẫn cùng chỗ |
| | Kế hoạch xin lỗi | `talk` | |
| | Tìm Hạ + giữ giùm | `goto` → `talk` → `choice` (không lưu) → `place` (kẹp tờ vẽ vào sổ) | Mở kỷ vật |
| B thứ Sáu | Đức rủ làm hòm thư | `talk` | |
| | Làm hòm thư (5 việc) | **bước K3 mới** (xem §4.1) | Lưu `boxStyle` |
| | Thư xin lỗi của Đức | `choice` (3 câu mở đầu, **không lưu**) → bước đọc thư → `place` (thư vào khe) | `UI_APOLOGY_LETTER` |
| | Hạ đọc thư | `goto` hiên Z02b → `talk` | Hạ lấy thư ở ngăn **riêng** |
| | Quét sân | `photo` (cầm tay, Đức cầm chổi) | Ảnh phụ |
| C thứ Hai | Toán với Quân | `choice` + `talk` + minigame ném rổ cũ | Giữ như v1.4; **không** phải Minigame 1 |
| D thứ Ba | Viết thư | `choice` hai tầng (người nhận → loại/câu) | 17 lựa chọn, danh sách cố định |
| | Giờ ra chơi | `talk` (phản ứng theo loại thư) | |
| | Buổi chiều | rẽ nhánh (§4.2) | 3 minigame + 4 bản rút gọn |
| | Mở hòm thư | `cutscene` | Câu chốt theo loại thư |
| | Ảnh nhóm | `photo` mode `timer`, `stand_zone` | **Ảnh chính** |

Lưu ý bước `minigame` hiện trong code chỉ là thẻ giả (`game`, `level: 'min'`) — **khung minigame thật chưa có** (xem `PAGE_DATA_GUIDE` §3). Trang 6 cần dựng khung đó hoặc dùng chung khung của Trang 1/5/7 nếu đã có trên nhánh bạn làm.

## 4. Việc phải dựng

### 4.1 Làm hòm thư (Cảnh B) — `02` §2.5.1
Năm việc theo thứ tự: màu nền → dán giấy 3 mặt → trang trí → khe + ngăn chung + nắp → bảng nội quy (**giữ đủ 3 điều, người chơi chỉ chọn kiểu bảng**). Không thất bại. **Xong khi** đủ 5 việc → hòm thư đặt ở Căn cứ (Z05) → ở lại tới hết Trang 9. Lưu `boxStyle`.

### 4.2 Rẽ nhánh buổi chiều — `02` §2.5.2–2.5.3
| Player gửi | Nhánh |
|---|---|
| Thư **"rủ làm việc chung" gửi riêng** cho Đức / Châu / Quân / Hạ | Nhánh **riêng** của bạn đó |
| Thư cảm ơn hoặc trêu gửi riêng; **mọi** thư gửi cả nhóm | Nhánh **chung** "Một buổi Valentine của năm đứa" |

Chỉ đi **một** nhánh mỗi lần chơi; nhánh suy ra từ `recipient` + `kind`, không lưu riêng.

| Nhánh | Hình thức | Mức |
|---|---|---|
| Quân — Thử thách ném rổ | **Minigame 1 · Ném bóng tính điểm** (`02` §2.5.3a) | Đầy đủ |
| Hạ — Một vòng sân trường | **Minigame 2 · Săn góc ảnh** (`02` §2.5.3b) | Đầy đủ |
| Chung | **Minigame 3 · Trang trí Căn cứ** + "Đoán xem ai là người…" (`02` §2.5.3c) | Đầy đủ |
| Đức — Kèo ăn vặt | Chọn 1 món cho mình + 1 món để chia | Rút gọn |
| Châu — Danh sách mua sắm | Nhặt 3 món Châu đọc | Rút gọn |

**Mọi minigame có nút "Bỏ qua"** từ đầu → sang thoại kết. Không có trạng thái thua chặn truyện.

> **Đã chốt vs. chưa chốt:** chủ dự án nói "3 minigame thôi" nhưng **chưa chỉ định 3 trò nào**. Ba trò trên là **mặc định của Claude (PROPOSED)** — hỏi chủ dự án xác nhận trước khi dựng nếu có thể; đổi trò thì chỉ cần hoán đổi giữa "đầy đủ" và "rút gọn", không đổi cấu trúc rẽ nhánh.

### 4.3 Thư xin lỗi của Đức (Cảnh B) — `02` §2.5.1b
Chọn 1 trong 3 câu mở đầu (không lưu) → lật 4 dòng thân thư cố định → kéo thư (phong bì "Hạ") vào khe → Hạ lấy ở ngăn riêng, đọc một mình. **Lời của Đức và Hạ giữ đúng chữ trong kịch bản**, không viết lại.

### 4.4 Hết Trang, phần thưởng, phòng 2026
- **Hết Trang khi** Player giữ ảnh nhóm Valentine (bước 5 Cảnh D). Không còn bước Main nào sau đó.
- **Album trang "Valentine"** *(ánh xạ ô là PROPOSED)*: ô chính (`required_for_restore: true`) = **ảnh nhóm bên hòm thư**; ảnh phụ = Đức cầm chổi; nhánh riêng Đức/Châu/Quân = "Player × bạn"; nhánh Hạ = "Góc ảnh Hạ chọn" (ảnh phong cảnh, không có người); tờ vẽ chiếc lá và tờ nháp mặt cười của Quân vào dạng hình nhỏ.
- **Phòng 2026:** tờ vẽ chiếc lá **kẹp trong sổ nhỏ** của Player trên kệ (không dán tường); **ảnh nhóm Valentine dán tường** (PROPOSED). Thêm hai Present-day Event cho `d.g08.02` theo `PAGE_DATA_GUIDE` §5 (`RESTORE`, `SHELF`).
- **Sau Trang 6:** hòm thư là đồ nền ở Căn cứ Trang 7 và 9 (không thoại mới); Trang 9 Cảnh B, Quân khiêng nó xếp vào thùng.

## 5. Lưu và số liệu đo
**Lưu** (`02` §4.2, tất cả PROPOSED): `story.valentine.recipient` (`duc`/`chau`/`quan`/`ha`/`group`) · `story.valentine.kind` (`thanks`/`tease`/`invite`/`group_text`/`group_drawing`) · `story.valentine.groupMsg` (mã câu viết sẵn, không lưu chữ) · `story.valentine.boxStyle` · `minigames.valentine.branch.result` (xong / bỏ qua). **Không lưu** câu mở đầu thư xin lỗi.

**Event đo** (`02` §5.1): dùng `page_started` / `page_completed` cho `d.g08.02`, `minigame_started` / `minigame_finished` cho ba trò (đề xuất `game_id`: `valentine_throw`, `valentine_photo_hunt`, `valentine_decorate`; `result` có `complete` / `quit`), `valentine_letter_sent` (tùy chọn). **Chỉ mã chọn sẵn; tuyệt đối không gửi chữ tự do hay nội dung thư.** Khớp `shared/events.ts` (đã có `minigame_*`; `valentine_letter_sent` chưa có — thêm nếu dùng).

## 6. Asset (`03`) — trạng thái
| Cần | Trạng thái |
|---|---|
| Hình hòm thư + 1–2 kiểu bảng nội quy | **Chưa có concept** — chờ ChatGPT/Gemini phác, chủ dự án duyệt (quy trình concept → duyệt → dựng). Trong lúc chờ, dựng **hình khối tạm** (hộp có khe, ngăn chung, nắp; bảng phẳng) để chạy luồng |
| Đạo cụ: vật liệu làm hòm, thư + phong bì (thư xin lỗi), ba món ăn vặt, danh sách mua sắm, bộ trang trí 4 nhóm | `[Cần tạo mới]`, dựng bằng script/canvas |
| UI: `UI_CONFESSION`, `UI_MAILBOX_CRAFT`, `UI_APOLOGY_LETTER`, `UI_LETTER_PICKER`, `UI_LETTER_READ`, `UI_VALENTINE_MINI` | `[Cần tạo mới]` |
| SFX: `SFX_GLUE_PAPER`, `SFX_LETTER_DROP`, `SFX_MAILBOX_OPEN` | `[Cần tạo mới]` |
Không dùng ảnh concept làm model 3D mặc định; giữ stylized low-poly, ngân sách theo `03` §1.2 (còn phải đo lại trên laptop thật).

## 7. Định nghĩa "xong" và cách kiểm
1. Vào thẳng Trang bằng `?play=1&day=d.g08.02`; chơi A→D không tắt.
2. **17 lựa chọn thư** ở Cảnh D (4 bạn × 3 loại + cả nhóm 4 câu + 1 tranh) **đều** tới được ảnh nhóm và hết Trang.
3. **5 nhánh chiều** đều tới được thoại kết; từng minigame đều bấm được "Bỏ qua".
4. Tải lại trang giữa Cảnh B (sau khi làm hòm thư) → về đúng checkpoint, hòm thư vẫn còn.
5. Hạ không nhận chơi ở Khu Vui Chơi từ Cảnh A tới khi nhận lời xin lỗi (Cảnh B bước 4); từ Cảnh C không còn khóa.
6. Không có chữ tự do nào trong save hay event; không có tên Player trong event.
7. Chạy `npm test`, `npm run validate:world`, ca e2e mới cho Trang 6; **ghi lại kết quả thật**, không ghi "đã kiểm" nếu chưa chạy.

## 8. Không làm
Không dùng nghĩa cũ "Hòm thư thả thính" (bao lì xì, Điều 4 của Đức, hòm có khóa) · không thêm căn-tin (đồ ăn ở **xe quà vặt** Z03) · không nhập chữ tự do · không đổi mã trang `d.g08.02` · không dùng "Chương" · không thêm multiplayer / gacha / thanh toán · không sửa raw ideas hay file nguồn cũ · không tự ý đổi nội dung đã CONFIRMED (đề xuất trong báo cáo cuối phiên).

## 9. Điểm còn mở — hỏi chủ dự án khi gặp
| # | Vấn đề | Mặc định đang dùng |
|---|---|---|
| 1 | **Ba minigame nào?** (chủ dự án chưa chỉ định) | Ném bóng · Săn góc ảnh · Trang trí Căn cứ |
| 2 | "Điều 6 giữ y nguyên": hiểu là câu hỏi số 6 (giữ đủ 3 điều bảng nội quy). Nếu ý là Điều 6 trong sổ luật Căn cứ (Trang 3) thì cũng **không đổi gì** | Cả hai cách đều không đổi nội dung |
| 3 | Concept hình hòm thư + bảng | Hình khối tạm |
| 4 | Tên bạn lớp "Tú" và việc Đức mang điện thoại vào trường | Tên tạm |
| 5 | Giá món ăn, ngân sách Kèo ăn vặt | Dev đặt giá khởi điểm |
| 6 | Người giữ giọng nhân vật rà lại lời thư / phản ứng / câu chốt | Lời mẫu của Claude (chủ dự án ủy quyền) |

## 10. Cuối phiên dev
Cập nhật `SESSION_HANDOFF` (quyết định, file đổi, đã kiểm thật / chưa kiểm, điểm chưa rõ, bước tiếp). Không đóng dấu APPROVED thay chủ dự án.

## Changelog
- v1.0-draft — 21/11/2026: Bản đầu, viết sau khi chủ dự án trả lời 6 câu rà soát.
