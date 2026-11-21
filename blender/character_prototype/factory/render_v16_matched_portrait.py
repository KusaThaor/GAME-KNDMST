"""
Renders V16 Bob under the exact same portrait camera, lighting, and framing as V17
to produce 1:1 pixel-matched Before vs After comparisons.
"""

import bpy
import math
import os
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
BLEND_V16 = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend", "hair_003_v16_source.blend")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v16_matched")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)

import sys
if FACTORY_DIR not in sys.path:
    sys.path.append(FACTORY_DIR)
import test_rebuild_bob_v17

bpy.ops.wm.open_mainfile(filepath=BLEND_V16)

# Ensure no Acc_Glasses are present (clean comparison)
for o in list(bpy.data.objects):
    if "Glasses" in o.name:
        bpy.data.objects.remove(o, do_unlink=True)

scene = bpy.context.scene
cam = test_rebuild_bob_v17.setup_chibi_portrait_studio(scene, res=(1024, 1024))

portrait_views = [
    ("front", (0.0, 0.76, 0.528), (math.radians(90), 0, math.radians(180))),
    ("three_quarter_left", (-0.54, 0.54, 0.536), (math.radians(82), 0, math.radians(-135))),
    ("three_quarter_right", (0.54, 0.54, 0.536), (math.radians(82), 0, math.radians(135))),
    ("profile_left", (-0.76, 0.0, 0.528), (math.radians(90), 0, math.radians(-90))),
    ("profile_right", (0.76, 0.0, 0.528), (math.radians(90), 0, math.radians(90))),
    ("rear", (0.0, -0.76, 0.528), (math.radians(90), 0, 0)),
    ("macro_fringe_roots", (0.0, 0.44, 0.585), (math.radians(80), 0, math.radians(180))),
    ("macro_temple_left", (-0.30, 0.35, 0.560), (math.radians(82), 0, math.radians(-140))),
    ("macro_temple_right", (0.30, 0.35, 0.560), (math.radians(82), 0, math.radians(140))),
]

for vname, loc, rot in portrait_views:
    cam.location = loc
    cam.rotation_euler = rot
    out_name = f"hair_003_v16_matched_{vname}.png"
    out_path = os.path.join(PREVIEWS_DIR, out_name)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
    print(f"  [Rendered V16 Matched] -> {out_name}")

print("[Done] All matched V16 portrait renders completed.")
