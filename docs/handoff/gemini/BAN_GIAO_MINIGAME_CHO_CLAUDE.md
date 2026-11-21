# BÀN GIAO HỆ THỐNG 11 MINIGAME MỐC 1 & KHU VUI CHƠI CĂN CỨ CHO CLAUDE CODE

**Người lập:** Gemini (Số hóa kịch bản & Kiến trúc Minigame)  
**Nhánh:** `content/m1-buoc-choi`  
**Ngày bàn giao:** 22/11/2026  
**Dành cho:** Claude Code (Tích hợp giao diện UI/Overlay và Render Canvas/DOM)

---

## 1. TỔNG QUAN HỆ THỐNG ĐÃ XÂY DỰNG

Toàn bộ hệ thống 11 Minigame đã được lập trình hoàn chỉnh phần **Logic Engine (Core State Machine, AI, Phân xử Thắng/Thua, Chấm Sao, Lời thoại NPC)** trong thư mục `src/minigames/`.

Tất cả các engine tuân thủ nghiêm ngặt:
- **GDD 02 §1 (Vòng đời trò chơi):** Có màn hướng dẫn luật -> chơi -> kết quả -> không chặn cốt truyện khi thua/bỏ cuộc.
- **GDD 02 §2 (Tâm lý nhân vật & Xưng hô):** Đúng xưng hô mục 2.3 (mày - tao, tớ - cậu, anh - em...).
- **GDD 02 §3 (Khu Vui Chơi Căn Cứ):** Hỗ trợ **4 mức độ khó đối thủ phụ thuộc thế mạnh từng người** (Châu, Hạ, Đức, Quân).
- **Type Safety 100%:** `npx tsc --noEmit` đạt 0 lỗi, 22 unit tests chuyên biệt trong `tests/unit/minigames.test.ts` đạt 100% PASS.

---

## 2. BẢNG PHÂN CẤP ƯU TIÊN 11 MINIGAME

| STT | Mã Minigame (`game_id`) | Tên Trò Chơi | Phân Loại | Vị Trí / Bối Cảnh | Mức Ưu Tiên | Trạng Thái Code Engine |
|:---:|:---|:---|:---|:---|:---:|:---:|
| **1** | `o_an_quan` | **Ô Ăn Quan Căn Cứ** | `base_free` | Khu Vui Chơi Căn Cứ | **Ưu tiên 1** | **Hoàn chỉnh 100% (4 cấp AI)** |
| **2** | `nhay_lo_co` | **Nhảy Ô Lò Cò Căn Cứ** | `base_free` | Khu Vui Chơi Căn Cứ | **Ưu tiên 1** | **Hoàn chỉnh 100% (4 cấp AI)** |
| **3** | `fold_boat` | **Gấp Thuyền Giấy Báo** | `story` | Trang 2 (Mương nước sau mưa) | **Ưu tiên 1** | **Hoàn chỉnh 100% (Origami 4 nếp)** |
| **4** | `phoenix_butterfly` | **Ép Bướm Hoa Phượng** | `nature` | Trang 4 (Sân trường sau mưa) | **Ưu tiên 1** | **Hoàn chỉnh 100% (6 bộ phận)** |
| **5** | `ban_bi_ve` | **Bắn Bi Ve Bãi Đất** | `base_free` | Khu Vui Chơi Căn Cứ | **Ưu tiên 2** | Hoàn chỉnh 100% (4 cấp AI + vật lý) |
| **6** | `ruler_battle` | **Búng Thước Kẻ Học Trò** | `classroom` | Trang 1 (Bàn học lớp 6A3) | **Ưu tiên 2** | Hoàn chỉnh 100% (BO3 mép bàn) |
| **7** | `rock_paper_scissors` | **Oẳn Tù Tì Búng Tai** | `classroom` | Trang 1 (Giờ ra chơi) | **Ưu tiên 2** | Hoàn chỉnh 100% (Tâm lý đòn 4 bạn) |
| **8** | `rescue_boat` | **Vớt Thuyền Que Tre** | `story` | Trang 2 (Mương nước) | **Ưu tiên 2** | Hoàn chỉnh 100% (Canh dòng nước) |
| **9** | `sweep_leaves` | **Quét Lá Dọn Căn Cứ** | `story` | Trang 3 (Bãi đất Căn cứ) | **Ưu tiên 3** | Hoàn chỉnh 100% (Vệt chổi gom rác) |
| **10** | `paint_signboard` | **Tô Biển Tên Căn Cứ** | `story` | Trang 3 (Biển hiệu gỗ Căn cứ) | **Ưu tiên 3** | Hoàn chỉnh 100% (5 chữ cái C-Ă-N-C-Ứ) |
| **11** | `raindrop_rhythm` | **Nhịp Mưa Tí Tách** | `nature` | Trang 4 (Mái bạt Căn cứ) | **Ưu tiên 3** | Hoàn chỉnh 100% (Rhythm 3 làn) |

---

## 3. ĐẶC TẢ CHI TIẾT 4 TRÒ ƯU TIÊN HÀNG ĐẦU

### 3.1. Ô Ăn Quan (`src/minigames/o_an_quan.ts`)
- **Bàn cờ:** 12 ô (`board: number[]`).
  - Ô 0..4: 5 ô dân phía người chơi (khởi đầu 5 sỏi/ô).
  - Ô 5: Ô Quan bên phải (khởi đầu 10 sỏi / 1 quan lớn).
  - Ô 6..10: 5 ô dân phía đối thủ (khởi đầu 5 sỏi/ô).
  - Ô 11: Ô Quan bên trái (khởi đầu 10 sỏi / 1 quan lớn).
- **Luật chơi hoàn chỉnh:** Bốc sỏi, rải thuận chiều (`cw`) hoặc ngược chiều (`ccw`), rải liên hoàn, ăn cách 1 ô trống, ăn liên hoàn nhiều ô, vay nợ khi hết sỏi đút dân, thu quân kết thúc khi hết cả 2 ô quan ("Hết quan tàn dân").
- **Hành vi 4 cấp AI đối thủ:**
  - `duc` (Rất dễ - Very Easy): 50% đi ngẫu nhiên bừa bãi, 50% tham ăn trước mắt không nhìn thế cờ sau.
  - `ha` (Dễ - Easy): Đánh cảm tính, có xu hướng nhường nhịn, tuyệt đối không ăn quan nếu còn nước đi khác.
  - `quan` (Trung bình - Medium): Đánh chắc chắn, thuật toán Minimax tính trước 2 bước (nước mình đi và nước phản đòn của người chơi).
  - `chau` (Khó nhất - Hard): Tư duy chiến lược, thuật toán Lookahead 4 bước, chủ động vét quan triệt để và tối ưu hóa hiệu số điểm rải.

### 3.2. Nhảy Ô Lò Cò (`src/minigames/nhay_lo_co.ts`)
- **Sơ đồ 10 ô truyền thống:**
  - Ô 1, 2, 3: Ô đơn (nhảy 1 chân `leg_type: 'single'`).
  - Ô 4-5: Ô kép (bung dạng 2 chân `leg_type: 'double'`).
  - Ô 6: Ô đơn.
  - Ô 7-8: Ô kép.
  - Ô 9: Ô đơn.
  - Ô 10: Ô Chảo / Bán nguyệt (nghỉ 2 chân, quay đầu 180 độ).
- **Cơ chế:**
  - `SET_THROW_POWER` & `THROW_STONE`: Căn lực và góc ném miếng sành vào ô mục tiêu. Ném trượt ra ngoài vạch -> mất lượt.
  - `JUMP`: Nhảy qua các ô. **TUYỆT ĐỐI KHÔNG ĐƯỢC ĐẠP VÀO Ô ĐANG CÓ MIẾNG SÀNH** (vi phạm tính là phạm quy).
  - `MAINTAIN_BALANCE` & `PICK_STONE`: Khi nhảy quay về, dừng trước ô sành, giữ thanh thăng bằng trong vùng an toàn (30..70) để cúi xuống nhặt miếng sành.
- **Thế mạnh 4 đối thủ:**
  - `ha` (Hard): Tỉ lệ ném chuẩn 95%, thăng bằng siêu hạng 95% (bậc thầy lò cò xóm).
  - `chau` (Medium): Ném chuẩn 80%, nhịp nhảy cẩn thận 85%.
  - `duc` (Easy): Hấp tấp, lực ném dễ văng chệch (60%), dễ chao đảo đạp vạch (65%).
  - `quan` (Very Easy): Vụng về chân tay, hay loạng choạng chống 2 chân (tỉ lệ trúng 45%).

### 3.3. Gấp Thuyền Giấy Báo (`src/minigames/fold_boat.ts`)
- **Origami 4 nếp vuốt chuẩn:**
  1. Nếp 1: Gấp đôi tờ giấy theo trục dọc (tạo đường sống thuyền).
  2. Nếp 2: Gấp hai góc tam giác đỉnh chụm vào đường sống giữa (tạo mũi nhọn).
  3. Nếp 3: Gấp mép đáy lật lên hai bên mạn thuyền (tạo vành ca-nô).
  4. Nếp 4: Bung lòng thuyền và miết phẳng đáy (tạo lòng thuyền nổi).
- **Thao tác:** `START_SWIPE` và `FINISH_SWIPE`. Engine tự động tính vector vuốt, góc vuốt, độ lệch so với góc lý tưởng để chấm điểm `accuracy` (0..100%).
- **Thống kê thuyền:** `sharpness` (độ sắc nếp gấp), `symmetry` (độ cân đối mạn thuyền), `buoyancy` (chỉ số nổi), xếp hạng: *Tồi tàn (dễ chìm)*, *Bình thường*, *Cân đối đẹp mắt*, *Chiến hạm giấy báo*.

### 3.4. Ép Bướm Hoa Phượng (`src/minigames/phoenix_butterfly.ts`)
- **6 bộ phận hoa phượng:**
  - `wing_upper_left`, `wing_upper_right` (cánh hoa lớn có đốm vàng).
  - `wing_lower_left`, `wing_lower_right` (cánh hoa nhỏ dưới).
  - `antenna_left`, `antenna_right` (nhị hoa cong làm râu bướm).
- **Thao tác:**
  - `SELECT_PART`: Chọn bộ phận từ khay hoa.
  - `MOVE_PART` & `ROTATE_PART`: Kéo thả vào trang sổ và xoay góc để khớp với hình bóng mờ.
  - `SNAP_PART`: Khi đưa cánh vào gần đích (sai số <= 15% tọa độ và <= 40 độ góc), cánh sẽ tự động "hít" (snap) dính vào trang sổ.
  - `PRESS_BOOK`: Hiệu ứng gập trang sổ lại kẹp phẳng cánh hoa, mở ra con bướm lưu bút khô.
- **Danh hiệu:** *Bướm phượng hoàng lửa tuyệt mỹ* (3 sao), *Cánh bướm lưu bút xinh xắn* (2 sao), *Bướm hoa phượng mộc mạc* (1 sao).

---

## 4. CÁCH CLAUDE CODE TÍCH HỢP UI (REACT / CANVAS / DOM)

Mọi engine đều triển khai chung interface `IMinigameEngine<TState, TAction>`:

```typescript
import { createMinigame, MinigameId, IMinigameEngine } from '@/minigames';

// 1. Khởi tạo engine qua Factory
const engine = createMinigame('o_an_quan', {
  game_id: 'o_an_quan',
  opponent_id: 'chau', // Chọn Châu (Khó nhất) hoặc Đức, Hạ, Quân
  time_limit_s: 60
});

// 2. Lấy State để render React Component
const state = engine.getState();

// 3. Dispatch action từ sự kiện click / drag / touch của người dùng
const success = engine.dispatch({ cell: 2, direction: 'cw' });

// 4. Kiểm tra hoàn thành và lấy kết quả
if (engine.isFinished()) {
  const result = engine.getResult();
  console.log(`Kết quả: ${result.result}, Điểm: ${result.score}, Sao: ${result.stars}`);
  console.log(`NPC nói: "${result.npc_dialogue_line}"`);
  
  // 5. Nối vào questEngine / analytics:
  // questEngine.submitMinigameResult(result);
}
```

### Điểm móc nối UI đề xuất cho Claude Code:
1. **Overlay Component:** Tạo `src/ui/components/minigames/MinigameModal.tsx` hiển thị pop-up khi bước kịch bản có `kind: 'minigame'`.
2. **Renderer riêng cho từng trò:**
   - `OAnQuanView.tsx`: Render bàn cờ hình hạt đậu 2 đầu bán nguyệt, các viên sỏi tròn lăn theo hiệu ứng CSS/Framer Motion.
   - `HopscotchView.tsx`: Render 10 ô vẽ phấn trắng trên nền sân xi măng/đất Căn cứ, thanh lực ném và thanh thăng bằng.
   - `FoldBoatView.tsx`: Render tờ giấy báo cũ, vệt phấn nét đứt Origami, hiệu ứng vuốt ngón tay miết phẳng giấy.
   - `PhoenixButterflyView.tsx`: Render trang sổ ô ly học sinh, khay hoa phượng vĩ đỏ tươi, đường nét mờ cánh bướm.

---

## 5. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG

- **TypeScript check (`npx tsc --noEmit`):** ✅ **0 lỗi (Exit Code 0)**.
- **Bộ kiểm thử minigame (`tests/unit/minigames.test.ts`):** ✅ **22/22 tests PASSED**.
- **Bộ kiểm thử thế giới (`tests/unit/world/world.test.ts`):** ✅ **23/23 tests PASSED**.
- **Bộ kiểm thử nhiệm vụ (`tests/unit/questEngine.test.ts`):** ✅ **27/27 tests PASSED**.
- **Tổng cộng kiểm thử liên quan:** **72/72 tests PASSED 100%**.

Hệ thống đã sẵn sàng 100% để Claude Code tiến hành ráp UI và kết nối visual!
