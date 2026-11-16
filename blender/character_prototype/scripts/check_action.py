import bpy

arm = bpy.data.objects.get("Student_Armature")
with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\check_action_out.txt", "w", encoding="utf-8") as f:
    f.write(f"Armature object: {arm}\n")
    if arm and arm.animation_data:
        f.write(f"NLA tracks: {len(arm.animation_data.nla_tracks)}\n")
        f.write(f"use_nla: {arm.animation_data.use_nla}\n")
        for track in arm.animation_data.nla_tracks:
            f.write(f"  Track: {track.name}, strips: {[s.name + '(' + s.action.name + ')' for s in track.strips]}\n")

    act = bpy.data.actions.get("Action_Raise_Hand")
    f.write(f"Action_Raise_Hand: {act}\n")
    if act:
        f.write(f"Fcurves count: {len(act.fcurves)}\n")
        for fc in act.fcurves[:15]:
            f.write(f"  {fc.data_path}[{fc.array_index}]\n")

    # Now assign action and test frame
    arm.animation_data.use_nla = False
    arm.animation_data.action = act
    bpy.context.scene.frame_set(20)
    bpy.context.view_layer.update()

    pb = arm.pose.bones.get("UpperArm.R")
    if pb:
        f.write(f"UpperArm.R rotation_mode: {pb.rotation_mode}\n")
        f.write(f"UpperArm.R rotation_quaternion: {list(pb.rotation_quaternion)}\n")
        f.write(f"UpperArm.R rotation_euler: {list(pb.rotation_euler)}\n")
        f.write(f"UpperArm.R location: {list(pb.location)}\n")

    # Let's check modifiers on meshes
    torso = bpy.data.objects.get("Character_Torso_Legs")
    if torso:
        f.write(f"Torso modifiers: {[m.name + '(' + m.type + ')' for m in torso.modifiers]}\n")
        arm_mod = torso.modifiers.get("Armature")
        if arm_mod:
            f.write(f"Armature mod object: {arm_mod.object}\n")
            f.write(f"Armature mod show_viewport: {arm_mod.show_viewport}, show_render: {arm_mod.show_render}\n")
