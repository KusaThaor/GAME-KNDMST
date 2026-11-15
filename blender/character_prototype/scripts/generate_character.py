"""
=============================================================================
HÀNH TRÌNH THANH XUÂN — CHIBI STUDENT CHARACTER GENERATION SCRIPT (V4)
Character: Nam sinh Lớp 6 (Vietnamese Middle-School Student)
Art Direction: Cozy Stylized 3D / Toy-like / Semi-chibi / Organic Overlap
Target Platform: Three.js Web (GLTF/GLB) via Blender 4.5 LTS
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
    f.write("STARTING FINAL CHARACTER BUILD\n")

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

    # Stylized Matte PBR Materials
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
        "backpack": create_mat("M_Backpack", "#3668ad", roughness=0.55),
        "strap": create_mat("M_Strap", "#274f88", roughness=0.55),
        "nametag": create_mat("M_Nametag", "#cde4f7", roughness=0.5),
    }

    parts = []

    # =========================================================================
    # 1. HEAD & HAIRSTYLE & FACE (Center Z = 0.52m)
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

    # Ears (attached to sides of skull)
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

    # Hair Dome (hugs back and top of skull)
    hair_cap = add_mesh_obj(
        "Hair_Cap",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, -0.015, head_z + 0.02),
        (0.36, 0.34, 0.29),
        (0, 0, 0),
        mats["hair"], col, subdiv=2
    )
    parts.append(hair_cap)

    # Hair Bangs (classic Vietnamese schoolboy bowl-cut fringe)
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

    # Eyes & Highlights (embedded snugly into face curvature)
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
    # 2. TORSO, COLLAR & RED SCARF (Interpenetrating & seamless)
    # =========================================================================
    # Short Neck (hidden inside chin and collar)
    neck = add_mesh_obj(
        "Neck",
        lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.06, location=location),
        (0.0, 0.0, 0.41),
        (1.0, 1.0, 1.0),
        (0, 0, 0),
        mats["skin"], col, bevel=0.005
    )
    parts.append(neck)

    # Shirt Torso (Z = 0.32, spans 0.22 to 0.42 => directly connects with head!)
    torso = add_mesh_obj(
        "Shirt_Torso",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.0, 0.32),
        (0.23, 0.16, 0.22),
        (0, 0, 0),
        mats["shirt"], col, subdiv=2
    )
    parts.append(torso)

    # Shirt Collar Band
    collar = add_mesh_obj(
        "Shirt_Collar",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.015, 0.405),
        (0.18, 0.135, 0.035),
        (0, 0, 0),
        mats["shirt"], col, subdiv=1
    )
    parts.append(collar)

    # Red Scarf Knot (center chest right under chin)
    scarf_knot = add_mesh_obj(
        "Scarf_Knot",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.082, 0.38),
        (0.034, 0.024, 0.030),
        (0, 0, 0),
        mats["scarf"], col, subdiv=1
    )
    parts.append(scarf_knot)

    for side, sname in [(-1, "L"), (1, "R")]:
        tail = add_mesh_obj(
            f"Scarf_Tail_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * 0.018, 0.088, 0.33),
            (0.022, 0.012, 0.068),
            (math.radians(-12), 0, math.radians(side * -20)),
            mats["scarf"], col, subdiv=1
        )
        parts.append(tail)

    # Nametag (left chest)
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
    # 3. SHOULDERS, ARMS & HANDS
    # =========================================================================
    arm_x = 0.118
    arm_z = 0.34
    for side, sname in [(-1, "L"), (1, "R")]:
        # Puffed Sleeve attached to shoulder
        sleeve = add_mesh_obj(
            f"Sleeve_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * arm_x, 0.0, arm_z + 0.01),
            (0.075, 0.075, 0.075),
            (0, 0, math.radians(side * 8)),
            mats["shirt"], col, subdiv=1
        )
        parts.append(sleeve)

        # Arm cylinder extending down
        arm = add_mesh_obj(
            f"Arm_{sname}",
            lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=0.14, location=location),
            (side * (arm_x + 0.01), 0.01, arm_z - 0.07),
            (1.0, 1.0, 1.0),
            (math.radians(8), 0, math.radians(side * -5)),
            mats["skin"], col, bevel=0.006
        )
        parts.append(arm)

        # Cute hand mitten
        hand = add_mesh_obj(
            f"Hand_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * (arm_x + 0.016), 0.022, arm_z - 0.15),
            (0.044, 0.044, 0.046),
            (0, 0, 0),
            mats["skin"], col, subdiv=1
        )
        parts.append(hand)

    # =========================================================================
    # 4. BACKPACK & STRAPS
    # =========================================================================
    for side, sname in [(-1, "L"), (1, "R")]:
        strap = add_mesh_obj(
            f"Strap_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * 0.072, 0.070, 0.33),
            (0.020, 0.010, 0.15),
            (math.radians(-6), 0, 0),
            mats["strap"], col, bevel=0.003
        )
        parts.append(strap)

    backpack = add_mesh_obj(
        "Backpack",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, -0.105, 0.31),
        (0.165, 0.10, 0.17),
        (math.radians(4), 0, 0),
        mats["backpack"], col, subdiv=2
    )
    parts.append(backpack)

    # =========================================================================
    # 5. WAISTLINE, BELT, PANTS, LEGS & SNEAKERS
    # =========================================================================
    # Belt (curved band right around torso-pelvis seam)
    belt = add_mesh_obj(
        "Belt",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.0, 0.23),
        (0.195, 0.135, 0.035),
        (0, 0, 0),
        mats["belt"], col, subdiv=1
    )
    parts.append(belt)

    # Pants Pelvis (Z = 0.18, height 0.11 => reaches up to 0.235, completely overlapping torso!)
    pelvis = add_mesh_obj(
        "Pants_Pelvis",
        lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
        (0.0, 0.0, 0.18),
        (0.19, 0.135, 0.11),
        (0, 0, 0),
        mats["pants"], col, subdiv=2
    )
    parts.append(pelvis)

    # Legs & Shoes
    leg_x = 0.055
    for side, sname in [(-1, "L"), (1, "R")]:
        # Pant leg tube reaching from 0.05 to 0.17 (deep inside pelvis!)
        leg = add_mesh_obj(
            f"Leg_{sname}",
            lambda location: bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.12, location=location),
            (side * leg_x, 0.0, 0.11),
            (1.0, 1.0, 1.0),
            (0, 0, 0),
            mats["pants"], col, bevel=0.006
        )
        parts.append(leg)

        # Sneaker Upper (Z = 0.015 to 0.061)
        shoe = add_mesh_obj(
            f"Shoe_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * leg_x, 0.012, 0.038),
            (0.055, 0.082, 0.046),
            (0, 0, 0),
            mats["shoe"], col, subdiv=1
        )
        parts.append(shoe)

        # Flat Sole (Z = 0.00 to 0.016)
        sole = add_mesh_obj(
            f"Shoe_Sole_{sname}",
            lambda location: bpy.ops.mesh.primitive_cube_add(size=1.0, location=location),
            (side * leg_x, 0.012, 0.008),
            (0.058, 0.086, 0.016),
            (0, 0, 0),
            mats["sole"], col, bevel=0.002
        )
        parts.append(sole)

    log(f"Assembled {len(parts)} mesh parts.")
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
    hips.head = (0, 0, 0.22)
    hips.tail = (0, 0, 0.28)
    hips.parent = root

    spine = eb.new("Spine")
    spine.head = hips.tail
    spine.tail = (0, 0, 0.38)
    spine.parent = hips

    neck = eb.new("Neck")
    neck.head = spine.tail
    neck.tail = (0, 0, 0.44)
    neck.parent = spine

    head = eb.new("Head")
    head.head = neck.tail
    head.tail = (0, 0, 0.68)
    head.parent = neck

    for side, sname in [(-1, "L"), (1, "R")]:
        arm_up = eb.new(f"UpperArm.{sname}")
        arm_up.head = (side * 0.11, 0.0, 0.35)
        arm_up.tail = (side * 0.125, 0.01, 0.28)
        arm_up.parent = spine

        forearm = eb.new(f"Forearm.{sname}")
        forearm.head = arm_up.tail
        forearm.tail = (side * 0.135, 0.02, 0.22)
        forearm.parent = arm_up

        hand = eb.new(f"Hand.{sname}")
        hand.head = forearm.tail
        hand.tail = (side * 0.145, 0.025, 0.16)
        hand.parent = forearm

    for side, sname in [(-1, "L"), (1, "R")]:
        thigh = eb.new(f"Thigh.{sname}")
        thigh.head = (side * 0.055, 0.0, 0.20)
        thigh.tail = (side * 0.055, 0.0, 0.11)
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

    bone_map = {
        "Head": ["head", "hair", "ear", "eye", "blush", "mouth"],
        "Neck": ["neck", "collar", "scarf"],
        "Spine": ["torso", "strap", "backpack", "nametag"],
        "Hips": ["belt", "pelvis"],
        "UpperArm.L": ["sleeve_l", "arm_l"],
        "Hand.L": ["hand_l"],
        "UpperArm.R": ["sleeve_r", "arm_r"],
        "Hand.R": ["hand_r"],
        "Thigh.L": ["leg_l"],
        "Foot.L": ["shoe_l", "sole_l"],
        "Thigh.R": ["leg_r"],
        "Foot.R": ["shoe_r", "sole_r"],
    }

    for p in parts:
        mod = p.modifiers.new(name="Armature", type="ARMATURE")
        mod.object = arm_obj
        p_name = p.name.lower()
        assigned = "Hips"
        for b_name, kws in bone_map.items():
            if any(k in p_name for k in kws):
                assigned = b_name
                break
        vg = p.vertex_groups.new(name=assigned)
        vg.add(list(range(len(p.data.vertices))), 1.0, "REPLACE")

    log("Armature configured.")
    return arm_obj

# =============================================================================
# ANIMATIONS (Idle, Wave, Walk)
# =============================================================================
def setup_animations(arm_obj):
    if not arm_obj.animation_data:
        arm_obj.animation_data_create()

    # 1. Idle
    idle = bpy.data.actions.new("Action_Idle")
    arm_obj.animation_data.action = idle
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm_obj.pose.bones

    for f, bz, ht in [(1, 0.0, 0.0), (20, -0.006, 0.025), (40, 0.0, 0.0)]:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Head"].rotation_mode = "XYZ"
        pb["Head"].rotation_euler = (0, ht, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

    # 2. Wave
    wave = bpy.data.actions.new("Action_Wave")
    arm_obj.animation_data.action = wave
    for f in [1, 40]:
        pb["UpperArm.R"].rotation_mode = "XYZ"
        pb["UpperArm.R"].rotation_euler = (0, 0, 0)
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)

    pb["UpperArm.R"].rotation_euler = (math.radians(-45), 0, math.radians(100))
    pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=12)
    pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=32)

    for f, r in [(16, 0.22), (22, -0.22), (28, 0.22)]:
        pb["Forearm.R"].rotation_mode = "XYZ"
        pb["Forearm.R"].rotation_euler = (0, r, 0)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

    # 3. Walk
    walk = bpy.data.actions.new("Action_Walk")
    arm_obj.animation_data.action = walk
    walk_keys = [
        (1,  math.radians(18),  math.radians(-18), math.radians(-16), math.radians(16), 0.0),
        (8,  0.0,               0.0,               0.0,               0.0,              0.008),
        (15, math.radians(-18), math.radians(18),  math.radians(16),  math.radians(-16), 0.0),
        (22, 0.0,               0.0,               0.0,               0.0,              0.008),
        (30, math.radians(18),  math.radians(-18), math.radians(-16), math.radians(16), 0.0),
    ]
    for f, th_l, th_r, a_l, a_r, bz in walk_keys:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Thigh.L"].rotation_mode = "XYZ"
        pb["Thigh.L"].rotation_euler = (th_l, 0, 0)
        pb["Thigh.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Thigh.R"].rotation_mode = "XYZ"
        pb["Thigh.R"].rotation_euler = (th_r, 0, 0)
        pb["Thigh.R"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.L"].rotation_mode = "XYZ"
        pb["UpperArm.L"].rotation_euler = (a_l, 0, 0)
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.R"].rotation_mode = "XYZ"
        pb["UpperArm.R"].rotation_euler = (a_r, 0, 0)
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)

    # Keep Rest Pose for neutral rendering
    arm_obj.animation_data.action = idle
    bpy.context.scene.frame_set(1)
    bpy.ops.object.mode_set(mode="OBJECT")
    log("Animations configured.")

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

    # Studio Circular Podium
    bpy.ops.mesh.primitive_cylinder_add(radius=0.70, depth=0.03, location=(0, 0, 0.015), vertices=36)
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

    # Key, Fill, Rim
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

def render_views(cam_obj):
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1350
    scene.render.resolution_percentage = 100

    try:
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 32
        scene.cycles.device = "CPU"
    except:
        scene.render.engine = "BLENDER_EEVEE_NEXT"

    dist = 1.95
    target_z = 0.35

    views = [
        ("01_front.png",         (0.0, dist, target_z + 0.05),            (math.radians(88), 0, math.radians(180))),
        ("02_side.png",          (dist, 0.0, target_z + 0.05),            (math.radians(88), 0, math.radians(90))),
        ("03_back.png",          (0.0, -dist, target_z + 0.05),           (math.radians(88), 0, math.radians(0))),
        ("04_three_quarter.png", (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
    ]

    for fname, loc, rot in views:
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        log(f"Rendering {fname}...")
        bpy.ops.render.render(write_still=True)
        log(f"Saved {out_path}")

def main():
    log("Building character geometry...")
    parts = build_student()

    log("Building armature...")
    arm = build_armature(bpy.data.collections["Vietnamese_Student"], parts)

    log("Setting up animations...")
    setup_animations(arm)

    # Save .blend
    log(f"Saving .blend: {OUTPUT_BLEND}")
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

    # Export .glb
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
    log("GLB exported.")

    log("Rendering previews...")
    cam = setup_studio()
    render_views(cam)
    log("BUILD COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
