# HOW_TO_EXPAND_WORLD — thêm một khu mới vào bản đồ

Viết 15/11/2026 (Chặng 1 của S2), **theo đúng các bước đã làm thử thật**: thêm khu thứ 7 `zone.thcs.annex` (một khu thử, nối với Bãi đất bằng portal), làm trong thư mục tạm và một bản sao repo dùng xong bỏ đi. **Bản đồ thật trên nhánh không bị đổi.** Lệnh Blender chạy bằng gói `bpy` 4.5.16 trên Linux; chưa chạy bằng `blender.exe` trên Windows. Cách chạy lệnh Blender trên Windows: xem `docs/BLENDER_PIPELINE.md` mục 1.

Không cần sửa dòng code nào trong `src/` ngoài phần **nội dung** (`src/content/`). Game tự nạp mọi khu khai trong manifest.

---

## 0. Trước khi bắt đầu — đọc kỹ

- **Bản đồ `map_thcs` có 6 khu theo GDD v0.3 §4.** Thêm khu thứ 7 vào bản đồ thật là **thay đổi thiết kế**, cần chủ dự án duyệt. Một số test cố ý ghim "đúng 6 khu của GDD" và sẽ đỏ (mục 8). Đó là đúng: nó buộc người thêm khu phải sửa test một cách có chủ đích, không lặng lẽ.
- Ví dụ trong tài liệu và trong test mẫu dùng slug `annex`. Khu thật nên chọn slug khác, nếu không sẽ trùng với khu thử trong `tests/unit/world/expand.test.ts`.
- Nên thử trước trong thư mục tạm (mục 9) rồi mới làm trên file thật.

---

## 1. Chọn ID, phạm vi, cách vào

| Cần chọn | Ví dụ đã dùng | Ghi chú |
|---|---|---|
| ID khu | `zone.thcs.annex` | dạng `zone.<map>.<slug>`; `<map>` của `map_thcs` là `thcs` |
| Phạm vi trên mặt bằng (tọa độ game, mét) | `60,-6,72,6` (x0,z0,x1,z1) | không chồng lên khu khác; xem `floor_bounds` trong `src/world/maps/map_thcs.index.json` |
| Cách vào | portal: đứng vào ô ở `(49.5, 0)` trong Bãi đất là sang khu mới | hoặc nối đi bộ: sàn hai khu chạm nhau |
| Cách ra | portal "bấm E", đưa về `spawn.thcs.field` | |

---

## 2. Tạo file `.blend` khởi đầu

```bash
python tools/blender/world/new_zone.py --zone zone.thcs.annex --rect 60,-6,72,6 \
  --exit-to spawn.thcs.field --entry-at 49.5,0
```
(Thử trong thư mục tạm thì thêm `--out-dir /tmp/zone7`.)

Kết quả thật:
```
[new_zone] Blender 4.5.16 LTS · đã tạo …/zone_annex.blend
[new_zone] marker: spawn.thcs.annex, itr.thcs.annex_sign, portal.thcs.annex_exit, portal.thcs.annex_entry
[new_zone] Dán vào "zones" của src/world/maps/map_thcs.world.json (và thêm ID khu này vào "connections" của khu nối với nó):
{ "id": "zone.thcs.annex", "asset": "zone_annex.glb", "source": "…/zone_annex.blend", "connections": ["<ID khu nối với khu này>"] }
```
File mới có sẵn: đủ 9 collection, mặt đất, sàn `FLOOR_`, khối ranh `ZONE_`, bờ thấp quanh khu (có vật cản, chừa lối ở mép nam), một biển báo + điểm tương tác `itr.thcs.annex_sign`, điểm xuất hiện `spawn.thcs.annex`, portal ra và portal vào.

- Chạy lại lệnh khi file đã có → **không ghi đè**: `ĐÃ CÓ …/zone_annex.blend — không ghi đè.`
- `new_zone.py` **không sửa manifest**; bạn tự dán (mục 4).
- Portal vào (`portal.thcs.annex_entry`) nằm trong file của khu mới nhưng đặt ở vị trí thuộc Bãi đất. Vậy là đúng.
- Nếu tạo thẳng vào thư mục thật, đường dẫn `source` in ra đã đúng. Nếu tạo vào thư mục tạm, `source` in ra là đường dẫn tạm; khi chép vào repo nhớ đổi thành `tools/blender/world/map_thcs/zone_<slug>.blend`.

---

## 3. Dựng tiếp trong Blender

Mở `zone_annex.blend`, dựng thêm theo `docs/BLENDER_PIPELINE.md` mục 4. Lúc thử, đã làm (bằng script, tương đương thao tác tay):
- thêm một thùng gỗ vào `PROPS` (chỉ để nhìn);
- thêm hộp `COLLIDER_annex_crate` vào `COLLISION` bao lấy thùng, **không** gắn `htx_kind` (để thử tự gắn theo tiền tố);
- thêm Empty `SPOT_annex_corner` vào `INTERACTION_MARKERS`, **cố ý quên** `htx_id`.

Lưu file.

---

## 4. Khai khu mới trong manifest

Sửa tay `src/world/maps/map_thcs.world.json`:
1. Thêm vào cuối mảng `zones`:
   ```json
   {
     "id": "zone.thcs.annex",
     "asset": "zone_annex.glb",
     "source": "tools/blender/world/map_thcs/zone_annex.blend",
     "connections": ["zone.thcs.field"]
   }
   ```
2. Thêm `"zone.thcs.annex"` vào `connections` của `zone.thcs.field`. **Kết nối phải khai hai chiều.**
3. Khu trong nhà thì thêm `"camera_preset": "follow_indoor"` (như Lớp học).

Sửa bằng tay để giữ nguyên định dạng file (lúc thử, ghi lại bằng script làm đổi cách xuống dòng của cả file — diff dài không cần thiết).

---

## 5. Xuất `.glb`

```bash
python tools/blender/world/export_world.py --zones annex --check-only    # kiểm trước
python tools/blender/world/export_world.py --zones annex                 # xuất
```
(Trong thư mục tạm: thêm `--manifest /tmp/zone7/map_thcs.world.json --blend-dir /tmp/zone7 --glb-dir /tmp/zone7/glb`.)

Lần đầu, vì `SPOT_annex_corner` thiếu ID, exporter dừng và không ghi file:
```
[export] annex:  LỖI: SPOT_annex_corner: loại spot thiếu custom property htx_id
[export] annex: 1 lỗi quy ước — chưa xuất zone_annex.glb
```
Thêm custom property `htx_kind` = `spot`, `htx_id` = `spot.thcs.annex_corner`, lưu, xuất lại:
```
[export] annex: OK → …/zone_annex.glb (25316 byte) · để nhìn 10 · vật cản 7 · sàn 1 · marker 6 · tự gắn nhãn 1 object
```
"tự gắn nhãn 1 object" là hộp `COLLIDER_annex_crate`. Trong GLB có đủ: `zone.thcs.annex`, `spawn.thcs.annex`, `itr.thcs.annex_sign`, `spot.thcs.annex_corner`, `portal.thcs.annex_exit`, `portal.thcs.annex_entry`.

File `.glb` được ghi vào `public/assets/world/map_thcs/zone_annex.glb` (theo `asset_root` của manifest).

---

## 6. Khai khu trong nội dung

`src/content/base.ts`, trong `MAPS` của `map_thcs`:
```ts
zones: [
  …,
  { zone_id: 'zone.thcs.annex', name: '[PLACEHOLDER] Khu thử' },   // tên hiện lên khi đi vào khu
],
spawn_points: [ …, { id: 'spawn.thcs.annex' } ],
```
Tên khu thật là nội dung — để `[PLACEHOLDER]` cho tới khi nhóm viết chốt.

Mở khu trong Ngày nào: thêm ID khu vào `open_zones` của Ngày đó (ví dụ `src/content/days/d_g07_03.ts`). Khu nào mở ở Ngày nào là quyết định nội dung (D-S2-03), chưa chốt.

**Khu đóng có bị chặn không?**
- Khu vào bằng **portal**: khi khu đóng, portal vào khu đó tự không hoạt động (có test trong `expand.test.ts`). Không cần vật chắn. `validate:world` vẫn nhắc `closed_zone_no_gate` — với khu chỉ vào bằng portal thì nhắc này bỏ qua được.
- Khu nối **đi bộ**: phải dựng vật chắn ở lối vào, trong file `.blend` của khu kề bên: một vật để nhìn (cửa đóng, dây chắn, bụi rậm) có custom property `htx_gate_zone` = ID khu mới và `htx_dynamic` = `1`, kèm một hộp `COLLIDER_` cũng mang `htx_gate_zone` = ID khu mới. Cả hai chỉ có mặt khi khu đóng. Mẫu có sẵn: cửa lớp học, cổng trường, dây chắn bãi đất, bụi rậm căn cứ trong `gen_map_thcs.py`. Không có vật chắn thì người chơi đi vào được khu đóng.

---

## 7. Sinh index và kiểm

```bash
npm run world:index
npm run validate:world
npx tsc --noEmit
```
Kết quả thật:
- `world:index`: `map_thcs: 7 khu · 47 marker · 94 vật cản · 10382 tam giác`.
- `validate:world` **trước** khi làm mục 6: `LỖI [zone_missing_in_content] Khu "zone.thcs.annex" có trong manifest nhưng chưa khai tên trong nội dung`.
- `validate:world` **sau** mục 6: `ĐẠT — 0 lỗi, 1 nhắc` (nhắc `closed_zone_no_gate` cho Ngày `d.g06.01` — xem mục 6).
- `tsc`: đạt.

---

## 8. Chạy test — những gì sẽ đỏ và vì sao

`npm test` sau khi thêm khu thứ 7 vào bản đồ thật: **212 đạt, 10 đỏ, 1 bỏ qua**. Không test nào đỏ vì code game hỏng; tất cả là test ghim đúng bản đồ 6 khu hiện tại:

| File test | Ca đỏ | Vì sao | Khi thêm khu thật thì |
|---|---|---|---|
| `world.test.ts` | nạp đủ 6 khu | so danh sách đúng 6 khu | cập nhật danh sách |
| `world.test.ts` | đi bộ một vòng qua cả 6 khu… không cần dịch chuyển | test coi mọi `connections` là đi bộ được; khu mới vào bằng portal | khu portal: loại khỏi vòng đi bộ, hoặc thêm ca riêng đi qua portal |
| `world.test.ts` | 2 ca "khi file bản đồ hỏng" | đếm số khu/lỗi cố định (5 khu còn lại, 6 lỗi) | cập nhật con số |
| `validate.test.ts` | map_thcs có đúng 6 khu của GDD | ghim GDD v0.3 §4 | sửa khi GDD đã có khu mới |
| `validate.test.ts` | khu không mở đều có vật chắn; 2 ca nhắc của `validateWorldContent` | thêm nhắc `closed_zone_no_gate` cho khu mới | dựng vật chắn, hoặc cho test chấp nhận khu chỉ vào bằng portal |
| `expand.test.ts` | 2 ca | test tự thêm khu `annex` vào manifest, nay bị trùng | đặt slug khác `annex` (mục 0) |

Phần còn lại (bot chơi, va chạm, camera, quest, analytics…) vẫn xanh.

---

## 9. Chơi thử

```bash
npm run dev
```
Mở `http://localhost:5173/?play=1&day=d.g07.03` (Ngày đã mở khu mới ở mục 6).

Đã thử bằng Chrome (Playwright, phím thật):
1. Đặt nhân vật ở `(45, 0)` trong Bãi đất, quay về hướng portal; giữ `W` → đi vào ô portal → sang khu mới, đứng ở `spawn.thcs.annex (66, 0, 4)`, tên `[PLACEHOLDER] Khu thử` hiện lên.
2. Đứng ở cửa ra `(66, 5.4)` → hiện gợi ý "Ra ngoài"; bấm `E` → về Bãi đất, đứng ở `spawn.thcs.field (33, 15)`.
3. Không có lỗi trên trang; `world().problems` rỗng.

Thấy khi thử: ở cửa sổ rộng 960 px, tên khu dài hiện ở giữa trên cùng đè một phần lên nút "Camera A". Chưa sửa (phần giao diện, ngoài phạm vi Chặng 1).

---

## 10. Cách thử an toàn trước khi đụng file thật (đã làm)

**Phần Blender** — mọi thứ trong một thư mục tạm:
```bash
TMP=/tmp/zone7; mkdir -p $TMP/glb
python tools/blender/world/new_zone.py --zone zone.thcs.annex --rect 60,-6,72,6 --exit-to spawn.thcs.field --entry-at 49.5,0 --out-dir $TMP
# chép manifest ra $TMP/map_thcs.world.json rồi sửa bản chép đó như mục 4
python tools/blender/world/export_world.py --manifest $TMP/map_thcs.world.json --blend-dir $TMP --glb-dir $TMP/glb --zones annex
```
(Ghi chú: `export_world.py` không có tùy chọn `--out-dir`; dùng `--blend-dir` và `--glb-dir`. `new_zone.py` và `gen_map_thcs.py` mới có `--out-dir`.)

**Phần game** — một bản sao repo dùng xong bỏ:
```bash
git worktree add --detach /tmp/gk-trial HEAD
# (Linux/macOS) dùng chung node_modules: ln -s "$PWD/node_modules" /tmp/gk-trial/node_modules
cd /tmp/gk-trial
# chép .blend vào tools/blender/world/map_thcs/, .glb vào public/assets/world/map_thcs/, làm mục 4, 6, 7, 8, 9
cd - && git worktree remove --force /tmp/gk-trial
```
Trên Windows: tạo worktree ở thư mục khác rồi chạy `npm ci` trong đó.

Toàn bộ quy trình Blender (tạo khu, không ghi đè, xuất bằng manifest có khu mới) cũng được kiểm tự động ở mục 7 của `tools/blender/world/tests/test_pipeline.py`; phía game ở `tests/unit/world/expand.test.ts` (dùng file `tests/unit/fixtures/world/zone_annex.glb`).
