"""
=============================================================================
CHIBI MODULAR HAIRSTYLE GENERATOR V12 — PILOT REFINEMENT
Targeted Artistic Refinement for:
- HAIR_001: Classic Bowl Cut
- HAIR_004: Side-Parted Short
- HAIR_008: Twin Pigtails

Specific Artistic Corrections:
1. HAIR_001:
   - Replaced flat horizontal cut with 4 broad, subtle, natural fringe groupings.
   - Shallow, organic length variations (tips sitting safely above eyebrows).
   - Inward curvature toward forehead with 14mm physical beveled thickness.
   - Subtle cranial flow lines breaking up the smooth helmet appearance.
   - Tidy rounded nape and balanced rear volume.

2. HAIR_004:
   - Distinct off-center part at X = -0.046 with continuous skull coverage beneath.
   - Major sweeping fringe mass with gentle root lift (+8mm Z, +6mm Y).
   - Dimensional supporting secondary lock beneath the main sweep.
   - Sleek tucked minor temple lock on the left side.
   - Coherent crown volume biased toward the sweep direction.

3. HAIR_008:
   - Continuous rear skull coverage preserved down to natural nape (Z = 0.448).
   - Base scalp volume visibly gathers into smooth conical lobes at tie anchors.
   - Prominently readable scrunchies/ties with cute ribbon bows.
   - Pigtails built with C1-continuous Catmull-Rom splines (no sharp elbows/pipes).
   - Plumes bell out into a chubby, buoyant teardrop below ties, then taper to rounded blunt tips.
   - Safe clearance from cheeks, ears, and shoulders.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import shutil
import json
from mathutils import Vector, Matrix, Euler

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v12")
GLB_OUT_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_OUT_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(GLB_OUT_DIR, exist_ok=True)
os.makedirs(BLEND_OUT_DIR, exist_ok=True)

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
    
    col = hex_to_linear_rgb(hex_color)
    bsdf.inputs["Base Color"].default_value = col
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.18
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.18
        
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = sheen
        if "Sheen Tint" in bsdf.inputs:
            bsdf.inputs["Sheen Tint"].default_value = (min(1.0, col[0] * 1.3), min(1.0, col[1] * 1.3), min(1.0, col[2] * 1.3), 1.0)
    elif "Sheen" in bsdf.inputs:
        bsdf.inputs["Sheen"].default_value = sheen
        
    return mat

def create_accessory_material(mat_name, hex_color="#f5b82e", roughness=0.45):
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        mat = bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    out_node = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])
    
    col = hex_to_linear_rgb(hex_color)
    bsdf.inputs["Base Color"].default_value = col
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.35
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.35
    return mat

def apply_clean_subsurf(obj, levels=1):
    for p in obj.data.polygons:
        p.use_smooth = True
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = levels
    m.render_levels = levels

def bind_hair_to_armature(hair_obj, armature_obj):
    if not armature_obj:
        return
    for m in hair_obj.modifiers:
        if m.type == 'ARMATURE':
            hair_obj.modifiers.remove(m)
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
# GEOMETRY UTILITIES: C1-CONTINUOUS SPLINES & CLEAN HAIR TIES
# ---------------------------------------------------------------------------

def catmull_rom_spline(control_points, samples_per_segment=8):
    """Generates a dense, perfectly smooth C1-continuous 3D curve through control points."""
    pts = [Vector(p) for p in control_points]
    if len(pts) < 2:
        return [(pts[0], 0.0)]
    
    # Pad ends for Catmull-Rom
    p_start = pts[0] + (pts[0] - pts[1])
    p_end = pts[-1] + (pts[-1] - pts[-2])
    all_p = [p_start] + pts + [p_end]
    
    curve = []
    num_segs = len(pts) - 1
    
    for i in range(num_segs):
        p0 = all_p[i]
        p1 = all_p[i + 1]
        p2 = all_p[i + 2]
        p3 = all_p[i + 3]
        
        for s in range(samples_per_segment if i < num_segs - 1 else samples_per_segment + 1):
            t = s / float(samples_per_segment)
            t2 = t * t
            t3 = t2 * t
            
            # Catmull-Rom basis matrix evaluation
            pos = 0.5 * (
                (2.0 * p1) +
                (-p0 + p2) * t +
                (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
                (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
            )
            global_t = (i + t) / float(num_segs)
            curve.append((pos, global_t))
            
    return curve

def add_smooth_hair_band(bm, center, axis=(0, 0, 1), major_r=0.021, minor_r=0.0065, segs_u=16, segs_v=8, mat_index=1):
    """Creates a clearly readable, neat stylized hair band that hair passes visibly through."""
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

def add_ribbon_bow(bm, center, facing=(0, -1, 0.3), width=0.038, height=0.018, mat_index=1):
    """Creates a clean, charming stylized ribbon bow knot attached to a hair tie."""
    facing = Vector(facing).normalized()
    up = Vector((0, 0, 1))
    right = facing.cross(up).normalized()
    knot_r = 0.007
    
    # Center knot (octahedron)
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
        
    # Bow wings
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

def add_smooth_spline_lock(bm, control_points, width_profile, thick_profile, samples=24, n_pts=12, mat_index=0):
    """
    Extrudes a continuous, perfectly smooth stylized hair lock along a Catmull-Rom spline.
    Zero sharp elbows, zero pipe joints, gradual cubic taper, rounded hemispherical caps.
    """
    curve_pts = catmull_rom_spline(control_points, samples_per_segment=max(4, samples // (len(control_points) - 1)))
    w_start, w_mid, w_end = width_profile
    th_start, th_mid, th_end = thick_profile
    
    slices = []
    for i, (pt, t) in enumerate(curve_pts):
        # Cubic bell-taper envelope
        if t < 0.35:
            fac = t / 0.35
            w = w_start + (w_mid - w_start) * (fac ** 0.85)
            th = th_start + (th_mid - th_start) * (fac ** 0.85)
        else:
            fac = (t - 0.35) / 0.65
            w = w_mid + (w_end - w_mid) * (fac ** 1.25)
            th = th_mid + (th_end - th_mid) * (fac ** 1.25)
            
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
            
    # Rounded Caps
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

# =============================================================================
# 1. REFINED HAIR_001: CLASSIC BOWL CUT (V12)
# =============================================================================

def build_hair_001_v12(arm, char_id, color_hex="#2b201c"):
    """
    HAIR_001: Classic Bowl Cut (V12 Refinement)
    - Compact, rounded bowl-cut silhouette.
    - 4 broad, subtle fringe groupings with shallow, organic length variation.
    - Inward curvature toward forehead with 14mm physical beveled thickness.
    - Blends smoothly into temples and crown with subtle directional facet lines.
    - Tidy rounded nape and balanced rear volume (no oversized rear bulge).
    - Eyebrows and eyes remain 100% visible.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.185
    ry = 0.174
    rz = 0.165
    
    num_rings = 18
    segs = 40
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            # --- FRONT FRINGE WITH 4 BROAD, NATURAL GROUPINGS ---
            if cos_u > 0.18:
                theta_f = math.atan2(sin_u, cos_u)
                
                # 4 distinct broad groupings:
                # Group 1 (left temple transition): theta_f ~ -0.7 rad
                # Group 2 (center-left main lock): theta_f ~ -0.22 rad (slightly longer, Z ~ 0.574)
                # Group 3 (center-right main lock): theta_f ~ +0.18 rad (subtle offset, Z ~ 0.578)
                # Group 4 (right temple transition): theta_f ~ +0.65 rad
                # Variation is shallow (~12mm), organic, NOT mathematical sinusoidal teeth
                grouping_var = (
                    0.055 * math.cos(theta_f * 2.8 + 0.25) * math.cos(theta_f * 1.2) +
                    0.022 * math.sin(theta_f * 5.2 - 0.4)
                )
                
                # Base latitude: average edge at Z ~ 0.580 (safely above eyebrows Z=0.569)
                max_phi = math.radians(67.0) + grouping_var
                
                # Inward curl at fringe edge: v swells smoothly, v > 0.8 curls inward toward forehead
                curl_in = 0.005 * (v ** 2)
                puff = 0.005 + 0.007 * math.sin(v * math.pi) - curl_in
                
                # Subtle volume clumps across forehead (breaks up smooth helmet look!)
                clump_puff = 0.0035 * math.cos(theta_f * 2.8 + 0.25) * math.sin(v * math.pi * 0.8)
                puff += clump_puff
                
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                # Snug, tidy rounded nape down to Z ~ 0.446 without bulging
                max_phi = math.radians(96.0) + back_fac * math.radians(25.0)
                puff = 0.003 + 0.002 * v
                # Subtle nape contour lines
                puff += 0.0015 * math.cos(sin_u * 6.0) * (v ** 1.5)
                
            else:  # SIDES & TEMPLES
                if cos_u >= 0.0:  # Temple blend
                    max_phi = math.radians(76.5)
                else:  # Around ear
                    max_phi = math.radians(71.5)
                puff = 0.0035
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Smooth ear clearance notch (ears at +/- 0.166, -0.005, 0.515)
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
            
    # Rounded crown apex
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.005)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    # Inward beveled rim: provides 14mm physical edge thickness
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        dir_in = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
        p_in = vo.co + dir_in * 0.014 + Vector((0, 0, 0.006))
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

# ---------------------------------------------------------------------------
# 2. REFINED HAIR_004: SIDE-PARTED SHORT (V12)
# ---------------------------------------------------------------------------

def build_hair_004_v12(arm, char_id, color_hex="#241c19"):
    """
    HAIR_004: Side-Parted Short (V12 Refinement)
    - Visible off-center part through shape and directional flow at X = -0.046.
    - Full continuous underlying scalp coverage (zero exposed scalp, no open seams).
    - Broad sweeping fringe mass with gentle root lift (+8mm Z, +6mm Y).
    - Supporting dimensional secondary lock beneath the main sweep.
    - Sleek tucked minor side on the left temple.
    - Crown and temple volume flowing coherently toward the sweep.
    - Tidy short-hair silhouette without oversized quiff or flat diagonal plate.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.185
    ry = 0.174
    rz = 0.165
    
    num_rings = 18
    segs = 40
    
    # Off-center part at X = -0.046 (sin_u ~ -0.25)
    # The base cranial mesh provides 100% full continuous skull coverage.
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # FOREHEAD & FRINGE
                if sin_u < -0.25:
                    # Minor (left) side: sleek comb-down exposing left eyebrow cleanly
                    max_phi = math.radians(58.0 + (sin_u + 0.25) * 10.0)
                    puff = 0.003 + 0.002 * v
                else:
                    # Major sweeping side:
                    # Directional sweep across brow to right temple
                    sweep_param = (sin_u + 0.25) / 1.25
                    sweep_fac = math.sin(sweep_param * math.pi * 0.90)
                    max_phi = math.radians(60.0 + sweep_fac * 13.0)
                    puff = 0.004 + 0.006 * math.sin(v * math.pi) * max(0.0, sweep_fac)
                    
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(96.0) + back_fac * math.radians(25.0)
                puff = 0.003
            else:  # SIDES
                if sin_u > 0:  # Right temple (receives the sweep)
                    max_phi = math.radians(78.0)
                    puff = 0.005
                else:  # Left temple (sleek tuck)
                    max_phi = math.radians(73.0)
                    puff = 0.003
                    
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
            
    # Off-center apex at part root (X = -0.046)
    apex = bm.verts.new(Vector((-0.046, center_y + 0.005, center_z + rz + 0.005)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    # Inward beveled rim: continuous 14mm edge thickness
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        dir_in = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
        p_in = vo.co + dir_in * 0.014 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    # --- 1. MAJOR SWEEPING FRINGE MASS (With Gentle Root Lift) ---
    # Emerges from the part line with gentle upward/forward lift,
    # arches gracefully across the brow, and tapers softly into the right temple.
    sweep_main_spine = [
        (-0.046, 0.055, 0.672),   # Deep inside part root
        (-0.040, 0.088, 0.678),   # Gentle root lift (+8mm Z, +6mm forward Y)
        (-0.010, 0.125, 0.648),   # Sweeping crest emerging over forehead
        ( 0.045, 0.138, 0.612),   # Broad sweeping belly over right brow
        ( 0.100, 0.122, 0.575),   # Swooping toward right temple
        ( 0.136, 0.085, 0.540)    # Soft tapered blend into right side volume
    ]
    add_smooth_spline_lock(bm, sweep_main_spine,
                           width_profile=(0.028, 0.052, 0.014),
                           thick_profile=(0.014, 0.024, 0.008),
                           samples=24, n_pts=12, mat_index=0)
                           
    # --- 2. SUPPORTING SECONDARY SWEEP LOCK ---
    # Sits right below the main sweep, providing dimensional layer separation
    # and eliminating any flat diagonal plate appearance!
    sweep_support_spine = [
        (-0.035, 0.080, 0.655),   # Concealed root below part
        ( 0.015, 0.128, 0.625),   # Supporting arch
        ( 0.070, 0.134, 0.585),   # Flowing lock tip over brow
        ( 0.115, 0.108, 0.550)    # Merges into temple
    ]
    add_smooth_spline_lock(bm, sweep_support_spine,
                           width_profile=(0.022, 0.036, 0.012),
                           thick_profile=(0.010, 0.016, 0.006),
                           samples=18, n_pts=10, mat_index=0)
                           
    # --- 3. MINOR SIDE TUCK (Left of part) ---
    # Neatly frames the left temple, clearly defining the off-center part separation
    minor_side_spine = [
        (-0.052, 0.060, 0.668),   # Root on minor side of part
        (-0.085, 0.085, 0.635),   # Sleek comb down
        (-0.120, 0.080, 0.585),   # Temple contour
        (-0.145, 0.055, 0.545)    # Tucks in front of ear
    ]
    add_smooth_spline_lock(bm, minor_side_spine,
                           width_profile=(0.022, 0.032, 0.012),
                           thick_profile=(0.010, 0.015, 0.006),
                           samples=18, n_pts=10, mat_index=0)

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

# ---------------------------------------------------------------------------
# 3. REFINED HAIR_008: TWIN PIGTAILS (V12)
# ---------------------------------------------------------------------------

def build_hair_008_v12(arm, char_id, color_hex="#2b201c", tie_hex="#f5b82e"):
    """
    HAIR_008: Twin Pigtails (V12 Refinement)
    - Full continuous rear skull coverage down to natural nape hairline (Z = 0.448).
    - Base scalp visibly gathers toward two lateral attachment points (conical gather lobes).
    - Clearly readable, neat hair ties (major_r = 0.022) with cute ribbon bows.
    - Continuous, softly curved pigtail plumes extruded via Catmull-Rom splines.
    - Plumes bell out into a chubby, buoyant teardrop below ties, then taper gradually to rounded blunt tips.
    - Zero pipe joints, zero sharp elbows, zero needle ends, zero blocky roots.
    - Maintained safe clearance from cheeks, ears, and shoulders.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.185
    ry = 0.174
    rz = 0.165
    
    segs_half = 20
    num_rings = 18
    
    grid_left = []
    grid_right = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row_l = []
        row_r = []
        
        for s in range(segs_half + 1):
            u = math.pi * s / segs_half
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # FRONT FRINGE
                # Cute curtain bangs sitting comfortably above eyebrows (Z ~ 0.582)
                fringe_curve = 0.025 * math.sin(u * 2.0)
                max_phi = math.radians(67.5) + fringe_curve
                puff = 0.004 + 0.005 * math.sin(v * math.pi)
                
            elif cos_u < -0.15:  # CONTINUOUS REAR NAPE (COVERING SKULL FULLY!)
                back_fac = -cos_u
                seam_dist = math.pi - u
                # Smooth nape line down to Z ~ 0.448
                subtle_gather = 0.035 * math.sin(min(1.0, seam_dist / 0.8) * math.pi)
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0) - subtle_gather
                
                # Subtle center part groove along midline
                part_groove = math.sin(min(1.0, seam_dist / 0.85) * math.pi) * 0.009 * (v ** 0.5)
                puff = 0.004 + part_groove
                
            else:  # SIDES: Gathered organically toward side anchor points
                max_phi = math.radians(75.5)
                # Volumetric conical swell toward the attachment anchors (X ~ 0.165, Y ~ -0.045)
                gather_fac = math.sin(min(1.0, (u - 0.4) / 0.8) * math.pi) if 0.4 <= u <= 1.2 else 0.0
                puff = 0.006 + 0.010 * gather_fac * (v ** 0.7)
                
            phi = v * max_phi
            base_x = (rx + puff) * math.sin(phi) * sin_u
            base_y = (ry + puff) * math.sin(phi) * cos_u + center_y
            base_z = center_z + (rz + puff) * math.cos(phi)
            
            # Ear clearance
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((base_x - 0.166)**2 + (base_y + 0.005)**2 + (base_z - 0.515)**2)
                if ear_dist < 0.038:
                    base_z += (0.038 - ear_dist) * 0.85
                    base_x = max(base_x, 0.183)
                    
            vr = bm.verts.new(Vector((base_x, base_y, base_z)))
            row_r.append(vr)
            
            if s == 0 or s == segs_half:
                vl = vr
            else:
                vl = bm.verts.new(Vector((-base_x, base_y, base_z)))
            row_l.append(vl)
            
        grid_right.append(row_r)
        grid_left.append(row_l)
        
    for r in range(num_rings - 1):
        for s in range(segs_half):
            bm.faces.new((grid_right[r][s], grid_right[r][s+1], grid_right[r+1][s+1], grid_right[r+1][s]))
            bm.faces.new((grid_left[r][s+1], grid_left[r][s], grid_left[r+1][s], grid_left[r+1][s+1]))
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.004)))
    for s in range(segs_half):
        bm.faces.new((apex, grid_right[0][s], grid_right[0][s+1]))
        bm.faces.new((apex, grid_left[0][s+1], grid_left[0][s]))
        
    # Inward beveled rim
    for side_grid in [grid_right, grid_left]:
        rim_out = side_grid[-1]
        rim_in = []
        for s in range(len(rim_out)):
            vo = rim_out[s]
            p_in = vo.co + (Vector((0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
            rim_in.append(bm.verts.new(p_in))
        for s in range(len(rim_out) - 1):
            bm.faces.new((rim_out[s], rim_out[s+1], rim_in[s+1], rim_in[s]))

    # --- TWIN PIGTAILS & CLEARLY READABLE TIES ---
    for sign in [-1, 1]:
        # Gathered anchor location
        tie_center = Vector((sign * 0.170, -0.046, 0.578))
        tie_axis = Vector((sign * 0.65, -0.22, 0.72)).normalized()
        
        # 1. Clearly readable hair tie scrunchie (hair passes visibly through center)
        add_smooth_hair_band(bm, tie_center, axis=tie_axis,
                             major_r=0.021, minor_r=0.0065, segs_u=16, segs_v=8, mat_index=1)
                             
        # 2. Cute ribbon bow on the outside of each tie for crisp readability
        bow_facing = Vector((sign * 0.55, -0.80, 0.25)).normalized()
        bow_pos = tie_center + Vector((sign * 0.016, -0.012, 0.010))
        add_ribbon_bow(bm, bow_pos, facing=bow_facing, width=0.034, height=0.016, mat_index=1)
        
        # 3. Soft, continuous, buoyant pigtail plume (Catmull-Rom spline)
        # Bells out into chubby teardrop below tie, curves gracefully down clear of shoulder,
        # tapers smoothly to a soft rounded blunt tip.
        pigtail_control_points = [
            (sign * 0.155, -0.040, 0.584),  # Root inside gathered scalp
            (sign * 0.172, -0.048, 0.576),  # Passes cleanly through tie center
            (sign * 0.208, -0.056, 0.555),  # Buoyant outward crest
            (sign * 0.218, -0.045, 0.485),  # Chubby, plump belly (widest section)
            (sign * 0.195, -0.028, 0.425),  # Smooth inward curvature
            (sign * 0.165, -0.015, 0.380)   # Soft rounded blunt tip
        ]
        add_smooth_spline_lock(bm, pigtail_control_points,
                               width_profile=(0.034, 0.058, 0.016),
                               thick_profile=(0.024, 0.040, 0.012),
                               samples=28, n_pts=14, mat_index=0)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# STUDIO ENVIRONMENT FOR V12 RENDERS
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
# BATCH EXECUTION & VALIDATION
# ---------------------------------------------------------------------------

def run():
    print("[Pipeline] Starting V12 Pilot Hairstyles Rework & Render...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    
    pilot_styles = [
        ("HAIR_001", "Classic Bowl Cut", build_hair_001_v12, "#2b201c"),
        ("HAIR_004", "Side-Parted Short", build_hair_004_v12, "#241c19"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_hair_008_v12(arm, cid, col, "#f5b82e"), "#2b201c")
    ]
    
    manifest = {}

    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n=======================================================")
        print(f"BUILDING V12 ART PILOT: {h_id} — {h_name}")
        print(f"=======================================================")
        char_tag = f"v12_{h_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)
        
        for o in list(bpy.data.objects):
            if o.name.startswith("Hair_"):
                bpy.data.objects.remove(o, do_unlink=True)
                
        arm = factory.arm
        hair_obj = builder_fn(arm, char_tag, def_color)
        print(f"[Built] {hair_obj.name}: {len(hair_obj.data.polygons)} quads")
        
        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        factory.equip_accessories(["ACC_002"], char_tag)
        
        # Save source .blend
        blend_path = os.path.join(BLEND_OUT_DIR, f"{h_id.lower()}_v12_source.blend")
        blend_preview_path = os.path.join(OUT_DIR, f"{h_id.lower()}_v12_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        shutil.copyfile(blend_path, blend_preview_path)
        print(f"  Saved Blend -> {blend_path}")
        
        # Export GLB
        glb_name = f"character_{h_id.lower()}_v12.glb"
        glb_path = os.path.join(GLB_OUT_DIR, glb_name)
        glb_preview_path = os.path.join(OUT_DIR, glb_name)
        glb_size = factory.export_glb(glb_path)
        shutil.copyfile(glb_path, glb_preview_path)
        print(f"  Exported GLB -> {glb_path} ({glb_size / 1024:.1f} KB)")
        
        # Studio setup and renders
        scene = bpy.context.scene
        cam = setup_chibi_studio(scene, res=(768, 896))
        
        # 5 required angles + closeups
        views = [
            ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
            ("three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
            ("side", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
            ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
            ("elevated_rear", (0.0, -0.85, 0.820), (math.radians(65), 0, 0), 60),
            ("fringe_closeup", (0.0, 0.52, 0.575), (math.radians(88), 0, math.radians(180)), 90),
            ("nape_closeup", (0.0, -0.52, 0.490), (math.radians(92), 0, 0), 90),
        ]
        
        if h_id == "HAIR_004":
            views.append(("part_closeup", (-0.05, 0.50, 0.630), (math.radians(85), 0, math.radians(180)), 95))
        elif h_id == "HAIR_008":
            views.append(("root_closeup", (0.35, -0.25, 0.580), (math.radians(85), 0, math.radians(125)), 95))
            views.append(("tail_closeup", (0.45, -0.10, 0.460), (math.radians(88), 0, math.radians(105)), 90))
            
        rendered_images = {}
        for vname, loc, rot, lens in views:
            cam.location = loc
            cam.rotation_euler = rot
            cam.data.lens = lens
            img_filename = f"{h_id.lower()}_{vname}.png"
            img_path = os.path.join(OUT_DIR, img_filename)
            scene.render.filepath = img_path
            bpy.ops.render.render(write_still=True)
            rendered_images[vname] = img_filename
            print(f"  Rendered {vname} -> {img_filename}")
            
        manifest[h_id] = {
            "name": h_name,
            "glb": glb_name,
            "glb_size_kb": round(glb_size / 1024, 1),
            "renders": rendered_images,
            "quads": len(hair_obj.data.polygons),
            "color": def_color
        }
        
    manifest_path = os.path.join(OUT_DIR, "v12_pilot_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[Done] V12 Pilot Pipeline finished! Manifest saved to {manifest_path}")

if __name__ == "__main__":
    run()
