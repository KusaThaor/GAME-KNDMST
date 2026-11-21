"""
Composite High-Resolution Comparison and Turnaround Sheets for V10 Pilot Hairstyles
"""

import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews"
V2_DIR = os.path.join(BASE_DIR, "hairstyles_v2")
V10_DIR = os.path.join(BASE_DIR, "pilot_v10")

def get_font(size, bold=False):
    font_paths = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_turnaround_sheet():
    styles = [
        ("HAIR_001", "HAIR_001 — Classic Bowl Cut", "Snug mushroom volume, 4 graphic V-scallops above brow line, clean cheek framing, 0 clipping"),
        ("HAIR_004", "HAIR_004 — Side-Parted Short", "Asymmetric side part at X=-0.05, 3D curved sweeping fringe, exposed left brow, sleek temple tuck"),
        ("HAIR_008", "HAIR_008 — Twin Pigtails", "Dual-lobed rear skull with center cleft (Ref 2), high gathered nape, marshmallow scrunchies, bouncy plumes")
    ]
    views = ["front", "three_quarter", "side", "back"]
    view_titles = ["FRONT (0°)", "THREE-QUARTER (45°)", "PROFILE (90°)", "REAR VIEW (180°)"]
    
    img_w, img_h = 360, 420
    pad_x, pad_y = 20, 20
    header_h = 105
    row_header_h = 55
    margin = 30
    
    total_w = margin * 2 + 4 * img_w + 3 * pad_x
    total_h = header_h + len(styles) * (row_header_h + img_h + pad_y) + margin
    
    sheet = Image.new("RGB", (total_w, total_h), (245, 246, 248))
    draw = ImageDraw.Draw(sheet)
    
    title_font = get_font(32, bold=True)
    sub_font = get_font(15, bold=False)
    row_title_font = get_font(20, bold=True)
    row_sub_font = get_font(14, bold=False)
    col_hdr_font = get_font(15, bold=True)
    
    # Header Banner
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(28, 32, 42))
    draw.text((margin, 22), "MODULAR HAIRSTYLE LIBRARY V2 — PILOT REBUILD TURNAROUND", font=title_font, fill=(255, 255, 255))
    draw.text((margin, 62), "Production Stylized Chibi Hairstyles (Animal Crossing & Play Together Art Direction) | Satin Matte Shader | GLB & Three.js Verified", font=sub_font, fill=(180, 195, 215))
    
    curr_y = header_h + 15
    for h_id, full_name, desc in styles:
        draw.rounded_rectangle([(margin, curr_y), (total_w - margin, curr_y + row_header_h)], radius=8, fill=(232, 236, 242))
        draw.text((margin + 18, curr_y + 10), full_name, font=row_title_font, fill=(25, 30, 40))
        draw.text((margin + 18, curr_y + 32), desc, font=row_sub_font, fill=(90, 100, 115))
        curr_y += row_header_h + 10
        
        for c_idx, (vname, vlabel) in enumerate(zip(views, view_titles)):
            col_x = margin + c_idx * (img_w + pad_x)
            draw.text((col_x + 6, curr_y - 2), vlabel, font=col_hdr_font, fill=(110, 120, 135))
            
            img_path = os.path.join(V10_DIR, f"{h_id.lower()}_{vname}.png")
            if os.path.exists(img_path):
                im = Image.open(img_path)
                im_resized = im.resize((img_w, img_h), Image.Resampling.LANCZOS)
                sheet.paste(im_resized, (col_x, curr_y + 20))
                draw.rectangle([(col_x, curr_y + 20), (col_x + img_w, curr_y + 20 + img_h)], outline=(215, 220, 228), width=1)
                
        curr_y += img_h + pad_y + 15
        
    out_path = os.path.join(V10_DIR, "pilot_v10_turnaround_sheet.png")
    sheet.save(out_path, quality=95)
    print(f"Saved turnaround sheet: {out_path} ({total_w}x{total_h})")

def create_before_after_comparison():
    styles = [
        ("HAIR_001", "HAIR_001 — Classic Bowl Cut", "Before: Plastic helmet, heavy visor shadowing face | After: Animal Crossing mushroom volume, scalloped fringe above brow"),
        ("HAIR_004", "HAIR_004 — Side-Parted Short", "Before: Thick rectangular bang blocks, sharp corners | After: Asymmetric 3D sweep, soft tapered bevel, natural side part"),
        ("HAIR_008", "HAIR_008 — Twin Pigtails", "Before: Flat cap, bent crab-leg pigtails | After: Dual rounded peach lobes parted at X=0 (Ref 2), puffy scrunchies, bouncy plumes")
    ]
    
    img_w, img_h = 320, 380
    pad_x = 16
    margin = 25
    header_h = 95
    row_hdr_h = 50
    
    col_labels = [
        ("BEFORE (V2 Front)", (180, 60, 60)),
        ("BEFORE (V2 3/4)", (180, 60, 60)),
        ("AFTER (V10 Front)", (40, 140, 70)),
        ("AFTER (V10 3/4)", (40, 140, 70)),
        ("AFTER (V10 Back)", (40, 140, 70))
    ]
    
    total_w = margin * 2 + 5 * img_w + 4 * pad_x
    total_h = header_h + len(styles) * (row_hdr_h + img_h + 35) + margin
    
    sheet = Image.new("RGB", (total_w, total_h), (245, 246, 248))
    draw = ImageDraw.Draw(sheet)
    
    title_font = get_font(30, bold=True)
    sub_font = get_font(15, bold=False)
    row_title_font = get_font(19, bold=True)
    row_sub_font = get_font(13, bold=False)
    badge_font = get_font(14, bold=True)
    
    # Header Banner
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(28, 32, 42))
    draw.text((margin, 20), "PILOT HAIRSTYLE REBUILD — BEFORE (V2) VS AFTER (V10) COMPARISON", font=title_font, fill=(255, 255, 255))
    draw.text((margin, 58), "Rigorous Visual Verification: Replaced Helmet-Style Procedural Meshes with High-End Soft Stylized Chibi Sculpted Volumes", font=sub_font, fill=(185, 200, 220))
    
    curr_y = header_h + 15
    for h_id, full_name, desc in styles:
        draw.rounded_rectangle([(margin, curr_y), (total_w - margin, curr_y + row_hdr_h)], radius=6, fill=(234, 238, 244))
        draw.text((margin + 16, curr_y + 8), full_name, font=row_title_font, fill=(25, 30, 42))
        draw.text((margin + 16, curr_y + 29), desc, font=row_sub_font, fill=(85, 95, 110))
        curr_y += row_hdr_h + 8
        
        img_sources = [
            os.path.join(V2_DIR, f"{h_id.lower()}_front.png"),
            os.path.join(V2_DIR, f"{h_id.lower()}_three_quarter.png"),
            os.path.join(V10_DIR, f"{h_id.lower()}_front.png"),
            os.path.join(V10_DIR, f"{h_id.lower()}_three_quarter.png"),
            os.path.join(V10_DIR, f"{h_id.lower()}_back.png")
        ]
        
        for c_idx, ((lbl, color), path_src) in enumerate(zip(col_labels, img_sources)):
            col_x = margin + c_idx * (img_w + pad_x)
            
            badge_w = 150
            draw.rounded_rectangle([(col_x, curr_y), (col_x + badge_w, curr_y + 22)], radius=4, fill=color)
            draw.text((col_x + 8, curr_y + 2), lbl, font=badge_font, fill=(255, 255, 255))
            
            img_y = curr_y + 28
            if os.path.exists(path_src):
                im = Image.open(path_src)
                im_resized = im.resize((img_w, img_h), Image.Resampling.LANCZOS)
                sheet.paste(im_resized, (col_x, img_y))
                draw.rectangle([(col_x, img_y), (col_x + img_w, img_y + img_h)], outline=(215, 220, 228), width=1)
                
        curr_y += img_h + 40
        
    out_path = os.path.join(V10_DIR, "pilot_before_after_comparison_sheet.png")
    sheet.save(out_path, quality=95)
    print(f"Saved comparison sheet: {out_path} ({total_w}x{total_h})")

if __name__ == "__main__":
    create_turnaround_sheet()
    create_before_after_comparison()
