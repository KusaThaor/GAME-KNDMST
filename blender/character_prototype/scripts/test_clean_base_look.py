import bpy
import bmesh
import math
import os
import traceback

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SCENE_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
OUT_FRONT = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_clean_front.png")
OUT_34 = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "test_clean_34.png")
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "clean_test_log.txt")

with open(LOG_PATH, "w", encoding="utf-8") as log:
    try:
        log.write("Starting test_clean_base_look.py...\n")
        # 1. Remove detail accessories
        remove_details = ["Scarf_Knot", "Scarf_Tail_L", "Scarf_Tail_R", "Nametag", "Belt_Buckle"]
        for name in remove_details:
            obj = bpy.data.objects.get(name)
            if obj:
                bpy.data.objects.remove(obj, do_unlink=True)
                log.write(f"Removed detail: {name}\n")

        # 2. Test Eye resizing
        # Let's inspect current eyes
        for side, sign in [(-1, "L"), (1, "R")]:
            eye = bpy.data.objects.get(f"Eye_{sign}")
            hl1 = bpy.data.objects.get(f"Eye_HL1_{sign}")
            hl2 = bpy.data.objects.get(f"Eye_HL2_{sign}")
            brow = bpy.data.objects.get(f"Eyebrow_{sign}")

            if eye:
                # Enlarge eye: scale width & height by 1.45x
                # Previous scale was (0.022, 0.008, 0.028)
                eye.scale = (1.45, 1.0, 1.40)
                # Apply scale
                bpy.context.view_layer.objects.active = eye
                bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
                log.write(f"Scaled Eye_{sign}\n")

            if hl1:
                hl1.scale = (1.45, 1.0, 1.40)
                # Adjust highlight offset slightly
                hl1.location.x = eye.location.x + side * 0.008
                hl1.location.z = eye.location.z + 0.011
                bpy.context.view_layer.objects.active = hl1
                bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

            if hl2:
                hl2.scale = (1.45, 1.0, 1.40)
                hl2.location.x = eye.location.x - side * 0.008
                hl2.location.z = eye.location.z - 0.010
                bpy.context.view_layer.objects.active = hl2
                bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

            if brow:
                # Move eyebrow up slightly to give space for larger expressive eyes
                brow.location.z = 0.525 + 0.044

        # 3. Setup Camera & Studio Lights
        scene = bpy.context.scene
        cam_obj = bpy.data.objects.get("Cam")
        if not cam_obj:
            cam_data = bpy.data.cameras.new("Cam")
            cam_data.lens = 55
            cam_obj = bpy.data.objects.new("Cam", cam_data)
            scene.collection.objects.link(cam_obj)
        scene.camera = cam_obj

        if not scene.world:
            scene.world = bpy.data.worlds.new("World")
        scene.world.use_nodes = True
        bg_node = scene.world.node_tree.nodes.get("Background")
        if bg_node:
            bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
            bg_node.inputs["Strength"].default_value = 0.8

        def ensure_sun(name, energy, rot):
            obj = bpy.data.objects.get(name)
            if not obj:
                l = bpy.data.lights.new(name, "SUN")
                obj = bpy.data.objects.new(name, l)
                scene.collection.objects.link(obj)
            obj.data.energy = energy
            obj.rotation_euler = (math.radians(rot[0]), math.radians(rot[1]), math.radians(rot[2]))
            return obj

        ensure_sun("Key", 4.8, (52, 22, -32))
        ensure_sun("Fill", 2.8, (40, -30, 145))
        ensure_sun("Bounce", 1.6, (-45, 15, 20))
        ensure_sun("Rim", 3.2, (30, 15, 35))

        scene.render.resolution_x = 720
        scene.render.resolution_y = 900
        scene.render.image_settings.file_format = "PNG"

        dist = 1.95
        target_z = 0.40

        # Front render
        cam_obj.location = (0.0, dist, target_z)
        cam_obj.rotation_euler = (math.radians(88), 0, math.radians(180))
        scene.render.filepath = OUT_FRONT
        bpy.ops.render.render(write_still=True)
        log.write("Rendered front\n")

        # 3/4 render
        angle = math.radians(35)
        cam_obj.location = (dist * math.sin(angle), dist * math.cos(angle), target_z + 0.08)
        cam_obj.rotation_euler = (math.radians(85), 0, math.radians(180 - 35))
        scene.render.filepath = OUT_34
        bpy.ops.render.render(write_still=True)
        log.write("Rendered 3/4\n")

        log.write("SUCCESS!\n")
    except Exception as e:
        log.write("ERROR: " + str(e) + "\n")
        log.write(traceback.format_exc() + "\n")
