import bpy

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

def analyze_mesh(name):
    obj = bpy.data.objects.get(name)
    if not obj:
        print(f"Object {name} not found!")
        return
    mw = obj.matrix_world
    verts = [mw @ v.co for v in obj.data.vertices]
    xs = [v.x for v in verts]
    ys = [v.y for v in verts]
    zs = [v.z for v in verts]
    print(f"\n--- {name} ---")
    print(f"Location: {obj.location}")
    print(f"Scale: {obj.scale}")
    print(f"Modifiers: {[m.name for m in obj.modifiers]}")
    print(f"Materials: {[m.name for m in obj.data.materials if m]}")
    print(f"X range: [{min(xs):.5f}, {max(xs):.5f}], center: {sum(xs)/len(xs):.5f}")
    print(f"Y range: [{min(ys):.5f}, {max(ys):.5f}], center: {sum(ys)/len(ys):.5f}")
    print(f"Z range: [{min(zs):.5f}, {max(zs):.5f}], center: {sum(zs)/len(zs):.5f}")

for name in ["Body_Head", "Eye_L", "Eye_HL1_L", "Eye_HL2_L", "Eye_R", "Eye_HL1_R", "Eye_HL2_R"]:
    analyze_mesh(name)
