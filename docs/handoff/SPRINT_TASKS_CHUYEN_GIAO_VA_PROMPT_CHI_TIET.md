# BẢNG PHÂN CÔNG SPRINT TASKS & GÓI PROMPT GIAO VIỆC CHI TIẾT
> **Dự án:** Game 3D "Vùng Ký Ức" (KNĐMST) — Repo: `KusaThaor/GAME-KNDMST`  
> **Áp dụng cho:** Đợt tổng lực triển khai từ 25/11 đến 04/12/2026 (Chốt bản đo 05/12)  
> **Nguồn chân lý:** `TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md` & `SO_HOA_NARRATIVE_TA_CANH_MOC1.md`  

---

## PHẦN 1. BẢNG MA TRẬN PHÂN CÔNG TÁC VỤ (SPRINT TASK MATRIX)

| Mã Task | Tên tác vụ | Ưu tiên | Nhánh Git | Giao cho | Model đề xuất | Mức độ | Lỗi cụ thể cần xử lý (Bugs to Fix) |
|---|---|:---:|---|---|---|:---:|---|
| **TASK-00** | **Kiểm tra & Gộp nền `RF-3` + Docs** | **P0** | `feat/sprint-0412` | Role Manager | Claude 3.7 Sonnet | Tier 1 (Cao cấp) | Kiểm tra `RF-3` (tách `game.ts`/`GameUi.tsx`), nếu 5 test pass thì gộp vào `feat/sprint-0412` cùng nhánh docs. |
| **TASK-01** | **Đợt 1: Nền Dữ Liệu, Marker & Form Thoát (`R-P1` + `R-D0`)** | **P0** | `task/R-P1-D0-nen-du-lieu` | Agent 1 (Data Lead) | Claude 3.5 Sonnet / Gemini 2.0 Pro | Tier 2 (Tiêu chuẩn) | • Xóa 100% `[PLACEHOLDER]` trong `chapters.ts`, `hub.ts`, `hubRoom.ts`, `FeedbackForm.tsx`<br>• Sửa Form phản hồi: mở ngay khi bấm nút **Thoát** (không cần đợi hết game)<br>• Cập nhật tọa độ marker `map_thcs.extras.ts`: gốc phượng, khúc gỗ bãi đất, bụi cây đá cầu, bảng phân lớp, cuối rãnh nước. |
| **TASK-02** | **Đợt 2: Đạo Diễn Nhân Vật Đi Lại & Biểu Cảm (`R-B1`)** | **P0** | `task/R-B1-stage-director` | Agent 2 (Engine NPC) | Claude 3.7 Sonnet / Claude 3.5 Sonnet | Tier 1 (Cao cấp) | • Nhân vật đứng yên như tượng -> Fix: tự đi/chạy theo marker, quay mặt đối diện<br>• Đổi animation biểu cảm (vẫy tay, chữ V, tada)<br>• Châu không biến mất ở cuối P1-5 -> Fix: ẩn nhân vật khi ra khỏi cửa<br>• Dịch chuyển cụm nhân vật mượt từ P1-5 sang tiệm tạp hóa P1-6. |
| **TASK-03** | **Đợt 2: Chuyển Cảnh, Thẻ Chữ & Giao Diện Narrative (`R-B2`)** | **P0** | `task/R-B2-transition-ui` | Agent 3 (UI/UX Lead) | Claude 3.5 Sonnet / GPT-4o | Tier 2 (Tiêu chuẩn) | • Thiếu thẻ chữ 2 dòng mở cảnh -> Fix: tạo `TitleCardOverlay.tsx`<br>• Lời dẫn bối cảnh bị nhét chung vào thoại nhân vật -> Fix: tạo component `NarratorBanner.tsx` dải đáy màn hình riêng<br>• Lộ tên "Căn cứ bí mật" quá sớm -> Fix: ghi đè tên khu động từ "Góc sân sau" sang "Căn cứ bí mật" sau khi dọn xong<br>• Camera giật cục -> Fix: `CameraManager.dollyTo` mượt mà<br>• Dẫn đường khóa chân người chơi -> Fix: bỏ khóa di chuyển. |
| **TASK-04** | **Đợt 2: Chụp Ảnh Nâng Cao & Đạo Cụ Cầm Tay (`R-B3`)** | **P0** | `task/R-B3-photo-props` | Agent 4 (Gameplay 3D) | Claude 3.5 Sonnet | Tier 2 (Tiêu chuẩn) | • Bỏ hardcode `MULTI_SHOT` trong `photoRunner.ts`<br>• Lời nhắc riêng cho từng lần bấm tự sướng P1-8 (3 lần)<br>• Thoại chen đếm ngược 10s và phản ứng theo 3 kiểu ảnh P4-5<br>• Đạo cụ cầm/trao trên tay (`props.ts`: vở, cầu, thuyền, sổ, bút đỏ, biển tên, máy ảnh)<br>• Ảnh chính Album Trang 2 và Trang 3 bị lấy ảnh tĩnh dựng sẵn -> Fix: lấy từ ảnh thật người chơi vừa chụp (`gameplay_photo`). |
| **TASK-05** | **Đợt 2: Biến Đổi 3D Tại Chỗ & SFX (`R-B4`)** | **P0** | `task/R-B4-transforms-sfx` | Agent 5 (World/Audio) | Claude 3.5 Sonnet / Gemini 2.0 Pro | Tier 2 (Tiêu chuẩn) | • Khảo sát Trang 3 bấm chỗ nào cũng thoại giống nhau -> Fix: `lines_by_target` riêng cho Mái che, Gốc cây, Thùng giấy + bộ đếm `0/3`<br>• Đồ trang trí Trang 3 không hiện ngay -> Fix: hiện tức thì khi chọn xong<br>• Trang 2: tách 5 thuyền mép rãnh thành 1 thuyền mắc cạn cuối rãnh của Hạ<br>• Thiếu SFX -> Fix: gắn âm thanh cơ bản (vở rơi, trống trường, tiếng máy ảnh, mưa ngớt). |
| **TASK-06** | **Đợt 2: Minigame Gấp Thuyền & Viết Điều Ước (`R-B5`)** | **P0** | `task/R-B5-boat-minigame` | Agent 6 (Minigame) | Claude 3.7 Sonnet / Claude 3.5 Sonnet | Tier 1 (Cao cấp) | • Thiếu hẳn cảnh gấp thuyền Trang 2 Cảnh 3 -> Fix: tích hợp minigame vuốt gấp thuyền giấy theo nếp nứt<br>• Thao tác chọn 1 trong 3 điều ước<br>• Thao tác tự tay ghi/tô nét điều ước lên cánh buồm thuyền giấy. |
| **TASK-07** | **Đợt 3: Số Hóa Toàn Bộ Kịch Bản 4 Trang + Hub (`R-D1…D4`)** | **P0** | `task/R-D-so-hoa-moc1` | Agent 7 (Content/Data) | Gemini 2.0 Flash / Pro hoặc Claude 3.5 Haiku | Tier 2 (Fast/Context) | • Đảo thứ tự Trang 3: dọn bàn ghế (`s04`) PHẢI XẢY RA TRƯỚC trang trí (`s03`)<br>• Cập nhật câu thoại mới của Châu P1-3: *"Lo chép bài đi, chút ra chơi rồi tính tiếp."*<br>• Đổ sạch chữ từ `TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md` và `SO_HOA_NARRATIVE_TA_CANH_MOC1.md` vào các file `d_g06_01.ts`…`d_g07_03.ts` và `hub.ts`. |
| **TASK-08** | **Tổng kiểm định & Đóng gói bản đo 05/12** | **P0** | `feat/sprint-0412` | Role Manager | Claude 3.7 Sonnet | Tier 1 (Cao cấp) | Chạy trọn vẹn bộ 5 lệnh kiểm tra, chơi tay từ đầu đến cuối, kiểm tra 0 placeholder trong bundle production, báo cáo Chủ dự án. |

---

## PHẦN 2. GÓI PROMPT GIAO VIỆC CHI TIẾT CHO TỪNG TASK (COPY-PASTE READY)

---

### PROMPT CHO TASK-01 (ĐỢT 1: NỀN DỮ LIỆU, MARKER & FORM THOÁT)
* **Giao cho:** Agent 1 (Data Lead)
* **Model:** Claude 3.5 Sonnet hoặc Gemini 2.0 Pro (Tier 2)
* **Nhánh:** `task/R-P1-D0-nen-du-lieu` (tách từ `origin/feat/sprint-0412`)

```text
Bạn là Agent Nền Dữ Liệu & Bản Đồ cho dự án game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST).
Nhiệm vụ của bạn: Thực hiện gói công việc Đợt 1 (R-P1 + R-D0) trên nhánh task/R-P1-D0-nen-du-lieu.

CÁC NGUYÊN TẮC BẮT BUỘC ĐÃ CHỐT:
1. Gỡ 100% nhãn [PLACEHOLDER] ở 4 vị trí sau:
   - src/content/chapters.ts: Tên Mốc 1 đổi thành "Mốc 1 · Căn cứ đầu tiên (Lớp 6–7)"
   - src/config/hub.ts: Tên ứng dụng nhắn tin đổi thành "AloNhau"
   - src/config/hubRoom.ts: Gỡ chữ giả 6 đồ nền trong thùng carton, dùng câu chữ tự nhiên song hành đã duyệt tại SO_HOA_NARRATIVE_TA_CANH_MOC1.md.
   - src/ui/game/FeedbackForm.tsx: Giữ nguyên 4 câu hỏi + ô góp ý 300 ký tự, xóa sạch nhãn [PLACEHOLDER].
2. Sửa luồng Form phản hồi (FeedbackForm):
   - Không bắt buộc chơi hết Mốc mới mở Form.
   - Sửa sự kiện: Bất cứ lúc nào người chơi bấm nút "Thoát" ở thanh điều hướng/menu là kích hoạt hiển thị FeedbackForm trước khi điều hướng thoát.
3. Cập nhật marker trong src/game/world/map_thcs.extras.ts:
   - Đưa vị trí chụp ảnh Trang 4 về đúng gốc phượng (spot.thcs.phuong_root) và khúc gỗ bãi đất (spot.thcs.field_log).
   - Bổ sung marker còn thiếu: bảng phân lớp, bàn học 3 người P1-3, bụi cây đá cầu P1-4, chỗ đứng chụp trước rãnh & cuối rãnh P2-4/P2-6, tường dán ảnh Căn cứ P4-8.
4. Mở rộng types nếu cần trong src/content/types.ts & validate.ts để đón đầu các trường của Đợt 2 (TitleCard, NarratorBanner, Multi-shot prompts).

TIÊU CHÍ NGHIỆM THU:
Chạy đạt cả 4 lệnh trong worktree:
npx tsc --noEmit && npm test && npm run validate:world && VERCEL_ENV=production npm run build
Kiểm tra chuỗi: không còn chữ [PLACEHOLDER] nào trong bundle sản phẩm. Báo cáo lại cho Role Manager.
```

---

### PROMPT CHO TASK-02 (ĐỢT 2: ĐẠO DIỄN NHÂN VẬT ĐI LẠI & BIỂU CẢM `R-B1`)
* **Giao cho:** Agent 2 (Engine NPC)
* **Model:** Claude 3.7 Sonnet hoặc Claude 3.5 Sonnet (Tier 1)
* **Nhánh:** `task/R-B1-stage-director` (tách từ `origin/feat/sprint-0412` sau khi Đợt 1 đã gộp)

```text
Bạn là Kỹ sư Engine & Đạo diễn NPC cho game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST).
Nhiệm vụ: Triển khai nhánh task/R-B1-stage-director để làm nhân vật cử động và di chuyển sống động như kịch bản.

PHẠM VI SỬA ĐỔI:
- src/game/stageRunner.ts
- src/game/dayScene.ts
- src/actors/character/characterAnimator.ts (nếu cần trigger gesture)

CÁC TÍNH NĂNG & LỖI PHẢI XỬ LÝ:
1. Di chuyển nhân vật theo kịch bản:
   - Trang 1 Cảnh 1: Đức chạy hớt hải từ cổng vào nhặt vở (spot.thcs.gate_drop) rồi dừng đối diện người chơi.
   - Trang 1 Cảnh 2: Đức đi trước dẫn đường từ cổng -> bảng phân lớp -> cửa lớp học (có cơ chế chờ nếu người chơi tụt lại xa).
   - Trang 2 Cảnh 1-2: Đức & Châu đứng dưới hiên, Đức đi dọc hiên sang đầu hiên nơi Hạ & Quân đang gấp thuyền.
   - Trang 4 Cảnh 1: Hạ đi trước dẫn nhóm ra gốc phượng.
2. Ẩn / Hiện nhân vật theo nhịp phân cảnh:
   - Cuối Trang 1 Cảnh 5: Sau khi lau bảng xong, Châu nói câu chào rồi đi ra cửa và tự ẩn đi (rời khỏi cảnh).
   - Chuyển cảnh Trang 1 Cảnh 5 -> Cảnh 6: Dịch chuyển cụm nhân vật mượt mà từ trong lớp học ra bậc thềm tiệm tạp hóa ngoài cổng trường.
3. Kích hoạt biểu cảm & thế đứng (Gestures / Postures):
   - Đảm bảo các hàm gọi gesture chữ V, tada, reo mừng của Đức và vẫy tay của Châu/Hạ kích hoạt đúng lúc phát dòng thoại tương ứng.
4. Đội hình chụp ảnh Trang 4 Cảnh 4:
   - Các nhân vật tự di chuyển mượt mà vào đúng vị trí sau khi người chơi bấm chốt đội hình hoặc sau khi bấm Bỏ qua.

TIÊU CHÍ NGHIỆM THU:
Chạy pass 5 lệnh kiểm tra: npx tsc --noEmit && npm test && npm run validate:world && VERCEL_ENV=production npm run build && npx playwright test --workers=1.
Báo cáo kết quả cho Role Manager.
```

---

### PROMPT CHO TASK-03 (ĐỢT 2: CHUYỂN CẢNH, THẺ CHỮ & GIAO DIỆN NARRATIVE `R-B2`)
* **Giao cho:** Agent 3 (UI/UX Lead)
* **Model:** Claude 3.5 Sonnet hoặc GPT-4o (Tier 2)
* **Nhánh:** `task/R-B2-transition-ui` (tách từ `origin/feat/sprint-0412` sau khi Đợt 1 đã gộp)

```text
Bạn là Kỹ sư UI & Chuyển cảnh cho game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST).
Nhiệm vụ: Triển khai nhánh task/R-B2-transition-ui để hoàn thiện hệ thống hiển thị dẫn chuyện và thẻ chữ.

PHẠM VI SỬA ĐỔI:
- src/ui/game/TitleCardOverlay.tsx (tạo mới / hoàn thiện)
- src/ui/game/NarratorBanner.tsx (tạo mới - dải hiển thị Narrative tách biệt thoại)
- src/ui/game/KeyHintCard.tsx (bảng phím hướng dẫn tự tắt)
- src/game/CameraManager.ts (camera dolly)
- src/game/dayScene.ts (đổi tên khu động & đổi thời tiết mưa)

CÁC TÍNH NĂNG & LỖI PHẢI XỬ LÝ:
1. Thẻ chữ 2 dòng (TitleCardOverlay):
   - Hiển thị chữ trắng lớn giữa màn hình nền mờ: Dòng 1 tiêu đề đậm, Dòng 2 thời gian/bối cảnh nghiêng.
   - Fade in 0.5s -> Giữ 2.5s -> Fade out 0.5s cho các cảnh: P1-1, P1-6, P2-1, P3-1, P4-1, P4-8.
2. Dải hiển thị Narrative bối cảnh hệ thống (NarratorBanner):
   - ĐẶC BIỆT QUAN TRỌNG: Tách biệt hoàn toàn với bong bóng thoại nhân vật (DialogueBox).
   - Nằm ở dải phụ đề đáy màn hình, chữ nghiêng trang trọng, nền mờ đen 60%, không hiển thị tên nhân vật hay avatar. Kích hoạt khi line.speaker === 'narrator' hoặc có narrative_overlay.
3. Đổi tên khu vực động (Zone Name Override):
   - Tại Trang 3: Khi mới bước vào là "Góc sân sau". Sau khi hoàn thành bước kê bàn ghế dọn dẹp (s04), tên khu vực chính thức đổi thành "Căn cứ bí mật" với thông báo reo mừng.
4. Camera dolly & Hướng dẫn:
   - Camera chuyển cảnh có dolly nhẹ (dollyTo), không giật cắt góc 180 độ.
   - Bảng hướng dẫn phím WASD / Chuột hiện 5 giây lần đầu rồi tự tắt mượt mà.
   - Bỏ trạng thái khóa chân khi nhân vật đang dẫn đường để người chơi tự do chạy theo.

TIÊU CHÍ NGHIỆM THU:
Chạy pass 5 lệnh kiểm tra: npx tsc --noEmit && npm test && npm run validate:world && VERCEL_ENV=production npm run build && npx playwright test --workers=1.
Báo cáo kết quả cho Role Manager.
```

---

### PROMPT CHO TASK-04 (ĐỢT 2: CHỤP ẢNH NÂNG CAO & ĐẠO CỤ CẦM TAY `R-B3`)
* **Giao cho:** Agent 4 (Gameplay 3D)
* **Model:** Claude 3.5 Sonnet (Tier 2)
* **Nhánh:** `task/R-B3-photo-props` (tách từ `origin/feat/sprint-0412` sau khi Đợt 1 đã gộp)

```text
Bạn là Kỹ sư Gameplay & Props cho game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST).
Nhiệm vụ: Triển khai nhánh task/R-B3-photo-props để nâng cấp cơ chế chụp ảnh và hiển thị đạo cụ cầm tay.

PHẠM VI SỬA ĐỔI:
- src/game/photoRunner.ts
- src/ui/game/PhotoOverlay.tsx
- src/actors/character/props.ts

CÁC TÍNH NĂNG & LỖI PHẢI XỬ LÝ:
1. Cơ chế chụp ảnh tự sướng 3 lần (Trang 1 Cảnh 8):
   - Bỏ hardcode MULTI_SHOT. Cho phép cấu hình số lần chụp (shots: 3).
   - Lời nhắc hiển thị riêng biệt từng lần bấm:
     + Lần 1: "Quay ngược máy, đoán khung rồi bấm chụp"
     + Lần 2: "Lệch rồi! Chỉnh hướng máy, bấm lại"
     + Lần 3: "Lần cuối: Cố canh đủ ba người"
   - Giao diện chọn giữ 1 trong 3 tấm để dán vào Album.
2. Hẹn giờ 10s & Thoại phản ứng Trang 4 (P4-5):
   - Cơ chế đếm ngược 10 giây (tiếng bíp bíp dồn dập).
   - Thoại chen lúc đếm ngược và thoại sau khi chụp thay đổi đúng theo 3 kiểu ảnh đã chọn (Nhí nhố / Tự nhiên / Nghiêm trang).
3. Đạo cụ cầm tay (Character Props):
   - Đảm bảo hàm setActorProp gắn đúng mô hình 3D lên tay nhân vật: Vở bài tập (Đức nhặt P1-1), quả cầu (Châu cầm P1-4), thuyền giấy (Hạ & người chơi P2-3/P2-6), sổ bìa xanh & bút đỏ (Châu & người chơi P3-6), biển tên Căn cứ (Đức cầm P3-7), máy ảnh (Đức trao cho người chơi P4-1).
4. Phục hồi ảnh vào Album:
   - Ảnh lưu vào Album ở Trang 2 (5 chiếc thuyền) và Trang 3 (tấm biển Căn cứ) phải lấy trực tiếp từ bức ảnh thật người chơi vừa bấm chụp (gameplay_photo), thay vì ảnh tĩnh minh họa có sẵn.

TIÊU CHÍ NGHIỆM THU:
Chạy pass 5 lệnh kiểm tra: npx tsc --noEmit && npm test && npm run validate:world && VERCEL_ENV=production npm run build && npx playwright test --workers=1.
Báo cáo kết quả cho Role Manager.
```

---

### PROMPT CHO TASK-05 (ĐỢT 2: BIẾN ĐỔI 3D TẠI CHỖ & SFX `R-B4`)
* **Giao cho:** Agent 5 (World & Audio)
* **Model:** Claude 3.5 Sonnet hoặc Gemini 2.0 Pro (Tier 2)
* **Nhánh:** `task/R-B4-transforms-sfx` (tách từ `origin/feat/sprint-0412` sau khi Đợt 1 đã gộp)

```text
Bạn là Kỹ sư Thế giới 3D & Âm thanh cho game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST).
Nhiệm vụ: Triển khai nhánh task/R-B4-transforms-sfx xử lý biến đổi môi trường và âm thanh bối cảnh.

PHẠM VI SỬA ĐỔI:
- src/game/dayController.ts
- src/game/m1_*.ts
- src/audio/sfx.ts (hoặc audioController.ts)

CÁC TÍNH NĂNG & LỖI PHẢI XỬ LÝ:
1. Khảo sát Căn cứ Trang 3 (P3-3):
   - Không dùng 1 câu thoại chung khi xem các điểm. Hỗ trợ lines_by_target riêng cho từng vị trí: Mái che, Gốc cây, Đống thùng giấy.
   - Hiển thị bộ đếm mục tiêu 0/3 trên HUD và hoàn thành khi đã đi đủ 3 điểm theo thứ tự bất kỳ.
2. Hiện đồ trang trí Căn cứ tức thì (P3-5):
   - Khi người chơi chọn 1 trong 3 phong cách (Giấy màu / Hoa dại / Dây ảnh), các vật phẩm trang trí 3D tương ứng phải xuất hiện ngay lập tức trong cảnh mà không cần tải lại hay chờ đổi cảnh.
3. Rãnh nước Trang 2 (P2-4 và P2-6):
   - Tách biệt rõ 2 cụm: Ban đầu có 5 chiếc thuyền giấy xếp mép rãnh để chụp ảnh (P2-4). Sau cuộc đua, 4 chiếc trôi đi mất, chỉ còn đúng 1 chiếc thuyền của Hạ bị mắc lại ở cuối rãnh nước để người chơi đi tới vớt (P2-6).
4. Tích hợp SFX cơ bản (SFX-1):
   - Kích hoạt âm thanh theo sfxCue từ SO_HOA_NARRATIVE_TA_CANH_MOC1.md: Tiếng rơi "bịch" của cuốn vở (P1-1), 3 tiếng trống trường rộn rã (P1-4, P2-6), tiếng flash máy ảnh "tách", tiếng sột soạt mở thùng carton (Hub).

TIÊU CHÍ NGHIỆM THU:
Chạy pass 5 lệnh kiểm tra: npx tsc --noEmit && npm test && npm run validate:world && VERCEL_ENV=production npm run build && npx playwright test --workers=1.
Báo cáo kết quả cho Role Manager.
```

---

### PROMPT CHO TASK-06 (ĐỢT 2: MINIGAME GẤP THUYỀN & VIẾT ĐIỀU ƯỚC `R-B5`)
* **Giao cho:** Agent 6 (Minigame)
* **Model:** Claude 3.7 Sonnet hoặc Claude 3.5 Sonnet (Tier 1)
* **Nhánh:** `task/R-B5-boat-minigame` (tách từ `origin/feat/sprint-0412` sau khi Đợt 1 đã gộp)

```text
Bạn là Kỹ sư Minigame cho game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST).
Nhiệm vụ: Xây dựng minigame mới ở Trang 2 Cảnh 3 trên nhánh task/R-B5-boat-minigame (kế thừa khung shared tại src/game/minigames/shared/).

YÊU CẦU ĐẶC THÙ (BẮT BUỘC ĐỦ 3 NHỊP LIỀN MẠCH):
1. Nhịp 1: Minigame Gấp Thuyền Giấy
   - Giao diện 2D/3D đẩy sát vào tờ giấy vuông phẳng trên bàn/hiên.
   - Người chơi thực hiện thao tác (kéo vuốt ngón tay / chuột) theo các đường nếp gấp nét đứt để gấp tờ giấy thành hình chiếc thuyền có cánh buồm trắng.
   - Thao tác đơn giản, không có cơ chế "Game Over", có hiệu ứng âm thanh vuốt nếp giấy "xoẹt".
2. Nhịp 2: Chọn Điều Ước Viết Lên Buồm
   - Bật giao diện lựa chọn 1 trong 3 điều ước:
     + 1. "Mai mốt vẫn chơi chung vầy." (Ấm áp)
     + 2. "Lớp 7 vui hơn lớp 6." (Rộn ràng)
     + 3. "Bí mật không nói ra." (Sâu lắng)
3. Nhịp 3: Tự Ghi Điều Ước Lên Cánh Buồm
   - Cầm bút tự di chuột / kéo nét để dòng chữ điều ước vừa chọn hiện lên sống động trên cánh buồm chiếc thuyền giấy vừa gấp xong.
   - Chiếc thuyền hoàn chỉnh với đúng dòng chữ này sẽ được truyền tiếp sang cảnh đua thuyền P2-5 và lưu vào kệ sách Hub sau khi hết Trang 2.

TIÊU CHÍ NGHIỆM THU:
Chạy pass 5 lệnh kiểm tra: npx tsc --noEmit && npm test && npm run validate:world && VERCEL_ENV=production npm run build && npx playwright test --workers=1.
Báo cáo kết quả cho Role Manager.
```

---

### PROMPT CHO TASK-07 (ĐỢT 3: SỐ HÓA TOÀN BỘ KỊCH BẢN 4 TRANG + HUB `R-D1…D4`)
* **Giao cho:** Agent 7 (Content/Data)
* **Model:** Gemini 2.0 Flash / Pro hoặc Claude 3.5 Haiku / Sonnet (Tier 2)
* **Nhánh:** `task/R-D-so-hoa-moc1` (tách từ `origin/feat/sprint-0412` sau khi Đợt 1 và Đợt 2 đã gộp xong)

```text
Bạn là Chuyên viên Số hóa Nội dung Kịch bản cho game 3D "Vùng Ký Ức" (repo KusaThaor/GAME-KNDMST).
Nhiệm vụ: Đổ toàn bộ dữ liệu thoại, narrative và kịch bản chuẩn vào các file code nội dung trên nhánh task/R-D-so-hoa-moc1.

HAI NGUỒN CHÂN LÝ DUY NHẤT:
1. docs/handoff/TONG_DUYET_MOC1_HUB_VA_HANH_DONG_THIEU.md (Kịch bản duyệt liền mạch)
2. docs/handoff/SO_HOA_NARRATIVE_TA_CANH_MOC1.md (Bảng mã narrative, thẻ chữ & thoại song hành)

PHẠM VI FILE THỰC HIỆN:
- src/content/hub.ts (q_hub_pd_01, q_hub_pd_04, PDES phản ứng khi về phòng sau Trang 1–4, kết Mốc 1)
- src/content/days/d_g06_01.ts (Trang 1 trọn vẹn P1-1…P1-8)
- src/content/days/d_g07_01.ts (Trang 2 trọn vẹn P2-1…P2-6, nối minigame gấp thuyền P2-3)
- src/content/days/d_g07_02.ts (Trang 3 trọn vẹn P3-1…P3-8)
- src/content/days/d_g07_03.ts (Trang 4 trọn vẹn P4-1…P4-8)

CÁC ĐIỂM SỬA QUAN TRỌNG ĐÃ CHỐT PHẢI TUÂN THỦ 100%:
1. Trang 1 Cảnh 3: Câu thoại của Châu bắt buộc dùng câu đã duyệt: "Lo chép bài đi, chút ra chơi rồi tính tiếp."
2. Trang 3: ĐẢO THỨ TỰ BƯỚC: Bước dọn dẹp và kê bàn ghế (s04 mg_base_build) PHẢI XẢY RA TRƯỚC bước chọn kiểu trang trí (s03 c_m1_03_decor).
3. Đồ nền thùng Hub 2026: Tuân thủ cơ chế Song Hành (dòng dẫn tả cảnh narrator + dòng độc thoại người chơi player).
4. Giữ nguyên từng từ lóng gốc đã duyệt: "hư cấu", "Chốt!", "Châu Tổng".
5. Không tự ý bịa thêm câu thoại hoặc cắt xén bất kỳ từ ngữ nào ngoài 2 tài liệu chân lý.

TIÊU CHÍ NGHIỆM THU:
Chạy pass 5 lệnh kiểm tra: npx tsc --noEmit && npm test && npm run validate:world && VERCEL_ENV=production npm run build && npx playwright test --workers=1.
Báo cáo kết quả cho Role Manager.
```

---

## PHẦN 3. QUY TRÌNH CHỐT PHIÊN CỦA ROLE MANAGER (KHI CHỦ DỰ ÁN NHẮN "CHỐT PHIÊN")

Bất cứ khi nào **Chủ dự án nhắn tin yêu cầu "chốt phiên"** (kết thúc ca làm việc hoặc nghiệm thu đợt), Role Manager PHẢI thực hiện ngay lập tức quy trình 4 bước chuẩn sau:

```bash
# 1. Chạy lại toàn bộ 5 lệnh kiểm tra bảo vệ chất lượng repo
npx tsc --noEmit
npm test
npm run validate:world
VERCEL_ENV=production npm run build
npx playwright test --workers=1

# 2. Kiểm tra trạng thái git và dọn sạch worktree tạm
git status
git branch

# 3. Commit toàn bộ thay đổi với thông điệp chuẩn mực và push lên remote
git add .
git commit -m "chore(sprint): chot phien lam viec [NGAY-THANG] - tong hop tien do Moc 1"
git push origin <ten-nhanh-dang-lam>

# 4. Gửi báo cáo nghiệm thu súc tích cho Chủ dự án theo mẫu bên dưới
```

### MẪU BÁO CÁO CHỐT PHIÊN CHO CHỦ DỰ ÁN:
```text
BÁO CÁO CHỐT PHIÊN LÀM VIỆC — [NGÀY/THÁNG/NĂM]
Kính gửi Chủ dự án, Role Manager xin báo cáo tổng kết phiên:

1. Tiến độ các Task:
   - TASK-00 (Nền RF-3): [ĐÃ GỘP / ĐANG CHỜ]
   - TASK-01 (Đợt 1 Nền dữ liệu & Form): [HOÀN THÀNH / ĐANG CHẠY]
   - TASK-02…06 (Đợt 2 Kỹ thuật song song): [Liệt kê trạng thái từng nhánh R-B1…R-B5]
   - TASK-07 (Đợt 3 Số hóa kịch bản): [CHỜ ĐỢT 2 / ĐANG CHẠY]

2. Kết quả chạy bộ 5 lệnh kiểm định (Gatekeeper):
   - npx tsc --noEmit: PASS
   - npm test: PASS (X/X tests)
   - npm run validate:world: PASS
   - VERCEL_ENV=production npm run build: PASS (0 [PLACEHOLDER] trong bundle)
   - npx playwright test: PASS

3. Trạng thái Git:
   - Đã commit và push an toàn lên nhánh: origin/<tên-nhánh> (Commit SHA: <mã-commit>)
   - Không push --force, working tree sạch hoàn toàn.
```
