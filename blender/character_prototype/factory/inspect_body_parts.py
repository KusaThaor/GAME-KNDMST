import bpy
import numpy as np

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\inspect_body_parts.txt", "w", encoding="utf-8") as f:
    for name in ["Character_Torso_Legs", "Character_Arm_L", "Character_Arm_R"]:
        obj = bpy.data.objects.get(name)
        if not obj:
            f.write(f"Missing {name}\n")
            continue
        mesh = obj.data
        verts = [v.co for v in mesh.vertices]
        min_z = min(v.z for v in verts)
        max_z = max(v.z for v in verts)
        min_x = min(v.x for v in verts)
        max_x = max(v.x for v in verts)
        f.write(f"--- {name} ---\n")
        f.write(f"Vert count: {len(verts)}, Poly count: {len(mesh.polygons)}\n")
        f.write(f"X bounds: [{min_x:.4f}, {max_x:.4f}], Z bounds: [{min_z:.4f}, {max_z:.4f}]\n")
        
        # Check boundary loops (open edges)
        import bmesh
        bm = bmesh.new()
        bm.from_mesh(mesh)
        boundary_edges = [e for e in bm.edges if e.is_boundary]
        f.write(f"Boundary edges: {len(boundary_edges)}\n")
        if boundary_edges:
            b_verts = set()
            for e in boundary_edges:
                b_verts.add(e.verts[0].co)
                b_verts.add(e.verts[1].co)
            f.write(f"Boundary vertices count: {len(b_verts)}\n")
            f.write(f"Boundary Z range: [{min(v.z for v in b_verts):.4f}, {max(v.z for v in b_verts):.4f}]\n")
            f.write(f"Boundary X range: [{min(v.x for v in b_verts):.4f}, {max(v.x for v in b_verts):.4f}]\n")
            for v in sorted(list(b_verts), key=lambda p: (p.z, p.x))[:10]:
                f.write(f"  sample boundary vert: {v}\n")
        bm.free()
