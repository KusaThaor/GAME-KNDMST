"""
Artistic Chibi Hair Sculptor & Renderer - Pilot Styles V9
Faithful to Animal Crossing and Stylized Chibi Reference Art.
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
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v9")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# STUDIO ENVIRONMENT: Soft Warm Chibi Production Studio
# ---------------------------------------------------------------------------

def setup_production_studio(scene, res=(720, 840)):
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)
            
    cam_data = bpy.data.cameras.new("Studio_Cam")
    cam_data.lens = 65
    cam = bpy.data.objects.new("Studio_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    
    # Warm clean studio background
    scene.world = bpy.data.worlds.new("Studio_World")
    scene.world.use_nodes = True
    nodes = scene.world.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    scene.world.node_tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bg.inputs["Color"].default_value = (0.86, 0.88, 0.90, 1.0)  # Clean, bright soft studio neutral
    bg.inputs["Strength"].default_value = 0.85
    
    # Soft three-point studio lighting with ample fill to eliminate dark facial shadows
    def add_light(name, ltype, energy, loc, rot_deg, color=(1,1,1), size=0.5):
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
        
    # Key light: Front-right elevated area light (soft shadows)
    add_light("Key_Light", 'AREA', 45.0, (0.45, 0.85, 0.85), (50, 0, 25), (1.0, 0.98, 0.95), size=0.8)
    # Fill light: Front-left soft area light (fills eyebrow/eye shadow)
    add_light("Fill_Light", 'AREA', 30.0, (-0.45, 0.80, 0.65), (55, 0, -30), (0.95, 0.97, 1.0), size=0.9)
    # Frontal eye-light: Low intensity light directly on face
    add_light("Front_Eye_Light", 'AREA', 18.0, (0.0, 0.95, 0.53), (90, 0, 0), (1.0, 0.98, 0.96), size=0.6)
    # Rim / Hair highlight: Behind and above for soft silhouette glow
    add_light("Hair_Rim_Light", 'AREA', 55.0, (0.0, -0.75, 0.95), (-55, 0, 180), (1.0, 0.97, 0.92), size=1.0)
    
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.film_transparent = False
    
    # Color management: Filmic or AgX with Medium High Contrast
    if hasattr(scene.view_settings, "view_transform"):
        scene.view_settings.view_transform = 'Standard' if 'Standard' in scene.view_settings.view_transform else scene.view_settings.view_transform
    return cam

# ---------------------------------------------------------------------------
# MATERIALS: Velvet Chibi Satin Shaders
# ---------------------------------------------------------------------------

def create_chibi_hair_material(mat_name, hex_color="#2b201c", roughness=0.62):
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
        bsdf.inputs["Specular IOR Level"].default_value = 0.22
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.22
        
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = 0.45
        if "Sheen Tint" in bsdf.inputs:
            bsdf.inputs["Sheen Tint"].default_value = (min(1.0, col[0] * 1.5 + 0.1), min(1.0, col[1] * 1.3 + 0.08), min(1.0, col[2] * 1.1 + 0.05), 1.0)
    elif "Sheen" in bsdf.inputs:
        bsdf.inputs["Sheen"].default_value = 0.45
        
    if "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = 0.05
        if "Subsurface Radius" in bsdf.inputs:
            bsdf.inputs["Subsurface Radius"].default_value = (0.04, 0.02, 0.015)
    elif "Subsurface" in bsdf.inputs:
        bsdf.inputs["Subsurface"].default_value = 0.05
    return mat

def create_scrunchie_material(mat_name, hex_color="#f5b82e"):
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
    bsdf.inputs["Roughness"].default_value = 0.42
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.25
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.25
    return mat

def apply_clean_subsurf(obj, levels=1):
    for p in obj.data.polygons:
        p.use_smooth = True
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = levels
    m.render_levels = levels

# ---------------------------------------------------------------------------
# HAIRSTYLE 001: CLASSIC BOWL CUT (ANIMAL CROSSING SCALLOPED FRINGE)
# ---------------------------------------------------------------------------

def build_art_hair_001(arm, char_id, color_hex="#2b201c"):
    """
    HAIR_001: Classic Bowl Cut.
    - True to Animal Crossing Reference (Image 1, bottom row 2nd):
      * Snug mushroom volume conforming cleanly to head curvature (offset 5-7mm).
      * Scalloped V-notched bangs sitting gracefully ABOVE eyebrows (Z ~ 0.582 to 0.588),
        revealing the expressive eyebrows and eyes with zero heavy shadowing!
      * 4 distinct graphic teeth/scallops along the fringe with clean negative space.
      * Neat side contour dipping around the ears, framing cheeks nicely.
      * Smooth continuous back nape covering down to Z ~ 0.435.
      * Solid clean inward rim thickness.
    """
    bm = bmesh.new()
    
    # Head skull center and radii (snug fit)
    center_y = -0.010
    center_z = 0.530
    rx = 0.179   # Head max X is 0.174 -> 5mm offset
    ry = 0.170   # Head max Y is 0.165 -> 5mm offset
    rz = 0.160   # Crown Z is 0.678 -> 0.530 + 0.160 = 0.690 (10mm hair volume at crown)
    
    num_rings = 16
    segs = 36
    
    ring_verts = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)  # 0 at crown, 1 at fringe/nape edge
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)  # X component
            cos_u = math.cos(u)  # Y component
            
            # --- 1. Compute boundary latitude phi_max based on azimuth ---
            if cos_u > 0.18:  # FRONT FRINGE
                theta_f = math.atan2(sin_u, cos_u)
                # 4 cute stylized scalloped teeth (Animal Crossing signature)
                # Eyebrows are at Z = 0.569. Fringe tips reach Z ~ 0.580; V-notches reach Z ~ 0.595.
                scallop = 0.085 * (math.cos(theta_f * 4.0) ** 2)
                max_phi = math.radians(68.0) + scallop  # Z ~ 0.580 - 0.595 (ABOVE EYEBROWS!)
                
                # Slight puff in the bangs for volume
                puff = 0.005 + 0.006 * math.sin(v * math.pi)
                
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(98.0) + back_fac * math.radians(30.0)  # down to Z ~ 0.440
                puff = 0.004 + 0.004 * (v ** 1.2)
                
            else:  # SIDES / CHEEKS
                if cos_u >= 0.0:  # Cheeks in front of ear
                    max_phi = math.radians(78.0)  # Z ~ 0.535
                else:  # Around ear
                    max_phi = math.radians(70.0)  # clean ear notch Z ~ 0.550
                puff = 0.004
                
            phi = v * max_phi
            
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Refine ear clearance
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
            
    # Crown apex: smooth vertex fan with smooth normals
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    # Inward beveled rim (creates solid geometry and realistic hair thickness)
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        dir_in = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
        p_in = vo.co + dir_in * 0.014 + Vector((0, 0, 0.007))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_001_v9", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.62)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# HAIRSTYLE 004: SIDE-PARTED SHORT (ELEGANT ASYMMETRIC CHIBI SWEEP)
# ---------------------------------------------------------------------------

def build_art_hair_004(arm, char_id, color_hex="#241c19"):
    """
    HAIR_004: Side-Parted Short.
    - True to Animal Crossing Reference (Image 1, top row 1st & 2nd):
      * Natural side part at X = -0.052.
      * Major sweeping hair volume flows gracefully across forehead,
        tapering to the right temple with crisp sculpted bevel.
      * Forehead is partially visible: left eyebrow completely exposed, right eyebrow subtly framed!
      * Sleek minor side combed neatly down left temple behind ear.
      * Clean back volume down to nape.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.530
    rx = 0.178
    ry = 0.169
    rz = 0.158
    
    num_rings = 14
    segs = 36
    
    # Base skull volume
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.18:  # Recessed base hairline under the sweep
                max_phi = math.radians(58.0)  # high base hairline
            elif cos_u < -0.15:  # Back nape
                back_fac = -cos_u
                max_phi = math.radians(98.0) + back_fac * math.radians(28.0)
            else:
                max_phi = math.radians(72.0)
                
            phi = v * max_phi
            px = rx * math.sin(phi) * sin_u
            py = ry * math.sin(phi) * cos_u + center_y
            pz = center_z + rz * math.cos(phi)
            
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
            
    # Part apex at X = -0.050
    apex = bm.verts.new(Vector((-0.050, center_y + 0.010, center_z + rz + 0.003)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    # Inward rim for base
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        dir_in = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
        p_in = vo.co + dir_in * 0.012 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # --- MAJOR SCULPTED SWEEP (Flows from part X=-0.05 across forehead to right temple) ---
    cols = 16
    rows = 7
    sweep_grid = []
    for r in range(rows):
        v = r / (rows - 1)  # 0 at root, 1 at bottom edge of swoop
        row = []
        for c in range(cols):
            u = c / (cols - 1)  # 0 at part line, 1 at right temple
            
            # Angular span across forehead: theta goes from +16 deg to -62 deg
            ang_deg = 16.0 - u * 78.0
            theta = math.radians(ang_deg)
            
            # Root curves from top of forehead down to brow
            phi_root = math.radians(34.0 + u * 12.0)
            # Tip: swoops down across brow level (Z ~ 0.582) then sweeps up toward temple
            phi_tip = math.radians(72.0 - math.sin(u * math.pi * 0.85) * 8.0)
            phi = phi_root * (1.0 - v) + phi_tip * v
            
            # Volume puff: hugs close to skull (only 4mm at root, 8mm in body)
            puff = 0.004 + math.sin(v * math.pi) * 0.007
            
            px = (rx + puff) * math.sin(phi) * (-math.sin(theta))
            py = (ry + puff) * math.sin(phi) * math.cos(theta) + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            row.append(bm.verts.new(Vector((px, py, pz))))
        sweep_grid.append(row)
        
    for r in range(rows - 1):
        for c in range(cols - 1):
            bm.faces.new((sweep_grid[r][c], sweep_grid[r][c+1], sweep_grid[r+1][c+1], sweep_grid[r+1][c]))
            
    # Solid clean rim for sweep
    sw_out = sweep_grid[-1]
    sw_in = []
    for c in range(cols):
        vo = sw_out[c]
        p_in = vo.co + Vector((0, -0.010, 0.006))
        sw_in.append(bm.verts.new(p_in))
    for c in range(cols - 1):
        bm.faces.new((sw_out[c], sw_out[c+1], sw_in[c+1], sw_in[c]))

    # --- MINOR TEMPLE SWEEP (Left side of part) ---
    m_cols = 8
    m_rows = 5
    m_grid = []
    for r in range(m_rows):
        v = r / (m_rows - 1)
        row = []
        for c in range(m_cols):
            u = c / (m_cols - 1)
            ang_deg = 16.0 + u * 42.0
            theta = math.radians(ang_deg)
            phi_root = math.radians(34.0 + u * 10.0)
            phi_tip = math.radians(66.0 + u * 6.0)
            phi = phi_root * (1.0 - v) + phi_tip * v
            puff = 0.004 + math.sin(v * math.pi) * 0.005
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
    
    obj = bpy.data.objects.new("Hair_HAIR_004_v9", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.62)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# HAIRSTYLE 008: TWIN PIGTAILS (AUTHENTIC DUAL LOBES + BOUNCY CHIBI PLUMES)
# ---------------------------------------------------------------------------

def add_marshmallow_tie(bm, center, axis=(0, 0, 1), major_r=0.024, minor_r=0.010, num_puffs=6, mat_index=1):
    """Puffy cloud/marshmallow hair tie."""
    axis = Vector(axis).normalized()
    up = Vector((0, 0, 1)) if abs(axis.z) < 0.88 else Vector((0, 1, 0))
    u_dir = axis.cross(up).normalized()
    v_dir = axis.cross(u_dir).normalized()
    
    segs_u = 20
    segs_v = 10
    rings = []
    for i in range(segs_u):
        ang_u = 2.0 * math.pi * i / segs_u
        puff = 1.0 + 0.30 * math.cos(num_puffs * ang_u)
        r_maj = major_r * puff
        r_min = minor_r * (0.85 + 0.25 * math.cos(num_puffs * ang_u))
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

def add_sculpted_chibi_plume(bm, spine_points, width_profile, thick_profile, segs=6, mat_index=0):
    """
    Extrudes a silky, plump, teardrop chibi hair plume with clean 12-sided rounded cross section.
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
    n_pts = 12
    for i, (pt, t) in enumerate(curve_pts):
        if t < 0.35:
            fac = t / 0.35
            w = w_start + (w_mid - w_start) * (fac ** 0.8)
            th = th_start + (th_mid - th_start) * (fac ** 0.8)
        else:
            fac = (t - 0.35) / 0.65
            w = w_mid + (w_end - w_mid) * (fac ** 1.2)
            th = th_mid + (th_end - th_mid) * (fac ** 1.2)
            
        if i < len(curve_pts) - 1:
            tangent = (curve_pts[i + 1][0] - pt).normalized()
        else:
            tangent = (pt - curve_pts[i - 1][0]).normalized()
            
        up = Vector((0, 0, 1))
        if abs(tangent.dot(up)) > 0.88:
            up = Vector((0, 1, 0))
        binormal = tangent.cross(up).normalized()
        normal = binormal.cross(tangent).normalized()
        
        # 12-sided rounded elliptical profile with soft bevel
        ring = []
        for k in range(n_pts):
            ang = 2.0 * math.pi * k / n_pts
            vx = math.cos(ang) * (w * 0.5)
            vy = math.sin(ang) * (th * 0.5)
            # Add subtle crease down outside for hair clumping
            if abs(ang) < 0.4:
                vy *= 1.15
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
            
    # Cap both ends
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

def build_art_hair_008(arm, char_id, color_hex="#2b201c", tie_hex="#f5b82e"):
    """
    HAIR_008: Twin Pigtails.
    - True to Reference Image 2 & Animal Crossing (Image 1, top row 2nd):
      * Back skull has TWO PROMINENT ROUNDED LOBES (peach/heart silhouette).
        Clean, sharp center parting cleft along X = 0 running from crown down to nape.
      * High clean nape line at Z ~ 0.490, gathering upward into the pigtails (nape of neck is bare!).
      * Front bangs: cute, softly scalloped curtain fringe sitting nicely above the eyes (Z ~ 0.580).
      * Puffy marshmallow scrunchies placed symmetrically at upper rear temples.
      * Plump, bouncy, teardrop chibi pigtails that plume outward with lively silhouette!
      * Cute delicate cheek strands in front of ears.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.530
    rx = 0.178
    ry = 0.168
    rz = 0.158
    
    segs_half = 18
    num_rings = 15
    
    grid_left = []
    grid_right = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)  # 0 at crown, 1 at hairline rim
        row_l = []
        row_r = []
        
        for s in range(segs_half + 1):
            u = math.pi * s / segs_half  # 0 at front center (+Y), pi at back center (-Y)
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # Front hairline
                max_phi = math.radians(60.0)
            elif cos_u < -0.15:  # Back nape: GATHERED HIGH UP (Z ~ 0.485!)
                back_fac = -cos_u
                max_phi = math.radians(82.0) + back_fac * math.radians(18.0)
            else:
                max_phi = math.radians(72.0)
                
            phi = v * max_phi
            
            base_x = rx * math.sin(phi) * sin_u
            base_y = ry * math.sin(phi) * cos_u + center_y
            base_z = center_z + rz * math.cos(phi)
            
            # --- DUAL ROUNDED PEACH LOBES AT REAR (cos_u < 0) ---
            if cos_u < 0.0 and v > 0.10:
                # seam_dist: 0 at center seam X=0 (s=segs_half)
                seam_dist = math.pi - u
                
                # Cleft profile: deep sharp cleft along X=0, swelling into plump rounded cheek
                # At center seam (X=0): hair sits snug against skull (offset 2mm)
                # At peak of lobe (seam_dist ~ 0.45, X ~ 0.08): swells outward by 24mm!
                lobe_curve = math.sin(min(1.0, seam_dist / 0.80) * math.pi)
                lobe_puff = lobe_curve * 0.024 * (v ** 0.5)
                
                base_y -= lobe_puff * 1.15   # pushes outward behind
                base_x += lobe_puff * 0.35   # widens lobe slightly
                
            # Ear notch
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((base_x - 0.166)**2 + (base_y + 0.005)**2 + (base_z - 0.515)**2)
                if ear_dist < 0.038:
                    base_z += (0.038 - ear_dist) * 0.85
                    base_x = max(base_x, 0.182)
                    
            vr = bm.verts.new(Vector((base_x, base_y, base_z)))
            row_r.append(vr)
            
            if s == 0 or s == segs_half:
                vl = vr  # shared seam vertex
            else:
                vl = bm.verts.new(Vector((-base_x, base_y, base_z)))
            row_l.append(vl)
            
        grid_right.append(row_r)
        grid_left.append(row_l)
        
    for r in range(num_rings - 1):
        for s in range(segs_half):
            bm.faces.new((grid_right[r][s], grid_right[r][s+1], grid_right[r+1][s+1], grid_right[r+1][s]))
            bm.faces.new((grid_left[r][s+1], grid_left[r][s], grid_left[r+1][s], grid_left[r+1][s+1]))
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.003)))
    for s in range(segs_half):
        bm.faces.new((apex, grid_right[0][s], grid_right[0][s+1]))
        bm.faces.new((apex, grid_left[0][s+1], grid_left[0][s]))
        
    # Inward rim
    for side_grid in [grid_right, grid_left]:
        rim_out = side_grid[-1]
        rim_in = []
        for s in range(len(rim_out)):
            vo = rim_out[s]
            p_in = vo.co + (Vector((0, center_y, vo.co.z)) - vo.co).normalized() * 0.012 + Vector((0, 0, 0.006))
            rim_in.append(bm.verts.new(p_in))
        for s in range(len(rim_out) - 1):
            bm.faces.new((rim_out[s], rim_out[s+1], rim_in[s+1], rim_in[s]))

    # --- FRONT CURTAIN BANGS (Soft Animal Crossing fringe above brow) ---
    b_cols = 20
    b_rows = 6
    bang_grid = []
    for r in range(b_rows):
        v = r / (b_rows - 1)
        row = []
        for c in range(b_cols):
            u = c / (b_cols - 1)
            ang_deg = 50.0 - u * 100.0
            theta = math.radians(ang_deg)
            
            # Subtle graphic center notch and side arches
            v_cut = math.exp(-((u - 0.50) ** 2) / 0.010) * 6.0
            phi_root = math.radians(35.0)
            phi_tip = math.radians(72.0 - v_cut)  # Z ~ 0.582 (ABOVE EYEBROWS!)
            phi = phi_root * (1.0 - v) + phi_tip * v
            
            puff = 0.004 + math.sin(v * math.pi) * 0.006
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
        p_in = vo.co + Vector((0, -0.010, 0.006))
        b_rim_in.append(bm.verts.new(p_in))
    for c in range(b_cols - 1):
        bm.faces.new((b_rim_out[c], b_rim_out[c+1], b_rim_in[c+1], b_rim_in[c]))

    # --- TWIN BOUNCY CHIBI PIGTAILS & PUFFY SCRUNCHIES ---
    for sign in [-1, 1]:
        tie_center = Vector((sign * 0.176, -0.050, 0.575))
        
        # Puffy marshmallow scrunchie (golden yellow)
        add_marshmallow_tie(bm, tie_center, axis=(sign * 0.70, -0.30, 0.65),
                            major_r=0.024, minor_r=0.011, num_puffs=6, mat_index=1)
        
        # Bouncy, plump chibi plume (Reference Image 1 top-row 2nd & Image 2)
        pigtail_spine = [
            (sign * 0.176, -0.052, 0.575),
            (sign * 0.235, -0.065, 0.570),  # soft crest
            (sign * 0.265, -0.055, 0.495),  # plump body
            (sign * 0.235, -0.035, 0.430),  # curving down
            (sign * 0.185, -0.020, 0.390)   # cute tapered tip
        ]
        add_sculpted_chibi_plume(bm, pigtail_spine,
                                width_profile=(0.040, 0.072, 0.016),
                                thick_profile=(0.028, 0.046, 0.012), segs=6, mat_index=0)
        
        # Delicate cheek strand
        sb_spine = [
            (sign * 0.158, 0.060, 0.570),
            (sign * 0.168, 0.035, 0.535),
            (sign * 0.162, 0.018, 0.505)
        ]
        add_sculpted_chibi_plume(bm, sb_spine,
                                width_profile=(0.020, 0.024, 0.008),
                                thick_profile=(0.010, 0.012, 0.004), segs=3, mat_index=0)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008_v9", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.62)
    mat_tie = create_scrunchie_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# RUNNER & RENDERER
# ---------------------------------------------------------------------------

def run():
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    
    pilot_styles = [
        ("HAIR_001", "Classic Bowl Cut", build_art_hair_001, "#2b201c"),
        ("HAIR_004", "Side-Parted Short", build_art_hair_004, "#241c19"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_art_hair_008(arm, cid, col, "#f5b82e"), "#2b201c")
    ]
    
    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n==================================================")
        print(f"BUILDING V9 ART PILOT: {h_id} — {h_name}")
        print(f"==================================================")
        char_tag = f"v9_{h_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)
        
        # Thoroughly remove all existing hair objects from scene
        for o in list(bpy.data.objects):
            if o.name.startswith("Hair_"):
                bpy.data.objects.remove(o, do_unlink=True)
                
        arm = factory.arm
        hair_obj = builder_fn(arm, char_tag, def_color)
        
        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        factory.equip_accessories(["ACC_002"], char_tag)
        
        blend_path = os.path.join(OUT_DIR, f"{h_id.lower()}_v9_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        
        glb_path = os.path.join(OUT_DIR, f"character_{h_id.lower()}_v9.glb")
        glb_size = factory.export_glb(glb_path)
        print(f"GLB size: {glb_size / 1024:.1f} KB")
        
        scene = bpy.context.scene
        cam = setup_production_studio(scene, res=(720, 840))
        
        views = [
            ("front", (0.0, 0.95, 0.535), (math.radians(90), 0, math.radians(180))),
            ("three_quarter", (0.68, 0.68, 0.555), (math.radians(82), 0, math.radians(135))),
            ("side", (0.95, 0.0, 0.535), (math.radians(90), 0, math.radians(90))),
            ("back", (0.0, -0.95, 0.535), (math.radians(90), 0, 0))
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
