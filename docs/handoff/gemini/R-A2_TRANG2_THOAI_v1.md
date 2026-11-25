# R-A2 · TRANG 2 — MƯA VÀ THUYỀN GIẤY · Bản thoại hoàn chỉnh

| Mục | Thông tin |
|---|---|
| Phiên bản | `v1.0 · DRAFT · 25/11/2026` |
| Người viết | Gemini Flash 3.8 (Antigravity) |
| Nguồn | `outline v0.2` (`R-A2_TRANG2_THOAI_PROPOSED.md` v0.2.1) · `KICH_BAN_DEMO_M1_M2_v1.md` · `d_g07_01.ts` |
| Trạng thái | **PROPOSED — chờ "duyệt Trang 2"** |

**Mã thật giữ nguyên:** ngày `d.g07.01` · quest `q_m1_main_02` (`s01…s05`) · lựa chọn `c_m1_02_wish` (flag `m1.wish`) · minigame `mg_boat` · ảnh `frag.d.g07.01.01` · ghi chú ảnh `frag.d.g07.01.02`: *"Chiều mưa đầu lớp 7, năm chiếc thuyền giấy xếp hàng chờ thả."*
**Vai:** `NPC_A` Đức · `NPC_B` Châu · `NPC_C` Hạ · `NPC_D` Quân · `player` ({player_name}) · `narrator`.
**Xưng hô lớp 7:** Đức "tao–mày" với Player và Châu; "tớ–cậu" với Hạ, Quân và khi nói chung cả nhóm. Châu "tui", gọi Đức/Quân "ông", gọi Player `{g:ông|bà}`, gọi cả nhóm không dùng "ông/bà". Hạ tự xưng "Hạ", gọi tên (chỉ gọi `{player_name}` sau khi Đức giới thiệu ở P2-6). Quân "tớ–cậu". Player theo người đối diện.

---

## P2-1 · Mưa đổ, chạy vào hiên

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P2-1 (`q_m1_main_02.s01`) · Nối vào: **THẺ** · Nối ra: **VÀO-CHỖ** |
| Ai ở đâu lúc vào | **Thẻ mở Trang (THẺ):** Mờ tối → thẻ chữ **Lớp 7. Một chiều mưa.** / dòng phụ: *Giờ ra chơi, mưa đổ ào xuống sân.* (~2,5 s, bấm để qua) → đổi thời tiết sang mưa trong lúc tối → mờ sáng. Lúc sáng lên: `player` đứng giữa sân (`spawn.thcs.yard`), trời đang mưa; Đức (`NPC_A`) đứng dưới hiên tại `spot.thcs.eave_1`, Châu (`NPC_B`) đứng cạnh Đức tại `spot.thcs.eave_2`, cả hai quay mặt ra sân nhìn `player`. |
| Ai đi đâu (chỉ đạo) | Hết thẻ mở Trang: Đức và Châu đứng dưới hiên **vẫy tay** gọi `player`. `player` tự **chạy** từ `spawn.thcs.yard` vào hiên, **VÀO-CHỖ** đứng cạnh Đức tại `spot.thcs.eave_1`, quay mặt về Đức và Châu; Đức và Châu quay mặt về `player`. |
| Câu dẫn vào | **Đức** (`NPC_A`, **vẫy tay** khi `player` còn ngoài sân): "Vô lẹ mày! Ướt như chuột lột bây giờ!" [MỚI] |
| ▶ | `player` **chạy** từ sân vào hiên, đứng cạnh Đức tại `spot.thcs.eave_1`, quay mặt về Đức và Châu. |
| Thoại 1 | **Đức** (`NPC_A`) — "Nghỉ hè có hai tháng mà tao thấy như hai năm." — *nói* |
| Thoại 2 | **Châu** (`NPC_B`) — "Tại ông không làm bài tập hè." — *nói* |
| Thoại 3 | **Đức** (`NPC_A`) — "Ủa, chưa gì đã nghi tao rồi!" — *nói* |
| ▶ | Đức quay mặt dọc hiên hướng về phía đầu hiên (`spot.thcs.eave_5`), **vẫy tay** ra hiệu cho `player` và Châu nhìn theo. |
| Câu dẫn ra | **Đức** (`NPC_A`): "Ê, đầu hiên có ai gấp thuyền kìa. Đi coi!" [MỚI] |
| Dòng gợi ý góc màn hình | Lúc vào: **Chạy vào hiên tránh mưa** · Lúc ra: **Đi theo Đức** |

---

## P2-2 · Gặp Hạ và Quân đang gấp thuyền

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P2-2 (`q_m1_main_02.s02`) · Nối vào: **DẪN** |
| Ai ở đâu lúc vào | Hạ (`NPC_C`) và Quân (`NPC_D`) đứng ở đầu kia hiên (`spot.thcs.eave_5`), quay mặt vào nhau: Hạ cầm một chiếc thuyền giấy, Quân cầm xấp giấy *(ngồi gấp → [CẦN ENGINE] E1, tạm thời đứng; cầm thuyền/xấp giấy → [CẦN ENGINE] E2, E3)*. Đức (`NPC_A`), Châu (`NPC_B`) và `player` ở đầu hiên bên này (`spot.thcs.eave_1`–`eave_2`). |
| Ai đi đâu (chỉ đạo) | Đức **đi** trước dọc hiên từ `spot.thcs.eave_1` tới `spot.thcs.eave_4` (chờ nếu `player` tụt xa); Châu **đi** theo sau Đức một nhịp; `player` tự **đi** theo sau. Tới `spot.thcs.eave_4`, Đức dừng, quay mặt về Hạ (`spot.thcs.eave_5`); Châu đứng cạnh Đức, quay mặt về Hạ và Quân; `player` đứng bên cạnh Đức và Châu, hướng mặt về phía Hạ và Quân. |
| Câu dẫn vào | Không thêm câu (Đức đã nói ở cuối P2-1). |
| ▶ | Đức tới `spot.thcs.eave_4` và dừng lại; Hạ quay mặt từ Quân sang nhìn nhóm Đức. |
| Thoại 1 | **Đức** (`NPC_A`) — "Ê! Thuyền đẹp đó! Cậu gấp hả?" — *nói* |
| Thoại 2 | **Hạ** (`NPC_C`) — "Ừm… mưa nhiều nên Hạ gấp thử." — *nói* |
| Thoại 3 | **Đức** (`NPC_A`) — "Hay mình thi coi thuyền ai chạy xa nhất đi!" — *reo mừng* |
| ▶ | Châu **đi** lên một bước đứng ngang hàng cạnh Đức, quay mặt về Hạ và Quân. |
| Thoại 4 | **Châu** (`NPC_B`) — "Thi thì phải có luật. Thả rồi không được lấy tay đẩy." — *nói* |
| Thoại 5 | **Đức** (`NPC_A`) — "Rồi rồi, Châu Tổng làm trọng tài." — *tạo dáng chữ V* |
| Thoại 6 | **Player** (`player`) — "Hai cậu chơi chung hông?" — *nói* |
| ▶ | Hạ quay nhìn sang Quân rồi nhìn lại `player`; Quân **đi** một bước tới gần bên cạnh `player`. |
| Thoại 7 | **Hạ** (`NPC_C`) — "Có… nếu mọi người không ngại." — *nói* |
| Thoại 8 | **Quân** (`NPC_D`) — "Tớ giữ giấy cho. Gió thổi bay mất." — *nói* [SỬA: thêm "cho" từ outline cho tự nhiên] |
| ▶ | Hạ quay mặt về `player`, đưa tờ giấy về phía `player` *(trao giấy/bút → [CẦN ENGINE] E2; tạm: Hạ đứng cạnh `player`, đồ hiện sẵn)*. |
| Câu dẫn ra | **Hạ** (`NPC_C`): "Giấy đây. Viết xong gấp buồm vô nha." [MỚI] |
| Dòng gợi ý góc màn hình | Lúc đi: **Đi theo Đức** · Lúc ra: **Viết điều ước lên buồm** |

---

## P2-3 · Viết điều ước lên cánh buồm

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P2-3 (`q_m1_main_02.s03`, bước lựa chọn `c_m1_02_wish`) · Nối: **ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Cả năm đứng tại `spot.thcs.eave_4`–`spot.thcs.eave_5`: Hạ (`NPC_C`) đứng ngay cạnh `player`, Quân (`NPC_D`) đứng cạnh Hạ; Đức (`NPC_A`) và Châu (`NPC_B`) đứng chếch phía trước; cả bốn bạn quay mặt về `player`. |
| Ai đi đâu (chỉ đạo) | Cả nhóm đứng tại chỗ, hướng mặt về `player`. Máy quay **ĐẨY-MÁY** tiến vào đôi tay `player` và cánh buồm trống (~1 s). |
| Câu dẫn vào | Không thêm câu (Hạ đã nói ở cuối P2-2). |
| ▶ | Máy quay **ĐẨY-MÁY** tiến vào cận cảnh đôi tay và cánh buồm trống (~1 s). |
| Thoại 1 | **Hạ** (`NPC_C`) — "Viết một điều ước lên buồm đi. Thuyền chạy tới đâu, điều ước theo tới đó." — *nói* |
| Lựa chọn | Mã `c_m1_02_wish` · lưu flag `m1.wish` *(giữ nguyên chữ, tông, mã)*:<br>- `friendship` (Ấm áp · `gentle`): **"Mai mốt vẫn chơi chung vầy."**<br>- `fun` (Rộn ràng · `playful`): **"Lớp 7 vui hơn lớp 6."**<br>- `secret` (Sâu lắng · `deep`): **"Bí mật không nói ra."** |
| ▶ | Chữ của điều ước vừa chọn hiện dần lên cánh buồm *([CẦN ENGINE] E5; tạm: hiện cả dòng một lúc)*; máy quay lùi ra (~0,8 s) về khung cả năm bạn. |
| Thoại 2 | **Đức** (`NPC_A`) — "Tớ ước… thuyền tớ đừng lật!" — *tạo dáng "tada"* |
| Thoại 3 | **Châu** (`NPC_B`) — "Ước gì kỳ vậy." — *nói* |
| Ghi chú | Hai câu phản ứng dùng chung cho cả 3 lựa chọn, không nhắc nội dung điều ước. |
| ▶ | Hạ quay mặt hướng ra phía rãnh nước (`itr.thcs.gutter`) ngoài mép hiên. |
| Câu dẫn ra | **Hạ** (`NPC_C`): "Xếp năm chiếc ở mép rãnh trước đã." [MỚI] |
| Dòng gợi ý góc màn hình | **Chọn điều ước viết lên buồm** |

---

## P2-4 · Chụp 5 thuyền trước khi thả

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P2-4 (bước ảnh mới, đứng trước `q_m1_main_02.s04`; mã bước do R-D2 đặt, không đổi mã cũ) · Nối: **DẪN** → **VÀO-CHỖ** → **CHỤP** · Ảnh chính Album (`frag.d.g07.01.01`) |
| Ai ở đâu lúc vào | Đầu bước, cả năm rời `spot.thcs.eave_4`–`eave_5` **đi** ra mép rãnh nước (`itr.thcs.gutter`). Hạ (`NPC_C`) và Quân (`NPC_D`) đứng bên trái hàng thuyền; Đức (`NPC_A`) và Châu (`NPC_B`) đứng bên phải hàng thuyền, cả bốn bạn quay mặt về rãnh nước (không cần lọt vào khung ảnh). Khi các bạn tới nơi, 5 chiếc thuyền giấy hiện xếp hàng ở mép rãnh *(cúi đặt thuyền → [CẦN ENGINE] E4; tạm: 5 thuyền hiện sẵn khi tới mép rãnh)*. |
| Ai đi đâu (chỉ đạo) | `player` tự **đi** theo nhóm ra mép rãnh, **VÀO-CHỖ** tại điểm đứng chụp cách rãnh ~2–3 m *([CẦN ENGINE] E8; tạm: đứng gần `spot.thcs.eave_5` / đầu `itr.thcs.gutter`)*, quay mặt nhìn về 5 chiếc thuyền theo hướng máy quay `cam.thcs.gutter`. |
| Câu dẫn vào | **Hạ** (`NPC_C`, quay mặt về `player`): "Chụp lại năm chiếc trước khi thả được hông?" [MỚI] |
| ▶ | Đức quay mặt về `player`, **vẫy tay** giục. |
| Thoại 1 | **Đức** (`NPC_A`) — "Có nè! Máy của mày đó, chụp lẹ đi!" — *vẫy tay* [MỚI] |
| ▶ | **CHỤP**: máy ảnh hiện rõ trên tay `player`, giơ lên → hiện khung ngắm trên màn hình → flash + tiếng chụp → hạ máy ảnh xuống. |
| Lời nhắc trên màn hình | **Bấm chụp khi đủ năm chiếc trong khung** |
| Thoại 2 | **Đức** (`NPC_A`) — "Tấm này làm bằng chứng thuyền tớ thắng nha!" — *tạo dáng chữ V* [MỚI] |
| Thoại 3 | **Châu** (`NPC_B`) — "Chưa thả mà ông đòi thắng rồi." — *nói* [MỚI] |
| Câu dẫn ra | Không thêm câu (Châu bắt đầu quay người xuống cuối rãnh, nối sang P2-5). |
| Dòng gợi ý góc màn hình | **Chụp năm chiếc thuyền trước khi thả** |

---

## P2-5 · Thả thuyền (minigame đua thuyền)

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P2-5 (`q_m1_main_02.s04`, minigame `mg_boat`) · Nối vào: **DẪN** · giữa: **VÀO-CHỖ** + **ĐẨY-MÁY** |
| Ai ở đâu lúc vào | Như cuối P2-4: `player` ở điểm đứng chụp cách rãnh ~2–3 m, bốn bạn đứng hai bên hàng thuyền tại mép rãnh (`itr.thcs.gutter`). |
| Ai đi đâu (chỉ đạo) | **Bước dẫn riêng đứng trước minigame:** Châu (`NPC_B`) **đi** xuống cuối rãnh nước *([CẦN ENGINE] E8; tạm: góc cuối `itr.thcs.gutter`)* rồi quay mặt lại nhìn nhóm làm trọng tài; Đức (`NPC_A`) **chạy** tới sát mép rãnh bên cạnh hàng thuyền. `player` tự bước **VÀO-CHỖ** tới mép rãnh (`itr.thcs.gutter`), quay mặt xuống mặt nước → máy quay **ĐẨY-MÁY** vào mặt nước (~1 s) → hiện thẻ luật minigame. |
| Câu dẫn vào | **Châu** (`NPC_B`, đứng ở cuối rãnh — thuộc bước dẫn riêng **trước** minigame, không đặt trong thoại sau minigame): "Tui đứng cuối rãnh làm trọng tài. Thả đi!" [MỚI] |
| Thẻ luật minigame | 1. Chọn kiểu thuyền: buồm nhanh mà dễ lật, mui chậm mà chắc, đôi vừa vừa.<br>2. Giữ chuột (hoặc Space), buông khi kim ở vùng xanh để thả.<br>3. Kéo trái/phải (A/D) né rác và xoáy nước. Đụng rác 3 lần là lật. |
| ▶ | *(Bắt đầu phần thoại **SAU** minigame — dùng chung thắng / thua / Bỏ qua)*<br>Kết thúc minigame, máy quay lùi ra (~0,8 s) về toàn cảnh rãnh nước; Đức **chạy** dọc mép rãnh nhìn chiếc thuyền lật. |
| Thoại 1 | **Đức** (`NPC_A`) — "Sao lật rồi? Ai thấy không? Có người tác động dòng nước!" — *nói* |
| Thoại 2 | **Châu** (`NPC_B`) — "Ông thả lệch. Tui thấy rõ." — *nói* |
| Thoại 3 | **Quân** (`NPC_D`) — "Thuyền tớ… hình như xa nhất." — *nói* |
| ▶ | Đức quay mặt sang Quân, **đi** hai bước tới gần Quân. |
| Thoại 4 | **Đức** (`NPC_A`) — "Hư cấu! Thuyền cậu gắn động cơ hả?" — *nói* |
| Thoại 5 | **Châu** (`NPC_B`) — "Thua thì nhận đi." — *nói* |
| Thoại 6 | **Đức** (`NPC_A`) — "Ván sau tớ phục thù!" — *tạo dáng chữ V* |
| Ghi chú | Mọi câu sau trò chơi đều nói về kết quả cố định (thuyền Đức lật, thuyền Quân xa nhất), không nhắc hạng của `player`, không đọc lại luật. |
| ▶ | Hạ quay mặt nhìn dọc rãnh nước về phía cuối rãnh. |
| Câu dẫn ra | **Hạ** (`NPC_C`): "Thuyền Hạ… mắc ở cuối rãnh rồi." [MỚI] |
| Dòng gợi ý góc màn hình | Lúc dẫn: **Ra mép rãnh thả thuyền** · Lúc ra: **Vớt thuyền ở cuối rãnh** |

---

## P2-6 · Vớt thuyền, cả nhóm ký tên, trống vào lớp

| Mục | Nội dung |
|---|---|
| Mã phân cảnh | P2-6 (`q_m1_main_02.s05`) · Nối: **ĐẨY-MÁY** → Nối ra: **DẪN** |
| Ai ở đâu lúc vào | Thuyền của Hạ (chậm nhất) mắc lại ở cuối rãnh *([CẦN ENGINE] E8, E9; tạm: đặt sẵn một thuyền ở cuối rãnh khi bắt đầu bước)*. Mưa nhỏ lại *([CẦN ENGINE] E6; tạm: đổi sang mưa nhỏ ngay đầu bước khi máy đẩy vào)*. Cả bốn bạn đứng rải dọc mép rãnh (`itr.thcs.gutter`), quay mặt hướng về cuối rãnh. |
| Ai đi đâu (chỉ đạo) | `player` tự **đi** dọc mép rãnh tới cuối rãnh, bấm **[E] Vớt thuyền** → máy quay **ĐẨY-MÁY** vào chiếc thuyền ướt trên tay `player` *(cúi vớt → [CẦN ENGINE] E4; tạm: thuyền chuyển từ nước lên tay trong lúc máy đẩy vào; biến thể thuyền ướt → [CẦN ENGINE] E3)*. |
| Câu dẫn vào | Không thêm câu (Hạ đã nói ở cuối P2-5). |
| ▶ | `player` vớt chiếc thuyền lên tay; Đức **chạy** tới đứng cạnh `player`, Châu **đi** theo đứng bên cạnh; máy quay lùi ra (~0,8 s) về khung cả nhóm, cả hai bạn quay mặt về phía Hạ và Quân. |
| Thoại 1 | **Đức** (`NPC_A`) — "À mà chưa giới thiệu! Tớ là Đức, đây là {player_name}, còn đây là Châu Tổng khó tính." — *nói* |
| Thoại 2 | **Châu** (`NPC_B`) — "Giới thiệu người ta thì bớt bình luận giùm." — *nói* |
| ▶ | Hạ **đi** lên một bước tới đối diện `player`, Quân **đi** theo đứng ngay phía sau Hạ, cả hai quay mặt về nhóm `player`. |
| Thoại 3 | **Hạ** (`NPC_C`) — "Hạ nè. Lớp bên." — *vẫy tay* |
| Thoại 4 | **Quân** (`NPC_D`) — "Quân. Cũng lớp bên." — *nói* |
| ▶ | Hạ **đi** tới đứng sát cạnh `player`, đưa cây bút *(trao bút → [CẦN ENGINE] E2; tạm: bỏ cảnh trao, máy đẩy thẳng vào)*; máy quay **ĐẨY-MÁY** vào cánh buồm chiếc thuyền ướt (~1 s). |
| Thoại 5 | **Hạ** (`NPC_C`) — "Thuyền của {player_name} trôi mất rồi. Ghi lại điều ước lên buồm này đi." — *nói* |
| ▶ | **Ký tên trên buồm** (cận cảnh): chữ điều ước đã chọn ở P2-3 hiện dần lên buồm, rồi năm chữ ký lần lượt hiện ra: **{player_name}** (ký trước) → **Hạ** → **Quân** → **Châu** → **Đức** (chen vô mép buồm cuối cùng) *([CẦN ENGINE] E5; tạm: hiện cả dòng một lúc)*. Máy quay lùi ra (~0,8 s), cả nhóm quay mặt nhìn `player`. |
| Thoại 6 | **Player** (`player`) — "Mai ra chơi mình chơi tiếp nha?" — *nói* |
| Thoại 7 | **Hạ** (`NPC_C`) — "Ừ, mai Hạ mang thêm giấy." — *nói* |
| Thoại 8 | **Quân** (`NPC_D`) — "Tớ mang giấy báo cũ. Gấp cứng hơn." — *nói* |
| ▶ | Tiếng **trống vào lớp** vang lên (*"Tùng… tùng… tùng…"* — âm thanh → *[CẦN ENGINE] E7*); Châu quay người **đi** về phía cửa lớp (`spot.thcs.corridor_door`). |
| Thoại 9 | **Châu** (`NPC_B`) — "Nhớ đúng giờ nha. Đừng để người khác chờ." — *nói, đi* |
| Câu dẫn ra | Không thêm câu (dùng Thoại 9 của Châu làm câu dẫn). Châu **đi** trước về phía `spot.thcs.corridor_door`, Đức, Hạ, Quân **đi** theo; `player` tự **đi** theo Châu vào cửa lớp → hết Trang (mờ ra như hiện có). |
| Dòng gợi ý góc màn hình | Lúc vào: **Vớt thuyền ở cuối rãnh** · Lúc ra: **Đi theo Châu vào lớp** |

---

## [HỎI CHỦ DỰ ÁN]

| # | Câu hỏi | Phương án A / B / C | Đang viết theo |
|---|---|---|---|
| 1 | Khi Hạ đưa giấy cho người chơi viết điều ước trước lúc ra mép rãnh, có cần thêm nhịp bấm gấp buồm hay chỉ chọn điều ước rồi chữ hiện lên cánh buồm sẵn có? | **A.** Người chơi chỉ chọn điều ước để chữ hiện lên cánh buồm (chọn kiểu thuyền giữ ở lúc sắp thả).<br>**B.** Thêm 1 nhịp bấm nút gấp buồm ngay sau khi chọn điều ước.<br>**C.** Hiện chữ trực tiếp lên thuyền đã gấp sẵn trên tay. | **A** |
| 2 | Thuyền của Hạ vừa vớt từ rãnh nước lên còn ướt, lúc Hạ bảo ghi lại điều ước và cả nhóm ký tên có cần thêm câu nhắc mặt giấy còn ẩm hay giữ nguyên thoại cũ? | **A.** Giữ nguyên lời thoại cũ, đẩy thẳng vào cảnh viết và ký trên buồm.<br>**B.** Thêm 1 câu ngắn của Hạ (kiểu "Buồm còn hơi ướt mà vẫn viết được nè.").<br>**C.** Mô tả thuyền chỉ ướt phần đáy, cánh buồm còn khô ráo để ký. | **A** |
| 3 | Lúc trống vào lớp ở cuối buổi ra chơi, nếu game chưa kịp gắn âm thanh tiếng trống thật thì hiện dòng chữ ngắn báo tiếng trống hay để Châu nhắc miệng luôn? | **A.** Tạm hiện dòng chữ ngắn *"Tùng… tùng… tùng…"* trước khi Châu quay đi.<br>**B.** Bỏ dòng báo tiếng trống, để Châu nói thêm câu *"Tới giờ vô lớp rồi!"* trước câu cuối.<br>**C.** Để Châu quay đi nói thẳng câu cuối, bổ sung tiếng trống ở bản sau. | **A** |

---

## [CẦN ENGINE]

| # | Cần gì | Ở đâu | Cách tạm nếu chưa có |
|---|---|---|---|
| E1 | Động tác **ngồi** (ngồi gấp thuyền dưới hiên) | P2-2 | Hạ và Quân đứng ở đầu hiên |
| E2 | NPC **cầm và trao đồ** không phải máy ảnh (thuyền giấy, xấp giấy, bút) | P2-2, P2-3, P2-6 | Đồ hiện sẵn trên tay; bỏ cảnh trao, máy quay đẩy thẳng vào cánh buồm |
| E3 | Thuyền giấy cầm tay và biến thể thuyền "ướt" | P2-2, P2-6 | Đã có trong việc tạo đồ vật (dùng mẫu thuyền chuẩn tạm nếu chưa có bản ướt) |
| E4 | Động tác **cúi** đặt thuyền xuống rãnh / vớt thuyền lên | P2-4, P2-5, P2-6 | Thuyền hiện sẵn hoặc chuyển từ nước lên tay trong lúc máy quay đẩy vào |
| E5 | Chữ **hiện dần** trên cánh buồm: điều ước, rồi 5 chữ ký lần lượt | P2-3, P2-6 | Hiện cả dòng chữ và các chữ ký một lúc |
| E6 | Mưa **nhỏ dần** giữa bước | P2-6 | Đổi sang mưa nhỏ ngay đầu bước (lúc máy quay đẩy vào cho đỡ lộ) |
| E7 | Âm thanh **trống** vào lớp | P2-6 | Dòng lời kể ngắn *"Tùng… tùng… tùng…"* |
| E8 | Chỗ đặt mới trên bản đồ: điểm đứng chụp cách rãnh ~2–3 m và "cuối rãnh" cho thuyền mắc lại | P2-4, P2-5, P2-6 | Dùng `spot.thcs.eave_5` / đầu và cuối `itr.thcs.gutter` |
| E9 | Thuyền của Hạ phải là chiếc **mắc lại** sau khi đua trong cảnh 3D | P2-5 → P2-6 | Đặt sẵn một chiếc thuyền ở cuối rãnh khi bắt đầu P2-6 |

---

## Tự kiểm

| Mục kiểm tra | Kết quả | Số liệu thật |
|---|---|---|
| Đếm ô thoại > 2 dòng (~90 ký tự) | **Đạt** | **0** ô vượt 2 dòng (ô dài nhất là P2-6 Thoại 1: 85 ký tự khi chưa thế tên, ~78 ký tự khi thế tên thật) |
| Đếm chỗ có > 3 ô thoại liền không có `▶` | **Đạt** | **0** chỗ (cao nhất là 3 ô thoại liền ở P2-1, P2-2, P2-5, P2-6) |
| Từng phân cảnh P2-1…P2-6 đủ 7 mục của mẫu | **Đạt** | **6 / 6** phân cảnh đủ cả 7 mục đúng thứ tự |
| 3 phương án điều ước còn nguyên chữ và mã | **Đạt** | Còn nguyên `c_m1_02_wish`, `m1.wish`, `friendship` (`gentle`), `fun` (`playful`), `secret` (`deep`) |
| Không có "chuông", không có "sau giờ học" | **Đạt** | **0** lần xuất hiện `"chuông"`, **0** lần xuất hiện `"sau giờ học"` |
| Hạ không gọi tên người chơi trước P2-6 | **Đạt** | **0** lần trước P2-6; Hạ chỉ gọi `{player_name}` ở P2-6 Thoại 5 (sau P2-6 Thoại 1 Đức giới thiệu) |

---

## So với outline

- **Giữ nguyên toàn bộ khung và chữ chốt:** giữ đủ 6 phân cảnh P2-1…P2-6, các quyết định QĐ-1…QĐ-5, mã thật, lựa chọn điều ước, thẻ luật 3 dòng và toàn bộ thoại gốc từ kịch bản.
- **Chuẩn hóa mã điểm đặt theo danh sách có sẵn:** đổi các ký hiệu rút gọn `eave_1…5` và `corridor_door` thành `spot.thcs.eave_1…5` và `spot.thcs.corridor_door`.
- **Chi tiết hóa chỉ đạo vị trí và hướng nhìn:** bổ sung rõ từng nhân vật đứng ở đâu, đi hướng nào, quay mặt về ai trong từng nhịp mở, giữa và kết phân cảnh.
- **Thêm 3 nhịp `▶` trước chỗ chuyển cảnh (P2-2, P2-3, P2-4):** bảo đảm mỗi chỗ nối đều có một hành động nhìn thấy được trước câu dẫn hoặc lời thoại kế tiếp, không dồn quá 3 ô thoại liền.
- **Chuẩn hóa cấu trúc theo mẫu F:** thống nhất tên mục `Dòng gợi ý góc màn hình`, tách rõ bước dẫn trước minigame ở P2-5, gom 3 câu hỏi `[HỎI CHỦ DỰ ÁN]` và bảng `Tự kiểm` vào cuối file.
