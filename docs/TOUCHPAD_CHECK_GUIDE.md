# Kiểm điều khiển camera bằng touchpad laptop (Windows + Cốc Cốc)

Dùng sau bản sửa "HOTFIX touchpad" (16/11/2026). Mất khoảng 10 phút. Không cần chuột rời.

## Mở game ở chế độ chẩn đoán
Mở link bản thử của nhánh `feature/s2-world-camera-blender`, thêm `?play=1&inputdebug=1` vào cuối link.
Góc dưới trái sẽ có bảng đen **"CHẨN ĐOÁN CHUỘT/TOUCHPAD"**. Bảng này chỉ có ở bản thử, không có ở bản chính thức.

Nếu chưa vào Ngày ký ức: đi theo luồng game (phòng 2026 → Hộp Kỷ Vật → Ngày) cho tới khi điều khiển được nhân vật.

## 1. Kiểm kiểu camera đang dùng
Nhìn nút góc trên bên phải: phải ghi **"Camera Chuẩn"**.
- Nếu ghi "Camera A" hoặc "Camera B": bấm **V** tới khi thành "Camera Chuẩn".
  (Ai từng chơi bản trước 16/11 trên cùng trình duyệt thì có thể vẫn còn lưu kiểu A. Ở kiểu A chỉ **chuột phải** mới xoay được — đây là nghi vấn số 1 cho lỗi lần trước.)

## 2. Kéo để xoay (kiểu Chuẩn)
Lần đầu **đừng giữ phím WASD** (Windows có thể chặn touchpad khi đang gõ phím).
1. Đưa con trỏ vào vùng trống của màn hình (không đặt lên nút, không đặt lên bảng chẩn đoán).
2. **Nhấn hẳn mặt touchpad xuống và giữ**, rồi kéo ngón tay (hoặc giữ một ngón, kéo bằng ngón kia). Camera phải xoay theo.
3. Thử thêm cách "chạm 2 lần rồi giữ và kéo" nếu máy có bật.
4. Thả ra: camera đứng yên ở góc mới, không giật về chỗ cũ.
5. Bấm nhanh một cái (không kéo): camera không xoay.
6. Giờ mới thử vừa giữ **W** vừa kéo.

**Nếu không xoay:** bấm **"Sao chép"** trên bảng chẩn đoán rồi dán toàn bộ vào chat cho nhóm phát triển. Nhớ ghi rõ bạn đã kéo kiểu nào (nhấn mặt touchpad, hay chạm 2 lần rồi kéo).

## 3. Nhìn tự do (không cần nhấn giữ)
1. Bấm **L** (hoặc Menu → "Nhìn tự do bằng touchpad: TẮT" để bật). Dòng hướng dẫn dưới màn hình đổi thành "Bấm vào màn hình để nhìn tự do".
2. Bấm vào màn hình **một lần**. Con trỏ biến mất.
3. Lướt một ngón trên touchpad, **không nhấn**: camera xoay. Giữ **W** cùng lúc: nhân vật vừa đi vừa xoay được.
4. Bấm **Esc**: con trỏ hiện lại, Menu mở. Bấm "Chơi tiếp".
5. Bấm W/A/S/D: con trỏ **không** tự bị khóa lại. Bấm vào màn hình thì mới khóa lại.
6. Đứng gần bạn và bấm **E** để nói chuyện: con trỏ được thả ra trong lúc có thoại.
7. Nếu hiện dòng "Trình duyệt không cho khóa chuột…": ghi lại; khi đó vẫn kéo để xoay như mục 2.
8. Tắt lại bằng **L** hoặc trong Menu.

## 4. Các thứ cũ phải còn chạy
- [ ] Cuộn 2 ngón trên touchpad: camera lại gần / ra xa (không phóng to cả trang).
- [ ] WASD đi, Shift chạy, E tương tác, J mở Sổ tay.
- [ ] V đổi vòng Chuẩn → A → B → Chuẩn.
- [ ] Tải lại trang: vẫn giữ kiểu camera và trạng thái "Nhìn tự do".

## Gửi lại cho nhóm phát triển
- Tên máy, Windows 10 hay 11, phiên bản Cốc Cốc.
- Mục nào đạt, mục nào không.
- Nội dung "Sao chép" từ bảng chẩn đoán (nhất là khi mục 2 không đạt).

## Nếu vẫn không kéo được
Mở Cài đặt Windows → Bluetooth & thiết bị → Bàn di chuột (Touchpad) → Chạm (Taps):
- Bật "Chạm hai lần rồi kéo để chọn nhiều" (Tap twice and drag to multi-select).
- Độ nhạy bàn di chuột: thử "Nhạy nhất" (Most sensitive) nếu vừa giữ phím vừa kéo không được.

Ghi lại thiết lập đã đổi khi báo kết quả.
