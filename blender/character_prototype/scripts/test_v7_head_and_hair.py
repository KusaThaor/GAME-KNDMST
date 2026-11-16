import bpy
import bmesh
import math
import os
import traceback

LOG_FILE = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\test_hair_run.log"

with open(LOG_FILE, "w", encoding="utf-8") as log:
    try:
        log.write("Starting test_v7_head_and_hair.py...\n")
        PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
        OUT_IMG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_v7_hair_front.png")
        OUT_IMG_34 = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_v7_hair_34.png")

        to_remove = ["Head", "Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R", "Ear_L", "Ear_R", "Blush_L", "Blush_R", "Mouth", "Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"]
        for name in to_remove:
            obj = bpy.data.objects.get(name)
            if obj:
                bpy.data.objects.remove(obj, do_unlink=True)
                log.write(f"Removed {name}\n")

        V7_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "backup_v7", "vietnamese_student_original_v7.blend")
        log.write(f"Loading from {V7_BLEND}...\n")
        with bpy.data.libraries.load(V7_BLEND, link=False) as (data_from, data_to):
            data_to.objects = [name for name in data_from.objects if name in to_remove]

        arm = bpy.data.objects.get("Student_Armature")
        col = bpy.context.scene.collection

        for obj in data_to.objects:
            if obj:
                col.objects.link(obj)
                log.write(f"Linked {obj.name}\n")
                vg = obj.vertex_groups.get("Head") or obj.vertex_groups.new(name="Head")
                all_idx = [v.index for v in obj.data.vertices]
                vg.add(all_idx, 1.0, 'REPLACE')
                arm_mod = None
                for m in obj.modifiers:
                    if m.type == 'ARMATURE':
                        arm_mod = m
                        break
                if not arm_mod:
                    arm_mod = obj.modifiers.new("Armature", 'ARMATURE')
                arm_mod.object = arm

        scene = bpy.context.scene
        cam_obj = bpy.data.objects.get("Camera") or bpy.data.objects.get("Cam") or scene.camera
        if not cam_obj:
            cam_data = bpy.data.cameras.new("Camera")
            cam_obj = bpy.data.objects.new("Camera", cam_data)
            col.objects.link(cam_obj)
        scene.camera = cam_obj

        dist = 1.95
        target_z = 0.40

        cam_obj.location = (0.0, dist, target_z)
        cam_obj.rotation_euler = (math.radians(88), 0, math.radians(180))
        scene.render.filepath = OUT_IMG
        scene.render.resolution_x = 720
        scene.render.resolution_y = 900
        bpy.ops.render.render(write_still=True)
        log.write("Front render done!\n")

        angle = math.radians(35)
        cam_obj.location = (dist * math.sin(angle), dist * math.cos(angle), target_z + 0.08)
        cam_obj.rotation_euler = (math.radians(85), 0, math.radians(180 - 35))
        scene.render.filepath = OUT_IMG_34
        bpy.ops.render.render(write_still=True)
        log.write("3/4 render done!\n")

    except Exception as e:
        log.write("ERROR: " + str(e) + "\n")
        log.write(traceback.format_exc() + "\n")
