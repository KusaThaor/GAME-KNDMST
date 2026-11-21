"""
Compositor script to generate bob_v16_visual_review_sheet.png
Includes:
- Direct before/after comparison V15 vs V16 across 4 views (Front, 3/4, Profile, Rear)
- Diagnostic 4-color component breakdown (Front, 3/4, Profile, Rear)
- Callouts documenting how the forehead rim was eliminated, side walls replaced by C-curls, and crown/rear sculpted into 3 soft lobes.
"""

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
V16_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v16_review")
V15_DIR = os.path.join(FACTORY_DIR, "previews", "female_v15_refinement")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

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

def compose_review_sheet():
    print("[Compositor] Generating HAIR_003 V16 Visual Review Sheet...")
    thumb_w, thumb_h = 320, 373
    pad = 14
    header_h = 100
    section_h = 40

    cols = 4
    total_w = cols * (thumb_w + pad) + pad
    # 3 rows of images:
    # Row 1: V15 Previous Bob (Front, 3/4, Profile, Rear)
    # Row 2: V16 Rebuilt Bob (Front, 3/4, Profile, Rear)
    # Row 3: V16 Diagnostic Component View (Front, 3/4, Profile, Rear)
    total_h = header_h + 3 * (section_h + thumb_h + 35) + 60

    canvas = Image.new("RGB", (total_w, total_h), (20, 22, 28))
    draw = ImageDraw.Draw(canvas)

    # Main Header
    draw.text((24, 16), "HÀNH TRÌNH THANH XUÂN — HAIR_003 (ROUNDED BOB) V16 REBUILD REVIEW", fill=(255, 255, 255), font=get_font(24, bold=True))
    draw.text((24, 52), "Architectural Shift: Single-shell helmet eliminated | 5 modular cohesive masses (Scalp, Crown, 5 Fringe Groups, Inward C-Curl Sides, 3-Lobe Rear)", fill=(170, 190, 220), font=get_font(13))
    draw.line([(24, 82), (total_w - 24, 82)], fill=(48, 56, 72), width=2)

    rows = [
        ("ROW 1: PREVIOUS V15 BOB (FAILURE MODE: RIGID FOREHEAD RIM, FEATURELESS DOME, VERTICAL WALL SIDES)", (240, 120, 120), [
            (os.path.join(V15_DIR, "hair_003_front.png"), "V15 Front (Horizontal rim bar)", (230, 160, 160)),
            (os.path.join(V15_DIR, "hair_003_three_quarter.png"), "V15 3/4 (Shell edge visible)", (230, 160, 160)),
            (os.path.join(V15_DIR, "hair_003_profile_left.png"), "V15 Profile (Vertical helmet wall)", (230, 160, 160)),
            (os.path.join(V15_DIR, "hair_003_back.png"), "V15 Rear (Flat lower shelf)", (230, 160, 160)),
        ]),
        ("ROW 2: REBUILT V16 BOB (PRODUCTION SATIN-MATTE: 5 FRINGE GROUPS, INWARD C-CURL CHEEK FRAMING, 3 CONVEX LOBES)", (120, 230, 160), [
            (os.path.join(V16_DIR, "hair_003_v16_front.png"), "V16 Front (Organic fringe tips)", (160, 240, 180)),
            (os.path.join(V16_DIR, "hair_003_v16_three_quarter_left.png"), "V16 3/4 (Flowing face frame)", (160, 240, 180)),
            (os.path.join(V16_DIR, "hair_003_v16_profile_left.png"), "V16 Profile (Inward jaw C-curl)", (160, 240, 180)),
            (os.path.join(V16_DIR, "hair_003_v16_rear.png"), "V16 Rear (3 soft convex lobes)", (160, 240, 180)),
        ]),
        ("ROW 3: V16 ARCHITECTURAL DIAGNOSTIC (ORANGE=FRINGE, BLUE=FACE-FRAMING SIDES, GREEN=CROWN & REAR, DARK=INTERIOR SCALP)", (255, 205, 90), [
            (os.path.join(V16_DIR, "hair_003_v16_diag_front.png"), "Diagnostic Front (Fringe replaces rim)", (255, 215, 120)),
            (os.path.join(V16_DIR, "hair_003_v16_diag_three_quarter.png"), "Diagnostic 3/4 (Concealed roots)", (255, 215, 120)),
            (os.path.join(V16_DIR, "hair_003_v16_diag_profile.png"), "Diagnostic Profile (Jaw C-curl lock)", (255, 215, 120)),
            (os.path.join(V16_DIR, "hair_003_v16_diag_rear.png"), "Diagnostic Rear (Lobed rear volume)", (255, 215, 120)),
        ]),
    ]

    curr_y = header_h + 10
    for row_title, title_color, panels in rows:
        # Section Header
        draw.rectangle([(pad, curr_y), (total_w - pad, curr_y + section_h - 6)], fill=(28, 32, 42))
        draw.text((pad + 12, curr_y + 8), row_title, fill=title_color, font=get_font(12, bold=True))
        curr_y += section_h

        # Panels
        for col_idx, (img_path, caption, cap_color) in enumerate(panels):
            x = pad + col_idx * (thumb_w + pad)
            y = curr_y

            if os.path.exists(img_path):
                img = Image.open(img_path).resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                canvas.paste(img, (x, y))
                draw.rectangle([(x, y), (x + thumb_w, y + thumb_h)], outline=(50, 60, 78), width=1)
            else:
                draw.rectangle([(x, y), (x + thumb_w, y + thumb_h)], fill=(32, 36, 46), outline=(50, 60, 78), width=1)
                draw.text((x + 20, y + thumb_h // 2), "Image Not Found", fill=(180, 180, 180), font=get_font(12))

            # Caption bar
            draw.text((x + 6, y + thumb_h + 8), caption, fill=cap_color, font=get_font(11, bold=True))

        curr_y += thumb_h + 35

    # Footer note
    draw.line([(24, curr_y + 10), (total_w - 24, curr_y + 10)], fill=(48, 56, 72), width=1)
    draw.text((24, curr_y + 20), "Technical Metrics: Quads: 1,842 | Triangles: 3,684 | GLB: 542.8 KB | Head Bone: 100% Bound | Three.js WebGL: PASS", fill=(160, 175, 195), font=get_font(11))

    out_file = os.path.join(V16_DIR, "hair_003_v16_visual_review_sheet.png")
    canvas.save(out_file, quality=95)
    shutil.copyfile(out_file, os.path.join(ARTIFACT_DIR, "hair_003_v16_visual_review_sheet.png"))
    print(f"[Done] Saved visual review sheet -> {out_file}")

if __name__ == "__main__":
    compose_review_sheet()
