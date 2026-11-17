import bpy, sys, math
from pathlib import Path
from mathutils import Vector
root=Path(r"C:/Users/Admin/Desktop/GAME")
factory_dir=root/"GAME-KNDMST/blender/character_prototype/factory"
sys.path.insert(0,str(factory_dir))
import clothing_library
from build_scarf_deliverables import setup_studio
bpy.ops.wm.open_mainfile(filepath=str(root/"scarf-review/student_uniform_scarf.blend"))
arm=next(o for o in bpy.data.objects if o.type=="ARMATURE")
arm.animation_data_clear()
arm.data.pose_position='REST'
for bone in arm.pose.bones:
    bone.matrix_basis.identity()
for obj in list(bpy.data.objects):
    if obj.name.startswith("Acc_Red_Scarf"):
        bpy.data.objects.remove(obj,do_unlink=True)
import importlib, scarf_reference_revision
importlib.reload(scarf_reference_revision)
scarf_reference_revision.build(arm,"reference_revision")
scene=bpy.context.scene
scene.frame_set(1)
# Report duplicate objects and front-surface clearance on evaluated geometry.
from mathutils.bvhtree import BVHTree
import json
bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get()
shirt=bpy.data.objects['Top_Torso_Mesh']
se=shirt.evaluated_get(deps);sm=se.to_mesh()
tree=BVHTree.FromPolygons([shirt.matrix_world@v.co for v in sm.vertices], [tuple(p.vertices) for p in sm.polygons])
se.to_mesh_clear()
cloth=bpy.data.objects['Acc_Red_Scarf'];ce=cloth.evaluated_get(deps);cm=ce.to_mesh()
gaps=[]
for v in cm.vertices:
    p=cloth.matrix_world@v.co
    if p.y<=0:continue
    hit,_,_,_=tree.ray_cast(Vector((p.x,.4,p.z)),Vector((0,-1,0)),.4)
    if hit is not None:gaps.append(p.y-hit.y)
ce.to_mesh_clear()
names=[o.name for o in scene.objects if o.name.startswith('Acc_Red_Scarf')]
report={'scarf_objects':names,'front_min_clearance':min(gaps) if gaps else None,
        'front_vertices_inside_shirt':sum(g<0 for g in gaps)}
(root/'scarf-review/reference_audit.json').write_text(json.dumps(report,indent=2))
assert len(names)==2, 'Unexpected duplicate scarf objects: '+str(names)
assert gaps and min(gaps)>.001, 'Scarf intersects shirt; see reference_audit.json'
bpy.ops.wm.save_as_mainfile(filepath=str(root/"scarf-review/scarf_reference_revision.blend"))
for label,loc in [("front",(0,1.6,.36)),("front_closeup",(0,1.6,.37)),("side",(1.6,0,.37)),("rear_threequarter",(1.15,-1.15,.43)),("rear_left",(-1.15,-1.15,.43))]:
    cam=setup_studio(scene,loc,(0,0,0),res=(600,720))
    cam.rotation_euler=(Vector((0,0,.36))-cam.location).to_track_quat("-Z","Y").to_euler()
    cam.data.type="ORTHO"
    cam.data.ortho_scale=0.85 if label=="front" else 0.36
    cam.rotation_euler=(Vector((0,0,.37))-cam.location).to_track_quat("-Z","Y").to_euler()
    scene.render.filepath=str(root/("scarf-review/fixed_"+label+".png"))
    bpy.ops.render.render(write_still=True)
print("SCARF_REVIEW_DONE")

