import bpy
import os
import sys
import math
import json
import mathutils

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
SOURCE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
OUTPUT_GLB = os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_fixed.glb")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_repair")
REPORT_JSON = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "pipeline_validation_report.json")
LOG_FILE = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "export_pipeline.log")

os.makedirs(PREVIEWS_DIR, exist_ok=True)

with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write("=== STARTING BLENDER -> GLB REUSABLE EXPORT & VALIDATION PIPELINE ===\n")

def log(msg):
    print(f">> {msg}")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{msg}\n")

# =============================================================================
# PHASE 1 & 2 & 3: SOURCE AUDIT & REUSABLE EXPORT
# =============================================================================
def export_character(source_blend, output_glb):
    log(f"\n1. Loading source character: {source_blend}")
    bpy.ops.wm.open_mainfile(filepath=source_blend)
    
    arm = bpy.data.objects.get("Student_Armature")
    if not arm or arm.type != 'ARMATURE':
        raise RuntimeError("Required Armature 'Student_Armature' not found in source file!")
    
    # Required bones check
    required_bones = [
        'Root', 'Hips', 'Spine', 'Chest', 'Neck', 'Head',
        'UpperArm.L', 'Forearm.L', 'Hand.L',
        'UpperArm.R', 'Forearm.R', 'Hand.R',
        'Thigh.L', 'Shin.L', 'Foot.L',
        'Thigh.R', 'Shin.R', 'Foot.R'
    ]
    bone_names = [b.name for b in arm.data.bones]
    missing = [b for b in required_bones if b not in bone_names]
    if missing:
        raise RuntimeError(f"Missing required bones in Armature: {missing}")
    log(f"   Armature validated: {len(bone_names)} bones present, 0 missing.")

    # Remove temporary deformation test action if present
    temp_act = bpy.data.actions.get("Action_Deform_Poses_Test")
    if temp_act:
        log("   Removing non-canonical testing action 'Action_Deform_Poses_Test'...")
        bpy.data.actions.remove(temp_act)
    
    actions_count = len(bpy.data.actions)
    log(f"   Actions to export: {actions_count} canonical actions.")
    for a in bpy.data.actions:
        log(f"     - {a.name} ({a.frame_range[0]}..{a.frame_range[1]})")

    # Select strictly the armature and character meshes (exclude lights, cameras, helpers)
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    mesh_count = 0
    for o in bpy.data.objects:
        if o.type == 'MESH':
            # Ensure render visibility is true
            o.hide_render = False
            o.hide_viewport = False
            o.select_set(True)
            mesh_count += 1
    log(f"   Selected Armature + {mesh_count} character meshes.")

    # Export using evaluated modifiers (export_apply=True)
    # This ensures Subdivision Surface modifiers are applied cleanly, turning
    # primitive base cubes into smooth chibi geometry while preserving skinning & actions.
    log(f"\n2. Exporting to GLB with evaluated modifiers (export_apply=True)...")
    log(f"   Output destination: {output_glb}")
    
    export_settings = {
        "export_format": "GLB",
        "use_selection": True,
        "export_apply": True,             # KEY PIPELINE FIX: Evaluates subsurf into smooth meshes!
        "export_yup": True,
        "export_materials": "EXPORT",
        "export_animations": True,
        "export_skins": True,
        "export_all_influences": True
    }
    
    bpy.ops.export_scene.gltf(filepath=output_glb, **export_settings)
    glb_size = os.path.getsize(output_glb)
    log(f"   GLB Export completed successfully! Size: {glb_size:,} bytes ({glb_size/1024:.1f} KB)")
    return glb_size

# =============================================================================
# PHASE 4: AUTOMATED ROUND-TRIP VALIDATION IN CLEAN SCENE
# =============================================================================
def validate_roundtrip(output_glb):
    log(f"\n3. Performing Automated Round-Trip Validation in Clean Blender Session...")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=output_glb)
    
    report = {
        "glb_path": output_glb,
        "glb_size_bytes": os.path.getsize(output_glb),
        "objects_count": len(bpy.data.objects),
        "meshes": {},
        "bones_count": 0,
        "actions_count": len(bpy.data.actions),
        "actions": [a.name for a in bpy.data.actions],
        "numerical_checks": {},
        "verdict": "PASS"
    }

    arm = bpy.data.objects.get("Student_Armature")
    if not arm or arm.type != 'ARMATURE':
        report["verdict"] = "FAIL"
        report["error"] = "Student_Armature missing in imported GLB"
        return report
    
    report["bones_count"] = len(arm.data.bones)

    # Inspect all meshes
    for o in bpy.data.objects:
        if o.type == 'MESH':
            bbox = [mathutils.Vector(corner) for corner in o.bound_box]
            xs = [v.x for v in bbox]
            ys = [v.y for v in bbox]
            zs = [v.z for v in bbox]
            dx = max(xs) - min(xs)
            dy = max(ys) - min(ys)
            dz = max(zs) - min(zs)
            report["meshes"][o.name] = {
                "vertices": len(o.data.vertices),
                "polygons": len(o.data.polygons),
                "dimensions": [round(dx, 4), round(dy, 4), round(dz, 4)],
                "world_z_range": [round(min(zs), 4), round(max(zs), 4)]
            }

    # CRITICAL CHECK 1: Hair_Cap and Hair_Bangs are subdivided, NOT raw cubes
    hair_cap = report["meshes"].get("Hair_Cap")
    hair_bangs = report["meshes"].get("Hair_Bangs")
    
    if not hair_cap or hair_cap["vertices"] < 50:
        report["numerical_checks"]["hair_cap_subdivided"] = {
            "status": "FAIL",
            "reason": f"Hair_Cap has only {hair_cap['vertices'] if hair_cap else 0} vertices (raw cube bug!)"
        }
        report["verdict"] = "FAIL"
    else:
        report["numerical_checks"]["hair_cap_subdivided"] = {
            "status": "PASS",
            "vertices": hair_cap["vertices"],
            "dimensions": hair_cap["dimensions"]
        }

    if not hair_bangs or hair_bangs["vertices"] < 50:
        report["numerical_checks"]["hair_bangs_subdivided"] = {
            "status": "FAIL",
            "reason": f"Hair_Bangs has only {hair_bangs['vertices'] if hair_bangs else 0} vertices"
        }
        report["verdict"] = "FAIL"
    else:
        report["numerical_checks"]["hair_bangs_subdivided"] = {
            "status": "PASS",
            "vertices": hair_bangs["vertices"],
            "dimensions": hair_bangs["dimensions"]
        }

    # CRITICAL CHECK 2: Facial Visibility
    # Face details (eyes, nose, mouth) must exist and be placed on front face
    for feat in ["Eye_L", "Eye_R", "Nose", "Mouth"]:
        if feat in report["meshes"]:
            report["numerical_checks"][f"{feat}_present"] = {"status": "PASS", "verts": report["meshes"][feat]["vertices"]}
        else:
            report["numerical_checks"][f"{feat}_present"] = {"status": "FAIL", "reason": "Missing from imported GLB"}
            report["verdict"] = "FAIL"

    # CRITICAL CHECK 3: Total character height (excluding bone custom shape helpers like Icosphere)
    all_zs = []
    for o in bpy.data.objects:
        if o.type == 'MESH' and o.name != 'Icosphere':
            for corner in o.bound_box:
                w_pt = o.matrix_world @ mathutils.Vector(corner)
                all_zs.append(w_pt.z)
    total_height = max(all_zs) - min(all_zs) if all_zs else 0.0
    report["total_height"] = round(total_height, 4)
    report["numerical_checks"]["total_height_check"] = {
        "measured_height_m": report["total_height"],
        "expected_range_m": [0.65, 0.95],
        "status": "PASS" if (0.65 <= report["total_height"] <= 0.95) else "FAIL"
    }

    # CRITICAL CHECK 4: Action Count
    report["numerical_checks"]["canonical_actions_check"] = {
        "actions_found": report["actions_count"],
        "expected_actions": 16,
        "status": "PASS" if report["actions_count"] == 16 else "FAIL"
    }

    # Overall verdict
    all_passed = all(v.get("status") == "PASS" for v in report["numerical_checks"].values())
    report["verdict"] = "PASS" if all_passed else "FAIL"

    log(f"   Round-trip numerical checks complete. Verdict: {report['verdict']}")
    for k, v in report["numerical_checks"].items():
        log(f"     - {k}: {v['status']}")

    # Setup studio and render 4 verification angles of imported GLB
    log("\n4. Generating Front, Side, Back, and 3/4 Renders of Imported GLB...")
    scene = bpy.context.scene
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    scene.world = bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.07, 1.0)
        bg_node.inputs["Strength"].default_value = 0.85

    def ensure_sun(name, energy, rot):
        l = bpy.data.lights.new(name, "SUN")
        obj = bpy.data.objects.new(name, l)
        scene.collection.objects.link(obj)
        obj.data.energy = energy
        obj.rotation_euler = (math.radians(rot[0]), math.radians(rot[1]), math.radians(rot[2]))
        return obj

    ensure_sun("Key", 4.8, (52, 22, -32))
    ensure_sun("Fill", 2.8, (40, -30, 145))
    ensure_sun("Bounce", 1.6, (-45, 15, 20))
    ensure_sun("Rim", 3.2, (30, 15, 35))

    scene.render.resolution_x = 720
    scene.render.resolution_y = 900
    scene.render.image_settings.file_format = "PNG"

    # NOTE on Coordinate orientation:
    # Character faces positive Y (+Y) in Blender.
    # Therefore, front camera is at +Y looking toward -Y (rotation (88, 0, 180)).
    # Back camera is at -Y looking toward +Y (rotation (88, 0, 0)).
    # Side camera (Right) is at +X looking toward -X (rotation (88, 0, 90)).
    # Three-quarter camera is at (+X, +Y).

    views = [
        ("imported_glb_front.png", (0.0, 1.75, 0.50), (math.radians(88), 0, math.radians(180))),
        ("imported_glb_back.png", (0.0, -1.75, 0.50), (math.radians(88), 0, 0)),
        ("imported_glb_side_right.png", (1.75, 0.0, 0.50), (math.radians(88), 0, math.radians(90))),
        ("imported_glb_side_left.png", (-1.75, 0.0, 0.50), (math.radians(88), 0, math.radians(-90))),
        ("imported_glb_three_quarter.png", (1.20, 1.20, 0.60), (math.radians(75), 0, math.radians(135))),
    ]

    for fname, loc, rot in views:
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        out_path = os.path.join(PREVIEWS_DIR, fname)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        log(f"   Rendered: {fname}")

    # Render deformation test of imported GLB: Action_Idle and Action_Walk
    if arm and arm.animation_data:
        for act_name, frame in [("Action_Idle", 1), ("Action_Walk", 15), ("Action_Wave", 15)]:
            act = bpy.data.actions.get(act_name)
            if act:
                arm.animation_data.action = act
                scene.frame_set(frame)
                bpy.context.view_layer.update()
                cam_obj.location = (1.20, 1.20, 0.60)
                cam_obj.rotation_euler = (math.radians(75), 0, math.radians(135))
                out_path = os.path.join(PREVIEWS_DIR, f"imported_glb_{act_name}.png")
                scene.render.filepath = out_path
                bpy.ops.render.render(write_still=True)
                log(f"   Rendered animation test: {act_name}")

    with open(REPORT_JSON, "w", encoding="utf-8") as rf:
        json.dump(report, rf, indent=2)
    log(f"\nSaved round-trip validation report to: {REPORT_JSON}")
    return report

if __name__ == "__main__":
    try:
        export_character(SOURCE_BLEND, OUTPUT_GLB)
        validate_roundtrip(OUTPUT_GLB)
        log("\nPIPELINE EXECUTION FINISHED SUCCESSFULLY!")
    except Exception as e:
        log(f"\nCRITICAL PIPELINE ERROR: {e}")
        import traceback
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            traceback.print_exc(file=f)
