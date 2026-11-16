import json

with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\base_audit.json", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total objects: {len(data['objects'])}")
print("-" * 90)
print(f"{'OBJECT NAME':26} | {'VERTS':>6} | {'POLYS':>6} | {'SMOOTH':>6} | {'MODIFIERS'}")
print("-" * 90)
total_verts = 0
total_polys = 0
for o in data['objects']:
    if o['type'] == 'MESH':
        v = o.get('verts', 0)
        p = o.get('polys', 0)
        total_verts += v
        total_polys += p
        sm = str(o.get('smooth', False))
        mods = ", ".join(o['modifiers'])
        print(f"{o['name']:26} | {v:6} | {p:6} | {sm:>6} | {mods}")

print("-" * 90)
print(f"TOTAL MESH STATS: {total_verts} Vertices, {total_polys} Polygons")
