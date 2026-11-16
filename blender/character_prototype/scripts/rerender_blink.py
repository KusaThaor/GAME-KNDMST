import bpy
import math
import os
import shutil

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
INPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_skinned.blend")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_skinned")
ACTIONS_DIR = os.path.join(PREVIEWS_DIR, "actions")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_skinned"

bpy.ops.wm.open_mainfile(filepath=INPUT_BLEND)

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

scene = bpy.context.scene
if not scene.world:
    scene.world = bpy.data.worlds.new("World")
scene.world.use_nodes = True
bg_node = scene.world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
    bg_node.inputs["Strength"].default_value = 0.8

cam_obj = bpy.data.objects.get("Cam")
if not cam_obj:
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Key light
key_obj = bpy.data.objects.get("Key")
if not key_obj:
    key_l = bpy.data.lights.new("Key", "SUN")
    key_obj = bpy.data.objects.new("Key", key_l)
    scene.collection.objects.link(key_obj)
key_obj.data.energy = 4.8
key_obj.data.color = hex_to_lin("#fffbf4")[:3]
key_obj.rotation_euler = (math.radians(52), math.radians(22), math.radians(-32))

# Fill light
fill_obj = bpy.data.objects.get("Fill")
if not fill_obj:
    fill_l = bpy.data.lights.new("Fill", "SUN")
    fill_obj = bpy.data.objects.new("Fill", fill_l)
    scene.collection.objects.link(fill_obj)
fill_obj.data.energy = 2.8
fill_obj.data.color = hex_to_lin("#e2edfa")[:3]
fill_obj.rotation_euler = (math.radians(40), math.radians(-30), math.radians(145))

# Bounce light
bounce_obj = bpy.data.objects.get("Bounce")
if not bounce_obj:
    bounce_l = bpy.data.lights.new("Bounce", "SUN")
    bounce_obj = bpy.data.objects.new("Bounce", bounce_l)
    scene.collection.objects.link(bounce_obj)
bounce_obj.data.energy = 1.6
bounce_obj.data.color = hex_to_lin("#f8ede2")[:3]
bounce_obj.rotation_euler = (math.radians(-45), math.radians(15), math.radians(20))

# Rim light
rim_obj = bpy.data.objects.get("Rim")
if not rim_obj:
    rim_l = bpy.data.lights.new("Rim", "SUN")
    rim_obj = bpy.data.objects.new("Rim", rim_l)
    scene.collection.objects.link(rim_obj)
rim_obj.data.energy = 3.2
rim_obj.data.color = hex_to_lin("#ffffff")[:3]
rim_obj.rotation_euler = (math.radians(30), math.radians(15), math.radians(35))

scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100

try:
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.cycles.device = "CPU"
except:
    scene.render.engine = "BLENDER_EEVEE_NEXT"

arm_obj = bpy.data.objects["Student_Armature"]
act = bpy.data.actions["Action_Blink"]
arm_obj.animation_data.action = act
scene.frame_set(7)

dist = 1.95
target_z = 0.35
cam_obj.location = (dist * 0.72, dist * 0.72, target_z + 0.14)
cam_obj.rotation_euler = (math.radians(82), 0, math.radians(135))

out_local = os.path.join(ACTIONS_DIR, "action_blink.png")
out_art = os.path.join(ARTIFACT_DIR, "actions", "action_blink.png")
scene.render.filepath = out_local
bpy.ops.render.render(write_still=True)
shutil.copy2(out_local, out_art)

# Reset to Idle
idle_act = bpy.data.actions.get("Action_Idle")
if idle_act:
    arm_obj.animation_data.action = idle_act
scene.frame_set(1)

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\blink_log.txt", "w") as f:
    f.write("BLINK WITH LIGHTS COMPLETE!\n")
