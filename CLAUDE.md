# CLAUDE.md — đọc trước khi làm bất cứ việc gì trong repo này

Game 3D trên web **"Hành Trình Thanh Xuân — Những Ngày Mình Còn Nhỏ"** (dự án môn KNĐMST).
Cập nhật 27/11/2026 (mục 1 bảng việc, mục 3.1). Hạn bản playtest: **04/12/2026**. Kỳ đo: **05–15/12**.

## 1. Mở file nào trước
| Thứ tự | File | Để làm gì |
|---|---|---|
| 1 | `docs/handoff/README.md` | Bàn giao ngắn: baseline, trạng thái, việc tiếp theo |
| 2 | `docs/handoff/SPRINT_TASKS_2026-11-26.md` | **Bảng việc hiện hành** (từ 27/11): mỗi task có agent + prompt. `docs/NEXT_SPRINT_TASK_BOARD.md` chỉ còn là lịch sử thẻ N-xx |
| 3 | `docs/handoff/DEMO_AUDIT.md` | Kiểm toán 21/11: ma trận tiến độ, luồng demo, asset, lỗi chặn, chỗ lệch GDD |
| 4 | `docs/gdd/` | **Nguồn chân lý** về thiết kế. Code lệch GDD thì GDD thắng |
| 5 | `WORKSPACE.md` | Bản đồ nhánh Git |

## 2. Nhánh (ảnh chụp 22/11/2026)
| Nhánh | Commit | Vai trò |
|---|---|---|
| `docs/sync-approved-gdd-v1` |  `1ebafb3` | Baseline tài liệu cũ (21/11). **Đã gộp vào nhánh code**; không làm việc trên nhánh này nữa |
| `feat/sprint-0412` | đầu nhánh trên `origin` | **Nhánh làm việc chính**: code + tài liệu hiện hành (`docs/GDD_FULL_REVIEW.md`, `BACKGROUND_AUDIT.md`, `NEXT_SPRINT_TASK_BOARD.md`). Mỗi task mở PR vào đây |
| `feature/asset-workshop` | `51baf28` | Xưởng asset cũ. **Không gộp** cho nhân vật (quyết định D3, 22/11); chỉ để tham khảo |
| `dev` | `4f681cb` | Khung F0–F10, đã nằm trong nhánh code (theo nội dung file) |
| `main` | `4adf991` | Chỉ scaffold. **Không gộp vào `main` khi chủ dự án chưa đồng ý** |

## 3. Quyết định chủ dự án mới nhất (22/11/2026) — đừng làm trái
1. **(27/11) Phạm vi bản đo 05–15/12 = ưu tiên Mốc 1: Hub 2026 + Trang 1→4.** Mốc 2 (Trang 5–9) làm sau bản đo (Giai đoạn 3 trong `docs/handoff/SPRINT_TASKS_2026-11-26.md`). Nhánh phụ (Side/Daily), Khu Vui Chơi, Tầng B: chỉ stub `AI_PROPOSED`, **không** vào production. *(Thay quyết định 22/11 "Mốc 1 + Main Trang 5–9" — SUPERSEDED.)*
2. **Asset (D3): không dùng Blender cho asset mới.** Mọi asset mới dựng bằng **Procedural Three.js** (quy chuẩn ở `docs/NEXT_SPRINT_TASK_BOARD.md` mục 2.0); chỉ dùng lại GLB đã có ở `public/assets/`. Nhân vật giữ bản dựng bằng code qua `CharacterRigAdapter`; **không gộp** `feature/asset-workshop` cho nhân vật. *(Thay hướng base mesh + xương chung 21/11 — SUPERSEDED.)*
3. **Chiều cao nhân vật:** lớp 6–7 **1,30–1,40 m**, lớp 8–9 **1,55–1,65 m**.
4. **Năm học canon:** lớp 6–7 = 2014–2016, lớp 8–9 = 2016–2018, phòng Hub = 2026. ("Mốc 1/Mốc 2" chỉ là tên mốc, không phải năm.)
5. **Nhãn nội dung:** chữ hiện có trong code của 4 Trang Mốc 1 được chủ dự án chấp nhận là bản chính thức — `HUMAN_CANON` nghĩa là "chủ dự án đã duyệt", không còn nghĩa "người viết". Side/Daily do AI nghĩ giữ `AI_PROPOSED` + `[PLACEHOLDER]` và bị tắt ở production.

## 4. Quy tắc bắt buộc
- Không `push --force`, không gộp vào `main`, không checkout làm mất thay đổi cục bộ của người khác. Máy chủ dự án đang ở `feature/asset-workshop`: dùng `git worktree`, không đổi nhánh trong thư mục đó.
- Không tự viết cốt truyện/thoại thật. Nội dung chưa duyệt ghi `[PLACEHOLDER]` + nhãn `AI_PROPOSED`, và **không** khai trong bản `production` của `src/content/release.ts` (validator chặn).
- Điều chưa chốt để trong file cấu hình (`src/config/`, `src/content/cast.ts`, `release.ts`, `chapters.ts`), không viết cứng.
- **Không báo "đạt" cho thứ chưa chạy.** Ghi rõ đã test thật gì, chưa test gì. FPS chỉ đo trên laptop thật.
- Commit nhỏ, thường xuyên. Không dán khóa bí mật vào repo hay chat.
- Trả lời chủ dự án bằng tiếng Việt, ngắn, tách phần báo cáo và phần cần duyệt.

## 5. Lệnh kiểm (đã chạy thật 22/11, đều đạt)
```bash
npm install
npx tsc --noEmit                      # đạt
npm test                              # 266 đạt / 1 bỏ qua
npm run validate:world                # map_thcs: 6 khu, 0 lỗi
VERCEL_ENV=production npm run build    # đạt, bản production sạch công cụ test
npx playwright test --workers=1       # e2e: 37 đạt / 1 bỏ qua (22/11, ~32 phút, chạy tuần tự; song song dễ timeout trên máy yếu)
npm run dev                           # rồi mở /?play=1
```

## 6. Trạng thái một dòng (27/11)
Mốc 1 (Phòng 2026 → Trang 1–4 → Album → `AloNhau` → kết) **chơi xuyên suốt với thoại đã duyệt, minigame thật, Form phản hồi khi Thoát**; Preview `dev` chạy, ghi Firestore thật được. **Còn lại trước 05/12:** R-D6, chơi tay QA-1 + FPS laptop thật, lên Production khi chủ dự án duyệt. Chi tiết: `docs/handoff/SPRINT_TASKS_2026-11-26.md`.

## 7. Số hóa kịch bản (Antigravity/Gemini)
Hướng dẫn + prompt: `docs/handoff/gemini/` (`00_BAT_DAU_ANTIGRAVITY.md` cho chủ dự án, `GEMINI_RULES.md`, `PROMPT_T06_SO_HOA.md`, `QUESTIONS_LOG.md`). Gemini làm trên nhánh `content/m1-so-hoa`; Claude Code chỉ kiểm bằng máy (`tsc`, `npm test`) rồi mới gộp vào `feat/sprint-0412`.
