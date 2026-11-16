import bpy
import math
import os

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SCENE_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
OUT_IMG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_perfect_hair_front.png")
OUT_IMG_34 = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_perfect_hair_34.png")

bpy.ops.wm.open_mainfile(filepath=SCENE_PATH)
scene = bpy.context.scene

# Remove old hair objects
for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R", "Hair_Base"]:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

mat_hair = bpy.data.materials.get("M_Hair")
col_hair = bpy.data.collections.get("03_Hair_Default")
if not col_hair:
    col_hair = bpy.context.scene.collection

arm = bpy.data.objects.get("Student_Armature")
head_z = 0.525

# 1. Hair Cap (Taller, covers whole skull smoothly with volume)
bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0.0, -0.012, head_z + 0.042))
cap = bpy.context.active_object
cap.name = "Hair_Cap"
cap.scale = (0.192, 0.185, 0.165)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
sub = cap.modifiers.new("Subdiv", "SUBSURF")
sub.levels = 2
sub.render_levels = 2
cap.data.materials.append(mat_hair)
col_hair.objects.link(cap)
bpy.context.scene.collection.objects.unlink(cap)
for p in cap.data.polygons:
    p.use_smooth = True

# 2. Hair Bangs (Higher on forehead, framing brows naturally)
bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0.0, 0.095, head_z + 0.080))
bangs = bpy.context.active_object
bangs.name = "Hair_Bangs"
bangs.scale = (0.178, 0.070, 0.065)
bangs.rotation_euler = (math.radians(-18), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
sub = bangs.modifiers.new("Subdiv", "SUBSURF")
sub.levels = 2
sub.render_levels = 2
bangs.data.materials.append(mat_hair)
col_hair.objects.link(bangs)
bpy.context.scene.collection.objects.unlink(bangs)
for p in bangs.data.polygons:
    p.use_smooth = True

# 3. Sideburns
for side, sign in [(-1, "L"), (1, "R")]:
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(side * 0.168, 0.025, head_z + 0.010))
    burn = bpy.context.active_object
    burn.name = f"Hair_Sideburn_{sign}"
    burn.scale = (0.028, 0.048, 0.068)
    burn.rotation_euler = (math.radians(-12), 0, math.radians(side * -10))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = burn.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1
    burn.data.materials.append(mat_hair)
    col_hair.objects.link(burn)
    bpy.context.scene.collection.objects.unlink(burn)
    for p in burn.data.polygons:
        p.use_smooth = True

# Camera & Lighting
cam_obj = bpy.data.objects.get("Cam")
if not cam_obj:
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

dist = 1.95
target_z = 0.40

# Front View
cam_obj.location = (0.0, dist, target_z)
cam_obj.rotation_euler = (math.radians(90), 0, math.radians(180))
scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = OUT_IMG
bpy.ops.render.render(write_still=True)

# 3/4 View
cam_obj.location = (dist * 0.72, dist * 0.72, target_z + 0.10)
cam_obj.rotation_euler = (math.radians(84), 0, math.radians(135))
scene.render.filepath = OUT_IMG_34
bpy.ops.render.render(write_still=True)

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\perfect_hair_log.txt", "w") as f:
    f.write(f"Rendered front: {OUT_IMG}, exists={os.path.exists(OUT_IMG)}\n")
    f.write(f"Rendered 3/4: {OUT_IMG_34}, exists={os.path.exists(OUT_IMG_34)}\n")
