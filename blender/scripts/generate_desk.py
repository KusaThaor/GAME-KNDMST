"""
=============================================================================
HÀNH TRÌNH THANH XUÂN — 3D ASSET GENERATION SCRIPT
Asset: Bộ bàn ghế học sinh THCS Việt Nam (Student Desk & Chair Set)
Visual Identity: Cozy Stylized 3D / Toy-like / Semi-chibi scale
Target Platform: Three.js (Web) via GLTF/GLB
Tool: Blender Python (bpy) - Blender 4.x/5.x
=============================================================================
"""

import bpy
import math
import os
import sys

# =============================================================================
# 1. CẤU HÌNH THƯ MỤC VÀ ĐƯỜNG DẪN XUẤT FILE
# =============================================================================
if "__file__" in globals() and os.path.isabs(__file__):
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
else:
    PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")

OUTPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "scenes", "school_desk.blend")
OUTPUT_GLB = os.path.join(PROJECT_ROOT, "assets", "props", "school_desk.glb")
OUTPUT_PREVIEW = os.path.join(PROJECT_ROOT, "blender", "previews", "school_desk.png")

for d in [os.path.dirname(OUTPUT_BLEND), os.path.dirname(OUTPUT_GLB), os.path.dirname(OUTPUT_PREVIEW)]:
    os.makedirs(d, exist_ok=True)

# =============================================================================
# 2. KHỞI TẠO VÀ DỌN DẸP SCENE
# =============================================================================
def reset_scene():
    """Xóa sạch các đối tượng cũ, collections và dữ liệu mesh thừa."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # Xóa toàn bộ collections thừa
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    # Tạo collection gốc cho mô hình
    desk_col = bpy.data.collections.new("School_Desk_Set")
    bpy.context.scene.collection.children.link(desk_col)
    return desk_col

# =============================================================================
# 3. QUẢN LÝ VẬT LIỆU (STYLIZED MATTE MATERIALS)
# =============================================================================
def srgb_to_linear(hex_code, alpha=1.0):
    """Chuyển mã Hex sang Linear sRGB (Blender color space)."""
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def create_wood_material(name="M_Wood_SchoolDesk"):
    """
    Tạo vật liệu gỗ stylized ấm áp theo phong cách 'Hành Trình Thanh Xuân'
    (Tone màu cánh gián / sồi mật ong, bề mặt mịn mờ matte, có biến thiên sắc thái nhẹ).
    """
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    # Nodes
    output_node = nodes.new(type="ShaderNodeOutputMaterial")
    output_node.location = (600, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (300, 0)
    # Thiết lập độ nhám và phản xạ chuẩn phong cách cozy toy-like
    bsdf.inputs["Roughness"].default_value = 0.52
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = 0.0

    # Color Ramp tạo dải màu gỗ ấm
    ramp = nodes.new(type="ShaderNodeValToRGB")
    ramp.location = (0, 0)
    ramp.color_ramp.elements[0].position = 0.2
    ramp.color_ramp.elements[0].color = srgb_to_linear("#ba7b3b")  # Nâu sồi vàng ấm
    ramp.color_ramp.elements[1].position = 0.85
    ramp.color_ramp.elements[1].color = srgb_to_linear("#cb8d48")  # Vàng cánh gián tươi sáng

    # Noise texture tạo độ biến thiên mềm mại tự nhiên (subtle hand-painted feeling)
    noise = nodes.new(type="ShaderNodeTexNoise")
    noise.location = (-300, 0)
    noise.inputs["Scale"].default_value = 14.0
    noise.inputs["Detail"].default_value = 2.0
    noise.inputs["Roughness"].default_value = 0.4

    mapping = nodes.new(type="ShaderNodeMapping")
    mapping.location = (-550, 0)
    mapping.inputs["Scale"].default_value = (1.0, 1.0, 3.5)

    tex_coord = nodes.new(type="ShaderNodeTexCoord")
    tex_coord.location = (-750, 0)

    # Nối dây
    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(bsdf.outputs["BSDF"], output_node.inputs["Surface"])

    return mat

def create_metal_material(name="M_Metal_Hook"):
    """Vật liệu kim loại cho móc treo cặp (Inox/thép nhám nhẹ)."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = srgb_to_linear("#a6adb5")
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = 0.90
        bsdf.inputs["Roughness"].default_value = 0.32
    return mat

# =============================================================================
# 4. HÀM TẠO KHỐI HÌNH HỌC TÁI SỬ DỤNG (REUSABLE MODELING HELPERS)
# =============================================================================
def add_beveled_box(name, size, location, material, target_collection, bevel_width=0.006, bevel_segments=2):
    """
    Tạo khối hộp có bo viền Bevel Modifier mịn màng theo chuẩn toy-like 3D.
    Tự động áp dụng scale để modifier không bị méo.
    """
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    if bevel_width > 0:
        bevel = obj.modifiers.new(name="Bevel", type="BEVEL")
        bevel.width = bevel_width
        bevel.segments = bevel_segments
        bevel.limit_method = "ANGLE"
        bevel.angle_limit = math.radians(40)
        bevel.harden_normals = True

    # Shade Smooth
    for p in obj.data.polygons:
        p.use_smooth = True

    if material:
        obj.data.materials.append(material)

    # Chuyển vào collection đích
    if target_collection not in obj.users_collection:
        target_collection.objects.link(obj)
    for c in list(obj.users_collection):
        if c != target_collection:
            c.objects.unlink(obj)

    return obj

def add_smooth_cylinder(name, radius, depth, location, rotation, material, target_collection, vertices=16):
    """Tạo hình trụ tròn bo mịn (thanh uốn, móc treo)."""
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
        vertices=vertices
    )
    obj = bpy.context.active_object
    obj.name = name

    for p in obj.data.polygons:
        p.use_smooth = True

    if material:
        obj.data.materials.append(material)

    if target_collection not in obj.users_collection:
        target_collection.objects.link(obj)
    for c in list(obj.users_collection):
        if c != target_collection:
            c.objects.unlink(obj)

    return obj

# =============================================================================
# 5. DỰNG MÔ HÌNH THỦ TỤC BÀN HỌC (STUDENT DESK)
# =============================================================================
def build_student_desk(col, wood_mat, metal_mat):
    """
    Dựng bàn học đôi THCS theo đúng concept art trong asset_class.png:
    - Mặt bàn gỗ dày bo góc (tabletop)
    - Ngăn bàn 2 hộc chia đôi (double cubby shelf)
    - 4 chân gỗ vuông vát bo tròn vững chãi
    - Thanh dầm đáy 2 bên + Thanh gác chân ngang ở giữa
    - 2 móc treo cặp học sinh bằng kim loại 2 bên sườn
    """
    desk_objects = []

    # Kích thước tiêu chuẩn (hệ mét)
    desk_w = 1.20       # Rộng 1.20m
    desk_d = 0.46       # Sâu 0.46m
    desk_h = 0.68       # Cao 0.68m
    top_thick = 0.032   # Mặt bàn gỗ dày dặn 3.2cm
    leg_w = 0.048       # Chân gỗ 4.8cm x 4.8cm
    shelf_h = 0.12      # Chiều cao hộc ngăn bàn 12cm
    shelf_thick = 0.018 # Tấm đáy ngăn bàn dày 1.8cm

    # 1. Mặt bàn gỗ (Desk_Tabletop)
    top_z = desk_h - top_thick / 2.0
    tabletop = add_beveled_box(
        "Desk_Tabletop",
        (desk_w, desk_d, top_thick),
        (0.0, 0.0, top_z),
        wood_mat, col, bevel_width=0.008, bevel_segments=3
    )
    desk_objects.append(tabletop)

    # 2. Đáy ngăn bàn (Desk_Shelf_Bottom)
    shelf_bottom_z = desk_h - top_thick - shelf_h
    shelf_w = desk_w - leg_w * 2 - 0.02
    shelf_d = desk_d - 0.04
    shelf_bottom = add_beveled_box(
        "Desk_Shelf_Bottom",
        (shelf_w, shelf_d, shelf_thick),
        (0.0, 0.01, shelf_bottom_z),
        wood_mat, col, bevel_width=0.004, bevel_segments=2
    )
    desk_objects.append(shelf_bottom)

    # 3. Vách ngăn đôi giữa bàn (Desk_Shelf_Divider)
    divider = add_beveled_box(
        "Desk_Shelf_Divider",
        (shelf_thick, shelf_d, shelf_h),
        (0.0, 0.01, shelf_bottom_z + shelf_h / 2.0),
        wood_mat, col, bevel_width=0.003, bevel_segments=2
    )
    desk_objects.append(divider)

    # 4. Tấm chắn sau ngăn bàn (Desk_Apron_Back)
    apron_back = add_beveled_box(
        "Desk_Apron_Back",
        (shelf_w, 0.018, shelf_h),
        (0.0, -desk_d / 2.0 + 0.03, shelf_bottom_z + shelf_h / 2.0),
        wood_mat, col, bevel_width=0.003, bevel_segments=2
    )
    desk_objects.append(apron_back)

    # 5. Hai tấm ốp sườn che ngăn bàn (Desk_Apron_Left & Right)
    for side, side_name in [(-1, "Left"), (1, "Right")]:
        apron_x = side * (desk_w / 2.0 - leg_w - 0.008)
        apron_side = add_beveled_box(
            f"Desk_Apron_{side_name}",
            (0.016, shelf_d, shelf_h),
            (apron_x, 0.01, shelf_bottom_z + shelf_h / 2.0),
            wood_mat, col, bevel_width=0.003, bevel_segments=2
        )
        desk_objects.append(apron_side)

    # 6. 4 Chân bàn gỗ (Desk_Legs)
    leg_h = desk_h - top_thick
    leg_x_half = desk_w / 2.0 - leg_w / 2.0 - 0.02
    leg_y_half = desk_d / 2.0 - leg_w / 2.0 - 0.02

    leg_positions = [
        (-leg_x_half, -leg_y_half, "FrontLeft"),
        ( leg_x_half, -leg_y_half, "FrontRight"),
        (-leg_x_half,  leg_y_half, "BackLeft"),
        ( leg_x_half,  leg_y_half, "BackRight"),
    ]

    for lx, ly, leg_name in leg_positions:
        leg = add_beveled_box(
            f"Desk_Leg_{leg_name}",
            (leg_w, leg_w, leg_h),
            (lx, ly, leg_h / 2.0),
            wood_mat, col, bevel_width=0.006, bevel_segments=2
        )
        desk_objects.append(leg)

    # 7. Thanh dầm đáy 2 bên sườn (Desk_Stretcher_Left & Right)
    stretcher_h = 0.032
    stretcher_w = 0.032
    stretcher_d = desk_d - 0.04
    for side, side_name in [(-1, "Left"), (1, "Right")]:
        stretcher_x = side * leg_x_half
        stretcher = add_beveled_box(
            f"Desk_Stretcher_{side_name}",
            (stretcher_w, stretcher_d, stretcher_h),
            (stretcher_x, 0.0, 0.05 + stretcher_h / 2.0),
            wood_mat, col, bevel_width=0.004, bevel_segments=2
        )
        desk_objects.append(stretcher)

    # 8. Thanh giằng gác chân ngang ở giữa (Desk_Footrest_Bar)
    footrest_len = desk_w - leg_w * 2 - 0.04
    footrest = add_beveled_box(
        "Desk_Footrest_Bar",
        (footrest_len, 0.036, 0.032),
        (0.0, -0.02, 0.09),
        wood_mat, col, bevel_width=0.005, bevel_segments=2
    )
    desk_objects.append(footrest)

    # 9. Móc kim loại treo cặp 2 bên sườn bàn (Desk_BagHook)
    hook_radius = 0.004
    for side, side_name in [(-1, "Left"), (1, "Right")]:
        hx = side * (desk_w / 2.0 - 0.015)
        hy = -0.06
        hz = desk_h - top_thick - shelf_h / 2.0

        # Thân ngang
        stem = add_smooth_cylinder(
            f"Desk_BagHook_{side_name}_Stem",
            hook_radius, 0.045,
            (hx + side * 0.022, hy, hz),
            (0.0, math.radians(90), 0.0),
            metal_mat, col
        )
        # Đầu móc cong lên
        tip = add_smooth_cylinder(
            f"Desk_BagHook_{side_name}_Tip",
            hook_radius, 0.026,
            (hx + side * 0.044, hy, hz + 0.012),
            (0.0, 0.0, 0.0),
            metal_mat, col
        )
        desk_objects.extend([stem, tip])

    return desk_objects

# =============================================================================
# 6. DỰNG MÔ HÌNH THỦ TỤC GHẾ HỌC SINH (STUDENT CHAIR)
# =============================================================================
def build_student_chair(chair_index, center_x, center_y, col, wood_mat):
    """
    Dựng ghế đơn học sinh đúng theo concept art trong asset_class.png:
    - Mặt ngồi gỗ bo tròn các cạnh
    - Tựa lưng hơi nghiêng về sau (~8 độ) tạo nét sinh động
    - 2 cột trụ đứng nâng đỡ tựa lưng
    - 4 chân gỗ chunky hơi choãi nhẹ
    - 4 thanh giằng vuông củng cố chân ghế
    """
    chair_objects = []
    prefix = f"Chair_{chair_index}"

    chair_w = 0.38       # Rộng 38cm
    chair_d = 0.36       # Sâu 36cm
    seat_h = 0.40        # Chiều cao mặt ngồi 40cm
    seat_thick = 0.024   # Mặt gỗ dày 2.4cm
    back_h = 0.74        # Chiều cao đỉnh tựa lưng 74cm
    leg_size = 0.042     # Chân ghế 4.2cm x 4.2cm

    # 1. Mặt ngồi của ghế (Seat)
    seat = add_beveled_box(
        f"{prefix}_Seat",
        (chair_w, chair_d, seat_thick),
        (center_x, center_y, seat_h - seat_thick / 2.0),
        wood_mat, col, bevel_width=0.007, bevel_segments=3
    )
    chair_objects.append(seat)

    # 2. Tựa lưng ghế (Backrest)
    back_y = center_y + chair_d / 2.0 - 0.025
    back_tilt = math.radians(-8.0)  # Nghiêng nhẹ về sau
    backrest = add_beveled_box(
        f"{prefix}_Backrest",
        (chair_w * 0.95, 0.020, 0.15),
        (center_x, back_y + 0.01, back_h - 0.075),
        wood_mat, col, bevel_width=0.006, bevel_segments=3
    )
    backrest.rotation_euler = (back_tilt, 0.0, 0.0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    chair_objects.append(backrest)

    # 3. Hai cột đỡ tựa lưng (BackPosts)
    post_h = back_h - seat_h - 0.02
    post_w = 0.032
    for side_x in [-chair_w * 0.35, chair_w * 0.35]:
        post = add_beveled_box(
            f"{prefix}_BackPost",
            (post_w, 0.022, post_h),
            (center_x + side_x, back_y, seat_h + post_h / 2.0),
            wood_mat, col, bevel_width=0.003, bevel_segments=2
        )
        post.rotation_euler = (back_tilt, 0.0, 0.0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        chair_objects.append(post)

    # 4. Bốn chân ghế gỗ (Legs)
    leg_len = seat_h - seat_thick
    leg_x_half = chair_w / 2.0 - leg_size / 2.0 - 0.018
    leg_y_half = chair_d / 2.0 - leg_size / 2.0 - 0.018

    leg_coords = [
        (-leg_x_half, -leg_y_half, "FL"),
        ( leg_x_half, -leg_y_half, "FR"),
        (-leg_x_half,  leg_y_half, "BL"),
        ( leg_x_half,  leg_y_half, "BR"),
    ]

    for lx, ly, ltag in leg_coords:
        leg = add_beveled_box(
            f"{prefix}_Leg_{ltag}",
            (leg_size, leg_size, leg_len),
            (center_x + lx, center_y + ly, leg_len / 2.0),
            wood_mat, col, bevel_width=0.005, bevel_segments=2
        )
        chair_objects.append(leg)

    # 5. Bốn thanh giằng chân ghế (Stretchers)
    rung_thick = 0.024
    rung_z = 0.12
    # Thanh ngang trước - sau
    for side_x in [-leg_x_half, leg_x_half]:
        r_side = add_beveled_box(
            f"{prefix}_Rung_Side",
            (0.020, chair_d - 0.05, rung_thick),
            (center_x + side_x, center_y, rung_z),
            wood_mat, col, bevel_width=0.003, bevel_segments=2
        )
        chair_objects.append(r_side)

    # Thanh ngang trái - phải
    for side_y in [-leg_y_half, leg_y_half]:
        r_cross = add_beveled_box(
            f"{prefix}_Rung_Cross",
            (chair_w - 0.05, 0.020, rung_thick),
            (center_x, center_y + side_y, rung_z),
            wood_mat, col, bevel_width=0.003, bevel_segments=2
        )
        chair_objects.append(r_cross)

    return chair_objects

# =============================================================================
# 7. THIẾT LẬP CAMERA, STUDIO LIGHTING & PREVIEW RENDER
# =============================================================================
def setup_studio_preview(preview_col):
    """Thiết lập ánh sáng studio 3 điểm và camera góc trục đo chụp ảnh preview."""
    # Camera góc 3/4 Hero view nhìn thấy cả mặt ghế, ngăn bàn và móc cặp
    cam_data = bpy.data.cameras.new("Studio_Camera")
    cam_data.lens = 48
    cam_data.sensor_width = 36
    cam_obj = bpy.data.objects.new("Studio_Camera", cam_data)
    cam_obj.location = (-2.3, 2.4, 1.7)
    # Xoay nhìn về tâm bộ bàn ghế (0, 0.15, 0.38)
    cam_obj.rotation_euler = (math.radians(64.0), 0.0, math.radians(-138.0))
    preview_col.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Key Light (Ánh sáng chính ấm áp)
    key_light = bpy.data.lights.new(name="Key_Light", type="SUN")
    key_light.energy = 4.2
    key_light.color = srgb_to_linear("#fff8ed")[:3]
    key_obj = bpy.data.objects.new("Key_Light", key_light)
    key_obj.rotation_euler = (math.radians(50.0), math.radians(25.0), math.radians(-40.0))
    preview_col.objects.link(key_obj)

    # Fill Light (Ánh sáng phụ dịu mát)
    fill_light = bpy.data.lights.new(name="Fill_Light", type="SUN")
    fill_light.energy = 2.0
    fill_light.color = srgb_to_linear("#d8e6f8")[:3]
    fill_obj = bpy.data.objects.new("Fill_Light", fill_light)
    fill_obj.rotation_euler = (math.radians(40.0), math.radians(-30.0), math.radians(140.0))
    preview_col.objects.link(fill_obj)

    # Rim Light (Ánh sáng ven làm nổi bật các đường viền bo góc)
    rim_light = bpy.data.lights.new(name="Rim_Light", type="SUN")
    rim_light.energy = 2.5
    rim_light.color = srgb_to_linear("#ffffff")[:3]
    rim_obj = bpy.data.objects.new("Rim_Light", rim_light)
    rim_obj.rotation_euler = (math.radians(30.0), math.radians(10.0), math.radians(45.0))
    preview_col.objects.link(rim_obj)

    # Sàn bắt bóng (Shadow Catcher / Studio Floor)
    bpy.ops.mesh.primitive_plane_add(size=14.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Studio_Floor"
    floor_mat = bpy.data.materials.new(name="M_Studio_Floor")
    floor_mat.use_nodes = True
    f_bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
    if f_bsdf:
        f_bsdf.inputs["Base Color"].default_value = srgb_to_linear("#e8eff6")
        f_bsdf.inputs["Roughness"].default_value = 0.95
    floor.data.materials.append(floor_mat)
    preview_col.objects.link(floor)
    bpy.context.scene.collection.objects.unlink(floor)

# =============================================================================
# 8. HÀM CHẠY TỔNG THỂ (MAIN EXECUTION PIPELINE)
# =============================================================================
def main():
    print("=" * 70)
    print(" [HÀNH TRÌNH THANH XUÂN] BẮT ĐẦU SINH ASSET: BỘ BÀN GHẾ THCS")
    print("=" * 70)

    # 1. Reset scene
    desk_col = reset_scene()

    # 2. Tạo vật liệu chuẩn
    wood_mat = create_wood_material()
    metal_mat = create_metal_material()

    # 3. Dựng bàn học (Student Desk)
    desk_objs = build_student_desk(desk_col, wood_mat, metal_mat)
    print(f">> Đã tạo Bàn học đôi ({len(desk_objs)} objects).")

    # 4. Dựng 2 ghế học sinh rời (2 Matching Student Chairs)
    desk_d = 0.46
    chair_dist = 0.22
    chair_d = 0.36
    chair_y = desk_d / 2.0 + chair_dist + chair_d / 2.0

    chair1_objs = build_student_chair(1, -0.32, chair_y, desk_col, wood_mat)
    chair2_objs = build_student_chair(2,  0.32, chair_y, desk_col, wood_mat)
    print(f">> Đã tạo Ghế học sinh 1 & 2 ({len(chair1_objs) + len(chair2_objs)} objects).")

    all_desk_mesh_objs = desk_objs + chair1_objs + chair2_objs
    print(f">> TỔNG SỐ OBJECTS: {len(all_desk_mesh_objs)}")

    # 5. Lưu file .blend nguồn
    print(f">> Đang lưu file .blend vào: {OUTPUT_BLEND}")
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

    # 6. Xuất file .glb chuẩn Three.js
    print(f">> Đang xuất file .glb vào: {OUTPUT_GLB}")
    # Chọn toàn bộ objects của bộ bàn ghế để xuất
    bpy.ops.object.select_all(action="DESELECT")
    for obj in all_desk_mesh_objs:
        obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT"
    )
    print(">> Xuất file GLB thành công!")

    # 7. Render Preview Image
    print(">> Đang thiết lập camera và render preview...")
    preview_col = bpy.data.collections.new("Studio_Preview")
    bpy.context.scene.collection.children.link(preview_col)
    setup_studio_preview(preview_col)

    # Cấu hình render
    scene = bpy.context.scene
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.filepath = OUTPUT_PREVIEW

    # Thử render bằng Cycles hoặc EEVEE
    try:
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 64
        scene.cycles.device = "CPU"
    except:
        scene.render.engine = "BLENDER_EEVEE_NEXT"

    bpy.ops.render.render(write_still=True)
    print(f">> Đã lưu ảnh preview vào: {OUTPUT_PREVIEW}")
    print("=" * 70)
    print(" [HOÀN THÀNH XUẤT SẮC] PIPELINE DỰNG ASSET KẾT THÚC.")
    print("=" * 70)

if __name__ == "__main__":
    main()
