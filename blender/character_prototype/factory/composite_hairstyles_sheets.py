import os
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hairstyles_v2")
SHEETS_DIR = os.path.join(PREVIEWS_DIR, "sheets")
os.makedirs(SHEETS_DIR, exist_ok=True)

HAIRSTYLES = [
    ("hair_001", "HAIR_001", "Classic Bowl Cut", "Tóc úp nồi học trò"),
    ("hair_002", "HAIR_002", "Sporty Short", "Tóc ngắn thể thao vuốt nhọn"),
    ("hair_003", "HAIR_003", "Rounded Bob", "Tóc tém bob nữ sinh"),
    ("hair_004", "HAIR_004", "Side-Parted Short", "Tóc ngắn rẽ ngôi 7/3"),
    ("hair_005", "HAIR_005", "Medium Straight", "Tóc thẳng ngang lưng lửng"),
    ("hair_006", "HAIR_006", "Low Ponytail", "Tóc đuôi ngựa buộc thấp"),
    ("hair_007", "HAIR_007", "High Ponytail", "Tóc đuôi ngựa buộc cao"),
    ("hair_008", "HAIR_008", "Twin Pigtails", "Tóc hai bên buộc đôi"),
    ("hair_009", "HAIR_009", "Braided Hair", "Tóc tết bím học sinh"),
    ("hair_010", "HAIR_010", "Shoulder-Length Hair", "Tóc ngang vai uốn cúp C"),
    ("hair_011", "HAIR_011", "Side-Swept Bangs", "Tóc mái xéo phong trào 2012-2013"),
    ("hair_012", "HAIR_012", "Messy Short Hair", "Tóc ngắn layer đánh rối tự nhiên"),
]

VIEWS = [
    ("front", "Front View (Mặt Trước)"),
    ("three_quarter", "3/4 View (Phối Cảnh)"),
    ("side", "Side Profile (Góc Nghiêng)"),
    ("back", "Back View (Mặt Sau)")
]

def get_fonts():
    try:
        f_title = ImageFont.truetype("arial.ttf", 28)
        f_subtitle = ImageFont.truetype("arial.ttf", 18)
        f_col = ImageFont.truetype("arial.ttf", 19)
        f_name = ImageFont.truetype("arial.ttf", 17)
        f_sub = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        f_title = ImageFont.load_default()
        f_subtitle = ImageFont.load_default()
        f_col = ImageFont.load_default()
        f_name = ImageFont.load_default()
        f_sub = ImageFont.load_default()
    return f_title, f_subtitle, f_col, f_name, f_sub

# =============================================================================
# 1. 12 HAIRSTYLES COMPLETE TURNAROUND MATRIX (12 Rows x 4 Columns)
# =============================================================================
def build_12_turnaround_matrix():
    f_title, f_subtitle, f_col, f_name, f_sub = get_fonts()
    
    sample = Image.open(os.path.join(PREVIEWS_DIR, "hair_001_front.png"))
    orig_w, orig_h = sample.size
    
    thumb_w = 320
    thumb_h = int(orig_h * (thumb_w / orig_w))
    
    label_col_w = 300
    header_h = 100
    
    total_w = label_col_w + thumb_w * len(VIEWS)
    total_h = header_h + thumb_h * len(HAIRSTYLES) + 30
    
    canvas = Image.new("RGB", (total_w, total_h), (18, 20, 26))
    draw = ImageDraw.Draw(canvas)
    
    # Title Banner
    draw.rectangle([0, 0, total_w, header_h], fill=(24, 27, 36))
    draw.text((total_w // 2, 35), "MODULAR HAIRSTYLE LIBRARY V2 — COMPLETE TURNAROUND MATRIX", fill=(255, 255, 255), font=f_title, anchor="mm")
    draw.text((total_w // 2, 70), "Hành Trình Thanh Xuân • 12 Stylized Chibi Hairstyles (Vietnamese School-Life 2012–2013)", fill=(160, 180, 205), font=f_subtitle, anchor="mm")
    
    # Column Headers
    for c_idx, (v_key, v_label) in enumerate(VIEWS):
        cx = label_col_w + c_idx * thumb_w + thumb_w // 2
        draw.text((cx, 85), v_label, fill=(255, 215, 120), font=f_col, anchor="mm")
        
    for r_idx, (prefix, code, name, vn_name) in enumerate(HAIRSTYLES):
        y_pos = header_h + r_idx * thumb_h
        
        # Row card
        draw.rectangle([12, y_pos + 12, label_col_w - 12, y_pos + thumb_h - 12], fill=(26, 30, 42), outline=(50, 65, 90), width=1)
        # Accent pill
        draw.rectangle([20, y_pos + 22, 120, y_pos + 50], fill=(40, 75, 125))
        draw.text((70, y_pos + 36), code, fill=(255, 255, 255), font=f_sub, anchor="mm")
        # Titles
        draw.text((25, y_pos + 72), name, fill=(250, 250, 250), font=f_name, anchor="lm")
        draw.text((25, y_pos + 98), vn_name, fill=(160, 180, 205), font=f_sub, anchor="lm")
        
        # Load & paste images
        for c_idx, (v_key, v_label) in enumerate(VIEWS):
            img_path = os.path.join(PREVIEWS_DIR, f"{prefix}_{v_key}.png")
            if os.path.exists(img_path):
                im = Image.open(img_path).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(im, (label_col_w + c_idx * thumb_w, y_pos))
                draw.rectangle([label_col_w + c_idx * thumb_w, y_pos, label_col_w + (c_idx + 1) * thumb_w, y_pos + thumb_h], outline=(38, 44, 58))
                
    out_file = os.path.join(SHEETS_DIR, "hairstyles_12_turnaround_matrix.png")
    canvas.save(out_file, quality=95)
    print(f"Saved: {out_file}")

# =============================================================================
# 2. 12 HAIRSTYLES FRONT COMPARISON SHEET (2 Rows x 6 Columns)
# =============================================================================
def build_12_front_comparison_sheet():
    f_title, f_subtitle, f_col, f_name, f_sub = get_fonts()
    
    sample = Image.open(os.path.join(PREVIEWS_DIR, "hair_001_front.png"))
    orig_w, orig_h = sample.size
    
    thumb_w = 340
    thumb_h = int(orig_h * (thumb_w / orig_w))
    
    cols = 6
    rows = 2
    
    card_footer_h = 75
    cell_h = thumb_h + card_footer_h
    
    header_h = 100
    pad = 20
    
    total_w = pad * 2 + thumb_w * cols
    total_h = header_h + cell_h * rows + pad * 2
    
    canvas = Image.new("RGB", (total_w, total_h), (18, 20, 26))
    draw = ImageDraw.Draw(canvas)
    
    # Title
    draw.rectangle([0, 0, total_w, header_h], fill=(24, 27, 36))
    draw.text((total_w // 2, 38), "12 MODULAR HAIRSTYLES — FRONT SILHOUETTE COMPARISON LINEUP", fill=(255, 255, 255), font=f_title, anchor="mm")
    draw.text((total_w // 2, 74), "Modular Hairstyle Library V2 • Clear Silhouettes, Matte/Satin Finish & Anti-Clipping Clearance", fill=(160, 180, 205), font=f_subtitle, anchor="mm")
    
    for idx, (prefix, code, name, vn_name) in enumerate(HAIRSTYLES):
        c = idx % cols
        r = idx // cols
        
        x = pad + c * thumb_w
        y = header_h + pad + r * cell_h
        
        img_path = os.path.join(PREVIEWS_DIR, f"{prefix}_front.png")
        if os.path.exists(img_path):
            im = Image.open(img_path).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            canvas.paste(im, (x, y))
            
        # Card Footer
        draw.rectangle([x, y + thumb_h, x + thumb_w, y + cell_h], fill=(26, 30, 42), outline=(45, 55, 75))
        draw.text((x + thumb_w // 2, y + thumb_h + 20), f"{code} — {name}", fill=(255, 215, 120), font=f_name, anchor="mm")
        draw.text((x + thumb_w // 2, y + thumb_h + 48), vn_name, fill=(180, 200, 220), font=f_sub, anchor="mm")
        
        # Border
        draw.rectangle([x, y, x + thumb_w, y + cell_h], outline=(55, 70, 95), width=2)
        
    out_file = os.path.join(SHEETS_DIR, "hairstyles_12_front_lineup.png")
    canvas.save(out_file, quality=95)
    print(f"Saved: {out_file}")

# =============================================================================
# 3. HAIR COLOR VARIANTS COMPARISON SHEET (1 Row x 6 Columns)
# =============================================================================
def build_color_variants_sheet():
    f_title, f_subtitle, f_col, f_name, f_sub = get_fonts()
    
    colors = [
        ("color_01", "COLOR_01", "Natural Jet Black", "#1c1615", "Đen tuyền tự nhiên học sinh"),
        ("color_02", "COLOR_02", "Soft Charcoal", "#161b26", "Đen khói ánh xanh thể thao"),
        ("color_03", "COLOR_03", "Chestnut Brown", "#2b1b17", "Nâu hạt dẻ trầm ấm"),
        ("color_04", "COLOR_04", "Warm Auburn", "#4a2c1b", "Nâu đồng ánh đồng nhẹ"),
        ("color_05", "COLOR_05", "Deep Blue-Black", "#182030", "Xanh đen phong cách Anime"),
        ("color_06", "COLOR_06", "Honey Brown", "#613d28", "Nâu mật ong dạo phố"),
    ]
    
    sample = Image.open(os.path.join(PREVIEWS_DIR, "color_variant_color_01.png"))
    orig_w, orig_h = sample.size
    
    thumb_w = 340
    thumb_h = int(orig_h * (thumb_w / orig_w))
    
    card_footer_h = 95
    cell_h = thumb_h + card_footer_h
    
    header_h = 100
    pad = 20
    
    total_w = pad * 2 + thumb_w * len(colors)
    total_h = header_h + cell_h + pad * 2
    
    canvas = Image.new("RGB", (total_w, total_h), (18, 20, 26))
    draw = ImageDraw.Draw(canvas)
    
    # Title
    draw.rectangle([0, 0, total_w, header_h], fill=(24, 27, 36))
    draw.text((total_w // 2, 38), "HAIR COLOR VARIANTS — 6 AUTHENTIC PALETTES", fill=(255, 255, 255), font=f_title, anchor="mm")
    draw.text((total_w // 2, 74), "Configurable Hair Color Shaders with Matte Satin Finish (Evaluated on HAIR_003 Rounded Bob)", fill=(160, 180, 205), font=f_subtitle, anchor="mm")
    
    for c_idx, (cid, code, name, hex_val, vn_desc) in enumerate(colors):
        x = pad + c_idx * thumb_w
        y = header_h + pad
        
        img_p = os.path.join(PREVIEWS_DIR, f"color_variant_{cid}.png")
        if os.path.exists(img_p):
            im = Image.open(img_p).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            canvas.paste(im, (x, y))
            
        # Swatch bar
        # Convert hex to rgb
        hex_clean = hex_val.lstrip("#")
        r = int(hex_clean[0:2], 16)
        g = int(hex_clean[2:4], 16)
        b = int(hex_clean[4:6], 16)
        
        draw.rectangle([x, y + thumb_h, x + thumb_w, y + cell_h], fill=(26, 30, 42), outline=(45, 55, 75))
        # Color pill
        draw.rectangle([x + 20, y + thumb_h + 15, x + 50, y + thumb_h + 45], fill=(r, g, b), outline=(200, 200, 200))
        draw.text((x + 60, y + thumb_h + 22), f"{name}", fill=(255, 255, 255), font=f_name, anchor="lm")
        draw.text((x + 60, y + thumb_h + 42), f"Hex: {hex_val}", fill=(255, 215, 120), font=f_sub, anchor="lm")
        draw.text((x + 20, y + thumb_h + 70), vn_desc, fill=(160, 180, 205), font=f_sub, anchor="lm")
        
        draw.rectangle([x, y, x + thumb_w, y + cell_h], outline=(55, 70, 95), width=2)
        
    out_file = os.path.join(SHEETS_DIR, "hairstyles_color_variants_sheet.png")
    canvas.save(out_file, quality=95)
    print(f"Saved: {out_file}")

# =============================================================================
# 4. THREE-QUARTER LINEUP COMPARISON (2 Rows x 6 Columns)
# =============================================================================
def build_12_threequarter_sheet():
    f_title, f_subtitle, f_col, f_name, f_sub = get_fonts()
    sample = Image.open(os.path.join(PREVIEWS_DIR, "hair_001_three_quarter.png"))
    orig_w, orig_h = sample.size
    thumb_w = 340
    thumb_h = int(orig_h * (thumb_w / orig_w))
    cols = 6
    rows = 2
    card_footer_h = 75
    cell_h = thumb_h + card_footer_h
    header_h = 100
    pad = 20
    total_w = pad * 2 + thumb_w * cols
    total_h = header_h + cell_h * rows + pad * 2
    canvas = Image.new("RGB", (total_w, total_h), (18, 20, 26))
    draw = ImageDraw.Draw(canvas)
    
    draw.rectangle([0, 0, total_w, header_h], fill=(24, 27, 36))
    draw.text((total_w // 2, 38), "12 MODULAR HAIRSTYLES — 3/4 PERSPECTIVE LINEUP (ACCESSORIES & CLEARANCE)", fill=(255, 255, 255), font=f_title, anchor="mm")
    draw.text((total_w // 2, 74), "Verification with Glasses (ACC_002), Hair Clip (ACC_003), and School Uniform (TOP_001)", fill=(160, 180, 205), font=f_subtitle, anchor="mm")
    
    for idx, (prefix, code, name, vn_name) in enumerate(HAIRSTYLES):
        c = idx % cols
        r = idx // cols
        x = pad + c * thumb_w
        y = header_h + pad + r * cell_h
        img_path = os.path.join(PREVIEWS_DIR, f"{prefix}_three_quarter.png")
        if os.path.exists(img_path):
            im = Image.open(img_path).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            canvas.paste(im, (x, y))
        draw.rectangle([x, y + thumb_h, x + thumb_w, y + cell_h], fill=(26, 30, 42), outline=(45, 55, 75))
        draw.text((x + thumb_w // 2, y + thumb_h + 20), f"{code} — {name}", fill=(255, 215, 120), font=f_name, anchor="mm")
        draw.text((x + thumb_w // 2, y + thumb_h + 48), vn_name, fill=(180, 200, 220), font=f_sub, anchor="mm")
        draw.rectangle([x, y, x + thumb_w, y + cell_h], outline=(55, 70, 95), width=2)
        
    out_file = os.path.join(SHEETS_DIR, "hairstyles_12_threequarter_lineup.png")
    canvas.save(out_file, quality=95)
    print(f"Saved: {out_file}")

if __name__ == "__main__":
    print("Compositing all hairstyle validation sheets...")
    build_12_turnaround_matrix()
    build_12_front_comparison_sheet()
    build_color_variants_sheet()
    build_12_threequarter_sheet()
    print("All comparison sheets generated successfully!")
