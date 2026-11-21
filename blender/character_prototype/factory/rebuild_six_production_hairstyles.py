"""
=============================================================================
CHIBI MODULAR HAIRSTYLE LIBRARY — SIX PRODUCTION HAIRSTYLES (V14)
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life Narrative (2012–2013)

Senior Stylized Character Artist & Procedural Geometry Engineer
Active Selection (6 Finished Styles):
Male Presets:
- HAIR_001: Classic Bowl Cut
- HAIR_002: Sporty Short
- HAIR_004: Side-Parted Short
Female Presets:
- HAIR_003: Chin-Length Rounded Bob (Reaches actual chin Z ~ 0.415m all around)
- HAIR_007: High Ponytail (Full ponytail falling toward upper back Z ~ 0.400m)
- HAIR_010: Shoulder-Length Loose Hair (Full mantle extending to shoulder Z ~ 0.368m)

Archived Unselected Styles (Preserved in backup):
- HAIR_005, HAIR_006, HAIR_008, HAIR_009, HAIR_011, HAIR_012
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler
import os
import sys
import json
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "six_hairstyles_v14")
GLB_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(GLB_DIR, exist_ok=True)
os.makedirs(BLEND_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# COLOR & MATERIAL UTILITIES
# ---------------------------------------------------------------------------

def hex_to_linear_rgb(hex_code, alpha=1.0):
    hex_clean = hex_code.lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = ''.join([c*2 for c in hex_clean])
    r = int(hex_clean[0:2], 16) / 255.0
    g = int(hex_clean[2:4], 16) / 255.0
    b = int(hex_clean[4:6], 16) / 255.0
    def srgb_to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b), alpha)

def create_chibi_hair_material(mat_name, hex_color="#2b201c", roughness=0.68, sheen=0.25):
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        mat = bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out_node = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = hex_to_linear_rgb(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.18
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.18
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = sheen
    return mat

def create_accessory_material(mat_name, hex_color="#e0564c", roughness=0.45):
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        mat = bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out_node = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = hex_to_linear_rgb(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    return mat

def apply_clean_subsurf(obj, levels=1):
    mod = obj.modifiers.new("Subsurf", 'SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    for p in obj.data.polygons:
        p.use_smooth = True

def bind_hair_to_armature(hair_obj, armature_obj):
    hair_obj.parent = armature_obj
    mod = hair_obj.modifiers.new("Armature", 'ARMATURE')
    mod.object = armature_obj
    vg = hair_obj.vertex_groups.get("Head")
    if not vg:
        vg = hair_obj.vertex_groups.new(name="Head")
    all_indices = [v.index for v in hair_obj.data.vertices]
    if all_indices:
        vg.add(all_indices, 1.0, 'REPLACE')

# ---------------------------------------------------------------------------
# GEOMETRY UTILITIES
# ---------------------------------------------------------------------------

def catmull_rom_spline(control_points, samples_per_segment=8):
    pts = [Vector(p) for p in control_points]
    if len(pts) < 2:
        return [(pts[0], 0.0)]
    p_start = pts[0] + (pts[0] - pts[1])
    p_end = pts[-1] + (pts[-1] - pts[-2])
    all_p = [p_start] + pts + [p_end]
    curve = []
    num_segs = len(pts) - 1
    for i in range(num_segs):
        p0, p1, p2, p3 = all_p[i], all_p[i+1], all_p[i+2], all_p[i+3]
        for s in range(samples_per_segment if i < num_segs - 1 else samples_per_segment + 1):
            t = s / float(samples_per_segment)
            t2, t3 = t * t, t * t * t
            pos = 0.5 * (
                (2.0 * p1) +
                (-p0 + p2) * t +
                (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
                (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
            )
            global_t = (i + t) / float(num_segs)
            curve.append((pos, global_t))
    return curve

def add_volumetric_spline_lock(bm, control_points, width_profile, thick_profile, samples=24, n_pts=12, mat_index=0):
    curve_pts = catmull_rom_spline(control_points, samples_per_segment=max(4, samples // (len(control_points) - 1)))
    w_start, w_mid, w_end = width_profile
    th_start, th_mid, th_end = thick_profile

    slices = []
    for i, (pt, t) in enumerate(curve_pts):
        if t < 0.25:
            fac = t / 0.25
            w = w_start + (w_mid - w_start) * (fac ** 0.70)
            th = th_start + (th_mid - th_start) * (fac ** 0.70)
        elif t < 0.75:
            w = w_mid
            th = th_mid
        else:
            fac = (t - 0.75) / 0.25
            w = w_mid + (w_end - w_mid) * (fac ** 1.15)
            th = th_mid + (th_end - th_mid) * (fac ** 1.15)

        if i < len(curve_pts) - 1:
            tangent = (curve_pts[i + 1][0] - pt).normalized()
        else:
            tangent = (pt - curve_pts[i - 1][0]).normalized()

        up = Vector((0, 0, 1))
        if abs(tangent.dot(up)) > 0.88:
            up = Vector((0, 1, 0))
        binormal = tangent.cross(up).normalized()
        normal = binormal.cross(tangent).normalized()

        ring = []
        for k in range(n_pts):
            ang = 2.0 * math.pi * k / n_pts
            vx = math.cos(ang) * (w * 0.5)
            vy = math.sin(ang) * (th * 0.5)
            p = pt + binormal * vx + normal * vy
            ring.append(bm.verts.new(p))
        slices.append(ring)

    for i in range(len(slices) - 1):
        s1 = slices[i]
        s2 = slices[i + 1]
        for k in range(n_pts):
            kn = (k + 1) % n_pts
            f = bm.faces.new((s1[k], s1[kn], s2[kn], s2[k]))
            f.material_index = mat_index

    s0 = slices[0]
    c0 = bm.verts.new(Vector(curve_pts[0][0]))
    for k in range(n_pts):
        kn = (k + 1) % n_pts
        f = bm.faces.new((c0, s0[kn], s0[k]))
        f.material_index = mat_index

    se = slices[-1]
    ce = bm.verts.new(Vector(curve_pts[-1][0]))
    for k in range(n_pts):
        kn = (k + 1) % n_pts
        f = bm.faces.new((ce, se[k], se[kn]))
        f.material_index = mat_index

def add_smooth_hair_band(bm, center, axis=(0, 0, 1), major_r=0.024, minor_r=0.007, segs_u=16, segs_v=8, mat_index=1):
    axis = Vector(axis).normalized()
    up = Vector((0, 0, 1)) if abs(axis.z) < 0.88 else Vector((0, 1, 0))
    u_dir = axis.cross(up).normalized()
    v_dir = axis.cross(u_dir).normalized()
    rings = []
    for i in range(segs_u):
        ang_u = 2.0 * math.pi * i / segs_u
        c_ring = center + (u_dir * math.cos(ang_u) + v_dir * math.sin(ang_u)) * major_r
        rad_dir = (c_ring - center).normalized()
        ring_v = []
        for j in range(segs_v):
            ang_v = 2.0 * math.pi * j / segs_v
            p = c_ring + (rad_dir * math.cos(ang_v) + axis * math.sin(ang_v)) * minor_r
            ring_v.append(bm.verts.new(p))
        rings.append(ring_v)
    for i in range(segs_u):
        inxt = (i + 1) % segs_u
        for j in range(segs_v):
            jnxt = (j + 1) % segs_v
            f = bm.faces.new((rings[i][j], rings[i][jnxt], rings[inxt][jnxt], rings[inxt][j]))
            f.material_index = mat_index

def add_ribbon_bow(bm, center, facing=(0, -1, 0.2), width=0.040, height=0.020, mat_index=1):
    facing = Vector(facing).normalized()
    up = Vector((0, 0, 1))
    right = facing.cross(up).normalized()
    knot_r = 0.008
    kv = [
        bm.verts.new(center + facing * knot_r),
        bm.verts.new(center - facing * knot_r),
        bm.verts.new(center + right * knot_r),
        bm.verts.new(center - right * knot_r),
        bm.verts.new(center + up * knot_r),
        bm.verts.new(center - up * knot_r),
    ]
    knot_faces = [
        (kv[0], kv[2], kv[4]), (kv[0], kv[4], kv[3]), (kv[0], kv[3], kv[5]), (kv[0], kv[5], kv[2]),
        (kv[1], kv[4], kv[2]), (kv[1], kv[3], kv[4]), (kv[1], kv[5], kv[3]), (kv[1], kv[2], kv[5])
    ]
    for kf in knot_faces:
        f = bm.faces.new(kf)
        f.material_index = mat_index
    for sign in [-1, 1]:
        w_tip = center + right * (sign * width) + up * (height * 0.35)
        w_mid_t = center + right * (sign * width * 0.6) + up * (height * 0.8)
        w_mid_b = center + right * (sign * width * 0.6) - up * (height * 0.3)
        w_root_t = center + right * (sign * knot_r) + up * (knot_r * 0.8)
        w_root_b = center + right * (sign * knot_r) - up * (knot_r * 0.8)
        v_rt = bm.verts.new(w_root_t)
        v_rb = bm.verts.new(w_root_b)
        v_mt = bm.verts.new(w_mid_t)
        v_mb = bm.verts.new(w_mid_b)
        v_tip = bm.verts.new(w_tip)
        f1 = bm.faces.new((v_rt, v_mt, v_mb, v_rb))
        f2 = bm.faces.new((v_mt, v_tip, v_mb))
        f1.material_index = mat_index
        f2.material_index = mat_index

# =============================================================================
# 1. HAIR_001: CLASSIC BOWL CUT (V14 PRODUCTION FINISH)
# =============================================================================

def build_hair_001_v14(arm, char_id, color_hex="#2b201c"):
    """
    HAIR_001: Classic Bowl Cut
    - Tidy, compact bowl cut with soft horizontal fringe baseline.
    - 3-4 broad, shallow groupings with small length differences (8-10mm).
    - Modest thickness (14mm) and inward curvature at edge.
    - Temples blend cleanly into side volume; compact, tidy nape (Z ~ 0.448m).
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.186, 0.175, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.18:  # Fringe area
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.012 * math.cos(theta_f * 3.0) + 0.005 * math.sin(theta_f * 5.0)
                max_phi = math.radians(66.0) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Temples & sides
                max_phi = math.radians(74.0)
                puff = 0.004

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Ear clearance
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.038:
                    pz += (0.038 - ear_dist) * 0.85
                    px = math.copysign(max(abs(px), 0.183), px)
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.005)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_001", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 2. HAIR_002: SPORTY SHORT (V14 REBUILD — CONNECTED SHAPED VOLUME)
# =============================================================================

def build_hair_002_v14(arm, char_id, color_hex="#161b26"):
    """
    HAIR_002: Sporty Short
    - A genuinely short haircut with compact sides and subtly lifted, directional top.
    - Top rebuilt as a connected shaped volume (NOT isolated bumps on a dome).
    - Close-fitting sides and snug nape, eliminating the rounded bowl overhang.
    - Open energetic brow (Z ~ 0.595m); soft school-age appearance.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.183, 0.172, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.15:  # Forehead: open athletic brow
                theta_f = math.atan2(sin_u, cos_u)
                crest_swelling = 0.005 * math.cos(theta_f * 2.0)
                max_phi = math.radians(57.0) + crest_swelling
                puff = 0.004 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Close-fitting nape (no bowl overhang!)
                back_fac = -cos_u
                max_phi = math.radians(98.0) + back_fac * math.radians(20.0)
                puff = 0.001  # Snug to skull
            else:  # Close-cropped sides
                max_phi = math.radians(72.0)
                puff = 0.002

            # Connected directional lifted top volume (rising toward front-top)
            if v < 0.45:
                top_fac = (1.0 - v / 0.45)
                # Directional lift: forward and subtly to right
                dir_lift = (0.7 + 0.3 * cos_u + 0.15 * sin_u)
                puff += 0.016 * top_fac * dir_lift

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Ear clearance
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.038:
                    pz += (0.038 - ear_dist) * 0.85
                    px = math.copysign(max(abs(px), 0.182), px)
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.008, center_y + 0.015, center_z + rz + 0.018)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.012 + Vector((0, 0, 0.004))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_002", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 3. HAIR_003: CHIN-LENGTH ROUNDED BOB (V14 REBUILD — ACTUAL CHIN LANDMARK)
# =============================================================================

def build_hair_003_v14(arm, char_id, color_hex="#221714"):
    """
    HAIR_003: Chin-Length Rounded Bob
    - Uses actual chin position (Z ~ 0.415m) as length landmark.
    - Extends both side hair masses and lower rear head down to chin level.
    - Downward vertical extension zone replaces spherical cutoff.
    - Soft fullness beside cheeks (X ~ +-0.200m) with gentle inward C-curl at jaw.
    - Complete, coherent haircut reading as one solid volume.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.188, 0.177, 0.166
    segs = 40

    # Zone 1: Upper Cranium Dome (from apex down to equator Z = 0.528m)
    num_dome_rings = 10
    dome_verts = []
    for r in range(num_dome_rings):
        v = r / float(num_dome_rings)
        phi = v * (math.pi * 0.5)  # 0 to 90 degrees
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            side_puff = 0.014 * (sin_u ** 2) * math.sin(phi)
            px = (rx + side_puff) * math.sin(phi) * sin_u
            py = (ry + side_puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            row.append(bm.verts.new(Vector((px, py, pz))))
        dome_verts.append(row)

    for r in range(num_dome_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((dome_verts[r][s], dome_verts[r][sn], dome_verts[r+1][sn], dome_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.006)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, dome_verts[0][s], dome_verts[0][sn]))

    # Zone 2: Downward Vertical Extension to Actual Chin Level (Z = 0.415m)
    num_ext_rings = 10
    ext_verts = [dome_verts[-1]]  # Start from equator ring
    equator_ring = dome_verts[-1]

    # Target lower perimeter Z across azimuth u
    # Front (cos_u > 0.35): fringe stays at brow level Z ~ 0.575m
    # Sides & Back (cos_u <= 0.35): extends down to CHIN LEVEL Z = 0.415m!
    for r in range(1, num_ext_rings + 1):
        v = r / float(num_ext_rings)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            base_pt = equator_ring[s].co

            if cos_u > 0.30:
                # Face opening / fringe above brows
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.012 * math.cos(theta_f * 3.0)
                target_z = 0.575 + fringe_var
            elif cos_u < -0.15:
                # Rear bob perimeter down to chin height
                target_z = 0.418
            else:
                # Sides framing cheeks down to jaw/chin
                target_z = 0.415

            pz = base_pt.z + v * (target_z - base_pt.z)

            # Lateral shaping and inward C-curl cupping the chin/jaw
            px = base_pt.x
            py = base_pt.y
            if v > 0.40 and cos_u <= 0.30:
                tuck = (v - 0.40) / 0.60
                px -= math.copysign(0.016 * tuck, px)
                py += 0.012 * tuck  # Cup forward around jaw

            row.append(bm.verts.new(Vector((px, py, pz))))
        ext_verts.append(row)

    for r in range(num_ext_rings):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ext_verts[r][s], ext_verts[r][sn], ext_verts[r+1][sn], ext_verts[r+1][s]))

    # Inward beveled physical thickness at the lower perimeter
    rim_outer = ext_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.016 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_003", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 4. HAIR_004: SIDE-PARTED SHORT (V14 REBUILD — SMOOTH SEAMLESS SWEEP)
# =============================================================================

def build_hair_004_v14(arm, char_id, color_hex="#241c19"):
    """
    HAIR_004: Side-Parted Short
    - Neat off-center part (X = -0.046m) with broad sweeping fringe.
    - Root blends smoothly into crown without raised knob or bead.
    - Modest root lift (+6mm), tapering toward temple.
    - Shallow part with 100% scalp coverage beneath.
    - Eyes readable; compact short sides and tidy nape.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.186, 0.175, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.15:  # Forehead base
                asym = sin_u * 0.08
                max_phi = math.radians(64.0) + asym
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides
                max_phi = math.radians(74.0)
                puff = 0.004

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Ear clearance
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.038:
                    pz += (0.038 - ear_dist) * 0.85
                    px = math.copysign(max(abs(px), 0.183), px)
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.006)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # Broad, smooth sweeping fringe mass blending into crown
    sweep_spine = [
        Vector((-0.046, 0.115, 0.650)),
        Vector((-0.005, 0.138, 0.635)),
        Vector(( 0.045, 0.138, 0.608)),
        Vector(( 0.090, 0.125, 0.565)),
        Vector(( 0.118, 0.095, 0.520))
    ]
    add_volumetric_spline_lock(
        bm, sweep_spine,
        width_profile=(0.042, 0.072, 0.020),
        thick_profile=(0.018, 0.024, 0.008),
        samples=20, n_pts=10, mat_index=0
    )

    # Secondary supporting under-lock
    under_spine = [
        Vector((-0.030, 0.110, 0.638)),
        Vector(( 0.020, 0.128, 0.612)),
        Vector(( 0.065, 0.120, 0.572))
    ]
    add_volumetric_spline_lock(
        bm, under_spine,
        width_profile=(0.028, 0.044, 0.014),
        thick_profile=(0.012, 0.016, 0.006),
        samples=16, n_pts=8, mat_index=0
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_004", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 5. HAIR_007: HIGH PONYTAIL (V14 REBUILD — FLOWING TOWARD UPPER BACK)
# =============================================================================

def build_hair_007_v14(arm, char_id, color_hex="#1a1818", tie_hex="#4a8ec2"):
    """
    HAIR_007: High Ponytail
    - Full ponytail gathered high behind crown, then falling in a soft curve toward upper back (Z ~ 0.400m).
    - Upward gathering suggested through smooth scalp contour.
    - Tie small but visible with ribbon bow.
    - One cohesive full tail: lifts briefly near tie, turns downward under gravity.
    - Substantial width (76mm) and depth (58mm); clear separation from rear skull.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.18:  # Bangs
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.022 * math.cos(theta_f * 3.0)
                max_phi = math.radians(65.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides
                max_phi = math.radians(74.0)
                puff = 0.004

            # Upward gather sweep toward high crown gather point (0, -0.115, 0.675)
            if cos_u < 0.10 and v < 0.50:
                gather_fac = (1.0 - v / 0.50) * max(0.0, -cos_u)
                puff += 0.018 * gather_fac

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.008)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.013 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # Sturdy high tie band & bow
    tie_center = Vector((0.0, -0.115, 0.675))
    tie_axis = Vector((0.0, -0.500, 0.866))
    add_smooth_hair_band(bm, tie_center, axis=tie_axis, major_r=0.024, minor_r=0.007, segs_u=16, segs_v=8, mat_index=1)
    add_ribbon_bow(bm, tie_center + Vector((0.0, -0.012, 0.012)), facing=(0.0, -1.0, 0.2), width=0.042, height=0.020, mat_index=1)

    # FULL COHESIVE PONYTAIL FALLING TOWARD UPPER BACK (Z ~ 0.400m)
    flowing_tail_spine = [
        Vector((0.0, -0.095, 0.675)),
        Vector((0.0, -0.135, 0.725)),  # Crest visible from front
        Vector((0.0, -0.215, 0.630)),  # Arcs backward and down under gravity
        Vector((0.0, -0.240, 0.520)),  # Clear separation from skull
        Vector((0.0, -0.210, 0.400))   # Reaches upper back / shoulder line!
    ]
    add_volumetric_spline_lock(
        bm, flowing_tail_spine,
        width_profile=(0.044, 0.076, 0.022),   # Full 76mm width!
        thick_profile=(0.034, 0.058, 0.016),  # Full 58mm depth!
        samples=28, n_pts=12, mat_index=0
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_007", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex, roughness=0.45)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 6. HAIR_010: SHOULDER-LENGTH LOOSE HAIR (V14 REBUILD — ACTUAL SHOULDER LANDMARK)
# =============================================================================

def build_hair_010_v14(arm, char_id, color_hex="#261b17"):
    """
    HAIR_010: Shoulder-Length Loose Hair
    - Uses actual shoulder line (Z ~ 0.368m) as length landmark.
    - Extends the ENTIRE rear hair mass and side masses to shoulder level.
    - Connects side and rear forms into a coherent hair envelope around the neck.
    - Soft C-curl cupping inward around neck/shoulders with clearance from shirt and scarf.
    - Visibly longer and fuller than HAIR_003.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.188, 0.177, 0.166
    segs = 40

    # Zone 1: Upper Cranium Dome (apex to equator Z = 0.528m)
    num_dome_rings = 10
    dome_verts = []
    for r in range(num_dome_rings):
        v = r / float(num_dome_rings)
        phi = v * (math.pi * 0.5)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            side_puff = 0.010 * (sin_u ** 2) * math.sin(phi)
            px = (rx + side_puff) * math.sin(phi) * sin_u
            py = (ry + side_puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            row.append(bm.verts.new(Vector((px, py, pz))))
        dome_verts.append(row)

    for r in range(num_dome_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((dome_verts[r][s], dome_verts[r][sn], dome_verts[r+1][sn], dome_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.006)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, dome_verts[0][s], dome_verts[0][sn]))

    # Zone 2: Downward Vertical Extension to Actual Shoulder Level (Z = 0.368m)
    num_ext_rings = 12
    ext_verts = [dome_verts[-1]]
    equator_ring = dome_verts[-1]

    # Target lower perimeter Z across azimuth u:
    # Front (cos_u > 0.30): fringe stays at brow level Z ~ 0.575m
    # Sides & Back (cos_u <= 0.30): extends all the way down to SHOULDER LEVEL Z = 0.368m!
    for r in range(1, num_ext_rings + 1):
        v = r / float(num_ext_rings)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            base_pt = equator_ring[s].co

            if cos_u > 0.30:
                # Face opening / fringe
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.012 * math.cos(theta_f * 3.0)
                target_z = 0.575 + fringe_var
            elif cos_u < -0.15:
                # Rear mantle flowing over upper back to shoulder height
                target_z = 0.368
            else:
                # Sides framing neck down to top of shoulders
                target_z = 0.372

            pz = base_pt.z + v * (target_z - base_pt.z)

            # Lateral flare and gentle inward C-curl along shoulders
            px = base_pt.x
            py = base_pt.y
            if v > 0.50 and cos_u <= 0.30:
                tuck = (v - 0.50) / 0.50
                # Gentle flare then tuck
                px -= math.copysign(0.012 * tuck, px)
                py += 0.010 * tuck

            row.append(bm.verts.new(Vector((px, py, pz))))
        ext_verts.append(row)

    for r in range(num_ext_rings):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ext_verts[r][s], ext_verts[r][sn], ext_verts[r+1][sn], ext_verts[r+1][s]))

    # Inward beveled physical thickness at the lower perimeter
    rim_outer = ext_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.016 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_010", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# ACTIVE 6-HAIRSTYLE DISPATCHER & METADATA
# =============================================================================

HAIRSTYLE_DISPATCHER_SIX = {
    "HAIR_001": build_hair_001_v14,
    "HAIR_002": build_hair_002_v14,
    "HAIR_003": build_hair_003_v14,
    "HAIR_004": build_hair_004_v14,
    "HAIR_007": build_hair_007_v14,
    "HAIR_010": build_hair_010_v14,
}

HAIRSTYLE_METADATA_SIX = {
    "HAIR_001": {"name": "Classic Bowl Cut", "gender": "male", "color": "#2b201c"},
    "HAIR_002": {"name": "Sporty Short", "gender": "male", "color": "#161b26"},
    "HAIR_003": {"name": "Chin-Length Rounded Bob", "gender": "female", "color": "#221714"},
    "HAIR_004": {"name": "Side-Parted Short", "gender": "male", "color": "#241c19"},
    "HAIR_007": {"name": "High Ponytail", "gender": "female", "color": "#1a1818", "tie": "#4a8ec2"},
    "HAIR_010": {"name": "Shoulder-Length Loose Hair", "gender": "female", "color": "#261b17"},
}

# ---------------------------------------------------------------------------
# STUDIO ENVIRONMENT
# ---------------------------------------------------------------------------

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

# ---------------------------------------------------------------------------
# BATCH BUILD, EXPORT & RENDER PIPELINE
# ---------------------------------------------------------------------------

def run_six_production():
    print("[Pipeline] Starting Active 6-Hairstyle V14 Production Build & Render...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    manifest = {}

    views = [
        ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
        ("three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
        ("side", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
        ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
    ]

    for hair_id in sorted(HAIRSTYLE_DISPATCHER_SIX.keys()):
        meta = HAIRSTYLE_METADATA_SIX[hair_id]
        builder_fn = HAIRSTYLE_DISPATCHER_SIX[hair_id]
        print(f"\n=======================================================")
        print(f"BUILDING 6-STYLE ACTIVE: {hair_id} — {meta['name']} ({meta['gender'].upper()})")
        print(f"=======================================================")

        char_tag = f"six_{hair_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)

        # Clear existing hair
        for o in list(bpy.data.objects):
            if o.name.startswith("Hair_"):
                bpy.data.objects.remove(o, do_unlink=True)

        arm = factory.arm
        color = meta["color"]
        if "tie" in meta:
            hair_obj = builder_fn(arm, char_tag, color_hex=color, tie_hex=meta["tie"])
        else:
            hair_obj = builder_fn(arm, char_tag, color_hex=color)

        print(f"[Built] {hair_obj.name}: {len(hair_obj.data.polygons)} quads")

        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        factory.equip_accessories([], char_tag)

        # Runtime assertion: verify eye integrity and ensure no unwanted glasses
        eye_objs = {o.name for o in bpy.data.objects if "Eye" in o.name}
        assert {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"}.issubset(eye_objs), f"Missing canonical eyes: {eye_objs}"
        assert "Acc_Glasses" not in [o.name for o in bpy.data.objects], "Acc_Glasses detected in hair preview scene!"

        # Save source .blend
        blend_path = os.path.join(BLEND_DIR, f"{hair_id.lower()}_v14_source.blend")
        blend_preview_path = os.path.join(PREVIEWS_DIR, f"{hair_id.lower()}_v14_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        shutil.copyfile(blend_path, blend_preview_path)

        # Export production GLB (versioned and standard)
        glb_name = f"character_{hair_id.lower()}_v14.glb"
        glb_path = os.path.join(GLB_DIR, glb_name)
        glb_preview_path = os.path.join(PREVIEWS_DIR, glb_name)
        glb_size = factory.export_glb(glb_path)
        shutil.copyfile(glb_path, glb_preview_path)

        std_glb_path = os.path.join(GLB_DIR, f"character_{hair_id.lower()}.glb")
        shutil.copyfile(glb_path, std_glb_path)
        print(f"  Exported GLB -> {glb_path} ({glb_size / 1024:.1f} KB)")

        # Studio renders
        scene = bpy.context.scene
        cam = setup_chibi_studio(scene, res=(768, 896))

        rendered_images = {}
        for vname, loc, rot, lens in views:
            cam.location = loc
            cam.rotation_euler = rot
            cam.data.lens = lens
            img_filename = f"{hair_id.lower()}_{vname}.png"
            img_path = os.path.join(PREVIEWS_DIR, img_filename)
            scene.render.filepath = img_path
            bpy.ops.render.render(write_still=True)
            rendered_images[vname] = img_filename
            print(f"  Rendered {vname} -> {img_filename}")

        # Render closeup views for key styles
        if hair_id in ["HAIR_003", "HAIR_007", "HAIR_010"]:
            cam.data.lens = 90
            if hair_id == "HAIR_003":
                cam.location = (0.50, 0.50, 0.450)
                cam.rotation_euler = (math.radians(85), 0, math.radians(135))
            elif hair_id == "HAIR_007":
                cam.location = (0.55, -0.45, 0.550)
                cam.rotation_euler = (math.radians(85), 0, math.radians(50))
            elif hair_id == "HAIR_010":
                cam.location = (0.0, -0.65, 0.400)
                cam.rotation_euler = (math.radians(92), 0, 0)

            c_name = f"{hair_id.lower()}_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["closeup"] = c_name
            print(f"  Rendered closeup -> {c_name}")

        manifest[hair_id] = {
            "name": meta["name"],
            "gender": meta["gender"],
            "glb": glb_name,
            "glb_size_kb": round(glb_size / 1024, 1),
            "renders": rendered_images,
            "quads": len(hair_obj.data.polygons),
            "color": color
        }

    manifest_path = os.path.join(PREVIEWS_DIR, "six_hairstyles_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[Done] Pipeline finished! Manifest saved to {manifest_path}")

if __name__ == "__main__":
    run_six_production()
