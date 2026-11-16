
import bpy, json

report = {
    'objects': [],
    'materials': [m.name for m in bpy.data.materials],
    'actions': [a.name for a in bpy.data.actions],
    'collections': [c.name for c in bpy.data.collections]
}

for obj in bpy.data.objects:
    item = {
        'name': obj.name,
        'type': obj.type,
        'parent': obj.parent.name if obj.parent else None,
        'modifiers': [f'{m.name} ({m.type})' for m in obj.modifiers],
    }
    if obj.type == 'MESH' and obj.data:
        item['verts'] = len(obj.data.vertices)
        item['polys'] = len(obj.data.polygons)
        item['smooth'] = any(p.use_smooth for p in obj.data.polygons)
        item['vg_count'] = len(obj.vertex_groups)
        item['mats'] = [slot.material.name for slot in obj.material_slots if slot.material]
    report['objects'].append(item)

with open(r'C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\base_audit.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)
