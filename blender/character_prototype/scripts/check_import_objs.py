import bpy

OUTPUT_GLB = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\assets\characters\vietnamese_student_fixed.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=OUTPUT_GLB)

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\check_import_objs.txt", "w") as f:
    f.write(f"Total objects after importing fixed GLB: {len(bpy.data.objects)}\n")
    for o in bpy.data.objects:
        f.write(f"  {o.name:25} | type={o.type} | dims={[round(x,3) for x in o.dimensions]}\n")
