"""
=============================================================================
CHIBI MODULAR HAIRSTYLE GENERATOR V11 — FULL 12-HAIRSTYLE PRODUCTION LIBRARY
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life Narrative Game (2012–2013)

Senior Stylized Character Artist & Procedural Geometry Engineer
All 12 Hairstyles Rebuilt with V11 Geometry Standards:
- Seamless cranial dome with inward beveled physical thickness (14mm rim)
- Soft, cubic-smooth tapered locks with rounded caps (no sharp horns/spikes)
- Continuous skull coverage down to natural nape hairline (Z ~ 0.448m)
- High ponytail prominently visible from front view (crest Z ~ 0.730m)
- Readable twin braids with bulbous interlocking plait segments and scrunchies
- Calibrated satin-matte shader (roughness=0.68, specular=0.18, sheen=0.25)
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler
import os
import sys

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
PREVIEW_OUT_DIR = os.path.join(FACTORY_DIR, "previews", "all_12_v11")
GLB_OUT_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_OUT_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")

os.makedirs(PREVIEW_OUT_DIR, exist_ok=True)
os.makedirs(GLB_OUT_DIR, exist_ok=True)
os.makedirs(BLEND_OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# COLOR UTILITIES
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

# ---------------------------------------------------------------------------
# SHADERS
# ---------------------------------------------------------------------------

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

# ---------------------------------------------------------------------------
# GEOMETRY UTILITIES
# ---------------------------------------------------------------------------

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

def add_smooth_hair_band(bm, center, axis=(0, 0, 1), major_r=0.018, minor_r=0.006, segs_u=16, segs_v=8, mat_index=1):
    """Creates a neat, simple stylized hair band that hair passes visibly through."""
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

def add_ribbon_bow(bm, center, facing=(0, -1, 0.3), width=0.040, height=0.020, mat_index=1):
    """Creates a cute chibi ribbon bow attached to a hair tie."""
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

def add_soft_tapered_lock(bm, spine_points, width_profile, thick_profile, segs=8, n_pts=12, mat_index=0):
    """
    Extrudes a soft, continuous, beautifully curved stylized hair lock with gradual taper.
    No abrupt joints, no pinched sections, no sharp horn-like spikes.
    """
    total_steps = segs * (len(spine_points) - 1)
    curve_pts = []
    for i in range(total_steps + 1):
        t = i / total_steps
        scaled_t = t * (len(spine_points) - 1)
        idx = min(int(scaled_t), len(spine_points) - 2)
        local_t = scaled_t - idx
        p1 = Vector(spine_points[idx])
        p2 = Vector(spine_points[idx + 1])
        smooth_t = local_t * local_t * (3.0 - 2.0 * local_t)
        curve_pts.append((p1.lerp(p2, smooth_t), t))
        
    w_start, w_mid, w_end = width_profile
    th_start, th_mid, th_end = thick_profile
    
    slices = []
    for i, (pt, t) in enumerate(curve_pts):
        if t < 0.40:
            fac = t / 0.40
            w = w_start + (w_mid - w_start) * (fac ** 0.85)
            th = th_start + (th_mid - th_start) * (fac ** 0.85)
        else:
            fac = (t - 0.40) / 0.60
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
# 12 MODULAR HAIRSTYLE IMPLEMENTATIONS (V11 FULL PRODUCTION)
# =============================================================================

# -----------------------------------------------------------------------------
# HAIR_001: Classic Bowl Cut (Approved V11)
# -----------------------------------------------------------------------------
def build_hair_001(arm, char_id, color_hex="#2b201c"):
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.18:
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.035 * math.cos(theta_f * 2.2 + 0.3) + 0.020 * math.sin(theta_f * 4.1)
                max_phi = math.radians(67.5) + fringe_var
                puff = 0.005 + 0.006 * math.sin(v * math.pi) - 0.003 * (v ** 2)
            elif cos_u < -0.15:
                back_fac = -cos_u
                max_phi = math.radians(96.0) + back_fac * math.radians(26.0)
                puff = 0.003 + 0.002 * v
            else:
                max_phi = math.radians(76.0) if cos_u >= 0.0 else math.radians(71.0)
                puff = 0.003
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
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
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
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

# -----------------------------------------------------------------------------
# HAIR_002: Sporty Short (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_002(arm, char_id, color_hex="#161b26"):
    """
    HAIR_002: Sporty Short.
    - Fitted athletic base dome with open energetic brow (Z ~ 0.595).
    - Soft directional clumps with rounded tips curving gently upward and forward.
    - NO sharp spikes, NO horn-like cones.
    - Continuous nape and tapered athletic sideburns.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.184, 0.173, 0.165
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.15:  # Forehead: open athletic brow
                theta_f = math.atan2(sin_u, cos_u)
                crest_swelling = 0.007 * math.cos(theta_f * 2.0)
                max_phi = math.radians(58.0) + crest_swelling
                puff = 0.004 + 0.006 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Back nape: tidy athletic taper
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides
                max_phi = math.radians(73.0)
                puff = 0.003
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
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
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.013 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    # Soft rounded directional locks (concealed roots inside crown!)
    directional_locks = [
        # Center crest tuft: soft forward/upward wave
        ([(0.000, 0.030, 0.665), (0.000, 0.075, 0.688), (0.000, 0.115, 0.675), (0.000, 0.138, 0.640)],
         (0.026, 0.040, 0.014), (0.012, 0.018, 0.006)),
        # Left brow tuft
        ([(-0.045, 0.045, 0.655), (-0.065, 0.085, 0.672), (-0.075, 0.120, 0.645)],
         (0.022, 0.034, 0.012), (0.010, 0.015, 0.005)),
        # Right brow tuft
        ([( 0.045, 0.045, 0.655), ( 0.065, 0.085, 0.672), ( 0.075, 0.120, 0.645)],
         (0.022, 0.034, 0.012), (0.010, 0.015, 0.005)),
        # Crown back crest: subtle boyish sweep
        ([(0.000, -0.040, 0.665), (0.000, -0.075, 0.688), (0.000, -0.105, 0.675)],
         (0.025, 0.038, 0.014), (0.012, 0.016, 0.006)),
    ]
    for spine, wp, tp in directional_locks:
        add_soft_tapered_lock(bm, spine, width_profile=wp, thick_profile=tp, segs=5, n_pts=10, mat_index=0)
        
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

# -----------------------------------------------------------------------------
# HAIR_003: Rounded Bob (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_003(arm, char_id, color_hex="#221714"):
    """
    HAIR_003: Rounded Bob.
    - Soft rounded bob framing cheeks with a smooth inward C-curve down to Z ~ 0.465.
    - Soft curtain bangs framing the forehead above the brows.
    - Tidy rounded nape contour with solid inward thickness.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.187, 0.176, 0.166
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.18:  # Soft curtain fringe
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.030 * math.sin(abs(theta_f) * 2.5)
                max_phi = math.radians(67.0) + fringe_var
                puff = 0.005 + 0.006 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape bob line
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.004
            else:  # Cheek lobes: hugging jawline down to Z ~ 0.465
                max_phi = math.radians(84.0)
                # Volumetric cheek lobe swelling, then curling inward toward jaw
                puff = 0.006 + 0.008 * math.sin(v * math.pi * 0.9) - 0.004 * (v ** 2)
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Bob hugs inward toward cheek at the bottom
            if abs(sin_u) > 0.65 and v > 0.75:
                px *= (1.0 - (v - 0.75) * 0.18)
                
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)
        
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.015 + Vector((0, 0, 0.006))
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

# -----------------------------------------------------------------------------
# HAIR_004: Side-Parted Short (Approved V11)
# -----------------------------------------------------------------------------
def build_hair_004(arm, char_id, color_hex="#241c19"):
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.15:
                if sin_u < -0.26:
                    max_phi = math.radians(58.0 + (sin_u + 0.26) * 12.0)
                    puff = 0.003 + 0.003 * v
                else:
                    sweep_fac = math.sin((sin_u + 0.26) / 1.26 * math.pi * 0.85)
                    max_phi = math.radians(60.0 + sweep_fac * 11.5)
                    puff = 0.004 + 0.008 * math.sin(v * math.pi) * max(0.0, sweep_fac)
            elif cos_u < -0.15:
                back_fac = -cos_u
                max_phi = math.radians(96.0) + back_fac * math.radians(26.0)
                puff = 0.003
            else:
                max_phi = math.radians(77.0) if sin_u > 0 else math.radians(73.0)
                puff = 0.005 if sin_u > 0 else 0.003
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
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
            
    apex = bm.verts.new(Vector((-0.048, center_y + 0.005, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    overlap_spine = [
        (-0.046, 0.065, 0.665),
        (-0.020, 0.095, 0.640),
        (0.045, 0.115, 0.605),
        (0.095, 0.100, 0.575),
        (0.125, 0.070, 0.545)
    ]
    add_soft_tapered_lock(bm, overlap_spine, width_profile=(0.024, 0.038, 0.012),
                          thick_profile=(0.010, 0.014, 0.004), segs=5, n_pts=10, mat_index=0)
                          
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

# -----------------------------------------------------------------------------
# HAIR_005: Medium Straight (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_005(arm, char_id, color_hex="#1e1816"):
    """
    HAIR_005: Medium Straight.
    - Soft straight student bangs (Z ~ 0.582).
    - Front side locks cascading down past collar to chest (Z ~ 0.360).
    - Smooth continuous curtain mantle falling down back to Z ~ 0.340.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.187, 0.176, 0.166
    num_rings, segs = 18, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.22:  # Bangs
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.025 * math.cos(theta_f * 3.0)
                max_phi = math.radians(67.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.10:  # Back mantle flowing down to Z ~ 0.340
                max_phi = math.radians(136.0)
                puff = 0.006 + 0.006 * v
            else:  # Front side locks cascading past collar to Z ~ 0.360
                max_phi = math.radians(128.0)
                puff = 0.006 + 0.004 * v
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Shape falling curtains clear of shoulders
            if v > 0.65:
                if cos_u < -0.10:  # Back drape follows back curve
                    py = min(py, -0.145 - 0.020 * (v - 0.65))
                elif abs(sin_u) > 0.45:  # Sides cascade smoothly
                    px = math.copysign(max(abs(px), 0.165), px)
                    
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)
        
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_005", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# -----------------------------------------------------------------------------
# HAIR_006: Low Ponytail (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_006(arm, char_id, color_hex="#1b1717", tie_hex="#e0564c"):
    """
    HAIR_006: Low Ponytail.
    - Cranium streamlined smoothly to low nape gathering anchor (Z ~ 0.465).
    - Soft student bangs in front.
    - Neat hair tie band around root with hair passing visibly through center.
    - S-curved ponytail lock draping naturally down to Z ~ 0.360.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.18:
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.030 * math.cos(theta_f * 2.5)
                max_phi = math.radians(67.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Streamlines back to nape tie point
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003 + 0.005 * v
            else:
                max_phi = math.radians(75.0)
                puff = 0.003
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
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
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    # Low tie anchor at nape
    tie_anchor = Vector((0.0, -0.170, 0.468))
    add_smooth_hair_band(bm, tie_anchor, axis=(0, 0.4, 0.9), major_r=0.019, minor_r=0.006, mat_index=1)
    
    # S-curved low ponytail plume
    tail_spine = [
        (0.000, -0.160, 0.478),  # inside gathered hair
        (0.000, -0.172, 0.465),  # through tie
        (0.000, -0.205, 0.440),  # soft crest
        (0.000, -0.215, 0.395),  # gentle belly
        (0.000, -0.195, 0.355)   # rounded blunt tip
    ]
    add_soft_tapered_lock(bm, tail_spine, width_profile=(0.038, 0.052, 0.016),
                          thick_profile=(0.024, 0.034, 0.010), segs=6, n_pts=12, mat_index=0)
                          
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_006", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# -----------------------------------------------------------------------------
# HAIR_007: High Ponytail (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_007(arm, char_id, color_hex="#1a1818", tie_hex="#4a8ec2"):
    """
    HAIR_007: High Ponytail.
    - High crown tie point (Z ~ 0.675).
    - Ponytail arches UPWARD to Z ~ 0.730m so it is PROMINENTLY VISIBLE FROM THE FRONT!
    - Cute ribbon bow at tie root.
    - Flared, buoyant tail locks cascading down clear of shoulders.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.18:
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.025 * math.cos(theta_f * 2.5)
                max_phi = math.radians(67.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Sweeps up toward high tie point
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003 + 0.006 * (1.0 - v)
            else:
                max_phi = math.radians(75.0)
                puff = 0.004
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
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
            
    apex = bm.verts.new(Vector((0.0, center_y - 0.035, center_z + rz + 0.008)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    # High tie anchor at crown
    tie_anchor = Vector((0.0, -0.065, 0.675))
    add_smooth_hair_band(bm, tie_anchor, axis=(0, -0.65, 0.75), major_r=0.022, minor_r=0.007, mat_index=1)
    add_ribbon_bow(bm, tie_anchor + Vector((0.0, -0.022, 0.014)), facing=(0, -1, 0.35), width=0.044, height=0.022, mat_index=1)
    
    # High fountain ponytail plume:
    # Arches UPWARD to Z ~ 0.730m so it billows visibly over the head in FRONT VIEW!
    tail_main = [
        (0.000, -0.055, 0.670),  # root inside crown
        (0.000, -0.075, 0.685),  # through tie
        (0.000, -0.125, 0.730),  # HIGH CREST (READABLE FROM FRONT!)
        (0.000, -0.210, 0.675),  # billowing arch
        (0.000, -0.235, 0.560),  # plump belly
        (0.000, -0.200, 0.450),  # inward cascade
        (0.000, -0.165, 0.395)   # rounded tip
    ]
    add_soft_tapered_lock(bm, tail_main, width_profile=(0.044, 0.068, 0.018),
                          thick_profile=(0.028, 0.042, 0.012), segs=6, n_pts=14, mat_index=0)
                          
    for sign in [-1, 1]:
        tail_flank = [
            (sign * 0.018, -0.075, 0.680),
            (sign * 0.045, -0.130, 0.718),
            (sign * 0.062, -0.215, 0.650),
            (sign * 0.045, -0.225, 0.530),
            (sign * 0.022, -0.180, 0.420)
        ]
        add_soft_tapered_lock(bm, tail_flank, width_profile=(0.032, 0.046, 0.014),
                              thick_profile=(0.020, 0.030, 0.010), segs=5, n_pts=10, mat_index=0)
                              
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_007", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# -----------------------------------------------------------------------------
# HAIR_008: Twin Pigtails (Approved V11)
# -----------------------------------------------------------------------------
def build_hair_008(arm, char_id, color_hex="#2b201c", tie_hex="#f5b82e"):
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    segs_half, num_rings = 20, 16
    
    grid_left, grid_right = [], []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row_l, row_r = [], []
        for s in range(segs_half + 1):
            u = math.pi * s / segs_half
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.15:
                fringe_curve = 0.025 * math.sin(u * 2.0)
                max_phi = math.radians(67.5) + fringe_curve
                puff = 0.004 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:
                back_fac = -cos_u
                seam_dist = math.pi - u
                subtle_gather = 0.04 * math.sin(min(1.0, seam_dist / 0.8) * math.pi)
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0) - subtle_gather
                part_groove = math.sin(min(1.0, seam_dist / 0.85) * math.pi) * 0.010 * (v ** 0.5)
                puff = 0.004 + part_groove
            else:
                max_phi = math.radians(75.0)
                puff = 0.006 + 0.004 * math.sin(v * math.pi)
                
            phi = v * max_phi
            base_x = (rx + puff) * math.sin(phi) * sin_u
            base_y = (ry + puff) * math.sin(phi) * cos_u + center_y
            base_z = center_z + (rz + puff) * math.cos(phi)
            
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((base_x - 0.166)**2 + (base_y + 0.005)**2 + (base_z - 0.515)**2)
                if ear_dist < 0.038:
                    base_z += (0.038 - ear_dist) * 0.85
                    base_x = max(base_x, 0.183)
                    
            vr = bm.verts.new(Vector((base_x, base_y, base_z)))
            row_r.append(vr)
            vl = vr if (s == 0 or s == segs_half) else bm.verts.new(Vector((-base_x, base_y, base_z)))
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
        
    for side_grid in [grid_right, grid_left]:
        rim_out = side_grid[-1]
        rim_in = []
        for s in range(len(rim_out)):
            vo = rim_out[s]
            p_in = vo.co + (Vector((0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
            rim_in.append(bm.verts.new(p_in))
        for s in range(len(rim_out) - 1):
            bm.faces.new((rim_out[s], rim_out[s+1], rim_in[s+1], rim_in[s]))

    for sign in [-1, 1]:
        gather_center = Vector((sign * 0.168, -0.048, 0.575))
        add_smooth_hair_band(bm, gather_center, axis=(sign * 0.65, -0.25, 0.70),
                             major_r=0.019, minor_r=0.0055, segs_u=16, segs_v=8, mat_index=1)
        pigtail_spine = [
            (sign * 0.155, -0.042, 0.582),
            (sign * 0.170, -0.050, 0.574),
            (sign * 0.198, -0.058, 0.555),
            (sign * 0.205, -0.046, 0.485),
            (sign * 0.182, -0.028, 0.420),
            (sign * 0.155, -0.016, 0.380)
        ]
        add_soft_tapered_lock(bm, pigtail_spine, width_profile=(0.034, 0.062, 0.014),
                              thick_profile=(0.024, 0.042, 0.010), segs=6, n_pts=14, mat_index=0)

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

# -----------------------------------------------------------------------------
# HAIR_009: Braided Hair (Rebuilt V11 — Iconic Twin Braids matching reference)
# -----------------------------------------------------------------------------
def build_hair_009(arm, char_id, color_hex="#1c1615", tie_hex="#e0564c"):
    """
    HAIR_009: Braided Hair.
    - Full cranium coverage with subtle center parting groove.
    - Soft student bangs in front.
    - Twin braids with bulbous, tactile interlocking teardrop plait segments cascading over shoulders/back.
    - Cute puffy scrunchies/ties and tapered end tassels matching user reference!
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    segs_half, num_rings = 20, 16
    
    grid_left, grid_right = [], []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row_l, row_r = [], []
        for s in range(segs_half + 1):
            u = math.pi * s / segs_half
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.15:
                fringe_curve = 0.025 * math.sin(u * 2.0)
                max_phi = math.radians(67.5) + fringe_curve
                puff = 0.004 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:
                back_fac = -cos_u
                seam_dist = math.pi - u
                subtle_gather = 0.03 * math.sin(min(1.0, seam_dist / 0.8) * math.pi)
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0) - subtle_gather
                part_groove = math.sin(min(1.0, seam_dist / 0.85) * math.pi) * 0.009 * (v ** 0.5)
                puff = 0.004 + part_groove
            else:
                max_phi = math.radians(75.0)
                puff = 0.005
                
            phi = v * max_phi
            base_x = (rx + puff) * math.sin(phi) * sin_u
            base_y = (ry + puff) * math.sin(phi) * cos_u + center_y
            base_z = center_z + (rz + puff) * math.cos(phi)
            
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((base_x - 0.166)**2 + (base_y + 0.005)**2 + (base_z - 0.515)**2)
                if ear_dist < 0.038:
                    base_z += (0.038 - ear_dist) * 0.85
                    base_x = max(base_x, 0.183)
                    
            vr = bm.verts.new(Vector((base_x, base_y, base_z)))
            row_r.append(vr)
            vl = vr if (s == 0 or s == segs_half) else bm.verts.new(Vector((-base_x, base_y, base_z)))
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
        
    for side_grid in [grid_right, grid_left]:
        rim_out = side_grid[-1]
        rim_in = []
        for s in range(len(rim_out)):
            vo = rim_out[s]
            p_in = vo.co + (Vector((0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
            rim_in.append(bm.verts.new(p_in))
        for s in range(len(rim_out) - 1):
            bm.faces.new((rim_out[s], rim_out[s+1], rim_in[s+1], rim_in[s]))

    # --- TWIN BRAIDS (Interlocking bulbous plait segments) ---
    for sign in [-1, 1]:
        # Origin at lower rear temple/nape
        root_x = sign * 0.125
        root_y = -0.135
        root_z = 0.490
        
        n_segments = 4
        z_step = 0.034
        for seg in range(n_segments):
            z_top = root_z - seg * z_step
            scale = 1.0 - seg * 0.09
            y_shift = root_y + seg * 0.007
            x_shift = root_x + (sign * 0.005 * seg)
            
            # Left lobule of plait
            spine_l = [
                (x_shift - sign * 0.016 * scale, y_shift - 0.008, z_top + 0.008),
                (x_shift + sign * 0.004 * scale, y_shift - 0.018 * scale, z_top - 0.008),
                (x_shift + sign * 0.018 * scale, y_shift - 0.006, z_top - 0.022)
            ]
            add_soft_tapered_lock(bm, spine_l, width_profile=(0.026 * scale, 0.038 * scale, 0.016 * scale),
                                  thick_profile=(0.020 * scale, 0.028 * scale, 0.012 * scale), segs=3, n_pts=6, mat_index=0)
            
            # Right lobule of plait
            spine_r = [
                (x_shift + sign * 0.016 * scale, y_shift - 0.008, z_top - 0.002),
                (x_shift - sign * 0.004 * scale, y_shift - 0.018 * scale, z_top - 0.018),
                (x_shift - sign * 0.018 * scale, y_shift - 0.006, z_top - 0.032)
            ]
            add_soft_tapered_lock(bm, spine_r, width_profile=(0.026 * scale, 0.038 * scale, 0.016 * scale),
                                  thick_profile=(0.020 * scale, 0.028 * scale, 0.012 * scale), segs=3, n_pts=6, mat_index=0)

        # End tie scrunchie
        z_end = root_z - n_segments * z_step
        tie_pos = Vector((root_x + sign * 0.022, root_y + 0.028, z_end))
        add_smooth_hair_band(bm, tie_pos, axis=(0, 0, 1), major_r=0.016, minor_r=0.006, segs_u=12, segs_v=6, mat_index=1)
        
        # End tassel
        tassel_spine = [
            (tie_pos.x, tie_pos.y, tie_pos.z - 0.004),
            (tie_pos.x + sign * 0.003, tie_pos.y - 0.006, tie_pos.z - 0.020),
            (tie_pos.x + sign * 0.002, tie_pos.y - 0.004, tie_pos.z - 0.036)
        ]
        add_soft_tapered_lock(bm, tassel_spine, width_profile=(0.022, 0.030, 0.008),
                              thick_profile=(0.015, 0.022, 0.006), segs=3, n_pts=6, mat_index=0)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_009", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# -----------------------------------------------------------------------------
# HAIR_010: Shoulder-Length Hair (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_010(arm, char_id, color_hex="#261b17"):
    """
    HAIR_010: Shoulder-Length Hair.
    - Soft rounded curtain bangs.
    - Cascades down to shoulder height (Z ~ 0.380).
    - Distinctive inward C-curl at all lower tips tucking around collar and neck.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.187, 0.176, 0.166
    num_rings, segs = 18, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.22:
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.025 * math.cos(theta_f * 3.0)
                max_phi = math.radians(67.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.12:  # Back shoulder fall
                max_phi = math.radians(118.0)
                puff = 0.006 + 0.008 * v
            else:  # Sides framing collar
                max_phi = math.radians(114.0)
                puff = 0.006 + 0.006 * v
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # --- INWARD C-CURL AT TIPS (Z ~ 0.380) ---
            if v > 0.70:
                curl_fac = (v - 0.70) / 0.30
                # Curls gently inward toward neck center
                px *= (1.0 - curl_fac * 0.14)
                py += curl_fac * 0.012
                pz += curl_fac * 0.008
                
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)
        
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.015 + Vector((0, 0, 0.006))
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

# -----------------------------------------------------------------------------
# HAIR_011: Side-Swept Bangs (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_011(arm, char_id, color_hex="#1a1b20"):
    """
    HAIR_011: Side-Swept Bangs (Tóc mái xéo phong trào 2012–2013).
    - Signature bold diagonal swooping fringe flowing from left temple across brow to right cheek.
    - Layered medium bob silhouette with cute subtle flip at side tips.
    - Nostalgic Vietnamese teen pop-culture styling.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.186, 0.175, 0.165
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.15:  # Forehead base
                # Asymmetric base: higher on left (origin of sweep), deeper on right
                asym = sin_u * 0.12
                max_phi = math.radians(64.0) + asym
                puff = 0.004 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(96.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides
                max_phi = math.radians(80.0) if sin_u > 0 else math.radians(74.0)
                puff = 0.005 if sin_u > 0 else 0.003
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
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
            
    apex = bm.verts.new(Vector((-0.035, center_y + 0.005, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    # Iconic 3D sweeping fringe (starts at left temple, sweeps boldly across forehead to right cheek)
    sweep_main = [
        (-0.095, 0.085, 0.640),  # concealed root at left crown
        (-0.035, 0.115, 0.620),  # swooping across brow
        ( 0.045, 0.128, 0.590),  # sweeping crest over brow
        ( 0.110, 0.110, 0.560),  # blending into right cheek
        ( 0.140, 0.075, 0.525)   # soft tapered flick
    ]
    add_soft_tapered_lock(bm, sweep_main, width_profile=(0.032, 0.054, 0.016),
                          thick_profile=(0.014, 0.022, 0.006), segs=6, n_pts=12, mat_index=0)
                          
    sweep_accent = [
        (-0.065, 0.095, 0.625),
        ( 0.010, 0.125, 0.600),
        ( 0.085, 0.120, 0.568),
        ( 0.125, 0.090, 0.538)
    ]
    add_soft_tapered_lock(bm, sweep_accent, width_profile=(0.022, 0.038, 0.012),
                          thick_profile=(0.010, 0.016, 0.004), segs=5, n_pts=10, mat_index=0)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_011", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# -----------------------------------------------------------------------------
# HAIR_012: Messy Short Hair (Rebuilt V11)
# -----------------------------------------------------------------------------
def build_hair_012(arm, char_id, color_hex="#1d1716"):
    """
    HAIR_012: Messy Short Hair.
    - Soft casual boyish school bedhead with natural organic volume.
    - Directional tousled locks with rounded tips (NO sharp horns or spikes).
    - Fully covered cranium down to tidy nape.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 16, 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)
            if cos_u > 0.15:  # Forehead: casual uneven tousled fringe
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.032 * math.cos(theta_f * 3.5 + 0.4) + 0.018 * math.sin(theta_f * 2.1)
                max_phi = math.radians(65.0) + fringe_var
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
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.013 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    # Soft tousled clumps at organic chibi angles
    tousled_locks = [
        # Crown left tuft
        ([(-0.035, 0.020, 0.665), (-0.055, 0.045, 0.692), (-0.075, 0.065, 0.690)],
         (0.024, 0.036, 0.012), (0.012, 0.016, 0.005)),
        # Crown right tuft
        ([( 0.030, 0.030, 0.665), ( 0.050, 0.060, 0.690), ( 0.070, 0.080, 0.685)],
         (0.024, 0.036, 0.012), (0.012, 0.016, 0.005)),
        # Mid crown tuft
        ([( 0.000, -0.030, 0.665), ( 0.010, -0.060, 0.692), ( 0.015, -0.090, 0.695)],
         (0.026, 0.038, 0.014), (0.012, 0.018, 0.006)),
        # Front brow tousled wisp
        ([(-0.020, 0.085, 0.640), (-0.030, 0.125, 0.620), (-0.035, 0.145, 0.585)],
         (0.020, 0.032, 0.010), (0.008, 0.014, 0.004)),
    ]
    for spine, wp, tp in tousled_locks:
        add_soft_tapered_lock(bm, spine, width_profile=wp, thick_profile=tp, segs=5, n_pts=10, mat_index=0)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_012", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# -----------------------------------------------------------------------------
# HAIRSTYLE DISPATCHER TABLE
# -----------------------------------------------------------------------------
HAIRSTYLE_DISPATCHER = {
    "HAIR_001": build_hair_001,
    "HAIR_002": build_hair_002,
    "HAIR_003": build_hair_003,
    "HAIR_004": build_hair_004,
    "HAIR_005": build_hair_005,
    "HAIR_006": build_hair_006,
    "HAIR_007": build_hair_007,
    "HAIR_008": build_hair_008,
    "HAIR_009": build_hair_009,
    "HAIR_010": build_hair_010,
    "HAIR_011": build_hair_011,
    "HAIR_012": build_hair_012,
}

HAIRSTYLE_METADATA = {
    "HAIR_001": {"name": "Classic Bowl Cut", "color": "#2b201c"},
    "HAIR_002": {"name": "Sporty Short", "color": "#161b26"},
    "HAIR_003": {"name": "Rounded Bob", "color": "#221714"},
    "HAIR_004": {"name": "Side-Parted Short", "color": "#241c19"},
    "HAIR_005": {"name": "Medium Straight", "color": "#1e1816"},
    "HAIR_006": {"name": "Low Ponytail", "color": "#1b1717", "tie": "#e0564c"},
    "HAIR_007": {"name": "High Ponytail", "color": "#1a1818", "tie": "#4a8ec2"},
    "HAIR_008": {"name": "Twin Pigtails", "color": "#2b201c", "tie": "#f5b82e"},
    "HAIR_009": {"name": "Braided Hair", "color": "#1c1615", "tie": "#e0564c"},
    "HAIR_010": {"name": "Shoulder-Length Hair", "color": "#261b17"},
    "HAIR_011": {"name": "Side-Swept Bangs", "color": "#1a1b20"},
    "HAIR_012": {"name": "Messy Short Hair", "color": "#1d1716"},
}
