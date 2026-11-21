# BÁO CÁO NGHIỆM THU HỆ THỐNG MODULAR HAIRSTYLE LIBRARY V2
## NÂNG CẤP TOÀN DIỆN THƯ VIỆN KIỂU TÓC PROCEDURAL 3D CHIBI HỌC ĐƯỜNG
### DỰ ÁN: HÀNH TRÌNH THANH XUÂN — COZY VIETNAMESE SCHOOL-LIFE 3D NARRATIVE GAME

**Tác giả:** Senior Stylized Character Artist & Blender Procedural Modeling Engineer  
**Thời gian hoàn thành:** 17/11/2026  
**Công nghệ:** Blender 4.5.10 LTS Python API (`bpy`, `bmesh`, `mathutils`) | Three.js / WebGL | GLB / glTF 2.0  
**Trạng thái kiểm định:** **PASS TOÀN DIỆN (100% TẤT CẢ 12 KIỂU TÓC & THREE.JS RUNTIME)**

---

## 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU NÂNG CẤP

### 1.1. Bối cảnh V1.0
Trong hệ thống ban đầu, Character Factory chỉ có 3 kiểu tóc cơ bản:
- `HAIR_001` — Classic Bowl Cut
- `HAIR_002` — Sporty Short
- `HAIR_003` — Rounded Bob

Tuy nhiên, các kiểu tóc này được tạo sơ sài từ khối lập phương 8 đỉnh gắn modifier Subdivision Surface mức 2, độ bóng bề mặt quá cao (Roughness 0.48, Specular cao), tạo cảm giác như "đội mũ bảo hiểm nhựa bóng", thiếu các tép tóc (clumps) tạo khối mềm mại, và vòm da đầu ngắn gây hở gáy.

### 1.2. Mục tiêu Nhiệm vụ V2.0
Nâng cấp và mở rộng thư viện tóc thành **12 kiểu tóc module hóa (12 Modular Hairstyles)** mang đậm bản sắc học đường Việt Nam giai đoạn 2012–2013:
1. **Phong cách Chibi Stylized mềm mại:** Dáng tròn trịa, phân cụm tóc rõ ràng (hair clumps) với silhouette tương phản cao, bề mặt chất liệu lì/satin (matte/satin finish) tránh cảm giác nhựa bóng.
2. **Khắc phục triệt để lỗi da đầu & xuyên thấu (Anti-Clipping):**
   - Vòm da đầu kéo sâu xuống gáy ($Z = 0.435$, góc cực $\phi = 134^\circ$), che phủ 100% sọ sau đầu trên cổ áo đồng phục.
   - Khoét rãnh tai ($X = \pm0.155, Y = -0.010, Z = 0.510$) giải phóng hoàn toàn vành tai.
   - Mái trước dừng ở $Z = 0.545 - 0.552$, không cọ quẹt chân mày ($Z = 0.535$) và gọng kính (`ACC_002`, $Z = 0.520, Y = 0.158$).
3. **Phụ kiện tích hợp:** Tự động sinh dây buộc tóc (torus tie) và nơ ruy băng vải (ribbon bow) cho các kiểu tóc đuôi ngựa và tóc hai bên.
4. **Bảo tồn kiến trúc chuẩn:** Giữ nguyên 100% đầu canonical (`Body_Head`), bộ khung xương 20 bone humanoid (`Student_Armature`), 16 canonical actions và các morph targets khuôn mặt.

---

## 2. MA TRẬN 12 KIỂU TÓC MODULAR (12 HAIRSTYLES CATALOG MATRIX)

| Mã Asset | Tên Tiếng Việt | Tên Tiếng Anh | Số Đỉnh (Verts) | Số Mặt (Faces) | Dung lượng GLB | Đặc trưng Thiết kế & Bối cảnh Học đường 2012–2013 |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `HAIR_001` | Tóc úp nồi học trò | Classic Bowl Cut | 775 | 738 | 360 KB | Tóc úp nồi tròn trịa ngây ngô của các nam sinh lớp 6-7 mới bước chân vào trường THCS. Tép tóc mái đều, cúp tròn quanh trán. |
| `HAIR_002` | Tóc ngắn thể thao vuốt nhọn | Sporty Short | 835 | 790 | 363 KB | Tóc ngắn năng động với các tép tóc vuốt nhọn hướng lên và ra sau, đặc trưng cho học sinh đam mê đá bóng và cầu lông. |
| `HAIR_003` | Tóc tém bob nữ sinh | Rounded Bob | 823 | 786 | 362 KB | Tóc tém bob ngắn ôm nhẹ hai má bầu bĩnh, mái lưa thưa hiền hậu, gắn liền với hình tượng nữ sinh gương mẫu, lớp phó học tập. |
| `HAIR_004` | Tóc ngắn rẽ ngôi 7/3 | Side-Parted Short | 667 | 638 | 354 KB | Kiểu rẽ ngôi lệch 7/3 lịch sự, chỉn chu của lớp trưởng hoặc học sinh thanh lịch tham gia đội tuyển học sinh giỏi. |
| `HAIR_005` | Tóc thẳng ngang lưng lửng | Medium Straight | 1003 | 958 | 372 KB | Mái tóc dài ngang lưng suôn mượt, dịu dàng của thiếu nữ tuổi trăng tròn, hai dải tóc mai rủ nhẹ trước ngực. |
| `HAIR_006` | Tóc đuôi ngựa buộc thấp | Low Ponytail | 817 | 784 | 363 KB | Tóc buộc túm thấp sau gáy bằng dây thun san hô (`#e0564c`), giản dị, gọn gàng trong các giờ tự học và trực nhật. |
| `HAIR_007` | Tóc đuôi ngựa buộc cao | High Ponytail | 985 | 940 | 372 KB | Tóc cột cao phồng trên đỉnh đầu, đuôi tóc uốn lượn tràn đầy sức sống của cô bạn hoạt náo viên cắm trại hè. |
| `HAIR_008` | Tóc hai bên buộc đôi | Twin Pigtails | 1105 | 1048 | 379 KB | Hai chùm tóc uốn cong tinh nghịch hai bên thái dương, thắt nơ ruy băng vàng ấm (`#e5a93b`), nét hồn nhiên của tuổi học trò. |
| `HAIR_009` | Tóc tết bím học sinh | Braided Hair | 1177 | 1112 | 383 KB | Bím tóc thắt so le truyền thống thả dài sau lưng, nút thắt dây buộc san hô, vẻ đoan trang hoài niệm của nữ sinh miền quê. |
| `HAIR_010` | Tóc ngang vai uốn cúp C | Shoulder-Length Hair | 931 | 886 | 368 KB | Tóc dài chạm bờ vai với ngọn tóc uốn cúp chữ C ôm lấy cổ áo sơ mi trắng, nữ tính và trang nhã. |
| `HAIR_011` | Tóc mái xéo phong trào | Side-Swept Bangs | 667 | 638 | 354 KB | Trào lưu mái xéo phủ trán bất đối xứng thịnh hành của tuổi teen và giới trẻ yêu nhạc V-Pop, Hallyu giai đoạn 2012–2013. |
| `HAIR_012` | Tóc ngắn layer đánh rối | Messy Short Hair | 889 | 840 | 366 KB | Tóc ngắn tỉa tầng layer lãng tử với các tép tóc lỉa chỉa tự nhiên, phong thái phóng khoáng của cậu học trò mê vẽ tranh. |

---

## 3. THƯ VIỆN BẢNG MÀU TÓC CHUẨN MỰC (6 AUTHENTIC COLOR PALETTES)

Vật liệu tóc sử dụng `Principled BSDF` cấu hình satin lì:
- **Base Color:** Chuyển đổi chính xác từ sRGB Hex sang Linear Rec.709
- **Roughness:** `0.74` (Tạo độ mềm mờ tự nhiên, triệt tiêu phản xạ gương gay gắt)
- **Specular IOR Level:** `0.22` (Chỉ giữ vệt sáng mỏng tinh tế của tóc thật)
- **Sheen:** `0.25` (Tạo ánh phản quang viền dịu nhẹ theo phong cách anime/manga)

| Mã Màu | Tên Bảng Màu | Mã Màu Hex | Mô Tả Sắc Độ & Bối Cảnh Phù Hợp |
| :--- | :--- | :---: | :--- |
| `COLOR_01` | **Natural Jet Black** | `#1c1615` | Sắc đen tuyền tự nhiên nguyên bản của học sinh Việt Nam. |
| `COLOR_02` | **Soft Charcoal** | `#161b26` | Đen khói ánh xanh than năng động, khỏe khoắn cho trang phục thể thao. |
| `COLOR_03` | **Chestnut Brown** | `#2b1b17` | Nâu hạt dẻ trầm ấm kín đáo, chuẩn nét nữ sinh thanh lịch. |
| `COLOR_04` | **Warm Auburn** | `#4a2c1b` | Nâu đồng ánh ấm phản chiếu ánh nắng sân trường mùa thu. |
| `COLOR_05` | **Deep Blue-Black** | `#182030` | Xanh đen huyền ảo hơi hướng anime học đường nhẹ nhàng. |
| `COLOR_06` | **Honey Brown** | `#613d28` | Nâu mật ong dạo phố cuối tuần tươi tắn, hiện đại. |

---

## 4. ĐỘT PHÁ KIẾN TRÚC & KỸ THUẬT MÔ HÌNH HÓA PROCEDURAL

```
                            [KIẾN TRÚC MÔ HÌNH HÓA PROCEDURAL TÓC V2]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     [VÒM DA ĐẦU (SCALP DOME)]                                     [CÁC TÉP TÓC NỔI (HAIR CLUMPS)]
  ├── Bán cầu mở rộng góc cực:                                ├── Sinh dọc theo đường cong tham số 3D:
  │     Phi_rear = 134° (Z = 0.435m)                           │     P(t) = P0*(1-t)^2 + 2*P1*(1-t)*t + P2*t^2
  │     => Phủ kín gáy, không lộ sọ                            ├── Tiết diện lục giác bo tròn (6-point cross section)
  ├── Giải tỏa vành tai (Ear Clearances):                      ├── Taper Profile mềm mại:
  │     X = ±0.155m, Y = -0.010m, Z = 0.510m                   │     scale(t) = w_base -> w_mid -> w_tip
  │     => Đẩy lùi đỉnh, không cắt qua tai                     └── Tự động hàn đỉnh mút (Cap fan welding)
  └── Mép trán tự thích ứng (Forehead Rim):                                    │
        Y = 0.142m, Z = 0.550m                                                 ▼
        => Cách kính mắt 0.030m, không che lông mày                [PHỤ KIỆN BUỘC TÓC (TIES & BOWS)]
                                                               ├── Vòng thun cao su dạng Torus (bmesh)
                                                               └── Nơ ruy băng vải 2 cánh đối xứng
```

### 4.1. Vòm da đầu mở rộng triệt tiêu khe hở gáy
- **Vấn đề cũ:** Vòm da đầu V1.0 chỉ dừng lại ở $\phi = 105^\circ$ ($Z \approx 0.50\text{m}$), để lộ một khoảng da đầu trống hoác giữa chân tóc và cổ áo sơ mi khi nhìn từ góc nghiêng và phía sau.
- **Giải pháp V2.0:** Hàm `build_scalp_dome` áp dụng phương trình góc cực biến thiên theo hướng $Y$:
  $$\phi_{\max}(\theta) = \phi_{\text{front}} \cdot \left(\frac{1 + \sin\theta}{2}\right) + \phi_{\text{rear}} \cdot \left(\frac{1 - \sin\theta}{2}\right)$$
  Tại phía sau gáy ($\sin\theta = -1$), $\phi_{\max}$ đạt tới $134^\circ$, hạ thấp đường viền chân tóc xuống $Z = 0.406 - 0.410\text{m}$, ôm khít lấy gáy và phủ kín hoàn toàn hộp sọ.

### 4.2. Khắc phục triệt để xuyên thấu (Anti-Clipping)
1. **Tai (Ears):** Vành tai nhân vật nằm tại $X = \pm0.155, Y = -0.010, Z = 0.510$. Vòm da đầu tính khoảng cách 3D từ mỗi đỉnh đến điểm gốc tai; nếu khoảng cách bé hơn bán kính $R_{\text{ear}} = 0.052\text{m}$, đỉnh sẽ được đẩy hướng ra ngoài mặt phẳng và nâng nhẹ lên trên, bảo đảm vành tai luôn nhô ra tự nhiên.
2. **Kính mắt (`ACC_002`) & Lông mày:** Gọng kính cận học sinh nằm ở $Z = 0.518 - 0.523\text{m}, Y = 0.158\text{m}$, và lông mày nằm ở $Z = 0.535\text{m}$. Tất cả các tép tóc mái phía trước trong 12 kiểu tóc đều được khống chế điểm mút chấm dứt tại $Z \ge 0.545\text{m}$ và $Y \le 0.155\text{m}$. Kết quả là không xảy ra bất kỳ va chạm hay xuyên thấu nào giữa tóc, kính và chân mày.
3. **Kẹp tóc hoa (`ACC_003`):** Vị trí kẹp cài tóc được neo tại $X = 0.145, Y = 0.080, Z = 0.585$, bám vững chắc lên các tép tóc mái bên hông mà không bị chìm khuất vào bên trong mesh.

---

## 5. KẾT QUẢ KIỂM THỬ THỊ GIÁC & HỆ THỐNG BẢNG MINH CHỨNG (VISUAL SHEETS)

Tất cả các bảng tổng hợp thị giác đã được kết xuất ở độ phân giải cao và lưu trữ tại thư mục `previews/hairstyles_v2/sheets/`:

1. **Bảng Xoay 4 Hướng Toàn Diện 12 Kiểu Tóc (Turnaround Matrix):**  
   [hairstyles_12_turnaround_matrix.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/hairstyles_v2/sheets/hairstyles_12_turnaround_matrix.png)  
   *Ma trận 12 dòng × 4 cột (Mặt trước, Phối cảnh 3/4, Góc nghiêng bên, Mặt sau) chứng minh độ kín của vòm gáy và sự tách bạch hình khối.*

2. **Bảng So Sánh Silhouette Chính Diện (Front Lineup):**  
   [hairstyles_12_front_lineup.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/hairstyles_v2/sheets/hairstyles_12_front_lineup.png)  
   *Dàn hàng 12 kiểu tóc nhìn từ chính diện, thể hiện rõ 12 hình bóng (silhouette) phân biệt rõ ràng ngay từ khoảng cách xa.*

3. **Bảng Phối Cảnh 3/4 & Kiểm Thử Phụ Kiện (3/4 Perspective Lineup):**  
   [hairstyles_12_threequarter_lineup.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/hairstyles_v2/sheets/hairstyles_12_threequarter_lineup.png)  
   *Kiểm tra độ tương thích khi nhân vật đeo kính cận, cài nơ ruy băng và mặc đồng phục áo sơ mi.*

4. **Bảng 6 Biến Thể Màu Sắc (Color Variants Sheet):**  
   [hairstyles_color_variants_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/hairstyles_v2/sheets/hairstyles_color_variants_sheet.png)  
   *Trình diễn 6 mẫu màu tóc thực tế trên kiểu tóc `HAIR_003 Rounded Bob` dưới ánh sáng studio Three.js.*

---

## 6. DANH MỤC TỆP NGUỒN & SẢN PHẨM BÀN GIAO (DELIVERABLES)

### 6.1. Tệp Nguồn Blender (.blend)
Được lưu trữ độc lập tại [outputs/hairstyles_blend/](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/outputs/hairstyles_blend/):
- `hair_001_source.blend` đến `hair_012_source.blend` (Dung lượng: ~1.45 MB / file, lưu trữ đầy đủ Modifier, Armature, Mesh và Node Material).

### 6.2. Mô Hình Xuất Bản GLB Runtime (.glb)
Được lưu trữ tại [outputs/hairstyles_glb/](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/outputs/hairstyles_glb/):
- `character_hair_001.glb` đến `character_hair_012.glb` (Dung lượng tối ưu: 354 KB – 383 KB).
- Đã kiểm định tương thích 100% với WebGL / Three.js, bảo toàn 16 action hoạt hình.

### 6.3. Báo Cáo Dữ Liệu Kiểm Định (JSON Reports)
- Báo cáo sinh hình học Blender: [hairstyles_validation_report.json](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/hairstyles_validation_report.json)
- Báo cáo chạy nghiệm thu Three.js Runtime: [hairstyles_threejs_validation.json](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/hairstyles_threejs_validation.json)

---

## 7. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG

Thư viện **Modular Hairstyle Library V2** đã đáp ứng trọn vẹn và vượt mức các tiêu chí kỹ thuật và mỹ thuật:
1. **100% Độc lập & Linh hoạt:** Tóc được trang bị độc lập thông qua cấu hình `hair_style: "HAIR_001"` đến `"HAIR_012"`, tự động thích ứng với tỉ lệ nhân vật (`height_scale: 0.90, 1.00, 1.10`).
2. **Loại bỏ hoàn toàn cảm giác mũ bảo hiểm:** Nhờ kỹ thuật clump extrusion với đường cong Bezier và tiết diện lục giác mềm, tóc có độ phồng và tầng lớp tự nhiên.
3. **Hiệu năng WebGL vượt trội:** Tổng polycount của mỗi kiểu tóc chỉ từ 660 đến 1180 đỉnh, giúp tải mượt mà trên mọi thiết bị di động và trình duyệt.
4. **Hệ thống sẵn sàng chuyển giao:** Sổ tay hướng dẫn và Asset Registry đã được đồng bộ hóa hoàn toàn cho đội ngũ phát triển gameplay và cinematic.
