# CLAUDE.md — đọc trước khi làm bất cứ việc gì trong repo này

Game 3D trên web **"Hành Trình Thanh Xuân — Những Ngày Mình Còn Nhỏ"** (dự án môn KNĐMST).
Cập nhật 21/11/2026 (tối). Hạn bản playtest: **04/12/2026**. Kỳ đo: **05–15/12**.

## 1. Mở file nào trước
| Thứ tự | File | Để làm gì |
|---|---|---|
| 1 | `docs/handoff/README.md` | Bàn giao ngắn: baseline, trạng thái, việc tiếp theo |
| 2 | `docs/handoff/SPRINT_TASKS.md` | Backlog P0/P1/P2 tới 04/12; mỗi task có prompt dùng được ở phiên mới |
| 3 | `docs/handoff/DEMO_AUDIT.md` | Kiểm toán 21/11: ma trận tiến độ, luồng demo, asset, lỗi chặn, chỗ lệch GDD |
| 4 | `docs/gdd/` | **Nguồn chân lý** về thiết kế. Code lệch GDD thì GDD thắng |
| 5 | `WORKSPACE.md` | Bản đồ nhánh Git |

## 2. Nhánh (ảnh chụp 21/11/2026 tối)
| Nhánh | Commit | Vai trò |
|---|---|---|
| `docs/sync-approved-gdd-v1` | `fc963f6` | **Baseline tài liệu**: GDD v1.0 + chốt Trang 6 + 3 quyết định 21/11 tối + audit |
| `feat/sprint-0412` | `09204f5` | **Baseline code**. Việc đầu tiên của phiên code: gộp nhánh tài liệu trên vào đây |
| `feature/asset-workshop` | `51baf28` | Xưởng asset (nhân vật có xương, cây, bàn, bảng). Chưa gộp |
| `dev` | `4f681cb` | Khung F0–F10, đã nằm trong nhánh code (theo nội dung file) |
| `main` | `4adf991` | Chỉ scaffold. **Không gộp vào `main` khi chủ dự án chưa đồng ý** |

## 3. Quyết định chủ dự án mới nhất (21/11/2026 tối) — đừng làm trái
1. **Phạm vi bản đo 05–15/12 = trọn Mốc 1: Trang 1 → Trang 4.** Kết demo đặt ngay sau Trang 4 "Đủ năm đứa"; tin nhắn cuối đổi nghĩa thành "nhớ hồi tụi mình mới đủ năm đứa". **Mốc 2 (Trang 5–9, gồm Trang 6 Valentine, Caro, Sudoku) giữ nguyên thiết kế nhưng lùi sau 15/12.**
2. **Hướng asset nhân vật:** dùng **base mesh + bộ xương chung** đã có ở `feature/asset-workshop` (20 xương, 16 hoạt ảnh), phụ kiện và biến thể gắn bằng code/preset. Không sửa tay từng `.glb`.
3. **Chiều cao nhân vật:** lớp 6–7 **1,30–1,40 m**, lớp 8–9 **1,55–1,65 m** (dải cũ 1,40–1,50 m đã SUPERSEDED).

## 4. Quy tắc bắt buộc
- Không `push --force`, không gộp vào `main`, không checkout làm mất thay đổi cục bộ của người khác. Máy chủ dự án đang ở `feature/asset-workshop`: dùng `git worktree`, không đổi nhánh trong thư mục đó.
- Không tự viết cốt truyện/thoại thật. Nội dung chưa duyệt ghi `[PLACEHOLDER]` + nhãn `AI_PROPOSED`, và **không** khai trong bản `production` của `src/content/release.ts` (validator chặn).
- Điều chưa chốt để trong file cấu hình (`src/config/`, `src/content/cast.ts`, `release.ts`, `chapters.ts`), không viết cứng.
- **Không báo "đạt" cho thứ chưa chạy.** Ghi rõ đã test thật gì, chưa test gì. FPS chỉ đo trên laptop thật.
- Commit nhỏ, thường xuyên. Không dán khóa bí mật vào repo hay chat.
- Trả lời chủ dự án bằng tiếng Việt, ngắn, tách phần báo cáo và phần cần duyệt.

## 5. Lệnh kiểm (đã chạy thật 21/11, đều đạt trừ e2e)
```bash
npm install
npx tsc --noEmit                      # đạt
npm test                              # 266 đạt / 1 bỏ qua
npm run validate:world                # map_thcs: 6 khu, 0 lỗi
VERCEL_ENV=production npm run build    # đạt, bản production sạch công cụ test
npm run test:e2e                      # CHƯA chạy được trên máy ảo (không tải được trình duyệt Playwright) — phải chạy trên máy thật
npm run dev                           # rồi mở /?play=1
```

## 6. Trạng thái một dòng
Khung chơi (phòng 2026 → kỷ vật → Ngày ký ức → ảnh → Album → điện thoại → kết demo) **chạy xuyên suốt với nội dung giả**; bản đồ 6 khu, camera và điều khiển xong; **nội dung thật và minigame thật là phần còn thiếu lớn nhất**. Chi tiết: `docs/handoff/DEMO_AUDIT.md`.
