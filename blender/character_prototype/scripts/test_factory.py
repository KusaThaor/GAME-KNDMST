import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
with open("test_factory_out.txt", "w") as f:
    f.write(f"Objects: {[o.name for o in bpy.data.objects]}\n")
    f.write(f"Meshes: {[m.name for m in bpy.data.meshes]}\n")
