import bpy

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\hair_vis_out.txt", "w") as f:
    f.write("=== COLLECTIONS ===\n")
    for c in bpy.data.collections:
        f.write(f"Collection: {c.name}, hide_render={c.hide_render}, hide_viewport={c.hide_viewport}\n")
        for o in c.objects:
            f.write(f"  Obj in col: {o.name}, hide_render={o.hide_render}, loc={list(o.location)}\n")

    f.write("\n=== VIEW LAYER LAYER COLLECTIONS ===\n")
    def check_lc(lc, indent=""):
        f.write(f"{indent}LayerCol: {lc.name}, exclude={lc.exclude}, hide_viewport={lc.hide_viewport}\n")
        for child in lc.children:
            check_lc(child, indent + "  ")
    check_lc(bpy.context.view_layer.layer_collection)
