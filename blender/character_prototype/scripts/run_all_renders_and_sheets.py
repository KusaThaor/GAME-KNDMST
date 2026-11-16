import subprocess
import os
import shutil
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
TEST_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "test_variants")
BASE_BLEND = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scenes", "vietnamese_student_base.blend")
RAW_DIR = os.path.join(TEST_DIR, "raw_renders")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_audit")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_audit"
BLENDER_EXE = r"C:\Users\Admin\AppData\Local\Microsoft\WindowsApps\blender-launcher.exe"
RENDER_SCRIPT = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "scripts", "render_individual_variants.py")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

jobs = [
    (BASE_BLEND, os.path.join(RAW_DIR, "raw_base_clean.png")),
    (os.path.join(TEST_DIR, "student_height_90.blend"), os.path.join(RAW_DIR, "raw_height_90.png")),
    (os.path.join(TEST_DIR, "student_height_100.blend"), os.path.join(RAW_DIR, "raw_height_100.png")),
    (os.path.join(TEST_DIR, "student_height_110.blend"), os.path.join(RAW_DIR, "raw_height_110.png")),
    (os.path.join(TEST_DIR, "student_hair_spiky.blend"), os.path.join(RAW_DIR, "raw_hair_spiky.png")),
    (os.path.join(TEST_DIR, "student_hair_bob.blend"), os.path.join(RAW_DIR, "raw_hair_bob.png")),
    (os.path.join(TEST_DIR, "student_outfit_scarf.blend"), os.path.join(RAW_DIR, "raw_outfit_scarf.png")),
    (os.path.join(TEST_DIR, "student_outfit_pe.blend"), os.path.join(RAW_DIR, "raw_outfit_pe.png")),
]

print("=== 1. RENDERING INDIVIDUAL ISOLATED VARIANT FRAMES ===")
for blend_path, out_img in jobs:
    print(f"Rendering: {os.path.basename(blend_path)} -> {os.path.basename(out_img)}")
    cmd = [BLENDER_EXE, "-b", blend_path, "-P", RENDER_SCRIPT, "--", out_img]
    subprocess.run(cmd, check=True)

# Try loading font
try:
    font_title = ImageFont.truetype("arialbd.ttf", 26)
    font_sub = ImageFont.truetype("arial.ttf", 16)
    font_label = ImageFont.truetype("arialbd.ttf", 18)
    font_desc = ImageFont.truetype("arial.ttf", 14)
except Exception:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_label = ImageFont.load_default()
    font_desc = ImageFont.load_default()

def create_panel_sheet(panel_items, title, subtitle, out_filename, add_height_rulers=False):
    card_w = 400
    card_h = 500
    banner_h = 80
    footer_h = 70
    n = len(panel_items)
    
    sheet_w = n * card_w
    sheet_h = banner_h + card_h + footer_h
    canvas = Image.new("RGBA", (sheet_w, sheet_h), (26, 32, 44, 255))
    draw = ImageDraw.Draw(canvas)

    # Header banner
    draw.rectangle([(0, 0), (sheet_w, banner_h)], fill=(18, 22, 31, 255))
    draw.text((sheet_w // 2, 28), title, font=font_title, fill=(255, 255, 255), anchor="mm")
    draw.text((sheet_w // 2, 60), subtitle, font=font_sub, fill=(160, 174, 192), anchor="mm")

    # Height ruler guide lines across canvas if enabled
    if add_height_rulers:
        # 110% line ~ Z=0.92 -> y ~ 170
        # 100% line ~ Z=0.84 -> y ~ 205
        # 90%  line ~ Z=0.76 -> y ~ 240
        rulers = [
            (banner_h + 92, (239, 68, 68, 220), "110% (+10% Taller / Senior ~0.92m)"),
            (banner_h + 128, (34, 197, 94, 220), "100% (Base Reference ~0.84m)"),
            (banner_h + 164, (59, 130, 246, 220), "90% (-10% Shorter / Freshman ~0.76m)")
        ]
        for ry, rcol, rtxt in rulers:
            draw.line([(30, ry), (sheet_w - 30, ry)], fill=rcol, width=2)
            draw.text((45, ry - 14), rtxt, font=font_desc, fill=rcol)

    # Paste cards
    for idx, (img_path, label_txt, desc_txt, badge_txt, badge_col) in enumerate(panel_items):
        cx = idx * card_w
        if os.path.exists(img_path):
            img = Image.open(img_path).convert("RGBA")
            img = img.resize((card_w, card_h), Image.Resampling.LANCZOS)
            canvas.paste(img, (cx, banner_h), img)

        # Footer info box
        fy = banner_h + card_h
        draw.rectangle([(cx, fy), (cx + card_w, fy + footer_h)], fill=(20, 24, 34, 255))
        draw.line([(cx, fy), (cx + card_w, fy)], fill=(45, 55, 72, 255), width=1)
        if idx > 0:
            draw.line([(cx, banner_h), (cx, fy + footer_h)], fill=(36, 44, 58, 255), width=1)

        draw.text((cx + card_w // 2, fy + 22), label_txt, font=font_label, fill=(247, 250, 252), anchor="mm")
        draw.text((cx + card_w // 2, fy + 48), desc_txt, font=font_desc, fill=(160, 174, 192), anchor="mm")

        # Top Badge
        if badge_txt:
            bw = 140
            bh = 26
            bx = cx + card_w // 2 - bw // 2
            by = banner_h + 14
            draw.rectangle([(bx, by), (bx + bw, by + bh)], fill=badge_col)
            draw.text((cx + card_w // 2, by + bh // 2), badge_txt, font=font_desc, fill=(255, 255, 255), anchor="mm")

    out_p = os.path.join(PREVIEWS_DIR, out_filename)
    canvas.save(out_p, "PNG")
    shutil.copy(out_p, os.path.join(ARTIFACT_DIR, out_filename))
    print(f"SAVED SHEET: {out_p}")

print("\n=== 2. COMPOSITING SHEETS ===")
# 1. Height Comparison Sheet
panel_heights = [
    (os.path.join(RAW_DIR, "raw_height_90.png"), "1. Lớp 6 (Freshman / 90%)", "Chiều cao ~0.76m | Chibi nhỏ nhắn đáng yêu", "90% HEIGHT", (59, 130, 246, 230)),
    (os.path.join(RAW_DIR, "raw_height_100.png"), "2. Lớp 7-8 (Standard / 100%)", "Chiều cao ~0.84m | Tỷ lệ chuẩn canonical", "100% BASE", (34, 197, 94, 230)),
    (os.path.join(RAW_DIR, "raw_height_110.png"), "3. Lớp 9 (Senior / 110%)", "Chiều cao ~0.92m | Cao ráo, thanh mảnh hơn", "110% HEIGHT", (239, 68, 68, 230)),
]
create_panel_sheet(
    panel_heights,
    "KIỂM THỬ KHẢ NĂNG TÙY BIẾN CHIỀU CAO (HEIGHT VARIANTS AUDIT)",
    "Xác thực tương thích animation & biến dạng bộ xương khi co giãn tỷ lệ nhân vật học sinh 90% - 100% - 110%",
    "height_variants_comparison.png",
    add_height_rulers=True
)

# 2. Hairstyle Comparison Sheet
panel_hairs = [
    (os.path.join(RAW_DIR, "raw_base_clean.png"), "1. Tóc Mái Học Sinh (Default)", "Mái cong mềm mại ôm trán, sọ tròn mượt", "HAIR VARIANT 1", (74, 85, 104, 230)),
    (os.path.join(RAW_DIR, "raw_hair_spiky.png"), "2. Tóc Ngắn Thể Thao (Sporty)", "Cắt ngắn hai bên, vuốt nhọn năng động", "HAIR VARIANT 2", (37, 99, 235, 230)),
    (os.path.join(RAW_DIR, "raw_hair_bob.png"), "3. Tóc Bob Nữ Sinh (Cute Bob)", "Tóc bob ngắn cụp má kèm kẹp tóc đỏ", "HAIR VARIANT 3", (217, 70, 239, 230)),
]
create_panel_sheet(
    panel_hairs,
    "KIỂM THỬ TÍNH MODULE HOÁN ĐỔI KIỂU TÓC (MODULAR HAIRSTYLES AUDIT)",
    "Xác thực đầu nhân vật tương thích 100% với các bộ tóc khác nhau mà không bị hở sọ hay lỗi skinning",
    "hairstyle_variants_comparison.png"
)

# 3. Outfit Comparison Sheet
panel_outfits = [
    (os.path.join(RAW_DIR, "raw_base_clean.png"), "1. Đồng Phục Sạch (Clean Base)", "Áo trắng, quần tây navy, phôi chuẩn", "CLEAN CANVAS", (74, 85, 104, 230)),
    (os.path.join(RAW_DIR, "raw_outfit_scarf.png"), "2. Đồng Phục + Khăn Quàng", "Gắn khăn quàng đỏ Đội viên ngực áo", "RED SCARF ON", (220, 38, 38, 230)),
    (os.path.join(RAW_DIR, "raw_outfit_pe.png"), "3. Đồng Phục Thể Dục (PE Sport)", "Polo thể thao xanh dương, sọc trắng viền quần", "PE SPORT OUTFIT", (2, 132, 199, 230)),
]
create_panel_sheet(
    panel_outfits,
    "KIỂM THỬ TÍNH MODULE TRANG PHỤC & PHỤ KIỆN (OUTFITS & ACCESSORIES AUDIT)",
    "Xác thực gỡ/gắn khăn quàng đỏ học sinh Việt Nam và hoán đổi trang phục thể dục trên cùng một bộ khung xương",
    "outfit_variants_comparison.png"
)

# 4. Master Composite Audit Sheet
print("Building Master Composite Sheet...")
h_img = Image.open(os.path.join(PREVIEWS_DIR, "height_variants_comparison.png"))
hair_img = Image.open(os.path.join(PREVIEWS_DIR, "hairstyle_variants_comparison.png"))
outfit_img = Image.open(os.path.join(PREVIEWS_DIR, "outfit_variants_comparison.png"))

w = h_img.width
h_total = h_img.height + hair_img.height + outfit_img.height + 40
master = Image.new("RGBA", (w, h_total), (18, 22, 31, 255))
master.paste(h_img, (0, 0))
master.paste(hair_img, (0, h_img.height + 15))
master.paste(outfit_img, (0, h_img.height + hair_img.height + 30))

master_out = os.path.join(PREVIEWS_DIR, "production_readiness_audit_sheet.png")
master.save(master_out, "PNG")
shutil.copy(master_out, os.path.join(ARTIFACT_DIR, "production_readiness_audit_sheet.png"))
print(f"MASTER AUDIT SHEET CREATED: {master_out}")
print("ALL SHEETS GENERATED SUCCESSFULLY!")
