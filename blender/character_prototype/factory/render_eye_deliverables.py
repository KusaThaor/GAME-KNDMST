import bpy
import math
import os

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
BLEND_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
GLB_PATH = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_fixed.glb")
OUT_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory", "previews", "eye_deliverables")
os.makedirs(OUT_DIR, exist_ok=True)

def setup_lights():
    for o in list(bpy.data.objects):
        if o.type == 'LIGHT':
            bpy.data.objects.remove(o, do_unlink=True)

    light_key_data = bpy.data.lights.new(name="DiagKey", type='AREA')
    light_key_data.energy = 50.0
    light_key_data.size = 0.5
    light_key = bpy.data.objects.new(name="DiagKey", object_data=light_key_data)
    light_key.location = (0.3, 0.8, 0.8)
    bpy.context.scene.collection.objects.link(light_key)

    light_fill_data = bpy.data.lights.new(name="DiagFill", type='AREA')
    light_fill_data.energy = 30.0
    light_fill_data.size = 0.8
    light_fill = bpy.data.objects.new(name="DiagFill", object_data=light_fill_data)
    light_fill.location = (-0.4, 0.7, 0.6)
    bpy.context.scene.collection.objects.link(light_fill)

    light_front_data = bpy.data.lights.new(name="DiagFront", type='AREA')
    light_front_data.energy = 25.0
    light_front_data.size = 0.6
    light_front = bpy.data.objects.new(name="DiagFront", object_data=light_front_data)
    light_front.location = (0.0, 0.9, 0.525)
    bpy.context.scene.collection.objects.link(light_front)

def setup_camera():
    cam = bpy.data.objects.get("Camera")
    if not cam:
        cam_data = bpy.data.cameras.new("CamFace")
        cam = bpy.data.objects.new("CamFace", cam_data)
        bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    return cam

views = [
    ("front_closeup", (0.0, 0.65, 0.525), (math.radians(90), 0, math.radians(180))),
    ("three_quarter_l", (-0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(210))),
    ("three_quarter_r", (0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(150))),
    ("profile_l", (-0.55, 0.155, 0.525), (math.radians(90), 0, math.radians(270))),
]

# -------------------------------------------------------------
# 1. RENDER AFTER VIEWS FROM FIXED BASE BLEND
# -------------------------------------------------------------
print("--- 1. Rendering AFTER views from vietnamese_student_base.blend ---")
bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

for col in bpy.data.collections:
    if "hair" in col.name.lower():
        col.hide_render = True
for o in bpy.data.objects:
    if "hair" in o.name.lower():
        o.hide_render = True

setup_lights()
cam = setup_camera()

scene = bpy.context.scene
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.engine = 'BLENDER_EEVEE_NEXT'

for name, loc, rot in views:
    cam.location = loc
    cam.rotation_euler = rot
    cam.data.lens = 70.0
    out_path = os.path.join(OUT_DIR, f"after_{name}.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {out_path}")

# Render blink frame 7
arm = bpy.data.objects.get("Student_Armature")
if arm and arm.animation_data:
    arm.animation_data.use_nla = False
    arm.animation_data.action = bpy.data.actions.get("Action_Blink")
    bpy.context.scene.frame_set(7)
    bpy.context.view_layer.update()
    cam.location = (0.0, 0.65, 0.525)
    cam.rotation_euler = (math.radians(90), 0, math.radians(180))
    cam.data.lens = 70.0
    out_path = os.path.join(OUT_DIR, "after_blink_frame7.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {out_path}")

# -------------------------------------------------------------
# 2. GLB REIMPORT CHECK (EMPTY SCENE -> IMPORT GLB -> RENDER)
# -------------------------------------------------------------
print("\n--- 2. GLB Reimport Check ---")
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import GLB
bpy.ops.import_scene.gltf(filepath=GLB_PATH)
print(f"Imported GLB: {GLB_PATH}")

# Hide hair objects in imported GLB
for o in bpy.data.objects:
    if "hair" in o.name.lower():
        o.hide_render = True

setup_lights()
cam = setup_camera()

scene = bpy.context.scene
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.engine = 'BLENDER_EEVEE_NEXT'

reimport_views = [
    ("front_closeup", (0.0, 0.65, 0.525), (math.radians(90), 0, math.radians(180))),
    ("three_quarter_l", (-0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(210))),
    ("profile_l", (-0.55, 0.155, 0.525), (math.radians(90), 0, math.radians(270))),
]

for name, loc, rot in reimport_views:
    cam.location = loc
    cam.rotation_euler = rot
    cam.data.lens = 70.0
    out_path = os.path.join(OUT_DIR, f"reimport_{name}.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered Reimport: {out_path}")

print("All render deliverables complete!")
