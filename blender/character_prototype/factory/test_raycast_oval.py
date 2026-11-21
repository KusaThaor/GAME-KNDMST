import bpy
import bmesh
import math
import mathutils
import os

BLEND_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_base.blend"
OUT_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\test_oval"
os.makedirs(OUT_DIR, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

# Hide hair
for col in bpy.data.collections:
    if "hair" in col.name.lower():
        col.hide_render = True
for o in bpy.data.objects:
    if "hair" in o.name.lower():
        o.hide_render = True

head = bpy.data.objects.get("Body_Head")
mw = head.matrix_world
imw = mw.inverted()

def get_head_y(x, z):
    ray_orig = mathutils.Vector((x, 0.300, z))
    ray_dir = mathutils.Vector((0, -1.0, 0))
    hit, loc, norm, f_idx = head.ray_cast(imw @ ray_orig, imw.to_3x3() @ ray_dir)
    if hit:
        return (mw @ loc).y
    return 0.152

def create_conforming_oval_mesh(cx, cz, rx, rz, segs=24, thickness=0.003, z_offset_front=0.0025, z_offset_back=-0.0008):
    bm = bmesh.new()
    
    # Rings of vertices for front face, back face
    # Center vertices
    y_center = get_head_y(cx, cz)
    v_front_center = bm.verts.new((cx, y_center + z_offset_front, cz))
    v_back_center = bm.verts.new((cx, y_center + z_offset_back, cz))
    
    # Outer ring
    front_ring = []
    back_ring = []
    
    for i in range(segs):
        theta = 2.0 * math.pi * i / segs
        px = cx + rx * math.cos(theta)
        pz = cz + rz * math.sin(theta)
        py = get_head_y(px, pz)
        
        vf = bm.verts.new((px, py + z_offset_front, pz))
        vb = bm.verts.new((px, py + z_offset_back, pz))
        front_ring.append(vf)
        back_ring.append(vb)
        
    bm.verts.ensure_lookup_table()
    
    # Create front fan / quads
    # To have nice topology, create fan from center to front ring
    for i in range(segs):
        i_next = (i + 1) % segs
        bm.faces.new((v_front_center, front_ring[i], front_ring[i_next]))
        # back fan (reversed order for correct normal)
        bm.faces.new((v_back_center, back_ring[i_next], back_ring[i]))
        # side walls
        bm.faces.new((front_ring[i], back_ring[i], back_ring[i_next], front_ring[i_next]))
        
    bm.faces.ensure_lookup_table()
    for f in bm.faces:
        f.smooth = True
        
    return bm

# Materials
mat_black = bpy.data.materials.get("M_Eye_Black")
mat_hl = bpy.data.materials.get("M_Eye_Highlight")

if mat_black and mat_black.use_nodes:
    for n in mat_black.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            if 'Specular IOR Level' in n.inputs:
                n.inputs['Specular IOR Level'].default_value = 0.05
            elif 'Specular' in n.inputs:
                n.inputs['Specular'].default_value = 0.05
            n.inputs['Roughness'].default_value = 0.70

if mat_hl and mat_hl.use_nodes:
    for n in mat_hl.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)
            n.inputs['Roughness'].default_value = 0.20
            if 'Emission Strength' in n.inputs:
                n.inputs['Emission Strength'].default_value = 0.8
            if 'Emission Color' in n.inputs:
                n.inputs['Emission Color'].default_value = (1.0, 1.0, 1.0, 1.0)

# Eye dimensions: width 0.034 (rx=0.017), height 0.046 (rz=0.023)
eye_rx = 0.017
eye_rz = 0.023
eye_z = 0.520

for side, sign in [(-1, "L"), (1, "R")]:
    cx = side * 0.066
    
    # 1. Update Eye mesh
    eye_obj = bpy.data.objects.get(f"Eye_{sign}")
    eye_obj.location = (0, 0, 0)
    eye_obj.rotation_euler = (0, 0, 0)
    eye_obj.scale = (1, 1, 1)
    
    bm_eye = create_conforming_oval_mesh(cx, eye_z, eye_rx, eye_rz, segs=32, z_offset_front=0.0022, z_offset_back=-0.0008)
    eye_obj.data.clear_geometry()
    bm_eye.to_mesh(eye_obj.data)
    bm_eye.free()
    eye_obj.data.update()
    
    # 2. Update Highlight 1 (Upper-Outer)
    hl1_obj = bpy.data.objects.get(f"Eye_HL1_{sign}")
    hl1_obj.location = (0, 0, 0)
    hl1_obj.rotation_euler = (0, 0, 0)
    hl1_obj.scale = (1, 1, 1)
    
    hl1_cx = cx + side * 0.0022
    hl1_cz = eye_z + 0.0110
    bm_hl1 = create_conforming_oval_mesh(hl1_cx, hl1_cz, rx=0.0052, rz=0.0062, segs=20, z_offset_front=0.0028, z_offset_back=0.0018)
    hl1_obj.data.clear_geometry()
    bm_hl1.to_mesh(hl1_obj.data)
    bm_hl1.free()
    hl1_obj.data.update()
    
    # 3. Create or update Highlight 2 (Lower-Inner)
    hl2_obj = bpy.data.objects.get(f"Eye_HL2_{sign}")
    if not hl2_obj:
        hl2_data = bpy.data.meshes.new(f"Eye_HL2_{sign}")
        hl2_obj = bpy.data.objects.new(f"Eye_HL2_{sign}", hl2_data)
        bpy.context.scene.collection.objects.link(hl2_obj)
        hl2_obj.data.materials.append(mat_hl)
        
    hl2_obj.location = (0, 0, 0)
    hl2_obj.rotation_euler = (0, 0, 0)
    hl2_obj.scale = (1, 1, 1)
    
    hl2_cx = cx - side * 0.0022
    hl2_cz = eye_z - 0.0110
    bm_hl2 = create_conforming_oval_mesh(hl2_cx, hl2_cz, rx=0.0034, rz=0.0042, segs=16, z_offset_front=0.0028, z_offset_back=0.0018)
    hl2_obj.data.clear_geometry()
    bm_hl2.to_mesh(hl2_obj.data)
    bm_hl2.free()
    hl2_obj.data.update()

# Setup Camera & Lights
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
    ("test_oval_front", (0.0, 0.65, 0.525), (math.radians(90), 0, math.radians(180))),
    ("test_oval_three_quarter_l", (-0.35, 0.55, 0.535), (math.radians(88), 0, math.radians(210))),
    ("test_oval_profile_l", (-0.55, 0.155, 0.525), (math.radians(90), 0, math.radians(270))),
]

for name, loc, rot in views:
    cam.location = loc
    cam.rotation_euler = rot
    cam.data.lens = 70.0
    out_path = os.path.join(OUT_DIR, f"{name}.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {out_path}")

print("Oval test renders complete.")
