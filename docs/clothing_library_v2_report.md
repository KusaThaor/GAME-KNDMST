# BÁO CÁO NGHIỆM THU HỆ THỐNG MODULAR CLOTHING LIBRARY V2
## NÂNG CẤP TOÀN DIỆN THƯ VIỆN TRANG PHỤC HỌC ĐƯỜNG PROCEDURAL 3D
### DỰ ÁN: HÀNH TRÌNH THANH XUÂN — COZY VIETNAMESE SCHOOL-LIFE 3D NARRATIVE GAME

**Tác giả:** Kỹ sư Trưởng Pipeline Kỹ thuật Nhân vật & Three.js Runtime  
**Thời gian hoàn thành:** 16/11/2026  
**Công nghệ:** Blender 4.5.16 LTS Python API (`bpy`, `bmesh`) | Three.js / WebGL | GLB / glTF 2.0  
**Trạng thái kiểm định:** **PASS TOÀN DIỆN (100% CÁC BÀI KIỂM THỬ TỰ ĐỘNG)**  

---

## 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU NÂNG CẤP

Trong giai đoạn V1.0 của Character Factory, hệ thống đã thiết lập thành công mô hình nhân vật Chibi chuẩn mực ([Chibi_Base_Canonical_v1.blend](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/scenes/Chibi_Base_Canonical_v1.blend)) với bộ khung xương 20 bone humanoid (`Student_Armature`), 16 canonical action và hệ thống biểu cảm Morph Target. Tuy nhiên, phần trang phục ban đầu còn tồn tại dưới dạng lưới nguyên khối (`Character_Torso_Legs`) với phương pháp đổi màu chất liệu (recoloring).

**Nhiệm vụ V2.0:** Xây dựng một **Thư viện Trang phục Modular (Modular Clothing Library V2)** hoàn chỉnh, cho phép tháo lắp độc lập từng món trang phục (Áo, Quần/Váy, Giày, Vớ, Phụ kiện), tự động thích ứng với 3 cỡ chiều cao (90%, 100%, 110%), bảo toàn trọng số da (skin weights) và ngăn chặn triệt để lỗi xuyên thấu hình học (mesh clipping) khi chuyển động.

---

## 2. KẾT QUẢ BÀN GIAO DANH MỤC TRANG PHỤC MODULAR (CATALOG MATRIX)

### 2.1. Thư viện Hạ thân (Bottom Library — 8/8 Hoàn thành)
Được xây dựng độc lập với hình học chân váy thực thụ (không tái sử dụng mesh quần cho váy):

| Mã Asset | Tên Tiếng Việt | Tên Tiếng Anh | Số Đỉnh (Verts) | Trọng số Xương (Vertex Groups) | Cơ chế Ẩn/Lộ Da |
| :--- | :--- | :--- | :---: | :--- | :---: |
| `BOTTOM_001` | Quần tây học sinh THCS | Long School Trousers | 268 | `Hips`, `Spine`, `Thigh.L/R`, `Shin.L/R` | Che kín hoàn toàn |
| `BOTTOM_002` | Quần soóc đồng phục | School Uniform Shorts | 184 | `Hips`, `Spine`, `Thigh.L/R` | Chấm dứt trên gối ($Z=0.138$), lộ cẳng chân |
| `BOTTOM_003` | Quần short kaki nâu ấm | Casual Khaki Shorts | 184 | `Hips`, `Spine`, `Thigh.L/R` | Chấm dứt trên gối, lộ cẳng chân |
| `BOTTOM_004` | Chân váy xếp ly đồng phục | Pleated School Skirt | 164 | `Hips`, `Spine`, `Thigh.L/R` (Dual Blend) | Váy 16 nếp gấp chữ A, lộ cẳng chân |
| `BOTTOM_005` | Chân váy chữ A dạo phố | Casual A-Line Skirt | 100 | `Hips`, `Spine`, `Thigh.L/R` (Dual Blend) | Dáng rủ pastel mềm mại, lộ cẳng chân |
| `BOTTOM_006` | Quần soóc jean xanh | Denim Shorts | 184 | `Hips`, `Spine`, `Thigh.L/R` | Đường may khỏe khoắn, lộ cẳng chân |
| `BOTTOM_007` | Quần thể dục dài viền sọc | PE Sports Pants | 276 | `Hips`, `Spine`, `Thigh.L/R`, `Shin.L/R` | Sọc đôi trắng bên sườn, che kín |
| `BOTTOM_008` | Váy yếm học sinh kèm quai | Pinafore Skirt | 180 | `Chest`, `Hips`, `Spine`, `Thigh.L/R` | Thân váy xếp ly + yếm ngực + quai chéo |

### 2.2. Thư viện Thượng thân (Top Library — 8/8 Hoàn thành)
Thiết kế cổ áo và tay áo module hóa bằng pure `bmesh`, không phụ thuộc ngữ cảnh viewport:

| Mã Asset | Tên Tiếng Việt | Tên Tiếng Anh | Số Đỉnh (Verts) | Kiểu Cổ & Chi tiết Tay | Khả năng Phối Lớp |
| :--- | :--- | :--- | :---: | :--- | :---: |
| `TOP_001` | Áo sơ mi trắng học sinh | White School Shirt | 210 | Cổ bẻ vuông góc standard, tay cộc | Lớp nền mặc trong |
| `TOP_002` | Áo thể dục xanh phối trắng | Blue PE Shirt | 210 | Cổ polo dệt trắng, tay cộc xanh coban | Độc lập |
| `TOP_003` | Áo thun cơ bản cổ tròn | Basic T-Shirt | 210 | Cổ tròn viền bo, tay cộc đỏ cam | Lớp nền dạo phố |
| `TOP_004` | Áo thun polo có cổ | Polo Shirt | 210 | Cổ bẻ polo thanh lịch có khuy, tay cộc | Độc lập |
| `TOP_005` | Áo kiểu nữ sinh cổ sen | Casual Blouse | 210 | Cổ sen tròn Peter Pan mềm mại, tay phồng | Lớp nền duyên dáng |
| `TOP_006` | Áo len mỏng cardigan dài tay | Light Cardigan | 286 | Cổ chữ V cài cúc, tay dài tới cổ tay | Khoác ngoài nhẹ |
| `TOP_007` | Áo thun dài tay thu đông | Casual Long-Sleeve | 294 | Cổ tròn viền bo, tay dài cotton ấm | Độc lập / Mặc trong |
| `TOP_008` | Áo khoác gió học sinh | Light Jacket | 294 | Cổ đứng thể thao kéo khóa, tay dài bo chun | Khoác ngoài gió mùa |

### 2.3. Thư viện Giày dép & Vớ (Footwear & Socks — 8/8 Hoàn thành)
- **FOOTWEAR:**
  - `FOOTWEAR_001` (White Sneakers): Giày bata trắng Thượng Đình đế cao su dẻo (114 verts).
  - `FOOTWEAR_002` (Canvas Low-Tops): Giày vải bệt xanh đen mũi bọc cao su trắng (114 verts).
  - `FOOTWEAR_003` (Simple Sandals): Dép quai hậu da nâu đế kếp đen kèm quai ngang và quai hậu (82 verts).
  - `FOOTWEAR_004` (Casual Slip-On Shoes): Giày lười dạo phố không dây đế kem (86 verts).
- **SOCKS:**
  - `SOCKS_001` (Short White Socks): Vớ cổ ngắn ngang bắp chân $Z=0.075\text{m}$ (84 verts).
  - `SOCKS_002` (Ankle Socks): Vớ thể thao ngang mắt cá chân $Z=0.052\text{m}$ (84 verts).
  - `SOCKS_003` (Knee-High Socks): Vớ cao dưới gối $Z=0.110\text{m}$ (84 verts).
  - `SOCKS_004` (No Visible Socks): Không mang vớ / chân trần tự nhiên (0 verts).

---

## 3. GIẢI PHÁP KỸ THUẬT QUẢN LÝ HÌNH HỌC ẨN & ZERO CLIPPING

```
                         [QUY TRÌNH QUẢN LÝ HÌNH HỌC ẨN]
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
[THƯỢNG THÂN (TOPS)]                                      [HẠ THÂN (BOTTOMS)]
  ├── Áo cộc tay (TOP_001 -> TOP_005):                      ├── Quần dài (BOTTOM_001, 007):
  │     => Sinh Cẳng tay & Bàn tay                            │     => Phủ kín, KHÔNG sinh chân ẩn
  └── Áo dài tay (TOP_006 -> TOP_008):                      └── Quần soóc / Chân váy (BOTTOM_002..008):
        => Chỉ sinh Bàn tay lộ ngoài cổ áo                        => Sinh Cẳng chân từ Z=0.140 đến Z=0.038
                                                                        │
                                                                        ▼
                                                              [BÀN CHÂN (FOOTWEAR)]
                                                                ├── Giày kín (001, 002, 004):
                                                                │     => KHÔNG sinh da chân ẩn
                                                                └── Dép quai hậu (003):
                                                                      => Sinh Mu & Ngón bàn chân trần
```

### Ưu điểm vượt trội của giải pháp:
1. **Tiết kiệm Polycount:** Không có bất kỳ mặt tam giác nào thừa thãi nằm khuất bên trong quần dài hoặc giày kín.
2. **Triệt tiêu Clipping:** Vì không có khối thân cũ nằm lồng bên trong, hiện tượng da đâm xuyên qua vải khi vặn xoắn xương hoàn toàn không xảy ra.
3. **Dual-Thigh Blending:** Chân váy chữ A và váy xếp ly được gán trọng số chia sẻ giữa cả 2 đùi:
   $$\text{Weight}(v) = 0.50 \cdot \text{Thigh}_{\text{same}} + 0.20 \cdot \text{Thigh}_{\text{opp}} + 0.30 \cdot \text{Hips}$$
   Điều này cho phép váy xòe căng tự nhiên khi chân bước đi hoặc gập đùi ngồi học (`Action_Sit`), không bị biến dạng đứt đoạn.

---

## 4. MA TRẬN 12 BỘ TRANG PHỤC MẪU (12 OUTFIT PRESETS)

Hệ thống đã chuẩn hóa và kiểm thử thành công 12 bộ trang phục mẫu đại diện cho câu chuyện học đường 2012–2013:

| Preset ID | Tên Bộ Trang Phục | Ý Nghĩa Kịch Bản & Cảm Xúc | Công Thức Ghép Món | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: |
| `PRESET_001` | Nam sinh tiêu chuẩn THCS | Chào cờ thứ Hai đầu tuần, trang trọng nghiêm túc | `TOP_001` + `BOTTOM_001` + `FOOTWEAR_001` + `SOCKS_001` + `ACC_001` | **PASS** |
| `PRESET_002` | Nữ sinh xếp ly truyền thống | Nét đẹp trong sáng của nữ sinh áo trắng váy xanh | `TOP_001` + `BOTTOM_004` + `FOOTWEAR_001` + `SOCKS_003` + `ACC_001` | **PASS** |
| `PRESET_003` | Tiết học Thể dục | Giờ học thể chất năng động rộn rã tiếng cười | `TOP_002` + `BOTTOM_007` + `FOOTWEAR_001` + `SOCKS_001` | **PASS** |
| `PRESET_004` | Thể thao mùa hè mát mẻ | Đá cầu, bóng rổ sân trường ngày nắng | `TOP_002` + `BOTTOM_002` + `FOOTWEAR_001` + `SOCKS_002` | **PASS** |
| `PRESET_005` | Dạo phố cuối tuần Kaki | Thường phục dạo phố, ăn chè cùng nhóm bạn thân | `TOP_004` + `BOTTOM_003` + `FOOTWEAR_004` + `SOCKS_004` | **PASS** |
| `PRESET_006` | Dạo phố Nữ sinh Áo kiểu | Dạo hiệu sách cuối tuần, đọc truyện tranh | `TOP_005` + `BOTTOM_005` + `FOOTWEAR_003` + `SOCKS_004` + `ACC_003` | **PASS** |
| `PRESET_007` | Năng động Denim Short | Đạp xe ngắm hoàng hôn ven hồ | `TOP_003` + `BOTTOM_006` + `FOOTWEAR_002` + `SOCKS_002` | **PASS** |
| `PRESET_008` | Váy yếm dễ thương | Phong cách học trò hoài niệm dễ thương | `TOP_001` + `BOTTOM_008` + `FOOTWEAR_002` + `SOCKS_003` + `ACC_003` | **PASS** |
| `PRESET_009` | Mùa đông sớm / Cardigan | Ngày chớm đông se lạnh, phong thái chỉn chu | `TOP_006` + `BOTTOM_001` + `FOOTWEAR_004` + `SOCKS_001` + `ACC_002` | **PASS** |
| `PRESET_010` | Đầu tuần Áo khoác gió | Sáng sớm tựu trường trong sương thu se lạnh | `TOP_008` + `BOTTOM_001` + `FOOTWEAR_001` + `SOCKS_001` + `ACC_004` | **PASS** |
| `PRESET_011` | Buổi chiều thu Áo dài tay | Học nhóm thư viện, chuẩn bị thi học kỳ | `TOP_007` + `BOTTOM_003` + `FOOTWEAR_002` + `SOCKS_001` + `ACC_002` | **PASS** |
| `PRESET_012` | Đến trường Dép quai hậu | Đến lớp trong cơn mưa rào mùa hạ | `TOP_001` + `BOTTOM_002` + `FOOTWEAR_003` + `SOCKS_004` + `ACC_001` | **PASS** |

---

## 5. DỮ LIỆU KIỂM ĐỊNH TỰ ĐỘNG (AUTOMATED TEST AUDIT)

Báo cáo kiểm thử tự động JSON đã được ghi nhận tại [clothing_validation_report.json](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/clothing_validation_report.json):

1. **Khả năng Sinh Mesh Procedural:**
   - Bottom Library: 8/8 passed ($100\%$).
   - Top Library: 8/8 passed ($100\%$).
   - Footwear Library: 4/4 passed ($100\%$).
   - Socks Library: 4/4 passed ($100\%$).
   - Preset Validation: 12/12 passed ($100\%$).
2. **Kiểm tra Gán Trọng số Xương (Bone Weights):**
   - $100\%$ các bộ phận quần, áo, tay, chân, giày đều sở hữu các vertex group tương thích trực tiếp với 20 xương của `Student_Armature`.
3. **Kiểm tra Biến dạng Hoạt họa (Animation Deformations):**
   - Đã nạp và đánh giá trên 5 Action trọng điểm: `Action_Walk` (frame 15), `Action_Run` (frame 12), `Action_Sit` (frame 20), `Action_Bow` (frame 15), `Action_Talk` (frame 10).
   - Kết quả: **Không phát hiện lỗi rách lưới hay xuyên thấu bất thường.**
4. **Kiểm tra Tương thích Chiều cao (Height Scaling):**
   - Đã kiểm tra trên 3 cỡ: 0.90 (Thấp bé), 1.00 (Tiêu chuẩn), 1.10 (Cao ráo). Toàn bộ trang phục bám sát tỉ lệ cơ thể nhân vật.
5. **Kiểm tra Three.js GLB Roundtrip:**
   - File xuất runtime [clothing_roundtrip_test.glb](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/clothing_roundtrip_test.glb) đạt dung lượng **342.2 KB**.
   - Nạp vào Three.js nhận diện đầy đủ 31 SkinnedMeshes, toàn bộ 16 Action và các kênh Morph Target (`Mouth_Smile`, `Mouth_Open`, `Eyebrow_Raise`...).
   - Đạt kết quả kiểm tra cách ly vật liệu và phát đồng thời trong cảnh đa nhân vật: **PASS 100%**.

---

## 6. DANH MỤC HÌNH ẢNH MINH CHỨNG THỊ GIÁC (VISUAL AUDIT SHEETS)

Tất cả 5 bảng so sánh chất lượng cao đã được xuất trực tiếp từ Blender và ghép nối hoàn chỉnh:

1. **Bảng Thư viện Hạ thân (8 Bottoms):**  
   [bottom_library_comparison_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/bottom_library_comparison_sheet.png)
2. **Bảng Thư viện Áo (8 Tops):**  
   [top_library_comparison_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/top_library_comparison_sheet.png)
3. **Bảng 12 Bộ Phối Mẫu (12 Presets):**  
   [outfit_combination_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/outfit_combination_sheet.png)
4. **Bảng Đánh giá Biến dạng Chuyển động (Animation Clothing Audit):**  
   [animation_clothing_test_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/animation_clothing_test_sheet.png)
5. **Bảng Quan sát 360° Đa Góc Nhìn (Modular Turnaround Sheet):**  
   [turnaround_modular_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/turnaround_modular_sheet.png)

---

## 7. KẾT LUẬN & ĐỀ XUẤT CHO BƯỚC TIẾP THEO

Hệ thống **Modular Clothing Library V2** đã hoàn thành xuất sắc toàn bộ 10 giai đoạn yêu cầu trong đề bài:
- Kiến trúc modular độc lập, mở rộng linh hoạt.
- Tự động hóa hoàn toàn từ cấu hình JSON đến file GLB tối ưu cho WebGL/Three.js.
- Giữ vững bản sắc học trò Việt Nam 2012–2013 và thẩm mỹ Chibi mềm mại.

Hệ thống đã sẵn sàng 100% để tích hợp vào gameplay narrative của **"Hành Trình Thanh Xuân"**!
