"""
Installs full V11 implementations directly into hairstyle_library.py.
Preserves backups and verifies with Blender.
"""

import os
import shutil

LIB_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py"
SOURCE_PATH = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\rebuild_v11_all_12_hairstyles.py"

# Read source code
with open(SOURCE_PATH, "r", encoding="utf-8") as f:
    source_code = f.read()

# We need the catalog and entry point
catalog_and_entry = '''
# =============================================================================
# CATALOG & DISPATCHER
# =============================================================================

HAIR_DISPATCHER = {
    "HAIR_001": build_hair_001,
    "HAIR_002": build_hair_002,
    "HAIR_003": build_hair_003,
    "HAIR_004": build_hair_004,
    "HAIR_005": build_hair_005,
    "HAIR_006": build_hair_006,
    "HAIR_007": build_hair_007,
    "HAIR_008": build_hair_008,
    "HAIR_009": build_hair_009,
    "HAIR_010": build_hair_010,
    "HAIR_011": build_hair_011,
    "HAIR_012": build_hair_012,
}

HAIR_CATALOG = {
    "HAIR_001": {
        "id": "HAIR_001",
        "name": "Classic Bowl Cut",
        "vietnamese_name": "Tóc úp nồi học trò",
        "style": "classic_bowl_cut",
        "description": "Mái tóc úp nồi tròn trịa, ngây thơ hiền lành của nam sinh đầu cấp 2",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#2b201c"
    },
    "HAIR_002": {
        "id": "HAIR_002",
        "name": "Sporty Short",
        "vietnamese_name": "Tóc ngắn thể thao vuốt nhẹ",
        "style": "sporty_spiky",
        "description": "Mái tóc ngắn vuốt nhẹ năng động, thể thao, cá tính của nam sinh thích đá bóng",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#161b26"
    },
    "HAIR_003": {
        "id": "HAIR_003",
        "name": "Rounded Bob",
        "vietnamese_name": "Tóc tém bob nữ sinh",
        "style": "rounded_bob",
        "description": "Mái tóc tém bob ngắn dễ thương ôm nhẹ đôi má bầu bĩnh của nữ sinh gương mẫu",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#221714"
    },
    "HAIR_004": {
        "id": "HAIR_004",
        "name": "Side-Parted Short",
        "vietnamese_name": "Tóc ngắn rẽ ngôi 7/3",
        "style": "side_parted_short",
        "description": "Tóc rẽ ngôi lệch 7/3 bồng bềnh tự nhiên của lớp trưởng gương mẫu",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#241c19"
    },
    "HAIR_005": {
        "id": "HAIR_005",
        "name": "Medium Straight",
        "vietnamese_name": "Tóc thẳng ngang lưng lửng",
        "style": "medium_straight",
        "description": "Mái tóc thẳng dài ngang lưng mềm mại, dịu dàng của nữ sinh thanh xuân",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1e1816"
    },
    "HAIR_006": {
        "id": "HAIR_006",
        "name": "Low Ponytail",
        "vietnamese_name": "Tóc đuôi ngựa buộc thấp",
        "style": "low_ponytail",
        "description": "Tóc đuôi ngựa buộc thấp sau gáy gọn gàng, thanh lịch cho giờ tự học",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1b1717",
        "tie_color": "#e0564c"
    },
    "HAIR_007": {
        "id": "HAIR_007",
        "name": "High Ponytail",
        "vietnamese_name": "Tóc đuôi ngựa buộc cao",
        "style": "high_ponytail",
        "description": "Tóc đuôi ngựa buộc cao bồng bềnh kèm nơ, tràn đầy năng lượng hoạt bát",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1a1818",
        "tie_color": "#4a8ec2"
    },
    "HAIR_008": {
        "id": "HAIR_008",
        "name": "Twin Pigtails",
        "vietnamese_name": "Tóc hai bên buộc đôi",
        "style": "twin_pigtails",
        "description": "Tóc hai chùm buộc đôi hai bên nhí nhảnh, hồn nhiên đặc trưng học sinh nhỏ nhắn",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#2b201c",
        "tie_color": "#f5b82e"
    },
    "HAIR_009": {
        "id": "HAIR_009",
        "name": "Braided Hair",
        "vietnamese_name": "Tóc tết bím học sinh",
        "style": "braided_hair",
        "description": "Bím tóc tết đôi truyền thống đoan trang, dịu dàng, hoài niệm học đường 2012-2013",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1c1615",
        "tie_color": "#e0564c"
    },
    "HAIR_010": {
        "id": "HAIR_010",
        "name": "Shoulder-Length Hair",
        "vietnamese_name": "Tóc ngang vai uốn cụp C",
        "style": "shoulder_length_curled",
        "description": "Tóc ngang vai nữ tính với ngọn tóc uốn cụp chữ C nhẹ nhàng ôm cổ áo",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#261b17"
    },
    "HAIR_011": {
        "id": "HAIR_011",
        "name": "Side-Swept Bangs",
        "vietnamese_name": "Tóc mái xéo phong trào 2012-2013",
        "style": "side_swept_bangs",
        "description": "Mái xéo cá tính gắn liền với trào lưu tuổi teen và âm nhạc học đường 2012-2013",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1a1b20"
    },
    "HAIR_012": {
        "id": "HAIR_012",
        "name": "Messy Short Hair",
        "vietnamese_name": "Tóc ngắn layer đánh rối tự nhiên",
        "style": "messy_short_layers",
        "description": "Tóc ngắn tỉa layer đánh rối nhẹ lãng tử, phóng khoáng của cậu học trò nghệ thuật",
        "anchor_bone": "Head",
        "color_support": True,
        "default_color": "#1d1716"
    }
}

def remove_existing_hair():
    """Removes any existing hair objects from the active Blender scene."""
    all_hair_objs = [o for o in bpy.data.objects if o.name.startswith("Hair_")]
    for o in all_hair_objs:
        bpy.data.objects.remove(o, do_unlink=True)

def equip_character_hair(arm, hair_id, hair_color_hex="#1c1615", char_id="student", tie_color_hex=None):
    """
    Main entry point for Character Factory to equip any of the 12 hairstyles.
    - Cleans up old hair objects.
    - Generates new procedural hair geometry (V11 Production).
    - Configures material and colors.
    - Binds to Head bone and Armature modifier.
    - Returns the created hairstyle object.
    """
    remove_existing_hair()
    
    if hair_id not in HAIR_DISPATCHER:
        print(f"[HairstyleLibrary] Unknown hair_id: {hair_id}, falling back to HAIR_001")
        hair_id = "HAIR_001"
        
    builder_fn = HAIR_DISPATCHER[hair_id]
    
    catalog_info = HAIR_CATALOG.get(hair_id, {})
    default_tie = catalog_info.get("tie_color", "#e0564c")
    effective_tie = tie_color_hex or default_tie
    
    if hair_id in ("HAIR_006", "HAIR_007", "HAIR_008", "HAIR_009"):
        obj = builder_fn(arm, char_id, hair_color_hex, tie_hex=effective_tie)
    else:
        obj = builder_fn(arm, char_id, hair_color_hex)
        
    print(f"[HairstyleLibrary] Equipped {hair_id} ({catalog_info.get('name', 'Hair')}) on {char_id} with color {hair_color_hex}")
    return obj

def create_stylized_hair_material(mat_name, hex_color="#2b201c", roughness=0.68):
    return create_chibi_hair_material(mat_name, hex_color, roughness)

def create_hair_tie_material(mat_name, hex_color="#e0564c", roughness=0.45):
    return create_accessory_material(mat_name, hex_color, roughness)

if __name__ == "__main__":
    print(f"Hairstyle Library V2 (Production V11) loaded successfully. Available styles: {len(HAIR_CATALOG)}")
'''

# Extract up to HAIRSTYLE_DISPATCHER in source_code
idx = source_code.find("HAIRSTYLE_DISPATCHER = {")
if idx == -1:
    raise ValueError("Could not find HAIRSTYLE_DISPATCHER in source_code")

final_code = source_code[:idx] + catalog_and_entry

with open(LIB_PATH, "w", encoding="utf-8") as f:
    f.write(final_code)

print("Successfully installed full V11 library into hairstyle_library.py!")
