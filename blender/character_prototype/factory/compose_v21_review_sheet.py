from PIL import Image, ImageDraw, ImageFont
import os

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

img_front = Image.open(os.path.join(ARTIFACT_DIR, "hair_003_v21_front.png"))
img_tq = Image.open(os.path.join(ARTIFACT_DIR, "hair_003_v21_three_quarter.png"))
img_prof = Image.open(os.path.join(ARTIFACT_DIR, "hair_003_v21_profile.png"))
img_rear = Image.open(os.path.join(ARTIFACT_DIR, "hair_003_v21_rear.png"))

# Create 2x2 grid (2048 x 2048)
sheet = Image.new("RGB", (2048, 2048), (220, 220, 225))
sheet.paste(img_front, (0, 0))
sheet.paste(img_tq, (1024, 0))
sheet.paste(img_prof, (0, 1024))
sheet.paste(img_rear, (1024, 1024))

draw = ImageDraw.Draw(sheet)

# Add clear view labels
labels = [
    ("FRONT", 512, 980),
    ("THREE QUARTER", 1536, 980),
    ("SIDE (PROFILE)", 512, 2004),
    ("BACK", 1536, 2004),
]

for text, cx, cy in labels:
    # Pill background
    w, h = 260, 48
    x0, y0 = cx - w//2, cy - h//2
    draw.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=16, fill=(245, 240, 235), outline=(180, 175, 170), width=2)
    # Text
    draw.text((cx, cy), text, fill=(50, 45, 40), anchor="mm")

out_path = os.path.join(ARTIFACT_DIR, "hair_003_v21_turnaround_sheet.png")
sheet.save(out_path, quality=95)
print(f"Saved review sheet -> {out_path}")
