import bpy
import bmesh
import math
from mathutils import Vector
import os
import sys

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

def build_solid_scalp_dome(bm, 
                           rx=0.182, ry=0.172, rz=0.165, center_z=0.528,
                           front_hairline_z=0.595, front_hairline_y=0.138,
                           nape_z=0.440, nape_y=-0.165,
                           ear_z=0.525, ear_x=0.178,
                           puff=0.012, u_segs=24, v_segs=10):
    """
    Creates a full, seamless hair dome covering the entire skull.
    - Front hairline curves naturally above the forehead (Z ~ 0.595)
    - Side borders dip around the ears
    - Back border wraps all the way down to the nape (Z ~ 0.440)
    - Interior is closed or offset so no scalp is exposed
    """
    # Grid of (u, v) where u is around the head (0 to 2pi), v is from crown (v=0) to perimeter (v=1)
    grid = []
    
    # Crown apex
    apex_pos = Vector((0.0, -0.015, center_z + rz + puff + 0.010))
    apex = bm.verts.new(apex_pos)
    
    for v_idx in range(1, v_segs + 1):
        v = v_idx / v_segs  # 0 at crown, 1 at bottom edge
        row = []
        for u_idx in range(u_segs):
            u = 2.0 * math.pi * u_idx / u_segs  # 0 = +Y (front), pi/2 = +X (right), pi = -Y (back), 3pi/2 = -X (left)
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            # Determine base angle phi from vertical
            # phi depends on direction u (front terminates earlier, back extends much lower)
            if cos_u > 0:  # Front half
                # From forehead (u=0) to temples (u=pi/2 or 3pi/2)
                # Front hairline phi is around 55-65 degrees
                max_phi = math.radians(62.0) + (1.0 - cos_u) * math.radians(25.0)
            else:  # Back half
                # From temples to nape (u=pi)
                # Nape phi goes all the way to 125 degrees to cover back of skull
                back_factor = -cos_u  # 0 at temples, 1 at direct back
                max_phi = math.radians(87.0) + back_factor * math.radians(40.0)
                
            phi = v * max_phi
            
            # Parametric ellipsoid coords
            px = (rx + puff) * math.sin(phi) * sin_u
            py = (ry + puff) * math.sin(phi) * cos_u - 0.010
            pz = center_z + (rz + puff) * math.cos(phi)
            
            # Specific anchor adjustments at bottom rim (v == 1)
            if v_idx == v_segs:
                if cos_u > 0.3:  # Direct front hairline
                    pz = max(pz, front_hairline_z)
                    py = min(py, front_hairline_y)
                elif cos_u < -0.3:  # Direct back nape
                    pz = min(pz, nape_z)
                    py = min(py, nape_y)
                else:  # Sides around ear
                    # Ear is at +/-0.155, -0.010, 0.510
                    # Ensure clearance above ear
                    pz = max(pz, ear_z)
                    px = math.copysign(max(abs(px), ear_x), px)
                    
            # Gentle top volume shaping
            if v < 0.6:
                pz += 0.008 * (1.0 - v / 0.6)
                
            vert = bm.verts.new(Vector((px, py, pz)))
            row.append(vert)
        grid.append(row)
        
    # Connect apex to first row
    for u_idx in range(u_segs):
        u_next = (u_idx + 1) % u_segs
        bm.faces.new((apex, grid[0][u_idx], grid[0][u_next]))
        
    # Connect rows
    for v_idx in range(v_segs - 1):
        for u_idx in range(u_segs):
            u_next = (u_idx + 1) % u_segs
            v1 = grid[v_idx][u_idx]
            v2 = grid[v_idx][u_next]
            v3 = grid[v_idx + 1][u_next]
            v4 = grid[v_idx + 1][u_idx]
            bm.faces.new((v1, v2, v3, v4))
            
    return grid[-1]  # return bottom border vertices

print("Solid scalp dome helper defined.")

def test_render_dome():
    import character_factory
    CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    factory.load_base()
    factory.isolate_materials("dome_test")
    factory.apply_skin_tone("SKIN_02", "dome_test")
    
    # Remove old hair
    old_hair = [o for o in bpy.data.objects if o.name.startswith("Hair_")]
    for o in old_hair:
        bpy.data.objects.remove(o, do_unlink=True)
        
    bm = bmesh.new()
    build_solid_scalp_dome(bm)
    
    mesh = bpy.data.meshes.new("Test_Dome_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_Dome_Test", mesh)
    mat = bpy.data.materials.new("M_Dome_Test")
    mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.05, 0.05, 0.05, 1.0)
    mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.80
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.context.collection.objects.link(obj)
    
    scene = bpy.context.scene
    # setup camera
    cam_data = bpy.data.cameras.new("Test_Cam")
    cam_data.lens = 55
    cam = bpy.data.objects.new("Test_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    
    # Back view test
    cam.location = (0.0, -0.92, 0.535)
    cam.rotation_euler = (math.radians(90), 0, 0)
    out_back = os.path.join(FACTORY_DIR, "previews", "dome_test_back.png")
    scene.render.filepath = out_back
    bpy.ops.render.render(write_still=True)
    print(f"Rendered dome test back: {out_back}")

if __name__ == "__main__":
    test_render_dome()
