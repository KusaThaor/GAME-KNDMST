"""
=============================================================================
NEW SCULPTED CHIBI HAIRSTYLE SYSTEM — 3 PILOT STYLES
Inspired by Animal Crossing & Play Together soft stylized 3D aesthetics.

Pilot Styles:
1. HAIR_001 — Classic Bowl Cut (Continuous volumetric bowl with scalloped graphic rim)
2. HAIR_004 — Side-Parted Short (Asymmetric side-part with sweeping volumetric ribbon mass)
3. HAIR_008 — Twin Pigtails (Dual-lobed back skull with center part valley + puffy ties + plump bunches)
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
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v4")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# SOFT CHIBI SHADERS
# ---------------------------------------------------------------------------

def create_soft_hair_shader(mat_name, hex_color="#261d1a", roughness=0.70):
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
        bsdf.inputs["Specular IOR Level"].default_value = 0.14
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.14
        
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

def create_puffy_tie_shader(mat_name, hex_color="#f4b41a", roughness=0.42):
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
        bsdf.inputs["Specular IOR Level"].default_value = 0.18
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.18
    return mat

# ---------------------------------------------------------------------------
# GEOMETRY HELPERS
# ---------------------------------------------------------------------------

def add_puffy_cloud_scrunchie(bm, center, axis=(0, 0, 1), major_r=0.025, minor_r=0.011,
                              num_puffs=6, segs_u=20, segs_v=8, mat_index=1):
    """Generates a soft, puffy cloud-like scrunchie."""
    axis = Vector(axis).normalized()
    up = Vector((0, 0, 1)) if abs(axis.z) < 0.88 else Vector((0, 1, 0))
    u_dir = axis.cross(up).normalized()
    v_dir = axis.cross(u_dir).normalized()
    
    rings = []
    for i in range(segs_u):
        ang_u = 2.0 * math.pi * i / segs_u
        puff = 1.0 + 0.30 * math.cos(num_puffs * ang_u)
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

def add_plump_chibi_pigtail(bm, spine_points, width_profile=(0.038, 0.068, 0.015),
                            thick_profile=(0.024, 0.042, 0.012), segs=6):
    """
    Extrudes an adorable, plump, bouncy chibi pigtail bunch along a 3D spline.
    Has a rounded teardrop / oval 8-vertex cross section that swells generously in the body.
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
        
        # 8-point rounded oval cross section
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
# PILOT 1: HAIR_001 — CLASSIC BOWL CUT (ANIMAL CROSSING CONTINUOUS VOLUME)
# ---------------------------------------------------------------------------

def build_chibi_hair_001(arm, char_id, color_hex="#261d1a"):
    """
    HAIR_001: Classic Bowl Cut.
    Modeled as a unified, sculptural mushroom bowl:
    - Continuous volumetric outer shell with smooth curvature.
    - Front fringe has clean, soft scalloped V-notches directly cut into the rim!
    - Clean ear clearance notches with neat sideburns.
    - Physical beveled underside rim that turns inward.
    - Zero separate floating tubes or glued sausages.
    """
    bm = bmesh.new()
    
    rx = 0.188
    ry = 0.178
    rz = 0.168
    center_z = 0.530
    center_y = -0.012
    
    u_segs = 36
    v_segs = 14
    
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.014)))
    grid = []
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs
            sin_u = math.sin(u)  # X dir
            cos_u = math.cos(u)  # Y dir
            
            # Angle: 0 = front (+Y), pi/2 = right (+X), pi = back (-Y), 3pi/2 = left (-X)
            if cos_u > 0.18:  # FRONT FRINGE
                # Graphic scalloped bowl cut with 3 gentle curved scallops
                theta_f = math.atan2(sin_u, cos_u) # in [-pi/2, pi/2]
                # Scallop modulation: 3 teeth
                scallop = 0.065 * (math.cos(theta_f * 3.0) ** 2)
                max_phi = math.radians(68.0) + scallop
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(94.0) + back_fac * math.radians(34.0)
            else:  # SIDES
                if cos_u >= 0.0:
                    max_phi = math.radians(78.0)  # sideburn
                else:
                    max_phi = math.radians(74.0)  # ear clearance
                    
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            # Ear clearance notch
            if abs(cos_u) < 0.22 and v > 0.70:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.186), px)
                    
            row.append(bm.verts.new(Vector((px, py, pz))))
        grid.append(row)
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((apex, grid[0][u], grid[0][un]))
        
    for v in range(v_segs - 1):
        for u in range(u_segs):
            un = (u + 1) % u_segs
            bm.faces.new((grid[v][u], grid[v][un], grid[v+1][un], grid[v+1][u]))
            
    # SOLID INWARD BEVELED RIM (Provides physical wall thickness)
    rim_outer = grid[-1]
    rim_inner = []
    for u in range(u_segs):
        vo = rim_outer[u]
        dir_in = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
        p_in = vo.co + dir_in * 0.016 + Vector((0, 0, 0.008))
        rim_inner.append(bm.verts.new(p_in))
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((rim_outer[u], rim_outer[un], rim_inner[un], rim_inner[u]))
        
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_001_Clean", mesh)
    mat = create_soft_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.70)
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# PILOT 2: HAIR_004 — SIDE-PARTED SHORT (SCULPTED SWEEPING MASS)
# ---------------------------------------------------------------------------

def build_chibi_hair_004(arm, char_id, color_hex="#221b18"):
    """
    HAIR_004: Side-Parted Short.
    - Parting line at X ~ -0.055.
    - Continuous base scalp that naturally drops low at the nape.
    - Sweeping forehead fringe: a broad, beautifully curved, tapered hair mass that sweeps
      from the parting line across the forehead to the right temple (Animal Crossing style).
    - Sleek minor side hugging the left temple.
    """
    bm = bmesh.new()
    
    rx = 0.185
    ry = 0.175
    rz = 0.165
    center_z = 0.530
    center_y = -0.012
    
    u_segs = 32
    v_segs = 12
    
    # Base skull volume
    apex = bm.verts.new(Vector((-0.055, center_y, center_z + rz + 0.010)))
    grid = []
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # Forehead hairline
                max_phi = math.radians(62.0)
            elif cos_u < -0.15:  # Back nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(35.0)
            else:
                max_phi = math.radians(76.0)
                
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            if abs(cos_u) < 0.22 and v > 0.75:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.185), px)
                    
            row.append(bm.verts.new(Vector((px, py, pz))))
        grid.append(row)
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((apex, grid[0][u], grid[0][un]))
        
    for v in range(v_segs - 1):
        for u in range(u_segs):
            un = (u + 1) % u_segs
            bm.faces.new((grid[v][u], grid[v][un], grid[v+1][un], grid[v+1][u]))
            
    # SWEEPING FOREHEAD MASS (Major Sweep)
    # Modeled as a continuous curved, beveled ribbon mass from parting line across brow
    cols = 16
    rows = 6
    sweep_grid = []
    for r in range(rows):
        v = r / (rows - 1)  # 0 = top edge (root at crown), 1 = bottom edge (sweeping fringe)
        row = []
        for c in range(cols):
            u = c / (cols - 1)  # 0 = part line (X ~ -0.055), 1 = right temple (X ~ 0.150)
            
            # Sweeping path across forehead
            # X sweeps from -0.055 to +0.150
            px = -0.055 + u * 0.205
            
            # Y follows forehead curvature + thickness
            # Front of forehead is at Y ~ 0.140 - 0.155
            py = math.sqrt(max(0.001, 0.175**2 - px**2)) + center_y + 0.010 + math.sin(u * math.pi) * 0.008
            
            # Z sweeps downward diagonally from left to right!
            # Top edge:
            z_top = 0.645 - u * 0.045
            # Bottom edge:
            z_bottom = 0.590 - u * 0.042 - math.sin(u * math.pi) * 0.012
            
            # Subtle scalloped flick near tip
            if u > 0.7:
                z_bottom += (u - 0.7) * 0.015
                
            pz = z_top * (1.0 - v) + z_bottom * v
            
            # Convex outward swell in the middle
            py += math.sin(v * math.pi) * 0.012
            
            row.append(bm.verts.new(Vector((px, py, pz))))
        sweep_grid.append(row)
        
    for r in range(rows - 1):
        for c in range(cols - 1):
            bm.faces.new((sweep_grid[r][c], sweep_grid[r][c+1], sweep_grid[r+1][c+1], sweep_grid[r+1][c]))
            
    # Solid bottom bevel edge for the sweep
    sweep_rim_out = sweep_grid[-1]
    sweep_rim_in = []
    for c in range(cols):
        vo = sweep_rim_out[c]
        p_in = vo.co + Vector((0, -0.012, 0.006))
        sweep_rim_in.append(bm.verts.new(p_in))
    for c in range(cols - 1):
        bm.faces.new((sweep_rim_out[c], sweep_rim_out[c+1], sweep_rim_in[c+1], sweep_rim_in[c]))

    # Minor Side Sweep (Sleek left temple comb)
    m_cols = 8
    m_rows = 5
    m_grid = []
    for r in range(m_rows):
        v = r / (m_rows - 1)
        row = []
        for c in range(m_cols):
            u = c / (m_cols - 1)
            px = -0.055 - u * 0.095
            py = math.sqrt(max(0.001, 0.175**2 - px**2)) + center_y + 0.008
            z_top = 0.640 - u * 0.035
            z_bottom = 0.585 - u * 0.040
            pz = z_top * (1.0 - v) + z_bottom * v
            py += math.sin(v * math.pi) * 0.008
            row.append(bm.verts.new(Vector((px, py, pz))))
        m_grid.append(row)
        
    for r in range(m_rows - 1):
        for c in range(m_cols - 1):
            bm.faces.new((m_grid[r][c], m_grid[r][c+1], m_grid[r+1][c+1], m_grid[r+1][c]))

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_004_Clean", mesh)
    mat = create_soft_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.70)
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# PILOT 3: HAIR_008 — TWIN PIGTAILS (SCULPTED DUAL LOBE BACK + CURTAIN BANGS)
# ---------------------------------------------------------------------------

def build_chibi_hair_008(arm, char_id, color_hex="#281e1a", tie_hex="#f4b41a"):
    """
    HAIR_008: Twin Pigtails.
    Reference: Image 2 & Animal Crossing.
    - Back of skull has TWO DISTINCT ROUNDED LOBES with a visible center-part groove at X = 0!
    - Cute continuous curtain fringe across forehead with 2 soft graphic chibi V-cuts.
    - Puffy cloud-like marshmallow scrunchies at the lateral gathering points.
    - Plump, bouncy, teardrop-shaped chibi bunches that flare outward and curve inward.
    - Prominently visible from both front and back views!
    """
    bm = bmesh.new()
    
    rx = 0.185
    ry = 0.175
    rz = 0.165
    center_z = 0.530
    center_y = -0.012
    
    u_segs = 36
    v_segs = 14
    
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.012)))
    grid = []
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # Forehead hairline
                max_phi = math.radians(62.0)
            elif cos_u < -0.15:  # Back skull & nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(35.0)
            else:
                max_phi = math.radians(76.0)
                
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            # --- DISTINCT DUAL-LOBE BACK (Image 2 style) ---
            # If in the rear half (Y < center_y) and v > 0.15:
            if py < center_y and v > 0.15:
                x_val = abs(px)
                # Deep center groove down X = 0
                if x_val < 0.040:
                    groove_depth = 0.016 * (1.0 - (x_val / 0.040) ** 2) * (v ** 0.5)
                    py += groove_depth * 1.2  # deep indentation
                    pz -= groove_depth * 0.3
                else:
                    # Bulge the two lateral spheres outward into rounded lobes
                    lobe_fac = math.sin(math.pi * min(1.0, (x_val - 0.040) / 0.13))
                    py -= 0.014 * lobe_fac * v
                    pz += 0.006 * lobe_fac * v
                    px = math.copysign(x_val + 0.010 * lobe_fac * v, px)
                    
            if abs(cos_u) < 0.22 and v > 0.75:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.185), px)
                    
            row.append(bm.verts.new(Vector((px, py, pz))))
        grid.append(row)
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((apex, grid[0][u], grid[0][un]))
        
    for v in range(v_segs - 1):
        for u in range(u_segs):
            un = (u + 1) % u_segs
            bm.faces.new((grid[v][u], grid[v][un], grid[v+1][un], grid[v+1][u]))
            
    # CONTINUOUS CHIBI CURTAIN BANGS (Animal Crossing style)
    # A single continuous curved band spanning from temple to temple with graphic V-cuts!
    b_cols = 24
    b_rows = 6
    bang_grid = []
    for r in range(b_rows):
        v = r / (b_rows - 1)  # 0 = root, 1 = fringe tip
        row = []
        for c in range(b_cols):
            u = c / (b_cols - 1)  # 0 = left temple, 1 = right temple
            angle = math.radians(145.0 - u * 110.0)
            
            px = rx * math.cos(angle)
            py = ry * math.sin(angle) + center_y + 0.010
            
            z_root = 0.638
            # 2 soft graphic chibi V-notches at u = 0.35 and u = 0.65
            # Center lock sits in the middle (u = 0.50)
            # Left lock (u = 0.18), Right lock (u = 0.82)
            v_cut1 = math.exp(-((u - 0.35) ** 2) / 0.005) * 0.020
            v_cut2 = math.exp(-((u - 0.65) ** 2) / 0.005) * 0.020
            z_tip = 0.550 + v_cut1 + v_cut2
            
            pz = z_root * (1.0 - v) + z_tip * v
            py += math.sin(v * math.pi) * 0.012  # soft outward volume
            
            row.append(bm.verts.new(Vector((px, py, pz))))
        bang_grid.append(row)
        
    for r in range(b_rows - 1):
        for c in range(b_cols - 1):
            bm.faces.new((bang_grid[r][c], bang_grid[r][c+1], bang_grid[r+1][c+1], bang_grid[r+1][c]))
            
    # Solid bottom rim for bangs
    b_rim_out = bang_grid[-1]
    b_rim_in = []
    for c in range(b_cols):
        vo = b_rim_out[c]
        p_in = vo.co + Vector((0, -0.012, 0.006))
        b_rim_in.append(bm.verts.new(p_in))
    for c in range(b_cols - 1):
        bm.faces.new((b_rim_out[c], b_rim_out[c+1], b_rim_in[c+1], b_rim_in[c]))

    # TWIN PIGTAIL BUNCHES & PUFFY SCRUNCHIES
    for sign in [-1, 1]:
        # Gathering point on lateral rear skull
        tie_center = Vector((sign * 0.178, -0.045, 0.585))
        
        # Puffy marshmallow scrunchie
        add_puffy_cloud_scrunchie(bm, tie_center, axis=(sign * 0.75, -0.25, 0.60),
                                  major_r=0.025, minor_r=0.011, num_puffs=6, mat_index=1)
        
        # Bouncy, plump chibi pigtail bunch:
        # Arcs generously outward, swells plumply, then tapers gracefully inward
        pigtail_spine = [
            (sign * 0.180, -0.048, 0.585),
            (sign * 0.235, -0.065, 0.565),  # arched crest
            (sign * 0.265, -0.055, 0.490),  # plump body
            (sign * 0.235, -0.035, 0.420),  # curving inward
            (sign * 0.185, -0.020, 0.380)   # cute tapered tip
        ]
        add_plump_chibi_pigtail(bm, pigtail_spine,
                                width_profile=(0.042, 0.070, 0.016),
                                thick_profile=(0.026, 0.042, 0.012), segs=6)
        
        # Neat sideburn lock in front of ear
        sb_spine = [
            (sign * 0.158, 0.065, 0.575),
            (sign * 0.168, 0.035, 0.535),
            (sign * 0.162, 0.018, 0.505)
        ]
        add_plump_chibi_pigtail(bm, sb_spine,
                                width_profile=(0.024, 0.028, 0.010),
                                thick_profile=(0.012, 0.014, 0.005), segs=3)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008_Clean", mesh)
    mat_hair = create_soft_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.70)
    mat_tie = create_puffy_tie_shader(f"M_Tie_{char_id}", tie_hex, roughness=0.42)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# STUDIO LIGHTING & RENDER RUNNER
# ---------------------------------------------------------------------------

def setup_studio(scene, res=(640, 750)):
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)
            
    cam_data = bpy.data.cameras.new("Pilot_Cam")
    cam_data.lens = 55
    cam = bpy.data.objects.new("Pilot_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    
    scene.world = bpy.data.worlds.new("Pilot_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        # Neutral studio background (allows dark hair to stand out)
        bg.inputs["Color"].default_value = (0.18, 0.20, 0.24, 1.0)
        bg.inputs["Strength"].default_value = 1.0
        
    def add_light(name, energy, rot_deg, color=(1,1,1)):
        l = bpy.data.lights.new(name, 'SUN')
        l.energy = energy
        l.color = color
        obj = bpy.data.objects.new(name, l)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        scene.collection.objects.link(obj)
        return obj
        
    # Soft studio lights
    add_light("Key", 2.6, (45, 15, -40), (1.0, 0.98, 0.95))
    add_light("Fill", 1.5, (40, -20, 135), (0.92, 0.95, 1.0))
    add_light("Rim", 2.2, (30, 0, 10), (1.0, 0.97, 0.92))
    add_light("Bounce", 0.8, (-60, 0, 180), (0.95, 0.92, 0.90))
    
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam

def run_pilot():
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    
    pilot_styles = [
        ("HAIR_001", "Classic Bowl Cut", build_chibi_hair_001, "#261d1a"),
        ("HAIR_004", "Side-Parted Short", build_chibi_hair_004, "#221b18"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_chibi_hair_008(arm, cid, col, "#f4b41a"), "#281e1a")
    ]
    
    results = {}
    
    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n==================================================")
        print(f"BUILDING REFINED PILOT: {h_id} — {h_name}")
        print(f"==================================================")
        
        char_tag = f"sculpt_{h_id.lower()}"
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
        
        # Equip glasses ACC_002
        factory.equip_accessories(["ACC_002"], char_tag)
        
        raw_v = len(hair_obj.data.vertices)
        raw_f = len(hair_obj.data.polygons)
        print(f"Mesh statistics: {raw_v} verts, {raw_f} faces")
        
        blend_path = os.path.join(OUT_DIR, f"{h_id.lower()}_v4_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        
        scene = bpy.context.scene
        cam = setup_studio(scene, res=(640, 750))
        
        views = [
            ("front", (0.0, 0.92, 0.535), (math.radians(90), 0, math.radians(180))),
            ("three_quarter", (0.65, 0.65, 0.555), (math.radians(82), 0, math.radians(135))),
            ("side", (0.92, 0.0, 0.535), (math.radians(90), 0, math.radians(90))),
            ("back", (0.0, -0.92, 0.535), (math.radians(90), 0, 0))
        ]
        
        render_paths = {}
        for vname, loc, rot in views:
            cam.location = loc
            cam.rotation_euler = rot
            out_img = os.path.join(OUT_DIR, f"{h_id.lower()}_{vname}.png")
            scene.render.filepath = out_img
            bpy.ops.render.render(write_still=True)
            render_paths[vname] = out_img
            print(f"  Saved render: {vname} -> {out_img}")
            
        results[h_id] = {
            "id": h_id,
            "name": h_name,
            "verts": raw_v,
            "faces": raw_f,
            "renders": render_paths,
            "blend": blend_path
        }
        
    print("\nREFINED PILOT BATCH COMPLETE!")
    return results

if __name__ == "__main__":
    run_pilot()
