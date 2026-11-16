import bpy
import math
import os
import sys

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
TEST_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants")
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
RAW_DIR = os.path.join(TEST_DIR, "raw_renders")
os.makedirs(RAW_DIR, exist_ok=True)

def setup_studio():
    scene = bpy.context.scene
    cam_obj = bpy.data.objects.get("Cam")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam")
        cam_data.lens = 55
        cam_obj = bpy.data.objects.new("Cam", cam_data)
        scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    if not scene.world:
        scene.world = bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
        bg_node.inputs["Strength"].default_value = 0.85

    def ensure_sun(name, energy, rot):
        obj = bpy.data.objects.get(name)
        if not obj:
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
    return cam_obj

# Current scene is already opened via command line argument!
# Read output path from command line or env
out_filepath = sys.argv[-1]
cam_obj = setup_studio()

# Camera framing
dist = 1.95
target_z = 0.40

# Check if front or 3/4
cam_obj.location = (0.0, dist, target_z)
cam_obj.rotation_euler = (math.radians(88), 0, math.radians(180))

bpy.context.scene.render.filepath = out_filepath
bpy.ops.render.render(write_still=True)
print(f"RENDERED: {out_filepath}")
