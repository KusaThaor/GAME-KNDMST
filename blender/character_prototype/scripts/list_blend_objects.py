import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\list_blend_objects.txt", "w", encoding="utf-8") as f:
    f.write(f"Total objects in bpy.data.objects: {len(bpy.data.objects)}\n")
    for o in bpy.data.objects:
        f.write(f"  {o.name:25} | type={o.type} | in_scene={o.name in bpy.context.scene.objects}\n")
    f.write(f"\nCollections:\n")
    for c in bpy.data.collections:
        f.write(f"  Collection: {c.name} -> {[o.name for o in c.objects]}\n")
