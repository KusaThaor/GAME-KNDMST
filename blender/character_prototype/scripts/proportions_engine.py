"""
=============================================================================
CHIBI STUDENT BASE CHARACTER SYSTEM — PROPORTION & VARIATION ENGINE
Provides automated scaling, modular swapping, and configuration presets
for generating student character variants in the Vietnamese school-life game.
=============================================================================
"""

import math

# =============================================================================
# 1. GRADE-BASED PROPORTION & HEIGHT PRESETS
# =============================================================================
STUDENT_PRESETS = {
    "grade_6_freshman": {
        "label": "Học sinh Lớp 6 (Đầu cấp THCS / Chibi nhỏ nhắn)",
        "target_height_m": 0.78,
        "head_to_body_ratio": 2.6,
        "bone_scales": {
            "Head": (1.00, 1.00, 1.00),
            "Spine": (1.00, 1.00, 1.00),
            "Chest": (1.00, 1.00, 1.00),
            "Thigh.L": (1.00, 1.00, 1.00),
            "Thigh.R": (1.00, 1.00, 1.00),
            "Shin.L": (1.00, 1.00, 1.00),
            "Shin.R": (1.00, 1.00, 1.00),
            "UpperArm.L": (1.00, 1.00, 1.00),
            "UpperArm.R": (1.00, 1.00, 1.00),
            "Forearm.L": (1.00, 1.00, 1.00),
            "Forearm.R": (1.00, 1.00, 1.00),
        },
        "description": "Tỷ lệ đầu to tròn ~2.6 đầu người, thân ngắn, chân mũm mĩm, thể hiện nét ngây thơ học trò mới lên cấp 2."
    },
    "grade_7_8_intermediate": {
        "label": "Học sinh Lớp 7-8 (Trung học cơ sở chuẩn)",
        "target_height_m": 0.84,
        "head_to_body_ratio": 3.0,
        "bone_scales": {
            "Head": (0.95, 0.95, 0.95),
            "Spine": (0.98, 0.98, 1.06),
            "Chest": (0.98, 0.98, 1.06),
            "Thigh.L": (0.96, 0.96, 1.12),
            "Thigh.R": (0.96, 0.96, 1.12),
            "Shin.L": (0.96, 0.96, 1.12),
            "Shin.R": (0.96, 0.96, 1.12),
            "UpperArm.L": (0.96, 0.96, 1.08),
            "UpperArm.R": (0.96, 0.96, 1.08),
            "Forearm.L": (0.96, 0.96, 1.08),
            "Forearm.R": (0.96, 0.96, 1.08),
        },
        "description": "Chiều cao trung bình, chân dài hơn 12%, thân trên thon thả, dáng đi nhanh nhẹn hoạt bát."
    },
    "grade_9_senior": {
        "label": "Học sinh Lớp 9 (Cuối cấp THCS / Trưởng thành hơn)",
        "target_height_m": 0.90,
        "head_to_body_ratio": 3.4,
        "bone_scales": {
            "Head": (0.90, 0.90, 0.90),
            "Spine": (0.95, 0.95, 1.15),
            "Chest": (0.95, 0.95, 1.15),
            "Thigh.L": (0.92, 0.92, 1.25),
            "Thigh.R": (0.92, 0.92, 1.25),
            "Shin.L": (0.92, 0.92, 1.25),
            "Shin.R": (0.92, 0.92, 1.25),
            "UpperArm.L": (0.94, 0.94, 1.18),
            "UpperArm.R": (0.94, 0.94, 1.18),
            "Forearm.L": (0.94, 0.94, 1.18),
            "Forearm.R": (0.94, 0.94, 1.18),
        },
        "description": "Dáng cao ráo, tỷ lệ 3.4 đầu người, chân dài thanh mảnh, vai hơi rộng hơn, sẵn sàng thi vào lớp 10."
    }
}

# =============================================================================
# 2. MODULAR COLLECTION ARCHITECTURE SPECIFICATION
# =============================================================================
MODULAR_COLLECTIONS = {
    "00_Armature": {
        "objects": ["Student_Armature"],
        "purpose": "Hệ thống khung xương 19-bone chuẩn Humanoid dùng chung cho toàn bộ các biến thể học sinh."
    },
    "01_Base_Body": {
        "objects": ["Body_Head", "Character_Arm_L", "Character_Arm_R", "Ear_L", "Ear_R"],
        "purpose": "Hình thể gốc chứa đầu tròn, cổ, cánh tay mềm mại và bàn tay chibi. Luôn tồn tại."
    },
    "02_Outfit_Uniform": {
        "objects": ["Character_Torso_Legs", "Shirt_Collar", "Belt_Buckle"],
        "swappable_with": ["Outfit_PE_Sport", "Outfit_Casual_Summer", "Outfit_Winter_Jacket", "Outfit_Female_Skirt"],
        "purpose": "Module trang phục học đường. Có thể ẩn/hiện hoặc hoán đổi mesh trang phục khác mà vẫn giữ nguyên khung xương."
    },
    "03_Hair_Default": {
        "objects": ["Hair_Cap", "Hair_Bangs", "Hair_Sideburn_L", "Hair_Sideburn_R"],
        "swappable_with": ["Hair_Female_Ponytail", "Hair_Short_Spiky", "Hair_Twin_Braids", "Hair_Side_Part"],
        "purpose": "Module tóc độc lập. Đầu nhân vật (Body_Head) có da đầu tròn hoàn chỉnh bên dưới, sẵn sàng gắn bất kỳ kiểu tóc nào."
    },
    "04_Accessories": {
        "objects": ["Scarf_Knot", "Scarf_Tail_L", "Scarf_Tail_R", "Nametag"],
        "swappable_with": ["Accessory_Backpack", "Accessory_Glasses", "Accessory_Badge", "Accessory_Cap"],
        "purpose": "Module phụ kiện văn hóa học đường Việt Nam (khăn quàng đỏ, bảng tên vải, kính cận, ba lô)."
    },
    "05_Facial_Features": {
        "objects": ["Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R", "Eyebrow_L", "Eyebrow_R", "Nose", "Mouth", "Blush_L", "Blush_R"],
        "purpose": "Module ngũ quan và biểu cảm. Dễ dàng đổi màu mắt, dáng lông mày hoặc thêm/bớt má hồng."
    }
}

def get_preset_info(preset_key):
    return STUDENT_PRESETS.get(preset_key, STUDENT_PRESETS["grade_6_freshman"])

if __name__ == "__main__":
    print("=== CHIBI STUDENT BASE CHARACTER PROPORTIONS ENGINE ===")
    for k, v in STUDENT_PRESETS.items():
        print(f"\n[{k.upper()}] - {v['label']}")
        print(f"  Height: {v['target_height_m']}m | Ratio: {v['head_to_body_ratio']} heads")
        print(f"  Notes:  {v['description']}")
