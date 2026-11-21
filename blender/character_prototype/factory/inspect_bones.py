import bpy

blend = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
bpy.ops.wm.open_mainfile(filepath=blend)
arm = bpy.data.objects.get("Student_Armature")
lines = []
for b in arm.data.bones:
    if any(k in b.name for k in ["Thigh", "Shin", "Foot", "Hips", "Spine"]):
        lines.append(f"BONE {b.name}: head={b.head_local}, tail={b.tail_local}")

legs = bpy.data.objects.get("Character_Torso_Legs")
if legs:
    zs = [v.co.z for v in legs.data.vertices]
    lines.append(f"ORIGINAL LEGS: min_z={min(zs):.3f}, max_z={max(zs):.3f}")

out_path = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\inspect_bones_out.txt"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
