import bpy
import bmesh
import math
import mathutils
import os
import sys

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
CANONICAL_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")

if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

from character_factory import CharacterFactory
import clothing_library

def create_or_get_mat(name, hex_color, roughness=0.55):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        h = hex_color.lstrip('#')
        rgb = tuple(int(h[i:i+2], 16)/255.0 for i in (0, 2, 4))
        bsdf.inputs['Base Color'].default_value = (rgb[0]**2.2, rgb[1]**2.2, rgb[2]**2.2, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = 0.0
    mat.use_backface_culling = False
    return mat

def build_vietnamese_red_scarf(arm, char_id):
    """
    Constructs an authentic stylized Chibi Vietnamese School Red Scarf (Khăn quàng đỏ Đội viên).
    
    Structure:
    1. Vòng quàng cổ & Vạt tam giác sau gáy (Neck wrap & triangular capelet on upper back)
    2. Nút thắt vuông vắn trung tâm (Central square knot beneath shirt collar)
    3. Hai dải khăn buông rủ phía trước (Left & right hanging tails with angled cut tips)
    """
    mat = create_or_get_mat(f"M_Acc_Scarf_{char_id}", "#d92027", roughness=0.58)
    bm = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. TRIANGULAR BACK CAPELET & NECK WRAP
    # -------------------------------------------------------------------------
    # Traverses from front-left (118 deg) around back (270 deg) to front-right (422 deg)
    steps = 20
    start_deg = 116.0
    end_deg = 424.0
    
    wrap_rings = []
    rx_base = 0.076
    ry_base = 0.070
    cx = 0.0
    cy = 0.004

    for i in range(steps + 1):
        u = i / steps
        deg = start_deg + u * (end_deg - start_deg)
        rad = math.radians(deg)
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)

        # Back factor (1.0 at 270 deg, 0 at sides & front)
        back_factor = max(0.0, -sin_a)

        # As we reach the back, expand ry outward so the triangular tip rests ON TOP of the shirt back
        ry = ry_base + 0.024 * (back_factor ** 1.4)
        rx = rx_base + 0.004 * (back_factor ** 1.4)

        xm = cx + rx * cos_a
        ym = cy + ry * sin_a

        # Base Z: highest at back (0.404), sloping forward to collar opening (0.368)
        z_base = 0.396 - 0.026 * sin_a

        z_top = z_base + 0.009

        # Triangular drop down to z ~ 0.358 at back center
        tri_drop = 0.040 * (back_factor ** 1.6)
        z_bot = z_base - 0.009 - tri_drop

        # Thickness: offset normal to ellipse
        thick = 0.0028
        dx = cos_a * thick
        dy = sin_a * thick

        v_ot = bm.verts.new((xm + dx, ym + dy, z_top))
        v_ob = bm.verts.new((xm + dx, ym + dy, z_bot))
        v_ib = bm.verts.new((xm - dx, ym - dy, z_bot))
        v_it = bm.verts.new((xm - dx, ym - dy, z_top))

        wrap_rings.append((v_ot, v_ob, v_ib, v_it))

    # Bridge the wrap segments
    for i in range(steps):
        ot1, ob1, ib1, it1 = wrap_rings[i]
        ot2, ob2, ib2, it2 = wrap_rings[i+1]

        bm.faces.new([ot1, ot2, ob2, ob1])  # outer
        bm.faces.new([ob1, ob2, ib2, ib1])  # bottom
        bm.faces.new([ib1, ib2, it2, it1])  # inner
        bm.faces.new([it1, it2, ot2, ot1])  # top

    # Cap front-left end & front-right end
    bm.faces.new([wrap_rings[0][0], wrap_rings[0][1], wrap_rings[0][2], wrap_rings[0][3]])
    bm.faces.new([wrap_rings[-1][0], wrap_rings[-1][3], wrap_rings[-1][2], wrap_rings[-1][1]])

    # -------------------------------------------------------------------------
    # 2. FRONT FOLD CONVERGENCE TO KNOT
    # -------------------------------------------------------------------------
    for side, sign in [(-1, "L"), (1, "R")]:
        start_ring = wrap_rings[0] if side < 0 else wrap_rings[-1]
        trans_w = 0.012
        trans_h = 0.008
        tx = side * 0.013
        ty = 0.089
        tz = 0.366

        v_ft = bm.verts.new((tx - side * trans_w, ty + 0.004, tz + trans_h))
        v_fb = bm.verts.new((tx - side * trans_w, ty + 0.004, tz - trans_h))
        v_bb = bm.verts.new((tx + side * trans_w, ty - 0.002, tz - trans_h))
        v_bt = bm.verts.new((tx + side * trans_w, ty - 0.002, tz + trans_h))

        bm.faces.new([v_ft, v_fb, v_bb, v_bt])

    # -------------------------------------------------------------------------
    # 3. CENTRAL SQUARE KNOT (NÚT THẮT VUÔNG VẮN ĐẶC TRƯNG)
    # -------------------------------------------------------------------------
    kw = 0.020  # width ~ 4.0cm
    kh = 0.016  # height ~ 3.2cm
    kd = 0.011  # depth ~ 2.2cm
    kx = 0.0
    ky = 0.093
    kz = 0.355

    knot_rings = []
    profiles = [
        (kw * 0.75, kh * 0.75, kd * 0.45,  0.006),  # front dome
        (kw * 1.00, kh * 1.00, kd * 1.00,  0.000),  # mid perimeter
        (kw * 0.70, kh * 0.70, kd * 0.50, -0.006),  # back seat
    ]

    for sz_w, sz_h, sz_d, dy in profiles:
        ring = [
            bm.verts.new((kx - sz_w, ky + dy + sz_d, kz + sz_h)),
            bm.verts.new((kx + sz_w, ky + dy + sz_d, kz + sz_h)),
            bm.verts.new((kx + sz_w, ky + dy + sz_d, kz - sz_h)),
            bm.verts.new((kx - sz_w, ky + dy + sz_d, kz - sz_h)),
        ]
        knot_rings.append(ring)

    for r in range(len(knot_rings) - 1):
        for j in range(4):
            bm.faces.new([
                knot_rings[r][j], knot_rings[r][(j+1)%4],
                knot_rings[r+1][(j+1)%4], knot_rings[r+1][j]
            ])
    bm.faces.new([knot_rings[0][0], knot_rings[0][3], knot_rings[0][2], knot_rings[0][1]])
    bm.faces.new([knot_rings[-1][0], knot_rings[-1][1], knot_rings[-1][2], knot_rings[-1][3]])

    # Center knot wrap band (horizontal cloth belt)
    bw = 0.012
    bh = 0.008
    b_front = [
        bm.verts.new((kx - bw, ky + kd + 0.007, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.007, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.007, kz - bh)),
        bm.verts.new((kx - bw, ky + kd + 0.007, kz - bh)),
    ]
    bm.faces.new(b_front)

    # -------------------------------------------------------------------------
    # 4. TWO HANGING SCARF TAILS (HAI DẢI KHĂN BUÔNG RỦ)
    # -------------------------------------------------------------------------
    tail_defs = [
        {
            "side": -1,
            "root_x": -0.007,
            "root_y": 0.091,
            "root_z": 0.344,
            "tip_zo": 0.275,
            "tip_zi": 0.292,
            "drift_x": -0.010,
            "n_segs": 5
        },
        {
            "side": 1,
            "root_x": 0.007,
            "root_y": 0.090,
            "root_z": 0.344,
            "tip_zo": 0.258,
            "tip_zi": 0.276,
            "drift_x": 0.011,
            "n_segs": 5
        }
    ]

    for td in tail_defs:
        side = td["side"]
        n_segs = td["n_segs"]
        rx_0 = td["root_x"]
        ry_0 = td["root_y"]
        rz_0 = td["root_z"]
        tzo = td["tip_zo"]
        tzi = td["tip_zi"]
        avg_tz = (tzo + tzi) * 0.5
        t_len = rz_0 - avg_tz

        hw_root = 0.010
        hw_mid = 0.014
        thick = 0.0024

        rings_f = []
        rings_b = []

        for s in range(n_segs + 1):
            frac = s / n_segs
            cz = rz_0 - frac * t_len

            # Follow chest curve
            y_bump = math.sin(frac * math.pi * 0.7) * 0.004
            cy = ry_0 + y_bump - frac * 0.003
            cx = rx_0 + frac * td["drift_x"]

            cur_w = (1.0 - frac) * hw_root + frac * hw_mid

            if s == n_segs:
                zo = tzo
                zi = tzi
            else:
                zo = cz
                zi = cz

            zl = zo if side < 0 else zi
            zr = zi if side < 0 else zo

            v_fl = bm.verts.new((cx - cur_w, cy + thick, zl))
            v_fr = bm.verts.new((cx + cur_w, cy + thick, zr))
            v_br = bm.verts.new((cx + cur_w, cy - thick, zr))
            v_bl = bm.verts.new((cx - cur_w, cy - thick, zl))

            rings_f.append((v_fl, v_fr))
            rings_b.append((v_bl, v_br))

        for s in range(n_segs):
            fl1, fr1 = rings_f[s]
            fl2, fr2 = rings_f[s+1]
            bl1, br1 = rings_b[s]
            bl2, br2 = rings_b[s+1]

            bm.faces.new([fl1, fr1, fr2, fl2])
            bm.faces.new([fr1, br1, br2, fr2])
            bm.faces.new([br1, bl1, bl2, br2])
            bm.faces.new([bl1, fl1, fl2, bl2])

        b_fl, b_fr = rings_f[-1]
        b_bl, b_br = rings_b[-1]
        bm.faces.new([b_fl, b_fr, b_br, b_bl])

    # Recalculate face normals
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Acc_Red_Scarf_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    scarf_obj = bpy.data.objects.new("Acc_Red_Scarf", mesh)
    scarf_obj.data.materials.append(mat)

    sub = scarf_obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1

    for poly in scarf_obj.data.polygons:
        poly.use_smooth = True

    bpy.context.scene.collection.objects.link(scarf_obj)

    # -------------------------------------------------------------------------
    # 5. LIGHTWEIGHT BONE-BASED SKINNING (NECK, CHEST, SPINE)
    # -------------------------------------------------------------------------
    vg_neck = scarf_obj.vertex_groups.new(name="Neck")
    vg_chest = scarf_obj.vertex_groups.new(name="Chest")
    vg_spine = scarf_obj.vertex_groups.new(name="Spine")

    for v in scarf_obj.data.vertices:
        z = v.co.z
        if z >= 0.380:
            vg_neck.add([v.index], 0.65, 'REPLACE')
            vg_chest.add([v.index], 0.35, 'REPLACE')
        elif z >= 0.340:
            vg_chest.add([v.index], 0.90, 'REPLACE')
            vg_neck.add([v.index], 0.10, 'REPLACE')
        elif z >= 0.300:
            vg_chest.add([v.index], 0.85, 'REPLACE')
            vg_spine.add([v.index], 0.15, 'REPLACE')
        else:
            vg_chest.add([v.index], 0.65, 'REPLACE')
            vg_spine.add([v.index], 0.35, 'REPLACE')

    m_arm = scarf_obj.modifiers.new("Armature", 'ARMATURE')
    m_arm.object = arm

    return scarf_obj

def setup_studio(scene, cam_loc, cam_rot, res=(480, 560)):
    cam_data = bpy.data.cameras.new("Scarf_Cam")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("Scarf_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = cam_rot

    scene.world = bpy.data.worlds.new("Scarf_World")
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
    add_sun("ChinBounce", 3.5, (-60, 10, 15))
    add_sun("BackSun", 4.0, (45, 0, -180))  # Lights upper back & nape
    add_sun("Rim", 4.0, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def run_tests():
    # 1. RENDER 4 ANGLES
    angles = [
        ("scarf_preview_front.png", (0.0, 1.55, 0.38), (math.radians(88), 0, math.radians(180))),
        ("scarf_preview_3quarter.png", (1.10, 1.10, 0.44), (math.radians(78), 0, math.radians(135))),
        ("scarf_preview_side.png", (1.55, 0.0, 0.38), (math.radians(88), 0, math.radians(90))),
        ("scarf_preview_back.png", (0.0, -1.55, 0.38), (math.radians(88), 0, 0)),
    ]

    for fname, cloc, crot in angles:
        factory = CharacterFactory(CANONICAL_BLEND)
        factory.load_base()
        factory.isolate_materials(f"angle_{fname}")
        factory.apply_skin_tone("SKIN_02", f"angle_{fname}")
        factory.equip_hair("HAIR_001", "#1c1615", f"angle_{fname}")

        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", f"angle_{fname}")
        factory.setup_facial_system("Happy", f"angle_{fname}")

        build_vietnamese_red_scarf(factory.arm, f"angle_{fname}")

        scene = bpy.context.scene
        setup_studio(scene, cloc, crot)
        
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered angle: {out_path}")

    # 2. RENDER 5 ANIMATION ACTIONS WITH SCARF
    print("\n>>> Rendering 5 Animation Actions with Red Scarf...")
    factory = CharacterFactory(CANONICAL_BLEND)
    factory.load_base()
    factory.isolate_materials("scarf_anim_test")
    factory.apply_skin_tone("SKIN_02", "scarf_anim_test")
    factory.equip_hair("HAIR_001", "#1c1615", "scarf_anim_test")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "scarf_anim_test")
    factory.setup_facial_system("Happy", "scarf_anim_test")
    build_vietnamese_red_scarf(factory.arm, "scarf_anim_test")

    anim_actions = [
        ("Action_Walk", 15, "scarf_anim_walk.png", (0.30, 1.65, 0.38), (math.radians(88), 0, math.radians(170))),
        ("Action_Run",  12, "scarf_anim_run.png",  (0.30, 1.65, 0.38), (math.radians(88), 0, math.radians(170))),
        ("Action_Sit",  20, "scarf_anim_sit.png",  (0.28, 1.55, 0.32), (math.radians(88), 0, math.radians(170))),
        ("Action_Bow",  15, "scarf_anim_bow.png",  (0.28, 1.55, 0.36), (math.radians(88), 0, math.radians(170))),
        ("Action_Talk", 10, "scarf_anim_talk.png", (0.22, 1.50, 0.40), (math.radians(88), 0, math.radians(172))),
    ]

    for act_name, frame_num, out_name, c_loc, c_rot in anim_actions:
        act = bpy.data.actions.get(act_name)
        if act:
            factory.arm.animation_data_create()
            factory.arm.animation_data.action = act
            bpy.context.scene.frame_set(frame_num)
            bpy.context.view_layer.update()

            scene = bpy.context.scene
            setup_studio(scene, cam_loc=c_loc, cam_rot=c_rot)
            out_img = os.path.join(PREVIEWS_DIR, out_name)
            scene.render.filepath = out_img
            bpy.ops.render.render(write_still=True)
            print(f"  Rendered action {act_name}: {out_img}")

if __name__ == "__main__":
    run_tests()
