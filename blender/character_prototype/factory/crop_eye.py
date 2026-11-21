from PIL import Image

img = Image.open(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\eye_diag\front_closeup.png")
w, h = img.size

# Crop eye region (around center, slightly above middle)
# Character eye level is around middle of image
box = (int(w * 0.15), int(h * 0.30), int(w * 0.85), int(h * 0.65))
cropped = img.crop(box)
cropped.save(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\eye_diag\eye_closeup_crop.png")
print("Cropped eye region saved.")
