import bpy
import os
import math

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_repair")
os.makedirs(PREVIEWS_DIR, exist_ok=True)

def setup_studio():
    scene = bpy.context.scene
    cam_obj = bpy.data.objects.get("Cam")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam")
        cam_data.lens = 55
        cam_obj = bpy.data.objects.new("Cam", cam_data)
        scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    if not scene.world:
        scene.world = bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
        bg_node.inputs["Strength"].default_value = 0.85

    def ensure_sun(name, energy, rot):
        obj = bpy.data.objects.get(name)
        if not obj:
            l = bpy.data.lights.new(name, "SUN")
            obj = bpy.data.objects.new(name, l)
            scene.collection.objects.link(obj)
        obj.data.energy = energy
        obj.rotation_euler = (math.radians(rot[0]), math.radians(rot[1]), math.radians(rot[2]))
        return obj

    ensure_sun("Key", 4.8, (52, 22, -32))
    ensure_sun("Fill", 2.8, (40, -30, 145))
    ensure_sun("Bounce", 1.6, (-45, 15, 20))
    ensure_sun("Rim", 3.2, (30, 15, 35))

    scene.render.resolution_x = 720
    scene.render.resolution_y = 900
    scene.render.image_settings.file_format = "PNG"
    return cam_obj

def render_model(glb_path, out_prefix):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    cam = setup_studio()
    
    # 1. Front View
    cam.location = (0.0, -1.75, 0.50)
    cam.rotation_euler = (math.radians(88), 0, 0)
    bpy.context.scene.render.filepath = os.path.join(PREVIEWS_DIR, f"{out_prefix}_front.png")
    bpy.ops.render.render(write_still=True)
    
    # 2. Side View (profile)
    cam.location = (1.75, 0.0, 0.50)
    cam.rotation_euler = (math.radians(88), 0, math.radians(90))
    bpy.context.scene.render.filepath = os.path.join(PREVIEWS_DIR, f"{out_prefix}_side.png")
    bpy.ops.render.render(write_still=True)

    # 3. Back View
    cam.location = (0.0, 1.75, 0.50)
    cam.rotation_euler = (math.radians(88), 0, math.radians(180))
    bpy.context.scene.render.filepath = os.path.join(PREVIEWS_DIR, f"{out_prefix}_back.png")
    bpy.ops.render.render(write_still=True)
    
    # 4. Three-Quarter View
    cam.location = (1.20, -1.20, 0.60)
    cam.rotation_euler = (math.radians(75), 0, math.radians(45))
    bpy.context.scene.render.filepath = os.path.join(PREVIEWS_DIR, f"{out_prefix}_three_quarter.png")
    bpy.ops.render.render(write_still=True)
    
    print(f"Rendered all 4 angles for {out_prefix}")

# Render broken original GLB
render_model(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\assets\characters\vietnamese_student.glb", "broken_original")

# Render fixed GLB
render_model(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\test_variants\test_export_apply.glb", "repaired_glb")

print("All diagnostic renders finished!")
