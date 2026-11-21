import bpy
import bmesh
import math
from mathutils import Vector
import os
import sys

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"

def build_full_coverage_dome(bm, puff=0.012, rx=0.182, ry=0.170, rz=0.160, center_z=0.528,
                             u_segs=24, v_segs=10):
    """
    Builds a complete, gapless hair dome covering top, sides, and all of the back of the skull.
    """
    apex = bm.verts.new(Vector((0.0, -0.012, center_z + rz + puff + 0.010)))
    grid = []
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            # Angle from crown
            if cos_u > 0.1:  # Front forehead
                max_phi = math.radians(64.0) + (1.0 - cos_u) * math.radians(20.0)
            elif cos_u < -0.1:  # Back skull & nape
                back_fac = -cos_u
                # Extends down to 135 degrees at direct back, reaching Z ~ 0.430!
                max_phi = math.radians(88.0) + back_fac * math.radians(46.0)
            else:  # Above ears
                max_phi = math.radians(84.0)
                
            phi = v * max_phi
            
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u - 0.012
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Ear notch (ears at +/- 0.155, -0.010, 0.510)
            if abs(cos_u) < 0.25 and v > 0.7:
                ear_dist = math.sqrt((abs(px) - 0.155)**2 + (py + 0.010)**2 + (pz - 0.510)**2)
                if ear_dist < 0.038:
                    pz += (0.038 - ear_dist) * 0.85
                    px = math.copysign(max(abs(px), 0.180), px)
                    
            vert = bm.verts.new(Vector((px, py, pz)))
            row.append(vert)
        grid.append(row)
        
    for u in range(u_segs):
        un = (u + 1) % u_segs
        bm.faces.new((apex, grid[0][u], grid[0][un]))
        
    for v in range(v_segs - 1):
        for u in range(u_segs):
            un = (u + 1) % u_segs
            bm.faces.new((grid[v][u], grid[v][un], grid[v+1][un], grid[v+1][u]))
            
    return grid[-1]

def build_fringe_curtain(bm, center_z=0.528, hair_r=0.182, bangs_type="straight",
                         fringe_z_top=0.605, fringe_z_bot=0.548, fringe_y=0.150):
    """
    Creates a contiguous front fringe shield anchored to the forehead.
    """
    u_steps = 14
    top_row = []
    bot_row = []
    
    for i in range(u_steps + 1):
        t = i / u_steps  # 0 to 1 across forehead
        x = -0.125 + 0.250 * t
        
        # Arch shaping
        arch = (1.0 - (2.0 * t - 1.0)**2)
        y_arch = fringe_y + 0.008 * arch
        z_t = fringe_z_top + 0.012 * arch
        
        # Bottom edge: scalloped/cut locks
        notch = 0.008 * math.sin(t * math.pi * 5.0)
        z_b = fringe_z_bot + notch
        
        v_top = bm.verts.new(Vector((x, y_arch - 0.006, z_t)))
        v_bot = bm.verts.new(Vector((x, y_arch, z_b)))
        top_row.append(v_top)
        bot_row.append(v_bot)
        
    for i in range(u_steps):
        bm.faces.new((top_row[i], top_row[i+1], bot_row[i+1], bot_row[i]))

print("Full coverage dome and fringe defined.")

def test_render():
    if FACTORY_DIR not in sys.path:
        sys.path.insert(0, FACTORY_DIR)
    import character_factory
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    factory.load_base()
    factory.isolate_materials("arch_test")
    factory.apply_skin_tone("SKIN_02", "arch_test")
    
    # Remove old hair
    old_hair = [o for o in bpy.data.objects if o.name.startswith("Hair_")]
    for o in old_hair:
        bpy.data.objects.remove(o, do_unlink=True)
        
    bm = bmesh.new()
    build_full_coverage_dome(bm)
    build_fringe_curtain(bm)
    
    mesh = bpy.data.meshes.new("Test_Arch_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_Arch_Test", mesh)
    mat = bpy.data.materials.new("M_Hair_Test")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.04, 0.035, 0.03, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.75
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.25
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    
    # Armature bind
    vg = obj.vertex_groups.new(name="Head")
    vg.add(list(range(len(obj.data.vertices))), 1.0, 'REPLACE')
    m = obj.modifiers.new("Armature", 'ARMATURE')
    m.object = factory.arm
    
    # Setup lights & camera
    scene = bpy.context.scene
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)
            
    cam_data = bpy.data.cameras.new("Test_Cam")
    cam_data.lens = 55
    cam = bpy.data.objects.new("Test_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    
    def add_sun(name, energy, rot_deg):
        l = bpy.data.lights.new(name, "SUN")
        l.energy = energy
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        return obj
        
    add_sun("Key", 4.0, (50, 20, -35))
    add_sun("Fill", 2.2, (38, -25, 140))
    add_sun("Rim", 3.5, (25, 10, 30))
    add_sun("Bounce", 1.5, (-40, 15, 25))
    
    scene.world = bpy.data.worlds.new("Test_World")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.09, 0.10, 0.12, 1.0)
    scene.render.resolution_x = 600
    scene.render.resolution_y = 720
    
    # Back view
    cam.location = (0.0, -0.92, 0.535)
    cam.rotation_euler = (math.radians(90), 0, 0)
    out_back = os.path.join(FACTORY_DIR, "previews", "arch_test_back.png")
    scene.render.filepath = out_back
    bpy.ops.render.render(write_still=True)
    
    # 3/4 front view
    cam.location = (0.65, 0.65, 0.555)
    cam.rotation_euler = (math.radians(82), 0, math.radians(135))
    out_34 = os.path.join(FACTORY_DIR, "previews", "arch_test_34.png")
    scene.render.filepath = out_34
    bpy.ops.render.render(write_still=True)
    print("Test renders completed successfully.")

if __name__ == "__main__":
    test_render()
