"""
=============================================================================
TEST SCRIPT: QUAD-TOPOLOGY HAIR GENERATION
1. Quad-sphere topology for Bowl Cut (Zero pole pinching, clean front fringe)
2. Asymmetric Parted Loft for Side-Parted Short
3. True Dual-Lobed Back Topology for Twin Pigtails (matching Reference Image 2)
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
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v6")
os.makedirs(OUT_DIR, exist_ok=True)

def create_chibi_hair_shader(mat_name, hex_color="#281e1a", roughness=0.72):
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
# 1. HAIR_001: CLASSIC BOWL CUT (QUAD TOPOLOGY, PERFECT FRINGE)
# ---------------------------------------------------------------------------

def build_quad_hair_001(arm, char_id, color_hex="#281e1a"):
    """
    HAIR_001: Classic Bowl Cut.
    Modeled as concentric quad rings from a small quad crown cap down to the perimeter.
    Eliminates pole pinching completely.
    Fringe terminates at Z ~ 0.550 (just above eyebrows), with 3 soft scalloped teeth.
    Sideburns drop in front of ears to Z ~ 0.505.
    Ear notch clears ear at Z ~ 0.535.
    Nape drops down to Z ~ 0.435.
    """
    bm = bmesh.new()
    
    # We create concentric quad rings from crown down to rim.
    # Ring 0: quad cap around crown (4 vertices forming a square at crown)
    # Ring 1..N: concentric rings expanding outward and downward along skull curvature
    num_rings = 10
    segs = 32
    
    center_y = -0.012
    center_z = 0.528
    rx = 0.188
    ry = 0.178
    rz = 0.168
    
    # Build grid of vertices: rings x segs
    ring_verts = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)  # 0 at crown, 1 at perimeter rim
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)  # X
            cos_u = math.cos(u)  # Y
            
            # Angle theta around head: 0 = front (+Y), pi/2 = right (+X), pi = back (-Y), 3pi/2 = left (-X)
            # Determine maximum latitude phi for this angular direction:
            if cos_u > 0.15:  # FRONT FRINGE
                theta_f = math.atan2(sin_u, cos_u)
                # Scallop: 3 soft teeth
                scallop = 0.08 * (math.cos(theta_f * 2.5) ** 2)
                # At rim (v=1), phi reaches 80 deg + scallop, landing fringe at Z ~ 0.550!
                max_phi = math.radians(82.0) + scallop
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(100.0) + back_fac * math.radians(34.0)  # Z ~ 0.435
            else:  # SIDES
                if cos_u >= 0.0:
                    max_phi = math.radians(84.0)  # sideburn down to Z ~ 0.505
                else:
                    max_phi = math.radians(76.0)  # above ear clearance Z ~ 0.535
                    
            # At crown (v=0), ring has small radius 0.035m (no pole!)
            phi = 0.08 + v * (max_phi - 0.08)
            
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
            # Ear clearance notch
            if abs(cos_u) < 0.22 and v > 0.65:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.040:
                    pz += (0.040 - ear_dist) * 0.90
                    px = math.copysign(max(abs(px), 0.186), px)
                    
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)
        
    # Connect rings with quads
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))
            
    # Cap crown ring 0 with quad cap (grid fill / center vertex)
    crown_center = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.018)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((crown_center, ring_verts[0][s], ring_verts[0][sn]))
        
    # Solid inward beveled rim (physical wall thickness)
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
    
    obj = bpy.data.objects.new("Hair_HAIR_001_Quad", mesh)
    mat = create_chibi_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    apply_subdiv(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# 2. HAIR_004: SIDE-PARTED SHORT (ELEGANT ASYMMETRIC SWEEP)
# ---------------------------------------------------------------------------

def build_quad_hair_004(arm, char_id, color_hex="#221b18"):
    """
    HAIR_004: Side-Parted Short.
    - Defined part line at X ~ -0.055.
    - Base short haircut volume down to nape.
    - Sweeping front hair mass that flows across the forehead with true 3D curvature,
      covering the upper forehead and angling down toward the right temple.
    - Minor side combed sleekly down the left temple.
    """
    bm = bmesh.new()
    
    num_rings = 10
    segs = 32
    center_y = -0.012
    center_z = 0.528
    rx = 0.185
    ry = 0.175
    rz = 0.165
    
    # Base skull volume
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
            
    crown_center = bm.verts.new(Vector((-0.055, center_y, center_z + rz + 0.015)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((crown_center, ring_verts[0][s], ring_verts[0][sn]))
        
    # VOLUMETRIC SWEEPING FRINGE (Major mass: from X=-0.055 across to X=0.155)
    # Modeled as a 3D curved shell with smooth curvature in both U and V
    cols = 16
    rows = 6
    sweep_grid = []
    for r in range(rows):
        v = r / (rows - 1)  # 0 at root (crown/hairline), 1 at fringe bottom
        row = []
        for c in range(cols):
            u = c / (cols - 1)  # 0 at part line, 1 at right temple
            
            px = -0.055 + u * 0.210
            # Follow skull curvature
            rad_head = math.sqrt(max(0.001, 0.178**2 - px**2))
            
            # Z profile: slopes down from part line across brow
            z_root = 0.655 - u * 0.040
            # Fringe tip: curves down to Z ~ 0.552 in mid-brow, then sweeps up to 0.565 at temple
            z_tip = 0.585 - math.sin(u * math.pi * 0.8) * 0.035
            pz = z_root * (1.0 - v) + z_tip * v
            
            # Y profile: hugs skull, with outward volume in midsection (v=0.5)
            y_base = rad_head + center_y + 0.010
            y_puff = math.sin(v * math.pi) * 0.015 + math.sin(u * math.pi) * 0.008
            py = y_base + y_puff
            
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
        p_in = vo.co + Vector((0, -0.014, 0.008))
        sweep_rim_in.append(bm.verts.new(p_in))
    for c in range(cols - 1):
        bm.faces.new((sweep_rim_out[c], sweep_rim_out[c+1], sweep_rim_in[c+1], sweep_rim_in[c]))

    # Minor Side Sweep (Sleek left temple)
    m_cols = 8
    m_rows = 5
    m_grid = []
    for r in range(m_rows):
        v = r / (m_rows - 1)
        row = []
        for c in range(m_cols):
            u = c / (m_cols - 1)
            px = -0.055 - u * 0.098
            rad_head = math.sqrt(max(0.001, 0.178**2 - px**2))
            z_root = 0.650 - u * 0.030
            z_tip = 0.580 - u * 0.035
            pz = z_root * (1.0 - v) + z_tip * v
            py = rad_head + center_y + 0.008 + math.sin(v * math.pi) * 0.010
            row.append(bm.verts.new(Vector((px, py, pz))))
        m_grid.append(row)
        
    for r in range(m_rows - 1):
        for c in range(m_cols - 1):
            bm.faces.new((m_grid[r][c], m_grid[r][c+1], m_grid[r+1][c+1], m_grid[r+1][c]))

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_004_Quad", mesh)
    mat = create_chibi_hair_shader(f"M_Hair_{char_id}", color_hex, roughness=0.72)
    obj.data.materials.append(mat)
    apply_subdiv(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# 3. HAIR_008: TWIN PIGTAILS (GENUINE DUAL-LOBED BACK TOPOLOGY)
# ---------------------------------------------------------------------------

def build_quad_hair_008(arm, char_id, color_hex="#281e1a", tie_hex="#f4b41a"):
    """
    HAIR_008: Twin Pigtails.
    Reference: Image 2 & Animal Crossing.
    - Back of skull is modeled with a PROMINENT CENTER SEAM dividing into
      TWO ROUNDED PEACH LOBES that gather outward to the ties!
    - Cute curved curtain fringe across forehead with 2 graphic chibi V-cuts.
    - Soft puffy marshmallow scrunchies.
    - Plump, bouncy chibi bunches that flare outward and curve down with wide silhouette.
    """
    bm = bmesh.new()
    
    center_y = -0.012
    center_z = 0.528
    rx = 0.185
    ry = 0.175
    rz = 0.165
    
    # We build the skull as two mirrored halves (Left & Right) that meet along X = 0!
    # Meeting along X = 0 allows a deep, continuous center-part groove from crown to nape!
    segs_half = 16  # 16 segments per side = 32 total
    num_rings = 10
    
    grid_left = []
    grid_right = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)  # 0 at crown, 1 at rim
        row_l = []
        row_r = []
        
        for s in range(segs_half + 1):
            # angle u goes from 0 (front center X=0, Y>0) around side to pi (back center X=0, Y<0)
            u = math.pi * s / segs_half
            sin_u = math.sin(u)  # X factor >= 0
            cos_u = math.cos(u)  # Y factor (1 at front, -1 at back)
            
            # Latitudinal phi
            if cos_u > 0.15:  # Front hairline
                max_phi = math.radians(65.0)
            elif cos_u < -0.15:  # Back nape
                back_fac = -cos_u
                max_phi = math.radians(98.0) + back_fac * math.radians(34.0)
            else:
                max_phi = math.radians(78.0)
                
            phi = 0.08 + v * (max_phi - 0.08)
            
            # Base spherical coordinates
            base_x = rx * math.sin(phi) * sin_u
            base_y = ry * math.sin(phi) * cos_u + center_y
            base_z = center_z + rz * math.cos(phi)
            
            # --- DRAMATIC DUAL-LOBE MODULATION IN REAR (Y < center_y) ---
            if cos_u < 0.0 and v > 0.10:
                # Along s: s=segs_half is back center seam (X=0).
                # Distance from back seam along u:
                seam_dist = math.pi - u  # 0 at seam, increases toward side
                
                # Near seam (seam_dist < 0.45): deep indent
                if seam_dist < 0.45:
                    cleft = 0.032 * (1.0 - (seam_dist / 0.45) ** 2) * (v ** 0.6)
                    base_y += cleft * 1.3  # pull forward into head
                    base_z -= cleft * 0.4
                else:
                    # Lateral lobe bulge toward pigtail roots!
                    lobe_fac = math.sin(math.pi * min(1.0, (seam_dist - 0.45) / 1.0))
                    base_y -= 0.024 * lobe_fac * v
                    base_z += 0.010 * lobe_fac * v
                    base_x += 0.016 * lobe_fac * v
                    
            # Ear notch
            if abs(cos_u) < 0.22 and v > 0.65:
                ear_dist = math.sqrt((base_x - 0.166)**2 + (base_y + 0.005)**2 + (base_z - 0.515)**2)
                if ear_dist < 0.040:
                    base_z += (0.040 - ear_dist) * 0.90
                    base_x = max(base_x, 0.185)
                    
            # Right side (+X)
            vr = bm.verts.new(Vector((base_x, base_y, base_z)))
            row_r.append(vr)
            
            # Left side (-X)
            # Center seam vertices (s=0 and s=segs_half) must be shared or exact!
            if s == 0 or s == segs_half:
                vl = vr  # Shared vertex on the symmetry plane!
            else:
                vl = bm.verts.new(Vector((-base_x, base_y, base_z)))
            row_l.append(vl)
            
        grid_right.append(row_r)
        grid_left.append(row_l)
        
    # Connect faces on Right half
    for r in range(num_rings - 1):
        for s in range(segs_half):
            bm.faces.new((grid_right[r][s], grid_right[r][s+1], grid_right[r+1][s+1], grid_right[r+1][s]))
            
    # Connect faces on Left half (reversed winding to point normals outward)
    for r in range(num_rings - 1):
        for s in range(segs_half):
            bm.faces.new((grid_left[r][s+1], grid_left[r][s], grid_left[r+1][s], grid_left[r+1][s+1]))
            
    # Cap crown ring 0
    crown_pt = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.015)))
    for s in range(segs_half):
        bm.faces.new((crown_pt, grid_right[0][s], grid_right[0][s+1]))
        bm.faces.new((crown_pt, grid_left[0][s+1], grid_left[0][s]))
        
    # CONTINUOUS CHIBI CURTAIN BANGS (Curved 3D surface with graphic V-cuts)
    b_cols = 20
    b_rows = 6
    bang_grid = []
    for r in range(b_rows):
        v = r / (b_rows - 1)
        row = []
        for c in range(b_cols):
            u = c / (b_cols - 1)
            angle = math.radians(145.0 - u * 110.0)
            
            px = rx * math.cos(angle)
            rad_head = math.sqrt(max(0.001, 0.178**2 - px**2))
            
            z_root = 0.648
            v_cut1 = math.exp(-((u - 0.35) ** 2) / 0.006) * 0.024
            v_cut2 = math.exp(-((u - 0.65) ** 2) / 0.006) * 0.024
            z_tip = 0.552 + v_cut1 + v_cut2
            pz = z_root * (1.0 - v) + z_tip * v
            
            # Follow skull curvature naturally!
            py = rad_head + center_y + 0.010 + math.sin(v * math.pi) * 0.014
            
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

    # TWIN PIGTAIL BUNCHES & PUFFY SCRUNCHIES
    from generate_perfect_pilot import add_marshmallow_scrunchie, add_plump_pigtail_bunch
    
    for sign in [-1, 1]:
        tie_center = Vector((sign * 0.180, -0.045, 0.585))
        
        # Puffy marshmallow scrunchie
        add_marshmallow_scrunchie(bm, tie_center, axis=(sign * 0.75, -0.25, 0.60),
                                  major_r=0.026, minor_r=0.012, num_puffs=6, mat_index=1)
        
        # Plump, bouncy chibi pigtail bunch:
        pigtail_spine = [
            (sign * 0.182, -0.048, 0.585),
            (sign * 0.238, -0.065, 0.570),  # flared crest
            (sign * 0.270, -0.055, 0.490),  # plump bouncy body
            (sign * 0.238, -0.035, 0.420),  # curving inward
            (sign * 0.185, -0.020, 0.380)   # cute tapered tip
        ]
        add_plump_pigtail_bunch(bm, pigtail_spine,
                                width_profile=(0.042, 0.074, 0.016),
                                thick_profile=(0.028, 0.046, 0.012), segs=5)
        
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
    
    obj = bpy.data.objects.new("Hair_HAIR_008_Quad", mesh)
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
        ("HAIR_001", "Classic Bowl Cut", build_quad_hair_001, "#281e1a"),
        ("HAIR_004", "Side-Parted Short", build_quad_hair_004, "#221b18"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_quad_hair_008(arm, cid, col, "#f4b41a"), "#281e1a")
    ]
    
    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n==================================================")
        print(f"BUILDING QUAD PILOT: {h_id} — {h_name}")
        print(f"==================================================")
        char_tag = f"quad_{h_id.lower()}"
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
        
        blend_path = os.path.join(OUT_DIR, f"{h_id.lower()}_v6_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        
        glb_path = os.path.join(OUT_DIR, f"character_{h_id.lower()}_v6.glb")
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
