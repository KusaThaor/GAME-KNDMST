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

def build_vietnamese_red_scarf_fig13(arm, char_id):
    """
    Constructs an authentic stylized Chibi Vietnamese School Red Scarf (Khăn quàng đỏ Đội viên).
    
    Accurate to Ministry of Education / Young Pioneer Organization Reference:
    1. SMALL rear triangular fabric section directly beneath the back neckline/collar (Fig 13):
       - Width at neckline: ~7.6cm (X in [-0.038, +0.038])
       - Height: ~2.4cm (apex at Z ~ 0.372, exactly 14% of visible torso height 0.153)
       - Crisp triangular silhouette pointing down the spine, flush with upper back
    2. Shoulder & Neck Connection:
       - Seamless continuous band continuing around both sides of neck into front knot
       - Close to body, zero gaps, zero pinch kinks
    3. Front Geometry (Fig 12):
       - Central square knot (nút bẹt) beneath collar notch
       - Two hanging tails with soft tapered ends & angled cut tips
    """
    mat = create_or_get_mat(f"M_Acc_Scarf_{char_id}", "#d92027", roughness=0.58)
    bm = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. CONTINUOUS NECK WRAP & REAR TRIANGULAR FLAP
    # -------------------------------------------------------------------------
    # Theta from 116 deg (front-left) -> 270 deg (back) -> 424 deg (front-right)
    steps = 28
    start_deg = 116.0
    end_deg = 424.0

    thick = 0.0022  # cloth half-thickness ~ 2.2mm
    rx = 0.072
    ry_base = 0.065
    cx = 0.0
    cy = 0.005

    wrap_cross_sections = []

    for i in range(steps + 1):
        u = i / steps
        deg = start_deg + u * (end_deg - start_deg)
        rad = math.radians(deg)
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)

        # Base height along neck slope:
        # Front (sin_a > 0): Z ~ 0.368
        # Sides (sin_a = 0): Z ~ 0.388
        # Back (sin_a = -1): Z ~ 0.404
        z_base = 0.388 - 0.016 * sin_a

        # Scarf band height:
        band_h = 0.010

        # Rear triangular flap logic (Figure 13):
        # Active in angular sector around 270 deg (e.g. 215 deg to 325 deg, width 110 deg)
        deg_dist = abs(deg - 270.0)
        tri_drop = 0.0
        back_y_offset = 0.0

        if deg_dist < 52.0:
            # Linear / cosine blend from edge of triangle to center apex
            tri_factor = math.cos(deg_dist / 52.0 * math.pi * 0.5)  # 1.0 at center, 0.0 at edge
            # Triangle drop: 2.4cm below the band bottom
            tri_drop = 0.024 * (tri_factor ** 1.1)
            # Expand Y backward to follow the upper back curvature
            back_y_offset = -0.014 * (tri_factor ** 1.1)

        # Coordinate on neck ellipse
        ry = ry_base
        xm = cx + rx * cos_a
        ym = cy + ry * sin_a + back_y_offset

        # Upper edge of scarf
        z_top = z_base + band_h * 0.5
        # Lower edge of scarf (extends down into triangle at back)
        z_bot = z_base - band_h * 0.5 - tri_drop

        # Outward radial normal
        nx = cos_a
        ny = sin_a
        dx = nx * thick
        dy = ny * thick

        # Cross section vertices:
        # Outer-Top, Outer-Bot, Inner-Bot, Inner-Top
        v_ot = bm.verts.new((xm + dx, ym + dy, z_top))
        v_ob = bm.verts.new((xm + dx, ym + dy, z_bot))
        v_ib = bm.verts.new((xm - dx, ym - dy, z_bot))
        v_it = bm.verts.new((xm - dx, ym - dy, z_top))

        wrap_cross_sections.append((v_ot, v_ob, v_ib, v_it))

    # Bridge the continuous wrap
    for i in range(steps):
        ot1, ob1, ib1, it1 = wrap_cross_sections[i]
        ot2, ob2, ib2, it2 = wrap_cross_sections[i+1]

        bm.faces.new([ot1, ot2, ob2, ob1])  # outer surface
        bm.faces.new([ob1, ob2, ib2, ib1])  # bottom edge / triangle edge
        bm.faces.new([ib1, ib2, it2, it1])  # inner surface
        bm.faces.new([it1, it2, ot2, ot1])  # top edge

    # Cap front ends
    bm.faces.new([wrap_cross_sections[0][0], wrap_cross_sections[0][1], wrap_cross_sections[0][2], wrap_cross_sections[0][3]])
    bm.faces.new([wrap_cross_sections[-1][0], wrap_cross_sections[-1][3], wrap_cross_sections[-1][2], wrap_cross_sections[-1][1]])

    # -------------------------------------------------------------------------
    # 2. FRONT FOLD CONVERGENCE TO KNOT
    # -------------------------------------------------------------------------
    for side, sign in [(-1, "L"), (1, "R")]:
        start_ring = wrap_cross_sections[0] if side < 0 else wrap_cross_sections[-1]
        trans_w = 0.011
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
    # 3. CENTRAL SQUARE KNOT (FIGURE 12)
    # -------------------------------------------------------------------------
    kw = 0.019  # half-width ~ 3.8cm
    kh = 0.015  # half-height ~ 3.0cm
    kd = 0.010  # half-depth ~ 2.0cm
    kx = 0.0
    ky = 0.092
    kz = 0.355

    knot_rings = []
    profiles = [
        (kw * 0.75, kh * 0.75, kd * 0.45,  0.005),
        (kw * 1.00, kh * 1.00, kd * 1.00,  0.000),
        (kw * 0.70, kh * 0.70, kd * 0.50, -0.005),
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

    # Center knot wrap band
    bw = 0.011
    bh = 0.007
    b_front = [
        bm.verts.new((kx - bw, ky + kd + 0.006, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.006, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.006, kz - bh)),
        bm.verts.new((kx - bw, ky + kd + 0.006, kz - bh)),
    ]
    bm.faces.new(b_front)

    # -------------------------------------------------------------------------
    # 4. TWO HANGING TAILS (FIGURE 12)
    # -------------------------------------------------------------------------
    tail_defs = [
        {
            "side": -1,
            "root_x": -0.007,
            "root_y": 0.091,
            "root_z": 0.344,
            "tip_zo": 0.276,
            "tip_zi": 0.292,
            "drift_x": -0.010,
            "n_segs": 5
        },
        {
            "side": 1,
            "root_x": 0.007,
            "root_y": 0.090,
            "root_z": 0.344,
            "tip_zo": 0.260,
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
        hw_mid = 0.0135
        thick_t = 0.0022

        rings_f = []
        rings_b = []

        for s in range(n_segs + 1):
            frac = s / n_segs
            cz = rz_0 - frac * t_len

            y_bump = math.sin(frac * math.pi * 0.7) * 0.0035
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

            v_fl = bm.verts.new((cx - cur_w, cy + thick_t, zl))
            v_fr = bm.verts.new((cx + cur_w, cy + thick_t, zr))
            v_br = bm.verts.new((cx + cur_w, cy - thick_t, zr))
            v_bl = bm.verts.new((cx - cur_w, cy - thick_t, zl))

            rings_f.append((v_fl, v_fr))
            rings_b.append((v_bl, v_br))

        for s in range(n_segs):
            fl1, fr1 = rings_f[s]
            fl2, fr2 = rings_f[s+1]
            bl1, br1 = rings_b[s]
            bl2, br2 = rings_b[s+1]

            bm.faces.new([fl1, fr1, fr2, fl2])  # front
            bm.faces.new([fr1, br1, br2, fr2])  # right
            bm.faces.new([br1, bl1, bl2, br2])  # back
            bm.faces.new([bl1, fl1, fl2, bl2])  # left

        b_fl, b_fr = rings_f[-1]
        b_bl, b_br = rings_b[-1]
        bm.faces.new([b_fl, b_fr, b_br, b_bl])

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

    # 5. SKINNING (NECK, CHEST, SPINE)
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

def setup_studio(scene, cam_loc, cam_rot, res=(480, 580)):
    for o in list(scene.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            scene.collection.objects.unlink(o)
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Scarf_Studio_Cam")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("Scarf_Studio_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = cam_rot

    scene.world = bpy.data.worlds.new("Scarf_Studio_World")
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
    add_sun("ChinBounce", 3.6, (-60, 10, 15))
    add_sun("BackSun", 4.5, (45, 0, -180))  # Bright sun on upper back
    add_sun("Rim", 4.0, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def run_test():
    views = [
        ("scarf_fig13_back.png",             (0.0, -1.55, 0.38), (math.radians(88), 0, 0), (480, 580)),
        ("scarf_fig13_neckline_closeup.png", (0.0, -0.85, 0.39), (math.radians(82), 0, 0), (520, 520)),
        ("scarf_fig13_front.png",            (0.0, 1.55, 0.38), (math.radians(88), 0, math.radians(180)), (480, 580)),
        ("scarf_fig13_left_side.png",        (-1.55, 0.0, 0.38), (math.radians(88), 0, math.radians(-90)), (480, 580)),
        ("scarf_fig13_three_quarter_rear.png",(-1.10, -1.10, 0.44), (math.radians(78), 0, math.radians(-45)), (480, 580)),
    ]

    for fname, cloc, crot, res in views:
        factory = CharacterFactory(CANONICAL_BLEND)
        factory.load_base()
        factory.isolate_materials(f"test_{fname}")
        factory.apply_skin_tone("SKIN_02", f"test_{fname}")
        factory.equip_hair("HAIR_001", "#1c1615", f"test_{fname}")

        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", f"test_{fname}")
        factory.setup_facial_system("Happy", f"test_{fname}")

        # Build Fig 13 refined scarf
        build_vietnamese_red_scarf_fig13(factory.arm, f"test_{fname}")

        scene = bpy.context.scene
        setup_studio(scene, cloc, crot, res=res)

        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered view: {out_path}")

if __name__ == "__main__":
    run_test()
