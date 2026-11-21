import sys
import traceback

log_file = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\test_err.txt"

try:
    with open(log_file, "w", encoding="utf-8") as f:
        f.write("Starting test_apply_fixes...\n")

    import bpy
    import bmesh
    import math
    import os

    FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
    PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
    CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
    sys.path.insert(0, FACTORY_DIR)

    from character_factory import CharacterFactory
    import clothing_library
    from clothing_library import (
        create_or_get_mat, add_ring, bridge_rings, cap_ring,
        apply_smooth, link_to_scene, assign_weights_by_z_and_x
    )

    with open(log_file, "a", encoding="utf-8") as f:
        f.write("Imports successful.\n")

    def fixed_build_top_base_torso(char_id, color="#f7f5ef", is_jacket=False, is_cardigan=False):
        bm = bmesh.new()
        mat = create_or_get_mat(f"M_Top_{char_id}", color, roughness=0.55 if not is_jacket else 0.48)
        segs = 18

        clearance = 0.003 if (is_jacket or is_cardigan) else 0.001
        r_neck      = add_ring(bm, 0.405, 0.070 + clearance, 0.064 + clearance, 0,  0.005, segs)
        r_shoulder  = add_ring(bm, 0.388, 0.106 + clearance, 0.082 + clearance, 0,  0.004, segs)
        r_chest_top = add_ring(bm, 0.375, 0.122 + clearance, 0.090 + clearance, 0,  0.003, segs)
        r_chest_mid = add_ring(bm, 0.340, 0.120 + clearance, 0.087 + clearance, 0,  0.000, segs)
        r_ribs      = add_ring(bm, 0.290, 0.110 + clearance, 0.080 + clearance, 0, -0.002, segs)
        
        hem_z = 0.235 if (is_jacket or is_cardigan) else 0.252
        r_waist     = add_ring(bm, hem_z, 0.103 + clearance, 0.076 + clearance, 0, -0.002, segs)

        bridge_rings(bm, r_neck, r_shoulder, 0)
        bridge_rings(bm, r_shoulder, r_chest_top, 0)
        bridge_rings(bm, r_chest_top, r_chest_mid, 0)
        bridge_rings(bm, r_chest_mid, r_ribs, 0)
        bridge_rings(bm, r_ribs, r_waist, 0)

        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

        mesh = bpy.data.meshes.new(f"Top_Torso_Mesh_{char_id}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new("Top_Torso_Mesh", mesh)
        obj.data.materials.append(mat)
        apply_smooth(obj)
        link_to_scene(obj)
        return obj

    def fixed_build_top_sleeves(char_id, arm, color="#f7f5ef", is_long=False, is_jacket=False):
        sleeve_objs = []
        mat = create_or_get_mat(f"M_Top_{char_id}", color, roughness=0.55 if not is_jacket else 0.48)
        segs = 14

        for side, sign in [(-1, "L"), (1, "R")]:
            bm = bmesh.new()
            cx = side * 0.118
            cy = 0.005

            r_cap_top   = add_ring(bm, 0.380, 0.034, 0.038, cx - side * 0.008, cy, segs)
            cap_ring(bm, r_cap_top, (cx - side * 0.012, cy, 0.383), 0, smooth=True)

            r_cap_mid   = add_ring(bm, 0.370, 0.045, 0.046, cx - side * 0.003, cy, segs)
            r_shoulder  = add_ring(bm, 0.355, 0.048, 0.048, cx, cy, segs)
            r_mid       = add_ring(bm, 0.332, 0.046, 0.046, cx + side * 0.003, cy + 0.002, segs)

            bridge_rings(bm, r_cap_top, r_cap_mid, 0)
            bridge_rings(bm, r_cap_mid, r_shoulder, 0)
            bridge_rings(bm, r_shoulder, r_mid, 0)

            if not is_long:
                r_cuff = add_ring(bm, 0.308, 0.044, 0.044, cx + side * 0.006, cy + 0.004, segs)
                r_cuff_in = add_ring(bm, 0.312, 0.038, 0.038, cx + side * 0.006, cy + 0.004, segs)
                bridge_rings(bm, r_mid, r_cuff, 0)
                bridge_rings(bm, r_cuff, r_cuff_in, 0)
            else:
                r_elbow_1 = add_ring(bm, 0.293, 0.036, 0.036, cx + side * 0.008, cy + 0.005, segs)
                r_elbow_2 = add_ring(bm, 0.280, 0.035, 0.035, cx + side * 0.010, cy + 0.006, segs)
                r_forearm = add_ring(bm, 0.245, 0.034, 0.034, cx + side * 0.013, cy + 0.008, segs)
                r_wrist   = add_ring(bm, 0.210, 0.033, 0.033, cx + side * 0.016, cy + 0.011, segs)
                r_wrist_in= add_ring(bm, 0.214, 0.029, 0.029, cx + side * 0.016, cy + 0.011, segs)

                bridge_rings(bm, r_mid, r_elbow_1, 0)
                bridge_rings(bm, r_elbow_1, r_elbow_2, 0)
                bridge_rings(bm, r_elbow_2, r_forearm, 0)
                bridge_rings(bm, r_forearm, r_wrist, 0)
                bridge_rings(bm, r_wrist, r_wrist_in, 0)

            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

            mesh = bpy.data.meshes.new(f"Top_Sleeve_Mesh_{sign}_{char_id}")
            bm.to_mesh(mesh)
            bm.free()

            s_obj = bpy.data.objects.new(f"Top_Sleeve_{sign}", mesh)
            s_obj.data.materials.append(mat)
            apply_smooth(s_obj)
            link_to_scene(s_obj)

            assign_weights_by_z_and_x(s_obj, [
                ("Chest", lambda co: co.z >= 0.365, lambda co: min(0.40, (co.z - 0.365)/0.018 * 0.40)),
                (f"UpperArm.{sign}", lambda co: co.z >= 0.270, lambda co: 1.0 if co.z < 0.365 else max(0.60, 1.0 - (co.z - 0.365)/0.018 * 0.40)),
                (f"Forearm.{sign}", lambda co: co.z < 0.270, 1.0)
            ])

            m = s_obj.modifiers.new("Armature", 'ARMATURE')
            m.object = arm
            sleeve_objs.append(s_obj)

        return sleeve_objs

    def fixed_build_adaptive_body_limbs(arm, char_id, skin_hex, top_id, bottom_id, footwear_id):
        limbs_objs = []
        mat_skin = create_or_get_mat(f"M_Skin_{char_id}", skin_hex, roughness=0.62)
        segs = 14

        is_long_top = (top_id in ["TOP_006", "TOP_007", "TOP_008"])
        
        for side, sign in [(-1, "L"), (1, "R")]:
            bm = bmesh.new()
            cx = side * 0.118

            if not is_long_top:
                r_arm_dome = add_ring(bm, 0.376, 0.030, 0.032, cx - side * 0.008, 0.005, segs)
                cap_ring(bm, r_arm_dome, (cx - side * 0.012, 0.005, 0.379), 0, smooth=True)
                r_arm_sh   = add_ring(bm, 0.360, 0.038, 0.038, cx - side * 0.003, 0.005, segs)
                r_arm_mid  = add_ring(bm, 0.335, 0.035, 0.035, cx + side * 0.003, 0.006, segs)
                r_top      = add_ring(bm, 0.310, 0.032, 0.032, cx + side * 0.006, 0.006, segs)
                r_elbow    = add_ring(bm, 0.280, 0.031, 0.031, cx + side * 0.010, 0.008, segs)
                r_fore     = add_ring(bm, 0.240, 0.0295, 0.0295, cx + side * 0.014, 0.011, segs)
                r_wrist    = add_ring(bm, 0.210, 0.028, 0.028, cx + side * 0.016, 0.013, segs)
                r_palm     = add_ring(bm, 0.170, 0.033, 0.028, cx + side * 0.019, 0.016, segs)
                r_palm_b   = add_ring(bm, 0.152, 0.027, 0.023, cx + side * 0.019, 0.016, segs)

                bridge_rings(bm, r_arm_dome, r_arm_sh, 0)
                bridge_rings(bm, r_arm_sh, r_arm_mid, 0)
                bridge_rings(bm, r_arm_mid, r_top, 0)
                bridge_rings(bm, r_top, r_elbow, 0)
                bridge_rings(bm, r_elbow, r_fore, 0)
                bridge_rings(bm, r_fore, r_wrist, 0)
                bridge_rings(bm, r_wrist, r_palm, 0)
                bridge_rings(bm, r_palm, r_palm_b, 0)
                cap_ring(bm, r_palm_b, (cx + side * 0.019, 0.016, 0.142), 0, reverse=True)
            else:
                r_wrist  = add_ring(bm, 0.212, 0.028, 0.028, cx + side * 0.016, 0.013, segs)
                r_palm   = add_ring(bm, 0.170, 0.033, 0.028, cx + side * 0.019, 0.016, segs)
                r_palm_b = add_ring(bm, 0.152, 0.027, 0.023, cx + side * 0.019, 0.016, segs)

                bridge_rings(bm, r_wrist, r_palm, 0)
                bridge_rings(bm, r_palm, r_palm_b, 0)
                cap_ring(bm, r_palm_b, (cx + side * 0.019, 0.016, 0.142), 0, reverse=True)

            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

            mesh = bpy.data.meshes.new(f"Body_Arm_Skin_Mesh_{sign}_{char_id}")
            bm.to_mesh(mesh)
            bm.free()

            a_obj = bpy.data.objects.new(f"Body_Arm_Skin_{sign}", mesh)
            a_obj.data.materials.append(mat_skin)
            apply_smooth(a_obj)
            link_to_scene(a_obj)

            assign_weights_by_z_and_x(a_obj, [
                ("Chest", lambda co: co.z >= 0.360, lambda co: min(0.30, (co.z - 0.360)/0.020 * 0.30)),
                (f"UpperArm.{sign}", lambda co: co.z >= 0.280, lambda co: 1.0 if co.z < 0.360 else max(0.70, 1.0 - (co.z - 0.360)/0.020 * 0.30)),
                (f"Forearm.{sign}", lambda co: 0.210 <= co.z < 0.280, 1.0),
                (f"Hand.{sign}", lambda co: co.z < 0.210, 1.0)
            ])

            m = a_obj.modifiers.new("Armature", 'ARMATURE')
            m.object = arm
            limbs_objs.append(a_obj)

        return limbs_objs

    def fixed_build_footwear_001_sneakers(arm, char_id, color="#f5f3ec"):
        bm = bmesh.new()
        mat_shoe = create_or_get_mat(f"M_Shoe_{char_id}", color, roughness=0.55)
        mat_sole = create_or_get_mat(f"M_Sole_{char_id}", "#b8aca0", roughness=0.70)
        lsegs = 14

        for side, sign in [(-1, "L"), (1, "R")]:
            cx = side * 0.055

            r_shaft_top = add_ring(bm, 0.054, 0.035, 0.035, cx, 0.002, lsegs)
            r_shaft_mid = add_ring(bm, 0.044, 0.036, 0.036, cx, 0.003, lsegs)
            r_collar    = add_ring(bm, 0.034, 0.038, 0.040, cx, 0.005, lsegs)

            r_mid  = add_ring(bm, 0.022, 0.045, 0.060, cx, 0.018, lsegs)
            r_bot  = add_ring(bm, 0.012, 0.047, 0.062, cx, 0.018, lsegs)
            r_sole = add_ring(bm, 0.000, 0.048, 0.064, cx, 0.018, lsegs)

            bridge_rings(bm, r_shaft_top, r_shaft_mid, 0)
            bridge_rings(bm, r_shaft_mid, r_collar, 0)
            bridge_rings(bm, r_collar, r_mid, 0)
            bridge_rings(bm, r_mid, r_bot, 0)
            bridge_rings(bm, r_bot, r_sole, 1)
            cap_ring(bm, r_sole, (cx, 0.018, 0.000), 1, reverse=True)

        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

        mesh = bpy.data.meshes.new(f"Footwear_Mesh_{char_id}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new("Footwear_Mesh", mesh)
        obj.data.materials.append(mat_shoe)
        obj.data.materials.append(mat_sole)
        apply_smooth(obj)
        link_to_scene(obj)

        for side, sign in [(-1, "L"), (1, "R")]:
            assign_weights_by_z_and_x(obj, [
                (f"Foot.{sign}", lambda co: (co.x * side > 0), 1.0),
                (f"Shin.{sign}", lambda co: (co.x * side > 0) and (co.z >= 0.034), 0.25)
            ])

        m = obj.modifiers.new("Armature", 'ARMATURE')
        m.object = arm
        return obj

    def fixed_build_socks_module(socks_id, arm, char_id, color="#f8fafc"):
        if socks_id == "SOCKS_004" or not socks_id:
            return None

        bm = bmesh.new()
        mat = create_or_get_mat(f"M_Socks_{char_id}", color, roughness=0.60)
        segs = 14

        top_z = 0.068

        for side, sign in [(-1, "L"), (1, "R")]:
            cx = side * 0.055
            r_bot = add_ring(bm, 0.032, 0.0340, 0.0340, cx, 0.001, segs)
            r_top = add_ring(bm, top_z, 0.0345, 0.0345, cx, 0.001, segs)
            r_hem = add_ring(bm, top_z + 0.002, 0.0350, 0.0350, cx, 0.001, segs)

            bridge_rings(bm, r_bot, r_top, 0)
            bridge_rings(bm, r_top, r_hem, 0)

        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

        mesh = bpy.data.meshes.new(f"Socks_Mesh_{char_id}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new("Socks_Mesh", mesh)
        obj.data.materials.append(mat)
        apply_smooth(obj)
        link_to_scene(obj)

        for side, sign in [(-1, "L"), (1, "R")]:
            assign_weights_by_z_and_x(obj, [
                (f"Shin.{sign}", lambda co: (co.x * side > 0), 1.0),
                (f"Foot.{sign}", lambda co: (co.x * side > 0) and (co.z <= 0.035), 0.3)
            ])

        m = obj.modifiers.new("Armature", 'ARMATURE')
        m.object = arm
        return obj

    def fixed_build_bottom_001_trousers(arm, char_id, color="#1c2841"):
        bm = bmesh.new()
        mat = create_or_get_mat(f"M_Bottom_{char_id}", color, roughness=0.65)
        segs = 18

        r_waist = add_ring(bm, 0.252, 0.103, 0.077, 0, -0.002, segs)
        r_belt  = add_ring(bm, 0.230, 0.104, 0.078, 0, -0.002, segs)
        r_hips  = add_ring(bm, 0.185, 0.108, 0.082, 0, -0.002, segs)
        r_crotch= add_ring(bm, 0.160, 0.102, 0.076, 0, -0.002, segs)

        bridge_rings(bm, r_waist, r_belt, 0)
        bridge_rings(bm, r_belt, r_hips, 0)
        bridge_rings(bm, r_hips, r_crotch, 0)

        lsegs = 14
        for side, sign in [(-1, "L"), (1, "R")]:
            cx = side * 0.055
            r_thigh_top = add_ring(bm, 0.160, 0.044, 0.044, cx, 0, lsegs)
            r_thigh_mid = add_ring(bm, 0.135, 0.042, 0.042, cx, 0, lsegs)
            r_knee_1    = add_ring(bm, 0.125, 0.041, 0.041, cx, 0.002, lsegs)
            r_knee_2    = add_ring(bm, 0.115, 0.040, 0.040, cx, 0.004, lsegs)
            r_knee_3    = add_ring(bm, 0.105, 0.040, 0.040, cx, 0.002, lsegs)
            r_shin_mid  = add_ring(bm, 0.070, 0.041, 0.041, cx, 0.002, lsegs)
            r_ankle     = add_ring(bm, 0.045, 0.042, 0.043, cx, 0.002, lsegs)
            r_cuff      = add_ring(bm, 0.033, 0.043, 0.044, cx, 0.003, lsegs)
            r_cuff_in   = add_ring(bm, 0.037, 0.039, 0.040, cx, 0.003, lsegs)

            bridge_rings(bm, r_thigh_top, r_thigh_mid, 0)
            bridge_rings(bm, r_thigh_mid, r_knee_1, 0)
            bridge_rings(bm, r_knee_1, r_knee_2, 0)
            bridge_rings(bm, r_knee_2, r_knee_3, 0)
            bridge_rings(bm, r_knee_3, r_shin_mid, 0)
            bridge_rings(bm, r_shin_mid, r_ankle, 0)
            bridge_rings(bm, r_ankle, r_cuff, 0)
            bridge_rings(bm, r_cuff, r_cuff_in, 0)

        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

        mesh = bpy.data.meshes.new(f"Bottom_Trousers_Mesh_{char_id}")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new("Bottom_Mesh", mesh)
        obj.data.materials.append(mat)
        apply_smooth(obj)
        link_to_scene(obj)

        for side, sign in [(-1, "L"), (1, "R")]:
            assign_weights_by_z_and_x(obj, [
                ("Hips", lambda co: co.z >= 0.160, lambda co: 1.0 if co.z >= 0.20 else (co.z - 0.160)/0.04),
                ("Spine", lambda co: co.z >= 0.235, 0.35),
                (f"Thigh.{sign}", lambda co: (co.x * side > 0) and (0.090 <= co.z <= 0.180), lambda co: 1.0 if co.z >= 0.125 else (co.z - 0.090)/0.035),
                (f"Shin.{sign}", lambda co: (co.x * side > 0) and (co.z <= 0.125), lambda co: 1.0 if co.z <= 0.105 else (0.125 - co.z)/0.020)
            ])

        m = obj.modifiers.new("Armature", 'ARMATURE')
        m.object = arm
        return obj

    factory = CharacterFactory(CANONICAL_BLEND)
    factory.load_base()

    clothing_library.build_top_base_torso = fixed_build_top_base_torso
    clothing_library.build_top_sleeves = fixed_build_top_sleeves
    clothing_library.build_adaptive_body_limbs = fixed_build_adaptive_body_limbs
    clothing_library.build_footwear_001_sneakers = fixed_build_footwear_001_sneakers
    clothing_library.build_socks_module = fixed_build_socks_module
    clothing_library.build_bottom_001_trousers = fixed_build_bottom_001_trousers

    scene = bpy.context.scene
    scene.render.resolution_x = 700
    scene.render.resolution_y = 700
    scene.render.image_settings.file_format = "PNG"

    for o in bpy.data.objects:
        if o.name.startswith("Hair_") or o.name.startswith("Acc_") or o.name == "Shirt_Collar":
            o.hide_render = True

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "fix_test")

    def clear_lights_and_cameras(scn):
        for ob in list(scn.objects):
            if ob.type in ('CAMERA', 'LIGHT'):
                scn.collection.objects.unlink(ob)
                bpy.data.objects.remove(ob, do_unlink=True)

    def setup_studio(scn, loc, rot, lens=55):
        clear_lights_and_cameras(scn)
        world = bpy.data.worlds.new("Audit_World")
        world.use_nodes = True
        bg = world.node_tree.nodes.get("Background")
        bg.inputs["Color"].default_value = (0.09, 0.10, 0.14, 1.0)
        scn.world = world

        def add_light(name, energy, rot_deg, col=(1.0, 1.0, 1.0)):
            l = bpy.data.lights.new(name, "SUN")
            l.energy = energy
            l.color = col
            o = bpy.data.objects.new(name, l)
            scn.collection.objects.link(o)
            o.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
            return o

        add_light("KeyFront", 5.5, (45, 20, -35), (1.0, 0.98, 0.95))
        add_light("FillLeft", 3.8, (35, -25, 130), (0.92, 0.95, 1.0))
        add_light("BackRim", 5.0, (40, 0, -180), (1.0, 0.98, 0.95))
        add_light("Bounce", 3.0, (-60, 10, 15), (1.0, 0.95, 0.92))

        cam_data = bpy.data.cameras.new("Cam")
        cam_data.lens = lens
        cam_obj = bpy.data.objects.new("Cam", cam_data)
        scn.collection.objects.link(cam_obj)
        scn.camera = cam_obj
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        return cam_obj

    shots = [
        ("test_shoulder_front.png", (0.0, 0.70, 0.360), (math.radians(90), 0, math.radians(180)), 65),
        ("test_shoulder_elevated_3quarter.png", (-0.60, 0.60, 0.440), (math.radians(78), 0, math.radians(-135)), 60),
        ("test_shoulder_back.png", (0.0, -0.70, 0.360), (math.radians(90), 0, 0), 65),
        ("test_shoe_front.png", (0.0, 0.50, 0.040), (math.radians(88), 0, math.radians(180)), 70),
        ("test_shoe_back.png", (0.0, -0.50, 0.040), (math.radians(88), 0, 0), 70),
        ("test_shoe_3quarter.png", (-0.45, 0.45, 0.120), (math.radians(76), 0, math.radians(-135)), 65),
    ]

    for fname, cloc, crot, lens in shots:
        setup_studio(scene, cloc, crot, lens=lens)
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"Rendered: {fname}\n")

    with open(log_file, "a", encoding="utf-8") as f:
        f.write("ALL TEST RENDERS COMPLETED SUCCESSFULLY!\n")

except Exception as e:
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"ERROR: {e}\n")
        traceback.print_exc(file=f)
