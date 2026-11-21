import sys
import traceback

try:
    import bpy
    import bmesh
    import math
    import mathutils
    import os

    PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
    FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
    CANONICAL_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")

    if FACTORY_DIR not in sys.path:
        sys.path.insert(0, FACTORY_DIR)

    from character_factory import CharacterFactory
    import clothing_library

    factory = CharacterFactory(CANONICAL_BLEND)
    factory.load_base()
    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", "measure")

    # Inspect objects
    objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    lines = []
    for o in objs:
        bb = [o.matrix_world @ mathutils.Vector(corner) for corner in o.bound_box] if hasattr(o, "bound_box") else []
        if bb:
            min_x = min(v.x for v in bb)
            max_x = max(v.x for v in bb)
            min_y = min(v.y for v in bb)
            max_y = max(v.y for v in bb)
            min_z = min(v.z for v in bb)
            max_z = max(v.z for v in bb)
            lines.append(f"{o.name:25} X=[{min_x:+.3f}, {max_x:+.3f}] Y=[{min_y:+.3f}, {max_y:+.3f}] Z=[{min_z:+.3f}, {max_z:+.3f}]")

    with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\scratch_measure.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
except Exception as e:
    with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\scratch_measure.txt", "w", encoding="utf-8") as f:
        f.write(traceback.format_exc())
