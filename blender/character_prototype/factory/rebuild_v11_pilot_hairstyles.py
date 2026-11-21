"""
=============================================================================
CHIBI MODULAR HAIRSTYLE GENERATOR V11
Production Rework for Pilot Hairstyles:
- HAIR_001: Classic Bowl Cut (Soft broad fringe groupings, tidy rounded nape, no decorative scalloping)
- HAIR_004: Side-Parted Short (True 3D swept volume, off-center part, concealed roots, zero pale spots/open seams)
- HAIR_008: Twin Pigtails (Full rear skull coverage to natural nape, subtle center part groove, soft tapered plumes through simple ties)
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
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v11")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# STUDIO ENVIRONMENT & CAMERAS
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
    # Clean warm neutral studio backdrop
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
        
    # Calibrated soft studio lighting (balanced to avoid hot specular singularities or harsh facial shadows)
    add_light("Key_Light", 'AREA', 45.0, (0.42, 0.90, 0.80), (48, 0, 22), (1.0, 0.98, 0.95), size=1.0)
    add_light("Fill_Light", 'AREA', 32.0, (-0.45, 0.85, 0.65), (52, 0, -28), (0.95, 0.97, 1.0), size=1.1)
    add_light("Front_Eye_Light", 'AREA', 20.0, (0.0, 1.00, 0.53), (90, 0, 0), (1.0, 0.98, 0.96), size=0.8)
    add_light("Hair_Rim_Light", 'AREA', 45.0, (0.0, -0.85, 0.95), (-50, 0, 180), (1.0, 0.97, 0.93), size=1.3)
    
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.film_transparent = False
    return cam

# ---------------------------------------------------------------------------
# MATERIALS: Restrained Satin-Matte Chibi Hair
# ---------------------------------------------------------------------------

def create_chibi_hair_material(mat_name, hex_color="#2b201c", roughness=0.68):
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
    
    # Restrained specular and soft sheen to avoid specular pinhole artifacts
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.16
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.16
        
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = 0.25
        if "Sheen Tint" in bsdf.inputs:
            bsdf.inputs["Sheen Tint"].default_value = (min(1.0, col[0] * 1.3), min(1.0, col[1] * 1.2), min(1.0, col[2] * 1.1), 1.0)
    elif "Sheen" in bsdf.inputs:
        bsdf.inputs["Sheen"].default_value = 0.25
        
    if "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = 0.03
        if "Subsurface Radius" in bsdf.inputs:
            bsdf.inputs["Subsurface Radius"].default_value = (0.03, 0.02, 0.01)
    elif "Subsurface" in bsdf.inputs:
        bsdf.inputs["Subsurface"].default_value = 0.03
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
    bsdf.inputs["Roughness"].default_value = 0.45
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.18
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.18
    return mat

def apply_clean_subsurf(obj, levels=1):
    for p in obj.data.polygons:
        p.use_smooth = True
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = levels
    m.render_levels = levels

# ---------------------------------------------------------------------------
# GEOMETRY UTILITIES
# ---------------------------------------------------------------------------

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
        # Gradual cubic smooth taper
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
            
    # Caps
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

# ---------------------------------------------------------------------------
# 1. REWORKED HAIR_001: CLASSIC BOWL CUT (V11)
# ---------------------------------------------------------------------------

def build_chibi_hair_001_v11(arm, char_id, color_hex="#2b201c"):
    """
    HAIR_001: Classic Bowl Cut.
    Rework according to artistic review:
    - Retain compact rounded bowl-cut silhouette.
    - Replace the nearly featureless cap edge with a few subtle, broad fringe groupings.
    - Give fringe slight thickness and soft inward curvature over the forehead.
    - Keep lower edge gently varied WITHOUT repetitive teeth, deep V cuts, or scalloped decorative borders.
    - Blend temples and back smoothly into the main volume.
    - Keep eyes and eyebrows fully readable.
    - Preserve a tidy rounded nape without an oversized rear bulge.
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
        v = r / (num_rings - 1)  # 0 at crown, 1 at fringe/nape edge
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.18:  # FRONT FRINGE
                theta_f = math.atan2(sin_u, cos_u)
                # Asymmetric, natural broad fringe groupings:
                # Group 1 (center-left): broad soft lock
                # Group 2 (center-right): subtle separation
                # Group 3 & 4 (temples): soft blend into side volume
                # Subtle gentle variation (amplitude only ~2.5 deg, not sharp teeth!)
                fringe_var = (
                    0.035 * math.cos(theta_f * 2.2 + 0.3) +
                    0.020 * math.sin(theta_f * 4.1)
                )
                # Base boundary latitude: reaches Z ~ 0.582 (safely above eyebrows Z=0.569)
                max_phi = math.radians(67.5) + fringe_var
                
                # Soft inward curvature toward forehead at the fringe tips
                # v < 0.8 swells slightly (5mm volume), v > 0.8 curls subtly inward
                puff = 0.005 + 0.006 * math.sin(v * math.pi) - 0.003 * (v ** 2)
                
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                # Tidy rounded nape (down to Z ~ 0.445, snug without rear bulge)
                max_phi = math.radians(96.0) + back_fac * math.radians(26.0)
                puff = 0.003 + 0.002 * v
                
            else:  # SIDES & TEMPLES
                if cos_u >= 0.0:  # Temple blending
                    max_phi = math.radians(76.0)
                else:  # Around ear
                    max_phi = math.radians(71.0)
                puff = 0.003
                
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Smooth ear clearance notch
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
        
    # Inward beveled rim: physical thickness
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
    
    obj = bpy.data.objects.new("Hair_HAIR_001_v11", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# 2. REWORKED HAIR_004: SIDE-PARTED SHORT (V11)
# ---------------------------------------------------------------------------

def build_chibi_hair_004_v11(arm, char_id, color_hex="#241c19"):
    """
    HAIR_004: Side-Parted Short.
    Rework according to artistic review:
    - Establish a clear off-center part and a broad fringe sweeping naturally to one side.
    - Replace the visible rectangular forehead plate and abrupt square notch.
    - Curve the fringe in 3D so it follows the forehead and blends into crown and temple.
    - Conceal roots of separate locks inside the main hair volume (ELIMINATING the pale spot artifact!).
    - Use shallow overlapping forms to suggest the part, with no open seam exposing scalp.
    - Make the side-part direction readable in silhouette and volume.
    """
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.185
    ry = 0.174
    rz = 0.165
    
    num_rings = 16
    segs = 36
    
    # Off-center part location: X = -0.048 (above left inner eye/brow)
    # The main volume is constructed as a UNIFIED ASYMMETRIC MESH.
    # The part line and sweeping volume are built DIRECTLY into the topological grid,
    # completely eliminating open boundary edges or glued-on plates!
    
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            # --- ASYMMETRIC SILHOUETTE & FRINGE ---
            if cos_u > 0.15:  # FOREHEAD & FRINGE
                theta_f = math.atan2(sin_u, cos_u)
                
                # Part is at theta_part ~ 0.26 rad (X ~ -0.048)
                # Left of part (sin_u < -0.26): sleek minor temple lock
                # Right of part (sin_u >= -0.26): broad sweeping lock flowing across forehead
                if sin_u < -0.26:
                    # Minor side: high clean hairline exposing left eyebrow completely
                    max_phi = math.radians(58.0 + (sin_u + 0.26) * 12.0)
                    puff = 0.003 + 0.003 * v
                else:
                    # Major sweeping side:
                    # Swells slightly in volume from part across forehead,
                    # sweeping down across right brow (Z ~ 0.580) and blending into right temple
                    sweep_fac = math.sin((sin_u + 0.26) / 1.26 * math.pi * 0.85)
                    # Smooth 3D curve with gentle slope
                    max_phi = math.radians(60.0 + sweep_fac * 11.5)
                    # Volumetric thickness in the sweep
                    puff = 0.004 + 0.008 * math.sin(v * math.pi) * max(0.0, sweep_fac)
                    
            elif cos_u < -0.15:  # BACK NAPE
                back_fac = -cos_u
                max_phi = math.radians(96.0) + back_fac * math.radians(26.0)
                puff = 0.003
            else:  # SIDES
                if sin_u > 0:  # Right temple (receives the sweep)
                    max_phi = math.radians(77.0)
                    puff = 0.005
                else:  # Left temple (sleek tuck)
                    max_phi = math.radians(73.0)
                    puff = 0.003
                    
            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Ear notch
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
            
    # Off-center crown apex at part line (X = -0.048)
    apex = bm.verts.new(Vector((-0.048, center_y + 0.005, center_z + rz + 0.004)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))
        
    # Inward beveled rim
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
        
    # --- SUBTLE SCULPTED OVERLAP AT THE PART ---
    # To suggest the layered overlap at the part line cleanly without any open raw edges:
    # A single soft, shallow curved lock that sprouts from INSIDE the crown volume
    # and reinforces the sweeping direction over the right side of the forehead.
    overlap_spine = [
        (-0.046, 0.065, 0.665),  # Deep inside crown volume (concealed root!)
        (-0.020, 0.095, 0.640),  # Emerges gently
        (0.045, 0.115, 0.605),   # Sweeps across brow
        (0.095, 0.100, 0.575),   # Blends into temple
        (0.125, 0.070, 0.545)    # Tapers smoothly into side volume
    ]
    add_soft_tapered_lock(bm, overlap_spine,
                          width_profile=(0.024, 0.038, 0.012),
                          thick_profile=(0.010, 0.014, 0.004),
                          segs=5, n_pts=10, mat_index=0)
                          
    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_004_v11", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# 3. REWORKED HAIR_008: TWIN PIGTAILS (V11)
# ---------------------------------------------------------------------------

def build_chibi_hair_008_v11(arm, char_id, color_hex="#2b201c", tie_hex="#f5b82e"):
    """
    HAIR_008: Twin Pigtails.
    Rework according to artistic review:
    - Cover the back of the skull CONTINUOUSLY down to a natural nape hairline.
      (NO large pale bald section or high V-cutout!).
    - A small area of neck below the hairline is acceptable; a large bare patch is not.
    - Suggest a center part subtly without splitting the rear cap open or carving a deep notch.
    - Shape the hair as gathering toward two side attachment points.
    - Connect both pigtail roots naturally to those gathered areas.
    - Replace rigid, segmented tubes with soft curved locks that taper gradually.
    - Avoid abrupt joints, pinched sections, pointed spikes, or sausage-like segments.
    - Keep ties small and simple, with hair passing visibly through their centers.
    - Preserve recognizable twin-pigtail silhouette and keep locks clear of face and shoulders.
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
            u = math.pi * s / segs_half  # 0 at front center (+Y), pi at back center (-Y)
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:  # FRONT FRINGE
                # Cute curtain bangs sitting comfortably above eyebrows (Z ~ 0.582)
                fringe_curve = 0.025 * math.sin(u * 2.0)
                max_phi = math.radians(67.5) + fringe_curve
                puff = 0.004 + 0.005 * math.sin(v * math.pi)
                
            elif cos_u < -0.15:  # CONTINUOUS REAR NAPE (COVERING SKULL FULLY!)
                back_fac = -cos_u
                # Down to Z ~ 0.448 (natural nape hairline above collar)!
                # Subtle gentle upward rise at center (amplitude only 3 deg, NOT a giant bare V!)
                seam_dist = math.pi - u
                subtle_gather = 0.04 * math.sin(min(1.0, seam_dist / 0.8) * math.pi)
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0) - subtle_gather
                
                # Subtle center part groove along X=0:
                # Hair swells slightly toward the side gathering zones (X ~ 0.10 - 0.14)
                # and has a gentle 4mm soft groove along the midline (suggesting center part)
                part_groove = math.sin(min(1.0, seam_dist / 0.85) * math.pi) * 0.010 * (v ** 0.5)
                puff = 0.004 + part_groove
                
            else:  # SIDES (Gathering toward side attachment points)
                max_phi = math.radians(75.0)
                # Billows softly toward attachment points at upper rear temples
                puff = 0.006 + 0.004 * math.sin(v * math.pi)
                
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
                vl = vr  # Shared center line vertex
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
        
    # Inward beveled rim: continuous solid thickness
    for side_grid in [grid_right, grid_left]:
        rim_out = side_grid[-1]
        rim_in = []
        for s in range(len(rim_out)):
            vo = rim_out[s]
            p_in = vo.co + (Vector((0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.006))
            rim_in.append(bm.verts.new(p_in))
        for s in range(len(rim_out) - 1):
            bm.faces.new((rim_out[s], rim_out[s+1], rim_in[s+1], rim_in[s]))

    # --- TWIN PIGTAILS & NEAT TIES ---
    for sign in [-1, 1]:
        # Side gathering anchor point
        gather_center = Vector((sign * 0.168, -0.048, 0.575))
        
        # 1. Neat, simple hair tie band (hair passes visibly through center)
        add_smooth_hair_band(bm, gather_center, axis=(sign * 0.65, -0.25, 0.70),
                             major_r=0.019, minor_r=0.0055, segs_u=16, segs_v=8, mat_index=1)
        
        # 2. Soft, curved, gradually tapering pigtail plume
        # Originates inside the gathered hair, passes cleanly through the tie,
        # arches softly outward and cascades down clear of face and shoulders
        pigtail_spine = [
            (sign * 0.155, -0.042, 0.582),  # Root inside gathered scalp
            (sign * 0.170, -0.050, 0.574),  # Passes through tie center
            (sign * 0.198, -0.058, 0.555),  # Soft buoyant crest
            (sign * 0.205, -0.046, 0.485),  # Plump curved belly
            (sign * 0.182, -0.028, 0.420),  # Smooth inward taper
            (sign * 0.155, -0.016, 0.380)   # Soft rounded blunt tip
        ]
        add_soft_tapered_lock(bm, pigtail_spine,
                              width_profile=(0.034, 0.062, 0.014),
                              thick_profile=(0.024, 0.042, 0.010),
                              segs=6, n_pts=14, mat_index=0)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008_v11", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_scrunchie_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# ---------------------------------------------------------------------------
# PIPELINE EXECUTION & MULTI-VIEW RENDERING
# ---------------------------------------------------------------------------

def run():
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    
    pilot_styles = [
        ("HAIR_001", "Classic Bowl Cut", build_chibi_hair_001_v11, "#2b201c"),
        ("HAIR_004", "Side-Parted Short", build_chibi_hair_004_v11, "#241c19"),
        ("HAIR_008", "Twin Pigtails", lambda arm, cid, col: build_chibi_hair_008_v11(arm, cid, col, "#f5b82e"), "#2b201c")
    ]
    
    for h_id, h_name, builder_fn, def_color in pilot_styles:
        print(f"\n==================================================")
        print(f"BUILDING V11 ART PILOT: {h_id} — {h_name}")
        print(f"==================================================")
        char_tag = f"v11_{h_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)
        
        # Thoroughly clean all previous hair objects
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
        
        # Save source .blend
        blend_path = os.path.join(OUT_DIR, f"{h_id.lower()}_v11_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print(f"Saved source blend: {blend_path}")
        
        # Export GLB
        glb_path = os.path.join(OUT_DIR, f"character_{h_id.lower()}_v11.glb")
        glb_size = factory.export_glb(glb_path)
        print(f"GLB size: {glb_size / 1024:.1f} KB")
        
        scene = bpy.context.scene
        cam = setup_chibi_studio(scene, res=(768, 896))
        
        # Render all required production views:
        # 1. Front (0°)
        # 2. Three-Quarter (45°)
        # 3. Profile / Side (90°)
        # 4. Back / Rear (180°)
        # 5. Elevated Rear (Looking down at crown & rear hairline)
        # 6. Fringe Join Close-Up
        # 7. Nape Hairline Close-Up
        views = [
            ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
            ("three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
            ("side", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
            ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
            ("elevated_rear", (0.0, -0.85, 0.820), (math.radians(65), 0, 0), 60),
            ("fringe_closeup", (0.0, 0.50, 0.575), (math.radians(88), 0, math.radians(180)), 90),
            ("nape_closeup", (0.0, -0.50, 0.490), (math.radians(92), 0, 0), 90)
        ]
        
        for vname, loc, rot, lens in views:
            cam.location = loc
            cam.rotation_euler = rot
            cam.data.lens = lens
            out_img = os.path.join(OUT_DIR, f"{h_id.lower()}_{vname}.png")
            scene.render.filepath = out_img
            bpy.ops.render.render(write_still=True)
            print(f"  Rendered {vname} -> {out_img}")

if __name__ == "__main__":
    run()
