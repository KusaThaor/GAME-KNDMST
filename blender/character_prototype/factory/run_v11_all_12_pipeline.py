"""
=============================================================================
FULL 12-HAIRSTYLE PIPELINE V11
- Builds all 12 hairstyles on the canonical chibi base character
- Renders 4 angles per hairstyle: Front, Three-Quarter, Side, Back (48 renders)
- Exports 12 production GLBs
- Saves 12 source .blend files
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import json
import shutil
from mathutils import Vector, Euler

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import character_factory
import rebuild_v11_all_12_hairstyles as hair_v11

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "all_12_v11")
GLB_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_glb")
BLEND_DIR = os.path.join(FACTORY_DIR, "outputs", "hairstyles_blend")

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(GLB_DIR, exist_ok=True)
os.makedirs(BLEND_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# STUDIO ENVIRONMENT
# ---------------------------------------------------------------------------

def setup_chibi_studio(scene, res=(768, 896)):
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)
            
    cam_data = bpy.data.cameras.new("Studio_Cam")
    cam_data.lens = 60
    cam = bpy.data.objects.new("Studio_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    
    scene.world = bpy.data.worlds.new("Studio_World")
    scene.world.use_nodes = True
    nodes = scene.world.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    scene.world.node_tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bg.inputs["Color"].default_value = (0.87, 0.88, 0.90, 1.0)
    bg.inputs["Strength"].default_value = 0.92
    
    def add_light(name, ltype, energy, loc, rot_deg, color=(1,1,1), size=0.8):
        l = bpy.data.lights.new(name, ltype)
        l.energy = energy
        l.color = color
        if ltype == 'AREA':
            l.size = size
        obj = bpy.data.objects.new(name, l)
        obj.location = loc
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        scene.collection.objects.link(obj)
        return obj
        
    add_light("Key_Light", 'AREA', 45.0, (0.42, 0.90, 0.80), (48, 0, 22), (1.0, 0.98, 0.95), size=1.0)
    add_light("Fill_Light", 'AREA', 32.0, (-0.45, 0.85, 0.65), (52, 0, -28), (0.95, 0.97, 1.0), size=1.1)
    add_light("Front_Eye_Light", 'AREA', 20.0, (0.0, 1.00, 0.53), (90, 0, 0), (1.0, 0.98, 0.96), size=0.8)
    add_light("Rim_Back_Light", 'AREA', 30.0, (0.0, -0.90, 0.85), (-50, 0, 180), (1.0, 1.0, 1.0), size=0.9)
    
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    return cam

# ---------------------------------------------------------------------------
# MAIN BATCH EXECUTION
# ---------------------------------------------------------------------------

def run():
    print("[Pipeline] Starting Full 12-Hairstyle V11 Build & Render...")
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    manifest = {}

    views = [
        ("front", (0.0, 1.05, 0.535), (math.radians(90), 0, math.radians(180)), 60),
        ("three_quarter", (0.74, 0.74, 0.560), (math.radians(82), 0, math.radians(135)), 60),
        ("side", (1.05, 0.0, 0.535), (math.radians(90), 0, math.radians(90)), 60),
        ("back", (0.0, -1.05, 0.535), (math.radians(90), 0, 0), 60),
    ]

    for hair_id in sorted(hair_v11.HAIRSTYLE_DISPATCHER.keys()):
        meta = hair_v11.HAIRSTYLE_METADATA[hair_id]
        print(f"\n=======================================================")
        print(f"PROCESSING {hair_id} — {meta['name']}")
        print(f"=======================================================")
        
        char_tag = f"v11_{hair_id.lower()}"
        factory.load_base()
        factory.isolate_materials(char_tag)
        factory.apply_skin_tone("SKIN_02", char_tag)
        
        # Thoroughly clean all previous hair objects
        for o in list(bpy.data.objects):
            if o.name.startswith("Hair_"):
                bpy.data.objects.remove(o, do_unlink=True)
                
        arm = factory.arm
        build_func = hair_v11.HAIRSTYLE_DISPATCHER[hair_id]
        color = meta["color"]
        if "tie" in meta:
            hair_obj = build_func(arm, char_id=char_tag, color_hex=color, tie_hex=meta["tie"])
        else:
            hair_obj = build_func(arm, char_id=char_tag, color_hex=color)
            
        print(f"[Built] {hair_obj.name}: {len(hair_obj.data.polygons)} quads")
        
        clothing_spec = {
            "top_id": "TOP_001",
            "bottom_id": "BOTTOM_001",
            "footwear_id": "FOOTWEAR_001",
            "socks_id": "SOCKS_001"
        }
        factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
        factory.equip_accessories(["ACC_002"], char_tag)
        
        # Save source .blend
        blend_path = os.path.join(BLEND_DIR, f"{hair_id.lower()}_v11_source.blend")
        blend_preview_path = os.path.join(PREVIEWS_DIR, f"{hair_id.lower()}_v11_source.blend")
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        shutil.copyfile(blend_path, blend_preview_path)
        print(f"  Saved Blend -> {blend_path}")
        
        # Export GLB
        glb_name = f"character_{hair_id.lower()}_v11.glb"
        glb_path = os.path.join(GLB_DIR, glb_name)
        glb_preview_path = os.path.join(PREVIEWS_DIR, glb_name)
        glb_size = factory.export_glb(glb_path)
        shutil.copyfile(glb_path, glb_preview_path)
        print(f"  Exported GLB -> {glb_path} ({glb_size / 1024:.1f} KB)")
        
        # Studio setup and renders
        scene = bpy.context.scene
        cam = setup_chibi_studio(scene, res=(768, 896))
        
        rendered_images = {}
        for vname, loc, rot, lens in views:
            cam.location = loc
            cam.rotation_euler = rot
            cam.data.lens = lens
            img_filename = f"{hair_id.lower()}_{vname}.png"
            img_path = os.path.join(PREVIEWS_DIR, img_filename)
            scene.render.filepath = img_path
            bpy.ops.render.render(write_still=True)
            rendered_images[vname] = img_filename
            print(f"  Rendered {vname} -> {img_filename}")
            
        manifest[hair_id] = {
            "name": meta["name"],
            "glb": glb_name,
            "glb_size_kb": round(glb_size / 1024, 1),
            "renders": rendered_images,
            "quads": len(hair_obj.data.polygons),
            "color": color
        }
        
    manifest_path = os.path.join(PREVIEWS_DIR, "v11_library_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[Done] Pipeline finished successfully! Manifest saved to {manifest_path}")

if __name__ == "__main__":
    run()
