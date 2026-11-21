"""
Integrates V14 Six Production Hairstyle Builders and Catalog into hairstyle_library.py.
"""

import os
import re

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
SRC_PATH = os.path.join(FACTORY_DIR, "rebuild_six_production_hairstyles.py")
DEST_PATH = os.path.join(FACTORY_DIR, "hairstyle_library.py")

with open(SRC_PATH, "r", encoding="utf-8") as f:
    src_content = f.read()

with open(DEST_PATH, "r", encoding="utf-8") as f:
    dest_content = f.read()

# Extract utility functions from SRC if needed
# Check if add_volumetric_spline_lock is in dest_content
if "def add_volumetric_spline_lock(" not in dest_content:
    # Extract catmull_rom_spline, add_volumetric_spline_lock, add_smooth_hair_band, add_ribbon_bow
    utils_match = re.search(r"(def catmull_rom_spline\(.*?\n)(# ===+)", src_content, re.DOTALL)
    if utils_match:
        utils_code = utils_match.group(1)
        # Insert before first builder in dest_content
        first_builder_pos = dest_content.find("def build_hair_001(")
        dest_content = dest_content[:first_builder_pos] + utils_code + "\n" + dest_content[first_builder_pos:]
        print("[Added] Volumetric spline utilities to hairstyle_library.py")

# Extract and replace each builder function
styles_to_update = [
    ("build_hair_001", "build_hair_001_v14"),
    ("build_hair_002", "build_hair_002_v14"),
    ("build_hair_003", "build_hair_003_v14"),
    ("build_hair_004", "build_hair_004_v14"),
    ("build_hair_007", "build_hair_007_v14"),
    ("build_hair_010", "build_hair_010_v14"),
]

for std_fn, v14_fn in styles_to_update:
    # Find builder in src
    pattern_src = rf"def {v14_fn}\(arm, char_id.*?\n(?=def |\Z|# =+)"
    match_src = re.search(pattern_src, src_content, re.DOTALL)
    if not match_src:
        print(f"[Error] Could not find {v14_fn} in src!")
        continue
    fn_code = match_src.group(0).replace(f"def {v14_fn}(", f"def {std_fn}(")

    # Find and replace in dest
    pattern_dest = rf"def {std_fn}\(arm, char_id.*?\n(?=def |\Z|# =+|HAIR_DISPATCHER =)"
    if re.search(pattern_dest, dest_content, re.DOTALL):
        dest_content = re.sub(pattern_dest, fn_code + "\n", dest_content, count=1, flags=re.DOTALL)
        print(f"[Replaced] {std_fn} in hairstyle_library.py")
    else:
        print(f"[Warning] {std_fn} not found in dest by regex")

# Now update HAIR_CATALOG and HAIR_DISPATCHER
catalog_and_dispatcher_code = '''
ACTIVE_HAIRSTYLES = ["HAIR_001", "HAIR_002", "HAIR_003", "HAIR_004", "HAIR_007", "HAIR_010"]
ARCHIVED_HAIRSTYLES = ["HAIR_005", "HAIR_006", "HAIR_008", "HAIR_009", "HAIR_011", "HAIR_012"]

HAIR_DISPATCHER = {
    "HAIR_001": build_hair_001,
    "HAIR_002": build_hair_002,
    "HAIR_003": build_hair_003,
    "HAIR_004": build_hair_004,
    "HAIR_007": build_hair_007,
    "HAIR_010": build_hair_010,
}

ARCHIVED_DISPATCHER = {
    "HAIR_005": build_hair_005,
    "HAIR_006": build_hair_006,
    "HAIR_008": build_hair_008,
    "HAIR_009": build_hair_009,
    "HAIR_011": build_hair_011,
    "HAIR_012": build_hair_012,
}

HAIR_CATALOG = {
    "HAIR_001": {
        "id": "HAIR_001",
        "name": "Classic Bowl Cut",
        "vietnamese_name": "Tóc úp nồi học trò",
        "style": "classic_bowl_cut",
        "preset_group": "male",
        "status": "production_active",
        "description": "Mái tóc úp nồi tròn trịa, ngây thơ hiền lành của nam sinh đầu cấp 2. Đường viền mềm mại, không răng cưa.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#2b201c"
    },
    "HAIR_002": {
        "id": "HAIR_002",
        "name": "Sporty Short",
        "vietnamese_name": "Tóc ngắn thể thao vuốt nhẹ",
        "style": "sporty_spiky",
        "preset_group": "male",
        "status": "production_active",
        "description": "Mái tóc ngắn vuốt nhẹ năng động, thể thao, cá tính của nam sinh thích đá bóng. Khối vuốt liền mạch, gáy ôm sát.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#161b26"
    },
    "HAIR_003": {
        "id": "HAIR_003",
        "name": "Chin-Length Rounded Bob",
        "vietnamese_name": "Tóc tém bob nữ sinh",
        "style": "rounded_bob",
        "preset_group": "female",
        "status": "production_active",
        "description": "Mái tóc tém bob tròn trịa ôm nhẹ hai má và gáy kéo dài đến ngang cằm, mái cong tự nhiên trên trán.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#221714"
    },
    "HAIR_004": {
        "id": "HAIR_004",
        "name": "Side-Parted Short",
        "vietnamese_name": "Tóc ngắn rẽ ngôi 7/3",
        "style": "side_parted_short",
        "preset_group": "male",
        "status": "production_active",
        "description": "Tóc rẽ ngôi lệch 7/3 bồng bềnh tự nhiên của lớp trưởng gương mẫu. Mối rẽ liền mạch vào đỉnh đầu, mái xéo nhẹ.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#241c19"
    },
    "HAIR_007": {
        "id": "HAIR_007",
        "name": "High Ponytail",
        "vietnamese_name": "Tóc đuôi ngựa buộc cao",
        "style": "high_ponytail",
        "preset_group": "female",
        "status": "production_active",
        "description": "Tóc đuôi ngựa buộc cao bồng bềnh kèm nơ vải, lượn mềm mại xuống lưng trên, tràn đầy năng lượng hoạt bát.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1a1818",
        "tie_color": "#4a8ec2"
    },
    "HAIR_010": {
        "id": "HAIR_010",
        "name": "Shoulder-Length Loose Hair",
        "vietnamese_name": "Tóc ngang vai xõa tự nhiên",
        "style": "shoulder_length_loose",
        "preset_group": "female",
        "status": "production_active",
        "description": "Tóc xõa ngang vai nữ sinh dịu dàng với ngọn uốn cong ôm nhẹ bờ vai và cổ áo đồng phục.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#261b17"
    }
}
'''

# Replace from HAIR_DISPATCHER to the end of HAIR_CATALOG
disp_start = dest_content.find("HAIR_DISPATCHER = {")
if disp_start != -1:
    equip_start = dest_content.find("def remove_existing_hair():", disp_start)
    if equip_start != -1:
        dest_content = dest_content[:disp_start] + catalog_and_dispatcher_code.strip() + "\n\n" + dest_content[equip_start:]
        print("[Updated] HAIR_DISPATCHER and HAIR_CATALOG in hairstyle_library.py")

with open(DEST_PATH, "w", encoding="utf-8") as f:
    f.write(dest_content)

print(f"[Done] Finished writing updated hairstyle_library.py")
