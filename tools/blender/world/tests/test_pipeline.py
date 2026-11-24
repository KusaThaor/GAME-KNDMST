"""Kiểm thử quy trình Blender → GLB của bản đồ (chạy bằng Blender thật, không giả lập).

Chạy (từ thư mục gốc repo), với Blender cài sẵn hoặc Python có gói bpy:
  blender --background --python tools/blender/world/tests/test_pipeline.py
  python tools/blender/world/tests/test_pipeline.py [--write-fixture]

Mọi thứ ghi vào thư mục tạm; KHÔNG đụng file .blend/.glb thật của repo.
--write-fixture: ghi lại tests/unit/fixtures/world/zone_annex.glb (khu thứ 7 dùng cho test phía game).

Kiểm:
  1. Generator sinh đủ .blend + .glb cho mọi khu trong manifest; file vừa sinh được nhận là "chưa ai sửa".
  2. GLB mang đủ nhãn gameplay (extras htx_kind/htx_id), không lẫn camera/đèn xem thử; bộ ID khớp với GLB đang dùng trong game.
  3. SỬA TAY rồi lưu trong Blender → generator KHÔNG ghi đè (kể cả --force); --overwrite-edited thì sao lưu trước.
  4. Xuất lại sau khi sửa phần nhìn (dời vật, đổi màu, thêm vật, xóa vật) → mọi ID gameplay giữ nguyên; thay đổi có trong GLB.
  5. Sai quy ước (marker mất htx_id) → exporter báo lỗi và KHÔNG ghi file.
  6. Object đặt tên theo tiền tố (COLLIDER_…) mà quên gắn nhãn → exporter tự gắn.
  7. new_zone.py tạo được khu thứ 7; xuất được bằng manifest có thêm khu đó; không ghi đè file đã có.
"""
import hashlib
import json
import os
import shutil
import struct
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import bpy  # noqa: E402
import export_world  # noqa: E402
import gen_map_thcs  # noqa: E402
import htx_world as hw  # noqa: E402
import new_zone  # noqa: E402

RESULTS = []


def check(name, cond, detail=''):
    RESULTS.append((name, bool(cond), detail))
    print(f"  {'ĐẠT ' if cond else 'HỎNG'} {name}{(' — ' + str(detail)) if detail and not cond else ''}")


def glb_json(path):
    with open(path, 'rb') as f:
        magic, _version, _length = struct.unpack('<4sII', f.read(12))
        assert magic == b'glTF', path
        chunk_len, chunk_type = struct.unpack('<I4s', f.read(8))
        assert chunk_type == b'JSON'
        return json.loads(f.read(chunk_len).decode('utf-8'))


def tagged(doc):
    """{(kind, id)} của mọi node có nhãn gameplay + số vật cản/sàn."""
    ids, colliders, floors = set(), 0, 0
    for n in doc.get('nodes', []):
        ex = n.get('extras') or {}
        kind = ex.get('htx_kind')
        if kind == 'collider':
            colliders += 1
        elif kind == 'floor':
            floors += 1
        elif kind:
            ids.add((kind, ex.get('htx_id')))
    return ids, colliders, floors


def sha(path):
    with open(path, 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()


def main(argv):
    write_fixture = '--write-fixture' in argv
    tmp = tempfile.mkdtemp(prefix='htx_world_test_')
    print(f'[test] Blender {bpy.app.version_string} · thư mục tạm {tmp}')
    manifest = hw.load_manifest('map_thcs')
    slugs = [z['id'].split('.')[-1] for z in manifest['zones']]

    # ---------------------------------------------------------------- 1. generator
    print('[test] 1. generator')
    rc = gen_map_thcs.main(['--out-dir', tmp])
    check('generator chạy xong (mã 0)', rc == 0, rc)
    for s in slugs:
        check(f'{s}: có .blend và .glb', os.path.exists(f'{tmp}/zone_{s}.blend') and os.path.getsize(f'{tmp}/zone_{s}.glb') > 1000)
    check('file vừa sinh được nhận là "chưa ai sửa"', all(hw.blend_state(f'{tmp}/zone_{s}.blend') == 'generated' for s in slugs))

    # ---------------------------------------------------------------- 2. metadata trong GLB
    print('[test] 2. metadata trong GLB')
    for z in manifest['zones']:
        s = z['id'].split('.')[-1]
        doc = glb_json(f'{tmp}/zone_{s}.glb')
        ids, colliders, floors = tagged(doc)
        check(f'{s}: có khối ranh khu mang đúng ID', ('zone', z['id']) in ids)
        check(f'{s}: có sàn, vật cản, điểm xuất hiện', floors >= 1 and colliders >= 1 and any(k == 'spawn' for k, _ in ids), (floors, colliders))
        check(f'{s}: không xuất camera/đèn xem thử', not doc.get('cameras') and 'KHR_lights_punctual' not in json.dumps(doc.get('extensions', {})))
        check(f'{s}: mọi marker có htx_id', all(i for _, i in ids))
        real = os.path.join(hw.REPO, 'public', *manifest['asset_root'].strip('/').split('/'), z['asset'])
        if os.path.exists(real):
            check(f'{s}: bộ ID khớp GLB đang dùng trong game', tagged(glb_json(real))[0] == ids)
    mats = {m['name'] for z in slugs for m in glb_json(f'{tmp}/zone_{z}.glb').get('materials', [])}
    check('vật liệu trong GLB giữ tên trong bảng màu', mats and mats <= set(hw.load_palette().keys()), sorted(mats - set(hw.load_palette().keys())))
    wall = next(m for m in glb_json(f'{tmp}/zone_yard.glb')['materials'] if m['name'] == 'wall_main')
    want = hw.hex_to_linear(hw.load_palette()['wall_main']['color'])
    got = wall['pbrMetallicRoughness']['baseColorFactor']
    check('màu vật liệu xuất đúng (linear) như bảng màu', all(abs(a - b) < 0.004 for a, b in zip(got, want)), (got, want))

    # ---------------------------------------------------------------- 3. sửa tay → không bị ghi đè
    print('[test] 3. sửa tay trong Blender')
    yard = f'{tmp}/zone_yard.blend'
    before_ids, before_col, before_floor = tagged(glb_json(f'{tmp}/zone_yard.glb'))
    bpy.ops.wm.open_mainfile(filepath=yard)
    scene = bpy.context.scene
    objs = {o.name: o for o in scene.objects}
    objs['BENCH_phuong'].location.x += 3.0                          # dời một vật để nhìn
    bpy.data.materials['wall_main'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.9, 0.2, 0.2, 1.0)   # đổi màu
    bpy.data.objects.remove(objs['PROP_trash_bin_1'], do_unlink=True)    # xóa một vật trang trí
    me = bpy.data.meshes.new('PROP_artist_statue')
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(me)
    bm.free()
    statue = bpy.data.objects.new('PROP_artist_statue', me)
    statue.location = (20.0, -5.0, 0.5)
    bpy.data.collections['PROPS'].objects.link(statue)               # thêm một vật mới
    me2 = bpy.data.meshes.new('COLLIDER_artist_statue')
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(me2)
    bm.free()
    col = bpy.data.objects.new('COLLIDER_artist_statue', me2)        # vật cản đặt tên theo tiền tố, CHƯA gắn nhãn
    col.location = (20.0, -5.0, 0.5)
    bpy.data.collections['COLLISION'].objects.link(col)
    bpy.ops.wm.save_mainfile()                                        # lưu như người dùng bấm Ctrl+S
    if os.path.exists(yard + '1'):
        os.remove(yard + '1')
    edited_hash = sha(yard)
    check('file đã sửa được nhận là "đã sửa tay"', hw.blend_state(yard) == 'edited')
    gen_map_thcs.main(['--out-dir', tmp, '--zones', 'yard'])
    check('generator (mặc định) không ghi đè file đã sửa', sha(yard) == edited_hash)
    gen_map_thcs.main(['--out-dir', tmp, '--zones', 'yard', '--force'])
    check('generator --force cũng không ghi đè file đã sửa', sha(yard) == edited_hash)

    # ---------------------------------------------------------------- 4. xuất lại sau khi sửa phần nhìn
    print('[test] 4. xuất lại sau khi sửa')
    out2 = os.path.join(tmp, 'export')
    rc = export_world.main(['--blend-dir', tmp, '--glb-dir', out2, '--zones', 'yard'])
    check('export_world chạy xong (mã 0)', rc == 0, rc)
    check('export_world không sửa file .blend', sha(yard) == edited_hash)
    doc = glb_json(f'{out2}/zone_yard.glb')
    after_ids, after_col, after_floor = tagged(doc)
    check('mọi ID gameplay giữ nguyên sau khi sửa phần nhìn', after_ids == before_ids, sorted(before_ids ^ after_ids))
    check('sàn giữ nguyên; vật cản = cũ + 1 (vật cản mới tự được gắn nhãn)', after_floor == before_floor and after_col == before_col + 1, (before_col, after_col))
    names = {n.get('name') for n in doc['nodes']}
    check('vật mới có trong GLB, vật đã xóa không còn', 'PROP_artist_statue' in names and 'PROP_trash_bin_1' not in names)
    wall = next(m for m in doc['materials'] if m['name'] == 'wall_main')['pbrMetallicRoughness']['baseColorFactor']
    check('màu mới có trong GLB', abs(wall[0] - 0.9) < 0.01 and abs(wall[1] - 0.2) < 0.01, wall)
    bench = next(n for n in doc['nodes'] if n.get('name') == 'BENCH_phuong')
    old_bench = next(n for n in glb_json(f'{tmp}/zone_yard.glb')['nodes'] if n.get('name') == 'BENCH_phuong')
    check('vật đã dời nằm ở vị trí mới trong GLB', abs(bench['translation'][0] - old_bench['translation'][0] - 3.0) < 1e-3)

    # ---------------------------------------------------------------- 5. sai quy ước → không xuất
    print('[test] 5. sai quy ước')
    bad_dir = os.path.join(tmp, 'bad')
    os.makedirs(bad_dir)
    shutil.copy2(f'{tmp}/zone_gate.blend', f'{bad_dir}/zone_gate.blend')
    bpy.ops.wm.open_mainfile(filepath=f'{bad_dir}/zone_gate.blend')
    spawn = next(o for o in bpy.context.scene.objects if o.get('htx_kind') == 'spawn')
    del spawn['htx_id']
    bpy.ops.wm.save_mainfile()
    rc = export_world.main(['--blend-dir', bad_dir, '--glb-dir', os.path.join(bad_dir, 'out'), '--zones', 'gate'])
    check('marker mất htx_id → exporter báo lỗi (mã 1)', rc == 1, rc)
    check('… và không ghi file GLB', not os.path.exists(os.path.join(bad_dir, 'out', 'zone_gate.glb')))
    rc = export_world.main(['--blend-dir', tmp, '--zones', 'gate,field,base', '--check-only'])
    check('--check-only trên file đúng: mã 0', rc == 0, rc)

    # ---------------------------------------------------------------- 6. --overwrite-edited có sao lưu
    print('[test] 6. ghi đè có chủ ý')
    gen_map_thcs.main(['--out-dir', tmp, '--zones', 'yard', '--overwrite-edited'])
    backups = os.listdir(os.path.join(tmp, 'backups')) if os.path.isdir(os.path.join(tmp, 'backups')) else []
    check('--overwrite-edited sao lưu bản đã sửa trước khi ghi đè', len(backups) == 1 and sha(os.path.join(tmp, 'backups', backups[0])) == edited_hash, backups)
    check('sau khi ghi đè, file trở lại trạng thái "chưa ai sửa"', hw.blend_state(yard) == 'generated')

    # ---------------------------------------------------------------- 7. khu thứ 7
    print('[test] 7. thêm khu thứ 7 (new_zone.py)')
    args = ['--zone', 'zone.thcs.annex', '--rect', '60,-6,72,6', '--exit-to', 'spawn.thcs.field', '--entry-at', '49.5,0', '--out-dir', tmp]
    rc = new_zone.main(args)
    annex = f'{tmp}/zone_annex.blend'
    check('new_zone.py tạo file .blend', rc == 0 and os.path.exists(annex), rc)
    h = sha(annex)
    check('new_zone.py không ghi đè file đã có (mã 1)', new_zone.main(args) == 1 and sha(annex) == h)
    check('file do new_zone tạo không bị generator coi là của nó', hw.blend_state(annex) == 'edited')
    m7 = json.loads(json.dumps(manifest))
    m7['zones'].append({'id': 'zone.thcs.annex', 'asset': 'zone_annex.glb', 'source': 'tools/blender/world/map_thcs/zone_annex.blend', 'connections': ['zone.thcs.field']})
    next(z for z in m7['zones'] if z['id'] == 'zone.thcs.field')['connections'].append('zone.thcs.annex')
    m7_path = os.path.join(tmp, 'map_thcs.world.json')
    with open(m7_path, 'w', encoding='utf-8') as f:
        json.dump(m7, f)
    out7 = os.path.join(tmp, 'export7')
    rc = export_world.main(['--manifest', m7_path, '--blend-dir', tmp, '--glb-dir', out7, '--zones', 'annex'])
    check('xuất khu thứ 7 bằng manifest có thêm khu đó (mã 0)', rc == 0 and os.path.exists(f'{out7}/zone_annex.glb'), rc)
    ids, colliders, floors = tagged(glb_json(f'{out7}/zone_annex.glb'))
    want = {('zone', 'zone.thcs.annex'), ('spawn', 'spawn.thcs.annex'), ('interact', 'itr.thcs.annex_sign'),
            ('portal', 'portal.thcs.annex_exit'), ('portal', 'portal.thcs.annex_entry')}
    check('GLB khu thứ 7 có đủ ranh khu, điểm xuất hiện, điểm tương tác, 2 portal', ids == want and floors == 1 and colliders >= 5, sorted(ids ^ want))
    portal = next(n['extras'] for n in glb_json(f'{out7}/zone_annex.glb')['nodes'] if (n.get('extras') or {}).get('htx_id') == 'portal.thcs.annex_exit')
    check('portal mang đủ thuộc tính (target_spawn, activate, label)', portal.get('htx_target_spawn') == 'spawn.thcs.field' and portal.get('htx_activate') == 'interact' and portal.get('htx_label') == 'Ra ngoài', portal)
    if write_fixture:
        dst = os.path.join(hw.REPO, 'tests', 'unit', 'fixtures', 'world')
        os.makedirs(dst, exist_ok=True)
        shutil.copy2(f'{out7}/zone_annex.glb', os.path.join(dst, 'zone_annex.glb'))
        print(f'[test] đã ghi {os.path.relpath(os.path.join(dst, "zone_annex.glb"), hw.REPO)}')

    failed = [r for r in RESULTS if not r[1]]
    print(f'[test] Blender {bpy.app.version_string}: {len(RESULTS) - len(failed)}/{len(RESULTS)} đạt' + (f' — HỎNG: {[r[0] for r in failed]}' if failed else ''))
    shutil.rmtree(tmp, ignore_errors=True)
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main(hw.script_args()))
