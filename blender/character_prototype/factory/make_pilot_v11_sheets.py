"""
Composite High-Resolution Comparison and Master Multi-View Sheets for V11 Pilot Hairstyles
"""

import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews"
V10_DIR = os.path.join(BASE_DIR, "pilot_v10")
V11_DIR = os.path.join(BASE_DIR, "pilot_v11")

def get_font(size, bold=False):
    font_paths = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_master_turnaround_sheet():
    styles = [
        ("HAIR_001", "HAIR_001 — Classic Bowl Cut (Reworked V11)", "Compact rounded bowl silhouette; subtle broad fringe groupings; inward curvature; tidy rounded nape"),
        ("HAIR_004", "HAIR_004 — Side-Parted Short (Reworked V11)", "Off-center part at X=-0.048; 3D swept volume; concealed roots; zero open seams/pale spots; left brow clear"),
        ("HAIR_008", "HAIR_008 — Twin Pigtails (Reworked V11)", "Full continuous skull coverage down to natural nape; subtle center part groove; soft tapered plumes passing visibly through neat ties")
    ]
    
    # 5 full turnaround views + 2 close-up views = 7 columns
    views = [
        ("front", "FRONT (0°)"),
        ("three_quarter", "3/4 VIEW (45°)"),
        ("side", "PROFILE (90°)"),
        ("back", "REAR (180°)"),
        ("elevated_rear", "ELEVATED REAR"),
        ("fringe_closeup", "FRINGE CLOSE-UP"),
        ("nape_closeup", "NAPE CLOSE-UP")
    ]
    
    img_w, img_h = 280, 330
    pad_x, pad_y = 12, 16
    header_h = 100
    row_hdr_h = 50
    margin = 24
    
    total_w = margin * 2 + len(views) * img_w + (len(views) - 1) * pad_x
    total_h = header_h + len(styles) * (row_hdr_h + img_h + pad_y) + margin
    
    sheet = Image.new("RGB", (total_w, total_h), (245, 246, 248))
    draw = ImageDraw.Draw(sheet)
    
    title_font = get_font(30, bold=True)
    sub_font = get_font(15, bold=False)
    row_title_font = get_font(18, bold=True)
    row_sub_font = get_font(13, bold=False)
    col_hdr_font = get_font(14, bold=True)
    
    # Header Banner
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(28, 32, 42))
    draw.text((margin, 20), "MODULAR HAIRSTYLE LIBRARY V2 — PILOT REWORK TURNAROUND & CLOSE-UP AUDIT", font=title_font, fill=(255, 255, 255))
    draw.text((margin, 58), "Full Silhouette Validation (7 Angles per Style): Front, 3/4, Profile, Rear, Elevated Rear, Fringe Join & Nape Coverage | Satin Shader", font=sub_font, fill=(180, 195, 215))
    
    curr_y = header_h + 15
    for h_id, full_name, desc in styles:
        draw.rounded_rectangle([(margin, curr_y), (total_w - margin, curr_y + row_hdr_h)], radius=6, fill=(232, 236, 242))
        draw.text((margin + 16, curr_y + 8), full_name, font=row_title_font, fill=(25, 30, 40))
        draw.text((margin + 16, curr_y + 28), desc, font=row_sub_font, fill=(85, 95, 110))
        curr_y += row_hdr_h + 8
        
        for c_idx, (vname, vlabel) in enumerate(views):
            col_x = margin + c_idx * (img_w + pad_x)
            draw.text((col_x + 4, curr_y - 2), vlabel, font=col_hdr_font, fill=(105, 115, 130))
            
            img_path = os.path.join(V11_DIR, f"{h_id.lower()}_{vname}.png")
            if os.path.exists(img_path):
                im = Image.open(img_path)
                im_resized = im.resize((img_w, img_h), Image.Resampling.LANCZOS)
                sheet.paste(im_resized, (col_x, curr_y + 18))
                draw.rectangle([(col_x, curr_y + 18), (col_x + img_w, curr_y + 18 + img_h)], outline=(215, 220, 228), width=1)
                
        curr_y += img_h + pad_y + 10
        
    out_path = os.path.join(V11_DIR, "pilot_v11_master_turnaround_sheet.png")
    sheet.save(out_path, quality=95)
    print(f"Saved master turnaround sheet: {out_path} ({total_w}x{total_h})")

def create_before_after_comparison():
    styles = [
        ("HAIR_001", "HAIR_001 — Classic Bowl Cut",
         "Previous: Repetitive sinusoidal scalloped teeth across fringe | Reworked V11: Broad subtle fringe groupings, inward curvature, natural variation, tidy nape"),
        ("HAIR_004", "HAIR_004 — Side-Parted Short",
         "Previous: Rectangular plate cutoff, open root edge causing pale spot artifact | Reworked V11: Seamless 3D swept volume, concealed roots, zero open seams/pale spots"),
        ("HAIR_008", "HAIR_008 — Twin Pigtails",
         "Previous: High V-cutout exposing large pale bald cranium patch | Reworked V11: Continuous skull coverage down to natural nape, subtle center groove, soft tapered plumes")
    ]
    
    img_w, img_h = 300, 355
    pad_x = 14
    margin = 25
    header_h = 95
    row_hdr_h = 48
    
    col_labels = [
        ("PREVIOUS (Front)", (170, 70, 70)),
        ("PREVIOUS (Side/Back)", (170, 70, 70)),
        ("REWORKED V11 (Front)", (35, 135, 75)),
        ("REWORKED V11 (3/4)", (35, 135, 75)),
        ("REWORKED V11 (Back)", (35, 135, 75)),
        ("REWORKED V11 (Elevated Rear)", (35, 135, 75))
    ]
    
    total_w = margin * 2 + len(col_labels) * img_w + (len(col_labels) - 1) * pad_x
    total_h = header_h + len(styles) * (row_hdr_h + img_h + 35) + margin
    
    sheet = Image.new("RGB", (total_w, total_h), (245, 246, 248))
    draw = ImageDraw.Draw(sheet)
    
    title_font = get_font(30, bold=True)
    sub_font = get_font(15, bold=False)
    row_title_font = get_font(18, bold=True)
    row_sub_font = get_font(13, bold=False)
    badge_font = get_font(13, bold=True)
    
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(28, 32, 42))
    draw.text((margin, 20), "PILOT HAIRSTYLE REWORK — DIRECT BEFORE (V10) VS AFTER (V11) COMPARISON", font=title_font, fill=(255, 255, 255))
    draw.text((margin, 58), "Targeted Artistic Corrections: Natural Fringe Groupings, 3D Swept Volume without Pale Spots, Full Rear Cranium Coverage to Nape", font=sub_font, fill=(185, 200, 220))
    
    curr_y = header_h + 15
    for h_id, full_name, desc in styles:
        draw.rounded_rectangle([(margin, curr_y), (total_w - margin, curr_y + row_hdr_h)], radius=6, fill=(234, 238, 244))
        draw.text((margin + 16, curr_y + 7), full_name, font=row_title_font, fill=(25, 30, 42))
        draw.text((margin + 16, curr_y + 27), desc, font=row_sub_font, fill=(85, 95, 110))
        curr_y += row_hdr_h + 8
        
        # Select appropriate previous view: For HAIR_004 show side (pale spot); for HAIR_008 show back (bald patch); for HAIR_001 show side
        prev_second_view = "side" if h_id == "HAIR_004" else ("back" if h_id == "HAIR_008" else "three_quarter")
        img_sources = [
            os.path.join(V10_DIR, f"{h_id.lower()}_front.png"),
            os.path.join(V10_DIR, f"{h_id.lower()}_{prev_second_view}.png"),
            os.path.join(V11_DIR, f"{h_id.lower()}_front.png"),
            os.path.join(V11_DIR, f"{h_id.lower()}_three_quarter.png"),
            os.path.join(V11_DIR, f"{h_id.lower()}_back.png"),
            os.path.join(V11_DIR, f"{h_id.lower()}_elevated_rear.png")
        ]
        
        for c_idx, ((lbl, color), path_src) in enumerate(zip(col_labels, img_sources)):
            col_x = margin + c_idx * (img_w + pad_x)
            
            # Badge
            badge_w = 165
            draw.rounded_rectangle([(col_x, curr_y), (col_x + badge_w, curr_y + 22)], radius=4, fill=color)
            # Adjust label for second column
            display_lbl = f"PREV ({'Side' if prev_second_view == 'side' else ('Back' if prev_second_view == 'back' else '3/4')})" if c_idx == 1 else lbl
            draw.text((col_x + 6, curr_y + 3), display_lbl, font=badge_font, fill=(255, 255, 255))
            
            img_y = curr_y + 28
            if os.path.exists(path_src):
                im = Image.open(path_src)
                im_resized = im.resize((img_w, img_h), Image.Resampling.LANCZOS)
                sheet.paste(im_resized, (col_x, img_y))
                draw.rectangle([(col_x, img_y), (col_x + img_w, img_y + img_h)], outline=(215, 220, 228), width=1)
                
        curr_y += img_h + 38
        
    out_path = os.path.join(V11_DIR, "pilot_v11_before_after_comparison_sheet.png")
    sheet.save(out_path, quality=95)
    print(f"Saved before/after comparison sheet: {out_path} ({total_w}x{total_h})")

if __name__ == "__main__":
    create_master_turnaround_sheet()
    create_before_after_comparison()
