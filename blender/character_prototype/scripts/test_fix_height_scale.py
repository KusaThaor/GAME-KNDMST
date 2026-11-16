import bpy
import os
import math

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
TEST_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants")
OUT_LOG = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "test_height_fix.log")

with open(OUT_LOG, "w", encoding="utf-8") as f:
    f.write("TESTING HEIGHT SCALING METHODS\n")

def test_scale(scale_val, prefix):
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
    arm = bpy.data.objects.get("Student_Armature")
    
    # Method:
    # 1. Scale Armature object
    arm.scale = (scale_val, scale_val, scale_val)
    arm.location = arm.location * scale_val
    
    # 2. For every mesh, scale location from (0,0,0) and scale dimensions
    for o in bpy.data.objects:
        if o.type == 'MESH':
            o.location = o.location * scale_val
            o.scale = (scale_val, scale_val, scale_val)
            
    blend_path = os.path.join(TEST_DIR, f"{prefix}.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    
    # Export GLB
    temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
    if temp_act:
        bpy.data.actions.remove(temp_act)
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.select_set(True)
    glb_path = os.path.join(TEST_DIR, f"{prefix}.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_animations=True,
        export_all_influences=True
    )
    with open(OUT_LOG, "a", encoding="utf-8") as f:
        f.write(f"Exported {prefix}: {os.path.getsize(glb_path)/1024:.1f} KB\n")

test_scale(0.90, "student_height_90_test")
test_scale(1.10, "student_height_110_test")
