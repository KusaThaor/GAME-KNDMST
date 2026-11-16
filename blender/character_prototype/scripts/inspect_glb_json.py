import struct
import json
import os

def inspect_glb(path):
    print(f"=== INSPECTING GLB JSON: {os.path.basename(path)} ===")
    if not os.path.exists(path):
        print("File does not exist!")
        return
    with open(path, 'rb') as f:
        magic, ver, length = struct.unpack('<4sII', f.read(12))
        chunk_len, chunk_type = struct.unpack('<II', f.read(8))
        json_data = json.loads(f.read(chunk_len).decode('utf-8'))
        nodes = json_data.get('nodes', [])
        meshes = json_data.get('meshes', [])
        print(f"Total nodes: {len(nodes)}, Total meshes: {len(meshes)}")
        for i, m in enumerate(meshes):
            name = m.get('name', f'mesh_{i}')
            prims = len(m.get('primitives', []))
            print(f"  Mesh {i}: '{name}' (prims: {prims})")
        for i, n in enumerate(nodes):
            if 'mesh' in n:
                print(f"  Node {i}: '{n.get('name', '')}' -> Mesh {n['mesh']} ('{meshes[n['mesh']].get('name', '')}')")

inspect_glb(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\assets\characters\vietnamese_student.glb")
inspect_glb(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\test_variants\test_export_apply.glb")
