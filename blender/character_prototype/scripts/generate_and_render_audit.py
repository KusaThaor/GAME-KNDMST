import bpy
import bmesh
import math
import os
import sys
import shutil

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
TEST_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_audit")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_audit"
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "audit_execution_log.txt")

os.makedirs(TEST_DIR, exist_ok=True)
os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING PRODUCTION AUDIT COMPREHENSIVE SUITE\n")

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def create_mat(name, hex_color, roughness=0.55, metallic=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
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

def setup_lighting_and_cam(cam_loc=(0.0, 2.5, 0.42), cam_rot=(88, 0, 180), res_x=1200, res_y=750):
    scene = bpy.context.scene
    cam_obj = bpy.data.objects.get("Cam")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam")
        cam_data.lens = 50
        cam_obj = bpy.data.objects.new("Cam", cam_data)
        scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = (math.radians(cam_rot[0]), math.radians(cam_rot[1]), math.radians(cam_rot[2]))

    if not scene.world:
        scene.world = bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
        bg_node.inputs["Strength"].default_value = 0.85

    def ensure_sun(name, energy, rot):
        obj = bpy.data.objects.get(name)
        if not obj:
            l = bpy.data.lights.new(name, "SUN")
            obj = bpy.data.objects.new(name, l)
            scene.collection.objects.link(obj)
        obj.data.energy = energy
        obj.rotation_euler = (math.radians(rot[0]), math.radians(rot[1]), math.radians(rot[2]))
        return obj

    ensure_sun("Key", 4.8, (52, 22, -32))
    ensure_sun("Fill", 2.8, (40, -30, 145))
    ensure_sun("Bounce", 1.6, (-45, 15, 20))
    ensure_sun("Rim", 3.2, (30, 15, 35))

    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

# =============================================================================
# PART 1: THREE HEIGHT VARIANTS (90%, 100%, 110%) & COMPARISON RENDER
# =============================================================================
def build_and_render_height_variants():
    log("\n=== 1. BUILDING & RENDERING HEIGHT VARIANTS LINEUP ===")
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)

    # We want a 3-character side-by-side lineup in one scene:
    # 90% (Left, X = -0.48)
    # 100% (Center, X = 0.0)
    # 110% (Right, X = +0.48)
    
    # Save the base objects collection
    base_objs = list(bpy.context.scene.objects)
    arm_orig = bpy.data.objects.get("Student_Armature")
    
    # Duplicate base character for Left (90%) and Right (110%)
    variants_info = [
        ("Student_90",  -0.46, 0.90, "90% (Freshman / Petite)"),
        ("Student_100",  0.00, 1.00, "100% (Standard Base)"),
        ("Student_110",  0.46, 1.10, "110% (Senior / Taller)")
    ]

    # Center (100%) stays in center
    arm_orig.name = "Armature_100"
    
    for prefix, offset_x, scale_f, label in [variants_info[0], variants_info[2]]:
        # Duplicate meshes and armature
        bpy.ops.object.select_all(action="DESELECT")
        mesh_and_arm = [o for o in base_objs if o.type in ["MESH", "ARMATURE"]]
        for o in mesh_and_arm:
            o.select_set(True)
        bpy.ops.object.duplicate()
        dup_objs = bpy.context.selected_objects
        
        dup_arm = None
        for o in dup_objs:
            if o.type == "ARMATURE":
                dup_arm = o
                o.name = f"Armature_{prefix}"
            else:
                o.name = f"{o.name}_{prefix}"

        # Position and scale the duplicated variant
        for o in dup_objs:
            # Shift X and scale
            o.location.x += offset_x
            o.scale = (scale_f, scale_f, scale_f)
            # Retarget Armature modifier to duplicated armature
            if o.type == "MESH":
                for m in o.modifiers:
                    if m.type == "ARMATURE":
                        m.object = dup_arm

    # Add Height Measurement Ruler / Guide lines in background
    # Standard height ~0.84m. 90% ~0.76m, 110% ~0.92m
    ruler_col = bpy.data.collections.new("Ruler_Guides")
    bpy.context.scene.collection.children.link(ruler_col)
    
    ruler_lines = [
        ("Ruler_110", 0.924, (1.0, 0.3, 0.3, 1.0), "110% (0.92m)"),
        ("Ruler_100", 0.840, (0.3, 1.0, 0.4, 1.0), "100% (0.84m)"),
        ("Ruler_90",  0.756, (0.3, 0.6, 1.0, 1.0), "90%  (0.76m)"),
    ]
    mat_ruler = create_mat("M_Ruler", "#4a5568", roughness=0.3)
    for rname, rz, color, text in ruler_lines:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.003, depth=1.4, location=(0, -0.15, rz))
        cyl = bpy.context.active_object
        cyl.name = rname
        cyl.rotation_euler = (0, math.radians(90), 0)
        cyl.data.materials.append(mat_ruler)
        ruler_col.objects.link(cyl)
        bpy.context.scene.collection.objects.unlink(cyl)

    # Render Height Variants Lineup
    setup_lighting_and_cam(cam_loc=(0.0, 2.7, 0.45), cam_rot=(88, 0, 180), res_x=1200, res_y=750)
    out_img = os.path.join(PREVIEWS_DIR, "height_variants_comparison.png")
    bpy.context.scene.render.filepath = out_img
    bpy.ops.render.render(write_still=True)
    shutil.copy(out_img, os.path.join(ARTIFACT_DIR, "height_variants_comparison.png"))
    log(f"Rendered: {out_img}")

    # Save isolated test blend
    lineup_blend = os.path.join(TEST_DIR, "student_height_lineup.blend")
    bpy.ops.wm.save_as_mainfile(filepath=lineup_blend)
    log(f"Saved: {lineup_blend}")

    # Export individual height variant GLBs for Three.js validation
    for hname, scale_v in [("student_height_90", 0.90), ("student_height_100", 1.00), ("student_height_110", 1.10)]:
        bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
        arm_h = bpy.data.objects.get("Student_Armature")
        arm_h.scale = (scale_v, scale_v, scale_v)
        for o in bpy.data.objects:
            if o.type == "MESH":
                o.scale = (scale_v, scale_v, scale_v)
        h_glb_path = os.path.join(TEST_DIR, f"{hname}.glb")
        temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
        if temp_act:
            bpy.data.actions.remove(temp_act)
        bpy.ops.object.select_all(action="DESELECT")
        arm_h.select_set(True)
        for o in bpy.data.objects:
            if o.type == "MESH":
                o.select_set(True)
        bpy.ops.export_scene.gltf(
            filepath=h_glb_path,
            export_format='GLB',
            use_selection=True,
            export_yup=True,
            export_animations=True,
            export_all_influences=True
        )
        log(f"Exported height variant: {h_glb_path} ({os.path.getsize(h_glb_path)/1024:.1f} KB)")

# =============================================================================
# PART 2: TWO MODULAR HAIRSTYLES (SPORTY SPIKY & CUTE BOB) + COMPARISON RENDER
# =============================================================================
def build_and_render_hairstyle_variants():
    log("\n=== 2. BUILDING & RENDERING HAIRSTYLE VARIANTS LINEUP ===")
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    
    # We want 3 characters side-by-side:
    # 1. Default Chibi Hair (Left, X = -0.45)
    # 2. Sporty Short Spiky (Center, X = 0.0)
    # 3. Cute Female Bob with Hairpin (Right, X = +0.45)

    base_objs = list(bpy.context.scene.objects)
    arm_orig = bpy.data.objects.get("Student_Armature")
    head_z = 0.525
    
    mats = {
        "black": bpy.data.materials.get("M_Hair"),
        "brown": create_mat("M_Hair_Brown", "#2b1b17", roughness=0.50),
        "dark_navy": create_mat("M_Hair_Navy", "#161b26", roughness=0.50),
        "hairpin": create_mat("M_Hairpin_Red", "#d92027", roughness=0.25, metallic=0.6)
    }

    # Left = Default Hair (move original base to X = -0.45)
    for o in base_objs:
        if o.type in ["MESH", "ARMATURE"]:
            o.location.x -= 0.45

    # Center: Sporty Short Spiky Hair (Duplicate base body & uniform to X = 0)
    bpy.ops.object.select_all(action="DESELECT")
    body_and_clothes = [o for o in base_objs if o.type in ["MESH", "ARMATURE"] and not o.name.startswith("Hair_")]
    for o in body_and_clothes:
        o.select_set(True)
    bpy.ops.object.duplicate()
    spiky_objs = bpy.context.selected_objects
    arm_spiky = None
    for o in spiky_objs:
        o.location.x += 0.45 # back to 0.0
        if o.type == "ARMATURE":
            arm_spiky = o
            o.name = "Armature_Spiky"
        else:
            o.name = f"{o.name}_Spiky"
            for m in o.modifiers:
                if m.type == "ARMATURE":
                    m.object = arm_spiky

    # Build Sporty Spiky Hair meshes at X = 0.0:
    # A. Spiky Cap (Close-cropped athletic sides)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.022, head_z + 0.040))
    s_cap = bpy.context.active_object
    s_cap.name = "Hair_Spiky_Cap"
    s_cap.scale = (0.40, 0.38, 0.29)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = s_cap.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    s_cap.data.materials.append(mats["dark_navy"])
    apply_smooth(s_cap)
    vg = s_cap.vertex_groups.new(name="Head")
    vg.add(list(range(len(s_cap.data.vertices))), 1.0, 'REPLACE')
    m = s_cap.modifiers.new("Armature", 'ARMATURE')
    m.object = arm_spiky

    # B. Dynamic Spiky Crest (Center spike clump)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.050, head_z + 0.095))
    s_crest = bpy.context.active_object
    s_crest.name = "Hair_Spike_Center"
    s_crest.scale = (0.16, 0.18, 0.12)
    s_crest.rotation_euler = (math.radians(-32), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = s_crest.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    s_crest.data.materials.append(mats["dark_navy"])
    apply_smooth(s_crest)
    vg = s_crest.vertex_groups.new(name="Head")
    vg.add(list(range(len(s_crest.data.vertices))), 1.0, 'REPLACE')
    m = s_crest.modifiers.new("Armature", 'ARMATURE')
    m.object = arm_spiky

    # C. Left & Right angled spikes
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.110, 0.035, head_z + 0.080))
        s_side = bpy.context.active_object
        s_side.name = f"Hair_Spike_{sign}"
        s_side.scale = (0.12, 0.15, 0.10)
        s_side.rotation_euler = (math.radians(-26), math.radians(side * 15), math.radians(side * -10))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = s_side.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 2
        s_side.data.materials.append(mats["dark_navy"])
        apply_smooth(s_side)
        vg = s_side.vertex_groups.new(name="Head")
        vg.add(list(range(len(s_side.data.vertices))), 1.0, 'REPLACE')
        m = s_side.modifiers.new("Armature", 'ARMATURE')
        m.object = arm_spiky

    # Right: Cute Female Bob with Hairpin (Duplicate base body to X = +0.45)
    bpy.ops.object.select_all(action="DESELECT")
    for o in body_and_clothes:
        o.select_set(True)
    bpy.ops.object.duplicate()
    bob_objs = bpy.context.selected_objects
    arm_bob = None
    for o in bob_objs:
        o.location.x += 0.90 # from -0.45 to +0.45
        if o.type == "ARMATURE":
            arm_bob = o
            o.name = "Armature_Bob"
        else:
            o.name = f"{o.name}_Bob"
            for m in o.modifiers:
                if m.type == "ARMATURE":
                    m.object = arm_bob

    # Build Cute Female Bob Hair at X = 0.45:
    cx_bob = 0.45
    # A. Bob Rounded Cranial Cap
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx_bob, -0.020, head_z + 0.045))
    b_cap = bpy.context.active_object
    b_cap.name = "Hair_Bob_Cap"
    b_cap.scale = (0.43, 0.41, 0.32)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = b_cap.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    b_cap.data.materials.append(mats["brown"])
    apply_smooth(b_cap)
    vg = b_cap.vertex_groups.new(name="Head")
    vg.add(list(range(len(b_cap.data.vertices))), 1.0, 'REPLACE')
    m = b_cap.modifiers.new("Armature", 'ARMATURE')
    m.object = arm_bob

    # B. Straight Bob Bangs (Blunt cute fringe)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx_bob, 0.078, head_z + 0.062))
    b_bangs = bpy.context.active_object
    b_bangs.name = "Hair_Bob_Bangs"
    b_bangs.scale = (0.36, 0.20, 0.12)
    b_bangs.rotation_euler = (math.radians(-20), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = b_bangs.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    b_bangs.data.materials.append(mats["brown"])
    apply_smooth(b_bangs)
    vg = b_bangs.vertex_groups.new(name="Head")
    vg.add(list(range(len(b_bangs.data.vertices))), 1.0, 'REPLACE')
    m = b_bangs.modifiers.new("Armature", 'ARMATURE')
    m.object = arm_bob

    # C. Flared Bob Side Hair (Tapered bob locks curving inward at cheeks)
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx_bob + side * 0.176, 0.015, head_z - 0.010))
        b_side = bpy.context.active_object
        b_side.name = f"Hair_Bob_Side_{sign}"
        b_side.scale = (0.045, 0.120, 0.155)
        b_side.rotation_euler = (math.radians(-8), math.radians(side * -5), math.radians(side * -8))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = b_side.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 2
        b_side.data.materials.append(mats["brown"])
        apply_smooth(b_side)
        vg = b_side.vertex_groups.new(name="Head")
        vg.add(list(range(len(b_side.data.vertices))), 1.0, 'REPLACE')
        m = b_side.modifiers.new("Armature", 'ARMATURE')
        m.object = arm_bob

    # D. Cute Cherry Red Hairpin on left temple
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx_bob - 0.145, 0.100, head_z + 0.070))
    pin = bpy.context.active_object
    pin.name = "Hair_Bob_Hairpin"
    pin.scale = (0.012, 0.038, 0.010)
    pin.rotation_euler = (math.radians(-25), math.radians(15), math.radians(-30))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = pin.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    pin.data.materials.append(mats["hairpin"])
    apply_smooth(pin)
    vg = pin.vertex_groups.new(name="Head")
    vg.add(list(range(len(pin.data.vertices))), 1.0, 'REPLACE')
    m = pin.modifiers.new("Armature", 'ARMATURE')
    m.object = arm_bob

    # Render Hairstyle Lineup
    setup_lighting_and_cam(cam_loc=(0.0, 2.3, 0.48), cam_rot=(88, 0, 180), res_x=1200, res_y=750)
    out_img = os.path.join(PREVIEWS_DIR, "hairstyle_variants_comparison.png")
    bpy.context.scene.render.filepath = out_img
    bpy.ops.render.render(write_still=True)
    shutil.copy(out_img, os.path.join(ARTIFACT_DIR, "hairstyle_variants_comparison.png"))
    log(f"Rendered: {out_img}")

    # Save isolated test blend
    hair_blend = os.path.join(TEST_DIR, "student_hairstyles_lineup.blend")
    bpy.ops.wm.save_as_mainfile(filepath=hair_blend)
    log(f"Saved: {hair_blend}")

# =============================================================================
# PART 3: OUTFIT MODULAR SWAP (CLEAN BASE vs PE SPORTS vs UNIFORM + SCARF)
# =============================================================================
def build_and_render_outfit_variants():
    log("\n=== 3. BUILDING & RENDERING OUTFIT VARIANTS & SCARF LINEUP ===")
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)

    base_objs = list(bpy.context.scene.objects)
    arm_orig = bpy.data.objects.get("Student_Armature")
    head_z = 0.525

    # 3 Characters side-by-side:
    # 1. Standard Clean School Uniform (Left, X = -0.45)
    # 2. School Uniform WITH Red Scarf (Center, X = 0.0)
    # 3. PE / Sports Uniform (Right, X = +0.45)

    # Shift original (Standard Clean) to X = -0.45
    for o in base_objs:
        if o.type in ["MESH", "ARMATURE"]:
            o.location.x -= 0.45

    mats = {
        "pe_blue": create_mat("M_PE_Shirt_Blue", "#1e528e", roughness=0.55),
        "pe_white": create_mat("M_PE_White", "#f2f5f8", roughness=0.45),
        "pe_pants": create_mat("M_PE_Track_Pants", "#14253d", roughness=0.60),
        "scarf": create_mat("M_Scarf_Pioneer_Red", "#c81c1c", roughness=0.55)
    }

    # Center: Duplicate base character to X = 0.0 and ATTACH RED SCARF
    bpy.ops.object.select_all(action="DESELECT")
    for o in base_objs:
        if o.type in ["MESH", "ARMATURE"]:
            o.select_set(True)
    bpy.ops.object.duplicate()
    scarf_objs = bpy.context.selected_objects
    arm_scarf = None
    for o in scarf_objs:
        o.location.x += 0.45 # back to 0.0
        if o.type == "ARMATURE":
            arm_scarf = o
            o.name = "Armature_Scarf"
        else:
            o.name = f"{o.name}_Scarf"
            for m in o.modifiers:
                if m.type == "ARMATURE":
                    m.object = arm_scarf

    # Create Vietnamese Red Scarf on Center character (X = 0.0)
    # Knot
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.088, 0.355))
    knot = bpy.context.active_object
    knot.name = "Scarf_Knot_Attached"
    knot.scale = (0.026, 0.022, 0.032)
    knot.rotation_euler = (math.radians(15), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = knot.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    knot.data.materials.append(mats["scarf"])
    apply_smooth(knot)
    vg = knot.vertex_groups.new(name="Chest")
    vg.add(list(range(len(knot.data.vertices))), 1.0, 'REPLACE')
    m = knot.modifiers.new("Armature", 'ARMATURE')
    m.object = arm_scarf

    # Tails
    tail_specs = [
        ("Scarf_Tail_L_Attached", (-0.016, 0.082, 0.312), (0.022, 0.012, 0.062), (18, -6, 8)),
        ("Scarf_Tail_R_Attached", ( 0.018, 0.080, 0.302), (0.020, 0.012, 0.072), (20,  6, -6)),
    ]
    for tname, loc, sc, rot in tail_specs:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        tail = bpy.context.active_object
        tail.name = tname
        tail.scale = sc
        tail.rotation_euler = (math.radians(rot[0]), math.radians(rot[1]), math.radians(rot[2]))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = tail.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        tail.data.materials.append(mats["scarf"])
        apply_smooth(tail)
        vg = tail.vertex_groups.new(name="Chest")
        vg.add(list(range(len(tail.data.vertices))), 1.0, 'REPLACE')
        m = tail.modifiers.new("Armature", 'ARMATURE')
        m.object = arm_scarf

    # Right: Duplicate base character to X = +0.45 and SWAP TO PE/SPORTS UNIFORM
    bpy.ops.object.select_all(action="DESELECT")
    for o in base_objs:
        if o.type in ["MESH", "ARMATURE"]:
            o.select_set(True)
    bpy.ops.object.duplicate()
    pe_objs = bpy.context.selected_objects
    arm_pe = None
    for o in pe_objs:
        o.location.x += 0.90 # from -0.45 to +0.45
        if o.type == "ARMATURE":
            arm_pe = o
            o.name = "Armature_PE"
        else:
            o.name = f"{o.name}_PE"
            for m in o.modifiers:
                if m.type == "ARMATURE":
                    m.object = arm_pe

    # Re-materialize PE outfit:
    # Character_Torso_Legs has materials: [0: Shirt, 1: Belt, 2: Pants, 3: Shoe, 4: Sole]
    pe_torso = bpy.data.objects.get("Character_Torso_Legs_PE")
    if pe_torso:
        pe_torso.data.materials[0] = mats["pe_blue"]  # Sport polo blue shirt
        pe_torso.data.materials[1] = mats["pe_white"] # White waist band
        pe_torso.data.materials[2] = mats["pe_pants"] # Dark navy track pants
    pe_collar = bpy.data.objects.get("Shirt_Collar_PE")
    if pe_collar:
        pe_collar.data.materials[0] = mats["pe_white"] # Sporty white collar trim

    # Add athletic white racing stripes down the side of the PE track pants
    cx_pe = 0.45
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx_pe + side * 0.108, 0.0, 0.115))
        stripe = bpy.context.active_object
        stripe.name = f"PE_Stripe_{sign}"
        stripe.scale = (0.005, 0.032, 0.125)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = stripe.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        stripe.data.materials.append(mats["pe_white"])
        apply_smooth(stripe)
        # Bind to Thigh and Shin bones
        vg_t = stripe.vertex_groups.new(name=f"Thigh.{sign}")
        vg_s = stripe.vertex_groups.new(name=f"Shin.{sign}")
        for v in stripe.data.vertices:
            # Upper half to Thigh, lower half to Shin
            if v.co.z >= 0.115:
                vg_t.add([v.index], 1.0, 'REPLACE')
            else:
                vg_s.add([v.index], 1.0, 'REPLACE')
        m = stripe.modifiers.new("Armature", 'ARMATURE')
        m.object = arm_pe

    # Render Outfit Lineup
    setup_lighting_and_cam(cam_loc=(0.0, 2.5, 0.40), cam_rot=(88, 0, 180), res_x=1200, res_y=750)
    out_img = os.path.join(PREVIEWS_DIR, "outfit_variants_comparison.png")
    bpy.context.scene.render.filepath = out_img
    bpy.ops.render.render(write_still=True)
    shutil.copy(out_img, os.path.join(ARTIFACT_DIR, "outfit_variants_comparison.png"))
    log(f"Rendered: {out_img}")

    # Save isolated test blend & export PE GLB
    outfit_blend = os.path.join(TEST_DIR, "student_outfits_lineup.blend")
    bpy.ops.wm.save_as_mainfile(filepath=outfit_blend)
    log(f"Saved: {outfit_blend}")

    # Export standalone PE Student GLB
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    pe_torso_standalone = bpy.data.objects.get("Character_Torso_Legs")
    if pe_torso_standalone:
        pe_torso_standalone.data.materials[0] = mats["pe_blue"]
        pe_torso_standalone.data.materials[1] = mats["pe_white"]
        pe_torso_standalone.data.materials[2] = mats["pe_pants"]
    pe_col = bpy.data.objects.get("Shirt_Collar")
    if pe_col:
        pe_col.data.materials[0] = mats["pe_white"]
    arm_pe_stand = bpy.data.objects.get("Student_Armature")
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.108, 0.0, 0.115))
        stripe = bpy.context.active_object
        stripe.name = f"PE_Stripe_{sign}"
        stripe.scale = (0.005, 0.032, 0.125)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = stripe.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        stripe.data.materials.append(mats["pe_white"])
        apply_smooth(stripe)
        vg_t = stripe.vertex_groups.new(name=f"Thigh.{sign}")
        vg_s = stripe.vertex_groups.new(name=f"Shin.{sign}")
        for v in stripe.data.vertices:
            if v.co.z >= 0.115:
                vg_t.add([v.index], 1.0, 'REPLACE')
            else:
                vg_s.add([v.index], 1.0, 'REPLACE')
        m = stripe.modifiers.new("Armature", 'ARMATURE')
        m.object = arm_pe_stand

    pe_glb_path = os.path.join(TEST_DIR, "student_outfit_pe.glb")
    temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
    if temp_act:
        bpy.data.actions.remove(temp_act)
    bpy.ops.object.select_all(action="DESELECT")
    arm_pe_stand.select_set(True)
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=pe_glb_path,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_animations=True,
        export_all_influences=True
    )
    log(f"Exported standalone PE GLB: {pe_glb_path}")

if __name__ == "__main__":
    try:
        build_and_render_height_variants()
        build_and_render_hairstyle_variants()
        build_and_render_outfit_variants()
        log("ALL PRODUCTION AUDIT VARIANTS BUILT AND RENDERED SUCCESSFULLY!")
    except Exception as e:
        log("ERROR: " + str(e))
        log(traceback.format_exc())
