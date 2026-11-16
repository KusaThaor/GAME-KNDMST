import bpy
import json
import os

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SCENE_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
REPORT_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "audit_production_report.json")

bpy.ops.wm.open_mainfile(filepath=SCENE_PATH)

audit = {
    "scene_name": "vietnamese_student_base.blend",
    "collections": {},
    "mesh_objects": [],
    "total_vertices": 0,
    "total_faces": 0,
    "materials": [],
    "armature": {
        "name": None,
        "bones_count": 0,
        "bones": [],
        "hierarchy": {}
    },
    "actions": []
}

# 1. Collections
for col in bpy.data.collections:
    audit["collections"][col.name] = [o.name for o in col.objects]

# 2. Meshes & Skinning
arm_obj = bpy.data.objects.get("Student_Armature")
if arm_obj:
    audit["armature"]["name"] = arm_obj.name
    audit["armature"]["bones_count"] = len(arm_obj.data.bones)
    for b in arm_obj.data.bones:
        audit["armature"]["bones"].append({
            "name": b.name,
            "parent": b.parent.name if b.parent else None,
            "head": list(b.head_local),
            "tail": list(b.tail_local),
            "length": b.length
        })
        audit["armature"]["hierarchy"][b.name] = b.parent.name if b.parent else "ROOT"

for obj in bpy.data.objects:
    if obj.type == "MESH":
        v_count = len(obj.data.vertices)
        f_count = len(obj.data.polygons)
        audit["total_vertices"] += v_count
        audit["total_faces"] += f_count

        mods = [{"name": m.name, "type": m.type} for m in obj.modifiers]
        vgs = [vg.name for vg in obj.vertex_groups]
        mats = [m.name for m in obj.data.materials if m]

        # Check weights distribution
        has_armature_mod = any(m.type == 'ARMATURE' for m in obj.modifiers)

        audit["mesh_objects"].append({
            "name": obj.name,
            "vertices": v_count,
            "faces": f_count,
            "modifiers": mods,
            "vertex_groups": vgs,
            "materials": mats,
            "has_armature_mod": has_armature_mod,
            "location": list(obj.location),
            "dimensions": list(obj.dimensions)
        })

# 3. Materials
for m in bpy.data.materials:
    audit["materials"].append({
        "name": m.name,
        "use_nodes": m.use_nodes
    })

# 4. Actions Analysis (Checking dynamic animated vs static pose)
for act in bpy.data.actions:
    fcurves_count = len(act.fcurves)
    frange = list(act.frame_range)

    # Inspect keyframe variation across frames to check if truly animated
    animated_bones = set()
    is_multi_frame_dynamic = False

    bone_curves = {}
    for fc in act.fcurves:
        # data_path e.g. pose.bones["Head"].rotation_euler
        path = fc.data_path
        if 'pose.bones["' in path:
            bname = path.split('pose.bones["')[1].split('"]')[0]
            animated_bones.add(bname)
        
        # Check if values actually change across keyframe points
        vals = [kp.co[1] for kp in fc.keyframe_points]
        if len(vals) > 1 and (max(vals) - min(vals)) > 0.001:
            is_multi_frame_dynamic = True

    audit["actions"].append({
        "name": act.name,
        "frame_range": frange,
        "duration_frames": int(frange[1] - frange[0] + 1) if frange[1] >= frange[0] else 0,
        "fcurves_count": fcurves_count,
        "animated_bones_count": len(animated_bones),
        "animated_bones": sorted(list(animated_bones)),
        "is_multi_frame_dynamic": is_multi_frame_dynamic,
        "keyframes_count": sum(len(fc.keyframe_points) for fc in act.fcurves)
    })

# Sort actions by name
audit["actions"].sort(key=lambda a: a["name"])

with open(REPORT_PATH, "w", encoding="utf-8") as f:
    json.dump(audit, f, indent=2)

print(f"AUDIT COMPLETED. Total meshes: {len(audit['mesh_objects'])}, Total verts: {audit['total_vertices']}, Bones: {audit['armature']['bones_count']}, Actions: {len(audit['actions'])}")
