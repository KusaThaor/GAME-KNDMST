# GDD_FULL_REVIEW — Bản duyệt GDD, đối chiếu mâu thuẫn và chốt phạm vi demo

| Trường | Giá trị |
|---|---|
| Ngày | 22/11/2026 (UTC+7) |
| Người lập | Claude (Opus) — phiên rà soát, **không sửa code, không sửa GDD** |
| Nhánh / commit đọc | `feat/sprint-0412` @ `d5531b2` (đã chứa toàn bộ commit số hóa Trang 1–4 của Antigravity/Gemini: `a864843` → `4290469`) |
| Nguồn đã đọc | `CLAUDE.md`, `docs/gdd/00_MASTER_GDD.md` (v1.2-draft), `01_NARRATIVE_AND_SCENES.md`, `02_GAMEPLAY_AND_MECHANICS.md` (§1–6 lướt, §4.2 đọc kỹ), `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.6-draft; Mốc 1 + Kết demo + Phụ lục đọc kỹ, Mốc 2 đọc mục lục), `docs/handoff/DEMO_AUDIT.md`, `SPRINT_TASKS.md` (bảng + T-08), `docs/handoff/gemini/*` (HANDOFF_TO_CLAUDE, QUESTIONS_LOG, DOI_CHIEU_TRANG_1_4), `src/content/{days/*,hub.ts,release.ts,chapters.ts,cast.ts,types.ts}`, `src/core/{save.ts,conditions.ts}`, `src/systems/questEngine.ts` (phần flag), `src/config/game.ts`, `shared/events.ts`, `src/world/maps/map_thcs.index.json` |
| Chưa đọc kỹ | Thân Mốc 2 trong kịch bản (Trang 5–9, chỉ đọc mục lục + bảng GDD), `03_ASSETS_AND_AUDIO.md`, `S2_*`, `WORKSPACE.md` |
| Đã chạy lệnh test? | **Không.** File này chỉ là đọc–đối chiếu. Kết quả `tsc`/`npm test` nêu dưới đây là do Antigravity báo, chưa kiểm lại |

> **Hai điều cần đọc trước khi đọc phần còn lại**
> 1. **Năm học trong yêu cầu rà soát lệch canon.** Yêu cầu ghi "Mốc 1 lớp 6 2012, Mốc 2 lớp 9 2014, Mốc 3 2026". Canon đã CONFIRMED 20/11: **Mốc 1 = lớp 6–7 (2014–2016), Mốc 2 = lớp 8–9 (2016–2018), Mốc 3 = lớp 10–12 (2018–2021, ngoài bản public)**; **2026 là phòng Hub hiện tại, không phải Mốc 3**. "Lớp 6 năm học 2012–2013" đã SUPERSEDED (`00` §2.2, D-23). File này dùng canon.
> 2. **Phạm vi demo trong yêu cầu lệch quyết định mới nhất.** Yêu cầu nói "Demo tới Mốc 2". Quyết định chủ dự án **21/11 (tối)**: bản đo 05–15/12 = **trọn Mốc 1 (Trang 1→4)**, Mốc 2 lùi sau 15/12 (`CLAUDE.md` §3, `00` §4 và §11 mục 13). Mục V trình bày cả hai để anh/chị chốt lại — **chưa làm gì trái quyết định 21/11**.

---

## I. Cốt truyện và nhân vật

### I.1 Khung lớn
Năm 2026, `{player_name}` 23 tuổi, sống một mình trong phòng trọ, lục ra thùng đồ cũ "Đồ cũ – đừng vứt": một Album gần như trống và các món đồ thời cấp 2. Mỗi món (kỷ vật) dẫn về **một Trang** ký ức ở một trường THCS hư cấu ở thị trấn miền Nam. Chơi xong Trang → về phòng → trang Album phục hồi, kỷ vật lên kệ, kỷ vật kế tiếp sáng. Kết demo: mở điện thoại, tìm lại nhóm chat cũ, gửi một tin. Không có hội ngộ, không có ending trong bản public (D-08 UNDECIDED).

Chủ đề: **Mốc 1 — Tìm thấy nhau**, **Mốc 2 — Sợ mất nhau**. Cozy, không phản diện; mọi mâu thuẫn được hàn gắn trong cùng Trang hoặc Trang kế.

### I.2 Mạch truyện từng Trang

| Phần | Trang · mã | Thời điểm | Diễn biến chính (kịch bản v1.4/v1.6) | Kỷ vật dẫn vào | Kết Trang khi |
|---|---|---|---|---|---|
| **Mở đầu** | Hub | 2026, buổi tối | Nhập tên + chọn nam/nữ → mở thùng → mở mẩu giấy mật lệnh → 2 câu độc thoại → trống trường, chuyển vào ký ức | — | Mở mẩu giấy |
| **Mốc 1** | 1 · `d.g06.01` Mật lệnh số 01 | 9/2014 → HK I lớp 6 | Cảnh A "Ngày đầu lớp 6": Đức nhặt vở, dẫn tìm lớp → mật lệnh trong giờ học, Châu sửa bút đỏ, biệt danh "Châu Tổng" ra đời → đá cầu → trực nhật lau bảng (Đức lỡ "mày–tao"). Cảnh B "Mấy tháng sau": tiệm tạp hóa cổng trường, bóp gói mì chia ba → ảnh tự sướng bộ ba (3 lần chụp, chọn 1) | Mẩu giấy mật lệnh sửa đỏ | Giữ ảnh bộ ba |
| | 2 · `d.g07.01` Thuyền giấy dưới mái hiên | Đầu lớp 7, chiều mưa (9–10/2015) | Trú mưa → làm quen Hạ, Quân (lớp bên) đang gấp thuyền → viết lời ước lên buồm (chọn 1/3) → đua thuyền trên rãnh nước (Đức lật, Quân xa nhất), chụp 5 thuyền lúc vừa thả → vớt thuyền Hạ, Player chép lại lời ước, cả năm ký tên | Thuyền giấy của Hạ, buồm có chữ ký + lời ước | Ký xong buồm |
| | 3 · `d.g07.02` Căn cứ bí mật | Đầu HK II lớp 7 (2016) | Đức rủ tìm chỗ riêng → khảo sát góc sân sau gần nhà kho (mái che, gốc cây, thùng giấy) → dựng Căn cứ + chọn trang trí (giấy màu/hoa/ảnh) → viết 5 điều luật vào sổ bìa xanh (mỗi người 1 điều) → treo biển, chụp biển tên | Biển "CĂN CỨ BÍ MẬT" + sổ luật bìa xanh | Giữ ảnh biển tên |
| | 4 · `d.g07.03` Đủ năm đứa | Cuối lớp 7, phượng chớm nở (5/2016) | Xem ảnh cũ ở Căn cứ → chuẩn bị ở gốc phượng → ảnh hẹn giờ 10 giây, máy đặt trên ghế đá (chọn kiểu ảnh nghiêm túc/tự nhiên/hài) → mưa rào, chạy về Căn cứ → cầu vồng, hẹn giờ lần 2 → "Mấy hôm sau" dán ảnh in lên tường Căn cứ | Ảnh nhóm bị ố | Giữ ảnh cầu vồng |
| Chuyển Mốc | Hub | — | Ảnh lên bìa Album → thẻ "Mấy năm sau…" → hộp phấn móp sáng | Hộp phấn (KV-01) | Mở hộp phấn |
| **Mốc 2** | 5 · `d.g08.01` Lên lớp 8 | Khai giảng 9/2016 | Trường xếp lại lớp, năm đứa chung lớp; trực nhật cặp; **ván Caro** dang dở, bác bảo vệ nhắc khóa cổng; tỉ số ghi lên nắp hộp phấn | KV-01 hộp phấn | (xem kịch bản) |
| | 6 · `d.g08.02` Valentine — Hòm thư của năm đứa | 9/2 → 14/2/2017 | **4 cảnh** (CONFIRMED 21/11): A thứ Năm confession của Hạ trên trang trường, Đức trêu 3 lần, Châu họp khẩn → B thứ Sáu làm hòm thư tình bạn + Đức xin lỗi bằng thư → C thứ Hai tiết Toán (Quân) → D thứ Ba 14/2: viết thư Valentine, **3 minigame đầy đủ** buổi chiều (Ném bóng · Săn góc ảnh · Trang trí Căn cứ), mở hòm thư tối, ảnh nhóm bên hòm thư | Tờ vẽ chiếc lá "Chưa dám đưa" | Ảnh nhóm bên hòm thư |
| | 7 · `d.g09.01` Tờ báo tường cuối cùng | HK I lớp 9 (9–11/2017) | Bảng đếm ngược 270 → 197; **Sudoku** (đua 6 phút với Châu); báo tường 20/11; Đức–Châu cãi nhau | Báo tường A5 chép tay | (xem kịch bản) |
| | 8 · `d.g09.02` Rã băng | 27/1/2018 + Hội trại 3/2018 | Xem chung kết U23 ở tiệm tạp hóa → Hội trại đêm ở sân trường (Phần 1 + 4 bắt buộc); Đức nói chuyện dọn nhà; Đức–Châu làm lành | Tờ lịch 1/2018 khoanh 27 | (xem kịch bản) |
| | 9 · `d.g09.03` Vẫn đủ năm đứa | Bế giảng 5/2018 | Lưu bút; Căn cứ: Châu viết **Điều 6 "Gặp nhau ít nhất mỗi tháng. Được dời, không được hủy."**, năm đứa ký; gốc phượng, ảnh chính (1/3); cutscene "Cuối hè" ba cổng trường | Sổ lưu bút bìa kraft | Hết cutscene "Cuối hè" |
| **Kết demo** | Hub | 2026 | Lấy sổ luật → Điều 6 → điện thoại, nhóm chat cũ (tin cuối từ rất lâu) → chọn 1/3 tin → Gửi → "Đã gửi… (còn tiếp)" → ghi hoàn thành → form phản hồi | — | Gửi tin |
| Mốc 3 | — | Lớp 10–12, 2018–2021 | Ba trường, COVID lớp 11, giữ nhóm 5 người | — | **Ngoài bản public** |

Chia trường cuối lớp 9 (CONFIRMED 19/11): Player + Hạ một trường; Đức + Quân một trường; Châu một mình ở trường Chuyên.

### I.3 Hồ sơ 5 nhân vật chính

| Nhân vật | Mã code / vai | Vai trong nhóm | Tính cách | Nỗi lo riêng | Nhận diện | Xưng hô (CONFIRMED 19/11) |
|---|---|---|---|---|---|---|
| **Player** `{player_name}` | `player` | Người giữ kỷ niệm, "chất keo" | Hay quan sát, ít nói, luôn cầm máy ảnh compact, có sổ nhỏ | Sợ lớn lên ai cũng bận | Máy ảnh, ba lô màu | Theo người đối diện: với Đức "mày–tao" (đã thân), với Châu "tui–bà", với Quân "cậu–tớ", với Hạ "tớ"+tên; nói thật lòng/2026: "mình" |
| **Đức "Tí Nổ"** | `chr_duc` = `NPC_A` | Người bày trò | Ồn ào, làm trước nghĩ sau, đùa quá đà nhưng biết xin lỗi thật | Nhà sắp dọn đi (giấu tới Hội trại) | Gầy, tóc dựng, xoay bút, túi bi ve | Mới quen "cậu–tớ"; lỡ "mày–tao" cuối Trang 1 cảnh A; từ cảnh B "mày–tao" với Player, Châu; Trang 2 vẫn "tớ" với Quân, Hạ; từ Trang 3 "mày–tao" với cả nhóm |
| **Minh Châu "Châu Tổng"** | `chr_chau` = `NPC_B` | Người lên kế hoạch | Nghiêm, hay sửa lỗi, "quậy ngầm" | Áp lực con ngoan trò giỏi, phải vào Chuyên | Tóc buộc gọn, đồng hồ, sổ chia ngăn, bút nhiều màu | "tui"; gọi bạn nam "ông", bạn nữ "bà", Player `{g:ông\|bà}`; nhóm lẫn nam nữ: "hai người/mấy người" |
| **Quân "Bắp"** | `chr_quan` = `NPC_D` | Người che chở | Thật thà, ít nói, to cao nhất | Sợ học chậm, thành gánh nặng | To cao, tóc húi cua, quả bóng cũ | "cậu–tớ", kể cả khi Đức gọi "mày" |
| **Hạ "Mây"** | `chr_ha` = `NPC_C` | Người nhạy cảm | Mơ mộng, dịu dàng, ép lá, vẽ chiếc lá ở mép vở | Sợ bị bỏ quên | Tóc dài, kẹp tóc, sổ vẽ, lá ép | Tự xưng "Hạ", gọi bạn bằng tên |

Ai gặp Player ở lớp 6: **Đức + Châu** (D-01 CONFIRMED 19/11, `cast.ts` bảng A đang bật). Quân, Hạ học lớp bên ở lớp 7; lớp 8 chung lớp.
Nhân vật phụ: cô Diệp (chủ nhiệm 8–9, tên tạm), bác bảo vệ (Trang 5), Tú (Trang 6, tên tạm), chú chủ tiệm tạp hóa (Trang 8), "bạn hay ngồi ở thư viện" (Hạ thầm thích, không lộ mặt, không phải Player).

### I.4 Sự kiện, nhánh rẽ và ending
- **Không có ending/nhánh rẽ cốt truyện** trong bản public. Mọi Trang đi tuyến tính; lựa chọn hầu hết chỉ đổi thoại tại chỗ (`00` §3.4). Hội ngộ và ending: D-08 UNDECIDED.
- **Lựa chọn được lưu để dùng lại** (`01` §7, kịch bản Phụ lục B) — đây là "nhánh" duy nhất:

| Lựa chọn | Trang | Dùng lại ở | Đã có trong code? |
|---|---|---|---|
| Tên, ngoại hình nam/nữ | Mở đầu | Mọi thoại; `{g:ông\|bà}` | Có (`save.player_name`, `appearance.gender`) |
| Ảnh bộ ba (1 trong 3) | 1 | Album | **Chưa** (ảnh chụp tự động 1 tấm) |
| Lời ước trên buồm | 2 | Album | Có — flag `m1.wish` |
| Kiểu trang trí Căn cứ | 3 | Căn cứ Trang 4, 6, 7, 9 | Có — flag `m1.base_decor` (chưa có nơi đọc lại) |
| Tên nhóm, luật Căn cứ | 3 | Nhóm chat 2026 | Chỉ là thoại cố định |
| Kiểu ảnh đủ năm đứa | 4 | Album | Có nhưng tên tạm — flag `m1.placeholder_tone` |
| Bạn cặp trực nhật | 5 | Thoại trực nhật | Chưa (Mốc 2) |
| Thư Valentine (người nhận × loại / cả nhóm) | 6 | Phản ứng, nhánh buổi chiều, câu chốt | Chưa (Mốc 2) |
| Kiểu hòm thư | 6 | Trang 7, 9, ảnh nhóm | Chưa (Mốc 2) |
| Nói thật ở báo tường | 7 | 1 câu của Châu ở lửa trại | Chưa (Mốc 2) |
| Kiểu cổng trại | 8 | Ảnh lửa trại | Chưa (Mốc 2) |
| Ảnh chính Trang 9 | 9 | Album, phòng 2026 | Chưa (Mốc 2) |
| Sắc thái tin nhắn kết | Kết | Báo cáo (không gửi nội dung) | Có — `save.phone` + event `end_message_sent` |

---

## II. Cơ chế và hệ thống flag / biến trạng thái

### II.1 Vòng lặp
- **Không có vòng ngày/học kỳ theo đồng hồ.** Đơn vị chơi là **Trang** (1 Trang = 1 trang Album = 1 kỷ vật = 1–3 cảnh; riêng Trang 6 có 4 cảnh). Chữ "Ngày ký ức"/"Chương" cũ đã thay bằng "Trang" (CONFIRMED 19–20/11); code vẫn dùng tên kiểu `MemoryDay`, `memory_day_id` — chỉ là tên kỹ thuật, không sao.
- **Vòng lớn:** Phòng 2026 → chọn kỷ vật đang sáng → câu nói 2026 → vào ký ức → đi tự do + chuỗi Main + Side tùy chọn + ảnh chính → về phòng: Album phục hồi, kỷ vật lên kệ, kỷ vật kế sáng.
- **Vòng nhỏ trong cảnh:** thẻ chữ thời gian → tự do → bước Main (một trong 6 kiểu K1–K6) → ảnh chính "Giữ ảnh này" → lưu tự động.
- **Quest:** Main (bắt buộc) · Side (không chặn Main; trước khi rời Trang hỏi "Còn việc chưa làm, đi tiếp không?") · Daily (1 lần mỗi Trang, không theo giờ thật — `GAME_CONFIG.daily_per_memory_day = 1`).
- **Minigame:** có thắng/thua nhưng thua không chặn truyện, luôn có Chơi lại (CONFIRMED 20/11). 6 kiểu dùng lại: K1 đi–nói–chọn · K2 chụp ảnh · K3 nhặt–đặt · K4 ghép–giải mã · K5 canh lực/nhịp · K6 giữ để làm. Riêng: Caro (T5), Sudoku (T7), Valentine ×3 (T6), Tầng B: lật chai, Khu Vui Chơi (Ô ăn quan, Lò cò, Bắn bi ve — mở sau Trang 3).
- **Chơi lại Trang:** trạng thái + flag nằm ở vùng `save.current.replay`, không ghi đè câu chuyện lần đầu.

### II.2 Điều khiển và HUD (`00` §6–7.4)
WASD/mũi tên, Shift chạy, E/click tương tác, Space/click qua thoại, 1/2/3 chọn, C máy ảnh cầm tay (chưa gán), J/Tab sổ tay, Esc "Về chỗ an toàn". Phòng 2026 góc cố định, rê chuột làm sáng vật. HUD tối giản: dòng mục tiêu góc trên trái, điểm đánh dấu, gợi ý phím khi gần vật, tên khu thoáng hiện; ô thoại 2 dòng dưới màn, tên người nói có màu; thẻ chữ thời gian 2–3 giây; màn chụp có 3 dấu (Đủ người / Trong khung / Kịp tạo dáng), không chấm điểm; Album hiện số trang đã phục hồi, không hiện %. Font Nunito.

### II.3 Toàn bộ flag / biến trạng thái **đang có trong code**

**a) Flag nội dung (`save.flags`, đặt bằng `set_flags` của lựa chọn)**

| Flag | Giá trị | Đặt ở | Điều kiện kích hoạt | Hệ quả hiện tại |
|---|---|---|---|---|
| `m1.wish` | `friendship` / `fun` / `secret` | `q_m1_main_02.s03` (`c_m1_02_wish`) | Chọn lời ước | Lưu; **chưa có chỗ đọc lại** (Album chưa in chữ lên buồm) |
| `m1.base_decor` | `paper` / `flowers` / `photos` | `q_m1_main_03.s03` (`c_m1_03_decor`) | Chọn trang trí | Lưu; **chưa đổi hình Căn cứ ở Trang 4** |
| `m1.placeholder_tone` | `playful` / `gentle` / `deep` | `q_m1_main_05.s02` (`c_m1_05_tone`) | Chọn kiểu ảnh đủ năm đứa | Lưu; tên flag là tên tạm (xem IV) |
| `hub.demo_end_seen` | `true` | `src/game/game.ts` | Sau khi `public_demo_done` | Chỉ hiện màn kết + form một lần |

**b) Biến tiến trình (`src/core/save.ts`, `SAVE_VERSION = 2`, khóa `htx.save`)**

| Biến | Ý nghĩa |
|---|---|
| `player_name`, `appearance.{gender,preset}`, `profile_done` | Hồ sơ Player (tên chỉ ở máy, không vào analytics) |
| `current.{memory_day_id, quest_id, step_id, zone_id, replay, day_start}` | Đang ở đâu; ảnh chụp flag lúc vào Trang để "chơi lại từ đầu" không cộng dồn |
| `days[id].{state, replayed}` | Trang chưa/đang/đã xong |
| `quests[id].{state, step_id, progress}` | Tiến độ quest |
| `artifacts[id]` | Trạng thái kỷ vật (sáng/đã mở/trên kệ…) |
| `album[entry].{status, variants, selected}` | Ô Album; `selected` sẵn chỗ cho "chọn 1 trong 3 ảnh" |
| `relationships[chr].{flags, tone_counts{playful,gentle,deep}, arc_progress, bond=null, contacted_2026}` | Đếm sắc thái theo từng bạn mỗi khi chọn câu `measured` có `about` |
| `pde_done[]` | Sự kiện phòng 2026 đã chạy |
| `phone[thread]` | Tin đã gửi (chỉ mã lựa chọn) |
| `public_demo_done` | Đã tới điểm dừng → phát `public_demo_completed` |
| `settings.{camera_mode, free_look}` | Cài đặt |

**c) Điều kiện (`src/core/conditions.ts`)** — 5 loại: `always`, `all`/`any`, `flag` (có giá trị hoặc `equals`), `quest` đã xong, `day` đã xong. Đang dùng cho `appear_when` của kỷ vật và `trigger` của PDE:

| Điều kiện | Kích hoạt |
|---|---|
| `art_m1_01.appear_when = {quest: q_hub_pd_01}` | Mẩu giấy mật lệnh sáng sau mở đầu |
| `art_m1_02.appear_when = {day: d.g06.01}` | Thuyền sáng sau Trang 1 |
| `art_m1_03.appear_when = {day: d.g07.01}` | Biển + sổ luật sáng sau Trang 2 |
| `art_m1_05.appear_when = {any: [day d.g07.02, day d.g06.01]}` | Ảnh ố sáng sau Trang 3 **hoặc sau Trang 1** ⚠ (xem IV-C4) |
| `pde_01/02` ← `day d.g06.01`; `pde_07/08` ← `d.g07.01`; `pde_09/10` ← `d.g07.02`; `pde_04/05` ← `d.g07.03` | Phục hồi trang Album + đặt kỷ vật lên kệ |
| `pde_03` ← `quest q_m1_side_01` | Thêm sticker Side vào Album |
| `pde_06` ← `day d.g07.03` → `unlock_quest q_hub_pd_02` | Mở chuỗi điện thoại kết demo |

**d) Phạm vi bản (`src/content/release.ts`)**: `test` = 4 Trang, `end_day_id = d.g07.03`, `end_step_id = q_hub_pd_03.s01`; **`production` = rỗng** (mở production không vào được game — lỗi B-02 vẫn còn).

**e) Lựa chọn "đo được" (`measured: true`) → event `choice_made` + `tone_counts`:** `c_m1_02_wish`, `c_m1_03_decor`, `c_m1_05_tone`, và 3 tin kết `q_hub_pd_03.s01`. Nhãn sắc thái: Rộn ràng / Ấm áp / Sâu lắng.

### II.4 Biến **GDD yêu cầu nhưng code chưa có** (`02` §4.2)
`minigames.{game}.{opponent}` (thắng/thua/hòa) · `minigames.caro.series`, `.story_result` · `minigames.sudoku.best`, `.story_result` · `minigames.bottle.best` · `minigames.boat.result`, `.footbag.result`… (kết quả lần đầu của trò cốt truyện, dùng cho thoại) · `hub.unlocked` (Khu Vui Chơi) · `story.valentine.{recipient, kind, groupMsg, boxStyle}` · `minigames.valentine.branch.result`. Thêm các trường này **bắt buộc kèm bước chuyển đổi bản lưu v2→v3**, nếu không tăng `SAVE_VERSION` sẽ xóa tiến trình người chơi (B-07, task T-04).

---

## III. Danh sách bối cảnh chơi

### III.1 Bản đồ và khu
| GDD | Mã khu trong code (`map_thcs`) | Gồm | Trang dùng | Trạng thái code |
|---|---|---|---|---|
| Phòng 2026 | `hub_room` | Thùng carton, Album, kệ, bàn học, tường dán ảnh, điện thoại, đèn bàn | Mở đầu, giữa Trang, chuyển Mốc, kết | Có khung, dựng khối thô; 4 vật chạm được (Hộp, Album, Kệ, Điện thoại) |
| Z01 Lớp học | `zone.thcs.classroom` | Bàn đôi, bảng đen, bục giảng, góc báo tường, bảng đếm ngược (lớp 9) | 1, 5, 6, 7 | Có |
| Z02 Sân trường | `zone.thcs.yard` | Cột cờ, ghế đá, phượng, bàng, vòng đá cầu, cột rổ | 1, 4, 5, 6, 8 (đêm), 9 | Có (cây dựng bằng code) |
| Z02b Hành lang + mái hiên | `zone.thcs.corridor` | Bảng phân lớp, mái hiên, rãnh nước | 1, 2, 6 | Có |
| Z03 Cổng + ngõ quà vặt | `zone.thcs.gate` | Cổng sắt, **xe quà vặt**, **tiệm tạp hóa** (bậc thềm, tivi, ghế nhựa) | 1 (cảnh B), 5, 6, 8, 9 | Khu có; **xe quà vặt + tiệm tạp hóa chưa có asset** |
| Z04 Bãi đất trống | `zone.thcs.field` | Đất, cỏ, vũng nước | Ít dùng | Có |
| Z05 Căn cứ bí mật | `zone.thcs.base` | Góc sân sau gần nhà kho (trong trường): mái che, gốc cây, thùng giấy, bàn kê, biển tên; Khu Vui Chơi sau Trang 3 | 3, 4, 6, 7, 9 | Có khu; chưa có biển tên/đồ trang trí theo lựa chọn |

Không dựng căn-tin, thư viện, bãi xe, tiệm net riêng (CONFIRMED 20/11). Biến thể theo năm = bộ trang trí + ánh sáng/thời tiết, không dựng lại bản đồ.

### III.2 Ánh sáng và không khí
| Phần | Tông | Ghi chú |
|---|---|---|
| Phòng 2026 | Sáng, ấm từ đầu; "trống" bằng ít đồ | Tối, đèn bàn nhưng không u ám (CONFIRMED 20/11) |
| Mốc 1 | Vàng nắng, xanh phượng non | Bỡ ngỡ, háo hức |
| Cảnh mưa (Trang 2, 4) | Xanh xám nhạt, giữ độ sáng cao | Trang 4: mưa rào → cầu vồng |
| Mốc 2 | Vàng cam hoàng hôn, xanh lam giờ tan trường | Gắn bó, bồi hồi |
| Đêm Hội trại (Trang 8) | Cam lửa + xanh đêm, đèn dây vàng | **Biến thể đêm chưa có** trong `src/world/variants.ts` |
Chưa có mã màu hex và chưa có concept art được duyệt.

### III.3 Đạo cụ bắt buộc theo kịch bản (Mốc 1 + Hub — phần cần cho bản đo)
| Nơi | Đạo cụ |
|---|---|
| Hub mở đầu | Thùng carton "Đồ cũ – đừng vứt", vở cũ, khăn quàng đỏ, ảnh lớp phai, Album gần trống, mẩu giấy gấp tư |
| Hub sau từng Trang | Khung kính nhỏ (mật lệnh) trên bàn · ảnh bộ ba dán tường · thuyền giấy trên bàn · biển tên + sổ luật trên kệ · ảnh cầu vồng trên bìa Album + dòng chữ "Ban đầu chỉ có ba đứa." · điện thoại |
| Trang 1 | Bảng phân lớp, vở rơi, mẩu giấy ký hiệu + bút bi đỏ, quả cầu + bụi cây, bảng đen + giẻ lau, bậc thềm tiệm tạp hóa, gói mì (bóp vụn), máy ảnh compact, sổ nhỏ |
| Trang 2 | Mưa lớn, mái hiên, rãnh nước đầy, giấy gấp thuyền, giấy báo cũ, 5 thuyền giấy, bút |
| Trang 3 | Mái che, gốc cây, đống thùng giấy cũ, bàn nhỏ, bút lông, biển tên, sổ bìa xanh "LUẬT", đồ trang trí theo lựa chọn (giấy màu / hoa / ảnh) |
| Trang 4 | Gốc phượng chớm nở, ghế đá (đặt máy), cây lược của Châu, vòng sáng chỗ đứng, mưa rào, cầu vồng, ảnh in, băng keo, tường Căn cứ (ảnh bộ ba + thuyền đã treo) |
| Mốc 2 (khi làm) | Hộp phấn móp + nắp ghi tỉ số, bàn caro, hòm thư Valentine + bảng nội quy 3 điều, tờ vẽ chiếc lá, báo tường A5, bảng đếm ngược, tivi tiệm tạp hóa, tờ lịch 1/2018, đồ Hội trại (lửa trại, đèn dây, cờ giấy, cổng trại), sổ lưu bút kraft, áo ký tên |

---

## IV. Bảng mâu thuẫn và điểm chưa khớp cần duyệt

Ký hiệu nguồn: **KB** = kịch bản `KICH_BAN_DEMO_M1_M2_v1.md` · **GDD** = `docs/gdd/0x` · **AG** = tài liệu Antigravity (`docs/handoff/gemini/*`) · **CODE** = `src/`.
Mức: 🔴 cần chốt trước khi đo · 🟠 nên sửa trước 04/12 · ⚪ nhỏ.

### IV-A. Phạm vi và mốc thời gian
| # | Mức | Chỗ vênh | Đề xuất chốt |
|---|---|---|---|
| A1 | 🔴 | **Yêu cầu rà soát** muốn demo tới Mốc 2 ↔ **quyết định 21/11 tối** chỉ trọn Mốc 1 (T1–4), Mốc 2 lùi sau 15/12. `00` §1.2 vẫn còn dòng cũ "Bản public = Mốc 1 + Mốc 2 (CONFIRMED 19/11)" chưa gạch | **Giữ quyết định 21/11** cho bản đo 05–15/12 (hạn 04/12 chỉ còn 12 ngày; Mốc 2 riêng Trang 6 đã là khối lớn nhất). Mốc 2 làm thành **bản mở rộng sau 15/12**. Sửa dòng `00` §1.2 thành SUPERSEDED |
| A2 | 🔴 | Yêu cầu ghi năm "lớp 6 2012, lớp 9 2014, Mốc 3 2026" ↔ canon 2014 / 2016–2018 / Mốc 3 2018–2021, 2026 = Hub | Giữ canon (đã CONFIRMED 20/11). Nếu anh/chị thật sự muốn đổi năm, đó là đổi lớn: kéo theo trào lưu, mốc U23, Tết Đinh Dậu, tuổi nhân vật |
| A3 | 🟠 | KB tự ghi "v1.6-draft — chưa duyệt toàn file"; code ghi `HUMAN_CANON v1.4`, AG ghi "v1.4 APPROVED" | Chốt: phần Mốc 1 của KB coi như APPROVED (GDD v1.0 duyệt 20/11 dựa trên v1.4); đóng dấu lại đầu file KB |

### IV-B. Code của Antigravity lệch kịch bản (Mốc 1)
| # | Mức | Trang | KB nói | CODE đang làm | Đề xuất |
|---|---|---|---|---|---|
| B1 | 🔴 | 1 | 2 cảnh (A ngày đầu / B "Mấy tháng sau" ở **tiệm tạp hóa**), 6 bước có thao tác: tìm lớp, giải mật lệnh K4, đá cầu K5, lau bảng K6, bóp mì K6, ảnh tự sướng 3 lần chọn 1 | Gộp hết vào **2 bước** (1 `talk` + 1 `interact` ở **ghế đá**); không có thẻ "Mấy tháng sau"; không có thao tác nào; ảnh chụp tự động 1 tấm | Tách lại đúng 2 cảnh + 6 bước; bước có trò để dạng `minigame` (chờ T-03/T-07), cảnh B đặt ở Z03. Ảnh bộ ba dùng `album.selected` |
| B2 | 🔴 | 1 | Châu nói với **Đức**: "Mới quen một bữa mà **ông** mày tao rồi hả?" | `{g:ông\|bà}` — đổi theo giới tính **Player** → nếu Player nữ, Châu gọi Đức là "bà" | Lỗi thoại. Sửa cứng "ông" |
| B3 | 🟠 | 1, 2, 4 | Thoại gốc | Một số câu bị viết lại mà vẫn gắn nhãn `HUMAN_CANON`: "Nhìn ngố y chang ông đó Đức" (gốc: "Ít nhất nhìn rất giống ông"), "chụp đủ một bộ sưu tập luôn" (gốc: "đủ bộ luôn"), "Bí mật không nói ra." (gốc: "Bí mật."), "ước mơ theo tới đó" (gốc: "điều ước theo tới đó"); bỏ câu "Tớ ước… thuyền tớ đừng lật!" | Trả về đúng chữ KB. Quy tắc: `HUMAN_CANON` = chép nguyên văn |
| B4 | 🟠 | 2 | Bước 4 đua thuyền K5 + **người chơi bấm chụp** 5 thuyền lúc vừa thả | `interact` + thoại kết quả; ảnh là `auto_snapshot` | Giữ tạm để không chặn; ghi nợ cho T-07 (trò thuyền) |
| B5 | 🟠 | 3 | Khảo sát **3 chỗ** (mái che, gốc cây, thùng giấy); dựng Căn cứ có thoại "Tên tao phải viết to nhất…"; trang trí "giấy màu / hoa / ảnh"; **ảnh chính = biển tên** | 1 bước `goto` bàn gỗ; lời lựa chọn bị tô thêm ("dây hạc giấy màu rực rỡ", "cắm hoa dại và cành lá mộc mạc"); ảnh chính = "cả nhóm bên bàn gỗ" (theo AG) | Thêm `collect` 3 điểm; trả lời lựa chọn về KB; **chốt ảnh chính Trang 3** (xem C2) |
| B6 | 🔴 | 4 | Bước 3 hẹn giờ → Bước 4 mưa → Bước 5 cầu vồng + **hẹn giờ lần 2** → Bước 6 "Mấy hôm sau" dán ảnh. **Hết Trang khi giữ ảnh cầu vồng** | Chỉ 1 ảnh hẹn giờ; mưa + cầu vồng + "dán ảnh" dồn vào 1 cutscene; không có ảnh cầu vồng | Thêm bước `photo` lần 2 (ảnh cầu vồng) + thẻ "Mấy hôm sau". Đây là ảnh bìa Album và là khoảnh khắc kết demo |
| B7 | ⚪ | 4 | Máy đặt trên **ghế đá** | Điểm tên `itr.thcs.tripod_spot`; AG mô tả "chân máy" (objective trong code đã ghi đúng "ghế đá") | Đổi nhãn điểm cho khỏi hiểu lầm, không gấp |
| B8 | 🔴 | Hub kết | Tin cuối nhóm chat "đã từ rất lâu"; không có trả lời | AG tự viết 4 dòng chat cũ ("bơm lại quả bóng rổ", "ép xong một lá phượng"…) | Nội dung tự viết → gắn `AI_PROPOSED` hoặc bỏ, chờ duyệt |
| B9 | 🔴 | Hub kết | Bản Mốc 1: tin kết mang nghĩa "nhớ hồi tụi mình mới đủ năm đứa" (21/11) | Tin `deep` = "**Điều 6**, được dời, không được hủy…" — nhưng **Điều 6 chỉ ra đời ở Trang 9 (Mốc 2)**; ở bản Mốc 1, sổ luật mới có 5 điều | Thay tin `deep` bằng câu dựa trên điều đã có ở Mốc 1 (ví dụ Điều 5 "chụp ảnh thì phải đủ người") — **cần anh/chị duyệt lời** (T-08) |
| B10 | 🟠 | Hub mở | Thứ tự: mở thùng → thấy đồ → mở mẩu giấy → độc thoại | Độc thoại về mật lệnh nói **trước** khi mở thùng (QUESTIONS_LOG #3) | Đảo: `interact` thùng trước, cutscene sau |

### IV-C. Lỗi logic / cấu trúc trong code
| # | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| C1 | 🔴 | **Side/Daily của Mốc 1 do AI tự nghĩ** (Xem bảng trực nhật, Mẹo gấp thuyền, Bắn bi mắt mèo, Đi dạo một vòng, Kiểm tra đồ trực nhật) nhưng gắn `owner: NARRATIVE_APPROVED` + `HUMAN_DRAFT` → validator **không chặn** khi đưa lên production. Mã cũng trùng sai với GDD (GDD: "M1 Side 04 = *Hoa phượng của Hạ*", Tầng B; mọi Daily là Tầng C) | Đổi nhãn sang `AI_PROPOSED` + `[PLACEHOLDER]`, đổi mã để không đè số Side của GDD; hoặc tắt khỏi bản đo. **Cần anh/chị chọn** |
| C2 | 🟠 | Bắn bi (Side Trang 3) chạy **trong** Trang 3 — GDD: Khu Vui Chơi chỉ mở **sau** Trang 3 và là Tầng B | Bỏ khỏi Trang 3 |
| C3 | 🔴 | Tông của lựa chọn: AG tự gán `gentle/playful/deep` cho lời ước và kiểu trang trí (chỉ là "đề xuất chờ xem xét" trong QUESTIONS_LOG) nhưng đã đưa vào code và vào số liệu đo `tone_counts` | Duyệt hoặc bỏ `measured` ở 2 lựa chọn này. Nếu giữ, ghi vào GDD |
| C4 | 🔴 | `art_m1_05` (Trang 4) sáng khi xong Trang 3 **hoặc Trang 1** → người chơi có thể nhảy từ Trang 1 sang Trang 4, bỏ qua lúc gặp Quân, Hạ | Đổi thành `{day: 'd.g07.02'}` |
| C5 | ⚪ | Flag `m1.placeholder_tone` là tên tạm cho "kiểu ảnh đủ năm đứa" | Đổi thành `m1.group_photo_style` (đổi trước kỳ đo để số liệu sạch) |
| C6 | 🟠 | Tài liệu AG `DOI_CHIEU_TRANG_1_4.md` §5 tả lựa chọn Trang 4 là "**lời hẹn năm lớp 8**" với 3 câu tự viết ("phạt bao trà sữa"…) — **code lại đúng KB** (kiểu ảnh). Tài liệu bàn giao không khớp code | Sửa tài liệu AG cho khớp code; không dùng 3 câu "lời hẹn" (chưa duyệt) |
| C7 | 🟠 | AG báo "hoàn tất 100%" T-06, nhưng mọi bước có trò (K2–K6) đều thay bằng `talk/interact` — GDD CONFIRMED 20/11: người chơi **chơi thật** | Ghi rõ: nội dung thoại xong ~80%, **thao tác chơi 0%** (chờ T-03 khung minigame + T-07 tám trò) |
| C8 | 🟠 | Lựa chọn đã lưu (`m1.wish`, `m1.base_decor`) **chưa được đọc lại** ở đâu: Album không in lời ước, Căn cứ Trang 4 không đổi theo trang trí | Thêm 2 chỗ đọc: chữ trên buồm ở Album T2; bộ trang trí Z05 ở T4 |
| C9 | ⚪ | `chapters.ts` nhãn `[PLACEHOLDER] Mốc 1 · lớp 6–7` | Chốt nhãn thật "Mốc 1 · Tìm thấy nhau" trước khi khai bản production |
| C10 | 🔴 | `release.ts` bản `production` vẫn rỗng (B-02) | Khai 4 Trang khi C1, B8, B9 xong (validator chặn PLACEHOLDER) |

### IV-D. GDD tự vênh nhau
| # | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| D1 | 🟠 | **Ảnh bìa Album / ảnh Trang 4:** KB nói ảnh **cầu vồng** lên bìa, ảnh hẹn giờ vào trang "Tìm Thấy Nhau"; `01` §6 nói bìa = **ảnh đủ năm đứa lớp 7**, ảnh chính Trang 4 = cầu vồng; code = ảnh hẹn giờ là ảnh chính Trang 4, không có bìa | Chốt theo KB (bìa = cầu vồng; ảnh hẹn giờ là ảnh chính trang 4 "Đủ năm đứa"); sửa `01` §6 |
| D2 | 🟠 | Ảnh chính Trang 3: `01` §10 mục 9 "Còn mở"; KB v1.4 đã ghi "giữ ảnh biển tên" | Chốt **ảnh biển tên** (đúng KB, đúng kỷ vật) |
| D3 | ⚪ | Blender 5.2 LTS (`00` §9, hướng dẫn Project) ↔ 4.5.16 LTS (D-S2-05, code pipeline) | Đã nêu ở DEMO_AUDIT §6.1(1); chờ anh/chị chọn một |
| D4 | ⚪ | `DEMO_AUDIT.md` §1.2 vẫn ghi "chỉ có 2 Trang, toàn PLACEHOLDER" — đã cũ sau commit AG | Cập nhật audit khi chốt phiên |
| D5 | ⚪ | Kết demo trong KB/`01` vẫn là bản 9 Trang (caro 4–3, Điều 6) | Viết riêng "Kết demo bản Mốc 1" trong KB khi duyệt lời T-08 |

---

## V. Định hướng và phạm vi demo

### V.1 Khuyến nghị: giữ quyết định 21/11 — bản đo 05–15/12 = trọn Mốc 1

**Bắt buộc phải xong để chạy được bản đo (Tầng A):**

| Hạng mục | Phải có | Hiện trạng | Task |
|---|---|---|---|
| Cốt truyện | Mở đầu + Trang 1–4 + Kết demo bản Mốc 1, chữ đúng KB | Thoại có, cần sửa B1–B10 | T-06 sửa |
| Sự kiện | 4 Trang · khoảng 13 bước có thao tác (T1: 6, T2: 2, T3: 3, T4: 2) · 5 ảnh chính (bộ ba, 5 thuyền, biển tên, ảnh hẹn giờ, ảnh cầu vồng) · 10 PDE phòng 2026 | Chỉ ảnh hẹn giờ T4 là thao tác thật; 4/5 ảnh (T1–T3 chụp tự động, thiếu ảnh cầu vồng) | T-03, T-07 |
| Flag | `m1.wish`, `m1.base_decor`, `m1.group_photo_style` (đổi tên), chọn ảnh bộ ba (`album.selected`), sắc thái tin kết, `public_demo_done` | Có 3, thiếu chọn ảnh bộ ba, thiếu chỗ đọc lại | T-04 (chỉ thêm trường `minigames.*` cần cho 8 trò Mốc 1, có chuyển đổi bản lưu) |
| Bối cảnh 3D | Hub (thùng, Album, kệ, bàn, tường ảnh, điện thoại) · Z01, Z02, Z02b, Z03 (**tiệm tạp hóa** cho T1 cảnh B), Z05 · biến thể g06/g07 · mưa + cầu vồng | Khu đủ; thiếu tiệm tạp hóa, mưa, cầu vồng, đồ trang trí Căn cứ theo lựa chọn | T-10/T-11 |
| Gameplay | Khung minigame (luật, thắng/thua, Chơi lại, Bỏ qua) · 8 trò K: mật lệnh K4, đá cầu K5, lau bảng K6, bóp mì K6, thả thuyền K5, khảo sát/dựng Căn cứ K3, viết luật K4, ảnh hẹn giờ K2 | Khung là thẻ giả 1 nút | T-03, T-07 |
| Web/đo | Form phản hồi thật + endpoint Firestore; ghi hoàn thành **trước** form; bản `production` khai 4 Trang | Thứ tự đúng; form và production chưa có | T-08, T-09 |

**Tạm cắt / để stub:** toàn bộ Mốc 2 (Trang 5–9, gồm Caro, Valentine, Sudoku, Hội trại) · chuyển Mốc (hộp phấn) · Khu Vui Chơi Căn cứ · lật chai · mọi Side/Daily AI tự nghĩ (C1) · trả lời trong nhóm chat · Mốc 3, hội ngộ, ending.
**Thang cắt nếu trễ** (theo SPRINT_TASKS): T-12 → T-11 → T-10 (giữ nhân vật dựng bằng code) → T-07 còn 4 trò của Trang 1. Không cắt T-01…T-05, T-08, T-14.

### V.2 Nếu anh/chị vẫn muốn demo tới hết Mốc 2 (Trang 9 · cuối lớp 9, 5/2018)
Phải thêm vào V.1:
- **Cốt truyện:** số hóa Trang 5–9 + chuyển Mốc + Kết demo bản 9 Trang (Điều 6, caro). Riêng Trang 6 có 4 cảnh, 12 lá thư riêng + 5 thư nhóm.
- **Sự kiện tối thiểu:** 5 Trang, ~16 cảnh; Hội trại chỉ Phần 1 + 4.
- **Flag thêm:** `minigames.caro.series/story_result`, `minigames.sudoku.*`, `story.valentine.{recipient,kind,groupMsg,boxStyle}`, `minigames.valentine.branch.result`, bạn cặp trực nhật, nói thật ở báo tường, kiểu cổng trại, ảnh chính Trang 9.
- **Bối cảnh:** biến thể g08/g09, **biến thể đêm Hội trại**, bảng đếm ngược, tivi tiệm tạp hóa; asset hộp phấn, hòm thư, đồ trại.
- **Gameplay:** Caro 12×12 (1 mức AI), Sudoku 9×9 (3 đề), 3 minigame Valentine, giao diện 2D (trang confession, làm hòm thư, đọc thư).
- **Đánh giá:** với 12 ngày còn lại, phương án này **rủi ro rất cao** — DEMO_AUDIT đã nêu Trang 6 là khối việc lớn nhất và chưa có dòng code nào. Nếu chọn, nên dùng phương án trung gian (c) của DEMO_AUDIT §6.5: Trang 5–9 chỉ chuỗi Main tối thiểu, bỏ Side.

---

## VI. Tóm tắt điểm cần chủ dự án chốt ngay
1. **Phạm vi demo** (A1): giữ Mốc 1 như 21/11, hay đổi sang tới Mốc 2?
2. **Năm học** (A2): xác nhận dùng canon 2014–2018 (bỏ "2012/2014").
3. **Tin kết `deep` nhắc Điều 6** (B9) + **4 dòng chat cũ tự viết** (B8): duyệt lời mới cho bản Mốc 1.
4. **Side/Daily do AI nghĩ ra** (C1): gắn nhãn AI_PROPOSED và tắt khỏi bản đo, hay giữ?
5. **Tông của 2 lựa chọn Trang 2, 3** (C3): có tính vào số liệu đo không?
6. **Ảnh bìa Album và ảnh chính Trang 3, 4** (D1, D2).
7. **Lỗi thứ tự kỷ vật Trang 4** (C4) và **lỗi xưng hô Châu–Đức** (B2): sửa ngay (không cần quyết, chỉ cần đồng ý).

---

## VII. Quyết định của Game Director ngày 22/11/2026 (sáng) — áp dụng làm chuẩn

> Mục này **thay** phần khuyến nghị ở các mục IV–VI khi có chỗ khác nhau. Bảng giao việc: `docs/NEXT_SPRINT_TASK_BOARD.md`. Kiểm toán bối cảnh: `docs/BACKGROUND_AUDIT.md`.

| Mã | Quyết định | Cách hiểu khi làm |
|---|---|---|
| **A1** | Làm **trọn Mốc 1**; **Mốc 2 chỉ làm tuyến Main**, cắt/stub nhánh phụ | Thay quyết định 21/11 tối (chỉ Mốc 1). Bản đo = Trang 1→9, kết demo sau Trang 9. Mốc 1: Main + 8 trò K. Mốc 2: mọi bước Main của Trang 5–9; minigame thuộc Main làm **bản tối thiểu có nút Bỏ qua**; Side, Daily, Khu Vui Chơi, lật chai, 4 nhánh rút gọn Valentine, Hội trại Phần 2–3: **cắt/stub** |
| **A2** | Giữ đề xuất | Năm học canon: Mốc 1 = lớp 6–7 (2014–2016), Mốc 2 = lớp 8–9 (2016–2018), 2026 = phòng Hub. Nhãn "2012 / 2014" trong tin nhắn chỉ đạo được hiểu là tên gọi Mốc, **không đổi năm trong game** |
| **A3** | Liệt kê chỗ AG tự gán "đã duyệt" | Xem `NEXT_SPRINT_TASK_BOARD.md` Mục 0.1 |
| B1, B2, B4, B5, B6, B7, B10 | Làm theo đề xuất mục IV-B | — |
| **B3** | Giữ thoại như trong code; chỉ xóa câu "Tớ ước… thuyền tớ đừng lật!" | Kiểm 22/11: câu này **không có trong code** (AG đã bỏ) → B3 coi như xong, không sửa thêm |
| B8, B9 | Chờ duyệt lại | Nguyên văn ở `NEXT_SPRINT_TASK_BOARD.md` Mục 0.2. Ghi chú: vì A1 + D5 đưa kết demo về **bản 9 Trang**, Điều 6 đã có ở Trang 9 → B9 không còn sai mạch nếu giữ đúng lời kịch bản 9 Trang |
| **C1** | Theo phương án AI | Side/Daily AI tự nghĩ: đổi nhãn `AI_PROPOSED` + `[PLACEHOLDER]`, đổi mã để không trùng số Side của GDD, **không khai trong bản production** |
| **C3** | Duyệt | Giữ sắc thái cho `c_m1_02_wish` (friendship=gentle, fun=playful, secret=deep) và `c_m1_03_decor` (paper=playful, flowers=gentle, photos=deep); tiếp tục tính vào `tone_counts` |
| C4–C10 | Theo đề xuất | — |
| D1, D2 | Theo đề xuất | Bìa Album = ảnh cầu vồng Trang 4; ảnh chính Trang 4 = ảnh hẹn giờ đủ năm đứa; ảnh chính Trang 3 = biển tên |
| **D3** | **Bỏ Blender cho asset mới, dựng toàn bộ bằng Procedural Three.js** | Chỉ dùng lại GLB đã có trong repo. **Thực tế repo không có thư mục `public/models/`**; GLB có sẵn nằm ở `public/assets/world/map_thcs/` (6 khu) và `public/assets/props/prp_desk_2seat.glb`. Không có `CREDITS.md`. Nhân vật giữ bản dựng bằng code (`src/actors/character/build.ts`); base mesh GLB ở `feature/asset-workshop` **không gộp** cho bản này |
| **D5** | Thêm một đoạn thoại timeskip ngắn rồi dẫn thẳng vào kết theo kịch bản 9 Trang | Đặt sau cutscene "Cuối hè" (Trang 9), trước Kết demo ở phòng 2026. Lời thoại là nội dung mới → `[PLACEHOLDER]` + `AI_PROPOSED` cho tới khi được duyệt (bản nháp ở `NEXT_SPRINT_TASK_BOARD.md` Mục 0.3) |

**Sửa hai chỗ sai trong file này (phát hiện khi kiểm toán bối cảnh 22/11):**
- Mục III.1: khu cổng `zone_gate.glb` **đã có** khối dựng thô tiệm tạp hóa và xe quà vặt (marker `itr.thcs.grocery`, `itr.thcs.snack_cart`). Thiếu là chi tiết (bậc thềm, tivi, ghế nhựa…), không phải thiếu cả khu.
- Căn cứ trong bản đồ hiện tại nằm **ngoài tường rào trường** (tường rào x −34…26; Căn cứ x 38…52), chỉ đi được qua cổng → ngõ → bãi đất. Lệch quyết định CONFIRMED 20/11 "Căn cứ trong trường". Cách sửa bằng code: `BACKGROUND_AUDIT.md` mục (b).
