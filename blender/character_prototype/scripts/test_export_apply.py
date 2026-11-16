import bpy
import os

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
TEST_GLB = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants", "test_export_apply.glb")
OUT_LOG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "test_export_apply_log.txt")

bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)

# Select all meshes and armature
arm = bpy.data.objects.get("Student_Armature")
bpy.ops.object.select_all(action="DESELECT")
arm.select_set(True)
for o in bpy.data.objects:
    if o.type == "MESH":
        o.select_set(True)

with open(OUT_LOG, "w", encoding="utf-8") as f:
    f.write("Attempting export with export_apply=True...\n")

try:
    bpy.ops.export_scene.gltf(
        filepath=TEST_GLB,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_animations=True,
        export_skins=True
    )
    with open(OUT_LOG, "a", encoding="utf-8") as f:
        f.write(f"Export finished. Size: {os.path.getsize(TEST_GLB)} bytes\n")
except Exception as e:
    with open(OUT_LOG, "a", encoding="utf-8") as f:
        f.write(f"Export error: {e}\n")

# Now inspect the exported GLB by re-importing into clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=TEST_GLB)

with open(OUT_LOG, "a", encoding="utf-8") as f:
    f.write(f"\nObjects in test_export_apply.glb:\n")
    for o in bpy.data.objects:
        if o.type == 'MESH':
            f.write(f"  {o.name:20}: verts={len(o.data.vertices)}, polys={len(o.data.polygons)}, bbox_dims={[round(x,3) for x in o.dimensions]}\n")
