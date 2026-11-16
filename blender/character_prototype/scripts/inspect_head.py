import bpy

p = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
# Already loaded when passed to -b

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\inspect_out.txt", "w", encoding="utf-8") as f:
    for name in ["Body_Head", "Hair_Cap", "Hair_Back", "Hair_Bangs", "Hair_Sideburn_L"]:
        obj = bpy.data.objects.get(name)
        if not obj:
            f.write(f"{name}: NOT FOUND\n")
            continue
        dg = bpy.context.evaluated_depsgraph_get()
        eval_obj = obj.evaluated_get(dg)
        mesh = eval_obj.to_mesh()
        min_co = [min((eval_obj.matrix_world @ v.co)[i] for v in mesh.vertices) for i in range(3)]
        max_co = [max((eval_obj.matrix_world @ v.co)[i] for v in mesh.vertices) for i in range(3)]
        mats = [m.name for m in obj.data.materials if m]
        f.write(f"{name}: mats={mats}, X=[{min_co[0]:.3f}, {max_co[0]:.3f}], Y=[{min_co[1]:.3f}, {max_co[1]:.3f}], Z=[{min_co[2]:.3f}, {max_co[2]:.3f}]\n")
