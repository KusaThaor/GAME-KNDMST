"""
=============================================================================
INTEGRATOR: APPLY V13 REBUILD TO HAIRSTYLE_LIBRARY.PY
- Updates the 8 rebuilt hairstyles (HAIR_003, HAIR_005, HAIR_006, HAIR_007,
  HAIR_008, HAIR_009, HAIR_010, HAIR_011) to V13 production standard.
- Strictly PRESERVES HAIR_001, HAIR_002, HAIR_004, and HAIR_012.
=============================================================================
"""

import os
import re

LIB_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py"
SOURCE_V13 = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\rebuild_v13_full_volume_hairstyles.py"

with open(LIB_PATH, "r", encoding="utf-8") as f:
    lib_code = f.read()

with open(SOURCE_V13, "r", encoding="utf-8") as f:
    v13_code = f.read()

def extract_function(code, func_name):
    pattern = rf"def {func_name}\(.*?\n(?=def |\Z|# =+)"
    match = re.search(pattern, code, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find {func_name} in source")
    return match.group(0).rstrip()

# Ensure helper functions exist in library: add_volumetric_spline_lock and build_loose_hair_envelope
fn_vol_lock = extract_function(v13_code, "add_volumetric_spline_lock")
fn_envelope = extract_function(v13_code, "build_loose_hair_envelope")

if "def add_volumetric_spline_lock(" not in lib_code:
    marker = "def build_hair_001("
    idx = lib_code.find(marker)
    if idx == -1:
        raise ValueError("Could not find marker for helpers in library")
    lib_code = lib_code[:idx] + fn_vol_lock + "\n\n" + fn_envelope + "\n\n" + lib_code[idx:]
    print("[Added] Helper functions add_volumetric_spline_lock and build_loose_hair_envelope")

# 8 target functions to replace
replacements = [
    ("build_hair_003", "build_hair_003_v13", r"def build_hair_003\(.*?\n(?=def build_hair_004)"),
    ("build_hair_005", "build_hair_005_v13", r"def build_hair_005\(.*?\n(?=def build_hair_006)"),
    ("build_hair_006", "build_hair_006_v13", r"def build_hair_006\(.*?\n(?=def build_hair_007)"),
    ("build_hair_007", "build_hair_007_v13", r"def build_hair_007\(.*?\n(?=def build_hair_008)"),
    ("build_hair_008", "build_hair_008_v13", r"def build_hair_008\(.*?\n(?=def build_hair_009)"),
    ("build_hair_009", "build_hair_009_v13", r"def build_hair_009\(.*?\n(?=def build_hair_010)"),
    ("build_hair_010", "build_hair_010_v13", r"def build_hair_010\(.*?\n(?=def build_hair_011)"),
    ("build_hair_011", "build_hair_011_v13", r"def build_hair_011\(.*?\n(?=def build_hair_012)"),
]

for dest_name, src_name, regex_pattern in replacements:
    fn_body = extract_function(v13_code, src_name).replace(f"def {src_name}(", f"def {dest_name}(")
    if not re.search(regex_pattern, lib_code, re.DOTALL):
        raise ValueError(f"Regex pattern failed to match {dest_name} in library!")
    lib_code = re.sub(regex_pattern, fn_body + "\n\n", lib_code, count=1, flags=re.DOTALL)
    print(f"[Updated] {dest_name} in hairstyle_library.py")

with open(LIB_PATH, "w", encoding="utf-8") as f:
    f.write(lib_code)

print("\n[Success] All 8 hairstyles successfully updated to V13 in hairstyle_library.py!")
