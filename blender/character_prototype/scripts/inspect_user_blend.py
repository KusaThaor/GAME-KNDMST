import bpy

blend_path = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_skinned.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

lines = ["=== OBJECTS IN USER EDITED BLEND ==="]
for obj in bpy.data.objects:
    if obj.type == "MESH":
        lines.append(f"- MESH: {obj.name}, verts={len(obj.data.vertices)}, faces={len(obj.data.polygons)}, loc={[round(x,3) for x in obj.location]}, mat={[m.name for m in obj.data.materials if m]}")
    elif obj.type == "ARMATURE":
        lines.append(f"- ARMATURE: {obj.name}, bones={len(obj.data.bones)}")
    else:
        lines.append(f"- {obj.type}: {obj.name}")

lines.append("\nACTIONS: " + ", ".join([a.name for a in bpy.data.actions]))

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\user_blend_summary.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
