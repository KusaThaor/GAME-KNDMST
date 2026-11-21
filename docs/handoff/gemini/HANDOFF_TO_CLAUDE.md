# BIÊN BẢN BÀN GIAO TOÀN DIỆN MỐC 2 (GEMINI PRO -> CLAUDE CODE)

> **Dự án:** Hành Trình Thanh Xuân (KNĐMST)  
> **Người bàn giao:** Gemini Pro (Antigravity — Phụ trách Số hóa Kịch bản)  
> **Người nhận:** Claude Code (Phụ trách Triển khai Kỹ thuật, Minigame & Runtime Engine)  
> **Thời gian bàn giao:** 22/11/2026, 00:05 UTC+7  
> **Nhiệm vụ:** Số hóa kịch bản Trang 5, 6, 7, 8, 9 (Mốc 2: Lớp 8–9), Chuyển Mốc và Kết thúc Demo Mốc 2  
> **Nhánh git:** `content/m2-so-hoa` (tách từ `feat/sprint-0412`, không gộp vào `main` hay `dev`)  
> **Trạng thái kiểm thử:** 
> - `npx tsc --noEmit`: **ĐẠT (0 lỗi)**  
> - `npm test`: **ĐẠT 100% (23 files passed, 1 skipped; 267 passed, 1 skipped)**  

---

## 1. TỔNG QUAN HỆ THỐNG ĐÃ SỐ HÓA

Toàn bộ nội dung Mốc 2 đã được số hóa trung thực từ Kịch bản văn học v1.4, GDD 01, GDD 02, Implementation Handoff Trang 6 Valentine và Phụ lục A, B, E. Tất cả các bước tuân thủ triệt để cấu trúc schema hiện có (không bịa loại bước mới), bảo đảm định dạng 2 dòng thoại, giữ nguyên xưng hô nhân vật và cờ lưu trữ theo đúng quy chuẩn.

### 1.1. Các tệp dữ liệu cốt truyện mới (Mốc 2)
1. **`src/content/days/d_g08_01.ts` (Trang 5 — Hộp phấn không bao giờ vơi · Lớp 8, 2016–2017)**
   - **Ngày:** `d.g08.01`, Thuộc Mốc 2 (`m2`), Năm học 2016–2017 (`sy_2016_2017`).
   - **Kỷ vật:** `art_m2_01` (Hộp phấn không vơi KV-01).
   - **Nhiệm vụ:**
     - Main chain `q_m2_main_01`: Mở đầu buổi phân công trực nhật, lau bảng phụ, phát hiện hộp phấn bí mật, tỉ thí cờ caro nảy lửa với Đức trên mặt bàn, ghi tỉ số "4–3 (chưa xong)" lên nắp hộp phấn.
     - Side quest `q_m2_side_01`: Thử thách lật chai nước (`mg_bottle_flip`) với Quân tại góc sân sau.
     - Daily quest `q_m2_daily_01`: Trực nhật gom rác sân bóng rổ.
   - **Cờ lựa chọn:** `c_m2_01_winner` (`duc` / `quan` / `draw`).
   - **Minigame khai báo:** `mg_wipe_board`, `mg_caro`, `mg_bottle_flip`.
   - **Ký ức & Album:** 5 mảnh `frag.d.g08.01.01`..`05`, 5 ô album `alb.d.g08.01.01`..`05`.

2. **`src/content/days/d_g08_02.ts` (Trang 6 — Hộp thư Valentine và chiếc lá vẽ dở · Lớp 8, 14/02/2017)**
   - **Ngày:** `d.g08.02`, Thuộc Mốc 2 (`m2`), Năm học 2016–2017 (`sy_2016_2017`).
   - **Kỷ vật:** `art_m2_02` (Tờ vẽ chiếc lá KV-02).
   - **Nhiệm vụ:** Tuân thủ chặt chẽ tài liệu `IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md`.
     - Main chain `q_m2_main_02`: Ý tưởng làm hộp thư bí mật, chế tác hộp thư từ vỏ bìa carton (`mg_mailbox_craft`), viết thư xin lỗi Hạ (`mg_apology_letter`), chọn thư Valentine bỏ hộp (`mg_letter_picker`), ném bóng rổ giải tỏa (`mg_ball_toss`), hồi hộp mở hộp thư ngày 14/2 và nhận bức vẽ chiếc lá phong vẽ dở.
     - Side quest `q_m2_side_02`: Giúp Hạ tìm cuộn phim / ảnh chụp kỷ niệm thất lạc (`mg_photo_hunt`).
     - Daily quest `q_m2_daily_02`: Dọn dẹp và trang trí góc Căn cứ (`mg_base_decor`).
   - **Cờ lựa chọn:** `c_m2_02_recipient` (`an` / `chau` / `duc` / `quan`), `c_m2_02_tone` (`gentle` / `playful` / `deep`).
   - **Minigame khai báo:** `mg_mailbox_craft`, `mg_apology_letter`, `mg_letter_picker`, `mg_ball_toss`, `mg_photo_hunt`, `mg_base_decor`.
   - **Ký ức & Album:** 5 mảnh `frag.d.g08.02.01`..`05`, 5 ô album `alb.d.g08.02.01`..`05`.

3. **`src/content/days/d_g09_01.ts` (Trang 7 — Tờ báo tường và góc bảng phụ · Lớp 9, 2017–2018)**
   - **Ngày:** `d.g09.01`, Thuộc Mốc 2 (`m2`), Năm học 2017–2018 (`sy_2017_2018`).
   - **Kỷ vật:** `art_m2_03` (Bút máy mực tím KV-03).
   - **Nhiệm vụ:**
     - Main chain `q_m2_main_03`: Họp nhóm Căn cứ phân công làm báo tường 20/11, chọn chủ đề bài viết (`c_m2_03_theme`), chép và trang trí báo tường (`mg_wall_paper`), phát hiện nét chữ bút máy nắn nót của cả nhóm, treo báo tường lên bảng tin hành lang.
     - Side quest `q_m2_side_03`: Đố ô số Sudoku (`mg_sudoku`) trên góc bảng phụ với Quân.
     - Daily quest `q_m2_daily_03`: Kiểm tra lịch trực tuần của sao đỏ.
   - **Cờ lựa chọn:** `c_m2_03_theme` (`memories` / `teachers` / `future`).
   - **Minigame khai báo:** `mg_sudoku`, `mg_wall_paper`.
   - **Ký ức & Album:** 5 mảnh `frag.d.g09.01.01`..`05`, 5 ô album `alb.d.g09.01.01`..`05`.

4. **`src/content/days/d_g09_02.ts` (Trang 8 — Đêm hội trại và màu cờ tuyết trắng · Lớp 9, 27/01/2018 & 03/2018)**
   - **Ngày:** `d.g09.02`, Thuộc Mốc 2 (`m2`), Năm học 2017–2018 (`sy_2017_2018`).
   - **Kỷ vật:** `art_m2_04` (Sticker cờ đỏ sao vàng KV-04).
   - **Nhiệm vụ:**
     - Main chain `q_m2_main_04`: Tụ tập tại quán tạp hóa xem chung kết U23 châu Á Thường Châu trong mưa tuyết, tô màu cờ đỏ sao vàng (`mg_flag_color`), chọn vị trí dán cờ (`c_m2_04_flag_spot`), chuyển tiếp sang đêm lửa trại tháng 3/2018, tham gia nhảy cổ động theo nhịp trống (`mg_cheer_rhythm`), chọn phong cách cổ vũ (`c_m2_04_cheer_style`).
     - Side quest `q_m2_side_04`: Xếp hàng ghế sân khấu hội trại (`mg_chair_row`) cùng An.
     - Daily quest `q_m2_daily_04`: Thu dọn tàn tro và củi sau đêm lửa trại.
   - **Cờ lựa chọn:** `c_m2_04_flag_spot` (`cheek` / `forehead` / `shirt`), `c_m2_04_cheer_style` (`chant` / `clap` / `flag`).
   - **Minigame khai báo:** `mg_flag_color`, `mg_chair_row`, `mg_cheer_rhythm`.
   - **Ký ức & Album:** 5 mảnh `frag.d.g09.02.01`..`05`, 5 ô album `alb.d.g09.02.01`..`05`.

5. **`src/content/days/d_g09_03.ts` (Trang 9 — Chiếc áo đồng phục kín chữ ký · Lớp 9, 05/2018)**
   - **Ngày:** `d.g09.03`, Thuộc Mốc 2 (`m2`), Năm học 2017–2018 (`sy_2017_2018`).
   - **Kỷ vật:** `art_m2_05` (Chiếc áo đồng phục kín chữ ký KV-05).
   - **Nhiệm vụ:**
     - Main chain `q_m2_main_05`: Buổi lễ bế giảng chia tay cấp 2, chọn vị trí ký áo đồng phục (`c_m2_05_shirt_spot`), ký tên lên áo nhau (`mg_sign_shirt`), bổ sung Điều 6 vào cuốn sổ luật Căn cứ bí mật (`c_m2_05_rule6_add` & `mg_rule6`), cùng điểm chỉ 5 dấu vân tay mực xanh (`mg_fingerprint`), ôm tạm biệt trước khi bước vào kỳ thi cấp 3.
     - Side quest `q_m2_side_05`: Ký lưu bút và vẽ một nhánh cỏ may mắn vào sổ tay của Hạ.
     - Daily quest `q_m2_daily_05`: Quét sạch lớp học lần cuối trước khi bàn giao phòng.
   - **Cờ lựa chọn:** `c_m2_05_shirt_spot` (`back` / `chest` / `sleeve`), `c_m2_05_rule6_add` (`promise` / `reunion` / `memory`).
   - **Minigame khai báo:** `mg_sign_shirt`, `mg_rule6`, `mg_fingerprint`.
   - **Ký ức & Album:** 5 mảnh `frag.d.g09.03.01`..`05`, 5 ô album `alb.d.g09.03.01`..`05`.

### 1.2. Hub 2026: Chuyển Mốc và Kết thúc Demo Mốc 2 (`src/content/hub.ts`)
- **Đoạn Chuyển Mốc:** Quest `q_hub_pd_04` (sau khi hoàn thành Mốc 1, nhân vật hồi tưởng lại quãng thời gian lớp 8–9, lật tiếp sang trang Mốc 2 của Album).
- **Đoạn Kết thúc Demo Mốc 2:**
  - Quest `q_hub_pd_05`: Khép lại cuốn album Mốc 2 sau khi Trang 9 hoàn tất, cảm xúc lắng đọng về tuổi học trò cấp 2.
  - Quest `q_hub_pd_06`: Mở lại điện thoại (`s01`), soạn và gửi tin nhắn vào nhóm chat "Căn cứ Bí mật" (`s02`).
  - **Giữ nguyên Mốc 1:** Nhiệm vụ `q_hub_pd_03` của Mốc 1 được giữ nguyên 100%, không bị sửa đổi.
- **Sự kiện phòng 2026 (PDEs):** Bổ sung `pde_11`..`pde_20` kích hoạt tương tác đặt kỷ vật (`SHELF`) và phục hồi trang album (`RESTORE`) tương ứng cho Trang 5, 6, 7, 8, 9.

### 1.3. Cấu trúc Pack, Chapters và Release Profile
- **`src/content/chapters.ts`:** Bổ sung nhóm chương `ch_m2` với nhãn `"[PLACEHOLDER] Mốc 2 · lớp 8–9"` chứa 5 ngày `['d.g08.01', 'd.g08.02', 'd.g09.01', 'd.g09.02', 'd.g09.03']`.
- **`src/content/pack.ts`:** Import và đưa đủ 9 Ngày (`d0601` đến `d0903`) vào mảng `DAYS`.
- **`src/content/release.ts`:** Bổ sung profile `test_m2` chạy độc lập với profile `test` (chi tiết ở mục 2).

---

## 2. NĂM QUYẾT ĐỊNH KỸ THUẬT ĐÃ ĐƯỢC CHỦ DỰ ÁN PHÊ DUYỆT (21/11/2026)

Dưới đây là 5 quyết định chính thức từ Chủ dự án kèm hướng dẫn chi tiết dành riêng cho Claude Code và các đội phối hợp:

### Quyết định 1 (Câu 1): Điểm đứng & Marker 3D chưa có trong `map_thcs.index.json`
- **Phương án chọn:** **Phương án A (Khuyên dùng)**.
- **Hiện trạng dữ liệu:** Toàn bộ dữ liệu kịch bản Trang 5–9 đang tạm thời liên kết tới các marker gần nhất trong `map_thcs`:
  - Tiệm tạp hóa (Trang 8): Tạm dùng `itr.thcs.grocery`, camera `cam.thcs.yard_group`.
  - Sân trường ban đêm / Lửa trại (Trang 8): Tạm dùng zone sân trường với `spot.thcs.yard_bench`.
  - Góc hiên thư viện (Trang 6): Tạm dùng `itr.thcs.bulletin` / `zone.thcs.yard`.
- **Hướng dẫn cho Claude Code / Đội 3D:**
  - Logic dữ liệu kịch bản giữ nguyên.
  - Khi đội 3D/World hoàn thiện asset bổ sung, chỉ cần khai báo thêm các marker vào `map_thcs.index.json` (`cam.thcs.night_camp`, `cam.thcs.grocery_tv`, `itr.thcs.library_porch`) và bổ sung preset ánh sáng ban đêm (`night_camp`) trong `src/world/variants.ts`.

### Quyết định 2 (Câu 2): Màn giao diện đặc thù (Chọn thư Valentine & Báo tường A5)
- **Phương án chọn:** **Phương án A (Khuyên dùng)**.
- **Hiện trạng dữ liệu:** Kết hợp chuỗi 2 bước nối tiếp:
  - **Trang 6 (Valentine):** Bước `choice` (`c_m2_02_recipient` / `c_m2_02_tone`) lưu cờ sắc thái -> Bước `minigame` (`mg_letter_picker`) mở giao diện chọn thư và bỏ vào khe.
  - **Trang 7 (Báo tường):** Bước `choice` (`c_m2_03_theme`) chọn chủ đề bài viết -> Bước `minigame` (`mg_wall_paper`) mở giao diện trang trí báo tường khổ A5.
- **Hướng dẫn cho Claude Code:**
  - Engine không cần tạo thêm schema `kind` bước mới (như `custom_ui`).
  - Khi Claude xây dựng runtime UI cho 2 màn này, UI minigame chỉ cần đọc cờ từ State đã lưu hoặc cho phép người chơi thao tác tương tác trực quan 2D rồi emit hoàn thành minigame.

### Quyết định 3 (Câu 3): Tỉ số Caro trong tin nhắn kết thúc demo
- **Phương án chọn:** **Phương án B**.
- **Hiện trạng dữ liệu:** Tại `src/content/hub.ts` (`q_hub_pd_06.s02`), text của opener `caro` đã được thiết lập:
  ```typescript
  { id: 'caro', tone: 'playful', text: 'Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?' }
  ```
- **Hướng dẫn cho Claude Code:**
  - Trong runtime của Phone UI / Dialog Engine, khi render chuỗi text này:
    - Tìm cờ `minigames.caro.series` trong state người chơi (đã được ghi nhận qua kết quả chơi hoặc lựa chọn ở Trang 5).
    - Nội suy token `{quan}` và `{duc}` tương ứng với số ván thắng.
    - **Fallback:** Nếu cờ chưa tồn tại hoặc người chơi bỏ qua minigame, tự động fallback về tỉ số cố định kịch bản gốc là `"4"` và `"3"` (thành "4–3").

### Quyết định 4 (Câu 4): Điểm kết thúc demo Mốc 2 & Cấu hình `release.ts`
- **Phương án chọn:** **Phương án B**.
- **Hiện trạng cấu hình:** Trong `src/content/release.ts` đã cấu hình song song 2 profile test:
  ```typescript
  export const RELEASES: Record<'test' | 'test_m2' | 'production', ReleaseDef> = {
    test: {
      memory_day_ids: ['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03'],
      end_day_id: 'd.g07.03',
      end_step_id: 'q_hub_pd_03.s01',
    },
    test_m2: {
      memory_day_ids: [
        'd.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03',
        'd.g08.01', 'd.g08.02', 'd.g09.01', 'd.g09.02', 'd.g09.03',
      ],
      end_day_id: 'd.g09.03',
      end_step_id: 'q_hub_pd_06.s02',
    },
    production: { memory_day_ids: [], end_day_id: null },
  };
  ```
- **Hướng dẫn cho Claude Code:**
  - Bản đo đạc Mốc 1 tiếp tục dùng profile `test` mà không bị bất kỳ xáo trộn nào.
  - Môi trường test tự động hoặc công cụ test Mốc 2 chỉ cần gọi `contentConfig('test_m2')` để kiểm tra toàn bộ hành trình 9 Trang.
  - Khi chủ dự án chính thức quyết định phát hành Mốc 2, chỉ cần chuyển nội dung của `test_m2` vào `test` hoặc cập nhật biến môi trường.

### Quyết định 5 (Câu 5): Đăng ký 17 mã minigame vào Registry Runtime
- **Phương án chọn:** **Phương án A (Khuyên dùng)**.
- **Danh sách 17 mã minigame chuẩn:**
  1. `mg_wipe_board` (Trang 5: Lau bảng phụ)
  2. `mg_caro` (Trang 5: Cờ caro 5 ô)
  3. `mg_bottle_flip` (Trang 5: Lật chai nước)
  4. `mg_mailbox_craft` (Trang 6: Gấp dán hộp thư carton)
  5. `mg_apology_letter` (Trang 6: Soạn thư xin lỗi Hạ)
  6. `mg_letter_picker` (Trang 6: Chọn thư Valentine bỏ vào khe)
  7. `mg_ball_toss` (Trang 6: Ném bóng rổ giải tỏa)
  8. `mg_photo_hunt` (Trang 6: Tìm cuộn phim kỷ niệm)
  9. `mg_base_decor` (Trang 6: Dọn dẹp & trang trí Căn cứ)
  10. `mg_sudoku` (Trang 7: Đố ô số Sudoku)
  11. `mg_wall_paper` (Trang 7: Vẽ và trang trí báo tường A5)
  12. `mg_flag_color` (Trang 8: Tô màu cờ đỏ sao vàng)
  13. `mg_chair_row` (Trang 8: Kê hàng ghế hội trường/sân trường)
  14. `mg_cheer_rhythm` (Trang 8: Bắt nhịp cổ động trống đêm hội trại)
  15. `mg_sign_shirt` (Trang 9: Ký tên lên áo đồng phục chia tay)
  16. `mg_rule6` (Trang 9: Viết Điều 6 vào sổ luật Căn cứ)
  17. `mg_fingerprint` (Trang 9: Điểm chỉ vân tay mực xanh)
- **Hướng dẫn cho Claude Code:**
  - Khi xây dựng Minigame Registry hoặc Validator kiểm tra trò chơi, hãy đăng ký đầy đủ 17 mã định danh này.
  - Khởi tạo kèm một adapter/stub pass-through hoặc nút UI "Bỏ qua / Tự động qua màn" để việc test gameplay end-to-end không bị gián đoạn khi chưa có màn chơi chi tiết.

---

## 3. DANH MỤC TÀI LIỆU VÀ FILE ĐỐI CHIẾU

Để phục vụ công tác review, nghiệm thu từng dòng kịch bản, 5 tài liệu đối chiếu chi tiết đã được biên soạn đầy đủ trong thư mục `docs/handoff/gemini/`:
1. [DOI_CHIEU_TRANG_5.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST-sprint/docs/handoff/gemini/DOI_CHIEU_TRANG_5.md): Bảng ma trận đối chiếu Trang 5 (Hộp phấn không vơi).
2. [DOI_CHIEU_TRANG_6.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST-sprint/docs/handoff/gemini/DOI_CHIEU_TRANG_6.md): Bảng ma trận đối chiếu Trang 6 (Hộp thư Valentine và chiếc lá vẽ dở).
3. [DOI_CHIEU_TRANG_7.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST-sprint/docs/handoff/gemini/DOI_CHIEU_TRANG_7.md): Bảng ma trận đối chiếu Trang 7 (Báo tường và góc bảng phụ).
4. [DOI_CHIEU_TRANG_8.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST-sprint/docs/handoff/gemini/DOI_CHIEU_TRANG_8.md): Bảng ma trận đối chiếu Trang 8 (Đêm hội trại và Thường Châu tuyết trắng).
5. [DOI_CHIEU_TRANG_9.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST-sprint/docs/handoff/gemini/DOI_CHIEU_TRANG_9.md): Bảng ma trận đối chiếu Trang 9 (Áo đồng phục kín chữ ký).
6. [QUESTIONS_LOG.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST-sprint/docs/handoff/gemini/QUESTIONS_LOG.md): Nhật ký các vấn đề kỹ thuật và quyết định phê duyệt chính thức của Chủ dự án.

---

## 4. BẰNG CHỨNG KIỂM THỬ MÁY (VERIFICATION EVIDENCE)

Toàn bộ mã nguồn và dữ liệu đã được kiểm tra nghiêm ngặt bằng các lệnh kiểm thử tự động trên máy Windows (chạy qua shell chuẩn):

| Lệnh kiểm thử | Kết quả | Chi tiết kiểm chứng |
|---|---|---|
| `cmd.exe /c "npx tsc --noEmit"` | **ĐẠT (0 lỗi)** | 100% type-checking TypeScript hoàn toàn trong sạch. |
| `cmd.exe /c "npm test"` | **ĐẠT (267/268 tests)** | 23 test suites passed, 1 skipped (`firestore.int.test.ts` do thiếu Firebase credential local); 267 unit tests passed. |
| `validateContent(CONTENT, contentConfig('test'))` | **ĐẠT (0 lỗi, 0 cảnh báo)** | Bản Mốc 1 chạy thông suốt. |
| `validateContent(CONTENT, contentConfig('test_m2'))` | **ĐẠT (0 lỗi, 0 cảnh báo)** | Toàn bộ 9 Trang Mốc 1 + Mốc 2 hợp lệ 100%. |

---

## 5. HƯỚNG DẪN TIẾP NHẬN DÀNH CHO CLAUDE CODE

Nhánh làm việc của đợt bàn giao này là `content/m2-so-hoa`.  
Claude Code có thể tiếp nhận và triển khai tiếp theo quy trình sau:

```bash
# 1. Kiểm tra trạng thái git hiện tại
git status

# 2. Xem lịch sử commit của nhánh Mốc 2
git log -n 8 --oneline

# 3. Chạy kiểm thử tự động để xác nhận trạng thái xanh
cmd.exe /c "npx tsc --noEmit && npm test"

# 4. Khi cần tích hợp vào nhánh làm việc kỹ thuật:
# (Thực hiện merge hoặc cherry-pick theo chỉ đạo của Chủ dự án, tuyệt đối KHÔNG tự ý merge trực tiếp vào main/dev)
```

**Kế hoạch tiếp theo đề xuất cho Claude Code:**
1. Tạo Minigame Registry stub cho 17 mã minigame (theo Quyết định 5).
2. Xây dựng UI Minigame chọn thư Valentine `mg_letter_picker` (Trang 6) và Báo tường `mg_wall_paper` (Trang 7).
3. Hiện thực hóa việc thay thế biến `{quan}–{duc}` trong component Phone UI khi mở tin nhắn caro (theo Quyết định 3).
4. Phối hợp với đội 3D/World cập nhật asset bối cảnh ban đêm cho Trang 8 và các marker mới (theo Quyết định 1).
