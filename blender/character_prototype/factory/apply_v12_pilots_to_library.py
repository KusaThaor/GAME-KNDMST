"""
Updates ONLY HAIR_001, HAIR_004, and HAIR_008 in hairstyle_library.py to V12.
Preserves the other 9 styles completely untouched.
"""

import os
import re

LIB_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py"
SOURCE_V12 = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\rebuild_v12_pilot_hairstyles.py"

with open(LIB_PATH, "r", encoding="utf-8") as f:
    lib_code = f.read()

with open(SOURCE_V12, "r", encoding="utf-8") as f:
    v12_code = f.read()

# Extract Catmull-Rom spline and smooth spline lock from v12
def extract_function(code, func_name):
    pattern = rf"def {func_name}\(.*?\n(?=def |\Z)"
    match = re.search(pattern, code, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find {func_name}")
    return match.group(0).rstrip()

fn_catmull = extract_function(v12_code, "catmull_rom_spline")
fn_spline_lock = extract_function(v12_code, "add_smooth_spline_lock")
fn_hair_001 = extract_function(v12_code, "build_hair_001_v12").replace("def build_hair_001_v12(", "def build_hair_001(")
fn_hair_004 = extract_function(v12_code, "build_hair_004_v12").replace("def build_hair_004_v12(", "def build_hair_004(")
fn_hair_008 = extract_function(v12_code, "build_hair_008_v12").replace("def build_hair_008_v12(", "def build_hair_008(")

# Ensure catmull_rom_spline and add_smooth_spline_lock exist in library
if "def catmull_rom_spline(" not in lib_code:
    marker = "def add_soft_tapered_lock("
    idx = lib_code.find(marker)
    if idx == -1:
        raise ValueError("Could not find marker for spline functions")
    lib_code = lib_code[:idx] + fn_catmull + "\n\n" + fn_spline_lock + "\n\n" + lib_code[idx:]

# Replace build_hair_001
p1 = r"def build_hair_001\(.*?\n(?=def build_hair_002)"
lib_code = re.sub(p1, fn_hair_001 + "\n\n", lib_code, flags=re.DOTALL)

# Replace build_hair_004
p4 = r"def build_hair_004\(.*?\n(?=def build_hair_005)"
lib_code = re.sub(p4, fn_hair_004 + "\n\n", lib_code, flags=re.DOTALL)

# Replace build_hair_008
p8 = r"def build_hair_008\(.*?\n(?=def build_hair_009)"
lib_code = re.sub(p8, fn_hair_008 + "\n\n", lib_code, flags=re.DOTALL)

with open(LIB_PATH, "w", encoding="utf-8") as f:
    f.write(lib_code)

print("Successfully updated HAIR_001, HAIR_004, and HAIR_008 to V12 in hairstyle_library.py!")
