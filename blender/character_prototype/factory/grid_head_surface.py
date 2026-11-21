import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

head = bpy.data.objects.get("Body_Head")
mw = head.matrix_world
imw = mw.inverted()

xs = [-0.082, -0.074, -0.066, -0.058, -0.050]
zs = [0.500, 0.510, 0.520, 0.530, 0.540]

print("=== HEAD SURFACE Y AT EYE_L GRID ===")
header = f"{'Z / X':<8}" + "".join([f"{x:<10.3f}" for x in xs])
print(header)
for z in reversed(zs):
    row = f"{z:<8.3f}"
    for x in xs:
        ray_origin = mathutils.Vector((x, 0.300, z))
        ray_dir = mathutils.Vector((0, -1.0, 0))
        hit, loc, norm, face_idx = head.ray_cast(imw @ ray_origin, imw.to_3x3() @ ray_dir)
        if hit:
            w_hit = mw @ loc
            row += f"{w_hit.y:<10.4f}"
        else:
            row += f"{'MISS':<10}"
    print(row)
