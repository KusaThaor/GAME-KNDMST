# DEMO_AUDIT — Kiểm toán bản demo playtest 04/12

| Trường | Giá trị |
|---|---|
| Lập ngày | 21/11/2026 (UTC+7), phiên Chặng 2 · cập nhật cùng ngày (tối): chủ dự án đã chốt 3 điểm ở §3.4 và §6.5 |
| Chuẩn đối chiếu | `docs/gdd/` trên nhánh `docs/sync-approved-gdd-v1` @ `1e625f1` (GDD v1.0 APPROVED 20/11 + v1.2-draft Trang 6 CHỐT 21/11) |
| Code đã kiểm | `origin/feat/sprint-0412` @ `09204f5` (21/11) |
| Asset đã kiểm | `origin/feature/asset-workshop` @ `51baf28` (16/11) |
| Cách kiểm | Đọc trực tiếp mã nguồn trong repo + **chạy thật** `tsc`, `vitest`, `validate:world`, `build` production + **đo trực tiếp** file GLB bằng script đọc header glTF. Không lấy số từ báo cáo cũ |
| Nhãn | **[Hoàn thành]** · **[Đang dở dang]** · **[Code lệch GDD v1.0]** · **[Chưa code]** · **[Chưa xác minh]** |

## 0. Bản đồ nhánh và baseline

| Nhánh | Commit mới nhất | Ngày | Vai trò thực tế |
|---|---|---|---|
| `main` | `4adf991` | 14/11 | Chỉ có scaffold. Không có `docs/`, không có `public/assets/`, 18 file `src/` |
| `dev` | `4f681cb` | 15/11 | Khung F0–F10 (59 file `src/`). Không phải tổ tiên của `feat/sprint-0412`, nhưng **không có file `src/` nào chỉ tồn tại ở `dev`** |
| `feature/s2-world-camera-blender` | `6307e00` | 17/11 | Nhánh S2 (bản đồ, camera, điều khiển): 78 file `src/` |
| **`feat/sprint-0412`** | **`09204f5`** | **21/11** | **Baseline code**: S2 + gộp GDD + chỉnh 4 điểm lệch GDD. 79 file `src/`. Hơn `dev` 41 file đổi (+3.445 / −255 dòng) |
| **`docs/sync-approved-gdd-v1`** | **`1e625f1`** | **21/11** | **Baseline tài liệu**: GDD v1.0 + 4 commit Trang 6 Valentine (đã gộp và push trong phiên này) |
| `feature/asset-workshop` | `51baf28` | 16/11 | Xưởng asset (nhân vật, cây, bàn, bảng). Chưa gộp vào nhánh code |
| `wip/asset-workshop-backup` | `5953235` | 21/11 | Bản lưu tạm tiến trình asset trên máy Windows |

**Hai bản tài liệu đang ở hai nơi khác nhau:** `feat/sprint-0412` chứa `docs/gdd/` ở phiên bản `cb2d81e` (trước khi có 4 commit Valentine). Nghĩa là **nhánh code chưa có các quyết định Trang 6 ngày 21/11**. Việc đầu tiên của phiên code sau: gộp `docs/sync-approved-gdd-v1` → `feat/sprint-0412`.

### Kết quả chạy thật hôm nay (21/11, trên máy ảo Linux của phiên này)
```
npx tsc --noEmit                      → ĐẠT, 0 lỗi
npm run validate:world                → map_thcs: 6 khu, 0 lỗi, 0 nhắc
npx vitest run                        → 266 đạt / 1 bỏ qua (23 file đạt, 1 file bỏ qua)
VERCEL_ENV=production npm run build   → ĐẠT (game-j5VTQrHT.js 889 KB, gzip 250 KB)
grep botStep|__game|gameTools dist/   → không thấy (bản production sạch công cụ test)
npm run test:e2e                      → KHÔNG CHẠY ĐƯỢC ở đây: môi trường này không tải được
                                        trình duyệt Playwright (chặn mạng). Phải chạy trên máy thật.
```
**Chưa xác minh:** e2e (37 ca), FPS trên laptop thật, bản preview Vercel, Firestore thật, touchpad/cảm ứng thật.

---

## 1. Ma trận tiến độ (mục a)

### 1.1 Hub — Phòng 2026
| Mục | Nhãn | Bằng chứng (nhánh `feat/sprint-0412` @ `09204f5`) |
|---|---|---|
| Phòng 2026 có 4 vật chạm được (Hộp, Album, Kệ, Điện thoại), góc cố định, rê chuột làm sáng vật | [Đang dở dang] | `src/game/scenes/hubScene.ts` (129 dòng, `buildHubScene`, `screenPoint`, `setBoxOpen`); `src/game/game.ts:355` `input.setLookMode('drag')`. Dựng bằng khối thô, chưa có model Blender, chưa có bàn học và tường ảnh như GDD `00` §2.1 |
| Nhập tên, chọn nam/nữ | [Hoàn thành] (phần khung) | `src/game/game.ts:160–164` (`ui.set({ profile: true })` trong bước `cutscene` của quest mở đầu); `src/core/save.ts` `sanitizePlayerName` (tối đa 12 ký tự, bỏ `{}<>`), `save.profile_done`. Tên chỉ nằm trong localStorage, không vào analytics — đúng GDD `02` §4.1 |
| Hộp Kỷ Vật → chọn kỷ vật sáng → vào ký ức | [Hoàn thành] (phần khung) | `src/systems/hub.ts` (`openArtifact`, `canOpen`), `src/game/game.ts:600–604` (`actions.openArtifact` chỉ chạy khi `flow.state === 'hub_idle'`) |
| Album phục hồi trang, kỷ vật lên kệ sau mỗi Trang | [Hoàn thành] (phần khung) | `src/systems/album.ts`, `src/game/game.ts:393–397` (`presentPde`: `album_restore`, `shelf`, `fragment`, `contact`, `reply`) |
| Điện thoại, nhóm chat, 3 sắc thái tin kết demo | [Đang dở dang] | `src/content/types.ts:76–77` (`phone_ui`, `compose_message`); `src/content/hub.ts:46–48` — 3 sắc thái `playful / gentle / deep` đúng GDD `02` §5.1, nhưng **toàn bộ chữ là `[PLACEHOLDER]`** |
| Chuyển Mốc ("Mấy năm sau…", hộp phấn KV-01) | [Chưa code] | `src/content/hub.ts` chỉ có PDE giả `pde_01…06`; không có bước chuyển Mốc, không có kỷ vật `KV-01`. GDD `00` §4 yêu cầu mốc này giữa Trang 4 và Trang 5 |
| Kết demo: ghi hoàn thành **trước** form phản hồi | [Hoàn thành] (thứ tự đúng) | `src/game/game.ts:380–390` — `save.public_demo_done` được `ReleaseTracker` ghi trước, rồi mới `ui.set({ feedback: true })` + `feedback_shown` |
| Form phản hồi | [Chưa code] | `src/ui/game/GameUi.tsx:252–256`: thẻ chỉ có nút "Bỏ qua", không có câu hỏi nào. `api/` chỉ có `collect.ts` và `health.ts`; `api/_lib/firestore.ts:7` đã khai `COLLECTIONS.feedback` nhưng **không có endpoint nào ghi vào đó**. Đây là bằng chứng kinh doanh của môn học → xem mục 5 |

### 1.2 Chín Trang
Chỉ có **2 Trang** tồn tại dưới dạng dữ liệu, cả hai là nội dung giả. Bằng chứng: `src/content/pack.ts` → `const DAYS = [d0601, d0703]`; `src/content/release.ts` → `test: { memory_day_ids: ['d.g06.01', 'd.g07.03'] }`; `src/content/days/` chỉ có `d_g06_01.ts` và `d_g07_03.ts`.

| Trang | Mã | Nhãn | Bằng chứng / việc còn thiếu |
|---|---|---|---|
| 1 Mật lệnh số 01 | `d.g06.01` | [Đang dở dang] | `src/content/days/d_g06_01.ts` có đúng mã, Main/Side/Daily đều `[PLACEHOLDER]` + nhãn `AI_PROPOSED`. Thiếu: giải mật lệnh (K4), đá cầu (K5), lau bảng (K6), bóp mì gói (K6), cảnh B tạp hóa |
| 2 Thuyền giấy | `d.g07.01` | [Chưa code] | Không có file Ngày. Thiếu rãnh nước Z02b + gấp/thả/đua thuyền (GDD `02` §2.4.2) |
| 3 Căn cứ bí mật | `d.g07.02` | [Chưa code] | Khu `zone_base.glb` đã có trong bản đồ, nhưng không có nội dung, không có Dựng Căn cứ (K3) / Viết luật (K4) |
| 4 Đủ năm đứa | `d.g07.03` | [Đang dở dang] | `src/content/days/d_g07_03.ts` (Side `q_m1_side_02`, điểm `itr.thcs.gutter`, ảnh hẹn giờ). Nội dung giả. **Đây là điểm dừng hiện tại của bản thử** |
| 5 Lên lớp 8 + Caro | `d.g08.01` | [Chưa code] | Không có file Ngày; không có Caro (xem 1.3) |
| 6 Valentine — Hòm thư | `d.g08.02` | [Chưa code] | Không có file Ngày và **không có bất cứ thứ gì của hòm thư Valentine**: tìm `valentine` trong `src/` = 0 kết quả. Đây là phần GDD mới chốt 21/11, khối lượng lớn nhất còn lại (4 cảnh + 3 minigame đầy đủ + 4 nhánh rút gọn) |
| 7 Báo tường + Sudoku | `d.g09.01` | [Chưa code] | Không có Sudoku; tìm `sudoku` trong `src/` = 0 kết quả |
| 8 Rã băng + Hội trại | `d.g09.02` | [Chưa code] | Không có biến thể đêm của sân: `src/world/variants.ts` có preset sáng/chiều, không có preset lửa trại |
| 9 Vẫn đủ năm đứa | `d.g09.03` | [Chưa code] | — |
| Nhãn nhóm Trang trong menu | [Đang dở dang] | `src/content/chapters.ts`: `ch_g06` "Mốc 1 · lớp 6" và `ch_g07` "Mốc 1 · lớp 7" — GDD coi Mốc 1 = lớp 6–7 là **một** Mốc. Nhãn còn `[PLACEHOLDER]` và D-04 chưa chốt nên để vậy được, nhưng cần sửa trước khi đo |

### 1.3 Minigame
| Mục | Nhãn | Bằng chứng |
|---|---|---|
| Khung minigame chung (GDD `02` §1) | [Đang dở dang] | `src/game/game.ts:178–186` + `src/ui/game/GameUi.tsx:212–215`: thẻ `[PLACEHOLDER] Minigame "{game}" (mức min)` với **một nút "Xong"**, luôn trả kết quả `complete`. Không có hướng dẫn luật, thắng/thua/hòa, nút Chơi lại, Bỏ ván, đồng hồ dừng khi Esc. `src/content/types.ts:72` chỉ cho `level: 'min'` — chưa có sổ đăng ký trò theo `game_id` |
| K1 đi–nói–chọn | [Hoàn thành] | `types.ts:65–68` (`talk`, `goto`, `interact`, `choice`); `game.ts` `presentStep`, `proximity` |
| K2 chụp ảnh | [Hoàn thành] | `game.ts:200+` `runPhoto` (chế độ cầm tay/hẹn giờ, 3 dấu, Chụp lại / Giữ ảnh này); `src/config/photo.ts` (JPEG 1024×768 chất lượng 0,85) |
| K3 nhặt–đặt | [Đang dở dang] | `types.ts:69–70` có loại bước `collect`/`place`, nhưng không có màn kéo–thả: tìm trong `src/ui/` = 0 màn đặt đồ |
| K4 ghép cặp–giải mã · K5 canh lực–canh nhịp · K6 giữ để làm | [Chưa code] | Không có file nào trong `src/` hiện thực các luật ở GDD `02` §2.4 |
| Caro 12×12 (Trang 5) | [Chưa code] | tìm `caro` trong `src/` = 0 |
| Sudoku (Trang 7) | [Chưa code] | tìm `sudoku` trong `src/` = 0 |
| 3 minigame Valentine (Ném bóng, Săn góc ảnh, Trang trí Căn cứ) | [Chưa code] | tìm `valentine` trong `src/` = 0 |
| Lật chai, Bắn bi ve, Ô ăn quan, Nhảy lò cò (Tầng B) | [Chưa code] | tìm `bottle`, `marble`, `hopscotch` trong `src/` = 0 |

### 1.4 Bản đồ, nhân vật, điều khiển
| Mục | Nhãn | Bằng chứng |
|---|---|---|
| `map_thcs` 6 khu | [Hoàn thành] | `npm run validate:world` chạy hôm nay: 6 khu, 0 lỗi. Đo trực tiếp 6 GLB: lớp 2.020 · hành lang 978 · sân 3.524 · cổng 1.004 · bãi 2.374 · căn cứ 1.496 tam giác → **tổng ≈ 11.400 tam giác**, rất thoải mái so với ngân sách 150.000 của GDD `03` §1.2 |
| Camera thứ ba + điều khiển (chuột, bàn phím, touchpad, cảm ứng) | [Hoàn thành] trong code, [Chưa xác minh] trên máy thật | `src/config/camera.ts` (`POINTER_INPUT`, `CAMERA_OPTIONS`, pitch 5–65°), `src/game/gestures.ts` (`WheelRouter`), `src/actors/camera/cameraManager.ts`. Chưa ai thử touchpad Windows thật sau bản sửa 16/11 |
| Nhân vật | [Code lệch GDD v1.0] | Xem mục 3.2 — số đo thật |
| Biến thể theo năm học | [Đang dở dang] | `src/world/variants.ts` + `src/content/base.ts`: có bộ trang trí/ánh sáng, nhưng `dayScene.ts` chỉ ánh xạ 2 bộ tuổi (`AGE_G6_7`, `AGE_G8_9` → lớp 6 và 9). Chưa có biến thể đêm Hội trại |
| Cây phượng, cây bàng trong game | [Đang dở dang] | `src/world/school/props.ts` dựng cây bằng code. GLB cây ở nhánh asset **chưa được dùng** ở nhánh code |

---

## 2. Luồng demo hiện tại, từ lúc mở game tới mốc kết thúc (mục b)

Nguồn: `src/main.ts`, `src/game/game.ts`, `src/systems/gameFlow.ts`, `src/systems/release.ts`, `src/core/save.ts`.

| # | Điểm chuyển | Trigger | Điều kiện | Biến đọc / ghi | Bước tiếp | Tải lại trang thì sao |
|---|---|---|---|---|---|---|
| 1 | Mở `/?play=1` | người chơi mở địa chỉ | `main.ts`: `HAS_GAME = RELEASES[__APP_ENV__].memory_day_ids.length > 0`. **Ở production mảng này trống → không vào được game** | đọc `release.ts` | nạp `game/game.ts` | như lần đầu |
| 2 | Hỏi đồng ý thu thập | `tracker.consent === 'unknown'` | — | ghi `localStorage` của tracker | chờ trả lời rồi mới `game_ready` | hỏi lại nếu chưa trả lời |
| 3 | Chọn chỗ bắt đầu | `engine.resume()` | có `save.current.memory_day_id` hay không | đọc `save.current.{memory_day_id, quest_id, step_id, zone_id}` | `boot_resume_day` → vào thẳng Ngày, hoặc `boot_idle` / `boot_new` → về phòng | **đứng lại đúng khu đang đứng** (`zone_id`), quest về đầu bước đang dở |
| 4 | Mở đầu ở phòng 2026 | `flow.state = hub_intro` | `save.quests[intro].state !== 'completed'` | ghi `save.profile_done`, `player_name`, `appearance.gender` | thoại mở đầu → bảng nhập tên → `intro_done` → `hub_idle` | nếu đã nhập tên thì không hỏi lại |
| 5 | Chọn kỷ vật trong Hộp | click vật / nút trong bảng Hộp | `flow.state === 'hub_idle'` **và** `hub.canOpen(artifact_id)` (kỷ vật đang `glowing`) | đọc `save.artifacts`, ghi `save.current.memory_day_id`, `save.days[id].state = 'in_progress'` | `open_day` → `goDay()` | kỷ vật vẫn sáng, chọn lại được |
| 6 | Vào ký ức | `goDay()` | nạp được `WORLD_MANIFESTS[map_id]`; nếu lỗi → mặt bằng tạm + toast báo | ghi `save.current.zone_id`, phát `page_started`, `zone_entered` | `scene_ready` → `memory_day` | vào lại Ngày đó, không phát lại `page_started` |
| 7 | Đi lại, tới gần mục tiêu | `proximity()` mỗi khung hình | `near && !inside.has(id) && !locked()` | engine `trigger('arrive', id)` | bước `goto` xong → bước kế | **có lỗi A-01 ở đây** (mục 5) |
| 8 | Nói chuyện / chọn câu | `E` hoặc click khi có gợi ý; `Space` sang câu; `1/2/3` chọn | `!locked()` | ghi `save.quests[id].{step_id, progress}`, `save.flags`, `relationships.tone_counts`; phát `quest_step_completed`, `choice_made` | bước kế trong `main_chain` | về đầu bước đang dở (`reconcileSave`) |
| 9 | Chụp ảnh chính | bước `photo` | có marker máy ảnh trong bản đồ; **thiếu marker thì bước tự xong, không chặn quest** | ghi ảnh JPEG vào IndexedDB, `save.album[entry].variants`; phát `photo_attempt`, `photo_kept` | "Giữ ảnh này" → bước kế | ván chụp bắt đầu lại |
| 10 | Hết Trang | engine phát `day_completed` khi xong bước Main cuối | nếu còn Side đang mở → hỏi "Còn việc chưa làm, đi tiếp không?" (`day_end_prompt`) | ghi `save.days[id].state = 'completed'`; phát `page_completed` (+ `duration_s` nếu thấy `page_started` trong cùng lần chạy) | thẻ "Hết Trang" → `continueDayEnd()` → `goHub()` | nếu đã `completed` thì không mở lại Ngày |
| 11 | Về phòng 2026 | `goHub()` → `hubSettle()` | lặp tối đa 6 vòng: `drain()` → `hub.runPdes()` | ghi `save.pde_done`, `save.album[...].status`, `save.artifacts[...] = 'on_shelf'` | thông báo "Trang Album hiện rõ", "kỷ vật lên kệ", kỷ vật kế tiếp sáng | lặp lại được, PDE đã chạy không chạy lại |
| 12 | Điểm dừng bản thử | `ReleaseTracker` (`src/systems/release.ts`) | `end_day_id = 'd.g07.03'`, `end_step_id = 'q_hub_pd_03.s01'` | ghi `save.public_demo_done = true`; phát **`public_demo_completed`** | — | giữ nguyên |
| 13 | Màn kết + form | `hubSettle()` thấy `public_demo_done && !flags['hub.demo_end_seen']` | luôn sau bước 12 → **đúng yêu cầu "ghi hoàn thành trước form"** | ghi `flags['hub.demo_end_seen']`; phát `feedback_shown` | thẻ phản hồi (hiện chỉ có nút Bỏ qua) | không hiện lại |

**Tự lưu** (`src/core/save.ts` `attachAutosave`): khi engine phát `save_requested` (ranh giới bước), khi `hub_entered`, khi `part_started`. Thêm: đổi khu trong Ngày cũng lưu (`game.ts` `scene.onZoneChange`).

**Mốc kết thúc demo theo GDD** (`00` §4) là gửi tin nhắn ở cuối Trang 9. **Mốc kết thúc trong code hiện tại** là hết Trang 4 (`d.g07.03`). Đây là một trong hai điểm **CẦN CHỐT** ở mục 6.

---

## 3. Asset 3D (mục c)

### 3.1 Số đo thật (đọc trực tiếp header glTF của từng file, 21/11)
**Nhánh code `feat/sprint-0412`** — `public/assets/`:

| File | Tam giác | Dung lượng | `min.y` | Ngân sách GDD `03` §1.2 | Kết quả |
|---|---|---|---|---|---|
| `props/prp_desk_2seat.glb` | 232 | 16 KB | **−0,663** | đồ vừa: 1.500 tam giác / 150 KB | tam giác/dung lượng ĐẠT; **gốc tọa độ SAI** (GDD `03` §1.1 bắt `min.y = 0`; file này có gốc ở mặt bàn) |
| `world/map_thcs/zone_yard.glb` | 3.524 | 139 KB | −2,0 | module kiến trúc: 5.000 / 400 KB | ĐẠT |
| `zone_classroom.glb` | 2.020 | 138 KB | −2,0 | như trên | ĐẠT |
| `zone_field.glb` | 2.374 | 80 KB | −2,0 | như trên | ĐẠT |
| `zone_base.glb` | 1.496 | 60 KB | −2,0 | như trên | ĐẠT |
| `zone_gate.glb` | 1.004 | 80 KB | −3,6 | như trên | ĐẠT |
| `zone_corridor.glb` | 978 | 75 KB | −2,0 | như trên | ĐẠT |

(`min.y` âm ở các khu là **cố ý**: phần móng nằm dưới mặt sàn. Quy ước `min.y = 0` áp cho đồ vật rời, nên chỉ cái bàn là lỗi thật.)

**Nhánh `feature/asset-workshop`** — `assets/`:

| File | Tam giác | Dung lượng | Cao (m) | Xương | Hoạt ảnh | So với GDD |
|---|---|---|---|---|---|---|
| `characters/vietnamese_student.glb` | 3.548 | 310 KB | **0,695** | 20 | 16 | cao sai (cần 1,30–1,50 m); tam giác/dung lượng ĐẠT cho nhân vật chính (≤ 6.000 / 1,5 MB) |
| `characters/vietnamese_student_base.glb` | 3.548 | 310 KB | 0,695 | 20 | 16 | **trùng byte** với file trên (md5 giống nhau) |
| `characters/vietnamese_student_skinned.glb` | 3.548 | 310 KB | 0,695 | 20 | 16 | **trùng byte** với hai file trên |
| `characters/character_a.glb` | 3.528 | 340 KB | 0,629 | 20 | 16 | cao sai |
| `characters/character_b.glb` | 3.772 | 345 KB | 0,689 | 20 | 16 | cao sai |
| `characters/character_c.glb` | 3.314 | 336 KB | 0,771 | 20 | 16 | cao sai |
| `props/schoolyard_flamboyant_tree.glb` | **12.224** | 305 KB | 7,056 | — | — | vượt 4 lần ngân sách cây (3.000 / 200 KB) |
| `props/schoolyard_shade_tree.glb` | 12.224 | 305 KB | 7,056 | — | — | **trùng byte hoàn toàn với cây phượng** (md5 `fc7a3c80…` giống nhau) |
| `props/schoolyard_tropical_tree.glb` | 8.224 | 220 KB | 5,380 | — | — | vượt ngân sách |

**Sai ghi công:** `docs/ASSET_CREDITS.md` trên nhánh asset ghi `schoolyard_shade_tree.glb` là `CommonTree_1` của Quaternius scale lên 5,20 m, còn `schoolyard_flamboyant_tree.glb` là `CommonTree_Autumn_1` scale lên 5,30 m. Thực tế hai file **giống nhau từng byte** và cao **7,056 m**. File credits cũng ghi tiêu đề "Giai đoạn 2012–2013", trái với CONFIRMED 20/11 (lớp 6 = năm học 2014–2015). Ngoài ra credits coi `schoolyard_tropical_tree.glb` (Kenney) **là cây bàng** (*Terminalia catappa*), trong khi `docs/AUDIT_AND_ROADMAP.md` lại định làm cây bàng từ `shade_tree` — hai tài liệu không khớp nhau.

**Nhánh code chưa có file ghi công nào** (`git ls-files | grep -i credit` = rỗng), trong khi GDD `03` §1.1 bắt buộc có `CREDITS.md`. Khi gộp asset phải mang theo `ASSET_CREDITS.md` đã sửa.

### 3.2 Nhân vật: ba số khác nhau cho cùng một yêu cầu
Đo bằng chính code của game (`codeRigAdapter.create(...).height`, chạy thật hôm nay):

| | lớp 6 | lớp 9 | GDD `03` §1.3 yêu cầu |
|---|---|---|---|
| Player nam / nữ | 1,390 / 1,381 | 1,632 / 1,610 | 1,30–1,40 (lớp 6–7) · 1,40–1,50 (lớp 8–9) |
| Đức | 1,385 | 1,607 | |
| Quân | **1,447** | **1,727** | |
| Châu | 1,389 | 1,610 | |
| Hạ | 1,364 | 1,579 | |

→ Nhân vật **lớp 6 gần đúng** (chỉ Quân cao 1,447 m, vượt 1,40 m). Nhân vật **lớp 9 cao hơn GDD 0,1–0,23 m**. Còn model GLB ở nhánh asset thì **chỉ cao 0,63–0,77 m**. Ba con số, ba nơi.

Hàm kiểm đã có sẵn: `src/actors/player/rigAdapter.ts` → `checkAvatarHeight()` và `AVATAR_HEIGHT_RANGE_M`; test `tests/unit/rigAdapter.test.ts` đã khẳng định 0,7 m là sai.

### 3.3 Kiểm code nạp model
| Yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| Chạm đất `min.y = 0` | **Chưa có** trong code nạp: không chỗ nào tính `Box3` rồi dịch model xuống sàn. Chỉ có *hợp đồng viết trong chú thích* ở `rigAdapter.ts` | `src/render/assets.ts` (`toonify`, `loadProp`) không có bước chuẩn hóa gốc |
| Đổ bóng | ĐẠT | `src/render/assets.ts` `toonify` đặt `castShadow`/`receiveShadow`; `src/render/stage.ts:23–24` bật `shadowMap` (PCFSoft) |
| SRGB | ĐẠT | `src/render/stage.ts:20` `renderer.outputColorSpace = SRGBColorSpace`; `src/render/canvasTex.ts:10` đặt `colorSpace` cho texture vẽ bằng canvas |
| Toon 3 bậc | ĐẠT | `src/render/materials.ts` — `gradientMap` đúng 3 bậc (150 / 212 / 255), có viền nét `outlineParameters` |
| `dispose()` khi đổi Trang | ĐẠT cho bản đồ và cảnh | `src/world/world.ts:199–210` (`dispose` giải phóng geometry, material, texture, sàn); `src/game/view.ts:75–81`; `src/game/scenes/hubScene.ts:119,127` |
| **Bẫy sắp tới** | `loadProp()` giữ cache theo URL ở cấp module và trả `clone(true)` (dùng chung geometry). `World.dispose()` lại `dispose()` geometry của mọi mesh trong `root`. Hiện chưa nổ vì `loadProp` **chỉ dùng ở trang thử** `src/lab/yardScene.ts:78`. Khi đưa props Blender vào `dayScene`, vào Ngày lần thứ hai props sẽ mất hoặc lỗi WebGL | `src/render/assets.ts` + `src/world/world.ts:199` |

### 3.4 Hướng asset — hai đường, **chưa chọn**
Dữ liệu thật để quyết: nhánh asset **đã có một bộ xương dùng chung** (20 xương, 16 hoạt ảnh, cùng skin) và 3 biến thể `character_a/b/c` sinh ra từ cùng nhà máy (`blender/character_prototype/factory/character_factory.py`). Chỗ cắm model trong game cũng đã có (`DaySceneOptions.rigAdapter`), nên đổi nhân vật **không phải sửa** controller, camera hay chụp ảnh.

| | **Đường A — dùng bộ base mesh + xương chung, phụ kiện gắn bằng code** | **Đường B — sửa từng `.glb` bằng tay trong Blender** |
|---|---|---|
| Việc phải làm | Thêm hệ số chuẩn hóa chiều cao trong `character_factory.py` (hiện mọi kích thước là số cứng rải rác, ví dụ `cap.scale = (0.42, 0.40, 0.32)`), xuất lại 1 base + preset cho 5 nhân vật; viết `glbRigAdapter` map 16 hoạt ảnh sang `Motion` của `animate.ts` | Mở từng model trong Blender, scale và sửa riêng 5 nhân vật, kiểm từng bộ xương, xuất 5 GLB; vẫn phải viết `glbRigAdapter` |
| Chi phí ước tính | **2–3 ngày** (1 ngày Blender + 1 ngày code adapter + nửa ngày kiểm) | **5–7 ngày**, phần lớn là việc tay |
| Lợi | Một bộ xương → hoạt ảnh làm một lần dùng cho cả 5 người (đúng GDD `03` §1.3 "một bộ xương dùng chung"); đổi khăn quàng / áo thun Hội trại bằng cờ, không xuất lại model | Kiểm soát hình dáng từng nhân vật tốt hơn; không phụ thuộc script |
| Rủi ro | Phải kiểm lại trọng số skin sau khi scale; 5 người nhìn dễ giống nhau nếu phụ kiện ít | Hoạt ảnh phải đồng bộ 5 lần; sửa về sau tốn công gấp 5; dễ lệch chuẩn giữa các model |
| Giữ được gì | Nhân vật dựng bằng code vẫn chạy làm phương án dự phòng trong cả hai đường | như bên trái |

> **CHỐT 21/11 (tối) — chủ dự án chọn Đường A:** base mesh + bộ xương chung, phụ kiện gắn bằng code. Task 3D của Chặng 3 lên theo đường này. Nhân vật dựng bằng code giữ làm phương án dự phòng cho bản đo.

---

## 4. Lưu trữ và số liệu đo (mục d)

| Mục | Nhãn | Bằng chứng |
|---|---|---|
| localStorage: tiến trình | [Hoàn thành] phần cơ bản | `src/core/save.ts`: khóa `htx.save`, `SAVE_VERSION = 2`, `SaveStore.load/persist/wipe`, `reconcileSave` (bước đã bị xóa → về đầu quest; Ngày đã xong không mở lại) |
| **Bước chuyển đổi bản lưu** | [Code lệch GDD v1.0] | `save.ts` `load()`: `if (p.v !== SAVE_VERSION) { this.drop(); … 'reset_old_version' }` → **tăng số phiên bản là xóa sạch tiến trình người chơi**. GDD `02` §4.1 yêu cầu "khi đổi cấu trúc có bước chuyển đổi". Rủi ro thật trong kỳ đo 05–15/12 |
| localStorage: `minigames.*`, `hub.unlocked`, `story.valentine.*`, cài đặt | [Chưa code] | `SaveState` trong `save.ts` chỉ có `settings: { camera_mode, free_look }`. Toàn bộ bảng trường ở GDD `02` §4.2 (tỉ số caro, sao Sudoku, điểm lật chai, nhánh Valentine, kiểu hòm thư) **chưa có** |
| Tên người chơi không rời máy | [Hoàn thành] | `save.ts` chú thích + `src/analytics/bridge.ts` không truyền `player_name`; test `tests/unit/` có ca kiểm |
| IndexedDB: ảnh JPEG dạng Blob | [Hoàn thành] | `src/core/photoStoreIdb.ts` (`indexedDB.open`, `objectStore.put(data, key)`); nén JPEG 1024×768 chất lượng 0,85 ở `src/config/photo.ts` — không dùng base64, đúng GDD `02` §4.1 |
| Menu: Chơi tiếp / Chơi lại một Trang / Xóa tiến trình | [Hoàn thành] | `game.ts` `actions.menuLeaveDay`, `engine.restartDay()`, `menuWipe` (bấm 2 lần mới xóa), `store.wipe(photos)` xóa cả ảnh |
| Gửi event theo lô lên Firestore | [Hoàn thành] | `src/analytics/tracker.ts:19` `FLUSH_MS = 60_000`; `:58` gửi bằng `sendBeacon` khi tab ẩn; `:120` mỗi lô một `batch_id`; `api/_lib/firestore.ts:41` `collection('event_batches').doc(batchId).create(doc)` → gửi lại cùng lô không ghi trùng; `firestore.rules` chặn client |
| Tên event theo GDD `02` §5.1 | [Đang dở dang] | `shared/events.ts:7–24` đã có `page_started/completed`, `minigame_started/finished`, `hub_opened`, `end_message_sent`, `public_demo_completed`. **Thiếu `valentine_letter_sent`** (GDD ghi PROPOSED/tùy chọn) |
| **Event có người nghe nhưng không ai phát** | [Chưa code] | Quét toàn `src/`: `hub_opened`, `free_photo_taken`, `feedback_submitted` chỉ xuất hiện ở `src/analytics/bridge.ts` (nơi nghe), **không có `bus.emit(...)` nào**. `landing_view`, `cta_click`, `interactable_viewed` không xuất hiện ở đâu ngoài danh sách tên |
| Form phản hồi → Firestore | [Chưa code] | xem 1.1 |

---

## 5. Lỗi chặn và nợ kỹ thuật (mục e)

| # | Mức | Vấn đề | Vị trí | Hệ quả |
|---|---|---|---|---|
| B-01 | **Chặn demo** | 7/9 Trang không có dữ liệu; 2 Trang có thì toàn `[PLACEHOLDER]` | `src/content/days/`, `src/content/pack.ts` | Đường găng của sprint. Không có nội dung thì không có bản đo |
| B-02 | **Chặn demo** | Bản `production` không có Ngày nào → mở trang production không vào được game | `src/content/release.ts` (`production: { memory_day_ids: [] }`), `src/main.ts` (`HAS_GAME`) | Phải chốt D-03 trước khi đưa lên `main` |
| B-03 | **Chặn demo** | Khung minigame chỉ là thẻ giả một nút | `src/game/game.ts:178–186`, `src/ui/game/GameUi.tsx:212–215` | Mọi trò (kể cả K3–K6, Caro, Sudoku, Valentine) phải đợi khung này |
| B-04 | **Chặn đo lường** | Form phản hồi chưa có câu hỏi và chưa có endpoint ghi | `src/ui/game/GameUi.tsx:252`, `api/` | Mất bằng chứng kinh doanh của môn học trong kỳ 05–15/12 |
| B-05 | Cao | Lỗi A-01 **chưa sửa**: bước `goto` không xong nếu người chơi đã đứng trong bán kính từ trước, hoặc vào bán kính lúc giao diện đang khóa | `src/game/game.ts:462–468` — vẫn dùng tập `inside`, chỉ `trigger` ở lần **vừa bước vào** và chỉ khi `!locked()` | Khi có nội dung thật, người chơi sẽ bị kẹt mà không hiểu vì sao |
| B-06 | Cao | Lỗi A-02 **chưa sửa**: validator chưa chặn quest Side/Daily có bước đầu không khởi động được | `src/content/validate.ts:136` chỉ có luật `side_blocks_main`; không có `optional_quest_unstartable` | Quest phụ "biến mất" lặng lẽ khi Gemini số hóa nội dung |
| B-07 | Cao | Tăng `SAVE_VERSION` sẽ xóa tiến trình và ảnh của người chơi | `src/core/save.ts` `load()` | Nguy hiểm nếu xảy ra giữa kỳ đo. Cần viết bước chuyển đổi v2→v3 **cùng lúc** với việc thêm trường `minigames.*` |
| B-08 | Vừa | Bẫy cache `loadProp` + `World.dispose()` (xem 3.3) | `src/render/assets.ts`, `src/world/world.ts:199` | Props Blender sẽ mất ở lần vào Ngày thứ hai |
| B-09 | Vừa | `prp_desk_2seat.glb` có gốc ở mặt bàn (`min.y = −0,663`) | `public/assets/props/` | Bàn sẽ chìm/nổi khi đặt theo marker; cũng làm sai phép kiểm "mặt bàn ngang hông nhân vật" của GDD `03` §1.3 |
| B-10 | Vừa | Nhánh code **chưa có** 4 commit GDD Trang 6 (21/11) | `feat/sprint-0412` còn `docs/gdd/` bản `cb2d81e` | Người code đọc GDD cũ, làm sai Trang 6 |
| B-11 | Thấp | `src/content/cast.ts` ghi "D-01 CHƯA CHỐT… chưa phải quyết định của nhóm", nhưng GDD đã CONFIRMED 19/11 là Đức + Châu (đúng bằng `ACTIVE_CAST = 'A'`) | `src/content/cast.ts` | Chỉ cần sửa chú thích để khỏi hiểu lầm |
| B-12 | Thấp | `src/content/chapters.ts` tách lớp 6 và lớp 7 thành hai nhóm | như trên | Nhãn menu không khớp "Mốc 1 = lớp 6–7" |
| B-13 | Chưa xác minh | e2e 37 ca, FPS, Vercel preview, Firestore thật, touchpad thật | — | Phải chạy trên máy của chủ dự án; môi trường phiên này không tải được trình duyệt Playwright |

**Điểm mạnh nên giữ:** `tsc` sạch, 266 unit test đạt, `validate:world` 0 lỗi, build production không lẫn công cụ test, kiến trúc tách tốt (nội dung ↔ engine ↔ cảnh), `rigAdapter` đã mở sẵn chỗ cắm model GLB, validator ID nội dung đã có.

---

## 6. GDD: chỗ tự mâu thuẫn, chỗ lệch code, chỗ còn thiếu (mục f)

### 6.1 GDD tự mâu thuẫn — kèm đoạn thay thế hoàn chỉnh

**(1) Phiên bản Blender.** `docs/gdd/00_MASTER_GDD.md` §9 ghi "Blender 5.2 LTS", nhưng quyết định D-S2-05 (16/11) và code đều chốt 4.5.16 LTS (`tools/blender/world/pipeline_config.py:17` → `BLENDER_STANDARD = '4.5.16 LTS'`, `BLENDER_TESTED = ('4.5.16 LTS', '5.2.4 LTS')`).
*Sửa ở `docs/gdd/00_MASTER_GDD.md` §9, thay cả câu:*
> Vite + TypeScript + Three.js + Preact; GSAP; three.quarks; Tweakpane chỉ bản test; **Blender 4.5.16 LTS → GLB (bản chuẩn của quy trình asset, D-S2-05 chốt 16/11; 5.2.4 LTS đã được test nhưng không phải bản chuẩn)**; GitHub → Vercel (Hobby, phi thương mại); Firebase Firestore gói Spark cho số liệu đo và phản hồi. Nhánh `dev` = bản thử, `main` = bản chính. Lưu tiến trình trên máy người chơi, Firebase chỉ cho số liệu ẩn danh: xem `02` §4–5.

**(2) "Đoán xem ai là người…" nằm ở nhánh nào.** `docs/gdd/02_GAMEPLAY_AND_MECHANICS.md` §2.4.6 xếp trò này vào hàng "Nhánh rút gọn Valentine (Kèo ăn vặt, Danh sách mua sắm, Đoán xem ai là người)", còn §2.5.3 và §2.5.3c lại đặt nó ở **nhánh chung**, sau Trang trí Căn cứ.
*Sửa ở `02` §2.4.6, thay hàng đó bằng hai hàng:*
> | Nhánh rút gọn Valentine (Kèo ăn vặt, Danh sách mua sắm) | 6 | K1/K3 | Chọn món / nhặt đồ theo sổ của Châu (`§2.5.3`) | Làm xong | Không có |
> | "Đoán xem ai là người…" (nhánh chung, sau Trang trí Căn cứ) | 6 | K1 | 5 câu, mỗi câu chọn 1 trong 5 người; mọi đáp án đều có phản hồi (`§2.5.3c`) | Trả lời đủ 5 câu | Không có; không có đúng sai |

**(3) Ghi công cây và năm học trong `ASSET_CREDITS.md`** (file nằm ở nhánh `feature/asset-workshop`, cần sửa trước khi gộp): hai file cây giống nhau từng byte, chiều cao thật 7,056 m, và tiêu đề ghi sai giai đoạn.
*Sửa tiêu đề file:*
> *Dự án Game 3D Narrative: Vùng Ký Ức (Mốc 1–2: năm học 2014–2015 đến 2017–2018)*

*Thay hai hàng cây trong bảng §2 bằng:*
> | **`schoolyard_flamboyant_tree.glb`** (cây phượng) | `CommonTree_Autumn_1` | **Quaternius** | CC0 1.0 | quaternius.com | **Đang là bản 12.224 tam giác, cao 7,056 m — VƯỢT ngân sách GDD `03` §1.2 (3.000 tam giác / 200 KB). Phải giảm tam giác ≥ 4 lần và hạ chiều cao về khoảng 5,3 m trước khi gộp** |
> | **`schoolyard_shade_tree.glb`** (dự định làm cây bàng) | **chưa có model riêng** | — | — | — | **File hiện tại trùng byte với `schoolyard_flamboyant_tree.glb` (md5 `fc7a3c80…`): KHÔNG phải cây bàng. Hoặc dựng cây bàng tán tầng mới, hoặc dùng `schoolyard_tropical_tree.glb` (Kenney, Tree Plateau) làm cây bàng và xóa file này** |

### 6.2 Code lệch GDD v1.0 — sửa ở code, không sửa GDD

| # | GDD nói | Code đang làm | Sửa ở |
|---|---|---|---|
| L-01 | `02` §2.4.5 + kịch bản (dòng 290, 834): hẹn giờ **10 giây** | 8 giây | `src/config/photo.ts` → `timer_seconds: 10`. Lưu ý: ca e2e ảnh hẹn giờ sẽ phải chờ lâu hơn |
| L-02 | `03` §1.3 (bản 21/11 tối): lớp 8–9 cao **1,55–1,65 m** | nhân vật code lớp 9 cao 1,579–1,727 m → **đã khớp** | `src/actors/player/rigAdapter.ts` (`AVATAR_HEIGHT_RANGE_M[9]`) + test, để `checkAvatarHeight` không báo sai |
| L-03 | `02` §4.2: bảng trường `minigames.*`, `hub.unlocked`, `story.valentine.*` | `SaveState` chưa có | `src/core/save.ts` (kèm bước chuyển đổi v2→v3) |
| L-04 | `02` §5.1: event `valentine_letter_sent` | chưa khai | `shared/events.ts` |
| L-05 | `02` §5.1: `hub_opened` khi mở Bảng trò chơi ở Căn cứ; `free_photo_taken`; `feedback_submitted` | có người nghe, không ai phát | `src/game/game.ts`, màn form phản hồi |
| L-06 | `00` §2.1: Mốc 1 = lớp 6–7 (một Mốc) | `chapters.ts` tách `ch_g06` / `ch_g07` | `src/content/chapters.ts` (D-04 còn mở → để cấu hình là đúng, nhưng nhãn nên gộp) |
| L-07 | `03` §1.1: mọi asset không tự làm phải có `CREDITS.md` | nhánh code không có file nào | thêm `docs/ASSET_CREDITS.md` khi gộp asset |

### 6.3 Nội dung còn thiếu (ngoài 7 Trang chưa số hóa)
- **Giao diện 2D:** màn confession/Valentine, màn làm hòm thư, màn đọc thư (`UI_LETTER_READ`), bàn caro, trang Sudoku, màn hướng dẫn luật cho từng trò — chưa có file nào trong `src/ui/`.
- **Âm thanh:** `src/game/sfx.ts` có chỗ gắn; chưa có hiệu ứng nào của GDD `03` (màn trập, mưa, lửa, trống trường).
- **Asset GDD `03` §2 chưa tồn tại ở bất kỳ nhánh nào:** đồ phòng 2026 + thùng kỷ vật, 9 kỷ vật (hộp phấn KV-01 trước nhất), xe quà vặt, tiệm tạp hóa, đồ Hội trại, hòm thư Valentine, đồ Khu Vui Chơi.
- **Biến thể đêm Hội trại** (`src/world/variants.ts`).
- **Cuộn phim (phím C):** `game.ts` ghi rõ phím C đang để dành, chưa gán việc.

### 6.4 Chỗ nên giản lược để kịp 04/12 *(đề xuất, chủ dự án quyết)*
Theo thang cắt của GDD `02` §6 (cắt từ dưới lên) và tình hình thật:
1. Bỏ hẳn Tầng B khỏi bản 04/12 (lật chai, bi ve, ô ăn quan, lò cò, Khu Vui Chơi) — GDD đã cho phép.
2. Ba minigame đầy đủ của Trang 6 làm theo thứ tự **Trang trí Căn cứ → Ném bóng → Săn góc ảnh**; mỗi trò đã có nút "Bỏ qua" nên nếu thiếu thời gian, trò chưa xong vẫn không chặn đường chơi.
3. Caro 12×12 giữ, nhưng chỉ làm **một mức AI** cho bản 04/12 (Đức dễ) và để Quân khó lại sau — tỉ số loạt ván vẫn ghi được.
4. Sudoku: chỉ làm lưới 9×9 mức Vừa với 3 đề sẵn; bỏ lưới 6×6 và chế độ ghi chú nháp.
5. Hội trại: chỉ làm Phần 1 và Phần 4 như GDD `00` §4 đã giới hạn.
6. Model 3D: chấp nhận **nhân vật dựng bằng code** cho bản 04/12 nếu hướng asset chốt muộn; `rigAdapter` cho phép đổi sang GLB sau mà không sửa gameplay.

### 6.5 Hai điểm đổi cốt truyện / điểm kết — **ĐÃ CHỐT 21/11 (tối)**

**(1) Bản đo 05–15/12 dừng ở đâu — CHỐT: trọn Mốc 1 (phương án b).**
Bản đo gồm **Trang 1 → Trang 4**, kết demo đặt ngay sau Trang 4 "Đủ năm đứa"; Mốc 2 (Trang 5–9, gồm Trang 6 Valentine) giữ nguyên thiết kế nhưng lùi sau 15/12. Đã ghi vào `docs/gdd/00_MASTER_GDD.md` §4 và §11 mục 13.
**Ba việc kéo theo cho Chặng 3:** `src/content/release.ts` (`end_day_id` giữ `d.g07.03`, `memory_day_ids` đủ 4 Trang, và **bản `production` phải được khai** — hiện đang trống); lời ba tin nhắn kết đổi nghĩa thành "nhớ hồi tụi mình mới đủ năm đứa"; nhãn nhóm Trang trong `chapters.ts` gộp về một Mốc 1.

*Các phương án đã cân nhắc (giữ để tra cứu):*
- **(a) Giữ 9 Trang:** người chơi đi hết Mốc 1 + Mốc 2, tin nhắn cuối mang nghĩa "sau tất cả những năm đó". Rủi ro: nội dung Trang 5–9 (gồm Trang 6 Valentine rất dài) phải xong trước 04/12.
- **(b) Dừng ở Trang 4 "Đủ năm đứa":** demo là trọn Mốc 1, tin nhắn cuối mang nghĩa "nhớ hồi tụi mình mới đủ năm đứa". Mốc 2 lùi sau 15/12. Cần sửa 3 thứ: `release.ts`, lời 3 tin nhắn kết, và câu chốt của GDD `00` §4.
- (c) Trung gian: 9 Trang nhưng Trang 5–9 rút ngắn còn chuỗi Main tối thiểu, bỏ Side.

**(2) Chiều cao nhân vật lớp 8–9 — CHỐT: đúng với code (phương án b).**
GDD đổi sang **1,55–1,65 m** cho lớp 8–9 (giữ 1,30–1,40 m cho lớp 6–7). Đã ghi vào `03` §1.3, `00` §7.3 và §11 mục 8. **Việc kéo theo cho Chặng 3:** đổi `AVATAR_HEIGHT_RANGE_M[9]` trong `src/actors/player/rigAdapter.ts`, sửa `tests/unit/rigAdapter.test.ts`, và scale model GLB về dải mới khi làm asset. Không cần sửa `BASE[9]` trong `build.ts`.

*Các phương án đã cân nhắc (giữ để tra cứu):*
- **(a) Giữ GDD 1,40–1,50 m:** phải thu nhỏ nhân vật code lớp 9 (sửa `BASE[9]` trong `src/actors/character/build.ts`) và scale model GLB lên đúng dải. Nhất quán với tỉ lệ semi-chibi 3–3,5 đầu.
- **(b) Nâng GDD lên 1,55–1,65 m cho lớp 8–9:** đúng hơn với học sinh 14–15 tuổi thật và đúng với code đang chạy; chỉ cần scale model GLB. *Đoạn thay thế nếu chọn (b), ở `03` §1.3 hàng "Chiều cao":*
  > | Chiều cao | Lớp 6–7: **1,30–1,40 m** · lớp 8–9: **1,55–1,65 m** (sửa 21/11 theo số đo thật của nhân vật đang chạy trong game). Quân cao nhất nhóm (chạm mức trên); Hạ và Đức ở mức dưới |
  > *Kéo theo:* `00` §7.3 đổi "khoảng 1,3–1,5 m" thành "khoảng 1,3–1,65 m theo lớp"; `rigAdapter.ts` đổi `AVATAR_HEIGHT_RANGE_M[9]`; `tests/unit/rigAdapter.test.ts` đổi theo.

---

## 7. Việc kế tiếp
Chặng 3: lập `docs/handoff/SPRINT_TASKS.md` (backlog P0/P1/P2 tới 04/12, mỗi task một prompt độc lập) và `docs/handoff/README.md`. Ba quyết định ngày 21/11 (tối) đã mở đường: phạm vi = trọn Mốc 1 (Trang 1–4), hướng asset = base mesh + xương chung, chiều cao lớp 8–9 = 1,55–1,65 m. Task Trang 5–9 xếp vào phần sau 15/12.
