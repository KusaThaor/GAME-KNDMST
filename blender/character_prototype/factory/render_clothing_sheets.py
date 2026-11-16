"""
=============================================================================
CLOTHING LIBRARY V2 — COMPARISON SHEETS RENDERER & COMPOSITOR
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life 3D Narrative Game

Generates 5 High-Quality Comparison Sheets:
1. bottom_library_comparison_sheet.png (BOTTOM_001 to BOTTOM_008)
2. top_library_comparison_sheet.png (TOP_001 to TOP_008)
3. outfit_combination_sheet.png (PRESET_001 to PRESET_012)
4. animation_clothing_test_sheet.png (Walk, Run, Sit, Bow, Talk)
5. turnaround_modular_sheet.png (Front, Side, 3/4, Back)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
CANONICAL_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
SHEETS_DIR = os.path.join(FACTORY_DIR, "previews", "sheets")

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(SHEETS_DIR, exist_ok=True)

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
        
        # Equip target bottom with neutral top (TOP_003) and sneakers
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
        
        # Equip target top with standard trousers and sneakers
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
        
        # Cycle hairstyle
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

        # Scale if recommended
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
    
    # Skirt outfit for deformation audit
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
    
    # Complete outfit with backpack & scarf
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

def build_composite_sheets():
    print("\n>>> Assembling Composite Sheets using PIL...")
    registry = asset_registry.load_registry()

    try:
        font_title = ImageFont.truetype("arial.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_label = ImageFont.truetype("arial.ttf", 18)
        font_desc = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        font_title = font_sub = font_label = font_desc = ImageFont.load_default()

    # -------------------------------------------------------------
    # SHEET 1: BOTTOM LIBRARY COMPARISON (4x2 Grid)
    # -------------------------------------------------------------
    print("  Creating bottom_library_comparison_sheet.png...")
    b_items = list(registry["categories"]["BOTTOM"].items())
    cols, rows = 4, 2
    cell_w, cell_h = 360, 480
    pad_top = 80
    pad_cell_bottom = 60
    sheet_w = cols * cell_w
    sheet_h = pad_top + rows * (cell_h + pad_cell_bottom)

    canvas1 = Image.new("RGB", (sheet_w, sheet_h), (18, 20, 24))
    draw1 = ImageDraw.Draw(canvas1)
    draw1.text((sheet_w // 2, 30), "BOTTOM CLOTHING LIBRARY V2 — PROCEDURAL MESH AUDIT", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw1.text((sheet_w // 2, 58), "8 Canonical School & Casual Bottoms (Quần tây, Soóc, Chân váy xếp ly, Chữ A, Denim, PE, Váy yếm)", fill=(160, 170, 185), font=font_sub, anchor="mm")

    for idx, (b_id, b_meta) in enumerate(b_items):
        c = idx % cols
        r = idx // cols
        x = c * cell_w
        y = pad_top + r * (cell_h + pad_cell_bottom)

        img_path = os.path.join(PREVIEWS_DIR, f"preview_{b_id.lower()}.png")
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h))
            canvas1.paste(img, (x, y))

        # Labels
        label_y = y + cell_h + 16
        draw1.text((x + cell_w // 2, label_y), f"{b_id} — {b_meta['vietnamese_name']}", fill=(240, 240, 245), font=font_label, anchor="mm")
        draw1.text((x + cell_w // 2, label_y + 22), b_meta['name'], fill=(150, 160, 175), font=font_desc, anchor="mm")

    out_sheet1 = os.path.join(SHEETS_DIR, "bottom_library_comparison_sheet.png")
    canvas1.save(out_sheet1, quality=95)
    print(f"  Saved: {out_sheet1}")

    # -------------------------------------------------------------
    # SHEET 2: TOP LIBRARY COMPARISON (4x2 Grid)
    # -------------------------------------------------------------
    print("  Creating top_library_comparison_sheet.png...")
    t_items = list(registry["categories"]["TOP"].items())
    canvas2 = Image.new("RGB", (sheet_w, sheet_h), (18, 20, 24))
    draw2 = ImageDraw.Draw(canvas2)
    draw2.text((sheet_w // 2, 30), "TOP CLOTHING LIBRARY V2 — PROCEDURAL MESH AUDIT", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw2.text((sheet_w // 2, 58), "8 Canonical School & Casual Tops (Sơ mi, PE, Thun cổ tròn, Polo, Cổ sen, Cardigan, Áo dài tay, Áo gió)", fill=(160, 170, 185), font=font_sub, anchor="mm")

    for idx, (t_id, t_meta) in enumerate(t_items):
        c = idx % cols
        r = idx // cols
        x = c * cell_w
        y = pad_top + r * (cell_h + pad_cell_bottom)

        img_path = os.path.join(PREVIEWS_DIR, f"preview_{t_id.lower()}.png")
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h))
            canvas2.paste(img, (x, y))

        label_y = y + cell_h + 16
        draw2.text((x + cell_w // 2, label_y), f"{t_id} — {t_meta['vietnamese_name']}", fill=(240, 240, 245), font=font_label, anchor="mm")
        draw2.text((x + cell_w // 2, label_y + 22), t_meta['name'], fill=(150, 160, 175), font=font_desc, anchor="mm")

    out_sheet2 = os.path.join(SHEETS_DIR, "top_library_comparison_sheet.png")
    canvas2.save(out_sheet2, quality=95)
    print(f"  Saved: {out_sheet2}")

    # -------------------------------------------------------------
    # SHEET 3: OUTFIT PRESETS COMBINATION (4x3 Grid)
    # -------------------------------------------------------------
    print("  Creating outfit_combination_sheet.png...")
    p_items = list(registry["categories"]["OUTFIT_PRESETS"].items())
    p_cols, p_rows = 4, 3
    p_sheet_w = p_cols * cell_w
    p_sheet_h = pad_top + p_rows * (cell_h + pad_cell_bottom)

    canvas3 = Image.new("RGB", (p_sheet_w, p_sheet_h), (18, 20, 24))
    draw3 = ImageDraw.Draw(canvas3)
    draw3.text((p_sheet_w // 2, 30), "MODULAR OUTFIT PRESETS — 12 CANONICAL COMBINATIONS", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw3.text((p_sheet_w // 2, 58), "Cozy Vietnamese School-Life (2012-2013) Combinations across Heights, Tops, Bottoms, Footwear & Socks", fill=(160, 170, 185), font=font_sub, anchor="mm")

    for idx, (pid, pdata) in enumerate(p_items):
        c = idx % p_cols
        r = idx // p_cols
        x = c * cell_w
        y = pad_top + r * (cell_h + pad_cell_bottom)

        img_path = os.path.join(PREVIEWS_DIR, f"preview_{pid.lower()}.png")
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h))
            canvas3.paste(img, (x, y))

        label_y = y + cell_h + 16
        draw3.text((x + cell_w // 2, label_y), f"{pid}: {pdata['name']}", fill=(240, 240, 245), font=font_label, anchor="mm")
        comp_str = f"{pdata['top_id']} + {pdata['bottom_id']} + {pdata['footwear_id']}"
        draw3.text((x + cell_w // 2, label_y + 22), comp_str, fill=(150, 160, 175), font=font_desc, anchor="mm")

    out_sheet3 = os.path.join(SHEETS_DIR, "outfit_combination_sheet.png")
    canvas3.save(out_sheet3, quality=95)
    print(f"  Saved: {out_sheet3}")

    # -------------------------------------------------------------
    # SHEET 4: ANIMATION DEFORMATION TEST (5 Columns)
    # -------------------------------------------------------------
    print("  Creating animation_clothing_test_sheet.png...")
    anim_files = [
        ("anim_walk.png", "Action_Walk (Đi dạo)", "Dual-thigh skirt blending"),
        ("anim_run.png", "Action_Run (Chạy thể thao)", "Zero clipping during stride"),
        ("anim_sit.png", "Action_Sit (Ngồi học bàn)", "Natural hip & skirt curvature"),
        ("anim_bow.png", "Action_Bow (Cúi chào thầy cô)", "Clean spine & torso bend"),
        ("anim_talk.png", "Action_Talk (Trò chuyện)", "Upper body gestures stable")
    ]
    a_cols = 5
    a_cell_w, a_cell_h = 320, 480
    a_sheet_w = a_cols * a_cell_w
    a_sheet_h = pad_top + a_cell_h + pad_cell_bottom

    canvas4 = Image.new("RGB", (a_sheet_w, a_sheet_h), (18, 20, 24))
    draw4 = ImageDraw.Draw(canvas4)
    draw4.text((a_sheet_w // 2, 30), "ANIMATION DEFORMATION & CLOTHING AUDIT — KEY CANONICAL ACTIONS", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw4.text((a_sheet_w // 2, 58), "Rig skinning verified under Walk, Run, Sit, Bow, Talk on 20-bone Student_Armature", fill=(160, 170, 185), font=font_sub, anchor="mm")

    for i, (fn, label, sublabel) in enumerate(anim_files):
        x = i * a_cell_w
        y = pad_top
        img_path = os.path.join(PREVIEWS_DIR, fn)
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((a_cell_w, a_cell_h))
            canvas4.paste(img, (x, y))

        label_y = y + a_cell_h + 16
        draw4.text((x + a_cell_w // 2, label_y), label, fill=(240, 240, 245), font=font_label, anchor="mm")
        draw4.text((x + a_cell_w // 2, label_y + 22), sublabel, fill=(150, 160, 175), font=font_desc, anchor="mm")

    out_sheet4 = os.path.join(SHEETS_DIR, "animation_clothing_test_sheet.png")
    canvas4.save(out_sheet4, quality=95)
    print(f"  Saved: {out_sheet4}")

    # -------------------------------------------------------------
    # SHEET 5: TURNAROUND MODULAR SHEET (4 Columns)
    # -------------------------------------------------------------
    print("  Creating turnaround_modular_sheet.png...")
    turn_files = [
        ("mod_turn_front.png", "Front (Mặt Trước)", "Sơ mi trắng, khăn quàng, thắt lưng"),
        ("mod_turn_side.png", "Side (Góc Nghiêng)", "Form dáng chibi mềm mại, quai cặp"),
        ("mod_turn_three_quarter.png", "3/4 View (Phối Cảnh)", "Tỷ lệ chuẩn 1:1 trong Three.js"),
        ("mod_turn_back.png", "Back (Mặt Sau)", "Cặp sách THCS đeo lưng gọn gàng")
    ]
    t_cols = 4
    t_sheet_w = t_cols * cell_w
    t_sheet_h = pad_top + cell_h + pad_cell_bottom

    canvas5 = Image.new("RGB", (t_sheet_w, t_sheet_h), (18, 20, 24))
    draw5 = ImageDraw.Draw(canvas5)
    draw5.text((t_sheet_w // 2, 30), "MODULAR CHARACTER TURNAROUND SHEET — 360° INSPECTION", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw5.text((t_sheet_w // 2, 58), "Standard Vietnamese School Uniform (TOP_001 + BOTTOM_001 + FOOTWEAR_001 + SOCKS_001 + ACC_001 + ACC_004)", fill=(160, 170, 185), font=font_sub, anchor="mm")

    for i, (fn, label, sublabel) in enumerate(turn_files):
        x = i * cell_w
        y = pad_top
        img_path = os.path.join(PREVIEWS_DIR, fn)
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h))
            canvas5.paste(img, (x, y))

        label_y = y + cell_h + 16
        draw5.text((x + cell_w // 2, label_y), label, fill=(240, 240, 245), font=font_label, anchor="mm")
        draw5.text((x + cell_w // 2, label_y + 22), sublabel, fill=(150, 160, 175), font=font_desc, anchor="mm")

    out_sheet5 = os.path.join(SHEETS_DIR, "turnaround_modular_sheet.png")
    canvas5.save(out_sheet5, quality=95)
    print(f"  Saved: {out_sheet5}")

    print("\nALL 5 COMPARISON SHEETS CREATED SUCCESSFULLY!")

if __name__ == "__main__":
    render_all_assets()
    build_composite_sheets()
