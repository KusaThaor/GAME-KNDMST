"""
=============================================================================
GENERATE COMPOSITE GRIDS FOR ALL ACTIONS AND POSES
Combines 16 actions into a 4x4 contact sheet with text labels,
and 6 deformation poses into a 2x3 contact sheet.
=============================================================================
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
ACTIONS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_skinned", "actions")
POSES_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_skinned", "poses")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_skinned")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_skinned"

# List of 16 actions with readable labels
ACTIONS = [
    ("action_idle.png", "1. Đứng Nghỉ (Idle)"),
    ("action_walk.png", "2. Bước Đi (Walk)"),
    ("action_run.png", "3. Chạy Nhanh (Run)"),
    ("action_sit.png", "4. Ngồi Học (Sit)"),
    ("action_sleep_desk.png", "5. Gục Bàn Ngủ (Sleep)"),
    ("action_write.png", "6. Viết Bài (Write)"),
    ("action_raise_hand.png", "7. Giơ Tay Phát Biểu (Raise Hand)"),
    ("action_wave.png", "8. Vẫy Tay Chào (Wave)"),
    ("action_bow.png", "9. Cúi Đầu Chào Thầy Cô (Bow)"),
    ("action_cheer.png", "10. Reo Hò Ăn Mừng (Cheer)"),
    ("action_jump.png", "11. Nhảy Vui Vẻ (Jump)"),
    ("action_salute_flag.png", "12. Chào Cờ Đội Viên (Salute)"),
    ("action_talk.png", "13. Nói Chuyện (Talk)"),
    ("action_thinking.png", "14. Suy Nghĩ Làm Bài (Thinking)"),
    ("action_sad_disappointed.png", "15. Thất Vọng / Buồn (Sad)"),
    ("action_blink.png", "16. Chớp Mắt Chibi (Blink)"),
]

# List of 6 deformation poses
POSES = [
    ("pose_01_neutral.png", "Pose 1: Neutral Standing"),
    ("pose_02_walk.png", "Pose 2: Walk Contact Pose"),
    ("pose_03_run.png", "Pose 3: Running Apex Sprint"),
    ("pose_04_sit.png", "Pose 4: Classroom Chair Sit (90°)"),
    ("pose_05_bend_forward.png", "Pose 5: Bend Forward (Waist Flex)"),
    ("pose_06_reach.png", "Pose 6: Reach High (Shoulder Deform)"),
]

def try_get_font(size):
    font_paths = [
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\tahoma.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

def create_grid(items, src_dir, cols, rows, out_names, thumb_w=360, thumb_h=450, header_title=""):
    title_h = 70 if header_title else 0
    label_h = 36
    cell_w = thumb_w
    cell_h = thumb_h + label_h
    grid_w = cell_w * cols
    grid_h = cell_h * rows + title_h

    grid_img = Image.new("RGBA", (grid_w, grid_h), (18, 20, 26, 255))
    draw = ImageDraw.Draw(grid_img)

    title_font = try_get_font(28)
    label_font = try_get_font(18)

    if header_title:
        draw.rectangle([(0, 0), (grid_w, title_h)], fill=(28, 32, 42, 255))
        draw.text((grid_w // 2, title_h // 2), header_title, font=title_font, fill=(240, 245, 255, 255), anchor="mm")

    for idx, (filename, label) in enumerate(items):
        if idx >= cols * rows:
            break
        r = idx // cols
        c = idx % cols
        x = c * cell_w
        y = title_h + r * cell_h

        img_path = os.path.join(src_dir, filename)
        if os.path.exists(img_path):
            try:
                im = Image.open(img_path).convert("RGBA")
                im = im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                grid_img.paste(im, (x, y), im)
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
        else:
            # Draw placeholder
            draw.rectangle([(x, y), (x + thumb_w, y + thumb_h)], fill=(35, 40, 50, 255))
            draw.text((x + thumb_w // 2, y + thumb_h // 2), "Rendering...", font=label_font, fill=(180, 180, 180, 255), anchor="mm")

        # Label bar below image
        label_y = y + thumb_h
        draw.rectangle([(x, label_y), (x + thumb_w, label_y + label_h)], fill=(25, 28, 36, 255))
        draw.text((x + thumb_w // 2, label_y + label_h // 2), label, font=label_font, fill=(230, 235, 245, 255), anchor="mm")
        # Border around cell
        draw.rectangle([(x, y), (x + thumb_w, y + cell_h)], outline=(45, 52, 68, 255), width=1)

    for out_name in out_names:
        grid_img.save(out_name)
        print(f"Saved: {out_name}")

def main():
    print("Building composite grid sheets...")
    # 1. Actions Grid (4 columns, 4 rows = 16 actions)
    create_grid(
        ACTIONS,
        ACTIONS_DIR,
        cols=4,
        rows=4,
        out_names=[
            os.path.join(PREVIEWS_DIR, "all_actions_grid.png"),
            os.path.join(ARTIFACT_DIR, "all_actions_grid.png"),
        ],
        thumb_w=360,
        thumb_h=450,
        header_title="16 HOẠT ĐỘNG HỌC ĐƯỜNG CHIBI VIỆT NAM (ANIMATION ACTIONS TEST)"
    )

    # 2. Deformations Grid (3 columns, 2 rows = 6 poses)
    create_grid(
        POSES,
        POSES_DIR,
        cols=3,
        rows=2,
        out_names=[
            os.path.join(PREVIEWS_DIR, "all_deformations_grid.png"),
            os.path.join(ARTIFACT_DIR, "all_deformations_grid.png"),
            os.path.join(PREVIEWS_DIR, "deformation_sheet.png"),
            os.path.join(ARTIFACT_DIR, "deformation_sheet.png"),
        ],
        thumb_w=400,
        thumb_h=500,
        header_title="6 TƯ THẾ KIỂM THỬ BIẾN DẠNG KHỚP (DEFORMATION RIG VALIDATION)"
    )
    print("ALL GRIDS CREATED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
