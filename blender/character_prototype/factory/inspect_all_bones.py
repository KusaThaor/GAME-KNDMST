import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend")
arm = bpy.data.objects.get("Student_Armature")
lines = []
for b in arm.data.bones:
    parent = b.parent.name if b.parent else "None"
    lines.append(f"{b.name:15} head={tuple(round(v, 4) for v in b.head_local)} tail={tuple(round(v, 4) for v in b.tail_local)} parent={parent}")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\scratch_bones.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
