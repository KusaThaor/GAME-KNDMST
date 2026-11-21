import re

with open(r'GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py', 'r', encoding='utf-8') as f:
    content = f.read()

with open(r'GAME-KNDMST\blender\character_prototype\factory\test_rebuild_bob_v17.py', 'r', encoding='utf-8') as f:
    v17_source = f.read()

catmull_code = """def catmull_rom_basis(p0, p1, p2, p3, t):
    t2 = t * t
    t3 = t2 * t
    return 0.5 * (
        (2.0 * p1) +
        (-p0 + p2) * t +
        (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
        (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
    )
"""

m = re.search(r'def build_bob_v17\(arm, char_id, mat_mode="production"\):.*?\n(?=def setup_chibi_portrait_studio)', v17_source, re.DOTALL)
if not m:
    print('Failed to extract build_bob_v17')
    exit(1)

v17_func = m.group(0).replace('def build_bob_v17(arm, char_id, mat_mode="production"):', 'def build_hair_003(arm, char_id, color_hex="#221714", mat_mode="production"):')
v17_func = v17_func.replace('catmull_rom(', 'catmull_rom_basis(')

replacement = catmull_code + '\n\n' + v17_func

pattern = r'def build_hair_003\(arm, char_id, color_hex="#221714", mat_mode="production"\):.*?\n(?=def build_hair_004)'
new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
print(f'Replacements made: {count}')

if count == 1:
    with open(r'GAME-KNDMST\blender\character_prototype\factory\hairstyle_library.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully updated hairstyle_library.py with V17 build_hair_003!')
else:
    print('Error: Pattern did not match exactly once.')
