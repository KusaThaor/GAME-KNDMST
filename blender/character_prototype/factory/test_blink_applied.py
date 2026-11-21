import bpy
import bmesh
import math
import mathutils
import os

BLEND_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
OUT_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\eye_fix_test"

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

for col in bpy.data.collections:
    if "hair" in col.name.lower():
        col.hide_render = True
for o in bpy.data.objects:
    if "hair" in o.name.lower():
        o.hide_render = True

for name in ["Eye_HL2_L", "Eye_HL2_R"]:
    obj = bpy.data.objects.get(name)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)

rot_x = math.radians(-7.5)
rot_z_mag = math.radians(24.0)

for side, sign in [(-1, "L"), (1, "R")]:
    eye_obj = bpy.data.objects.get(f"Eye_{sign}")
    hl_obj = bpy.data.objects.get(f"Eye_HL1_{sign}")
    
    rot = mathutils.Euler((rot_x, 0.0, side * rot_z_mag), 'XYZ')
    rot_mat = rot.to_matrix().to_4x4()
    center_world = mathutils.Vector((side * 0.066, 0.1528, 0.520))
    
    eye_obj.location = center_world
    eye_obj.rotation_euler = rot
    eye_obj.data.clear_geometry()
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(0.032, 0.006, 0.038), verts=bm.verts)
    bm.to_mesh(eye_obj.data)
    bm.free()
    eye_obj.data.update()
    
    bpy.context.view_layer.objects.active = eye_obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    
    vg = eye_obj.vertex_groups.get(f"Eye.{sign}")
    if not vg:
        vg = eye_obj.vertex_groups.new(name=f"Eye.{sign}")
    for v in eye_obj.data.vertices:
        vg.add([v.index], 1.0, "REPLACE")
    
    sub = eye_obj.modifiers.get("Subdiv")
    if not sub:
        sub = eye_obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 2
    
    local_hl_offset = mathutils.Vector((side * 0.004, 0.0022, 0.009))
    hl_world = center_world + rot_mat @ local_hl_offset
    
    hl_obj.location = hl_world
    hl_obj.rotation_euler = rot
    hl_obj.data.clear_geometry()
    bm_hl = bmesh.new()
    bmesh.ops.create_cube(bm_hl, size=1.0)
    bmesh.ops.scale(bm_hl, vec=(0.009, 0.0035, 0.010), verts=bm_hl.verts)
    bm_hl.to_mesh(hl_obj.data)
    bm_hl.free()
    hl_obj.data.update()
    
    bpy.context.view_layer.objects.active = hl_obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    
    vg_hl = hl_obj.vertex_groups.get(f"Eye.{sign}")
    if not vg_hl:
        vg_hl = hl_obj.vertex_groups.new(name=f"Eye.{sign}")
    for v in hl_obj.data.vertices:
        vg_hl.add([v.index], 1.0, "REPLACE")
    
    sub_hl = hl_obj.modifiers.get("Subdiv")
    if not sub_hl:
        sub_hl = hl_obj.modifiers.new("Subdiv", "SUBSURF")
    sub_hl.levels = 1
    sub_hl.render_levels = 2

# Apply Action_Blink at frame 7
arm = bpy.data.objects.get("Student_Armature")
arm.animation_data.use_nla = False
arm.animation_data.action = bpy.data.actions.get("Action_Blink")
bpy.context.scene.frame_set(7)
bpy.context.view_layer.update()

# Camera
cam = bpy.data.objects.get("Camera")
if not cam:
    cam_data = bpy.data.cameras.new("CamFace")
    cam = bpy.data.objects.new("CamFace", cam_data)
    bpy.context.scene.collection.objects.link(cam)
cam.location = (0.0, 0.65, 0.525)
cam.rotation_euler = (math.radians(90), 0, math.radians(180))
cam.data.lens = 70.0
bpy.context.scene.camera = cam

# Lights
for o in list(bpy.data.objects):
    if o.type == 'LIGHT':
        bpy.data.objects.remove(o, do_unlink=True)

light_key_data = bpy.data.lights.new(name="DiagKey", type='AREA')
light_key_data.energy = 50.0
light_key_data.size = 0.5
light_key = bpy.data.objects.new(name="DiagKey", object_data=light_key_data)
light_key.location = (0.3, 0.8, 0.8)
bpy.context.scene.collection.objects.link(light_key)

light_fill_data = bpy.data.lights.new(name="DiagFill", type='AREA')
light_fill_data.energy = 30.0
light_fill_data.size = 0.8
light_fill = bpy.data.objects.new(name="DiagFill", object_data=light_fill_data)
light_fill.location = (-0.4, 0.7, 0.6)
bpy.context.scene.collection.objects.link(light_fill)

light_front_data = bpy.data.lights.new(name="DiagFront", type='AREA')
light_front_data.energy = 25.0
light_front_data.size = 0.6
light_front = bpy.data.objects.new(name="DiagFront", object_data=light_front_data)
light_front.location = (0.0, 0.9, 0.525)
bpy.context.scene.collection.objects.link(light_front)

scene = bpy.context.scene
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.engine = 'BLENDER_EEVEE_NEXT'

out_path = os.path.join(OUT_DIR, "test_blink_applied_transform.png")
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)
print(f"Rendered: {out_path}")
