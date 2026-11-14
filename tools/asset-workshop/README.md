# 3D Asset Workshop — Hành Trình Thanh Xuân

Xưởng tạo sinh và kiểm thử tài nguyên 3D thủ tục (procedural 3D assets) độc lập sử dụng Three.js cho dự án game **"Hành Trình Thanh Xuân"**.

---

## 1. Tính năng chính

- **Sinh mô hình thủ tục (Procedural Model Generation)**: Tạo lập hình học 3D hoàn toàn bằng mã nguồn TypeScript dựa trên hệ thống tham số kích thước chuẩn (mét/cm), không phụ thuộc vào file 3D ngoại vi dựng sẵn.
- **Trình xem tương tác (OrbitControls)**:
  - Xoay quanh tâm mô hình, phóng to/thu nhỏ (zoom), dịch chuyển (pan).
  - Phím tắt góc nhìn tiêu chuẩn: Phối cảnh (Perspective), Mặt trước (Front), Nhìn từ trên (Top), Nhìn bên (Side), Trục đo (Isometric).
- **Kiểm định mô hình (Model Inspector)**:
  - Thống kê trực tiếp số đa giác (Triangles), đỉnh (Vertices) và số Mesh.
  - Đo đạc kích thước thực tế theo khung bao Bounding Box ($D \times R \times C$ chuẩn cm / mét).
  - Trực quan hóa khung bao hộp (Bounding Box Helper), lưới sàn (Grid) và trục tọa độ (Axes).
- **Chế độ vật liệu đa dạng (Material Switcher)**:
  - **Toon Shader**: Phong cách cozy cartoon ấm áp đồng bộ với art style của game.
  - **Standard PBR**: Vật liệu kim loại - độ nhám chuẩn PBR (`MeshStandardMaterial`) hỗ trợ kiểm tra khi xuất khẩu GLTF/GLB.
  - **Wireframe**: Xem khung dây hình học để tối ưu topo lưới tam giác.
  - **Normals**: Kiểm tra hướng pháp tuyến bề mặt.
- **Xuất file nhị phân GLB (GLTFExporter)**:
  - Xuất mô hình hiện tại ra định dạng `.glb` với một cú nhấp chuột.
  - Cấu trúc cây node phân cấp rõ ràng, dễ dàng nạp vào Blender, Three.js hoặc game engine.

---

## 2. Module mẫu đầu tiên: Bộ bàn ghế học sinh THCS Việt Nam

Thiết kế bám sát tiêu chuẩn phòng học trường trung học cơ sở Việt Nam (Thông tư liên tịch 26/2011/TTLT-BGDĐT-BKHCN-BYT - Cỡ IV và Cỡ V) cùng những chi tiết mang đậm ký ức học đường:

1. **Mặt bàn**: Gỗ tự nhiên hoặc gỗ ép bo viền mềm, có **rãnh đặt bút/thước** mép trên.
2. **Ngăn bàn**: Hộc bàn sâu rộng bên dưới để vừa cặp sách, vở ghi và hộp bút.
3. **Móc treo cặp**: Móc uốn bên sườn bàn đặc trưng để học sinh móc quai balo.
4. **Thanh giằng gác chân**: Thanh thép ngang cách sàn ~12cm để gác chân thoải mái khi ngồi học.
5. **Nút đệm cao su chân đế**: Chống trầy xước sàn gạch bông lớp học.
6. **Ghế học sinh**: Mặt ngồi gỗ vát mép, tựa lưng nghiêng góc $\approx 7^\circ-8^\circ$ công thái học.
7. **4 Cấu hình mẫu (Presets)**:
   - *Bàn rời 2 ghế chuẩn BGD*: Cấu hình tiêu chuẩn phổ biến nhất trong phòng học cấp 2.
   - *Bàn liền ghế cổ điển (2000–2015)*: Ghế và bàn hàn liền khung thép vững chắc.
   - *Bàn học sinh đơn (1 chỗ)*: Dành cho phòng chức năng hoặc góc học tập cá nhân.
   - *Gỗ cũ hoài niệm (Vintage)*: Màu gỗ cánh gián đậm, khung sắt xám đen hoài cổ.

---

## 3. Cấu trúc thư mục

```
tools/asset-workshop/
├── index.html                           # Giao diện web app của Workshop
├── styles.css                           # Giao diện Studio tối giản, hiện đại
├── README.md                            # Tài liệu hướng dẫn sử dụng (file này)
├── src/
│   ├── main.ts                          # Điểm khởi động Workshop, liên kết Viewer & UI
│   ├── viewer.ts                        # Three.js scene, OrbitControls, ánh sáng, inspector, GLTFExporter
│   └── ui.ts                            # Bảng điều khiển tham số, preset picker, toolbar
└── generators/
    ├── types.ts                         # Định nghĩa kiểu dữ liệu chuẩn cho Asset Generator
    ├── vietnameseSchoolDesk.ts          # Module sinh thủ tục: Bàn ghế học sinh THCS
    └── index.ts                         # Registry quản lý danh sách generator
```

---

## 4. Hướng dẫn chạy thử nghiệm

Workshop hoạt động hoàn toàn độc lập mà không can thiệp vào mã nguồn gameplay. Có 2 cách chạy:

### Cách 1: Khởi động riêng Workshop (Khuyên dùng)
Từ thư mục gốc dự án (`GAME-KNDMST`):
```bash
npx vite tools/asset-workshop --port 5174
```
Sau đó mở trình duyệt tại:
```
http://localhost:5174
```

### Cách 2: Mở qua server Dev chính của game
Nếu bạn đang chạy `npm run dev` ở port 5173:
```
http://localhost:5173/tools/asset-workshop/
```

---

## 5. Hướng dẫn tạo thêm Asset Generator mới

Để mở rộng thêm các mô hình trường học khác (ví dụ: *Bảng đen chống lóa*, *Bục giảng*, *Trống trường*, *Quạt trần Vinawind*):

1. Tạo file mới trong `tools/asset-workshop/generators/` (ví dụ: `blackboard.ts`).
2. Triển khai theo interface `AssetGenerator<TParams>` từ `types.ts`:
   - Định nghĩa `defaultParams` và `paramDefinitions`.
   - Viết hàm `build(params, options): THREE.Group`.
   - Cung cấp các `presets`.
3. Đăng ký generator vào mảng `assetGenerators` trong `tools/asset-workshop/generators/index.ts`.
4. Runtime trong game (`src/world/...`) có thể trực tiếp import hàm `build...()` từ file generator để tái sử dụng 100% mã nguồn hình học!
