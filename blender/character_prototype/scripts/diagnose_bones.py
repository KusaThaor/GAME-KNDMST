import bpy

arm = bpy.data.objects.get("Student_Armature")
print("=== REST POSE EDIT BONES ===")
for b in arm.data.bones:
    print(f"Bone: {b.name}, head: {list(b.head)}, tail: {list(b.tail)}")

print("\n=== POSE BONES (REST / FRAME 1 NO ACTION) ===")
arm.animation_data.action = None
bpy.context.scene.frame_set(1)
bpy.context.view_layer.update()
for pb in arm.pose.bones:
    if any(abs(v) > 0.001 for v in pb.rotation_euler) or any(abs(v) > 0.001 for v in pb.location):
        print(f"PoseBone non-zero: {pb.name}, rot_euler: {list(pb.rotation_euler)}, loc: {list(pb.location)}")

print("\n=== POSE BONES WITH Action_Idle FRAME 1 ===")
idle = bpy.data.actions.get("Action_Idle")
arm.animation_data.action = idle
bpy.context.scene.frame_set(1)
bpy.context.view_layer.update()
for pb in arm.pose.bones:
    if any(abs(v) > 0.001 for v in pb.rotation_euler) or any(abs(v) > 0.001 for v in pb.location):
        print(f"Idle frame 1: {pb.name}, rot_euler: {list(pb.rotation_euler)}, loc: {list(pb.location)}")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\diagnose_bones.txt", "w", encoding="utf-8") as f:
    f.write("=== BONES DIAGNOSIS ===\n")
    for b in arm.data.bones:
        f.write(f"EditBone: {b.name}, head={list(b.head)}, tail={list(b.tail)}\n")
    f.write("\n=== POSE BONES Action_Idle Frame 1 ===\n")
    for pb in arm.pose.bones:
        f.write(f"PB {pb.name}: rot_euler={list(pb.rotation_euler)}, quat={list(pb.rotation_quaternion)}, loc={list(pb.location)}\n")

    f.write("\n=== MESH OBJECT LOCATIONS ===\n")
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            f.write(f"Mesh {obj.name}: loc={list(obj.location)}, rot={list(obj.rotation_euler)}, scale={list(obj.scale)}\n")
