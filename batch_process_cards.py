import os
import glob
import re
from PIL import Image

def process_tarot_card(input_path, output_path):
    print(f"⏳ 변환 중: {os.path.basename(input_path)} -> {os.path.basename(output_path)}...")
    try:
        # 1. 원본 이미지
        img = Image.open(input_path).convert('RGB')
        
        # 2. 기존 프로젝트 카드 사이즈 (687 x 1024) 에 정확하게 맞춤
        target_card_w, target_card_h = 687, 1024
        
        # 3. 10px 검은색 테두리를 제외한 내부 그림 영역 크기
        border_size = 10
        inner_w = target_card_w - (border_size * 2) # 667
        inner_h = target_card_h - (border_size * 2) # 1004
        
        # 4. 좌우 여백 (letterbox) 없이 넘치는 부분만 살짝 자르는 center crop 방식
        img_ratio = img.width / img.height
        target_ratio = inner_w / inner_h
        
        if img_ratio > target_ratio:
            # 원본이 너무 가로로 길 때 -> 양옆을 자름
            new_w = int(img.height * target_ratio)
            left = (img.width - new_w) // 2
            img_cropped = img.crop((left, 0, left + new_w, img.height))
        else:
            # 원본이 너무 세로로 길 때 -> 위아래를 자름
            new_h = int(img.width / target_ratio)
            top = (img.height - new_h) // 2
            img_cropped = img.crop((0, top, img.width, top + new_h))
            
        # 5. 잘라낸 이미지를 정확한 내부 그림 영역 사이즈(667 x 1004)로 리사이징
        img_resized = img_cropped.resize((inner_w, inner_h), Image.Resampling.LANCZOS)
        
        # 6. 최종 687 x 1024 짜리 새까만 배경(테두리 역할)을 깔기
        final_card = Image.new('RGB', (target_card_w, target_card_h), color='black')
        
        # 7. 까만 배경 정중앙에 사진을 얹음 -> 정확히 10px 테두리가 됨!
        final_card.paste(img_resized, (border_size, border_size))
        
        # 8. 목표 폴더(public/cards)에 바로 저장! (.jpg 포맷)
        final_card.save(output_path, quality=95)
        print(f"✨ 완료: {os.path.basename(output_path)}")
        
    except Exception as e:
        print(f"❌ 오류 발생 ({os.path.basename(input_path)}): {e}")

def get_target_filename(raw_filename):
    # 정규식으로 번호를 추출 (예: card_0_the_fool -> 0 -> major_00.jpg)
    # 뒷면(card_back)은 back_00.png, back_01.png 로 덮어씀 (일단 back_00.jpg 로 하겠습니다)
    raw_lower = raw_filename.lower()
    
    if "back" in raw_lower:
        return "back_00.jpg" # 뒷면은 기존 포맷이 대부분 png일 수 있으나 jpg로 해도 됨
        
    match = re.search(r'card_(\d+)_', raw_lower)
    if match:
        num = int(match.group(1))
        return f"major_{num:02d}.jpg" # major_00.jpg, major_01.jpg 형태로 반환
        
    # sample_0 시리즈 매칭
    match2 = re.search(r'sample_(\d+)_', raw_lower)
    if match2:
        num = int(match2.group(1))
        return f"major_{num:02d}.jpg"
        
    return None

def batch_process():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.join(base_dir, 'public', 'cards', 'ai_raw')
    final_dir = os.path.join(base_dir, 'public', 'cards') # 기존 990taro 카드 폴더로 직접 때림!
    
    files_to_process = glob.glob(os.path.join(raw_dir, '*.[pP][nN][gG]'))
    
    # 처리할 카드가 최신 버전(숫자 겹칠경우 최신 타임스탬프)으로 덮어쓰도록 딕셔너리로 관리
    cards_map = {}
    for f in files_to_process:
        target_name = get_target_filename(os.path.basename(f))
        if target_name:
            # 타임스탬프 숫자가 파일명에 있다면 가장 큰 숫자가 최신임. 따라서 정렬을 위해
            cards_map[target_name] = f
            
    if not cards_map:
        print("📁 ai_raw 폴더에 변환할 이미지(card_0~ 형식)가 없습니다.")
        return

    print(f"🚀 총 {len(cards_map)}장의 카드를 687x1024 실전 규격으로 즉시 반영합니다...")
    
    for target_name, raw_file_path in cards_map.items():
        output_path = os.path.join(final_dir, target_name)
        process_tarot_card(raw_file_path, output_path)
        
    print("🎉 웹사이트 적용 완료! 이제 카드들이 원래 크기에 딱 맞습니다!")

if __name__ == "__main__":
    batch_process()
