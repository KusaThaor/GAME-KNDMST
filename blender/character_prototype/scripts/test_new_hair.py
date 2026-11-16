import bpy
import bmesh
import math
import os

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SCENE_PATH = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")

bpy.ops.wm.open_mainfile(filepath=SCENE_PATH)

# Remove old hair objects
for name in ["Hair_Base", "Hair_Bangs_Center", "Hair_Bangs_Left", "Hair_Bangs_Right", "Hair_Sideburn_L", "Hair_Sideburn_R", "Hair_Bangs"]:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

mat_hair = bpy.data.materials.get("M_Hair_Black")
col_hair = bpy.data.collections.get("03_Hair_Default")
if not col_hair:
    col_hair = bpy.context.scene.collection

arm = bpy.data.objects.get("Student_Armature")
head_z = 0.525

# -----------------------------------------------------------------------------
# 1. Hair Cap (Clean 20-segment smooth dome)
# -----------------------------------------------------------------------------
def add_ring(bm, z, rx, ry, cx=0.0, cy=0.0, segs=20):
    verts = []
    for i in range(segs):
        ang = 2.0 * math.pi * i / segs
        x = cx + rx * math.cos(ang)
        y = cy + ry * math.sin(ang)
        verts.append(bm.verts.new((x, y, z)))
    bm.verts.ensure_lookup_table()
    return verts

def bridge_rings(bm, r1, r2):
    n = len(r1)
    for i in range(n):
        v1 = r1[i]
        v2 = r1[(i + 1) % n]
        v3 = r2[(i + 1) % n]
        v4 = r2[i]
        f = bm.faces.new((v1, v2, v3, v4))
        f.smooth = True
    bm.faces.ensure_lookup_table()

def cap_ring(bm, ring, apex_coord):
    apex = bm.verts.new(apex_coord)
    n = len(ring)
    for i in range(n):
        v1 = ring[i]
        v2 = ring[(i + 1) % n]
        f = bm.faces.new((apex, v1, v2))
        f.smooth = True
    bm.faces.ensure_lookup_table()

bm_cap = bmesh.new()
hsegs = 20
# Dome rings
r1 = add_ring(bm_cap, 0.535, 0.184, 0.174, 0, -0.010, hsegs) # Bottom edge
r2 = add_ring(bm_cap, 0.565, 0.188, 0.178, 0, -0.012, hsegs)
r3 = add_ring(bm_cap, 0.605, 0.182, 0.172, 0, -0.014, hsegs)
r4 = add_ring(bm_cap, 0.648, 0.156, 0.146, 0, -0.016, hsegs)
r5 = add_ring(bm_cap, 0.680, 0.106, 0.096, 0, -0.018, hsegs)

bridge_rings(bm_cap, r1, r2)
bridge_rings(bm_cap, r2, r3)
bridge_rings(bm_cap, r3, r4)
bridge_rings(bm_cap, r4, r5)
cap_ring(bm_cap, r5, (0.0, -0.018, 0.696))

bmesh.ops.recalc_face_normals(bm_cap, faces=bm_cap.faces)
mesh_cap = bpy.data.meshes.new("Hair_Cap_Mesh")
bm_cap.to_mesh(mesh_cap)
bm_cap.free()

hair_cap = bpy.data.objects.new("Hair_Cap", mesh_cap)
hair_cap.data.materials.append(mat_hair)
col_hair.objects.link(hair_cap)
for p in hair_cap.data.polygons:
    p.use_smooth = True

# -----------------------------------------------------------------------------
# 2. Hair Bangs (Single sleek stylized fringe curving across forehead)
# -----------------------------------------------------------------------------
# We create a quad curved fringe across the forehead: X from -0.150 to +0.150, Y at ~0.150 - 0.165, Z 0.550 - 0.605
bm_bangs = bmesh.new()
# Grid of 6 columns x 2 rows of quads
cols = 6
rows = 2
verts_grid = []

for r in range(rows + 1):
    row_verts = []
    # v: 0 is bottom edge (fringe tips), 1 is middle, 2 is top edge (meets cap)
    t_row = r / rows
    z = 0.552 + t_row * 0.052  # Z from 0.552 to 0.604 (above eyes at 0.520 and brows at 0.560)
    for c in range(cols + 1):
        t_col = (c / cols) * 2.0 - 1.0  # -1.0 to +1.0
        # X spans -0.152 to +0.152
        x = t_col * 0.152
        # Curvature along head surface (cylinder/sphere around Z axis)
        # R_xy ~ 0.172
        rem_sq = max(0.001, 0.174**2 - x**2)
        y = math.sqrt(rem_sq) + 0.006 # slight forward puff
        
        # Bottom fringe shaping: slight cute curve
        curv_z = z
        if r == 0:
            # Bottom edge: slightly higher in middle, dipping at sides
            curv_z += (1.0 - t_col**2) * 0.008
        row_verts.append(bm_bangs.verts.new((x, y, curv_z)))
    verts_grid.append(row_verts)

for r in range(rows):
    for c in range(cols):
        v1 = verts_grid[r][c]
        v2 = verts_grid[r][c + 1]
        v3 = verts_grid[r + 1][c + 1]
        v4 = verts_grid[r + 1][c]
        f = bm_bangs.faces.new((v1, v2, v3, v4))
        f.smooth = True

bmesh.ops.recalc_face_normals(bm_bangs, faces=bm_bangs.faces)
mesh_bangs = bpy.data.meshes.new("Hair_Bangs_Mesh")
bm_bangs.to_mesh(mesh_bangs)
bm_bangs.free()

hair_bangs = bpy.data.objects.new("Hair_Bangs", mesh_bangs)
hair_bangs.data.materials.append(mat_hair)
col_hair.objects.link(hair_bangs)
for p in hair_bangs.data.polygons:
    p.use_smooth = True

# Add Solidify + Subdiv to bangs for clean stylized thickness
sol = hair_bangs.modifiers.new("Solidify", "SOLIDIFY")
sol.thickness = 0.014
sol.offset = 0.2
sub_b = hair_bangs.modifiers.new("Subdiv", "SUBSURF")
sub_b.levels = 1

# -----------------------------------------------------------------------------
# 3. Sideburns (Left & Right sleek locks)
# -----------------------------------------------------------------------------
for side, sign in [(-1, "L"), (1, "R")]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.165, 0.040, head_z - 0.005))
    burn = bpy.context.active_object
    burn.name = f"Hair_Sideburn_{sign}"
    burn.scale = (0.024, 0.055, 0.075)
    burn.rotation_euler = (math.radians(-10), 0, math.radians(side * -6))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub = burn.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    burn.data.materials.append(mat_hair)
    col_hair.objects.link(burn)
    bpy.context.scene.collection.objects.unlink(burn)
    for p in burn.data.polygons:
        p.use_smooth = True

# -----------------------------------------------------------------------------
# 4. FIX HEAD POSTURE & ROTATION: Completely Reset PB Head/Spine/Neck to Upright
# -----------------------------------------------------------------------------
if arm:
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.location = (0, 0, 0)
        pb.rotation_euler = (0, 0, 0)
        pb.scale = (1, 1, 1)

# Now fix Action_Idle keyframes
idle_act = bpy.data.actions.get("Action_Idle")
if idle_act:
    # Clear all existing fcurves to rebuild clean upright idle
    for fc in list(idle_act.fcurves):
        idle_act.fcurves.remove(fc)
    
    # Helper for idle keyframes
    def idle_kf(bname, prop, val, f):
        b = arm.pose.bones[bname]
        setattr(b, prop, val)
        b.keyframe_insert(prop, frame=f)

    for f, bz, rx, ay in [(1, 0.0, 0.0, 0.0), (20, 0.003, math.radians(1.2), math.radians(1.0)), (40, 0.0, 0.0, 0.0)]:
        idle_kf("Root", "rotation_euler", (0, 0, 0), f)
        idle_kf("Hips", "location", (0, 0, bz), f)
        idle_kf("Hips", "rotation_euler", (0, 0, 0), f)
        idle_kf("Spine", "rotation_euler", (0, 0, 0), f)
        idle_kf("Chest", "rotation_euler", (rx, 0, 0), f)
        idle_kf("Neck", "rotation_euler", (0, 0, 0), f)
        idle_kf("Head", "rotation_euler", (0, 0, 0), f) # Completely upright!
        idle_kf("UpperArm.L", "rotation_euler", (0, 0, math.radians(-6) + ay), f)
        idle_kf("UpperArm.R", "rotation_euler", (0, 0, math.radians(6) - ay), f)
        idle_kf("Forearm.L", "rotation_euler", (math.radians(10), 0, math.radians(-3)), f)
        idle_kf("Forearm.R", "rotation_euler", (math.radians(10), 0, math.radians(3)), f)
        idle_kf("Hand.L", "rotation_euler", (0, 0, 0), f)
        idle_kf("Hand.R", "rotation_euler", (0, 0, 0), f)
        idle_kf("Thigh.L", "rotation_euler", (0, 0, 0), f)
        idle_kf("Shin.L", "rotation_euler", (0, 0, 0), f)
        idle_kf("Foot.L", "rotation_euler", (0, 0, 0), f)
        idle_kf("Thigh.R", "rotation_euler", (0, 0, 0), f)
        idle_kf("Shin.R", "rotation_euler", (0, 0, 0), f)
        idle_kf("Foot.R", "rotation_euler", (0, 0, 0), f)

# Skin new hair objects to Head bone
for h_obj in [hair_cap, hair_bangs, bpy.data.objects.get("Hair_Sideburn_L"), bpy.data.objects.get("Hair_Sideburn_R")]:
    if h_obj:
        mod = h_obj.modifiers.new("Armature", "ARMATURE")
        mod.object = arm
        vg = h_obj.vertex_groups.new(name="Head")
        vg.add(list(range(len(h_obj.data.vertices))), 1.0, "REPLACE")

# Bind arm to Action_Idle frame 1
arm.animation_data.use_nla = False
arm.animation_data.action = idle_act
bpy.context.scene.frame_set(1)
bpy.context.view_layer.update()

# Save scene
bpy.ops.wm.save_mainfile(filepath=SCENE_PATH)
print("TEST NEW HAIR & UPRIGHT POSE APPLIED SUCCESSFULLY!")
