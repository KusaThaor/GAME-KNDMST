import bpy
import bmesh
import math
import os
import sys

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
CANONICAL_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def render_skin_palette_lineup():
    print("[Render] Creating 5 Skin Tones Lineup...")
    bpy.ops.wm.open_mainfile(filepath=CANONICAL_BLEND)
    scene = bpy.context.scene

    # Camera
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 45
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = (0.0, 3.4, 0.45)
    cam_obj.rotation_euler = (math.radians(88), 0, math.radians(180))

    # World
    scene.world = bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.06, 0.07, 0.09, 1.0)
        bg.inputs["Strength"].default_value = 0.9

    # Lights
    l_data = bpy.data.lights.new("Sun", "SUN")
    l_data.energy = 5.0
    l_obj = bpy.data.objects.new("Sun", l_data)
    scene.collection.objects.link(l_obj)
    l_obj.rotation_euler = (math.radians(50), math.radians(20), math.radians(-35))

    skin_tones = [
        ("SKIN_01", "#fae3d2", -0.70),
        ("SKIN_02", "#f4cfae", -0.35),
        ("SKIN_03", "#e5b88f",  0.00),
        ("SKIN_04", "#d5a378",  0.35),
        ("SKIN_05", "#b87b52",  0.70)
    ]

    base_objects = [o for o in bpy.data.objects if o.type == 'MESH' or o.type == 'ARMATURE']

    # For center character (SKIN_03), just set material
    mat_center = bpy.data.materials.get("M_Skin")
    if mat_center:
        mat_center.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value = hex_to_lin("#e5b88f")

    # Duplicate for others
    for skin_id, hex_c, x_offset in skin_tones:
        if x_offset == 0:
            continue
        new_mat = bpy.data.materials.new(name=f"M_Skin_{skin_id}")
        new_mat.use_nodes = True
        bsdf = new_mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Base Color"].default_value = hex_to_lin(hex_c)
        bsdf.inputs["Roughness"].default_value = 0.62

        for o in base_objects:
            dup = o.copy()
            if o.data:
                dup.data = o.data.copy()
            scene.collection.objects.link(dup)
            dup.location.x += x_offset
            if dup.type == 'MESH':
                for i in range(len(dup.data.materials)):
                    if dup.data.materials[i] and "Skin" in dup.data.materials[i].name:
                        dup.data.materials[i] = new_mat

    scene.render.resolution_x = 1280
    scene.render.resolution_y = 640
    scene.render.image_settings.file_format = "PNG"
    out_path = os.path.join(PREVIEWS_DIR, "skin_tone_comparison_sheet.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Saved: {out_path}")

if __name__ == "__main__":
    render_skin_palette_lineup()
