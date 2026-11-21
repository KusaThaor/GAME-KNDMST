"""
Composes 4 visual inspection panels comparing:
Reference Target vs V19 Rebuild
"""

from PIL import Image, ImageDraw, ImageFont
import os
import shutil

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"
PREVIEWS_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\hair_003_v19_review"

ref_front = Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_front.png"))
ref_3q = Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_three_quarter.png"))
ref_side = Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_side.png"))
ref_back = Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_back.png"))

v19_front = Image.open(os.path.join(PREVIEWS_DIR, "hair_003_v19_front.png"))
v19_3q = Image.open(os.path.join(PREVIEWS_DIR, "hair_003_v19_three_quarter.png"))
v19_side = Image.open(os.path.join(PREVIEWS_DIR, "hair_003_v19_profile.png"))
v19_rear = Image.open(os.path.join(PREVIEWS_DIR, "hair_003_v19_rear.png"))

cell_w = 480
cell_h = 480
sheet_w = cell_w * 4
sheet_h = 60 + cell_h * 2 + 40

sheet = Image.new("RGB", (sheet_w, sheet_h), (24, 25, 28))
draw = ImageDraw.Draw(sheet)

draw.text((25, 12), "ROW 1: ART TARGET REFERENCE  |  ROW 2: V19 REBUILD (GENEROUS MARGIN FRAMING, LEVEL PITCH, CONTINUOUS MASS)", fill=(255, 220, 160))

refs = [ref_front, ref_3q, ref_side, ref_back]
v19s = [v19_front, v19_3q, v19_side, v19_rear]
labels = ["FRONT", "THREE-QUARTER", "PROFILE", "REAR"]

for i in range(4):
    r_img = refs[i].resize((cell_w, cell_h), Image.Resampling.LANCZOS)
    v_img = v19s[i].resize((cell_w, cell_h), Image.Resampling.LANCZOS)

    x = i * cell_w
    y_ref = 50
    y_v19 = 50 + cell_h + 20

    sheet.paste(r_img, (x, y_ref))
    sheet.paste(v_img, (x, y_v19))

    draw.text((x + 15, y_ref + 10), f"TARGET: {labels[i]}", fill=(255, 230, 180))
    draw.text((x + 15, y_v19 + 10), f"V19 REBUILD: {labels[i]}", fill=(140, 230, 255))

out_path = os.path.join(PREVIEWS_DIR, "v19_visual_review_sheet.png")
sheet.save(out_path)
shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, "v19_visual_review_sheet.png"))
print("[Done] Saved v19_visual_review_sheet.png")
