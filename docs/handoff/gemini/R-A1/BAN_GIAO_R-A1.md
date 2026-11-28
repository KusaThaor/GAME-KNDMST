# BÀN GIAO R-A1 — Viết hoàn thiện thoại Trang 1 (cho Antigravity · Gemini Flash 3.8)

| | |
|---|---|
| Ngày | 25/11/2026 · DRAFT |
| Người giao | Claude (quản lý thiết kế), theo lệnh chủ dự án 25/11 |
| Nhánh git | `task/R-A1-thoai-trang1` (đã có sẵn trên `origin`) |
| Đọc | **Chỉ 1 file:** `docs/handoff/gemini/R-A1/THOAI_TRANG1_OUTLINE.md` (khung đã duyệt). Cần tra thêm thì mở `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` phần **TRANG 1** và **Phụ lục E** |
| Ghi | **Chỉ 1 file mới:** `docs/handoff/gemini/R-A1/THOAI_TRANG1_v1.0.md` |
| Hạn | 26/11 (để chủ dự án duyệt trước 28/11) |

## 1. Việc cần làm
Khung Trang 1 đã được chủ dự án duyệt (8 phân cảnh P1-1…P1-8, 5 câu hỏi đều chọn A). Chữ trong khung chỉ là nháp. **Bạn viết lại chữ cho hoàn thiện**: tự nhiên, đúng giọng từng bạn, đọc lên có nhịp, hợp học sinh lớp 6 miền Nam năm 2014. Giữ nguyên mọi thứ khác của khung.

## 2. Được đổi / KHÔNG được đổi

**Được đổi:** câu chữ thoại · câu dẫn · câu khi tới nơi · lời nhắc trên màn hình · chữ thẻ · động tác (chọn trong bộ có sẵn) · số ô thoại trong một phân cảnh (bớt hoặc thêm tối đa 2 ô).

**KHÔNG được đổi:**
- Thứ tự 8 phân cảnh; ai đứng đâu, ai đi đâu; kiểu nối cảnh; mã bước, mã trò, mã marker.
- 5 quyết định đã chốt (ghi ở mục "[HỎI CHỦ DỰ ÁN] — ĐÃ CHỐT" trong khung).
- Luật và số ván 4 trò. Không viết lời "trước khi chơi" vào thoại sau trò.
- Không thêm nhân vật, sự kiện, đồ vật mới. Không đụng thư mục `src/`.
- **5 câu giữ nguyên chữ (điểm neo):**
  1. Lời giải mật lệnh: **"RA CHƠI"**
  2. Đức: **"Mai mày nhớ ra chơi xuống sân với tao nha! …Ủa. Cậu. Với tớ."**
  3. Châu: **"Mới quen một bữa mà ông mày tao rồi hả?"**
  4. Đức: **"Ơ… dạ, Châu Tổng."** (biệt danh ra đời)
  5. Đức: **"…Đoán."** (ngay trước khi chụp)
- Ảnh tự sướng: 3 lần bấm, chọn 1; câu Châu ở lần bấm 1 phải nói về **tóc Đức dựng** (được viết lại câu chữ).

## 3. Giọng và xưng hô
| Ai | Giọng | Xưng hô ở P1-1…P1-5 | Từ P1-6 trở đi |
|---|---|---|---|
| Đức | Ồn, lanh chanh, làm trước nghĩ sau, hay khoe, thua thì cãi cho vui | "tớ – cậu" | "tao – mày" với người chơi và Châu |
| Châu | Gọn, nghiêm, hay bắt lỗi, quan tâm nhưng giấu | "tui"; gọi Đức "ông"; gọi chung "hai người"/"mấy người" | như cũ |
| {player_name} | Ít nói, hay quan sát, câu ngắn | "tớ – cậu" với Đức; với Châu tránh đại từ | "tao – mày" với Đức; với Châu tránh đại từ |

- Người chơi có thể là nam hoặc nữ: **không** để ai gọi người chơi bằng từ phân giới (ông/bà, thằng/con). Nếu bắt buộc thì dùng `{g:ông|bà}`, tối đa 1 lần cả Trang.
- Từ đệm miền Nam vừa phải: nè, nha, nghen, hông, lẹ, vầy. Không lạm dụng (≤ 1 từ đệm mỗi ô).

## 4. Luật đo (tự kiểm từng ô)
| # | Luật | Cách đếm |
|---|---|---|
| L1 | Mỗi ô thoại ≤ 2 dòng ≈ **≤ 90 ký tự** | Tính `{player_name}` là 12 ký tự |
| L2 | Không quá **3 ô liền** mà không có nhịp hành động (★) | ★ = động tác khác "nói/đứng", hoặc máy quay/đạo cụ đổi |
| L3 | Động tác chỉ được: đứng, đi, chạy, nói, tạo dáng chữ V, vẫy tay, tạo dáng "tada", reo mừng | Cần động tác khác → ghi [CẦN ENGINE] |
| L4 | Thoại sau trò = **phản ứng với việc vừa làm**, đúng cho cả thắng/thua/Bỏ qua | Mật lệnh, lau bảng, mì gói: không có thua. Đá cầu: lượt cuối Đức **luôn** đá hụt vào bụi |
| L5 | Mỗi chỗ nối: tối đa **1 câu dẫn ≤ 12 từ** | 1 từ = 1 tiếng cách nhau bởi dấu cách |
| L6 | Dòng gợi ý góc màn hình và lời nhắc chụp: **≤ 8 từ** | như trên |
| L7 | Thẻ chữ: **≤ 2 dòng** | |
| L8 | Không chi tiết sau 2016 (điện thoại thông minh, app, mạng xã hội, từ lóng mới) | Nghi ngờ → [KIỂM NĂM] |

Câu nào bạn không chắc: ghi **[HỎI CHỦ DỰ ÁN]** + 2–3 phương án A/B/C. Không đoán.

## 5. Đầu ra `THOAI_TRANG1_v1.0.md`
1. Đầu file: bảng (Phiên bản v1.0 · DRAFT · ngày · "Toàn bộ chữ = **PROPOSED**, chờ chủ dự án nói 'duyệt Trang 1'" · nguồn = khung v0.2).
2. 8 phân cảnh, **giữ đúng dạng của khung**: bảng chỉ đạo (Mã phân cảnh · Ai ở đâu lúc vào · Ai đi đâu · Câu dẫn vào · Câu dẫn ra · Dòng gợi ý góc màn hình) + bảng thoại (# · Người nói · Chữ · Động tác). Chép nguyên phần chỉ đạo của khung nếu không đổi chữ.
3. Dưới mỗi phân cảnh: 1 dòng **"Đổi so với khung:"** (ngắn).
4. Cuối file:
   - **Bảng tự kiểm**: 8 phân cảnh × L1–L8, ghi Đạt/Không; ô nào "Không" thì ghi lý do.
   - [HỎI CHỦ DỰ ÁN] mới (nếu có).
   - [CẦN ENGINE]: chép bảng E1, E2, E4, E6, E7 của khung, thêm dòng mới nếu có.
   - [KIỂM NĂM].
5. **Không** sửa file khung, không sửa file nào khác.

## 6. Lưu lên git
```bash
git fetch origin
git checkout task/R-A1-thoai-trang1
git pull
# viết file xong:
git add docs/handoff/gemini/R-A1/THOAI_TRANG1_v1.0.md
git commit -m "content: viết hoàn thiện thoại Trang 1 (PROPOSED, chờ duyệt)"
git push origin task/R-A1-thoai-trang1
```
Không `push --force`, không gộp vào nhánh khác. Xong thì báo chủ dự án: tên file, số câu [HỎI CHỦ DỰ ÁN], số ô "Không" trong bảng tự kiểm.
