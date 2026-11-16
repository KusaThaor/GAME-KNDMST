import bpy
import json
import os

blend_path = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

audit = {
    "objects_count": len(bpy.data.objects),
    "objects": [],
    "armatures": [],
    "materials": [],
    "actions": [a.name for a in bpy.data.actions],
    "images": [i.name for i in bpy.data.images]
}

total_verts = 0
total_faces = 0

for obj in bpy.data.objects:
    obj_info = {
        "name": obj.name,
        "type": obj.type,
        "location": [round(v, 4) for v in obj.location],
        "scale": [round(v, 4) for v in obj.scale],
        "parent": obj.parent.name if obj.parent else None,
        "modifiers": [{"name": m.name, "type": m.type} for m in obj.modifiers],
        "vertex_groups": [vg.name for vg in obj.vertex_groups],
        "materials": [m.name for m in obj.data.materials if m] if obj.type == "MESH" else []
    }
    if obj.type == "MESH":
        v_count = len(obj.data.vertices)
        f_count = len(obj.data.polygons)
        total_verts += v_count
        total_faces += f_count
        obj_info["vert_count"] = v_count
        obj_info["face_count"] = f_count
    audit["objects"].append(obj_info)

for arm in bpy.data.armatures:
    arm_info = {
        "name": arm.name,
        "bones": []
    }
    for b in arm.bones:
        arm_info["bones"].append({
            "name": b.name,
            "parent": b.parent.name if b.parent else None,
            "head": [round(v, 4) for v in b.head_local],
            "tail": [round(v, 4) for v in b.tail_local],
            "length": round(b.length, 4)
        })
    audit["armatures"].append(arm_info)

for mat in bpy.data.materials:
    mat_info = {
        "name": mat.name,
        "use_nodes": mat.use_nodes,
        "nodes": [n.type for n in mat.node_tree.nodes] if mat.use_nodes and mat.node_tree else []
    }
    audit["materials"].append(mat_info)

audit["total_verts"] = total_verts
audit["total_faces"] = total_faces

out_json = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\audit_result.json"
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(audit, f, indent=2)

print("AUDIT_COMPLETE")
