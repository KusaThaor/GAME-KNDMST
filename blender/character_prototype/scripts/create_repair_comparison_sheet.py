import os
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_repair")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_repair"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

try:
    font_title = ImageFont.truetype("arialbd.ttf", 26)
    font_sub = ImageFont.truetype("arial.ttf", 16)
    font_label = ImageFont.truetype("arialbd.ttf", 20)
    font_desc = ImageFont.truetype("arial.ttf", 14)
except Exception:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_label = ImageFont.load_default()
    font_desc = ImageFont.load_default()

# 1. Create Before / After Comparison Sheet
def make_before_after():
    card_w = 480
    card_h = 600
    sheet_w = card_w * 2 + 60
    sheet_h = card_h + 160
    
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (26, 30, 39, 255))
    draw = ImageDraw.Draw(sheet)
    
    # Title
    draw.text((sheet_w // 2, 35), "XÁC NHẬN SỬA LỖI ĐẦU HÌNH HỘP (RECTANGULAR HEAD BUG FIX)", fill=(255, 255, 255), font=font_title, anchor="mm")
    draw.text((sheet_w // 2, 70), "So sánh trực quan: GLB Cũ Bị Lỗi (Bỏ sót Subsurf) vs. GLB Mới Sửa Lỗi (Round-Trip Re-Import)", fill=(180, 195, 210), font=font_sub, anchor="mm")
    
    panels = [
        {
            "img_path": os.path.join(PREVIEWS_DIR, "broken_original_back.png"),
            "badge": "LỖI GỐC (BROKEN GLB)",
            "badge_color": (230, 60, 60),
            "label": "1. Đầu Khối Hộp Chữ Nhật (Cube Monolith)",
            "desc": "export_apply=False khiến Subsurf bị bỏ qua,\nHair_Cap thành hộp thô 8 đỉnh che toàn bộ mặt."
        },
        {
            "img_path": os.path.join(PREVIEWS_DIR, "imported_glb_front.png"),
            "badge": "ĐÃ SỬA (FIXED GLB RE-IMPORTED)",
            "badge_color": (50, 190, 100),
            "label": "2. Đầu Tròn Chibi Chuẩn (Smooth Rounded)",
            "desc": "export_apply=True tính toán Subsurf thành 125 đỉnh,\nkhuôn mặt, mắt, mũi, miệng lộ rõ mềm mại."
        }
    ]
    
    for i, p in enumerate(panels):
        x = 20 + i * (card_w + 20)
        y = 100
        
        draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=12, fill=(35, 41, 54, 255), outline=(55, 65, 82), width=2)
        
        # Badge
        badge_w = 340
        badge_h = 32
        bx = x + (card_w - badge_w) // 2
        draw.rounded_rectangle([bx, y + 15, bx + badge_w, y + 15 + badge_h], radius=6, fill=p["badge_color"])
        draw.text((bx + badge_w // 2, y + 15 + badge_h // 2), p["badge"], fill=(255, 255, 255), font=font_label, anchor="mm")
        
        # Image
        if os.path.exists(p["img_path"]):
            im = Image.open(p["img_path"]).convert("RGBA")
            im = im.resize((card_w - 20, card_h - 130), Image.Resampling.LANCZOS)
            sheet.paste(im, (x + 10, y + 55), im)
            
        # Description background
        draw.rectangle([x + 10, y + card_h - 65, x + card_w - 10, y + card_h - 10], fill=(22, 26, 34, 255))
        draw.text((x + card_w // 2, y + card_h - 52), p["label"], fill=(255, 255, 255), font=font_label, anchor="mm")
        draw.text((x + card_w // 2, y + card_h - 25), p["desc"], fill=(170, 185, 200), font=font_desc, anchor="mm")
        
    out_file = os.path.join(PREVIEWS_DIR, "before_after_comparison.png")
    sheet.save(out_file)
    sheet.save(os.path.join(ARTIFACT_DIR, "before_after_comparison.png"))
    print("Saved:", out_file)

# 2. Create 4-Angle Turnaround Sheet of Imported Fixed GLB
def make_turnaround():
    angles = [
        ("imported_glb_front.png", "Mặt Trước (Front View)", "Mặt chibi tròn, mắt to, miệng rõ"),
        ("imported_glb_three_quarter.png", "Góc Nghiêng 3/4 (Three-Quarter)", "Tóc ôm sát đỉnh đầu, form khối nổi bật"),
        ("imported_glb_side_right.png", "Góc Nhìn Cạnh (Profile View)", "Tóc mai, tai, cổ nối mượt mà"),
        ("imported_glb_back.png", "Mặt Sau (Back View)", "Khối tóc tròn đều, vai áo tự nhiên")
    ]
    card_w = 340
    card_h = 440
    sheet_w = card_w * 4 + 60
    sheet_h = card_h + 140
    
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (24, 28, 36, 255))
    draw = ImageDraw.Draw(sheet)
    
    draw.text((sheet_w // 2, 30), "BẢNG KIỂM TRA 4 GÓC NHÌN GLB ĐÃ SỬA (IMPORTED GLB 4-VIEW TURNAROUND)", fill=(255, 255, 255), font=font_title, anchor="mm")
    draw.text((sheet_w // 2, 60), "Kiểm định trực quan round-trip sau khi import vietnamese_student_fixed.glb vào Blender scene trắng", fill=(175, 190, 205), font=font_sub, anchor="mm")
    
    for i, (fn, title, sub) in enumerate(angles):
        x = 15 + i * (card_w + 10)
        y = 85
        draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=10, fill=(34, 40, 52, 255), outline=(50, 60, 75), width=2)
        
        img_p = os.path.join(PREVIEWS_DIR, fn)
        if os.path.exists(img_p):
            im = Image.open(img_p).convert("RGBA")
            im = im.resize((card_w - 16, card_h - 75), Image.Resampling.LANCZOS)
            sheet.paste(im, (x + 8, y + 8), im)
            
        draw.rectangle([x + 8, y + card_h - 60, x + card_w - 8, y + card_h - 8], fill=(20, 24, 32, 255))
        draw.text((x + card_w // 2, y + card_h - 45), title, fill=(255, 255, 255), font=font_label, anchor="mm")
        draw.text((x + card_w // 2, y + card_h - 22), sub, fill=(160, 175, 190), font=font_desc, anchor="mm")
        
    out_file = os.path.join(PREVIEWS_DIR, "turnaround_fixed_glb.png")
    sheet.save(out_file)
    sheet.save(os.path.join(ARTIFACT_DIR, "turnaround_fixed_glb.png"))
    print("Saved:", out_file)

make_before_after()
make_turnaround()
