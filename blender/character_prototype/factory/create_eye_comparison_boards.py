import os
import shutil
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST"
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "factory", "previews")
EYE_DIAG_DIR = os.path.join(PREVIEWS_DIR, "eye_diag")
DELIV_DIR = os.path.join(PREVIEWS_DIR, "eye_deliverables")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\ce5fb559-46a0-4bd7-bc18-cdd305c60e60"

def get_font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except:
        return ImageFont.load_default()

def create_side_by_side(before_path, after_path, title, out_path, before_label="TRƯỚC KHI SỬA (LỖI VỆT TRẮNG / CHẤM TÁCH RỜI)", after_label="SAU KHI SỬA (MẮT OVAL MỊN / HIGHLIGHT GỌN GÀNG)"):
    img_b = Image.open(before_path).convert("RGB")
    img_a = Image.open(after_path).convert("RGB")
    
    w, h = img_b.size
    # Crop to focus closely on face / eyes
    crop_box = (int(w * 0.10), int(h * 0.25), int(w * 0.90), int(h * 0.70))
    crop_b = img_b.crop(crop_box)
    crop_a = img_a.crop(crop_box)
    cw, ch = crop_b.size

    # Create composite canvas
    header_h = 90
    footer_h = 50
    canvas_w = cw * 2 + 40
    canvas_h = ch + header_h + footer_h
    
    board = Image.new("RGB", (canvas_w, canvas_h), (22, 24, 29))
    draw = ImageDraw.Draw(board)
    
    title_font = get_font(32)
    label_font = get_font(22)
    sub_font = get_font(18)
    
    # Title
    draw.text((30, 25), title, fill=(245, 245, 250), font=title_font)
    
    # Place images
    board.paste(crop_b, (15, header_h))
    board.paste(crop_a, (cw + 25, header_h))
    
    # Draw label boxes
    draw.rectangle([15, header_h - 38, 15 + cw, header_h - 8], fill=(180, 40, 40))
    draw.text((25, header_h - 34), before_label, fill=(255, 255, 255), font=label_font)
    
    draw.rectangle([cw + 25, header_h - 38, cw + 25 + cw, header_h - 8], fill=(30, 140, 60))
    draw.text((cw + 35, header_h - 34), after_label, fill=(255, 255, 255), font=label_font)
    
    # Footer
    draw.text((30, canvas_h - 35), "Dự án: Hành Trình Thanh Xuân — Chibi Vietnamese Student Base Character", fill=(140, 145, 160), font=sub_font)
    
    board.save(out_path)
    print(f"Saved comparison: {out_path}")

# 1. Front View Comparison
create_side_by_side(
    os.path.join(EYE_DIAG_DIR, "front_closeup.png"),
    os.path.join(DELIV_DIR, "after_front_closeup.png"),
    "SO SÁNH GÓC CHÍNH DIỆN (FRONT CLOSE-UP) — MẮT VÀ VÙNG MẶT",
    os.path.join(DELIV_DIR, "eye_before_after_front_board.png"),
    "TRƯỚC (BEFORE): Vệt trắng, chấm tách rời, mép cắt gồ ghề",
    "SAU (AFTER): Mắt bầu tròn mềm mại, Highlight ôm gọn 100%"
)

# 2. Three Quarter View Comparison
create_side_by_side(
    os.path.join(EYE_DIAG_DIR, "three_quarter_l.png"),
    os.path.join(DELIV_DIR, "after_three_quarter_l.png"),
    "SO SÁNH GÓC NGHIÊNG 3/4 (PERSPECTIVE VIEW) — ĐỘ ÔM BỀ MẶT MẶT",
    os.path.join(DELIV_DIR, "eye_before_after_3quarter_board.png"),
    "TRƯỚC (BEFORE): Chấm trắng trôi lơ lửng trên gò má, mắt lún sâu",
    "SAU (AFTER): Khớp chuẩn pháp tuyến mặt, không lún, không hở"
)

# 3. Profile View Comparison
create_side_by_side(
    os.path.join(EYE_DIAG_DIR, "profile_l.png"),
    os.path.join(DELIV_DIR, "after_profile_l.png"),
    "SO SÁNH GÓC NHÌN NGANG (PROFILE VIEW) — ĐỘ NỔI VÀ ĐỘ DÀY HÌNH HỌC",
    os.path.join(DELIV_DIR, "eye_before_after_profile_board.png"),
    "TRƯỚC (BEFORE): Khối trắng nhô khỏi mặt 13mm, đổ bóng gắt",
    "SAU (AFTER): Độ dày mỏng đều 2.5mm, cong êm theo bề mặt da"
)

# 4. Create Full Master Diagnostic Board (6 panels: Before Front, After Front, Before 3/4, After 3/4, Reimport GLB, Blink Frame 7)
panel_w = 480
panel_h = 360
header_h = 100
footer_h = 50
canvas_w = panel_w * 3 + 60
canvas_h = panel_h * 2 + header_h + footer_h + 40

master = Image.new("RGB", (canvas_w, canvas_h), (18, 20, 24))
draw_m = ImageDraw.Draw(master)

title_font = get_font(36)
sub_font = get_font(20)
badge_font = get_font(18)

draw_m.text((30, 25), "HỆ THỐNG KIỂM ĐỊNH MẮT NHÂN VẬT CHIBI — BÁO CÁO KỸ THUẬT BLENDER", fill=(255, 255, 255), font=title_font)
draw_m.text((30, 68), "Đã xử lý triệt để lỗi vệt trắng, chấm rác tách rời, lún xuyên da và lệch pháp tuyến mặt", fill=(160, 175, 200), font=sub_font)

panels = [
    # Row 1
    (os.path.join(EYE_DIAG_DIR, "front_closeup.png"), "1. TRƯỚC: MẮT CHÍNH DIỆN (LỖI)", (190, 45, 45), 0, 0),
    (os.path.join(DELIV_DIR, "after_front_closeup.png"), "2. SAU: MẮT CHÍNH DIỆN (FIXED)", (35, 140, 65), 1, 0),
    (os.path.join(DELIV_DIR, "after_blink_frame7.png"), "3. CHUYỂN ĐỘNG: CHỚP MẮT (FRAME 7)", (30, 110, 180), 2, 0),
    # Row 2
    (os.path.join(EYE_DIAG_DIR, "three_quarter_l.png"), "4. TRƯỚC: GÓC NGHIÊNG 3/4 (LỖI)", (190, 45, 45), 0, 1),
    (os.path.join(DELIV_DIR, "after_three_quarter_l.png"), "5. SAU: GÓC NGHIÊNG 3/4 (FIXED)", (35, 140, 65), 1, 1),
    (os.path.join(DELIV_DIR, "reimport_front_closeup.png"), "6. KIỂM ĐỊNH GLB REIMPORT THỰC TẾ", (120, 50, 170), 2, 1),
]

for img_p, label, color, col, row in panels:
    im = Image.open(img_p).convert("RGB")
    w, h = im.size
    crop_b = (int(w * 0.12), int(h * 0.28), int(w * 0.88), int(h * 0.72))
    cim = im.crop(crop_b).resize((panel_w, panel_h), Image.Resampling.LANCZOS)
    
    px = 20 + col * (panel_w + 15)
    py = header_h + 30 + row * (panel_h + 40)
    
    master.paste(cim, (px, py))
    draw_m.rectangle([px, py - 28, px + panel_w, py - 4], fill=color)
    draw_m.text((px + 10, py - 26), label, fill=(255, 255, 255), font=badge_font)

master_path = os.path.join(DELIV_DIR, "eye_master_audit_board.png")
master.save(master_path)
print(f"Saved master board: {master_path}")

# Copy all key files to Artifact Directory for instant viewing
deliverables_to_copy = [
    "after_front_closeup.png",
    "after_three_quarter_l.png",
    "after_three_quarter_r.png",
    "after_profile_l.png",
    "after_blink_frame7.png",
    "reimport_front_closeup.png",
    "reimport_three_quarter_l.png",
    "reimport_profile_l.png",
    "eye_before_after_front_board.png",
    "eye_before_after_3quarter_board.png",
    "eye_before_after_profile_board.png",
    "eye_master_audit_board.png",
]

for fname in deliverables_to_copy:
    src = os.path.join(DELIV_DIR, fname)
    dst = os.path.join(ARTIFACT_DIR, fname)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied to artifact: {dst}")

# Also copy GLB
shutil.copy2(os.path.join(PROJECT_ROOT, "assets", "characters", "vietnamese_student_fixed.glb"),
             os.path.join(ARTIFACT_DIR, "vietnamese_student_fixed.glb"))
print("Deliverables copying complete!")
