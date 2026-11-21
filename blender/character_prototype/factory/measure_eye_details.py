from PIL import Image

img = Image.open(r"C:\Users\Admin\.gemini\antigravity\brain\ce5fb559-46a0-4bd7-bc18-cdd305c60e60\.user_uploaded\media_1795005896274_fee69aab.png")
w, h = img.size

# Find dark pixels (R < 50, G < 50, B < 50)
left_dark = []
right_dark = []

for y in range(h):
    for x in range(w):
        r, g, b = img.getpixel((x, y))[:3]
        if r < 60 and g < 60 and b < 60:
            if y > 60: # below eyebrow
                if x < w // 2:
                    left_dark.append((x, y))
                else:
                    right_dark.append((x, y))

def bbox(pts):
    min_x = min(p[0] for p in pts)
    max_x = max(p[0] for p in pts)
    min_y = min(p[1] for p in pts)
    max_y = max(p[1] for p in pts)
    return min_x, min_y, max_x, max_y

bx1, by1, bx2, by2 = bbox(left_dark)
print(f"Left Eye: X=[{bx1}, {bx2}] (width={bx2-bx1}), Y=[{by1}, {by2}] (height={by2-by1}), aspect (h/w) = {(by2-by1)/(bx2-bx1):.2f}")

rx1, ry1, rx2, ry2 = bbox(right_dark)
print(f"Right Eye: X=[{rx1}, {rx2}] (width={rx2-rx1}), Y=[{ry2-ry1}] (height={ry2-ry1}), aspect (h/w) = {(ry2-ry1)/(rx2-rx1):.2f}")

# Eyebrows
left_eb = []
right_eb = []
for y in range(h):
    for x in range(w):
        r, g, b = img.getpixel((x, y))[:3]
        if r < 60 and g < 60 and b < 60:
            if y < 60:
                if x < w // 2:
                    left_eb.append((x, y))
                else:
                    right_eb.append((x, y))

eb_bx1, eb_by1, eb_bx2, eb_by2 = bbox(left_eb)
print(f"Left Brow: X=[{eb_bx1}, {eb_bx2}] (width={eb_bx2-eb_bx1})")
