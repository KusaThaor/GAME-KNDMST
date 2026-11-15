"""Sinh BLOCKOUT 6 khu của bản đồ trường cấp 2 (map_thcs) → file .blend sửa được + file .glb cho game.

BỐ CỤC LÀ BẢN TẠM (blockout): tài liệu thiết kế có danh sách 6 khu (GDD v0.3 §4) nhưng chưa có bản vẽ vị trí.
Xem docs/DECISIONS_AND_OPEN_QUESTIONS.md.

Chạy (từ thư mục gốc repo):
  Blender cài sẵn :  blender --background --python tools/blender/world/gen_map_thcs.py -- [tùy chọn]
  Python + bpy    :  python tools/blender/world/gen_map_thcs.py [tùy chọn]
Tùy chọn:
  --zones yard,gate     chỉ làm các khu này (mặc định: cả 6)
  --force               sinh lại cả những file CHƯA ai sửa tay
  --overwrite-edited    cho phép ghi đè file ĐÃ SỬA TAY (tự sao lưu vào backups/ trước)
  --preview             kết xuất ảnh xem thử (Cycles CPU) vào tools/blender/world/map_thcs/previews/
  --out-dir DIR         ghi .blend/.glb vào thư mục khác (dùng cho test), không đụng file thật

AN TOÀN: file .blend đã sửa tay KHÔNG bị ghi đè nếu không có --overwrite-edited.
Sau khi đã sửa tay, dùng tools/blender/world/export_world.py để xuất lại .glb (script đó không bao giờ sửa file .blend).
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import htx_world as hw  # noqa: E402

MAP_ID = 'map_thcs'
PI = math.pi

# ------------------------------------------------------------------ THAM SỐ BỐ CỤC (mét, tọa độ game: x sang phải, z về phía nam)
L = {
    # khuôn viên trường (trong tường rào)
    'school_x0': -34.0, 'school_x1': 26.0, 'school_z0': -31.0, 'school_z1': 18.0,
    # dãy lớp
    'block_x0': -30.0, 'block_x1': 22.0, 'room_z0': -30.0, 'room_z1': -22.0, 'corr_z1': -19.0,
    'rooms': 5, 'open_room': 2,           # phòng thứ 3 (đếm từ 0) là lớp vào được
    'floor_h': 3.4, 'step': 0.15, 'wall_t': 0.25,
    'door_x0': -1.6, 'door_x1': -0.4,
    # cổng trường (trên tường phía nam)
    'gate_half': 3.6,
    # ngõ quà vặt
    'alley_x0': -34.0, 'alley_x1': 40.0, 'alley_z1': 30.0,
    # bãi đất trống
    'field_x1': 52.0, 'field_z0': -22.0, 'field_in_x0': 31.0, 'field_in_x1': 35.0,
    # căn cứ bí mật
    'base_x0': 38.0, 'base_z0': -36.0, 'base_in_x0': 44.0, 'base_in_x1': 47.0,
    'fence_h': 2.1,
}
ROOM_W = (L['block_x1'] - L['block_x0']) / L['rooms']
OPEN_X0 = L['block_x0'] + ROOM_W * L['open_room']
OPEN_X1 = OPEN_X0 + ROOM_W
Z = {s: f'zone.thcs.{s}' for s in ('classroom', 'corridor', 'yard', 'gate', 'field', 'base')}
INDOOR = f"{Z['classroom']},{Z['corridor']}"   # đứng trong các khu này thì ẩn tầng trên + mái để nhìn thấy nhân vật


# ------------------------------------------------------------------ đồ vật dùng lại

def wall(z, slug, x0, z0, x1, z1, h, mat='wall_main', cap=None, camera=True, collection='ARCHITECTURE', collide=True):
    """Tường thẳng giữa hai điểm (theo trục x hoặc z), kèm vật cản cùng kích thước."""
    t = L['wall_t']
    w, d = (abs(x1 - x0), t) if abs(x1 - x0) >= abs(z1 - z0) else (t, abs(z1 - z0))
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    p = z.part(f'WALL_{slug}').box(mat, 0, 0, w, d, h)
    if cap:
        p.box(cap, 0, 0, w + 0.14, d + 0.14, 0.12, h)
    p.finish(collection, pivot=(cx, cz, 0))
    if collide:
        z.collider(f'wall_{slug}', cx, cz, w, d, h, camera=camera)


def tree(z, slug, x, zz, trunk_h=3.2, crown_r=2.4, mats=('leaf_a', 'leaf_b'), planter=0.0, flat=1.0, collide_r=0.35):
    p = z.part(f'TREE_{slug}')
    if planter:
        p.cyl('planter', 0, 0, planter, 0.45, segs=16).disc('soil', 0, 0, planter - 0.2, 0.46, segs=16)
    p.cyl('trunk', 0, 0, 0.3, trunk_h, r_top=0.2, segs=8)
    top = trunk_h + crown_r * 0.35
    p.blob(mats[0], 0, 0, top, crown_r, sy=0.62 * flat)
    p.blob(mats[1], crown_r * 0.55, 0.3, top - 0.3, crown_r * 0.7, sy=0.6 * flat)
    p.blob(mats[1], -crown_r * 0.5, -0.4, top + 0.1, crown_r * 0.65, sy=0.6 * flat)
    p.blob(mats[0], 0.2, crown_r * 0.5, top - 0.2, crown_r * 0.6, sy=0.6 * flat)
    p.finish('PROPS', pivot=(x, zz, 0))
    z.collider_round(f'tree_{slug}', x, zz, planter if planter else collide_r, 0.5 if planter else 2.4, camera=False)
    if planter:
        z.collider_round(f'tree_{slug}_trunk', x, zz, 0.35, 2.4, camera=False)


def bench(z, slug, x, zz, rot=0.0):
    p = z.part(f'BENCH_{slug}')
    p.box('stone', 0, 0, 1.7, 0.46, 0.1, 0.38).box('stone', 0, -0.2, 1.7, 0.08, 0.36, 0.5)
    p.box('stone', -0.62, 0, 0.14, 0.4, 0.38).box('stone', 0.62, 0, 0.14, 0.4, 0.38)
    p.finish('PROPS', pivot=(x, zz, 0), rot=rot)
    z.collider(f'bench_{slug}', x, zz, 1.7, 0.5, 0.85, rot=rot, camera=False)


def bush_line(z, slug, x0, z0, x1, z1, h=1.8, thick=1.2, camera=False, mats=('leaf_dark', 'leaf_a'), collection='ENVIRONMENT', **props):
    """Hàng bụi rậm làm ranh giới: nhiều khối tròn + một vật cản dài."""
    length = math.hypot(x1 - x0, z1 - z0)
    n = max(2, int(length / 1.5))
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    p = z.part(f'BUSH_{slug}')
    for i in range(n + 1):
        k = i / n
        px, pz = x0 + (x1 - x0) * k - cx, z0 + (z1 - z0) * k - cz
        r = thick * (0.62 + 0.14 * ((i * 7) % 3))
        p.blob(mats[i % 2], px, pz, h * 0.45, r, sy=h / (2.4 * r) * 1.3, subdiv=1)
    p.finish(collection, pivot=(cx, cz, 0), **props)
    along_x = abs(x1 - x0) >= abs(z1 - z0)
    z.collider(f'bush_{slug}', cx, cz, (length + thick) if along_x else thick, thick if along_x else (length + thick), h, camera=camera, **props)


def desk(z, slug, x, zz, y):
    """Bàn học 2 chỗ + ghế băng, học sinh nhìn về +x (phía bảng)."""
    p = z.part(f'DESK_{slug}')
    p.box('wood', 0.12, 0, 0.45, 1.2, 0.035, 0.645).box('wood_dark', 0.12, 0, 0.37, 1.1, 0.02, 0.5)
    for dz in (-0.54, 0.54):
        p.box('metal_green', -0.06, dz, 0.04, 0.04, 0.645).box('metal_green', 0.3, dz, 0.04, 0.04, 0.645)
        p.box('metal_green', -0.5, dz, 0.04, 0.04, 0.38).box('metal_green', -0.3, dz, 0.04, 0.04, 0.38)
    p.box('wood', -0.4, 0, 0.28, 1.2, 0.03, 0.38)
    p.finish('PROPS', pivot=(x, zz, y))
    z.collider(f'desk_{slug}', x - 0.15, zz, 0.95, 1.2, 0.7, y0=y, camera=False)


def ring(p, mat, cx, cz, r, y, width=0.08, segs=20):
    for i in range(segs):
        a = (i + 0.5) / segs * 2 * PI
        p.box(mat, cx + math.cos(a) * r, cz + math.sin(a) * r, 2 * PI * r / segs * 1.02, width, 0.012, y, rot=-a + PI / 2)


# ------------------------------------------------------------------ 6 khu

def build_classroom(z):
    """Z01 Lớp học — bàn ghế đôi, bảng đen, góc báo tường. Chỉ 1 lớp vào được."""
    y = L['step']
    h = L['floor_h']
    x0, x1, z0, z1 = OPEN_X0, OPEN_X1, L['room_z0'], L['room_z1']
    z.ground('FLOORTILE_classroom', 'floor_tile', x0, z0, x1, z1 + 0.12, y, collection='ARCHITECTURE')
    z.floor('classroom', x0, z0, x1, z1 + 0.3, y)
    wall(z, 'class_back', x0, z0, x1, z0, h, 'wall_inner')
    wall(z, 'class_west', x0, z0, x0, z1, h, 'wall_inner')
    wall(z, 'class_east', x1, z0, x1, z1, h, 'wall_inner')
    wall(z, 'class_front_a', x0, z1, L['door_x0'], z1, h, 'wall_main')
    wall(z, 'class_front_b', L['door_x1'], z1, x1, z1, h, 'wall_main')
    dc = (L['door_x0'] + L['door_x1']) / 2
    dw = L['door_x1'] - L['door_x0']
    z.box('WALL_class_lintel', 'ARCHITECTURE', 'wall_main', dc, z1, dw, L['wall_t'], h - 2.2, 2.2)
    # cửa sổ nhìn ra hành lang (chỉ để nhìn)
    for i, wx in enumerate((-7.4, -5.0)):
        z.box(f'WINDOW_class_{i + 1}', 'ARCHITECTURE', 'glass', wx, z1, 1.6, L['wall_t'] + 0.06, 1.2, 1.1)
    # cửa: mở khi khu lớp học được mở trong Ngày; đóng ("lớp đang học") khi không mở
    z.box('DOOR_class_open', 'ARCHITECTURE', 'door_green', L['door_x0'] + 0.03, z1 - dw / 2, 0.06, dw, 2.2, y, open_zone=Z['classroom'], dynamic=True)
    z.box('GATE_class_door_closed', 'ARCHITECTURE', 'door_green', dc, z1, dw, 0.08, 2.2, y, gate_zone=Z['classroom'], dynamic=True)
    z.collider('gate_class_door', dc, z1, dw, L['wall_t'], h, gate_zone=Z['classroom'])
    # bảng đen (tường đông) + góc báo tường (tường sau)
    z.part('BOARD_blackboard').box('wood_dark', 0, 0, 0.05, 4.3, 1.4, 0.85).box('board_green', -0.03, 0, 0.04, 4.0, 1.2, 0.95) \
        .finish('PROPS', pivot=(x1 - 0.16, -26.0, y))
    z.part('BOARD_wall_news').box('wood', 0, 0, 2.2, 0.05, 1.3, 1.0).box('paper', 0, 0.03, 2.0, 0.04, 1.1, 1.1) \
        .finish('PROPS', pivot=(-6.0, z0 + 0.16, y))
    # bàn giáo viên
    z.part('DESK_teacher').box('wood', 0, 0, 0.6, 1.3, 0.05, 0.72).box('wood_dark', 0, 0, 0.5, 1.2, 0.72) \
        .finish('PROPS', pivot=(-0.7, -28.4, y))
    z.collider('desk_teacher', -0.7, -28.4, 0.6, 1.3, 0.78, y0=y, camera=False)
    for r, dx in enumerate((-7.6, -5.9, -4.2, -2.5)):
        for c, dz in enumerate((-28.4, -26.0, -23.6)):
            desk(z, f'r{r + 1}c{c + 1}', dx, dz, y)
    z.zone_volume(x0, z0, x1, z1)
    z.marker('spawn', 'spawn.thcs.classroom', -1.0, -23.0, y, facing=-PI / 2)
    z.marker('interact', 'itr.thcs.blackboard', 0.1, -26.0, y, radius=1.5)
    z.marker('interact', 'itr.thcs.wall_news', -6.0, -29.45, y, radius=1.5)      # lối hẹp giữa hàng bàn cuối và tường sau
    z.marker('spot', 'spot.thcs.class_front', -0.6, -25.0, y, facing=-PI / 2)
    z.lighting(((x0 + x1) / 2, (z0 + z1) / 2), 14)


def build_corridor(z):
    """Z02b Hành lang + mái hiên + rãnh nước — kèm vỏ dãy nhà 2 tầng (các lớp khác "đang học", không vào được)."""
    y = L['step']
    h = L['floor_h']
    bx0, bx1, rz0, rz1, cz1 = L['block_x0'], L['block_x1'], L['room_z0'], L['room_z1'], L['corr_z1']
    # nền hành lang (bậc cao 0,15 m)
    z.box('FLOORSLAB_corridor', 'ARCHITECTURE', 'floor_tile', (bx0 + bx1) / 2, (rz1 + cz1) / 2, bx1 - bx0, cz1 - rz1, y, 0)
    z.floor('corridor', bx0, rz1 - 0.1, bx1, cz1, y)
    # các lớp đóng cửa: khối đặc + cửa + cửa sổ
    for i in range(L['rooms']):
        if i == L['open_room']:
            continue
        rx0 = bx0 + ROOM_W * i
        cx = rx0 + ROOM_W / 2
        p = z.part(f'ROOM_closed_{i + 1}')
        p.box('wall_main', 0, 0, ROOM_W, rz1 - rz0, h)
        p.box('door_green', ROOM_W / 2 - 1.6, (rz1 - rz0) / 2 + 0.03, 1.2, 0.08, 2.2, y)
        for wx in (-3.2, -0.8):
            p.box('glass', wx, (rz1 - rz0) / 2 + 0.03, 1.6, 0.08, 1.2, 1.1 + y)
        p.finish('ARCHITECTURE', pivot=(cx, (rz0 + rz1) / 2, 0))
        z.collider(f'room_closed_{i + 1}', cx, (rz0 + rz1) / 2, ROOM_W, rz1 - rz0, h)
    # hai đầu hành lang
    wall(z, 'corr_west', bx0, rz1, bx0, cz1, h, 'wall_main')
    wall(z, 'corr_east', bx1, rz1, bx1, cz1, h, 'wall_main')
    # hàng cột mái hiên
    n = int(round((bx1 - bx0) / (ROOM_W / 2)))
    cols = z.part('COLUMNS_corridor')
    for i in range(n + 1):
        cx = bx0 + (bx1 - bx0) * i / n
        cols.box('wall_trim', cx, cz1 - 0.17, 0.32, 0.32, h - y, y)
        z.collider_round(f'column_{i + 1:02d}', cx, cz1 - 0.17, 0.22, h, camera=False)
    cols.finish('ARCHITECTURE')
    # rãnh nước dọc mái hiên (thả thuyền giấy) — chỉ để nhìn, đi qua được
    z.ground('GUTTER_corridor', 'ground_concrete_line', bx0, cz1 + 0.12, bx1, cz1 + 0.52, 0.012)
    z.ground('DECOR_gutter_water', 'water', bx0, cz1 + 0.17, bx1, cz1 + 0.47, 0.02, decor='g07', dynamic=True)
    # tầng trên + mái: ẩn khi người chơi đứng trong hành lang/lớp học (để camera thứ ba nhìn thấy nhân vật)
    up = z.part('UPPER_floor2')
    up.box('wall_trim', (bx0 + bx1) / 2, (rz0 + cz1) / 2, bx1 - bx0 + 0.6, cz1 - rz0 + 0.5, 0.2, h)
    up.box('wall_main', (bx0 + bx1) / 2, (rz0 + rz1) / 2, bx1 - bx0, rz1 - rz0, h, h + 0.2)
    up.box('wall_trim', (bx0 + bx1) / 2, cz1 - 0.1, bx1 - bx0, 0.14, 0.95, h + 0.2)
    for i in range(L['rooms']):
        cx = bx0 + ROOM_W * (i + 0.5)
        up.box('door_green', cx + ROOM_W / 2 - 1.6, rz1 + 0.03, 1.2, 0.08, 2.2, h + 0.2)
        for wx in (-3.2, -0.8):
            up.box('glass', cx + wx, rz1 + 0.03, 1.6, 0.08, 1.2, h + 1.3)
    for i in range(n + 1):
        up.box('wall_trim', bx0 + (bx1 - bx0) * i / n, cz1 - 0.17, 0.32, 0.32, h - 0.2, h + 0.2)
    up.finish('ARCHITECTURE', hide_in=INDOOR)
    roof = z.part('ROOF_block')
    roof.box('wall_trim', (bx0 + bx1) / 2, (rz0 + cz1) / 2, bx1 - bx0 + 1.2, cz1 - rz0 + 1.0, 0.2, 2 * h + 0.2)
    roof.box('roof_tile', (bx0 + bx1) / 2, (rz0 + cz1) / 2, bx1 - bx0 + 0.8, cz1 - rz0 + 0.4, 0.5, 2 * h + 0.4)
    roof.box('roof_tile', (bx0 + bx1) / 2, (rz0 + cz1) / 2, bx1 - bx0 + 0.4, (cz1 - rz0) * 0.55, 0.5, 2 * h + 0.9)
    roof.box('roof_tile', (bx0 + bx1) / 2, (rz0 + cz1) / 2, bx1 - bx0, (cz1 - rz0) * 0.2, 0.4, 2 * h + 1.4)
    roof.finish('ARCHITECTURE', hide_in=INDOOR)
    z.zone_volume(bx0, rz1, bx1, cz1 + 0.6)
    z.marker('spawn', 'spawn.thcs.corridor', -6.0, -20.5, y, facing=PI / 2)
    z.marker('interact', 'itr.thcs.gutter', -14.0, cz1 + 0.9, 0, radius=1.5)
    z.marker('spot', 'spot.thcs.corridor_door', -1.0, -20.6, y, facing=0.0)
    z.lighting((-4, -24), 44)


def build_yard(z):
    """Z02 Sân trường — cột cờ, ghế đá, phượng, bàng, vòng đá cầu. Kèm tường rào trường và nền cỏ ngoài bản đồ."""
    sx0, sx1, sz0, sz1 = L['school_x0'], L['school_x1'], L['school_z0'], L['school_z1']
    fh = L['fence_h']
    z.ground('GROUND_outer_grass', 'ground_grass', -160, -160, 160, 160, -0.06)
    z.ground('GROUND_yard_concrete', 'ground_concrete', sx0, sz0, sx1, sz1, 0.0)
    lines = z.part('GROUND_yard_lines')
    for i in range(1, 10):
        lx = sx0 + 6 * i
        lines.quad('ground_concrete_line', lx - 0.03, L['corr_z1'] + 0.6, lx + 0.03, sz1 - 0.2, 0.006)
    for j in range(0, 6):
        lz = -14 + 6 * j
        lines.quad('ground_concrete_line', sx0 + 0.2, lz - 0.03, sx1 - 0.2, lz + 0.03, 0.006)
    lines.finish('ENVIRONMENT')
    z.floor('yard', sx0, L['corr_z1'] - 0.2, sx1, sz1 + 0.3, 0.0)
    # tường rào
    wall(z, 'fence_west', sx0, sz0, sx0, sz1, fh, 'wall_main', cap='wall_trim')
    wall(z, 'fence_east', sx1, sz0, sx1, sz1, fh, 'wall_main', cap='wall_trim')
    wall(z, 'fence_north', sx0, sz0, sx1, sz0, fh, 'wall_main', cap='wall_trim')
    wall(z, 'fence_south_w', sx0, sz1, -L['gate_half'], sz1, fh, 'wall_main', cap='wall_trim')
    wall(z, 'fence_south_e', L['gate_half'], sz1, sx1, sz1, fh, 'wall_main', cap='wall_trim')
    # hai bên đầu dãy lớp: bồn cây chắn lối ra sau nhà
    bush_line(z, 'side_west', sx0 + 0.6, L['corr_z1'] - 0.3, L['block_x0'] - 0.4, L['corr_z1'] - 0.3, h=1.3, thick=0.9, collection='PROPS')
    bush_line(z, 'side_east', L['block_x1'] + 0.4, L['corr_z1'] - 0.3, sx1 - 0.6, L['corr_z1'] - 0.3, h=1.3, thick=0.9, collection='PROPS')
    # cột cờ
    fp = z.part('PROP_flagpole')
    fp.box('stone', 0, 0, 2.2, 2.2, 0.25).box('stone', 0, 0, 1.5, 1.5, 0.2, 0.25)
    fp.cyl('pole', 0, 0, 0.06, 9.0, 0.45, segs=8)
    fp.box('flag_red', 0.86, 0, 1.6, 0.03, 1.05, 8.2).box('flag_yellow', 0.86, 0.02, 0.36, 0.02, 0.36, 8.55)
    fp.finish('PROPS', pivot=(0, -4.0, 0), dynamic=True)
    z.collider('flagpole', 0, -4.0, 2.2, 2.2, 0.6, camera=False)
    # cây
    tree(z, 'phuong', -12.0, -6.0, trunk_h=3.8, crown_r=3.6, mats=('leaf_a', 'leaf_b'), planter=1.3, flat=0.75)
    bloom = z.part('DECOR_phuong_bloom')
    for i, (bx, bz, by) in enumerate(((1.6, 0.6, 5.6), (-1.4, -0.8, 5.9), (0.3, 1.9, 5.3), (-0.4, -2.0, 5.4), (2.4, -1.2, 5.1), (-2.5, 0.9, 5.2))):
        bloom.blob('flower_red', bx, bz, by, 0.75 + 0.1 * (i % 2), sy=0.5, subdiv=1)
    bloom.finish('PROPS', pivot=(-12.0, -6.0, 0), decor='g07', dynamic=True)
    tree(z, 'bang', 12.0, -8.0, trunk_h=3.2, crown_r=3.0, mats=('leaf_dark', 'leaf_a'), planter=1.2, flat=0.6)
    for i, tz in enumerate((-10.0, 0.0, 10.0)):
        tree(z, f'west_{i + 1}', sx0 + 2.2, tz, trunk_h=2.6, crown_r=1.9)
    tree(z, 'east_1', sx1 - 2.4, 12.0, trunk_h=2.8, crown_r=2.0, mats=('leaf_b', 'leaf_a'))
    # ghế đá, thùng rác
    bench(z, 'phuong', -14.6, -3.0, rot=0.15)
    bench(z, 'north', -9.0, -9.4)
    bench(z, 'bang', 14.6, -5.2, rot=-0.3)
    bench(z, 'east', 23.6, 4.0, rot=-PI / 2)
    for i, bx in enumerate((8.4, 9.2)):
        z.part(f'PROP_trash_bin_{i + 1}').cyl('metal_green' if i else 'cart', 0, 0, 0.28, 0.8, r_top=0.32, segs=10).finish('PROPS', pivot=(bx, -17.3, 0))
        z.collider_round(f'trash_bin_{i + 1}', bx, -17.3, 0.34, 0.85, camera=False)
    # vòng đá cầu (vẽ trên nền)
    rg = z.part('PAINT_shuttle_ring')
    ring(rg, 'paint_white', 0, 0, 2.5, 0.008)
    rg.finish('ENVIRONMENT', pivot=(12.0, 7.0, 0))
    # vũng nước sau mưa (biến thể lớp 7)
    pd = z.part('DECOR_puddles')
    for px, pz, pr in ((6.5, -1.0, 1.1), (-20.0, 6.0, 0.8), (16.0, 12.0, 1.3)):
        pd.disc('water', px, pz, pr, 0.014, segs=14)
    pd.finish('ENVIRONMENT', decor='g07', dynamic=True)
    z.zone_volume(sx0, L['corr_z1'] + 0.6, sx1, sz1)
    # ---- marker gameplay
    z.marker('spawn', 'spawn.thcs.yard', 3.0, 11.0, 0, facing=PI)
    z.marker('interact', 'itr.thcs.stone_bench', -14.4, -2.2, 0, radius=1.5)
    z.marker('interact', 'itr.thcs.flagpole', 0.0, -2.2, 0, radius=2.5)
    z.marker('interact', 'itr.thcs.duty_spot', 8.8, -16.2, 0, radius=1.5)
    z.marker('interact', 'itr.thcs.tripod_spot', 4.0, 8.4, 0, radius=1.5)
    z.marker('interact', 'itr.thcs.shuttle_ring', 12.0, 7.0, 0, radius=2.5)
    # chỗ đứng cạnh ghế đá (2 bạn)
    z.marker('spot', 'spot.thcs.yard_bench_1', -12.7, -1.7, 0, facing=0.5)
    z.marker('spot', 'spot.thcs.yard_bench_2', -11.2, -1.4, 0, facing=-0.2)
    z.camera_marker('cam.thcs.yard_bench', (-10.4, 2.2, 4.0), (-12.6, 0.9, -1.8))
    # chỗ chụp ảnh cả nhóm (4 bạn + chỗ đứng của Player ở giữa)
    for i, (gx, gz, gf) in enumerate(((2.1, 2.1, 0.25), (3.0, 1.7, 0.1), (5.0, 1.7, -0.1), (5.9, 2.1, -0.25))):
        z.marker('spot', f'spot.thcs.yard_group_{i + 1}', gx, gz, 0, facing=gf)
    z.marker('spot', 'spot.thcs.yard_group', 4.0, 2.0, 0, facing=0.0, radius=1.1)
    z.camera_marker('cam.thcs.yard_group', (4.0, 1.3, 8.6), (4.0, 0.85, 2.0))
    z.lighting((-4, 0), 62)


def build_gate(z):
    """Z03 Cổng + ngõ quà vặt — cổng sắt, xe bánh tráng trộn, tạp hóa."""
    ax0, ax1, az0, az1 = L['alley_x0'], L['alley_x1'], L['school_z1'], L['alley_z1']
    gh = L['gate_half']
    z.ground('GROUND_alley_asphalt', 'ground_asphalt', ax0, az0 + 0.16, ax1, az1, 0.004)
    z.floor('alley', ax0, az0 - 0.6, ax1, az1, 0.0)
    # trụ cổng + bảng tên (chưa có tên trường: PLACEHOLDER)
    g = z.part('GATE_frame')
    g.box('wall_trim', -gh, 0, 0.8, 0.8, 3.4).box('wall_trim', gh, 0, 0.8, 0.8, 3.4)
    g.box('wall_main', 0, 0, 2 * gh + 0.8, 0.5, 0.7, 3.4).box('door_green', 0, 0.27, 4.6, 0.04, 0.44, 3.53)
    g.finish('ARCHITECTURE', pivot=(0, az0, 0))
    z.collider_round('gate_pillar_w', -gh, az0, 0.45, 3.4, camera=False)
    z.collider_round('gate_pillar_e', gh, az0, 0.45, 3.4, camera=False)
    # cánh cổng: mở (khi khu cổng được mở) hoặc khóa
    op = z.part('GATE_leaves_open')
    op.box('metal_green', -gh + 0.45, -1.5, 0.08, 3.0, 2.2).box('metal_green', gh - 0.45, -1.5, 0.08, 3.0, 2.2)
    op.finish('ARCHITECTURE', pivot=(0, az0, 0), open_zone=Z['gate'], dynamic=True)
    z.collider('gate_leaf_open_w', -gh + 0.45, az0 - 1.5, 0.12, 3.0, 2.2, camera=False, open_zone=Z['gate'])
    z.collider('gate_leaf_open_e', gh - 0.45, az0 - 1.5, 0.12, 3.0, 2.2, camera=False, open_zone=Z['gate'])
    z.box('GATE_leaves_closed', 'ARCHITECTURE', 'metal_green', 0, az0, 2 * gh - 0.8, 0.08, 2.2, 0, gate_zone=Z['gate'], dynamic=True)
    z.collider('gate_closed', 0, az0, 2 * gh - 0.8, 0.3, 2.4, camera=False, gate_zone=Z['gate'])
    # dãy nhà phía nam ngõ
    widths = [10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 11.0]
    mats = ['house_a', 'house_b', 'house_c', 'house_a', 'house_c', 'house_b', 'house_a']
    heights = [4.2, 6.8, 4.0, 7.2, 4.4, 6.6, 4.2]
    hx = ax0
    for i, (w, m, hh) in enumerate(zip(widths, mats, heights)):
        p = z.part(f'HOUSE_{i + 1}')
        p.box(m, 0, 3.0, w - 0.2, 6.0, hh).box('house_roof', 0, 3.0, w, 6.3, 0.3, hh)
        p.box('wood_dark', -w * 0.22, -0.03, 1.1, 0.08, 2.1).box('glass', w * 0.2, -0.03, 1.5, 0.08, 1.1, 1.1)
        if hh > 5:
            p.box('glass', -w * 0.2, -0.03, 1.4, 0.08, 1.1, 4.0).box('glass', w * 0.2, -0.03, 1.4, 0.08, 1.1, 4.0)
        p.finish('ARCHITECTURE', pivot=(hx + w / 2, az1, 0))
        hx += w
    z.collider('houses_south', (ax0 + ax1) / 2, az1 + 3.0, ax1 - ax0, 6.0, 7.2)
    # tiệm tạp hóa (nhà thứ 3): mái hiên + quầy
    sx = ax0 + 21 + 5.25
    shop = z.part('SHOP_grocery')
    shop.box('awning', 0, -0.9, 6.0, 1.8, 0.1, 2.6).box('wood', 0, -0.6, 4.0, 0.7, 0.9)
    shop.box('wood_dark', -1.2, -0.6, 0.5, 0.4, 0.3, 0.9).box('cart', 0.4, -0.6, 0.4, 0.4, 0.35, 0.9).box('paper', 1.3, -0.6, 0.5, 0.35, 0.25, 0.9)
    shop.finish('PROPS', pivot=(sx, az1, 0))
    z.collider('shop_counter', sx, az1 - 0.6, 4.0, 0.7, 1.0, camera=False)
    # chặn hai đầu ngõ
    wall(z, 'alley_end_west', ax0, az0, ax0, az1, 3.0, 'house_b')
    wall(z, 'alley_end_east', ax1, az0, ax1, az1, 3.0, 'house_c')
    # xe bánh tráng trộn + ghế nhựa
    cart = z.part('PROP_snack_cart')
    cart.box('cart', 0, 0, 1.5, 0.8, 0.6, 0.35).box('metal_grey', 0, 0, 1.56, 0.86, 0.04, 0.95)
    for cx in (-0.7, 0.7):
        for cz in (-0.36, 0.36):
            cart.box('metal_grey', cx, cz, 0.04, 0.04, 1.1, 0.95)
    cart.box('cart_top', 0, 0, 1.8, 1.1, 0.08, 2.05)
    cart.cyl('metal_grey', -0.5, 0.42, 0.22, 0.06, 0.13, segs=10).cyl('metal_grey', 0.5, 0.42, 0.22, 0.06, 0.13, segs=10)
    cart.finish('PROPS', pivot=(7.0, az0 + 2.6, 0), rot=0.08)
    z.collider('snack_cart', 7.0, az0 + 2.6, 1.7, 1.0, 1.1, rot=0.08, camera=False)
    for i, (px, pz) in enumerate(((5.4, az0 + 3.9), (6.3, az0 + 4.3), (8.2, az0 + 4.1))):
        z.part(f'PROP_stool_{i + 1}').cyl('cart_top' if i % 2 else 'awning', 0, 0, 0.17, 0.3, r_top=0.14, segs=8).finish('PROPS', pivot=(px, pz, 0))
    z.part('PROP_power_pole').cyl('wood_old', 0, 0, 0.14, 7.5, segs=8).box('wood_old', 0, 0, 1.6, 0.1, 0.1, 6.6).finish('PROPS', pivot=(-20.0, az0 + 1.0, 0))
    z.collider_round('power_pole', -20.0, az0 + 1.0, 0.2, 3.0, camera=False)
    z.zone_volume(ax0, az0, ax1, az1)
    z.marker('spawn', 'spawn.thcs.gate', 0.0, az0 + 4.5, 0, facing=PI)
    z.marker('interact', 'itr.thcs.snack_cart', 7.0, az0 + 4.0, 0, radius=1.5)
    z.marker('interact', 'itr.thcs.grocery', sx, az1 - 1.6, 0, radius=1.5)
    z.marker('spot', 'spot.thcs.gate_front', -1.5, az0 + 2.2, 0, facing=0.0)
    z.lighting((3, 24), 60)


def build_field(z):
    """Z04 Bãi đất trống — đất, cỏ, vũng nước, chỗ chơi bi."""
    fx0, fx1, fz0, fz1 = L['school_x1'] + 0.15, L['field_x1'], L['field_z0'], L['school_z1']
    z.ground('GROUND_field_dirt', 'ground_dirt', fx0, fz0, fx1, fz1 + 0.16, 0.002)
    z.floor('field', fx0 + 0.05, fz0 - 0.4, fx1, fz1 + 0.6, 0.0)
    patches = z.part('GROUND_field_patches')
    for px, pz, pr, m in ((31, -12, 3.4, 'ground_grass_dark'), (47, 8, 4.0, 'ground_grass_dark'), (40, -17, 2.6, 'ground_grass'),
                          (33, 6, 2.2, 'ground_dirt_dark'), (45, -2, 3.0, 'ground_dirt_dark'), (29, 13, 1.8, 'ground_grass')):
        patches.disc(m, px, pz, pr, 0.008, segs=12)
    patches.disc('water', 44.0, -6.0, 1.5, 0.014, segs=14)
    patches.finish('ENVIRONMENT')
    marble = z.part('PAINT_marble_ring')
    ring(marble, 'ground_dirt_dark', 0, 0, 1.0, 0.012, width=0.07, segs=14)
    marble.disc('ground_dirt_dark', 0, 0, 0.12, 0.014, segs=8)
    marble.finish('ENVIRONMENT', pivot=(38.0, 4.0, 0))
    # ranh giới: bụi rậm (đông, bắc, nam); phía tây là tường rào trường
    bush_line(z, 'east', fx1, fz0, fx1, fz1)
    bush_line(z, 'north_w', fx0 + 0.6, fz0, L['base_in_x0'], fz0)
    bush_line(z, 'north_e', L['base_in_x1'], fz0, fx1, fz0)
    bush_line(z, 'south_w', fx0 + 0.6, fz1, L['field_in_x0'], fz1)
    bush_line(z, 'south_e', L['field_in_x1'], fz1, fx1, fz1)
    # dây chắn lối vào khi bãi đất chưa mở
    rope = z.part('GATE_field_rope')
    rope.cyl('wood_old', -2.0, 0, 0.07, 1.1, segs=6).cyl('wood_old', 2.0, 0, 0.07, 1.1, segs=6).box('rope', 0, 0, 4.0, 0.04, 0.04, 0.85)
    rope.finish('PROPS', pivot=((L['field_in_x0'] + L['field_in_x1']) / 2, fz1, 0), gate_zone=Z['field'], dynamic=True)
    z.collider('gate_field', (L['field_in_x0'] + L['field_in_x1']) / 2, fz1, L['field_in_x1'] - L['field_in_x0'], 0.5, 1.2, camera=False, gate_zone=Z['field'])
    # đồ vật
    z.part('PROP_log').box('wood_old', 0, 0, 2.6, 0.5, 0.45).finish('PROPS', pivot=(46.0, 11.0, 0), rot=0.5)
    z.collider('log', 46.0, 11.0, 2.6, 0.5, 0.5, rot=0.5, camera=False)
    tires = z.part('PROP_tires')
    tires.cyl('ground_asphalt', 0, 0, 0.42, 0.22, segs=10).cyl('ground_asphalt', 0.1, 0.05, 0.42, 0.22, 0.22, segs=10)
    tires.finish('PROPS', pivot=(30.0, -15.0, 0))
    z.collider_round('tires', 30.0, -15.0, 0.48, 0.5, camera=False)
    tree(z, 'field_lone', 48.0, -14.0, trunk_h=3.0, crown_r=2.6, mats=('leaf_b', 'leaf_a'))
    tufts = z.part('GRASS_tufts')
    for i in range(18):
        tx = fx0 + 2 + ((i * 37) % 23)
        tz = fz0 + 3 + ((i * 53) % 35)
        tufts.blob('leaf_b' if i % 2 else 'leaf_a', tx, tz, 0.16, 0.34, sy=0.9, subdiv=1)
    tufts.finish('ENVIRONMENT')
    z.zone_volume(fx0, fz0, fx1, fz1)
    z.marker('spawn', 'spawn.thcs.field', 33.0, 15.0, 0, facing=PI)
    z.marker('interact', 'itr.thcs.marble_spot', 38.0, 4.0, 0, radius=1.5)
    z.marker('spot', 'spot.thcs.field_log', 45.0, 9.6, 0, facing=0.8)
    z.lighting((39, -2), 50)


def build_base(z):
    """Z05 Căn cứ bí mật — chòi nhỏ, bàn gỗ cũ, kệ đồ nhặt."""
    bx0, bx1, bz0, bz1 = L['base_x0'], L['field_x1'], L['base_z0'], L['field_z0']
    z.ground('GROUND_base_grass', 'ground_grass_dark', bx0, bz0, bx1, bz1, 0.003)
    z.floor('base', bx0, bz0, bx1, bz1 + 0.6, 0.0)
    z.part('GROUND_base_dirt').disc('ground_dirt', 0, 0, 3.2, 0.009, segs=14).finish('ENVIRONMENT', pivot=(46.0, -29.5, 0))
    bush_line(z, 'west', bx0, bz0, bx0, bz1, h=2.2, thick=1.4)
    bush_line(z, 'north', bx0, bz0, bx1, bz0, h=2.2, thick=1.4)
    bush_line(z, 'east', bx1, bz0, bx1, bz1, h=2.2, thick=1.4)
    # bụi rậm bít lối vào khi căn cứ chưa mở
    gx = (L['base_in_x0'] + L['base_in_x1']) / 2
    bush_line(z, 'gate_base', L['base_in_x0'], bz1, L['base_in_x1'], bz1, h=1.9, thick=1.3, collection='PROPS', gate_zone=Z['base'], dynamic=True)
    # chòi nhỏ (mở mặt nam)
    hx, hz = 47.6, -31.6
    hut = z.part('HUT_base')
    for px, pz in ((-1.6, -1.4), (1.6, -1.4), (-1.6, 1.4), (1.6, 1.4)):
        hut.cyl('wood_old', px, pz, 0.08, 2.5, segs=6)
    hut.box('wood_old', 0, -1.4, 3.2, 0.08, 1.5, 0.2).box('wood_old', -1.6, 0, 0.08, 2.8, 1.2, 0.2).box('wood_old', 1.6, 0, 0.08, 2.8, 1.2, 0.2)
    hut.box('tin', 0, 0, 3.8, 3.4, 0.07, 2.5).box('tarp', 0, 1.2, 3.6, 1.0, 0.04, 2.58)
    hut.finish('PROPS', pivot=(hx, hz, 0))
    z.collider('hut_back', hx, hz - 1.4, 3.3, 0.2, 1.8, camera=False)
    z.collider('hut_west', hx - 1.6, hz, 0.2, 2.9, 1.5, camera=False)
    z.collider('hut_east', hx + 1.6, hz, 0.2, 2.9, 1.5, camera=False)
    shelf = z.part('PROP_base_shelf')
    shelf.box('wood_old', 0, 0, 2.2, 0.35, 0.05, 0.5).box('wood_old', 0, 0, 2.2, 0.35, 0.05, 1.0)
    shelf.box('wood_old', -1.05, 0, 0.06, 0.35, 1.05).box('wood_old', 1.05, 0, 0.06, 0.35, 1.05)
    shelf.cyl('tin', -0.6, 0, 0.08, 0.18, 0.55, segs=8).box('paper', 0.1, 0, 0.3, 0.2, 0.06, 0.55).cyl('cart', 0.7, 0, 0.1, 0.12, 1.05, segs=8)
    shelf.finish('PROPS', pivot=(hx, hz - 1.1, 0))
    table = z.part('PROP_old_table')
    table.box('wood_old', 0, 0, 1.5, 0.9, 0.06, 0.62)
    for px in (-0.65, 0.65):
        for pz in (-0.35, 0.35):
            table.box('wood_old', px, pz, 0.07, 0.07, 0.62)
    table.box('wood_old', 0, 0.85, 1.3, 0.3, 0.05, 0.36).box('wood_old', -0.55, 0.85, 0.07, 0.26, 0.36).box('wood_old', 0.55, 0.85, 0.07, 0.26, 0.36)
    table.finish('PROPS', pivot=(43.0, -29.0, 0), rot=-0.2)
    z.collider('old_table', 43.0, -28.75, 1.6, 1.6, 0.7, rot=-0.2, camera=False)
    tree(z, 'base_big', 40.6, -33.6, trunk_h=3.6, crown_r=3.2, mats=('leaf_dark', 'leaf_a'), collide_r=0.45)
    z.zone_volume(bx0, bz0, bx1, bz1)
    z.marker('spawn', 'spawn.thcs.base', gx, -24.4, 0, facing=PI)
    z.marker('interact', 'itr.thcs.old_table', 43.4, -27.2, 0, radius=1.5)
    z.marker('interact', 'itr.thcs.base_shelf', hx, hz + 0.4, 0, radius=1.5)
    z.marker('spot', 'spot.thcs.base_table', 44.4, -28.6, 0, facing=-2.0)
    z.lighting((45, -29), 24)


BUILDERS = {'classroom': build_classroom, 'corridor': build_corridor, 'yard': build_yard,
            'gate': build_gate, 'field': build_field, 'base': build_base}


# ------------------------------------------------------------------ chạy

def main(argv):
    opts = {'zones': None, 'force': False, 'overwrite': False, 'preview': False, 'out': None, 'palette': 'blockout_default'}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == '--zones':
            i += 1
            opts['zones'] = [s.strip() for s in argv[i].split(',') if s.strip()]
        elif a == '--force':
            opts['force'] = True
        elif a == '--overwrite-edited':
            opts['overwrite'] = True
        elif a == '--preview':
            opts['preview'] = True
        elif a == '--out-dir':
            i += 1
            opts['out'] = os.path.abspath(argv[i])
        elif a == '--palette':
            i += 1
            opts['palette'] = argv[i]
        else:
            print(f'Không hiểu tùy chọn: {a}')
            return 2
        i += 1

    manifest = hw.load_manifest(MAP_ID)
    palette = hw.load_palette(opts['palette'])
    print(f'[gen] Blender {bpy.app.version_string} · bản đồ {MAP_ID} · bảng màu {opts["palette"]}')
    skipped_edited = []
    for zone in manifest['zones']:
        slug = zone['id'].split('.')[-1]
        if opts['zones'] and slug not in opts['zones']:
            continue
        if slug not in BUILDERS:
            print(f'[gen] {slug}: generator không có khu này — bỏ qua (khu do người dựng tay)')
            continue
        blend, glb = hw.zone_paths(manifest, zone)
        if opts['out']:
            blend = os.path.join(opts['out'], os.path.basename(blend))
            glb = os.path.join(opts['out'], os.path.basename(glb))
        state = hw.blend_state(blend)
        if state == 'edited' and not opts['overwrite']:
            print(f'[gen] {slug}: file .blend ĐÃ SỬA TAY → KHÔNG ghi đè. (Muốn ghi đè: thêm --overwrite-edited; muốn xuất lại .glb: dùng export_world.py)')
            skipped_edited.append(slug)
            continue
        if state == 'generated' and not opts['force']:
            print(f'[gen] {slug}: đã có, chưa ai sửa → giữ nguyên (thêm --force để sinh lại)')
            continue
        if state != 'missing':
            print(f'[gen] {slug}: sao lưu bản cũ → {os.path.relpath(hw.backup(blend), hw.REPO)}')
        z = hw.Zone(zone['id'], slug, palette)
        BUILDERS[slug](z)
        hw.save_blend(blend, mark_generated=True)
        res = hw.export_current(glb, zone['id'], log=lambda m: print(f'[gen] {slug}:{m}'))
        c = res['counts']
        print(f'[gen] {slug}: OK  .blend + .glb ({res["bytes"]} byte) · để nhìn {c.get("visual", 0)} · vật cản {c.get("collider", 0)} · sàn {c.get("floor", 0)} · '
              f'marker {sum(v for k, v in c.items() if k not in ("visual", "collider", "floor"))}')
        if opts['preview']:
            out = os.path.join(os.path.dirname(blend), 'previews', f'zone_{slug}.png')
            hw.render_preview(out)
            print(f'[gen] {slug}: ảnh xem thử → {os.path.relpath(out, hw.REPO)}')
    if skipped_edited:
        print(f'[gen] Bỏ qua {len(skipped_edited)} khu đã sửa tay: {", ".join(skipped_edited)}')
    return 0


if __name__ == '__main__':
    sys.exit(main(hw.script_args()))
