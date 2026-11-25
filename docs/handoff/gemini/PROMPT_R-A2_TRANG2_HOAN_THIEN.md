# BÀN GIAO R-A2 · Viết hoàn thiện thoại Trang 2 — cho Antigravity (Gemini Flash 3.8)

| | |
|---|---|
| Phiên bản | v1.0 · DRAFT · 25/11/2026 |
| Người giao | Claude (quản lý thiết kế) · chủ dự án đã đồng ý giao |
| Việc | Từ **outline** `R-A2_TRANG2_THOAI_PROPOSED.md` (v0.2), viết ra **bản thoại hoàn chỉnh** Trang 2 |
| Đầu ra | **Một file** `docs/handoff/gemini/R-A2_TRANG2_THOAI_v1.md`. **Không** sửa file `.ts`, code hay tài liệu gốc |
| Hạn | Chủ dự án duyệt chữ trước **28/11** → nộp càng sớm càng tốt (mục tiêu 26/11) |
| Nhãn | Mọi chữ = **PROPOSED**. Không ghi "đã duyệt" |

---

## A. Cách chạy (chủ dự án làm, 3 bước)

**1. Lấy nhánh** (dùng thư mục nội dung riêng, đừng dùng thư mục Asset Workshop):
```bash
cd GAME-KNDMST-noidung        # chưa có thì clone như 00_BAT_DAU_ANTIGRAVITY.md bước 1
git fetch origin
git checkout task/R-A2-trang2-outline
git pull
git checkout -b content/R-A2-trang2-hoan-thien
```

**2. Chọn model Gemini Flash 3.8** trong Antigravity, mở đúng thư mục trên.

**3. Dán nguyên khối prompt ở mục D** vào khung chat. Gemini hỏi thì trả lời "A/B/C" hoặc "để sau".

---

## B. Gemini đọc gì (đúng thứ tự, chỉ chừng này)

| # | File | Đọc phần nào | Để làm gì |
|---|---|---|---|
| 1 | `docs/handoff/gemini/R-A2_TRANG2_THOAI_PROPOSED.md` | Toàn bộ | **Outline chính**: khung 6 phân cảnh, chỉ đạo, quyết định đã chốt |
| 2 | File này | Mục C, E, F | Luật viết + bộ nối cảnh + mẫu đầu ra |
| 3 | `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` | "TRANG 2" và Phụ lục E | Thoại gốc + xưng hô |
| 4 | `src/content/days/d_g07_01.ts` | Chỉ đọc | Mã thật (quest, bước, lựa chọn, flag) |
| 5 | `docs/handoff/gemini/GEMINI_RULES.md` | Mục 3–4 | Quy tắc nội dung + cách hỏi |

Không cần đọc thêm file nào khác. Không đọc lại cả GDD.

---

## C. Đã chốt — KHÔNG đổi, KHÔNG hỏi lại

**Quyết định chủ dự án 25/11 (CONFIRMED):**
1. Mỗi hoạt động có chuyển cảnh; NPC đổi chỗ theo bước, đi trước dẫn người chơi; cảnh chụp phải thấy máy ảnh trên tay.
2. Chụp 5 thuyền **trước khi** thả (P2-4). Ảnh này là ảnh chính Album Trang 2.
3. Trang 2 là **giờ ra chơi buổi chiều**, kết bằng **trống** vào lớp (không phải "sau giờ học", không phải "chuông").
4. Minigame vẫn có bước chọn kiểu thuyền (buồm/mui/đôi); chấp nhận lệch nhỏ với ảnh.
5. Ghi chú ảnh Album: "Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xếp hàng chờ thả."
6. Một máy ảnh nhỏ cho mọi cảnh chụp. Không điện thoại.

**Điểm neo — giữ nghĩa:**
- Lựa chọn điều ước `c_m1_02_wish`: giữ **nguyên chữ, tông, mã** 3 phương án (`friendship` "Mai mốt vẫn chơi chung vầy." · `fun` "Lớp 7 vui hơn lớp 6." · `secret` "Bí mật không nói ra."). Chữ này hiện trên cánh buồm.
- 5 chiếc thuyền. Kết quả đua cố định: thuyền Đức lật ngay, Quân xa nhất, Hạ đẹp nhất mà chậm nhất.
- Thuyền **của Hạ** mắc lại, được vớt; Player chép điều ước lên buồm đó; **cả nhóm cùng ký** lên chiếc thuyền ấy.
- Câu móc kỷ vật 2026 "Trên buồm còn chữ… mình ước gì vậy ta?" không đụng.

**Xưng hô (Phụ lục E):** Đức "tao–mày" với Player, Châu; "tớ–cậu" với Hạ, Quân và khi nói chung cả nhóm (Trang 2 mới gặp). Châu "tui", gọi "ông/bà", với Player dùng `{g:ông|bà}`, với cả nhóm "mấy người". Hạ tự xưng "Hạ", gọi tên, **chưa gọi tên Player trước khi Đức giới thiệu (P2-6)**. Quân "tớ–cậu". Player theo người đối diện.

---

## D. PROMPT — dán nguyên khối này cho Gemini Flash 3.8

```
Bạn là người viết thoại cho game 3D "Hành Trình Thanh Xuân" (học sinh cấp 2 Việt Nam, lớp 7, năm 2015, miền Nam, tông ấm, tình bạn). Nói tiếng Việt, đơn giản.

VIỆC: viết bản thoại HOÀN CHỈNH cho TRANG 2 (mưa, thuyền giấy) từ outline có sẵn.

BƯỚC 1 — ĐỌC (chỉ những file này, theo thứ tự):
1. docs/handoff/gemini/R-A2_TRANG2_THOAI_PROPOSED.md  (outline chính — toàn bộ)
2. docs/handoff/gemini/PROMPT_R-A2_TRANG2_HOAN_THIEN.md  (mục C, E, F)
3. docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md  (phần "TRANG 2" và "E. Xưng hô")
4. src/content/days/d_g07_01.ts  (chỉ đọc, để lấy mã)
5. docs/handoff/gemini/GEMINI_RULES.md  (mục 3 và 4)
Đọc xong, trả lời tôi đúng 5 dòng: bạn hiểu việc là gì, đầu ra ở đâu, 3 điều không được đổi. Rồi làm tiếp, không chờ.

BƯỚC 2 — VIẾT: tạo DUY NHẤT file docs/handoff/gemini/R-A2_TRANG2_THOAI_v1.md theo mẫu ở mục F. Với từng phân cảnh P2-1…P2-6:
- Giữ khung, thứ tự, chỉ đạo và quyết định trong outline. Mục C là đã chốt: không đổi, không hỏi lại.
- Được làm: chuốt lời cho tự nhiên, đúng giọng từng người; chỉnh câu dẫn, lời nhắc màn hình; thêm hoặc bớt 1–2 câu ngắn nếu cần cho mạch; chi tiết hóa chỉ đạo (ai đứng đâu, đi đâu, quay mặt về đâu).
- Thoại có sẵn trong kịch bản: giữ nguyên chữ, trừ khi sửa để đúng xưng hô. Câu nào bạn đổi hoặc viết mới thì cuối ô ghi [MỚI] hoặc [SỬA: lý do ≤ 8 từ].
- Không viết cốt truyện, nhân vật, sự kiện mới.

LUẬT VIẾT (bắt buộc):
1. Mỗi ô thoại tối đa 2 dòng (~90 ký tự).
2. Không quá 3 ô thoại liền mà không có một dòng ▶ (nhịp hành động: NPC đi/chạy, đổi dáng, máy quay đổi, đạo cụ đổi).
3. Động tác chỉ dùng: đứng, đi, chạy, nói, tạo dáng chữ V, vẫy tay, tạo dáng "tada", reo mừng. Cần động tác khác → ghi [CẦN ENGINE] + nói rõ + cách tạm.
4. Thoại sau minigame (P2-5) phát SAU khi chơi: viết như phản ứng, dùng chung cho thắng/thua/Bỏ qua, không nhắc hạng của người chơi, không đọc lại luật. Lời trước khi chơi để ở bước dẫn riêng.
5. Mỗi chỗ nối: 1 hành động nhìn thấy được, tối đa 1 câu dẫn ≤ 12 từ (hoặc không có), 1 dòng gợi ý góc màn hình ≤ 8 từ.
6. Thẻ luật minigame ≤ 3 dòng.
7. Không có gì sau 2016: không điện thoại, app, mạng xã hội, từ lóng mới. Nghi ngờ → [KIỂM NĂM].
8. Tên người chơi luôn là {player_name}. Vai: NPC_A Đức, NPC_B Châu, NPC_C Hạ, NPC_D Quân, player, narrator. Giới tính dùng {g:ông|bà}.
9. Từ đệm miền Nam vừa phải: nè, nha, nghen, hông, lẹ, vầy.

KHI KHÔNG CHẮC: đừng đoán. Ghi [HỎI CHỦ DỰ ÁN] + 2–3 phương án A/B/C, chọn sẵn phương án bạn nghiêng về, viết tiếp theo phương án đó. Gom hết câu hỏi vào cuối file, tối đa 5 câu. Hỏi bằng chuyện trong game, không dùng tên file hay tên biến.

KHÔNG ĐƯỢC: sửa file .ts hoặc code; sửa tài liệu gốc trong docs/gdd/; sửa outline R-A2_TRANG2_THOAI_PROPOSED.md; đổi mã; ghi "đã duyệt"; push --force; gộp vào main.

BƯỚC 3 — TỰ KIỂM trước khi nộp (điền bảng "Tự kiểm" ở cuối file, ghi Đạt/Không cho từng dòng, kèm số liệu thật):
- Đếm ô thoại > 2 dòng; đếm chỗ có > 3 ô liền không có ▶.
- Từng phân cảnh đủ 7 mục của mẫu.
- 3 phương án điều ước còn nguyên chữ và mã.
- Không có "chuông", không có "sau giờ học".
- Hạ không gọi tên người chơi trước P2-6.

BƯỚC 4 — NỘP: commit một lần, tin nhắn: "docs: R-A2 viết hoàn thiện thoại Trang 2 (PROPOSED, chờ duyệt)". Push nhánh content/R-A2-trang2-hoan-thien. Rồi báo tôi 5 dòng: file ở đâu, đã đổi gì so với outline (ý chính), số câu [MỚI]/[SỬA], số [HỎI], số [CẦN ENGINE].
```

---

## E. Bộ nối cảnh (chuẩn, dùng đúng tên)

| Kiểu | Khi nào | Chuẩn |
|---|---|---|
| **DẪN** | Đi từ chỗ này sang chỗ khác cùng NPC | NPC đi trước, chờ khi Player tụt xa; gợi ý "Đi theo {tên}"; Player luôn tự điều khiển; tối đa 1 câu lúc đi, 1 câu khi tới |
| **QUA-KHU** | Sang khu khác qua cổng | Mờ nhẹ + tên khu hiện ngắn; NPC hiện cạnh Player |
| **THẺ** | Mở Trang, nhảy thời gian, đổi thời tiết | Mờ tối → thẻ chữ 1–2 dòng (~2,5 s, bấm để qua) → mờ sáng. Đặt lại NPC/đổi thời tiết lúc tối. Không thoại |
| **ĐẨY-MÁY** | Trước bảng chọn, minigame, cảnh tay | Máy quay tiến vào hoạt động ~1 s, lùi ra ~0,8 s |
| **VÀO-CHỖ** | Tới nơi, sắp bắt đầu | Player tự bước ≤ 2 m vào chỗ, quay mặt, rồi mới hiện bảng |
| **CHỤP** | Mọi lần chụp | Máy ảnh thấy được trên tay → giơ máy → khung ngắm → flash + tiếng → hạ máy |

Điểm đặt có sẵn: `spawn.thcs.yard`, `spot.thcs.eave_1…5` (dọc hiên), `itr.thcs.gutter` (rãnh nước), `cam.thcs.gutter`, `spot.thcs.corridor_door`. Cần chỗ khác → ghi [CẦN ENGINE], không tự đặt mã.

---

## F. Mẫu đầu ra `R-A2_TRANG2_THOAI_v1.md`

Đầu file: bảng gồm Phiên bản `v1.0 · DRAFT · <ngày>` · Người viết `Gemini Flash 3.8 (Antigravity)` · Nguồn `outline v0.2` · Trạng thái `PROPOSED — chờ "duyệt Trang 2"`.

Mỗi phân cảnh **một bảng** 2 cột `Mục | Nội dung`, đủ 7 mục, theo đúng thứ tự:

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P2-x (mã bước thật, ví dụ `q_m1_main_02.s03`) · kiểu nối |
| Ai ở đâu lúc vào | … |
| Ai đi đâu (chỉ đạo) | … |
| Câu dẫn vào | **Tên**: "…" (hoặc "không") |
| ▶ | nhịp hành động |
| Thoại 1 | **Tên** — "…" — *động tác* [MỚI]/[SỬA: …] nếu có |
| … | … |
| Câu dẫn ra | … |
| Dòng gợi ý góc màn hình | ≤ 8 từ |

Cuối file, theo thứ tự: **[HỎI CHỦ DỰ ÁN]** (bảng #, câu hỏi, A/B/C, phương án đang dùng) → **[CẦN ENGINE]** (bảng #, cần gì, ở đâu, cách tạm; giữ E1–E9 của outline nếu còn đúng) → **Tự kiểm** (bảng ở Bước 3) → **So với outline** (≤ 6 gạch đầu dòng).

---

## G. Sau khi Gemini nộp

1. Claude Code kiểm file (đủ mục, luật viết, xưng hô, mã) và báo lại.
2. Chủ dự án đọc, nói **"duyệt Trang 2"** hoặc ghi chỗ sửa.
3. Chỉ sau khi duyệt **và** cơ chế R-B1…B3 đã gộp: Claude Code đổ chữ vào `d_g07_01.ts` (việc R-D2).
