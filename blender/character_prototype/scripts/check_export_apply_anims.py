import struct
import json
import os

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\test_variants\test_export_apply.glb", 'rb') as f:
    magic, ver, length = struct.unpack('<4sII', f.read(12))
    chunk_len, chunk_type = struct.unpack('<II', f.read(8))
    json_data = json.loads(f.read(chunk_len).decode('utf-8'))
    
    anims = json_data.get('animations', [])
    skins = json_data.get('skins', [])
    print(f"Total animations in test_export_apply.glb: {len(anims)}")
    for a in anims:
        print(f"  Action: {a.get('name')}, channels: {len(a.get('channels', []))}")
    print(f"Total skins in test_export_apply.glb: {len(skins)}")
    for s in skins:
        print(f"  Skin: {s.get('name')}, joints: {len(s.get('joints', []))}")
