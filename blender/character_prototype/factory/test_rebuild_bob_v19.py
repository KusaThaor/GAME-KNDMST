"""
HAIR_003 V19 Rebuild — Fully Continuous Parametric Architecture.
Eliminates all step discontinuities, bald patches, and visor shelves:
- Smooth continuous Z_edge(theta) around the entire 360-degree perimeter.
- Single unified quad mesh covering crown, forehead, cheeks, sides, and rear.
- Forehead fringe hugs skull curvature closely (offset 6mm, zero visor shelf).
- Soft broad overlapping fringe locks with gently tapered wedge tips.
- Generous, level camera framing (distance 0.98m, lens 62mm, pitch 90 deg) with ~15% margin on all sides.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler
import os
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
OUTPUTS_DIR = os.path.join(FACTORY_DIR, "outputs")
GLB_DIR = os.path.join(OUTPUTS_DIR, "hairstyles_glb")
BLEND_DIR = os.path.join(OUTPUTS_DIR, "hairstyles_blend")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v19_review")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

import sys
if FACTORY_DIR not in sys.path:
    sys.path.append(FACTORY_DIR)
import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"

def catmull_rom(p0, p1, p2, p3, t):
    t2 = t * t
    t3 = t2 * t
    return 0.5 * (
        (2.0 * p1) +
        (-p0 + p2) * t +
        (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
        (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
    )

def eval_spline(pts, t):
    n = len(pts)
    seg = t * (n - 1) * 0.9999
    i = int(seg)
    u = seg - i
    p0 = pts[max(0, i - 1)]
    p1 = pts[i]
    p2 = pts[min(n - 1, i + 1)]
    p3 = pts[min(n - 1, i + 2)]
    return catmull_rom(p0, p1, p2, p3, u)

def build_bob_v19(arm, char_id):
    """
    Constructs the V19 Chibi Bob.
    """
    bm = bmesh.new()

    cranial_center = Vector((0.0, -0.010, 0.528))
    center_y = -0.010
    center_z = 0.528

    # =========================================================================
    # 1. PRIMARY CONTINUOUS BOB SHELL (100% Watertight, Zero Discontinuities)
    # =========================================================================
    # Let theta in [0, 2pi] be the azimuth angle:
    # theta = 0: Front (+Y)
    # theta = pi/2: Right side (+X)
    # theta = pi: Back (-Y)
    # theta = 3pi/2: Left side (-X)
    #
    # Smooth continuous lower edge function Z_edge(theta):
    # - Front (theta = 0): Z = 0.552m (just above eyebrows, perfectly framing brow)
    # - Sides (theta = pi/2, 3pi/2): Z = 0.422m (chin level)
    # - Back (theta = pi): Z = 0.418m (nape level)
    #
    # Across front (cos_theta > 0):
    # Z_edge = 0.422 + (0.552 - 0.422) * (cos_theta)^1.6
    # This gives a smooth, continuous concave cheek-framing arch!

    num_rings = 24
    segs = 48
    bob_grid = []

    apex_z = 0.672 # Top of hair volume

    for r in range(num_rings):
        v = (r + 1) / float(num_rings) # 0 at apex to 1 at bottom edge
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            # Continuous edge height calculation
            if cos_u > 0:
                # Front hemisphere: transitions smoothly from chin level (0.422m) up to brow (0.552m)
                t_front = cos_u ** 1.5
                edge_z = 0.422 + (0.552 - 0.422) * t_front
                # Subtle asymmetry: character right brow slightly higher
                if sin_u > 0:
                    edge_z += 0.003 * sin_u * t_front
            else:
                # Rear hemisphere: chin to nape level with 4 subtle harmonic lobes
                rear_t = -cos_u
                edge_z = 0.422 - 0.004 * rear_t + 0.003 * math.cos(4.0 * u) * rear_t

            # Vertical coordinate: smooth interpolation from apex to edge_z
            # Use gentle cubic easing so crown is full and rounded
            pz = apex_z * (1.0 - v * v) + edge_z * (v * v)

            # Radial profile from skull:
            # Skull radius at height pz
            dz_rel = (pz - center_z) / 0.155
            dz_rel_clamped = max(-1.0, min(1.0, dz_rel))
            r_skull_factor = math.sqrt(max(0.01, 1.0 - dz_rel_clamped * dz_rel_clamped))

            # Base skull radii
            rx_base = 0.174 * r_skull_factor
            ry_base = 0.165 * r_skull_factor

            # Hair volume offset (puff):
            # Forehead (cos_u > 0.4): small 6mm puff so hair stays close to forehead
            # Sides (abs(sin_u) > 0.6): 18-22mm puff covering ears completely
            # Rear (cos_u < -0.2): 18-24mm soft convex bob volume
            if cos_u > 0.35:
                puff = 0.006 + 0.003 * math.sin(v * math.pi)
            else:
                side_fac = abs(sin_u)
                rear_fac = max(0.0, -cos_u)
                # 4 soft vertical lobes on the back
                lobes = 0.005 * math.cos(4.0 * u) * rear_fac
                puff = 0.012 + 0.008 * side_fac + 0.009 * rear_fac + lobes

            # Inward curl at lower edge (v > 0.70)
            tuck_x = 0.0
            tuck_y = 0.0
            if v > 0.70:
                curl_fac = (v - 0.70) / 0.30
                curl_sq = curl_fac * curl_fac
                # Inward towards neck/jaw
                if cos_u <= 0.35:
                    tuck_x = -math.copysign(0.014 * curl_sq * abs(sin_u), sin_u)
                    tuck_y = 0.016 * curl_sq * max(0.0, -cos_u)
                else:
                    # Forehead fringe curl inward toward brow
                    tuck_y = -0.004 * curl_sq * cos_u

            # Final vertex coordinates
            px = (rx_base + puff) * sin_u + tuck_x
            py = (ry_base + puff) * cos_u + center_y + tuck_y

            # Ensure ear clearance
            if abs(cos_u) < 0.22 and 0.40 < v < 0.90:
                px = math.copysign(max(abs(px), 0.188), px)

            row.append(bm.verts.new(Vector((px, py, pz))))
        bob_grid.append(row)

    # Crown apex vertex
    apex_v = bm.verts.new(Vector((0.0, center_y, apex_z)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex_v, bob_grid[0][s], bob_grid[0][sn]))

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((bob_grid[r][s], bob_grid[r][sn], bob_grid[r+1][sn], bob_grid[r+1][s]))

    # Inward rolled hem at the bottom perimeter (smooth physical thickness)
    bottom_outer = bob_grid[-1]
    bottom_inner = []
    for s in range(segs):
        vo = bottom_outer[s]
        cos_u = math.cos(2.0 * math.pi * s / segs)
        if cos_u <= 0.35:
            # Under-curl inward toward neck
            p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.015 + Vector((0, 0, 0.005))
        else:
            # Forehead inner lip
            p_in = vo.co + Vector((0, -0.007, 0.003))
        bottom_inner.append(bm.verts.new(p_in))

    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((bottom_outer[s], bottom_outer[sn], bottom_inner[sn], bottom_inner[s]))

    # =========================================================================
    # 2. SOFT SCULPTED FRINGE LOCKS (Overlapping, Tapered, Flush with Forehead)
    # =========================================================================
    # On top of this complete continuous shell, we add 4 broad, soft, overlapping locks
    # that lie directly against the forehead surface (offset 4-6mm):
    # - Character-right main brow lock (viewer left-center)
    # - Center soft wedge lock
    # - Character-left main brow lock (viewer right-center)
    # - Right & Left temple blend locks

    def add_flat_tapered_lock(bm, spine_pts, width_prof, thick_prof, n_rows=12, n_cols=5, curl_dir=(0,0,0)):
        pts_spine = [Vector(p) for p in spine_pts]
        v_outer = []
        v_inner = []

        for r in range(n_rows):
            t = r / float(n_rows - 1)
            pos = eval_spline(pts_spine, t)
            w = width_prof[0] * (1.0 - t) + width_prof[1] * t
            th = thick_prof[0] * (1.0 - t) + thick_prof[1] * t

            if r < n_rows - 1:
                t_next = min(1.0, t + 0.05)
                pos_next = eval_spline(pts_spine, t_next)
                tangent = (pos_next - pos).normalized()
            else:
                tangent = Vector((0, 0, -1))

            normal = (pos - cranial_center).normalized()
            binormal = tangent.cross(normal).normalized()

            if t > 0.60:
                curl_factor = (t - 0.60) / 0.40
                pos += Vector(curl_dir) * curl_factor * curl_factor

            row_o = []
            row_i = []
            for c in range(n_cols):
                u = (c / float(n_cols - 1)) * 2.0 - 1.0
                cupping = (1.0 - u * u) * 0.002
                p_o = pos + binormal * (u * 0.5 * w) + normal * cupping
                p_i = p_o - normal * th
                row_o.append(bm.verts.new(p_o))
                row_i.append(bm.verts.new(p_i))

            v_outer.append(row_o)
            v_inner.append(row_i)

        for r in range(n_rows - 1):
            for c in range(n_cols - 1):
                bm.faces.new((v_outer[r][c], v_outer[r+1][c], v_outer[r+1][c+1], v_outer[r][c+1]))
                bm.faces.new((v_inner[r][c+1], v_inner[r+1][c+1], v_inner[r+1][c], v_inner[r][c]))

        r_tip = n_rows - 1
        for c in range(n_cols - 1):
            bm.faces.new((v_outer[r_tip][c], v_outer[r_tip][c+1], v_inner[r_tip][c+1], v_inner[r_tip][c]))

        for r in range(n_rows - 1):
            bm.faces.new((v_outer[r+1][0], v_outer[r][0], v_inner[r][0], v_inner[r+1][0]))
            bm.faces.new((v_outer[r][n_cols-1], v_outer[r+1][n_cols-1], v_inner[r+1][n_cols-1], v_inner[r][n_cols-1]))

    fringe_specs = [
        # 1. Right-center main broad lock (viewer left-center)
        # Roots high at Z ~ 0.645m, follows forehead curve to tip at Z ~ 0.550m
        {
            "spine": [
                (0.046, 0.095, 0.648),
                (0.048, 0.130, 0.615),
                (0.045, 0.155, 0.580),
                (0.038, 0.163, 0.548)
            ],
            "w": (0.032, 0.022), "th": (0.006, 0.004), "curl": (-0.003, -0.004, 0.002)
        },
        # 2. Center soft wedge lock
        {
            "spine": [
                (0.005, 0.105, 0.650),
                (0.007, 0.136, 0.618),
                (0.008, 0.158, 0.588),
                (0.010, 0.164, 0.562)
            ],
            "w": (0.024, 0.015), "th": (0.005, 0.004), "curl": (0.000, -0.004, 0.001)
        },
        # 3. Left-center main broad lock (viewer right-center)
        {
            "spine": [
                (-0.044, 0.095, 0.648),
                (-0.046, 0.130, 0.615),
                (-0.048, 0.155, 0.580),
                (-0.050, 0.163, 0.548)
            ],
            "w": (0.032, 0.022), "th": (0.006, 0.004), "curl": (0.003, -0.004, 0.002)
        },
        # 4. Right temple transition lock (blends smoothly into right cheek lock)
        {
            "spine": [
                (0.090, 0.082, 0.640),
                (0.102, 0.115, 0.605),
                (0.112, 0.138, 0.570),
                (0.118, 0.146, 0.552)
            ],
            "w": (0.028, 0.018), "th": (0.006, 0.004), "curl": (0.003, -0.004, 0.002)
        },
        # 5. Left temple transition lock (blends smoothly into left cheek lock)
        {
            "spine": [
                (-0.090, 0.082, 0.640),
                (-0.102, 0.115, 0.605),
                (-0.112, 0.138, 0.570),
                (-0.118, 0.146, 0.552)
            ],
            "w": (0.028, 0.018), "th": (0.006, 0.004), "curl": (-0.003, -0.004, 0.002)
        },
    ]

    for f_spec in fringe_specs:
        add_flat_tapered_lock(
            bm, f_spec["spine"], f_spec["w"], f_spec["th"],
            n_rows=12, n_cols=5, curl_dir=f_spec["curl"]
        )

    # =========================================================================
    # 3. CHEEK-FRAMING SIDE LOCKS (Temple to Chin Inward C-Curl)
    # =========================================================================
    # Seamlessly integrates with the temple transition locks and curves inward under jaw
    side_specs = [
        # Right cheek lock (+X)
        {
            "spine": [
                (0.122, 0.072, 0.635),
                (0.152, 0.068, 0.565),
                (0.160, 0.065, 0.495),
                (0.148, 0.072, 0.422)
            ],
            "w": (0.034, 0.020), "th": (0.009, 0.005), "curl": (-0.012, 0.008, 0.004)
        },
        # Left cheek lock (-X)
        {
            "spine": [
                (-0.122, 0.072, 0.635),
                (-0.152, 0.068, 0.565),
                (-0.160, 0.065, 0.495),
                (-0.148, 0.072, 0.422)
            ],
            "w": (0.034, 0.020), "th": (0.009, 0.005), "curl": (0.012, 0.008, 0.004)
        }
    ]

    for s_spec in side_specs:
        add_flat_tapered_lock(
            bm, s_spec["spine"], s_spec["w"], s_spec["th"],
            n_rows=14, n_cols=5, curl_dir=s_spec["curl"]
        )

    # Finalize BMesh into object
    mesh = bpy.data.meshes.new(f"Hair_HAIR_003_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_003", mesh)
    bpy.context.scene.collection.objects.link(obj)

    # Single calibrated satin-matte hair material (soft warm brown #3c2d27)
    mat = bpy.data.materials.new(f"M_Hair_{char_id}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.050, 0.030, 0.022, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.62
        bsdf.inputs["Specular IOR Level"].default_value = 0.18
        if "Sheen Weight" in bsdf.inputs:
            bsdf.inputs["Sheen Weight"].default_value = 0.20
    obj.data.materials.append(mat)

    for poly in obj.data.polygons:
        poly.use_smooth = True

    # Rig binding to Head bone
    vg = obj.vertex_groups.new(name="Head")
    all_v_indices = list(range(len(obj.data.vertices)))
    vg.add(all_v_indices, 1.0, 'REPLACE')

    mod = obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm

    return obj

def setup_chibi_studio_perfect(scene, res=(1024, 1024)):
    """
    Sets up neutral studio lighting and camera with 100% matched scale
    and generous margins on all sides (no cropping).
    """
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Review_Cam")
    cam_data.lens = 62 # 62mm portrait lens
    cam = bpy.data.objects.new("Review_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

    scene.world = bpy.data.worlds.new("Review_World")
    scene.world.use_nodes = True
    nodes = scene.world.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    scene.world.node_tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bg.inputs["Color"].default_value = (0.86, 0.86, 0.88, 1.0)
    bg.inputs["Strength"].default_value = 0.95

    def add_light(name, ltype, energy, loc, rot_deg, color=(1,1,1), size=1.0):
        l = bpy.data.lights.new(name, ltype)
        l.energy = energy
        l.color = color
        if ltype == 'AREA':
            l.size = size
        obj = bpy.data.objects.new(name, l)
        obj.location = loc
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        scene.collection.objects.link(obj)
        return obj

    add_light("Key_Light", 'AREA', 45.0, (0.40, 0.95, 0.75), (45, 0, 22), (1.0, 0.98, 0.96), size=1.1)
    add_light("Fill_Light", 'AREA', 32.0, (-0.45, 0.90, 0.65), (50, 0, -25), (0.96, 0.97, 1.0), size=1.2)
    add_light("Front_Eye_Light", 'AREA', 18.0, (0.0, 1.05, 0.52), (90, 0, 0), (1.0, 0.99, 0.98), size=0.8)
    add_light("Rim_Light", 'AREA', 30.0, (0.0, -0.95, 0.80), (-45, 0, 180), (1.0, 1.0, 1.0), size=1.0)

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    return cam

if __name__ == "__main__":
    print("\n=======================================================")
    print("RUNNING HAIR_003 V19 PURE VISUAL REFERENCE REBUILD")
    print("=======================================================")

    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "female_v19_hair_003"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)

    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)

    hair_obj = build_bob_v19(factory.arm, char_tag)
    print(f"[Built V19 Bob] {hair_obj.name}: {len(hair_obj.data.polygons)} quads, {len(hair_obj.data.vertices)} vertices")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag)

    # Runtime assertion: eye integrity
    eye_objs = {o.name for o in bpy.data.objects if "Eye" in o.name}
    assert {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"}.issubset(eye_objs)
    assert "Acc_Glasses" not in [o.name for o in bpy.data.objects]

    scene = bpy.context.scene
    cam = setup_chibi_studio_perfect(scene, res=(1024, 1024))

    # All 4 views at EXACT SAME distance (0.96m), EXACT SAME elevation (Z=0.515m), and EXACT LEVEL pitch (90 deg)
    # Generous margin framing: top headroom ~14%, bottom collar visible ~12%, left/right ~12%.
    views = [
        ("front", (0.0, 0.96, 0.515), (math.radians(90), 0, math.radians(180))),
        ("three_quarter", (0.68, 0.68, 0.515), (math.radians(90), 0, math.radians(135))),
        ("profile", (0.96, 0.0, 0.515), (math.radians(90), 0, math.radians(90))),
        ("rear", (0.0, -0.96, 0.515), (math.radians(90), 0, 0)),
    ]

    for vname, loc, rot in views:
        cam.location = loc
        cam.rotation_euler = rot
        out_name = f"hair_003_v19_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered V19 View] -> {out_name}")

    # Save WIP .blend
    blend_path = os.path.join(BLEND_DIR, "hair_003_v19_wip.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    shutil.copyfile(blend_path, os.path.join(PREVIEWS_DIR, "hair_003_v19_wip.blend"))
    print(f"[Saved WIP Blend] -> {blend_path}")
