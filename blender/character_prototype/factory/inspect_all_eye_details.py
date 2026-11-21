import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

print("=== ALL OBJECTS & MODIFIERS ===")
for o in bpy.data.objects:
    if o.type == 'MESH':
        print(f"\nObject: {o.name}")
        for m in o.modifiers:
            print(f"  Modifier: {m.name} ({m.type})")
            if m.type == 'SUBSURF':
                print(f"    levels={m.levels}, render_levels={m.render_levels}")
            elif m.type == 'SOLIDIFY':
                print(f"    thickness={m.thickness}, offset={m.offset}")
        print(f"  Materials: {[m.name for m in o.data.materials if m]}")
        for mat in o.data.materials:
            if mat and mat.use_nodes:
                for n in mat.node_tree.nodes:
                    if n.type == 'BSDF_PRINCIPLED':
                        spec = n.inputs.get('Specular IOR Level') or n.inputs.get('Specular')
                        rough = n.inputs.get('Roughness')
                        print(f"    Mat '{mat.name}': Spec={spec.default_value if spec else 'N/A'}, Rough={rough.default_value if rough else 'N/A'}")

print("\n=== SHAPE KEYS ===")
for o in bpy.data.objects:
    if o.type == 'MESH' and o.data.shape_keys:
        print(f"Object {o.name} has shape keys:")
        for kb in o.data.shape_keys.key_blocks:
            print(f"  - {kb.name}: value={kb.value}")
