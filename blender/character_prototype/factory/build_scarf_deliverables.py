"""
=============================================================================
TASK 01 — VIETNAMESE RED SCARF PRODUCTION GENERATOR
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life 3D Narrative Game (2012-2013)

Generates:
1. student_uniform_scarf.blend (Blender Source)
2. student_uniform_scarf.glb (Exported Runtime GLB)
3. 4 Turnaround Angles (Front, 3/4, Side, Back)
4. 5 Animation Action Frames (Walk, Run, Sit, Bow, Talk)
5. Before/After Render Frames
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
SCENES_DIR = os.path.join(FACTORY_DIR, "generated_scenes")

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(SCENES_DIR, exist_ok=True)

if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

from character_factory import CharacterFactory
import clothing_library
import asset_registry

def setup_studio(scene, cam_loc=(0.0, 1.65, 0.38), cam_rot=(math.radians(88), 0, math.radians(180)), res=(480, 580)):
    # Clean previous cameras & lights
    for o in list(scene.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            scene.collection.objects.unlink(o)
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Scarf_Studio_Cam")
    cam_data.lens = 50
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

    add_sun("Key", 5.2, (52, 18, -35))
    add_sun("Fill", 3.0, (38, -25, 140))
    add_sun("ChinBounce", 3.6, (-60, 10, 15))
    add_sun("BackSun", 4.2, (45, 0, -180))
    add_sun("Rim", 4.0, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def build_production_assets():
    print("=================================================================")
    print("BUILDING PRODUCTION ASSETS FOR VIETNAMESE RED SCARF V3")
    print("=================================================================")

    # 1. BUILD CANONICAL SCHOOL UNIFORM WITH SCARF (BLEND & GLB)
    factory = CharacterFactory(CANONICAL_BLEND)
    cfg = {
        "character_id": "student_uniform_scarf",
        "height_scale": 1.0,
        "skin_tone": "SKIN_02",
        "hair_style": "HAIR_001",
        "hair_color": "#1c1615",
        "outfit_preset": "PRESET_001",
        "accessories": ["ACC_001"],
        "default_expression": "Happy"
    }

    out_blend = os.path.join(SCENES_DIR, "student_uniform_scarf.blend")
    out_glb = os.path.join(FACTORY_DIR, "student_uniform_scarf.glb")

    res = factory.build_character(cfg, out_glb, out_blend)
    print(f"Saved Blend: {out_blend}")
    print(f"Exported GLB: {out_glb} ({res['glb_size_bytes']/1024:.1f} KB)")

    # 2. RENDER AFTER FRONT (FOR BEFORE/AFTER COMPARISON)
    scene = bpy.context.scene
    setup_studio(scene, cam_loc=(0.30, 1.80, 0.40), cam_rot=(math.radians(88), 0, math.radians(170)), res=(380, 500))
    out_after = os.path.join(PREVIEWS_DIR, "scarf_after_front.png")
    scene.render.filepath = out_after
    bpy.ops.render.render(write_still=True)
    print(f"Rendered After Front: {out_after}")

    # Also update preview_preset_001.png
    scene.render.filepath = os.path.join(PREVIEWS_DIR, "preview_preset_001.png")
    bpy.ops.render.render(write_still=True)

    # 3. RENDER 4 TURNAROUND ANGLES (FULL BODY & SCARF FOCUS)
    turnaround_angles = [
        ("scarf_turn_front.png", (0.0, 1.55, 0.38), (math.radians(88), 0, math.radians(180))),
        ("scarf_turn_3quarter.png", (1.10, 1.10, 0.44), (math.radians(78), 0, math.radians(135))),
        ("scarf_turn_side.png", (1.55, 0.0, 0.38), (math.radians(88), 0, math.radians(90))),
        ("scarf_turn_back.png", (0.0, -1.55, 0.38), (math.radians(88), 0, 0)),
    ]

    for fname, cloc, crot in turnaround_angles:
        setup_studio(scene, cloc, crot, res=(420, 540))
        out_img = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_img
        bpy.ops.render.render(write_still=True)
        print(f"Rendered Turnaround: {out_img}")

    # 4. RENDER 5 ANIMATION ACTIONS
    anim_actions = [
        ("Action_Walk", 15, "scarf_action_walk.png", (0.30, 1.65, 0.38), (math.radians(88), 0, math.radians(170))),
        ("Action_Run",  12, "scarf_action_run.png",  (0.30, 1.65, 0.38), (math.radians(88), 0, math.radians(170))),
        ("Action_Sit",  20, "scarf_action_sit.png",  (0.28, 1.55, 0.32), (math.radians(88), 0, math.radians(170))),
        ("Action_Bow",  15, "scarf_action_bow.png",  (0.28, 1.55, 0.36), (math.radians(88), 0, math.radians(170))),
        ("Action_Talk", 10, "scarf_action_talk.png", (0.22, 1.50, 0.40), (math.radians(88), 0, math.radians(172))),
    ]

    for act_name, frame_num, out_name, c_loc, c_rot in anim_actions:
        act = bpy.data.actions.get(act_name)
        if act:
            factory.arm.animation_data_create()
            factory.arm.animation_data.action = act
            bpy.context.scene.frame_set(frame_num)
            bpy.context.view_layer.update()

            setup_studio(scene, cam_loc=c_loc, cam_rot=c_rot, res=(380, 500))
            out_img = os.path.join(PREVIEWS_DIR, out_name)
            scene.render.filepath = out_img
            bpy.ops.render.render(write_still=True)
            print(f"Rendered Action {act_name}: {out_img}")

    # 5. RE-RENDER PRESET 002 (PLEATED SKIRT + SCARF) & PRESET 012 (RAINY UNIFORM + SCARF)
    # PRESET_002
    p002_cfg = {
        "character_id": "preset_002_updated",
        "height_scale": 1.0,
        "skin_tone": "SKIN_02",
        "hair_style": "HAIR_002",
        "hair_color": "#1c1615",
        "outfit_preset": "PRESET_002",
        "accessories": ["ACC_001"],
        "default_expression": "Happy"
    }
    factory.build_character(p002_cfg, None, None)
    setup_studio(scene, cam_loc=(0.30, 1.80, 0.40), cam_rot=(math.radians(88), 0, math.radians(170)), res=(380, 500))
    scene.render.filepath = os.path.join(PREVIEWS_DIR, "preview_preset_002.png")
    bpy.ops.render.render(write_still=True)
    print("Re-rendered preview_preset_002.png")

    # PRESET_012
    p012_cfg = {
        "character_id": "preset_012_updated",
        "height_scale": 0.90,
        "skin_tone": "SKIN_03",
        "hair_style": "HAIR_001",
        "hair_color": "#1c1615",
        "outfit_preset": "PRESET_012",
        "accessories": ["ACC_001"],
        "default_expression": "Happy"
    }
    factory.build_character(p012_cfg, None, None)
    setup_studio(scene, cam_loc=(0.30, 1.80, 0.40 * 0.9), cam_rot=(math.radians(88), 0, math.radians(170)), res=(380, 500))
    scene.render.filepath = os.path.join(PREVIEWS_DIR, "preview_preset_012.png")
    bpy.ops.render.render(write_still=True)
    print("Re-rendered preview_preset_012.png")

    print("\nAll production render frames and assets completed successfully!")

if __name__ == "__main__":
    build_production_assets()
