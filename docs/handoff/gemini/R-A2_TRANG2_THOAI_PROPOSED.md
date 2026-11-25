# R-A2 · TRANG 2 — MƯA VÀ THUYỀN GIẤY · Thoại + nhịp dẫn cảnh

| | |
|---|---|
| Phiên bản | v0.2 · **DRAFT — OUTLINE CHÍNH** · 25/11/2026 |
| Trạng thái chữ | Chủ dự án 25/11: dùng file này làm **outline chính**; Antigravity viết hoàn thiện (xem `PROMPT_R-A2_TRANG2_HOAN_THIEN.md`). **Mọi chữ vẫn PROPOSED** cho tới khi chủ dự án nói "duyệt Trang 2" |
| Khuôn | `GIAO_VIEC_MOC1_PHAN_CANH_v0.1.md` Phần 3 (P2-1…P2-6) + Phần 4 (bộ nối) |
| Nguồn thoại gốc | `src/content/days/d_g07_01.ts` (chữ đang có trong game, nhánh `feat/sprint-0412` @ `295604f`) · `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` Trang 2 + Phụ lục E · `docs/gdd/01_NARRATIVE_AND_SCENES.md` §2.3 |
| Mã thật (đã đọc từ dữ liệu) | Quest `q_m1_main_02` · bước `q_m1_main_02.s01…s05` · lựa chọn `c_m1_02_wish` (phương án `friendship`/gentle · `fun`/playful · `secret`/deep) · flag `m1.wish` · minigame `mg_boat` · ảnh `frag.d.g07.01.01`, ghi chú `frag.d.g07.01.02`. Vai: `NPC_A` Đức · `NPC_B` Châu · `NPC_C` Hạ · `NPC_D` Quân |
| Ký hiệu | ▶ = nhịp hành động (NPC đi/chạy, đổi dáng, máy quay đổi, đạo cụ đổi). Giữa hai ▶ tối đa 3 ô thoại |

**Xưng hô dùng trong Trang 2 (lớp 7):** Đức nói với Player/Châu "tao – mày"; với Hạ, Quân (mới gặp) và khi nói chung cả nhóm "tớ – cậu". Châu "tui", gọi "ông/bà". Hạ tự xưng "Hạ", gọi tên. Quân "tớ – cậu". Player theo người đối diện.
**Lưu ý tên:** Hạ, Quân chưa biết tên Player cho tới lúc Đức giới thiệu ở P2-6 → trước đó Hạ không gọi tên Player.

---

## P2-1 · Mưa đổ, chạy vào hiên

| Mục | Nội dung (PROPOSED) |
|---|---|
| Mã phân cảnh | P2-1 (bước hiện có s01) · Nối vào: THẺ · ra: VÀO-CHỖ |
| Ai ở đâu lúc vào | Player ở sân (`spawn.thcs.yard`), trời mưa từ đầu Trang. Đức (`eave_1`), Châu (`eave_2`) đứng dưới hiên |
| Thẻ mở Trang | **Lớp 7. Một chiều mưa.** · dòng phụ: *Giờ ra chơi, mưa đổ ào xuống sân.* (đổi thời tiết sang mưa trong lúc tối; QĐ-1) |
| Ai đi đâu (chỉ đạo) | Hết thẻ: Đức, Châu **vẫy tay** gọi. Player **chạy** vào hiên, VÀO-CHỖ cạnh Đức, quay mặt về Đức |
| Câu dẫn vào | **Đức** (vẫy tay, khi Player còn ngoài sân): "Vô lẹ mày! Ướt như chuột lột bây giờ!" |
| ▶ | Player chạy vào, đứng cạnh Đức |
| Thoại 1 | **Đức** — "Nghỉ hè có hai tháng mà tao thấy như hai năm." — *nói* |
| Thoại 2 | **Châu** — "Tại ông không làm bài tập hè." — *nói* |
| Thoại 3 | **Đức** — "Ủa, chưa gì đã nghi tao rồi!" — *nói* |
| ▶ | Đức quay mặt về phía đầu hiên (`eave_5`) |
| Câu dẫn ra | **Đức**: "Ê, đầu hiên có ai gấp thuyền kìa. Đi coi!" |
| Gợi ý góc màn hình | Lúc vào: **Chạy vào hiên tránh mưa** · Lúc ra: **Đi theo Đức** |

---

## P2-2 · Gặp Hạ và Quân đang gấp thuyền

| Mục | Nội dung (PROPOSED) |
|---|---|
| Mã phân cảnh | P2-2 (s02) · Nối vào: DẪN |
| Ai ở đâu lúc vào | Hạ, Quân ở đầu kia hiên (`eave_5`): Hạ cầm một thuyền giấy, Quân cầm xấp giấy. *(Muốn hai bạn **ngồi** gấp → [CẦN ENGINE] E1; tạm thời đứng)* |
| Ai đi đâu (chỉ đạo) | Đức **đi trước** dọc hiên `eave_1 → eave_4`; Châu đi sau; Player tự theo. Tới nơi Đức dừng, quay về Hạ |
| Câu dẫn vào | (đã nói ở P2-1) · Khi tới nơi: không thêm câu |
| ▶ | Đức tới `eave_4`, Hạ quay lại nhìn nhóm |
| Thoại 1 | **Đức** — "Ê! Thuyền đẹp đó! Cậu gấp hả?" — *nói* |
| Thoại 2 | **Hạ** — "Ừm… mưa nhiều nên Hạ gấp thử." — *nói* |
| Thoại 3 | **Đức** — "Hay mình thi coi thuyền ai chạy xa nhất đi!" — *reo mừng* |
| ▶ | Châu bước lên đứng cạnh Đức |
| Thoại 4 | **Châu** — "Thi thì phải có luật. Thả rồi không được lấy tay đẩy." — *nói* |
| Thoại 5 | **Đức** — "Rồi rồi, Châu Tổng làm trọng tài." — *tạo dáng chữ V* |
| Thoại 6 | **Player** — "Hai cậu chơi chung hông?" — *nói* |
| ▶ | Hạ nhìn sang Quân; Quân đi một bước tới cạnh Player |
| Thoại 7 | **Hạ** — "Có… nếu mọi người không ngại." — *nói* |
| Thoại 8 | **Quân** — "Tớ giữ giấy cho. Gió thổi bay mất." — *nói* (câu mở lời đầu tiên của Quân với Player) |
| Câu dẫn ra | **Hạ**: "Giấy đây. Viết xong gấp buồm vô nha." *(trao giấy/bút → [CẦN ENGINE] E2)* |
| Gợi ý góc màn hình | Lúc đi: **Đi theo Đức** · Lúc ra: **Viết điều ước lên buồm** |

---

## P2-3 · Viết điều ước lên cánh buồm

| Mục | Nội dung (PROPOSED) |
|---|---|
| Mã phân cảnh | P2-3 (s03, bước lựa chọn) · Nối: ĐẨY-MÁY |
| Ai ở đâu lúc vào | Cả năm đứng ở `eave_4`–`eave_5`, Hạ cạnh Player |
| Ai đi đâu (chỉ đạo) | Máy quay đẩy vào đôi tay + cánh buồm trống (~1 s). NPC quay mặt về Player |
| Câu dẫn vào | (Hạ đã nói ở cuối P2-2) |
| ▶ | Máy quay đẩy vào cánh buồm trống |
| Thoại 1 | **Hạ** — "Viết một điều ước lên buồm đi. Thuyền chạy tới đâu, điều ước theo tới đó." — *nói* (giữ chữ gốc) |
| Lựa chọn | **Giữ nguyên chữ, tông và mã** (`c_m1_02_wish`, flag `m1.wish`): `friendship` · Ấm áp · "Mai mốt vẫn chơi chung vầy." · `fun` · Rộn ràng · "Lớp 7 vui hơn lớp 6." · `secret` · Sâu lắng · "Bí mật không nói ra." |
| ▶ | Chữ của lựa chọn hiện lên cánh buồm *([CẦN ENGINE] E5)*; máy quay lùi ra (~0,8 s) |
| Thoại 2 | **Đức** — "Tớ ước… thuyền tớ đừng lật!" — *tạo dáng "tada"* (câu gốc đã bị bỏ, đưa lại) |
| Thoại 3 | **Châu** — "Ước gì kỳ vậy." — *nói* (câu gốc đã bị bỏ, đưa lại) |
| Ghi chú | Hai câu phản ứng dùng chung cho cả 3 lựa chọn, không nhắc nội dung điều ước |
| Câu dẫn ra | **Hạ**: "Xếp năm chiếc ở mép rãnh trước đã." |
| Gợi ý góc màn hình | **Chọn điều ước viết lên buồm** |

---

## P2-4 · Chụp 5 thuyền trước khi thả (MỚI — quyết định 2)

| Mục | Nội dung (PROPOSED) |
|---|---|
| Mã phân cảnh | P2-4 (bước ảnh **mới**, đứng trước s04; mã bước do R-D2 đặt, không đổi mã cũ) · Nối: CHỤP · Ảnh này thay ảnh tự chụp ở s05 làm ảnh chính Album (`frag.d.g07.01.01`) |
| Ai ở đâu lúc vào | Cả nhóm đi ra mép rãnh (`itr.thcs.gutter`); 5 thuyền hiện xếp hàng ở mép rãnh khi NPC tới *(đặt thuyền xuống → [CẦN ENGINE] E4)* |
| Ai đi đâu (chỉ đạo) | Hạ, Quân đứng bên trái hàng thuyền; Đức, Châu bên phải (không cần vào khung). Player VÀO-CHỖ ở điểm đứng chụp cách rãnh ~2–3 m, nhìn về `cam.thcs.gutter` |
| Câu dẫn vào (lời rủ chụp) | **Hạ**: "Chụp lại năm chiếc trước khi thả được hông?" |
| Thoại 1 | **Đức** — "Có nè! Máy của mày đó, chụp lẹ đi!" — *vẫy tay* |
| ▶ | CHỤP: máy ảnh hiện trên tay Player, giơ lên → khung ngắm → flash + tiếng → hạ máy |
| Lời nhắc trên màn hình (khung ngắm) | **Bấm chụp khi đủ năm chiếc trong khung** |
| Thoại 2 (sau chụp) | **Đức** — "Tấm này làm bằng chứng thuyền tớ thắng nha!" — *tạo dáng chữ V* |
| Thoại 3 (sau chụp) | **Châu** — "Chưa thả mà ông đòi thắng rồi." — *nói* |
| Câu dẫn ra | (sang P2-5) |
| Gợi ý góc màn hình | **Chụp năm chiếc thuyền trước khi thả** |

---

## P2-5 · Thả thuyền (minigame đua thuyền)

| Mục | Nội dung (PROPOSED) |
|---|---|
| Mã phân cảnh | P2-5 (s04, minigame đua thuyền) · Nối vào: DẪN · giữa: VÀO-CHỖ + ĐẨY-MÁY |
| Ai ở đâu lúc vào | Như cuối P2-4: Player ở điểm chụp, 4 bạn quanh hàng thuyền |
| Ai đi đâu (chỉ đạo) | **Bước dẫn riêng đứng trước minigame:** Châu **đi** xuống cuối rãnh (làm trọng tài); Đức **chạy** tới mép rãnh. Player VÀO-CHỖ ở mép rãnh → máy quay đẩy vào mặt nước → bảng luật |
| Câu dẫn vào (thuộc bước dẫn, KHÔNG thuộc thoại minigame) | **Châu**: "Tui đứng cuối rãnh làm trọng tài. Thả đi!" |
| Thẻ luật (≤ 3 dòng) | 1. Chọn kiểu thuyền: buồm nhanh mà dễ lật, mui chậm mà chắc, đôi vừa vừa. · 2. Giữ chuột (hoặc Space), buông khi kim ở vùng xanh để thả. · 3. Kéo trái/phải (A/D) né rác và xoáy nước. Đụng rác 3 lần là lật. |
| *Thoại sau trò — dùng chung thắng / thua / Bỏ qua* | |
| ▶ | Máy quay lùi ra; Đức **chạy** dọc mép rãnh |
| Thoại 1 | **Đức** — "Sao lật rồi? Ai thấy không? Có người tác động dòng nước!" — *nói* |
| Thoại 2 | **Châu** — "Ông thả lệch. Tui thấy rõ." — *nói* |
| Thoại 3 | **Quân** — "Thuyền tớ… hình như xa nhất." — *nói* |
| ▶ | Đức quay sang Quân, **đi** hai bước tới |
| Thoại 4 | **Đức** — "Hư cấu! Thuyền cậu gắn động cơ hả?" — *nói* |
| Thoại 5 | **Châu** — "Thua thì nhận đi." — *nói* |
| Thoại 6 | **Đức** — "Ván sau tớ phục thù!" — *tạo dáng chữ V* |
| Ghi chú | Mọi câu chỉ nói về kết quả cố định (Đức lật, Quân xa nhất), không nhắc hạng của Player → hợp cả 3 trường hợp. Không đọc lại luật |
| Câu dẫn ra | ▶ Hạ quay nhìn cuối rãnh · **Hạ**: "Thuyền Hạ… mắc ở cuối rãnh rồi." |
| Gợi ý góc màn hình | Lúc dẫn: **Ra mép rãnh thả thuyền** · Lúc ra: **Vớt thuyền ở cuối rãnh** |

---

## P2-6 · Vớt thuyền, cả nhóm ký tên, trống vào lớp

| Mục | Nội dung (PROPOSED) |
|---|---|
| Mã phân cảnh | P2-6 (s05) · Nối: ĐẨY-MÁY → ra: DẪN |
| Ai ở đâu lúc vào | Thuyền của Hạ (chậm nhất) mắc ở cuối rãnh *(cần chỗ đặt — [CẦN ENGINE] E8)*. Mưa nhỏ lại *([CẦN ENGINE] E6)*. Cả nhóm rải dọc mép rãnh |
| Ai đi đâu (chỉ đạo) | Player tự đi tới cuối rãnh, bấm **[E] Vớt thuyền** → máy quay đẩy vào chiếc thuyền ướt trên tay Player *(cúi vớt → [CẦN ENGINE] E4; tạm: thuyền chuyển từ nước lên tay trong lúc máy đẩy vào)* |
| Câu dẫn vào | (Hạ đã nói ở cuối P2-5) |
| ▶ | Vớt thuyền; Đức **chạy** tới, Châu **đi** theo; máy quay lùi ra |
| Thoại 1 | **Đức** — "À mà chưa giới thiệu! Tớ là Đức, đây là {player_name}, còn đây là Châu Tổng khó tính." — *nói* |
| Thoại 2 | **Châu** — "Giới thiệu người ta thì bớt bình luận giùm." — *nói* |
| ▶ | Hạ **đi** lên một bước, Quân đứng sau |
| Thoại 3 | **Hạ** — "Hạ nè. Lớp bên." — *vẫy tay* |
| Thoại 4 | **Quân** — "Quân. Cũng lớp bên." — *nói* |
| ▶ | Hạ **đi** tới cạnh Player, đưa bút *([CẦN ENGINE] E2)*; máy quay đẩy vào cánh buồm |
| Thoại 5 | **Hạ** — "Thuyền của {player_name} trôi mất rồi. Ghi lại điều ước lên buồm này đi." — *nói* |
| ▶ | **Ký tên** trên buồm (cận cảnh): chữ điều ước đã chọn hiện ra, rồi chữ ký lần lượt: **{player_name}** (người viết, ký trước) → **Hạ** (chủ thuyền) → **Quân** → **Châu** → **Đức** (chen vô mép buồm, cuối cùng) *([CẦN ENGINE] E5)*. Máy quay lùi ra |
| Thoại 6 | **Player** — "Mai ra chơi mình chơi tiếp nha?" — *nói* |
| Thoại 7 | **Hạ** — "Ừ, mai Hạ mang thêm giấy." — *nói* |
| Thoại 8 | **Quân** — "Tớ mang giấy báo cũ. Gấp cứng hơn." — *nói* |
| ▶ | Tiếng **trống vào lớp** *(QĐ-1, QĐ-2; âm thanh → [CẦN ENGINE] E7)*; Châu quay người **đi** về phía cửa lớp |
| Thoại 9 | **Châu** — "Nhớ đúng giờ nha. Đừng để người khác chờ." — *nói, vừa đi* |
| Câu dẫn ra | Không thêm câu (câu cuối của Châu làm câu dẫn). Châu đi trước, cả nhóm theo vào lớp; Player đi theo → hết Trang (mờ ra như hiện có) |
| Gợi ý góc màn hình | Lúc vào: **Vớt thuyền ở cuối rãnh** · Lúc ra: **Đi theo Châu vào lớp** |
| So với bản cũ | Vẫn 9 ô thoại (giữ nguyên chữ gốc), nay xen 5 nhịp hành động; đổi chỗ câu Hạ "Thuyền của {player_name} trôi mất rồi…" ra **sau** phần giới thiệu tên (kịch bản gốc đặt trước), vì trước đó Hạ chưa biết tên Player — **chủ dự án đã chốt dời (QĐ-5, 25/11)**. Ý giữ nguyên: cả nhóm cùng ký lên một chiếc thuyền; thuyền vớt được là thuyền của Hạ (đúng kịch bản) |

---

## Ghi chú cho người đổ dữ liệu (R-D2)

- Ảnh chính trang Album Trang 2 = ảnh chụp ở P2-4 (bỏ ảnh tự chụp ở s05). Ghi chú ảnh `frag.d.g07.01.02` đổi thành: "Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xếp hàng chờ thả." (QĐ-4).
- Câu dẫn của P2-5 phải nằm ở **bước dẫn đứng trước** minigame, không nằm trong thoại của bước minigame (thoại đó phát sau khi chơi).
- Điểm đứng/marker dùng: `spawn.thcs.yard`, `eave_1…5`, `itr.thcs.gutter`, `cam.thcs.gutter`. Thiếu: điểm đứng chụp trước rãnh, chỗ "cuối rãnh" cho thuyền mắc lại, cửa lớp gần hiên (nếu `corridor_door` không phải chỗ đó) → ghi cho chủ nhánh bản đồ (N-04).

---

## Quyết định chủ dự án 25/11/2026 — CONFIRMED (trước là HỎI 1–4, thêm QĐ-5)

| # | Nội dung đã chốt | Áp dụng |
|---|---|---|
| QĐ-1 | Trang 2 diễn ra **giờ ra chơi buổi chiều** (không phải "sau giờ học" như kịch bản/`01`), kết bằng trống vào lớp | Thẻ giữ "Lớp 7. Một chiều mưa."; dòng phụ nói rõ giờ ra chơi. Kịch bản và `01` cần ghi chú SUPERSEDED cho chữ "sau giờ học" (không sửa đè) |
| QĐ-2 | [KIỂM NĂM] Dùng **trống trường** cho **cả 4 Trang** Mốc 1 | Trang 2: "trống vào lớp". Trang 1/3/4: chỗ nào ghi "chuông" đổi thành "trống" khi viết lại |
| QĐ-3 | Minigame **giữ bước chọn kiểu thuyền**; chấp nhận lệch nhỏ với ảnh 5 thuyền (thuyền trong ảnh là kiểu mặc định). Dời bước chọn kiểu lên trước khi chụp: xét sau 15/12 | Không đổi luật `mg_boat` |
| QĐ-4 | Ghi chú ảnh Album đổi thành "Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xếp hàng chờ thả." | `frag.d.g07.01.02` (R-D2 đổ khi đã duyệt chữ) |
| QĐ-5 | (25/11, sau v0.2) **Dời** câu Hạ "Thuyền của {player_name} trôi mất rồi…" ra **sau** phần giới thiệu tên, như P2-6 đang viết | Lệch thứ tự kịch bản gốc là có chủ đích; kịch bản và `01` ghi chú khi R-F1 đồng bộ |

## [CẦN ENGINE]

| # | Cần gì | Ở đâu | Tạm thời nếu chưa có |
|---|---|---|---|
| E1 | Động tác **ngồi** (ngồi gấp thuyền) | P2-2 | Hạ, Quân đứng |
| E2 | NPC **cầm và trao đồ** không phải máy ảnh (thuyền, xấp giấy, bút) | P2-2, P2-3, P2-6 | Đồ hiện sẵn trên tay; bỏ cảnh trao, máy quay đẩy thẳng vào buồm |
| E3 | Thuyền giấy cầm tay + biến thể "ướt" | P2-2, P2-6 | Đã có trong việc R-C1 |
| E4 | Động tác **cúi** đặt thuyền xuống / vớt thuyền lên | P2-4, P2-5, P2-6 | Thuyền hiện/biến trong lúc máy quay đẩy vào |
| E5 | Chữ **hiện dần** trên cánh buồm: điều ước, rồi 5 chữ ký lần lượt | P2-3, P2-6 | Hiện cả dòng một lúc |
| E6 | Mưa **nhỏ dần** giữa bước | P2-6 | Đổi sang mưa nhỏ ngay đầu bước (lúc máy quay đẩy vào cho đỡ lộ) |
| E7 | Âm thanh **trống** vào lớp (QĐ-2) | P2-6 | Dòng lời kể "Tùng… tùng… tùng…" |
| E8 | Chỗ đặt mới trên bản đồ: điểm đứng chụp trước rãnh, "cuối rãnh" cho thuyền mắc lại | P2-4, P2-6 | Dùng `eave_5` / đầu `itr.thcs.gutter` |
| E9 | Thuyền của Hạ phải là chiếc **mắc lại** sau khi đua (cảnh 3D, sau R-B4 mục e) | P2-5 → P2-6 | Đặt sẵn một thuyền ở cuối rãnh khi bắt đầu P2-6 |

## Thay đổi
- v0.2.1 (25/11): chốt QĐ-5 (dời câu Hạ ra sau phần giới thiệu tên). Chữ không đổi.
- v0.2 (25/11): chốt QĐ-1…4; điền mã thật từ dữ liệu; đổi chuông → trống; file thành outline chính để Antigravity viết hoàn thiện.
- v0.1 (25/11): bản đầu.

*Mọi chữ trong file này là PROPOSED. Chưa sửa dữ liệu, code hay tài liệu gốc nào.*
