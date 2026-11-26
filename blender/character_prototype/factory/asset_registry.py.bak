"""
=============================================================================
ASSET REGISTRY & CONFIGURATION VALIDATOR V2
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life 3D Narrative Game
=============================================================================
"""

import json
import os

REGISTRY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "asset_registry.json")

def load_registry(registry_path=REGISTRY_PATH):
    if not os.path.exists(registry_path):
        raise FileNotFoundError(f"Registry not found: {registry_path}")
    with open(registry_path, "r", encoding="utf-8") as f:
        return json.load(f)

def resolve_clothing_config(config, registry=None):
    """
    Resolves top_id, bottom_id, footwear_id, socks_id from either:
    1. Direct modular keys: top_id, bottom_id, footwear_id, socks_id
    2. Preset key: outfit_preset (e.g. PRESET_001)
    3. Legacy key: outfit (e.g. OUTFIT_001 -> alias_preset -> PRESET_001)
    """
    if registry is None:
        registry = load_registry()

    resolved = {
        "top_id": None,
        "bottom_id": None,
        "footwear_id": None,
        "socks_id": None,
        "preset_used": None,
        "color_overrides": config.get("color_overrides", {})
    }

    # Case A: Explicit modular keys given
    if "top_id" in config and "bottom_id" in config:
        resolved["top_id"] = config.get("top_id")
        resolved["bottom_id"] = config.get("bottom_id")
        resolved["footwear_id"] = config.get("footwear_id", "FOOTWEAR_001")
        resolved["socks_id"] = config.get("socks_id", "SOCKS_001")
        return resolved

    # Case B: outfit_preset specified
    preset_id = config.get("outfit_preset")
    if not preset_id and "outfit" in config:
        legacy_val = config.get("outfit")
        if legacy_val in registry["categories"].get("OUTFIT_PRESETS", {}):
            preset_id = legacy_val
        elif legacy_val in registry["categories"].get("OUTFIT", {}):
            preset_id = registry["categories"]["OUTFIT"][legacy_val].get("alias_preset", "PRESET_001")
        else:
            preset_id = "PRESET_001"

    if preset_id and preset_id in registry["categories"].get("OUTFIT_PRESETS", {}):
        p_info = registry["categories"]["OUTFIT_PRESETS"][preset_id]
        resolved["top_id"] = p_info["top_id"]
        resolved["bottom_id"] = p_info["bottom_id"]
        resolved["footwear_id"] = p_info["footwear_id"]
        resolved["socks_id"] = p_info["socks_id"]
        resolved["preset_used"] = preset_id
        return resolved

    # Fallback to default school uniform
    resolved["top_id"] = "TOP_001"
    resolved["bottom_id"] = "BOTTOM_001"
    resolved["footwear_id"] = "FOOTWEAR_001"
    resolved["socks_id"] = "SOCKS_001"
    resolved["preset_used"] = "PRESET_001"
    return resolved

def validate_character_config(config, registry=None):
    if registry is None:
        registry = load_registry()

    errors = []
    warnings = []

    # 1. Check required base fields
    base_required = ["character_id", "skin_tone", "hair_style", "hair_color"]
    for field in base_required:
        if field not in config:
            errors.append(f"Missing required field: '{field}'")

    # 2. Check skin tone
    skin_id = config.get("skin_tone")
    if skin_id and skin_id not in registry["categories"]["SKIN"]:
        errors.append(f"Invalid skin_tone: '{skin_id}'. Available: {list(registry['categories']['SKIN'].keys())}")

    # 3. Check hairstyle
    hair_id = config.get("hair_style")
    if hair_id and hair_id not in registry["categories"]["HAIR"]:
        errors.append(f"Invalid hair_style: '{hair_id}'. Available: {list(registry['categories']['HAIR'].keys())}")

    # 4. Check clothing
    resolved_clothing = resolve_clothing_config(config, registry)
    top_id = resolved_clothing["top_id"]
    bottom_id = resolved_clothing["bottom_id"]
    footwear_id = resolved_clothing["footwear_id"]
    socks_id = resolved_clothing["socks_id"]

    if top_id not in registry["categories"]["TOP"]:
        errors.append(f"Invalid top_id: '{top_id}'. Available: {list(registry['categories']['TOP'].keys())}")

    if bottom_id not in registry["categories"]["BOTTOM"]:
        errors.append(f"Invalid bottom_id: '{bottom_id}'. Available: {list(registry['categories']['BOTTOM'].keys())}")

    if footwear_id not in registry["categories"]["FOOTWEAR"]:
        errors.append(f"Invalid footwear_id: '{footwear_id}'. Available: {list(registry['categories']['FOOTWEAR'].keys())}")

    if socks_id and socks_id not in registry["categories"]["SOCKS"]:
        errors.append(f"Invalid socks_id: '{socks_id}'. Available: {list(registry['categories']['SOCKS'].keys())}")

    # 5. Check clothing compatibility rules
    if bottom_id == "BOTTOM_008":
        allowed_tops = registry["categories"]["BOTTOM"]["BOTTOM_008"].get("allowed_tops", [])
        if top_id not in allowed_tops:
            warnings.append(
                f"Pinafore Skirt (BOTTOM_008) is not recommended with '{top_id}'. "
                f"Recommended tops: {allowed_tops}"
            )

    if footwear_id == "FOOTWEAR_003" and socks_id == "SOCKS_003":
        warnings.append("Knee-High socks (SOCKS_003) paired with Sandals (FOOTWEAR_003) is visually non-standard.")

    # 6. Check accessories
    accessories = config.get("accessories", [])
    if not isinstance(accessories, list):
        errors.append("Field 'accessories' must be a list of accessory IDs.")
    else:
        for acc_id in accessories:
            if acc_id not in registry["categories"]["ACCESSORY"]:
                errors.append(f"Invalid accessory ID: '{acc_id}'. Available: {list(registry['categories']['ACCESSORY'].keys())}")

    # 7. Check height scale
    height_scale = config.get("height_scale", 1.0)
    if not isinstance(height_scale, (int, float)) or height_scale < 0.70 or height_scale > 1.40:
        errors.append(f"height_scale ({height_scale}) must be between 0.70 and 1.40")

    # 8. Check expression
    expr = config.get("default_expression", "Neutral")
    if expr not in registry["categories"]["EXPRESSIONS"]:
        warnings.append(f"Expression '{expr}' not in standard list. Will default to Neutral.")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "resolved_clothing": resolved_clothing
    }

if __name__ == "__main__":
    reg = load_registry()
    print(f"Registry v{reg['registry_version']} loaded successfully!")
    print(f"Categories: {list(reg['categories'].keys())}")
    print(f"Presets count: {len(reg['categories']['OUTFIT_PRESETS'])}")
    
    # Test all 12 presets validation
    all_valid = True
    for pid, pdata in reg["categories"]["OUTFIT_PRESETS"].items():
        test_cfg = {
            "character_id": f"test_{pid}",
            "height_scale": 1.0,
            "skin_tone": pdata.get("recommended_skin", "SKIN_02"),
            "hair_style": "HAIR_001",
            "hair_color": "#1c1615",
            "top_id": pdata["top_id"],
            "bottom_id": pdata["bottom_id"],
            "footwear_id": pdata["footwear_id"],
            "socks_id": pdata["socks_id"],
            "accessories": pdata.get("accessories", [])
        }
        res = validate_character_config(test_cfg, reg)
        if not res["valid"]:
            print(f"Preset {pid} FAIL:", res["errors"])
            all_valid = False
        else:
            print(f"Preset {pid} ({pdata['name']}): PASS (warnings: {len(res['warnings'])})")

    print(f"\nAll 12 Presets Validation Verdict: {'PASS' if all_valid else 'FAIL'}")
