"""
Update hairstyle_library.py and asset_registry.json for the 6-Hairstyle V14 Production Release.
"""

import json
import os
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
REGISTRY_PATH = os.path.join(FACTORY_DIR, "asset_registry.json")
LIB_PATH = os.path.join(FACTORY_DIR, "hairstyle_library.py")

# 1. UPDATE ASSET_REGISTRY.JSON
with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
    reg = json.load(f)

reg["registry_version"] = "2.1.0"
reg["active_hairstyle_count"] = 6

active_hair = {
    "HAIR_001": {
        "id": "HAIR_001",
        "name": "Classic Bowl Cut",
        "vietnamese_name": "Tóc úp nồi học trò",
        "style": "classic_bowl_cut",
        "preset_group": "male",
        "status": "production_active",
        "length_landmark": "Above brow (Z ~ 0.575m) & tidy nape (Z ~ 0.448m)",
        "description": "Mái tóc úp nồi tròn trịa, ngây thơ hiền lành của nam sinh đầu cấp 2. Đường viền mềm mại, không răng cưa.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#2b201c",
        "glb_file": "character_hair_001_v14.glb"
    },
    "HAIR_002": {
        "id": "HAIR_002",
        "name": "Sporty Short",
        "vietnamese_name": "Tóc ngắn thể thao vuốt nhẹ",
        "style": "sporty_spiky",
        "preset_group": "male",
        "status": "production_active",
        "length_landmark": "Lifted crown apex (Z ~ 0.705m) & snug nape (Z ~ 0.445m)",
        "description": "Mái tóc ngắn vuốt nhẹ năng động, thể thao, cá tính của nam sinh thích đá bóng. Khối vuốt liền mạch, gáy ôm sát.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#161b26",
        "glb_file": "character_hair_002_v14.glb"
    },
    "HAIR_003": {
        "id": "HAIR_003",
        "name": "Chin-Length Rounded Bob",
        "vietnamese_name": "Tóc tém bob nữ sinh chạm cằm",
        "style": "rounded_bob",
        "preset_group": "female",
        "status": "production_active",
        "length_landmark": "Actual chin level all around (Z ~ 0.415m)",
        "description": "Mái tóc tém bob tròn trịa ôm nhẹ hai má và gáy kéo dài đến ngang cằm, mái cong tự nhiên trên trán.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#221714",
        "glb_file": "character_hair_003_v14.glb"
    },
    "HAIR_004": {
        "id": "HAIR_004",
        "name": "Side-Parted Short",
        "vietnamese_name": "Tóc ngắn rẽ ngôi 7/3",
        "style": "side_parted_short",
        "preset_group": "male",
        "status": "production_active",
        "length_landmark": "Brow sweep (Z ~ 0.565m) & tapered nape (Z ~ 0.448m)",
        "description": "Tóc rẽ ngôi lệch 7/3 bồng bềnh tự nhiên của lớp trưởng gương mẫu. Mối rẽ liền mạch vào đỉnh đầu, mái xéo nhẹ.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#241c19",
        "glb_file": "character_hair_004_v14.glb"
    },
    "HAIR_007": {
        "id": "HAIR_007",
        "name": "High Ponytail",
        "vietnamese_name": "Tóc đuôi ngựa buộc cao",
        "style": "high_ponytail",
        "preset_group": "female",
        "status": "production_active",
        "length_landmark": "Crest visible from front (Z ~ 0.725m) falling to upper back (Z ~ 0.400m)",
        "description": "Tóc đuôi ngựa buộc cao bồng bềnh kèm nơ vải, lượn mềm mại xuống lưng trên, tràn đầy năng lượng hoạt bát.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1a1818",
        "tie_color": "#4a8ec2",
        "glb_file": "character_hair_007_v14.glb"
    },
    "HAIR_010": {
        "id": "HAIR_010",
        "name": "Shoulder-Length Loose Hair",
        "vietnamese_name": "Tóc ngang vai xõa tự nhiên",
        "style": "shoulder_length_loose",
        "preset_group": "female",
        "status": "production_active",
        "length_landmark": "Actual shoulder line all around (Z ~ 0.368m)",
        "description": "Tóc xõa ngang vai nữ sinh dịu dàng với ngọn uốn cong ôm nhẹ bờ vai và cổ áo đồng phục.",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#261b17",
        "glb_file": "character_hair_010_v14.glb"
    }
}

archived_hair = {
    "HAIR_005": {
        "id": "HAIR_005",
        "name": "Medium Straight",
        "status": "archived",
        "archival_reason": "Retired for library reduction to 6 production styles; source preserved.",
        "source_backup": "factory/outputs/hairstyles_blend/hair_005_v13_source.blend"
    },
    "HAIR_006": {
        "id": "HAIR_006",
        "name": "Low Ponytail",
        "status": "archived",
        "archival_reason": "Retired for library reduction to 6 production styles; source preserved.",
        "source_backup": "factory/outputs/hairstyles_blend/hair_006_v13_source.blend"
    },
    "HAIR_008": {
        "id": "HAIR_008",
        "name": "Twin Pigtails",
        "status": "archived",
        "archival_reason": "Retired for library reduction to 6 production styles; source preserved.",
        "source_backup": "factory/outputs/hairstyles_blend/hair_008_v13_source.blend"
    },
    "HAIR_009": {
        "id": "HAIR_009",
        "name": "Braided Hair",
        "status": "archived",
        "archival_reason": "Retired for library reduction to 6 production styles; source preserved.",
        "source_backup": "factory/outputs/hairstyles_blend/hair_009_v13_source.blend"
    },
    "HAIR_011": {
        "id": "HAIR_011",
        "name": "Side-Swept Bangs",
        "status": "archived",
        "archival_reason": "Retired for library reduction to 6 production styles; source preserved.",
        "source_backup": "factory/outputs/hairstyles_blend/hair_011_v13_source.blend"
    },
    "HAIR_012": {
        "id": "HAIR_012",
        "name": "Messy Short Hair",
        "status": "permanently_removed",
        "archival_reason": "Permanently removed from active library, selection UI, preview sheets, and production export list.",
        "source_backup": "factory/outputs/hairstyles_blend/hair_012_v12_source.blend"
    }
}

reg["categories"]["HAIR"] = active_hair
reg["categories"]["ARCHIVED_HAIR"] = archived_hair

with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
    json.dump(reg, f, indent=2, ensure_ascii=False)

print(f"[Done] Updated {REGISTRY_PATH} (Active: {len(active_hair)}, Archived: {len(archived_hair)})")
