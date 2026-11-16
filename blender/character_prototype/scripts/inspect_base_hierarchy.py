import bpy
import os

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
OUT_FILE = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "inspect_base_hierarchy.txt")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("=== INSPECT OBJECTS IN BASE SCENE ===\n")
    arm = bpy.data.objects.get("Student_Armature")
    f.write(f"Armature: {arm.name if arm else 'NONE'}\n")
    if arm:
        f.write(f"Armature loc: {arm.location}, scale: {arm.scale}\n")

    for o in bpy.data.objects:
        if o.type == 'MESH':
            mods = [f"{m.type}:{getattr(m, 'object', None)}" for m in o.modifiers]
            vgs = [vg.name for vg in o.vertex_groups]
            p_name = o.parent.name if o.parent else 'None'
            f.write(f"{o.name:24} | parent={p_name:16} | p_type={o.parent_type:6} | p_bone={o.parent_bone:10} | loc={[round(x,3) for x in o.location]} | scale={[round(x,3) for x in o.scale]} | mods={mods} | vgs={vgs[:3]}\n")
