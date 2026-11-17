"""Neck-worn scarf study from the supplied real tied-scarf photographs."""
import bpy, math
from mathutils import Vector
from mathutils.bvhtree import BVHTree

def build(arm, char_id, color="#c91629"):
    from clothing_library import create_or_get_mat
    verts, faces = [], []
    shirt=bpy.data.objects.get('Top_Torso_Mesh')
    if shirt is None:
        raise RuntimeError('Cannot check scarf clearance without Top_Torso_Mesh')
    bpy.context.view_layer.update()
    evaluated=shirt.evaluated_get(bpy.context.evaluated_depsgraph_get())
    sm=evaluated.to_mesh()
    surface=BVHTree.FromPolygons([shirt.matrix_world @ v.co for v in sm.vertices],
                                [tuple(p.vertices) for p in sm.polygons])
    evaluated.to_mesh_clear()
    def clear_shirt(p):
        # Keep the designed x/z path, moving only outwards from the shirt.
        # Nearest-point wrapping would collapse the neck loop onto shoulders.
        if p.y>0:
            hit,_,_,_=surface.ray_cast(Vector((p.x,.4,p.z)),Vector((0,-1,0)),.4)
            if hit is not None:p.y=max(p.y,hit.y+.0035)
        elif p.y<0:
            hit,_,_,_=surface.ray_cast(Vector((p.x,-.4,p.z)),Vector((0,1,0)),.4)
            if hit is not None:p.y=min(p.y,hit.y-.0035)
        return p
    def ribbon(rows, folds=0.001):
        start=len(verts); across=8
        for i,(left,right) in enumerate(rows):
            l,r=Vector(left),Vector(right)
            for j in range(across+1):
                u=j/across; p=l.lerp(r,u)
                p.y += folds*math.sin(u*math.pi*4)*math.sin(math.pi*i/(len(rows)-1))
                verts.append(tuple(clear_shirt(p)))
        for i in range(len(rows)-1):
            for j in range(across):
                a=start+i*(across+1)+j
                faces.append((a,a+1,a+across+2,a+across+1))
    def smooth_rows(control, steps=5):
        out=[]
        for i in range(len(control)-1):
            for j in range(steps):
                t=j/steps; pair=[]
                for k in range(2):
                    a=Vector(control[max(i-1,0)][k]); b=Vector(control[i][k])
                    c=Vector(control[i+1][k]); d=Vector(control[min(i+2,len(control)-1)][k])
                    pair.append((2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)*.5)
                out.append(pair)
        out.append(control[-1]); return out
    # One unbroken strip: knot -> left side -> nape -> right side -> knot.
    # Shared cross-sections eliminate the overlapping upright collar and gaps.
    # Both edges continue directly backwards at the neck base, following
    # the user's white guide; no separate raised ring or rear patch.
    left=[
        ((-.004,.098,.353),(-.013,.099,.345)),
        ((-.022,.090,.368),(-.039,.094,.362)),
        ((-.039,.079,.389),(-.058,.082,.379)),
        ((-.050,.054,.407),(-.069,.058,.395)),
        ((-.057,.025,.414),(-.077,.027,.399)),
        ((-.058,-.008,.414),(-.078,-.010,.399)),
        ((-.047,-.037,.414),(-.065,-.047,.399)),
        ((-.027,-.051,.414),(-.037,-.068,.399)),
        ((0,-.055,.414),(0,-.074,.399))]
    right=[tuple((-p[0],p[1],p[2]) for p in pair)
           for pair in reversed(left[:-1])]
    ribbon(smooth_rows(left+right,8),.0006)
    # Thin, asymmetrical hanging cloth; tips are offset and tapered.
    for sign,length,drift in [(-1,.079,.027),(1,.100,.018)]:
        rows=[]
        for i in range(33):
            t=i/32; x=sign*(.005+drift*t)
            z=.347-length*t; y=.099+.006*math.sin(math.pi*t)-.003*t
            width=(.005+.007*math.sin(math.pi*t**.75))*(1-t**5)+.00025
            rows.append(((x-width,y,z+.004*t),(x+width,y,z-.004*t)))
        ribbon(rows,.0014)
    mesh=bpy.data.meshes.new('Scarf_Reference_Cloth'); mesh.from_pydata(verts,[],faces); mesh.update()
    import bmesh
    bm=bmesh.new();bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(mesh);bm.free()
    obj=bpy.data.objects.new('Acc_Red_Scarf',mesh); bpy.context.collection.objects.link(obj)
    mat=create_or_get_mat('M_Acc_Scarf_'+char_id,color,roughness=.82); mesh.materials.append(mat)
    for p in mesh.polygons:p.use_smooth=True
    solid=obj.modifiers.new('Thin fabric','SOLIDIFY'); solid.thickness=.001; solid.offset=0
    bevel=obj.modifiers.new('Soft cloth edges','BEVEL'); bevel.width=.0005; bevel.segments=2
    # Compressed wrap with a tapered bottom, rather than a round bead.
    kv=[]; kf=[]
    for z,w in [(.357,.014),(.352,.015),(.339,.010),(.337,.008)]:
        for j in range(16):
            a=j*math.tau/16
            kv.append((w*math.cos(a),.099+.006*math.sin(a),z+.002*math.cos(a)))
    for i in range(3):
        for j in range(16):
            a=i*16+j;b=i*16+(j+1)%16;kf.append((a,b,b+16,a+16))
    kf.extend([tuple(reversed(range(16))),tuple(range(48,64))])
    km=bpy.data.meshes.new('Scarf_Knot_Wrap');km.from_pydata(kv,[],kf);km.update()
    knot=bpy.data.objects.new('Acc_Red_Scarf_Knot',km);bpy.context.collection.objects.link(knot);km.materials.append(mat)
    for p in km.polygons:p.use_smooth=True
    sub=knot.modifiers.new('Soft compressed knot','SUBSURF');sub.levels=2
    for ob in [obj,knot]:
        neck=ob.vertex_groups.new(name='Neck');chest=ob.vertex_groups.new(name='Chest');spine=ob.vertex_groups.new(name='Spine')
        for v in ob.data.vertices:
            n=max(0,min(.6,(v.co.z-.38)*12));s=max(0,min(.3,(.31-v.co.z)*5))
            neck.add([v.index],n,'REPLACE');spine.add([v.index],s,'REPLACE');chest.add([v.index],1-n-s,'REPLACE')
        mod=ob.modifiers.new('Armature','ARMATURE');mod.object=arm
    return obj
