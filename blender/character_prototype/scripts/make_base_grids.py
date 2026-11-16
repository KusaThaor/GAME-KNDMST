"""
=============================================================================
BUILD COMPOSITE GRID SHEETS FOR REFINED BASE CHARACTER SYSTEM
Creates:
1. turnaround_sheet.png (Front, Side, Back, 3/4)
2. base_validation_poses_sheet.png (Neutral, Walk, Run, Sit, Bow, Raise Hand)
3. base_all_actions_grid.png (16 school-life actions)
=============================================================================
"""

import os
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST")
PREVIEWS_DIR = os.path.join(PROJECT_ROOT, "blender", "character_prototype", "previews_base")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\55a6a39b-8f1f-44e9-94d9-c40bc4bfdb54\previews_base"
ACTIONS_DIR = os.path.join(PREVIEWS_DIR, "actions")
POSES_DIR = os.path.join(PREVIEWS_DIR, "poses")

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
            draw.rectangle([(x, y), (x + thumb_w, y + thumb_h)], fill=(35, 40, 50, 255))
            draw.text((x + thumb_w // 2, y + thumb_h // 2), "Rendering...", font=label_font, fill=(180, 180, 180, 255), anchor="mm")

        label_y = y + thumb_h
        draw.rectangle([(x, label_y), (x + thumb_w, label_y + label_h)], fill=(25, 28, 36, 255))
        draw.text((x + thumb_w // 2, label_y + label_h // 2), label, font=label_font, fill=(230, 235, 245, 255), anchor="mm")
        draw.rectangle([(x, y), (x + thumb_w, y + cell_h)], outline=(45, 52, 68, 255), width=1)

    for out_name in out_names:
        grid_img.save(out_name)
        print(f"Saved: {out_name}")

def main():
    print("Building composite grid sheets for Refined Base Character...")

    # 1. Turnaround Sheet (4 views)
    TURNAROUND = [
        ("01_front.png", "1. Chính diện (Front View)"),
        ("02_side.png", "2. Góc nghiêng (Side View)"),
        ("03_back.png", "3. Phía sau (Back View)"),
        ("04_three_quarter.png", "4. Góc 3/4 (Perspective View)"),
    ]
    create_grid(
        TURNAROUND,
        PREVIEWS_DIR,
        cols=4,
        rows=1,
        out_names=[
            os.path.join(PREVIEWS_DIR, "turnaround_sheet.png"),
            os.path.join(ARTIFACT_DIR, "turnaround_sheet.png"),
        ],
        thumb_w=360,
        thumb_h=450,
        header_title="NHÂN VẬT GỐC CHIBI HỌC SINH VIỆT NAM (BASE CHARACTER TURNAROUND)"
    )

    # 2. Key Validation Poses (Phase 5: Neutral, Walk, Run, Sit, Bow, Raise Hand)
    POSES = [
        ("pose_neutral.png", "1. Đứng Chuẩn (Neutral)"),
        ("pose_walk.png", "2. Bước Đi (Walk Pose)"),
        ("pose_run.png", "3. Chạy Nhanh (Run Pose)"),
        ("pose_sit.png", "4. Ngồi Học Ghế (Sit Pose)"),
        ("pose_bow.png", "5. Cúi Chào Thầy Cô (Bow Pose)"),
        ("pose_raise_hand.png", "6. Giơ Tay Phát Biểu (Raise Hand)"),
    ]
    create_grid(
        POSES,
        POSES_DIR,
        cols=3,
        rows=2,
        out_names=[
            os.path.join(PREVIEWS_DIR, "base_validation_poses_sheet.png"),
            os.path.join(ARTIFACT_DIR, "base_validation_poses_sheet.png"),
        ],
        thumb_w=400,
        thumb_h=500,
        header_title="KIỂM THỬ TƯ THẾ HỌC ĐƯỜNG CỐT LÕI (CORE VALIDATION POSES)"
    )

    # 3. 16 Canonical Actions
    ACTIONS = [
        ("action_idle.png", "1. Đứng Nghỉ (Idle)"),
        ("action_walk.png", "2. Bước Đi (Walk)"),
        ("action_run.png", "3. Chạy Nhanh (Run)"),
        ("action_sit.png", "4. Ngồi Học (Sit)"),
        ("action_sleep_desk.png", "5. Gục Bàn Ngủ (Sleep)"),
        ("action_write.png", "6. Viết Bài (Write)"),
        ("action_raise_hand.png", "7. Giơ Tay (Raise Hand)"),
        ("action_wave.png", "8. Vẫy Tay Chào (Wave)"),
        ("action_bow.png", "9. Cúi Chào (Bow)"),
        ("action_cheer.png", "10. Reo Hò (Cheer)"),
        ("action_jump.png", "11. Bật Nhảy (Jump)"),
        ("action_salute_flag.png", "12. Chào Cờ (Salute)"),
        ("action_talk.png", "13. Nói Chuyện (Talk)"),
        ("action_thinking.png", "14. Suy Nghĩ (Thinking)"),
        ("action_sad_disappointed.png", "15. Thất Vọng (Sad)"),
        ("action_blink.png", "16. Chớp Mắt (Blink)"),
    ]
    create_grid(
        ACTIONS,
        ACTIONS_DIR,
        cols=4,
        rows=4,
        out_names=[
            os.path.join(PREVIEWS_DIR, "base_all_actions_grid.png"),
            os.path.join(ARTIFACT_DIR, "base_all_actions_grid.png"),
        ],
        thumb_w=360,
        thumb_h=450,
        header_title="16 HOẠT ĐỘNG HỌC ĐƯỜNG (BASE CHARACTER CANONICAL ACTIONS)"
    )
    print("ALL BASE GRIDS CREATED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
