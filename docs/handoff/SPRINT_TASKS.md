# SPRINT_TASKS — backlog tới 04/12/2026

| Trường | Giá trị |
|---|---|
| Lập | 21/11/2026 (tối), sau kiểm toán `docs/handoff/DEMO_AUDIT.md` |
| Phạm vi | **Trọn Mốc 1 — Trang 1→4** (chủ dự án chốt 21/11 tối). Mốc 2 (Trang 5–9, Caro, Sudoku, Valentine) và Tầng B **lùi sau 15/12** |
| Baseline | code `feat/sprint-0412` @ `09204f5` · tài liệu `docs/sync-approved-gdd-v1` @ `1ebafb3` |
| Thứ tự | Theo GDD `02` §6, cắt về phạm vi Mốc 1 |
| Phân việc | **Claude Code** = runtime, dữ liệu, build/test, Git · **Gemini Pro** = số hóa kịch bản, lời thoại, ảnh concept 2D · **Blender/Patch MCP** = model, rig, GLB |

## 0. Bảng backlog

| ID | Việc | Mức | Agent | Ngày | Phụ thuộc | Model / nỗ lực gợi ý |
|---|---|---|---|---|---|---|
| T-01 | Gộp nhánh tài liệu + 5 sửa nhỏ theo quyết định 21/11 | **P0** | Claude Code | 22/11 (0,5 ngày) | — | Sonnet, nỗ lực thấp |
| T-02 | Lưới an toàn quest: sửa A-01, thêm luật validator A-02 | **P0** | Claude Code | 22–23/11 (1 ngày) | T-01 | Sonnet, nỗ lực vừa |
| T-03 | Khung minigame chung `UI_MG_FRAME` | **P0** | Claude Code | 23–25/11 (2 ngày) | T-01, T-04 | Opus, nỗ lực cao |
| T-04 | Mở rộng `SaveState` + bước chuyển đổi v2→v3 | **P0** | Claude Code | 23/11 (1 ngày) | T-01 | Sonnet, nỗ lực vừa |
| T-05 | Khung dữ liệu Trang 2 và Trang 3 | **P0** | Claude Code | 24/11 (1 ngày) | T-02 | Sonnet, nỗ lực vừa |
| T-06 | Số hóa kịch bản Trang 1–4 thành dữ liệu | **P0** | Gemini Pro | 24–28/11 | T-05 (schema) | — |
| T-07 | 8 trò K của Trang 1–4 | **P0** | Claude Code | 26–30/11 (4 ngày) | T-03 | Opus, nỗ lực cao |
| T-08 | Kết demo sau Trang 4 + form phản hồi thật | **P0** | Claude Code + Gemini | 30/11–01/12 (1,5 ngày) | T-06 | Sonnet, nỗ lực vừa |
| T-09 | Phát các event còn thiếu | P1 | Claude Code | 01/12 (0,5 ngày) | T-03, T-08 | Sonnet, thấp |
| T-10 | Nhân vật GLB theo hướng base mesh + xương chung | P1 | Blender MCP + Claude Code | 24–27/11 (3 ngày) | — | Opus cho adapter |
| T-11 | Cây phượng/bàng đạt ngân sách + sửa ASSET_CREDITS | P1 | Blender MCP | 28–29/11 | — | — |
| T-12 | Phòng 2026 model thật + 4 kỷ vật của Mốc 1 | P1 | Blender MCP | 29/11–01/12 | — | — |
| T-13 | Sửa gốc `prp_desk_2seat.glb` + bẫy cache `loadProp` | P1 | Claude Code | 02/12 (0,5 ngày) | T-12 | Sonnet, thấp |
| T-14 | Chạy e2e toàn tuyến, đo FPS máy thật, dựng bản đo | **P0** | Claude Code + chủ dự án | 02–04/12 (2 ngày) | tất cả | Sonnet, vừa |
| T-15 | Mốc 2: Trang 5–9, Caro, Sudoku, Valentine, Tầng B | P2 | — | sau 15/12 | — | — |

Thang cắt nếu thiếu thời gian (cắt từ dưới lên): T-12 → T-11 → T-10 (giữ nhân vật dựng bằng code) → T-07 giảm còn 4 trò của Trang 1. **Không cắt** T-01…T-05, T-08, T-14.

---

## T-01 · Gộp nhánh tài liệu và 5 sửa nhỏ theo quyết định 21/11

### MỤC TIÊU
- ID: **T-01**. Agent: **Claude Code**.
- Vấn đề thấy được trong game: nhãn nhóm Trang trong menu ghi "Mốc 1 · lớp 6" và "Mốc 1 · lớp 7" như hai mốc rời; ảnh hẹn giờ đếm 8 giây trong khi kịch bản ghi 10 giây; mở bản production thì không vào được game (không có Trang nào được khai).
- Kết quả phải bàn giao: nhánh `feat/sprint-0412` đã có `docs/gdd/` bản mới nhất, 5 chỗ sửa xong, `tsc` + `npm test` + `validate:world` đạt, commit nhỏ theo từng việc.

### FILE TÁC ĐỘNG
- Repo: `https://github.com/KusaThaor/GAME-KNDMST`
- Nhánh làm việc: `feat/sprint-0412` (mốc `09204f5`). Gộp vào: `docs/sync-approved-gdd-v1` (mốc `c3eaa8b`).
- Đọc trước: `CLAUDE.md`, `docs/handoff/DEMO_AUDIT.md` §6.2 và §6.5, `docs/gdd/00_MASTER_GDD.md` §4 và §7.3, `docs/gdd/03_ASSETS_AND_AUDIO.md` §1.3.
- Dự kiến sửa: `src/content/release.ts` · `src/content/chapters.ts` · `src/actors/player/rigAdapter.ts` · `tests/unit/rigAdapter.test.ts` · `src/config/photo.ts` · `src/content/cast.ts` (chỉ chú thích).
- File mới: không.

### YÊU CẦU KỸ THUẬT CHI TIẾT
1. `git fetch`, rồi `git merge origin/docs/sync-approved-gdd-v1` vào `feat/sprint-0412`. Chỉ có `docs/` và `CLAUDE.md` thay đổi; nếu có xung đột ngoài hai chỗ đó thì **dừng và báo**.
2. `release.ts`: bản `test` giữ nguyên cách chạy nhưng khai đủ 4 Trang theo thứ tự `d.g06.01`, `d.g07.01`, `d.g07.02`, `d.g07.03`; `end_day_id` = `d.g07.03`. Bản `production` **vẫn để trống tới khi T-06 có nội dung thật** — thêm chú thích một dòng ghi rõ "chờ T-06, điểm dừng đã chốt là hết Trang 4". Không bỏ luật validator chặn nội dung `AI_PROPOSED` khỏi bản production.
3. `chapters.ts`: gộp thành **một** nhóm `ch_m1` nhãn `[PLACEHOLDER] Mốc 1 · lớp 6–7` chứa cả 4 Trang. Giữ kiểu `Chapter` và dạng ID `ch_*` để khỏi đổi schema.
4. `rigAdapter.ts`: `AVATAR_HEIGHT_RANGE_M[9]` đổi thành `[1.55, 1.65]`; sửa chú thích đầu file theo GDD `03` §1.3 bản 21/11. Sửa `tests/unit/rigAdapter.test.ts` cho khớp (ca `checkAvatarHeight({ height: 1.35 }, 9)` vẫn phải là `false`, thêm ca `1.60` là `true`).
5. `photo.ts`: `timer_seconds: 10`. Kiểm xem ca e2e ảnh hẹn giờ có thời gian chờ cứng không — nếu có thì nới thời gian chờ, **không** giảm thời gian hẹn giờ.
6. `cast.ts`: sửa chú thích — D-01 đã **CONFIRMED 19/11** là Đức + Châu, đúng bằng `ACTIVE_CAST = 'A'`. Giữ nguyên ba bảng A/B/C và công cụ `?cast=`.
7. Không đổi schema, không thêm thư viện, không sửa engine quest.

### TIÊU CHÍ NGHIỆM THU
```bash
npx tsc --noEmit            # 0 lỗi
npm test                    # không ít hơn 266 test đạt
npm run validate:world      # 0 lỗi
VERCEL_ENV=production npm run build
npm run dev                 # mở /?play=1
```
- Chơi lại: mở `/?play=1` → menu/sổ tay hiện **một** nhóm "Mốc 1 · lớp 6–7" chứa 4 Trang (Trang 2, 3 còn trống dữ liệu nên hiện mờ/khóa — đúng, T-05 sẽ thêm).
- Bước ảnh hẹn giờ ở Trang 4 đếm **10** giây.
- Bằng chứng cần lưu: dán kết quả 4 lệnh trên vào mô tả commit hoặc `docs/DEV_SESSION_HANDOFF.md`.
- Task kế tiếp: **T-04** (làm song song được với T-02).

---

## T-02 · Lưới an toàn cho việc viết quest (A-01, A-02)

### MỤC TIÊU
- ID: **T-02**. Agent: **Claude Code**.
- Vấn đề thấy được trong game: người chơi đang đứng sẵn ở chỗ cần tới thì bước "đi tới" không bao giờ xong, phải đi ra rồi quay vào (A-01). Quest phụ có bước đầu sai loại thì **lặng lẽ không khởi động**, không báo lỗi (A-02). Hai lỗi này chưa lộ với nội dung giả nhưng sẽ lộ ngay khi T-06 đổ nội dung thật vào.
- Kết quả phải bàn giao: hai lỗi sửa xong, có test đỏ trước khi sửa, test xanh sau khi sửa.

### FILE TÁC ĐỘNG
- Repo: `https://github.com/KusaThaor/GAME-KNDMST` · nhánh `feat/sprint-0412` (sau T-01).
- Đọc trước: `docs/handoff/DEMO_AUDIT.md` mục 5 (B-05, B-06), `docs/ai-handoff/04_NEXT_TASK_FOR_CLAUDE.md` (bản đặc tả gốc của việc này, vẫn còn đúng), `docs/ai-handoff/02_QUEST_SYSTEM.md` §6.
- Dự kiến sửa: `src/game/game.ts` — **chỉ** hàm `proximity()` (quanh dòng 462–473) và biến `inside` (dòng ~111, ~128) · `src/content/validate.ts` (khối kiểm quest, quanh dòng 129–167) · `tests/unit/validate.test.ts` · `tests/e2e/game.spec.ts`.
- Không sửa: `src/systems/questEngine.ts`, `src/world/*`, `src/actors/*`, `src/content/days/*`.

### YÊU CẦU KỸ THUẬT CHI TIẾT
- Phụ thuộc đã có sẵn: `engine.peek('arrive', id)` và `engine.trigger('arrive', id)` trong `questEngine.ts`; công cụ test `window.__game` (`state()`, `teleport()`, `toSpawn()`) ở `src/lab/gameTools.ts` — đọc đầu file để lấy đúng tên hàm.
- **A-01:** một bước `goto` đang chờ (hoặc bước đầu `goto` của Side/Daily đang `available`) phải hoàn thành khi người chơi **đang đứng trong bán kính đích và giao diện không khóa**, kể cả khi đã đứng đó từ trước lúc bước được kích hoạt, hoặc vào bán kính lúc giao diện đang khóa rồi mở lại. Cách làm gợi ý (tự quyết sau khi đọc code): trong `proximity()`, với mỗi đích đang ở gần, khi `!locked()` thì hỏi `engine.peek('arrive', t.id)` rồi mới `trigger`; khi đó bỏ hẳn tập `inside`.
- **A-02:** `validateContent` báo **lỗi** mã `optional_quest_unstartable` khi quest `side` hoặc `daily` có bước đầu không thuộc `talk | interact | goto | collect | place` (vì engine chỉ khởi động Side/Daily qua `trigger()` ở bước đầu).
- Dữ liệu hiện có phải tương thích: gói nội dung hiện tại (`src/content/pack.ts`) phải **0 lỗi** sau khi thêm luật mới.
- Một bước `goto` không được hoàn thành hai lần; đứng yên trong bán kính không được phát lặp `quest_step_completed`.

### TIÊU CHÍ NGHIỆM THU
1. Có test đỏ **trước khi sửa** cho cả hai phần; ghi kết quả đỏ vào mô tả commit.
2. Ca e2e A-01: vào `d.g07.03` → Esc mở Menu → `__game.teleport` tới `itr.thcs.gutter` → đóng Menu → Side `q_m1_side_02` chuyển sang bước `.s02` **mà không cần di chuyển**.
3. Test đơn vị A-02: gói nội dung có Side mở đầu bằng `cutscene` → có lỗi mới; gói nội dung hiện tại → 0 lỗi.
4. `npx tsc --noEmit` đạt · `npm test` không giảm số đạt · `npm run validate:world` 0 lỗi · `npm run test:e2e` không giảm (ca ảnh hẹn giờ giờ chờ 10 giây) · build production sạch công cụ test.
5. Cập nhật `README.md` mục "Thêm một Ngày ký ức mới" và `docs/ai-handoff/02_QUEST_SYSTEM.md` §6 với luật mới.
- Task kế tiếp: **T-05**.

---

## T-04 · Mở rộng `SaveState` và bước chuyển đổi bản lưu

### MỤC TIÊU
- ID: **T-04**. Agent: **Claude Code**.
- Vấn đề thấy được trong game: kết quả minigame, tỉ số, cài đặt đều **không được lưu** — chơi lại là mất sạch. Nguy hiểm hơn: hiện nay chỉ cần tăng số phiên bản bản lưu là **toàn bộ tiến trình và ảnh của người chơi bị xóa**; nếu việc đó xảy ra giữa kỳ đo 05–15/12 thì mất dữ liệu người thật.
- Kết quả phải bàn giao: `SaveState` có đủ trường theo GDD `02` §4.2 (phần thuộc Mốc 1), có bước chuyển đổi v2→v3 giữ được tiến trình cũ, có test.

### FILE TÁC ĐỘNG
- Nhánh `feat/sprint-0412` (sau T-01).
- Đọc trước: `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §4 (toàn mục), `docs/handoff/DEMO_AUDIT.md` mục 4 và B-07.
- Dự kiến sửa: `src/core/save.ts` (`SAVE_VERSION`, `SaveState`, `newSave`, `SaveStore.load`) · `src/core/eventBus.ts` nếu cần kiểu kết quả · `tests/unit/save.test.ts`.
- File mới: `src/core/saveMigrate.ts` (nếu tách bước chuyển đổi ra riêng cho dễ đọc).

### YÊU CẦU KỸ THUẬT CHI TIẾT
- Thêm vào `SaveState`: `minigames: Record<string, { wins: number; losses: number; draws: number; last_played: string | null }>` theo khóa `{game_id}.{opponent_id}`; `minigames_story: Record<string, { result: 'win'|'lose'|'draw'|'complete'|'quit'; stars: number | null }>` cho kết quả **lần đầu** dùng cho thoại; `hub: { unlocked: boolean }`; `settings` thêm `volume`, `text_speed`, `difficulty`.
- **Chưa** thêm `minigames.caro.series`, `sudoku.best`, `story.valentine.*` — những thứ đó thuộc Mốc 2 (T-15). Nhưng **cấu trúc phải mở rộng được** mà không đổi lại schema.
- `SAVE_VERSION` lên **3**. `load()`: gặp `v: 2` thì **chuyển đổi** (giữ `days`, `quests`, `flags`, `artifacts`, `album`, `relationships`, `phone`, `public_demo_done`; điền mặc định cho trường mới), **không xóa**. Gặp `v: 1` hoặc hỏng thì vẫn xóa như hiện nay. Trả thêm trạng thái `'migrated'` trong `LoadStatus`.
- Ảnh trong IndexedDB **không được xóa** khi chuyển đổi.
- Quy tắc riêng tư giữ nguyên: không thêm trường nào chứa tên người chơi, chữ tự do hay nội dung tin nhắn.

### TIÊU CHÍ NGHIỆM THU
1. Test đơn vị: nạp một JSON `v: 2` thật (chép từ `localStorage` sau một lượt chơi, hoặc dựng trong fixture) → `status === 'migrated'`, tiến trình Trang và Album còn nguyên, trường mới có giá trị mặc định.
2. Test đơn vị: `v: 1` → `reset_old_version` như cũ.
3. `npx tsc --noEmit` đạt · `npm test` tăng thêm số test đạt · `npm run test:e2e` không giảm.
4. Chơi lại thật: chơi tới giữa Trang 1 bằng bản code cũ, đổi sang bản mới, tải lại trang → vẫn đứng đúng chỗ, Album không mất.
5. Bằng chứng cần lưu: dán JSON trước/sau chuyển đổi (đã bỏ tên người chơi) vào mô tả commit.
- Task kế tiếp: **T-03**.

---

## T-03 · Khung minigame chung (`UI_MG_FRAME`)

### MỤC TIÊU
- ID: **T-03**. Agent: **Claude Code**.
- Vấn đề thấy được trong game: mọi minigame hiện ra là **một thẻ trắng có đúng một nút "Xong"** (`[PLACEHOLDER] Minigame "..." (mức min)`). Không có luật, không thắng/thua, không chơi lại. Mọi trò của Trang 1–4 đều phải chờ khung này.
- Kết quả phải bàn giao: một khung dùng chung cho mọi trò, nạp trò theo `game_id`, có vòng đời đúng GDD `02` §1.1; thẻ giả cũ bị thay; một trò thật đầu tiên (lau bảng K6) chạy được qua khung để chứng minh khung dùng được.

### FILE TÁC ĐỘNG
- Nhánh `feat/sprint-0412` (sau T-01 và T-04).
- Đọc trước: `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` **§1 toàn mục** (vòng đời ván, quy tắc thua không chặn truyện, bỏ ván = thua, hướng dẫn luật, Esc dừng đồng hồ) và §2.4.4 (lau bảng); `src/game/game.ts` dòng 178–186 (chỗ hiện gắn thẻ giả); `src/ui/game/GameUi.tsx` dòng 212–215; `src/content/types.ts` dòng 72; `src/core/eventBus.ts` dòng 31–32 (kiểu event đã có sẵn).
- Dự kiến sửa: `src/content/types.ts` (bước `minigame`: thêm `config?` và bỏ giới hạn `level: 'min'`) · `src/game/game.ts` (`presentStep` nhánh `minigame`) · `src/ui/game/GameUi.tsx` · `src/ui/game/store.ts` · `src/content/validate.ts` (kiểm `game` có trong sổ đăng ký).
- File mới: `src/minigames/frame.tsx` (khung: màn luật → chơi → kết quả → Chơi lại / Tiếp tục) · `src/minigames/registry.ts` (sổ đăng ký theo `game_id`) · `src/minigames/types.ts` · `src/minigames/wipeBoard.tsx` (trò lau bảng) · `tests/unit/minigameFrame.test.ts`.

### YÊU CẦU KỸ THUẬT CHI TIẾT
- Hợp đồng một trò: `{ id, title, rules: { image?: string; lines: string[] /* tối đa 3 */ }, mount(el, ctx): void, dispose(): void }`, trong đó `ctx` cho trò gọi `ctx.finish({ result, stars?, score?, hints_used? })` và đọc `ctx.difficulty`.
- Vòng đời bắt buộc: **màn luật** (bỏ qua được từ lần thứ hai, nhớ bằng `save.minigames_story` hoặc cờ riêng) → **chơi** → **kết quả** (Thắng / Thua / Hòa / Hoàn thành) → **Chơi lại** hoặc **Tiếp tục**. Nút **"?"** mở lại luật trong lúc chơi. **Esc** mở menu và **dừng đồng hồ** của trò.
- Quy tắc không được phá: thua **không bao giờ** chặn truyện — mọi kết quả đều `engine.complete(step.id)`. "Bỏ ván" tính là **thua** và vẫn đi tiếp. Kết quả **lần đầu** là kết quả dùng cho thoại (ghi vào `minigames_story`); chơi lại chỉ cập nhật bảng thành tích (`minigames`).
- Event: giữ nguyên `minigame_started` / `minigame_finished` đã có ở `eventBus.ts`, nhưng `result` phải là kết quả thật (`win|lose|draw|complete|quit`), `duration_s` là thời gian chơi thật (không tính lúc dừng), `stars`/`hints_used`/`score` điền khi trò có.
- Trò lau bảng (để chứng minh khung): giữ chuột trái di trên vùng bảng, bán kính cọ 8% chiều rộng vùng; xong khi phủ ≥ 90%; 3 sao nếu ≤ 10 giây, 2 sao nếu ≤ 16 giây, còn lại 1 sao; không có thua.
- Giao diện: lớp 2D phủ lên cảnh 3D, nền sáng, góc bo, font Nunito, chữ to — theo GDD `00` §7.4. Không chặn `Esc`.
- Giới hạn: không thêm thư viện; không sửa `questEngine.ts`; không viết thoại thật (dùng `[PLACEHOLDER]`).

### TIÊU CHÍ NGHIỆM THU
```bash
npx tsc --noEmit && npm test && npm run validate:world
npm run dev   # mở /?play=1&day=d.g06.01
```
- Chơi lại từng bước: vào Trang 1 → tới bước lau bảng → **màn luật hiện ra** → chơi → phủ ≥ 90% → **thẻ kết quả có số sao** → bấm **Chơi lại** chơi được ván nữa → bấm **Tiếp tục** thì quest sang bước kế. Bấm **Esc** giữa ván: đồng hồ dừng, mở lại chơi tiếp được. Bấm **Bỏ ván**: hiện kết quả thua, quest **vẫn** sang bước kế.
- Test đơn vị: `finish({result:'lose'})` vẫn gọi `engine.complete`; lần chơi thứ hai không ghi lại `minigames_story`; `validateContent` báo lỗi khi `game` không có trong sổ đăng ký.
- Bằng chứng cần lưu: ảnh chụp 3 màn (luật, đang chơi, kết quả) vào `docs/images/`, kết quả 3 lệnh trên vào mô tả commit.
- Task kế tiếp: **T-07**.

---

## T-05 · Khung dữ liệu Trang 2 và Trang 3

### MỤC TIÊU
- ID: **T-05**. Agent: **Claude Code**.
- Vấn đề thấy được trong game: bản đo cần đủ 4 Trang nhưng chỉ có 2 Trang tồn tại (`d.g06.01`, `d.g07.03`). Chọn kỷ vật thứ hai trong Hộp là không có gì xảy ra.
- Kết quả phải bàn giao: hai file Ngày mới đúng schema, đủ kỷ vật – quest – mảnh ký ức – ô Album – Present-day Event, chơi xuyên suốt 4 Trang được với nội dung `[PLACEHOLDER]`; **đồng thời là file mẫu để Gemini đổ nội dung thật ở T-06**.

### FILE TÁC ĐỘNG
- Nhánh `feat/sprint-0412` (sau T-02).
- Đọc trước: `README.md` mục **"Thêm một Ngày ký ức mới"** (6 bước, là hướng dẫn chuẩn) · `docs/PAGE_DATA_GUIDE.md` · `src/content/days/d_g06_01.ts` (mẫu) · `docs/gdd/01_NARRATIVE_AND_SCENES.md` Trang 2 và Trang 3 · `docs/gdd/00_MASTER_GDD.md` §5.3 (đường đi theo Trang).
- Dự kiến sửa: `src/content/pack.ts` (`DAYS`) · `src/content/release.ts` · `src/content/chapters.ts` · `src/content/hub.ts` (thêm PDE `RESTORE` + `SHELF` cho hai Trang) · `src/content/base.ts` (biến thể bản đồ nếu cần).
- File mới: `src/content/days/d_g07_01.ts` (Thuyền giấy dưới mái hiên) · `src/content/days/d_g07_02.ts` (Căn cứ bí mật).

### YÊU CẦU KỸ THUẬT CHI TIẾT
- Theo đúng 6 bước trong `README.md`. ID phải khớp mẫu: Trang `d.g07.01` / `d.g07.02`; quest `q_m1_main_NN` / `q_m1_side_NN`; bước `<quest_id>.sNN`; kỷ vật `art_m1_NN`; mảnh `frag.<ngày>.NN`; ô Album `alb.<ngày>.NN`.
- Trang 2 dùng khu **Z02b** (mái hiên + rãnh nước) theo GDD `00` §5.3; Trang 3 đi **Z02 → góc sân sau → Z05**. Chỉ dùng vai `NPC_A…NPC_D`, **không** ghi thẳng `chr_*`.
- Mỗi Trang: đúng **một** kỷ vật dẫn vào, `appear_when` = xong Trang trước; ít nhất một ô Album `required_for_restore: true`; Side/Daily phải `blocks_main: false` và bước đầu thuộc `talk | interact | goto | collect | place` (luật mới ở T-02).
- Bước minigame khai bằng `game_id` của sổ đăng ký T-03 (ví dụ `mg_boat_race`, `mg_build_base`), **chưa cần trò thật** — khung sẽ hiện màn luật `[PLACEHOLDER]`.
- Mọi chữ ghi `[PLACEHOLDER]` + nhãn `AI_PROPOSED`. Nếu bản đồ thiếu marker (`itr.thcs.gutter_water`, `cam.thcs.*`…) thì **thêm vào `src/world/maps/map_thcs.world.json` bằng đúng quy trình ở `docs/HOW_TO_EXPAND_WORLD.md`**, không đặt tọa độ cứng trong file nội dung.

### TIÊU CHÍ NGHIỆM THU
```bash
npm test                  # validator 0 lỗi về ID và tham chiếu
npm run validate:world    # 0 lỗi
npm run dev               # /?play=1&day=d.g07.01   và   /?play=1&day=d.g07.02
npm run test:e2e          # bot chơi hết 4 Trang
```
- Chơi lại: từ phòng 2026 chơi liền 4 Trang, mỗi lần xong thì **một trang Album hiện rõ** và **kỷ vật kế tiếp sáng lên**; tải lại trang giữa Trang 2 thì đứng lại đúng khu.
- Bằng chứng cần lưu: kết quả `npm test`, `validate:world`, và nhật ký bot e2e.
- Task kế tiếp: **T-06** (Gemini) và **T-07** (Claude Code) chạy song song.

---

## T-06 · Số hóa kịch bản Trang 1–4 thành dữ liệu (Gemini Pro)

### MỤC TIÊU
- ID: **T-06**. Agent: **Gemini Pro**. Trạng thái: **đang chờ T-05** (cần file mẫu và schema chốt).
- Việc: biến kịch bản chữ thành dữ liệu để game đọc, cho **Trang 1 → Trang 4** (Mốc 1). Không làm Trang 5–9 trong đợt này.
- Kết quả phải bàn giao: 4 file `.ts` theo đúng mẫu, nội dung thật thay `[PLACEHOLDER]`, kèm bảng đối chiếu "câu nào trong kịch bản → bước nào trong dữ liệu".

### FILE TÁC ĐỘNG
- Kịch bản nguồn (nguyên văn, **thắng file 01 khi khác nhau**): `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` phần MỞ ĐẦU và Trang 1–4.
- Mô tả cảnh theo bước: `docs/gdd/01_NARRATIVE_AND_SCENES.md` §4 (MỞ ĐẦU, Trang 1–4), §2.3 (**quy tắc xưng hô** — bắt buộc tuân theo), §5.1 (kỷ vật), §6 (trang Album), §7 (lựa chọn cần lưu).
- Luật chơi của từng trò: `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §2.4.1–2.4.6.
- Schema và file mẫu: `docs/PAGE_DATA_GUIDE.md` · `README.md` mục "Thêm một Ngày ký ức mới" · `src/content/days/d_g06_01.ts` · `src/content/types.ts` (kiểu `Step`, `Quest`, `DialogueLine`).
- File phải nộp: `src/content/days/d_g06_01.ts`, `d_g07_01.ts`, `d_g07_02.ts`, `d_g07_03.ts` (ghi đè bản `[PLACEHOLDER]`).

### YÊU CẦU KỸ THUẬT CHI TIẾT
- **Quy tắc ID (không được đổi):** Trang `d.gNN.KK` · quest `q_m1_<main|side|daily|event>_NN` · bước `<quest_id>.sNN` · kỷ vật `art_m1_NN` · mảnh `frag.<ngày>.NN` · ô Album `alb.<ngày>.NN` · điểm tương tác `itr.<map>.<tên>` · máy ảnh `cam.<...>.<...>`. **ID đã phát hành thì không đổi.**
- Chỉ dùng vai `NPC_A` (Đức), `NPC_B` (Châu), `NPC_C` (Hạ), `NPC_D` (Quân) — **không** ghi `chr_duc`. Tên Player chèn bằng mẫu `{player_name}`, không viết tên cụ thể.
- Ô thoại **tối đa 2 dòng mỗi lần**; bước `choice` có 2–3 lựa chọn; lựa chọn nào cần lưu thì theo danh sách `01` §7, còn lại chỉ đổi lời tại chỗ.
- Mỗi bước phải là một trong các loại có thật trong `types.ts`: `talk`, `goto`, `interact`, `choice`, `collect`, `place`, `photo`, `minigame`, `cutscene`, `free`, `setFlag`, `phone_ui`, `compose_message`, `album_restore`. **Không tự nghĩ loại bước mới** — nếu kịch bản cần thứ chưa có, ghi chú lại và dừng, đừng bịa.
- Nội dung đã được nhóm duyệt thì bỏ nhãn `AI_PROPOSED`; chỗ tự viết thêm thì **giữ nhãn** `AI_PROPOSED` để validator chặn khỏi bản production.
- Năm học: lớp 6 = **2014–2015** (CONFIRMED 20/11). Không dùng chi tiết văn hóa/công nghệ sau mốc thời gian của cảnh.
- Định dạng đầu ra: TypeScript đúng cú pháp, chạy được `npx tsc --noEmit`; mỗi file xuất đúng 5 thứ `day`, `quests`, `artifact`, `fragments`, `entries`.

### TIÊU CHÍ NGHIỆM THU
```bash
npx tsc --noEmit
npm test                 # validator kiểm ID, tham chiếu, trùng ID, nhãn ownership
npm run dev              # /?play=1&day=d.g06.01 … d.g07.03
```
- Đọc lại từng Trang trong game: thoại khớp kịch bản, xưng hô đúng `01` §2.3, không còn `[PLACEHOLDER]` trên đường Main của Trang 1–4.
- Bằng chứng cần lưu: bảng đối chiếu kịch bản → bước, nộp kèm trong `docs/handoff/`.
- Task kế tiếp: **T-08** (lời ba tin nhắn kết demo).

---

## T-07 · Tám trò K của Trang 1–4

### MỤC TIÊU
- ID: **T-07**. Agent: **Claude Code**. Phụ thuộc: **T-03**.
- Kết quả phải bàn giao: 8 trò chạy thật qua khung T-03, mỗi trò có luật, điều kiện xong, chấm sao hoặc thắng/thua theo GDD, và nút Chơi lại.

### FILE TÁC ĐỘNG
- Đọc trước: `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §2.4.1 (đá cầu), §2.4.2 (gấp và đua thuyền), §2.4.3 (bóp mì gói), §2.4.4 (lau bảng — đã làm ở T-03), §2.4.6 (giải mật lệnh, dựng Căn cứ, viết luật Căn cứ, xếp đội hình).
- File mới: mỗi trò một file trong `src/minigames/`, khai vào `registry.ts`.

### YÊU CẦU KỸ THUẬT CHI TIẾT
Thứ tự làm (dừng ở đâu cũng có thứ dùng được): **giải mật lệnh (K4)** → **đá cầu (K5)** → **bóp mì gói (K6)** → **dựng Căn cứ (K3)** → **viết luật Căn cứ (K4)** → **xếp đội hình (K3)** → **gấp và đua thuyền (K5, tốn công nhất)**.
Số liệu lấy **đúng** từ GDD: cửa sổ nhịp đá cầu ±80 ms / ±160 ms, thắng khi 10 lượt liên tiếp, thua khi hụt 3 lần; thuyền 3 kiểu gấp, vùng xanh 25% thanh lực, rãnh 12 m chạy 25–35 giây, **Quân luôn nhất và thuyền Đức luôn lật ngay khi thả**; bóp mì 3 sao ≤ 6 giây; mật lệnh nối 6 ký hiệu, nối sai thì Châu gợi ý, không có thua. Mọi con số để trong file cấu hình của trò, không rải trong logic.

### TIÊU CHÍ NGHIỆM THU
- `npx tsc --noEmit`, `npm test`, `npm run test:e2e` đạt; mỗi trò có ít nhất 1 test đơn vị cho điều kiện thắng/xong.
- Chơi lại từng trò qua `?play=1&day=<id>&step=<bước>`; kiểm đủ: thua vẫn đi tiếp · Bỏ ván vẫn đi tiếp · Chơi lại được · Esc dừng đồng hồ.
- Task kế tiếp: **T-08**.

---

## T-08 · Kết demo sau Trang 4 và form phản hồi thật

### MỤC TIÊU
- ID: **T-08**. Agent: **Claude Code** (lời tin nhắn: **Gemini Pro**).
- Vấn đề thấy được trong game: thẻ phản hồi cuối demo hiện ra **chỉ có một nút "Bỏ qua"**, không có câu hỏi nào và không có nơi ghi dữ liệu → mất bằng chứng kinh doanh của môn học. Ba tin nhắn kết còn mang nghĩa cũ (sau Trang 9) trong khi bản đo dừng ở Trang 4.
- Kết quả phải bàn giao: điểm dừng đúng sau Trang 4; ba tin nhắn kết mang nghĩa "nhớ hồi tụi mình mới đủ năm đứa"; form phản hồi có câu hỏi thật và ghi được vào Firestore; thứ tự "ghi hoàn thành **trước** form" không đổi.

### FILE TÁC ĐỘNG
- Dự kiến sửa: `src/content/release.ts` (khai bản `production`) · `src/content/hub.ts` (3 lựa chọn mở lời + `demo_end_lines`) · `src/ui/game/GameUi.tsx` (thẻ `feedback`) · `src/ui/game/store.ts` · `src/analytics/bridge.ts` (phát `feedback_submitted`) · `firestore.rules` nếu cần.
- File mới: `api/feedback.ts` (Vercel Function ghi vào collection `feedback` — hằng số đã có ở `api/_lib/firestore.ts:7`) · `tests/unit/feedback.test.ts`.
- Đọc trước: `docs/gdd/00_MASTER_GDD.md` §4 (khối CONFIRMED 21/11 về phạm vi) · `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §5.1 · `README.md` mục "Môi trường và dữ liệu" · `api/collect.ts` làm mẫu.

### YÊU CẦU KỸ THUẬT CHI TIẾT
- `production.memory_day_ids` = 4 Trang của Mốc 1, `end_day_id = 'd.g07.03'`, `end_step_id` giữ như bản test. **Chỉ khai khi T-06 đã bỏ nhãn `AI_PROPOSED`** — validator sẽ chặn nếu chưa.
- Form: tối đa 5 câu, mỗi câu **chọn sẵn** (không bắt buộc nhập chữ); nếu có một ô chữ tự do thì ghi rõ "không bắt buộc" và **không** gửi kèm bất cứ ID nào có thể lần ra người chơi. **Không** thu tên, email, IP.
- `api/feedback.ts` dùng lại cách kiểm và chống ghi trùng của `api/collect.ts` (`doc(id).create()`), ghi vào `COLLECTIONS.feedback`; hết hạn mức thì trả 429 để client gửi lại.
- Giữ nguyên thứ tự: `public_demo_completed` được ghi **trước** khi thẻ phản hồi hiện ra (hiện đúng ở `src/game/game.ts:380–390` — không được làm hỏng).
- Phát `feedback_shown`, `feedback_submitted`, `feedback_skipped` đủ cả ba.

### TIÊU CHÍ NGHIỆM THU
```bash
npm test                                     # có test cho api/feedback
npm run dev                                  # /?play=1&bot=release rồi xem màn kết
firebase emulators:start --only firestore --project demo-htx
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 GCLOUD_PROJECT=demo-htx npm run test:e2e
```
- Chơi lại: chơi hết 4 Trang → gửi tin nhắn → **thấy `public_demo_completed` trong Firestore trước** → form hiện ra → gửi form → có **một** document trong collection `feedback`, **không** chứa tên, email, IP, hay nội dung tin nhắn.
- Bằng chứng cần lưu: ảnh chụp document trong Emulator (đã che ID), kết quả e2e.
- Task kế tiếp: **T-09**, rồi **T-14**.

---

## T-09 → T-14 (ghi gọn, mở prompt đầy đủ khi tới lượt)

| ID | Việc | Ghi chú cho người làm |
|---|---|---|
| **T-09** | Phát các event còn thiếu | `free_photo_taken`, `feedback_submitted` hiện **có người nghe trong `src/analytics/bridge.ts` nhưng không ai phát**; `landing_view`, `cta_click` chưa có nơi phát (gắn ở `src/main.ts` trang chủ). **Bỏ `hub_opened`** khỏi đợt này — Khu Vui Chơi thuộc Mốc 2. Nghiệm thu: chơi một lượt với Emulator rồi đếm đủ loại event |
| **T-10** | Nhân vật GLB (hướng base mesh + xương chung) | Blender: thêm hệ số chuẩn hóa chiều cao vào `blender/character_prototype/factory/character_factory.py` (hiện mọi kích thước là số cứng), xuất 1 base + preset cho Player nam/nữ, Đức, Châu, Quân, Hạ; chiều cao **1,30–1,40 m** (lớp 6–7), **1,55–1,65 m** (lớp 8–9); gốc `min.y = 0`; giữ 20 xương + 16 hoạt ảnh; nhân vật chính ≤ 6.000 tam giác / 1,5 MB. Claude Code: viết `glbRigAdapter` cắm vào `DaySceneOptions.rigAdapter`, map 16 hoạt ảnh sang `Motion` của `src/actors/character/animate.ts`, kiểm bằng `checkAvatarHeight`. **Nhân vật dựng bằng code giữ làm dự phòng** |
| **T-11** | Cây và ghi công | `schoolyard_shade_tree.glb` hiện **trùng byte** với cây phượng (md5 `fc7a3c80…`) → dựng cây bàng tán tầng mới hoặc dùng `schoolyard_tropical_tree.glb`. Cây phượng 12.224 tam giác → giảm về ≤ 3.000 / 200 KB. Sửa `docs/ASSET_CREDITS.md` theo đoạn thay thế ở `DEMO_AUDIT.md` §6.1(3) và mang file này sang nhánh code |
| **T-12** | Phòng 2026 + 4 kỷ vật Mốc 1 | Theo `docs/gdd/03_ASSETS_AND_AUDIO.md` §2 và §5. Kỷ vật: mẩu giấy mật lệnh, thuyền giấy của Hạ, biển tên Căn cứ + sổ luật, ảnh nhóm bị ố |
| **T-13** | Hai lỗi asset trong code | Sửa gốc `prp_desk_2seat.glb` về `min.y = 0` (hiện −0,663). Sửa bẫy: `loadProp()` giữ cache theo URL và trả `clone(true)` dùng chung geometry, còn `World.dispose()` (`src/world/world.ts:199`) lại `dispose()` geometry → props Blender sẽ **mất ở lần vào Ngày thứ hai**. Hiện chưa nổ vì `loadProp` chỉ dùng ở `src/lab/yardScene.ts` |
| **T-14** | Dựng bản đo | Chạy e2e toàn tuyến; **đo FPS trên laptop thật** (Chrome headless vẽ bằng CPU, không dùng làm số đo); kiểm bản `test` và `production` tách đúng; kiểm bản production không lẫn công cụ test; mở Pull Request `feat/sprint-0412` → `dev`, rồi **xin chủ dự án duyệt** mới gộp `main`. Ghi nhật ký mỗi lần đưa lên production trong kỳ đo 05–15/12 |
| **T-15** | Mốc 2, sau 15/12 | Trang 5–9, Caro 12×12, Sudoku, Hòm thư Valentine (4 cảnh + 3 minigame), Tầng B (lật chai, bi ve, ô ăn quan, lò cò), Khu Vui Chơi Căn cứ. Thiết kế đã chốt đầy đủ trong `docs/gdd/` — không cần họp lại |
