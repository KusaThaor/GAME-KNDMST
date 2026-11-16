import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\test_eval_out.txt", "w", encoding="utf-8") as f:
    hair = bpy.data.objects.get("Hair_Cap")
    f.write(f"Hair_Cap modifiers: {[(m.name, m.type) for m in hair.modifiers]}\n")
    f.write(f"Hair_Cap base mesh verts: {len(hair.data.vertices)}, polys: {len(hair.data.polygons)}\n")
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_hair = hair.evaluated_get(depsgraph)
    eval_mesh = bpy.data.meshes.new_from_object(eval_hair)
    f.write(f"Hair_Cap evaluated verts: {len(eval_mesh.vertices)}, polys: {len(eval_mesh.polygons)}\n")
