# BACKGROUND_AUDIT — Kiểm toán bối cảnh 3D cho demo Mốc 1 (đầy đủ) + Mốc 2 (chỉ Main)

| Trường | Giá trị |
|---|---|
| Ngày | 22/11/2026 (UTC+7) |
| Nhánh / commit đọc | `feat/sprint-0412` (sau `914d6d9`) |
| Phạm vi | Theo quyết định Game Director 22/11 (`docs/GDD_FULL_REVIEW.md` mục VII): **A1** Mốc 1 đầy đủ + Mốc 2 chỉ Main; **D3** mọi asset mới dựng bằng **Procedural Three.js**, chỉ dùng lại GLB đã có |
| Đã đọc | `src/render/{stage,assets,materials,style,merge,fx,canvasTex}.ts`, `src/world/{world,sky,variants,types,collision,dayBindings}.ts`, `src/world/school/*.ts`, `src/world/maps/map_thcs.{world,index}.json`, `src/game/scenes/{dayScene,hubScene}.ts`, `src/config/hub.ts`, `src/content/base.ts`, `src/actors/player/rigAdapter.ts`, `tools/blender/world/gen_map_thcs.py` (tham số bố cục) |
| Đã chạy | **Không chạy lệnh nào.** Số tam giác/tọa độ lấy từ `map_thcs.index.json` (do `npm run validate:world` sinh ra trước đó) |

> **Lưu ý về đường dẫn asset:** yêu cầu nhắc `public/models/` + `CREDITS.md`, nhưng **repo không có thư mục `public/models/` và không có `CREDITS.md`**. GLB thật nằm ở `public/assets/`. Mọi task dưới đây dùng đường dẫn thật.

---

## (a) Đã dựng xong và quy chuẩn đang áp dụng

### a1. GLB có sẵn (chỉ những file này được dùng lại — quy tắc D3)
| File | Nội dung | Tam giác | Ghi chú |
|---|---|---|---|
| `public/assets/world/map_thcs/zone_classroom.glb` | Lớp học (1 phòng vào được trong dãy 5 phòng) | 1.778 | Marker: `itr.thcs.blackboard`, `itr.thcs.wall_news`, `spawn.thcs.classroom`, `spot.thcs.class_front` |
| `.../zone_corridor.glb` | Hành lang + mái hiên + rãnh nước | 760 | Marker: `itr.thcs.gutter`, `spawn.thcs.corridor`, `spot.thcs.corridor_door` |
| `.../zone_yard.glb` | Sân, cột cờ, ghế đá, cây, vòng đá cầu, **tường rào trường** | 3.246 | 18 marker (ghế đá, cột cờ, `itr.thcs.tripod_spot`, `spot.thcs.yard_group_1…4`, 2 camera) |
| `.../zone_gate.glb` | Cổng + ngõ quà vặt: **khối thô tiệm tạp hóa, xe quà vặt, 3 nhà dân** | 858 | Marker: `itr.thcs.grocery`, `itr.thcs.snack_cart`, `spawn.thcs.gate`, `spot.thcs.gate_front` |
| `.../zone_field.glb` | Bãi đất trống, cỏ, khúc gỗ | 2.252 | Marker: `itr.thcs.marble_spot`, `spawn.thcs.field`, `spot.thcs.field_log` |
| `.../zone_base.glb` | Căn cứ: chòi tôn + bạt, kệ, bàn gỗ cũ | 1.374 | Marker: `itr.thcs.base_shelf`, `itr.thcs.old_table`, `spawn.thcs.base`, `spot.thcs.base_table` |
| `public/assets/props/prp_desk_2seat.glb` | Bàn đôi | — | **Gốc lệch: `min.y = −0,663`** (lỗi B-09) → khi dùng phải bù `position.y += 0.663` hoặc không dùng |

Tổng bản đồ ≈ 10.300 tam giác — rất dư so với ngân sách 150.000 của GDD `03` §1.2.

### a2. Bố cục và tọa độ (mét; x sang phải, z về phía nam, Y lên)
| Vùng | x | z | Nguồn |
|---|---|---|---|
| Khuôn viên trường (trong tường rào cao 2,1 m) | −34 … 26 | −31 … 18 | `gen_map_thcs.py` `L.school_*` |
| Dãy lớp (5 phòng, phòng vào được x −9,2…1,2) | −30 … 22 | −30 … −22 | `L.block_*`, `rooms`, `open_room=2` |
| Hành lang + mái hiên | −30 … 22 | −22,1 … −19 | index `floor_bounds` |
| Sân | −34 … 26 | −19,2 … 18,3 | index |
| Cổng (rộng ±3,6 m ở z = 18) + ngõ quà vặt | −34 … 40 | 17,4 … 30 | index |
| Bãi đất (lối vào từ ngõ ở x 31…35) | 26,2 … 52 | −22,4 … 18,6 | index |
| Căn cứ (lối vào từ bãi đất ở x 44…47) | 38 … 52 | −36 … −21,4 | index |

### a3. Quy chuẩn kỹ thuật đang chạy (giữ nguyên cho mọi asset mới)
| Hạng mục | Giá trị trong code | File |
|---|---|---|
| Màu đầu ra | `renderer.outputColorSpace = SRGBColorSpace`; tone map `NeutralToneMapping`, exposure 1,05 | `src/render/stage.ts` |
| Texture vẽ bằng canvas | phải gán `texture.colorSpace = SRGBColorSpace` (xem `canvasTexture`) | `src/render/canvasTex.ts` |
| Bóng | `PCFSoftShadowMap`; mặt trời bóng 2048², hộp bóng ±24 m (`shadowSize: 24`), bias −0,0004, normalBias 0,02 | `stage.ts addDaylight`, `dayScene.ts` |
| Vật liệu | `toon()` (MeshToonMaterial 3 bậc, có cache theo màu) + viền `OutlineEffect` dày 0,0045; đất/trời/hạt tắt viền bằng `material.userData.outlineParameters = { visible: false }` | `materials.ts`, `stage.ts` |
| Bảng màu | `PAL` (khung, tường, ngói, lá…) — dùng lại, không đặt màu lạ | `src/world/school/props.ts` |
| Gộp lượt vẽ | `mergeStatic(root)` gộp mesh tĩnh cùng vật liệu; vật lặp nhiều dùng **`InstancedMesh`** (mẫu: chấn song ở `classBlock.ts`) | `render/merge.ts` |
| Gốc vật thể | **`min.y = 0`** ở mặt đất, đơn vị mét, mặt trước hướng **+z** khi `rotation.y = 0` | hợp đồng ở `rigAdapter.ts` |
| Nhân vật | Dựng bằng code qua `CharacterRigAdapter` (`codeRigAdapter`); cao lớp 6–7 **1,30–1,40 m**, lớp 8–9 **1,55–1,65 m**; `checkAvatarHeight()` để kiểm | `src/actors/player/rigAdapter.ts`, `src/actors/character/build.ts` |
| Trời + sương | Vòm trời `SphereGeometry(180)` gradient 3 màu + 4 cụm mây; `scene.fog = Fog(preset.fog, 45, 140)`; camera far = 400 | `world/sky.ts`, `dayScene.ts` |
| Biến thể năm học | `DECOR_SETS` (g06, g07) + `LIGHTING_PRESETS` (`morning_sun`, `late_afternoon`); khai trong `content/base.ts` `MAPS[0].variants` | `world/variants.ts` |
| Hạt | three.quarks, 1 `BatchedRenderer`; mới có `addSunMotes` | `render/fx.ts` |
| Phòng 2026 | Cảnh riêng, khối hộp 7×5 m, camera cố định `(1.4, 3.4, 6.4)` nhìn `(0.1, 0.9, −0.4)` | `game/scenes/hubScene.ts` |
| Marker / va chạm | **Chỉ đọc từ GLB** (tên node có tiền tố `itr.`, `spot.`, `cam.`, `spawn.`). Hiện **không có cách thêm marker/collider bằng code** | `world/world.ts`, `world/parse.ts` |

---

## (b) Còn thiếu cho Mốc 1 (đầy đủ) và Mốc 2 (Main)

### b1. Lỗi bố cục cần sửa trước
| # | Vấn đề | Hệ quả | Cách sửa bằng code (không xuất lại Blender) |
|---|---|---|---|
| BG-1 | **Căn cứ nằm ngoài tường rào** (x 38…52, tường rào dừng ở x = 26); đường đi: sân → cổng → ngõ → bãi đất → Căn cứ. GDD CONFIRMED 20/11: Căn cứ **trong trường, góc sân sau gần nhà kho** | Trang 3, 4, 6, 7, 9 đi sai đường; người chơi phải ra khỏi trường | Coi bãi đất + Căn cứ là "sân sau" của trường: (1) dựng tường rào procedural bao bãi đất + Căn cứ, nối với tường trường; (2) **mở một lối** ở tường rào phía đông sân (khoảng x = 26, z −14…−10) bằng cách **tắt collider theo tên** (`wall_fence_east`) và đè lại 2 đoạn tường có khe; (3) chặn lối ngõ → bãi đất (x 31…35) bằng hàng rào procedural + collider code; (4) dựng nhà kho procedural cạnh Căn cứ. Cần cơ chế `extras` (BG-3) |
| BG-2 | Camera ảnh trỏ sai chỗ: `cam.d0701.boats` dùng marker `cam.thcs.yard_bench` (ở sân, không phải rãnh nước); `cam.d0702.base` dùng `cam.thcs.yard_group` (ở sân, không phải Căn cứ) | Ảnh 5 chiếc thuyền và ảnh biển tên chụp nhầm cảnh | Thêm marker camera bằng code: `cam.thcs.gutter` (+ `.target`) và `cam.thcs.base_sign` (+ `.target`) |
| BG-3 | Không thêm được marker/collider/vật bằng code | Mọi thay đổi bố cục đều phải quay lại Blender — trái D3 | Thêm cơ chế **World Extras**: file `src/world/maps/map_thcs.extras.ts` khai `markers[]`, `colliders[]`, `disableColliders[]` (theo tên) và `dressing` (hàm dựng vật procedural theo khu); `loadWorld()` gộp vào sau khi đọc GLB; `validate:world` + unit test kiểm trùng ID |
| BG-4 | Phòng 2026 đổi ánh sáng `cold → cool → warm` theo số Trang đã chơi (`src/config/hub.ts`) | Trái CONFIRMED 20/11 "tươi sáng, ấm từ đầu" (phương án lạnh → ấm đã SUPERSEDED) | Đặt mọi mốc về preset ấm; "trống" thể hiện bằng ít đồ |
| BG-5 | `prp_desk_2seat.glb` gốc lệch `min.y = −0,663` | Bàn chìm xuống sàn | Bù trong code khi nạp, hoặc thay bằng bàn procedural |

### b2. Nền xung quanh (background / perimeter)
Hiện ngoài tường rào **chỉ có sương + vòm trời**; nhìn từ sân qua tường cao 2,1 m thấy khoảng trống. Cần một vành nền **không va chạm, không viền, InstancedMesh**, đặt trong tầm sương (cách mép bản đồ 4–40 m):
| Hướng | Mép bản đồ | Nên có |
|---|---|---|
| Bắc (sau dãy lớp) | z < −31 (Căn cứ: z < −36) | Hàng cây cao (bàng, dừa, tre), mái nhà dân thấp, cột điện + dây |
| Tây | x < −34 | Dãy nhà ống 2–3 tầng mặt tiền màu, mái tôn/ngói, ban công, bảng hiệu tự đặt tên |
| Nam (sau ngõ quà vặt) | z > 30 | Đường nhựa + vỉa hè, nhà ống đối diện, xe máy dựng (hộp đơn giản), cột điện |
| Đông (sau bãi đất/Căn cứ) | x > 52 | Ruộng/vườn chuối, hàng cau, mái nhà xa, đồi thấp mờ |
| Mặt đất mở rộng | quanh toàn bản đồ | Một mặt phẳng lớn (≈ 220×220 m) màu đất/cỏ nhạt, `receiveShadow`, tắt viền, nằm dưới `y = −0,02` |
Ngân sách vành nền: ≤ 25.000 tam giác, ≤ 12 lượt vẽ (gộp theo vật liệu + instancing).

### b3. Đạo cụ và ánh sáng theo Trang
| Trang | Có sẵn | Thiếu (dựng procedural) | Ánh sáng / thời tiết |
|---|---|---|---|
| Hub 2026 | Sàn, 2 tường, giường, bàn, cửa sổ, thùng, Album, điện thoại, kệ | Đèn bàn (PointLight ấm), khung kính mật lệnh, tường dán ảnh (khung ảnh trống → hiện ảnh đã giữ), thuyền giấy trên bàn, biển tên + sổ luật trên kệ, ảnh bìa Album, hộp phấn (chuyển Mốc), thảm, rèm, cảnh đêm ngoài cửa sổ | Preset `hub_warm_night` duy nhất |
| 1 · Mật lệnh | Lớp, bảng đen, sân, vòng đá cầu, ghế đá, tiệm tạp hóa thô | Bảng phân lớp ở hành lang (giấy dán, chữ canvas); quyển vở rơi; mẩu giấy mật lệnh + bút đỏ (đạo cụ tay); quả cầu + bụi cây cạnh vòng đá cầu; vệt phấn trên bảng (để lau); **bậc thềm + ghế nhựa + kệ mì** ở tiệm tạp hóa; máy ảnh compact (đạo cụ tay); khăn quàng đỏ (đã có ở nhân vật) | `morning_sun` (đã có); cảnh B: `late_afternoon` |
| 2 · Thuyền giấy | Mái hiên, rãnh nước (vật liệu `water`) | **Mưa** (hạt three.quarks, chỉ quanh camera), vũng nước phản sáng, dòng nước chảy trong rãnh (UV trôi), 5 thuyền giấy (InstancedMesh, màu khác nhau), giấy báo, **5 điểm đứng dưới hiên** (marker code), camera rãnh nước | Preset mới `rain_overcast` (xanh xám nhưng sáng, GDD `00` §7.2) |
| 3 · Căn cứ | Chòi tôn + bạt, kệ, bàn gỗ | **Tường rào sân sau + nhà kho + lối mở từ sân (BG-1)**; 3 điểm khảo sát (mái che, gốc cây, đống thùng giấy) có marker; **biển tên "CĂN CỨ BÍ MẬT"** (canvas, chữ tay); sổ bìa xanh "LUẬT"; **3 bộ trang trí đổi theo flag `m1.base_decor`**: `paper` (dây giấy màu), `flowers` (lọ hoa dại), `photos` (ảnh dán); camera biển tên | `late_afternoon` |
| 4 · Đủ năm đứa | Gốc phượng, ghế đá, `tripod_spot` | Phượng **nở nhiều hơn** (bộ trang trí mới `g07_end`, `phuongBloom ≈ 0,7`); máy ảnh đặt trên ghế đá; vòng sáng chỗ đứng (đã có trong ảnh hẹn giờ?) — kiểm; mưa rào ngắn → **cầu vồng** (cung bán trong suốt trên vòm trời) + mặt sân ướt; ảnh in + băng keo dán trên tường Căn cứ (cạnh ảnh bộ ba + thuyền) | `late_afternoon` → `rain_shower` → `after_rain_rainbow` (đổi preset trong Trang, tween bằng GSAP) |
| 5 · Lên lớp 8 (Main) | Lớp, sân, cổng | Băng rôn khai giảng, **bàn caro** (giấy kẻ ô trên bàn — UI 2D là chính), **hộp phấn móp** + mẩu phấn, cột bóng rổ góc sân (kiểm có trong GLB chưa; nếu chưa: procedural), **bác bảo vệ** (nhân vật người lớn) | Bộ mới `g08` + `morning_sun`; cảnh B `late_afternoon` |
| 6 · Valentine (Main) | Căn cứ, ghế đá, hành lang | **Hòm thư** (hộp giấy, 3 kiểu nền/họa tiết theo `story.valentine.boxStyle`), bảng nội quy 3 điều, chổi (Đức quét sân), đồ trang trí Căn cứ ngày Valentine, cột rổ + bóng (Ném bóng), tờ vẽ chiếc lá | `g08`; cảnh D chiều `late_afternoon`, tối mở hòm thư `dusk` |
| 7 · Báo tường (Main) | Lớp, góc báo tường `itr.thcs.wall_news` | **Bảng đếm ngược** (số 270 / 197, canvas), tờ báo tường A4/A3 các ô, bút highlight; Sudoku là UI 2D | Bộ mới `g09` (không khăn quàng); `morning_sun` |
| 8 · Rã băng (Main) | Tiệm tạp hóa thô | **Tivi** (màn hình canvas), ghế nhựa, **tờ lịch 1/2018**, chú chủ tiệm (người lớn); **biến thể đêm Hội trại ở sân**: lửa trại (lửa hạt + PointLight cam nhấp nháy), đèn dây (InstancedMesh bóng + 1–2 PointLight), lều trại, cờ giấy, **cổng trại** (3 kiểu: tên lửa / chiếc lá / thường) | Preset mới `night_campfire` (cam lửa + xanh đêm, sao trên vòm trời) |
| 9 · Vẫn đủ năm đứa (Main) | Sân, Căn cứ, gốc phượng | Băng rôn bế giảng, **phượng nở rộ** (`g09_end`, bloom 1,0), sổ lưu bút kraft, áo trắng ký tên; cutscene "ba cổng trường" → **dùng thẻ minh họa 2D** (không dựng 3 trường mới) | `golden_sunset` (hoàng hôn vàng cam) |
| Nhân vật phụ | 5 nhân vật chính dựng bằng code | **Người lớn procedural** (cô Diệp, bác bảo vệ, chú tạp hóa) và **học sinh nền** (Tú + vài người đứng yên) — biến thể từ `buildCharacter` (tỉ lệ người lớn, màu áo) | — |

---

## (c) File cần tạo mới / chỉnh sửa để làm tiếp phần nền

| Việc | File | Tạo / Sửa | Task |
|---|---|---|---|
| Cơ chế World Extras (marker, collider, tắt collider theo tên, dressing) | `src/world/extras.ts` (kiểu + hàm `applyExtras(world, extras)`), `src/world/maps/map_thcs.extras.ts` (dữ liệu) | **Tạo** | N-04 |
| Gọi extras khi nạp bản đồ | `src/world/world.ts` (`loadWorld` thêm `opts.extras`), `src/world/types.ts` (kiểu `WorldExtras`) | Sửa | N-04 |
| Điểm gắn đồ trang trí vào cảnh ký ức | `src/game/scenes/dayScene.ts` (gọi `mountDressing(...)` một lần sau khi có `world`, `decor`, `flags`) | Sửa (**chỉ N-04 được sửa file này trong P0**) | N-04 |
| Sổ đăng ký đồ trang trí | `src/world/dressing/index.ts` (registry theo `import.meta.glob('./sets/*.ts')`), `src/world/dressing/sets/*.ts` (mỗi Trang/bộ một file) | **Tạo** | N-04 (khung), N-06/N-07/N-13 (điền) |
| Vành nền ngoài tường | `src/world/backdrop/townRing.ts`, `src/world/backdrop/instancing.ts` | **Tạo** | N-07 |
| Đạo cụ procedural Mốc 1 | `src/world/props/m1/*.ts` (một file một nhóm đồ) | **Tạo** | N-06 |
| Đạo cụ procedural Mốc 2 | `src/world/props/m2/*.ts` | **Tạo** | N-13 |
| Preset ánh sáng + bộ trang trí mới | `src/world/variants.ts` | Sửa | N-05 |
| Khai biến thể g08/g09 + `AGE_G8_9` cho nhân vật | `src/content/base.ts` | Sửa (**chỉ N-05**) | N-05 |
| Mưa, lửa trại, đèn dây | `src/render/fx.ts` (thêm `addRain`, `addCampfire`) | Sửa | N-05 |
| Cầu vồng, sao | `src/world/sky.ts` (thêm `rainbowArc()`, `starField()`) | Sửa | N-05 |
| Phòng 2026 ấm từ đầu + đồ trong phòng | `src/config/hub.ts`, `src/game/scenes/hubScene.ts` | Sửa | N-08b |
| Người lớn / học sinh nền | `src/actors/character/presets.ts`, `src/actors/character/build.ts` | Sửa | N-12 |
| Test | `tests/unit/world/extras.test.ts`, `tests/unit/dressing.test.ts` | **Tạo** | N-04, N-06 |

---

## (d) Danh mục asset còn thiếu — tất cả dựng bằng Procedural Three.js (quy tắc D3)

Quy chuẩn cho mọi asset trong bảng: hàm `export function makeXxx(opts): THREE.Group`; gốc `min.y = 0`; mét; mặt trước +z; vật liệu `toon(PAL.*)`; chữ vẽ bằng `signTexture`/`canvasTexture` (sRGB); vật lặp ≥ 5 cái dùng `InstancedMesh`; đồ tĩnh gọi `mergeStatic`; vật nhỏ < 0,3 m tắt bóng đổ; mỗi hàm có unit test kiểm `Box3.min.y ≈ 0` và số tam giác ≤ ngân sách.

| Mã asset | Tên | Trang | Ngân sách tam giác | Ưu tiên |
|---|---|---|---|---|
| PX-01 | Tường rào sân sau + nhà kho + cổng nhỏ nối sân (BG-1) | 3–9 | 1.500 | P0 |
| PX-02 | Vành nền phố thị trấn (nhà ống, cây, cột điện, dây) | mọi Trang | 25.000 tổng | P0 |
| PX-03 | Mặt đất mở rộng | mọi Trang | 2 | P0 |
| PX-10 | Bảng phân lớp (giấy dán, chữ canvas) | 1 | 200 | P0 |
| PX-11 | Vở rơi, mẩu giấy mật lệnh, bút bi đỏ (đạo cụ tay) | 1 | 300 | P0 |
| PX-12 | Quả cầu đá + bụi cây | 1 | 400 | P0 |
| PX-13 | Vệt phấn trên bảng (texture xóa dần cho trò lau bảng) | 1 | 2 | P0 |
| PX-14 | Bậc thềm, 3 ghế nhựa, kệ mì, gói mì (tiệm tạp hóa) | 1, 8 | 1.200 | P0 |
| PX-15 | Máy ảnh compact (đạo cụ tay) | 1–9 | 300 | P0 |
| PX-20 | 5 thuyền giấy (InstancedMesh), giấy báo | 2 | 400 | P0 |
| PX-21 | Dòng nước trong rãnh (mặt phẳng UV trôi) + vũng nước | 2, 4 | 200 | P0 |
| PX-30 | Biển tên "CĂN CỨ BÍ MẬT" (canvas chữ tay) | 3–9 | 150 | P0 |
| PX-31 | Sổ bìa xanh "LUẬT" | 3, kết | 150 | P0 |
| PX-32 | 3 bộ trang trí Căn cứ (`paper` / `flowers` / `photos`) | 3–9 | 1.500 mỗi bộ | P0 |
| PX-33 | 3 điểm khảo sát (mái che phụ, gốc cây, đống thùng giấy) | 3 | 800 | P0 |
| PX-40 | Phượng nở nhiều hơn (tham số `bloom` cho `phuongTree`) | 4, 9 | 0 thêm | P0 |
| PX-41 | Cung cầu vồng | 4 | 300 | P0 |
| PX-42 | Ảnh in + băng keo trên tường Căn cứ (texture = ảnh người chơi đã giữ, lấy từ IndexedDB) | 4–9 | 50 | P1 |
| PX-50 | Đồ phòng 2026: đèn bàn, khung kính, khung ảnh tường, thảm, rèm, đêm ngoài cửa sổ | Hub | 3.000 | P0 |
| PX-51 | Hộp phấn móp + mẩu phấn (KV-01) | Chuyển Mốc, 5 | 200 | P1 |
| PX-60 | Băng rôn khai giảng / bế giảng (canvas) | 5, 9 | 100 | P1 |
| PX-61 | Bàn caro (giấy kẻ ô đặt trên bàn) | 5 | 100 | P1 |
| PX-62 | Cột bóng rổ + bóng (nếu GLB sân chưa có) | 5, 6 | 600 | P1 |
| PX-63 | Hòm thư Valentine (3 kiểu) + bảng nội quy 3 điều + chổi | 6 | 800 | P1 |
| PX-64 | Bảng đếm ngược + báo tường | 7 | 300 | P1 |
| PX-65 | Tivi, tờ lịch 1/2018 | 8 | 300 | P1 |
| PX-66 | Hội trại đêm: lửa trại, đèn dây, 3 lều, cờ giấy, cổng trại 3 kiểu | 8 | 4.000 | P1 |
| PX-67 | Sổ lưu bút kraft, áo trắng ký tên | 9 | 400 | P1 |
| PX-70 | Người lớn procedural (cô Diệp, bác bảo vệ, chú tạp hóa) + học sinh nền | 5–9 | 2.500 mỗi người | P1 |
| PX-80 | Thẻ minh họa 2D "ba cổng trường" (UI, không phải 3D) | 9 | — | P2 |

GLB dùng lại (không tạo mới): 6 khu `map_thcs` + `prp_desk_2seat.glb` (nhớ bù `min.y`).
