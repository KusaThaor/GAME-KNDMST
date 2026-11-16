
import bpy
with open(r'C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scripts\actions_list.txt', 'w', encoding='utf-8') as f:
    for act in bpy.data.actions:
        fr = act.frame_range
        f.write(f'{act.name}|{fr[0]}|{fr[1]}\n')
