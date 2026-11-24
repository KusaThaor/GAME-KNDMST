# Đợt giao việc 25/11/2026 — ưu tiên hoàn thiện Mốc 1 cho Production (Integrator)

> Nền khi soạn: `feat/sprint-0412` @ `303bd09` (sau khi gộp N-01 #8) · `dev` @ `d5f1a09` (sau khi gộp #18, cây mã trùng `303bd09`) · `main` @ `4adf991` (scaffold).
> Mỗi khối ```` ``` ```` là **một prompt** — copy nguyên khối dán cho agent. Luật chung giống các đợt trước: đọc `CLAUDE.md` + `docs/NEXT_SPRINT_TASK_BOARD.md` mục 2.0; worktree riêng từ `origin/feat/sprint-0412`; không `push --force`, không rebase nhánh đã đẩy, không gộp `main`; chỉ sửa file trong cột "File chủ"; thoại **nguyên văn** kịch bản / chữ đã có trong code (không viết câu mới); PR vào `feat/sprint-0412`, tiêu đề + commit có mã task, mô tả có kết quả thật của 4 lệnh.

## 0. Chủ dự án chốt gì trước khi giao
| # | Việc | Ảnh hưởng |
|---|---|---|
| Q1 | **Màn kết của bản Production chỉ có Mốc 1.** Hiện 2/3 tin nhắn kết nói chuyện **lớp 8** ("Ván caro hồi lớp 8…", "Điều 6…") mà người chơi Mốc 1 chưa gặp. **A** (Integrator đề xuất): giữ nguyên như bản test tới khi Mốc 2 lên. **B**: dừng ở lúc về phòng sau Trang 4 → "(còn tiếp)" → form, bỏ bước nhắn tin. | N-22a |
| Q2 | Ai đang sửa dở `index.html`, `src/main.ts` trên máy chủ dự án (N-01 đã tránh commit hai file này)? Commit hoặc bỏ **trước** khi N-18 bắt đầu. | N-18 |

## 1. Bảng đợt
| Thứ tự | Mã | Việc | Mốc | Agent | Nhánh | File chủ (không task nào khác trong đợt chạm) | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| 1 | **N-01b** | Tách thoại trước / sau minigame (Trang 1, Trang 3) | M1 · P0 | Sonnet (agent N-01) hoặc Opus | `task/N-01b-thoai-truoc-sau` | `src/content/types.ts` (chỉ kiểu bước `minigame`), `src/content/validate.ts` (chỉ `stepLines`), `src/game/game.ts` (chỉ nhánh `minigame` của `presentStep`), `src/content/days/d_g06_01.ts`, `src/content/days/d_g07_02.ts`, `tests/unit/contentPack.test.ts`, `tests/unit/analyticsBridge.test.ts` (chỉ `playAll` Trang 1), `tests/e2e/game.spec.ts` (ca thoại minigame) | N-01 ✅ |
| 2 | **N-22a** | Bản Production Mốc 1: tắt Side/Daily AI ở production + khai 4 Trang + test chặn | M1 · P0 | Sonnet | `task/N-22a-production-moc1` | `src/content/pack.ts` (thêm `filterPackForRelease`), `src/content/release.ts` (**chỉ** khối `production`), `tests/unit/releaseProduction.test.ts` (mới) | N-01 ✅ · Q1 |
| 3 | **N-19a** | Chơi tay trọn Mốc 1 trên Preview + FPS laptop thật (điểm kiểm 26/11) | M1 · P0 | **Người** (+ Sonnet ghi chép) | — (chỉ ghi `docs/DEV_SESSION_HANDOFF.md`) | `docs/DEV_SESSION_HANDOFF.md` (mục N-19a) | dev Preview `d5f1a09` ✅ |
| 4 | **N-12** | Người lớn + học sinh nền procedural (cô giáo, chú tạp hóa… có trong Trang 1–4) | M1 · P1 | Codex | `task/N-12-nguoi-lon` | `src/actors/character/{presets,build}.ts`, `tests/unit/rigAdapter.test.ts` | — |
| 5 | **N-18** | Phát đủ event analytics (cần trước kỳ đo 05/12) | M1+M2 · P1 | Codex | `task/N-18-event-thieu` | `src/analytics/*`, `src/main.ts`, `shared/events.ts`, `tests/unit/analytics*.test.ts` | N-14 ✅ · Q2 |

**Mốc 2 vẫn chạy tiếp theo gói 23/11** (`NEXT_BATCH_2026-11-23_N14-N23.md`, prompt không đổi): N-15a, N-15c đang làm (có nhánh, chưa PR); N-15b, N-15d, N-15e, N-16, N-17, N-13 chưa thấy nhánh. **Đổi một điểm:** phần `filterPackForRelease` của N-15f chuyển sang N-22a; N-15f chỉ còn thêm 5 Trang vào `pack.ts`, khối `test` của `release.ts`, `chapters.ts`, `analyticsBridge.test.ts` — gộp **sau** N-22a và N-01b.
**Không giao trong đợt này:** N-20 (sửa `docs/gdd/`, cần chủ dự án), N-21, N-23 (P2, không chặn Mốc 1).
**Gộp đề xuất:** N-01b → N-22a → (N-12, N-18 bất kỳ lúc nào) → Integrator đưa `feat/sprint-0412` → `dev` → báo chủ dự án bấm gộp `main`.

---

## 2. Prompt

### N-01b · Tách thoại trước / sau minigame Mốc 1
```
Bạn là agent nội dung + engine (TypeScript) cho repo KusaThaor/GAME-KNDMST. Đọc CLAUDE.md, docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0, thẻ N-01, và bình luận "Đã sửa lần 3" của PR #8 (danh sách câu sai mạch).
Bối cảnh: từ N-01 (#8), thoại `lines` của bước minigame phát SAU khi chơi xong. Một số câu vốn là lời TRƯỚC khi chơi nên đang nghe ngược. Chủ dự án yêu cầu tách lại (25/11).
Worktree nhánh task/N-01b-thoai-truoc-sau từ origin/feat/sprint-0412.
Chỉ sửa: src/content/types.ts (chỉ kiểu bước minigame), src/content/validate.ts (chỉ hàm stepLines), src/game/game.ts (chỉ nhánh minigame của presentStep), src/content/days/d_g06_01.ts, src/content/days/d_g07_02.ts, tests/unit/contentPack.test.ts, tests/unit/analyticsBridge.test.ts (chỉ playAll của Trang 1), tests/e2e/game.spec.ts (ca thoại minigame).

1. Engine: bước minigame có thêm trường tùy chọn `intro_lines?: DialogueLine[]` — phát TRƯỚC khi mở trò; `lines` giữ nguyên nghĩa "phát SAU khi chơi xong (thắng, thua hay Bỏ qua)". validate.ts: stepLines trả cả intro_lines + lines để kiểm người nói. Bị hủy giữa chừng (chơi lại Ngày, đổi epoch) thì không mở trò. Không đổi gì khác trong game.ts.
2. Dữ liệu — CHỈ chuyển câu đã có giữa intro_lines / lines / bước mới, KHÔNG sửa chữ, KHÔNG thêm câu. Mốc là vị trí dòng "(Người chơi: …)" trong docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md (câu đứng trước dòng đó → trước trò):
   - d_g06_01.ts q_m1_main_01.s02 (mg_cipher): 6 câu đầu ("Ê, đọc đi!…" tới "Ơ… dạ, Châu Tổng.") → intro_lines; câu "Gọi vậy nữa là tui khỏi sửa. Mật lệnh chỉ là rủ đá cầu ra chơi thôi à." giữ ở lines.
   - s03 (mg_footbag): "Cậu cứ nhìn là biết tớ đá cầu giỏi cỡ nào!" → intro_lines; câu của Châu giữ ở lines.
   - s04 (mg_wipe_board): giữ nguyên (cả 4 câu sau trò, đúng kịch bản).
   - s06 (mg_noodle): "Ra tiệm tạp hóa đi!…" và "Chia đều. Không bàn cãi nữa." → intro_lines; "{player_name} có máy ảnh mà! Quay ngược máy lại tự sướng đi!" giữ ở lines (dẫn sang bước chụp).
   - Ba câu bàn về tấm tự sướng ("Tui thấy giữ tấm này được nè…", "Mai mốt nhất định tụi mình phải chụp thêm…", "Chốt! Sau này chụp đủ một bộ sưu tập luôn!") chuyển sang bước MỚI `q_m1_main_01.s08` kind 'cutscene' đặt SAU bước ảnh s07 (kịch bản: các câu này nói sau khi chọn ảnh). Không đổi mã s01…s07.
   - d_g07_02.ts q_m1_main_03.s05 (mg_rules): 5 câu "Phải có luật. Điều 1…" tới "Điều 5: chụp ảnh thì phải đủ người." → intro_lines (cả nhóm đọc luật, người chơi ghi vào sổ); 3 câu "Chốt! Ai vô căn cứ…", "Ông nói như có cả trăm người muốn vô.", "Biết đâu sau này nổi tiếng!" giữ ở lines.
   - Kiểm lại câu Hạ: phải là "…đừng bỏ bạn đó ở lại một mình nha." (đã sửa ở 2bbf275 — chỉ xác nhận, không sửa thêm).
3. Test: contentPack.test (Trang 1 thành 8 bước; kiểm s02/s03/s06 có intro_lines, s08 là cutscene có 3 câu ảnh); analyticsBridge.test playAll Trang 1 thêm s08; tests/e2e/game.spec.ts ca thoại minigame: câu "Ê, đọc đi!…" xuất hiện TRƯỚC lần bấm Bỏ qua của s02, câu "Mới quen một bữa mà ông mày tao rồi hả?" vẫn SAU lần bấm Bỏ qua của s04, câu "Tui thấy giữ tấm này được nè…" SAU bước ảnh s07.
4. Chạy: npx tsc --noEmit · npm test (mốc nền 522 đạt / 2 bỏ qua, không được giảm) · npm run validate:world · VERCEL_ENV=production npm run build · npx playwright test --workers=1 (mốc nền 45 đạt / 0 đỏ / 1 bỏ qua, ~22–32 phút, chạy nền). Dán kết quả thật; lệnh nào chưa chạy ghi "chưa chạy".
Commit nhỏ kết bằng [N-01b], mở PR "[N-01b] Tách thoại trước/sau minigame Mốc 1" vào feat/sprint-0412. Không commit index.html, src/main.ts.
```

### N-22a · Bản Production Mốc 1
```
Bạn là agent phát hành cho repo KusaThaor/GAME-KNDMST. Đọc CLAUDE.md (quy tắc main/production), docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0, dòng N-15f, N-22 và Mục 0.4 G-3, src/content/{pack,release,validate}.ts, src/main.ts (biến HAS_GAME), src/game/game.ts (chỗ gọi validateContent), docs/handoff/NEXT_BATCH_2026-11-25.md mục 0 (phương án Q1 chủ dự án đã chọn).
Bối cảnh: khối production của release.ts đang 0 Trang → bản Production chỉ có trang chủ. Validator production CHỈ in lỗi ra console (game.ts), không chặn — nên cần test chặn.
Worktree nhánh task/N-22a-production-moc1 từ origin/feat/sprint-0412. Chỉ sửa src/content/pack.ts, src/content/release.ts (CHỈ khối production) và tạo tests/unit/releaseProduction.test.ts. Không sửa game.ts, validate.ts, file Trang, hub.ts.
1. pack.ts: thêm `filterPackForRelease(pack, env)` — production bỏ side_quests và daily_pool của mọi Ngày, và gỡ mọi thứ chỉ phục vụ quest AI_PROPOSED nếu cần để người chơi không thấy chữ [PLACEHOLDER] ở đâu (Album, HUD, mảnh ký ức, PDE); test giữ nguyên. Áp bộ lọc ngay trong pack.ts cho gói CONTENT theo __APP_ENV__ (vitest đặt 'test' nên test cũ không đổi), để không phải sửa game.ts.
2. release.ts khối production: 4 Trang Mốc 1 theo đúng thứ tự bản test (d.g06.01, d.g07.01, d.g07.02, d.g07.03), end_day_id 'd.g07.03'. Kết theo Q1: A → end_step_id như bản test ('q_hub_pd_03.s01'); B → dừng trước bước nhắn tin, rồi "(còn tiếp)" → form phản hồi (nếu làm B cần sửa file ngoài phạm vi thì DỪNG, ghi PR, không tự sửa). Chưa có Q1 → làm A và ghi rõ trong PR.
3. tests/unit/releaseProduction.test.ts: (a) validateContent(filterPackForRelease(CONTENT,'production'), contentConfig('production')) → 0 lỗi; (b) mọi quest đi tới được trong production đều HUMAN_CANON, không có AI_PROPOSED; (c) không chữ "[PLACEHOLDER]" nào trong phần người chơi production thấy được; (d) bản test vẫn đủ Side/Daily như cũ.
4. VERCEL_ENV=production npm run build rồi tìm trong dist/: tweakpane, __game, inputdebug, camtest, bot=release → phải 0. Đếm thêm "[PLACEHOLDER]" và "AI_PROPOSED" trong dist (dữ liệu còn nằm trong gói JS dù người chơi không tới được) — ghi số vào PR, đợt này chưa bắt buộc về 0.
5. Chạy 4 lệnh mục 2.0 (mốc nền vitest 522/2 — chỉ được tăng) + npx playwright test --workers=1 (bản test không đổi nên phải giữ 45 đạt / 0 đỏ / 1 bỏ qua). Dán kết quả thật.
Mở PR "[N-22a] Bản Production Mốc 1" vào feat/sprint-0412. KHÔNG mở PR vào main. Ghi vào PR: "Sau khi gộp, Integrator đưa lên dev rồi chờ chủ dự án duyệt gộp main".
```

### N-19a · Chơi tay Mốc 1 + FPS (người làm, điểm kiểm 26/11)
Không phải prompt cho AI — danh sách việc cho chủ dự án / thành viên, ghi kết quả vào `docs/DEV_SESSION_HANDOFF.md` (mục "N-19a — chơi tay Mốc 1"):
1. Mở bản Preview của nhánh `dev` (Vercel → dự án `kndmst` → Deployments → bản mới nhất của `dev`, commit `d5f1a09`), thêm `/?play=1`. Dùng **Chrome thường** trên laptop thật, xóa dữ liệu trang trước khi chơi.
2. Chơi trọn: phòng 2026 → Trang 1 → 2 → 3 → 4 → về phòng → Album → điện thoại → kết → form phản hồi. Ghi lại mọi chỗ: kẹt, thoại sai mạch, trò không bấm được, ảnh không có người trong khung (đặc biệt ảnh bộ ba ở tiệm tạp hóa Trang 1), chữ sai chính tả.
3. FPS: bật bộ đếm FPS của Chrome (DevTools → Rendering → Frame Rendering Stats). Ghi số ở 3 chỗ: sân trường ban ngày (Trang 1), Căn cứ (Trang 3), mưa → cầu vồng (Trang 4), kèm tên máy, CPU, card đồ họa.
4. Mở `<link Preview>/api/health` → ghi giá trị `firebase` (phải là `configured`; `missing` nghĩa là Vercel chưa có biến `FIREBASE_SERVICE_ACCOUNT` cho Preview).
5. Gửi form phản hồi một lần → báo Integrator để kiểm bản ghi có lên Firestore (môi trường `test`) không.

### N-12 · Người lớn + học sinh nền procedural
```
Bạn là agent nhân vật procedural (Three.js) cho repo KusaThaor/GAME-KNDMST. Đọc CLAUDE.md, docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-12, GDD docs/gdd/01_NARRATIVE_AND_SCENES.md §2.2.
Worktree nhánh task/N-12-nguoi-lon từ origin/feat/sprint-0412. Chỉ sửa src/actors/character/presets.ts, src/actors/character/build.ts và tests/unit/rigAdapter.test.ts.
Thêm 3 người lớn (adult_teacher cô Diệp, adult_guard bác bảo vệ, adult_shop chú tạp hóa) + stu_tu (Tú) + 4 học sinh nền stu_bg_1…4 như thẻ, dựng bằng code (không GLB), min.y = 0, ≤ 2.500 tam giác/người; người lớn cao 1,55–1,70 m, học sinh theo dải lớp (6–7: 1,30–1,40 m; 8–9: 1,55–1,65 m). Chỉ cần idle và talk. Không tự đặt họ tên đầy đủ, không chữ trên áo.
Chỉ tạo preset — việc đặt nhân vật vào cảnh Trang nào là task khác: ghi vào PR đề xuất chỗ đứng (marker có sẵn) cho cô giáo (Trang 1 lớp học) và chú tạp hóa (Trang 1 tiệm tạp hóa).
Chạy 4 lệnh kiểm (mốc nền vitest 522/2), dán kết quả thật, mở PR "[N-12] …".
```

### N-18 · Phát đủ event analytics
```
Bạn là agent web/analytics cho repo KusaThaor/GAME-KNDMST. Đọc CLAUDE.md, docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và dòng N-18 ở mục "N-18 … N-23", shared/events.ts, src/analytics/bridge.ts, api/_lib/collect.ts.
Trước khi bắt đầu: hỏi chủ dự án về bản sửa dở src/main.ts / index.html trên máy chủ dự án (mục 0, Q2 của docs/handoff/NEXT_BATCH_2026-11-25.md) — không làm trong thư mục đó, không ghi đè.
Worktree nhánh task/N-18-event-thieu từ origin/feat/sprint-0412. Chỉ sửa src/analytics/*, src/main.ts, shared/events.ts và tests/unit/analytics*.test.ts.
1. free_photo_taken và feedback_submitted đã có người nghe ở bridge nhưng chưa ai phát — phát qua EventBus từ chỗ có sẵn; nếu buộc phải thêm dòng emit trong game.ts thì ghi PR, không tự sửa (đợt này N-01b đang giữ game.ts).
2. landing_view, cta_click phát ở trang chủ (src/main.ts).
3. Bỏ hub_opened khỏi shared/events.ts và mọi chỗ dùng (Khu Vui Chơi đã cắt — A1).
4. Không gửi tên/email/IP; giữ phân biệt test/production và release_stage như hiện có.
Nghiệm thu: một lượt chơi với Firestore Emulator đếm đủ các loại event (ghi bảng vào PR); không có Emulator thì ghi "chưa chạy" và kèm test đơn vị cho từng event.
Chạy 4 lệnh (mốc nền vitest 522/2), dán kết quả thật, mở PR "[N-18] …".
```
