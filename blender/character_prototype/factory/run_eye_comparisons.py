"""
Renders side-by-side comparison of eyes:
1. With Acc_Glasses (what V16 rendered)
2. Without Acc_Glasses (pure character base + hair)
3. Face & Eyes in complete isolation (no hair, no glasses)
"""

import bpy
import os
import math
import shutil

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
BLEND_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
OUT_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory", "previews", "eye_investigation")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

import sys
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
if FACTORY_DIR not in sys.path:
    sys.path.append(FACTORY_DIR)
import character_factory
import test_rebuild_bob_v16

clothing_spec = {
    "top_id": "TOP_001",
    "bottom_id": "BOTTOM_001",
    "footwear_id": "FOOTWEAR_001",
    "socks_id": "SOCKS_001"
}

# ---------------------------------------------------------------------------
# Render 1: Exactly as V16 was (WITH Acc_Glasses)
# ---------------------------------------------------------------------------
factory = character_factory.CharacterFactory(BLEND_PATH)
char_tag = "test_with_glasses"
factory.load_base()
factory.isolate_materials(char_tag)
factory.apply_skin_tone("SKIN_02", char_tag)
for o in list(bpy.data.objects):
    if o.name.startswith("Hair_"):
        bpy.data.objects.remove(o, do_unlink=True)
hair = test_rebuild_bob_v16.build_bob_v16(factory.arm, char_tag, mat_mode="production")
factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
factory.equip_accessories(["ACC_002"], char_tag)

scene = bpy.context.scene
cam = test_rebuild_bob_v16.setup_chibi_studio(scene, res=(1024, 1024))
cam.location = (0.0, 0.65, 0.525)
cam.rotation_euler = (math.radians(90), 0, math.radians(180))
cam.data.lens = 75

out1 = os.path.join(OUT_DIR, "compare_with_glasses.png")
scene.render.filepath = out1
bpy.ops.render.render(write_still=True)
shutil.copyfile(out1, os.path.join(ARTIFACT_DIR, "compare_with_glasses.png"))
print("[1] Rendered compare_with_glasses")

# ---------------------------------------------------------------------------
# Render 2: WITHOUT Acc_Glasses (Clean base + hair)
# ---------------------------------------------------------------------------
char_tag2 = "test_without_glasses"
factory.load_base()
factory.isolate_materials(char_tag2)
factory.apply_skin_tone("SKIN_02", char_tag2)
for o in list(bpy.data.objects):
    if o.name.startswith("Hair_"):
        bpy.data.objects.remove(o, do_unlink=True)
hair2 = test_rebuild_bob_v16.build_bob_v16(factory.arm, char_tag2, mat_mode="production")
factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag2)
# NO ACCESSORIES!

scene2 = bpy.context.scene
cam2 = test_rebuild_bob_v16.setup_chibi_studio(scene2, res=(1024, 1024))
cam2.location = (0.0, 0.65, 0.525)
cam2.rotation_euler = (math.radians(90), 0, math.radians(180))
cam2.data.lens = 75

out2 = os.path.join(OUT_DIR, "compare_without_glasses.png")
scene2.render.filepath = out2
bpy.ops.render.render(write_still=True)
shutil.copyfile(out2, os.path.join(ARTIFACT_DIR, "compare_without_glasses.png"))
print("[2] Rendered compare_without_glasses")

# ---------------------------------------------------------------------------
# Render 3: Eyes in complete isolation (no hair, no glasses, no clothes)
# ---------------------------------------------------------------------------
char_tag3 = "test_eyes_pure"
factory.load_base()
factory.isolate_materials(char_tag3)
factory.apply_skin_tone("SKIN_02", char_tag3)
for o in list(bpy.data.objects):
    if o.name.startswith("Hair_") or "hair" in o.name.lower() or "cap" in o.name.lower() or "bangs" in o.name.lower() or "sideburn" in o.name.lower():
        bpy.data.objects.remove(o, do_unlink=True)

scene3 = bpy.context.scene
cam3 = test_rebuild_bob_v16.setup_chibi_studio(scene3, res=(1024, 1024))
cam3.location = (0.0, 0.65, 0.525)
cam3.rotation_euler = (math.radians(90), 0, math.radians(180))
cam3.data.lens = 75

out3 = os.path.join(OUT_DIR, "compare_eyes_pure.png")
scene3.render.filepath = out3
bpy.ops.render.render(write_still=True)
shutil.copyfile(out3, os.path.join(ARTIFACT_DIR, "compare_eyes_pure.png"))
print("[3] Rendered compare_eyes_pure")

print("=== ALL COMPARATIVE RENDERS FINISHED ===")
