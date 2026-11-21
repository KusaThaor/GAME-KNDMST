import bpy
import bmesh
import math
import mathutils
import os

BLEND_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
OUT_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\eye_fix_test"
os.makedirs(OUT_DIR, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

# Hide hair collection or objects with Hair in name
for col in bpy.data.collections:
    if "hair" in col.name.lower():
        col.hide_render = True
for o in bpy.data.objects:
    if "hair" in o.name.lower():
        o.hide_render = True

# Materials
mat_black = bpy.data.materials.get("M_Eye_Black")
mat_hl = bpy.data.materials.get("M_Eye_Highlight")

# Adjust material roughness/specular on M_Eye_Black if needed
if mat_black and mat_black.use_nodes:
    for n in mat_black.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            # Slightly softer specular so it doesn't create harsh white band across pupil
            if 'Specular IOR Level' in n.inputs:
                n.inputs['Specular IOR Level'].default_value = 0.25
            elif 'Specular' in n.inputs:
                n.inputs['Specular'].default_value = 0.25
            n.inputs['Roughness'].default_value = 0.35

# Adjust M_Eye_Highlight
if mat_hl and mat_hl.use_nodes:
    for n in mat_hl.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Roughness'].default_value = 0.20
            # Keep pure white emission for cute sparkle
            if 'Emission Strength' in n.inputs:
                n.inputs['Emission Strength'].default_value = 1.0

# Remove old Eye_HL2 objects (the detached dots)
for name in ["Eye_HL2_L", "Eye_HL2_R"]:
    obj = bpy.data.objects.get(name)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)

# Test updating Eye_L, Eye_R and Eye_HL1_L, Eye_HL1_R
# Parameters:
# eye_x = 0.066, eye_z = 0.520
# Head surface Y at center is 0.15233
# Face normal tilts: rot_z = ±24.0 deg, rot_x = -7.5 deg
# We position eye center so front protrudes ~0.0025 beyond head skin

rot_x = math.radians(-7.5)
rot_z_mag = math.radians(24.0)

for side, sign in [(-1, "L"), (1, "R")]:
    eye_obj = bpy.data.objects.get(f"Eye_{sign}")
    hl_obj = bpy.data.objects.get(f"Eye_HL1_{sign}")
    
    rot = mathutils.Euler((rot_x, 0.0, side * rot_z_mag), 'XYZ')
    rot_mat = rot.to_matrix().to_4x4()
    
    # Base eye center in world
    center_world = mathutils.Vector((side * 0.066, 0.1528, 0.520))
    
    # Update Eye object
    eye_obj.location = center_world
    eye_obj.rotation_euler = rot
    # Reset mesh geometry to standard unit cube scaled inside or apply scale
    # Let's inspect eye_obj mesh
    eye_obj.data.clear_geometry()
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    # Scale cube in local coordinates:
    # width X = 0.032, thickness Y = 0.006, height Z = 0.038
    bmesh.ops.scale(bm, vec=(0.032, 0.006, 0.038), verts=bm.verts)
    bm.to_mesh(eye_obj.data)
    bm.free()
    eye_obj.data.update()
    
    # Subsurf modifier
    sub = eye_obj.modifiers.get("Subdiv")
    if not sub:
        sub = eye_obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 2
    
    # Update HL1 object
    # In local space of the eye:
    # We want highlight at upper-outer corner (or upper-center)
    # Local +Z is up, local -X is outer for L (since side=-1, rot_z = -24 deg means local +X points toward nose)
    # So outer is -X in local space!
    # For Right eye (side=+1, rot_z = +24 deg), local +X points toward ear or nose?
    # Let's check: rot around Z by +24 deg: (1, 0, 0) -> (cos 24, sin 24, 0).
    # Since right eye is at +0.066, (cos 24, sin 24, 0) points OUTWARDS towards the right ear!
    # Let's be very precise:
    # We want highlight placed in the upper portion, slightly towards outer side:
    # Local Z offset: +0.009
    # Local X offset: -0.004 for L, +0.004 for R (outward towards ear)
    # Local Y offset: +0.0022 (front surface of eye)
    local_hl_offset = mathutils.Vector((side * 0.004, 0.0022, 0.009))
    hl_world = center_world + rot_mat @ local_hl_offset
    
    hl_obj.location = hl_world
    hl_obj.rotation_euler = rot
    hl_obj.data.clear_geometry()
    bm_hl = bmesh.new()
    bmesh.ops.create_cube(bm_hl, size=1.0)
    # Scale highlight: cute oval/round sparkle
    bmesh.ops.scale(bm_hl, vec=(0.009, 0.0035, 0.010), verts=bm_hl.verts)
    bm_hl.to_mesh(hl_obj.data)
    bm_hl.free()
    hl_obj.data.update()
    
    sub_hl = hl_obj.modifiers.get("Subdiv")
    if not sub_hl:
        sub_hl = hl_obj.modifiers.new("Subdiv", "SUBSURF")
    sub_hl.levels = 1
    sub_hl.render_levels = 2

# Camera & lighting
cam = bpy.data.objects.get("Camera")
if not cam:
    cam_data = bpy.data.cameras.new("CamFace")
    cam = bpy.data.objects.new("CamFace", cam_data)
    bpy.context.scene.collection.objects.link(cam)
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.engine = 'BLENDER_EEVEE_NEXT'

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

views = [
    ("test_front", (0.0, 0.65, 0.525), (math.radians(90), 0, math.radians(180))),
    ("test_three_quarter_l", (-0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(210))),
    ("test_three_quarter_r", (0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(150))),
    ("test_profile_l", (-0.55, 0.155, 0.525), (math.radians(90), 0, math.radians(270))),
]

for name, loc, rot in views:
    cam.location = loc
    cam.rotation_euler = rot
    cam.data.lens = 70.0
    out_path = os.path.join(OUT_DIR, f"{name}.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {out_path}")

print("Test render complete.")
