import bpy
import os
import mathutils

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
GLB_PATH = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student.glb")
OUT_LOG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "diagnose_glb_bug.txt")

with open(OUT_LOG, "w", encoding="utf-8") as f:
    f.write("=== PHASE 1: ROOT CAUSE ANALYSIS ===\n\n")

# PART 1: Inspect imported GLB
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

with open(OUT_LOG, "a", encoding="utf-8") as f:
    f.write(f"--- 1. INSPECTING IMPORTED GLB: {GLB_PATH} ---\n")
    f.write(f"Total objects in GLB: {len(bpy.data.objects)}\n")
    for o in bpy.data.objects:
        f.write(f"\nObject: '{o.name}' | Type: {o.type}\n")
        f.write(f"  Parent: {o.parent.name if o.parent else 'None'}, Parent Type: {o.parent_type}\n")
        f.write(f"  Loc: {[round(x, 4) for x in o.location]}\n")
        f.write(f"  Rot: {[round(x, 4) for x in o.rotation_euler]}\n")
        f.write(f"  Scale: {[round(x, 4) for x in o.scale]}\n")
        if o.type == 'MESH':
            me = o.data
            f.write(f"  Vertices: {len(me.vertices)}, Edges: {len(me.edges)}, Polygons: {len(me.polygons)}\n")
            # Calculate bounding box dimensions
            bbox = [mathutils.Vector(corner) for corner in o.bound_box]
            xs = [v.x for v in bbox]
            ys = [v.y for v in bbox]
            zs = [v.z for v in bbox]
            dim_x = max(xs) - min(xs)
            dim_y = max(ys) - min(ys)
            dim_z = max(zs) - min(zs)
            f.write(f"  Local BBox Dims: dx={dim_x:.4f}, dy={dim_y:.4f}, dz={dim_z:.4f}\n")
            f.write(f"  Dimensions: {[round(x, 4) for x in o.dimensions]}\n")
            # World bounding box
            world_corners = [o.matrix_world @ v for v in bbox]
            w_xs = [v.x for v in world_corners]
            w_ys = [v.y for v in world_corners]
            w_zs = [v.z for v in world_corners]
            f.write(f"  World BBox: X=[{min(w_xs):.3f}, {max(w_xs):.3f}], Y=[{min(w_ys):.3f}, {max(w_ys):.3f}], Z=[{min(w_zs):.3f}, {max(w_zs):.3f}]\n")
            f.write(f"  Materials: {[m.name if m else 'None' for m in o.data.materials]}\n")
            f.write(f"  Modifiers: {[m.name + '(' + m.type + ')' for m in o.modifiers]}\n")

# PART 2: Inspect Source .blend
bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)

with open(OUT_LOG, "a", encoding="utf-8") as f:
    f.write(f"\n\n--- 2. INSPECTING SOURCE .BLEND: {BASE_BLEND} ---\n")
    f.write(f"Total objects in Blend: {len(bpy.data.objects)}\n")
    for o in bpy.data.objects:
        f.write(f"\nObject: '{o.name}' | Type: {o.type} | Hide Viewport: {o.hide_viewport} | Hide Render: {o.hide_render} | Hide Get: {o.hide_get()}\n")
        f.write(f"  Parent: {o.parent.name if o.parent else 'None'}, Parent Type: {o.parent_type}, Bone: {o.parent_bone}\n")
        f.write(f"  Loc: {[round(x, 4) for x in o.location]}, Scale: {[round(x, 4) for x in o.scale]}\n")
        if o.type == 'MESH':
            me = o.data
            f.write(f"  Mesh Data Name: '{me.name}' | Vertices: {len(me.vertices)}, Polys: {len(me.polygons)}\n")
            f.write(f"  Dimensions: {[round(x, 4) for x in o.dimensions]}\n")
            f.write(f"  Modifiers: {[m.name + '(' + m.type + ', show_viewport=' + str(m.show_viewport) + ', show_render=' + str(m.show_render) + ')' for m in o.modifiers]}\n")
            f.write(f"  Vertex Groups: {[vg.name for vg in o.vertex_groups]}\n")
            if o.data.shape_keys:
                f.write(f"  Shape Keys: {[sk.name for sk in o.data.shape_keys.key_blocks]}\n")
            f.write(f"  Materials: {[m.name if m else 'None' for m in o.data.materials]}\n")

print("Diagnosis completed. Results saved to:", OUT_LOG)
