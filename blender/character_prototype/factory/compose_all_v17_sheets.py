"""
Composes all required review sheets for HAIR_003 V17:
1. v16_vs_v17_turnaround_comparison.png (Matched Before vs After)
2. v16_vs_v17_macro_junction_comparison.png (Closeups of Roots & Temples)
3. v17_vs_reference_target_sheet.png (Direct comparison against User Target)
4. v17_diagnostic_construction_sheet.png (4-color component construction proof)
"""

from PIL import Image, ImageDraw, ImageFont
import os
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
V17_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v17_review")
V16_MATCHED_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v16_matched")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

def draw_header(draw, x, y, text, color=(240, 240, 245), size=18):
    # Use default font
    draw.text((x, y), text, fill=color)

# =============================================================================
# 1. V16 vs V17 Turnaround Comparison Sheet (4 Turnaround Angles)
# =============================================================================
print("[Compositor] Generating Sheet 1: V16 vs V17 Turnaround Comparison...")
angles = ["front", "three_quarter_right", "profile_right", "rear"]
col_titles = ["FRONT VIEW", "THREE-QUARTER VIEW", "PROFILE VIEW", "REAR VIEW"]

cell_w = 480
cell_h = 480
sheet_w = cell_w * 4
sheet_h = 70 + cell_h * 2 + 50

sheet1 = Image.new("RGB", (sheet_w, sheet_h), (20, 22, 26))
draw1 = ImageDraw.Draw(sheet1)

draw1.text((25, 12), "HAIR_003 (BOB) — V16 (BEFORE) VS V17 (ARCHITECTURAL REBUILD) [1:1 MATCHED FRAMING]", fill=(255, 215, 140))
draw1.text((25, 38), "Row 1: V16 Defect State (Separated Bar Fringe, Scalp Gaps, Rigid Helmet)  |  Row 2: V17 Rebuilt (Cohesive Fringe, Concealed Roots, Curving Bob)", fill=(180, 190, 205))

for i, ang in enumerate(angles):
    v16_p = os.path.join(V16_MATCHED_DIR, f"hair_003_v16_matched_{ang}.png")
    v17_p = os.path.join(V17_DIR, f"hair_003_v17_{ang}.png")

    img_v16 = Image.open(v16_p).resize((cell_w, cell_h), Image.Resampling.LANCZOS)
    img_v17 = Image.open(v17_p).resize((cell_w, cell_h), Image.Resampling.LANCZOS)

    x = i * cell_w
    y_v16 = 65
    y_v17 = 65 + cell_h + 25

    sheet1.paste(img_v16, (x, y_v16))
    sheet1.paste(img_v17, (x, y_v17))

    # Column title and labels
    draw1.text((x + 15, y_v16 + 10), f"V16: {col_titles[i]}", fill=(255, 120, 120))
    draw1.text((x + 15, y_v17 + 10), f"V17: {col_titles[i]}", fill=(120, 230, 150))

s1_path = os.path.join(V17_DIR, "v16_vs_v17_turnaround_comparison.png")
sheet1.save(s1_path)
shutil.copyfile(s1_path, os.path.join(ARTIFACT_DIR, "v16_vs_v17_turnaround_comparison.png"))

# =============================================================================
# 2. V16 vs V17 Macro Junctions Comparison Sheet (Roots & Temples)
# =============================================================================
print("[Compositor] Generating Sheet 2: Macro Junctions Comparison...")
macro_views = [
    ("macro_fringe_roots", "CROWN-TO-FRINGE ROOTS (OVERLAPPING & CONCEALED)"),
    ("macro_temple_left", "LEFT TEMPLE JUNCTION (SEAMLESS FACE-FRAMING)"),
    ("macro_temple_right", "RIGHT TEMPLE JUNCTION (SEAMLESS FACE-FRAMING)")
]

cell_m_w = 560
cell_m_h = 560
sheet2_w = cell_m_w * 3
sheet2_h = 70 + cell_m_h * 2 + 50

sheet2 = Image.new("RGB", (sheet2_w, sheet2_h), (20, 22, 26))
draw2 = ImageDraw.Draw(sheet2)

draw2.text((25, 12), "HAIR_003 — MACRO JUNCTION AUDIT: V16 (BEFORE) VS V17 (REBUILT)", fill=(255, 215, 140))
draw2.text((25, 38), "Top Row: V16 Exposed Scalp Gaps & Bar Attachments  |  Bottom Row: V17 Watertight Root Ingestion & Continuous Temple Flows", fill=(180, 190, 205))

for i, (m_id, m_title) in enumerate(macro_views):
    v16_p = os.path.join(V16_MATCHED_DIR, f"hair_003_v16_matched_{m_id}.png")
    v17_p = os.path.join(V17_DIR, f"hair_003_v17_{m_id}.png")

    img_v16 = Image.open(v16_p).resize((cell_m_w, cell_m_h), Image.Resampling.LANCZOS)
    img_v17 = Image.open(v17_p).resize((cell_m_w, cell_m_h), Image.Resampling.LANCZOS)

    x = i * cell_m_w
    y_v16 = 65
    y_v17 = 65 + cell_m_h + 25

    sheet2.paste(img_v16, (x, y_v16))
    sheet2.paste(img_v17, (x, y_v17))

    draw2.text((x + 15, y_v16 + 12), f"V16 BEFORE: {m_title}", fill=(255, 130, 130))
    draw2.text((x + 15, y_v17 + 12), f"V17 REBUILT: {m_title}", fill=(130, 240, 160))

s2_path = os.path.join(V17_DIR, "v16_vs_v17_macro_junction_comparison.png")
sheet2.save(s2_path)
shutil.copyfile(s2_path, os.path.join(ARTIFACT_DIR, "v16_vs_v17_macro_junction_comparison.png"))

# =============================================================================
# 3. V17 vs User Art Reference Target Sheet
# =============================================================================
print("[Compositor] Generating Sheet 3: V17 vs Art Reference Target...")
ref_panels = [
    Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_front.png")),
    Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_three_quarter.png")),
    Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_side.png")),
    Image.open(os.path.join(ARTIFACT_DIR, "ref_panel_back.png")),
]

v17_target_views = [
    Image.open(os.path.join(V17_DIR, "hair_003_v17_front.png")),
    Image.open(os.path.join(V17_DIR, "hair_003_v17_three_quarter_right.png")),
    Image.open(os.path.join(V17_DIR, "hair_003_v17_profile_right.png")),
    Image.open(os.path.join(V17_DIR, "hair_003_v17_rear.png")),
]

panel_labels = ["1. FRONT VIEW", "2. THREE-QUARTER VIEW", "3. SIDE PROFILE VIEW", "4. REAR BACK VIEW"]

sheet3 = Image.new("RGB", (sheet_w, sheet_h), (22, 24, 28))
draw3 = ImageDraw.Draw(sheet3)

draw3.text((25, 12), "HAIR_003 — USER ART REFERENCE TARGET VS V17 REBUILD (MATCHED PORTRAIT SCALE)", fill=(255, 220, 150))
draw3.text((25, 38), "Row 1: User Reference Design Target  |  Row 2: V17 Architectural Rebuild In Blender (Adapted to Canonical Base Head)", fill=(190, 200, 215))

for i in range(4):
    r_img = ref_panels[i].resize((cell_w, cell_h), Image.Resampling.LANCZOS)
    v_img = v17_target_views[i].resize((cell_w, cell_h), Image.Resampling.LANCZOS)

    x = i * cell_w
    y_ref = 65
    y_v17 = 65 + cell_h + 25

    sheet3.paste(r_img, (x, y_ref))
    sheet3.paste(v_img, (x, y_v17))

    draw3.text((x + 15, y_ref + 12), f"TARGET: {panel_labels[i]}", fill=(255, 230, 170))
    draw3.text((x + 15, y_v17 + 12), f"V17 REBUILT: {panel_labels[i]}", fill=(140, 230, 255))

s3_path = os.path.join(V17_DIR, "v17_vs_reference_target_sheet.png")
sheet3.save(s3_path)
shutil.copyfile(s3_path, os.path.join(ARTIFACT_DIR, "v17_vs_reference_target_sheet.png"))

# =============================================================================
# 4. V17 Diagnostic Construction Sheet (4-Color Component Proof)
# =============================================================================
print("[Compositor] Generating Sheet 4: Diagnostic Construction Sheet...")
diag_views = ["diag_front", "diag_three_quarter", "diag_profile", "diag_rear"]
diag_labels = ["DIAGNOSTIC FRONT", "DIAGNOSTIC 3/4", "DIAGNOSTIC PROFILE", "DIAGNOSTIC REAR"]

sheet4_h = 80 + cell_h + 30
sheet4 = Image.new("RGB", (sheet_w, sheet4_h), (22, 24, 28))
draw4 = ImageDraw.Draw(sheet4)

draw4.text((25, 12), "HAIR_003 V17 — ARCHITECTURAL COMPONENT-COLOR CONSTRUCTION PROOF", fill=(255, 220, 150))
draw4.text((25, 38), "Sage Green: Crown & Directional Rear Mass | Warm Coral: Continuous Forehead Fringe | Sky Blue: Face-Framing Cheek Locks | Slate: Protective Scalp Underlayer", fill=(190, 200, 215))

for i, dv in enumerate(diag_views):
    d_path = os.path.join(V17_DIR, f"hair_003_v17_{dv}.png")
    d_img = Image.open(d_path).resize((cell_w, cell_h), Image.Resampling.LANCZOS)
    x = i * cell_w
    y = 70
    sheet4.paste(d_img, (x, y))
    draw4.text((x + 15, y + 12), diag_labels[i], fill=(255, 255, 255))

s4_path = os.path.join(V17_DIR, "v17_diagnostic_construction_sheet.png")
sheet4.save(s4_path)
shutil.copyfile(s4_path, os.path.join(ARTIFACT_DIR, "v17_diagnostic_construction_sheet.png"))

print("[Done] All 4 master comparison sheets assembled and copied to artifact directory.")
