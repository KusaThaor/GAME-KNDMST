"""Tạo file .blend KHỞI ĐẦU cho một khu mới (đúng cấu trúc collection + nhãn htx_*), để mở ra dựng tiếp trong Blender.

Xem docs/HOW_TO_EXPAND_WORLD.md. Chạy (từ thư mục gốc repo):
  Blender cài sẵn :  blender --background --python tools/blender/world/new_zone.py -- [tùy chọn]
  Python + bpy    :  python tools/blender/world/new_zone.py [tùy chọn]
Tùy chọn:
  --map map_thcs               bản đồ (mặc định map_thcs)
  --zone zone.thcs.annex       ID khu mới (bắt buộc; mẫu zone.<map>.<slug>)
  --rect x0,z0,x1,z1           phạm vi khu trên mặt bằng, tọa độ game (bắt buộc)
  --exit-to spawn.thcs.field   thêm một portal "bấm để đi" ở mép khu, đưa về điểm xuất hiện này
  --entry-at x,z               thêm một portal "bước vào là đi" đặt ở (x, z) của bản đồ, đưa tới khu mới
  --out-dir DIR                ghi vào thư mục khác (mặc định tools/blender/world/<map>/)
  --palette blockout_default   bảng màu

Script này KHÔNG ghi đè file đã có và KHÔNG sửa manifest: nó in ra đoạn JSON để bạn dán vào src/world/maps/<map>.world.json.
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import htx_world as hw  # noqa: E402


def build(z, rect, exit_to=None, entry_at=None):
    """Dựng khu khởi đầu vào scene của `z` (hw.Zone). Trả về danh sách ID marker đã tạo."""
    x0, z0, x1, z1 = rect
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    map_slug = z.zone_id.split('.')[1]
    pre = f'{map_slug}.{z.slug}'
    z.ground(f'GROUND_{z.slug}', 'ground_concrete', x0, z0, x1, z1, 0.004)
    z.floor(z.slug, x0, z0, x1, z1, 0.0)
    z.zone_volume(x0, z0, x1, z1)
    # ranh giới nhìn thấy được: bờ thấp quanh khu, chừa một khoảng ở mép nam làm lối ra
    t, h, gap = 0.3, 0.6, 3.0
    edges = [('north', x0, z0, x1, z0), ('west', x0, z0, x0, z1), ('east', x1, z0, x1, z1),
             ('south_w', x0, z1, cx - gap / 2, z1), ('south_e', cx + gap / 2, z1, x1, z1)]
    for slug, ax, az, bx, bz in edges:
        w, d = (abs(bx - ax) + t, t) if abs(bx - ax) >= abs(bz - az) else (t, abs(bz - az) + t)
        z.box(f'CURB_{z.slug}_{slug}', 'ARCHITECTURE', 'stone', (ax + bx) / 2, (az + bz) / 2, w, d, h)
        z.collider(f'{z.slug}_curb_{slug}', (ax + bx) / 2, (az + bz) / 2, w, d, h, camera=False)
    # một vật mẫu + điểm tương tác mẫu
    z.part(f'PROP_{z.slug}_sign').cyl('wood', 0, 0, 0.06, 1.3, segs=8).box('paper', 0, 0, 0.9, 0.05, 0.5, 1.0).finish('PROPS', pivot=(cx, z0 + 1.2, 0))
    z.collider_round(f'{z.slug}_sign', cx, z0 + 1.2, 0.2, 1.4, camera=False)
    ids = [f'spawn.{pre}', f'itr.{pre}_sign']
    z.marker('spawn', ids[0], cx, z1 - 2.0, 0, facing=math.pi)
    z.marker('interact', ids[1], cx, z0 + 2.4, 0, radius=1.5)
    if exit_to:
        pid = f'portal.{pre}_exit'
        z.portal(pid, cx, z1 - 0.2, gap, 1.2, exit_to, activate='interact', label='Ra ngoài')
        ids.append(pid)
    if entry_at:
        pid = f'portal.{pre}_entry'
        z.portal(pid, entry_at[0], entry_at[1], 2.0, 2.0, ids[0], activate='enter')
        ids.append(pid)
    z.lighting((cx, cz), max(x1 - x0, z1 - z0) * 2.2)
    return ids


def main(argv):
    opts = {'map': 'map_thcs', 'zone': None, 'rect': None, 'exit_to': None, 'entry_at': None, 'out': None, 'palette': 'blockout_default'}
    keys = {'--map': 'map', '--zone': 'zone', '--rect': 'rect', '--exit-to': 'exit_to', '--entry-at': 'entry_at', '--out-dir': 'out', '--palette': 'palette'}
    i = 0
    while i < len(argv):
        if argv[i] not in keys or i + 1 >= len(argv):
            print(f'Không hiểu tùy chọn: {argv[i]}')
            return 2
        opts[keys[argv[i]]] = argv[i + 1]
        i += 2
    zone_id = opts['zone']
    parts = (zone_id or '').split('.')
    if len(parts) != 3 or parts[0] != 'zone' or parts[1] != opts['map'].replace('map_', '', 1):
        print(f'--zone phải có dạng zone.{opts["map"].replace("map_", "", 1)}.<slug> (nhận được: {zone_id})')
        return 2
    try:
        rect = [float(v) for v in opts['rect'].split(',')]
        assert len(rect) == 4 and rect[0] < rect[2] and rect[1] < rect[3]
        entry = [float(v) for v in opts['entry_at'].split(',')] if opts['entry_at'] else None
        assert entry is None or len(entry) == 2
    except Exception:
        print('--rect cần 4 số x0,z0,x1,z1 (x0 < x1, z0 < z1); --entry-at cần 2 số x,z')
        return 2
    slug = parts[2]
    out_dir = os.path.abspath(opts['out']) if opts['out'] else os.path.join(hw.HERE, opts['map'])
    blend = os.path.join(out_dir, f'zone_{slug}.blend')
    if os.path.exists(blend):
        print(f'[new_zone] ĐÃ CÓ {blend} — không ghi đè. Xóa/đổi tên file cũ nếu thật sự muốn tạo lại.')
        return 1
    z = hw.Zone(zone_id, slug, hw.load_palette(opts['palette']))
    ids = build(z, rect, opts['exit_to'], entry)
    errors, warnings, _ = hw.check_scene(z.scene, zone_id)
    if errors:
        for e in errors:
            print(f'[new_zone] LỖI: {e}')
        return 1
    hw.save_blend(blend)        # không đánh dấu "generated": đây là file của người dựng, generator không bao giờ ghi đè
    rel = os.path.relpath(blend, hw.REPO).replace(os.sep, '/')
    print(f'[new_zone] Blender {bpy.app.version_string} · đã tạo {rel}')
    print(f'[new_zone] marker: {", ".join(ids)}')
    print('[new_zone] Dán vào "zones" của src/world/maps/%s.world.json (và thêm ID khu này vào "connections" của khu nối với nó):' % opts['map'])
    print(json.dumps({'id': zone_id, 'asset': f'zone_{slug}.glb', 'source': rel, 'connections': ['<ID khu nối với khu này>']}, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main(hw.script_args()))
