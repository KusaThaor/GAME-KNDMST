"""
=============================================================================
TEST & PROTOTYPE: NEW PROCEDURAL HAIR CONSTRUCTION SYSTEM (PILOT BATCH)
Hairstyles to build:
- HAIR_001: Classic Bowl Cut (Animal Crossing continuous scalloped volume)
- HAIR_004: Side-Parted Short (Sculpted part groove + curved ribbon sweeps)
- HAIR_008: Twin Pigtails (Center-part back hemisphere + puffy ties + bouncy bunches)
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
PREVIEW_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v3")
os.makedirs(PREVIEW_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# REFINED SHADERS: SOFT SATIN / MATTE CHIBI MATERIALS
# ---------------------------------------------------------------------------

def create_soft_chibi_hair_material(mat_name, hex_color="#251c19", roughness=0.72):
    """
    Creates a soft, hand-painted anime/chibi satin hair material.
    Uses subtle subsurface scattering and controlled specular to eliminate plastic gloss.
    """
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
    
    # Soft, restrained specular
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.16
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.16
        
    # Soft velvety rim/sheen
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = 0.35
        if "Sheen Tint" in bsdf.inputs:
            bsdf.inputs["Sheen Tint"].default_value = (min(1.0, col[0] * 1.4), min(1.0, col[1] * 1.3), min(1.0, col[2] * 1.2), 1.0)
    elif "Sheen" in bsdf.inputs:
        bsdf.inputs["Sheen"].default_value = 0.35
        
    # Subtle subsurface to eliminate harsh plastic shadows
    if "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = 0.04
        if "Subsurface Radius" in bsdf.inputs:
            bsdf.inputs["Subsurface Radius"].default_value = (0.05, 0.03, 0.02)
    elif "Subsurface" in bsdf.inputs:
        bsdf.inputs["Subsurface"].default_value = 0.04
        
    return mat

def create_soft_accessory_material(mat_name, hex_color="#f4b41a", roughness=0.42):
    """Fabric/matte material for scrunchies, ribbons, hair ties."""
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
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.20
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.20
    return mat

# ---------------------------------------------------------------------------
# GEOMETRY GENERATOR 1: SOFT BEVELED RIBBON LOCKS
# ---------------------------------------------------------------------------

def add_soft_ribbon_lock(bm, path_points, width_profile=(0.030, 0.048, 0.008),
                         thick_profile=(0.010, 0.020, 0.005), segments=5,
                         curve_tweak=(0.0, 0.0)):
    """
    Extrudes a beautiful, soft stylized hair ribbon with a convex outer surface,
    curved rounded bevel edges, and a skull-hugging inner surface.
    Cross section has 8 vertices (clean quad-tube with soft pill-shaped profile).
    """
    if len(path_points) < 2:
        return []
    
    # Resample path smoothly with cubic spline
    total_steps = segments * (len(path_points) - 1)
    curve_samples = []
    for i in range(total_steps + 1):
        t = i / total_steps
        scaled_t = t * (len(path_points) - 1)
        idx = min(int(scaled_t), len(path_points) - 2)
        local_t = scaled_t - idx
        p1 = Vector(path_points[idx])
        p2 = Vector(path_points[idx + 1])
        # Smooth hermite interpolation
        smooth_t = local_t * local_t * (3.0 - 2.0 * local_t)
        pt = p1.lerp(p2, smooth_t)
        curve_samples.append((pt, t))
        
    slices = []
    w_start, w_mid, w_end = width_profile
    th_start, th_mid, th_end = thick_profile
    
    for i, (pt, t) in enumerate(curve_samples):
        # Width and thickness evaluation
        if t < 0.45:
            fac = t / 0.45
            w = w_start + (w_mid - w_start) * (fac ** 0.8)
            th = th_start + (th_mid - th_start) * (fac ** 0.8)
        else:
            fac = (t - 0.45) / 0.55
            w = w_mid + (w_end - w_mid) * (fac ** 1.3)
            th = th_mid + (th_end - th_mid) * (fac ** 1.3)
            
        # Orientation frame (tangent, binormal, normal)
        if i < len(curve_samples) - 1:
            tangent = (curve_samples[i + 1][0] - pt).normalized()
        else:
            tangent = (pt - curve_samples[i - 1][0]).normalized()
            
        up = Vector((0, 0, 1))
        if abs(tangent.dot(up)) > 0.88:
            up = Vector((0, 1, 0))
        binormal = tangent.cross(up).normalized()
        normal = binormal.cross(tangent).normalized()
        
        # 8-point rounded pill/ribbon cross-section:
        # Outer surface is arched outward; inner surface hugs the head
        half_w = w * 0.5
        quarter_w = w * 0.28
        half_th = th * 0.5
        
        # Outer curve (4 points)
        v0 = bm.verts.new(pt - binormal * half_w)
        v1 = bm.verts.new(pt - binormal * quarter_w + normal * half_th)
        v2 = bm.verts.new(pt + binormal * quarter_w + normal * half_th)
        v3 = bm.verts.new(pt + binormal * half_w)
        # Inner curve (4 points)
        v4 = bm.verts.new(pt + binormal * quarter_w - normal * (half_th * 0.5))
        v5 = bm.verts.new(pt - binormal * quarter_w - normal * (half_th * 0.5))
        
        slices.append((v0, v1, v2, v3, v4, v5))
        
    # Connect slices with quad faces
    for i in range(len(slices) - 1):
        s1 = slices[i]
        s2 = slices[i + 1]
        for k in range(6):
            kn = (k + 1) % 6
            bm.faces.new((s1[k], s1[kn], s2[kn], s2[k]))
            
    # Cap start and end
    s0 = slices[0]
    bm.faces.new((s0[0], s0[5], s0[4], s0[3], s0[2], s0[1]))
    se = slices[-1]
    bm.faces.new((se[0], se[1], se[2], se[3], se[4], se[5]))
    return slices

# ---------------------------------------------------------------------------
# GEOMETRY GENERATOR 2: PUFFY CLOUD / MARSHMALLOW SCRUNCHIE
# ---------------------------------------------------------------------------

def add_puffy_scrunchie(bm, center, axis=(0, 0, 1), major_r=0.024, minor_r=0.010,
                        num_puffs=6, segs_u=18, segs_v=8, mat_index=1):
    """
    Creates a cute, puffy cloud-like scrunchie with undulating marshmallow lobes.
    """
    axis = Vector(axis).normalized()
    up = Vector((0, 0, 1)) if abs(axis.z) < 0.88 else Vector((0, 1, 0))
    u_dir = axis.cross(up).normalized()
    v_dir = axis.cross(u_dir).normalized()
    
    rings = []
    for i in range(segs_u):
        ang_u = 2.0 * math.pi * i / segs_u
        # Puffy lobe modulation
        puff_mod = 1.0 + 0.28 * math.cos(num_puffs * ang_u)
        r_maj = major_r * puff_mod
        r_min = minor_r * (0.9 + 0.25 * math.cos(num_puffs * ang_u))
        
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

# ---------------------------------------------------------------------------
# PILOT 1: REBUILD HAIR_001 — CLASSIC BOWL CUT (ANIMAL CROSSING STYLE)
# ---------------------------------------------------------------------------

def build_pilot_hair_001(arm, char_id, color_hex="#251c19"):
    """
    HAIR_001: Classic Bowl Cut — Rebuilt from the ground up!
    Animal Crossing style:
    - Continuous sculptural bowl shell with physical thickness.
    - Integrated scalloped fringe cuts carved directly into the perimeter rim!
    - Smooth curved under-rim that folds inward cleanly.
    - Clean ear clearance and cute tapered sideburns.
    - NO disconnected tubular sausages.
    """
    bm = bmesh.new()
    
    rx = 0.188
    ry = 0.178
    rz = 0.168
    center_z = 0.530
    center_y = -0.012
    
    u_segs = 32
    v_segs = 12
    
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.012)))
    grid = []
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs
            sin_u = math.sin(u)  # X dir
            cos_u = math.cos(u)  # Y dir
            
            # Angle around the head: 0 = front (+Y), pi/2 = right (+X), pi = back (-Y), 3pi/2 = left (-X)
            # Determine maximum latitude phi for this angular direction:
            if cos_u > 0.15:  # FRONT FRINGE
                # Scalloped bowl fringe: 3 soft notches/lobes
                theta_f = math.atan2(sin_u, cos_u)
                scallop = 0.08 * math.sin(theta_f * 3.5) ** 2
                max_phi = math.radians(68.0) + scallop
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(35.0)  # down to nape Z ~ 0.430
            else:  # SIDES / EARS
                # Sideburn drop in front of ear (cos_u in [0.0, 0.15])
                if cos_u >= 0.0:
                    max_phi = math.radians(78.0)  # sideburn area
                else:
                    max_phi = math.radians(75.0)  # above ear clearance
                    
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            # Ear clearance notch
            if abs(cos_u) < 0.22 and v > 0.75:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.185), px)
                    
            vert = bm.verts.new(Vector((px, py, pz)))
            row.append(vert)
        grid.append(row)
        
    # Cap apex
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((apex, grid[0][u], grid[0][un]))
        
    # Connect dome rings
    for v in range(v_segs - 1):
        for u in range(u_segs):
            un = (u + 1) % u_segs
            bm.faces.new((grid[v][u], grid[v][un], grid[v+1][un], grid[v+1][u]))
            
    # PHYSICAL INWARD RIM (SOLID BEVELED EDGE)
    # Extrude bottom row inward and slightly upward to create a genuine solid haircut rim!
    rim_outer = grid[-1]
    rim_inner = []
    for u in range(u_segs):
        vo = rim_outer[u]
        # Inward normal vector toward head center
        dir_in = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
        p_in = vo.co + dir_in * 0.016 + Vector((0, 0, 0.008))
        rim_inner.append(bm.verts.new(p_in))
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((rim_outer[u], rim_outer[un], rim_inner[un], rim_inner[u]))
        
    # Add a cute, soft secondary overlapping bang lock to give artisanal hand-crafted depth
    # Center-left overlapping lock
    lock1 = [
        (-0.040, 0.138, 0.628),
        (-0.045, 0.155, 0.588),
        (-0.038, 0.158, 0.552)
    ]
    add_soft_ribbon_lock(bm, lock1, width_profile=(0.038, 0.044, 0.016), thick_profile=(0.012, 0.016, 0.006))
    
    # Center-right overlapping lock
    lock2 = [
        (0.045, 0.136, 0.626),
        (0.052, 0.154, 0.586),
        (0.044, 0.156, 0.552)
    ]
    add_soft_ribbon_lock(bm, lock2, width_profile=(0.036, 0.042, 0.014), thick_profile=(0.012, 0.016, 0.006))
    
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_001_v3", mesh)
    mat = create_soft_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# PILOT 2: REBUILD HAIR_004 — SIDE-PARTED SHORT
# ---------------------------------------------------------------------------

def build_pilot_hair_004(arm, char_id, color_hex="#221d1b"):
    """
    HAIR_004: Side-Parted Short — Rebuilt!
    - Clear parting line at X ~ -0.055.
    - Large volumetric swept hair mass flowing over top and across forehead.
    - Layered curved ribbon fringe sweeping toward right temple.
    - Minor side combed cleanly down left temple.
    - Continuous contoured skull volume, zero floating cylinders.
    """
    bm = bmesh.new()
    
    rx = 0.185
    ry = 0.175
    rz = 0.165
    center_z = 0.530
    center_y = -0.012
    
    u_segs = 32
    v_segs = 12
    
    # Asymmetric dome with parting groove at X = -0.055
    apex = bm.verts.new(Vector((-0.055, center_y, center_z + rz + 0.010)))
    grid = []
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.12:  # Forehead
                # Parting cutoff: higher on right sweep to reveal forehead naturally
                max_phi = math.radians(65.0) + (1.0 - cos_u) * math.radians(15.0)
            elif cos_u < -0.15:  # Back nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(35.0)
            else:
                max_phi = math.radians(78.0)
                
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            # Asymmetric parting volume: puff up the major right side (+X)
            if px > -0.04 and pz > 0.60:
                pz += 0.008 * (1.0 - v * 0.5)
                py += 0.005 * (1.0 - v * 0.5)
                
            # Ear clearance notch
            if abs(cos_u) < 0.22 and v > 0.75:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.185), px)
                    
            vert = bm.verts.new(Vector((px, py, pz)))
            row.append(vert)
        grid.append(row)
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((apex, grid[0][u], grid[0][un]))
        
    for v in range(v_segs - 1):
        for u in range(u_segs):
            un = (u + 1) % u_segs
            bm.faces.new((grid[v][u], grid[v][un], grid[v+1][un], grid[v+1][u]))
            
    # Sweeping Forehead Fringe (Major Sweep - broad curved layered ribbons)
    # Layer 1: Main sweeping crest from parting line across to right temple
    sweep_main = [
        (-0.045, 0.125, 0.640),
        ( 0.025, 0.152, 0.630),
        ( 0.095, 0.148, 0.595),
        ( 0.145, 0.115, 0.558)
    ]
    add_soft_ribbon_lock(bm, sweep_main, width_profile=(0.046, 0.054, 0.016),
                        thick_profile=(0.015, 0.022, 0.008), segments=5)
    
    # Layer 2: Lower sweeping lock curving across mid-forehead
    sweep_mid = [
        (-0.035, 0.135, 0.615),
        ( 0.030, 0.156, 0.598),
        ( 0.088, 0.152, 0.572),
        ( 0.132, 0.122, 0.548)
    ]
    add_soft_ribbon_lock(bm, sweep_mid, width_profile=(0.042, 0.048, 0.014),
                        thick_profile=(0.014, 0.018, 0.006), segments=5)
    
    # Layer 3: Soft fringe tip peeking softly on brow
    sweep_brow = [
        (-0.020, 0.140, 0.588),
        ( 0.032, 0.158, 0.572),
        ( 0.078, 0.154, 0.552)
    ]
    add_soft_ribbon_lock(bm, sweep_brow, width_profile=(0.034, 0.038, 0.012),
                        thick_profile=(0.012, 0.015, 0.005), segments=4)
    
    # Minor side sweep: combed neatly down left temple
    minor_sweep = [
        (-0.065, 0.122, 0.632),
        (-0.110, 0.135, 0.605),
        (-0.145, 0.108, 0.562)
    ]
    add_soft_ribbon_lock(bm, minor_sweep, width_profile=(0.042, 0.046, 0.015),
                        thick_profile=(0.014, 0.018, 0.006), segments=4)
    
    # Soft sideburns
    for sign in [-1, 1]:
        sb = [
            (sign * 0.165, 0.060, 0.570),
            (sign * 0.170, 0.035, 0.535),
            (sign * 0.166, 0.020, 0.505)
        ]
        add_soft_ribbon_lock(bm, sb, width_profile=(0.032, 0.034, 0.012),
                            thick_profile=(0.012, 0.014, 0.005), segments=3)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_004_v3", mesh)
    mat = create_soft_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# PILOT 3: REBUILD HAIR_008 — TWIN PIGTAILS (SCULPTED DUAL LOBE BACK)
# ---------------------------------------------------------------------------

def build_pilot_hair_008(arm, char_id, color_hex="#281e1a", tie_hex="#f4b41a"):
    """
    HAIR_008: Twin Pigtails — Rebuilt!
    Reference: Image 2 (Back view center part) & Animal Crossing pigtails.
    - Sculpted center-part groove dividing the back skull into two distinct rounded lobes!
    - Hair masses visibly gather outward and upward toward the pigtail root bases.
    - Puffy marshmallow scrunchies at the lateral gathering points.
    - Voluminous, bouncy pigtail bunches curving outward and down in an adorable chibi silhouette.
    - Soft, cute scalloped chibi curtain fringe in the front.
    """
    bm = bmesh.new()
    
    rx = 0.185
    ry = 0.175
    rz = 0.165
    center_z = 0.530
    center_y = -0.012
    
    u_segs = 32
    v_segs = 12
    
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.010)))
    grid = []
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs
            sin_u = math.sin(u)  # X
            cos_u = math.cos(u)  # Y
            
            if cos_u > 0.12:  # Forehead
                max_phi = math.radians(64.0) + (1.0 - cos_u) * math.radians(16.0)
            elif cos_u < -0.15:  # Back skull & nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(35.0)
            else:
                max_phi = math.radians(78.0)
                
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            # --- SCULPTED CENTER PART GROOVE AT BACK OF HEAD (Image 2 style) ---
            # If at the back (Y < center_y) and near X = 0:
            if py < center_y and v > 0.2:
                x_dist = abs(px)
                # Groove width ~ 0.045m
                if x_dist < 0.045:
                    # Depress inward toward head
                    part_depth = 0.014 * (1.0 - (x_dist / 0.045) ** 2) * (v ** 0.5)
                    py += part_depth * 1.1  # pull forward into head
                    pz -= part_depth * 0.4
                else:
                    # Bulge the two lateral hemispheres outward toward pigtail roots!
                    bulge_fac = math.sin(math.pi * min(1.0, (x_dist - 0.045) / 0.12))
                    py -= 0.010 * bulge_fac * v
                    px = math.copysign(abs(px) + 0.008 * bulge_fac * v, px)
                    
            # Ear clearance notch
            if abs(cos_u) < 0.22 and v > 0.75:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.185), px)
                    
            vert = bm.verts.new(Vector((px, py, pz)))
            row.append(vert)
        grid.append(row)
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((apex, grid[0][u], grid[0][un]))
        
    for v in range(v_segs - 1):
        for u in range(u_segs):
            un = (u + 1) % u_segs
            bm.faces.new((grid[v][u], grid[v][un], grid[v+1][un], grid[v+1][u]))
            
    # Cute Chibi Curtain Fringe across Forehead
    # 4 soft, rounded tapered locks framing brow
    bangs = [
        ([(-0.088, 0.128, 0.620), (-0.095, 0.148, 0.582), (-0.088, 0.150, 0.552)], 0.036, 0.042, 0.014),
        ([(-0.032, 0.136, 0.626), (-0.035, 0.156, 0.586), (-0.030, 0.158, 0.552)], 0.038, 0.044, 0.015),
        ([( 0.032, 0.136, 0.626), ( 0.035, 0.156, 0.586), ( 0.030, 0.158, 0.552)], 0.038, 0.044, 0.015),
        ([( 0.088, 0.128, 0.620), ( 0.095, 0.148, 0.582), ( 0.088, 0.150, 0.552)], 0.036, 0.042, 0.014),
    ]
    for pts, ws, wm, we in bangs:
        add_soft_ribbon_lock(bm, pts, width_profile=(ws, wm, we), thick_profile=(0.012, 0.016, 0.006))
        
    # Temple framing locks in front of ears
    for sign in [-1, 1]:
        sb = [
            (sign * 0.155, 0.065, 0.575),
            (sign * 0.165, 0.035, 0.535),
            (sign * 0.160, 0.018, 0.505)
        ]
        add_soft_ribbon_lock(bm, sb, width_profile=(0.030, 0.034, 0.010), thick_profile=(0.012, 0.014, 0.005))
        
        # Pigtail Gathering Point
        tie_center = Vector((sign * 0.175, -0.045, 0.585))
        
        # Puffy Marshmallow Scrunchie (Mat index 1)
        add_puffy_scrunchie(bm, tie_center, axis=(sign * 0.72, -0.25, 0.64),
                            major_r=0.024, minor_r=0.010, num_puffs=6, mat_index=1)
        
        # Voluminous Bouncy Pigtail Bunch:
        # Arcs outward in an energetic chibi curve, swells generously, then tapers inward
        bunch_main = [
            (sign * 0.178, -0.048, 0.585),
            (sign * 0.230, -0.065, 0.560),  # flared crest
            (sign * 0.255, -0.060, 0.490),  # wide bouncy body
            (sign * 0.230, -0.040, 0.420),  # curving in
            (sign * 0.185, -0.025, 0.380)   # cute tapered tip
        ]
        add_soft_ribbon_lock(bm, bunch_main, width_profile=(0.044, 0.062, 0.016),
                            thick_profile=(0.022, 0.032, 0.010), segments=5)
        
        # Secondary backing lock to give multi-layered volume
        bunch_back = [
            (sign * 0.174, -0.055, 0.575),
            (sign * 0.218, -0.085, 0.535),
            (sign * 0.228, -0.078, 0.460),
            (sign * 0.190, -0.050, 0.400)
        ]
        add_soft_ribbon_lock(bm, bunch_back, width_profile=(0.036, 0.048, 0.014),
                            thick_profile=(0.018, 0.024, 0.008), segments=4)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008_v3", mesh)
    mat_hair = create_soft_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    mat_tie = create_soft_accessory_material(f"M_Tie_{char_id}", tie_hex, roughness=0.42)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# STUDIO SETUP & RENDER HARNESS
# ---------------------------------------------------------------------------

def setup_soft_chibi_studio(scene, res=(640, 750)):
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)
            
    cam_data = bpy.data.cameras.new("Pilot_Cam")
    cam_data.lens = 55
    cam = bpy.data.objects.new("Pilot_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    
    # Neutral warm studio background
    scene.world = bpy.data.worlds.new("Pilot_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        # Soft slate grey background (allows black hair forms to be read clearly)
        bg.inputs["Color"].default_value = (0.16, 0.18, 0.22, 1.0)
        bg.inputs["Strength"].default_value = 1.0
        
    def add_light(name, ltype, energy, loc, rot_deg, color=(1,1,1)):
        l = bpy.data.lights.new(name, ltype)
        l.energy = energy
        l.color = color
        if ltype == 'AREA':
            l.size = 0.8
        obj = bpy.data.objects.new(name, l)
        obj.location = loc
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        scene.collection.objects.link(obj)
        return obj
        
    # Soft three-point studio lighting with fill
    add_light("Key_Light", 'SUN', 2.8, (1.2, 1.5, 2.0), (45, 15, -40), (1.0, 0.98, 0.95))
    add_light("Fill_Light", 'SUN', 1.6, (-1.5, 1.2, 1.5), (40, -20, 135), (0.92, 0.95, 1.0))
    add_light("Rim_Light", 'SUN', 2.2, (0.0, -1.8, 1.8), (30, 0, 10), (1.0, 0.97, 0.92))
    add_light("Under_Bounce", 'SUN', 0.8, (0.0, 1.0, -0.5), (-60, 0, 180), (0.95, 0.92, 0.90))
    
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam

def run_pilot_batch():
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    
    pilot_styles = [
        ("HAIR_001", "Classic Bowl Cut", build_pilot_hair_001, "#251c19"),
        ("HAIR_004", "Side-Parted Short", build_pilot_hair_004, "#221d1b"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_pilot_hair_008(arm, cid, col, "#f4b41a"), "#281e1a")
    ]
    
    results = {}
    
    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n==================================================")
        print(f"BUILDING PILOT HAIRSTYLE: {h_id} — {h_name}")
        print(f"==================================================")
        
        char_tag = f"pilot_{h_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)
        
        # Remove any existing hair
        arm = factory.arm
        for child in list(arm.children):
            if child.type == 'MESH' and 'hair' in child.name.lower():
                bpy.data.objects.remove(child, do_unlink=True)
                
        # Build new procedural hair
        hair_obj = builder_fn(arm, char_tag, def_color)
        
        # Equip standard school uniform
        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        
        # Also equip glasses ACC_002 to prove ZERO clipping
        factory.equip_accessories(["ACC_002"], char_tag)
        
        raw_v = len(hair_obj.data.vertices)
        raw_f = len(hair_obj.data.polygons)
        print(f"Mesh statistics: {raw_v} verts, {raw_f} faces")
        
        # Save pilot blend file
        blend_path = os.path.join(PREVIEW_DIR, f"{h_id.lower()}_v3_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print(f"Saved source blend: {blend_path}")
        
        # Render 4 turnaround views
        scene = bpy.context.scene
        cam = setup_soft_chibi_studio(scene, res=(640, 750))
        
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
            out_img = os.path.join(PREVIEW_DIR, f"{h_id.lower()}_{vname}.png")
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
        
    print("\nPILOT BATCH COMPLETE!")
    return results

if __name__ == "__main__":
    run_pilot_batch()
