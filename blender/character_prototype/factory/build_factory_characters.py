import os
import sys
import json
import subprocess

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
PRESETS_DIR = os.path.join(FACTORY_DIR, "presets")
SCENES_DIR = os.path.join(FACTORY_DIR, "generated_scenes")
OUTPUT_ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets", "characters")
REPORT_PATH = os.path.join(FACTORY_DIR, "factory_generation_report.json")

os.makedirs(SCENES_DIR, exist_ok=True)
os.makedirs(OUTPUT_ASSETS_DIR, exist_ok=True)

# Add factory directory to sys.path
sys.path.insert(0, FACTORY_DIR)
from character_factory import CharacterFactory
from asset_registry import validate_character_config, load_registry

def generate_all_characters():
    registry = load_registry()
    canonical_blend = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "Chibi_Base_Canonical_v1.blend")
    
    preset_files = [
        "character_a.json",
        "character_b.json",
        "character_c.json",
        "character_backpack.json"
    ]

    report = {
        "status": "PASS",
        "total_characters": len(preset_files),
        "characters": []
    }

    factory = CharacterFactory(canonical_blend)

    for p_file in preset_files:
        p_path = os.path.join(PRESETS_DIR, p_file)
        with open(p_path, "r", encoding="utf-8") as f:
            cfg = json.load(f)

        char_id = cfg["character_id"]
        print(f"\n>>> [Pipeline] Processing {char_id} from {p_file}...")

        # Validation
        v_res = validate_character_config(cfg, registry)
        if not v_res["valid"]:
            print(f"Validation FAILED for {char_id}: {v_res['errors']}")
            report["status"] = "FAIL"
            report["characters"].append({"character_id": char_id, "valid": False, "errors": v_res["errors"]})
            continue

        out_glb = os.path.join(OUTPUT_ASSETS_DIR, f"{char_id}.glb")
        out_blend = os.path.join(SCENES_DIR, f"{char_id}.blend")

        build_res = factory.build_character(cfg, out_glb, out_blend)
        build_res["validation"] = v_res
        report["characters"].append(build_res)

    with open(REPORT_PATH, "w", encoding="utf-8") as rf:
        json.dump(report, rf, indent=2)

    print(f"\n>>> [Pipeline] All characters generated! Report saved to {REPORT_PATH}")
    return report

if __name__ == "__main__":
    generate_all_characters()
