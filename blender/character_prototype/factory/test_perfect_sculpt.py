"""
=============================================================================
TRUE SCULPTED PROCEDURAL CHIBI HAIRSTYLES (V7)
Based on Animal Crossing & Reference Image 2:
1. HAIR_001: Classic Bowl Cut — Unified continuous mushroom volume with
   front fringe reaching Z ~ 0.550 (eyebrow level) with 3 cute graphic scallops,
   tapered sideburns, and deep nape wrap.
2. HAIR_004: Side-Parted Short — Defined part line at X = -0.055, broad 3D curved
   sweeping hair mass flowing across forehead down to right temple, sleek left temple.
3. HAIR_008: Twin Pigtails — Genuine dual-center twin-lobed back (two rounded mounds
   meeting at a deep center crease down X=0), cute curtain bangs at Z ~ 0.552,
   puffy cloud marshmallow scrunchies, and plump bouncy pigtail bunches!
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
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v7")
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
# PILOT 1: HAIR_001 — CLASSIC BOWL CUT (ANIMAL CROSSING PROPORTIONS)
# ---------------------------------------------------------------------------

def build_pilot_hair_001(arm, char_id, color_hex="#2b201c"):
    """
    HAIR_001: Classic Bowl Cut.
    - Full mushroom bowl curvature wrapping smoothly around head.
    - Front fringe reaches Z ~ 0.550 (just above eyebrows at 0.569), with 3 soft,
      scalloped cuts framing the forehead.
    - Clear ear notch at Z ~ 0.535 and neat tapered sideburns at Z ~ 0.505.
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
    segs = 36
    
    ring_verts = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)  # 0 at crown, 1 at rim
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)  # X
            cos_u = math.cos(u)  # Y
            
            # Directional latitude extension
            if cos_u > 0.15:  # FRONT FRINGE
                theta_f = math.atan2(sin_u, cos_u)
                # 3 soft graphic scallops
                scallop = 0.08 * (math.cos(theta_f * 2.5) ** 2)
                # Max phi = 82 deg + scallop -> lands Z at ~ 0.550!
                max_phi = math.radians(82.0) + scallop
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(100.0) + back_fac * math.radians(34.0)  # Z ~ 0.435
            else:  # SIDES
                if cos_u >= 0.0:
                    max_phi = math.radians(84.0)  # sideburn down to Z ~ 0.505
                else:
                    max_phi = math.radians(76.0)  # ear notch Z ~ 0.535
                    
            phi = 0.06 + v * (max_phi - 0.06)
            
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
            
    crown_pt = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.016)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((crown_pt, ring_verts[0][s], ring_verts[0][sn]))
        
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
    
    obj = bpy.data.objects.new("Hair_HAIR_001_v7", mesh)
    mat = create_chibi_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    apply_subdiv(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# PILOT 2: HAIR_004 — SIDE-PARTED SHORT (ANIMAL CROSSING STYLE)
# ---------------------------------------------------------------------------

def build_pilot_hair_004(arm, char_id, color_hex="#241c19"):
    """
    HAIR_004: Side-Parted Short.
    - Side part at X = -0.055.
    - Base short hair volume down to nape.
    - Broad, sweeping volumetric hair mass that flows across the forehead with true
      3D curvature (phi and theta), covering upper brow and angling gracefully to right temple.
    - Sleek minor side along left temple.
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
                
            phi = 0.08 + v * (max_phi - 0.08)
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
            
    crown_pt = bm.verts.new(Vector((-0.055, center_y, center_z + rz + 0.015)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((crown_pt, ring_verts[0][s], ring_verts[0][sn]))
        
    # VOLUMETRIC SWEEPING FRINGE (Major mass)
    # Flows from crown along phi and theta curves across the forehead!
    cols = 16
    rows = 6
    sweep_grid = []
    
    for r in range(rows):
        v = r / (rows - 1)  # 0 at root, 1 at fringe bottom
        row = []
        for c in range(cols):
            u = c / (cols - 1)  # 0 at part (X ~ -0.055), 1 at right temple (X ~ 0.155)
            
            # Interpolate angle theta along brow
            # from theta ~ 15 deg (X ~ -0.055) to theta ~ -60 deg (X ~ +0.155)
            ang_deg = 18.0 - u * 80.0
            theta = math.radians(ang_deg)
            
            # Phi goes from root (~42 deg) down to fringe (~80 deg)
            phi_root = math.radians(40.0 + u * 12.0)
            # Fringe tip: curves down to 82 deg in mid-brow, sweeps up to 74 deg at temple
            phi_tip = math.radians(82.0 - math.sin(u * math.pi * 0.8) * 8.0)
            phi = phi_root * (1.0 - v) + phi_tip * v
            
            # Puff out slightly to sit on top of base hair
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
            ang_deg = 18.0 + u * 45.0  # left side
            theta = math.radians(ang_deg)
            phi_root = math.radians(40.0 + u * 10.0)
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
    
    obj = bpy.data.objects.new("Hair_HAIR_004_v7", mesh)
    mat = create_chibi_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    apply_subdiv(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# PILOT 3: HAIR_008 — TWIN PIGTAILS (DUAL LOBES + MARSHMALLOW TIES)
# ---------------------------------------------------------------------------

def build_pilot_hair_008(arm, char_id, color_hex="#2b201c", tie_hex="#f4b41a"):
    """
    HAIR_008: Twin Pigtails.
    Reference: Image 2 & Animal Crossing.
    - Back of skull has TWO DISTINCT ROUNDED MOUNDS meeting along X = 0 at a deep center crease!
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
    
    # Dual-center parameters for the rear skull
    # Lobe centers: (+/- 0.075, -0.035, 0.540)
    d_lobe = 0.075
    
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
            elif cos_u < -0.15:  # Back nape
                back_fac = -cos_u
                max_phi = math.radians(100.0) + back_fac * math.radians(34.0)
            else:
                max_phi = math.radians(78.0)
                
            phi = 0.08 + v * (max_phi - 0.08)
            
            # FRONT HALF (Y >= center_y): single unified forehead dome
            if cos_u >= 0.0:
                base_x = rx * math.sin(phi) * sin_u
                base_y = ry * math.sin(phi) * cos_u + center_y
                base_z = center_z + rz * math.cos(phi)
            else:
                # REAR HALF (Y < center_y): DUAL HEMISPHERES (Image 2 style)
                # Right lobe is centered at X = +d_lobe
                # Distance from back seam along u:
                seam_dist = math.pi - u  # 0 at seam X=0
                
                # In spherical coordinates of the right lobe:
                base_x = d_lobe + (rx - d_lobe * 0.7) * math.sin(phi) * math.cos(seam_dist)
                base_y = -0.035 - (ry + 0.010) * math.sin(phi) * math.sin(seam_dist)
                base_z = center_z + rz * math.cos(phi)
                
                # Blend smoothly into the center seam at seam_dist -> 0 (X -> 0):
                if seam_dist < 0.35:
                    cleft = 0.035 * (1.0 - (seam_dist / 0.35) ** 2) * (v ** 0.5)
                    base_y += cleft * 1.4  # deep furrow into head
                    base_x = (seam_dist / 0.35) * base_x  # pins X to 0 at seam!
                    
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
                vl = vr  # shared on symmetry plane
            else:
                vl = bm.verts.new(Vector((-base_x, base_y, base_z)))
            row_l.append(vl)
            
        grid_right.append(row_r)
        grid_left.append(row_l)
        
    for r in range(num_rings - 1):
        for s in range(segs_half):
            bm.faces.new((grid_right[r][s], grid_right[r][s+1], grid_right[r+1][s+1], grid_right[r+1][s]))
            bm.faces.new((grid_left[r][s+1], grid_left[r][s], grid_left[r+1][s], grid_left[r+1][s+1]))
            
    crown_pt = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.016)))
    for s in range(segs_half):
        bm.faces.new((crown_pt, grid_right[0][s], grid_right[0][s+1]))
        bm.faces.new((crown_pt, grid_left[0][s+1], grid_left[0][s]))
        
    # CONTINUOUS CHIBI CURTAIN BANGS (Following true 3D skull curvature)
    b_cols = 20
    b_rows = 6
    bang_grid = []
    for r in range(b_rows):
        v = r / (b_rows - 1)  # 0 at root, 1 at fringe bottom
        row = []
        for c in range(b_cols):
            u = c / (b_cols - 1)
            # Angle across brow: from +55 deg (left temple) to -55 deg (right temple)
            ang_deg = 55.0 - u * 110.0
            theta = math.radians(ang_deg)
            
            # Phi goes from root (~40 deg) down to fringe tip (~82 deg)
            # 2 soft graphic V-cuts at u = 0.35 and u = 0.65
            v_cut1 = math.exp(-((u - 0.35) ** 2) / 0.008) * 8.0
            v_cut2 = math.exp(-((u - 0.65) ** 2) / 0.008) * 8.0
            phi_root = math.radians(40.0)
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
            
    # Solid bottom rim for bangs
    b_rim_out = bang_grid[-1]
    b_rim_in = []
    for c in range(b_cols):
        vo = b_rim_out[c]
        p_in = vo.co + Vector((0, -0.014, 0.008))
        b_rim_in.append(bm.verts.new(p_in))
    for c in range(b_cols - 1):
        bm.faces.new((b_rim_out[c], b_rim_out[c+1], b_rim_in[c+1], b_rim_in[c]))

    # TWIN PIGTAIL BUNCHES & MARSHMALLOW SCRUNCHIES
    from generate_perfect_pilot import add_marshmallow_scrunchie, add_plump_pigtail_bunch
    
    for sign in [-1, 1]:
        tie_center = Vector((sign * 0.180, -0.045, 0.585))
        
        # Puffy marshmallow scrunchie
        add_marshmallow_scrunchie(bm, tie_center, axis=(sign * 0.75, -0.25, 0.60),
                                  major_r=0.026, minor_r=0.012, num_puffs=6, mat_index=1)
        
        # Plump, bouncy chibi pigtail bunch:
        # Curves outward, swells generously, then tapers gracefully inward
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
    
    obj = bpy.data.objects.new("Hair_HAIR_008_v7", mesh)
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
        ("HAIR_001", "Classic Bowl Cut", build_pilot_hair_001, "#2b201c"),
        ("HAIR_004", "Side-Parted Short", build_pilot_hair_004, "#241c19"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_pilot_hair_008(arm, cid, col, "#f4b41a"), "#2b201c")
    ]
    
    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n==================================================")
        print(f"BUILDING V7 PILOT: {h_id} — {h_name}")
        print(f"==================================================")
        char_tag = f"v7_{h_id.lower()}"
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
        
        blend_path = os.path.join(OUT_DIR, f"{h_id.lower()}_v7_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        
        glb_path = os.path.join(OUT_DIR, f"character_{h_id.lower()}_v7.glb")
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
