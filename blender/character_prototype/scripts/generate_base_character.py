"""
=============================================================================
PRODUCTION BASE CHARACTER SYSTEM GENERATOR (VIETNAMESE STUDENT CHIBI)
Creates a smooth, stylized, modular, and reusable base character system.
Includes:
- Softened, high-fidelity quad geometry (reduced angularity, zero harsh facets)
- Clean 5-Collection modular hierarchy (Body, Outfit, Hair, Accessories, Face)
- 19-Bone Humanoid Armature with Chest bone & Eye bones
- 16 Reusable Animation Actions (Walk, Run, Sit, Bow, Cheer, Jump, Salute, etc.)
- 6 Joint Deformation Poses
- Full GLB export for Three.js WebGL runtime
=============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
OUTPUT_BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
OUTPUT_SKINNED_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_skinned.blend")
OUTPUT_GLB_BASE = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_base.glb")
OUTPUT_GLB_SKINNED = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_skinned.glb")
OUTPUT_GLB_ACTIVE = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student.glb")

PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_base"
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "base_character_log.txt")

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(os.path.join(PREVIEWS_DIR, "actions"), exist_ok=True)
os.makedirs(os.path.join(ARTIFACT_DIR, "actions"), exist_ok=True)

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("=== STARTING REUSABLE BASE CHARACTER SYSTEM GENERATION ===\n")

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def create_mat(name, hex_color, roughness=0.55, metallic=0.0, emission=None):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_lin(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = hex_to_lin(emission)
        bsdf.inputs["Emission Strength"].default_value = 1.0
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def apply_smooth_shading(obj):
    if obj.type == "MESH" and obj.data:
        for p in obj.data.polygons:
            p.use_smooth = True
        obj.data.update()

# =============================================================================
# GEOMETRY HELPERS (CLEAN QUAD RINGS & BRIDGING)
# =============================================================================
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

# =============================================================================
# 1. BASE BODY: HEAD & NECK
# =============================================================================
def build_smooth_head(mats, col):
    head_z = 0.525
    bm = bmesh.new()
    hsegs = 20  # High-fidelity 20-segment quad loops (silky smooth round chibi head)

    # Neck column (Z: 0.380 -> 0.440)
    r_neck_bot = add_ring(bm, 0.380, 0.065, 0.060, 0, 0.005, hsegs)
    r_neck_mid = add_ring(bm, 0.410, 0.066, 0.062, 0, 0.005, hsegs)
    r_neck_top = add_ring(bm, 0.435, 0.076, 0.070, 0, 0.005, hsegs)

    # Head rings (Plump chubby cheeks, tapered cute jaw, smooth round skull)
    r_jaw   = add_ring(bm, 0.455, 0.135, 0.130, 0, 0.005, hsegs)
    r_cheek = add_ring(bm, 0.490, 0.170, 0.160, 0, 0.008, hsegs)  # Wide cute cheeks
    r_eye   = add_ring(bm, 0.525, 0.174, 0.164, 0, 0.002, hsegs)  # Eye level
    r_brow  = add_ring(bm, 0.575, 0.168, 0.158, 0, -0.005, hsegs)
    r_crown = add_ring(bm, 0.625, 0.148, 0.138, 0, -0.010, hsegs)
    r_top   = add_ring(bm, 0.665, 0.098, 0.088, 0, -0.012, hsegs)

    bridge_rings(bm, r_neck_bot, r_neck_mid, 0)
    bridge_rings(bm, r_neck_mid, r_neck_top, 0)
    bridge_rings(bm, r_neck_top, r_jaw, 0)
    bridge_rings(bm, r_jaw, r_cheek, 0)
    bridge_rings(bm, r_cheek, r_eye, 0)
    bridge_rings(bm, r_eye, r_brow, 0)
    bridge_rings(bm, r_brow, r_crown, 0)
    bridge_rings(bm, r_crown, r_top, 0)

    cap_ring(bm, r_top, (0.0, -0.012, 0.678), 0, reverse=False)

    for f in bm.faces:
        f.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Body_Head_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    head_obj = bpy.data.objects.new("Body_Head", mesh)
    head_obj.data.materials.append(mats["skin"])
    col.objects.link(head_obj)
    apply_smooth_shading(head_obj)

    # Chibi Ears (Soft rounded ears with inner lobe)
    ears = []
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.166, -0.005, head_z - 0.01))
        ear = bpy.context.active_object
        ear.name = f"Ear_{sign}"
        ear.scale = (0.026, 0.044, 0.052)
        ear.rotation_euler = (0, math.radians(side * -10), math.radians(side * 12))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = ear.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        ear.data.materials.append(mats["skin"])
        apply_smooth_shading(ear)
        col.objects.link(ear)
        bpy.context.scene.collection.objects.unlink(ear)
        ears.append(ear)

    return head_obj, ears

# =============================================================================
# 2. BASE BODY: ARMS & HANDS
# =============================================================================
def build_smooth_arm(side, sign, mats, col):
    bm = bmesh.new()
    mat_shirt = 0
    mat_skin = 1

    segs = 14  # 14-segment quad rings for smooth tubular arms
    cx = side * 0.120

    # Short Puffed Sleeve with Rounded Shoulder Dome (White Shirt)
    r_shoulder_dome = add_ring(bm, 0.380, 0.036, 0.040, cx - side * 0.012, 0.004, segs)
    cap_ring(bm, r_shoulder_dome, (cx - side * 0.018, 0.004, 0.385), mat_shirt, reverse=False)
    r_shoulder      = add_ring(bm, 0.368, 0.048, 0.048, cx, 0.004, segs)
    r_sleeve_mid    = add_ring(bm, 0.338, 0.047, 0.047, cx + side * 0.003, 0.005, segs)
    r_sleeve_cuff   = add_ring(bm, 0.312, 0.044, 0.044, cx + side * 0.006, 0.006, segs)

    bridge_rings(bm, r_shoulder_dome, r_shoulder, mat_shirt)
    bridge_rings(bm, r_shoulder, r_sleeve_mid, mat_shirt)
    bridge_rings(bm, r_sleeve_mid, r_sleeve_cuff, mat_shirt)

    # Skin Arm emerging inside sleeve cuff
    r_arm_top    = add_ring(bm, 0.310, 0.032, 0.032, cx + side * 0.006, 0.006, segs)
    # 3 Elbow Deformation Loops around joint pivot (Z = 0.280)
    r_elbow_1    = add_ring(bm, 0.293, 0.0315, 0.0315, cx + side * 0.008, 0.007, segs)
    r_elbow_2    = add_ring(bm, 0.280, 0.0310, 0.0310, cx + side * 0.010, 0.008, segs) # PIVOT
    r_elbow_3    = add_ring(bm, 0.267, 0.0305, 0.0305, cx + side * 0.012, 0.009, segs)

    # Forearm & Wrist
    r_fore_mid   = add_ring(bm, 0.240, 0.0295, 0.0295, cx + side * 0.014, 0.011, segs)
    r_wrist      = add_ring(bm, 0.210, 0.0280, 0.0280, cx + side * 0.016, 0.013, segs)

    bridge_rings(bm, r_sleeve_cuff, r_arm_top, mat_shirt)
    bridge_rings(bm, r_arm_top, r_elbow_1, mat_skin)
    bridge_rings(bm, r_elbow_1, r_elbow_2, mat_skin)
    bridge_rings(bm, r_elbow_2, r_elbow_3, mat_skin)
    bridge_rings(bm, r_elbow_3, r_fore_mid, mat_skin)
    bridge_rings(bm, r_fore_mid, r_wrist, mat_skin)

    # Rounded Chibi Palm & Fingers
    r_palm_top = add_ring(bm, 0.190, 0.031, 0.027, cx + side * 0.018, 0.015, segs)
    r_palm_mid = add_ring(bm, 0.170, 0.033, 0.028, cx + side * 0.019, 0.016, segs)
    r_palm_bot = add_ring(bm, 0.152, 0.027, 0.023, cx + side * 0.019, 0.016, segs)

    bridge_rings(bm, r_wrist, r_palm_top, mat_skin)
    bridge_rings(bm, r_palm_top, r_palm_mid, mat_skin)
    bridge_rings(bm, r_palm_mid, r_palm_bot, mat_skin)

    # Rounded fingertip mitt cap
    mitt_tip = (cx + side * 0.019, 0.016, 0.142)
    cap_ring(bm, r_palm_bot, mitt_tip, mat_skin, reverse=True)

    # Stylized Thumb with 8-segment smooth curvature
    tb_x = cx + side * 0.006
    tb_y = 0.025
    tb_z = 0.180
    tt_x = cx + side * 0.002
    tt_y = 0.037
    tt_z = 0.165

    t_ring_1 = add_ring(bm, tb_z, 0.011, 0.011, tb_x, tb_y, 8)
    t_ring_2 = add_ring(bm, (tb_z + tt_z)*0.5, 0.010, 0.010, (tb_x+tt_x)*0.5, (tb_y+tt_y)*0.5, 8)
    t_ring_3 = add_ring(bm, tt_z, 0.008, 0.008, tt_x, tt_y, 8)

    bridge_rings(bm, t_ring_1, t_ring_2, mat_skin)
    bridge_rings(bm, t_ring_2, t_ring_3, mat_skin)
    cap_ring(bm, t_ring_3, (tt_x, tt_y + 0.005, tt_z - 0.004), mat_skin, reverse=True)

    for f in bm.faces:
        f.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(f"Body_Arm_Mesh_{sign}")
    bm.to_mesh(mesh)
    bm.free()

    arm_obj = bpy.data.objects.new(f"Character_Arm_{sign}", mesh)
    arm_obj.data.materials.append(mats["shirt"]) # 0
    arm_obj.data.materials.append(mats["skin"])  # 1
    col.objects.link(arm_obj)
    apply_smooth_shading(arm_obj)

    return arm_obj

# =============================================================================
# 3. OUTFIT: TORSO, BELT, PANTS & BATA SHOES
# =============================================================================
def build_smooth_torso_and_legs(mats, col):
    bm = bmesh.new()

    mat_shirt = 0
    mat_belt  = 1
    mat_pants = 2
    mat_shoe  = 3
    mat_sole  = 4

    segs = 18  # 18-segment quad loops for smooth torso silhouette
    r_neck      = add_ring(bm, 0.405, 0.068, 0.062, 0,  0.005, segs) # Neck opening
    r_chest_top = add_ring(bm, 0.380, 0.120, 0.088, 0,  0.003, segs) # Upper chest
    r_chest_mid = add_ring(bm, 0.340, 0.118, 0.085, 0,  0.000, segs) # Mid chest
    r_ribs      = add_ring(bm, 0.290, 0.108, 0.078, 0, -0.002, segs) # Lower ribs
    r_waist     = add_ring(bm, 0.252, 0.100, 0.074, 0, -0.002, segs) # Shirt tuck
    r_belt_top  = add_ring(bm, 0.247, 0.103, 0.077, 0, -0.002, segs) # Belt top
    r_belt_bot  = add_ring(bm, 0.225, 0.103, 0.077, 0, -0.002, segs) # Belt bot
    r_pants_top = add_ring(bm, 0.220, 0.100, 0.075, 0, -0.002, segs) # Pants waist
    r_pelvis_mid= add_ring(bm, 0.185, 0.106, 0.080, 0, -0.002, segs) # Pelvis fullness
    r_pelvis_bot= add_ring(bm, 0.160, 0.100, 0.074, 0, -0.002, segs) # Crotch base

    bridge_rings(bm, r_neck, r_chest_top, mat_shirt)
    bridge_rings(bm, r_chest_top, r_chest_mid, mat_shirt)
    bridge_rings(bm, r_chest_mid, r_ribs, mat_shirt)
    bridge_rings(bm, r_ribs, r_waist, mat_shirt)
    bridge_rings(bm, r_waist, r_belt_top, mat_belt)
    bridge_rings(bm, r_belt_top, r_belt_bot, mat_belt)
    bridge_rings(bm, r_belt_bot, r_pants_top, mat_pants)
    bridge_rings(bm, r_pants_top, r_pelvis_mid, mat_pants)
    bridge_rings(bm, r_pelvis_mid, r_pelvis_bot, mat_pants)

    # LEGS (14 segments per leg: round soft cylinders, no octagonal faceting!)
    lsegs = 14
    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * 0.055

        r_thigh_top = add_ring(bm, 0.160, 0.042, 0.042, cx, 0, lsegs)
        r_thigh_mid = add_ring(bm, 0.135, 0.040, 0.040, cx, 0, lsegs)

        # 3 Knee Deformation Loops across joint pivot (Z = 0.115)
        r_knee_1 = add_ring(bm, 0.125, 0.039, 0.039, cx, 0.002, lsegs)
        r_knee_2 = add_ring(bm, 0.115, 0.0385, 0.0385, cx, 0.004, lsegs) # PIVOT
        r_knee_3 = add_ring(bm, 0.105, 0.038, 0.038, cx, 0.002, lsegs)

        r_shin_mid = add_ring(bm, 0.075, 0.037, 0.037, cx, 0, lsegs)
        r_ankle    = add_ring(bm, 0.040, 0.038, 0.038, cx, 0, lsegs)

        bridge_rings(bm, r_thigh_top, r_thigh_mid, mat_pants)
        bridge_rings(bm, r_thigh_mid, r_knee_1, mat_pants)
        bridge_rings(bm, r_knee_1, r_knee_2, mat_pants)
        bridge_rings(bm, r_knee_2, r_knee_3, mat_pants)
        bridge_rings(bm, r_knee_3, r_shin_mid, mat_pants)
        bridge_rings(bm, r_shin_mid, r_ankle, mat_pants)

        # Bata Canvas Sneakers & Gum Rubber Soles
        r_shoe_top = add_ring(bm, 0.035, 0.040, 0.044, cx, 0.006, lsegs)
        r_shoe_mid = add_ring(bm, 0.022, 0.044, 0.058, cx, 0.016, lsegs)
        r_shoe_bot = add_ring(bm, 0.012, 0.046, 0.060, cx, 0.016, lsegs)
        r_sole_bot = add_ring(bm, 0.000, 0.047, 0.062, cx, 0.016, lsegs)

        bridge_rings(bm, r_ankle, r_shoe_top, mat_shoe)
        bridge_rings(bm, r_shoe_top, r_shoe_mid, mat_shoe)
        bridge_rings(bm, r_shoe_mid, r_shoe_bot, mat_shoe)
        bridge_rings(bm, r_shoe_bot, r_sole_bot, mat_sole)

        cap_ring(bm, r_sole_bot, (cx, 0.016, 0.000), mat_sole, reverse=True)

    for f in bm.faces:
        f.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Character_Torso_Legs_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    torso_legs_obj = bpy.data.objects.new("Character_Torso_Legs", mesh)
    torso_legs_obj.data.materials.append(mats["shirt"]) # 0
    torso_legs_obj.data.materials.append(mats["belt"])  # 1
    torso_legs_obj.data.materials.append(mats["pants"]) # 2
    torso_legs_obj.data.materials.append(mats["shoe"])  # 3
    torso_legs_obj.data.materials.append(mats["sole"])  # 4
    col.objects.link(torso_legs_obj)
    apply_smooth_shading(torso_legs_obj)

    # Collar (Soft folded school uniform collar)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.038, 0.388))
    collar = bpy.context.active_object
    collar.name = "Shirt_Collar"
    collar.scale = (0.132, 0.082, 0.024)
    collar.rotation_euler = (math.radians(-12), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = collar.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    collar.data.materials.append(mats["shirt"])
    apply_smooth_shading(collar)
    col.objects.link(collar)
    bpy.context.scene.collection.objects.unlink(collar)

    return torso_legs_obj, collar

# =============================================================================
# 4. MODULAR HAIR: CAP, LAYERED BANGS & SIDEBURNS
# =============================================================================
def build_smooth_hair(mats, col):
    head_z = 0.525
    hair_objs = []

    # A. Hair Cap (Clean skull dome covering back, sides, and top crown with Subdiv 2)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.022, head_z + 0.040))
    cap = bpy.context.active_object
    cap.name = "Hair_Cap"
    cap.scale = (0.42, 0.40, 0.31)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = cap.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    cap.data.materials.append(mats["hair"])
    apply_smooth_shading(cap)
    col.objects.link(cap)
    bpy.context.scene.collection.objects.unlink(cap)
    hair_objs.append(cap)

    # B. Hair Bangs (Single continuous smooth curved fringe across the forehead - NO 3 BALLS)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.075, head_z + 0.065))
    bangs = bpy.context.active_object
    bangs.name = "Hair_Bangs"
    bangs.scale = (0.36, 0.22, 0.14)
    bangs.rotation_euler = (math.radians(-24), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = bangs.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    bangs.data.materials.append(mats["hair"])
    apply_smooth_shading(bangs)
    col.objects.link(bangs)
    bpy.context.scene.collection.objects.unlink(bangs)
    hair_objs.append(bangs)

    # C. Sideburns (Left & Right sleek locks framing temples)
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.170, 0.045, head_z + 0.010))
        burn = bpy.context.active_object
        burn.name = f"Hair_Sideburn_{sign}"
        burn.scale = (0.028, 0.055, 0.115)
        burn.rotation_euler = (math.radians(-10), 0, math.radians(side * -5))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = burn.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 2
        sub.render_levels = 2
        burn.data.materials.append(mats["hair"])
        apply_smooth_shading(burn)
        col.objects.link(burn)
        bpy.context.scene.collection.objects.unlink(burn)
        hair_objs.append(burn)

    return hair_objs

# =============================================================================
# 5. ACCESSORIES & FACIAL FEATURES
# =============================================================================
def build_accessories_and_face(mats, col_acc, col_face):
    head_z = 0.525
    eye_x  = 0.066
    eye_z  = 0.520
    face_y = 0.155

    # Outfit details (scarf, badge, etc.) removed from base model per user request
    # to maintain a clean reusable base template. Costume details will be rendered later.

    # Facial Features (Cute button nose, expressive brows, enlarged sparkling chibi eyes, mouth, blush)
    # Nose
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, face_y + 0.010, head_z - 0.025))
    nose = bpy.context.active_object
    nose.name = "Nose"
    nose.scale = (0.016, 0.014, 0.014)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = nose.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    nose.data.materials.append(mats["skin"])
    apply_smooth_shading(nose)
    col_face.objects.link(nose)
    bpy.context.scene.collection.objects.unlink(nose)

    # Eyebrows (Lifted slightly to frame enlarged expressive eyes)
    eyebrows = []
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * eye_x, face_y - 0.005, head_z + 0.044))
        brow = bpy.context.active_object
        brow.name = f"Eyebrow_{sign}"
        brow.scale = (0.030, 0.006, 0.008)
        brow.rotation_euler = (math.radians(-6), 0, math.radians(side * -8))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = brow.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        brow.data.materials.append(mats["hair"])
        apply_smooth_shading(brow)
        col_face.objects.link(brow)
        bpy.context.scene.collection.objects.unlink(brow)
        eyebrows.append(brow)

    # Enlarged Chibi Eyes & Sparkling Highlights
    eyes = []
    highlights = []
    for side, sign in [(-1, "L"), (1, "R")]:
        cx = side * eye_x
        # Pupil (Enlarged for cute, warm, expressive stylized look)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, face_y - 0.003, eye_z))
        eye = bpy.context.active_object
        eye.name = f"Eye_{sign}"
        eye.scale = (0.032, 0.008, 0.039)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = eye.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        eye.data.materials.append(mats["eye_black"])
        apply_smooth_shading(eye)
        col_face.objects.link(eye)
        bpy.context.scene.collection.objects.unlink(eye)
        eyes.append(eye)

        # Highlight 1 (Upper primary sparkle)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx + side * 0.008, face_y + 0.003, eye_z + 0.011))
        hl1 = bpy.context.active_object
        hl1.name = f"Eye_HL1_{sign}"
        hl1.scale = (0.012, 0.004, 0.013)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = hl1.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        hl1.data.materials.append(mats["eye_hl"])
        apply_smooth_shading(hl1)
        col_face.objects.link(hl1)
        bpy.context.scene.collection.objects.unlink(hl1)
        highlights.append(hl1)

        # Highlight 2 (Lower secondary sparkle)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx - side * 0.008, face_y + 0.003, eye_z - 0.010))
        hl2 = bpy.context.active_object
        hl2.name = f"Eye_HL2_{sign}"
        hl2.scale = (0.007, 0.004, 0.007)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = hl2.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        hl2.data.materials.append(mats["eye_hl"])
        apply_smooth_shading(hl2)
        col_face.objects.link(hl2)
        bpy.context.scene.collection.objects.unlink(hl2)
        highlights.append(hl2)

    # Sweet smile mouth
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, face_y + 0.004, head_z - 0.045))
    mouth = bpy.context.active_object
    mouth.name = "Mouth"
    mouth.scale = (0.026, 0.006, 0.008)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = mouth.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    mouth.data.materials.append(mats["mouth"])
    apply_smooth_shading(mouth)
    col_face.objects.link(mouth)
    bpy.context.scene.collection.objects.unlink(mouth)

    # Soft blush discs
    blushes = []
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.125, face_y - 0.038, head_z - 0.026))
        blush = bpy.context.active_object
        blush.name = f"Blush_{sign}"
        blush.scale = (0.026, 0.006, 0.016)
        blush.rotation_euler = (math.radians(-10), 0, math.radians(side * -12))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = blush.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        blush.data.materials.append(mats["blush"])
        apply_smooth_shading(blush)
        col_face.objects.link(blush)
        bpy.context.scene.collection.objects.unlink(blush)
        blushes.append(blush)

    return {
        "nose": nose,
        "eyebrows": eyebrows,
        "eyes": eyes,
        "highlights": highlights,
        "mouth": mouth,
        "blushes": blushes,
    }

# =============================================================================
# 6. STANDARDIZED 19-BONE HUMANOID RIGGING & SKINNING
# =============================================================================
def build_humanoid_armature(col):
    arm_data = bpy.data.armatures.new("Student_Armature_Data")
    arm_data.display_type = "OCTAHEDRAL"
    arm_obj = bpy.data.objects.new("Student_Armature", arm_data)
    col.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm_data.edit_bones

    # 1. Root
    root = eb.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0.08, 0)

    # 2. Hips
    hips = eb.new("Hips")
    hips.head = (0, 0, 0.200)
    hips.tail = (0, 0, 0.250)
    hips.parent = root

    # 3. Spine
    spine = eb.new("Spine")
    spine.head = (0, 0, 0.250)
    spine.tail = (0, 0, 0.320)
    spine.parent = hips

    # 4. Chest
    chest = eb.new("Chest")
    chest.head = (0, 0, 0.320)
    chest.tail = (0, 0, 0.380)
    chest.parent = spine

    # 5. Neck
    neck = eb.new("Neck")
    neck.head = (0, 0, 0.380)
    neck.tail = (0, 0, 0.440)
    neck.parent = chest

    # 6. Head
    head = eb.new("Head")
    head.head = (0, 0, 0.440)
    head.tail = (0, 0, 0.680)
    head.parent = neck

    # 7. Eyes
    eye_x = 0.066
    for side in ["L", "R"]:
        sign = -1 if side == "L" else 1
        eb_eye = eb.new(f"Eye.{side}")
        eb_eye.head = (sign * eye_x, 0.155, 0.520)
        eb_eye.tail = (sign * eye_x, 0.220, 0.520)
        eb_eye.parent = head

    # 8. Left & Right Arms (Parented to Chest!)
    for side in ["L", "R"]:
        sign = -1 if side == "L" else 1
        uarm = eb.new(f"UpperArm.{side}")
        uarm.head = (sign * 0.118, 0.005, 0.365)
        uarm.tail = (sign * 0.128, 0.010, 0.280)
        uarm.parent = chest

        farm = eb.new(f"Forearm.{side}")
        farm.head = (sign * 0.128, 0.010, 0.280)
        farm.tail = (sign * 0.136, 0.015, 0.210)
        farm.parent = uarm

        hand = eb.new(f"Hand.{side}")
        hand.head = (sign * 0.136, 0.015, 0.210)
        hand.tail = (sign * 0.138, 0.018, 0.142)
        hand.parent = farm

    # 9. Left & Right Legs (Parented to Hips)
    for side in ["L", "R"]:
        sign = -1 if side == "L" else 1
        thigh = eb.new(f"Thigh.{side}")
        thigh.head = (sign * 0.055, 0.002, 0.180)
        thigh.tail = (sign * 0.055, 0.004, 0.115)
        thigh.parent = hips

        shin = eb.new(f"Shin.{side}")
        shin.head = (sign * 0.055, 0.004, 0.115)
        shin.tail = (sign * 0.055, 0.006, 0.040)
        shin.parent = thigh

        foot = eb.new(f"Foot.{side}")
        foot.head = (sign * 0.055, 0.006, 0.040)
        foot.tail = (sign * 0.055, 0.065, 0.005)
        foot.parent = shin

    bpy.ops.object.mode_set(mode="OBJECT")

    # Set all pose bones to Euler XYZ rotation mode to match action keyframes
    for pb in arm_obj.pose.bones:
        pb.rotation_mode = "XYZ"

    return arm_obj

def apply_armature_modifier(obj, arm_obj):
    mod = obj.modifiers.get("Armature")
    if not mod:
        mod = obj.modifiers.new("Armature", "ARMATURE")
    mod.object = arm_obj

def skin_mesh_smooth(obj, arm_obj, skin_logic_type):
    apply_armature_modifier(obj, arm_obj)
    mesh = obj.data

    def ensure_vg(name):
        vg = obj.vertex_groups.get(name)
        if not vg:
            vg = obj.vertex_groups.new(name=name)
        return vg

    if skin_logic_type == "head":
        vg_head = ensure_vg("Head")
        vg_neck = ensure_vg("Neck")
        for v in mesh.vertices:
            z = v.co.z
            if z >= 0.435:
                vg_head.add([v.index], 1.0, "REPLACE")
            elif z <= 0.395:
                vg_neck.add([v.index], 1.0, "REPLACE")
            else:
                fac = (z - 0.395) / (0.435 - 0.395)
                vg_head.add([v.index], fac, "REPLACE")
                vg_neck.add([v.index], 1.0 - fac, "REPLACE")

    elif skin_logic_type == "torso_legs":
        vg_chest = ensure_vg("Chest")
        vg_spine = ensure_vg("Spine")
        vg_hips  = ensure_vg("Hips")
        vg_th_l  = ensure_vg("Thigh.L")
        vg_th_r  = ensure_vg("Thigh.R")
        vg_sh_l  = ensure_vg("Shin.L")
        vg_sh_r  = ensure_vg("Shin.R")
        vg_ft_l  = ensure_vg("Foot.L")
        vg_ft_r  = ensure_vg("Foot.R")

        for v in mesh.vertices:
            z = v.co.z
            x = v.co.x
            # Upper Torso (Chest & Spine)
            if z >= 0.320:
                vg_chest.add([v.index], 1.0, "REPLACE")
            elif z >= 0.250:
                fac = (z - 0.250) / (0.320 - 0.250)
                vg_chest.add([v.index], fac, "REPLACE")
                vg_spine.add([v.index], 1.0 - fac, "REPLACE")
            elif z >= 0.200:
                fac = (z - 0.200) / (0.250 - 0.200)
                vg_spine.add([v.index], fac * 0.8, "REPLACE")
                vg_hips.add([v.index], 1.0 - (fac * 0.8), "REPLACE")
            elif z >= 0.160:
                vg_hips.add([v.index], 1.0, "REPLACE")
            else:
                # Legs: Left (x < 0) vs Right (x > 0)
                side = "L" if x < 0 else "R"
                vg_th = vg_th_l if side == "L" else vg_th_r
                vg_sh = vg_sh_l if side == "L" else vg_sh_r
                vg_ft = vg_ft_l if side == "L" else vg_ft_r

                if z > 0.130:
                    vg_th.add([v.index], 1.0, "REPLACE")
                elif z >= 0.100:
                    fac = (z - 0.100) / (0.130 - 0.100)
                    vg_th.add([v.index], fac, "REPLACE")
                    vg_sh.add([v.index], 1.0 - fac, "REPLACE")
                elif z > 0.040:
                    vg_sh.add([v.index], 1.0, "REPLACE")
                elif z >= 0.020:
                    fac = (z - 0.020) / (0.040 - 0.020)
                    vg_sh.add([v.index], fac, "REPLACE")
                    vg_ft.add([v.index], 1.0 - fac, "REPLACE")
                else:
                    vg_ft.add([v.index], 1.0, "REPLACE")

    elif skin_logic_type.startswith("arm_"):
        side = skin_logic_type.split("_")[1].upper() # "L" or "R"
        vg_uarm = ensure_vg(f"UpperArm.{side}")
        vg_farm = ensure_vg(f"Forearm.{side}")
        vg_hand = ensure_vg(f"Hand.{side}")
        vg_chest = ensure_vg("Chest")

        for v in mesh.vertices:
            z = v.co.z
            if z >= 0.370:
                vg_chest.add([v.index], 0.55, "REPLACE")
                vg_uarm.add([v.index], 0.45, "REPLACE")
            elif z >= 0.345:
                vg_chest.add([v.index], 0.25, "REPLACE")
                vg_uarm.add([v.index], 0.75, "REPLACE")
            elif z > 0.295:
                vg_uarm.add([v.index], 1.0, "REPLACE")
            elif z >= 0.265:
                fac = (z - 0.265) / (0.295 - 0.265)
                vg_uarm.add([v.index], fac, "REPLACE")
                vg_farm.add([v.index], 1.0 - fac, "REPLACE")
            elif z > 0.215:
                vg_farm.add([v.index], 1.0, "REPLACE")
            elif z >= 0.195:
                fac = (z - 0.195) / (0.215 - 0.195)
                vg_farm.add([v.index], fac, "REPLACE")
                vg_hand.add([v.index], 1.0 - fac, "REPLACE")
            else:
                vg_hand.add([v.index], 1.0, "REPLACE")

    elif skin_logic_type == "rigid":
        target_bone = "Chest" if "Collar" in obj.name or "Scarf" in obj.name or "Nametag" in obj.name else "Head"
        if "Buckle" in obj.name:
            target_bone = "Spine"
        elif "Eye_L" in obj.name or "Eye_HL1_L" in obj.name or "Eye_HL2_L" in obj.name:
            target_bone = "Eye.L"
        elif "Eye_R" in obj.name or "Eye_HL1_R" in obj.name or "Eye_HL2_R" in obj.name:
            target_bone = "Eye.R"

        vg = ensure_vg(target_bone)
        for v in mesh.vertices:
            vg.add([v.index], 1.0, "REPLACE")

# =============================================================================
# 7. TRANSFER / BUILD ALL 16 ANIMATION ACTIONS & 6 TEST POSES
# =============================================================================
def build_all_actions(arm_obj):
    if not arm_obj.animation_data:
        arm_obj.animation_data_create()
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm_obj.pose.bones

    def reset_pb():
        for b in pb:
            b.location = (0, 0, 0)
            b.rotation_euler = (0, 0, 0)
            b.scale = (1, 1, 1)

    # Helper to insert keyframe
    def kf(bname, prop, val, f):
        b = pb[bname]
        setattr(b, prop, val)
        b.keyframe_insert(prop, frame=f)

    # 1. Action_Idle (Upright posture, gentle breathing, head held straight forward)
    act_idle = bpy.data.actions.new("Action_Idle")
    arm_obj.animation_data.action = act_idle
    reset_pb()
    for f, bz, rx, ay in [(1, 0.0, 0.0, 0.0), (20, 0.002, math.radians(1.0), math.radians(0.8)), (40, 0.0, 0.0, 0.0)]:
        kf("Root", "rotation_euler", (0, 0, 0), f)
        kf("Hips", "location", (0, 0, bz), f)
        kf("Hips", "rotation_euler", (0, 0, 0), f)
        kf("Spine", "rotation_euler", (0, 0, 0), f)
        kf("Chest", "rotation_euler", (rx, 0, 0), f)
        kf("Neck", "rotation_euler", (0, 0, 0), f)
        kf("Head", "rotation_euler", (0, 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (0, 0, math.radians(-7) + ay), f)
        kf("UpperArm.R", "rotation_euler", (0, 0, math.radians(7) - ay), f)
        kf("Forearm.L", "rotation_euler", (math.radians(10), 0, math.radians(-3)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(10), 0, math.radians(3)), f)
        kf("Hand.L", "rotation_euler", (0, 0, 0), f)
        kf("Hand.R", "rotation_euler", (0, 0, 0), f)
        kf("Thigh.L", "rotation_euler", (0, 0, 0), f)
        kf("Shin.L", "rotation_euler", (0, 0, 0), f)
        kf("Foot.L", "rotation_euler", (0, 0, 0), f)
        kf("Thigh.R", "rotation_euler", (0, 0, 0), f)
        kf("Shin.R", "rotation_euler", (0, 0, 0), f)
        kf("Foot.R", "rotation_euler", (0, 0, 0), f)
        kf("Eye.L", "scale", (1.0, 1.0, 1.0), f)
        kf("Eye.R", "scale", (1.0, 1.0, 1.0), f)

    # 2. Action_Walk (Natural walk cycle)
    act_walk = bpy.data.actions.new("Action_Walk")
    arm_obj.animation_data.action = act_walk
    reset_pb()
    walk_keys = [
        (1,   math.radians(24),  0.0,               math.radians(-22), math.radians(-15), math.radians(-20), math.radians(20),  0.0),
        (8,   0.0,               math.radians(-12), 0.0,               0.0,               0.0,               0.0,               0.012),
        (15,  math.radians(-22), math.radians(-15), math.radians(24),  0.0,               math.radians(20),  math.radians(-20), 0.0),
        (22,  0.0,               0.0,               0.0,               math.radians(-12), 0.0,               0.0,               0.012),
        (30,  math.radians(24),  0.0,               math.radians(-22), math.radians(-15), math.radians(-20), math.radians(20),  0.0),
    ]
    for f, th_l, sh_l, th_r, sh_r, a_l, a_r, bz in walk_keys:
        kf("Hips", "location", (0, 0, bz), f)
        kf("Spine", "rotation_euler", (0, 0, 0), f)
        kf("Chest", "rotation_euler", (0, 0, 0), f)
        kf("Neck", "rotation_euler", (0, 0, 0), f)
        kf("Head", "rotation_euler", (0, 0, 0), f)
        kf("Thigh.L", "rotation_euler", (th_l, 0, 0), f)
        kf("Shin.L", "rotation_euler", (sh_l, 0, 0), f)
        kf("Thigh.R", "rotation_euler", (th_r, 0, 0), f)
        kf("Shin.R", "rotation_euler", (sh_r, 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (a_l, 0, math.radians(-6)), f)
        kf("UpperArm.R", "rotation_euler", (a_r, 0, math.radians(6)), f)
        kf("Forearm.L", "rotation_euler", (math.radians(22), 0, 0), f)
        kf("Forearm.R", "rotation_euler", (math.radians(22), 0, 0), f)

    # 3. Action_Run (Dynamic sprint cycle)
    act_run = bpy.data.actions.new("Action_Run")
    arm_obj.animation_data.action = act_run
    reset_pb()
    run_keys = [
        (1,  math.radians(45),  0.0,               math.radians(-38), math.radians(-35), math.radians(-45), math.radians(45),  0.010),
        (5,  0.0,               math.radians(-25), 0.0,               0.0,               0.0,               0.0,               0.035),
        (10, math.radians(-38), math.radians(-35), math.radians(45),  0.0,               math.radians(45),  math.radians(-45), 0.010),
        (15, 0.0,               0.0,               0.0,               math.radians(-25), 0.0,               0.0,               0.035),
        (20, math.radians(45),  0.0,               math.radians(-38), math.radians(-35), math.radians(-45), math.radians(45),  0.010),
    ]
    for f, th_l, sh_l, th_r, sh_r, a_l, a_r, bz in run_keys:
        kf("Hips", "location", (0, 0, bz), f)
        kf("Spine", "rotation_euler", (math.radians(-6), 0, 0), f)
        kf("Chest", "rotation_euler", (math.radians(-4), 0, 0), f)
        kf("Neck", "rotation_euler", (0, 0, 0), f)
        kf("Head", "rotation_euler", (math.radians(6), 0, 0), f)
        kf("Thigh.L", "rotation_euler", (th_l, 0, 0), f)
        kf("Shin.L", "rotation_euler", (sh_l, 0, 0), f)
        kf("Thigh.R", "rotation_euler", (th_r, 0, 0), f)
        kf("Shin.R", "rotation_euler", (sh_r, 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (a_l, 0, math.radians(-10)), f)
        kf("UpperArm.R", "rotation_euler", (a_r, 0, math.radians(10)), f)
        kf("Forearm.L", "rotation_euler", (math.radians(75), 0, 0), f)
        kf("Forearm.R", "rotation_euler", (math.radians(75), 0, 0), f)

    # 4. Action_Sit (Sitting on classroom chair)
    act_sit = bpy.data.actions.new("Action_Sit")
    arm_obj.animation_data.action = act_sit
    reset_pb()
    for f in [1, 40]:
        kf("Hips", "location", (0, 0, -0.090), f)
        kf("Spine", "rotation_euler", (0, 0, 0), f)
        kf("Chest", "rotation_euler", (0, 0, 0), f)
        kf("Neck", "rotation_euler", (0, 0, 0), f)
        kf("Head", "rotation_euler", (0, 0, 0), f)
        kf("Thigh.L", "rotation_euler", (math.radians(82), 0, 0), f)
        kf("Shin.L", "rotation_euler", (math.radians(-82), 0, 0), f)
        kf("Thigh.R", "rotation_euler", (math.radians(82), 0, 0), f)
        kf("Shin.R", "rotation_euler", (math.radians(-82), 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(25), 0, math.radians(-10)), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(25), 0, math.radians(10)), f)
        kf("Forearm.L", "rotation_euler", (math.radians(65), 0, math.radians(-15)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(65), 0, math.radians(15)), f)

    # 5. Action_Sleep_Desk (Resting head on desk)
    act_sleep = bpy.data.actions.new("Action_Sleep_Desk")
    arm_obj.animation_data.action = act_sleep
    reset_pb()
    for f in [1, 40]:
        kf("Hips", "location", (0, 0, -0.090), f)
        kf("Spine", "rotation_euler", (math.radians(-25), 0, 0), f)
        kf("Chest", "rotation_euler", (math.radians(-28), 0, 0), f)
        kf("Head", "rotation_euler", (math.radians(-20), 0, math.radians(18)), f)
        kf("Thigh.L", "rotation_euler", (math.radians(82), 0, 0), f)
        kf("Shin.L", "rotation_euler", (math.radians(-82), 0, 0), f)
        kf("Thigh.R", "rotation_euler", (math.radians(82), 0, 0), f)
        kf("Shin.R", "rotation_euler", (math.radians(-82), 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(45), 0, math.radians(-15)), f)
        kf("Forearm.L", "rotation_euler", (math.radians(85), 0, math.radians(-40)), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(45), 0, math.radians(15)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(85), 0, math.radians(40)), f)

    # 6. Action_Write (Writing with pen on notebook)
    act_write = bpy.data.actions.new("Action_Write")
    arm_obj.animation_data.action = act_write
    reset_pb()
    for f, wr in [(1, 0), (13, math.radians(10)), (26, 0)]:
        kf("Hips", "location", (0, 0, -0.090), f)
        kf("Spine", "rotation_euler", (math.radians(-15), 0, 0), f)
        kf("Chest", "rotation_euler", (math.radians(-18), 0, 0), f)
        kf("Head", "rotation_euler", (math.radians(-15), 0, 0), f)
        kf("Thigh.L", "rotation_euler", (math.radians(82), 0, 0), f)
        kf("Shin.L", "rotation_euler", (math.radians(-82), 0, 0), f)
        kf("Thigh.R", "rotation_euler", (math.radians(82), 0, 0), f)
        kf("Shin.R", "rotation_euler", (math.radians(-82), 0, 0), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(35), 0, math.radians(15)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(80) + wr, 0, math.radians(25)), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(30), 0, math.radians(-15)), f)
        kf("Forearm.L", "rotation_euler", (math.radians(70), 0, math.radians(-25)), f)

    # 7. Action_Raise_Hand (Asking question in class)
    act_raise = bpy.data.actions.new("Action_Raise_Hand")
    arm_obj.animation_data.action = act_raise
    reset_pb()
    for f in [1, 40]:
        kf("Spine", "rotation_euler", (math.radians(4), 0, 0), f)
        kf("Chest", "rotation_euler", (math.radians(6), 0, math.radians(8)), f)
        kf("Head", "rotation_euler", (math.radians(12), 0, 0), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(155), 0, math.radians(12)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(18), 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (0, 0, math.radians(-8)), f)

    # 8. Action_Wave (Friendly wave to classmates)
    act_wave = bpy.data.actions.new("Action_Wave")
    arm_obj.animation_data.action = act_wave
    reset_pb()
    for f, rot in [(1, -0.2), (15, 0.2), (30, -0.2)]:
        kf("UpperArm.R", "rotation_euler", (math.radians(85), 0, math.radians(20)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(60), rot, 0), f)
        kf("Head", "rotation_euler", (0, 0, math.radians(8)), f)

    # 9. Action_Bow (Respectful Vietnamese student bow)
    act_bow = bpy.data.actions.new("Action_Bow")
    arm_obj.animation_data.action = act_bow
    reset_pb()
    for f, ang in [(1, 0), (18, math.radians(-32)), (35, 0)]:
        kf("Spine", "rotation_euler", (ang * 0.6, 0, 0), f)
        kf("Chest", "rotation_euler", (ang * 0.4, 0, 0), f)
        kf("Head", "rotation_euler", (ang * 0.5, 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(15), 0, math.radians(-5)), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(15), 0, math.radians(5)), f)

    # 10. Action_Cheer (Celebrating score / victory)
    act_cheer = bpy.data.actions.new("Action_Cheer")
    arm_obj.animation_data.action = act_cheer
    reset_pb()
    for f, bz in [(1, 0), (15, 0.025), (30, 0)]:
        kf("Hips", "location", (0, 0, bz), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(145), 0, math.radians(-25)), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(145), 0, math.radians(25)), f)
        kf("Forearm.L", "rotation_euler", (math.radians(35), 0, 0), f)
        kf("Forearm.R", "rotation_euler", (math.radians(35), 0, 0), f)
        kf("Head", "rotation_euler", (math.radians(15), 0, 0), f)

    # 11. Action_Jump (Happy mid-air jump)
    act_jump = bpy.data.actions.new("Action_Jump")
    arm_obj.animation_data.action = act_jump
    reset_pb()
    for f, bz, th in [(1, 0, 0), (8, -0.035, math.radians(35)), (18, 0.085, math.radians(-20)), (35, 0, 0)]:
        kf("Hips", "location", (0, 0, bz), f)
        kf("Thigh.L", "rotation_euler", (th, 0, 0), f)
        kf("Shin.L", "rotation_euler", (-th, 0, 0), f)
        kf("Thigh.R", "rotation_euler", (th, 0, 0), f)
        kf("Shin.R", "rotation_euler", (-th, 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(120), 0, math.radians(-20)), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(120), 0, math.radians(20)), f)

    # 12. Action_Salute_Flag (Solemn pioneer flag salute)
    act_salute = bpy.data.actions.new("Action_Salute_Flag")
    arm_obj.animation_data.action = act_salute
    reset_pb()
    for f in [1, 30]:
        kf("UpperArm.R", "rotation_euler", (math.radians(95), 0, math.radians(35)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(105), 0, math.radians(20)), f)
        kf("UpperArm.L", "rotation_euler", (0, 0, math.radians(-6)), f)
        kf("Head", "rotation_euler", (math.radians(5), 0, 0), f)

    # 13. Action_Talk (Animated conversation gesture)
    act_talk = bpy.data.actions.new("Action_Talk")
    arm_obj.animation_data.action = act_talk
    reset_pb()
    for f, hrot, arot in [(1, 0, 0), (10, math.radians(6), math.radians(20)), (20, math.radians(-6), math.radians(35)), (30, math.radians(4), math.radians(15)), (40, 0, 0)]:
        kf("Head", "rotation_euler", (0, 0, hrot), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(25) + arot, 0, math.radians(12)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(55) + arot, 0, math.radians(15)), f)

    # 14. Action_Thinking (Pondering problem, hand on chin)
    act_think = bpy.data.actions.new("Action_Thinking")
    arm_obj.animation_data.action = act_think
    reset_pb()
    for f in [1, 40]:
        kf("Head", "rotation_euler", (math.radians(8), 0, math.radians(10)), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(65), 0, math.radians(25)), f)
        kf("Forearm.R", "rotation_euler", (math.radians(110), 0, math.radians(20)), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(15), 0, math.radians(-10)), f)

    # 15. Action_Sad_Disappointed (Drooping posture)
    act_sad = bpy.data.actions.new("Action_Sad_Disappointed")
    arm_obj.animation_data.action = act_sad
    reset_pb()
    for f in [1, 40]:
        kf("Spine", "rotation_euler", (math.radians(-8), 0, 0), f)
        kf("Chest", "rotation_euler", (math.radians(-12), 0, 0), f)
        kf("Head", "rotation_euler", (math.radians(-20), 0, 0), f)
        kf("UpperArm.L", "rotation_euler", (math.radians(-8), 0, math.radians(-4)), f)
        kf("UpperArm.R", "rotation_euler", (math.radians(-8), 0, math.radians(4)), f)

    # 16. Action_Blink (Independent eye scale)
    act_blink = bpy.data.actions.new("Action_Blink")
    arm_obj.animation_data.action = act_blink
    reset_pb()
    for side in ["L", "R"]:
        for f, sz in [(1, 1.0), (4, 1.0), (7, 0.08), (10, 1.0), (15, 1.0)]:
            kf(f"Eye.{side}", "scale", (1.0, 1.0, sz), f)

    # Push all 16 canonical actions to NLA tracks and set fake user
    canonical_acts = [
        act_idle, act_walk, act_run, act_sit, act_sleep, act_write,
        act_raise, act_wave, act_bow, act_cheer, act_jump, act_salute,
        act_talk, act_think, act_sad, act_blink
    ]
    for act in canonical_acts:
        act.use_fake_user = True
        tr = arm_obj.animation_data.nla_tracks.new()
        tr.name = act.name
        tr.strips.new(act.name, 1, act)

    # 17. Action_Deform_Poses_Test (Phase 4 & 5 Deformation Verification)
    act_deform = bpy.data.actions.new("Action_Deform_Poses_Test")
    act_deform.use_fake_user = True
    arm_obj.animation_data.action = act_deform

    # Frame 1: Neutral Standing
    reset_pb()
    kf("UpperArm.L", "rotation_euler", (0, 0, math.radians(-8)), 1)
    kf("Forearm.L",  "rotation_euler", (math.radians(12), 0, math.radians(6)), 1)
    kf("UpperArm.R", "rotation_euler", (0, 0, math.radians(8)), 1)
    kf("Forearm.R",  "rotation_euler", (math.radians(12), 0, math.radians(-6)), 1)

    # Frame 2: Walk Contact Pose
    reset_pb()
    kf("Hips", "location", (0, 0, 0.012), 2)
    kf("Thigh.L", "rotation_euler", (math.radians(24), 0, 0), 2)
    kf("Thigh.R", "rotation_euler", (math.radians(-22), 0, 0), 2)
    kf("Shin.R", "rotation_euler", (math.radians(-15), 0, 0), 2)
    kf("UpperArm.L", "rotation_euler", (math.radians(-20), 0, math.radians(-6)), 2)
    kf("UpperArm.R", "rotation_euler", (math.radians(20), 0, math.radians(6)), 2)

    # Frame 3: Run Apex Sprint
    reset_pb()
    kf("Hips", "location", (0, 0, 0.024), 3)
    kf("Spine", "rotation_euler", (math.radians(-12), 0, 0), 3)
    kf("Chest", "rotation_euler", (math.radians(-8), 0, 0), 3)
    kf("Thigh.L", "rotation_euler", (math.radians(45), 0, 0), 3)
    kf("Thigh.R", "rotation_euler", (math.radians(-38), 0, 0), 3)
    kf("Shin.R", "rotation_euler", (math.radians(-35), 0, 0), 3)
    kf("UpperArm.L", "rotation_euler", (math.radians(-45), 0, math.radians(-10)), 3)
    kf("Forearm.L",  "rotation_euler", (math.radians(75), 0, math.radians(10)), 3)
    kf("UpperArm.R", "rotation_euler", (math.radians(45), 0, math.radians(10)), 3)
    kf("Forearm.R",  "rotation_euler", (math.radians(75), 0, math.radians(-10)), 3)

    # Frame 4: Sitting on Classroom Chair (90 deg knees without joint gap)
    reset_pb()
    kf("Hips", "location", (0, 0, -0.090), 4)
    kf("Thigh.L", "rotation_euler", (math.radians(82), 0, 0), 4)
    kf("Shin.L", "rotation_euler", (math.radians(-82), 0, 0), 4)
    kf("Thigh.R", "rotation_euler", (math.radians(82), 0, 0), 4)
    kf("Shin.R", "rotation_euler", (math.radians(-82), 0, 0), 4)
    kf("UpperArm.L", "rotation_euler", (math.radians(25), 0, math.radians(-10)), 4)
    kf("Forearm.L",  "rotation_euler", (math.radians(65), 0, math.radians(-15)), 4)
    kf("UpperArm.R", "rotation_euler", (math.radians(25), 0, math.radians(10)), 4)
    kf("Forearm.R",  "rotation_euler", (math.radians(65), 0, math.radians(15)), 4)

    # Frame 5: Bend Forward (Torso and waist flex without separation)
    reset_pb()
    kf("Hips", "location", (0, -0.035, -0.025), 5)
    kf("Spine", "rotation_euler", (math.radians(-28), 0, 0), 5)
    kf("Chest", "rotation_euler", (math.radians(-22), 0, 0), 5)
    kf("Head",  "rotation_euler", (math.radians(-15), 0, 0), 5)
    kf("UpperArm.L", "rotation_euler", (math.radians(-35), 0, math.radians(-6)), 5)
    kf("UpperArm.R", "rotation_euler", (math.radians(-42), 0, math.radians(6)), 5)

    # Frame 6: Reach High (Shoulder elevation without collapsing)
    reset_pb()
    kf("Chest", "rotation_euler", (math.radians(6), 0, math.radians(10)), 6)
    kf("Head",  "rotation_euler", (math.radians(15), 0, 0), 6)
    kf("UpperArm.R", "rotation_euler", (math.radians(138), 0, math.radians(15)), 6)
    kf("Forearm.R",  "rotation_euler", (math.radians(15), 0, 0), 6)
    kf("UpperArm.L", "rotation_euler", (math.radians(-20), 0, math.radians(-12)), 6)

    # Reset to Idle frame 1 (Completely upright rest pose)
    arm_obj.animation_data.action = act_idle
    reset_pb()
    for b in pb:
        b.location = (0, 0, 0)
        b.rotation_euler = (0, 0, 0)
        b.scale = (1, 1, 1)
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.context.scene.frame_set(1)
    bpy.context.view_layer.update()

# =============================================================================
# MAIN BASE CHARACTER PIPELINE
# =============================================================================
def main():
    log("1. Initializing clean production scene...")
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Setup 5 Production Collections
    col_master = bpy.context.scene.collection

    col_body = bpy.data.collections.new("01_Base_Body")
    col_outfit = bpy.data.collections.new("02_Outfit_Uniform")
    col_hair = bpy.data.collections.new("03_Hair_Default")
    col_acc = bpy.data.collections.new("04_Accessories")
    col_face = bpy.data.collections.new("05_Facial_Features")
    col_rig = bpy.data.collections.new("00_Armature")

    for col in [col_rig, col_body, col_outfit, col_hair, col_acc, col_face]:
        col_master.children.link(col)

    log("2. Setting up cozy matte school-life PBR materials...")
    mats = {
        "skin":        create_mat("M_Skin", "#f5d4be", roughness=0.65),
        "hair":        create_mat("M_Hair", "#1e1919", roughness=0.45),
        "shirt":       create_mat("M_Shirt", "#f8f7f2", roughness=0.55),
        "scarf":       create_mat("M_Scarf", "#dd2828", roughness=0.50),
        "pants":       create_mat("M_Pants", "#243354", roughness=0.62),
        "belt":        create_mat("M_Belt", "#1b1b22", roughness=0.45),
        "buckle":      create_mat("M_Buckle", "#d5dade", roughness=0.30, metallic=0.70),
        "shoe":        create_mat("M_Shoe", "#f5f4ef", roughness=0.55),
        "sole":        create_mat("M_Sole", "#b5a99d", roughness=0.70),
        "nametag":     create_mat("M_Nametag", "#d2e6fa", roughness=0.40),
        "eye_black":   create_mat("M_Eye_Black", "#121216", roughness=0.15),
        "eye_hl":      create_mat("M_Eye_Highlight", "#ffffff", roughness=0.10, emission="#ffffff"),
        "blush":       create_mat("M_Blush", "#f58897", roughness=0.70),
        "mouth":       create_mat("M_Mouth", "#823030", roughness=0.40),
    }

    log("3. Building Base Body geometry (Smooth Head, Neck, Arms & Hands)...")
    head_obj, ears = build_smooth_head(mats, col_body)
    arm_l = build_smooth_arm(-1, "L", mats, col_body)
    arm_r = build_smooth_arm(1, "R", mats, col_body)

    log("4. Building Outfit Uniform (Continuous Torso, Pants, Shoes, Collar)...")
    torso_legs_obj, collar = build_smooth_torso_and_legs(mats, col_outfit)

    log("5. Building Modular Hair Groom (Cap, Bangs & Sideburns)...")
    hair_objs = build_smooth_hair(mats, col_hair)

    log("6. Building Facial Features (Enlarged Eyes, Eyebrows, Nose, Mouth, Blush)...")
    features = build_accessories_and_face(mats, col_acc, col_face)

    log("7. Building Standard 19-Bone Humanoid Armature...")
    arm_rig = build_humanoid_armature(col_rig)

    log("8. Binding meshes and applying smooth weight gradient skinning...")
    skin_mesh_smooth(head_obj, arm_rig, "head")
    for ear in ears:
        skin_mesh_smooth(ear, arm_rig, "rigid")

    skin_mesh_smooth(arm_l, arm_rig, "arm_l")
    skin_mesh_smooth(arm_r, arm_rig, "arm_r")
    skin_mesh_smooth(torso_legs_obj, arm_rig, "torso_legs")
    skin_mesh_smooth(collar, arm_rig, "rigid")

    for h_obj in hair_objs:
        skin_mesh_smooth(h_obj, arm_rig, "rigid")

    skin_mesh_smooth(features["nose"], arm_rig, "rigid")
    skin_mesh_smooth(features["mouth"], arm_rig, "rigid")
    for brow in features["eyebrows"]:
        skin_mesh_smooth(brow, arm_rig, "rigid")
    for eye in features["eyes"]:
        skin_mesh_smooth(eye, arm_rig, "rigid")
    for hl in features["highlights"]:
        skin_mesh_smooth(hl, arm_rig, "rigid")
    for blush in features["blushes"]:
        skin_mesh_smooth(blush, arm_rig, "rigid")

    log("9. Transferring / building all 16 Animation Actions + Deformation Poses...")
    build_all_actions(arm_rig)

    log(f"10. Saving Master Base Blend File: {OUTPUT_BASE_BLEND}")
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BASE_BLEND)

    log(f"11. Updating Skinned Character Blend File: {OUTPUT_SKINNED_BLEND}")
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_SKINNED_BLEND)

    log("12. Exporting real-time GLB models for Three.js (Canonical 16 Actions)...")
    # Remove temporary deformation test action so GLB contains exactly the 16 game actions
    temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
    if temp_act:
        bpy.data.actions.remove(temp_act)
    # Select all meshes and armature
    bpy.ops.object.select_all(action="DESELECT")
    arm_rig.select_set(True)
    for obj in bpy.data.objects:
        if obj.type == "MESH":
            obj.select_set(True)

    export_settings = {
        "export_format": "GLB",
        "use_selection": True,
        "export_apply": False,
        "export_yup": True,
        "export_materials": "EXPORT",
        "export_animations": True,
        "export_skins": True,
    }

    log(f"Exporting: {OUTPUT_GLB_BASE}")
    bpy.ops.export_scene.gltf(filepath=OUTPUT_GLB_BASE, **export_settings)

    log(f"Exporting: {OUTPUT_GLB_SKINNED}")
    bpy.ops.export_scene.gltf(filepath=OUTPUT_GLB_SKINNED, **export_settings)

    log(f"Exporting: {OUTPUT_GLB_ACTIVE}")
    bpy.ops.export_scene.gltf(filepath=OUTPUT_GLB_ACTIVE, **export_settings)

    log("=== BASE CHARACTER SYSTEM GENERATION & EXPORT COMPLETE ===")

if __name__ == "__main__":
    import traceback
    try:
        main()
    except Exception as e:
        log(f"CRITICAL ERROR: {e}")
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            traceback.print_exc(file=f)
