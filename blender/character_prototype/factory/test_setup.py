import bpy
import bmesh
import math
import os
import sys

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
sys.path.insert(0, FACTORY_DIR)

from character_factory import CharacterFactory
import clothing_library

def clear_lights_and_cameras(scene):
    for o in list(scene.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            scene.collection.objects.unlink(o)
            bpy.data.objects.remove(o, do_unlink=True)

def setup_studio(scene, loc, rot, res=(800, 800), lens=50):
    clear_lights_and_cameras(scene)
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.image_settings.file_format = "PNG"

    world = bpy.data.worlds.new("Audit_World")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (0.08, 0.09, 0.12, 1.0)
    scene.world = world

    def add_light(name, energy, rot_deg, color=(1.0, 1.0, 1.0)):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        l.color = color
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj

    add_light("Key", 5.0, (45, 20, -35), (1.0, 0.98, 0.95))
    add_light("Fill", 3.5, (35, -25, 130), (0.92, 0.95, 1.0))
    add_light("Rim", 4.5, (40, 0, -180), (1.0, 0.98, 0.95))
    add_light("Bounce", 2.8, (-60, 10, 15), (1.0, 0.95, 0.92))

    cam_data = bpy.data.cameras.new("AuditCam")
    cam_data.lens = lens
    cam_obj = bpy.data.objects.new("AuditCam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = loc
    cam_obj.rotation_euler = rot
    return cam_obj

print("Test setup ready.")
