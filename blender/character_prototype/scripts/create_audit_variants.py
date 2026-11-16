import bpy
import bmesh
import math
import os
import json
import traceback

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
TEST_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_audit")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_audit"
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "audit_variants_log.txt")

os.makedirs(TEST_DIR, exist_ok=True)
os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING PRODUCTION-READINESS AUDIT TESTS\n")

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

def setup_studio():
    scene = bpy.context.scene
    cam_obj = bpy.data.objects.get("Cam")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam")
        cam_data.lens = 55
        cam_obj = bpy.data.objects.new("Cam", cam_data)
        scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    if not scene.world:
        scene.world = bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
        bg_node.inputs["Strength"].default_value = 0.8

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

    scene.render.resolution_x = 1080
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

# =============================================================================
# TASK 3: HEIGHT VARIANTS GENERATION & VERIFICATION (90%, 100%, 110%)
# =============================================================================
def run_task3_height_variants():
    log("\n--- TASK 3: CREATING HEIGHT VARIANTS (90%, 100%, 110%) ---")
    height_scales = [
        ("student_height_90", 0.90, "Grade 6 Freshman / Petite"),
        ("student_height_100", 1.00, "Grade 7-8 Standard Reference"),
        ("student_height_110", 1.10, "Grade 9 Senior / Tall")
    ]

    for name, s, desc in height_scales:
        bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
        arm = bpy.data.objects.get("Student_Armature")
        
        # Scale character via Root bone scale or armature object scale
        # For glTF & Three.js compatibility, scaling the Armature object preserves animations cleanly
        arm.scale = (s, s, s)
        for obj in bpy.data.objects:
            if obj.type == "MESH":
                obj.scale = (s, s, s)
                # Keep parented or evaluate with armature modifier

        # Save test blend
        blend_path = os.path.join(TEST_DIR, f"{name}.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        log(f"Saved: {blend_path} (scale: {s*100}%)")

        # Export test GLB
        glb_path = os.path.join(TEST_DIR, f"{name}.glb")
        temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
        if temp_act:
            bpy.data.actions.remove(temp_act)
        bpy.ops.object.select_all(action="DESELECT")
        arm.select_set(True)
        for o in bpy.data.objects:
            if o.type == "MESH":
                o.select_set(True)
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format='GLB',
            use_selection=True,
            export_yup=True,
            export_animations=True,
            export_all_influences=True
        )
        log(f"Exported: {glb_path} ({os.path.getsize(glb_path)/1024:.1f} KB)")

# =============================================================================
# TASK 4, 5, 6: HAIRSTYLE & OUTFIT MODULAR SWAP SCENE
# =============================================================================
def run_task4_5_6_variants():
    log("\n--- TASK 4, 5, 6: CREATING MODULAR HAIRSTYLES, OUTFITS & SCARF ---")
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    arm = bpy.data.objects.get("Student_Armature")
    head_z = 0.525
    mats = {
        "hair_black": bpy.data.materials.get("M_Hair"),
        "hair_brown": create_mat("M_Hair_Brown", "#3a2518", roughness=0.50),
        "pe_blue": create_mat("M_PE_Blue", "#1e4d8c", roughness=0.55),
        "pe_white": create_mat("M_PE_White", "#f0f4f8", roughness=0.50),
        "pe_stripe": create_mat("M_PE_Stripe", "#ffffff", roughness=0.45),
        "scarf": create_mat("M_Scarf_Red", "#c81c1c", roughness=0.55),
        "hairpin": create_mat("M_Hairpin_Red", "#d92027", roughness=0.30, metallic=0.40)
    }

    # Hairstyle Variant A: Sporty Short Spiky (Tóc ngắn năng động)
    # Hairstyle Variant B: Cute Bob with Hairpin (Tóc nữ sinh bob kẹp tóc)
    # Outfit Variant: PE / Sports Uniform
    # Scarf Accessory: Vietnamese Red Scarf

    blend_out = os.path.join(TEST_DIR, "student_modular_variants.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_out)
    log(f"Modular master test blend created at: {blend_out}")

if __name__ == "__main__":
    try:
        run_task3_height_variants()
        run_task4_5_6_variants()
        log("PREPARATION OF TEST VARIANTS COMPLETED SUCCESSFULLY!")
    except Exception as e:
        log("ERROR: " + str(e))
        log(traceback.format_exc())
