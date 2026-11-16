import bpy
import math
import os

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SCENE_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "backup_v7", "vietnamese_student_original_v7.blend")
OUT_IMG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "orig_front.png")
OUT_IMG_34 = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "orig_34.png")

bpy.ops.wm.open_mainfile(filepath=SCENE_PATH)
scene = bpy.context.scene

# Check materials
print("Materials in orig:", [m.name for m in bpy.data.materials])

# Camera
cam_obj = bpy.data.objects.get("Cam") or scene.camera
if not cam_obj:
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Lighting
if not bpy.data.objects.get("Key"):
    key_l = bpy.data.lights.new("Key", "SUN")
    key_l.energy = 4.5
    key_obj = bpy.data.objects.new("Key", key_l)
    key_obj.rotation_euler = (math.radians(50), math.radians(20), math.radians(-30))
    scene.collection.objects.link(key_obj)

if not bpy.data.objects.get("Fill"):
    fill_l = bpy.data.lights.new("Fill", "SUN")
    fill_l.energy = 2.5
    fill_obj = bpy.data.objects.new("Fill", fill_l)
    fill_obj.rotation_euler = (math.radians(40), math.radians(-30), math.radians(140))
    scene.collection.objects.link(fill_obj)

dist = 1.95
target_z = 0.40

# Front View
cam_obj.location = (0.0, dist, target_z)
cam_obj.rotation_euler = (math.radians(88), 0, math.radians(180))
scene.render.filepath = OUT_IMG
scene.render.resolution_x = 720
scene.render.resolution_y = 900
bpy.ops.render.render(write_still=True)

# 3/4 View
cam_obj.location = (dist * 0.72, dist * 0.72, target_z + 0.10)
cam_obj.rotation_euler = (math.radians(84), 0, math.radians(135))
scene.render.filepath = OUT_IMG_34
bpy.ops.render.render(write_still=True)

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\orig_materials.txt", "w") as f:
    for m in bpy.data.materials:
        f.write(f"Mat: {m.name}\n")
        if m.use_nodes:
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                f.write(f"  BaseColor: {list(bsdf.inputs['Base Color'].default_value)}\n")
