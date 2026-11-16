import bpy

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\where_is_hair.txt", "w") as f:
    for name in ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R", "Body_Head"]:
        o = bpy.data.objects.get(name)
        if o:
            f.write(f"\n=== Object: {name} ===\n")
            f.write(f"  type={o.type}, loc={list(o.location)}, rot={list(o.rotation_euler)}, scale={list(o.scale)}\n")
            f.write(f"  parent={o.parent.name if o.parent else 'None'}\n")
            f.write(f"  collections={[c.name for c in o.users_collection]}\n")
            f.write(f"  hide_render={o.hide_render}, hide_viewport={o.hide_viewport}\n")
            f.write(f"  modifiers={[m.name + '(' + m.type + ')' for m in o.modifiers]}\n")
            f.write(f"  materials={[m.name if m else 'None' for m in o.data.materials]}\n")
            if o.type == 'MESH':
                zs = [v.co.z for v in o.data.vertices]
                ys = [v.co.y for v in o.data.vertices]
                xs = [v.co.x for v in o.data.vertices]
                f.write(f"  local bounds X:[{min(xs):.3f}, {max(xs):.3f}], Y:[{min(ys):.3f}, {max(ys):.3f}], Z:[{min(zs):.3f}, {max(zs):.3f}]\n")
                
                # Check world bounds
                m = o.matrix_world
                wzs = [(m @ v.co).z for v in o.data.vertices]
                wys = [(m @ v.co).y for v in o.data.vertices]
                wxs = [(m @ v.co).x for v in o.data.vertices]
                f.write(f"  world bounds X:[{min(wxs):.3f}, {max(wxs):.3f}], Y:[{min(wys):.3f}, {max(wys):.3f}], Z:[{min(wzs):.3f}, {max(wzs):.3f}]\n")

                # Check with armature modifier evaluated
                dg = bpy.context.evaluated_depsgraph_get()
                eval_o = o.evaluated_get(dg)
                em = eval_o.matrix_world
                ezs = [(em @ v.co).z for v in eval_o.data.vertices]
                eys = [(em @ v.co).y for v in eval_o.data.vertices]
                exs = [(em @ v.co).x for v in eval_o.data.vertices]
                f.write(f"  EVALUATED world bounds X:[{min(exs):.3f}, {max(exs):.3f}], Y:[{min(eys):.3f}, {max(eys):.3f}], Z:[{min(ezs):.3f}, {max(ezs):.3f}]\n")
        else:
            f.write(f"Object {name} NOT FOUND!\n")
