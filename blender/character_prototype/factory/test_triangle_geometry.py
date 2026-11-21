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

def build_vietnamese_red_scarf_fig13_exact(arm, char_id):
    """
    Constructs an authentic stylized Chibi Vietnamese School Red Scarf (Khăn quàng đỏ Đội viên).
    
    Accurate to Ministry of Education / Young Pioneer Organization Reference:
    1. SMALL rear triangular fabric section directly beneath the back neckline/collar (Fig 13):
       - Distinct linear inverted triangle pointing down the spine
       - Width at top base: 7.2cm (X in [-0.036, +0.036])
       - Height: ~2.3cm (Z from 0.403 down to 0.380, exactly 15% of visible torso height 0.153)
       - Flush with upper back curvature, zero clipping
    2. Shoulder & Neck Connection:
       - Slim folded band continuing from the rear triangle corners around both sides of neck
       - Hugs collar and shoulder contours closely, converging forward into central knot
    3. Front Geometry (Fig 12):
       - Central square knot (nút bẹt) beneath collar notch
       - Two hanging tails with soft tapered ends & angled cut tips
    """
    mat = create_or_get_mat(f"M_Acc_Scarf_{char_id}", "#d92027", roughness=0.58)
    bm = bmesh.new()

    thick = 0.0022  # Cloth thickness ~ 2.2mm

    # -------------------------------------------------------------------------
    # 1. SMALL REAR TRIANGLE (FIGURE 13)
    # -------------------------------------------------------------------------
    # A true linear triangle with straight diagonal edges meeting at apex
    w_top = 0.038    # Top half-width = 3.8cm (full width = 7.6cm)
    z_top = 0.403    # Top base at neckline
    z_apex = 0.368   # Bottom tip (apex) at Z = 0.368 (~3.5cm below neckline)

    def calc_back_y(x, z):
        # Precise offset matching Top_Torso_Mesh back surface
        if z >= 0.380:
            y_shirt = -0.059 - (0.405 - z) * 1.12
        else:
            y_shirt = -0.087 - (0.380 - z) * 0.05
        x_curve = (x ** 2) / 0.20
        # 3.5mm clearance outside shirt back
        return y_shirt - 0.0035 + x_curve

    # Generate a grid of quad rings for the triangle:
    # 5 vertical rows from top base to apex
    n_rows = 5
    tri_rows_outer = []
    tri_rows_inner = []

    for r in range(n_rows + 1):
        frac = r / n_rows  # 0 at top, 1 at apex
        cz = z_top - frac * (z_top - z_apex)
        # Linear tapering of width to apex
        cw = (1.0 - frac) * w_top
        if r == n_rows:
            cw = 0.002  # Tiny width at apex for clean quad closure

        # Row vertices: 3 points across (left, center, right)
        row_o = []
        row_i = []
        for x_frac in [-1.0, 0.0, 1.0]:
            cx = x_frac * cw
            cy = calc_back_y(cx, cz)
            # Outer surface vertex (-Y offset)
            v_o = bm.verts.new((cx, cy - thick, cz))
            # Inner surface vertex (+Y offset)
            v_i = bm.verts.new((cx, cy + thick, cz))
            row_o.append(v_o)
            row_i.append(v_i)

        tri_rows_outer.append(row_o)
        tri_rows_inner.append(row_i)

    # Bridge triangle grid quads
    for r in range(n_rows):
        o1 = tri_rows_outer[r]
        o2 = tri_rows_outer[r+1]
        i1 = tri_rows_inner[r]
        i2 = tri_rows_inner[r+1]

        # 2 quads across outer face (facing -Y)
        bm.faces.new([o1[0], o2[0], o2[1], o1[1]])
        bm.faces.new([o1[1], o2[1], o2[2], o1[2]])
        # 2 quads across inner face (facing +Y)
        bm.faces.new([i1[0], i1[1], i2[1], i2[0]])
        bm.faces.new([i1[1], i1[2], i2[2], i2[1]])

        # Left diagonal edge
        bm.faces.new([o1[0], o2[0], i2[0], i1[0]])
        # Right diagonal edge
        bm.faces.new([o1[2], i1[2], i2[2], o2[2]])

    # Cap bottom apex
    bo = tri_rows_outer[-1]
    bi = tri_rows_inner[-1]
    bm.faces.new([bo[0], bo[2], bi[2], bi[0]])

    # -------------------------------------------------------------------------
    # 2. SHOULDER & NECK CONNECTION BANDS (AROUND NECK TO FRONT KNOT)
    # -------------------------------------------------------------------------
    # Waypoints around neck from back top corners (X = +-w_top, Z = z_top) to front knot
    neck_path = [
        (w_top,  calc_back_y(w_top, z_top), z_top, 0.010),   # Start at triangle top corner
        (0.054, -0.046, 0.400, 0.011),                       # Back-lateral nape
        (0.067, -0.020, 0.395, 0.012),                       # Mid neck side
        (0.068,  0.015, 0.389, 0.012),                       # Front-lateral neck
        (0.054,  0.048, 0.380, 0.011),                       # Shoulder slope / clavicle
        (0.032,  0.072, 0.370, 0.010),                       # Collar opening
        (0.014,  0.088, 0.362, 0.009),                       # Entering knot top
    ]

    for side in [-1, 1]:
        cross_sections = []
        for p_idx, (wx, wy, wz, bh) in enumerate(neck_path):
            cx = side * wx
            cy = wy
            cz = wz

            # Outward normal
            nx = cx - 0.0
            ny = cy - 0.005
            ln = math.hypot(nx, ny)
            if ln > 0.0001:
                nx /= ln
                ny /= ln
            else:
                nx, ny = side, 0.0

            dx = nx * thick
            dy = ny * thick

            # Cross section quad
            v_to = bm.verts.new((cx + dx, cy + dy, cz + bh * 0.5))
            v_bo = bm.verts.new((cx + dx, cy + dy, cz - bh * 0.5))
            v_bi = bm.verts.new((cx - dx, cy - dy, cz - bh * 0.5))
            v_ti = bm.verts.new((cx - dx, cy - dy, cz + bh * 0.5))

            cross_sections.append((v_to, v_bo, v_bi, v_ti))

        # Bridge segments along neck band
        for p in range(len(cross_sections) - 1):
            to1, bo1, bi1, ti1 = cross_sections[p]
            to2, bo2, bi2, ti2 = cross_sections[p+1]

            bm.faces.new([to1, to2, bo2, bo1])  # outer
            bm.faces.new([bo1, bo2, bi2, bi1])  # bottom
            bm.faces.new([bi1, bi2, ti2, ti1])  # inner
            bm.faces.new([ti1, ti2, to2, to1])  # top

        # Cap start of band
        to_0, bo_0, bi_0, ti_0 = cross_sections[0]
        bm.faces.new([to_0, ti_0, bi_0, bo_0])

        # Cap front end entering knot
        to_e, bo_e, bi_e, ti_e = cross_sections[-1]
        bm.faces.new([to_e, bo_e, bi_e, ti_e])

    # Cap top base of triangle
    t_o = tri_rows_outer[0]
    t_i = tri_rows_inner[0]
    bm.faces.new([t_o[0], t_i[0], t_i[1], t_o[1]])
    bm.faces.new([t_o[1], t_i[1], t_i[2], t_o[2]])

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
    add_sun("BackSun", 4.8, (35, 0, -180))  # Clear angled sun on back of neck
    add_sun("Rim", 4.0, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def run_test():
    views = [
        ("scarf_exact_back.png",             (0.0, -1.50, 0.38), (math.radians(88), 0, 0), (480, 580)),
        ("scarf_exact_neckline_closeup.png", (0.0, -0.80, 0.39), (math.radians(80), 0, 0), (520, 520)),
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

        build_vietnamese_red_scarf_fig13_exact(factory.arm, f"test_{fname}")

        scene = bpy.context.scene
        setup_studio(scene, cloc, crot, res=res)

        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered view: {out_path}")

if __name__ == "__main__":
    run_test()
