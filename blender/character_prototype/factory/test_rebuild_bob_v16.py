"""
Full builder and visual review generator for HAIR_003 (Chin-Length Rounded Bob) V16.
Creates:
- HAIR_003 with the 5 modular components.
- Diagnostic view with 4 distinct component materials.
- Production view with calibrated satin-matte hair shader.
- Turnaround renders (Front, Left 3/4, Right 3/4, Profile Left, Profile Right, Rear).
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
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v16_review")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

import sys
if FACTORY_DIR not in sys.path:
    sys.path.append(FACTORY_DIR)
import character_factory

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

def catmull_rom_spline(control_points, samples_per_segment=6):
    n = len(control_points)
    if n < 2:
        return [(Vector(p), 0.0) for p in control_points]
    pts = [Vector(control_points[0])] + [Vector(p) for p in control_points] + [Vector(control_points[-1])]
    result = []
    total_segments = n - 1
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i-1], pts[i], pts[i+1], pts[i+2]
        for s in range(samples_per_segment):
            t = s / float(samples_per_segment)
            seg_idx = i - 1
            global_u = (seg_idx + t) / float(total_segments)
            t2 = t * t
            t3 = t2 * t
            pos = 0.5 * (
                (2.0 * p1) +
                (-p0 + p2) * t +
                (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
                (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
            )
            result.append((pos, global_u))
    result.append((Vector(control_points[-1]), 1.0))
    return result

def add_ribbon_lock(bm, control_points, width_prof, thick_prof, cranial_center=Vector((0.0, -0.010, 0.528)), samples=20, n_pts=10, mat_idx=0, cupping_bias=0.0):
    spline_data = catmull_rom_spline(control_points, samples_per_segment=max(4, samples // max(1, len(control_points) - 1)))
    num_pts = len(spline_data)
    w_start, w_mid, w_end = width_prof
    th_start, th_mid, th_end = thick_prof

    tangents = []
    for i in range(num_pts):
        if i == 0:
            t = (spline_data[1][0] - spline_data[0][0]).normalized()
        elif i == num_pts - 1:
            t = (spline_data[-1][0] - spline_data[-2][0]).normalized()
        else:
            t = (spline_data[i + 1][0] - spline_data[i - 1][0]).normalized()
        tangents.append(t)

    ring_verts = []
    for i, (pt, u) in enumerate(spline_data):
        if u < 0.35:
            fac = u / 0.35
            w = w_start + (w_mid - w_start) * (fac ** 0.8)
            th = th_start + (th_mid - th_start) * (fac ** 0.8)
        elif u < 0.70:
            w = w_mid
            th = th_mid
        else:
            fac = (u - 0.70) / 0.30
            w = w_mid + (w_end - w_mid) * (fac ** 1.15)
            th = th_mid + (th_end - th_mid) * (fac ** 1.15)

        tang = tangents[i]
        outward = (pt - cranial_center).normalized()
        n_dir = (outward - tang * tang.dot(outward)).normalized()
        if cupping_bias != 0.0:
            # inward cupping toward forehead or jaw
            n_dir = (n_dir + Vector((0, 0, cupping_bias * u))).normalized()
        b_dir = tang.cross(n_dir).normalized()

        ring = []
        for k in range(n_pts):
            theta = 2.0 * math.pi * k / float(n_pts)
            cos_t, sin_t = math.cos(theta), math.sin(theta)
            # Flattened cushion profile
            offset = b_dir * (w * 0.5 * cos_t) + n_dir * (th * 0.5 * sin_t)
            offset += n_dir * (th * 0.18 * (1.0 - cos_t * cos_t))
            v = bm.verts.new(pt + offset)
            ring.append(v)
        ring_verts.append(ring)

    for i in range(num_pts - 1):
        for k in range(n_pts):
            kn = (k + 1) % n_pts
            f = bm.faces.new((ring_verts[i][k], ring_verts[i][kn], ring_verts[i+1][kn], ring_verts[i+1][k]))
            f.material_index = mat_idx

    # End cap
    tip_pt = spline_data[-1][0] + tangents[-1] * (th_end * 0.35)
    v_tip = bm.verts.new(tip_pt)
    for k in range(n_pts):
        kn = (k + 1) % n_pts
        f = bm.faces.new((ring_verts[-1][k], ring_verts[-1][kn], v_tip))
        f.material_index = mat_idx

    # Root cap
    v_root = bm.verts.new(spline_data[0][0] - tangents[0] * (th_start * 0.25))
    for k in range(n_pts):
        kn = (k + 1) % n_pts
        f = bm.faces.new((v_root, ring_verts[0][kn], ring_verts[0][k]))
        f.material_index = mat_idx

def build_bob_v16(arm, char_id, mat_mode="production"):
    """
    Builds HAIR_003 (Chin-Length Rounded Bob) V16:
    5 cohesive regions:
    0: Scalp Coverage Layer
    1: Fringe Region (5 broad groups)
    2: Left & Right Face-Framing Masses
    3: Coherent Rear Bob Mass
    4: Crown Mass
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    cranial_center = Vector((0.0, center_y, center_z))

    # Material indices:
    # Diagnostic: 0=Scalp, 1=Fringe, 2=Sides, 3=Rear & Crown
    # Production: all = 0
    mat_scalp = 0 if mat_mode == "diagnostic" else 0
    mat_fringe = 1 if mat_mode == "diagnostic" else 0
    mat_sides = 2 if mat_mode == "diagnostic" else 0
    mat_rear = 3 if mat_mode == "diagnostic" else 0
    mat_crown = 3 if mat_mode == "diagnostic" else 0

    # =========================================================================
    # 1. SCALP COVERAGE LAYER (Interior fitted layer, high front hairline)
    # =========================================================================
    # Fits cranium closely so no skin shows through, but terminates HIGH up
    # on forehead (Z ~ 0.630m) so it NEVER forms a visible rim across the brow.
    rx_sc, ry_sc, rz_sc = 0.178, 0.169, 0.162
    num_rings_sc, segs_sc = 12, 32
    scalp_rings = []
    for r in range(num_rings_sc):
        v = (r + 1) / float(num_rings_sc)
        row = []
        for s in range(segs_sc):
            u = 2.0 * math.pi * s / segs_sc
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.20: # Front: high hairline (Z ~ 0.630m)
                max_phi = math.radians(48.0)
            elif cos_u < -0.15: # Nape: covers down to Z ~ 0.448m
                max_phi = math.radians(95.0)
            else: # Above ear
                max_phi = math.radians(68.0)

            phi = v * max_phi
            px = rx_sc * math.sin(phi) * sin_u
            py = ry_sc * math.sin(phi) * cos_u + center_y
            pz = center_z + rz_sc * math.cos(phi)
            row.append(bm.verts.new(Vector((px, py, pz))))
        scalp_rings.append(row)

    for r in range(num_rings_sc - 1):
        for s in range(segs_sc):
            sn = (s + 1) % segs_sc
            f = bm.faces.new((scalp_rings[r][s], scalp_rings[r][sn], scalp_rings[r+1][sn], scalp_rings[r+1][s]))
            f.material_index = mat_scalp

    apex_sc = bm.verts.new(Vector((0.0, center_y, center_z + rz_sc)))
    for s in range(segs_sc):
        sn = (s + 1) % segs_sc
        f = bm.faces.new((apex_sc, scalp_rings[0][s], scalp_rings[0][sn]))
        f.material_index = mat_scalp

    # =========================================================================
    # 2. SHAPED CROWN & REAR BOB MASS (Coherent Top and Back Volume)
    # =========================================================================
    # Sweeps from the crown apex down to chin level (Z ~ 0.415m) across the rear
    # and upper cranial sides, but DOES NOT extend across the brow.
    # The front edge stops at Z ~ 0.632m where fringe roots emerge.
    rx_b, ry_b, rz_b = 0.187, 0.176, 0.166
    num_rings_b, segs_b = 20, 36
    bob_rings = []
    for r in range(num_rings_b):
        v = (r + 1) / float(num_rings_b)
        row = []
        for s in range(segs_b):
            u = 2.0 * math.pi * s / segs_b
            sin_u, cos_u = math.sin(u), math.cos(u)

            # Crown & rear mass covers cos_u < 0.25 (sides and back)
            # For front (cos_u >= 0.25), it stops high (Z ~ 0.635m) to conceal fringe roots
            if cos_u >= 0.25:
                # Front crown border: terminates at Z ~ 0.632m
                max_phi = math.radians(50.0)
                puff = 0.007 + 0.005 * math.sin(v * math.pi)
                phi = v * max_phi
                px = (rx_b + puff) * math.sin(phi) * sin_u
                py = (ry_b + puff) * math.sin(phi) * cos_u + center_y
                pz = center_z + (rz_b + puff) * math.cos(phi)
            else:
                # Sides & Back: flows down to chin level Z ~ 0.415m
                # Polar angle goes up to 90 deg (equator) then vertical extension down
                theta_b = math.atan2(abs(sin_u), -cos_u) # 0 at back, pi/2 at side
                target_edge_z = 0.415 + 0.004 * math.cos(u * 4.0)

                if v < 0.40:
                    phi = (v / 0.40) * math.radians(88.0)
                    puff = 0.008 + 0.006 * math.sin(v * math.pi * 2.5)
                    # Subtle off-center flow
                    puff += 0.003 * math.sin(u + 0.3)
                    px = (rx_b + puff) * math.sin(phi) * sin_u
                    py = (ry_b + puff) * math.sin(phi) * cos_u + center_y
                    pz = center_z + (rz_b + puff) * math.cos(phi)
                else:
                    fac = (v - 0.40) / 0.60
                    phi = math.radians(88.0)
                    base_pz = center_z + rz_b * math.cos(phi)
                    pz = base_pz + fac * (target_edge_z - base_pz)

                    # 3 soft convex lobes across the rear
                    rear_fac = max(0.0, -cos_u)
                    # Central lobe + 2 flank lobes
                    lobes = 0.008 * (math.cos(4.0 * u) + 0.25 * math.cos(2.0 * u)) * rear_fac
                    puff = 0.009 + lobes + 0.004 * math.sin(fac * math.pi)

                    # Inward cupping curl around neck and lower jaw
                    tuck = fac * fac
                    tuck_y = 0.014 * tuck * rear_fac
                    tuck_x = -math.copysign(0.012 * tuck * (1.0 - rear_fac), sin_u)

                    px = (rx_b + puff) * math.sin(phi) * sin_u + tuck_x
                    py = (ry_b + puff) * math.sin(phi) * cos_u + center_y + tuck_y

            # Subtle ear clearance
            if abs(cos_u) < 0.20 and 0.50 < v < 0.85:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.035:
                    px = math.copysign(max(abs(px), 0.185), px)

            row.append(bm.verts.new(Vector((px, py, pz))))
        bob_rings.append(row)

    for r in range(num_rings_b - 1):
        for s in range(segs_b):
            sn = (s + 1) % segs_b
            f = bm.faces.new((bob_rings[r][s], bob_rings[r][sn], bob_rings[r+1][sn], bob_rings[r+1][s]))
            # Assign crown vs rear
            f.material_index = mat_crown if r < 6 else mat_rear

    # Apex cap
    apex_b = bm.verts.new(Vector((-0.010, center_y - 0.005, center_z + rz_b + 0.010)))
    for s in range(segs_b):
        sn = (s + 1) % segs_b
        f = bm.faces.new((apex_b, bob_rings[0][s], bob_rings[0][sn]))
        f.material_index = mat_crown

    # Inward beveled physical thickness rim at chin edge (for posterior segments)
    rim_outer = bob_rings[-1]
    rim_inner = []
    for s in range(segs_b):
        vo = rim_outer[s]
        cos_u = math.cos(2.0 * math.pi * s / segs_b)
        if cos_u < 0.25: # only on the rear/side bob perimeter
            p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        else: # front crown lip
            p_in = vo.co + Vector((0, -0.010, 0.005))
        rim_inner.append(bm.verts.new(p_in))

    for s in range(segs_b):
        sn = (s + 1) % segs_b
        f = bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        f.material_index = mat_rear

    # =========================================================================
    # 3. FRINGE REGION (5 Broad, Flattened Curved Groups Replacing Forehead Rim)
    # =========================================================================
    # Roots start high (Z ~ 0.638m) under the crown lip, flowing down across brow.
    # Widths 24-28mm >> thickness 10-11mm.
    # Tips end at Z ~ 0.568m to 0.584m (safely above eyebrows Z ~ 0.575m and eyes Z ~ 0.572m).
    fringe_specs = [
        # 1. Right transition / temple lock
        {
            "pts": [(0.076, 0.115, 0.636), (0.086, 0.138, 0.612), (0.096, 0.155, 0.584)],
            "w": (0.022, 0.026, 0.018), "th": (0.010, 0.011, 0.007), "cup": -0.25
        },
        # 2. Right brow main lock
        {
            "pts": [(0.044, 0.126, 0.640), (0.048, 0.150, 0.608), (0.052, 0.165, 0.573)],
            "w": (0.025, 0.028, 0.020), "th": (0.010, 0.012, 0.008), "cup": -0.30
        },
        # 3. Center-right lock (gentle off-center focal separation)
        {
            "pts": [(0.012, 0.132, 0.642), (0.013, 0.154, 0.608), (0.014, 0.168, 0.567)],
            "w": (0.022, 0.026, 0.018), "th": (0.010, 0.012, 0.008), "cup": -0.30
        },
        # 4. Center-left main lock (soft overlap with center-right)
        {
            "pts": [(-0.022, 0.130, 0.641), (-0.026, 0.153, 0.608), (-0.030, 0.166, 0.572)],
            "w": (0.025, 0.028, 0.020), "th": (0.010, 0.012, 0.008), "cup": -0.30
        },
        # 5. Left transition / temple lock
        {
            "pts": [(-0.068, 0.115, 0.636), (-0.078, 0.140, 0.612), (-0.088, 0.156, 0.582)],
            "w": (0.022, 0.026, 0.018), "th": (0.010, 0.011, 0.007), "cup": -0.25
        },
    ]

    for f_spec in fringe_specs:
        add_ribbon_lock(
            bm, f_spec["pts"], f_spec["w"], f_spec["th"],
            cranial_center=cranial_center, samples=18, n_pts=10,
            mat_idx=mat_fringe, cupping_bias=f_spec["cup"]
        )

    # =========================================================================
    # 4. LEFT & RIGHT FACE-FRAMING MASSES (Inward C-Curl Cupping Cheeks and Jaw)
    # =========================================================================
    # 2 broad, layered locks per side:
    # A. Anterior face-framing lock (along cheekbone and jaw)
    # B. Posterior side lock (over ear, blending with rear bob)
    side_specs = [
        # Right anterior face-framing lock
        {
            "pts": [
                (0.098, 0.082, 0.628),
                (0.132, 0.072, 0.558),
                (0.146, 0.068, 0.485),
                (0.138, 0.076, 0.420)  # Inward C-curl cupping jaw
            ],
            "w": (0.028, 0.034, 0.022), "th": (0.013, 0.016, 0.010), "cup": 0.0
        },
        # Right posterior side lock
        {
            "pts": [
                (0.136, 0.015, 0.618),
                (0.168, -0.005, 0.540),
                (0.166, -0.010, 0.470),
                (0.156, -0.006, 0.412)  # slightly lower chin tip
            ],
            "w": (0.032, 0.038, 0.024), "th": (0.014, 0.017, 0.011), "cup": 0.0
        },
        # Left anterior face-framing lock
        {
            "pts": [
                (-0.098, 0.082, 0.628),
                (-0.132, 0.072, 0.558),
                (-0.146, 0.068, 0.485),
                (-0.138, 0.076, 0.420)  # Inward C-curl cupping jaw
            ],
            "w": (0.028, 0.034, 0.022), "th": (0.013, 0.016, 0.010), "cup": 0.0
        },
        # Left posterior side lock
        {
            "pts": [
                (-0.136, 0.015, 0.618),
                (-0.168, -0.005, 0.540),
                (-0.166, -0.010, 0.470),
                (-0.156, -0.006, 0.412)
            ],
            "w": (0.032, 0.038, 0.024), "th": (0.014, 0.017, 0.011), "cup": 0.0
        },
    ]

    for s_spec in side_specs:
        add_ribbon_lock(
            bm, s_spec["pts"], s_spec["w"], s_spec["th"],
            cranial_center=cranial_center, samples=22, n_pts=10,
            mat_idx=mat_sides, cupping_bias=s_spec["cup"]
        )

    # -------------------------------------------------------------------------
    # Finalize Mesh and Rig Binding
    # -------------------------------------------------------------------------
    mesh = bpy.data.meshes.new(f"Hair_HAIR_003_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_003", mesh)
    bpy.context.scene.collection.objects.link(obj)

    # Assign materials
    if mat_mode == "diagnostic":
        # 4 distinct colors: Scalp, Fringe, Sides, Rear & Crown
        colors = [
            ("M_Diag_Scalp", (0.15, 0.18, 0.22, 1.0)),     # Dark slate
            ("M_Diag_Fringe", (0.92, 0.52, 0.28, 1.0)),    # Warm coral/orange
            ("M_Diag_Sides", (0.35, 0.65, 0.90, 1.0)),     # Sky blue
            ("M_Diag_RearCrown", (0.45, 0.78, 0.45, 1.0)), # Fresh sage green
        ]
        for mname, rgba in colors:
            mat = bpy.data.materials.new(f"{mname}_{char_id}")
            mat.use_nodes = True
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = rgba
                bsdf.inputs["Roughness"].default_value = 0.55
                bsdf.inputs["Specular IOR Level"].default_value = 0.15
            obj.data.materials.append(mat)
    else:
        # Production calibrated satin-matte hair shader
        mat = bpy.data.materials.new(f"M_Hair_{char_id}")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            # #221714 sRGB in linear
            bsdf.inputs["Base Color"].default_value = (0.016, 0.008, 0.006, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.68
            bsdf.inputs["Specular IOR Level"].default_value = 0.18
            if "Sheen Weight" in bsdf.inputs:
                bsdf.inputs["Sheen Weight"].default_value = 0.25
        obj.data.materials.append(mat)

    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True

    # Rig binding to Head bone
    vg = obj.vertex_groups.new(name="Head")
    all_v_indices = list(range(len(obj.data.vertices)))
    vg.add(all_v_indices, 1.0, 'REPLACE')

    mod = obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm

    return obj

print("build_bob_v16 function defined.")


CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"

def setup_chibi_studio(scene, res=(768, 896)):
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Studio_Cam")
    cam_data.lens = 65
    cam = bpy.data.objects.new("Studio_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

    scene.world = bpy.data.worlds.new("Studio_World")
    scene.world.use_nodes = True
    nodes = scene.world.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    scene.world.node_tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bg.inputs["Color"].default_value = (0.87, 0.88, 0.90, 1.0)
    bg.inputs["Strength"].default_value = 0.92

    def add_light(name, ltype, energy, loc, rot_deg, color=(1,1,1), size=0.8):
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

    add_light("Key_Light", 'AREA', 45.0, (0.42, 0.90, 0.80), (48, 0, 22), (1.0, 0.98, 0.95), size=1.0)
    add_light("Fill_Light", 'AREA', 32.0, (-0.45, 0.85, 0.65), (52, 0, -28), (0.95, 0.97, 1.0), size=1.1)
    add_light("Front_Eye_Light", 'AREA', 20.0, (0.0, 1.00, 0.53), (90, 0, 0), (1.0, 0.98, 0.96), size=0.8)
    add_light("Rim_Back_Light", 'AREA', 30.0, (0.0, -0.90, 0.85), (-50, 0, 180), (1.0, 1.0, 1.0), size=0.9)

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    return cam

def run_rebuild_pipeline():
    print("\n=======================================================")
    print("RUNNING HAIR_003 V16 REBUILD PIPELINE")
    print("=======================================================")

    views = [
        ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
        ("three_quarter_left", (-0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(-135)), 60),
        ("three_quarter_right", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
        ("profile_left", (-1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(-90)), 60),
        ("profile_right", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
        ("rear", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
    ]

    # Step A: Render Diagnostic Views
    print("\n[Step A] Building Diagnostic Bob (4 Component Colors)...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "female_v16_hair_003_diag"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)

    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)

    hair_diag = build_bob_v16(factory.arm, char_tag, mat_mode="diagnostic")
    print(f"[Built Diagnostic] {hair_diag.name}: {len(hair_diag.data.polygons)} quads, {len(hair_diag.data.materials)} materials")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag)

    scene = bpy.context.scene
    cam = setup_chibi_studio(scene)

    diag_views = [
        ("diag_front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
        ("diag_three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
        ("diag_profile", (-1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(-90)), 60),
        ("diag_rear", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
    ]

    for vname, loc, rot, fov in diag_views:
        cam.location = loc
        cam.rotation_euler = rot
        cam.data.angle = math.radians(fov)
        out_name = f"hair_003_v16_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered Diagnostic] -> {out_name}")

    # Step B: Render Production Views & Export GLB
    print("\n[Step B] Building Production Bob (Unified Satin-Matte)...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "female_v16_hair_003"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)

    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)

    hair_prod = build_bob_v16(factory.arm, char_tag, mat_mode="production")
    print(f"[Built Production] {hair_prod.name}: {len(hair_prod.data.polygons)} quads, {len(hair_prod.data.vertices)} vertices")

    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag)

    # Runtime assertion: verify eye integrity and ensure no unwanted glasses
    eye_objs = {o.name for o in bpy.data.objects if "Eye" in o.name}
    assert {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"}.issubset(eye_objs), f"Missing canonical eyes: {eye_objs}"
    assert "Acc_Glasses" not in [o.name for o in bpy.data.objects], "Acc_Glasses detected in hair preview scene!"

    scene = bpy.context.scene
    cam = setup_chibi_studio(scene)

    for vname, loc, rot, fov in views:
        cam.location = loc
        cam.rotation_euler = rot
        cam.data.angle = math.radians(fov)
        out_name = f"hair_003_v16_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered Production] -> {out_name}")

    # Save .blend
    blend_path = os.path.join(BLEND_DIR, "hair_003_v16_source.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    shutil.copyfile(blend_path, os.path.join(PREVIEWS_DIR, "hair_003_v16_source.blend"))
    print(f"[Saved Blend] -> {blend_path}")

    # Export GLBs
    glb_v16 = os.path.join(GLB_DIR, "character_hair_003_v16.glb")
    glb_std = os.path.join(GLB_DIR, "character_hair_003.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_v16,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_animations=True,
        export_skins=True,
        export_morph=True
    )
    shutil.copyfile(glb_v16, glb_std)
    print(f"[Exported GLBs] -> {glb_v16} and {glb_std}")

if __name__ == "__main__":
    run_rebuild_pipeline()
