"""
=============================================================================
CHIBI MODULAR HAIRSTYLE GENERATOR V13 — FULL VOLUME & CONSTRUCTION REBUILD
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life Narrative (2012–2013)

Senior Stylized Character Artist & Procedural Geometry Engineer
Complete Geometric Rebuild for 8 Hairstyles:
1. Full Loose Hair Envelopes:
   - HAIR_003: Rounded Bob (Full jaw-length envelope, soft cheek fullness, no isolated dangling strips)
   - HAIR_005: Medium Straight (Complete straight mantle extending to lower neck/chest at back AND sides)
   - HAIR_010: Shoulder-Length (Full side & rear envelope to shoulder level with signature C-curl)
2. Substantially Fuller Tied Hair:
   - HAIR_006: Low Ponytail (Chubby, full teardrop ponytail bundle at nape, doubled body volume)
   - HAIR_007: High Ponytail (One cohesive, voluminous ponytail rising from gathered root to Z~0.735m crest)
   - HAIR_008: Twin Pigtails (Full, chubby pigtail bundles with wide upper/mid volumes, soft blunt tips)
3. Dense Interwoven Braids:
   - HAIR_009: Braided Hair (Dense interlocking plait lobes with deep overlap, zero air gaps, smooth part)
4. Broad Swept Fringe Mass:
   - HAIR_011: Side-Swept Bangs (Lush, wide 3D swept fringe mass with root lift; eyes 100% readable)

Strictly Preserved Styles:
- HAIR_001: Classic Bowl Cut
- HAIR_002: Sporty Short
- HAIR_004: Side-Parted Short
- HAIR_012: Messy Short Hair
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
from rebuild_v12_pilot_hairstyles import (
    catmull_rom_spline,
    add_smooth_hair_band,
    add_ribbon_bow,
    apply_clean_subsurf,
    bind_hair_to_armature,
    create_chibi_hair_material,
    create_accessory_material,
    setup_chibi_studio
)

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "all_12_v13")
GLB_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(GLB_DIR, exist_ok=True)
os.makedirs(BLEND_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# GEOMETRY ENGINE: VOLUMETRIC SPLINE LOCKS & DENSE INTERWOVEN BRAIDS
# ---------------------------------------------------------------------------

def add_volumetric_spline_lock(bm, control_points, width_profile, thick_profile, samples=24, n_pts=12, mat_index=0):
    """
    Extrudes a full, substantial hair bundle along a Catmull-Rom spline.
    Uses smooth cubic bell envelope with full width and depth.
    """
    curve_pts = catmull_rom_spline(control_points, samples_per_segment=max(4, samples // (len(control_points) - 1)))
    w_start, w_mid, w_end = width_profile
    th_start, th_mid, th_end = thick_profile

    slices = []
    for i, (pt, t) in enumerate(curve_pts):
        # Cubic envelope: expands quickly from root, holds fullness through 75%, tapers softly at end
        if t < 0.25:
            fac = t / 0.25
            w = w_start + (w_mid - w_start) * (fac ** 0.70)
            th = th_start + (th_mid - th_start) * (fac ** 0.70)
        elif t < 0.75:
            # Full body region
            w = w_mid
            th = th_mid
        else:
            fac = (t - 0.75) / 0.25
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

    # Soft rounded caps
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
# FULL LOOSE HAIR ENVELOPE BUILDER
# ---------------------------------------------------------------------------

def build_loose_hair_envelope(bm, center_y, center_z, rx, ry, rz,
                              fringe_phi_deg, side_phi_deg, rear_phi_deg,
                              fringe_harmonics, side_bulge=0.0,
                              inward_curl_z=None, inward_curl_fac=(0.0, 0.0),
                              num_rings=20, segs=40):
    """
    Constructs a complete, unbroken volumetric hair mantle comprising crown,
    left side, right side, and rear hair down to the specified haircut perimeter.
    Includes inward beveled physical thickness (15-18mm) along the entire perimeter.
    """
    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            # Determine angular zone: Forehead / Fringe vs Sides vs Rear
            if cos_u > 0.20:
                # Face opening / fringe
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = sum(amp * math.cos(theta_f * freq + phase) for amp, freq, phase in fringe_harmonics)
                max_phi = math.radians(fringe_phi_deg) + fringe_var
                puff = 0.006 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.12:
                # Rear mantle flowing down to haircut perimeter
                back_fac = -cos_u
                max_phi = math.radians(rear_phi_deg) + back_fac * math.radians(8.0)
                puff = 0.006 + 0.006 * math.sin(v * math.pi)
            else:
                # Lateral sides framing cheeks/jaw
                side_fac = abs(sin_u)
                max_phi = math.radians(side_phi_deg)
                puff = 0.006 + side_bulge * math.sin(v * math.pi)

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Inward C-curl tuck around cheeks/jaw/collar
            if inward_curl_z is not None and pz < inward_curl_z:
                tuck_norm = (inward_curl_z - pz) / 0.10
                tuck_norm = min(1.0, max(0.0, tuck_norm))
                # Tuck in X and forward in Y
                px -= math.copysign(inward_curl_fac[0] * tuck_norm, px)
                py += inward_curl_fac[1] * tuck_norm

            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    # Grid faces
    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    # Apex cap
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.006)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    # Inward beveled physical thickness around entire perimeter hem
    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.016 + Vector((0, 0, 0.006))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    return ring_verts

# =============================================================================
# 1. HAIR_003: ROUNDED BOB (V13 FULL VOLUME REBUILD)
# =============================================================================

def build_hair_003_v13(arm, char_id, color_hex="#221714"):
    """
    HAIR_003: Rounded Bob (V13 Rebuild)
    - Full, continuous rounded bob envelope ending around the jaw (Z ~ 0.435m).
    - Soft fullness beside cheeks (X ~ +-0.202m) AND across lower rear head.
    - Rear silhouette extends fully to the bob's intended lower perimeter.
    - Ends curve inward subtly ("C-curl").
    - Zero isolated dangling strips!
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.188, 0.177, 0.166

    fringe_harmonics = [
        (0.022, 3.2, 0.0),
        (0.008, 5.0, 0.5)
    ]
    # Build complete loose hair envelope
    build_loose_hair_envelope(
        bm, center_y, center_z, rx, ry, rz,
        fringe_phi_deg=65.0,      # Fringe above brow
        side_phi_deg=92.0,        # Sides down to jaw (Z ~ 0.430m)
        rear_phi_deg=95.0,        # Full rear envelope down to jaw level (Z ~ 0.435m)
        fringe_harmonics=fringe_harmonics,
        side_bulge=0.014,         # Soft cheek fullness
        inward_curl_z=0.480,      # Curl starts at cheek height
        inward_curl_fac=(0.016, 0.010),
        num_rings=20, segs=40
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_003", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 2. HAIR_005: MEDIUM STRAIGHT (V13 FULL VOLUME REBUILD)
# =============================================================================

def build_hair_005_v13(arm, char_id, color_hex="#1e1816"):
    """
    HAIR_005: Medium Straight (V13 Rebuild)
    - Complete straight hairstyle extending below jaw to lower neck/chest (Z ~ 0.345m).
    - Length carried through the REAR hair as well as front sides (full curtain mantle).
    - Broad side masses with real depth, gently curved rear mass with soft stepped ends.
    - Visibly longer and straighter than the rounded bob.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.189, 0.178, 0.166

    fringe_harmonics = [
        (0.020, 3.0, 0.0),
        (0.007, 4.5, 0.3)
    ]
    build_loose_hair_envelope(
        bm, center_y, center_z, rx, ry, rz,
        fringe_phi_deg=65.0,      # Fringe above brow
        side_phi_deg=114.0,       # Sides flowing past collar to chest (Z ~ 0.355m)
        rear_phi_deg=118.0,       # Full rear mantle to upper back (Z ~ 0.345m)
        fringe_harmonics=fringe_harmonics,
        side_bulge=0.006,         # Sleek straight profile
        inward_curl_z=0.380,      # Subtle drape toward chest
        inward_curl_fac=(0.008, 0.006),
        num_rings=24, segs=40
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_005", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 3. HAIR_006: LOW PONYTAIL (V13 SUBSTANTIALLY FULLER REBUILD)
# =============================================================================

def build_hair_006_v13(arm, char_id, color_hex="#1b1717", tie_hex="#e0564c"):
    """
    HAIR_006: Low Ponytail (V13 Rebuild)
    - Full, soft low ponytail replacing the thin pointed tail.
    - Gathered naturally at lower rear head into a sturdy root bundle.
    - Ponytail bundle thickness doubled (width 68mm, depth 52mm) with soft rounded tip.
    - Readable width and depth in rear and profile views.
    - Tie small but visible (#e0564c).
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.18:  # Bangs
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.022 * math.cos(theta_f * 3.0)
                max_phi = math.radians(65.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape gathering zone
                back_fac = -cos_u
                max_phi = math.radians(98.0) + back_fac * math.radians(22.0)
                # Broad gathering cone
                gather_pull = 0.014 * (v ** 1.3)
                puff = 0.004 + gather_pull
            else:  # Sides
                max_phi = math.radians(74.0)
                puff = 0.004

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            # Broad convergence toward sturdy low root (0, -0.165, 0.465)
            if cos_u < -0.30 and v > 0.45:
                conv_fac = (v - 0.45) / 0.55 * (-cos_u - 0.30) / 0.70
                px *= (1.0 - 0.28 * conv_fac)
                py -= 0.014 * conv_fac

            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.005)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.013 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # Hair tie band around gathered root
    tie_center = Vector((0.0, -0.165, 0.465))
    tie_axis = Vector((0.0, -0.707, -0.707))
    add_smooth_hair_band(bm, tie_center, axis=tie_axis, major_r=0.024, minor_r=0.007, segs_u=16, segs_v=8, mat_index=1)

    # SUBSTANTIALLY FULLER LOW PONYTAIL BUNDLE (Doubled cross-section)
    tail_spine = [
        Vector((0.0, -0.150, 0.470)),
        Vector((0.0, -0.195, 0.450)),
        Vector((0.0, -0.222, 0.395)),
        Vector((0.0, -0.208, 0.340))
    ]
    add_volumetric_spline_lock(
        bm, tail_spine,
        width_profile=(0.042, 0.068, 0.022),   # Full 68mm width!
        thick_profile=(0.032, 0.052, 0.016),  # Full 52mm depth!
        samples=24, n_pts=12, mat_index=0
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_006", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex, roughness=0.45)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 4. HAIR_007: HIGH PONYTAIL (V13 SUBSTANTIALLY FULLER REBUILD)
# =============================================================================

def build_hair_007_v13(arm, char_id, color_hex="#1a1818", tie_hex="#4a8ec2"):
    """
    HAIR_007: High Ponytail (V13 Rebuild)
    - One cohesive, substantial full ponytail rising from gathered high root.
    - Removed separated thin arches and dangling wire-like pieces.
    - Lifts briefly near tie to dynamic crest (Z ~ 0.735m, visible from front view),
      curves downward naturally with solid, readable silhouette from side and back.
    - Doubled bundle volume (width 82mm, depth 62mm).
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.185, 0.174, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.18:  # Bangs
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.022 * math.cos(theta_f * 3.0)
                max_phi = math.radians(65.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides
                max_phi = math.radians(74.0)
                puff = 0.004

            # Upward sweep toward high crown gather point (0, -0.115, 0.675)
            if cos_u < 0.10 and v < 0.50:
                gather_fac = (1.0 - v / 0.50) * max(0.0, -cos_u)
                puff += 0.018 * gather_fac

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.008)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.013 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # Sturdy high hair tie band & ribbon bow
    tie_center = Vector((0.0, -0.115, 0.675))
    tie_axis = Vector((0.0, -0.500, 0.866))
    add_smooth_hair_band(bm, tie_center, axis=tie_axis, major_r=0.025, minor_r=0.0075, segs_u=16, segs_v=8, mat_index=1)
    add_ribbon_bow(bm, tie_center + Vector((0.0, -0.012, 0.012)), facing=(0.0, -1.0, 0.2), width=0.044, height=0.022, mat_index=1)

    # ONE COHESIVE, SUBSTANTIALLY FULLER HIGH PONYTAIL BUNDLE
    full_high_spine = [
        Vector((0.0, -0.095, 0.675)),
        Vector((0.0, -0.125, 0.735)),  # Prominent crest visible from front!
        Vector((0.0, -0.200, 0.685)),
        Vector((0.0, -0.245, 0.585)),
        Vector((0.0, -0.235, 0.485))
    ]
    add_volumetric_spline_lock(
        bm, full_high_spine,
        width_profile=(0.045, 0.082, 0.025),   # Substantial 82mm width!
        thick_profile=(0.036, 0.062, 0.018),  # Substantial 62mm depth!
        samples=28, n_pts=12, mat_index=0
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_007", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex, roughness=0.45)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 5. HAIR_008: TWIN PIGTAILS (V13 SUBSTANTIALLY FULLER REBUILD)
# =============================================================================

def build_hair_008_v13(arm, char_id, color_hex="#2b201c", tie_hex="#f5b82e"):
    """
    HAIR_008: Twin Pigtails (V13 Rebuild)
    - Reopened and rebuilt with substantially fuller pigtail bundles.
    - Preserves continuous rear cranium coverage down to natural nape (Z = 0.448m).
    - Doubled bundle volume (width 74mm, depth 54mm) with chubby buoyant teardrops.
    - Roots gathered inside readable ties with cute ribbon bows.
    - Tapers gradually near soft rounded ends; zero horn/banana shapes.
    - Safe clearance from cheeks, ears, and shoulders.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.187, 0.176, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.15:  # Forehead fringe
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.024 * math.cos(theta_f * 3.0)
                max_phi = math.radians(65.0) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Rear nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.004
            else:  # Lateral lobes
                max_phi = math.radians(74.0)
                puff = 0.004

            # Conical gather pull toward twin pigtail roots (X=+-0.145, Y=-0.065, Z=0.550)
            if abs(sin_u) > 0.45 and cos_u < 0.20 and v > 0.30:
                gather_fac = (v - 0.30) / 0.70 * (abs(sin_u) - 0.45) / 0.55
                puff += 0.018 * gather_fac

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.005)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # TWIN VOLUMINOUS PIGTAIL BUNDLES
    for sign in [-1, 1]:
        root_pt = Vector((sign * 0.145, -0.065, 0.550))
        tie_axis = Vector((sign * 0.707, -0.400, 0.580)).normalized()

        # Readable hair tie band with ribbon bow
        add_smooth_hair_band(bm, root_pt, axis=tie_axis, major_r=0.024, minor_r=0.007, segs_u=16, segs_v=8, mat_index=1)
        add_ribbon_bow(bm, root_pt + Vector((sign * 0.010, -0.015, 0.010)),
                       facing=(sign * 0.5, -0.866, 0.2), width=0.040, height=0.020, mat_index=1)

        # Full, chubby pigtail bundle
        pigtail_spine = [
            root_pt + tie_axis * 0.010,
            Vector((sign * 0.190, -0.080, 0.520)),
            Vector((sign * 0.205, -0.075, 0.465)),
            Vector((sign * 0.185, -0.055, 0.415))
        ]
        add_volumetric_spline_lock(
            bm, pigtail_spine,
            width_profile=(0.042, 0.074, 0.022),   # Full 74mm chubby teardrop width!
            thick_profile=(0.034, 0.054, 0.016),  # Full 54mm depth!
            samples=24, n_pts=12, mat_index=0
        )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_008", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex, roughness=0.45)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 6. HAIR_009: BRAIDED HAIR (V13 DENSE INTERWOVEN REBUILD)
# =============================================================================

def build_hair_009_v13(arm, char_id, color_hex="#1c1615", tie_hex="#e0564c"):
    """
    HAIR_009: Braided Hair (V13 Rebuild)
    - Full cranium coverage with smooth center parting (zero vertex pinches or pale shading marks).
    - Dense, continuous interwoven twin braids with deeply overlapping chevron plait lobes (zero air gaps).
    - Broad gathered roots at nape (X = +-0.085m, Y = -0.125m, Z = 0.460m).
    - Tapers gradually from 46mm at root to 24mm at ties.
    - Puffy scrunchies (#e0564c) and soft rounded tassels.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.186, 0.175, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.18:  # Bangs
                theta_f = math.atan2(sin_u, cos_u)
                fringe_var = 0.022 * math.cos(theta_f * 3.0)
                max_phi = math.radians(65.5) + fringe_var
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape gathering
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(22.0)
                puff = 0.004
            else:  # Sides
                max_phi = math.radians(74.0)
                puff = 0.004

            # Subtle smooth center parting groove (broad Gaussian, no pinched crease)
            if abs(sin_u) < 0.20 and (cos_u < 0.15 or v < 0.35):
                crease_fac = math.cos((sin_u / 0.20) * (math.pi * 0.5)) ** 2
                puff -= 0.004 * crease_fac

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

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
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # DENSE INTERWOVEN CHEVRON BRAIDS
    for sign in [-1, 1]:
        braid_guide = [
            Vector((sign * 0.085, -0.125, 0.460)),
            Vector((sign * 0.110, -0.130, 0.415)),
            Vector((sign * 0.122, -0.122, 0.365)),
            Vector((sign * 0.125, -0.110, 0.325))
        ]
        guide_curve = catmull_rom_spline(braid_guide, samples_per_segment=8)

        # 4 Tiers with 50% longitudinal overlap for continuous dense weave
        num_tiers = 4
        for tier in range(num_tiers):
            t_center = (tier + 0.4) / float(num_tiers)
            idx = int(t_center * (len(guide_curve) - 1))
            pt_center, _ = guide_curve[idx]
            tangent = (guide_curve[min(idx + 1, len(guide_curve) - 1)][0] - guide_curve[max(0, idx - 1)][0]).normalized()

            up = Vector((0, 0, 1))
            right = tangent.cross(up).normalized()

            tier_scale = 1.0 - 0.30 * (tier / float(num_tiers))
            lobe_w = 0.042 * tier_scale
            lobe_th = 0.028 * tier_scale
            lobe_len = 0.042 * tier_scale  # Extended length ensures deep overlap!

            for sub_lobe in [-1, 1]:
                sub_offset = (sub_lobe * 0.40) * lobe_w
                sub_center = pt_center + right * sub_offset + tangent * (sub_lobe * 0.008)

                tilt_tangent = (tangent - right * (sub_lobe * 0.40 * sign)).normalized()
                l_spine = [
                    sub_center - tilt_tangent * (lobe_len * 0.5),
                    sub_center,
                    sub_center + tilt_tangent * (lobe_len * 0.5)
                ]
                add_volumetric_spline_lock(
                    bm, l_spine,
                    width_profile=(lobe_w * 0.65, lobe_w, lobe_w * 0.60),
                    thick_profile=(lobe_th * 0.65, lobe_th, lobe_th * 0.60),
                    samples=6, n_pts=6, mat_index=0
                )

        # Braid end hair tie
        pt_end, _ = guide_curve[-1]
        tan_end = (guide_curve[-1][0] - guide_curve[-2][0]).normalized()
        add_smooth_hair_band(bm, pt_end, axis=tan_end, major_r=0.018, minor_r=0.006, segs_u=12, segs_v=6, mat_index=1)

        # Soft rounded brush tuft / tassel
        tassel_spine = [
            pt_end,
            pt_end + tan_end * 0.016,
            pt_end + tan_end * 0.034
        ]
        add_volumetric_spline_lock(
            bm, tassel_spine,
            width_profile=(0.018, 0.024, 0.008),
            thick_profile=(0.014, 0.018, 0.006),
            samples=6, n_pts=6, mat_index=0
        )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_009", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    mat_tie = create_accessory_material(f"M_Tie_{char_id}", tie_hex, roughness=0.45)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 7. HAIR_010: SHOULDER-LENGTH HAIR (V13 FULL VOLUME REBUILD)
# =============================================================================

def build_hair_010_v13(arm, char_id, color_hex="#261b17"):
    """
    HAIR_010: Shoulder-Length Hair (V13 Rebuild)
    - Full side and rear hair envelope extending to shoulder level (Z ~ 0.385m).
    - Clear distinction from bob (003) and medium straight (005).
    - Shoulder-length silhouette clearly visible from back with full lower depth.
    - Signature inward C-curl cupping neck and collar with clearance from uniform.
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.188, 0.177, 0.166

    fringe_harmonics = [
        (0.022, 3.0, 0.0),
        (0.008, 4.8, 0.4)
    ]
    build_loose_hair_envelope(
        bm, center_y, center_z, rx, ry, rz,
        fringe_phi_deg=65.0,      # Fringe above brow
        side_phi_deg=104.0,       # Sides to top of shoulder (Z ~ 0.390m)
        rear_phi_deg=107.0,       # Rear mantle to collar height (Z ~ 0.385m)
        fringe_harmonics=fringe_harmonics,
        side_bulge=0.010,         # Soft feminine curvature
        inward_curl_z=0.435,      # Inward C-curl cupping neck & collar
        inward_curl_fac=(0.016, 0.012),
        num_rings=22, segs=40
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_010", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# 8. HAIR_011: SIDE-SWEPT BANGS (V13 BROAD FRINGE MASS REBUILD)
# =============================================================================

def build_hair_011_v13(arm, char_id, color_hex="#1a1b20"):
    """
    HAIR_011: Side-Swept Bangs (V13 Rebuild)
    - Replaced isolated thin diagonal strand with broad swept fringe mass (width 88mm, depth 28mm).
    - Blends smoothly into crown and temple at off-center part (X = -0.065m).
    - Real 3D width, thickness, and gentle curvature across forehead.
    - Secondary supporting under-lock for rich layered depth.
    - Both eyes and eyebrows remain completely readable.
    - Medium layered silhouette with side sections framing cheeks (Z ~ 0.430m).
    """
    bm = bmesh.new()
    center_y, center_z = -0.010, 0.528
    rx, ry, rz = 0.187, 0.176, 0.165
    num_rings, segs = 18, 36

    ring_verts = []
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u, cos_u = math.sin(u), math.cos(u)

            if cos_u > 0.15:  # Forehead base with sweep origin
                asym = sin_u * 0.10
                max_phi = math.radians(64.0) + asym
                puff = 0.005 + 0.005 * math.sin(v * math.pi)
            elif cos_u < -0.15:  # Nape
                back_fac = -cos_u
                max_phi = math.radians(95.0) + back_fac * math.radians(24.0)
                puff = 0.003
            else:  # Sides framing jaw
                max_phi = math.radians(88.0)
                puff = 0.006 + 0.005 * math.sin(v * math.pi)

            phi = v * max_phi
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u + center_y
            pz = center_z + (rz + puff) * math.cos(phi)

            row.append(bm.verts.new(Vector((px, py, pz))))
        ring_verts.append(row)

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((ring_verts[r][s], ring_verts[r][sn], ring_verts[r+1][sn], ring_verts[r+1][s]))

    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.005)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex, ring_verts[0][s], ring_verts[0][sn]))

    rim_outer = ring_verts[-1]
    rim_inner = []
    for s in range(segs):
        vo = rim_outer[s]
        p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.014 + Vector((0, 0, 0.005))
        rim_inner.append(bm.verts.new(p_in))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))

    # BROAD, VOLUMETRIC SWEPT FRINGE MASS (Real 88mm width & 28mm depth)
    main_sweep_spine = [
        Vector((-0.065, 0.125, 0.655)),
        Vector((-0.010, 0.148, 0.640)),
        Vector(( 0.055, 0.142, 0.605)),
        Vector(( 0.115, 0.125, 0.545)),
        Vector(( 0.140, 0.095, 0.475))
    ]
    add_volumetric_spline_lock(
        bm, main_sweep_spine,
        width_profile=(0.048, 0.088, 0.024),   # Broad 88mm sweep width!
        thick_profile=(0.022, 0.028, 0.010),  # Full 28mm depth!
        samples=24, n_pts=12, mat_index=0
    )

    # Layered supporting under-lock
    under_sweep_spine = [
        Vector((-0.045, 0.120, 0.645)),
        Vector(( 0.025, 0.136, 0.612)),
        Vector(( 0.090, 0.120, 0.558))
    ]
    add_volumetric_spline_lock(
        bm, under_sweep_spine,
        width_profile=(0.032, 0.052, 0.018),
        thick_profile=(0.016, 0.020, 0.008),
        samples=16, n_pts=10, mat_index=0
    )

    # Sleek minor side lock
    minor_side_spine = [
        Vector((-0.080, 0.115, 0.640)),
        Vector((-0.115, 0.100, 0.575)),
        Vector((-0.130, 0.075, 0.505))
    ]
    add_volumetric_spline_lock(
        bm, minor_side_spine,
        width_profile=(0.028, 0.042, 0.016),
        thick_profile=(0.014, 0.018, 0.006),
        samples=16, n_pts=8, mat_index=0
    )

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_011", mesh)
    mat = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.68)
    obj.data.materials.append(mat)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

# =============================================================================
# DISPATCHER TABLE & BATCH RUNNER
# =============================================================================

HAIRSTYLE_DISPATCHER_V13 = {
    "HAIR_003": build_hair_003_v13,
    "HAIR_005": build_hair_005_v13,
    "HAIR_006": build_hair_006_v13,
    "HAIR_007": build_hair_007_v13,
    "HAIR_008": build_hair_008_v13,
    "HAIR_009": build_hair_009_v13,
    "HAIR_010": build_hair_010_v13,
    "HAIR_011": build_hair_011_v13,
}

HAIRSTYLE_METADATA_V13 = {
    "HAIR_003": {"name": "Rounded Bob", "color": "#221714"},
    "HAIR_005": {"name": "Medium Straight", "color": "#1e1816"},
    "HAIR_006": {"name": "Low Ponytail", "color": "#1b1717", "tie": "#e0564c"},
    "HAIR_007": {"name": "High Ponytail", "color": "#1a1818", "tie": "#4a8ec2"},
    "HAIR_008": {"name": "Twin Pigtails", "color": "#2b201c", "tie": "#f5b82e"},
    "HAIR_009": {"name": "Braided Hair", "color": "#1c1615", "tie": "#e0564c"},
    "HAIR_010": {"name": "Shoulder-Length Hair", "color": "#261b17"},
    "HAIR_011": {"name": "Side-Swept Bangs", "color": "#1a1b20"},
}

def run_v13_rebuild():
    print("[Pipeline] Starting V13 Full Volume Hairstyle Generation & Validation...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    manifest = {}

    target_ids = ["HAIR_003", "HAIR_005", "HAIR_006", "HAIR_007", "HAIR_008", "HAIR_009", "HAIR_010", "HAIR_011"]

    views = [
        ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
        ("three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
        ("side", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
        ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
        ("elevated_rear", (0.0, -0.85, 0.820), (math.radians(65), 0, 0), 60),
    ]

    for hair_id in target_ids:
        meta = HAIRSTYLE_METADATA_V13[hair_id]
        builder_fn = HAIRSTYLE_DISPATCHER_V13[hair_id]
        print(f"\n=======================================================")
        print(f"BUILDING V13 REBUILD: {hair_id} — {meta['name']}")
        print(f"=======================================================")

        char_tag = f"v13_{hair_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)

        # Clear existing hair
        for o in list(bpy.data.objects):
            if o.name.startswith("Hair_"):
                bpy.data.objects.remove(o, do_unlink=True)

        arm = factory.arm
        color = meta["color"]
        if "tie" in meta:
            hair_obj = builder_fn(arm, char_tag, color_hex=color, tie_hex=meta["tie"])
        else:
            hair_obj = builder_fn(arm, char_tag, color_hex=color)

        print(f"[Built] {hair_obj.name}: {len(hair_obj.data.polygons)} quads")

        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        factory.equip_accessories(["ACC_002"], char_tag)

        # Save source .blend
        blend_path = os.path.join(BLEND_DIR, f"{hair_id.lower()}_v13_source.blend")
        blend_preview_path = os.path.join(PREVIEWS_DIR, f"{hair_id.lower()}_v13_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        shutil.copyfile(blend_path, blend_preview_path)
        print(f"  Saved Blend -> {blend_path}")

        # Export GLB (versioned and standard)
        glb_name = f"character_{hair_id.lower()}_v13.glb"
        glb_path = os.path.join(GLB_DIR, glb_name)
        glb_preview_path = os.path.join(PREVIEWS_DIR, glb_name)
        glb_size = factory.export_glb(glb_path)
        shutil.copyfile(glb_path, glb_preview_path)

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

        manifest[hair_id] = {
            "name": meta["name"],
            "glb": glb_name,
            "glb_size_kb": round(glb_size / 1024, 1),
            "renders": rendered_images,
            "quads": len(hair_obj.data.polygons),
            "color": color
        }

    manifest_path = os.path.join(PREVIEWS_DIR, "v13_rebuild_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[Done] Pipeline finished! Manifest saved to {manifest_path}")

if __name__ == "__main__":
    run_v13_rebuild()
