from PIL import Image

img = Image.open(r"C:\Users\Admin\.gemini\antigravity\brain\ce5fb559-46a0-4bd7-bc18-cdd305c60e60\.user_uploaded\media_1795005896274_fee69aab.png")
w, h = img.size
print(f"Image size: {w}x{h}")

# Find black pixels of left and right eyes
pixels = img.load()

# Let's crop just the eyes
# Left eye in image
box_l = (int(w * 0.08), int(h * 0.45), int(w * 0.30), int(h * 0.85))
crop_l = img.crop(box_l)
crop_l.save(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\user_ref_eye_l.png")

box_r = (int(w * 0.70), int(h * 0.45), int(w * 0.92), int(h * 0.85))
crop_r = img.crop(box_r)
crop_r.save(r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory\previews\user_ref_eye_r.png")

print("Cropped user eyes saved.")
