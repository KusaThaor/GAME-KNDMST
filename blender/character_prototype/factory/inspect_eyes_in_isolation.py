"""
Inspects the eyes in isolation on the canonical base scene.
Hides all hair and accessories.
Renders high-resolution close-ups:
- Front
- Left Three-Quarter
- Right Three-Quarter
- Left Profile
- Right Profile
- Macro zoom on Left Eye and Right Eye
"""

import bpy
import math
import os
import shutil

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
BLEND_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
OUT_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory", "previews", "eye_investigation")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# 1. Open canonical base blend
bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

# 2. Hide all hair and accessories
for o in bpy.data.objects:
    if "hair" in o.name.lower() or "cap" in name if "name" in locals() else False:
        pass
    if "hair" in o.name.lower() or "cap" in o.name.lower() or "bangs" in o.name.lower() or "sideburn" in o.name.lower():
        o.hide_render = True
    if "glass" in o.name.lower() or "scarf" in o.name.lower() or "acc_" in o.name.lower():
        o.hide_render = True

# 3. Setup studio lights
for o in list(bpy.data.objects):
    if o.type == 'LIGHT':
        bpy.data.objects.remove(o, do_unlink=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'

# World
if not scene.world:
    scene.world = bpy.data.worlds.new("World_Eyes")
scene.world.use_nodes = True
nodes = scene.world.node_tree.nodes
nodes.clear()
out = nodes.new("ShaderNodeOutputWorld")
bg = nodes.new("ShaderNodeBackground")
scene.world.node_tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
bg.inputs["Color"].default_value = (0.88, 0.89, 0.91, 1.0)
bg.inputs["Strength"].default_value = 0.95

def add_light(name, energy, loc, rot_deg, size=0.8):
    l = bpy.data.lights.new(name, 'AREA')
    l.energy = energy
    l.size = size
    obj = bpy.data.objects.new(name, l)
    obj.location = loc
    obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
    scene.collection.objects.link(obj)
    return obj

add_light("Key", 45.0, (0.35, 0.85, 0.75), (48, 0, 22), size=0.8)
add_light("Fill", 30.0, (-0.40, 0.80, 0.65), (52, 0, -28), size=0.9)
add_light("Front", 22.0, (0.0, 0.90, 0.525), (90, 0, 0), size=0.7)

# Camera
cam_data = bpy.data.cameras.new("CamEye")
cam_data.lens = 85 # telephoto to avoid perspective distortion
cam = bpy.data.objects.new("CamEye", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# Views centered at eye level: Z = 0.520, Y = 0.155
views = [
    ("eye_isolation_front", (0.0, 0.75, 0.520), (math.radians(90), 0, math.radians(180))),
    ("eye_isolation_three_quarter_l", (-0.48, 0.58, 0.535), (math.radians(82), 0, math.radians(-140))),
    ("eye_isolation_three_quarter_r", (0.48, 0.58, 0.535), (math.radians(82), 0, math.radians(140))),
    ("eye_isolation_profile_l", (-0.65, 0.15, 0.520), (math.radians(90), 0, math.radians(-90))),
    ("eye_isolation_profile_r", (0.65, 0.15, 0.520), (math.radians(90), 0, math.radians(90))),
]

for vname, loc, rot in views:
    cam.location = loc
    cam.rotation_euler = rot
    cam_data.lens = 85
    out_file = os.path.join(OUT_DIR, f"{vname}.png")
    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    shutil.copyfile(out_file, os.path.join(ARTIFACT_DIR, f"{vname}.png"))
    print(f"[Done] Rendered {vname} -> {out_file}")

# Macro zooms on eyes
cam_data.lens = 150 # Macro zoom
# Left eye center: X = -0.066, Z = 0.520
cam.location = (-0.066, 0.45, 0.520)
cam.rotation_euler = (math.radians(90), 0, math.radians(180))
out_left = os.path.join(OUT_DIR, "eye_isolation_macro_left.png")
scene.render.filepath = out_left
bpy.ops.render.render(write_still=True)
shutil.copyfile(out_left, os.path.join(ARTIFACT_DIR, "eye_isolation_macro_left.png"))
print(f"[Done] Rendered eye_isolation_macro_left -> {out_left}")

# Right eye center: X = 0.066, Z = 0.520
cam.location = (0.066, 0.45, 0.520)
cam.rotation_euler = (math.radians(90), 0, math.radians(180))
out_right = os.path.join(OUT_DIR, "eye_isolation_macro_right.png")
scene.render.filepath = out_right
bpy.ops.render.render(write_still=True)
shutil.copyfile(out_right, os.path.join(ARTIFACT_DIR, "eye_isolation_macro_right.png"))
print(f"[Done] Rendered eye_isolation_macro_right -> {out_right}")

print("=== EYE ISOLATION RENDERING COMPLETE ===")
