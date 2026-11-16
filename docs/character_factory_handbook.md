# SỔ TAY HƯỚNG DẪN CHARACTER FACTORY V2.0
## HỆ THỐNG SẢN XUẤT NHÂN VẬT & THƯ VIỆN TRANG PHỤC MODULAR CLOTHING LIBRARY V2
### DỰ ÁN HÀNH TRÌNH THANH XUÂN — COZY VIETNAMESE SCHOOL-LIFE 3D NARRATIVE GAME

**Tài liệu kỹ thuật nội bộ dành cho:** Technical Artists, 3D Artists, Procedural Pipeline Engineers & Three.js Developers  
**Công nghệ:** Blender 4.5.16 LTS Python API (`bpy`, `bmesh`) | Three.js / WebGL | glTF 2.0 (GLB)  
**Phiên bản hệ thống:** Character Factory v2.0.0 (Clothing Library V2 Modular Architecture)  
**Nguồn chân lý (Canonical Base):** [Chibi_Base_Canonical_v1.blend](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/scenes/Chibi_Base_Canonical_v1.blend)  
**Sổ đăng ký tài nguyên (Asset Registry):** [asset_registry.json](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/asset_registry.json)  

---

## 1. TỔNG QUAN KIẾN TRÚC MODULAR CLOTHING LIBRARY V2

Character Factory v2.0 đánh dấu bước chuyển mình quan trọng từ hệ thống trang phục nguyên khối (monolithic recoloring) sang **Hệ thống Trang phục Module Hóa Độc lập (Modular Clothing System)**.

Hệ thống cho phép phối đồ tự do cho các nhân vật học sinh Việt Nam bối cảnh 2012–2013 với tính thẩm mỹ Chibi mềm mại hoài niệm, bảo tồn 100% bộ khung xương 20 bone humanoid (`Student_Armature`), 16 canonical action và toàn bộ hệ thống morph target khuôn mặt.

### 6 Phân Vùng Trang Phục Độc Lập (Categories):
1. **TOP (Áo & Trang phục Thượng thân):** 8 mẫu áo độc lập (`TOP_001` đến `TOP_008`).
2. **BOTTOM (Quần & Váy Hạ thân):** 8 mẫu quần và váy (`BOTTOM_001` đến `BOTTOM_008`).
3. **FOOTWEAR (Giày & Dép):** 4 mẫu giày dép học sinh (`FOOTWEAR_001` đến `FOOTWEAR_004`).
4. **SOCKS (Vớ & Tất):** 4 cấp độ mang vớ (`SOCKS_001` đến `SOCKS_004`).
5. **ACCESSORIES (Phụ kiện):** 4 phụ kiện học đường (`ACC_001` đến `ACC_004`).
6. **OUTFIT_PRESETS (Bộ phối mẫu chuẩn):** 12 bộ trang phục hoàn chỉnh được cấu hình sẵn theo bối cảnh kịch bản và câu chuyện học đường.

---

## 2. QUẢN LÝ HÌNH HỌC ẨN & DA TỰ ĐIỀU CHỈNH (ADAPTIVE BODY LIMBS)

Để loại bỏ triệt để hiện tượng xuyên thấu lưới (mesh clipping) khi nhân vật cử động trong Three.js mà không làm tăng dung lượng mesh:

1. **Khử khối monolithic thân cũ:** Khi trang phục modular được kích hoạt, các khối thân liền quần cũ (`Character_Torso_Legs`), tay cũ (`Character_Arm_L/R`) và cổ áo cũ (`Shirt_Collar`) được gỡ bỏ hoàn toàn.
2. **Sinh chi da tự thích ứng (`build_adaptive_body_limbs`):**
   - **Cánh tay (Arms):** Với áo cộc tay (`TOP_001` đến `TOP_005`), sinh cẳng tay và bàn tay mang vật liệu `M_Skin_{char_id}`. Với áo dài tay (`TOP_006` đến `TOP_008`), chỉ sinh bàn tay lộ ra ngoài cổ tay.
   - **Chân (Legs):** Với quần soóc hoặc chân váy (`BOTTOM_002`, `003`, `004`, `005`, `006`, `008`), sinh bắp chân từ dưới gấu váy ($Z = 0.140$) xuống mắt cá chân ($Z = 0.038$). Với quần dài (`BOTTOM_001`, `007`), không sinh lưới chân ẩn dưới quần.
   - **Bàn chân (Feet):** Khi mang dép quai hậu (`FOOTWEAR_003`), sinh bàn chân trần lộ ngón và mu bàn chân. Khi mang giày bata, giày vải hoặc giày lười kín mũi, phần da chân ẩn bên trong giày được lược bỏ hoàn toàn.
3. **Trọng số kép cho Chân váy (Dual-Thigh Skirt Blending):** Váy xếp ly (`BOTTOM_004`) và váy chữ A (`BOTTOM_005`) được gán trọng số chia sẻ giữa `Thigh.L` và `Thigh.R` (hệ số `0.50` cho đùi cùng bên và `0.20` cho đùi đối diện), triệt tiêu hoàn toàn tình trạng váy bị kéo căng đứt gãy hoặc đơ cứng dạng ống trụ khi nhân vật ngồi (`Action_Sit`) hoặc đi dạo (`Action_Walk`).

---

## 3. DANH MỤC TRANG PHỤC HẠ THÂN (BOTTOM LIBRARY — 8 ASSETS)

| Mã ID | Tên tiếng Việt | Tên tiếng Anh | Kiểu dáng & Thiết kế | Phân loại | Xử lý Da Chân |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `BOTTOM_001` | Quần tây học sinh THCS | Long School Trousers | Quần tây xanh tím than (`#1c2841`) ống đứng suông phẳng phiu, chuẩn nội quy | Quần dài | Phủ kín |
| `BOTTOM_002` | Quần soóc đồng phục | School Uniform Shorts | Quần soóc xanh tím than ngang gối rộng rãi thoáng mát | Quần soóc | Lộ bắp chân |
| `BOTTOM_003` | Quần short kaki nâu ấm | Casual Khaki Shorts | Vải kaki mềm màu nâu cát (`#9c876b`), dáng dã ngoại cuối tuần | Quần soóc | Lộ bắp chân |
| `BOTTOM_004` | Chân váy xếp ly đồng phục | Pleated School Skirt | Váy 16 nếp gấp chữ A xòe nhẹ (`#1e2b48`), độ dài ngang gối kín đáo | Chân váy | Lộ bắp chân |
| `BOTTOM_005` | Chân váy chữ A dạo phố | Casual A-Line Skirt | Dáng chữ A mềm mại viền uốn lượn màu pastel phấn nhạt (`#8faec5`) | Chân váy | Lộ bắp chân |
| `BOTTOM_006` | Quần soóc jean xanh | Denim Shorts | Quần short bò xanh trung tính (`#2b476e`), đường may khỏe khoắn | Quần soóc | Lộ bắp chân |
| `BOTTOM_007` | Quần thể dục dài viền sọc | PE Sports Pants | Quần thun xanh tím than (`#14253d`) kèm sọc đôi trắng (`#f2f5f8`) bên sườn | Quần dài | Phủ kín |
| `BOTTOM_008` | Váy yếm học sinh kèm quai | Pinafore Skirt | Thân váy xếp ly kết hợp yếm ngực và quai đeo vai vintage 2012 | Váy yếm | Lộ bắp chân |

> [!NOTE]
> **Quy tắc tương thích của Váy yếm (BOTTOM_008):** Váy yếm có quai đeo vai trước ngực nên chỉ tương thích với các mẫu áo ôm hoặc sơ mi/thun gọn gàng (`TOP_001`, `TOP_003`, `TOP_004`, `TOP_005`). Hệ thống sẽ tự động cảnh báo nếu người dùng cố tình phối `BOTTOM_008` với áo khoác phồng (`TOP_008`) hoặc cardigan len (`TOP_006`).

---

## 4. DANH MỤC ÁO TRANG PHỤC (TOP LIBRARY — 8 ASSETS)

| Mã ID | Tên tiếng Việt | Tên tiếng Anh | Kiểu cổ & Tay áo | Màu sắc mặc định | Khả năng khoác ngoài |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `TOP_001` | Áo sơ mi trắng học sinh | White School Shirt | Cổ bẻ vuông góc tiêu chuẩn, tay ngắn, túi ngực nhỏ | Trắng ngà `#f7f5ef` | Hỗ trợ |
| `TOP_002` | Áo thể dục xanh phối cổ trắng | Blue PE Shirt | Cổ polo dệt trắng, tay cộc xanh coban năng động | Xanh `#1e528e` / Cổ `#f2f5f8` | Không |
| `TOP_003` | Áo thun cơ bản cổ tròn | Basic T-Shirt | Cổ viền bo tròn năng động, cộc tay màu tươi tắn | Đỏ cam `#e0564c` | Hỗ trợ |
| `TOP_004` | Áo thun polo có cổ | Polo Shirt | Cổ bẻ polo thanh lịch có khuy gài, cộc tay dạo phố | Xanh rêu `#2d5a43` | Hỗ trợ |
| `TOP_005` | Áo kiểu nữ sinh cổ sen | Casual Blouse | Cổ tròn Peter Pan bo mềm, tay cộc phồng nhẹ nữ tính | Trắng kem `#fbf7ee` | Hỗ trợ |
| `TOP_006` | Áo len mỏng cardigan dài tay | Light Cardigan | Áo len dệt kim mỏng cài cúc, cổ chữ V, tay dài chạm cổ tay | Be ấm `#bfae99` | Không (Lớp ngoài) |
| `TOP_007` | Áo thun dài tay thu đông | Casual Long-Sleeve | Cổ viền tròn, tay dài cotton phối màu ấm áp ngày lạnh | Xám chì `#8c8f94` / Xanh navy | Hỗ trợ |
| `TOP_008` | Áo khoác gió học sinh | Light Jacket | Cổ đứng kéo khóa thể thao, 2 lớp vải dù chắn gió | Xanh đậm `#192740` / Cổ `#4a8ec2` | Không (Lớp ngoài) |

---

## 5. DANH MỤC GIÀY DÉP & VỚ (FOOTWEAR & SOCKS)

### 5.1. Giày Dép (Footwear)
1. `FOOTWEAR_001` — **Giày bata trắng học sinh (White Sneakers):** Đôi giày bata vải trắng Thượng Đình đế cao su dẻo huyền thoại gắn liền với tuổi thơ thế hệ 9x đầu 2000.
2. `FOOTWEAR_002` — **Giày vải canvas mũi cao su (Canvas Low-Tops):** Giày bệt buộc dây màu xanh đen/đen, mũi cao su trắng bảo vệ đầu ngón.
3. `FOOTWEAR_003` — **Dép quai hậu học sinh (Simple Sandals):** Dép quai da nâu đế kếp cao su đen, trang phục mùa mưa và mùa hè bắt buộc theo nội quy nhà trường.
4. `FOOTWEAR_004` — **Giày lười dạo phố (Casual Slip-On Shoes):** Giày lười vải êm chân không dây buộc, viền đế màu kem nhạt.

### 5.2. Vớ (Socks)
1. `SOCKS_001` — **Vớ ngắn cổ bắp chân (Short White Socks):** Cổ vớ cao qua mắt cá $Z = 0.075\text{m}$, chuẩn mực khi mang giày bata.
2. `SOCKS_002` — **Vớ mắt cá chân (Ankle Socks):** Cổ ngắn sát mắt cá $Z = 0.052\text{m}$, gọn gàng thể thao.
3. `SOCKS_003` — **Vớ cao ngang gối (Knee-High Socks):** Vớ dài trắng sát đầu gối $Z = 0.110\text{m}$, duyên dáng khi kết hợp chân váy xếp ly hoặc váy yếm.
4. `SOCKS_004` — **Không mang vớ / Chân trần (No Visible Socks):** Không sinh mesh vớ, lộ trọn cổ chân và bàn chân khi đi dép quai hậu hoặc giày lười.

---

## 6. DANH MỤC 12 BỘ TRANG PHỤC MẪU (OUTFIT PRESETS)

| Mã Preset | Tên Bộ Trang Phục | Bối Cảnh Kịch Bản & Không Khí | Công Thức Phối Ghép Modular | Chiều cao & Da đề xuất |
| :--- | :--- | :--- | :--- | :---: |
| `PRESET_001` | Nam sinh tiêu chuẩn THCS | Lễ chào cờ đầu tuần trang nghiêm | `TOP_001` + `BOTTOM_001` + `FOOTWEAR_001` + `SOCKS_001` + `ACC_001` | `STANDARD` / `SKIN_02` |
| `PRESET_002` | Nữ sinh xếp ly truyền thống | Đồng phục nữ sinh dịu dàng | `TOP_001` + `BOTTOM_004` + `FOOTWEAR_001` + `SOCKS_003` + `ACC_001` | `STANDARD` / `SKIN_01` |
| `PRESET_003` | Tiết học Thể dục | Giờ học thể chất năng động | `TOP_002` + `BOTTOM_007` + `FOOTWEAR_001` + `SOCKS_001` | `STANDARD` / `SKIN_03` |
| `PRESET_004` | Thể thao mùa hè mát mẻ | Đá cầu, bóng rổ sau giờ học | `TOP_002` + `BOTTOM_002` + `FOOTWEAR_001` + `SOCKS_002` | `SHORT` / `SKIN_04` |
| `PRESET_005` | Dạo phố cuối tuần Kaki | Cuối tuần ăn chè, dạo phố | `TOP_004` + `BOTTOM_003` + `FOOTWEAR_004` + `SOCKS_004` | `STANDARD` / `SKIN_03` |
| `PRESET_006` | Dạo phố Nữ sinh Áo kiểu Chữ A | Đến hiệu sách, thư viện | `TOP_005` + `BOTTOM_005` + `FOOTWEAR_003` + `SOCKS_004` + `ACC_003` | `STANDARD` / `SKIN_02` |
| `PRESET_007` | Năng động Denim Short | Đạp xe ngắm hoàng hôn | `TOP_003` + `BOTTOM_006` + `FOOTWEAR_002` + `SOCKS_002` | `SHORT` / `SKIN_01` |
| `PRESET_008` | Váy yếm dễ thương | Phong cách học trò retro 2012 | `TOP_001` + `BOTTOM_008` + `FOOTWEAR_002` + `SOCKS_003` + `ACC_003` | `STANDARD` / `SKIN_02` |
| `PRESET_009` | Mùa đông sớm / Cardigan | Ngày chớm gió mùa đông bắc | `TOP_006` + `BOTTOM_001` + `FOOTWEAR_004` + `SOCKS_001` + `ACC_002` | `TALL` / `SKIN_03` |
| `PRESET_010` | Đầu tuần Áo khoác gió & Cặp sách | Sáng sớm sương thu đến lớp | `TOP_008` + `BOTTOM_001` + `FOOTWEAR_001` + `SOCKS_001` + `ACC_004` | `TALL` / `SKIN_05` |
| `PRESET_011` | Buổi chiều thu Áo dài tay | Học nhóm ôn thi học kỳ | `TOP_007` + `BOTTOM_003` + `FOOTWEAR_002` + `SOCKS_001` + `ACC_002` | `STANDARD` / `SKIN_02` |
| `PRESET_012` | Đến trường Dép quai hậu mùa mưa | Đi học trong cơn mưa rào | `TOP_001` + `BOTTOM_002` + `FOOTWEAR_003` + `SOCKS_004` + `ACC_001` | `SHORT` / `SKIN_03` |

---

## 7. CẤU HÌNH NHÂN VẬT JSON (CONFIGURATION SPECIFICATION)

### Cách 1: Sử dụng mã Preset nhanh (`outfit_preset`)
```json
{
  "character_id": "student_lan",
  "name": "Hoàng Thị Lan",
  "height_scale": 1.0,
  "skin_tone": "SKIN_02",
  "hair_style": "HAIR_003",
  "hair_color": "#2b1b17",
  "outfit_preset": "PRESET_002",
  "accessories": ["ACC_001", "ACC_003"],
  "default_expression": "Happy"
}
```

### Cách 2: Phối ghép chi tiết từng món đồ (`top_id`, `bottom_id`, `footwear_id`, `socks_id`)
```json
{
  "character_id": "student_phong",
  "name": "Nguyễn Thanh Phong",
  "height_scale": 1.10,
  "skin_tone": "SKIN_03",
  "hair_style": "HAIR_002",
  "hair_color": "#161b26",
  "top_id": "TOP_008",
  "bottom_id": "BOTTOM_001",
  "footwear_id": "FOOTWEAR_001",
  "socks_id": "SOCKS_001",
  "accessories": ["ACC_004"],
  "default_expression": "Neutral",
  "color_overrides": {
    "top_color": "#1e3a5f"
  }
}
```

---

## 8. DANH MỤC BẢNG SO SÁNH & HÌNH ẢNH MINH CHỨNG (VISUAL SHEETS)

Các bảng tổng hợp thị giác đã được kết xuất trực tiếp từ Blender và đóng gói bằng PIL:

1. **Bảng Thư viện Hạ thân (8 Bottoms):** [bottom_library_comparison_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/bottom_library_comparison_sheet.png)
2. **Bảng Thư viện Áo (8 Tops):** [top_library_comparison_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/top_library_comparison_sheet.png)
3. **Bảng 12 Bộ Phối Mẫu (12 Presets):** [outfit_combination_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/outfit_combination_sheet.png)
4. **Bảng Kiểm thử Chuyển động (Animation Clothing Audit):** [animation_clothing_test_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/animation_clothing_test_sheet.png)
5. **Bảng Quan sát 360° Đa Góc Nhìn (Modular Turnaround Sheet):** [turnaround_modular_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/sheets/turnaround_modular_sheet.png)

---

## 9. QUY TRÌNH KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST COMMANDS)

### Kiểm thử Toàn diện Thư viện Trang phục
```powershell
Start-Process -FilePath "blender-launcher.exe" -ArgumentList "-b", "-P", "blender/character_prototype/factory/validate_clothing_library.py" -Wait
```

### Kiểm thử Tương thích Three.js Runtime
```bash
node blender/character_prototype/factory/validate_factory_three.mjs
```

### Sinh Toàn bộ 5 Bảng Thị giác (Visual Sheets)
```powershell
Start-Process -FilePath "blender-launcher.exe" -ArgumentList "-b", "-P", "blender/character_prototype/factory/render_clothing_frames.py" -Wait
python blender/character_prototype/factory/composite_clothing_sheets.py
```
