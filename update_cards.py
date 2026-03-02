import os
from PIL import Image

def safe_convert_to_tarot(input_path, output_path):
    img = Image.open(input_path).convert('RGB')
    target_inner_w, target_inner_h = 1004, 1516
    img.thumbnail((target_inner_w, target_inner_h), Image.Resampling.LANCZOS)
    inner_canvas = Image.new('RGB', (target_inner_w, target_inner_h), color=(15, 15, 15))
    paste_x = (target_inner_w - img.width) // 2
    paste_y = (target_inner_h - img.height) // 2
    inner_canvas.paste(img, (paste_x, paste_y))
    final_card = Image.new('RGB', (1024, 1536), color='black')
    final_card.paste(inner_canvas, (10, 10))
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_card.save(output_path, quality=100)
    print(f"✨ 완료: {os.path.basename(output_path)}")

brain_dir = r"C:\Users\EKR\.gemini\antigravity\brain\abc9e5e5-fcb4-47e6-98f6-56d8f448de36"
target_dir = r"C:\Users\EKR\Desktop\990taro\public\cards"

files = [
    ("card_0_the_fool_1772167736078.png", "major_00.jpg"),
    ("card_1_the_magician_1772167749144.png", "major_01.jpg"),
    ("card_2_high_priestess_1772168172853.png", "major_02.jpg")
]

for src, dst in files:
    src_path = os.path.join(brain_dir, src)
    dst_path = os.path.join(target_dir, dst)
    if os.path.exists(src_path):
        safe_convert_to_tarot(src_path, dst_path)
    else:
        print("Not found:", src_path)
