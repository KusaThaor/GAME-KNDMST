import bpy
import os
import math

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_repair")
GLB_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants", "test_export_apply.glb")
OUT_LOG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "test_reimported_anims_log.txt")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

arm = bpy.data.objects.get("Student_Armature")
scene = bpy.context.scene

# Studio
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 55
cam_obj = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj
cam_obj.location = (0.0, 1.75, 0.50)
cam_obj.rotation_euler = (math.radians(88), 0, math.radians(180))

scene.world = bpy.data.worlds.new("World")
scene.world.use_nodes = True
bg_node = scene.world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

def ensure_sun(name, energy, rot):
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

scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.image_settings.file_format = "PNG"

# Test actions
actions_to_test = [("Action_Walk", 15), ("Action_Sit", 20), ("Action_Wave", 15)]

with open(OUT_LOG, "w", encoding="utf-8") as f:
    f.write(f"Testing re-imported animations from {GLB_PATH}...\n")
    if not arm or not arm.animation_data:
        f.write("ERROR: Armature or animation_data not found!\n")
    else:
        for act_name, frame in actions_to_test:
            act = bpy.data.actions.get(act_name)
            if not act:
                f.write(f"Action '{act_name}' not found!\n")
                continue
            arm.animation_data.action = act
            scene.frame_set(frame)
            bpy.context.view_layer.update()
            
            out_img = os.path.join(PREVIEWS_DIR, f"reimported_{act_name}.png")
            scene.render.filepath = out_img
            bpy.ops.render.render(write_still=True)
            f.write(f"Rendered {act_name} at frame {frame} -> {out_img}\n")

print("Completed testing reimported animations.")
