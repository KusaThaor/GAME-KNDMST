import bpy
import bmesh
import math
import os
import traceback

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SCENE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
LOG_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "test_hair_log.txt")

with open(LOG_PATH, "w", encoding="utf-8") as f:
    f.write("STARTING TEST HAIR GROOM\n")

try:
    bpy.ops.wm.open_mainfile(filepath=SCENE_BLEND)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write("Scene opened\n")


# Delete existing hair objects
for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R"]:
    obj = bpy.data.objects.get(name)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)

mat_hair = bpy.data.materials.get("M_Hair")
col_hair = bpy.data.collections.get("03_Hair_Default")
if not col_hair:
    col_hair = bpy.context.scene.collection

head_z = 0.525

# =============================================================================
# 1. HAIR CAP (Covers crown, temples, sides, and full back down to nape)
# =============================================================================
bm = bmesh.new()
# Create UV sphere centered slightly behind head center
bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=0.190)

# Scale to match chibi head proportions (head is scale_x=1.05, scale_z=0.88)
for v in bm.vertices:
    v.co.x *= 1.055
    v.co.y = (v.co.y - 0.015) * 1.06  # push slightly back to add hair fullness
    v.co.z = (v.co.z) * 0.96 + head_z + 0.015

# Cut out face opening: delete vertices in front of face
# Face is at Y > 0.02 and Z < head_z + 0.065
verts_to_delete = []
for v in bm.vertices:
    # If in front face region
    if v.co.y > 0.020 and v.co.z < (head_z + 0.075):
        verts_to_delete.append(v)
    # Also trim very bottom under chin if any
    elif v.co.z < (head_z - 0.090) and v.co.y > -0.050:
        verts_to_delete.append(v)

bmesh.ops.delete(bm, geom=verts_to_delete, context="VERTS")

# Ensure smooth shading
for f in bm.faces:
    f.smooth = True

bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
mesh_cap = bpy.data.meshes.new("Hair_Cap_Mesh")
bm.to_mesh(mesh_cap)
bm.free()

cap_obj = bpy.data.objects.new("Hair_Cap", mesh_cap)
cap_obj.data.materials.append(mat_hair)
col_hair.objects.link(cap_obj)

# Add Solidify for real volumetric stylized hair rim
sol = cap_obj.modifiers.new("Solidify", "SOLIDIFY")
sol.thickness = 0.012
sol.offset = 0.5

sub = cap_obj.modifiers.new("Subdiv", "SUBSURF")
sub.levels = 1
sub.render_levels = 1

# =============================================================================
# 2. STYLIZED BANGS (Soft curved chibi fringe framing the forehead)
# =============================================================================
bm_b = bmesh.new()
# Construct a curved quad ribbon along the forehead arch
bangs_pts_top = [
    (-0.135, 0.125, head_z + 0.055),
    (-0.080, 0.165, head_z + 0.080),
    ( 0.000, 0.178, head_z + 0.085),
    ( 0.080, 0.165, head_z + 0.080),
    ( 0.135, 0.125, head_z + 0.055),
]
bangs_pts_bot = [
    (-0.130, 0.132, head_z + 0.025),
    (-0.075, 0.170, head_z + 0.048),
    ( 0.000, 0.182, head_z + 0.052),
    ( 0.075, 0.170, head_z + 0.048),
    ( 0.130, 0.132, head_z + 0.025),
]

v_top = [bm_b.vertices.new(p) for p in bangs_pts_top]
v_bot = [bm_b.vertices.new(p) for p in bangs_pts_bot]

for i in range(len(v_top) - 1):
    bm_b.faces.new([v_top[i], v_top[i+1], v_bot[i+1], v_bot[i]])

for f in bm_b.faces:
    f.smooth = True

bmesh.ops.recalc_face_normals(bm_b, faces=bm_b.faces)
mesh_bangs = bpy.data.meshes.new("Hair_Bangs_Mesh")
bm_b.to_mesh(mesh_bangs)
bm_b.free()

bangs_obj = bpy.data.objects.new("Hair_Bangs", mesh_bangs)
bangs_obj.data.materials.append(mat_hair)
col_hair.objects.link(bangs_obj)

# Add Solidify and Subsurf to give bangs thickness and pillowy chibi curves
sol_b = bangs_obj.modifiers.new("Solidify", "SOLIDIFY")
sol_b.thickness = 0.016
sol_b.offset = 0.2

sub_b = bangs_obj.modifiers.new("Subdiv", "SUBSURF")
sub_b.levels = 1
sub_b.render_levels = 1

# =============================================================================
# 3. SIDEBURNS (Soft locks in front of ears)
# =============================================================================
for side, sign in [(-1, "L"), (1, "R")]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.170, 0.040, head_z + 0.005))
    burn = bpy.context.active_object
    burn.name = f"Hair_Sideburn_{sign}"
    burn.scale = (0.018, 0.035, 0.050)
    burn.rotation_euler = (math.radians(-8), 0, math.radians(side * -8))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = burn.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    burn.data.materials.append(mat_hair)
    col_hair.objects.link(burn)
    bpy.context.scene.collection.objects.unlink(burn)

# Bind new hair objects to Armature (Head bone)
arm_obj = bpy.data.objects.get("Student_Armature")
if arm_obj:
    for h in [cap_obj, bangs_obj, bpy.data.objects.get("Hair_Sideburn_L"), bpy.data.objects.get("Hair_Sideburn_R")]:
        if not h: continue
        mod = h.modifiers.new("Armature", "ARMATURE")
        mod.object = arm_obj
        vg = h.vertex_groups.new(name="Head")
        vg.add(list(range(len(h.data.vertices))), 1.0, "REPLACE")

# Render quick test turnaround
cam_obj = bpy.data.objects.get("Cam")
scene = bpy.context.scene
scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.image_settings.file_format = "PNG"

test_out = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "test_new_hair_turnaround.png")
cam_obj.location = (1.95 * 0.72, 1.95 * 0.72, 0.35 + 0.12)
cam_obj.rotation_euler = (math.radians(85), 0, math.radians(135))
scene.render.filepath = test_out
bpy.ops.render.render(write_still=True)
print(f"TEST RENDER SAVED: {test_out}")
with open(LOG_PATH, "a", encoding="utf-8") as f:
    f.write(f"TEST RENDER SAVED: {test_out}\n")
except Exception as e:
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"ERROR: {e}\n")
        traceback.print_exc(file=f)
