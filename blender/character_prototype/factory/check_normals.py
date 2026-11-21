import bpy
import bmesh
import sys
import os

factory_dir = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if factory_dir not in sys.path:
    sys.path.insert(0, factory_dir)

import clothing_library

blend = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
bpy.ops.wm.open_mainfile(filepath=blend)
arm = bpy.data.objects["Student_Armature"]

limbs = clothing_library.build_adaptive_body_limbs(arm, "test_normals", "#fae3d2", "TOP_001", "BOTTOM_004", "FOOTWEAR_001")

out_lines = []
for obj in limbs:
    mesh = obj.data
    # Check polygon normals
    for p in mesh.polygons:
        # Radial vector from center (cx, 0, cz)
        cx = -0.055 if "L" in obj.name else 0.055
        c = p.center
        rad = (c.x - cx, c.y)
        dot = rad[0] * p.normal.x + rad[1] * p.normal.y
        out_lines.append(f"{obj.name} face {p.index}: center={c}, normal={p.normal}, rad_dot={dot:.3f}")
        break

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\normals_check.txt", "w") as f:
    f.write("\n".join(out_lines))
