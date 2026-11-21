"""
=============================================================================
COMPOSITOR: V12 FULL 12-HAIRSTYLE PRODUCTION LIBRARY COMPARISON SHEETS
Generates:
1. hairstyles_v12_full_library_turnaround_sheet.png
   - Master 12-row x 5-column turnaround comparison (Front, 3/4, Profile, Back, Elevated Rear)
2. hairstyles_v12_compact_silhouette_comparison.png
   - 4x3 gameplay distance silhouette & facial balance sheet
=============================================================================
"""

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
V12_PREVIEWS = os.path.join(FACTORY_DIR, "previews", "all_12_v12")
PILOT_PREVIEWS = os.path.join(FACTORY_DIR, "previews", "pilot_v12")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(V12_PREVIEWS, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# Copy the 3 approved pilot renders into all_12_v12 directory for a single unified collection
for pilot_id in ["hair_001", "hair_004", "hair_008"]:
    for vname in ["front", "three_quarter", "side", "back", "elevated_rear"]:
        src = os.path.join(PILOT_PREVIEWS, f"{pilot_id}_{vname}.png")
        dst = os.path.join(V12_PREVIEWS, f"{pilot_id}_{vname}.png")
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copyfile(src, dst)

ALL_12_STYLES = [
    ("HAIR_001", "Classic Bowl Cut", "Approved Pilot V12 — 4 Natural Clumps, Inward Curl, Tidy Nape"),
    ("HAIR_002", "Sporty Short", "V12 Production — Restrained Crown Lift, 3 Broad Forward Clumps"),
    ("HAIR_003", "Rounded Bob", "V12 Production — Voluptuous Cheek Volumes, Soft Inward C-Cup"),
    ("HAIR_004", "Side-Parted Short", "Approved Pilot V12 — Off-Center Part, 8mm Root Lift & Directional Flow"),
    ("HAIR_005", "Medium Straight", "V12 Production — Straight Flowing Chest Mantle, Layered Front Locks"),
    ("HAIR_006", "Low Ponytail", "V12 Production — Low Nape Convergence, Visible Tie, S-Curve Teardrop"),
    ("HAIR_007", "High Ponytail", "V12 Production — Upward Gather, Ribbon Bow, Front-Visible Crest"),
    ("HAIR_008", "Twin Pigtails", "Approved Pilot V12 — Full Skull Coverage, Catmull-Rom Teardrops"),
    ("HAIR_009", "Braided Hair", "V12 Production — Center Parted Lobes, 4-Tier Interlocking Plaits"),
    ("HAIR_010", "Shoulder-Length Hair", "V12 Production — Signature C-Curl Cupping Neck & Shirt Hem"),
    ("HAIR_011", "Side-Swept Bangs", "V12 Production — Iconic Mái Xéo Swoop, 3D Root Lift, Eyes Clear"),
    ("HAIR_012", "Messy Short Hair", "V12 Production — Organic Bedhead Clumps, Controlled Asymmetry")
]

def get_font(size, bold=False):
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "tahomabd.ttf" if bold else "tahoma.ttf",
        "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    ]
    for fn in font_names:
        try:
            return ImageFont.truetype(fn, size)
        except:
            continue
    return ImageFont.load_default()

def compose_full_library_turnarounds():
    print("[Compositor] Generating 12-Hairstyle Master Turnaround Sheet...")
    cols = ["front", "three_quarter", "side", "back", "elevated_rear"]
    col_labels = ["FRONT (0°)", "THREE-QUARTER (45°)", "PROFILE (90°)", "REAR (180°)", "ELEVATED REAR (65°)"]
    
    thumb_w, thumb_h = 320, 373
    pad_x, pad_y = 16, 20
    header_h = 130
    row_header_w = 260
    
    total_w = row_header_w + len(cols) * (thumb_w + pad_x) + pad_x
    total_h = header_h + len(ALL_12_STYLES) * (thumb_h + pad_y) + pad_y
    
    canvas = Image.new("RGB", (total_w, total_h), (24, 26, 32))
    draw = ImageDraw.Draw(canvas)
    
    title_font = get_font(32, bold=True)
    subtitle_font = get_font(18, bold=False)
    header_col_font = get_font(16, bold=True)
    style_id_font = get_font(22, bold=True)
    style_name_font = get_font(18, bold=True)
    style_desc_font = get_font(13, bold=False)
    
    # Main Header
    draw.text((30, 24), "HÀNH TRÌNH THANH XUÂN — CHIBI MODULAR HAIRSTYLE LIBRARY V12", fill=(255, 255, 255), font=title_font)
    draw.text((30, 68), "Full 12-Hairstyle Production Release | Soft Stylized Chibi Aesthetics | Three.js & GLB Verified", fill=(175, 185, 205), font=subtitle_font)
    draw.line([(30, 102), (total_w - 30, 102)], fill=(55, 62, 78), width=2)
    
    # Column Headers
    for c_idx, c_label in enumerate(col_labels):
        cx = row_header_w + c_idx * (thumb_w + pad_x) + pad_x + thumb_w // 2
        draw.text((cx, 108), c_label, fill=(200, 215, 240), font=header_col_font, anchor="mt")
        
    for r_idx, (hid, hname, hdesc) in enumerate(ALL_12_STYLES):
        y_top = header_h + r_idx * (thumb_h + pad_y) + 10
        
        # Row Info Card
        card_rect = [16, y_top, row_header_w - 8, y_top + thumb_h]
        draw.rectangle(card_rect, fill=(32, 36, 46), outline=(48, 54, 70), width=1)
        
        is_pilot = "Approved Pilot" in hdesc
        badge_color = (64, 150, 255) if is_pilot else (100, 200, 120)
        badge_text = "APPROVED PILOT" if is_pilot else "V12 PRODUCTION"
        
        draw.rounded_rectangle([24, y_top + 14, 180, y_top + 38], radius=4, fill=(40, 48, 64), outline=badge_color, width=1)
        draw.text((102, y_top + 26), badge_text, fill=badge_color, font=get_font(11, bold=True), anchor="mm")
        
        draw.text((24, y_top + 52), hid, fill=(255, 255, 255), font=style_id_font)
        draw.text((24, y_top + 82), hname, fill=(225, 235, 250), font=style_name_font)
        
        # Word wrap description
        words = hdesc.split()
        lines = []
        cur_line = []
        for w in words:
            cur_line.append(w)
            if len(" ".join(cur_line)) > 26:
                lines.append(" ".join(cur_line))
                cur_line = []
        if cur_line:
            lines.append(" ".join(cur_line))
            
        desc_y = y_top + 120
        for l in lines[:6]:
            draw.text((24, desc_y), l, fill=(155, 168, 190), font=style_desc_font)
            desc_y += 18
            
        # Draw Image Angles
        for c_idx, vname in enumerate(cols):
            x_img = row_header_w + c_idx * (thumb_w + pad_x) + pad_x
            img_path = os.path.join(V12_PREVIEWS, f"{hid.lower()}_{vname}.png")
            
            if os.path.exists(img_path):
                try:
                    img = Image.open(img_path).convert("RGB")
                    img = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                    canvas.paste(img, (x_img, y_top))
                    draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], outline=(42, 48, 62), width=1)
                except Exception as e:
                    draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], fill=(40, 30, 30))
            else:
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], fill=(32, 34, 40), outline=(50, 50, 60))
                draw.text((x_img + thumb_w//2, y_top + thumb_h//2), f"Missing:\n{hid.lower()}_{vname}.png", fill=(160, 100, 100), font=style_desc_font, anchor="mm")
                
    out_path_factory = os.path.join(V12_PREVIEWS, "hairstyles_v12_full_library_turnaround_sheet.png")
    out_path_artifact = os.path.join(ARTIFACT_DIR, "hairstyles_v12_full_library_turnaround_sheet.png")
    canvas.save(out_path_factory, quality=95)
    shutil.copyfile(out_path_factory, out_path_artifact)
    print(f"[Done] Master Turnaround Sheet saved to:\n  -> {out_path_factory}\n  -> {out_path_artifact}")

def compose_compact_silhouette_comparison():
    print("[Compositor] Generating Compact 12-Hairstyle Silhouette Comparison...")
    # 4 columns x 3 rows grid of Front views
    cols, rows = 4, 3
    thumb_w, thumb_h = 360, 420
    pad_x, pad_y = 20, 24
    header_h = 110
    
    total_w = cols * (thumb_w + pad_x) + pad_x
    total_h = header_h + rows * (thumb_h + pad_y + 45) + pad_y
    
    canvas = Image.new("RGB", (total_w, total_h), (20, 22, 28))
    draw = ImageDraw.Draw(canvas)
    
    title_font = get_font(30, bold=True)
    subtitle_font = get_font(16, bold=False)
    id_font = get_font(18, bold=True)
    name_font = get_font(16, bold=False)
    
    draw.text((28, 20), "HÀNH TRÌNH THANH XUÂN — 12 HAIRSTYLES SILHOUETTE COMPARISON (V12)", fill=(255, 255, 255), font=title_font)
    draw.text((28, 62), "Front Silhouette Readability at Gameplay Distance | 2012–2013 Vietnamese School Art Direction", fill=(170, 180, 200), font=subtitle_font)
    draw.line([(28, 92), (total_w - 28, 92)], fill=(50, 56, 72), width=2)
    
    for idx, (hid, hname, hdesc) in enumerate(ALL_12_STYLES):
        r = idx // cols
        c = idx % cols
        
        x = pad_x + c * (thumb_w + pad_x)
        y = header_h + r * (thumb_h + pad_y + 45)
        
        img_path = os.path.join(V12_PREVIEWS, f"{hid.lower()}_front.png")
        if os.path.exists(img_path):
            try:
                img = Image.open(img_path).convert("RGB")
                img = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(img, (x, y))
                draw.rectangle([x, y, x + thumb_w, y + thumb_h], outline=(45, 52, 68), width=1)
            except:
                draw.rectangle([x, y, x + thumb_w, y + thumb_h], fill=(30, 30, 30))
        else:
            draw.rectangle([x, y, x + thumb_w, y + thumb_h], fill=(30, 30, 30))
            
        # Label Bar
        bar_y = y + thumb_h + 4
        is_pilot = "Approved Pilot" in hdesc
        id_col = (100, 180, 255) if is_pilot else (140, 230, 160)
        draw.text((x + 6, bar_y + 4), hid, fill=id_col, font=id_font)
        draw.text((x + 6, bar_y + 24), hname, fill=(230, 235, 245), font=name_font)
        
    out_path_factory = os.path.join(V12_PREVIEWS, "hairstyles_v12_compact_silhouette_comparison.png")
    out_path_artifact = os.path.join(ARTIFACT_DIR, "hairstyles_v12_compact_silhouette_comparison.png")
    canvas.save(out_path_factory, quality=95)
    shutil.copyfile(out_path_factory, out_path_artifact)
    print(f"[Done] Compact Silhouette Comparison saved to:\n  -> {out_path_factory}\n  -> {out_path_artifact}")

if __name__ == "__main__":
    compose_full_library_turnarounds()
    compose_compact_silhouette_comparison()
