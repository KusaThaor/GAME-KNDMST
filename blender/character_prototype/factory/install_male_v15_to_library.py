"""
Installs refined V15 male builders (HAIR_001, HAIR_002, HAIR_004) into hairstyle_library.py
and updates asset_registry.json to v2.3.0.
"""

import os
import re
import json
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
SRC_MALE = os.path.join(FACTORY_DIR, "rebuild_male_production_v15.py")
DEST_LIB = os.path.join(FACTORY_DIR, "hairstyle_library.py")
REGISTRY_PATH = os.path.join(FACTORY_DIR, "asset_registry.json")

# Backup before editing
shutil.copyfile(DEST_LIB, DEST_LIB + ".bak_male_v15")
shutil.copyfile(REGISTRY_PATH, REGISTRY_PATH + ".bak_male_v15")

with open(SRC_MALE, "r", encoding="utf-8") as f:
    src_content = f.read()

with open(DEST_LIB, "r", encoding="utf-8") as f:
    dest_content = f.read()

# 1. Add add_flattened_curved_hair_lock if missing
if "def add_flattened_curved_hair_lock(" not in dest_content:
    match_lock = re.search(r"(def add_flattened_curved_hair_lock\(.*?\n)(def build_hair_001_v15)", src_content, re.DOTALL)
    if match_lock:
        lock_code = match_lock.group(1)
        # Insert before def build_hair_001(
        pos = dest_content.find("def build_hair_001(")
        dest_content = dest_content[:pos] + lock_code + "\n" + dest_content[pos:]
        print("[Added] add_flattened_curved_hair_lock helper to hairstyle_library.py")

# 2. Extract and replace build_hair_001, build_hair_002, build_hair_004
styles = [
    ("build_hair_001", "build_hair_001_v15"),
    ("build_hair_002", "build_hair_002_v15"),
    ("build_hair_004", "build_hair_004_v15"),
]

for std_name, v15_name in styles:
    pattern_src = rf"def {v15_name}\(arm, char_id.*?\n(?=def |\Z|# =+)"
    match_src = re.search(pattern_src, src_content, re.DOTALL)
    if not match_src:
        print(f"[Error] Could not find {v15_name} in src!")
        continue
    fn_code = match_src.group(0).replace(f"def {v15_name}(", f"def {std_name}(")

    pattern_dest = rf"def {std_name}\(arm, char_id.*?\n(?=def |\Z|# =+|HAIR_DISPATCHER =|ACTIVE_HAIRSTYLES =)"
    if re.search(pattern_dest, dest_content, re.DOTALL):
        dest_content = re.sub(pattern_dest, fn_code + "\n", dest_content, count=1, flags=re.DOTALL)
        print(f"[Replaced] {std_name} with V15 refinement in hairstyle_library.py")
    else:
        print(f"[Warning] {std_name} not found in dest by regex")

with open(DEST_LIB, "w", encoding="utf-8") as f:
    f.write(dest_content)
print("[Done] Updated hairstyle_library.py successfully!")

# 3. Update asset_registry.json
with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
    reg = json.load(f)

reg["registry_version"] = "2.3.0"

hair_dict = reg.setdefault("categories", {}).setdefault("HAIR", {})

if "HAIR_001" in hair_dict:
    hair_dict["HAIR_001"]["glb_file"] = "character_hair_001_v15.glb"
    hair_dict["HAIR_001"]["version"] = "2.3.0"
    hair_dict["HAIR_001"]["description"] = (
        "Classic Bowl Cut (V15 Refined): Compact rounded bowl silhouette with soft horizontal fringe "
        "divided into 4 broad shallow groupings with a soft falling tip near center-left. Zero straight machine line, "
        "14mm inward beveled rim for physical thickness, snug tidy nape."
    )

if "HAIR_002" in hair_dict:
    hair_dict["HAIR_002"]["glb_file"] = "character_hair_002_v15.glb"
    hair_dict["HAIR_002"]["version"] = "2.3.0"
    hair_dict["HAIR_002"]["description"] = (
        "Sporty Short (V15 Refined): Distinct athletic short cut. Pale patch cured (inverted normals and scalp penetration "
        "eliminated with +2.4mm side clearance); crown spike replaced with smooth rounded cranial dome; compact close-cropped "
        "sides and snug nape without bowl overhang; directional forward/upward top lift with open athletic brow."
    )

if "HAIR_004" in hair_dict:
    hair_dict["HAIR_004"]["glb_file"] = "character_hair_004_v15.glb"
    hair_dict["HAIR_004"]["version"] = "2.3.0"
    hair_dict["HAIR_004"]["description"] = (
        "Side-Parted Short (V15 Refined): Protruding rod/horn fringe completely replaced with a broad, flattened curved "
        "hair ribbon (54mm width x 12mm thickness) that hugs forehead curvature with close 4mm clearance. Root seamlessly concealed "
        "inside crown at off-center part (X ~ -0.045m); eyes completely unobstructed."
    )

with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
    json.dump(reg, f, indent=2, ensure_ascii=False)

print("[Done] Updated asset_registry.json to v2.3.0 successfully!")
