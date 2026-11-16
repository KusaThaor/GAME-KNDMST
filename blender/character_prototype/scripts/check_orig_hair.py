import bpy

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\check_orig_hair.txt", "w", encoding="utf-8") as f:
    f.write("=== ORIGINAL OBJECTS ===\n")
    for o in bpy.data.objects:
        f.write(f"Obj: {o.name}, type: {o.type}, loc: {list(o.location)}, parent: {o.parent.name if o.parent else 'None'}\n")
        if "hair" in o.name.lower() and o.type == 'MESH':
            f.write(f"  Mesh verts: {len(o.data.vertices)}, faces: {len(o.data.polygons)}\n")
            zs = [v.co.z for v in o.data.vertices]
            ys = [v.co.y for v in o.data.vertices]
            xs = [v.co.x for v in o.data.vertices]
            f.write(f"  Bounds X: [{min(xs):.3f}, {max(xs):.3f}], Y: [{min(ys):.3f}, {max(ys):.3f}], Z: [{min(zs):.3f}, {max(zs):.3f}]\n")
            f.write(f"  Modifiers: {[m.name + '(' + m.type + ')' for m in o.modifiers]}\n")
