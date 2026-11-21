import bpy
import os
import math

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
GLB_PATH = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_fixed.glb")
OUT_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory", "previews", "final_oval_validation")
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# 2. Import GLB
print(f"Importing GLB: {GLB_PATH}")
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

# Verify objects
objs = {o.name: o for o in bpy.data.objects}
print("Imported objects:", list(objs.keys()))

# Hide hair to clearly inspect face and eyes
for name, o in objs.items():
    if "hair" in name.lower() or "cap" in name.lower() or "bangs" in name.lower() or "sideburn" in name.lower():
        o.hide_render = True

# Find Armature
arm = None
for o in bpy.data.objects:
    if o.type == 'ARMATURE':
        arm = o
        break

print(f"Found Armature: {arm.name if arm else 'None'}")
print("Actions in file:", [a.name for a in bpy.data.actions])

# Setup Camera & Lights
cam_data = bpy.data.cameras.new("CamFace")
cam = bpy.data.objects.new("CamFace", cam_data)
bpy.context.scene.collection.objects.link(cam)
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.engine = 'BLENDER_EEVEE_NEXT'

light_key_data = bpy.data.lights.new(name="Key", type='AREA')
light_key_data.energy = 50.0
light_key_data.size = 0.5
light_key = bpy.data.objects.new(name="Key", object_data=light_key_data)
light_key.location = (0.3, 0.8, 0.8)
scene.collection.objects.link(light_key)

light_fill_data = bpy.data.lights.new(name="Fill", type='AREA')
light_fill_data.energy = 30.0
light_fill_data.size = 0.8
light_fill = bpy.data.objects.new(name="Fill", object_data=light_fill_data)
light_fill.location = (-0.4, 0.7, 0.6)
scene.collection.objects.link(light_fill)

light_front_data = bpy.data.lights.new(name="Front", type='AREA')
light_front_data.energy = 25.0
light_front_data.size = 0.6
light_front = bpy.data.objects.new(name="Front", object_data=light_front_data)
light_front.location = (0.0, 0.9, 0.525)
scene.collection.objects.link(light_front)

# Render 3 Turnaround views
views = [
    ("glb_front_closeup", (0.0, 0.65, 0.525), (math.radians(90), 0, math.radians(180))),
    ("glb_three_quarter_l", (-0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(210))),
    ("glb_profile_l", (-0.55, 0.155, 0.525), (math.radians(90), 0, math.radians(270))),
]

# Set rest pose / frame 1
if arm and arm.animation_data:
    arm.animation_data.use_nla = False
    act_idle = bpy.data.actions.get("Action_Idle")
    if act_idle:
        arm.animation_data.action = act_idle

scene.frame_set(1)
bpy.context.view_layer.update()

for name, loc, rot in views:
    cam.location = loc
    cam.rotation_euler = rot
    cam.data.lens = 70.0
    out_path = os.path.join(OUT_DIR, f"{name}.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {out_path}")

# Render with hair visible too for full character beauty shot
for name, o in objs.items():
    if "hair" in name.lower() or "cap" in name.lower() or "bangs" in name.lower() or "sideburn" in name.lower():
        o.hide_render = False

cam.location = (0.0, 0.68, 0.525)
cam.rotation_euler = (math.radians(90), 0, math.radians(180))
out_path = os.path.join(OUT_DIR, "glb_front_with_hair.png")
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)
print(f"Rendered: {out_path}")

# Hide hair again for clean animation analysis
for name, o in objs.items():
    if "hair" in name.lower() or "cap" in name.lower() or "bangs" in name.lower() or "sideburn" in name.lower():
        o.hide_render = True

# Test Action_Blink frames in reimported GLB
act_blink = None
for a in bpy.data.actions:
    if "blink" in a.name.lower():
        act_blink = a
        break

if act_blink and arm:
    print(f"Testing blink action: {act_blink.name}")
    arm.animation_data.action = act_blink
    arm.animation_data.use_nla = False
    
    cam.location = (0.0, 0.65, 0.525)
    cam.rotation_euler = (math.radians(90), 0, math.radians(180))
    cam.data.lens = 70.0
    
    for f in [1, 5, 7, 9, 12, 15]:
        scene.frame_set(f)
        bpy.context.view_layer.update()
        out_path = os.path.join(OUT_DIR, f"glb_blink_f{f:02d}.png")
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered GLB blink frame {f}: {out_path}")

# Test multiple animation actions
for act_name, frame in [("Action_Talk", 20), ("Action_Bow", 18), ("Action_Cheer", 15), ("Action_Idle", 20)]:
    act = None
    for a in bpy.data.actions:
        if act_name.lower() in a.name.lower():
            act = a
            break
    if act and arm:
        arm.animation_data.action = act
        scene.frame_set(frame)
        bpy.context.view_layer.update()
        out_path = os.path.join(OUT_DIR, f"glb_{act_name}.png")
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered GLB action {act_name}: {out_path}")

print("Validation script finished successfully.")
