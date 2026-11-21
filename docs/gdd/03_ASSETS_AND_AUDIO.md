# 03_ASSETS_AND_AUDIO — Kiểm kê asset 3D, giao diện 2D và âm thanh

| Trường | Giá trị |
|---|---|
| Phiên bản | **v1.2-draft** (nền v1.0 APPROVED 20/11) |
| Ngày cập nhật | 21/11/2026 (UTC+7) |
| Trạng thái | **v1.0 APPROVED 20/11; v1.2-draft: asset hòm thư Valentine đã được chủ dự án CHỐT HƯỚNG ngày 21/11 (chiều) để triển khai — chỉ còn chờ concept hình.** Chưa đóng dấu APPROVED cả file; các mục khác vẫn APPROVED. Chủ dự án duyệt ngày 20/11/2026. Mục ghi PROPOSED trong file là thiết kế đã duyệt để dựng; con số là giá trị khởi điểm, chỉnh khi chơi thử không cần xin duyệt lại. Mục ghi "Còn mở" vẫn chờ chốt |
| Phạm vi | Bản public: phòng 2026 + `map_thcs` (Trang 1–9) + Khu Vui Chơi Căn cứ |
| Nguồn | `01_NARRATIVE_AND_SCENES.md`, `02_GAMEPLAY_AND_MECHANICS.md`, `GDD.md` v0.3 §4, §8.4, §10, §12.3, §13, `BLENDER_PIPELINE.md` v0.1, kiểm tra repo ngày 20/11 (nhánh `feature/asset-workshop`, `feature/s2-world-camera-blender`), quyết định chủ dự án 20/11 |

## 0. Nhãn trạng thái asset
| Nhãn | Nghĩa |
|---|---|
| **[Đã có ý tưởng]** | Có trong kịch bản/tài liệu nhưng còn thiếu hình tham chiếu hoặc kích thước; cần chốt hình trước khi dựng |
| **[Cần tạo mới]** | Đã đủ mô tả để dựng ngay; chưa có file |
| **[Cần chỉnh sửa]** | Đã có bản trong repo hoặc bản dựng thử; phải sửa trước khi dùng |

Cột **Tầng** theo `02` §6: **A** = nằm trên đường chơi bắt buộc · **B** = minigame tùy chọn / Khu Vui Chơi · **C** = sau public.

Cột **Cách làm**: **Code** = dựng bằng Three.js trong game · **Script** = Blender Python (`bpy`) → GLB · **Blender** = dựng tay trong Blender → GLB · **2D** = vẽ trên canvas / Preact.

---

## 1. Quy chuẩn kỹ thuật bắt buộc cho asset 3D

### 1.1 Quy chuẩn chung *(trục, đơn vị, gốc: CONFIRMED 20/11; còn lại PROPOSED)*
| Hạng mục | Quy chuẩn |
|---|---|
| Định dạng | glTF 2.0 nhị phân `.glb` |
| Đơn vị | 1 đơn vị = **1 mét** |
| Trục | Y hướng lên, mặt trước nhìn về +Z (theo quy ước glTF / Three.js) |
| **Gốc tọa độ** | Tâm đáy vật: **`min.y = 0`** (đáy chạm mặt sàn), tâm X/Z ở giữa đáy. Riêng cửa và nắp: gốc ở bản lề |
| Biến đổi | Áp dụng hết xoay và tỉ lệ trước khi xuất (tỉ lệ = 1, xoay = 0) |
| Đặt tên | `PRP_` đồ vật · `ENV_` kiến trúc/cảnh · `CHR_` nhân vật · `DCL_` hình vẽ phấn dán trên nền · `UI_` giao diện · `SFX_` hiệu ứng âm thanh · `BGM_` nhạc nền. Viết hoa, gạch dưới, ví dụ `PRP_CHALKBOX_KV01` |
| Vật liệu | Chỉ dùng **màu nền** (base color), không bóng kim loại. Game tự đổi sang vật liệu toon 3 bậc sáng + viền khi nạp (đã có ở repo từ 14/11). Đặt tên vật liệu theo mã màu trong bảng màu, ví dụ `MAT_SCHOOL_WALL_YELLOW` |
| Ảnh texture | Hạn chế. Nếu cần: tối đa **512×512** cho đồ vật, **1024×1024** cho nhân vật; ưu tiên màu theo đỉnh hoặc vật liệu đặc. Chữ (biển tên, nhãn, lịch) vẽ bằng canvas lúc chạy |
| Màu sắc | **Tươi sáng, ấm, không làm tối toàn cảnh** (không phủ lớp màu u ám hay giảm sáng kiểu điện ảnh). Đồ cũ ở phòng 2026 thể hiện "cũ" bằng màu nhạt đi một chút và vết ố, không bằng màu tối (CONFIRMED 20/11) |
| Va chạm | Không xuất mesh va chạm trong GLB. Va chạm do game tạo bằng hộp/trụ đơn giản theo kích thước vật |
| Giấy phép | Mọi asset không tự làm phải ghi vào `CREDITS.md`: tên, tác giả, đường dẫn gốc, giấy phép, ngày tải. Chỉ dùng giấy phép cho phép dùng lại (ưu tiên CC0) |
| Nguồn chỉnh sửa | Giữ file `.blend` hoặc script `bpy` trong `tools/blender/`; đăng ký trong `tools/blender/assets.json` |

### 1.2 Ngân sách tam giác và dung lượng *(PROPOSED — điểm xuất phát, chốt lại sau khi đo FPS trên máy thật)*
Căn cứ hiện có: đo ngày 13/11 trên trình duyệt giả lập (chưa phải máy thật), góc sân + 5 nhân vật ≈ **110.000 tam giác, ≈ 220 lượt vẽ**; bàn học 2 chỗ từ Blender = **232 tam giác**. Mục tiêu đặt ngày 13/11: ≥ 30 FPS trên laptop dùng card đồ họa tích hợp.

| Loại | Tam giác tối đa | Dung lượng GLB tối đa |
|---|---|---|
| Đồ nhỏ cầm tay (phấn, chai, bi, sành, kỷ vật) | 300 | 50 KB |
| Đồ vừa (bàn, ghế, xe quà vặt, kệ) | 1.500 | 150 KB |
| Đồ lớn / module kiến trúc (dãy lớp, tiệm tạp hóa, cổng) | 5.000 mỗi module | 400 KB |
| Cây (phượng, bàng) | 3.000 mỗi cây | 200 KB |
| Nhân vật chính (đã có xương) | 6.000 | 1,5 MB kể cả hoạt ảnh |
| Học sinh phụ | 2.500 | 600 KB |
| **Cả cảnh lúc chơi** | ≈ 150.000 | Tổng tải lần đầu ≤ 25 MB |
| Lượt vẽ mỗi khung hình | ≤ 150 | — |

Đồ lặp lại (bàn ghế lớp, ghế nhựa, sỏi, bi) dùng **vẽ hàng loạt (instancing)**; vật tĩnh gộp theo vật liệu.

### 1.3 Nhân vật *(CONFIRMED 20/11: dựng model 3D semi-chibi, chiều cao chuẩn hóa ~1,3–1,5 m)*
| Hạng mục | Quy chuẩn |
|---|---|
| Chiều cao | Lớp 6–7: **1,30–1,40 m** · lớp 8–9: **1,40–1,50 m**. Quân cao nhất nhóm (chạm mức trên); Hạ và Đức ở mức dưới *(chia theo người: PROPOSED)* |
| Tỉ lệ | Semi-chibi: đầu to, khoảng 3–3,5 đầu cho cả thân |
| Kiểm tra bắt buộc | Đứng cạnh `PRP_DESK_2SEAT` (mặt bàn ≈ 0,7 m): mặt bàn phải ngang khoảng hông nhân vật. Lỗi 0,70 m ở nhánh asset ngày 20/11 phải sửa |
| Bộ xương | **Một bộ xương dùng chung** cho mọi nhân vật học sinh, để dùng chung hoạt ảnh |
| Biến thể tuổi | `AGE_G6_7` và `AGE_G8_9` = đổi tỉ lệ xương + tóc + phụ kiện, không dựng lại từ đầu |
| Trang phục | Áo sơ mi trắng có bảng tên, quần tây xanh đậm, giày bata; khăn quàng đỏ (lớp 6–7, phụ kiện gắn rời); áo thun lớp (Hội trại) |
| Nhận diện | Không đổi các dấu hiệu ở `01` §2.1 khi chưa được duyệt |

**Hoạt ảnh cần có**
| Hoạt ảnh | Dùng cho | Tầng |
|---|---|---|
| Đứng thở, đi, chạy, nói | Mọi Trang | A |
| Tạo dáng ×3 (chữ V, vẫy tay, dang tay) | Chụp hẹn giờ | A |
| Reo mừng, cười | Ảnh, cổ vũ | A |
| Ngồi ghế, ngồi bệt, ngồi xổm | Tạp hóa, Căn cứ, lửa trại | A |
| Lau bảng, viết/ký | Trang 1, 5, 9 | A |
| Đá cầu | Trang 1 | A |
| Thả thuyền, cúi người | Trang 2 | A |
| Bê đồ (Quân) | Trang 3, 8, 9 | A |
| Cõng (Quân cõng Đức) | Trang 9 | A — có thể đơn giản hóa thành Quân kéo tay Đức chạy vào nếu khó |
| Ném chai, ném sành | Lật chai, lò cò | B |
| Nhảy lò cò 1 chân / 2 chân, cúi nhặt | Lò cò | B |
| Ngồi bắn bi | Bi ve | B |
| Rải sỏi | Ô ăn quan | B |

---

## 2. Kiểm kê mô hình 3D (`.glb`)

### 2.1 Nhân vật
| Mã | Tên | Dùng ở | Cách làm | Tầng | Trạng thái |
|---|---|---|---|---|---|
| `CHR_PLAYER_M` | Player nam (2 bộ tuổi) | Mọi Trang | Blender | A | [Cần chỉnh sửa] — nhánh asset có nhân vật có xương nhưng chỉ cao 0,70 m |
| `CHR_PLAYER_F` | Player nữ (2 bộ tuổi) | Mọi Trang | Blender | A | [Cần chỉnh sửa] |
| `CHR_DUC` | Đức "Tí Nổ" — gầy, tóc dựng, bút bi | Mọi Trang | Blender | A | [Cần chỉnh sửa] |
| `CHR_QUAN` | Quân "Bắp" — to cao, tóc húi cua | Trang 2–9 | Blender | A | [Cần chỉnh sửa] |
| `CHR_CHAU` | Châu — tóc buộc gọn, đồng hồ | Mọi Trang | Blender | A | [Cần chỉnh sửa] |
| `CHR_HA` | Hạ — tóc dài, kẹp tóc | Trang 2–9 | Blender | A | [Cần chỉnh sửa] |
| `CHR_NPC_DIEP` | Cô Diệp, cô chủ nhiệm (người lớn) | Trang 5–9 | Blender | A | [Đã có ý tưởng] — chưa có mô tả ngoại hình |
| `CHR_NPC_GUARD` | Bác bảo vệ, chùm chìa khóa | Trang 5 | Blender | A | [Đã có ý tưởng] |
| `CHR_NPC_SHOPKEEPER` | Chú chủ tiệm tạp hóa | Trang 8 | Blender | A | [Đã có ý tưởng] |
| `CHR_NPC_TU` | Tú, bạn cùng lớp | Trang 6 | Dùng mẫu học sinh phụ | A | [Cần tạo mới] |
| `CHR_NPC_STUDENT_01..03` | Học sinh phụ (đổi tóc, màu) | Nền mọi Trang; bạn chụp giùm ở Trang 5 | Blender | A | [Cần tạo mới] |
| `PRP_SCARF_RED` | Khăn quàng đỏ (gắn rời) | Lớp 6–7 | Script | A | [Cần tạo mới] |
| `PRP_SHIRT_CLASS` | Áo thun lớp (đổi màu thân áo) | Trang 8 | Đổi vật liệu | A | [Cần tạo mới] |
| `PRP_SHIRT_SIGNED` | Áo trắng có chữ ký (vẽ chữ bằng canvas) | Trang 9, phòng 2026 | Đổi vật liệu | A | [Cần tạo mới] |

### 2.2 Bản đồ trường `map_thcs`
| Mã | Tên | Khu | Cách làm | Tầng | Trạng thái |
|---|---|---|---|---|---|
| `ENV_SCHOOL_BLOCK` | Dãy lớp 2 tầng (tường vàng, cửa sổ nan chớp xanh, mái ngói đỏ, hành lang cột trắng) | Z01/Z02b | Code | A | [Cần chỉnh sửa] — đã dựng bằng code 13/11, cần thêm biến thể lớp 8–9 |
| `ENV_CLASSROOM` | Phòng học vào được: bàn ghế đôi, bảng đen, bục giảng, cửa sổ | Z01 | Code + Script | A | [Cần tạo mới] |
| `PRP_DESK_2SEAT` | Bàn học 2 chỗ (232 tam giác) | Z01 | Script | A | [Cần chỉnh sửa] — đã có, chờ duyệt kiểu bàn cho năm 2014–2018 |
| `PRP_CHAIR_STUDENT` | Ghế/băng ghế học sinh | Z01 | Script | A | [Cần tạo mới] |
| `PRP_BLACKBOARD` | Bảng đen (vùng vẽ phấn + vùng lau) | Z01 | Script | A | [Cần chỉnh sửa] — nhánh asset có bảng, cần kiểm kích thước và gốc |
| `PRP_TEACHER_DESK` | Bục + bàn giáo viên | Z01 | Script | A | [Cần tạo mới] |
| `PRP_COUNTDOWN_BOARD` | Bảng đếm ngược ngày thi (số đổi bằng canvas) | Z01 lớp 9 | Script | A | [Cần tạo mới] |
| `PRP_WALL_NEWSPAPER` | Khung báo tường + 4 phần dán | Z01, Trang 7 | Script + 2D | A | [Cần tạo mới] |
| `PRP_CALENDAR_BLOC` | Lịch bloc treo tường | Z01, Trang 8 | Script | A | [Cần tạo mới] |
| `ENV_CORRIDOR_EAVE` | Hành lang, mái hiên, bảng phân lớp | Z02b | Code | A | [Cần chỉnh sửa] |
| `ENV_GUTTER` | Rãnh nước có nước chảy (đua thuyền) | Z02b | Code | A | [Cần tạo mới] |
| `ENV_YARD` | Sân xi măng chia ô, bồn cây | Z02 | Code | A | [Cần chỉnh sửa] — đã có góc sân |
| `ENV_TREE_PHUONG` | Cây phượng (biến thể: lá xanh / hoa nở rộ) | Z02 | Blender | A | [Cần chỉnh sửa] — nhánh asset: mỗi cây nặng gấp khoảng 4 lần cả khu sân, phải giảm |
| `ENV_TREE_BANG` | Cây bàng tán tầng | Z02 | Blender | A | [Cần chỉnh sửa] — nhánh asset: "cây bóng mát" là bản sao cây phượng, ghi sai nguồn trong bảng ghi công |
| `PRP_FLAGPOLE` | Cột cờ | Z02 | Code | A | [Cần chỉnh sửa] — đã có |
| `PRP_STONE_BENCH` | Ghế đá (Trang 6 lần trêu thứ ba — CONFIRMED 20/11, Trang 9) | Z02 | Code | A | [Cần chỉnh sửa] — đã có |
| `PRP_BASKET_HOOP` | Cột bóng rổ góc sân | Z02 | Script | A | [Cần tạo mới] |
| `ENV_GATE` | Cổng trường sắt (mở/khóa) | Z03 | Script | A | [Cần tạo mới] |
| `ENV_SNACK_CART` | Xe quà vặt cổng trường + bàn nhựa (chỗ lật chai) | Z03 | Blender | A | [Cần tạo mới] |
| `ENV_GROCERY_SHOP` | Tiệm tạp hóa: mái, kệ, tủ kính kẹo, bậc thềm | Z03 | Blender | A | [Cần tạo mới] |
| `PRP_TV_OLD` | Tivi trong tiệm (màn hình phát hình trận đấu giả, không dùng hình thật) | Z03, Trang 8 | Script + 2D | A | [Cần tạo mới] |
| `PRP_PLASTIC_STOOL` | Ghế nhựa đỏ/xanh | Z03, Trang 8 | Script | A | [Cần tạo mới] |
| `ENV_STOREHOUSE` | Nhà kho góc sân sau | Z05 | Code | A | [Cần tạo mới] |
| `ENV_BASE` | Căn cứ: mái che, gốc cây, thùng giấy, bàn kê; 3 kiểu trang trí (giấy màu / hoa / ảnh) | Z05 (trong trường, góc sân sau — CONFIRMED 20/11) | Script | A | [Cần tạo mới] |
| `PRP_BASE_SIGN` | Biển tên "CĂN CỨ BÍ MẬT" | Z05, kỷ vật Trang 3 | Script | A | [Cần tạo mới] |
| `PRP_GAME_BOARD_SIGN` | Tấm carton "Bảng trò chơi" ở Căn cứ | Z05 | Script | B | [Cần tạo mới] |

### 2.3 Hội trại (Trang 8, Z02 biến thể đêm, tháng 3/2018 — CONFIRMED 20/11)
| Mã | Tên | Cách làm | Tầng | Trạng thái |
|---|---|---|---|---|
| `PRP_TENT` | Lều trại (hình lăng trụ) | Code | A | [Cần tạo mới] |
| `PRP_CAMP_GATE_ROCKET` / `_LEAF` / `_PLAIN` | Cổng trại 3 kiểu: tên lửa / chiếc lá / thường | Script | A | [Đã có ý tưởng] — cần phác hình 3 kiểu |
| `PRP_STRING_LIGHTS` | Đèn dây (khối phát sáng, vẽ hàng loạt) | Code | A | [Cần tạo mới] |
| `PRP_CHARCOAL_STOVE` | Bếp than nhỏ thay lửa trại lớn (v1.4) | Script | A | [Cần tạo mới] |
| `PRP_PENNANT` | Cờ đuôi nheo | Code | A | [Cần tạo mới] |
| `PRP_LOG_SEAT` | Khúc gỗ ngồi / đặt máy ảnh | Script | A | [Cần tạo mới] |
| `PRP_CORN_GRILLED` | Bắp nướng | Script | A | [Cần tạo mới] |
| `PRP_TENT_STAKE` | Cọc trại (dọn trại sáng hôm sau) | Script | A | [Cần tạo mới] |

### 2.4 Phòng 2026 `hub_room` (tươi sáng, ấm từ đầu, ít đồ — CONFIRMED 20/11)
| Mã | Tên | Cách làm | Tầng | Trạng thái |
|---|---|---|---|---|
| `ENV_ROOM_2026` | Phòng trọ: tường sáng, sàn gạch, cửa sổ lớn | Code | A | [Cần tạo mới] |
| `PRP_BED` | Giường | Script | A | [Cần tạo mới] |
| `PRP_DESK_2026` | Bàn học người lớn | Script | A | [Cần tạo mới] |
| `PRP_SHELF_2026` | Kệ (đồ được thêm dần sau mỗi Trang) | Script | A | [Cần tạo mới] |
| `PRP_PHOTO_WALL` | Mảng tường dán ảnh (ảnh lấy từ Album người chơi) | Code | A | [Cần tạo mới] |
| `PRP_MEMORY_BOX` | Thùng carton kỷ vật (nắp mở, đồ bên trong sáng lên) | Script | A | [Cần tạo mới] |
| `PRP_ALBUM_3D` | Cuốn Album trên bàn (mở ra là giao diện 2D) | Script | A | [Cần tạo mới] |
| `PRP_PHONE_2026` | Điện thoại của Player (mở ra là giao diện 2D) | Script | A | [Cần tạo mới] |
| `PRP_PENCIL_CUP` | Hộp bút (cắm cờ giấy sau Trang 8) | Script | A | [Cần tạo mới] |
| `PRP_GLASS_FRAME_SMALL` | Khung kính nhỏ (mẩu giấy mật lệnh) | Script | A | [Cần tạo mới] |
| `PRP_WINDOW_SILL` | Bậu cửa sổ (đặt viên bi) | Code | A | [Cần tạo mới] |

### 2.5 Kỷ vật dẫn vào (đặt trong thùng, rồi lên bàn/kệ)
| Mã | Kỷ vật | Trang | Cách làm | Trạng thái |
|---|---|---|---|---|
| `PRP_NOTE_CIPHER` | Mẩu giấy mật lệnh có nét sửa đỏ | 1 | Script + chữ canvas | [Cần tạo mới] |
| `PRP_PAPER_BOAT_HA` | Thuyền giấy của Hạ, buồm có chữ ký + lời ước | 2 | Script | [Cần tạo mới] |
| `PRP_RULEBOOK` | Sổ luật bìa xanh (mở được; có trang Điều 6 và Bảng tỉ số) | 3, 9, kết demo | Script + 2D | [Cần tạo mới] |
| `PRP_PHOTO_STAINED` | Ảnh nhóm bị ố | 4 | Code (ảnh lấy từ Album + lớp ố) | [Cần tạo mới] |
| `PRP_CHALKBOX_KV01` | **KV-01** hộp phấn, một mẩu phấn, mặt trong nắp ghi "QUÂN {quan} – ĐỨC {duc} (CHƯA XONG)" — chữ vẽ bằng canvas lúc chạy; trước Trang 5 hai con số nhòe | 5 | Script + chữ canvas | [Cần tạo mới] |
| `PRP_LEAF_DRAWING` | Tờ vẽ chiếc lá bút chì, góc "Chưa dám đưa." | 6 | 2D trên mặt phẳng | [Cần tạo mới] |
| `PRP_NEWSPAPER_A5` | Bản báo tường A5, ô có vệt sáp nhòe (CONFIRMED 20/11) | 7 | 2D trên mặt phẳng | [Cần tạo mới] |
| `PRP_CALENDAR_2018_01` | Tờ lịch 1/2018 khoanh ngày 27, chữ "CHUNG KẾT" | 8 | 2D trên mặt phẳng | [Cần tạo mới] |
| `PRP_YEARBOOK` | Sổ lưu bút bìa nâu kraft | 9 | Script | [Cần tạo mới] |

### 2.6 Đạo cụ trong cảnh
| Mã | Tên | Trang | Cách làm | Tầng | Trạng thái |
|---|---|---|---|---|---|
| `PRP_CAMERA_COMPACT` | Máy ảnh compact của Player | Mọi Trang | Script | A | [Cần tạo mới] |
| `PRP_NOTEBOOK_SMALL` | Sổ nhỏ của Player | 1, 6, 7 | Script | A | [Cần tạo mới] |
| `PRP_CHALK` | Viên phấn | 5 | Script | A | [Cần tạo mới] |
| `PRP_RAG` | Giẻ lau bảng | 1, 5 | Script | A | [Cần tạo mới] |
| `PRP_BROOM` | Chổi (quét sân, giấy vụn) | 6, 7 | Script | A | [Cần tạo mới] |
| `PRP_SHUTTLECOCK` | Quả cầu đá | 1 | Script | A | [Cần tạo mới] |
| `PRP_NOODLE_PACK` | Gói mì + gói gia vị (bao bì tự nghĩ) | 1 | Script | A | [Cần tạo mới] |
| `PRP_PAPER_BOAT_x3` | Thuyền giấy 3 kiểu gấp (buồm / mui / đôi) | 2 | Script | A | [Cần tạo mới] |
| `PRP_TRASH_FLOAT` | Rác trôi trên rãnh: lá, vỏ kẹo, que kem | 2 | Script | A | [Cần tạo mới] |
| `PRP_CARDBOARD_BOX` | Thùng giấy cũ (dựng Căn cứ) | 3 | Script | A | [Cần tạo mới] |
| `PRP_BASKETBALL_OLD` | Quả bóng cũ + bơm | 5, **6** *(nhánh Thử thách ném rổ)* | Script | A | [Cần tạo mới] |
| `PRP_WATER_BOTTLE` | Chai nước nhựa (có mức nước nhìn thấy, mặc định 1/3) | 5, lật chai | Script | B | [Cần tạo mới] |
| `PRP_PHONE_OLD_2017` | Điện thoại cũ của anh trai Đức | 6 | Script | A | [Cần tạo mới] |
| `PRP_VALENTINE_MAILBOX` | **Hòm thư Valentine** — hộp giày có khe thư, **ngăn chung**, nắp; dán giấy 3 mặt; màu và họa tiết đổi theo `boxStyle` (`02` §4.2). Hình ở Căn cứ Trang 6, 7, 9 | 6 (làm ở Cảnh B, dùng ở Cảnh B và D), 7, 9 (nền) | Script (thân hộp, khe, ngăn) + canvas (giấy, họa tiết) | A | **[Đã có ý tưởng]** — chờ concept hòm thư |
| `PRP_MAILBOX_RULES_BOARD` | Bảng nội quy hòm thư, 3 điều (chữ canvas); vài kiểu bảng để chọn | 6, 7, 9 (nền) | 2D trên mặt phẳng | A | **[Đã có ý tưởng]** — chờ concept bảng |
| `PRP_CRAFT_SUPPLIES` | Giấy màu, bút, keo, ruy-băng, hình trái tim / ngôi sao (vật liệu làm hòm thư) | 6 | Script + 2D | A | [Cần tạo mới] |
| `PRP_VALENTINE_LETTER` | Lá thư + phong bì (thư riêng 3 loại, thư chung; chữ lấy từ danh sách chọn sẵn) **và thư xin lỗi của Đức** (phong bì ghi "Hạ", 4 dòng thân thư cố định + 3 câu mở đầu để chọn) | 6 (Cảnh B, D) | Script + chữ canvas | A | [Cần tạo mới] |
| `PRP_VALENTINE_SNACKS` | Ba món ăn vặt + bảng giá nhỏ (nhánh Kèo ăn vặt, xe quà vặt Z03) | 6 | Script | A | [Cần tạo mới] |
| `PRP_SHOP_LIST_ITEMS` | Băng keo, ghim giấy, 1 món cho Căn cứ + sổ mua sắm của Châu (nhánh Danh sách mua sắm, tiệm tạp hóa Z03) | 6 | Script | A | [Cần tạo mới] |
| `PRP_DECOR_SET` | Bộ trang trí Căn cứ 4 nhóm: đồ treo (dây cờ giấy, dây đèn) · đồ đặt bàn (bình hoa giấy, hộp bánh) · ảnh/kỷ niệm (kéo ảnh trong Album dán tường) · vật trang trí trung tâm (bảng "Valentine năm đứa", gấu bông) — **Minigame 3**, nhánh chung "Một buổi Valentine của năm đứa" (`02` §2.5.3c). Tên món là gợi ý, chốt khi dựng | 6 | Script | A | [Cần tạo mới] |
| `PRP_SLIME` | Slime | 7 | Script | A | [Cần tạo mới] |
| `PRP_HIGHLIGHTER_YELLOW` | Bút highlight vàng của Châu | 7 | Script | A | [Cần tạo mới] |
| `PRP_PAPER_FLAG` | Lá cờ giấy tô sáp | 8 | Script + vùng tô | A | [Cần tạo mới] |
| `PRP_CRAYON_SET` | Hộp sáp màu | 8, 9 | Script | A | [Cần tạo mới] |
| `PRP_MARBLE_CATEYE` | Viên bi mắt mèo (dùng chung với bi ve) | 9, bi ve | Script | A | [Cần tạo mới] |
| `PRP_KEYRING` | Chùm chìa khóa bác bảo vệ | 5 | Script | A | [Cần tạo mới] |
| `PRP_SCHOOL_BAG` | Cặp/ba lô (ba lô màu của Player: đề xuất cũ, chưa duyệt) | Mọi Trang | Script | A | [Đã có ý tưởng] |

### 2.7 Khu Vui Chơi Căn cứ (Z05)
| Mã | Tên | Trò | Cách làm | Tầng | Trạng thái |
|---|---|---|---|---|---|
| `DCL_OAQ_BOARD` | Bàn Ô ăn quan vẽ phấn trên nền (10 ô dân + 2 ô quan) | Ô ăn quan | Code (hình dán) | B | [Cần tạo mới] |
| `PRP_PEBBLE` | Sỏi dân (vẽ hàng loạt, 50 viên) | Ô ăn quan | Script | B | [Cần tạo mới] |
| `PRP_PEBBLE_QUAN` | Viên quan (lớn, màu khác) | Ô ăn quan | Script | B | [Cần tạo mới] |
| `PRP_OAQ_WOOD_BOARD` | Bàn gỗ Ô ăn quan (phương án thay) | Ô ăn quan | Script | C | [Đã có ý tưởng] |
| `DCL_HOPSCOTCH` | Sân lò cò 10 ô vẽ phấn trên đất, có số | Lò cò | Code (hình dán) | B | [Cần tạo mới] |
| `PRP_POTTERY_SHARD` | Miếng sành ném | Lò cò | Script | B | [Cần tạo mới] |
| `DCL_MARBLE_RING` | Vòng phấn đường kính 1,2 m + vạch bắn | Bi ve | Code (hình dán) | B | [Cần tạo mới] |
| `PRP_MARBLE` | Bi ve thường (7 viên, vẽ hàng loạt) + bi cái | Bi ve | Script | B | [Cần tạo mới] |

---

## 3. Giao diện 2D (UI overlay)
Toàn bộ dựng bằng Preact + canvas, font Nunito; nền sáng, góc bo, cảm giác giấy và sổ tay học trò (`00` §7.4).

| Mã | Màn hình | Dùng ở | Tầng | Trạng thái |
|---|---|---|---|---|
| `UI_TITLE_LOADING` | Trang giới thiệu, nút Chơi, màn tải có hướng dẫn phím | Web | A | [Cần chỉnh sửa] — đã có trang chạy trên Vercel, cần đổi theo bản mới |
| `UI_NAME_APPEARANCE` | Nhập tên + chọn ngoại hình nam/nữ | Mở đầu | A | [Cần tạo mới] |
| `UI_HUD` | Dòng mục tiêu, điểm đánh dấu, gợi ý phím, tên khu | Mọi Trang | A | [Cần chỉnh sửa] — đã có bản mẫu 13/11 |
| `UI_DIALOGUE` | Ô thoại 2 dòng, tên người nói có màu riêng, 2–3 lựa chọn | Mọi Trang | A | [Cần tạo mới] |
| `UI_TIME_CARD` | Thẻ chữ thời gian ("Lớp 7. Một chiều mưa.") | Mọi cảnh | A | [Cần tạo mới] |
| `UI_CAMERA` | Khung ngắm, đồng hồ hẹn giờ, 3 dấu Đủ người / Trong khung / Kịp tạo dáng, nút Chụp lại / Giữ ảnh này | Mọi Trang | A | [Cần tạo mới] |
| `UI_ALBUM` | Album: bìa, trang theo Trang, trang mờ/rõ, lật mặt sau ảnh, chọn ảnh hiển thị | Phòng 2026 | A | [Cần tạo mới] |
| `UI_JOURNAL` | Sổ tay J/Tab: mục tiêu, Side, Album | Mọi Trang | A | [Cần tạo mới] |
| `UI_PAUSE_MENU` | Esc: tiếp tục, về chỗ an toàn, cài đặt, bỏ ván | Mọi lúc | A | [Cần tạo mới] |
| `UI_CONFESSION` | Trang confession hư cấu: tiêu đề, số thứ tự bài, bình luận | Trang 6 | A | [Cần tạo mới] |
| `UI_PHONE_CHAT` | Điện thoại 2026: nhóm chat hư cấu, 3 tin để chọn, nút Gửi, "Đã gửi… (còn tiếp)" | Kết demo | A | [Cần tạo mới] |
| `UI_RULEBOOK` | Mở sổ luật: các Điều, Điều 6, trang Bảng tỉ số | Trang 3, 9, kết demo, Khu Vui Chơi | A | [Cần tạo mới] |
| `UI_PAGE_RESTORE` | Hiệu ứng trang Album từ mờ sang rõ khi về phòng | Sau mỗi Trang | A | [Cần tạo mới] |
| `UI_FEEDBACK_FORM` | Form phản hồi sau kết demo | Web | A | [Cần chỉnh sửa] — mới là chỗ giữ chỗ (kiểm 20/11) |
| `UI_MG_FRAME` | Khung chung minigame: màn hướng dẫn luật bằng hình (bắt buộc cho mọi trò — CONFIRMED 20/11), nút "?", màn kết quả Thắng/Thua/Hòa, sao, Chơi lại / Tiếp tục | Mọi minigame | A | [Cần tạo mới] |
| `UI_MG_POWERBAR` | Thanh lực, vòng canh nhịp, thanh thăng bằng | Đá cầu, thuyền, lò cò, cổ vũ | A | [Cần tạo mới] |
| `UI_CARO_BOARD` | Bàn caro 12×12 / 15×15 trên nền bảng đen, quân X/O nét phấn, chọn đối thủ Đức/Quân | Trang 5 | A | [Cần tạo mới] |
| `UI_SUDOKU_PAPER` | Giấy tập ô li, lưới 6×6 / 9×9, bàn số, ghi chú nháp, gợi ý (còn x/3), đồng hồ của Châu 6 phút | Trang 7 cảnh A | A | [Cần tạo mới] |
| `UI_MINI_K` | Màn ghép cặp mật lệnh, ghép luật, đặt đồ vào ô (K3/K4) | Trang 1, 3, 4, **6**, 7, 8, 9 | A | [Cần tạo mới] |
| `UI_MAILBOX_CRAFT` | Màn làm hòm thư: bàn vật liệu, hộp, 5 bước (màu nền · dán 3 mặt · trang trí · khe + ngăn chung + nắp · bảng nội quy), chọn kiểu bảng | Trang 6 Cảnh B | A | [Cần tạo mới] |
| `UI_APOLOGY_LETTER` | Màn thư xin lỗi của Đức: chọn 1 trong 3 câu mở đầu → lật từng dòng thư viết tay → kéo thư (phong bì ghi "Hạ") vào khe hòm. Dùng chung khung với `UI_LETTER_READ` (`02` §2.5.1b) | Trang 6 Cảnh B | A | [Cần tạo mới] |
| `UI_LETTER_PICKER` | Chọn người nhận (Đức / Châu / Quân / Hạ / cả nhóm) → loại thư (3) hoặc câu thư chung (4) hoặc bảng vẽ tranh nhỏ (kéo thả hình có sẵn); xem trước thư; nút "Bỏ vào hòm". **Chỉ chọn từ danh sách, không nhập chữ tự do** | Trang 6 Cảnh D | A | [Cần tạo mới] |
| `UI_LETTER_READ` | Hiện lá thư khi mở chung ở ngăn chung (và khung đọc thư xin lỗi); nút "Cho mọi người xem / Giữ riêng" cho ảnh "Player × bạn" | Trang 6 Cảnh D | A | [Cần tạo mới] |
| `UI_VALENTINE_MINI` | Giao diện **3 minigame** buổi chiều Valentine (`02` §2.5.3a–c): **(1)** Ném bóng — thanh lực xanh-vàng-đỏ, bộ đếm vòng/quả, nút "Chơi lại vòng", "Bỏ qua"; **(2)** Săn góc ảnh — lưới 3×3 mờ + ô đích trên khung ngắm, dấu "Đúng gợi ý", nút "Giữ ảnh này", màn Hạ chọn ảnh; **(3)** Trang trí Căn cứ — khay vật phẩm 4 nhóm, ô đặt, khay ảnh Album. Thêm khung câu hỏi nhanh "Đoán xem ai là người…" và nút "Bỏ qua" dùng chung | Trang 6 nhánh chiều | A | [Đã có ý tưởng] |
| `UI_BOTTLE_HUD` | Đường kéo, đường dự đoán (chế độ Dễ), điểm 5 lượt, ảnh khoảnh khắc | Lật chai | B | [Cần tạo mới] |
| `UI_OPPONENT_SELECT` | Chọn trò + chọn 1 trong 4 bạn, mỗi bạn hiện độ khó của trò đó và tỉ số đã đấu | Khu Vui Chơi | B | [Cần tạo mới] |
| `UI_PORTRAIT_x4` | Ảnh chân dung 4 bạn cho màn chọn đối thủ — **chụp từ model trong game**, không vẽ riêng | Khu Vui Chơi | B | [Cần tạo mới] |
| `UI_OAQ_HUD` | Ô ăn quan: chọn ô, mũi tên hướng, điểm hai bên, tua nhanh | Ô ăn quan | B | [Cần tạo mới] |
| `UI_HOPSCOTCH_HUD` | Lò cò: ô hiện tại, phím nhịp, thanh thăng bằng | Lò cò | B | [Cần tạo mới] |
| `UI_MARBLE_HUD` | Bi ve: đường ngắm, lực kéo, mức xoáy, số bi đã ăn | Bi ve | B | [Cần tạo mới] |

---

## 4. Âm thanh

### 4.1 Nguyên tắc *(PROPOSED trừ chỗ ghi khác)*
- Hiệu ứng (SFX) **tổng hợp bằng Web Audio API** trong code, không cần file (theo `GDD.md` v0.3 §13). Chỗ nào tổng hợp nghe không ổn thì dùng file có giấy phép CC0, ghi vào `CREDITS.md`.
- Nhạc nền (BGM): chỉ dùng bản **có giấy phép rõ**, do chủ dự án chọn và tải (Claude không tải nhạc từ web được). Không mô phỏng giai điệu bài hát có thật.
- **Không lồng tiếng.** Tin nhắn thoại trong điện thoại hiện bằng bong bóng chữ.
- Bài hát "đang hot" trong kịch bản chỉ là lời thoại; **không phát bản thu thật** khi chưa có giấy phép.
- Âm lượng tách 3 kênh: Nhạc · Hiệu ứng · Giao diện; chỉnh trong menu.

### 4.2 Hiệu ứng âm thanh
| Mã | Âm thanh | Dùng ở | Tầng | Trạng thái |
|---|---|---|---|---|
| `SFX_SCHOOL_DRUM` | Trống trường | Chuyển cảnh, ra chơi | A | [Cần tạo mới] |
| `SFX_FOOTSTEP` | Bước chân trên xi măng / đất / gạch | Đi lại | A | [Cần tạo mới] |
| `SFX_CHALK_WRITE` | Phấn viết bảng, gõ phấn | Trang 1, 5, caro | A | [Cần tạo mới] |
| `SFX_BOARD_WIPE` | Lau bảng | Trang 1, 5 | A | [Cần tạo mới] |
| `SFX_PAPER` | Giấy sột soạt, gấp giấy, lật trang | Nhiều Trang, Album | A | [Cần tạo mới] |
| `SFX_SHUTTER` | Màn trập máy ảnh | Chụp ảnh | A | [Cần tạo mới] |
| `SFX_TIMER_BEEP` | Tít tít hẹn giờ | Chụp hẹn giờ | A | [Cần tạo mới] |
| `SFX_FLASH` | Flash + chuyển về phòng | Hết Trang | A | [Cần tạo mới] |
| `SFX_RAIN` | Mưa (to dần / nhỏ dần) | Trang 2, 4 | A | [Cần tạo mới] |
| `SFX_WATER_FLOW` | Nước chảy trong rãnh | Trang 2 | A | [Cần tạo mới] |
| `SFX_SHUTTLECOCK_KICK` | Tiếng đá cầu | Trang 1 | A | [Cần tạo mới] |
| `SFX_NOODLE_CRUSH` | Bóp mì giòn | Trang 1 | A | [Cần tạo mới] |
| `SFX_KEYS_JINGLE` | Chùm chìa khóa bác bảo vệ | Trang 5 | A | [Cần tạo mới] |
| `SFX_GATE_LOCK` | Cổng sắt khóa | Trang 5 | A | [Cần tạo mới] |
| `SFX_PHONE_VIBRATE` | Điện thoại rung | Trang 6, 9, kết demo | A | [Cần tạo mới] |
| `SFX_GLUE_PAPER` | Dán giấy, bóc băng keo, gắn khe thư | Trang 6 (làm hòm thư) | A | [Cần tạo mới] |
| `SFX_LETTER_DROP` | Thả thư vào khe hòm | Trang 6 | A | [Cần tạo mới] |
| `SFX_MAILBOX_OPEN` | Mở nắp hòm thư | Trang 6 (tối 14/2) | A | [Cần tạo mới] |
| `SFX_MSG_SEND` | Gửi tin nhắn | Kết demo | A | [Cần tạo mới] |
| `SFX_CROWD_CHEER` | Cả tiệm hò reo / im lặng / vỗ tay | Trang 8 | A | [Cần tạo mới] |
| `SFX_CHEER_DRUM` | Trống cổ vũ theo nhịp | Trang 8 | A | [Cần tạo mới] |
| `SFX_FIRE_CRACKLE` | Than nổ tí tách | Trang 8 | A | [Cần tạo mới] |
| `SFX_UI_CLICK` / `_OPEN` / `_CLOSE` | Giao diện | Mọi lúc | A | [Cần tạo mới] |
| `SFX_PAGE_RESTORE` | Trang Album hiện rõ | Về phòng | A | [Cần tạo mới] |
| `SFX_MG_WIN` / `_LOSE` / `_STAR` | Kết quả minigame | Mọi minigame | A | [Cần tạo mới] |
| `SFX_CARO_PLACE` | Đặt quân caro (gõ phấn) | Caro | A | [Cần tạo mới] |
| `SFX_PENCIL_WRITE` | Bút chì viết số | Sudoku | A | [Cần tạo mới] |
| `SFX_BOTTLE_LAND` / `_FALL` | Chai đứng (tiếng "cộp") / chai ngã | Lật chai | B | [Cần tạo mới] |
| `SFX_WATER_SLOSH` | Nước óc ách trong chai | Lật chai | B | [Cần tạo mới] |
| `SFX_PEBBLE_DROP` | Sỏi rơi vào ô | Ô ăn quan | B | [Cần tạo mới] |
| `SFX_SHARD_THROW` / `_LAND` | Ném sành / sành rơi | Lò cò | B | [Cần tạo mới] |
| `SFX_HOP` | Nhảy lò cò | Lò cò | B | [Cần tạo mới] |
| `SFX_MARBLE_HIT` / `_ROLL` | Bi va nhau / bi lăn trên đất | Bi ve | B | [Cần tạo mới] |
| `SFX_FLICK_EAR` | Búng tai "tách" vui | Oẳn tù tì | C | [Đã có ý tưởng] |

### 4.3 Nhạc nền
| Mã | Không khí | Dùng ở | Tầng | Trạng thái |
|---|---|---|---|---|
| `BGM_ROOM_2026` | Guitar mộc / lo-fi nhẹ, ấm, hơi trống trải | Phòng 2026 | A | [Đã có ý tưởng] — chờ chủ dự án chọn bản có giấy phép |
| `BGM_M1_DAY` | Sáng, vui, tò mò | Mốc 1 | A | [Đã có ý tưởng] |
| `BGM_M2_DUSK` | Hoàng hôn, bồi hồi | Mốc 2 | A | [Đã có ý tưởng] |
| `BGM_RAIN` | Nhẹ, ấm trong mưa | Trang 2, 4 | A | [Đã có ý tưởng] |
| `BGM_CAMP_NIGHT` | Đêm, ấm, thật lòng | Trang 8 | A | [Đã có ý tưởng] |
| `BGM_MINIGAME` | Vui, nhịp vừa | Minigame, Khu Vui Chơi | A | [Đã có ý tưởng] |
| `BGM_ENDING_DEMO` | Lắng, mở ra hy vọng | Kết demo | A | [Đã có ý tưởng] |

Âm thanh nền (tiếng sân trường, ve kêu, xe máy xa) có thể tổng hợp hoặc dùng file CC0 *(PROPOSED, Tầng B)*.

---

## 5. Thứ tự sản xuất đề xuất *(PROPOSED)*
1. Sửa nhân vật về chiều cao chuẩn + bộ xương dùng chung + hoạt ảnh Tầng A.
2. Phòng học, bảng đen, hộp phấn KV-01, phòng 2026, thùng kỷ vật, giao diện thoại / máy ảnh / Album.
3. Kỷ vật 9 Trang, đạo cụ Tầng A theo thứ tự Trang.
4. Giao diện caro, Sudoku, khung minigame.
5. Xe quà vặt, tiệm tạp hóa, đồ Hội trại.
6. Đồ Khu Vui Chơi (hình vẽ phấn, sỏi, bi, sành) — Tầng B.
7. Âm thanh tổng hợp song song; nhạc nền chờ chủ dự án chọn.

Mỗi asset chỉ đánh dấu xong khi đã xem trong game (đúng gốc `min.y = 0`, đúng tỉ lệ cạnh bàn học, đúng màu) và đã ghi vào `assets.json` + `CREDITS.md`.

## 6. Điểm còn mở
| # | Vấn đề | Ghi chú |
|---|---|---|
| 1 | Ngoại hình cô Diệp, bác bảo vệ, chú chủ tiệm | Chưa có mô tả; cần một dòng mô tả mỗi người hoặc ảnh tham chiếu |
| 2 | Hình 3 kiểu cổng trại | Cần phác thảo trước khi dựng |
| 3 | Nhạc nền | Chủ dự án chọn bản có giấy phép |
| 4 | Ngân sách tam giác, dung lượng | Đo lại trên laptop thật, sửa bảng §1.2 |
| 5 | Ba lô màu của Player | Đề xuất từ 13/11, chưa duyệt |
| 6 | Hình hòm thư Valentine và bảng nội quy | **Chặn việc dựng hình cuối.** Chưa có concept; cần ChatGPT/Gemini phác 1 hình hòm thư + 1–2 kiểu bảng nội quy trước khi dựng (quy trình: concept → duyệt → dựng) |

## 7. Changelog
- **v1.2-draft — 21/11/2026 (chiều):** Chốt của chủ dự án: hòm thư làm ở Cảnh B (thứ Sáu), Đức xin lỗi bằng thư, **3 minigame đầy đủ**. `UI_MAILBOX_CRAFT` chuyển sang Cảnh B; thêm `UI_APOLOGY_LETTER`; `PRP_VALENTINE_LETTER` thêm thư xin lỗi; `UI_VALENTINE_MINI` gom về 3 minigame và lên Tầng A; `PRP_VALENTINE_SNACKS`, `PRP_SHOP_LIST_ITEMS` bỏ "bản đầy đủ: B"; `PRP_DECOR_SET` ghi rõ 4 nhóm cho Minigame 3. Điểm còn mở #6 (concept hòm thư + bảng) vẫn chờ.
- **v1.1-draft — 21/11/2026:** Thêm asset **Hòm thư Valentine** (Trang 6, chỉ đạo chủ dự án 21/11): 7 dòng đạo cụ (`PRP_VALENTINE_MAILBOX`, `PRP_MAILBOX_RULES_BOARD`, `PRP_CRAFT_SUPPLIES`, `PRP_VALENTINE_LETTER`, `PRP_VALENTINE_SNACKS`, `PRP_SHOP_LIST_ITEMS`, `PRP_DECOR_SET`), 4 dòng UI (`UI_MAILBOX_CRAFT`, `UI_LETTER_PICKER`, `UI_LETTER_READ`, `UI_VALENTINE_MINI`), 3 SFX, điểm còn mở #6; mở rộng `UI_MINI_K` và `PRP_BASKETBALL_OLD` sang Trang 6. Giữ `PRP_LEAF_DRAWING`, `UI_CONFESSION`, `PRP_PHONE_OLD_2017`, `PRP_BROOM`. Các mục khác không đổi.
- **v1.0 APPROVED — 20/11/2026 (23:30):** Chủ dự án duyệt toàn bộ file. Cập nhật: chữ trên nắp hộp phấn lấy theo tỉ số caro; giao diện Sudoku ở Trang 7 có đồng hồ 6 phút; màn hướng dẫn luật bắt buộc cho mọi minigame.
- **v1.0-draft — 20/11/2026:** Bản đầu. Quy chuẩn kỹ thuật (gốc `min.y = 0`, mét, Y lên, màu tươi sáng, nhân vật 1,3–1,5 m), ngân sách khởi điểm, kiểm kê 3D theo nhóm (nhân vật, trường, Hội trại, phòng 2026, kỷ vật, đạo cụ, Khu Vui Chơi), 25 màn giao diện 2D, hiệu ứng âm thanh và nhạc nền. Ghi các lỗi asset tìm thấy khi kiểm repo ngày 20/11.
