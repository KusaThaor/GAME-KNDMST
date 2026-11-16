"""
=============================================================================
EXPORT AND VALIDATE USER EDITED BLEND
Opens the user's manually edited .blend file WITHOUT modifying any geometry.
Exports to GLB for Three.js and renders fresh previews.
=============================================================================
"""

import bpy
import math
import os
import shutil

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
INPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_skinned.blend")
OUTPUT_GLB_SKINNED = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_skinned.glb")
OUTPUT_GLB_ACTIVE = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student.glb")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_skinned")
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "export_log.txt")

def log(msg):
    print(f">> {msg}")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING EXPORT OF USER EDITED BLEND\n")

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def main():
    log(f"1. Loading user edited blend file: {INPUT_BLEND}")
    bpy.ops.wm.open_mainfile(filepath=INPUT_BLEND)

    arm_obj = bpy.data.objects.get("Student_Armature")
    if not arm_obj:
        log("ERROR: Student_Armature not found!")
        return

    # Select all character meshes and armature
    bpy.ops.object.select_all(action="DESELECT")
    arm_obj.select_set(True)

    mesh_count = 0
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.name != "Podium":
            obj.select_set(True)
            mesh_count += 1

    log(f"Selected Armature and {mesh_count} meshes for GLB export.")

    log(f"2. Exporting GLB to: {OUTPUT_GLB_SKINNED}")
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB_SKINNED,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_materials="EXPORT",
        export_animations=True,
        export_skins=True
    )

    log(f"3. Exporting GLB to active game asset: {OUTPUT_GLB_ACTIVE}")
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB_ACTIVE,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_materials="EXPORT",
        export_animations=True,
        export_skins=True
    )

    log("4. Setting up camera and studio for fresh renders...")
    # Setup Camera
    cam_obj = bpy.data.objects.get("Cam")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam")
        cam_data.lens = 55
        cam_obj = bpy.data.objects.new("Cam", cam_data)
        bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Setup Lights if missing
    if not bpy.data.objects.get("Key"):
        key_l = bpy.data.lights.new("Key", "SUN")
        key_l.energy = 4.2
        key_l.color = hex_to_lin("#fff9f0")[:3]
        key_obj = bpy.data.objects.new("Key", key_l)
        key_obj.rotation_euler = (math.radians(52), math.radians(22), math.radians(-32))
        bpy.context.scene.collection.objects.link(key_obj)

    if not bpy.data.objects.get("Fill"):
        fill_l = bpy.data.lights.new("Fill", "SUN")
        fill_l.energy = 2.0
        fill_l.color = hex_to_lin("#dae8f8")[:3]
        fill_obj = bpy.data.objects.new("Fill", fill_l)
        fill_obj.rotation_euler = (math.radians(40), math.radians(-30), math.radians(145))
        bpy.context.scene.collection.objects.link(fill_obj)

    if not bpy.data.objects.get("Rim"):
        rim_l = bpy.data.lights.new("Rim", "SUN")
        rim_l.energy = 2.6
        rim_l.color = hex_to_lin("#ffffff")[:3]
        rim_obj = bpy.data.objects.new("Rim", rim_l)
        rim_obj.rotation_euler = (math.radians(30), math.radians(15), math.radians(35))
        bpy.context.scene.collection.objects.link(rim_obj)

    # Render Settings
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1350
    scene.render.resolution_percentage = 100

    try:
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 14
        scene.cycles.use_denoising = True
        scene.cycles.device = "CPU"
    except:
        scene.render.engine = "BLENDER_EEVEE_NEXT"

    # Reset to frame 1 Idle
    if arm_obj.animation_data and arm_obj.animation_data.action:
        idle_act = bpy.data.actions.get("Action_Idle")
        if idle_act:
            arm_obj.animation_data.action = idle_act
    scene.frame_set(1)

    dist = 1.95
    target_z = 0.35

    turnaround_views = [
        ("01_front.png",         (0.0, dist, target_z + 0.05),            (math.radians(88), 0, math.radians(180))),
        ("02_side.png",          (dist, 0.0, target_z + 0.05),            (math.radians(88), 0, math.radians(90))),
        ("03_back.png",          (0.0, -dist, target_z + 0.05),           (math.radians(88), 0, math.radians(0))),
        ("04_three_quarter.png", (dist * 0.72, dist * 0.72, target_z + 0.14), (math.radians(82), 0, math.radians(135))),
    ]

    for fname, loc, rot in turnaround_views:
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        log(f"Rendering: {fname}...")
        bpy.ops.render.render(write_still=True)
        log(f"Saved: {out_path}")

    log("EXPORT AND RENDERING OF USER BLEND COMPLETE!")

if __name__ == "__main__":
    main()
