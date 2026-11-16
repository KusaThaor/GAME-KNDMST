import bpy

arm = bpy.data.objects.get("Student_Armature")
for pb in arm.pose.bones:
    pb.rotation_mode = 'XYZ'

act = bpy.data.actions.get("Action_Raise_Hand")
arm.animation_data.use_nla = False
arm.animation_data.action = act
bpy.context.scene.frame_set(20)
bpy.context.view_layer.update()

pb = arm.pose.bones.get("UpperArm.R")
print("UpperArm.R matrix_basis:", pb.matrix_basis)
with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\test_euler_fix.txt", "w", encoding="utf-8") as f:
    f.write(f"UpperArm.R rotation_mode: {pb.rotation_mode}\n")
    f.write(f"UpperArm.R matrix_basis:\n{pb.matrix_basis}\n")
