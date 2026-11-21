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

def build_vietnamese_red_scarf_refined(arm, char_id):
    """
    Constructs an authentic stylized Chibi Vietnamese School Red Scarf (Khăn quàng đỏ Đội viên).
    
    Accurate to Ministry of Education / Young Pioneer Organization Reference:
    1. SMALL rear triangular fabric section directly beneath the back neckline/collar (Fig 13):
       - Top width: ~6.8cm (X in [-0.034, +0.034])
       - Height: ~2.0cm (Z from 0.404 down to 0.384, exactly 12-13% of visible torso height)
       - Snug against upper back (Y ~ -0.065 to -0.076)
    2. Shoulder & Neck Connection:
       - Slim folded band continuing from the small rear section around both sides of the neck
       - Hugs the collar and shoulder contour closely
       - Converges forward directly into the central knot
    3. Front Geometry (Fig 12):
       - Central square knot (nút bẹt) beneath collar notch
       - Two hanging tails with soft tapered ends & angled cut tips
    """
    mat = create_or_get_mat(f"M_Acc_Scarf_{char_id}", "#d92027", roughness=0.58)
    bm = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. SMALL REAR TRIANGULAR SECTION (FIGURE 13)
    # -------------------------------------------------------------------------
    # Top edge of rear triangle sits right at the back neckline (Z ~ 0.404)
    # Width: X from -0.034 to +0.034
    # Apex points straight down the spine to Z ~ 0.384 (12.5% of torso height 0.153)
    # 3 horizontal quad slices for smooth curvature against the upper back:
    # Slice 0: Z = 0.404, half-width = 0.034, Y = -0.065
    # Slice 1: Z = 0.394, half-width = 0.020, Y = -0.071
    # Slice 2: Z = 0.384, half-width = 0.004, Y = -0.076 (apex tip)

    thick = 0.0024  # 2.4mm cloth thickness
    
    tri_slices = [
        {"z": 0.404, "w": 0.034, "y": -0.065},
        {"z": 0.394, "w": 0.020, "y": -0.071},
        {"z": 0.384, "w": 0.004, "y": -0.076},
    ]

    tri_rings_outer = []
    tri_rings_inner = []

    for sl in tri_slices:
        cz = sl["z"]
        cw = sl["w"]
        cy = sl["y"]

        # Outer surface vertices (offset slightly backward -Y)
        v_ol = bm.verts.new((-cw, cy - thick, cz))
        v_or = bm.verts.new(( cw, cy - thick, cz))
        # Inner surface vertices (flush with shirt back)
        v_ir = bm.verts.new(( cw, cy + thick, cz))
        v_il = bm.verts.new((-cw, cy + thick, cz))

        tri_rings_outer.append((v_ol, v_or))
        tri_rings_inner.append((v_il, v_ir))

    # Bridge rear triangle quad slices
    for s in range(len(tri_slices) - 1):
        (ol1, or1) = tri_rings_outer[s]
        (ol2, or2) = tri_rings_outer[s+1]
        (il1, ir1) = tri_rings_inner[s]
        (il2, ir2) = tri_rings_inner[s+1]

        # Outer back face
        bm.faces.new([ol1, or1, or2, ol2])
        # Right edge
        bm.faces.new([or1, ir1, ir2, or2])
        # Inner front face (against shirt)
        bm.faces.new([ir1, il1, il2, ir2])
        # Left edge
        bm.faces.new([il1, ol1, ol2, il2])

    # Cap bottom apex of triangle
    (b_ol, b_or) = tri_rings_outer[-1]
    (b_il, b_ir) = tri_rings_inner[-1]
    bm.faces.new([b_ol, b_or, b_ir, b_il])

    # -------------------------------------------------------------------------
    # 2. SHOULDER & NECK CONNECTION BANDS (WRAPPING AROUND TO FRONT)
    # -------------------------------------------------------------------------
    # Left band:  starts at left top corner (-0.034, -0.065, 0.404) -> wraps around left neck -> front knot
    # Right band: starts at right top corner (+0.034, -0.065, 0.404) -> wraps around right neck -> front knot
    
    # Path of waypoints for left neck band (mirror for right):
    # (x, y, z, band_height, half_thick)
    neck_path_left = [
        (-0.034, -0.065, 0.404, 0.010),  # Connected to rear triangle top left
        (-0.052, -0.048, 0.401, 0.011),  # Back-left nape
        (-0.066, -0.022, 0.396, 0.012),  # Mid-left side of neck
        (-0.068,  0.012, 0.390, 0.012),  # Front-left side of neck
        (-0.054,  0.046, 0.382, 0.011),  # Clavicle / shoulder slope
        (-0.032,  0.072, 0.372, 0.010),  # Approaching collar opening
        (-0.014,  0.088, 0.364, 0.009),  # Entering top of central knot
    ]

    for side, sign in [(-1, "L"), (1, "R")]:
        band_cross_sections = []
        for (wx, wy, wz, bh) in neck_path_left:
            cx = side * abs(wx)
            cy = wy
            cz = wz

            # Calculate normal perpendicular to path in XY
            # For stylized band: normal points outward radially from neck center (0, 0.005)
            nx = cx - 0.0
            ny = cy - 0.005
            len_n = math.hypot(nx, ny)
            if len_n > 0.0001:
                nx /= len_n
                ny /= len_n
            else:
                nx, ny = side, 0.0

            dx = nx * thick
            dy = ny * thick

            # Cross section quad: top-outer, bot-outer, bot-inner, top-inner
            v_to = bm.verts.new((cx + dx, cy + dy, cz + bh * 0.5))
            v_bo = bm.verts.new((cx + dx, cy + dy, cz - bh * 0.5))
            v_bi = bm.verts.new((cx - dx, cy - dy, cz - bh * 0.5))
            v_ti = bm.verts.new((cx - dx, cy - dy, cz + bh * 0.5))

            band_cross_sections.append((v_to, v_bo, v_bi, v_ti))

        # Bridge segments along neck path
        for p in range(len(band_cross_sections) - 1):
            to1, bo1, bi1, ti1 = band_cross_sections[p]
            to2, bo2, bi2, ti2 = band_cross_sections[p+1]

            bm.faces.new([to1, to2, bo2, bo1])  # outer
            bm.faces.new([bo1, bo2, bi2, bi1])  # bottom
            bm.faces.new([bi1, bi2, ti2, ti1])  # inner
            bm.faces.new([ti1, ti2, to2, to1])  # top

        # Connect the first cross section of left/right band to rear triangle top corners
        if side < 0:
            # Connect left band start to triangle top-left
            to_s, bo_s, bi_s, ti_s = band_cross_sections[0]
            ol_t, or_t = tri_rings_outer[0]
            il_t, ir_t = tri_rings_inner[0]
            bm.faces.new([ol_t, to_s, ti_s, il_t])
        else:
            to_s, bo_s, bi_s, ti_s = band_cross_sections[0]
            ol_t, or_t = tri_rings_outer[0]
            il_t, ir_t = tri_rings_inner[0]
            bm.faces.new([or_t, ir_t, ti_s, to_s])

        # Cap the front end entering the knot
        to_e, bo_e, bi_e, ti_e = band_cross_sections[-1]
        bm.faces.new([to_e, bo_e, bi_e, ti_e])

    # Cap top edge between the two neck bands at the back neckline
    ol_0, or_0 = tri_rings_outer[0]
    il_0, ir_0 = tri_rings_inner[0]
    bm.faces.new([ol_0, il_0, ir_0, or_0])

    # -------------------------------------------------------------------------
    # 3. CENTRAL SQUARE KNOT (FIGURE 12)
    # -------------------------------------------------------------------------
    # Sits right below collar notch: X=0.0, Y=0.092, Z=0.355
    kw = 0.019  # half-width ~ 3.8cm
    kh = 0.015  # half-height ~ 3.0cm
    kd = 0.010  # half-depth ~ 2.0cm
    kx = 0.0
    ky = 0.092
    kz = 0.355

    knot_rings = []
    profiles = [
        (kw * 0.75, kh * 0.75, kd * 0.45,  0.005),  # front dome
        (kw * 1.00, kh * 1.00, kd * 1.00,  0.000),  # mid perimeter
        (kw * 0.70, kh * 0.70, kd * 0.50, -0.005),  # back seat
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

    # Center knot wrap band (horizontal cloth loop)
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
    # 5. SKINNING (NECK, CHEST, SPINE)
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
    add_sun("BackSun", 4.2, (45, 0, -180))
    add_sun("Rim", 4.0, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def run_test():
    views = [
        ("scarf_v3_front.png",               (0.0, 1.55, 0.38), (math.radians(88), 0, math.radians(180)), (480, 580)),
        ("scarf_v3_left_side.png",           (-1.55, 0.0, 0.38), (math.radians(88), 0, math.radians(-90)), (480, 580)),
        ("scarf_v3_back.png",                (0.0, -1.55, 0.38), (math.radians(88), 0, 0), (480, 580)),
        ("scarf_v3_three_quarter_rear.png",  (-1.10, -1.10, 0.44), (math.radians(78), 0, math.radians(-45)), (480, 580)),
        ("scarf_v3_neckline_closeup.png",    (0.0, -0.80, 0.40), (math.radians(85), 0, 0), (500, 500)),
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

        # Build refined scarf
        build_vietnamese_red_scarf_refined(factory.arm, f"test_{fname}")

        scene = bpy.context.scene
        setup_studio(scene, cloc, crot, res=res)

        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered view: {out_path}")

if __name__ == "__main__":
    run_test()
