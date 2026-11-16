import bpy

h = bpy.data.objects.get("Head")
if h:
    with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\inspect_v7_out.txt", "a") as f:
        f.write("\nHead mesh vertices:\n")
        for i, v in enumerate(h.data.vertices):
            f.write(f"  v{i}: {list(v.co)}\n")
        f.write(f"Head mesh bounds:\n")
        xs = [v.co.x for v in h.data.vertices]
        ys = [v.co.y for v in h.data.vertices]
        zs = [v.co.z for v in h.data.vertices]
        f.write(f"  X: [{min(xs)}, {max(xs)}]\n")
        f.write(f"  Y: [{min(ys)}, {max(ys)}]\n")
        f.write(f"  Z: [{min(zs)}, {max(zs)}]\n")
