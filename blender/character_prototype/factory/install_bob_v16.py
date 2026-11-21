"""
Installs the V16 architectural rebuild of HAIR_003 into:
1. hairstyle_library.py (as canonical build_hair_003)
2. rebuild_female_production_v15.py (keeping build_hair_003_v15 as backup)
3. asset_registry.json
"""

import os
import re
import json
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
V16_SRC = os.path.join(FACTORY_DIR, "test_rebuild_bob_v16.py")
DEST_LIB = os.path.join(FACTORY_DIR, "hairstyle_library.py")
DEST_FEMALE = os.path.join(FACTORY_DIR, "rebuild_female_production_v15.py")
REGISTRY_PATH = os.path.join(FACTORY_DIR, "asset_registry.json")

# Backup
shutil.copyfile(DEST_LIB, DEST_LIB + ".bak_bob_v16")
shutil.copyfile(DEST_FEMALE, DEST_FEMALE + ".bak_bob_v16")
shutil.copyfile(REGISTRY_PATH, REGISTRY_PATH + ".bak_bob_v16")

with open(V16_SRC, "r", encoding="utf-8") as f:
    v16_code = f.read()

# Extract add_ribbon_lock and build_bob_v16
match_ribbon = re.search(r"(def add_ribbon_lock\(.*?\n)(def build_bob_v16)", v16_code, re.DOTALL)
match_bob = re.search(r"(def build_bob_v16\(.*?\n)(print\(\"build_bob_v16)", v16_code, re.DOTALL)

if not match_ribbon or not match_bob:
    print("[Error] Could not extract ribbon or bob function from V16 source!")
    exit(1)

ribbon_code = match_ribbon.group(1)
bob_code = match_bob.group(1).replace("def build_bob_v16(arm, char_id, mat_mode=\"production\"):", "def build_hair_003(arm, char_id, color_hex=\"#221714\", mat_mode=\"production\"):")

# 1. Update hairstyle_library.py
with open(DEST_LIB, "r", encoding="utf-8") as f:
    lib_text = f.read()

if "def add_ribbon_lock(" not in lib_text:
    pos = lib_text.find("def build_hair_001(")
    lib_text = lib_text[:pos] + ribbon_code + "\n" + lib_text[pos:]
    print("[Added] add_ribbon_lock helper to hairstyle_library.py")

# Replace build_hair_003
pattern_003 = r"def build_hair_003\(arm, char_id.*?\n(?=def |\Z|# =+|HAIR_DISPATCHER =|ACTIVE_HAIRSTYLES =)"
if re.search(pattern_003, lib_text, re.DOTALL):
    lib_text = re.sub(pattern_003, bob_code + "\n", lib_text, count=1, flags=re.DOTALL)
    print("[Replaced] build_hair_003 with V16 rebuild in hairstyle_library.py")

with open(DEST_LIB, "w", encoding="utf-8") as f:
    f.write(lib_text)

# 2. Update rebuild_female_production_v15.py
with open(DEST_FEMALE, "r", encoding="utf-8") as f:
    female_text = f.read()

if "def add_ribbon_lock(" not in female_text:
    pos = female_text.find("def build_hair_003_v15(")
    female_text = female_text[:pos] + ribbon_code + "\n" + female_text[pos:]

bob_female_code = match_bob.group(1).replace("def build_bob_v16(arm, char_id, mat_mode=\"production\"):", "def build_hair_003_v16(arm, char_id, color_hex=\"#221714\", mat_mode=\"production\"):")

if "def build_hair_003_v16(" not in female_text:
    pos = female_text.find("FEMALE_DISPATCHER_V15 = {")
    female_text = female_text[:pos] + bob_female_code + "\n\n" + female_text[pos:]
    female_text = female_text.replace("\"HAIR_003\": build_hair_003_v15,", "\"HAIR_003\": build_hair_003_v16,")
    print("[Added] build_hair_003_v16 to rebuild_female_production_v15.py")

with open(DEST_FEMALE, "w", encoding="utf-8") as f:
    f.write(female_text)

# 3. Update asset_registry.json
with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
    reg = json.load(f)

hair_cat = reg.setdefault("categories", {}).setdefault("HAIR", {})
if "HAIR_003" in hair_cat:
    hair_cat["HAIR_003"]["glb_file"] = "character_hair_003_v16.glb"
    hair_cat["HAIR_003"]["version"] = "2.4.0-review"
    hair_cat["HAIR_003"]["description"] = (
        "Chin-Length Rounded Bob (V16 Architectural Rebuild): Replaced single-shell helmet with 5 modular cohesive masses. "
        "Fitted interior scalp layer terminates high on forehead (Z ~ 0.630m); visible forehead rim completely replaced by 5 broad "
        "flattened curved fringe groups (width 24-28mm >> thickness 10-11mm) with concealed roots under the crown and soft tips at "
        "Z ~ 0.568-0.584m leaving eyes fully visible; face-framing masses with inward C-curls cupping the cheeks and jawline; "
        "coherent rear bob mass sculpted with 3 soft convex lobes and inward-cupped chin perimeter (Z ~ 0.415m)."
    )

with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
    json.dump(reg, f, indent=2, ensure_ascii=False)

print("[Done] Updated asset_registry.json successfully!")
