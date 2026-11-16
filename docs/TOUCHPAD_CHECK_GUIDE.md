# Kiểm điều khiển camera bằng touchpad laptop (Windows + Cốc Cốc)

Dùng sau bản sửa "HOTFIX touchpad" (16/11/2026). Mất khoảng 10 phút. Không cần chuột rời.

## Mở game ở chế độ chẩn đoán
Mở link bản thử của nhánh `feature/s2-world-camera-blender`, thêm `?play=1&inputdebug=1` vào cuối link.
Góc dưới trái sẽ có bảng đen **"CHẨN ĐOÁN CHUỘT/TOUCHPAD"**. Bảng này chỉ có ở bản thử, không có ở bản chính thức.

Nếu chưa vào Ngày ký ức: đi theo luồng game (phòng 2026 → Hộp Kỷ Vật → Ngày) cho tới khi điều khiển được nhân vật.

## 1. Camera luôn là "Chuẩn"
Từ 16/11 không còn nút đổi camera; phím V và L không làm gì. Bản lưu cũ đang ở kiểu A cũng tự về "Chuẩn".
Bảng chẩn đoán phải ghi `kiểu=standard (free)`.

## 2. Kéo để xoay (kiểu Chuẩn)
Lần đầu **đừng giữ phím WASD** (Windows có thể chặn touchpad khi đang gõ phím).
1. Đưa con trỏ vào vùng trống của màn hình (không đặt lên nút, không đặt lên bảng chẩn đoán).
2. **Nhấn hẳn mặt touchpad xuống và giữ**, rồi kéo ngón tay (hoặc giữ một ngón, kéo bằng ngón kia). Camera phải xoay theo.
3. Thử thêm cách "chạm 2 lần rồi giữ và kéo" nếu máy có bật.
4. Thả ra: camera đứng yên ở góc mới, không giật về chỗ cũ.
5. Bấm nhanh một cái (không kéo): camera không xoay.
6. Giờ mới thử vừa giữ **W** vừa kéo.

**Nếu không xoay:** bấm **"Sao chép"** trên bảng chẩn đoán rồi dán toàn bộ vào chat cho nhóm phát triển. Nhớ ghi rõ bạn đã kéo kiểu nào (nhấn mặt touchpad, hay chạm 2 lần rồi kéo).

## 3. Nhìn tự do — đang TẮT
Chủ dự án chốt 16/11 không có đổi camera nên tạm tắt. Bật lại khi cần trong `CAMERA_OPTIONS` (`src/config/camera.ts`).

## 4. Các thứ cũ phải còn chạy
- [ ] Cuộn 2 ngón trên touchpad: camera lại gần / ra xa (không phóng to cả trang).
- [ ] WASD đi, Shift chạy, E tương tác, J mở Sổ tay.
- [ ] Không có nút đổi camera; bấm V không đổi gì.

## Gửi lại cho nhóm phát triển
- Tên máy, Windows 10 hay 11, phiên bản Cốc Cốc.
- Mục nào đạt, mục nào không.
- Nội dung "Sao chép" từ bảng chẩn đoán (nhất là khi mục 2 không đạt).

## Nếu vẫn không kéo được
Mở Cài đặt Windows → Bluetooth & thiết bị → Bàn di chuột (Touchpad) → Chạm (Taps):
- Bật "Chạm hai lần rồi kéo để chọn nhiều" (Tap twice and drag to multi-select).
- Độ nhạy bàn di chuột: thử "Nhạy nhất" (Most sensitive) nếu vừa giữ phím vừa kéo không được.

Ghi lại thiết lập đã đổi khi báo kết quả.
