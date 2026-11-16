import os
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory", "previews")

def create_horizontal_sheet(img_names, labels, out_name, title=""):
    images = [Image.open(os.path.join(PREVIEWS_DIR, name)) for name in img_names]
    w, h = images[0].size
    total_w = w * len(images)
    header_h = 70 if title else 0
    footer_h = 50
    total_h = h + header_h + footer_h

    canvas = Image.new("RGB", (total_w, total_h), (18, 20, 24))
    draw = ImageDraw.Draw(canvas)

    # Optional font loading (fallback to default)
    try:
        font_title = ImageFont.truetype("arial.ttf", 28)
        font_label = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()

    if title:
        draw.text((total_w // 2, 35), title, fill=(245, 245, 245), font=font_title, anchor="mm")

    for i, img in enumerate(images):
        x = i * w
        y = header_h
        canvas.paste(img, (x, y))
        label = labels[i]
        draw.text((x + w // 2, y + h + 25), label, fill=(220, 220, 225), font=font_label, anchor="mm")

    out_path = os.path.join(PREVIEWS_DIR, out_name)
    canvas.save(out_path, quality=95)
    print(f"Saved: {out_name}")

def create_turnaround(char_id, char_title):
    img_names = [
        f"{char_id}_front.png",
        f"{char_id}_side.png",
        f"{char_id}_three_quarter.png",
        f"{char_id}_back.png"
    ]
    labels = ["Front (Mặt Trước)", "Side (Góc Nghiêng)", "3/4 View (Phối Cảnh)", "Back (Mặt Sau)"]
    create_horizontal_sheet(img_names, labels, f"turnaround_{char_id}.png", f"TURNAROUND SHEET — {char_title.upper()}")

if __name__ == "__main__":
    # 1. Turnarounds for Character A, B, C
    create_turnaround("character_a", "Character A (Minh - 90% Height, School Uniform, Red Scarf)")
    create_turnaround("character_b", "Character B (Tuấn - 100% Height, PE Uniform, Sporty Short Hair)")
    create_turnaround("character_c", "Character C (Lan - 110% Height, Casual Outfit, Rounded Bob, Glasses & Hair Clip)")

    # 2. Hairstyle comparison sheet
    create_horizontal_sheet(
        ["character_a_front.png", "character_b_front.png", "character_c_front.png"],
        ["HAIR_001 — Classic Student (Bowl Cut)", "HAIR_002 — Sporty Short (Spiky)", "HAIR_003 — Rounded Bob"],
        "hairstyle_comparison_sheet.png",
        "HAIRSTYLE COMPARISON SHEET — MODULAR HAIR LIBRARY"
    )

    # 3. Outfit comparison sheet
    create_horizontal_sheet(
        ["character_a_front.png", "character_b_front.png", "character_c_front.png"],
        ["OUTFIT_001 — School Uniform (Áo sơ mi THCS)", "OUTFIT_002 — PE Uniform (Đồng phục Thể Dục)", "OUTFIT_003 — Casual Outfit (Thường phục Dạo Phố)"],
        "outfit_comparison_sheet.png",
        "OUTFIT COMPARISON SHEET — MODULAR GARMENT LIBRARY"
    )

    # 4. Facial expression sheet
    create_horizontal_sheet(
        ["expr_neutral.png", "expr_happy.png", "expr_sad.png", "expr_surprised.png", "expr_talking.png"],
        ["Neutral (Bình thường)", "Happy (Nụ cười rạng rỡ)", "Sad (Buồn bã)", "Surprised (Ngạc nhiên)", "Talking (Khẩu hình nói)"],
        "facial_expression_sheet.png",
        "FACIAL EXPRESSION SHEET — 3D CHIBI MORPH TARGETS"
    )

    # 5. Representative actions sheet
    create_horizontal_sheet(
        ["action_idle.png", "action_walk.png", "action_sit.png", "action_bow.png", "action_talk.png"],
        ["Action_Idle (Đứng chờ)", "Action_Walk (Đi dạo)", "Action_Sit (Ngồi học)", "Action_Bow (Cúi chào lễ phép)", "Action_Talk (Trò chuyện)"],
        "representative_actions_sheet.png",
        "REPRESENTATIVE ANIMATIONS TEST — 16 CANONICAL ACTIONS SUITE"
    )

    print("All comparison sheets generated successfully!")
