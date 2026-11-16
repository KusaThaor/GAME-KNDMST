"""
=============================================================================
CLOTHING LIBRARY V2 — BLENDER 3D RENDER ENGINE
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life 3D Narrative Game

Renders 3D previews for:
1. 8 Bottoms (preview_bottom_001.png to preview_bottom_008.png)
2. 8 Tops (preview_top_001.png to preview_top_008.png)
3. 12 Presets (preview_preset_001.png to preview_preset_012.png)
4. 5 Animations (anim_walk.png, anim_run.png, anim_sit.png, anim_bow.png, anim_talk.png)
5. 4 Turnaround Angles (mod_turn_front.png, mod_turn_side.png, mod_turn_three_quarter.png, mod_turn_back.png)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
CANONICAL_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")

os.makedirs(PREVIEWS_DIR, exist_ok=True)

if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import clothing_library
import asset_registry
from character_factory import CharacterFactory

def setup_studio(scene, cam_loc=(0.0, 1.85, 0.42), cam_rot=(math.radians(88), 0, math.radians(180)), res=(380, 500)):
    # Camera
    cam_data = bpy.data.cameras.new("Clothing_Cam")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("Clothing_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = cam_rot

    # World lighting
    scene.world = bpy.data.worlds.new("Clothing_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.07, 0.08, 0.11, 1.0)
        bg.inputs["Strength"].default_value = 0.95

    # 4-Point Lights
    def add_sun(name, energy, rot_deg):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj

    add_sun("Key", 5.2, (52, 18, -35))
    add_sun("Fill", 2.8, (38, -25, 140))
    add_sun("Bounce", 2.0, (-40, 15, 25))
    add_sun("Rim", 3.8, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def render_frame(filepath):
    bpy.context.scene.render.filepath = filepath
    bpy.ops.render.render(write_still=True)

def render_all_assets():
    registry = asset_registry.load_registry()
    factory = CharacterFactory(CANONICAL_BLEND)

    # -------------------------------------------------------------
    # 1. RENDER 8 BOTTOMS
    # -------------------------------------------------------------
    print("\n>>> Rendering 8 Bottoms...")
    for b_id, b_meta in registry["categories"]["BOTTOM"].items():
        factory.load_base()
        factory.isolate_materials(b_id)
        factory.apply_skin_tone("SKIN_02", b_id)
        factory.equip_hair("HAIR_001", "#1c1615", b_id)
        
        clothing_spec = {
            "top_id": "TOP_003",
            "bottom_id": b_id,
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_002"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", b_id)
        factory.setup_facial_system("Happy", b_id)

        scene = bpy.context.scene
        cam = setup_studio(scene, cam_loc=(0.25, 1.70, 0.38), cam_rot=(math.radians(88), 0, math.radians(172)))
        out_img = os.path.join(PREVIEWS_DIR, f"preview_{b_id.lower()}.png")
        render_frame(out_img)
        print(f"  Rendered: {out_img}")

    # -------------------------------------------------------------
    # 2. RENDER 8 TOPS
    # -------------------------------------------------------------
    print("\n>>> Rendering 8 Tops...")
    for t_id, t_meta in registry["categories"]["TOP"].items():
        factory.load_base()
        factory.isolate_materials(t_id)
        factory.apply_skin_tone("SKIN_02", t_id)
        factory.equip_hair("HAIR_002", "#161b26", t_id)
        
        clothing_spec = {
            "top_id": t_id,
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", t_id)
        factory.setup_facial_system("Happy", t_id)

        scene = bpy.context.scene
        cam = setup_studio(scene, cam_loc=(0.20, 1.75, 0.42), cam_rot=(math.radians(88), 0, math.radians(174)))
        out_img = os.path.join(PREVIEWS_DIR, f"preview_{t_id.lower()}.png")
        render_frame(out_img)
        print(f"  Rendered: {out_img}")

    # -------------------------------------------------------------
    # 3. RENDER 12 PRESETS
    # -------------------------------------------------------------
    print("\n>>> Rendering 12 Presets...")
    for pid, pdata in registry["categories"]["OUTFIT_PRESETS"].items():
        factory.load_base()
        factory.isolate_materials(pid)
        skin_id = pdata.get("recommended_skin", "SKIN_02")
        factory.apply_skin_tone(skin_id, pid)
        skin_hex = registry["categories"]["SKIN"][skin_id]["hex"]
        
        hair_styles = ["HAIR_001", "HAIR_002", "HAIR_003"]
        h_idx = int(pid.split("_")[1]) % 3
        factory.equip_hair(hair_styles[h_idx], "#1c1615", pid)

        clothing_spec = {
            "top_id": pdata["top_id"],
            "bottom_id": pdata["bottom_id"],
            "footwear_id": pdata["footwear_id"],
            "socks_id": pdata["socks_id"]
        }
        factory.equip_modular_clothing(clothing_spec, skin_hex, pid)
        factory.equip_accessories(pdata.get("accessories", []), pid)
        factory.setup_facial_system("Happy", pid)

        h_preset = pdata.get("recommended_height", "STANDARD")
        scale_val = registry["categories"]["HEIGHT"][h_preset]["scale"]
        if abs(scale_val - 1.0) > 0.001:
            factory.apply_height_scale(scale_val)

        scene = bpy.context.scene
        cam = setup_studio(scene, cam_loc=(0.30, 1.80, 0.40 * scale_val), cam_rot=(math.radians(88), 0, math.radians(170)))
        out_img = os.path.join(PREVIEWS_DIR, f"preview_{pid.lower()}.png")
        render_frame(out_img)
        print(f"  Rendered: {out_img}")

    # -------------------------------------------------------------
    # 4. RENDER 5 ANIMATION ACTIONS
    # -------------------------------------------------------------
    print("\n>>> Rendering 5 Animation Actions...")
    factory.load_base()
    factory.isolate_materials("anim_demo")
    factory.apply_skin_tone("SKIN_02", "anim_demo")
    factory.equip_hair("HAIR_003", "#2b1b17", "anim_demo")
    
    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_004",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_003"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "anim_demo")
    factory.equip_accessories(["ACC_001"], "anim_demo")
    factory.setup_facial_system("Happy", "anim_demo")

    actions_info = [
        ("Action_Walk", 15, "anim_walk.png", (0.35, 1.80, 0.40), (math.radians(88), 0, math.radians(170))),
        ("Action_Run", 12, "anim_run.png", (0.35, 1.80, 0.40), (math.radians(88), 0, math.radians(170))),
        ("Action_Sit", 20, "anim_sit.png", (0.30, 1.65, 0.32), (math.radians(88), 0, math.radians(170))),
        ("Action_Bow", 15, "anim_bow.png", (0.30, 1.70, 0.38), (math.radians(88), 0, math.radians(170))),
        ("Action_Talk", 10, "anim_talk.png", (0.25, 1.65, 0.42), (math.radians(88), 0, math.radians(172)))
    ]

    for act_name, frame_num, out_name, c_loc, c_rot in actions_info:
        act = bpy.data.actions.get(act_name)
        if act:
            factory.arm.animation_data_create()
            factory.arm.animation_data.action = act
            bpy.context.scene.frame_set(frame_num)
            bpy.context.view_layer.update()

            scene = bpy.context.scene
            setup_studio(scene, cam_loc=c_loc, cam_rot=c_rot)
            out_img = os.path.join(PREVIEWS_DIR, out_name)
            render_frame(out_img)
            print(f"  Rendered action {act_name}: {out_img}")

    # -------------------------------------------------------------
    # 5. RENDER 4 TURNAROUND VIEWS OF MODULAR OUTFIT
    # -------------------------------------------------------------
    print("\n>>> Rendering 4 Turnaround Views...")
    factory.load_base()
    factory.isolate_materials("turnaround_mod")
    factory.apply_skin_tone("SKIN_02", "turnaround_mod")
    factory.equip_hair("HAIR_001", "#1c1615", "turnaround_mod")
    
    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "turnaround_mod")
    factory.equip_accessories(["ACC_001", "ACC_004"], "turnaround_mod")
    factory.setup_facial_system("Happy", "turnaround_mod")

    turnaround_views = [
        ("mod_turn_front.png", (0.0, 1.85, 0.42), (math.radians(88), 0, math.radians(180))),
        ("mod_turn_side.png", (1.85, 0.0, 0.42), (math.radians(88), 0, math.radians(90))),
        ("mod_turn_three_quarter.png", (1.25, 1.25, 0.50), (math.radians(75), 0, math.radians(135))),
        ("mod_turn_back.png", (0.0, -1.85, 0.42), (math.radians(88), 0, 0))
    ]

    for fname, c_loc, c_rot in turnaround_views:
        scene = bpy.context.scene
        setup_studio(scene, cam_loc=c_loc, cam_rot=c_rot)
        out_img = os.path.join(PREVIEWS_DIR, fname)
        render_frame(out_img)
        print(f"  Rendered turnaround: {out_img}")

    print("\nAll 3D render frames completed successfully!")

if __name__ == "__main__":
    render_all_assets()
