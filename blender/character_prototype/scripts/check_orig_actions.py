import bpy

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\check_orig_actions.txt", "w", encoding="utf-8") as f:
    f.write("=== ORIGINAL ACTIONS ===\n")
    for act in bpy.data.actions:
        f.write(f"Action: {act.name}, fcurves={len(act.fcurves)}\n")
        for fc in act.fcurves:
            f.write(f"  {fc.data_path}[{fc.array_index}]: keys={[k.co[1] for k in fc.keyframe_points[:3]]}\n")

    arm = bpy.data.objects.get("Student_Armature")
    if arm:
        f.write("\n=== ORIGINAL ARMATURE BONES ===\n")
        for b in arm.data.bones:
            f.write(f"Bone {b.name}: head={list(b.head)}, tail={list(b.tail)}, parent={b.parent.name if b.parent else None}\n")
        f.write("\n=== ORIGINAL POSE BONES ===\n")
        for pb in arm.pose.bones:
            f.write(f"PB {pb.name}: rot_euler={list(pb.rotation_euler)}, quat={list(pb.rotation_quaternion)}, mode={pb.rotation_mode}\n")
