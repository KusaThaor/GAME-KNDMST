# Nút điều khiển và câu hướng dẫn — để làm màn hướng dẫn di chuyển sau này

Lập 16/11/2026, theo chốt của chủ dự án: **camera luôn là "Chuẩn", người chơi không đổi kiểu camera**.
Tài liệu này ghi lại mọi nút và câu chữ đang có trong game, để sau làm màn hướng dẫn người chơi. Chưa làm màn hướng dẫn.

Nguồn sự thật trong code:
- phím: `CONTROLS` trong `src/config/camera.ts`;
- ngưỡng kéo/chụm/nút tròn: `POINTER_INPUT`;
- câu chữ trên màn hình: `src/ui/game/GameUi.tsx`, `src/ui/game/TouchControls.tsx`.

## 1. Máy tính: bàn phím + chuột hoặc touchpad

| Việc | Cách làm | Ghi chú |
|---|---|---|
| Đi | `W A S D` hoặc 4 phím mũi tên | Hướng đi theo hướng camera |
| Chạy | giữ `Shift` khi đi | |
| Xoay camera | **bấm giữ chuột trái (hoặc phải) rồi kéo** trên chỗ trống: ngang = quay, dọc = hạ thấp/nâng cao camera | Kéo quá 6 px mới xoay; bấm nhanh vẫn là bấm. Góc nghiêng 5–65° (chốt 16/11 tối) |
| Xoay camera bằng touchpad | **vuốt 2 ngón sang ngang** (không cần nhấn) — tay kia vẫn giữ WASD để đi; hoặc nhấn mặt touchpad xuống, giữ rồi kéo | Thêm 16/11 chiều. Chưa xác nhận trên touchpad thật. Thấy xoay ngược chiều → đổi dấu `wheel_look.px_scale` |
| Lại gần / ra xa | lăn chuột · touchpad: **vuốt 2 ngón lên/xuống** hoặc **chụm 2 ngón** | Giới hạn 3,5–8 m. Mỗi lần vuốt chỉ theo một hướng (ngang = xoay, dọc = phóng) |
| Tương tác (nói chuyện, nhặt, xem) | `E`, hoặc bấm chuột vào người/vật | Khi có gợi ý `[E] …` dưới màn hình |
| Đọc tiếp thoại | `Space` hoặc bấm vào khung thoại | Khung thoại ghi "Space ▸" |
| Chọn câu trả lời | phím số `1`, `2`, `3`… hoặc bấm vào lựa chọn | |
| Tạo dáng khi chụp ảnh hẹn giờ | `Space` hoặc nút "Tạo dáng" | Chạy vào vòng sáng trước |
| Sổ tay | `J` (hoặc `Tab`), nút "Sổ tay" góc trên phải | |
| Menu | `Esc`, nút "Menu" góc trên phải | |
| Phòng 2026 | bấm chuột vào đồ vật | Camera cố định |
| (để dành) Máy ảnh cầm tay / cuộn phim | `C` | Chưa làm, không gán việc khác |

**Dòng hướng dẫn đang hiện dưới màn hình:**
> `WASD` đi · `Shift` chạy · `E` tương tác · Kéo chuột để xoay camera · lăn chuột để phóng · touchpad: vuốt 2 ngón ngang để xoay, dọc để phóng

## 2. Điện thoại / máy tính bảng (cảm ứng; dọc và ngang)

| Việc | Cách làm | Ghi chú |
|---|---|---|
| Đi | **chạm bất kỳ đâu ở góc dưới trái** — nút tròn hiện ngay dưới ngón tay, kéo để đi | Kéo sát mép = chạy (≥ 85% bán kính). Thả tay nút về chỗ cũ. Thêm 16/11 tối ("nút tròn nổi"); tắt bằng `joystick.floating = false` |
| Xoay camera | **kéo một ngón** trên chỗ trống (ngoài góc dưới trái): ngang = quay, dọc = hạ/nâng camera | Làm được cùng lúc với nút tròn (2 ngón khác nhau) |
| Lại gần / ra xa | **chụm 2 ngón** | |
| Tương tác | **nút tròn vàng "E"** góc dưới phải, kèm chữ gợi ý | Chỉ hiện khi đứng gần thứ tương tác được |
| Đọc tiếp thoại | chạm vào khung thoại | Khung ghi "Chạm ▸" |
| Chọn câu trả lời | chạm vào lựa chọn | |
| Tạo dáng | nút "Tạo dáng" | |
| Sổ tay, Menu | nút góc trên phải | Ẩn chữ phím `J`, `Esc` trên cảm ứng |

Nút tròn và nút E chỉ hiện khi người chơi đang dùng cảm ứng (máy chỉ có màn cảm ứng, hoặc vừa chạm vào màn hình).

**Dòng hướng dẫn đang hiện:**
> Kéo nút tròn để đi · Kéo màn hình để xoay · Chụm 2 ngón để phóng

## 3. Gợi ý nội dung màn hướng dẫn sau này (CHƯA LÀM — chờ duyệt)
Đây là ghi chú để thiết kế, không phải nội dung đã chốt. Câu chữ thật do nhóm thiết kế viết.
- Nên hiện theo thiết bị đang dùng (máy tính khác điện thoại). Game đã biết thiết bị qua `UiState.device` (`'keyboard'` | `'touch'`).
- Các ý cần dạy, theo thứ tự: đi → xoay camera → lại gần/ra xa → tương tác (E) → Sổ tay/Menu.
- Riêng touchpad: dạy "vuốt 2 ngón sang ngang để xoay, lên/xuống để phóng" — vừa giữ WASD vừa vuốt được.
- Hiện lại được từ Menu.
- Không gửi thông tin thiết bị hay bước hướng dẫn vào analytics nếu chưa duyệt (không thêm event mới).

## 4. Tính năng đang TẮT (code còn, bật lại được)
Bật trong `CAMERA_OPTIONS` (`src/config/camera.ts`). Bản test có thể bật tạm bằng `?camtest=1`, chỉ để chạy test tự động.

| Tùy chọn | Khi bật thì có | Phím |
|---|---|---|
| `allow_mode_switch` | Nút "Camera Chuẩn/A/B" góc trên phải + nút trong Menu. **A** = giữ chuột phải để xoay; **B** = bấm vào màn hình để khóa chuột, Esc để thả | `V` |
| `allow_free_look` | "Nhìn tự do bằng touchpad" trong Menu: bấm vào màn hình để khóa chuột, rồi lướt touchpad (không nhấn) là xoay; Esc để thả | `L` |

Khi đang tắt: bản lưu cũ có kiểu A/B hoặc đã bật Nhìn tự do đều được đưa về "Chuẩn" và tắt Nhìn tự do khi mở game.
