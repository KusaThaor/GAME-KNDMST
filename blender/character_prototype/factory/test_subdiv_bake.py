import bpy
import bmesh
import math
import mathutils

bpy.ops.wm.read_factory_settings(use_empty=True)

# Test creating an eye cube, subdividing, applying modifier, then checking vertex count
bpy.ops.mesh.primitive_cube_add(size=1.0)
eye = bpy.context.active_object
eye.scale = (0.032, 0.006, 0.038)
bpy.ops.object.transform_apply(scale=True)
sub = eye.modifiers.new("Subdiv", "SUBSURF")
sub.levels = 1
bpy.ops.object.modifier_apply(modifier="Subdiv")

print(f"Eye vertices after applied Subdiv: {len(eye.data.vertices)}, polys: {len(eye.data.polygons)}")
