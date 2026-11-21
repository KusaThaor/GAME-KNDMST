import json
import struct

glb_path = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\vietnamese_student_fixed.glb"

with open(glb_path, "rb") as f:
    magic = f.read(4)
    version, length = struct.unpack("<II", f.read(8))
    chunk_len, chunk_type = struct.unpack("<II", f.read(8))
    json_bytes = f.read(chunk_len)
    gltf = json.loads(json_bytes.decode('utf-8'))

print("=== GLB MESHES ===")
for m in gltf.get("meshes", []):
    name = m.get("name")
    if "Eye" in name or "Head" in name:
        prims = m.get("primitives", [])
        print(f"Mesh: {name}, primitives: {len(prims)}")
        for p in prims:
            pos_acc = gltf["accessors"][p["attributes"]["POSITION"]]
            print(f"  Pos accessor: count={pos_acc['count']}, min={pos_acc.get('min')}, max={pos_acc.get('max')}")
