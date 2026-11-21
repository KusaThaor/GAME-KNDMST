import bpy
import mathutils
import math

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

head = bpy.data.objects.get("Body_Head")
mw = head.matrix_world
imw = mw.inverted()

# Evaluate head mesh with modifiers if any
depsgraph = bpy.context.evaluated_depsgraph_get()
head_eval = head.evaluated_get(depsgraph)

# Check eye center position
eye_l = bpy.data.objects.get("Eye_L")
print(f"Current Eye_L location: {eye_l.location}")
print(f"Current Eye_L scale: {eye_l.scale}")
print(f"Current Eye_L rotation: {eye_l.rotation_euler}")

# Sample surface normal of head at Eye_L location
ray_origin = mathutils.Vector((-0.066, 0.300, 0.520))
ray_dir = mathutils.Vector((0, -1.0, 0))
hit, loc, norm, face_idx = head.ray_cast(imw @ ray_origin, imw.to_3x3() @ ray_dir)

if hit:
    w_hit = mw @ loc
    w_norm = (mw.to_3x3() @ norm).normalized()
    print(f"Head surface at Eye_L center: {w_hit}")
    print(f"Head surface normal: {w_norm}")
    # Calculate Euler angles corresponding to this normal (pointing along +Y)
    # Default forward is (0, 1, 0)
    rot_quat = mathutils.Vector((0, 1, 0)).rotation_difference(w_norm)
    rot_euler = rot_quat.to_euler('XYZ')
    print(f"Rotation matching normal (deg): ({math.degrees(rot_euler.x):.2f}, {math.degrees(rot_euler.y):.2f}, {math.degrees(rot_euler.z):.2f})")
