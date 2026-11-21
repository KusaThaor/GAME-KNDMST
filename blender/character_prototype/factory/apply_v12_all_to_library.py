"""
=============================================================================
INTEGRATOR: APPLY V12 HAIRSTYLES TO HAIRSTYLE_LIBRARY.PY
- Updates HAIR_002, HAIR_003, HAIR_005, HAIR_006, HAIR_007, HAIR_009,
  HAIR_010, HAIR_011, HAIR_012 in hairstyle_library.py to V12 production standard.
- Strictly PRESERVES HAIR_001, HAIR_004, and HAIR_008 (the approved V12 pilots).
=============================================================================
"""

import os
import re

LIB_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py"
SOURCE_NINE = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\rebuild_v12_remaining_nine.py"

with open(LIB_PATH, "r", encoding="utf-8") as f:
    lib_code = f.read()

with open(SOURCE_NINE, "r", encoding="utf-8") as f:
    nine_code = f.read()

def extract_function(code, func_name):
    pattern = rf"def {func_name}\(.*?\n(?=def |\Z|# =+)"
    match = re.search(pattern, code, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find {func_name} in source")
    return match.group(0).rstrip()

# 9 target functions
replacements = [
    ("build_hair_002", "build_hair_002_v12", r"def build_hair_002\(.*?\n(?=def build_hair_003)"),
    ("build_hair_003", "build_hair_003_v12", r"def build_hair_003\(.*?\n(?=def build_hair_004)"),
    ("build_hair_005", "build_hair_005_v12", r"def build_hair_005\(.*?\n(?=def build_hair_006)"),
    ("build_hair_006", "build_hair_006_v12", r"def build_hair_006\(.*?\n(?=def build_hair_007)"),
    ("build_hair_007", "build_hair_007_v12", r"def build_hair_007\(.*?\n(?=def build_hair_008)"),
    ("build_hair_009", "build_hair_009_v12", r"def build_hair_009\(.*?\n(?=def build_hair_010)"),
    ("build_hair_010", "build_hair_010_v12", r"def build_hair_010\(.*?\n(?=def build_hair_011)"),
    ("build_hair_011", "build_hair_011_v12", r"def build_hair_011\(.*?\n(?=def build_hair_012)"),
    ("build_hair_012", "build_hair_012_v12", r"def build_hair_012\(.*?\n(?=HAIR_CATALOG|HAIR_DISPATCHER|\Z)")
]

for dest_name, src_name, regex_pattern in replacements:
    fn_body = extract_function(nine_code, src_name).replace(f"def {src_name}(", f"def {dest_name}(")
    if not re.search(regex_pattern, lib_code, re.DOTALL):
        raise ValueError(f"Regex pattern failed to match {dest_name} in library!")
    lib_code = re.sub(regex_pattern, fn_body + "\n\n", lib_code, count=1, flags=re.DOTALL)
    print(f"[Updated] {dest_name} in hairstyle_library.py")

with open(LIB_PATH, "w", encoding="utf-8") as f:
    f.write(lib_code)

print("\n[Success] All 9 hairstyles successfully updated to V12 in hairstyle_library.py!")
