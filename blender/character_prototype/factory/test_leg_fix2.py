import bpy
import bmesh
import math

bm = bmesh.new()
segs = 14
cx = -0.055

def make_ring(z, rx, ry, cx, cy):
    verts = []
    for i in range(segs):
        ang = 2.0 * math.pi * i / segs
        verts.append(bm.verts.new((cx + rx * math.cos(ang), cy + ry * math.sin(ang), z)))
    return verts

r_crotch    = make_ring(0.195, 0.042, 0.042, cx, 0.0)
r_thigh_top = make_ring(0.160, 0.041, 0.041, cx, 0.0)
r_thigh_mid = make_ring(0.135, 0.039, 0.039, cx, 0.001)
r_knee      = make_ring(0.115, 0.038, 0.038, cx, 0.002)
r_shin      = make_ring(0.075, 0.037, 0.037, cx, 0.0)
r_ankle     = make_ring(0.038, 0.037, 0.037, cx, 0.0)

def bridge(r1, r2):
    n = len(r1)
    for i in range(n):
        v1 = r1[i]
        v2 = r1[(i + 1) % n]
        v3 = r2[(i + 1) % n]
        v4 = r2[i]
        bm.faces.new((v1, v2, v3, v4))

bridge(r_crotch, r_thigh_top)
bridge(r_thigh_top, r_thigh_mid)
bridge(r_thigh_mid, r_knee)
bridge(r_knee, r_shin)
bridge(r_shin, r_ankle)

bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

mesh = bpy.data.meshes.new("test_leg")
bm.to_mesh(mesh)
bm.free()

dots = []
for p in mesh.polygons:
    c = p.center
    rad = (c.x - cx, c.y)
    dot = rad[0] * p.normal.x + rad[1] * p.normal.y
    dots.append(dot)

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\leg_fix_out.txt", "w") as f:
    f.write(f"min_rad_dot={min(dots):.4f}, max_rad_dot={max(dots):.4f}, count={len(dots)}")
