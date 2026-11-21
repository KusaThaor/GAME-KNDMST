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
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_pilot")
os.makedirs(PREVIEWS_DIR, exist_ok=True)

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip("#")
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_linear(r), to_linear(g), to_linear(b), 1.0)

def create_stylized_hair_mat(name, hex_color="#1c1615", roughness=0.72, sheen=0.25):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    node_out = nodes.new("ShaderNodeOutputMaterial")
    node_bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(node_bsdf.outputs["BSDF"], node_out.inputs["Surface"])
    
    col = hex_to_rgb(hex_color)
    node_bsdf.inputs["Base Color"].default_value = col
    node_bsdf.inputs["Roughness"].default_value = roughness
    node_bsdf.inputs["Metallic"].default_value = 0.0
    
    if "Specular IOR Level" in node_bsdf.inputs:
        node_bsdf.inputs["Specular IOR Level"].default_value = 0.30
    elif "Specular" in node_bsdf.inputs:
        node_bsdf.inputs["Specular"].default_value = 0.30
        
    if "Sheen Weight" in node_bsdf.inputs:
        node_bsdf.inputs["Sheen Weight"].default_value = sheen
        if "Sheen Tint" in node_bsdf.inputs:
            node_bsdf.inputs["Sheen Tint"].default_value = (min(1.0, col[0]*1.4), min(1.0, col[1]*1.4), min(1.0, col[2]*1.4), 1.0)
    elif "Sheen" in node_bsdf.inputs:
        node_bsdf.inputs["Sheen"].default_value = sheen
        
    return mat

def create_hair_tie_mat(name, hex_color="#e0564c"):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    node_out = nodes.new("ShaderNodeOutputMaterial")
    node_bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(node_bsdf.outputs["BSDF"], node_out.inputs["Surface"])
    node_bsdf.inputs["Base Color"].default_value = hex_to_rgb(hex_color)
    node_bsdf.inputs["Roughness"].default_value = 0.50
    return mat

def bind_to_armature(obj, armature):
    if not armature:
        return
    vg = obj.vertex_groups.get("Head")
    if not vg:
        vg = obj.vertex_groups.new(name="Head")
    vg.add(list(range(len(obj.data.vertices))), 1.0, 'REPLACE')
    
    m = next((mod for mod in obj.modifiers if mod.type == 'ARMATURE'), None)
    if not m:
        m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = armature

def build_scalp_cap_bmesh(bm, rx=0.180, ry=0.170, rz=0.158, center_z=0.528, 
                          nape_drop=0.040, front_cutoff_z=0.590, ear_notch_rad=0.035, 
                          layers=7, u_segs=16):
    apex = bm.verts.new(Vector((0.0, -0.010, center_z + rz + 0.016)))
    rings = []
    
    for l in range(1, layers + 1):
        t = l / layers
        phi = t * math.radians(105)
        ring_verts = []
        
        for s in range(u_segs):
            theta = 2.0 * math.pi * s / u_segs
            cos_t = math.cos(theta)
            sin_t = math.sin(theta)
            
            px = rx * math.sin(phi) * sin_t
            py = ry * math.sin(phi) * cos_t - 0.010
            pz = center_z + rz * math.cos(phi)
            
            # Ear clearance (ears at x = +/-0.155, y = -0.010, z = 0.510)
            ear_dx = abs(px) - 0.155
            ear_dy = py - (-0.010)
            ear_dz = pz - 0.510
            ear_dist = math.sqrt(ear_dx*ear_dx + ear_dy*ear_dy + ear_dz*ear_dz)
            if ear_dist < ear_notch_rad:
                pz += (ear_notch_rad - ear_dist) * 0.8
                px *= 0.95
                
            # Forehead hairline
            if py > 0.02 and t > 0.50:
                pz = max(pz, front_cutoff_z)
                py = min(py, 0.145)
            elif py < -0.04:
                # Nape drop
                pz -= nape_drop * t * (abs(py) / ry)
                
            # Volume puff
            puff = 0.010 * (1.0 - t * 0.25)
            pz += puff
            
            v = bm.verts.new(Vector((px, py, pz)))
            ring_verts.append(v)
        rings.append(ring_verts)
        
    for s in range(u_segs):
        s_next = (s + 1) % u_segs
        bm.faces.new((apex, rings[0][s], rings[0][s_next]))
        
    for l in range(len(rings) - 1):
        for s in range(u_segs):
            s_next = (s + 1) % u_segs
            bm.faces.new((rings[l][s], rings[l][s_next], rings[l + 1][s_next], rings[l + 1][s]))

def add_curved_clump(bm, path_points, width_start=0.035, width_mid=0.045, width_end=0.005,
                     thick_start=0.020, thick_mid=0.025, thick_end=0.005, segments=4):
    if len(path_points) < 2:
        return []
    
    curve_pts = []
    n_pts = len(path_points)
    total_steps = segments * (n_pts - 1)
    
    for i in range(total_steps + 1):
        t_global = i / total_steps
        scaled_t = t_global * (n_pts - 1)
        idx = min(int(scaled_t), n_pts - 2)
        local_t = scaled_t - idx
        p1 = Vector(path_points[idx])
        p2 = Vector(path_points[idx + 1])
        # Smooth hermite-like interpolation
        t_smooth = local_t * local_t * (3.0 - 2.0 * local_t)
        pt = p1.lerp(p2, t_smooth)
        curve_pts.append((pt, t_global))
        
    slices = []
    for i, (pt, t) in enumerate(curve_pts):
        if t < 0.4:
            fac = t / 0.4
            w = width_start + (width_mid - width_start) * fac
            th = thick_start + (thick_mid - thick_start) * fac
        else:
            fac = (t - 0.4) / 0.6
            w = width_mid + (width_end - width_mid) * fac
            th = thick_mid + (thick_end - thick_mid) * fac
            
        if i < len(curve_pts) - 1:
            tangent = (curve_pts[i + 1][0] - pt).normalized()
        else:
            tangent = (pt - curve_pts[i - 1][0]).normalized()
            
        up = Vector((0, 0, 1))
        if abs(tangent.dot(up)) > 0.88:
            up = Vector((0, 1, 0))
        binormal = tangent.cross(up).normalized()
        normal = binormal.cross(tangent).normalized()
        
        # 6-gon cross-section for rounded organic clump
        # (left, top_left, top_right, right, bot_right, bot_left)
        v0 = bm.verts.new(pt - binormal * (w * 0.5))
        v1 = bm.verts.new(pt - binormal * (w * 0.25) + normal * (th * 0.5))
        v2 = bm.verts.new(pt + binormal * (w * 0.25) + normal * (th * 0.5))
        v3 = bm.verts.new(pt + binormal * (w * 0.5))
        v4 = bm.verts.new(pt + binormal * (w * 0.25) - normal * (th * 0.5))
        v5 = bm.verts.new(pt - binormal * (w * 0.25) - normal * (th * 0.5))
        
        slices.append((v0, v1, v2, v3, v4, v5))
        
    for i in range(len(slices) - 1):
        s1 = slices[i]
        s2 = slices[i + 1]
        for k in range(6):
            kn = (k + 1) % 6
            bm.faces.new((s1[k], s1[kn], s2[kn], s2[k]))
            
    # Cap start
    s0 = slices[0]
    bm.faces.new((s0[0], s0[5], s0[4], s0[3], s0[2], s0[1]))
    # Cap end
    se = slices[-1]
    bm.faces.new((se[0], se[1], se[2], se[3], se[4], se[5]))

def add_hair_tie_torus(bm, center, axis=(0,0,1), major_r=0.022, minor_r=0.007, segs_u=12, segs_v=6):
    axis = Vector(axis).normalized()
    up = Vector((0,0,1)) if abs(axis.z) < 0.9 else Vector((0,1,0))
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
            bm.faces.new((rings[i][j], rings[i][jnxt], rings[inxt][jnxt], rings[inxt][j]))

# =============================================================================
# BUILDERS FOR HAIR_001 TO HAIR_006
# =============================================================================

def build_hair_001_classic_bowl(arm, char_id, color_hex="#1c1615"):
    """HAIR_001: Classic Bowl Cut — Neat rounded helmet canopy with contoured soft locks and neat straight fringe"""
    bm = bmesh.new()
    # 1. Base scalp cap with round bowl volume
    build_scalp_cap_bmesh(bm, rx=0.185, ry=0.178, rz=0.165, center_z=0.528, 
                          nape_drop=0.038, front_cutoff_z=0.588, layers=7, u_segs=18)
    
    # 2. Front Bangs: 5 soft chunky fringe locks framing forehead above eyes (Z ~ 0.548)
    bang_specs = [
        # (start, mid, end, w_start, w_mid, w_end)
        ([(-0.115, 0.125, 0.615), (-0.118, 0.145, 0.578), (-0.112, 0.150, 0.548)], 0.040, 0.046, 0.016),
        ([(-0.060, 0.138, 0.625), (-0.062, 0.156, 0.582), (-0.058, 0.158, 0.546)], 0.044, 0.048, 0.018),
        ([( 0.000, 0.142, 0.630), ( 0.000, 0.160, 0.585), ( 0.000, 0.162, 0.545)], 0.046, 0.050, 0.020),
        ([( 0.060, 0.138, 0.625), ( 0.062, 0.156, 0.582), ( 0.058, 0.158, 0.546)], 0.044, 0.048, 0.018),
        ([( 0.115, 0.125, 0.615), ( 0.118, 0.145, 0.578), ( 0.112, 0.150, 0.548)], 0.040, 0.046, 0.016),
    ]
    for pts, ws, wm, we in bang_specs:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we, 
                         thick_start=0.018, thick_mid=0.022, thick_end=0.008)
        
    # 3. Soft rounded sideburns in front of ears
    for sign in [-1, 1]:
        pts = [
            (sign * 0.160, 0.080, 0.585),
            (sign * 0.170, 0.050, 0.540),
            (sign * 0.168, 0.028, 0.505)
        ]
        add_curved_clump(bm, pts, width_start=0.038, width_mid=0.036, width_end=0.012, 
                         thick_start=0.018, thick_mid=0.018, thick_end=0.006)
        
    # 4. Rounded lower rim curve around sides/back (gives the characteristic student bowl-cut rim)
    for sign in [-1, 1]:
        pts = [
            (sign * 0.165, 0.020, 0.540),
            (sign * 0.172, -0.060, 0.525),
            (sign * 0.140, -0.130, 0.505),
            (0.000, -0.165, 0.495)
        ]
        add_curved_clump(bm, pts, width_start=0.032, width_mid=0.036, width_end=0.020,
                         thick_start=0.016, thick_mid=0.020, thick_end=0.012)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_001", mesh)
    mat = create_stylized_hair_mat(f"M_Hair_{char_id}", color_hex)
    obj.data.materials.append(mat)
    
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    bpy.context.collection.objects.link(obj)
    bind_to_armature(obj, arm)
    return obj

def build_hair_002_sporty_short(arm, char_id, color_hex="#161b26"):
    """HAIR_002: Sporty Short — Dynamic upward/forward swept layered chunky spikes, athletic student look"""
    bm = bmesh.new()
    build_scalp_cap_bmesh(bm, rx=0.180, ry=0.170, rz=0.158, center_z=0.528, 
                          nape_drop=0.035, front_cutoff_z=0.595, layers=6, u_segs=16)
    
    # Dynamic spikes on crown & forehead
    spike_specs = [
        # Center crest spike (swept up and forward)
        ([(0.000, 0.090, 0.635), (0.000, 0.135, 0.675), (0.000, 0.160, 0.695)], 0.048, 0.052, 0.008),
        # Center-front brow lock (pointing forward-down)
        ([(0.000, 0.120, 0.625), (0.000, 0.155, 0.590), (0.000, 0.162, 0.555)], 0.040, 0.042, 0.008),
        # Left main spike (angled -25 deg)
        ([(-0.065, 0.080, 0.630), (-0.095, 0.120, 0.670), (-0.115, 0.140, 0.685)], 0.044, 0.046, 0.008),
        # Right main spike (angled +25 deg)
        ([( 0.065, 0.080, 0.630), ( 0.095, 0.120, 0.670), ( 0.115, 0.140, 0.685)], 0.044, 0.046, 0.008),
        # Left side tuft
        ([(-0.110, 0.050, 0.615), (-0.145, 0.080, 0.640), (-0.165, 0.095, 0.645)], 0.040, 0.042, 0.008),
        # Right side tuft
        ([( 0.110, 0.050, 0.615), ( 0.145, 0.080, 0.640), ( 0.165, 0.095, 0.645)], 0.040, 0.042, 0.008),
        # Crown back crest tuft
        ([(0.000, -0.050, 0.660), (0.000, -0.075, 0.700), (0.000, -0.095, 0.710)], 0.046, 0.048, 0.010),
        # Crown rear-left spike
        ([(-0.070, -0.060, 0.645), (-0.095, -0.090, 0.675), (-0.115, -0.110, 0.680)], 0.042, 0.044, 0.010),
        # Crown rear-right spike
        ([( 0.070, -0.060, 0.645), ( 0.095, -0.090, 0.675), ( 0.115, -0.110, 0.680)], 0.042, 0.044, 0.010),
    ]
    for pts, ws, wm, we in spike_specs:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we,
                         thick_start=0.022, thick_mid=0.024, thick_end=0.008)
        
    # Neat sporty sideburns
    for sign in [-1, 1]:
        pts = [
            (sign * 0.162, 0.065, 0.575),
            (sign * 0.170, 0.040, 0.540),
            (sign * 0.168, 0.025, 0.518)
        ]
        add_curved_clump(bm, pts, width_start=0.030, width_mid=0.030, width_end=0.010,
                         thick_start=0.015, thick_mid=0.015, thick_end=0.006)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_002", mesh)
    mat = create_stylized_hair_mat(f"M_Hair_{char_id}", color_hex)
    obj.data.materials.append(mat)
    
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    bpy.context.collection.objects.link(obj)
    bind_to_armature(obj, arm)
    return obj

def build_hair_003_rounded_bob(arm, char_id, color_hex="#221714"):
    """HAIR_003: Rounded Bob — Cute rounded bob curving inward hugging cheeks/jaw, center-parted curved bangs"""
    bm = bmesh.new()
    build_scalp_cap_bmesh(bm, rx=0.185, ry=0.176, rz=0.162, center_z=0.528, 
                          nape_drop=0.045, front_cutoff_z=0.588, layers=7, u_segs=18)
    
    # 1. Front bangs (soft curtain bangs curving slightly to sides)
    bangs = [
        ([(-0.040, 0.138, 0.625), (-0.045, 0.156, 0.585), (-0.035, 0.158, 0.548)], 0.042, 0.046, 0.016),
        ([( 0.040, 0.138, 0.625), ( 0.045, 0.156, 0.585), ( 0.035, 0.158, 0.548)], 0.042, 0.046, 0.016),
        ([(-0.095, 0.125, 0.615), (-0.110, 0.146, 0.575), (-0.105, 0.148, 0.535)], 0.042, 0.046, 0.016),
        ([( 0.095, 0.125, 0.615), ( 0.110, 0.146, 0.575), ( 0.105, 0.148, 0.535)], 0.042, 0.046, 0.016),
    ]
    for pts, ws, wm, we in bangs:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we,
                         thick_start=0.018, thick_mid=0.022, thick_end=0.008)
        
    # 2. Side bob locks: curving gently inward towards cheeks/jaw (Z ~ 0.465)
    for sign in [-1, 1]:
        # Outer main bob curve
        pts1 = [
            (sign * 0.168, 0.070, 0.600),
            (sign * 0.188, 0.030, 0.535),
            (sign * 0.175, 0.020, 0.485),
            (sign * 0.150, 0.035, 0.462)  # curves inward towards jaw
        ]
        add_curved_clump(bm, pts1, width_start=0.048, width_mid=0.056, width_end=0.022,
                         thick_start=0.022, thick_mid=0.026, thick_end=0.012)
        
        # Rear-side volume clump
        pts2 = [
            (sign * 0.172, -0.030, 0.585),
            (sign * 0.185, -0.060, 0.525),
            (sign * 0.165, -0.080, 0.475),
            (sign * 0.135, -0.070, 0.455)
        ]
        add_curved_clump(bm, pts2, width_start=0.048, width_mid=0.054, width_end=0.024,
                         thick_start=0.022, thick_mid=0.026, thick_end=0.014)

    # 3. Back curled bob rim (cradling nape)
    back_pts = [
        (-0.100, -0.140, 0.505),
        ( 0.000, -0.175, 0.480),
        ( 0.100, -0.140, 0.505)
    ]
    add_curved_clump(bm, back_pts, width_start=0.040, width_mid=0.052, width_end=0.040,
                     thick_start=0.020, thick_mid=0.024, thick_end=0.020)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_003", mesh)
    mat = create_stylized_hair_mat(f"M_Hair_{char_id}", color_hex)
    obj.data.materials.append(mat)
    
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    bpy.context.collection.objects.link(obj)
    bind_to_armature(obj, arm)
    return obj

def build_hair_004_side_parted_short(arm, char_id, color_hex="#1a1c22"):
    """HAIR_004: Side-Parted Short — Classic neat 7/3 student side part, monitor / model student look"""
    bm = bmesh.new()
    build_scalp_cap_bmesh(bm, rx=0.182, ry=0.172, rz=0.160, center_z=0.528, 
                          nape_drop=0.038, front_cutoff_z=0.592, layers=6, u_segs=16)
    
    # 7/3 Parting is on left side at X ~ -0.055
    # Major sweep (70%): swept from X=-0.055 towards the right temple X=+0.145
    major_sweep = [
        # Clump 1 (high crest swooping right)
        ([(-0.040, 0.125, 0.635), ( 0.030, 0.155, 0.630), ( 0.105, 0.145, 0.595), ( 0.138, 0.110, 0.560)], 0.046, 0.052, 0.016),
        # Clump 2 (middle forehead sweep, framing brow)
        ([(-0.035, 0.135, 0.615), ( 0.025, 0.160, 0.598), ( 0.085, 0.155, 0.575), ( 0.125, 0.125, 0.548)], 0.044, 0.048, 0.014),
        # Clump 3 (lower edge of fringe)
        ([(-0.020, 0.140, 0.590), ( 0.035, 0.162, 0.575), ( 0.080, 0.158, 0.555)], 0.036, 0.040, 0.012),
    ]
    for pts, ws, wm, we in major_sweep:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we,
                         thick_start=0.020, thick_mid=0.024, thick_end=0.008)
        
    # Minor side (30%): swept neatly to the left temple
    minor_sweep = [
        ([(-0.065, 0.120, 0.630), (-0.110, 0.135, 0.605), (-0.140, 0.110, 0.565)], 0.042, 0.045, 0.014),
        ([(-0.075, 0.105, 0.605), (-0.120, 0.115, 0.575), (-0.148, 0.085, 0.545)], 0.038, 0.040, 0.012),
    ]
    for pts, ws, wm, we in minor_sweep:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we,
                         thick_start=0.018, thick_mid=0.022, thick_end=0.008)
        
    # Clean neat sideburns and tapered nape
    for sign, z_off in [(-1, 0.0), (1, -0.005)]:
        pts = [
            (sign * 0.164, 0.060, 0.570),
            (sign * 0.170, 0.035, 0.535 + z_off),
            (sign * 0.166, 0.020, 0.510 + z_off)
        ]
        add_curved_clump(bm, pts, width_start=0.032, width_mid=0.032, width_end=0.010,
                         thick_start=0.016, thick_mid=0.016, thick_end=0.006)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_004", mesh)
    mat = create_stylized_hair_mat(f"M_Hair_{char_id}", color_hex)
    obj.data.materials.append(mat)
    
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    bpy.context.collection.objects.link(obj)
    bind_to_armature(obj, arm)
    return obj

def build_hair_005_medium_straight(arm, char_id, color_hex="#1e1816"):
    """HAIR_005: Medium Straight — Sweet flowing straight hair cascading to upper shoulders with soft fringe"""
    bm = bmesh.new()
    build_scalp_cap_bmesh(bm, rx=0.185, ry=0.176, rz=0.162, center_z=0.528, 
                          nape_drop=0.050, front_cutoff_z=0.588, layers=7, u_segs=18)
    
    # 1. Soft front fringe (see-through / straight fringe)
    bangs = [
        ([(-0.090, 0.130, 0.615), (-0.095, 0.150, 0.578), (-0.088, 0.152, 0.548)], 0.038, 0.042, 0.015),
        ([(-0.035, 0.138, 0.625), (-0.038, 0.158, 0.582), (-0.032, 0.160, 0.546)], 0.042, 0.046, 0.016),
        ([( 0.035, 0.138, 0.625), ( 0.038, 0.158, 0.582), ( 0.032, 0.160, 0.546)], 0.042, 0.046, 0.016),
        ([( 0.090, 0.130, 0.615), ( 0.095, 0.150, 0.578), ( 0.088, 0.152, 0.548)], 0.038, 0.042, 0.015),
    ]
    for pts, ws, wm, we in bangs:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we,
                         thick_start=0.018, thick_mid=0.020, thick_end=0.008)
        
    # 2. Long front/side locks cascading down in front of shoulders to Z ~ 0.360
    for sign in [-1, 1]:
        # Front side lock
        pts_front = [
            (sign * 0.155, 0.090, 0.590),
            (sign * 0.175, 0.065, 0.520),
            (sign * 0.165, 0.050, 0.440),
            (sign * 0.145, 0.045, 0.370)  # rests gently near collarbone
        ]
        add_curved_clump(bm, pts_front, width_start=0.042, width_mid=0.048, width_end=0.018,
                         thick_start=0.020, thick_mid=0.022, thick_end=0.010)
        
        # Mid side curtain
        pts_mid = [
            (sign * 0.175, 0.010, 0.585),
            (sign * 0.188, -0.010, 0.510),
            (sign * 0.180, -0.025, 0.430),
            (sign * 0.160, -0.030, 0.355)
        ]
        add_curved_clump(bm, pts_mid, width_start=0.045, width_mid=0.050, width_end=0.020,
                         thick_start=0.020, thick_mid=0.024, thick_end=0.010)

    # 3. Flowing back sheet / locks falling down the back to Z ~ 0.345
    back_curtains = [
        ([(-0.090, -0.150, 0.550), (-0.110, -0.165, 0.470), (-0.095, -0.155, 0.390), (-0.080, -0.140, 0.345)], 0.050, 0.055, 0.022),
        ([( 0.000, -0.165, 0.555), ( 0.000, -0.180, 0.475), ( 0.000, -0.170, 0.395), ( 0.000, -0.150, 0.340)], 0.055, 0.060, 0.025),
        ([( 0.090, -0.150, 0.550), ( 0.110, -0.165, 0.470), ( 0.095, -0.155, 0.390), ( 0.080, -0.140, 0.345)], 0.050, 0.055, 0.022),
    ]
    for pts, ws, wm, we in back_curtains:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we,
                         thick_start=0.022, thick_mid=0.025, thick_end=0.012)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_005", mesh)
    mat = create_stylized_hair_mat(f"M_Hair_{char_id}", color_hex)
    obj.data.materials.append(mat)
    
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    bpy.context.collection.objects.link(obj)
    bind_to_armature(obj, arm)
    return obj

def build_hair_006_low_ponytail(arm, char_id, color_hex="#1b1717", tie_hex="#e0564c"):
    """HAIR_006: Low Ponytail — Hair swept back cleanly to a low nape ponytail, secured with a cute hair tie"""
    bm = bmesh.new()
    build_scalp_cap_bmesh(bm, rx=0.184, ry=0.174, rz=0.162, center_z=0.528, 
                          nape_drop=0.042, front_cutoff_z=0.590, layers=7, u_segs=18)
    
    # 1. Front soft fringe & face-framing wisps
    bangs = [
        ([(-0.060, 0.135, 0.620), (-0.065, 0.155, 0.582), (-0.055, 0.158, 0.548)], 0.042, 0.046, 0.016),
        ([( 0.060, 0.135, 0.620), ( 0.065, 0.155, 0.582), ( 0.055, 0.158, 0.548)], 0.042, 0.046, 0.016),
        ([( 0.000, 0.140, 0.625), ( 0.000, 0.158, 0.585), ( 0.000, 0.160, 0.552)], 0.040, 0.044, 0.014),
    ]
    for pts, ws, wm, we in bangs:
        add_curved_clump(bm, pts, width_start=ws, width_mid=wm, width_end=we,
                         thick_start=0.018, thick_mid=0.020, thick_end=0.008)
        
    # Delicate side wisps curving in front of ears
    for sign in [-1, 1]:
        pts = [
            (sign * 0.158, 0.075, 0.585),
            (sign * 0.172, 0.045, 0.535),
            (sign * 0.165, 0.030, 0.495)
        ]
        add_curved_clump(bm, pts, width_start=0.030, width_mid=0.032, width_end=0.010,
                         thick_start=0.014, thick_mid=0.016, thick_end=0.006)

    # 2. Hair gathering folds swept towards nape knot (0.0, -0.168, 0.478)
    for sign in [-1, 1]:
        gather_pts = [
            (sign * 0.140, -0.060, 0.550),
            (sign * 0.100, -0.125, 0.510),
            (sign * 0.040, -0.160, 0.485),
            (0.000, -0.170, 0.478)
        ]
        add_curved_clump(bm, gather_pts, width_start=0.042, width_mid=0.048, width_end=0.025,
                         thick_start=0.020, thick_mid=0.024, thick_end=0.018)

    # 3. Hair tie scrunchie ring at nape
    tie_center = Vector((0.0, -0.172, 0.475))
    # Add hair tie torus
    add_hair_tie_torus(bm, tie_center, axis=(0, 0.35, 1.0), major_r=0.025, minor_r=0.008)

    # 4. Low ponytail cascading down from tie
    # Central tail clump
    tail_pts_center = [
        ( 0.000, -0.178, 0.472),
        ( 0.000, -0.198, 0.435),
        ( 0.000, -0.185, 0.380),
        ( 0.000, -0.160, 0.340)  # gentle curve following upper back
    ]
    add_curved_clump(bm, tail_pts_center, width_start=0.044, width_mid=0.052, width_end=0.014,
                     thick_start=0.025, thick_mid=0.028, thick_end=0.010)
    
    # Left & right layered sub-locks on ponytail
    for sign in [-1, 1]:
        tail_sub = [
            (sign * 0.015, -0.180, 0.468),
            (sign * 0.032, -0.195, 0.425),
            (sign * 0.025, -0.178, 0.370),
            (sign * 0.010, -0.155, 0.335)
        ]
        add_curved_clump(bm, tail_sub, width_start=0.034, width_mid=0.040, width_end=0.010,
                         thick_start=0.020, thick_mid=0.022, thick_end=0.008)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_006", mesh)
    mat_hair = create_stylized_hair_mat(f"M_Hair_{char_id}", color_hex)
    mat_tie = create_hair_tie_mat(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    bpy.context.collection.objects.link(obj)
    bind_to_armature(obj, arm)
    return obj

print("Hair builders defined successfully.")


# =============================================================================
# TEST HARNESS & PREVIEW RENDERING
# =============================================================================

def setup_portrait_studio(scene, res=(640, 720)):
    # Clean old camera & lights
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)
            
    cam_data = bpy.data.cameras.new("Portrait_Cam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("Portrait_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    scene.world = bpy.data.worlds.new("Hair_World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.09, 0.10, 0.13, 1.0)
        bg.inputs["Strength"].default_value = 0.95
        
    def add_light(name, light_type, energy, loc, rot_deg):
        l = bpy.data.lights.new(name, light_type)
        l.energy = energy
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.location = loc
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj
        
    # Key light (warm, soft)
    add_light("Key", "SUN", 4.2, (1.2, 1.5, 1.2), (48, 18, -35))
    # Fill light (cool, diffuse)
    add_light("Fill", "SUN", 2.2, (-1.5, 1.2, 0.8), (35, -20, 140))
    # Rim light (sharp back edge highlight)
    add_light("Rim", "SUN", 3.8, (0.0, -1.8, 1.0), (30, 8, 25))
    # Subtle bounce
    add_light("Bounce", "SUN", 1.4, (0.0, 1.0, -0.5), (-45, 10, 0))
    
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def run_pilot_test():
    import character_factory
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    
    builders = [
        ("HAIR_001", "Classic Bowl Cut", build_hair_001_classic_bowl, "#1c1615"),
        ("HAIR_002", "Sporty Short", build_hair_002_sporty_short, "#161b26"),
        ("HAIR_003", "Rounded Bob", build_hair_003_rounded_bob, "#221714"),
        ("HAIR_004", "Side-Parted Short", build_hair_004_side_parted_short, "#1a1c22"),
        ("HAIR_005", "Medium Straight", build_hair_005_medium_straight, "#1e1816"),
        ("HAIR_006", "Low Ponytail", build_hair_006_low_ponytail, "#1b1717"),
    ]
    
    pilot_report = {}
    
    for hair_id, hair_name, builder_fn, default_color in builders:
        print(f"\n==========================================")
        print(f"Testing & Rendering: {hair_id} — {hair_name}")
        print(f"==========================================")
        
        factory.load_base()
        factory.isolate_materials(f"pilot_{hair_id.lower()}")
        factory.apply_skin_tone("SKIN_02", f"pilot_{hair_id.lower()}")
        
        # Remove any default hair meshes
        old_hair = [o for o in bpy.data.objects if o.name.startswith("Hair_")]
        for o in old_hair:
            bpy.data.objects.remove(o, do_unlink=True)
            
        # Build new hair
        hair_obj = builder_fn(factory.arm, f"pilot_{hair_id.lower()}", default_color)
        
        # Collect geometry stats
        raw_v = len(hair_obj.data.vertices)
        raw_f = len(hair_obj.data.polygons)
        
        # Check world bounds
        bbox = [hair_obj.matrix_world @ Vector(b) for b in hair_obj.bound_box]
        min_x = min(p.x for p in bbox)
        max_x = max(p.x for p in bbox)
        min_y = min(p.y for p in bbox)
        max_y = max(p.y for p in bbox)
        min_z = min(p.z for p in bbox)
        max_z = max(p.z for p in bbox)
        
        # Equip shirt collar so neck transitions are visible
        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", f"pilot_{hair_id.lower()}")
        
        # Test accessories compatibility: Round glasses and hair clip
        accs = ["ACC_002", "ACC_003"]
        factory.equip_accessories(accs, f"pilot_{hair_id.lower()}")
        factory.setup_facial_system("Happy", f"pilot_{hair_id.lower()}")
        
        scene = bpy.context.scene
        cam_obj = setup_portrait_studio(scene, res=(600, 720))
        
        # 4 Portrait Views
        views = [
            ("front", (0.0, 0.92, 0.535), (math.radians(90), 0, math.radians(180))),
            ("three_quarter", (0.65, 0.65, 0.555), (math.radians(82), 0, math.radians(135))),
            ("side", (0.92, 0.0, 0.535), (math.radians(90), 0, math.radians(90))),
            ("back", (0.0, -0.92, 0.535), (math.radians(90), 0, 0))
        ]
        
        rendered_images = {}
        for vname, loc, rot in views:
            cam_obj.location = loc
            cam_obj.rotation_euler = rot
            out_file = os.path.join(PREVIEWS_DIR, f"{hair_id.lower()}_{vname}.png")
            scene.render.filepath = out_file
            bpy.ops.render.render(write_still=True)
            rendered_images[vname] = out_file
            print(f"  Saved view: {vname} -> {out_file}")
            
        pilot_report[hair_id] = {
            "id": hair_id,
            "name": hair_name,
            "raw_verts": raw_v,
            "raw_faces": raw_f,
            "bounds": {
                "x": [round(min_x, 4), round(max_x, 4)],
                "y": [round(min_y, 4), round(max_y, 4)],
                "z": [round(min_z, 4), round(max_z, 4)],
            },
            "rendered_images": rendered_images,
            "status": "PASS"
        }
        
    report_path = os.path.join(PREVIEWS_DIR, "pilot_validation_report.json")
    import json
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(pilot_report, f, indent=2)
    print(f"\nPilot test completed! Report saved to {report_path}")

if __name__ == "__main__":
    run_pilot_test()
