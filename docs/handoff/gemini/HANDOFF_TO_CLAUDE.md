# BIÊN BẢN BÀN GIAO NHIỆM VỤ T-06 (GEMINI PRO -> CLAUDE CODE)

> **Dự án:** Vùng Ký Ức (KNĐMST)  
> **Người bàn giao:** Gemini Pro (Antigravity)  
> **Người nhận:** Claude Code  
> **Thời gian bàn giao:** 21/11/2026, 20:35 UTC+7  
> **Nhiệm vụ:** T-06 — Số hóa kịch bản Trang 1–4 (Mốc 1: Lớp 6–7) & T-08 (Ba tin nhắn kết demo)  
> **Nhánh git đã push:** `content/m1-so-hoa` (tracking `origin/content/m1-so-hoa`)  
> **Nhánh gốc:** `feat/sprint-0412`  
> **Commit mới nhất:** `cba52fb`  

---

## 1. Tóm tắt kết quả bàn giao

Gemini Pro đã hoàn tất 100% việc số hóa nội dung kịch bản cho toàn bộ Mốc 1 (Trang 1 đến Trang 4) cùng phần Mở đầu / Kết thúc demo Hub 2026:

### Các tệp dữ liệu cốt truyện chính:
1. `src/content/days/d_g06_01.ts` (Trang 1 — Mật lệnh số 01 · Lớp 6, 2014)
   - Thoại canonical chuẩn xác: gặp Đức nhặt vở, vào lớp giải mật lệnh với Châu Tổng, ăn mì tôm bóp và chụp ảnh tự sướng bộ ba bên ghế đá.
2. `src/content/days/d_g07_01.ts` (Trang 2 — Thuyền giấy dưới mái hiên · Đầu lớp 7, 2015)
   - Tạo mới 5 bước chính: trú mưa hiên, làm quen Hạ & Quân, chọn điều ước buồm thuyền (`c_m1_02_wish`), đua thuyền rãnh nước trước hiên, ký tên 5 đứa lên buồm thuyền kỷ niệm. Kèm side quest mẹo gấp thuyền của Quân.
3. `src/content/days/d_g07_02.ts` (Trang 3 — Căn cứ bí mật · Giữa lớp 7, 2016)
   - Tạo mới 5 bước chính: ý tưởng căn cứ, khảo sát góc sân sau gần bàn gỗ cũ, chọn phong cách trang trí (`c_m1_03_decor`), ghi 5 điều luật Căn cứ vào sổ bìa xanh, treo biển tên Căn cứ. Kèm side quest bắn bi mắt mèo với Quân.
4. `src/content/days/d_g07_03.ts` (Trang 4 — Đủ năm đứa · Cuối lớp 7, 2016)
   - Hoàn thiện kịch bản: hẹn hè năm lớp 8 (`c_m1_05_tone`), đặt máy ảnh tại gốc phượng, chụp ảnh hẹn giờ 10 giây đủ 5 đứa, chạy trú mưa Căn cứ và ngắm cầu vồng. Điểm chốt `end_day_id` kết thúc demo.
5. `src/content/hub.ts` (Hub 2026 — Phòng trọ mở đầu & Kết thúc Demo)
   - Mở đầu phòng trọ (`q_hub_pd_01`), Hộp Kỷ Vật.
   - Nhóm chat cũ "Căn cứ Bí mật" (`q_hub_pd_02`) và 3 sắc thái tin nhắn kết demo (`q_hub_pd_03`: `playful`, `gentle`, `deep`).
   - Khai báo Present-day Events `pde_07`..`pde_10` mở khóa Album và kệ kỷ vật cho Trang 2 và Trang 3.

### Các tệp tích hợp & kiểm thử:
- `src/content/pack.ts`: Đưa `d0701`, `d0702` vào `DAYS`.
- `src/content/release.ts`: Cấu hình bản `test` đủ 4 Ngày `['d.g06.01', 'd.g07.01', 'd.g07.02', 'd.g07.03']`, điểm dừng `end_day_id: 'd.g07.03'`.
- `src/content/chapters.ts`: Cập nhật chương Mốc 1 chứa trọn 4 Ngày.
- `tests/unit/contentPack.test.ts`: Kiểm tra hợp lệ 4 Ngày Mốc 1 và các kỷ vật tương ứng.
- `tests/unit/analyticsBridge.test.ts`: Cập nhật `playAll` tuần tự xuyên suốt 4 Ngày Mốc 1, kích hoạt đầy đủ các event `choice_made`, `page_completed` và `milestone_completed`.
- `docs/handoff/gemini/DOI_CHIEU_TRANG_1_4.md`: Bảng ma trận đối chiếu chi tiết kịch bản → step ID.
- `docs/handoff/gemini/QUESTIONS_LOG.md`: Ghi nhận các điểm chuẩn hóa kỹ thuật.

---

## 2. Kết quả kiểm tra bằng máy (Verification Evidence)

| Lệnh kiểm thử | Kết quả | Ghi chú |
|---|---|---|
| `npx tsc --noEmit` | **ĐẠT (0 lỗi)** | Type checking hoàn toàn sạch |
| `npm run validate:world` | **ĐẠT (0 lỗi, 0 nhắc)** | 6 khu vực map_thcs khớp manifest, GLB và index |
| `npm test` | **ĐẠT (23 passed, 1 skipped, 266 passed)** | 100% unit tests xanh, không có regression |
| `npm run build` | **ĐẠT (3.76s)** | Bundle production thành công, sạch công cụ test |

---

## 3. Hướng dẫn tiếp nhận dành cho Claude Code

Claude Code có thể tiếp nhận và gộp nhánh theo các bước:

```bash
# 1. Fetch nhánh content mới nhất từ remote
git fetch origin content/m1-so-hoa

# 2. Checkout hoặc merge vào nhánh feat/sprint-0412
git checkout feat/sprint-0412
git merge origin/content/m1-so-hoa --ff-only

# 3. Kiểm tra lại toàn bộ bằng máy
npx tsc --noEmit
npm run validate:world
npm test

# 4. Tiếp tục thực hiện các nhiệm vụ kỹ thuật tiếp theo
# - T-07: Tám trò K của Trang 1–4 (minigames)
# - T-03: Khung minigame và form phản hồi
```
