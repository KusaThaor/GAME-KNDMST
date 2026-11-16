import bpy
import bmesh
import math
import os
import traceback

LOG = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\test_hair_log.txt"
with open(LOG, "w", encoding="utf-8") as f:
    f.write("STARTING\n")

try:
    PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
    SCENE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")

    # Remove existing hair
    for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R", "Hair_Back"]:
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)

    mat_hair = bpy.data.materials.get("M_Hair")
    col_hair = bpy.data.collections.get("03_Hair_Default")
    if not col_hair:
        col_hair = bpy.context.scene.collection

    head_z = 0.525

    # 1. Hair Cap (Top, Back, Left, Right - open front & open bottom)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)

    # Delete bottom face (normal.z < -0.5) and front face (normal.y > 0.5)
    faces_to_delete = [f for f in bm.faces if f.normal.z < -0.5 or f.normal.y > 0.5]
    bmesh.ops.delete(bm, geom=faces_to_delete, context="FACES")

    for v in bm.verts:
        v.co.x *= 0.38
        v.co.y = (v.co.y - 0.035) * 0.36
        v.co.z = (v.co.z + 0.050) * 0.31 + head_z

    for f in bm.faces:
        f.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh_cap = bpy.data.meshes.new("Hair_Cap_Mesh")
    bm.to_mesh(mesh_cap)
    bm.free()

    cap_obj = bpy.data.objects.new("Hair_Cap", mesh_cap)
    cap_obj.data.materials.append(mat_hair)
    col_hair.objects.link(cap_obj)

    sol = cap_obj.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = 0.016
    sol.offset = 0.2

    sub = cap_obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2

    # 2. Hair Bangs
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.108, head_z + 0.065))
    bangs = bpy.context.active_object
    bangs.name = "Hair_Bangs"
    bangs.scale = (0.34, 0.11, 0.09)
    bangs.rotation_euler = (math.radians(-16), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    sub_b = bangs.modifiers.new("Subdiv", "SUBSURF")
    sub_b.levels = 2
    bangs.data.materials.append(mat_hair)
    col_hair.objects.link(bangs)
    bpy.context.scene.collection.objects.unlink(bangs)

    # 3. Sideburns
    for side, sign in [(-1, "L"), (1, "R")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.168, 0.035, head_z + 0.005))
        burn = bpy.context.active_object
        burn.name = f"Hair_Sideburn_{sign}"
        burn.scale = (0.024, 0.045, 0.075)
        burn.rotation_euler = (math.radians(-12), 0, math.radians(side * -8))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        sub = burn.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        burn.data.materials.append(mat_hair)
        col_hair.objects.link(burn)
        bpy.context.scene.collection.objects.unlink(burn)

    # Render test turnaround
    cam_obj = bpy.data.objects.get("Cam")
    scene = bpy.context.scene
    scene.render.resolution_x = 720
    scene.render.resolution_y = 900
    scene.render.image_settings.file_format = "PNG"

    test_front = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "test_perfect_front.png")
    cam_obj.location = (0.0, 1.95, 0.35 + 0.05)
    cam_obj.rotation_euler = (math.radians(90), 0, math.radians(180))
    scene.render.filepath = test_front
    bpy.ops.render.render(write_still=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write("RENDERED FRONT\n")

except Exception as e:
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"ERROR: {e}\n")
        traceback.print_exc(file=f)

