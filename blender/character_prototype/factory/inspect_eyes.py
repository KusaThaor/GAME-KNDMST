import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

report = []
report.append("=== FACE OBJECTS ===")
for o in bpy.data.objects:
    if "Eye" in o.name or "Head" in o.name or "Blush" in o.name:
        report.append(f"\nObject: {o.name}")
        report.append(f"  Type: {o.type}, Parent: {o.parent.name if o.parent else 'None'}")
        report.append(f"  Loc: ({o.location.x:.5f}, {o.location.y:.5f}, {o.location.z:.5f})")
        report.append(f"  Rot: ({o.rotation_euler.x:.5f}, {o.rotation_euler.y:.5f}, {o.rotation_euler.z:.5f})")
        report.append(f"  Scale: ({o.scale.x:.5f}, {o.scale.y:.5f}, {o.scale.z:.5f})")
        if o.type == 'MESH':
            report.append(f"  Vertices: {len(o.data.vertices)}, Polygons: {len(o.data.polygons)}")
            report.append(f"  Modifiers: {[m.name + ' (' + m.type + ')' for m in o.modifiers]}")
            report.append(f"  Materials: {[m.name for m in o.data.materials if m]}")
            bb = [tuple(v) for v in o.bound_box]
            # world coordinates bounding box
            wbb = [o.matrix_world @ v.co for v in o.data.vertices]
            min_x = min(v.x for v in wbb)
            max_x = max(v.x for v in wbb)
            min_y = min(v.y for v in wbb)
            max_y = max(v.y for v in wbb)
            min_z = min(v.z for v in wbb)
            max_z = max(v.z for v in wbb)
            report.append(f"  World bounds X: [{min_x:.5f}, {max_x:.5f}], Y: [{min_y:.5f}, {max_y:.5f}], Z: [{min_z:.5f}, {max_z:.5f}]")
            for i, v in enumerate(o.data.vertices[:8]):
                wv = o.matrix_world @ v.co
                report.append(f"    v[{i}] local=({v.co.x:.4f}, {v.co.y:.4f}, {v.co.z:.4f}) -> world=({wv.x:.4f}, {wv.y:.4f}, {wv.z:.4f})")

report.append("\n=== MATERIALS & SHADERS ===")
for mat in bpy.data.materials:
    if "Eye" in mat.name or "Skin" in mat.name:
        report.append(f"\nMaterial: {mat.name}")
        report.append(f"  use_nodes: {mat.use_nodes}")
        if mat.use_nodes and mat.node_tree:
            for n in mat.node_tree.nodes:
                if n.type == 'BSDF_PRINCIPLED':
                    base_col = n.inputs['Base Color'].default_value[:]
                    rough = n.inputs['Roughness'].default_value
                    emiss_col = n.inputs.get('Emission Color')
                    emiss_str = n.inputs.get('Emission Strength')
                    report.append(f"  Principled: BaseColor={base_col[:3]}, Rough={rough}")
                    if emiss_col:
                        report.append(f"  Emission: Color={emiss_col.default_value[:3]}, Str={emiss_str.default_value if emiss_str else 'N/A'}")

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\inspect_eyes_out.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(report))
print("Inspection written.")
