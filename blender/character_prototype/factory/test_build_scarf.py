import bpy
import bmesh
import math
import mathutils
import os
import sys

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
CANONICAL_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
TEST_OUT = os.path.join(FACTORY_DIR, "previews", "test_new_scarf.png")

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

def create_stylized_red_scarf(arm, char_id):
    """
    Constructs an authentic stylized Chibi Vietnamese School Red Scarf (Khăn quàng đỏ)
    Includes:
    1. Triangular back flap (vạt tam giác sau gáy)
    2. Neck collar wrap (dải quàng quanh cổ hai bên)
    3. Central square knot (nút thắt bẹt vuông vức đặc trưng)
    4. Two tapered hanging tails (hai dải khăn buông rủ có vát chéo)
    """
    mat = create_or_get_mat(f"M_Acc_Scarf_{char_id}", "#d92027", roughness=0.58)
    bm = bmesh.new()

    # -------------------------------------------------------------
    # 1. NECK WRAP & BACK TRIANGULAR CAPELET
    # -------------------------------------------------------------
    # Profile curve of neck wrap from front-left around back to front-right
    # Parameter t from -1 (front left) to 0 (back center) to +1 (front right)
    wrap_steps = 16
    wrap_verts_outer_top = []
    wrap_verts_outer_bot = []
    wrap_verts_inner_top = []
    wrap_verts_inner_bot = []

    # Center knot connection at front: x ~ 0, y ~ 0.088, z ~ 0.366
    # Neck sides: x ~ +-0.072, y ~ 0.015, z ~ 0.392
    # Back nape: x ~ 0, y ~ -0.068, z ~ 0.400, triangular tip extends down to z ~ 0.368
    for i in range(wrap_steps + 1):
        u = i / wrap_steps  # 0 to 1
        # Angle from front-left (around 65 deg) through back (270 deg) to front-right (115 deg)
        # In standard trig: front is +Y (90 deg), right is +X (0 deg), back is -Y (270 deg), left is -X (180 deg)
        # Left front ~ 80 deg, right front ~ 100 deg
        ang = math.radians(78 + u * (284))  # 78 deg to 362 deg (i.e. wrap around back)
        
        # Ellipse radii: collar is rx ~ 0.070, ry ~ 0.064
        # Scarf wrap sits just above collar
        cos_a = math.cos(ang)
        sin_a = math.sin(ang)

        rx = 0.074
        ry = 0.068
        cx = 0.0
        cy = 0.006

        x_mid = cx + rx * cos_a
        y_mid = cy + ry * sin_a

        # Base Z along the neck/collar slope
        # Back is slightly higher (0.402), sides (0.392), front (0.368)
        # sin_a is -1 at back, +1 at front
        z_base = 0.396 - 0.026 * sin_a

        # Scarf band height:
        # At back, triangle tip hangs down to z ~ 0.366 (when sin_a close to -1)
        back_factor = max(0.0, -sin_a)  # 1 at back, 0 at front/sides
        z_top = z_base + 0.010
        z_bot = z_base - 0.010 - (0.022 * (back_factor ** 2.0))

        # Radial thickness (offset outward by 0.003 for outer, inward for inner)
        thick = 0.0028
        dx = cos_a * thick
        dy = sin_a * thick

        # Generate 4 ring vertices (outer top, outer bot, inner bot, inner top)
        v_ot = bm.verts.new((x_mid + dx, y_mid + dy, z_top))
        v_ob = bm.verts.new((x_mid + dx, y_mid + dy, z_bot))
        v_ib = bm.verts.new((x_mid - dx, y_mid - dy, z_bot))
        v_it = bm.verts.new((x_mid - dx, y_mid - dy, z_top))

        wrap_verts_outer_top.append(v_ot)
        wrap_verts_outer_bot.append(v_ob)
        wrap_verts_inner_bot.append(v_ib)
        wrap_verts_inner_top.append(v_it)

    # Bridge neck wrap segments
    for i in range(wrap_steps):
        # Outer surface
        bm.faces.new([
            wrap_verts_outer_top[i], wrap_verts_outer_top[i+1],
            wrap_verts_outer_bot[i+1], wrap_verts_outer_bot[i]
        ])
        # Bottom edge
        bm.faces.new([
            wrap_verts_outer_bot[i], wrap_verts_outer_bot[i+1],
            wrap_verts_inner_bot[i+1], wrap_verts_inner_bot[i]
        ])
        # Inner surface
        bm.faces.new([
            wrap_verts_inner_bot[i], wrap_verts_inner_bot[i+1],
            wrap_verts_inner_top[i+1], wrap_verts_inner_top[i]
        ])
        # Top edge
        bm.faces.new([
            wrap_verts_inner_top[i], wrap_verts_inner_top[i+1],
            wrap_verts_outer_top[i+1], wrap_verts_outer_top[i]
        ])

    # Cap front ends of wrap
    bm.faces.new([
        wrap_verts_outer_top[0], wrap_verts_outer_bot[0],
        wrap_verts_inner_bot[0], wrap_verts_inner_top[0]
    ])
    bm.faces.new([
        wrap_verts_outer_top[-1], wrap_verts_inner_top[-1],
        wrap_verts_inner_bot[-1], wrap_verts_outer_bot[-1]
    ])

    # -------------------------------------------------------------
    # 2. CENTRAL SQUARE KNOT (NÚT THẮT KHĂN QUÀNG ĐỎ)
    # -------------------------------------------------------------
    # Sits at x=0, y=0.091, z=0.355
    # Dimensions: width 0.032, height 0.026, depth 0.018
    # Rounded stylized cushion with a center wrap strap
    kw = 0.017  # half-width
    kh = 0.014  # half-height
    kd = 0.009  # half-depth
    kx = 0.0
    ky = 0.092
    kz = 0.355

    # 2-ring knot body for soft bevel
    knot_rings = []
    for r_idx, (sz_w, sz_h, sz_d, dy_offset) in enumerate([
        (kw * 0.75, kh * 0.75, kd * 0.5, 0.005),   # front face ring
        (kw * 1.00, kh * 1.00, kd * 1.0, 0.000),   # mid perimeter ring
        (kw * 0.70, kh * 0.70, kd * 0.5, -0.005)   # back face ring
    ]):
        ring = [
            bm.verts.new((kx - sz_w, ky + dy_offset + sz_d, kz + sz_h)),
            bm.verts.new((kx + sz_w, ky + dy_offset + sz_d, kz + sz_h)),
            bm.verts.new((kx + sz_w, ky + dy_offset + sz_d, kz - sz_h)),
            bm.verts.new((kx - sz_w, ky + dy_offset + sz_d, kz - sz_h)),
        ]
        knot_rings.append(ring)

    # Bridge knot rings
    for r in range(len(knot_rings) - 1):
        for j in range(4):
            bm.faces.new([
                knot_rings[r][j], knot_rings[r][(j+1)%4],
                knot_rings[r+1][(j+1)%4], knot_rings[r+1][j]
            ])
    # Cap front and back of knot
    bm.faces.new([knot_rings[0][0], knot_rings[0][3], knot_rings[0][2], knot_rings[0][1]])
    bm.faces.new([knot_rings[-1][0], knot_rings[-1][1], knot_rings[-1][2], knot_rings[-1][3]])

    # Horizontal center belt wrap on the knot for authentic fabric knot look
    bw = 0.011
    bh = 0.006
    belt_ring_f = [
        bm.verts.new((kx - bw, ky + kd + 0.006, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.006, kz + bh)),
        bm.verts.new((kx + bw, ky + kd + 0.006, kz - bh)),
        bm.verts.new((kx - bw, ky + kd + 0.006, kz - bh)),
    ]
    bm.faces.new(belt_ring_f)

    # -------------------------------------------------------------
    # 3. TWO HANGING TAILS (HAI DẢI KHĂN BUÔNG RỦ)
    # -------------------------------------------------------------
    # Left Tail: length down to z ~ 0.282, angled tip
    # Right Tail: length down to z ~ 0.266, slightly longer, angled tip
    tail_configs = [
        {
            "name": "L",
            "side": -1,
            "root_x": -0.007,
            "root_y": 0.091,
            "root_z": 0.344,
            "tip_z_outer": 0.282,
            "tip_z_inner": 0.296,
            "drift_x": -0.010,
            "segs": 5
        },
        {
            "name": "R",
            "side": 1,
            "root_x": 0.007,
            "root_y": 0.090,
            "root_z": 0.344,
            "tip_z_outer": 0.266,
            "tip_z_inner": 0.280,
            "drift_x": 0.011,
            "segs": 5
        }
    ]

    for tc in tail_configs:
        side = tc["side"]
        n_seg = tc["segs"]
        root_x = tc["root_x"]
        root_y = tc["root_y"]
        root_z = tc["root_z"]
        tip_zo = tc["tip_z_outer"]
        tip_zi = tc["tip_z_inner"]
        avg_tip_z = (tip_zo + tip_zi) * 0.5
        total_len = root_z - avg_tip_z

        tail_rings_outer = []
        tail_rings_inner = []

        half_w_root = 0.009
        half_w_mid = 0.011
        thick = 0.0022

        for s in range(n_seg + 1):
            f = s / n_seg  # 0 at root, 1 at tip
            cur_z = root_z - f * total_len
            
            # Subtle outward flare and chest contour follow
            # Chest curve: convex around z=0.330
            y_curve = math.sin(f * math.pi * 0.7) * 0.003
            cur_y = root_y + y_curve - f * 0.004
            cur_cx = root_x + f * tc["drift_x"]

            # Width expands slightly then tapers
            cur_w = (1.0 - f) * half_w_root + f * half_w_mid
            if s == n_seg:
                # Angled cut at tip: outer corner is lower than inner corner
                z_outer = tip_zo
                z_inner = tip_zi
            else:
                z_outer = cur_z
                z_inner = cur_z

            # Outer (front) strip vertices
            v_fl = bm.verts.new((cur_cx - cur_w, cur_y + thick, z_outer if side < 0 else z_inner))
            v_fr = bm.verts.new((cur_cx + cur_w, cur_y + thick, z_inner if side < 0 else z_outer))
            # Inner (back) strip vertices
            v_br = bm.verts.new((cur_cx + cur_w, cur_y - thick, z_inner if side < 0 else z_outer))
            v_bl = bm.verts.new((cur_cx - cur_w, cur_y - thick, z_outer if side < 0 else z_inner))

            tail_rings_outer.append((v_fl, v_fr))
            tail_rings_inner.append((v_bl, v_br))

        # Bridge tail segments
        for s in range(n_seg):
            (f1_l, f1_r) = tail_rings_outer[s]
            (f2_l, f2_r) = tail_rings_outer[s+1]
            (b1_l, b1_r) = tail_rings_inner[s]
            (b2_l, b2_r) = tail_rings_inner[s+1]

            # Front face
            bm.faces.new([f1_l, f1_r, f2_r, f2_l])
            # Right edge
            bm.faces.new([f1_r, b1_r, b2_r, f2_r])
            # Back face
            bm.faces.new([b1_r, b1_l, b2_l, b2_r])
            # Left edge
            bm.faces.new([b1_l, f1_l, f2_l, b2_l])

        # Cap tip face
        (tf_l, tf_r) = tail_rings_outer[-1]
        (tb_l, tb_r) = tail_rings_inner[-1]
        bm.faces.new([tf_l, tf_r, tb_r, tb_l])

    # Recalculate face normals
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"Acc_Red_Scarf_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Acc_Red_Scarf", mesh)
    obj.data.materials.append(mat)
    
    # Subdivision surface for organic cloth curves
    sub = obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    
    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True

    # Link to scene
    bpy.context.scene.collection.objects.link(obj)

    # -------------------------------------------------------------
    # 4. SKINNING & VERTEX WEIGHTS (LIGHTWEIGHT BONE-BASED)
    # -------------------------------------------------------------
    vg_neck = obj.vertex_groups.new(name="Neck")
    vg_chest = obj.vertex_groups.new(name="Chest")
    vg_spine = obj.vertex_groups.new(name="Spine")

    for v in obj.data.vertices:
        z = v.co.z
        if z >= 0.380:
            # Neck wrap & back triangle
            vg_neck.add([v.index], 0.65, 'REPLACE')
            vg_chest.add([v.index], 0.35, 'REPLACE')
        elif z >= 0.340:
            # Central knot
            vg_chest.add([v.index], 0.90, 'REPLACE')
            vg_neck.add([v.index], 0.10, 'REPLACE')
        elif z >= 0.305:
            # Upper tails
            vg_chest.add([v.index], 0.85, 'REPLACE')
            vg_spine.add([v.index], 0.15, 'REPLACE')
        else:
            # Lower tails: blend into Spine for natural bending during bow & sit
            vg_chest.add([v.index], 0.65, 'REPLACE')
            vg_spine.add([v.index], 0.35, 'REPLACE')

    m_arm = obj.modifiers.new("Armature", 'ARMATURE')
    m_arm.object = arm

    return obj

# Load base & equip school uniform
factory = CharacterFactory(CANONICAL_BLEND)
factory.load_base()
factory.isolate_materials("scarf_test")
clothing_spec = {
    "top_id": "TOP_001",
    "bottom_id": "BOTTOM_001",
    "footwear_id": "FOOTWEAR_001",
    "socks_id": "SOCKS_001"
}
factory.equip_modular_clothing(clothing_spec, "#f4cfae", "scarf_test")
factory.setup_facial_system("Happy", "scarf_test")

# Build new scarf
scarf = create_stylized_red_scarf(factory.arm, "scarf_test")

# Render test
scene = bpy.context.scene
cam_data = bpy.data.cameras.new("Test_Cam")
cam_data.lens = 50
cam = bpy.data.objects.new("Test_Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (0.0, 1.35, 0.36)
cam.rotation_euler = (math.radians(90), 0, math.radians(180))

# 4-point lights
def add_sun(name, energy, rot_deg):
    l = bpy.data.lights.new(name, "SUN")
    l.energy = energy
    obj = bpy.data.objects.new(name, l)
    scene.collection.objects.link(obj)
    obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))

add_sun("Key", 5.0, (52, 18, -35))
add_sun("Fill", 2.5, (38, -25, 140))
add_sun("Bounce", 2.0, (-40, 15, 25))
add_sun("Rim", 3.5, (25, 10, 30))

scene.render.resolution_x = 420
scene.render.resolution_y = 560
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = TEST_OUT
bpy.ops.render.render(write_still=True)
print(f"Scarf test rendered to: {TEST_OUT}")
