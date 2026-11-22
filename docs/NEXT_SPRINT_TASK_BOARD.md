# NEXT_SPRINT_TASK_BOARD — Bảng giao việc song song tới 04/12/2026

| Trường | Giá trị |
|---|---|
| Ngày lập | 22/11/2026 (UTC+7) |
| Nhánh gốc | `feat/sprint-0412` |
| Phạm vi | **Mốc 1 đầy đủ (Trang 1–4) + Mốc 2 chỉ tuyến Main (Trang 5–9) + kết demo bản 9 Trang** — quyết định Game Director 22/11 (`docs/GDD_FULL_REVIEW.md` mục VII) |
| Đọc kèm | `docs/GDD_FULL_REVIEW.md` (mục VII), `docs/BACKGROUND_AUDIT.md` |
| Hạn | Bản playtest **04/12/2026**; kỳ đo 05–15/12 |

**Cách dùng file này:** mỗi thành viên nhận một mã task ở Mục 1 → mở thẻ task ở Mục 2 → copy khối "Prompt" dán cho AI agent của mình. Mỗi task **chỉ sửa các file trong cột "File sở hữu"**; cần sửa file khác thì ghi vào phần "Ghi chú bàn giao" của PR, không tự sửa.

---

## Mục 0 — Cần Game Director kiểm tra và chốt trước khi gộp

### 0.1 (A3) Những chỗ Antigravity tự gán trạng thái "đã duyệt"

Nhãn trong code: `owner: 'NARRATIVE_APPROVED'` = đã duyệt cốt truyện; `ownership_label: 'HUMAN_CANON'` = chữ của người, chép nguyên văn; `HUMAN_DRAFT` = người viết nháp. **Validator cho phép mọi thứ có `HUMAN_CANON`/`HUMAN_DRAFT` vào bản production.**

| # | Vị trí | Nhãn AG gán | Thực tế |
|---|---|---|---|
| A3-1 | `src/content/days/d_g06_01.ts`, `d_g07_01.ts`, `d_g07_02.ts`, `d_g07_03.ts` — hằng `meta` dùng cho 4 quest Main (`q_m1_main_01/02/03/05`) | `NARRATIVE_APPROVED` + `HUMAN_CANON` + `v1.4` | Thoại đã bị gộp/viết lại so với kịch bản (B1, B3, B5, B6). Game Director đã cho giữ thoại theo code (B3) → **cần anh/chị xác nhận nhãn HUMAN_CANON cho bản đã chỉnh** |
| A3-2 | Cùng 4 file — hằng `sideMeta` cho Side/Daily: `q_m1_side_01` "Xem bảng phân công trực nhật", `q_m1_side_02` "Đi dạo một vòng các khu trường cũ", `q_m1_side_03` "Mẹo gấp giấy của Quân", `q_m1_side_04` "Bắn bi mắt mèo cùng Quân", `q_m1_daily_01` "Kiểm tra đồ trực nhật" (4 bản khác nhau) | `NARRATIVE_APPROVED` + `HUMAN_DRAFT` | **Do AI tự nghĩ**, không có trong kịch bản. Theo C1 → đổi sang `AI_PROPOSED` + `[PLACEHOLDER]` (task N-01) |
| A3-3 | `src/content/hub.ts` — hằng `meta` cho `q_hub_pd_01/02/03` | `NARRATIVE_APPROVED` + `HUMAN_CANON` | Gồm 4 dòng chat cũ tự viết (B8) và 3 tin kết viết lại (B9) — xem 0.2 |
| A3-4 | Ghi chú Album (fragment `note`/`sticker`): `frag.d.g06.01.02` "Ngày đầu lớp 6, bắt đầu từ một mẩu giấy mật lệnh vẽ linh tinh.", `frag.d.g07.01.02` "Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xuôi dòng rãnh nước.", `frag.d.g07.02.02` "Góc sân sau trở thành Căn cứ Bí mật của năm đứa.", sticker "Danh sách trực nhật của Châu", "Dấu trực nhật đầu năm", "Mẹo gấp thuyền của Quân", "Viên bi mắt mèo", "Dấu trực nhật cuối năm", "Ký ức khắp sân trường" | Không có nhãn riêng, nằm trong file `HUMAN_CANON` | Chữ AI tự viết, hiện lên Album |
| A3-5 | Lời lựa chọn Trang 4 `c_m1_05_tone`: "Tạo dáng nhí nhố làm mặt hề" / "Đứng tự nhiên, khoác vai cười tươi" / "Nghiêm trang chỉnh tề như ảnh thẻ" | `HUMAN_CANON` | Kịch bản chỉ ghi "nghiêm túc / tự nhiên / hài"; câu chữ do AI viết |
| A3-6 | Lời lựa chọn Trang 3 `c_m1_03_decor`: "Gấp dây hạc giấy màu rực rỡ" / "Cắm hoa dại và cành lá mộc mạc" / "Dán những tấm ảnh chụp chung" | `HUMAN_CANON` | Kịch bản: "giấy màu / hoa / ảnh". B5 đã chốt trả về chữ kịch bản (N-01) |
| A3-7 | Tên + mô tả kỷ vật (`art_m1_01/02/03/05` `.name`, `.description`), câu nhắc PDE `pde_03` | `HUMAN_CANON` | Chữ AI viết, hiện trong game |
| A3-8 | Tài liệu: `docs/handoff/gemini/DOI_CHIEU_TRANG_1_4.md` ghi nguồn "v1.4 APPROVED"; `QUESTIONS_LOG.md` ghi "0 PLACEHOLDER, đã thay 100% bằng thoại canonical được duyệt" và gắn "Đã xử lý (Chuẩn hóa)" cho 3 điểm tự quyết; `HANDOFF_TO_CLAUDE.md` ghi "hoàn tất 100%" | — | Kịch bản file gốc ghi **v1.6-draft, chưa duyệt toàn file**; phần thao tác chơi (minigame) **0%** |

**Cần anh/chị chọn cho A3-1, A3-4, A3-5, A3-7:** (a) chấp nhận chữ hiện tại là canon, hay (b) đổi nhãn `AI_PROPOSED` để người viết duyệt lại. Nếu (b): validator sẽ chặn chúng khỏi bản production cho tới khi duyệt.

### 0.2 (B8, B9) Nguyên văn để duyệt lại

**B8 — Lịch sử nhóm chat cũ (Kết demo, bước mở điện thoại)**

| Nguồn | Nội dung |
|---|---|
| Kịch bản `KICH_BAN_DEMO_M1_M2_v1.md` §KẾT DEMO, Bước 2 | *(Người chơi: mở điện thoại, tìm nhóm chat cũ. Tin cuối cùng trong nhóm đã từ rất lâu.)* — không có dòng chat nào được viết sẵn |
| Code `src/content/hub.ts` dòng 22–25 (AG tự viết) | **Đức:** "Đứa nào rảnh thì cuối tuần ra Căn cứ nghen!"<br>**Châu:** "Lo học bài đi ông tướng. Tuần sau kiểm tra đó."<br>**Quân:** "Tớ mới bơm lại quả bóng rổ nè."<br>**Hạ:** "Hạ vừa ép xong một lá phượng đẹp lắm." |
| Code `hub.ts` dòng 29–30 (màn kết, AG tự viết) | **narrator:** "Tin nhắn đã gửi."<br>**narrator:** "Cảm ơn bạn đã trải nghiệm Bản Demo "Hành Trình Thanh Xuân"!" |
| Kịch bản §KẾT DEMO, Kết | Màn hình hiện *"Đã gửi."* … rồi *"(còn tiếp)"*. Ghi nhận hoàn thành demo → mở form phản hồi |

Phương án: (1) giữ 4 dòng AG; (2) bỏ hết, chỉ hiện mốc thời gian tin cuối (ví dụ "06/2018") đúng ý kịch bản; (3) nhóm viết lại. Màn kết: dùng đúng "Đã gửi." → "(còn tiếp)" hay thêm câu cảm ơn?

**B9 — Ba tin nhắn kết demo**

| Nguồn | Rộn ràng (`playful`) | Ấm áp (`gentle`) | Sâu lắng (`deep`) |
|---|---|---|---|
| **Kịch bản 9 Trang** (§KẾT DEMO, Bước 2) | "Ê. Ván caro hồi lớp 8 vẫn đang 4–3 đó nha. Ai gỡ?" | "Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?" | "Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha." |
| **Code hiện tại** (`hub.ts` dòng 84–86, AG viết cho bản Mốc 1) | "Ê. Nhớ hồi tụi mình mới đủ năm đứa không? Lâu quá rồi ha." | "Mình mới lục ra cuốn sổ luật Căn cứ. Mọi người dạo này sao rồi?" | "Điều 6, được dời, không được hủy. Tụi mình dời hơi lâu rồi ha." |

Kèm theo: độc thoại trước khi mở điện thoại (kịch bản, Bước 1): **[PLAYER_NAME]** (độc thoại): "Được dời, không được hủy…" — **chưa có trong code**.

Đề xuất của Claude: vì A1 + D5 đưa kết về bản 9 Trang, **dùng nguyên văn kịch bản 9 Trang** (Điều 6 đã ra đời ở Trang 9 nên tin `deep` hợp mạch). Tỉ số "4–3" theo GDD `01` §10 mục 3 là **tỉ số động** lấy từ loạt ván caro (`minigames.caro.series`) — cần anh/chị chốt: in số động hay giữ cứng "4–3".

### 0.3 (D5) Bản nháp đoạn timeskip — `AI_PROPOSED`, chờ duyệt
Vị trí đề xuất: sau cutscene "Cuối hè" (Trang 9), trước Kết demo Bước 1. Khoảng cách 2018 → 2026 = 8 năm (GDD `01` §3).
> *Thẻ chữ:* "[PLACEHOLDER] Tám năm sau."
> *(Phòng 2026, đèn bàn. Album đã đủ trang.)*
> **{player_name}** (độc thoại): "[PLACEHOLDER] Hồi đó tụi mình hứa mỗi tháng gặp nhau một lần…"
> **{player_name}** (độc thoại): "[PLACEHOLDER] Lần cuối cả năm đứa ngồi chung với nhau là khi nào nhỉ?"
> → nối thẳng Kết demo Bước 1 (lấy sổ luật xuống, lật tới Điều 6).

Cần anh/chị: duyệt / sửa lời; xác nhận vị trí (sau Trang 9) — hay ý anh/chị là timeskip ở chỗ chuyển Mốc giữa Trang 4 và 5?

### 0.4 Các điểm cần xác nhận thêm
| # | Việc | Vì sao |
|---|---|---|
| X-1 | Cho phép sửa `CLAUDE.md` §3 và GDD `00` §1.2, §4, §11 theo quyết định 22/11 (task N-00) | `CLAUDE.md` đang bảo mọi agent "đừng làm trái" quyết định 21/11 (chỉ Mốc 1) → agent khác sẽ từ chối làm Mốc 2 nếu chưa sửa |
| X-2 | D3 thay hướng asset nhân vật 21/11 (base mesh GLB ở `feature/asset-workshop`) → giữ nhân vật dựng bằng code | `CLAUDE.md` §3 mục 2 còn ghi hướng cũ |
| X-3 | Cách sửa "Căn cứ ngoài tường rào" (BG-1 trong `BACKGROUND_AUDIT.md`): coi bãi đất + Căn cứ là sân sau, mở lối từ sân, chặn lối từ ngõ | Đổi đường đi của Trang 3, 4, 6, 7, 9 |
| X-4 | Thứ tự cắt nếu trễ (Mục 1, cuối bảng) | Cần thống nhất trước để không tranh cãi ngày 02/12 |

---

## Mục 1 — Bảng tổng hợp task

Ký hiệu nhóm: **[Scene]** dựng cảnh/engine · **[Props]** đạo cụ procedural · **[Script]** nội dung, flag, dữ liệu · **[Web]** web/đo lường · **[Docs]** tài liệu.
Agent đề xuất: **AG** = Antigravity / Gemini 3.8 · **Codex** · **Sonnet** / **Opus** = Claude.

| Mã | Tên task · nhóm | Ưu tiên | Agent đề xuất | File sở hữu (chỉ task này được sửa) | Phụ thuộc | DoD (tiêu chí xong) |
|---|---|---|---|---|---|---|
| **N-00** | Ghi quyết định 22/11 vào tài liệu gốc · [Docs] | P0 | Sonnet | `CLAUDE.md`, `docs/gdd/00_MASTER_GDD.md`, `docs/handoff/README.md` | Duyệt X-1, X-2 | 3 file ghi A1, D3, D5; dòng cũ gắn SUPERSEDED; không đổi file khác |
| **N-01** | Sửa dữ liệu Mốc 1 theo B/C/D đã chốt · [Script] | P0 | AG hoặc Sonnet | `src/content/days/d_g06_01.ts`, `d_g07_01.ts`, `d_g07_02.ts`, `d_g07_03.ts`, `tests/unit/contentPack.test.ts`, `docs/handoff/gemini/DOI_CHIEU_TRANG_1_4.md` | Marker của N-04 (dùng ID ở thẻ N-04) | tsc + vitest + validate xanh; B1, B2, B5, B6, B7, C1, C2, C4, C5, D1, D2 xong; C6 tài liệu khớp code |
| **N-02** | Khung minigame chung + sổ đăng ký trò + sửa lỗi A-01 · [Scene] | P0 | Opus hoặc Codex | `src/game/game.ts`, `src/game/minigames/{types,registry,host}.ts` (mới), `src/ui/game/MinigameFrame.tsx` (mới), `src/ui/game/GameUi.tsx` (vùng minigame), `src/ui/game/store.ts`, `tests/unit/minigameHost.test.ts` (mới) | — | Trò mẫu `mg_demo` chạy: luật → chơi → thắng/thua → Chơi lại / Bỏ qua; event `minigame_started/finished` đúng kết quả; A-01 có test |
| **N-03** | Lưu bản v3 + bước chuyển đổi v2→v3 · [Scene] | P0 | Codex | `src/core/save.ts`, `tests/unit/save.test.ts` | — | Bản lưu v2 nâng lên v3 **không mất** tiến trình/ảnh; có `minigames`, `story`, `hub.unlocked` |
| **N-04** | World Extras + sửa Căn cứ trong trường + marker/camera mới + điểm gắn đồ trang trí · [Scene] | P0 | Opus | `src/world/extras.ts` (mới), `src/world/maps/map_thcs.extras.ts` (mới), `src/world/world.ts`, `src/world/types.ts`, `src/world/validate.ts`, `src/game/scenes/dayScene.ts`, `src/world/dressing/index.ts` (mới), `src/world/atmosphere.ts` (mới, stub), `tests/unit/world/extras.test.ts` (mới) | — | `validate:world` 0 lỗi kể cả marker code; đi được sân → sân sau → Căn cứ không qua cổng; ảnh thuyền và biển tên đúng chỗ; stub `dressing`/`atmosphere` đẩy lên **trong ngày đầu** |
| **N-05** | Ánh sáng, thời tiết, biến thể năm học · [Scene] | P0 | Codex hoặc AG | `src/world/variants.ts`, `src/world/atmosphere.ts` (điền), `src/render/fx.ts`, `src/world/sky.ts`, `src/content/base.ts`, `src/content/types.ts` (chỉ thêm trường tùy chọn), `tests/unit/fx.test.ts` | Stub của N-04 | 7 preset mới; mưa + cầu vồng đổi được giữa Trang; g07_end/g08/g09/g09_end; nhân vật lớp 8–9 cao đúng dải |
| **N-06** | Đạo cụ procedural Mốc 1 (PX-10…41) + bộ trang trí Căn cứ theo flag · [Props] | P0 | AG | `src/world/props/m1/*.ts` (mới), `src/world/dressing/sets/m1_*.ts` (mới), `tests/unit/props_m1.test.ts` (mới) | Stub `dressing` của N-04 | Mọi hàm `min.y ≈ 0`, đúng ngân sách tam giác; Căn cứ đổi theo `m1.base_decor` |
| **N-07** | Vành nền phố + mặt đất mở rộng (PX-02, PX-03) · [Props] | P0 | AG hoặc Codex | `src/world/backdrop/*.ts` (mới), `src/world/dressing/sets/backdrop.ts` (mới), `tests/unit/backdrop.test.ts` (mới) | Stub `dressing` của N-04 | ≤ 25.000 tam giác, ≤ 12 lượt vẽ thêm; không va chạm; không thấy khoảng trống ngoài tường từ mọi khu |
| **N-08** | Phòng 2026: ấm từ đầu, đồ trong phòng, chuyển Mốc, timeskip, kết demo 9 Trang · [Script] | P0 | Sonnet | `src/content/hub.ts`, `src/config/hub.ts`, `src/game/scenes/hubScene.ts`, `tests/unit/hub.test.ts` | Duyệt 0.2, 0.3 | BG-4, B10 xong; hộp phấn + "Mấy năm sau…"; timeskip `[PLACEHOLDER]`; 3 tin kết theo bản đã duyệt |
| **N-09** | Form phản hồi thật + endpoint Firestore · [Web] | P0 | Codex | `src/ui/game/FeedbackForm.tsx` (mới), `api/feedback.ts` (mới), `api/_lib/firestore.ts`, `firestore.rules`, `src/ui/game/GameUi.tsx` (**chỉ** khối `s.feedback`), `tests/unit/feedback.test.ts` (mới) | Gộp sau N-02 (cùng sửa `GameUi.tsx`) | Gửi được 5 câu hỏi; ghi hoàn thành **trước** form; không gửi tên/email/IP; event `feedback_submitted` phát thật |
| **N-10** | Validator: chặn quest phụ không khởi động được (A-02) + kiểm bản production · [Script] | P0 | Codex | `src/content/validate.ts`, `tests/unit/validate.test.ts` | — | Luật `optional_quest_unstartable`; production báo lỗi rõ nếu còn `AI_PROPOSED` |
| **N-11a** | 4 trò Trang 1: mật lệnh K4, đá cầu K5, lau bảng K6, bóp mì K6 · [Scene] | P0 | Codex hoặc Opus | `src/game/minigames/games/{mg_cipher,mg_footbag,mg_wipe_board,mg_noodle}.ts` (mới), `tests/unit/mg_trang1.test.ts` (mới) | N-02 | 4 trò có luật, thắng/thua, Chơi lại, Bỏ qua; không chặn truyện |
| **N-11b** | 3 trò Trang 2–3: thả thuyền K5, dựng Căn cứ K3, viết luật K4 · [Scene] | P1 | Codex | `src/game/minigames/games/{mg_boat,mg_base_build,mg_rules}.ts` (mới), `tests/unit/mg_trang23.test.ts` | N-02 | Như N-11a; ghi `minigames.boat.result` |
| **N-12** | Người lớn + học sinh nền procedural (PX-70) · [Props] | P1 | Codex | `src/actors/character/presets.ts`, `src/actors/character/build.ts`, `tests/unit/rigAdapter.test.ts` | — | Cô Diệp, bác bảo vệ, chú tạp hóa, Tú, 4 học sinh nền; người lớn 1,55–1,70 m |
| **N-13** | Đạo cụ procedural Mốc 2 (PX-51…67) + bộ trang trí đêm Hội trại · [Props] | P1 | AG | `src/world/props/m2/*.ts` (mới), `src/world/dressing/sets/m2_*.ts` (mới), `tests/unit/props_m2.test.ts` | N-04, N-05 | Như N-06; đêm Hội trại có lửa + đèn dây |
| **N-14** | Ảnh tự sướng 3 lần chọn 1 (Trang 1) + ảnh cầu vồng lên bìa Album · [Scene] | P1 | Opus | `src/game/game.ts` (hàm `runPhoto`), `src/systems/album.ts`, `src/ui/game/GameUi.tsx` (vùng ảnh) | Gộp sau N-02, N-09 | Giữ được 1/3 ảnh vào `album.selected`; bìa Album hiện ảnh cầu vồng |
| **N-15a…e** | Số hóa **Main** Trang 5, 6, 7, 8, 9 (mỗi Trang một task) · [Script] | P1 | AG hoặc Sonnet | a: `src/content/days/d_g08_01.ts` · b: `d_g08_02.ts` · c: `d_g09_01.ts` · d: `d_g09_02.ts` · e: `d_g09_03.ts` (đều mới) | N-04 (marker), N-11 (mã trò) | Chép nguyên văn kịch bản; chỉ Main; Side = 0; bước trò dùng mã ở thẻ N-15 |
| **N-15f** | Tích hợp Mốc 2 vào gói nội dung · [Script] | P1 | Sonnet | `src/content/pack.ts`, `src/content/release.ts`, `src/content/chapters.ts`, `tests/unit/analyticsBridge.test.ts` | N-15a…e | Bản test chạy Trang 1→9; `end_day_id = 'd.g09.03'` |
| **N-16** | Trò Mốc 2 bản tối thiểu: Caro (1 mức AI), Sudoku (3 đề), Ném bóng, Săn góc ảnh, Trang trí Căn cứ · [Scene] | P1 | Codex / Opus | `src/game/minigames/games/{mg_caro,mg_sudoku,mg_throw,mg_photo_hunt,mg_decorate}.ts` (mới) + test | N-02, N-03 | Có nút Bỏ qua; ghi `minigames.caro.series` |
| **N-17** | Màn 2D Mốc 2: trang confession, làm hòm thư, viết/đọc thư · [Web] | P1 | Sonnet | `src/ui/game/screens/*.tsx` (mới) | N-02 | Mở/đóng bằng Esc; không chặn Main khi lỗi |
| **N-18** | Phát các event còn thiếu (`hub_opened`, `free_photo_taken`, …) · [Web] | P2 | Codex | `src/analytics/*`, `shared/events.ts` | N-02, N-14 | Mọi event có người nghe đều có người phát |
| **N-19** | Cập nhật e2e + đo FPS trên laptop thật · [Web] | P2 | Người + Sonnet | `tests/e2e/*.spec.ts` | Hầu hết task P0 | `npx playwright test --workers=1` đạt trên máy thật; FPS ghi vào handoff |
| **N-20** | `docs/ASSET_CREDITS.md` + cập nhật `DEMO_AUDIT.md` · [Docs] | P2 | Sonnet | `docs/ASSET_CREDITS.md` (mới), `docs/handoff/DEMO_AUDIT.md` | — | Ghi nguồn 7 GLB + "procedural, tự làm" |
| **N-21** | Thẻ minh họa 2D "ba cổng trường" (PX-80) + ảnh in dán tường Căn cứ (PX-42) · [Props] | P2 | AG | `src/ui/game/screens/ThreeGates.tsx` (mới), `src/world/props/m1/printedPhotos.ts` (mới) | N-17, N-06 | — |

**Thứ tự gộp gợi ý:** N-04 (stub) → N-03, N-10 → N-02 → N-01, N-05, N-06, N-07, N-08 → N-09 → N-11a → (P1) …
**Thang cắt nếu trễ (cắt từ dưới lên, chờ X-4):** N-21 → N-20 → N-17 (thay bằng thẻ thoại) → N-16 (chỉ giữ Caro) → N-13 (giữ hòm thư + lửa trại) → N-11b. **Không cắt:** N-01…N-10, N-11a, N-15a…f.

---

## Mục 2 — Thẻ giao việc chi tiết

### 2.0 Quy chuẩn chung — áp dụng cho MỌI task (prompt nào cũng nhắc đọc mục này)
1. **Git:** tạo worktree riêng từ `feat/sprint-0412`, nhánh `task/<mã>-<tên-ngắn>`:
   `git fetch origin && git worktree add ../gk-<mã> -b task/<mã>-<tên> origin/feat/sprint-0412`.
   Không `push --force`, không gộp vào `main`, không đổi nhánh trong thư mục người khác đang dùng. Mở PR vào `feat/sprint-0412`.
2. **Chỉ sửa file trong cột "File sở hữu"** của task. Cần đổi file khác → ghi vào PR.
3. **Nội dung:** không tự viết cốt truyện/thoại thật. Chữ chưa duyệt ghi `[PLACEHOLDER]` và quest gắn `ownership_label: 'AI_PROPOSED'`. Thoại lấy **nguyên văn** từ `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md`; đổi `[PLAYER_NAME]` → `{player_name}`, `[ÔNG_BÀ]` → `{g:ông|bà}` (chỉ khi Châu gọi **Player**).
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

### N-00 · Ghi quyết định 22/11 vào tài liệu gốc
- **Mục tiêu:** để mọi agent đọc `CLAUDE.md` thấy đúng phạm vi mới (A1), hướng asset mới (D3), timeskip (D5). Chỉ làm sau khi Game Director đồng ý X-1, X-2.
- **Đọc:** `docs/GDD_FULL_REVIEW.md` mục VII; `CLAUDE.md`; `docs/gdd/00_MASTER_GDD.md` §1.2, §4, §11; `docs/handoff/README.md`.
- **Việc:** `CLAUDE.md` §3 thay bằng 3 quyết định 22/11 (giữ 21/11 dưới dạng SUPERSEDED); §2 cập nhật commit nhánh; `00` §1.2 dòng "Bản public" → "Mốc 1 đầy đủ + Mốc 2 Main (CONFIRMED 22/11)"; §4 khối "CONFIRMED 21/11 (tối)" → SUPERSEDED + khối 22/11; §11 thêm mục 15 (A1), 16 (D3), 17 (D5); `README.md` trỏ tới `NEXT_SPRINT_TASK_BOARD.md`.
- **DoD:** chỉ 3 file đổi; không xóa lịch sử quyết định.
- **Prompt:**
```
Bạn là agent tài liệu cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 (quy chuẩn chung) và thẻ N-00, rồi đọc docs/GDD_FULL_REVIEW.md mục VII.
Tạo worktree nhánh task/N-00-quyet-dinh-2211 từ origin/feat/sprint-0412.
Sửa đúng 3 file: CLAUDE.md (§2, §3), docs/gdd/00_MASTER_GDD.md (§1.2, §4, §11), docs/handoff/README.md để ghi quyết định Game Director 22/11: A1 (Mốc 1 đầy đủ + Mốc 2 chỉ Main, kết demo sau Trang 9), D3 (asset mới dựng bằng Procedural Three.js, chỉ dùng lại GLB có sẵn ở public/assets/, nhân vật giữ bản dựng bằng code), D5 (thêm timeskip ngắn trước kết demo bản 9 Trang). Quyết định cũ 21/11 giữ lại, gắn SUPERSEDED. Không sửa file nào khác. Viết tiếng Việt, ngắn. Commit, push nhánh, mở PR vào feat/sprint-0412.
```

### N-01 · Sửa dữ liệu Mốc 1 theo quyết định B/C/D
- **Mục tiêu & quy chuẩn:** đưa 4 Trang Mốc 1 về đúng kịch bản theo các mục đã chốt: **B1** (Trang 1 tách 2 cảnh, 6 bước), **B2** (lỗi xưng hô), **B3** (giữ thoại code — câu "Tớ ước… thuyền tớ đừng lật" đã không có, không cần làm), **B5** (Trang 3), **B6** (Trang 4 thêm ảnh cầu vồng + thẻ "Mấy hôm sau"), **B7** (nhãn ghế đá), **C1** (Side/Daily AI → `AI_PROPOSED`), **C2** (bỏ bắn bi khỏi Trang 3), **C4**, **C5**, **D1**, **D2**. C6: sửa tài liệu AG cho khớp code.
- **Đọc:** mục 2.0; `docs/GDD_FULL_REVIEW.md` mục IV-B, IV-C, VII; `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` dòng 64–327 (Mốc 1); `src/content/types.ts` (kiểu `Step`); 4 file Trang; `docs/PAGE_DATA_GUIDE.md`.
- **Việc cụ thể:**
  - `d_g06_01.ts` (**B1, B2**): `q_m1_main_01` thành 7 bước: `s01 talk` (Đức nhặt vở, tìm lớp — target bảng phân lớp `itr.thcs.class_list`) → `s02 minigame game:'mg_cipher'` + thoại mật lệnh/Châu sửa → `s03 minigame 'mg_footbag'` + thoại đá cầu → `s04 minigame 'mg_wipe_board'` + thoại trực nhật (Đức lỡ "mày–tao") → `s05 cutscene` thẻ chữ "Mấy tháng sau" → `s06 minigame 'mg_noodle'` tại `itr.thcs.grocery_steps` → `s07 photo mode:'handheld' camera_id:'cam.d0601.grocery'` (ảnh bộ ba). Câu Châu "Mới quen một bữa mà {g:ông|bà} mày tao rồi hả?" → **"Mới quen một bữa mà ông mày tao rồi hả?"**. Thoại giữ như code (B3), chỉ chia lại vào đúng bước.
  - `d_g07_01.ts`: `cameras` đổi marker `cam.d0701.boats` → `cam.thcs.gutter`; bước `s04` đổi thành `minigame 'mg_boat'` (giữ thoại kết quả). Giữ tông lựa chọn (C3 đã duyệt).
  - `d_g07_02.ts` (**B5, C2, D2**): thêm bước `collect` 3 điểm `itr.thcs.base_survey_roof`, `itr.thcs.base_survey_stump`, `itr.thcs.base_survey_boxes`; lời lựa chọn `c_m1_03_decor` trả về **"Giấy màu" / "Hoa" / "Ảnh"** (giữ `id` và `tone`); bước dựng `minigame 'mg_base_build'`; bước luật `minigame 'mg_rules'`; ảnh chính = biển tên: camera `cam.d0702.base` đổi marker → `cam.thcs.base_sign`, `at_step_id` là bước treo biển. Gỡ `q_m1_side_04` khỏi `side_quests` (giữ định nghĩa, đổi nhãn như C1).
  - `d_g07_03.ts` (**B6, B7, C4, C5, D1**): `art_m1_05.appear_when` → `{ day: 'd.g07.02' }`; flag `m1.placeholder_tone` → `m1.group_photo_style`; tách cutscene `s05` thành `s05 cutscene` (mưa, chạy về Căn cứ) → `s06 photo mode:'timer' camera_id:'cam.d0703.rainbow'` (ảnh cầu vồng, `album_entry_id: 'alb.d.g07.03.cover'`) → `s07 cutscene` thẻ chữ "Mấy hôm sau" + thoại dán ảnh. Hết Trang khi giữ ảnh cầu vồng. Không đổi thoại.
  - **C1** cả 4 file: hằng `sideMeta` → `{ owner: 'DRAFT', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0' }`; mọi `title`, `objective`, `text` của Side/Daily thêm tiền tố `[PLACEHOLDER] `; đổi mã `q_m1_side_0N` → `q_m1_ai_side_0N`, `q_m1_daily_01` → `q_m1_ai_daily_01` (cập nhật `pde_03` sẽ do N-08 làm — ghi vào PR).
  - `tests/unit/contentPack.test.ts`: cập nhật số bước, mã mới. `DOI_CHIEU_TRANG_1_4.md` §5: thay mô tả "lời hẹn năm lớp 8" bằng "kiểu ảnh đủ năm đứa", ghi các mã mới.
  - **Mã trò dùng chung (không đổi tên):** `mg_cipher`, `mg_footbag`, `mg_wipe_board`, `mg_noodle`, `mg_boat`, `mg_base_build`, `mg_rules`.
  - **Marker mới (do N-04 tạo):** `itr.thcs.class_list`, `itr.thcs.grocery_steps`, `cam.thcs.grocery`, `cam.thcs.gutter`, `cam.thcs.base_sign`, `cam.thcs.rainbow`, `itr.thcs.base_survey_roof/stump/boxes`, `spot.thcs.eave_1…5`. Nếu N-04 chưa gộp: làm trước, gộp sau N-04.
- **DoD:** 4 lệnh ở 2.0 xanh; `validate` không còn lỗi nhãn; chạy `/?play=1` đi hết Trang 1→4 (trò hiện thẻ khung tạm nếu N-02 chưa xong).
- **Prompt:**
```
Bạn là agent nội dung (TypeScript) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-01 — làm ĐÚNG danh sách "Việc cụ thể", không thêm gì.
Tạo worktree nhánh task/N-01-sua-moc1 từ origin/feat/sprint-0412.
Chỉ sửa: src/content/days/d_g06_01.ts, d_g07_01.ts, d_g07_02.ts, d_g07_03.ts, tests/unit/contentPack.test.ts, docs/handoff/gemini/DOI_CHIEU_TRANG_1_4.md.
Thoại: KHÔNG viết câu mới. Chỉ chia lại thoại có sẵn trong code vào đúng bước; riêng lời lựa chọn Trang 3 đổi về "Giấy màu"/"Hoa"/"Ảnh", câu của Châu ở Trang 1 sửa "{g:ông|bà}" thành "ông". Side/Daily đổi nhãn AI_PROPOSED + [PLACEHOLDER] và đổi mã như thẻ ghi.
Dùng đúng mã trò (mg_cipher, mg_footbag, mg_wipe_board, mg_noodle, mg_boat, mg_base_build, mg_rules) và mã marker trong thẻ.
Chạy: npx tsc --noEmit; npm test; npm run validate:world; VERCEL_ENV=production npm run build. Dán kết quả thật vào PR. Nếu validate báo thiếu marker vì N-04 chưa gộp, ghi rõ trong PR, không tự sửa file world.
Commit nhỏ, push, mở PR vào feat/sprint-0412.
```

### N-02 · Khung minigame chung + sổ đăng ký trò + sửa lỗi A-01
- **Mục tiêu & quy chuẩn:** thay thẻ giả 1 nút (`src/game/game.ts` khoảng dòng 178–186, `GameUi.tsx` khoảng 212–215) bằng khung thật theo GDD `02` §1.1: màn luật → chơi → kết quả (thắng/thua/hòa hoặc sao) → **Chơi lại** / **Đi tiếp**; luôn có **Bỏ qua** (thua/bỏ không chặn truyện). Trò là module độc lập, đăng ký tự động để nhiều người thêm trò song song không đụng nhau.
- **Đọc:** mục 2.0; `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §1, §2.4; `src/game/game.ts` (dòng 150–200, 440–480, 560–580); `src/ui/game/GameUi.tsx`; `src/ui/game/store.ts`; `shared/events.ts` (`minigame_started`, `minigame_finished`); `docs/handoff/DEMO_AUDIT.md` B-05 (A-01).
- **Việc:**
  - `src/game/minigames/types.ts`: `interface MinigameModule { id: string; title: string; rulesText: string; kind: 'K1'|'K2'|'K3'|'K4'|'K5'|'K6'|'special'; mount(el: HTMLElement, ctx: MinigameCtx): MinigameInstance }`; `MinigameCtx { onFinish(r: MinigameResult): void; seed: number; opponentId: string|null; difficulty: string|null; save: { get(key): unknown; set(key, v): void } }`; `MinigameResult { result: 'win'|'lose'|'draw'|'complete'|'skipped'; score?: number; stars?: number; hints_used?: number }`.
  - `registry.ts`: `const mods = import.meta.glob('./games/*.ts', { eager: true })` → `getMinigame(id)`; id lạ → trả `mg_fallback` (thẻ "Xong" như cũ) để không vỡ truyện.
  - `host.ts` + `src/ui/game/MinigameFrame.tsx`: khung 2D phủ màn (Preact), nút Luật / Chơi lại / Bỏ qua; phím Esc = hỏi Bỏ qua.
  - `game.ts`: nhánh `s.kind === 'minigame'` gọi host; phát `minigame_finished` với **kết quả thật**; lưu `minigames.<id>.first_result` (qua API của N-03; nếu N-03 chưa gộp thì lưu vào `save.flags['mg.<id>.result']` và ghi PR).
  - **A-01:** bước `goto` phải xong khi người chơi **đã đứng sẵn** trong bán kính hoặc vào bán kính lúc giao diện khóa — kiểm lại khi bước bắt đầu và khi mở khóa (khu vực `proximity()`).
  - Trò mẫu `src/game/minigames/games/mg_demo.ts` (bấm 3 lần là thắng) để test.
- **DoD:** unit test host (win/lose/skip/replay), test A-01; 4 lệnh 2.0 xanh; e2e cũ không vỡ (chạy trên máy thật nếu có).
- **Prompt:**
```
Bạn là agent engine (TypeScript, Preact, Three.js) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-02.
Tạo worktree nhánh task/N-02-khung-minigame từ origin/feat/sprint-0412.
Chỉ sửa/tạo: src/game/game.ts, src/game/minigames/{types,registry,host}.ts, src/game/minigames/games/mg_demo.ts, src/ui/game/MinigameFrame.tsx, src/ui/game/GameUi.tsx (chỉ vùng minigame), src/ui/game/store.ts, tests/unit/minigameHost.test.ts.
Làm đúng interface trong thẻ (MinigameModule, MinigameCtx, MinigameResult), registry dùng import.meta.glob('./games/*.ts', {eager:true}), id lạ rơi về mg_fallback. Thua hoặc Bỏ qua KHÔNG chặn câu chuyện. Phát minigame_started/minigame_finished với kết quả thật. Sửa lỗi A-01 (bước goto khi đã đứng sẵn trong bán kính) và viết test.
Chạy 4 lệnh kiểm ở mục 2.0, dán kết quả thật. Commit nhỏ, push, mở PR.
```

### N-03 · Lưu bản v3 + chuyển đổi v2→v3
- **Mục tiêu:** thêm trường GDD `02` §4.2 mà **không xóa** tiến trình người chơi (hiện tăng `SAVE_VERSION` là xóa sạch — B-07).
- **Đọc:** mục 2.0; `src/core/save.ts`; `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §4.
- **Việc:** `SAVE_VERSION = 3`; thêm `minigames: Record<string, { wins: number; losses: number; draws: number; first_result?: string; best?: number; last_at?: number }>` + `minigames_caro_series: { player: number; opponent: number }` (bắt đầu 3–3), `story: { valentine?: { recipient?: string; kind?: string; groupMsg?: string; boxStyle?: string } }`, `hub_unlocked: boolean`. Hàm `migrate(p: unknown): SaveState` nâng v2 → v3 (giữ mọi trường cũ, thêm mặc định); chỉ `drop()` khi không đọc được. Xuất `getMg(id)`, `recordMg(id, result)`.
- **DoD:** test: bản v2 mẫu → v3 giữ `days`, `album`, `flags`, `player_name`; bản rác → bản mới; 4 lệnh xanh.
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
- **Mục tiêu & quy chuẩn:** **BG-4** (phòng ấm từ đầu), **B10** (mở thùng trước, độc thoại sau), đồ trong phòng PX-50, **chuyển Mốc** (ảnh lên bìa → thẻ "Mấy năm sau…" → hộp phấn sáng, mở Trang 5), **D5** timeskip `[PLACEHOLDER]`, **kết demo bản 9 Trang** theo bản B8/B9 đã duyệt ở Mục 0.2. Đổi mã `pde_03` theo C1.
- **Đọc:** mục 2.0; Mục 0.2, 0.3 file này; kịch bản §MỞ ĐẦU, §Chuyển sang Mốc 2, §KẾT DEMO (dòng 47–62, 324–328, 859–874); `src/content/hub.ts`, `src/config/hub.ts`, `src/game/scenes/hubScene.ts`, `src/systems/hub.ts` (chỉ đọc).
- **Việc:** `config/hub.ts`: mọi `lighting_by_days_done` dùng một preset ấm; `hubScene.ts`: thêm đèn bàn, khung kính, khung ảnh tường, thảm, rèm, cửa sổ đêm (procedural, theo 2.0); `hub.ts`: đảo `q_hub_pd_01` (interact thùng trước, cutscene sau); thêm kỷ vật `art_m2_01` hộp phấn (`appear_when: { day: 'd.g07.03' }`, `target_memory_day_id: 'd.g08.01'`, shape mới `'box'` nếu cần thì ghi PR) và PDE thẻ "Mấy năm sau…"; chuỗi kết: `pde_06` đổi trigger sang `{ day: 'd.g09.03' }`; thêm quest `q_hub_pd_timeskip` (cutscene `[PLACEHOLDER]`, `AI_PROPOSED`) trước `q_hub_pd_02`; thêm bước sổ luật (độc thoại "Được dời, không được hủy…"); 3 tin kết theo bản duyệt. Nếu Mục 0.2/0.3 chưa duyệt: giữ chữ cũ, gắn `[PLACEHOLDER]` + `AI_PROPOSED`.
- **DoD:** test hub (thứ tự mở đầu, kỷ vật hộp phấn sáng sau Trang 4, kết chỉ mở sau Trang 9); 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent nội dung + cảnh phòng 2026 cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0, Mục 0.2, 0.3 và thẻ N-08.
Worktree nhánh task/N-08-hub-ket-demo từ origin/feat/sprint-0412. Chỉ sửa: src/content/hub.ts, src/config/hub.ts, src/game/scenes/hubScene.ts, tests/unit/hub.test.ts.
Làm đúng danh sách việc. Thoại lấy nguyên văn kịch bản docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md; phần chưa được Game Director duyệt (timeskip, dòng chat cũ, tin kết nếu chưa chốt) phải ghi [PLACEHOLDER] và ownership_label AI_PROPOSED. Không viết thoại mới ngoài bản nháp đã ghi ở Mục 0.3.
Đồ trong phòng dựng procedural (min.y = 0, toon, sRGB). Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-09 · Form phản hồi thật + endpoint Firestore
- **Mục tiêu:** bằng chứng kinh doanh cho môn học (B-04). Giữ thứ tự **ghi hoàn thành trước form**; không gửi tên/email/IP.
- **Đọc:** mục 2.0; GDD `02` §5; `api/collect.ts`, `api/_lib/firestore.ts`, `firestore.rules`; `src/ui/game/GameUi.tsx` khối `s.feedback` (khoảng dòng 252); `src/analytics/tracker.ts`; `shared/events.ts`.
- **Việc:** `FeedbackForm.tsx`: 5 câu `[PLACEHOLDER]` tới khi nhóm gửi câu thật (thang 1–5 "Bạn thấy hoài niệm thế nào?", "Muốn chơi tiếp phần sau không?", chọn Trang thích nhất, có/không "giới thiệu cho bạn", 1 ô ý kiến ≤ 300 ký tự — **lọc số điện thoại/email trước khi gửi**); `api/feedback.ts` (POST, kiểm `attempt_id`, giới hạn kích thước, ghi `COLLECTIONS.feedback`); quy tắc Firestore chỉ cho server ghi; phát `feedback_submitted`; tách dữ liệu `test` và `production` theo `release_stage`.
- **DoD:** test API (hợp lệ, quá dài, có email bị lọc); 4 lệnh xanh; thử thật trên Vercel Preview ghi được 1 bản (ghi rõ đã/chưa thử).
- **Prompt:**
```
Bạn là agent web (Preact + Vercel API + Firestore) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-09.
Worktree nhánh task/N-09-form-phan-hoi từ origin/feat/sprint-0412 (gộp SAU N-02 vì cùng sửa GameUi.tsx — chỉ sửa khối s.feedback).
Chỉ sửa/tạo: src/ui/game/FeedbackForm.tsx, api/feedback.ts, api/_lib/firestore.ts, firestore.rules, src/ui/game/GameUi.tsx (khối feedback), tests/unit/feedback.test.ts.
Câu hỏi để [PLACEHOLDER]. Không gửi tên, email, IP; lọc email/số điện thoại trong ô ý kiến. Ghi hoàn thành demo phải xảy ra trước khi mở form. Không dán khóa bí mật vào repo. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-10 · Validator A-02 + kiểm bản production
- **Đọc:** mục 2.0; `src/content/validate.ts` (khoảng dòng 130–170, 260–290); `docs/handoff/DEMO_AUDIT.md` B-06.
- **Việc:** luật `optional_quest_unstartable` (Side/Daily có bước đầu `goto`/`interact` trỏ marker không tồn tại hoặc ngoài `open_zones` của Trang); luật `minigame_unknown_id` ở mức **cảnh báo** (đối chiếu danh sách mã trò ở thẻ N-01, N-16); thông báo production liệt kê từng quest `AI_PROPOSED` bị chặn.
- **DoD:** test cho 3 luật; 4 lệnh xanh.
- **Prompt:**
```
Bạn là agent kiểm dữ liệu cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-10. Worktree nhánh task/N-10-validator. Chỉ sửa src/content/validate.ts và tests/unit/validate.test.ts. Thêm 3 luật như thẻ, viết test. Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-11a · Bốn trò Trang 1 (P0) · N-11b · Ba trò Trang 2–3 (P1)
- **Mục tiêu:** trò chơi thật theo GDD `02` §2.4 (luật, thắng/thua, Chơi lại), qua khung N-02. Thua không chặn truyện.
- **Đọc:** mục 2.0; `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §1, §2.4.1 (đá cầu), §2.4.2 (thuyền), §2.4.3 (bóp mì), §2.4.4 (lau bảng), §2.4.6 (mật lệnh, dựng Căn cứ, viết luật); `src/game/minigames/types.ts` (N-02).
- **Việc (mỗi trò một file trong `src/game/minigames/games/`, `export default` một `MinigameModule`):** N-11a: `mg_cipher` (K4 nối ký hiệu ↔ chữ, Châu gợi ý chỗ sai), `mg_footbag` (K5 canh nhịp chuyền cầu), `mg_wipe_board` (K6 giữ chuột lau, dùng texture `chalkSmudge` nếu N-06 đã có, không thì vẽ canvas riêng), `mg_noodle` (K6 giữ tới khi đầy). N-11b: `mg_boat` (K5 nạp lực + thả đúng nhịp; Quân luôn nhất, thắng khi về đích không lật — GDD `01` §10 mục 12; lưu `minigames.boat.result`), `mg_base_build` (K3 kéo–đặt thùng/bàn), `mg_rules` (K4 ghi 5 điều theo lượt, chữ **nguyên văn** kịch bản). Giao diện 2D trong khung, chữ to, nền giấy.
- **DoD:** test logic từng trò (thắng/thua/bỏ); chơi được bằng chuột + bàn phím; 4 lệnh xanh.
- **Prompt (đổi danh sách trò theo N-11a / N-11b):**
```
Bạn là agent làm minigame (TypeScript + Preact/Canvas 2D) cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-11, GDD docs/gdd/02_GAMEPLAY_AND_MECHANICS.md §1 và §2.4.
Worktree nhánh task/N-11a-tro-trang1 (hoặc N-11b) từ origin/feat/sprint-0412 SAU khi N-02 đã gộp.
Chỉ tạo file mới trong src/game/minigames/games/ (mỗi trò một file, export default MinigameModule) và tests/unit/mg_*.test.ts. Không sửa registry hay game.ts.
Làm các trò: <mg_cipher, mg_footbag, mg_wipe_board, mg_noodle> (hoặc <mg_boat, mg_base_build, mg_rules>). Mỗi trò có luật hiển thị, thắng/thua, Chơi lại, Bỏ qua; thua không chặn truyện. Chữ trong trò lấy nguyên văn kịch bản, không tự viết thoại.
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
- **Việc:** `src/world/props/m2/`: `chalkBox.ts` (PX-51, nắp ghi tỉ số đọc `minigames_caro_series`), `banners.ts` (PX-60), `caroSheet.ts` (PX-61), `basketHoop.ts` (PX-62, chỉ làm nếu GLB sân chưa có cột rổ — kiểm trước), `mailbox.ts` (PX-63, 3 kiểu theo `story.valentine.boxStyle`, bảng 3 điều chữ nguyên văn), `countdown.ts` (PX-64, số 270/197), `grocery2018.ts` (PX-65 tivi + tờ lịch), `campNight.ts` (PX-66: lửa dùng `addCampfire` của N-05, đèn dây InstancedMesh, 3 lều, cờ giấy, cổng trại 3 kiểu `'rocket'|'leaf'|'plain'`), `yearbook.ts` (PX-67). Bộ gắn `dressing/sets/m2_*.ts` theo `dayId`.
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
- **Mục tiêu & quy chuẩn:** A1 — **chỉ tuyến Main**. Side, Daily, Khu Vui Chơi, lật chai, Hội trại Phần 2–3, 4 nhánh rút gọn Valentine: **không làm** (Trang 6 Cảnh D bước 3: chỉ 3 nhánh minigame chính; nếu thư Player trỏ tới nhánh rút gọn → dẫn về nhánh "Trang trí Căn cứ"). Thoại **nguyên văn** kịch bản; `meta = HUMAN_CANON` chỉ cho câu chép nguyên văn; câu nối do agent thêm → `[PLACEHOLDER]` trong quest `AI_PROPOSED` riêng.
- **Đọc:** mục 2.0; `docs/PAGE_DATA_GUIDE.md`; một file mẫu đã đúng (`src/content/days/d_g07_01.ts`); kịch bản: Trang 5 dòng 331–395 · Trang 6 dòng 396–635 + `docs/gdd/IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md` · Trang 7 dòng 636–701 · Trang 8 dòng 702–778 · Trang 9 dòng 779–858; Phụ lục A, B, E.
- **Quy ước mã:** Trang 5 `d.g08.01` quest `q_m2_main_05`, kỷ vật `art_m2_01` (do N-08 khai) · Trang 6 `d.g08.02` `q_m2_main_06`, `art_m2_02` · Trang 7 `d.g09.01` `q_m2_main_07`, `art_m2_03` · Trang 8 `d.g09.02` `q_m2_main_08`, `art_m2_04` · Trang 9 `d.g09.03` `q_m2_main_09`, `art_m2_05`. `map_variant`: g08 / g09 / `g09_night` (Hội trại) / `g09_end`. Flag lưu: `m2.duty_partner` (T5), `story.valentine.*` (T6), `m2.newspaper_truth` (T7), `m2.camp_gate` (T8), `m2.final_photo` (T9). Mã trò: `mg_caro`, `mg_sudoku`, `mg_throw`, `mg_photo_hunt`, `mg_decorate`, `mg_mailbox_build`.
- **N-15f:** `pack.ts` thêm 5 Trang; `release.ts` bản `test`: 9 Trang, `end_day_id: 'd.g09.03'`; `chapters.ts` thêm `ch_m2`; cập nhật `analyticsBridge.test.ts` `playAll` 9 Trang.
- **DoD:** mỗi Trang chạy được từ đầu tới ảnh chính; 4 lệnh xanh.
- **Prompt (thay `<X>`):**
```
Bạn là agent số hóa kịch bản cho repo KusaThaor/GAME-KNDMST. Đọc docs/NEXT_SPRINT_TASK_BOARD.md mục 2.0 và thẻ N-15, docs/PAGE_DATA_GUIDE.md, file mẫu src/content/days/d_g07_01.ts.
Worktree nhánh task/N-15<x>-trang<X> từ origin/feat/sprint-0412. Chỉ tạo src/content/days/<file của Trang X> (không sửa pack.ts/release.ts — việc của N-15f).
Chỉ làm tuyến MAIN của Trang <X> theo docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md dòng <...>. Chép thoại NGUYÊN VĂN, đổi [PLAYER_NAME] → {player_name}, [ÔNG_BÀ] → {g:ông|bà}. Không viết thoại mới; câu nối bắt buộc thì ghi [PLACEHOLDER] trong quest AI_PROPOSED riêng. Dùng đúng mã quest/kỷ vật/flag/trò trong thẻ. Không làm Side/Daily.
Chạy 4 lệnh kiểm, dán kết quả thật, mở PR.
```

### N-16 · Trò Mốc 2 bản tối thiểu
- **Đọc:** mục 2.0; GDD `02` §2.1 (Caro), §2.2 (Sudoku), §2.5.3a–c; `src/game/minigames/types.ts`; `src/core/save.ts` (N-03).
- **Việc:** `mg_caro` (12×12, 5 ô thắng, **1 mức AI** "Đức dễ", cập nhật `minigames_caro_series`), `mg_sudoku` (9×9 mức Vừa, 3 đề cứng, đồng hồ 6 phút, sao), `mg_throw` (K5 ném bóng tính điểm), `mg_photo_hunt` (K2 săn 3 góc ảnh — dùng khung ảnh có sẵn), `mg_decorate` (K3 trang trí Căn cứ), `mg_mailbox_build` (K3 chọn nền + họa tiết → `story.valentine.boxStyle`). Có Bỏ qua.
- **DoD + Prompt:** như N-11 (đổi danh sách trò).

### N-17 · Màn 2D Mốc 2
- **Đọc:** mục 2.0; GDD `00` §5.1 (màn hình 2D), `02` §2.5.1–2.5.4; `IMPLEMENTATION_HANDOFF_TRANG6_VALENTINE.md`.
- **Việc:** `src/ui/game/screens/ConfessionPage.tsx` (trang confession hư cấu, tên trang tự nghĩ), `LetterWrite.tsx` (chọn người nhận × loại thư), `LetterRead.tsx`; mở/đóng Esc; mở bằng bước `minigame` với mã `mg_screen_confession`, `mg_screen_letter_write`, `mg_screen_letter_read` (không cần sửa engine).
- **DoD + Prompt:** như N-11; chữ nguyên văn kịch bản.

---

## Mục 3 — Bản đồ quyền sở hữu file (kiểm nhanh trước khi nhận task)

| File / thư mục | Chủ (P0) | Chủ (P1, sau khi P0 gộp) |
|---|---|---|
| `src/game/game.ts` | N-02 | N-14 |
| `src/ui/game/GameUi.tsx` | N-02 (vùng minigame) → N-09 (khối feedback) | N-14 (vùng ảnh) |
| `src/game/scenes/dayScene.ts` | N-04 | — (không ai sửa thêm) |
| `src/world/{world,types,validate,extras}.ts`, `maps/map_thcs.extras.ts` | N-04 | N-04 (thêm marker Mốc 2 theo yêu cầu N-15) |
| `src/world/{variants,sky,atmosphere}.ts`, `src/render/fx.ts`, `src/content/base.ts`, `src/content/types.ts` | N-05 | N-05 |
| `src/world/props/m1/**`, `dressing/sets/m1_*` | N-06 | — |
| `src/world/props/m2/**`, `dressing/sets/m2_*` | — | N-13 |
| `src/world/backdrop/**`, `dressing/sets/backdrop.ts` | N-07 | — |
| `src/content/days/d_g06_01…d_g07_03.ts` | N-01 | — |
| `src/content/days/d_g08_*.ts`, `d_g09_*.ts` | — | N-15a…e (mỗi file một task) |
| `src/content/{pack,release,chapters}.ts` | — | N-15f |
| `src/content/hub.ts`, `src/config/hub.ts`, `hubScene.ts` | N-08 | N-08 |
| `src/core/save.ts` | N-03 | — |
| `src/content/validate.ts` | N-10 | — |
| `src/game/minigames/{types,registry,host}.ts` | N-02 | — |
| `src/game/minigames/games/*.ts` | N-11a (4 file) | N-11b, N-16, N-17 (mỗi trò một file) |
| `src/actors/character/**` | — | N-12 |
| `api/**`, `firestore.rules`, `FeedbackForm.tsx` | N-09 | — |
| `CLAUDE.md`, `docs/gdd/00_MASTER_GDD.md`, `docs/handoff/README.md` | N-00 | — |
