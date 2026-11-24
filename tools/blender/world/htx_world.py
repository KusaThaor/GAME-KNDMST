"""Thư viện dùng chung cho bản đồ game (S2). Chạy được với Blender 4.5 LTS và 5.2 LTS.

Xem docs/BLENDER_PIPELINE.md. Tóm tắt quy ước:
- 1 đơn vị = 1 mét. Trục Blender: X sang phải, Y ra xa, Z lên. Trục game (Three.js): x = X, y = Z, z = -Y.
  Các hàm dựng ở đây nhận TỌA ĐỘ GAME (x, z trên mặt bằng; y là độ cao) để khớp số với nội dung game.
- Mỗi khu là 1 file .blend, đặt sẵn đúng vị trí trong bản đồ, gồm các collection:
  ENVIRONMENT, ARCHITECTURE, PROPS, COLLISION, ZONE_BOUNDS, INTERACTION_MARKERS, SPAWN_MARKERS, PORTAL_MARKERS, LIGHTING.
- Ý nghĩa gameplay nằm ở custom property của object (xuất sang glTF "extras" → game đọc ở userData):
    htx_kind = collider | floor | spawn | interact | spot | camera | target | portal | zone | trigger
    htx_id   = ID ổn định (vd. itr.thcs.stone_bench). KHÔNG dùng tên object làm ID.
  Object không có htx_kind là phần để nhìn: sửa/xóa/thêm thoải mái.
"""
import hashlib
import json
import math
import os
import shutil
import sys
import time

import bmesh
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
if HERE not in sys.path:
    sys.path.insert(0, HERE)
# Mọi quy ước (collection, tiền tố tên, nhãn htx_*, tham số xuất GLB) khai ở pipeline_config.py — sửa ở đó, không sửa ở đây.
from pipeline_config import (COLLECTIONS, GEN_REV, GLTF_EXPORT, KINDS_NEED_ID, KINDS_NEED_MESH,  # noqa: E402,F401
                             MARKER_COLLECTION, NAME_PREFIX_KIND)


# ----------------------------------------------------------------------------- tiện ích chung

def script_args():
    """Tham số dòng lệnh: sau dấu `--` khi chạy bằng `blender --python`, hoặc toàn bộ khi chạy bằng `python`."""
    argv = sys.argv
    return argv[argv.index('--') + 1:] if '--' in argv else argv[1:]


def load_manifest(map_id, path=None):
    path = path or os.path.join(REPO, 'src', 'world', 'maps', f'{map_id}.world.json')
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def zone_paths(manifest, zone):
    """(đường dẫn .blend nguồn, đường dẫn .glb xuất ra) của một khu trong manifest."""
    blend = os.path.join(REPO, *zone['source'].split('/'))
    glb = os.path.join(REPO, 'public', *manifest['asset_root'].strip('/').split('/'), zone['asset'])
    return blend, glb


def hex_to_linear(hex_color):
    h = hex_color.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb) + (1.0,)


def load_palette(name='blockout_default'):
    with open(os.path.join(HERE, 'palettes', f'{name}.json'), encoding='utf-8') as f:
        return json.load(f)['materials']


def G(x, z, y=0.0):
    """Tọa độ game (x, z mặt bằng, y cao) → tọa độ Blender."""
    return (x, -z, y)


# ----------------------------------------------------------------------------- dựng khu

class MeshBuilder:
    """Ghép nhiều khối thành MỘT object (một cái bàn, một cái cây…) với nhiều vật liệu. Tọa độ tính từ gốc của object."""

    def __init__(self, zone, name):
        self.zone = zone
        self.name = name
        self.bm = bmesh.new()
        self.mats = []

    def _mat_index(self, mat_name):
        if mat_name not in self.mats:
            self.mats.append(mat_name)
        return self.mats.index(mat_name)

    def _finish_faces(self, geom_verts, mat_name, matrix, smooth=False, smooth_quads_only=False):
        idx = self._mat_index(mat_name)
        faces = set()
        for v in geom_verts:
            v.co = matrix @ v.co
            faces.update(v.link_faces)
        for f in faces:
            f.material_index = idx
            f.smooth = smooth and (len(f.verts) == 4 or not smooth_quads_only)

    def box(self, mat, cx, cz, w, d, h, y0=0.0, rot=0.0):
        """Hộp: tâm (cx, cz) trên mặt bằng game, rộng w (trục x), sâu d (trục z), cao h từ độ cao y0. rot = góc quay quanh trục đứng."""
        from mathutils import Matrix
        r = bmesh.ops.create_cube(self.bm, size=1.0)
        m = Matrix.Translation(G(cx, cz, y0 + h / 2)) @ Matrix.Rotation(rot, 4, 'Z') @ Matrix.Diagonal((w, d, h, 1.0))
        self._finish_faces(r['verts'], mat, m)
        return self

    def cyl(self, mat, cx, cz, r, h, y0=0.0, r_top=None, segs=10, smooth=True):
        """Trụ đứng (r_top khác r → hình nón cụt)."""
        from mathutils import Matrix
        res = bmesh.ops.create_cone(self.bm, cap_ends=True, cap_tris=False, segments=segs,
                                    radius1=r, radius2=r if r_top is None else r_top, depth=h)
        self._finish_faces(res['verts'], mat, Matrix.Translation(G(cx, cz, y0 + h / 2)), smooth=smooth, smooth_quads_only=True)
        return self

    def blob(self, mat, cx, cz, y, r, sx=1.0, sy=1.0, sz=1.0, subdiv=2):
        """Khối tròn low-poly (tán cây, bụi). sy = co giãn theo chiều cao."""
        from mathutils import Matrix
        res = bmesh.ops.create_icosphere(self.bm, subdivisions=subdiv, radius=r)
        m = Matrix.Translation(G(cx, cz, y)) @ Matrix.Diagonal((sx, sz, sy, 1.0))
        self._finish_faces(res['verts'], mat, m, smooth=True)
        return self

    def quad(self, mat, x0, z0, x1, z1, y=0.0):
        """Tấm phẳng nằm ngang, mặt hướng lên."""
        vs = [self.bm.verts.new(G(x, z, y)) for x, z in ((x0, z1), (x1, z1), (x1, z0), (x0, z0))]
        f = self.bm.faces.new(vs)
        f.material_index = self._mat_index(mat)
        return self

    def disc(self, mat, cx, cz, r, y=0.0, segs=16):
        from mathutils import Matrix
        res = bmesh.ops.create_circle(self.bm, cap_ends=True, segments=segs, radius=r)
        self._finish_faces(res['verts'], mat, Matrix.Translation(G(cx, cz, y)))
        return self

    def finish(self, collection, pivot=(0.0, 0.0, 0.0), rot=0.0, **props):
        """Tạo object. pivot = (x, z, y) game: gốc của object (thường là chân vật) để dời/xoay cho dễ."""
        from mathutils import Vector
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces[:])
        mesh = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for name in self.mats:
            mesh.materials.append(self.zone.material(name))
        obj = bpy.data.objects.new(self.name, mesh)
        obj.location = Vector(G(pivot[0], pivot[1], pivot[2]))
        obj.rotation_euler = (0, 0, rot)
        self.zone.link(obj, collection)
        tag(obj, **props)
        return obj


def tag(obj, kind=None, id=None, **props):
    """Gắn nhãn gameplay (custom property htx_*) cho object."""
    if kind:
        obj['htx_kind'] = kind
    if id:
        obj['htx_id'] = id
    for k, v in props.items():
        if v is None:
            continue
        obj['htx_' + k] = (1 if v else 0) if isinstance(v, bool) else v
    return obj


class Zone:
    """Một khu đang được dựng trong scene hiện tại."""

    def __init__(self, zone_id, slug, palette):
        self.zone_id = zone_id
        self.slug = slug
        self.palette = palette
        bpy.ops.wm.read_factory_settings(use_empty=True)
        scene = bpy.context.scene
        scene.name = f'HTX_{slug}'
        scene.unit_settings.system = 'METRIC'
        scene.unit_settings.scale_length = 1.0
        scene['htx_zone_id'] = zone_id
        self.scene = scene
        self.root = bpy.data.collections.new(f'ZONE_{slug}')
        scene.collection.children.link(self.root)
        self.cols = {}
        for name in COLLECTIONS:
            c = bpy.data.collections.new(name)
            self.root.children.link(c)
            self.cols[name] = c
        self._mats = {}

    # --- vật liệu
    def material(self, name):
        if name in self._mats:
            return self._mats[name]
        spec = self.palette.get(name)
        if spec is None:
            raise KeyError(f'Vật liệu "{name}" chưa có trong bảng màu (tools/blender/world/palettes/)')
        m = bpy.data.materials.new(name)
        if getattr(m, 'node_tree', None) is None or not m.node_tree.nodes:
            m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        col = hex_to_linear(spec['color'])
        bsdf.inputs['Base Color'].default_value = col
        bsdf.inputs['Roughness'].default_value = spec.get('roughness', 0.9)
        bsdf.inputs['Metallic'].default_value = 0.0
        m.diffuse_color = col          # màu ở chế độ Solid của viewport
        m.roughness = spec.get('roughness', 0.9)
        self._mats[name] = m
        return m

    def link(self, obj, collection):
        self.cols[collection].objects.link(obj)

    def part(self, name):
        return MeshBuilder(self, name)

    # --- khối để nhìn (mỗi lần gọi = 1 object)
    def box(self, name, collection, mat, cx, cz, w, d, h, y0=0.0, rot=0.0, **props):
        """Hộp có gốc ở tâm đáy; xoay quanh gốc."""
        return self.part(name).box(mat, 0, 0, w, d, h, 0).finish(collection, pivot=(cx, cz, y0), rot=rot, **props)

    def ground(self, name, mat, x0, z0, x1, z1, y=0.0, collection='ENVIRONMENT', **props):
        cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        return self.part(name).quad(mat, x0 - cx, z0 - cz, x1 - cx, z1 - cz, 0).finish(collection, pivot=(cx, cz, y), **props)

    # --- vật cản, sàn, ranh khu (không hiện trong game; hiện dạng khung dây trong Blender)
    def _proxy(self, name, collection, cx, cz, w, d, h, y0, rot, kind, **props):
        from mathutils import Vector
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=(w, d, h), verts=bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = Vector(G(cx, cz, y0 + h / 2))
        obj.rotation_euler = (0, 0, rot)
        obj.display_type = 'WIRE'
        obj.hide_render = True
        self.link(obj, collection)
        tag(obj, kind=kind, **props)
        return obj

    def collider(self, slug, cx, cz, w, d, h=2.4, y0=0.0, rot=0.0, camera=True, **props):
        """Vật cản hình hộp. camera=False: không chắn camera (vật thấp, cột, thân cây)."""
        return self._proxy(f'COLLIDER_{slug}', 'COLLISION', cx, cz, w, d, h, y0, rot, 'collider', camera=camera, **props)

    def collider_round(self, slug, cx, cz, r, h=2.4, y0=0.0, camera=False, **props):
        """Vật cản hình trụ."""
        return self._proxy(f'COLLIDER_{slug}', 'COLLISION', cx, cz, r * 2, r * 2, h, y0, 0.0, 'collider', shape='cylinder', camera=camera, **props)

    def floor(self, slug, x0, z0, x1, z1, y=0.0):
        """Sàn đi được (tấm ẩn). Nhân vật chỉ đứng được ở nơi có sàn."""
        from mathutils import Vector
        name = f'FLOOR_{slug}'
        cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        vs = [bm.verts.new(G(x - cx, z - cz, 0)) for x, z in ((x0, z1), (x1, z1), (x1, z0), (x0, z0))]
        bm.faces.new(vs)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = Vector(G(cx, cz, y))
        obj.display_type = 'WIRE'
        obj.hide_render = True
        self.link(obj, 'COLLISION')
        tag(obj, kind='floor')
        return obj

    def zone_volume(self, x0, z0, x1, z1, slug=None, zone_id=None):
        """Khối ranh khu: người chơi ở trong khối này = đang ở khu này."""
        return self._proxy(f'ZONE_{slug or self.slug}', 'ZONE_BOUNDS', (x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, 4.0, 0.0, 0.0,
                           'zone', id=zone_id or self.zone_id)

    def portal(self, id, cx, cz, w, d, target_spawn, activate='enter', label=None, rot=0.0):
        """Vùng dịch chuyển: bước vào (hoặc bấm E) thì tới điểm xuất hiện `target_spawn`."""
        return self._proxy('PORTAL_' + id.split('.')[-1], 'PORTAL_MARKERS', cx, cz, w, d, 2.2, 0.0, rot, 'portal',
                           id=id, target_spawn=target_spawn, activate=activate, label=label)

    # --- marker (Empty)
    def marker(self, kind, id, x, z, y=0.0, facing=None, radius=None, **props):
        """Marker gameplay. facing = hướng nhìn trong game (radian; 0 = nhìn về +z, pi = nhìn về -z).
        Trong Blender: trục Y (xanh lá) của Empty chỉ hướng nhìn."""
        from mathutils import Vector
        prefix = {'spawn': 'SPAWN_', 'interact': 'ITR_', 'spot': 'SPOT_', 'camera': 'CAM_', 'target': 'TARGET_', 'trigger': 'TRIGGER_'}[kind]
        obj = bpy.data.objects.new(prefix + '_'.join(id.split('.')[2:]), None)
        obj.location = Vector(G(x, z, y))
        obj.empty_display_type = {'spawn': 'ARROWS', 'spot': 'ARROWS', 'interact': 'SPHERE', 'camera': 'CONE', 'target': 'PLAIN_AXES', 'trigger': 'CUBE'}[kind]
        obj.empty_display_size = radius if (radius and kind == 'interact') else 0.5
        if facing is not None:
            obj.rotation_euler = (0, 0, facing + math.pi)
        self.link(obj, MARKER_COLLECTION[kind])
        tag(obj, kind=kind, id=id, radius=radius, **props)
        return obj

    def camera_marker(self, id, pos, look_at):
        """Máy ảnh đặt sẵn: marker vị trí `id` + marker đích `id.target`. pos/look_at = (x, y cao, z) game."""
        self.marker('camera', id, pos[0], pos[2], pos[1])
        self.marker('target', id + '.target', look_at[0], look_at[2], look_at[1])

    # --- ánh sáng + máy quay xem thử (chỉ để nhìn trong Blender; game dùng preset ánh sáng riêng)
    def lighting(self, center, size):
        from mathutils import Vector
        sun_data = bpy.data.lights.new('PREVIEW_sun', 'SUN')
        sun_data.energy = 3.0
        sun = bpy.data.objects.new('PREVIEW_sun', sun_data)
        sun.rotation_euler = (math.radians(50), 0, math.radians(35))
        sun.location = Vector(G(center[0], center[1], 30))
        self.link(sun, 'LIGHTING')
        world = bpy.data.worlds.new('PREVIEW_world')
        world.use_nodes = True
        bg = world.node_tree.nodes.get('Background')
        if bg:
            bg.inputs[0].default_value = (0.62, 0.78, 0.95, 1.0)
            bg.inputs[1].default_value = 0.9
        self.scene.world = world
        cam_data = bpy.data.cameras.new('PREVIEW_camera')
        cam_data.lens = 28
        cam = bpy.data.objects.new('PREVIEW_camera', cam_data)
        dist = size * 0.95
        cam.location = Vector(G(center[0] + dist * 0.55, center[1] + dist * 0.8, dist * 0.7))
        self.link(cam, 'LIGHTING')
        direction = Vector(G(center[0], center[1], 1.0)) - cam.location
        cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
        self.scene.camera = cam


# ----------------------------------------------------------------------------- kiểm tra + xuất

def kind_of(obj):
    k = obj.get('htx_kind')
    if isinstance(k, str) and k:
        return k
    name = obj.name.upper()
    for prefix, kind in NAME_PREFIX_KIND:
        if name.startswith(prefix):
            return kind
    return 'visual'


def normalize_tags(scene):
    """Điền htx_kind cho object đặt tên theo tiền tố (COLLIDER_, SPAWN_…) hoặc nằm trong collection COLLISION mà chưa gắn nhãn.
    Trả về danh sách tên object vừa được điền."""
    filled = []
    for obj in scene.objects:
        if obj.get('htx_kind'):
            continue
        kind = kind_of(obj)
        if kind == 'visual' and obj.type == 'MESH' and any(c.name == 'COLLISION' for c in obj.users_collection):
            kind = 'collider'
        if kind != 'visual':
            obj['htx_kind'] = kind
            filled.append(obj.name)
    return filled


def check_scene(scene, zone_id=None):
    """Kiểm tra quy ước trước khi xuất. Trả (errors, warnings)."""
    errors, warnings = [], []
    seen = {}
    counts = {}
    for obj in scene.objects:
        kind = kind_of(obj)
        counts[kind] = counts.get(kind, 0) + 1
        if kind == 'visual':
            continue
        oid = obj.get('htx_id')
        if kind in KINDS_NEED_ID and not (isinstance(oid, str) and oid):
            errors.append(f'{obj.name}: loại {kind} thiếu custom property htx_id')
        if kind in KINDS_NEED_MESH and obj.type != 'MESH':
            errors.append(f'{obj.name}: loại {kind} phải là mesh (hình hộp)')
        if kind in ('collider', 'zone', 'portal', 'trigger') and obj.type == 'MESH':
            rx, ry, _ = obj.matrix_world.to_euler()
            if abs(rx) > 1e-3 or abs(ry) > 1e-3:
                warnings.append(f'{obj.name}: bị nghiêng — game sẽ dùng hộp bao thẳng trục; chỉ nên xoay quanh trục Z')
        if isinstance(oid, str) and oid and kind not in ('collider', 'floor'):
            key = (kind, oid)
            if key in seen and kind != 'zone':
                errors.append(f'{obj.name}: htx_id "{oid}" trùng với {seen[key]}')
            seen[key] = obj.name
        if kind == 'portal' and not obj.get('htx_target_spawn'):
            errors.append(f'{obj.name}: portal thiếu htx_target_spawn')
        if kind == 'camera' and isinstance(oid, str) and ('target', oid + '.target') not in seen and not any(
                kind_of(o) == 'target' and o.get('htx_id') == oid + '.target' for o in scene.objects):
            errors.append(f'{obj.name}: máy ảnh "{oid}" thiếu marker đích "{oid}.target"')
    if not counts.get('floor'):
        errors.append('Khu không có sàn (FLOOR_*): nhân vật sẽ không đứng được ở đâu')
    if zone_id:
        zones = [o.get('htx_id') for o in scene.objects if kind_of(o) == 'zone']
        if zone_id not in zones:
            errors.append(f'Thiếu khối ranh khu (ZONE_*) mang htx_id = "{zone_id}"')
        for z in zones:
            if z != zone_id:
                warnings.append(f'Khối ranh khu mang htx_id "{z}" khác ID của khu này ({zone_id})')
    return errors, warnings, counts


def export_glb(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=path, **GLTF_EXPORT)   # tham số: pipeline_config.GLTF_EXPORT
    return os.path.getsize(path)


def fingerprint(scene):
    """Dấu vân tay nội dung scene. Generator ghi lại lúc sinh file; nếu file hiện tại cho dấu khác nghĩa là ĐÃ SỬA TAY."""
    def r(v):
        return round(float(v), 3) + 0.0
    bpy.context.view_layer.update()   # object mới tạo chưa có matrix_world đúng cho tới khi cập nhật
    items = []
    for obj in sorted(scene.objects, key=lambda o: o.name):
        entry = [obj.name, obj.type, obj.parent.name if obj.parent else '',
                 [r(x) for row in obj.matrix_world for x in row],
                 sorted((k, str(obj[k])) for k in obj.keys() if k.startswith('htx_')),
                 sorted(c.name for c in obj.users_collection)]
        if obj.type == 'MESH':
            me = obj.data
            entry += [len(me.vertices), len(me.polygons), [r(x) for v in obj.bound_box for x in v],
                      [m.name if m else '' for m in me.materials]]
        items.append(entry)
    mats = []
    for m in sorted(bpy.data.materials, key=lambda m: m.name):
        bsdf = m.node_tree.nodes.get('Principled BSDF') if m.node_tree else None
        col = [r(x) for x in bsdf.inputs['Base Color'].default_value] if bsdf else []
        mats.append([m.name, col])
    blob = json.dumps([items, mats], ensure_ascii=False, sort_keys=True)
    return hashlib.sha1(blob.encode('utf-8')).hexdigest()


def blend_state(path):
    """Trạng thái một file .blend có sẵn: 'missing' | 'generated' (chưa ai sửa) | 'edited' (đã sửa tay hoặc không do generator sinh)."""
    if not os.path.exists(path):
        return 'missing'
    bpy.ops.wm.open_mainfile(filepath=path)
    scene = bpy.context.scene
    stored = scene.get('htx_gen_fingerprint')
    if not stored:
        return 'edited'
    return 'generated' if stored == fingerprint(scene) else 'edited'


def save_blend(path, mark_generated=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene = bpy.context.scene
    if mark_generated:
        scene['htx_gen_rev'] = GEN_REV
        scene['htx_gen_fingerprint'] = fingerprint(scene)
    bpy.ops.wm.save_as_mainfile(filepath=path, compress=True)
    for junk in (path + '1',):
        if os.path.exists(junk):
            os.remove(junk)


def backup(path):
    """Sao lưu file trước khi ghi đè (thư mục backups/ không đưa vào Git)."""
    d = os.path.join(os.path.dirname(path), 'backups')
    os.makedirs(d, exist_ok=True)
    dst = os.path.join(d, f'{os.path.splitext(os.path.basename(path))[0]}.{time.strftime("%Y%m%d-%H%M%S")}.blend')
    shutil.copy2(path, dst)
    return dst


def render_preview(path, width=960, height=540, samples=12):
    """Kết xuất một ảnh xem thử bằng Cycles (CPU) từ PREVIEW_camera — để chắc chắn Blender render có màu."""
    scene = bpy.context.scene
    if scene.camera is None:
        return None
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = False
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = path
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    return path


def export_current(glb_path, zone_id=None, log=print):
    """Chuẩn hóa nhãn → kiểm tra → xuất GLB từ scene đang mở. Trả về dict kết quả; ném lỗi nếu vi phạm quy ước."""
    scene = bpy.context.scene
    filled = normalize_tags(scene)
    errors, warnings, counts = check_scene(scene, zone_id)
    for w in warnings:
        log(f'  nhắc: {w}')
    if errors:
        for e in errors:
            log(f'  LỖI: {e}')
        raise RuntimeError(f'{len(errors)} lỗi quy ước — chưa xuất {os.path.basename(glb_path)}')
    size = export_glb(glb_path)
    return {'glb': glb_path, 'bytes': size, 'counts': counts, 'auto_tagged': filled, 'warnings': warnings}
