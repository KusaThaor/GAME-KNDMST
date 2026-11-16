import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\list_blend_actions.txt", "w", encoding="utf-8") as f:
    f.write(f"Total actions: {len(bpy.data.actions)}\n")
    for a in bpy.data.actions:
        f.write(f"  {a.name:30}: frames={a.frame_range[0]}..{a.frame_range[1]}, curves={len(a.fcurves)}\n")
