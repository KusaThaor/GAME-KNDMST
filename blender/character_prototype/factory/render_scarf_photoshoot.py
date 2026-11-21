"""
Photoshoot Script for Vietnamese Red Scarf (Khăn Quàng Đỏ Đội Viên) V3
Renders:
1. Isolated Red Scarf (Khăn độc lập):
   - Front View (Nút thắt & 2 dải)
   - Back View (Vạt tam giác sau gáy chuẩn Fig 13)
   - Perspective 3/4 View (Góc nhìn khối 3D)
   - Top View (Vòng quấn cổ)
   - Wireframe/Clay Studio View
2. On-Character Close-Up Photos (Khi đeo trên áo sơ mi học sinh):
   - Front Knot Close-up (Cận cảnh ngực & cổ áo)
   - Back Triangle Close-up (Cận cảnh gáy áo & vạt tam giác)
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
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\ce5fb559-46a0-4bd7-bc18-cdd305c60e60"
os.makedirs(PREVIEWS_DIR, exist_ok=True)

def clear_lights_and_cameras(scene):
    for o in list(scene.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            scene.collection.objects.unlink(o)
            bpy.data.objects.remove(o, do_unlink=True)

def setup_studio_lighting(scene):
    scene.world = bpy.data.worlds.new("Studio_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.08, 0.09, 0.12, 1.0)
        bg.inputs["Strength"].default_value = 1.0

    def add_light(name, energy, rot_deg, color=(1.0, 1.0, 1.0)):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        l.color = color
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj

    add_light("KeyFront", 5.5, (45, 20, -35), (1.0, 0.98, 0.95))
    add_light("FillLeft", 3.8, (35, -25, 130), (0.92, 0.95, 1.0))
    add_light("BackRim", 5.0, (40, 0, -180), (1.0, 0.98, 0.95))
    add_light("UnderBounce", 3.2, (-60, 10, 15), (1.0, 0.95, 0.92))
    add_light("SideSoft", 4.0, (25, -40, -90), (0.95, 0.95, 1.0))

def create_camera(scene, name, loc, rot, lens=50):
    cam_data = bpy.data.cameras.new(name)
    cam_data.lens = lens
    cam_obj = bpy.data.objects.new(name, cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = loc
    cam_obj.rotation_euler = rot
    return cam_obj

def render_photos():
    # =========================================================================
    # PART 1: ON-CHARACTER CLOSE-UP PHOTOS (TRÊN NGƯỜI NHÂN VẬT)
    # =========================================================================
    factory = CharacterFactory(CANONICAL_BLEND)
    factory.load_base()

    scene = bpy.context.scene
    scene.render.resolution_x = 800
    scene.render.resolution_y = 800
    scene.render.image_settings.file_format = "PNG"

    factory.isolate_materials("photo_char")
    factory.apply_skin_tone("SKIN_02", "photo_char")
    factory.equip_hair("HAIR_001", "#1c1615", "photo_char")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "photo_char")
    factory.setup_facial_system("Happy", "photo_char")
    scarf_obj = build_accessory_001_red_scarf(factory.arm, "photo_char", color="#d92027")

    clear_lights_and_cameras(scene)
    setup_studio_lighting(scene)

    char_shots = [
        # 1. Front chest & knot macro close-up (Cận cảnh nút thắt & dải khăn trước ngực)
        ("photo_char_front_knot.png", (0.0, 0.65, 0.355), (math.radians(92), 0, math.radians(180)), 65),
        # 2. Back collar & rear triangle macro close-up (Cận cảnh vạt tam giác gáy sau Fig 13)
        ("photo_char_back_triangle.png", (0.0, -0.65, 0.385), (math.radians(84), 0, 0), 65),
        # 3. 3/4 front view chest (Góc 3/4 trước)
        ("photo_char_front_3quarter.png", (-0.75, 0.75, 0.370), (math.radians(92), 0, math.radians(-135)), 55),
        # 4. 3/4 back view neck (Góc 3/4 sau)
        ("photo_char_back_3quarter.png", (-0.75, -0.75, 0.400), (math.radians(84), 0, math.radians(-45)), 55),
    ]

    for fname, cloc, crot, lens in char_shots:
        clear_lights_and_cameras(scene)
        setup_studio_lighting(scene)
        create_camera(scene, "Cam", cloc, crot, lens=lens)
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered: {out_path}")

    # =========================================================================
    # PART 2: ISOLATED RED SCARF MODEL (RIÊNG MÔ HÌNH KHĂN QUÀNG ĐỎ)
    # =========================================================================
    # Hide or remove everything except scarf_obj to show the pure 3D model
    for o in list(scene.objects):
        if o != scarf_obj and o.type == 'MESH':
            o.hide_render = True

    # Center of scarf is around (0.0, 0.02, 0.35)
    scarf_shots = [
        # 1. Isolated 3D Perspective (Phối cảnh 3/4 độc lập)
        ("photo_isolated_perspective.png", (-0.48, 0.48, 0.45), (math.radians(72), 0, math.radians(-135)), 55),
        # 2. Isolated Front View (Mặt trước độc lập)
        ("photo_isolated_front.png", (0.0, 0.52, 0.345), (math.radians(90), 0, math.radians(180)), 55),
        # 3. Isolated Back View (Mặt sau độc lập - thấy rõ vạt tam giác Fig 13)
        ("photo_isolated_back.png", (0.0, -0.52, 0.365), (math.radians(90), 0, 0), 55),
        # 4. Isolated Top-Down View (Góc nhìn từ trên xuống thấy vòng cổ khép kín)
        ("photo_isolated_top.png", (0.0, 0.02, 0.75), (0, 0, math.radians(180)), 50),
        # 5. Isolated Side Profile View (Góc nhìn nghiêng thấy độ dày & đường cong ôm cổ)
        ("photo_isolated_side.png", (-0.52, 0.02, 0.350), (math.radians(90), 0, math.radians(-90)), 55),
    ]

    for fname, cloc, crot, lens in scarf_shots:
        clear_lights_and_cameras(scene)
        setup_studio_lighting(scene)
        create_camera(scene, "Cam", cloc, crot, lens=lens)
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered: {out_path}")

if __name__ == "__main__":
    import traceback
    try:
        render_photos()
        with open(os.path.join(FACTORY_DIR, "photoshoot_status.txt"), "w") as f:
            f.write("SUCCESS\n")
    except Exception as e:
        with open(os.path.join(FACTORY_DIR, "photoshoot_err.txt"), "w") as f:
            f.write(traceback.format_exc())
