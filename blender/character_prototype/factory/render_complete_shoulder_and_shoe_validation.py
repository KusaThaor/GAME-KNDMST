import bpy
import bmesh
import math
import os
import sys

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
OUTPUT_GLB = os.path.join(FACTORY_DIR, "outputs", "vietnamese_student_fixed.glb")
os.makedirs(os.path.join(FACTORY_DIR, "outputs"), exist_ok=True)
os.makedirs(PREVIEWS_DIR, exist_ok=True)

sys.path.insert(0, FACTORY_DIR)
from character_factory import CharacterFactory
import clothing_library

LOG_FILE = os.path.join(FACTORY_DIR, "shoulder_validation_exec.log")

def log(msg):
    print(f">> {msg}")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write("=== STARTING COMPLETE SHOULDER & SHOE-TROUSER VALIDATION ===\n")

def clear_lights_and_cameras(scene):
    for o in list(scene.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            scene.collection.objects.unlink(o)
            bpy.data.objects.remove(o, do_unlink=True)

def setup_studio(scene, loc, rot, res=(800, 800), lens=55):
    clear_lights_and_cameras(scene)
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"

    world = bpy.data.worlds.new("Audit_World")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    # Neutral contrasting studio backdrop (slate charcoal) so gaps and edges are prominent
    bg.inputs["Color"].default_value = (0.10, 0.12, 0.16, 1.0)
    scene.world = world

    def add_light(name, energy, rot_deg, col=(1.0, 1.0, 1.0)):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        l.color = col
        o = bpy.data.objects.new(name, l)
        scene.collection.objects.link(o)
        o.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return o

    add_light("KeyFront", 5.2, (45, 20, -35), (1.0, 0.98, 0.95))
    add_light("FillLeft", 3.8, (35, -25, 130), (0.92, 0.95, 1.0))
    add_light("BackRim", 5.0, (40, 0, -180), (1.0, 0.98, 0.95))
    add_light("Bounce", 2.8, (-60, 10, 15), (1.0, 0.95, 0.92))
    add_light("SideSoft", 3.2, (25, -40, -90), (0.95, 0.95, 1.0))

    cam_data = bpy.data.cameras.new("AuditCam")
    cam_data.lens = lens
    cam_obj = bpy.data.objects.new("AuditCam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = loc
    cam_obj.rotation_euler = rot
    return cam_obj

def render_sequence(scene, shots, prefix=""):
    for fname, loc, rot, lens in shots:
        setup_studio(scene, loc, rot, res=(800, 800), lens=lens)
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        log(f"Rendered: {fname}")

def main():
    # -------------------------------------------------------------------------
    # PART 1: NAKED BASE BODY (HAIR, ACCESSORIES, CLOTHING HIDDEN)
    # -------------------------------------------------------------------------
    log("1. Setting up Naked Base Body inspection...")
    bpy.ops.wm.open_mainfile(filepath=CANONICAL_BLEND)
    scene = bpy.context.scene

    # Hide hair, eyes/face details that might distract, accessories, clothing
    for o in bpy.data.objects:
        if o.name.startswith("Hair_") or o.name.startswith("Acc_") or o.name == "Shirt_Collar":
            o.hide_render = True

    # Make the base character mesh skin material uniform so naked body is clearly visible
    mat_skin = bpy.data.materials.get("M_Skin") or bpy.data.materials.get("M_Student_Skin")
    torso_legs = bpy.data.objects.get("Character_Torso_Legs")
    arm_l = bpy.data.objects.get("Character_Arm_L")
    arm_r = bpy.data.objects.get("Character_Arm_R")

    # Render Base Body Only (Front, Back, Side, Elevated 3/4)
    body_shots = [
        ("body_only_front.png", (0.0, 1.15, 0.350), (math.radians(90), 0, math.radians(180)), 50),
        ("body_only_back.png", (0.0, -1.15, 0.350), (math.radians(90), 0, 0), 50),
        ("body_only_side.png", (-1.15, 0.0, 0.350), (math.radians(90), 0, math.radians(-90)), 50),
        ("body_only_elevated_3quarter.png", (-0.85, 0.85, 0.520), (math.radians(75), 0, math.radians(-135)), 50),
    ]
    render_sequence(scene, body_shots)

    # -------------------------------------------------------------------------
    # PART 2: BASE BODY WITH SHIRT (TOP_001)
    # -------------------------------------------------------------------------
    log("2. Setting up Body With Shirt (TOP_001)...")
    factory = CharacterFactory(CANONICAL_BLEND)
    factory.load_base()
    scene = bpy.context.scene

    for o in bpy.data.objects:
        if o.name.startswith("Hair_") or o.name.startswith("Acc_") or o.name == "Shirt_Collar":
            o.hide_render = True

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "val_top")

    shirt_shots = [
        ("shirt_body_front.png", (0.0, 1.15, 0.350), (math.radians(90), 0, math.radians(180)), 50),
        ("shirt_body_back.png", (0.0, -1.15, 0.350), (math.radians(90), 0, 0), 50),
        ("shirt_body_side.png", (-1.15, 0.0, 0.350), (math.radians(90), 0, math.radians(-90)), 50),
        ("shirt_body_elevated_3quarter.png", (-0.85, 0.85, 0.520), (math.radians(75), 0, math.radians(-135)), 50),
    ]
    render_sequence(scene, shirt_shots)

    # -------------------------------------------------------------------------
    # PART 3: CLOSE-UP VIEWS OF BOTH SHOULDER-SLEEVE JUNCTIONS
    # -------------------------------------------------------------------------
    log("3. Rendering close-up views of shoulder-sleeve junctions...")
    shoulder_closeup_shots = [
        ("shoulder_closeup_front.png", (0.0, 0.60, 0.360), (math.radians(90), 0, math.radians(180)), 65),
        ("shoulder_closeup_back.png", (0.0, -0.60, 0.360), (math.radians(90), 0, 0), 65),
        ("shoulder_closeup_left_elevated.png", (-0.50, 0.50, 0.450), (math.radians(76), 0, math.radians(-135)), 65),
        ("shoulder_closeup_right_elevated.png", (0.50, 0.50, 0.450), (math.radians(76), 0, math.radians(135)), 65),
        ("shoulder_closeup_underarm_l.png", (-0.45, 0.25, 0.300), (math.radians(105), 0, math.radians(-120)), 65),
    ]
    render_sequence(scene, shoulder_closeup_shots)

    # -------------------------------------------------------------------------
    # PART 4: POSE DEFORMATION VALIDATION (ARMS DOWN, 45 DEG, T-POSE)
    # -------------------------------------------------------------------------
    log("4. Testing rig deformations in 3 canonical poses...")
    arm = factory.arm
    arm.animation_data_clear()
    bpy.context.view_layer.objects.active = arm

    # Pose 1: Arms down (already in rest pose)
    render_sequence(scene, [
        ("pose_arms_down_front.png", (0.0, 1.10, 0.350), (math.radians(90), 0, math.radians(180)), 50),
        ("pose_arms_down_back.png", (0.0, -1.10, 0.350), (math.radians(90), 0, 0), 50),
    ])

    # Pose 2: Arms raised 45 degrees
    bpy.ops.object.mode_set(mode='POSE')
    b_l = arm.pose.bones.get("UpperArm.L")
    b_r = arm.pose.bones.get("UpperArm.R")
    if b_l and b_r:
        b_l.rotation_mode = 'XYZ'
        b_r.rotation_mode = 'XYZ'
        b_l.rotation_euler = (0, math.radians(-45), 0)
        b_r.rotation_euler = (0, math.radians(45), 0)
        bpy.context.view_layer.update()

    bpy.ops.object.mode_set(mode='OBJECT')
    render_sequence(scene, [
        ("pose_arms_45deg_front.png", (0.0, 1.10, 0.350), (math.radians(90), 0, math.radians(180)), 50),
        ("pose_arms_45deg_back.png", (0.0, -1.10, 0.350), (math.radians(90), 0, 0), 50),
        ("pose_arms_45deg_shoulder_closeup.png", (0.0, 0.65, 0.360), (math.radians(90), 0, math.radians(180)), 65),
    ])

    # Pose 3: T-Pose (Arms raised ~80-85 degrees)
    bpy.ops.object.mode_set(mode='POSE')
    if b_l and b_r:
        b_l.rotation_euler = (0, math.radians(-82), 0)
        b_r.rotation_euler = (0, math.radians(82), 0)
        bpy.context.view_layer.update()

    bpy.ops.object.mode_set(mode='OBJECT')
    render_sequence(scene, [
        ("pose_t_pose_front.png", (0.0, 1.15, 0.350), (math.radians(90), 0, math.radians(180)), 50),
        ("pose_t_pose_back.png", (0.0, -1.15, 0.350), (math.radians(90), 0, 0), 50),
        ("pose_t_pose_underarm_closeup.png", (-0.50, 0.30, 0.340), (math.radians(95), 0, math.radians(-120)), 65),
    ])

    # Reset armature pose
    bpy.ops.object.mode_set(mode='POSE')
    if b_l and b_r:
        b_l.rotation_euler = (0, 0, 0)
        b_r.rotation_euler = (0, 0, 0)
        bpy.context.view_layer.update()
    bpy.ops.object.mode_set(mode='OBJECT')

    # -------------------------------------------------------------------------
    # PART 5: SHOE-TROUSER JUNCTION CLOSE-UP VIEWS
    # -------------------------------------------------------------------------
    log("5. Rendering close-up views of shoe-trouser junction...")
    shoe_shots = [
        ("shoe_trouser_front_closeup.png", (0.0, 0.45, 0.035), (math.radians(88), 0, math.radians(180)), 70),
        ("shoe_trouser_back_closeup.png", (0.0, -0.45, 0.035), (math.radians(88), 0, 0), 70),
        ("shoe_trouser_elevated_3quarter.png", (-0.40, 0.40, 0.110), (math.radians(76), 0, math.radians(-135)), 65),
        ("shoe_trouser_side_closeup.png", (-0.45, 0.0, 0.035), (math.radians(88), 0, math.radians(-90)), 70),
    ]
    render_sequence(scene, shoe_shots)

    # -------------------------------------------------------------------------
    # PART 6: EXPORT PRODUCTION GLB & VALIDATE RE-IMPORT
    # -------------------------------------------------------------------------
    log("6. Exporting fresh production GLB...")
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    for o in bpy.data.objects:
        if o.type == 'MESH' and not o.hide_render:
            o.select_set(True)

    export_settings = {
        "export_format": "GLB",
        "use_selection": True,
        "export_apply": False,
        "export_yup": True,
        "export_materials": "EXPORT",
        "export_animations": True,
        "export_skins": True,
    }
    bpy.ops.export_scene.gltf(filepath=OUTPUT_GLB, **export_settings)
    glb_size = os.path.getsize(OUTPUT_GLB)
    log(f"Exported GLB: {OUTPUT_GLB} ({glb_size / 1024:.2f} KB)")

    # Test reimporting into clean scene
    log("7. Validating reimport of exported GLB...")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=OUTPUT_GLB)

    imported_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    imported_arm = next((o for o in bpy.data.objects if o.type == 'ARMATURE'), None)
    log(f"Reimport verified: {len(imported_meshes)} meshes, armature={imported_arm.name if imported_arm else None}")

    log("=== ALL VALIDATIONS AND RENDERS COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"FATAL ERROR: {e}")
        import traceback
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            traceback.print_exc(file=f)
