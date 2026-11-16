import bpy

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\dump_orig_hair_mesh.txt", "w", encoding="utf-8") as f:
    for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R"]:
        obj = bpy.data.objects.get(name)
        if obj:
            f.write(f"\n=== {name} ===\n")
            f.write(f"loc={list(obj.location)}, rot={list(obj.rotation_euler)}, scale={list(obj.scale)}\n")
            f.write("Vertices:\n")
            for i, v in enumerate(obj.data.vertices):
                f.write(f"  v{i}: {list(v.co)}\n")
            f.write("Faces:\n")
            for i, poly in enumerate(obj.data.polygons):
                f.write(f"  p{i}: {list(poly.vertices)}\n")
            f.write("Modifiers:\n")
            for m in obj.modifiers:
                f.write(f"  mod {m.name}: type={m.type}\n")
                if m.type == 'SUBSURF':
                    f.write(f"    levels={m.levels}, render_levels={m.render_levels}\n")
