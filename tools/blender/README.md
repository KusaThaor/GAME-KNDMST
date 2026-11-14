# Blender AI Bridge — Kết nối Antigravity với Blender

Cầu nối trực tiếp giữa Trợ lý AI (Antigravity) và **Blender 4.x/5.x**.

---

## 1. Cấu trúc thư mục

- `blender_bridge.py`: Script khởi chạy trong Blender để mở cổng TCP Socket (`127.0.0.1:9876`) và bộ theo dõi file tự động (`bpy.app.timers`).
- `live_asset.py`: Mã nguồn Python thủ tục sinh mô hình **Bộ bàn ghế học sinh THCS Việt Nam** trực tiếp trong Blender.
- `send_to_blender.py`: Tiện ích dòng lệnh để AI hoặc bạn gửi mã Python vào Blender từ terminal.

---

## 2. Hướng dẫn kết nối trong 1 phút

1. Mở phần mềm **Blender** (hiện tại Blender đang chạy trên máy của bạn).
2. Chuyển sang tab **Scripting** ở thanh menu trên cùng.
3. Trong khung soạn thảo **Text Editor**:
   - Bấm nút **Open** và chọn file:  
     `C:\Users\Admin\Desktop\GAME\GAME-KNDMST\tools\blender\blender_bridge.py`
   - Nhấp vào nút **▶ (Run Script)** hoặc nhấn tổ hợp phím **Alt + P**.
4. Lúc này trong Blender Console sẽ báo:  
   `[AI-Blender Bridge] ĐÃ KHỞI ĐỘNG THÀNH CÔNG! Cổng kết nối (Port): 9876`
5. Đồng thời, mô hình **Bộ bàn ghế học sinh THCS** sẽ lập tức xuất hiện trong Viewport 3D của Blender!
