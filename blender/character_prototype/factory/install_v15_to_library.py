"""
Installs refined V15 builders for HAIR_003, HAIR_007, and HAIR_010 into hairstyle_library.py.
"""

import os
import re

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
SRC_PATH = os.path.join(FACTORY_DIR, "rebuild_female_production_v15.py")
DEST_PATH = os.path.join(FACTORY_DIR, "hairstyle_library.py")

with open(SRC_PATH, "r", encoding="utf-8") as f:
    src_content = f.read()

with open(DEST_PATH, "r", encoding="utf-8") as f:
    dest_content = f.read()

# 1. Ensure add_continuous_rmf_spline_lock and smoothstep exist in dest_content
if "def add_continuous_rmf_spline_lock(" not in dest_content:
    rmf_match = re.search(r"(def add_continuous_rmf_spline_lock\(.*?\n)(def add_smooth_hair_band)", src_content, re.DOTALL)
    if rmf_match:
        rmf_code = rmf_match.group(1)
        # Insert before first builder
        first_pos = dest_content.find("def build_hair_001(")
        dest_content = dest_content[:first_pos] + rmf_code + "\ndef smoothstep(edge0, edge1, x):\n    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))\n    return t * t * (3.0 - 2.0 * t)\n\n" + dest_content[first_pos:]
        print("[Added] RMF spline lock utility to hairstyle_library.py")

# 2. Extract and replace build_hair_003, build_hair_007, build_hair_010
styles = [
    ("build_hair_003", "build_hair_003_v15"),
    ("build_hair_007", "build_hair_007_v15"),
    ("build_hair_010", "build_hair_010_v15"),
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

with open(DEST_PATH, "w", encoding="utf-8") as f:
    f.write(dest_content)

print("[Done] Updated hairstyle_library.py successfully!")
