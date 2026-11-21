"""
Test Perfect Sculpted HAIR_008 (Dual-Lobed Peach Skull & Animal Crossing Plumes)
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler
import os
import sys

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
if FACTORY_DIR not in sys.path:
    sys.path.insert(0, FACTORY_DIR)

import character_factory
from hairstyle_library import hex_to_linear_rgb, bind_hair_to_armature
from fix_perfect_art_pilots import (
    setup_production_studio,
    create_chibi_hair_material,
    create_scrunchie_material,
    apply_clean_subsurf,
    add_marshmallow_tie,
    add_sculpted_chibi_plume
)

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"
OUT_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v10")

def build_perfect_hair_008(arm, char_id, color_hex="#2b201c", tie_hex="#f5b82e"):
    bm = bmesh.new()
    
    center_y = -0.010
    center_z = 0.528
    rx = 0.186
    ry = 0.176
    rz = 0.166
    
    segs_half = 20
    num_rings = 16
    
    grid_left = []
    grid_right = []
    
    for r in range(num_rings):
        v = r / (num_rings - 1)
        row_l = []
        row_r = []
        
        for s in range(segs_half + 1):
            u = math.pi * s / segs_half  # 0 at front center, pi at back center
            sin_u = math.sin(u)
            cos_u = math.cos(u)
            
            if cos_u > 0.15:
                max_phi = math.radians(60.0)
            elif cos_u < -0.15:  # HIGH GATHERED NAPE WITH INVERTED ARCH (Ref Image 2)
                # At center seam (X=0): arch up to Z ~ 0.535 (max_phi ~ 74 deg)
                # At lobe peak (X ~ 0.08m): dip down to Z ~ 0.475 (max_phi ~ 88 deg)
                seam_dist_arch = math.pi - u
                arch_dip = math.sin(min(1.0, seam_dist_arch / 0.75) * math.pi) * math.radians(16.0)
                max_phi = math.radians(72.0) + arch_dip
            else:
                max_phi = math.radians(74.0)
                
            phi = v * max_phi
            
            base_x = rx * math.sin(phi) * sin_u
            base_y = ry * math.sin(phi) * cos_u + center_y
            base_z = center_z + rz * math.cos(phi)
            
            # --- TRUE DUAL ROUNDED PEACH LOBES (Reference Image 2) ---
            # Center cleft at X=0 runs from crown all the way to nape!
            if cos_u < 0.0:
                seam_dist = math.pi - u  # 0 at center seam X=0
                
                # Deep cleft: At X=0, hair stays snug at scalp
                # At seam_dist ~ 0.55 (X ~ 0.08m), swells into a bulbous, plump peach cheek
                cleft_shape = math.sin(min(1.0, seam_dist / 0.85) * math.pi)
                lobe_puff = cleft_shape * 0.038 * (v ** 0.30)
                
                base_y -= lobe_puff * 1.35   # pushes out behind
                base_x += lobe_puff * 0.45   # pushes out to sides
                
                # At center seam X=0 (s == segs_half), pull forward to carve the deep vertical groove
                if s == segs_half:
                    base_y += 0.014 * (v ** 0.4)
                    
            # Ear notch
            if abs(cos_u) < 0.22 and v > 0.60:
                ear_dist = math.sqrt((base_x - 0.166)**2 + (base_y + 0.005)**2 + (base_z - 0.515)**2)
                if ear_dist < 0.038:
                    base_z += (0.038 - ear_dist) * 0.85
                    base_x = max(base_x, 0.184)
                    
            vr = bm.verts.new(Vector((base_x, base_y, base_z)))
            row_r.append(vr)
            
            if s == 0 or s == segs_half:
                vl = vr
            else:
                vl = bm.verts.new(Vector((-base_x, base_y, base_z)))
            row_l.append(vl)
            
        grid_right.append(row_r)
        grid_left.append(row_l)
        
    for r in range(num_rings - 1):
        for s in range(segs_half):
            bm.faces.new((grid_right[r][s], grid_right[r][s+1], grid_right[r+1][s+1], grid_right[r+1][s]))
            bm.faces.new((grid_left[r][s+1], grid_left[r][s], grid_left[r+1][s], grid_left[r+1][s+1]))
            
    apex = bm.verts.new(Vector((0.0, center_y, center_z + rz + 0.003)))
    for s in range(segs_half):
        bm.faces.new((apex, grid_right[0][s], grid_right[0][s+1]))
        bm.faces.new((apex, grid_left[0][s+1], grid_left[0][s]))
        
    for side_grid in [grid_right, grid_left]:
        rim_out = side_grid[-1]
        rim_in = []
        for s in range(len(rim_out)):
            vo = rim_out[s]
            p_in = vo.co + (Vector((0, center_y, vo.co.z)) - vo.co).normalized() * 0.012 + Vector((0, 0, 0.006))
            rim_in.append(bm.verts.new(p_in))
        for s in range(len(rim_out) - 1):
            bm.faces.new((rim_out[s], rim_out[s+1], rim_in[s+1], rim_in[s]))

    # Front curtain bangs
    b_cols = 22
    b_rows = 6
    bang_grid = []
    for r in range(b_rows):
        v = r / (b_rows - 1)
        row = []
        for c in range(b_cols):
            u = c / (b_cols - 1)
            ang_deg = 68.0 - u * 136.0  # Expands seamlessly across temples
            theta = math.radians(ang_deg)
            
            v_cut = math.exp(-((u - 0.50) ** 2) / 0.010) * 6.0
            phi_root = math.radians(35.0)
            phi_tip = math.radians(72.0 - v_cut)  # Z ~ 0.582 (ABOVE EYEBROWS!)
            phi = phi_root * (1.0 - v) + phi_tip * v
            
            puff = 0.005 + math.sin(v * math.pi) * 0.007
            px = (rx + puff) * math.sin(phi) * (-math.sin(theta))
            py = (ry + puff) * math.sin(phi) * math.cos(theta) + center_y
            pz = center_z + (rz + puff) * math.cos(phi)
            row.append(bm.verts.new(Vector((px, py, pz))))
        bang_grid.append(row)
        
    for r in range(b_rows - 1):
        for c in range(b_cols - 1):
            bm.faces.new((bang_grid[r][c], bang_grid[r][c+1], bang_grid[r+1][c+1], bang_grid[r+1][c]))
            
    b_rim_out = bang_grid[-1]
    b_rim_in = []
    for c in range(b_cols):
        vo = b_rim_out[c]
        p_in = vo.co + Vector((0, -0.010, 0.006))
        b_rim_in.append(bm.verts.new(p_in))
    for c in range(b_cols - 1):
        bm.faces.new((b_rim_out[c], b_rim_out[c+1], b_rim_in[c+1], b_rim_in[c]))

    # Plump bouncy teardrop pigtail bunches (Animal Crossing Reference Image 1)
    for sign in [-1, 1]:
        tie_center = Vector((sign * 0.170, -0.045, 0.575))
        
        # Marshmallow scrunchie
        add_marshmallow_tie(bm, tie_center, axis=(sign * 0.60, -0.20, 0.75),
                            major_r=0.023, minor_r=0.011, num_puffs=6, mat_index=1)
        
        # Plump bouncy teardrop plume that cascades DOWN gently framing the face
        pigtail_spine = [
            (sign * 0.170, -0.048, 0.575),
            (sign * 0.200, -0.055, 0.565),  # gentle outward crest
            (sign * 0.208, -0.045, 0.490),  # plump teardrop belly
            (sign * 0.185, -0.028, 0.420),  # curves down toward collar
            (sign * 0.160, -0.015, 0.380)   # tapered cute tip
        ]
        add_sculpted_chibi_plume(bm, pigtail_spine,
                                width_profile=(0.040, 0.070, 0.016),
                                thick_profile=(0.028, 0.045, 0.012), segs=6, mat_index=0)
        
        # Clean Animal Crossing cheek contour (no disconnected floating cheek strands)

    mesh = bpy.data.meshes.new(f"Hair_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("Hair_HAIR_008_v10", mesh)
    mat_hair = create_chibi_hair_material(f"M_Hair_{char_id}", color_hex, roughness=0.62)
    mat_tie = create_scrunchie_material(f"M_Tie_{char_id}", tie_hex)
    obj.data.materials.append(mat_hair)
    obj.data.materials.append(mat_tie)
    apply_clean_subsurf(obj, levels=1)
    bpy.context.collection.objects.link(obj)
    bind_hair_to_armature(obj, arm)
    return obj

def run():
    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "v10_hair_008"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)
    
    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)
            
    arm = factory.arm
    build_perfect_hair_008(arm, char_tag, "#2b201c", "#f5b82e")
    
    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories(["ACC_002"], char_tag)
    
    blend_path = os.path.join(OUT_DIR, "hair_008_v10_source.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    
    glb_path = os.path.join(OUT_DIR, "character_hair_008_v10.glb")
    factory.export_glb(glb_path)
    
    scene = bpy.context.scene
    cam = setup_production_studio(scene, res=(720, 840))
    
    views = [
        ("front", (0.0, 0.95, 0.535), (math.radians(90), 0, math.radians(180))),
        ("three_quarter", (0.68, 0.68, 0.555), (math.radians(82), 0, math.radians(135))),
        ("side", (0.95, 0.0, 0.535), (math.radians(90), 0, math.radians(90))),
        ("back", (0.0, -0.95, 0.535), (math.radians(90), 0, 0))
    ]
    
    for vname, loc, rot in views:
        cam.location = loc
        cam.rotation_euler = rot
        out_img = os.path.join(OUT_DIR, f"hair_008_{vname}.png")
        scene.render.filepath = out_img
        bpy.ops.render.render(write_still=True)
        print(f"Rendered {vname} -> {out_img}")

if __name__ == "__main__":
    run()
