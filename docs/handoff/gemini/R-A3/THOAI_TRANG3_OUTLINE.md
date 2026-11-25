# KHUNG THOẠI + NHỊP DẪN CẢNH — TRANG 3 · CĂN CỨ BÍ MẬT (R-A3)

| | |
|---|---|
| Phiên bản | v0.2 · **DRAFT** · 25/11/2026 |
| Trạng thái | **Khung (outline) = CONFIRMED 25/11/2026**: chủ dự án duyệt cách dựng 8 phân cảnh và chọn **theo đề xuất** cho cả 7 câu hỏi (mục cuối). **Chữ thoại trong file chỉ là bản nháp khung**, sẽ được viết hoàn thiện ở `THOAI_TRANG3_v1.0.md` (Antigravity). Chữ hoàn thiện = **PROPOSED** cho tới khi chủ dự án nói "duyệt Trang 3" |
| Việc | R-A3 trong `GIAO_VIEC_MOC1_PHAN_CANH_v0.1.md` (v0.2), Phần 3 — 8 phân cảnh P3-1…P3-8 |
| Nguồn đã đọc | Dữ liệu Trang 3 `src/content/days/d_g07_02.ts` · luật 2 trò `mg_base_build.ts`, `mg_rules.ts` · bộ trang trí Căn cứ `src/world/props/m1/baseDecor.ts` · bản đồ `map_thcs` (nhánh `dev` @ `d5f1a09`) · kịch bản `KICH_BAN_DEMO_M1_M2_v1.md` Trang 3 + Phụ lục E · `01_NARRATIVE_AND_SCENES.md` §2.3 · `02` §3.2, §3.5 (bắn bi) |
| Giới hạn | Chưa chạy game. Nhịp và chỗ đứng suy từ dữ liệu, bản đồ và code |

**Giữ nguyên (không đụng):** tên **"Căn cứ Bí mật"** (Đức tuyên bố ở P3-5) · 3 kiểu trang trí **Giấy màu / Hoa / Ảnh**, mã lựa chọn `c_m1_03_decor`, mã phương án `paper`/`flowers`/`photos`, cờ `m1.base_decor`, tông · **chữ 5 điều luật** (nằm trong `mg_rules.ts`, không chép lại vào thoại) · **sổ bìa xanh** ghi "LUẬT" · **biển tên là ảnh chính**, hết Trang khi giữ ảnh biển · mã `q_m1_main_03`, bước `s01…s06`, `q_m1_ai_side_04`. Không viết lại luật 2 trò.

**Xưng hô:** từ Trang 3 Đức "tao – mày" với cả nhóm · Châu "tui", gọi Đức/Quân "ông", gọi Hạ "bà", gọi người chơi `{g:ông|bà}` (tối đa 1 lần cả Trang) · Hạ xưng "Hạ", gọi tên · Quân "tớ – cậu" · người chơi: "tao" với Đức, "tớ" với Quân/Hạ, tránh đại từ với Châu.

**Động tác chỉ dùng bộ có sẵn:** đứng, đi, chạy, nói, chữ V, vẫy tay, "tada", reo mừng. "Quay mặt về…" là lệnh hướng mặt của bộ dẫn đường (R-B1), không phải động tác mới. Cần thêm → **[CẦN ENGINE-n]** (cuối file).

**Cách đọc:** mỗi phân cảnh có một bảng chỉ đạo, rồi bảng thoại ngay dưới. Dòng ★ = nhịp hành động. Nhãn chữ: **GIỮ** = nguyên văn kịch bản · **SỬA** = sửa nhẹ · **MỚI** = viết mới.

**Thứ tự chơi (đã chốt, HỎI-2 = B):** P3-1 → P3-2 → P3-3 → **P3-5 (dọn/dựng) → P3-4 (trang trí)** → P3-6 → P3-7. Mã phân cảnh giữ theo file giao việc; chỉ đổi thứ tự. Trong dữ liệu: bước `s04` (dựng) chạy trước `s03` (chọn trang trí), mã bước giữ nguyên.

---

## Mở Trang — thẻ chữ (đầu P3-1)

| Mục | Nội dung |
|---|---|
| Kiểu nối | THẺ nhẹ, không thoại |
| Chữ thẻ | Dòng 1: **"Đầu học kỳ II"** (GIỮ) · Dòng 2: **"Lớp 7 · Giờ về"** (MỚI, từ "Sân trường, giờ về" của kịch bản) |
| Trong lúc tối | Đặt cả nhóm ở sân. Không ai đứng sẵn ở Căn cứ |

---

## P3-1 · Ý tưởng tìm căn cứ (`s01`, nói chuyện với Đức)

| Mục | Nội dung |
|---|---|
| Ai ở đâu lúc vào | Người chơi: `spawn.thcs.yard`. Đức `spot.thcs.yard_group_1`, Châu `yard_group_2`, Quân `yard_group_3`, Hạ `yard_group_4`: bốn bạn đứng túm tụm ở sân (HỎI-4 = A: có cả Châu) |
| Ai đi đâu | Người chơi tự đi tới Đức, bấm E. Sau ô 3: Quân quay mặt về lối ra sân sau; Hạ **đi** lên cạnh Quân (~1 m) |
| Câu dẫn vào | Không (thẻ chữ đủ) |
| Câu dẫn ra | Không; nối thẳng P3-2 |
| Gợi ý góc màn hình | **"Nói chuyện với Đức ở sân"** |

| # | Người nói | Chữ | Động tác | Nhãn |
|---|---|---|---|---|
| 1 | Đức | Tao có ý này! Mình kiếm một chỗ riêng để tụ tập đi. | vẫy tay gọi cả nhóm | GIỮ |
| 2 | Châu | Chỗ nào? Trường đâu phải nhà mình. | nói | GIỮ |
| 3 | Quân | Góc sân sau, gần nhà kho. Hình như ít ai ra. | nói | GIỮ |
| ★ | | *Quân quay mặt về lối sân sau; Hạ đi lên cạnh Quân* | | |
| 4 | Hạ | Hạ thấy chỗ đó rồi. Có gốc cây đẹp lắm. | nói | GIỮ |
| 5 | Đức | Chốt! Đi khám phá căn cứ mới! | reo mừng | GIỮ |

---

## P3-2 · Đi ra sân sau (nối `s01` → `s02`) · DẪN + QUA-KHU

| Mục | Nội dung |
|---|---|
| Ai ở đâu lúc vào | Như cuối P3-1 |
| Ai đi đâu | **Đức đi trước**: sân → lối sân sau (tường rào phía đông) → Bãi đất trống → lối vào Căn cứ, dừng trước mái che, quay mặt về người chơi. **Châu nối đuôi Đức**; Quân, Hạ đi sau người chơi. Qua mỗi lối: mờ nhẹ + tên khu. **Tên khu Căn cứ hiện "Góc sân sau"** cho tới khi Đức đặt tên ở P3-5 (HỎI-1 = A) [CẦN ENGINE-9] |
| Câu dẫn vào | Ô 1 (lúc xuất phát) |
| Câu dẫn ra | Ô 2 (khi tới nơi) |
| Gợi ý góc màn hình | **"Đi theo Đức ra sân sau"** |

| # | Người nói | Chữ | Động tác | Nhãn |
|---|---|---|---|---|
| 1 | Đức | Theo tao! Lối ra sân sau ở đằng này. | đi (nói lúc bắt đầu đi) [CẦN ENGINE-1] | MỚI |
| ★ | | *cả nhóm đi; qua lối sân sau; qua Bãi đất trống* | | |
| 2 | Đức | Tới rồi! Đúng là vắng hoe, không ai ra thiệt. | tada, quay mặt về người chơi | MỚI |

---

## P3-3 · Khảo sát 3 điểm (`s02`, tự do thứ tự)

| Mục | Nội dung |
|---|---|
| Ai ở đâu lúc vào | Đức, Châu giữa sân Căn cứ, gần mái che. Hạ ở lối vào. **Quân đứng ở chỗ chơi bi, Bãi đất trống** (cho nhiệm vụ phụ P3-8; ở bản đo nhiệm vụ phụ tắt thì Quân đứng ở lối vào) |
| Ai đi đâu | Người chơi tự bấm E ở mái che · gốc cây · thùng giấy, thứ tự nào cũng được. Mỗi điểm: **✓ + tiếng ngắn + 1 ô** (R-B4b). Lời **gắn theo điểm** (HỎI-5 = A). Đủ 3: Châu nói câu dẫn ra rồi **đi** vào giữa mái che; Quân về lối vào |
| Câu dẫn vào | Không |
| Câu dẫn ra | Châu: "Hợp thì hợp, nhưng dọn trước đã. Bụi quá trời." (GIỮ) |
| Gợi ý góc màn hình | **"Xem mái che, gốc cây, thùng giấy"** + bộ đếm 0/3 |

| Điểm | Người nói | Chữ | Động tác | Nhãn |
|---|---|---|---|---|
| Mái che `itr.thcs.base_survey_roof` | Đức | Có mái nè! Mưa xuống cũng khỏi sợ. | nói | MỚI |
| Gốc cây `itr.thcs.base_survey_stump` | Châu | Gốc cây này ngồi mát thiệt. Hạ nói đúng. | nói | MỚI |
| Thùng giấy `itr.thcs.base_survey_boxes` | Đức | Mấy thùng này làm ghế được nè! | vẫy tay | MỚI |
| Đủ 3/3 | Châu | Hợp thì hợp, nhưng dọn trước đã. Bụi quá trời. | nói, rồi đi vào giữa mái che | GIỮ |

---

## P3-5 · Dọn + dựng Căn cứ (`s04`, trò `mg_base_build`) · VÀO-CHỖ — *chơi trước P3-4*

| Mục | Nội dung |
|---|---|
| Ai ở đâu lúc vào | Châu giữa mái che. Đức gần mái che. Quân, Hạ ở lối vào |
| Ai đi đâu | **Quân đi** tới đống thùng giấy; Đức, Hạ **đi** tới quanh mái che (ôm thùng [CẦN ENGINE-4]; tạm: đứng cạnh đống thùng). Người chơi tự bước ≤ 2 m vào chỗ trước mái che → bảng trò. Xong: máy lùi ra, cả nhóm đứng quanh bàn |
| Câu dẫn vào | Không (câu "dọn trước đã" của Châu ở P3-3 đã dẫn) |
| Thẻ luật | Giữ 3 dòng hiện có |
| Câu dẫn ra | Không |
| Gợi ý góc màn hình | **"Kê bàn ghế dưới mái che"** |

Thoại **sau** trò (một bộ cho thắng / thua / Bỏ qua — trò này không có thua):

| # | Người nói | Chữ | Động tác | Nhãn |
|---|---|---|---|---|
| ★ | | *máy lùi ra; cả nhóm đứng quanh bàn* | | |
| 1 | Châu | Giờ sạch rồi đó. Tui công nhận. | nói | SỬA (thay "Dọn sạch rồi mới được công nhận.") |
| 2 | Đức | Từ hôm nay, đây chính thức là Căn cứ Bí mật của tụi mình! | tada | GIỮ — **điểm neo tên** |
| ★ | | *Quân, Hạ reo mừng. Từ đây tên khu đổi thành "Căn cứ bí mật"* | | |

Bỏ: "Bớt khó tính đi trời! Tao đang phát biểu khai trương mà!". Đoạn "Tên tao phải viết to nhất" nằm ở P3-7 (HỎI-3 = A).

---

## P3-4 · Chọn kiểu trang trí (`s03`, lựa chọn `c_m1_03_decor`) · ĐẨY-MÁY — *chơi sau P3-5*

| Mục | Nội dung |
|---|---|
| Ai ở đâu lúc vào | Cả nhóm quanh bàn vừa kê |
| Ai đi đâu | **Hạ đi** tới bàn (`itr.thcs.old_table`) — kịch bản giao Hạ trang trí. Máy quay đẩy vào bàn ~1 s → bảng chọn → chọn xong **đồ trang trí hiện ngay** trên bàn/mái che (R-B4c) → máy lùi ra → 1 ô phản ứng theo lựa chọn [CẦN ENGINE-3] |
| Câu hỏi của bảng chọn | Hạ: **"Trang trí kiểu gì đây? {player_name} chọn giùm Hạ nha."** (SỬA — thay câu của Châu; người hỏi đổi Châu → Hạ) |
| Ba phương án | **Giữ nguyên** chữ "Giấy màu" / "Hoa" / "Ảnh", mã, tông |
| Câu dẫn vào / ra | Không / Không |
| Gợi ý góc màn hình | **"Chọn kiểu trang trí cùng Hạ"** |

| Lựa chọn | Đồ hiện ra (đã có) | Người nói | Chữ phản ứng (1 ô) | Động tác | Nhãn |
|---|---|---|---|---|---|
| Giấy màu `paper` | dây cờ tam giác, hạc giấy | Đức | Cờ giấy với hạc giấy! Nhìn như sắp mở tiệc liền. | reo mừng | MỚI |
| Hoa `flowers` | lọ hoa dại, lon sữa trồng cây | Hạ | Có hoa vô cái là chỗ này hiền hẳn ha. | nói | MỚI |
| Ảnh `photos` | dây kẹp ảnh, khung ảnh | Châu | Ảnh thì được. Mà ảnh đủ năm đứa thì chưa có tấm nào. | nói | MỚI — gài cho Điều 5 và Trang 4 (HỎI-6 = A, **giữ ý**) |

---

## P3-6 · Viết 5 điều luật (`s05`, trò `mg_rules`) · ĐẨY-MÁY

| Mục | Nội dung |
|---|---|
| Ai ở đâu lúc vào | Cả nhóm quanh bàn đã trang trí |
| Ai đi đâu | Cả nhóm đứng quanh bàn (ngồi [CẦN ENGINE-5]). **Sổ bìa xanh + bút đỏ trên tay người chơi** [CẦN ENGINE-6]. Máy quay đẩy vào cuốn sổ ~1 s → bảng trò. Xong: máy lùi ra, sổ đặt xuống bàn |
| Câu dẫn vào | Châu: **"Phải có luật."** (GIỮ) — phát **trước** bảng trò [CẦN ENGINE-1] |
| Thẻ luật (≤ 3 dòng, SỬA) | 1. Mỗi bạn nói một điều, sổ ghi sẵn nửa đầu. · 2. Chọn mảnh câu đúng nửa sau. Đủ 5 điều là xong. · 3. Phím: ←/→ chọn, Enter ghép (hoặc 1–5). |
| 5 điều luật | **Không đụng chữ.** Bỏ 5 dòng đọc lại luật khỏi thoại của bước này |
| Câu dẫn ra | Không |
| Gợi ý góc màn hình | **"Ghi 5 điều luật vào sổ"** |

Thoại **sau** trò (một bộ cho thắng / thua / Bỏ qua — trò này không có thua):

| # | Người nói | Chữ | Động tác | Nhãn |
|---|---|---|---|---|
| ★ | | *máy lùi ra; sổ đặt xuống bàn* | | |
| 1 | Đức | Chốt! Ai vô Căn cứ cũng phải tuân thủ! | tada | GIỮ |
| 2 | Châu | Ông nói như có cả trăm người muốn vô. | nói | GIỮ |
| 3 | Đức | Biết đâu sau này nổi tiếng! | chữ V | GIỮ |

---

## P3-7 · Treo biển + chụp biển (`s06`) · CHỤP

| Mục | Nội dung |
|---|---|
| Ai ở đâu lúc vào | Cả nhóm quanh bàn. Đức cầm tấm biển [CẦN ENGINE-7] |
| Ai đi đâu | Ô 1–2 tại bàn → ★ Hạ **đi** tới cạnh Đức → ô 3–4 → ★ Đức **đi** ra mái che, treo biển [CẦN ENGINE-8]; cả nhóm đi theo, đứng dưới mái → ô 5–7 → ★ Đức quay sang người chơi → ô 8 → **CHỤP** (máy ảnh trên tay người chơi, giơ máy, khung `cam.thcs.base_sign`, flash + tiếng, hạ máy, "Giữ ảnh này") → ô 9–10 → **Hết Trang** |
| Lời nhắc màn hình lúc chụp | **"Chụp tấm biển cho rõ chữ"** |
| Câu dẫn vào / ra | Không / Không (màn kết Trang hiện có) |
| Gợi ý góc màn hình | Trước khi chụp: **"Ra mái che cùng Đức"** |
| Dữ liệu | Ảnh chính Album đang tự chụp ở `s06` → đổi thành ảnh người chơi bấm (R-B3 + R-D3) [CẦN ENGINE-10] |

| # | Người nói | Chữ | Động tác | Nhãn |
|---|---|---|---|---|
| 1 | Đức | Tên tao phải viết to nhất! | nói, cầm biển | GIỮ |
| 2 | Châu | Không có chuyện đó. Ai cũng bằng nhau. | nói | GIỮ |
| ★ | | *Hạ đi tới cạnh Đức* | | |
| 3 | Hạ | Đức viết to nhất là tên Quân bị chen mất đó. | nói | GIỮ |
| 4 | Đức | Mới thành lập đã bị cắt quyền lợi! | nói | GIỮ |
| ★ | | *Đức đi ra mái che, treo biển; cả nhóm đi theo* | | |
| 5 | Quân | Vậy từ nay có chỗ gặp nhau rồi. | nói | GIỮ |
| 6 | Đức | Đây là địa bàn của tụi mình! | tada, cạnh biển | GIỮ |
| 7 | Châu | Đừng gọi là địa bàn. Nghe ghê quá. | nói | GIỮ |
| ★ | | *Đức quay sang người chơi* | | |
| 8 | Đức | {player_name}, chụp tấm biển giùm tao cho đàng hoàng nha! | vẫy tay | MỚI (lời nhờ chụp) |
| ★ | | *CHỤP — giơ máy, flash, hạ máy, giữ ảnh* | | |
| 9 | Châu | Rõ từng chữ. Lần này {g:ông\|bà} chụp đàng hoàng thiệt. | nói | MỚI (lời sau chụp) |
| 10 | Đức | Thấy chưa, chữ tao đẹp mà! | chữ V | MỚI (lời sau chụp) |

---

## P3-8 · THIẾT KẾ nhiệm vụ phụ "Bắn bi" (quyết định 6 + Q2)

> Mọi chữ ở mục này: **[PLACEHOLDER] · AI_PROPOSED**. Chỉ là thiết kế, **không đổ vào dữ liệu**, tắt ở bản đo, dựng thật sau 15/12.

**A. Nhiệm vụ phụ Trang 3** — mã `q_m1_ai_side_04`, tên tạm "Bắn bi mắt mèo cùng Quân"

| Mục | Thiết kế |
|---|---|
| Ai rủ | **Quân** |
| Ở đâu | Chỗ chơi bi, Bãi đất trống (`itr.thcs.marble_spot`) — trên đường Đức dẫn đi ở P3-2 |
| Khi nào mở | **Chỉ trong P3-3** (HỎI-7 = A). Hết P3-3 chưa nhận → Quân về nhóm, nhiệm vụ đóng ở Trang này |
| Người chơi làm gì | Nói với Quân (E) → **một ván ngắn** dùng lại trò Bắn bi ve (`02` §3.5), rút gọn: ít bi, đối thủ cố định Quân, có "Bỏ qua", **không có thua chặn** |
| Kết thúc | Quân đưa một viên bi mắt mèo → nhãn dán "Viên bi mắt mèo" vào Album (ô phụ, không bắt buộc) → Quân về nhóm |
| Thoại | Quân rủ: [PLACEHOLDER 1 câu] · sau ván: [PLACEHOLDER 1–2 câu, chung thắng/thua/Bỏ qua] |
| Không làm | Không thêm sự kiện; không nhắc chuyện Đức phát bi ở Trang 9 |

**B. Hướng Khu Vui Chơi Căn cứ (Tầng B)**

| Mục | Hướng |
|---|---|
| Vị trí | Trong Căn cứ, vòng phấn trên nền đất (`02` §3.5). Mở sau khi xong Trang 3 |
| Quan hệ với nhiệm vụ phụ | Trang 3 = lần chơi đầu, luật gọn, đối thủ cố định. Tầng B = bản đầy đủ: chọn 1 trong 4 bạn = chọn độ khó (Hạ dễ · Châu, Quân khá · Đức khó nhất — chốt 20/11) |
| Dùng chung | Một trò, hai cấu hình (rút gọn / đầy đủ). Kết quả ghi "Bảng tỉ số" trong sổ luật (PROPOSED ở `02`) |
| Thoại | Mỗi đối thủ 1 câu rủ + 1 câu sau ván: [PLACEHOLDER] |
| Lịch | Sau 15/12 |

---

## [HỎI CHỦ DỰ ÁN] — ĐÃ CHỐT 25/11/2026 (theo đề xuất)

| # | Câu hỏi | Chốt |
|---|---|---|
| HỎI-1 | Tên khu Căn cứ hiện trước lúc đặt tên | **A** — ở Trang 3 hiện tên tạm **"Góc sân sau"** tới khi Đức đặt tên (P3-5) |
| HỎI-2 | Thứ tự trang trí – dọn/dựng | **B** — **dọn/dựng trước, trang trí sau**; mã bước giữ, chỉ đổi thứ tự |
| HỎI-3 | Đoạn "Tên tao phải viết to nhất…" | **A** — đặt ở P3-7, trước lúc treo biển |
| HỎI-4 | Châu lúc mở Trang | **A** — cả nhóm, có Châu, ở sân |
| HỎI-5 | Lời khảo sát luân phiên Đức/Châu | **A** — gắn lời theo điểm |
| HỎI-6 | Câu Châu ở lựa chọn "Ảnh" | **A** — giữ ý "ảnh đủ năm đứa chưa có tấm nào" |
| HỎI-7 | Khung giờ nhiệm vụ phụ bắn bi | **A** — chỉ trong P3-3 |

## [CẦN ENGINE]

| # | Cần gì | Dùng ở | Tạm thời nếu chưa có |
|---|---|---|---|
| ENGINE-1 | 1 câu dẫn phát **trước** bảng trò/bảng chọn; câu nói khi NPC đang đi dẫn, không khóa người chơi | P3-2, P3-6 | Câu dẫn hiện ở dòng gợi ý |
| ENGINE-3 | Lời phản ứng khác nhau theo phương án ở bước lựa chọn | P3-4 | Một câu chung: Hạ "Vậy trang trí kiểu này nha!" |
| ENGINE-4 | Ôm/khiêng thùng giấy | P3-5 | Đứng cạnh đống thùng |
| ENGINE-5 | Ngồi quanh bàn | P3-6 | Đứng quanh bàn |
| ENGINE-6 | Sổ bìa xanh + bút đỏ trên tay người chơi | P3-6 | Sổ nằm trên bàn |
| ENGINE-7 | Biển tên trên tay Đức | P3-7 | Biển dựng cạnh bàn |
| ENGINE-8 | Động tác treo biển | P3-7 | Máy ngó lên mái ~0,5 s, biển hiện, Đức tada cạnh biển |
| ENGINE-9 | Tên khu đổi theo Trang/bước ("Góc sân sau" → "Căn cứ bí mật") | P3-2 → P3-5 | — (đã chốt, cần làm) |
| ENGINE-10 | Ảnh chính Trang 3 lấy từ lần người chơi bấm | P3-7 | Thuộc R-B3 / R-D3 |
| Dữ liệu | Đổi thứ tự `s04` trước `s03` (HỎI-2 = B); lời dẫn "Rồi, giờ dọn…" của bản v0.1 đã bỏ | P3-5, P3-4 | — |

(ENGINE-2 của bản v0.1 bỏ vì HỎI-5 = A.)

**[KIỂM NĂM]:** chưa có chỗ nào. Đồ vật dùng (cờ giấy, hạc giấy, lon sữa trồng cây, ảnh in, bút lông, sổ, bi ve) hợp 2016.

---

## Thay đổi so với bản v0.1 (25/11)
- 7 câu hỏi chốt theo đề xuất; khung chuyển CONFIRMED, chữ vẫn là nháp.
- Đổi thứ tự: P3-5 (dọn/dựng) trước P3-4 (trang trí); bỏ câu dẫn vào P3-5.
- Tên khu tạm "Góc sân sau" tới P3-5.
- `[ÔNG_BÀ]` viết lại thành `{g:ông|bà}` theo `GEMINI_RULES`.
- Thêm vị trí Quân ở bãi đất trong P3-3 (cho nhiệm vụ phụ).
