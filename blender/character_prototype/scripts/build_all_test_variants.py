import bpy
import bmesh
import math
import os
import shutil

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
TEST_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants")
LOG_FILE = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "build_variants.log")

os.makedirs(TEST_DIR, exist_ok=True)

with open(LOG_FILE, "w", encoding="utf-8") as log:
    log.write("STARTING ISOLATED TEST VARIANTS BUILD\n")

def log_msg(msg):
    print(f">> {msg}")
    with open(LOG_FILE, "a", encoding="utf-8") as log:
        log.write(f"{msg}\n")

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

def export_clean_glb(arm_obj, out_path):
    temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
    if temp_act:
        bpy.data.actions.remove(temp_act)
    bpy.ops.object.select_all(action="DESELECT")
    arm_obj.select_set(True)
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_animations=True,
        export_all_influences=True
    )
    log_msg(f"Exported GLB: {out_path} ({os.path.getsize(out_path)/1024:.1f} KB)")

# =============================================================================
# 1. HEIGHT VARIANTS (90%, 100%, 110%)
# =============================================================================
def build_height_variants():
    log_msg("\n--- 1. BUILDING HEIGHT VARIANTS ---")
    for s_name, scale_val in [("student_height_90", 0.90), ("student_height_100", 1.00), ("student_height_110", 1.10)]:
        bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
        arm = bpy.data.objects.get("Student_Armature")
        
        # In Blender/glTF, scale the armature and child meshes properly
        arm.scale = (scale_val, scale_val, scale_val)
        arm.location = arm.location * scale_val
        for o in bpy.data.objects:
            if o.type == "MESH":
                o.location = o.location * scale_val
                o.scale = (scale_val, scale_val, scale_val)

        out_blend = os.path.join(TEST_DIR, f"{s_name}.blend")
        bpy.ops.wm.save_as_mainfile(filepath=out_blend)
        log_msg(f"Saved: {out_blend}")

        out_glb = os.path.join(TEST_DIR, f"{s_name}.glb")
        export_clean_glb(arm, out_glb)

# =============================================================================
# 2. HAIRSTYLE VARIANTS
# =============================================================================
def build_hairstyle_variants():
    log_msg("\n--- 2. BUILDING HAIRSTYLE VARIANTS ---")
    head_z = 0.525

    # A. Sporty Short Spiky Haircut
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    arm = bpy.data.objects.get("Student_Armature")
    mat_spiky = create_mat("M_Hair_Navy", "#161b26", roughness=0.50)
    col_hair = bpy.data.collections.get("03_Hair_Default") or bpy.context.scene.collection

    # Remove default hair
    for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R"]:
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)

    # Spiky Cap
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.015, head_z + 0.045))
    s_cap = bpy.context.active_object
    s_cap.name = "Hair_Spiky_Cap"
    s_cap.scale = (0.42, 0.40, 0.30)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = s_cap.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    s_cap.data.materials.append(mat_spiky)
    apply_smooth(s_cap)
    vg = s_cap.vertex_groups.new(name="Head")
    vg.add(list(range(len(s_cap.data.vertices))), 1.0, 'REPLACE')
    m = s_cap.modifiers.new("Armature", 'ARMATURE')
    m.object = arm

    # Center Spike Crest
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.075, head_z + 0.085))
    s_crest = bpy.context.active_object
    s_crest.name = "Hair_Spike_Front"
    s_crest.scale = (0.28, 0.22, 0.14)
    s_crest.rotation_euler = (math.radians(-35), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = s_crest.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    s_crest.data.materials.append(mat_spiky)
    apply_smooth(s_crest)
    vg = s_crest.vertex_groups.new(name="Head")
    vg.add(list(range(len(s_crest.data.vertices))), 1.0, 'REPLACE')
    m = s_crest.modifiers.new("Armature", 'ARMATURE')
    m.object = arm

    # Side Spikes
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.120, 0.040, head_z + 0.075))
        s_side = bpy.context.active_object
        s_side.name = f"Hair_Spike_{sign}"
        s_side.scale = (0.14, 0.18, 0.12)
        s_side.rotation_euler = (math.radians(-25), math.radians(side * 15), math.radians(side * -10))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = s_side.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 2
        s_side.data.materials.append(mat_spiky)
        apply_smooth(s_side)
        vg = s_side.vertex_groups.new(name="Head")
        vg.add(list(range(len(s_side.data.vertices))), 1.0, 'REPLACE')
        m = s_side.modifiers.new("Armature", 'ARMATURE')
        m.object = arm

        # Tapered athletic sideburn
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.170, 0.035, head_z + 0.010))
        s_burn = bpy.context.active_object
        s_burn.name = f"Hair_Spiky_Sideburn_{sign}"
        s_burn.scale = (0.025, 0.050, 0.090)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = s_burn.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 2
        s_burn.data.materials.append(mat_spiky)
        apply_smooth(s_burn)
        vg = s_burn.vertex_groups.new(name="Head")
        vg.add(list(range(len(s_burn.data.vertices))), 1.0, 'REPLACE')
        m = s_burn.modifiers.new("Armature", 'ARMATURE')
        m.object = arm

    out_blend = os.path.join(TEST_DIR, "student_hair_spiky.blend")
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    log_msg(f"Saved: {out_blend}")
    export_clean_glb(arm, os.path.join(TEST_DIR, "student_hair_spiky.glb"))

    # B. Cute Female Bob with Hairpin
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    arm = bpy.data.objects.get("Student_Armature")
    mat_brown = create_mat("M_Hair_Brown", "#2b1b17", roughness=0.50)
    mat_pin = create_mat("M_Hairpin_Red", "#d92027", roughness=0.25, metallic=0.6)

    # Remove default hair
    for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R"]:
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)

    # Bob Cap
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.015, head_z + 0.042))
    b_cap = bpy.context.active_object
    b_cap.name = "Hair_Bob_Cap"
    b_cap.scale = (0.43, 0.41, 0.32)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = b_cap.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    b_cap.data.materials.append(mat_brown)
    apply_smooth(b_cap)
    vg = b_cap.vertex_groups.new(name="Head")
    vg.add(list(range(len(b_cap.data.vertices))), 1.0, 'REPLACE')
    m = b_cap.modifiers.new("Armature", 'ARMATURE')
    m.object = arm

    # Bob Straight Bangs
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.076, head_z + 0.062))
    b_bangs = bpy.context.active_object
    b_bangs.name = "Hair_Bob_Bangs"
    b_bangs.scale = (0.36, 0.20, 0.12)
    b_bangs.rotation_euler = (math.radians(-20), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = b_bangs.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    b_bangs.data.materials.append(mat_brown)
    apply_smooth(b_bangs)
    vg = b_bangs.vertex_groups.new(name="Head")
    vg.add(list(range(len(b_bangs.data.vertices))), 1.0, 'REPLACE')
    m = b_bangs.modifiers.new("Armature", 'ARMATURE')
    m.object = arm

    # Bob Side Flairs framing cheeks
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.174, 0.015, head_z - 0.010))
        b_side = bpy.context.active_object
        b_side.name = f"Hair_Bob_Side_{sign}"
        b_side.scale = (0.042, 0.115, 0.150)
        b_side.rotation_euler = (math.radians(-8), math.radians(side * -5), math.radians(side * -8))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = b_side.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 2
        b_side.data.materials.append(mat_brown)
        apply_smooth(b_side)
        vg = b_side.vertex_groups.new(name="Head")
        vg.add(list(range(len(b_side.data.vertices))), 1.0, 'REPLACE')
        m = b_side.modifiers.new("Armature", 'ARMATURE')
        m.object = arm

    # Hairpin
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.145, 0.100, head_z + 0.070))
    pin = bpy.context.active_object
    pin.name = "Hair_Bob_Hairpin"
    pin.scale = (0.012, 0.038, 0.010)
    pin.rotation_euler = (math.radians(-25), math.radians(15), math.radians(-30))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = pin.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    pin.data.materials.append(mat_pin)
    apply_smooth(pin)
    vg = pin.vertex_groups.new(name="Head")
    vg.add(list(range(len(pin.data.vertices))), 1.0, 'REPLACE')
    m = pin.modifiers.new("Armature", 'ARMATURE')
    m.object = arm

    out_blend = os.path.join(TEST_DIR, "student_hair_bob.blend")
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    log_msg(f"Saved: {out_blend}")
    export_clean_glb(arm, os.path.join(TEST_DIR, "student_hair_bob.glb"))

# =============================================================================
# 3. OUTFIT VARIANTS (PE SPORTS & SCARF ATTACHMENT)
# =============================================================================
def build_outfit_variants():
    log_msg("\n--- 3. BUILDING OUTFIT & SCARF VARIANTS ---")
    
    # A. School Uniform WITH Red Scarf
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    arm = bpy.data.objects.get("Student_Armature")
    mat_scarf = create_mat("M_Scarf_Red", "#c81c1c", roughness=0.55)

    # Scarf Knot
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.088, 0.355))
    knot = bpy.context.active_object
    knot.name = "Scarf_Knot"
    knot.scale = (0.026, 0.022, 0.032)
    knot.rotation_euler = (math.radians(15), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = knot.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    knot.data.materials.append(mat_scarf)
    apply_smooth(knot)
    vg = knot.vertex_groups.new(name="Chest")
    vg.add(list(range(len(knot.data.vertices))), 1.0, 'REPLACE')
    m = knot.modifiers.new("Armature", 'ARMATURE')
    m.object = arm

    # Scarf Tails
    tail_specs = [
        ("Scarf_Tail_L", (-0.016, 0.082, 0.312), (0.022, 0.012, 0.062), (18, -6, 8)),
        ("Scarf_Tail_R", ( 0.018, 0.080, 0.302), (0.020, 0.012, 0.072), (20,  6, -6)),
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
        tail.data.materials.append(mat_scarf)
        apply_smooth(tail)
        vg = tail.vertex_groups.new(name="Chest")
        vg.add(list(range(len(tail.data.vertices))), 1.0, 'REPLACE')
        m = tail.modifiers.new("Armature", 'ARMATURE')
        m.object = arm

    out_blend = os.path.join(TEST_DIR, "student_outfit_scarf.blend")
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    log_msg(f"Saved: {out_blend}")
    export_clean_glb(arm, os.path.join(TEST_DIR, "student_outfit_scarf.glb"))

    # B. PE / Sports Uniform
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    arm = bpy.data.objects.get("Student_Armature")
    mat_pe_blue = create_mat("M_PE_Shirt_Blue", "#1e528e", roughness=0.55)
    mat_pe_white = create_mat("M_PE_White", "#f2f5f8", roughness=0.45)
    mat_pe_pants = create_mat("M_PE_Track_Pants", "#14253d", roughness=0.60)

    pe_torso = bpy.data.objects.get("Character_Torso_Legs")
    if pe_torso:
        pe_torso.data.materials[0] = mat_pe_blue
        pe_torso.data.materials[1] = mat_pe_white
        pe_torso.data.materials[2] = mat_pe_pants
    pe_col = bpy.data.objects.get("Shirt_Collar")
    if pe_col:
        pe_col.data.materials[0] = mat_pe_white

    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.078, 0.0, 0.115))
        stripe = bpy.context.active_object
        stripe.name = f"PE_Stripe_{sign}"
        stripe.scale = (0.005, 0.028, 0.125)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = stripe.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        stripe.data.materials.append(mat_pe_white)
        apply_smooth(stripe)
        vg_t = stripe.vertex_groups.new(name=f"Thigh.{sign}")
        vg_s = stripe.vertex_groups.new(name=f"Shin.{sign}")
        for v in stripe.data.vertices:
            if v.co.z >= 0.115:
                vg_t.add([v.index], 1.0, 'REPLACE')
            else:
                vg_s.add([v.index], 1.0, 'REPLACE')
        m = stripe.modifiers.new("Armature", 'ARMATURE')
        m.object = arm

    out_blend = os.path.join(TEST_DIR, "student_outfit_pe.blend")
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    log_msg(f"Saved: {out_blend}")
    export_clean_glb(arm, os.path.join(TEST_DIR, "student_outfit_pe.glb"))

if __name__ == "__main__":
    try:
        build_height_variants()
        build_hairstyle_variants()
        build_outfit_variants()
        log_msg("ALL ISOLATED TEST VARIANTS BUILT AND EXPORTED SUCCESSFULLY!")
    except Exception as e:
        import traceback
        log_msg("ERROR: " + str(e))
        log_msg(traceback.format_exc())
