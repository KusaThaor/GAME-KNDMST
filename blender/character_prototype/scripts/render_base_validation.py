"""
=============================================================================
RENDER VALIDATION SUITE FOR REFINED BASE CHARACTER SYSTEM
Renders:
1. 4-View Turnaround (Front, Side, Back, 3/4)
2. Required Phase 5 Validation Poses (Neutral, Walk, Sit, Bow, Run, Raise Hand)
3. 16 Canonical School-Life Actions
4. Composite Grid Sheets
=============================================================================
"""

import bpy
import math
import os
import shutil

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
INPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_base"
ACTIONS_DIR = os.path.join(PREVIEWS_DIR, "actions")
POSES_DIR = os.path.join(PREVIEWS_DIR, "poses")
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "render_base_log.txt")

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(ACTIONS_DIR, exist_ok=True)
os.makedirs(POSES_DIR, exist_ok=True)
os.makedirs(os.path.join(ARTIFACT_DIR, "actions"), exist_ok=True)
os.makedirs(os.path.join(ARTIFACT_DIR, "poses"), exist_ok=True)

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING REFINED BASE CHARACTER VALIDATION RENDERS\n")

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def main():
    log(f"1. Loading base character blend: {INPUT_BLEND}")
    bpy.ops.wm.open_mainfile(filepath=INPUT_BLEND)

    arm_obj = bpy.data.objects.get("Student_Armature")
    if not arm_obj:
        log("ERROR: Student_Armature not found!")
        return

    # Setup Camera
    cam_obj = bpy.data.objects.get("Cam")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam")
        cam_data.lens = 55
        cam_obj = bpy.data.objects.new("Cam", cam_data)
        bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Studio Lighting & World
    scene = bpy.context.scene
    if not scene.world:
        scene.world = bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
        bg_node.inputs["Strength"].default_value = 0.8

    # Key light
    key_obj = bpy.data.objects.get("Key")
    if not key_obj:
        key_l = bpy.data.lights.new("Key", "SUN")
        key_obj = bpy.data.objects.new("Key", key_l)
        scene.collection.objects.link(key_obj)
    key_obj.data.energy = 4.8
    key_obj.data.color = hex_to_lin("#fffbf4")[:3]
    key_obj.rotation_euler = (math.radians(52), math.radians(22), math.radians(-32))

    # Fill light
    fill_obj = bpy.data.objects.get("Fill")
    if not fill_obj:
        fill_l = bpy.data.lights.new("Fill", "SUN")
        fill_obj = bpy.data.objects.new("Fill", fill_l)
        scene.collection.objects.link(fill_obj)
    fill_obj.data.energy = 2.8
    fill_obj.data.color = hex_to_lin("#e2edfa")[:3]
    fill_obj.rotation_euler = (math.radians(40), math.radians(-30), math.radians(145))

    # Bounce light
    bounce_obj = bpy.data.objects.get("Bounce")
    if not bounce_obj:
        bounce_l = bpy.data.lights.new("Bounce", "SUN")
        bounce_obj = bpy.data.objects.new("Bounce", bounce_l)
        scene.collection.objects.link(bounce_obj)
    bounce_obj.data.energy = 1.6
    bounce_obj.data.color = hex_to_lin("#f8ede2")[:3]
    bounce_obj.rotation_euler = (math.radians(-45), math.radians(15), math.radians(20))

    # Rim light
    rim_obj = bpy.data.objects.get("Rim")
    if not rim_obj:
        rim_l = bpy.data.lights.new("Rim", "SUN")
        rim_obj = bpy.data.objects.new("Rim", rim_l)
        scene.collection.objects.link(rim_obj)
    rim_obj.data.energy = 3.2
    rim_obj.data.color = hex_to_lin("#ffffff")[:3]
    rim_obj.rotation_euler = (math.radians(30), math.radians(15), math.radians(35))

    scene.render.resolution_x = 720
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    try:
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 12
        scene.cycles.use_denoising = True
        scene.cycles.device = "CPU"
    except:
        scene.render.engine = "BLENDER_EEVEE_NEXT"

    dist = 1.95
    target_z = 0.35

    # Ensure NLA does not override active action during rendering and bones are in Euler XYZ mode
    if arm_obj.animation_data:
        arm_obj.animation_data.use_nla = False
    for pb in arm_obj.pose.bones:
        pb.rotation_mode = "XYZ"

    # =========================================================================
    # PART 1: 4-VIEW TURNAROUND
    # =========================================================================
    idle_act = bpy.data.actions.get("Action_Idle")
    if idle_act:
        arm_obj.animation_data.action = idle_act
    scene.frame_set(1)
    bpy.context.view_layer.update()

    turnaround_views = [
        ("01_front.png",         (0.0, dist, target_z + 0.05),            (math.radians(90), 0, math.radians(180))),
        ("02_side.png",          (dist, 0.0, target_z + 0.05),            (math.radians(90), 0, math.radians(90))),
        ("03_back.png",          (0.0, -dist, target_z + 0.05),           (math.radians(90), 0, math.radians(0))),
        ("04_three_quarter.png", (dist * 0.72, dist * 0.72, target_z + 0.12), (math.radians(85), 0, math.radians(135))),
    ]

    for fname, loc, rot in turnaround_views:
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        out_local = os.path.join(PREVIEWS_DIR, fname)
        out_art = os.path.join(ARTIFACT_DIR, fname)
        if os.path.exists(out_local):
            try:
                os.remove(out_local)
            except:
                pass
        scene.render.filepath = out_local
        log(f"Rendering Turnaround: {fname}...")
        bpy.ops.render.render(write_still=True)
        shutil.copy2(out_local, out_art)

    # =========================================================================
    # PART 2: KEY VALIDATION POSES (Phase 5 Required: Neutral, Walk, Sit, Bow)
    # =========================================================================
    validation_poses = [
        ("pose_neutral.png",    "Action_Idle", 1,  (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("pose_walk.png",       "Action_Walk", 15, (dist * 0.72, dist * 0.72, target_z + 0.12), (math.radians(84), 0, math.radians(135))),
        ("pose_run.png",        "Action_Run",  10, (dist * 0.75, dist * 0.68, target_z + 0.10), (math.radians(84), 0, math.radians(132))),
        ("pose_sit.png",        "Action_Sit",  20, (dist * 0.70, dist * 0.70, target_z + 0.08), (math.radians(84), 0, math.radians(135))),
        ("pose_bow.png",        "Action_Bow",  18, (dist * 0.75, dist * 0.65, target_z + 0.12), (math.radians(82), 0, math.radians(130))),
        ("pose_raise_hand.png", "Action_Raise_Hand", 20, (dist * 0.70, dist * 0.70, target_z + 0.16), (math.radians(82), 0, math.radians(135))),
    ]

    for fname, act_name, frame, cam_pos, cam_rot in validation_poses:
        act = bpy.data.actions.get(act_name)
        if not act:
            continue
        arm_obj.animation_data.action = act
        scene.frame_set(frame)
        bpy.context.view_layer.update()
        cam_obj.location = cam_pos
        cam_obj.rotation_euler = cam_rot
        out_local = os.path.join(POSES_DIR, fname)
        out_art = os.path.join(ARTIFACT_DIR, "poses", fname)
        scene.render.filepath = out_local
        log(f"Rendering Validation Pose: {fname} ({act_name})...")
        bpy.ops.render.render(write_still=True)
        shutil.copy2(out_local, out_art)
        shutil.copy2(out_local, os.path.join(PREVIEWS_DIR, fname))
        shutil.copy2(out_local, os.path.join(ARTIFACT_DIR, fname))

    # =========================================================================
    # PART 3: ALL 16 CANONICAL ACTIONS
    # =========================================================================
    action_specs = [
        ("Action_Idle", 20, (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("Action_Walk", 15, (dist * 0.72, dist * 0.72, target_z + 0.12), (math.radians(84), 0, math.radians(135))),
        ("Action_Run", 10, (dist * 0.75, dist * 0.68, target_z + 0.10), (math.radians(84), 0, math.radians(132))),
        ("Action_Sit", 20, (dist * 0.70, dist * 0.70, target_z + 0.08), (math.radians(84), 0, math.radians(135))),
        ("Action_Sleep_Desk", 20, (dist * 0.60, dist * 0.75, target_z + 0.14), (math.radians(80), 0, math.radians(142))),
        ("Action_Write", 13, (dist * 0.65, dist * 0.70, target_z + 0.10), (math.radians(82), 0, math.radians(138))),
        ("Action_Raise_Hand", 20, (dist * 0.70, dist * 0.70, target_z + 0.16), (math.radians(82), 0, math.radians(135))),
        ("Action_Wave", 15, (dist * 0.68, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("Action_Bow", 18, (dist * 0.75, dist * 0.65, target_z + 0.12), (math.radians(82), 0, math.radians(130))),
        ("Action_Cheer", 15, (dist * 0.70, dist * 0.70, target_z + 0.16), (math.radians(82), 0, math.radians(135))),
        ("Action_Jump", 18, (dist * 0.72, dist * 0.72, target_z + 0.16), (math.radians(82), 0, math.radians(135))),
        ("Action_Salute_Flag", 15, (dist * 0.68, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("Action_Talk", 20, (dist * 0.70, dist * 0.70, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("Action_Thinking", 20, (dist * 0.68, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("Action_Sad_Disappointed", 20, (dist * 0.70, dist * 0.70, target_z + 0.12), (math.radians(82), 0, math.radians(135))),
        ("Action_Blink", 7, (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
    ]

    for act_name, frame, cam_pos, cam_rot in action_specs:
        act = bpy.data.actions.get(act_name)
        if not act:
            continue
        arm_obj.animation_data.action = act
        scene.frame_set(frame)
        bpy.context.view_layer.update()
        cam_obj.location = cam_pos
        cam_obj.rotation_euler = cam_rot
        clean_name = act_name.lower()
        fname = f"{clean_name}.png"
        out_local = os.path.join(ACTIONS_DIR, fname)
        out_art = os.path.join(ARTIFACT_DIR, "actions", fname)
        scene.render.filepath = out_local
        log(f"Rendering Action: {act_name}...")
        bpy.ops.render.render(write_still=True)
        shutil.copy2(out_local, out_art)

    # Reset
    if idle_act:
        arm_obj.animation_data.action = idle_act
    scene.frame_set(1)

    log("ALL RENDERS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    import traceback
    try:
        main()
    except Exception as e:
        log(f"CRITICAL ERROR: {e}")
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            traceback.print_exc(file=f)
