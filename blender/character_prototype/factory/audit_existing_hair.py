import bpy
import mathutils
import os
import sys
import json

factory_dir = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if factory_dir not in sys.path:
    sys.path.insert(0, factory_dir)

import character_factory
import asset_registry

canonical_blend = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
factory = character_factory.CharacterFactory(canonical_blend)

audit_results = {}
for hair_id in ["HAIR_001", "HAIR_002", "HAIR_003"]:
    factory.load_base()
    factory.equip_hair(hair_id, "#1c1615", "audit")
    
    hair_objs = [o for o in bpy.data.objects if o.name.startswith("Hair_")]
    obj_data = []
    total_raw_verts = 0
    total_raw_faces = 0
    total_eval_verts = 0
    total_eval_faces = 0
    
    for o in hair_objs:
        v_count = len(o.data.vertices)
        f_count = len(o.data.polygons)
        total_raw_verts += v_count
        total_raw_faces += f_count
        
        # evaluate modifiers
        depsgraph = bpy.context.evaluated_depsgraph_get()
        eval_o = o.evaluated_get(depsgraph)
        eval_mesh = eval_o.to_mesh()
        eval_v = len(eval_mesh.vertices)
        eval_f = len(eval_mesh.polygons)
        total_eval_verts += eval_v
        total_eval_faces += eval_f
        eval_o.to_mesh_clear()
        
        # material
        mat = o.data.materials[0] if o.data.materials else None
        mat_info = {}
        if mat and mat.use_nodes:
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                mat_info["roughness"] = bsdf.inputs["Roughness"].default_value
                mat_info["metallic"] = bsdf.inputs["Metallic"].default_value
                spec_in = bsdf.inputs.get("Specular IOR Level") or bsdf.inputs.get("Specular")
                mat_info["specular"] = spec_in.default_value if spec_in else 0.5
        
        # Bounding box in world space
        bbox_world = [list(o.matrix_world @ mathutils.Vector(b)) for b in o.bound_box]
        min_x = min(p[0] for p in bbox_world)
        max_x = max(p[0] for p in bbox_world)
        min_y = min(p[1] for p in bbox_world)
        max_y = max(p[1] for p in bbox_world)
        min_z = min(p[2] for p in bbox_world)
        max_z = max(p[2] for p in bbox_world)

        obj_data.append({
            "name": o.name,
            "raw_verts": v_count,
            "raw_faces": f_count,
            "eval_verts": eval_v,
            "eval_faces": eval_f,
            "location": [round(x, 4) for x in o.location],
            "dimensions": [round(x, 4) for x in o.dimensions],
            "bounds": {
                "x": [round(min_x, 4), round(max_x, 4)],
                "y": [round(min_y, 4), round(max_y, 4)],
                "z": [round(min_z, 4), round(max_z, 4)],
            },
            "modifiers": [m.type for m in o.modifiers],
            "material": mat_info
        })
        
    audit_results[hair_id] = {
        "objects": obj_data,
        "total_raw_verts": total_raw_verts,
        "total_raw_faces": total_raw_faces,
        "total_eval_verts": total_eval_verts,
        "total_eval_faces": total_eval_faces
    }

print("\n--- AUDIT RESULTS ---")
print(json.dumps(audit_results, indent=2))
out_json = os.path.join(factory_dir, "hair_audit_v1.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(audit_results, f, indent=2)
print(f"Written audit report to {out_json}")
