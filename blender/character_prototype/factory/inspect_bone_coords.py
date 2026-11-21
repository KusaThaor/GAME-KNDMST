import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

arm = bpy.data.objects.get("Student_Armature")
bones = arm.data.bones
for b_name in ["Chest", "Neck", "Head", "UpperArm.L", "Forearm.L", "UpperArm.R", "Forearm.R"]:
    b = bones.get(b_name)
    if b:
        print(f"Bone: {b.name}")
        print(f"  Head: ({b.head_local.x:.4f}, {b.head_local.y:.4f}, {b.head_local.z:.4f})")
        print(f"  Tail: ({b.tail_local.x:.4f}, {b.tail_local.y:.4f}, {b.tail_local.z:.4f})")
        print(f"  Parent: {b.parent.name if b.parent else None}")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\bone_coords.txt", "w") as f:
    for b_name in ["Chest", "Neck", "Head", "UpperArm.L", "Forearm.L", "UpperArm.R", "Forearm.R"]:
        b = bones.get(b_name)
        if b:
            f.write(f"Bone: {b.name}\n")
            f.write(f"  Head: ({b.head_local.x:.4f}, {b.head_local.y:.4f}, {b.head_local.z:.4f})\n")
            f.write(f"  Tail: ({b.tail_local.x:.4f}, {b.tail_local.y:.4f}, {b.tail_local.z:.4f})\n")
            f.write(f"  Parent: {b.parent.name if b.parent else None}\n")
