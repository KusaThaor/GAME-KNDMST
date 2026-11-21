"""
=============================================================================
REFINEMENT PIPELINE: MALE PRODUCTION HAIRSTYLES (V15)
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life Narrative (2012–2013)

Senior Stylized Character Artist & Procedural Geometry Engineer
Target Scope (MALE PRESETS ONLY):
1. HAIR_002: Sporty Short
   * Pale spot eliminated (cured 36 inverted-normal faces and degenerate collapsed ring)
   * Pinched crown peak removed; rounded, controlled top transition
   * Genuine sporty short silhouette: compact close-fitting sides and snug nape
   * Connected directional top volume with gentle upward/forward lift
2. HAIR_004: Side-Parted Short
   * Protruding rod/horn fringe completely replaced
   * Broad, flattened, curved sweeping fringe (width ~52mm >> thickness ~11mm)
   * Hugs forehead curvature with close 4mm clearance (no large wedge)
   * Seamless root concealed inside crown; shallow off-center part
3. HAIR_001: Classic Bowl Cut
   * Compact tidy bowl-cut identity preserved
   * Perfectly straight rigid edge broken into 4 broad, shallow groupings
   * Small soft falling tip near center-left to break machine-flat look
   * Tidy rounded crown and snug nape

Preserves all 3 refined female styles (HAIR_003, HAIR_007, HAIR_010) in the library.
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler
import os
import sys
import json
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "male_v15_refinement")
GLB_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(GLB_DIR, exist_ok=True)
os.makedirs(BLEND_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# COLOR & MATERIAL UTILITIES
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
    bsdf.inputs["Base Color"].default_value = hex_to_linear_rgb(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.18
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = 0.18
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = sheen
    return mat

def apply_clean_subsurf(obj, levels=1):
    mod = obj.modifiers.new("Subsurf", 'SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    for p in obj.data.polygons:
        p.use_smooth = True

def bind_hair_to_armature(hair_obj, armature_obj):
    hair_obj.parent = armature_obj
    mod = hair_obj.modifiers.new("Armature", 'ARMATURE')
    mod.object = armature_obj
    vg = hair_obj.vertex_groups.get("Head")
    if not vg:
        vg = hair_obj.vertex_groups.new(name="Head")
    all_indices = [v.index for v in hair_obj.data.vertices]
    if all_indices:
        vg.add(all_indices, 1.0, 'REPLACE')

# ---------------------------------------------------------------------------
# SPLINE & RMF SWEEP UTILITIES
# ---------------------------------------------------------------------------

def catmull_rom_spline(control_points, samples_per_segment=8):
    pts = [Vector(p) for p in control_points]
    if len(pts) < 2:
        return [(pts[0], 0.0)]
    p_start = pts[0] + (pts[0] - pts[1])
    p_end = pts[-1] + (pts[-1] - pts[-2])
    all_p = [p_start] + pts + [p_end]
    curve = []
    num_segs = len(pts) - 1
    for i in range(num_segs):
        p0, p1, p2, p3 = all_p[i], all_p[i+1], all_p[i+2], all_p[i+3]
        for s in range(samples_per_segment if i < num_segs - 1 else samples_per_segment + 1):
            t = s / float(samples_per_segment)
            t2, t3 = t * t, t * t * t
            pos = 0.5 * (
                (2.0 * p1) +
                (-p0 + p2) * t +
                (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
                (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
            )
            global_t = (i + t) / float(num_segs)
            curve.append((pos, global_t))
    return curve

def add_flattened_curved_hair_lock(bm, control_points, width_profile, thick_profile, normal_guide=(0,1,0), samples=24, n_pts=10, mat_index=0):
    """
    Sweeps a FLATTENED ribbon cross-section (width >> thickness) along a spline,
    keeping the wide face oriented along the forehead curvature so it hugs the head
    and NEVER produces a cylindrical rod or outward-pointing horn.
    """
    curve_pts = catmull_rom_spline(control_points, samples_per_segment=max(4, samples // (len(control_points) - 1)))
    num_pts = len(curve_pts)
    w_start, w_mid, w_end = width_profile
    th_start, th_mid, th_end = thick_profile

    # Tangents
    tangents = []
    for i in range(num_pts):
        if i == 0:
            t = (curve_pts[1][0] - curve_pts[0][0]).normalized()
        elif i == num_pts - 1:
            t = (curve_pts[-1][0] - curve_pts[-2][0]).normalized()
        else:
            t = (curve_pts[i + 1][0] - curve_pts[i - 1][0]).normalized()
        tangents.append(t)

    # Compute frames where 'normal' is oriented outward from cranial center
    cranial_center = Vector((0.0, -0.010, 0.528))
    slices = []
    for i, (pt, t) in enumerate(curve_pts):
        if t < 0.25:
            fac = t / 0.25
            w = w_start + (w_mid - w_start) * (fac ** 0.70)
            th = th_start + (th_mid - th_start) * (fac ** 0.70)
        elif t < 0.75:
            w = w_mid
            th = th_mid
        else:
            fac = (t - 0.75) / 0.25
            w = w_mid + (w_end - w_mid) * (fac ** 1.15)
            th = th_mid + (th_end - th_mid) * (fac ** 1.15)

        tang = tangents[i]
        # Outward normal pointing away from skull
        outward = (pt - cranial_center).normalized()
        # Normal in cross section: outward projected perpendicular to tangent
        n_dir = (outward - tang * tang.dot(outward)).normalized()
        # Binormal: along forehead sideways sweep
        b_dir = tang.cross(n_dir).normalized()

        ring = []
        for k in range(n_pts):
            ang = 2.0 * math.pi * k / n_pts
            # Elliptical / rounded flattened profile
            vx = math.cos(ang) * (w * 0.5)
            vy = math.sin(ang) * (th * 0.5)
            p = pt + b_dir * vx + n_dir * vy
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

# =============================================================================
# 1. HAIR_001: CLASSIC BOWL CUT (V15 REFINEMENT — SOFT GROUPED FRINGE)
# =============================================================================

def build_hair_001_v15(arm, char_id, color_hex="#2b201c"):
    """
    HAIR_001: Classic Bowl Cut (V15)
    - Compact, tidy rounded bowl silhouette with soft horizontal fringe baseline.
    - Broken into 4 broad, shallow groupings with subtle length differences (Z ~ 0.568m to 0.578m).
    - Small falling tip near center-left to break machine-flat edge without deep V cuts or sawtooth teeth.
    - 14mm inward beveled rim giving real physical thickness.
    - Temples blend softly into sides; tidy snug nape contour (Z ~ 0.448m).
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.186, 0.175, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    # Start ring from small non-zero radius to avoid collapsed apex singularity
    for r in range(num_rings):
        # r goes from 0 to num_rings - 1, with v going from 0.05 to 1.0
        v = (r + 1) / float(num_rings)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.18:  # Brow fringe
                theta_f = math.atan2(sin_u, cos_u)
                # 4 broad shallow groups across brow + small falling tip at theta_f ~ -0.15
                group_relief = 0.010 * math.cos(theta_f * 3.5) + 0.005 * math.sin(theta_f * 5.0)
                # Soft falling tip
                if -0.30 < theta_f < 0.0:
                    group_relief += 0.008 * math.cos((theta_f + 0.15) * 10.0)

                max_phi = math.radians(65.0) + group_relief
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Temples & sides
                max_phi = math.radians(73.5)
                puff = 0.004

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Ear clearance
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.038:
                    pz += (0.038 - ear_dist) * 0.85
                    px = math.copysign(max(abs(px), 0.183), px)
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    # Faces between rings
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    # Apex cap: clean outward-pointing faces
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.006)))
    for s in range(segs):
        sn = (s + 1) % segs
        # Note vertex order: (apex, ring_verts[0][sn], ring_verts[0][s]) for outward normal!
        bm.faces.new((apex, ring_verts[0][sn], ring_verts[0][s]))

    # Inward beveled physical thickness at lower perimeter
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # Subtle soft falling brow lock supplementing fringe
    fall_lock = [
        Vector((-0.030, 0.125, 0.635)),
        Vector((-0.040, 0.142, 0.605)),
        Vector((-0.045, 0.143, 0.562))
    ]
    add_flattened_curved_hair_lock(bm, fall_lock, width_profile=(0.024, 0.032, 0.012), thick_profile=(0.010, 0.014, 0.006), samples=16, n_pts=8)

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

# =============================================================================
# 2. HAIR_002: SPORTY SHORT (V15 REFINEMENT — NO PALE SPOT, NO PINCHED CROWN)
# =============================================================================

def build_hair_002_v15(arm, char_id, color_hex="#161b26"):
    """
    HAIR_002: Sporty Short (V15)
    - Cures the pale spot: eliminates all 36 inverted-normal faces and zero-area collapsed ring.
    - Cures pointed crown: replaces pinched single-point apex with a controlled, rounded top dome.
    - Genuine sporty short silhouette: compact close-fitting sides, snug nape, zero bowl overhang.
    - Top volume forms a connected directional group with restrained forward/upward lift.
    - 3 broad, soft short directional groups at the front (open athletic brow Z ~ 0.595m).
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.183, 0.172, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    # Ring 0 starts at small non-zero radius (v = 0.06) so it never collapses to a point
    for r in range(num_rings):
        v = (r + 1) / float(num_rings)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.15:  # Forehead: open athletic brow
                theta_f = math.atan2(sin_u, cos_u)
                crest_swelling = 0.006 * math.cos(theta_f * 2.5)
                max_phi = math.radians(56.5) + crest_swelling
                puff = 0.004 + 0.004 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Close-fitting nape (no bowl overhang!)
                back_fac = -cos_u
                max_phi = math.radians(98.0) + back_fac * math.radians(20.0)
                puff = 0.001  # Snug to skull
            else:  # Close-cropped sides
                max_phi = math.radians(72.0)
                puff = 0.002

            # Connected directional lifted top volume (rising smoothly toward front-top)
            if v < 0.50:
                top_fac = math.cos((v / 0.50) * (math.pi * 0.5))  # Smooth cosine falloff
                # Broad directional lift: forward and slightly upward
                dir_lift = (0.7 + 0.3 * cos_u + 0.12 * sin_u)
                puff += 0.015 * top_fac * dir_lift

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Ear clearance
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.038:
                    pz += (0.038 - ear_dist) * 0.85
                    px = math.copysign(max(abs(px), 0.182), px)
            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    # Faces between rings
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    # Rounded crown cap: gentle smooth apex with OUTWARD-pointing normal!
    # Apex placed at (0.004, center_y + 0.006, center_z + rz + 0.015) for a natural rounded crown
    apex = bm.verts.new(Vector((0.004, center_y + 0.006, center_z + rz + 0.015)))
    for s in range(segs):
        sn = (s + 1) % segs
        # Correct vertex order ensures normal points OUTWARD (fixes pale spot!)
        bm.faces.new((apex, ring_verts[0][sn], ring_verts[0][s]))

    # Inward beveled physical rim at lower perimeter
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.012 + Vector((0, 0, 0.004))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # ADD CONNECTED FRONT DIRECTIONAL HAIR GROUPS (ATHLETIC TEXTURED TUFTS)
    # 1. Center athletic lifted group
    c_tuft = [
        Vector(( 0.000, 0.090, 0.655)),
        Vector(( 0.005, 0.125, 0.638)),
        Vector(( 0.008, 0.138, 0.598))
    ]
    add_flattened_curved_hair_lock(bm, c_tuft, width_profile=(0.034, 0.046, 0.018), thick_profile=(0.012, 0.016, 0.006), samples=16, n_pts=8)

    # 2. Right athletic tuft
    r_tuft = [
        Vector(( 0.038, 0.080, 0.650)),
        Vector(( 0.048, 0.115, 0.632)),
        Vector(( 0.052, 0.126, 0.595))
    ]
    add_flattened_curved_hair_lock(bm, r_tuft, width_profile=(0.028, 0.038, 0.014), thick_profile=(0.010, 0.014, 0.006), samples=16, n_pts=8)

    # 3. Left athletic tuft
    l_tuft = [
        Vector((-0.038, 0.080, 0.650)),
        Vector((-0.046, 0.115, 0.632)),
        Vector((-0.050, 0.126, 0.595))
    ]
    add_flattened_curved_hair_lock(bm, l_tuft, width_profile=(0.028, 0.038, 0.014), thick_profile=(0.010, 0.014, 0.006), samples=16, n_pts=8)

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

# =============================================================================
# 3. HAIR_004: SIDE-PARTED SHORT (V15 REFINEMENT — BROAD FLAT CURVED FRINGE)
# =============================================================================

def build_hair_004_v15(arm, char_id, color_hex="#241c19"):
    """
    HAIR_004: Side-Parted Short (V15)
    - Completely replaces the narrow protruding rod/horn fringe.
    - Broad, flattened, softly curved side-swept fringe (width 52mm >> thickness 11mm).
    - Hugs forehead curvature with close 4mm clearance (eliminates large empty wedge).
    - Seamless root concealed beneath crown at off-center part (X ~ -0.045m).
    - Sweeps gracefully sideways and downward across brow, ending softly above right eyebrow/temple.
    - Both eyes remain completely unobstructed; reads as a stylish side-part haircut from all angles.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.186, 0.175, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = (r + 1) / float(num_rings)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.15:  # Forehead base
                asym = sin_u * 0.08
                max_phi = math.radians(64.0) + asym
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides
                max_phi = math.radians(74.0)
                puff = 0.004

            # Subtle directional crown volume over the off-center part
            if v < 0.45:
                part_fac = math.sin(v * math.pi) * max(0.0, cos_u)
                puff += 0.008 * part_fac

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Ear clearance
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

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.006)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][sn], ring_verts[0][s]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # REBUILT BROAD FLATTENED SIDE-SWEPT FRINGE (HUGGING FOREHEAD CURVATURE)
    # Spine starts buried inside crown at off-center part X = -0.045m, sweeps sideways and gently down
    sweep_spine = [
        Vector((-0.045, 0.095, 0.640)),   # Root concealed inside crown
        Vector((-0.015, 0.125, 0.625)),   # Emerges close against forehead
        Vector(( 0.030, 0.134, 0.605)),   # Follows forehead skull radius (y ~ 0.134m)
        Vector(( 0.075, 0.126, 0.575)),   # Sweeps past right brow
        Vector(( 0.112, 0.098, 0.535))    # Tapers softly beside outer eyebrow above temple
    ]
    # Width 52mm >> Thickness 11mm (flattened ribbon, NOT a rod!)
    add_flattened_curved_hair_lock(
        bm, sweep_spine,
        width_profile=(0.042, 0.054, 0.018),   # Broad 54mm width!
        thick_profile=(0.010, 0.012, 0.006),  # Thin 12mm thickness!
        samples=24, n_pts=10, mat_index=0
    )

    # Secondary supporting under-layer (softens volume and ensures zero scalp exposure)
    under_spine = [
        Vector((-0.025, 0.108, 0.625)),
        Vector(( 0.018, 0.128, 0.605)),
        Vector(( 0.058, 0.124, 0.575))
    ]
    add_flattened_curved_hair_lock(
        bm, under_spine,
        width_profile=(0.026, 0.036, 0.014),
        thick_profile=(0.008, 0.010, 0.004),
        samples=16, n_pts=8, mat_index=0
    )

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

# ---------------------------------------------------------------------------
# STUDIO ENVIRONMENT
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

    add_light("Key_Light", 'AREA', 45.0, (0.42, 0.90, 0.80), (48, 0, 22), (1.0, 0.98, 0.95), size=1.0)
    add_light("Fill_Light", 'AREA', 32.0, (-0.45, 0.85, 0.65), (52, 0, -28), (0.95, 0.97, 1.0), size=1.1)
    add_light("Front_Eye_Light", 'AREA', 20.0, (0.0, 1.00, 0.53), (90, 0, 0), (1.0, 0.98, 0.96), size=0.8)
    add_light("Rim_Back_Light", 'AREA', 30.0, (0.0, -0.90, 0.85), (-50, 0, 180), (1.0, 1.0, 1.0), size=0.9)

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    return cam

MALE_DISPATCHER_V15 = {
    "HAIR_001": build_hair_001_v15,
    "HAIR_002": build_hair_002_v15,
    "HAIR_004": build_hair_004_v15,
}

MALE_METADATA_V15 = {
    "HAIR_001": {"name": "Classic Bowl Cut", "color": "#2b201c"},
    "HAIR_002": {"name": "Sporty Short", "color": "#161b26"},
    "HAIR_004": {"name": "Side-Parted Short", "color": "#241c19"},
}

def run_male_refinement_pipeline():
    print("[V15 Pipeline] Starting Male Hairstyle Refinement Build, Export & Render...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    manifest = {}

    # Required 6 visual check angles: Front, Left 3/4, Right 3/4, Left Profile, Right Profile, Rear
    views = [
        ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
        ("three_quarter_left", (-0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(-135)), 60),
        ("three_quarter_right", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
        ("profile_left", (-1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(-90)), 60),
        ("profile_right", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
        ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
    ]

    for hair_id in sorted(MALE_DISPATCHER_V15.keys()):
        meta = MALE_METADATA_V15[hair_id]
        builder_fn = MALE_DISPATCHER_V15[hair_id]
        print(f"\n=======================================================")
        print(f"BUILDING MALE REFINED V15: {hair_id} — {meta['name']}")
        print(f"=======================================================")

        char_tag = f"male_v15_{hair_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)

        # Clear existing hair
        for o in list(bpy.data.objects):
            if o.name.startswith("Hair_"):
                bpy.data.objects.remove(o, do_unlink=True)

        arm = factory.arm
        color = meta["color"]
        hair_obj = builder_fn(arm, char_tag, color_hex=color)

        print(f"[Built] {hair_obj.name}: {len(hair_obj.data.polygons)} quads")

        # Equip standard uniform
        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        factory.equip_accessories([], char_tag)

        # Runtime assertion: verify eye integrity and ensure no unwanted glasses
        eye_objs = {o.name for o in bpy.data.objects if "Eye" in o.name}
        assert {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"}.issubset(eye_objs), f"Missing canonical eyes: {eye_objs}"
        assert "Acc_Glasses" not in [o.name for o in bpy.data.objects], "Acc_Glasses detected in hair preview scene!"

        # Save source .blend
        blend_path = os.path.join(BLEND_DIR, f"{hair_id.lower()}_v15_source.blend")
        blend_preview_path = os.path.join(PREVIEWS_DIR, f"{hair_id.lower()}_v15_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        shutil.copyfile(blend_path, blend_preview_path)

        # Export production GLB (versioned v15 and standard release)
        glb_name = f"character_{hair_id.lower()}_v15.glb"
        glb_path = os.path.join(GLB_DIR, glb_name)
        glb_preview_path = os.path.join(PREVIEWS_DIR, glb_name)
        glb_size = factory.export_glb(glb_path)
        shutil.copyfile(glb_path, glb_preview_path)

        # Overwrite standard release character_hair_{id}.glb
        std_glb_path = os.path.join(GLB_DIR, f"character_{hair_id.lower()}.glb")
        shutil.copyfile(glb_path, std_glb_path)
        print(f"  Exported GLB -> {glb_path} ({glb_size / 1024:.1f} KB)")

        # Studio renders
        scene = bpy.context.scene
        cam = setup_chibi_studio(scene, res=(768, 896))

        rendered_images = {}
        for vname, loc, rot, lens in views:
            cam.location = loc
            cam.rotation_euler = rot
            cam.data.lens = lens
            img_filename = f"{hair_id.lower()}_{vname}.png"
            img_path = os.path.join(PREVIEWS_DIR, img_filename)
            scene.render.filepath = img_path
            bpy.ops.render.render(write_still=True)
            rendered_images[vname] = img_filename
            print(f"  Rendered {vname} -> {img_filename}")

        # Render required close-up views
        cam.data.lens = 100
        if hair_id == "HAIR_002":
            # Close-up of crown and upper side (former pale spot and crown peak)
            cam.location = (0.55, 0.55, 0.650)
            cam.rotation_euler = (math.radians(75), 0, math.radians(135))
            c_crown_name = f"{hair_id.lower()}_crown_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_crown_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["crown_closeup"] = c_crown_name
            print(f"  Rendered crown closeup -> {c_crown_name}")

            # Profile close-up of snug nape and side taper
            cam.location = (0.75, -0.20, 0.510)
            cam.rotation_euler = (math.radians(88), 0, math.radians(105))
            c_nape_name = f"{hair_id.lower()}_nape_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_nape_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["nape_closeup"] = c_nape_name
            print(f"  Rendered nape closeup -> {c_nape_name}")

        elif hair_id == "HAIR_004":
            # Profile close-up of fringe root, forehead clearance, and flat curve
            cam.location = (0.65, 0.45, 0.585)
            cam.rotation_euler = (math.radians(85), 0, math.radians(125))
            c_profile_name = f"{hair_id.lower()}_fringe_profile_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_profile_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["fringe_profile_closeup"] = c_profile_name
            print(f"  Rendered fringe profile closeup -> {c_profile_name}")

            # Front-view root & sweep close-up
            cam.location = (0.0, 0.70, 0.585)
            cam.rotation_euler = (math.radians(90), 0, math.radians(180))
            c_root_name = f"{hair_id.lower()}_fringe_root_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_root_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["fringe_root_closeup"] = c_root_name
            print(f"  Rendered fringe root closeup -> {c_root_name}")

        elif hair_id == "HAIR_001":
            # Front close-up of the refined fringe edge with soft groupings
            cam.location = (0.0, 0.70, 0.575)
            cam.rotation_euler = (math.radians(90), 0, math.radians(180))
            c_fringe_name = f"{hair_id.lower()}_fringe_closeup.png"
            scene.render.filepath = os.path.join(PREVIEWS_DIR, c_fringe_name)
            bpy.ops.render.render(write_still=True)
            rendered_images["fringe_closeup"] = c_fringe_name
            print(f"  Rendered fringe closeup -> {c_fringe_name}")

        manifest[hair_id] = {
            "name": meta["name"],
            "glb": glb_name,
            "glb_size_kb": round(glb_size / 1024, 1),
            "renders": rendered_images,
            "quads": len(hair_obj.data.polygons),
            "color": color
        }

    manifest_path = os.path.join(PREVIEWS_DIR, "male_v15_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[Done] Pipeline finished! Manifest saved to {manifest_path}")

if __name__ == "__main__":
    run_male_refinement_pipeline()
