import bpy
import math
import os
import traceback

log_file = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\test_hair_debug_log.txt"

with open(log_file, "w") as f:
    try:
        PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
        SCENE_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
        OUT_IMG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_hair_debug.png")

        bpy.ops.wm.open_mainfile(filepath=SCENE_PATH)
        scene = bpy.context.scene

        mat_hair = bpy.data.materials.get("M_Hair")
        if not mat_hair:
            mat_hair = bpy.data.materials.new("M_Hair")
            mat_hair.use_nodes = True
            bsdf = mat_hair.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = (0.015, 0.012, 0.012, 1.0)
                bsdf.inputs["Roughness"].default_value = 0.7

        for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R"]:
            o = bpy.data.objects.get(name)
            if o:
                o.data.materials.clear()
                o.data.materials.append(mat_hair)
                f.write(f"{name} material assigned: {o.data.materials[0].name}\n")
            else:
                f.write(f"WARNING: {name} not found in scene!\n")

        cam_obj = bpy.data.objects.get("Cam")
        if not cam_obj:
            cam_data = bpy.data.cameras.new("Cam")
            cam_data.lens = 55
            cam_obj = bpy.data.objects.new("Cam", cam_data)
            scene.collection.objects.link(cam_obj)
        scene.camera = cam_obj

        dist = 1.95
        target_z = 0.40
        cam_obj.location = (dist * 0.72, dist * 0.72, target_z + 0.10)
        cam_obj.rotation_euler = (math.radians(84), 0, math.radians(135))

        scene.render.resolution_x = 720
        scene.render.resolution_y = 900
        scene.render.filepath = OUT_IMG
        bpy.ops.render.render(write_still=True)
        f.write(f"Debug render saved: {OUT_IMG}, exists={os.path.exists(OUT_IMG)}\n")
    except Exception as e:
        f.write(f"ERROR: {e}\n{traceback.format_exc()}\n")
