# SPRINT_TASKS — backlog tới 04/12/2026

| Trường | Giá trị |
|---|---|
| Lập | 21/11/2026 (tối), sau kiểm toán `docs/handoff/DEMO_AUDIT.md` |
| Phạm vi | **Trọn Mốc 1 — Trang 1→4** (chủ dự án chốt 21/11 tối). Mốc 2 (Trang 5–9, Caro, Sudoku, Valentine) và Tầng B **lùi sau 15/12** |
| Baseline | code `feat/sprint-0412` @ `09204f5` · tài liệu `docs/sync-approved-gdd-v1` @ `c3eaa8b` |
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
