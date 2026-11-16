import bpy

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\head_rest_out.txt", "w", encoding="utf-8") as f:
    head = bpy.data.objects.get("Body_Head")
    if head:
        zs = [v.co.z for v in head.data.vertices]
        ys = [v.co.y for v in head.data.vertices]
        xs = [v.co.x for v in head.data.vertices]
        f.write(f"Body_Head bounds: X: [{min(xs):.3f}, {max(xs):.3f}], Y: [{min(ys):.3f}, {max(ys):.3f}], Z: [{min(zs):.3f}, {max(zs):.3f}]\n")

    for o in bpy.data.objects:
        if o.type == 'MESH':
            f.write(f"{o.name}: loc={list(o.location)}\n")
