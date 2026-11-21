import sys
import os
import traceback

sys.path.insert(0, r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory")

try:
    import test_triangle_geometry
    test_triangle_geometry.run_test()
    print("SUCCESS!")
except Exception as e:
    with open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\exact_err.txt", "w") as f:
        f.write(traceback.format_exc())
    print("FAILED:", e)
