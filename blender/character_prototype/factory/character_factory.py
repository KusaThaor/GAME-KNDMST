import bpy
import bmesh
import math
import os
import sys
import json
import mathutils

# Add factory directory to path so imports succeed
factory_dir = os.path.dirname(os.path.abspath(__file__))
if factory_dir not in sys.path:
    sys.path.insert(0, factory_dir)

import clothing_library
import asset_registry

def hex_to_lin(hex_code, alpha=1.0):
    h = hex_code.lstrip("#")
    if len(h) == 3:
        h = "".join([c*2 for c in h])
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)

def create_or_update_mat(name, hex_color, roughness=0.55, metallic=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_lin(hex_color)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat

def apply_smooth(obj):
    if obj and obj.type == "MESH":
        for p in obj.data.polygons:
            p.use_smooth = True

def link_to_scene(obj):
    if obj and obj.name not in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.link(obj)
    return obj

def remove_objects_by_names(names):
    for name in names:
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)

class CharacterFactory:
    def __init__(self, canonical_blend_path, registry_path=None):
        self.canonical_blend = canonical_blend_path
        self.factory_dir = os.path.dirname(os.path.abspath(__file__))
        if registry_path is None:
            registry_path = os.path.join(self.factory_dir, "asset_registry.json")
        with open(registry_path, "r", encoding="utf-8") as f:
            self.registry = json.load(f)

    def load_base(self):
        print(f"[Factory] Loading canonical base: {self.canonical_blend}")
        bpy.ops.wm.open_mainfile(filepath=self.canonical_blend)
        self.arm = bpy.data.objects.get("Student_Armature")
        if not self.arm:
            raise RuntimeError("Required armature 'Student_Armature' not found in canonical base!")

    def isolate_materials(self, char_id):
        """Creates unique material copies for this character so multiple characters never share materials."""
        mat_map = {}
        for o in bpy.data.objects:
            if o.type == 'MESH':
                for i in range(len(o.data.materials)):
                    m = o.data.materials[i]
                    if m:
                        if m.name not in mat_map:
                            new_m = m.copy()
                            new_m.name = f"{m.name}_{char_id}"
                            mat_map[m.name] = new_m
                        o.data.materials[i] = mat_map[m.name]
        return mat_map

    def apply_skin_tone(self, skin_id, char_id):
        skin_entry = self.registry["categories"]["SKIN"].get(skin_id)
        if not skin_entry:
            skin_entry = self.registry["categories"]["SKIN"]["SKIN_02"]
        hex_color = skin_entry["hex"]
        
        # Target skin material
        mat_skin_name = f"M_Skin_{char_id}"
        mat_skin = bpy.data.materials.get(mat_skin_name)
        if not mat_skin:
            mat_skin = create_or_update_mat(mat_skin_name, hex_color, roughness=0.62)
        else:
            bsdf = mat_skin.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = hex_to_lin(hex_color)
                bsdf.inputs["Roughness"].default_value = 0.62

        # Apply to skin meshes in base
        skin_mesh_names = ["Body_Head", "Ear_L", "Ear_R", "Nose"]
        for name in skin_mesh_names:
            obj = bpy.data.objects.get(name)
            if obj and obj.data.materials:
                obj.data.materials[0] = mat_skin

    def equip_hair(self, hair_id, hair_color_hex, char_id, tie_color_hex=None):
        import hairstyle_library
        return hairstyle_library.equip_character_hair(self.arm, hair_id, hair_color_hex, char_id, tie_color_hex)

    def equip_modular_clothing(self, clothing_spec, skin_hex, char_id):
        """Equips complete modular clothing system using clothing_library"""
        top_id = clothing_spec.get("top_id", "TOP_001")
        bottom_id = clothing_spec.get("bottom_id", "BOTTOM_001")
        footwear_id = clothing_spec.get("footwear_id", "FOOTWEAR_001")
        socks_id = clothing_spec.get("socks_id", "SOCKS_001")
        overrides = clothing_spec.get("color_overrides", {})

        print(f"[Factory] Equipping Modular Clothing: Top={top_id}, Bottom={bottom_id}, Footwear={footwear_id}, Socks={socks_id}")
        return clothing_library.equip_modular_character_clothing(
            self.arm,
            char_id=char_id,
            skin_hex=skin_hex,
            top_id=top_id,
            bottom_id=bottom_id,
            footwear_id=footwear_id,
            socks_id=socks_id,
            overrides=overrides
        )

    def equip_accessories(self, accessories_list, char_id):
        # 1. Clean up existing accessories
        acc_mesh_names = [
            "Acc_Red_Scarf", "Scarf_Wrap", "Scarf_Knot", "Scarf_Tail_L", "Scarf_Tail_R",
            "Acc_Glasses", "Acc_Hair_Clip",
            "Acc_Backpack_Body", "Acc_Backpack_Pocket"
        ]
        remove_objects_by_names(acc_mesh_names)

        for acc_id in accessories_list:
            if acc_id == "ACC_001":
                # Red School Scarf (Khăn quàng đỏ Đội viên authentic stylized Chibi)
                import clothing_library
                clothing_library.build_accessory_001_red_scarf(self.arm, char_id)

            elif acc_id == "ACC_002":
                # Round Glasses
                mat_frame = create_or_update_mat(f"M_Acc_Glasses_{char_id}", "#222226", roughness=0.35)
                bm = bmesh.new()
                for side in [-1, 1]:
                    cx = side * 0.052
                    cz = 0.518
                    cy = 0.158
                    # Circular ring for glasses frame
                    r_segs = 12
                    r_rad = 0.024
                    for i in range(r_segs):
                        ang1 = 2.0 * math.pi * i / r_segs
                        ang2 = 2.0 * math.pi * (i + 1) / r_segs
                        x1, z1 = cx + r_rad * math.cos(ang1), cz + r_rad * math.sin(ang1)
                        x2, z2 = cx + r_rad * math.cos(ang2), cz + r_rad * math.sin(ang2)
                        v1 = bm.verts.new((x1, cy, z1))
                        v2 = bm.verts.new((x2, cy, z2))
                        v3 = bm.verts.new((x2, cy - 0.005, z2))
                        v4 = bm.verts.new((x1, cy - 0.005, z1))
                        bm.faces.new((v1, v2, v3, v4))

                # Bridge
                vb1 = bm.verts.new((-0.028, 0.158, 0.520))
                vb2 = bm.verts.new(( 0.028, 0.158, 0.520))
                vb3 = bm.verts.new(( 0.028, 0.154, 0.523))
                vb4 = bm.verts.new((-0.028, 0.154, 0.523))
                bm.faces.new((vb1, vb2, vb3, vb4))

                mesh = bpy.data.meshes.new(f"Acc_Glasses_Mesh_{char_id}")
                bm.to_mesh(mesh)
                bm.free()
                g_obj = bpy.data.objects.new("Acc_Glasses", mesh)
                g_obj.data.materials.append(mat_frame)
                apply_smooth(g_obj)
                link_to_scene(g_obj)
                vg = g_obj.vertex_groups.new(name="Head")
                vg.add(list(range(len(g_obj.data.vertices))), 1.0, 'REPLACE')
                m = g_obj.modifiers.new("Armature", 'ARMATURE')
                m.object = self.arm

            elif acc_id == "ACC_003":
                # Hair Clip
                mat_clip = create_or_update_mat(f"M_Acc_Clip_{char_id}", "#f4b41a", roughness=0.30)
                bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.145, 0.065, 0.545))
                clip = bpy.context.active_object
                clip.name = "Acc_Hair_Clip"
                clip.scale = (0.012, 0.035, 0.012)
                clip.rotation_euler = (math.radians(-15), math.radians(-10), math.radians(20))
                bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
                sub = clip.modifiers.new("Subdiv", "SUBSURF")
                sub.levels = 1
                clip.data.materials.append(mat_clip)
                apply_smooth(clip)
                vg = clip.vertex_groups.new(name="Head")
                vg.add(list(range(len(clip.data.vertices))), 1.0, 'REPLACE')
                m = clip.modifiers.new("Armature", 'ARMATURE')
                m.object = self.arm

            elif acc_id == "ACC_004":
                # School Backpack
                mat_pack = create_or_update_mat(f"M_Acc_Backpack_{char_id}", "#1a365d", roughness=0.55)
                mat_pocket = create_or_update_mat(f"M_Acc_Backpack_Pocket_{char_id}", "#2a4365", roughness=0.55)

                bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.125, 0.285))
                bp_body = bpy.context.active_object
                bp_body.name = "Acc_Backpack_Body"
                bp_body.scale = (0.20, 0.08, 0.18)
                bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
                sub = bp_body.modifiers.new("Subdiv", "SUBSURF")
                sub.levels = 1
                bp_body.data.materials.append(mat_pack)
                apply_smooth(bp_body)
                vg_bp = bp_body.vertex_groups.new(name="Chest")
                vg_bp.add(list(range(len(bp_body.data.vertices))), 1.0, 'REPLACE')
                m_bp = bp_body.modifiers.new("Armature", 'ARMATURE')
                m_bp.object = self.arm

                bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.170, 0.260))
                bp_pocket = bpy.context.active_object
                bp_pocket.name = "Acc_Backpack_Pocket"
                bp_pocket.scale = (0.15, 0.03, 0.11)
                bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
                sub = bp_pocket.modifiers.new("Subdiv", "SUBSURF")
                sub.levels = 1
                bp_pocket.data.materials.append(mat_pocket)
                apply_smooth(bp_pocket)
                vg_p = bp_pocket.vertex_groups.new(name="Chest")
                vg_p.add(list(range(len(bp_pocket.data.vertices))), 1.0, 'REPLACE')
                m_p = bp_pocket.modifiers.new("Armature", 'ARMATURE')
                m_p.object = self.arm

    def setup_facial_system(self, default_expression, char_id):
        """Sets up smooth morph targets on Mouth and Eyebrows, compatible with GLB export_apply."""
        # 1. Mouth with Shape Keys
        mouth_old = bpy.data.objects.get("Mouth")
        mat_mouth = None
        loc = (0.0, 0.159, 0.480)
        if mouth_old:
            if mouth_old.data.materials:
                mat_mouth = mouth_old.data.materials[0]
            loc = mouth_old.location.copy()
            bpy.data.objects.remove(mouth_old, do_unlink=True)

        if not mat_mouth:
            mat_mouth = create_or_update_mat(f"M_Mouth_{char_id}", "#782d2c", roughness=0.40)

        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.012, location=loc)
        mouth = bpy.context.active_object
        mouth.name = "Mouth"
        mouth.scale = (1.1, 0.25, 0.45)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        apply_smooth(mouth)
        mouth.data.materials.append(mat_mouth)
        vg = mouth.vertex_groups.new(name="Head")
        vg.add(list(range(len(mouth.data.vertices))), 1.0, 'REPLACE')
        mod = mouth.modifiers.new("Armature", "ARMATURE")
        mod.object = self.arm

        # Shape Keys
        mouth.shape_key_add(name="Basis")
        sk_smile = mouth.shape_key_add(name="Mouth_Smile")
        for v in mouth.data.vertices:
            x_factor = abs(v.co.x) / 0.013
            if x_factor > 0.4:
                sk_smile.data[v.index].co.z += 0.0035 * x_factor
                sk_smile.data[v.index].co.x += 0.002 * (1.0 if v.co.x > 0 else -1.0)

        sk_open = mouth.shape_key_add(name="Mouth_Open")
        for v in mouth.data.vertices:
            if v.co.z < 0:
                sk_open.data[v.index].co.z -= 0.007
            sk_open.data[v.index].co.y += 0.002

        sk_o = mouth.shape_key_add(name="Mouth_O")
        for v in mouth.data.vertices:
            sk_o.data[v.index].co.x *= 0.65
            if v.co.z < 0:
                sk_o.data[v.index].co.z -= 0.005
            else:
                sk_o.data[v.index].co.z += 0.003

        sk_sad = mouth.shape_key_add(name="Mouth_Sad")
        for v in mouth.data.vertices:
            x_factor = abs(v.co.x) / 0.013
            if x_factor > 0.4:
                sk_sad.data[v.index].co.z -= 0.0035 * x_factor

        # 2. Eyebrows with Shape Keys
        eb_objects = {}
        for side, sign in [(-1, "L"), (1, "R")]:
            eb_old = bpy.data.objects.get(f"Eyebrow_{sign}")
            mat_eb = None
            eb_loc = (side * 0.052, 0.155, 0.535)
            if eb_old:
                if eb_old.data.materials:
                    mat_eb = eb_old.data.materials[0]
                eb_loc = eb_old.location.copy()
                bpy.data.objects.remove(eb_old, do_unlink=True)

            if not mat_eb:
                mat_eb = bpy.data.materials.get(f"M_Hair_{char_id}") or create_or_update_mat(f"M_Eyebrow_{char_id}", "#1c1615", roughness=0.50)

            bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.008, location=eb_loc)
            eb = bpy.context.active_object
            eb.name = f"Eyebrow_{sign}"
            eb.scale = (2.2, 0.25, 0.40)
            eb.rotation_euler = (0, math.radians(side * 8), math.radians(side * -5))
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            apply_smooth(eb)
            eb.data.materials.append(mat_eb)
            vg = eb.vertex_groups.new(name="Head")
            vg.add(list(range(len(eb.data.vertices))), 1.0, 'REPLACE')
            mod = eb.modifiers.new("Armature", "ARMATURE")
            mod.object = self.arm

            eb.shape_key_add(name="Basis")
            sk_raise = eb.shape_key_add(name="Eyebrow_Raise")
            for v in eb.data.vertices:
                sk_raise.data[v.index].co.z += 0.008

            sk_furrow = eb.shape_key_add(name="Eyebrow_Furrow")
            for v in eb.data.vertices:
                sk_furrow.data[v.index].co.z -= 0.004
                sk_furrow.data[v.index].co.x += side * -0.004

            sk_eb_sad = eb.shape_key_add(name="Eyebrow_Sad")
            for v in eb.data.vertices:
                inner_factor = (eb_loc[0] - v.co.x) * side
                sk_eb_sad.data[v.index].co.z += inner_factor * 0.4

            eb_objects[sign] = eb

        # Apply default expression values if requested
        expr_cfg = self.registry["categories"]["EXPRESSIONS"].get(default_expression, {})
        morphs = expr_cfg.get("morphs", {})
        for m_name, val in morphs.items():
            if m_name in mouth.data.shape_keys.key_blocks:
                mouth.data.shape_keys.key_blocks[m_name].value = val
            for eb in eb_objects.values():
                if m_name in eb.data.shape_keys.key_blocks:
                    eb.data.shape_keys.key_blocks[m_name].value = val

    def apply_height_scale(self, scale_val):
        print(f"[Factory] Applying height scale: {scale_val}")
        self.arm.scale = (scale_val, scale_val, scale_val)
        self.arm.location = self.arm.location * scale_val
        for o in bpy.data.objects:
            if o.type == 'MESH':
                o.location = o.location * scale_val
                o.scale = (scale_val, scale_val, scale_val)

    def export_glb(self, output_glb_path):
        os.makedirs(os.path.dirname(os.path.abspath(output_glb_path)), exist_ok=True)
        print(f"[Factory] Exporting character GLB to: {output_glb_path}")
        
        # Remove temporary non-canonical actions
        temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
        if temp_act:
            bpy.data.actions.remove(temp_act)

        bpy.ops.object.select_all(action="DESELECT")
        self.arm.select_set(True)
        mesh_count = 0
        for o in bpy.data.objects:
            if o.type == 'MESH':
                o.hide_render = False
                o.hide_viewport = False
                o.select_set(True)
                mesh_count += 1

        export_settings = {
            "filepath": output_glb_path,
            "export_format": "GLB",
            "use_selection": True,
            "export_apply": True,
            "export_morph": True,
            "export_animations": True,
            "export_skins": True,
            "export_all_influences": True,
            "export_yup": True
        }
        bpy.ops.export_scene.gltf(**export_settings)
        file_size = os.path.getsize(output_glb_path)
        print(f"[Factory] GLB Export complete! Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
        return file_size

    def validate_eye_integrity(self, allow_glasses=False):
        """Safeguard: Verifies that canonical eyes exist unaltered and no unintended facial meshes intrude."""
        canonical_eyes = {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"}
        existing_objs = {o.name for o in bpy.data.objects}
        missing = canonical_eyes - existing_objs
        if missing:
            raise RuntimeError(f"[Factory Error] Canonical eye objects missing: {missing}")
        if not allow_glasses and "Acc_Glasses" in existing_objs:
            raise RuntimeError("[Factory Error] Acc_Glasses detected when accessories did not request it!")
        return True

    def build_character(self, config, output_glb_path, output_blend_path=None):
        char_id = config.get("character_id", "student_custom")
        print(f"\n==================================================")
        print(f"[Factory] BUILDING CHARACTER: {char_id}")
        print(f"==================================================")

        self.load_base()
        self.isolate_materials(char_id)
        
        # 1. Skin tone
        skin_id = config.get("skin_tone", "SKIN_02")
        self.apply_skin_tone(skin_id, char_id)
        skin_entry = self.registry["categories"]["SKIN"].get(skin_id, self.registry["categories"]["SKIN"]["SKIN_02"])
        skin_hex = skin_entry["hex"]

        # 2. Hairstyle
        hair_id = config.get("hair_style", "HAIR_001")
        hair_color = config.get("hair_color", "#1c1615")
        tie_color = config.get("hair_tie_color")
        self.equip_hair(hair_id, hair_color, char_id, tie_color)

        # 3. Modular Clothing System (Top, Bottom, Footwear, Socks, Adaptive Limbs)
        resolved_clothing = asset_registry.resolve_clothing_config(config, self.registry)
        self.equip_modular_clothing(resolved_clothing, skin_hex, char_id)

        # 4. Accessories
        accessories = config.get("accessories")
        if accessories is None and resolved_clothing.get("preset_used"):
            pdata = self.registry["categories"]["OUTFIT_PRESETS"].get(resolved_clothing["preset_used"], {})
            accessories = pdata.get("accessories", [])
        accessories = accessories or []
        self.equip_accessories(accessories, char_id)
        self.validate_eye_integrity(allow_glasses=("ACC_002" in accessories))

        # 5. Facial system
        expr = config.get("default_expression", "Neutral")
        self.setup_facial_system(expr, char_id)

        # 6. Height scaling
        scale_val = config.get("height_scale", 1.0)
        if abs(scale_val - 1.0) > 0.001:
            self.apply_height_scale(scale_val)

        # 7. Save blend if requested
        if output_blend_path:
            os.makedirs(os.path.dirname(os.path.abspath(output_blend_path)), exist_ok=True)
            bpy.ops.wm.save_as_mainfile(filepath=output_blend_path)
            print(f"[Factory] Saved editable .blend to: {output_blend_path}")

        # 8. Export GLB
        glb_size = self.export_glb(output_glb_path)

        return {
            "character_id": char_id,
            "glb_path": output_glb_path,
            "glb_size_bytes": glb_size,
            "blend_path": output_blend_path,
            "config": config,
            "resolved_clothing": resolved_clothing
        }

if __name__ == "__main__":
    import argparse
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []

    parser = argparse.ArgumentParser(description="Character Factory Generator")
    parser.add_argument("--config", type=str, required=True, help="Path to character JSON config")
    parser.add_argument("--output", type=str, required=True, help="Path to output GLB")
    parser.add_argument("--blend", type=str, default=None, help="Path to output blend")
    parser.add_argument("--base", type=str, default=None, help="Path to canonical base blend")
    
    args = parser.parse_args(argv)

    project_root = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
    canonical_blend = args.base or os.path.join(project_root, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
    
    with open(args.config, "r", encoding="utf-8") as f:
        config = json.load(f)

    factory = CharacterFactory(canonical_blend)
    res = factory.build_character(config, args.output, args.blend)
    print("\n[Factory Execution Completed Successfully!]")
    print(json.dumps(res, indent=2))
