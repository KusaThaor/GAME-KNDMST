"""
HAIR_003 V22 Refined Chibi Bob (Arched Bangs with Visible Eyebrows & Extended Sides):
User direct guidance:
1. "phần mái fix cong cong như này này, lưu ý vẫn có lông mày nha":
   - Inverted V / arched peak in center of forehead (Z = 0.604m at deg = 0).
   - Arches gracefully down over each eye/eyebrow (Z = 0.576m at deg = 24).
   - Eyebrows (Z in [0.566, 0.572]) remain fully uncovered and clearly visible below the arched bangs on the face.
   - Symmetrical curtain bangs flow with subtle center parting groove and soft curved lock volumes.
2. "phần bên kéo vầy luôn":
   - Side panels extend forward to cheek frame (transition completes by deg = 38).
   - Radius maintained at ~0.183m across all side panels (deg 30 to 125) below ear height so hair does not suck into jaw/throat.
   - Gentle forward sweep (tuck_y = +0.006m) along cheek/jaw to hug jawline and cover ear, exactly matching user's painted highlight.
   - Side panels fall vertically with zero inward hook (tuck_x = 0.0).
   - Lower back section falls directly toward nape with a gently curved, nearly level hem.
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
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v22_review")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

import sys
if FACTORY_DIR not in sys.path:
    sys.path.append(FACTORY_DIR)
import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"

def build_refined_bob_v22(arm, char_id, head_obj):
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
    # SINGLE UNIFIED 360-DEGREE SCULPTED BOB MESH (HIGH RESOLUTION: 44x96)
    # =========================================================================
    num_rings = 44
    segs = 96
    R_z = 0.166 # Apex at Z = 0.694m (+16mm over skull top 0.678m)

    def get_fringe_edge_z(u):
        """Continuous lower perimeter height Z around 360 degrees."""
        u_norm = (u + math.pi) % (2.0 * math.pi) - math.pi
        abs_u = abs(u_norm)
        deg = math.degrees(abs_u)

        if deg < 24.0:
            # Forehead arched bangs ("phần mái fix cong cong như này này"):
            # Inverted V / arch peak at center (deg = 0): Z = 0.604m
            # Arches down over the eyebrows to Z = 0.576m at deg = 24.
            # Eyebrows are at Z in [0.566, 0.572], so both eyebrows are clearly visible!
            t = deg / 24.0
            arch = (1.0 - (t ** 0.95))
            return 0.576 + 0.028 * arch

        elif deg < 38.0:
            # Cheek transition ("phần bên kéo vầy luôn"):
            # Smooth descent to chin level Z = 0.422m outside the eye
            t = (deg - 24.0) / (38.0 - 24.0)
            s = t * t * (3.0 - 2.0 * t) # Cubic smoothstep
            return 0.576 * (1.0 - s) + 0.422 * s

        else:
            # Side & rear hem: chin (0.422m) around to nape (0.420m)
            rear_t = (deg - 38.0) / (180.0 - 38.0)
            base_z = 0.422 - 0.002 * rear_t
            return base_z

    def get_surface_fluting(u, phi, t_ring):
        """
        Sculpted anime lock grooves and crests directly on continuous surface.
        """
        u_norm = (u + math.pi) % (2.0 * math.pi) - math.pi
        abs_u = abs(u_norm)
        deg = math.degrees(abs_u)
        signed_deg = math.degrees(u_norm)

        growth = (t_ring ** 1.3)

        if deg < 24.0:
            # Curtain bangs: soft parting groove in center, curved lock crest over each arch
            parting = math.exp(-((signed_deg) / 3.0) ** 2)
            crest_l = math.exp(-((signed_deg - 13.0) / 5.0) ** 2)
            crest_r = math.exp(-((signed_deg + 13.0) / 5.0) ** 2)
            return (0.0040 * (crest_l + crest_r) - 0.0025 * parting) * growth

        elif 24.0 <= deg < 60.0:
            # Cheek lock soft vertical flow
            cheek_t = math.sin((deg - 24.0) / (60.0 - 24.0) * math.pi)
            return 0.0035 * cheek_t * growth

        else:
            # 4 soft vertical lobes across the back
            rear_factor = (deg - 60.0) / (180.0 - 60.0)
            return 0.0035 * math.cos(4.0 * u) * rear_factor * growth

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

            if deg < 24.0:
                fringe_profile = 0.015 + 0.003 * math.sin(t_ring * math.pi)
                if t_ring > 0.85:
                    fringe_profile -= 0.003 * ((t_ring - 0.85) / 0.15)
                base_puff = fringe_profile + 0.004 * crown_fac
            else:
                base_puff = 0.012 + 0.003 * crown_fac + 0.007 * (side_fac ** 1.3) + 0.004 * rear_fac

            fluting = get_surface_fluting(u, phi, t_ring)
            total_puff = base_puff + fluting

            # =================================================================
            # SIDE PANEL EXTENSION & FORWARD CHEEK/JAW SWEEP ("phần bên kéo vầy luôn")
            # =================================================================
            tuck_x = 0.0
            tuck_y = 0.0

            if t_ring > 0.70:
                curl_fac = (t_ring - 0.70) / 0.30
                curl_sq = curl_fac * curl_fac

                if deg < 24.0:
                    tuck_y = -0.003 * curl_sq * cos_u
                elif deg < 42.0:
                    # Cheek framing panel: forward sweep (+0.006m in +Y) to hug jawline
                    # and cover ear, exactly matching user's painted highlight!
                    cheek_w = math.sin((deg - 24.0) / (42.0 - 24.0) * math.pi)
                    tuck_x = 0.0
                    tuck_y = 0.006 * curl_sq * cheek_w
                elif deg < 70.0:
                    tuck_x = 0.0
                    tuck_y = 0.004 * curl_sq
                else:
                    # Lower back falls directly toward nape
                    tuck_y = 0.007 * curl_sq * rear_fac
                    tuck_x = 0.0

            r_total = skull_r + total_puff * sin_phi

            # Maintain side panel radius ~0.183m from deg = 28 to deg = 125
            if 28.0 <= deg <= 125.0 and t_ring > 0.55:
                t_low = (t_ring - 0.55) / 0.45
                side_w = math.sin((deg - 28.0) / (125.0 - 28.0) * math.pi)
                target_r = 0.183 - 0.002 * t_low
                r_total = (1.0 - side_w) * r_total + side_w * max(r_total, target_r)

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

        if deg < 24.0:
            # Forehead arched bangs bottom bevel
            p_in = vo.co + Vector((0.0, -0.004, 0.005))
        elif deg < 50.0:
            # Cheek panel bottom tip: slight rounding tucked inward beside jaw
            in_dir = (Vector((0.0, 0.020, vo.co.z)) - vo.co).normalized()
            p_in = vo.co + in_dir * 0.008 + Vector((0, 0, 0.004))
        else:
            # Back hem
            in_dir = (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized()
            p_in = vo.co + in_dir * 0.010 + Vector((0, 0, 0.005))

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

    # Calibrated satin-matte hair material (#3c2d27 warm brown)
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
    print("RUNNING HAIR_003 V22 ARCHED BANGS & EXTENDED SIDES")
    print("=======================================================")

    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "female_v22_hair_003"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)

    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)

    head_obj = bpy.data.objects.get("Body_Head")
    assert head_obj is not None, "Body_Head not found!"

    hair_obj = build_refined_bob_v22(factory.arm, char_tag, head_obj)
    print(f"[Built Refined V22 Bob] {hair_obj.name}: {len(hair_obj.data.polygons)} quads, {len(hair_obj.data.vertices)} vertices")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag)

    # Runtime assertion: eye and eyebrow integrity
    eye_objs = {o.name for o in bpy.data.objects if "Eye" in o.name}
    assert {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R", "Eyebrow_L", "Eyebrow_R"}.issubset(eye_objs)
    assert "Acc_Glasses" not in [o.name for o in bpy.data.objects]

    scene = bpy.context.scene
    cam = setup_chibi_studio_perfect(scene, res=(1024, 1024))

    views = [
        ("front", (0.0, 0.96, 0.515), (math.radians(90), 0, math.radians(180))),
        ("three_quarter", (0.68, 0.68, 0.515), (math.radians(90), 0, math.radians(135))),
        ("profile", (0.96, 0.0, 0.515), (math.radians(90), 0, math.radians(90))),
        ("rear", (0.0, -0.96, 0.515), (math.radians(90), 0, 0)),
    ]

    for vname, loc, rot in views:
        cam.location = loc
        cam.rotation_euler = rot
        out_name = f"hair_003_v22_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered V22 View] -> {out_name}")

    # Save WIP .blend
    blend_path = os.path.join(BLEND_DIR, "hair_003_v22_wip.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    shutil.copyfile(blend_path, os.path.join(ARTIFACT_DIR, "hair_003_v22_wip.blend"))
    print(f"[Saved WIP Blend] -> {blend_path}")
