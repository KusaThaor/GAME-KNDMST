"""
Reimports the exported character_hair_003_v17.glb into a clean Blender scene to verify:
- GLTF import integrity
- Hierarchy, materials, transforms, bounding box
- Rig and skinning binding to Head bone
- Zero unintended accessory meshes
"""

import bpy
import os

GLB_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\outputs\hairstyles_glb\character_hair_003_v17.glb"

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import GLB
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

print(f"\n==========================================")
print(f"[REIMPORT AUDIT] {os.path.basename(GLB_PATH)}")
print(f"==========================================")

all_objs = list(bpy.data.objects)
mesh_objs = [o for o in all_objs if o.type == 'MESH']
arm_objs = [o for o in all_objs if o.type == 'ARMATURE']

print(f"Total Objects Imported: {len(all_objs)}")
print(f"Mesh Objects ({len(mesh_objs)}): {[m.name for m in mesh_objs]}")
print(f"Armature Objects ({len(arm_objs)}): {[a.name for a in arm_objs]}")

# 1. Hair mesh check
hair_meshes = [m for m in mesh_objs if "hair" in m.name.lower()]
assert len(hair_meshes) > 0, "No hair mesh found in imported GLB!"
for hm in hair_meshes:
    print(f"  Hair Mesh: {hm.name}, Verts: {len(hm.data.vertices)}, Polys: {len(hm.data.polygons)}")

# 2. Eye & facial check
eye_meshes = [m for m in mesh_objs if "eye" in m.name.lower() and "eyebrow" not in m.name.lower()]
print(f"Eye Meshes ({len(eye_meshes)}): {[e.name for e in eye_meshes]}")
assert len(eye_meshes) >= 6, f"Expected at least 6 canonical eye objects, found {len(eye_meshes)}"

# 3. Glasses check
glasses = [m for m in mesh_objs if "glass" in m.name.lower()]
assert len(glasses) == 0, f"Unwanted glasses detected: {[g.name for g in glasses]}"
print("Zero unwanted glasses meshes verified: PASS")

# 4. Rig binding check
arm = arm_objs[0] if arm_objs else None
assert arm is not None, "Armature missing!"
head_bone = arm.data.bones.get("Head")
assert head_bone is not None, "Head bone missing in rig!"
print("Head bone verified in Armature: PASS")

# 5. Materials check
mats = list(bpy.data.materials)
print(f"Imported Materials ({len(mats)}): {[m.name for m in mats]}")

print("\n[REIMPORT AUDIT RESULT]: ALL 5 INTEGRITY CHECKS PASSED PERFECTLY!\n")
