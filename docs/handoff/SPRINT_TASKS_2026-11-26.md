# SPRINT TASKS — sau Audit Đợt 1–3 (26/11/2026)

| Trường | Giá trị |
|---|---|
| Lập | 26/11/2026 (tối), sau `AUDIT_DOT1-3_VA_KE_HOACH_DEPLOY_2026-11-26.md` (Project Claude) |
| Nhánh gốc | `feat/sprint-0412` |
| Chủ dự án đã duyệt (26/11) | (1) gộp bản vá audit · (2) Trang 2 chỉ chọn điều ước một lần · (3) dọn nhánh cũ · (4) đưa bản này lên `dev` (Preview). **Chưa** duyệt lên `main`. |
| Phạm vi bản đo 05–15/12 | **Mốc 1 (Hub 2026 + Trang 1–4)** theo phiếu 26/11 (Mốc 2 = Giai đoạn 3). ⚠ Khác quyết định A1 ngày 22/11 trong `CLAUDE.md` / `NEXT_SPRINT_TASK_BOARD.md` ("Mốc 1 + Main Trang 5–9"). **Chờ chủ dự án xác nhận** rồi sửa `CLAUDE.md` §3 mục 1. |
| Thay thế | Mục 1 của `docs/NEXT_SPRINT_TASK_BOARD.md` cho giai đoạn tới 05/12. Thẻ N-xx cũ giữ làm lịch sử / tham chiếu. |

**Cách dùng:** nhận một mã → đọc thẻ ở Mục 2 → copy khối "Prompt" cho AI agent. Mỗi thẻ chỉ sửa file trong cột "File". Mọi thẻ code phải qua **5 lệnh Gatekeeper** (Mục 3) trước khi mở PR vào `feat/sprint-0412`.

---

## Mục 0 — Đã làm trong phiên 26/11

| Việc | Kết quả | Commit / nhánh |
|---|---|---|
| A1 Trang 4: câu "Có mười giây thôi…" phát lúc bấm hẹn giờ (trước đây phát sau khi chụp, chặn màn xem ảnh) | Xong | `task/R-D-audit-fix` |
| A2 Trang 1: trả câu Châu sau lần chụp 1 (rơi khi R-B3 chuyển cấu hình) | Xong | `task/R-D-audit-fix` |
| A3 Cập nhật 4 spec E2E theo thoại R-D | Xong | `task/R-D-audit-fix` |
| R-D5 Trang 2 chỉ chọn điều ước một lần, trong trò gấp thuyền; vẫn đo `choice_made c_m1_02_wish` | Xong | `task/R-D5-dieu-uoc-mot-lan` |
| GIT-1 Dọn 15 nhánh cũ | **Một phần**: đã tạo nhánh lưu trữ `archive/nhanh-cu-2026-11-26` (giữ đầu cả 15 nhánh). **Xóa nhánh bị proxy của phiên chặn** → chủ dự án chạy lệnh ở thẻ GIT-1 | — |
| DEP-1 Đưa lên `dev` | Xem `DEV_SESSION_HANDOFF.md` | `dev` |

---

## Mục 1 — Bảng tổng hợp

### Giai đoạn 1 — Trước bản đo 05/12 (TASK-08 & Polish)
| Mã | Việc | Nhánh | Ưu tiên | Hạn | Người/agent | Tiêu chí nghiệm thu (rút gọn) |
|---|---|---|---|---|---|---|
| GIT-1 | Xóa 15 nhánh cũ trên origin | — | P1 | 27/11 | Chủ dự án (máy mình) | `git ls-remote --heads origin` không còn 15 nhánh ở thẻ |
| DEP-1 | Preview trên `dev`: env, smoke test | `dev` | **P0** | 27/11 | Chủ dự án + Claude | Checklist Mục 4-B đủ tích |
| R-D6 | Thoại TRƯỚC khi chụp cho bước ảnh + sửa Trang 2 cảnh 4 | `task/R-D6-thoai-truoc-chup` | P1 | 28/11 | Claude (Sonnet) | Hạ hỏi → Đức "Có nè!…" → khung ngắm; Trang 1 câu Châu vẫn sau lần 1 |
| UX-1 | Dòng nhắc "Đừng ghi tên/SĐT" ở ô góp ý | `task/UX-1-nhac-form` | P2 | 28/11 | Claude (Sonnet) | Hiện dưới ô góp ý; 4 câu hỏi không đổi |
| QA-1 | Chơi tay trọn Mốc 1 trên laptop thật + đo FPS | — | **P0** | 29/11–01/12 | Cả nhóm | Biên bản QA-1 (mẫu ở thẻ); lỗi mở thành thẻ `BUG-xx` |
| BUG-xx | Sửa lỗi phát hiện ở QA-1 | `task/BUG-xx-<ten>` | P0/P1 | 02/12 | Claude | Mỗi lỗi có test tái hiện |
| DEP-2 | Production: `dev` → `main` + nhật ký phát hành | PR → `main` | **P0 (cần duyệt)** | 03–04/12 | Chủ dự án | Checklist Mục 4-C đạt; dòng nhật ký có SHA |

### Giai đoạn 2 — Sau bản đo 05/12 (Nhóm B)
| Mã | Việc | Nhánh | Ưu tiên | Tiêu chí nghiệm thu |
|---|---|---|---|---|
| N-12 | Nhân vật phụ procedural: cô giáo, bác bảo vệ, chú tạp hóa, học sinh nền | `task/N-12-nhan-vat-phu` | P1 | Có ở sân/lớp/tiệm; không chặn đường; FPS tụt ≤ 10% |
| N-18 | Đo lường bổ sung: phát `free_photo_taken`, rà mọi event | `task/N-18-do-luong` | P1 | Mọi tên trong `EVENT_NAMES` có nơi phát hoặc ghi lý do; test bridge |
| SFX-1 | Âm thanh đời thường (vở rơi, trống, "tách", mưa) | `task/SFX-1-am-thanh` | P2 | Thay dòng "Tùng… tùng…" tạm; có nút tắt tiếng |
| ANIM-1 | Hoạt ảnh nâng cao (ngồi, cúi vớt thuyền, treo biển, chữ hiện từng nét trên buồm) | `task/ANIM-1-hoat-anh` | P2 | Đúng cảnh TONG_DUYET; không đổi luồng quest |
| SQ-1 | Nhiệm vụ phụ Mốc 1 chính thức (`q_m1_ai_side_*`, `q_m1_ai_daily_01`) | `task/SQ-1-side-quest-m1` | P2 | Thoại được duyệt, `HUMAN_CANON`, bật ở production, 0 `[PLACEHOLDER]` |
| PERF-1 | Chia nhỏ chunk game / tải trước | `task/PERF-1-chia-chunk` | P3 | Không còn cảnh báo > 900 KB; thời gian vào phòng không tăng |
| AN-1 | Xuất số liệu kỳ đo (CSV) tách `environment` | `task/AN-1-xuat-so-lieu` | P1 | CSV chỉ `production`; không có tên/email/IP |

### Giai đoạn 3 — Mốc 2 (Trang 5–9, lớp 8–9)
| Mã | Việc | Nhánh | Ưu tiên | Tiêu chí nghiệm thu |
|---|---|---|---|---|
| M2-0 | Chốt kịch bản Trang 5–9 (Project thiết kế) | — | P0 cho Mốc 2 | Tài liệu CONFIRMED như TONG_DUYET Mốc 1 |
| M2-1 | Nối Hub Mốc 2: `HUB_QUESTS_M2`, `PDES_M2`, `ART_M2_01` | `task/M2-1-hub` | P1 | Pack test có Mốc 2; validator 0 lỗi; Mốc 1 không đổi |
| M2-2 | Số hóa Trang 5–9 (`d_g08_01`…`d_g09_03`) — làm lại trên nền mới (tham khảo `task/N-15a`, `N-15c`, không gộp thẳng) | `task/M2-2-so-hoa-trang<N>` | P1 | Mỗi Trang một file; E2E chơi qua |
| M2-3 | Minigame Mốc 2 (Caro, Sudoku, Ném bóng, Săn góc ảnh, Trang trí Căn cứ) | `task/M2-3-<mg>` | P2 | Khung chung, có Bỏ qua, unit test |
| M2-4 | Biến thể bản đồ lớp 8–9 (procedural, D3) | `task/M2-4-ban-do` | P2 | Dùng lại map THCS, đổi trang trí theo năm |
| M2-5 | Album + kết Mốc 2 + timeskip | `task/M2-5-album-ket` | P2 | Album có trang Mốc 2; lưu/tải đúng |

---

## Mục 2 — Thẻ giao việc chi tiết (Giai đoạn 1)

### GIT-1 · Xóa 15 nhánh cũ (chủ dự án chạy trên máy mình)
- **Vì sao chủ dự án chạy:** proxy của phiên Claude cho push nhánh nhưng chặn xóa nhánh và tạo tag.
- **Đã an toàn:** nhánh `archive/nhanh-cu-2026-11-26` trỏ tới một commit có 15 cha = đầu của 15 nhánh → lịch sử không mất. Trong thông điệp commit có bảng tên nhánh ↔ SHA.
- **Lệnh (Git Bash / PowerShell, ở thư mục repo):**
```bash
git push origin --delete task/R-A1-thoai-trang1 task/R-A1-v1.1-hub task/R-A2-trang2-outline task/R-A2-v1.1-hub task/R-A3-thoai-trang3 task/R-A3-v1.1-hub task/R-A4-thoai-trang4 task/R-A4-v1.1-hub content/R-A2-trang2-hoan-thien feat/t02-a01-a02 feat/t04-savestate-v3 content/m1-buoc-choi docs/sync-approved-gdd-v1 docs/tong-duyet-moc1-4-trang wip/asset-workshop-backup
```
- **Khôi phục một nhánh (nếu cần):** `git push origin <sha>:refs/heads/<tên-nhánh>` (SHA trong commit `archive/nhanh-cu-2026-11-26`).
- **Đợt sau (chưa duyệt):** ~30 nhánh `task/N-*`, `task/R-B*`, `task/RF-*`, `task/R-D*` đã gộp hết vào `feat/sprint-0412` → có thể xóa cùng cách.

### DEP-1 · Preview trên `dev`
- **Mục tiêu:** link Preview Vercel chạy đúng bản `feat/sprint-0412` mới nhất.
- **Việc:** (1) Vercel → Settings → Environment Variables: `FIREBASE_SERVICE_ACCOUNT` (base64) bật cho Preview + Production; (2) kiểm Firestore rules; (3) chạy checklist Mục 4-B trên link Preview của nhánh `dev`.
- **Nghiệm thu:** Mục 4-B đủ tích, ghi link Preview vào `docs/DEV_SESSION_HANDOFF.md`.

### R-D6 · Thoại trước khi chụp cho bước ảnh
- **Vấn đề:** `types.ts` mô tả `first_line` là "câu mở đầu trước lần bấm đầu tiên", nhưng `photoRunner` phát nó **sau** lần chụp 1 (hành vi N-14 cho câu Châu Trang 1). Trang 2 cảnh 4 cần thoại **trước** khi chụp: Hạ "Chụp lại năm chiếc trước khi thả được hông?" → Đức "Có nè! Máy của mày đó, chụp lẹ đi!".
- **File:** `src/content/types.ts`, `src/game/runtime/photoRunner.ts`, `src/content/validate.ts`, `src/content/days/d_g06_01.ts`, `src/content/days/d_g07_01.ts`, `tests/unit/photoRunnerProps.test.ts`, `tests/e2e/*.spec.ts` (nếu cần).
- **Yêu cầu:** thêm `intro_lines?: DialogueLine[]` cho bước `photo` (phát trước khi hiện khung ngắm, giống minigame); đổi tên `first_line` → `after_first_shot_line` (hoặc giữ tên nhưng sửa chú thích cho đúng hành vi) — chọn một, ghi trong PR; Trang 2 s07: bỏ `first_line`, thêm `intro_lines` 2 câu theo TONG_DUYET (chữ đã CONFIRMED).
- **Nghiệm thu:** unit test thứ tự thoại; 5 lệnh Gatekeeper đạt.
- **Prompt:** "Đọc `CLAUDE.md`, thẻ R-D6 trong `docs/handoff/SPRINT_TASKS_2026-11-26.md` và TONG_DUYET Trang 2 Cảnh 4. Làm trên nhánh `task/R-D6-thoai-truoc-chup` từ `feat/sprint-0412`. Chỉ sửa file trong thẻ. Viết test đỏ trước. Chạy đủ 5 lệnh Gatekeeper, báo đã chạy gì."

### UX-1 · Nhắc không ghi thông tin cá nhân ở Form
- **File:** `src/ui/game/FeedbackForm.tsx` (+ test UI nếu có). Chữ nhắc để trong `src/config/` (không viết cứng).
- **Nghiệm thu:** dòng nhắc nhỏ dưới ô góp ý; không đổi 4 câu hỏi + giới hạn 300 ký tự.

### QA-1 · Chơi tay trọn Mốc 1 + đo FPS
- **Ai:** ít nhất 2 người, 2 laptop khác nhau (1 máy yếu).
- **Biên bản mẫu** (dán vào `docs/handoff/QA1_<ten>_<ngay>.md`): máy (CPU/GPU/RAM), trình duyệt, link, FPS trung bình phòng 2026 / sân trường / lúc mưa (F9 ở bản test), thời gian tải đến phòng 2026, danh sách lỗi (mô tả, bước tái hiện, ảnh).
- **Kịch bản:** đúng Mục 4-B bước 3–6.

### DEP-2 · Production (cần chủ dự án duyệt)
- Chỉ làm khi Mục 4-B đạt và chủ dự án nói "lên main".
- Ghi `docs/RELEASE_LOG.md`: ngày giờ, SHA, người duyệt, link production, ghi chú.

---

## Mục 3 — 5 lệnh Gatekeeper (bắt buộc trước mọi PR)
```bash
npx tsc --noEmit
npx vitest run --pool=vmThreads          # Windows/Node 24: bắt buộc --pool=vmThreads
npm run validate:world
VERCEL_ENV=production npm run build
npx playwright test --workers=1          # 47 test, ~30 phút; 1 bỏ qua (smoke cần Firestore Emulator)
```

## Mục 4 — Checklist deploy

**A. Trước Preview:** gộp vào `feat/sprint-0412` → 5 lệnh đạt → env `FIREBASE_SERVICE_ACCOUNT` (Preview + Production) → Firestore rules → đưa vào `dev`.

**B. Trên link Preview** (Chrome, cửa sổ ẩn danh, máy thật)
1. `GET /api/health` trả OK.
2. Trang chủ → Chơi → Phòng 2026; DevTools Network không có 404.
3. Chơi: tên + ngoại hình → Hộp Kỷ Vật (bấm 2 đồ nền) → Trang 1 (4 trò, chụp 3 lần, câu Châu sau lần 1) → Trang 2 (gấp thuyền → chọn điều ước **một lần** → ghi; chụp 5 thuyền; đua) → Trang 3 (0/3, dọn trước, trang trí sau, tên khu đổi đúng lúc) → Trang 4 (3 kiểu ảnh, Đức giục lúc bấm hẹn giờ, mưa, cầu vồng ở khúc gỗ) → Album → `AloNhau` → gửi tin.
4. Giữa chừng Esc → Thoát → Form hiện; gửi 1 phản hồi.
5. Firestore: `event_batches` có bản ghi `environment = "test"`; có `choice_made` `c_m1_02_wish`; `feedback` có bản ghi; không có tên người chơi.
6. Tải lại giữa Trang 2 → về đúng chỗ.
7. FPS trên laptop thật.

**C. Production (khi được duyệt):** PR `dev` → `main` → lặp B1, B2, B4, B5 trên domain production (`environment = "production"`, F9/`?lab=` không tác dụng) → theo dõi Firestore Usage ngày đầu → rollback bằng Vercel "Promote" bản trước.
