"""
Prototype geometry test for V15 female hairstyles.
Tests:
1. RMF-based continuous ponytail for HAIR_007.
2. Smooth continuous envelope and falling locks for HAIR_003 and HAIR_010.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
import os
import sys

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
TEST_DIR = os.path.join(FACTORY_DIR, "previews", "v15_test")
os.makedirs(TEST_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# MATH & SPLINE UTILITIES
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

def add_continuous_rmf_spline_lock(bm, control_points, width_profile, thick_profile, samples=28, n_pts=12, mat_index=0, initial_binormal=(1,0,0)):
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

    # Initial frame
    t0 = tangents[0]
    b0 = Vector(initial_binormal).normalized()
    b0 = (b0 - t0 * t0.dot(b0)).normalized()
    n0 = t0.cross(b0).normalized()

    binormals = [b0]
    normals = [n0]

    # Double reflection RMF (Wang et al. 2008)
    for i in range(num_pts - 1):
        t1, t2 = tangents[i], tangents[i + 1]
        v = curve_pts[i + 1][0] - curve_pts[i][0]
        c1 = v.dot(v)
        if c1 > 1e-12:
            rL = binormals[i] - (2.0 / c1) * v.dot(binormals[i]) * v
            tL = t1 - (2.0 / c1) * v.dot(t1) * v
            v_t = t2 - tL
            c2 = v_t.dot(v_t)
            b_next = rL - (2.0 / c2) * v_t.dot(rL) * v_t if c2 > 1e-12 else rL
        else:
            b_next = binormals[i]
        b_next = (b_next - t2 * t2.dot(b_next)).normalized()
        n_next = t2.cross(b_next).normalized()
        binormals.append(b_next)
        normals.append(n_next)

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

        bn = binormals[i]
        nm = normals[i]
        ring = []
        for k in range(n_pts):
            ang = 2.0 * math.pi * k / n_pts
            vx = math.cos(ang) * (w * 0.5)
            vy = math.sin(ang) * (th * 0.5)
            p = pt + bn * vx + nm * vy
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

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

print("[Test] Script compiled successfully.")
