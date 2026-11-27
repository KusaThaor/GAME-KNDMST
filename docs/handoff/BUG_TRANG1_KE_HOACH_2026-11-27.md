# KẾ HOẠCH SỬA LỖI TRANG 1 (lập 27/11/2026, cập nhật 16:30 27/11)

Nguồn: video chơi thử Trang 1 trên Preview (bản `kndmst-3p8dk0ln2-…vercel.app`), danh sách 8 lỗi của Antigravity, code nhánh `dev` @ `14fa8b6`.
- Bản sáng: chỉ đọc code.
- Bản chiều: Claude đã tự xem lại video (chụp màn hình cách 2,5–4 giây/khung, không nghe tiếng). Chưa chạy game để tái hiện.

**Chủ dự án chốt 27/11 (16:20):**
- Tạm ẩn nhiệm vụ phụ nháp trên bản thử → BUG-T1-A (Claude làm ngay).
- Phòng 2026 dùng góc nhìn thứ nhất là đúng thiết kế, **không phải lỗi**.

## 1. Gốc lỗi

| Lỗi | Gốc thật | Bản thật (main) có bị? |
|---|---|---|
| Câu `[PLACEHOLDER]` của Châu, "Kết thúc ngày?" ngay sau chụp, nhiệm vụ cột cờ (Antigravity 3, 7, 8) | Bản test nạp cả nhiệm vụ phụ **nháp**. Còn nhiệm vụ phụ mở nên game hỏi kết ngày. Popup ghi "Còn 1 việc" nhưng Sổ tay liệt kê 2 (không đếm nhiệm vụ hằng ngày) | **Không** — production đã lọc nhiệm vụ nháp |
| Đứng mãi ở tiệm tạp hóa, minigame nối đuôi tại chỗ, "Mấy tháng sau" vẫn trời sáng (Antigravity 2, 4, 5) | Dữ liệu Trang 1 dời NPC nhưng **không bao giờ dời người chơi**. Đức/Châu đặt cố định ở tiệm cả ngày, người chơi xuất hiện ở sân. Không có lệnh đổi ánh sáng ở s05. Lưu ý: `weather` trong `stageRunner.ts` hiện bị bỏ qua, `stepReactions.ts` chỉ phát tiếng mưa/gió — **chưa chắc có đổi ánh sáng thật** | Có |
| **[mới] Lời mở đầu đến muộn** — thẻ "Ngày đầu lớp 6 / tháng Chín 2014" + tiếng vở rơi chỉ hiện khi đã chạy ra tiệm và bấm E với Đức (video phần 1, ~01:21), không hiện lúc vừa vào Trang 1 | `title_card` + `narrative.before` gắn vào bước `talk` s01 → chỉ phát khi bước bắt đầu nói chuyện | Có |
| **[mới] Thẻ chữ giữa ngày không có nền tối** — "Ngày đầu lớp 6", "Mấy tháng sau…" hiện mờ đè lên cảnh đang chơi, chữ khó đọc (phần 2 ~00:20) | Thẻ chữ giữa ngày không che màn hình như thẻ "Trang 1" lúc tải | Có |
| **[mới] Thoại vang khi người nói vắng mặt** — sau Giải mật lệnh, Đức/Châu nói chuyện nhưng không thấy ai (cả hai đã bị dời vào lớp, máy quay vẫn ở người chơi). Đá cầu: Châu vắng; Đức đứng tít xa | Máy quay `cam.d0601.desk3` không chuyển tới lớp (lệnh camera ở `{line: 0}` không thấy có tác dụng — cần xác minh) + người chơi không được dời | Có |
| **[mới] Một câu thoại lặp 2 lần** — "Ê ê! Còn đúng một gói mì thôi! Lẹ lên mày!" | Có ở cả `s05.lines` và `s06.intro_lines` trong `d_g06_01.ts` | Có |
| **[mới] Mục tiêu sai chữ** — lúc vào trò Bóp mì, HUD ghi "Tới bậc thềm tiệm tạp hóa trước cổng trường" | `objective` của s06 (minigame) | Có |
| **[mới] 3 nhân vật dính chồng nhau** — từ "Mấy tháng sau" tới hết ngày: Đức/Châu được dời đúng chỗ người chơi đang đứng, dính vào nhau, lưng Đức che nửa màn hình | Teleport NPC tới `spot.thcs.grocery_1/2` trùng chỗ người chơi; người chơi không được dời ra chỗ riêng | Có |
| Ảnh tự sướng (Antigravity 6) — **đính chính**: không phải "3 cái gáy". Châu và Đức nhìn vào máy, chỉ **nhân vật người chơi quay lưng**; Đức đứng sau quầy. Bảng "Tự sướng — lần 1/3" che mặt cả ba. Vẫn chấm xanh "Đủ người / Trong khung / Kịp tạo dáng" | Bước photo không có `stand_zone` và không quay mặt người chơi về máy; tiêu chí chấm không xét hướng mặt | Có |
| Cột cờ (Antigravity 8) — **đính chính**: vòng sáng mục tiêu ở cột cờ có thật (phần 2 ~01:17). Người chơi đi tới vòng sáng của **bảng phân lớp** và **trong lớp học** — hai vòng này không gắn việc gì | Đồ tương tác trang trí của Ngày vẫn hiện vòng sáng dù không có việc | Có |
| **[mới] Xuyên đồ vật** — nhân vật đi xuyên vào bảng phân lớp, bàn học, ghế nhựa đỏ ở tiệm | Thiếu va chạm cho các đồ này | Có |
| **[mới] Camera chui tường** — cổng trường (tấm xanh lớn che màn hình, phần 1 ~01:05), cột hành lang (phần 2 ~01:26) | Camera chưa tránh vật cản | Có |
| ~~Phòng 2026 không thấy nhân vật~~ | **Không phải lỗi** — chủ dự án xác nhận phòng 2026 dùng góc nhìn thứ nhất | — |
| **[mới] Màn chờ "Trang 1" lâu** — ít nhất 16 giây (phần 1 00:40–00:56; sau đó bản quay bị ngắt nên chưa biết tổng) | Chưa đo | Cần đo |
| **[mới] Thanh công cụ Vercel bật giữa game** (phần 2 ~01:42) | Thanh "Vercel Toolbar" chỉ có ở bản Preview | Không |
| Bấm mẩu giấy 2 lần (Antigravity 1) | Có thể đúng thiết kế; chờ chủ dự án xác nhận | — |

## 2. Phiếu việc

| # | Mã | Việc | Agent | Nhánh | Trạng thái |
|---|---|---|---|---|---|
| 1 | BUG-T1-A | Ẩn nhiệm vụ phụ nháp trên bản test | Claude (phiên 27/11) | `task/BUG-T1-A-an-nhiem-vu-nhap` | Đang làm — xem báo cáo cuối phiên |
| 2 | BUG-T1-B | Dàn lại cảnh Trang 1: dời người chơi, mở đầu đúng lúc, thẻ chữ có nền, hoàng hôn, câu lặp | Claude Code · Opus | `task/BUG-T1-B-dan-canh-trang1` | Chưa làm (hạn 29/11) |
| 3 | BUG-T1-C | Ảnh tự sướng, vòng sáng thừa, xuyên đồ vật, camera chui tường | Claude Code · Sonnet | `task/BUG-T1-C-tu-suong-va-cham` | Chưa làm (hạn 29/11) |
| 4 | OWN-1 | Tắt Vercel Toolbar ở Preview; đo thời gian tải Trang 1 | Chủ dự án | — | Chưa làm (hạn 28/11) |
| 5 | INT-1 | Gộp như cũ (thêm 3 nhánh trên) | Claude Code · Opus | — | 29/11 |

B và C cùng sửa `d_g06_01.ts` → làm B trước, C tạo nhánh từ B.

### BUG-T1-A · Cách làm (đã chốt)
- Cờ `DRAFT_QUESTS` trong `src/config/game.ts`: `show_in_test: false`, tham số URL `drafts`.
- `packForSession()` trong `src/content/pack.ts`: bản test không bật drafts thì lọc giống production (`filterPackForRelease`).
- `src/game/game.ts` dùng gói đã lọc. `?drafts=1` chỉ có tác dụng ở bản test (`__DEV_TOOLS__`).
- Không sửa nội dung `[PLACEHOLDER]` trong `days/`.
- `tests/e2e/game.spec.ts` mở game với `drafts=1` vì các ca ở đó kiểm cả nhiệm vụ nháp.
- Chưa làm: đếm "Còn N việc" ở popup kết ngày. Popup này giờ chỉ hiện khi bật `?drafts=1`.

### BUG-T1-B · Prompt
```
Bạn là Claude Code làm task BUG-T1-B cho repo KusaThaor/GAME-KNDMST.
1. Đọc CLAUDE.md, docs/handoff/BUG_TRANG1_KE_HOACH_2026-11-27.md, và kịch bản Trang 1 trong docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md (nguồn đúng về cảnh nào ở đâu).
2. Tạo nhánh task/BUG-T1-B-dan-canh-trang1 từ origin/feat/sprint-0412 (sau khi BUG-T1-A đã gộp; nếu chưa thì từ task/BUG-T1-A-an-nhiem-vu-nhap).
3. Gốc lỗi đã xác định (src/content/days/d_g06_01.ts + runtime):
   a. Không bao giờ dời 'player' → người chơi đứng mãi ở tiệm, mọi minigame chạy tại đó.
   b. npc_placements đặt Đức/Châu ở tiệm cả ngày, người chơi xuất hiện ở sân.
   c. title_card + narrative.before ("Ngày đầu lớp 6", tiếng vở rơi) gắn vào bước talk s01 → chỉ phát khi người chơi đã tới bấm E với Đức. Phải phát ngay khi vào Trang 1.
   d. Thẻ chữ giữa ngày ("Mấy tháng sau…") hiện mờ đè lên cảnh, không có nền tối như thẻ lúc tải Trang.
   e. Lệnh camera cam.d0601.desk3 ở s02 không thấy tác dụng trong video (Đức/Châu nói khi đã bị dời vào lớp, máy quay vẫn ở người chơi). Kiểm narrativeRunner.stage có được gọi với {line: N} cho minigame lines không.
   f. stageRunner.ts bỏ qua cue 'weather'; stepReactions.ts chỉ phát tiếng. Kiểm có đổi ánh sáng thật không.
   g. Câu "Ê ê! Còn đúng một gói mì thôi! Lẹ lên mày!" nằm ở cả s05.lines và s06.intro_lines → phát 2 lần. Giữ 1 chỗ theo kịch bản.
   h. objective s06 ghi "Tới bậc thềm tiệm tạp hóa…" trong khi là minigame Bóp mì. Lấy chữ mục tiêu từ kịch bản; không có thì để [PLACEHOLDER] và báo.
   i. s05 dời Đức/Châu tới đúng chỗ người chơi đang đứng → 3 nhân vật dính nhau, camera kẹt sau lưng Đức.
4. Sửa theo đúng nơi chốn kịch bản, ưu tiên cue stage có sẵn (teleport/face/camera/visible):
   - Vào Trang 1: phát thẻ "Ngày đầu lớp 6" + tiếng vở rơi ngay; Đức đứng gần chỗ người chơi xuất hiện.
   - s02 mật lệnh (trong lớp): dời cả người chơi vào lớp. Bỏ lệnh "Đức đi bộ tới bảng phân lớp" nếu kịch bản không có.
   - s03 đá cầu (giờ ra chơi): dời cả ba ra sân đá cầu, Châu phải có mặt.
   - s04 lau bảng: cả ba vào lớp, trước bảng đen.
   - s05 Mấy tháng sau: dời người chơi ra tiệm, đứng chỗ riêng không trùng NPC; đổi ánh sáng chiều. Không có preset hoàng hôn hoặc weather không đổi ánh sáng thì dừng và báo, không tự chế.
   - Mọi lần dời người chơi phải khuất sau màn tối hoặc thẻ chữ có nền tối. Engine chưa có thì thêm cue nhỏ 'fade' và báo rõ.
   Marker thiếu thì thêm vào src/world/maps/map_thcs.extras.ts, chạy validate:world.
5. KHÔNG đổi, thêm, bớt câu thoại (ngoài việc bỏ câu lặp ở 3g). KHÔNG thêm khoảng đi lại tự do giữa minigame.
6. Test trước (phải đỏ): đầu s02/s03/s04/s05 người chơi nằm đúng khu (classroom/yard/classroom/gate); thẻ s01 phát trước khi người chơi điều khiển; câu gói mì chỉ phát 1 lần; khoảng cách người chơi–NPC ở s05 ≥ 0,8 m.
7. Chạy đủ 5 lệnh Gatekeeper. Chụp ảnh màn hình đầu mỗi bước bằng Playwright cho chủ dự án xem. Push nhánh, báo cáo tiếng Việt ngắn (đã test gì, chưa test gì). Không gộp.
```

### BUG-T1-C · Prompt
```
Bạn là Claude Code làm task BUG-T1-C cho repo KusaThaor/GAME-KNDMST.
1. Đọc CLAUDE.md, docs/handoff/BUG_TRANG1_KE_HOACH_2026-11-27.md.
2. Tạo nhánh task/BUG-T1-C-tu-suong-va-cham từ nhánh BUG-T1-B (hoặc origin/feat/sprint-0412 nếu B đã gộp).
3. Ảnh tự sướng (q_m1_main_01.s07, máy cam.thcs.grocery). Video cho thấy: Châu và Đức nhìn vào máy, nhân vật người chơi QUAY LƯNG; Đức đứng sau quầy; bảng "Tự sướng — lần 1/3" che giữa khung; vẫn chấm xanh đủ 3 tiêu chí.
   Tái hiện bằng Playwright (?day=d.g06.01&step=q_m1_main_01.s07) trước khi sửa. Cần: người chơi quay mặt về máy (stand_zone + hướng), cả ba đứng trước quầy, bảng nút dời xuống mép. Tiêu chí "Trong khung" hoặc "Đủ người" phải trượt khi người chơi quay lưng (đọc photoRunner.ts trước, nói rõ đổi gì).
4. Vòng sáng thừa: bảng phân lớp (itr.thcs.class_list) và trong lớp học hiện vòng sáng dù Ngày không có việc gì ở đó. Chỉ hiện vòng sáng ở đồ đang có việc.
5. Xuyên đồ vật: bảng phân lớp, bàn học trong lớp, ghế nhựa ở tiệm. Thêm va chạm.
6. Camera chui tường (camera thứ ba trong ký ức): tấm xanh lớn ở cổng trường, cột hành lang. Tái hiện từng chỗ, tìm gốc, sửa nhỏ nhất. KHÔNG đụng camera phòng 2026 (góc nhìn thứ nhất là đúng thiết kế).
7. Test trước khi sửa (phải đỏ). Không đổi thoại. Chạy đủ 5 lệnh Gatekeeper, push nhánh, gửi ảnh trước/sau. Không gộp.
```

### OWN-1 · Chủ dự án tự làm
1. Vercel → dự án → Settings → tìm mục "Vercel Toolbar" → tắt cho Preview, để người chơi thử không bị bật hộp "Continue with Vercel" giữa game.
2. Mở Preview cửa sổ ẩn danh, bấm vào Trang 1, bấm giờ từ lúc hiện chữ "Trang 1: Mật lệnh số 01" tới lúc điều khiển được. Ghi số giây vào biên bản QA-1.

## 3. Không làm theo đề xuất Antigravity (lý do)
- **Xóa `[PLACEHOLDER]`:** quy tắc dự án bắt giữ chữ giả cho nội dung chưa duyệt. Thay bằng ẩn trên bản test (BUG-T1-A).
- **Thêm khoảng đi lại tự do + thoại NPC lúc rảnh giữa các cảnh:** là thay đổi thiết kế, cần thoại mới từ Project thiết kế. Chờ chủ dự án quyết.
