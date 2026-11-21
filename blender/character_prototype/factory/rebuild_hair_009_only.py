"""
Rebuild and export HAIR_009 only with optimized plait segments.
"""

import bpy
import os
import sys
import shutil
import math

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import character_factory
import rebuild_v11_all_12_hairstyles as hair_v11
from run_v11_all_12_pipeline import setup_chibi_studio

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "all_12_v11")
GLB_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")

factory = character_factory.CharacterFactory(CANONICAL_BLEND)
char_tag = "v11_hair_009"
factory.load_base()
factory.isolate_materials(char_tag)
factory.apply_skin_tone("SKIN_02", char_tag)

for o in list(bpy.data.objects):
    if o.name.startswith("Hair_"):
        bpy.data.objects.remove(o, do_unlink=True)
        
arm = factory.arm
hair_obj = hair_v11.build_hair_009(arm, char_id=char_tag, color_hex="#1c1615", tie_hex="#e0564c")
print(f"[Built] {hair_obj.name}: {len(hair_obj.data.polygons)} quads")

clothing_spec = {
    "top_id": "TOP_001",
    "bottom_id": "BOTTOM_001",
    "footwear_id": "FOOTWEAR_001",
    "socks_id": "SOCKS_001"
}
factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
factory.equip_accessories(["ACC_002"], char_tag)

blend_path = os.path.join(BLEND_DIR, "hair_009_v11_source.blend")
blend_preview_path = os.path.join(PREVIEWS_DIR, "hair_009_v11_source.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
shutil.copyfile(blend_path, blend_preview_path)

glb_path = os.path.join(GLB_DIR, "character_hair_009_v11.glb")
glb_preview_path = os.path.join(PREVIEWS_DIR, "character_hair_009_v11.glb")
glb_size = factory.export_glb(glb_path)
shutil.copyfile(glb_path, glb_preview_path)
print(f"Exported GLB -> {glb_path} ({glb_size / 1024:.1f} KB)")

# Re-render 4 views for hair_009
scene = bpy.context.scene
cam = setup_chibi_studio(scene, res=(768, 896))
views = [
    ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
    ("three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
    ("side", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
    ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
]
for vname, loc, rot, lens in views:
    cam.location = loc
    cam.rotation_euler = rot
    cam.data.lens = lens
    img_filename = f"hair_009_{vname}.png"
    img_path = os.path.join(PREVIEWS_DIR, img_filename)
    scene.render.filepath = img_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {vname} -> {img_filename}")

print("HAIR_009 rebuild complete!")
