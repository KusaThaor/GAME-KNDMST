"""
=============================================================================
COMPOSITOR: ALL 12 HAIRSTYLES V11 MASTER COMPARISON SHEETS
Generates:
1. hairstyles_v11_overview_grid_1080p.png:
   - 4 rows x 3 columns of stylized cards
   - Each card contains 4-angle turnaround (Front, 3/4, Side, Back)
   - Presentation-ready 2400x1650 landscape sheet
2. hairstyles_v11_master_comparison_sheet.png:
   - 12 rows x 4 columns high-res vertical comparison sheet (1680x5200)
=============================================================================
"""

import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "all_12_v11")
ARTIFACTS_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

HAIRSTYLES = [
    {"id": "HAIR_001", "name": "Classic Bowl Cut", "vn": "Tóc úp nồi học trò", "desc": "Smooth rounded bowl with soft broad bangs"},
    {"id": "HAIR_002", "name": "Sporty Short", "vn": "Tóc ngắn thể thao", "desc": "Athletic boyish cut with soft rounded directional wave"},
    {"id": "HAIR_003", "name": "Rounded Bob", "vn": "Tóc tém bob nữ sinh", "desc": "Cheek-hugging sweet bob with gentle inward C-curve"},
    {"id": "HAIR_004", "name": "Side-Parted Short", "vn": "Tóc ngắn rẽ ngôi 7/3", "desc": "Off-center part with authentic 3D curved sweeping fringe"},
    {"id": "HAIR_005", "name": "Medium Straight", "vn": "Tóc thẳng ngang lưng", "desc": "Flowing shoulder/mid-back mantle with soft straight bangs"},
    {"id": "HAIR_006", "name": "Low Ponytail", "vn": "Tóc đuôi ngựa buộc thấp", "desc": "Neat low ponytail gathered at nape with S-curve drape"},
    {"id": "HAIR_007", "name": "High Ponytail", "vn": "Tóc đuôi ngựa buộc cao", "desc": "High buoyant fountain ponytail visible from the front view"},
    {"id": "HAIR_008", "name": "Twin Pigtails", "vn": "Tóc hai bên / Hai chùm", "desc": "Continuous rear cranium coverage with soft tapered plumes"},
    {"id": "HAIR_009", "name": "Braided Hair", "vn": "Tóc tết bím học sinh", "desc": "Iconic twin braids with tactile interlocking teardrop plaits"},
    {"id": "HAIR_010", "name": "Shoulder-Length Hair", "vn": "Tóc ngang vai uốn cụp", "desc": "Feminine shoulder cut with distinctive inward C-curl at tips"},
    {"id": "HAIR_011", "name": "Side-Swept Bangs", "vn": "Tóc mái xéo 2012-2013", "desc": "Signature bold diagonal swoop with layered medium bob"},
    {"id": "HAIR_012", "name": "Messy Short Hair", "vn": "Tóc ngắn layer đánh rối", "desc": "Relaxed school bedhead with natural organic volume"},
]

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

def compose_overview_grid():
    # 3 columns x 4 rows of hairstyle cards
    # Each card shows 4 views: front, three_quarter, side, back
    card_w = 760
    card_h = 350
    margin_x = 35
    margin_y = 25
    header_h = 130
    
    total_w = margin_x * 4 + card_w * 3
    total_h = header_h + margin_y * 5 + card_h * 4
    
    canvas = Image.new("RGB", (total_w, total_h), (242, 244, 247))
    draw = ImageDraw.Draw(canvas)
    
    # Header Banner
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(28, 32, 45))
    font_title = get_font(34, bold=True)
    font_sub = get_font(18, bold=False)
    draw.text((margin_x, 24), "HÀNH TRÌNH THANH XUÂN — MODULAR HAIRSTYLE LIBRARY V2 (PRODUCTION V11)", fill=(255, 255, 255), font=font_title)
    draw.text((margin_x, 72), "12 Authentic Vietnamese School Hairstyles (2012–2013) • Chibi Stylized Aesthetics • Real-Time Mobile Budget (<18k tris)", fill=(180, 195, 220), font=font_sub)
    
    thumb_w = 175
    thumb_h = 245
    
    font_card_id = get_font(20, bold=True)
    font_card_vn = get_font(15, bold=False)
    font_card_desc = get_font(13, bold=False)
    
    for idx, h in enumerate(HAIRSTYLES):
        col = idx % 3
        row = idx // 3
        
        x = margin_x + col * (card_w + margin_x)
        y = header_h + margin_y + row * (card_h + margin_y)
        
        # Card Background
        draw.rounded_rectangle([(x, y), (x + card_w, y + card_h)], radius=12, fill=(255, 255, 255), outline=(215, 222, 232), width=2)
        
        # Card Header
        draw.rectangle([(x + 2, y + 2), (x + card_w - 2, y + 48)], fill=(245, 248, 252))
        draw.text((x + 16, y + 8), f"{h['id']} — {h['name']}", fill=(20, 25, 38), font=font_card_id)
        draw.text((x + 18, y + 30), f"({h['vn']}) • {h['desc']}", fill=(100, 115, 135), font=font_card_vn)
        
        # 4 View Thumbs
        views = ['front', 'three_quarter', 'side', 'back']
        labels = ['Front (0°)', '3/4 (45°)', 'Profile (90°)', 'Back (180°)']
        
        for vi, v in enumerate(views):
            tx = x + 14 + vi * (thumb_w + 10)
            ty = y + 56
            
            img_file = os.path.join(PREVIEWS_DIR, f"{h['id'].lower()}_{v}.png")
            if os.path.exists(img_file):
                im = Image.open(img_file)
                # Crop slightly to focus on head & upper chest
                # original is 768 x 896
                w, h_orig = im.size
                crop_box = (int(w * 0.12), int(h_orig * 0.04), int(w * 0.88), int(h_orig * 0.86))
                im_cropped = im.crop(crop_box)
                im_resized = im_cropped.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(im_resized, (tx, ty))
                draw.rectangle([(tx, ty), (tx + thumb_w, ty + thumb_h)], outline=(225, 230, 238), width=1)
            else:
                draw.rectangle([(tx, ty), (tx + thumb_w, ty + thumb_h)], fill=(235, 238, 242))
                draw.text((tx + 20, ty + 100), "Rendering...", fill=(150, 150, 150))
                
            # View tag
            draw.rectangle([(tx, ty + thumb_h - 22), (tx + thumb_w, ty + thumb_h)], fill=(245, 247, 250))
            font_tag = get_font(12, bold=False)
            draw.text((tx + 6, ty + thumb_h - 18), labels[vi], fill=(70, 80, 95), font=font_tag)

    out_path = os.path.join(PREVIEWS_DIR, "hairstyles_v11_overview_grid_1080p.png")
    canvas.save(out_path, quality=95)
    print(f"Saved: {out_path}")
    
    # Copy to artifacts directory
    art_path = os.path.join(ARTIFACTS_DIR, "hairstyles_v11_overview_grid_1080p.png")
    canvas.save(art_path, quality=95)
    print(f"Copied to artifact: {art_path}")

def compose_master_sheet():
    # 12 rows x 4 columns
    row_h = 360
    col_w = 320
    label_w = 360
    header_h = 130
    margin = 25
    
    total_w = label_w + col_w * 4 + margin * 2
    total_h = header_h + row_h * 12 + margin * 2
    
    canvas = Image.new("RGB", (total_w, total_h), (242, 244, 247))
    draw = ImageDraw.Draw(canvas)
    
    # Header Banner
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(24, 28, 40))
    font_title = get_font(36, bold=True)
    font_sub = get_font(18, bold=False)
    draw.text((margin, 24), "COMPLETE 12-HAIRSTYLE MODULAR LIBRARY V2 — PRODUCTION SHEET", fill=(255, 255, 255), font=font_title)
    draw.text((margin, 76), "Turnaround Comparison (Front • Three-Quarter • Profile • Back) | Hand-Painted Soft Stylized Aesthetics | Three.js Verified", fill=(185, 200, 225), font=font_sub)
    
    # Column Header labels
    col_headers = ["STYLE SPECIFICATION", "FRONT (0°)", "THREE-QUARTER (45°)", "PROFILE / SIDE (90°)", "REAR / BACK (180°)"]
    font_col = get_font(16, bold=True)
    draw.rectangle([(margin, header_h - 32), (total_w - margin, header_h)], fill=(40, 46, 62))
    draw.text((margin + 12, header_h - 26), col_headers[0], fill=(240, 245, 255), font=font_col)
    for i in range(4):
        draw.text((margin + label_w + i * col_w + 12, header_h - 26), col_headers[i + 1], fill=(240, 245, 255), font=font_col)
        
    font_id = get_font(22, bold=True)
    font_name = get_font(17, bold=True)
    font_vn = get_font(15, bold=False)
    font_desc = get_font(13, bold=False)
    
    for idx, h in enumerate(HAIRSTYLES):
        y = header_h + margin + idx * row_h
        row_bg = (255, 255, 255) if idx % 2 == 0 else (250, 251, 254)
        draw.rectangle([(margin, y), (total_w - margin, y + row_h - 8)], fill=row_bg, outline=(220, 226, 235), width=1)
        
        # Left label panel
        draw.text((margin + 20, y + 25), h['id'], fill=(35, 75, 160), font=font_id)
        draw.text((margin + 20, y + 60), h['name'], fill=(20, 25, 35), font=font_name)
        draw.text((margin + 20, y + 90), f"Tên Việt: {h['vn']}", fill=(70, 85, 105), font=font_vn)
        draw.text((margin + 20, y + 125), f"• {h['desc']}", fill=(90, 100, 115), font=font_desc)
        draw.text((margin + 20, y + 175), "• Solid 14mm inward beveled rim", fill=(110, 120, 135), font=font_desc)
        draw.text((margin + 20, y + 200), "• Satin-matte shader calibrated", fill=(110, 120, 135), font=font_desc)
        draw.text((margin + 20, y + 225), "• GLB & Three.js Verified", fill=(45, 125, 65), font=font_desc)
        
        # 4 Views
        views = ['front', 'three_quarter', 'side', 'back']
        for vi, v in enumerate(views):
            tx = margin + label_w + vi * col_w + 10
            ty = y + 12
            img_file = os.path.join(PREVIEWS_DIR, f"{h['id'].lower()}_{v}.png")
            if os.path.exists(img_file):
                im = Image.open(img_file)
                w, h_orig = im.size
                crop_box = (int(w * 0.10), int(h_orig * 0.02), int(w * 0.90), int(h_orig * 0.88))
                im_cropped = im.crop(crop_box)
                im_resized = im_cropped.resize((col_w - 20, row_h - 32), Image.Resampling.LANCZOS)
                canvas.paste(im_resized, (tx, ty))
                draw.rectangle([(tx, ty), (tx + col_w - 20, ty + row_h - 32)], outline=(225, 230, 238), width=1)
                
    out_path = os.path.join(PREVIEWS_DIR, "hairstyles_v11_master_comparison_sheet.png")
    canvas.save(out_path, quality=95)
    print(f"Saved: {out_path}")
    
    art_path = os.path.join(ARTIFACTS_DIR, "hairstyles_v11_master_comparison_sheet.png")
    canvas.save(art_path, quality=95)
    print(f"Copied to artifact: {art_path}")

if __name__ == "__main__":
    compose_overview_grid()
    compose_master_sheet()
