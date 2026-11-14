"""Hàm dùng chung cho script dựng asset bằng Blender (bpy). Kiểm thử với Blender 5.2 LTS.

Quy ước (xem BLENDER_PIPELINE.md trong Claude Project):
- 1 đơn vị Blender = 1 mét. Gốc (origin) đặt ở giữa đáy vật, chạm sàn (z = 0).
- Mặt trước vật hướng về -Y trong Blender (khi xuất glTF sẽ thành +Z trong Three.js).
- Màu lấy từ bảng màu của game; vật liệu trong game được đổi sang toon khi nạp (src/render/assets.ts),
  nên ở Blender chỉ cần đặt Base Color đúng — không cần texture.
"""
import os
import bpy
import bmesh


_materials: dict = {}


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _materials.clear()
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    return scene


def hex_to_linear(hex_color: str):
    """'#c08a55' → màu tuyến tính (Blender lưu Base Color ở không gian tuyến tính)."""
    h = hex_color.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def material(name: str, hex_color: str, roughness: float = 0.8):
    if name in _materials:
        return _materials[name]
    m = bpy.data.materials.new(name)
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = hex_to_linear(hex_color)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = 0.0
    _materials[name] = m
    return m


def box(name: str, size, location, mat, bevel: float = 0.0, parent=None):
    """Hộp kích thước (x, y, z) mét, `location` là TÂM hộp. bevel > 0 → bo cạnh nhẹ (ít đa giác)."""
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES')
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    obj.data.materials.append(mat)
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def join(objects, name: str):
    """Gộp các phần cùng một vật thành 1 mesh → ít lượt vẽ hơn trong game."""
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = name
    obj.data.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return obj


def stats(obj):
    obj.data.calc_loop_triangles()
    return {'tris': len(obj.data.loop_triangles), 'materials': len(obj.data.materials)}


def export_glb(path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_yup=True,          # Three.js dùng trục Y hướng lên
        export_apply=True,        # áp modifier trước khi xuất
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
        export_extras=True,       # giữ custom property (asset_id…) → đọc được trong game
    )
    return os.path.getsize(path)
