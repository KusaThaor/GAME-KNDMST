import bpy
import bmesh
import math
import os
import sys

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
CANONICAL_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
TEST_OUT = os.path.join(FACTORY_DIR, "previews", "test_skirt_legs_fix.png")

if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import clothing_library

bpy.ops.wm.open_mainfile(filepath=CANONICAL_BLEND)
arm = bpy.data.objects["Student_Armature"]

# Test equipping TOP_001 + BOTTOM_004 (pleated skirt) + FOOTWEAR_001 + SOCKS_001
# with updated logic
created = clothing_library.equip_modular_character_clothing(
    arm=arm,
    char_id="test_skirt",
    skin_hex="#fae3d2",
    top_id="TOP_001",
    bottom_id="BOTTOM_004",
    footwear_id="FOOTWEAR_001",
    socks_id="SOCKS_001"
)

# Camera looking at lower body & full character
cam_data = bpy.data.cameras.new("Test_Cam")
cam_data.lens = 50
cam_obj = bpy.data.objects.new("Test_Cam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj
cam_obj.location = (0.15, 1.60, 0.35)
cam_obj.rotation_euler = (math.radians(88), 0, math.radians(175))

# Light
l_data = bpy.data.lights.new("Sun", "SUN")
l_data.energy = 4.5
l_obj = bpy.data.objects.new("Sun", l_data)
bpy.context.scene.collection.objects.link(l_obj)
l_obj.rotation_euler = (math.radians(50), math.radians(20), math.radians(-30))

bpy.context.scene.render.resolution_x = 480
bpy.context.scene.render.resolution_y = 640
bpy.context.scene.render.filepath = TEST_OUT
bpy.ops.render.render(write_still=True)

print(f"Test render saved: {TEST_OUT}")
