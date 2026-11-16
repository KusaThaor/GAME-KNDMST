"""
=============================================================================
CLOTHING LIBRARY V2 — COMPOSITE SHEETS GENERATOR (PIL)
Hành Trình Thanh Xuân — Cozy Vietnamese School-Life 3D Narrative Game

Generates 5 High-Resolution Presentation Sheets:
1. bottom_library_comparison_sheet.png (4x2 Grid)
2. top_library_comparison_sheet.png (4x2 Grid)
3. outfit_combination_sheet.png (4x3 Grid)
4. animation_clothing_test_sheet.png (5 Columns)
5. turnaround_modular_sheet.png (4 Columns)
=============================================================================
"""

import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
FACTORY_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
SHEETS_DIR = os.path.join(PREVIEWS_DIR, "sheets")
REGISTRY_PATH = os.path.join(FACTORY_DIR, "asset_registry.json")

os.makedirs(SHEETS_DIR, exist_ok=True)

with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
    registry = json.load(f)

def get_fonts():
    try:
        font_title = ImageFont.truetype("arial.ttf", 24)
        font_sub = ImageFont.truetype("arial.ttf", 15)
        font_label = ImageFont.truetype("arial.ttf", 17)
        font_desc = ImageFont.truetype("arial.ttf", 13)
    except Exception:
        font_title = font_sub = font_label = font_desc = ImageFont.load_default()
    return font_title, font_sub, font_label, font_desc

def build_all_sheets():
    font_title, font_sub, font_label, font_desc = get_fonts()

    # -------------------------------------------------------------
    # 1. BOTTOM LIBRARY COMPARISON SHEET (4x2 Grid)
    # -------------------------------------------------------------
    print("Building bottom_library_comparison_sheet.png...")
    b_items = list(registry["categories"]["BOTTOM"].items())
    cols, rows = 4, 2
    cell_w, cell_h = 360, 480
    pad_top = 80
    pad_cell_bottom = 65
    sheet_w = cols * cell_w
    sheet_h = pad_top + rows * (cell_h + pad_cell_bottom)

    canvas1 = Image.new("RGB", (sheet_w, sheet_h), (16, 18, 22))
    draw1 = ImageDraw.Draw(canvas1)
    draw1.text((sheet_w // 2, 28), "BỘ SƯU TẬP TRANG PHỤC HẠ THÂN — BOTTOM LIBRARY V2", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw1.text((sheet_w // 2, 54), "8 Canonical School & Casual Bottoms (Quần tây, Soóc đồng phục, Kaki, Váy xếp ly, Chữ A, Denim, Quần PE, Váy yếm)", fill=(160, 175, 195), font=font_sub, anchor="mm")

    for idx, (b_id, b_meta) in enumerate(b_items):
        c = idx % cols
        r = idx // cols
        x = c * cell_w
        y = pad_top + r * (cell_h + pad_cell_bottom)

        img_path = os.path.join(PREVIEWS_DIR, f"preview_{b_id.lower()}.png")
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h), Image.Resampling.LANCZOS)
            canvas1.paste(img, (x, y))

        label_y = y + cell_h + 16
        draw1.text((x + cell_w // 2, label_y), f"{b_id}: {b_meta['vietnamese_name']}", fill=(240, 240, 245), font=font_label, anchor="mm")
        draw1.text((x + cell_w // 2, label_y + 22), b_meta['name'], fill=(150, 165, 180), font=font_desc, anchor="mm")

    out_sheet1 = os.path.join(SHEETS_DIR, "bottom_library_comparison_sheet.png")
    canvas1.save(out_sheet1, quality=95)
    canvas1.save(os.path.join(PREVIEWS_DIR, "bottom_library_comparison_sheet.png"), quality=95)
    print(f"  Saved: {out_sheet1}")

    # -------------------------------------------------------------
    # 2. TOP LIBRARY COMPARISON SHEET (4x2 Grid)
    # -------------------------------------------------------------
    print("Building top_library_comparison_sheet.png...")
    t_items = list(registry["categories"]["TOP"].items())
    canvas2 = Image.new("RGB", (sheet_w, sheet_h), (16, 18, 22))
    draw2 = ImageDraw.Draw(canvas2)
    draw2.text((sheet_w // 2, 28), "BỘ SƯU TẬP ÁO TRANG PHỤC THƯỢNG THÂN — TOP LIBRARY V2", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw2.text((sheet_w // 2, 54), "8 Canonical School & Casual Tops (Sơ mi học sinh, Áo PE, Áo thun cổ tròn, Polo, Cổ sen, Cardigan, Dài tay, Áo khoác gió)", fill=(160, 175, 195), font=font_sub, anchor="mm")

    for idx, (t_id, t_meta) in enumerate(t_items):
        c = idx % cols
        r = idx // cols
        x = c * cell_w
        y = pad_top + r * (cell_h + pad_cell_bottom)

        img_path = os.path.join(PREVIEWS_DIR, f"preview_{t_id.lower()}.png")
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h), Image.Resampling.LANCZOS)
            canvas2.paste(img, (x, y))

        label_y = y + cell_h + 16
        draw2.text((x + cell_w // 2, label_y), f"{t_id}: {t_meta['vietnamese_name']}", fill=(240, 240, 245), font=font_label, anchor="mm")
        draw2.text((x + cell_w // 2, label_y + 22), t_meta['name'], fill=(150, 165, 180), font=font_desc, anchor="mm")

    out_sheet2 = os.path.join(SHEETS_DIR, "top_library_comparison_sheet.png")
    canvas2.save(out_sheet2, quality=95)
    canvas2.save(os.path.join(PREVIEWS_DIR, "top_library_comparison_sheet.png"), quality=95)
    print(f"  Saved: {out_sheet2}")

    # -------------------------------------------------------------
    # 3. OUTFIT COMBINATION SHEET (4x3 Grid)
    # -------------------------------------------------------------
    print("Building outfit_combination_sheet.png...")
    p_items = list(registry["categories"]["OUTFIT_PRESETS"].items())
    p_cols, p_rows = 4, 3
    p_sheet_w = p_cols * cell_w
    p_sheet_h = pad_top + p_rows * (cell_h + pad_cell_bottom)

    canvas3 = Image.new("RGB", (p_sheet_w, p_sheet_h), (16, 18, 22))
    draw3 = ImageDraw.Draw(canvas3)
    draw3.text((p_sheet_w // 2, 28), "12 BỘ PHỐI TRANG PHỤC HỌC TRÒ HOÀN CHỈNH — OUTFIT PRESETS V2", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw3.text((p_sheet_w // 2, 54), "Tái Hiện Không Khí Tựu Trường THCS 2012-2013: Top + Bottom + Footwear + Socks + Accessories", fill=(160, 175, 195), font=font_sub, anchor="mm")

    for idx, (pid, pdata) in enumerate(p_items):
        c = idx % p_cols
        r = idx // p_cols
        x = c * cell_w
        y = pad_top + r * (cell_h + pad_cell_bottom)

        img_path = os.path.join(PREVIEWS_DIR, f"preview_{pid.lower()}.png")
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h), Image.Resampling.LANCZOS)
            canvas3.paste(img, (x, y))

        label_y = y + cell_h + 16
        draw3.text((x + cell_w // 2, label_y), f"{pid}: {pdata['name']}", fill=(240, 240, 245), font=font_label, anchor="mm")
        comp_str = f"{pdata['top_id']} + {pdata['bottom_id']} + {pdata['footwear_id']}"
        draw3.text((x + cell_w // 2, label_y + 22), comp_str, fill=(150, 165, 180), font=font_desc, anchor="mm")

    out_sheet3 = os.path.join(SHEETS_DIR, "outfit_combination_sheet.png")
    canvas3.save(out_sheet3, quality=95)
    canvas3.save(os.path.join(PREVIEWS_DIR, "outfit_combination_sheet.png"), quality=95)
    print(f"  Saved: {out_sheet3}")

    # -------------------------------------------------------------
    # 4. ANIMATION CLOTHING TEST SHEET (5 Columns)
    # -------------------------------------------------------------
    print("Building animation_clothing_test_sheet.png...")
    anim_files = [
        ("anim_walk.png", "Action_Walk (Đi dạo)", "Dual-thigh skirt blending"),
        ("anim_run.png", "Action_Run (Chạy thể thao)", "Zero clipping during stride"),
        ("anim_sit.png", "Action_Sit (Ngồi học bàn)", "Natural hip & skirt curvature"),
        ("anim_bow.png", "Action_Bow (Cúi chào thầy cô)", "Clean spine & torso bend"),
        ("anim_talk.png", "Action_Talk (Trò chuyện)", "Upper body gestures stable")
    ]
    a_cols = 5
    a_cell_w, a_cell_h = 320, 480
    a_sheet_w = a_cols * a_cell_w
    a_sheet_h = pad_top + a_cell_h + pad_cell_bottom

    canvas4 = Image.new("RGB", (a_sheet_w, a_sheet_h), (16, 18, 22))
    draw4 = ImageDraw.Draw(canvas4)
    draw4.text((a_sheet_w // 2, 28), "KIỂM THỬ BIẾN DẠNG TRANG PHỤC KHI CHUYỂN ĐỘNG — ANIMATION AUDIT", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw4.text((a_sheet_w // 2, 54), "Kiểm thử Rig Skinned Mesh trên bộ xương 20 bone Student_Armature trong các tư thế trọng điểm", fill=(160, 175, 195), font=font_sub, anchor="mm")

    for i, (fn, label, sublabel) in enumerate(anim_files):
        x = i * a_cell_w
        y = pad_top
        img_path = os.path.join(PREVIEWS_DIR, fn)
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((a_cell_w, a_cell_h), Image.Resampling.LANCZOS)
            canvas4.paste(img, (x, y))

        label_y = y + a_cell_h + 16
        draw4.text((x + a_cell_w // 2, label_y), label, fill=(240, 240, 245), font=font_label, anchor="mm")
        draw4.text((x + a_cell_w // 2, label_y + 22), sublabel, fill=(150, 165, 180), font=font_desc, anchor="mm")

    out_sheet4 = os.path.join(SHEETS_DIR, "animation_clothing_test_sheet.png")
    canvas4.save(out_sheet4, quality=95)
    canvas4.save(os.path.join(PREVIEWS_DIR, "animation_clothing_test_sheet.png"), quality=95)
    print(f"  Saved: {out_sheet4}")

    # -------------------------------------------------------------
    # 5. TURNAROUND MODULAR SHEET (4 Columns)
    # -------------------------------------------------------------
    print("Building turnaround_modular_sheet.png...")
    turn_files = [
        ("mod_turn_front.png", "Mặt Trước (Front View)", "Sơ mi trắng, khăn quàng đỏ, thắt lưng"),
        ("mod_turn_side.png", "Góc Nghiêng (Side View)", "Form dáng chibi mềm mại, quai đeo cặp"),
        ("mod_turn_three_quarter.png", "Phối Cảnh 3/4 (3/4 View)", "Tỷ lệ chuẩn 1:1 trong Three.js"),
        ("mod_turn_back.png", "Mặt Sau (Back View)", "Cặp sách học sinh THCS đeo lưng gọn gàng")
    ]
    t_cols = 4
    t_sheet_w = t_cols * cell_w
    t_sheet_h = pad_top + cell_h + pad_cell_bottom

    canvas5 = Image.new("RGB", (t_sheet_w, t_sheet_h), (16, 18, 22))
    draw5 = ImageDraw.Draw(canvas5)
    draw5.text((t_sheet_w // 2, 28), "BẢNG QUAN SÁT 360° TRANG PHỤC MODULAR — MODULAR CHARACTER TURNAROUND", fill=(245, 245, 245), font=font_title, anchor="mm")
    draw5.text((t_sheet_w // 2, 54), "Trang Phục Chuẩn Đồng Phục Học Sinh THCS: TOP_001 + BOTTOM_001 + FOOTWEAR_001 + SOCKS_001 + Khăn Quàng & Cặp Sách", fill=(160, 175, 195), font=font_sub, anchor="mm")

    for i, (fn, label, sublabel) in enumerate(turn_files):
        x = i * cell_w
        y = pad_top
        img_path = os.path.join(PREVIEWS_DIR, fn)
        if os.path.exists(img_path):
            img = Image.open(img_path).resize((cell_w, cell_h), Image.Resampling.LANCZOS)
            canvas5.paste(img, (x, y))

        label_y = y + cell_h + 16
        draw5.text((x + cell_w // 2, label_y), label, fill=(240, 240, 245), font=font_label, anchor="mm")
        draw5.text((x + cell_w // 2, label_y + 22), sublabel, fill=(150, 165, 180), font=font_desc, anchor="mm")

    out_sheet5 = os.path.join(SHEETS_DIR, "turnaround_modular_sheet.png")
    canvas5.save(out_sheet5, quality=95)
    canvas5.save(os.path.join(PREVIEWS_DIR, "turnaround_modular_sheet.png"), quality=95)
    print(f"  Saved: {out_sheet5}")

    print("\nALL 5 PRESENTATION SHEETS CREATED SUCCESSFULLY!")

if __name__ == "__main__":
    build_all_sheets()
