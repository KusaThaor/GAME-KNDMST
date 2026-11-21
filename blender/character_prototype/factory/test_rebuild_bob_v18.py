"""
HAIR_003 V18 Rebuild — Pure Visual Reference Match.
Constructs a unified, soft chibi bob directly matching the 4-panel target:
- Completely enclosed, continuous head volume from crown to chin.
- Forehead fringe lying close to the forehead skull curvature (no shelf/visor).
- Broad, soft overlapping fringe locks with gently tapered wedge tips.
- Seamless temple flow into cheek-framing locks curling inward under the chin.
- Soft rounded rear bob volume with 4 subtle directional lobes.
- Full head and shoulders framing with generous margin (no cropping).
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
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v18_review")
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

def build_bob_v18(arm, char_id):
    """
    Constructs the V18 Chibi Bob as a unified, cohesive hair volume.
    """
    bm = bmesh.new()

    cranial_center = Vector((0.0, -0.010, 0.528))
    center_y = -0.010
    center_z = 0.528

    # =========================================================================
    # 1. PRIMARY CONTINUOUS BOB MASS (Crown, Forehead, Sides, and Rear)
    # =========================================================================
    # A single, fully enclosed, seamless quad mesh covering the skull.
    # Polar angles:
    # - Apex at crown: (0.0, -0.010, 0.672)
    # - Radii: Rx = 0.186, Ry = 0.178, Rz = 0.166
    # - Covers all azimuth angles u in [0, 2pi].
    # - Around the face opening:
    #   * Across forehead: descends to Z ~ 0.565m, hugging forehead at offset 5mm.
    #   * Around cheeks: descends to Z ~ 0.422m, curving inward towards jaw.
    #   * Across rear: descends to Z ~ 0.418m, with 4 subtle lobes and inward nape tuck.

    num_rings = 26
    segs = 48
    bob_grid = []

    for r in range(num_rings):
        v = (r + 1) / float(num_rings)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            # Determine whether this column is in the front face opening
            # cos_u > 0.40 corresponds to the forehead and face opening
            is_front = (cos_u > 0.38)
            is_cheek = (abs(sin_u) > 0.65 and cos_u > -0.10 and cos_u <= 0.38)

            if is_front:
                # Forehead region: descends smoothly from crown to fringe root base (Z ~ 0.565m)
                # Max polar angle stops at brow level
                max_phi = math.radians(72.0)
                phi = v * max_phi
                # Small forward puff following forehead curve
                puff = 0.006 + 0.003 * math.sin(v * math.pi)
                px = (0.180 + puff) * math.sin(phi) * sin_u
                py = (0.174 + puff) * math.sin(phi) * cos_u + center_y
                pz = center_z + (0.166 + puff) * math.cos(phi)
                # Ensure it stays close to the forehead (no shelf)
                if pz < 0.600:
                    py = min(py, 0.166)
            else:
                # Sides & Rear: flows all the way down to chin/nape level
                target_edge_z = 0.420 + 0.005 * math.cos(u * 4.0)

                if v < 0.35:
                    phi = (v / 0.35) * math.radians(88.0)
                    puff = 0.008 + 0.004 * math.sin(v * math.pi * 2.5)
                    px = (0.186 + puff) * math.sin(phi) * sin_u
                    py = (0.178 + puff) * math.sin(phi) * cos_u + center_y
                    pz = center_z + (0.166 + puff) * math.cos(phi)
                else:
                    fac = (v - 0.35) / 0.65
                    phi = math.radians(88.0)
                    base_pz = center_z + 0.166 * math.cos(phi)
                    pz = base_pz + fac * (target_edge_z - base_pz)

                    # 4 subtle directional lobes across the rear
                    rear_fac = max(0.0, -cos_u)
                    lobes = 0.006 * (math.cos(4.0 * u) + 0.25 * math.cos(2.0 * u)) * rear_fac
                    puff = 0.008 + lobes + 0.004 * math.sin(fac * math.pi)

                    # Inward cupping curl around neck and lower jaw
                    tuck = fac * fac
                    tuck_y = 0.018 * tuck * rear_fac
                    tuck_x = -math.copysign(0.015 * tuck * (1.0 - rear_fac), sin_u)

                    px = (0.186 + puff) * math.sin(phi) * sin_u + tuck_x
                    py = (0.178 + puff) * math.sin(phi) * cos_u + center_y + tuck_y

            # Ear clearance on lateral sides
            if abs(cos_u) < 0.20 and 0.40 < v < 0.85:
                px = math.copysign(max(abs(px), 0.188), px)

            row.append(bm.verts.new(Vector((px, py, pz))))
        bob_grid.append(row)

    # Crown apex vertex
    apex_v = bm.verts.new(Vector((0.0, center_y, center_z + 0.176)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex_v, bob_grid[0][s], bob_grid[0][sn]))

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((bob_grid[r][s], bob_grid[r][sn], bob_grid[r+1][sn], bob_grid[r+1][s]))

    # Inward rolled hem at the bottom rim to give solid physical thickness
    bottom_outer = bob_grid[-1]
    bottom_inner = []
    for s in range(segs):
        vo = bottom_outer[s]
        cos_u = math.cos(2.0 * math.pi * s / segs)
        if cos_u <= 0.38:
            # Under-curl inward toward neck
            p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.016 + Vector((0, 0, 0.006))
        else:
            # Forehead inner lip
            p_in = vo.co + Vector((0, -0.008, 0.003))
        bottom_inner.append(bm.verts.new(p_in))

    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((bottom_outer[s], bottom_outer[sn], bottom_inner[sn], bottom_inner[s]))

    # =========================================================================
    # 2. SOFT SCULPTED FRINGE LOCKS (Overlapping, Tapered, Close to Forehead)
    # =========================================================================
    # 5 broad, flattened locks lying close against the forehead skull curvature.
    # Roots start high on the crown (Z ~ 0.640m, Y ~ 0.090m) and disappear smoothly into the hair.
    # In profile, they follow the curved forehead: Y(Z) ~ Y_forehead + 5mm.

    def add_flat_tapered_lock(bm, spine_pts, width_prof, thick_prof, n_rows=12, n_cols=5, curl_dir=(0,0,0)):
        """
        Extrudes a broad, flat, soft hair lock along a spine with tapered wedge tip.
        """
        pts_spine = [Vector(p) for p in spine_pts]
        v_outer = []
        v_inner = []

        for r in range(n_rows):
            t = r / float(n_rows - 1)
            pos = eval_spline(pts_spine, t)
            w = width_prof[0] * (1.0 - t) + width_prof[1] * t
            th = thick_prof[0] * (1.0 - t) + thick_prof[1] * t

            # Tangent down spine
            if r < n_rows - 1:
                t_next = min(1.0, t + 0.05)
                pos_next = eval_spline(pts_spine, t_next)
                tangent = (pos_next - pos).normalized()
            else:
                tangent = Vector((0, 0, -1))

            # Normal pointing out from cranial center
            normal = (pos - cranial_center).normalized()
            # Binormal lateral across the lock
            binormal = tangent.cross(normal).normalized()

            # Tip inward curl
            if t > 0.60:
                curl_factor = (t - 0.60) / 0.40
                pos += Vector(curl_dir) * curl_factor * curl_factor

            row_o = []
            row_i = []
            for c in range(n_cols):
                u = (c / float(n_cols - 1)) * 2.0 - 1.0 # -1 to +1
                # Cross-section cupping: soft convex curve across width
                cupping = (1.0 - u * u) * 0.002
                p_o = pos + binormal * (u * 0.5 * w) + normal * cupping
                p_i = p_o - normal * th
                row_o.append(bm.verts.new(p_o))
                row_i.append(bm.verts.new(p_i))

            v_outer.append(row_o)
            v_inner.append(row_i)

        # Outer & Inner faces
        for r in range(n_rows - 1):
            for c in range(n_cols - 1):
                bm.faces.new((v_outer[r][c], v_outer[r+1][c], v_outer[r+1][c+1], v_outer[r][c+1]))
                bm.faces.new((v_inner[r][c+1], v_inner[r+1][c+1], v_inner[r+1][c], v_inner[r][c]))

        # Tip cap (tapered wedge finish)
        r_tip = n_rows - 1
        for c in range(n_cols - 1):
            bm.faces.new((v_outer[r_tip][c], v_outer[r_tip][c+1], v_inner[r_tip][c+1], v_inner[r_tip][c]))

        # Side edge walls
        for r in range(n_rows - 1):
            bm.faces.new((v_outer[r+1][0], v_outer[r][0], v_inner[r][0], v_inner[r+1][0]))
            bm.faces.new((v_outer[r][n_cols-1], v_outer[r+1][n_cols-1], v_inner[r+1][n_cols-1], v_inner[r][n_cols-1]))

    fringe_specs = [
        # 1. Right-center main broad lock (viewer left-center)
        # Sweeps gently toward center, tip at Z ~ 0.552m
        {
            "spine": [
                (0.045, 0.095, 0.645),
                (0.046, 0.130, 0.615),
                (0.044, 0.156, 0.580),
                (0.038, 0.165, 0.552)
            ],
            "w": (0.030, 0.024), "th": (0.006, 0.004), "curl": (-0.004, -0.005, 0.002)
        },
        # 2. Center soft wedge lock (slightly shorter, leaving brow/eyes framed)
        {
            "spine": [
                (0.004, 0.105, 0.648),
                (0.006, 0.136, 0.618),
                (0.008, 0.160, 0.588),
                (0.010, 0.166, 0.565)
            ],
            "w": (0.024, 0.016), "th": (0.005, 0.004), "curl": (0.000, -0.004, 0.001)
        },
        # 3. Left-center main broad lock (viewer right-center)
        # Sweeps gently toward left-center, tip at Z ~ 0.550m
        {
            "spine": [
                (-0.042, 0.095, 0.645),
                (-0.044, 0.130, 0.615),
                (-0.046, 0.156, 0.580),
                (-0.048, 0.165, 0.550)
            ],
            "w": (0.030, 0.024), "th": (0.006, 0.004), "curl": (0.004, -0.005, 0.002)
        },
        # 4. Right temple transition lock
        {
            "spine": [
                (0.088, 0.085, 0.638),
                (0.098, 0.118, 0.605),
                (0.108, 0.142, 0.572),
                (0.112, 0.150, 0.556)
            ],
            "w": (0.028, 0.020), "th": (0.006, 0.004), "curl": (0.004, -0.005, 0.002)
        },
        # 5. Left temple transition lock
        {
            "spine": [
                (-0.088, 0.085, 0.638),
                (-0.098, 0.118, 0.605),
                (-0.108, 0.142, 0.572),
                (-0.112, 0.150, 0.556)
            ],
            "w": (0.028, 0.020), "th": (0.006, 0.004), "curl": (-0.004, -0.005, 0.002)
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
    # Broad face-framing sections that flow seamlessly alongside the cheeks,
    # cupping the chin/jawline at Z ~ 0.422m.
    side_specs = [
        # Right cheek lock (+X)
        {
            "spine": [
                (0.118, 0.075, 0.632),
                (0.148, 0.070, 0.565),
                (0.158, 0.068, 0.495),
                (0.146, 0.075, 0.422)
            ],
            "w": (0.032, 0.022), "th": (0.010, 0.006), "curl": (-0.012, 0.008, 0.004)
        },
        # Left cheek lock (-X)
        {
            "spine": [
                (-0.118, 0.075, 0.632),
                (-0.148, 0.070, 0.565),
                (-0.158, 0.068, 0.495),
                (-0.146, 0.075, 0.422)
            ],
            "w": (0.032, 0.022), "th": (0.010, 0.006), "curl": (0.012, 0.008, 0.004)
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

    # Single calibrated satin-matte hair material
    mat = bpy.data.materials.new(f"M_Hair_{char_id}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        # Soft warm brown matching the target reference (#3c2d27)
        bsdf.inputs["Base Color"].default_value = (0.052, 0.032, 0.024, 1.0)
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

def setup_chibi_studio_framed(scene, res=(1024, 1024)):
    """
    Sets up studio lighting and camera with generous margin framing
    (full head and shoulders clearly visible without ANY cropping).
    """
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Review_Cam")
    cam_data.lens = 68 # 68mm lens
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
    bg.inputs["Color"].default_value = (0.85, 0.85, 0.86, 1.0)
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
    print("RUNNING HAIR_003 V18 PURE VISUAL REFERENCE REBUILD")
    print("=======================================================")

    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "female_v18_hair_003"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)

    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)

    hair_obj = build_bob_v18(factory.arm, char_tag)
    print(f"[Built V18 Bob] {hair_obj.name}: {len(hair_obj.data.polygons)} quads, {len(hair_obj.data.vertices)} vertices")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag) # No glasses or extra accessories

    scene = bpy.context.scene
    cam = setup_chibi_studio_framed(scene, res=(1024, 1024))

    # Generous margin camera setups (Distance ~0.88m, lens 68mm)
    # Head apex at Z ~ 0.675m, collar at Z ~ 0.350m. Center at Z = 0.515m.
    views = [
        ("front", (0.0, 0.88, 0.515), (math.radians(90), 0, math.radians(180))),
        ("three_quarter", (0.62, 0.62, 0.525), (math.radians(82), 0, math.radians(135))),
        ("profile", (0.88, 0.0, 0.515), (math.radians(90), 0, math.radians(90))),
        ("rear", (0.0, -0.88, 0.515), (math.radians(90), 0, 0)),
    ]

    for vname, loc, rot in views:
        cam.location = loc
        cam.rotation_euler = rot
        out_name = f"hair_003_v18_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered V18 View] -> {out_name}")

    # Save WIP .blend
    blend_path = os.path.join(BLEND_DIR, "hair_003_v18_wip.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    shutil.copyfile(blend_path, os.path.join(PREVIEWS_DIR, "hair_003_v18_wip.blend"))
    print(f"[Saved WIP Blend] -> {blend_path}")
