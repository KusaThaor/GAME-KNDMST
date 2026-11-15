"""
=============================================================================
HÀNH TRÌNH THANH XUÂN — CHIBI STUDENT CHARACTER (V7 - PRODUCTION CALIBRATED)
Character: Nam sinh Lớp 6 (Vietnamese Middle-School Student)
Key Highlights:
- Khắc phục triệt để lỗi gán nhầm vertex group cẳng tay (do substring "ear").
- Hệ thống xương và khớp 2 đoạn chính xác 100%: Thigh/Shin, UpperArm/Forearm.
- Hiệu chuẩn hướng xoay Spine và Head: cúi người/chạy (-X), ngả người (+X).
- Hiệu chuẩn toàn bộ 16 Actions biểu cảm học đường Việt Nam 2012–2013.
=============================================================================
"""

import bpy
import math
import os

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
OUTPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student.blend")
OUTPUT_GLB = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student.glb")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews")
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "exec_log.txt")

for d in [os.path.dirname(OUTPUT_BLEND), os.path.dirname(OUTPUT_GLB), PREVIEWS_DIR]:
    os.makedirs(d, exist_ok=True)

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING ANIMATION BUILD (V7 - PRODUCTION CALIBRATED)\n")

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def create_mat(name, hex_color, roughness=0.55, metallic=0.0, emission=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_lin(hex_color)
        bsdf.inputs["Roughness"].default_value = roughness
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if emission:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_to_lin(emission)
                bsdf.inputs["Emission Strength"].default_value = 1.0
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = hex_to_lin(emission)
    return mat

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    col = bpy.data.collections.new("Vietnamese_Student")
    bpy.context.scene.collection.children.link(col)
    return col

def add_mesh_obj(name, primitive_func, loc, scale, rot, mat, col, subdiv=0, bevel=0):
    primitive_func(location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    if bevel > 0:
        b = obj.modifiers.new(name="Bevel", type="BEVEL")
        b.width = bevel
        b.segments = 2
        b.harden_normals = True

    if subdiv > 0:
        sub = obj.modifiers.new(name="Subdiv", type="SUBSURF")
        sub.levels = subdiv
        sub.render_levels = subdiv

    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)

    if col not in obj.users_collection:
        col.objects.link(obj)
    for c in list(obj.users_collection):
        if c != col:
            c.objects.unlink(obj)
    return obj

def build_student():
    col = reset_scene()

    mats = {
        "skin": create_mat("M_Skin", "#f4cfae", roughness=0.62),
        "hair": create_mat("M_Hair", "#1c1615", roughness=0.45),
        "eye_black": create_mat("M_Eye_Black", "#0e0e11", roughness=0.15),
        "eye_hl": create_mat("M_Eye_Highlight", "#ffffff", roughness=0.1, emission="#ffffff"),
        "blush": create_mat("M_Blush", "#f28392", roughness=0.7),
        "mouth": create_mat("M_Mouth", "#782d2c", roughness=0.4),
        "shirt": create_mat("M_Shirt", "#f7f5ef", roughness=0.55),
        "scarf": create_mat("M_Scarf", "#d92b2b", roughness=0.5),
        "pants": create_mat("M_Pants", "#223152", roughness=0.65),
        "belt": create_mat("M_Belt", "#1c1c20", roughness=0.5),
        "shoe": create_mat("M_Shoe", "#f5f3ec", roughness=0.55),
        "sole": create_mat("M_Sole", "#b8aca0", roughness=0.7),
        "nametag": create_mat("M_Nametag", "#cde4f7", roughness=0.5),
    }

    parts = []

    # =========================================================================
    # 1. HEAD & FACE
    # =========================================================================
    head_z = 0.52
    head = add_mesh_obj(
        "Head",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.0, head_z),
        (0.34, 0.32, 0.28),
        (0, 0, 0),
        mats["skin"], col, subdiv=2
    )
    parts.append(head)

    # Ears
    for side, sname in [(-1, "L"), (1, "R")]:
        ear = add_mesh_obj(
            f"Ear_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * 0.155, -0.01, head_z - 0.01),
            (0.032, 0.048, 0.058),
            (0, math.radians(side * -10), math.radians(side * 12)),
            mats["skin"], col, subdiv=1
        )
        parts.append(ear)

    # Hair Dome
    hair_cap = add_mesh_obj(
        "Hair_Cap",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, -0.015, head_z + 0.02),
        (0.36, 0.34, 0.29),
        (0, 0, 0),
        mats["hair"], col, subdiv=2
    )
    parts.append(hair_cap)

    # Hair Bangs
    hair_bangs = add_mesh_obj(
        "Hair_Bangs",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.10, head_z + 0.05),
        (0.33, 0.12, 0.13),
        (math.radians(-16), 0, 0),
        mats["hair"], col, subdiv=2
    )
    parts.append(hair_bangs)

    # Sideburns
    for side, sname in [(-1, "L"), (1, "R")]:
        burn = add_mesh_obj(
            f"Hair_Sideburn_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * 0.16, 0.03, head_z),
            (0.032, 0.065, 0.09),
            (math.radians(-12), 0, math.radians(side * -8)),
            mats["hair"], col, subdiv=1
        )
        parts.append(burn)

    # Eyes & Highlights
    face_y = 0.124
    eye_x = 0.065
    eye_z = head_z - 0.01
    for side, sname in [(-1, "L"), (1, "R")]:
        eye = add_mesh_obj(
            f"Eye_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * eye_x, face_y + 0.002, eye_z),
            (0.040, 0.010, 0.050),
            (math.radians(-10), 0, math.radians(side * -3)),
            mats["eye_black"], col, subdiv=1
        )
        parts.append(eye)

        hl1 = add_mesh_obj(
            f"Eye_HL1_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * (eye_x - side * 0.008), face_y + 0.007, eye_z + 0.012),
            (0.013, 0.006, 0.014),
            (math.radians(-10), 0, 0),
            mats["eye_hl"], col, subdiv=1
        )
        parts.append(hl1)

        hl2 = add_mesh_obj(
            f"Eye_HL2_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * (eye_x + side * 0.008), face_y + 0.007, eye_z - 0.012),
            (0.007, 0.005, 0.007),
            (math.radians(-10), 0, 0),
            mats["eye_hl"], col, subdiv=1
        )
        parts.append(hl2)

        blush = add_mesh_obj(
            f"Blush_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * (eye_x + 0.052), face_y - 0.010, eye_z - 0.028),
            (0.042, 0.008, 0.018),
            (math.radians(-14), 0, math.radians(side * -15)),
            mats["blush"], col, subdiv=1
        )
        parts.append(blush)

    # Smile
    mouth = add_mesh_obj(
        "Mouth",
        lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=0.034, location=location),
        (0.0, face_y + 0.002, eye_z - 0.044),
        (1.0, 1.0, 1.0),
        (0, math.radians(90), 0),
        mats["mouth"], col, bevel=0.002
    )
    parts.append(mouth)

    # =========================================================================
    # 2. TORSO, COLLAR & RED SCARF
    # =========================================================================
    neck = add_mesh_obj(
        "Neck",
        lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.06, location=location),
        (0.0, 0.0, 0.41),
        (1.0, 1.0, 1.0),
        (0, 0, 0),
        mats["skin"], col, bevel=0.005
    )
    parts.append(neck)

    torso = add_mesh_obj(
        "Shirt_Torso",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.0, 0.32),
        (0.23, 0.16, 0.22),
        (0, 0, 0),
        mats["shirt"], col, subdiv=2
    )
    parts.append(torso)

    collar = add_mesh_obj(
        "Shirt_Collar",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.015, 0.405),
        (0.18, 0.135, 0.035),
        (0, 0, 0),
        mats["shirt"], col, subdiv=1
    )
    parts.append(collar)

    scarf_knot = add_mesh_obj(
        "Scarf_Knot",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.084, 0.38),
        (0.038, 0.026, 0.034),
        (0, 0, 0),
        mats["scarf"], col, subdiv=1
    )
    parts.append(scarf_knot)

    for side, sname in [(-1, "L"), (1, "R")]:
        tail = add_mesh_obj(
            f"Scarf_Tail_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * 0.012, 0.084, 0.345),
            (0.022, 0.014, 0.076),
            (math.radians(-12), 0, math.radians(side * -18)),
            mats["scarf"], col, subdiv=1
        )
        parts.append(tail)

    nametag = add_mesh_obj(
        "Nametag",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (-0.062, 0.080, 0.34),
        (0.030, 0.005, 0.015),
        (math.radians(-8), 0, 0),
        mats["nametag"], col, bevel=0.002
    )
    parts.append(nametag)

    # =========================================================================
    # 3. SHOULDERS, ARMS & HANDS (Articulated 2-segment)
    # =========================================================================
    arm_x = 0.118
    arm_z = 0.34
    for side, sname in [(-1, "L"), (1, "R")]:
        sleeve = add_mesh_obj(
            f"Sleeve_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * arm_x, 0.0, arm_z + 0.01),
            (0.075, 0.075, 0.075),
            (0, 0, math.radians(side * 8)),
            mats["shirt"], col, subdiv=1
        )
        parts.append(sleeve)

        upperarm = add_mesh_obj(
            f"UpperArm_{sname}",
            lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.031, depth=0.070, location=location),
            (side * (arm_x + 0.006), 0.005, arm_z - 0.035),
            (1.0, 1.0, 1.0),
            (math.radians(6), 0, math.radians(side * -5)),
            mats["skin"], col, bevel=0.005
        )
        parts.append(upperarm)

        forearm = add_mesh_obj(
            f"Forearm_{sname}",
            lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.028, depth=0.065, location=location),
            (side * (arm_x + 0.012), 0.012, arm_z - 0.098),
            (1.0, 1.0, 1.0),
            (math.radians(6), 0, math.radians(side * -5)),
            mats["skin"], col, bevel=0.005
        )
        parts.append(forearm)

        hand = add_mesh_obj(
            f"Hand_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * (arm_x + 0.016), 0.018, arm_z - 0.145),
            (0.044, 0.044, 0.046),
            (0, 0, 0),
            mats["skin"], col, subdiv=1
        )
        parts.append(hand)

    # =========================================================================
    # 4. WAISTLINE, BELT, PANTS, LEGS & SNEAKERS (Articulated 2-segment)
    # =========================================================================
    belt = add_mesh_obj(
        "Belt",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.0, 0.23),
        (0.195, 0.135, 0.035),
        (0, 0, 0),
        mats["belt"], col, subdiv=1
    )
    parts.append(belt)

    pelvis = add_mesh_obj(
        "Pants_Pelvis",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.0, 0.18),
        (0.19, 0.135, 0.11),
        (0, 0, 0),
        mats["pants"], col, subdiv=2
    )
    parts.append(pelvis)

    leg_x = 0.055
    for side, sname in [(-1, "L"), (1, "R")]:
        thigh = add_mesh_obj(
            f"Thigh_{sname}",
            lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.085, location=location),
            (side * leg_x, 0.0, 0.155),
            (1.0, 1.0, 1.0),
            (0, 0, 0),
            mats["pants"], col, bevel=0.006
        )
        parts.append(thigh)

        shin = add_mesh_obj(
            f"Shin_{sname}",
            lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.036, depth=0.075, location=location),
            (side * leg_x, 0.0, 0.078),
            (1.0, 1.0, 1.0),
            (0, 0, 0),
            mats["pants"], col, bevel=0.006
        )
        parts.append(shin)

        shoe = add_mesh_obj(
            f"Shoe_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * leg_x, 0.012, 0.038),
            (0.055, 0.082, 0.046),
            (0, 0, 0),
            mats["shoe"], col, subdiv=1
        )
        parts.append(shoe)

        sole = add_mesh_obj(
            f"Shoe_Sole_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * leg_x, 0.012, 0.008),
            (0.058, 0.086, 0.016),
            (0, 0, 0),
            mats["sole"], col, bevel=0.002
        )
        parts.append(sole)

    log(f"Assembled {len(parts)} mesh parts (clean shirt, calibrated articulated limbs).")
    return parts

# =============================================================================
# ARMATURE
# =============================================================================
def build_armature(col, parts):
    arm_data = bpy.data.armatures.new("Student_Armature_Data")
    arm_obj = bpy.data.objects.new("Student_Armature", arm_data)
    col.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj

    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm_data.edit_bones

    root = eb.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 0.08)

    hips = eb.new("Hips")
    hips.head = (0, 0, 0.20)
    hips.tail = (0, 0, 0.26)
    hips.parent = root

    spine = eb.new("Spine")
    spine.head = hips.tail
    spine.tail = (0, 0, 0.36)
    spine.parent = hips

    neck = eb.new("Neck")
    neck.head = spine.tail
    neck.tail = (0, 0, 0.42)
    neck.parent = spine

    head = eb.new("Head")
    head.head = neck.tail
    head.tail = (0, 0, 0.68)
    head.parent = neck

    # Eye bones
    for side, sname in [(-1, "L"), (1, "R")]:
        eye_b = eb.new(f"Eye.{sname}")
        eye_b.head = (side * 0.065, 0.124, 0.51)
        eye_b.tail = (side * 0.065, 0.134, 0.51)
        eye_b.parent = head

    # Arms
    for side, sname in [(-1, "L"), (1, "R")]:
        arm_up = eb.new(f"UpperArm.{sname}")
        arm_up.head = (side * 0.115, 0.0, 0.35)
        arm_up.tail = (side * 0.122, 0.005, 0.28)
        arm_up.parent = spine

        forearm = eb.new(f"Forearm.{sname}")
        forearm.head = arm_up.tail
        forearm.tail = (side * 0.132, 0.012, 0.21)
        forearm.parent = arm_up

        hand = eb.new(f"Hand.{sname}")
        hand.head = forearm.tail
        hand.tail = (side * 0.140, 0.018, 0.15)
        hand.parent = forearm

    # Legs
    for side, sname in [(-1, "L"), (1, "R")]:
        thigh = eb.new(f"Thigh.{sname}")
        thigh.head = (side * 0.055, 0.0, 0.20)
        thigh.tail = (side * 0.055, 0.0, 0.115)
        thigh.parent = hips

        shin = eb.new(f"Shin.{sname}")
        shin.head = thigh.tail
        shin.tail = (side * 0.055, 0.0, 0.04)
        shin.parent = thigh

        foot = eb.new(f"Foot.{sname}")
        foot.head = shin.tail
        foot.tail = (side * 0.055, 0.05, 0.01)
        foot.parent = shin

    bpy.ops.object.mode_set(mode="OBJECT")

    # Vertex Group mappings (Sử dụng tên chính xác, không dùng substring dễ trùng như "ear")
    bone_map = [
        ("Eye.L", ["eye_l", "eye_hl1_l", "eye_hl2_l"]),
        ("Eye.R", ["eye_r", "eye_hl1_r", "eye_hl2_r"]),
        ("Head", ["head", "hair_cap", "hair_bangs", "hair_sideburn_l", "hair_sideburn_r", "ear_l", "ear_r", "blush_l", "blush_r", "mouth"]),
        ("Neck", ["neck", "shirt_collar", "scarf_knot", "scarf_tail_l", "scarf_tail_r"]),
        ("Spine", ["shirt_torso", "nametag"]),
        ("Hips", ["belt", "pants_pelvis"]),
        ("UpperArm.L", ["sleeve_l", "upperarm_l"]),
        ("Forearm.L", ["forearm_l"]),
        ("Hand.L", ["hand_l"]),
        ("UpperArm.R", ["sleeve_r", "upperarm_r"]),
        ("Forearm.R", ["forearm_r"]),
        ("Hand.R", ["hand_r"]),
        ("Thigh.L", ["thigh_l"]),
        ("Shin.L", ["shin_l"]),
        ("Foot.L", ["shoe_l", "shoe_sole_l"]),
        ("Thigh.R", ["thigh_r"]),
        ("Shin.R", ["shin_r"]),
        ("Foot.R", ["shoe_r", "shoe_sole_r"]),
    ]

    for p in parts:
        mod = p.modifiers.new(name="Armature", type="ARMATURE")
        mod.object = arm_obj
        p_name = p.name.lower()
        assigned = "Hips"
        for b_name, kws in bone_map:
            if any(k == p_name or p_name.startswith(k) for k in kws):
                assigned = b_name
                break
        vg = p.vertex_groups.new(name=assigned)
        vg.add(list(range(len(p.data.vertices))), 1.0, "REPLACE")

    log("Armature configured with calibrated vertex groups and Eye bones.")
    return arm_obj

def reset_pose_bones(pb):
    for b in pb:
        b.location = (0, 0, 0)
        b.rotation_mode = "XYZ"
        b.rotation_euler = (0, 0, 0)
        b.scale = (1, 1, 1)

# =============================================================================
# 16 ANIMATION ACTIONS SUITE
# =============================================================================
def setup_animations(arm_obj):
    if not arm_obj.animation_data:
        arm_obj.animation_data_create()

    bpy.context.view_layer.objects.active = arm_obj
    pb = arm_obj.pose.bones

    # -------------------------------------------------------------------------
    # 1. ACTION: IDLE (Đứng thở tự nhiên, chớp mắt nhẹ)
    # -------------------------------------------------------------------------
    idle = bpy.data.actions.new("Action_Idle")
    arm_obj.animation_data.action = idle
    bpy.ops.object.mode_set(mode="POSE")
    reset_pose_bones(pb)

    for f, bz, sp_x, ht in [(1, 0.0, 0.0, 0.0), (20, -0.005, math.radians(-2.5), 0.025), (40, 0.0, 0.0, 0.0)]:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (sp_x, 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (0, ht, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        for side, sign in [("L", -1), ("R", 1)]:
            pb[f"UpperArm.{side}"].rotation_euler = (0, 0, math.radians(sign * -5))
            pb[f"UpperArm.{side}"].keyframe_insert("rotation_euler", frame=f)
            pb[f"Forearm.{side}"].rotation_euler = (math.radians(12), 0, math.radians(sign * 5))
            pb[f"Forearm.{side}"].keyframe_insert("rotation_euler", frame=f)
            pb[f"Thigh.{side}"].rotation_euler = (0, 0, 0)
            pb[f"Thigh.{side}"].keyframe_insert("rotation_euler", frame=f)
            pb[f"Shin.{side}"].rotation_euler = (0, 0, 0)
            pb[f"Shin.{side}"].keyframe_insert("rotation_euler", frame=f)

    for side in ["L", "R"]:
        b = pb[f"Eye.{side}"]
        for f, sz in [(1, 1.0), (18, 1.0), (21, 0.08), (24, 1.0), (40, 1.0)]:
            b.scale = (1.0, 1.0, sz)
            b.keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 2. ACTION: WALK (Bước đi nhún nhảy đáng yêu)
    # -------------------------------------------------------------------------
    walk = bpy.data.actions.new("Action_Walk")
    arm_obj.animation_data.action = walk
    reset_pose_bones(pb)

    walk_keys = [
        # Frame, ThL_X, ShL_X, ThR_X, ShR_X, ArmL_X, ArmR_X, Hips_Z
        (1,   math.radians(24),  0.0,               math.radians(-22), math.radians(-15), math.radians(-20), math.radians(20),  0.0),
        (8,   0.0,               math.radians(-12), 0.0,               0.0,               0.0,               0.0,               0.012),
        (15,  math.radians(-22), math.radians(-15), math.radians(24),  0.0,               math.radians(20),  math.radians(-20), 0.0),
        (22,  0.0,               0.0,               0.0,               math.radians(-12), 0.0,               0.0,               0.012),
        (30,  math.radians(24),  0.0,               math.radians(-22), math.radians(-15), math.radians(-20), math.radians(20),  0.0),
    ]
    for f, th_l, sh_l, th_r, sh_r, a_l, a_r, bz in walk_keys:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (math.radians(-4), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)

        pb["Thigh.L"].rotation_euler = (th_l, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (sh_l, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (th_r, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (sh_r, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (a_l, 0, math.radians(-6))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(25), 0, math.radians(6))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (a_r, 0, math.radians(6))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(25), 0, math.radians(-6))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 3. ACTION: RUN (Chạy sôi động, chúi người về trước)
    # -------------------------------------------------------------------------
    run = bpy.data.actions.new("Action_Run")
    arm_obj.animation_data.action = run
    reset_pose_bones(pb)

    run_keys = [
        # Frame, ThL_X, ShL_X, ThR_X, ShR_X, ArmL_X, ArmR_X, Hips_Z
        (1,   math.radians(45),  0.0,               math.radians(-38), math.radians(-35), math.radians(-45), math.radians(45),  0.0),
        (5,   math.radians(15),  math.radians(-20), math.radians(-10), 0.0,               math.radians(-15), math.radians(15),  0.024),
        (10,  math.radians(-38), math.radians(-35), math.radians(45),  0.0,               math.radians(45),  math.radians(-45), 0.0),
        (15,  math.radians(-10), 0.0,               math.radians(15),  math.radians(-20), math.radians(15),  math.radians(-15), 0.024),
        (20,  math.radians(45),  0.0,               math.radians(-38), math.radians(-35), math.radians(-45), math.radians(45),  0.0),
    ]
    for f, th_l, sh_l, th_r, sh_r, a_l, a_r, bz in run_keys:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        # Chúi người về trước (negative X)
        pb["Spine"].rotation_euler = (math.radians(-18), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (math.radians(10), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        pb["Thigh.L"].rotation_euler = (th_l, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (sh_l, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (th_r, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (sh_r, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (a_l, 0, math.radians(-10))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(75), 0, math.radians(10))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (a_r, 0, math.radians(10))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(75), 0, math.radians(-10))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 4. ACTION: JUMP (Nhún đà -> bật nhảy lên không -> tiếp đất)
    # -------------------------------------------------------------------------
    jump = bpy.data.actions.new("Action_Jump")
    arm_obj.animation_data.action = jump
    reset_pose_bones(pb)

    jump_keys = [
        # Frame, Hips_Z, Spine_X, Thigh_X, Shin_X, Arm_X, Forearm_X, Head_X
        (1,   0.0,    0.0,                0.0,                0.0,                0.0,                math.radians(15), 0.0),
        (8,  -0.038,  math.radians(-14),  math.radians(28),   math.radians(-28),  math.radians(-25),  math.radians(35), math.radians(8)),
        (16,  0.145,  math.radians(4),    math.radians(18),   math.radians(-15),  math.radians(115),  math.radians(25), math.radians(12)),
        (25, -0.032,  math.radians(-12),  math.radians(24),   math.radians(-24),  math.radians(-15),  math.radians(30), math.radians(6)),
        (35,  0.0,    0.0,                0.0,                0.0,                0.0,                math.radians(15), 0.0),
    ]
    for f, hz, sp_x, th_x, sh_x, a_x, fa_x, hd_x in jump_keys:
        pb["Hips"].location = (0, 0, hz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (sp_x, 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (hd_x, 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        for side, sign in [("L", -1), ("R", 1)]:
            pb[f"Thigh.{side}"].rotation_euler = (th_x, 0, 0)
            pb[f"Thigh.{side}"].keyframe_insert("rotation_euler", frame=f)
            pb[f"Shin.{side}"].rotation_euler = (sh_x, 0, 0)
            pb[f"Shin.{side}"].keyframe_insert("rotation_euler", frame=f)

            pb[f"UpperArm.{side}"].rotation_euler = (a_x, 0, math.radians(sign * -15))
            pb[f"UpperArm.{side}"].keyframe_insert("rotation_euler", frame=f)
            pb[f"Forearm.{side}"].rotation_euler = (fa_x, 0, math.radians(sign * 10))
            pb[f"Forearm.{side}"].keyframe_insert("rotation_euler", frame=f)

            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 5. ACTION: BLINK (Chớp mắt độc lập)
    # -------------------------------------------------------------------------
    blink = bpy.data.actions.new("Action_Blink")
    arm_obj.animation_data.action = blink
    reset_pose_bones(pb)

    for side in ["L", "R"]:
        b = pb[f"Eye.{side}"]
        for f, sz in [(1, 1.0), (4, 1.0), (7, 0.08), (10, 1.0), (15, 1.0)]:
            b.scale = (1.0, 1.0, sz)
            b.keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 6. ACTION: SIT (Ngồi ngay ngắn trên ghế bàn học)
    # -------------------------------------------------------------------------
    sit = bpy.data.actions.new("Action_Sit")
    arm_obj.animation_data.action = sit
    reset_pose_bones(pb)

    for f in [1, 20, 40]:
        bz = -0.090 if f != 20 else -0.092
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Shin.L"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Spine"].rotation_euler = (math.radians(-3 if f != 20 else -1), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (math.radians(25), 0, math.radians(-10))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(65), 0, math.radians(-15))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (math.radians(25), 0, math.radians(10))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(65), 0, math.radians(15))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 7. ACTION: WRITE (Ngồi viết bài trên bàn học)
    # -------------------------------------------------------------------------
    write = bpy.data.actions.new("Action_Write")
    arm_obj.animation_data.action = write
    reset_pose_bones(pb)

    for f in range(1, 31, 5):
        pb["Hips"].location = (0, 0, -0.090)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Shin.L"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        # Cúi người trên bàn viết
        pb["Spine"].rotation_euler = (math.radians(-14), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (math.radians(-18), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (math.radians(28), 0, math.radians(-12))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(70), 0, math.radians(-25))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        stroke_x = math.sin(f * 0.8) * 0.08
        stroke_z = math.cos(f * 0.8) * 0.08
        pb["UpperArm.R"].rotation_euler = (math.radians(32), 0, math.radians(12))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(75) + stroke_x, 0, math.radians(25) + stroke_z)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 8. ACTION: SLEEP_DESK (Gục đầu lên bàn ngủ gật giờ ra chơi)
    # -------------------------------------------------------------------------
    sleep_act = bpy.data.actions.new("Action_Sleep_Desk")
    arm_obj.animation_data.action = sleep_act
    reset_pose_bones(pb)

    for f in [1, 20, 40]:
        bz = -0.090 if f != 20 else -0.093
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Shin.L"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        # Lưng gục sâu xuống bàn (negative X)
        pb["Spine"].rotation_euler = (math.radians(-34 if f != 20 else -32), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)

        # Đầu gối lên tay quay sang phải
        pb["Head"].rotation_euler = (math.radians(-25), math.radians(35), 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 0.08)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

        # Hai tay khoanh gập trên bàn
        pb["UpperArm.L"].rotation_euler = (math.radians(55), 0, math.radians(-15))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(85), 0, math.radians(-45))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (math.radians(55), 0, math.radians(15))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(85), 0, math.radians(45))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

    # -------------------------------------------------------------------------
    # 9. ACTION: RAISE_HAND (Giơ tay phát biểu bài)
    # -------------------------------------------------------------------------
    raise_hand = bpy.data.actions.new("Action_Raise_Hand")
    arm_obj.animation_data.action = raise_hand
    reset_pose_bones(pb)

    for f in [1, 20, 40]:
        pb["Hips"].location = (0, 0, -0.090)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (math.radians(82), 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Shin.L"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Spine"].rotation_euler = (math.radians(-2), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)

        pb["Head"].rotation_euler = (math.radians(10), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        # Tay trái đặt trên bàn
        pb["UpperArm.L"].rotation_euler = (math.radians(22), 0, math.radians(-8))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(60), 0, math.radians(-15))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        # Tay phải giơ cao vươn thẳng đứng lên trời
        pb["UpperArm.R"].rotation_euler = (math.radians(135), 0, math.radians(8))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(10), 0, 0)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 10. ACTION: CHEER (Ăn mừng chiến thắng vui sướng, hai tay giơ chữ V)
    # -------------------------------------------------------------------------
    cheer = bpy.data.actions.new("Action_Cheer")
    arm_obj.animation_data.action = cheer
    reset_pose_bones(pb)

    cheer_keys = [
        # Frame, Hips_Z, Arm_RotX, Arm_RotZ, Forearm_X, Head_X
        (1,   0.0,    math.radians(125), math.radians(25),  math.radians(25), math.radians(12)),
        (8,   0.028,  math.radians(135), math.radians(30),  math.radians(35), math.radians(16)),
        (15,  0.0,    math.radians(125), math.radians(25),  math.radians(25), math.radians(12)),
        (22,  0.028,  math.radians(135), math.radians(30),  math.radians(35), math.radians(16)),
        (30,  0.0,    math.radians(125), math.radians(25),  math.radians(25), math.radians(12)),
    ]
    for f, hz, ax, az, fa_x, hx in cheer_keys:
        pb["Hips"].location = (0, 0, hz)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (0, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Spine"].rotation_euler = (math.radians(6), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)

        pb["Head"].rotation_euler = (hx, 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (ax, 0, -az)
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (fa_x, 0, math.radians(-15))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (ax, 0, az)
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (fa_x, 0, math.radians(15))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 11. ACTION: TALK (Cử chỉ trò chuyện đối thoại sinh động)
    # -------------------------------------------------------------------------
    talk = bpy.data.actions.new("Action_Talk")
    arm_obj.animation_data.action = talk
    reset_pose_bones(pb)

    talk_keys = [
        # Frame, Head_Z, Head_Y, ArmL_X, ArmR_X, ForearmL, ForearmR
        (1,   0.0,               0.0,               math.radians(20), math.radians(28), math.radians(45), math.radians(65)),
        (10,  math.radians(6),   math.radians(5),   math.radians(25), math.radians(22), math.radians(55), math.radians(50)),
        (20,  math.radians(-5),  math.radians(-4),  math.radians(18), math.radians(35), math.radians(40), math.radians(72)),
        (30,  math.radians(4),   math.radians(3),   math.radians(24), math.radians(25), math.radians(50), math.radians(58)),
        (40,  0.0,               0.0,               math.radians(20), math.radians(28), math.radians(45), math.radians(65)),
    ]
    for f, hz, hy, al, ar, fl, fr in talk_keys:
        pb["Hips"].location = (0, 0, 0)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (0, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Head"].rotation_euler = (math.radians(-4), hy, hz)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (al, 0, math.radians(-10))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (fl, 0, math.radians(-15))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (ar, 0, math.radians(12))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (fr, 0, math.radians(20))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 12. ACTION: WAVE (Vẫy tay chào bạn bè/thầy cô trên sân trường)
    # -------------------------------------------------------------------------
    wave = bpy.data.actions.new("Action_Wave")
    arm_obj.animation_data.action = wave
    reset_pose_bones(pb)

    wave_keys = [
        # Frame, WaveArm_Z (lắc cẳng tay qua lại)
        (1,   math.radians(15)),
        (8,   math.radians(-25)),
        (15,  math.radians(20)),
        (22,  math.radians(-20)),
        (30,  math.radians(15)),
    ]
    for f, wz in wave_keys:
        pb["Hips"].location = (0, 0, 0)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (0, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Head"].rotation_euler = (0, math.radians(-6), 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (0, 0, math.radians(-6))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(15), 0, math.radians(6))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (math.radians(120), 0, math.radians(25))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(45), 0, wz)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 13. ACTION: BOW (Cúi đầu chào lễ phép thầy cô)
    # -------------------------------------------------------------------------
    bow = bpy.data.actions.new("Action_Bow")
    arm_obj.animation_data.action = bow
    reset_pose_bones(pb)

    bow_keys = [
        # Frame, Spine_X, Head_X (negative X = gập người về phía trước)
        (1,   0.0,                0.0),
        (10,  math.radians(-28),  math.radians(-12)),
        (18,  math.radians(-28),  math.radians(-12)),
        (28,  math.radians(-10),  math.radians(-4)),
        (35,  0.0,                0.0),
    ]
    for f, sp_x, hd_x in bow_keys:
        pb["Hips"].location = (0, 0, 0)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (0, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Spine"].rotation_euler = (sp_x, 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (hd_x, 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        # Hai tay khép sát đùi
        pb["UpperArm.L"].rotation_euler = (0, 0, math.radians(-3))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(10), 0, math.radians(-5))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (0, 0, math.radians(3))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(10), 0, math.radians(5))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 14. ACTION: SALUTE_FLAG (Chào cờ Đội viên TNTP)
    # -------------------------------------------------------------------------
    salute = bpy.data.actions.new("Action_Salute_Flag")
    arm_obj.animation_data.action = salute
    reset_pose_bones(pb)

    for f in [1, 15, 30]:
        pb["Hips"].location = (0, 0, 0)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (0, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        pb["Spine"].rotation_euler = (0, 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (math.radians(6), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        # Tay trái áp sát chỉ quần
        pb["UpperArm.L"].rotation_euler = (0, 0, math.radians(-4))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(5), 0, 0)
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        # Tay phải đặt trán chào cờ Đội
        pb["UpperArm.R"].rotation_euler = (math.radians(75), 0, math.radians(45))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(85), 0, math.radians(35))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 15. ACTION: THINKING (Chống cằm suy nghĩ bài toán khó)
    # -------------------------------------------------------------------------
    thinking = bpy.data.actions.new("Action_Thinking")
    arm_obj.animation_data.action = thinking
    reset_pose_bones(pb)

    for f, hd_y in [(1, math.radians(14)), (20, math.radians(18)), (40, math.radians(14))]:
        pb["Hips"].location = (0, 0, 0)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (0, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        # Đầu hơi ngước và nghiêng suy ngẫm
        pb["Head"].rotation_euler = (math.radians(6), hd_y, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        # Tay trái đỡ ngang bụng
        pb["UpperArm.L"].rotation_euler = (math.radians(15), 0, math.radians(-10))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(75), 0, math.radians(-45))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        # Tay phải chống cằm
        pb["UpperArm.R"].rotation_euler = (math.radians(45), 0, math.radians(15))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(95), 0, math.radians(25))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # -------------------------------------------------------------------------
    # 16. ACTION: SAD_DISAPPOINTED (Cúi gằm mặt buồn bã / thất vọng khi bị điểm kém)
    # -------------------------------------------------------------------------
    sad = bpy.data.actions.new("Action_Sad_Disappointed")
    arm_obj.animation_data.action = sad
    reset_pose_bones(pb)

    for f, bz in [(1, -0.010), (20, -0.014), (40, -0.010)]:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)

        pb["Thigh.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Shin.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Shin.R"].rotation_euler = (0, 0, 0)
        pb["Shin.R"].keyframe_insert("rotation_euler", frame=f)

        # Vai và lưng chùng cúi về trước (negative X)
        pb["Spine"].rotation_euler = (math.radians(-18), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)

        # Đầu gục xuống
        pb["Head"].rotation_euler = (math.radians(-24), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        # Hai tay buông thõng chán nản
        pb["UpperArm.L"].rotation_euler = (math.radians(12), 0, math.radians(-5))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(15), 0, 0)
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (math.radians(12), 0, math.radians(5))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(15), 0, 0)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        # Mắt cụp buồn
        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 0.45)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # Push tất cả 16 actions vào NLA Tracks
    all_actions = [
        idle, walk, run, jump, blink,
        sit, write, sleep_act, raise_hand, cheer,
        talk, wave, bow, salute, thinking, sad
    ]
    for act in all_actions:
        track = arm_obj.animation_data.nla_tracks.new()
        track.name = act.name
        track.strips.new(act.name, 1, act)

    arm_obj.animation_data.action = idle
    bpy.context.scene.frame_set(1)
    bpy.ops.object.mode_set(mode="OBJECT")
    log("Setup all 16 Actions and pushed to NLA tracks.")

    return {
        "idle": idle,
        "walk": walk,
        "run": run,
        "jump": jump,
        "blink": blink,
        "sit": sit,
        "write": write,
        "sleep": sleep_act,
        "raise_hand": raise_hand,
        "cheer": cheer,
        "talk": talk,
        "wave": wave,
        "bow": bow,
        "salute": salute,
        "thinking": thinking,
        "sad": sad,
    }

# =============================================================================
# STUDIO LIGHTING & PREVIEW RENDERS
# =============================================================================
def setup_studio():
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("Studio_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = hex_to_lin("#e8edf2")
        bg.inputs["Strength"].default_value = 0.85

    stage_col = bpy.data.collections.new("Studio_Stage")
    bpy.context.scene.collection.children.link(stage_col)

    # Podium
    bpy.ops.mesh.primitive_cylinder_add(radius=0.75, depth=0.03, location=(0, 0, 0.015), vertices=36)
    podium = bpy.context.active_object
    podium.name = "Podium"
    p_mat = bpy.data.materials.new("M_Podium")
    p_mat.use_nodes = True
    bsdf = p_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_lin("#ded8cd")
        bsdf.inputs["Roughness"].default_value = 0.8
    podium.data.materials.append(p_mat)
    stage_col.objects.link(podium)
    bpy.context.scene.collection.objects.unlink(podium)

    # Lights
    key_l = bpy.data.lights.new("Key", "SUN")
    key_l.energy = 4.2
    key_l.color = hex_to_lin("#fff9f0")[:3]
    key_obj = bpy.data.objects.new("Key", key_l)
    key_obj.rotation_euler = (math.radians(52), math.radians(22), math.radians(-32))
    stage_col.objects.link(key_obj)

    fill_l = bpy.data.lights.new("Fill", "SUN")
    fill_l.energy = 2.0
    fill_l.color = hex_to_lin("#dae8f8")[:3]
    fill_obj = bpy.data.objects.new("Fill", fill_l)
    fill_obj.rotation_euler = (math.radians(40), math.radians(-30), math.radians(145))
    stage_col.objects.link(fill_obj)

    rim_l = bpy.data.lights.new("Rim", "SUN")
    rim_l.energy = 2.6
    rim_l.color = hex_to_lin("#ffffff")[:3]
    rim_obj = bpy.data.objects.new("Rim", rim_l)
    rim_obj.rotation_euler = (math.radians(30), math.radians(15), math.radians(35))
    stage_col.objects.link(rim_obj)

    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    stage_col.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    return cam_obj

def render_all_previews(cam_obj, arm_obj, actions):
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1350
    scene.render.resolution_percentage = 100

    try:
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 14
        scene.cycles.use_denoising = True
        scene.cycles.device = "CPU"
    except:
        scene.render.engine = "BLENDER_EEVEE_NEXT"

    dist = 1.95
    target_z = 0.35

    # 1. BỘ 4 ẢNH TURNAROUND
    arm_obj.animation_data.action = actions["idle"]
    scene.frame_set(1)

    turnaround_views = [
        ("01_front.png",         (0.0, dist, target_z + 0.05),            (math.radians(88), 0, math.radians(180))),
        ("02_side.png",          (dist, 0.0, target_z + 0.05),            (math.radians(88), 0, math.radians(90))),
        ("03_back.png",          (0.0, -dist, target_z + 0.05),           (math.radians(88), 0, math.radians(0))),
        ("04_three_quarter.png", (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
    ]

    for fname, loc, rot in turnaround_views:
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        log(f"Rendering {fname}...")
        bpy.ops.render.render(write_still=True)
        log(f"Saved {out_path}")

    # 2. BỘ 15 ẢNH HOẠT CẢNH
    action_shots = [
        ("act_01_walk.png",             "walk",      8,  (dist * 0.72, dist * 0.72, target_z + 0.12), (math.radians(84), 0, math.radians(135))),
        ("act_02_run.png",              "run",       5,  (dist * 0.75, dist * 0.68, target_z + 0.10), (math.radians(84), 0, math.radians(132))),
        ("act_03_jump.png",             "jump",      16, (dist * 0.72, dist * 0.72, target_z + 0.18), (math.radians(82), 0, math.radians(135))),
        ("act_04_blink.png",            "blink",     7,  (0.0, 0.95, 0.52),                           (math.radians(90), 0, math.radians(180))),
        ("act_05_sit.png",              "sit",       1,  (dist * 0.70, dist * 0.70, target_z + 0.08), (math.radians(84), 0, math.radians(135))),
        ("act_06_write.png",            "write",     15, (dist * 0.65, dist * 0.70, target_z + 0.10), (math.radians(82), 0, math.radians(138))),
        ("act_07_sleep_desk.png",       "sleep",     20, (dist * 0.60, dist * 0.75, target_z + 0.14), (math.radians(80), 0, math.radians(142))),
        ("act_08_raise_hand.png",       "raise_hand",10, (dist * 0.68, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("act_09_cheer.png",            "cheer",     8,  (0.0, dist * 0.95, target_z + 0.12),         (math.radians(86), 0, math.radians(180))),
        ("act_10_talk.png",             "talk",      20, (dist * 0.55, dist * 0.80, target_z + 0.10), (math.radians(85), 0, math.radians(145))),
        ("act_11_wave.png",             "wave",      10, (dist * 0.65, dist * 0.75, target_z + 0.12), (math.radians(84), 0, math.radians(138))),
        ("act_12_bow.png",              "bow",       18, (dist * 0.72, dist * 0.72, target_z + 0.10), (math.radians(84), 0, math.radians(135))),
        ("act_13_salute_flag.png",      "salute",    10, (0.0, dist * 0.95, target_z + 0.10),         (math.radians(86), 0, math.radians(180))),
        ("act_14_thinking.png",         "thinking",  20, (dist * 0.68, dist * 0.72, target_z + 0.12), (math.radians(84), 0, math.radians(135))),
        ("act_15_sad_disappointed.png", "sad",       20, (dist * 0.70, dist * 0.70, target_z + 0.08), (math.radians(84), 0, math.radians(135))),
    ]

    for fname, act_key, frame, cam_pos, cam_rot in action_shots:
        arm_obj.animation_data.action = actions[act_key]
        scene.frame_set(frame)
        cam_obj.location = cam_pos
        cam_obj.rotation_euler = cam_rot
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        log(f"Rendering {fname} ({act_key} frame {frame})...")
        bpy.ops.render.render(write_still=True)
        log(f"Saved {fname}")

    arm_obj.animation_data.action = actions["idle"]
    scene.frame_set(1)

def main():
    log("Building character geometry with calibrated limbs...")
    parts = build_student()

    log("Building armature with calibrated vertex groups...")
    arm = build_armature(bpy.data.collections["Vietnamese_Student"], parts)

    log("Setting up all 16 calibrated animations...")
    actions = setup_animations(arm)

    log(f"Saving .blend: {OUTPUT_BLEND}")
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

    log(f"Exporting .glb: {OUTPUT_GLB}")
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    for p in parts:
        p.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_materials="EXPORT",
        export_animations=True,
        export_skins=True
    )
    log("GLB exported with all 16 calibrated animations.")

    log("Setting up studio and rendering previews...")
    cam = setup_studio()
    render_all_previews(cam, arm, actions)
    log("ALL 16 CALIBRATED ANIMATIONS AND PREVIEWS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
