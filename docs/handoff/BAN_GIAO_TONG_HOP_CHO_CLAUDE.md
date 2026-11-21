# BẢN BÀN GIAO TOÀN DIỆN CHO CLAUDE CODE
## DỰ ÁN: HÀNH TRÌNH THANH XUÂN — "NHỮNG NGÀY MÌNH CÒN NHỎ" (GAME-KNDMST)
**Người lập:** Gemini Pro (Antigravity — Kiến trúc sư Kịch bản & Minigame)  
**Người nhận:** Claude Code (Kỹ sư Trưởng Triển khai Runtime, UI & Tích hợp Hệ thống)  
**Thời điểm bàn giao:** 22/11/2026 (UTC+7)  
**Hạn chót bản playtest nội bộ:** 04/12/2026 | **Kỳ đo đạc môn học:** 05–15/12/2026  

---

## 1. TỔNG QUAN TÌNH TRẠNG DỰ ÁN & CÁC KẾT QUẢ ĐÃ ĐẠT ĐƯỢC

Toàn bộ tài nguyên thiết kế, kịch bản, số hóa và logic minigame đã được rà soát và cấu trúc hóa hoàn chỉnh:
1. **Tài liệu Thiết kế Hợp nhất (Single Source of Truth):**
   - Đã tổng hợp toàn bộ GDD, kịch bản văn học, hệ thống xưng hô, 11 minigame, đạo cụ, ánh sáng và bối cảnh thành duy nhất 1 file Markdown hoàn chỉnh: `docs/GAME_DESIGN_DOCUMENT_TONG_HOP.md` (hoặc ở thư mục gốc workspace `GAME_DESIGN_DOCUMENT_TONG_HOP.md`).
2. **Số hóa Kịch bản (T-06):**
   - **Mốc 1 (Trang 1 → Trang 4):** Đã số hóa 100% thoại chuẩn tiếng Việt (`HUMAN_CANON`), không có thoại AI tự bịa. Điểm kết thúc demo đặt ngay sau Trang 4 với tin nhắn hoài niệm: *"Ê. Nhớ hồi tụi mình mới đủ năm đứa không? Lâu quá rồi ha."*
   - **Mốc 2 (Trang 5 → Trang 9):** Đã số hóa đầy đủ 5 Trang còn lại (gồm Trang 6 Hòm thư Valentine 4 cảnh, ván caro Trang 5, Sudoku Trang 7, U23/Hội trại Trang 8, bế giảng Trang 9) trên nhánh `content/m2-so-hoa`.
3. **Logic Engine 11 Minigame:**
   - Đã lập trình hoàn tất 100% trong `src/minigames/` (nhánh `content/m1-buoc-choi`): State Machine độc lập, phân xử Thắng/Thua, tính Sao, AI 4 cấp độ đối thủ (`duc`, `ha`, `quan`, `chau`) và unit tests đạt 100% PASS.

---

## 2. MA TRẬN ĐỐI CHIẾU 11 ĐIỂM MÂU THUẪN & HƯỚNG DẪN XỬ LÝ CHO CLAUDE CODE

Claude Code cần nắm rõ 11 điểm sau khi kiểm tra và lập trình tiếp:

| # | Vấn đề & Mâu thuẫn | Hiện trạng trong Code / Tài liệu | Quyết định đã chốt & Hướng dẫn sửa | Mức độ ưu tiên |
|:---:|---|---|---|:---:|
| **1** | **Bản production bị rỗng** | `src/content/release.ts`: `production: { memory_day_ids: [], end_day_id: null }`. Mở trang production sẽ bị trắng màn hình / chặn vào game. | Thêm 4 Trang Mốc 1 vào production: `memory_day_ids: ['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03']`, `end_day_id: 'd.g07.03'`, `end_step_id: 'q_hub_pd_03.s01'`. | **P0 (Chặn)** |
| **2** | **Lỗi kẹt bước `goto` (Bug A-01)** | `src/game/game.ts:462–468`: chỉ kích hoạt `arrive` khi người chơi **vừa mới bước vào** bán kính (`!inside.has(id)`). Đứng sẵn từ trước sẽ bị kẹt. | Đổi logic proximity: nếu mục tiêu hiện tại là `goto` và người chơi đã nằm trong bán kính target thì trigger ngay. | **P0 (Chặn)** |
| **3** | **Thời gian hẹn giờ máy ảnh** | GDD `02 §2.4.5` và kịch bản bắt buộc hẹn giờ **10 giây**. Code `src/config/photo.ts` đang để **8 giây**. | Đổi `timer_seconds: 10` trong `src/config/photo.ts` (cập nhật test e2e tương ứng). | **P1 (Cao)** |
| **4** | **Chiều cao nhân vật Lớp 8–9** | Model GLB nhánh asset cao 0,63–0,77m (sai). Code `build.ts` lớp 9 cao 1,58–1,72m. Quyết định 21/11 (tối) chốt GDD nâng lên **1,55–1,65m**. | Cập nhật `AVATAR_HEIGHT_RANGE_M[9]` trong `src/actors/player/rigAdapter.ts` và unit test `rigAdapter.test.ts` để không báo lỗi. | **P1 (Cao)** |
| **5** | **Gốc tọa độ bàn học sinh** | GDD `03 §1.1` bắt `min.y = 0` (chạm sàn). File `public/assets/props/prp_desk_2seat.glb` có `min.y = -0.663` (gốc ở mặt bàn). | Dùng Blender hoặc script Three.js bù trừ `position.y += 0.663` khi load để bàn không bị chìm xuống đất. | **P1 (Cao)** |
| **6** | **Nguy cơ xóa Save khi tăng Version** | `src/core/save.ts`: `load()` gọi `this.drop()` nếu `p.v !== SAVE_VERSION`. | Khi thêm các trường `minigames.*` và nâng v2→v3, viết hàm migration giữ lại tên, giới tính và ảnh chụp IndexedDB. | **P1 (Cao)** |
| **7** | **Event Bus thiếu `bus.emit`** | `src/analytics/bridge.ts` có listener `hub_opened`, `free_photo_taken`, `feedback_submitted` nhưng không đâu phát ra. | Bổ sung `bus.emit()` tại `hubScene.ts`, `GameUi.tsx` và khai báo `valentine_letter_sent` vào `shared/events.ts`. | **P2 (Vừa)** |
| **8** | **Phiên bản Blender chuẩn** | `00_MASTER_GDD.md §9` ghi 5.2 LTS; pipeline thực tế chốt **4.5.16 LTS**. | Giữ 4.5.16 LTS làm chuẩn sản xuất; tài liệu tổng hợp đã chuẩn hóa. | **P2 (Vừa)** |
| **9** | **Vị trí "Đoán xem ai là người..."** | `02 §2.4.6` ghi ở nhánh rút gọn; `02 §2.5.3c` ghi ở nhánh chung. | Chuẩn hóa: nằm ở **nhánh chung 5 đứa** buổi chiều Valentine sau Trang trí Căn cứ. | **P2 (Vừa)** |
| **10** | **Sai lệch model Cây bàng** | `schoolyard_shade_tree.glb` bị copy trùng 100% hash md5 với cây phượng (12.224 tam giác, vượt ngân sách). | Tạm thời code render bằng `src/world/school/props.ts`; khi gộp asset 3D cần thay bằng model bàng tán tầng thật. | **P2 (Vừa)** |
| **11** | **Căn-tin vs Xe quà vặt** | Bản nháp cũ còn chữ "căn-tin". | GDD đã CONFIRMED: **không dựng căn-tin**, mọi cảnh ăn vặt gom về **Z03 - xe quà vặt cổng trường**. | **P3 (Đã xong)** |

---

## 3. TOÀN BỘ CÁC CỜ (FLAGS) ĐÁNH DẤU AI HOẶC CHỜ CANON / CHỦ DỰ ÁN PHÊ DUYỆT

### 3.1 Trong Mã nguồn TypeScript (`src/`)
1. **Các Side Quest mang nhãn `HUMAN_DRAFT`:**
   - Toàn bộ Side Quest ở cả 9 file `src/content/days/d_g*.ts` (`q_m1_side_01` đến `q_m2_side_05`) hiện mang cờ `ownership_label: 'HUMAN_DRAFT'`.
   - *Lưu ý:* Validator `npm run validate:content` chặn bản production nếu Main Quest có cờ này; Side Quest được phép nhưng cần Chủ dự án đóng dấu `HUMAN_CANON` để hoàn thiện 100%.
2. **Nhãn `[PLACEHOLDER]` còn sót:**
   - `src/content/chapters.ts`: `[PLACEHOLDER] Mốc 1 · lớp 6–7` và `[PLACEHOLDER] Mốc 2 · lớp 8–9` (cần xóa chữ `[PLACEHOLDER]`).
   - `src/ui/game/GameUi.tsx#L254`: Đoạn text placeholder của form phản hồi.
3. **Cờ tạm `m1.placeholder_tone`:**
   - Trong `src/content/days/d_g07_03.ts#L77–L79`, bước chọn lời hẹn cuối lớp 7 đang gán cờ `'m1.placeholder_tone'` (cần đổi sang `'m1.end_tone'` hoặc `'c_m1_05_tone'`).

### 3.2 Các điểm gắn nhãn `UNDECIDED` / `Còn mở` / `Tên tạm` trong GDD
1. **D-08:** Diễn biến hội ngộ Mốc 3 (ngoài phạm vi bản public).
2. **Q5:** Bộ tham số tuổi cho nhân vật `AGE_G8_9` và `AGE_G10_12`.
3. **Tên chính thức:** Cô Diệp chủ nhiệm và bạn Tú (hiện là tên tạm).
4. **Nhân vật "Bạn thư viện":** Không lộ mặt trong Mốc 2; còn mở cho Mốc 3.
5. **Đề xuất 3 sắc thái Analytics:** Bổ sung sắc thái cho `c_m1_02_wish` (Trang 2) và `c_m1_03_decor` (Trang 3).
6. **Bảng giá ăn vặt:** Các con số giá tiền trong nhánh Kèo ăn vặt Trang 6 (để dev tự cấu hình khởi điểm).

---

## 4. LỘ TRÌNH THỰC HIỆN TIẾP THEO CHO CLAUDE CODE (SẮP XẾP THEO ĐỘ ƯU TIÊN)

```
[BƯỚC 1: SỬA LỖI P0 & ĐỒNG BỘ CẤU HÌNH] (T-01)
  ├── 1. Mở mảng production trong src/content/release.ts (Trang 1 → Trang 4).
  ├── 2. Sửa proximity logic trong src/game/game.ts (khắc phục kẹt goto A-01).
  ├── 3. Chỉnh timer_seconds: 10 trong src/config/photo.ts.
  ├── 4. Cập nhật AVATAR_HEIGHT_RANGE_M[9] thành 1.55–1.65m trong rigAdapter.ts.
  └── 5. Bỏ [PLACEHOLDER] trong chapters.ts và đổi 'm1.placeholder_tone'.

[BƯỚC 2: RÁP NỐI UI OVERLAY CHO 4 MINIGAME ƯU TIÊN MỐC 1] (T-02 & T-04)
  ├── 1. Ô Ăn Quan (src/minigames/o_an_quan.ts) -> Tạo UI OAnQuanView.tsx tại Căn cứ Z05.
  ├── 2. Nhảy Lò Cò (src/minigames/nhay_lo_co.ts) -> Tạo UI HopscotchView.tsx tại Căn cứ Z05.
  ├── 3. Gấp Thuyền Giấy (src/minigames/fold_boat.ts) -> Ráp vào bước q_m1_main_02.s03 rãnh nước Trang 2.
  └── 4. Ép Bướm Hoa Phượng (src/minigames/phoenix_butterfly.ts) -> Ráp vào Trang 4 gốc phượng.

[BƯỚC 3: KIỂM THỬ TỰ ĐỘNG & ĐO FPS THẬT]
  ├── Chạy npx tsc --noEmit (phải đạt 0 lỗi).
  ├── Chạy npm test (toàn bộ unit test minigames và quests đạt 100%).
  ├── Chạy npm run validate:world (bản đồ 6 khu đạt 0 lỗi).
  └── Build production: VERCEL_ENV=production npm run build (kiểm tra dung lượng bundle).
```

---

## 5. BẢN ĐỒ NHÁNH GIT HIỆN TẠI & HƯỚNG DẪN GỘP

- `feat/sprint-0412`: Nhánh code chính (Baseline cho bản thử 04/12).
- `content/m1-buoc-choi`: Chứa 11 minigame engine Mốc 1 và các cập nhật 3D school props.
- `content/m2-so-hoa`: Chứa kịch bản số hóa đủ 9 Trang và biên bản kiểm toán.
- `docs/sync-approved-gdd-v1`: Chứa GDD v1.0 APPROVED và kịch bản Trang 6 Valentine v1.5.

> **Quy tắc tuyệt đối:** Không push force, không gộp vào nhánh `main` khi chưa có lệnh của Chủ dự án. Kiểm tra máy thật bằng `npm test` và `npx tsc --noEmit` trước mỗi commit.
