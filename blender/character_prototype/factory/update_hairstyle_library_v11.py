"""
Update hairstyle_library.py to incorporate V11 implementations for:
- HAIR_001: Classic Bowl Cut
- HAIR_004: Side-Parted Short
- HAIR_008: Twin Pigtails
"""

import os
import shutil

LIB_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py"
BAK_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py.bak_v10"

if not os.path.exists(BAK_PATH):
    shutil.copyfile(LIB_PATH, BAK_PATH)
    print(f"Created backup at {BAK_PATH}")

with open(BAK_PATH, "r", encoding="utf-8") as f:
    code = f.read()

# 1. New helper functions to insert right before '# 12 PROCEDURAL HAIRSTYLE IMPLEMENTATIONS'
helper_code = '''
def apply_clean_subsurf(obj, levels=1):
    """Applies clean viewport and render subdivision surface modifier."""
    for p in obj.data.polygons:
        p.use_smooth = True
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = levels
    m.render_levels = levels

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

def add_soft_tapered_lock(bm, spine_points, width_profile, thick_profile, segs=8, n_pts=12, mat_index=0):
    """
    Extrudes a soft, continuous, curved stylized hair lock with gradual cubic smooth taper.
    Eliminates rigid segmented tubes, abrupt joints, pinched sections, and sharp horn-like spikes.
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
# 12 PROCEDURAL HAIRSTYLE IMPLEMENTATIONS
# ============================================================================='''

# 2. V11 Hair 001
new_hair_001 = '''def build_hair_001(arm, char_id, color_hex="#1c1615"):
    """
    HAIR_001: Classic Bowl Cut (Tóc úp nồi học trò THCS) - V11 Production
    - Retains compact rounded bowl silhouette.
    - Subtle, broad natural fringe groupings with inward forehead curvature.
    - Eyes and eyebrows remain 100% readable.
    - Continuous blended dome to nape without oversized rear bulge.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.185
    ry = 0.174
    rz = 0.165
    
    num_rings = 16
    segs = 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.18:  # FRONT FRINGE
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = (
                    0.035 * math.cos(theta_f * 2.2 + 0.3) +
                    0.020 * math.sin(theta_f * 4.1)
                )
                max_phi = math.radians(67.5) + fringe_var
                puff = 0.005 + 0.006 * math.sin(v * math.pi) - 0.003 * (v ** 2)
                
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(96.0) + back_fac * math.radians(26.0)
                puff = 0.003 + 0.002 * v
                
            else:  # SIDES & TEMPLES
                if cos_u >= 0.0:
                    max_phi = math.radians(76.0)
                else:
                    max_phi = math.radians(71.0)
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
    mat = create_stylized_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj'''

# 3. V11 Hair 004
new_hair_004 = '''def build_hair_004(arm, char_id, color_hex="#1a1c22"):
    """
    HAIR_004: Side-Parted Short (Tóc ngắn rẽ ngôi 7/3) - V11 Production
    - Clear off-center part at X = -0.048.
    - Broad 3D sweeping fringe flowing naturally across forehead.
    - Concealed lock roots with unified topology (eliminating pale spot artifact).
    - Shallow sculpted overlap suggests parting without exposing scalp.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.185
    ry = 0.174
    rz = 0.165
    
    num_rings = 16
    segs = 36
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # FOREHEAD & FRINGE
                if sin_u < -0.26:
                    max_phi = math.radians(58.0 + (sin_u + 0.26) * 12.0)
                    puff = 0.003 + 0.003 * v
                else:
                    sweep_fac = math.sin((sin_u + 0.26) / 1.26 * math.pi * 0.85)
                    max_phi = math.radians(60.0 + sweep_fac * 11.5)
                    puff = 0.004 + 0.008 * math.sin(v * math.pi) * max(0.0, sweep_fac)
                    
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(96.0) + back_fac * math.radians(26.0)
                puff = 0.003
            else:  # SIDES
                if sin_u > 0:
                    max_phi = math.radians(77.0)
                    puff = 0.005
                else:
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
            
    apex = bm.verts.new(Vector((-0.048, center_y + 0.005, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
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
        
    overlap_spine = [
        (-0.046, 0.065, 0.665),
        (-0.020, 0.095, 0.640),
        (0.045, 0.115, 0.605),
        (0.095, 0.100, 0.575),
        (0.125, 0.070, 0.545)
    ]
    add_soft_tapered_lock(bm, overlap_spine,
                          width_profile=(0.024, 0.038, 0.012),
                          thick_profile=(0.010, 0.014, 0.004),
                          segs=5, n_pts=10, mat_index=0)
                          
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_004", mesh)
    mat = create_stylized_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj'''

# 4. V11 Hair 008
new_hair_008 = '''def build_hair_008(arm, char_id, color_hex="#221714", tie_hex="#f4b41a"):
    """
    HAIR_008: Twin Pigtails (Tóc hai bên / Hai chùm) - V11 Production
    - Full continuous rear cranium coverage down to natural nape hairline (Z ~ 0.448).
    - Subtle center part groove along midline without splitting skull open.
    - Hair gathered toward side anchor points.
    - Soft curved tapering pigtail plumes passing visibly through simple neat ties.
    - Plumes clear of face and shoulders.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.185
    ry = 0.174
    rz = 0.165
    
    segs_half = 20
    num_rings = 16
    
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
                fringe_curve = 0.025 * math.sin(u * 2.0)
                max_phi = math.radians(67.5) + fringe_curve
                puff = 0.004 + 0.005 * math.sin(v * math.pi)
                
            elif cos_u < -0.15:  # CONTINUOUS REAR NAPE
                back_fac = -cos_u
                seam_dist = math.pi - u
                subtle_gather = 0.04 * math.sin(min(1.0, seam_dist / 0.8) * math.pi)
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0) - subtle_gather
                part_groove = math.sin(min(1.0, seam_dist / 0.85) * math.pi) * 0.010 * (v ** 0.5)
                puff = 0.004 + part_groove
                
            else:  # SIDES
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
        add_soft_tapered_lock(bm, pigtail_spine,
                              width_profile=(0.034, 0.062, 0.014),
                              thick_profile=(0.024, 0.042, 0.010),
                              segs=6, n_pts=14, mat_index=0)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008", mesh)
    mat_hair = create_stylized_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_hair_tie_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj'''

# Find insertion target for helpers
marker = "# =============================================================================\n# 12 PROCEDURAL HAIRSTYLE IMPLEMENTATIONS\n# ============================================================================="
if marker not in code:
    raise ValueError(f"Could not find marker in code: {marker}")

code = code.replace(marker, helper_code)

# Replace build_hair_001
import re
p1 = r'def build_hair_001\(arm, char_id, color_hex="#1c1615"\):.*?(?=def build_hair_002)'
match_001 = re.search(p1, code, re.DOTALL)
if not match_001:
    raise ValueError("Could not find build_hair_001")
code = code[:match_001.start()] + new_hair_001 + "\n\n" + code[match_001.end():]

# Replace build_hair_004
p4 = r'def build_hair_004\(arm, char_id, color_hex="#1a1c22"\):.*?(?=def build_hair_005)'
match_004 = re.search(p4, code, re.DOTALL)
if not match_004:
    raise ValueError("Could not find build_hair_004")
code = code[:match_004.start()] + new_hair_004 + "\n\n" + code[match_004.end():]

# Replace build_hair_008
p8 = r'def build_hair_008\(arm, char_id, color_hex="#221714", tie_hex="#f4b41a"\):.*?(?=def build_hair_009)'
match_008 = re.search(p8, code, re.DOTALL)
if not match_008:
    raise ValueError("Could not find build_hair_008")
code = code[:match_008.start()] + new_hair_008 + "\n\n" + code[match_008.end():]

with open(LIB_PATH, "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully updated hairstyle_library.py with V11 implementations!")
