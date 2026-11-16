import bpy
import bmesh
import math
import os
import sys

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
SCENES_DIR = os.path.join(FACTORY_DIR, "generated_scenes")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets", "characters")

os.makedirs(PREVIEWS_DIR, exist_ok=True)

def setup_studio(scene, cam_loc=(0.0, 1.85, 0.45), cam_rot=(math.radians(88), 0, math.radians(180)), res=(720, 900)):
    # Camera
    cam_data = bpy.data.cameras.new("Factory_Cam")
    cam_data.lens = 52
    cam_obj = bpy.data.objects.new("Factory_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = cam_rot

    # World
    scene.world = bpy.data.worlds.new("Factory_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.07, 0.08, 0.10, 1.0)
        bg.inputs["Strength"].default_value = 0.9

    # 4-Point Lights
    def add_sun(name, energy, rot_deg):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj

    add_sun("Key", 5.0, (50, 20, -35))
    add_sun("Fill", 2.8, (38, -25, 140))
    add_sun("Bounce", 1.8, (-40, 15, 25))
    add_sun("Rim", 3.5, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def render_character_views(char_id, blend_path):
    print(f"[Render] Rendering turnaround views for {char_id}...")
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    scene = bpy.context.scene
    cam_obj = setup_studio(scene, res=(640, 800))

    # Turnaround views
    views = [
        (f"{char_id}_front.png", (0.0, 1.85, 0.45), (math.radians(88), 0, math.radians(180))),
        (f"{char_id}_side.png", (1.85, 0.0, 0.45), (math.radians(88), 0, math.radians(90))),
        (f"{char_id}_back.png", (0.0, -1.85, 0.45), (math.radians(88), 0, 0)),
        (f"{char_id}_three_quarter.png", (1.25, 1.25, 0.55), (math.radians(75), 0, math.radians(135)))
    ]

    for fname, loc, rot in views:
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        scene.render.filepath = os.path.join(PREVIEWS_DIR, fname)
        bpy.ops.render.render(write_still=True)
        print(f"  Saved: {fname}")

def render_multi_character_lineup():
    print("[Render] Creating Multi-Character Comparison Lineup...")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    cam_obj = setup_studio(scene, cam_loc=(0.0, 2.70, 0.45), res=(1280, 720))

    # Import Character A, B, C GLBs side by side
    chars = [
        ("character_a.glb", -0.45),
        ("character_b.glb", 0.0),
        ("character_c.glb", 0.48)
    ]

    for glb_name, x_pos in chars:
        glb_path = os.path.join(ASSETS_DIR, glb_name)
        before_objs = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=glb_path)
        new_objs = set(bpy.data.objects) - before_objs
        for o in new_objs:
            if o.parent is None:
                o.location.x += x_pos

    scene.render.filepath = os.path.join(PREVIEWS_DIR, "character_factory_lineup.png")
    bpy.ops.render.render(write_still=True)
    print(f"  Saved: character_factory_lineup.png")

def render_action_demonstrations():
    print("[Render] Rendering representative action tests on Character B...")
    blend_path = os.path.join(SCENES_DIR, "character_b.blend")
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    scene = bpy.context.scene
    cam_obj = setup_studio(scene, cam_loc=(1.25, 1.25, 0.55), cam_rot=(math.radians(75), 0, math.radians(135)), res=(640, 800))
    arm = bpy.data.objects.get("Student_Armature")

    actions_to_render = [
        ("Action_Idle", 20, "action_idle.png"),
        ("Action_Walk", 15, "action_walk.png"),
        ("Action_Sit", 20, "action_sit.png"),
        ("Action_Bow", 18, "action_bow.png"),
        ("Action_Talk", 20, "action_talk.png")
    ]

    if arm and arm.animation_data:
        for act_name, frame, out_name in actions_to_render:
            act = bpy.data.actions.get(act_name)
            if act:
                arm.animation_data.action = act
                scene.frame_set(frame)
                bpy.context.view_layer.update()
                scene.render.filepath = os.path.join(PREVIEWS_DIR, out_name)
                bpy.ops.render.render(write_still=True)
                print(f"  Rendered action: {out_name}")

def render_facial_expression_sheet():
    print("[Render] Rendering Facial Expression Variations...")
    blend_path = os.path.join(SCENES_DIR, "character_a.blend")
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    scene = bpy.context.scene
    # Zoom in close on face
    cam_obj = setup_studio(scene, cam_loc=(0.0, 0.65, 0.50), cam_rot=(math.radians(88), 0, math.radians(180)), res=(480, 480))
    
    mouth = bpy.data.objects.get("Mouth")
    eb_l = bpy.data.objects.get("Eyebrow_L")
    eb_r = bpy.data.objects.get("Eyebrow_R")

    expressions = [
        ("expr_neutral.png", {}),
        ("expr_happy.png", {"Mouth_Smile": 1.0, "Eyebrow_Raise": 0.4}),
        ("expr_sad.png", {"Mouth_Sad": 1.0, "Eyebrow_Sad": 0.8}),
        ("expr_surprised.png", {"Mouth_O": 1.0, "Mouth_Open": 0.5, "Eyebrow_Raise": 1.0}),
        ("expr_talking.png", {"Mouth_Open": 0.8, "Mouth_O": 0.3})
    ]

    for fname, morphs in expressions:
        # Reset all shape keys
        if mouth and mouth.data.shape_keys:
            for kb in mouth.data.shape_keys.key_blocks:
                if kb.name != "Basis": kb.value = 0.0
        for eb in [eb_l, eb_r]:
            if eb and eb.data.shape_keys:
                for kb in eb.data.shape_keys.key_blocks:
                    if kb.name != "Basis": kb.value = 0.0

        # Apply specific morphs
        for m_name, val in morphs.items():
            if mouth and mouth.data.shape_keys and m_name in mouth.data.shape_keys.key_blocks:
                mouth.data.shape_keys.key_blocks[m_name].value = val
            for eb in [eb_l, eb_r]:
                if eb and eb.data.shape_keys and m_name in eb.data.shape_keys.key_blocks:
                    eb.data.shape_keys.key_blocks[m_name].value = val

        bpy.context.view_layer.update()
        scene.render.filepath = os.path.join(PREVIEWS_DIR, fname)
        bpy.ops.render.render(write_still=True)
        print(f"  Rendered expression: {fname}")

if __name__ == "__main__":
    for c_id in ["character_a", "character_b", "character_c"]:
        b_path = os.path.join(SCENES_DIR, f"{c_id}.blend")
        if os.path.exists(b_path):
            render_character_views(c_id, b_path)

    render_multi_character_lineup()
    render_action_demonstrations()
    render_facial_expression_sheet()
    print("\nALL FACTORY PREVIEWS AND DEMONSTRATIONS RENDERED SUCCESSFULLY!")
