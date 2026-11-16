import sys
import traceback

log_file = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\render_log.txt"

with open(log_file, "w", encoding="utf-8") as f:
    f.write("Starting render runner...\n")

try:
    factory_dir = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
    if factory_dir not in sys.path:
        sys.path.insert(0, factory_dir)

    import render_clothing_sheets
    render_clothing_sheets.render_all_assets()
    render_clothing_sheets.build_composite_sheets()

    with open(log_file, "a", encoding="utf-8") as f:
        f.write("Render completed successfully!\n")

except Exception as e:
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(traceback.format_exc())
