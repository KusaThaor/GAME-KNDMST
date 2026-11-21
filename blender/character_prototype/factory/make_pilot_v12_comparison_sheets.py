"""
=============================================================================
COMPOSITOR: PILOT HAIRSTYLES V12 COMPARISON & TURNAROUND SHEETS
Generates:
1. pilot_v12_before_after_comparison_sheet.png:
   - Direct V11 vs V12 visual comparison highlighting the artistic refinements
2. pilot_v12_master_turnaround_sheet.png:
   - 7-view turnaround sheet (Front, 3/4, Profile, Back, Elevated Rear, Fringe Close-up, Nape/Root Close-up)
=============================================================================
"""

import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
V11_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v11")
V12_DIR = os.path.join(FACTORY_DIR, "previews", "pilot_v12")
ARTIFACTS_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

def get_font(size, bold=False):
    font_names = ["segoeui.ttf", "arial.ttf", "tahoma.ttf"]
    if bold:
        font_names = ["segouib.ttf", "arialbd.ttf", "tahomabd.ttf"]
    for fn in font_names:
        try:
            return ImageFont.truetype(f"C:/Windows/Fonts/{fn}", size)
        except:
            pass
    return ImageFont.load_default()

def compose_before_after_sheet():
    row_h = 420
    col_w = 300
    label_w = 340
    header_h = 130
    margin = 25
    
    # 6 columns of images: [V11 View A, V12 View A, V11 View B, V12 View B, V11 Close-up, V12 Close-up]
    total_w = label_w + col_w * 6 + margin * 2
    total_h = header_h + row_h * 3 + margin * 2
    
    canvas = Image.new("RGB", (total_w, total_h), (242, 244, 247))
    draw = ImageDraw.Draw(canvas)
    
    # Header Banner
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(25, 30, 42))
    font_title = get_font(34, bold=True)
    font_sub = get_font(18, bold=False)
    draw.text((margin, 22), "PILOT HAIRSTYLES V12 — ARTISTIC REFINEMENT (BEFORE V11 VS AFTER V12)", fill=(255, 255, 255), font=font_title)
    draw.text((margin, 74), "Direct Side-by-Side Comparison: Fringe Groupings, 3D Directional Sweep, Root Lift, Continuous Pigtail Plumes", fill=(185, 200, 225), font=font_sub)
    
    # Column Subheaders
    col_headers = [
        "HAIRSTYLE CRITIQUE & REFINEMENT",
        "V11 (BEFORE)", "V12 (REFINED)",
        "V11 3/4 (BEFORE)", "V12 3/4 (REFINED)",
        "V11 CLOSE-UP", "V12 CLOSE-UP"
    ]
    font_col = get_font(15, bold=True)
    draw.rectangle([(margin, header_h - 32), (total_w - margin, header_h)], fill=(42, 48, 64))
    draw.text((margin + 12, header_h - 26), col_headers[0], fill=(240, 245, 255), font=font_col)
    for i in range(6):
        draw.text((margin + label_w + i * col_w + 12, header_h - 26), col_headers[i + 1], fill=(240, 245, 255), font=font_col)

    styles = [
        {
            "id": "HAIR_001",
            "name": "Classic Bowl Cut",
            "vn": "Tóc úp nồi học trò",
            "critique": "V11: Fringe was nearly straight horizontal line; main volume read as a smooth helmet.\n\nV12 Corrections:\n• 4 broad, subtle natural fringe groupings with organic varied lengths\n• Inward curl toward forehead with 14mm physical thickness\n• Eyebrows and eyes 100% visible\n• Subtle cranial volume lines breaking smooth helmet look\n• Tidy rounded nape without rear bulge",
            "v11_imgs": ["hair_001_front.png", "hair_001_three_quarter.png", "hair_001_fringe_closeup.png"],
            "v12_imgs": ["hair_001_front.png", "hair_001_three_quarter.png", "hair_001_fringe_closeup.png"]
        },
        {
            "id": "HAIR_004",
            "name": "Side-Parted Short",
            "vn": "Tóc ngắn rẽ ngôi 7/3",
            "critique": "V11: Resembled bowl cut with diagonal edge; part and direction not readable.\n\nV12 Corrections:\n• Distinct off-center part (X = -0.046) with full skull coverage beneath\n• Major sweeping fringe with gentle root lift (+8mm Z, +6mm Y)\n• Supporting dimensional secondary lock beneath sweep\n• Sleek tucked minor side on left temple\n• Crown volume biased toward sweep direction",
            "v11_imgs": ["hair_004_front.png", "hair_004_three_quarter.png", "hair_004_fringe_closeup.png"],
            "v12_imgs": ["hair_004_front.png", "hair_004_three_quarter.png", "hair_004_part_closeup.png"]
        },
        {
            "id": "HAIR_008",
            "name": "Twin Pigtails",
            "vn": "Tóc hai bên / Hai chùm",
            "critique": "V11: Tails remained angular, segmented, and pointed; roots blocky; ties hard to read.\n\nV12 Corrections:\n• Continuous rear cranium coverage preserved to nape (Z = 0.448)\n• Scalp volume visibly gathers into smooth conical lobes\n• Clearly readable hair ties (major_r = 0.021) with cute ribbon bows\n• Continuous Catmull-Rom spline curves (no sharp elbows)\n• Chubby teardrop belly below ties, tapering to soft rounded blunt tips",
            "v11_imgs": ["hair_008_back.png", "hair_008_three_quarter.png", "hair_008_elevated_rear.png"],
            "v12_imgs": ["hair_008_back.png", "hair_008_three_quarter.png", "hair_008_tail_closeup.png"]
        }
    ]

    font_id = get_font(22, bold=True)
    font_name = get_font(17, bold=True)
    font_vn = get_font(15, bold=False)
    font_desc = get_font(12, bold=False)

    for idx, s in enumerate(styles):
        y = header_h + margin + idx * row_h
        draw.rectangle([(margin, y), (total_w - margin, y + row_h - 10)], fill=(255, 255, 255), outline=(220, 226, 235), width=2)
        
        # Left Info Panel
        draw.rectangle([(margin + 2, y + 2), (margin + label_w - 2, y + row_h - 12)], fill=(247, 249, 252))
        draw.text((margin + 16, y + 15), s['id'], fill=(30, 70, 155), font=font_id)
        draw.text((margin + 16, y + 46), s['name'], fill=(20, 25, 35), font=font_name)
        draw.text((margin + 16, y + 72), f"({s['vn']})", fill=(80, 95, 115), font=font_vn)
        
        # Render critique text with word wrap
        lines = s['critique'].split('\n')
        cur_y = y + 105
        for l in lines:
            if not l.strip():
                cur_y += 6
                continue
            draw.text((margin + 16, cur_y), l, fill=(50, 60, 75), font=font_desc)
            cur_y += 18
            
        # 6 Image Columns: [V11_A, V12_A, V11_B, V12_B, V11_Close, V12_Close]
        img_pairs = [
            (s['v11_imgs'][0], s['v12_imgs'][0]),
            (s['v11_imgs'][1], s['v12_imgs'][1]),
            (s['v11_imgs'][2], s['v12_imgs'][2]),
        ]
        
        for pi, (v11_fn, v12_fn) in enumerate(img_pairs):
            col_idx_v11 = pi * 2
            col_idx_v12 = pi * 2 + 1
            
            # V11
            tx_11 = margin + label_w + col_idx_v11 * col_w + 8
            ty_11 = y + 10
            path_11 = os.path.join(V11_DIR, v11_fn)
            if os.path.exists(path_11):
                im11 = Image.open(path_11)
                w, h_orig = im11.size
                crop_box = (int(w * 0.08), int(h_orig * 0.02), int(w * 0.92), int(h_orig * 0.88))
                im11_c = im11.crop(crop_box).resize((col_w - 16, row_h - 32), Image.Resampling.LANCZOS)
                canvas.paste(im11_c, (tx_11, ty_11))
                draw.rectangle([(tx_11, ty_11), (tx_11 + col_w - 16, ty_11 + row_h - 32)], outline=(225, 230, 238), width=1)
                
            # V12
            tx_12 = margin + label_w + col_idx_v12 * col_w + 8
            ty_12 = y + 10
            path_12 = os.path.join(V12_DIR, v12_fn)
            if os.path.exists(path_12):
                im12 = Image.open(path_12)
                w, h_orig = im12.size
                crop_box = (int(w * 0.08), int(h_orig * 0.02), int(w * 0.92), int(h_orig * 0.88))
                im12_c = im12.crop(crop_box).resize((col_w - 16, row_h - 32), Image.Resampling.LANCZOS)
                canvas.paste(im12_c, (tx_12, ty_12))
                # Distinct green accent border for V12
                draw.rectangle([(tx_12, ty_12), (tx_12 + col_w - 16, ty_12 + row_h - 32)], outline=(50, 160, 80), width=2)
                
    out_path = os.path.join(V12_DIR, "pilot_v12_before_after_comparison_sheet.png")
    canvas.save(out_path, quality=95)
    print(f"Saved: {out_path}")
    
    art_path = os.path.join(ARTIFACTS_DIR, "pilot_v12_before_after_comparison_sheet.png")
    canvas.save(art_path, quality=95)
    print(f"Copied to artifact: {art_path}")

def compose_turnaround_sheet():
    row_h = 380
    col_w = 280
    margin = 25
    header_h = 120
    
    total_w = col_w * 7 + margin * 2
    total_h = header_h + row_h * 3 + margin * 2
    
    canvas = Image.new("RGB", (total_w, total_h), (242, 244, 247))
    draw = ImageDraw.Draw(canvas)
    
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(24, 28, 40))
    font_title = get_font(34, bold=True)
    font_sub = get_font(17, bold=False)
    draw.text((margin, 22), "PILOT HAIRSTYLES V12 — 7-ANGLE MASTER TURNAROUND SHEET", fill=(255, 255, 255), font=font_title)
    draw.text((margin, 70), "Front (0°) • Three-Quarter (45°) • Profile (90°) • Rear (180°) • Elevated Rear • Fringe Close-Up • Feature Detail", fill=(185, 200, 225), font=font_sub)
    
    col_labels = ["FRONT (0°)", "THREE-QUARTER (45°)", "PROFILE (90°)", "REAR (180°)", "ELEVATED REAR", "FRINGE CLOSE-UP", "FEATURE DETAIL"]
    font_col = get_font(15, bold=True)
    draw.rectangle([(margin, header_h - 30), (total_w - margin, header_h)], fill=(40, 46, 62))
    for i, lbl in enumerate(col_labels):
        draw.text((margin + i * col_w + 12, header_h - 24), lbl, fill=(240, 245, 255), font=font_col)

    styles = [
        ("HAIR_001", "Classic Bowl Cut", ["hair_001_front.png", "hair_001_three_quarter.png", "hair_001_side.png", "hair_001_back.png", "hair_001_elevated_rear.png", "hair_001_fringe_closeup.png", "hair_001_nape_closeup.png"]),
        ("HAIR_004", "Side-Parted Short", ["hair_004_front.png", "hair_004_three_quarter.png", "hair_004_side.png", "hair_004_back.png", "hair_004_elevated_rear.png", "hair_004_fringe_closeup.png", "hair_004_part_closeup.png"]),
        ("HAIR_008", "Twin Pigtails", ["hair_008_front.png", "hair_008_three_quarter.png", "hair_008_side.png", "hair_008_back.png", "hair_008_elevated_rear.png", "hair_008_root_closeup.png", "hair_008_tail_closeup.png"])
    ]

    for idx, (h_id, h_name, img_names) in enumerate(styles):
        y = header_h + margin + idx * row_h
        draw.rectangle([(margin, y), (total_w - margin, y + row_h - 8)], fill=(255, 255, 255), outline=(220, 226, 235), width=1)
        
        for vi, fn in enumerate(img_names):
            tx = margin + vi * col_w + 8
            ty = y + 8
            fpath = os.path.join(V12_DIR, fn)
            if os.path.exists(fpath):
                im = Image.open(fpath)
                w, h_orig = im.size
                crop_box = (int(w * 0.08), int(h_orig * 0.02), int(w * 0.92), int(h_orig * 0.88))
                im_c = im.crop(crop_box).resize((col_w - 16, row_h - 24), Image.Resampling.LANCZOS)
                canvas.paste(im_c, (tx, ty))
                draw.rectangle([(tx, ty), (tx + col_w - 16, ty + row_h - 24)], outline=(225, 230, 238), width=1)

    out_path = os.path.join(V12_DIR, "pilot_v12_master_turnaround_sheet.png")
    canvas.save(out_path, quality=95)
    print(f"Saved: {out_path}")
    
    art_path = os.path.join(ARTIFACTS_DIR, "pilot_v12_master_turnaround_sheet.png")
    canvas.save(art_path, quality=95)
    print(f"Copied to artifact: {art_path}")

if __name__ == "__main__":
    compose_before_after_sheet()
    compose_turnaround_sheet()
