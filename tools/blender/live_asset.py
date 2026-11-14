import bpy
import math

def create_or_get_material(name, color, roughness=0.5, metallic=0.0):
    """Tạo hoặc lấy vật liệu với Principled BSDF."""
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        if 'Metallic' in bsdf.inputs:
            bsdf.inputs['Metallic'].default_value = metallic
    return mat

def hex_to_rgba(hex_str, alpha=1.0):
    """Chuyển mã hex sang màu RGBA trong không gian tuyến tính của Blender."""
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    # Chuyển đổi Gamma sang Linear
    r_lin = r ** 2.2
    g_lin = g ** 2.2
    b_lin = b ** 2.2
    return (r_lin, g_lin, b_lin, alpha)

def build_vietnamese_school_desk():
    """Hàm sinh thủ tục bộ bàn ghế học sinh THCS trong Blender."""
    col_name = "Vietnamese_School_Desk"
    
    # 1. Quản lý Collection riêng biệt
    col = bpy.data.collections.get(col_name)
    if col is None:
        col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(col)
    else:
        # Xóa các mesh cũ trong collection này
        for obj in list(col.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

    # 2. Tạo các vật liệu chuẩn
    wood_mat = create_or_get_material(
        "Mat_School_Wood",
        hex_to_rgba("#cf9860"),
        roughness=0.6,
        metallic=0.0
    )
    frame_mat = create_or_get_material(
        "Mat_School_Frame_Metal",
        hex_to_rgba("#5c646b"),
        roughness=0.45,
        metallic=0.8
    )
    feet_mat = create_or_get_material(
        "Mat_School_Rubber_Feet",
        hex_to_rgba("#22252a"),
        roughness=0.85,
        metallic=0.05
    )
    hook_mat = create_or_get_material(
        "Mat_School_Inox_Hook",
        hex_to_rgba("#b0b5b9"),
        roughness=0.25,
        metallic=0.95
    )

    # Helper tạo hộp
    def add_box(name, size, loc, mat, bevel=0.005):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = size
        bpy.ops.object.transform_apply(scale=True)
        if bevel > 0:
            mod = obj.modifiers.new(name="Bevel", type='BEVEL')
            mod.width = bevel
            mod.segments = 2
        if mat:
            obj.data.materials.append(mat)
        col.objects.link(obj)
        bpy.context.scene.collection.objects.unlink(obj)
        return obj

    # Helper tạo hình trụ tròn
    def add_cylinder(name, radius, depth, loc, rot, mat):
        bpy.ops.mesh.primitive_cylinder_add(
            radius=radius,
            depth=depth,
            location=loc,
            rotation=rot,
            vertices=16
        )
        obj = bpy.context.active_object
        obj.name = name
        if mat:
            obj.data.materials.append(mat)
        bpy.ops.object.shade_smooth()
        col.objects.link(obj)
        bpy.context.scene.collection.objects.unlink(obj)
        return obj

    # ==============================
    # 3. DỰNG BÀN HỌC (DESK)
    # ==============================
    desk_w = 1.2      # Chiều rộng 1.2m
    desk_d = 0.45     # Chiều sâu 0.45m
    desk_h = 0.68     # Chiều cao 0.68m
    top_thick = 0.02  # Độ dày mặt bàn 2cm
    pipe_r = 0.0125   # Ống thép bán kính 1.25cm (ống d25mm)
    foot_h = 0.018

    # 3.1 Mặt bàn gỗ
    add_box(
        "Desk_Tabletop",
        (desk_w, desk_d, top_thick),
        (0, 0, desk_h - top_thick / 2),
        wood_mat,
        bevel=0.006
    )

    # 3.2 Rãnh để bút/thước kẻ mép trên
    add_box(
        "Desk_Pencil_Groove",
        (desk_w * 0.75, 0.02, 0.003),
        (0, -desk_d / 2 + 0.045, desk_h + 0.001),
        wood_mat,
        bevel=0.001
    )

    # 3.3 Ngăn bàn để cặp / sách vở
    shelf_top_y = desk_h - top_thick - 0.12
    shelf_w = desk_w - 0.1
    shelf_d = desk_d - 0.06
    add_box(
        "Desk_Shelf_Bottom",
        (shelf_w, shelf_d, 0.012),
        (0, 0.01, shelf_top_y),
        wood_mat,
        bevel=0.003
    )
    # Tấm chắn sau ngăn bàn
    add_box(
        "Desk_Shelf_BackWall",
        (shelf_w, 0.01, 0.1),
        (0, -desk_d / 2 + 0.035, shelf_top_y + 0.05),
        wood_mat,
        bevel=0.002
    )

    # 3.4 Khung chân bàn kim loại
    leg_x_offsets = [-desk_w / 2 + 0.08, desk_w / 2 - 0.08]
    leg_bottom_z = foot_h
    leg_top_z = desk_h - top_thick
    leg_height = leg_top_z - leg_bottom_z

    for i, lx in enumerate(leg_x_offsets):
        side_tag = "L" if i == 0 else "R"
        for j, y_dir in enumerate([-1, 1]):
            ly = y_dir * (desk_d / 2 - 0.05)
            # Cột chân đứng
            add_cylinder(
                f"Desk_Leg_{side_tag}_{j+1}",
                pipe_r,
                leg_height,
                (lx, ly, leg_bottom_z + leg_height / 2),
                (0, 0, 0),
                frame_mat
            )
            # Đệm bọc chân cao su
            add_cylinder(
                f"Desk_RubberFoot_{side_tag}_{j+1}",
                pipe_r * 1.3,
                foot_h,
                (lx, ly, foot_h / 2),
                (0, 0, 0),
                feet_mat
            )

        # Thanh dầm đáy nối 2 chân
        add_box(
            f"Desk_LegBase_{side_tag}",
            (pipe_r * 2.2, desk_d - 0.06, pipe_r * 2),
            (lx, 0, foot_h + pipe_r),
            frame_mat,
            bevel=0.002
        )
        # Thanh đỡ mặt bàn trên
        add_box(
            f"Desk_TopSupport_{side_tag}",
            (pipe_r * 2.2, desk_d - 0.06, pipe_r * 2),
            (lx, 0, leg_top_z - pipe_r),
            frame_mat,
            bevel=0.002
        )

        # Móc treo cặp sách bên hông
        side_mul = -1 if i == 0 else 1
        hook_x = lx + side_mul * 0.025
        hook_y = -desk_d / 2 + 0.12
        hook_z = desk_h - 0.14
        add_cylinder(
            f"Desk_BagHook_{side_tag}_Stem",
            0.004,
            0.045,
            (hook_x, hook_y, hook_z),
            (0, math.radians(90), 0),
            hook_mat
        )
        add_cylinder(
            f"Desk_BagHook_{side_tag}_Tip",
            0.004,
            0.025,
            (lx + side_mul * 0.047, hook_y, hook_z + 0.012),
            (0, 0, 0),
            hook_mat
        )

    # 3.5 Thanh giằng để chân (Footrest bar)
    add_box(
        "Desk_Footrest_Bar",
        (desk_w - 0.16, pipe_r * 2, pipe_r * 2),
        (0, -0.02, 0.12),
        frame_mat,
        bevel=0.002
    )

    # ==============================
    # 4. DỰNG GHẾ HỌC SINH (CHAIRS)
    # ==============================
    chair_w = 0.38
    chair_d = 0.36
    chair_h = 0.40
    back_h = 0.76
    chair_dist = 0.16
    chair_center_y = desk_d / 2 + chair_dist + chair_d / 2

    for idx, cx in enumerate([-desk_w * 0.25, desk_w * 0.25]):
        # Mặt ngồi của ghế
        add_box(
            f"Chair_{idx+1}_Seat",
            (chair_w, chair_d, 0.015),
            (cx, chair_center_y, chair_h - 0.0075),
            wood_mat,
            bevel=0.005
        )

        # Tựa lưng ghế (nghiêng nhẹ 8 độ)
        backrest_y = chair_center_y + chair_d / 2 - 0.02
        back_obj = add_box(
            f"Chair_{idx+1}_Backrest",
            (chair_w * 0.95, 0.015, 0.15),
            (cx, backrest_y, back_h - 0.075),
            wood_mat,
            bevel=0.005
        )
        back_obj.rotation_euler = (math.radians(-8), 0, 0)

        # 2 Cột đỡ tựa lưng ghế
        for bpx in [-chair_w * 0.35, chair_w * 0.35]:
            post_len = back_h - chair_h
            post = add_cylinder(
                f"Chair_{idx+1}_BackPost",
                pipe_r * 0.8,
                post_len,
                (cx + bpx, backrest_y - 0.01, chair_h + post_len / 2 - 0.02),
                (math.radians(-8), 0, 0),
                frame_mat
            )

        # 4 Chân ghế
        chair_leg_h = chair_h - 0.015 - foot_h
        for clx in [-chair_w / 2 + 0.04, chair_w / 2 - 0.04]:
            for cly in [chair_center_y - chair_d / 2 + 0.04, chair_center_y + chair_d / 2 - 0.04]:
                add_cylinder(
                    f"Chair_{idx+1}_Leg",
                    pipe_r * 0.9,
                    chair_leg_h,
                    (cx + clx, cly, foot_h + chair_leg_h / 2),
                    (0, 0, 0),
                    frame_mat
                )
                add_cylinder(
                    f"Chair_{idx+1}_Foot",
                    pipe_r * 1.2,
                    foot_h,
                    (cx + clx, cly, foot_h / 2),
                    (0, 0, 0),
                    feet_mat
                )

        # Khung giằng chân ghế
        add_box(
            f"Chair_{idx+1}_Brace",
            (chair_w - 0.08, chair_d - 0.08, pipe_r * 1.8),
            (cx, chair_center_y, 0.1),
            frame_mat,
            bevel=0.002
        )

    print(">> Đã dựng xong Bộ bàn ghế học sinh THCS trong Blender!")

build_vietnamese_school_desk()
