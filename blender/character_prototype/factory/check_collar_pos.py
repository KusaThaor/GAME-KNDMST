import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\generated_scenes\student_uniform_scarf.blend")

col = bpy.data.objects.get("Top_Collar")
torso = bpy.data.objects.get("Top_Torso_Mesh")
scarf = bpy.data.objects.get("Acc_Red_Scarf")

lines = []
for o in [col, torso, scarf]:
    if o:
        bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        lines.append(f"{o.name:15}: X=[{min(v.x for v in bb):+.3f}, {max(v.x for v in bb):+.3f}] Y=[{min(v.y for v in bb):+.3f}, {max(v.y for v in bb):+.3f}] Z=[{min(v.z for v in bb):+.3f}, {max(v.z for v in bb):+.3f}]")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\collar_check.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
