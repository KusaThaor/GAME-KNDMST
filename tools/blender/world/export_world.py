"""Xuất lại file .glb cho game từ các file .blend ĐANG CÓ (kể cả file đã sửa tay). KHÔNG bao giờ sửa/lưu file .blend.

Dùng sau mỗi lần bạn chỉnh bản đồ trong Blender. Chạy (từ thư mục gốc repo):
  Blender cài sẵn :  blender --background --python tools/blender/world/export_world.py -- [tùy chọn]
  Python + bpy    :  python tools/blender/world/export_world.py [tùy chọn]
Tùy chọn:
  --map map_thcs        bản đồ (mặc định map_thcs) — đọc danh sách khu từ src/world/maps/<map>.world.json
  --zones yard,gate     chỉ xuất các khu này (theo phần cuối của ID khu)
  --check-only          chỉ kiểm tra quy ước, không ghi .glb
  --preview             kết xuất ảnh xem thử (Cycles CPU) cạnh file .blend, thư mục previews/
  --blend-dir DIR       đọc .blend từ thư mục khác (dùng cho test)
  --glb-dir DIR         ghi .glb vào thư mục khác (dùng cho test)
  --manifest FILE       dùng file manifest khác thay cho src/world/maps/<map>.world.json (dùng cho test)

Sau khi xuất: chạy `npm run world:index` rồi `npm run validate:world` để game nhận bản đồ mới.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import htx_world as hw  # noqa: E402


def main(argv):
    opts = {'map': 'map_thcs', 'zones': None, 'check': False, 'preview': False, 'blend_dir': None, 'glb_dir': None, 'manifest': None}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ('--map', '--zones', '--blend-dir', '--glb-dir', '--manifest'):
            i += 1
            v = argv[i]
            if a == '--map':
                opts['map'] = v
            elif a == '--zones':
                opts['zones'] = [s.strip() for s in v.split(',') if s.strip()]
            elif a == '--blend-dir':
                opts['blend_dir'] = os.path.abspath(v)
            elif a == '--manifest':
                opts['manifest'] = os.path.abspath(v)
            else:
                opts['glb_dir'] = os.path.abspath(v)
        elif a == '--check-only':
            opts['check'] = True
        elif a == '--preview':
            opts['preview'] = True
        else:
            print(f'Không hiểu tùy chọn: {a}')
            return 2
        i += 1

    manifest = hw.load_manifest(opts['map'], opts['manifest'])
    print(f'[export] Blender {bpy.app.version_string} · bản đồ {opts["map"]}')
    failed = 0
    for zone in manifest['zones']:
        slug = zone['id'].split('.')[-1]
        if opts['zones'] and slug not in opts['zones']:
            continue
        blend, glb = hw.zone_paths(manifest, zone)
        if opts['blend_dir']:
            blend = os.path.join(opts['blend_dir'], os.path.basename(blend))
        if opts['glb_dir']:
            glb = os.path.join(opts['glb_dir'], os.path.basename(glb))
        if not os.path.exists(blend):
            print(f'[export] {slug}: LỖI không thấy file nguồn {os.path.relpath(blend, hw.REPO)}')
            failed += 1
            continue
        bpy.ops.wm.open_mainfile(filepath=blend)
        log = lambda m, s=slug: print(f'[export] {s}:{m}')  # noqa: E731
        try:
            if opts['check']:
                scene = bpy.context.scene
                hw.normalize_tags(scene)
                errors, warnings, counts = hw.check_scene(scene, zone['id'])
                for w in warnings:
                    log(f'  nhắc: {w}')
                for e in errors:
                    log(f'  LỖI: {e}')
                if errors:
                    failed += 1
                    continue
                res = {'counts': counts, 'bytes': 0, 'auto_tagged': []}
            else:
                res = hw.export_current(glb, zone['id'], log=log)
        except RuntimeError as e:
            print(f'[export] {slug}: {e}')
            failed += 1
            continue
        c = res['counts']
        markers = sum(v for k, v in c.items() if k not in ('visual', 'collider', 'floor'))
        what = 'kiểm tra đạt' if opts['check'] else f'OK → {os.path.relpath(glb, hw.REPO)} ({res["bytes"]} byte)'
        print(f'[export] {slug}: {what} · để nhìn {c.get("visual", 0)} · vật cản {c.get("collider", 0)} · sàn {c.get("floor", 0)} · marker {markers}'
              + (f' · tự gắn nhãn {len(res["auto_tagged"])} object' if res['auto_tagged'] else ''))
        if opts['preview']:
            out = os.path.join(os.path.dirname(blend), 'previews', f'zone_{slug}.png')
            hw.render_preview(out)
            print(f'[export] {slug}: ảnh xem thử → {os.path.relpath(out, hw.REPO)}')
    if failed:
        print(f'[export] {failed} khu có lỗi.')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(hw.script_args()))
