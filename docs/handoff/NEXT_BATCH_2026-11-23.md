# Đợt việc kế — 23/11/2026 (Integrator)

> **Đã cũ (23/11 sáng):** mục A đã xử lý; mục B/C được thay bằng `NEXT_BATCH_2026-11-23_N14-N23.md` (đủ mọi prompt). Giữ file này làm lịch sử.

Nền khi soạn: `feat/sprint-0412` @ `dfc156e` — đã gộp N-03 (#1), N-10 (#6), N-04 (#2), N-02 (#4), N-09 (#3). **N-05 (#5) bị trả về sửa** (e2e đỏ — phiếu A0).
Cách dùng: mỗi khối dưới đây là **một prompt**, copy nguyên khối dán cho agent tương ứng. Mọi prompt đều kèm quy chuẩn chung ở `docs/NEXT_SPRINT_TASK_BOARD.md` mục 2.0.

Thứ tự gợi ý: **A0 (N-05) và A1 (N-02b) trước** — nhỏ, mở đường cho N-14 và N-16. Phần B (đợt mới) chạy song song được, trừ N-14 phải chờ A1 gộp.

---

## A. Phiếu sửa và việc nối tiếp

### A0 · Phiếu sửa N-05 — PR #5 (giao lại agent đã làm N-05)
```
Bạn là agent đồ họa đã làm N-05 cho repo KusaThaor/GAME-KNDMST. PR: https://github.com/KusaThaor/GAME-KNDMST/pull/5 — Integrator YÊU CẦU SỬA (đọc bình luận mới nhất trên PR).
1. Cập nhật nhánh task/N-05-anh-sang-thoi-tiet: git fetch origin && git merge origin/feat/sprint-0412 (KHÔNG rebase, KHÔNG push --force). N-04 đã gộp nên PR sẽ chỉ còn phần N-05.
2. Lỗi: e2e "ca 8" đỏ — tests/e2e/world.spec.ts:906, expect((await cam(page)).locked).toBe(false) nhận true.
   Tái hiện: npx playwright test --workers=1 tests/e2e/world.spec.ts -g "ca 8:"   (không có PR của bạn thì ca này xanh).
   Nguyên nhân: giữ ảnh hẹn giờ q_m1_main_05.s04 → sang ngay cutscene s05; nhánh cutscene trong src/game/game.ts gọi dayScene.lockWeatherCamera('q_m1_main_05.s05') và d_g07_03.ts khai s05 → after_rain_rainbow (cutsceneMarker cam.thcs.rainbow) nên camera đang khóa đúng lúc test kiểm.
   Chọn một hướng, ghi rõ trong PR:
   (a) khóa camera trong cutscene cầu vồng là chủ ý → sửa ĐÚNG ca 8 cho đi hết thoại s05 rồi mới kiểm locked === false (tests/e2e/world.spec.ts nằm ngoài phạm vi N-05: chỉ sửa ca 8, ghi lý do);
   (b) không chủ ý → chỉnh lockWeatherCamera để không ảnh hưởng ca 8.
3. Nếu N-01 gộp trước bạn: Trang 4 có cấu trúc bước mới — đổi weather_by_step thành 'q_m1_main_05.s06': 'rain_shower', 'q_m1_main_05.s07': 'after_rain_rainbow' (s07 là bước ảnh cầu vồng, không phải cutscene — kiểm lại cách khóa camera).
Kết quả mong đợi: 4 lệnh ở mục 2.0 xanh VÀ npx playwright test --workers=1 đầy đủ: 38 đạt / 1 bỏ qua. Dán kết quả thật vào PR. Chỉ sửa file đã có trong PR (+ ca 8 nếu chọn hướng a).
```

### A1 · N-02b — nối kết quả minigame vào bản lưu v3 + truyền flag cho đồ trang trí (giao lại agent đã làm N-02)
```
Bạn là agent engine cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-02.
PR #4 (N-02) đã gộp vào feat/sprint-0412. Đây là phần nối tiếp nhỏ vì N-03 (#1) và N-04 (#2) đã gộp sau khi bạn viết N-02.
Worktree nhánh task/N-02b-noi-save-v3 từ origin/feat/sprint-0412 (git fetch trước).
Chỉ sửa: src/game/game.ts (nhánh s.kind === 'minigame' và 2 chỗ gọi buildDayScene), src/game/minigames/host.ts (recordRound), tests/unit/minigameHost.test.ts; ngoại lệ 1 dòng ở src/content/types.ts (ghi rõ trong PR).
Việc:
1. Bỏ cách ghi tạm vào save.flags['mg.<id>.*'] (recordRound). Dùng recordMg(save, s.game, round, opponent, 'story') và getMg() có sẵn ở src/core/save.ts (chữ ký thật: recordMg(save, id, round, opp?, context?) — round là { result, stars? }). "Đã xem luật" (bỏ qua màn luật từ lần 2) đọc từ save.minigames_story[s.game] !== undefined. Dữ liệu riêng của trò (ctx.save.get/set) giữ nguyên như hiện tại (save.flags, tiền tố mg.<id>.data.).
2. Thêm trường tùy chọn opponent?: string vào bước minigame trong src/content/types.ts (chỉ 1 trường, không đổi gì khác) và truyền s.opponent ?? null vào opponentId + event minigame_started/finished. Cần cho Caro (N-16): recordMg chỉ cộng caro.series khi có đối thủ chr_duc/chr_quan.
3. Truyền flag: (n) => engine.flag(n) vào CẢ 2 chỗ gọi buildDayScene (ghi chú bàn giao của N-04: không truyền thì bộ trang trí Căn cứ của N-06 luôn rơi về mặc định).
4. Test: kết quả lần đầu ghi vào minigames_story, chơi lại chỉ cộng minigames[...]; Bỏ ván = 1 lần thua; mg_caro với opponent chr_duc thua → caro.series.duc = 4.
Chạy 4 lệnh ở mục 2.0, dán kết quả thật. Vì sửa game.ts: ghi rõ đã/chưa chạy npx playwright test --workers=1. Commit kết bằng [N-02b], mở PR vào feat/sprint-0412, tiêu đề có [N-02b].
```

### A2 · N-01 — mở PR (nhánh `task/N-01-sua-moc1` đã đẩy nhưng chưa có PR)
Integrator đã xem trước nhánh: gộp được lên nền mới, nhưng có 3 việc phải làm trước khi mở PR.
```
Bạn là agent nội dung cho repo KusaThaor/GAME-KNDMST. Bạn đã làm N-01 trên nhánh task/N-01-sua-moc1 nhưng chưa mở PR.
Trong lúc đó feat/sprint-0412 đã gộp N-03, N-10, N-04, N-02, N-09 (#3). Làm theo thứ tự:
1. git fetch origin && git merge origin/feat/sprint-0412 (KHÔNG rebase, KHÔNG push --force). Integrator đã thử: không xung đột chữ; riêng docs/DEV_SESSION_HANDOFF.md có thể xung đột ở đầu file → giữ cả hai mục.
   N-05 (PR #5, đang sửa) thêm vào src/content/days/d_g07_03.ts: map_variant 'g07_end' và weather_by_step trỏ s04/s05 theo cấu trúc cũ. Nếu lúc bạn merge N-05 ĐÃ gộp: đổi weather_by_step thành 'q_m1_main_05.s06': 'rain_shower' (cảnh mưa), 'q_m1_main_05.s07': 'after_rain_rainbow' (ảnh cầu vồng), giữ map_variant 'g07_end'. Nếu N-05 CHƯA gộp: không làm gì, N-05 sẽ đổi khi cập nhật nhánh.
2. Các file ngoài cột "File sở hữu" mà bạn đã sửa — Integrator chấp nhận vì là hệ quả bắt buộc của việc đổi mã, NHƯNG phải ghi lý do từng file trong mô tả PR:
   src/content/validate.ts (regex mã q_m1_ai_* và alb.*.cover), src/content/types.ts (bước minigame có lines, level tùy chọn), tests/unit/analyticsBridge.test.ts (đường chơi theo bước mới), src/content/hub.ts (pde_03 trỏ q_m1_ai_side_01).
   Lưu ý hub.ts: N-08 cũng sửa đúng dòng pde_03 → ai gộp sau sẽ phải giải xung đột 1 dòng (giữ mã q_m1_ai_side_01). Ghi điều này vào PR.
3. Chạy 4 lệnh ở mục 2.0 TRÊN NHÁNH ĐÃ MERGE, dán kết quả thật. PR sửa src/content/days/ nên ghi rõ đã/chưa chạy npx playwright test --workers=1 (bot e2e đi theo bước cũ, có thể phải báo lại cho N-19).
Tiêu đề PR: "[N-01] Sửa dữ liệu Mốc 1 theo B/C/D". Mở PR vào feat/sprint-0412.
```

### A3 · N-06, N-07, N-08, N-11a, N-11b — mở PR (nhánh đã đẩy, chưa có PR)
Integrator đã thử gộp từng nhánh lên nền mới: **đều gộp được, không xung đột chữ**. Dán prompt chung này cho từng agent (thay `<mã>` và `<nhánh>`):
```
Bạn đã đẩy nhánh <nhánh> cho task <mã> của repo KusaThaor/GAME-KNDMST nhưng chưa mở PR.
feat/sprint-0412 đã gộp N-03, N-10, N-04, N-02, N-09 (#3) (bản lưu v3, validator, khung dressing/atmosphere + marker mới, khung minigame, form phản hồi). N-05 (ánh sáng–thời tiết) đang sửa, chưa gộp.
1. git fetch origin && git merge origin/feat/sprint-0412 vào nhánh của bạn (KHÔNG rebase, KHÔNG push --force).
2. Chạy lại 4 lệnh ở docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 trên nhánh đã merge, dán kết quả thật vào PR (ghi rõ lệnh nào chưa chạy).
3. Mở PR vào feat/sprint-0412, tiêu đề có [<mã>], mô tả có: danh sách file, file ngoài cột "File sở hữu" (nếu có) kèm lý do.
Không sửa file của task khác để "cho xanh"; cần thì ghi vào PR.
```
Ghi chú riêng khi dán:
- **N-06, N-07:** nhánh có bản sao `src/world/dressing/index.ts` **giống hệt** bản đã gộp của N-04 → sau khi merge, file này biến khỏi phần thay đổi của PR, không cần làm gì.
- **N-06:** bộ trang trí Căn cứ đọc `ctx.flag('m1.base_decor')` — chỉ chạy đúng sau khi A1 (N-02b) gộp; ghi vào PR.
- **N-08:** sau khi N-01 gộp, dòng `pde_03` trong `src/content/hub.ts` sẽ xung đột → giữ mã `q_m1_ai_side_01`, xóa dòng TODO. Tỉ số caro động đọc `save.caro.series` (đã có từ N-03).
- **N-11a, N-11b:** nhánh đang chứa 3 commit của N-02; N-02 đã gộp nên sau khi merge, PR chỉ còn phần trò của mình. Mỗi PR một mã (không gộp N-11a và N-11b chung một PR).

---

## B. Đợt task mới (chưa ai nhận, phụ thuộc đã gộp)

| # | Mã | Việc | Agent | Nhánh | Phải chờ |
|---|---|---|---|---|---|
| B1 | N-14 | Ảnh tự sướng 3 lần + bìa Album cầu vồng | Opus | `task/N-14-anh-3-lan` | A1 (N-02b) gộp |
| B2 | N-16 | Trò Mốc 2 bản tối thiểu | Codex / Opus | `task/N-16-tro-moc2` | — (gộp sau A1) |
| B3 | N-17 | Màn 2D Mốc 2 (confession, thư) | Sonnet | `task/N-17-man-2d-moc2` | — |
| B4 | N-23 | Vá bẫy cache `loadProp` + đo lại bàn đôi (P2, nhỏ) | Sonnet | `task/N-23-cache-loadprop` | — |
| B5 | N-12 | Người lớn + học sinh nền | Codex | `task/N-12-nguoi-lon` | — |

Không trùng file chủ giữa 5 task (đã đối chiếu Mục 3). N-14 là task duy nhất sửa `game.ts` trong đợt này. **N-13 chưa giao** vì cần N-05 (lửa trại, preset đêm) — giao ngay khi N-05 gộp, prompt soạn sẵn ở mục C.

### B1 · N-14 — Ảnh tự sướng 3 lần chọn 1 + ảnh cầu vồng lên bìa Album
```
Bạn là agent engine cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-14.
Worktree nhánh task/N-14-anh-3-lan từ origin/feat/sprint-0412 — CHỈ bắt đầu sau khi PR N-02b (nối save v3) đã gộp (cùng sửa game.ts). N-02 và N-09 đã gộp.
Chỉ sửa src/game/game.ts (hàm runPhoto, khoảng dòng 211), src/systems/album.ts, src/ui/game/GameUi.tsx (vùng ảnh) và test liên quan (tests/unit/album*.test.ts).
Làm chụp 3 lần chọn 1 cho chế độ handheld (bản lưu đã có album[entry].variants và .selected — src/core/save.ts AlbumRecord) và ảnh bìa Album từ entry alb.d.g07.03.cover.
Lưu ý dữ liệu: bước ảnh Trang 1 (q_m1_main_01.s07, handheld, camera cam.d0601.grocery) và entry alb.d.g07.03.cover do N-01 tạo (src/content/days/ — KHÔNG sửa). Nếu cần một trường mới trên bước ảnh (vd. shots: 3) thì để mặc định trong code và ghi vào PR để N-01 thêm sau.
Câu Châu lần 1 lệch khung lấy NGUYÊN VĂN kịch bản: "Khoan! Đức, tóc ông dựng kìa!". Không viết thoại mới.
Chạy 4 lệnh kiểm, dán kết quả thật. PR sửa game.ts/GameUi.tsx: ghi rõ đã/chưa chạy npx playwright test --workers=1. Mở PR, tiêu đề có [N-14].
```

### B2 · N-16 — Trò Mốc 2 bản tối thiểu
```
Bạn là agent làm minigame (TypeScript + Preact/Canvas 2D) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0, thẻ N-16 và thẻ N-11, GDD docs/gdd/02_GAMEPLAY_AND_MECHANICS.md §1, §2.1 (Caro), §2.2 (Sudoku), §2.5.3a–c.
Worktree nhánh task/N-16-tro-moc2 từ origin/feat/sprint-0412. Khung minigame (N-02) và bản lưu v3 (N-03) đã gộp: hợp đồng ở src/game/minigames/types.ts (MinigameModule, rules.lines ≤ 3, mount(el, ctx) trả { dispose, pause, resume }, ctx.onFinish({ result, stars?, score? }), ctx.opponentId, ctx.save.get/set). Registry tự nạp mọi file src/game/minigames/games/*.ts.
Chỉ tạo file mới: src/game/minigames/games/{mg_caro,mg_sudoku,mg_throw,mg_photo_hunt,mg_decorate,mg_mailbox_build}.ts (mỗi trò export default một MinigameModule) và tests/unit/mg_moc2.test.ts. Không sửa registry, host, game.ts hay save.ts.
Theo thẻ: mg_caro 12×12, 5 ô thắng, 1 mức AI "Đức dễ"; tỉ số caro.series {quan, duc} do recordMg() trong src/core/save.ts tự cập nhật theo kết quả LẦN ĐẦU khi có đối thủ chr_duc/chr_quan (đối thủ lấy từ ctx.opponentId — được truyền sau khi PR N-02b gộp; trò không tự ghi save). mg_sudoku 9×9 mức Vừa, 3 đề cứng, đồng hồ 6 phút, sao. mg_throw (K5), mg_photo_hunt (K2, 3 góc), mg_decorate (K3), mg_mailbox_build (K3 chọn nền + họa tiết, lưu mã lựa chọn qua ctx.save.set('boxStyle', …); việc chép mã này sang save.story.valentine.boxStyle cần sửa game.ts → ghi vào PR, không tự sửa). Mọi trò có Bỏ qua; thua không chặn truyện; Esc gọi pause() thì đồng hồ dừng. Số liệu để trong hằng cấu hình đầu file. Chữ trong trò lấy nguyên văn kịch bản, không tự viết thoại.
Thứ tự làm (dừng ở đâu cũng dùng được): mg_caro → mg_mailbox_build → mg_decorate → mg_sudoku → mg_throw → mg_photo_hunt.
Chạy 4 lệnh kiểm, dán kết quả thật. Mở PR, tiêu đề có [N-16].
```

### B3 · N-17 — Màn 2D Mốc 2
```
Bạn là agent giao diện (Preact) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0, thẻ N-17, GDD docs/gdd/00_MASTER_GDD.md §5.1, docs/gdd/02_GAMEPLAY_AND_MECHANICS.md §2.5.1–2.5.4 và docs/gdd/IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md.
Worktree nhánh task/N-17-man-2d-moc2 từ origin/feat/sprint-0412. Khung minigame N-02 đã gộp: mỗi màn là một MinigameModule (src/game/minigames/types.ts) mở bằng bước minigame — không cần sửa engine.
Chỉ tạo: src/ui/game/screens/{ConfessionPage,LetterWrite,LetterRead}.tsx và 3 file đăng ký src/game/minigames/games/{mg_screen_confession,mg_screen_letter_write,mg_screen_letter_read}.ts (mỗi file export default MinigameModule, mount() render màn Preact tương ứng), tests/unit/screens_m2.test.ts.
Trang confession hư cấu, tên trang tự nghĩ (không dùng tên thật). LetterWrite: chọn người nhận × loại thư theo mã (recipient: duc|chau|quan|ha|group; kind: thanks|tease|invite|group_text|group_drawing — đúng kiểu SaveState.story.valentine ở src/core/save.ts), lưu bằng ctx.save.set, KHÔNG lưu chữ tự do. Mở/đóng bằng Esc. Lỗi trong màn không chặn Main (onFinish({ result: 'complete' }) khi đóng).
Chữ nguyên văn kịch bản; chỗ thiếu ghi [PLACEHOLDER] và nêu trong PR.
Lưu ý: validator (src/content/validate.ts, STORY_MINIGAMES) chưa có 3 mã mg_screen_* → bản production sẽ báo lỗi minigame_unknown_id khi N-15 dùng. KHÔNG sửa validate.ts; ghi vào PR để Integrator giao bổ sung.
Chạy 4 lệnh kiểm, dán kết quả thật. Mở PR, tiêu đề có [N-17].
```

### B4 · N-23 — Vá bẫy cache `loadProp` + đo lại bàn đôi
```
Bạn là agent engine (Three.js) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và dòng N-23 ở mục "N-18 … N-23 · Ghi gọn".
Worktree nhánh task/N-23-cache-loadprop từ origin/feat/sprint-0412 (N-04 đã gộp).
Chỉ sửa: src/render/assets.ts, src/world/world.ts (CHỈ hàm dispose, khoảng dòng 216–227), test mới tests/unit/assetsCache.test.ts; ngoại lệ: docs/BACKGROUND_AUDIT.md mục BG-5 nếu kết luận đo bàn là "không lệch" (ghi PR).
Việc:
1. Lỗi: loadProp(url) (src/render/assets.ts:38) giữ cache theo URL và trả clone(true) — bản sao dùng chung geometry/material với bản gốc trong cache; World.dispose() lại gọi geometry.dispose() → lần vào Ngày thứ hai, props GLB nạp bằng loadProp bị hỏng. Sửa sao cho dọn Ngày không phá cache (vd. đánh dấu userData.shared cho geometry/material lấy từ cache và để dispose bỏ qua, hoặc clone geometry khi cần sở hữu riêng). Không đổi chữ ký loadProp.
2. Test: nạp cùng một GLB hai lần (dùng parseGlb như tests/unit/assets.test.ts), dispose lần 1, lần 2 vẫn còn geometry hợp lệ (attributes.position.count > 0, chưa bị dispose).
3. Đo lại public/assets/props/prp_desk_2seat.glb bằng THREE.Box3 (G-8): ghi min.y thật vào PR. Nếu ≈ 0 → xóa BG-5 khỏi docs/BACKGROUND_AUDIT.md; nếu lệch → bù bằng code lúc nạp (không sửa GLB, quyết định D3).
Không thêm .glb/.blend. Chạy 4 lệnh ở mục 2.0, dán kết quả thật, mở PR (tiêu đề có [N-23]).
```

### B5 · N-12 — Người lớn + học sinh nền procedural
```
Bạn là agent nhân vật procedural (Three.js) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-12, GDD docs/gdd/01_NARRATIVE_AND_SCENES.md §2.2.
Worktree nhánh task/N-12-nguoi-lon từ origin/feat/sprint-0412. Chỉ sửa src/actors/character/presets.ts, src/actors/character/build.ts và tests/unit/rigAdapter.test.ts.
Thêm 3 người lớn (adult_teacher cô Diệp, adult_guard bác bảo vệ, adult_shop chú tạp hóa) + stu_tu (Tú) + 4 học sinh nền stu_bg_1…4 như thẻ, dựng bằng code (không GLB), min.y = 0, ≤ 2.500 tam giác/người; người lớn cao 1,55–1,70 m, học sinh theo dải lớp (6–7: 1,30–1,40 m; 8–9: 1,55–1,65 m — AGE_G8_9 dùng chung rig do N-05 thêm, PR #5 chưa gộp: không phụ thuộc vào nó). Chỉ cần idle và talk.
Chạy 4 lệnh kiểm, dán kết quả thật, mở PR (tiêu đề có [N-12]).
```

---

## C. Chưa giao (lý do)
- **N-13** (đạo cụ Mốc 2 + đêm Hội trại, P1): chờ N-05 gộp (dùng `fx.addCampfire`, preset `night_campfire`, biến thể `g08_night`/`g09_night` do N-05 thêm). Prompt soạn sẵn ngay dưới — giao khi N-05 ✅.
- **N-15a…e** (số hóa Main Trang 5–9): phụ thuộc N-11 (mã trò) chưa gộp. Mã trò đã cố định trong thẻ nên có thể chạy sớm nếu chủ dự án đồng ý.
- **N-15f**: chờ N-15a…e. **N-18**: chờ N-14. **N-19, N-22**: cổng cuối. **N-21**: chờ N-17, N-06.
- **N-20** (P2, tài liệu): sẵn sàng nhưng để đợt sau cho đỡ tải.

### (soạn sẵn) N-13 — Đạo cụ procedural Mốc 2 + đêm Hội trại
```
Bạn là agent dựng đạo cụ 3D bằng code cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-13, docs/BACKGROUND_AUDIT.md (b3), (d), kịch bản docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md dòng 329–857 để biết vật cần có.
Worktree nhánh task/N-13-props-moc2 từ origin/feat/sprint-0412 — CHỈ khi N-05 (PR #5) đã gộp. N-04 đã gộp:
- Điểm gắn: src/world/dressing/index.ts — mỗi bộ là file src/world/dressing/sets/m2_*.ts, export default DressingSet { id, appliesTo(ctx), build(ctx) }; ctx có scene, world, dayId, decor, flag(name), addUpdate(fn). Không sửa dayScene.ts.
- Lửa trại: dùng fx.addCampfire(position) của src/render/fx.ts (N-05) — nếu bộ trang trí không lấy được fx từ ctx thì dựng ngọn lửa tĩnh bằng code và ghi vào PR đề xuất thêm fx vào DressingCtx (file của N-04, không tự sửa).
- Preset đêm: LIGHTING_PRESETS.night_campfire và biến thể map g08_night / g09_night đã có (src/world/variants.ts, src/content/base.ts).
Chỉ tạo file trong src/world/props/m2/, src/world/dressing/sets/m2_*.ts, tests/unit/props_m2.test.ts.
Nắp hộp phấn (chalkBox) ghi tỉ số caro: DressingCtx chưa đọc được save.caro.series → tạm hiện 3–3 qua tham số hàm makeChalkBox({ quan, duc }) và ghi PR. Cột rổ (PX-62): kiểm GLB sân trước, có rồi thì bỏ.
Quy chuẩn: min.y = 0, toon + PAL, sRGB, InstancedMesh khi lặp ≥ 5, mergeStatic, không GLB/Blender. Chữ trên vật lấy nguyên văn kịch bản. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR (tiêu đề có [N-13]).
```

