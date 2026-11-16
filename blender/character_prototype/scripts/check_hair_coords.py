import bpy
import traceback

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\check_hair_coords.txt", "w") as f:
    for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Body_Head"]:
        o = bpy.data.objects.get(name)
        if o:
            f.write(f"=== {name} ===\n")
            try:
                f.write(f"loc={list(o.location)}, parent={o.parent}\n")
                f.write(f"modifiers={[m.name + '(' + m.type + ')' for m in o.modifiers]}\n")
                f.write(f"vertex_groups={[vg.name for vg in o.vertex_groups]}\n")
                f.write(f"materials={[m.name if m else 'None' for m in o.data.materials]}\n")
                f.write(f"verts count={len(o.data.vertices)}, faces count={len(o.data.polygons)}\n")
                if len(o.data.vertices) > 0:
                    zs = [v.co.z for v in o.data.vertices]
                    ys = [v.co.y for v in o.data.vertices]
                    xs = [v.co.x for v in o.data.vertices]
                    f.write(f"mesh coords: X:[{min(xs):.3f}, {max(xs):.3f}], Y:[{min(ys):.3f}, {max(ys):.3f}], Z:[{min(zs):.3f}, {max(zs):.3f}]\n")
            except Exception as e:
                f.write(f"Error in {name}: {e}\n{traceback.format_exc()}\n")
