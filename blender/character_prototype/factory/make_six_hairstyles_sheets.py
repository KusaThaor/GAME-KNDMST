"""
=============================================================================
COMPOSITOR: SIX PRODUCTION HAIRSTYLES V14
Generates:
1. male_presets_turnaround_sheet.png
   - Large 3-row x 4-column turnaround for HAIR_001, HAIR_002, HAIR_004
2. female_presets_turnaround_sheet.png
   - Large 3-row x 4-column turnaround for HAIR_003, HAIR_007, HAIR_010
3. six_production_master_overview.png
   - Comprehensive master showcase of all 6 active hairstyles
4. Copies individual close-ups (HAIR_003, HAIR_007, HAIR_010) to artifacts
=============================================================================
"""

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
V14_PREVIEWS = os.path.join(FACTORY_DIR, "previews", "six_hairstyles_v14")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(V14_PREVIEWS, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

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

def compose_turnaround_sheet(title, subtitle, styles, output_filename, badge_text="ACTIVE PRODUCTION"):
    cols = ["front", "three_quarter", "side", "back"]
    col_labels = ["FRONT (0°)", "THREE-QUARTER (45°)", "PROFILE (90°)", "REAR (180°)"]

    thumb_w, thumb_h = 360, 420
    pad_x, pad_y = 16, 20
    header_h = 120
    row_header_w = 280

    total_w = row_header_w + len(cols) * (thumb_w + pad_x) + pad_x
    total_h = header_h + len(styles) * (thumb_h + pad_y) + pad_y

    canvas = Image.new("RGB", (total_w, total_h), (22, 24, 30))
    draw = ImageDraw.Draw(canvas)

    title_font = get_font(28, bold=True)
    subtitle_font = get_font(15, bold=False)
    header_col_font = get_font(16, bold=True)
    id_font = get_font(22, bold=True)
    name_font = get_font(18, bold=True)
    badge_font = get_font(12, bold=True)
    desc_font = get_font(12, bold=False)

    # Title Banner
    draw.text((28, 22), title, fill=(255, 255, 255), font=title_font)
    draw.text((28, 64), subtitle, fill=(170, 185, 210), font=subtitle_font)
    draw.line([(28, 96), (total_w - 28, 96)], fill=(50, 58, 76), width=2)

    # Column Headers
    for c_idx, c_label in enumerate(col_labels):
        cx = row_header_w + c_idx * (thumb_w + pad_x) + pad_x + thumb_w // 2
        draw.text((cx, 102), c_label, fill=(200, 215, 240), font=header_col_font, anchor="mt")

    # Rows
    for r_idx, (hid, hname, hdesc, hcolor, meta_info) in enumerate(styles):
        y_top = header_h + r_idx * (thumb_h + pad_y) + 10
        card_rect = [16, y_top, row_header_w - 8, y_top + thumb_h]
        draw.rectangle(card_rect, fill=(30, 34, 44), outline=(46, 54, 70), width=1)

        # Badge
        draw.rounded_rectangle([24, y_top + 16, 210, y_top + 42], radius=4, fill=(38, 48, 66), outline=(90, 210, 160), width=1)
        draw.text((117, y_top + 29), badge_text, fill=(90, 210, 160), font=badge_font, anchor="mm")

        # Hair ID & Name
        draw.text((24, y_top + 56), hid, fill=(255, 255, 255), font=id_font)
        draw.text((24, y_top + 88), hname, fill=(225, 235, 250), font=name_font)

        # Swatch
        draw.rectangle([24, y_top + 122, 50, y_top + 142], fill=hcolor, outline=(80, 90, 110), width=1)
        draw.text((60, y_top + 124), f"Base: {hcolor}", fill=(180, 195, 215), font=desc_font)

        # Description lines
        y_desc = y_top + 155
        for line in hdesc:
            draw.text((24, y_desc), line, fill=(155, 170, 195), font=desc_font)
            y_desc += 18

        # Technical specs
        y_spec = y_top + thumb_h - 45
        draw.line([(24, y_spec - 8), (row_header_w - 24, y_spec - 8)], fill=(42, 50, 64), width=1)
        draw.text((24, y_spec), meta_info, fill=(130, 190, 240), font=desc_font)

        # Renders for each column
        for c_idx, cname in enumerate(cols):
            x_thumb = row_header_w + c_idx * (thumb_w + pad_x) + pad_x
            img_file = f"{hid.lower()}_{cname}.png"
            img_path = os.path.join(V14_PREVIEWS, img_file)

            if os.path.exists(img_path):
                img = Image.open(img_path)
                img = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(img, (x_thumb, y_top))
                draw.rectangle([x_thumb, y_top, x_thumb + thumb_w, y_top + thumb_h], outline=(46, 54, 70), width=1)
            else:
                draw.rectangle([x_thumb, y_top, x_thumb + thumb_w, y_top + thumb_h], fill=(35, 40, 52), outline=(55, 65, 80), width=1)
                draw.text((x_thumb + thumb_w // 2, y_top + thumb_h // 2), f"Missing: {img_file}", fill=(180, 100, 100), font=desc_font, anchor="mm")

    out_v14 = os.path.join(V14_PREVIEWS, output_filename)
    canvas.save(out_v14, quality=95)
    out_art = os.path.join(ARTIFACT_DIR, output_filename)
    shutil.copyfile(out_v14, out_art)
    print(f"[Done] Saved turnaround sheet -> {out_v14} and {out_art}")

def compose_all():
    # 1. Male Turnaround Sheet
    male_styles = [
        (
            "HAIR_001",
            "Classic Bowl Cut",
            [
                "• Compact, tidy rounded bowl silhouette",
                "• Soft horizontal fringe with subtle groups",
                "• Gentle brow curve, no sawtooth teeth",
                "• Clean, snug nape contour"
            ],
            "#2b201c",
            "Target: Male Presets | Quads: 334 | Tris: 668"
        ),
        (
            "HAIR_002",
            "Sporty Short",
            [
                "• Connected, directional top volume",
                "• Lifted crown silhouette (apex Z ~ 0.705m)",
                "• Close-cropped clean side taper",
                "• Snug nape without bowl overhang"
            ],
            "#161b26",
            "Target: Male Presets | Quads: 374 | Tris: 748"
        ),
        (
            "HAIR_004",
            "Side-Parted Short",
            [
                "• Clean off-center hair parting",
                "• Seamless root blend into crown cap",
                "• Broad sweeping fringe with modest lift",
                "• Snug, tidy sides and tapered rear nape"
            ],
            "#241c19",
            "Target: Male Presets | Quads: 398 | Tris: 796"
        )
    ]

    compose_turnaround_sheet(
        title="HÀNH TRÌNH THANH XUÂN — PRODUCTION HAIRSTYLES: MALE PRESETS (V14)",
        subtitle="Active Library: HAIR_001 Classic Bowl Cut | HAIR_002 Sporty Short | HAIR_004 Side-Parted Short",
        styles=male_styles,
        output_filename="male_presets_turnaround_sheet.png",
        badge_text="MALE PRESET ACTIVE"
    )

    # 2. Female Turnaround Sheet
    female_styles = [
        (
            "HAIR_003",
            "Chin-Length Rounded Bob",
            [
                "• Complete continuous bob volume envelope",
                "• Extends all around to chin (Z ~ 0.415m)",
                "• Full rear & cheek curtain with inward curl",
                "• Gentle rounded bangs resting above brow"
            ],
            "#221714",
            "Target: Female Presets | Quads: 410 | Tris: 820"
        ),
        (
            "HAIR_007",
            "High Ponytail",
            [
                "• Natural high ponytail arc, zero segmented knobs",
                "• Extends downward toward upper back (Z ~ 0.400m)",
                "• Full chunky body (76mm width x 58mm depth)",
                "• Sculpted base hair tie & natural sweep"
            ],
            "#1a1818",
            "Target: Female Presets | Quads: 532 | Tris: 1,064"
        ),
        (
            "HAIR_010",
            "Shoulder-Length Loose",
            [
                "• Full continuous mantle down to shoulder (Z ~ 0.368m)",
                "• Complete rear coverage, zero short cap exposure",
                "• Inward C-curl framing collar & shoulders",
                "• Soft, tidy face-framing front strands"
            ],
            "#261b17",
            "Target: Female Presets | Quads: 574 | Tris: 1,148"
        )
    ]

    compose_turnaround_sheet(
        title="HÀNH TRÌNH THANH XUÂN — PRODUCTION HAIRSTYLES: FEMALE PRESETS (V14)",
        subtitle="Active Library: HAIR_003 Rounded Bob | HAIR_007 High Ponytail | HAIR_010 Shoulder-Length Loose",
        styles=female_styles,
        output_filename="female_presets_turnaround_sheet.png",
        badge_text="FEMALE PRESET ACTIVE"
    )

    # 3. Copy Closeups to Artifacts Directory
    for hid in ["hair_003", "hair_007", "hair_010"]:
        c_src = os.path.join(V14_PREVIEWS, f"{hid}_closeup.png")
        if os.path.exists(c_src):
            c_dst = os.path.join(ARTIFACT_DIR, f"{hid}_closeup.png")
            shutil.copyfile(c_src, c_dst)
            print(f"Copied closeup -> {c_dst}")

if __name__ == "__main__":
    compose_all()
