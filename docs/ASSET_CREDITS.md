# HÀNH TRÌNH THANH XUÂN — GHI NHẬN CÔNG TRẠNG TÀI NGUYÊN (ASSET CREDITS)
*Dự án Game 3D Narrative: Hành Trình Thanh Xuân (Giai đoạn 2012–2013)*  
*Cập nhật lần cuối: Tháng 11/2026*  
*Người lập: Senior 3D Technical Artist & Game Asset Researcher*

---

## 1. NGUYÊN TẮC BẢN QUYỀN & CHÍNH SÁCH TÀI NGUYÊN (ASSET POLICY)

Dự án áp dụng quy trình **Asset-First**:
1. **Ưu tiên tuyệt đối Creative Commons Zero (CC0 1.0 Universal / Public Domain)**: Tự do sử dụng, chỉnh sửa và tích hợp không yêu cầu ghi công bắt buộc, nhưng dự án luôn chủ động ghi nhận đóng góp của cộng đồng.
2. **Creative Commons Attribution (CC-BY 3.0 / 4.0)**: Chỉ sử dụng khi xác minh được nguồn gốc tác giả và lưu trữ đầy đủ thông tin ghi công (attribution).
3. **Tuyệt đối không sử dụng** tài nguyên không rõ nguồn gốc, vi phạm bản quyền hoặc không có giấy phép công khai.

---

## 2. BẢNG GHI NHẬN TÁC GIẢ & GIẤY PHÉP (ATTRIBUTION MATRIX)

| Tên Asset trong Game | Model gốc | Tác giả / Nguồn | Giấy phép (License) | Liên kết gốc | Xử lý kỹ thuật (Pipeline) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`classroom_chalkboard.glb`** | `Blackboard` | **dook** (qua Poly Pizza / Google Poly Archive) | **Creative Commons Attribution (CC-BY)** | [poly.pizza/m/duhtFXbJCfc](https://poly.pizza/m/duhtFXbJCfc) | Scale về kích thước chuẩn lớp học VN ($2.4\text{m} \times 1.49\text{m}$), chuyển màu xanh rêu chống lóa `#1f4726` matte, đặt pivot mặt sau áp tường $Z=0$. |
| **`schoolyard_shade_tree.glb`** | `CommonTree_1` (Stylized Nature MegaKit) | **Quaternius** | **CC0 1.0 Universal (Public Domain)** | [quaternius.com](https://quaternius.com/packs/stylizednature.html) | Scale từ $2.48\text{m}$ lên $5.20\text{m}$, chỉnh màu lá xanh nhiệt đới `#4d8c36` và thân nâu sẫm `#634837`, chuẩn hóa pivot gốc cây $(0, 0, 0)$. |
| **`schoolyard_tropical_tree.glb`** | `Tree Plateau` (Nature Kit 2.1) | **Kenney** (Kenney Vleugels) | **CC0 1.0 Universal (Public Domain)** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | Scale từ $1.25\text{m}$ lên $5.10\text{m}$ (dáng cây bàng phân tầng *Terminalia catappa*), chuyển màu lá xanh nhiệt đới `#52933a`, pivot gốc cây $(0, 0, 0)$. |
| **`schoolyard_flamboyant_tree.glb`** | `CommonTree_Autumn_1` | **Quaternius** | **CC0 1.0 Universal (Public Domain)** | [quaternius.com](https://quaternius.com/packs/stylizednature.html) | Scale lên $5.30\text{m}$, chuyển sắc hoa phượng vĩ đỏ cam `#e0402e` / `#ef5a33`, tán xòe ô che mát sân trường tháng 5/tháng 9. |
| **`school_desk.glb`** | `Vietnamese School Desk` | **Hành Trình Thanh Xuân Team** | **Nội bộ dự án (Proprietary)** | Local (`blender/scripts/generate_desk.py`) | Sinh thủ tục Python từ đầu, mô phỏng chính xác bàn ghế gỗ đôi THCS có ngăn đôi và móc cặp. |

---

## 3. CHI TIẾT GHI CÔNG BẢN QUYỀN (LEGAL ATTRIBUTIONS)

### 3.1. Blackboard by dook
- **Tác phẩm**: Low-poly Blackboard 3D Model
- **Tác giả**: dook
- **Giấy phép**: Creative Commons Attribution 3.0 Unported (CC BY 3.0)
- **Tuyên bố miễn trừ**: Mô hình đã được tải về, chuẩn hóa kích thước, điều chỉnh hệ trục tọa độ, tinh chỉnh sắc độ vật liệu xanh phấn học đường Việt Nam và tối ưu hóa cho công nghệ Three.js WebGL. Giấy phép CC-BY cho phép chia sẻ và thích ứng tự do với điều kiện cung cấp sự ghi nhận thích hợp.

### 3.2. Stylized Nature MegaKit by Quaternius
- **Tác phẩm**: Stylized 3D Nature MegaKit (Trees, Foliage, Environment)
- **Tác giả**: Quaternius ([quaternius.com](https://quaternius.com))
- **Giấy phép**: CC0 1.0 Universal (Public Domain Dedication)
- **Ghi nhận**: Chân thành cảm ơn nghệ sĩ Quaternius vì đã cung cấp bộ tài nguyên 3D phong cách stylized/Ghibli tuyệt đẹp hoàn toàn miễn phí cho cộng đồng phát triển game độc lập.

### 3.3. Nature Kit by Kenney
- **Tác phẩm**: Nature Kit 2.1 (Low-poly foliage and landscape)
- **Tác giả**: Kenney ([kenney.nl](https://kenney.nl))
- **Giấy phép**: CC0 1.0 Universal (Public Domain Dedication)
- **Ghi nhận**: Chân thành cảm ơn Kenney ("Asset Jesus") vì đã hỗ trợ không ngừng cho các nhà làm game độc lập trên toàn thế giới với các bộ asset CC0 chuẩn mực.

---

## 4. BẢO TRÌ VÀ CẬP NHẬT TÀI NGUYÊN

Mọi asset 3D mới đưa vào dự án đều phải được:
1. Đăng ký thông tin vào file máy đọc [asset_manifest.json](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST/assets/asset_manifest.json).
2. Thêm mục ghi công vào tài liệu này [ASSET_CREDITS.md](file:///c:/Users/Admin/Desktop/GAME/GAME-KNDMST/docs/ASSET_CREDITS.md).
3. Kiểm định thông số kỹ thuật qua bộ kiểm thử Three.js `node scripts/validate_props.mjs`.
