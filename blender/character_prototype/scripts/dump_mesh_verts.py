import struct
import json
import os

def dump_mesh_verts(glb_path, mesh_idx, label):
    with open(glb_path, 'rb') as f:
        magic, ver, length = struct.unpack('<4sII', f.read(12))
        chunk_len, chunk_type = struct.unpack('<II', f.read(8))
        json_data = json.loads(f.read(chunk_len).decode('utf-8'))
        bin_len, bin_type = struct.unpack('<II', f.read(8))
        bin_data = f.read(bin_len)
        
        mesh = json_data['meshes'][mesh_idx]
        prim = mesh['primitives'][0]
        pos_acc_idx = prim['attributes']['POSITION']
        pos_acc = json_data['accessors'][pos_acc_idx]
        bv_idx = pos_acc['bufferView']
        bv = json_data['bufferViews'][bv_idx]
        
        offset = bv.get('byteOffset', 0) + pos_acc.get('byteOffset', 0)
        count = pos_acc['count']
        
        print(f"\n--- {label}: {mesh.get('name', 'unnamed')} ({count} vertices) ---")
        min_v = pos_acc.get('min')
        max_v = pos_acc.get('max')
        print(f"  Accessor Min: {min_v}")
        print(f"  Accessor Max: {max_v}")
        if min_v and max_v:
            dx = max_v[0] - min_v[0]
            dy = max_v[1] - min_v[1]
            dz = max_v[2] - min_v[2]
            print(f"  Dimensions: dx={dx:.4f}, dy={dy:.4f}, dz={dz:.4f}")

dump_mesh_verts(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\assets\characters\vietnamese_student.glb", 7, "vietnamese_student.glb Mesh 7 (Hair_Cap)")
dump_mesh_verts(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\assets\characters\vietnamese_student.glb", 8, "vietnamese_student.glb Mesh 8 (Hair_Bangs)")
dump_mesh_verts(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\test_variants\test_export_apply.glb", 7, "test_export_apply.glb Mesh 7 (Hair_Cap)")
dump_mesh_verts(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\test_variants\test_export_apply.glb", 8, "test_export_apply.glb Mesh 8 (Hair_Bangs)")
