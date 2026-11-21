"""
=============================================================================
PRODUCTION-GRADE CHIBI HAIRSTYLE GENERATOR (V8)
Animal Crossing & Play Together Inspired Soft Stylized 3D Hair System.

Pilot Hairstyles:
1. HAIR_001 — Classic Bowl Cut (Continuous volumetric mushroom bowl, quad-cap, scalloped fringe at eyebrow level)
2. HAIR_004 — Side-Parted Short (Defined part line, broad 3D curved sweeping fringe, sleek minor side)
3. HAIR_008 — Twin Pigtails (Dual-lobed back skull with 2 distinct rounded lobes + high nape + puffy cloud scrunchies + plump bouncy bunches)
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

import character_factory
from hairstyle_library import hex_to_linear_rgb, bind_hair_to_armature

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v8")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# SHADERS: SOFT SATIN / MATTE CHIBI MATERIALS
# ---------------------------------------------------------------------------

def create_chibi_hair_shader(mat_name, hex_color="#2b201c", roughness=0.72):
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        mat = bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    col = hex_to_linear_rgb(hex_color)
    bsdf.inputs["Base Color"].default_value = col
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.12
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.12
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = 0.35
        if "Sheen Tint" in bsdf.inputs:
            bsdf.inputs["Sheen Tint"].default_value = (min(1.0, col[0] * 1.4), min(1.0, col[1] * 1.3), min(1.0, col[2] * 1.2), 1.0)
    elif "Sheen" in bsdf.inputs:
        bsdf.inputs["Sheen"].default_value = 0.35
    if "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = 0.04
        if "Subsurface Radius" in bsdf.inputs:
            bsdf.inputs["Subsurface Radius"].default_value = (0.05, 0.03, 0.02)
    elif "Subsurface" in bsdf.inputs:
        bsdf.inputs["Subsurface"].default_value = 0.04
    return mat

def create_scrunchie_shader(mat_name, hex_color="#f4b41a", roughness=0.45):
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        mat = bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = hex_to_linear_rgb(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.16
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.16
    return mat

def apply_subdiv(obj, levels=1):
    for p in obj.data.polygons:
        p.use_smooth = True
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = levels
    m.render_levels = levels

# ---------------------------------------------------------------------------
# GEOMETRY HELPERS
# ---------------------------------------------------------------------------

def add_marshmallow_scrunchie(bm, center, axis=(0, 0, 1), major_r=0.025, minor_r=0.012,
                             num_puffs=6, segs_u=18, segs_v=8, mat_index=1):
    """Creates a soft, puffy marshmallow cloud scrunchie."""
    axis = Vector(axis).normalized()
    up = Vector((0, 0, 1)) if abs(axis.z) < 0.88 else Vector((0, 1, 0))
    u_dir = axis.cross(up).normalized()
    v_dir = axis.cross(u_dir).normalized()
    
    rings = []
    for i in range(segs_u):
        ang_u = 2.0 * math.pi * i / segs_u
        puff = 1.0 + 0.32 * math.cos(num_puffs * ang_u)
        r_maj = major_r * puff
        r_min = minor_r * (0.85 + 0.30 * math.cos(num_puffs * ang_u))
        c_ring = center + (u_dir * math.cos(ang_u) + v_dir * math.sin(ang_u)) * r_maj
        rad_dir = (c_ring - center).normalized()
        ring_v = []
        for j in range(segs_v):
            ang_v = 2.0 * math.pi * j / segs_v
            p = c_ring + (rad_dir * math.cos(ang_v) + axis * math.sin(ang_v)) * r_min
            ring_v.append(bm.verts.new(p))
        rings.append(ring_v)
        
    for i in range(segs_u):
        inxt = (i + 1) % segs_u
        for j in range(segs_v):
            jnxt = (j + 1) % segs_v
            f = bm.faces.new((rings[i][j], rings[i][jnxt], rings[inxt][jnxt], rings[inxt][j]))
            f.material_index = mat_index

def add_plump_pigtail_bunch(bm, spine_points, width_profile=(0.040, 0.075, 0.016),
                            thick_profile=(0.026, 0.048, 0.012), segs=5):
    """
    Extrudes an adorable, plump, bouncy chibi pigtail bunch along a 3D spline.
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
            w = w_start + (w_mid - w_start) * (fac ** 0.8)
            th = th_start + (th_mid - th_start) * (fac ** 0.8)
        else:
            fac = (t - 0.40) / 0.60
            w = w_mid + (w_end - w_mid) * (fac ** 1.3)
            th = th_mid + (th_end - th_mid) * (fac ** 1.3)
            
        if i < len(curve_pts) - 1:
            tangent = (curve_pts[i + 1][0] - pt).normalized()
        else:
            tangent = (pt - curve_pts[i - 1][0]).normalized()
            
        up = Vector((0, 0, 1))
        if abs(tangent.dot(up)) > 0.88:
            up = Vector((0, 1, 0))
        binormal = tangent.cross(up).normalized()
        normal = binormal.cross(tangent).normalized()
        
        hw = w * 0.5
        qw = w * 0.35
        hth = th * 0.5
        qth = th * 0.35
        
        v0 = bm.verts.new(pt - binormal * hw)
        v1 = bm.verts.new(pt - binormal * qw + normal * qth)
        v2 = bm.verts.new(pt + normal * hth)
        v3 = bm.verts.new(pt + binormal * qw + normal * qth)
        v4 = bm.verts.new(pt + binormal * hw)
        v5 = bm.verts.new(pt + binormal * qw - normal * qth)
        v6 = bm.verts.new(pt - normal * hth)
        v7 = bm.verts.new(pt - binormal * qw - normal * qth)
        slices.append((v0, v1, v2, v3, v4, v5, v6, v7))
        
    for i in range(len(slices) - 1):
        s1 = slices[i]
        s2 = slices[i + 1]
        for k in range(8):
            kn = (k + 1) % 8
            bm.faces.new((s1[k], s1[kn], s2[kn], s2[k]))
            
    s0 = slices[0]
    bm.faces.new((s0[0], s0[7], s0[6], s0[5], s0[4], s0[3], s0[2], s0[1]))
    se = slices[-1]
    bm.faces.new((se[0], se[1], se[2], se[3], se[4], se[5], se[6], se[7]))

# ---------------------------------------------------------------------------
# 1. HAIR_001: CLASSIC BOWL CUT (QUAD CAP, ZERO POLE PINCHING)
# ---------------------------------------------------------------------------

def build_chibi_hair_001(arm, char_id, color_hex="#2b201c"):
    """
    HAIR_001: Classic Bowl Cut.
    - Sits cleanly on the head as a unified, smooth mushroom bowl.
    - Crown has a smooth quad cap (NO pointy pole!).
    - Front fringe reaches Z ~ 0.554 (right at eyebrow level), with 3 clean,
      softly scalloped cuts framing the forehead.
    - Ear clearance notch at Z ~ 0.535 and neat tapered sideburns at Z ~ 0.505.
    - Back covers nape down to Z ~ 0.435.
    - Solid beveled inward rim.
    """
    bm = bmesh.new()
    
    center_y = -0.012
    center_z = 0.528
    rx = 0.188
    ry = 0.178
    rz = 0.168
    
    num_rings = 14
    segs = 32
    
    ring_verts = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)  # 0 at crown, 1 at rim
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)  # X
            cos_u = math.cos(u)  # Y
            
            if cos_u > 0.15:  # FRONT FRINGE
                theta_f = math.atan2(sin_u, cos_u)
                scallop = 0.06 * (math.cos(theta_f * 2.5) ** 2)
                # Phi reaches ~ 80 deg -> lands Z at ~ 0.554 (eyebrow level!)
                max_phi = math.radians(80.0) + scallop
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(100.0) + back_fac * math.radians(34.0)  # Z ~ 0.435
            else:  # SIDES
                if cos_u >= 0.0:
                    max_phi = math.radians(84.0)  # sideburn down to Z ~ 0.505
                else:
                    max_phi = math.radians(76.0)  # ear notch Z ~ 0.535
                    
            # At crown (v=0), phi=0 (top of dome). No offset!
            phi = v * max_phi
            
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            # Ear notch
            if abs(cos_u) < 0.22 and v > 0.65:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.186), px)
                    
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)
        
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))
            
    # Crown cap: Grid fill with a central quad patch (zero pole pinching!)
    # Collapse the top ring 0 vertices smoothly to a single point with smooth normal
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    # Inward beveled rim (solid thickness)
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        dir_in = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
        p_in = vo.co + dir_in * 0.016 + Vector((0, 0, 0.008))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_001_v8", mesh)
    mat = create_chibi_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    apply_subdiv(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# 2. HAIR_004: SIDE-PARTED SHORT (ANIMAL CROSSING ASYMMETRIC SWEEP)
# ---------------------------------------------------------------------------

def build_chibi_hair_004(arm, char_id, color_hex="#241c19"):
    """
    HAIR_004: Side-Parted Short.
    - Side part at X = -0.055.
    - Base short haircut volume down to nape.
    - Sweeping hair mass that flows across the forehead with true 3D curvature,
      forming a broad, beautiful stylized sweep down to the right temple.
    - Minor side combed sleekly down the left temple.
    """
    bm = bmesh.new()
    
    center_y = -0.012
    center_z = 0.528
    rx = 0.185
    ry = 0.175
    rz = 0.165
    
    num_rings = 12
    segs = 32
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # Forehead hairline
                max_phi = math.radians(65.0)
            elif cos_u < -0.15:  # Back nape
                back_fac = -cos_u
                max_phi = math.radians(100.0) + back_fac * math.radians(34.0)
            else:
                max_phi = math.radians(78.0)
                
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            if abs(cos_u) < 0.22 and v > 0.65:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.185), px)
                    
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)
        
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))
            
    apex = bm.verts.new(Vector((-0.055, center_y, center_z + rz)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    # VOLUMETRIC SWEEPING FRINGE (Major mass)
    cols = 16
    rows = 6
    sweep_grid = []
    
    for r in range(rows):
        v = r / (rows - 1)  # 0 at root, 1 at fringe bottom
        row = []
        for c in range(cols):
            u = c / (cols - 1)  # 0 at part (X ~ -0.055), 1 at right temple (X ~ 0.155)
            
            ang_deg = 18.0 - u * 80.0
            theta = math.radians(ang_deg)
            
            phi_root = math.radians(38.0 + u * 12.0)
            # Fringe tip: curves down to 80 deg (Z ~ 0.555) in mid-brow, sweeps up to 74 deg at temple
            phi_tip = math.radians(80.0 - math.sin(u * math.pi * 0.8) * 8.0)
            phi = phi_root * (1.0 - v) + phi_tip * v
            
            puff = 0.012 + math.sin(v * math.pi) * 0.010
            
            px = (rx + puff) * math.sin(phi) * (-math.sin(theta))
            py = (ry + puff) * math.sin(phi) * math.cos(theta) + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            row.append(bm.verts.new(Vector((px, py, pz))))
        sweep_grid.append(row)
        
    for r in range(rows - 1):
        for c in range(cols - 1):
            bm.faces.new((sweep_grid[r][c], sweep_grid[r][c+1], sweep_grid[r+1][c+1], sweep_grid[r+1][c]))
            
    # Solid bottom rim for sweep
    sweep_rim_out = sweep_grid[-1]
    sweep_rim_in = []
    for c in range(cols):
        vo = sweep_rim_out[c]
        p_in = vo.co + Vector((0, -0.014, 0.008))
        sweep_rim_in.append(bm.verts.new(p_in))
    for c in range(cols - 1):
        bm.faces.new((sweep_rim_out[c], sweep_rim_out[c+1], sweep_rim_in[c+1], sweep_rim_in[c]))

    # Minor side sweep (Left temple)
    m_cols = 8
    m_rows = 5
    m_grid = []
    for r in range(m_rows):
        v = r / (m_rows - 1)
        row = []
        for c in range(m_cols):
            u = c / (m_cols - 1)
            ang_deg = 18.0 + u * 45.0
            theta = math.radians(ang_deg)
            phi_root = math.radians(38.0 + u * 10.0)
            phi_tip = math.radians(76.0 + u * 6.0)
            phi = phi_root * (1.0 - v) + phi_tip * v
            puff = 0.010 + math.sin(v * math.pi) * 0.008
            px = (rx + puff) * math.sin(phi) * (-math.sin(theta))
            py = (ry + puff) * math.sin(phi) * math.cos(theta) + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            row.append(bm.verts.new(Vector((px, py, pz))))
        m_grid.append(row)
        
    for r in range(m_rows - 1):
        for c in range(m_cols - 1):
            bm.faces.new((m_grid[r][c], m_grid[r][c+1], m_grid[r+1][c+1], m_grid[r+1][c]))

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_004_v8", mesh)
    mat = create_chibi_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    apply_subdiv(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# 3. HAIR_008: TWIN PIGTAILS (PROPER DUAL LOBES & HIGH NAPE)
# ---------------------------------------------------------------------------

def build_chibi_hair_008(arm, char_id, color_hex="#2b201c", tie_hex="#f4b41a"):
    """
    HAIR_008: Twin Pigtails.
    Reference: Image 2 & Animal Crossing.
    - Back of skull has TWO DISTINCT ROUNDED LOBES that meet along X = 0!
      At X = 0, hair dips to Y = -0.178 (right on scalp).
      At X = +/- 0.08, hair bulges out to Y = -0.202 (2.4 cm thick lobe!).
    - High, clean nape hairline at Z ~ 0.465 (above collar, gathered upward).
    - Cute curved curtain fringe across forehead reaching Z ~ 0.552, with 2 soft graphic V-cuts.
    - Soft puffy marshmallow scrunchies.
    - Plump, bouncy chibi bunches that flare outward and curve down with wide silhouette.
    """
    bm = bmesh.new()
    
    center_y = -0.012
    center_z = 0.528
    rx = 0.185
    ry = 0.175
    rz = 0.165
    
    segs_half = 16
    num_rings = 12
    
    grid_left = []
    grid_right = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)  # 0 at crown, 1 at rim
        row_l = []
        row_r = []
        
        for s in range(segs_half + 1):
            u = math.pi * s / segs_half  # 0 at front (+Y), pi at back (-Y)
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # Front hairline
                max_phi = math.radians(65.0)
            elif cos_u < -0.15:  # Back nape for pigtails: HIGH gathered nape (Z ~ 0.465)!
                back_fac = -cos_u
                max_phi = math.radians(88.0) + back_fac * math.radians(22.0)  # Z ~ 0.465
            else:
                max_phi = math.radians(78.0)
                
            phi = v * max_phi
            
            # Base spherical coordinates
            base_x = rx * math.sin(phi) * sin_u
            base_y = ry * math.sin(phi) * cos_u + center_y
            base_z = center_z + rz * math.cos(phi)
            
            # --- TRUE DUAL LOBES AT REAR (cos_u < 0) ---
            if cos_u < 0.0 and v > 0.12:
                # Along symmetry axis: s=segs_half is X=0
                seam_dist = math.pi - u  # 0 at back center seam X=0
                
                # Near center seam: hair rests against scalp
                # Away from seam: hair bulges into plump peach lobes!
                lobe_puff = math.sin(min(1.0, seam_dist / 0.85) * math.pi) * 0.024 * (v ** 0.6)
                base_y -= lobe_puff * 1.1  # pushes outward behind
                base_x += lobe_puff * 0.4   # pushes slightly outward to side
                
            # Ear notch
            if abs(cos_u) < 0.22 and v > 0.65:
                ear_dist = math.sqrt((base_x - 0.166)**2 + (base_y + 0.005)**2 + (base_z - 0.515)**2)
                if ear_dist < 0.040:
                    base_z += (0.040 - ear_dist) * 0.90
                    base_x = max(base_x, 0.185)
                    
            # Right side vertex (+X)
            vr = bm.verts.new(Vector((base_x, base_y, base_z)))
            row_r.append(vr)
            
            # Left side vertex (-X)
            if s == 0 or s == segs_half:
                vl = vr  # shared vertex on center seam
            else:
                vl = bm.verts.new(Vector((-base_x, base_y, base_z)))
            row_l.append(vl)
            
        grid_right.append(row_r)
        grid_left.append(row_l)
        
    for r in range(num_rings - 1):
        for s in range(segs_half):
            bm.faces.new((grid_right[r][s], grid_right[r][s+1], grid_right[r+1][s+1], grid_right[r+1][s]))
            bm.faces.new((grid_left[r][s+1], grid_left[r][s], grid_left[r+1][s], grid_left[r+1][s+1]))
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz)))
    for s in range(segs_half):
        bm.faces.new((apex, grid_right[0][s], grid_right[0][s+1]))
        bm.faces.new((apex, grid_left[0][s+1], grid_left[0][s]))
        
    # Inward beveled rim along nape and sides
    for side_grid in [grid_right, grid_left]:
        rim_out = side_grid[-1]
        rim_in = []
        for s in range(len(rim_out)):
            vo = rim_out[s]
            p_in = vo.co + (Vector((0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
            rim_in.append(bm.verts.new(p_in))
        for s in range(len(rim_out) - 1):
            bm.faces.new((rim_out[s], rim_out[s+1], rim_in[s+1], rim_in[s]))

    # CONTINUOUS CHIBI CURTAIN BANGS (Following true 3D skull curvature)
    b_cols = 20
    b_rows = 6
    bang_grid = []
    for r in range(b_rows):
        v = r / (b_rows - 1)
        row = []
        for c in range(b_cols):
            u = c / (b_cols - 1)
            ang_deg = 55.0 - u * 110.0
            theta = math.radians(ang_deg)
            
            v_cut1 = math.exp(-((u - 0.35) ** 2) / 0.008) * 8.0
            v_cut2 = math.exp(-((u - 0.65) ** 2) / 0.008) * 8.0
            phi_root = math.radians(38.0)
            phi_tip = math.radians(82.0 - v_cut1 - v_cut2)  # Z ~ 0.552 at tips!
            phi = phi_root * (1.0 - v) + phi_tip * v
            
            puff = 0.012 + math.sin(v * math.pi) * 0.010
            
            px = (rx + puff) * math.sin(phi) * (-math.sin(theta))
            py = (ry + puff) * math.sin(phi) * math.cos(theta) + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            row.append(bm.verts.new(Vector((px, py, pz))))
        bang_grid.append(row)
        
    for r in range(b_rows - 1):
        for c in range(b_cols - 1):
            bm.faces.new((bang_grid[r][c], bang_grid[r][c+1], bang_grid[r+1][c+1], bang_grid[r+1][c]))
            
    b_rim_out = bang_grid[-1]
    b_rim_in = []
    for c in range(b_cols):
        vo = b_rim_out[c]
        p_in = vo.co + Vector((0, -0.014, 0.008))
        b_rim_in.append(bm.verts.new(p_in))
    for c in range(b_cols - 1):
        bm.faces.new((b_rim_out[c], b_rim_out[c+1], b_rim_in[c+1], b_rim_in[c]))

    # TWIN PIGTAIL BUNCHES & MARSHMALLOW SCRUNCHIES
    for sign in [-1, 1]:
        tie_center = Vector((sign * 0.180, -0.045, 0.585))
        
        # Puffy marshmallow scrunchie
        add_marshmallow_scrunchie(bm, tie_center, axis=(sign * 0.75, -0.25, 0.60),
                                  major_r=0.026, minor_r=0.012, num_puffs=6, mat_index=1)
        
        # Plump, bouncy chibi pigtail bunch:
        pigtail_spine = [
            (sign * 0.182, -0.048, 0.585),
            (sign * 0.240, -0.065, 0.570),  # flared crest
            (sign * 0.275, -0.055, 0.490),  # plump bouncy body (wide silhouette!)
            (sign * 0.240, -0.035, 0.420),  # curving inward
            (sign * 0.185, -0.020, 0.380)   # cute tapered tip
        ]
        add_plump_pigtail_bunch(bm, pigtail_spine,
                                width_profile=(0.042, 0.076, 0.016),
                                thick_profile=(0.028, 0.048, 0.012), segs=5)
        
        # Neat sideburn lock in front of ear
        sb_spine = [
            (sign * 0.160, 0.065, 0.575),
            (sign * 0.170, 0.035, 0.535),
            (sign * 0.164, 0.018, 0.505)
        ]
        add_plump_pigtail_bunch(bm, sb_spine,
                                width_profile=(0.025, 0.030, 0.010),
                                thick_profile=(0.012, 0.014, 0.005), segs=3)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008_v8", mesh)
    mat_hair = create_chibi_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    mat_tie = create_scrunchie_shader(f"M_Tie_{char_id}", tie_hex, roughness=0.45)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_subdiv(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# STUDIO & RUNNER
# ---------------------------------------------------------------------------

def run():
    from generate_perfect_pilot import setup_chibi_studio
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    
    pilot_styles = [
        ("HAIR_001", "Classic Bowl Cut", build_chibi_hair_001, "#2b201c"),
        ("HAIR_004", "Side-Parted Short", build_chibi_hair_004, "#241c19"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_chibi_hair_008(arm, cid, col, "#f4b41a"), "#2b201c")
    ]
    
    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n==================================================")
        print(f"BUILDING V8 PILOT: {h_id} — {h_name}")
        print(f"==================================================")
        char_tag = f"v8_{h_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)
        
        arm = factory.arm
        for child in list(arm.children):
            if child.type == 'MESH' and 'hair' in child.name.lower():
                bpy.data.objects.remove(child, do_unlink=True)
                
        hair_obj = builder_fn(arm, char_tag, def_color)
        
        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        factory.equip_accessories(["ACC_002"], char_tag)
        
        blend_path = os.path.join(OUT_DIR, f"{h_id.lower()}_v8_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        
        glb_path = os.path.join(OUT_DIR, f"character_{h_id.lower()}_v8.glb")
        glb_size = factory.export_glb(glb_path)
        print(f"GLB size: {glb_size / 1024:.1f} KB")
        
        scene = bpy.context.scene
        cam = setup_chibi_studio(scene, res=(640, 750))
        
        views = [
            ("front", (0.0, 0.92, 0.535), (math.radians(90), 0, math.radians(180))),
            ("three_quarter", (0.65, 0.65, 0.555), (math.radians(82), 0, math.radians(135))),
            ("side", (0.92, 0.0, 0.535), (math.radians(90), 0, math.radians(90))),
            ("back", (0.0, -0.92, 0.535), (math.radians(90), 0, 0))
        ]
        
        for vname, loc, rot in views:
            cam.location = loc
            cam.rotation_euler = rot
            out_img = os.path.join(OUT_DIR, f"{h_id.lower()}_{vname}.png")
            scene.render.filepath = out_img
            bpy.ops.render.render(write_still=True)
            print(f"  Rendered {vname} -> {out_img}")

if __name__ == "__main__":
    run()
