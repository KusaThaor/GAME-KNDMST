import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

head = bpy.data.objects.get("Body_Head")
# Let's find vertices of head near eyes
head_mw = head.matrix_world
verts_near_eye = []
for v in head.data.vertices:
    wv = head_mw @ v.co
    if abs(wv.x) < 0.10 and abs(wv.z - 0.52) < 0.05 and wv.y > 0.10:
        verts_near_eye.append(wv)

print(f"Found {len(verts_near_eye)} head vertices near eye region:")
for v in sorted(verts_near_eye, key=lambda p: (p.z, p.x)):
    print(f"  Head vert: X={v.x:+.4f}, Y={v.y:+.4f}, Z={v.z:+.4f}")

# Raycast to find exact Y of head at eye centers and highlight centers
depsgraph = bpy.context.evaluated_depsgraph_get()
head_eval = head.evaluated_get(depsgraph)

test_pts = [
    ("Eye_L center", -0.066, 0.520),
    ("HL1_L center", -0.074, 0.531),
    ("HL2_L center", -0.058, 0.510),
    ("Eye_R center",  0.066, 0.520),
    ("HL1_R center",  0.074, 0.531),
    ("HL2_R center",  0.058, 0.510),
]

print("\n--- Raycast to Head Surface from Y=0.300 ---")
for name, x, z in test_pts:
    ray_origin = mathutils.Vector((x, 0.300, z))
    ray_dir = mathutils.Vector((0, -1.0, 0))
    hit, loc, norm, face_idx = head.ray_cast(head.matrix_world.inverted() @ ray_origin, head.matrix_world.inverted().to_3x3() @ ray_dir)
    if hit:
        w_hit = head.matrix_world @ loc
        print(f"  {name:15s} (X={x:.3f}, Z={z:.3f}) -> Head surface Y = {w_hit.y:.5f}")
    else:
        print(f"  {name:15s} -> Missed head!")
