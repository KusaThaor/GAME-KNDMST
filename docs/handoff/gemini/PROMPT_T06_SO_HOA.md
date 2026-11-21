# T-06 · Số hóa kịch bản Trang 1–4 thành dữ liệu game (prompt cho Gemini / Antigravity)

Đọc `GEMINI_RULES.md` trước. Nhánh làm việc: `content/m1-so-hoa` (tách từ `feat/sprint-0412`).

## MỤC TIÊU
Biến kịch bản chữ **Trang 1 → Trang 4** (Mốc 1, lớp 6–7) thành 4 file dữ liệu game đọc được, **nguyên văn thoại**, đúng khuôn có sẵn, để chơi xuyên 4 Trang. Bạn **không viết thêm cốt truyện**. Chủ dự án duyệt cuối từng Trang.
Không làm Trang 5–9, không làm Mốc 2, không làm Kết demo (việc khác).

## FILE
| Đọc | Ghi |
|---|---|
| Kịch bản: `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (dòng ~47–325: MỞ ĐẦU, Trang 1–4; Phụ lục A, B, E) | `src/content/days/d_g06_01.ts` (Trang 1) |
| `docs/gdd/01_NARRATIVE_AND_SCENES.md` §2.3, §4, §5.1, §6, §7 | `src/content/days/d_g07_01.ts` (Trang 2, **tạo mới**) |
| `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §2.4.1–2.4.6 | `src/content/days/d_g07_02.ts` (Trang 3, **tạo mới**) |
| `docs/PAGE_DATA_GUIDE.md`, `src/content/types.ts`, mẫu `d_g06_01.ts`, `d_g07_03.ts` | `src/content/days/d_g07_03.ts` (Trang 4) |
| Danh sách điểm đứng/điểm tương tác/máy ảnh có thật: `src/world/maps/map_thcs.index.json` | Cắm Trang mới: `pack.ts`, `release.ts` (bản **test**), `chapters.ts`, `hub.ts` (xem `PAGE_DATA_GUIDE` §5) |
| | Bảng đối chiếu: `docs/handoff/gemini/DOI_CHIEU_TRANG_N.md`; câu hỏi: `QUESTIONS_LOG.md` |

Bảng Trang: Trang 1 `d.g06.01` · Trang 2 `d.g07.01` · Trang 3 `d.g07.02` · Trang 4 `d.g07.03`.

## QUY TRÌNH (mỗi Trang, lần lượt; làm Trang 1 và 4 trước)
1. **Đọc** kịch bản của Trang đó và các mục GDD liên quan.
2. **Lập bảng đối chiếu nháp** (`DOI_CHIEU_TRANG_N.md`): mỗi "Bước" trong kịch bản → loại bước game (`talk/choice/photo/minigame/...`) → ID bước. Gạch rõ chỗ kịch bản **không đủ thông tin** để điền.
3. **Hỏi chủ dự án** (gom ≤5 câu/cụm, theo `GEMINI_RULES` §4) những chỗ chưa rõ. Các chỗ thường phải hỏi:
   - Thao tác người chơi trong kịch bản (ví dụ "chọn kiểu gấp", "giữ chuột chọn lực") ứng với trò nào / khung nào của game.
   - Cảnh xảy ra ở khu nào của trường, NPC đứng chỗ nào — nếu **không có** điểm đứng/điểm tương tác tương ứng trong `map_thcs.index.json`. Đừng tự đặt ID điểm mới: hỏi, hoặc dùng điểm gần nhất và ghi `// TODO hỏi chủ dự án`.
   - Lựa chọn nào cần lưu mà Phụ lục B chưa nói rõ.
   - Chữ tiếng Việt có thể hiểu hai nghĩa, tên riêng, cách gọi nhau chưa khớp §2.3.
   - Mâu thuẫn giữa kịch bản và GDD (nêu cả hai câu, hỏi cái nào đúng; mặc định **kịch bản thắng**).
4. **Viết file** theo mẫu. Xuất đúng 5 thứ: `day`, `quests`, `artifact`, `fragments`, `entries`. Giữ nguyên chữ thoại. Quest nhiều cảnh → mỗi cảnh một bước/nhóm bước, đúng thứ tự kịch bản.
5. **Chạy kiểm** và ghi kết quả thật: `npx tsc --noEmit`, `npm test`. Sửa lỗi dữ liệu (ID lệch, trùng, thiếu tham chiếu) cho tới khi sạch. Nếu lỗi nằm ngoài các file được phép sửa → dừng, ghi vào QUESTIONS_LOG, báo chủ dự án.
6. **Nộp cho chủ dự án duyệt**: bảng đối chiếu + danh sách "tôi tự viết thêm" + danh sách `[PLACEHOLDER]` còn lại. Chờ "duyệt Trang N" mới bỏ nhãn `AI_PROPOSED` ở đoạn giữ đúng kịch bản.
7. **Commit** `content: số hóa Trang N (nháp, chờ duyệt)` rồi, sau khi duyệt, `content: Trang N đã duyệt`. Push nhánh `content/m1-so-hoa`.

## YÊU CẦU KỸ THUẬT (tóm tắt, chi tiết ở GEMINI_RULES và PAGE_DATA_GUIDE)
- ID không đổi mẫu: Trang `d.gNN.KK` · quest `q_m1_<main|side|daily>_NN` · bước `<quest_id>.sNN` · kỷ vật `art_m1_NN` · mảnh `frag.<trang>.NN` · ô Album `alb.<trang>.NN` · điểm `itr.thcs.<tên>` · máy ảnh `cam.<...>`. **Kiểm trước khi đặt**: Trang 1 đã dùng `q_m1_main_01`, `art_m1_01`; Trang 4 đã dùng `q_m1_main_05`, `q_m1_side_02`, `art_m1_05`. Trang 2–3 dùng số còn trống, không trùng.
- Mỗi Trang đúng **một** kỷ vật dẫn vào (Phụ lục A: Trang 1 mật lệnh có nét sửa đỏ · Trang 2 thuyền giấy của Hạ · Trang 3 biển tên + sổ luật bìa xanh · Trang 4 ảnh nhóm bị ố) và ít nhất một ô Album `required_for_restore: true`.
- Kết quả trò (thuyền Đức lật, thuyền Quân nhất…, thua vẫn đi tiếp) là việc của trò, **không** viết thành nhánh truyện mới.
- Khung trò thật (`minigame`) chưa xong: bước `minigame` chỉ ghi `game` + `level` theo tên trò ở GDD `02`; **không** tự viết luật chơi trong dữ liệu.

## NGHIỆM THU
- `npx tsc --noEmit` đạt · `npm test` đạt (ghi số đạt/lỗi thật).
- `npm run dev` rồi mở `/?play=1&day=d.g06.01` … `d.g07.03` (nếu chủ dự án chạy được): thoại khớp kịch bản, xưng hô đúng §2.3, không còn `[PLACEHOLDER]` trên đường Main của 4 Trang **đã được duyệt**.
- Có `DOI_CHIEU_TRANG_N.md` cho cả 4 Trang và `QUESTIONS_LOG.md` đủ câu hỏi/trả lời.
- Báo cáo cuối (tiếng Việt, ngắn): **Báo cáo** (đã làm, đã chạy gì, chưa chạy gì) tách riêng **Cần duyệt** (danh sách chỗ chủ dự án phải chốt).
