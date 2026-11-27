# SPRINT TASKS — sau Audit Đợt 1–3 (lập 26/11, cập nhật 27/11/2026)

| Trường | Giá trị |
|---|---|
| Nhánh gốc | `feat/sprint-0412` (đầu nhánh có R-D5 + bản vá audit) · Preview: nhánh `dev` |
| Link Preview | https://kndmst-git-dev-game-kndmst.vercel.app/?play=1 |
| Chủ dự án chốt 27/11 | **Ưu tiên Mốc 1** (Hub 2026 + Trang 1–4) cho bản đo 05–15/12; Mốc 2 = Giai đoạn 3 (đã sửa `CLAUDE.md` §3.1). `FIREBASE_SERVICE_ACCOUNT` đã bật trên Vercel. R-D6 vào sprint. |
| Chưa duyệt | Đưa lên `main` (Production) — chỉ làm khi chủ dự án nói "lên main" |

## Cách dùng (đọc 1 lần)
1. Chọn thẻ theo thứ tự ở **Mục 1** (làm từ trên xuống).
2. Cột **Agent** cho biết ai làm. Mở đúng công cụ đó, **dán nguyên khối "Prompt"** của thẻ.
3. Agent làm xong sẽ push một nhánh `task/...`. Khi đó mở phiên **Integrator** (Mục 3) để kiểm và gộp. Không tự gộp tay.
4. Việc có chữ **"Chủ dự án"** thì anh/chị tự làm theo các bước ghi trong thẻ.

**Các agent:**
| Tên trong bảng | Là gì | Dùng cho |
|---|---|---|
| **Claude Code · Sonnet** | Phiên Claude Code mới, gắn repo `KusaThaor/GAME-KNDMST`, chọn model Sonnet | Việc code nhỏ, phạm vi rõ |
| **Claude Code · Opus** | Như trên, chọn Opus | Việc đụng engine/nhiều file, Integrator |
| **Project thiết kế** | Claude/Gemini ở Project thiết kế (narrative) | Viết/chốt thoại, kịch bản — **không** code |
| **Chủ dự án** | Anh/chị | Duyệt, cài đặt Vercel/GitHub, chơi tay |
| **Cả nhóm** | Các thành viên | Chơi tay QA |

---

## Mục 0 — Đã xong (26–27/11)
| Việc | Kết quả |
|---|---|
| Bản vá audit (Trang 4 "Có mười giây…", câu Châu Trang 1, 4 spec E2E) | Đã gộp `feat/sprint-0412` |
| R-D5 Trang 2 chỉ chọn điều ước một lần | Đã gộp `feat/sprint-0412` |
| Đưa lên `dev` | `dev` @ `14fa8b6`, Vercel build thành công |
| **DEP-1 phần máy kiểm (27/11)** | `/api/health` → `{"ok":true,"environment":"test","server_build":"14fa8b6","firebase":"configured"}` · gửi lô `pipeline_test` → **ghi Firestore thật OK** (`accepted:1`), gửi lại cùng lô → `duplicate:true`, khóa `player_name` bị bỏ, Origin lạ → 403 · trang chủ + `?play=1` tải 0 lỗi, 0 tài nguyên 4xx/5xx, 6 file GLB đều 200 · bấm "Đồng ý" → vào Phòng 2026, game tự gửi `/api/collect` 2 lần đều 200 · bundle có đủ 3 bản sửa. Lô kiểm có `build_version = 20261127-dep1smoke` để lọc bỏ. |
| GIT-1 | Đã có nhánh lưu trữ `archive/nhanh-cu-2026-11-26`; **còn bước xóa** (thẻ GIT-1) |

---

## Mục 1 — Bảng tổng hợp

### Giai đoạn 1 — Trước bản đo 05/12
| # | Mã | Việc | Agent | Nhánh | Ưu tiên | Hạn |
|---|---|---|---|---|---|---|
| 1 | GIT-1 | Xóa 15 nhánh cũ | Chủ dự án | — | P1 | 27/11 |
| 2 | DEP-1b | Chơi tay trên Preview + kiểm Firestore console | Chủ dự án | — | **P0** | 28/11 |
| 3 | R-D6 | Thoại trước khi chụp + sửa Trang 2 cảnh 4 | Claude Code · Sonnet | `task/R-D6-thoai-truoc-chup` | P1 | 28/11 |
| 4 | UX-1 | Nhắc "đừng ghi tên/SĐT" ở ô góp ý | Claude Code · Sonnet | `task/UX-1-nhac-form` | P2 | 28/11 |
| 5 | INT-1 | Kiểm + gộp R-D6, UX-1 → `feat/sprint-0412` → `dev` | Claude Code · Opus (Integrator) | — | P0 | 29/11 |
| 6 | QA-1 | Chơi tay trọn Mốc 1 trên laptop thật + FPS | Cả nhóm | — | **P0** | 29/11–01/12 |
| 7 | BUG-xx | Sửa lỗi QA-1 tìm ra | Claude Code · Sonnet/Opus | `task/BUG-xx-<ten>` | P0/P1 | 02/12 |
| 8 | DEP-2 | Lên Production + nhật ký phát hành | Chủ dự án duyệt → Claude Code · Opus | PR `dev` → `main` | **P0** | 03–04/12 |

### Giai đoạn 2 — Sau bản đo (từ 16/12)
| Mã | Việc | Agent | Nhánh | Ưu tiên |
|---|---|---|---|---|
| AN-1 | Xuất số liệu kỳ đo ra CSV (chỉ `production`) | Claude Code · Sonnet | `task/AN-1-xuat-so-lieu` | P1 |
| N-18 | Đo lường bổ sung (`free_photo_taken`…) | Claude Code · Sonnet | `task/N-18-do-luong` | P1 |
| N-12 | Nhân vật phụ procedural | Claude Code · Opus | `task/N-12-nhan-vat-phu` | P1 |
| SQ-0 → SQ-1 | Viết thoại nhiệm vụ phụ Mốc 1 → đưa vào game | Project thiết kế → Claude Code · Sonnet | `task/SQ-1-side-quest-m1` | P2 |
| SFX-1 | Âm thanh đời thường | Claude Code · Sonnet | `task/SFX-1-am-thanh` | P2 |
| ANIM-1 | Hoạt ảnh nâng cao | Claude Code · Opus | `task/ANIM-1-hoat-anh` | P2 |
| PERF-1 | Chia nhỏ file game | Claude Code · Sonnet | `task/PERF-1-chia-chunk` | P3 |

### Giai đoạn 3 — Mốc 2 (Trang 5–9)
| Mã | Việc | Agent | Nhánh | Ưu tiên |
|---|---|---|---|---|
| M2-0 | Chốt kịch bản Trang 5–9 (bản CONFIRMED) | Project thiết kế + Chủ dự án | — | P0 |
| M2-1 | Nối Hub Mốc 2 (`HUB_QUESTS_M2`, `PDES_M2`, `ART_M2_01`) | Claude Code · Opus | `task/M2-1-hub` | P1 |
| M2-2 | Số hóa từng Trang 5–9 | Claude Code · Sonnet (mỗi Trang 1 phiên) | `task/M2-2-trang<N>` | P1 |
| M2-3 | Minigame Mốc 2 | Claude Code · Sonnet (mỗi trò 1 phiên) | `task/M2-3-<ma-tro>` | P2 |
| M2-4 | Biến thể bản đồ lớp 8–9 | Claude Code · Opus | `task/M2-4-ban-do` | P2 |
| M2-5 | Album + kết Mốc 2 + timeskip | Claude Code · Opus | `task/M2-5-album-ket` | P2 |

---

## Mục 2 — Thẻ chi tiết Giai đoạn 1

### #1 GIT-1 · Xóa 15 nhánh cũ — Chủ dự án
Mở Git Bash ở thư mục repo, chạy:
```bash
git push origin --delete task/R-A1-thoai-trang1 task/R-A1-v1.1-hub task/R-A2-trang2-outline task/R-A2-v1.1-hub task/R-A3-thoai-trang3 task/R-A3-v1.1-hub task/R-A4-thoai-trang4 task/R-A4-v1.1-hub content/R-A2-trang2-hoan-thien feat/t02-a01-a02 feat/t04-savestate-v3 content/m1-buoc-choi docs/sync-approved-gdd-v1 docs/tong-duyet-moc1-4-trang wip/asset-workshop-backup
```
- An toàn: lịch sử cả 15 nhánh nằm trong `archive/nhanh-cu-2026-11-26`. Cần lấy lại một nhánh: `git push origin <sha>:refs/heads/<tên>` (SHA ghi trong commit của nhánh lưu trữ).
- **Xong khi:** trang Branches trên GitHub không còn 15 nhánh trên.

### #2 DEP-1b · Chơi tay trên Preview — Chủ dự án
Máy kiểm đã làm phần tự động (Mục 0). Phần còn lại cần người thật:
1. Mở https://kndmst-git-dev-game-kndmst.vercel.app/?play=1 bằng Chrome, **cửa sổ ẩn danh**, trên laptop.
2. Bấm "Đồng ý" → chơi: Hộp Kỷ Vật (bấm 2 đồ nền) → Trang 1 → Trang 2 → Trang 3 → Trang 4 → Album → điện thoại `AloNhau` → gửi tin.
3. Đối chiếu nhanh: Trang 1 Châu nói "Khoan! Đức, tóc ông dựng…" sau lần chụp 1 · Trang 2 chỉ chọn điều ước **một lần** trong trò gấp thuyền · Trang 3 dọn trước, trang trí sau, tên khu đổi thành "Căn cứ bí mật" · Trang 4 Đức giục "Có mười giây…" **lúc bấm hẹn giờ**.
4. Giữa chừng bấm Esc → Thoát → Form hiện → gửi 1 phản hồi (ghi "TEST" trong ô góp ý).
5. Tải lại trang giữa Trang 2 → phải về đúng chỗ.
6. Firebase console → Firestore: `event_batches` có bản ghi mới `environment = "test"`, thấy `choice_made` với `c_m1_02_wish`; `feedback` có bản "TEST"; **không** thấy tên đã nhập.
- **Xong khi:** đủ 6 bước; lỗi gặp phải ghi vào `docs/handoff/QA1_<ten>_<ngay>.md` (mẫu ở #6).

### #3 R-D6 · Thoại trước khi chụp — Claude Code · Sonnet
- **Vấn đề:** Trang 2 Cảnh 4 (TONG_DUYET dòng 297–298) cần thoại **trước** khung ngắm: Hạ "Chụp lại năm chiếc trước khi thả được hông?" → Đức "Có nè! Máy của mày đó, chụp lẹ đi!". Hiện câu Hạ nằm ở `first_line`, mà `photoRunner` phát `first_line` **sau** lần chụp 1; thiếu câu Đức. Ngoài ra chú thích `first_line` trong `types.ts` ghi "trước lần bấm đầu tiên" — sai so với hành vi thật.
- **Cách làm đã chốt:** thêm `intro_lines?: DialogueLine[]` cho bước `photo` (phát trước khi hiện khung ngắm, như minigame). **Giữ** `first_line` = câu phát sau lần chụp 1 (Trang 1 dùng), chỉ sửa chú thích cho đúng.
- **File được sửa:** `src/content/types.ts`, `src/game/runtime/photoRunner.ts`, `src/content/validate.ts` (thêm `intro_lines` vào danh sách câu của bước photo, dòng ~109), `src/content/days/d_g07_01.ts` (bước `q_m1_main_02.s07`), `tests/unit/photoRunnerProps.test.ts`, `tests/e2e/*.spec.ts` nếu ca nào kẹt vì thoại mới.
- **Prompt:**
```
Bạn là Claude Code làm task R-D6 cho repo KusaThaor/GAME-KNDMST.
1. Đọc CLAUDE.md và thẻ "#3 R-D6" trong docs/handoff/SPRINT_TASKS_2026-11-26.md. Đọc docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md dòng 290–300 (Trang 2 Cảnh 4).
2. Tạo nhánh task/R-D6-thoai-truoc-chup từ origin/feat/sprint-0412. Chỉ sửa các file liệt kê trong thẻ.
3. Viết unit test trước (phải đỏ): bước photo có intro_lines thì các câu đó phát TRƯỚC khi khung ngắm hiện; first_line vẫn phát SAU lần chụp 1.
4. Thêm intro_lines cho bước photo trong types.ts + photoRunner.ts + validate.ts; sửa chú thích first_line cho đúng hành vi "sau lần chụp 1".
5. d_g07_01.ts bước q_m1_main_02.s07: bỏ first_line; thêm intro_lines đúng nguyên văn 2 câu: Hạ (NPC_C) "Chụp lại năm chiếc trước khi thả được hông?" và Đức (NPC_A) "Có nè! Máy của mày đó, chụp lẹ đi!". Không tự viết thêm thoại.
6. Chạy đủ 5 lệnh: npx tsc --noEmit · npx vitest run --pool=vmThreads · npm run validate:world · VERCEL_ENV=production npm run build · npx playwright test --workers=1. Ca E2E nào kẹt vì thoại mới thì thêm bước đọc hết thoại (xem hàm readThrough trong tests/e2e/world.spec.ts).
7. Commit nhỏ, push nhánh. Báo cáo tiếng Việt ngắn: đã sửa gì, kết quả từng lệnh (số đạt/hỏng), chưa test gì. Không gộp vào feat/sprint-0412.
```
- **Xong khi:** unit test thứ tự thoại đạt; 5 lệnh đạt; Trang 1 không đổi hành vi.

### #4 UX-1 · Nhắc không ghi thông tin cá nhân — Claude Code · Sonnet
- **File:** `src/ui/game/FeedbackForm.tsx`, một file chữ trong `src/config/` (vd. `src/config/feedback.ts` nếu đã có, không thì thêm hằng vào file config gần nhất), test UI liên quan nếu có.
- **Prompt:**
```
Bạn là Claude Code làm task UX-1 cho repo KusaThaor/GAME-KNDMST.
1. Đọc CLAUDE.md và thẻ "#4 UX-1" trong docs/handoff/SPRINT_TASKS_2026-11-26.md.
2. Tạo nhánh task/UX-1-nhac-form từ origin/feat/sprint-0412.
3. Thêm một dòng chữ nhỏ dưới ô góp ý của Form phản hồi: "Đừng ghi tên, số điện thoại hay thông tin cá nhân." Chữ để trong src/config/ (không viết cứng trong component).
4. Không đổi 4 câu hỏi, không đổi giới hạn 300 ký tự, không đổi dữ liệu gửi đi.
5. Thêm/sửa test nếu có test cho FeedbackForm. Chạy đủ 5 lệnh (như thẻ #3). Push nhánh, báo cáo tiếng Việt ngắn. Không gộp.
```
- **Xong khi:** dòng nhắc hiện; 5 lệnh đạt.

### #5 INT-1 · Integrator gộp — Claude Code · Opus
- **Prompt:**
```
Bạn là Integrator của repo KusaThaor/GAME-KNDMST (quyền push).
1. Đọc CLAUDE.md và docs/handoff/SPRINT_TASKS_2026-11-26.md (Mục 3 "Quy trình Integrator").
2. Với từng nhánh: task/R-D6-thoai-truoc-chup, task/UX-1-nhac-form (nhánh nào chưa có thì bỏ qua):
   a. Đọc diff so với origin/feat/sprint-0412; kiểm nhánh chỉ sửa file trong thẻ; không có chữ [PLACEHOLDER] mới ở nội dung production; không có khóa bí mật.
   b. Gộp thử (merge --no-ff) vào bản sao feat/sprint-0412 cục bộ, chạy đủ 5 lệnh Gatekeeper.
   c. Đạt hết → push feat/sprint-0412. Hỏng → không gộp, ghi lý do + cách sửa.
3. Sau khi gộp: merge --no-ff feat/sprint-0412 vào dev, push dev. Đợi Vercel build xong rồi gọi https://kndmst-git-dev-game-kndmst.vercel.app/api/health, kiểm server_build = SHA mới.
4. KHÔNG đụng main. Không push --force.
5. Cập nhật docs/DEV_SESSION_HANDOFF.md (mục mới ở đầu, 150–300 từ: đã gộp gì, kết quả từng lệnh, chưa test gì). Báo cáo tiếng Việt, tách "Báo cáo" và "Cần chủ dự án duyệt".
```
- **Xong khi:** `dev` có R-D6 + UX-1, `/api/health` trả SHA mới.

### #6 QA-1 · Chơi tay + đo FPS — Cả nhóm
- Ít nhất 2 người, 2 laptop khác nhau (1 máy yếu). Mỗi người làm đủ 6 bước của thẻ #2, chơi **liền một mạch** Mốc 1.
- FPS: mở link **Preview** (bản test), bấm F9 để hiện đồng hồ FPS; ghi số ở Phòng 2026, sân trường, lúc mưa Trang 4.
- **Mẫu biên bản** — tạo file `docs/handoff/QA1_<ten>_<ngay>.md`:
```
Máy: (CPU / GPU / RAM) · Trình duyệt + phiên bản · Mạng (wifi/4G)
Thời gian từ bấm Chơi tới Phòng 2026: __ giây
FPS: Phòng 2026 __ · Sân trường __ · Mưa Trang 4 __
Tổng thời gian chơi hết Mốc 1: __ phút
Lỗi:
| # | Ở đâu (Trang/cảnh) | Chuyện gì xảy ra | Bước làm lại | Ảnh | Mức (chặn/khó chịu/nhỏ) |
Cảm nhận chung (3 dòng):
```
- **Xong khi:** có ít nhất 2 biên bản; lỗi "chặn" được chuyển thành thẻ BUG.

### #7 BUG-xx · Sửa lỗi QA-1 — Claude Code · Sonnet (lỗi nhỏ) / Opus (lỗi engine)
- **Prompt (thay <...>):**
```
Bạn là Claude Code sửa lỗi BUG-<số> cho repo KusaThaor/GAME-KNDMST.
1. Đọc CLAUDE.md, biên bản docs/handoff/QA1_<ten>_<ngay>.md dòng lỗi #<số>.
2. Tạo nhánh task/BUG-<số>-<ten-ngan> từ origin/feat/sprint-0412.
3. Tái hiện lỗi bằng một test (unit hoặc e2e) trước khi sửa — test phải đỏ.
4. Sửa nhỏ nhất có thể. Không tự viết thoại mới; nếu lỗi do thiếu thoại thì dừng và báo.
5. Chạy đủ 5 lệnh Gatekeeper, push nhánh, báo cáo tiếng Việt ngắn. Không gộp.
```
- Sau đó chạy lại INT-1 để gộp.

### #8 DEP-2 · Production — Chủ dự án duyệt → Claude Code · Opus
- **Điều kiện:** QA-1 không còn lỗi "chặn"; DEP-1b đạt; chủ dự án nhắn "lên main".
- **Prompt:**
```
Bạn là Integrator repo KusaThaor/GAME-KNDMST. Chủ dự án ĐÃ DUYỆT đưa dev lên main hôm nay.
1. Đọc CLAUDE.md, docs/handoff/SPRINT_TASKS_2026-11-26.md thẻ #8 và Mục 4.
2. Chạy đủ 5 lệnh Gatekeeper trên origin/dev. Có lệnh hỏng → dừng, báo.
3. merge --no-ff dev vào main, push main (không --force).
4. Đợi Vercel build production. Kiểm: <domain production>/api/health có environment = "production" và server_build = SHA mới; trang chủ + ?play=1 tải không lỗi; ?lab= và F9 không có tác dụng; gửi KHÔNG lô test nào vào production.
5. Tạo/ghi tiếp docs/RELEASE_LOG.md: ngày giờ (UTC+7), SHA, người duyệt, link, ghi chú. Commit + push lên dev và main.
6. Báo cáo tiếng Việt: kết quả từng bước, cách rollback (Vercel → Deployments → Promote bản trước).
```
- **Xong khi:** production chạy; có dòng nhật ký phát hành.

---

## Mục 3 — Quy trình Integrator & 5 lệnh Gatekeeper
```bash
npx tsc --noEmit
npx vitest run --pool=vmThreads          # Windows/Node 24 bắt buộc --pool=vmThreads
npm run validate:world
VERCEL_ENV=production npm run build
npx playwright test --workers=1          # 47 test, ~30 phút; 1 bỏ qua (smoke cần Firestore Emulator)
```
- Mỗi nhánh task chỉ được gộp khi đủ 5 lệnh đạt **trên bản gộp thử**.
- Mỗi lần gộp dùng `merge --no-ff`, thông điệp `merge: <nhánh> vao feat/sprint-0412 [<mã>]`.
- Trong kỳ đo 05–15/12: mọi lần lên `main` ghi `docs/RELEASE_LOG.md`.

## Mục 4 — Checklist Production (dùng ở thẻ #8)
1. `/api/health` → `environment: "production"`, `firebase: "configured"`, `server_build` đúng SHA.
2. Trang chủ, `?play=1`: 0 lỗi console, 0 tài nguyên 4xx/5xx.
3. Chơi tay nhanh Phòng 2026 → Trang 1 (5 phút) để chắc chắn số liệu vào Firestore với `environment = "production"`.
4. `?lab=`, F9 không có tác dụng.
5. Theo dõi Firestore Usage ngày đầu (hạn mức Spark 20.000 lượt ghi/ngày).
6. Rollback: Vercel → Deployments → Promote bản trước.

---

## Mục 5 — Thẻ Giai đoạn 2 & 3 (mở khi tới lượt)
Mọi prompt dưới đây dùng chung phần đầu:
```
Bạn là Claude Code cho repo KusaThaor/GAME-KNDMST. Đọc CLAUDE.md và thẻ <MÃ> trong docs/handoff/SPRINT_TASKS_2026-11-26.md.
Tạo nhánh <nhánh> từ origin/feat/sprint-0412. Không tự viết cốt truyện/thoại; thiếu chữ thì dừng và hỏi.
Chạy đủ 5 lệnh Gatekeeper, push nhánh, báo cáo tiếng Việt (đã test gì, chưa test gì). Không gộp.
```
| Mã | Việc cụ thể (nối vào phần đầu prompt) | Xong khi |
|---|---|---|
| AN-1 | Viết script `scripts/export-events.ts` đọc Firestore (dùng `FIREBASE_SERVICE_ACCOUNT` từ biến môi trường), xuất CSV event + feedback, **chỉ** `environment = production`, bỏ lô `build_version` chứa `smoke`. | CSV mở được bằng Excel; không có cột tên/email/IP |
| N-18 | Phát `free_photo_taken` khi chụp ảnh tự do; rà `EVENT_NAMES` trong `shared/events.ts`, event nào chưa có nơi phát thì thêm hoặc ghi lý do trong `docs/analytics`. | Test bridge phủ mọi event |
| N-12 | Nhân vật phụ procedural qua `CharacterRigAdapter` (cô giáo, bác bảo vệ, chú tạp hóa, 4–6 học sinh nền) theo quy chuẩn 2.0 của `docs/NEXT_SPRINT_TASK_BOARD.md`. Không dùng Blender. | Không chặn đường đi; FPS tụt ≤ 10% (đo laptop thật) |
| SQ-0 | *(Project thiết kế)* Viết thoại 6 nhiệm vụ phụ `q_m1_ai_side_*` + `q_m1_ai_daily_01` theo GDD; chủ dự án duyệt. | Có bản CONFIRMED |
| SQ-1 | Thay `[PLACEHOLDER]` bằng thoại SQ-0, đổi nhãn sang `HUMAN_CANON`, khai vào production trong `release.ts`. | Validator production 0 lỗi; bundle 0 `[PLACEHOLDER]` |
| SFX-1 | Âm thanh WebAudio: vở rơi, trống trường, tiếng "tách" máy ảnh, mưa; nút tắt tiếng trong Menu. | Có nút tắt; không tải file âm thanh nặng |
| ANIM-1 | Hoạt ảnh: ngồi, cúi vớt thuyền, treo biển, chữ hiện dần trên buồm — đúng cảnh TONG_DUYET. | Không đổi luồng quest; E2E đạt |
| PERF-1 | Tách chunk game (manualChunks cho three) + tải trước khi đang ở trang chủ. | Không còn cảnh báo > 900 KB |
| M2-1 | Nối `HUB_QUESTS_M2`, `PDES_M2`, `ART_M2_01` vào pack bản **test** (chưa production). | Validator 0 lỗi; Mốc 1 không đổi |
| M2-2 | Số hóa Trang <N> từ bản CONFIRMED của M2-0; tham khảo nhánh `task/N-15a-trang5`, `task/N-15c-trang7` nhưng **không gộp thẳng** (lệch nền). | File `d_g08_*`/`d_g09_*`; E2E chơi qua Trang <N> |
| M2-3 | Minigame <tên> dùng khung minigame chung, có "Bỏ qua", có unit test. | Unit test + E2E bỏ qua đạt |
| M2-4 | Biến thể bản đồ THCS lớp 8–9 (đổi trang trí theo năm, procedural). | `validate:world` 0 lỗi |
| M2-5 | Album trang Mốc 2, kết Mốc 2, timeskip 2018 → 2026. | Lưu/tải đúng; E2E đạt |
