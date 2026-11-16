import bpy
import bmesh
import math
import os
import traceback

LOG_FILE = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\perfect_hair_test.log"

with open(LOG_FILE, "w", encoding="utf-8") as log:
    try:
        log.write("Starting perfect_hair_test.py...\n")
        PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
        INPUT_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
        OUT_FRONT = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "perfect_hair_front.png")
        OUT_34 = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "perfect_hair_34.png")
        OUT_SIDE = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base", "perfect_hair_side.png")

        # bpy.ops.wm.open_mainfile(filepath=INPUT_BLEND)

        # Remove existing hair objects
        existing_hair = [o for o in bpy.data.objects if o.name.startswith("Hair_")]
        for o in existing_hair:
            oname = o.name
            bpy.data.objects.remove(o, do_unlink=True)
            log.write(f"Removed {oname}\n")

        arm = bpy.data.objects.get("Student_Armature")
        mat_hair = bpy.data.materials.get("M_Hair")
        col = bpy.data.collections.get("Collection_Hair") or bpy.context.scene.collection

        head_z = 0.525

        # 1. Hair Cap
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.022, head_z + 0.040))
        cap = bpy.context.active_object
        cap.name = "Hair_Cap"
        cap.scale = (0.42, 0.40, 0.31)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub_cap = cap.modifiers.new("Subdiv", "SUBSURF")
        sub_cap.levels = 2
        sub_cap.render_levels = 2
        cap.data.materials.append(mat_hair)
        for p in cap.data.polygons:
            p.use_smooth = True
        if cap.name not in col.objects:
            col.objects.link(cap)

        # 2. Main Stylized Bangs
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.075, head_z + 0.065))
        bangs = bpy.context.active_object
        bangs.name = "Hair_Bangs"
        bangs.scale = (0.36, 0.22, 0.14)
        bangs.rotation_euler = (math.radians(-24), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub_b = bangs.modifiers.new("Subdiv", "SUBSURF")
        sub_b.levels = 2
        sub_b.render_levels = 2
        bangs.data.materials.append(mat_hair)
        for p in bangs.data.polygons:
            p.use_smooth = True
        if bangs.name not in col.objects:
            col.objects.link(bangs)

        # 3. Sleek Sideburns
        for side, sign in [(-1, "L"), (1, "R")]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.170, 0.045, head_z + 0.010))
            burn = bpy.context.active_object
            burn.name = f"Hair_Sideburn_{sign}"
            burn.scale = (0.028, 0.055, 0.115)
            burn.rotation_euler = (math.radians(-10), 0, math.radians(side * -5))
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            sub_s = burn.modifiers.new("Subdiv", "SUBSURF")
            sub_s.levels = 2
            sub_s.render_levels = 2
            burn.data.materials.append(mat_hair)
            for p in burn.data.polygons:
                p.use_smooth = True
            if burn.name not in col.objects:
                col.objects.link(burn)

        # Bind all new hair to Head bone
        for h in [cap, bangs] + [bpy.data.objects.get(f"Hair_Sideburn_{s}") for s in ["L", "R"]]:
            if h:
                vg = h.vertex_groups.new(name="Head")
                vg.add(list(range(len(h.data.vertices))), 1.0, 'REPLACE')
                m = h.modifiers.new("Armature", 'ARMATURE')
                m.object = arm

        # Setup Camera & Lighting for validation
        scene = bpy.context.scene
        cam_obj = bpy.data.objects.get("Cam")
        if not cam_obj:
            cam_data = bpy.data.cameras.new("Cam")
            cam_data.lens = 55
            cam_obj = bpy.data.objects.new("Cam", cam_data)
            scene.collection.objects.link(cam_obj)
        scene.camera = cam_obj

        # Studio Lighting & World
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
        log.write("Front render completed\n")

        # 3/4 render
        angle = math.radians(35)
        cam_obj.location = (dist * math.sin(angle), dist * math.cos(angle), target_z + 0.08)
        cam_obj.rotation_euler = (math.radians(85), 0, math.radians(180 - 35))
        scene.render.filepath = OUT_34
        bpy.ops.render.render(write_still=True)
        log.write("3/4 render completed\n")

        # Side render
        cam_obj.location = (dist, 0.0, target_z)
        cam_obj.rotation_euler = (math.radians(88), 0, math.radians(90))
        scene.render.filepath = OUT_SIDE
        bpy.ops.render.render(write_still=True)
        log.write("Side render completed\n")

        log.write("ALL DONE!\n")
    except Exception as e:
        log.write("ERROR: " + str(e) + "\n")
        log.write(traceback.format_exc() + "\n")
