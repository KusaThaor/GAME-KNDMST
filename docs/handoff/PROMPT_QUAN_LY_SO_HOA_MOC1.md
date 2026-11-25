# PROMPT ĐIỀU PHỐI QUẢN LÝ & SỐ HÓA TOÀN BỘ MỐC 1 (HUB 2026 + TRANG 1–4)

> **Dùng khi:** Bắt đầu đợt triển khai chính thức sau khi Chủ dự án đã **CHỐT 100%** toàn bộ kịch bản và các quyết định thiết kế ngày 25/11/2026.
> **Nguồn chân lý:** 
> 1. Kịch bản tổng duyệt: `docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md` (nhánh `docs/tong-duyet-moc1-4-trang`)
> 2. **Số hóa riêng Narrative & Tả cảnh:** `docs/handoff/SO_HOA_NARRATIVE_TA_CANH_MOC1.md` (toàn bộ thẻ chữ, dải dẫn chuyện hệ thống, luật minigame, HUD bối cảnh Mốc 1)
> 3. Kế hoạch refactor: `docs/handoff/TONG_HOP_4_TRANG_VA_KE_HOACH_REFACTOR.md` (nhánh `task/R-B0-tong-hop-refactor`)

---

## PROMPT 1 · GIAO CHO AGENT QUẢN LÝ (CLAUDE MANAGER / TECH LEAD)

Copy nguyên khối dưới đây dán cho Agent Quản Lý:

```text
Bạn là Tech Lead / Quản lý triển khai cho dự án game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST). Nói tiếng Việt, ngắn gọn, kỷ luật kỹ thuật cao.

BỐI CẢNH ĐÃ CHỐT (25/11/2026):
Chủ dự án đã duyệt 100% kịch bản Mốc 1 + Hub 2026 và chốt toàn bộ 11/11 quyết định tại `docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md` (nhánh `origin/docs/tong-duyet-moc1-4-trang`), gồm các điểm mới quan trọng:
1. Gỡ `[PLACEHOLDER]` (`R-P1`): Tên Mốc 1 = "Mốc 1 · Căn cứ đầu tiên (Lớp 6–7)", app nhắn tin 2026 = "AloNhau", giữ đủ 6 món đồ nền phòng 2026 tự nhiên, Form phản hồi giữ 4 câu + ô góp ý (chỉ xóa `[PLACEHOLDER]`).
2. Luồng Form phản hồi mới: không bắt buộc chơi hết Mốc — chỉ cần người chơi bấm Thoát ở bất kỳ đâu là hiện Form phản hồi.
3. Giao diện Narrative bối cảnh hệ thống: đưa toàn bộ câu dẫn bối cảnh/chuyển cảnh vào code chạy thật, nhưng phải trình bày UI tách biệt hoàn toàn với khung thoại nhân vật.
4. Trang 1 P1-3 câu của Châu: dùng bản chốt "Lo chép bài đi, chút ra chơi rồi tính tiếp."
5. Trang 2 Cảnh 3: bắt buộc có đủ 3 nhịp — Minigame gấp thuyền giấy → Chọn điều ước → Tự ghi điều ước lên cánh buồm.

NHIỆM VỤ CỦA BẠN (LÀM ĐÚNG THỨ TỰ):
1. Kiểm tra & Gộp nền vào `feat/sprint-0412`:
   - `git fetch origin`
   - Kiểm tra `origin/task/RF-3-split-game-runtime` (tách `game.ts` & `GameUi.tsx`): chạy kiểm `npx tsc --noEmit`, `npm test`, `npm run validate:world`; đạt thì gộp `RF-3` + `origin/docs/tong-duyet-moc1-4-trang` + `origin/task/R-B0-tong-hop-refactor` (phần docs) vào `feat/sprint-0412`.
2. Chia việc song song bằng `git worktree` (mỗi task 1 nhánh riêng, ranh giới file không đụng nhau) theo 3 Đợt:
   - **Đợt 1 (Mở khóa nền):** `R-P1` + `R-D0` (mở rộng `types.ts`/`validate.ts`, cập nhật marker `MAP-1`/`MAP-2` trong `map_thcs.extras.ts`, gỡ `[PLACEHOLDER]` ở `chapters.ts`/`hub.ts`/`hubRoom.ts`/`FeedbackForm.tsx`, gắn cơ chế mở Form phản hồi khi bấm Thoát). Gộp Đợt 1 vào `feat/sprint-0412` trước khi chạy Đợt 2–3.
   - **Đợt 2 (5 nhánh Engine & Minigame chạy song song):**
     + `R-B1`: Đạo diễn NPC (`stageRunner.ts`, `dayScene.ts` — đi/chạy tới marker, quay mặt, đổi motion, ẩn hiện Châu rời cảnh P1-5, dịch chuyển cụm cảnh P1-5→P1-6).
     + `R-B2`: Chuyển cảnh & UI (`TitleCardOverlay`, `KeyHintCard`, **dải hiển thị Narrative bối cảnh tách biệt thoại** theo chuẩn SO_HOA_NARRATIVE_TA_CANH_MOC1.md, `CameraManager.dollyTo`, `zone_name_overrides` "Góc sân sau" → "Căn cứ bí mật", dẫn đường không khóa chân, đổi mưa trong cảnh).
     + `R-B3`: Chụp ảnh & Đạo cụ cầm tay (`photoRunner.ts`, `PhotoOverlay.tsx`, `actors/character/props.ts` — bỏ hardcode `MULTI_SHOT`, `shot_prompts` 3 lần Trang 1, thoại chen đếm ngược & phản ứng theo kiểu ảnh Trang 4, `hide_pose`, `setActorProp` cầm/trao vở, cầu, thuyền, sổ, bút đỏ, biển tên, máy ảnh, ảnh chính Trang 2 & 3 lấy từ người chơi chụp).
     + `R-B4`: Biến đổi 3D tại chỗ & Âm thanh (`m1_*.ts`, `dayController.ts`, `sfx.ts` — `lines_by_target` + `0/3` khảo sát Trang 3, hiện đồ trang trí ngay lúc chọn, tách 5 thuyền mép rãnh → 1 thuyền mắc cuối rãnh Trang 2, âm thanh cơ bản).
     + `R-B5`: Minigame gấp thuyền giấy + thao tác tự ghi điều ước lên cánh buồm ở Trang 2 Cảnh 3 (dùng `src/game/minigames/shared/`).
   - **Đợt 3 (Số hóa 100% nội dung sau khi Đợt 1–2 gộp xong):**
     + `R-D1…R-D4`: Đổ toàn bộ thoại, narrative bối cảnh, thẻ chữ, `stage`, `photo`, đổi thứ tự `s04` trước `s03` (Trang 3) vào `src/content/hub.ts`, `src/config/hubRoom.ts`, `src/content/days/d_g06_01.ts`…`d_g07_03.ts` đúng theo 4 bản `v1.1` (`R-A1-v1.1-hub`, `R-A2-v1.1-hub`, `c160a2d` cho Trang 3, `R-A4-v1.1-hub`) + bản chốt `TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md`.
3. Sau mỗi lượt gộp vào `feat/sprint-0412`, bắt buộc chạy đủ 5 lệnh kiểm chứng:
   `npx tsc --noEmit`, `npm test`, `npm run validate:world`, `VERCEL_ENV=production npm run build`, `npx playwright test --workers=1`.
4. Trình bày báo cáo cho chủ dự án: ngắn gọn bằng tiếng Việt, ghi rõ task nào đã gộp, kết quả chạy lệnh thật, và không tự ý gộp vào `main`.
```

---

## PROMPT 2 · DÀNH CHO ĐỢT 1 (`R-P1` + `R-D0` — NỀN DỮ LIỆU, BẢN ĐỒ & FORM THOÁT)

Copy dán cho agent thực hiện Đợt 1 (sau khi `RF-3` và `docs/tong-duyet-moc1-4-trang` đã gộp vào `feat/sprint-0412`):

```text
Bạn là agent nền dữ liệu & bản đồ cho game "Vùng Ký Ức" (nhánh `task/R-P1-D0-nen-du-lieu` tách từ `origin/feat/sprint-0412`).

ĐỌC TRƯỚC:
- `CLAUDE.md`
- `docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md` (Phần 1, 3, 4)
- `docs/handoff/TONG_HOP_4_TRANG_VA_KE_HOACH_REFACTOR.md` (mục 1 & 3 Giai đoạn 2 `R-D`)

VIỆC CẦN LÀM:
1. Gỡ sạch `[PLACEHOLDER]` (`R-P1`):
   - `src/content/chapters.ts`: đổi tên Mốc 1 thành `"Mốc 1 · Căn cứ đầu tiên (Lớp 6–7)"`.
   - `src/config/hub.ts`: đổi `app_chat_name` thành `"AloNhau"`.
   - `src/config/hubRoom.ts`: gỡ `[PLACEHOLDER]` và đổ lời thoại mới cho `HUB_BOX_LINES` (`open_first`, `open_again`, `locked`) và 6 món `HUB_DECOR` theo đúng bản chốt ở `TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md`.
   - `src/ui/game/FeedbackForm.tsx`: giữ 4 câu hỏi & ô góp ý hiện có, xóa toàn bộ chữ `[PLACEHOLDER]`.
2. Mở Form phản hồi khi bấm Thoát:
   - Sửa luồng thoát game (`MenuModal.tsx` / `game.ts` / `hubController.ts` / `dayController.ts`): bổ sung nút/hành động Thoát phiên chơi (hoặc khi người chơi bấm Thoát ở bất kỳ đâu), bật ngay `FeedbackForm` trước khi kết thúc/rời game (không đợi chơi hết Mốc). Cập nhật unit/e2e test liên quan.
3. Mở rộng hợp đồng dữ liệu (`src/content/types.ts`, `src/content/validate.ts`):
   - Hỗ trợ: `narrative` lines (phân biệt với thoại nhân vật), `title_card` (2 dòng), `stage` (`StageCue[]`), `ChoiceOption.lines`, `collect.lines_by_target`, `photo.{shots, first_line, shot_prompts, prompt, hide_pose, countdown_lines, after_lines}`, `zone_name_overrides`, và loại minigame `mg_fold_boat` (Trang 2).
4. Cập nhật bản đồ (`src/world/maps/map_thcs.extras.ts` + `map_thcs.index.json` nếu cần):
   - Dời `itr.thcs.tripod_spot` + `spot.thcs.yard_group` về gốc phượng (`spot.thcs.phuong_root`); chuyển `cam.thcs.rainbow` + `stand_zone` ảnh 2 sang `spot.thcs.field_log` (khác góc Trang 8).
   - Bổ sung marker còn thiếu của Trang 1, 2, 3, 4 (bảng phân lớp, bàn học 3 người P1-3, bụi cây sân đá cầu P1-4, chỗ đứng chụp trước rãnh & cuối rãnh P2-4/P2-6, tường dán ảnh Căn cứ P4-8).

NGHIỆM THU: Chạy thật `npx tsc --noEmit`, `npm test`, `npm run validate:world`, `VERCEL_ENV=production npm run build` đều đạt; ghi rõ số lượng `[PLACEHOLDER]` còn lại trong bundle production (Main/Hub/FeedbackForm phải = 0).
```

---

## PROMPT 3 · DÀNH CHO ĐỢT 3 (`R-D1…R-D4` — SỐ HÓA TOÀN BỘ THOẠI & SCENE TRANG 1–4 + HUB)

Copy dán cho agent số hóa nội dung sau khi Đợt 1 & Đợt 2 đã gộp vào `feat/sprint-0412`:

```text
Bạn là agent số hóa kịch bản cho game "Vùng Ký Ức" (nhánh `task/R-D-so-hoa-moc1` tách từ `origin/feat/sprint-0412`).

ĐỌC TRƯỚC:
- `docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md` (bản chốt 100%)
- 4 bản kỹ thuật v1.1:
  + Trang 1: `origin/task/R-A1-v1.1-hub:docs/handoff/gemini/R-A1/THOAI_TRANG1_v1.1.md` (lưu ý: câu 7 Châu ở P1-3 dùng câu đã chốt: "Lo chép bài đi, chút ra chơi rồi tính tiếp.")
  + Trang 2: `origin/task/R-A2-v1.1-hub:docs/handoff/gemini/R-A2/THOAI_TRANG2_v1.1.md` (lưu ý: P2-3 có đủ minigame gấp thuyền → chọn điều ước → tự ghi điều ước)
  + Trang 3: `origin/task/R-A4-v1.1-hub:docs/handoff/gemini/R-A3/THOAI_TRANG3_v1.1.md` (commit `c160a2d`)
  + Trang 4: `origin/task/R-A4-v1.1-hub:docs/handoff/gemini/R-A4/THOAI_TRANG4_v1.1.md`

CHỈ SỬA CÁC FILE NỘI DUNG:
- `src/content/hub.ts` (`q_hub_pd_01`, `q_hub_pd_04`, `PDES` phản ứng khi về phòng sau Trang 1–4)
- `src/content/days/d_g06_01.ts` (Trang 1 — điểm xuất hiện `spawn.thcs.gate`, bước xem bảng `s01b`, `title_card`, `stage`, `shot_prompts`, `narrative`, câu Châu mới ở P1-3)
- `src/content/days/d_g07_01.ts` (Trang 2 — `title_card`, `stage`, bước ảnh mới `P2-4` trước `mg_boat`, minigame gấp thuyền + tự ghi điều ước ở `P2-3`, ảnh chính đổi sang `gameplay_photo`)
- `src/content/days/d_g07_02.ts` (Trang 3 — đổi thứ tự `s04 mg_base_build` TRƯỚC `s03 c_m1_03_decor`, `zone_name_overrides` "Góc sân sau" → "Căn cứ bí mật", `collect.lines_by_target`, `ChoiceOption.lines`, `P3-7` ảnh chính đổi sang `gameplay_photo`)
- `src/content/days/d_g07_03.ts` (Trang 4 — `title_card`, `stage`, 3 bộ `countdown_lines` + `after_lines` theo `m1.group_photo_style`, ảnh 1 gốc phượng, ảnh 2 khúc gỗ bãi đất `hide_pose`, `hook_2026` mới)

NGHIỆM THU: `npx tsc --noEmit`, `npm test`, `npm run validate:world`, `VERCEL_ENV=production npm run build` (0 `[PLACEHOLDER]` trên đường Main + Hub), và `npx playwright test --workers=1`.
```
