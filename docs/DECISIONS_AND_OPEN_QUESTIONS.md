# DECISIONS_AND_OPEN_QUESTIONS — S2 (bản đồ, điều khiển, camera)

Lập 16/11/2026 (phiên 2c), từ §2.3 blueprint. Mục đích: ai đọc cũng biết **số nào lấy từ GDD, số nào là giả định kỹ thuật, nội dung nào là giả, việc nào chờ chủ dự án**.
Sổ quyết định chung của cả dự án vẫn là `OPEN_DECISIONS_REGISTER_v1` (Project thiết kế). File này chỉ nói phần S2.

## 1. Đã chốt
| Mã | Nội dung | Chốt khi nào | Nằm ở đâu |
|---|---|---|---|
| D-S2-01 | Kiểu camera mặc định: **"Chuẩn"** (kiểu Play Together: camera thứ ba, kéo để xoay, zoom, đi theo hướng camera; chơi được bằng chuột, touchpad, điện thoại) | 15/11 tối | `DEFAULT_CAMERA_MODE = 'standard'` (`src/config/camera.ts`) |
| D-S2-01b | **Chỉ dùng camera "Chuẩn", người chơi không đổi kiểu camera.** Code A/B/"Nhìn tự do" giữ lại, tắt bằng cấu hình | 16/11 trưa | `CAMERA_OPTIONS = { allow_mode_switch: false, allow_free_look: false }` |
| D-S2-01c | **Camera linh hoạt như Play Together/PUBG:** góc nghiêng mở thành **5–65°** (GDD ghi 25–40°); nút tròn trên điện thoại "nổi" (chạm đâu ở góc trái dưới cũng đi được) | 16/11 tối | `CAMERA_PITCH_RANGE`; `POINTER_INPUT.joystick.floating`. Số GDD cũ: `CAMERA_PITCH_GDD_V03` |
| D-S2-05 | Blender chuẩn của dự án: **4.5.16 LTS** (5.2.4 vẫn được test, không phải chuẩn) | 15/11 tối | `BLENDER_STANDARD` (`tools/blender/world/pipeline_config.py`), `docs/BLENDER_PIPELINE.md` |

**Lưu ý về D-S2-01c:** đây là chỗ code **khác GDD v0.3 §3** (góc 25–40°) theo quyết định của chủ dự án. Nhóm thiết kế nên cập nhật GDD cho khớp; muốn quay lại thì thay `CAMERA_PITCH_RANGE` bằng số trong `CAMERA_PITCH_GDD_V03`.

## 2. Lấy từ GDD (không tự đổi)
| Nội dung | Nguồn | Nằm ở đâu |
|---|---|---|
| Camera thứ ba trong Ngày ký ức; phòng 2026 góc cố định | GDD v0.3 §3 | `CameraManager`, `hubScene` |
| Cách nhân vật 5,5 m, zoom 3,5–8 m, tự kéo gần khi bị che | GDD v0.3 §3 | `CAMERA_PRESETS.follow_default` |
| Phím `C` để dành cho máy ảnh cầm tay/cuộn phim | GDD v0.3 §3 | `CONTROLS.film_camera` (chưa làm, không gán việc khác) |
| Sáu khu của `map_thcs`, một bản đồ liền không màn tải | GDD v0.3 §4 | `src/world/maps/map_thcs.world.json` |
| Đơn vị chơi là Ngày ký ức; nội dung tham chiếu bằng ID | GDD + Implementation Handoff | `src/content/days/*.ts` |

## 3. Giả định kỹ thuật (đội dev tự đặt, chỉnh được bằng số)
| Nội dung | Giá trị đang dùng | Nằm ở đâu |
|---|---|---|
| Kéo bao xa mới tính là xoay | chuột 6 px, cảm ứng 10 px | `POINTER_INPUT.drag_threshold_px` |
| Độ nhạy xoay | ngang 0,0045, dọc 0,003 rad/px; cảm ứng ×1,4 | `LOOK_SENSITIVITY`, `touch_look_scale` |
| Zoom bằng lăn/touchpad/chụm | 100 px = 1 nấc; chụm touchpad 12 px; chụm cảm ứng 40 px; 1 nấc = 0,5 m | `POINTER_INPUT`, `LOOK_SENSITIVITY.zoom_step` |
| Touchpad vuốt 2 ngón ngang = xoay | bật; đổi dấu `px_scale` nếu máy thật xoay ngược | `POINTER_INPUT.wheel_look` |
| Nút tròn | bán kính 56 px, vùng chết 18%, chạy khi ≥ 85%; vùng chạm "nổi" = min(45% rộng, 340 px) × min(60% cao, 360 px) | `POINTER_INPUT.joystick` |
| Preset trong nhà | 4,2 m (2,6–6 m), góc mặc định 38°, fov 55 | `CAMERA_PRESETS.follow_indoor` |
| Độ nét màn hình tối đa | ≤ 2 (điện thoại) | renderer |
| Va chạm | hộp/tròn trên mặt bằng, không physics engine | `src/world/collision.ts` |

## 4. Nội dung giả ([PLACEHOLDER])
- Thoại, lựa chọn, tên bước trong `src/content/days/*.ts` đều có tiền tố `[PLACEHOLDER]`.
- Hình khối 6 khu là **blockout tạm** (hộp màu), không phải art cuối.
- Vị trí NPC, điểm tương tác, điểm đặt máy ảnh là đặt tạm để chơi thử.

## 5. Chờ chủ dự án chốt
| Mã | Câu hỏi | Đang tạm dùng | Ảnh hưởng nếu đổi |
|---|---|---|---|
| D-S2-02 | Bố cục 6 khu (vị trí, kích thước, đường nối) | blockout trong `gen_map_thcs.py` + 6 file `.blend` | Sửa `.blend`, xuất lại; vài test e2e ghi tọa độ khu (ca 1, 2, 3, 7, 10) phải sửa số |
| D-S2-03 | Khu nào mở ở Ngày nào | `open_zones` trong từng Ngày (giả) | Chỉ sửa nội dung, không sửa code |
| D-S2-04 | Art style (toon + viền hay mềm) | `toon_outline`; ánh chiều ngả cam | `DEFAULT_ART_STYLE` (`src/render/style.ts`), bảng màu Blender |
| — | Có cần **màn hướng dẫn điều khiển** lần đầu chơi không, câu chữ ai viết | chưa làm; ghi chú ở `docs/CONTROLS_AND_TUTORIAL_NOTES.md` | thêm giao diện, không đổi điều khiển |
| — | Có cần **thanh chỉnh độ nhạy camera** trong Menu (như PUBG) không | chưa làm; chỉnh bằng số trong cấu hình | thêm một mục Menu, lưu cục bộ |
| D-01, D-03, D-04, D-12, D-13, D-19, D-20 | (xem `OPEN_DECISIONS_REGISTER_v1`) | phương án khuyến nghị làm giá trị tạm | không đổi trong S2 |

## 6. Cần thiết bị thật (không thay được bằng mô phỏng)
- Điện thoại thật: iPhone Safari, Android Chrome — dọc và ngang.
- Touchpad laptop thật (Windows + Chrome/Cốc Cốc): kéo một ngón, vuốt 2 ngón ngang/dọc, chụm.
- FPS trên laptop và điện thoại thật (Chrome headless vẽ bằng CPU, không dùng làm số đo).
