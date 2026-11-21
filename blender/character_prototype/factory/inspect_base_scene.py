import bpy

print("=== SCENE OBJECTS ===")
for o in bpy.data.objects:
    print(f"Name: {o.name}, Type: {o.type}, Parent: {o.parent.name if o.parent else 'None'}")
    if o.type == 'MESH':
        print(f"  Vertices: {len(o.data.vertices)}, Polygons: {len(o.data.polygons)}")
        print(f"  Modifiers: {[m.name + ' (' + m.type + ')' for m in o.modifiers]}")
        print(f"  Vertex groups: {[vg.name for vg in o.vertex_groups]}")
        bb = [tuple(v) for v in o.bound_box]
        print(f"  BoundBox min: {bb[0]}, max: {bb[6]}")

print("=== COLLECTIONS ===")
for col in bpy.data.collections:
    print(f"Col: {col.name}, objects: {[o.name for o in col.objects]}")

with open("C:/Users/Admin/Desktop/GAME/GAME-KNDMST/blender/character_prototype/factory/inspect_base_scene_out.txt", "w", encoding="utf-8") as f:
    f.write("=== SCENE OBJECTS ===\n")
    for o in bpy.data.objects:
        f.write(f"Name: {o.name}, Type: {o.type}, Parent: {o.parent.name if o.parent else 'None'}\n")
        if o.type == 'MESH':
            f.write(f"  Vertices: {len(o.data.vertices)}, Polygons: {len(o.data.polygons)}\n")
            f.write(f"  Modifiers: {[m.name + ' (' + m.type + ')' for m in o.modifiers]}\n")
            f.write(f"  Vertex groups: {[vg.name for vg in o.vertex_groups]}\n")
