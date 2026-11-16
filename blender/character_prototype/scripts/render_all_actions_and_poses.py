"""
=============================================================================
RENDER ALL 16 ACTIONS + 6 DEFORMATION POSES FOR VIETNAMESE STUDENT CHIBI
Renders high-res test frames for all actions and poses from the user's .blend
Creates composite contact sheets and updates artifact previews.
=============================================================================
"""

import bpy
import math
import os
import shutil

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
INPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_skinned.blend")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_skinned")
ACTIONS_DIR = os.path.join(PREVIEWS_DIR, "actions")
POSES_DIR = os.path.join(PREVIEWS_DIR, "poses")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_skinned"
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "render_all_log.txt")

os.makedirs(ACTIONS_DIR, exist_ok=True)
os.makedirs(POSES_DIR, exist_ok=True)
os.makedirs(os.path.join(ARTIFACT_DIR, "actions"), exist_ok=True)
os.makedirs(os.path.join(ARTIFACT_DIR, "poses"), exist_ok=True)

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING RENDER OF ALL 16 ACTIONS AND 6 POSES (ENHANCED)\n")

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def reset_pose_bones(pb):
    for b in pb:
        b.location = (0, 0, 0)
        b.rotation_euler = (0, 0, 0)
        b.rotation_quaternion = (1, 0, 0, 0)
        b.scale = (1, 1, 1)

def build_deform_poses_action(arm_obj):
    """Build a dedicated animation action containing all 6 deformation poses on frames 1..6"""
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm_obj.pose.bones

    act = bpy.data.actions.new("Action_Deform_Poses_Test")
    arm_obj.animation_data.action = act

    # Helper to insert keyframes for bone
    def key_bone(bname, loc=None, rot_euler=None, frame=1):
        b = pb.get(bname)
        if not b:
            return
        if loc is not None:
            b.location = loc
            b.keyframe_insert("location", frame=frame)
        if rot_euler is not None:
            b.rotation_euler = rot_euler
            b.keyframe_insert("rotation_euler", frame=frame)

    # Frame 1: Pose_01_Neutral
    reset_pose_bones(pb)
    key_bone("UpperArm.L", rot_euler=(0, 0, math.radians(-8)), frame=1)
    key_bone("Forearm.L",  rot_euler=(math.radians(12), 0, math.radians(6)), frame=1)
    key_bone("UpperArm.R", rot_euler=(0, 0, math.radians(8)), frame=1)
    key_bone("Forearm.R",  rot_euler=(math.radians(12), 0, math.radians(-6)), frame=1)
    key_bone("Spine",      rot_euler=(0, 0, 0), frame=1)
    key_bone("Chest",      rot_euler=(0, 0, 0), frame=1)
    key_bone("Thigh.L",    rot_euler=(0, 0, 0), frame=1)
    key_bone("Shin.L",     rot_euler=(0, 0, 0), frame=1)
    key_bone("Thigh.R",    rot_euler=(0, 0, 0), frame=1)
    key_bone("Shin.R",     rot_euler=(0, 0, 0), frame=1)
    key_bone("Hips",       loc=(0, 0, 0), frame=1)

    # Frame 2: Pose_02_Walk
    reset_pose_bones(pb)
    key_bone("Hips",       loc=(0, 0, 0.012), frame=2)
    key_bone("Spine",      rot_euler=(math.radians(-3), 0, 0), frame=2)
    key_bone("Chest",      rot_euler=(math.radians(-2), 0, 0), frame=2)
    key_bone("Thigh.L",    rot_euler=(math.radians(24), 0, 0), frame=2)
    key_bone("Shin.L",     rot_euler=(0, 0, 0), frame=2)
    key_bone("Thigh.R",    rot_euler=(math.radians(-22), 0, 0), frame=2)
    key_bone("Shin.R",     rot_euler=(math.radians(-15), 0, 0), frame=2)
    key_bone("UpperArm.L", rot_euler=(math.radians(-20), 0, math.radians(-6)), frame=2)
    key_bone("Forearm.L",  rot_euler=(math.radians(25), 0, math.radians(6)), frame=2)
    key_bone("UpperArm.R", rot_euler=(math.radians(20), 0, math.radians(6)), frame=2)
    key_bone("Forearm.R",  rot_euler=(math.radians(25), 0, math.radians(-6)), frame=2)

    # Frame 3: Pose_03_Run
    reset_pose_bones(pb)
    key_bone("Hips",       loc=(0, 0, 0.024), frame=3)
    key_bone("Spine",      rot_euler=(math.radians(-12), 0, 0), frame=3)
    key_bone("Chest",      rot_euler=(math.radians(-8), 0, 0), frame=3)
    key_bone("Head",       rot_euler=(math.radians(10), 0, 0), frame=3)
    key_bone("Thigh.L",    rot_euler=(math.radians(45), 0, 0), frame=3)
    key_bone("Shin.L",     rot_euler=(0, 0, 0), frame=3)
    key_bone("Thigh.R",    rot_euler=(math.radians(-38), 0, 0), frame=3)
    key_bone("Shin.R",     rot_euler=(math.radians(-35), 0, 0), frame=3)
    key_bone("UpperArm.L", rot_euler=(math.radians(-45), 0, math.radians(-10)), frame=3)
    key_bone("Forearm.L",  rot_euler=(math.radians(75), 0, math.radians(10)), frame=3)
    key_bone("UpperArm.R", rot_euler=(math.radians(45), 0, math.radians(10)), frame=3)
    key_bone("Forearm.R",  rot_euler=(math.radians(75), 0, math.radians(-10)), frame=3)

    # Frame 4: Pose_04_Sit
    reset_pose_bones(pb)
    key_bone("Hips",       loc=(0, 0, -0.090), frame=4)
    key_bone("Spine",      rot_euler=(math.radians(-2), 0, 0), frame=4)
    key_bone("Chest",      rot_euler=(math.radians(-2), 0, 0), frame=4)
    key_bone("Thigh.L",    rot_euler=(math.radians(82), 0, 0), frame=4)
    key_bone("Shin.L",     rot_euler=(math.radians(-82), 0, 0), frame=4)
    key_bone("Thigh.R",    rot_euler=(math.radians(82), 0, 0), frame=4)
    key_bone("Shin.R",     rot_euler=(math.radians(-82), 0, 0), frame=4)
    key_bone("UpperArm.L", rot_euler=(math.radians(25), 0, math.radians(-10)), frame=4)
    key_bone("Forearm.L",  rot_euler=(math.radians(65), 0, math.radians(-15)), frame=4)
    key_bone("UpperArm.R", rot_euler=(math.radians(25), 0, math.radians(10)), frame=4)
    key_bone("Forearm.R",  rot_euler=(math.radians(65), 0, math.radians(15)), frame=4)

    # Frame 5: Pose_05_Bend_Forward
    reset_pose_bones(pb)
    key_bone("Hips",       loc=(0, -0.035, -0.025), frame=5)
    key_bone("Spine",      rot_euler=(math.radians(-28), 0, 0), frame=5)
    key_bone("Chest",      rot_euler=(math.radians(-22), 0, 0), frame=5)
    key_bone("Head",       rot_euler=(math.radians(-15), 0, 0), frame=5)
    key_bone("Thigh.L",    rot_euler=(math.radians(-10), 0, 0), frame=5)
    key_bone("Shin.L",     rot_euler=(math.radians(10), 0, 0), frame=5)
    key_bone("Thigh.R",    rot_euler=(math.radians(-10), 0, 0), frame=5)
    key_bone("Shin.R",     rot_euler=(math.radians(10), 0, 0), frame=5)
    key_bone("UpperArm.L", rot_euler=(math.radians(-35), 0, math.radians(-6)), frame=5)
    key_bone("Forearm.L",  rot_euler=(math.radians(15), 0, math.radians(-6)), frame=5)
    key_bone("UpperArm.R", rot_euler=(math.radians(-42), 0, math.radians(6)), frame=5)
    key_bone("Forearm.R",  rot_euler=(math.radians(12), 0, math.radians(6)), frame=5)

    # Frame 6: Pose_06_Reach
    reset_pose_bones(pb)
    key_bone("Hips",       loc=(0, 0, 0.008), frame=6)
    key_bone("Spine",      rot_euler=(math.radians(4), 0, 0), frame=6)
    key_bone("Chest",      rot_euler=(math.radians(6), 0, math.radians(10)), frame=6)
    key_bone("Head",       rot_euler=(math.radians(15), 0, 0), frame=6)
    key_bone("UpperArm.R", rot_euler=(math.radians(138), 0, math.radians(15)), frame=6)
    key_bone("Forearm.R",  rot_euler=(math.radians(15), 0, 0), frame=6)
    key_bone("UpperArm.L", rot_euler=(math.radians(-20), 0, math.radians(-12)), frame=6)
    key_bone("Forearm.L",  rot_euler=(math.radians(15), 0, math.radians(-6)), frame=6)

    bpy.ops.object.mode_set(mode="OBJECT")
    return act

def main():
    log(f"1. Loading user edited blend file: {INPUT_BLEND}")
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

    # Setup Studio Lighting & World
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

    # Bounce light (from below to softly illuminate pants and shoes)
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

    try:
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 12
        scene.cycles.use_denoising = True
        scene.cycles.device = "CPU"
    except:
        scene.render.engine = "BLENDER_EEVEE_NEXT"

    dist = 1.95
    target_z = 0.35

    # =========================================================================
    # PART 1: 6 DEFORMATION POSES (PHASE 4)
    # =========================================================================
    log("Building deformation poses action...")
    deform_act = build_deform_poses_action(arm_obj)
    arm_obj.animation_data.action = deform_act

    deform_poses = [
        ("pose_01_neutral.png",      1, (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
        ("pose_02_walk.png",         2, (dist * 0.72, dist * 0.72, target_z + 0.12), (math.radians(84), 0, math.radians(135))),
        ("pose_03_run.png",          3, (dist * 0.75, dist * 0.68, target_z + 0.10), (math.radians(84), 0, math.radians(132))),
        ("pose_04_sit.png",          4, (dist * 0.70, dist * 0.70, target_z + 0.08), (math.radians(84), 0, math.radians(135))),
        ("pose_05_bend_forward.png", 5, (dist * 0.72, dist * 0.65, target_z + 0.12), (math.radians(82), 0, math.radians(130))),
        ("pose_06_reach.png",        6, (dist * 0.70, dist * 0.70, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
    ]

    for fname, frame, cam_pos, cam_rot in deform_poses:
        scene.frame_set(frame)
        cam_obj.location = cam_pos
        cam_obj.rotation_euler = cam_rot
        out_local = os.path.join(POSES_DIR, fname)
        out_art = os.path.join(ARTIFACT_DIR, "poses", fname)
        scene.render.filepath = out_local
        log(f"Rendering Deformation Pose Frame {frame}: {fname}...")
        bpy.ops.render.render(write_still=True)
        shutil.copy2(out_local, out_art)
        shutil.copy2(out_local, os.path.join(PREVIEWS_DIR, fname))
        shutil.copy2(out_local, os.path.join(ARTIFACT_DIR, fname))

    # =========================================================================
    # PART 2: ALL 16 ANIMATION ACTIONS
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
        ("Action_Blink", 7, (0.0, 1.05, 0.48), (math.radians(88), 0, math.radians(180))),  # Cute face close-up
    ]

    for act_name, frame, cam_pos, cam_rot in action_specs:
        act = bpy.data.actions.get(act_name)
        if not act:
            log(f"WARNING: Action {act_name} not found, skipping.")
            continue

        arm_obj.animation_data.action = act
        scene.frame_set(frame)

        cam_obj.location = cam_pos
        cam_obj.rotation_euler = cam_rot

        clean_name = act_name.lower()
        fname = f"{clean_name}.png"
        out_local = os.path.join(ACTIONS_DIR, fname)
        out_art = os.path.join(ARTIFACT_DIR, "actions", fname)

        scene.render.filepath = out_local
        log(f"Rendering Action: {act_name} at frame {frame}...")
        bpy.ops.render.render(write_still=True)
        shutil.copy2(out_local, out_art)

    # Reset to Idle frame 1
    idle_act = bpy.data.actions.get("Action_Idle")
    if idle_act:
        arm_obj.animation_data.action = idle_act
    scene.frame_set(1)

    log("ALL RENDERS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    import traceback
    try:
        main()
    except Exception as e:
        log(f"CRITICAL ERROR IN MAIN: {e}")
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            traceback.print_exc(file=f)
