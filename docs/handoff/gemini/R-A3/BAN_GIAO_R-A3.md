# BÀN GIAO R-A3 — Viết hoàn thiện thoại Trang 3 (cho Antigravity · Gemini Flash 3.8)

| | |
|---|---|
| Ngày | 25/11/2026 · DRAFT |
| Người giao | Claude (quản lý thiết kế), theo lệnh chủ dự án 25/11 |
| Nhánh git | `task/R-A3-thoai-trang3` (đã có sẵn trên `origin`) |
| Đọc | **Chỉ 1 file:** `docs/handoff/gemini/R-A3/THOAI_TRANG3_OUTLINE.md` (khung đã duyệt). Cần tra thêm thì mở `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` phần **TRANG 3** và **Phụ lục E** |
| Ghi | **Chỉ 1 file mới:** `docs/handoff/gemini/R-A3/THOAI_TRANG3_v1.0.md` |
| Hạn | 26/11 (để chủ dự án duyệt trước 28/11) |

## 1. Việc cần làm
Khung Trang 3 đã được chủ dự án duyệt (8 phân cảnh P3-1…P3-8, 7 câu hỏi đều chốt theo đề xuất). Chữ trong khung chỉ là nháp. **Bạn viết lại chữ cho hoàn thiện**: tự nhiên, đúng giọng từng bạn, đọc lên có nhịp, hợp học sinh lớp 7 miền Nam năm 2016, không khí "cả nhóm lần đầu có chỗ riêng". Giữ nguyên mọi thứ khác của khung.

## 2. Được đổi / KHÔNG được đổi

**Được đổi:** câu chữ thoại · câu dẫn · câu khi tới nơi · lời nhắc trên màn hình · chữ thẻ · câu hỏi của bảng chọn trang trí · 3 câu phản ứng theo kiểu trang trí · thẻ luật trò viết luật · động tác (chọn trong bộ có sẵn) · số ô thoại trong một phân cảnh (bớt hoặc thêm tối đa 2 ô).

**KHÔNG được đổi:**
- Thứ tự chơi: P3-1 → P3-2 → P3-3 → **P3-5 → P3-4** → P3-6 → P3-7 (dọn/dựng **trước**, trang trí **sau**). Ai đứng đâu, ai đi đâu; kiểu nối cảnh; mã bước, mã trò, mã điểm.
- 7 quyết định đã chốt (mục "[HỎI CHỦ DỰ ÁN] — ĐÃ CHỐT" trong khung).
- Tên **"Căn cứ Bí mật"** chỉ được nói ra lần đầu ở P3-5 (trước đó gọi "góc sân sau", "chỗ này"…).
- 3 phương án trang trí giữ chữ **"Giấy màu" / "Hoa" / "Ảnh"**. **Chữ 5 điều luật không đụng** và không đọc lại trong thoại.
- Luật 2 trò (dựng Căn cứ, viết luật). Không viết lời "trước khi chơi" vào thoại sau trò.
- P3-8 (bắn bi): **không viết thoại**, giữ nguyên `[PLACEHOLDER]`; chỉ được sửa câu chữ phần mô tả cho gọn.
- Không thêm nhân vật, sự kiện, đồ vật mới. Không đụng thư mục `src/`.
- **5 câu giữ nguyên chữ (điểm neo):**
  1. Châu: **"Hợp thì hợp, nhưng dọn trước đã. Bụi quá trời."**
  2. Đức: **"Từ hôm nay, đây chính thức là Căn cứ Bí mật của tụi mình!"**
  3. Châu: **"Phải có luật."**
  4. Quân: **"Vậy từ nay có chỗ gặp nhau rồi."**
  5. Đức: **"Đây là địa bàn của tụi mình!"** → Châu: **"Đừng gọi là địa bàn. Nghe ghê quá."** (một cặp)
- Câu phản ứng lựa chọn "Ảnh" phải giữ ý **"chưa có tấm ảnh nào đủ năm đứa"** (được viết lại câu chữ).

## 3. Giọng và xưng hô
| Ai | Giọng | Xưng hô |
|---|---|---|
| Đức | Ồn, bày trò, làm trước nghĩ sau, thích làm "thủ lĩnh", bị bắt bẻ thì cãi cho vui | "tao – mày" với cả nhóm |
| Châu | Gọn, nghiêm, hay bắt lỗi, quan tâm nhưng giấu | "tui"; gọi Đức/Quân "ông", Hạ "bà"; gọi chung "mấy người" |
| Hạ | Mơ mộng, nhẹ nhàng, hay dịu chuyện | xưng "Hạ", gọi tên; bỏ chủ ngữ khi được để khỏi lặp tên |
| Quân | Hiền, ít nói, câu ngắn, thỉnh thoảng "…" | "tớ – cậu" (kể cả với Đức) |
| {player_name} | Ít nói, hay quan sát | "tao" với Đức · "tớ" với Quân, Hạ · với Châu tránh đại từ |

- Người chơi có thể là nam hoặc nữ: **không** gọi người chơi bằng từ phân giới. Nếu bắt buộc thì dùng `{g:ông|bà}`, **tối đa 1 lần cả Trang** (khung đang dùng ở P3-7 ô 9).
- Từ đệm miền Nam vừa phải: nè, nha, nghen, hông, lẹ, vầy, thiệt. ≤ 1 từ đệm mỗi ô.

## 4. Luật đo (tự kiểm từng ô)
| # | Luật | Cách đếm |
|---|---|---|
| L1 | Mỗi ô thoại ≤ 2 dòng ≈ **≤ 90 ký tự** | Tính `{player_name}` là 12 ký tự |
| L2 | Không quá **3 ô liền** mà không có nhịp hành động (★) | ★ = động tác khác "nói/đứng", hoặc máy quay/đạo cụ đổi |
| L3 | Động tác chỉ được: đứng, đi, chạy, nói, tạo dáng chữ V, vẫy tay, tạo dáng "tada", reo mừng | Cần động tác khác → ghi [CẦN ENGINE] |
| L4 | Thoại sau trò = **phản ứng với việc vừa làm**, đúng cho cả thắng/thua/Bỏ qua | Dựng Căn cứ và viết luật đều **không có thua** |
| L5 | Mỗi chỗ nối: tối đa **1 câu dẫn ≤ 12 từ** | 1 từ = 1 tiếng cách nhau bởi dấu cách |
| L6 | Dòng gợi ý góc màn hình và lời nhắc chụp: **≤ 8 từ** | như trên |
| L7 | Thẻ chữ ≤ 2 dòng · thẻ luật trò ≤ 3 dòng | |
| L8 | Không chi tiết sau 2016 (điện thoại thông minh, app, mạng xã hội, từ lóng mới) | Nghi ngờ → [KIỂM NĂM] |

Câu nào bạn không chắc: ghi **[HỎI CHỦ DỰ ÁN]** + 2–3 phương án A/B/C. Không đoán.

## 5. Đầu ra `THOAI_TRANG3_v1.0.md`
1. Đầu file: bảng (Phiên bản v1.0 · DRAFT · ngày · "Toàn bộ chữ = **PROPOSED**, chờ chủ dự án nói 'duyệt Trang 3'" · nguồn = khung v0.2).
2. Mở Trang + 8 phân cảnh, **theo thứ tự chơi** và **giữ đúng dạng của khung**: bảng chỉ đạo (Mã phân cảnh · Ai ở đâu lúc vào · Ai đi đâu · Câu dẫn vào · Câu dẫn ra · Dòng gợi ý góc màn hình) + bảng thoại (# · Người nói · Chữ · Động tác). Chép nguyên phần chỉ đạo của khung nếu không đổi chữ.
3. Dưới mỗi phân cảnh: 1 dòng **"Đổi so với khung:"** (ngắn).
4. Cuối file:
   - **Bảng tự kiểm**: 8 phân cảnh × L1–L8, ghi Đạt/Không; ô nào "Không" thì ghi lý do.
   - [HỎI CHỦ DỰ ÁN] mới (nếu có).
   - [CẦN ENGINE]: chép bảng của khung, thêm dòng mới nếu có.
   - [KIỂM NĂM].
5. **Không** sửa file khung, không sửa file nào khác.

## 6. Lưu lên git
```bash
git fetch origin
git checkout task/R-A3-thoai-trang3
git pull
# viết file xong:
git add docs/handoff/gemini/R-A3/THOAI_TRANG3_v1.0.md
git commit -m "content: viết hoàn thiện thoại Trang 3 (PROPOSED, chờ duyệt)"
git push origin task/R-A3-thoai-trang3
```
Không `push --force`, không gộp vào nhánh khác. Xong thì báo chủ dự án: tên file, số câu [HỎI CHỦ DỰ ÁN], số ô "Không" trong bảng tự kiểm.
