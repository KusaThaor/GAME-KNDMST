import os
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\ce5fb559-46a0-4bd7-bc18-cdd305c60e60"
VAL_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\final_oval_validation"
REF_IMG_PATH = os.path.join(ARTIFACT_DIR, ".user_uploaded", "media_1795005896274_fee69aab.png")

def get_font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except:
        return ImageFont.load_default()

def create_board_1():
    # User Ref vs GLB Front / 3/4 / Profile
    f_title = get_font(28)
    f_sub = get_font(20)
    f_badge = get_font(18)
    
    # 4 panels: Ref (cropped face), GLB Front, GLB 3/4, GLB Profile
    # Each cell 512x512
    cell_w, cell_h = 512, 512
    board_w = cell_w * 4 + 50
    board_h = cell_h + 160
    
    board = Image.new("RGB", (board_w, board_h), (24, 26, 32))
    draw = ImageDraw.Draw(board)
    
    # Header
    draw.text((30, 25), "VIETNAMESE STUDENT CHIBI — UPRIGHT OVAL EYE GEOMETRY AUDIT", fill=(255, 255, 255), font=f_title)
    draw.text((30, 65), "Verification against user reference: Upright oval silhouette, dual interior highlights, zero streaks/floating", fill=(180, 190, 205), font=f_sub)
    
    # Panel 1: User Ref
    ref_img = Image.open(REF_IMG_PATH).convert("RGB")
    # Resize keeping aspect ratio into 512x512 with letterbox
    ref_ratio = min(cell_w / ref_img.width, cell_h / ref_img.height)
    new_w, new_h = int(ref_img.width * ref_ratio), int(ref_img.height * ref_ratio)
    ref_resized = ref_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    p1 = Image.new("RGB", (cell_w, cell_h), (35, 38, 48))
    p1.paste(ref_resized, ((cell_w - new_w)//2, (cell_h - new_h)//2))
    
    # Panel 2: GLB Front
    p2 = Image.open(os.path.join(VAL_DIR, "glb_front_closeup.png")).convert("RGB").resize((cell_w, cell_h), Image.Resampling.LANCZOS)
    # Panel 3: GLB 3/4
    p3 = Image.open(os.path.join(VAL_DIR, "glb_three_quarter_l.png")).convert("RGB").resize((cell_w, cell_h), Image.Resampling.LANCZOS)
    # Panel 4: GLB Profile
    p4 = Image.open(os.path.join(VAL_DIR, "glb_profile_l.png")).convert("RGB").resize((cell_w, cell_h), Image.Resampling.LANCZOS)
    
    panels = [
        ("USER REFERENCE (SPECIFICATION)", p1, (60, 120, 210)),
        ("REIMPORTED GLB: FRONT CLOSE-UP", p2, (46, 175, 110)),
        ("REIMPORTED GLB: 3/4 PERSPECTIVE", p3, (46, 175, 110)),
        ("REIMPORTED GLB: PROFILE VIEW", p4, (46, 175, 110)),
    ]
    
    for idx, (label, img, color) in enumerate(panels):
        x = 25 + idx * (cell_w + 10)
        y = 110
        board.paste(img, (x, y))
        # Label badge
        draw.rectangle([x, y + cell_h - 40, x + cell_w, y + cell_h], fill=(0, 0, 0, 180))
        draw.text((x + 15, y + cell_h - 32), label, fill=color, font=f_badge)
        draw.rectangle([x, y, x + cell_w, y + cell_h], outline=color, width=2)
        
    out_path = os.path.join(ARTIFACT_DIR, "oval_eye_user_ref_comparison_board.png")
    board.save(out_path, quality=95)
    print(f"Saved: {out_path}")

def create_board_2():
    # Blink progression board (6 frames)
    f_title = get_font(28)
    f_sub = get_font(20)
    f_badge = get_font(18)
    
    frames = [
        ("Frame 01: Open Rest (100%)", "glb_blink_f01.png"),
        ("Frame 05: Closing Phase (69%)", "glb_blink_f05.png"),
        ("Frame 07: Fully Closed Slit (8%)", "glb_blink_f07.png"),
        ("Frame 09: Opening Phase (69%)", "glb_blink_f09.png"),
        ("Frame 12: Nearly Open (95%)", "glb_blink_f12.png"),
        ("Frame 15: Rest Restored (100%)", "glb_blink_f15.png"),
    ]
    
    cell_w, cell_h = 360, 360
    board_w = cell_w * 6 + 70
    board_h = cell_h + 160
    
    board = Image.new("RGB", (board_w, board_h), (24, 26, 32))
    draw = ImageDraw.Draw(board)
    
    draw.text((30, 25), "ACTION_BLINK — REIMPORTED GLB EYE DEFORMATION PROGRESSION", fill=(255, 255, 255), font=f_title)
    draw.text((30, 65), "Bone-driven Z-scale compression: 1.0 -> 0.08 -> 1.0 without mesh clipping, tearing, or detached highlights", fill=(180, 190, 205), font=f_sub)
    
    for idx, (label, fname) in enumerate(frames):
        img_path = os.path.join(VAL_DIR, fname)
        if not os.path.exists(img_path):
            continue
        img = Image.open(img_path).convert("RGB").resize((cell_w, cell_h), Image.Resampling.LANCZOS)
        x = 25 + idx * (cell_w + 8)
        y = 110
        board.paste(img, (x, y))
        draw.rectangle([x, y + cell_h - 40, x + cell_w, y + cell_h], fill=(0, 0, 0, 180))
        draw.text((x + 10, y + cell_h - 32), label, fill=(245, 200, 75), font=f_badge)
        draw.rectangle([x, y, x + cell_w, y + cell_h], outline=(70, 80, 100), width=1)
        
    out_path = os.path.join(ARTIFACT_DIR, "oval_eye_blink_animation_strip.png")
    board.save(out_path, quality=95)
    print(f"Saved: {out_path}")

def create_board_3():
    # Multi-Action Expressions Board
    f_title = get_font(28)
    f_sub = get_font(20)
    f_badge = get_font(18)
    
    actions = [
        ("Action_Idle (Natural Rest Pose)", "glb_Action_Idle.png"),
        ("Action_Talk (Head Tilt & Expression)", "glb_Action_Talk.png"),
        ("Action_Blink (Frame 07 Closed Slit)", "glb_blink_f07.png"),
        ("Action_Cheer (Victory Celebration Lift)", "glb_Action_Cheer.png"),
        ("Beauty Shot (Full Hair Active)", "glb_front_with_hair.png"),
    ]
    
    cell_w, cell_h = 420, 420
    board_w = cell_w * 5 + 60
    board_h = cell_h + 160
    
    board = Image.new("RGB", (board_w, board_h), (24, 26, 32))
    draw = ImageDraw.Draw(board)
    
    draw.text((30, 25), "CANONICAL ANIMATION ACTIONS & EXPRESSIONS AUDIT", fill=(255, 255, 255), font=f_title)
    draw.text((30, 65), "Verifying eye attachment stability across head rotation, blinking, and hair integration", fill=(180, 190, 205), font=f_sub)
    
    for idx, (label, fname) in enumerate(actions):
        img_path = os.path.join(VAL_DIR, fname)
        if not os.path.exists(img_path):
            continue
        img = Image.open(img_path).convert("RGB").resize((cell_w, cell_h), Image.Resampling.LANCZOS)
        x = 25 + idx * (cell_w + 8)
        y = 110
        board.paste(img, (x, y))
        draw.rectangle([x, y + cell_h - 40, x + cell_w, y + cell_h], fill=(0, 0, 0, 180))
        draw.text((x + 10, y + cell_h - 32), label, fill=(100, 200, 255), font=f_badge)
        draw.rectangle([x, y, x + cell_w, y + cell_h], outline=(70, 80, 100), width=1)
        
    out_path = os.path.join(ARTIFACT_DIR, "oval_eye_multi_action_board.png")
    board.save(out_path, quality=95)
    print(f"Saved: {out_path}")

if __name__ == "__main__":
    create_board_1()
    create_board_2()
    create_board_3()
    print("All comparison boards created successfully.")
