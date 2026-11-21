"""
Renders all 5 required views for Vietnamese Red Scarf (Khăn Quàng Đỏ) V3:
1. Front view
2. Left side view
3. Back view
4. Three-quarter rear view
5. Close-up of neckline

Also exports student_uniform_scarf.blend and student_uniform_scarf.glb.
"""
import os
import sys
import math
import bpy
import mathutils

sys.path.insert(0, r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory")

from character_factory import CharacterFactory
from clothing_library import build_accessory_001_red_scarf

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
OUTPUTS_DIR = os.path.join(FACTORY_DIR, "outputs")
os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

def setup_studio(scene, cam_loc, cam_rot, res=(600, 750), lens=50):
    for o in list(scene.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            scene.collection.objects.unlink(o)
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Scarf_Studio_Cam")
    cam_data.lens = lens
    cam_obj = bpy.data.objects.new("Scarf_Studio_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = cam_rot

    scene.world = bpy.data.worlds.new("Scarf_Studio_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.07, 0.08, 0.11, 1.0)
        bg.inputs["Strength"].default_value = 0.95

    def add_sun(name, energy, rot_deg):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj

    add_sun("Key", 5.2, (50, 20, -35))
    add_sun("Fill", 3.5, (35, -20, 140))
    add_sun("ChinBounce", 3.5, (-60, 10, 15))
    add_sun("BackSun", 5.0, (35, 0, -180))
    add_sun("SideSun", 4.2, (30, -30, -90))
    add_sun("Rim", 4.0, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def render_and_export():
    # 1. Build character with canonical student uniform and V3 red scarf
    factory = CharacterFactory(CANONICAL_BLEND)
    factory.load_base()
    factory.isolate_materials("v3_scarf")
    factory.apply_skin_tone("SKIN_02", "v3_scarf")
    factory.equip_hair("HAIR_001", "#1c1615", "v3_scarf")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "v3_scarf")
    factory.setup_facial_system("Happy", "v3_scarf")

    # Equip V3 Red Scarf from updated clothing_library
    scarf_obj = build_accessory_001_red_scarf(factory.arm, "v3_scarf", color="#d92027")

    # 2. Export canonical blend and GLB
    blend_path = os.path.join(OUTPUTS_DIR, "student_uniform_scarf.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved blend file to: {blend_path}")

    glb_path = os.path.join(OUTPUTS_DIR, "student_uniform_scarf.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_animations=True,
        export_skins=True,
        export_morph=True
    )
    print(f"Exported GLB to: {glb_path}")

    # 3. Render all 5 views
    views = [
        ("scarf_v3_front.png",              (0.0, 1.45, 0.38),   (math.radians(92), 0, math.radians(180)), (600, 750), 50),
        ("scarf_v3_left_side.png",          (-1.45, 0.0, 0.38),  (math.radians(90), 0, math.radians(-90)), (600, 750), 50),
        ("scarf_v3_back.png",               (0.0, -1.45, 0.38),  (math.radians(88), 0, 0),                 (600, 750), 50),
        ("scarf_v3_three_quarter_rear.png", (-1.10, -1.10, 0.44),(math.radians(82), 0, math.radians(-45)), (600, 750), 50),
        ("scarf_v3_neckline_closeup.png",   (0.0, -0.65, 0.405), (math.radians(84), 0, 0),                 (600, 600), 55),
    ]

    scene = bpy.context.scene
    for fname, cloc, crot, res, lens in views:
        setup_studio(scene, cloc, crot, res=res, lens=lens)
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered view: {out_path}")

if __name__ == "__main__":
    import traceback
    try:
        render_and_export()
        with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\render_scarf_status.txt", "w") as f:
            f.write("SUCCESS\n")
    except Exception as e:
        with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\render_scarf_err.txt", "w") as f:
            f.write(traceback.format_exc())
