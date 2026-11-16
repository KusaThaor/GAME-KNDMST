"""
=============================================================================
HÀNH TRÌNH THANH XUÂN — SOFT STYLIZED CHIBI CHARACTER (V8 - SKINNED MESH + ARMATURE)
Option B Production Pipeline: Skinned Mesh + Articulated Humanoid Armature
Preserving 100% Visual Identity, Palette, Facial Features, Uniform & Proportions
Zero Joint Gaps, Smooth Volumetric Bending at Elbows, Knees, Waist & Shoulders
=============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
OUTPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_skinned.blend")
OUTPUT_GLB_SKINNED = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_skinned.glb")
OUTPUT_GLB_ACTIVE = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student.glb")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_skinned")
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "skinned_exec_log.txt")

for d in [os.path.dirname(OUTPUT_BLEND), os.path.dirname(OUTPUT_GLB_SKINNED), PREVIEWS_DIR]:
    os.makedirs(d, exist_ok=True)

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING OPTION B SKINNED MESH CHARACTER GENERATION (V8)\n")

# =============================================================================
# COLOR & MATERIAL UTILITIES
# =============================================================================
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
    col = bpy.data.collections.new("Vietnamese_Student_Skinned")
    bpy.context.scene.collection.children.link(col)
    return col

# =============================================================================
# PROCEDURAL BMESH HELPERS
# =============================================================================
def add_ring(bm, z, rx, ry, cx=0.0, cy=0.0, segs=12):
    ring = []
    for i in range(segs):
        theta = i * 2 * math.pi / segs
        x = cx + rx * math.cos(theta)
        y = cy + ry * math.sin(theta)
        v = bm.verts.new((x, y, z))
        ring.append(v)
    return ring

def bridge_rings(bm, r1, r2, mat_idx=0):
    segs = len(r1)
    faces = []
    for i in range(segs):
        i_next = (i + 1) % segs
        f = bm.faces.new((r1[i], r1[i_next], r2[i_next], r2[i]))
        f.material_index = mat_idx
        faces.append(f)
    return faces

def cap_ring(bm, ring, center_pt, mat_idx=0, reverse=False):
    c_v = bm.verts.new(center_pt)
    segs = len(ring)
    faces = []
    for i in range(segs):
        i_next = (i + 1) % segs
        if reverse:
            f = bm.faces.new((c_v, ring[i_next], ring[i]))
        else:
            f = bm.faces.new((c_v, ring[i], ring[i_next]))
        f.material_index = mat_idx
        faces.append(f)
    return faces

# =============================================================================
# 1. CONTINUOUS TORSO & LEGS GEOMETRY
# =============================================================================
def build_torso_and_legs(mats):
    bm = bmesh.new()

    # Material index mapping on this mesh:
    # 0: M_Shirt, 1: M_Belt, 2: M_Pants, 3: M_Shoe, 4: M_Sole, 5: M_Skin
    mat_shirt = 0
    mat_belt = 1
    mat_pants = 2
    mat_shoe = 3
    mat_sole = 4
    mat_skin = 5

    # -------------------------------------------------------------------------
    # A. TORSO & BELT (Rings: 16 segs)
    # -------------------------------------------------------------------------
    segs = 16
    r_neck       = add_ring(bm, 0.410, 0.065, 0.060, 0,  0.005, segs) # Neck opening
    r_chest_top  = add_ring(bm, 0.380, 0.118, 0.085, 0,  0.003, segs) # Upper chest
    r_chest_mid  = add_ring(bm, 0.340, 0.115, 0.082, 0,  0.000, segs) # Mid chest
    r_ribs       = add_ring(bm, 0.290, 0.106, 0.076, 0, -0.002, segs) # Lower ribs
    r_waist      = add_ring(bm, 0.250, 0.098, 0.072, 0, -0.002, segs) # Shirt tuck
    r_belt_top   = add_ring(bm, 0.245, 0.101, 0.075, 0, -0.002, segs) # Belt top
    r_belt_bot   = add_ring(bm, 0.225, 0.101, 0.075, 0, -0.002, segs) # Belt bottom
    r_pants_top  = add_ring(bm, 0.220, 0.098, 0.073, 0, -0.002, segs) # Pants waist
    r_pelvis_mid = add_ring(bm, 0.185, 0.104, 0.078, 0, -0.002, segs) # Pelvis fullness

    bridge_rings(bm, r_neck, r_chest_top, mat_shirt)
    bridge_rings(bm, r_chest_top, r_chest_mid, mat_shirt)
    bridge_rings(bm, r_chest_mid, r_ribs, mat_shirt)
    bridge_rings(bm, r_ribs, r_waist, mat_shirt)
    bridge_rings(bm, r_waist, r_belt_top, mat_belt)
    bridge_rings(bm, r_belt_top, r_belt_bot, mat_belt)
    bridge_rings(bm, r_belt_bot, r_pants_top, mat_pants)
    bridge_rings(bm, r_pants_top, r_pelvis_mid, mat_pants)

    # -------------------------------------------------------------------------
    # B. CROTCH & LEGS TRANSITION
    # -------------------------------------------------------------------------
    # Each leg uses 8 segments per ring
    lsegs = 8
    # Crotch bridge at Z=0.160
    r_pelvis_bot = add_ring(bm, 0.160, 0.098, 0.072, 0, -0.002, segs)
    bridge_rings(bm, r_pelvis_mid, r_pelvis_bot, mat_pants)

    # For Left (-X) and Right (+X) Legs:
    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055

        # Thigh rings
        r_thigh_top = add_ring(bm, 0.160, 0.040, 0.040, cx, 0, lsegs)
        r_thigh_mid = add_ring(bm, 0.135, 0.038, 0.038, cx, 0, lsegs)

        # 3 KNEE LOOPS across joint pivot (Z = 0.115)
        r_knee_1    = add_ring(bm, 0.125, 0.037, 0.037, cx, 0.002, lsegs)
        r_knee_2    = add_ring(bm, 0.115, 0.0365, 0.0365, cx, 0.004, lsegs) # KNEE PIVOT
        r_knee_3    = add_ring(bm, 0.105, 0.036, 0.036, cx, 0.002, lsegs)

        # Shin & Ankle rings
        r_shin_mid  = add_ring(bm, 0.075, 0.035, 0.035, cx, 0, lsegs)
        r_ankle     = add_ring(bm, 0.040, 0.036, 0.036, cx, 0, lsegs)

        bridge_rings(bm, r_thigh_top, r_thigh_mid, mat_pants)
        bridge_rings(bm, r_thigh_mid, r_knee_1, mat_pants)
        bridge_rings(bm, r_knee_1, r_knee_2, mat_pants)
        bridge_rings(bm, r_knee_2, r_knee_3, mat_pants)
        bridge_rings(bm, r_knee_3, r_shin_mid, mat_pants)
        bridge_rings(bm, r_shin_mid, r_ankle, mat_pants)

        # ---------------------------------------------------------------------
        # C. BATA SNEAKERS & SOLES (Continuous with Ankle)
        # ---------------------------------------------------------------------
        r_shoe_top  = add_ring(bm, 0.035, 0.038, 0.042, cx, 0.006, lsegs)
        r_shoe_mid  = add_ring(bm, 0.022, 0.042, 0.056, cx, 0.016, lsegs)
        r_shoe_bot  = add_ring(bm, 0.012, 0.044, 0.058, cx, 0.016, lsegs)
        r_sole_bot  = add_ring(bm, 0.000, 0.045, 0.060, cx, 0.016, lsegs)

        bridge_rings(bm, r_ankle, r_shoe_top, mat_shoe)
        bridge_rings(bm, r_shoe_top, r_shoe_mid, mat_shoe)
        bridge_rings(bm, r_shoe_mid, r_shoe_bot, mat_shoe)
        bridge_rings(bm, r_shoe_bot, r_sole_bot, mat_sole)

        # Flat rubber bottom cap at Z=0
        cap_ring(bm, r_sole_bot, (cx, 0.016, 0.000), mat_sole, reverse=True)

    # Bridge pelvis bottom to thigh tops cleanly
    # (Left 8 verts to left thigh top, right 8 verts to right thigh top, plus crotch center)
    p_bot = r_pelvis_bot
    # Close pelvis bottom with center bridge
    crotch_center = bm.verts.new((0.0, -0.002, 0.155))
    for i in range(segs):
        i_next = (i + 1) % segs
        f = bm.faces.new((p_bot[i], p_bot[i_next], crotch_center))
        f.material_index = mat_pants

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new("TorsoLegsMesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Character_Torso_Legs", mesh)
    obj.data.materials.append(mats["shirt"]) # 0
    obj.data.materials.append(mats["belt"])  # 1
    obj.data.materials.append(mats["pants"]) # 2
    obj.data.materials.append(mats["shoe"])  # 3
    obj.data.materials.append(mats["sole"])  # 4
    obj.data.materials.append(mats["skin"])  # 5
    bpy.ops.object.shade_smooth()

    return obj

# =============================================================================
# 2. CONTINUOUS ARMS & CHIBI HANDS WITH THUMB
# =============================================================================
def build_arm(side, sign, mats):
    bm = bmesh.new()
    mat_shirt = 0
    mat_skin = 1

    segs = 10
    cx = side * 0.118

    # Short sleeve (White Shirt)
    r_shoulder  = add_ring(bm, 0.365, 0.046, 0.046, cx, 0.004, segs)
    r_sleeve_mid= add_ring(bm, 0.335, 0.045, 0.045, cx + side * 0.003, 0.005, segs)
    r_sleeve_cuff=add_ring(bm, 0.310, 0.042, 0.042, cx + side * 0.006, 0.006, segs)

    bridge_rings(bm, r_shoulder, r_sleeve_mid, mat_shirt)
    bridge_rings(bm, r_sleeve_mid, r_sleeve_cuff, mat_shirt)

    # Skin Arm emerging inside sleeve cuff
    r_arm_top   = add_ring(bm, 0.308, 0.031, 0.031, cx + side * 0.006, 0.006, segs)
    # 3 ELBOW LOOPS across joint pivot (Z = 0.280)
    r_elbow_1   = add_ring(bm, 0.292, 0.0305, 0.0305, cx + side * 0.008, 0.007, segs)
    r_elbow_2   = add_ring(bm, 0.280, 0.0300, 0.0300, cx + side * 0.010, 0.008, segs) # ELBOW PIVOT
    r_elbow_3   = add_ring(bm, 0.268, 0.0295, 0.0295, cx + side * 0.012, 0.009, segs)

    # Forearm & Wrist
    r_fore_mid  = add_ring(bm, 0.240, 0.0285, 0.0285, cx + side * 0.014, 0.011, segs)
    r_wrist     = add_ring(bm, 0.210, 0.0270, 0.0270, cx + side * 0.016, 0.013, segs)

    # Bridge sleeve cuff to arm top (cuff hem interior)
    bridge_rings(bm, r_sleeve_cuff, r_arm_top, mat_shirt)
    bridge_rings(bm, r_arm_top, r_elbow_1, mat_skin)
    bridge_rings(bm, r_elbow_1, r_elbow_2, mat_skin)
    bridge_rings(bm, r_elbow_2, r_elbow_3, mat_skin)
    bridge_rings(bm, r_elbow_3, r_fore_mid, mat_skin)
    bridge_rings(bm, r_fore_mid, r_wrist, mat_skin)

    # Rounded Chibi Hand mitt with thumb
    # Palm
    r_palm_top  = add_ring(bm, 0.190, 0.030, 0.026, cx + side * 0.018, 0.015, segs)
    r_palm_mid  = add_ring(bm, 0.170, 0.032, 0.027, cx + side * 0.019, 0.016, segs)
    r_palm_bot  = add_ring(bm, 0.152, 0.026, 0.022, cx + side * 0.019, 0.016, segs)

    bridge_rings(bm, r_wrist, r_palm_top, mat_skin)
    bridge_rings(bm, r_palm_top, r_palm_mid, mat_skin)
    bridge_rings(bm, r_palm_mid, r_palm_bot, mat_skin)

    # Rounded fingertip mitt cap
    mitt_tip = (cx + side * 0.019, 0.016, 0.142)
    cap_ring(bm, r_palm_bot, mitt_tip, mat_skin, reverse=True)

    # Stylized Thumb (branches inward towards body and forward)
    thumb_base_x = cx + side * 0.006
    thumb_base_y = 0.024
    thumb_base_z = 0.180
    thumb_tip_x = cx + side * 0.002
    thumb_tip_y = 0.036
    thumb_tip_z = 0.165

    t_ring_1 = add_ring(bm, thumb_base_z, 0.011, 0.011, thumb_base_x, thumb_base_y, 6)
    t_ring_2 = add_ring(bm, (thumb_base_z + thumb_tip_z)*0.5, 0.010, 0.010, (thumb_base_x+thumb_tip_x)*0.5, (thumb_base_y+thumb_tip_y)*0.5, 6)
    t_ring_3 = add_ring(bm, thumb_tip_z, 0.008, 0.008, thumb_tip_x, thumb_tip_y, 6)

    bridge_rings(bm, t_ring_1, t_ring_2, mat_skin)
    bridge_rings(bm, t_ring_2, t_ring_3, mat_skin)
    cap_ring(bm, t_ring_3, (thumb_tip_x, thumb_tip_y + 0.005, thumb_tip_z - 0.004), mat_skin, reverse=True)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"ArmMesh_{sign}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(f"Character_Arm_{sign}", mesh)
    obj.data.materials.append(mats["shirt"]) # 0
    obj.data.materials.append(mats["skin"])  # 1
    bpy.ops.object.shade_smooth()

    return obj

# =============================================================================
# 3. SOFT CHIBI HEAD, EARS & DETAILS
# =============================================================================
def build_head(mats, col):
    head_z = 0.52
    bm = bmesh.new()

    # Soft rounded chibi head geometry with neck column
    # Neck from 0.40 to 0.44
    r_neck_bot = add_ring(bm, 0.400, 0.062, 0.060, 0, 0.005, 12)
    r_neck_mid = add_ring(bm, 0.425, 0.065, 0.062, 0, 0.005, 12)
    r_neck_top = add_ring(bm, 0.445, 0.075, 0.070, 0, 0.005, 12)

    bridge_rings(bm, r_neck_bot, r_neck_mid, 0)
    bridge_rings(bm, r_neck_mid, r_neck_top, 0)

    # Head rings (width 0.34, depth 0.32, height 0.28)
    hsegs = 16
    r_jaw    = add_ring(bm, 0.455, 0.130, 0.125, 0, 0.005, hsegs)
    r_cheek  = add_ring(bm, 0.485, 0.165, 0.155, 0, 0.005, hsegs)
    r_eye    = add_ring(bm, 0.520, 0.170, 0.160, 0, 0.000, hsegs)
    r_brow   = add_ring(bm, 0.570, 0.165, 0.155, 0, -0.005, hsegs)
    r_crown  = add_ring(bm, 0.620, 0.145, 0.135, 0, -0.010, hsegs)
    r_top    = add_ring(bm, 0.655, 0.095, 0.085, 0, -0.012, hsegs)

    bridge_rings(bm, r_neck_top, r_jaw, 0)
    bridge_rings(bm, r_jaw, r_cheek, 0)
    bridge_rings(bm, r_cheek, r_eye, 0)
    bridge_rings(bm, r_eye, r_brow, 0)
    bridge_rings(bm, r_brow, r_crown, 0)
    bridge_rings(bm, r_crown, r_top, 0)

    cap_ring(bm, r_top, (0.0, -0.012, 0.665), 0, reverse=False)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("HeadMesh")
    bm.to_mesh(mesh)
    bm.free()

    head_obj = bpy.data.objects.new("Character_Head", mesh)
    head_obj.data.materials.append(mats["skin"])
    col.objects.link(head_obj)
    bpy.ops.object.shade_smooth()

    # Ears (soft rounded chibi ears with stylized inner contour)
    ears = []
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.162, -0.01, head_z - 0.01))
        ear = bpy.context.active_object
        ear.name = f"Ear_{sign}"
        ear.scale = (0.028, 0.046, 0.054)
        ear.rotation_euler = (0, math.radians(side * -10), math.radians(side * 12))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = ear.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        ear.data.materials.append(mats["skin"])
        bpy.ops.object.shade_smooth()
        col.objects.link(ear)
        bpy.context.scene.collection.objects.unlink(ear)
        ears.append(ear)

    return head_obj, ears

# =============================================================================
# 4. LAYERED STYLIZED HAIR CLUMPS
# =============================================================================
def build_layered_hair(mats, col):
    head_z = 0.52
    hair_objs = []

    # A. Hair Base Dome (Mushroom/Bowl cut silhouette)
    bm = bmesh.new()
    hsegs = 16
    r_h1 = add_ring(bm, 0.510, 0.180, 0.170, 0, -0.012, hsegs)
    r_h2 = add_ring(bm, 0.550, 0.182, 0.172, 0, -0.014, hsegs)
    r_h3 = add_ring(bm, 0.600, 0.175, 0.165, 0, -0.016, hsegs)
    r_h4 = add_ring(bm, 0.645, 0.150, 0.140, 0, -0.018, hsegs)
    r_h5 = add_ring(bm, 0.675, 0.100, 0.090, 0, -0.020, hsegs)

    bridge_rings(bm, r_h1, r_h2, 0)
    bridge_rings(bm, r_h2, r_h3, 0)
    bridge_rings(bm, r_h3, r_h4, 0)
    bridge_rings(bm, r_h4, r_h5, 0)
    cap_ring(bm, r_h5, (0.0, -0.020, 0.688), 0, reverse=False)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    h_mesh = bpy.data.meshes.new("HairBaseMesh")
    bm.to_mesh(h_mesh)
    bm.free()

    hair_cap = bpy.data.objects.new("Hair_Base", h_mesh)
    hair_cap.data.materials.append(mats["hair"])
    col.objects.link(hair_cap)
    bpy.ops.object.shade_smooth()
    hair_objs.append(hair_cap)

    # B. Layered Front Bangs (3 stylized curved clumps)
    bang_specs = [
        ("Hair_Bangs_Center", (0.005,  0.165, head_z + 0.055), (0.125, 0.045, 0.085), (-14, 0, -4)),
        ("Hair_Bangs_Left",   (-0.085, 0.158, head_z + 0.060), (0.095, 0.042, 0.078), (-16, 0, 12)),
        ("Hair_Bangs_Right",  (0.090,  0.158, head_z + 0.058), (0.095, 0.042, 0.078), (-16, 0, -15)),
    ]
    for bname, loc, sc, rot in bang_specs:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        b_obj = bpy.context.active_object
        b_obj.name = bname
        b_obj.scale = sc
        b_obj.rotation_euler = (math.radians(rot[0]), math.radians(rot[1]), math.radians(rot[2]))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = b_obj.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        b_obj.data.materials.append(mats["hair"])
        bpy.ops.object.shade_smooth()
        col.objects.link(b_obj)
        bpy.context.scene.collection.objects.unlink(b_obj)
        hair_objs.append(b_obj)

    # C. Sideburns (Left & Right curved locks framing cheeks)
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.165, 0.035, head_z + 0.005))
        burn = bpy.context.active_object
        burn.name = f"Hair_Sideburn_{sign}"
        burn.scale = (0.030, 0.065, 0.095)
        burn.rotation_euler = (math.radians(-12), 0, math.radians(side * -8))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = burn.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        burn.data.materials.append(mats["hair"])
        bpy.ops.object.shade_smooth()
        col.objects.link(burn)
        bpy.context.scene.collection.objects.unlink(burn)
        hair_objs.append(burn)

    return hair_objs

# =============================================================================
# 5. FACIAL FEATURES & SCHOOL UNIFORM ACCESSORIES
# =============================================================================
def build_face_and_accessories(mats, col):
    head_z = 0.52
    eye_x = 0.065
    eye_z = 0.518

    face_objs = {}

    # 1. Stylized Chibi Button Nose
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.162, 0.495))
    nose = bpy.context.active_object
    nose.name = "Nose"
    nose.scale = (0.014, 0.010, 0.014)
    nose.rotation_euler = (math.radians(-15), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = nose.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    nose.data.materials.append(mats["skin"])
    col.objects.link(nose)
    bpy.context.scene.collection.objects.unlink(nose)
    face_objs["Nose"] = nose

    # 2. Expressive Chibi Eyebrows
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.065, 0.146, 0.555))
        brow = bpy.context.active_object
        brow.name = f"Eyebrow_{sign}"
        brow.scale = (0.038, 0.008, 0.008)
        brow.rotation_euler = (math.radians(-14), 0, math.radians(side * -10))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = brow.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        brow.data.materials.append(mats["hair"])
        col.objects.link(brow)
        bpy.context.scene.collection.objects.unlink(brow)
        face_objs[f"Eyebrow_{sign}"] = brow

    # 3. Big Sparkling Chibi Eyes & Highlights
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * eye_x, 0.150, eye_z))
        eye = bpy.context.active_object
        eye.name = f"Eye_{sign}"
        eye.scale = (0.040, 0.010, 0.052)
        eye.rotation_euler = (math.radians(-10), 0, math.radians(side * -4))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = eye.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        eye.data.materials.append(mats["eye_black"])
        col.objects.link(eye)
        bpy.context.scene.collection.objects.unlink(eye)
        face_objs[f"Eye_{sign}"] = eye

        # Primary Sparkling Highlight (Top-left of pupil)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * (eye_x - side * 0.008), 0.156, eye_z + 0.012))
        hl1 = bpy.context.active_object
        hl1.name = f"Eye_HL1_{sign}"
        hl1.scale = (0.014, 0.006, 0.015)
        hl1.rotation_euler = (math.radians(-10), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = hl1.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        hl1.data.materials.append(mats["eye_hl"])
        col.objects.link(hl1)
        bpy.context.scene.collection.objects.unlink(hl1)
        face_objs[f"Eye_HL1_{sign}"] = hl1

        # Secondary Twinkle Highlight (Bottom-right of pupil)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * (eye_x + side * 0.008), 0.156, eye_z - 0.012))
        hl2 = bpy.context.active_object
        hl2.name = f"Eye_HL2_{sign}"
        hl2.scale = (0.008, 0.005, 0.008)
        hl2.rotation_euler = (math.radians(-10), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = hl2.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        hl2.data.materials.append(mats["eye_hl"])
        col.objects.link(hl2)
        bpy.context.scene.collection.objects.unlink(hl2)
        face_objs[f"Eye_HL2_{sign}"] = hl2

        # Cheek Blush
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.118, 0.118, 0.485))
        blush = bpy.context.active_object
        blush.name = f"Blush_{sign}"
        blush.scale = (0.044, 0.008, 0.020)
        blush.rotation_euler = (math.radians(-14), 0, math.radians(side * -15))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = blush.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        blush.data.materials.append(mats["blush"])
        col.objects.link(blush)
        bpy.context.scene.collection.objects.unlink(blush)
        face_objs[f"Blush_{sign}"] = blush

    # 4. Cheerful Smile Mouth
    bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=0.036, location=(0.0, 0.156, 0.465))
    mouth = bpy.context.active_object
    mouth.name = "Mouth"
    mouth.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    mouth.data.materials.append(mats["mouth"])
    col.objects.link(mouth)
    bpy.context.scene.collection.objects.unlink(mouth)
    face_objs["Mouth"] = mouth

    # Shirt Collar
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.015, 0.405))
    collar = bpy.context.active_object
    collar.name = "Shirt_Collar"
    collar.scale = (0.18, 0.135, 0.035)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = collar.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    collar.data.materials.append(mats["shirt"])
    col.objects.link(collar)
    bpy.context.scene.collection.objects.unlink(collar)
    face_objs["Shirt_Collar"] = collar

    # Red Pioneer Scarf Knot & Tails
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.084, 0.380))
    scarf_knot = bpy.context.active_object
    scarf_knot.name = "Scarf_Knot"
    scarf_knot.scale = (0.038, 0.026, 0.034)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = scarf_knot.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    scarf_knot.data.materials.append(mats["scarf"])
    col.objects.link(scarf_knot)
    bpy.context.scene.collection.objects.unlink(scarf_knot)
    face_objs["Scarf_Knot"] = scarf_knot

    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.012, 0.084, 0.345))
        tail = bpy.context.active_object
        tail.name = f"Scarf_Tail_{sign}"
        tail.scale = (0.022, 0.014, 0.076)
        tail.rotation_euler = (math.radians(-12), 0, math.radians(side * -18))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = tail.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        tail.data.materials.append(mats["scarf"])
        col.objects.link(tail)
        bpy.context.scene.collection.objects.unlink(tail)
        face_objs[f"Scarf_Tail_{sign}"] = tail

    # School Nametag Badge
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.062, 0.080, 0.340))
    nametag = bpy.context.active_object
    nametag.name = "Nametag"
    nametag.scale = (0.030, 0.005, 0.015)
    nametag.rotation_euler = (math.radians(-8), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    b = nametag.modifiers.new("Bevel", "BEVEL")
    b.width = 0.002
    nametag.data.materials.append(mats["nametag"])
    col.objects.link(nametag)
    bpy.context.scene.collection.objects.unlink(nametag)
    face_objs["Nametag"] = nametag

    # Belt Buckle Accent
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.078, 0.235))
    buckle = bpy.context.active_object
    buckle.name = "Belt_Buckle"
    buckle.scale = (0.024, 0.005, 0.018)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    b = buckle.modifiers.new("Bevel", "BEVEL")
    b.width = 0.002
    buckle.data.materials.append(mats["belt"])
    col.objects.link(buckle)
    bpy.context.scene.collection.objects.unlink(buckle)
    face_objs["Belt_Buckle"] = buckle

    return face_objs

# =============================================================================
# 6. HUMANOID CHIBI ARMATURE WITH CHEST BONE
# =============================================================================
def build_humanoid_armature(col):
    arm_data = bpy.data.armatures.new("Student_Armature_Data")
    arm_obj = bpy.data.objects.new("Student_Armature", arm_data)
    col.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj

    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm_data.edit_bones

    # Central spine chain
    root = eb.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 0.08)

    hips = eb.new("Hips")
    hips.head = (0, 0, 0.19)
    hips.tail = (0, 0, 0.25)
    hips.parent = root

    spine = eb.new("Spine")
    spine.head = hips.tail
    spine.tail = (0, 0, 0.33)
    spine.parent = hips

    chest = eb.new("Chest") # REQUIRED CHEST BONE
    chest.head = spine.tail
    chest.tail = (0, 0, 0.40)
    chest.parent = spine

    neck = eb.new("Neck")
    neck.head = chest.tail
    neck.tail = (0, 0, 0.44)
    neck.parent = chest

    head = eb.new("Head")
    head.head = neck.tail
    head.tail = (0, 0, 0.68)
    head.parent = neck

    # Eye bones for blinking / facial animation
    for side, sign in [(-1, "L"), (1, "R")]:
        eye_b = eb.new(f"Eye.{sign}")
        eye_b.head = (side * 0.065, 0.150, 0.518)
        eye_b.tail = (side * 0.065, 0.165, 0.518)
        eye_b.parent = head

    # Arms (parented to Chest for natural shoulder deformation)
    for side, sign in [(-1, "L"), (1, "R")]:
        arm_up = eb.new(f"UpperArm.{sign}")
        arm_up.head = (side * 0.115, 0.005, 0.36)
        arm_up.tail = (side * 0.125, 0.008, 0.28)
        arm_up.parent = chest

        forearm = eb.new(f"Forearm.{sign}")
        forearm.head = arm_up.tail
        forearm.tail = (side * 0.135, 0.012, 0.21)
        forearm.parent = arm_up

        hand = eb.new(f"Hand.{sign}")
        hand.head = forearm.tail
        hand.tail = (side * 0.142, 0.016, 0.14)
        hand.parent = forearm

    # Legs (parented to Hips)
    for side, sign in [(-1, "L"), (1, "R")]:
        thigh = eb.new(f"Thigh.{sign}")
        thigh.head = (side * 0.055, 0.0, 0.19)
        thigh.tail = (side * 0.055, 0.0, 0.115)
        thigh.parent = hips

        shin = eb.new(f"Shin.{sign}")
        shin.head = thigh.tail
        shin.tail = (side * 0.055, 0.0, 0.04)
        shin.parent = thigh

        foot = eb.new(f"Foot.{sign}")
        foot.head = shin.tail
        foot.tail = (side * 0.055, 0.06, 0.01)
        foot.parent = shin

    bpy.ops.object.mode_set(mode="OBJECT")
    log("Humanoid Armature created with Chest bone and standard 19-bone hierarchy.")
    return arm_obj

# =============================================================================
# 7. SMOOTH WEIGHT SKINNING
# =============================================================================
def skin_body_mesh(body_obj, arm_obj):
    mod = body_obj.modifiers.new("Armature", "ARMATURE")
    mod.object = arm_obj

    # Create vertex groups for all bones
    vgs = {}
    bone_names = [
        "Root", "Hips", "Spine", "Chest", "Neck", "Head",
        "UpperArm.L", "Forearm.L", "Hand.L",
        "UpperArm.R", "Forearm.R", "Hand.R",
        "Thigh.L", "Shin.L", "Foot.L",
        "Thigh.R", "Shin.R", "Foot.R"
    ]
    for b in bone_names:
        vgs[b] = body_obj.vertex_groups.new(name=b)

    for v in body_obj.data.vertices:
        x, y, z = v.co.x, v.co.y, v.co.z

        # 1. Torso & Upper Chest
        if z >= 0.39:
            # Neck transition
            t = min(1.0, max(0.0, (z - 0.39) / 0.05))
            vgs["Neck"].add([v.index], t * 0.75, "REPLACE")
            vgs["Chest"].add([v.index], 1.0 - t * 0.75, "REPLACE")
        elif z >= 0.33:
            # Chest & Ribs
            t = (z - 0.33) / 0.06
            vgs["Chest"].add([v.index], 0.35 + 0.65 * t, "REPLACE")
            vgs["Spine"].add([v.index], 0.65 - 0.65 * t, "REPLACE")
        elif z >= 0.25:
            # Mid torso to waist
            t = (z - 0.25) / 0.08
            vgs["Chest"].add([v.index], 0.35 * t, "REPLACE")
            vgs["Spine"].add([v.index], 1.0 - 0.35 * t, "REPLACE")
        elif z >= 0.215:
            # WAIST / BELT FLEX REGION (50% Spine, 50% Hips bridge)
            t = (z - 0.215) / 0.035
            w_spine = 0.25 + 0.50 * t
            vgs["Spine"].add([v.index], w_spine, "REPLACE")
            vgs["Hips"].add([v.index], 1.0 - w_spine, "REPLACE")
        elif z >= 0.165:
            # Pelvis / Shorts seat
            if z >= 0.185:
                vgs["Hips"].add([v.index], 1.0, "REPLACE")
            else:
                t = (z - 0.165) / 0.020
                w_hips = 0.50 + 0.50 * t
                w_thigh = 1.0 - w_hips
                vgs["Hips"].add([v.index], w_hips, "REPLACE")
                side = "L" if x < 0 else "R"
                vgs[f"Thigh.{side}"].add([v.index], w_thigh, "REPLACE")
        else:
            # Legs & Shoes
            side = "L" if x < 0 else "R"
            if z > 0.130:
                vgs[f"Thigh.{side}"].add([v.index], 1.0, "REPLACE")
            elif z >= 0.100:
                # KNEE JOINT SMOOTH TRANSITION (0.100 to 0.130)
                t = (z - 0.100) / 0.030
                vgs[f"Thigh.{side}"].add([v.index], t, "REPLACE")
                vgs[f"Shin.{side}"].add([v.index], 1.0 - t, "REPLACE")
            elif z > 0.045:
                vgs[f"Shin.{side}"].add([v.index], 1.0, "REPLACE")
            elif z >= 0.035:
                # ANKLE TRANSITION (0.035 to 0.045)
                t = (z - 0.035) / 0.010
                vgs[f"Shin.{side}"].add([v.index], t, "REPLACE")
                vgs[f"Foot.{side}"].add([v.index], 1.0 - t, "REPLACE")
            else:
                # Shoe & Sole
                vgs[f"Foot.{side}"].add([v.index], 1.0, "REPLACE")

    log("Body mesh skinned with smooth waist, knee, and ankle weight gradients.")

def skin_arm_mesh(arm_obj_mesh, arm_rig, sign):
    mod = arm_obj_mesh.modifiers.new("Armature", "ARMATURE")
    mod.object = arm_rig

    vg_chest = arm_obj_mesh.vertex_groups.new(name="Chest")
    vg_up = arm_obj_mesh.vertex_groups.new(name=f"UpperArm.{sign}")
    vg_fore = arm_obj_mesh.vertex_groups.new(name=f"Forearm.{sign}")
    vg_hand = arm_obj_mesh.vertex_groups.new(name=f"Hand.{sign}")

    for v in arm_obj_mesh.data.vertices:
        z = v.co.z
        if z >= 0.340:
            # Shoulder transition to chest
            t = min(1.0, max(0.0, (z - 0.340) / 0.030))
            vg_chest.add([v.index], t * 0.45, "REPLACE")
            vg_up.add([v.index], 1.0 - t * 0.45, "REPLACE")
        elif z > 0.295:
            # Bicep / upper arm
            vg_up.add([v.index], 1.0, "REPLACE")
        elif z >= 0.265:
            # ELBOW JOINT SMOOTH TRANSITION (0.265 to 0.295)
            t = (z - 0.265) / 0.030
            vg_up.add([v.index], t, "REPLACE")
            vg_fore.add([v.index], 1.0 - t, "REPLACE")
        elif z > 0.215:
            # Forearm
            vg_fore.add([v.index], 1.0, "REPLACE")
        elif z >= 0.195:
            # Wrist transition
            t = (z - 0.195) / 0.020
            vg_fore.add([v.index], t, "REPLACE")
            vg_hand.add([v.index], 1.0 - t, "REPLACE")
        else:
            # Hand mitt & thumb
            vg_hand.add([v.index], 1.0, "REPLACE")

    log(f"Arm {sign} skinned with smooth shoulder, elbow, and wrist gradients.")

def skin_accessory(obj, arm_rig, bone_name, secondary_bone=None, sec_weight=0.0):
    mod = obj.modifiers.new("Armature", "ARMATURE")
    mod.object = arm_rig

    vg = obj.vertex_groups.new(name=bone_name)
    vg.add(list(range(len(obj.data.vertices))), 1.0 - sec_weight, "REPLACE")

    if secondary_bone and sec_weight > 0.0:
        vg2 = obj.vertex_groups.new(name=secondary_bone)
        vg2.add(list(range(len(obj.data.vertices))), sec_weight, "REPLACE")

# =============================================================================
# 8. ANIMATION UTILITIES & 16 NARRATIVE ACTIONS
# =============================================================================
def reset_pose_bones(pb):
    for b in pb:
        b.location = (0, 0, 0)
        b.rotation_mode = "XYZ"
        b.rotation_euler = (0, 0, 0)
        b.scale = (1, 1, 1)

def setup_all_animations(arm_obj):
    if not arm_obj.animation_data:
        arm_obj.animation_data_create()

    bpy.context.view_layer.objects.active = arm_obj
    pb = arm_obj.pose.bones

    # 1. Action_Idle
    act_idle = bpy.data.actions.new("Action_Idle")
    arm_obj.animation_data.action = act_idle
    bpy.ops.object.mode_set(mode="POSE")
    reset_pose_bones(pb)

    for f, bz, sp_x, ch_x, ht in [(1, 0.0, 0.0, 0.0, 0.0), (20, -0.005, math.radians(-1.5), math.radians(-1.0), 0.025), (40, 0.0, 0.0, 0.0, 0.0)]:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (sp_x, 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (ch_x, 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (0, ht, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        for side, sign in [("L", -1), ("R", 1)]:
            pb[f"UpperArm.{side}"].rotation_euler = (0, 0, math.radians(sign * -6))
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

    # 2. Action_Walk
    act_walk = bpy.data.actions.new("Action_Walk")
    arm_obj.animation_data.action = act_walk
    reset_pose_bones(pb)

    walk_keys = [
        (1,   math.radians(24),  0.0,               math.radians(-22), math.radians(-15), math.radians(-20), math.radians(20),  0.0),
        (8,   0.0,               math.radians(-12), 0.0,               0.0,               0.0,               0.0,               0.012),
        (15,  math.radians(-22), math.radians(-15), math.radians(24),  0.0,               math.radians(20),  math.radians(-20), 0.0),
        (22,  0.0,               0.0,               0.0,               math.radians(-12), 0.0,               0.0,               0.012),
        (30,  math.radians(24),  0.0,               math.radians(-22), math.radians(-15), math.radians(-20), math.radians(20),  0.0),
    ]
    for f, th_l, sh_l, th_r, sh_r, a_l, a_r, bz in walk_keys:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (math.radians(-2.5), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (math.radians(-1.5), 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)

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
        pb["Forearm.L"].rotation_euler = (math.radians(22), 0, math.radians(6))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (a_r, 0, math.radians(6))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(22), 0, math.radians(-6))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 3. Action_Run
    act_run = bpy.data.actions.new("Action_Run")
    arm_obj.animation_data.action = act_run
    reset_pose_bones(pb)

    run_keys = [
        (1,   math.radians(45),  0.0,               math.radians(-38), math.radians(-35), math.radians(-45), math.radians(45),  0.0),
        (5,   math.radians(15),  math.radians(-20), math.radians(-10), 0.0,               math.radians(-15), math.radians(15),  0.024),
        (10,  math.radians(-38), math.radians(-35), math.radians(45),  0.0,               math.radians(45),  math.radians(-45), 0.0),
        (15,  math.radians(-10), 0.0,               math.radians(15),  math.radians(-20), math.radians(15),  math.radians(-15), 0.024),
        (20,  math.radians(45),  0.0,               math.radians(-38), math.radians(-35), math.radians(-45), math.radians(45),  0.0),
    ]
    for f, th_l, sh_l, th_r, sh_r, a_l, a_r, bz in run_keys:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (math.radians(-12), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (math.radians(-8), 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
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
        pb["Forearm.L"].rotation_euler = (math.radians(72), 0, math.radians(10))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (a_r, 0, math.radians(10))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(72), 0, math.radians(-10))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 4. Action_Sit
    act_sit = bpy.data.actions.new("Action_Sit")
    arm_obj.animation_data.action = act_sit
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

        pb["Spine"].rotation_euler = (math.radians(-2), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (math.radians(-1), 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)

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

    # 5. Action_Bow
    act_bow = bpy.data.actions.new("Action_Bow")
    arm_obj.animation_data.action = act_bow
    reset_pose_bones(pb)

    bow_keys = [
        (1,   0.0,                0.0,               0.0),
        (10,  math.radians(-20),  math.radians(-12), math.radians(-10)),
        (18,  math.radians(-20),  math.radians(-12), math.radians(-10)),
        (28,  math.radians(-8),   math.radians(-4),  math.radians(-3)),
        (35,  0.0,                0.0,               0.0),
    ]
    for f, sp_x, ch_x, hd_x in bow_keys:
        pb["Hips"].location = (0, 0, 0)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (sp_x, 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (ch_x, 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (hd_x, 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.L"].rotation_euler = (0, 0, math.radians(-4))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(10), 0, math.radians(-5))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)

        pb["UpperArm.R"].rotation_euler = (0, 0, math.radians(4))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(10), 0, math.radians(5))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)

        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 6. Action_Jump
    act_jump = bpy.data.actions.new("Action_Jump")
    arm_obj.animation_data.action = act_jump
    reset_pose_bones(pb)

    jump_keys = [
        (1,   0.0,    0.0,               0.0,               0.0,               0.0,               0.0,               math.radians(15), 0.0),
        (8,  -0.038,  math.radians(-10), math.radians(-6),  math.radians(28),  math.radians(-28), math.radians(-25), math.radians(35), math.radians(8)),
        (16,  0.145,  math.radians(3),   math.radians(2),   math.radians(18),  math.radians(-15), math.radians(115), math.radians(25), math.radians(12)),
        (25, -0.032,  math.radians(-8),  math.radians(-5),  math.radians(24),  math.radians(-24), math.radians(-15), math.radians(30), math.radians(6)),
        (35,  0.0,    0.0,               0.0,               0.0,               0.0,               0.0,               math.radians(15), 0.0),
    ]
    for f, hz, sp_x, ch_x, th_x, sh_x, a_x, fa_x, hd_x in jump_keys:
        pb["Hips"].location = (0, 0, hz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (sp_x, 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (ch_x, 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
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

    # 7. Action_Blink
    act_blink = bpy.data.actions.new("Action_Blink")
    arm_obj.animation_data.action = act_blink
    reset_pose_bones(pb)
    for side in ["L", "R"]:
        b = pb[f"Eye.{side}"]
        for f, sz in [(1, 1.0), (4, 1.0), (7, 0.08), (10, 1.0), (15, 1.0)]:
            b.scale = (1.0, 1.0, sz)
            b.keyframe_insert("scale", frame=f)

    # 8. Action_Cheer
    act_cheer = bpy.data.actions.new("Action_Cheer")
    arm_obj.animation_data.action = act_cheer
    reset_pose_bones(pb)
    for f, hz, ax, az, fa_x, hx in [
        (1,   0.0,    math.radians(125), math.radians(25), math.radians(25), math.radians(12)),
        (8,   0.028,  math.radians(135), math.radians(30), math.radians(35), math.radians(16)),
        (15,  0.0,    math.radians(125), math.radians(25), math.radians(25), math.radians(12)),
        (22,  0.028,  math.radians(135), math.radians(30), math.radians(35), math.radians(16)),
        (30,  0.0,    math.radians(125), math.radians(25), math.radians(25), math.radians(12)),
    ]:
        pb["Hips"].location = (0, 0, hz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (math.radians(4), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (math.radians(4), 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
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

    # 9. Action_Wave
    act_wave = bpy.data.actions.new("Action_Wave")
    arm_obj.animation_data.action = act_wave
    reset_pose_bones(pb)
    for f, wz in [(1, math.radians(15)), (8, math.radians(-25)), (15, math.radians(20)), (22, math.radians(-20)), (30, math.radians(15))]:
        pb["Hips"].location = (0, 0, 0)
        pb["Hips"].keyframe_insert("location", frame=f)
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

    # 10. Action_Write
    act_write = bpy.data.actions.new("Action_Write")
    arm_obj.animation_data.action = act_write
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
        pb["Spine"].rotation_euler = (math.radians(-8), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (math.radians(-8), 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (math.radians(-16), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.L"].rotation_euler = (math.radians(28), 0, math.radians(-12))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(70), 0, math.radians(-25))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)
        sx = math.sin(f * 0.8) * 0.08
        sz = math.cos(f * 0.8) * 0.08
        pb["UpperArm.R"].rotation_euler = (math.radians(32), 0, math.radians(12))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(75) + sx, 0, math.radians(25) + sz)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)
        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 11. Action_Sleep_Desk
    act_sleep = bpy.data.actions.new("Action_Sleep_Desk")
    arm_obj.animation_data.action = act_sleep
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
        pb["Spine"].rotation_euler = (math.radians(-20), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (math.radians(-16), 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (math.radians(-24), math.radians(32), 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.L"].rotation_euler = (math.radians(55), 0, math.radians(-15))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(85), 0, math.radians(-45))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.R"].rotation_euler = (math.radians(55), 0, math.radians(15))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(85), 0, math.radians(45))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)
        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 0.08)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 12. Action_Raise_Hand
    act_raise = bpy.data.actions.new("Action_Raise_Hand")
    arm_obj.animation_data.action = act_raise
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
        pb["Head"].rotation_euler = (math.radians(10), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.L"].rotation_euler = (math.radians(22), 0, math.radians(-8))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(60), 0, math.radians(-15))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.R"].rotation_euler = (math.radians(135), 0, math.radians(8))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(10), 0, 0)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)
        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 13. Action_Talk
    act_talk = bpy.data.actions.new("Action_Talk")
    arm_obj.animation_data.action = act_talk
    reset_pose_bones(pb)
    for f, hz, hy, al, ar, fl, fr in [
        (1,   0.0,               0.0,               math.radians(20), math.radians(28), math.radians(45), math.radians(65)),
        (10,  math.radians(6),   math.radians(5),   math.radians(25), math.radians(22), math.radians(55), math.radians(50)),
        (20,  math.radians(-5),  math.radians(-4),  math.radians(18), math.radians(35), math.radians(40), math.radians(72)),
        (30,  math.radians(4),   math.radians(3),   math.radians(24), math.radians(25), math.radians(50), math.radians(58)),
        (40,  0.0,               0.0,               math.radians(20), math.radians(28), math.radians(45), math.radians(65)),
    ]:
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

    # 14. Action_Salute_Flag
    act_salute = bpy.data.actions.new("Action_Salute_Flag")
    arm_obj.animation_data.action = act_salute
    reset_pose_bones(pb)
    for f in [1, 15, 30]:
        pb["Head"].rotation_euler = (math.radians(6), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.L"].rotation_euler = (0, 0, math.radians(-4))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(5), 0, 0)
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.R"].rotation_euler = (math.radians(75), 0, math.radians(45))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(85), 0, math.radians(35))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)
        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 15. Action_Thinking
    act_think = bpy.data.actions.new("Action_Thinking")
    arm_obj.animation_data.action = act_think
    reset_pose_bones(pb)
    for f, hd_y in [(1, math.radians(14)), (20, math.radians(18)), (40, math.radians(14))]:
        pb["Head"].rotation_euler = (math.radians(6), hd_y, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.L"].rotation_euler = (math.radians(15), 0, math.radians(-10))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(75), 0, math.radians(-45))
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.R"].rotation_euler = (math.radians(45), 0, math.radians(15))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(95), 0, math.radians(25))
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)
        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 1.0)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # 16. Action_Sad_Disappointed
    act_sad = bpy.data.actions.new("Action_Sad_Disappointed")
    arm_obj.animation_data.action = act_sad
    reset_pose_bones(pb)
    for f, bz in [(1, -0.010), (20, -0.014), (40, -0.010)]:
        pb["Hips"].location = (0, 0, bz)
        pb["Hips"].keyframe_insert("location", frame=f)
        pb["Spine"].rotation_euler = (math.radians(-10), 0, 0)
        pb["Spine"].keyframe_insert("rotation_euler", frame=f)
        pb["Chest"].rotation_euler = (math.radians(-10), 0, 0)
        pb["Chest"].keyframe_insert("rotation_euler", frame=f)
        pb["Head"].rotation_euler = (math.radians(-24), 0, 0)
        pb["Head"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.L"].rotation_euler = (math.radians(12), 0, math.radians(-5))
        pb["UpperArm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.L"].rotation_euler = (math.radians(15), 0, 0)
        pb["Forearm.L"].keyframe_insert("rotation_euler", frame=f)
        pb["UpperArm.R"].rotation_euler = (math.radians(12), 0, math.radians(5))
        pb["UpperArm.R"].keyframe_insert("rotation_euler", frame=f)
        pb["Forearm.R"].rotation_euler = (math.radians(15), 0, 0)
        pb["Forearm.R"].keyframe_insert("rotation_euler", frame=f)
        for side in ["L", "R"]:
            pb[f"Eye.{side}"].scale = (1.0, 1.0, 0.45)
            pb[f"Eye.{side}"].keyframe_insert("scale", frame=f)

    # Push all 16 actions to NLA tracks for clean export
    all_acts = [
        act_idle, act_walk, act_run, act_jump, act_blink,
        act_sit, act_write, act_sleep, act_raise, act_cheer,
        act_talk, act_wave, act_bow, act_salute, act_think, act_sad
    ]
    for act in all_acts:
        tr = arm_obj.animation_data.nla_tracks.new()
        tr.name = act.name
        tr.strips.new(act.name, 1, act)

    arm_obj.animation_data.action = act_idle
    bpy.context.scene.frame_set(1)
    bpy.ops.object.mode_set(mode="OBJECT")
    log("All 16 Actions calibrated and pushed to NLA tracks.")

    return {
        "idle": act_idle,
        "walk": act_walk,
        "run": act_run,
        "jump": act_jump,
        "blink": act_blink,
        "sit": act_sit,
        "write": act_write,
        "sleep": act_sleep,
        "raise_hand": act_raise,
        "cheer": act_cheer,
        "talk": act_talk,
        "wave": act_wave,
        "bow": act_bow,
        "salute": act_salute,
        "thinking": act_think,
        "sad": act_sad,
    }

# =============================================================================
# 9. 6 DEFORMATION TEST POSES (PHASE 4)
# =============================================================================
def apply_test_pose(arm_obj, pose_name):
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm_obj.pose.bones
    reset_pose_bones(pb)

    if pose_name == "Pose_01_Neutral":
        # Natural relaxed standing
        pb["UpperArm.L"].rotation_euler = (0, 0, math.radians(-8))
        pb["Forearm.L"].rotation_euler = (math.radians(12), 0, math.radians(6))
        pb["UpperArm.R"].rotation_euler = (0, 0, math.radians(8))
        pb["Forearm.R"].rotation_euler = (math.radians(12), 0, math.radians(-6))

    elif pose_name == "Pose_02_Walk":
        # Walking passing step
        pb["Hips"].location = (0, 0, 0.012)
        pb["Spine"].rotation_euler = (math.radians(-3), 0, 0)
        pb["Chest"].rotation_euler = (math.radians(-2), 0, 0)
        pb["Thigh.L"].rotation_euler = (math.radians(24), 0, 0)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].rotation_euler = (math.radians(-22), 0, 0)
        pb["Shin.R"].rotation_euler = (math.radians(-15), 0, 0)
        pb["UpperArm.L"].rotation_euler = (math.radians(-20), 0, math.radians(-6))
        pb["Forearm.L"].rotation_euler = (math.radians(25), 0, math.radians(6))
        pb["UpperArm.R"].rotation_euler = (math.radians(20), 0, math.radians(6))
        pb["Forearm.R"].rotation_euler = (math.radians(25), 0, math.radians(-6))

    elif pose_name == "Pose_03_Run":
        # Sprint forward lean
        pb["Hips"].location = (0, 0, 0.024)
        pb["Spine"].rotation_euler = (math.radians(-12), 0, 0)
        pb["Chest"].rotation_euler = (math.radians(-8), 0, 0)
        pb["Head"].rotation_euler = (math.radians(10), 0, 0)
        pb["Thigh.L"].rotation_euler = (math.radians(45), 0, 0)
        pb["Shin.L"].rotation_euler = (0, 0, 0)
        pb["Thigh.R"].rotation_euler = (math.radians(-38), 0, 0)
        pb["Shin.R"].rotation_euler = (math.radians(-35), 0, 0)
        pb["UpperArm.L"].rotation_euler = (math.radians(-45), 0, math.radians(-10))
        pb["Forearm.L"].rotation_euler = (math.radians(75), 0, math.radians(10))
        pb["UpperArm.R"].rotation_euler = (math.radians(45), 0, math.radians(10))
        pb["Forearm.R"].rotation_euler = (math.radians(75), 0, math.radians(-10))

    elif pose_name == "Pose_04_Sit":
        # Seated on classroom chair (Knees bent 82 deg, hips lowered)
        pb["Hips"].location = (0, 0, -0.090)
        pb["Spine"].rotation_euler = (math.radians(-2), 0, 0)
        pb["Chest"].rotation_euler = (math.radians(-2), 0, 0)
        pb["Thigh.L"].rotation_euler = (math.radians(82), 0, 0)
        pb["Shin.L"].rotation_euler = (math.radians(-82), 0, 0)
        pb["Thigh.R"].rotation_euler = (math.radians(82), 0, 0)
        pb["Shin.R"].rotation_euler = (math.radians(-82), 0, 0)
        pb["UpperArm.L"].rotation_euler = (math.radians(25), 0, math.radians(-10))
        pb["Forearm.L"].rotation_euler = (math.radians(65), 0, math.radians(-15))
        pb["UpperArm.R"].rotation_euler = (math.radians(25), 0, math.radians(10))
        pb["Forearm.R"].rotation_euler = (math.radians(65), 0, math.radians(15))

    elif pose_name == "Pose_05_Bend_Forward":
        # Bending forward to pick up an object (testing waist & spine stretch)
        pb["Hips"].location = (0, -0.035, -0.025)
        pb["Spine"].rotation_euler = (math.radians(-28), 0, 0)
        pb["Chest"].rotation_euler = (math.radians(-22), 0, 0)
        pb["Head"].rotation_euler = (math.radians(-15), 0, 0)
        pb["Thigh.L"].rotation_euler = (math.radians(-10), 0, 0)
        pb["Shin.L"].rotation_euler = (math.radians(10), 0, 0)
        pb["Thigh.R"].rotation_euler = (math.radians(-10), 0, 0)
        pb["Shin.R"].rotation_euler = (math.radians(10), 0, 0)
        pb["UpperArm.L"].rotation_euler = (math.radians(-35), 0, math.radians(-6))
        pb["Forearm.L"].rotation_euler = (math.radians(15), 0, math.radians(-6))
        pb["UpperArm.R"].rotation_euler = (math.radians(-42), 0, math.radians(6))
        pb["Forearm.R"].rotation_euler = (math.radians(12), 0, math.radians(6))

    elif pose_name == "Pose_06_Reach":
        # Reaching forward and up toward an object / blackboard
        pb["Hips"].location = (0, 0, 0.008)
        pb["Spine"].rotation_euler = (math.radians(4), 0, 0)
        pb["Chest"].rotation_euler = (math.radians(6), 0, math.radians(10))
        pb["Head"].rotation_euler = (math.radians(15), 0, 0)
        pb["UpperArm.R"].rotation_euler = (math.radians(138), 0, math.radians(15))
        pb["Forearm.R"].rotation_euler = (math.radians(15), 0, 0)
        pb["UpperArm.L"].rotation_euler = (math.radians(-20), 0, math.radians(-12))
        pb["Forearm.L"].rotation_euler = (math.radians(40), 0, math.radians(-10))
        pb["Thigh.R"].rotation_euler = (math.radians(8), 0, 0)
        pb["Thigh.L"].rotation_euler = (math.radians(-8), 0, 0)

    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.context.view_layer.update()

# =============================================================================
# 10. STUDIO LIGHTING & PREVIEW RENDERS
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

    # 3-Point Lighting
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

def render_all_validations(cam_obj, arm_obj, actions):
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

    # 1. TURNAROUND VIEWS (Front, Side, Back, 3/4)
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
        log(f"Rendering Turnaround: {fname}...")
        bpy.ops.render.render(write_still=True)
        log(f"Saved {out_path}")

    # 2. 6 DEFORMATION TEST POSES (PHASE 4 REQUIRED)
    deform_poses = [
        ("pose_01_neutral.png",      "Pose_01_Neutral",      (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("pose_02_walk.png",         "Pose_02_Walk",         (dist * 0.72, dist * 0.72, target_z + 0.12), (math.radians(84), 0, math.radians(135))),
        ("pose_03_run.png",          "Pose_03_Run",          (dist * 0.75, dist * 0.68, target_z + 0.10), (math.radians(84), 0, math.radians(132))),
        ("pose_04_sit.png",          "Pose_04_Sit",          (dist * 0.70, dist * 0.70, target_z + 0.08), (math.radians(84), 0, math.radians(135))),
        ("pose_05_bend_forward.png", "Pose_05_Bend_Forward", (dist * 0.72, dist * 0.65, target_z + 0.12), (math.radians(82), 0, math.radians(130))),
        ("pose_06_reach.png",        "Pose_06_Reach",        (dist * 0.70, dist * 0.70, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
    ]

    # Clear active action so pose bone rotations are displayed directly
    arm_obj.animation_data.action = None

    for fname, pname, cam_pos, cam_rot in deform_poses:
        apply_test_pose(arm_obj, pname)
        cam_obj.location = cam_pos
        cam_obj.rotation_euler = cam_rot
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        log(f"Rendering Deformation Pose: {fname} ({pname})...")
        bpy.ops.render.render(write_still=True)
        log(f"Saved {out_path}")

    # 3. ACTION RENDERS (Write, Sleep, Cheer, Bow)
    arm_obj.animation_data.action = actions["write"]
    scene.frame_set(15)
    cam_obj.location = (dist * 0.65, dist * 0.70, target_z + 0.10)
    cam_obj.rotation_euler = (math.radians(82), 0, math.radians(138))
    scene.render.filepath = os.path.join(PREVIEWS_DIR, "act_write.png")
    bpy.ops.render.render(write_still=True)

    arm_obj.animation_data.action = actions["sleep"]
    scene.frame_set(20)
    cam_obj.location = (dist * 0.60, dist * 0.75, target_z + 0.14)
    cam_obj.rotation_euler = (math.radians(80), 0, math.radians(142))
    scene.render.filepath = os.path.join(PREVIEWS_DIR, "act_sleep.png")
    bpy.ops.render.render(write_still=True)

    arm_obj.animation_data.action = actions["idle"]
    scene.frame_set(1)

# =============================================================================
# MAIN PRODUCTION PIPELINE EXECUTION
# =============================================================================
def main():
    log("1. Resetting scene and setting up production materials...")
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

    log("2. Building Continuous Torso and Legs geometry...")
    body_torso_legs = build_torso_and_legs(mats)
    col.objects.link(body_torso_legs)

    log("3. Building Continuous Left and Right Arms with Chibi Hands...")
    arm_l = build_arm(-1, "L", mats)
    arm_r = build_arm(1, "R", mats)
    col.objects.link(arm_l)
    col.objects.link(arm_r)

    log("4. Building Head, Ears, Layered Hair and Face Details...")
    head_obj, ears = build_head(mats, col)
    hair_objs = build_layered_hair(mats, col)
    face_objs = build_face_and_accessories(mats, col)

    log("5. Building 19-Bone Humanoid Armature with Chest bone...")
    arm_rig = build_humanoid_armature(col)

    log("6. Skinning deformable meshes with smooth vertex weights...")
    skin_body_mesh(body_torso_legs, arm_rig)
    skin_arm_mesh(arm_l, arm_rig, "L")
    skin_arm_mesh(arm_r, arm_rig, "R")

    # Head and Ears skinned to Head bone
    skin_accessory(head_obj, arm_rig, "Head", secondary_bone="Neck", sec_weight=0.25)
    for ear in ears:
        skin_accessory(ear, arm_rig, "Head")

    # Hair objects skinned to Head bone
    for h in hair_objs:
        skin_accessory(h, arm_rig, "Head")

    # Face details (Nose, Eyebrows, Sparkling Eyes, Blush, Smile)
    skin_accessory(face_objs["Nose"], arm_rig, "Head")
    skin_accessory(face_objs["Eyebrow_L"], arm_rig, "Head")
    skin_accessory(face_objs["Eyebrow_R"], arm_rig, "Head")
    skin_accessory(face_objs["Eye_L"], arm_rig, "Eye.L")
    skin_accessory(face_objs["Eye_HL1_L"], arm_rig, "Eye.L")
    skin_accessory(face_objs["Eye_HL2_L"], arm_rig, "Eye.L")
    skin_accessory(face_objs["Eye_R"], arm_rig, "Eye.R")
    skin_accessory(face_objs["Eye_HL1_R"], arm_rig, "Eye.R")
    skin_accessory(face_objs["Eye_HL2_R"], arm_rig, "Eye.R")
    skin_accessory(face_objs["Blush_L"], arm_rig, "Head")
    skin_accessory(face_objs["Blush_R"], arm_rig, "Head")
    skin_accessory(face_objs["Mouth"], arm_rig, "Head")

    # School Uniform Accessories
    skin_accessory(face_objs["Shirt_Collar"], arm_rig, "Neck", secondary_bone="Chest", sec_weight=0.35)
    skin_accessory(face_objs["Scarf_Knot"], arm_rig, "Chest")
    skin_accessory(face_objs["Scarf_Tail_L"], arm_rig, "Chest", secondary_bone="Spine", sec_weight=0.25)
    skin_accessory(face_objs["Scarf_Tail_R"], arm_rig, "Chest", secondary_bone="Spine", sec_weight=0.25)
    skin_accessory(face_objs["Nametag"], arm_rig, "Chest")
    skin_accessory(face_objs["Belt_Buckle"], arm_rig, "Hips", secondary_bone="Spine", sec_weight=0.40)

    log("7. Setting up all 16 calibrated Actions...")
    actions = setup_all_animations(arm_rig)

    log(f"8. Saving upgraded working file .blend: {OUTPUT_BLEND}")
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

    log("9. Exporting GLB files...")
    all_mesh_objs = [
        body_torso_legs, arm_l, arm_r, head_obj
    ] + ears + hair_objs + list(face_objs.values())

    bpy.ops.object.select_all(action="DESELECT")
    arm_rig.select_set(True)
    for m in all_mesh_objs:
        m.select_set(True)

    for glb_path in [OUTPUT_GLB_SKINNED, OUTPUT_GLB_ACTIVE]:
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format="GLB",
            use_selection=True,
            export_apply=False,
            export_yup=True,
            export_materials="EXPORT",
            export_animations=True,
            export_skins=True
        )
        log(f"Exported GLB: {glb_path}")

    log("10. Setting up studio lighting and rendering validations...")
    cam = setup_studio()
    render_all_validations(cam, arm_rig, actions)

    log("V8 OPTION B SKINNED MESH CHARACTER GENERATION COMPLETE!")

if __name__ == "__main__":
    main()
