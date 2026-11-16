import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\assets\characters\vietnamese_student_fixed.glb")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\check_ico_role.txt", "w") as f:
    ico = bpy.data.objects.get("Icosphere")
    f.write(f"Icosphere in objects: {ico is not None}\n")
    if ico:
        f.write(f"Icosphere users: {ico.users}, data users: {ico.data.users}\n")
        f.write(f"Icosphere in scene: {'Icosphere' in bpy.context.scene.objects}\n")
    arm = bpy.data.objects.get("Student_Armature")
    if arm:
        for b in arm.pose.bones:
            if b.custom_shape:
                f.write(f"Bone {b.name} custom shape: {b.custom_shape.name}\n")
