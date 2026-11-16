import bpy
import math
import os

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SCENE_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
OUT_IMG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_clean_hair_front.png")
OUT_IMG_34 = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_clean_hair_34.png")

bpy.ops.wm.open_mainfile(filepath=SCENE_PATH)
scene = bpy.context.scene

# Remove old hair objects
for name in ["Hair_Base", "Hair_Bangs_Center", "Hair_Bangs_Left", "Hair_Bangs_Right", "Hair_Sideburn_L", "Hair_Sideburn_R", "Hair_Bangs", "Hair_Cap"]:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

mat_hair = bpy.data.materials.get("M_Hair")
col_hair = bpy.data.collections.get("03_Hair_Default")
if not col_hair:
    col_hair = bpy.context.scene.collection

arm = bpy.data.objects.get("Student_Armature")
head_z = 0.525

# 1. Hair Cap (Smooth rounded dome with Subdiv 2)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.015, 0.540))
cap = bpy.context.active_object
cap.name = "Hair_Cap"
cap.scale = (0.180, 0.170, 0.145)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
sub_c = cap.modifiers.new("Subdiv", "SUBSURF")
sub_c.levels = 2
sub_c.render_levels = 2
cap.data.materials.append(mat_hair)
col_hair.objects.link(cap)
bpy.context.scene.collection.objects.unlink(cap)
for p in cap.data.polygons:
    p.use_smooth = True

# 2. Hair Bangs (Single continuous curved bangs fringe with Subdiv 2)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.100, 0.570))
bangs = bpy.context.active_object
bangs.name = "Hair_Bangs"
bangs.scale = (0.165, 0.076, 0.079)
bangs.rotation_euler = (math.radians(-15), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
sub_b = bangs.modifiers.new("Subdiv", "SUBSURF")
sub_b.levels = 2
sub_b.render_levels = 2
bangs.data.materials.append(mat_hair)
col_hair.objects.link(bangs)
bpy.context.scene.collection.objects.unlink(bangs)
for p in bangs.data.polygons:
    p.use_smooth = True

# 3. Sideburns
for side, sign in [(-1, "L"), (1, "R")]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.160, 0.030, 0.520))
    burn = bpy.context.active_object
    burn.name = f"Hair_Sideburn_{sign}"
    burn.scale = (0.022, 0.043, 0.051)
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

# Armature & Pose: Reset all bones to upright (0, 0, 0)
if arm:
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.location = (0, 0, 0)
        pb.rotation_euler = (0, 0, 0)
        pb.scale = (1, 1, 1)

    # Bind hair objects to Head bone
    for h_obj in [cap, bangs, bpy.data.objects.get("Hair_Sideburn_L"), bpy.data.objects.get("Hair_Sideburn_R")]:
        if h_obj:
            mod = h_obj.modifiers.new("Armature", "ARMATURE")
            mod.object = arm
            vg = h_obj.vertex_groups.new(name="Head")
            vg.add(list(range(len(h_obj.data.vertices))), 1.0, "REPLACE")

    idle_act = bpy.data.actions.get("Action_Idle")
    if idle_act:
        for fc in list(idle_act.fcurves):
            idle_act.fcurves.remove(fc)
        def idle_kf(bname, prop, val, f):
            b = arm.pose.bones[bname]
            setattr(b, prop, val)
            b.keyframe_insert(prop, frame=f)

        for f, bz, rx, ay in [(1, 0.0, 0.0, 0.0), (20, 0.003, math.radians(1.2), math.radians(1.0)), (40, 0.0, 0.0, 0.0)]:
            idle_kf("Root", "rotation_euler", (0, 0, 0), f)
            idle_kf("Hips", "location", (0, 0, bz), f)
            idle_kf("Hips", "rotation_euler", (0, 0, 0), f)
            idle_kf("Spine", "rotation_euler", (0, 0, 0), f)
            idle_kf("Chest", "rotation_euler", (rx, 0, 0), f)
            idle_kf("Neck", "rotation_euler", (0, 0, 0), f)
            idle_kf("Head", "rotation_euler", (0, 0, 0), f)
            idle_kf("UpperArm.L", "rotation_euler", (0, 0, math.radians(-7) + ay), f)
            idle_kf("UpperArm.R", "rotation_euler", (0, 0, math.radians(7) - ay), f)
            idle_kf("Forearm.L", "rotation_euler", (math.radians(10), 0, math.radians(-3)), f)
            idle_kf("Forearm.R", "rotation_euler", (math.radians(10), 0, math.radians(3)), f)
            idle_kf("Hand.L", "rotation_euler", (0, 0, 0), f)
            idle_kf("Hand.R", "rotation_euler", (0, 0, 0), f)
            idle_kf("Thigh.L", "rotation_euler", (0, 0, 0), f)
            idle_kf("Shin.L", "rotation_euler", (0, 0, 0), f)
            idle_kf("Foot.L", "rotation_euler", (0, 0, 0), f)
            idle_kf("Thigh.R", "rotation_euler", (0, 0, 0), f)
            idle_kf("Shin.R", "rotation_euler", (0, 0, 0), f)
            idle_kf("Foot.R", "rotation_euler", (0, 0, 0), f)

    arm.animation_data.use_nla = False
    arm.animation_data.action = idle_act
    scene.frame_set(1)
    bpy.context.view_layer.update()

# Camera & Lighting
cam_obj = bpy.data.objects.get("Cam")
if not cam_obj:
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# World lighting
if not scene.world:
    scene.world = bpy.data.worlds.new("World")
scene.world.use_nodes = True
bg_node = scene.world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
    bg_node.inputs["Strength"].default_value = 0.8

# Key light
key_obj = bpy.data.objects.get("Key")
if not key_obj:
    key_l = bpy.data.lights.new("Key", "SUN")
    key_obj = bpy.data.objects.new("Key", key_l)
    scene.collection.objects.link(key_obj)
key_obj.data.energy = 4.8
key_obj.rotation_euler = (math.radians(52), math.radians(22), math.radians(-32))

# Fill light
fill_obj = bpy.data.objects.get("Fill")
if not fill_obj:
    fill_l = bpy.data.lights.new("Fill", "SUN")
    fill_obj = bpy.data.objects.new("Fill", fill_l)
    scene.collection.objects.link(fill_obj)
fill_obj.data.energy = 2.8
fill_obj.rotation_euler = (math.radians(40), math.radians(-30), math.radians(145))

dist = 1.95
target_z = 0.40

scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.engine = "CYCLES"
scene.cycles.samples = 12
scene.cycles.use_denoising = True

# Front View
cam_obj.location = (0.0, dist, target_z)
cam_obj.rotation_euler = (math.radians(88), 0, math.radians(180))
scene.render.filepath = OUT_IMG
bpy.ops.render.render(write_still=True)

# 3/4 View
cam_obj.location = (dist * 0.72, dist * 0.72, target_z + 0.10)
cam_obj.rotation_euler = (math.radians(84), 0, math.radians(135))
scene.render.filepath = OUT_IMG_34
bpy.ops.render.render(write_still=True)

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\clean_hair_render_log.txt", "w") as f:
    f.write(f"Rendered front: {OUT_IMG}, exists: {os.path.exists(OUT_IMG)}\n")
    f.write(f"Rendered 3/4: {OUT_IMG_34}, exists: {os.path.exists(OUT_IMG_34)}\n")
