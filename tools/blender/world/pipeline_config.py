"""QUY ƯỚC CỦA PIPELINE Blender → GLB → game (S2). Đây là NƠI DUY NHẤT khai các quy ước phía Blender.

File này không import `bpy`: đọc được bằng Python thường, và mọi script trong thư mục này (htx_world, gen_map_thcs,
export_world, new_zone, tests/test_pipeline) đều lấy quy ước từ đây qua `htx_world`.

Phía game có bản đối ứng ở `src/world/types.ts` (NAME_PREFIX_KIND, MARKER_KINDS, KINDS_NEED_ID).
SỬA Ở ĐÂY THÌ PHẢI SỬA CẢ Ở ĐÓ, rồi chạy:
    python tools/blender/world/tests/test_pipeline.py     (hoặc: blender --background --python …)
    npm test && npm run world:index && npm run validate:world

Xem docs/S2_EXECUTION_BLUEPRINT.md §4.
"""

# ----------------------------------------------------------------------------- phiên bản, đơn vị, trục

#: Đã chạy thật bộ test pipeline trên các bản này (15/11/2026). Máy chủ dự án đang cài 4.5.16 LTS.
BLENDER_TESTED = ('4.5.16 LTS', '5.2.4 LTS')

#: 1 đơn vị Blender = 1 mét.
#: Trục Blender: X sang phải, Y ra xa, Z lên.  Trục game (Three.js): x = X, y = Z (cao), z = -Y.
#: Các hàm dựng trong htx_world nhận TỌA ĐỘ GAME (x, z trên mặt bằng; y là độ cao) — xem htx_world.G().
UNIT_METERS = 1.0

DEFAULT_MAP = 'map_thcs'
DEFAULT_PALETTE = 'blockout_default'          # tools/blender/world/palettes/<tên>.json

#: Đường dẫn tính từ gốc repo. `{map_id}` được thay khi dùng.
MANIFEST_PATH = 'src/world/maps/{map_id}.world.json'   # Tầng A: danh sách khu (viết tay)
BLEND_DIR = 'tools/blender/world/{map_id}'             # Tầng B: file .blend nguồn (sửa được)
PUBLIC_DIR = 'public'                                  # .glb ghi vào public + asset_root của manifest

# ----------------------------------------------------------------------------- collection trong mỗi file .blend

#: Mỗi khu là 1 file .blend, đặt sẵn đúng vị trí trong bản đồ, gồm đúng các collection này.
COLLECTIONS = ['ENVIRONMENT', 'ARCHITECTURE', 'PROPS', 'COLLISION', 'ZONE_BOUNDS',
               'INTERACTION_MARKERS', 'SPAWN_MARKERS', 'PORTAL_MARKERS', 'LIGHTING']

# ----------------------------------------------------------------------------- nhãn gameplay (custom property)

#: Ý nghĩa gameplay nằm ở custom property của OBJECT (không phải của mesh/material).
#: Exporter bật `export_extras` → glTF "extras" → game đọc ở `object.userData`.
PROP_PREFIX = 'htx_'
PROP_KIND = 'htx_kind'     # loại — một trong KINDS bên dưới
PROP_ID = 'htx_id'         # ID ổn định (vd. itr.thcs.stone_bench). KHÔNG dùng tên object làm ID.

#: Mọi loại có ý nghĩa gameplay. Object không có nhãn là "visual" (chỉ để nhìn): sửa/xóa/thêm thoải mái.
KINDS = ('collider', 'floor', 'spawn', 'interact', 'spot', 'camera', 'target', 'portal', 'zone', 'trigger')

#: Tiền tố tên object → loại. Dùng khi object CHƯA có `htx_kind`: exporter tự điền nhãn theo tiền tố.
#: Dòng nào đứng trước được xét trước. `INTERACT_` là tên gọi khác của `ITR_` (chuẩn là ITR_, khớp ID dạng itr.<map>.<slug>).
NAME_PREFIX_KIND = [('COLLIDER_', 'collider'), ('FLOOR_', 'floor'), ('SPAWN_', 'spawn'), ('ITR_', 'interact'),
                    ('INTERACT_', 'interact'), ('SPOT_', 'spot'), ('CAM_', 'camera'), ('TARGET_', 'target'),
                    ('PORTAL_', 'portal'), ('ZONE_', 'zone'), ('TRIGGER_', 'trigger')]

#: Loại bắt buộc có `htx_id` (thiếu → exporter báo lỗi và KHÔNG ghi file).
KINDS_NEED_ID = {'spawn', 'interact', 'spot', 'camera', 'target', 'portal', 'zone', 'trigger'}
#: Loại bắt buộc là mesh hình hộp (game lấy hộp bao trên mặt bằng làm vùng).
KINDS_NEED_MESH = {'collider', 'floor', 'portal', 'zone', 'trigger'}
#: Loại → collection đặt object khi generator dựng.
MARKER_COLLECTION = {'spawn': 'SPAWN_MARKERS', 'interact': 'INTERACTION_MARKERS', 'spot': 'INTERACTION_MARKERS',
                     'camera': 'INTERACTION_MARKERS', 'target': 'INTERACTION_MARKERS', 'portal': 'PORTAL_MARKERS',
                     'trigger': 'PORTAL_MARKERS', 'zone': 'ZONE_BOUNDS', 'collider': 'COLLISION', 'floor': 'COLLISION'}

#: Mẫu ID ổn định (khớp quy tắc ID của nội dung game). Chỉ để tra cứu; kiểm tra thật nằm ở `npm run validate:world`.
ID_PATTERNS = {
    'zone': 'zone.<map>.<slug>',          # trùng zone_id trong nội dung và trong manifest
    'spawn': 'spawn.<map>.<slug>',
    'interact': 'itr.<map>.<slug>',       # trùng Interactable.id trong nội dung
    'spot': 'spot.<map>.<slug>',          # chỗ đứng của NPC, tâm vòng đứng chụp ảnh
    'camera': 'cam.<map>.<slug>',         # máy ảnh đặt sẵn; BẮT BUỘC có marker đích mang ID "<id>.target"
    'target': '<id máy ảnh>.target',
    'portal': 'portal.<map>.<slug>',
    'trigger': 'trig.<map>.<slug>',       # đề xuất — map_thcs chưa dùng trigger nào
}

#: Các nhãn phụ (đều là custom property của object). Game đọc ở src/world/parse.ts.
EXTRA_PROPS = {
    'htx_radius': 'marker: bán kính (m) — vùng tương tác hoặc vòng đứng',
    'htx_shape': 'collider: "cylinder"/"circle" = vật cản tròn (cây, cột); mặc định là hộp',
    'htx_camera': 'collider: 0 = KHÔNG chắn camera (hàng rào thấp, vật nhỏ); mặc định 1',
    'htx_visible': 'zone/portal/trigger: 1 = vẫn vẽ ra trong game; mặc định ẩn',
    'htx_target_spawn': 'portal (bắt buộc): ID điểm xuất hiện sẽ đưa người chơi tới',
    'htx_activate': 'portal: "enter" = bước vào là đi · "interact" = bấm E mới đi',
    'htx_label': 'portal kiểu interact: chữ gợi ý hiện cho người chơi',
    'htx_gate_zone': 'vật chắn lối: chỉ tồn tại khi khu mang ID này KHÔNG mở trong Ngày đang chơi',
    'htx_open_zone': 'ngược lại: chỉ tồn tại khi khu mang ID này ĐANG mở (cánh cửa mở)',
    'htx_decor': 'vật trang trí theo năm học: chỉ hiện khi bộ trang trí (vd. "g06,g07") đang dùng',
    'htx_hide_in': 'ẩn khi người chơi đứng trong các khu này (mái, tầng trên của khu trong nhà)',
    'htx_dynamic': '1 = không gộp mesh (vật sẽ chuyển động)',
}

#: Ghi ở cấp scene (không phải object). `htx_gen_fingerprint` là cách generator biết file đã bị SỬA TAY hay chưa.
SCENE_PROPS = ('htx_world', 'htx_zone_id', 'htx_gen_rev', 'htx_gen_fingerprint')

#: Tăng khi đổi cách generator dựng hình (chỉ để ghi nhận, không dùng để so sánh).
GEN_REV = 1

# ----------------------------------------------------------------------------- xuất GLB

#: Tham số của `bpy.ops.export_scene.gltf` (đã kiểm trên các bản ở BLENDER_TESTED).
GLTF_EXPORT = dict(
    export_format='GLB',
    use_selection=False,
    export_yup=True,          # Three.js: trục Y hướng lên
    export_apply=True,        # áp modifier trước khi xuất
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_cameras=False,     # PREVIEW_camera không vào game
    export_lights=False,      # PREVIEW_sun không vào game
    export_extras=True,       # custom property htx_* → glTF extras → userData trong game
)

#: Object chỉ để xem thử trong Blender (camera, đèn). Tiền tố này không bao giờ vào game.
PREVIEW_PREFIX = 'PREVIEW_'
