# BÀN GIAO R-A4 — Viết hoàn thiện thoại Trang 4 (cho Antigravity · Gemini Flash 3.8)

| | |
|---|---|
| Ngày | 25/11/2026 · DRAFT |
| Người giao | Claude (quản lý thiết kế), theo lệnh chủ dự án 25/11 |
| Nhánh git | `task/R-A4-thoai-trang4` (đã có sẵn trên `origin`) |
| Đọc | **Chỉ 1 file:** `docs/handoff/gemini/R-A4/THOAI_TRANG4_OUTLINE.md` (khung đã duyệt). Cần tra thêm thì mở `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` phần **TRANG 4** và **Phụ lục E** |
| Ghi | **Chỉ 1 file mới:** `docs/handoff/gemini/R-A4/THOAI_TRANG4_v1.0.md` |
| Hạn | 26/11 (để chủ dự án duyệt trước 28/11) |

## 1. Việc cần làm
Khung Trang 4 đã được chủ dự án duyệt (8 phân cảnh P4-1…P4-8, 4 câu hỏi đều chọn A). Chữ trong khung chỉ là nháp. **Bạn viết lại chữ cho hoàn thiện**: tự nhiên, đúng giọng từng bạn, đọc lên có nhịp, hợp học sinh cuối lớp 7 miền Nam năm 2016, tông ấm về tình bạn. Giữ nguyên mọi thứ khác của khung.

## 2. Được đổi / KHÔNG được đổi

**Được đổi:** câu chữ thoại · câu dẫn · câu khi tới nơi · lời nhắc trên màn hình · chữ thẻ · động tác (chọn trong bộ có sẵn) · số ô thoại trong một phân cảnh (bớt hoặc thêm tối đa 2 ô).

**KHÔNG được đổi:**
- Thứ tự 8 phân cảnh; ai đứng đâu, ai đi đâu; kiểu nối cảnh; mã bước, mã lựa chọn, mã trò, mã marker, mã flag.
- 4 quyết định đã chốt (mục "[HỎI CHỦ DỰ ÁN] — ĐÃ CHỐT" trong khung): **Đức** giữ máy khi chạy mưa · Đức mượn máy coi ảnh rồi trả · ảnh cầu vồng đặt máy trên **khúc gỗ bãi đất** · giữ câu Quân dán lại góc ảnh (Quân chỉ đứng cạnh).
- **Ba kiểu ảnh chỉ khác nhau ở LỜI PHẢN ỨNG ở P4-5** (quyết định 4). Không viết lời làm đổi dáng, đổi chỗ đứng. Phải đủ 3 bộ lời `playful` / `gentle` / `deep`, mỗi bộ 2–3 ô; tông khớp từng kiểu (rộn ràng / ấm áp / sâu lắng).
- Câu sau trò xếp đội hình (P4-4): **1 câu chung** cho mọi cách xếp và cả khi Bỏ qua. Không giả định ai đứng giữa, ai đứng sau.
- Lời nhắc màn hình ảnh cầu vồng (P4-7) phải **khác** ảnh 1: nhẹ, không giục chạy.
- Không thêm nhân vật, sự kiện, đồ vật mới. Không đụng thư mục `src/`.
- **Giữ nguyên chữ (điểm neo):**
  1. Ba phương án kiểu ảnh: **"Tạo dáng nhí nhố làm mặt hề"** · **"Đứng tự nhiên, khoác vai cười tươi"** · **"Nghiêm trang chỉnh tề như ảnh thẻ"**
  2. Đức: **"Nhìn nè! Từ ba đứa thành năm đứa rồi!"**
  3. Đức: **"Đứa nào vắng là phải chụp bù!"** (câu cuối Trang)
  4. Có mưa rào **rồi mới** cầu vồng; ảnh cầu vồng là **bìa Album**.

## 3. Giọng và xưng hô (Phụ lục E)
| Ai | Giọng | Xưng hô ở Trang 4 |
|---|---|---|
| Đức | Ồn, lanh chanh, hay đòi làm "nhân vật chính", thua thì cãi cho vui | "tao – mày" với cả nhóm; gọi chung "tụi mày", "tụi mình" |
| Châu | Gọn, nghiêm, hay bắt lỗi, quan tâm nhưng giấu | "tui"; gọi Đức, Quân "ông", Hạ "bà"; gọi chung "mấy người" |
| Hạ | Mơ mộng, dịu, để ý ánh sáng và cảnh đẹp | Tự xưng "Hạ", gọi bằng tên; gọi chung "mọi người"; bỏ chủ ngữ khi được |
| Quân | Hiền, ít nói, câu rất ngắn, hay mở bằng "…" | "tớ – cậu"; gọi chung "tụi mình" |
| {player_name} | Ít nói, hay quan sát, câu ngắn | Với Đức "tao – mày" · với Châu "tui – bà" · với Quân "tớ – cậu" · với Hạ "tớ" + gọi "Hạ" · cả nhóm "tụi mình" |

- Người chơi có thể là nam hoặc nữ: **không** để ai gọi người chơi bằng từ phân giới (ông/bà, thằng/con). Nếu bắt buộc thì dùng `{g:ông|bà}`, tối đa 1 lần cả Trang.
- Từ đệm miền Nam vừa phải: nè, nha, nghen, hông, lẹ, vầy (≤ 1 từ đệm mỗi ô).

## 4. Luật đo (tự kiểm từng ô)
| # | Luật | Cách đếm |
|---|---|---|
| L1 | Mỗi ô thoại ≤ 2 dòng ≈ **≤ 90 ký tự** | Tính `{player_name}` là 12 ký tự |
| L2 | Không quá **3 ô liền** mà không có nhịp hành động (▸) | ▸ = động tác khác "nói/đứng", hoặc máy quay/đạo cụ đổi |
| L3 | Động tác chỉ được: đứng, đi, chạy, nói, tạo dáng chữ V, vẫy tay, tạo dáng "tada", reo mừng | Cần động tác khác → ghi [CẦN ENGINE] |
| L4 | Thoại sau trò xếp đội hình = **phản ứng với việc vừa làm**, đúng cho cả xong và Bỏ qua | `mg_lineup` không có thua |
| L5 | Mỗi chỗ nối: tối đa **1 câu dẫn ≤ 12 từ** | 1 từ = 1 tiếng cách nhau bởi dấu cách |
| L6 | Dòng gợi ý góc màn hình và lời nhắc chụp: **≤ 8 từ** mỗi dòng | như trên |
| L7 | Thẻ chữ: **≤ 2 dòng** | |
| L8 | Không chi tiết sau 2016 (điện thoại thông minh, app, mạng xã hội, từ lóng mới) | Nghi ngờ → [KIỂM NĂM] |
| L9 | P4-5: đủ 3 bộ lời, mỗi bộ 2–3 ô, bộ nào cũng có ô "lúc đếm" và ô "sau chụp" | Đếm theo bảng |

Câu nào bạn không chắc: ghi **[HỎI CHỦ DỰ ÁN]** + 2–3 phương án A/B/C. Không đoán.

## 5. Đầu ra `THOAI_TRANG4_v1.0.md`
1. Đầu file: bảng (Phiên bản v1.0 · DRAFT · ngày · "Toàn bộ chữ = **PROPOSED**, chờ chủ dự án nói 'duyệt Trang 4'" · nguồn = khung v0.2).
2. 8 phân cảnh, **giữ đúng dạng của khung**: bảng chỉ đạo (Mã · Ai ở đâu lúc vào · Ai đi đâu · Thẻ/Câu dẫn vào · Câu dẫn ra · Gợi ý góc màn hình) + bảng thoại (# · Người nói · Chữ · Động tác). P4-2 giữ bảng 3 phương án; P4-5 giữ 3 bảng lời theo `playful` / `gentle` / `deep`. Chép nguyên phần chỉ đạo của khung nếu không đổi chữ.
3. Dưới mỗi phân cảnh: 1 dòng **"Đổi so với khung:"** (ngắn).
4. Cuối file:
   - **Bảng tự kiểm**: 8 phân cảnh × L1–L9, ghi Đạt/Không; ô nào "Không" thì ghi lý do.
   - [HỎI CHỦ DỰ ÁN] mới (nếu có).
   - [CẦN ENGINE]: chép bảng E1–E7 của khung, thêm dòng mới nếu có.
   - [KIỂM NĂM].
5. **Không** sửa file khung, không sửa file nào khác. Mục "Ghi chú cho dev" trong khung là việc của lập trình — không cần xử lý.

## 6. Lưu lên git
```bash
git fetch origin
git checkout task/R-A4-thoai-trang4
git pull
# viết file xong:
git add docs/handoff/gemini/R-A4/THOAI_TRANG4_v1.0.md
git commit -m "content: viết hoàn thiện thoại Trang 4 (PROPOSED, chờ duyệt)"
git push origin task/R-A4-thoai-trang4
```
Không `push --force`, không gộp vào nhánh khác. Xong thì báo chủ dự án: tên file, số câu [HỎI CHỦ DỰ ÁN], số ô "Không" trong bảng tự kiểm.
