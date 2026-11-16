import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\list_meshes.txt", "w", encoding="utf-8") as f:
    f.write(f"Total meshes in bpy.data.meshes: {len(bpy.data.meshes)}\n")
    for m in bpy.data.meshes:
        users = [o.name for o in bpy.data.objects if o.data == m]
        f.write(f"  {m.name:25} | users={users}\n")
