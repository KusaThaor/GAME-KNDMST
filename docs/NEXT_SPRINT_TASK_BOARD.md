# NEXT_SPRINT_TASK_BOARD — BẢNG VIỆC DUY NHẤT tới 04/12/2026 (bản gộp)

> **Cập nhật 26/11/2026:** bảng việc tới bản đo 05/12 nay là `docs/handoff/SPRINT_TASKS_2026-11-26.md` (sau Audit Đợt 1–3). Bảng dưới đây giữ làm lịch sử và tham chiếu thẻ N-xx.

| Trường | Giá trị |
|---|---|
| Ngày lập | 22/11/2026 (UTC+7) · gộp lần 2 cùng ngày, sau khi chủ dự án đồng ý các điểm cần xác nhận |
| Thay thế | `docs/handoff/SPRINT_TASKS.md` (T-01…T-15, 21/11) — chỉ còn là lịch sử; việc còn hiệu lực đã chuyển vào bảng này (Mục 0.3) |
| Nhánh gốc | `feat/sprint-0412` |
| Phạm vi | **Mốc 1 đầy đủ (Trang 1–4) + Mốc 2 chỉ tuyến Main (Trang 5–9) + kết demo bản 9 Trang** — quyết định Game Director 22/11 (`docs/GDD_FULL_REVIEW.md` mục VII) |
| Đọc kèm | `docs/GDD_FULL_REVIEW.md` (mục VII), `docs/BACKGROUND_AUDIT.md` |
| Hạn | Bản playtest **04/12/2026**; kỳ đo 05–15/12 |

**Cách dùng file này:** mỗi thành viên nhận một mã task ở Mục 1 → mở thẻ task ở Mục 2 → copy khối "Prompt" dán cho AI agent của mình. Mỗi task **chỉ sửa các file trong cột "File sở hữu"**; cần sửa file khác thì ghi vào phần "Ghi chú bàn giao" của PR, không tự sửa.

---

## Mục 0 — Đã chốt, đối chiếu hai bảng việc, phát hiện khi gộp

### 0.1 Các điểm chủ dự án đã đồng ý (22/11, "okie luôn")
Chủ dự án đồng ý toàn bộ điểm cần xác nhận ở bản trước. Chỗ nào bản trước còn hai phương án, mình lấy phương án **bám GDD / kịch bản gốc** (`CLAUDE.md`: "code lệch GDD thì GDD thắng"). Hiểu sai thì chỉ cần nói một câu — cột "Đụng tới" cho biết phải sửa ở task nào.

| Mã | Điểm | Đã chốt | Đụng tới |
|---|---|---|---|
| A3 | Chữ AG tự ghi "đã duyệt" | Phương án (a): **chấp nhận chữ hiện tại là bản chính thức** (A3-1, 4, 5, 7). `HUMAN_CANON` từ nay nghĩa là "chủ dự án đã duyệt". Các dòng còn lại: bảng 0.1b | N-01, N-08, N-20 |
| B8 | Nhóm chat cũ | Theo kịch bản: **không có dòng chat nào**, chỉ hiện "tin cuối đã từ rất lâu" (nhãn để trong `src/config/hub.ts`, không tự đặt ngày). Bốn dòng AG viết bị bỏ. Màn kết: "Đã gửi." → "(còn tiếp)"; câu cảm ơn của AG bỏ khỏi truyện | N-08, N-09 |
| B9 | Ba tin nhắn kết | Nguyên văn kịch bản 9 Trang (0.2) | N-08 |
| B9b | Tỉ số "4–3" | **Động**: lấy từ `caro.series` = `{quan, duc}`, bắt đầu 3–3 (GDD `02` §2.1; `01` dòng 339 viết sẵn `{quan}–{duc}`) | N-03, N-08, N-13, N-16 |
| D5 | Timeskip | Đặt **sau Trang 9, trước Kết demo Bước 1**. Lời nháp ở 0.2 được duyệt → nhãn `HUMAN_CANON`, bỏ tiền tố `[PLACEHOLDER]` (validator production bắt quest `event` phải `HUMAN_CANON`) | N-08 |
| A2 | Năm học | Giữ 2014–2016 (lớp 6–7), 2016–2018 (lớp 8–9). "2012 / 2014" chỉ là cách gọi Mốc, không đổi năm trong game | — |
| X-1 | Sửa `CLAUDE.md`, GDD `00` | Đồng ý → **N-00 đã làm xong** trong lần gộp này | N-00 ✅ |
| X-2 | D3 thay hướng base mesh | Đồng ý; không gộp `feature/asset-workshop` cho nhân vật; hết việc Blender | N-12, N-20 |
| X-3 | Căn cứ vào trong sân sau (BG-1) | Đồng ý | N-04 |
| X-4 | Thang cắt | Đồng ý (cuối Mục 1) + thêm điểm kiểm ở Mục 1.1 | — |

### 0.1b A3 — kết luận từng dòng
| # | Vị trí | Kết luận |
|---|---|---|
| A3-1 | Thoại Main 4 Trang (`meta` của `q_m1_main_01/02/03/05`) | Giữ `HUMAN_CANON` (chấp nhận bản đã chỉnh theo B1, B3, B5, B6) |
| A3-2 | 5 quest Side/Daily do AI nghĩ (`q_m1_side_01…04`, `q_m1_daily_01`) | → `AI_PROPOSED` + `[PLACEHOLDER]`, đổi mã `q_m1_ai_*`, **tắt ở production** (G-3). Trang 3 gỡ `side_04` (C2) |
| A3-3 | `hub.ts` — `q_hub_pd_01/02/03` | Theo B8/B9/D5 (0.2); nhãn `HUMAN_CANON` |
| A3-4 | Ghi chú và hình dán Album | Giữ |
| A3-5 | Lời ba lựa chọn kiểu ảnh Trang 4 | Giữ |
| A3-6 | Lời ba lựa chọn trang trí Trang 3 | Trả về chữ kịch bản: "Giấy màu" / "Hoa" / "Ảnh" (B5) |
| A3-7 | Tên và mô tả kỷ vật, câu nhắc `pde_03` | Giữ |
| A3-8 | Tài liệu AG ghi "v1.4 APPROVED", "0 PLACEHOLDER", "hoàn tất 100%" | Sửa cho đúng (C6): kịch bản là **v1.6-draft**, phần minigame **0%**. `DOI_CHIEU_TRANG_1_4.md` → N-01; `QUESTIONS_LOG.md`, `HANDOFF_TO_CLAUDE.md` → N-20 |

### 0.2 Văn bản đã chốt cho N-08 (dùng đúng chữ này, nhãn `HUMAN_CANON`, không `[PLACEHOLDER]`)

**B9 — ba tin nhắn kết (nguyên văn kịch bản 9 Trang, §KẾT DEMO Bước 2)**
- Rộn ràng (`playful`): "Ê. Ván caro hồi lớp 8 vẫn đang {quan}–{duc} đó nha. Ai gỡ?"
- Ấm áp (`gentle`): "Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?"
- Sâu lắng (`deep`): "Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha."
- Độc thoại trước khi mở điện thoại (Bước 1): **{player_name}**: "Được dời, không được hủy…"

`{quan}` / `{duc}` = số ván của phe Quân / phe Đức trong `caro.series` (bắt đầu 3–3; kết quả lần đầu của ván truyện đẩy một phe lên 4, hòa giữ 3–3). Chưa có kết quả → 3–3.

**B8 — nhóm chat cũ (Bước 2, mở điện thoại):** không dòng chat nào; một dòng trạng thái "tin cuối cùng đã từ rất lâu" (`old_chat_last_label` trong `src/config/hub.ts`). Kết: "Đã gửi." → "(còn tiếp)" → ghi hoàn thành → form phản hồi.

**D5 — timeskip (sau cutscene "Cuối hè" của Trang 9, trước Kết demo Bước 1):**
> *Thẻ chữ:* "Tám năm sau."
> *(Phòng 2026, đèn bàn. Album đã đủ trang.)*
> **{player_name}** (độc thoại): "Hồi đó tụi mình hứa mỗi tháng gặp nhau một lần…"
> **{player_name}** (độc thoại): "Lần cuối cả năm đứa ngồi chung với nhau là khi nào nhỉ?"
> → nối thẳng Kết demo Bước 1 (lấy sổ luật xuống, lật tới Điều 6).

Ghi chú: "hứa mỗi tháng gặp nhau" khớp Điều 6 ("Gặp nhau ít nhất mỗi tháng. Được dời, không được hủy.", kịch bản dòng 822). Quest `q_hub_pd_timeskip`: `type: 'event'`, `HUMAN_CANON`.

### 0.3 Đối chiếu bảng việc cũ (`SPRINT_TASKS.md`, 21/11) → bảng này
Tình trạng lấy từ phiên kiểm 22/11 00:15 (`feat/sprint-0412` @ `d5531b2`, đã chạy tsc / vitest / validate:world / e2e / build production). Từ đó tới nay **chỉ có tài liệu đổi** (kiểm bằng `git diff d5531b2..HEAD -- src api shared tests` = rỗng), nên tình trạng còn nguyên.

| Task cũ | Việc | Tình trạng | Nay là | Ghi chú gộp |
|---|---|---|---|---|
| T-01 | Gộp nhánh tài liệu + 5 sửa nhỏ | ✅ xong | — | Còn sót: chú thích "8 giây" ở e2e → N-19 |
| T-02 | Sửa A-01, thêm luật A-02 | ❌ chưa | **N-02** (A-01) + **N-10** (A-02) | Test đỏ trước khi sửa; cập nhật README + `02_QUEST_SYSTEM.md` §6; ca e2e A-01 (đã gộp vào thẻ N-02) |
| T-03 | Khung minigame chung | ❌ chưa | **N-02** + **N-11a** | Hợp đồng gộp T-03 + N-02 (G-5); trò lau bảng chứng minh khung nằm ở N-11a |
| T-04 | Mở rộng `SaveState`, v2→v3 | ❌ chưa | **N-03** | Tên trường bám GDD `02` §4.2 (G-4); thêm phần Mốc 2 Main vì A1 |
| T-05 | Khung dữ liệu Trang 2, 3 | ✅ xong | **N-01** sửa lại | Đã có `d_g07_01`, `d_g07_02`; N-01 đưa về đúng kịch bản |
| T-06 | Số hóa Trang 1–4 | ✅ xong (chủ dự án chấp nhận 22/11) | A3 đã chốt (a) + **N-01** | Nhãn chấp nhận; B1–D2 sửa ở N-01 |
| T-07 | 8 trò K Trang 1–4 | ❌ 0/8 | **N-11a** (4) + **N-11b** (4) | Bản N-11 cũ chỉ có 7 trò — thiếu **Xếp đội hình** (G-1), đã thêm `mg_lineup` |
| T-08 | Kết demo + form phản hồi | ⚠ dở | **N-08** (kết) + **N-09** (form) + **N-22** (production) | Ba tin kết đã mang nghĩa cũ "mới đủ năm đứa" → N-08 đổi sang bản 9 Trang |
| T-09 | Phát event còn thiếu | ❌ chưa | **N-18** | Bỏ `hub_opened` (Khu Vui Chơi bị cắt); giữ `landing_view`, `cta_click` (G-9) |
| T-10 | Nhân vật GLB base mesh | ⛔ thay thế | D3 → **N-12** (procedural) | Nhân vật giữ bản dựng bằng code; không gộp `feature/asset-workshop` |
| T-11 | Cây phượng/bàng + ghi công | ⛔ thay thế | D3 → **N-20** | Cây GLB mới không làm; chỉ còn `ASSET_CREDITS.md` |
| T-12 | Phòng 2026 + 4 kỷ vật bằng Blender | ⛔ thay thế | D3 → **N-08** (PX-50) | Kỷ vật: tái dùng hàm `makeXxx` của N-06 (PX-11/20/30/31), P2 |
| T-13 | Gốc bàn đôi + bẫy cache `loadProp` | ⚠ một nửa | **N-23** | Đo lại bàn bằng `Box3` trước (G-8); bẫy cache vẫn còn |
| T-14 | Dựng bản đo | ⚠ dở | **N-19** (e2e, FPS) + **N-22** (production, PR → `dev`) | 0 Pull Request, chưa đo FPS, production còn trống |
| T-15 | Mốc 2, sau 15/12 | → mở rộng | **N-13, N-15, N-16, N-17** (Main, A1); phần còn lại → Mục 4 | Side/Daily, Khu Vui Chơi, Tầng B vẫn sau 15/12 |

### 0.4 Phát hiện khi đối chiếu — đã sửa trong các thẻ bên dưới
| # | Phát hiện | Cách xử lý |
|---|---|---|
| G-1 | Trang 4 có minigame **Xếp đội hình** (K3, GDD `01` Trang 4 bước 1; `02` dòng 230) nhưng N-01 và N-11 bản trước không có | Thêm `mg_lineup` vào N-11b; N-01 chèn bước vào `d_g07_03.ts` |
| G-2 | Luật A-02 gốc (bước đầu Side/Daily **không thuộc** `talk/interact/goto/collect/place` thì quest lặng lẽ không khởi động) bị bỏ sót ở N-10 | N-10 giữ cả luật gốc lẫn luật marker |
| G-3 | Validator production (`validate.ts` dòng 267–275) chặn **mọi** quest `AI_PROPOSED` nằm trong `main_chain`, `side_quests`, `daily_pool` của Ngày phát hành, và chặn quest Main/Event không phải đúng `HUMAN_CANON`. Đổi Side/Daily sang `AI_PROPOSED` (C1) sẽ làm production **không build được**; câu nối `[PLACEHOLDER]` ở Mốc 2 cũng vậy | `filterPackForRelease` (N-15f) tắt `side_quests`/`daily_pool` ở production; N-10 cho validator bỏ qua chúng; N-15 **không thêm câu nối**; timeskip = `HUMAN_CANON` |
| G-4 | N-03 bản trước đặt `minigames_caro_series {player, opponent}`, `hub_unlocked` — lệch GDD `02` §4.2 (`caro.series {quan, duc}`, `hub.unlocked`) | Đổi theo GDD (thẻ N-03, N-13, N-16) |
| G-5 | Hợp đồng minigame hai bản khác nhau: đường dẫn (`src/minigames/` vs `src/game/minigames/`), `rules` (≤ 3 dòng vs chuỗi), kết quả `quit` vs `skipped`, Esc (dừng đồng hồ vs hỏi Bỏ qua) | Giữ đường dẫn N-02; `rules.lines ≤ 3`; dùng `MinigameResult` có sẵn trong `eventBus.ts` (`quit`); **Esc mở menu và dừng đồng hồ**, "Bỏ ván" = thua (GDD `02` §1.1); thêm `pause()/resume()` |
| G-6 | Mã trò lạ: T-03 muốn **lỗi**, N-10 muốn **cảnh báo** | Cảnh báo ở test (trò thật gộp dần), **lỗi** ở production |
| G-7 | Quest Daily `q_m1_daily_01` khai trùng ID ở cả 4 Trang; `pack.ts` gộp theo ID nên chỉ giữ bản Trang 4 | N-01 khai **một** lần (`q_m1_ai_daily_01` ở `d_g06_01.ts`), bỏ bản trùng |
| G-8 | Chiều cao bàn đôi: `DEMO_AUDIT` ghi `min.y = −0,663`, phiên kiểm 22/11 đo bằng `Box3` ra **0,0**; BG-5 trong `BACKGROUND_AUDIT.md` dựa số cũ | N-23 đo lại rồi mới bù (không sửa GLB, D3) |
| G-9 | N-18 vẫn liệt kê `hub_opened` dù Khu Vui Chơi bị cắt (A1); `landing_view`, `cta_click` của T-09 bị rơi | Sửa N-18 |
| G-10 | Mất khối "bản đo": PR → `dev`, kiểm production sạch công cụ test, nhật ký production (T-14) | Thêm **N-22** |
| G-11 | `docs/gdd/03_ASSETS_AND_AUDIO.md` vẫn mô tả đường Blender → GLB, trái D3 | N-20 ghi D3 và gắn SUPERSEDED |

---

## Mục 1 — Bảng tổng hợp task

Ký hiệu nhóm: **[Scene]** dựng cảnh/engine · **[Props]** đạo cụ procedural · **[Script]** nội dung, flag, dữ liệu · **[Web]** web/đo lường · **[Docs]** tài liệu.
Agent đề xuất: **AG** = Antigravity / Gemini 3.8 · **Codex** · **Sonnet** / **Opus** = Claude.

| Mã | Tên task · nhóm | Ưu tiên | Agent đề xuất | File sở hữu (chỉ task này được sửa) | Phụ thuộc | DoD (tiêu chí xong) |
|---|---|---|---|---|---|---|
| **N-00** | ✅ **XONG 22/11** — Ghi quyết định 22/11 vào tài liệu gốc · [Docs] | P0 | Claude (đã làm) | `CLAUDE.md`, `docs/gdd/00_MASTER_GDD.md`, `docs/handoff/README.md` | — | Đã ghi A1, D3, D5; dòng cũ gắn SUPERSEDED. Phần D3 còn lại trong `03_ASSETS_AND_AUDIO.md` → N-20 |
| **N-01** | Sửa dữ liệu Mốc 1 theo B/C/D đã chốt · [Script] | P0 | AG hoặc Sonnet | `src/content/days/d_g06_01.ts`, `d_g07_01.ts`, `d_g07_02.ts`, `d_g07_03.ts`, `tests/unit/contentPack.test.ts`, `docs/handoff/gemini/DOI_CHIEU_TRANG_1_4.md` | Marker của N-04 (dùng ID ở thẻ N-04) | tsc + vitest + validate xanh; B1, B2, B5, B6, B7, C1, C2, C4, C5, D1, D2 xong; C6 tài liệu khớp code; Trang 4 có bước Xếp đội hình `mg_lineup` (G-1); Daily khai **một** lần (G-7); mọi Side/Daily gắn `AI_PROPOSED` |
| **N-02** | Khung minigame chung + sổ đăng ký trò + sửa lỗi A-01 · [Scene] | P0 | Opus hoặc Codex | `src/game/game.ts`, `src/game/minigames/{types,registry,host}.ts` (mới), `src/ui/game/MinigameFrame.tsx` (mới), `src/ui/game/GameUi.tsx` (vùng minigame), `src/ui/game/store.ts`, `tests/unit/minigameHost.test.ts` (mới) | — | Trò mẫu `mg_demo` chạy: luật (bỏ qua được từ lần 2) → chơi → kết quả → Chơi lại / Đi tiếp; Esc dừng đồng hồ; Bỏ ván = thua vẫn đi tiếp; event `minigame_started/finished` đúng kết quả thật; A-01 có test **đỏ trước, xanh sau** |
| **N-03** | Lưu bản v3 + bước chuyển đổi v2→v3 · [Scene] | P0 | Codex | `src/core/save.ts`, `tests/unit/save.test.ts` | — | Bản lưu v2 nâng lên v3 **không mất** tiến trình/ảnh; có `minigames`, `minigames_story`, `caro.series {quan,duc}`, `sudoku`, `story.valentine`, `hub.unlocked`, `settings` mới theo GDD `02` §4.2; `LoadStatus` có `'migrated'` |
| **N-04** | World Extras + sửa Căn cứ trong trường + marker/camera mới + điểm gắn đồ trang trí · [Scene] | P0 | Opus | `src/world/extras.ts` (mới), `src/world/maps/map_thcs.extras.ts` (mới), `src/world/world.ts`, `src/world/types.ts`, `src/world/validate.ts`, `src/game/scenes/dayScene.ts`, `src/world/dressing/index.ts` (mới), `src/world/atmosphere.ts` (mới, stub), `tests/unit/world/extras.test.ts` (mới) | — | `validate:world` 0 lỗi kể cả marker code; đi được sân → sân sau → Căn cứ không qua cổng; ảnh thuyền và biển tên đúng chỗ; stub `dressing`/`atmosphere` đẩy lên **trong ngày đầu** |
| **N-05** | Ánh sáng, thời tiết, biến thể năm học · [Scene] | P0 | Codex hoặc AG | `src/world/variants.ts`, `src/world/atmosphere.ts` (điền), `src/render/fx.ts`, `src/world/sky.ts`, `src/content/base.ts`, `src/content/types.ts` (chỉ thêm trường tùy chọn), `tests/unit/fx.test.ts` | Stub của N-04 | 7 preset mới; mưa + cầu vồng đổi được giữa Trang; g07_end/g08/g09/g09_end; nhân vật lớp 8–9 cao đúng dải |
| **N-06** | Đạo cụ procedural Mốc 1 (PX-10…41) + bộ trang trí Căn cứ theo flag · [Props] | P0 | AG | `src/world/props/m1/*.ts` (mới), `src/world/dressing/sets/m1_*.ts` (mới), `tests/unit/props_m1.test.ts` (mới) | Stub `dressing` của N-04 | Mọi hàm `min.y ≈ 0`, đúng ngân sách tam giác; Căn cứ đổi theo `m1.base_decor` |
| **N-07** | Vành nền phố + mặt đất mở rộng (PX-02, PX-03) · [Props] | P0 | AG hoặc Codex | `src/world/backdrop/*.ts` (mới), `src/world/dressing/sets/backdrop.ts` (mới), `tests/unit/backdrop.test.ts` (mới) | Stub `dressing` của N-04 | ≤ 25.000 tam giác, ≤ 12 lượt vẽ thêm; không va chạm; không thấy khoảng trống ngoài tường từ mọi khu |
| **N-08** | Phòng 2026: ấm từ đầu, đồ trong phòng, chuyển Mốc, timeskip, kết demo 9 Trang · [Script] | P0 | Sonnet | `src/content/hub.ts`, `src/config/hub.ts`, `src/game/scenes/hubScene.ts`, `tests/unit/hub.test.ts` | — (0.2 đã duyệt) | BG-4, B10 xong; hộp phấn + "Mấy năm sau…"; timeskip và 3 tin kết đúng chữ ở Mục 0.2 (nhãn `HUMAN_CANON`); không còn dòng chat AG; tỉ số caro động |
| **N-09** | Form phản hồi thật + endpoint Firestore · [Web] | P0 | Codex | `src/ui/game/FeedbackForm.tsx` (mới), `api/feedback.ts` (mới), `api/_lib/firestore.ts`, `firestore.rules`, `src/ui/game/GameUi.tsx` (**chỉ** khối `s.feedback`), `tests/unit/feedback.test.ts` (mới) | Gộp sau N-02 (cùng sửa `GameUi.tsx`) | Gửi được 5 câu hỏi; ghi hoàn thành **trước** form; không gửi tên/email/IP; phát đủ `feedback_shown/submitted/skipped`; test với Firestore Emulator |
| **N-10** | Validator: chặn quest phụ không khởi động được (A-02) + kiểm bản production · [Script] | P0 | Codex | `src/content/validate.ts`, `tests/unit/validate.test.ts` | — | Luật `optional_quest_unstartable` (A-02 gốc + marker); `minigame_unknown_id` = cảnh báo ở test, **lỗi** ở production; production báo từng quest `AI_PROPOSED` bị chặn |
| **N-11a** | 4 trò Trang 1: mật lệnh K4, đá cầu K5, lau bảng K6, bóp mì K6 · [Scene] | P0 | Codex hoặc Opus | `src/game/minigames/games/{mg_cipher,mg_footbag,mg_wipe_board,mg_noodle}.ts` (mới), `tests/unit/mg_trang1.test.ts` (mới) | N-02 | 4 trò có luật, thắng/thua, Chơi lại, Bỏ qua; không chặn truyện |
| **N-11b** | 4 trò Trang 2–4: thả thuyền K5, dựng Căn cứ K3, viết luật K4, **xếp đội hình K3** · [Scene] | P1 | Codex | `src/game/minigames/games/{mg_boat,mg_base_build,mg_rules,mg_lineup}.ts` (mới), `tests/unit/mg_trang24.test.ts` | N-02 | Như N-11a; ghi `minigames_story.boat` |
| **N-12** | Người lớn + học sinh nền procedural (PX-70) · [Props] | P1 | Codex | `src/actors/character/presets.ts`, `src/actors/character/build.ts`, `tests/unit/rigAdapter.test.ts` | — | Cô Diệp, bác bảo vệ, chú tạp hóa, Tú, 4 học sinh nền; người lớn 1,55–1,70 m |
| **N-13** | Đạo cụ procedural Mốc 2 (PX-51…67) + bộ trang trí đêm Hội trại · [Props] | P1 | AG | `src/world/props/m2/*.ts` (mới), `src/world/dressing/sets/m2_*.ts` (mới), `tests/unit/props_m2.test.ts` | N-04, N-05 | Như N-06; đêm Hội trại có lửa + đèn dây |
| **N-14** | Ảnh tự sướng 3 lần chọn 1 (Trang 1) + ảnh cầu vồng lên bìa Album · [Scene] | P1 | Opus | `src/game/game.ts` (hàm `runPhoto`), `src/systems/album.ts`, `src/ui/game/GameUi.tsx` (vùng ảnh) | Gộp sau N-02, N-09 | Giữ được 1/3 ảnh vào `album.selected`; bìa Album hiện ảnh cầu vồng |
| **N-15a…e** | Số hóa **Main** Trang 5, 6, 7, 8, 9 (mỗi Trang một task) · [Script] | P1 | AG hoặc Sonnet | a: `src/content/days/d_g08_01.ts` · b: `d_g08_02.ts` · c: `d_g09_01.ts` · d: `d_g09_02.ts` · e: `d_g09_03.ts` (đều mới) | N-04 (marker), N-11 (mã trò) | Chép nguyên văn kịch bản; chỉ Main; Side = 0; bước trò dùng mã ở thẻ N-15 |
| **N-15f** | Tích hợp Mốc 2 vào gói nội dung · [Script] | P1 | Sonnet | `src/content/pack.ts`, `src/content/release.ts`, `src/content/chapters.ts`, `tests/unit/analyticsBridge.test.ts` | N-15a…e | Bản test chạy Trang 1→9; `end_day_id = 'd.g09.03'`; `pack.ts` có `filterPackForRelease` tắt Side/Daily ở production (G-3) |
| **N-16** | Trò Mốc 2 bản tối thiểu: Caro (1 mức AI), Sudoku (3 đề), Ném bóng, Săn góc ảnh, Trang trí Căn cứ · [Scene] | P1 | Codex / Opus | `src/game/minigames/games/{mg_caro,mg_sudoku,mg_throw,mg_photo_hunt,mg_decorate}.ts` (mới) + test | N-02, N-03 | Có nút Bỏ qua; ghi `minigames.caro.series` |
| **N-17** | Màn 2D Mốc 2: trang confession, làm hòm thư, viết/đọc thư · [Web] | P1 | Sonnet | `src/ui/game/screens/*.tsx` (mới) | N-02 | Mở/đóng bằng Esc; không chặn Main khi lỗi |
| **N-18** | Phát các event còn thiếu (`free_photo_taken`, `feedback_submitted`, `landing_view`, `cta_click`; **bỏ `hub_opened`**) · [Web] | P2 | Codex | `src/analytics/*`, `src/main.ts`, `shared/events.ts` | N-02, N-14 | Mọi event có người nghe đều có người phát; đếm đủ loại event sau một lượt chơi với Emulator |
| **N-19** | Cập nhật e2e 9 Trang + đo FPS trên laptop thật · [Web] | **P0 (cổng cuối)** | Người + Sonnet | `tests/e2e/*.spec.ts` | Hầu hết task P0, P1 | `npx playwright test --workers=1` đạt trên máy thật; FPS ghi vào handoff |
| **N-20** | `docs/ASSET_CREDITS.md`, cập nhật `DEMO_AUDIT.md`, D3 trong GDD `03`, sửa câu "100%" của AG · [Docs] | P2 | Sonnet | `docs/ASSET_CREDITS.md` (mới), `docs/handoff/DEMO_AUDIT.md`, `docs/gdd/03_ASSETS_AND_AUDIO.md`, `docs/handoff/gemini/{QUESTIONS_LOG,HANDOFF_TO_CLAUDE}.md` | — | Ghi nguồn 7 GLB + "procedural, tự làm"; GDD `03` ghi D3, đường Blender → GLB gắn SUPERSEDED; A3-8 xong |
| **N-21** | Thẻ minh họa 2D "ba cổng trường" (PX-80) + ảnh in dán tường Căn cứ (PX-42) · [Props] | P2 | AG | `src/ui/game/screens/ThreeGates.tsx` (mới), `src/world/props/m1/printedPhotos.ts` (mới) | N-17, N-06 | — |
| **N-22** | **Dựng bản đo**: khai `production`, PR → `dev`, nhật ký production · [Web] | **P0 (cổng cuối)** | Sonnet + chủ dự án | `src/content/release.ts` (chỉ khối `production`), `docs/DEV_SESSION_HANDOFF.md` (nhật ký) | N-01, N-08, N-09, N-10, N-15f, N-19 | `production`: 9 Trang, `end_day_id: 'd.g09.03'`; validator production 0 lỗi; build production sạch công cụ test; PR `feat/sprint-0412` → `dev` mở; **chủ dự án duyệt** rồi mới gộp `main` |
| **N-23** | Vá bẫy cache `loadProp` + đo lại bàn đôi · [Scene] | P2 | Sonnet | `src/render/assets.ts`, `src/world/world.ts` (chỉ `dispose`) | Gộp sau N-04 | Vào hai Ngày liền không mất props GLB; kết luận đo bàn ghi vào PR (G-8) |

**Thứ tự gộp gợi ý:** N-04 (stub) → N-03, N-10 → N-02 → N-01, N-05, N-06, N-07, N-08 → N-09 → N-11a → (P1) N-11b, N-12, N-14, N-15a…e → N-15f, N-16, N-17, N-13 → N-19 → N-22.
**Thang cắt nếu trễ (cắt từ dưới lên — đã duyệt X-4):** N-21 → N-20 → N-17 (thay bằng thẻ thoại) → N-16 (chỉ giữ Caro) → N-13 (giữ hòm thư + lửa trại) → N-11b (rơi về thẻ khung giả). **Không cắt:** N-01…N-10, N-11a, N-15a…f, N-19, N-22.

### 1.1 Lịch và điểm kiểm (đề xuất, 12 ngày tới hạn 04/12)
| Ngày | Phải xong | Điểm kiểm |
|---|---|---|
| 22–23/11 | N-00 ✅; **N-04 bản khung đẩy lên**; N-03, N-10; N-01 chạy | Bản khung `dressing`/`atmosphere` đã ở `feat/sprint-0412` |
| 24–26/11 | N-02 gộp; N-04 đầy đủ; N-05, N-06, N-07, N-08 chạy | **26/11:** chơi tay trọn 4 Trang Mốc 1 (trò còn thẻ khung) |
| 27–30/11 | N-09, N-11a (+ N-11b); N-15a…e bắt đầu (cần marker N-04 và mã trò) | **30/11:** 4 trò Trang 1 chơi thật |
| 01–02/12 | N-15f, N-14, N-16, N-17, N-13 | **02/12: điểm cắt** — chủ dự án quyết cắt theo thang X-4 |
| 03/12 | N-19 (e2e + FPS laptop thật); N-22 khai `production`, mở PR → `dev` | Preview Vercel chơi thử từ đầu tới kết |
| 04/12 | Chủ dự án duyệt → gộp `main`; ghi nhật ký production | **Hạn bản playtest** |

---

## Mục 2 — Thẻ giao việc chi tiết

### 2.0 Quy chuẩn chung — áp dụng cho MỌI task (prompt nào cũng nhắc đọc mục này)
1. **Git:** tạo worktree riêng từ `feat/sprint-0412`, nhánh `task/<mã>-<tên-ngắn>`:
   `git fetch origin && git worktree add ../gk-<mã> -b task/<mã>-<tên> origin/feat/sprint-0412`.
   Không `push --force`, không gộp vào `main`, không đổi nhánh trong thư mục người khác đang dùng. Mở PR vào `feat/sprint-0412`.
2. **Chỉ sửa file trong cột "File sở hữu"** của task. Cần đổi file khác → ghi vào PR.
3. **Nội dung:** không tự viết cốt truyện/thoại thật. Chữ chưa duyệt ghi `[PLACEHOLDER]` và quest gắn `ownership_label: 'AI_PROPOSED'` (**lưu ý G-3:** validator production chặn mọi quest `AI_PROPOSED` trong Ngày phát hành và mọi quest Main/Event không phải `HUMAN_CANON`; Side/Daily bị tắt ở production bởi `filterPackForRelease`; **không thêm câu nối** vào quest Main). Thoại lấy **nguyên văn** từ `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md`; đổi `[PLAYER_NAME]` → `{player_name}`, `[ÔNG_BÀ]` → `{g:ông|bà}` (chỉ khi Châu gọi **Player**).
4. **3D (quyết định D3):** mọi asset mới dựng bằng **Procedural Three.js**; chỉ dùng lại GLB đã có ở `public/assets/`. Gốc **`min.y = 0`**, mét, Y lên, mặt trước +z. Vật liệu `toon()` từ `src/render/materials.ts`, màu từ `PAL` (`src/world/school/props.ts`). Texture canvas đặt `colorSpace = THREE.SRGBColorSpace`. Vật lặp ≥ 5 cái dùng **`InstancedMesh`**; đồ tĩnh gọi `mergeStatic()` (`src/render/merge.ts`). Đất/trời/hạt tắt viền: `material.userData.outlineParameters = { visible: false }`. Nhân vật đi qua `CharacterRigAdapter` (`src/actors/player/rigAdapter.ts`), cao lớp 6–7 1,30–1,40 m, lớp 8–9 1,55–1,65 m.
5. **Năm học canon:** Mốc 1 = lớp 6–7 (2014–2016), Mốc 2 = lớp 8–9 (2016–2018), 2026 = phòng Hub.
6. **Kiểm trước khi mở PR (bắt buộc, dán kết quả thật vào PR):**
   ```bash
   npx tsc --noEmit
   npm test                      # vitest
   npm run validate:world
   VERCEL_ENV=production npm run build
   ```
   Không ghi "đạt" cho lệnh chưa chạy. FPS chỉ đo trên laptop thật.
7. Commit nhỏ, thông điệp tiếng Việt hoặc tiếng Anh ngắn, kết bằng mã task, ví dụ `feat(world): thêm marker camera rãnh nước [N-04]`.

---

### N-00 · Ghi quyết định 22/11 vào tài liệu gốc — ✅ ĐÃ XONG (22/11)
Làm cùng lần gộp bảng việc này (chủ dự án đã đồng ý X-1, X-2). Đã sửa: `CLAUDE.md` (§1–§3, §5, §6), `docs/gdd/00_MASTER_GDD.md` (§1.2, §4, §7.3, §11 mục 8, 13–17, §12 changelog), `docs/handoff/README.md` (viết lại); `docs/handoff/SPRINT_TASKS.md` gắn SUPERSEDED. Lịch sử quyết định 21/11 được giữ, gắn SUPERSEDED. Phần D3 trong `docs/gdd/03_ASSETS_AND_AUDIO.md` còn lại → N-20.

### N-01 · Sửa dữ liệu Mốc 1 theo quyết định B/C/D
- **Mục tiêu & quy chuẩn:** đưa 4 Trang Mốc 1 về đúng kịch bản theo các mục đã chốt: **B1** (Trang 1 tách 2 cảnh, 6 bước), **B2** (lỗi xưng hô), **B3** (giữ thoại code — câu "Tớ ước… thuyền tớ đừng lật" đã không có, không cần làm), **B5** (Trang 3), **B6** (Trang 4 thêm ảnh cầu vồng + thẻ "Mấy hôm sau"), **B7** (nhãn ghế đá), **C1** (Side/Daily AI → `AI_PROPOSED`), **C2** (bỏ bắn bi khỏi Trang 3), **C4**, **C5**, **D1**, **D2**. C6: sửa tài liệu AG cho khớp code.
- **Đọc:** mục 2.0; `docs/GDD_FULL_REVIEW.md` mục IV-B, IV-C, VII; `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` dòng 64–327 (Mốc 1); `src/content/types.ts` (kiểu `Step`); 4 file Trang; `docs/PAGE_DATA_GUIDE.md`.
- **Việc cụ thể:**
  - `d_g06_01.ts` (**B1, B2**): `q_m1_main_01` thành 7 bước: `s01 talk` (Đức nhặt vở, tìm lớp — target bảng phân lớp `itr.thcs.class_list`) → `s02 minigame game:'mg_cipher'` + thoại mật lệnh/Châu sửa → `s03 minigame 'mg_footbag'` + thoại đá cầu → `s04 minigame 'mg_wipe_board'` + thoại trực nhật (Đức lỡ "mày–tao") → `s05 cutscene` thẻ chữ "Mấy tháng sau" → `s06 minigame 'mg_noodle'` tại `itr.thcs.grocery_steps` → `s07 photo mode:'handheld' camera_id:'cam.d0601.grocery'` (ảnh bộ ba). Câu Châu "Mới quen một bữa mà {g:ông|bà} mày tao rồi hả?" → **"Mới quen một bữa mà ông mày tao rồi hả?"**. Thoại giữ như code (B3), chỉ chia lại vào đúng bước.
  - `d_g07_01.ts`: `cameras` đổi marker `cam.d0701.boats` → `cam.thcs.gutter`; bước `s04` đổi thành `minigame 'mg_boat'` (giữ thoại kết quả). Giữ tông lựa chọn (C3 đã duyệt).
  - `d_g07_02.ts` (**B5, C2, D2**): thêm bước `collect` 3 điểm `itr.thcs.base_survey_roof`, `itr.thcs.base_survey_stump`, `itr.thcs.base_survey_boxes`; lời lựa chọn `c_m1_03_decor` trả về **"Giấy màu" / "Hoa" / "Ảnh"** (giữ `id` và `tone`); bước dựng `minigame 'mg_base_build'`; bước luật `minigame 'mg_rules'`; ảnh chính = biển tên: camera `cam.d0702.base` đổi marker → `cam.thcs.base_sign`, `at_step_id` là bước treo biển. Gỡ `q_m1_side_04` khỏi `side_quests` (giữ định nghĩa, đổi nhãn như C1).
  - `d_g07_03.ts` (**B6, B7, C4, C5, D1**): `art_m1_05.appear_when` → `{ day: 'd.g07.02' }`; flag `m1.placeholder_tone` → `m1.group_photo_style`; tách cutscene `s05` thành `s05 cutscene` (mưa, chạy về Căn cứ) → `s06 photo mode:'timer' camera_id:'cam.d0703.rainbow'` (ảnh cầu vồng, `album_entry_id: 'alb.d.g07.03.cover'`) → `s07 cutscene` thẻ chữ "Mấy hôm sau" + thoại dán ảnh. Hết Trang khi giữ ảnh cầu vồng. Không đổi thoại.
  - **C1** cả 4 file: hằng `sideMeta` → `{ owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0' }`; mọi `title`, `objective`, `text` của Side/Daily thêm tiền tố `[PLACEHOLDER] `; đổi mã `q_m1_side_0N` → `q_m1_ai_side_0N`, `q_m1_daily_01` → `q_m1_ai_daily_01` (cập nhật `pde_03` sẽ do N-08 làm — ghi vào PR).
  - **G-7 (Daily khai trùng):** `q_m1_ai_daily_01` chỉ khai **một** lần ở `d_g06_01.ts` (`daily_pool` của Trang 1); bỏ bản trùng ở `d_g07_01/02/03.ts` — hiện `pack.ts` gộp theo ID nên chỉ giữ bản Trang 4.
  - **G-1 (Xếp đội hình):** `d_g07_03.ts` chèn `minigame` `game: 'mg_lineup'` ngay **trước** bước `photo` hẹn giờ thứ nhất (GDD `01` Trang 4: Xếp đội hình → Hẹn giờ → Mưa → Cầu vồng → Mấy hôm sau); đánh lại số bước, cập nhật test.
  - `tests/unit/contentPack.test.ts`: cập nhật số bước, mã mới. `DOI_CHIEU_TRANG_1_4.md` §5: thay mô tả "lời hẹn năm lớp 8" bằng "kiểu ảnh đủ năm đứa", ghi các mã mới.
  - **Mã trò dùng chung (không đổi tên):** `mg_cipher`, `mg_footbag`, `mg_wipe_board`, `mg_noodle`, `mg_boat`, `mg_base_build`, `mg_rules`, `mg_lineup`.
  - **Marker mới (do N-04 tạo):** `itr.thcs.class_list`, `itr.thcs.grocery_steps`, `cam.thcs.grocery`, `cam.thcs.gutter`, `cam.thcs.base_sign`, `cam.thcs.rainbow`, `itr.thcs.base_survey_roof/stump/boxes`, `spot.thcs.eave_1…5`. Nếu N-04 chưa gộp: làm trước, gộp sau N-04.
- **DoD:** 4 lệnh ở 2.0 xanh; `validate` không còn lỗi nhãn; chạy `/?play=1` đi hết Trang 1→4 (trò hiện thẻ khung tạm nếu N-02 chưa xong).
- **Prompt:**
```
Bạn là agent nội dung (TypeScript) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-01 — làm ĐÚNG danh sách "Việc cụ thể", không thêm gì.
Tạo worktree nhánh task/N-01-sua-moc1 từ origin/feat/sprint-0412.
Chỉ sửa: src/content/days/d_g06_01.ts, d_g07_01.ts, d_g07_02.ts, d_g07_03.ts, tests/unit/contentPack.test.ts, docs/handoff/gemini/DOI_CHIEU_TRANG_1_4.md.
Thoại: KHÔNG viết câu mới. Chỉ chia lại thoại có sẵn trong code vào đúng bước; riêng lời lựa chọn Trang 3 đổi về "Giấy màu"/"Hoa"/"Ảnh", câu của Châu ở Trang 1 sửa "{g:ông|bà}" thành "ông". Side/Daily đổi nhãn AI_PROPOSED + [PLACEHOLDER] và đổi mã như thẻ ghi.
Dùng đúng mã trò (mg_cipher, mg_footbag, mg_wipe_board, mg_noodle, mg_boat, mg_base_build, mg_rules, mg_lineup) và mã marker trong thẻ.
Chạy: npx tsc --noEmit; npm test; npm run validate:world; VERCEL_ENV=production npm run build. Dán kết quả thật vào PR. Nếu validate báo thiếu marker vì N-04 chưa gộp, ghi rõ trong PR, không tự sửa file world.
Commit nhỏ, push, mở PR vào feat/sprint-0412.
```

### N-02 · Khung minigame chung + sổ đăng ký trò + sửa lỗi A-01
- **Mục tiêu & quy chuẩn:** thay thẻ giả 1 nút (`src/game/game.ts` khoảng dòng 178–186, `GameUi.tsx` khoảng 212–215) bằng khung thật theo GDD `02` §1.1: màn luật → chơi → kết quả (thắng/thua/hòa hoặc sao) → **Chơi lại** / **Đi tiếp**; luôn có **Bỏ qua** (thua/bỏ không chặn truyện). Trò là module độc lập, đăng ký tự động để nhiều người thêm trò song song không đụng nhau.
- **Đọc:** mục 2.0; `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §1, §2.4; `src/game/game.ts` (dòng 150–200, 440–480, 560–580); `src/ui/game/GameUi.tsx`; `src/ui/game/store.ts`; `shared/events.ts` (`minigame_started`, `minigame_finished`); `docs/handoff/DEMO_AUDIT.md` B-05 (A-01).
- **Việc:**
  - `src/game/minigames/types.ts` (**hợp đồng gộp T-03 + N-02, G-5**): `interface MinigameModule { id: string; title: string; kind: 'K1'|'K2'|'K3'|'K4'|'K5'|'K6'|'special'; rules: { lines: string[] /* tối đa 3 */; image?: string }; mount(el: HTMLElement, ctx: MinigameCtx): MinigameInstance }`; `interface MinigameInstance { dispose(): void; pause(): void; resume(): void }` (Esc gọi `pause()` để **đồng hồ dừng**); `MinigameCtx { onFinish(r: MinigameResult): void; seed: number; opponentId: string|null; difficulty: string|null; save: { get(key): unknown; set(key, v): void } }`; `MinigameResult { result: 'win'|'lose'|'draw'|'complete'|'quit'; score?: number; stars?: number; hints_used?: number }` — **dùng lại** kiểu `MinigameResult` đã có ở `src/core/eventBus.ts` (`quit` = Bỏ ván / Bỏ qua); **không** tạo giá trị `skipped`.
  - `registry.ts`: `const mods = import.meta.glob('./games/*.ts', { eager: true })` → `getMinigame(id)`; id lạ → trả `mg_fallback` (thẻ "Xong" như cũ) để không vỡ truyện.
  - `host.ts` + `src/ui/game/MinigameFrame.tsx`: khung 2D phủ màn (Preact), nền sáng, góc bo, chữ to (GDD `00` §7.4); nút "?" (Luật) / Chơi lại / Bỏ qua.
  - **Vòng đời bắt buộc (GDD `02` §1.1):** màn luật (bỏ qua được từ lần 2) → chơi → kết quả (Thắng / Thua / Hòa / Hoàn thành) → **Chơi lại** hoặc **Đi tiếp**. **Esc mở menu và dừng đồng hồ**; "Bỏ ván" nằm trong menu, tính là **thua** và vẫn đi tiếp. Mọi kết quả đều `engine.complete(step.id)` — thua không bao giờ chặn truyện. Kết quả **lần đầu** mới dùng cho thoại; chơi lại chỉ cập nhật bảng thành tích. `duration_s` không tính lúc dừng.
  - `game.ts`: nhánh `s.kind === 'minigame'` gọi host; phát `minigame_finished` với **kết quả thật**; ghi kết quả lần đầu vào `minigames_story[game_id]` và bảng `minigames` qua `recordMg()` của N-03 (nếu N-03 chưa gộp: tạm `save.flags['mg.<id>.result']`, ghi PR).
  - **A-01:** bước `goto` phải xong khi người chơi **đã đứng sẵn** trong bán kính hoặc vào bán kính lúc giao diện khóa — kiểm lại khi bước bắt đầu và khi mở khóa (khu vực `proximity()`).
  - Trò mẫu `src/game/minigames/games/mg_demo.ts` (bấm 3 lần là thắng) để test.
- **DoD:** unit test host (win/lose/quit/replay; lần chơi hai không ghi lại `minigames_story`), test A-01; 4 lệnh 2.0 xanh; e2e cũ không vỡ (chạy trên máy thật nếu có). A-01: test **đỏ trước khi sửa** (ghi kết quả đỏ vào PR); ca e2e: vào `d.g07.03` → Esc mở Menu → `__game.teleportTo('itr.thcs.gutter')` → đóng Menu → quest phụ sang bước kế mà không cần di chuyển; một bước `goto` không hoàn thành hai lần. Cập nhật `README.md` mục "Thêm một Ngày ký ức mới" và `docs/ai-handoff/02_QUEST_SYSTEM.md` §6 (ngoại lệ duy nhất ngoài cột "File sở hữu", cùng một ca trong `tests/e2e/game.spec.ts`).
- **Prompt:**
```
Bạn là agent engine (TypeScript, Preact, Three.js) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-02.
Tạo worktree nhánh task/N-02-khung-minigame từ origin/feat/sprint-0412.
Chỉ sửa/tạo: src/game/game.ts, src/game/minigames/{types,registry,host}.ts, src/game/minigames/games/mg_demo.ts, src/ui/game/MinigameFrame.tsx, src/ui/game/GameUi.tsx (chỉ vùng minigame), src/ui/game/store.ts, tests/unit/minigameHost.test.ts, và (ngoại lệ) một ca A-01 trong tests/e2e/game.spec.ts + README.md mục "Thêm một Ngày ký ức mới" + docs/ai-handoff/02_QUEST_SYSTEM.md §6.
Làm đúng hợp đồng trong thẻ (MinigameModule có rules.lines ≤ 3, MinigameInstance có pause/resume, MinigameCtx, MinigameResult dùng lại kiểu ở eventBus — không thêm 'skipped'), vòng đời theo GDD 02 §1.1 (Esc dừng đồng hồ, Bỏ ván = thua vẫn đi tiếp), registry dùng import.meta.glob('./games/*.ts', {eager:true}), id lạ rơi về mg_fallback. Thua hoặc Bỏ qua KHÔNG chặn câu chuyện. Phát minigame_started/minigame_finished với kết quả thật. Sửa lỗi A-01 (bước goto khi đã đứng sẵn trong bán kính) và viết test.
Chạy 4 lệnh kiểm ở mục 2.0, dán kết quả thật. Commit nhỏ, push, mở PR.
```

### N-03 · Lưu bản v3 + chuyển đổi v2→v3
- **Mục tiêu:** thêm trường GDD `02` §4.2 mà **không xóa** tiến trình người chơi (hiện tăng `SAVE_VERSION` là xóa sạch — B-07).
- **Đọc:** mục 2.0; `src/core/save.ts`; `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §4.
- **Việc (tên trường bám GDD `02` §4.2 — bản gộp T-04 + N-03, G-4):** `SAVE_VERSION = 3`; thêm
  - `minigames: Record<string, { wins: number; losses: number; draws: number; last_played: string | null }>` — khóa `{game_id}.{opponent_id}` (không đối thủ: `{game_id}.-`);
  - `minigames_story: Record<string, { result: 'win'|'lose'|'draw'|'complete'|'quit'; stars: number | null }>` — kết quả **lần đầu** của trò cốt truyện (`boat`, `footbag`, …), dùng cho thoại;
  - `caro: { series: { quan: number; duc: number }; story_result: { result: 'win'|'lose'|'draw'; opponent: string } | null }` — `series` bắt đầu **3–3**, chỉ đổi theo kết quả **lần đầu** (GDD `02` §2.1);
  - `sudoku: { best: Record<string, { time_s: number; stars: number }>; story_result: 'win'|'lose'|null }`;
  - `story: { valentine: { recipient?: string; kind?: string; groupMsg?: string; boxStyle?: string; branch_result?: string } }` — chỉ **mã** chọn sẵn, không chữ tự do;
  - `hub: { unlocked: boolean }`; `settings` thêm `volume`, `text_speed`, `difficulty`, `caro_rule`, `sudoku_mistake_mode` (GDD `02` §4.1).
  - Chưa thêm `minigames.bottle.*` (Tầng B, sau 15/12) nhưng cấu trúc phải mở rộng được mà không đổi schema.
  - `migrate(p: unknown): SaveState`: gặp `v: 2` → **chuyển đổi** (giữ `days`, `quests`, `flags`, `artifacts`, `album`, `relationships`, `phone`, `public_demo_done`, `player_name`; điền mặc định cho trường mới), không xóa; `v: 1` hoặc hỏng → xóa như cũ (`reset_old_version`); `LoadStatus` thêm `'migrated'`. **Ảnh trong IndexedDB không bị đụng.** Xuất `getMg(id, opp?)`, `recordMg(id, result, opp?)` (chỉ lần đầu mới ghi `minigames_story`).
  - Riêng tư giữ nguyên: không thêm trường nào chứa tên người chơi, chữ tự do hay nội dung tin nhắn.
- **DoD:** test đơn vị: JSON `v: 2` thật (dựng fixture từ một lượt chơi) → `status === 'migrated'`, giữ `days`, `album`, `flags`, `player_name`, trường mới có mặc định, `caro.series = 3–3`; `v: 1` → `reset_old_version`; bản rác → bản mới; `recordMg` lần hai không ghi đè `minigames_story`. 4 lệnh xanh. **Chơi lại thật:** chơi tới giữa Trang 1 bằng bản cũ, đổi sang bản mới, tải lại trang → còn đúng chỗ, Album không mất. Dán JSON trước/sau (đã bỏ tên người chơi) vào PR.
- **Prompt:**
```
Bạn là agent engine cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-03.
Worktree nhánh task/N-03-save-v3 từ origin/feat/sprint-0412. Chỉ sửa src/core/save.ts và tests/unit/save.test.ts.
Nâng SAVE_VERSION lên 3 với các trường trong thẻ, viết migrate() v2→v3 KHÔNG làm mất tiến trình/ảnh; chỉ xóa khi bản lưu hỏng. Viết test chuyển đổi. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-04 · World Extras + Căn cứ trong trường + marker mới + điểm gắn đồ trang trí
- **Mục tiêu & quy chuẩn:** cho phép thêm marker/collider/đồ vật **bằng code** (D3, không xuất lại Blender); sửa BG-1 (Căn cứ ngoài tường rào) và BG-2 (camera sai chỗ); tạo **điểm gắn chung** để N-05/N-06/N-07/N-13 làm song song mà không sửa `dayScene.ts`.
- **Đọc:** mục 2.0; `docs/BACKGROUND_AUDIT.md` (a2, b1, c); `src/world/world.ts`, `parse.ts`, `types.ts`, `validate.ts`, `collision.ts`, `dayBindings.ts`; `src/game/scenes/dayScene.ts`; `src/world/maps/map_thcs.index.json`; `tools/blender/world/gen_map_thcs.py` dòng 30–50 (bố cục).
- **Việc:**
  1. **Đẩy stub trong ngày đầu** (để task khác bắt đầu): `src/world/dressing/index.ts` — `export interface DressingCtx { scene: THREE.Scene; world: World; dayId: string; decor: DecorSet; flag(name: string): unknown; addUpdate(fn: (dt: number, t: number) => void): void }`; `export interface DressingSet { id: string; appliesTo(ctx): boolean; build(ctx): THREE.Object3D | Promise<THREE.Object3D> }`; tự nạp `import.meta.glob('./sets/*.ts', { eager: true })`; `mountDressing(ctx)` gắn mọi bộ hợp lệ, có `dispose`. `src/world/atmosphere.ts` — `createAtmosphere(scene, { sun, hemi, fx }) → { set(presetName, tweenSec?): void; update(dt): void; dispose(): void }` (stub chỉ đổi màu theo `LIGHTING_PRESETS`).
  2. `src/world/types.ts` + `extras.ts`: `interface WorldExtras { markers: Marker[]; colliders: ColliderShape[]; disableColliders: string[] }`; `applyExtras(world, extras)` chạy trong `loadWorld()` sau khi đọc GLB, trước `world.finish()`; trùng ID → `WorldProblem` lỗi.
  3. `src/world/maps/map_thcs.extras.ts`: marker mới (tọa độ khởi điểm, chỉnh khi chạy thử):
     | ID | Vị trí `[x, y, z]` | Ghi chú |
     |---|---|---|
     | `itr.thcs.class_list` | `[-6, 0, -20.4]` | Bảng phân lớp, hành lang |
     | `itr.thcs.grocery_steps` | `[-7.75, 0, 27.2]` | Trước tiệm tạp hóa |
     | `cam.thcs.grocery` + `.target` | `[-5.5, 1.6, 24.5]` → `[-7.75, 0.8, 27.6]` | Ảnh bộ ba |
     | `spot.thcs.eave_1…5` | z = −20,4; x = −16, −14,8, −13,6, −12,4, −11,2 | 5 chỗ đứng trú mưa |
     | `cam.thcs.gutter` + `.target` | `[-12, 2.0, -16.5]` → `[-14, 0, -18.1]` | Ảnh 5 thuyền |
     | `itr.thcs.base_survey_roof/stump/boxes` | `[46, 0, -32.5]`, `[41, 0, -25]`, `[49.5, 0, -26]` | 3 điểm khảo sát |
     | `cam.thcs.base_sign` + `.target` | `[45, 1.7, -23.5]` → `[45, 1.6, -30.5]` | Ảnh biển tên |
     | `cam.thcs.rainbow` + `.target` | `[4, 1.3, 10.5]` → `[4, 3.5, -10]` | Ảnh cầu vồng (gốc phượng) |
     | `spawn.thcs.backyard` | `[30, 0, -12]` | Vào sân sau từ sân |
  4. **BG-1 Căn cứ trong trường:** `disableColliders: ['wall_fence_east']` + thêm 2 collider tường thay thế để chừa lối x = 26, z −14…−10; thêm collider + hàng rào procedural chặn lối ngõ → bãi đất (x 31…35, z ≈ 18,6); tường rào procedural bao bãi đất + Căn cứ (cao 2,1 m, vật liệu `PAL.wall`), một nhà kho 4×3×2,6 m cạnh Căn cứ (≈ x 50, z −34). Hình tường/nhà kho đặt trong `src/world/dressing/sets/backyard.ts`.
  5. `dayScene.ts`: gọi `applyExtras` (qua `loadWorld` opts), `mountDressing(ctx)` và `createAtmosphere(...)` một lần; `dispose` khi rời Trang. **Không thêm logic khác vào file này.**
  6. `validate.ts`: `validate:world` đọc cả extras.
- **DoD:** `npm run validate:world` 0 lỗi; test extras (thêm/tắt collider, trùng ID); chạy thử đi sân → lối mới → bãi đất → Căn cứ; ảnh thuyền/biển tên nhìn đúng vật.
- **Prompt:**
```
Bạn là agent engine Three.js cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-04, docs/BACKGROUND_AUDIT.md mục (a2), (b1), (c).
Worktree nhánh task/N-04-world-extras từ origin/feat/sprint-0412.
BƯỚC 1 (đẩy PR nháp trong 2 giờ đầu): tạo src/world/dressing/index.ts và src/world/atmosphere.ts đúng interface trong thẻ, gắn vào src/game/scenes/dayScene.ts, chạy 4 lệnh kiểm, push.
BƯỚC 2: tạo src/world/extras.ts, src/world/maps/map_thcs.extras.ts (marker theo bảng trong thẻ), sửa src/world/world.ts, types.ts, validate.ts để gộp extras sau khi đọc GLB; làm BG-1 (mở lối sân → sân sau, chặn lối ngõ → bãi đất, tường rào + nhà kho procedural trong src/world/dressing/sets/backyard.ts); thêm tests/unit/world/extras.test.ts.
Không xuất Blender, không sửa GLB. Mọi vật procedural: min.y = 0, toon(PAL), InstancedMesh khi lặp, sRGB. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-05 · Ánh sáng, thời tiết, biến thể năm học
- **Mục tiêu:** đủ preset cho Mốc 1 + Mốc 2 Main; đổi thời tiết giữa Trang (Trang 4: mưa rào → cầu vồng); khai biến thể g08/g09; nhân vật lớp 8–9.
- **Đọc:** mục 2.0; `docs/BACKGROUND_AUDIT.md` (b3); `src/world/variants.ts`, `sky.ts`; `src/render/fx.ts`; `src/content/base.ts`; `src/world/atmosphere.ts` (stub của N-04); GDD `00` §7.2.
- **Việc:**
  - `variants.ts`: thêm preset `rain_overcast`, `rain_shower`, `after_rain_rainbow`, `dusk`, `night_campfire`, `golden_sunset` (giữ `morning_sun`, `late_afternoon`); thêm `DECOR_SETS` `g07_end` (bloom 0,7, puddles), `g08` (scarf true, bloom 0), `g09` (**scarf false**), `g09_end` (bloom 1,0). Màu: mưa vẫn sáng (exposure không dưới 0,95), đêm lấy lửa làm nguồn chính.
  - `fx.ts`: `addRain({ rate, area })` (hạt chỉ quanh camera, ≤ 1.500 hạt), `addCampfire(pos)` (lửa + tàn + `PointLight` cam nhấp nháy).
  - `sky.ts`: `rainbowArc()` (cung bán trong suốt, tắt viền, không sương), `starField()` (≤ 400 điểm).
  - `atmosphere.ts`: `set(preset, tweenSec)` tween màu trời/sương/hemi/sun bằng GSAP; bật/tắt mưa, cầu vồng, sao theo preset.
  - `types.ts`: thêm trường tùy chọn `MemoryDay.weather_by_step?: Record<string, string>` (bước bắt đầu → preset); `atmosphere` nghe event bắt đầu bước (đã có trong `eventBus`).
  - `base.ts`: `MAPS[0].variants` thêm `g07_end`, `g08`, `g09`, `g09_end`, `g08_night`… ; `CHARACTERS[*].age_variants.AGE_G8_9 = { rig_id: <như AGE_G6_7> }` (code rig tự cao theo `grade 9`).
- **DoD:** test fx (rain/campfire tạo và dispose sạch); test `checkAvatarHeight` lớp 9 đạt; chạy thử Trang 4 với `weather_by_step` thấy mưa → cầu vồng; 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent đồ họa Three.js cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-05, docs/BACKGROUND_AUDIT.md mục (b3).
Worktree nhánh task/N-05-anh-sang-thoi-tiet từ origin/feat/sprint-0412 (sau khi stub atmosphere.ts của N-04 đã có; nếu chưa, chờ hoặc rebase sau).
Chỉ sửa: src/world/variants.ts, src/world/atmosphere.ts, src/render/fx.ts, src/world/sky.ts, src/content/base.ts, src/content/types.ts (chỉ thêm trường tùy chọn weather_by_step), tests/unit/fx.test.ts.
Thêm 6 preset ánh sáng, 4 bộ trang trí, mưa (three.quarks, chỉ quanh camera), lửa trại, cầu vồng, sao; tween bằng GSAP. Phòng tối nhưng không u ám (GDD: tươi sáng, ấm). Tắt viền cho trời/hạt. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-06 · Đạo cụ procedural Mốc 1 + bộ trang trí Căn cứ theo lựa chọn
- **Mục tiêu:** dựng PX-10…PX-41 (`docs/BACKGROUND_AUDIT.md` mục d) bằng code; gắn vào cảnh qua `dressing/sets` (không sửa `dayScene.ts`).
- **Đọc:** mục 2.0; `docs/BACKGROUND_AUDIT.md` (b3, d); `src/world/school/props.ts` (mẫu `bench`, `phuongTree`, `PAL`, `box`); `src/render/canvasTex.ts`; `src/world/dressing/index.ts` (stub N-04); `src/world/maps/map_thcs.index.json` + `map_thcs.extras.ts` (tọa độ marker).
- **Việc:** mỗi nhóm đồ một file trong `src/world/props/m1/`: `classList.ts` (PX-10), `handProps.ts` (PX-11, PX-15), `footbag.ts` (PX-12), `chalkSmudge.ts` (PX-13 — texture canvas có hàm `erase(u, v, r)` cho trò lau bảng), `groceryFront.ts` (PX-14), `paperBoats.ts` (PX-20, InstancedMesh 5 thuyền, màu theo người), `gutterFlow.ts` (PX-21), `baseSign.ts` (PX-30, chữ "CĂN CỨ BÍ MẬT"), `ruleBook.ts` (PX-31), `baseDecor.ts` (PX-32: `makeBaseDecor('paper'|'flowers'|'photos')`), `surveySpots.ts` (PX-33), `rainbow` dùng của N-05. Bộ gắn: `dressing/sets/m1_common.ts` (bảng phân lớp, quả cầu, bậc thềm tạp hóa — mọi Trang Mốc 1), `m1_trang2.ts` (`appliesTo: dayId === 'd.g07.01'`), `m1_base.ts` (biển tên + sổ luật từ Trang 3; trang trí đọc `ctx.flag('m1.base_decor')` từ Trang 4 trở đi), `m1_trang4.ts`. Chữ trên biển/bảng là chữ trong kịch bản, không tự thêm.
- **DoD:** test mỗi hàm: `Box3.min.y` trong ±0,01, tam giác ≤ ngân sách bảng (d); `mergeStatic` cho đồ tĩnh; chạy thử thấy đủ đồ; 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent dựng đạo cụ 3D bằng code (Three.js procedural) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-06, docs/BACKGROUND_AUDIT.md mục (b3) và (d).
Worktree nhánh task/N-06-props-moc1 từ origin/feat/sprint-0412 (cần stub src/world/dressing/index.ts của N-04).
Chỉ tạo file mới trong: src/world/props/m1/, src/world/dressing/sets/m1_*.ts, tests/unit/props_m1.test.ts. KHÔNG sửa dayScene.ts hay file engine.
Mỗi asset là hàm export makeXxx(opts): THREE.Group, gốc min.y = 0, mét, mặt trước +z, vật liệu toon() + màu PAL, chữ bằng signTexture/canvasTexture (colorSpace sRGB), lặp ≥5 dùng InstancedMesh, đồ tĩnh mergeStatic, vật < 0,3 m tắt castShadow. Không xuất GLB, không dùng Blender. Bộ trang trí Căn cứ đọc flag m1.base_decor ('paper'|'flowers'|'photos').
Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-07 · Vành nền phố + mặt đất mở rộng
- **Mục tiêu:** hết khoảng trống ngoài tường rào; cảm giác thị trấn miền Nam 2014–2018.
- **Đọc:** mục 2.0; `docs/BACKGROUND_AUDIT.md` (a2, b2); `src/world/school/props.ts`, `classBlock.ts` (mẫu InstancedMesh); `src/world/dressing/index.ts`.
- **Việc:** `src/world/backdrop/instancing.ts` (helper gom vật theo vật liệu thành `InstancedMesh`); `townRing.ts`: `makeTownRing({ seed, bounds: [-34, -36, 52, 30] })` → nhà ống 2–3 tầng (khối + mái + ban công, 6 biến thể màu), cây (bàng, dừa, tre — tán khối), cột điện + dây (đường cong `TubeGeometry` mảnh), mái nhà xa; đặt trong dải 4–40 m ngoài mép, theo bảng (b2); `groundPlane(220)` dưới `y = −0.02`. Bảng hiệu tên tự nghĩ, không dùng thương hiệu thật. `dressing/sets/backdrop.ts`: `appliesTo: () => true`. Không collider, `castShadow = false` cho vật xa > 20 m.
- **DoD:** test: tam giác ≤ 25.000, số mesh sau gộp ≤ 12; ảnh chụp màn hình 4 hướng từ sân đính vào PR; 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent dựng nền 3D procedural (Three.js) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-07, docs/BACKGROUND_AUDIT.md mục (a2), (b2).
Worktree nhánh task/N-07-vanh-nen từ origin/feat/sprint-0412 (cần stub dressing của N-04).
Chỉ tạo: src/world/backdrop/*.ts, src/world/dressing/sets/backdrop.ts, tests/unit/backdrop.test.ts.
Dựng vành phố thị trấn miền Nam (nhà ống, cây, cột điện, dây, mái xa) quanh bản đồ x -34..52, z -36..30, cách mép 4–40 m, InstancedMesh, không collider, tắt bóng cho vật xa, mặt đất 220 m. Ngân sách ≤ 25.000 tam giác, ≤ 12 lượt vẽ. Tên bảng hiệu tự nghĩ. Chạy 4 lệnh kiểm, dán kết quả thật + ảnh 4 hướng, mở PR.
```

### N-08 · Phòng 2026 + chuyển Mốc + timeskip + kết demo bản 9 Trang
- **Mục tiêu & quy chuẩn:** **BG-4** (phòng ấm từ đầu), **B10** (mở thùng trước, độc thoại sau), đồ trong phòng PX-50, **chuyển Mốc** (ảnh lên bìa → thẻ "Mấy năm sau…" → hộp phấn sáng, mở Trang 5), **D5** timeskip (đã duyệt), **kết demo bản 9 Trang** theo bản B8/B9 đã duyệt ở Mục 0.2. Đổi mã `pde_03` theo C1.
- **Đọc:** mục 2.0; Mục 0.2 file này; kịch bản §MỞ ĐẦU, §Chuyển sang Mốc 2, §KẾT DEMO (dòng 47–62, 324–328, 859–874); `src/content/hub.ts`, `src/config/hub.ts`, `src/game/scenes/hubScene.ts`, `src/systems/hub.ts` (chỉ đọc).
- **Việc:** `config/hub.ts`: mọi `lighting_by_days_done` dùng một preset ấm; `hubScene.ts`: thêm đèn bàn, khung kính, khung ảnh tường, thảm, rèm, cửa sổ đêm (procedural, theo 2.0); `hub.ts`: đảo `q_hub_pd_01` (interact thùng trước, cutscene sau); thêm kỷ vật `art_m2_01` hộp phấn (`appear_when: { day: 'd.g07.03' }`, `target_memory_day_id: 'd.g08.01'`, shape mới `'box'` nếu cần thì ghi PR) và PDE thẻ "Mấy năm sau…"; chuỗi kết: `pde_06` đổi trigger sang `{ day: 'd.g09.03' }`; thêm quest `q_hub_pd_timeskip` (`type: 'event'`, cutscene đúng chữ Mục 0.2, nhãn **`HUMAN_CANON`** — validator production bắt quest `event` phải `HUMAN_CANON`) trước `q_hub_pd_02`; thêm bước sổ luật (độc thoại "Được dời, không được hủy…"); nhóm chat cũ **không có dòng chat** (chỉ nhãn "tin cuối đã từ rất lâu" lấy từ `src/config/hub.ts`); 3 tin kết đúng Mục 0.2, `{quan}–{duc}` lấy từ `caro.series` (mặc định 3–3); màn kết "Đã gửi." → "(còn tiếp)" (bỏ câu cảm ơn của AG).
- **DoD:** test hub (thứ tự mở đầu, kỷ vật hộp phấn sáng sau Trang 4, kết chỉ mở sau Trang 9); 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent nội dung + cảnh phòng 2026 cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0, Mục 0.2 và thẻ N-08.
Worktree nhánh task/N-08-hub-ket-demo từ origin/feat/sprint-0412. Chỉ sửa: src/content/hub.ts, src/config/hub.ts, src/game/scenes/hubScene.ts, tests/unit/hub.test.ts.
Làm đúng danh sách việc. Thoại lấy nguyên văn kịch bản docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md. Timeskip, ba tin kết và nhóm chat cũ đã được chủ dự án duyệt ở Mục 0.2 — dùng đúng chữ đó, nhãn HUMAN_CANON, không [PLACEHOLDER]; không viết thêm thoại nào khác; tỉ số caro lấy động từ caro.series.
Đồ trong phòng dựng procedural (min.y = 0, toon, sRGB). Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-09 · Form phản hồi thật + endpoint Firestore
- **Mục tiêu:** bằng chứng kinh doanh cho môn học (B-04). Giữ thứ tự **ghi hoàn thành trước form**; không gửi tên/email/IP.
- **Đọc:** mục 2.0; GDD `02` §5; `api/collect.ts`, `api/_lib/firestore.ts`, `firestore.rules`; `src/ui/game/GameUi.tsx` khối `s.feedback` (khoảng dòng 252); `src/analytics/tracker.ts`; `shared/events.ts`.
- **Việc:** `FeedbackForm.tsx`: 5 câu `[PLACEHOLDER]` tới khi nhóm gửi câu thật (thang 1–5 "Bạn thấy hoài niệm thế nào?", "Muốn chơi tiếp phần sau không?", chọn Trang thích nhất, có/không "giới thiệu cho bạn", 1 ô ý kiến ≤ 300 ký tự — **lọc số điện thoại/email trước khi gửi**); `api/feedback.ts` (POST, kiểm `attempt_id`, giới hạn kích thước, ghi `COLLECTIONS.feedback`); quy tắc Firestore chỉ cho server ghi; phát `feedback_submitted`; tách dữ liệu `test` và `production` theo `release_stage`.
- **DoD:** test API (hợp lệ, quá dài, có email bị lọc); 4 lệnh xanh; thử thật trên Vercel Preview ghi được 1 bản (ghi rõ đã/chưa thử). Thêm (từ T-08): tối đa 5 câu, câu nào cũng chọn sẵn; ô ý kiến ghi "không bắt buộc" và không gửi kèm ID lần ra người chơi; phát đủ `feedback_shown` / `feedback_submitted` / `feedback_skipped`; dùng lại cách chống ghi trùng của `api/collect.ts` (`doc(id).create()`); hết hạn mức → trả 429 để client gửi lại. Thử với Emulator: `firebase emulators:start --only firestore --project demo-htx` rồi `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 GCLOUD_PROJECT=demo-htx npm run test:e2e` — chơi hết demo → thấy `public_demo_completed` **trước**, rồi đúng **một** document `feedback` không chứa tên/email/IP/nội dung tin nhắn (ảnh chụp document đã che ID đính vào PR).
- **Prompt:**
```
Bạn là agent web (Preact + Vercel API + Firestore) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-09.
Worktree nhánh task/N-09-form-phan-hoi từ origin/feat/sprint-0412 (gộp SAU N-02 vì cùng sửa GameUi.tsx — chỉ sửa khối s.feedback).
Chỉ sửa/tạo: src/ui/game/FeedbackForm.tsx, api/feedback.ts, api/_lib/firestore.ts, firestore.rules, src/ui/game/GameUi.tsx (khối feedback), tests/unit/feedback.test.ts.
Câu hỏi để [PLACEHOLDER]. Không gửi tên, email, IP; lọc email/số điện thoại trong ô ý kiến. Ghi hoàn thành demo phải xảy ra trước khi mở form. Không dán khóa bí mật vào repo. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-10 · Validator A-02 + kiểm bản production
- **Đọc:** mục 2.0; `src/content/validate.ts` (khoảng dòng 130–170, 260–290); `docs/handoff/DEMO_AUDIT.md` B-06.
- **Việc:** (1) `optional_quest_unstartable` = **lỗi** khi quest `side`/`daily` có bước đầu **không thuộc** `talk | interact | goto | collect | place` (engine chỉ khởi động Side/Daily qua `trigger()` ở bước đầu — lỗi A-02 gốc, G-2) **hoặc** bước đầu trỏ marker không tồn tại / ngoài `open_zones` của Trang; (2) `minigame_unknown_id`: **cảnh báo** ở bản test (đối chiếu danh sách mã trò ở thẻ N-01, N-15, N-16 — trò thật gộp dần), **lỗi** ở bản production (G-6); (3) thông báo production liệt kê từng quest `AI_PROPOSED` bị chặn; (4) khi `filterPackForRelease` (N-15f) đã tắt Side/Daily cho production thì validator không đòi chúng `HUMAN_CANON` (G-3). Gói nội dung hiện tại phải **0 lỗi** sau khi thêm luật.
- **DoD:** test cho các luật trên — Side mở đầu bằng `cutscene` → có lỗi mới; gói hiện tại → 0 lỗi; 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent kiểm dữ liệu cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-10. Worktree nhánh task/N-10-validator. Chỉ sửa src/content/validate.ts và tests/unit/validate.test.ts. Thêm 3 luật như thẻ, viết test. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-11a · Bốn trò Trang 1 (P0) · N-11b · Bốn trò Trang 2–4 (P1)
- **Mục tiêu:** trò chơi thật theo GDD `02` §2.4 (luật, thắng/thua, Chơi lại), qua khung N-02. Thua không chặn truyện.
- **Đọc:** mục 2.0; `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §1, §2.4.1 (đá cầu), §2.4.2 (thuyền), §2.4.3 (bóp mì), §2.4.4 (lau bảng), §2.4.6 (mật lệnh, dựng Căn cứ, viết luật); `src/game/minigames/types.ts` (N-02).
- **Việc (mỗi trò một file trong `src/game/minigames/games/`, `export default` một `MinigameModule`):** N-11a: `mg_cipher` (K4 nối ký hiệu ↔ chữ, Châu gợi ý chỗ sai), `mg_footbag` (K5 canh nhịp chuyền cầu), `mg_wipe_board` (K6 giữ chuột lau, cọ 8% chiều rộng vùng bảng, xong khi phủ ≥ 90%, 3 sao ≤ 10 giây / 2 sao ≤ 16 giây / còn lại 1 sao, không có thua; dùng texture `chalkSmudge` nếu N-06 đã có, không thì vẽ canvas riêng), `mg_noodle` (K6 giữ tới khi đầy). N-11b: `mg_boat` (K5 nạp lực + thả đúng nhịp; Quân luôn nhất, thắng khi về đích không lật — GDD `01` §10 mục 12; lưu `minigames.boat.result`), `mg_base_build` (K3 kéo–đặt thùng/bàn), `mg_rules` (K4 ghi 5 điều theo lượt, chữ **nguyên văn** kịch bản), `mg_lineup` (K3 kéo 5 người vào 5 chỗ đứng trong khung ảnh, Trang 4 — đủ người, không che nhau, không có thua; G-1). Giao diện 2D trong khung, chữ to, nền giấy.
- **Số liệu (GDD `02` §2.4, để trong file cấu hình của từng trò, không rải trong logic):** đá cầu — cửa sổ nhịp ±80 ms / ±160 ms, thắng khi 10 lượt liên tiếp, thua khi hụt 3 lần; thuyền — 3 kiểu gấp, vùng xanh 25% thanh lực, rãnh 12 m chạy 25–35 giây, **Quân luôn nhất và thuyền Đức luôn lật ngay khi thả**; bóp mì — 3 sao ≤ 6 giây; mật lệnh — nối 6 ký hiệu, nối sai thì Châu gợi ý, không có thua. **Thứ tự làm** (dừng ở đâu cũng có thứ dùng được): mật lệnh → đá cầu → bóp mì → dựng Căn cứ → viết luật → xếp đội hình → thuyền (tốn công nhất).
- **DoD:** mỗi trò có ít nhất 1 test đơn vị cho điều kiện thắng/xong; chơi được bằng chuột + bàn phím; chơi lại qua `?play=1&day=<id>&step=<bước>`: thua vẫn đi tiếp · Bỏ ván vẫn đi tiếp · Chơi lại được · Esc dừng đồng hồ; 4 lệnh xanh.
- **Prompt (đổi danh sách trò theo N-11a / N-11b):**
```
Bạn là agent làm minigame (TypeScript + Preact/Canvas 2D) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-11, GDD docs/gdd/02_GAMEPLAY_AND_MECHANICS.md §1 và §2.4.
Worktree nhánh task/N-11a-tro-trang1 (hoặc N-11b) từ origin/feat/sprint-0412 SAU khi N-02 đã gộp.
Chỉ tạo file mới trong src/game/minigames/games/ (mỗi trò một file, export default MinigameModule) và tests/unit/mg_*.test.ts. Không sửa registry hay game.ts.
Làm các trò: <mg_cipher, mg_footbag, mg_wipe_board, mg_noodle> (hoặc <mg_boat, mg_base_build, mg_rules, mg_lineup>). Mỗi trò có luật hiển thị, thắng/thua, Chơi lại, Bỏ qua; thua không chặn truyện. Chữ trong trò lấy nguyên văn kịch bản, không tự viết thoại.
Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-12 · Người lớn + học sinh nền procedural
- **Đọc:** mục 2.0; `src/actors/character/{presets,build,animate}.ts`; `src/actors/player/rigAdapter.ts`; GDD `01` §2.2.
- **Việc:** thêm `CharacterId` `adult_teacher` (cô Diệp), `adult_guard` (bác bảo vệ), `adult_shop` (chú tạp hóa), `stu_tu` (Tú), `stu_bg_1…4`; người lớn: tỉ lệ đầu nhỏ hơn, cao 1,55–1,70 m, áo dài tay/áo bảo vệ/áo thun; học sinh nền dùng lại đồng phục, đổi tóc/màu. Đứng yên (`idle`, `talk`) là đủ.
- **DoD:** test chiều cao; tam giác ≤ 2.500/người; 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent nhân vật procedural (Three.js) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-12. Worktree nhánh task/N-12-nguoi-lon. Chỉ sửa src/actors/character/presets.ts, build.ts và tests/unit/rigAdapter.test.ts. Thêm 3 người lớn + Tú + 4 học sinh nền như thẻ, dựng bằng code (không GLB), min.y = 0, ≤ 2.500 tam giác/người. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-13 · Đạo cụ procedural Mốc 2 + đêm Hội trại
- **Đọc:** như N-06 + kịch bản Trang 5–9 (dòng 329–857) để biết vật cần có.
- **Việc:** `src/world/props/m2/`: `chalkBox.ts` (PX-51, nắp ghi tỉ số đọc `caro.series` (`{quan, duc}`)), `banners.ts` (PX-60), `caroSheet.ts` (PX-61), `basketHoop.ts` (PX-62, chỉ làm nếu GLB sân chưa có cột rổ — kiểm trước), `mailbox.ts` (PX-63, 3 kiểu theo `story.valentine.boxStyle`, bảng 3 điều chữ nguyên văn), `countdown.ts` (PX-64, số 270/197), `grocery2018.ts` (PX-65 tivi + tờ lịch), `campNight.ts` (PX-66: lửa dùng `addCampfire` của N-05, đèn dây InstancedMesh, 3 lều, cờ giấy, cổng trại 3 kiểu `'rocket'|'leaf'|'plain'`), `yearbook.ts` (PX-67). Bộ gắn `dressing/sets/m2_*.ts` theo `dayId`.
- **DoD:** như N-06.
- **Prompt:**
```
Bạn là agent dựng đạo cụ 3D bằng code cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-13, docs/BACKGROUND_AUDIT.md (b3), (d).
Worktree nhánh task/N-13-props-moc2 (sau N-04, N-05). Chỉ tạo file trong src/world/props/m2/, src/world/dressing/sets/m2_*.ts, tests/unit/props_m2.test.ts.
Quy chuẩn: min.y = 0, toon + PAL, sRGB, InstancedMesh khi lặp, mergeStatic, không GLB/Blender. Chữ trên vật lấy nguyên văn kịch bản. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-14 · Ảnh tự sướng 3 lần + ảnh cầu vồng lên bìa Album
- **Đọc:** mục 2.0; GDD `02` §2.4.5; kịch bản Trang 1 cảnh B Bước 2, Trang 4 Bước 5; `src/game/game.ts` `runPhoto`; `src/systems/album.ts`; `src/core/save.ts` (`album[].selected`).
- **Việc:** chế độ `handheld` có tham số `shots: 3` → chụp 3 lần → màn chọn 1 tấm → `album[entry].selected`; lần 1 lệch khung có câu Châu "Khoan! Đức, tóc ông dựng kìa!" (nguyên văn kịch bản); entry `alb.d.g07.03.cover` → bìa Album.
- **DoD:** test album chọn ảnh; 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent engine cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-14. Worktree nhánh task/N-14-anh-3-lan (sau khi N-02 và N-09 đã gộp). Chỉ sửa src/game/game.ts (hàm runPhoto), src/systems/album.ts, src/ui/game/GameUi.tsx (vùng ảnh) và test liên quan. Làm chụp 3 lần chọn 1 và ảnh bìa Album. Thoại nguyên văn kịch bản. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-15a…e · Số hóa Main Trang 5–9 · N-15f · Tích hợp Mốc 2
- **Mục tiêu & quy chuẩn:** A1 — **chỉ tuyến Main**. Side, Daily, Khu Vui Chơi, lật chai, Hội trại Phần 2–3, 4 nhánh rút gọn Valentine: **không làm** (Trang 6 Cảnh D bước 3: chỉ 3 nhánh minigame chính; nếu thư Player trỏ tới nhánh rút gọn → dẫn về nhánh "Trang trí Căn cứ"). Thoại **nguyên văn** kịch bản, `meta = HUMAN_CANON`. **Không thêm câu nối** (validator production chặn quest Main/Event không phải `HUMAN_CANON` và mọi `AI_PROPOSED` — G-3): chỗ thiếu thoại thì ghi vào PR để chủ dự án duyệt rồi mới thêm.
- **Đọc:** mục 2.0; `docs/PAGE_DATA_GUIDE.md`; một file mẫu đã đúng (`src/content/days/d_g07_01.ts`); kịch bản: Trang 5 dòng 331–395 · Trang 6 dòng 396–635 + `docs/gdd/IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md` · Trang 7 dòng 636–701 · Trang 8 dòng 702–778 · Trang 9 dòng 779–858; Phụ lục A, B, E.
- **Quy ước mã:** Trang 5 `d.g08.01` quest `q_m2_main_05`, kỷ vật `art_m2_01` (do N-08 khai) · Trang 6 `d.g08.02` `q_m2_main_06`, `art_m2_02` · Trang 7 `d.g09.01` `q_m2_main_07`, `art_m2_03` · Trang 8 `d.g09.02` `q_m2_main_08`, `art_m2_04` · Trang 9 `d.g09.03` `q_m2_main_09`, `art_m2_05`. `map_variant`: g08 / g09 / `g09_night` (Hội trại) / `g09_end`. Flag lưu: `m2.duty_partner` (T5), `story.valentine.*` (T6), `m2.newspaper_truth` (T7), `m2.camp_gate` (T8), `m2.final_photo` (T9). Mã trò: `mg_caro`, `mg_sudoku`, `mg_throw`, `mg_photo_hunt`, `mg_decorate`, `mg_mailbox_build`.
- **N-15f:** `pack.ts` thêm 5 Trang; `release.ts` bản `test`: 9 Trang, `end_day_id: 'd.g09.03'`; `chapters.ts` thêm `ch_m2`; cập nhật `analyticsBridge.test.ts` `playAll` 9 Trang; `pack.ts` thêm `filterPackForRelease(pack, env)`: bản `production` bỏ `side_quests` và `daily_pool` của mọi Ngày (A1, G-3), bản `test` giữ nguyên.
- **DoD:** mỗi Trang chạy được từ đầu tới ảnh chính; 4 lệnh xanh.
- **Prompt (thay `<X>`):**
```
Bạn là agent số hóa kịch bản cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-15, docs/PAGE_DATA_GUIDE.md, file mẫu src/content/days/d_g07_01.ts.
Worktree nhánh task/N-15<x>-trang<X> từ origin/feat/sprint-0412. Chỉ tạo src/content/days/<file của Trang X> (không sửa pack.ts/release.ts — việc của N-15f).
Chỉ làm tuyến MAIN của Trang <X> theo docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md dòng <...>. Chép thoại NGUYÊN VĂN, đổi [PLAYER_NAME] → {player_name}, [ÔNG_BÀ] → {g:ông|bà}. Không viết thoại mới và không thêm câu nối; chỗ thiếu thì ghi vào PR. Dùng đúng mã quest/kỷ vật/flag/trò trong thẻ. Không làm Side/Daily.
Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-16 · Trò Mốc 2 bản tối thiểu
- **Đọc:** mục 2.0; GDD `02` §2.1 (Caro), §2.2 (Sudoku), §2.5.3a–c; `src/game/minigames/types.ts`; `src/core/save.ts` (N-03).
- **Việc:** `mg_caro` (12×12, 5 ô thắng, **1 mức AI** "Đức dễ", cập nhật `caro.series` = `{quan, duc}`, bắt đầu 3–3, chỉ ghi kết quả **lần đầu**), `mg_sudoku` (9×9 mức Vừa, 3 đề cứng, đồng hồ 6 phút, sao), `mg_throw` (K5 ném bóng tính điểm), `mg_photo_hunt` (K2 săn 3 góc ảnh — dùng khung ảnh có sẵn), `mg_decorate` (K3 trang trí Căn cứ), `mg_mailbox_build` (K3 chọn nền + họa tiết → `story.valentine.boxStyle`). Có Bỏ qua.
- **DoD + Prompt:** như N-11 (đổi danh sách trò).

### N-17 · Màn 2D Mốc 2
- **Đọc:** mục 2.0; GDD `00` §5.1 (màn hình 2D), `02` §2.5.1–2.5.4; `IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md`.
- **Việc:** `src/ui/game/screens/ConfessionPage.tsx` (trang confession hư cấu, tên trang tự nghĩ), `LetterWrite.tsx` (chọn người nhận × loại thư), `LetterRead.tsx`; mở/đóng Esc; mở bằng bước `minigame` với mã `mg_screen_confession`, `mg_screen_letter_write`, `mg_screen_letter_read` (không cần sửa engine).
- **DoD + Prompt:** như N-11; chữ nguyên văn kịch bản.

### N-18 … N-23 · Ghi gọn (mở prompt đầy đủ khi tới lượt; chuyển từ T-09, T-13, T-14)
| Mã | Ghi chú cho người làm |
|---|---|
| **N-18** | `free_photo_taken`, `feedback_submitted` có người nghe ở `src/analytics/bridge.ts` nhưng không ai phát; `landing_view`, `cta_click` chưa có nơi phát (gắn ở `src/main.ts` trang chủ); **bỏ `hub_opened`** (Khu Vui Chơi bị cắt, A1). Nghiệm thu: chơi một lượt với Firestore Emulator rồi đếm đủ loại event |
| **N-19** | Bot `playAll` 9 Trang; chạy `npx playwright test --workers=1` (~32 phút, chạy nền, trên máy thật). Sửa chú thích "hẹn giờ 8 giây" ở `tests/e2e/world.spec.ts` (~dòng 418, 902; thời gian chờ thật 120–150 giây nên không ảnh hưởng). Ca "nút gửi event thử" đang bỏ qua vì không bật Emulator — kiểm lý do. **Đo FPS trên laptop thật** (Chrome headless vẽ bằng CPU, không dùng làm số đo). Ghi kết quả vào `docs/DEV_SESSION_HANDOFF.md` |
| **N-20** | `docs/ASSET_CREDITS.md` (repo chưa có file này): 7 GLB có sẵn (6 khu + bàn đôi) ghi nguồn, còn lại "procedural, tự làm"; `DEMO_AUDIT.md` thêm mục "đã xử lý"; `03_ASSETS_AND_AUDIO.md` §1.3/§2 ghi D3 và gắn SUPERSEDED đường Blender → GLB; sửa các câu "100%", "0 PLACEHOLDER", "v1.4 APPROVED" trong `QUESTIONS_LOG.md`, `HANDOFF_TO_CLAUDE.md` (A3-8) |
| **N-21** | Thẻ minh họa 2D "ba cổng trường" (PX-80) + ảnh in dán tường Căn cứ (PX-42) — chi tiết ở `docs/BACKGROUND_AUDIT.md` mục (d) |
| **N-22** | Kiểm bản `test` và `production` tách đúng; bản production **không** lẫn công cụ test (Tweakpane, `__game`, `inputdebug`, `camtest`, `bot=release`) — `VERCEL_ENV=production npm run build` rồi tìm các từ khóa này trong bản build; validator production 0 lỗi (cần N-15f đã tắt Side/Daily); mở PR `feat/sprint-0412` → `dev`; **xin chủ dự án duyệt** mới gộp `main`; trong kỳ đo 05–15/12 mỗi lần đưa lên production ghi nhật ký (ngày giờ, commit, lý do) |
| **N-23** | `loadProp()` (`src/render/assets.ts:38`) giữ cache theo URL và trả `clone(true)` dùng chung geometry, trong khi `World.dispose()` (`src/world/world.ts`, ~dòng 199) lại `dispose()` geometry → props GLB sẽ **mất ở lần vào Ngày thứ hai** (chưa nổ vì `loadProp` chỉ dùng ở `src/lab/yardScene.ts`). Đo lại `prp_desk_2seat.glb` bằng `Box3` trước (G-8): nếu `min.y ≈ 0` thì xóa BG-5 khỏi `BACKGROUND_AUDIT.md`; nếu lệch thì bù trong code khi nạp (không sửa GLB, D3) |

---

## Mục 3 — Bản đồ quyền sở hữu file (kiểm nhanh trước khi nhận task)

| File / thư mục | Chủ (P0) | Chủ (P1, sau khi P0 gộp) |
|---|---|---|
| `src/game/game.ts` | N-02 | N-14 |
| `src/ui/game/GameUi.tsx` | N-02 (vùng minigame) → N-09 (khối feedback) | N-14 (vùng ảnh) |
| `src/game/scenes/dayScene.ts` | N-04 | — (không ai sửa thêm) |
| `src/world/{world,types,validate,extras}.ts`, `maps/map_thcs.extras.ts` | N-04 | N-04 (thêm marker Mốc 2 theo yêu cầu N-15); N-23 (chỉ `dispose` trong `world.ts`, sau N-04) |
| `src/world/{variants,sky,atmosphere}.ts`, `src/render/fx.ts`, `src/content/base.ts`, `src/content/types.ts` | N-05 | N-05 |
| `src/world/props/m1/**`, `dressing/sets/m1_*` | N-06 | — |
| `src/world/props/m2/**`, `dressing/sets/m2_*` | — | N-13 |
| `src/world/backdrop/**`, `dressing/sets/backdrop.ts` | N-07 | — |
| `src/content/days/d_g06_01…d_g07_03.ts` | N-01 | — |
| `src/content/days/d_g08_*.ts`, `d_g09_*.ts` | — | N-15a…e (mỗi file một task) |
| `src/content/{pack,release,chapters}.ts` | — | N-15f, rồi N-22 (chỉ khối `production` của `release.ts`) |
| `src/content/hub.ts`, `src/config/hub.ts`, `hubScene.ts` | N-08 | N-08 |
| `src/core/save.ts` | N-03 | — |
| `src/content/validate.ts` | N-10 | — |
| `src/game/minigames/{types,registry,host}.ts` | N-02 | — |
| `src/game/minigames/games/*.ts` | N-11a (4 file) | N-11b, N-16, N-17 (mỗi trò một file) |
| `src/actors/character/**` | — | N-12 |
| `api/**`, `firestore.rules`, `FeedbackForm.tsx` | N-09 | — |
| `CLAUDE.md`, `docs/gdd/00_MASTER_GDD.md`, `docs/handoff/README.md` | N-00 ✅ (đã xong 22/11) | — |
| `tests/e2e/*.spec.ts` | N-02 (một ca A-01 trong `game.spec.ts`) | N-19 |
| `src/analytics/*`, `src/main.ts`, `shared/events.ts` | — | N-18 |
| `src/render/assets.ts` | — | N-23 |
| `docs/ASSET_CREDITS.md`, `docs/handoff/DEMO_AUDIT.md`, `docs/gdd/03_ASSETS_AND_AUDIO.md`, `docs/handoff/gemini/*` | — | N-20 (riêng `DOI_CHIEU_TRANG_1_4.md`: N-01) |
| `docs/DEV_SESSION_HANDOFF.md` | mỗi task ghi bằng chứng của mình | N-22 (nhật ký production) |

---

## Mục 4 — Sau 15/12 (không làm trong sprint này)
- Side/Daily thật cho Mốc 1 và 2 (nhóm chốt danh sách — GDD `00` §11 mục 9) · Khu Vui Chơi Căn cứ · Tầng B (lật chai, bi ve, ô ăn quan, lò cò) · 4 nhánh Valentine rút gọn · Hội trại Phần 2–3 · Mốc 3 (lớp 10–12) · `minigames.bottle.*` trong bản lưu.
- Nhân vật GLB có xương: chỉ xét lại nếu chủ dự án đổi D3.

---

## Mục 5 — Tình hình tiến độ (Integrator cập nhật 25/11/2026, sáng, UTC+7)

`feat/sprint-0412` @ `303bd09` (sau N-01 #8) · `dev` @ `d5f1a09` (gộp #18, cây mã trùng `303bd09`) · `main` @ `4adf991` (scaffold, chưa đụng).
Ký hiệu: ❌ chưa nhận · 🔄 đang làm · 🔍 chờ sửa · ✅ đã gộp · ⛔ bị chặn. "Kiểm thật" = Integrator tự chạy trên bản gộp thử. vitest: mốc nền 22/11 266/1 → **522/2** hiện tại. Đợt việc mới: `docs/handoff/NEXT_BATCH_2026-11-25.md`.

| Mã | Trạng thái | Kiểm thật | Ghi chú |
|---|---|---|---|
| N-00 | ✅ 22/11 | — | — |
| N-01 | ✅ PR #8, `303bd09` | tsc ✓ · vitest 522/2 ✓ · validate ✓ · build ✓ · e2e **45/0/1 ✓** (22,0 phút) | Câu Hạ "…bỏ bạn đó **ở lại**…" đã sửa (`2bbf275`). Tồn: thoại trước/sau trò → **N-01b** |
| N-24 | ❌ → giao 25/11 | — | Đổi tên game "Vùng Ký Ức" (chủ dự án chốt 25/11). `docs/gdd/` + `CLAUDE.md` do chủ dự án sửa. Gộp trước N-18 (cùng `src/main.ts`) |
| N-01b | ❌ → giao 25/11 | — | Tách thoại trước/sau minigame Trang 1 + Luật Căn cứ Trang 3 (Mốc 1, P0) |
| N-02 | ✅ PR #4, `f5fb467` | e2e 38/1 | — |
| N-02b | ✅ PR #7, `c637b5b` | e2e 38/1 | — |
| N-03 | ✅ PR #1, `a9758c2` | — | — |
| N-04 | ✅ PR #2, `203982f` | e2e 37/1 | — |
| N-04b | ✅ PR #15, `01edf2a` | gộp 24/11; nằm trong lần kiểm #18 (522/2, e2e 45/0/1) | Marker Mốc 2 |
| N-05 | ✅ PR #5, `8257863` | e2e 38/1 | — |
| N-06 | ✅ PR #9, `628bc5a` | e2e 38/0/1 | — |
| N-07 | ✅ PR #10, `bd0d535` | — | Thiếu ảnh 4 hướng (nhắc) |
| N-08 + K2 | ✅ PR #17, `2a987b6` | e2e 45/0/1 | GDD 00 đã sửa "đi lại tự do" (`2fe845a`, 25/11) |
| N-09 | ✅ PR #3, `dfc156e` | e2e 38/1 | Firestore thật chưa kiểm |
| N-10 | ✅ PR #6, `b66528b` | — | — |
| N-10b | ✅ PR #14, `9ca9b96` | gộp 24/11; nằm trong lần kiểm #18 | — |
| N-11a / N-11b | ✅ PR #12 `c25dd06` / #13 `eeb09c2` | nhánh thật sau đợt 23/11: e2e 38/1 | Nay chạy thật trong luồng Trang 1–4 (sau N-01) |
| N-14 | ✅ PR #16, `48677c5` | gộp 24/11; nằm trong lần kiểm #18 | Ảnh 3 lần lấy mặc định theo camera `cam.d0601.grocery` (dữ liệu Trang chưa khai `shots: 3` — không lỗi) |
| N-12 | ❌ → giao lại 25/11 | — | Giao 23/11 nhưng chưa thấy nhánh |
| N-13 | ❌ | — | Mốc 2 |
| N-15a, N-15c | 🔄 nhánh `task/N-15a-trang5`, `task/N-15c-trang7` (24/11), chưa PR | — | Mốc 2 |
| N-15b, N-15d, N-15e | ❌ (giao 23/11, chưa thấy nhánh) | — | Mốc 2 |
| N-15f | ❌ sóng 2 | — | **Phần `filterPackForRelease` chuyển sang N-22a**; gộp sau N-22a, N-01b |
| N-16, N-17 | ❌ (giao 23/11, chưa thấy nhánh) | — | Mốc 2 |
| N-18 | ❌ → giao 25/11 | — | Cần trước kỳ đo 05/12; gộp sau N-24; Codex không dùng nữa → giao Sonnet/Opus |
| N-19a | ❌ → giao 25/11 (người) | — | Chơi tay Mốc 1 + FPS trên Preview `dev` |
| N-19 | ❌ cổng cuối | — | e2e 9 Trang |
| N-20, N-21, N-23 | ❌ P2 | — | N-20 sửa `docs/gdd/` → hỏi chủ dự án trước khi gộp |
| N-22a | ❌ → giao 25/11 | — | Khai 4 Trang cho Production + tắt Side/Daily AI + test chặn |
| N-22 | ❌ cổng cuối | — | Mở rộng thành 9 Trang khi Mốc 2 xong |

### 5.1 Mốc 1 — sẵn sàng Production chưa? **Chưa** (kiểm 25/11)
Đã có: 4 Trang đúng kịch bản, 8 trò chạy trong luồng, ảnh 3 lần + bìa cầu vồng, phòng 2026 + kết, form phản hồi; build production sạch công cụ test; Vercel build `dev` thành công.
**Bắt buộc trước khi gộp `main`:**
1. **N-22a** — khối `production` của `release.ts` đang **0 Trang** (Production hiện chỉ có trang chủ, không có nút chơi). Khai ngay thì 5 quest Side/Daily `AI_PROPOSED` lọt vào game vì validator production **chỉ in lỗi ra console, không chặn**.
2. **N-01b** — thoại trước/sau trò đang ngược ở Trang 1 (mật lệnh, đá cầu, bóp mì, 3 câu tấm tự sướng) và Trang 3 (5 điều luật).
3. **N-19a** — chưa ai chơi tay trọn Mốc 1, chưa đo FPS laptop thật.
4. ~~Q1~~ — chủ dự án chốt phương án A (25/11): giữ màn kết như bản test tới khi Mốc 2 lên.
5. ~~Firebase trên Vercel~~ — chủ dự án kiểm 25/11: `/api/health` → `firebase: configured`. (Chưa ghi rõ kiểm bản Production hay chỉ Preview — hỏi lại.)
**Nên có (không chặn):** N-12 (người lớn, học sinh nền), N-18 (event trang chủ — cần trước 05/12).

### 5.2 So với lịch Mục 1.1
- N-01 gộp 25/11 (chậm ~2 ngày so với 22–23/11). Điểm kiểm **26/11 (chơi tay 4 Trang)** vẫn làm được ngay trên Preview `dev` → N-19a.
- Mốc 2: mới 2/5 Trang có nhánh; N-16/N-17 chưa thấy nhánh → rủi ro cho điểm cắt 02/12.

### 5.3 Đường găng
Mốc 1 Production: N-01b + N-22a → N-19a (chơi tay lại) → `dev` → chủ dự án gộp `main`.
Bản đo 9 Trang: N-15a…e → N-15f → N-19 → N-22.

### 5.4 Rủi ro
1. Validator production không chặn (chỉ `console.error`) → test của N-22a là lưới an toàn duy nhất.
2. Dữ liệu Side/Daily `[PLACEHOLDER]` vẫn nằm trong gói JS production (33 chỗ) dù người chơi không tới được — xử lý sau (cần tách export trong file Trang).
3. Đưa Production sớm trước 05/12: event ghi `release_stage: 'prototype'` (src/config/game.ts) — đổi sang `public` đúng 05/12 và ghi nhật ký (N-22).
4. e2e là lưới an toàn duy nhất cho luồng chơi; PR đổi luồng phải tự chạy e2e đầy đủ.
5. Gói `game` ~1,2 MB; chưa đo FPS/tải trên máy thật. Chưa kiểm: Vercel Preview chơi tay, Firestore thật, ca Emulator.
