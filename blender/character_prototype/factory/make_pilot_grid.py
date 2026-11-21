import os
from PIL import Image, ImageDraw, ImageFont

pilot_dir = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\hair_pilot"
styles = [
    ("hair_001", "HAIR_001 — Classic Bowl Cut"),
    ("hair_002", "HAIR_002 — Sporty Short"),
    ("hair_003", "HAIR_003 — Rounded Bob"),
    ("hair_004", "HAIR_004 — Side-Parted Short"),
    ("hair_005", "HAIR_005 — Medium Straight"),
    ("hair_006", "HAIR_006 — Low Ponytail"),
]

cols = ["front", "three_quarter", "side", "back"]
col_titles = ["Front View", "3/4 Perspective", "Side Profile", "Back View"]

sample = Image.open(os.path.join(pilot_dir, "hair_001_front.png"))
w, h = sample.size

thumb_w = 320
thumb_h = int(h * (thumb_w / w))

header_h = 80
label_col_w = 260
grid_w = label_col_w + thumb_w * len(cols)
grid_h = header_h + thumb_h * len(styles) + 20

sheet = Image.new("RGB", (grid_w, grid_h), (20, 22, 28))
draw = ImageDraw.Draw(sheet)

try:
    font_title = ImageFont.truetype("arial.ttf", 26)
    font_col = ImageFont.truetype("arial.ttf", 20)
    font_row = ImageFont.truetype("arial.ttf", 18)
except Exception:
    font_title = ImageFont.load_default()
    font_col = ImageFont.load_default()
    font_row = ImageFont.load_default()

# Header
draw.text((grid_w // 2, 35), "PILOT BATCH VALIDATION SHEET — HAIRSTYLES 001 TO 006", fill=(255, 255, 255), font=font_title, anchor="mm")

# Col titles
for c_idx, c_title in enumerate(col_titles):
    cx = label_col_w + c_idx * thumb_w + thumb_w // 2
    draw.text((cx, 65), c_title, fill=(180, 200, 220), font=font_col, anchor="mm")

# Rows
for r_idx, (s_prefix, s_label) in enumerate(styles):
    y_pos = header_h + r_idx * thumb_h
    # Row label background
    draw.rectangle([10, y_pos + 10, label_col_w - 10, y_pos + thumb_h - 10], fill=(28, 32, 40), outline=(50, 60, 80))
    lines = s_label.split(" — ")
    draw.text((label_col_w // 2, y_pos + thumb_h // 2 - 14), lines[0], fill=(255, 215, 120), font=font_row, anchor="mm")
    if len(lines) > 1:
        draw.text((label_col_w // 2, y_pos + thumb_h // 2 + 14), lines[1], fill=(220, 225, 235), font=font_row, anchor="mm")
        
    for c_idx, col_name in enumerate(cols):
        img_p = os.path.join(pilot_dir, f"{s_prefix}_{col_name}.png")
        if os.path.exists(img_p):
            im = Image.open(img_p).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            sheet.paste(im, (label_col_w + c_idx * thumb_w, y_pos))
            draw.rectangle([label_col_w + c_idx * thumb_w, y_pos, label_col_w + (c_idx + 1) * thumb_w, y_pos + thumb_h], outline=(40, 45, 55))

out_sheet = os.path.join(pilot_dir, "pilot_comparison_grid.png")
sheet.save(out_sheet, quality=95)
print(f"Pilot grid saved to: {out_sheet}")
