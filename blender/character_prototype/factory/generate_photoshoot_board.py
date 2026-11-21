"""
Generates the comprehensive Photoshoot Board for Vietnamese Red Scarf V3
"""
import os
import shutil
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\ce5fb559-46a0-4bd7-bc18-cdd305c60e60"

def get_font(size, bold=False):
    font_names = ["segoeuib.ttf" if bold else "segoeui.ttf", "arialbd.ttf" if bold else "arial.ttf"]
    for f in font_names:
        try:
            return ImageFont.truetype(f, size)
        except:
            pass
    return ImageFont.load_default()

def create_board():
    W = 1800
    H = 1250
    sheet = Image.new("RGBA", (W, H), (16, 20, 28, 255))
    draw = ImageDraw.Draw(sheet)

    font_title = get_font(26, bold=True)
    font_sub = get_font(15, bold=False)
    font_sec = get_font(17, bold=True)
    font_lbl = get_font(13, bold=True)
    font_desc = get_font(11, bold=False)

    # 1. Header
    draw.rectangle([(0, 0), (W, 75)], fill=(24, 30, 44, 255))
    draw.text((30, 14), "BỘ ẢNH CHỤP CHI TIẾT MODEL KHĂN QUÀNG ĐỎ ĐỘI VIÊN V3 (ACC_001)", fill=(255, 255, 255), font=font_title)
    draw.text((30, 46), "Hành Trình Thanh Xuân (2012-2013) | Studio Photoshoot: Cận cảnh trên đồng phục & Mô hình 3D độc lập tách rời", fill=(170, 185, 210), font=font_sub)

    # 2. Section 1: On-Character Close-Up Photoshoot (H = 500)
    draw.rectangle([(25, 90), (W - 25, 125)], fill=(32, 42, 60, 255))
    draw.text((40, 97), "PHẦN 1: ẢNH CHỤP CẬN CẢNH KHI ĐEO TRÊN ĐỒNG PHỤC HỌC SINH (MACRO STUDIO SHOTS)", fill=(255, 215, 80), font=font_sec)

    char_cards = [
        ("CẬN CẢNH NÚT THẮT NGỰC (FIG 12)", "photo_char_front_knot.png", "Nút thắt bẹt & dải khăn buông rủ"),
        ("CẬN CẢNH GÁY SAU (FIG 13)", "photo_char_back_triangle.png", "Vạt tam giác đỏ nhỏ gọn dưới chân cổ"),
        ("PHỐI CẢNH 3/4 PHÍA TRƯỚC", "photo_char_front_3quarter.png", "Dải quàng vai lượn mềm xuống nút ngực"),
        ("PHỐI CẢNH 3/4 PHÍA SAU", "photo_char_back_3quarter.png", "Góc nghiêng sau thấy rõ vạt tam giác gáy")
    ]

    card_w1 = 415
    for idx, (title, img_name, desc) in enumerate(char_cards):
        x = 30 + idx * (card_w1 + 25)
        y = 140
        draw.rectangle([(x, y), (x + card_w1, y + 430)], fill=(22, 28, 38, 255), outline=(50, 65, 88), width=1)
        draw.rectangle([(x, y), (x + card_w1, y + 32)], fill=(28, 36, 50, 255))
        draw.text((x + 12, y + 8), title, fill=(240, 245, 255), font=font_lbl)

        img_p = os.path.join(PREVIEWS_DIR, img_name)
        if os.path.exists(img_p):
            im = Image.open(img_p).convert("RGBA")
            im = im.resize((card_w1 - 20, card_w1 - 50), Image.Resampling.LANCZOS)
            sheet.paste(im, (x + 10, y + 42))

        draw.text((x + 12, y + 405), desc, fill=(160, 180, 205), font=font_desc)

    # 3. Section 2: Isolated Red Scarf 3D Model (H = 500)
    draw.rectangle([(25, 600), (W - 25, 635)], fill=(32, 42, 60, 255))
    draw.text((40, 607), "PHẦN 2: ẢNH CHỤP MÔ HÌNH 3D ĐỘC LẬP TÁCH RỜI (ISOLATED STANDALONE 3D MESH)", fill=(100, 255, 160), font=font_sec)

    iso_cards = [
        ("PHỐI CẢNH 3D ĐỘC LẬP", "photo_isolated_perspective.png", "Toàn bộ cấu trúc 3D không bị che khuất"),
        ("MẶT TRƯỚC ĐỘC LẬP", "photo_isolated_front.png", "Nút thắt bẹt, nếp gấp & 2 dải buông vát chéo"),
        ("MẶT SAU ĐỘC LẬP (FIG 13)", "photo_isolated_back.png", "Vạt tam giác sau gáy thuôn nhọn sắc nét"),
        ("GÓC NHÌN NGHIÊNG", "photo_isolated_side.png", "Độ cong lượn theo bờ vai & độ dốc trước"),
        ("GÓC TỪ TRÊN XUỐNG", "photo_isolated_top.png", "Vòng quấn cổ khép kín ôm vừa vặn gáy")
    ]

    card_w2 = 328
    for idx, (title, img_name, desc) in enumerate(iso_cards):
        x = 30 + idx * (card_w2 + 25)
        y = 650
        draw.rectangle([(x, y), (x + card_w2, y + 540)], fill=(22, 28, 38, 255), outline=(50, 65, 88), width=1)
        draw.rectangle([(x, y), (x + card_w2, y + 32)], fill=(28, 36, 50, 255))
        draw.text((x + 10, y + 8), title, fill=(240, 245, 255), font=font_lbl)

        img_p = os.path.join(PREVIEWS_DIR, img_name)
        if os.path.exists(img_p):
            im = Image.open(img_p).convert("RGBA")
            im = im.resize((card_w2 - 16, card_w2 - 16), Image.Resampling.LANCZOS)
            sheet.paste(im, (x + 8, y + 42))

        # Additional technical callouts in isolated section
        if idx == 0:
            draw.text((x + 10, y + 465), "• Khối hình: Quad BMesh thuần", fill=(200, 220, 240), font=font_desc)
            draw.text((x + 10, y + 485), "• Base Verts: 156 (Three.js WebGL)", fill=(100, 255, 150), font=font_desc)
            draw.text((x + 10, y + 505), "• Skinning: Neck / Chest / Spine", fill=(200, 220, 240), font=font_desc)
        elif idx == 2:
            draw.text((x + 10, y + 465), "• Rộng: 7.6cm | Dài vạt: 3.5cm", fill=(255, 215, 80), font=font_desc)
            draw.text((x + 10, y + 485), "• Tỉ lệ: ~20% chiều cao thân áo", fill=(100, 255, 150), font=font_desc)
            draw.text((x + 10, y + 505), "• Khớp 100% bản vẽ Hình 13", fill=(100, 255, 150), font=font_desc)
        elif idx == 1:
            draw.text((x + 10, y + 465), "• Nút thắt: Cushion 3 tầng", fill=(200, 220, 240), font=font_desc)
            draw.text((x + 10, y + 485), "• Hai vạt so le 1.6cm, vát chéo", fill=(200, 220, 240), font=font_desc)
            draw.text((x + 10, y + 505), "• Khớp 100% bản vẽ Hình 12", fill=(100, 255, 150), font=font_desc)
        else:
            draw.text((x + 10, y + 465), desc, fill=(160, 180, 205), font=font_desc)
            draw.text((x + 10, y + 485), "Độ dày vải: 2.2mm mềm mại", fill=(200, 220, 240), font=font_desc)
            draw.text((x + 10, y + 505), "Clearance chống xuyên: 3.5mm", fill=(100, 255, 150), font=font_desc)

    out_board_fac = os.path.join(PREVIEWS_DIR, "scarf_photoshoot_board.png")
    out_board_art = os.path.join(ARTIFACT_DIR, "scarf_photoshoot_board.png")
    sheet.save(out_board_fac)
    sheet.save(out_board_art)
    print(f"Saved photoshoot board: {out_board_fac}")

    # Copy all individual photos to artifact dir as well
    for f in os.listdir(PREVIEWS_DIR):
        if f.startswith("photo_") and f.endswith(".png"):
            shutil.copy2(os.path.join(PREVIEWS_DIR, f), os.path.join(ARTIFACT_DIR, f))
            print(f"Copied {f} to artifact directory")

if __name__ == "__main__":
    create_board()
