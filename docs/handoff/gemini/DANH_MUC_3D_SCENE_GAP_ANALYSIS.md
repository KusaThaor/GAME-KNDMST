# DANH MỤC 3D SCENE — GAP ANALYSIS · MỐC 1 (TRANG 1–4 & CĂN CỨ)

| Trường | Giá trị |
|---|---|
| Người lập | Technical 3D Lead (Gemini) |
| Ngày | 22/11/2026 |
| Nguồn kịch bản | KICH_BAN_DEMO_M1_M2_v1.md v1.6-draft (m1) & v1.4 (main) |
| Nguồn GDD | 01_NARRATIVE_AND_SCENES.md v1.0 APPROVED |
| Phạm vi | Mốc 1: Trang 1–4 + Khu Vui Chơi Căn Cứ |

> [!IMPORTANT]
> Quy tắc ưu tiên: **P1** = bắt buộc trước khi dựng scene · **P2** = cần cho minigame/tương tác · **P3** = trang trí phụ & hiệu ứng

---

## BẢNG HIỆN TRẠNG TÀI NGUYÊN TRONG REPO

### A. Zone .glb (world geometry) — `public/assets/world/map_thcs/`

| File | Kích thước | Nội dung đã có (theo index.json) | Phục vụ Trang |
|---|---|---|---|
| `zone_classroom.glb` | 141 KB | Phòng học 6A3: bảng xanh, bàn/ghế nền, cửa xanh, cửa sổ kính, tường trong/ngoài | T1A, T5B |
| `zone_corridor.glb` | 77 KB | Hành lang: sàn gạch, mái ngói, tường, dãy máng nước (rãnh mưa) | T1A, T2 |
| `zone_yard.glb` | 143 KB | Sân trường: sân bê tông, cỏ, cây phượng, cây bóng mát, cờ, ghế đá, xe quà vặt, cột rổ | T1A, T3, T4, T5A |
| `zone_gate.glb` | 82 KB | Cổng trường + tiệm tạp hóa: cổng sắt, nhà dân lân cận, bảng hiệu, xe quà vặt | T1B |
| `zone_field.glb` | 82 KB | Góc sân dã ngoại: đất, cỏ, cây bàng, dây thừng, water geometry | T3 (Căn cứ gần) |
| `zone_base.glb` | 62 KB | Căn cứ bí mật dưới gốc cây: đất nền, cỏ, tán cây, bạt mái, hộp giấy, bàn cũ, kệ | T3, T4, Khu VCC |

### B. Props .glb riêng lẻ — `public/assets/props/`

| File | Kích thước | Mô tả |
|---|---|---|
| `classroom_chalkboard.glb` | 17 KB | Bảng đen/xanh lớp học (interactive prop) |
| `schoolyard_flamboyant_tree.glb` | 312 KB | Cây phượng vĩ (sân trường, lớn) |
| `schoolyard_shade_tree.glb` | 312 KB | Cây bóng mát (sân trường) |
| `schoolyard_tropical_tree.glb` | 225 KB | Cây nhiệt đới (sân trường) |
| `school_desk.glb` | 142 KB | Bàn học đơn (sân) |

> [!NOTE]
> Repo `GAME-KNDMST-m1` có thêm `prp_desk_2seat.glb` (17 KB) — bàn đôi học sinh trong lớp.
> Characters: `vietnamese_student.glb` (323 KB) và các variant skinned — đủ làm base NPC.

### C. Tài nguyên kỹ thuật khác đã có

| Thứ | Nội dung |
|---|---|
| Map markers | `itr.thcs.blackboard`, `itr.thcs.gutter` (rãnh nước), `itr.thcs.grocery`, `itr.thcs.shuttle_ring`, `itr.thcs.marble_spot`, `itr.thcs.base_shelf`, `itr.thcs.old_table` |
| Materials đã có trong zone | `board_green`, `water`, `tarp`, `paper`, `flower_red`, `leaf_a/b/dark`, `trunk`, `stone` |
| Blender pipeline | `tools/blender/props/desk_2seat.py` + `prp_desk_2seat.blend` — template sản xuất prop |

---

## BƯỚC 2 — RÀ SOÁT TRANG 1 (Lớp 6)

### Trang 1A — "Ngày đầu lớp 6" · Sân trường + Phòng học 6A3

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | Phòng học 6A3 (geometry) | `zone_classroom.glb` | ✅ **CÓ** (đủ tường/sàn/cửa) | — | P1 |
| 2 | Bảng đen/xanh interactive | `prp_chalkboard` | ✅ **CÓ** (`classroom_chalkboard.glb`) | — | P1 |
| 3 | Bàn đôi học sinh (×20 hàng) | `prp_desk_2seat` | ✅ **CÓ** (`prp_desk_2seat.glb` - m1) | Instancing ×20 | P1 |
| 4 | Ghế nhựa xanh học sinh (×40) | `prp_chair_student` | ❌ **THIẾU** | Blender ~1h, low-poly | P1 |
| 5 | Bàn giáo viên (bục giảng) | `prp_teacher_desk` | ❌ **THIẾU** | Blender ~1h | P1 |
| 6 | Bục giảng gỗ | `prp_podium` | ❌ **THIẾU** | Merge vào teacher_desk | P2 |
| 7 | Hộp phấn (trên bục) | `prp_chalk_box` | ❌ **THIẾU** | Blender ~30 phút; cần anim mở nắp | P1 |
| 8 | Mẩu phấn trắng | `prp_chalk_piece` | ❌ **THIẾU** | Blender 15 phút | P1 |
| 9 | Bảng phân lớp (hành lang) | `prp_class_board` | ❌ **THIẾU** | Three.js CanvasTexture + frame gỗ | P1 |
| 10 | Quả cầu lông (đá cầu) — `mg_shuttlecock` | `prp_shuttlecock` | ❌ **THIẾU** | Blender 30 phút | P2 |
| 11 | Vị trí minigame đá cầu ring | `itr.thcs.shuttle_ring` | ✅ **CÓ** (marker đã có trong index) | — | P2 |
| 12 | Bụi cây (cầu rơi vào) | `prp_bush_small` | ⚠️ **THIẾU chi tiết** (zone_yard có cây to, không có bụi thấp) | Blender particle hoặc Billboard | P2 |
| 13 | Cặp Ladoda (túi đựng sách) | `prp_schoolbag_ladoda` | ❌ **THIẾU** | Blender 1h; nếu P3 dùng generic bag | P3 |
| 14 | Vở học sinh (rơi xuống cầu thang) | `prp_notebook` | ❌ **THIẾU** | Blender 20 phút hoặc Three.js BoxGeometry | P2 |

### Minigame T1A — `mg_wipe_board` (Lau bảng)

| Thứ | Asset | Hiện trạng | Giải pháp |
|---|---|---|---|
| Khăn lau bảng | `prp_eraser` | ❌ THIẾU | Three.js sprite/billboard + wipe shader |
| Bụi phấn particle | `fx_chalk_dust` | ❌ THIẾU | Three.js Points hoặc sprite sheet |
| Canvas mask lớp bảng (% sạch) | logic only | ❌ THIẾU | Three.js CanvasTexture + masking |

---

### Trang 1B — "Mấy tháng sau" · Tiệm tạp hóa cổng trường

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | Tiệm tạp hóa (nhà + quầy) | `zone_gate.glb` | ✅ **CÓ** (nhà + awning + cổng) | — | P1 |
| 2 | Bậc thềm ngồi | — | ✅ Nằm trong zone_gate geometry | — | P1 |
| 3 | Gói mì ăn liền (×1) | `prp_instant_noodle_pack` | ❌ **THIẾU** | Blender 30 phút; cần flip/squeeze anim | P2 |
| 4 | Máy ảnh compact (Player) | `prp_camera_compact` | ❌ **THIẾU** | Blender 1h; item thường xuyên dùng lại | P1 |
| 5 | Cuốn sổ nhỏ (Player's journal) | `prp_journal_small` | ❌ **THIẾU** | Blender 20 phút | P2 |
| 6 | Bút bi xoay (Đức) | `prp_ballpen` | ❌ **THIẾU** | Three.js CylinderGeometry + anim | P3 |

### Minigame T1B — `mg_noodle_squeeze` (Bóp vụn gói mì + lắc)

| Thứ | Asset | Hiện trạng | Giải pháp |
|---|---|---|---|
| Morph gói mì dẹt → vụn | `prp_noodle_crushed` | ❌ THIẾU | Blender shape key hoặc Three.js deform |
| Gói gia vị nhỏ | `prp_seasoning_pack` | ❌ THIẾU | Blender 15 phút hoặc sprite |

---

## BƯỚC 3 — RÀ SOÁT TRANG 2 (Mương nước sau mưa)

### Trang 2 — "Lớp 7. Một chiều mưa." · Hành lang + Rãnh nước

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | Hành lang có mái (mưa chảy) | `zone_corridor.glb` | ✅ **CÓ** (marker `itr.thcs.gutter` đã có) | — | P1 |
| 2 | Rãnh nước mương đầy nước | water geometry | ✅ **CÓ** (material `water` trong corridor) | Shader flow animation cần thêm | P1 |
| 3 | Hiệu ứng mưa (particle) | `fx_rain` | ❌ **THIẾU** | Three.js Points + sprite rain drop | P1 |
| 4 | Thuyền giấy (×5 chiếc) | `prp_paper_boat` | ❌ **THIẾU** | Blender 1h; cần 2 LOD: nổi + lật | P1 |
| 5 | Thuyền giấy kỷ vật (buồm có chữ) | `prp_paper_boat_signed` | ❌ **THIẾU** | Variant của prp_paper_boat + CanvasTexture cho buồm | P1 |
| 6 | Que tre/que vớt thuyền — `rescue_boat` | `prp_bamboo_stick` | ❌ **THIẾU** | Blender 15 phút | P2 |
| 7 | Miệng cống thoát nước | `prp_drain_grate` | ❌ **THIẾU** | Blender 20 phút hoặc baked vào corridor | P2 |
| 8 | Giấy báo (Quân cầm giữ gió) | `prp_newspaper` | ❌ **THIẾU** | Three.js PlaneGeometry + texture | P3 |
| 9 | Hiệu ứng dòng chảy mương | `fx_water_flow` | ❌ **THIẾU** | Three.js ShaderMaterial UV scroll | P2 |
| 10 | Âm thanh mưa (SFX ref) | — | Ngoài phạm vi 3D | Audio team | — |

### Minigame T2 — `mg_shuttlecock` → đã liệt kê T1 · `rescue_boat` (thả thuyền + điều hướng)

| Thứ | Asset | Hiện trạng | Giải pháp |
|---|---|---|---|
| Animation thuyền nổi (bob) | `anim_boat_float` | ❌ THIẾU | Blender NLA clip hoặc Three.js MathSin |
| Animation thuyền lật (Đức) | `anim_boat_flip` | ❌ THIẾU | Blender rotation keyframe |
| Xoáy nước obstacle | `prp_whirlpool` | ❌ THIẾU | Three.js shader vortex sprite |

---

## BƯỚC 4 — RÀ SOÁT TRANG 3 (Khảo sát & Dựng Căn cứ)

### Trang 3 — "Đầu HK II lớp 7" · Góc sân sau – Căn cứ bí mật

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | Căn cứ base geometry (gốc cây bàng + mái che) | `zone_base.glb` | ✅ **CÓ** (tarp, trunk, ground_dirt, paper) | — | P1 |
| 2 | Gốc cây bàng lớn (Căn cứ) | Trong zone_base | ✅ **CÓ** (material `trunk` confirmed) | — | P1 |
| 3 | Bạt che mưa (tarp mái) | Trong zone_base | ✅ **CÓ** (material `tarp`) | — | P1 |
| 4 | Bàn cũ của Căn cứ | `itr.thcs.old_table` | ✅ **CÓ** (marker + geometry trong zone_base) | — | P1 |
| 5 | Kệ gỗ cũ (đựng đồ Căn cứ) | `itr.thcs.base_shelf` | ✅ **CÓ** (marker trong zone_base) | — | P1 |
| 6 | Đống thùng giấy cũ (3 điểm khảo sát) | `prp_cardboard_box_stack` | ⚠️ **CÓ MỘT PHẦN** (zone_base có `paper` material + hộp) | Cần thêm pile variant để clickable riêng | P1 |
| 7 | Mái che bổ sung (3 điểm khảo sát - mái che) | Trong zone_base | ✅ **CÓ** (tarp) | — | P1 |
| 8 | Cọc tre cắm đất (dựng Căn cứ) | `prp_bamboo_post` | ❌ **THIẾU** | Blender 20 phút (CylinderGeo) | P2 |
| 9 | Chổi rơm quét lá — `sweep_leaves` | `prp_straw_broom` | ❌ **THIẾU** | Blender 1h; cần sweep particle | P2 |
| 10 | Lá bàng rơi (particle) | `fx_banyan_leaves` | ❌ **THIẾU** | Three.js Points + leaf sprite | P2 |
| 11 | Biển gỗ "CĂN CỨ" (kỷ vật) | `prp_signboard_base` | ❌ **THIẾU** | Blender 30 phút + Three.js CanvasTexture chữ | P1 |
| 12 | Hộp màu sáp — `paint_signboard` | `prp_crayon_box` | ❌ **THIẾU** | Blender 30 phút; item dùng lại Trang 7 | P2 |
| 13 | Màu sáp rời (×6 cây) | `prp_crayon_stick` | ❌ **THIẾU** | Instance từ prp_crayon_box | P3 |
| 14 | Sổ luật bìa xanh (kỷ vật) | `prp_rulebook_green` | ❌ **THIẾU** | Blender 20 phút + CanvasTexture trang | P1 |
| 15 | Băng keo dán ảnh (Quân) | `prp_tape_roll` | ❌ **THIẾU** | Blender 15 phút | P3 |
| 16 | Giấy màu trang trí (tùy chọn A) | `prp_colored_paper` | ❌ **THIẾU** | Three.js PlaneGeo + color variants | P2 |

### Minigame T3 — `sweep_leaves` (Chổi rơm quét lá)

| Thứ | Asset | Hiện trạng | Giải pháp |
|---|---|---|---|
| Particle lá khô trên đất | `fx_leaves_ground` | ❌ THIẾU | Three.js InstancedMesh leaf sprites |
| Sweep direction indicator | UI only | ❌ THIẾU | Three.js arrow helper overlay |

---

## BƯỚC 5 — RÀ SOÁT TRANG 4 & KHU VUI CHƠI CĂN CỨ

### Trang 4 — "Cuối năm lớp 7" · Sân phượng + Căn cứ (mưa + cầu vồng)

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | Cây phượng vĩ (gốc chụp ảnh) | `schoolyard_flamboyant_tree.glb` | ✅ **CÓ** (312 KB prop) | Đặt tại spot.thcs.yard_group | P1 |
| 2 | Hoa phượng vĩ rơi (cánh) | `fx_flamboyant_petal` | ❌ **THIẾU** | Three.js InstancedMesh petal sprite, wind shader | P2 |
| 3 | Ghế đá để máy ảnh | `prp_stone_bench` | ⚠️ **CÓ** (marker `itr.thcs.stone_bench` trong yard, nhưng prop mesh riêng chưa xác nhận) | Confirm hoặc Blender 1h | P1 |
| 4 | Máy ảnh compact (hẹn giờ) — `phoenix_butterfly` | `prp_camera_compact` | ❌ **THIẾU** (cùng item T1B) | Blender 1h (ưu tiên làm sớm) | P1 |
| 5 | Cầu vồng (skybox/post) | `fx_rainbow` | ❌ **THIẾU** | Three.js Shader toroid hoặc sprite dán horizon | P1 |
| 6 | Hiệu ứng mưa rào | `fx_rain` | ❌ **THIẾU** (cùng T2) | Three.js Points (làm chung T2) | P1 |
| 7 | Nền ướt sau mưa (sân) | `mat_wet_ground` | ❌ **THIẾU** | Three.js MeshStandardMaterial roughness thấp + env map | P2 |
| 8 | Sổ lưu bút (kỷ vật + bướm kẹp) | `prp_yearbook` | ❌ **THIẾU** | Blender 30 phút; trang bìa CanvasTexture | P2 |
| 9 | Bướm giấy kẹp sổ | `prp_paper_butterfly` | ❌ **THIẾU** | Blender 15 phút hoặc Three.js PlaneGeo fold | P2 |
| 10 | Ảnh in dán lên tường Căn cứ | `prp_photo_print` | ❌ **THIẾU** | Three.js PlaneGeo + CanvasTexture (ảnh Player chọn) | P2 |
| 11 | Khung kính nhỏ (đựng mật lệnh) | `prp_glass_frame_small` | ❌ **THIẾU** | Blender 20 phút | P2 |

---

### Khu Vui Chơi Căn Cứ (zone_field + zone_base)

#### Ô Ăn Quan — `o_an_quan`

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | Bàn cờ 12 ô vẽ trên đất | `prp_oaq_board` | ❌ **THIẾU** | Three.js PlaneGeo + CanvasTexture ô cờ | P1 |
| 2 | Quan lớn (×2 viên đá to) | `prp_oaq_quan` | ❌ **THIẾU** | Blender SphereGeo dẹt ~10 phút | P1 |
| 3 | Sỏi dân (×50 viên nhỏ) | `prp_oaq_stone` | ❌ **THIẾU** | Blender InstancedMesh ellipsoid low-poly | P1 |
| 4 | Animation cầm sỏi + đổ | `anim_oaq_move` | ❌ **THIẾU** | Three.js tween arc trajectory | P2 |

#### Nhảy Lò Cò — `nhay_lo_co`

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | 10 ô vẽ phấn trên đất | `prp_hopscotch_grid` | ❌ **THIẾU** | Three.js CanvasTexture ô phấn trên ground | P1 |
| 2 | Miếng sành ném | `prp_hopscotch_tile` | ❌ **THIẾU** | Blender 15 phút flat shard | P2 |
| 3 | Hiệu ứng phấn vẽ | `fx_chalk_draw` | ❌ **THIẾU** | Three.js CanvasTexture progressive draw | P2 |

#### Bắn Bi Ve — `ban_bi_ve`

| # | Tên Asset | ID đề xuất | Hiện trạng | Giải pháp | P |
|---|---|---|---|---|---|
| 1 | Vòng tròn đất bắn bi | `prp_marble_ring` | ⚠️ **CÓ MỘT PHẦN** (marker `itr.thcs.marble_spot` có trong zone_field, nhưng vòng tròn ground chưa xác nhận) | CanvasTexture vẽ vòng lên nền | P1 |
| 2 | Bi ve mắt mèo (×10–15) | `prp_marble_glass` | ❌ **THIẾU** | Blender SphereGeo + glass material + env map | P1 |
| 3 | Animation bi lăn + va chạm | `anim_marble_roll` | ❌ **THIẾU** | Three.js physics (Rapier) hoặc tween | P2 |
| 4 | Hố đất (vòng tròn trũng) | `prp_marble_pit` | ❌ **THIẾU** | Displacement map trên ground mesh | P3 |

---

## BƯỚC 6 — TỔNG KẾT CHECKLIST GAP ANALYSIS

### DANH SÁCH P1 — Bắt buộc trước khi dựng scene

> [!CAUTION]
> Các asset P1 chưa có sẽ block toàn bộ việc dựng scene. Làm song song ngay.

| # | Asset ID | Trang | Phương pháp | Effort ước tính |
|---|---|---|---|---|
| 1 | `prp_chair_student` | T1A | Blender | 1–2h |
| 2 | `prp_teacher_desk` | T1A | Blender | 1h |
| 3 | `prp_chalk_box` + `prp_chalk_piece` | T1A, T5B | Blender | 1h (combo) |
| 4 | `prp_class_board` (bảng phân lớp) | T1A | Three.js CanvasTexture + frame | 2h |
| 5 | `prp_camera_compact` | T1B, T4 | Blender | 1–2h |
| 6 | `prp_paper_boat` (×5 + variant buồm) | T2 | Blender | 2–3h |
| 7 | `fx_rain` (particle mưa) | T2, T4 | Three.js | 2h |
| 8 | `prp_signboard_base` (biển CĂN CỨ) | T3 | Blender + CanvasTexture | 1h |
| 9 | `prp_rulebook_green` (sổ luật) | T3 | Blender | 1h |
| 10 | `fx_rainbow` | T4 | Three.js Shader | 2–3h |
| 11 | `prp_oaq_board` + `prp_oaq_quan` + `prp_oaq_stone` | Khu VCC | Three.js + Blender | 3h (combo) |
| 12 | `prp_hopscotch_grid` | Khu VCC | Three.js CanvasTexture | 1h |
| 13 | `prp_marble_glass` (bi ve) | Khu VCC | Blender glass mat | 1h |

**Tổng P1 ước tính: ~22–26 giờ nhân sự Blender + Three.js**

---

### DANH SÁCH P2 — Props minigame & tương tác

| # | Asset ID | Trang | Phương pháp | Effort |
|---|---|---|---|---|
| 1 | `prp_shuttlecock` (quả cầu lông) | T1A `mg_shuttlecock` | Blender | 30 phút |
| 2 | `prp_notebook` (vở rơi) | T1A | Blender / BoxGeo | 20 phút |
| 3 | `prp_instant_noodle_pack` + morph | T1B `mg_noodle_squeeze` | Blender shape key | 1h |
| 4 | `prp_journal_small` (sổ Player) | T1B | Blender | 20 phút |
| 5 | `fx_chalk_dust` (particle phấn) | T1A `mg_wipe_board` | Three.js | 1h |
| 6 | `fx_water_flow` (shader dòng mương) | T2 | Three.js ShaderMat | 2h |
| 7 | `prp_bamboo_stick` (que vớt thuyền) | T2 `rescue_boat` | Blender | 15 phút |
| 8 | `prp_drain_grate` (miệng cống) | T2 | Blender | 20 phút |
| 9 | `anim_boat_float` + `anim_boat_flip` | T2 | Blender NLA | 1h |
| 10 | `prp_bamboo_post` (cọc tre) | T3 | Blender | 20 phút |
| 11 | `prp_straw_broom` + sweep particle | T3 `sweep_leaves` | Blender + Three.js | 1.5h |
| 12 | `prp_crayon_box` + sticks | T3 `paint_signboard` | Blender | 30 phút |
| 13 | `prp_colored_paper` (giấy màu) | T3 | Three.js PlaneGeo | 30 phút |
| 14 | `fx_flamboyant_petal` (cánh hoa) | T4 | Three.js InstancedMesh | 2h |
| 15 | `mat_wet_ground` (nền ướt) | T4 | Three.js material variant | 1h |
| 16 | `prp_yearbook` + `prp_paper_butterfly` | T4 `phoenix_butterfly` | Blender | 1h |
| 17 | `prp_photo_print` (ảnh dán tường) | T4 | Three.js PlaneGeo + CanvasTexture | 30 phút |
| 18 | `prp_glass_frame_small` (khung kính) | Phòng 2026 | Blender | 20 phút |
| 19 | `anim_oaq_move` (cầm/đổ sỏi) | Khu VCC | Three.js tween | 2h |
| 20 | `prp_hopscotch_tile` (miếng sành) | Khu VCC | Blender | 15 phút |
| 21 | `anim_marble_roll` (bi lăn) | Khu VCC | Three.js / Rapier | 3h |

**Tổng P2 ước tính: ~19–22 giờ**

---

### DANH SÁCH P3 — Trang trí phụ & hiệu ứng

| # | Asset ID | Trang | Phương pháp | Effort |
|---|---|---|---|---|
| 1 | `prp_schoolbag_ladoda` | T1A | Blender | 1h |
| 2 | `prp_ballpen` (bút bi xoay) | T1B | Three.js CylGeo | 15 phút |
| 3 | `prp_newspaper` (giấy báo gấp) | T2 | Three.js PlaneGeo | 15 phút |
| 4 | `prp_bush_small` (bụi cây thấp) | T1A | Blender billboard | 30 phút |
| 5 | `prp_tape_roll` (băng keo) | T3 | Blender | 15 phút |
| 6 | `prp_crayon_stick` loose (×6) | T3 | Instance từ P2 | 15 phút |
| 7 | `prp_marble_pit` (hố đất bi) | Khu VCC | Displacement map | 1h |
| 8 | `fx_chalk_draw` (vẽ phấn ô lò cò) | Khu VCC | CanvasTexture progressive | 1.5h |
| 9 | `prp_podium` (bục giảng) | T1A | Merge vào teacher_desk | 30 phút |

**Tổng P3 ước tính: ~5–6 giờ**

---

## TỔNG HỢP NHANH

| Trạng thái | Số lượng asset | Ghi chú |
|---|---|---|
| ✅ ĐÃ CÓ (GLB/Marker/Material) | ~18 | Zone geometry đầy đủ, characters sẵn |
| ⚠️ CÓ MỘT PHẦN | ~4 | Cần extend/confirm (stone_bench, marble_ring, cardboard_box) |
| ❌ THIẾU — P1 | 13 | Block scene build |
| ❌ THIẾU — P2 | 21 | Block minigame |
| ❌ THIẾU — P3 | 9 | Trang trí, có thể defer |
| **TỔNG THIẾU** | **43** | |

> [!TIP]
> **Thứ tự làm ngay:** `prp_camera_compact` → `prp_chalk_box/piece` → `prp_chair_student` → `prp_paper_boat` → `fx_rain` → `prp_signboard_base` → Khu VCC combo.
> Reuse tối đa: `prp_camera_compact` dùng cho T1B + T4; `fx_rain` dùng T2 + T4; `prp_desk_2seat` đã có, instance thêm.

---

*File cập nhật lần cuối: 22/11/2026 · Gemini Technical 3D Lead*
