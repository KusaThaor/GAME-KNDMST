# KHUNG THOẠI + NHỊP DẪN CẢNH — TRANG 4 · ĐỦ NĂM ĐỨA (R-A4)

| | |
|---|---|
| Phiên bản | v0.2 · **DRAFT** · 25/11/2026 |
| Trạng thái | **Khung (outline) = CONFIRMED 25/11/2026**: chủ dự án duyệt cách dựng 8 phân cảnh và chọn **A** cho cả 4 câu hỏi. **Chữ thoại trong file chỉ là bản nháp khung**, sẽ được viết hoàn thiện ở `THOAI_TRANG4_v1.0.md` (Antigravity). Chữ hoàn thiện = **PROPOSED** cho tới khi chủ dự án nói "duyệt Trang 4" |
| Việc | R-A4 trong `GIAO_VIEC_MOC1_PHAN_CANH_v0.1.md` (v0.2), Phần 3 — 8 phân cảnh P4-1…P4-8 |
| Nguồn đã đọc | Dữ liệu Trang 4 `src/content/days/d_g07_03.ts` (nhánh `feat/sprint-0412` @ `295604f`) · luật `mg_lineup` · marker `src/world/maps/map_thcs.extras.ts` + `map_thcs.index.json` · kịch bản `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` TRANG 4 + Phụ lục E · `01_NARRATIVE_AND_SCENES.md` §2.3 |
| Giới hạn | Chưa chạy game. Độ dài ô thoại tính theo ~90 ký tự = 2 dòng, chưa đo trên khung thoại thật. Vị trí đứng đầu Trang là đề xuất, dev chỉnh nếu xa quá |

**Giữ nguyên (không đụng):** mã bước `q_m1_main_05.s01…s08` · lựa chọn `c_m1_05_tone` với 3 phương án `playful` / `gentle` / `deep` (chữ phương án giữ nguyên) · flag `m1.group_photo_style` = `playful` | `gentle` | `deep` · trò `mg_lineup` (không có thua; luật giữ nguyên) · ảnh 1 `alb.d.g07.03.01` (camera `cam.d0703.group`) · ảnh cầu vồng `alb.d.g07.03.cover` = **bìa Album** · thời tiết `rain_shower` ở s06, `after_rain_rainbow` ở s07.

**Xưng hô Trang 4 (Phụ lục E, cuối lớp 7):**
- Đức: "tao – mày" với cả nhóm; gọi chung "tụi mày", "tụi mình".
- Châu: "tui"; gọi Đức, Quân là "ông", Hạ là "bà"; gọi chung "mấy người". Không gọi người chơi bằng ông/bà (tránh phân giới).
- Hạ: tự xưng "Hạ", gọi bằng tên, gọi chung "mọi người"; câu nào bỏ được chủ ngữ thì bỏ.
- Quân: "tớ – cậu", gọi chung "tụi mình"; giữ "cậu – tớ" cả khi Đức gọi "mày".
- Người chơi: với Đức "tao – mày", với Châu "tui – bà", với Quân "tớ – cậu", với Hạ "tớ" + gọi "Hạ"; nói với cả nhóm "tụi mình", "mọi người".

**Động tác chỉ dùng bộ có sẵn:** đứng, đi, chạy, nói, chữ V, vẫy tay, "tada", reo mừng.

**Cách đọc:** mỗi phân cảnh có bảng chỉ đạo rồi bảng thoại (# · Người nói · Chữ · Động tác). ▸ = nhịp hành động. *(giữ)* = câu lấy từ kịch bản / dữ liệu cũ.

---

## P4-1 · Gom cả nhóm (s01) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-1 · `q_m1_main_05.s01` (talk, NPC_A) · vào: **THẺ** nhẹ · ra: **DẪN** |
| Ai ở đâu lúc vào | Người chơi `spawn.thcs.yard`. Đức `spot.thcs.yard_group_1`, đứng cầm máy ảnh của người chơi (mượn coi ảnh cũ — kịch bản bước 1 "cả nhóm xem lại ảnh cũ"). Ba bạn đứng rải (đề xuất): Châu `spot.thcs.corridor_door`, Quân gần `itr.thcs.shuttle_ring`, Hạ `spot.thcs.yard_bench_2`. **Không** đứng sẵn thành hàng |
| Ai đi đâu | Sau câu gọi của Đức, Châu → Quân → Hạ **đi** về chỗ Đức (Châu tới trước). Đức đưa máy cho người chơi. Hạ **đi trước** dẫn cả nhóm ra chỗ chụp dưới gốc phượng |
| Thẻ | "Cuối năm lớp 7." / "Phượng vừa chớm đỏ." |
| Câu dẫn vào | (không — thẻ thay câu dẫn) |
| Câu dẫn ra | Hạ: "Ra gốc phượng nha. Chỗ đó nắng đẹp nhất." (9 từ) |
| Gợi ý góc màn hình | Vào: **Tới gặp Đức giữa sân** · Ra: **Đi theo Hạ ra gốc phượng** |

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| ▸ | — | Người chơi tới Đức, bấm [E] | Đức đứng |
| 1 | Đức | Ê {player_name}! Tao coi hết ảnh trong máy mày rồi. | nói |
| 2 | Đức | Cả đống ảnh mà chưa tấm nào đủ năm đứa cho đàng hoàng! *(giữ ý)* | nói |
| ▸ | — | Đức quay ra sân; ba bạn bắt đầu đi về phía Đức | vẫy tay |
| 3 | Đức | Châu! Quân! Hạ! Lại đây lẹ! | vẫy tay |
| 4 | Châu | Gì mà la muốn sập sân vậy ông? | nói (vừa tới) |
| 5 | Đức | Chụp ảnh! Cuối năm rồi, phải đủ năm đứa! *(giữ ý)* | "tada" |
| ▸ | — | Quân, Hạ tới nơi, đứng thành vòng | đi → đứng |
| 6 | Quân | …Chụp liền cũng được. Tớ rảnh. | nói |
| ▸ | — | Đức đưa máy cho người chơi (máy sang tay người chơi, R-B3) | đứng |
| 7 | Đức | Trả máy nè. Thợ chụp chính của nhóm đó. | nói |
| 8 | Hạ | Ra gốc phượng nha. Chỗ đó nắng đẹp nhất. *(giữ ý)* | nói → đi trước |

---

## P4-2 · Chọn kiểu ảnh (s02) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-2 · `q_m1_main_05.s02` (choice `c_m1_05_tone`, có đo) · **ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Cả năm người ở chỗ chụp dưới gốc phượng, đứng vòng tròn |
| Ai đi đâu | Máy quay tiến vào nhóm ~1 s. Đức bước lên giữa một bước. Chọn xong máy quay lùi ra. Quân **đi** tới ghế đặt máy (`itr.thcs.tripod_spot`), đứng cạnh |
| Câu dẫn vào | (không) |
| Câu dẫn ra | Quân: "Ghế đá này chắc nè. Để máy lên đây." *(giữ)* (8 từ) |
| Gợi ý góc màn hình | **Chọn kiểu ảnh** |

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| ▸ | — | Máy quay đẩy vào; Đức bước lên giữa | Đức đi 1 bước |
| 1 | Đức | Tấm này phải ngầu nha. Tao đứng giữa! *(giữ)* | chữ V |
| 2 | Châu | Sao lúc nào ông cũng đòi đứng giữa? *(giữ)* | nói |
| 3 | Đức | Tao là nhân vật chính mà! *(giữ)* | "tada" |
| ▸ | — | Châu quay mặt đi; Hạ quay sang người chơi | đứng, quay mặt |
| 4 | Châu | Nhân vật chính tự phong. *(giữ)* | nói |
| 5 | Hạ | {player_name} chọn đi. Chụp kiểu gì đây? | nói |
| ▸ | — | **Bảng chọn** `c_m1_05_tone` — giữ nguyên chữ 3 phương án | — |

| id | Tông | Chữ phương án (KHÔNG đổi) |
|---|---|---|
| `playful` | Rộn ràng | Tạo dáng nhí nhố làm mặt hề |
| `gentle` | Ấm áp | Đứng tự nhiên, khoác vai cười tươi |
| `deep` | Sâu lắng | Nghiêm trang chỉnh tề như ảnh thẻ |

| # | Người nói | Chữ (chung cả 3, sau khi chọn) | Động tác |
|---|---|---|---|
| ▸ | — | Máy quay lùi ra; Quân đi tới ghế | Quân đi |
| 6 | Quân | Ghế đá này chắc nè. Để máy lên đây. *(giữ)* | nói |

> Quyết định 4: chọn xong **không** đổi dáng, không đổi chỗ. Khác biệt chỉ ở lời phản ứng P4-5.

---

## P4-3 · Đặt máy lên ghế đá (s03) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-3 · `q_m1_main_05.s03` (interact `itr.thcs.tripod_spot`) · **VÀO-CHỖ + CHỤP** (pha ngắm) |
| Ai ở đâu lúc vào | Ghế **trống**. Quân cạnh ghế. Đức, Châu, Hạ ở chỗ chụp. Máy trên tay người chơi |
| Ai đi đâu | Người chơi tới ghế, bấm [E] Đặt máy ảnh → máy chuyển từ tay xuống ghế (R-B3). Khung ngắm hiện nhanh. Quân đi về nhóm |
| Câu dẫn vào | (đã ở cuối P4-2) |
| Câu dẫn ra | Châu: "Đứng đâu thì để {player_name} xếp." (6 từ) |
| Gợi ý góc màn hình | **Đặt máy lên ghế đá** |

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| ▸ | — | Bấm [E]; máy nằm trên ghế; khung ngắm hiện; Quân quay về nhóm | Quân đi |
| 1 | Hạ | {player_name} bấm xong chạy vô liền nha… *(giữ)* | vẫy tay |
| 2 | Châu | Đứng đâu thì để {player_name} xếp. | nói |
| 3 | Đức | Nhớ chừa chỗ giữa cho tao nha! | chữ V |
| ▸ | — | ĐẨY-MÁY vào khung ngắm → mở `mg_lineup` | — |

---

## P4-4 · Xếp đội hình (s04, `mg_lineup`) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-4 · `q_m1_main_05.s04` · **ĐẨY-MÁY + DẪN** |
| Ai ở đâu lúc vào | Bốn bạn đứng lộn xộn ở chỗ chụp; người chơi cạnh ghế |
| Ai đi đâu | Chơi xong (xong / Bỏ qua đều vậy): **bốn** bạn **đi** về đúng chỗ đã xếp (quyết định 3, R-B4 d), quay mặt về máy. Vòng sáng hiện ở chỗ của người chơi. Bỏ qua → chỗ mặc định |
| Câu dẫn vào | (không — câu dẫn ở P4-3) |
| Câu dẫn ra | Chính câu phản ứng dưới (9 từ) |
| Gợi ý góc màn hình | **Xếp chỗ đứng cho năm đứa** |

| # | Người nói | Chữ (phát SAU trò, một câu chung mọi cách xếp) | Động tác |
|---|---|---|---|
| ▸ | — | Bốn bạn đi vào chỗ, quay mặt về máy | đi → đứng |
| 1 | Đức | Đứng đâu cũng được. Miễn có đủ năm đứa! | reo mừng |

> Câu không nói ai đứng giữa/hàng sau → đúng với mọi cách xếp và cả khi Bỏ qua. (Phiếu giao việc ghi "3 NPC"; nhóm có 4 bạn, khung viết theo 4.)

---

## P4-5 · Hẹn giờ chụp (s05) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-5 · `q_m1_main_05.s05` (photo timer, `cam.d0703.group`, `alb.d.g07.03.01`) · **CHỤP** |
| Ai ở đâu lúc vào | Bốn bạn giữ đúng chỗ P4-4. Người chơi cạnh ghế; máy trên ghế |
| Ai đi đâu | Bấm hẹn giờ → người chơi **chạy** vào vòng sáng. Đếm 10 giây → flash + tiếng → xem ảnh → "Giữ ảnh này" |
| Câu dẫn vào | Đức: "Mười giây! Chạy lẹ, {player_name}!" *(giữ)* (5 từ) — khi bắt đầu đếm |
| Câu dẫn ra | (không — mưa đổ ngay, P4-6) |
| Gợi ý góc màn hình | **Hẹn giờ rồi chạy vào vòng sáng** |
| Lời nhắc màn hình ảnh 1 | "Bấm hẹn giờ, chạy vào vòng sáng." · "Space: tạo dáng." |

**Lời chung:**

| # | Lúc | Người nói | Chữ | Động tác |
|---|---|---|---|---|
| ▸ | bấm hẹn giờ | — | Người chơi chạy về đội hình | chạy |
| 1 | đếm | Đức | Mười giây! Chạy lẹ, {player_name}! *(giữ)* | vẫy tay |

**Ba bộ lời theo `m1.group_photo_style` (chỉ khác ở đây):**

`playful` — nhí nhố

| # | Lúc | Người nói | Chữ | Động tác |
|---|---|---|---|---|
| 2 | đếm | Đức | Mặt hề nha tụi mày! Ba… hai… | chữ V |
| ▸ | flash | — | Chụp xong, ảnh hiện ra | — |
| 3 | sau chụp | Đức | Khoan! Tao chưa làm mặt hề xong! *(giữ ý)* | nói |
| 4 | sau chụp | Châu | Trễ rồi, chụp rồi. *(giữ)* | nói |

`gentle` — tự nhiên, khoác vai

| # | Lúc | Người nói | Chữ | Động tác |
|---|---|---|---|---|
| 2 | đếm | Hạ | Cười tự nhiên nha. Đừng nhìn máy chằm chằm. | nói |
| ▸ | flash | — | Chụp xong, ảnh hiện ra | — |
| 3 | sau chụp | Châu | Kêu khoác vai mà đứng cách nhau cả gang tay. | nói |
| 4 | sau chụp | Đức | Mà nhìn tụi mình cười thiệt ha. | reo mừng |

`deep` — nghiêm trang như ảnh thẻ

| # | Lúc | Người nói | Chữ | Động tác |
|---|---|---|---|---|
| 2 | đếm | Châu | Đứng thẳng. Nhìn máy. Không ai được cười. | nói |
| ▸ | flash | — | Chụp xong, ảnh hiện ra | — |
| 3 | sau chụp | Đức | Nhìn như ảnh thẻ dán hồ sơ luôn… | nói |
| 4 | sau chụp | Quân | …Tớ thấy đẹp mà. | nói |

> "Mặt hề" và "khoác vai" không hiện thành dáng trong ảnh (quyết định 4). Lời phản ứng cố ý đùa đúng chỗ đó để người chơi không thấy hụt. Câu cũ "Khoan— Quân, ông đứng sát vô!" / "Tớ đứng rồi mà…" bỏ ra vì giả định vị trí Quân.

---

## P4-6 · Mưa rào, chạy về Căn cứ (s06) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-6 · `q_m1_main_05.s06` (cutscene, thời tiết `rain_shower`) · **DẪN (chạy) + QUA-KHU** |
| Ai ở đâu lúc vào | Cả nhóm còn ở đội hình; máy trên ghế |
| Ai đi đâu | Mưa đổ ngay. **Đức** chạy tới ghế cầm máy (máy lên tay Đức, R-B3), **chạy dẫn** về Căn cứ (`zone.thcs.base`); ba bạn chạy theo. QUA-KHU. Tới mái che Căn cứ, Đức trả máy cho người chơi |
| Câu dẫn vào | Đức: "Mưa! Tao cầm máy rồi, chạy!" (6 từ) |
| Câu khi tới | Hạ: "Vô đây, chỗ này còn khô." *(giữ)* (6 từ) |
| Gợi ý góc màn hình | **Chạy theo Đức về Căn cứ** |

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| ▸ | — | Mưa đổ. Đức chạy tới ghế, máy lên tay Đức | Đức chạy |
| 1 | Đức | Mưa! Tao cầm máy rồi, chạy! | chạy |
| 2 | Hạ | Về Căn cứ! Lẹ lên! | chạy |
| ▸ | — | Cả nhóm chạy qua cổng khu, vào dưới mái che Căn cứ | chạy → đứng |
| 3 | Hạ | Vô đây, chỗ này còn khô. *(giữ)* | vẫy tay |
| 4 | Đức | Máy khô re nè. Tao ôm trong áo. | nói |
| ▸ | — | Đức đưa máy lại cho người chơi | đứng |
| 5 | Đức | Mà vẫn thấy thiếu một tấm thật ngầu… *(giữ)* | nói |
| 6 | Châu | Tấm hồi nãy đẹp rồi còn gì. *(giữ)* | nói |
| ▸ | — | Mưa nhỏ dần rồi tạnh | — |

> Đã chốt [HỎI 1] = A: Đức giữ máy. Câu cũ của Quân "Tớ ôm rồi. Yên tâm." và câu Đức "Máy ảnh của {player_name} đâu? Đừng để ướt!" **bỏ**.

---

## P4-7 · Ảnh cầu vồng (s07) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-7 · `q_m1_main_05.s07` (photo timer, `alb.d.g07.03.cover` = bìa Album, thời tiết `after_rain_rainbow`) · **CHỤP** |
| Ai ở đâu lúc vào | Cả nhóm dưới mái che Căn cứ; máy trên tay người chơi; trời tạnh, cầu vồng hiện |
| Ai đi đâu | Hạ **đi** ra trước nhìn trời. Cả nhóm ra **khúc gỗ bãi đất** (`spot.thcs.field_log`, đã chốt [HỎI 3] = A). Người chơi đặt máy lên khúc gỗ ([E]); bốn bạn đứng cạnh nhau (giữ thứ tự P4-4 nếu dễ, không thì hàng ngang). Hẹn giờ → người chơi **đi** (không cần chạy) vào vòng sáng → flash |
| Câu dẫn vào | {player_name}: "Chụp thêm một tấm với cầu vồng nha!" *(giữ)* (8 từ) |
| Câu dẫn ra | (không — THẺ ở P4-8) |
| Gợi ý góc màn hình | **Chụp ảnh với cầu vồng** |
| Lời nhắc màn hình ảnh 2 (KHÁC ảnh 1) | "Cầu vồng còn đó. Bấm hẹn giờ." · "Lần này khỏi tạo dáng." |

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| ▸ | — | Hạ đi ra khỏi mái che, quay nhìn lên trời | Hạ đi |
| 1 | Hạ | Mọi người nhìn kìa… Cầu vồng! *(giữ ý)* | vẫy tay |
| 2 | Đức | Ông trời thưởng vì tụi mình chụp đủ năm đứa đó! *(giữ)* | reo mừng |
| 3 | Châu | Hiện tượng tự nhiên thôi. *(giữ)* | nói |
| ▸ | — | Đức, Châu, Quân đi ra đứng cạnh Hạ | đi |
| 4 | {player_name} | Chụp thêm một tấm với cầu vồng nha! *(giữ)* | nói |
| 5 | Hạ | Lần này khỏi tạo dáng. Đứng cạnh nhau là được. *(giữ)* | nói |
| ▸ | — | Ra khúc gỗ, đặt máy, hẹn giờ, người chơi đi vào vòng sáng; đếm **yên lặng** | đi → đứng |
| ▸ | flash | Chụp xong, ảnh hiện ra | — |
| 6 | Quân | …Đẹp thiệt. | nói |
| 7 | Đức | Tấm này phải in ra to nhất! | chữ V |

> "Nhẹ, bất ngờ" nằm ở: lời nhắc không giục chạy, lúc đếm không ai la, câu đầu sau ảnh là của Quân (người ít nói nhất). Câu cuối của Đức dẫn sang việc in ảnh ở P4-8.

---

## P4-8 · Mấy hôm sau, dán ảnh (s08) — PROPOSED

| Mục | Nội dung |
|---|---|
| Mã | P4-8 · `q_m1_main_05.s08` (cutscene) · vào: **THẺ** · giữa: **VÀO-CHỖ** |
| Ai ở đâu lúc vào | (Đặt trong lúc tối) Cả nhóm trong Căn cứ, trời nắng thường. Đức cạnh tường có ảnh bộ ba + ảnh thuyền; Châu `spot.thcs.base_table`; Hạ cạnh `itr.thcs.base_shelf`; Quân gần lối vào. Người chơi `spawn.thcs.base`, ảnh in trên tay |
| Ai đi đâu | Người chơi tới tường, bấm [E] Dán ảnh → ảnh cầu vồng hiện trên tường cạnh hai ảnh cũ. Quân **đi** tới đứng cạnh tường |
| Thẻ | "Mấy hôm sau." / "Ảnh vừa in xong." |
| Câu dẫn vào | (không — thẻ thay câu dẫn) |
| Câu dẫn ra | (không — hết Trang) |
| Gợi ý góc màn hình | **Dán ảnh lên tường Căn cứ** |

| # | Người nói | Chữ | Động tác |
|---|---|---|---|
| ▸ | — | Bấm [E]; ảnh dán lên tường | — |
| 1 | Đức | Nhìn nè! Từ ba đứa thành năm đứa rồi! *(giữ — điểm neo)* | reo mừng |
| 2 | Châu | Ừ. Cũng không ngờ chơi với nhau lâu vậy. *(giữ)* | nói |
| ▸ | — | Quân đi tới tường, đứng cạnh người chơi | Quân đi |
| 3 | Quân | Góc ảnh bung kìa. Để tớ dán lại. | nói |
| 4 | {player_name} | Mai mốt chụp nữa nha. Đừng để thiếu ai. *(giữ)* | nói |
| 5 | Đức | Đứa nào vắng là phải chụp bù! *(giữ — điểm neo)* | chữ V |
| ▸ | — | **Hết Trang** | — |

> Đã chốt [HỎI 4] = A: giữ câu của Quân, Quân chỉ đứng cạnh (không thấy tay dán). Ý lấy từ kịch bản "Quân lặng lẽ xé thêm miếng băng keo, dán lại góc ảnh".

---

## [HỎI CHỦ DỰ ÁN] — ĐÃ CHỐT 25/11/2026: cả 4 câu chọn **A**

| # | Câu hỏi | Đã chốt |
|---|---|---|
| 1 | Ai giữ máy lúc chạy mưa? | **A:** Đức chộp máy ở ghế, chạy dẫn đầu. Bỏ câu "Tớ ôm rồi" của Quân |
| 2 | Vì sao Đức đưa máy cho người chơi ở P4-1? | **A:** Đức mượn máy coi ảnh cũ, thấy chưa có tấm đủ năm đứa nên rủ chụp |
| 3 | Ảnh cầu vồng đặt máy ở đâu? | **A:** khúc gỗ bãi đất `spot.thcs.field_log` |
| 4 | Câu "Góc ảnh bung kìa. Để tớ dán lại." của Quân | **A:** giữ câu, Quân chỉ đứng cạnh |

## [CẦN ENGINE]

| # | Ở đâu | Cần gì | Dự phòng | Gợi ý giao |
|---|---|---|---|---|
| E1 | P4-5 | Thoại chen **trong lúc đếm ngược** (bong bóng chữ, không dừng đếm), lọc theo `m1.group_photo_style` | Phát ô "đếm" ngay trước khi bấm hẹn giờ; còn lại sau ảnh | R-B3 |
| E2 | P4-5 | Thoại sau ảnh lọc theo giá trị chuỗi của flag | Một bộ chung (ô 3–4 của `gentle`) | R-D4 kiểm điều kiện dòng thoại |
| E3 | P4-6 | Mưa đổ giữa Trang không cần mờ tối; mưa tạnh dần trước P4-7 | Mờ tối ngắn không chữ để đổi thời tiết | R-B2 |
| E4 | P4-7 | Ảnh 2: ẩn nút / bỏ dấu kiểm "Tạo dáng"; lời nhắc riêng (trường `prompt`) | Giữ nút, chỉ đổi chữ nhắc | R-B3 mục 4 |
| E6 | P4-1, P4-6 | Trao máy NPC ↔ người chơi; Đức cầm máy khi chạy; Đức trả máy ở Căn cứ | — | Đã nằm trong R-B3 mục 3 |
| E7 | P4-7, P4-8 | Marker còn thiếu: chỗ đặt máy trên khúc gỗ cho ảnh 2 + chỗ đứng nhóm trước khúc gỗ; chỗ tường dán ảnh trong Căn cứ | Ảnh 2: thử dùng lại `cam.thcs.m2_campfire_group` (máy trên khúc gỗ, Trang 8). Tường: `itr.thcs.old_table` / `base_shelf` | N-04 |

(E5 bỏ: chỉ cần khi [HỎI 4] chọn C.)

## Ghi chú cho dev (R-D4) — không phải việc của người viết

- **Chỗ chụp ảnh 1 lệch gốc phượng thật:** dữ liệu đặt ghế máy `itr.thcs.tripod_spot` (4; 8,4) và chỗ đứng `spot.thcs.yard_group` (4; 2) ở giữa sân, nhưng gốc phượng `spot.thcs.phuong_root` ở (−10,2; −5) và ghế đá thật `itr.thcs.stone_bench` ở (−14,4; −2,2). Thoại nói "gốc phượng", "ghế đá". Cần chọn: giữ chỗ cũ (chấp nhận lệch) hay dời ảnh 1 về gốc phượng (cần camera mới, N-04). Chưa hỏi chủ dự án.
- **Ảnh cầu vồng ở khúc gỗ** sẽ trùng bố cục ảnh lửa trại Trang 8 (cùng khúc gỗ). Camera `cam.d0703.rainbow` hiện trỏ `cam.thcs.rainbow` ở sân → phải đổi.
- Chia bước: lời trước bảng chọn (P4-2 ô 1–5), lời sau trò (P4-4), lời trước ảnh 2 (P4-7 ô 1–5) có thể cần thêm bước cảnh. Không đổi mã cũ; mã mới do R-D4 đặt.

## [KIỂM NĂM]

- "In ảnh" từ máy số năm 2016: kịch bản v1.4 đã ghi "máy ảnh số, phải in xong mới dán". Giữ.
- "ảnh thẻ dán hồ sơ": quen thuộc với học sinh thời đó. Giữ.

## Thay đổi so với thoại đang chạy (tóm tắt)

- Thêm: thẻ mở Trang, nhịp gom nhóm P4-1, trao máy, câu phản ứng sau xếp đội hình, 3 bộ lời theo kiểu ảnh, chạy mưa, lời nhắc ảnh 2, thẻ "Mấy hôm sau", câu Quân dán góc ảnh.
- Đưa lại từ kịch bản: "Sao lúc nào ông cũng đòi đứng giữa?", "Tao là nhân vật chính mà!", "Nhân vật chính tự phong.", "Ghế đá này chắc nè…", "…bấm xong chạy vô liền nha", "Mười giây! Chạy lẹ…", "Trễ rồi, chụp rồi.", "Vô đây, chỗ này còn khô.", "Vẫn thấy thiếu một tấm thật ngầu…", "Tấm hồi nãy đẹp rồi còn gì."
- Bỏ: "Máy ảnh của {player_name} đâu? Đừng để ướt!", "Tớ ôm rồi. Yên tâm.", "{player_name} coi pin máy chưa?", "Thì hôm nào chụp."

## Thay đổi
- v0.2 (25/11/2026): chủ dự án duyệt khung + chọn A cho 4 câu hỏi. Đối chiếu dữ liệu thật: ghi đúng mã lựa chọn `c_m1_05_tone` / `playful` · `gentle` · `deep`, mã bước, camera; xưng hô theo Phụ lục E (Hạ gọi chung "mọi người"); thêm ghi chú lệch chỗ chụp cho dev. File thành **khung** cho bản viết hoàn thiện.
- v0.1 (25/11/2026): bản đầu (`claude/THOAI_TRANG4_R-A4_v0.1.md` trong Project).
