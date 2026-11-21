import bpy
import math

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

arm = bpy.data.objects.get("Student_Armature")
for bname in ["Eye.L", "Eye.R"]:
    pb = arm.pose.bones.get(bname)
    b = arm.data.bones.get(bname)
    print(f"\nBone: {bname}")
    print(f"  Head: {b.head}")
    print(f"  Tail: {b.tail}")
    print(f"  Roll: {math.degrees(b.roll):.2f} deg")
    print(f"  Matrix local:\n{b.matrix_local}")

# Test Action_Blink frame 7 (maximum blink, eye scale Z = 0.08)
bpy.context.scene.frame_set(7)
arm.animation_data.action = bpy.data.actions.get("Action_Blink")
bpy.context.view_layer.update()

for bname in ["Eye.L", "Eye.R"]:
    pb = arm.pose.bones.get(bname)
    print(f"Frame 7 {bname} scale: {pb.scale}")
