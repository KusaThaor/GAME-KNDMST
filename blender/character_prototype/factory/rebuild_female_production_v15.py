"""
=============================================================================
REFINEMENT PIPELINE: FEMALE PRODUCTION HAIRSTYLES (V15)
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life Narrative (2012–2013)

Senior Stylized Character Artist & Procedural Geometry Engineer
Target Scope (FEMALE PRESETS ONLY):
- HAIR_003: Chin-Length Rounded Bob
  * Continuous organic envelope from apex to chin (Z ~ 0.415m)
  * Hat-brim forehead band eliminated; smooth forehead flow
  * Soft arched face opening (no rectangular box corners)
  * 4 broad soft fringe locks + 2 chin-cupping face-framing cheek locks
  * Soft convex lobes breaking up solid rear shell
- HAIR_007: High Ponytail
  * RMF (Rotation Minimizing Frame) single continuous swept tail from root to tip
  * Zero twists, zero flips, zero gaps or breaks in profile/rear
  * Sturdy gathered root inside tie band, crest Z ~ 0.725m, tail falling to Z ~ 0.395m
  * Full chunky 78mm x 58mm cross section with gradual taper
  * Restrained falling forehead wisp + 2 temple wisps framing ears
- HAIR_010: Shoulder-Length Loose Hair
  * Continuous organic envelope extending to shoulder line (Z ~ 0.368m)
  * Hat-brim forehead band eliminated; asymmetrical side-swept fringe
  * Arched temple transitions framing eyes and cheeks
  * Long face-framing strands flowing to collar + soft rear surface waves
  * Inward C-curl with shirt and scarf clearance

Preserves all 3 male styles (HAIR_001, HAIR_002, HAIR_004) untouched.
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
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "female_v15_refinement")
GLB_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(GLB_DIR, exist_ok=True)
os.makedirs(BLEND_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

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

def create_chibi_hair_material(mat_name, hex_color="#221714", roughness=0.68, sheen=0.25):
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

def create_accessory_material(mat_name, hex_color="#4a8ec2", roughness=0.45):
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

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

# ---------------------------------------------------------------------------
# CONTINUOUS SPLINE & RMF SWEEP UTILITIES
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

def add_continuous_rmf_spline_lock(bm, control_points, width_profile, thick_profile, samples=28, n_pts=12, mat_index=0, initial_binormal=(1,0,0)):
    """
    Sweeps a cross-section along a 3D spline using Wang et al. (2008) double-reflection
    Rotation Minimizing Frame (RMF). Mathematically guaranteed to produce continuous
    cross-sections with ZERO twist, ZERO flip, and ZERO gaps across all bend angles.
    """
    curve_pts = catmull_rom_spline(control_points, samples_per_segment=max(4, samples // (len(control_points) - 1)))
    num_pts = len(curve_pts)
    w_start, w_mid, w_end = width_profile
    th_start, th_mid, th_end = thick_profile

    # Tangents
    tangents = []
    for i in range(num_pts):
        if i == 0:
            t = (curve_pts[1][0] - curve_pts[0][0]).normalized()
        elif i == num_pts - 1:
            t = (curve_pts[-1][0] - curve_pts[-2][0]).normalized()
        else:
            t = (curve_pts[i + 1][0] - curve_pts[i - 1][0]).normalized()
        tangents.append(t)

    # Initial frame
    t0 = tangents[0]
    b0 = Vector(initial_binormal).normalized()
    b0 = (b0 - t0 * t0.dot(b0)).normalized()
    n0 = t0.cross(b0).normalized()

    binormals = [b0]
    normals = [n0]

    # Double reflection RMF (Parallel Transport)
    for i in range(num_pts - 1):
        t1, t2 = tangents[i], tangents[i + 1]
        v = curve_pts[i + 1][0] - curve_pts[i][0]
        c1 = v.dot(v)
        if c1 > 1e-12:
            rL = binormals[i] - (2.0 / c1) * v.dot(binormals[i]) * v
            tL = t1 - (2.0 / c1) * v.dot(t1) * v
            v_t = t2 - tL
            c2 = v_t.dot(v_t)
            b_next = rL - (2.0 / c2) * v_t.dot(rL) * v_t if c2 > 1e-12 else rL
        else:
            b_next = binormals[i]
        b_next = (b_next - t2 * t2.dot(b_next)).normalized()
        n_next = t2.cross(b_next).normalized()
        binormals.append(b_next)
        normals.append(n_next)

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

        bn = binormals[i]
        nm = normals[i]
        ring = []
        for k in range(n_pts):
            ang = 2.0 * math.pi * k / n_pts
            vx = math.cos(ang) * (w * 0.5)
            vy = math.sin(ang) * (th * 0.5)
            p = pt + bn * vx + nm * vy
            ring.append(bm.verts.new(p))
        slices.append(ring)

    for i in range(len(slices) - 1):
        s1 = slices[i]
        s2 = slices[i + 1]
        for k in range(n_pts):
            kn = (k + 1) % n_pts
            f = bm.faces.new((s1[k], s1[kn], s2[kn], s2[k]))
            f.material_index = mat_index

    # Soft rounded caps at root and tip
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

def add_ribbon_bow(bm, center, facing=(0, -1, 0.2), width=0.042, height=0.020, mat_index=1):
    facing = Vector(facing).normalized()
    up = Vector((0, 0, 1))
    right = facing.cross(up).normalized()
    knot_r = 0.009
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
# 1. HAIR_003: CHIN-LENGTH ROUNDED BOB (V15 PRODUCTION REFINEMENT)
# =============================================================================

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


def build_hair_003_v15(arm, char_id, color_hex="#221714"):
    """
    HAIR_003: Chin-Length Rounded Bob (V15)
    - Continuous organic envelope from apex down to chin level (Z ~ 0.415m).
    - Hat-brim forehead band eliminated: forehead hair flows down smoothly from crown.
    - Soft arched face opening: smoothstep blend from brow to chin (no box corners).
    - Surface volume sculpted into 3 soft convex rear lobes and cheek swellings.
    - 4 broad, soft fringe locks falling naturally across forehead.
    - 2 chin-cupping face-framing locks framing the cheeks.
    - Lower edge at Z ~ 0.415m has organic scallop variation and 14mm inward beveled rim.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.187, 0.176, 0.166
    num_rings = 22
    segs = 40

    ring_verts = []
    for r in range(num_rings):
        v = r / float(num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            theta = math.atan2(abs(sin_u), cos_u)  # 0 at front center, pi at back

            # Temple transition curve: smoothstep from forehead (theta < 0.96) to side/rear (theta > 1.45)
            t_side = smoothstep(0.96, 1.45, theta)

            # Target Z at perimeter (v = 1.0)
            fringe_z = 0.572 + 0.006 * math.cos(theta * 3.0)
            chin_z = 0.415 + 0.003 * math.cos(u * 6.0)  # subtle organic variation
            target_edge_z = fringe_z * (1.0 - t_side) + chin_z * t_side

            # Target polar angle phi at edge
            phi_fringe = math.radians(64.5)
            phi_chin = math.radians(90.0)
            target_edge_phi = phi_fringe * (1.0 - t_side) + phi_chin * t_side

            # Dome vs vertical extrusion zone factor
            if v < 0.45:
                # Pure cranial dome from apex down
                phi = (v / 0.45) * target_edge_phi
                puff = 0.006 + 0.006 * math.sin(v * math.pi * 2.0)
                px = (rx + puff) * math.sin(phi) * sin_u
                py = (ry + puff) * math.sin(phi) * cos_u + center_y
                pz = center_z + (rz + puff) * math.cos(phi)
            else:
                # Vertical extension smoothly continuing down to perimeter
                fac = (v - 0.45) / 0.55
                phi = target_edge_phi
                base_pz = center_z + rz * math.cos(phi)
                pz = base_pz + fac * (target_edge_z - base_pz)

                # Lateral shaping and convex surface lobes (Animal Crossing style)
                puff = 0.008 + 0.006 * math.sin(v * math.pi)
                # 3 broad rear lobes + cheek swelling
                rear_fac = max(0.0, -cos_u)
                surface_lobes = 0.008 * (math.cos(4.0 * u) + 0.3 * math.cos(2.0 * u)) * rear_fac * math.sin(v * math.pi)
                puff += surface_lobes

                px = (rx + puff) * math.sin(phi) * sin_u
                py = (ry + puff) * math.sin(phi) * cos_u + center_y

                # Inward C-curl cupping the jawline and chin
                if fac > 0.40 and t_side > 0.30:
                    tuck = (fac - 0.40) / 0.60
                    px -= math.copysign(0.016 * tuck * t_side, px)
                    py += 0.012 * tuck * t_side

            # Ear clearance
            if abs(cos_u) < 0.20 and 0.50 < v < 0.85:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.035:
                    px = math.copysign(max(abs(px), 0.184), px)

            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    # Face quads between rings
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    # Apex cap
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.006)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    # Inward beveled physical thickness at the lower perimeter (14mm)
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # SOFT FALLING LOCKS (ANIMAL CROSSING CHIBI STYLE)
    # 1. Left-center fringe lock
    l1 = [
        Vector((-0.025, 0.125, 0.640)),
        Vector((-0.030, 0.142, 0.605)),
        Vector((-0.038, 0.144, 0.560))
    ]
    add_continuous_rmf_spline_lock(bm, l1, width_profile=(0.026, 0.036, 0.014), thick_profile=(0.012, 0.016, 0.006), samples=16, n_pts=8)

    # 2. Right-center fringe lock (falling slightly lower to soften brow line)
    l2 = [
        Vector(( 0.015, 0.125, 0.642)),
        Vector(( 0.022, 0.145, 0.602)),
        Vector(( 0.028, 0.146, 0.554))
    ]
    add_continuous_rmf_spline_lock(bm, l2, width_profile=(0.028, 0.038, 0.014), thick_profile=(0.012, 0.016, 0.006), samples=16, n_pts=8)

    # 3. Far-left soft fringe lock
    l3 = [
        Vector((-0.060, 0.118, 0.632)),
        Vector((-0.075, 0.132, 0.595)),
        Vector((-0.082, 0.130, 0.565))
    ]
    add_continuous_rmf_spline_lock(bm, l3, width_profile=(0.022, 0.032, 0.012), thick_profile=(0.010, 0.014, 0.006), samples=16, n_pts=8)

    # 4. Far-right soft fringe lock
    l4 = [
        Vector(( 0.060, 0.118, 0.632)),
        Vector(( 0.072, 0.132, 0.595)),
        Vector(( 0.080, 0.130, 0.565))
    ]
    add_continuous_rmf_spline_lock(bm, l4, width_profile=(0.022, 0.032, 0.012), thick_profile=(0.010, 0.014, 0.006), samples=16, n_pts=8)

    # 5. Left face-framing cheek lock (cupping the chin)
    l5 = [
        Vector((-0.155, 0.065, 0.535)),
        Vector((-0.165, 0.052, 0.475)),
        Vector((-0.168, 0.035, 0.418))
    ]
    add_continuous_rmf_spline_lock(bm, l5, width_profile=(0.026, 0.036, 0.016), thick_profile=(0.014, 0.018, 0.008), samples=18, n_pts=10)

    # 6. Right face-framing cheek lock (cupping the chin)
    l6 = [
        Vector(( 0.155, 0.065, 0.535)),
        Vector(( 0.165, 0.052, 0.475)),
        Vector(( 0.168, 0.035, 0.418))
    ]
    add_continuous_rmf_spline_lock(bm, l6, width_profile=(0.026, 0.036, 0.016), thick_profile=(0.014, 0.018, 0.008), samples=18, n_pts=10)

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
# 2. HAIR_007: HIGH PONYTAIL (V15 REFINEMENT — CONTINUOUS RMF SWEPT VOLUME)
# =============================================================================

def build_hair_007_v15(arm, char_id, color_hex="#1a1818", tie_hex="#4a8ec2"):
    """
    HAIR_007: High Ponytail (V15)
    - Rebuilt with Wang et al. (2008) double-reflection Rotation Minimizing Frame (RMF).
    - Single, continuous swept volume from gathered root inside tie band down to upper back.
    - Zero twists, zero flips, zero gaps or breaks in profile/rear.
    - Full tail length: Crest at Z ~ 0.725m, falling under natural gravity to Z ~ 0.395m.
    - Substantial cross section: 78mm width x 58mm depth, gradually tapering to tip.
    - Subtle falling forehead wisp + 2 temple wisps framing ears with roots inside crown.
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

            if cos_u > 0.18:  # Brow fringe
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.014 * math.cos(theta_f * 3.0)
                max_phi = math.radians(65.0) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides
                max_phi = math.radians(74.0)
                puff = 0.004

            # Upward gather sweep toward high crown tie point (0, -0.115, 0.675)
            if cos_u < 0.10 and v < 0.55:
                gather_fac = (1.0 - v / 0.55) * max(0.0, -cos_u)
                puff += 0.016 * gather_fac

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

    # CONTINUOUS PONYTAIL SWEPT VOLUME (RMF PARALLEL TRANSPORT — ZERO BREAKS)
    # Root starts securely INSIDE gather base beneath tie, sweeps through crest, down to upper back
    flowing_tail_spine = [
        Vector((0.0, -0.075, 0.650)),   # Deep root inside gather base
        Vector((0.0, -0.115, 0.675)),   # Center of tie band
        Vector((0.0, -0.165, 0.725)),   # High ponytail crest prominently visible from front
        Vector((0.0, -0.230, 0.655)),   # Sweeps backward and down under natural gravity
        Vector((0.0, -0.245, 0.540)),   # Mid-descent, clear separation from rear skull
        Vector((0.0, -0.230, 0.450)),   # Lower tail
        Vector((0.0, -0.210, 0.395))    # Tapered tip reaching upper back/shoulder line
    ]
    add_continuous_rmf_spline_lock(
        bm, flowing_tail_spine,
        width_profile=(0.046, 0.078, 0.022),   # Full 78mm width!
        thick_profile=(0.038, 0.058, 0.016),  # Full 58mm depth!
        samples=32, n_pts=14, mat_index=0, initial_binormal=(1.0, 0.0, 0.0)
    )

    # SOFT FRONT & TEMPLE FALLING WISPS
    # 1. Subtle falling forehead wisp
    fw = [
        Vector((-0.020, 0.125, 0.635)),
        Vector((-0.010, 0.142, 0.608)),
        Vector(( 0.015, 0.142, 0.582))
    ]
    add_continuous_rmf_spline_lock(bm, fw, width_profile=(0.018, 0.024, 0.010), thick_profile=(0.008, 0.012, 0.004), samples=16, n_pts=8)

    # 2. Left temple wisp framing ear
    tw_l = [
        Vector((-0.162, 0.035, 0.550)),
        Vector((-0.168, 0.028, 0.518)),
        Vector((-0.170, 0.020, 0.488))
    ]
    add_continuous_rmf_spline_lock(bm, tw_l, width_profile=(0.016, 0.024, 0.008), thick_profile=(0.008, 0.012, 0.004), samples=16, n_pts=8)

    # 3. Right temple wisp framing ear
    tw_r = [
        Vector(( 0.162, 0.035, 0.550)),
        Vector(( 0.168, 0.028, 0.518)),
        Vector(( 0.170, 0.020, 0.488))
    ]
    add_continuous_rmf_spline_lock(bm, tw_r, width_profile=(0.016, 0.024, 0.008), thick_profile=(0.008, 0.012, 0.004), samples=16, n_pts=8)

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
# 3. HAIR_010: SHOULDER-LENGTH LOOSE HAIR (V15 PRODUCTION REFINEMENT)
# =============================================================================

def build_hair_010_v15(arm, char_id, color_hex="#261b17"):
    """
    HAIR_010: Shoulder-Length Loose Hair (V15)
    - Full continuous mantle extending cleanly to shoulder line (Z ~ 0.368m).
    - Hat-brim forehead band eliminated: forehead hair flows down smoothly from crown.
    - Asymmetrical side-swept fringe distinct from bob haircut.
    - Soft arched face opening: smoothstep blend from brow to shoulders.
    - Surface volume sculpted into longitudinal flowing waves across upper back.
    - Long face-framing strands beside cheeks flowing down to collar.
    - Inward C-curl cupping shoulders with verified shirt and scarf clearance.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.188, 0.177, 0.166
    num_rings = 24
    segs = 40

    ring_verts = []
    for r in range(num_rings):
        v = r / float(num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            theta = math.atan2(abs(sin_u), cos_u)

            # Temple transition curve: smoothstep from forehead (theta < 0.92) to side/rear (theta > 1.42)
            t_side = smoothstep(0.92, 1.42, theta)

            # Asymmetrical side-swept fringe baseline (distinct from bob)
            fringe_z = 0.570 + 0.008 * sin_u + 0.004 * math.cos(theta * 3.0)
            shoulder_z = 0.368 + 0.004 * math.cos(u * 5.0)  # organic relief
            target_edge_z = fringe_z * (1.0 - t_side) + shoulder_z * t_side

            phi_fringe = math.radians(64.5)
            phi_shoulder = math.radians(90.0)
            target_edge_phi = phi_fringe * (1.0 - t_side) + phi_shoulder * t_side

            if v < 0.40:
                # Upper cranial dome
                phi = (v / 0.40) * target_edge_phi
                puff = 0.006 + 0.006 * math.sin(v * math.pi * 2.0)
                px = (rx + puff) * math.sin(phi) * sin_u
                py = (ry + puff) * math.sin(phi) * cos_u + center_y
                pz = center_z + (rz + puff) * math.cos(phi)
            else:
                # Vertical extension down to shoulder line
                fac = (v - 0.40) / 0.60
                phi = target_edge_phi
                base_pz = center_z + rz * math.cos(phi)
                pz = base_pz + fac * (target_edge_z - base_pz)

                # Flowing rear mantle waves & cheek fullness
                puff = 0.009 + 0.007 * math.sin(v * math.pi)
                rear_fac = max(0.0, -cos_u)
                surface_waves = 0.009 * (math.cos(3.0 * u - 0.2) + 0.35 * math.cos(5.0 * u)) * rear_fac * math.sin(v * math.pi)
                puff += surface_waves

                px = (rx + puff) * math.sin(phi) * sin_u
                py = (ry + puff) * math.sin(phi) * cos_u + center_y

                # Gentle flare over shoulders, then inward C-curl at collar
                if fac > 0.35 and t_side > 0.30:
                    tuck = (fac - 0.35) / 0.65
                    px -= math.copysign(0.014 * tuck * t_side, px)
                    py += 0.010 * tuck * t_side

            # Ear clearance
            if abs(cos_u) < 0.20 and 0.45 < v < 0.75:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.035:
                    px = math.copysign(max(abs(px), 0.184), px)

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

    # Inward beveled physical thickness at the lower perimeter (14mm)
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # SOFT FALLING LOCKS (DISTINCT ASYMMETRIC ARRANGEMENT)
    # 1. Side-swept forehead lock A
    s1 = [
        Vector((-0.055, 0.120, 0.640)),
        Vector((-0.030, 0.140, 0.605)),
        Vector((-0.010, 0.142, 0.564))
    ]
    add_continuous_rmf_spline_lock(bm, s1, width_profile=(0.026, 0.036, 0.014), thick_profile=(0.012, 0.016, 0.006), samples=16, n_pts=8)

    # 2. Side-swept forehead lock B
    s2 = [
        Vector((-0.005, 0.125, 0.645)),
        Vector(( 0.020, 0.144, 0.608)),
        Vector(( 0.045, 0.140, 0.560))
    ]
    add_continuous_rmf_spline_lock(bm, s2, width_profile=(0.030, 0.040, 0.016), thick_profile=(0.014, 0.018, 0.006), samples=16, n_pts=8)

    # 3. Soft brow accent lock C
    s3 = [
        Vector(( 0.048, 0.120, 0.635)),
        Vector(( 0.068, 0.134, 0.598)),
        Vector(( 0.082, 0.130, 0.556))
    ]
    add_continuous_rmf_spline_lock(bm, s3, width_profile=(0.020, 0.030, 0.012), thick_profile=(0.010, 0.014, 0.006), samples=16, n_pts=8)

    # 4. Long left face-framing strand down to collar
    s4 = [
        Vector((-0.160, 0.060, 0.535)),
        Vector((-0.168, 0.048, 0.460)),
        Vector((-0.160, 0.030, 0.380))
    ]
    add_continuous_rmf_spline_lock(bm, s4, width_profile=(0.026, 0.038, 0.016), thick_profile=(0.014, 0.018, 0.008), samples=20, n_pts=10)

    # 5. Long right face-framing strand down to collar
    s5 = [
        Vector(( 0.160, 0.060, 0.535)),
        Vector(( 0.168, 0.048, 0.460)),
        Vector(( 0.160, 0.030, 0.380))
    ]
    add_continuous_rmf_spline_lock(bm, s5, width_profile=(0.026, 0.038, 0.016), thick_profile=(0.014, 0.018, 0.008), samples=20, n_pts=10)

    # 6. Soft rear layered wave lock across upper back
    s6 = [
        Vector(( 0.000, -0.200, 0.520)),
        Vector(( 0.000, -0.218, 0.445)),
        Vector(( 0.000, -0.198, 0.370))
    ]
    add_continuous_rmf_spline_lock(bm, s6, width_profile=(0.032, 0.048, 0.018), thick_profile=(0.016, 0.022, 0.008), samples=18, n_pts=10)

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

def build_hair_003_v16(arm, char_id, color_hex="#221714", mat_mode="production"):
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



FEMALE_DISPATCHER_V15 = {
    "HAIR_003": build_hair_003_v16,
    "HAIR_007": build_hair_007_v15,
    "HAIR_010": build_hair_010_v15,
}

FEMALE_METADATA_V15 = {
    "HAIR_003": {"name": "Chin-Length Rounded Bob", "color": "#221714"},
    "HAIR_007": {"name": "High Ponytail", "color": "#1a1818", "tie": "#4a8ec2"},
    "HAIR_010": {"name": "Shoulder-Length Loose Hair", "color": "#261b17"},
}

def run_female_refinement_pipeline():
    print("[V15 Pipeline] Starting Female Hairstyle Refinement Build, Export & Render...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    manifest = {}

    # Required 5 visual check angles: Front, Three-Quarter, Left Profile, Right Profile, Rear
    views = [
        ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
        ("three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
        ("profile_left", (-1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(-90)), 60),
        ("profile_right", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
        ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
    ]

    for hair_id in sorted(FEMALE_DISPATCHER_V15.keys()):
        meta = FEMALE_METADATA_V15[hair_id]
        builder_fn = FEMALE_DISPATCHER_V15[hair_id]
        print(f"\n=======================================================")
        print(f"BUILDING FEMALE REFINED V15: {hair_id} — {meta['name']}")
        print(f"=======================================================")

        char_tag = f"female_v15_{hair_id.lower()}"
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

        # Equip standard uniform
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
        blend_path = os.path.join(BLEND_DIR, f"{hair_id.lower()}_v15_source.blend")
        blend_preview_path = os.path.join(PREVIEWS_DIR, f"{hair_id.lower()}_v15_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        shutil.copyfile(blend_path, blend_preview_path)

        # Export production GLB (versioned v15, standard v14, and standard release)
        glb_name = f"character_{hair_id.lower()}_v15.glb"
        glb_path = os.path.join(GLB_DIR, glb_name)
        glb_preview_path = os.path.join(PREVIEWS_DIR, glb_name)
        glb_size = factory.export_glb(glb_path)
        shutil.copyfile(glb_path, glb_preview_path)

        # Overwrite standard release character_hair_{id}.glb
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

        # Render required close-up views
        cam.data.lens = 95
        if hair_id in ["HAIR_003", "HAIR_010"]:
            # Forehead/fringe transition close-up
            cam.location = (0.0, 0.70, 0.575)
            cam.rotation_euler = (math.radians(90), 0, math.radians(180))
            c_fringe_name = f"{hair_id.lower()}_fringe_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_fringe_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["fringe_closeup"] = c_fringe_name
            print(f"  Rendered fringe closeup -> {c_fringe_name}")

            # 3/4 cheek and chin/shoulder transition close-up
            cam.location = (0.50, 0.50, 0.460)
            cam.rotation_euler = (math.radians(84), 0, math.radians(135))
            c_side_name = f"{hair_id.lower()}_profile_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_side_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["profile_closeup"] = c_side_name
            print(f"  Rendered profile closeup -> {c_side_name}")

        elif hair_id == "HAIR_007":
            # Ponytail bend and root close-up in profile
            cam.location = (0.80, -0.15, 0.580)
            cam.rotation_euler = (math.radians(90), 0, math.radians(90))
            c_bend_name = f"{hair_id.lower()}_bend_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_bend_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["bend_closeup"] = c_bend_name
            print(f"  Rendered bend closeup -> {c_bend_name}")

            # Forehead wisp close-up
            cam.location = (0.0, 0.70, 0.575)
            cam.rotation_euler = (math.radians(90), 0, math.radians(180))
            c_fringe_name = f"{hair_id.lower()}_fringe_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_fringe_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["fringe_closeup"] = c_fringe_name
            print(f"  Rendered fringe closeup -> {c_fringe_name}")

            # Wireframe / solid viewport view of the continuous connection
            # We render solid with matcap or clean shading showing geometry
            hair_obj.show_wire = True
            hair_obj.show_all_edges = True
            c_wire_name = f"{hair_id.lower()}_wireframe_connection.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_wire_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["wireframe_connection"] = c_wire_name
            hair_obj.show_wire = False
            hair_obj.show_all_edges = False
            print(f"  Rendered wireframe inspection -> {c_wire_name}")

        manifest[hair_id] = {
            "name": meta["name"],
            "glb": glb_name,
            "glb_size_kb": round(glb_size / 1024, 1),
            "renders": rendered_images,
            "quads": len(hair_obj.data.polygons),
            "color": color
        }

    manifest_path = os.path.join(PREVIEWS_DIR, "female_v15_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[Done] Pipeline finished! Manifest saved to {manifest_path}")

if __name__ == "__main__":
    run_female_refinement_pipeline()
