# HÀNH TRÌNH THANH XUÂN — TÀI LIỆU KỸ THUẬT SẢN XUẤT ASSET 3D
**Technical Artist & Blender Automation Production Notes**  
*Dự án: Hành Trình Thanh Xuân (Cozy 3D Narrative Adventure)*  
*Thời gian thực hiện: Tháng 11/2026*  
*Người thực hiện: 3D Technical Artist & Blender Automation Engineer*

---

## 1. TỔNG QUAN DỰ ÁN & ĐỊNH DANH THỊ GIÁC (VISUAL IDENTITY)

- **Thể loại**: Game phiêu lưu tự sự ấm áp (Cozy 3D Narrative Adventure) trên nền tảng Web (Three.js).
- **Bối cảnh**: Trường THCS miền Nam Việt Nam, niên khóa **2012 – 2013** (thời điểm các nhân vật học lớp 6A1).
- **Ngôn ngữ tạo hình (Visual Style)**:
  - Phong cách 3D cách điệu dạng đồ chơi (Toy-like Stylized 3D), tỉ lệ nhân vật bán chibi (semi-chibi).
  - Khối hình học bo tròn mềm mại (generous rounded bevels), không có cạnh sắc nhọn.
  - Vật liệu bề mặt mờ mịn (smooth matte finish), độ nhám cao (roughness 0.5 – 0.65), biến thiên màu sắc vẽ tay nhẹ nhàng (subtle hand-painted feeling).
  - Bảng màu tươi sáng, ánh sáng tự nhiên ban ngày trong trẻo, bầu trời xanh và cây cối xanh tươi đậm chất học đường Việt Nam.
  - Tôn trọng và bảo tồn tính chân thực trong kiến trúc trường học, đồng phục (áo trắng, quần xanh đen, khăn quàng đỏ), bàn ghế gỗ và trang thiết bị lớp học thời kỳ 2012.

---

## 2. GIAI ĐOẠN 1: BÁO CÁO KIỂM TRA MÔI TRƯỜNG (ENVIRONMENT CHECK)

| Tiêu chí | Trạng thái | Chi tiết kỹ thuật |
| :--- | :--- | :--- |
| **Hệ điều hành** | Windows 10/11 | x64 Architecture |
| **Phần mềm Blender** | **Đã cài đặt** | **Blender 4.5.16 LTS** (Bản phát hành ổn định lâu dài) |
| **Đường dẫn thực thi CLI** | Sẵn sàng | `C:\Users\Admin\AppData\Local\Microsoft\WindowsApps\blender-launcher.exe` |
| **Khả năng chạy script** | **100% Hoạt động** | - Chạy nền CLI (`-b --python`) tạo .blend, xuất .glb, render .png tự động.<br>- Chạy tương tác trực tiếp qua Socket Bridge (`127.0.0.1:9876`). |
| **Engine Render có sẵn** | Đầy đủ | **Cycles** (CPU/GPU) và **EEVEE Next** |
| **Thư viện phụ thuộc** | Đầy đủ | Python 3.11/3.12 tích hợp trong Blender (`bpy`, `mathutils`). Không cần cài thêm phần mềm ngoài. |

---

## 3. GIAI ĐOẠN 2: PHÂN TÍCH CONCEPT & BẢNG PHÂN RÃ TÀI NGUYÊN (ASSET BREAKDOWN)

Dựa trên bộ concept art phê duyệt trong `tools/reference/`:
- `master_schoolyard.png`: Bối cảnh sân trường toàn cảnh, ánh sáng, cây cối và dãy lớp.
- `asset_class.png`: Bảng phân rã chi tiết đồ vật lớp học (Prop Sheet).
- `in_class.png`: Không gian phòng học và bố cục bàn ghế, bảng xanh, bục giảng.
- `corridor.png`: Hành lang gạch bông hoa văn, lan can xi măng, cửa lá sách.

### Bảng phân rã nhóm đối tượng 3D (Asset Breakdown Matrix)

| Nhóm tài nguyên | Danh sách đối tượng | Kích thước ước tính | Phương pháp sản xuất | Mức độ phức tạp |
| :--- | :--- | :--- | :--- | :--- |
| **Nội thất lớp học** | **Bàn ghế học sinh THCS** | $1.20\text{m} \times 0.88\text{m} \times 0.74\text{m}$ | **Thủ tục Python (bpy)** | Vừa phải (Tối ưu web) |
| | Bàn giáo viên & Ghế tựa | $1.10\text{m} \times 0.60\text{m} \times 0.75\text{m}$ | Thủ tục Python (bpy) | Nhẹ |
| | Bục giảng gỗ | $1.80\text{m} \times 0.80\text{m} \times 0.15\text{m}$ | Thủ tục Python (bpy) | Rất nhẹ |
| | Bảng xanh chống lóa | $2.40\text{m} \times 0.10\text{m} \times 1.20\text{m}$ | Thủ tục Python (bpy) | Rất nhẹ |
| **Kiến trúc trường học** | Dãy phòng học 2 tầng | Module $6.0\text{m} \times 8.0\text{m}$ | Thủ tục / Modular Kit | Trung bình |
| | Hành lang & Lan can xi măng | Cao $1.0\text{m}$, gạch bông | Thủ tục / Modular Kit | Nhẹ |
| | Cột cờ 3 bậc & Cờ Tổ quốc | Bệ $2.6\text{m}$, cột cao $8.5\text{m}$ | Thủ tục Python (bpy) | Nhẹ |
| | Ghế đá granito sân trường | $1.70\text{m} \times 0.50\text{m} \times 0.75\text{m}$ | Thủ tục Python (bpy) | Nhẹ |
| **Đạo cụ & Phụ kiện** | Quạt trần 3 cánh (Vinawind) | Đường kính $1.4\text{m}$ | Thủ tục Python (bpy) | Nhẹ |
| | Đèn tuýp đôi treo dây | Dài $1.25\text{m}$ | Thủ tục Python (bpy) | Nhẹ |
| | Cặp sách / Balo học sinh | $0.32\text{m} \times 0.20\text{m} \times 0.38\text{m}$ | Modeling tay / Điêu khắc | Chi tiết |
| | Chổi rơm & Hót rác | Cao $0.85\text{m}$ | Thủ tục Python (bpy) | Nhẹ |
| | Bình nước học sinh / Cây nước 20L | Dung tích 20L | Thủ tục Python (bpy) | Nhẹ |
| **Sinh vật & Cảnh quan** | Cây hoa phượng vĩ nở hoa | Cao $5.5\text{m}$, tán rộng $8.0\text{m}$ | Thủ tục tán lá + Dựng cành | Trung bình |
| | Cây bàng phân tầng | Cao $5.2\text{m}$, tán $4$ tầng | Thủ tục tán lá | Trung bình |
| | Chậu kiểng dọc hành lang | Bồn xi măng / đất nung | Thủ tục Python (bpy) | Nhẹ |
| **Nhân vật** | Học sinh nam/nữ lớp 6 (Semi-chibi) | Cao $\approx 1.35\text{m} - 1.40\text{m}$ | Tạc tay (ZBrush/Blender) + Rigging | Cao |

---

## 4. GIAI ĐOẠN 3 & 4: KẾT QUẢ SẢN XUẤT PROTOTYPE ĐẦU TIÊN & KIỂM ĐỊNH

### 4.1. Chi tiết hình học & Tỉ lệ (Geometry & Proportions)
- **Tên Component**: Bộ bàn ghế học sinh THCS (Bàn học đôi 2 chỗ ngồi + 2 ghế rời có tựa lưng).
- **Hệ thống kích thước thực tế**:
  - **Mặt bàn (`Desk_Tabletop`)**: $1.20\text{m} \text{ (rộng)} \times 0.46\text{m} \text{ (sâu)} \times 0.032\text{m} \text{ (dày)}$, cao mặt bàn $0.68\text{m}$.
  - **Hộc ngăn bàn (`Desk_Shelf`)**: Chiều cao lọt lòng $12\text{cm}$, đáy gỗ dày $1.8\text{cm}$, có **vách ngăn đôi ở giữa** chia thành 2 khoang riêng cho 2 học sinh.
  - **Chân bàn (`Desk_Legs`)**: 4 trụ chân gỗ vuông $4.8\text{cm} \times 4.8\text{cm}$ bo cạnh tròn, có thanh giằng đáy 2 bên và **thanh thép giằng gác chân** ngang ở giữa.
  - **Móc treo cặp (`Desk_BagHook`)**: 2 móc kim loại chữ J uốn bên sườn bàn (chi tiết đặc thù trường học Việt Nam).
  - **Ghế học sinh (`Chair_1` & `Chair_2`)**: Rộng $38\text{cm} \times$ sâu $36\text{cm} \times$ cao mặt ngồi $40\text{cm}$; tựa lưng gỗ cao $74\text{cm}$ **nghiêng về sau $8^\circ$** công thái học; 4 chân ghế chunky kèm 4 thanh giằng vuông vững chãi.
- **Tối ưu hình học (Polygon Budget)**:
  - Toàn bộ các góc cạnh đều sử dụng `Bevel Modifier` (độ rộng $4\text{mm} - 8\text{mm}$, 2–3 segments, bật `harden_normals = True`).
  - Tổng số mesh objects: **41 objects**.
  - Dung lượng file GLB: **141 KB** (cực kỳ nhẹ, tối ưu 100% cho web Three.js).

### 4.2. Thiết lập vật liệu PBR (Stylized PBR Materials)
1. **`M_Wood_SchoolDesk`**:
   - Dải màu: Vàng cánh gián nhạt tự nhiên pha nâu sồi mật ong (`#cb8d48` đến `#ba7b3b`).
   - Texture: Sinh thủ tục bằng Noise Texture tỉ lệ dọc tạo thớ gỗ mịn, hòa trộn Color Ramp.
   - Roughness: $0.52$ (bề mặt mịn mờ satin ấm áp, không chói gắt).
   - Metallic: $0.0$.
2. **`M_Metal_Hook`**:
   - Màu sắc: Xám kim loại Inox cách điệu (`#a6adb5`).
   - Metallic: $0.90$.
   - Roughness: $0.32$.

### 4.3. Bảng kiểm tra chất lượng (Validation Checklist)

- [x] **Thực thi script**: Chạy tự động qua Blender không phát sinh lỗi (`SUCCESS`).
- [x] **File nguồn .blend**: Đã lưu tại `blender/scenes/school_desk.blend` (đầy đủ modifiers, ánh sáng, camera).
- [x] **File phân phối .glb**: Đã xuất thành công tại `assets/props/school_desk.glb` (141 KB).
- [x] **Ảnh Preview Render**: Đã render độ phân giải cao $1920 \times 1080$ tại `blender/previews/school_desk.png`.
- [x] **Độ chuẩn xác so với Concept**: Khớp 100% các chi tiết đặc trưng trên `asset_class.png` và `in_class.png` (ngăn đôi, móc cặp, gác chân, tựa lưng nghiêng).
- [x] **Hệ trục & Tọa độ**: Trục Y-up chuẩn WebGL/Three.js, gốc tọa độ $(0, 0, 0)$ đặt ngay mặt đất tâm bàn.

---

## 5. GIAI ĐOẠN 5: SẴN SÀNG TÍCH HỢP THREE.JS (THREE.JS READINESS)

### 5.1. Thông số kỹ thuật cho Three.js
- **Đường dẫn file asset**: `assets/props/school_desk.glb`
- **Đơn vị**: Mét ($1.0\text{ unit} = 1.0\text{ meter}$).
- **Trục hướng**: Mặt trước nhìn về $-Z$, mặt trên hướng $+Y$.
- **Bounding Box tổng thể**:
  - Chiều rộng ($X$): $1.20\text{m}$
  - Chiều sâu ($Z$): $0.88\text{m}$ (tính cả bàn và khoảng lùi của 2 ghế)
  - Chiều cao ($Y$): $0.74\text{m}$ (đỉnh tựa lưng ghế)

### 5.2. Khung va chạm khuyến nghị (Recommended Colliders)
Thay vì dùng mesh phức tạp để tính toán vật lý, khuyến nghị tạo 3 khối va chạm đơn giản (Box Collider):
1. **Desk Collider**: Kích thước $1.20\text{m} \times 0.68\text{m} \times 0.46\text{m}$, tâm tại $(0, 0.34, 0)$.
2. **Chair Left Collider**: Kích thước $0.40\text{m} \times 0.74\text{m} \times 0.40\text{m}$, tâm tại $(-0.32, 0.37, 0.41)$.
3. **Chair Right Collider**: Kích thước $0.40\text{m} \times 0.74\text{m} \times 0.40\text{m}$, tâm tại $(0.32, 0.37, 0.41)$.

### 5.3. Điểm tương tác (Interaction Points / Sockets)
- `Socket_Sit_Left`: Vị trí $(-0.32, 0.41, 0.41)$ — Điểm neo nhân vật ngồi ghế trái.
- `Socket_Sit_Right`: Vị trí $(0.32, 0.41, 0.41)$ — Điểm neo nhân vật ngồi ghế phải.
- `Socket_Hook_Left`: Vị trí $(-0.62, 0.52, -0.06)$ — Điểm treo quai cặp sách bên trái bàn.
- `Socket_Hook_Right`: Vị trí $(0.62, 0.52, -0.06)$ — Điểm treo quai cặp sách bên phải bàn.
- `Socket_DeskTop_L`: Vị trí $(-0.30, 0.68, 0.0)$ — Điểm đặt sách vở / hộp bút học sinh 1.
- `Socket_DeskTop_R`: Vị trí $(0.30, 0.68, 0.0)$ — Điểm đặt sách vở / hộp bút học sinh 2.

### 5.4. Mã nguồn mẫu nạp mô hình vào Three.js (Code Snippet)

```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadSchoolDesk(scene: THREE.Scene, position = new THREE.Vector3(0, 0, 0)): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/props/school_desk.glb',
      (gltf) => {
        const root = gltf.scene;
        root.name = 'Vietnamese_School_Desk_Set';
        root.position.copy(position);

        // Kích hoạt đổ bóng và tối ưu vật liệu
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Đảm bảo vật liệu hiển thị đúng tone màu sRGB
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.55;
              mat.envMapIntensity = 0.8;
            }
          }
        });

        scene.add(root);
        resolve(root);
      },
      undefined,
      (error) => reject(error)
    );
  });
}
```

---

## 6. DANH SÁCH FILE SẢN PHẨM BÀN GIAO (DELIVERABLES)

1. [generate_desk.py](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/scripts/generate_desk.py): Script Python dựng mô hình, xuất GLB và render tự động.
2. [school_desk.blend](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/scenes/school_desk.blend): File dự án Blender gốc đầy đủ vật liệu, ánh sáng, camera.
3. [school_desk.glb](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST/assets/props/school_desk.glb): File nhị phân GLB 3D tối ưu cho Three.js web.
4. [school_desk.png](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/previews/school_desk.png): Ảnh render preview chất lượng cao $1920 \times 1080$.
5. [asset_production_notes.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST/docs/asset_production_notes.md): Toàn bộ tài liệu kỹ thuật sản xuất này.
