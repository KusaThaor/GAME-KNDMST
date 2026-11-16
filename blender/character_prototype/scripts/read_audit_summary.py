import json

with open(r'C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\audit_production_report.json', encoding='utf-8') as f:
    data = json.load(f)

print('Total meshes:', len(data['mesh_objects']))
print('Total base vertices:', data['total_vertices'])
print('Total base faces:', data['total_faces'])
print('Armature bones count:', data['armature']['bones_count'])
print('\nBones:', [b['name'] for b in data['armature']['bones']])
print(f"\nActions ({len(data['actions'])}):")
for a in data['actions']:
    dyn = 'DYNAMIC' if a['is_multi_frame_dynamic'] else 'STATIC POSE'
    print(f"  - {a['name']:<24} {dyn:<12} frames: {str(a['frame_range']):<12} dur: {a['duration_frames']:<3} fcurves: {a['fcurves_count']:<3} bones: {a['animated_bones_count']}")
