# BLENDER_PIPELINE — sửa bản đồ trong Blender rồi đưa vào game

Viết 15/11/2026 (Chặng 1 của S2). Mọi lệnh có ghi "đã chạy" là đã chạy thật trong phiên đó, bằng gói `bpy` trên Linux. **Chưa chạy bằng `blender.exe` trên Windows.**

Tóm tắt một dòng:

```
sửa file .blend  →  export_world.py (ra .glb)  →  npm run world:index  →  npm run validate:world  →  npm test  →  chơi thử
```

Quy ước của pipeline khai ở **một chỗ duy nhất**: `tools/blender/world/pipeline_config.py`. Phía game có bản đối ứng ở `src/world/types.ts`; test `tests/unit/world/conventions.test.ts` đỏ ngay nếu hai bên lệch nhau.

---

## 1. Chuẩn bị

Có hai cách chạy script. Cả hai cho cùng kết quả (bộ test pipeline đạt 61/61 trên `bpy` 4.5.16 và 5.2.4).

| | Blender cài sẵn | Gói `bpy` trong Python |
|---|---|---|
| Cài | Blender 4.5 LTS hoặc 5.2 LTS (bản chuẩn của dự án chưa chốt — D-S2-05) | Python **3.11** + `pip install bpy==4.5.*` (hoặc Python 3.13 + `bpy==5.2.*`) |
| Mẫu lệnh | `blender --background --python <script> -- <tùy chọn>` | `python <script> <tùy chọn>` |

Chạy mọi lệnh **từ thư mục gốc repo**.

**Windows (PowerShell)** — đường dẫn mặc định của Blender, chưa xác minh trên máy chủ dự án:
```powershell
$B = "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe"
& $B --background --python tools\blender\world\export_world.py -- --zones yard
```
Hoặc dùng gói `bpy` (chưa thử trên Windows):
```powershell
py -3.11 -m venv .venv-bpy
.venv-bpy\Scripts\pip install "bpy==4.5.*"
.venv-bpy\Scripts\python tools\blender\world\export_world.py --zones yard
```

**Linux/macOS với gói `bpy`** (đã chạy):
```bash
python3.11 -m venv ~/venv-bpy && ~/venv-bpy/bin/pip install "bpy==4.5.*"
~/venv-bpy/bin/python tools/blender/world/export_world.py --zones yard
```

Phần dưới viết theo kiểu `python …`. Dùng Blender cài sẵn thì đổi thành `blender --background --python … -- …` (nhớ dấu `--` trước các tùy chọn).

---

## 2. Mở file nào

| Khu | File nguồn (mở trong Blender) | File game (sinh ra, không sửa tay) |
|---|---|---|
| Lớp học | `tools/blender/world/map_thcs/zone_classroom.blend` | `public/assets/world/map_thcs/zone_classroom.glb` |
| Hành lang | `…/zone_corridor.blend` | `…/zone_corridor.glb` |
| Sân trường | `…/zone_yard.blend` | `…/zone_yard.glb` |
| Cổng + ngõ | `…/zone_gate.blend` | `…/zone_gate.glb` |
| Bãi đất | `…/zone_field.blend` | `…/zone_field.glb` |
| Căn cứ bí mật | `…/zone_base.blend` | `…/zone_base.glb` |

Danh sách này lấy từ manifest `src/world/maps/map_thcs.world.json` (trường `source` và `asset`).

- Mỗi khu là một file, **đặt sẵn đúng vị trí trên bản đồ**. Không dời cả khu đi chỗ khác (các khu nối liền nhau).
- 1 đơn vị Blender = 1 mét. Trục: Blender X = game x; Blender Z (lên) = game y; Blender Y = **âm** game z.
- **Bố cục 6 khu đang là bản tạm (D-S2-02, chờ chủ dự án).** Sửa nhỏ phần nhìn thì thoải mái; dời tường, đổi kích thước khu thì nên đợi chốt bố cục.
- File `.blend` hiện được lưu bằng Blender 4.5. Mở bằng 5.2 rồi lưu thì file sẽ thành định dạng 5.2 (4.5 có thể không mở lại được). Thống nhất một bản trước khi sửa (D-S2-05).

---

## 3. Cấu trúc trong mỗi file

### 3.1 Collection
| Collection | Chứa gì | Vào game thành |
|---|---|---|
| `ENVIRONMENT` | mặt đất, nền | phần nhìn |
| `ARCHITECTURE` | tường, mái, cột, bờ | phần nhìn |
| `PROPS` | bàn ghế, cây, xe… | phần nhìn |
| `COLLISION` | hộp `COLLIDER_*` (vật cản), tấm `FLOOR_*` (sàn đi được) — để dạng khung dây, tắt render | va chạm, sàn (ẩn) |
| `ZONE_BOUNDS` | khối `ZONE_*` — đứng trong khối này = đang ở khu này | ranh khu (ẩn) |
| `INTERACTION_MARKERS` | Empty `ITR_*`, `SPOT_*`, `CAM_*`, `TARGET_*` | điểm tương tác, chỗ đứng NPC, máy ảnh |
| `SPAWN_MARKERS` | Empty `SPAWN_*` | điểm xuất hiện |
| `PORTAL_MARKERS` | hộp `PORTAL_*`, `TRIGGER_*` | vùng dịch chuyển (ẩn) |
| `LIGHTING` | `PREVIEW_sun`, `PREVIEW_camera` | **không vào game** (chỉ để xem trong Blender) |

### 3.2 Nhãn gameplay
Ý nghĩa gameplay **không** nằm ở tên object mà ở **custom property của object** (Object Properties → Custom Properties):
- `htx_kind`: loại (xem bảng dưới).
- `htx_id`: ID ổn định, ví dụ `itr.thcs.stone_bench`. Quest và nội dung chỉ dùng ID này.

Vì sao không dùng tên: Blender tự thêm `.001` khi trùng tên, và Three.js bỏ dấu chấm trong tên khi nạp.

Nếu object **chưa** có `htx_kind`, exporter tự điền theo tiền tố tên (và mesh nằm trong `COLLISION` mà không có tiền tố thì được coi là vật cản):

| Tiền tố tên | Loại (`htx_kind`) | Bắt buộc `htx_id` | Bắt buộc là mesh hộp | Mẫu ID |
|---|---|---|---|---|
| `COLLIDER_` | `collider` | không | có | — |
| `FLOOR_` | `floor` | không | có | — |
| `SPAWN_` | `spawn` | **có** | không (Empty) | `spawn.thcs.<tên>` |
| `ITR_` (hoặc `INTERACT_`) | `interact` | **có** | không | `itr.thcs.<tên>` |
| `SPOT_` | `spot` | **có** | không | `spot.thcs.<tên>` |
| `CAM_` | `camera` | **có** | không | `cam.thcs.<tên>` — phải có thêm `TARGET_` mang ID `<id>.target` |
| `TARGET_` | `target` | **có** | không | `cam.thcs.<tên>.target` |
| `PORTAL_` | `portal` | **có** | có | `portal.thcs.<tên>` |
| `ZONE_` | `zone` | **có** | có | `zone.thcs.<tên>` (trùng ID khu trong manifest) |
| `TRIGGER_` | `trigger` | **có** | có | `trig.thcs.<tên>` (map_thcs chưa dùng) |

Object không có nhãn và không có tiền tố là **phần để nhìn**: sửa, xóa, thêm thoải mái, không ảnh hưởng gameplay.

Nhãn phụ (cũng là custom property):

| Nhãn | Gắn vào | Ý nghĩa |
|---|---|---|
| `htx_radius` | marker | bán kính vùng tương tác / vòng đứng (m) |
| `htx_shape` = `cylinder` | collider | vật cản tròn (cây, cột); mặc định hộp |
| `htx_camera` = `0` | collider | không chắn camera (hàng rào thấp, vật nhỏ) |
| `htx_visible` = `1` | zone/portal/trigger | vẫn vẽ ra trong game (mặc định ẩn) |
| `htx_target_spawn` | portal (bắt buộc) | ID điểm xuất hiện sẽ đưa người chơi tới |
| `htx_activate` | portal | `enter` = bước vào là đi · `interact` = bấm E mới đi |
| `htx_label` | portal kiểu `interact` | chữ gợi ý, ví dụ "Ra ngoài" |
| `htx_gate_zone` | vật chắn | chỉ có mặt khi khu mang ID này **đóng** trong Ngày đang chơi |
| `htx_open_zone` | vật | chỉ có mặt khi khu này **mở** (ví dụ cánh cửa mở) |
| `htx_decor` | vật trang trí | chỉ hiện với bộ trang trí năm học, ví dụ `g06,g07` |
| `htx_hide_in` | mái, tầng trên | ẩn khi người chơi đứng trong các khu này |
| `htx_dynamic` = `1` | vật | không gộp mesh (vật sẽ chuyển động) |

---

## 4. Các việc thường gặp

### 4.1 Sửa hình khối để nhìn (dời, đổi hình, xóa vật)
Sửa thẳng trong `ENVIRONMENT`/`ARCHITECTURE`/`PROPS`, lưu, rồi xuất lại (mục 5). ID gameplay giữ nguyên (đã có test: mục 4 của `test_pipeline.py`).

**Va chạm không tự đi theo hình.** Dời một bức tường thì phải dời cả hộp `COLLIDER_` của nó; nới rộng sân thì phải nới cả `FLOOR_` và `ZONE_`. Đây là chủ ý: đổi phần nhìn không làm hỏng đường đi.

### 4.2 Đổi màu, vật liệu
- **Tên vật liệu là khóa ổn định** (`wall_main`, `ground_concrete`…). Đổi màu thì giữ tên, chỉ đổi Base Color trong Principled BSDF.
- Muốn đổi màu **mà không mở Blender**: thêm vào `palette` của phong cách trong `src/render/style.ts`, ví dụ `{ wall_main: '#e8d9a0' }`. Cách này đổi màu theo tên vật liệu, áp cho mọi khu.
- `tools/blender/world/palettes/blockout_default.json` chỉ được dùng **khi sinh blockout** bằng generator. Đổi file này không làm đổi màu file `.blend` đã có.
- So màu: ảnh xem thử của Blender (`--preview`) **bạc màu hơn thật** vì file dùng chế độ hiển thị AgX. Màu trong `.glb` thì trùng đúng bảng màu. Muốn biết màu trong game trông thế nào thì chụp trong game. Chi tiết: `docs/S2_TEST_REPORT.md`, mục so màu.

### 4.3 Thêm texture ảnh
Nối node Image Texture vào Base Color của Principled BSDF. Khi xuất, ảnh được **nhúng vào file `.glb`** (đã thử: GLB có ảnh `image/png`, vật liệu có `baseColorTexture`). **Chưa xem texture hiển thị trong game.** Dùng ảnh nhỏ (≤ 1024 px, cạnh là lũy thừa của 2) để file nhẹ.

### 4.4 Thêm đồ vật
1. Thêm mesh vào `PROPS`, gán vật liệu.
2. Nếu vật cần chặn đường: thêm một **hộp riêng** tên `COLLIDER_<tên>` vào `COLLISION`, bao lấy vật. Viewport Display → Display As: Wire; tắt render (biểu tượng máy ảnh).
   - Vật tròn: thêm custom property `htx_shape` = `cylinder`.
   - Vật thấp/nhỏ không nên chắn camera: `htx_camera` = `0`.
   - Chỉ xoay hộp quanh trục Z. Hộp bị nghiêng sẽ được game coi như hộp thẳng trục (exporter có nhắc).
   - Quên gắn `htx_kind` cũng được: tiền tố `COLLIDER_` đủ để exporter tự gắn (đã thử: "tự gắn nhãn 1 object").

### 4.5 Thêm marker (điểm tương tác, chỗ đứng, điểm xuất hiện, máy ảnh)
1. Add → Empty → Plain Axes, đặt vào collection đúng (bảng 3.1).
2. Đặt tên theo tiền tố, ví dụ `SPOT_annex_corner`.
3. Thêm custom property `htx_kind` = `spot` và **`htx_id` = `spot.thcs.annex_corner`**.
4. Hướng nhìn: trục Y (màu xanh lá) của Empty chỉ hướng nhân vật/NPC nhìn.
5. Máy ảnh đặt sẵn: tạo cả `CAM_<tên>` (vị trí máy) và `TARGET_<tên>` mang ID `<id máy>.target` (điểm nhìn tới).
6. Marker phải đứng trên một `FLOOR_` và không nằm trong `COLLIDER_` (`validate:world` kiểm).

Quên `htx_id` thì exporter **dừng và không ghi file** (đã chạy):
```
[export] annex:  LỖI: SPOT_annex_corner: loại spot thiếu custom property htx_id
[export] annex: 1 lỗi quy ước — chưa xuất zone_annex.glb
[export] 1 khu có lỗi.
```

Sau khi thêm ID mới, nội dung (quest) mới dùng được ID đó; nội dung chỉ được nêu ID, **không** nêu tên mesh hay tọa độ.

---

## 5. Xuất lại `.glb`

```bash
# Chỉ kiểm quy ước, không ghi file:
python tools/blender/world/export_world.py --check-only
# Xuất một vài khu (theo phần cuối của ID khu):
python tools/blender/world/export_world.py --zones yard,gate
# Xuất cả 6 khu:
python tools/blender/world/export_world.py
```
- `export_world.py` **không bao giờ sửa hay lưu file `.blend`**. Nhãn tự gắn theo tiền tố chỉ nằm trong `.glb`.
- Kết quả đúng trông như: `[export] annex: OK → …/zone_annex.glb (25316 byte) · để nhìn 10 · vật cản 7 · sàn 1 · marker 6`.
- Có lỗi thì mã thoát là 1 và khu đó không được ghi.

Ảnh xem thử (Cycles, CPU; ghi vào `tools/blender/world/map_thcs/previews/`):
```bash
python tools/blender/world/export_world.py --check-only --preview    # chỉ chụp, không ghi .glb (đã chạy, ~2 giây/khu)
```
`--preview` **không kèm** `--check-only` thì vừa chụp vừa xuất `.glb`.

Tùy chọn cho thử nghiệm (không đụng file thật): `--manifest FILE` (manifest khác), `--blend-dir DIR` (đọc `.blend` từ thư mục khác), `--glb-dir DIR` (ghi `.glb` vào thư mục khác).

---

## 6. Kiểm sau khi xuất

```bash
npm run world:index        # sinh lại src/world/maps/map_thcs.index.json (bắt buộc sau mỗi lần xuất)
npm run validate:world     # kiểm manifest + GLB + index + nội dung
npm test                   # test logic, gồm test quy ước hai phía
python tools/blender/world/tests/test_pipeline.py     # khi sửa script trong tools/blender/world/
```
Kết quả đúng của `validate:world`: `[validate:world] ĐẠT — 0 lỗi, 0 nhắc`.

Lỗi hay gặp:

| Mã | Nghĩa | Sửa |
|---|---|---|
| `index_stale` | quên `world:index` sau khi xuất | chạy `npm run world:index` |
| `marker_no_floor` | marker không có sàn bên dưới | dời marker hoặc nới `FLOOR_` |
| `marker_blocked` | marker nằm trong vật cản | dời marker ra chỗ trống |
| `missing_marker` | nội dung nêu một ID mà bản đồ không có | thêm marker đúng ID, hoặc sửa nội dung |
| `zone_missing_in_content` | khu có trong manifest nhưng chưa có tên trong `src/content/base.ts` | thêm tên khu |
| `closed_zone_no_gate` (nhắc) | Ngày nào đó đóng khu này mà chưa có vật chắn `htx_gate_zone` | dựng vật chắn ở lối vào (xem `HOW_TO_EXPAND_WORLD.md`) |

Cuối cùng chơi thử: `npm run dev`, mở `http://localhost:5173/?play=1&day=d.g07.03` (Ngày mở cả 6 khu).

---

## 7. An toàn cho file đã sửa tay

- `gen_map_thcs.py` (generator blockout) ghi một "dấu vân tay" khi sinh file. File có dấu khác bị coi là **đã sửa tay** và **không bị ghi đè**, kể cả với `--force`.
- Chỉ `--overwrite-edited` mới ghi đè, và tự sao lưu vào `backups/` trước (thư mục này không vào Git).
- **Sau khi đã sửa tay, chỉ dùng `export_world.py`.** Không chạy lại generator.
- File `*.blend1` (bản lưu phụ của Blender) không vào Git.

---

## 8. Đổi quy ước (hiếm khi cần)

Thêm loại marker hay tiền tố mới thì sửa **cả hai** file rồi chạy kiểm:
1. `tools/blender/world/pipeline_config.py` (`KINDS`, `NAME_PREFIX_KIND`, `KINDS_NEED_ID`…)
2. `src/world/types.ts` (`MARKER_KINDS`, `NAME_PREFIX_KIND`, `KINDS_NEED_ID`)
3. `npm test` — `conventions.test.ts` báo chỗ lệch nếu quên một bên; `python tools/blender/world/tests/test_pipeline.py`.

---

## 9. Đã chạy / chưa chạy (15/11/2026)

Đã chạy: `export_world.py --check-only --preview` (6 khu); `new_zone.py`; `export_world.py` với `--manifest/--blend-dir/--glb-dir`; lỗi thiếu `htx_id`; tự gắn nhãn theo tiền tố; nhúng texture vào GLB; `test_pipeline.py` 61/61 trên `bpy` 4.5.16 và 5.2.4.

Chưa chạy: mọi lệnh bằng `blender.exe` trên Windows; gói `bpy` trên Windows; mở file `.blend` bằng giao diện Blender (mọi chỉnh sửa trong phiên là bằng script); texture hiển thị trong game.
