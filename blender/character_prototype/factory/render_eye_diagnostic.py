import bpy
import math
import os

BLEND_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
OUT_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\eye_diag"
os.makedirs(OUT_DIR, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

# Hide hair collection or objects with Hair in name
for col in bpy.data.collections:
    if "hair" in col.name.lower():
        col.hide_render = True
for o in bpy.data.objects:
    if "hair" in o.name.lower():
        o.hide_render = True

# Also hide clothing if any to focus strictly on head, or keep them if needed. Let's keep clothing visible or hide it so only head is rendered.
# Let's inspect what objects are in the scene
print("=== OBJECTS IN SCENE ===")
for o in bpy.data.objects:
    print(f"Object: {o.name}, type: {o.type}, hide_render: {o.hide_render}")

# Camera setup for close up on face
cam = bpy.data.objects.get("Camera")
if not cam:
    cam_data = bpy.data.cameras.new("CamFace")
    cam = bpy.data.objects.new("CamFace", cam_data)
    bpy.context.scene.collection.objects.link(cam)

bpy.context.scene.camera = cam

# Configure render
scene = bpy.context.scene
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.engine = 'BLENDER_EEVEE_NEXT'

# Face center is at Z=0.525, Y=0.155, X=0.0
target_z = 0.525
target_y = 0.155

# Setup lights for clear, crisp inspection
# Remove existing lights or add high quality soft lights
for o in list(bpy.data.objects):
    if o.type == 'LIGHT':
        bpy.data.objects.remove(o, do_unlink=True)

# Key light
light_key_data = bpy.data.lights.new(name="DiagKey", type='AREA')
light_key_data.energy = 50.0
light_key_data.size = 0.5
light_key = bpy.data.objects.new(name="DiagKey", object_data=light_key_data)
light_key.location = (0.3, 0.8, 0.8)
bpy.context.scene.collection.objects.link(light_key)

# Fill light
light_fill_data = bpy.data.lights.new(name="DiagFill", type='AREA')
light_fill_data.energy = 30.0
light_fill_data.size = 0.8
light_fill = bpy.data.objects.new(name="DiagFill", object_data=light_fill_data)
light_fill.location = (-0.4, 0.7, 0.6)
bpy.context.scene.collection.objects.link(light_fill)

# Front light
light_front_data = bpy.data.lights.new(name="DiagFront", type='AREA')
light_front_data.energy = 25.0
light_front_data.size = 0.6
light_front = bpy.data.objects.new(name="DiagFront", object_data=light_front_data)
light_front.location = (0.0, 0.9, 0.525)
bpy.context.scene.collection.objects.link(light_front)

views = [
    ("front_closeup", (0.0, 0.65, 0.525), (math.radians(90), 0, math.radians(180))),
    ("three_quarter_l", (-0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(210))),
    ("three_quarter_r", (0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(150))),
    ("profile_l", (-0.55, 0.155, 0.525), (math.radians(90), 0, math.radians(270))),
]

for name, loc, rot in views:
    cam.location = loc
    cam.rotation_euler = rot
    cam.data.lens = 70.0 # tight portrait lens to avoid perspective distortion
    out_path = os.path.join(OUT_DIR, f"{name}.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {out_path}")

print("Diagnostic renders complete.")
