"""
=============================================================================
CLOTHING LIBRARY V2 — PROCEDURAL MODULAR GARMENT PIPELINE
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life 3D Narrative Game

Provides procedural generators and rig skinning for:
- 8 BOTTOMS (BOTTOM_001 to BOTTOM_008)
- 8 TOPS (TOP_001 to TOP_008)
- 4 FOOTWEAR (FOOTWEAR_001 to FOOTWEAR_004)
- 4 SOCKS (SOCKS_001 to SOCKS_004)
- Adaptive Body Limbs (Hidden geometry management & skin preservation)
- Modular Clothing Assembly & Validation
=============================================================================
"""

import bpy
import bmesh
import math
import mathutils

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    if len(h) == 3:
        h = "".join([c*2 for c in h])
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def create_or_get_mat(name, hex_color, roughness=0.60, metallic=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = False
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_lin(hex_color)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat

def apply_smooth(obj):
    if obj and obj.type == "MESH":
        for p in obj.data.polygons:
            p.use_smooth = True

def link_to_scene(obj):
    if obj and obj.name not in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.link(obj)
    return obj

def add_ring(bm, z, rx, ry, cx=0.0, cy=0.0, segs=16, rot_z=0.0):
    verts = []
    for i in range(segs):
        ang = 2.0 * math.pi * i / segs + rot_z
        x = cx + rx * math.cos(ang)
        y = cy + ry * math.sin(ang)
        verts.append(bm.verts.new((x, y, z)))
    bm.verts.ensure_lookup_table()
    return verts

def bridge_rings(bm, r1, r2, mat_idx=0, smooth=True):
    n = len(r1)
    faces = []
    for i in range(n):
        v1 = r1[i]
        v2 = r1[(i + 1) % n]
        v3 = r2[(i + 1) % n]
        v4 = r2[i]
        f = bm.faces.new((v1, v2, v3, v4))
        f.material_index = mat_idx
        f.smooth = smooth
        faces.append(f)
    bm.faces.ensure_lookup_table()
    return faces

def cap_ring(bm, ring, apex_coord, mat_idx=0, smooth=True, reverse=False):
    apex = bm.verts.new(apex_coord)
    n = len(ring)
    for i in range(n):
        v1 = ring[i]
        v2 = ring[(i + 1) % n]
        f = bm.faces.new((apex, v2, v1) if reverse else (apex, v1, v2))
        f.material_index = mat_idx
        f.smooth = smooth
    bm.faces.ensure_lookup_table()

def assign_weights_by_z_and_x(obj, weights_table):
    """
    Assigns vertex weights based on criteria:
    weights_table is a list of tuples: (group_name, filter_func, weight_func_or_const)
    """
    for grp_name, filter_fn, weight_val in weights_table:
        vg = obj.vertex_groups.get(grp_name) or obj.vertex_groups.new(name=grp_name)
        for v in obj.data.vertices:
            if filter_fn(v.co):
                w = weight_val(v.co) if callable(weight_val) else weight_val
                if w > 0.001:
                    vg.add([v.index], w, 'REPLACE')

# =============================================================================
# 1. BOTTOMS BUILDERS (8 CANONICAL VARIANTS)
# =============================================================================

def build_bottom_001_trousers(arm, char_id, color="#1c2841"):
    """BOTTOM_001: Long School Trousers (Quần tây học sinh THCS)"""
    bm = bmesh.new()
    mat = create_or_get_mat(f"M_Bottom_{char_id}", color, roughness=0.65)
    segs = 18

    # Waist & Pelvis
    r_waist = add_ring(bm, 0.252, 0.103, 0.077, 0, -0.002, segs)
    r_belt  = add_ring(bm, 0.230, 0.104, 0.078, 0, -0.002, segs)
    r_hips  = add_ring(bm, 0.185, 0.108, 0.082, 0, -0.002, segs)
    r_crotch= add_ring(bm, 0.160, 0.102, 0.076, 0, -0.002, segs)

    bridge_rings(bm, r_waist, r_belt, 0)
    bridge_rings(bm, r_belt, r_hips, 0)
    bridge_rings(bm, r_hips, r_crotch, 0)

    # Legs (Left & Right)
    lsegs = 14
    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055
        r_thigh_top = add_ring(bm, 0.160, 0.044, 0.044, cx, 0, lsegs)
        r_thigh_mid = add_ring(bm, 0.135, 0.042, 0.042, cx, 0, lsegs)
        r_knee_1    = add_ring(bm, 0.125, 0.041, 0.041, cx, 0.002, lsegs)
        r_knee_2    = add_ring(bm, 0.115, 0.040, 0.040, cx, 0.004, lsegs)
        r_knee_3    = add_ring(bm, 0.105, 0.040, 0.040, cx, 0.002, lsegs)
        r_shin_mid  = add_ring(bm, 0.070, 0.041, 0.041, cx, 0.002, lsegs)
        r_ankle     = add_ring(bm, 0.045, 0.042, 0.043, cx, 0.002, lsegs)
        r_cuff      = add_ring(bm, 0.033, 0.043, 0.044, cx, 0.003, lsegs)
        r_cuff_in   = add_ring(bm, 0.037, 0.039, 0.040, cx, 0.003, lsegs)

        bridge_rings(bm, r_thigh_top, r_thigh_mid, 0)
        bridge_rings(bm, r_thigh_mid, r_knee_1, 0)
        bridge_rings(bm, r_knee_1, r_knee_2, 0)
        bridge_rings(bm, r_knee_2, r_knee_3, 0)
        bridge_rings(bm, r_knee_3, r_shin_mid, 0)
        bridge_rings(bm, r_shin_mid, r_ankle, 0)
        bridge_rings(bm, r_ankle, r_cuff, 0)
        bridge_rings(bm, r_cuff, r_cuff_in, 0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Bottom_Trousers_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Bottom_Mesh", mesh)
    obj.data.materials.append(mat)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            ("Hips", lambda co: co.z >= 0.160, lambda co: 1.0 if co.z >= 0.20 else (co.z - 0.160)/0.04),
            ("Spine", lambda co: co.z >= 0.235, 0.35),
            (f"Thigh.{sign}", lambda co: (co.x * side > 0) and (0.090 <= co.z <= 0.180), lambda co: 1.0 if co.z >= 0.125 else (co.z - 0.090)/0.035),
            (f"Shin.{sign}", lambda co: (co.x * side > 0) and (co.z <= 0.125), lambda co: 1.0 if co.z <= 0.105 else (0.125 - co.z)/0.020)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_bottom_002_shorts(arm, char_id, color="#1c2841", is_khaki=False, is_denim=False):
    """BOTTOM_002 / BOTTOM_003 / BOTTOM_006: Shorts variants ending visibly above the knee"""
    bm = bmesh.new()
    rough = 0.70 if is_khaki else (0.60 if is_denim else 0.65)
    mat = create_or_get_mat(f"M_Bottom_{char_id}", color, roughness=rough)
    segs = 18

    # Waist & Pelvis
    r_waist = add_ring(bm, 0.252, 0.103, 0.077, 0, -0.002, segs)
    r_belt  = add_ring(bm, 0.230, 0.104, 0.078, 0, -0.002, segs)
    r_hips  = add_ring(bm, 0.185, 0.108, 0.082, 0, -0.002, segs)
    r_crotch= add_ring(bm, 0.160, 0.102, 0.076, 0, -0.002, segs)

    bridge_rings(bm, r_waist, r_belt, 0)
    bridge_rings(bm, r_belt, r_hips, 0)
    bridge_rings(bm, r_hips, r_crotch, 0)

    # Short legs terminating at Z = 0.145 (clearly above knee Z = 0.115)
    lsegs = 14
    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055
        r_thigh_top = add_ring(bm, 0.160, 0.044, 0.044, cx, 0, lsegs)
        r_thigh_mid = add_ring(bm, 0.150, 0.0445, 0.0445, cx, 0, lsegs)
        r_cuff      = add_ring(bm, 0.145, 0.0450, 0.0450, cx, 0, lsegs)
        r_cuff_in   = add_ring(bm, 0.148, 0.0410, 0.0410, cx, 0, lsegs)

        bridge_rings(bm, r_thigh_top, r_thigh_mid, 0)
        bridge_rings(bm, r_thigh_mid, r_cuff, 0)
        bridge_rings(bm, r_cuff, r_cuff_in, 0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Bottom_Shorts_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Bottom_Mesh", mesh)
    obj.data.materials.append(mat)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            ("Hips", lambda co: co.z >= 0.160, lambda co: 1.0 if co.z >= 0.20 else (co.z - 0.160)/0.04),
            ("Spine", lambda co: co.z >= 0.235, 0.35),
            (f"Thigh.{sign}", lambda co: (co.x * side > 0) and (co.z <= 0.180), 1.0)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_bottom_003_khaki_shorts(arm, char_id, color="#9c876b"):
    """BOTTOM_003: Casual Khaki Shorts (Quần short kaki nâu ấm)"""
    return build_bottom_002_shorts(arm, char_id, color=color, is_khaki=True)

def build_bottom_004_pleated_skirt(arm, char_id, color="#1e2b48", is_pinafore=False):
    """BOTTOM_004: Pleated School Skirt with distinct pleat silhouette and dual thigh skinning"""
    bm = bmesh.new()
    mat = create_or_get_mat(f"M_Bottom_{char_id}", color, roughness=0.65)
    segs = 18

    # Waistband
    r_waist = add_ring(bm, 0.252, 0.103, 0.077, 0, -0.002, segs)
    r_band  = add_ring(bm, 0.235, 0.105, 0.079, 0, -0.002, segs)
    bridge_rings(bm, r_waist, r_band, 0)

    # 16-facet pleated skirt flared outwards
    num_pleats = 16
    pleat_segs = num_pleats * 2 # Inner fold and outer fold

    def add_pleated_ring(z_pos, r_base_x, r_base_y, pleat_depth):
        verts = []
        for i in range(pleat_segs):
            ang = 2.0 * math.pi * i / pleat_segs
            delta = pleat_depth if (i % 2 == 1) else -pleat_depth * 0.4
            rx = r_base_x + delta
            ry = r_base_y + delta * 0.85
            verts.append(bm.verts.new((rx * math.cos(ang), ry * math.sin(ang) - 0.002, z_pos)))
        bm.verts.ensure_lookup_table()
        return verts

    r_p_top = add_pleated_ring(0.235, 0.105, 0.079, 0.003)
    r_p_mid = add_pleated_ring(0.185, 0.125, 0.098, 0.007)
    r_p_bot = add_pleated_ring(0.145, 0.145, 0.118, 0.010) # Ends comfortably above knee level (Z=0.145)
    r_p_in  = add_pleated_ring(0.148, 0.140, 0.113, 0.006) # Hem thickness

    bridge_rings(bm, r_p_top, r_p_mid, 0)
    bridge_rings(bm, r_p_mid, r_p_bot, 0)
    bridge_rings(bm, r_p_bot, r_p_in, 0)

    # Pinafore suspender bib and straps if requested (BOTTOM_008)
    if is_pinafore:
        b_w = 0.065
        v_b1 = bm.verts.new((-b_w, 0.088, 0.252))
        v_b2 = bm.verts.new(( b_w, 0.088, 0.252))
        v_b3 = bm.verts.new(( b_w, 0.092, 0.355))
        v_b4 = bm.verts.new((-b_w, 0.092, 0.355))
        f_bib = bm.faces.new((v_b1, v_b2, v_b3, v_b4))
        f_bib.material_index = 0
        f_bib.smooth = True

        for side in [-1, 1]:
            x_pos = side * 0.052
            v_s1 = bm.verts.new((x_pos - 0.012 * side, 0.092, 0.355))
            v_s2 = bm.verts.new((x_pos + 0.012 * side, 0.092, 0.355))
            v_s3 = bm.verts.new((x_pos + 0.012 * side, 0.050, 0.405))
            v_s4 = bm.verts.new((x_pos - 0.012 * side, 0.050, 0.405))
            f_s1 = bm.faces.new((v_s1, v_s2, v_s3, v_s4))
            f_s1.material_index = 0

            v_sb1 = bm.verts.new((x_pos + 0.012 * side, -0.078, 0.252))
            v_sb2 = bm.verts.new((x_pos - 0.012 * side, -0.078, 0.252))
            f_s2 = bm.faces.new((v_s4, v_s3, v_sb1, v_sb2))
            f_s2.material_index = 0

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Bottom_Skirt_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Bottom_Mesh", mesh)
    obj.data.materials.append(mat)
    apply_smooth(obj)
    link_to_scene(obj)

    # Weights: Dual Thigh blending prevents rigidity when sitting
    assign_weights_by_z_and_x(obj, [
        ("Hips", lambda co: co.z >= 0.160, lambda co: 1.0 if co.z >= 0.220 else (co.z - 0.160)/0.06),
        ("Spine", lambda co: co.z >= 0.240, 0.35),
        ("Chest", lambda co: co.z >= 0.310, 0.9 if is_pinafore else 0.0),
        ("Thigh.L", lambda co: co.z < 0.220, lambda co: 0.50 if co.x <= 0 else 0.20),
        ("Thigh.R", lambda co: co.z < 0.220, lambda co: 0.50 if co.x > 0 else 0.20)
    ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_bottom_005_aline_skirt(arm, char_id, color="#8faec5"):
    """BOTTOM_005: Casual A-Line Skirt (Chân váy chữ A mềm mại)"""
    bm = bmesh.new()
    mat = create_or_get_mat(f"M_Bottom_{char_id}", color, roughness=0.60)
    segs = 20

    # Smooth flared rings
    r_waist = add_ring(bm, 0.252, 0.103, 0.077, 0, -0.002, segs)
    r_band  = add_ring(bm, 0.235, 0.106, 0.080, 0, -0.002, segs)
    r_mid   = add_ring(bm, 0.185, 0.124, 0.098, 0, -0.002, segs)
    r_bot   = add_ring(bm, 0.145, 0.142, 0.116, 0, -0.002, segs) # Ends above knee (Z=0.145)
    r_in    = add_ring(bm, 0.148, 0.138, 0.112, 0, -0.002, segs) # Hem thickness

    bridge_rings(bm, r_waist, r_band, 0)
    bridge_rings(bm, r_band, r_mid, 0)
    bridge_rings(bm, r_mid, r_bot, 0)
    bridge_rings(bm, r_bot, r_in, 0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Bottom_ALine_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Bottom_Mesh", mesh)
    obj.data.materials.append(mat)
    apply_smooth(obj)
    link_to_scene(obj)

    assign_weights_by_z_and_x(obj, [
        ("Hips", lambda co: co.z >= 0.160, lambda co: 1.0 if co.z >= 0.220 else (co.z - 0.160)/0.06),
        ("Spine", lambda co: co.z >= 0.240, 0.35),
        ("Thigh.L", lambda co: co.z < 0.220, lambda co: 0.50 if co.x <= 0 else 0.20),
        ("Thigh.R", lambda co: co.z < 0.220, lambda co: 0.50 if co.x > 0 else 0.20)
    ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_bottom_006_denim_shorts(arm, char_id, color="#2b476e"):
    """BOTTOM_006: Denim Shorts (Quần soóc jean xanh năng động)"""
    return build_bottom_002_shorts(arm, char_id, color=color, is_denim=True)

def build_bottom_007_pe_pants(arm, char_id, color="#14253d"):
    """BOTTOM_007: PE Sports Pants with White Side Athletic Stripes"""
    bm = bmesh.new()
    mat_pants = create_or_get_mat(f"M_Bottom_{char_id}", color, roughness=0.65)
    mat_stripe = create_or_get_mat(f"M_Bottom_Stripe_{char_id}", "#f2f5f8", roughness=0.45)
    segs = 18

    # Waist & Pelvis
    r_waist = add_ring(bm, 0.252, 0.103, 0.077, 0, -0.002, segs)
    r_belt  = add_ring(bm, 0.230, 0.104, 0.078, 0, -0.002, segs)
    r_hips  = add_ring(bm, 0.185, 0.108, 0.082, 0, -0.002, segs)
    r_crotch= add_ring(bm, 0.160, 0.102, 0.076, 0, -0.002, segs)

    bridge_rings(bm, r_waist, r_belt, 0)
    bridge_rings(bm, r_belt, r_hips, 0)
    bridge_rings(bm, r_hips, r_crotch, 0)

    # Legs
    lsegs = 14
    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055
        r_thigh_top = add_ring(bm, 0.160, 0.044, 0.044, cx, 0, lsegs)
        r_thigh_mid = add_ring(bm, 0.135, 0.042, 0.042, cx, 0, lsegs)
        r_knee_1    = add_ring(bm, 0.125, 0.041, 0.041, cx, 0.002, lsegs)
        r_knee_2    = add_ring(bm, 0.115, 0.040, 0.040, cx, 0.004, lsegs)
        r_knee_3    = add_ring(bm, 0.105, 0.040, 0.040, cx, 0.002, lsegs)
        r_shin_mid  = add_ring(bm, 0.070, 0.041, 0.041, cx, 0.002, lsegs)
        r_ankle     = add_ring(bm, 0.045, 0.042, 0.043, cx, 0.002, lsegs)
        r_cuff      = add_ring(bm, 0.033, 0.043, 0.044, cx, 0.003, lsegs)
        r_cuff_in   = add_ring(bm, 0.037, 0.039, 0.040, cx, 0.003, lsegs)

        bridge_rings(bm, r_thigh_top, r_thigh_mid, 0)
        bridge_rings(bm, r_thigh_mid, r_knee_1, 0)
        bridge_rings(bm, r_knee_1, r_knee_2, 0)
        bridge_rings(bm, r_knee_2, r_knee_3, 0)
        bridge_rings(bm, r_knee_3, r_shin_mid, 0)
        bridge_rings(bm, r_shin_mid, r_ankle, 0)
        bridge_rings(bm, r_ankle, r_cuff, 0)
        bridge_rings(bm, r_cuff, r_cuff_in, 0)

        # Athletic side stripe ribbon on outer thigh & shin
        stripe_w = 0.008
        x_outer = side * 0.098
        v_st1 = bm.verts.new((x_outer, -stripe_w, 0.230))
        v_st2 = bm.verts.new((x_outer,  stripe_w, 0.230))
        v_st3 = bm.verts.new((x_outer,  stripe_w, 0.035))
        v_st4 = bm.verts.new((x_outer, -stripe_w, 0.035))
        f_st = bm.faces.new((v_st1, v_st2, v_st3, v_st4) if side == 1 else (v_st1, v_st4, v_st3, v_st2))
        f_st.material_index = 1
        f_st.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Bottom_PEPants_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Bottom_Mesh", mesh)
    obj.data.materials.append(mat_pants)
    obj.data.materials.append(mat_stripe)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            ("Hips", lambda co: co.z >= 0.160, lambda co: 1.0 if co.z >= 0.20 else (co.z - 0.160)/0.04),
            ("Spine", lambda co: co.z >= 0.235, 0.35),
            (f"Thigh.{sign}", lambda co: (co.x * side > 0) and (0.090 <= co.z <= 0.180), lambda co: 1.0 if co.z >= 0.125 else (co.z - 0.090)/0.035),
            (f"Shin.{sign}", lambda co: (co.x * side > 0) and (co.z <= 0.125), lambda co: 1.0 if co.z <= 0.105 else (0.125 - co.z)/0.020)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_bottom_008_pinafore(arm, char_id, color="#212a3e"):
    """BOTTOM_008: Pinafore Skirt (Váy yếm học sinh kèm quai đeo vai)"""
    return build_bottom_004_pleated_skirt(arm, char_id, color=color, is_pinafore=True)

def build_bottom_complete(bottom_id, arm, char_id, color=None):
    """Dispatcher for all 8 bottoms"""
    if bottom_id == "BOTTOM_001":
        return [build_bottom_001_trousers(arm, char_id, color=color or "#1c2841")]
    elif bottom_id == "BOTTOM_002":
        return [build_bottom_002_shorts(arm, char_id, color=color or "#1c2841")]
    elif bottom_id == "BOTTOM_003":
        return [build_bottom_003_khaki_shorts(arm, char_id, color=color or "#9c876b")]
    elif bottom_id == "BOTTOM_004":
        return [build_bottom_004_pleated_skirt(arm, char_id, color=color or "#1e2b48")]
    elif bottom_id == "BOTTOM_005":
        return [build_bottom_005_aline_skirt(arm, char_id, color=color or "#8faec5")]
    elif bottom_id == "BOTTOM_006":
        return [build_bottom_006_denim_shorts(arm, char_id, color=color or "#2b476e")]
    elif bottom_id == "BOTTOM_007":
        return [build_bottom_007_pe_pants(arm, char_id, color=color or "#14253d")]
    elif bottom_id == "BOTTOM_008":
        return [build_bottom_008_pinafore(arm, char_id, color=color or "#212a3e")]
    else:
        return [build_bottom_001_trousers(arm, char_id)]

# =============================================================================
# 2. TOPS BUILDERS (8 CANONICAL VARIANTS)
# =============================================================================

def build_top_base_torso(char_id, color="#f7f5ef", is_jacket=False, is_cardigan=False):
    """Creates the shirt/top torso body with continuous shoulder panel"""
    bm = bmesh.new()
    mat = create_or_get_mat(f"M_Top_{char_id}", color, roughness=0.55 if not is_jacket else 0.48)
    segs = 18

    clearance = 0.003 if (is_jacket or is_cardigan) else 0.001
    r_neck      = add_ring(bm, 0.405, 0.070 + clearance, 0.064 + clearance, 0,  0.005, segs)
    # Continuous shoulder panel sloping gently from neck to chest
    r_shoulder  = add_ring(bm, 0.388, 0.106 + clearance, 0.082 + clearance, 0,  0.004, segs)
    r_chest_top = add_ring(bm, 0.375, 0.122 + clearance, 0.090 + clearance, 0,  0.003, segs)
    r_chest_mid = add_ring(bm, 0.340, 0.120 + clearance, 0.087 + clearance, 0,  0.000, segs)
    r_ribs      = add_ring(bm, 0.290, 0.110 + clearance, 0.080 + clearance, 0, -0.002, segs)
    
    hem_z = 0.235 if (is_jacket or is_cardigan) else 0.252
    r_waist     = add_ring(bm, hem_z, 0.103 + clearance, 0.076 + clearance, 0, -0.002, segs)

    bridge_rings(bm, r_neck, r_shoulder, 0)
    bridge_rings(bm, r_shoulder, r_chest_top, 0)
    bridge_rings(bm, r_chest_top, r_chest_mid, 0)
    bridge_rings(bm, r_chest_mid, r_ribs, 0)
    bridge_rings(bm, r_ribs, r_waist, 0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Top_Torso_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Top_Torso_Mesh", mesh)
    obj.data.materials.append(mat)
    apply_smooth(obj)
    link_to_scene(obj)
    return obj

def build_top_sleeves(char_id, arm, color="#f7f5ef", is_long=False, is_jacket=False):
    """Builds left and right sleeves with complete rounded sleeve caps covering the shoulder"""
    sleeve_objs = []
    mat = create_or_get_mat(f"M_Top_{char_id}", color, roughness=0.55 if not is_jacket else 0.48)
    segs = 14

    for side, sign in [(-1, "L"), (1, "R")]:
        bm = bmesh.new()
        cx = side * 0.118
        cy = 0.005

        # Rounded sleeve cap arching over upper shoulder dome (Z = 0.383 down to 0.355)
        r_cap_top   = add_ring(bm, 0.380, 0.034, 0.038, cx - side * 0.008, cy, segs)
        cap_ring(bm, r_cap_top, (cx - side * 0.012, cy, 0.383), 0, smooth=True)

        r_cap_mid   = add_ring(bm, 0.370, 0.045, 0.046, cx - side * 0.003, cy, segs)
        r_shoulder  = add_ring(bm, 0.355, 0.048, 0.048, cx, cy, segs)
        r_mid       = add_ring(bm, 0.332, 0.046, 0.046, cx + side * 0.003, cy + 0.002, segs)

        bridge_rings(bm, r_cap_top, r_cap_mid, 0)
        bridge_rings(bm, r_cap_mid, r_shoulder, 0)
        bridge_rings(bm, r_shoulder, r_mid, 0)

        if not is_long:
            r_cuff = add_ring(bm, 0.308, 0.044, 0.044, cx + side * 0.006, cy + 0.004, segs)
            r_cuff_in = add_ring(bm, 0.312, 0.038, 0.038, cx + side * 0.006, cy + 0.004, segs)
            bridge_rings(bm, r_mid, r_cuff, 0)
            bridge_rings(bm, r_cuff, r_cuff_in, 0)
        else:
            r_elbow_1 = add_ring(bm, 0.293, 0.036, 0.036, cx + side * 0.008, cy + 0.005, segs)
            r_elbow_2 = add_ring(bm, 0.280, 0.035, 0.035, cx + side * 0.010, cy + 0.006, segs)
            r_forearm = add_ring(bm, 0.245, 0.034, 0.034, cx + side * 0.013, cy + 0.008, segs)
            r_wrist   = add_ring(bm, 0.210, 0.033, 0.033, cx + side * 0.016, cy + 0.011, segs)
            r_wrist_in= add_ring(bm, 0.214, 0.029, 0.029, cx + side * 0.016, cy + 0.011, segs)

            bridge_rings(bm, r_mid, r_elbow_1, 0)
            bridge_rings(bm, r_elbow_1, r_elbow_2, 0)
            bridge_rings(bm, r_elbow_2, r_forearm, 0)
            bridge_rings(bm, r_forearm, r_wrist, 0)
            bridge_rings(bm, r_wrist, r_wrist_in, 0)

        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

        mesh = bpy.data.meshes.new(f"Top_Sleeve_Mesh_{sign}_{char_id}")
        bm.to_mesh(mesh)
        bm.free()

        s_obj = bpy.data.objects.new(f"Top_Sleeve_{sign}", mesh)
        s_obj.data.materials.append(mat)
        apply_smooth(s_obj)
        link_to_scene(s_obj)

        assign_weights_by_z_and_x(s_obj, [
            ("Chest", lambda co: co.z >= 0.365, lambda co: min(0.40, (co.z - 0.365)/0.018 * 0.40)),
            (f"UpperArm.{sign}", lambda co: co.z >= 0.270, lambda co: 1.0 if co.z < 0.365 else max(0.60, 1.0 - (co.z - 0.365)/0.018 * 0.40)),
            (f"Forearm.{sign}", lambda co: co.z < 0.270, 1.0)
        ])

        m = s_obj.modifiers.new("Armature", 'ARMATURE')
        m.object = arm
        sleeve_objs.append(s_obj)

    return sleeve_objs

    return sleeve_objs

def build_top_collar(char_id, arm, style="standard", color="#f7f5ef"):
    """Creates distinct collars using pure bmesh"""
    mat = create_or_get_mat(f"M_Top_Collar_{char_id}", color, roughness=0.55)
    
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)

    if style == "standard":
        scale = (0.132, 0.082, 0.024)
        loc = (0.0, 0.038, 0.388)
        rot_x = math.radians(-12)
    elif style == "polo":
        scale = (0.128, 0.078, 0.022)
        loc = (0.0, 0.036, 0.386)
        rot_x = math.radians(-14)
    elif style == "peter_pan":
        scale = (0.136, 0.086, 0.020)
        loc = (0.0, 0.038, 0.386)
        rot_x = math.radians(-10)
    elif style == "standing_jacket":
        scale = (0.095, 0.082, 0.036)
        loc = (0.0, 0.010, 0.410)
        rot_x = 0.0
    elif style == "tshirt":
        scale = (0.088, 0.078, 0.014)
        loc = (0.0, 0.008, 0.396)
        rot_x = 0.0
    else:
        scale = (0.128, 0.080, 0.022)
        loc = (0.0, 0.036, 0.386)
        rot_x = 0.0

    T = mathutils.Matrix.Translation(loc)
    R = mathutils.Matrix.Rotation(rot_x, 4, 'X')
    S = mathutils.Matrix.Diagonal((*scale, 1.0))
    M = T @ R @ S
    bmesh.ops.transform(bm, matrix=M, verts=bm.verts)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Top_Collar_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    collar = bpy.data.objects.new("Top_Collar", mesh)
    sub = collar.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    collar.data.materials.append(mat)
    apply_smooth(collar)
    link_to_scene(collar)

    vg_c = collar.vertex_groups.new(name="Chest")
    vg_c.add(list(range(len(collar.data.vertices))), 1.0, 'REPLACE')
    m = collar.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return collar

def build_top_complete(top_id, arm, char_id, color=None):
    """Assembles one of the 8 canonical tops"""
    created_objects = []

    if top_id == "TOP_001":
        torso = build_top_base_torso(char_id, color=color or "#f7f5ef")
        sleeves = build_top_sleeves(char_id, arm, color=color or "#f7f5ef", is_long=False)
        collar = build_top_collar(char_id, arm, style="standard", color=color or "#f7f5ef")
        created_objects.extend([torso] + sleeves + [collar])

    elif top_id == "TOP_002":
        torso = build_top_base_torso(char_id, color=color or "#1e528e")
        sleeves = build_top_sleeves(char_id, arm, color=color or "#1e528e", is_long=False)
        collar = build_top_collar(char_id, arm, style="polo", color="#f2f5f8")
        created_objects.extend([torso] + sleeves + [collar])

    elif top_id == "TOP_003":
        torso = build_top_base_torso(char_id, color=color or "#e0564c")
        sleeves = build_top_sleeves(char_id, arm, color=color or "#e0564c", is_long=False)
        collar = build_top_collar(char_id, arm, style="tshirt", color=color or "#d2443a")
        created_objects.extend([torso] + sleeves + [collar])

    elif top_id == "TOP_004":
        torso = build_top_base_torso(char_id, color=color or "#2d5a43")
        sleeves = build_top_sleeves(char_id, arm, color=color or "#2d5a43", is_long=False)
        collar = build_top_collar(char_id, arm, style="polo", color=color or "#244835")
        created_objects.extend([torso] + sleeves + [collar])

    elif top_id == "TOP_005":
        torso = build_top_base_torso(char_id, color=color or "#fbf7ee")
        sleeves = build_top_sleeves(char_id, arm, color=color or "#fbf7ee", is_long=False)
        collar = build_top_collar(char_id, arm, style="peter_pan", color="#f3ece0")
        created_objects.extend([torso] + sleeves + [collar])

    elif top_id == "TOP_006":
        torso = build_top_base_torso(char_id, color=color or "#bfae99", is_cardigan=True)
        sleeves = build_top_sleeves(char_id, arm, color=color or "#bfae99", is_long=True)
        created_objects.extend([torso] + sleeves)

    elif top_id == "TOP_007":
        torso = build_top_base_torso(char_id, color=color or "#8c8f94")
        sleeves = build_top_sleeves(char_id, arm, color="#23324d", is_long=True)
        collar = build_top_collar(char_id, arm, style="tshirt", color="#23324d")
        created_objects.extend([torso] + sleeves + [collar])

    elif top_id == "TOP_008":
        torso = build_top_base_torso(char_id, color=color or "#192740", is_jacket=True)
        sleeves = build_top_sleeves(char_id, arm, color=color or "#192740", is_long=True, is_jacket=True)
        collar = build_top_collar(char_id, arm, style="standing_jacket", color="#4a8ec2")
        created_objects.extend([torso] + sleeves + [collar])

    if torso:
        assign_weights_by_z_and_x(torso, [
            ("Chest", lambda co: co.z >= 0.320, 0.85),
            ("Spine", lambda co: co.z < 0.320, 0.85),
            ("Hips", lambda co: co.z <= 0.255, 0.30)
        ])
        m_t = torso.modifiers.new("Armature", 'ARMATURE')
        m_t.object = arm

    return created_objects

# =============================================================================
# 3. FOOTWEAR BUILDERS (4 CANONICAL VARIANTS)
# =============================================================================

def build_footwear_001_sneakers(arm, char_id, color="#f5f3ec"):
    """FOOTWEAR_001: Bata Canvas Sneakers with Rubber Sole and Concealed Ankle Shaft"""
    bm = bmesh.new()
    mat_shoe = create_or_get_mat(f"M_Shoe_{char_id}", color, roughness=0.55)
    mat_sole = create_or_get_mat(f"M_Sole_{char_id}", "#b8aca0", roughness=0.70)
    lsegs = 14

    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055

        # Concealed upper shaft inside trousers (Z = 0.034 to 0.054)
        # Sits snugly around ankle bone (rx=0.035, ry=0.035, cy=0.002) with 16mm overlap
        r_shaft_top = add_ring(bm, 0.054, 0.035, 0.035, cx, 0.002, lsegs)
        r_shaft_mid = add_ring(bm, 0.044, 0.036, 0.036, cx, 0.003, lsegs)
        r_collar    = add_ring(bm, 0.034, 0.038, 0.040, cx, 0.005, lsegs)

        # Visible rounded lower sneaker body (preserved exact volume & shape)
        r_mid  = add_ring(bm, 0.022, 0.045, 0.060, cx, 0.018, lsegs)
        r_bot  = add_ring(bm, 0.012, 0.047, 0.062, cx, 0.018, lsegs)
        r_sole = add_ring(bm, 0.000, 0.048, 0.064, cx, 0.018, lsegs)

        bridge_rings(bm, r_shaft_top, r_shaft_mid, 0)
        bridge_rings(bm, r_shaft_mid, r_collar, 0)
        bridge_rings(bm, r_collar, r_mid, 0)
        bridge_rings(bm, r_mid, r_bot, 0)
        bridge_rings(bm, r_bot, r_sole, 1)
        cap_ring(bm, r_sole, (cx, 0.018, 0.000), 1, reverse=True)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Footwear_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Footwear_Mesh", mesh)
    obj.data.materials.append(mat_shoe)
    obj.data.materials.append(mat_sole)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            (f"Foot.{sign}", lambda co: (co.x * side > 0), 1.0),
            (f"Shin.{sign}", lambda co: (co.x * side > 0) and (co.z >= 0.034), 0.25)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_footwear_002_canvas(arm, char_id, color="#1e2024"):
    """FOOTWEAR_002: Black/Navy Canvas Low-Tops with White Toe Cap and Concealed Ankle Shaft"""
    bm = bmesh.new()
    mat_canvas = create_or_get_mat(f"M_Shoe_{char_id}", color, roughness=0.65)
    mat_toe    = create_or_get_mat(f"M_ToeCap_{char_id}", "#f5f3ec", roughness=0.40)
    mat_sole   = create_or_get_mat(f"M_Sole_{char_id}", "#f5f3ec", roughness=0.50)
    lsegs = 14

    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055

        # Concealed upper shaft inside trousers (Z = 0.034 to 0.054)
        r_shaft_top = add_ring(bm, 0.054, 0.035, 0.035, cx, 0.002, lsegs)
        r_shaft_mid = add_ring(bm, 0.044, 0.036, 0.036, cx, 0.003, lsegs)
        r_collar    = add_ring(bm, 0.034, 0.038, 0.040, cx, 0.005, lsegs)

        # Visible rounded lower shoe body
        r_mid  = add_ring(bm, 0.020, 0.044, 0.058, cx, 0.016, lsegs)
        r_bot  = add_ring(bm, 0.011, 0.046, 0.060, cx, 0.016, lsegs)
        r_sole = add_ring(bm, 0.000, 0.047, 0.062, cx, 0.016, lsegs)

        bridge_rings(bm, r_shaft_top, r_shaft_mid, 0)
        bridge_rings(bm, r_shaft_mid, r_collar, 0)
        bridge_rings(bm, r_collar, r_mid, 0)
        bridge_rings(bm, r_mid, r_bot, 1)
        bridge_rings(bm, r_bot, r_sole, 2)
        cap_ring(bm, r_sole, (cx, 0.016, 0.000), 2, reverse=True)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Footwear_Canvas_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Footwear_Mesh", mesh)
    obj.data.materials.append(mat_canvas)
    obj.data.materials.append(mat_toe)
    obj.data.materials.append(mat_sole)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            (f"Foot.{sign}", lambda co: (co.x * side > 0), 1.0)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_footwear_003_sandals(arm, char_id, color="#3a281e"):
    """FOOTWEAR_003: Simple School Sandals (Dép quai hậu học sinh)"""
    bm = bmesh.new()
    mat_strap = create_or_get_mat(f"M_Shoe_{char_id}", color, roughness=0.50)
    mat_sole  = create_or_get_mat(f"M_Sole_{char_id}", "#1a1a1c", roughness=0.75)
    lsegs = 14

    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055
        r_bed  = add_ring(bm, 0.010, 0.045, 0.062, cx, 0.016, lsegs)
        r_sole = add_ring(bm, 0.000, 0.046, 0.063, cx, 0.016, lsegs)
        bridge_rings(bm, r_bed, r_sole, 1)
        cap_ring(bm, r_sole, (cx, 0.016, 0.000), 1, reverse=True)

        y1, y2 = 0.036, 0.046
        v_l1 = bm.verts.new((cx - 0.042, y1, 0.010))
        v_l2 = bm.verts.new((cx - 0.042, y2, 0.010))
        v_m1 = bm.verts.new((cx,         y1, 0.034))
        v_m2 = bm.verts.new((cx,         y2, 0.034))
        v_r1 = bm.verts.new((cx + 0.042, y1, 0.010))
        v_r2 = bm.verts.new((cx + 0.042, y2, 0.010))

        f_sl = bm.faces.new((v_l1, v_l2, v_m2, v_m1) if side == 1 else (v_l1, v_m1, v_m2, v_l2))
        f_sr = bm.faces.new((v_m1, v_m2, v_r2, v_r1) if side == 1 else (v_m1, v_r1, v_r2, v_m2))
        f_sl.material_index = 0
        f_sr.material_index = 0

        v_h1 = bm.verts.new((cx - 0.040, -0.015, 0.012))
        v_h2 = bm.verts.new((cx - 0.038, -0.022, 0.012))
        v_hb1= bm.verts.new((cx,         -0.042, 0.032))
        v_hb2= bm.verts.new((cx,         -0.048, 0.032))
        v_h3 = bm.verts.new((cx + 0.040, -0.015, 0.012))
        v_h4 = bm.verts.new((cx + 0.038, -0.022, 0.012))

        f_ha = bm.faces.new((v_h1, v_h2, v_hb2, v_hb1) if side == 1 else (v_h1, v_hb1, v_hb2, v_h2))
        f_hb = bm.faces.new((v_hb1, v_hb2, v_h4, v_h3) if side == 1 else (v_hb1, v_h3, v_h4, v_hb2))
        f_ha.material_index = 0
        f_hb.material_index = 0

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Footwear_Sandals_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Footwear_Mesh", mesh)
    obj.data.materials.append(mat_strap)
    obj.data.materials.append(mat_sole)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            (f"Foot.{sign}", lambda co: (co.x * side > 0), 1.0)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_footwear_004_slipon(arm, char_id, color="#28303d"):
    """FOOTWEAR_004: Casual Slip-On Loafers (Giày lười)"""
    bm = bmesh.new()
    mat_shoe = create_or_get_mat(f"M_Shoe_{char_id}", color, roughness=0.60)
    mat_sole = create_or_get_mat(f"M_Sole_{char_id}", "#edebe6", roughness=0.55)
    lsegs = 14

    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055
        r_top  = add_ring(bm, 0.032, 0.040, 0.046, cx, 0.008, lsegs)
        r_mid  = add_ring(bm, 0.018, 0.044, 0.059, cx, 0.016, lsegs)
        r_sole = add_ring(bm, 0.000, 0.046, 0.062, cx, 0.016, lsegs)

        bridge_rings(bm, r_top, r_mid, 0)
        bridge_rings(bm, r_mid, r_sole, 1)
        cap_ring(bm, r_sole, (cx, 0.016, 0.000), 1, reverse=True)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Footwear_Slipon_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Footwear_Mesh", mesh)
    obj.data.materials.append(mat_shoe)
    obj.data.materials.append(mat_sole)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            (f"Foot.{sign}", lambda co: (co.x * side > 0), 1.0)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_footwear_complete(footwear_id, arm, char_id, color=None):
    """Dispatcher for Footwear"""
    if footwear_id == "FOOTWEAR_001":
        return [build_footwear_001_sneakers(arm, char_id, color=color or "#f5f3ec")]
    elif footwear_id == "FOOTWEAR_002":
        return [build_footwear_002_canvas(arm, char_id, color=color or "#1e2024")]
    elif footwear_id == "FOOTWEAR_003":
        return [build_footwear_003_sandals(arm, char_id, color=color or "#3a281e")]
    elif footwear_id == "FOOTWEAR_004":
        return [build_footwear_004_slipon(arm, char_id, color=color or "#28303d")]
    else:
        return [build_footwear_001_sneakers(arm, char_id)]

# =============================================================================
# 4. SOCKS BUILDERS (4 CANONICAL VARIANTS)
# =============================================================================

def build_socks_module(socks_id, arm, char_id, color="#f8fafc"):
    """Builds SOCKS_001 (Short), SOCKS_002 (Ankle), SOCKS_003 (Knee-High), or None"""
    if socks_id == "SOCKS_004" or not socks_id:
        return None # No socks visible

    bm = bmesh.new()
    mat = create_or_get_mat(f"M_Socks_{char_id}", color, roughness=0.60)
    segs = 14

    if socks_id == "SOCKS_001":
        top_z = 0.068 # Short socks calf band
    elif socks_id == "SOCKS_002":
        top_z = 0.048 # Ankle socks
    elif socks_id == "SOCKS_003":
        top_z = 0.098 # Knee-high socks just below the knee (Z=0.115)
    else:
        top_z = 0.068

    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055
        # Fits closely to skin (radius 0.034, centered at cy=0.001) so it never clips through trousers
        r_bot = add_ring(bm, 0.032, 0.0340, 0.0340, cx, 0.001, segs)
        r_top = add_ring(bm, top_z, 0.0345, 0.0345, cx, 0.001, segs)
        r_hem = add_ring(bm, top_z + 0.002, 0.0350, 0.0350, cx, 0.001, segs)

        bridge_rings(bm, r_bot, r_top, 0)
        bridge_rings(bm, r_top, r_hem, 0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Socks_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Socks_Mesh", mesh)
    obj.data.materials.append(mat)
    apply_smooth(obj)
    link_to_scene(obj)

    for side, sign in [(-1, "L"), (1, "R")]:
        assign_weights_by_z_and_x(obj, [
            (f"Shin.{sign}", lambda co: (co.x * side > 0), 1.0),
            (f"Foot.{sign}", lambda co: (co.x * side > 0) and (co.z <= 0.035), 0.3)
        ])

    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = arm
    return obj

def build_socks_complete(socks_id, arm, char_id, color=None):
    obj = build_socks_module(socks_id, arm, char_id, color=color or "#f8fafc")
    return [obj] if obj else []

# =============================================================================
# 5. ADAPTIVE BODY LIMBS BUILDER (SKIN EXPOSURE & ZERO CLIPPING)
# =============================================================================

def build_adaptive_body_limbs(arm, char_id, skin_hex, top_id, bottom_id, footwear_id):
    """
    Dynamically builds the visible skin parts of arms, legs, and feet
    so characters with shorts/skirts/sandals have realistic bare skin
    without any geometry clipping through clothing!
    """
    limbs_objs = []
    mat_skin = create_or_get_mat(f"M_Skin_{char_id}", skin_hex, roughness=0.62)
    segs = 14

    # 1. ARMS (Forearms and hands for short-sleeve tops)
    is_long_top = (top_id in ["TOP_006", "TOP_007", "TOP_008"])
    
    for side, sign in [(-1, "L"), (1, "R")]:
        bm = bmesh.new()
        cx = side * 0.118

        if not is_long_top:
            # Complete rounded shoulder dome and upper arm skin
            r_arm_dome = add_ring(bm, 0.376, 0.030, 0.032, cx - side * 0.008, 0.005, segs)
            cap_ring(bm, r_arm_dome, (cx - side * 0.012, 0.005, 0.379), 0, smooth=True)
            r_arm_sh   = add_ring(bm, 0.360, 0.038, 0.038, cx - side * 0.003, 0.005, segs)
            r_arm_mid  = add_ring(bm, 0.335, 0.035, 0.035, cx + side * 0.003, 0.006, segs)
            r_top      = add_ring(bm, 0.310, 0.032, 0.032, cx + side * 0.006, 0.006, segs)
            r_elbow    = add_ring(bm, 0.280, 0.031, 0.031, cx + side * 0.010, 0.008, segs)
            r_fore     = add_ring(bm, 0.240, 0.0295, 0.0295, cx + side * 0.014, 0.011, segs)
            r_wrist    = add_ring(bm, 0.210, 0.028, 0.028, cx + side * 0.016, 0.013, segs)
            r_palm     = add_ring(bm, 0.170, 0.033, 0.028, cx + side * 0.019, 0.016, segs)
            r_palm_b   = add_ring(bm, 0.152, 0.027, 0.023, cx + side * 0.019, 0.016, segs)

            bridge_rings(bm, r_arm_dome, r_arm_sh, 0)
            bridge_rings(bm, r_arm_sh, r_arm_mid, 0)
            bridge_rings(bm, r_arm_mid, r_top, 0)
            bridge_rings(bm, r_top, r_elbow, 0)
            bridge_rings(bm, r_elbow, r_fore, 0)
            bridge_rings(bm, r_fore, r_wrist, 0)
            bridge_rings(bm, r_wrist, r_palm, 0)
            bridge_rings(bm, r_palm, r_palm_b, 0)
            cap_ring(bm, r_palm_b, (cx + side * 0.019, 0.016, 0.142), 0, reverse=True)
        else:
            r_wrist  = add_ring(bm, 0.212, 0.028, 0.028, cx + side * 0.016, 0.013, segs)
            r_palm   = add_ring(bm, 0.170, 0.033, 0.028, cx + side * 0.019, 0.016, segs)
            r_palm_b = add_ring(bm, 0.152, 0.027, 0.023, cx + side * 0.019, 0.016, segs)

            bridge_rings(bm, r_wrist, r_palm, 0)
            bridge_rings(bm, r_palm, r_palm_b, 0)
            cap_ring(bm, r_palm_b, (cx + side * 0.019, 0.016, 0.142), 0, reverse=True)

        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

        mesh = bpy.data.meshes.new(f"Body_Arm_Skin_Mesh_{sign}_{char_id}")
        bm.to_mesh(mesh)
        bm.free()

        a_obj = bpy.data.objects.new(f"Body_Arm_Skin_{sign}", mesh)
        a_obj.data.materials.append(mat_skin)
        apply_smooth(a_obj)
        link_to_scene(a_obj)

        assign_weights_by_z_and_x(a_obj, [
            ("Chest", lambda co: co.z >= 0.360, lambda co: min(0.30, (co.z - 0.360)/0.020 * 0.30)),
            (f"UpperArm.{sign}", lambda co: co.z >= 0.280, lambda co: 1.0 if co.z < 0.360 else max(0.70, 1.0 - (co.z - 0.360)/0.020 * 0.30)),
            (f"Forearm.{sign}", lambda co: 0.210 <= co.z < 0.280, 1.0),
            (f"Hand.{sign}", lambda co: co.z < 0.210, 1.0)
        ])

        m = a_obj.modifiers.new("Armature", 'ARMATURE')
        m.object = arm
        limbs_objs.append(a_obj)

    # 2. LEGS (Under shorts and skirts: full continuous chibi legs from crotch to ankle)
    is_shorts_or_skirt = (bottom_id in [
        "BOTTOM_002", "BOTTOM_003", "BOTTOM_004",
        "BOTTOM_005", "BOTTOM_006", "BOTTOM_008"
    ])

    if is_shorts_or_skirt:
        for side, sign in [(-1, "L"), (1, "R")]:
            bm = bmesh.new()
            cx = side * 0.055

            # Complete Chibi leg from pelvis/crotch (Z = 0.200) all the way down to ankle (Z = 0.038)
            # This ensures that even under flared skirts or when sitting/kicking, the full leg is 100% solid!
            r_pelvis    = add_ring(bm, 0.200, 0.043, 0.043, cx, 0.000, segs)
            r_thigh_top = add_ring(bm, 0.170, 0.041, 0.041, cx, 0.000, segs)
            r_thigh_mid = add_ring(bm, 0.145, 0.0395, 0.0395, cx, 0.001, segs)
            r_knee      = add_ring(bm, 0.115, 0.0385, 0.0385, cx, 0.002, segs) # Cute rounded knee
            r_shin      = add_ring(bm, 0.075, 0.0375, 0.0375, cx, 0.000, segs)
            r_ankle     = add_ring(bm, 0.038, 0.0370, 0.0370, cx, 0.000, segs)

            cap_ring(bm, r_pelvis, (cx, 0.0, 0.205), 0, smooth=True)
            bridge_rings(bm, r_pelvis, r_thigh_top, 0)
            bridge_rings(bm, r_thigh_top, r_thigh_mid, 0)
            bridge_rings(bm, r_thigh_mid, r_knee, 0)
            bridge_rings(bm, r_knee, r_shin, 0)
            bridge_rings(bm, r_shin, r_ankle, 0)

            # If wearing sandals, also add bare foot mesh!
            if footwear_id == "FOOTWEAR_003":
                r_foot_mid = add_ring(bm, 0.020, 0.042, 0.056, cx, 0.016, segs)
                r_foot_bot = add_ring(bm, 0.010, 0.044, 0.058, cx, 0.016, segs)
                bridge_rings(bm, r_ankle, r_foot_mid, 0)
                bridge_rings(bm, r_foot_mid, r_foot_bot, 0)
                cap_ring(bm, r_foot_bot, (cx, 0.016, 0.010), 0, reverse=True)

            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

            mesh = bpy.data.meshes.new(f"Body_Leg_Skin_Mesh_{sign}_{char_id}")
            bm.to_mesh(mesh)
            bm.free()

            l_obj = bpy.data.objects.new(f"Body_Leg_Skin_{sign}", mesh)
            l_obj.data.materials.append(mat_skin)
            apply_smooth(l_obj)
            link_to_scene(l_obj)

            assign_weights_by_z_and_x(l_obj, [
                ("Hips", lambda co: co.z >= 0.180, 0.40),
                (f"Thigh.{sign}", lambda co: 0.115 <= co.z < 0.185, 1.0),
                (f"Shin.{sign}", lambda co: 0.040 <= co.z < 0.115, 1.0),
                (f"Foot.{sign}", lambda co: co.z < 0.040, 1.0)
            ])

            m = l_obj.modifiers.new("Armature", 'ARMATURE')
            m.object = arm
            limbs_objs.append(l_obj)

    return limbs_objs

# =============================================================================
# 6. UNIFIED EQUIPPING INTERFACE
# =============================================================================

def equip_modular_character_clothing(arm, char_id, skin_hex, top_id, bottom_id, footwear_id, socks_id, overrides=None):
    """
    Cleans up old clothing and equips the complete modular set
    """
    overrides = overrides or {}

    # 1. Clean legacy / existing clothing
    legacy_objs = [
        "Character_Torso_Legs", "Shirt_Collar",
        "Character_Arm_L", "Character_Arm_R",
        "PE_Stripe_L", "PE_Stripe_R",
        "Top_Torso_Mesh", "Top_Collar", "Top_Sleeve_L", "Top_Sleeve_R",
        "Bottom_Mesh", "Footwear_Mesh", "Socks_Mesh",
        "Body_Arm_Skin_L", "Body_Arm_Skin_R",
        "Body_Leg_Skin_L", "Body_Leg_Skin_R"
    ]
    for name in legacy_objs:
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)

    all_created = []

    # 2. Build Top
    tops = build_top_complete(top_id, arm, char_id, color=overrides.get("top_color"))
    all_created.extend(tops)

    # 3. Build Bottom
    bottoms = build_bottom_complete(bottom_id, arm, char_id, color=overrides.get("bottom_color"))
    all_created.extend(bottoms)

    # 4. Build Footwear
    footwear = build_footwear_complete(footwear_id, arm, char_id, color=overrides.get("footwear_color"))
    all_created.extend(footwear)

    # 5. Build Socks
    socks = build_socks_complete(socks_id, arm, char_id, color=overrides.get("socks_color"))
    all_created.extend(socks)

    # 6. Build Adaptive Limbs
    limbs = build_adaptive_body_limbs(arm, char_id, skin_hex, top_id, bottom_id, footwear_id)
    all_created.extend(limbs)

    return all_created

# =============================================================================
# 5. ACCESSORIES BUILDERS (CANONICAL VARIANTS)
# =============================================================================

def build_accessory_001_red_scarf(arm, char_id, color="#d92027"):
    """
    Constructs an authentic stylized Chibi Vietnamese School Red Scarf (Khăn quàng đỏ Đội viên).
    Faithful to visual reference Figure 12 (Front knot & tails) and Figure 13 (Small rear triangle).
    
    Structure:
    1. Vạt tam giác sau gáy nhỏ gọn (Small triangular section at upper back directly under collar, ~15-20% torso)
    2. Vòng dải quàng cổ qua vai (Slim neck bands wrapping smoothly around lateral neck contours into knot)
    3. Nút thắt vuông vắn trung tâm (Central square knot beneath shirt collar)
    4. Hai dải khăn buông rủ phía trước (Left & right hanging tails with angled cut tips)
    
    Rigging:
    - Lightweight bone-based skinning on Student_Armature (Neck, Chest, Spine)
    - Zero cloth simulation overhead, deformation tested on all 16 actions.
    """
    mat = create_or_get_mat(f"M_Acc_Scarf_{char_id}", color, roughness=0.58)
    bm = bmesh.new()

    thick = 0.0022  # fabric thickness

    # -------------------------------------------------------------------------
    # 1. SMALL REAR TRIANGLE UNDER BACK COLLAR (FIGURE 13)
    # -------------------------------------------------------------------------
    # One continuous ribbon from the left knot, around the neck and
    # across the rear flap, to the right knot. Shared rings prevent gaps.
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree

    # Conform the ribbon to the evaluated shirt so its face follows the
    # shoulder slope as well as the front and rear torso.
    shirt = bpy.data.objects.get("Top_Torso_Mesh")
    if shirt is None:
        raise ValueError("Equip the shirt before building the modular scarf")
    bpy.context.view_layer.update()
    surface = BVHTree.FromObject(shirt, bpy.context.evaluated_depsgraph_get())

    def on_shirt(angle, height, clearance=0.003):
        direction = Vector((math.cos(angle), math.sin(angle), 0.0))
        origin = Vector((0.0, 0.0, height)) + direction * 0.3
        hit, normal, _, _ = surface.ray_cast(origin, -direction, 0.5)
        if hit is None:
            raise ValueError(f"Scarf surface projection failed at {height}")
        return hit + normal * clearance

    # Front landmarks are inside the sleeve seams. Each edge follows
    # the same diagonal from the neck base to the lower chest knot.
    guides = [
        ((-.004,.091,.337),(-.012,.092,.328)),
        ((-.017,.088,.354),(-.030,.090,.346)),
        ((-.032,.082,.375),(-.048,.086,.366)),
        ((-.047,.063,.395),(-.063,.066,.389)),
        ((-.062,.027,.407),(-.079,.027,.397)),
        ((-.065,-.012,.407),(-.081,-.012,.397)),
        ((-.049,-.050,.403),(-.063,-.059,.390)),
        ((-.026,-.066,.401),(-.029,-.086,.381)),
        ((0,-.068,.401),(0,-.092,.365)),
        ((.026,-.066,.401),(.029,-.086,.381)),
        ((.049,-.050,.403),(.063,-.059,.390)),
        ((.065,-.012,.407),(.081,-.012,.397)),
        ((.062,.027,.407),(.079,.027,.397)),
        ((.047,.063,.395),(.063,.066,.389)),
        ((.032,.082,.375),(.048,.086,.366)),
        ((.017,.088,.354),(.030,.090,.346)),
        ((.004,.091,.337),(.012,.092,.328)),
    ]
    rings = []
    for index in range(65):
        segment = min(index // 4, 15)
        fraction = (index - segment * 4) / 4
        edges = []
        for edge in range(2):
            position = Vector(guides[segment][edge]).lerp(
                Vector(guides[segment + 1][edge]), fraction)
            hit, normal, _, _ = surface.find_nearest(position)
            edges.append((hit, normal))
        ring = []
        for edge, clearance in [(0,.004),(1,.004),(1,.0025),(0,.0025)]:
            hit, normal = edges[edge]
            ring.append(bm.verts.new(hit + normal * clearance))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for j in range(4):
            bm.faces.new([a[j], b[j], b[(j+1)%4], a[(j+1)%4]])
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])

    # -------------------------------------------------------------------------
    # 3. CENTRAL SQUARE KNOT (FIGURE 12)
    # -------------------------------------------------------------------------
    kw = 0.014
    kh = 0.010
    kd = 0.005
    kx = 0.0
    ky = 0.088
    kz = 0.331

    knot_rings = []
    profiles = [
        (kw * 0.75, kh * 0.75, kd * 0.45,  0.005),
        (kw * 1.00, kh * 1.00, kd * 1.00,  0.000),
        (kw * 0.70, kh * 0.70, kd * 0.50, -0.005),
    ]

    for sz_w, sz_h, sz_d, dy in profiles:
        ring = [
            bm.verts.new((kx - sz_w, ky + dy + sz_d, kz + sz_h)),
            bm.verts.new((kx + sz_w, ky + dy + sz_d, kz + sz_h)),
            bm.verts.new((kx + sz_w, ky + dy + sz_d, kz - sz_h)),
            bm.verts.new((kx - sz_w, ky + dy + sz_d, kz - sz_h)),
        ]
        knot_rings.append(ring)

    for r in range(len(knot_rings) - 1):
        for j in range(4):
            bm.faces.new([
                knot_rings[r][j], knot_rings[r][(j+1)%4],
                knot_rings[r+1][(j+1)%4], knot_rings[r+1][j]
            ])
    bm.faces.new([knot_rings[0][0], knot_rings[0][3], knot_rings[0][2], knot_rings[0][1]])
    bm.faces.new([knot_rings[-1][0], knot_rings[-1][1], knot_rings[-1][2], knot_rings[-1][3]])

    # Center knot wrap band
    bw = 0.009
    bh = 0.007
    b_front = [
        bm.verts.new((kx - bw, ky + kd + 0.006, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.006, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.006, kz - bh)),
        bm.verts.new((kx - bw, ky + kd + 0.006, kz - bh)),
    ]
    bm.faces.new(b_front)

    # -------------------------------------------------------------------------
    # 4. TWO HANGING TAILS (FIGURE 12)
    # -------------------------------------------------------------------------
    tail_defs = [
        {
            "side": -1,
            "root_x": -0.007,
            "root_y": 0.091,
            "root_z": 0.330,
            "tip_zo": 0.278,
            "tip_zi": 0.291,
            "drift_x": -0.004,
            "n_segs": 5
        },
        {
            "side": 1,
            "root_x": 0.007,
            "root_y": 0.090,
            "root_z": 0.330,
            "tip_zo": 0.270,
            "tip_zi": 0.285,
            "drift_x": 0.004,
            "n_segs": 5
        }
    ]

    for td in tail_defs:
        side = td["side"]
        n_segs = td["n_segs"]
        rx_0 = td["root_x"]
        ry_0 = td["root_y"]
        rz_0 = td["root_z"]
        tzo = td["tip_zo"]
        tzi = td["tip_zi"]
        avg_tz = (tzo + tzi) * 0.5
        t_len = rz_0 - avg_tz

        hw_root = 0.009
        hw_mid = 0.012
        thick_t = 0.0022

        rings_f = []
        rings_b = []

        for s in range(n_segs + 1):
            frac = s / n_segs
            cz = rz_0 - frac * t_len

            y_bump = math.sin(frac * math.pi * 0.7) * 0.004
            cy = ry_0 + y_bump - frac * 0.002
            cx = rx_0 + frac * td["drift_x"]

            cur_w = hw_root * (1.0 - 0.65 * frac) + 0.004 * math.sin(math.pi * frac)

            if s == n_segs:
                zo = tzo
                zi = tzi
            else:
                zo = cz
                zi = cz

            zl = zo if side < 0 else zi
            zr = zi if side < 0 else zo

            v_fl = bm.verts.new((cx - cur_w, cy + thick_t, zl))
            v_fr = bm.verts.new((cx + cur_w, cy + thick_t, zr))
            v_br = bm.verts.new((cx + cur_w, cy - thick_t, zr))
            v_bl = bm.verts.new((cx - cur_w, cy - thick_t, zl))

            rings_f.append((v_fl, v_fr))
            rings_b.append((v_bl, v_br))

        for s in range(n_segs):
            fl1, fr1 = rings_f[s]
            fl2, fr2 = rings_f[s+1]
            bl1, br1 = rings_b[s]
            bl2, br2 = rings_b[s+1]

            bm.faces.new([fl1, fr1, fr2, fl2])
            bm.faces.new([fr1, br1, br2, fr2])
            bm.faces.new([br1, bl1, bl2, br2])
            bm.faces.new([bl1, fl1, fl2, bl2])

        b_fl, b_fr = rings_f[-1]
        b_bl, b_br = rings_b[-1]
        bm.faces.new([b_fl, b_fr, b_br, b_bl])

    crease = bm.edges.layers.float.get("crease_edge") or bm.edges.layers.float.new("crease_edge")
    knot_vertices = {v for ring in knot_rings for v in ring}
    for edge in bm.edges:
        if all(v in knot_vertices for v in edge.verts):
            edge[crease] = 0.65
    for vertex in knot_vertices:
        vertex.co.z += (vertex.co.x - kx) * 0.22

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Acc_Red_Scarf_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    scarf_obj = bpy.data.objects.new("Acc_Red_Scarf", mesh)
    scarf_obj.data.materials.append(mat)

    sub = scarf_obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    wrap_group = scarf_obj.vertex_groups.new(name="Scarf_Surface")
    wrap_group.add(list(range(65 * 4)), 1.0, 'REPLACE')
    conform = scarf_obj.modifiers.new("Cloth_Clearance", 'SHRINKWRAP')
    conform.target = shirt
    conform.vertex_group = wrap_group.name
    conform.wrap_method = 'NEAREST_SURFACEPOINT'
    conform.wrap_mode = 'OUTSIDE_SURFACE'
    conform.offset = 0.003


    for poly in scarf_obj.data.polygons:
        poly.use_smooth = True

    link_to_scene(scarf_obj)

    # 5. SKINNING (NECK, CHEST, SPINE)
    vg_neck = scarf_obj.vertex_groups.new(name="Neck")
    vg_chest = scarf_obj.vertex_groups.new(name="Chest")
    vg_spine = scarf_obj.vertex_groups.new(name="Spine")

    for v in scarf_obj.data.vertices:
        z = v.co.z
        if z >= 0.380:
            vg_neck.add([v.index], 0.65, 'REPLACE')
            vg_chest.add([v.index], 0.35, 'REPLACE')
        elif z >= 0.340:
            vg_chest.add([v.index], 0.90, 'REPLACE')
            vg_neck.add([v.index], 0.10, 'REPLACE')
        elif z >= 0.300:
            vg_chest.add([v.index], 0.85, 'REPLACE')
            vg_spine.add([v.index], 0.15, 'REPLACE')
        else:
            vg_chest.add([v.index], 0.65, 'REPLACE')
            vg_spine.add([v.index], 0.35, 'REPLACE')

    m_arm = scarf_obj.modifiers.new("Armature", 'ARMATURE')
    m_arm.object = arm

    return scarf_obj
