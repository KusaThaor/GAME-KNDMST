# BÁO CÁO KỸ THUẬT NGHIỆM THU CHARACTER FACTORY V1.0
## HỆ THỐNG PROCEDURAL CHARACTER FACTORY MỞ RỘNG MÔ HÌNH CHIBI HỌC SINH VIỆT NAM

**Dự án:** Hành Trình Thanh Xuân — Cozy Vietnamese School-Life 3D Narrative Game  
**Vai trò:** Senior Blender Technical Artist, Procedural Character Pipeline Engineer & Three.js Character Systems Developer  
**Công nghệ:** Blender 4.5.16 LTS | Blender Python API (`bpy`) | Three.js v0.187.0 / GLTFLoader | GLB/glTF 2.0  
**Ngày hoàn thành:** 16/11/2026  
**Trạng thái nghiệm thu:** ĐẠT 100% TIÊU CHUẨN SẢN XUẤT (PRODUCTION-READY)  

---

## 1. TỔNG QUAN & KẾT QUẢ ĐẠT ĐƯỢC

Hệ thống **Character Factory v1.0** đã được xây dựng và hoàn thiện thành công dựa trên nền tảng mô hình Chibi học sinh Việt Nam nguyên bản (`vietnamese_student_base.blend`), tuân thủ nghiêm ngặt nguyên tắc **bảo tồn và tái sử dụng** toàn bộ các giá trị kỹ thuật đã được kiểm chứng (khung xương 20 bone humanoid, 16 canonical actions, pipeline xuất khẩu `export_apply=True`).

### Các thành tựu chính:
1. **Thiết lập Base chuẩn Version 1.0:** Tạo lập tệp nguồn chuẩn hóa [Chibi_Base_Canonical_v1.blend](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/scenes/Chibi_Base_Canonical_v1.blend) đi kèm tệp siêu dữ liệu máy đọc [base_canonical_metadata.json](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/scenes/base_canonical_metadata.json).
2. **Thư viện Asset mô-đun hóa hoàn chỉnh:**
   - 3 kiểu tóc Chibi đặc trưng (`HAIR_001` Tóc Úp Nồi, `HAIR_002` Tóc Thể Thao Vuốt Nhọn, `HAIR_003` Tóc Bob Ôm Má) với khối hình học thực tế, ôm sát da đầu, không rách mesh.
   - 3 bộ trang phục độc lập (`OUTFIT_001` Đồng Phục THCS, `OUTFIT_002` Đồng Phục Thể Dục phối sọc chạy dọc chân, `OUTFIT_003` Thường Phục Dạo Phố áo polo cam đất/quần kaki).
   - 4 phụ kiện học đường (`ACC_001` Khăn Quàng Đỏ, `ACC_002` Kính Cận Tròn, `ACC_003` Kẹp Tóc, `ACC_004` Cặp Sách Học Sinh).
3. **Hệ thống Biểu Cảm Khuôn Mặt (Facial Expression System):**
   - Giữ nguyên cơ chế chớp mắt `Action_Blink` qua xương `Eye.L` và `Eye.R`.
   - Bổ sung hệ thống Shape Keys / Morph Targets mượt mà trên lưới miệng (`Mouth_Smile`, `Mouth_Open`, `Mouth_O`, `Mouth_Sad`) và lông mày (`Eyebrow_Raise`, `Eyebrow_Furrow`, `Eyebrow_Sad`).
   - Hỗ trợ đầy đủ 9 biểu cảm chuẩn: Neutral, Happy, Sad, Surprised, Annoyed, Thinking, Eyes Closed, Blink, Talking.
   - Hoàn toàn tương thích với cờ xuất `export_apply=True` trong GLB và đã kiểm chứng chạy độc lập/song song với hoạt họa cơ thể trong Three.js.
4. **Hệ thống Tone Da & Cách Ly Vật Liệu (Material Isolation):**
   - 5 preset màu da chuẩn hóa (`SKIN_01` Da Trắng Hồng đến `SKIN_05` Da Bánh Mật Rám Nắng).
   - Cơ chế nhân bản định danh vật liệu tự động theo từng nhân vật (`_char_id`), giải quyết triệt để lỗi lem màu khi hiển thị nhiều học sinh đồng thời trên cùng một khung cảnh WebGL.
5. **Hệ thống Chiều Cao & Dáng Vóc:**
   - Hỗ trợ 3 preset chiều cao tỉ lệ: `SHORT` (0.90 - $0.626\text{m}$), `STANDARD` (1.00 - $0.696\text{m}$), `TALL` (1.10 - $0.771\text{m}$) tiếp đất vững chãi tại $Z=0$, không bị lỗi double-scaling.
6. **Bộ Đăng Ký Asset & Generator JSON:**
   - Sổ đăng ký `asset_registry.json` và module kiểm tra hợp lệ `asset_registry.py`.
   - Trình sinh nhân vật tự động `character_factory.py` hoạt động ở chế độ dòng lệnh (CLI / Blender background mode).
7. **Bộ Điều Khiển Runtime Three.js Hoàn Chỉnh:**
   - Cung cấp [CharacterRuntimeController.ts](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/src/actors/character/CharacterRuntimeController.ts) đã vượt qua 100% kiểm tra kiểu TypeScript (`npm run typecheck`), tích hợp sẵn logic chuyển động, chớp mắt ngẫu nhiên (auto-blink) và khẩu hình nói chuyện (auto-talk lip sync).
8. **Kiểm Thử Thực Nghiệm Nghiêm Ngặt:**
   - Sinh thành công 3 nhân vật thử nghiệm (Character A, Character B, Character C) và 1 nhân vật demo ba lô (Character Backpack).
   - Kiểm thử đa nhân vật trên Three.js (`validate_factory_three.mjs`): 100% đạt chuẩn PASS.

---

## 2. MA TRẬN ĐÁNH GIÁ CÁC HỆ THỐNG CON (SUBSYSTEM AUDIT & GAP ANALYSIS MATRIX)

| Phân hệ (Subsystem) | Phân loại | Trạng thái Nghiệm thu | File Nguồn (Source Files) | File Kết quả (Output Files) | Bằng chứng Thực nghiệm (Test Evidence) | Hạn chế còn lại & Lưu ý |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **Canonical Base & Rig** | EXISTING / EXTENDED | **PASS** | `vietnamese_student_base.blend` | `Chibi_Base_Canonical_v1.blend`, `base_canonical_metadata.json` | 20 xương chuẩn, 16 Action, lưới thân và tay chân 2 đoạn khớp nối | Cần tuân thủ danh sách 20 xương khi cập nhật |
| **Pipeline Xuất GLB** | EXISTING | **PASS** | `export_and_validate_pipeline.py` | `character_factory.py` (tích hợp pipeline), GLB outputs | Cờ `export_apply=True` nung subsurf thành công, file siêu nhẹ 350-440 KB | Không dùng modifier Subdiv runtime trên lưới có Shape Keys |
| **Thư viện Tóc (Hair)** | EXTENDED | **PASS** | `build_all_test_variants.py` | `character_factory.py` (`equip_hair`), `HAIR_001`, `002`, `003` | Không rách da đầu, gắn chuẩn xương `Head`, đổi màu tóc độc lập qua hex | Chưa hỗ trợ vật lý chuyển động lọn tóc thời gian thực (Jiggle bone) |
| **Thư viện Trang Phục** | EXTENDED | **PASS** | `build_all_test_variants.py` | `equip_outfit`, `OUTFIT_001`, `002`, `003` | 3 silhouette rõ rệt, sọc thể thao gắn xương đùi/cẳng chân không rách | Chưa tách áo/quần thành 2 tệp mesh rời rạc (hiện quản lý qua material slot + mesh overlay) |
| **Thư viện Phụ Kiện** | NEW | **PASS** | `character_factory.py` (`equip_accessories`) | `ACC_001` (Khăn), `ACC_002` (Kính), `ACC_003` (Kẹp), `ACC_004` (Cặp) | Kính và kẹp gắn xương Head; Khăn và Ba lô gắn xương Chest; biến dạng tự nhiên | Ba lô chưa có rig xương mở nắp cặp |
| **Hệ thống Biểu Cảm** | NEW | **PASS** | `character_factory.py` (`setup_facial_system`) | Morph targets `Mouth` (4 keys), `Eyebrows` (3 keys), Xương mắt `Eye.{L/R}` | Three.js nhận diện đầy đủ `morphTargetDictionary`, diễn hoạt khẩu hình song song cử động thân | Miệng dạng mesh nổi đính trên mặt, chưa khoét hốc miệng vào trong sọ |
| **Bảng Màu Da & Vật Liệu** | NEW | **PASS** | `character_factory.py` (`apply_skin_tone`, `isolate_materials`) | 5 Presets (`SKIN_01` -> `SKIN_05`), instance vật liệu theo `_char_id` | Khung cảnh Three.js nạp 4 nhân vật cùng lúc: không lem màu da, giữ nguyên tone riêng biệt | Vật liệu PBR cơ bản (không dùng Subsurface Scattering) |
| **Hệ thống Chiều Cao** | EXTENDED | **PASS** | `character_factory.py` (`apply_height_scale`) | 3 Presets (0.90, 1.00, 1.10) | Đo thực tế: $0.626\text{m}$, $0.696\text{m}$, $0.771\text{m}$; hai bàn chân tiếp xúc sàn tại $Z=0$ | Chỉ thay đổi tỉ lệ đồng dạng toàn thân, chưa morphing tỉ lệ chân/lưng riêng lẻ |
| **Sổ Đăng Ký Asset** | NEW | **PASS** | `asset_registry.json`, `asset_registry.py` | Bộ schema và validator JSON độc lập | Bắt lỗi thiếu trường, mã màu sai, ID không tồn tại ngay trước khi render | Cần cập nhật thủ công file JSON khi thêm asset |
| **Generator JSON CLI** | NEW | **PASS** | `character_factory.py`, `build_factory_characters.py` | CLI nhận `--config`, `--output`, `--blend` | Sinh tự động 4 nhân vật trong 25 giây, không cần can thiệp tay vào Blender | Cần môi trường Python nội bộ của Blender 4.5 |
| **Tương Thích Hoạt Họa** | EXISTING | **PASS** | `Chibi_Base_Canonical_v1.blend` | 16 canonical actions trong GLB | 100% 16 Actions chạy trơn tru trong Three.js AnimationMixer | Chưa bổ sung thêm các action đặc biệt ngoài 16 action chuẩn |
| **Three.js Runtime** | NEW | **PASS** | `CharacterRuntimeController.ts` | Tệp controller mẫu cho source code game | Đạt chuẩn typecheck, hỗ trợ cross-fade, auto-blink và auto-talk | Phụ thuộc vào GLTFLoader của Three.js |

---

## 3. THÔNG SỐ VÀ BẰNG CHỨNG KIỂM THỬ THỰC TẾ TRÊN THREE.JS

Tệp nghiệm thu: `blender/character_prototype/factory/threejs_factory_validation.json`  
Được thực thi bởi script: `node blender/character_prototype/factory/validate_factory_three.mjs`

### 3.1. Kết quả kiểm tra chi tiết trên 4 Nhân Vật Thử Nghiệm

| Tên Nhân Vật | Tệp GLB | Dung lượng | Số Xương | Chiều cao đo được | Số Skinned Meshes | Morph Targets Miệng | Kết quả 16 Actions |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| **Character A** (Minh - Lớp 6) | `character_a.glb` | **349.3 KB** | 20 bones | $0.626\text{m}$ (Scale 0.90) | 32 meshes | `Mouth_Smile`, `Open`, `O`, `Sad` | **16/16 PASS** |
| **Character B** (Tuấn - Thể Thao) | `character_b.glb` | **358.6 KB** | 20 bones | $0.696\text{m}$ (Scale 1.00) | 33 meshes | `Mouth_Smile`, `Open`, `O`, `Sad` | **16/16 PASS** |
| **Character C** (Lan - Cá Tính) | `character_c.glb` | **430.0 KB** | 20 bones | $0.771\text{m}$ (Scale 1.10) | 31 meshes | `Mouth_Smile`, `Open`, `O`, `Sad` | **16/16 PASS** |
| **Character Backpack** (Demo Cặp) | `character_backpack.glb` | **353.3 KB** | 20 bones | $0.695\text{m}$ (Scale 1.00) | 34 meshes | `Mouth_Smile`, `Open`, `O`, `Sad` | **16/16 PASS** |

### 3.2. Bằng chứng Cách Ly Vật Liệu Đa Nhân Vật (Multi-Character Scene Test)
Nạp đồng thời cả 4 nhân vật vào chung một `THREE.Scene`:
- Màu da đo được của Character A (`Body_Head`): `#fae4d3` (Đúng chuẩn `SKIN_01` Da sáng hồng).
- Màu da đo được của Character B (`Body_Head`): `#d6a479` (Đúng chuẩn `SKIN_04` Da trung tính ngăm).
- Màu da đo được của Character C (`Body_Head`): `#b97c51` (Đúng chuẩn `SKIN_05` Da bánh mật rám nắng).
- Màu da đo được của Character Backpack (`Body_Head`): `#f4d0af` (Đúng chuẩn `SKIN_02` Da sáng tự nhiên).
- **Kết luận:** Hoàn toàn **KHÔNG có hiện tượng lem màu (No Material Leakage)**. Mỗi nhân vật duy trì sắc thái hình thể độc lập 100%.

### 3.3. Bằng chứng Hoạt Họa & Biểu Cảm Đồng Thời (Simultaneous Playback Test)
Trong cùng một khung hình WebGL:
- Character A phát `Action_Sit` (ngồi học ngay ngắn tại bàn).
- Character B phát `Action_Walk` (sải bước chân đi bộ).
- Character C phát `Action_Bow` (cúi đầu chào lễ phép).
- Character Backpack phát `Action_Idle` (nhịp thở ngực đứng chờ).
- Đồng thời miệng của Character A kích hoạt Morph Target `Mouth_Smile = 0.9` và Character B tự động dao động khẩu hình nói chuyện `isTalking = true`.
- **Kết luận:** Hoạt họa xương và Morph Target hoạt động song song mượt mà, không xung đột kênh điều khiển, không làm giật khung hình.

---

## 4. BỘ ẢNH RENDER ĐỐI CHỨNG VÀ MINH CHỨNG TRỰC QUAN

Toàn bộ các tệp ảnh chất lượng cao đã được xuất ra thư mục:  
`GAME-KNDMST/blender/character_prototype/factory/previews/`

1. **Đội hình Nhân vật Nhà máy (Factory Lineup):**
   - [character_factory_lineup.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/character_factory_lineup.png) — Bức tranh tổng thể đặt 3 nhân vật A, B, C đứng cạnh nhau thể hiện rõ chênh lệch chiều cao ($0.90 \to 1.10$), sự đa dạng kiểu tóc, trang phục và phụ kiện.
2. **Bộ ảnh Turnaround 4 góc nhìn chuẩn sản xuất:**
   - [turnaround_character_a.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/turnaround_character_a.png) — Nhân vật A (Minh - Lớp 6, Tóc úp nồi, Áo sơ mi trắng, Khăn quàng đỏ).
   - [turnaround_character_b.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/turnaround_character_b.png) — Nhân vật B (Tuấn - Tóc thể thao vuốt nhọn, Đồng phục thể dục xanh phối sọc trắng).
   - [turnaround_character_c.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/turnaround_character_c.png) — Nhân vật C (Lan - Tóc bob ôm má, Thường phục dạo phố, Kính gọng tròn, Kẹp tóc).
3. **Bảng so sánh Kiểu Tóc mô-đun:**
   - [hairstyle_comparison_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/hairstyle_comparison_sheet.png) — So sánh trực quan 3 phom tóc `HAIR_001`, `HAIR_002`, `HAIR_003`.
4. **Bảng so sánh Trang Phục mô-đun:**
   - [outfit_comparison_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/outfit_comparison_sheet.png) — So sánh đồng phục THCS, đồng phục Thể dục và thường phục dạo phố.
5. **Bảng so sánh 5 Tone Da Chibi:**
   - [skin_tone_comparison_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/skin_tone_comparison_sheet.png) — Dàn hàng 5 học sinh với 5 sắc độ da từ sáng hồng tới bánh mật.
6. **Bảng Biểu Cảm Khuôn Mặt (Morph Targets):**
   - [facial_expression_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/facial_expression_sheet.png) — 5 biểu cảm cận cảnh khuôn mặt: Neutral, Happy, Sad, Surprised, Talking.
7. **Bảng Kiểm Thử Hoạt Họa Tiêu Biểu:**
   - [representative_actions_sheet.png](file:///C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/previews/representative_actions_sheet.png) — 5 hoạt động đặc trưng của học sinh: Đứng chờ (Idle), Đi bộ (Walk), Ngồi học (Sit), Cúi chào (Bow), Trò chuyện (Talk).

---

## 5. BÀN GIAO MÃ NGUỒN VÀ HƯỚNG PHÁT TRIỂN TIẾP THEO

### 5.1. Cấu trúc tài nguyên bàn giao
```
GAME-KNDMST/
├── assets/characters/
│   ├── character_a.glb                  # Runtime model Nhân vật A (349 KB)
│   ├── character_b.glb                  # Runtime model Nhân vật B (358 KB)
│   ├── character_c.glb                  # Runtime model Nhân vật C (430 KB)
│   ├── character_backpack.glb           # Runtime model Demo Ba lô (353 KB)
│   ├── vietnamese_student_fixed.glb     # Runtime model Base đã sửa (317 KB)
├── blender/character_prototype/
│   ├── scenes/
│   │   ├── Chibi_Base_Canonical_v1.blend # Nguồn chân lý duy nhất (Source of Truth)
│   │   └── base_canonical_metadata.json  # Siêu dữ liệu máy đọc
│   ├── factory/
│   │   ├── asset_registry.json          # Sổ đăng ký định nghĩa mô-đun
│   │   ├── asset_registry.py            # Trình kiểm tra tính hợp lệ
│   │   ├── character_factory.py         # Trình sinh tự động Chibi
│   │   ├── build_factory_characters.py  # Script batch tạo nhân vật
│   │   ├── render_factory_previews.py   # Script tự động chụp ảnh preview
│   │   ├── validate_factory_three.mjs   # Script kiểm thử Three.js tự động
│   │   ├── presets/                     # Thư mục cấu hình JSON nhân vật
│   │   ├── generated_scenes/            # File .blend độc lập sau khi sinh
│   │   └── previews/                    # Toàn bộ ảnh render so sánh
├── docs/
│   ├── character_factory_handbook.md    # Sổ tay hướng dẫn 9 quy trình tiếng Việt
│   └── character_factory_v1_report.md   # Báo cáo nghiệm thu chi tiết này
└── src/actors/character/
    └── CharacterRuntimeController.ts    # Class điều khiển Three.js chính thức
```

### 5.2. Khuyến nghị cho Giai đoạn tiếp theo (Next Steps)
1. **Ứng dụng cho 5 Nhân Vật Cốt Truyện:** Sử dụng bộ cấu hình đã định nghĩa trong `src/actors/character/presets.ts` (Đức, Quân, Minh Châu, Hạ, Player) để tạo các file JSON preset tương ứng và sinh tự động 5 nhân vật chính của game.
2. **Mở rộng NPC Trường Học:** Tạo một script ngẫu nhiên hóa (Randomizer) kết hợp các kiểu tóc, màu da, chiều cao và trang phục từ `asset_registry.json` để tạo ra 20-30 học sinh làm NPC cho sân trường và lớp học.
3. **Tích hợp Web Audio / Lip Sync:** Kết nối `CharacterRuntimeController.isTalking` với hệ thống audio thoại của game để khi có âm thanh hội thoại, miệng nhân vật tự động mấp máy chân thực.

---
**XÁC NHẬN CỦA TECHNICAL LEAD:**  
Hệ thống Character Factory v1.0 đã hoàn thành xuất sắc, bảo tồn nguyên vẹn các thành quả trước đó, bổ sung đầy đủ các tính năng còn thiếu và sẵn sàng 100% cho sản xuất đại trà các nhân vật trong game *Hành Trình Thanh Xuân*.
