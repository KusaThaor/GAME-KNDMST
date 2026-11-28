# BÁO CÁO TIẾN ĐỘ & TÀI LIỆU BÀN GIAO DỰ ÁN
**Dự án:** Game Ký Ức Tuổi Thơ (KNDMST)  
**Nhánh Git:** `feat/sprint-0412`  
**Ngày bàn giao:** 28/11/2026  
**Trạng thái hệ thống:** Sẵn sàng kiểm thử, toàn bộ 45 bộ test suite đều PASS, build production thành công.

---

## 1. TỔNG QUAN CÁC TÍNH NĂNG ĐÃ HOÀN THIỆN

### 1.1. Bản Đồ Thu Nhỏ & Điều Hướng (Minimap & Navigation UX)
- **Minimap hình tròn (Circular Map):** Thay thế khung chữ nhật cũ bằng khung tròn viền pastel mềm mại, có đổ bóng.
- **Tương tác 1-chạm:** Bỏ nút `[M]` rườm rà; người chơi chỉ cần nhấp trực tiếp vào bản đồ tròn để mở rộng bản đồ toàn màn hình.
- **Ẩn mũi tên sàn:** Tạm ẩn mũi tên chỉ đường lớn dưới đất theo yêu cầu để khung cảnh sạch sẽ, hoài niệm hơn.
- **Tính năng Chụp Ảnh Kỷ Niệm (Selfie / Phím `C`):** Chụp nhanh màn hình góc cận nhân vật kèm hiệu ứng flash trắng, âm thanh màn trập và tự động tải ảnh PNG lưu niệm về máy.

### 1.2. Sổ / Album Kỷ Niệm Scrapbook
- **Bố cục tự nhiên (Scrapbook Layout):** Loại bỏ toàn bộ các label kỹ thuật thừa (`Trang trắng`, `Kho sticker...`, `Ảnh kỷ niệm`, `Ghi chú...`, icon ghim).
- **Khung ảnh & Quote:** Sử dụng viền nét đứt (dashed border) mềm mại, dàn đều trang trí tự nhiên theo từng trang.
- **Hiệu ứng Khóa ký ức:** Các quote chưa mở khóa được áp dụng hiệu ứng mờ nhòe căm (`filter: blur(6px)`) hoàn toàn không đọc được; chỉ khi hoàn thành cốt truyện mới hiển thị rõ.
- **Điều hướng tinh tế:** Nút lật trang ở góc sách chỉ tự động xuất hiện khi người dùng rê chuột vào trang.
- **Kho Sticker phong phú:** Bổ sung 19 sticker vector SVG đa dạng (sao, hoa, cầu lông, thuyền giấy, máy ảnh, cầu vồng, cỏ 4 lá, trái tim, mèo con, vương miện, băng cassette, washi tape...).
- **Cá nhân hóa trang sổ:** Tùy biến màu giấy pastel, chất liệu giấy (chấm bi, kẻ ô, kraft, vintage) và bìa album.
- **Cơ chế Xem thử (Try-before-you-buy):** Nhấp chọn sticker/giấy để ướm thử ngay trên trang sổ với banner thông báo trạng thái mà không bị trừ tiền trước.

### 1.3. Cửa Hàng & Ví Tiền Tệ Demo (Shop Demo & IAP)
- **Hệ thống Song Tệ (Dual Currency):**
  - **Xu Kỷ Niệm** (Soft currency): Kiếm được từ nhiệm vụ, xem quảng cáo.
  - **Tem Thanh Xuân** (Hard currency): Nạp qua gói demo IAP.
- **Giao diện chuẩn E-commerce:** Thẻ gói hiển thị rõ giá gốc gạch ngang, giá khuyến mãi, huy hiệu `% tiết kiệm` nổi bật.
- **Nạp demo & Nhận thưởng:** Tích hợp nút nạp mô phỏng an toàn (không trừ tiền thật) và nút "Xem quảng cáo nhận xu".

### 1.4. Hệ Thống Trang Trí Phòng 2026 (Room Decor Panel)
- **Drawer bên phải tại Hub 2026:** Bấm nút `🛋️ Trang trí phòng` trên HUD để mở panel.
- **5 Chủ đề phòng hoàn chỉnh:**
  1. *Ấm cúng mặc định* (Gỗ sồi, tường be, rèm vàng).
  2. *Góc học tập 2015* (Gỗ phong, tường xanh bạc hà, rèm xanh lơ).
  3. *Khu vườn của Mây* (Gỗ thông, tường cam pastel, rèm hồng đào).
  4. *Xưởng chế tạo Tí Nổ* (Gỗ mun, tường xám xi măng, rèm xanh thẫm).
  5. *Đêm đom đóm* (Gỗ óc chó, tường chàm đêm, rèm tím lavender).
- **Vật phẩm 3D trang trí phòng:** Sen đá bàn học, Mèo lười bông trên giường, Mô hình tên lửa mini, Dây đèn đom đóm fairy lights (cập nhật Three.js Mesh trực tiếp).

### 1.5. Tủ Đồ Nhân Vật 3D (Wardrobe & Customizer)
- **Modal 3D tương tác:** Bấm nút `👕 Tủ đồ` trên HUD để mở màn hình thử đồ.
- **Bệ xoay 360° (Turntable Canvas):** Nhân vật chibi 3D đứng trên bệ xoay, tự động cử động idle mượt mà, hỗ trợ kéo chuột xoay 360 độ.
- **5 Tab tùy biến toàn diện:**
  1. **Trang phục:** 6 bộ (Đồng phục THCS, Thể dục năng động, Cardigan thu đông, Hoodie thanh xuân, Áo khoác Denim, Set Hồng Anh Đào VIP).
  2. **Kiểu tóc:** 10 kiểu tóc chi tiết (Tóc nguyên bản, Tóc nhím năng động, Mái ngố thư sinh, Rẽ ngôi 7/3 học đường 2000s, Búi đôi củ tỏi Natra, Đuôi ngựa cao, Đuôi gà buộc thấp, Bob ngắn uốn lọn, Tóc dài kẹp hoa, Đầu đinh thể thao).
  3. **Màu tóc:** Tóc nguyên bản, Nâu hạt dẻ, Vàng caramel, Xanh đêm navy.
  4. **Màu da:** 8 tông da tự nhiên, chân thực (Nguyên bản, Trắng sáng tự nhiên, Trắng hồng đào, Sáng ấm tự nhiên, Bánh mật rám nắng, Vàng mật ong, Ngăm thể thao, Nâu ấm cá tính).
  5. **Phụ kiện:** Kính tròn Nobita, Tai nghe chụp Gaming, Mũ lưỡi trai, Nơ kẹp tóc.
- **Đồng bộ toàn diện:** Lưu vào `SaveState.player_outfit` và tự động làm mới avatar 3D cả khi ở Hub phòng lẫn khi ra thế giới trường học (`DayScene`).

### 1.6. Dẫn Truyện Điện Ảnh (Cinematic Narrative & Handwriting Typewriter)
- **Chính giữa màn hình, không khung hộp:** Bỏ toàn bộ viền hộp và khung chữ nhật cũ. Câu chuyện xuất hiện thanh thoát ngay giữa trung tâm màn hình, kèm lớp nền radial vignette mềm mại.
- **Font chữ viết tay chuẩn tiếng Việt:** Sử dụng font *Patrick Hand* & *Caveat* hỗ trợ đầy đủ bộ ký tự có dấu tiếng Việt, mang đậm phong cách nhật ký / lưu bút học trò.
- **Chữ nổi bật trên mọi bối cảnh:** Áp dụng hệ thống đa lớp bóng chữ (`text-shadow`), đảm bảo chữ đọc sắc nét trên cả cảnh ngày, chiều tà hay đêm tối.
- **Hiệu ứng gõ chữ (Typewriter):** Từng ký tự hiện ra từ từ kèm con trỏ nhấp nháy. Người chơi có thể nhấn Space hoặc nhấp chuột bất kỳ đâu để hiện ngay toàn bộ câu chữ nếu muốn đọc nhanh.

---

## 2. KIẾN TRÚC & CÁC FILE ĐÃ TÁC ĐỘNG

| File | Chức năng chính |
|------|-----------------|
| `src/config/cosmetics.ts` | Khai báo danh mục vật phẩm phòng, trang phục, phụ kiện, màu tóc, luật mở khóa & giá tiền |
| `src/core/save.ts` | Mở rộng schema `SaveState`: `wallet`, `room_decor`, `player_outfit`, `unlocked_cosmetics`, `album_stickers` |
| `src/ui/game/store.ts` | Quản lý state UI: reactive store, mở/đóng modal, thử đồ, nạp tiền, mua vật phẩm |
| `src/actors/character/build.ts` | Xây dựng Mesh & Material rig 3D nhân vật hỗ trợ outfit, phụ kiện và màu tóc động |
| `src/actors/player/rigAdapter.ts` | Adapter nạp outfit từ state vào rig người chơi |
| `src/game/scenes/hubScene.ts` | Dynamic shader/material cho phòng 2026 & render cụm vật phẩm 3D trang trí phòng |
| `src/game/scenes/dayScene.ts` | Hỗ trợ `setPlayerOutfit` làm mới model nhân vật trong gameplay trường học |
| `src/ui/game/panels/RoomDecorPanel.tsx` | UI drawer chọn chủ đề và bài trí đồ 3D phòng ngủ |
| `src/ui/game/panels/WardrobePanel.tsx` | UI modal tủ đồ tích hợp Three.js turntable 3D canvas xoay 360° |
| `src/ui/game/panels/AlbumPanel.tsx` | Album kỷ niệm phong cách scrapbook, lật trang, preview sticker & giấy |
| `src/ui/game/panels/ShopDemoPanel.tsx` | Cửa hàng gói quà, nạp demo IAP và xem ads nhận xu |
| `src/ui/game/overlays/HudBar.tsx` | Nút mở nhanh tủ đồ, trang trí phòng và hiển thị số dư ví tiền |
| `src/styles.css` | Toàn bộ style giao diện pastel, hiệu ứng blur, bo góc và hiệu ứng chuyển động |

---

## 3. HƯỚNG DẪN KHỞI CHẠY & TIẾP TỤC CÔNG VIỆC

### 3.1. Khởi động môi trường phát triển (Dev server)
Mở terminal tại thư mục dự án và chạy:
```powershell
npm.cmd run dev
```
Truy cập trình duyệt tại: `http://localhost:5173/`

### 3.2. Chạy kiểm thử tự động
```powershell
# Chạy toàn bộ Unit Tests (45 test suites)
npm.cmd test -- --run

# Kiểm tra build TypeScript production
npm.cmd run build
```

### 3.3. Các phím tắt tiện ích trong game
- **`WASD` / Mũi tên**: Di chuyển nhân vật.
- **`E`**: Tương tác với bạn bè / đồ vật / cửa phòng.
- **`J`**: Mở sổ tay / album kỷ niệm.
- **`C`**: Chụp ảnh kỷ niệm (Selfie).
- **`Esc`**: Đóng các panel đang mở hoặc mở Menu cài đặt.
- **Click vào bản đồ tròn**: Mở bản đồ định vị trường học toàn màn hình.

---

## 4. GỢI Ý CÔNG VIỆC TIẾP THEO CHO NGÀY MAI
1. **Nội dung chương tiếp theo (Trang 5-7):** Thêm dữ liệu câu chuyện, vật phẩm kỷ niệm và câu đố cho các trang sau của album.
2. **Audio/SFX:** Thêm âm thanh lật trang sách loạt soạt, tiếng leng keng khi mua đồ thành công trong shop và âm thanh đặt đồ trang trí trong phòng.
3. **Thêm phụ kiện 3D:** Có thể thiết kế thêm các mẫu balo mới hoặc huy hiệu đeo ngực cho nhân vật chibi.

---
*Bàn giao hoàn tất bởi AI Assistant. Mã nguồn đã được đồng bộ lên git remote.*
