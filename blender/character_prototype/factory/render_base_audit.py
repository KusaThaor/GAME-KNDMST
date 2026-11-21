import bpy
import math

bpy.ops.wm.open_mainfile(filepath=r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend")

for o in bpy.data.objects:
    if o.name.startswith("Hair_") or o.name.startswith("Eye") or o.name in ["Blush_L", "Blush_R", "Mouth", "Nose", "Shirt_Collar"]:
        o.hide_render = True

# Setup camera & light
scene = bpy.context.scene
scene.render.resolution_x = 800
scene.render.resolution_y = 800

for o in list(scene.objects):
    if o.type in ('CAMERA', 'LIGHT'):
        scene.collection.objects.unlink(o)
        bpy.data.objects.remove(o, do_unlink=True)

world = bpy.data.worlds.new("World_Audit")
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.1, 0.12, 0.15, 1.0)
scene.world = world

light = bpy.data.lights.new("Sun", "SUN")
light.energy = 4.0
l_obj = bpy.data.objects.new("Sun", light)
scene.collection.objects.link(l_obj)
l_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(-30))

cam = bpy.data.cameras.new("Cam")
cam_obj = bpy.data.objects.new("Cam", cam)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

cam_obj.location = (0, 1.2, 0.35)
cam_obj.rotation_euler = (math.radians(90), 0, math.radians(180))

out_dir = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews"
scene.render.filepath = f"{out_dir}/audit_base_front.png"
bpy.ops.render.render(write_still=True)

cam_obj.location = (-0.8, 0.8, 0.45)
cam_obj.rotation_euler = (math.radians(75), 0, math.radians(-135))
scene.render.filepath = f"{out_dir}/audit_base_3quarter.png"
bpy.ops.render.render(write_still=True)

cam_obj.location = (0, -1.2, 0.35)
cam_obj.rotation_euler = (math.radians(90), 0, 0)
scene.render.filepath = f"{out_dir}/audit_base_back.png"
bpy.ops.render.render(write_still=True)

print("Rendered base audits.")
