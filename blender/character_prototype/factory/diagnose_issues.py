import bpy
import os
import sys

sys.path.insert(0, r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory")
from character_factory import CharacterFactory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
factory = CharacterFactory(CANONICAL_BLEND)
factory.load_base()

report = []
report.append("=== BASE SCENE MESHES ===")
for name in ["Character_Torso_Legs", "Character_Arm_L", "Character_Arm_R"]:
    o = bpy.data.objects.get(name)
    if o:
        verts = o.data.vertices
        report.append(f"{name}: verts={len(verts)}, polygons={len(o.data.polygons)}")
        # top 5 highest z verts
        high_z = sorted(verts, key=lambda v: v.co.z, reverse=True)[:10]
        report.append(f"  Highest Z vertices:")
        for v in high_z:
            report.append(f"    idx={v.index}, co=({v.co.x:.4f}, {v.co.y:.4f}, {v.co.z:.4f})")

# Now equip modular clothing
clothing_spec = {
    "top_id": "TOP_001",
    "bottom_id": "BOTTOM_001",
    "footwear_id": "FOOTWEAR_001",
    "socks_id": "SOCKS_001"
}
factory.equip_modular_clothing(clothing_spec, "#f4cfae", "diag")

report.append("\n=== AFTER MODULAR CLOTHING EQUIPPED ===")
for o in bpy.data.objects:
    if o.type == 'MESH':
        report.append(f"Mesh Object: {o.name}")
        verts = o.data.vertices
        min_z = min(v.co.z for v in verts)
        max_z = max(v.co.z for v in verts)
        min_y = min(v.co.y for v in verts)
        max_y = max(v.co.y for v in verts)
        min_x = min(v.co.x for v in verts)
        max_x = max(v.co.x for v in verts)
        report.append(f"  X: [{min_x:.4f}, {max_x:.4f}], Y: [{min_y:.4f}, {max_y:.4f}], Z: [{min_z:.4f}, {max_z:.4f}]")

# Check why white rectangle is visible on front of shoe
# Check vertices of Bottom_Mesh vs Socks_Mesh vs Footwear_Mesh around Z in [0.03, 0.08]
report.append("\n=== LOWER LEG INTERSECTION AUDIT (Z between 0.03 and 0.08) ===")
bottom = bpy.data.objects.get("Bottom_Mesh")
socks = bpy.data.objects.get("Socks_Mesh")
footwear = bpy.data.objects.get("Footwear_Mesh")

if bottom and (socks or footwear):
    for z_test in [0.038, 0.045, 0.055, 0.065, 0.072]:
        report.append(f"\n--- At Z ~ {z_test:.3f} ---")
        # Find vertices near this Z
        b_v = [v for v in bottom.data.vertices if abs(v.co.z - z_test) < 0.005 and v.co.x < 0]
        if b_v:
            max_y_b = max(v.co.y for v in b_v)
            min_y_b = min(v.co.y for v in b_v)
            report.append(f"  Bottom_Mesh (Left leg): Y range = [{min_y_b:.4f}, {max_y_b:.4f}]")
        if socks:
            s_v = [v for v in socks.data.vertices if abs(v.co.z - z_test) < 0.005 and v.co.x < 0]
            if s_v:
                max_y_s = max(v.co.y for v in s_v)
                min_y_s = min(v.co.y for v in s_v)
                report.append(f"  Socks_Mesh (Left leg): Y range = [{min_y_s:.4f}, {max_y_s:.4f}]")
                if b_v and max_y_s > max_y_b:
                    report.append(f"  >>> SOCKS PROTRUDING FORWARD BY {(max_y_s - max_y_b)*1000:.2f} mm! <<<")
        if footwear:
            f_v = [v for v in footwear.data.vertices if abs(v.co.z - z_test) < 0.005 and v.co.x < 0]
            if f_v:
                max_y_f = max(v.co.y for v in f_v)
                min_y_f = min(v.co.y for v in f_v)
                report.append(f"  Footwear_Mesh (Left leg): Y range = [{min_y_f:.4f}, {max_y_f:.4f}]")
                if b_v and max_y_f > max_y_b:
                    report.append(f"  >>> FOOTWEAR PROTRUDING FORWARD BY {(max_y_f - max_y_b)*1000:.2f} mm! <<<")

out_file = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\diagnose_out.txt"
with open(out_file, "w", encoding="utf-8") as f:
    f.write("\n".join(report))
print("Diagnose finished.")
