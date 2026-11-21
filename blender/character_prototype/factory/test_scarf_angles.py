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
    1. Vòng quàng cổ & Vạt tam giác sau gáy (Neck wrap & triangular capelet at upper back)
    2. Nút thắt vuông vắn trung tâm (Central square knot beneath shirt collar)
    3. Hai dải khăn buông rủ phía trước (Left & right hanging tails with angled tips)
    """
    mat = create_or_get_mat(f"M_Acc_Scarf_{char_id}", "#d92027", roughness=0.58)
    bm = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. TRIANGULAR BACK CAPELET & NECK WRAP
    # -------------------------------------------------------------------------
    # The scarf wraps around the neck from front-left -> left -> back -> right -> front-right
    # Angle theta (in radians) traversing the back of the neck:
    # Front-left: theta ~ 115 deg (x < 0, y > 0)
    # Left:       theta = 180 deg (x < 0, y = 0)
    # Back:       theta = 270 deg (x = 0, y < 0)
    # Right:      theta = 360 deg / 0 deg (x > 0, y = 0)
    # Front-right:theta = 425 deg (65 deg) (x > 0, y > 0)
    
    steps = 18
    start_deg = 118.0
    end_deg = 422.0
    
    wrap_rings = []
    # Ellipse parameters for neck wrap
    rx = 0.075
    ry = 0.070
    cx = 0.0
    cy = 0.004

    for i in range(steps + 1):
        u = i / steps
        deg = start_deg + u * (end_deg - start_deg)
        rad = math.radians(deg)
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)

        xm = cx + rx * cos_a
        ym = cy + ry * sin_a

        # Base Z: highest at back (0.404), sloping forward to collar opening (0.368)
        # sin_a is -1 at back (270 deg), +0.88 at front (118 & 422 deg)
        # Interpolate cleanly:
        z_base = 0.396 - 0.026 * sin_a

        # Upper edge of scarf wrap
        z_top = z_base + 0.009

        # Lower edge of scarf wrap:
        # At the back (deg around 270, sin_a near -1), create the triangular capelet!
        # When sin_a < 0, triangular extension hangs down the spine
        back_factor = max(0.0, -sin_a)  # 1.0 at back center, 0 at sides/front
        # Triangular drop down to z ~ 0.364
        tri_drop = 0.034 * (back_factor ** 1.8)
        z_bot = z_base - 0.009 - tri_drop

        # Thickness: offset normal to ellipse
        thick = 0.0028
        dx = cos_a * thick
        dy = sin_a * thick

        # 4 vertices per cross-section: outer-top, outer-bot, inner-bot, inner-top
        v_ot = bm.verts.new((xm + dx, ym + dy, z_top))
        v_ob = bm.verts.new((xm + dx, ym + dy, z_bot))
        v_ib = bm.verts.new((xm - dx, ym - dy, z_bot))
        v_it = bm.verts.new((xm - dx, ym - dy, z_top))

        wrap_rings.append((v_ot, v_ob, v_ib, v_it))

    # Bridge the wrap segments
    for i in range(steps):
        ot1, ob1, ib1, it1 = wrap_rings[i]
        ot2, ob2, ib2, it2 = wrap_rings[i+1]

        # Outer face
        bm.faces.new([ot1, ot2, ob2, ob1])
        # Bottom edge
        bm.faces.new([ob1, ob2, ib2, ib1])
        # Inner face
        bm.faces.new([ib1, ib2, it2, it1])
        # Top edge
        bm.faces.new([it1, it2, ot2, ot1])

    # Cap front-left end
    bm.faces.new([wrap_rings[0][0], wrap_rings[0][1], wrap_rings[0][2], wrap_rings[0][3]])
    # Cap front-right end
    bm.faces.new([wrap_rings[-1][0], wrap_rings[-1][3], wrap_rings[-1][2], wrap_rings[-1][1]])

    # -------------------------------------------------------------------------
    # 2. FRONT FOLD CONVERGENCE TO KNOT (VẠT QUÀNG HỘI TỤ VÀO NÚT THẮT)
    # -------------------------------------------------------------------------
    # Connect front-left wrap (around x=-0.025, y=0.082, z=0.370) to knot top
    # and front-right wrap (around x=+0.025, y=0.082, z=0.370) to knot top
    for side, sign in [(-1, "L"), (1, "R")]:
        start_ring = wrap_rings[0] if side < 0 else wrap_rings[-1]
        # Transition bridge towards central knot
        trans_w = 0.010
        trans_h = 0.008
        tx = side * 0.012
        ty = 0.088
        tz = 0.366

        v_ft = bm.verts.new((tx - side * trans_w, ty + 0.004, tz + trans_h))
        v_fb = bm.verts.new((tx - side * trans_w, ty + 0.004, tz - trans_h))
        v_bb = bm.verts.new((tx + side * trans_w, ty - 0.002, tz - trans_h))
        v_bt = bm.verts.new((tx + side * trans_w, ty - 0.002, tz + trans_h))

        bm.faces.new([v_ft, v_fb, v_bb, v_bt])

    # -------------------------------------------------------------------------
    # 3. CENTRAL SQUARE KNOT (NÚT THẮT VUÔNG VẮN ĐẶC TRƯNG)
    # -------------------------------------------------------------------------
    # Position: x=0.0, y=0.092, z=0.355 (neatly beneath shirt collar)
    kw = 0.018  # half-width ~ 3.6cm
    kh = 0.015  # half-height ~ 3.0cm
    kd = 0.010  # half-depth ~ 2.0cm
    kx = 0.0
    ky = 0.092
    kz = 0.355

    knot_rings = []
    # 3 concentric profile slices to create rounded pillowing
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
    bw = 0.011
    bh = 0.007
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
    # Left tail:  tip outer z=0.282, inner z=0.298
    # Right tail: tip outer z=0.266, inner z=0.282 (slightly longer)
    tail_defs = [
        {
            "side": -1,
            "root_x": -0.007,
            "root_y": 0.091,
            "root_z": 0.344,
            "tip_zo": 0.282,
            "tip_zi": 0.298,
            "drift_x": -0.011,
            "n_segs": 5
        },
        {
            "side": 1,
            "root_x": 0.007,
            "root_y": 0.090,
            "root_z": 0.344,
            "tip_zo": 0.266,
            "tip_zi": 0.282,
            "drift_x": 0.012,
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

        hw_root = 0.009
        hw_mid = 0.012
        thick = 0.0022

        rings_f = []
        rings_b = []

        for s in range(n_segs + 1):
            frac = s / n_segs
            cz = rz_0 - frac * t_len

            # Chest contour clearance
            y_bump = math.sin(frac * math.pi * 0.7) * 0.003
            cy = ry_0 + y_bump - frac * 0.004
            cx = rx_0 + frac * td["drift_x"]

            cur_w = (1.0 - frac) * hw_root + frac * hw_mid

            if s == n_segs:
                # Angled cut: outer corner lower than inner corner
                zo = tzo
                zi = tzi
            else:
                zo = cz
                zi = cz

            # If side < 0 (left): outer is -X, inner is +X
            # If side > 0 (right): inner is -X, outer is +X
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

            bm.faces.new([fl1, fr1, fr2, fl2])  # front
            bm.faces.new([fr1, br1, br2, fr2])  # right
            bm.faces.new([br1, bl1, bl2, br2])  # back
            bm.faces.new([bl1, fl1, fl2, bl2])  # left

        # Bottom tip face
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
        elif z >= 0.305:
            vg_chest.add([v.index], 0.85, 'REPLACE')
            vg_spine.add([v.index], 0.15, 'REPLACE')
        else:
            vg_chest.add([v.index], 0.65, 'REPLACE')
            vg_spine.add([v.index], 0.35, 'REPLACE')

    m_arm = scarf_obj.modifiers.new("Armature", 'ARMATURE')
    m_arm.object = arm

    return scarf_obj

def setup_studio(scene, cam_loc, cam_rot, res=(480, 560)):
    # Camera
    cam_data = bpy.data.cameras.new("Scarf_Cam")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("Scarf_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = cam_rot

    # World lighting
    scene.world = bpy.data.worlds.new("Scarf_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.07, 0.08, 0.11, 1.0)
        bg.inputs["Strength"].default_value = 0.95

    # 4-Point Lights with chin-fill
    def add_sun(name, energy, rot_deg):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj

    add_sun("Key", 5.2, (52, 18, -35))
    add_sun("Fill", 3.0, (38, -25, 140))
    add_sun("ChinBounce", 3.5, (-60, 10, 15))  # Upward light illuminating neck & collar
    add_sun("Rim", 4.0, (25, 10, 30))

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def render_angles():
    angles = [
        ("scarf_preview_front.png", (0.0, 1.55, 0.38), (math.radians(88), 0, math.radians(180))),
        ("scarf_preview_3quarter.png", (1.10, 1.10, 0.44), (math.radians(78), 0, math.radians(135))),
        ("scarf_preview_side.png", (1.55, 0.0, 0.38), (math.radians(88), 0, math.radians(90))),
        ("scarf_preview_back.png", (0.0, -1.55, 0.38), (math.radians(88), 0, 0)),
    ]

    for fname, cloc, crot in angles:
        # Load fresh base
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

        # Build scarf
        build_vietnamese_red_scarf(factory.arm, f"angle_{fname}")

        scene = bpy.context.scene
        setup_studio(scene, cloc, crot)
        
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered angle: {out_path}")

if __name__ == "__main__":
    render_angles()
