import bpy
import os
import sys
import json
import traceback

log_path = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\test_integration_log.txt"

def log(msg):
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(str(msg) + "\n")
    print(msg)

try:
    with open(log_path, "w", encoding="utf-8") as f:
        f.write("Starting test_clothing_integration...\n")

    factory_dir = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
    if factory_dir not in sys.path:
        sys.path.insert(0, factory_dir)

    import clothing_library

    canonical_blend = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
    bpy.ops.wm.open_mainfile(filepath=canonical_blend)
    arm = bpy.data.objects.get("Student_Armature")
    if not arm:
        raise RuntimeError("Armature not found!")

    log(f"Opened base: {canonical_blend}, armature: {arm.name}")

    # Test equipping a complete modular outfit:
    # TOP_001 (White Shirt)
    # BOTTOM_004 (Pleated Skirt)
    # FOOTWEAR_001 (White Sneakers)
    # SOCKS_003 (Knee-high socks)
    # Skin: #fae3d2
    created = clothing_library.equip_modular_character_clothing(
        arm=arm,
        char_id="test_mod",
        skin_hex="#fae3d2",
        top_id="TOP_001",
        bottom_id="BOTTOM_004",
        footwear_id="FOOTWEAR_001",
        socks_id="SOCKS_003"
    )

    log(f"Successfully equipped modular clothing! Created {len(created)} objects:")
    for o in created:
        log(f"  - {o.name} (verts: {len(o.data.vertices)}, mat: {[m.name for m in o.data.materials if m]})")

    # Select all meshes and armature for export
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    mesh_count = 0
    for o in bpy.data.objects:
        if o.type == 'MESH':
            o.hide_render = False
            o.hide_viewport = False
            o.select_set(True)
            mesh_count += 1

    log(f"Selected {mesh_count} meshes and armature for export")

    test_glb = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\test_modular_export.glb"
    export_settings = {
        "filepath": test_glb,
        "export_format": "GLB",
        "use_selection": True,
        "export_apply": True,
        "export_morph": True,
        "export_animations": True,
        "export_skins": True,
        "export_all_influences": True,
        "export_yup": True
    }
    bpy.ops.export_scene.gltf(**export_settings)
    size = os.path.getsize(test_glb)
    log(f"EXPORT GLB SUCCESS! Size: {size:,} bytes ({size/1024:.1f} KB)")

    # Also test Pinafore with Sandals & No Socks
    created2 = clothing_library.equip_modular_character_clothing(
        arm=arm,
        char_id="test_pinafore",
        skin_hex="#f4cfae",
        top_id="TOP_005",
        bottom_id="BOTTOM_008",
        footwear_id="FOOTWEAR_003",
        socks_id="SOCKS_004"
    )
    log(f"Successfully tested Pinafore + Sandals! Created {len(created2)} objects.")

    log("ALL TESTS COMPLETED SUCCESSFULLY!")

except Exception as e:
    log("ERROR OCCURRED:")
    log(traceback.format_exc())
