"""PRP_DESK_2SEAT — bàn học sinh 2 chỗ + ghế băng (Nhóm A: dựng bằng script).

Trạng thái: MẪU THỬ quy trình (PROPOSED) — kích thước/màu chưa đối chiếu Visual Bible, chưa dùng trong cảnh.
Chạy:
  Máy bạn:   blender --background --python tools/blender/props/desk_2seat.py
  Python:    python tools/blender/props/desk_2seat.py   (khi đã `pip install bpy==5.2.*`)
Kết quả:   public/assets/props/prp_desk_2seat.glb  (+ file .blend để mở ra sửa tay)
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import bpy  # noqa: E402
from common import reset_scene, material, box, join, export_glb, stats  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ASSET_ID = 'PRP_DESK_2SEAT'

# Tham số (mét) — sửa ở đây rồi chạy lại là có model mới
W = 1.20          # dài bàn (2 chỗ ngồi)
D = 0.45          # sâu mặt bàn
H = 0.68          # cao mặt bàn (học sinh lớp 6)
TOP = 0.035       # dày mặt bàn
LEG = 0.04        # tiết diện chân sắt
SEAT_H = 0.40     # cao ghế băng
SEAT_D = 0.28
GAP = 0.20        # khoảng cách bàn – ghế

# Màu (PROPOSED): gỗ ấm + khung sắt xanh lá lấy từ PAL.frame của game
COLORS = {'wood': '#c08a55', 'wood_dark': '#9c6b3f', 'frame': '#4f8f5a'}


def build():
    WOOD = material('wood', COLORS['wood'])
    WOOD_DARK = material('wood_dark', COLORS['wood_dark'])
    FRAME = material('frame', COLORS['frame'], roughness=0.6)
    parts = []
    # Mặt bàn + hộc để cặp phía dưới
    parts.append(box('top', (W, D, TOP), (0, 0, H - TOP / 2), WOOD, bevel=0.008))
    parts.append(box('shelf', (W - 0.1, D - 0.08, 0.02), (0, 0.02, H - 0.16), WOOD_DARK))
    parts.append(box('front', (W - 0.1, 0.015, 0.14), (0, -D / 2 + 0.05, H - 0.09), WOOD_DARK))
    # Chân sắt + thanh giằng
    for x in (-W / 2 + 0.06, W / 2 - 0.06):
        for y in (-D / 2 + 0.05, D / 2 - 0.05):
            parts.append(box('leg', (LEG, LEG, H - TOP), (x, y, (H - TOP) / 2), FRAME))
        parts.append(box('rail', (LEG * 0.8, D - 0.1, LEG * 0.8), (x, 0, 0.12), FRAME))
    desk = join(parts, f'{ASSET_ID}_desk')

    # Ghế băng phía sau bàn (+Y = phía học sinh ngồi)
    y0 = D / 2 + GAP + SEAT_D / 2
    seat_parts = [box('seat', (W, SEAT_D, 0.03), (0, y0, SEAT_H - 0.015), WOOD, bevel=0.006)]
    for x in (-W / 2 + 0.06, W / 2 - 0.06):
        for y in (y0 - SEAT_D / 2 + 0.04, y0 + SEAT_D / 2 - 0.04):
            seat_parts.append(box('sleg', (LEG, LEG, SEAT_H - 0.03), (x, y, (SEAT_H - 0.03) / 2), FRAME))
    seat = join(seat_parts, f'{ASSET_ID}_seat')

    # Gộp thành 1 object gốc rỗng để game nạp như một vật
    root = bpy.data.objects.new(ASSET_ID, None)
    bpy.context.scene.collection.objects.link(root)
    for o in (desk, seat):
        o.parent = root
    root['asset_id'] = ASSET_ID
    root['status'] = 'PROPOSED'
    return root, desk, seat


if __name__ == '__main__':
    reset_scene()
    root, desk, seat = build()
    out = os.path.join(ROOT, 'public', 'assets', 'props', 'prp_desk_2seat.glb')
    size = export_glb(out)
    blend = os.path.join(ROOT, 'tools', 'blender', 'props', 'prp_desk_2seat.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    s1, s2 = stats(desk), stats(seat)
    print(f'[{ASSET_ID}] glb={size} bytes  desk={s1}  seat={s2}  tris={s1["tris"] + s2["tris"]}')
