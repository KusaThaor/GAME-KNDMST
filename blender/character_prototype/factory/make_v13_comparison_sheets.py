"""
=============================================================================
COMPOSITOR: V13 FULL VOLUME REBUILD COMPARISON SHEETS
Generates:
1. v13_loose_hair_turnaround_sheet.png
   - Large turnaround for HAIR_003, HAIR_005, HAIR_010, HAIR_011
2. v13_tied_and_braided_turnaround_sheet.png
   - Large turnaround for HAIR_006, HAIR_007, HAIR_008, HAIR_009
3. v13_before_after_comparison_sheet.png
   - Direct side-by-side V12 vs V13 comparison for all 8 revised styles
4. v13_full_library_master_sheet.png
   - Full 12-hairstyle production library comparison
=============================================================================
"""

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
V13_PREVIEWS = os.path.join(FACTORY_DIR, "previews", "all_12_v13")
V12_PREVIEWS = os.path.join(FACTORY_DIR, "previews", "all_12_v12")
PILOT_PREVIEWS = os.path.join(FACTORY_DIR, "previews", "pilot_v12")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(V13_PREVIEWS, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# Copy the 4 preserved styles from V12 to V13 previews folder for complete sets
for pid in ["hair_001", "hair_002", "hair_004", "hair_012"]:
    for vname in ["front", "three_quarter", "side", "back", "elevated_rear"]:
        src = os.path.join(V12_PREVIEWS, f"{pid}_{vname}.png")
        if not os.path.exists(src):
            src = os.path.join(PILOT_PREVIEWS, f"{pid}_{vname}.png")
        dst = os.path.join(V13_PREVIEWS, f"{pid}_{vname}.png")
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copyfile(src, dst)

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

def compose_loose_hair_sheet():
    print("[Compositor] Generating Large Loose Hair Turnaround Sheet...")
    styles = [
        ("HAIR_003", "Rounded Bob", "V13 Complete Envelope: Jaw-Length Perimeter All Around, Full Rear & Cheeks"),
        ("HAIR_005", "Medium Straight", "V13 Complete Mantle: Rear & Side Curtain Down to Lower Neck / Chest"),
        ("HAIR_010", "Shoulder-Length Hair", "V13 Full Volume: Shoulder-Level Rear & Side Silhouette, Inward C-Curl"),
        ("HAIR_011", "Side-Swept Bangs", "V13 Broad Fringe Mass: 88mm Volumetric 3D Sweep Across Brow, Eyes Clear")
    ]
    cols = ["front", "three_quarter", "side", "back", "elevated_rear"]
    col_labels = ["FRONT (0°)", "THREE-QUARTER (45°)", "PROFILE (90°)", "REAR (180°)", "ELEVATED REAR (65°)"]

    thumb_w, thumb_h = 360, 420
    pad_x, pad_y = 16, 20
    header_h = 120
    row_header_w = 280

    total_w = row_header_w + len(cols) * (thumb_w + pad_x) + pad_x
    total_h = header_h + len(styles) * (thumb_h + pad_y) + pad_y

    canvas = Image.new("RGB", (total_w, total_h), (22, 24, 30))
    draw = ImageDraw.Draw(canvas)

    title_font = get_font(30, bold=True)
    subtitle_font = get_font(16, bold=False)
    header_col_font = get_font(16, bold=True)
    id_font = get_font(22, bold=True)
    name_font = get_font(18, bold=True)
    desc_font = get_font(13, bold=False)

    draw.text((28, 22), "HÀNH TRÌNH THANH XUÂN — V13 LOOSE HAIRSTYLES COMPLETE VOLUME REBUILD", fill=(255, 255, 255), font=title_font)
    draw.text((28, 64), "Full Continuous Hair Envelopes | Complete Rear & Side Perimeter | Real Physical Thickness", fill=(170, 185, 210), font=subtitle_font)
    draw.line([(28, 96), (total_w - 28, 96)], fill=(50, 58, 76), width=2)

    for c_idx, c_label in enumerate(col_labels):
        cx = row_header_w + c_idx * (thumb_w + pad_x) + pad_x + thumb_w // 2
        draw.text((cx, 102), c_label, fill=(200, 215, 240), font=header_col_font, anchor="mt")

    for r_idx, (hid, hname, hdesc) in enumerate(styles):
        y_top = header_h + r_idx * (thumb_h + pad_y) + 10
        card_rect = [16, y_top, row_header_w - 8, y_top + thumb_h]
        draw.rectangle(card_rect, fill=(30, 34, 44), outline=(46, 54, 70), width=1)

        draw.rounded_rectangle([24, y_top + 16, 210, y_top + 42], radius=4, fill=(38, 48, 66), outline=(90, 190, 255), width=1)
        draw.text((117, y_top + 29), "V13 FULL ENVELOPE", fill=(90, 190, 255), font=get_font(12, bold=True), anchor="mm")

        draw.text((24, y_top + 56), hid, fill=(255, 255, 255), font=id_font)
        draw.text((24, y_top + 88), hname, fill=(225, 235, 250), font=name_font)

        words = hdesc.split()
        lines, cur = [], []
        for w in words:
            cur.append(w)
            if len(" ".join(cur)) > 26:
                lines.append(" ".join(cur))
                cur = []
        if cur:
            lines.append(" ".join(cur))

        desc_y = y_top + 130
        for l in lines[:6]:
            draw.text((24, desc_y), l, fill=(150, 165, 188), font=desc_font)
            desc_y += 20

        for c_idx, vname in enumerate(cols):
            x_img = row_header_w + c_idx * (thumb_w + pad_x) + pad_x
            img_path = os.path.join(V13_PREVIEWS, f"{hid.lower()}_{vname}.png")
            if os.path.exists(img_path):
                img = Image.open(img_path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(img, (x_img, y_top))
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], outline=(42, 50, 66), width=1)
            else:
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], fill=(30, 30, 35))

    out_factory = os.path.join(V13_PREVIEWS, "v13_loose_hair_turnaround_sheet.png")
    out_artifact = os.path.join(ARTIFACT_DIR, "v13_loose_hair_turnaround_sheet.png")
    canvas.save(out_factory, quality=95)
    shutil.copyfile(out_factory, out_artifact)
    print(f"[Done] Loose Hair Turnaround saved -> {out_artifact}")

def compose_tied_and_braided_sheet():
    print("[Compositor] Generating Large Tied & Braided Hair Turnaround Sheet...")
    styles = [
        ("HAIR_006", "Low Ponytail", "V13 Full Bundle: Nape Teardrop Volume Doubled (68mm x 52mm), Soft Falling Curve"),
        ("HAIR_007", "High Ponytail", "V13 Voluminous Crest: Cohesive Solid Ponytail to Z~0.735m, No Thin Arches"),
        ("HAIR_008", "Twin Pigtails", "V13 Reopened & Doubled: Chubby Bouncy Teardrop Bundles (74mm x 54mm)"),
        ("HAIR_009", "Braided Hair", "V13 Dense Interwoven Weave: 5-Tier Overlapping Chevrons, Zero Gaps, Clean Scalp")
    ]
    cols = ["front", "three_quarter", "side", "back", "elevated_rear"]
    col_labels = ["FRONT (0°)", "THREE-QUARTER (45°)", "PROFILE (90°)", "REAR (180°)", "ELEVATED REAR (65°)"]

    thumb_w, thumb_h = 360, 420
    pad_x, pad_y = 16, 20
    header_h = 120
    row_header_w = 280

    total_w = row_header_w + len(cols) * (thumb_w + pad_x) + pad_x
    total_h = header_h + len(styles) * (thumb_h + pad_y) + pad_y

    canvas = Image.new("RGB", (total_w, total_h), (22, 24, 30))
    draw = ImageDraw.Draw(canvas)

    title_font = get_font(30, bold=True)
    subtitle_font = get_font(16, bold=False)
    header_col_font = get_font(16, bold=True)
    id_font = get_font(22, bold=True)
    name_font = get_font(18, bold=True)
    desc_font = get_font(13, bold=False)

    draw.text((28, 22), "HÀNH TRÌNH THANH XUÂN — V13 TIED & BRAIDED HAIR VOLUME REBUILD", fill=(255, 255, 255), font=title_font)
    draw.text((28, 64), "Substantial Tail Bundles | Doubled Cross-Sectional Volume | Dense Interlocking Plaits", fill=(170, 185, 210), font=subtitle_font)
    draw.line([(28, 96), (total_w - 28, 96)], fill=(50, 58, 76), width=2)

    for c_idx, c_label in enumerate(col_labels):
        cx = row_header_w + c_idx * (thumb_w + pad_x) + pad_x + thumb_w // 2
        draw.text((cx, 102), c_label, fill=(200, 215, 240), font=header_col_font, anchor="mt")

    for r_idx, (hid, hname, hdesc) in enumerate(styles):
        y_top = header_h + r_idx * (thumb_h + pad_y) + 10
        card_rect = [16, y_top, row_header_w - 8, y_top + thumb_h]
        draw.rectangle(card_rect, fill=(30, 34, 44), outline=(46, 54, 70), width=1)

        draw.rounded_rectangle([24, y_top + 16, 210, y_top + 42], radius=4, fill=(40, 48, 66), outline=(120, 210, 140), width=1)
        draw.text((117, y_top + 29), "V13 FULL VOLUME", fill=(120, 210, 140), font=get_font(12, bold=True), anchor="mm")

        draw.text((24, y_top + 56), hid, fill=(255, 255, 255), font=id_font)
        draw.text((24, y_top + 88), hname, fill=(225, 235, 250), font=name_font)

        words = hdesc.split()
        lines, cur = [], []
        for w in words:
            cur.append(w)
            if len(" ".join(cur)) > 26:
                lines.append(" ".join(cur))
                cur = []
        if cur:
            lines.append(" ".join(cur))

        desc_y = y_top + 130
        for l in lines[:6]:
            draw.text((24, desc_y), l, fill=(150, 165, 188), font=desc_font)
            desc_y += 20

        for c_idx, vname in enumerate(cols):
            x_img = row_header_w + c_idx * (thumb_w + pad_x) + pad_x
            img_path = os.path.join(V13_PREVIEWS, f"{hid.lower()}_{vname}.png")
            if os.path.exists(img_path):
                img = Image.open(img_path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(img, (x_img, y_top))
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], outline=(42, 50, 66), width=1)
            else:
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], fill=(30, 30, 35))

    out_factory = os.path.join(V13_PREVIEWS, "v13_tied_and_braided_turnaround_sheet.png")
    out_artifact = os.path.join(ARTIFACT_DIR, "v13_tied_and_braided_turnaround_sheet.png")
    canvas.save(out_factory, quality=95)
    shutil.copyfile(out_factory, out_artifact)
    print(f"[Done] Tied & Braided Turnaround saved -> {out_artifact}")

def compose_before_after_sheet():
    print("[Compositor] Generating Direct V12 vs V13 Before/After Sheet...")
    reworked = [
        ("HAIR_003", "Rounded Bob"),
        ("HAIR_005", "Medium Straight"),
        ("HAIR_006", "Low Ponytail"),
        ("HAIR_007", "High Ponytail"),
        ("HAIR_008", "Twin Pigtails"),
        ("HAIR_009", "Braided Hair"),
        ("HAIR_010", "Shoulder-Length Hair"),
        ("HAIR_011", "Side-Swept Bangs")
    ]
    angles = ["three_quarter", "back"]
    angle_labels = ["3/4 VIEW", "REAR VIEW"]

    thumb_w, thumb_h = 280, 330
    pad_x, pad_y = 12, 16
    header_h = 110
    row_header_w = 230

    # 4 image columns: V12 3/4, V13 3/4, V12 Back, V13 Back
    total_w = row_header_w + 4 * (thumb_w + pad_x) + pad_x
    total_h = header_h + len(reworked) * (thumb_h + pad_y) + pad_y

    canvas = Image.new("RGB", (total_w, total_h), (20, 22, 28))
    draw = ImageDraw.Draw(canvas)

    title_font = get_font(28, bold=True)
    subtitle_font = get_font(15, bold=False)
    header_col_font = get_font(15, bold=True)
    id_font = get_font(18, bold=True)
    name_font = get_font(15, bold=True)

    draw.text((26, 20), "HÀNH TRÌNH THANH XUÂN — V12 vs V13 DIRECT BEFORE/AFTER COMPARISON", fill=(255, 255, 255), font=title_font)
    draw.text((26, 58), "Demonstrating Full Continuous Volume, Sturdy Root Bundles, and Dense Interwoven Plaits", fill=(170, 180, 200), font=subtitle_font)
    draw.line([(26, 88), (total_w - 26, 88)], fill=(48, 54, 70), width=2)

    col_configs = [
        ("V12 BEFORE (3/4)", (180, 100, 100)),
        ("V13 REBUILD (3/4)", (100, 200, 120)),
        ("V12 BEFORE (REAR)", (180, 100, 100)),
        ("V13 REBUILD (REAR)", (100, 200, 120))
    ]
    for c_idx, (c_label, col_c) in enumerate(col_configs):
        cx = row_header_w + c_idx * (thumb_w + pad_x) + pad_x + thumb_w // 2
        draw.text((cx, 92), c_label, fill=col_c, font=header_col_font, anchor="mt")

    for r_idx, (hid, hname) in enumerate(reworked):
        y_top = header_h + r_idx * (thumb_h + pad_y) + 8
        card_rect = [14, y_top, row_header_w - 8, y_top + thumb_h]
        draw.rectangle(card_rect, fill=(28, 32, 40), outline=(42, 48, 62), width=1)

        draw.text((22, y_top + 16), hid, fill=(255, 255, 255), font=id_font)
        draw.text((22, y_top + 44), hname, fill=(210, 225, 245), font=name_font)

        img_pairs = [
            (os.path.join(V12_PREVIEWS, f"{hid.lower()}_three_quarter.png"), (160, 80, 80)),
            (os.path.join(V13_PREVIEWS, f"{hid.lower()}_three_quarter.png"), (80, 180, 100)),
            (os.path.join(V12_PREVIEWS, f"{hid.lower()}_back.png"), (160, 80, 80)),
            (os.path.join(V13_PREVIEWS, f"{hid.lower()}_back.png"), (80, 180, 100)),
        ]

        for c_idx, (p, border_col) in enumerate(img_pairs):
            x_img = row_header_w + c_idx * (thumb_w + pad_x) + pad_x
            if os.path.exists(p):
                img = Image.open(p).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(img, (x_img, y_top))
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], outline=border_col, width=2)
            else:
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], fill=(25, 25, 30))

    out_factory = os.path.join(V13_PREVIEWS, "v13_before_after_comparison_sheet.png")
    out_artifact = os.path.join(ARTIFACT_DIR, "v13_before_after_comparison_sheet.png")
    canvas.save(out_factory, quality=95)
    shutil.copyfile(out_factory, out_artifact)
    print(f"[Done] Before/After Sheet saved -> {out_artifact}")

def compose_full_library_master():
    print("[Compositor] Generating V13 Full 12-Hairstyle Master Sheet...")
    all_12 = [
        ("HAIR_001", "Classic Bowl Cut", "Preserved Pilot"),
        ("HAIR_002", "Sporty Short", "Preserved V12"),
        ("HAIR_003", "Rounded Bob", "V13 Full Envelope"),
        ("HAIR_004", "Side-Parted Short", "Preserved Pilot"),
        ("HAIR_005", "Medium Straight", "V13 Full Mantle"),
        ("HAIR_006", "Low Ponytail", "V13 Full Bundle"),
        ("HAIR_007", "High Ponytail", "V13 Full Crest"),
        ("HAIR_008", "Twin Pigtails", "V13 Full Pigtails"),
        ("HAIR_009", "Braided Hair", "V13 Dense Weave"),
        ("HAIR_010", "Shoulder-Length Hair", "V13 Full Shoulder"),
        ("HAIR_011", "Side-Swept Bangs", "V13 Broad Sweep"),
        ("HAIR_012", "Messy Short Hair", "Preserved V12")
    ]
    cols = ["front", "three_quarter", "side", "back", "elevated_rear"]
    col_labels = ["FRONT", "3/4 VIEW", "PROFILE", "REAR", "ELEVATED"]

    thumb_w, thumb_h = 240, 280
    pad_x, pad_y = 12, 14
    header_h = 100
    row_header_w = 220

    total_w = row_header_w + len(cols) * (thumb_w + pad_x) + pad_x
    total_h = header_h + len(all_12) * (thumb_h + pad_y) + pad_y

    canvas = Image.new("RGB", (total_w, total_h), (20, 22, 28))
    draw = ImageDraw.Draw(canvas)

    title_font = get_font(26, bold=True)
    subtitle_font = get_font(14, bold=False)
    header_col_font = get_font(14, bold=True)
    id_font = get_font(17, bold=True)
    name_font = get_font(14, bold=True)
    tag_font = get_font(11, bold=True)

    draw.text((24, 18), "HÀNH TRÌNH THANH XUÂN — FULL 12-HAIRSTYLE PRODUCTION LIBRARY (V13)", fill=(255, 255, 255), font=title_font)
    draw.text((24, 52), "Complete Modular Hairstyle Collection | Cohesive Volumetric Quality | Three.js & GLB Verified", fill=(170, 180, 200), font=subtitle_font)
    draw.line([(24, 80), (total_w - 24, 80)], fill=(48, 54, 70), width=2)

    for c_idx, c_label in enumerate(col_labels):
        cx = row_header_w + c_idx * (thumb_w + pad_x) + pad_x + thumb_w // 2
        draw.text((cx, 84), c_label, fill=(200, 215, 240), font=header_col_font, anchor="mt")

    for r_idx, (hid, hname, htag) in enumerate(all_12):
        y_top = header_h + r_idx * (thumb_h + pad_y) + 8
        card_rect = [14, y_top, row_header_w - 8, y_top + thumb_h]
        draw.rectangle(card_rect, fill=(28, 32, 40), outline=(42, 48, 62), width=1)

        is_rebuild = "V13" in htag
        badge_col = (100, 210, 140) if is_rebuild else (80, 160, 240)
        draw.rounded_rectangle([20, y_top + 14, 170, y_top + 36], radius=4, fill=(34, 42, 54), outline=badge_col, width=1)
        draw.text((95, y_top + 25), htag.upper(), fill=badge_col, font=tag_font, anchor="mm")

        draw.text((20, y_top + 48), hid, fill=(255, 255, 255), font=id_font)
        draw.text((20, y_top + 74), hname, fill=(210, 225, 245), font=name_font)

        for c_idx, vname in enumerate(cols):
            x_img = row_header_w + c_idx * (thumb_w + pad_x) + pad_x
            p = os.path.join(V13_PREVIEWS, f"{hid.lower()}_{vname}.png")
            if os.path.exists(p):
                img = Image.open(p).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(img, (x_img, y_top))
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], outline=(38, 44, 58), width=1)
            else:
                draw.rectangle([x_img, y_top, x_img + thumb_w, y_top + thumb_h], fill=(25, 25, 30))

    out_factory = os.path.join(V13_PREVIEWS, "v13_full_library_master_sheet.png")
    out_artifact = os.path.join(ARTIFACT_DIR, "v13_full_library_master_sheet.png")
    canvas.save(out_factory, quality=95)
    shutil.copyfile(out_factory, out_artifact)
    print(f"[Done] Full Library Master Sheet saved -> {out_artifact}")

if __name__ == "__main__":
    compose_loose_hair_sheet()
    compose_tied_and_braided_sheet()
    compose_before_after_sheet()
    compose_full_library_master()
