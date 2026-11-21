# SESSION_HANDOFF
Phiên bản v8 · Cập nhật 20/11/2026, 23:xx (UTC+7) · Bộ ngữ cảnh v1.0.

## Mục tiêu hiện tại
Dựng bản public (Mốc 1 + Mốc 2, 9 Trang) theo bộ GDD **APPROVED v1.0** `claude/gdd/00`–`03`, kịp hạn chuẩn bị 04/12.

## Quyết định mới đã duyệt (20/11)
- Bộ GDD 4 file APPROVED v1.0 là GDD hiện hành duy nhất; `GDD.md` v0.3 và `GDD_MASTER_v1_DRAFT` SUPERSEDED.
- 9 Trang, bỏ "6 chương". Phòng 2026 tươi sáng từ đầu. Căn cứ trong trường. Không dựng căn-tin (dùng Z03). Hội trại ở sân trường tháng 3/2018. Nhân vật model 3D có xương, 1,3–1,5 m.
- Minigame chơi thật, thua không chặn truyện: caro Trang 5 (AI Đức dễ / Quân khó, 12×12), Sudoku Trang 7 cảnh A (đồng hồ Châu 6 phút), lật chai ở Z03, đua thuyền (Quân luôn nhất), Khu Vui Chơi Căn cứ (Ô ăn quan, Lò cò, Bi ve; chọn bạn = chọn độ khó).
- Tỉ số caro theo loạt ván từ 3–3; nắp hộp phấn và tin nhắn cuối lấy động.
- Lần trêu thứ ba Trang 6 ở ghế đá. Giữ luật mặc định các trò, có màn hướng dẫn trong game.
- Lưu trên máy (localStorage + IndexedDB, ảnh dạng Blob JPEG); Firebase chỉ số liệu ẩn danh + form.
- Năm học lớp 6 = 2014–2015; chủ dự án tự sửa ô hướng dẫn Project.

## Trạng thái từng việc
- Tài liệu: 4 file `claude/gdd/` APPROVED v1.0, đã lưu Project và gửi chủ dự án để chép vào `docs/gdd/`. `00_README` lên v1.0.
- Code: chưa có minigame nào. Theo kiểm repo 20/11: chưa có nội dung thật; Mốc 2 chưa có bản đồ lớp 8–9; nhân vật nhánh asset cao 0,70 m; cây quá nặng; form phản hồi mới là chỗ giữ chỗ; chưa thử Firestore thật.

## Đã kiểm tra / chưa kiểm tra
- Đã: đối chiếu chéo 4 file (mã Trang, tỉ số caro, vị trí Sudoku, căn-tin, ghế đá).
- Chưa: mọi thông số minigame chưa chơi thử; ngân sách tam giác chưa đo trên máy thật; không đọc được bản kịch bản v1.4 đầy đủ (không có trong Project/GitHub, quyền thư mục máy bị chặn).

## File cần đọc cho tác vụ kế tiếp
`claude/gdd/02` §1, §6 (khung minigame, thứ tự làm) → `claude/gdd/03` §1 (quy chuẩn asset) → `claude/gdd/01` (Trang đang làm) → `07_ANALYTICS_REQUIREMENTS` (thêm event mới ở `02` §5).

## Điểm chưa rõ
- Danh sách nâng/gộp/lùi từng Side; nhân lực thật (D-10).
- Ảnh chính Trang 3 và Trang 6; "bạn thư viện" có xuất hiện lại không; tên tạm "Tú".
- Ngoại hình cô Diệp, bác bảo vệ, chú chủ tiệm; hình 3 kiểu cổng trại; nhạc nền có giấy phép.
- Kịch bản v1.4 cần được đưa vào Project hoặc `docs/gdd/script/`.

## Một bước tiếp theo
Trong Project Dev: dựng khung minigame chung + lưu + event đo (`02` §1, §4, §5), rồi caro.
