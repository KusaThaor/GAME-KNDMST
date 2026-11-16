import struct
import json

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\assets\characters\vietnamese_student_fixed.glb", "rb") as f:
    f.read(12)
    chunk_len, _ = struct.unpack('<II', f.read(8))
    data = json.loads(f.read(chunk_len).decode('utf-8'))
    
    print(f"Total nodes: {len(data['nodes'])}")
    for i, n in enumerate(data['nodes']):
        print(f"  Node {i}: name='{n.get('name')}', mesh={n.get('mesh')}, children={n.get('children')}")
        
    print(f"\nTotal meshes: {len(data['meshes'])}")
    for i, m in enumerate(data['meshes']):
        print(f"  Mesh {i}: name='{m.get('name')}'")
