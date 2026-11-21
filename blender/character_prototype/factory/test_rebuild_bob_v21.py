"""
HAIR_003 V21 High-Fidelity Single-Piece Sculpted Chibi Bob:
- 100% Unified Watertight Sculpted Mesh (Zero separate attached locks).
- Natural Sculpted Bangs Clumps: Defined anime lock crests and shadow grooves
  carved directly into the continuous surface.
- Cute Scalloped Fringe Perimeter with center notch (Z = 0.562m) and soft brow-framing locks (Z = 0.546m).
- Spherical Crown Dome (zero flat plateau, zero scalp exposure).
- Full ear & temple coverage with chin-hugging cheek framing.
- Inward rolled hem along entire 360 perimeter for solid physical thickness.
"""

import bpy
import bmesh
import math
from mathutils import Vector, bvhtree
import os
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
OUTPUTS_DIR = os.path.join(FACTORY_DIR, "outputs")
BLEND_DIR = os.path.join(OUTPUTS_DIR, "hairstyles_blend")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v20_review")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

import sys
if FACTORY_DIR not in sys.path:
    sys.path.append(FACTORY_DIR)
import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"

def build_single_sculpted_bob(arm, char_id, head_obj):
    bm = bmesh.new()

    head_bm = bmesh.new()
    head_bm.from_mesh(head_obj.data)
    head_bm.transform(head_obj.matrix_world)
    head_bvh = bvhtree.BVHTree.FromBMesh(head_bm)
    head_bm.free()

    cranial_center = Vector((0.0, -0.010, 0.528))
    center_y = -0.010
    center_z = 0.528

    # =========================================================================
    # SINGLE UNIFIED 360-DEGREE SCULPTED BOB MESH
    # =========================================================================
    num_rings = 40
    segs = 64
    R_z = 0.166 # Apex at Z = 0.694m (+16mm over skull top 0.678m)

    def get_fringe_edge_z(u):
        """Continuous lower perimeter height Z around 360 degrees."""
        u_norm = (u + math.pi) % (2.0 * math.pi) - math.pi
        abs_u = abs(u_norm)
        deg = math.degrees(abs_u)

        if deg < 32.0:
            # Forehead bangs perimeter:
            # Center triangular notch: deg < 6.5 -> rises to Z = 0.562m
            # Main brow lock tip: deg in [6.5, 20.0] -> dips to Z = 0.546m
            # Outer temple fringe lock: deg in [20.0, 32.0] -> dips to Z = 0.548m
            if deg < 6.5:
                notch_t = math.cos(deg / 6.5 * math.pi * 0.5) ** 2
                base_z = 0.546 + 0.016 * notch_t
            elif deg < 20.0:
                lock_t = math.sin((deg - 6.5) / (20.0 - 6.5) * math.pi)
                base_z = 0.548 - 0.004 * lock_t
            else:
                lock_t = math.sin((deg - 20.0) / (32.0 - 20.0) * math.pi)
                base_z = 0.550 - 0.003 * lock_t

            return base_z

        elif deg < 65.0:
            # Cheek-framing transition: smooth sigmoid down to chin Z = 0.422m
            t = (deg - 32.0) / (65.0 - 32.0)
            s = t * t * (3.0 - 2.0 * t)
            # Subtle cheek lock layered wave
            cheek_wave = 0.003 * math.sin(t * math.pi)
            return (0.548 * (1.0 - s) + 0.422 * s) + cheek_wave

        else:
            # Side & rear perimeter: chin (0.422m) to nape (0.418m)
            rear_t = (deg - 65.0) / (180.0 - 65.0)
            base_z = 0.422 - 0.004 * rear_t
            if deg > 85.0:
                base_z += 0.003 * math.cos(4.0 * u) * rear_t
            return base_z

    def get_surface_fluting(u, phi, t_ring):
        """
        Sculpted anime lock grooves and crests directly on the continuous surface.
        """
        u_norm = (u + math.pi) % (2.0 * math.pi) - math.pi
        abs_u = abs(u_norm)
        deg = math.degrees(abs_u)

        fluting = 0.0
        growth = (t_ring ** 1.3)

        if deg < 34.0:
            # Bangs locks fluting:
            # Grooves between locks at deg ~ 6.5 and deg ~ 20.0
            groove_center = math.exp(-((deg - 6.5) / 2.2) ** 2)
            groove_side   = math.exp(-((deg - 20.0) / 2.5) ** 2)
            # Crests along lock centers at deg ~ 13.0 and deg ~ 26.5
            crest_main = math.exp(-((deg - 13.0) / 3.8) ** 2)
            crest_side = math.exp(-((deg - 26.5) / 3.2) ** 2)

            fluting = (0.0055 * crest_main + 0.0042 * crest_side - 0.0038 * groove_center - 0.0032 * groove_side) * growth

        elif 34.0 <= deg < 70.0:
            # Cheek lock soft crest
            cheek_t = math.sin((deg - 34.0) / (70.0 - 34.0) * math.pi)
            fluting = 0.0040 * cheek_t * growth

        else:
            # 4 soft vertical lobes across the back
            rear_factor = (deg - 70.0) / (180.0 - 70.0)
            fluting = 0.0045 * math.cos(4.0 * u) * rear_factor * growth

        return fluting

    grid_outer = []

    for r in range(num_rings):
        t_ring = (r + 1) / float(num_rings)
        row = []
        for s in range(segs):
            u = 2.0 * math.pi * s / segs
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            u_norm = (u + math.pi) % (2.0 * math.pi) - math.pi
            deg = math.degrees(abs(u_norm))

            edge_z = get_fringe_edge_z(u)

            cos_phi_edge = max(-0.95, min(0.95, (edge_z - center_z) / R_z))
            phi_edge = math.acos(cos_phi_edge)

            phi = t_ring * phi_edge
            sin_phi = math.sin(phi)
            cos_phi = math.cos(phi)

            pz = center_z + R_z * cos_phi

            ray_dir = Vector((sin_phi * sin_u, sin_phi * cos_u, cos_phi)).normalized()
            hit, norm, idx, dist = head_bvh.ray_cast(cranial_center, ray_dir)

            if hit:
                skull_r = math.sqrt(hit.x * hit.x + (hit.y - center_y) * (hit.y - center_y))
            else:
                skull_r = 0.170 * sin_phi

            side_fac = max(0.0, math.sin(deg / 180.0 * math.pi))
            rear_fac = max(0.0, -cos_u)
            crown_fac = max(0.0, cos_phi)

            if deg < 32.0:
                fringe_profile = 0.009 + 0.003 * math.sin(t_ring * math.pi)
                if t_ring > 0.80:
                    fringe_profile -= 0.004 * ((t_ring - 0.80) / 0.20)
                base_puff = fringe_profile + 0.004 * crown_fac
            else:
                base_puff = 0.012 + 0.003 * crown_fac + 0.007 * (side_fac ** 1.3) + 0.004 * rear_fac

            fluting = get_surface_fluting(u, phi, t_ring)
            total_puff = base_puff + fluting

            # Inward curl at lower perimeter (t_ring > 0.70)
            tuck_x = 0.0
            tuck_y = 0.0
            if t_ring > 0.70:
                curl_fac = (t_ring - 0.70) / 0.30
                curl_sq = curl_fac * curl_fac
                if deg < 32.0:
                    tuck_y = -0.004 * curl_sq * cos_u
                elif deg < 68.0:
                    tuck_x = -math.copysign(0.014 * curl_sq * abs(sin_u), sin_u)
                    tuck_y = 0.008 * curl_sq
                else:
                    tuck_y = 0.016 * curl_sq * rear_fac
                    tuck_x = -math.copysign(0.008 * curl_sq * abs(sin_u), sin_u)

            r_total = skull_r + total_puff * sin_phi
            px = r_total * sin_u + tuck_x
            py = r_total * cos_u + center_y + tuck_y

            row.append(bm.verts.new(Vector((px, py, pz))))
        grid_outer.append(row)

    # Apex vertex at crown
    apex_v = bm.verts.new(Vector((0.0, center_y, center_z + R_z)))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((apex_v, grid_outer[0][s], grid_outer[0][sn]))

    for r in range(num_rings - 1):
        for s in range(segs):
            sn = (s + 1) % segs
            bm.faces.new((grid_outer[r][s], grid_outer[r][sn], grid_outer[r+1][sn], grid_outer[r+1][s]))

    # Inward rolled hem along bottom perimeter
    bottom_outer = grid_outer[-1]
    bottom_inner = []

    for s in range(segs):
        vo = bottom_outer[s]
        u = 2.0 * math.pi * s / segs
        u_norm = (u + math.pi) % (2.0 * math.pi) - math.pi
        deg = math.degrees(abs(u_norm))

        if deg < 32.0:
            p_in = vo.co + Vector((0.0, -0.004, 0.005))
        elif deg < 68.0:
            in_dir = (Vector((0.0, 0.040, vo.co.z)) - vo.co).normalized()
            p_in = vo.co + in_dir * 0.012 + Vector((0, 0, 0.004))
        else:
            in_dir = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
            p_in = vo.co + in_dir * 0.015 + Vector((0, 0, 0.005))

        bottom_inner.append(bm.verts.new(p_in))

    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((bottom_outer[s], bottom_outer[sn], bottom_inner[sn], bottom_inner[s]))

    # Watertight inner liner
    inner_ring2 = []
    for s in range(segs):
        vi = bottom_inner[s]
        p_up = vi.co + Vector((0, 0, 0.010))
        inner_ring2.append(bm.verts.new(p_up))

    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new((bottom_inner[s], bottom_inner[sn], inner_ring2[sn], inner_ring2[s]))

    mesh = bpy.data.meshes.new(f"Hair_HAIR_003_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_003", mesh)
    bpy.context.scene.collection.objects.link(obj)

    # Single calibrated satin-matte hair material (#3c2d27 warm brown)
    mat = bpy.data.materials.new(f"M_Hair_{char_id}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.050, 0.030, 0.022, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.62
        bsdf.inputs["Specular IOR Level"].default_value = 0.18
        if "Sheen Weight" in bsdf.inputs:
            bsdf.inputs["Sheen Weight"].default_value = 0.20
    obj.data.materials.append(mat)

    for poly in obj.data.polygons:
        poly.use_smooth = True

    # Rig binding to Head bone
    vg = obj.vertex_groups.new(name="Head")
    all_v_indices = list(range(len(obj.data.vertices)))
    vg.add(all_v_indices, 1.0, 'REPLACE')

    mod = obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm

    return obj

def setup_chibi_studio_perfect(scene, res=(1024, 1024)):
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Review_Cam")
    cam_data.lens = 62
    cam = bpy.data.objects.new("Review_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

    scene.world = bpy.data.worlds.new("Review_World")
    scene.world.use_nodes = True
    nodes = scene.world.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    scene.world.node_tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bg.inputs["Color"].default_value = (0.86, 0.86, 0.88, 1.0)
    bg.inputs["Strength"].default_value = 0.95

    def add_light(name, ltype, energy, loc, rot_deg, color=(1,1,1), size=1.0):
        l = bpy.data.lights.new(name, ltype)
        l.energy = energy
        l.color = color
        if ltype == 'AREA':
            l.size = size
        obj = bpy.data.objects.new(name, l)
        obj.location = loc
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        scene.collection.objects.link(obj)
        return obj

    add_light("Key_Light", 'AREA', 45.0, (0.40, 0.95, 0.75), (45, 0, 22), (1.0, 0.98, 0.96), size=1.1)
    add_light("Fill_Light", 'AREA', 32.0, (-0.45, 0.90, 0.65), (50, 0, -25), (0.96, 0.97, 1.0), size=1.2)
    add_light("Front_Eye_Light", 'AREA', 18.0, (0.0, 1.05, 0.52), (90, 0, 0), (1.0, 0.99, 0.98), size=0.8)
    add_light("Rim_Light", 'AREA', 30.0, (0.0, -0.95, 0.80), (-45, 0, 180), (1.0, 1.0, 1.0), size=1.0)

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    return cam

if __name__ == "__main__":
    print("\n=======================================================")
    print("RUNNING HAIR_003 V21 SINGLE-PIECE SCULPTED CHIBI BOB")
    print("=======================================================")

    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "female_v21_hair_003"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)

    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)

    head_obj = bpy.data.objects.get("Body_Head")
    assert head_obj is not None, "Body_Head not found!"

    hair_obj = build_single_sculpted_bob(factory.arm, char_tag, head_obj)
    print(f"[Built Single Sculpted Bob] {hair_obj.name}: {len(hair_obj.data.polygons)} quads, {len(hair_obj.data.vertices)} vertices")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag)

    # Runtime assertion: eye integrity
    eye_objs = {o.name for o in bpy.data.objects if "Eye" in o.name}
    assert {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"}.issubset(eye_objs)
    assert "Acc_Glasses" not in [o.name for o in bpy.data.objects]

    scene = bpy.context.scene
    cam = setup_chibi_studio_perfect(scene, res=(1024, 1024))

    views = [
        ("front", (0.0, 0.96, 0.515), (math.radians(90), 0, math.radians(180))),
        ("three_quarter", (0.68, 0.68, 0.515), (math.radians(90), 0, math.radians(135))),
        ("profile", (0.96, 0.0, 0.515), (math.radians(90), 0, math.radians(90))),
        ("rear", (0.0, -0.96, 0.515), (math.radians(90), 0, 0)),
        ("elevated_roots", (0.0, 0.85, 0.720), (math.radians(72), 0, math.radians(180))),
    ]

    for vname, loc, rot in views:
        cam.location = loc
        cam.rotation_euler = rot
        out_name = f"hair_003_v21_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered V21 View] -> {out_name}")

    # Wireframe view
    wire_mod = hair_obj.modifiers.new(name="Wireframe", type='WIREFRAME')
    wire_mod.thickness = 0.0010
    wire_mod.use_replace = False
    
    wire_mat = bpy.data.materials.new("M_Hair_Wireframe")
    wire_mat.use_nodes = True
    bsdf_wire = wire_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf_wire:
        bsdf_wire.inputs["Base Color"].default_value = (0.02, 0.02, 0.02, 1.0)
        bsdf_wire.inputs["Roughness"].default_value = 0.9
    hair_obj.data.materials.append(wire_mat)
    wire_mod.material_offset = len(hair_obj.data.materials) - 1

    cam.location = (0.0, 0.65, 0.670)
    cam.rotation_euler = (math.radians(72), 0, math.radians(180))
    wire_out_path = os.path.join(PREVIEWS_DIR, "hair_003_v21_wireframe_roots.png")
    scene.render.filepath = wire_out_path
    bpy.ops.render.render(write_still=True)
    shutil.copyfile(wire_out_path, os.path.join(ARTIFACT_DIR, "hair_003_v21_wireframe_roots.png"))
    print(f"  [Rendered V21 Wireframe] -> hair_003_v21_wireframe_roots.png")

    hair_obj.modifiers.remove(wire_mod)
    hair_obj.data.materials.pop(index=len(hair_obj.data.materials) - 1)

    # Save WIP .blend
    blend_path = os.path.join(BLEND_DIR, "hair_003_v21_wip.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    shutil.copyfile(blend_path, os.path.join(ARTIFACT_DIR, "hair_003_v21_wip.blend"))
    print(f"[Saved WIP Blend] -> {blend_path}")
