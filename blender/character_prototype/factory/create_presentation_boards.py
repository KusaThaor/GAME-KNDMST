import os
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\ce5fb559-46a0-4bd7-bc18-cdd305c60e60"
FACTORY_PREVIEWS = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews"

USER_UPLOADED_DIR = os.path.join(ARTIFACT_DIR, ".user_uploaded")
IMG_SHOULDER_BEFORE_1 = os.path.join(USER_UPLOADED_DIR, "media_1794905862523_854e93af.jpg")
IMG_SHOULDER_BEFORE_2 = os.path.join(USER_UPLOADED_DIR, "media_1794905895617_3531c7fb.png")
IMG_SHOE_BEFORE = os.path.join(USER_UPLOADED_DIR, "media_1794905873119_10ef4772.png")

font_title = ImageFont.load_default()

def draw_header(draw, text, x, y, size=24, color=(240, 240, 245)):
    draw.text((x, y), text, fill=color)

# =============================================================================
# 1. SHOULDER REPAIR BEFORE / AFTER BOARD
# =============================================================================
def create_shoulder_board():
    W, H = 1600, 900
    board = Image.new("RGB", (W, H), (18, 20, 26))
    draw = ImageDraw.Draw(board)

    # Title Banner
    draw.rectangle([(0, 0), (W, 70)], fill=(28, 32, 42))
    draw.text((30, 25), "SHOULDER CONSTRUCTION REPAIR — BEFORE vs AFTER AUDIT", fill=(255, 255, 255))
    draw.text((950, 25), "Hành Trình Thanh Xuân | Character Factory V3", fill=(140, 155, 180))

    # Column 1: Before (Defect)
    draw.rectangle([(30, 90), (780, 870)], fill=(24, 27, 36), outline=(220, 60, 60), width=2)
    draw.rectangle([(30, 90), (780, 130)], fill=(180, 40, 40))
    draw.text((45, 100), "BEFORE: Hollow / Disconnected Shoulder & Open Sleeve Rim", fill=(255, 255, 255))

    if os.path.exists(IMG_SHOULDER_BEFORE_1):
        img_b1 = Image.open(IMG_SHOULDER_BEFORE_1).convert("RGB").resize((350, 480))
        board.paste(img_b1, (45, 150))
    if os.path.exists(IMG_SHOULDER_BEFORE_2):
        img_b2 = Image.open(IMG_SHOULDER_BEFORE_2).convert("RGB").resize((340, 240))
        board.paste(img_b2, (415, 150))

    draw.text((415, 410), "DEFECT ROOT CAUSE:", fill=(255, 180, 180))
    draw.text((415, 435), "1. Shirt torso ended abruptly at Z=0.380.", fill=(200, 200, 210))
    draw.text((415, 460), "2. Sleeve was an open upward cylinder (Z=0.365).", fill=(200, 200, 210))
    draw.text((415, 485), "3. No sleeve cap or shoulder panel existed.", fill=(200, 200, 210))
    draw.text((415, 510), "4. Arms skin started at Z=0.310 (open void inside).", fill=(200, 200, 210))

    # Column 2: After (Fixed)
    draw.rectangle([(820, 90), (1570, 870)], fill=(24, 27, 36), outline=(50, 180, 100), width=2)
    draw.rectangle([(820, 90), (1570, 130)], fill=(40, 140, 75))
    draw.text((835, 100), "AFTER: Continuous Shoulder Panel & Softly Rounded Sleeve Cap", fill=(255, 255, 255))

    img_a1 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoulder_closeup_left_elevated.png")).convert("RGB").resize((350, 350))
    board.paste(img_a1, (835, 150))
    draw.text((835, 510), "Elevated 3/4 Shoulder View (Zero Hollows / Gaps)", fill=(180, 230, 190))

    img_a2 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoulder_closeup_front.png")).convert("RGB").resize((350, 350))
    board.paste(img_a2, (1205, 150))
    draw.text((1205, 510), "Front Shoulder View (Flowing Garment Line)", fill=(180, 230, 190))

    img_a3 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoulder_closeup_back.png")).convert("RGB").resize((350, 300))
    board.paste(img_a3, (835, 540))
    draw.text((835, 845), "Back Shoulder View (Smooth Continuous Cloth)", fill=(180, 230, 190))

    img_a4 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoulder_closeup_underarm_l.png")).convert("RGB").resize((350, 300))
    board.paste(img_a4, (1205, 540))
    draw.text((1205, 845), "Underarm / Armpit View (Concealed Overlap)", fill=(180, 230, 190))

    out_p = os.path.join(ARTIFACT_DIR, "shoulder_before_after_board.png")
    board.save(out_p, quality=95)
    print(f"Saved: {out_p}")

# =============================================================================
# 2. SHOE-TROUSER JUNCTION REPAIR BEFORE / AFTER BOARD
# =============================================================================
def create_shoe_board():
    W, H = 1600, 850
    board = Image.new("RGB", (W, H), (18, 20, 26))
    draw = ImageDraw.Draw(board)

    # Title Banner
    draw.rectangle([(0, 0), (W, 70)], fill=(28, 32, 42))
    draw.text((30, 25), "SHOE–TROUSER JUNCTION REPAIR — BEFORE vs AFTER AUDIT", fill=(255, 255, 255))
    draw.text((950, 25), "Hành Trình Thanh Xuân | Footwear & Bottoms System", fill=(140, 155, 180))

    # Left: Before
    draw.rectangle([(30, 90), (680, 820)], fill=(24, 27, 36), outline=(220, 60, 60), width=2)
    draw.rectangle([(30, 90), (680, 130)], fill=(180, 40, 40))
    draw.text((45, 100), "BEFORE: Exposed White Rectangular Patch at Front Ankle", fill=(255, 255, 255))

    if os.path.exists(IMG_SHOE_BEFORE):
        img_sb = Image.open(IMG_SHOE_BEFORE).convert("RGB").resize((610, 420))
        board.paste(img_sb, (50, 150))

    draw.text((50, 590), "IDENTIFIED ROOT CAUSE:", fill=(255, 180, 180))
    draw.text((50, 615), "1. SOCKS_001 had Y=0.0435 at front vs Trousers Y=0.0400 (clipped 3.5mm forward).", fill=(200, 200, 210))
    draw.text((50, 640), "2. Front of shoe collar was Y=0.053 protruding 12mm in front of trouser hem.", fill=(200, 200, 210))
    draw.text((50, 665), "3. Shoe had no concealed ankle shaft extending inside trousers.", fill=(200, 200, 210))
    draw.text((50, 690), "4. Result: White rectangle on front shin, inconsistent front-to-back mismatch.", fill=(200, 200, 210))

    # Right: After
    draw.rectangle([(710, 90), (1570, 820)], fill=(24, 27, 36), outline=(50, 180, 100), width=2)
    draw.rectangle([(710, 90), (1570, 130)], fill=(40, 140, 75))
    draw.text((725, 100), "AFTER: Concealed Continuous Ankle Shaft & Full Hem Overlap", fill=(255, 255, 255))

    img_sf1 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoe_trouser_front_closeup.png")).convert("RGB").resize((410, 310))
    board.paste(img_sf1, (725, 150))
    draw.text((725, 470), "Front Close-up: Clean Drape, Zero Protrusion", fill=(180, 230, 190))

    img_sf2 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoe_trouser_back_closeup.png")).convert("RGB").resize((410, 310))
    board.paste(img_sf2, (1145, 150))
    draw.text((1145, 470), "Back Close-up: Seamless Ankle Integration", fill=(180, 230, 190))

    img_sf3 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoe_trouser_elevated_3quarter.png")).convert("RGB").resize((410, 300))
    board.paste(img_sf3, (725, 500))
    draw.text((725, 805), "3/4 Elevated View: Rounded Shoe Silhouette Preserved", fill=(180, 230, 190))

    img_sf4 = Image.open(os.path.join(FACTORY_PREVIEWS, "shoe_trouser_side_closeup.png")).convert("RGB").resize((410, 300))
    board.paste(img_sf4, (1145, 500))
    draw.text((1145, 805), "Side Profile View: 16mm Deep Concealed Overlap", fill=(180, 230, 190))

    out_p = os.path.join(ARTIFACT_DIR, "shoe_before_after_board.png")
    board.save(out_p, quality=95)
    print(f"Saved: {out_p}")

# =============================================================================
# 3. COMPLETE RIG DEFORMATION AND POSE BOARD
# =============================================================================
def create_pose_board():
    W, H = 1600, 900
    board = Image.new("RGB", (W, H), (18, 20, 26))
    draw = ImageDraw.Draw(board)

    draw.rectangle([(0, 0), (W, 70)], fill=(28, 32, 42))
    draw.text((30, 25), "RIGGING DEFORMATION & POSE VALIDATION (ARMS DOWN, 45 DEG, T-POSE)", fill=(255, 255, 255))
    draw.text((1050, 25), "Student_Armature 20-Bone Rig Validation", fill=(140, 155, 180))

    shots = [
        ("pose_arms_down_front.png", 30, 90, "Pose 1: Arms Down (Front)"),
        ("pose_arms_down_back.png", 420, 90, "Pose 1: Arms Down (Back)"),
        ("pose_arms_45deg_front.png", 810, 90, "Pose 2: Arms 45° Raised (Front)"),
        ("pose_arms_45deg_back.png", 1200, 90, "Pose 2: Arms 45° Raised (Back)"),
        ("pose_t_pose_front.png", 30, 490, "Pose 3: T-Pose Full Body"),
        ("pose_t_pose_back.png", 420, 490, "Pose 3: T-Pose Rear Mesh"),
        ("pose_arms_45deg_shoulder_closeup.png", 810, 490, "Pose 2: Shoulder Close-Up (No Tears)"),
        ("pose_t_pose_underarm_closeup.png", 1200, 490, "Pose 3: Underarm Close-Up (No Collapse)"),
    ]

    for fname, x, y, caption in shots:
        p = os.path.join(FACTORY_PREVIEWS, fname)
        if os.path.exists(p):
            im = Image.open(p).convert("RGB").resize((370, 360))
            board.paste(im, (x, y))
            draw.rectangle([(x, y + 360), (x + 370, y + 390)], fill=(30, 35, 45))
            draw.text((x + 10, y + 368), caption, fill=(220, 230, 245))

    out_p = os.path.join(ARTIFACT_DIR, "pose_deformation_audit_board.png")
    board.save(out_p, quality=95)
    print(f"Saved: {out_p}")

# =============================================================================
# 4. FULL BODY TURNAROUND (NAKED BASE vs SHIRT)
# =============================================================================
def create_turnaround_board():
    W, H = 1600, 850
    board = Image.new("RGB", (W, H), (18, 20, 26))
    draw = ImageDraw.Draw(board)

    draw.rectangle([(0, 0), (W, 70)], fill=(28, 32, 42))
    draw.text((30, 25), "CANONICAL CHARACTER TURNAROUND: BASE BODY & MODULAR UNIFORM", fill=(255, 255, 255))
    draw.text((1050, 25), "Chibi Stylized Proportions Verified", fill=(140, 155, 180))

    shots = [
        ("body_only_front.png", 30, 90, "Base Body: Front View"),
        ("body_only_side.png", 420, 90, "Base Body: Side View"),
        ("body_only_back.png", 810, 90, "Base Body: Back View"),
        ("body_only_elevated_3quarter.png", 1200, 90, "Base Body: Elevated 3/4"),
        ("shirt_body_front.png", 30, 470, "Uniform: Front View"),
        ("shirt_body_side.png", 420, 470, "Uniform: Side View"),
        ("shirt_body_back.png", 810, 470, "Uniform: Back View"),
        ("shirt_body_elevated_3quarter.png", 1200, 470, "Uniform: Elevated 3/4"),
    ]

    for fname, x, y, caption in shots:
        p = os.path.join(FACTORY_PREVIEWS, fname)
        if os.path.exists(p):
            im = Image.open(p).convert("RGB").resize((370, 340))
            board.paste(im, (x, y))
            draw.rectangle([(x, y + 340), (x + 370, y + 370)], fill=(30, 35, 45))
            draw.text((x + 10, y + 348), caption, fill=(220, 230, 245))

    out_p = os.path.join(ARTIFACT_DIR, "character_turnaround_fixed_board.png")
    board.save(out_p, quality=95)
    print(f"Saved: {out_p}")

if __name__ == "__main__":
    create_shoulder_board()
    create_shoe_board()
    create_pose_board()
    create_turnaround_board()
    print("All presentation boards generated.")
